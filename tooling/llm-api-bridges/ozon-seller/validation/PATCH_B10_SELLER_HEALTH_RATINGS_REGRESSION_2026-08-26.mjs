import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b10-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href+`?b10=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
  seller_rating_summary:['POST','/v1/rating/summary','json_body','ratings'],
  seller_rating_history:['POST','/v1/rating/history','json_body','ratings'],
  seller_fbs_error_index:['POST','/v1/rating/index/fbs/info','no_body','fbs_error_index'],
  seller_fbs_error_postings:['POST','/v1/rating/index/fbs/posting/list','json_body','fbs_error_index']
};
for(const [alias,[method,p,style,section]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true);
  assert.equal(m.currentness,'current'); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection');
  assert.equal(m.cluster,'seller_health'); assert.equal(m.section,section); assert.equal(m.guidance_visibility,'user');
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B10_SELLER_HEALTH_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('seller_rating_summary',{});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/rating/summary'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),{}); assert(!Array.isArray(req));
[cmd,req]=build('seller_rating_history',{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-26T23:59:59Z',ratings:['rating_on_time','rating_general_indicator_fbs_rfbs'],with_premium_scores:true});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/rating/history'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('seller_fbs_error_index',{});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/rating/index/fbs/info'); assert.equal(req.body,undefined); assert(!Array.isArray(req));
[cmd,req]=build('seller_fbs_error_postings',{cursor:'CURSOR',filter:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-26T23:59:59Z',posting_numbers:['123-1','123-2']},limit:1000});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/rating/index/fbs/posting/list'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
console.log('B10_SELLER_HEALTH_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'seller_rating_summary',params:{extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'seller_rating_history',params:{date_to:'2026-08-02T00:00:00Z',ratings:['rating_on_time']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_rating_history',params:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_rating_history',params:{date_from:'2026-08-03T00:00:00Z',date_to:'2026-08-02T00:00:00Z',ratings:['rating_on_time']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_rating_history',params:{date_from:'2026-08-01',date_to:'2026-08-02T00:00:00Z',ratings:['rating_on_time']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_rating_history',params:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',ratings:['BAD']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_rating_history',params:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',ratings:['rating_on_time'],with_premium_scores:'yes'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_rating_history',params:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',ratings:['rating_on_time'],url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'seller_fbs_error_index',params:{x:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_fbs_error_postings',params:{limit:100}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_fbs_error_postings',params:{filter:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z'},limit:1001}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_fbs_error_postings',params:{filter:{date_from:'2026-08-03T00:00:00Z',date_to:'2026-08-02T00:00:00Z'},limit:100}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_fbs_error_postings',params:{filter:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',posting_numbers:Array(1001).fill('x')},limit:100}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_fbs_error_postings',params:{filter:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',posting_numbers:[123]},limit:100}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_fbs_error_postings',params:{filter:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',extra:true},limit:100}},'UNKNOWN_OPERATION_PARAM');
console.log('B10_SELLER_HEALTH_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const command=C.normalizeCommand(R.OPERATIONS[alias].template);
  const requirement=E.requirementFor(command);
  assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias);
  const plan=C.planCommandForSellerCapability(command,null);
  assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B10_SELLER_HEALTH_ENTITLEMENTS_PASS');

for(const [alias,p] of Object.entries({review_list:'/v2/review/list',review_info:'/v2/review/info',question_list:'/v1/question/list'})){
  assert.equal(R.OPERATIONS[alias].path,p); assert.equal(R.OPERATIONS[alias].execution_enabled,true);
}
let q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template)); assert.equal(q.known,false); assert.equal(q.required,false);
q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template)); assert.equal(q.known,true); assert.equal(q.required,true); assert.deepEqual(q.allowed_subscription_types,['PREMIUM_PLUS']);
for(const [alias,p] of Object.entries({supply_order_list:'/v3/supply-order/list',supply_order_get:'/v3/supply-order/get',supply_order_timeslot_list:'/v2/supply-order/timeslot/list'})) assert.equal(R.OPERATIONS[alias].path,p);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

let g=G.result({status:'guidance',cluster:'seller_health',section:'ratings',version:2});
for(const alias of ['seller_rating_summary','seller_rating_history']) assert(g.choices.some(x=>x.operation===alias),alias);
assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
g=G.result({status:'guidance',cluster:'seller_health',section:'fbs_error_index',version:2});
for(const alias of ['seller_fbs_error_index','seller_fbs_error_postings']) assert(g.choices.some(x=>x.operation===alias),alias);
assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
console.log('B10_SELLER_HEALTH_GUIDANCE_ZERO_REQUEST_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
  const expected={
    '/v1/rating/summary':'RatingAPI_RatingSummaryV1',
    '/v1/rating/history':'RatingAPI_RatingHistoryV1',
    '/v1/rating/index/fbs/info':'RatingAPI_GetFBSRatingIndexInfoV1',
    '/v1/rating/index/fbs/posting/list':'RatingAPI_ListFBSRatingIndexPostingsV1'
  };
  for(const [p,id] of Object.entries(expected)){const op=sw.paths?.[p]?.post; assert(op,p); assert.notEqual(op.deprecated,true,p); assert.equal(op.operationId,id,p);}
  const summary=sw.paths['/v1/rating/summary'].post; const summaryRef=summary.requestBody.content['application/json'].schema.$ref; assert.equal(summaryRef,'#/components/schemas/v1Empty'); assert.equal(summary.requestBody.required,true);
  const history=sw.paths['/v1/rating/history'].post; const historyRef=history.requestBody.content['application/json'].schema.$ref; const hs=sw.components.schemas[historyRef.split('/').at(-1)]; assert.deepEqual(new Set(hs.required),new Set(['ratings','date_from','date_to'])); assert.equal(hs.properties.date_from.format,'date-time'); assert.equal(hs.properties.date_to.format,'date-time');
  const info=sw.paths['/v1/rating/index/fbs/info'].post; assert.equal(info.requestBody,undefined);
  const postings=sw.paths['/v1/rating/index/fbs/posting/list'].post; const postRef=postings.requestBody.content['application/json'].schema.$ref; const ps=sw.components.schemas[postRef.split('/').at(-1)]; assert.deepEqual(new Set(ps.required),new Set(['filter','limit'])); assert.equal(ps.properties.limit.maximum,1000); const filterRef=ps.properties.filter.$ref; const fschema=sw.components.schemas[filterRef.split('/').at(-1)]; assert.deepEqual(new Set(fschema.required),new Set(['date_from','date_to']));
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-26T00:00:00.000Z'}); assert.equal(snap.unresolved_rule_count,12);
  for(const p of Object.keys(expected)){const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);}
  console.log('B10_SELLER_HEALTH_EXACT_SWAGGER_PASS');
  console.log('B10_SELLER_HEALTH_EXACT_ENTITLEMENTS_PASS');
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
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8'); assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/);
console.log('B10_SELLER_HEALTH_PROTECTED_RUNTIME_IDENTITIES_PASS');
