const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const ROOT = path.resolve(__dirname, '../ozon-bridge-v0.1.5-extension');
const CONVERSATION_ID = '11111111-2222-4333-8444-555555555555';
const ORIGIN = 'https://chatgpt.com';
const KEY = `${ORIGIN}|${CONVERSATION_ID}`;
const TAB_ID = 7;

function clone(v) { return v === undefined ? undefined : structuredClone(v); }

function createHarness() {
  const store = {};
  const pushes = [];
  let listener = null;
  let fetchCount = 0;
  let currentIdentity = { origin: ORIGIN, conversation_id: CONVERSATION_ID, status: 'confirmed', source: 'path', chat_path: `/c/${CONVERSATION_ID}` };

  global.crypto = webcrypto;
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  global.fetch = async () => {
    fetchCount += 1;
    return {
      status: 200,
      ok: true,
      headers: { get: () => null },
      text: async () => JSON.stringify({ roles: [] })
    };
  };
  global.importScripts = (...scripts) => {
    for (const rel of scripts) {
      vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: path.join(ROOT, rel) });
    }
  };
  function getImpl(keys) {
    if (keys === null || keys === undefined) return clone(store);
    if (typeof keys === 'string') return { [keys]: clone(store[keys]) };
    if (Array.isArray(keys)) return Object.fromEntries(keys.map(k => [k, clone(store[k])]));
    if (typeof keys === 'object') {
      const out = {};
      for (const [k, def] of Object.entries(keys)) out[k] = store[k] === undefined ? def : clone(store[k]);
      return out;
    }
    return {};
  }
  global.chrome = {
    runtime: {
      id: 'test-extension',
      lastError: null,
      onMessage: { addListener(fn) { listener = fn; } }
    },
    storage: {
      local: {
        async get(keys) { return getImpl(keys); },
        async set(values) { for (const [k, v] of Object.entries(values)) store[k] = clone(v); },
        async remove(keys) { for (const k of (Array.isArray(keys) ? keys : [keys])) delete store[k]; }
      }
    },
    tabs: {
      async get(id) { return id === TAB_ID ? { id: TAB_ID, url: `${ORIGIN}/c/${CONVERSATION_ID}` } : null; },
      async query() { return [{ id: TAB_ID, url: `${ORIGIN}/c/${CONVERSATION_ID}` }]; },
      sendMessage(id, message, callback) {
        let response;
        if (message.type === 'OZ_GET_IDENTITY') response = { ok: true, identity: clone(currentIdentity) };
        else if (message.type === 'OZ_AUTO_DELIVERY_AVAILABLE') { pushes.push(clone(message)); response = { ok: true }; }
        else if (message.type === 'OZ_AUTO_BEGIN_WATCH') { pushes.push(clone(message)); response = { ok: true, started: true }; }
        else if (message.type === 'OZ_AUTO_STOP_WATCH') { pushes.push(clone(message)); response = { ok: true }; }
        else response = { ok: true };
        callback(response);
      }
    }
  };

  vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'service_worker.js'), 'utf8'), { filename: path.join(ROOT, 'service_worker.js') });
  assert.equal(typeof listener, 'function');
  const KEYS = global.OzonRuntime.STORAGE_KEYS;
  const binding = {
    binding_id: 'binding-1', revision: 1, origin: ORIGIN, conversation_id: CONVERSATION_ID,
    conversation_key: KEY, bound_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
  store[KEYS.CONVERSATION_BINDINGS] = { [KEY]: binding };
  store[KEYS.MANUAL_MODES] = {};
  store[KEYS.REPORT_PREFIXES] = {};
  store[KEYS.DIAGNOSTICS] = [];
  store[KEYS.DIAGNOSTIC_SEQ] = 0;
  store[KEYS.SELLER_CLIENT_ID] = '12345';
  store[KEYS.SELLER_API_KEY] = 'test-api-key-value';

  function resetRun(overrides = {}) {
    store[KEYS.MANUAL_MODES] = {};
    store[KEYS.AUTO_RUNS] = {
      [KEY]: {
        run_id: 'run-1', conversation_key: KEY, origin: ORIGIN, conversation_id: CONVERSATION_ID,
        binding_snapshot: { binding_id: 'binding-1', binding_revision: 1, origin: ORIGIN, conversation_id: CONVERSATION_ID, conversation_key: KEY },
        tab_id: TAB_ID, status: 'waiting_command', sequence: 0, watch_id: 'watch-1', assistant_baseline_ids: [],
        pause_requested: false, finish_requested: false, last_assistant_turn_id: null, last_command_fingerprint: null,
        ...overrides
      }
    };
    pushes.length = 0;
    fetchCount = 0;
  }
  resetRun();

  function send(message, tabId = TAB_ID) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const returned = listener(message, { tab: { id: tabId } }, (response) => { settled = true; resolve(response); });
      if (returned !== true && !settled) reject(new Error('listener did not keep async response alive'));
    });
  }
  async function tick() { await new Promise(r => setTimeout(r, 10)); }
  return {
    store, KEYS, pushes, send, tick, resetRun,
    get fetchCount() { return fetchCount; },
    setIdentity(v) { currentIdentity = v; }
  };
}

let h;
test.before(() => { h = createHarness(); });

test.beforeEach(() => { h.resetRun(); });

test('pre-execution parse error is claimed for chat delivery with zero Ozon HTTP requests', async () => {
  const response = await h.send({
    type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, watch_id: 'watch-1',
    assistant_turn_id: 'assistant-bad-1', error_stage: 'command_parse', error_code: 'INVALID_JSON',
    error_message: 'Некорректный JSON: Bad control character at position 27', command_fingerprint: 'deadbeef'
  });
  assert.equal(response.accepted, true);
  assert.equal(response.pre_execution_error, true);
  assert.equal(response.external_request_executed, false);
  assert.equal(response.http_status, 0);
  assert.equal(h.fetchCount, 0);
  assert.match(response.report_text, /^OZON_RESULT_V1\n/);
  const env = JSON.parse(response.report_text.slice('OZON_RESULT_V1\n'.length));
  assert.equal(env.result.error.code, 'INVALID_JSON');
  assert.equal(env.request_meta.external_request_executed, false);
  const run = h.store[h.KEYS.AUTO_RUNS][KEY];
  assert.equal(run.status, 'delivering');
  assert.equal(run.last_error.code, 'INVALID_JSON');
  assert.equal(run.last_error.external_request_executed, false);
  await h.tick();
  assert.equal(h.pushes.filter(x => x.type === 'OZ_AUTO_DELIVERY_AVAILABLE').length, 1);
});

test('duplicate same pre-execution error cannot create second delivery or request', async () => {
  const msg = { type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'assistant-bad-1', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'cafebabe' };
  const first = await h.send(msg);
  const second = await h.send(msg);
  assert.equal(first.accepted, true);
  assert.equal(second.accepted, false);
  assert.equal(second.ignored, true);
  assert.equal(h.fetchCount, 0);
  await h.tick();
  assert.equal(h.pushes.filter(x => x.type === 'OZ_AUTO_DELIVERY_AVAILABLE').length, 1);
});

test('delivery commit/confirmation returns run to WAITING_COMMAND and still performs zero provider requests', async () => {
  const first = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a1', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'a1b2c3d4' });
  const commit = await h.send({ type: 'OZ_AUTO_DELIVERY_COMMIT_REQUEST', conversation_key: KEY, run_id: 'run-1', delivery_id: first.delivery_id, actor_id: 'actor-1', baseline_user_turn_ids: [] });
  assert.equal(commit.click_allowed, true);
  const done = await h.send({ type: 'OZ_AUTO_DELIVERY_COMPLETE', conversation_key: KEY, run_id: 'run-1', delivery_id: first.delivery_id, delivery_confirmed: true, composer_empty: true, click_attempts: 1, confirmed_user_turn_id: 'user-error-result', assistant_baseline_ids: ['a1'] });
  assert.equal(done.run.status, 'waiting_command');
  assert.equal(done.run.sequence, 1);
  assert.equal(h.fetchCount, 0);
  await h.tick();
  assert.ok(h.pushes.some(x => x.type === 'OZ_AUTO_BEGIN_WATCH'));
  const duplicateAfterDone = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a1', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'a1b2c3d4' });
  assert.equal(duplicateAfterDone.ignored, true);
  assert.equal(h.fetchCount, 0);
});

test('worker parser fallback converts malformed OZ_AUTO_COMMAND_READY into chat error without fetch', async () => {
  const malformed = 'OZON_API_V1 {"operation":"roles","params":{"x":"bad\ncontrol"}}';
  const response = await h.send({ type: 'OZ_AUTO_COMMAND_READY', run_id: 'run-1', conversation_key: KEY, watch_id: 'watch-1', assistant_turn_id: 'a2', command_text: malformed, command_fingerprint: 'ignored' });
  assert.equal(response.accepted, true);
  assert.equal(response.pre_execution_error, true);
  assert.equal(response.external_request_executed, false);
  assert.equal(h.fetchCount, 0);
  const env = JSON.parse(response.report_text.slice('OZON_RESULT_V1\n'.length));
  assert.equal(env.result.error.code, 'INVALID_JSON');
});

test('wrong tab is rejected before delivery and request', async () => {
  const response = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'deadbeef' }, 8);
  assert.equal(response.accepted, false);
  assert.equal(response.code, 'AUTO_NON_OWNER_TAB');
  assert.equal(h.fetchCount, 0);
  assert.equal(h.store[h.KEYS.AUTO_RUNS][KEY].status, 'waiting_command');
});

test('manual mode blocks autorun error delivery safely', async () => {
  h.store[h.KEYS.MANUAL_MODES] = { [KEY]: true };
  const response = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'deadbeef' });
  assert.equal(response.paused, true);
  assert.equal(response.code, 'MANUAL_MODE_ACTIVE');
  assert.equal(h.fetchCount, 0);
});

test('valid command path remains exactly one provider HTTP request', async () => {
  const response = await h.send({ type: 'OZ_AUTO_COMMAND_READY', run_id: 'run-1', conversation_key: KEY, watch_id: 'watch-1', assistant_turn_id: 'valid-1', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(response.accepted, true);
  assert.equal(h.fetchCount, 1);
  assert.equal(response.http_status, 200);
  assert.match(response.report_text, /^OZON_RESULT_V1\n/);
});

test('missing run is rejected with zero requests', async () => {
  h.store[h.KEYS.AUTO_RUNS] = {};
  const response = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'missing', conversation_key: KEY, error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'deadbeef' });
  assert.equal(response.code, 'AUTO_RUN_NOT_FOUND');
  assert.equal(response.accepted, false);
  assert.equal(h.fetchCount, 0);
});

test('conversation identity mismatch is rejected fail-closed with zero requests', async () => {
  h.setIdentity({ origin: ORIGIN, conversation_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', status: 'confirmed', source: 'path', chat_path: '/c/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' });
  const response = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'deadbeef' });
  assert.equal(response.accepted, false);
  assert.equal(response.code, 'CONVERSATION_MISMATCH');
  assert.equal(h.fetchCount, 0);
  h.setIdentity({ origin: ORIGIN, conversation_id: CONVERSATION_ID, status: 'confirmed', source: 'path', chat_path: `/c/${CONVERSATION_ID}` });
});

test('invalid supplied fingerprint is replaced by safe deterministic fingerprint', async () => {
  const response = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a', error_stage: 'watcher_runtime', error_code: 'WATCH_FAIL', error_message: 'boom', command_fingerprint: 'NOT SAFE' });
  assert.equal(response.accepted, true);
  assert.match(response.command_fingerprint, /^[0-9a-f]{8}$/);
  assert.notEqual(response.command_fingerprint, '00000000');
  assert.equal(h.fetchCount, 0);
});

test('configured report prefix is applied to pre-execution error delivery', async () => {
  h.store[h.KEYS.REPORT_PREFIXES] = { [KEY]: { enabled: true, text: 'PREFIX', interval: 1, delivered_count: 0, last_applied_at_count: 0 } };
  const response = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'a', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: 'deadbeef' });
  assert.equal(response.accepted, true);
  assert.equal(response.report_prefix_applied, true);
  assert.match(response.outgoing_text, /^PREFIX\n\nOZON_RESULT_V1\n/);
  assert.equal(h.fetchCount, 0);
});

test('persisted claimed pre-execution delivery recovers through worker delivery cycle without provider replay', async () => {
  const first = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'recover-a', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: '11223344' });
  assert.equal(first.accepted, true);
  await h.tick();
  h.pushes.length = 0;
  const ready = await h.send({ type: 'OZ_CONTENT_READY', identity: { origin: ORIGIN, conversation_id: CONVERSATION_ID, status: 'confirmed', source: 'path', chat_path: `/c/${CONVERSATION_ID}` } });
  assert.equal(ready.ok, true);
  await h.tick();
  assert.ok(h.pushes.some(x => x.type === 'OZ_AUTO_DELIVERY_AVAILABLE'));
  assert.equal(h.fetchCount, 0);
});

test('finish requested during pre-execution delivery stops after confirmed chat delivery without provider request', async () => {
  const first = await h.send({ type: 'OZ_AUTO_PREEXEC_ERROR', run_id: 'run-1', conversation_key: KEY, assistant_turn_id: 'finish-a', error_stage: 'command_parse', error_code: 'INVALID_JSON', error_message: 'bad', command_fingerprint: '55667788' });
  h.store[h.KEYS.AUTO_RUNS][KEY].finish_requested = true;
  await h.send({ type: 'OZ_AUTO_DELIVERY_COMMIT_REQUEST', conversation_key: KEY, run_id: 'run-1', delivery_id: first.delivery_id, actor_id: 'actor', baseline_user_turn_ids: [] });
  const done = await h.send({ type: 'OZ_AUTO_DELIVERY_COMPLETE', conversation_key: KEY, run_id: 'run-1', delivery_id: first.delivery_id, delivery_confirmed: true, composer_empty: true, click_attempts: 1, confirmed_user_turn_id: 'u', assistant_baseline_ids: [] });
  assert.equal(done.run.status, 'stopped');
  assert.equal(h.fetchCount, 0);
});
