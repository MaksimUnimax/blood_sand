import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  closeSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const REQUIRED_NODE = 'v24.12.0';
const REQUIRED_PUPPETEER = '25.4.0';
const REQUIRED_CFT_FILES = 308;
const REQUIRED_CFT_DIGEST = 'd7b8a2b0c29abcbfba85ea3296097af3bef45c0b2b60c98055d523b9c';
const DEFAULT_QA_ROOT = 'D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa';
const DEFAULT_CFT_RELATIVE = path.join('chrome', 'win64-151.0.7922.47', 'chrome-win64');
const SYNTHETIC_CHATGPT_URL = 'https://chatgpt.com/c/00000000-0000-4000-8000-000000000019';
const PROVIDER_FETCH_PATTERNS = [
  { urlPattern: 'https://api-seller.ozon.ru/*', requestStage: 'Request' },
  { urlPattern: 'https://api-performance.ozon.ru/*', requestStage: 'Request' },
];

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) fail(`unexpected argument: ${token}`);
    const key = token.slice(2);
    if (!key) fail('empty argument name');
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) fail(`missing value for --${key}`);
    out[key] = value;
    i += 1;
  }
  return out;
}

function sha256File(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function inventory(root, { skipGit = false } = {}) {
  const records = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (skipGit && name === '.git') continue;
      const full = path.join(dir, name);
      const st = lstatSync(full);
      if (st.isDirectory()) {
        walk(full);
      } else if (st.isFile()) {
        records.push({
          path: path.relative(root, full).split(path.sep).join('/'),
          size: st.size,
          sha256: sha256File(full),
        });
      }
    }
  };
  walk(root);
  records.sort((a, b) => a.path.localeCompare(b.path));
  const text = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  return {
    records,
    text,
    digest: createHash('sha256').update(text, 'utf8').digest('hex'),
  };
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readDevToolsActivePort(portFile, timeoutMs, stderrFile) {
  const started = Date.now();
  let lastTransient = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const lines = readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
      const port = Number(lines[0]);
      const wsPath = String(lines[1] || '').trim();
      if (Number.isInteger(port) && port > 0 && wsPath.startsWith('/')) {
        const endpoint = `http://127.0.0.1:${port}`;
        try {
          const response = await fetch(`${endpoint}/json/version`);
          if (response.ok) return { port, wsPath, endpoint };
        } catch {}
      }
    } catch (error) {
      lastTransient = String(error?.code || error?.message || '');
    }
    await wait(50);
  }
  let stderr = '';
  try { stderr = readFileSync(stderrFile, 'utf8').slice(-2000); } catch {}
  fail(`DevToolsActivePort timeout${lastTransient ? ` after ${lastTransient}` : ''}: ${stderr}`);
}

class RawCdp {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect(timeoutMs = 10000) {
    if (typeof WebSocket !== 'function') fail('Node WebSocket global is unavailable');
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`CDP websocket open timeout: ${this.url}`)), timeoutMs);
      this.ws.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.ws.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error(`CDP websocket open failed: ${this.url}`));
      }, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      let message;
      try { message = JSON.parse(String(event.data)); } catch { return; }
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message || JSON.stringify(message.error)}`));
        else pending.resolve(message.result || {});
        return;
      }
      const handlers = this.listeners.get(message.method);
      if (!handlers) return;
      for (const handler of [...handlers]) {
        try { handler(message.params || {}, message); } catch {}
      }
    });
    this.ws.addEventListener('close', () => {
      for (const [id, pending] of this.pending) {
        clearTimeout(pending.timer);
        pending.reject(new Error(`CDP websocket closed while waiting for ${pending.method} (#${id})`));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, sessionId = null, timeoutMs = 30000) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) fail(`CDP websocket not open for ${method}`);
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timeout: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer, method });
      this.ws.send(JSON.stringify(payload));
    });
  }

  on(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(handler);
    return () => this.listeners.get(method)?.delete(handler);
  }

  close() {
    try { this.ws?.close(); } catch {}
  }
}

async function findWorkerTarget(cdp, extensionId, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { targetInfos = [] } = await cdp.send('Target.getTargets');
    const target = targetInfos.find((info) =>
      info.type === 'service_worker' &&
      String(info.url || '').startsWith(`chrome-extension://${extensionId}/`)
    );
    if (target) return target;
    await wait(100);
  }
  return null;
}

async function wakeWorkerWithSyntheticPage(cdp, extensionId) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const errors = [];
  const syntheticHtml = `<!doctype html><html><head><meta charset="utf-8"><link rel="canonical" href="${SYNTHETIC_CHATGPT_URL}"></head><body><main id="conversation"></main><form id="composer-background"><textarea id="prompt-textarea" data-testid="prompt-textarea"></textarea><button type="button" data-testid="send-button" aria-label="Send">Send</button></form></body></html>`;
  const syntheticBody = Buffer.from(syntheticHtml, 'utf8').toString('base64');

  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] }, sessionId);

  const off = cdp.on('Fetch.requestPaused', (params, message) => {
    if (message.sessionId !== sessionId) return;
    void (async () => {
      try {
        if (params.request?.url === SYNTHETIC_CHATGPT_URL && params.resourceType === 'Document') {
          await cdp.send('Fetch.fulfillRequest', {
            requestId: params.requestId,
            responseCode: 200,
            responseHeaders: [
              { name: 'Content-Type', value: 'text/html; charset=utf-8' },
              { name: 'Cache-Control', value: 'no-store' },
            ],
            body: syntheticBody,
          }, sessionId);
        } else {
          await cdp.send('Fetch.failRequest', {
            requestId: params.requestId,
            errorReason: 'BlockedByClient',
          }, sessionId);
        }
      } catch (error) {
        errors.push(String(error?.stack || error));
      }
    })();
  });

  try {
    await cdp.send('Page.navigate', { url: SYNTHETIC_CHATGPT_URL }, sessionId);
    const worker = await findWorkerTarget(cdp, extensionId, 20000);
    if (errors.length) fail(`synthetic wake interception errors: ${errors.join(' | ')}`);
    return worker;
  } finally {
    off();
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
  }
}

const cli = parseArgs(process.argv.slice(2));
const candidateDir = path.resolve(cli.candidate || '');
if (!candidateDir || !existsSync(path.join(candidateDir, 'manifest.json'))) {
  fail('usage: node OZON_GENERIC_SESSION_LAUNCHER.mjs --candidate <candidateDir> [--qa-root <path>] [--session-root <path>] [--expected-version <version>] [--expected-worker-sha <sha256>] [--expected-content-sha <sha256>] [--expected-file-count <n>]');
}

requireEqual(process.version, REQUIRED_NODE, 'Node version');

const qaRoot = path.resolve(cli['qa-root'] || DEFAULT_QA_ROOT);
const cftSource = path.join(qaRoot, DEFAULT_CFT_RELATIVE);
const puppeteerPackage = path.join(qaRoot, 'node_modules', 'puppeteer', 'package.json');
if (!existsSync(cftSource)) fail(`qualified CFT source missing: ${cftSource}`);
if (!existsSync(puppeteerPackage)) fail(`Puppeteer package missing: ${puppeteerPackage}`);
const puppeteerVersion = JSON.parse(readFileSync(puppeteerPackage, 'utf8')).version;
requireEqual(puppeteerVersion, REQUIRED_PUPPETEER, 'Puppeteer version');

const manifest = JSON.parse(readFileSync(path.join(candidateDir, 'manifest.json'), 'utf8'));
if (cli['expected-version']) requireEqual(String(manifest.version), cli['expected-version'], 'candidate manifest version');
if (cli['expected-worker-sha']) requireEqual(sha256File(path.join(candidateDir, 'service_worker.js')), cli['expected-worker-sha'].toLowerCase(), 'candidate worker SHA-256');
if (cli['expected-content-sha']) requireEqual(sha256File(path.join(candidateDir, 'content_script.js')), cli['expected-content-sha'].toLowerCase(), 'candidate content SHA-256');

const candidateBefore = inventory(candidateDir, { skipGit: true });
if (cli['expected-file-count']) requireEqual(candidateBefore.records.length, Number(cli['expected-file-count']), 'candidate regular-file count');

const sourceInventory = inventory(cftSource);
requireEqual(sourceInventory.records.length, REQUIRED_CFT_FILES, 'source CFT regular-file count');
requireEqual(sourceInventory.digest, REQUIRED_CFT_DIGEST, 'source CFT canonical inventory digest');

const sessionRoot = cli['session-root']
  ? path.resolve(cli['session-root'])
  : mkdtempSync(path.join(os.tmpdir(), 'ozon-generic-session-'));
if (existsSync(sessionRoot) && readdirSync(sessionRoot).length > 0) {
  fail(`session root must be empty: ${sessionRoot}`);
}
mkdirSync(sessionRoot, { recursive: true });

const copiedBrowserDir = path.join(sessionRoot, 'chrome-win64');
const profileDir = path.join(sessionRoot, 'profile');
const diagnosticsDir = path.join(sessionRoot, 'diagnostics');
mkdirSync(profileDir, { recursive: true });
mkdirSync(diagnosticsDir, { recursive: true });

writeFileSync(path.join(sessionRoot, 'cft-source-inventory.json'), JSON.stringify(sourceInventory.records, null, 2) + '\n', 'utf8');
cpSync(cftSource, copiedBrowserDir, { recursive: true, force: true, errorOnExist: false });

const copiedBeforeSetup = inventory(copiedBrowserDir);
requireEqual(copiedBeforeSetup.text, sourceInventory.text, 'source/copy canonical CFT inventory');

const setupExe = path.join(copiedBrowserDir, 'setup.exe');
const chromeExe = path.join(copiedBrowserDir, 'chrome.exe');
if (!existsSync(setupExe) || !existsSync(chromeExe)) fail('copied CFT setup.exe/chrome.exe missing');

const setup = spawnSync(setupExe, [`--configure-browser-in-directory=${copiedBrowserDir}`], {
  cwd: copiedBrowserDir,
  shell: false,
  windowsHide: true,
  encoding: 'utf8',
});
requireEqual(setup.status, 78, 'copied CFT setup exit code');

const copiedAfterSetup = inventory(copiedBrowserDir);
requireEqual(copiedAfterSetup.text, sourceInventory.text, 'post-setup/source canonical CFT inventory');
writeFileSync(path.join(sessionRoot, 'cft-copy-inventory.json'), JSON.stringify(copiedAfterSetup.records, null, 2) + '\n', 'utf8');

const chromeArgs = [
  `--user-data-dir=${profileDir}`,
  '--remote-debugging-port=0',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-sync',
  '--metrics-recording-only',
  '--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0',
  '--no-sandbox',
  'about:blank',
];

const stdoutPath = path.join(diagnosticsDir, 'chrome.stdout.log');
const stderrPath = path.join(diagnosticsDir, 'chrome.stderr.log');
const stdoutFd = openSync(stdoutPath, 'a');
const stderrFd = openSync(stderrPath, 'a');
const child = spawn(chromeExe, chromeArgs, {
  cwd: copiedBrowserDir,
  detached: true,
  windowsHide: true,
  shell: false,
  stdio: ['ignore', stdoutFd, stderrFd],
});
closeSync(stdoutFd);
closeSync(stderrFd);
child.unref();

const activePort = path.join(profileDir, 'DevToolsActivePort');
const devtools = await readDevToolsActivePort(activePort, 30000, stderrPath);
const browserWebSocketEndpoint = `ws://127.0.0.1:${devtools.port}${devtools.wsPath}`;

const requireFromQa = createRequire(path.join(qaRoot, 'package.json'));
const puppeteer = requireFromQa('puppeteer');
if (typeof puppeteer?.connect !== 'function') fail('qualified Puppeteer connect() unavailable');

const browser = await puppeteer.connect({ browserURL: devtools.endpoint, protocolTimeout: 300000 });
let extensionId = null;
let extensionInventory = null;
let workerTarget = null;
let workerRuntimeValue = null;
let workerFetchEnable = false;
let rawCdp = null;

try {
  if (typeof browser.installExtension !== 'function') fail('Puppeteer browser.installExtension() unavailable');
  if (typeof browser.extensions !== 'function') fail('Puppeteer browser.extensions() unavailable');

  extensionId = await browser.installExtension(candidateDir);
  const extensions = await browser.extensions();
  const extension = extensions.get(extensionId);
  if (!extension) fail(`installed extension missing from browser.extensions(): ${extensionId}`);
  extensionInventory = {
    id: extension.id,
    name: extension.name,
    version: extension.version,
    path: extension.path,
  };
  if (cli['expected-version']) requireEqual(String(extension.version), cli['expected-version'], 'browser extension version');

  rawCdp = new RawCdp(browserWebSocketEndpoint);
  await rawCdp.connect();
  await rawCdp.send('Target.setDiscoverTargets', { discover: true });

  workerTarget = await findWorkerTarget(rawCdp, extensionId, 3000);
  if (!workerTarget) workerTarget = await wakeWorkerWithSyntheticPage(rawCdp, extensionId);
  if (!workerTarget) fail('exact candidate service worker target could not be acquired');

  const { sessionId: workerSessionId } = await rawCdp.send('Target.attachToTarget', {
    targetId: workerTarget.targetId,
    flatten: true,
  });
  await rawCdp.send('Runtime.enable', {}, workerSessionId);
  const runtime = await rawCdp.send('Runtime.evaluate', {
    expression: '1+1',
    awaitPromise: true,
    returnByValue: true,
  }, workerSessionId);
  if (runtime.exceptionDetails) fail(`worker Runtime.evaluate failed: ${runtime.exceptionDetails.text || 'exception'}`);
  workerRuntimeValue = runtime.result?.value;
  requireEqual(workerRuntimeValue, 2, 'worker Runtime.evaluate(1+1)');

  await rawCdp.send('Network.enable', {}, workerSessionId);
  await rawCdp.send('Fetch.enable', { patterns: PROVIDER_FETCH_PATTERNS }, workerSessionId);
  workerFetchEnable = true;
} finally {
  rawCdp?.close();
  await browser.disconnect();
}

const candidateAfter = inventory(candidateDir, { skipGit: true });
requireEqual(candidateAfter.text, candidateBefore.text, 'candidate byte inventory after session acquisition');

let browserAlive = false;
try {
  process.kill(child.pid, 0);
  const response = await fetch(`${devtools.endpoint}/json/version`);
  browserAlive = response.ok;
} catch {}
if (!browserAlive) fail('browser/CDP endpoint did not remain alive after launcher disconnect');

const metadata = {
  schema: 'ozon-generic-session-v1',
  createdAt: new Date().toISOString(),
  node: process.version,
  puppeteer: puppeteerVersion,
  cft: '151.0.7922.47',
  cftSource,
  cftSourceFiles: sourceInventory.records.length,
  cftSourceDigest: sourceInventory.digest,
  copiedBrowserDir,
  setupExitCode: setup.status,
  profileDir,
  sessionRoot,
  chromePid: child.pid,
  chromeArgs,
  endpoint: devtools.endpoint,
  browserWebSocketEndpoint,
  candidateDir,
  candidateFileCount: candidateBefore.records.length,
  candidateDigest: candidateBefore.digest,
  candidateManifestVersion: manifest.version,
  extension: extensionInventory,
  worker: {
    targetId: workerTarget.targetId,
    url: workerTarget.url,
    runtimeEvaluate1Plus1: workerRuntimeValue,
    networkEnable: true,
    fetchEnable: workerFetchEnable,
  },
  browserAliveAfterDisconnect: browserAlive,
  safety: {
    realOzonRequests: 0,
    realPerformanceRequests: 0,
    realChatgptRequestsDuringSyntheticWake: 0,
    productionModifications: 0,
    candidateModifications: 0,
  },
  diagnostics: {
    stdout: stdoutPath,
    stderr: stderrPath,
    activePort,
  },
};

const metadataPath = path.join(sessionRoot, 'session.json');
writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({
  marker: 'OZON_GENERIC_SESSION_READY',
  metadataPath,
  endpoint: metadata.endpoint,
  browserWebSocketEndpoint: metadata.browserWebSocketEndpoint,
  chromePid: metadata.chromePid,
  extensionId: metadata.extension.id,
  extensionVersion: metadata.extension.version,
  workerUrl: metadata.worker.url,
}, null, 2));
