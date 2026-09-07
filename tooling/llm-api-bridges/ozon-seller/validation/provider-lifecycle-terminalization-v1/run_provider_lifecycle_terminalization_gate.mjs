import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const repo = process.cwd();
const base = path.join(repo, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const swPath = path.join(base, 'service_worker.js');
const transportPath = path.join(base, 'shared/provider_transport_core.js');
const sw = fs.readFileSync(swPath, 'utf8');
const transportSource = fs.readFileSync(transportPath, 'utf8');

assert.match(sw, /REG_P0_PROVIDER_LIFECYCLE_PATCH_V1\s*=\s*true/);
assert.match(sw, /const BATCH_RECOVERY_ALARM = "ozon-batch-recovery-wake-v1"/);
assert.match(sw, /function launchBatchProcessor\(/);
assert.match(sw, /async function resumeActiveBatchOperations\(/);
assert.match(sw, /launchBatchProcessor\("manual", key, operationId, "manual_admission"\)/);
assert.match(sw, /launchBatchProcessor\("autorun", key, runId, "autorun_admission"\)/);
assert.match(sw, /resumeActiveBatchOperations\(\)\.catch\(\(\) => null\)/);
assert.match(sw, /if \(!worker \|\| worker !== WORKER_SESSION_ID\)/);
assert.match(sw, /missing_worker_owner: !worker/);
assert.doesNotMatch(sw, /\bvoid\s+process(?:Manual|Auto)Batch\s*\(/);
assert.match(sw, /BATCH_PROCESSOR_UNCAUGHT/);
assert.match(sw, /REQUEST_OUTCOME_UNKNOWN_NO_RETRY/);
assert.match(transportSource, /DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS = 60_000/);
assert.match(transportSource, /PROVIDER_REQUEST_TIMEOUT/);
assert.match(transportSource, /withProviderDeadline/);
assert.match(transportSource, /\.\.\.\(signal \? \{ signal \} : \{\}\)/);

function extractFunction(source, functionName) {
  const asyncMarker = `async function ${functionName}(`;
  const syncMarker = `function ${functionName}(`;
  const asyncStart = source.indexOf(asyncMarker);
  const syncStart = source.indexOf(syncMarker);
  const start = asyncStart >= 0 ? asyncStart : syncStart;
  assert.notEqual(start, -1, `${functionName}: source function missing`);
  const signatureEnd = source.indexOf(') {', start);
  assert.notEqual(signatureEnd, -1, `${functionName}: signature terminator missing`);
  const braceStart = signatureEnd + 2;
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i], next = source[i + 1] || '';
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  assert.fail(`${functionName}: unterminated source function`);
}

function makeLifecycleRuntime(workerId, durableState) {
  const launches = [], diagnostics = [];
  const context = vm.createContext({
    console, Object, Array, Number, String, Boolean, Math, Date, Promise, Set, Map,
    WORKER_SESSION_ID: workerId,
    KEYS: { MANUAL_OPERATIONS: 'manual', AUTO_RUNS: 'auto' },
    MANUAL_OPERATION_STATUSES: { REQUESTING: 'requesting' },
    BridgeAutorunModel: { RUN_STATUSES: { COLLECTING: 'collecting' } },
    batchCollectionRequests: new Map(),
    normalizeConversationKey: (value) => String(value),
    singleFlight(map, key, fn) {
      if (map.has(key)) return map.get(key);
      const request = Promise.resolve().then(fn).finally(() => { if (map.get(key) === request) map.delete(key); });
      map.set(key, request);
      return request;
    },
    async storageGet() { return JSON.parse(JSON.stringify(durableState)); },
    launchBatchProcessor(kind, conversationKey, ownerId, source) {
      launches.push({ kind, conversationKey, ownerId, source });
      return Promise.resolve({ ok: true });
    },
    async diagnostic(event, details) { diagnostics.push({ event, details }); },
    ensureBatchLocalPolicy: async () => ({ ok: true }),
    ensureBatchCapabilityAndPlanning: async () => ({ ok: true }),
    ensureBatchQueryPlanning: async () => ({ ok: true }),
    localGuidanceResult() { throw new Error('not reached'); },
    buildPersonalDataPolicyErrorResult() { throw new Error('not reached'); },
    buildCapabilityPlanningErrorResult() { throw new Error('not reached'); },
    findBatchQueryGroup() { return null; },
    readAnalyticsResultCacheForCurrentSettings: async () => ({ hit: false }),
    OzonContract: { reviewedAnalyticsAcquisitionProfile(command) { return { applicable: false, command }; } },
    acquisitionPlanning: (value) => value || null,
    prepareProviderQuotaForCommand: async () => ({ required: false, allowed: true, quota: null }),
    safeQuotaMetadata: () => null,
    buildExecutionErrorResult() { throw new Error('not reached'); },
    executeOzonCore() { throw new Error('provider must not execute in stale requesting recovery control'); },
    storeAnalyticsResultCacheForCurrentSettings: async () => false,
    projectPrefetchedSingleResult: (value) => value,
    persistBatchQuotaWait: async () => false,
    buildCachedSingleResult() { throw new Error('not reached'); }
  });
  vm.runInContext(`${extractFunction(sw, 'resumeActiveBatchOperations')}; this.resumeActiveBatchOperations = resumeActiveBatchOperations;`, context);
  vm.runInContext(`${extractFunction(sw, 'processBatchQueue')}; this.processBatchQueue = processBatchQueue;`, context);
  return { context, launches, diagnostics };
}

const durablePending = {
  manual: { 'conv-manual': { operation_id: 'manual-op-1', status: 'requesting', batch: { request_state: 'idle', entries: [{ kind: 'command', status: 'pending' }] } } },
  auto: { 'conv-auto': { run_id: 'auto-run-1', status: 'collecting', batch: { request_state: 'idle', entries: [{ kind: 'command', status: 'pending' }] } } }
};
const freshRuntime = makeLifecycleRuntime('worker-B', durablePending);
const resumed = await freshRuntime.context.resumeActiveBatchOperations();
assert.deepEqual(JSON.parse(JSON.stringify(resumed)), { manual_count: 1, autorun_count: 1 });
assert.deepEqual(freshRuntime.launches, [
  { kind: 'manual', conversationKey: 'conv-manual', ownerId: 'manual-op-1', source: 'worker_recovery' },
  { kind: 'autorun', conversationKey: 'conv-auto', ownerId: 'auto-run-1', source: 'worker_recovery' }
]);

async function runRequestingRecovery(workerOwner) {
  const runtime = makeLifecycleRuntime('worker-B', { manual: {}, auto: {} });
  const owner = { operation_id: 'manual-op-recovery', status: 'requesting', batch: { next_index: 0, request_state: 'requesting', request_worker_session_id: workerOwner, entries: [{ kind: 'recovery_control', status: 'requesting' }] } };
  let failCount = 0, failCode = null;
  const result = await runtime.context.processBatchQueue({
    conversationKey: 'conv-recovery', ownerKind: 'manual', ownerId: owner.operation_id,
    getOwner: async () => owner, mutateOwner: async () => owner,
    ownerMatches: (value) => value === owner, isCollecting: () => true,
    failOwner: async (code) => { failCount += 1; failCode = code; },
    finalizeOwner: async () => ({ ok: true })
  });
  return { result: JSON.parse(JSON.stringify(result)), failCount, failCode, diagnostics: runtime.diagnostics };
}

const oldWorker = await runRequestingRecovery('worker-A');
assert.equal(oldWorker.result.code, 'REQUEST_OUTCOME_UNKNOWN_NO_RETRY');
assert.equal(oldWorker.failCount, 1);
assert.equal(oldWorker.failCode, 'REQUEST_OUTCOME_UNKNOWN_NO_RETRY');
assert.equal(oldWorker.diagnostics.at(-1)?.event, 'REQUEST_RECOVERY_BLOCKED_NO_RETRY');
assert.equal(oldWorker.diagnostics.at(-1)?.details?.missing_worker_owner, false);
const missingWorker = await runRequestingRecovery('');
assert.equal(missingWorker.result.code, 'REQUEST_OUTCOME_UNKNOWN_NO_RETRY');
assert.equal(missingWorker.failCount, 1);
assert.equal(missingWorker.diagnostics.at(-1)?.details?.missing_worker_owner, true);
const sameWorker = await runRequestingRecovery('worker-B');
assert.equal(sameWorker.result.code, 'REQUEST_IN_PROGRESS');
assert.equal(sameWorker.failCount, 0);

await import(pathToFileURL(transportPath).href + `?gate=${Date.now()}`);
const core = globalThis.ProviderTransportCore;
assert.ok(core);
function hangingFetch(_url, options = {}) {
  return new Promise((_resolve, reject) => {
    const signal = options.signal;
    if (signal?.aborted) { const err = new Error('aborted'); err.name = 'AbortError'; reject(err); return; }
    signal?.addEventListener?.('abort', () => { const err = new Error('aborted'); err.name = 'AbortError'; reject(err); }, { once: true });
  });
}
function stalledBodyResponse() {
  return { ok: true, status: 200, headers: { get(name) { return String(name).toLowerCase() === 'content-type' ? 'application/json' : null; } }, body: { getReader() { return { read() { return new Promise(() => {}); } }; } } };
}
async function expectTimeout(promiseFactory, label) {
  const started = Date.now();
  await assert.rejects(promiseFactory, (error) => {
    assert.equal(error?.code, 'PROVIDER_REQUEST_TIMEOUT', `${label}: code`);
    assert.equal(error?.external_request_executed, true, `${label}: external request accounting`);
    assert.equal(error?.request_attempted, true, `${label}: request attempted`);
    return true;
  });
  assert.ok(Date.now() - started < 1000, `${label}: timeout must be bounded in deterministic test`);
}
const sellerRequest = { url: 'https://api-seller.ozon.ru/v3/finance/transaction/list', method: 'POST', headers: {}, body: '{}', response_style: 'json' };
const performanceRequest = { url: 'https://api-performance.ozon.ru/api/client/statistics/json', method: 'POST', headers: {}, body: '{}', response_style: 'json' };
await expectTimeout(() => core.executeJsonOnce({ fetchImpl: hangingFetch, request: sellerRequest, timeoutMs: 25 }), 'seller fetch stall');
await expectTimeout(() => core.executeJsonOnce({ fetchImpl: async () => stalledBodyResponse(), request: sellerRequest, timeoutMs: 25 }), 'seller body stall');
await expectTimeout(() => core.executePerformanceJsonOnce({ fetchImpl: hangingFetch, request: performanceRequest, timeoutMs: 25 }), 'performance fetch stall');
await expectTimeout(() => core.executeTrustedReportFileOnce({ fetchImpl: hangingFetch, url: 'https://files.ozon.ru/report.xlsx', timeoutMs: 25 }), 'report fetch stall');
let calls = 0;
const okFetch = async () => { calls += 1; const text = JSON.stringify({ result: [] }); return { ok: true, status: 200, headers: { get(name) { return String(name).toLowerCase() === 'content-type' ? 'application/json' : null; } }, body: null, async text() { return text; } }; };
const ok = await core.executeJsonOnce({ fetchImpl: okFetch, request: sellerRequest, timeoutMs: 500 });
assert.equal(ok.ok, true);
assert.equal(ok.httpStatus, 200);
assert.equal(calls, 1);

console.log('REG_P0_PROVIDER_LIFECYCLE_STATIC_DEPENDENCY_PASS');
console.log('REG_P0_PROVIDER_FRESH_WORKER_PENDING_RESUME_PASS');
console.log('REG_P0_PROVIDER_FRESH_WORKER_REQUESTING_FAIL_CLOSED_PASS');
console.log('REG_P0_PROVIDER_MISSING_WORKER_OWNER_FAIL_CLOSED_PASS');
console.log('REG_P0_PROVIDER_SAME_WORKER_NO_DUPLICATE_CLAIM_PASS');
console.log('REG_P0_PROVIDER_SELLER_FETCH_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_SELLER_BODY_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_PERFORMANCE_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_REPORT_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_SINGLE_REQUEST_POSITIVE_CONTROL_PASS');
console.log('REG_P0_PROVIDER_LIFECYCLE_PREHANDOFF_GATE_PASS');
