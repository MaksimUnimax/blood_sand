import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2] || '/mnt/data/b1_candidate';
for (const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href + `?v=${Date.now()}-${name}`);
}
const R = globalThis.OzonOperationRegistry;
const E = globalThis.OzonEntitlements;
const C = globalThis.OzonContract;
const G = globalThis.OzonGuidance;
assert(R && E && C && G);

const expected = {
  seller_product_list: ['POST','/v3/product/list','product_list_info'],
  seller_product_info_list: ['POST','/v3/product/info/list','product_list_info'],
  seller_product_attributes: ['POST','/v4/product/info/attributes','attributes_categories']
};
for (const [alias,[method,p,section]] of Object.entries(expected)) {
  const m = R.OPERATIONS[alias];
  assert(m, alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p);
  assert.equal(m.effect,'READ'); assert.equal(m.request_style,'json_body'); assert.equal(m.execution_enabled,true);
  assert.equal(m.cluster,'catalog_products'); assert.equal(m.section,section);
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
  const rule = E.BUNDLED_SNAPSHOT.operations[`${method} ${p}`];
  assert(rule); assert.equal(rule.default_access,'ALL_ACCOUNTS'); assert.deepEqual(rule.feature_rules,[]);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B1_ASSORTMENT_REGISTRY_PASS');

const list = C.normalizeCommand({operation:'seller_product_list',params:{filter:{skus:['1602711278'],visibility:'VISIBLE_WITH_FBO_STOCK'},last_id:'cursor',limit:1000}});
assert.equal(list.params.filter.skus[0],'1602711278');
assert.equal(list.params.filter.visibility,'VISIBLE_WITH_FBO_STOCK');
assert.equal(list.params.last_id,'cursor'); assert.equal(list.params.limit,1000);
let req = C.buildRequest(list, {'Client-Id':'x','Api-Key':'y'});
assert.equal(req.url,'https://api-seller.ozon.ru/v3/product/list'); assert.equal(req.method,'POST');
assert.deepEqual(JSON.parse(req.body),list.params);

const info = C.normalizeCommand({operation:'seller_product_info_list',params:{sku:['1602711278']}});
assert.equal(info.params.sku[0],'1602711278');
req = C.buildRequest(info, {}); assert.equal(req.url,'https://api-seller.ozon.ru/v3/product/info/list');
assert.deepEqual(JSON.parse(req.body),info.params);

const attrs = C.normalizeCommand({operation:'seller_product_attributes',params:{filter:{product_id:['1082848375'],visibility:'AUTO_ARCHIVED'},last_id:'',limit:1000,sort_by:'title',sort_dir:'ASC'}});
assert.equal(attrs.params.sort_dir,'ASC'); // official docs/example inconsistency: preserve exact input
assert.equal(attrs.params.sort_by,'title');
assert.equal(attrs.params.last_id,'');
req = C.buildRequest(attrs, {}); assert.equal(req.url,'https://api-seller.ozon.ru/v4/product/info/attributes');
assert.deepEqual(JSON.parse(req.body),attrs.params);
console.log('B1_ASSORTMENT_EXACT_REQUEST_PASS');

function rejects(command, code) {
  assert.throws(() => C.normalizeCommand(command), (e) => e && e.code === code, JSON.stringify(command));
}
rejects({operation:'seller_product_list',params:{url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'seller_product_list',params:{filter:{product_id:[]}}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_product_list',params:{filter:{offer_id:['a'],product_id:['1']}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_list',params:{filter:{product_id:[1082848375]}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_list',params:{filter:{visibility:'NOT_REAL'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_list',params:{limit:1001}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_product_info_list',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_info_list',params:{offer_id:['a'],sku:['1']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_info_list',params:{sku:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_attributes',params:{filter:{product_id:['9223372036854775808']}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'seller_product_attributes',params:{limit:0}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_product_attributes',params:{headers:{Authorization:'x'}}},'TRANSPORT_INJECTION_REJECTED');
console.log('B1_ASSORTMENT_CONTRACT_PASS');

for (const alias of Object.keys(expected)) {
  const requirement = E.requirementFor(C.normalizeCommand(R.OPERATIONS[alias].template));
  assert.equal(requirement.known,true); assert.equal(requirement.required,false);
}
console.log('B1_ASSORTMENT_ENTITLEMENTS_PASS');

let help = G.parseHelp('OZON_HELP_V2\n{"cluster":"catalog_products","section":"product_list_info"}');
assert.equal(help.ok,true);
let gr = G.result({status:'guidance',cluster:'catalog_products',section:'product_list_info',version:2});
assert.deepEqual(gr.choices.map(x=>x.operation).sort(),['seller_product_info_list','seller_product_list'].sort());
help = G.parseHelp('OZON_HELP_V2\n{"cluster":"catalog_products","section":"attributes_categories"}');
assert.equal(help.ok,true);
gr = G.result({status:'guidance',cluster:'catalog_products',section:'attributes_categories',version:2});
assert(gr.choices.some(x=>x.operation==='seller_product_attributes'));
assert.equal(gr.external_request_executed,false); assert.equal(gr.physical_business_request_count,0);
console.log('B1_ASSORTMENT_GUIDANCE_PASS');

// No automatic pagination/fanout primitive was added: each logical command builds exactly one fixed request.
for (const alias of ['seller_product_list','seller_product_attributes']) {
  const cmd = C.normalizeCommand(R.OPERATIONS[alias].template);
  const built = C.buildRequest(cmd,{});
  assert.equal(typeof built.url,'string'); assert(!Array.isArray(built));
}
console.log('B1_NO_HIDDEN_PAGINATION_FANOUT_PASS');

const protectedB0 = {
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
  'shared/ai_adapters.js':'5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9',
  'shared/conversation_identity.js':'939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57'
};
for (const [rel, expectedSha] of Object.entries(protectedB0)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');
  assert.equal(actual, expectedSha, `protected identity ${rel}`);
}
console.log('B1_PROTECTED_B0_IDENTITIES_PASS');

// Official Swagger compiler must independently classify all three endpoints as ordinary all-account reads.
const swaggerPath = process.argv[3] || '';
if (fs.existsSync(swaggerPath)) {
  const swagger = JSON.parse(fs.readFileSync(swaggerPath,'utf8'));
  const snap = E.compileSnapshot(swagger,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-25T00:00:00.000Z'});
  for (const [, [method,p]] of Object.entries(expected)) {
    const rule=snap.operations[`${method} ${p}`]; assert(rule); assert.equal(rule.default_access,'ALL_ACCOUNTS');
  }
  console.log('B1_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS');
}
