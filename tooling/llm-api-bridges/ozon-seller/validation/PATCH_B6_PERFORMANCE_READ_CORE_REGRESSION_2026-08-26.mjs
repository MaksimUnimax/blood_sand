import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b6-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await import(pathToFileURL(path.join(root,'shared',name)).href+`?b6=${Date.now()}-${name}`);
const R=globalThis.OzonOperationRegistry,C=globalThis.OzonContract,G=globalThis.OzonGuidance,F=globalThis.OzonContractFactory;
assert(R&&C&&G&&F);

const added={
 performance_campaign_objects:['GET','/api/client/campaign/{campaignId}/objects','campaigns','query'],
 performance_bid_limits:['GET','/api/client/limits/list','campaigns','query'],
 performance_campaign_products:['GET','/api/client/campaign/{campaignId}/v2/products','campaigns','query'],
 performance_search_promo_products:['POST','/api/client/campaign/search_promo/v2/products','campaigns','json_body'],
 performance_media:['GET','/api/client/statistics/campaign/media/json','statistics','query'],
 performance_sku_statistics:['POST','/api/client/statistics/products/sku','statistics','json_body']
};
for(const [alias,[method,p,section,style]] of Object.entries(added)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'performance_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.cluster,'advertising_performance'); assert.equal(m.section,section); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection'); assert.equal(m.entitlement_key,`PERFORMANCE ${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B6_PERFORMANCE_REGISTRY_PASS');

const norm=(operation,params)=>C.normalizeCommand({operation,params});
const build=(operation,params)=>{const command=norm(operation,params); return [command,C.buildPerformanceRequest(command,{})];};
let [cmd,req]=build('performance_campaign_objects',{campaignId:'48852'}); assert.equal(req.url,'https://api-performance.ozon.ru/api/client/campaign/48852/objects'); assert.equal(req.method,'GET'); assert.equal(req.body,undefined);
[cmd,req]=build('performance_bid_limits',{}); assert.equal(req.url,'https://api-performance.ozon.ru/api/client/limits/list'); assert.equal(req.body,undefined);
[cmd,req]=build('performance_campaign_products',{campaignId:'48852',page:1,pageSize:20}); {const u=new URL(req.url); assert.equal(u.pathname,'/api/client/campaign/48852/v2/products'); assert.equal(u.searchParams.get('page'),'1'); assert.equal(u.searchParams.get('pageSize'),'20'); assert.equal(u.searchParams.has('campaignId'),false);}
[cmd,req]=build('performance_search_promo_products',{page:1,pageSize:20}); assert.equal(req.url,'https://api-performance.ozon.ru/api/client/campaign/search_promo/v2/products'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('performance_media',{campaignIds:['1','2'],dateFrom:'2026-08-01',dateTo:'2026-08-02'}); {const u=new URL(req.url); assert.equal(u.pathname,'/api/client/statistics/campaign/media/json'); assert.deepEqual(u.searchParams.getAll('campaignIds'),['1','2']);}
[cmd,req]=build('performance_sku_statistics',{campaignIds:['1','18446744073709551615'],dateFrom:'2026-08-01',dateTo:'2026-08-02'}); assert.equal(req.url,'https://api-performance.ozon.ru/api/client/statistics/products/sku'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params);
for(const alias of Object.keys(added)){const b=C.buildPerformanceRequest(C.normalizeCommand(R.OPERATIONS[alias].template),{}); assert.equal(b.host_alias,'performance_api'); assert(!Array.isArray(b));}
console.log('B6_PERFORMANCE_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'performance_campaign_objects',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_campaign_objects',params:{campaignId:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_campaign_objects',params:{campaignId:'18446744073709551616'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_campaign_objects',params:{campaignId:'1',url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'performance_campaign_products',params:{campaignId:'1',page:1.5}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_campaign_products',params:{campaignId:'1',pageSize:'20'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_campaign_products',params:{campaignId:'1',unknown:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'performance_bid_limits',params:{page:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_search_promo_products',params:{page:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'performance_search_promo_products',params:{headers:{Authorization:'x'}}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'performance_search_promo_products',params:{pageSize:1.1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_media',params:{campaignIds:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_media',params:{dateFrom:'2026-08-03',dateTo:'2026-08-02'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_sku_statistics',params:{campaignIds:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_sku_statistics',params:{campaignIds:['18446744073709551616']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'performance_sku_statistics',params:{dateFrom:'2026-02-30'}},'INVALID_OPERATION_PARAMS');
assert.throws(()=>C.buildRequest(norm('performance_bid_limits',{}),{}),e=>e&&e.code==='WRONG_REQUEST_BUILDER');
console.log('B6_PERFORMANCE_CONTRACTS_PASS');

const identity=x=>x;
for(const b of F.PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST){
 const style=b.method==='GET'?'query':'json_body';
 assert.throws(()=>F.createOzonContract({operations:{probe:{provider:'performance_api',method:b.method,path:b.path,effect:'READ',request_style:style,execution_enabled:true,normalizeParams:identity,sanitizeResult:identity}}}),e=>e&&e.code==='PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKED',`${b.method} ${b.path}`);
 assert.equal(Object.values(R.OPERATIONS).some(m=>m.provider==='performance_api'&&m.method===b.method&&m.path===b.path),false);
}
console.log('B6_PERFORMANCE_ASYNC_REPORT_SIDE_EFFECTS_BLOCKED_PASS');
for(const b of F.PERFORMANCE_MUTATION_BLOCKLIST){
 assert.equal(Object.values(R.OPERATIONS).some(m=>m.provider==='performance_api'&&m.method===b.method&&m.path===b.path),false);
 if(['GET','POST'].includes(b.method)){const style=b.method==='GET'?'query':'json_body'; assert.throws(()=>F.createOzonContract({operations:{probe:{provider:'performance_api',method:b.method,path:b.path,effect:'READ',request_style:style,execution_enabled:true,normalizeParams:identity,sanitizeResult:identity}}}),e=>e&&e.code==='PERFORMANCE_MUTATION_BLOCKED',`${b.method} ${b.path}`);}
}
console.log('B6_PERFORMANCE_MUTATIONS_STAY_BLOCKED_PASS');

for(const alias of Object.keys(added)){
 const command=C.normalizeCommand(R.OPERATIONS[alias].template); const r=C.sellerCapabilityRequirement(command); assert.equal(r.required,false); assert.equal(r.known,true); const plan=C.planCommandForSellerCapability(command,null); assert.equal(plan.action,'execute'); assert.equal(plan.planning.capability.probe_performed,false); assert.equal(plan.planning.entitlement.capability_required,false); assert.equal(plan.planning.entitlement.reason,'performance_provider_not_seller_subscription');
}
console.log('B6_PERFORMANCE_NO_SELLER_CAPABILITY_PROBE_PASS');

let g=G.result({status:'guidance',cluster:'advertising_performance',section:'campaigns',version:2}); for(const a of ['performance_campaign_objects','performance_bid_limits','performance_campaign_products','performance_search_promo_products']) assert(g.choices.some(x=>x.operation===a),a); assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
g=G.result({status:'guidance',cluster:'advertising_performance',section:'statistics',version:2}); for(const a of ['performance_media','performance_sku_statistics']) assert(g.choices.some(x=>x.operation===a),a); assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
console.log('B6_PERFORMANCE_GUIDANCE_ZERO_REQUEST_PASS');

const oldJson={performance_expense:'/api/client/statistics/expense/json',performance_daily:'/api/client/statistics/daily/json',performance_campaign_product:'/api/client/statistics/campaign/product/json'}; for(const [a,p] of Object.entries(oldJson)){assert.equal(R.OPERATIONS[a].provider,'performance_api'); assert.equal(R.OPERATIONS[a].method,'GET'); assert.equal(R.OPERATIONS[a].path,p); assert.equal(R.OPERATIONS[a].execution_enabled,true);}
console.log('B6_PERFORMANCE_EXISTING_JSON_ROUTES_PRESERVED_PASS');

const protectedRuntime={
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
 'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
 'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
 'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
 'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
 'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
 'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'
};
for(const [rel,sha] of Object.entries(protectedRuntime)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
console.log('B6_PERFORMANCE_PROTECTED_RUNTIME_IDENTITIES_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,304771); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec'); const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,47); const methods=new Set(['get','post','put','patch','delete','options','head','trace']); assert.equal(Object.values(sw.paths).reduce((n,x)=>n+Object.keys(x).filter(k=>methods.has(k.toLowerCase())).length,0),48);
 const targets={'GET /api/client/campaign/{campaignId}/objects':'ListCampaignObjects','GET /api/client/limits/list':'GetLimitsList','GET /api/client/campaign/{campaignId}/v2/products':'GetProductsV2','POST /api/client/campaign/search_promo/v2/products':'ExternalCampaign_ListSearchPromoProductsV2','GET /api/client/statistics/campaign/media':'MediaCampaignList','POST /api/client/statistics/products/sku':'SearchPromoProductsSKUStatistics2'};
 for(const [key,id] of Object.entries(targets)){const i=key.indexOf(' '),method=key.slice(0,i),p=key.slice(i+1),op=sw.paths?.[p]?.[method.toLowerCase()]; assert(op,key); assert.equal(op.operationId,id,key);}
 for(const p of ['/api/client/campaign/{campaignId}/objects','/api/client/campaign/{campaignId}/v2/products']){const q=sw.paths[p].get.parameters.find(x=>x.name==='campaignId'&&x.in==='path'); assert(q&&q.required); assert.equal(q.schema.type,'string'); assert.equal(q.schema.format,'uint64');}
 const promoRef=sw.paths['/api/client/campaign/search_promo/v2/products'].post.requestBody.content['application/json'].schema.$ref,promo=sw.components.schemas[promoRef.split('/').at(-1)]; assert.deepEqual(promo.required||[],[]); assert.equal(promo.properties.page.type,'integer'); assert.equal(promo.properties.pageSize.type,'integer'); assert.match(promo.properties.page.description,/единиц/i);
 assert.match(sw.paths['/api/client/statistics/campaign/media'].get.description,/\/api\/client\/statistics\/campaign\/media\/json/);
 const skuRef=sw.paths['/api/client/statistics/products/sku'].post.requestBody.content['application/json'].schema.$ref,sku=sw.components.schemas[skuRef.split('/').at(-1)]; assert.deepEqual(sku.required||[],[]); assert.equal(sku.properties.campaignIds.items.type,'string'); assert.equal(sku.properties.campaignIds.items.format,'uint64');
 for(const b of F.PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST) assert(sw.paths?.[b.path]?.[b.method.toLowerCase()],`${b.method} ${b.path}`);
 console.log('B6_PERFORMANCE_EXACT_SWAGGER_PASS');
}
