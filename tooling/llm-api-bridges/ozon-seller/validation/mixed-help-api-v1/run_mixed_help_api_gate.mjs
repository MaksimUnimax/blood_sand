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
const root = path.join(repo, 'tooling', 'llm-api-bridges', 'ozon-seller');
const dist = path.join(root, 'dist-step7-candidate');
const shared = path.join(dist, 'shared');

for (const file of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_contract.js', 'ozon_guidance.js', 'mixed_batch_discovery.js']) {
  loadClassic(path.join(shared, file));
}

const runtime = globalThis.OzonRuntime?.RUNTIME;
const contract = globalThis.OzonContract;
const guidance = globalThis.OzonGuidance;
const mixed = globalThis.OzonMixedBatchDiscovery;
assert.ok(runtime && contract && guidance && mixed, 'mixed discovery dependencies must load');

const api = (operation, params) => `${runtime.commandPrefix}\n${JSON.stringify({ operation, params })}`;
const help2 = (cluster) => `${runtime.helpPrefixV2}\n${JSON.stringify({ cluster })}`;
const discover = (source) => mixed.discover(source, {
  commandPrefix: runtime.commandPrefix,
  helpPrefixV1: runtime.helpPrefix,
  helpPrefixV2: runtime.helpPrefixV2,
  apiDiscover: (value) => contract.discoverCommands(value),
  parseHelp: (value) => guidance.parseHelp(value)
});

const firstApi = api('seller_product_list', { filter: {}, limit: 1 });
const secondApi = api('stocks_current', { filter: {}, limit: 1 });

const helpThenApi = discover(`before\n${help2('finance')}\nbetween\n${firstApi}\nafter`);
assert.deepEqual(helpThenApi.map((entry) => entry.kind), ['help', 'api']);
assert.equal(helpThenApi[0].help.ok, true);
assert.equal(helpThenApi[0].help.cluster, 'finance');
assert.equal(helpThenApi[1].discovery.ok, true);
assert.equal(helpThenApi[1].discovery.command.operation, 'seller_product_list');
assert.ok(helpThenApi[0].marker_index < helpThenApi[1].marker_index);
console.log('REG_MIXED_HELP_API_HELP_THEN_API_ORDER_PASS');

const apiThenHelp = discover(`${firstApi}\n${help2('stocks_inventory')}`);
assert.deepEqual(apiThenHelp.map((entry) => entry.kind), ['api', 'help']);
assert.equal(apiThenHelp[1].help.cluster, 'stocks_inventory');
console.log('REG_MIXED_HELP_API_API_THEN_HELP_ORDER_PASS');

const alternating = discover([
  '```text', firstApi, '```',
  'ordinary prose',
  '```text', help2('finance'), '```',
  'more prose',
  '```text', secondApi, '```',
  '```text', help2('reviews_questions'), '```'
].join('\n'));
assert.deepEqual(alternating.map((entry) => entry.kind), ['api', 'help', 'api', 'help']);
assert.deepEqual(alternating.filter((entry) => entry.kind === 'api').map((entry) => entry.discovery.command.operation), ['seller_product_list', 'stocks_current']);
assert.deepEqual(alternating.filter((entry) => entry.kind === 'help').map((entry) => entry.help.cluster), ['finance', 'reviews_questions']);
for (let index = 1; index < alternating.length; index += 1) assert.ok(alternating[index - 1].marker_index < alternating[index].marker_index);
console.log('REG_MIXED_HELP_API_ALTERNATING_SOURCE_ORDER_PASS');

const apiOnly = discover(`${firstApi}\n${secondApi}`);
assert.deepEqual(apiOnly.map((entry) => entry.kind), ['api', 'api']);
assert.ok(apiOnly.every((entry) => entry.discovery.ok));
console.log('REG_MIXED_HELP_API_API_ONLY_UNCHANGED_PASS');

const helpOnly = discover(`${help2('finance')}\n${help2('stocks_inventory')}`);
assert.deepEqual(helpOnly.map((entry) => entry.kind), ['help', 'help']);
assert.ok(helpOnly.every((entry) => entry.help.ok));
console.log('REG_MIXED_HELP_API_MULTI_HELP_PASS');

const malformedHelpThenApi = discover(`OZON_HELP_V2 nope\n${firstApi}`);
assert.deepEqual(malformedHelpThenApi.map((entry) => entry.kind), ['help', 'api']);
assert.equal(malformedHelpThenApi[0].help.ok, false);
assert.equal(malformedHelpThenApi[0].help.code, 'HELP_JSON_REQUIRED');
assert.equal(malformedHelpThenApi[1].discovery.ok, true);
console.log('REG_MIXED_HELP_API_MALFORMED_HELP_ISOLATED_PASS');

const malformedApiThenHelp = discover(`OZON_API_V1\n${JSON.stringify({ operation: 'seller_product_list', args: {} })}\n${help2('finance')}`);
assert.deepEqual(malformedApiThenHelp.map((entry) => entry.kind), ['api', 'help']);
assert.equal(malformedApiThenHelp[0].discovery.ok, false);
assert.equal(malformedApiThenHelp[0].discovery.code, 'UNKNOWN_TOP_LEVEL_FIELD');
assert.equal(malformedApiThenHelp[1].help.ok, true);
console.log('REG_MIXED_HELP_API_MALFORMED_API_ISOLATED_PASS');

const embeddedApiMarker = discover(`OZON_HELP_V2\n${JSON.stringify({ cluster: 'finance', section: 'OZON_API_V1' })}`);
assert.equal(embeddedApiMarker.length, 1, 'marker text inside a balanced HELP JSON object must not become another envelope');
assert.equal(embeddedApiMarker[0].kind, 'help');
assert.equal(embeddedApiMarker[0].help.ok, false);
console.log('REG_MIXED_HELP_API_BALANCED_OBJECT_MARKER_ISOLATION_PASS');

const localGuidance = guidance.result({ status: 'cluster_selected', cluster: 'finance', version: 2 });
assert.equal(localGuidance.external_request_executed, false);
assert.equal(localGuidance.physical_business_request_count, 0);
console.log('REG_MIXED_HELP_API_GUIDANCE_ZERO_PROVIDER_REQUEST_PASS');

const entrySource = fs.readFileSync(path.join(dist, 'service_worker_entry.js'), 'utf8');
const mixedImportIndex = entrySource.indexOf('shared/mixed_batch_discovery.js');
const workerImportIndex = entrySource.indexOf('service_worker.js');
assert.ok(mixedImportIndex >= 0 && workerImportIndex > mixedImportIndex, 'mixed discovery helper must load before legacy worker');

const workerSource = fs.readFileSync(path.join(dist, 'service_worker.js'), 'utf8');
assert.doesNotMatch(workerSource, /MIXED_HELP_AND_API/, 'blanket mixed HELP/API rejection must be removed from executable worker');
assert.match(workerSource, /OzonMixedBatchDiscovery\.discover\(/, 'worker discovery must use ordered typed discovery');
const fnStart = workerSource.indexOf('function discoverBatchEntries(text) {');
const fnEnd = workerSource.indexOf('\nfunction batchEntryFromDiscovery', fnStart);
assert.ok(fnStart >= 0 && fnEnd > fnStart, 'discoverBatchEntries function must be extractable');
const discoverFunctionSource = workerSource.slice(fnStart, fnEnd);

const integrationContext = vm.createContext({
  OzonRuntime: globalThis.OzonRuntime,
  OzonContract: contract,
  OzonGuidance: guidance,
  OzonMixedBatchDiscovery: mixed,
  batchErrorEntry: (error) => ({ kind: 'pre_execution_error', code: String(error?.code || 'ERROR') }),
  batchEntryFromDiscovery: (entry) => entry.ok
    ? ({ kind: 'command', operation: entry.command.operation, command: entry.command })
    : ({ kind: 'pre_execution_error', code: entry.code })
});
vm.runInContext(`${discoverFunctionSource}\nthis.__discoverBatchEntries = discoverBatchEntries;`, integrationContext);
const integrated = integrationContext.__discoverBatchEntries(`${help2('finance')}\n${firstApi}\n${help2('stocks_inventory')}\n${secondApi}`);
assert.deepEqual(integrated.map((entry) => entry.kind), ['guidance', 'command', 'guidance', 'command']);
assert.deepEqual(integrated.filter((entry) => entry.kind === 'command').map((entry) => entry.operation), ['seller_product_list', 'stocks_current']);
assert.ok(integrated.filter((entry) => entry.kind === 'guidance').every((entry) => entry.external_request_executed === false));
console.log('REG_MIXED_HELP_API_WORKER_MAPPING_PASS');

const prompt = globalThis.OzonRuntime.DEFAULT_AUTO_START_TEXT;
assert.match(prompt, /Граница команды — envelope/i);
assert.match(prompt, /OZON_HELP_V2.*OZON_API_V1.*одном ответе/i);
assert.match(prompt, /HELP.*не выполняет provider business request/i);
assert.match(prompt, /зависим/i);
assert.match(prompt, /свеж/i);
console.log('REG_MIXED_HELP_API_START_PROMPT_CONTRACT_PASS');

for (const name of ['START_PROMPT_CURRENT.md', 'BRIDGE_RESPONSE_FORMS_CURRENT.md', 'AI_TEST_REPORT_FORMAT_CURRENT.md']) {
  assert.ok(fs.existsSync(path.join(root, name)), `current authority document missing: ${name}`);
}
const responseForms = fs.readFileSync(path.join(root, 'BRIDGE_RESPONSE_FORMS_CURRENT.md'), 'utf8');
assert.match(responseForms, /code block.*not.*command boundary/i);
assert.match(responseForms, /HELP.*API.*same assistant response/i);
assert.match(responseForms, /source order/i);
const reportFormat = fs.readFileSync(path.join(root, 'AI_TEST_REPORT_FORMAT_CURRENT.md'), 'utf8');
assert.match(reportFormat, /GATE-01.*GATE-35/s);
assert.match(reportFormat, /LIVE-GATE-01.*LIVE-GATE-05/s);
assert.match(reportFormat, /PENDING POST-INSTALL/);
console.log('REG_MIXED_HELP_API_CURRENT_AUTHORITY_DOCS_PASS');

console.log('REG_MIXED_HELP_API_CONTRACT_PASS');
