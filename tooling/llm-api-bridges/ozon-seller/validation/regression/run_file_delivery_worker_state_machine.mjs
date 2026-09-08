import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const source = (path) => readFileSync(join(ROOT, "dist-step7-candidate", path), "utf8");
const conversationId = "11111111-2222-4333-8444-555555555555";
const conversationKey = `https://chatgpt.com|${conversationId}`;
const storage = {
  auto_runs: {},
  manual_ops: {},
  manual_modes: {},
  prefixes: {}
};
const tabMessages = [];
let runtimeListener = null;

function normalizeStorageKeys(keys) {
  if (Array.isArray(keys)) return keys;
  if (typeof keys === "string") return [keys];
  if (keys && typeof keys === "object") return Object.keys(keys);
  return [];
}

const context = vm.createContext({
  console,
  URL,
  TextEncoder,
  Uint8Array,
  ArrayBuffer,
  crypto: webcrypto,
  queueMicrotask,
  Promise,
  setTimeout() { return 1; },
  clearTimeout() {},
  indexedDB: { open() { throw new Error("not used in lifecycle test"); } },
  OzonRuntime: {
    STORAGE_KEYS: {
      REPORT_FILE_SESSION_STATE: "report_state",
      MANUAL_OPERATIONS: "manual_ops",
      AUTO_RUNS: "auto_runs",
      REPORT_PREFIXES: "prefixes",
      MANUAL_MODES: "manual_modes"
    }
  },
  ProviderTransportCore: {
    normalizeTrustedReportFileUrl(value) { return String(value); },
    async executeTrustedReportFileOnce() { throw new Error("provider transport must not execute in lifecycle test"); },
    reportBase64ToBytes() { return new Uint8Array(0); }
  },
  BB2ConversationIdentity: {
    resolve({ origin, pathname }) {
      const match = String(pathname || "").match(/\/c\/([0-9a-f-]+)/i);
      return { origin: String(origin || "").toLowerCase(), conversation_id: match?.[1]?.toLowerCase() || null, status: match ? "confirmed" : "unknown", ai_id: "chatgpt" };
    }
  },
  chrome: {
    storage: {
      local: {
        async get(keys) {
          const result = {};
          for (const key of normalizeStorageKeys(keys)) result[key] = structuredClone(storage[key] ?? {});
          return result;
        },
        async set(values) {
          for (const [key, value] of Object.entries(values || {})) storage[key] = structuredClone(value);
        }
      },
      session: { async get() { return { report_state: { report_file_refs: {} } }; } },
      onChanged: { addListener() {} }
    },
    runtime: {
      onMessage: {
        addListener(listener) { runtimeListener = listener; }
      }
    },
    tabs: {
      async sendMessage(tabId, message) { tabMessages.push({ tabId, message: structuredClone(message) }); return { ok: true }; }
    }
  },
  structuredClone
});
context.globalThis = context;
vm.runInContext(source("shared/ai_delivery_capabilities.js"), context, { filename: "ai_delivery_capabilities.js" });
vm.runInContext(source("shared/bridge_autorun_model.js"), context, { filename: "bridge_autorun_model.js" });
vm.runInContext(source("shared/file_delivery_worker.js"), context, { filename: "file_delivery_worker.js" });
assert.equal(typeof runtimeListener, "function");

function sender(tabId = 7) {
  return { tab: { id: tabId, url: `https://chatgpt.com/c/${conversationId}` }, url: `https://chatgpt.com/c/${conversationId}` };
}

function dispatch(message, senderValue = sender()) {
  return new Promise((resolve) => {
    const returned = runtimeListener(message, senderValue, (response) => resolve(response));
    assert.equal(returned, true, `message ${message.type} should be owned by file-delivery listener`);
  });
}

function baseAutoOwner(phase = "attachment_committed") {
  return {
    run_id: "run-1",
    tab_id: 7,
    origin: "https://chatgpt.com",
    conversation_id: conversationId,
    conversation_key: conversationKey,
    status: "delivering",
    sequence: 0,
    pause_requested: false,
    finish_requested: false,
    delivery: {
      delivery_id: "delivery-1",
      mode: "attachment_watch_v1",
      phase,
      adapter_id: "chatgpt",
      outgoing_text: 'OZON_BATCH_RESULT_V1\n{"delivery_id":"delivery-1"}',
      report_prefix_applied: false,
      artifact_descriptors: [{ artifact_key: "generated:g1", filename: "ozon-result.txt", mime_type: "text/plain", extension: "txt", byte_length: 10, sha256: "abc", source_kind: "generated_bridge_text" }],
      attached_filenames: ["ozon-result.txt"],
      baseline_user_turn_ids: [],
      baseline_assistant_turn_ids: [],
      commit_actor_id: "content-1",
      attachment_send_actor_id: null,
      attachment_send_committed_at: null
    }
  };
}

storage.auto_runs[conversationKey] = baseAutoOwner();

const wrongTab = await dispatch({
  type: "OZ_ATTACHMENT_READY",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-1",
  attached_filenames: ["ozon-result.txt"]
}, sender(99));
assert.equal(wrongTab.ok, false);
assert.equal(wrongTab.code, "ATTACHMENT_NON_OWNER_TAB");
assert.equal(storage.auto_runs[conversationKey].delivery.phase, "attachment_committed");
console.log("REG_ATTACHMENT_WRONG_TAB_FAIL_CLOSED_PASS");

const ready = await dispatch({
  type: "OZ_ATTACHMENT_READY",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-1",
  attached_filenames: ["ozon-result.txt"], baseline_assistant_turn_ids: ["assistant-before"]
});
assert.equal(ready.ok, true);
assert.equal(ready.ready, true);
assert.equal(storage.auto_runs[conversationKey].delivery.phase, "attachment_ready");
console.log("REG_ATTACHMENT_READY_STATE_TRANSITION_PASS");

const sendCommit1 = await dispatch({
  type: "OZ_ATTACHMENT_SEND_COMMIT",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-1",
  baseline_user_turn_ids: ["user-before"]
});
assert.equal(sendCommit1.ok, true);
assert.equal(sendCommit1.click_allowed, true);
assert.equal(storage.auto_runs[conversationKey].delivery.phase, "attachment_send_committed");

const sendCommit2 = await dispatch({
  type: "OZ_ATTACHMENT_SEND_COMMIT",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-1",
  baseline_user_turn_ids: ["user-before"]
});
assert.equal(sendCommit2.ok, true);
assert.equal(sendCommit2.click_allowed, false);
assert.equal(sendCommit2.already_committed, true);
assert.equal(storage.auto_runs[conversationKey].delivery.phase, "attachment_send_committed");
console.log("REG_ATTACHMENT_SEND_COMMIT_SINGLE_FLIGHT_PASS");

const unsafeRollback = await dispatch({
  type: "OZ_ATTACHMENT_SEND_ROLLBACK",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-1",
  click_event_observed: true
});
assert.equal(unsafeRollback.ok, false);
assert.equal(unsafeRollback.code, "ATTACHMENT_SEND_OUTCOME_UNKNOWN_NO_RETRY");
assert.equal(storage.auto_runs[conversationKey].delivery.phase, "attachment_send_committed");
console.log("REG_ATTACHMENT_OBSERVED_CLICK_NO_ROLLBACK_PASS");

const recoveryAtCommitted = await dispatch({
  type: "OZ_ATTACHMENT_RECOVERY_GET", owner_kind: "autorun", owner_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1"
});
assert.equal(recoveryAtCommitted.ok, true);
assert.equal(recoveryAtCommitted.recovery.delivery_phase, "attachment_send_committed");
assert.equal(recoveryAtCommitted.recovery.send_commit_actor_id, "content-1");
console.log("REG_ATTACHMENT_SEND_COMMITTED_RESTART_RECONCILE_ONLY_PASS");

storage.auto_runs[conversationKey] = baseAutoOwner("attachment_send_committed");
storage.auto_runs[conversationKey].delivery.attachment_send_actor_id = "content-1";
storage.auto_runs[conversationKey].delivery.baseline_user_turn_ids = ["user-before"];
const safeRollback = await dispatch({
  type: "OZ_ATTACHMENT_SEND_ROLLBACK",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-1",
  click_event_observed: false
});
assert.equal(safeRollback.ok, true);
assert.equal(safeRollback.rolled_back, true);
assert.equal(storage.auto_runs[conversationKey].delivery.phase, "attachment_ready");
console.log("REG_ATTACHMENT_UNOBSERVED_CLICK_SAFE_ROLLBACK_PASS");

const sendCommit3 = await dispatch({
  type: "OZ_ATTACHMENT_SEND_COMMIT",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1", actor_id: "content-2",
  baseline_user_turn_ids: ["user-before"]
});
assert.equal(sendCommit3.click_allowed, true);
const confirmed = await dispatch({
  type: "OZ_ATTACHMENT_CONFIRM",
  owner_kind: "autorun", owner_id: "run-1", run_id: "run-1",
  conversation_key: conversationKey, delivery_id: "delivery-1",
  confirmed_user_turn_id: "user-after", assistant_baseline_ids: ["assistant-after"]
});
assert.equal(confirmed.ok, true);
assert.equal(confirmed.confirmed, true);
assert.equal(storage.auto_runs[conversationKey].status, "waiting_command");
assert.equal(storage.auto_runs[conversationKey].delivery, null);
assert.equal(storage.auto_runs[conversationKey].last_confirmed_user_turn_id, "user-after");
assert(tabMessages.some((item) => item.message?.type === "OZ_AUTO_BEGIN_WATCH" && item.message?.run_id === "run-1"));
console.log("REG_ATTACHMENT_CONFIRM_ADVANCES_AUTORUN_PASS");

storage.manual_modes[conversationKey] = false;
storage.manual_ops[conversationKey] = {
  operation_id: "manual-1",
  tab_id: 7,
  origin: "https://chatgpt.com",
  conversation_id: conversationId,
  conversation_key: conversationKey,
  status: "delivering",
  delivery: {
    delivery_id: "manual-delivery-1",
    mode: "attachment_watch_v1",
    phase: "attachment_claimed",
    adapter_id: "chatgpt",
    outgoing_text: "marker"
  }
};
const manualOff = await dispatch({
  type: "OZ_ATTACHMENT_RECOVERY_GET", owner_kind: "manual", owner_id: "manual-1",
  conversation_key: conversationKey, delivery_id: "manual-delivery-1"
});
assert.equal(manualOff.ok, true);
assert.equal(manualOff.cancelled, true);
assert.equal(manualOff.recovery, null);
assert.equal(storage.manual_ops[conversationKey], undefined);
console.log("REG_ATTACHMENT_MANUAL_OFF_CANCELS_ONLY_PRECOMMIT_PASS");

console.log("FILE_DELIVERY_WORKER_STATE_MACHINE_PASS");
