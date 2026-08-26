import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/tmp/ozon-b11-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href+`?b11=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const ops={
  product_content_rating:['POST','/v1/product/rating-by-sku','json_body','limits_diagnostics'],
  product_info_description:['POST','/v1/product/info/description','json_body','description_content'],
  product_upload_quota:['POST','/v4/product/info/limit','no_body','limits_diagnostics'],
  product_subscription_count:['POST','/v1/product/info/subscription','json_body','product_list_info'],
  product_related_sku:['POST','/v1/product/related-sku/get','json_body','product_list_info'],
  product_pictures_info:['POST','/v2/product/pictures/info','json_body','pictures'],
  product_wrong_volume:['POST','/v1/product/info/wrong-volume','json_body','limits_diagnostics'],
  product_discounted_info:['POST','/v1/product/info/discounted','json_body','product_list_info']
};
for(const [alias,[method,p,style,section]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true);
  assert.equal(m.currentness,'current'); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection');
  assert.equal(m.cluster,'catalog_products'); assert.equal(m.section,section); assert.equal(m.guidance_visibility,'user');
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B11_CATALOG_DIAGNOSTICS_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('product_content_rating',{skus:['1','9223372036854775807']});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/rating-by-sku'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params); assert(!Array.isArray(req));
[cmd,req]=build('product_info_description',{offer_id:'OFFER-1'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/info/description'); assert.deepEqual(JSON.parse(req.body),{offer_id:'OFFER-1'});
[cmd,req]=build('product_info_description',{product_id:123}); assert.deepEqual(JSON.parse(req.body),{product_id:123});
[cmd,req]=build('product_upload_quota',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v4/product/info/limit'); assert.equal(req.body,undefined);
[cmd,req]=build('product_subscription_count',{skus:['1']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/info/subscription'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('product_related_sku',{sku:['1','2']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/related-sku/get'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('product_pictures_info',{product_id:['1','2']}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/product/pictures/info'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('product_wrong_volume',{cursor:'CURSOR',limit:1000}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/info/wrong-volume'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('product_discounted_info',{discounted_skus:['1']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/info/discounted'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B11_CATALOG_DIAGNOSTICS_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'product_content_rating',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_content_rating',params:{skus:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_content_rating',params:{skus:['9223372036854775808']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_content_rating',params:{skus:['1'],url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'product_info_description',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_info_description',params:{offer_id:'x',product_id:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_info_description',params:{product_id:'1'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_info_description',params:{product_id:Number.MAX_SAFE_INTEGER+1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_upload_quota',params:{x:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_subscription_count',params:{skus:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_related_sku',params:{sku:Array(201).fill('1')}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_related_sku',params:{sku:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_pictures_info',params:{product_id:Array(1001).fill('1')}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_pictures_info',params:{product_id:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_wrong_volume',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'product_wrong_volume',params:{limit:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_wrong_volume',params:{limit:1001}},'OZON_LIMIT_VIOLATION');
rejects({operation:'product_wrong_volume',params:{limit:1,extra:true}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'product_discounted_info',params:{discounted_skus:[1]}},'INVALID_OPERATION_PARAMS');
console.log('B11_CATALOG_DIAGNOSTICS_CONTRACTS_PASS');

for(const alias of Object.keys(ops)){
  const command=C.normalizeCommand(R.OPERATIONS[alias].template);
  const requirement=E.requirementFor(command);
  assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias);
  const plan=C.planCommandForSellerCapability(command,null);
  assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
}
console.log('B11_CATALOG_DIAGNOSTICS_ENTITLEMENTS_PASS');

const picCmd=C.normalizeCommand({operation:'product_pictures_info',params:{product_id:['1']}});
const picResult=C.sanitizeResult(picCmd,{items:[{product_id:1,primary_photo:['https://cdn.example/a.jpg'],photo:['https://cdn.example/b.jpg'],errors:[{url:'https://cdn.example/bad.jpg'}]}]});
assert.equal(picResult.items[0].primary_photo[0],'https://cdn.example/a.jpg');
assert.equal(picResult.items[0].photo[0],'https://cdn.example/b.jpg');
assert.equal(picResult.items[0].errors[0].url,'https://cdn.example/bad.jpg');
assert.equal(R.OPERATIONS.product_pictures_info.workflow_role,'single_read');
assert.equal(R.OPERATIONS.product_wrong_volume.workflow_role,'single_read');
console.log('B11_CATALOG_MEDIA_URL_NO_FETCH_AND_NO_AUTOPAGINATION_PASS');

for(const [alias,p] of Object.entries({
 seller_rating_summary:'/v1/rating/summary',seller_rating_history:'/v1/rating/history',seller_fbs_error_index:'/v1/rating/index/fbs/info',seller_fbs_error_postings:'/v1/rating/index/fbs/posting/list',
 review_list:'/v2/review/list',review_info:'/v2/review/info',question_list:'/v1/question/list',
 supply_order_list:'/v3/supply-order/list',supply_order_get:'/v3/supply-order/get',supply_order_timeslot_list:'/v2/supply-order/timeslot/list'
})) { assert.equal(R.OPERATIONS[alias].path,p,alias); assert.equal(R.OPERATIONS[alias].execution_enabled,true,alias); }
let q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template)); assert.equal(q.known,false); assert.equal(q.required,false);
q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template)); assert.equal(q.known,true); assert.equal(q.required,true); assert.deepEqual(q.allowed_subscription_types,['PREMIUM_PLUS']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']);
assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');

for(const [section,aliases] of Object.entries({
  limits_diagnostics:['product_content_rating','product_upload_quota','product_wrong_volume'],
  description_content:['product_info_description'],
  product_list_info:['product_subscription_count','product_related_sku','product_discounted_info'],
  pictures:['product_pictures_info']
})){
  const g=G.result({status:'guidance',cluster:'catalog_products',section,version:2});
  for(const alias of aliases) assert(g.choices.some(x=>x.operation===alias),`${section}:${alias}`);
  assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
}
console.log('B11_CATALOG_DIAGNOSTICS_GUIDANCE_ZERO_REQUEST_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
  const expected={
    '/v1/product/rating-by-sku':'ProductAPI_GetProductRatingBySku',
    '/v1/product/info/description':'ProductAPI_GetProductInfoDescription',
    '/v4/product/info/limit':'ProductAPI_GetUploadQuota',
    '/v1/product/info/subscription':'ProductAPI_GetProductInfoSubscription',
    '/v1/product/related-sku/get':'ProductAPI_ProductGetRelatedSKU',
    '/v2/product/pictures/info':'ProductAPI_ProductInfoPicturesV2',
    '/v1/product/info/wrong-volume':'ProductAPI_ProductInfoWrongVolume',
    '/v1/product/info/discounted':'ProductAPI_GetProductInfoDiscounted'
  };
  for(const [p,id] of Object.entries(expected)){const op=sw.paths?.[p]?.post; assert(op,p); assert.notEqual(op.deprecated,true,p); assert.equal(op.operationId,id,p);}
  const rating=sw.components.schemas.v1GetProductRatingBySkuRequest; assert.deepEqual(rating.required,['skus']); assert.equal(rating.properties.skus.items.type,'string'); assert.equal(rating.properties.skus.items.format,'int64');
  const desc=sw.components.schemas.productGetProductInfoDescriptionRequest; assert.equal(desc.oneOf.length,2); assert.deepEqual(desc.oneOf.map(x=>x.required?.[0]).sort(),['offer_id','product_id']); assert.equal(desc.properties.product_id.type,'integer'); assert.equal(desc.properties.product_id.format,'int64');
  assert.equal(sw.paths['/v4/product/info/limit'].post.requestBody,undefined);
  const subs=sw.components.schemas.v1GetProductInfoSubscriptionRequest; assert.deepEqual(subs.required,['skus']); assert.equal(subs.properties.skus.items.type,'string'); assert.equal(subs.properties.skus.items.format,'int64');
  const related=sw.paths['/v1/product/related-sku/get'].post; assert.match(related.description,/до 200 SKU/i); const relatedSchema=sw.components.schemas.v1ProductGetRelatedSKURequest; assert.deepEqual(relatedSchema.required,['sku']); assert.equal(relatedSchema.properties.sku.items.type,'string'); assert.equal(relatedSchema.properties.sku.items.format,'int64');
  const pics=sw.components.schemas.v2ProductInfoPicturesRequest; assert.deepEqual(pics.required,['product_id']); assert.equal(pics.properties.product_id.maxItems,1000); assert.equal(pics.properties.product_id.items.type,'string'); assert.equal(pics.properties.product_id.items.format,'int64');
  const wrong=sw.components.schemas.v1ProductInfoWrongVolumeRequest; assert.deepEqual(wrong.required,['limit']); assert.equal(wrong.properties.limit.minimum,1); assert.equal(wrong.properties.limit.maximum,1000);
  const discounted=sw.components.schemas.v1GetProductInfoDiscountedRequest; assert.deepEqual(discounted.required,['discounted_skus']); assert.equal(discounted.properties.discounted_skus.items.type,'string'); assert.equal(discounted.properties.discounted_skus.items.format,'int64');
  const picItem=sw.components.schemas.v2ProductInfoPicturesResponseItem; assert.equal(picItem.properties.primary_photo.items.type,'string'); assert.equal(picItem.properties.photo.items.type,'string'); assert.equal(picItem.properties.color_photo.items.type,'string');
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-26T00:00:00.000Z'}); assert.equal(snap.unresolved_rule_count,12);
  for(const p of Object.keys(expected)){const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);}
  console.log('B11_CATALOG_DIAGNOSTICS_EXACT_SWAGGER_PASS');
  console.log('B11_CATALOG_DIAGNOSTICS_EXACT_ENTITLEMENTS_PASS');
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
console.log('B11_CATALOG_DIAGNOSTICS_PROTECTED_RUNTIME_IDENTITIES_PASS');
