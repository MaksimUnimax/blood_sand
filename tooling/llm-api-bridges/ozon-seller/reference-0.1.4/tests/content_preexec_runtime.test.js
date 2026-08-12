const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../ozon-bridge-v0.1.4-extension');
const source = fs.readFileSync(path.join(ROOT, 'content_script.js'), 'utf8');

function extractFunction(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `missing start marker ${startMarker}`);
  assert.ok(end > start, `missing end marker ${endMarker}`);
  return source.slice(start, end);
}

function makeHarness(workerResponse, { watch = true } = {}) {
  const calls = { runtime: [], diagnostics: [], toast: [], stop: [] };
  const helper = extractFunction('  async function reportAutoPreExecutionError', '  function scheduleAutoTick');
  const context = {
    activeAutoWatch: watch ? { run_id: 'run-1', conversation_key: 'https://chatgpt.com|cid', watch_id: 'watch-1' } : null,
    OzonContract: { textFingerprint(value) { calls.fingerprintSource = String(value); return 'deadbeef'; } },
    recordContentDiagnostic(type, details) { calls.diagnostics.push({ type, details }); },
    async sendRuntime(type, payload) { calls.runtime.push({ type, payload }); return structuredClone(workerResponse); },
    toast(...args) { calls.toast.push(args); },
    stopAutoWatch(reason) { calls.stop.push(reason); },
    structuredClone,
  };
  vm.createContext(context);
  vm.runInContext(`${helper}\nthis.reportAutoPreExecutionError = reportAutoPreExecutionError;`, context, { filename: path.join(ROOT, 'content_script.js') });
  return { fn: context.reportAutoPreExecutionError, calls };
}

test('actual content helper: malformed parse error sends safe worker message and no raw command text', async () => {
  const h = makeHarness({ accepted: true });
  const badCommand = 'OZON_API_V1 {"operation":"roles","params":{"x":"bad\ncontrol"}}';
  const error = Object.assign(new Error('Некорректный JSON'), { code: 'INVALID_JSON' });
  const response = await h.fn(error, { stage: 'command_parse', assistantTurnId: 'assistant-1', commandText: badCommand });
  assert.equal(response.accepted, true);
  assert.equal(h.calls.runtime.length, 1);
  assert.equal(h.calls.runtime[0].type, 'OZ_AUTO_PREEXEC_ERROR');
  assert.deepEqual(Object.keys(h.calls.runtime[0].payload).sort(), [
    'assistant_turn_id', 'command_fingerprint', 'conversation_key', 'error_code', 'error_message', 'error_stage', 'run_id', 'watch_id'
  ]);
  assert.equal(h.calls.runtime[0].payload.error_code, 'INVALID_JSON');
  assert.equal(h.calls.runtime[0].payload.command_fingerprint, 'deadbeef');
  assert.equal(JSON.stringify(h.calls.runtime[0].payload).includes(badCommand), false);
  assert.deepEqual(h.calls.stop, ['preexec_error_accepted']);
  assert.equal(h.calls.toast.length, 1);
});

test('actual content helper: inactive watch fails closed before runtime call', async () => {
  const h = makeHarness({ accepted: true }, { watch: false });
  const response = await h.fn(new Error('x'));
  assert.equal(response.ok, false);
  assert.equal(response.accepted, false);
  assert.equal(response.code, 'AUTO_WATCH_NOT_ACTIVE');
  assert.equal(h.calls.runtime.length, 0);
  assert.equal(h.calls.stop.length, 0);
});

test('actual content helper: duplicate/ignored worker ownership stops local watch without extra handling', async () => {
  const h = makeHarness({ accepted: false, ignored: true });
  const response = await h.fn(Object.assign(new Error('bad'), { code: 'INVALID_JSON' }), { assistantTurnId: 'a' });
  assert.equal(response.ignored, true);
  assert.deepEqual(h.calls.stop, ['preexec_error_already_owned']);
  assert.equal(h.calls.toast.length, 0);
});

test('actual content helper: paused worker state stops local watch safely', async () => {
  const h = makeHarness({ accepted: false, paused: true });
  const response = await h.fn(new Error('bad'));
  assert.equal(response.paused, true);
  assert.deepEqual(h.calls.stop, ['worker_paused']);
  assert.equal(h.calls.toast.length, 0);
});

test('actual content helper: explicit worker rejection remains visible locally and stops watch', async () => {
  const h = makeHarness({ accepted: false, code: 'CONVERSATION_MISMATCH', error: 'mismatch' });
  const response = await h.fn(new Error('bad'));
  assert.equal(response.accepted, false);
  assert.deepEqual(h.calls.stop, ['preexec_error_rejected']);
  assert.equal(h.calls.toast.length, 1);
  assert.match(String(h.calls.toast[0][0]), /mismatch/);
});

test('actual content helper: watcher runtime failure uses stage/code/message fingerprint source', async () => {
  const h = makeHarness({ accepted: true });
  const error = Object.assign(new Error('watch exploded'), { code: 'WATCH_FAIL' });
  await h.fn(error, { stage: 'watcher_runtime', assistantTurnId: '' });
  assert.equal(h.calls.runtime[0].payload.error_stage, 'watcher_runtime');
  assert.equal(h.calls.runtime[0].payload.error_code, 'WATCH_FAIL');
  assert.equal(h.calls.runtime[0].payload.error_message, 'watch exploded');
  assert.match(h.calls.fingerprintSource, /^watcher_runtime\|\|WATCH_FAIL\|watch exploded$/);
});
