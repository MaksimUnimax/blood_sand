import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || '/tmp/ozon-b19-exact');
const swaggerPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const load = async (n) => import(pathToFileURL(path.join(root, 'shared', n)).href + `?b19=${Date.now()}-${n}`);
for (const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R = globalThis.OzonOperationRegistry, E = globalThis.OzonEntitlements, C = globalThis.OzonContract, G = globalThis.OzonGuidance;
assert(R && E && C && G);
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const ops = {
  brand_company_certification_list: ['POST','/v1/brand/company-certification/list','json_body'],
  product_certificate_product_status_list: ['POST','/v1/product/certificate/product_status/list','no_body'],
  product_certificate_rejection_reasons: ['POST','/v1/product/certificate/rejection_reasons/list','no_body'],
  product_certificate_status_list: ['POST','/v1/product/certificate/status/list','no_body'],
  product_certificate_types: ['GET','/v1/product/certificate/types','query'],
  product_certificate_accordance_types: ['GET','/v2/product/certificate/accordance-types/list','query'],
  product_certification_categories: ['POST','/v2/product/certification/list','json_body']
};

for (const [alias,[method,p,style]] of Object.entries(ops)) {
  const m=R.OPERATIONS[alias]; assert(m,alias);
  const expected={provider:'seller_api',method,path:p,effect:'READ',request_style:style,execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'catalog_products',section:'certification',workflow_role:'single_read',guidance_visibility:'user',entitlement_key:`${method} ${p}`};
  for (const [k,v] of Object.entries(expected)) assert.deepEqual(m[k],v,`${alias}.${k}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
for (const p of ['/v1/product/certificate/bind','/v1/product/certificate/create','/v2/product/certificate/create','/v1/product/certificate/delete','/v1/product/certificate/unbind']) assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path===p&&x?.execution_enabled),false,p);
assert.equal(Object.values(R.OPERATIONS).some(x=>x?.path==='/v1/product/certification/list'&&x?.execution_enabled),false,'legacy certification list must stay disabled');
console.log('B19_CATALOG_CERTIFICATION_REGISTRY_PASS');

const build=(operation,params)=>{const c=C.normalizeCommand({operation,params}); return [c,C.buildRequest(c,{})];};
const rejects=(o,p,code)=>assert.throws(()=>C.normalizeCommand({operation:o,params:p}),e=>e?.code===code,`${o}:${code}`);
let c,r;
[c,r]=build('brand_company_certification_list',{page:1,page_size:100}); assert.equal(r.method,'POST'); assert.equal(r.url,'https://api-seller.ozon.ru/v1/brand/company-certification/list'); assert.deepEqual(JSON.parse(r.body),c.params);
for(const a of ['product_certificate_product_status_list','product_certificate_rejection_reasons','product_certificate_status_list']){[c,r]=build(a,{});assert.equal(r.method,'POST');assert.equal(r.body,undefined);assert.equal(r.url,'https://api-seller.ozon.ru'+R.OPERATIONS[a].path);}
for(const a of ['product_certificate_types','product_certificate_accordance_types']){[c,r]=build(a,{});assert.equal(r.method,'GET');assert.equal(r.body,undefined);assert.equal(r.url,'https://api-seller.ozon.ru'+R.OPERATIONS[a].path);}
[c,r]=build('product_certification_categories',{page:1,page_size:1000}); assert.equal(r.method,'POST'); assert.equal(r.url,'https://api-seller.ozon.ru/v2/product/certification/list'); assert.deepEqual(JSON.parse(r.body),c.params);
console.log('B19_CATALOG_CERTIFICATION_EXACT_REQUEST_PASS');

rejects('brand_company_certification_list',{},'INVALID_OPERATION_PARAMS');
rejects('brand_company_certification_list',{page:1},'INVALID_OPERATION_PARAMS');
rejects('brand_company_certification_list',{page:'1',page_size:10},'INVALID_OPERATION_PARAMS');
rejects('brand_company_certification_list',{page:2147483648,page_size:10},'INVALID_OPERATION_PARAMS');
rejects('brand_company_certification_list',{page:1,page_size:2147483648},'INVALID_OPERATION_PARAMS');
build('brand_company_certification_list',{page:0,page_size:0});
build('brand_company_certification_list',{page:-1,page_size:-1});
rejects('brand_company_certification_list',{page:1,page_size:10,url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED');
rejects('product_certification_categories',{},'INVALID_OPERATION_PARAMS');
rejects('product_certification_categories',{page:1},'INVALID_OPERATION_PARAMS');
rejects('product_certification_categories',{page:'1',page_size:10},'INVALID_OPERATION_PARAMS');
rejects('product_certification_categories',{page:1,page_size:0},'OZON_LIMIT_VIOLATION');
rejects('product_certification_categories',{page:1,page_size:1001},'OZON_LIMIT_VIOLATION');
rejects('product_certification_categories',{page:Number.MAX_SAFE_INTEGER+1,page_size:10},'INVALID_OPERATION_PARAMS');
build('product_certification_categories',{page:0,page_size:1});
build('product_certification_categories',{page:-1,page_size:1});
for(const a of ['product_certificate_product_status_list','product_certificate_rejection_reasons','product_certificate_status_list','product_certificate_types','product_certificate_accordance_types']) rejects(a,{extra:true},'INVALID_OPERATION_PARAMS');
console.log('B19_CATALOG_CERTIFICATION_CONTRACTS_PASS');

for (const alias of Object.keys(ops)) {
  const cmd=C.normalizeCommand(R.OPERATIONS[alias].template); const req=E.requirementFor(cmd); const plan=C.planCommandForSellerCapability(cmd,null);
  assert.equal(req.known,true,alias); assert.equal(req.required,false,alias); assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B19_CATALOG_CERTIFICATION_ENTITLEMENTS_PASS');

const guidance=G.result({status:'guidance',cluster:'catalog_products',section:'certification',version:2});
for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias);
assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B19_CATALOG_CERTIFICATION_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS');

for(const [a,p] of Object.entries({pricing_strategy_competitors:'/v1/pricing-strategy/competitors/list',pricing_strategy_ids_by_product_ids:'/v1/pricing-strategy/strategy-ids-by-product-ids',review_comment_list:'/v1/review/comment/list',question_info:'/v1/question/info',seller_delivery_method_list:'/v2/delivery-method/list',description_category_tree:'/v1/description-category/tree',ozon_actions_list:'/v1/actions',product_content_rating:'/v1/product/rating-by-sku',seller_rating_summary:'/v1/rating/summary',review_list:'/v2/review/list',question_list:'/v1/question/list',supply_order_list:'/v3/supply-order/list'})){assert.equal(R.OPERATIONS[a].path,p,a);assert.equal(R.OPERATIONS[a].execution_enabled,true,a);}
let q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_comment_list.template));assert.equal(q.known,false);assert.equal(q.required,false);
q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_info.template));assert.deepEqual(q.allowed_subscription_types,['PREMIUM_PLUS']);
assert.deepEqual(E.subscriptionTypesFromText('https://seller.ozon.ru/app/premium-program'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('https://seller.ozon.ru/app/podpiska-premium-pro'),['PREMIUM_PRO']);
const swText=fs.readFileSync(path.join(root,'service_worker.js'),'utf8'); assert.match(swText,/ANALYTICS_MIN_INTERVAL_MS\s*=\s*60_000/); assert.match(swText,/ANALYTICS_QUOTA_LAUNCH_SAFETY_MS\s*=\s*5_000/);
console.log('B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

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
console.log('B19_CATALOG_CERTIFICATION_PROTECTED_RUNTIME_IDENTITIES_PASS');

if(swaggerPath){
  const raw=fs.readFileSync(swaggerPath); assert.equal(raw.length,3933043); assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(raw.toString('utf8')); assert.equal(E.validateSwagger(sw).ok,true); assert.equal(Object.keys(sw.paths).length,463);
  const exact={
    'POST /v1/brand/company-certification/list':['BrandAPI_BrandCompanyCertificationList','BrandAPI'],
    'POST /v1/product/certificate/product_status/list':['ProductStatusList','CertificationAPI'],
    'POST /v1/product/certificate/rejection_reasons/list':['RejectionReasonsList','CertificationAPI'],
    'POST /v1/product/certificate/status/list':['CertificateStatusList','CertificationAPI'],
    'GET /v1/product/certificate/types':['ProductAPI_ProductCertificateTypes','CertificationAPI'],
    'GET /v2/product/certificate/accordance-types/list':['CertificateAccordanceTypes','CertificationAPI'],
    'POST /v2/product/certification/list':['ProductAPI_ProductCertificationList','CertificationAPI']
  };
  for(const [key,[id,tag]] of Object.entries(exact)){const [method,...rest]=key.split(' ');const p=rest.join(' ');const op=sw.paths[p]?.[method.toLowerCase()];assert(op,key);assert.equal(op.operationId,id,key);assert(op.tags?.includes(tag),key);assert.notEqual(op.deprecated,true,key);}
  const legacy=sw.paths['/v1/product/certification/list']?.post; assert(legacy); assert.match(legacy.description||'',/14 апреля 2025/); assert.match(legacy.description||'',/\/v2\/product\/certification\/list/);
  const brand=sw.components.schemas.brandBrandCompanyCertificationListRequest; assert.deepEqual(new Set(brand.required),new Set(['page','page_size'])); for(const k of ['page','page_size']){assert.equal(brand.properties[k].type,'integer');assert.equal(brand.properties[k].format,'int32');assert.equal(brand.properties[k].minimum,undefined);assert.equal(brand.properties[k].maximum,undefined);}
  const cats=sw.components.schemas.v2ProductCertificationListRequest; assert.deepEqual(new Set(cats.required),new Set(['page','page_size'])); assert.equal(cats.properties.page.type,'integer');assert.equal(cats.properties.page.format,'int64');assert.equal(cats.properties.page.minimum,undefined); assert.equal(cats.properties.page_size.minimum,1);assert.equal(cats.properties.page_size.maximum,1000);
  for(const p of ['/v1/product/certificate/product_status/list','/v1/product/certificate/rejection_reasons/list','/v1/product/certificate/status/list']) assert.equal(sw.paths[p].post.requestBody,undefined,p);
  for(const p of ['/v1/product/certificate/types','/v2/product/certificate/accordance-types/list']) assert.equal(sw.paths[p].get.requestBody,undefined,p);
  console.log('B19_CATALOG_CERTIFICATION_EXACT_SWAGGER_CURRENTNESS_PASS');
  const compiled=E.compileSnapshot(sw,{capturedAt:'2026-08-27T00:00:00.000Z'}); assert.equal(compiled.unresolved_rule_count,12);
  for(const [alias,[method,p]] of Object.entries(ops)){const rule=compiled.operations[`${method} ${p}`];assert(rule,alias);assert.equal(rule.default_access,'ALL_ACCOUNTS',alias);assert.equal(rule.endpoint_allowed_subscription_types,null,alias);}
  console.log('B19_CATALOG_CERTIFICATION_EXACT_ENTITLEMENTS_PASS');
}
