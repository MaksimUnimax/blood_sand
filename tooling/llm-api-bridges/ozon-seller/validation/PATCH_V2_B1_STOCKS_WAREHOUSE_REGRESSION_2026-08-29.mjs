import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || '.');
const swaggerPath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const load = (rel) => import(pathToFileURL(path.join(root, rel)).href + `?v2b1=${Date.now()}-${Math.random()}`);
for (const rel of ['shared/runtime_names.js','shared/ozon_operation_registry.js','shared/ozon_entitlements.js','shared/ozon_contract.js','shared/ozon_guidance.js']) await load(rel);
const R=globalThis.OzonOperationRegistry, E=globalThis.OzonEntitlements, C=globalThis.OzonContract, G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const sha=(rel)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');

const ops = {
  stocks_current:['POST','/v4/product/info/stocks','stocks_inventory','current_aggregate','json_body'],
  warehouse_fbs_create_dropoff_list:['POST','/v1/warehouse/fbs/create/drop-off/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_update_dropoff_list:['POST','/v1/warehouse/fbs/update/drop-off/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_create_dropoff_timeslot_list:['POST','/v1/warehouse/fbs/create/drop-off/timeslot/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_update_dropoff_timeslot_list:['POST','/v1/warehouse/fbs/update/drop-off/timeslot/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_create_pickup_timeslot_list:['POST','/v1/warehouse/fbs/create/pick-up/timeslot/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_update_pickup_timeslot_list:['POST','/v1/warehouse/fbs/update/pick-up/timeslot/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_create_return_point_list:['POST','/v1/warehouse/fbs/create/return-point/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_update_return_point_list:['POST','/v1/warehouse/fbs/update/return-point/list','warehouse_logistics','seller_warehouses','json_body'],
  warehouse_fbs_pickup_history_list:['POST','/v1/warehouse/fbs/pickup/history/list','warehouse_logistics','seller_warehouses','json_body'],
  delivery_polygon_list:['POST','/v1/polygon/list','warehouse_logistics','delivery_methods','json_body'],
  warehouse_fbs_pickup_planning_list:['POST','/v1/warehouse/fbs/pickup/planning/list','warehouse_logistics','seller_warehouses','no_body'],
  fbp_warehouse_list:['POST','/v1/fbp/warehouse/list','warehouse_logistics','ozon_warehouses','no_body'],
  seller_warehouse_list:['POST','/v2/warehouse/list','warehouse_logistics','seller_warehouses','json_body'],
  seller_delivery_method_list:['POST','/v2/delivery-method/list','warehouse_logistics','delivery_methods','json_body'],
  delivery_method_return_settings:['POST','/v1/delivery-method/return/settings/get','warehouse_logistics','delivery_methods','json_body'],
  warehouse_invalid_products:['POST','/v1/warehouse/invalid-products/get','warehouse_logistics','warehouse_diagnostics','json_body'],
  warehouses_with_invalid_products:['POST','/v1/warehouse/warehouses-with-invalid-products','warehouse_logistics','warehouse_diagnostics','no_body'],
  ozon_warehouse_list:['POST','/v1/warehouse/ozon/list','warehouse_logistics','ozon_warehouses','json_body'],
  fbo_seller_warehouse_list:['POST','/v1/warehouse/fbo/seller/list','warehouse_logistics','seller_warehouses','no_body'],
  cluster_list:['POST','/v2/cluster/list','warehouse_logistics','clusters','no_body'],
  fbs_stock_by_warehouse:['POST','/v2/product/info/stocks-by-warehouse/fbs','stocks_inventory','warehouse_fbs','json_body'],
  fbo_stock_by_warehouse:['POST','/v1/product/info/stocks-by-warehouse/fbo','stocks_inventory','warehouse_fbo','json_body'],
  stock_analytics:['POST','/v1/analytics/stocks','stocks_inventory','stock_analytics','json_body'],
  stock_turnover_analytics:['POST','/v1/analytics/turnover/stocks','stocks_inventory','stock_movement_turnover','json_body'],
  warehouse_fbs_return_mile_check:['POST','/v1/warehouse/fbs/return-mile/check','warehouse_logistics','warehouse_diagnostics','json_body'],
  warehouse_fbs_return_mile_info:['POST','/v1/warehouse/fbs/return-mile/info','warehouse_logistics','warehouse_diagnostics','json_body'],
  warehouse_operation_status:['POST','/v1/warehouse/operation/status','warehouse_logistics','warehouse_diagnostics','json_body'],
  supplier_available_warehouses:['GET','/v1/supplier/available_warehouses','warehouse_logistics','ozon_warehouses','query'],
  product_fbs_warehouse_stocks:['POST','/v1/product/info/warehouse/stocks','stocks_inventory','warehouse_fbs','json_body']
};

assert.equal(Object.keys(R.OPERATIONS).length,42);
assert.equal(Object.keys(C.OPERATIONS).length,42);
assert.equal(Object.keys(ops).length,30);
assert.equal(Object.values(R.OPERATIONS).filter(x=>x.cluster==='stocks_inventory').length,6);
assert.equal(Object.values(R.OPERATIONS).filter(x=>x.cluster==='warehouse_logistics').length,24);
assert.deepEqual(Object.keys(R.CLUSTERS.warehouse_logistics.sections),['clusters','ozon_warehouses','seller_warehouses','delivery_methods','warehouse_diagnostics']);
for(const [alias,[method,p,cluster,section,style]] of Object.entries(ops)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  for(const [k,v] of Object.entries({provider:'seller_api',method,path:p,effect:'READ',request_style:style,execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster,section,guidance_visibility:'user',entitlement_key:`${method} ${p}`,workflow_role:'single_read'})) assert.deepEqual(m[k],v,`${alias}.${k}`);
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
assert.equal(R.OPERATIONS.stock_on_warehouses_v2,undefined);
assert.equal(R.OPERATIONS.seller_health,undefined);
console.log('V2_B1_REGISTRY_TAXONOMY_PASS');

for(const [alias,[method,p,,,style]] of Object.entries(ops)){
  const command=C.normalizeCommand(R.OPERATIONS[alias].template);
  const req=C.buildRequest(command,{});
  assert(!Array.isArray(req),alias);
  assert.equal(req.method,method,alias);
  assert.equal(req.path,p,alias);
  assert.equal(req.url.startsWith(`https://api-seller.ozon.ru${p}`),true,alias);
  if(style==='no_body' || method==='GET') assert.equal(req.body,undefined,alias);
  if(style==='json_body') assert.equal(typeof req.body,'string',alias);
  const injected=structuredClone(R.OPERATIONS[alias].template.params||{}); injected.url='https://evil.example';
  assert.throws(()=>C.normalizeCommand({operation:alias,params:injected}),e=>e?.code==='TRANSPORT_INJECTION_REJECTED',alias);
}
console.log('V2_B1_EXACT_REQUESTS_PASS');

const ok=(operation,params)=>C.normalizeCommand({operation,params});
const bad=(operation,params,code='INVALID_OPERATION_PARAMS')=>assert.throws(()=>C.normalizeCommand({operation,params}),e=>e?.code===code,`${operation} ${code}`);
bad('fbs_stock_by_warehouse',{limit:100});
bad('fbs_stock_by_warehouse',{limit:100,sku:['1'],offer_id:['x']});
ok('fbs_stock_by_warehouse',{limit:100,sku:['1']});
ok('fbs_stock_by_warehouse',{limit:100,offer_id:['x']});
ok('fbo_stock_by_warehouse',{limit:100});
ok('seller_warehouse_list',{limit:200,warehouse_ids:Array.from({length:201},(_,i)=>String(i+1))});
ok('fbo_stock_by_warehouse',{limit:100,skus:Array.from({length:1001},(_,i)=>String(i+1))});
ok('stock_analytics',{skus:Array.from({length:101},(_,i)=>String(i+1))});
ok('warehouse_fbs_return_mile_info',{warehouse_ids:Array.from({length:1001},(_,i)=>String(i+1))});
bad('fbs_stock_by_warehouse',{limit:1001,sku:['1']},'OZON_LIMIT_VIOLATION');
console.log('V2_B1_NO_INVENTED_ARRAY_LIMITS_PASS');

const stockCmd=C.normalizeCommand(R.OPERATIONS.seller_warehouse_list.template);
let clean=C.sanitizeResult(stockCmd,{warehouses:[{address_info:{address:'Operational warehouse'},phone:'+79990000000',email:'secret@example.test',customer_name:'Buyer'}],address:'customer address'});
assert.equal(clean.warehouses[0].address_info.address,'Operational warehouse');
assert.equal(clean.warehouses[0].phone,'[REDACTED]'); assert.equal(clean.warehouses[0].email,'[REDACTED]'); assert.equal(clean.warehouses[0].customer_name,'[REDACTED]'); assert.equal(clean.address,'[REDACTED]');
clean=C.sanitizeResult(C.normalizeCommand(R.OPERATIONS.ozon_warehouse_list.template),{warehouses:[{address:'Ozon operational',phone:'+7000'}]}); assert.equal(clean.warehouses[0].address,'Ozon operational'); assert.equal(clean.warehouses[0].phone,'[REDACTED]');
clean=C.sanitizeResult(C.normalizeCommand(R.OPERATIONS.warehouse_fbs_create_dropoff_list.template),{points:[{address:'Dropoff operational',email:'x@y.test'}]}); assert.equal(clean.points[0].address,'Dropoff operational'); assert.equal(clean.points[0].email,'[REDACTED]');
console.log('V2_B1_SAFE_PROJECTION_PASS');

for(const [cluster,count] of [['stocks_inventory',6],['warehouse_logistics',24]]){
  const g=G.result({status:'guidance',cluster,version:2});
  assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
  assert(g.choices.length>0,cluster);
  const sectionCounts=Object.values(R.OPERATIONS).filter(x=>x.cluster===cluster).reduce((a,x)=>(a[x.section]=(a[x.section]||0)+1,a),{});
  assert.equal(Object.values(sectionCounts).reduce((a,b)=>a+b,0),count);
}
console.log('V2_B1_GUIDANCE_ZERO_REQUEST_PASS');

const worker=fs.readFileSync(path.join(root,'service_worker.js'),'utf8');
assert.equal(sha('service_worker.js'),'a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3');
assert(worker.includes('const ANALYTICS_QUOTA_FAMILY = "seller.analytics_data.v1";'));
assert(worker.includes('const STOCK_TURNOVER_QUOTA_FAMILY = "seller.analytics_turnover_stocks.v1";'));
assert(worker.includes('const ANALYTICS_MIN_INTERVAL_MS = 60_000;'));
assert(worker.includes('const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;'));
assert(worker.includes("normalized.operation === \"stock_turnover_analytics\" ? STOCK_TURNOVER_QUOTA_FAMILY : null"));
assert(worker.includes('families[familyKey]'));
assert(worker.includes('familyKey = String(quotaPermit.family || ANALYTICS_QUOTA_FAMILY)'));
assert(worker.includes('automatic_retry: false'));
console.log('V2_B1_TURNOVER_QUOTA_FAMILY_PASS');

const protectedHashes={
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'popup.js':'9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
  'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508',
  'shared/runtime_names.js':'a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59'
};
for(const [f,h] of Object.entries(protectedHashes)) assert.equal(sha(f),h,f);
console.log('V2_B1_PROTECTED_RUNTIME_CARRY_FORWARD_PASS');

for(const alias of Object.keys(ops)){
  const meta=R.OPERATIONS[alias];
  assert.equal(meta.workflow_role,'single_read');
}
console.log('V2_B1_NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING_PASS');

if(swaggerPath && fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath);
  assert.equal(bytes.length,3933043);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
  for(const [alias,[method,p]] of Object.entries(ops)){
    const op=sw.paths?.[p]?.[method.toLowerCase()]; assert(op,`${method} ${p}`); assert.notEqual(op.deprecated,true,alias);
    const text=`${op.summary||''}\n${op.description||''}`.toLowerCase();
    assert(!text.includes('метод устаревает и будет отключён'),alias);
    assert(!text.includes('метод будет отключён'),alias);
  }
  const turnover=(sw.paths['/v1/analytics/turnover/stocks'].post.description||'').toLowerCase(); assert(turnover.includes('не больше 1 запроса в минуту'));
  const future=(sw.paths['/v2/analytics/stock_on_warehouses'].post.description||'').toLowerCase(); assert(future.includes('будет отключён')); assert(future.includes('/v1/analytics/stocks'));
  const replacements={
    '/v1/warehouse/list':'/v2/warehouse/list',
    '/v1/delivery-method/list':'/v2/delivery-method/list',
    '/v1/product/info/stocks-by-warehouse/fbs':'/v2/product/info/stocks-by-warehouse/fbs'
  };
  for(const [p,replacement] of Object.entries(replacements)){const t=(sw.paths[p].post.description||'').toLowerCase(); assert(t.includes('отключён')); assert(t.includes(replacement));}
  const report=(sw.paths['/v1/report/warehouse/stock'].post.description||'').toLowerCase(); assert(report.includes('уникальный идентификатор')); assert(report.includes('/v1/report/info')); assert(!Object.values(R.OPERATIONS).some(x=>x.path==='/v1/report/warehouse/stock'));
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-29T00:00:00.000Z'});
  assert.equal(snap.source.operation_count,463); assert.equal(snap.unresolved_rule_count,0);
  for(const [alias,[method,p]] of Object.entries(ops)){const rule=snap.operations[`${method} ${p}`]; assert(rule,alias); assert.equal(rule.default_access,'ALL_ACCOUNTS',alias); assert.equal(rule.endpoint_allowed_subscription_types,null,alias);}
  console.log('V2_B1_CURRENTNESS_REPLACEMENTS_PASS');
  console.log('V2_B1_EXACT_SWAGGER_ENTITLEMENTS_PASS');
}

console.log('V2_B1_AUTHOR_CI_GATE_PASS');
