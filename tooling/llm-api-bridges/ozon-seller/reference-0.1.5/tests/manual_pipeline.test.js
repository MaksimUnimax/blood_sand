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

function createWorkerHarness() {
  const store = {};
  let listener = null;
  let fetchCount = 0;
  let fetchMode = 'ok';
  let currentIdentity = { origin: ORIGIN, conversation_id: CONVERSATION_ID, status: 'confirmed', source: 'path', chat_path: `/c/${CONVERSATION_ID}` };
  global.crypto = webcrypto;
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  global.fetch = async () => {
    fetchCount += 1;
    if (fetchMode === 'throw') throw new Error('socket exploded');
    if (fetchMode === 'http400') return { status: 400, ok: false, headers: { get: () => null }, text: async () => JSON.stringify({ code: 3, message: 'bad provider' }) };
    return { status: 200, ok: true, headers: { get: () => null }, text: async () => JSON.stringify({ roles: [] }) };
  };
  global.importScripts = (...scripts) => { for (const rel of scripts) vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: path.join(ROOT, rel) }); };
  function getImpl(keys) {
    if (keys === null || keys === undefined) return clone(store);
    if (typeof keys === 'string') return { [keys]: clone(store[keys]) };
    if (Array.isArray(keys)) return Object.fromEntries(keys.map(k => [k, clone(store[k])]));
    if (typeof keys === 'object') return Object.fromEntries(Object.entries(keys).map(([k,d]) => [k, store[k] === undefined ? d : clone(store[k])]));
    return {};
  }
  global.chrome = {
    runtime: { id: 'test-extension', lastError: null, onMessage: { addListener(fn) { listener = fn; } } },
    storage: { local: { async get(keys) { return getImpl(keys); }, async set(values) { for (const [k,v] of Object.entries(values)) store[k] = clone(v); }, async remove(keys) { for (const k of (Array.isArray(keys) ? keys : [keys])) delete store[k]; } } },
    tabs: {
      async get(id) { return id === TAB_ID ? { id: TAB_ID, url: `${ORIGIN}/c/${CONVERSATION_ID}` } : null; },
      async query() { return [{ id: TAB_ID, url: `${ORIGIN}/c/${CONVERSATION_ID}` }]; },
      sendMessage(id, message, callback) {
        if (message.type === 'OZ_GET_IDENTITY') callback({ ok: true, identity: clone(currentIdentity) });
        else callback({ ok: true });
      }
    }
  };
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'service_worker.js'), 'utf8'), { filename: path.join(ROOT, 'service_worker.js') });
  const KEYS = global.OzonRuntime.STORAGE_KEYS;
  const binding = { binding_id: 'binding-1', revision: 1, origin: ORIGIN, conversation_id: CONVERSATION_ID, conversation_key: KEY, bound_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  function reset() {
    store[KEYS.CONVERSATION_BINDINGS] = { [KEY]: binding };
    store[KEYS.MANUAL_MODES] = { [KEY]: true };
    store[KEYS.MANUAL_OPERATIONS] = {};
    store[KEYS.AUTO_RUNS] = {};
    store[KEYS.REPORT_PREFIXES] = {};
    store[KEYS.DIAGNOSTICS] = [];
    store[KEYS.DIAGNOSTIC_SEQ] = 0;
    store[KEYS.SELLER_CLIENT_ID] = '12345';
    store[KEYS.SELLER_API_KEY] = 'secret-test-key';
    store[KEYS.AUTO_SEND] = true;
    fetchCount = 0;
    fetchMode = 'ok';
    currentIdentity = { origin: ORIGIN, conversation_id: CONVERSATION_ID, status: 'confirmed', source: 'path', chat_path: `/c/${CONVERSATION_ID}` };
  }
  reset();
  function send(message, tabId = TAB_ID) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const returned = listener(message, { tab: { id: tabId } }, response => { settled = true; resolve(response); });
      if (returned !== true && !settled) reject(new Error('listener did not keep async response alive'));
    });
  }
  return { store, KEYS, reset, send, get fetchCount() { return fetchCount; }, setFetchMode(v) { fetchMode = v; }, setIdentity(v) { currentIdentity = v; } };
}

let h;
test.before(() => { h = createWorkerHarness(); });
test.beforeEach(() => h.reset());

function parseEnvelope(report) {
  assert.match(report, /^OZON_RESULT_V1\n/);
  return JSON.parse(report.slice('OZON_RESULT_V1\n'.length));
}

const malformed = 'OZON_API_V1 {"operation":"posting_fbo_\nlist","params":{}}';

test('manual malformed JSON enters existing OZ_EXECUTE_COMMAND path, returns chat report, fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm1', command_text: malformed });
  assert.equal(r.pre_execution_error, true);
  assert.equal(r.external_request_executed, false);
  assert.equal(r.http_status, 0);
  assert.equal(h.fetchCount, 0);
  const env = parseEnvelope(r.report_text);
  assert.equal(env.result.error.code, 'INVALID_JSON');
  assert.equal(env.request_meta.external_request_executed, false);
  assert.equal(env.command.accepted, false);
  const op = h.store[h.KEYS.MANUAL_OPERATIONS][KEY];
  assert.equal(op.status, 'delivering');
  assert.equal(op.operation, null);
  assert.equal(op.last_error.external_request_executed, false);
});

test('unsupported manual operation is a pre-execution chat result with fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm2', command_text: 'OZON_API_V1 {"operation":"delete_everything","params":{}}' });
  assert.equal(h.fetchCount, 0);
  assert.equal(r.pre_execution_error, true);
  assert.equal(parseEnvelope(r.report_text).result.error.code, 'UNSUPPORTED_OPERATION');
});

test('unknown top-level field is returned to chat with fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm3', command_text: 'OZON_API_V1 {"operation":"roles","params":{},"url":"https://evil.invalid"}' });
  assert.equal(h.fetchCount, 0);
  assert.equal(r.pre_execution_error, true);
  assert.equal(parseEnvelope(r.report_text).result.error.code, 'UNKNOWN_TOP_LEVEL_FIELD');
  assert.equal(r.report_text.includes('evil.invalid'), false);
});

test('manual mode race-off becomes chat error with fetch=0 rather than toast-only worker rejection', async () => {
  h.store[h.KEYS.MANUAL_MODES] = {};
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm4', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(h.fetchCount, 0);
  assert.equal(r.pre_execution_error, true);
  const env = parseEnvelope(r.report_text);
  assert.equal(env.result.error.code, 'MANUAL_MODE_OFF');
  assert.equal(env.request_meta.stage, 'manual_gate');
});

test('active autorun gate becomes manual chat error with fetch=0', async () => {
  h.store[h.KEYS.AUTO_RUNS] = { [KEY]: { run_id: 'run-x', conversation_key: KEY, conversation_id: CONVERSATION_ID, origin: ORIGIN, tab_id: TAB_ID, status: 'waiting_command' } };
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm5', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(h.fetchCount, 0);
  assert.equal(r.pre_execution_error, true);
  assert.equal(parseEnvelope(r.report_text).result.error.code, 'AUTO_MODE_ACTIVE');
});

test('valid manual command performs exactly one provider fetch', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm6', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(h.fetchCount, 1);
  assert.equal(r.ok, true);
  assert.equal(r.http_status, 200);
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].status, 'delivering');
});

test('provider HTTP 400 remains one fetch and is delivered as OZON_RESULT_V1 provider error', async () => {
  h.setFetchMode('http400');
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm7', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(h.fetchCount, 1);
  assert.equal(r.ok, false);
  assert.equal(r.http_status, 400);
  const env = parseEnvelope(r.report_text);
  assert.equal(env.http_status, 400);
  assert.equal(env.result.error.code, '3');
});

test('provider transport exception becomes bridge error report with exactly one fetch and no retry', async () => {
  h.setFetchMode('throw');
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm8', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(h.fetchCount, 1);
  assert.equal(r.bridge_error, true);
  const env = parseEnvelope(r.report_text);
  assert.equal(env.result.error.code, 'PROVIDER_FETCH_FAILED');
  assert.equal(env.result.error.automatic_retry, false);
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].status, 'delivering');
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].last_error.external_request_executed, true);
});

test('manual pre-execution result respects auto_send=false', async () => {
  h.store[h.KEYS.AUTO_SEND] = false;
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm9', command_text: malformed });
  assert.equal(r.auto_send, false);
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].auto_send, false);
  assert.equal(h.fetchCount, 0);
});

test('manual execution-error result respects auto_send=false', async () => {
  h.store[h.KEYS.AUTO_SEND] = false;
  h.setFetchMode('throw');
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm10', command_text: 'OZON_API_V1 {"operation":"roles","params":{}}' });
  assert.equal(r.auto_send, false);
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].auto_send, false);
  assert.equal(h.fetchCount, 1);
});

test('configured report prefix applies to manual pre-execution result', async () => {
  h.store[h.KEYS.REPORT_PREFIXES] = { [KEY]: { enabled: true, text: 'PREFIX!', interval: 1, delivered_count: 0, last_applied_at_count: 0 } };
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm11', command_text: malformed });
  assert.equal(r.report_prefix_applied, true);
  assert.match(r.outgoing_text, /^PREFIX!/);
  assert.equal(h.fetchCount, 0);
});

test('manual pre-execution delivery completion transitions to completed with fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm12', command_text: malformed });
  const done = await h.send({ type: 'OZ_MANUAL_DELIVERY_COMPLETE', conversation_key: KEY, manual_operation_id: r.manual_operation_id, delivery_confirmed: true, confirmed_user_turn_id: 'u1', composer_empty: true, click_attempts: 1 });
  assert.equal(done.ok, true);
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].status, 'completed');
  assert.equal(h.fetchCount, 0);
});

test('manual pre-execution delivery failure transitions to failed with fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm13', command_text: malformed });
  const done = await h.send({ type: 'OZ_MANUAL_DELIVERY_FAILED', conversation_key: KEY, manual_operation_id: r.manual_operation_id, code: 'COMPOSER_FAILED', error: 'composer failed' });
  assert.equal(done.ok, true);
  assert.equal(h.store[h.KEYS.MANUAL_OPERATIONS][KEY].status, 'failed');
  assert.equal(h.fetchCount, 0);
});

test('duplicate manual request id cannot create a second pre-execution delivery or fetch', async () => {
  await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'dup', command_text: malformed });
  const second = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'dup', command_text: malformed });
  assert.equal(second.ok, false);
  assert.equal(second.code, 'MANUAL_REQUEST_DUPLICATE');
  assert.equal(h.fetchCount, 0);
});

test('another active manual operation blocks new pre-execution delivery without fetch', async () => {
  await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'active1', command_text: malformed });
  const second = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'active2', command_text: malformed });
  assert.equal(second.ok, false);
  assert.equal(second.code, 'MANUAL_OPERATION_ACTIVE');
  assert.equal(h.fetchCount, 0);
});

test('conversation mismatch remains fail-closed security boundary with fetch=0', async () => {
  h.setIdentity({ origin: ORIGIN, conversation_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', status: 'confirmed', source: 'path', chat_path: '/c/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' });
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm14', command_text: malformed });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'CONVERSATION_MISMATCH');
  assert.equal(h.fetchCount, 0);
});

test('missing/incorrect sender tab remains fail-closed security boundary with fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm15', command_text: malformed }, 8);
  assert.equal(r.ok, false);
  assert.equal(h.fetchCount, 0);
});

test('missing sender tab is rejected before parse/provider and fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: 'm16', command_text: malformed }, 0);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'MANUAL_SENDER_TAB_MISSING');
  assert.equal(h.fetchCount, 0);
});

test('missing manual request id is rejected before parse/provider and fetch=0', async () => {
  const r = await h.send({ type: 'OZ_EXECUTE_COMMAND', conversation_key: KEY, manual_request_id: '', command_text: malformed });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'MANUAL_REQUEST_ID_MISSING');
  assert.equal(h.fetchCount, 0);
});
