import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repo = process.argv[2] || '.';
const root = path.join(repo, 'tooling/llm-api-bridges/ozon-seller');
const dist = path.join(root, 'dist-step7-candidate');
const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const productionFiles = walk(dist).filter((file) => file.endsWith('.js'));
const idbFiles = productionFiles
  .filter((file) => fs.readFileSync(file, 'utf8').includes('indexedDB'))
  .map((file) => path.relative(dist, file).replaceAll('\\', '/'))
  .sort();

console.log('INDEXEDDB_IMPLEMENTATION_FILES=' + JSON.stringify(idbFiles));
assert.deepEqual(idbFiles, [
  'shared/direct_binary_file_delivery_patch.js',
  'shared/file_delivery_port_worker.js'
], 'unexpected production IndexedDB implementation: closed set changed');

const direct = read('shared/direct_binary_file_delivery_patch.js');
const worker = read('shared/file_delivery_port_worker.js');
const entry = read('service_worker_entry.js');

for (const [name, source] of [['direct', direct], ['worker', worker]]) {
  assert.match(source, /const DB_NAME = "ozon_bridge_delivery_artifacts_v1";/, `${name}: DB authority drift`);
  assert.match(source, /const DB_VERSION = 1;/, `${name}: DB version drift`);
  assert.match(source, /const STORE_NAME = "artifacts";/, `${name}: artifact store drift`);
}
assert.match(entry, /importScripts\("shared\/direct_binary_file_delivery_patch\.js"\);/, 'direct binary durability writer is not loaded by MV3 worker entry');
assert.match(entry, /importScripts\("shared\/file_delivery_port_worker\.js"\);/, 'common artifact store is not loaded by MV3 worker entry');

const directPut = direct.slice(direct.indexOf('async function putArtifact'), direct.indexOf('\n\n  function safeResultReport'));
assert.ok(directPut.length > 0, 'direct putArtifact boundary missing');
assert.match(directPut, /request\.onsuccess\s*=\s*\(\)\s*=>\s*\{\s*requestSucceeded\s*=\s*true;\s*\};/, 'direct writer must only capture request success');
assert.match(directPut, /tx\.oncomplete\s*=\s*\(\)\s*=>/, 'direct writer must wait for transaction complete');
assert.doesNotMatch(directPut, /request\.onsuccess\s*=\s*\(\)\s*=>\s*resolve/, 'direct writer must not resolve on request success');
assert.match(directPut, /tx\.onabort\s*=\s*\(\)\s*=>\s*rejectOnce/, 'direct writer must reject transaction abort');

const directAwait = direct.indexOf('await artifactWriter(artifact);');
const directDeleteRaw = direct.indexOf('delete safe.file_content_base64;');
const directPublishRef = direct.indexOf('safe.generated_file_ref = ref;');
assert.ok(directAwait >= 0 && directDeleteRaw > directAwait && directPublishRef > directAwait, 'direct ref/raw-byte redaction must occur only after durable artifact writer resolves');
assert.equal((direct.match(/await baseProvider\.executeCommandObject\(/g) || []).length, 1, 'direct wrapper must have one base provider execution callsite');

const idbStart = worker.indexOf('async function idbRequest');
const idbEnd = worker.indexOf('\n\n  function getArtifact', idbStart);
const idb = worker.slice(idbStart, idbEnd);
assert.ok(idbStart >= 0 && idbEnd > idbStart, 'common idbRequest boundary missing');
assert.match(idb, /request\.onsuccess\s*=\s*\(\)\s*=>\s*\{\s*requestSucceeded\s*=\s*true;\s*requestResult\s*=\s*request\.result;\s*\};/, 'common helper must capture request result without resolving');
assert.match(idb, /tx\.oncomplete\s*=\s*\(\)\s*=>/, 'common helper must wait for transaction complete');
assert.doesNotMatch(idb, /request\.onsuccess\s*=\s*\(\)\s*=>\s*resolve/, 'common helper must not resolve on request success');
assert.match(idb, /tx\.onabort\s*=\s*\(\)\s*=>\s*rejectOnce/, 'common helper must reject transaction abort');

const wrappers = {
  getArtifact: /function getArtifact\(key\) \{ return idbRequest\("readonly", \(store\) => store\.get\(String\(key\)\)\); \}/,
  putArtifact: /function putArtifact\(record\) \{ return idbRequest\("readwrite", \(store\) => store\.put\(record\)\); \}/,
  deleteArtifact: /function deleteArtifact\(key\) \{ return idbRequest\("readwrite", \(store\) => store\.delete\(String\(key\)\)\); \}/,
  allArtifacts: /function allArtifacts\(\) \{ return idbRequest\("readonly", \(store\) => store\.getAll\(\)\); \}/
};
for (const [name, pattern] of Object.entries(wrappers)) assert.match(worker, pattern, `${name}: must remain routed through common transaction helper`);

const putCallCount = (worker.match(/await putArtifact\(/g) || []).length;
const deleteCallCount = (worker.match(/await deleteArtifact\(/g) || []).length;
const getCallCount = (worker.match(/await getArtifact\(/g) || []).length;
const allCallCount = (worker.match(/await allArtifacts\(\)/g) || []).length;
console.log(`COMMON_PUT_CALLS=${putCallCount}`);
console.log(`COMMON_DELETE_CALLS=${deleteCallCount}`);
console.log(`COMMON_GET_CALLS=${getCallCount}`);
console.log(`COMMON_GETALL_CALLS=${allCallCount}`);
assert.equal(putCallCount, 3, 'common artifact put consumer closed set changed');
assert.equal(deleteCallCount, 2, 'common artifact delete consumer closed set changed');
assert.equal(getCallCount, 3, 'common artifact get consumer closed set changed');
assert.equal(allCallCount, 1, 'common artifact getAll consumer closed set changed');

for (const producer of ['storeProviderArtifactForRef', 'materializeInlineProviderArtifact', 'ensureGeneratedArtifact']) {
  const start = worker.indexOf(`async function ${producer}`);
  assert.ok(start >= 0, `${producer}: producer missing`);
  const next = worker.indexOf('\n\n  async function ', start + 1);
  const block = worker.slice(start, next >= 0 ? next : worker.length);
  assert.match(block, /await putArtifact\(/, `${producer}: must await durable artifact write`);
}

assert.match(worker, /try \{ await storeProviderArtifactForRef\(ref, captured, result\?\.parsed \|\| null\); \} catch \(_\) \{\}/, 'trusted report capture storage-failure semantics changed unexpectedly');
assert.match(worker, /canonicalProviderArtifactType\(captured, parsed\)/, 'parser-proven report format must reach provider artifact classification without refetch');
assert.match(worker, /REPORT_FILE_ARTIFACT_NOT_CAPTURED/, 'missing captured provider artifact must fail closed without re-download');
assert.match(worker, /fetchCalls !== 1/, 'trusted report file transport must retain exactly-one fetch guard');

const generatedStart = worker.indexOf('async function ensureGeneratedArtifact');
const generatedEnd = worker.indexOf('\n\n  function descriptorFromRecord', generatedStart);
const generatedBlock = worker.slice(generatedStart, generatedEnd);
assert.ok(generatedBlock.indexOf('await putArtifact(artifact);') < generatedBlock.indexOf('return artifact;'), 'generated large-result TXT must not return artifact before durable commit');

const inlineStart = worker.indexOf('async function materializeInlineProviderArtifact');
const inlineEnd = worker.indexOf('\n\n  async function ensureGeneratedArtifact', inlineStart);
const inlineBlock = worker.slice(inlineStart, inlineEnd);
assert.ok(inlineBlock.indexOf('await putArtifact(artifact);') < inlineBlock.indexOf('return artifact;'), 'inline provider document must not return artifact before durable commit');

const storeProviderStart = worker.indexOf('async function storeProviderArtifactForRef');
const storeProviderEnd = worker.indexOf('\n\n  async function captureTrustedReportFileOnce', storeProviderStart);
const storeProviderBlock = worker.slice(storeProviderStart, storeProviderEnd);
assert.ok(storeProviderBlock.indexOf('await putArtifact(record);') < storeProviderBlock.indexOf('return record;'), 'captured original provider file must not return record before durable commit');

const directRegression = fs.readFileSync(path.join(root, 'validation/regression/run_direct_binary_provider_attachment_gate.mjs'), 'utf8');
assert.match(directRegression, /artifactWriter:\s*async \(artifact\) => \{ artifacts\.set/, 'existing direct-binary regression no longer has the known in-memory writer boundary');
assert.match(directRegression, /default IndexedDB writer must not be used by deterministic gate/, 'existing direct-binary regression boundary changed; durability gate must remain separately necessary');

console.log('INDEXEDDB_IMPLEMENTATIONS_CLOSED_SET=2/2');
console.log('COMMON_ARTIFACT_STORAGE_CONSUMERS_CLOSED_SET=9/9');
console.log('DIRECT_BINARY_DURABLE_BEFORE_REF_PASS');
console.log('COMMON_ARTIFACT_STORE_DURABLE_BEFORE_RETURN_PASS');
console.log('NO_HIDDEN_PROVIDER_REFETCH_ADDED_PASS');
console.log('OZON_INDEXEDDB_DURABILITY_SECONDARY_SWEEP_PASS');
