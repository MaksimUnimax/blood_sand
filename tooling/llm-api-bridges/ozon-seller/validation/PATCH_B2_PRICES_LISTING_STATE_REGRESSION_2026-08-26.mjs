import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2] || '/mnt/data/b2_candidate';
for (const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href + `?v=${Date.now()}-${name}`);
}
const R = globalThis.OzonOperationRegistry;
const E = globalThis.OzonEntitlements;
const C = globalThis.OzonContract;
const G = globalThis.OzonGuidance;
assert(R && E && C && G);

const expected = {
  product_prices_bulk: ['POST','/v5/product/info/prices','prices','ALL_ACCOUNTS'],
  product_price_details: ['POST','/v1/product/prices/details','prices','SUBSCRIPTION_RESTRICTED'],
  seller_actions_list: ['POST','/v1/seller-actions/list','actions_promotions','ALL_ACCOUNTS'],
  seller_action_products: ['POST','/v1/seller-actions/products/list','actions_promotions','ALL_ACCOUNTS']
};
for (const [alias,[method,p,section,access]] of Object.entries(expected)) {
  const m = R.OPERATIONS[alias];
  assert(m, alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,'json_body'); assert.equal(m.execution_enabled,true);
  assert.equal(m.cluster,'prices_promotions'); assert.equal(m.section,section);
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
  const rule = E.BUNDLED_SNAPSHOT.operations[`${method} ${p}`];
  assert(rule); assert.equal(rule.default_access,access); assert.deepEqual(rule.feature_rules,[]);
  if (alias === 'product_price_details') assert.deepEqual(rule.endpoint_allowed_subscription_types,['PREMIUM_PRO']);
  else assert.equal(rule.endpoint_allowed_subscription_types,null);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B2_PRICES_LISTING_REGISTRY_PASS');

let cmd = C.normalizeCommand({operation:'product_prices_bulk',params:{filter:{offer_id:['offer-1'],product_id:['1082848375'],visibility:'ALL'},cursor:'next',limit:1000}});
let req = C.buildRequest(cmd, {'Client-Id':'x','Api-Key':'y'});
assert.equal(req.url,'https://api-seller.ozon.ru/v5/product/info/prices'); assert.equal(req.method,'POST');
assert.deepEqual(JSON.parse(req.body),cmd.params);

cmd = C.normalizeCommand({operation:'product_price_details',params:{skus:['1602711278']}});
req = C.buildRequest(cmd,{});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/prices/details'); assert.deepEqual(JSON.parse(req.body),cmd.params);

cmd = C.normalizeCommand({operation:'seller_actions_list',params:{action_ids:['1'],action_type:['DISCOUNT'],limit:100,offset:0,search:'',status:['ACTIVE']}});
req = C.buildRequest(cmd,{});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/seller-actions/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);

cmd = C.normalizeCommand({operation:'seller_action_products',params:{action_id:1,cursor:0,limit:100}});
req = C.buildRequest(cmd,{});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/seller-actions/products/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B2_PRICES_LISTING_EXACT_REQUEST_PASS');

function rejects(command, code) {
  assert.throws(() => C.normalizeCommand(command), (e) => e && e.code === code, JSON.stringify(command));
}
rejects({operation:'product_prices_bulk',params:{url:'https://evil.example',filter:{},limit:1}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'product_prices_bulk',params:{headers:{Authorization:'x'},filter:{},limit:1}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'product_prices_bulk',params:{filter:{unknown:1},limit:1}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'product_prices_bulk',params:{filter:{product_id:[1082848375]},limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_prices_bulk',params:{filter:{visibility:'NOT_REAL'},limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_prices_bulk',params:{filter:{},limit:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_prices_bulk',params:{filter:{},limit:1001}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_price_details',params:{skus:[]}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_price_details',params:{skus:[1602711278]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_price_details',params:{skus:['9223372036854775808']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_actions_list',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_actions_list',params:{limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_actions_list',params:{limit:1,action_ids:['-1']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_actions_list',params:{limit:1,action_ids:['18446744073709551616']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_actions_list',params:{limit:1,action_type:['NOT_REAL']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_actions_list',params:{limit:1,status:['NOT_REAL']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_action_products',params:{action_id:-1,limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_action_products',params:{action_id:Number.MAX_SAFE_INTEGER+1,limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_action_products',params:{action_id:1,limit:0}},'OZON_LIMIT_VIOLATION');
assert.throws(() => C.normalizeCommand({operation:'product_prices_bulk',params:{filter:{},limit:1},method:'GET'}), e => e && e.code === 'UNKNOWN_TOP_LEVEL_FIELD');
console.log('B2_PRICES_LISTING_CONTRACT_PASS');

let requirement = E.requirementFor(C.normalizeCommand(R.OPERATIONS.product_prices_bulk.template));
assert.equal(requirement.known,true); assert.equal(requirement.required,false);
requirement = E.requirementFor(C.normalizeCommand(R.OPERATIONS.product_price_details.template));
assert.equal(requirement.known,true); assert.equal(requirement.required,true);
assert.deepEqual(requirement.allowed_subscription_types,['PREMIUM_PRO']);
assert(requirement.reasons.includes('endpoint_subscription_restriction'));
for (const alias of ['seller_actions_list','seller_action_products']) {
  requirement = E.requirementFor(C.normalizeCommand(R.OPERATIONS[alias].template));
  assert.equal(requirement.known,true); assert.equal(requirement.required,false);
}
console.log('B2_PRICES_LISTING_ENTITLEMENTS_PASS');

let help = G.parseHelp('OZON_HELP_V2\n{"cluster":"prices_promotions","section":"prices"}');
assert.equal(help.ok,true);
let gr = G.result({status:'guidance',cluster:'prices_promotions',section:'prices',version:2});
assert.deepEqual(gr.choices.map(x=>x.operation).sort(),['product_price_details','product_prices_bulk'].sort());
assert.equal(gr.external_request_executed,false); assert.equal(gr.physical_business_request_count,0);
help = G.parseHelp('OZON_HELP_V2\n{"cluster":"prices_promotions","section":"actions_promotions"}');
assert.equal(help.ok,true);
gr = G.result({status:'guidance',cluster:'prices_promotions',section:'actions_promotions',version:2});
assert.deepEqual(gr.choices.map(x=>x.operation).sort(),['seller_action_products','seller_actions_list'].sort());
assert.equal(gr.external_request_executed,false); assert.equal(gr.physical_business_request_count,0);
console.log('B2_PRICES_LISTING_GUIDANCE_PASS');

for (const alias of Object.keys(expected)) {
  const built = C.buildRequest(C.normalizeCommand(R.OPERATIONS[alias].template),{});
  assert.equal(typeof built.url,'string'); assert(!Array.isArray(built));
}
console.log('B2_NO_HIDDEN_PAGINATION_FANOUT_PASS');

for (const [alias, url] of Object.entries({
  seller_product_list:'https://api-seller.ozon.ru/v3/product/list',
  seller_product_info_list:'https://api-seller.ozon.ru/v3/product/info/list',
  seller_product_attributes:'https://api-seller.ozon.ru/v4/product/info/attributes'
})) {
  assert(R.OPERATIONS[alias]);
  const built=C.buildRequest(C.normalizeCommand(R.OPERATIONS[alias].template),{});
  assert.equal(built.url,url); assert.equal(built.method,'POST');
}
console.log('B2_B1_ASSORTMENT_REGRESSION_PASS');

const protectedB1Runtime = {
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
  'shared/ai_adapters.js':'5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9',
  'shared/conversation_identity.js':'939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57'
};
for (const [rel, expectedSha] of Object.entries(protectedB1Runtime)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');
  assert.equal(actual, expectedSha, `protected identity ${rel}`);
}
console.log('B2_PROTECTED_RUNTIME_IDENTITIES_PASS');

const swaggerPath = process.argv[3] || '';
if (fs.existsSync(swaggerPath)) {
  const bytes=fs.readFileSync(swaggerPath);
  const sourceHash=crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sourceHash,'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const swagger=JSON.parse(bytes);
  const snap=E.compileSnapshot(swagger,{sourceHash,capturedAt:'2026-08-25T00:00:00.000Z'});
  for (const key of ['POST /v5/product/info/prices','POST /v1/seller-actions/list','POST /v1/seller-actions/products/list']) {
    assert.equal(snap.operations[key]?.default_access,'ALL_ACCOUNTS',key);
  }
  const premium=snap.operations['POST /v1/product/prices/details'];
  assert.equal(premium?.default_access,'SUBSCRIPTION_RESTRICTED');
  assert.deepEqual(premium?.endpoint_allowed_subscription_types,['PREMIUM_PRO']);

  const prices=swagger.paths?.['/v5/product/info/prices']?.post;
  assert.equal(prices?.operationId,'ProductAPI_GetProductInfoPrices');
  assert.equal(prices?.requestBody?.required,true);
  const details=swagger.paths?.['/v1/product/prices/details']?.post;
  assert.equal(details?.operationId,'ProductPricesDetails');
  assert.match(String(details?.description||''),/Premium Pro/i);
  const actions=swagger.paths?.['/v1/seller-actions/list']?.post;
  assert.equal(actions?.operationId,'SellerActionsList');
  const actionProducts=swagger.paths?.['/v1/seller-actions/products/list']?.post;
  assert.equal(actionProducts?.operationId,'SellerActionsProductsList');
  console.log('B2_OFFICIAL_SWAGGER_CONTRACT_PASS');
  console.log('B2_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS');
}
