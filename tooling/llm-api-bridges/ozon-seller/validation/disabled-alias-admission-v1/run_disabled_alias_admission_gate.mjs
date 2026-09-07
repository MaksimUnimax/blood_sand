#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

function loadClassic(file) {
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file, displayErrors: true });
}

function extractFunction(source, functionName) {
  const marker = `function ${functionName}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${functionName}: source function missing`);
  const signatureEnd = source.indexOf(') {', start);
  assert.notEqual(signatureEnd, -1, `${functionName}: function body marker missing`);
  const braceStart = signatureEnd + 2;
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1] || '';
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
  assert.fail(`${functionName}: unterminated function`);
}

const repo = path.resolve(process.argv[2] || '.');
const base = path.join(repo, 'tooling', 'llm-api-bridges', 'ozon-seller', 'dist-step7-candidate');
const shared = path.join(base, 'shared');
for (const file of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_contract.js', 'ozon_guidance.js']) loadClassic(path.join(shared, file));

const registry = globalThis.OzonOperationRegistry;
const contract = globalThis.OzonContract;
const guidanceApi = globalThis.OzonGuidance;
assert.ok(registry && contract && guidanceApi);

const disabled = Object.entries(registry.OPERATIONS)
  .filter(([, meta]) => meta?.effect === 'READ' && meta?.execution_enabled !== true)
  .map(([alias]) => alias)
  .sort();
assert.deepEqual(disabled, [
  'fbs_carriage_available_list',
  'fbs_stock_by_warehouse_v1',
  'finance_transaction_list_v3'
]);

const cases = [
  {
    alias: 'finance_transaction_list_v3',
    params: { filter: { date: { from: '2026-08-01T00:00:00Z', to: '2026-08-31T23:59:59Z' } }, page: 1, page_size: 1000 }
  },
  { alias: 'fbs_carriage_available_list', params: { delivery_method_id: 1 } },
  { alias: 'fbs_stock_by_warehouse_v1', params: { limit: 1, sku: ['1'] } }
];

const disabledDiscoveries = [];
for (const { alias, params } of cases) {
  const command = { operation: alias, params };
  const normalized = contract.normalizeCommand(command);
  assert.equal(normalized.operation, alias, `${alias}: normalization must remain available for metadata/validation`);
  assert.throws(
    () => contract.preflightExecution(normalized),
    (error) => error?.code === 'OPERATION_BLOCKED',
    `${alias}: execution preflight must remain fail-closed`
  );
  const discovered = contract.discoverCommands(`OZON_API_V1\n${JSON.stringify(command)}`);
  assert.equal(discovered.length, 1, `${alias}: one command marker`);
  assert.equal(discovered[0]?.ok, false, `${alias}: disabled alias must not be admitted as executable command`);
  assert.equal(discovered[0]?.code, 'OPERATION_BLOCKED', `${alias}: discovery must preserve OPERATION_BLOCKED`);
  disabledDiscoveries.push(discovered[0]);
}

const positive = { operation: 'seller_product_list', params: { filter: {}, limit: 1 } };
const positiveDiscovery = contract.discoverCommands(`OZON_API_V1\n${JSON.stringify(positive)}`);
assert.equal(positiveDiscovery.length, 1);
assert.equal(positiveDiscovery[0]?.ok, true, 'enabled READ alias must remain executable-discoverable');
assert.equal(positiveDiscovery[0]?.command?.operation, positive.operation);

const sw = fs.readFileSync(path.join(base, 'service_worker.js'), 'utf8');
assert.match(sw, /return OzonContract\.discoverCommands\(source\)\.map\(batchEntryFromDiscovery\);/);
assert.match(sw, /if \(entry\?\.ok === true\) \{[\s\S]*?kind: "command"/);
assert.match(sw, /entry\.kind === "pre_execution_error" \|\| entry\.kind === "guidance"/);
assert.match(sw, /external_request_executed: false/);
assert.match(sw, /function launchBatchProcessor\(/);
assert.doesNotMatch(sw, /\bvoid\s+process(?:Manual|Auto)Batch\s*\(/);

const entryContext = vm.createContext({ OzonContract: contract, Object, String, Number, Error });
vm.runInContext(`${extractFunction(sw, 'batchErrorEntry')}; this.batchErrorEntry = batchErrorEntry;`, entryContext);
vm.runInContext(`${extractFunction(sw, 'batchEntryFromDiscovery')}; this.batchEntryFromDiscovery = batchEntryFromDiscovery;`, entryContext);
const mappedDisabled = [];
for (const discovery of disabledDiscoveries) {
  const mapped = entryContext.batchEntryFromDiscovery(discovery);
  assert.equal(mapped.kind, 'pre_execution_error');
  assert.equal(mapped.status, 'pending');
  assert.equal(mapped.error?.code, 'OPERATION_BLOCKED');
  assert.equal(mapped.external_request_executed, false);
  mappedDisabled.push(JSON.parse(JSON.stringify(mapped)));
}

// Full product-queue proof for the same disabled-finance class: execute the actual
// processBatchQueue/localGuidanceResult functions from the candidate. No command
// entry exists, so policy/capability/query/provider branches must remain unreachable.
let queueOwner = {
  operation_id: 'manual-disabled-e2e',
  status: 'requesting',
  batch: {
    phase: 'collecting',
    entries: [mappedDisabled[0]],
    next_index: 0,
    request_state: 'idle',
    request_worker_session_id: null
  }
};
const queueDiagnostics = [];
let queueFinalizeCount = 0;
let queueFailCount = 0;
let providerCallCount = 0;
const queueContext = vm.createContext({
  Promise, Object, Array, String, Number, Boolean, Math, Date, Error, Map, Set,
  crypto: globalThis.crypto,
  OzonContract: contract,
  OzonGuidance: guidanceApi,
  batchCollectionRequests: new Map(),
  normalizeConversationKey(value) { return String(value); },
  singleFlight(map, key, fn) {
    if (map.has(key)) return map.get(key);
    const request = Promise.resolve().then(fn).finally(() => { if (map.get(key) === request) map.delete(key); });
    map.set(key, request);
    return request;
  },
  async diagnostic(event, details, options) { queueDiagnostics.push({ event, details, options }); },
  async executeOzonCore() { providerCallCount += 1; throw new Error('provider path must be unreachable for disabled alias'); }
});
vm.runInContext(`${extractFunction(sw, 'localGuidanceResult')}; this.localGuidanceResult = localGuidanceResult;`, queueContext);
vm.runInContext(`${extractFunction(sw, 'processBatchQueue')}; this.processBatchQueue = processBatchQueue;`, queueContext);

const queueResult = await queueContext.processBatchQueue({
  conversationKey: 'conv-disabled-e2e',
  ownerKind: 'manual',
  ownerId: queueOwner.operation_id,
  getOwner: async () => queueOwner,
  mutateOwner: async (mutator) => { queueOwner = mutator(queueOwner); return queueOwner; },
  ownerMatches: (current) => current?.operation_id === 'manual-disabled-e2e',
  isCollecting: (current) => current?.status === 'requesting' && current?.batch?.phase === 'collecting',
  failOwner: async () => { queueFailCount += 1; },
  finalizeOwner: async (_owner, entries) => {
    queueFinalizeCount += 1;
    return { ok: true, collected: true, result_count: entries.length };
  }
});
assert.deepEqual(JSON.parse(JSON.stringify(queueResult)), { ok: true, collected: true, result_count: 1 });
assert.equal(queueFinalizeCount, 1);
assert.equal(queueFailCount, 0);
assert.equal(providerCallCount, 0);
assert.equal(queueOwner.batch.next_index, 1);
assert.equal(queueOwner.batch.request_state, 'idle');
assert.equal(queueOwner.batch.entries[0].status, 'complete');
assert.equal(queueOwner.batch.entries[0].external_request_executed, false);
assert.ok(String(queueOwner.batch.entries[0].report_text || '').length > 0);
assert.ok(queueDiagnostics.some((row) => row.event === 'GUIDANCE_ATTEMPT_CLASSIFIED'));
assert.ok(queueDiagnostics.some((row) => row.event === 'BATCH_PREEXEC_RESULT_STORED'));
assert.ok(!queueDiagnostics.some((row) => row.event === 'BATCH_REQUEST_STARTED'));

const lifecycleState = {
  manualThrow: true,
  autoThrow: true,
  manualFailures: [],
  autoFailures: [],
  diagnostics: []
};
const lifecycleContext = vm.createContext({
  Promise, Object, String, Number, Error,
  OzonContract: {
    safeBridgeErrorPayload(error) {
      return { code: String(error?.code || 'UNKNOWN'), message: String(error?.message || error || 'error') };
    }
  },
  async processManualBatch() {
    if (lifecycleState.manualThrow) throw Object.assign(new Error('manual processor boom'), { code: 'MANUAL_PROCESSOR_BOOM' });
    return { ok: true, path: 'manual' };
  },
  async processAutoBatch() {
    if (lifecycleState.autoThrow) throw Object.assign(new Error('autorun processor boom'), { code: 'AUTORUN_PROCESSOR_BOOM' });
    return { ok: true, path: 'autorun' };
  },
  async failManualBatch(conversationKey, ownerId, code, message) {
    lifecycleState.manualFailures.push({ conversationKey, ownerId, code, message });
  },
  async markRunError(conversationKey, code, message) {
    lifecycleState.autoFailures.push({ conversationKey, code, message });
  },
  normalizeConversationKey(value) { return String(value); },
  async diagnostic(event, details, options) { lifecycleState.diagnostics.push({ event, details, options }); }
});
vm.runInContext(`${extractFunction(sw, 'launchBatchProcessor')}; this.launchBatchProcessor = launchBatchProcessor;`, lifecycleContext);

const manualFailure = await lifecycleContext.launchBatchProcessor('manual', 'conv-manual', 'manual-1', 'manual_admission');
assert.equal(manualFailure.ok, false);
assert.equal(manualFailure.code, 'MANUAL_PROCESSOR_BOOM');
assert.equal(lifecycleState.manualFailures.length, 1);
assert.equal(lifecycleState.manualFailures[0].ownerId, 'manual-1');
assert.equal(lifecycleState.manualFailures[0].code, 'MANUAL_PROCESSOR_BOOM');
assert.equal(lifecycleState.diagnostics.at(-1)?.event, 'BATCH_PROCESSOR_UNCAUGHT');
assert.equal(lifecycleState.diagnostics.at(-1)?.details?.source, 'manual_admission');

const autoFailure = await lifecycleContext.launchBatchProcessor('autorun', 'conv-auto', 'auto-1', 'autorun_admission');
assert.equal(autoFailure.ok, false);
assert.equal(autoFailure.code, 'AUTORUN_PROCESSOR_BOOM');
assert.equal(lifecycleState.autoFailures.length, 1);
assert.equal(lifecycleState.autoFailures[0].conversationKey, 'conv-auto');
assert.equal(lifecycleState.autoFailures[0].code, 'AUTORUN_PROCESSOR_BOOM');

lifecycleState.manualThrow = false;
const manualSuccess = await lifecycleContext.launchBatchProcessor('manual', 'conv-manual', 'manual-2', 'manual_positive_control');
assert.deepEqual(JSON.parse(JSON.stringify(manualSuccess)), { ok: true, path: 'manual' });
assert.equal(lifecycleState.manualFailures.length, 1, 'positive control must not fail owner');

console.log('REG_DISABLED_ALIAS_REGISTRY_CLOSED_SET_PASS');
console.log('REG_DISABLED_ALIAS_NORMALIZATION_METADATA_PASS');
console.log('REG_DISABLED_ALIAS_DISCOVERY_PRE_EXECUTION_REJECT_PASS');
console.log('REG_DISABLED_ALIAS_TO_PRE_EXECUTION_ERROR_MAPPING_PASS');
console.log('REG_DISABLED_ALIAS_BATCH_LOCAL_FINALIZATION_PASS');
console.log('REG_DISABLED_ALIAS_ZERO_PROVIDER_REQUEST_E2E_PASS');
console.log('REG_DISABLED_ALIAS_ZERO_PROVIDER_PATH_STATIC_PASS');
console.log('REG_ENABLED_ALIAS_POSITIVE_CONTROL_PASS');
console.log('REG_BATCH_UNCAUGHT_MANUAL_TERMINALIZATION_PASS');
console.log('REG_BATCH_UNCAUGHT_AUTORUN_TERMINALIZATION_PASS');
console.log('REG_BATCH_PROCESSOR_POSITIVE_CONTROL_PASS');
console.log('REG_DISABLED_ALIAS_ADMISSION_GATE_PASS');
