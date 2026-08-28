import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL as U } from 'node:url';

const root = path.resolve(process.argv[2]);
const swaggerPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const load = (name) => import(U(path.join(root, 'shared', name)).href + `?b40=${Date.now()}${name}`);
for (const name of ['runtime_names.js', 'ozon_operation_registry.js', 'ozon_entitlements.js', 'ozon_contract.js', 'ozon_guidance.js']) await load(name);
const R = globalThis.OzonOperationRegistry;
const E = globalThis.OzonEntitlements;
const C = globalThis.OzonContract;
const G = globalThis.OzonGuidance;
assert(R && E && C && G);

const OPS = {
  finance_balance: ['/v1/finance/balance', 'accruals_balance'],
  finance_realization_by_day: ['/v1/finance/realization/by-day', 'realization'],
  finance_realization_posting: ['/v1/finance/realization/posting', 'realization'],
  finance_realization_v2: ['/v2/finance/realization', 'realization']
};
for (const [operation, [apiPath, section]] of Object.entries(OPS)) {
  const meta = R.OPERATIONS[operation];
  assert(meta, operation);
  for (const [key, value] of Object.entries({
    provider: 'seller_api', method: 'POST', path: apiPath, effect: 'READ', request_style: 'json_body',
    execution_enabled: true, currentness: 'current', safety_class: 'READ_SAFE', privacy_policy: 'safe_projection',
    cluster: 'finance', section, workflow_role: 'single_read', guidance_visibility: 'user', entitlement_key: `POST ${apiPath}`
  })) assert.deepEqual(meta[key], value, `${operation}.${key}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok, true);
console.log('B40_FINANCE_BALANCE_REALIZATION_REGISTRY_PASS');

const req = (operation, params) => C.buildRequest(C.normalizeCommand({ operation, params }), {});
const bad = (operation, params, code = 'INVALID_OPERATION_PARAMS') => assert.throws(
  () => C.normalizeCommand({ operation, params }),
  (error) => error?.code === code
);
let r = req('finance_balance', { date_from: '2026-08-01T00:00:00Z', date_to: '2026-08-28T23:59:59Z' });
assert.equal(r.url, 'https://api-seller.ozon.ru/v1/finance/balance');
assert.deepEqual(JSON.parse(r.body), { date_from: '2026-08-01T00:00:00Z', date_to: '2026-08-28T23:59:59Z' });
bad('finance_balance', { date_from: '2026-08-01T00:00:00Z' });
bad('finance_balance', { date_from: '2026-08-01', date_to: '2026-08-28T23:59:59Z' });
bad('finance_balance', { date_from: '2026-08-01T00:00:00Z', date_to: '2026-08-28T23:59:59Z', headers: { x: 'y' } }, 'TRANSPORT_INJECTION_REJECTED');

r = req('finance_realization_by_day', { day: -1, month: 0, year: 2026 });
assert.equal(r.url, 'https://api-seller.ozon.ru/v1/finance/realization/by-day');
assert.deepEqual(JSON.parse(r.body), { day: -1, month: 0, year: 2026 });
bad('finance_realization_by_day', { day: 1, month: 8 });
bad('finance_realization_by_day', { day: 1.5, month: 8, year: 2026 });
bad('finance_realization_by_day', { day: 1, month: 8, year: 2147483648 });

r = req('finance_realization_posting', { month: -7, year: 2023 });
assert.equal(r.url, 'https://api-seller.ozon.ru/v1/finance/realization/posting');
assert.deepEqual(JSON.parse(r.body), { month: -7, year: 2023 });
r = req('finance_realization_v2', { month: 2147483647, year: -2147483648 });
assert.equal(r.url, 'https://api-seller.ozon.ru/v2/finance/realization');
assert.deepEqual(JSON.parse(r.body), { month: 2147483647, year: -2147483648 });
bad('finance_realization_posting', { month: 8 });
bad('finance_realization_v2', { month: '8', year: 2026 });
bad('finance_realization_v2', { month: 8, year: 2026, url: 'https://evil.example' }, 'TRANSPORT_INJECTION_REJECTED');
console.log('B40_FINANCE_BALANCE_REALIZATION_EXACT_REQUEST_CONTRACTS_PASS');

for (const operation of ['finance_balance', 'finance_realization_posting', 'finance_realization_v2']) {
  const command = C.normalizeCommand(R.OPERATIONS[operation].template);
  const requirement = E.requirementFor(command);
  const plan = C.planCommandForSellerCapability(command, null);
  assert.equal(requirement.known, true);
  assert.equal(requirement.required, false);
  assert.equal(plan.action, 'execute');
  assert.equal(plan.planning.entitlement.capability_required, false);
}
{
  const command = C.normalizeCommand(R.OPERATIONS.finance_realization_by_day.template);
  const requirement = E.requirementFor(command);
  const plan = C.planCommandForSellerCapability(command, null);
  assert.equal(requirement.known, true);
  assert.equal(requirement.required, true);
  assert.deepEqual(requirement.allowed_subscription_types, ['PREMIUM_PLUS', 'PREMIUM_PRO']);
  assert.equal(plan.action, 'reject');
  assert.equal(plan.error.code, 'ENTITLEMENT_UNKNOWN');
}
console.log('B40_FINANCE_BALANCE_REALIZATION_ENTITLEMENTS_PASS');

for (const section of ['accruals_balance', 'realization']) {
  const guidance = G.result({ status: 'guidance', cluster: 'finance', section, version: 2 });
  for (const [operation, [, opSection]] of Object.entries(OPS)) if (opSection === section) assert(guidance.choices.some((choice) => choice.operation === operation));
  assert.equal(guidance.physical_business_request_count, 0);
  assert.equal(guidance.external_request_executed, false);
}
console.log('B40_GUIDANCE_ZERO_REQUEST_PASS');

for (const operation of Object.keys(OPS)) {
  const clean = C.sanitizeResult(R.OPERATIONS[operation].template, {
    total: { value: 12.5, currency_code: 'RUB' },
    payer_name: 'ООО Продавец', receiver_name: 'ООО Ozon', phone: '+79990000000', email: 'a@example.test', address: 'secret'
  });
  assert.equal(clean.total.value, 12.5);
  assert.equal(clean.payer_name, 'ООО Продавец');
  assert.equal(clean.receiver_name, 'ООО Ozon');
  assert.equal(clean.phone, '[REDACTED]');
  assert.equal(clean.email, '[REDACTED]');
  assert.equal(clean.address, '[REDACTED]');
}
console.log('B40_SAFE_PROJECTION_PASS');

for (const [operation, apiPath] of Object.entries({
  warehouse_fbs_pickup_history_list: '/v1/warehouse/fbs/pickup/history/list',
  delivery_polygon_list: '/v1/polygon/list',
  finance_cash_flow_statement_list: '/v1/finance/cash-flow-statement/list',
  finance_transaction_list_v3: '/v3/finance/transaction/list',
  removal_from_stock_list: '/v1/removal/from-stock/list',
  marketplace_search_queries_top: '/v1/search-queries/top',
  fbp_draft_dropoff_province_list: '/v1/fbp/draft/drop-off/province/list'
})) assert.equal(R.OPERATIONS[operation]?.path, apiPath);
console.log('B40_B39_AND_EARLIER_CARRY_FORWARD_PASS');

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
for (const operation of Object.keys(OPS)) {
  const meta = R.OPERATIONS[operation];
  assert.equal(meta.workflow_role, 'single_read');
  assert(!('pagination' in meta));
  assert(!('retry' in meta));
  assert(!('polling' in meta));
  assert(!('fanout' in meta));
  assert(!('provider_chain' in meta));
}
console.log('B40_PROTECTED_RUNTIME_IDENTITIES_PASS');
console.log('B40_NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING_PASS');

if (swaggerPath) {
  const raw = fs.readFileSync(swaggerPath);
  assert.equal(raw.length, 3933043);
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), '39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw = JSON.parse(raw.toString('utf8'));
  assert.equal(sw.openapi, '3.0.0');
  assert.equal(Object.keys(sw.paths).length, 463);
  const expected = {
    '/v1/finance/balance': ['GetFinanceBalanceV1', 'BetaMethod', 'v1GetFinanceBalanceV1Request', ['date_from', 'date_to']],
    '/v1/finance/realization/by-day': ['FinanceAPI_GetRealizationByDayReportV1', 'Premium', 'v1GetRealizationReportByDayRequest', ['day', 'month', 'year']],
    '/v1/finance/realization/posting': ['FinanceAPI_GetRealizationReportV1', 'FinanceAPI', 'v1GetRealizationReportPostingRequest', ['month', 'year']],
    '/v2/finance/realization': ['FinanceAPI_GetRealizationReportV2', 'FinanceAPI', 'v2GetRealizationReportRequestV2', ['month', 'year']]
  };
  for (const [apiPath, [operationId, tag, schemaName, required]] of Object.entries(expected)) {
    const op = sw.paths[apiPath]?.post;
    assert(op);
    assert.equal(op.operationId, operationId);
    assert.deepEqual(op.tags, [tag]);
    assert.notEqual(op.deprecated, true);
    const ref = op.requestBody?.content?.['application/json']?.schema?.$ref;
    assert.equal(ref, `#/components/schemas/${schemaName}`);
    const schema = sw.components.schemas[schemaName];
    assert.deepEqual(new Set(schema.required), new Set(required));
    for (const field of required) assert(schema.properties[field]);
  }
  const balance = sw.components.schemas.v1GetFinanceBalanceV1Request;
  for (const key of ['date_from', 'date_to']) {
    assert.equal(balance.properties[key].type, 'string');
    assert.equal(balance.properties[key].format, 'date-time');
  }
  for (const schemaName of ['v1GetRealizationReportByDayRequest', 'v1GetRealizationReportPostingRequest', 'v2GetRealizationReportRequestV2']) {
    const schema = sw.components.schemas[schemaName];
    for (const prop of Object.values(schema.properties)) {
      assert.equal(prop.type, 'integer');
      assert.equal(prop.format, 'int32');
      assert.equal(Object.prototype.hasOwnProperty.call(prop, 'minimum'), false);
      assert.equal(Object.prototype.hasOwnProperty.call(prop, 'maximum'), false);
    }
  }
  const snapshot = E.compileSnapshot(sw, { sourceHash: 'b40-exact-swagger', capturedAt: '2026-08-28T00:00:00.000Z' });
  assert.equal(snapshot.operations['POST /v1/finance/balance'].default_access, 'ALL_ACCOUNTS');
  assert.deepEqual(snapshot.operations['POST /v1/finance/realization/by-day'].endpoint_allowed_subscription_types, ['PREMIUM_PLUS', 'PREMIUM_PRO']);
  assert.equal(snapshot.operations['POST /v1/finance/realization/posting'].default_access, 'ALL_ACCOUNTS');
  assert.equal(snapshot.operations['POST /v2/finance/realization'].default_access, 'ALL_ACCOUNTS');

  const responseRefs = [
    'v1GetFinanceBalanceV1Response', 'GetRealizationReportByDayResponse',
    'v1GetRealizationReportPostingResponse', 'v2GetRealizationReportResponseV2'
  ];
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
  responseRefs.forEach(visit);
  for (const key of keys) assert(!/(phone|email|address|recipient|customer|passport|first[_-]?name|last[_-]?name|middle[_-]?name|full[_-]?name|driver[_-]?name|vehicle[_-]?number)/i.test(key), `PII-like response field: ${key}`);
  console.log('B40_EXACT_SWAGGER_CURRENTNESS_ENTITLEMENTS_PRIVACY_PASS');
}

console.log('B40_AUTHOR_CI_GATE_PASS');
