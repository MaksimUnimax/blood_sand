import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.argv[2]||'/mnt/data/b4_candidate';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']){
  await import(pathToFileURL(path.join(root,'shared',name)).href+`?v=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const added={
  fbs_posting_list:['POST','/v4/posting/fbs/list','orders_postings','fbs_postings','json_body','PERSONAL_DATA_READ_GATED'],
  fbs_unfulfilled_list:['POST','/v4/posting/fbs/unfulfilled/list','orders_postings','fbs_postings','json_body','PERSONAL_DATA_READ_GATED'],
  returns_list:['POST','/v1/returns/list','returns_cancellations','returns','json_body','READ_SAFE'],
  rfbs_returns_list:['POST','/v2/returns/rfbs/list','returns_cancellations','returns','json_body','PERSONAL_DATA_READ_GATED'],
  cancel_reason_list:['POST','/v1/cancel-reason/list','returns_cancellations','cancellations','no_body','READ_SAFE'],
  order_cancel_status:['POST','/v1/order/cancel/status','returns_cancellations','cancellations','json_body','READ_SAFE'],
  posting_cancel_status:['POST','/v1/posting/cancel/status','returns_cancellations','cancellations','json_body','READ_SAFE']
};
for(const [alias,[method,p,cluster,section,style,safety]] of Object.entries(added)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ');
  assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.cluster,cluster); assert.equal(m.section,section);
  assert.equal(m.safety_class,safety); assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
  if(safety==='PERSONAL_DATA_READ_GATED'){
    assert.equal(m.policy_group,'personal_data_read'); assert.equal(m.default_allowed,false); assert.equal(m.privacy_policy,'operator_personal_data_gate');
  }
  const rule=E.BUNDLED_SNAPSHOT.operations[`${method} ${p}`]; assert(rule); assert.equal(rule.default_access,'ALL_ACCOUNTS');
}
assert.equal(R.OPERATIONS.posting_fbo_list.path,'/v3/posting/fbo/list');
assert.equal(R.OPERATIONS.posting_fbs_get.path,'/v3/posting/fbs/get');
assert.equal(R.OPERATIONS.posting_fbs_get.safety_class,'PERSONAL_DATA_READ_GATED');
assert.equal(R.OPERATIONS.return_report_create,undefined);
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B4_ORDERS_RETURNS_REGISTRY_PASS');

function build(operation,params){const cmd=C.normalizeCommand({operation,params});return [cmd,C.buildRequest(cmd,{})];}
let [cmd,req]=build('posting_fbo_list',{cursor:'',filter:{order_numbers:['1'],posting_numbers:['p'],since:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z',statuses:['delivered']},limit:100,sort_dir:'DESC',translit:false,with:{analytics_data:true,financial_data:false,legal_info:false}});
assert.equal(req.url,'https://api-seller.ozon.ru/v3/posting/fbo/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('fbs_posting_list',{cursor:'',filter:{delivery_method_ids:['1'],integration_type_flow:['ozon'],is_blr_traceable:false,last_changed_status_date:{from:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z'},order_id:1,order_numbers:['x'],provider_ids:['2'],since:'2026-01-01T00:00:00Z',statuses:['awaiting_packaging'],to:'2026-01-02T00:00:00Z',warehouse_ids:['3']},limit:100,sort_dir:'ASC',translit:false,with:{analytics_data:true,barcodes:false,financial_data:false,legal_info:false}});
assert.equal(req.url,'https://api-seller.ozon.ru/v4/posting/fbs/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('fbs_unfulfilled_list',{cursor:'',filter:{cutoff_from:'2026-01-01T00:00:00Z',cutoff_to:'2026-01-02T00:00:00Z',delivery_method_ids:['1'],provider_ids:['2'],statuses:['awaiting_packaging'],warehouse_ids:['3']},limit:100,sort_dir:'ASC',translit:false,with:{analytics_data:true,barcodes:false,financial_data:false,legal_info:false}});
assert.equal(req.url,'https://api-seller.ozon.ru/v4/posting/fbs/unfulfilled/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('posting_fbs_get',{posting_number:'123',with:{analytics_data:true,barcodes:false,financial_data:false,legal_info:false,product_exemplars:false,related_postings:false,translit:false}});
assert.equal(req.url,'https://api-seller.ozon.ru/v3/posting/fbs/get'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('returns_list',{filter:{logistic_return_date:{time_from:'2026-01-01T00:00:00Z',time_to:'2026-01-02T00:00:00Z'},order_id:1,posting_numbers:['p'],product_name:'n',offer_id:'o',visual_status_name:'Approved',warehouse_id:2,barcode:'b',return_schema:'FBS',compensation_status_id:1},limit:500,last_id:1});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/returns/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('rfbs_returns_list',{filter:{offer_id:'o',posting_number:'p',group_state:['New'],created_at:{from:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z'}},last_id:1,limit:100});
assert.equal(req.url,'https://api-seller.ozon.ru/v2/returns/rfbs/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('cancel_reason_list',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/cancel-reason/list'); assert.equal(req.method,'POST'); assert.equal(req.body,undefined);
[cmd,req]=build('order_cancel_status',{order_number:'123'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/order/cancel/status'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('posting_cancel_status',{posting_number:'123'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/posting/cancel/status'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B4_ORDERS_RETURNS_EXACT_REQUEST_PASS');

function rejects(command,code){assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,JSON.stringify(command));}
rejects({operation:'posting_fbo_list',params:{url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'posting_fbo_list',params:{unknown:1}},'UNKNOWN_OPERATION_PARAM');
rejects({operation:'posting_fbo_list',params:{limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'posting_fbo_list',params:{filter:{statuses:['BAD']}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbs_posting_list',params:{limit:10}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbs_posting_list',params:{filter:{since:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z'},limit:101}},'OZON_LIMIT_VIOLATION');
rejects({operation:'fbs_posting_list',params:{filter:{since:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z',order_id:9007199254740992},limit:10}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbs_posting_list',params:{filter:{since:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z',warehouse_ids:[1]},limit:10}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbs_unfulfilled_list',params:{filter:{cutoff_from:'2026-01-01T00:00:00Z',cutoff_to:'2026-01-02T00:00:00Z',delivering_date_from:'2026-01-01T00:00:00Z',delivering_date_to:'2026-01-02T00:00:00Z'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'fbs_unfulfilled_list',params:{filter:{cutoff_from:'2026-01-01T00:00:00Z'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'returns_list',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'returns_list',params:{limit:501}},'OZON_LIMIT_VIOLATION');
rejects({operation:'returns_list',params:{limit:10,filter:{posting_numbers:Array(51).fill('p')}}},'OZON_LIMIT_VIOLATION');
rejects({operation:'returns_list',params:{limit:10,filter:{logistic_return_date:{},visual_status_change_moment:{}}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'returns_list',params:{limit:10,filter:{visual_status_name:'BAD'}}},'INVALID_OPERATION_PARAMS');
rejects({operation:'rfbs_returns_list',params:{filter:{group_state:['BAD']},limit:10}},'INVALID_OPERATION_PARAMS');
rejects({operation:'cancel_reason_list',params:{anything:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'order_cancel_status',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'posting_cancel_status',params:{headers:{Authorization:'x'}}},'TRANSPORT_INJECTION_REJECTED');
console.log('B4_ORDERS_RETURNS_CONTRACT_PASS');

for(const alias of [...Object.keys(added),'posting_fbo_list','posting_fbs_get']){
  const r=E.requirementFor(C.normalizeCommand(R.OPERATIONS[alias].template)); assert.equal(r.known,true); assert.equal(r.required,false,alias);
}
console.log('B4_ORDERS_RETURNS_ENTITLEMENTS_PASS');

let g=G.result({status:'guidance',cluster:'orders_postings',section:'fbs_postings',version:2});
for(const a of ['fbs_posting_list','fbs_unfulfilled_list','posting_fbs_get']){const card=g.choices.find(x=>x.operation===a); assert(card,a); assert.equal(card.personal_data_setting_required_when_off,true);}
g=G.result({status:'guidance',cluster:'returns_cancellations',section:'returns',version:2});
assert(g.choices.some(x=>x.operation==='returns_list')); const rfbs=g.choices.find(x=>x.operation==='rfbs_returns_list'); assert(rfbs); assert.equal(rfbs.personal_data_setting_required_when_off,true);
g=G.result({status:'guidance',cluster:'returns_cancellations',section:'cancellations',version:2});
for(const a of ['cancel_reason_list','order_cancel_status','posting_cancel_status']) assert(g.choices.some(x=>x.operation===a));
assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
console.log('B4_ORDERS_RETURNS_GUIDANCE_PASS');

let sanitized=C.sanitizeResult({operation:'returns_list',params:{limit:1}},{returns:[{place:{address:'operational?'},product:{name:'Product'}}]});
assert.equal(sanitized.returns[0].place.address,'[REDACTED]'); assert.equal(sanitized.returns[0].product.name,'Product');
const personal=C.sanitizeResult({operation:'rfbs_returns_list',params:{limit:1}},{returns:{client_name:'Client'}});
assert.equal(personal.returns.client_name,'Client');
console.log('B4_SAFE_PROJECTION_AND_PII_BINDING_PASS');

for(const alias of [...Object.keys(added),'posting_fbo_list','posting_fbs_get']){const built=C.buildRequest(C.normalizeCommand(R.OPERATIONS[alias].template),{}); assert(!Array.isArray(built));}
assert.equal(R.OPERATIONS.return_report_create,undefined);
console.log('B4_NO_HIDDEN_PAGINATION_REPORT_WORKFLOW_PASS');

const protectedRuntime={
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
 'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
 'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
 'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
 'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
 'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
 'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'
};
for(const [rel,sha] of Object.entries(protectedRuntime)){const got=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');assert.equal(got,sha,rel);}
console.log('B4_PROTECTED_RUNTIME_IDENTITIES_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes);
  const pathStyles={
    '/v3/posting/fbo/list':'json_body','/v4/posting/fbs/list':'json_body','/v4/posting/fbs/unfulfilled/list':'json_body','/v3/posting/fbs/get':'json_body',
    '/v1/returns/list':'json_body','/v2/returns/rfbs/list':'json_body','/v1/cancel-reason/list':'no_body','/v1/order/cancel/status':'json_body','/v1/posting/cancel/status':'json_body'
  };
  for(const [p,style] of Object.entries(pathStyles)){const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(Boolean(op.requestBody),style==='json_body',p);}
  assert(sw.paths['/v2/report/returns/create']?.post,'report create authority must exist but stay unimplemented');
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-25T00:00:00.000Z'});
  for(const p of Object.keys(pathStyles)){const rule=snap.operations[`POST ${p}`];assert(rule,`POST ${p}`);assert.equal(rule.default_access,'ALL_ACCOUNTS',p);}
  function closureContains(schema, needle, seen=new Set()){
    if(!schema||typeof schema!=='object') return false;
    if(JSON.stringify(schema).includes(needle)) return true;
    const refs=[];
    const stack=[schema];
    while(stack.length){
      const v=stack.pop();
      if(!v||typeof v!=='object') continue;
      if(typeof v.$ref==='string'&&v.$ref.startsWith('#/components/schemas/')) refs.push(v.$ref.split('/').at(-1));
      for(const child of Object.values(v)) if(child&&typeof child==='object') stack.push(child);
    }
    for(const name of refs){
      if(seen.has(name)) continue;
      seen.add(name);
      if(closureContains(sw.components.schemas[name],needle,seen)) return true;
    }
    return false;
  }
  assert(closureContains(sw.components.schemas['posting.v4.PostingFbsListResponse'],'customer'));
  assert(closureContains(sw.components.schemas['v2ReturnsRfbsListResponse'],'client_name'));
  console.log('B4_OFFICIAL_SWAGGER_CONTRACT_PASS');
  console.log('B4_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS');
}
