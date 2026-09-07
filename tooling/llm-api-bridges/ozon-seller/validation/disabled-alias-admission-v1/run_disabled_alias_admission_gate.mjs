#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

function loadClassic(file) {
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file, displayErrors: true });
}

const repo = path.resolve(process.argv[2] || '.');
const base = path.join(repo, 'tooling', 'llm-api-bridges', 'ozon-seller', 'dist-step7-candidate');
const shared = path.join(base, 'shared');
for (const file of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_contract.js']) loadClassic(path.join(shared, file));

const registry = globalThis.OzonOperationRegistry;
const contract = globalThis.OzonContract;
assert.ok(registry && contract);

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
  {
    alias: 'fbs_carriage_available_list',
    params: { delivery_method_id: 1 }
  },
  {
    alias: 'fbs_stock_by_warehouse_v1',
    params: { limit: 1, sku: ['1'] }
  }
];

for (const { alias, params } of cases) {
  const command = { operation: alias, params };
  const normalized = contract.normalizeCommand(command);
  assert.equal(normalized.operation, alias, `${alias}: normalization must remain available for metadata/validation`);

  assert.throws(
    () => contract.preflightExecution(normalized),
    (error) => error?.code === 'OPERATION_BLOCKED',
    `${alias}: execution preflight must remain fail-closed`
  );

  const text = `OZON_API_V1\n${JSON.stringify(command)}`;
  const discovered = contract.discoverCommands(text);
  assert.equal(discovered.length, 1, `${alias}: one command marker`);
  assert.equal(discovered[0]?.ok, false, `${alias}: disabled alias must not be admitted as executable command`);
  assert.equal(discovered[0]?.code, 'OPERATION_BLOCKED', `${alias}: discovery must preserve OPERATION_BLOCKED`);
}

const positive = {
  operation: 'seller_product_list',
  params: { filter: {}, limit: 1 }
};
const positiveDiscovery = contract.discoverCommands(`OZON_API_V1\n${JSON.stringify(positive)}`);
assert.equal(positiveDiscovery.length, 1);
assert.equal(positiveDiscovery[0]?.ok, true, 'enabled READ alias must remain executable-discoverable');
assert.equal(positiveDiscovery[0]?.command?.operation, positive.operation);

const sw = fs.readFileSync(path.join(base, 'service_worker.js'), 'utf8');
assert.match(sw, /return OzonContract\.discoverCommands\(source\)\.map\(batchEntryFromDiscovery\);/);
assert.match(sw, /if \(entry\?\.ok === true\) \{[\s\S]*?kind: "command"/);
assert.match(sw, /entry\.kind === "pre_execution_error" \|\| entry\.kind === "guidance"/);
assert.match(sw, /external_request_executed: false/);

console.log('REG_DISABLED_ALIAS_REGISTRY_CLOSED_SET_PASS');
console.log('REG_DISABLED_ALIAS_NORMALIZATION_METADATA_PASS');
console.log('REG_DISABLED_ALIAS_DISCOVERY_PRE_EXECUTION_REJECT_PASS');
console.log('REG_DISABLED_ALIAS_ZERO_PROVIDER_PATH_STATIC_PASS');
console.log('REG_ENABLED_ALIAS_POSITIVE_CONTROL_PASS');
console.log('REG_DISABLED_ALIAS_ADMISSION_GATE_PASS');
