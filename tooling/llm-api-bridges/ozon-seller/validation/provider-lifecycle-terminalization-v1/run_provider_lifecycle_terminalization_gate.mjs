import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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

await import(pathToFileURL(transportPath).href + `?gate=${Date.now()}`);
const core = globalThis.ProviderTransportCore;
assert.ok(core);

function hangingFetch(_url, options = {}) {
  return new Promise((_resolve, reject) => {
    const signal = options.signal;
    if (signal?.aborted) {
      const err = new Error('aborted'); err.name = 'AbortError'; reject(err); return;
    }
    signal?.addEventListener?.('abort', () => {
      const err = new Error('aborted'); err.name = 'AbortError'; reject(err);
    }, { once: true });
  });
}

function stalledBodyResponse() {
  return {
    ok: true,
    status: 200,
    headers: { get(name) { return String(name).toLowerCase() === 'content-type' ? 'application/json' : null; } },
    body: { getReader() { return { read() { return new Promise(() => {}); } }; } }
  };
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

const sellerRequest = {
  url: 'https://api-seller.ozon.ru/v3/finance/transaction/list',
  method: 'POST', headers: {}, body: '{}', response_style: 'json'
};
const performanceRequest = {
  url: 'https://api-performance.ozon.ru/api/client/statistics/json',
  method: 'POST', headers: {}, body: '{}', response_style: 'json'
};

await expectTimeout(
  () => core.executeJsonOnce({ fetchImpl: hangingFetch, request: sellerRequest, timeoutMs: 25 }),
  'seller fetch stall'
);
await expectTimeout(
  () => core.executeJsonOnce({ fetchImpl: async () => stalledBodyResponse(), request: sellerRequest, timeoutMs: 25 }),
  'seller body stall'
);
await expectTimeout(
  () => core.executePerformanceJsonOnce({ fetchImpl: hangingFetch, request: performanceRequest, timeoutMs: 25 }),
  'performance fetch stall'
);
await expectTimeout(
  () => core.executeTrustedReportFileOnce({ fetchImpl: hangingFetch, url: 'https://files.ozon.ru/report.xlsx', timeoutMs: 25 }),
  'report fetch stall'
);

let calls = 0;
const okFetch = async () => {
  calls += 1;
  const text = JSON.stringify({ result: [] });
  return {
    ok: true,
    status: 200,
    headers: { get(name) { return String(name).toLowerCase() === 'content-type' ? 'application/json' : null; } },
    body: null,
    async text() { return text; }
  };
};
const ok = await core.executeJsonOnce({ fetchImpl: okFetch, request: sellerRequest, timeoutMs: 500 });
assert.equal(ok.ok, true);
assert.equal(ok.httpStatus, 200);
assert.equal(calls, 1, 'positive control: one explicit transport execution -> one fetch');

console.log('REG_P0_PROVIDER_LIFECYCLE_STATIC_DEPENDENCY_PASS');
console.log('REG_P0_PROVIDER_SELLER_FETCH_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_SELLER_BODY_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_PERFORMANCE_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_REPORT_TIMEOUT_PASS');
console.log('REG_P0_PROVIDER_SINGLE_REQUEST_POSITIVE_CONTROL_PASS');
console.log('REG_P0_PROVIDER_LIFECYCLE_PREHANDOFF_GATE_PASS');
