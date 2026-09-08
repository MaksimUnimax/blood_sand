import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const source = readFileSync(join(ROOT, "dist-step7-candidate/shared/file_delivery_worker.js"), "utf8");
const trustedUrl = "https://files.ozon.ru/report.xlsx";
const state = {
  report_file_refs: {
    rpf_s_test: { url: trustedUrl, personal_data_required: false, created_at_ms: Date.now() }
  }
};

const originalTransport = {
  normalizeTrustedReportFileUrl(value) {
    const parsed = new URL(String(value || ""));
    if (parsed.protocol !== "https:" || !(parsed.hostname === "ozon.ru" || parsed.hostname.endsWith(".ozon.ru"))) throw new Error("untrusted");
    return parsed.toString();
  },
  async executeTrustedReportFileOnce({ fetchImpl, url }) {
    const response = await fetchImpl(url, { method: "GET" });
    const bytes = new Uint8Array(await response.arrayBuffer());
    return Object.freeze({ ok: response.ok, byteLength: bytes.byteLength, httpStatus: response.status });
  },
  reportBase64ToBytes() { return new Uint8Array(0); }
};

const context = vm.createContext({
  console,
  URL,
  Response,
  Headers,
  TextEncoder,
  Uint8Array,
  ArrayBuffer,
  crypto: webcrypto,
  queueMicrotask,
  Promise,
  setTimeout() { return 1; },
  clearTimeout() {},
  indexedDB: {
    open() {
      // Force the post-provider artifact store to fail. The wrapper must preserve
      // the already completed provider result and must not perform a second fetch.
      throw new Error("synthetic IndexedDB unavailable");
    }
  },
  OzonRuntime: {
    STORAGE_KEYS: {
      REPORT_FILE_SESSION_STATE: "report_state",
      MANUAL_OPERATIONS: "manual_ops",
      AUTO_RUNS: "auto_runs",
      REPORT_PREFIXES: "prefixes",
      MANUAL_MODES: "manual_modes"
    }
  },
  BridgeAutorunModel: {
    ATTACHMENT_PHASES: {
      CLAIMED: "attachment_claimed",
      ATTACH_COMMITTED: "attachment_committed",
      READY: "attachment_ready",
      SEND_COMMITTED: "attachment_send_committed",
      CONFIRMED: "attachment_confirmed"
    },
    RUN_STATUSES: { WAITING_COMMAND: "waiting_command", ERROR: "error" },
    noteConfirmedPrefix(value) { return value; },
    afterConfirmedDelivery(value) { return value; }
  },
  ProviderTransportCore: originalTransport,
  BB2ConversationIdentity: { resolve() { return { status: "unsupported" }; } },
  OzonAIDeliveryCapabilities: {
    extensionFromFilename(name) { return String(name || "").split(".").pop().toLowerCase(); },
    unicodeLength(value) { return [...String(value || "")].length; },
    profile() { return null; },
    supportsFile() { return { supported: false }; }
  },
  chrome: {
    storage: {
      session: { async get() { return { report_state: state }; } },
      local: {
        async get(keys) {
          const result = {};
          for (const key of Array.isArray(keys) ? keys : [keys]) result[key] = {};
          return result;
        },
        async set() {}
      },
      onChanged: { addListener() {} }
    },
    runtime: { onMessage: { addListener() {} } },
    tabs: { async sendMessage() {} }
  }
});
context.globalThis = context;
vm.runInContext(source, context, { filename: "file_delivery_worker.js" });

const bytes = new TextEncoder().encode("xlsx-byte-surrogate-for-test");
let fetchCount = 0;
const result = await context.ProviderTransportCore.executeTrustedReportFileOnce({
  url: trustedUrl,
  fetchImpl: async () => {
    fetchCount += 1;
    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": "attachment; filename=report.xlsx"
      }
    });
  }
});

assert.equal(fetchCount, 1, "post-provider artifact failure must not refetch");
assert.equal(result.ok, true, "artifact-store failure must not rewrite successful provider truth");
assert.equal(result.httpStatus, 200);
assert.equal(result.byteLength, bytes.byteLength);

console.log("REG_REPORT_ARTIFACT_STORE_FAILURE_PRESERVES_PROVIDER_SUCCESS_PASS");
console.log("REG_REPORT_ARTIFACT_STORE_FAILURE_NO_HIDDEN_REFETCH_PASS");
console.log("FILE_DELIVERY_CAPTURE_ACCOUNTING_PASS");
