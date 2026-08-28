import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(process.argv[2]||'/tmp/ozon-b25-exact'), swp=process.argv[3]?path.resolve(process.argv[3]):null;
const load=n=>import(pathToFileURL(path.join(root,'shared',n)).href+`?b25=${Date.now()}-${n}`);
for(const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const O={
 posting_fbo_cancel_reason_list:['/v1/posting/fbo/cancel-reason/list','returns_cancellations','cancellations'],
 returns_utilization_history:['/v1/returns/settings/utilization/history','returns_cancellations','returns'],
 returns_utilization_info:['/v1/returns/settings/utilization/info','returns_cancellations','returns'],
 product_certification_options:['/v2/product/certification/options','catalog_products','certification'],
 warehouse_fbs_pickup_planning_list:['/v1/warehouse/fbs/pickup/planning/list','warehouse_logistics','warehouses'],
 fbp_warehouse_list:['/v1/fbp/warehouse/list','warehouse_logistics','warehouses']
};
for(const[a,[p,cluster,section]]of Object.entries(O)){const m=R.OPERATIONS[a];assert(m,a);for(const[k,v]of Object.entries({provider:'seller_api',method:'POST',path:p,effect:'READ',request_style:'no_body',execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster,section,workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`POST ${p}`}))assert.deepEqual(m[k],v,`${a}.${k}`)}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path==='/v1/notification/list'&&x?.execution_enabled),false);
console.log('B25_SAFE_REFERENCE_SETTINGS_REGISTRY_PASS');
for(const[a,[p]]of Object.entries(O)){const c=C.normalizeCommand({operation:a,params:{}}),r=C.buildRequest(c,{});assert.equal(r.method,'POST');assert.equal(r.url,'https://api-seller.ozon.ru'+p);assert.equal(r.body,undefined);assert.throws(()=>C.normalizeCommand({operation:a,params:{x:1}}),e=>e?.code==='INVALID_OPERATION_PARAMS',a);assert.throws(()=>C.normalizeCommand({operation:a,params:{url:'https://evil.example'}}),e=>e?.code==='TRANSPORT_INJECTION_REJECTED',a)}
console.log('B25_SAFE_REFERENCE_SETTINGS_EXACT_REQUEST_PASS');
console.log('B25_SAFE_REFERENCE_SETTINGS_CONTRACTS_PASS');
for(const a of Object.keys(O)){const c=C.normalizeCommand(R.OPERATIONS[a].template),q=E.requirementFor(c),p=C.planCommandForSellerCapability(c,null);assert.equal(q.known,true,a);assert.equal(q.required,false,a);assert.equal(p.action,'execute',a);assert.equal(p.planning.entitlement.capability_required,false,a)}
console.log('B25_SAFE_REFERENCE_SETTINGS_ENTITLEMENTS_PASS');
for(const [cluster,section,aliases] of [['returns_cancellations','cancellations',['posting_fbo_cancel_reason_list']],['returns_cancellations','returns',['returns_utilization_history','returns_utilization_info']],['catalog_products','certification',['product_certification_options']],['warehouse_logistics','warehouses',['warehouse_fbs_pickup_planning_list','fbp_warehouse_list']]]){const g=G.result({status:'guidance',cluster,section,version:2});for(const a of aliases)assert(g.choices.some(x=>x.operation===a),a);assert.equal(g.external_request_executed,false);assert.equal(g.physical_business_request_count,0)}
console.log('B25_SAFE_REFERENCE_SETTINGS_GUIDANCE_ZERO_REQUEST_PASS');
for(const[a,p]of Object.entries({supply_order_act_accept_status:'/v1/supply-order/act/accept/status',supply_order_content_update_validation:'/v1/supply-order/content/update/validation',seller_info:'/v1/seller/info',posting_fbs_cancel_reason_list:'/v2/posting/fbs/cancel-reason/list',return_giveout_info:'/v1/return/giveout/info',product_certificate_info:'/v1/product/certificate/info',seller_warehouse_list:'/v2/warehouse/list'}))assert.equal(R.OPERATIONS[a]?.path,p,a);
console.log('B25_B24_B23_B22_B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');
const H={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'};
for(const[p,h]of Object.entries(H))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),h,p);
console.log('B25_SAFE_REFERENCE_SETTINGS_PROTECTED_RUNTIME_IDENTITIES_PASS');
if(swp){const sw=JSON.parse(fs.readFileSync(swp,'utf8'));assert.equal(sw.openapi,'3.0.0');assert.equal(Object.keys(sw.paths).length,463);const I={
'/v1/posting/fbo/cancel-reason/list':['PostingAPI_GetPostingFboCancelReasonList','FBO'],
'/v1/returns/settings/utilization/history':['UtilizationHistory','ReturnsAPI'],
'/v1/returns/settings/utilization/info':['UtilizationInfo','ReturnsAPI'],
'/v2/product/certification/options':['ProductCertificateOptions','BetaMethod'],
'/v1/warehouse/fbs/pickup/planning/list':['WarehouseFbsPickUpPlanningList','FBSWarehouseSetup'],
'/v1/fbp/warehouse/list':['FbpWarehouseList','DeliveryFBPDraft']};
for(const[p,[id,tag]]of Object.entries(I)){const o=sw.paths[p]?.post;assert(o,p);assert.equal(o.operationId,id,p);assert.notEqual(o.deprecated,true,p);assert((o.tags||[]).includes(tag),p);assert.equal(o.requestBody??null,null,p)}
const s=E.compileSnapshot(sw);assert.equal(s.unresolved_rule_count,12);for(const p of Object.keys(I)){const q=s.operations['POST '+p];assert(q,p);assert.equal(q.default_access,'ALL_ACCOUNTS',p);assert.equal(q.endpoint_allowed_subscription_types,null,p)}
console.log('B25_SAFE_REFERENCE_SETTINGS_EXACT_SWAGGER_CURRENTNESS_PASS');console.log('B25_SAFE_REFERENCE_SETTINGS_EXACT_ENTITLEMENTS_PASS')}
let n=0;for(const p of fs.readdirSync(root,{recursive:true}))if(typeof p==='string'&&p.endsWith('.js'))n++;assert.equal(n,18);console.log(`B25_SYNTAX_DECLARED_JS=${n}`);console.log('B25_SYNTAX_PASS');
