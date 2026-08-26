import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b7-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await import(pathToFileURL(path.join(root,'shared',name)).href+`?b7=${Date.now()}-${name}`);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
 analytics_data:['POST','/v1/analytics/data','sales_analytics','sales_revenue_units'],
 product_queries:['POST','/v1/analytics/product-queries','search_visibility','product_queries'],
 product_queries_details:['POST','/v1/analytics/product-queries/details','search_visibility','query_details']
};
for(const [alias,[method,p,cluster,section]] of Object.entries(ops)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.request_style,'json_body'); assert.equal(m.execution_enabled,true); assert.equal(m.cluster,cluster); assert.equal(m.section,section); assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B7_ANALYTICS_SEARCH_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('analytics_data',{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['revenue'],limit:100}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/analytics/data'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('product_queries',{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/analytics/product-queries'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('product_queries_details',{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1'],limit_by_sku:10}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/analytics/product-queries/details'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B7_ANALYTICS_SEARCH_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['revenue'],limit:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['bad'],metrics:['revenue'],limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['bad'],limit:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'analytics_data',params:{date_from:'2026-08-01',date_to:'2026-08-02',dimension:['day'],metrics:['revenue'],limit:1,url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'product_queries',params:{date_from:'2026-08-01T00:00:00Z',page_size:1001,skus:['1']}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_queries',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:Array(1001).fill('1')}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_queries',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1'],page:-1}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_queries',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1'],sort_by:'BY_BAD'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_queries_details',params:{date_from:'2026-08-01T00:00:00Z',page_size:101,skus:['1'],limit_by_sku:10}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_queries_details',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:['1'],limit_by_sku:16}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_queries_details',params:{date_from:'2026-08-01T00:00:00Z',page_size:10,skus:[1],limit_by_sku:10}},'INVALID_OPERATION_PARAMS');
console.log('B7_ANALYTICS_SEARCH_CONTRACTS_PASS');

// The literal Premium program URL contains the substring "premium-pro" in "premium-program".
// It must never be classified as Premium Pro.
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
assert.deepEqual(E.subscriptionTypesFromText('Premium или Premium Plus'),['PREMIUM','PREMIUM_PLUS']);
console.log('B7_ANALYTICS_PREMIUM_PRO_URL_FALSE_POSITIVE_BLOCKED_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40'); const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
 const expected={
  '/v1/analytics/data':{id:'AnalyticsAPI_AnalyticsGetData',required:['date_from','date_to','dimension','metrics','limit']},
  '/v1/analytics/product-queries':{id:'AnalyticsAPI_AnalyticsProductQueries',required:['page_size','date_from','skus']},
  '/v1/analytics/product-queries/details':{id:'AnalyticsAPI_AnalyticsProductQueriesDetails',required:['page_size','date_from','skus','limit_by_sku']}
 };
 for(const [p,spec] of Object.entries(expected)){const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(op.operationId,spec.id,p); const ref=op.requestBody.content['application/json'].schema.$ref; const schema=sw.components.schemas[ref.split('/').at(-1)]; assert.deepEqual(schema.required||[],spec.required,p);}
 const analytics=sw.paths['/v1/analytics/data'].post; assert.match(analytics.description,/1 раза в минуту/); assert.match(analytics.description,/Premium Plus/); assert.match(analytics.description,/Premium Pro/);
 const pqRef=sw.paths['/v1/analytics/product-queries'].post.requestBody.content['application/json'].schema.$ref,pq=sw.components.schemas[pqRef.split('/').at(-1)]; assert.equal(pq.properties.page.minimum,0); assert.equal(pq.properties.page_size.maximum,1000); const pqs=sw.components.schemas[pq.properties.sort_by.$ref.split('/').at(-1)]; assert.deepEqual(pqs.enum,['BY_SEARCHES','BY_VIEWS','BY_POSITION','BY_CONVERSION','BY_GMV']);
 const dRef=sw.paths['/v1/analytics/product-queries/details'].post.requestBody.content['application/json'].schema.$ref,ds=sw.components.schemas[dRef.split('/').at(-1)]; assert.match(ds.properties.page.description,/Минимум — 0/); assert.match(ds.properties.page_size.description,/Максимум — 100/); assert.match(ds.properties.limit_by_sku.description,/Максимум — 15/); const dsort=sw.components.schemas[ds.properties.sort_by.$ref.split('/').at(-1)]; assert.match(dsort.description,/Premium\]/); assert.match(dsort.description,/Premium Plus/); assert.doesNotMatch(dsort.description,/Premium Pro/);
 const parsed=E.subscriptionTypesFromText(dsort.description); assert.deepEqual(parsed,['PREMIUM','PREMIUM_PLUS']);
 const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-26T00:00:00.000Z'}); assert.equal(snap.unresolved_rule_count,0);
 const rule=snap.operations['POST /v1/analytics/product-queries/details']; const restricted=rule.feature_rules.find(x=>x.id==='product_queries_details_restricted_sort'); assert(restricted); assert.deepEqual(restricted.allowed_subscription_types,['PREMIUM','PREMIUM_PLUS']);
 const requirement=E.requirementFor(C.normalizeCommand({operation:'product_queries_details',params:{date_from:'2026-08-20T00:00:00Z',page_size:10,skus:['1'],limit_by_sku:10,sort_by:'BY_POSITION'}}),snap,Date.parse('2026-08-26T12:00:00Z')); assert.equal(requirement.required,true); assert.deepEqual(requirement.allowed_subscription_types,['PREMIUM','PREMIUM_PLUS']); assert(!requirement.allowed_subscription_types.includes('PREMIUM_PRO'));
 const analyticsRequirement=E.requirementFor(C.normalizeCommand({operation:'analytics_data',params:{date_from:'2026-08-20',date_to:'2026-08-21',dimension:['day'],metrics:['hits_view'],limit:10}}),snap,Date.parse('2026-08-26T12:00:00Z')); assert.equal(analyticsRequirement.required,true); assert.deepEqual(analyticsRequirement.allowed_subscription_types,['PREMIUM_PLUS','PREMIUM_PRO']);
 console.log('B7_ANALYTICS_SEARCH_EXACT_SWAGGER_PASS');
 console.log('B7_ANALYTICS_ENTITLEMENT_COMPILER_EXACT_PASS');
}

let g=G.result({status:'guidance',cluster:'sales_analytics',section:'sales_revenue_units',version:2}); assert(g.choices.some(x=>x.operation==='analytics_data')); assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
g=G.result({status:'guidance',cluster:'search_visibility',section:'product_queries',version:2}); assert(g.choices.some(x=>x.operation==='product_queries')); assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
g=G.result({status:'guidance',cluster:'search_visibility',section:'query_details',version:2}); assert(g.choices.some(x=>x.operation==='product_queries_details')); assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
console.log('B7_ANALYTICS_SEARCH_GUIDANCE_ZERO_REQUEST_PASS');

const protectedB6={
 'shared/ozon_operation_registry.js':'d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b',
 'shared/ozon_contract.js':'e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7',
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
 'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
 'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
 'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
 'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
 'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
 'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'
};
for(const [rel,sha] of Object.entries(protectedB6)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8'); assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/);
console.log('B7_ANALYTICS_QUOTA_RUNTIME_PRESERVED_PASS');
console.log('B7_ANALYTICS_PROTECTED_B6_IDENTITIES_PASS');
