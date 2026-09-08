import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const source = (path) => readFileSync(join(ROOT, "dist-step7-candidate", path), "utf8");

const worker = source("shared/file_delivery_wake_worker.js");
assert(worker.includes('const ATTACHMENT_MODE = "attachment_watch_v1"'));
assert(worker.includes('type: "OZ_ATTACHMENT_DELIVERY_WAKE"'));
assert(worker.includes("chrome.storage.onChanged.addListener"));
assert(worker.includes("chrome.tabs.sendMessage"));
assert.equal(worker.includes("sendResponse"), false);
assert.equal(worker.includes("chrome.runtime.onMessage"), false);
console.log("REG_ATTACHMENT_WAKE_WORKER_ONE_WAY_ONLY_PASS");

const content = source("attachment_delivery_wake_content.js");
assert(content.includes('message?.type !== "OZ_ATTACHMENT_DELIVERY_WAKE"'));
assert(content.includes('typeof runtime.recoverCurrent !== "function"'));
assert.equal(content.includes("sendResponse"), false);
assert.equal(content.includes("chrome.runtime.sendMessage"), false);
console.log("REG_ATTACHMENT_WAKE_CONTENT_NO_RPC_COLLISION_PASS");

let wakeListener = null;
let recoverCalls = 0;
const context = vm.createContext({
  console,
  queueMicrotask,
  globalThis: null,
  chrome: {
    runtime: {
      onMessage: {
        addListener(listener) { wakeListener = listener; }
      }
    }
  }
});
context.globalThis = context;
context.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__ = {
  disposed: false,
  recoverCurrent() { recoverCalls += 1; return Promise.resolve({ ok: true }); }
};
vm.runInContext(content, context, { filename: "attachment_delivery_wake_content.js" });
assert.equal(typeof wakeListener, "function");
assert.equal(wakeListener({ type: "UNRELATED" }), false);
await new Promise((resolveWait) => setTimeout(resolveWait, 0));
assert.equal(recoverCalls, 0);
assert.equal(wakeListener({ type: "OZ_ATTACHMENT_DELIVERY_WAKE" }), false);
await new Promise((resolveWait) => setTimeout(resolveWait, 0));
assert.equal(recoverCalls, 1);
context.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__.disposed = true;
assert.equal(wakeListener({ type: "OZ_ATTACHMENT_DELIVERY_WAKE" }), false);
await new Promise((resolveWait) => setTimeout(resolveWait, 0));
assert.equal(recoverCalls, 1);
console.log("REG_ATTACHMENT_WAKE_INVOCATION_EXACTLY_ONCE_PASS");

const portContent = source("attachment_delivery_port_content.js");
assert.match(portContent, /const RECOVERY_POLL_MS = 60_000;/);
assert(portContent.includes("runtime.recoverCurrent = recoverCurrent;"));
assert(portContent.includes('const PORT_NAME = "ozon-attachment-delivery-v1"'));
console.log("REG_ATTACHMENT_RARE_FAILSAFE_POLL_PASS");
console.log("FILE_DELIVERY_WAKE_LIFECYCLE_PASS");
