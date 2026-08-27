import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || '/tmp/ozon-b21-exact');
const swaggerPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const load = async (n) => import(pathToFileURL(path.join(root, 'shared', n)).href + `?b21=${Date.now()}-${n}`);
for (const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');

const ops={
  returns_company_fbs_info:['POST','/v1/returns/company/fbs/info'],
  return_giveout_is_enabled:['POST','/v1/return/giveout/is-enabled'],
  return_giveout_list:['POST','/v1/return/giveout/list'],
  return_giveout_info:['POST','/v1/return/giveout/info']
};
for(const [alias,[method,p]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  const expected={provider:'seller_api',method,path:p,effect:'READ',request_style:'json_body',execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'returns_cancellations',section:'return_giveout',workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`${method} ${p}`};
  for(const [k,v] of Object.entries(expected)) assert.deepEqual(m[k],v,`${alias}.${k}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
for(const p of ['/v1/return/giveout/barcode','/v1/return/giveout/get-pdf','/v1/return/giveout/get-png','/v1/return/giveout/barcode-reset']) {
  assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path===p&&x?.execution_enabled),false,p);
}
console.log('B21_RETURN_GIVEOUT_REGISTRY_PASS');

const build=(operation,params)=>{const c=C.normalizeCommand({operation,params});return[c,C.buildRequest(c,{})];};
const rejects=(o,p,code)=>assert.throws(()=>C.normalizeCommand({operation:o,params:p}),e=>e?.code===code,`${o}:${code}`);
let c,r;
[c,r]=build('returns_company_fbs_info',{filter:{place_id:1},pagination:{last_id:2,limit:500}});
assert.equal(r.method,'POST'); assert.equal(r.url,'https://api-seller.ozon.ru/v1/returns/company/fbs/info'); assert.deepEqual(JSON.parse(r.body),c.params);
[c,r]=build('return_giveout_is_enabled',{}); assert.equal(r.url,'https://api-seller.ozon.ru/v1/return/giveout/is-enabled'); assert.equal(r.body,'{}');
[c,r]=build('return_giveout_list',{last_id:2,limit:100}); assert.equal(r.url,'https://api-seller.ozon.ru/v1/return/giveout/list'); assert.deepEqual(JSON.parse(r.body),c.params);
[c,r]=build('return_giveout_info',{giveout_id:1}); assert.equal(r.url,'https://api-seller.ozon.ru/v1/return/giveout/info'); assert.deepEqual(JSON.parse(r.body),c.params);
console.log('B21_RETURN_GIVEOUT_EXACT_REQUEST_PASS');

rejects('returns_company_fbs_info',{},'INVALID_OPERATION_PARAMS');
rejects('returns_company_fbs_info',{pagination:{}},'INVALID_OPERATION_PARAMS');
rejects('returns_company_fbs_info',{pagination:{limit:501}},'OZON_LIMIT_VIOLATION');
rejects('returns_company_fbs_info',{pagination:{limit:2147483648}},'OZON_LIMIT_VIOLATION');
rejects('returns_company_fbs_info',{pagination:{limit:1,last_id:'2'}},'INVALID_OPERATION_PARAMS');
rejects('returns_company_fbs_info',{filter:{place_id:'1'},pagination:{limit:1}},'INVALID_OPERATION_PARAMS');
rejects('returns_company_fbs_info',{pagination:{limit:1},url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED');
build('returns_company_fbs_info',{pagination:{limit:-1,last_id:-1},filter:{place_id:-1}});

rejects('return_giveout_is_enabled',{x:1},'UNKNOWN_OPERATION_PARAM');

rejects('return_giveout_list',{},'INVALID_OPERATION_PARAMS');
rejects('return_giveout_list',{limit:'1'},'INVALID_OPERATION_PARAMS');
rejects('return_giveout_list',{limit:1,last_id:'2'},'INVALID_OPERATION_PARAMS');
rejects('return_giveout_list',{limit:Number.MAX_SAFE_INTEGER+1},'INVALID_OPERATION_PARAMS');
build('return_giveout_list',{limit:-1,last_id:-1});

rejects('return_giveout_info',{},'INVALID_OPERATION_PARAMS');
rejects('return_giveout_info',{giveout_id:'1'},'INVALID_OPERATION_PARAMS');
rejects('return_giveout_info',{giveout_id:Number.MAX_SAFE_INTEGER+1},'INVALID_OPERATION_PARAMS');
build('return_giveout_info',{giveout_id:-1});
console.log('B21_RETURN_GIVEOUT_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const cmd=C.normalizeCommand(R.OPERATIONS[alias].template), req=E.requirementFor(cmd), plan=C.planCommandForSellerCapability(cmd,null);
  assert.equal(req.known,true,alias); assert.equal(req.required,false,alias); assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B21_RETURN_GIVEOUT_ENTITLEMENTS_PASS');

const guidance=G.result({status:'guidance',cluster:'returns_cancellations',section:'return_giveout',version:2});
for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias);
assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B21_RETURN_GIVEOUT_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS');

for(const [a,p] of Object.entries({
  product_certificate_info:'/v1/product/certificate/info',
  product_certificate_list:'/v1/product/certificate/list',
  product_certificate_products:'/v1/product/certificate/products/list',
  brand_company_certification_list:'/v1/brand/company-certification/list',
  pricing_strategy_competitors:'/v1/pricing-strategy/competitors/list',
  review_comment_list:'/v1/review/comment/list',
  seller_delivery_method_list:'/v2/delivery-method/list',
  supply_order_list:'/v3/supply-order/list'
})) assert.equal(R.OPERATIONS[a]?.path,p,a);
assert.equal(C.ANALYTICS_MIN_INTERVAL_MS ?? 60000,60000);
console.log('B21_B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

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
console.log('B21_RETURN_GIVEOUT_PROTECTED_RUNTIME_IDENTITIES_PASS');

if(swaggerPath){
  const sw=JSON.parse(fs.readFileSync(swaggerPath,'utf8'));
  assert.equal(sw.openapi,'3.0.0');
  assert.equal(Object.keys(sw.paths||{}).length,463);
  const expected={
    '/v1/returns/company/fbs/info':'returnsCompanyFBSInfo',
    '/v1/return/giveout/is-enabled':'ReturnAPI_GiveoutIsEnabled',
    '/v1/return/giveout/list':'ReturnAPI_GiveoutList',
    '/v1/return/giveout/info':'ReturnAPI_GiveoutInfo'
  };
  for(const [p,opid] of Object.entries(expected)){
    const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(op.operationId,opid,p); assert.notEqual(op.deprecated,true,p); assert((op.tags||[]).includes('ReturnAPI'),p);
  }
  const listSchema=sw.components.schemas.v1GiveoutListRequest;
  assert.deepEqual(listSchema.required,['limit']);
  assert.equal(listSchema.properties.limit.minimum,undefined); assert.equal(listSchema.properties.limit.maximum,undefined);
  const pag=sw.components.schemas.ReturnsCompanyFbsInfoRequestPagination;
  assert((pag.required||[]).includes('limit')); assert.equal(pag.properties.limit.maximum,undefined);
  assert((pag.properties.limit.description||'').includes('500'));
  const snap=E.compileSnapshot(sw);
  assert.equal(snap.unresolved_rule_count,12);
  for(const p of Object.keys(expected)){
    const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);
  }
  console.log('B21_RETURN_GIVEOUT_EXACT_SWAGGER_CURRENTNESS_PASS');
  console.log('B21_RETURN_GIVEOUT_EXACT_ENTITLEMENTS_PASS');
}

let jsCount=0;
for(const p of fs.readdirSync(root,{recursive:true})){
  if(typeof p==='string'&&p.endsWith('.js')) jsCount++;
}
console.log(`B21_SYNTAX_DECLARED_JS=${jsCount}`);
