import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(process.argv[2] || '.');
const bridgeRoot = path.join(repoRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const workerPath = path.join(bridgeRoot, 'shared/file_delivery_port_worker.js');
const identityPath = path.join(bridgeRoot, 'shared/conversation_identity.js');

const CHAT_ID = '11111111-1111-4111-8111-111111111111';
const CONVERSATION_KEY = `https://alice.yandex.ru|${CHAT_ID}`;
const storageState = {
  ozmb_manual_modes: { [CONVERSATION_KEY]: true },
  ozmb_manual_operations: {
    [CONVERSATION_KEY]: {
      operation_id: 'manual-op-spa-owner-prefx',
      conversation_key: CONVERSATION_KEY,
      origin: 'https://alice.yandex.ru',
      conversation_id: CHAT_ID,
      tab_id: 77,
      delivery: {
        mode: 'attachment_watch_v1',
        phase: 'attachment_claimed',
        delivery_id: 'delivery-spa-owner-prefx',
        adapter_id: 'alice'
      }
    }
  },
  ozmb_auto_runs: {}
};

const onConnectListeners = [];
const chrome = {
  runtime: {
    onConnect: { addListener(fn) { onConnectListeners.push(fn); } }
  },
  storage: {
    local: {
      async get(key) {
        if (Array.isArray(key)) return Object.fromEntries(key.filter((k) => k in storageState).map((k) => [k, storageState[k]]));
        if (typeof key === 'string') return key in storageState ? { [key]: storageState[key] } : {};
        return { ...storageState };
      },
      async set(values) { Object.assign(storageState, values || {}); }
    }
  },
  tabs: { async sendMessage() { return null; } }
};

globalThis.chrome = chrome;
globalThis.OzonRuntime = Object.freeze({
  STORAGE_KEYS: Object.freeze({
    MANUAL_MODES: 'ozmb_manual_modes',
    MANUAL_OPERATIONS: 'ozmb_manual_operations',
    AUTO_RUNS: 'ozmb_auto_runs',
    REPORT_PREFIXES: 'ozmb_report_prefix_configs',
    REPORT_FILE_SESSION_STATE: 'ozmb_report_file_session_state_v1'
  })
});
globalThis.BridgeAutorunModel = Object.freeze({
  ATTACHMENT_PHASES: Object.freeze({
    CLAIMED: 'attachment_claimed',
    ATTACH_COMMITTED: 'attachment_committed',
    READY: 'attachment_ready',
    SEND_COMMITTED: 'attachment_send_committed',
    CONFIRMED: 'attachment_confirmed'
  }),
  RUN_STATUSES: Object.freeze({ WAITING_COMMAND: 'waiting_command', ERROR: 'error' })
});
globalThis.ProviderTransportCore = Object.freeze({});
globalThis.OzonAIDeliveryCapabilities = Object.freeze({});

vm.runInThisContext(fs.readFileSync(identityPath, 'utf8'), { filename: identityPath });
vm.runInThisContext(fs.readFileSync(workerPath, 'utf8'), { filename: workerPath });

if (onConnectListeners.length !== 1) throw new Error(`expected one attachment onConnect listener, got ${onConnectListeners.length}`);

let onMessageListener = null;
const posted = [];
const port = {
  name: 'ozon-attachment-delivery-v1',
  // Immutable sender URL reflects the page at connect time, before Alice SPA created Chat A.
  sender: { tab: { id: 77 }, url: 'https://alice.yandex.ru/' },
  onMessage: { addListener(fn) { onMessageListener = fn; } },
  postMessage(payload) { posted.push(payload); }
};
onConnectListeners[0](port);
if (typeof onMessageListener !== 'function') throw new Error('attachment port listener was not installed');

// The owner persisted by Bridge is Chat A. A live content-side binding after SPA navigation is Chat A too.
// Pre-fix worker ignores the live binding and instead compares against frozen port.sender.url.
onMessageListener({
  request_id: 'req-spa-owner-prefx',
  type: 'OZ_ATTACHMENT_RECOVERY_GET',
  conversation_key: CONVERSATION_KEY,
  owner_kind: 'manual',
  owner_id: 'manual-op-spa-owner-prefx',
  live_owner: {
    origin: 'https://alice.yandex.ru',
    conversation_id: CHAT_ID
  }
});

for (let i = 0; i < 100 && posted.length === 0; i += 1) await new Promise((resolve) => setTimeout(resolve, 5));
if (posted.length !== 1) throw new Error(`expected one response, got ${posted.length}`);
const response = posted[0]?.response || null;
if (response?.ok !== true || response?.recovery?.conversation_id !== CHAT_ID) {
  console.error('PREFX_SPA_OWNER_REPRO=FAIL');
  console.error(JSON.stringify({ response }, null, 2));
  throw new Error(`SPA owner recovery should be accepted when live binding matches persisted owner; got ${response?.code || 'invalid_response'}`);
}
console.log('PREFX_SPA_OWNER_REPRO=PASS');
