import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b9-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href+`?b9=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
  review_list:['POST','/v2/review/list','reviews'],
  review_info:['POST','/v2/review/info','reviews'],
  question_list:['POST','/v1/question/list','questions']
};
for(const [alias,[method,p,section]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,'json_body'); assert.equal(m.execution_enabled,true);
  assert.equal(m.currentness,'current'); assert.equal(m.safety_class,'PERSONAL_DATA_READ_GATED');
  assert.equal(m.privacy_policy,'operator_personal_data_gate'); assert.equal(m.policy_group,'personal_data_read');
  assert.equal(m.default_allowed,false); assert.equal(m.guidance_visibility,'conditional');
  assert.equal(m.cluster,'reviews_questions'); assert.equal(m.section,section);
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
for(const legacy of ['/v1/review/list','/v1/review/info']){
  assert.equal(Object.values(R.OPERATIONS).some(m=>m.execution_enabled===true&&m.path===legacy),false,legacy);
}
for(const mutation of ['/v1/review/comment/create','/v2/review/comment/delete','/v2/review/change-status','/v1/question/answer/create','/v1/question/answer/delete','/v1/question/change-status']){
  assert.equal(Object.values(R.OPERATIONS).some(m=>m.execution_enabled===true&&m.path===mutation),false,mutation);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B9_REVIEWS_QUESTIONS_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('review_list',{filters:{order_status:'DELIVERED',published_from:'2026-08-01T00:00:00Z',published_to:'2026-08-02T00:00:00Z',skus:['1','9223372036854775807'],status:'NEW'},limit:20,sort_dir:'DESC'});
assert.equal(req.url,'https://api-seller.ozon.ru/v2/review/list'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('review_info',{review_id:'review-1'}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/review/info'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('question_list',{filter:{date_from:'2026-08-01T00:00:00Z',date_to:'2026-08-02T00:00:00Z',status:'UNPROCESSED'},limit:100,sort_dir:'ASC'});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/question/list'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
console.log('B9_REVIEWS_QUESTIONS_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'review_list',params:{limit:19}},'OZON_LIMIT_VIOLATION');
rejects({operation:'review_list',params:{limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'review_list',params:{limit:20,sort_dir:'BAD'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'review_list',params:{limit:20,filters:{order_status:'BAD'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'review_list',params:{limit:20,filters:{status:'UNPROCESSED'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'review_list',params:{limit:20,filters:{skus:[1]}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'review_list',params:{limit:20,filters:{skus:Array(1001).fill('1')}}},'OZON_LIMIT_VIOLATION');
rejects({operation:'review_list',params:{limit:20,filters:{published_from:'2026-08-03T00:00:00Z',published_to:'2026-08-02T00:00:00Z'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'review_list',params:{limit:20,url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'review_info',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'review_info',params:{review_id:'x',extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'question_list',params:{limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'question_list',params:{sort_dir:'BAD'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'question_list',params:{filter:{status:'BAD'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'question_list',params:{filter:{date_from:'2026-08-03T00:00:00Z',date_to:'2026-08-02T00:00:00Z'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'question_list',params:{headers:{Authorization:'x'}}},'TRANSPORT_INJECTION_REJECTED');
console.log('B9_REVIEWS_QUESTIONS_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const meta=R.OPERATIONS[alias];
  assert.equal(meta.policy_group,'personal_data_read');
  assert.equal(meta.default_allowed,false);
}
let personalCommand=C.normalizeCommand({operation:'review_info',params:{review_id:'review-1'}});
let personalResult=C.sanitizeResult(personalCommand,{id:'review-1',text:'buyer free text'});
assert.equal(personalResult.text,'buyer free text');
personalCommand=C.normalizeCommand({operation:'question_list',params:{}});
personalResult=C.sanitizeResult(personalCommand,{questions:[{id:'q1',author_name:'Buyer Name',text:'buyer question'}]});
assert.equal(personalResult.questions[0].author_name,'Buyer Name');
assert.equal(personalResult.questions[0].text,'buyer question');
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8');
assert.match(worker,/meta\?\.policy_group !== "personal_data_read" \|\| personalDataEnabled/);
assert.match(worker,/OPERATION_DISABLED_BY_USER/);
console.log('B9_REVIEWS_QUESTIONS_PERSONAL_DATA_GATE_CONTRACT_PASS');

let requirement=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template));
assert.equal(requirement.known,false); assert.equal(requirement.required,false);
let plan=C.planCommandForSellerCapability(C.normalizeCommand(R.OPERATIONS.review_list.template),null);
assert.equal(plan.action,'execute'); assert.equal(plan.planning.entitlement.status,'ENTITLEMENT_UNKNOWN'); assert.equal(plan.planning.entitlement.capability_required,false);
requirement=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_info.template));
assert.equal(requirement.known,false); assert.equal(requirement.required,false);
requirement=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template));
assert.equal(requirement.known,true); assert.equal(requirement.required,true); assert.deepEqual(requirement.allowed_subscription_types,['PREMIUM_PLUS']);
plan=C.planCommandForSellerCapability(C.normalizeCommand(R.OPERATIONS.question_list.template),{status:'unknown',subscription_type:'UNKNOWN',probe_performed:true});
assert.equal(plan.action,'reject'); assert.equal(plan.error.code,'ENTITLEMENT_UNKNOWN');
plan=C.planCommandForSellerCapability(C.normalizeCommand(R.OPERATIONS.question_list.template),{status:'known',subscription_type:'PREMIUM_PLUS',probe_performed:true});
assert.equal(plan.action,'execute'); assert.equal(plan.planning.entitlement.capability_required,true);
plan=C.planCommandForSellerCapability(C.normalizeCommand(R.OPERATIONS.question_list.template),{status:'known',subscription_type:'PREMIUM_PRO',probe_performed:true});
assert.equal(plan.action,'reject'); assert.equal(plan.error.code,'SUBSCRIPTION_REQUIRED');
console.log('B9_REVIEWS_QUESTIONS_ENTITLEMENT_PLANNING_PASS');

const supply={
 supply_order_list:'/v3/supply-order/list',
 supply_order_get:'/v3/supply-order/get',
 supply_order_status_counter:'/v1/supply-order/status/counter',
 supply_order_bundle:'/v1/supply-order/bundle',
 supply_order_timeslot_list:'/v2/supply-order/timeslot/list',
 supply_order_details:'/v1/supply-order/details'
};
for(const [alias,p] of Object.entries(supply)){const m=R.OPERATIONS[alias]; assert(m); assert.equal(m.path,p); assert.equal(m.execution_enabled,true); assert.equal(m.effect,'READ');}
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B9_B8_SUPPLY_AND_B7_ENTITLEMENT_SEMANTICS_CARRY_FORWARD_PASS');

let g=G.result({status:'guidance',cluster:'reviews_questions',section:'reviews',version:2});
for(const alias of ['review_list','review_info']) assert(g.choices.some(x=>x.operation===alias),alias);
assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
g=G.result({status:'guidance',cluster:'reviews_questions',section:'questions',version:2});
assert(g.choices.some(x=>x.operation==='question_list')); assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
console.log('B9_REVIEWS_QUESTIONS_GUIDANCE_ZERO_REQUEST_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath);
  assert.equal(bytes.length,3933043);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);

  const v1List=sw.paths?.['/v1/review/list']?.post; assert(v1List); assert.equal(v1List.deprecated,true); assert.match(String(v1List.description||''),/\/v2\/review\/list/);
  const v1Info=sw.paths?.['/v1/review/info']?.post; assert(v1Info); assert.equal(v1Info.deprecated,true); assert.match(String(v1Info.description||''),/\/v2\/review\/info/);
  const reviewList=sw.paths?.['/v2/review/list']?.post; assert(reviewList); assert.notEqual(reviewList.deprecated,true); assert.equal(reviewList.operationId,'ReviewListV2');
  const reviewInfo=sw.paths?.['/v2/review/info']?.post; assert(reviewInfo); assert.notEqual(reviewInfo.deprecated,true); assert.equal(reviewInfo.operationId,'ReviewInfoV2');
  const questionList=sw.paths?.['/v1/question/list']?.post; assert(questionList); assert.notEqual(questionList.deprecated,true); assert.equal(questionList.operationId,'Question_List');

  const reviewListRef=reviewList.requestBody.content['application/json'].schema.$ref;
  const reviewListSchema=sw.components.schemas[reviewListRef.split('/').at(-1)];
  assert.deepEqual(reviewListSchema.required,['limit']); assert.equal(reviewListSchema.properties.limit.minimum,20); assert.equal(reviewListSchema.properties.limit.maximum,100);
  assert.deepEqual(sw.components.schemas['review.v2.ReviewListV2Request.SortDir.Enum'].enum,['ASC','DESC']);
  assert.deepEqual(sw.components.schemas['review.v2.ReviewListV2Request.Filters.OrderStatus.Enum'].enum,['ALL','DELIVERED','CANCELLED']);
  assert.deepEqual(sw.components.schemas['review.v2.ReviewListV2Request.Filters.Status.Enum'].enum,['ALL','NEW','VIEWED','PROCESSED']);
  const reviewFilters=sw.components.schemas['review.v2.ReviewListV2Request.Filters'];
  assert.equal(reviewFilters.properties.skus.maxItems,1000); assert.equal(reviewFilters.properties.skus.items.type,'string'); assert.equal(reviewFilters.properties.skus.items.format,'int64');

  const reviewInfoRef=reviewInfo.requestBody.content['application/json'].schema.$ref;
  const reviewInfoSchema=sw.components.schemas[reviewInfoRef.split('/').at(-1)];
  assert.deepEqual(reviewInfoSchema.required,['review_id']); assert.equal(reviewInfoSchema.properties.review_id.type,'string');
  const reviewInfoResponse=sw.components.schemas[reviewInfo.responses['200'].content['application/json'].schema.$ref.split('/').at(-1)];
  assert.equal(reviewInfoResponse.properties.text.type,'string');

  const questionRef=questionList.requestBody.content['application/json'].schema.$ref;
  const questionSchema=sw.components.schemas[questionRef.split('/').at(-1)];
  assert.deepEqual(questionSchema.required||[],[]); assert.equal(questionSchema.properties.limit.maximum,100);
  assert.deepEqual(sw.components.schemas['question.v1.GetQuestionListRequest.SortDir.Enum'].enum,['DESC','ASC']);
  const questionItem=sw.components.schemas.v1QuestionListResponseQuestions;
  assert.equal(questionItem.properties.author_name.type,'string'); assert.equal(questionItem.properties.text.type,'string');

  assert.match(String(reviewList.description||''),/Управление отзывами/); assert.match(String(reviewList.description||''),/Premium Pro/);
  assert.match(String(reviewInfo.description||''),/Управление отзывами/); assert.match(String(reviewInfo.description||''),/Premium Pro/);
  assert.match(String(questionList.description||''),/Premium Plus/);

  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-26T00:00:00.000Z'});
  assert.equal(snap.unresolved_rule_count,12);
  for(const key of ['POST /v2/review/list','POST /v2/review/info']){
    assert.equal(snap.operations[key].default_access,'UNKNOWN');
    assert(snap.unresolved_rules.some(x=>x.key===key&&x.reason==='endpoint_subscription_alternative_unrepresentable'));
  }
  assert.equal(snap.operations['POST /v1/question/list'].default_access,'SUBSCRIPTION_RESTRICTED');
  assert.deepEqual(snap.operations['POST /v1/question/list'].endpoint_allowed_subscription_types,['PREMIUM_PLUS']);
  const reviewReq=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template),snap);
  assert.equal(reviewReq.known,false); assert.equal(reviewReq.required,false);
  const questionReq=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template),snap);
  assert.equal(questionReq.known,true); assert.equal(questionReq.required,true); assert.deepEqual(questionReq.allowed_subscription_types,['PREMIUM_PLUS']);
  console.log('B9_REVIEWS_QUESTIONS_EXACT_SWAGGER_CURRENTNESS_PASS');
  console.log('B9_REVIEWS_QUESTIONS_EXACT_ENTITLEMENTS_PASS');
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
for(const [rel,sha] of Object.entries(protectedRuntime)){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
}
assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/);
console.log('B9_REVIEWS_QUESTIONS_PROTECTED_RUNTIME_IDENTITIES_PASS');
