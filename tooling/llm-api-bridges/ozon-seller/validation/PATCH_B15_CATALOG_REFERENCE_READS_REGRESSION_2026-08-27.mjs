import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.argv[2]||'/tmp/ozon-b15-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await import(pathToFileURL(path.join(root,'shared',name)).href+`?b15=${Date.now()}-${name}`);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance; assert(R&&E&&C&&G);
const ops={
 description_category_tree:'/v1/description-category/tree',
 description_category_attributes:'/v1/description-category/attribute',
 description_category_attribute_values:'/v1/description-category/attribute/values',
 description_category_attribute_values_search:'/v1/description-category/attribute/values/search'
};
for(const [alias,p] of Object.entries(ops)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,'POST'); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.request_style,'json_body'); assert.equal(m.execution_enabled,true); assert.equal(m.currentness,'current'); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection'); assert.equal(m.cluster,'catalog_products'); assert.equal(m.section,'attributes_categories'); assert.equal(m.workflow_role,'single_read'); assert.equal(m.guidance_visibility,'user'); assert.equal(m.entitlement_key,`POST ${p}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true); console.log('B15_CATALOG_REFERENCE_REGISTRY_PASS');
function build(operation,params){const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('description_category_tree',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/description-category/tree'); assert.deepEqual(JSON.parse(req.body),{}); assert(!Array.isArray(req));
[cmd,req]=build('description_category_tree',{language:'RU'}); assert.deepEqual(JSON.parse(req.body),{language:'RU'});
[cmd,req]=build('description_category_attributes',{description_category_id:200000933,type_id:93080,language:'DEFAULT'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/description-category/attribute'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('description_category_attribute_values',{attribute_id:85,description_category_id:17054869,language:'DEFAULT',last_value_id:100,limit:2000,type_id:97311}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/description-category/attribute/values'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('description_category_attribute_values_search',{attribute_id:85,description_category_id:17054869,limit:100,type_id:97311,value:'Name'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/description-category/attribute/values/search'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B15_CATALOG_REFERENCE_EXACT_REQUEST_PASS');
function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,`${JSON.stringify(command)} -> ${code}`);}
rejects({operation:'description_category_tree',params:{language:'DE'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'description_category_tree',params:{url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'description_category_attributes',params:{description_category_id:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'description_category_attributes',params:{description_category_id:'1',type_id:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'description_category_attributes',params:{description_category_id:Number.MAX_SAFE_INTEGER+1,type_id:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'description_category_attribute_values',params:{attribute_id:1,description_category_id:1,limit:0,type_id:1}},'OZON_LIMIT_VIOLATION');
rejects({operation:'description_category_attribute_values',params:{attribute_id:1,description_category_id:1,limit:2001,type_id:1}},'OZON_LIMIT_VIOLATION');
rejects({operation:'description_category_attribute_values',params:{attribute_id:1,description_category_id:1,limit:1,type_id:1,last_value_id:'1'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'description_category_attribute_values_search',params:{attribute_id:1,description_category_id:1,limit:0,type_id:1,value:'ab'}},'OZON_LIMIT_VIOLATION');
rejects({operation:'description_category_attribute_values_search',params:{attribute_id:1,description_category_id:1,limit:101,type_id:1,value:'ab'}},'OZON_LIMIT_VIOLATION');
rejects({operation:'description_category_attribute_values_search',params:{attribute_id:1,description_category_id:1,limit:1,type_id:1,value:'x'}},'OZON_LIMIT_VIOLATION');
rejects({operation:'description_category_attribute_values_search',params:{attribute_id:1,description_category_id:1,limit:1,type_id:1,value:'ab',extra:true}},'UNKNOWN_OPERATION_PARAM');
console.log('B15_CATALOG_REFERENCE_CONTRACTS_PASS');
for(const alias of Object.keys(ops)){const command=C.normalizeCommand(R.OPERATIONS[alias].template); const requirement=E.requirementFor(command); assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias); const plan=C.planCommandForSellerCapability(command,null); assert.equal(plan.action,'execute',alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);}
console.log('B15_CATALOG_REFERENCE_ENTITLEMENTS_PASS');
const guidance=G.result({status:'guidance',cluster:'catalog_products',section:'attributes_categories',version:2}); for(const alias of Object.keys(ops)) assert(guidance.choices.some(x=>x.operation===alias),alias); assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
assert.equal(R.OPERATIONS.description_category_attribute_values.workflow_role,'single_read'); assert.equal(R.OPERATIONS.description_category_attribute_values_search.workflow_role,'single_read'); console.log('B15_CATALOG_REFERENCE_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS');
for(const [alias,p] of Object.entries({pricing_strategy_list:'/v1/pricing-strategy/list',pricing_strategy_info:'/v1/pricing-strategy/info',pricing_strategy_products:'/v1/pricing-strategy/products/list',pricing_strategy_product_info:'/v1/pricing-strategy/product/info',ozon_actions_list:'/v1/actions',product_content_rating:'/v1/product/rating-by-sku',seller_rating_summary:'/v1/rating/summary',review_list:'/v2/review/list',supply_order_list:'/v3/supply-order/list'})){assert.equal(R.OPERATIONS[alias].path,p,alias); assert.equal(R.OPERATIONS[alias].execution_enabled,true,alias);}
let q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.review_list.template)); assert.equal(q.known,false); assert.equal(q.required,false); q=E.requirementFor(C.normalizeCommand(R.OPERATIONS.question_list.template)); assert.equal(q.known,true); assert.equal(q.required,true); assert.deepEqual(q.allowed_subscription_types,['PREMIUM_PLUS']); assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium](https://seller-edu.ozon.ru/seller-rating/about-rating/premium-program)'),['PREMIUM']); assert.deepEqual(E.subscriptionTypesFromText('доступно с [Premium Pro](https://seller-edu.ozon.ru/seller-rating/about-rating/podpiska-premium-pro)'),['PREMIUM_PRO']);
console.log('B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS');
const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40'); const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
 const expected={'/v1/description-category/tree':'DescriptionCategoryAPI_GetTree','/v1/description-category/attribute':'DescriptionCategoryAPI_GetAttributes','/v1/description-category/attribute/values':'DescriptionCategoryAPI_GetAttributeValues','/v1/description-category/attribute/values/search':'DescriptionCategoryAPI_SearchAttributeValues'};
 for(const [p,id] of Object.entries(expected)){const op=sw.paths?.[p]?.post; assert(op,p); assert.notEqual(op.deprecated,true,p); assert.equal(op.operationId,id,p); assert.deepEqual(op.tags,['CategoryAPI']);}
 const lang=sw.components.schemas.languageLanguage; assert.deepEqual(lang.enum,['DEFAULT','RU','EN','TR','ZH_HANS']);
 const tree=sw.components.schemas.v1GetTreeRequest; assert.equal(tree.required,undefined); assert(tree.properties.language);
 const attrs=sw.components.schemas.v1GetAttributesRequest; assert.deepEqual(attrs.required,['description_category_id','type_id']); assert.equal(attrs.properties.description_category_id.type,'integer'); assert.equal(attrs.properties.description_category_id.format,'int64'); assert.equal(attrs.properties.type_id.format,'int64');
 const vals=sw.components.schemas.v1GetAttributeValuesRequest; assert.deepEqual(vals.required,['attribute_id','description_category_id','limit','type_id']); assert.match(vals.properties.limit.description,/максимум — 2000/); assert.match(vals.properties.limit.description,/минимум — 1/); assert.equal(vals.properties.last_value_id.format,'int64');
 const search=sw.components.schemas.v1SearchAttributeValuesRequest; assert.deepEqual(search.required,['attribute_id','description_category_id','limit','type_id','value']); assert.match(search.properties.limit.description,/максимум — 100/); assert.match(search.properties.limit.description,/минимум — 1/); assert.match(search.properties.value.description,/Минимум — 2 символа/);
 const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-27T00:00:00.000Z'}); assert.equal(snap.unresolved_rule_count,12); for(const p of Object.keys(expected)){const rule=snap.operations[`POST ${p}`]; assert(rule,p); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); assert.equal(rule.endpoint_allowed_subscription_types,null,p);}
 console.log('B15_CATALOG_REFERENCE_EXACT_SWAGGER_CURRENTNESS_PASS'); console.log('B15_CATALOG_REFERENCE_EXACT_ENTITLEMENTS_PASS');
}
const protectedRuntime={'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508','content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'};
for(const [rel,sha] of Object.entries(protectedRuntime)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),sha,rel);
const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8'); assert.match(worker,/const ANALYTICS_MIN_INTERVAL_MS = 60_000;/); assert.match(worker,/const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;/); console.log('B15_CATALOG_REFERENCE_PROTECTED_RUNTIME_IDENTITIES_PASS');
