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
  const starts = [];
  let cursor = 0;
  while (true) {
    const index = source.indexOf(marker, cursor);
    if (index < 0) break;
    starts.push(index);
    cursor = index + marker.length;
  }
  assert.equal(starts.length, 1, `${functionName}: expected exactly one function definition`);
  const start = starts[0];
  const braceStart = source.indexOf('{', start + marker.length);
  assert.ok(braceStart >= 0, `${functionName}: opening brace missing`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1] || '';
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue; }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
      assert.ok(depth >= 0, `${functionName}: negative brace depth`);
    }
  }
  assert.fail(`${functionName}: unterminated function`);
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
const kinds = (rows) => Array.from(rows, (row) => row.kind);

const firstApi = api('seller_product_list', { filter: {}, limit: 1 });
const secondApi = api('stocks_current', { filter: {}, limit: 1 });

const helpThenApi = discover(`before\n${help2('finance')}\nbetween\n${firstApi}\nafter`);
assert.deepEqual(kinds(helpThenApi), ['help', 'api']);
assert.equal(helpThenApi[0].help.ok, true);
assert.equal(helpThenApi[0].help.cluster, 'finance');
assert.equal(helpThenApi[1].discovery.ok, true);
assert.equal(helpThenApi[1].discovery.command.operation, 'seller_product_list');
assert.ok(helpThenApi[0].marker_index < helpThenApi[1].marker_index);
console.log('REG_V2_MIXED_HELP_THEN_API_ORDER_PASS');

const apiThenHelp = discover(`${firstApi}\n${help2('stocks_inventory')}`);
assert.deepEqual(kinds(apiThenHelp), ['api', 'help']);
assert.equal(apiThenHelp[1].help.ok, true);
assert.equal(apiThenHelp[1].help.cluster, 'stocks_inventory');
console.log('REG_V2_MIXED_API_THEN_HELP_ORDER_PASS');

const alternating = discover([
  '```text', firstApi, '```',
  'ordinary prose',
  '```text', help2('finance'), '```',
  'more prose',
  '```text', secondApi, '```',
  '```text', help2('reviews_questions'), '```'
].join('\n'));
assert.deepEqual(kinds(alternating), ['api', 'help', 'api', 'help']);
assert.deepEqual(Array.from(alternating).filter((entry) => entry.kind === 'api').map((entry) => entry.discovery.command.operation), ['seller_product_list', 'stocks_current']);
assert.deepEqual(Array.from(alternating).filter((entry) => entry.kind === 'help').map((entry) => entry.help.cluster), ['finance', 'reviews_questions']);
for (let index = 1; index < alternating.length; index += 1) assert.ok(alternating[index - 1].marker_index < alternating[index].marker_index);
console.log('REG_V2_MIXED_ALTERNATING_SOURCE_ORDER_PASS');

const apiOnly = discover(`${firstApi}\n${secondApi}`);
assert.deepEqual(kinds(apiOnly), ['api', 'api']);
assert.ok(Array.from(apiOnly).every((entry) => entry.discovery.ok));
console.log('REG_V2_API_ONLY_UNCHANGED_PASS');

const helpOnly = discover(`${help2('finance')}\n${help2('stocks_inventory')}`);
assert.deepEqual(kinds(helpOnly), ['help', 'help']);
assert.ok(Array.from(helpOnly).every((entry) => entry.help.ok));
console.log('REG_V2_MULTI_HELP_PASS');

const malformedHelpThenApi = discover(`OZON_HELP_V2 nope\n${firstApi}`);
assert.deepEqual(kinds(malformedHelpThenApi), ['help', 'api']);
assert.equal(malformedHelpThenApi[0].help.ok, false);
assert.equal(malformedHelpThenApi[0].help.code, 'HELP_JSON_REQUIRED');
assert.equal(malformedHelpThenApi[1].discovery.ok, true);
console.log('REG_V2_MALFORMED_HELP_ISOLATED_PASS');

const malformedApiThenHelp = discover(`OZON_API_V1\n${JSON.stringify({ operation: 'seller_product_list', args: {} })}\n${help2('finance')}`);
assert.deepEqual(kinds(malformedApiThenHelp), ['api', 'help']);
assert.equal(malformedApiThenHelp[0].discovery.ok, false);
assert.equal(malformedApiThenHelp[0].discovery.code, 'UNKNOWN_TOP_LEVEL_FIELD');
assert.equal(malformedApiThenHelp[1].help.ok, true);
console.log('REG_V2_MALFORMED_API_ISOLATED_PASS');

const markerInsideBalancedJson = discover(`OZON_HELP_V2\n${JSON.stringify({ cluster: 'finance', section: 'literal OZON_API_V1 marker' })}`);
assert.equal(markerInsideBalancedJson.length, 1, 'marker text inside balanced JSON must not become another envelope');
assert.equal(markerInsideBalancedJson[0].kind, 'help');
console.log('REG_V2_BALANCED_JSON_MARKER_ISOLATION_PASS');

const localGuidance = guidance.result({ status: 'cluster_selected', cluster: 'finance', version: 2 });
assert.equal(localGuidance.external_request_executed, false);
assert.equal(localGuidance.physical_business_request_count, 0);
console.log('REG_V2_GUIDANCE_ZERO_PROVIDER_REQUEST_PASS');

const entrySource = fs.readFileSync(path.join(dist, 'service_worker_entry.js'), 'utf8');
const helperImportIndex = entrySource.indexOf('shared/mixed_batch_discovery.js');
const workerImportIndex = entrySource.indexOf('service_worker.js');
assert.ok(helperImportIndex >= 0 && workerImportIndex > helperImportIndex, 'mixed helper must load before service worker');

const workerSource = fs.readFileSync(path.join(dist, 'service_worker.js'), 'utf8');
assert.doesNotMatch(workerSource, /MIXED_HELP_AND_API/, 'blanket mixed rejection must be removed');
assert.match(workerSource, /OzonMixedBatchDiscovery\.discover\(source/);
const discoverFunctionSource = extractFunction(workerSource, 'discoverBatchEntries');
assert.match(discoverFunctionSource, /batchEntryFromDiscovery\(item\.discovery\)/);
assert.match(discoverFunctionSource, /kind: "guidance"/);
console.log('REG_V2_DISCOVER_FUNCTION_STRUCTURAL_EXTRACTION_PASS');

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
assert.deepEqual(Array.from(integrated, (entry) => entry.kind), ['guidance', 'command', 'guidance', 'command']);
assert.deepEqual(Array.from(integrated).filter((entry) => entry.kind === 'command').map((entry) => entry.operation), ['seller_product_list', 'stocks_current']);
assert.ok(Array.from(integrated).filter((entry) => entry.kind === 'guidance').every((entry) => entry.external_request_executed === false));
console.log('REG_V2_WORKER_TYPED_MAPPING_PASS');

const malformedIntegrated = integrationContext.__discoverBatchEntries(`OZON_HELP_V2 nope\n${firstApi}`);
assert.deepEqual(Array.from(malformedIntegrated, (entry) => entry.kind), ['guidance', 'command']);
assert.equal(malformedIntegrated[0].guidance.status, 'guidance_error');
assert.equal(malformedIntegrated[0].external_request_executed, false);
assert.equal(malformedIntegrated[1].operation, 'seller_product_list');
console.log('REG_V2_WORKER_MALFORMED_HELP_FAIL_CLOSED_PASS');

const prompt = globalThis.OzonRuntime.DEFAULT_AUTO_START_TEXT;
for (const needle of [
  'Граница команды — envelope',
  'OZON_HELP_V2 и OZON_API_V1 могут находиться в одном ответе',
  'HELP обрабатывается локально и не выполняет provider business request',
  'Зависимые цепочки нельзя заранее батчить',
  'используй только свежий code, file_ref, cursor',
  'Polling также не запускается скрыто'
]) assert.ok(prompt.includes(needle), `startup prompt missing: ${needle}`);
assert.ok(!prompt.includes('Выбирай их отдельной новой командой OZON_HELP_V2'));
console.log('REG_V2_START_PROMPT_CONTRACT_PASS');

for (const name of ['START_PROMPT_CURRENT.md', 'BRIDGE_RESPONSE_FORMS_CURRENT.md', 'AI_TEST_REPORT_FORMAT_CURRENT.md']) {
  assert.ok(fs.existsSync(path.join(root, name)), `current authority document missing: ${name}`);
}
const responseForms = fs.readFileSync(path.join(root, 'BRIDGE_RESPONSE_FORMS_CURRENT.md'), 'utf8');
assert.match(responseForms, /code block is not a command boundary/i);
assert.match(responseForms, /HELP and API.*same assistant response/i);
assert.match(responseForms, /source order/i);
const reportFormat = fs.readFileSync(path.join(root, 'AI_TEST_REPORT_FORMAT_CURRENT.md'), 'utf8');
assert.match(reportFormat, /GATE-01[\s\S]*GATE-35/);
assert.match(reportFormat, /LIVE-GATE-01[\s\S]*LIVE-GATE-05/);
assert.match(reportFormat, /PENDING POST-INSTALL/);
console.log('REG_V2_CURRENT_AUTHORITY_DOCS_PASS');

console.log('REG_V2_MIXED_HELP_API_CONTRACT_PASS');
