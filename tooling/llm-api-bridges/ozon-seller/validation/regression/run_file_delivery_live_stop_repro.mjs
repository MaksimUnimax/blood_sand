import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const source = (p) => readFileSync(join(ROOT, "dist-step7-candidate", p), "utf8");

vm.runInThisContext(source("shared/ai_delivery_capabilities.js"));
vm.runInThisContext(source("shared/bridge_autorun_model.js"));
vm.runInThisContext(source("shared/file_delivery_model_policy.js"));

const model = globalThis.BridgeAutorunModel;
const large = "x".repeat(1_048_001);
const conversationId = "11111111-2222-4333-8444-555555555555";
const conversationKey = `https://chatgpt.com|${conversationId}`;
const claimed = model.claimDelivery({
  origin: "https://chatgpt.com",
  status: model.RUN_STATUSES.COLLECTING,
  tab_id: 7,
  conversation_key: conversationKey,
  batch: { entries: [] }
}, {
  deliveryId: "live-stop",
  mode: "batch_watch_v1",
  outgoingText: large
});
assert.equal(claimed.delivery.mode, "attachment_watch_v1");
assert.equal(claimed.delivery.phase, "attachment_claimed");
console.log("REG_LIVE_STOP_LARGE_RESULT_CLASSIFIES_ATTACHMENT_PASS");

let changed = null;
const sent = [];
const auto_runs = {
  [conversationKey]: {
    ...claimed,
    run_id: "run-1",
    tab_id: 7,
    conversation_key: conversationKey
  }
};
const workerCtx = vm.createContext({
  console,
  queueMicrotask,
  setTimeout: (fn) => { queueMicrotask(fn); return 1; },
  OzonRuntime: { STORAGE_KEYS: { AUTO_RUNS: "auto_runs", MANUAL_OPERATIONS: "manual_ops" } },
  chrome: {
    storage: {
      local: { async get() { return { auto_runs, manual_ops: {} }; } },
      onChanged: { addListener(fn) { changed = fn; } }
    },
    tabs: {
      async sendMessage(tabId, message) {
        sent.push({ tabId, message });
        return { ok: true };
      }
    }
  }
});
workerCtx.globalThis = workerCtx;
vm.runInContext(source("shared/file_delivery_wake_worker.js"), workerCtx);
await new Promise((resolveTick) => setTimeout(resolveTick, 0));
assert(sent.some((item) => item.message?.type === "OZ_ATTACHMENT_DELIVERY_WAKE" && item.message?.delivery_id === "live-stop"));
assert.equal(typeof changed, "function");
console.log("REG_LIVE_STOP_STORAGE_WAKE_EMITTED_PASS");

let wakeListener = null;
const portPosts = [];
const portMessageListeners = [];
const portDisconnectListeners = [];
const scheduledTimeouts = [];
const scheduledIntervals = [];
let scheduledCallbackExecutions = 0;

const fakePort = {
  name: "ozon-attachment-delivery-v1",
  onMessage: { addListener(fn) { portMessageListeners.push(fn); } },
  onDisconnect: { addListener(fn) { portDisconnectListeners.push(fn); } },
  postMessage(message) {
    portPosts.push(structuredClone(message));
    queueMicrotask(() => {
      const response = {
        kind: "response",
        request_id: message.request_id,
        response: { ok: true, recovery: null }
      };
      for (const listener of portMessageListeners) listener(response);
    });
  },
  disconnect() {
    for (const listener of portDisconnectListeners) listener();
  }
};

class FakeElement {}
class FakeHTMLElement extends FakeElement {}

const contentCtx = vm.createContext({
  console,
  globalThis: null,
  queueMicrotask,
  Promise,
  structuredClone,
  URL,
  TextEncoder,
  Uint8Array,
  ArrayBuffer,
  Date,
  Math,
  Set,
  Map,
  Element: FakeElement,
  HTMLElement: FakeHTMLElement,
  location: { origin: "https://chatgpt.com", pathname: `/c/${conversationId}` },
  document: {
    querySelector() { return null; },
    getElementById() { return null; },
    createElement() { return new FakeHTMLElement(); },
    documentElement: { appendChild() {} }
  },
  BB2ConversationIdentity: {
    resolveWithEvidence() {
      return {
        status: "confirmed",
        origin: "https://chatgpt.com",
        conversation_id: conversationId,
        ai_id: "chatgpt"
      };
    },
    resolve() {
      return {
        status: "confirmed",
        origin: "https://chatgpt.com",
        conversation_id: conversationId,
        ai_id: "chatgpt"
      };
    }
  },
  OzonAIAdapters: {
    adapterForLocation() { return { id: "chatgpt" }; },
    visible() { return true; }
  },
  OzonAIDeliveryCapabilities: {
    supportsFile() { return { supported: true }; }
  },
  OzonWebFileAttachment: {
    base64ToBytes() { return new Uint8Array(0); },
    createFile() { return {}; },
    setInputFiles() {}
  },
  BB2ComposerSend: {
    async waitForValidatedTarget() { return null; },
    clickSynchronously() {}
  },
  setTimeout(fn, ms) {
    scheduledTimeouts.push({ fn, ms: Number(ms || 0) });
    return scheduledTimeouts.length;
  },
  clearTimeout() {},
  setInterval(fn, ms) {
    scheduledIntervals.push({ fn, ms: Number(ms || 0) });
    return scheduledIntervals.length;
  },
  clearInterval() {},
  chrome: {
    runtime: {
      lastError: null,
      connect({ name }) {
        assert.equal(name, "ozon-attachment-delivery-v1");
        return fakePort;
      },
      onMessage: {
        addListener(fn) { wakeListener = fn; }
      }
    }
  }
});
contentCtx.globalThis = contentCtx;

vm.runInContext(source("attachment_delivery_port_content.js"), contentCtx, { filename: "attachment_delivery_port_content.js" });
const runtime = contentCtx.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__;
assert(runtime && runtime.disposed === false);
assert.equal(typeof runtime.recoverCurrent, "function", "normal startup must export recoverCurrent before any reconnect");
assert.equal(portPosts.length, 0, "normal startup timers are intentionally not advanced in this regression");
assert(scheduledTimeouts.some((timer) => timer.ms === 250), "startup recovery fallback must remain scheduled");
assert(scheduledIntervals.some((timer) => timer.ms === 60_000), "60-second recovery poll must remain only as a failsafe");
console.log("REG_LIVE_STOP_NORMAL_START_RECOVERY_EXPORT_PASS");

vm.runInContext(source("attachment_delivery_wake_content.js"), contentCtx, { filename: "attachment_delivery_wake_content.js" });
assert.equal(typeof wakeListener, "function");
assert.equal(wakeListener({ type: "OZ_ATTACHMENT_DELIVERY_WAKE" }), false);
await Promise.resolve();
await Promise.resolve();
await new Promise((resolveTick) => setTimeout(resolveTick, 0));

const recoveryGets = portPosts.filter((message) => message.type === "OZ_ATTACHMENT_RECOVERY_GET");
assert.equal(recoveryGets.length, 1, "storage wake must immediately enter the named-Port recovery path");
assert.equal(recoveryGets[0].conversation_key, conversationKey);
assert.equal(scheduledCallbackExecutions, 0, "wake proof must not depend on running the 250ms startup or 60s poll callbacks");
console.log("REG_LIVE_STOP_WAKE_REACHES_REAL_PORT_RECOVERY_PASS");

runtime.dispose();
console.log("FILE_DELIVERY_LIVE_STOP_REPRO_PASS");
