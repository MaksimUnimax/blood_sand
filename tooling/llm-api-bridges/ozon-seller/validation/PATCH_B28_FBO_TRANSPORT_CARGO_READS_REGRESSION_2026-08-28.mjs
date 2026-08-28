import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(process.argv[2]||'/tmp/ozon-b28-exact'), swp=process.argv[3]?path.resolve(process.argv[3]):null;
const load=n=>import(pathToFileURL(path.join(root,'shared',n)).href+`?b28=${Date.now()}-${n}`);
for(const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const O={
 fbo_cargoes_v2_get:'/v2/cargoes/get',
 fbo_cargoes_v2_delete_status:'/v2/cargoes/delete/status',
 fbo_cargoes_transport_activate_status:'/v1/cargoes/transport/activate/status',
 fbo_cargoes_transport_bind_status:'/v1/cargoes/transport/bind/status',
 fbo_cargoes_supplies_get:'/v1/cargoes/supplies/get'
};
for(const[a,p] of Object.entries(O)){const m=R.OPERATIONS[a];assert(m,a);for(const[k,v] of Object.entries({provider:'seller_api',method:'POST',path:p,effect:'READ',request_style:'json_body',execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'supplies_fbo',section:'cargoes',workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`POST ${p}`}))assert.deepEqual(m[k],v,`${a}.${k}`)}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
for(const p of ['/v2/cargoes/delete','/v1/cargoes/transport/activate','/v1/cargoes/transport/bind','/v1/cargoes/transport/create','/v1/cargoes/transport/create/status']) assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path===p&&x?.execution_enabled),false,p);
console.log('B28_FBO_TRANSPORT_CARGO_REGISTRY_PASS');
const build=(o,p)=>{const c=C.normalizeCommand({operation:o,params:p});return[c,C.buildRequest(c,{})]};
const bad=(o,p,code='INVALID_OPERATION_PARAMS')=>assert.throws(()=>C.normalizeCommand({operation:o,params:p}),e=>e?.code===code,`${o}:${code}`);
let c,r;
[c,r]=build('fbo_cargoes_v2_get',{supplies:[]});assert.equal(r.url,'https://api-seller.ozon.ru/v2/cargoes/get');assert.deepEqual(JSON.parse(r.body),c.params);
build('fbo_cargoes_v2_get',{supplies:[{supply_id:-1,cargo_ids:[]},{supply_id:1,cargo_ids:['-1','2']}]});
bad('fbo_cargoes_v2_get',{});bad('fbo_cargoes_v2_get',{supplies:{}});bad('fbo_cargoes_v2_get',{supplies:Array.from({length:101},()=>({supply_id:1,cargo_ids:[]}))},'OZON_LIMIT_VIOLATION');bad('fbo_cargoes_v2_get',{supplies:[{supply_id:'1',cargo_ids:[]}]});bad('fbo_cargoes_v2_get',{supplies:[{supply_id:1,cargo_ids:[1]}]});bad('fbo_cargoes_v2_get',{supplies:[{supply_id:1,cargo_ids:[],x:1}]},'UNKNOWN_OPERATION_PARAM');
for(const a of ['fbo_cargoes_v2_delete_status','fbo_cargoes_transport_activate_status','fbo_cargoes_transport_bind_status']){[c,r]=build(a,{operation_id:''});assert.equal(r.url,'https://api-seller.ozon.ru'+O[a]);assert.deepEqual(JSON.parse(r.body),c.params);bad(a,{});bad(a,{operation_id:1});bad(a,{operation_id:'x',url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED')}
[c,r]=build('fbo_cargoes_supplies_get',{supply_ids:[]});assert.equal(r.url,'https://api-seller.ozon.ru/v1/cargoes/supplies/get');build('fbo_cargoes_supplies_get',{supply_ids:Array(50).fill('1')});bad('fbo_cargoes_supplies_get',{});bad('fbo_cargoes_supplies_get',{supply_ids:[1]});bad('fbo_cargoes_supplies_get',{supply_ids:Array(51).fill('1')},'OZON_LIMIT_VIOLATION');
console.log('B28_FBO_TRANSPORT_CARGO_EXACT_REQUEST_PASS');console.log('B28_FBO_TRANSPORT_CARGO_CONTRACTS_PASS');
for(const a of Object.keys(O)){const cmd=C.normalizeCommand(R.OPERATIONS[a].template),q=E.requirementFor(cmd),p=C.planCommandForSellerCapability(cmd,null);assert.equal(q.known,true,a);assert.equal(q.required,false,a);assert.equal(p.action,'execute',a);assert.equal(p.planning.entitlement.capability_required,false,a)}
const g=G.result({status:'guidance',cluster:'supplies_fbo',section:'cargoes',version:2});for(const a of Object.keys(O))assert(g.choices.some(x=>x.operation===a),a);assert.equal(g.external_request_executed,false);assert.equal(g.physical_business_request_count,0);console.log('B28_FBO_TRANSPORT_CARGO_ENTITLEMENTS_GUIDANCE_ZERO_REQUEST_PASS');
for(const[a,p] of Object.entries({fbo_draft_cluster_list:'/v1/cluster/list',fbo_cargoes_get:'/v1/cargoes/get',fbo_draft_create_info:'/v2/draft/create/info',posting_fbo_cancel_reason_list:'/v1/posting/fbo/cancel-reason/list',supply_order_act_accept_status:'/v1/supply-order/act/accept/status'}))assert.equal(R.OPERATIONS[a]?.path,p,a);console.log('B28_B27_B26_B25_B24_B23_B22_B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');
const H={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'};
for(const[p,h] of Object.entries(H)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),h,p);console.log('B28_FBO_TRANSPORT_CARGO_PROTECTED_RUNTIME_IDENTITIES_PASS');
if(swp){const sw=JSON.parse(fs.readFileSync(swp,'utf8'));assert.equal(sw.openapi,'3.0.0');assert.equal(Object.keys(sw.paths).length,463);
const I={
'/v2/cargoes/get':['CargoesGetV2','cargoes.v2.CargoesGetRequest'],
'/v2/cargoes/delete/status':['CargoesDeleteStatusV2','cargoes.v2.CargoesDeleteStatusRequest'],
'/v1/cargoes/transport/activate/status':['CargoesTransportActivateStatus','cargoes.v1.CargoesTransportActivateStatusRequest'],
'/v1/cargoes/transport/bind/status':['CargoesTransportBindStatus','cargoes.v1.CargoesTransportBindStatusRequest'],
'/v1/cargoes/supplies/get':['CargoesSuppliesGet','cargoes.v1.CargoesSuppliesGetRequest']};
for(const[p,[id,sn]] of Object.entries(I)){const o=sw.paths[p]?.post;assert(o,p);assert.equal(o.operationId,id,p);assert.notEqual(o.deprecated,true,p);assert((o.tags||[]).includes('FBOTransport'),p);assert.equal(o.requestBody.content['application/json'].schema.$ref,'#/components/schemas/'+sn,p)}
const s1=sw.components.schemas['cargoes.v2.CargoesGetRequest'];assert.deepEqual(s1.required,['supplies']);assert.equal(s1.properties.supplies.maxItems,100);const si=sw.components.schemas['cargoes.v2.CargoesGetRequest.Supplies'];assert.deepEqual(si.required,['cargo_ids','supply_id']);assert.equal(si.properties.supply_id.type,'integer');assert.equal(si.properties.supply_id.format,'int64');assert.equal(si.properties.cargo_ids.items.type,'string');assert.equal(si.properties.cargo_ids.items.format,'int64');
assert.equal(sw.components.schemas['cargoes.v1.CargoesSuppliesGetRequest'].properties.supply_ids.maxItems,50);
for(const sn of ['cargoes.v2.CargoesDeleteStatusRequest','cargoes.v1.CargoesTransportActivateStatusRequest','cargoes.v1.CargoesTransportBindStatusRequest'])assert.deepEqual(sw.components.schemas[sn].required,['operation_id']);
const deferred=sw.components.schemas['cargoes.v1.CargoesTransportCreateStatusRequest'];assert.equal(deferred.required,undefined);assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path==='/v1/cargoes/transport/create/status'&&x?.execution_enabled),false);console.log('B28_TRANSPORT_CREATE_STATUS_DEFERRED_AMBIGUOUS_REQUIRED_PASS');
const snap=E.compileSnapshot(sw);assert.equal(snap.unresolved_rule_count,12);for(const p of Object.keys(I)){const q=snap.operations['POST '+p];assert(q,p);assert.equal(q.default_access,'ALL_ACCOUNTS',p);assert.equal(q.endpoint_allowed_subscription_types,null,p)}console.log('B28_FBO_TRANSPORT_CARGO_EXACT_SWAGGER_CURRENTNESS_PASS');console.log('B28_FBO_TRANSPORT_CARGO_EXACT_ENTITLEMENTS_PASS');}
let n=0;for(const p of fs.readdirSync(root,{recursive:true}))if(typeof p==='string'&&p.endsWith('.js'))n++;assert.equal(n,18);console.log(`B28_SYNTAX_DECLARED_JS=${n}`);console.log('B28_SYNTAX_PASS');
