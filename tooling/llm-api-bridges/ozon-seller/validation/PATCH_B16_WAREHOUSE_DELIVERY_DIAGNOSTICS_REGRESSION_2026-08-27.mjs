import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b16-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await import(pathToFileURL(path.join(root,'shared',name)).href+`?b16=${Date.now()}-${name}`);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance; assert(R&&E&&C&&G);

const ops={
 seller_delivery_method_list:['/v2/delivery-method/list','json_body','delivery_methods'],
 delivery_method_return_settings:['/v1/delivery-method/return/settings/get','json_body','delivery_methods'],
 warehouse_invalid_products:['/v1/warehouse/invalid-products/get','json_body','logistics_settings'],
 warehouses_with_invalid_products:['/v1/warehouse/warehouses-with-invalid-products','no_body','logistics_settings']
};
for(const [alias,[p,style,section]] of Object.entries(ops)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,'POST'); assert.equal(m.path,p);
 assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.currentness,'current');
 assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection'); assert.equal(m.cluster,'warehouse_logistics'); assert.equal(m.section,section);
 assert.equal(m.workflow_role,'single_read'); assert.equal(m.guidance_visibility,'user'); assert.equal(m.entitlement_key,`POST ${p}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path==='/v1/delivery-method/list'&&x?.execution_enabled),false);
console.log('B16_WAREHOUSE_DELIVERY_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('seller_delivery_method_list',{limit:100}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/delivery-method/list'); assert.deepEqual(JSON.parse(req.body),{limit:100});
[cmd,req]=build('seller_delivery_method_list',{cursor:'c',filter:{delivery_method_ids:['1'],provider_ids:['2'],status:['ACTIVE','WAITING'],warehouse_ids:['3']},limit:100,sort_dir:'DESC'}); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('delivery_method_return_settings',{delivery_method_id:1}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/delivery-method/return/settings/get'); assert.deepEqual(JSON.parse(req.body),{delivery_method_id:1});
[cmd,req]=build('warehouse_invalid_products',{warehouse_id:1,last_id:2}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/warehouse/invalid-products/get'); assert.deepEqual(JSON.parse(req.body),{warehouse_id:1,last_id:2});
[cmd,req]=build('warehouses_with_invalid_products',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/warehouse/warehouses-with-invalid-products'); assert.equal(req.body,undefined);
console.log('B16_WAREHOUSE_DELIVERY_EXACT_REQUEST_PASS');

function rejects(operation,params,code){assert.throws(()=>C.normalizeCommand({operation,params}),e=>e&&e.code===code,`${operation} ${JSON.stringify(params)} -> ${code}`);}
rejects('seller_delivery_method_list',{},'INVALID_OPERATION_PARAMS');
rejects('seller_delivery_method_list',{limit:0},'OZON_LIMIT_VIOLATION');
rejects('seller_delivery_method_list',{limit:101},'OZON_LIMIT_VIOLATION');
rejects('seller_delivery_method_list',{limit:1.5},'INVALID_OPERATION_PARAMS');
rejects('seller_delivery_method_list',{limit:1,sort_dir:'SIDEWAYS'},'INVALID_OPERATION_PARAMS');
rejects('seller_delivery_method_list',{limit:1,filter:{status:['UNKNOWN']}},'INVALID_OPERATION_PARAMS');
rejects('seller_delivery_method_list',{limit:1,filter:{warehouse_ids:[1]}},'INVALID_OPERATION_PARAMS');
rejects('seller_delivery_method_list',{limit:1,filter:{warehouse_ids:Array.from({length:101},(_,i)=>String(i+1))}},'OZON_LIMIT_VIOLATION');
rejects('seller_delivery_method_list',{limit:1,filter:{evil:true}},'UNKNOWN_OPERATION_PARAM');
rejects('seller_delivery_method_list',{limit:1,url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED');
rejects('delivery_method_return_settings',{delivery_method_id:'1'},'INVALID_OPERATION_PARAMS');
rejects('delivery_method_return_settings',{delivery_method_id:Number.MAX_SAFE_INTEGER+1},'INVALID_OPERATION_PARAMS');
rejects('warehouse_invalid_products',{warehouse_id:'1'},'INVALID_OPERATION_PARAMS');
rejects('warehouse_invalid_products',{warehouse_id:1,last_id:'2'},'INVALID_OPERATION_PARAMS');
rejects('warehouses_with_invalid_products',{extra:true},'INVALID_OPERATION_PARAMS');
console.log('B16_WAREHOUSE_DELIVERY_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
 const command=C.normalizeCommand(R.OPERATIONS[alias].template); const requirement=E.requirementFor(command);
 assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias);
 const plan=C.planCommandForSellerCapability(command,null); assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B16_WAREHOUSE_DELIVERY_ENTITLEMENTS_PASS');

for(const [section,aliases] of Object.entries({delivery_methods:['seller_delivery_method_list','delivery_method_return_settings'],logistics_settings:['warehouse_invalid_products','warehouses_with_invalid_products']})){
 const guidance=G.result({status:'guidance',cluster:'warehouse_logistics',section,version:2});
 for(const alias of aliases) assert(guidance.choices.some(x=>x.operation===alias),alias);
 assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
}
assert.equal(R.OPERATIONS.seller_delivery_method_list.workflow_role,'single_read');
assert.equal(R.OPERATIONS.warehouse_invalid_products.workflow_role,'single_read');
console.log('B16_WAREHOUSE_DELIVERY_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS');

for(const [alias,p] of Object.entries({
 seller_warehouse_list:'/v2/warehouse/list',
 pricing_strategy_list:'/v1/pricing-strategy/list',
 description_category_tree:'/v1/description-category/tree',
 ozon_actions_list:'/v1/actions',
 product_content_rating:'/v1/product/rating-by-sku',
 seller_rating_summary:'/v1/rating/summary',
 review_list:'/v2/review/list',
 supply_order_list:'/v3/supply-order/list'
})){assert.equal(R.OPERATIONS[alias].path,p,alias); assert.equal(R.OPERATIONS[alias].execution_enabled,true,alias);}
let q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template)); assert.equal(q.known,false); assert.equal(q.required,false);
q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template)); assert.equal(q.known,true); assert.equal(q.required,true); assert.deepEqual(q.allowed_subscription_types,['PREMIUM_PLUS']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
 const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
 const expected={
  '/v2/delivery-method/list':'WarehouseAPI_DeliveryMethodListV2',
  '/v1/delivery-method/return/settings/get':'GetDeliveryMethodReturnSettingsV1',
  '/v1/warehouse/invalid-products/get':'WarehouseInvalidProductsGet',
  '/v1/warehouse/warehouses-with-invalid-products':'WarehouseWithInvalidProducts'
 };
 for(const [p,id] of Object.entries(expected)){const op=sw.paths?.[p]?.post; assert(op,p); assert.notEqual(op.deprecated,true,p); assert.equal(op.operationId,id,p); assert.deepEqual(op.tags,['WarehouseAPI']);}
 const old=sw.paths?.['/v1/delivery-method/list']?.post; assert(old); assert.match(old.description,/7 апреля 2026/); assert.match(old.description,/\/v2\/delivery-method\/list/);
 const dm=sw.components.schemas.v2DeliveryMethodListV2Request; assert.deepEqual(dm.required,['limit']); assert.equal(dm.properties.limit.minimum,1); assert.equal(dm.properties.limit.maximum,100);
 const filter=sw.components.schemas.DeliveryMethodListV2RequestFilter; for(const k of ['delivery_method_ids','provider_ids','warehouse_ids']) assert.equal(filter.properties[k].maxItems,100,k);
 assert.deepEqual(sw.components.schemas.FilterStatusEnum.enum,['NEW','EDITED','ACTIVE','DISABLED','WAITING','BROKEN']);
 assert.deepEqual(sw.components.schemas.DeliveryMethodListV2RequestSortDirEnum.enum,['ASC','DESC']);
 const ret=sw.components.schemas.v1GetDeliveryMethodReturnSettingsV1Request; assert.deepEqual(ret.required,['delivery_method_id']); assert.equal(ret.properties.delivery_method_id.format,'int64');
 const invalid=sw.components.schemas.v1WarehouseInvalidProductsGetRequest; assert.deepEqual(invalid.required,['warehouse_id']); assert.equal(invalid.properties.last_id.format,'int64'); assert.equal(invalid.properties.warehouse_id.format,'int64');
 const noBody=sw.paths['/v1/warehouse/warehouses-with-invalid-products'].post.requestBody; assert.equal(noBody,undefined);
 const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-27T00:00:00.000Z'});
 assert.equal(snap.unresolved_rule_count,12);
 for(const p of Object.keys(expected)){const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);}
 console.log('B16_WAREHOUSE_DELIVERY_EXACT_SWAGGER_CURRENTNESS_PASS');
 console.log('B16_WAREHOUSE_DELIVERY_EXACT_ENTITLEMENTS_PASS');
}

const protectedRuntime={'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508','content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'};
for(const [rel,sha] of Object.entries(protectedRuntime)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8'); assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/);
console.log('B16_WAREHOUSE_DELIVERY_PROTECTED_RUNTIME_IDENTITIES_PASS');
