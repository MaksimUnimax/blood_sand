import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import path from "node:path";

const root = process.argv[2] || path.resolve(import.meta.dirname, "../../dist-step7-candidate");
const source = readFileSync(path.join(root, "shared/file_delivery_port_worker.js"), "utf8");
const trustedUrl = "https://files.ozon.ru/download?id=opaque";
const ref = "rpf_s_xlsxopaque";
const records = new Map();
let created = false;
function makeRequest(run) { const req = { result: undefined, error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null }; queueMicrotask(() => run(req)); return req; }
const storeApi = {
  put(record) { return makeRequest((req) => { records.set(record.artifact_key, structuredClone(record)); req.result = record.artifact_key; req.onsuccess?.(); }); },
  get(key) { return makeRequest((req) => { req.result = records.get(key); req.onsuccess?.(); }); },
  delete(key) { return makeRequest((req) => { records.delete(key); req.onsuccess?.(); }); },
  getAll() { return makeRequest((req) => { req.result = [...records.values()]; req.onsuccess?.(); }); }
};
const db = {
  objectStoreNames: { contains() { return created; } },
  createObjectStore() { created = true; return storeApi; },
  transaction() { const tx = { error: null, onabort: null, oncomplete: null, objectStore() { return storeApi; } }; queueMicrotask(() => queueMicrotask(() => tx.oncomplete?.())); return tx; },
  close() {}
};
const indexedDB = { open() { return makeRequest((req) => { req.result = db; if (!created) req.onupgradeneeded?.(); req.onsuccess?.(); }); } };
const now = Date.now();
const sessionState = { report_file_refs: { [ref]: { url: trustedUrl, personal_data_required: false, created_at_ms: now, expires_at_ms: now + 60_000, provider_expires_at_ms: now + 60_000 } } };
const originalTransport = {
  normalizeTrustedReportFileUrl(value) { const url = new URL(String(value)); if (url.protocol !== "https:" || !url.hostname.endsWith(".ozon.ru")) throw new Error("untrusted"); return url.toString(); },
  async executeTrustedReportFileOnce({ fetchImpl, url }) { const response = await fetchImpl(url, { method: "GET" }); const bytes = new Uint8Array(await response.arrayBuffer()); return Object.freeze({ ok: true, httpStatus: 200, byteLength: bytes.byteLength, parsed: Object.freeze({ content_type: "application/octet-stream", byte_length: bytes.byteLength, format: "xlsx" }) }); },
  reportBase64ToBytes() { return new Uint8Array(); }
};
const context = vm.createContext({
  console, URL, Response, Headers, TextEncoder, Uint8Array, ArrayBuffer, structuredClone, crypto: webcrypto, queueMicrotask, Promise, indexedDB,
  setTimeout() { return 1; }, clearTimeout() {},
  OzonRuntime: { STORAGE_KEYS: { REPORT_FILE_SESSION_STATE: "report_state", MANUAL_OPERATIONS: "manual_ops", AUTO_RUNS: "auto_runs", REPORT_PREFIXES: "prefixes", MANUAL_MODES: "manual_modes" } },
  BridgeAutorunModel: { ATTACHMENT_PHASES: { CLAIMED: "attachment_claimed", ATTACH_COMMITTED: "attachment_committed", READY: "attachment_ready", SEND_COMMITTED: "attachment_send_committed", CONFIRMED: "attachment_confirmed" }, RUN_STATUSES: { WAITING_COMMAND: "waiting_command", ERROR: "error" }, noteConfirmedPrefix(value) { return value; }, afterConfirmedDelivery(value) { return value; } },
  ProviderTransportCore: originalTransport,
  BB2ConversationIdentity: { providerForOrigin() { return "alice"; }, conversationIdFromPath() { return "x"; } },
  OzonAIDeliveryCapabilities: { extensionFromFilename(name) { const base = String(name || "").split("/").pop(); const index = base.lastIndexOf("."); return index > 0 ? base.slice(index + 1).toLowerCase() : ""; }, unicodeLength(value) { return [...String(value || "")].length; }, profile() { return null; }, supportsFile() { return { supported: false }; }, fileDispatchDecision() { return { dispatch_allowed: true }; } },
  chrome: { storage: { session: { async get() { return { report_state: sessionState }; } }, local: { async get(keys) { const out = {}; for (const key of Array.isArray(keys) ? keys : [keys]) out[key] = {}; return out; }, async set() {} }, onChanged: { addListener() {} } }, runtime: { onConnect: { addListener() {} } }, tabs: { async sendMessage() {} } }
});
context.globalThis = context;
vm.runInContext(source, context, { filename: "file_delivery_port_worker.js" });
const xlsxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4]);
let fetchCount = 0;
const result = await context.ProviderTransportCore.executeTrustedReportFileOnce({ url: trustedUrl, fetchImpl: async () => { fetchCount += 1; return new Response(xlsxBytes, { status: 200, headers: { "content-type": "application/octet-stream" } }); } });
assert.equal(result.ok, true);
assert.equal(fetchCount, 1, "artifact classification must not trigger a second provider request");
const record = records.get(`provider:${ref}`);
assert(record, "provider artifact not stored");
assert.equal(record.extension, "xlsx", "opaque XLSX must not be stored as .bin");
assert.equal(record.mime_type, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "opaque XLSX must use canonical MIME after the existing byte parser confirmed xlsx");
assert.match(record.filename, /\.xlsx$/i, "opaque XLSX filename must be canonicalized to .xlsx");
assert.deepEqual(new Uint8Array(record.bytes), xlsxBytes, "artifact bytes must remain byte-identical");
console.log("REPORT_ATTACHMENT_TYPE_GATE_PASS");
