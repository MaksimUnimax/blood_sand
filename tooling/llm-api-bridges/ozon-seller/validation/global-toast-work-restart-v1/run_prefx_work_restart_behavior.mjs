import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import cryptoMod from 'node:crypto';

const root = process.argv[2];
if (!root) throw new Error('extension root required');
const conv = '12345678-1234-1234-1234-123456789abc';
const origin = 'https://chatgpt.com';
const key = `${origin}|${conv}`;
const tabId = 77;
const listeners = { runtime: [], removed: [], storage: [] };
const store = {};
const sessionStore = {};
const deep = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function area(backing) {
  return {
    async get(keys) {
      if (keys == null) return deep(backing);
      const out = {};
      if (typeof keys === 'string') keys = [keys];
      if (Array.isArray(keys)) for (const k of keys) { if (k in backing) out[k] = deep(backing[k]); }
      else for (const [k, d] of Object.entries(keys || {})) out[k] = k in backing ? deep(backing[k]) : d;
      return out;
    },
    async set(values) { Object.assign(backing, deep(values)); },
    async remove(keys) { if (typeof keys === 'string') keys = [keys]; for (const k of keys || []) delete backing[k]; }
  };
}
let workerListener = null;
let sendSideEffects = 0;
let losePrimaryResponse = false;
const identity = { status: 'confirmed', origin, conversation_id: conv, ai_id: 'chatgpt' };
const sender = { tab: { id: tabId, url: `${origin}/c/${conv}` } };
async function content(message) {
  if (message.type === 'OZ_GET_IDENTITY' || message.type === 'OZ_PAGE_CONTEXT') return { ok: true, identity, href: sender.tab.url };
  if (message.type === 'OZ_WORK_APPLY_VISIBILITY') return { ok: true, applied: true, conversation_key: message.conversation_key, identity };
  if (message.type === 'OZ_AUTO_STOP_WATCH') return { ok: true };
  if (message.type === 'OZ_WORK_SEND_INITIAL_PROMPT') {
    sendSideEffects += 1;
    if (losePrimaryResponse) return await new Promise(() => {});
    return { ok: true, sent: true, intent_id: message.intent_id, revision: message.revision, identity };
  }
  return { ok: true };
}
const chrome = {
  storage: { local: area(store), session: area(sessionStore), onChanged: { addListener(fn) { listeners.storage.push(fn); } } },
  runtime: { onMessage: { addListener(fn) { listeners.runtime.push(fn); } }, onInstalled: { addListener() {} }, lastError: null },
  tabs: {
    async get(id) { return { id, url: sender.tab.url }; },
    sendMessage(id, message, callback) { Promise.resolve(content(message)).then((result) => callback?.(result)); },
    onRemoved: { addListener(fn) { listeners.removed.push(fn); } },
    async query() { return []; }
  },
  alarms: { onAlarm: { addListener() {} }, async create() {}, async clear() { return true; } },
  action: { async setBadgeText() {}, async setBadgeBackgroundColor() {} }
};
const context = vm.createContext({ console, chrome, crypto: cryptoMod.webcrypto, fetch: async () => { throw new Error('provider fetch forbidden'); }, TextEncoder, TextDecoder, URL, Headers, Request, Response, setTimeout, clearTimeout, setInterval, clearInterval, structuredClone, atob, btoa, importScripts() {} });
context.globalThis = context;
context.self = context;
for (const rel of ['shared/conversation_identity.js','shared/runtime_names.js','shared/work_session_model.js','shared/manual_controls.js','shared/ozon_credentials.js','shared/ozon_operation_registry.js','shared/ozon_entitlements.js','shared/ozon_contract.js','shared/ozon_guidance.js','shared/bridge_autorun_model.js','shared/provider_transport_core.js','shared/ozon_provider.js','service_worker.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), context, { filename: rel });
}
workerListener = listeners.runtime.at(-1);
function invoke(message, timeout = 700) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (value) => { if (done) return; done = true; resolve(value); };
    try { const returned = workerListener(message, sender, finish); if (returned !== true) queueMicrotask(() => finish(undefined)); } catch (error) { reject(error); }
    setTimeout(() => { if (!done) reject(new Error(`worker timeout ${message.type}`)); }, timeout);
  });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const work = () => store.ozmb_work_sessions_v1?.[key] || null;
const pending = () => store.ozmb_pending_work_starts_v1?.[String(tabId)] || null;

const first = await invoke({ type: 'OZ_WORK_START', tab_id: tabId, start_intent_id: 'prefx-gen1' });
if (!first?.ok || first.session?.state !== 'active_visible') throw new Error('baseline first Start failed');
const finished = await invoke({ type: 'OZ_WORK_FINISH', tab_id: tabId, conversation_key: key });
if (!finished?.ok || work()?.state !== 'inactive') throw new Error('baseline Finish failed');
losePrimaryResponse = true;
sendSideEffects = 0;
const second = await invoke({ type: 'OZ_WORK_START', tab_id: tabId, start_intent_id: 'prefx-gen2' }).catch((error) => ({ timed_out: true, error: error.message }));
await sleep(80);
if (!second.timed_out) throw new Error(`expected existing-conversation Start to hang after lost content callback, got ${JSON.stringify(second)}`);
if (sendSideEffects !== 1) throw new Error(`expected exactly one irreversible Send side effect, got ${sendSideEffects}`);
if (pending()) throw new Error('baseline unexpectedly created durable pending Start for existing conversation');
if (work()?.state !== 'active_visible') throw new Error('baseline did not prematurely mark Work-session ACTIVE_VISIBLE before Send acknowledgement');
console.error('PREFX_WORK_RESTART_REPRODUCED=YES');
console.error('FIRST_DIVERGENCE=EXISTING_CONVERSATION_BYPASSES_DURABLE_PENDING_START_BEFORE_SEND');
console.error('provider_calls_during_test=0');
process.exit(1);
