import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2] || '/mnt/data/b3_candidate';
for (const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href + `?v=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry, E=globalThis.OzonEntitlements, C=globalThis.OzonContract, G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const expected={
 seller_warehouse_list:['POST','/v2/warehouse/list','warehouse_logistics','warehouses','json_body'],
 ozon_warehouse_list:['POST','/v1/warehouse/ozon/list','warehouse_logistics','warehouses','json_body'],
 fbo_seller_warehouse_list:['POST','/v1/warehouse/fbo/seller/list','warehouse_logistics','warehouses','no_body'],
 cluster_list:['POST','/v2/cluster/list','warehouse_logistics','clusters','no_body'],
 fbs_stock_by_warehouse:['POST','/v2/product/info/stocks-by-warehouse/fbs','stocks_inventory','warehouse_fbs','json_body'],
 fbo_stock_by_warehouse:['POST','/v1/product/info/stocks-by-warehouse/fbo','stocks_inventory','warehouse_fbo','json_body'],
 stock_analytics:['POST','/v1/analytics/stocks','stocks_inventory','stock_analytics','json_body']
};
for(const [alias,[method,p,cluster,section,style]] of Object.entries(expected)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.cluster,cluster); assert.equal(m.section,section); assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
 const rule=E.BUNDLED_SNAPSHOT.operations[`${method} ${p}`]; assert(rule); assert.equal(rule.default_access,'ALL_ACCOUNTS'); assert.equal(rule.endpoint_allowed_subscription_types,null);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
assert.equal(R.OPERATIONS.stocks_current.path,'/v4/product/info/stocks');
console.log('B3_WAREHOUSE_STOCK_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params});return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('seller_warehouse_list',{limit:200,cursor:'',warehouse_ids:['1','9223372036854775807']}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/warehouse/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('ozon_warehouse_list',{warehouse_types:['FULL_FILLMENT','CROSS_DOCK']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/warehouse/ozon/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('fbo_seller_warehouse_list',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/warehouse/fbo/seller/list'); assert.equal(req.body,undefined);
[cmd,req]=build('cluster_list',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/cluster/list'); assert.equal(req.body,undefined);
[cmd,req]=build('fbs_stock_by_warehouse',{limit:1000,cursor:'',offer_id:['A'],sku:['1']}); assert.equal(req.url,'https://api-seller.ozon.ru/v2/product/info/stocks-by-warehouse/fbs'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('fbo_stock_by_warehouse',{limit:1000,offer_ids:['A'],skus:['1']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/product/info/stocks-by-warehouse/fbo'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('stock_analytics',{skus:['1'],cluster_ids:['2'],item_tags:['ECONOM'],placement_zone:['SORT'],turnover_grades:['POPULAR'],unmarked_stocks_only:false,warehouse_ids:['3']}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/analytics/stocks'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B3_WAREHOUSE_STOCK_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,JSON.stringify(command));}
rejects({operation:'seller_warehouse_list',params:{limit:201}},'OZON_LIMIT_VIOLATION');
rejects({operation:'seller_warehouse_list',params:{limit:100,warehouse_ids:['9223372036854775808']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'ozon_warehouse_list',params:{warehouse_types:['NOT_REAL']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbo_seller_warehouse_list',params:{anything:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'cluster_list',params:{url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'fbs_stock_by_warehouse',params:{limit:1001}},'OZON_LIMIT_VIOLATION');
rejects({operation:'fbs_stock_by_warehouse',params:{limit:10,sku:[1]}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbo_stock_by_warehouse',params:{limit:10}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbo_stock_by_warehouse',params:{limit:10,skus:['9223372036854775808']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'stock_analytics',params:{skus:['1'],cluster_ids:['2'],macrolocal_cluster_ids:['3']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'stock_analytics',params:{skus:['1'],item_tags:['BAD']}},'INVALID_OPERATION_PARAMS');
rejects({operation:'stock_analytics',params:{skus:['1'],headers:{Authorization:'x'}}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'stock_analytics',params:{skus:['1'],unmarked_stocks_only:'yes'}},'INVALID_OPERATION_PARAMS');
console.log('B3_WAREHOUSE_STOCK_CONTRACT_PASS');

for(const alias of Object.keys(expected)){const r=E.requirementFor(C.normalizeCommand(R.OPERATIONS[alias].template)); assert.equal(r.known,true); assert.equal(r.required,false);}
console.log('B3_WAREHOUSE_STOCK_ENTITLEMENTS_PASS');

let h=G.parseHelp('OZON_HELP_V2\n{"cluster":"warehouse_logistics","section":"warehouses"}'); assert.equal(h.ok,true); let g=G.result({status:'guidance',cluster:'warehouse_logistics',section:'warehouses',version:2}); for(const a of ['seller_warehouse_list','ozon_warehouse_list','fbo_seller_warehouse_list']) assert(g.choices.some(x=>x.operation===a));
h=G.parseHelp('OZON_HELP_V2\n{"cluster":"warehouse_logistics","section":"clusters"}'); assert.equal(h.ok,true); g=G.result({status:'guidance',cluster:'warehouse_logistics',section:'clusters',version:2}); assert(g.choices.some(x=>x.operation==='cluster_list'));
for(const [section,alias] of [['warehouse_fbs','fbs_stock_by_warehouse'],['warehouse_fbo','fbo_stock_by_warehouse'],['stock_analytics','stock_analytics']]){g=G.result({status:'guidance',cluster:'stocks_inventory',section,version:2});assert(g.choices.some(x=>x.operation===alias));assert.equal(g.external_request_executed,false);assert.equal(g.physical_business_request_count,0);}
console.log('B3_WAREHOUSE_STOCK_GUIDANCE_PASS');

let sanitized=C.sanitizeResult({operation:'seller_warehouse_list',params:{limit:1}},{warehouses:[{address_info:{address:'Business warehouse',latitude:1,longitude:2},phone:'123'}]}); assert.equal(sanitized.warehouses[0].address_info.address,'Business warehouse'); assert.equal(sanitized.warehouses[0].phone,'[REDACTED]');
sanitized=C.sanitizeResult({operation:'fbo_seller_warehouse_list',params:{}},{warehouses:[{address:'FBO address',contacts:{phone:'123'}}]}); assert.equal(sanitized.warehouses[0].address,'FBO address'); assert.equal(sanitized.warehouses[0].contacts.phone,'[REDACTED]');
console.log('B3_OPERATIONAL_GEOGRAPHY_SAFE_PROJECTION_PASS');

for(const alias of Object.keys(expected)){const built=C.buildRequest(C.normalizeCommand(R.OPERATIONS[alias].template),{}); assert(!Array.isArray(built));}
console.log('B3_NO_HIDDEN_PAGINATION_FANOUT_PASS');

const protectedRuntime={
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'};
for(const [rel,sha] of Object.entries(protectedRuntime)){const got=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');assert.equal(got,sha,rel);}
console.log('B3_PROTECTED_RUNTIME_IDENTITIES_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath && fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40'); const sw=JSON.parse(bytes);
 for(const [alias,[method,p,,,style]] of Object.entries(expected)){const op=sw.paths?.[p]?.[method.toLowerCase()]; assert(op,`${method} ${p}`); assert.equal(Boolean(op.requestBody),style==='json_body',`${alias} requestBody`);}
 assert.equal(sw.paths['/v1/analytics/stocks'].post.description.includes('17 августа 2026'),true);
 const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-25T00:00:00.000Z'});
 for(const [, [method,p]] of Object.entries(expected)){const rule=snap.operations[`${method} ${p}`];assert(rule);assert.equal(rule.default_access,'ALL_ACCOUNTS');}
 console.log('B3_OFFICIAL_SWAGGER_CONTRACT_PASS');
 console.log('B3_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS');
}
