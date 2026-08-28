import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL as U } from 'node:url';

const root = path.resolve(process.argv[2]);
const swaggerPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const load = (name) => import(U(path.join(root, 'shared', name)).href + `?b41=${Date.now()}${name}`);
for (const name of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_entitlements.js', 'ozon_contract.js', 'ozon_guidance.js']) await load(name);
const R = globalThis.OzonOperationRegistry;
const E = globalThis.OzonEntitlements;
const C = globalThis.OzonContract;
const G = globalThis.OzonGuidance;
assert(R && E && C && G);

const operation = 'finance_products_buyout';
const apiPath = '/v1/finance/products/buyout';
const meta = R.OPERATIONS[operation];
assert(meta);
for (const [key, value] of Object.entries({
  provider: 'seller_api', method: 'POST', path: apiPath, effect: 'READ', request_style: 'json_body',
  execution_enabled: true, currentness: 'current', safety_class: 'READ_SAFE', privacy_policy: 'safe_projection',
  cluster: 'finance', section: 'documents_reports', workflow_role: 'single_read', guidance_visibility: 'user', entitlement_key: `POST ${apiPath}`
})) assert.deepEqual(meta[key], value, `${operation}.${key}`);
assert.equal(R.catalogValidation(C.OPERATIONS).ok, true);
console.log('B41_FINANCE_BUYOUT_REGISTRY_PASS');

const req = (params) => C.buildRequest(C.normalizeCommand({ operation, params }), {});
const bad = (params, code = 'INVALID_OPERATION_PARAMS') => assert.throws(
  () => C.normalizeCommand({ operation, params }),
  (error) => error?.code === code
);
let r = req({ date_from: '2026-08-01', date_to: '2026-08-28' });
assert.equal(r.url, 'https://api-seller.ozon.ru/v1/finance/products/buyout');
assert.equal(r.method, 'POST');
assert.deepEqual(JSON.parse(r.body), { date_from: '2026-08-01', date_to: '2026-08-28' });
r = req({ date_from: 'not-a-date-but-swagger-string', date_to: 'also-a-string' });
assert.deepEqual(JSON.parse(r.body), { date_from: 'not-a-date-but-swagger-string', date_to: 'also-a-string' });
bad({ date_from: '2026-08-01' });
bad({ date_to: '2026-08-28' });
bad({ date_from: 20260801, date_to: '2026-08-28' });
bad({ date_from: '', date_to: '2026-08-28' });
bad({ date_from: '2026-08-01', date_to: '2026-08-28', url: 'https://evil.example' }, 'TRANSPORT_INJECTION_REJECTED');
bad({ date_from: '2026-08-01', date_to: '2026-08-28', headers: { x: 'y' } }, 'TRANSPORT_INJECTION_REJECTED');
console.log('B41_FINANCE_BUYOUT_EXACT_REQUEST_CONTRACT_PASS');

{
  const command = C.normalizeCommand(meta.template);
  const requirement = E.requirementFor(command);
  const plan = C.planCommandForSellerCapability(command, null);
  assert.equal(requirement.known, true);
  assert.equal(requirement.required, false);
  assert.equal(requirement.default_access, 'ALL_ACCOUNTS');
  assert.equal(plan.action, 'execute');
  assert.equal(plan.planning.entitlement.capability_required, false);
}
console.log('B41_FINANCE_BUYOUT_ENTITLEMENT_PASS');

{
  const guidance = G.result({ status: 'guidance', cluster: 'finance', section: 'documents_reports', version: 2 });
  assert(guidance.choices.some((choice) => choice.operation === operation));
  assert.equal(guidance.physical_business_request_count, 0);
  assert.equal(guidance.external_request_executed, false);
}
console.log('B41_GUIDANCE_ZERO_REQUEST_PASS');

{
  const clean = C.sanitizeResult(meta.template, {
    products: [{ sku: 1, offer_id: 'A', posting_number: '0001', amount: 10.5 }],
    phone: '+79990000000', email: 'x@example.test', address: 'secret', customer_name: 'Secret Person'
  });
  assert.equal(clean.products[0].posting_number, '0001');
  assert.equal(clean.phone, '[REDACTED]');
  assert.equal(clean.email, '[REDACTED]');
  assert.equal(clean.address, '[REDACTED]');
  assert.equal(clean.customer_name, '[REDACTED]');
}
console.log('B41_SAFE_PROJECTION_PASS');

for (const [op, expectedPath] of Object.entries({
  finance_balance: '/v1/finance/balance',
  finance_realization_by_day: '/v1/finance/realization/by-day',
  finance_realization_posting: '/v1/finance/realization/posting',
  finance_realization_v2: '/v2/finance/realization',
  finance_transaction_list_v3: '/v3/finance/transaction/list',
  finance_cash_flow_statement_list: '/v1/finance/cash-flow-statement/list',
  warehouse_fbs_pickup_history_list: '/v1/warehouse/fbs/pickup/history/list',
  delivery_polygon_list: '/v1/polygon/list',
  removal_from_stock_list: '/v1/removal/from-stock/list',
  marketplace_search_queries_top: '/v1/search-queries/top'
})) assert.equal(R.OPERATIONS[op]?.path, expectedPath, op);
console.log('B41_B40_AND_EARLIER_CARRY_FORWARD_PASS');

const PROTECTED = {
  'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
  'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'
};
for (const [rel, hash] of Object.entries(PROTECTED)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
  assert.equal(actual, hash, rel);
}
for (const key of ['pagination', 'retry', 'polling', 'fanout', 'provider_chain', 'provider_chaining', 'secondary_detail_calls', 'capability_probe']) assert(!Object.prototype.hasOwnProperty.call(meta, key), key);
assert.equal(meta.workflow_role, 'single_read');
console.log('B41_PROTECTED_RUNTIME_IDENTITIES_PASS');
console.log('B41_NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING_PASS');

if (swaggerPath) {
  const raw = fs.readFileSync(swaggerPath);
  assert.equal(raw.length, 3933043);
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), '39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw = JSON.parse(raw.toString('utf8'));
  assert.equal(sw.openapi, '3.0.0');
  assert.equal(Object.keys(sw.paths).length, 463);

  const op = sw.paths[apiPath]?.post;
  assert(op);
  assert.equal(op.operationId, 'GetFinanceProductsBuyout');
  assert.deepEqual(op.tags, ['FinanceAPI']);
  assert.notEqual(op.deprecated, true);
  const requestRef = op.requestBody?.content?.['application/json']?.schema?.$ref;
  assert.equal(requestRef, '#/components/schemas/v1GetFinanceProductsBuyoutRequest');
  const requestSchema = sw.components.schemas.v1GetFinanceProductsBuyoutRequest;
  assert.deepEqual(new Set(requestSchema.required), new Set(['date_from', 'date_to']));
  for (const key of ['date_from', 'date_to']) {
    const field = requestSchema.properties[key];
    assert.equal(field.type, 'string');
    assert.equal(Object.prototype.hasOwnProperty.call(field, 'format'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(field, 'minLength'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(field, 'maxLength'), false);
  }
  assert.match(requestSchema.properties.date_to.description, /Максимальный период — 31 день/);
  const responseRef = op.responses?.['200']?.content?.['application/json']?.schema?.$ref;
  assert.equal(responseRef, '#/components/schemas/v1GetFinanceProductsBuyoutResponse');

  const snapshot = E.compileSnapshot(sw, { sourceHash: 'b41-exact-swagger', capturedAt: '2026-08-28T00:00:00.000Z' });
  const rule = snapshot.operations['POST /v1/finance/products/buyout'];
  assert(rule);
  assert.equal(rule.default_access, 'ALL_ACCOUNTS');
  assert.equal(rule.endpoint_allowed_subscription_types, null);

  const seen = new Set();
  const keys = new Set();
  const visit = (name) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    const schema = sw.components.schemas[name];
    if (!schema) return;
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      keys.add(key);
      const ref = prop?.$ref?.split('/').pop();
      const itemRef = prop?.items?.$ref?.split('/').pop();
      if (ref) visit(ref);
      if (itemRef) visit(itemRef);
    }
  };
  visit('v1GetFinanceProductsBuyoutResponse');
  for (const key of keys) assert(!/(phone|email|address|recipient|customer|passport|first[_-]?name|last[_-]?name|middle[_-]?name|full[_-]?name|driver[_-]?name|vehicle[_-]?number|file[_-]?url)/i.test(key), `PII/document-like response field: ${key}`);

  const totals = sw.paths['/v3/finance/transaction/totals']?.post;
  assert.match(totals?.description || '', /будет отключён 8 сентября 2026 года/);
  const b2b = sw.components.schemas.CreateDocumentB2BSalesJSONReportResponseBuyer;
  assert(b2b?.properties?.address, 'B2B JSON buyer address must remain excluded');
  const receiptList = sw.paths['/v1/receipts/seller/list']?.post;
  assert.match(receiptList?.description || '', /Казахстан/);
  const invoice = sw.components.schemas.InvoiceGetV2ResponseResult;
  assert(invoice?.properties?.file_url, 'invoice file URL must remain excluded');
  for (const p of ['/v1/finance/compensation', '/v1/finance/decompensation']) {
    const response = sw.paths[p]?.post?.responses?.['200']?.content?.['application/json']?.schema?.$ref;
    assert.equal(response, '#/components/schemas/CreateReportResponse');
  }
  console.log('B41_EXACT_SWAGGER_CURRENTNESS_ENTITLEMENT_PRIVACY_GAP_PASS');
}

console.log('B41_AUTHOR_CI_GATE_PASS');
