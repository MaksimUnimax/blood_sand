import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const [candidateRoot, matrixPath] = process.argv.slice(2);
if (!candidateRoot || !matrixPath) {
  throw new Error('usage: node OZON_PERFORMANCE_STEP6_MATRIX_REGRESSION_2026-08-29.mjs <step5-package-root> <matrix-json>');
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
if (matrix?.schema !== 'OZON_PERFORMANCE_STEP6_EXACT_MATRIX_V1') throw new Error('unexpected matrix schema');
if (matrix?.authority?.swagger_bytes !== 304771) throw new Error('Performance Swagger byte authority mismatch');
if (matrix?.authority?.swagger_sha256 !== '7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec') throw new Error('Performance Swagger SHA authority mismatch');
if (matrix?.authority?.paths !== 47 || matrix?.authority?.operations !== 48) throw new Error('Performance Swagger count authority mismatch');
if (matrix?.counts?.rows !== 48 || matrix?.counts?.admissible_current_reads !== 21 || matrix?.counts?.already_implemented_current_path_reads !== 6 || matrix?.counts?.new_reads_to_implement !== 15) throw new Error('Step6 matrix read counts mismatch');
if (matrix?.counts?.BLOCK_ASYNC_REPORT_GENERATION !== 9 || matrix?.counts?.BLOCK_MUTATION_SIDE_EFFECT !== 16 || matrix?.counts?.SKIP_DEPRECATED_READLIKE !== 2) throw new Error('Step6 matrix blocked/deprecated counts mismatch');
console.log('PERFORMANCE_STEP6_MATRIX_48_EXHAUSTIVE_COUNTS_PASS');

const operationKeys = new Set(matrix.rows.map((row) => row.operation_key));
if (operationKeys.size !== 48) throw new Error('matrix operation keys are not unique');
console.log('PERFORMANCE_STEP6_MATRIX_48_UNIQUE_METHOD_PATH_PASS');

const context = { console, URL, TextEncoder, TextDecoder };
context.globalThis = context;
vm.createContext(context);
for (const rel of ['shared/ozon_operation_registry.js', 'shared/ozon_contract.js']) {
  const source = fs.readFileSync(path.join(candidateRoot, rel), 'utf8');
  vm.runInContext(source, context, { filename: rel });
}
const registry = context.OzonOperationRegistry?.OPERATIONS;
const contract = context.OzonContract;
if (!registry || !contract) throw new Error('failed to load Step5 registry/contract');

const performanceEntries = Object.entries(registry).filter(([, meta]) => meta?.provider === 'performance_api');
if (performanceEntries.length !== 10) throw new Error(`accepted Step5 Performance alias count ${performanceEntries.length} != 10`);

const expectedExact = new Map([
  ['GET /api/client/campaign', 'performance_campaigns'],
  ['GET /api/client/campaign/{campaignId}/objects', 'performance_campaign_objects'],
  ['GET /api/client/limits/list', 'performance_bid_limits'],
  ['POST /api/client/statistics/products/sku', 'performance_sku_statistics'],
  ['GET /api/client/campaign/{campaignId}/v2/products', 'performance_campaign_products'],
  ['POST /api/client/campaign/search_promo/v2/products', 'performance_search_promo_products'],
]);

for (const [key, alias] of expectedExact) {
  const row = matrix.rows.find((item) => item.operation_key === key);
  const meta = registry[alias];
  if (!row || row.step6_decision !== 'READ_ALREADY_IMPLEMENTED_CURRENT_PATH' || row.alias !== alias) throw new Error(`matrix exact-read mismatch ${key}`);
  if (!meta || `${meta.method} ${meta.path}` !== key || meta.execution_enabled !== true || meta.effect !== 'READ' || meta.provider !== 'performance_api') throw new Error(`registry exact-read mismatch ${alias}`);
}
console.log('PERFORMANCE_STEP6_ACCEPTED_EXACT_CURRENT_READS_6_PASS');

const expectedVariants = new Map([
  ['GET /api/client/statistics/campaign/media', ['performance_media', '/api/client/statistics/campaign/media/json']],
  ['GET /api/client/statistics/campaign/product', ['performance_campaign_product', '/api/client/statistics/campaign/product/json']],
  ['GET /api/client/statistics/expense', ['performance_expense', '/api/client/statistics/expense/json']],
  ['GET /api/client/statistics/daily', ['performance_daily', '/api/client/statistics/daily/json']],
]);
for (const [currentKey, [alias, variantPath]] of expectedVariants) {
  const row = matrix.rows.find((item) => item.operation_key === currentKey);
  const meta = registry[alias];
  if (!row || row.documented_json_variant_alias !== alias || row.documented_json_variant_path !== variantPath) throw new Error(`documented JSON variant matrix mismatch ${currentKey}`);
  if (!meta || meta.path !== variantPath || meta.method !== 'GET' || meta.provider !== 'performance_api' || meta.effect !== 'READ') throw new Error(`documented JSON variant registry mismatch ${alias}`);
  if (operationKeys.has(`GET ${variantPath}`)) throw new Error(`JSON variant incorrectly counted as extra current Swagger operation: ${variantPath}`);
}
console.log('PERFORMANCE_STEP6_DOCUMENTED_JSON_VARIANTS_4_PRESERVED_PASS');

const mutationExpected = new Set(matrix.rows.filter((row) => row.step6_decision === 'BLOCK_MUTATION_SIDE_EFFECT').map((row) => row.operation_key));
const mutationActual = new Set(context.OzonContractFactory.PERFORMANCE_MUTATION_BLOCKLIST.map((item) => `${item.method} ${item.path}`));
if (mutationExpected.size !== 16 || mutationActual.size !== 16 || [...mutationExpected].some((key) => !mutationActual.has(key))) throw new Error('Performance mutation blocklist does not exactly match 16 Step6 mutation rows');
console.log('PERFORMANCE_STEP6_EXISTING_MUTATION_BLOCKLIST_16_EXACT_PASS');

const asyncExpected = new Set(matrix.rows.filter((row) => row.step6_decision === 'BLOCK_ASYNC_REPORT_GENERATION').map((row) => row.operation_key));
const asyncActual = new Set(context.OzonContractFactory.PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST.map((item) => `${item.method} ${item.path}`));
if (asyncExpected.size !== 9 || asyncActual.size !== 9 || [...asyncExpected].some((key) => !asyncActual.has(key))) throw new Error('Performance async report blocklist does not exactly match 9 Step6 report-generation rows');
console.log('PERFORMANCE_STEP6_EXISTING_ASYNC_REPORT_BLOCKLIST_9_EXACT_PASS');

const missingRows = matrix.rows.filter((row) => row.step6_decision === 'READ_IMPLEMENT_STEP6');
if (missingRows.length !== 15 || new Set(missingRows.map((row) => row.alias)).size !== 15) throw new Error('Step6 missing read alias set mismatch');
for (const row of missingRows) {
  if (registry[row.alias]) throw new Error(`Step6 new alias already exists unexpectedly: ${row.alias}`);
  if (row.response_kind === 'DIRECT_BINARY' && !['GET /api/client/statistics/report', 'GET /api/client/statistics/campaign/media', 'GET /api/client/statistics/campaign/product', 'GET /api/client/statistics/expense', 'GET /api/client/statistics/daily'].includes(row.operation_key)) throw new Error(`unexpected binary Step6 read ${row.operation_key}`);
}
console.log('PERFORMANCE_STEP6_NEW_READ_DELTA_15_PASS');

const deprecated = matrix.rows.filter((row) => row.step6_decision === 'SKIP_DEPRECATED_READLIKE');
if (deprecated.length !== 2 || deprecated.some((row) => row.deprecated !== true)) throw new Error('deprecated read-like classification mismatch');
console.log('PERFORMANCE_STEP6_DEPRECATED_READLIKE_2_NOT_ENABLED_PASS');

const source = fs.readFileSync(path.join(candidateRoot, 'shared/ozon_contract.js'), 'utf8');
if (!source.includes('performance_provider_not_seller_subscription')) throw new Error('Performance provider independence marker missing');
if (!source.includes('assertPerformanceMutationBlocked(meta.method, meta.path)')) throw new Error('Performance mutation guard missing');
if (!source.includes('assertPerformanceAsyncReportSideEffectBlocked(meta.method, meta.path)')) throw new Error('Performance async side-effect guard missing');
console.log('PERFORMANCE_STEP6_SEPARATE_PROVIDER_AND_FAIL_CLOSED_GUARDS_PASS');

console.log(JSON.stringify({ current_operations: 48, admissible_reads: 21, existing_exact_reads: 6, new_reads: 15, json_variants: 4, blocked_async_starts: 9, blocked_mutations: 16, deprecated_readlike: 2 }));
console.log('OZON_PERFORMANCE_STEP6_MATRIX_REGRESSION_PASS');
