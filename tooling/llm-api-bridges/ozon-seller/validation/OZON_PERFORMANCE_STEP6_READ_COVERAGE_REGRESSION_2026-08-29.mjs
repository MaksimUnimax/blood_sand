import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const [candidateRoot, matrixPath, baseRoot] = process.argv.slice(2);
if (!candidateRoot || !matrixPath || !baseRoot) throw new Error('usage: regression <candidate> <matrix> <step5-base>');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function listFiles(root) {
  return fs.readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((x) => x.isFile())
    .map((x) => path.relative(root, path.join(x.parentPath || x.path, x.name)).replaceAll('\\', '/'))
    .sort();
}
function load(root, files = ['shared/ozon_operation_registry.js', 'shared/ozon_contract.js', 'shared/provider_transport_core.js']) {
  const context = { console, URL, TextEncoder, TextDecoder };
  context.globalThis = context;
  vm.createContext(context);
  for (const rel of files) vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), context, { filename: rel });
  return context;
}
const plain = (v) => JSON.parse(JSON.stringify(v));
const reqWire = (req) => ({ url: req.url, method: req.method, body: req.body ?? null, path: req.path, host_alias: req.host_alias });

if (matrix?.schema !== 'OZON_PERFORMANCE_STEP6_EXACT_MATRIX_V1' || matrix?.authority?.swagger_bytes !== 304771 || matrix?.authority?.swagger_sha256 !== '7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec' || matrix?.authority?.paths !== 47 || matrix?.authority?.operations !== 48) throw new Error('matrix authority mismatch');
if (matrix?.counts?.rows !== 48 || matrix?.counts?.admissible_current_reads !== 21 || matrix?.counts?.already_implemented_current_path_reads !== 6 || matrix?.counts?.new_reads_to_implement !== 15 || matrix?.counts?.BLOCK_ASYNC_REPORT_GENERATION !== 9 || matrix?.counts?.BLOCK_MUTATION_SIDE_EFFECT !== 16 || matrix?.counts?.SKIP_DEPRECATED_READLIKE !== 2) throw new Error('matrix counts mismatch');
console.log('PERFORMANCE_STEP6_CANDIDATE_FROZEN_48_MATRIX_PASS');

const baseFiles = listFiles(baseRoot);
const candidateFiles = listFiles(candidateRoot);
if (JSON.stringify(baseFiles) !== JSON.stringify(candidateFiles) || candidateFiles.length !== 21 || candidateFiles.filter((x) => x.endsWith('.js')).length !== 18) throw new Error('production shape mismatch');
const changed = ['shared/ozon_operation_registry.js', 'shared/ozon_contract.js', 'shared/provider_transport_core.js'];
for (const rel of candidateFiles) {
  if (!changed.includes(rel) && sha(path.join(candidateRoot, rel)) !== sha(path.join(baseRoot, rel))) throw new Error(`protected file changed: ${rel}`);
}
console.log('PERFORMANCE_STEP6_CANDIDATE_ONLY_3_PRODUCTION_FILES_CHANGED_PASS');

const B = load(baseRoot);
const C = load(candidateRoot);
const bOps = B.OzonOperationRegistry.OPERATIONS;
const cOps = C.OzonOperationRegistry.OPERATIONS;
if (Object.keys(bOps).length !== 229 || Object.keys(cOps).length !== 244) throw new Error('registry count mismatch');
if (Object.values(cOps).filter((m) => m.provider === 'seller_api').length !== 219) throw new Error('Seller alias count changed');
if (Object.values(cOps).filter((m) => m.provider === 'performance_api').length !== 25) throw new Error('Performance alias count != 25');
for (const [alias, meta] of Object.entries(bOps)) {
  if (!cOps[alias]) throw new Error(`base alias missing ${alias}`);
  if (JSON.stringify(plain(meta)) !== JSON.stringify(plain(cOps[alias]))) throw new Error(`base registry semantics changed ${alias}`);
  const bcmd = B.OzonContract.normalizeCommand(meta.template);
  const ccmd = C.OzonContract.normalizeCommand(cOps[alias].template);
  const breq = meta.provider === 'performance_api' ? B.OzonContract.buildPerformanceRequest(bcmd, {}) : B.OzonContract.buildRequest(bcmd, {});
  const creq = meta.provider === 'performance_api' ? C.OzonContract.buildPerformanceRequest(ccmd, {}) : C.OzonContract.buildRequest(ccmd, {});
  if (JSON.stringify(reqWire(breq)) !== JSON.stringify(reqWire(creq))) throw new Error(`base wire request changed ${alias}`);
}
console.log('PERFORMANCE_STEP6_ALL_229_STEP5_ALIAS_AND_WIRE_SEMANTICS_PRESERVED_PASS');

const newRows = matrix.rows.filter((r) => r.step6_decision === 'READ_IMPLEMENT_STEP6');
if (newRows.length !== 15 || new Set(newRows.map((r) => r.alias)).size !== 15) throw new Error('new read set mismatch');
for (const row of newRows) {
  const m = cOps[row.alias];
  if (!m || m.provider !== 'performance_api' || m.effect !== 'READ' || m.execution_enabled !== true || `${m.method} ${m.path}` !== row.operation_key || m.entitlement_key !== `PERFORMANCE ${row.operation_key}`) throw new Error(`new registry binding mismatch ${row.alias}`);
}
if (!C.OzonOperationRegistry.catalogValidation(C.OzonContract.OPERATIONS).ok) throw new Error('catalog validation failed');
console.log('PERFORMANCE_STEP6_15_NEW_CURRENT_READ_BINDINGS_PASS');

const directBinary = new Map([
  ['performance_statistics_report_download', ['text/csv', 'application/zip']],
  ['performance_media_csv', ['text/csv']],
  ['performance_campaign_product_csv', ['text/csv']],
  ['performance_expense_csv', ['text/csv']],
  ['performance_daily_csv', ['text/csv']]
]);
for (const [alias, types] of directBinary) {
  const m = cOps[alias];
  if (m.response_style !== 'binary' || JSON.stringify(plain(m.response_content_types)) !== JSON.stringify(types)) throw new Error(`binary meta mismatch ${alias}`);
  const req = C.OzonContract.buildPerformanceRequest(m.template, {});
  if (req.response_style !== 'binary' || JSON.stringify(plain(req.response_content_types)) !== JSON.stringify(types)) throw new Error(`binary request metadata mismatch ${alias}`);
}
console.log('PERFORMANCE_STEP6_DIRECT_BINARY_METADATA_5_PASS');

const expectedRequests = {
  performance_min_bid_by_sku: { method: 'POST', url: 'https://api-performance.ozon.ru/api/client/min/sku', body: '{"sku":["1"]}' },
  performance_products_with_bonuses: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/products_with_bonuses', body: null },
  performance_statistics_status: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/00000000-0000-0000-0000-000000000000', body: null },
  performance_statistics_list_ui: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/list?page=1&pageSize=100', body: null },
  performance_statistics_list_api: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/externallist?page=1&pageSize=100', body: null },
  performance_statistics_report_download: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/report?UUID=00000000-0000-0000-0000-000000000000', body: null },
  performance_media_csv: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/campaign/media?dateFrom=2026-01-01&dateTo=2026-01-07', body: null },
  performance_campaign_product_csv: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/campaign/product?dateFrom=2026-01-01&dateTo=2026-01-07', body: null },
  performance_expense_csv: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/expense?dateFrom=2026-01-01&dateTo=2026-01-07', body: null },
  performance_daily_csv: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/statistics/daily?dateFrom=2026-01-01&dateTo=2026-01-07', body: null },
  performance_competitive_bids: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/campaign/1/products/bids/competitive?skus=1', body: null },
  performance_cpo_min_bids: { method: 'POST', url: 'https://api-performance.ozon.ru/api/client/search_promo/get_cpo_min_bids', body: '{"skus":["1"]}' },
  performance_vendor_statistics_list: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/vendors/statistics/list?page=1&pageSize=100', body: null },
  performance_vendor_statistics_status: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/vendors/statistics/00000000-0000-0000-0000-000000000000?vendor=true', body: null },
  performance_vendor_tag: { method: 'GET', url: 'https://api-performance.ozon.ru/api/client/organisation/vendor_tag?orgId=1', body: null }
};
for (const [alias, expected] of Object.entries(expectedRequests)) {
  const req = C.OzonContract.buildPerformanceRequest(cOps[alias].template, {});
  if (req.method !== expected.method || req.url !== expected.url || (req.body ?? null) !== expected.body) throw new Error(`exact trusted request mismatch ${alias}`);
  if (!/^https:\/\/api-performance\.ozon\.ru\//.test(req.url)) throw new Error(`untrusted host ${alias}`);
}
console.log('PERFORMANCE_STEP6_15_EXACT_TRUSTED_REQUESTS_PASS');

function expectCode(fn, code) {
  let ok = false;
  try { fn(); } catch (e) { if (e.code === code) ok = true; else throw e; }
  if (!ok) throw new Error(`expected ${code}`);
}
const mk = (expr) => vm.runInContext(expr, C);
expectCode(() => C.OzonContract.normalizeCommand(mk('({operation:"performance_min_bid_by_sku",params:{marketplaceId:"BAD"}})')), 'INVALID_OPERATION_PARAMS');
expectCode(() => C.OzonContract.normalizeCommand(mk('({operation:"performance_competitive_bids",params:{campaignId:"1",skus:Array.from({length:201},(_,i)=>String(i+1))}})')), 'OZON_LIMIT_VIOLATION');
expectCode(() => C.OzonContract.normalizeCommand(mk('({operation:"performance_cpo_min_bids",params:{skus:Array.from({length:201},(_,i)=>String(i+1))}})')), 'OZON_LIMIT_VIOLATION');
expectCode(() => C.OzonContract.normalizeCommand(mk('({operation:"performance_vendor_statistics_status",params:{UUID:"abc",vendor:false}})')), 'INVALID_OPERATION_PARAMS');
expectCode(() => C.OzonContract.normalizeCommand(mk('({operation:"performance_vendor_tag",params:{orgId:"1",url:"https://evil"}})')), 'TRANSPORT_INJECTION_REJECTED');
console.log('PERFORMANCE_STEP6_EXACT_NORMALIZERS_AND_LIMITS_PASS');

const mutationExpected = new Set(matrix.rows.filter((r) => r.step6_decision === 'BLOCK_MUTATION_SIDE_EFFECT').map((r) => r.operation_key));
const asyncExpected = new Set(matrix.rows.filter((r) => r.step6_decision === 'BLOCK_ASYNC_REPORT_GENERATION').map((r) => r.operation_key));
const mutationActual = new Set(C.OzonContractFactory.PERFORMANCE_MUTATION_BLOCKLIST.map((x) => `${x.method} ${x.path}`));
const asyncActual = new Set(C.OzonContractFactory.PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST.map((x) => `${x.method} ${x.path}`));
if (mutationActual.size !== 16 || asyncActual.size !== 9 || [...mutationExpected].some((k) => !mutationActual.has(k)) || [...asyncExpected].some((k) => !asyncActual.has(k))) throw new Error('blocklist exact preservation failed');
for (const row of matrix.rows.filter((r) => ['BLOCK_MUTATION_SIDE_EFFECT', 'BLOCK_ASYNC_REPORT_GENERATION', 'SKIP_DEPRECATED_READLIKE'].includes(r.step6_decision))) {
  if (Object.values(cOps).some((m) => `${m.method} ${m.path}` === row.operation_key && m.execution_enabled === true)) throw new Error(`blocked/deprecated current op enabled ${row.operation_key}`);
}
console.log('PERFORMANCE_STEP6_16_MUTATION_9_ASYNC_2_DEPRECATED_STAY_UNAVAILABLE_PASS');

const baseTransport = fs.readFileSync(path.join(baseRoot, 'shared/provider_transport_core.js'), 'utf8');
const candidateTransport = fs.readFileSync(path.join(candidateRoot, 'shared/provider_transport_core.js'), 'utf8');
const bPrefix = baseTransport.slice(0, baseTransport.indexOf('  async function executePerformanceJsonOnce'));
const cPrefix = candidateTransport.slice(0, candidateTransport.indexOf('  async function executePerformanceJsonOnce'));
if (bPrefix !== cPrefix) throw new Error('Seller/readResponse transport prefix changed');
console.log('PERFORMANCE_STEP6_SELLER_TRANSPORT_BYTE_PREFIX_PRESERVED_PASS');

async function binaryTests() {
  const bytes = new Uint8Array([0, 1, 2, 255]);
  for (const alias of directBinary.keys()) {
    const req = C.OzonContract.buildPerformanceRequest(cOps[alias].template, {});
    let count = 0;
    const ct = alias === 'performance_statistics_report_download' ? 'application/zip' : 'text/csv; charset=utf-8';
    const fetchImpl = async () => { count += 1; return { ok: true, status: 200, headers: { get: (n) => String(n).toLowerCase() === 'content-type' ? ct : null }, arrayBuffer: async () => bytes.buffer }; };
    const r = await C.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl, request: req, now: () => 1 });
    if (count !== 1 || r.rawText !== '' || r.parsed?.encoding !== 'base64' || r.parsed?.file_content_base64 !== 'AAEC/w==' || r.parsed?.byte_length !== 4) throw new Error(`binary preservation failed ${alias}`);
  }
  console.log('PERFORMANCE_STEP6_BINARY_BYTE_PRESERVING_SINGLE_BUSINESS_REQUEST_PASS');
  const req = C.OzonContract.buildPerformanceRequest(cOps.performance_expense_csv.template, {});
  let ec = 0;
  const er = await C.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl: async () => { ec += 1; return { ok: false, status: 404, headers: { get: () => 'application/json' }, text: async () => '{"code":"not_found"}' }; }, request: req, now: () => 1 });
  if (ec !== 1 || er.parsed?.code !== 'not_found' || er.rawText !== '{"code":"not_found"}') throw new Error('binary JSON error behavior failed');
  console.log('PERFORMANCE_STEP6_BINARY_JSON_ERROR_SINGLE_REQUEST_PASS');
  let bc = 0;
  let blocked = false;
  try {
    await C.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl: async () => { bc += 1; return { ok: true, status: 200, headers: { get: () => 'application/json' }, arrayBuffer: async () => bytes.buffer }; }, request: req, now: () => 1 });
  } catch (e) { blocked = e.code === 'PROVIDER_BINARY_CONTENT_TYPE_MISMATCH' && e.external_request_executed === true; }
  if (bc !== 1 || !blocked) throw new Error('binary content type fail closed failed');
  console.log('PERFORMANCE_STEP6_BINARY_CONTENT_TYPE_FAIL_CLOSED_PASS');
}
await binaryTests();

const perfSource = candidateTransport.slice(candidateTransport.indexOf('  async function executePerformanceJsonOnce'), candidateTransport.indexOf('  globalThis.ProviderTransportCore'));
if ((perfSource.match(/fetchImpl\(/g) || []).length !== 1) throw new Error('Performance transport does not have exactly one fetch call');
const contractSource = fs.readFileSync(path.join(candidateRoot, 'shared/ozon_contract.js'), 'utf8');
if (!contractSource.includes('performance_provider_not_seller_subscription')) throw new Error('separate provider entitlement marker lost');
console.log('PERFORMANCE_STEP6_NO_HIDDEN_POLLING_RETRY_FANOUT_OR_PROVIDER_CHAINING_PASS');

console.log(JSON.stringify({ seller_aliases: 219, performance_aliases: 25, current_performance_reads: 21, new_performance_reads: 15, direct_binary: 5, tree_expected: '1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f' }));
console.log('OZON_PERFORMANCE_STEP6_READ_COVERAGE_REGRESSION_PASS');
