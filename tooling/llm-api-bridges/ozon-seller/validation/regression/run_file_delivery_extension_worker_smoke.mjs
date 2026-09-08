import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
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

async function allocateLoopbackPort() {
  return await new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? Number(address.port) : 0;
      server.close((error) => error ? reject(error) : resolvePort(port));
    });
  });
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

const expectedExtensionId = unpackedExtensionId(EXTENSION);
const debugPort = await allocateLoopbackPort();
assert(Number.isInteger(debugPort) && debugPort > 0);
const chromeArgs = [
  "--no-sandbox",
  "--disable-gpu",
  "--disable-background-networking",
  `--user-data-dir=${profile}`,
  "--remote-debugging-address=127.0.0.1",
  `--remote-debugging-port=${debugPort}`,
  `--disable-extensions-except=${EXTENSION}`,
  `--load-extension=${EXTENSION}`,
  "about:blank"
];
if (!process.env.DISPLAY) chromeArgs.unshift("--headless=new");

const child = spawn(chromePath, chromeArgs, { stdio: ["ignore", "pipe", "pipe"] });
let stderr = "";
child.stderr.on("data", (chunk) => { stderr += chunk.toString(); if (stderr.length > 200_000) stderr = stderr.slice(-200_000); });

async function waitForDevTools(port) {
  const deadline = Date.now() + 30_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) {
        const value = await response.json();
        if (value?.webSocketDebuggerUrl) return value;
      }
    } catch (error) { lastError = error; }
    if (child.exitCode !== null) throw new Error(`Chrome exited before DevTools endpoint became ready. stderr=${stderr}`);
    await sleep(100);
  }
  throw new Error(`Timed out waiting for DevTools endpoint on ${port}. last_error=${lastError?.message || "none"} stderr=${stderr}`);
}

async function waitForServiceWorker(port) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const worker = targets.find((target) => target.type === "service_worker" && String(target.url || "") === `chrome-extension://${expectedExtensionId}/service_worker_entry.js`);
      if (worker?.webSocketDebuggerUrl) return worker;
    } catch (_) {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for activated extension service worker ${expectedExtensionId}. stderr=${stderr}`);
}

function cdpSession(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data || "{}"));
    if (!message.id || !pending.has(message.id)) return;
    const { resolve: resolvePending, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message || "CDP error"));
    else resolvePending(message.result);
  });
  const opened = new Promise((resolveOpen, reject) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", () => reject(new Error("CDP websocket open failed")), { once: true });
  });
  return {
    async call(method, params = {}) {
      await opened;
      const requestId = ++id;
      const promise = new Promise((resolvePending, reject) => pending.set(requestId, { resolve: resolvePending, reject }));
      ws.send(JSON.stringify({ id: requestId, method, params }));
      return await promise;
    },
    close() { try { ws.close(); } catch (_) {} }
  };
}

async function evaluate(session, expression) {
  const result = await session.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result?.exceptionDetails) throw new Error(`Runtime.evaluate exception: ${JSON.stringify(result.exceptionDetails)}`);
  return result?.result?.value;
}

try {
  const version = await waitForDevTools(debugPort);
  const browserSession = cdpSession(version.webSocketDebuggerUrl);
  try {
    await browserSession.call("Target.createTarget", { url: `chrome-extension://${expectedExtensionId}/popup.html` });
    const target = await waitForServiceWorker(debugPort);
    const session = cdpSession(target.webSocketDebuggerUrl);
    try {
      assert.equal(await evaluate(session, `typeof OzonAIDeliveryCapabilities`), "object");
      assert.equal(await evaluate(session, `OzonAIDeliveryCapabilities.TARGET_AI_IDS.length`), 8);
      assert.equal(await evaluate(session, `OzonAIDeliveryCapabilities.CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS`), 1_048_000);
      assert.equal(await evaluate(session, `typeof OzonFileDeliveryWorker`), "object");
      assert.equal(await evaluate(session, `OzonFileDeliveryWorker.ATTACHMENT_MODE`), "attachment_watch_v1");
      assert.equal(await evaluate(session, `typeof indexedDB`), "object");
      assert.equal(await evaluate(session, `String(ProviderTransportCore.executeTrustedReportFileOnce).includes('capturingFetch')`), true);
      const dbReady = await evaluate(session, `(async()=>await new Promise((resolveDb,rejectDb)=>{const r=indexedDB.open('ozon_bridge_delivery_artifacts_v1',1);r.onerror=()=>rejectDb(r.error);r.onsuccess=()=>{const db=r.result;const ok=db.objectStoreNames.contains('artifacts');db.close();resolveDb(ok);};}))()`);
      assert.equal(dbReady, true);
      console.log(`REG_EXTENSION_ID_DERIVED=${expectedExtensionId}`);
      console.log(`REG_EXTENSION_DEVTOOLS_EXPLICIT_PORT=${debugPort}`);
      console.log("REG_EXTENSION_MV3_EVENT_ACTIVATION_PASS");
      console.log("REG_EXTENSION_MV3_SERVICE_WORKER_BOOTSTRAP_PASS");
      console.log("REG_EXTENSION_MV3_INDEXEDDB_ARTIFACT_STORE_PASS");
      console.log("REG_EXTENSION_PROVIDER_REPORT_CAPTURE_WRAPPER_ACTIVE_PASS");
      console.log("FILE_DELIVERY_EXTENSION_WORKER_SMOKE_PASS");
    } finally {
      session.close();
    }
  } finally {
    browserSession.close();
  }
} finally {
  try { child.kill("SIGTERM"); } catch (_) {}
  await Promise.race([new Promise((resolveExit) => child.once("exit", resolveExit)), sleep(3000)]);
  try { if (child.exitCode === null) child.kill("SIGKILL"); } catch (_) {}
  rmSync(profile, { recursive: true, force: true });
}
