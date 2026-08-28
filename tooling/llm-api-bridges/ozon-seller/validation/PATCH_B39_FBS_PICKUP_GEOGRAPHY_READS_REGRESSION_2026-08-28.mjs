import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL as U } from 'node:url';
const root=path.resolve(process.argv[2]), swaggerPath=process.argv[3]?path.resolve(process.argv[3]):null;
const load=n=>import(U(path.join(root,'shared',n)).href+`?b39=${Date.now()}${n}`);
for(const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const O={
  warehouse_fbs_pickup_history_list:['/v1/warehouse/fbs/pickup/history/list','warehouses'],
  delivery_polygon_list:['/v1/polygon/list','delivery_methods']
};
for(const[a,[p,s]]of Object.entries(O)){
  const x=R.OPERATIONS[a];
  for(const[k,v]of Object.entries({provider:'seller_api',method:'POST',path:p,effect:'READ',request_style:'json_body',execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'warehouse_logistics',section:s,workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`POST ${p}`})) assert.deepEqual(x[k],v);
  const cmd=C.normalizeCommand(x.template),q=E.requirementFor(cmd),pl=C.planCommandForSellerCapability(cmd,null);
  assert.equal(q.known,true);assert.equal(q.required,false);assert.equal(pl.action,'execute');assert.equal(pl.planning.entitlement.capability_required,false);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B39_FBS_PICKUP_GEOGRAPHY_REGISTRY_ENTITLEMENTS_PASS');
const req=(o,p)=>C.buildRequest(C.normalizeCommand({operation:o,params:p}),{}),bad=(o,p,c='INVALID_OPERATION_PARAMS')=>assert.throws(()=>C.normalizeCommand({operation:o,params:p}),e=>e?.code===c);
let r=req('warehouse_fbs_pickup_history_list',{limit:1,cursor:'',filter:{planned_date:'',warehouse_id:[],was_planned:false}});
assert.equal(r.url,'https://api-seller.ozon.ru/v1/warehouse/fbs/pickup/history/list');
assert.deepEqual(JSON.parse(r.body),{limit:1,cursor:'',filter:{planned_date:'',warehouse_id:[],was_planned:false}});
r=req('warehouse_fbs_pickup_history_list',{limit:1000,filter:{warehouse_id:['-1','9223372036854775807']}});assert.equal(JSON.parse(r.body).limit,1000);
bad('warehouse_fbs_pickup_history_list',{limit:0},'OZON_LIMIT_VIOLATION');bad('warehouse_fbs_pickup_history_list',{limit:1001},'OZON_LIMIT_VIOLATION');bad('warehouse_fbs_pickup_history_list',{limit:1,filter:{warehouse_id:Array.from({length:101},(_,i)=>String(i))}},'OZON_LIMIT_VIOLATION');bad('warehouse_fbs_pickup_history_list',{limit:1,filter:{warehouse_id:[1]}});bad('warehouse_fbs_pickup_history_list',{limit:1,filter:{was_planned:'yes'}});bad('warehouse_fbs_pickup_history_list',{limit:1,url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED');
r=req('delivery_polygon_list',{delivery_method_id:-1,warehouse_id:Number.MAX_SAFE_INTEGER});assert.equal(r.url,'https://api-seller.ozon.ru/v1/polygon/list');assert.deepEqual(JSON.parse(r.body),{delivery_method_id:-1,warehouse_id:Number.MAX_SAFE_INTEGER});bad('delivery_polygon_list',{delivery_method_id:1});bad('delivery_polygon_list',{delivery_method_id:1,warehouse_id:1,headers:{x:'y'}},'TRANSPORT_INJECTION_REJECTED');bad('delivery_polygon_list',{delivery_method_id:Number.MAX_SAFE_INTEGER+1,warehouse_id:1});
console.log('B39_FBS_PICKUP_GEOGRAPHY_EXACT_REQUEST_CONTRACTS_PASS');
for(const sec of ['warehouses','delivery_methods']){const g=G.result({status:'guidance',cluster:'warehouse_logistics',section:sec,version:2});for(const[a,[,s]]of Object.entries(O))if(s===sec)assert(g.choices.some(x=>x.operation===a));assert.equal(g.physical_business_request_count,0);assert.equal(g.external_request_executed,false)}
console.log('B39_GUIDANCE_ZERO_REQUEST_PASS');
for(const[a,p]of Object.entries({finance_cash_flow_statement_list:'/v1/finance/cash-flow-statement/list',finance_transaction_list_v3:'/v3/finance/transaction/list',removal_from_stock_list:'/v1/removal/from-stock/list',fbp_draft_dropoff_province_list:'/v1/fbp/draft/drop-off/province/list'}))assert.equal(R.OPERATIONS[a]?.path,p);
console.log('B39_B38_B37_B36_B35_B34_B33_B32_B31_B30_B29_B28_B27_B26_B25_B24_B23_B22_B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');
const H={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'};for(const[p,h]of Object.entries(H))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),h,p);
console.log('B39_PROTECTED_RUNTIME_IDENTITIES_PASS');
if(swaggerPath){
 const raw=fs.readFileSync(swaggerPath);assert.equal(raw.length,3933043);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');const sw=JSON.parse(raw.toString('utf8'));assert.equal(sw.openapi,'3.0.0');assert.equal(Object.keys(sw.paths).length,463);
 const p1=sw.paths['/v1/warehouse/fbs/pickup/history/list']?.post,p2=sw.paths['/v1/polygon/list']?.post;assert.equal(p1.operationId,'WarehouseFbsPickUpHistoryList');assert.deepEqual(p1.tags,['FBSWarehouseSetup']);assert.notEqual(p1.deprecated,true);assert.equal(p2.operationId,'PolygonList');assert.deepEqual(p2.tags,['PolygonAPI']);assert.notEqual(p2.deprecated,true);
 const s1=sw.components.schemas.v1WarehouseFbsPickUpHistoryListRequest,f=sw.components.schemas.v1WarehouseFbsPickUpHistoryListRequestFilter,s2=sw.components.schemas.v1PolygonListRequest;assert.deepEqual(s1.required,['limit']);assert.equal(s1.properties.limit.type,'integer');assert.equal(s1.properties.limit.format,'int64');assert.equal(s1.properties.limit.minimum,1);assert.equal(s1.properties.limit.maximum,1000);assert.equal(f.properties.warehouse_id.type,'array');assert.equal(f.properties.warehouse_id.maxSize,100);assert.equal(f.properties.warehouse_id.items.type,'string');assert.equal(f.properties.warehouse_id.items.format,'int64');assert.deepEqual(new Set(s2.required),new Set(['delivery_method_id','warehouse_id']));for(const k of ['delivery_method_id','warehouse_id']){assert.equal(s2.properties[k].type,'integer');assert.equal(s2.properties[k].format,'int64')}
 const snap=E.compileSnapshot(sw,{source_hash:'b39-exact-swagger'});for(const p of ['/v1/warehouse/fbs/pickup/history/list','/v1/polygon/list']){const rule=snap.operations[`POST ${p}`];assert(rule);assert.equal(rule.default_access,'ALL_ACCOUNTS');assert.equal(rule.endpoint_allowed_subscription_types,null)}
 console.log('B39_EXACT_SWAGGER_CURRENTNESS_ENTITLEMENTS_PASS');
}
console.log('B39_AUTHOR_CI_GATE_PASS');
