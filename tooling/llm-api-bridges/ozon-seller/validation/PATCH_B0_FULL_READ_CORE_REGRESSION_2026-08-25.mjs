import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2] || '.');
for (const rel of ['shared/runtime_names.js','shared/ozon_operation_registry.js','shared/ozon_entitlements.js','shared/ozon_contract.js','shared/ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,rel)).href + `?v=${Date.now()}-${Math.random()}`);
}
const R=globalThis.OzonOperationRegistry;
const E=globalThis.OzonEntitlements;
const C=globalThis.OzonContract;
const G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const sha256=(file)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const protectedHashes={
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
  'shared/ai_adapters.js':'5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9',
  'shared/conversation_identity.js':'939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57'
};
for (const [file,expected] of Object.entries(protectedHashes)) assert.equal(sha256(file),expected,`${file} changed unexpectedly`);
const workerText=fs.readFileSync(path.join(root,'service_worker.js'),'utf8');
assert(workerText.indexOf('ensureBatchLocalPolicy') < workerText.indexOf('ensureBatchCapabilityAndPlanning'));
assert(workerText.includes('case "OZ_REFRESH_SELLER_API_METADATA"'));
assert(workerText.includes('physical_business_request_count: 0') || workerText.includes('external_request_executed: false'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert(manifest.host_permissions.includes('https://docs.ozon.ru/*'));

// Unified registry / guidance invariants.
const validation=G.catalogValidation(C);
assert.equal(validation.ok,true, JSON.stringify(validation.errors));
assert.equal(Object.keys(R.OPERATIONS).length,13);
assert.equal(Object.keys(C.OPERATIONS).length,13);
assert.equal(R.canonicalClusterId('stock_inventory'),'stocks_inventory');
assert.equal(R.canonicalClusterId('fulfillment_supply'),'supplies_fbo');
assert.equal(R.operation('posting_fbs_get').policy_group,'personal_data_read');
assert.equal(R.operation('posting_fbs_get').execution_enabled,true);

let help=G.parseHelp('OZON_HELP_V1\n{"cluster":"stock_inventory"}');
assert.equal(help.ok,true); assert.equal(help.cluster,'stocks_inventory');
let g=G.result({status:'cluster_selected',cluster:help.cluster,version:1});
assert(g.choices.some(x=>x.operation==='stocks_current'));
help=G.parseHelp('OZON_HELP_V2\n{"cluster":"orders_postings"}');
assert.equal(help.ok,true); assert.equal(help.version,2);
g=G.result({status:'cluster_selected',cluster:help.cluster,version:2});
assert(g.choices.some(x=>x.section==='fbs_postings'));
help=G.parseHelp('OZON_HELP_V2\n{"cluster":"orders_postings","section":"fbs_postings"}');
g=G.result({status:'section_selected',cluster:help.cluster,section:help.section,version:2});
const fbsCard=g.choices.find(x=>x.operation==='posting_fbs_get');
assert(fbsCard); assert.equal(fbsCard.personal_data_setting_required_when_off,true);

// Personal-data operation has fixed transport and strict request schema.
let cmd=C.normalizeCommand({operation:'posting_fbs_get',params:{posting_number:' 123-1 ',with:{analytics_data:true,legal_info:false}}});
assert.deepEqual(cmd.params,{posting_number:'123-1',with:{analytics_data:true,legal_info:false}});
assert.throws(()=>C.normalizeCommand({operation:'posting_fbs_get',params:{posting_number:'x',url:'https://evil'}}));
assert.throws(()=>C.normalizeCommand({operation:'posting_fbs_get',params:{posting_number:'x',with:{nope:true}}}));
assert.throws(()=>C.normalizeCommand({operation:'posting_fbs_get',params:{posting_number:'x',with:{legal_info:'yes'}}}));
const pf=C.preflightExecution(cmd);
assert.equal(pf.meta.path,'/v3/posting/fbs/get'); assert.equal(pf.meta.method,'POST');
const rawPersonal={result:{customer:{name:'Ivan',phone:'+7000'},addressee:{name:'Petr'},posting_number:'x'}};
assert.deepEqual(C.OPERATIONS.posting_fbs_get.sanitizeResult(rawPersonal),rawPersonal);
const normalSanitized=C.OPERATIONS.posting_fbo_list.sanitizeResult(rawPersonal);
assert.notDeepEqual(normalSanitized,rawPersonal);

// Bundled entitlement coverage of all currently enabled Seller operations.
for (const [alias,meta] of Object.entries(R.OPERATIONS)) {
  if (meta.provider!=='seller_api') continue;
  const req=E.requirementFor({operation:alias,params: alias==='analytics_data'?{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['revenue'],limit:1}: alias==='product_queries'?{date_from:'2026-08-01T00:00:00Z',page_size:1,skus:['1']}: alias==='product_queries_details'?{date_from:'2026-08-01T00:00:00Z',page_size:1,skus:['1'],limit_by_sku:1}:{}},E.BUNDLED_SNAPSHOT,Date.parse('2026-08-25T00:00:00Z'));
  assert.notEqual(req.known,false, `${alias} must have bundled LKG entitlement knowledge`);
}

// Dynamic entitlement semantics: no silent rewrite, explicit allowed sets.
let request={operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['revenue'],limit:10}};
let req=E.requirementFor(request,E.BUNDLED_SNAPSHOT,Date.parse('2026-08-25T00:00:00Z'));
assert.equal(req.required,false); assert.equal(req.known,true);
request={operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['returns'],limit:10}};
req=E.requirementFor(request,E.BUNDLED_SNAPSHOT,Date.parse('2026-08-25T00:00:00Z'));
assert.equal(req.required,true); assert.deepEqual(req.allowed_subscription_types,['PREMIUM_PLUS','PREMIUM_PRO']);
let plan=C.planCommandForSellerCapability(request,{status:'known',subscription_type:'UNSPECIFIED',is_premium:false,probe_performed:true},Date.parse('2026-08-25T00:00:00Z'),E.BUNDLED_SNAPSHOT);
assert.equal(plan.action,'reject'); assert.equal(plan.error.code,'SUBSCRIPTION_REQUIRED'); assert.deepEqual(plan.command.params.metrics,['returns']);
plan=C.planCommandForSellerCapability(request,{status:'known',subscription_type:'PREMIUM_PLUS',is_premium:true,probe_performed:true},Date.parse('2026-08-25T00:00:00Z'),E.BUNDLED_SNAPSHOT);
assert.equal(plan.action,'execute'); assert.deepEqual(plan.command.params.metrics,['returns']); assert.deepEqual(plan.logical_command.params.metrics,['returns']);
request={operation:'product_queries_details',params:{date_from:'2026-08-20T00:00:00Z',page_size:10,skus:['1'],limit_by_sku:10,sort_by:'BY_VIEWS'}};
req=E.requirementFor(request,E.BUNDLED_SNAPSHOT,Date.parse('2026-08-25T00:00:00Z'));
assert.equal(req.required,true); assert.deepEqual(req.allowed_subscription_types,['PREMIUM','PREMIUM_PLUS']);

// Unknown/stale rule never invents a Premium block and preserves exact request.
const unknownSnapshot={schema:E.SNAPSHOT_SCHEMA,source:{operation_count:463,source_hash:'test'},unresolved_rule_count:1,inventory:{},operations:{'POST /v4/product/info/stocks':{default_access:'UNKNOWN',endpoint_allowed_subscription_types:null,feature_rules:[]}}};
const stocks={operation:'stocks_current',params:{filter:{},limit:10}};
plan=C.planCommandForSellerCapability(stocks,{status:'known',subscription_type:'UNSPECIFIED',probe_performed:true},Date.now(),unknownSnapshot);
assert.equal(plan.action,'execute'); assert.equal(plan.planning.entitlement.status,'ENTITLEMENT_UNKNOWN'); assert.deepEqual(plan.command,plan.logical_command);

// Synthetic Swagger compiler: all operations get a rule; subscription text is parsed; unknown wording fails open to provider.
const swagger={
  openapi:'3.0.0',info:{title:'Документация Ozon Seller API'},servers:[{url:'https://api-seller.ozon.ru'}],components:{schemas:{
    AnalyticsReq:{type:'object',properties:{dimension:{description:'Доступны только продавцам с подпиской Premium Plus'},metrics:{description:'Доступны только продавцам с подпиской Premium Plus'}}},
    PQReq:{type:'object',properties:{sort_by:{$ref:'#/components/schemas/PQSort'}}},
    PQSort:{type:'string',description:'BY_VIEWS BY_POSITION BY_CONVERSION доступна только с подпиской Premium или Premium Plus'}
  }},paths:{}};
for(let i=0;i<398;i++) swagger.paths[`/v1/test/${i}`]={post:{summary:'Read',operationId:`Test${i}`,description:'',responses:{}}};
swagger.paths['/v1/roles']={post:{summary:'Roles',operationId:'Roles',description:'',responses:{}}};
swagger.paths['/v1/premium-only']={post:{summary:'Premium',operationId:'PremiumOnly',description:'Доступно для продавцов с подпиской Premium Pro.',responses:{}}};
swagger.paths['/v1/analytics/data']={post:{summary:'Analytics',operationId:'Analytics',description:'Для продавцов с подпиской Premium Plus или Premium Pro ограничений нет.',requestBody:{content:{'application/json':{schema:{$ref:'#/components/schemas/AnalyticsReq'}}}},responses:{}}};
swagger.paths['/v1/analytics/product-queries']={post:{summary:'PQ',operationId:'PQ',description:'Полная аналитика доступна с подпиской Premium, Premium Plus или Premium Pro. Аналитика за даты раньше месяца назад доступна только с подпиской Premium, Premium Plus или Premium Pro.',responses:{}}};
swagger.paths['/v1/analytics/product-queries/details']={post:{summary:'PQD',operationId:'PQD',description:'Полная аналитика доступна с подпиской Premium, Premium Plus или Premium Pro. Аналитика за даты раньше месяца назад доступна только с подпиской Premium, Premium Plus или Premium Pro.',requestBody:{content:{'application/json':{schema:{$ref:'#/components/schemas/PQReq'}}}},responses:{}}};
const compiled=E.compileSnapshot(swagger,{sourceHash:'abc',capturedAt:'2026-08-25T00:00:00Z'});
assert.equal(compiled.source.operation_count,403);
assert.equal(Object.keys(compiled.operations).length,403);
assert.equal(compiled.operations['POST /v1/roles'].default_access,'ALL_ACCOUNTS');
assert.deepEqual(compiled.operations['POST /v1/premium-only'].endpoint_allowed_subscription_types,['PREMIUM_PRO']);
assert(compiled.operations['POST /v1/analytics/data'].feature_rules.length>=5);

console.log('B0_REGISTRY_GUIDANCE_PASS');
console.log('B0_PERSONAL_DATA_CONTRACT_PASS');
console.log('B0_ENTITLEMENT_EXACT_REQUEST_PASS');
console.log('B0_DYNAMIC_SWAGGER_COMPILER_PASS');
console.log('B0_COMPATIBILITY_CLUSTER_ALIASES_PASS');
console.log('B0_PROTECTED_A5_RUNTIME_IDENTITIES_PASS');
console.log('B0_POLICY_BEFORE_CAPABILITY_PASS');