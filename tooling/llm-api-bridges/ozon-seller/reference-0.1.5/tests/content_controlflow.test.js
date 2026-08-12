const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../ozon-bridge-v0.1.5-extension');
const source = fs.readFileSync(path.join(ROOT, 'content_script.js'), 'utf8');

function sliceBetween(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0, `missing start marker ${start}`);
  assert.ok(b > a, `missing end marker ${end}`);
  return source.slice(a, b);
}

test('invalid-command catch routes to worker-owned pre-execution delivery instead of toast-only stop', () => {
  const block = sliceBetween('      let parsed;\n      try { parsed = OzonContract.parseCommand(localPayload.text); }', '      recordContentDiagnostic("PROMPT_ACCEPTED"');
  assert.match(block, /await reportAutoPreExecutionError\(error/);
  assert.match(block, /stage: "command_parse"/);
  assert.match(block, /assistantTurnId: candidate\.assistant_turn_id/);
  assert.match(block, /commandText: localPayload\.text/);
  assert.doesNotMatch(block, /stopAutoWatch\("invalid_command"\)/);
  assert.doesNotMatch(block, /OZ_AUTO_COMMAND_READY/);
});

test('pre-execution helper sends only safe metadata, never raw command text', () => {
  const block = sliceBetween('  async function reportAutoPreExecutionError', '  function scheduleAutoTick');
  assert.match(block, /sendRuntime\("OZ_AUTO_PREEXEC_ERROR"/);
  assert.match(block, /error_stage: stage/);
  assert.match(block, /error_code: code/);
  assert.match(block, /error_message: message/);
  assert.match(block, /command_fingerprint: commandFingerprint/);
  const payload = block.slice(block.indexOf('sendRuntime("OZ_AUTO_PREEXEC_ERROR"'));
  assert.doesNotMatch(payload, /command_text\s*:/);
  assert.doesNotMatch(payload, /commandText\s*:/);
  assert.match(block, /внешний Ozon API request не выполнялся/);
});

test('unexpected watcher runtime failures also use pre-execution chat delivery path', () => {
  const block = sliceBetween('  function scheduleAutoTick', '  function candidateAfterAssistantBaseline');
  assert.match(block, /reportAutoPreExecutionError\(error, \{ stage: "watcher_runtime" \}\)/);
  assert.match(block, /tick_error_delivery_failed/);
});
