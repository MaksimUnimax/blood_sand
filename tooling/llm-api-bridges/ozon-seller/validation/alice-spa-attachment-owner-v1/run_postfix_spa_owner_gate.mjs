import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(process.argv[2] || '.');
const root = path.join(repoRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const workerPath = path.join(root, 'shared/file_delivery_port_worker.js');
const identityPath = path.join(root, 'shared/conversation_identity.js');
const contentPath = path.join(root, 'attachment_delivery_port_content.js');
const CHAT_A = '11111111-1111-4111-8111-111111111111';
const CHAT_B = '22222222-2222-4222-8222-222222222222';
const ORIGIN = 'https://alice.yandex.ru';
const KEY = `${ORIGIN}|${CHAT_A}`;
const OWNER_ID = 'manual-op-spa-owner-postfix';
const DELIVERY_ID = 'delivery-spa-owner-postfix';
function assert(condition, message) { if (!condition) throw new Error(message); }

const storageState = {
  ozmb_manual_modes: { [KEY]: true },
  ozmb_manual_operations: { [KEY]: { operation_id: OWNER_ID, conversation_key: KEY, origin: ORIGIN, conversation_id: CHAT_A, tab_id: 77, delivery: { mode: 'attachment_watch_v1', phase: 'attachment_claimed', delivery_id: DELIVERY_ID, adapter_id: 'alice' } } },
  ozmb_auto_runs: {}
};
const onConnectListeners = [];
globalThis.chrome = {
  runtime: { onConnect: { addListener(fn) { onConnectListeners.push(fn); } } },
  storage: { local: {
    async get(key) {
      if (Array.isArray(key)) return Object.fromEntries(key.filter((k) => k in storageState).map((k) => [k, storageState[k]]));
      if (typeof key === 'string') return key in storageState ? { [key]: storageState[key] } : {};
      return { ...storageState };
    },
    async set(values) { Object.assign(storageState, values || {}); }
  } },
  tabs: { async sendMessage() { return null; } }
};
globalThis.OzonRuntime = Object.freeze({ STORAGE_KEYS: Object.freeze({ MANUAL_MODES: 'ozmb_manual_modes', MANUAL_OPERATIONS: 'ozmb_manual_operations', AUTO_RUNS: 'ozmb_auto_runs', REPORT_PREFIXES: 'ozmb_report_prefix_configs', REPORT_FILE_SESSION_STATE: 'ozmb_report_file_session_state_v1' }) });
globalThis.BridgeAutorunModel = Object.freeze({ ATTACHMENT_PHASES: Object.freeze({ CLAIMED: 'attachment_claimed', ATTACH_COMMITTED: 'attachment_committed', READY: 'attachment_ready', SEND_COMMITTED: 'attachment_send_committed', CONFIRMED: 'attachment_confirmed' }), RUN_STATUSES: Object.freeze({ WAITING_COMMAND: 'waiting_command', ERROR: 'error' }) });
globalThis.ProviderTransportCore = Object.freeze({});
globalThis.OzonAIDeliveryCapabilities = Object.freeze({});
vm.runInThisContext(fs.readFileSync(identityPath, 'utf8'), { filename: identityPath });
vm.runInThisContext(fs.readFileSync(workerPath, 'utf8'), { filename: workerPath });
assert(onConnectListeners.length === 1, `expected one onConnect listener, got ${onConnectListeners.length}`);

function connect(sender) {
  let listener = null;
  const posted = [];
  const port = { name: 'ozon-attachment-delivery-v1', sender, onMessage: { addListener(fn) { listener = fn; } }, postMessage(payload) { posted.push(payload); } };
  onConnectListeners[0](port);
  assert(typeof listener === 'function', 'worker did not install port message listener');
  return { listener, posted };
}
async function send(port, message) {
  const requestId = `req-${Math.random()}`;
  port.listener({ request_id: requestId, ...message });
  for (let i = 0; i < 100 && port.posted.length === 0; i += 1) await new Promise((r) => setTimeout(r, 3));
  assert(port.posted.length === 1, `expected one response for ${message.type}, got ${port.posted.length}`);
  return port.posted.shift().response;
}
function baseMessage(type, extra = {}) { return { type, conversation_key: KEY, owner_kind: 'manual', owner_id: OWNER_ID, delivery_id: DELIVERY_ID, ...extra }; }
const liveA = { origin: ORIGIN, conversation_id: CHAT_A };
let response = await send(connect({ tab: { id: 77 }, url: `${ORIGIN}/` }), baseMessage('OZ_ATTACHMENT_RECOVERY_GET', { live_owner: liveA }));
assert(response?.ok === true && response?.recovery?.conversation_id === CHAT_A, `stale sender path must accept matching live owner; got ${JSON.stringify(response)}`);

const allTypes = ['OZ_ATTACHMENT_RECOVERY_GET','OZ_ATTACHMENT_COMMIT','OZ_ATTACHMENT_READY','OZ_ATTACHMENT_SEND_COMMIT','OZ_ATTACHMENT_SEND_ROLLBACK','OZ_ATTACHMENT_CONFIRM','OZ_ATTACHMENT_FAIL','OZ_ATTACHMENT_ARTIFACT_META','OZ_ATTACHMENT_ARTIFACT_CHUNK'];
for (const type of allTypes) {
  const r = await send(connect({ tab: { id: 77 }, url: `${ORIGIN}/` }), baseMessage(type));
  assert(r?.ok === false && r?.code === 'ATTACHMENT_LIVE_OWNER_REQUIRED', `${type} must fail closed without live_owner; got ${JSON.stringify(r)}`);
}
response = await send(connect({ tab: { id: 78 }, url: `${ORIGIN}/` }), baseMessage('OZ_ATTACHMENT_RECOVERY_GET', { live_owner: liveA }));
assert(response?.code === 'ATTACHMENT_NON_OWNER_TAB', `cross-tab must fail; got ${JSON.stringify(response)}`);
response = await send(connect({ tab: { id: 77 }, url: 'https://chatgpt.com/' }), baseMessage('OZ_ATTACHMENT_RECOVERY_GET', { live_owner: liveA }));
assert(response?.code === 'ATTACHMENT_ORIGIN_MISMATCH', `cross-origin sender must fail; got ${JSON.stringify(response)}`);
response = await send(connect({ tab: { id: 77 }, url: `${ORIGIN}/` }), baseMessage('OZ_ATTACHMENT_RECOVERY_GET', { live_owner: { origin: ORIGIN, conversation_id: CHAT_B } }));
assert(response?.code === 'ATTACHMENT_CONVERSATION_MISMATCH', `cross-conversation live owner must fail; got ${JSON.stringify(response)}`);
response = await send(connect({ tab: { id: 77 }, url: `${ORIGIN}/` }), baseMessage('OZ_ATTACHMENT_RECOVERY_GET', { live_owner: { origin: ORIGIN, conversation_id: 'not-a-uuid' } }));
assert(response?.code === 'ATTACHMENT_LIVE_OWNER_REQUIRED', `malformed live owner must fail closed; got ${JSON.stringify(response)}`);
response = await send(connect({ tab: { id: 77 }, url: `${ORIGIN}/` }), baseMessage('OZ_ATTACHMENT_RECOVERY_GET', { live_owner: { origin: 'http://alice.yandex.ru', conversation_id: CHAT_A } }));
assert(response?.code === 'ATTACHMENT_LIVE_OWNER_REQUIRED', `non-https live owner must fail closed; got ${JSON.stringify(response)}`);

const content = fs.readFileSync(contentPath, 'utf8');
const worker = fs.readFileSync(workerPath, 'utf8');
assert(content.includes('function liveOwnerBinding()'), 'content live owner producer missing');
assert(content.includes('here.status !== "confirmed"'), 'content live owner must require confirmed identity');
assert(content.includes('port.postMessage({ request_id: requestId, type, ...payload, live_owner: liveOwner });'), 'reserved live_owner must be written after caller payload');
assert(content.includes('if (!response?.ok) throw Object.assign'), 'recovery errors must not be silently collapsed to null');
assert(content.includes('status(`Ozon: ошибка проверки доставки файла'), 'recovery failure must be surfaced');
assert(!worker.includes('function senderIdentity(sender)'), 'stale sender conversation validator must be removed');
assert(worker.includes('senderOrigin(sender) !== expectedOrigin'), 'immutable sender origin guard missing');
assert(worker.includes('assertSenderOwner(sender, found.owner, message.live_owner);'), 'live owner guard not connected');
const cases = [...worker.matchAll(/case "(OZ_ATTACHMENT_[A-Z_]+)"/g)].map((m) => m[1]);
assert(cases.length === 9 && allTypes.every((type) => cases.includes(type)), `expected exact 9 attachment RPC cases, got ${cases.join(',')}`);
console.log('POSTFIX_SPA_OWNER_GATE=PASS');
console.log(`ATTACHMENT_RPC_LIVE_OWNER_GUARD=${allTypes.length}/9`);
console.log('STALE_SENDER_PATH_MATCHING_LIVE_OWNER=PASS');
console.log('NEGATIVE_CONTROLS=cross_tab,cross_origin,cross_conversation,missing_live_owner,malformed_live_owner,non_https_live_owner');
console.log('RECOVERY_ERROR_VISIBILITY=PASS');
