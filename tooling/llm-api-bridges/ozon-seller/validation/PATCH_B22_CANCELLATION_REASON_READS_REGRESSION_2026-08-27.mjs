import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || '/tmp/ozon-b22-exact');
const swaggerPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const load = async (n) => import(pathToFileURL(path.join(root, 'shared', n)).href + `?b22=${Date.now()}-${n}`);
for (const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');

const ops={
  posting_fbs_cancel_reason_list:['POST','/v2/posting/fbs/cancel-reason/list','no_body'],
  cancel_reason_list_by_order:['POST','/v1/cancel-reason/list-by-order','json_body'],
  cancel_reason_list_by_posting:['POST','/v1/cancel-reason/list-by-posting','json_body']
};
for(const [alias,[method,p,request_style]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  const expected={provider:'seller_api',method,path:p,effect:'READ',request_style,execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'returns_cancellations',section:'cancellations',workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`${method} ${p}`};
  for(const [k,v] of Object.entries(expected)) assert.deepEqual(m[k],v,`${alias}.${k}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B22_CANCELLATION_REASON_REGISTRY_PASS');

const build=(operation,params)=>{const c=C.normalizeCommand({operation,params});return[c,C.buildRequest(c,{})];};
const rejects=(o,p,code)=>assert.throws(()=>C.normalizeCommand({operation:o,params:p}),e=>e?.code===code,`${o}:${code}`);
let c,r;
[c,r]=build('posting_fbs_cancel_reason_list',{});
assert.equal(r.method,'POST'); assert.equal(r.url,'https://api-seller.ozon.ru/v2/posting/fbs/cancel-reason/list'); assert.equal(r.body,undefined);
[c,r]=build('cancel_reason_list_by_order',{order_number:'12345678-0001'});
assert.equal(r.url,'https://api-seller.ozon.ru/v1/cancel-reason/list-by-order'); assert.deepEqual(JSON.parse(r.body),c.params);
[c,r]=build('cancel_reason_list_by_posting',{posting_number:'12345678-0001-1'});
assert.equal(r.url,'https://api-seller.ozon.ru/v1/cancel-reason/list-by-posting'); assert.deepEqual(JSON.parse(r.body),c.params);
console.log('B22_CANCELLATION_REASON_EXACT_REQUEST_PASS');

rejects('posting_fbs_cancel_reason_list',{x:1},'INVALID_OPERATION_PARAMS');
rejects('posting_fbs_cancel_reason_list',{url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED');
rejects('cancel_reason_list_by_order',{},'INVALID_OPERATION_PARAMS');
rejects('cancel_reason_list_by_order',{order_number:1},'INVALID_OPERATION_PARAMS');
rejects('cancel_reason_list_by_order',{order_number:'   '},'INVALID_OPERATION_PARAMS');
rejects('cancel_reason_list_by_order',{order_number:'123',x:1},'UNKNOWN_OPERATION_PARAM');
rejects('cancel_reason_list_by_order',{order_number:'123',headers:{}},'TRANSPORT_INJECTION_REJECTED');
rejects('cancel_reason_list_by_posting',{},'INVALID_OPERATION_PARAMS');
rejects('cancel_reason_list_by_posting',{posting_number:1},'INVALID_OPERATION_PARAMS');
rejects('cancel_reason_list_by_posting',{posting_number:'   '},'INVALID_OPERATION_PARAMS');
rejects('cancel_reason_list_by_posting',{posting_number:'123',x:1},'UNKNOWN_OPERATION_PARAM');
rejects('cancel_reason_list_by_posting',{posting_number:'123',method:'GET'},'TRANSPORT_INJECTION_REJECTED');
console.log('B22_CANCELLATION_REASON_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const cmd=C.normalizeCommand(R.OPERATIONS[alias].template), req=E.requirementFor(cmd), plan=C.planCommandForSellerCapability(cmd,null);
  assert.equal(req.known,true,alias); assert.equal(req.required,false,alias); assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B22_CANCELLATION_REASON_ENTITLEMENTS_PASS');

const guidance=G.result({status:'guidance',cluster:'returns_cancellations',section:'cancellations',version:2});
for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias);
assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B22_CANCELLATION_REASON_NO_HIDDEN_REQUESTS_GUIDANCE_ZERO_REQUEST_PASS');

for(const [a,p] of Object.entries({
  returns_company_fbs_info:'/v1/returns/company/fbs/info',
  return_giveout_is_enabled:'/v1/return/giveout/is-enabled',
  return_giveout_list:'/v1/return/giveout/list',
  return_giveout_info:'/v1/return/giveout/info',
  cancel_reason_list:'/v1/cancel-reason/list',
  product_certificate_info:'/v1/product/certificate/info',
  pricing_strategy_competitors:'/v1/pricing-strategy/competitors/list',
  review_comment_list:'/v1/review/comment/list',
  seller_delivery_method_list:'/v2/delivery-method/list',
  supply_order_list:'/v3/supply-order/list'
})) assert.equal(R.OPERATIONS[a]?.path,p,a);
assert.equal(C.ANALYTICS_MIN_INTERVAL_MS ?? 60000,60000);
console.log('B22_B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

const protectedHashes={
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
  'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'
};
for(const [p,h] of Object.entries(protectedHashes)) assert.equal(sha(p),h,p);
console.log('B22_CANCELLATION_REASON_PROTECTED_RUNTIME_IDENTITIES_PASS');

if(swaggerPath){
  const sw=JSON.parse(fs.readFileSync(swaggerPath,'utf8'));
  assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths||{}).length,463);
  const expected={
    '/v2/posting/fbs/cancel-reason/list':['PostingAPI_GetPostingFbsCancelReasonList','FBS'],
    '/v1/cancel-reason/list-by-order':['CancelReasonListByOrder','CancelReasonAPI'],
    '/v1/cancel-reason/list-by-posting':['CancelReasonAPI_CancelReasonListByPosting','CancelReasonAPI']
  };
  for(const [p,[opid,tag]] of Object.entries(expected)){
    const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(op.operationId,opid,p); assert.notEqual(op.deprecated,true,p); assert((op.tags||[]).includes(tag),p);
  }
  assert.equal(sw.paths['/v2/posting/fbs/cancel-reason/list'].post.requestBody,undefined);
  const orderSchema=sw.components.schemas.v1CancelReasonListByOrderRequest;
  assert.deepEqual(orderSchema.required,['order_number']); assert.equal(orderSchema.properties.order_number.type,'string');
  const postingSchema=sw.components.schemas.v1CancelReasonListByPostingRequest;
  assert.deepEqual(postingSchema.required,['posting_number']); assert.equal(postingSchema.properties.posting_number.type,'string');
  const snap=E.compileSnapshot(sw);
  assert.equal(snap.unresolved_rule_count,12);
  for(const p of Object.keys(expected)){
    const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);
  }
  console.log('B22_CANCELLATION_REASON_EXACT_SWAGGER_CURRENTNESS_PASS');
  console.log('B22_CANCELLATION_REASON_EXACT_ENTITLEMENTS_PASS');
}

let jsCount=0;
for(const p of fs.readdirSync(root,{recursive:true})) if(typeof p==='string'&&p.endsWith('.js')) jsCount++;
console.log(`B22_SYNTAX_DECLARED_JS=${jsCount}`);
