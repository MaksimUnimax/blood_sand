import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b14-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href+`?b14=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
  pricing_strategy_list:['POST','/v1/pricing-strategy/list'],
  pricing_strategy_info:['POST','/v1/pricing-strategy/info'],
  pricing_strategy_products:['POST','/v1/pricing-strategy/products/list'],
  pricing_strategy_product_info:['POST','/v1/pricing-strategy/product/info']
};
for(const [alias,[method,p]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,'json_body'); assert.equal(m.execution_enabled,true);
  assert.equal(m.currentness,'current'); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection');
  assert.equal(m.cluster,'prices_promotions'); assert.equal(m.section,'pricing_strategy'); assert.equal(m.guidance_visibility,'user');
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
assert.equal(Object.values(R.OPERATIONS).some(m=>m?.path==='/v1/pricing-strategy/status'&&m?.execution_enabled===true),false);
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B14_PRICING_STRATEGY_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('pricing_strategy_list',{page:1,limit:50});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/pricing-strategy/list'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('pricing_strategy_info',{strategy_id:'strategy-1'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/pricing-strategy/info'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('pricing_strategy_products',{strategy_id:'strategy-1'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/pricing-strategy/products/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('pricing_strategy_product_info',{product_id:123}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/pricing-strategy/product/info'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B14_PRICING_STRATEGY_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'pricing_strategy_list',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_list',params:{page:0,limit:20}},'OZON_LIMIT_VIOLATION');
rejects({operation:'pricing_strategy_list',params:{page:1,limit:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'pricing_strategy_list',params:{page:1,limit:51}},'OZON_LIMIT_VIOLATION');
rejects({operation:'pricing_strategy_list',params:{page:Number.MAX_SAFE_INTEGER+1,limit:20}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_list',params:{page:'1',limit:20}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_list',params:{page:1,limit:20,offset:0}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'pricing_strategy_list',params:{page:1,limit:20,url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');

rejects({operation:'pricing_strategy_info',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_info',params:{strategy_id:''}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_info',params:{strategy_id:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_info',params:{strategy_id:'x',extra:true}},'UNKNOWN_OPERATION_PARAM');

rejects({operation:'pricing_strategy_products',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_products',params:{strategy_id:''}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_products',params:{strategy_id:'x',extra:true}},'UNKNOWN_OPERATION_PARAM');

rejects({operation:'pricing_strategy_product_info',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_product_info',params:{product_id:'1'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_product_info',params:{product_id:Number.MAX_SAFE_INTEGER+1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'pricing_strategy_product_info',params:{product_id:1,extra:true}},'UNKNOWN_OPERATION_PARAM');
console.log('B14_PRICING_STRATEGY_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const command=C.normalizeCommand(R.OPERATIONS[alias].template);
  const requirement=E.requirementFor(command);
  assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias);
  const plan=C.planCommandForSellerCapability(command,null);
  assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B14_PRICING_STRATEGY_ENTITLEMENTS_PASS');

const resultCmd=C.normalizeCommand({operation:'pricing_strategy_product_info',params:{product_id:123}});
const result=C.sanitizeResult(resultCmd,{result:{strategy_product_price:500,strategy_competitor_product_url:'https://competitor.example/item/123'}});
assert.equal(result.result.strategy_competitor_product_url,'https://competitor.example/item/123');
assert.equal(R.OPERATIONS.pricing_strategy_product_info.workflow_role,'single_read');
const guidance=G.result({status:'guidance',cluster:'prices_promotions',section:'pricing_strategy',version:2});
for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias);
assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B14_PRICING_STRATEGY_URL_DATA_ONLY_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS');

for(const [alias,p] of Object.entries({
  ozon_actions_list:'/v1/actions',
  ozon_action_candidates:'/v1/actions/candidates',
  ozon_action_products:'/v1/actions/products',
  ozon_auto_add_products:'/v1/actions/auto-add/products/list',
  ozon_auto_add_candidates:'/v1/actions/auto-add/products/candidates',
  product_prices_bulk:'/v5/product/info/prices',
  product_content_rating:'/v1/product/rating-by-sku',
  seller_rating_summary:'/v1/rating/summary',
  review_list:'/v2/review/list',
  supply_order_list:'/v3/supply-order/list'
})) { assert.equal(R.OPERATIONS[alias].path,p,alias); assert.equal(R.OPERATIONS[alias].execution_enabled,true,alias); }
let q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template)); assert.equal(q.known,false); assert.equal(q.required,false);
q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template)); assert.equal(q.known,true); assert.equal(q.required,true); assert.deepEqual(q.allowed_subscription_types,['PREMIUM_PLUS']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
  const expected={
    '/v1/pricing-strategy/list':'pricing_list',
    '/v1/pricing-strategy/info':'pricing_info',
    '/v1/pricing-strategy/products/list':'pricing_items-list',
    '/v1/pricing-strategy/product/info':'pricing_items-info'
  };
  for(const [p,id] of Object.entries(expected)){const op=sw.paths?.[p]?.post; assert(op,p); assert.notEqual(op.deprecated,true,p); assert.equal(op.operationId,id,p); assert.deepEqual(op.tags,['PricingStrategyAPI'],p);}
  const list=sw.components.schemas.v1GetStrategyListRequest; assert.deepEqual(list.required,['page','limit']); assert.equal(list.properties.page.type,'integer'); assert.equal(list.properties.page.format,'int64'); assert.match(list.properties.page.description,/Минимальное значение — `1`/); assert.equal(list.properties.limit.type,'integer'); assert.equal(list.properties.limit.format,'int64'); assert.match(list.properties.limit.description,/от `1` до `50`/);
  const strategy=sw.components.schemas.v1StrategyRequest; assert.deepEqual(strategy.required,['strategy_id']); assert.equal(strategy.properties.strategy_id.type,'string');
  const item=sw.components.schemas.v1GetStrategyItemInfoRequest; assert.deepEqual(item.required,['product_id']); assert.equal(item.properties.product_id.type,'integer'); assert.equal(item.properties.product_id.format,'int64');
  const response=sw.components.schemas.v1GetStrategyItemInfoResponseResult; assert.equal(response.properties.strategy_competitor_product_url.type,'string');
  const status=sw.paths['/v1/pricing-strategy/status'].post; assert.equal(status.operationId,'pricing_status'); assert.match(status.summary,/Изменить статус стратегии/); assert.equal(Object.values(R.OPERATIONS).some(m=>m?.path==='/v1/pricing-strategy/status'&&m?.execution_enabled===true),false);
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-27T00:00:00.000Z'}); assert.equal(snap.unresolved_rule_count,12);
  for(const p of Object.keys(expected)){const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);}
  console.log('B14_PRICING_STRATEGY_EXACT_SWAGGER_CURRENTNESS_PASS');
  console.log('B14_PRICING_STRATEGY_EXACT_ENTITLEMENTS_PASS');
}

const protectedRuntime={
  'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508',
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'
};
for(const [rel,sha] of Object.entries(protectedRuntime)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8');
assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/);
console.log('B14_PRICING_STRATEGY_PROTECTED_RUNTIME_IDENTITIES_PASS');
