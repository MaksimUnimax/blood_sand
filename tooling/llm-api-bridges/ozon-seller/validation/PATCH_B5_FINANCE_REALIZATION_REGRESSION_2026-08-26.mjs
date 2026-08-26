import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2] || '/mnt/data/b5_candidate';
for (const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) {
  await import(pathToFileURL(path.join(root,'shared',name)).href + `?v=${Date.now()}-${name}`);
}
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const added={
  finance_accrual_postings:['POST','/v1/finance/accrual/postings','finance','accruals_balance','json_body'],
  finance_accrual_types:['POST','/v1/finance/accrual/types','finance','accruals_balance','no_body'],
  finance_accrual_by_day:['POST','/v1/finance/accrual/by-day','finance','accruals_balance','json_body'],
  report_list:['POST','/v1/report/list','finance','documents_reports','json_body'],
  report_info:['POST','/v1/report/info','finance','documents_reports','json_body']
};
for(const [alias,[method,p,cluster,section,style]] of Object.entries(added)){
  const m=R.OPERATIONS[alias]; assert(m,alias);
  assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ');
  assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.cluster,cluster); assert.equal(m.section,section);
  assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection');
  assert.equal(m.entitlement_key,`${method} ${p}`); assert.equal(m.workflow_role,'single_read');
  const rule=E.BUNDLED_SNAPSHOT.operations[`${method} ${p}`]; assert(rule,`${method} ${p}`); assert.equal(rule.default_access,'ALL_ACCOUNTS');
}
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B5_FINANCE_REGISTRY_GUIDANCE_PASS');

function build(operation,params){ const cmd=C.normalizeCommand({operation,params}); return [cmd,C.buildRequest(cmd,{})]; }
let [cmd,req]=build('finance_accrual_postings',{posting_numbers:['12345678-0001-1','12345678-0002-1']});
assert.equal(req.url,'https://api-seller.ozon.ru/v1/finance/accrual/postings'); assert.equal(req.method,'POST'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('finance_accrual_types',{}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/finance/accrual/types'); assert.equal(req.method,'POST'); assert.equal(req.body,undefined);
[cmd,req]=build('finance_accrual_by_day',{date:'2022-01-01',last_id:''}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/finance/accrual/by-day'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('report_list',{page:1,page_size:1000,report_type:'ALL'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/report/list'); assert.deepEqual(JSON.parse(req.body),cmd.params);
[cmd,req]=build('report_info',{code:'existing-report-code'}); assert.equal(req.url,'https://api-seller.ozon.ru/v1/report/info'); assert.deepEqual(JSON.parse(req.body),cmd.params);
console.log('B5_FINANCE_EXACT_REQUEST_PASS');

function rejects(command,code){ assert.throws(()=>C.normalizeCommand(command),e=>e&&e.code===code,JSON.stringify(command)); }
rejects({operation:'finance_accrual_postings',params:{posting_numbers:[]}},'OZON_LIMIT_VIOLATION');
rejects({operation:'finance_accrual_postings',params:{posting_numbers:Array(201).fill('p')}},'OZON_LIMIT_VIOLATION');
rejects({operation:'finance_accrual_postings',params:{posting_numbers:['p'],url:'https://evil.example'}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'finance_accrual_types',params:{anything:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'finance_accrual_by_day',params:{date:'2022-01-01'}},'INVALID_OPERATION_PARAMS');
rejects({operation:'finance_accrual_by_day',params:{date:'2021-12-31',last_id:''}},'OZON_LIMIT_VIOLATION');
rejects({operation:'finance_accrual_by_day',params:{date:'2022-01-01',last_id:1}},'INVALID_OPERATION_PARAMS');
rejects({operation:'report_list',params:{page:1,page_size:1001}},'OZON_LIMIT_VIOLATION');
rejects({operation:'report_list',params:{page:1,page_size:100,headers:{Authorization:'x'}}},'TRANSPORT_INJECTION_REJECTED');
rejects({operation:'report_info',params:{}},'INVALID_OPERATION_PARAMS');
rejects({operation:'report_info',params:{code:'x',method:'GET'}},'TRANSPORT_INJECTION_REJECTED');
console.log('B5_FINANCE_CONTRACTS_PASS');

const safeInfo=C.sanitizeResult({operation:'report_info',params:{code:'c'}},{result:{code:'c',file:'https://example.invalid/report.xlsx',status:'success'}});
assert.equal(safeInfo.result.file,'[REDACTED]'); assert.equal(safeInfo.result.status,'success');
const safeList=C.sanitizeResult({operation:'report_list',params:{page:1,page_size:100}},{result:{reports:[{code:'c',file:'https://example.invalid/report.xlsx',status:'success'}],total:1}});
assert.equal(safeList.result.reports[0].file,'[REDACTED]'); assert.equal(safeList.result.reports[0].status,'success');
console.log('B5_FINANCE_REPORT_FILE_REDACTION_PASS');

for(const alias of Object.keys(added)){
  const normalized=C.normalizeCommand(R.OPERATIONS[alias].template);
  const requirement=E.requirementFor(normalized); assert.equal(requirement.known,true,alias); assert.equal(requirement.required,false,alias);
  const plan=C.planCommandForSellerCapability(normalized,null); assert.equal(plan.action,'execute',alias);
  assert.equal(plan.planning.capability.probe_performed,false,alias); assert.equal(plan.planning.entitlement.capability_required,false,alias);
  assert.equal(plan.planning.entitlement.reason,'all_accounts',alias); assert.deepEqual(plan.command,normalized,alias);
}
console.log('B5_FINANCE_POLICY_BEFORE_CAPABILITY_PASS');

let g=G.result({status:'guidance',cluster:'finance',section:'accruals_balance',version:2});
for(const alias of ['finance_accrual_postings','finance_accrual_types','finance_accrual_by_day']) assert(g.choices.some(x=>x.operation===alias),alias);
assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
g=G.result({status:'guidance',cluster:'finance',section:'documents_reports',version:2});
for(const alias of ['report_list','report_info']) assert(g.choices.some(x=>x.operation===alias),alias);
assert.equal(g.external_request_executed,false); assert.equal(g.physical_business_request_count,0);
console.log('B5_FINANCE_GUIDANCE_ZERO_REQUEST_PASS');

for(const alias of Object.keys(added)){
  const built=C.buildRequest(C.normalizeCommand(R.OPERATIONS[alias].template),{});
  assert(!Array.isArray(built),alias); assert.equal(built.host_alias,'seller_api',alias);
}
for(const forbidden of ['finance_realization_posting','realization_report_create','report_realization_posting_create','finance_transaction_list','finance_transaction_totals']) assert.equal(R.OPERATIONS[forbidden],undefined,forbidden);
for(const m of Object.values(R.OPERATIONS)){
  assert.notEqual(m.path,'/v1/finance/realization/posting');
  assert.notEqual(m.path,'/v1/report/realization/posting/create');
  assert.notEqual(m.path,'/v3/finance/transaction/list');
  assert.notEqual(m.path,'/v3/finance/transaction/totals');
}
console.log('B5_FINANCE_EXCLUSIONS_PASS');
console.log('B5_FINANCE_NO_HIDDEN_REPORT_WORKFLOW_PASS');
console.log('B5_FINANCE_LEGACY_TRANSACTIONS_STAY_OFF_PASS');

const protectedRuntime={
  'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
  'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
  'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
  'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
  'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
  'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e'
};
for(const [rel,sha] of Object.entries(protectedRuntime)){
  const got=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'); assert.equal(got,sha,rel);
}
console.log('B5_FINANCE_PROTECTED_RUNTIME_IDENTITIES_PASS');

const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
  const bytes=fs.readFileSync(swaggerPath);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(bytes);
  const exact={
    '/v1/finance/accrual/postings':{body:true,required:['posting_numbers']},
    '/v1/finance/accrual/types':{body:false,required:[]},
    '/v1/finance/accrual/by-day':{body:true,required:['date','last_id']},
    '/v1/report/list':{body:true,required:['page','page_size']},
    '/v1/report/info':{body:true,required:['code']}
  };
  for(const [p,spec] of Object.entries(exact)){
    const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(Boolean(op.requestBody),spec.body,p);
    if(spec.body){ const ref=op.requestBody.content['application/json'].schema.$ref; const schema=sw.components.schemas[ref.split('/').at(-1)]; assert.deepEqual(schema.required||[],spec.required,p); }
  }
  const postingsRef=sw.paths['/v1/finance/accrual/postings'].post.requestBody.content['application/json'].schema.$ref;
  const postingsSchema=sw.components.schemas[postingsRef.split('/').at(-1)]; assert.equal(postingsSchema.properties.posting_numbers.minItems,1); assert.equal(postingsSchema.properties.posting_numbers.maxItems,200);
  const byDayRef=sw.paths['/v1/finance/accrual/by-day'].post.requestBody.content['application/json'].schema.$ref;
  const byDaySchema=sw.components.schemas[byDayRef.split('/').at(-1)]; assert.match(byDaySchema.properties.date.description,/1 января 2022/); assert.match(byDaySchema.properties.last_id.description,/15 минут/);
  assert.match(sw.paths['/v1/finance/realization/posting'].post.description,/Казахстан/);
  assert(sw.paths['/v1/report/realization/posting/create']?.post);
  const snap=E.compileSnapshot(sw,{sourceHash:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',capturedAt:'2026-08-25T00:00:00.000Z'});
  for(const p of Object.keys(exact)){ const rule=snap.operations[`POST ${p}`]; assert(rule,`POST ${p}`); assert.equal(rule.default_access,'ALL_ACCOUNTS',p); }
  // The current entitlement compiler does not encode the Kazakhstan contract restriction,
  // so realization/posting must remain excluded rather than be guessed as ALL_ACCOUNTS.
  assert.equal(snap.operations['POST /v1/finance/realization/posting'].default_access,'ALL_ACCOUNTS');
  console.log('B5_FINANCE_EXACT_SWAGGER_PASS');
}
