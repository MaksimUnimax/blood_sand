#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const repo = path.resolve(process.argv[2] || '.');
const dist = path.join(repo, 'tooling', 'llm-api-bridges', 'ozon-seller', 'dist-step7-candidate');
const shared = path.join(dist, 'shared');
const load = (name) => vm.runInThisContext(fs.readFileSync(path.join(shared, name), 'utf8'), { filename: name });
for (const name of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_contract.js', 'ozon_guidance.js', 'mixed_batch_discovery.js']) load(name);

const runtime = globalThis.OzonRuntime.RUNTIME;
const contract = globalThis.OzonContract;
const guidance = globalThis.OzonGuidance;
const mixed = globalThis.OzonMixedBatchDiscovery;
const envelope = (operation, params) => `${runtime.commandPrefix}\n${JSON.stringify({ operation, params })}`;
const help = `${runtime.helpPrefixV2}\n${JSON.stringify({ cluster: 'finance' })}`;
const disabled = envelope('finance_transaction_list_v3', {
  filter: { date: { from: '2026-08-01T00:00:00Z', to: '2026-08-31T23:59:59Z' } },
  page: 1,
  page_size: 1000
});
const enabled = envelope('seller_product_list', { filter: {}, limit: 1 });

const rows = mixed.discover(`${help}\n${disabled}\n${enabled}`, {
  commandPrefix: runtime.commandPrefix,
  helpPrefixV1: runtime.helpPrefix,
  helpPrefixV2: runtime.helpPrefixV2,
  apiDiscover: (value) => contract.discoverCommands(value),
  parseHelp: (value) => guidance.parseHelp(value)
});
assert.deepEqual(Array.from(rows, (row) => row.kind), ['help', 'api', 'api']);
assert.equal(rows[0].help.ok, true);
assert.equal(rows[1].discovery.ok, false);
assert.equal(rows[1].discovery.code, 'OPERATION_BLOCKED');
assert.equal(rows[2].discovery.ok, true);
assert.equal(rows[2].discovery.command.operation, 'seller_product_list');
assert.ok(rows[0].marker_index < rows[1].marker_index && rows[1].marker_index < rows[2].marker_index);

const sw = fs.readFileSync(path.join(dist, 'service_worker.js'), 'utf8');
assert.match(sw, /if \(item\.kind === "api"\) return batchEntryFromDiscovery\(item\.discovery\);/);
assert.match(sw, /entry\.kind === "pre_execution_error" \|\| entry\.kind === "guidance"/);
assert.match(sw, /external_request_executed: false/);
assert.doesNotMatch(sw, /MIXED_HELP_AND_API/);

console.log('REG_MIXED_DISABLED_ALIAS_STAYS_PREEXEC_BLOCKED_PASS');
console.log('REG_MIXED_ENABLED_ALIAS_POSITIVE_CONTROL_PASS');
console.log('REG_MIXED_DISABLED_ALIAS_SOURCE_ORDER_PASS');
console.log('REG_MIXED_DISABLED_ALIAS_ZERO_PROVIDER_ADMISSION_PATH_PASS');
