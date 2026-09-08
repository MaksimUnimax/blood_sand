import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const EXTENSION = resolve(process.argv[3] || join(ROOT, "dist-step7-candidate"));
const chromePath = process.argv[2] || process.env.CHROME_PATH || "google-chrome";
const profile = mkdtempSync(join(tmpdir(), "ozon-file-delivery-extension-smoke-"));

function unpackedExtensionId(path) {
  const hex = createHash("sha256").update(resolve(path), "utf8").digest("hex").slice(0, 32);
  return [...hex].map((character) => String.fromCharCode("a".charCodeAt(0) + parseInt(character, 16))).join("");
}

function sleep(ms) { return new Promise((resolveSleep) => setTimeout(resolveSleep, ms)); }

const expectedExtensionId = unpackedExtensionId(EXTENSION);
const chromeArgs = [
  "--no-sandbox",
  "--disable-gpu",
  "--disable-background-networking",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${profile}`,
  "--remote-debugging-pipe",
  `--disable-extensions-except=${EXTENSION}`,
  `--load-extension=${EXTENSION}`,
  "about:blank"
];
if (!process.env.DISPLAY) chromeArgs.unshift("--headless=new");

// Chromium's --remote-debugging-pipe contract is fixed to FD 3 for requests and
// FD 4 for responses. Node exposes those child descriptors as stdio[3]/stdio[4].
const child = spawn(chromePath, chromeArgs, { stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"] });
const cdpInput = child.stdio[3];
const cdpOutput = child.stdio[4];
assert(cdpInput && cdpOutput, "Chrome CDP pipe descriptors 3/4 were not created");

let stderr = "";
child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
  if (stderr.length > 200_000) stderr = stderr.slice(-200_000);
});

function cdpPipeSession() {
  let id = 0;
  let buffer = Buffer.alloc(0);
  let closed = false;
  const pending = new Map();

  function rejectAll(error) {
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(error);
    }
    pending.clear();
  }

  function consume() {
    while (true) {
      const separator = buffer.indexOf(0);
      if (separator < 0) return;
      const frame = buffer.subarray(0, separator);
      buffer = buffer.subarray(separator + 1);
      if (!frame.length) continue;
      let message;
      try {
        message = JSON.parse(frame.toString("utf8"));
      } catch (error) {
        rejectAll(new Error(`Invalid CDP pipe JSON: ${error.message}; frame=${frame.toString("utf8").slice(0, 1000)}`));
        return;
      }
      if (!message.id || !pending.has(message.id)) continue;
      const item = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(item.timer);
      if (message.error) item.reject(new Error(message.error.message || `CDP error ${message.error.code || ""}`));
      else item.resolve(message.result);
    }
  }

  cdpOutput.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
    consume();
  });
  cdpOutput.on("error", (error) => rejectAll(error));
  cdpOutput.on("close", () => {
    closed = true;
    rejectAll(new Error(`Chrome CDP output pipe closed. stderr=${stderr}`));
  });
  child.once("exit", (code, signal) => {
    closed = true;
    rejectAll(new Error(`Chrome exited code=${code} signal=${signal}. stderr=${stderr}`));
  });

  return {
    async call(method, params = {}, sessionId = null, timeoutMs = 15_000) {
      if (closed) throw new Error(`CDP pipe is closed before ${method}. stderr=${stderr}`);
      const requestId = ++id;
      const payload = { id: requestId, method, params };
      if (sessionId) payload.sessionId = sessionId;
      const promise = new Promise((resolvePending, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`Timed out waiting for CDP pipe response to ${method}. stderr=${stderr}`));
        }, timeoutMs);
        pending.set(requestId, { resolve: resolvePending, reject, timer });
      });
      cdpInput.write(`${JSON.stringify(payload)}\0`);
      return await promise;
    },
    close() {
      try { cdpInput.end(); } catch (_) {}
    }
  };
}

const browser = cdpPipeSession();

async function waitForBrowserPipe() {
  const deadline = Date.now() + 15_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const version = await browser.call("Browser.getVersion", {}, null, 2_000);
      if (version?.product) return version;
    } catch (error) {
      lastError = error;
    }
    if (child.exitCode !== null) throw new Error(`Chrome exited before CDP pipe became ready. stderr=${stderr}`);
    await sleep(100);
  }
  throw new Error(`Timed out waiting for Chrome CDP pipe. last_error=${lastError?.message || "none"} stderr=${stderr}`);
}

async function waitForServiceWorker() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const { targetInfos = [] } = await browser.call("Target.getTargets");
    const worker = targetInfos.find((target) => target.type === "service_worker" && String(target.url || "") === `chrome-extension://${expectedExtensionId}/service_worker_entry.js`);
    if (worker?.targetId) return worker;
    await sleep(100);
  }
  const { targetInfos = [] } = await browser.call("Target.getTargets").catch(() => ({ targetInfos: [] }));
  throw new Error(`Timed out waiting for activated extension service worker ${expectedExtensionId}. targets=${JSON.stringify(targetInfos)} stderr=${stderr}`);
}

async function evaluate(sessionId, expression) {
  const result = await browser.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (result?.exceptionDetails) throw new Error(`Runtime.evaluate exception: ${JSON.stringify(result.exceptionDetails)}`);
  return result?.result?.value;
}

try {
  const version = await waitForBrowserPipe();
  assert.match(String(version.product || ""), /Chrome/);
  await browser.call("Target.createTarget", { url: `chrome-extension://${expectedExtensionId}/popup.html` });
  const target = await waitForServiceWorker();
  const attached = await browser.call("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  assert(attached?.sessionId, "Target.attachToTarget did not return a sessionId");
  const sessionId = attached.sessionId;

  assert.equal(await evaluate(sessionId, `typeof OzonAIDeliveryCapabilities`), "object");
  assert.equal(await evaluate(sessionId, `OzonAIDeliveryCapabilities.TARGET_AI_IDS.length`), 8);
  assert.equal(await evaluate(sessionId, `OzonAIDeliveryCapabilities.CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS`), 1_048_000);
  assert.equal(await evaluate(sessionId, `typeof OzonFileDeliveryWorker`), "object");
  assert.equal(await evaluate(sessionId, `OzonFileDeliveryWorker.ATTACHMENT_MODE`), "attachment_watch_v1");
  assert.equal(await evaluate(sessionId, `OzonFileDeliveryWorker.PORT_NAME`), "ozon-attachment-delivery-v1");
  assert.equal(await evaluate(sessionId, `typeof indexedDB`), "object");
  assert.equal(await evaluate(sessionId, `String(ProviderTransportCore.executeTrustedReportFileOnce).includes('capturingFetch')`), true);
  const dbReady = await evaluate(sessionId, `(async()=>await new Promise((resolveDb,rejectDb)=>{const r=indexedDB.open('ozon_bridge_delivery_artifacts_v1',1);r.onerror=()=>rejectDb(r.error);r.onsuccess=()=>{const db=r.result;const ok=db.objectStoreNames.contains('artifacts');db.close();resolveDb(ok);};}))()`);
  assert.equal(dbReady, true);

  console.log(`REG_EXTENSION_ID_DERIVED=${expectedExtensionId}`);
  console.log("REG_EXTENSION_DEVTOOLS_PIPE_TRANSPORT_PASS");
  console.log("REG_EXTENSION_MV3_EVENT_ACTIVATION_PASS");
  console.log("REG_EXTENSION_MV3_SERVICE_WORKER_BOOTSTRAP_PASS");
  console.log("REG_EXTENSION_MV3_INDEXEDDB_ARTIFACT_STORE_PASS");
  console.log("REG_EXTENSION_PROVIDER_REPORT_CAPTURE_WRAPPER_ACTIVE_PASS");
  console.log("FILE_DELIVERY_EXTENSION_WORKER_SMOKE_PASS");
} finally {
  browser.close();
  try { child.kill("SIGTERM"); } catch (_) {}
  await Promise.race([new Promise((resolveExit) => child.once("exit", resolveExit)), sleep(3000)]);
  try { if (child.exitCode === null) child.kill("SIGKILL"); } catch (_) {}
  rmSync(profile, { recursive: true, force: true });
}
