import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b8-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await import(pathToFileURL(path.join(root,'shared',name)).href+`?b8=${Date.now()}-${name}`);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
 supply_order_list:['POST','/v3/supply-order/list','json_body'],
 supply_order_get:['POST','/v3/supply-order/get','json_body'],
 supply_order_status_counter:['POST','/v1/supply-order/status/counter','no_body'],
 supply_order_bundle:['POST','/v1/supply-order/bundle','json_body'],
 supply_order_timeslot_list:['POST','/v2/supply-order/timeslot/list','json_body'],
 supply_order_details:['POST','/v1/supply-order/details','json_body']
};
for(const [alias,[method,p,style]] of Object.entries(ops)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.currentness,'current'); assert.equal(m.cluster,'supplies_fbo'); assert.equal(m.section,'supply_orders'); assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read'); assert.equal(m.privacy_policy,'safe_projection');
}
for(const alias of ['supply_order_get','supply_order_details']) assert(R.OPERATIONS[alias]);
for(const oldPath of ['/v1/supply-order/list','/v1/supply-order/get','/v1/supply-order/items','/v2/supply-order/list','/v2/supply-order/get','/v1/supply-order/timeslot/get']) assert(!Object.values(R.OPERATIONS).some(x=>x.execution_enabled===true&&x.path===oldPath),oldPath);
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B8_SUPPLY_REPLENISHMENT_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('supply_order_list',{filter:{states:[]},limit:100,sort_by:'ORDER_CREATION',sort_dir:'DESC'}); assert.equal(req.url,'https://api-seller.ozon.ru/v3/supply-order/list'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('supply_order_get',{order_ids:['1','9223372036854775807']}); assert.equal(req.url,'https://api-seller.ozon.ru/v3/supply-order/get'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('supply_order_status_counter',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/supply-order/status/counter'); assert.equal(req.body,undefined);
[cmd,req]=build('supply_order_bundle',{bundle_ids:['bundle-1'],limit:100}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/supply-order/bundle'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('supply_order_timeslot_list',{order_id:1}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/supply-order/timeslot/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('supply_order_details',{order_id:1}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/supply-order/details'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B8_SUPPLY_REPLENISHMENT_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'supply_order_list',params:{filter:{states:[]},limit:0,sort_by:'ORDER_CREATION'}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_list',params:{filter:{states:['BAD']},limit:1,sort_by:'ORDER_CREATION'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_list',params:{filter:{states:[],order_number_search:'12'},limit:1,sort_by:'ORDER_CREATION'}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_list',params:{filter:{states:[],dropoff_warehouse_ids:[1]},limit:1,sort_by:'ORDER_CREATION'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_list',params:{filter:{states:[],timeslot_from_range:{timeslot_filter_type:'BAD'}},limit:1,sort_by:'ORDER_CREATION'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_list',params:{filter:{states:[],timeslot_from_range:{from:'2026-08-26'}},limit:1,sort_by:'ORDER_CREATION'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_list',params:{filter:{states:[]},limit:1,sort_by:'BAD'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_list',params:{filter:{states:[]},limit:1,sort_by:'ORDER_CREATION',unexpected:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'supply_order_get',params:{order_ids:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_get',params:{order_ids:Array(51).fill('1')}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_get',params:{order_ids:['9223372036854775808']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_get',params:{order_ids:['1'],extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'supply_order_status_counter',params:{x:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_bundle',params:{bundle_ids:[],limit:1}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_bundle',params:{bundle_ids:Array(101).fill('x'),limit:1}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_bundle',params:{bundle_ids:['x'],limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_bundle',params:{bundle_ids:['x'],limit:1,item_tags_calculation:{dropoff_warehouse_id:'1',storage_warehouse_ids:Array(26).fill('1')}}},'OZON_LIMIT_VIOLATION');
rejects({operation:'supply_order_bundle',params:{bundle_ids:['x'],limit:1,sort_field:'BAD'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_timeslot_list',params:{order_id:'1'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_timeslot_list',params:{order_id:1,extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'supply_order_details',params:{order_id:1,extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'supply_order_details',params:{order_id:Number.MAX_SAFE_INTEGER+1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'supply_order_get',params:{order_ids:['1'],url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
console.log('B8_SUPPLY_REPLENISHMENT_CONTRACTS_PASS');

// B7 analytics/search semantics must survive B8 even though B8 legitimately changes
// registry/contract/entitlements file identities.
const b7AnalyticsOps={
 analytics_data:['POST','/v1/analytics/data'],
 product_queries:['POST','/v1/analytics/product-queries'],
 product_queries_details:['POST','/v1/analytics/product-queries/details']
};
for(const [alias,[method,p]] of Object.entries(b7AnalyticsOps)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.execution_enabled,true); assert.equal(m.workflow_role,'single_read');
}
let b7cmd=C.normalizeCommand({operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['revenue'],limit:100}});
let b7req=C.buildRequest(b7cmd,{}); assert.equal(b7req.url,'https://api-seller.ozon.ru/v1/analytics/data'); assert.deepEqual(JSON.parse(b7req.body),b7cmd.params);
b7cmd=C.normalizeCommand({operation:'product_queries',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1']}});
b7req=C.buildRequest(b7cmd,{}); assert.equal(b7req.url,'https://api-seller.ozon.ru/v1/analytics/product-queries'); assert.deepEqual(JSON.parse(b7req.body),b7cmd.params);
b7cmd=C.normalizeCommand({operation:'product_queries_details',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1'],limit_by_sku:10}});
b7req=C.buildRequest(b7cmd,{}); assert.equal(b7req.url,'https://api-seller.ozon.ru/v1/analytics/product-queries/details'); assert.deepEqual(JSON.parse(b7req.body),b7cmd.params);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B8_B7_ANALYTICS_SEMANTICS_CARRY_FORWARD_PASS');

const detailsCommand=C.normalizeCommand({operation:'supply_order_details',params:{order_id:1}});
const detailsSafe=C.sanitizeResult(detailsCommand,{supplies:[{storage_warehouse:{address:'Operational warehouse',name:'WH'}}],vehicle:{value:{driver_name:'Ivan',driver_phone:'+79990000000',vehicle_number:'A001AA',vehicle_model:'Truck'}}});
assert.equal(detailsSafe.supplies[0].storage_warehouse.address,'Operational warehouse');
assert.equal(detailsSafe.vehicle.value.driver_name,'[REDACTED]'); assert.equal(detailsSafe.vehicle.value.driver_phone,'[REDACTED]'); assert.equal(detailsSafe.vehicle.value.vehicle_number,'[REDACTED]'); assert.equal(detailsSafe.vehicle.value.vehicle_model,'Truck');
const getCommand=C.normalizeCommand({operation:'supply_order_get',params:{order_ids:['1']}});
const getSafe=C.sanitizeResult(getCommand,{orders:[{dropoff_warehouse:{address:'Dropoff',name:'D'},supplies:[{storage_warehouse:{address:'Storage',name:'S'}}]}]});
assert.equal(getSafe.orders[0].dropoff_warehouse.address,'Dropoff'); assert.equal(getSafe.orders[0].supplies[0].storage_warehouse.address,'Storage');
console.log('B8_SUPPLY_REPLENISHMENT_SAFE_PROJECTION_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40'); const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
 const exact={
  '/v3/supply-order/list':['SupplyOrderList','v3SupplyOrderListRequest'],
  '/v3/supply-order/get':['SupplyOrderGet','v3SupplyOrderGetRequest'],
  '/v1/supply-order/bundle':['SupplyOrderBundle','v1GetSupplyOrderBundleRequest'],
  '/v2/supply-order/timeslot/list':['SupplyOrderTimeslotList','supply_order.v2.SupplyOrderTimeslotListRequest'],
  '/v1/supply-order/details':['SupplyOrderAPI_SupplyOrderDetails','v1SupplyOrderDetailsRequest']
 };
 for(const [p,[id,schemaName]] of Object.entries(exact)){const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(op.operationId,id,p); assert.equal(op.requestBody.content['application/json'].schema.$ref,`#/components/schemas/${schemaName}`);}
 const counter=sw.paths?.['/v1/supply-order/status/counter']?.post; assert(counter); assert.equal(counter.operationId,'SupplyOrderAPI_SupplyOrderStatusCounter'); assert.equal(counter.requestBody,undefined);
 for(const p of ['/v1/supply-order/list','/v1/supply-order/get','/v1/supply-order/items','/v2/supply-order/list','/v2/supply-order/get']) assert.equal(sw.paths[p],undefined,p);
 const legacyTimeslot=sw.paths?.['/v1/supply-order/timeslot/get']?.post; assert(legacyTimeslot); assert.match(String(legacyTimeslot.description||''),/19 августа 2026/); assert.match(String(legacyTimeslot.description||''),/\/v2\/supply-order\/timeslot\/list/);
 const list=sw.components.schemas.v3SupplyOrderListRequest; assert.deepEqual(list.required,['filter','limit','sort_by']); assert.equal(list.properties.limit.minimum,1); assert.equal(list.properties.limit.maximum,100);
 const lf=sw.components.schemas.SupplyOrderListRequestFilter; assert.deepEqual(lf.required,['states']); assert.equal(lf.properties.order_number_search.minLength,3); assert.deepEqual(sw.components.schemas.SupplyOrderListRequestFilterStateEnum.enum,['DATA_FILLING','READY_TO_SUPPLY','ACCEPTED_AT_SUPPLY_WAREHOUSE','IN_TRANSIT','ACCEPTANCE_AT_STORAGE_WAREHOUSE','REPORTS_CONFIRMATION_AWAITING','REPORT_REJECTED','COMPLETED','REJECTED_AT_SUPPLY_WAREHOUSE','CANCELLED','OVERDUE']); assert.deepEqual(sw.components.schemas.SupplyOrderListRequestSortByEnum.enum,['ORDER_CREATION','ORDER_STATE_UPDATED_AT','TIMESLOT_FROM_UTC','TIMESLOT_FROM_LOCAL']); assert.deepEqual(sw.components.schemas.SupplyOrderListRequestSortDirEnum.enum,['ASC','DESC']);
 const get=sw.components.schemas.v3SupplyOrderGetRequest; assert.deepEqual(get.required,['order_ids']); assert.equal(get.properties.order_ids.maxItems,50); assert.equal(get.properties.order_ids.items.type,'string'); assert.equal(get.properties.order_ids.items.format,'int64');
 const bundle=sw.components.schemas.v1GetSupplyOrderBundleRequest; assert.deepEqual(bundle.required,['bundle_ids','limit']); assert.equal(bundle.properties.bundle_ids.minItems,1); assert.equal(bundle.properties.bundle_ids.maxItems,100); assert.equal(bundle.properties.limit.minimum,1); assert.equal(bundle.properties.limit.maximum,100); assert.match(sw.components.schemas.GetSupplyOrderBundleRequestItemTagsCalculation.properties.storage_warehouse_ids.description,/25/); assert.deepEqual(sw.components.schemas.v1ItemSortField.enum,['SKU','NAME','QUANTITY','TOTAL_VOLUME_IN_LITRES']);
 const timeslot=sw.components.schemas['supply_order.v2.SupplyOrderTimeslotListRequest']; assert.deepEqual(timeslot.required,['order_id']); assert.equal(timeslot.properties.order_id.type,'integer'); assert.equal(timeslot.properties.order_id.format,'int64');
 const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-26T00:00:00.000Z'}); assert.equal(snap.unresolved_rule_count,0);
 const b7Rule=snap.operations['POST /v1/analytics/product-queries/details']; assert(b7Rule); const b7Restricted=b7Rule.feature_rules.find(x=>x.id==='product_queries_details_restricted_sort'); assert(b7Restricted); assert.deepEqual(b7Restricted.allowed_subscription_types,['PREMIUM','PREMIUM_PLUS']);
 const b7AnalyticsRequirement=E.requirementFor(C.normalizeCommand({operation:'analytics_data',params:{date_from:'2026-08-20',date_to:'2026-08-21',dimension:['day'],metrics:['hits_view'],limit:10}}),snap,Date.parse('2026-08-26T12:00:00Z')); assert.equal(b7AnalyticsRequirement.required,true); assert.deepEqual(b7AnalyticsRequirement.allowed_subscription_types,['PREMIUM_PLUS','PREMIUM_PRO']);
 for(const [alias,[method,p]] of Object.entries(ops)){const rule=snap.operations[`${method} ${p}`]; assert(rule,alias); assert.equal(rule.default_access,'ALL_ACCOUNTS'); assert.equal(rule.endpoint_allowed_subscription_types,null); assert.deepEqual(rule.feature_rules,[]); const requirement=E.requirementFor(C.normalizeCommand({operation:alias,params:R.OPERATIONS[alias].template.params}),snap); assert.equal(requirement.known,true); assert.equal(requirement.required,false);}
 console.log('B8_SUPPLY_REPLENISHMENT_EXACT_SWAGGER_PASS');
 console.log('B8_SUPPLY_REPLENISHMENT_ENTITLEMENTS_EXACT_PASS');
 console.log('B8_SUPPLY_REPLENISHMENT_CURRENTNESS_PASS');
}

const guidance=G.result({status:'guidance',cluster:'supplies_fbo',section:'supply_orders',version:2});
for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias); assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B8_SUPPLY_REPLENISHMENT_GUIDANCE_ZERO_REQUEST_PASS');

const protectedB7={
 'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508',
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
 'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
 'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
 'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
 'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
 'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
 'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'
};
for(const [rel,sha] of Object.entries(protectedB7)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8'); assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/);
console.log('B8_SUPPLY_REPLENISHMENT_PROTECTED_RUNTIME_IDENTITIES_PASS');
