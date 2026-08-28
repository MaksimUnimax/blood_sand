import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(process.argv[2]||'/tmp/ozon-b24-exact'), swp=process.argv[3]?path.resolve(process.argv[3]):null;
const load=n=>import(pathToFileURL(path.join(root,'shared',n)).href+`?b24=${Date.now()}-${n}`);
for(const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const O={
 supply_order_act_accept_status:'/v1/supply-order/act/accept/status',
 supply_order_act_product_get:'/v1/supply-order/act/product/get',
 supply_order_act_summary_get:'/v1/supply-order/act/summary/get',
 supply_order_cancel_status:'/v1/supply-order/cancel/status',
 supply_order_content_update_status:'/v1/supply-order/content/update/status',
 supply_order_content_update_validation:'/v1/supply-order/content/update/validation',
 supply_order_pass_status:'/v1/supply-order/pass/status',
 supply_order_timeslot_status:'/v1/supply-order/timeslot/status'
};
for(const[a,p]of Object.entries(O)){const m=R.OPERATIONS[a];assert(m,a);for(const[k,v]of Object.entries({provider:'seller_api',method:'POST',path:p,effect:'READ',request_style:'json_body',execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'supplies_fbo',section:'supply_orders',workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`POST ${p}`}))assert.deepEqual(m[k],v,`${a}.${k}`)}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
for(const p of ['/v1/supply-order/act/accept','/v1/supply-order/cancel','/v1/supply-order/content/update','/v1/supply-order/pass/create','/v1/supply-order/timeslot/update','/v1/supply-order/timeslot/get'])assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path===p&&x?.execution_enabled),false,p);
console.log('B24_FBO_SUPPLY_STATUS_ACT_REGISTRY_PASS');
const build=(operation,params)=>{const c=C.normalizeCommand({operation,params});return[c,C.buildRequest(c,{})]};
const bad=(o,p,code='INVALID_OPERATION_PARAMS')=>assert.throws(()=>C.normalizeCommand({operation:o,params:p}),e=>e?.code===code,`${o}:${code}`);
for(const a of ['supply_order_act_accept_status','supply_order_cancel_status','supply_order_content_update_status','supply_order_pass_status','supply_order_timeslot_status']){
 const[c,r]=build(a,{operation_id:''}); assert.equal(r.method,'POST');assert.equal(r.url,'https://api-seller.ozon.ru'+O[a]);assert.deepEqual(JSON.parse(r.body),c.params);bad(a,{});bad(a,{operation_id:1});bad(a,{operation_id:'x',x:1},'UNKNOWN_OPERATION_PARAM');bad(a,{operation_id:'x',url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED');
}
for(const [a,k] of [['supply_order_act_product_get','supply_id'],['supply_order_act_summary_get','order_id']]){const[c,r]=build(a,{[k]:-1});assert.equal(r.url,'https://api-seller.ozon.ru'+O[a]);assert.deepEqual(JSON.parse(r.body),c.params);bad(a,{});bad(a,{[k]:'1'});bad(a,{[k]:Number.MAX_SAFE_INTEGER+1});}
{const[c,r]=build('supply_order_content_update_validation',{new_bundle_id:'',supply_id:-1});assert.equal(r.url,'https://api-seller.ozon.ru'+O.supply_order_content_update_validation);assert.deepEqual(JSON.parse(r.body),c.params);bad('supply_order_content_update_validation',{});bad('supply_order_content_update_validation',{new_bundle_id:'x',supply_id:'1'});bad('supply_order_content_update_validation',{new_bundle_id:1,supply_id:1});bad('supply_order_content_update_validation',{new_bundle_id:'x',supply_id:1,headers:{}} ,'TRANSPORT_INJECTION_REJECTED');}
console.log('B24_FBO_SUPPLY_STATUS_ACT_EXACT_REQUEST_PASS');
console.log('B24_FBO_SUPPLY_STATUS_ACT_CONTRACTS_PASS');
for(const a of Object.keys(O)){const c=C.normalizeCommand(R.OPERATIONS[a].template),q=E.requirementFor(c),p=C.planCommandForSellerCapability(c,null);assert.equal(q.known,true,a);assert.equal(q.required,false,a);assert.equal(p.action,'execute',a);assert.equal(p.planning.entitlement.capability_required,false,a)}
console.log('B24_FBO_SUPPLY_STATUS_ACT_ENTITLEMENTS_PASS');
const g=G.result({status:'guidance',cluster:'supplies_fbo',section:'supply_orders',version:2});for(const a of Object.keys(O))assert(g.choices.some(x=>x.operation===a),a);assert.equal(g.external_request_executed,false);assert.equal(g.physical_business_request_count,0);console.log('B24_FBO_SUPPLY_STATUS_ACT_NO_POLLING_GUIDANCE_ZERO_REQUEST_PASS');
for(const[a,p]of Object.entries({seller_info:'/v1/seller/info',seller_ozon_logistics_info:'/v1/seller/ozon-logistics/info',posting_fbs_cancel_reason_list:'/v2/posting/fbs/cancel-reason/list',return_giveout_info:'/v1/return/giveout/info',supply_order_timeslot_list:'/v2/supply-order/timeslot/list',supply_order_list:'/v3/supply-order/list',review_comment_list:'/v1/review/comment/list',product_certificate_info:'/v1/product/certificate/info'}))assert.equal(R.OPERATIONS[a]?.path,p,a);
console.log('B24_B23_B22_B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');
const H={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'};for(const[p,h]of Object.entries(H))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),h,p);console.log('B24_FBO_SUPPLY_STATUS_ACT_PROTECTED_RUNTIME_IDENTITIES_PASS');
if(swp){const sw=JSON.parse(fs.readFileSync(swp,'utf8'));assert.equal(sw.openapi,'3.0.0');assert.equal(Object.keys(sw.paths).length,463);const ids={
'/v1/supply-order/act/accept/status':'SupplyOrderActAcceptStatus','/v1/supply-order/act/product/get':'SupplyOrderActProductGet','/v1/supply-order/act/summary/get':'SupplyOrderActSummaryGet','/v1/supply-order/cancel/status':'SupplyOrderAPI_SupplyOrderCancelStatus','/v1/supply-order/content/update/status':'SupplyOrderAPI_SupplyOrderContentUpdateStatus','/v1/supply-order/content/update/validation':'SupplyOrderContentUpdateValidation','/v1/supply-order/pass/status':'SupplyOrderAPI_SupplyOrderPassStatus','/v1/supply-order/timeslot/status':'SupplyOrderAPI_GetSupplyOrderTimeslotStatus'};const tags={'/v1/supply-order/act/accept/status':'SupplyOrderAPI','/v1/supply-order/act/product/get':'SupplyOrderAPI','/v1/supply-order/act/summary/get':'SupplyOrderAPI','/v1/supply-order/cancel/status':'FboSupplyRequest','/v1/supply-order/content/update/status':'FboSupplyRequest','/v1/supply-order/content/update/validation':'FboSupplyRequest','/v1/supply-order/pass/status':'FBO','/v1/supply-order/timeslot/status':'FBO'};for(const[p,id]of Object.entries(ids)){const o=sw.paths[p]?.post;assert(o,p);assert.equal(o.operationId,id,p);assert.notEqual(o.deprecated,true,p);assert((o.tags||[]).includes(tags[p]),p);const ref=o.requestBody?.content?.['application/json']?.schema?.$ref;assert(ref,p);const schema=sw.components.schemas[ref.split('/').pop()];assert(Array.isArray(schema?.required)&&schema.required.length>0,p)}
const old=sw.paths['/v1/supply-order/timeslot/get']?.post;assert(old);assert((old.description||'').includes('19 августа 2026'));assert((old.description||'').includes('/v2/supply-order/timeslot/list'));assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path==='/v1/supply-order/timeslot/get'&&x?.execution_enabled),false);console.log('B24_DEPRECATED_TIMESLOT_GET_EXCLUDED_PASS');
const s=E.compileSnapshot(sw);assert.equal(s.unresolved_rule_count,12);for(const p of Object.keys(ids)){const q=s.operations['POST '+p];assert(q,p);assert.equal(q.default_access,'ALL_ACCOUNTS',p);assert.equal(q.endpoint_allowed_subscription_types,null,p)}console.log('B24_FBO_SUPPLY_STATUS_ACT_EXACT_SWAGGER_CURRENTNESS_PASS');console.log('B24_FBO_SUPPLY_STATUS_ACT_EXACT_ENTITLEMENTS_PASS')}
let n=0;for(const p of fs.readdirSync(root,{recursive:true}))if(typeof p==='string'&&p.endsWith('.js'))n++;assert.equal(n,18);console.log(`B24_SYNTAX_DECLARED_JS=${n}`);console.log('B24_SYNTAX_PASS');
