import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b13-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href+`?b13=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
  ozon_actions_list:['GET','/v1/actions','query','current'],
  ozon_action_candidates:['POST','/v1/actions/candidates','json_body','current'],
  ozon_action_products:['POST','/v1/actions/products','json_body','current'],
  ozon_auto_add_products:['POST','/v1/actions/auto-add/products/list','json_body','beta'],
  ozon_auto_add_candidates:['POST','/v1/actions/auto-add/products/candidates','json_body','beta']
};
for(const [alias,[method,p,style,currentness]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true);
  assert.equal(m.currentness,currentness); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection');
  assert.equal(m.cluster,'prices_promotions'); assert.equal(m.section,'actions_promotions');
  assert.equal(m.guidance_visibility,'user'); assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B13_PROMOTIONS_MARKET_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('ozon_actions_list',{});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/actions'); assert.equal(req.method,'GET'); assert.equal(req.body,undefined); assert(!Array.isArray(req));
[cmd,req]=build('ozon_action_candidates',{action_id:1.5,limit:100,last_id:2.25});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/actions/candidates'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('ozon_action_products',{action_id:7,limit:50,last_id:9});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/actions/products'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('ozon_auto_add_products',{action_id:250204,auto_add_date:'2035-08-28T14:00:00Z',limit:100,offset:0});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/actions/auto-add/products/list'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('ozon_auto_add_candidates',{action_id:250204,auto_add_date:'2035-08-28T14:00:00+03:00',limit:1,offset:10});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/actions/auto-add/products/candidates'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
console.log('B13_PROMOTIONS_MARKET_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'ozon_actions_list',params:{x:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_action_candidates',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_action_candidates',params:{action_id:'1'}},'INVALID_OPERATION_PARAMS');
assert.throws(()=>C.normalizeCommand({operation:'ozon_action_candidates',params:{action_id:NaN}}),e=>e&&e.code==='INVALID_NUMBER');
rejects({operation:'ozon_action_candidates',params:{action_id:1,url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'ozon_action_products',params:{action_id:1,extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'ozon_auto_add_products',params:{action_id:1,auto_add_date:'2035-08-28T14:00:00Z'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_auto_add_products',params:{action_id:'1',auto_add_date:'2035-08-28T14:00:00Z',limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_auto_add_products',params:{action_id:1,auto_add_date:'not-a-date',limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_auto_add_products',params:{action_id:1,auto_add_date:'2035-08-28T14:00:00Z',limit:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'ozon_auto_add_products',params:{action_id:1,auto_add_date:'2035-08-28T14:00:00Z',limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'ozon_auto_add_candidates',params:{action_id:1,auto_add_date:'2035-08-28T14:00:00Z',limit:1,offset:-1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_auto_add_candidates',params:{action_id:1,auto_add_date:'2035-08-28T14:00:00Z',limit:1,extra:true}},'UNKNOWN_OPERATION_PARAM');
console.log('B13_PROMOTIONS_MARKET_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const command=C.normalizeCommand(R.OPERATIONS[alias].template);
  const requirement=E.requirementFor(command);
  assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias);
  const plan=C.planCommandForSellerCapability(command,null);
  assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B13_PROMOTIONS_MARKET_ENTITLEMENTS_PASS');

assert.equal(R.OPERATIONS.ozon_action_candidates.workflow_role,'single_read');
assert.equal(R.OPERATIONS.ozon_action_products.workflow_role,'single_read');
assert.equal(R.OPERATIONS.ozon_auto_add_products.workflow_role,'single_read');
assert.equal(R.OPERATIONS.ozon_auto_add_candidates.workflow_role,'single_read');
const guidance=G.result({status:'guidance',cluster:'prices_promotions',section:'actions_promotions',version:2});
for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias);
assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B13_PROMOTIONS_NO_AUTOPAGINATION_AND_GUIDANCE_ZERO_REQUEST_PASS');

for(const [alias,p] of Object.entries({
  seller_actions_list:'/v1/seller-actions/list',
  seller_action_products:'/v1/seller-actions/products/list',
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
console.log('B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
  const expected={
    'GET /v1/actions':['Promos','Promos'],
    'POST /v1/actions/candidates':['PromosCandidates','Promos'],
    'POST /v1/actions/products':['PromosProducts','Promos'],
    'POST /v1/actions/auto-add/products/list':['ActionsAutoAddProductsList','PromosBeta'],
    'POST /v1/actions/auto-add/products/candidates':['ActionsAutoAddProductsCandidates','PromosBeta']
  };
  for(const [key,[id,tag]] of Object.entries(expected)){
    const [method,p]=key.split(' '); const op=sw.paths?.[p]?.[method.toLowerCase()];
    assert(op,key); assert.notEqual(op.deprecated,true,key); assert.equal(op.operationId,id,key); assert(op.tags?.includes(tag),`${key}:${tag}`);
  }
  assert.equal(sw.paths['/v1/actions'].get.requestBody,undefined);
  assert.equal(sw.paths['/v1/actions'].get.parameters,undefined);
  const page=sw.components.schemas.seller_apiGetSellerProductV1Request;
  assert.deepEqual(page.required,['action_id']); assert.equal(page.properties.action_id.type,'number'); assert.equal(page.properties.action_id.format,'double');
  assert.equal(page.properties.limit.type,'number'); assert.equal(page.properties.limit.format,'double');
  assert.equal(page.properties.last_id.type,'number'); assert.equal(page.properties.last_id.format,'double');
  for(const schemaName of ['actions.v1.ActionsAutoAddProductsListRequest','actions.v1.ActionsAutoAddProductsCandidatesRequest']){
    const s=sw.components.schemas[schemaName]; assert.deepEqual(s.required,['action_id','auto_add_date','limit']);
    assert.equal(s.properties.action_id.type,'integer'); assert.equal(s.properties.action_id.format,'uint64');
    assert.equal(s.properties.auto_add_date.type,'string'); assert.equal(s.properties.auto_add_date.format,'date-time');
    assert.equal(s.properties.limit.minimum,1); assert.equal(s.properties.limit.maximum,100); assert.equal(s.properties.limit.format,'uint64');
    assert.equal(s.properties.offset.type,'integer'); assert.equal(s.properties.offset.format,'uint64');
  }
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-27T00:00:00.000Z'});
  assert.equal(snap.unresolved_rule_count,12);
  for(const key of Object.keys(expected)){
    const rule=snap.operations[key]; assert(rule,key); assert.equal(rule.default_access,'ALL_ACCOUNTS',key); assert.equal(rule.endpoint_allowed_subscription_types,null,key);
  }
  console.log('B13_PROMOTIONS_MARKET_EXACT_SWAGGER_CURRENTNESS_PASS');
  console.log('B13_PROMOTIONS_MARKET_EXACT_ENTITLEMENTS_PASS');
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
console.log('B13_PROMOTIONS_MARKET_PROTECTED_RUNTIME_IDENTITIES_PASS');
