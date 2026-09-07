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
const shared = path.join(root, 'dist-step7-candidate', 'shared');

for (const file of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_contract.js']) {
  loadClassic(path.join(shared, file));
}

const contract = globalThis.OzonContract;
assert.ok(contract, 'OzonContract must load from candidate runtime');

const first = { operation: 'seller_product_list', params: { filter: {}, limit: 1 } };
const second = { operation: 'stocks_current', params: { filter: {}, limit: 1 } };
const envelope = (command) => `OZON_API_V1\n${JSON.stringify(command)}`;

const one = contract.discoverCommands(envelope(first));
assert.equal(one.length, 1);
assert.equal(one[0]?.ok, true);
assert.equal(one[0]?.command?.operation, first.operation);
console.log('REG_COMMAND_ENVELOPE_PREFIX_NEWLINE_PASS');

const plainMulti = contract.discoverCommands(`${envelope(first)}\n\n${envelope(second)}`);
assert.equal(plainMulti.length, 2, 'two command envelopes in one source string must both be discovered');
assert.deepEqual(plainMulti.map((row) => row?.command?.operation), [first.operation, second.operation]);
assert.ok(plainMulti.every((row) => row?.ok === true));
console.log('REG_COMMAND_ENVELOPE_MULTI_SOURCE_ORDER_PASS');

const oneFence = contract.discoverCommands(`\`\`\`text\n${envelope(first)}\n\n${envelope(second)}\n\`\`\``);
assert.equal(oneFence.length, 2, 'Markdown fence must not impose one-command cardinality');
assert.deepEqual(oneFence.map((row) => row?.command?.operation), [first.operation, second.operation]);
console.log('REG_COMMAND_ENVELOPE_CODE_FENCE_NON_SEMANTIC_PASS');

const twoFencesAndProse = contract.discoverCommands([
  'first presentation container:',
  '```text', envelope(first), '```',
  'ordinary prose between commands',
  '```text', envelope(second), '```'
].join('\n'));
assert.equal(twoFencesAndProse.length, 2);
assert.deepEqual(twoFencesAndProse.map((row) => row?.command?.operation), [first.operation, second.operation]);
console.log('REG_COMMAND_ENVELOPE_SURROUNDING_PROSE_PASS');

assert.throws(
  () => contract.normalizeCommand({ operation: first.operation, args: {} }),
  (error) => error?.code === 'UNKNOWN_TOP_LEVEL_FIELD' && /args/.test(String(error?.message || '')),
  'args must remain rejected as an unknown top-level field'
);
const argsDiscovery = contract.discoverCommands(`OZON_API_V1\n${JSON.stringify({ operation: first.operation, args: {} })}`);
assert.equal(argsDiscovery.length, 1);
assert.equal(argsDiscovery[0]?.ok, false);
assert.equal(argsDiscovery[0]?.code, 'UNKNOWN_TOP_LEVEL_FIELD');
console.log('REG_COMMAND_ENVELOPE_ARGS_REJECT_PASS');

const authorityPath = path.join(root, 'OZON_COMMAND_ENVELOPE_CONTRACT.md');
const readmePath = path.join(root, 'README.md');
const batchPath = path.join(root, 'research', 'product', 'OZON_AI_WORKER_EXPLICIT_BATCH_ORCHESTRATION_DEFECT_AND_RULE_2026-09-06.md');
const roadmapPath = path.join(root, 'research', 'product', 'OZON_AI_WORKER_COMMERCIAL_VALIDATION_ROADMAP_2026-09-02.md');
const guidancePath = path.join(root, 'OZON_GUIDED_COMMAND_DISCOVERY_SPEC_2026-08-21.md');
for (const file of [authorityPath, readmePath, batchPath, roadmapPath, guidancePath]) {
  assert.ok(fs.existsSync(file), `required command authority dependency missing: ${path.relative(repo, file)}`);
}

const authority = fs.readFileSync(authorityPath, 'utf8');
const readme = fs.readFileSync(readmePath, 'utf8');
const batch = fs.readFileSync(batchPath, 'utf8');
const roadmap = fs.readFileSync(roadmapPath, 'utf8');
const guidance = fs.readFileSync(guidancePath, 'utf8');

assert.match(authority, /Markdown code blocks\/fences are presentation and UI containers only/i);
assert.match(authority, /A source text may contain one or multiple complete `OZON_API_V1` command envelopes/i);
assert.match(authority, /ONE_EXPLICIT_BUSINESS_COMMAND => AT_MOST_ONE_PHYSICAL_PROVIDER_REQUEST/);
assert.match(readme, /OZON_COMMAND_ENVELOPE_CONTRACT\.md/);
assert.match(readme, /Markdown code fences.*not.*command/i);
assert.match(batch, /OZON_COMMAND_ENVELOPE_CONTRACT\.md/);
assert.match(batch, /command envelopes/i);
assert.match(roadmap, /EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS/);
assert.match(roadmap, /multiple separate explicit `OZON_API_V1` objects in one assistant response/i);
assert.match(guidance, /discoverCommands\(\).*scans for `OZON_API_V1`/i);
assert.match(guidance, /worker normally receives only the selected code-block text/i);

const forbiddenActiveRules = [
  /one command\s*=\s*one code block/i,
  /one command per code block/i,
  /one code block per command/i,
  /one assistant response\s*=>\s*(?:exactly|only) one explicit business command/i,
  /one response\s*=\s*one command/i,
  /одна команда\s*=\s*один (?:кодовый|code) блок/i,
  /один (?:кодовый|code) блок на (?:одну|каждую) команд/i
];
for (const [name, text] of [['README', readme], ['batch authority', batch], ['roadmap', roadmap], ['guidance spec', guidance]]) {
  for (const pattern of forbiddenActiveRules) {
    assert.doesNotMatch(text, pattern, `${name}: forbidden active command-cardinality wording returned`);
  }
}
console.log('REG_COMMAND_ENVELOPE_ACTIVE_DOCS_UNAMBIGUOUS_PASS');

const sw = fs.readFileSync(path.join(root, 'dist-step7-candidate', 'service_worker.js'), 'utf8');
assert.match(sw, /discoverBatchEntries\(/, 'common batch discovery path must remain present');
assert.match(sw, /sequential_batch_single_delivery/, 'sequential batch delivery contract must remain present');
console.log('REG_COMMAND_ENVELOPE_BATCH_RUNTIME_BOUNDARY_PASS');

console.log('REG_COMMAND_ENVELOPE_CONTRACT_PASS');
