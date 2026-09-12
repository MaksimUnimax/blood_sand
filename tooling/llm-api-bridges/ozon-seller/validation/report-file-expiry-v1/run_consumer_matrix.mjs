import assert from 'node:assert/strict';
import fs from 'node:fs';
import {world,START,URL_FILE,clone} from './fixtures.mjs';
const rows=[];
async function test(name,fn){await fn();rows.push({name,status:'PASS'});console.log(name+' PASS');}
const reference=world().runtime(), registry=reference.c.OzonOperationRegistry.OPERATIONS;
const creates=Object.keys(registry).filter(n=>/^report_.*_create(?:_v\d+)?$/.test(n)).sort();
assert.equal(creates.length,8);
for(const op of creates)await test('REPORT_CREATE_RECREATE_INFO_RECREATE_GET_'+op,async()=>{
 const w=world({info:{expires_at:new Date(START+3600000).toISOString()}});let r=w.runtime();
 const params=op==='report_returns_create_v2'?{filter:{date_from:'2026-09-10T00:00:00Z',date_to:'2026-09-11T00:00:00Z',status:'ReturnedToOzon'}}:clone(registry[op].template.params);
 const create=await r.call(op,params);assert.equal(create.http_status,200);assert.equal(r.continuation(create)[0].next_command.operation,'report_info');
 r=w.runtime();const info=await r.info(create.result.result.code);assert.match(info.result.report_file_ref,/^rpf_s_/);assert.equal(r.continuation(info)[0].next_command.params.file_ref,info.result.report_file_ref);
 r=w.runtime();const got=await r.get(info.result.report_file_ref);assert.equal(got.http_status,200);assert.equal(w.requests.length,3);assert.equal(got.provider,'report_file');assert(!got.report_text.includes('FIXTURE_ONLY_SECRET'));assert.equal(r.continuation(got)[0].state,'file_downloaded');
});
const resolvers={cargoes_label_get:'file_url',cargoes_label_transport_by_order_status:'file_url',cargoes_label_transport_status:'file_url',fbp_act_from_get:'cdn_url',fbp_act_to_get:'label_url',fbp_label_get:'label_url',posting_fbs_package_label_get_v1:'file_url'};
assert.deepEqual(Object.keys(resolvers).sort(),Object.keys(reference.c.OzonLlmOutputReportWorkflowPatch.GENERATED_DOCUMENT_RESOLVERS).sort());
for(const [op,field] of Object.entries(resolvers))await test('GENERATED_URL_RECREATE_GET_'+op,async()=>{
 const w=world({fileFormat:'pdf'});w.payloads[op]={result:{[field]:w.url},status:'success'};let r=w.runtime();const out=await r.call(op,clone(registry[op].template.params));assert.equal(out.http_status,200);assert.match(out.result.generated_file_ref,/^rpf_s_/);assert.equal(Date.parse(out.result.file_availability.expires_at),START+1800000);assert.equal(r.continuation(out)[0].next_command.params.file_ref,out.result.generated_file_ref);r=w.runtime();const got=await r.get(out.result.generated_file_ref);assert.equal(got.result.format,'pdf');assert.equal(w.requests.length,2);assert(!out.report_text.includes('FIXTURE_ONLY_SECRET'));
});
for(const op of ['posting_fbs_package_label','posting_fbs_act_container_labels'])await test('INLINE_PDF_RECREATE_ZERO_GET_'+op,async()=>{
 const w=world();let r=w.runtime();const out=await r.call(op,clone(registry[op].template.params));assert.equal(out.http_status,200);assert.match(out.result.generated_file_ref,/^rpf_p_/);assert.equal(out.result.file_availability,undefined);assert(!JSON.stringify(out.result).includes('file_content_base64'));
 r=w.runtime();const got=await r.get(out.result.generated_file_ref);assert.equal(got.result.format,'pdf');assert.equal(w.requests.length,1);assert.match(got.report_text,/"external_request_executed": false/);
});
await test('V1_INLINE_PDF_MIGRATES_WITHOUT_URL_EXPIRY',async()=>{
 const w=world();let r=w.runtime();const out=await r.call('posting_fbs_package_label',{posting_number:['FIXTURE-POSTING']});w.state.schema_version=1;r=w.runtime();const got=await r.get(out.result.generated_file_ref);assert.equal(got.result.format,'pdf');assert.equal(w.requests.length,1);
});
for(const status of ['waiting','processing','failed','not-a-real-status'])await test('NONREADY_STATUS_'+status,async()=>{
 const w=world({info:{status,error:status==='failed'?'failed':''}});const r=w.runtime(),out=await r.info();assert.equal(out.result.report_file_ref,undefined);assert(!r.continuation(out).some(v=>v.state==='file_ready'));assert.equal(w.requests.length,1);
});
await test('CONCURRENT_REF_WRITES_PRESERVE_BOTH_ABSOLUTE_DEADLINES',async()=>{
 const w=world({info:{expires_at:new Date(START+10000).toISOString()}}),r=w.runtime();const out=await Promise.all([r.info('REPORT_ONE'),r.info('REPORT_TWO')]);assert.notEqual(out[0].result.report_file_ref,out[1].result.report_file_ref);assert.equal(Object.keys(w.state.report_file_refs).length,2);for(const a of out)assert.equal(w.state.report_file_refs[a.result.report_file_ref].expires_at_ms,START+10000);w.advance(10000);for(const a of out)await assert.rejects(w.runtime().get(a.result.report_file_ref),e=>e.code==='REPORT_FILE_EXPIRED');assert.equal(w.requests.length,2);
});
await test('REF_CAP_128_RETAINED_AND_OLDEST_REJECTED',async()=>{
 const w=world(),r=w.runtime(),refs=[];for(let i=0;i<129;i++){const out=await r.info();refs.push(out.result.report_file_ref);w.advance(1);}assert.equal(Object.keys(w.state.report_file_refs).length,128);const n=w.requests.length;await assert.rejects(w.runtime().get(refs[0]),e=>e.code==='REPORT_FILE_REF_NOT_FOUND');assert.equal(w.requests.length,n);assert.equal((await w.runtime().get(refs.at(-1))).http_status,200);
});
await test('EXPIRY_DURING_STATE_WRITE_NO_READY_REF',async()=>{
 const w=world({info:{expires_at:new Date(START+100).toISOString()}});w.setWriteHook(()=>w.advance(101));const out=await w.runtime().info();assert.equal(out.result.report_file_ref,undefined);assert.equal(out.result.file_availability.state,'expired');assert.equal(w.requests.length,1);
});
await test('INFO_REPEATS_CANNOT_RENEW_PROVIDER_DEADLINE',async()=>{
 const w=world({info:{expires_at:new Date(START+1000).toISOString()}});const a=await w.runtime().info();w.advance(500);const b=await w.runtime().info();assert.notEqual(a.result.report_file_ref,b.result.report_file_ref);assert.equal(a.result.file_availability.expires_at,b.result.file_availability.expires_at);w.advance(500);const c=await w.runtime().info();assert.equal(c.result.report_file_ref,undefined);assert.equal(w.requests.length,3);
});
for(const url of ['http://cdn1.ozone.ru/unsafe.csv','https://example.invalid/unsafe.csv','https://127.0.0.1/private','https://user:secret@cdn1.ozone.ru/file.csv'])await test('TRUSTED_HOST_UNCHANGED_'+url.split('/')[2],async()=>{
 const w=world({info:{file:url}});await assert.rejects(w.runtime().info());assert.equal(w.requests.length,1);assert(!w.requests.some(v=>v.url===url));
});
await test('FAILED_VALID_URL_NO_HIDDEN_RETRY',async()=>{
 const w=world({fetchStatus:403}),out=await w.runtime().info(),file=await w.runtime().get(out.result.report_file_ref);assert.equal(file.http_status,403);assert.equal(file.result.error.automatic_retry,false);assert.equal(w.requests.length,2);assert.equal(w.runtime().continuation(file).length,0);
});
await test('CLOCK_ROLLBACK_REJECTS_FUTURE_CREATED_REF',async()=>{
 const w=world(),out=await w.runtime().info();w.advance(-1);await assert.rejects(w.runtime().get(out.result.report_file_ref),e=>e.code==='REPORT_FILE_REF_NOT_FOUND');assert.equal(w.requests.length,1);
});
await test('DOWNLOAD_INLINE_BYTES_NOT_URL_DEADLINE',async()=>{
 const r=world().runtime();const payload='OZON_RESULT_V1\n'+JSON.stringify({operation:'performance_daily_csv',http_status:200,result:{generated_file_inline:true,generated_file_ref:'rpf_s_inline_fixture001',file_availability:{state:'expired',expires_at:'2000-01-01T00:00:00Z'}}});const cont=r.c.OzonLlmOutputReportWorkflowPatch.instructionPayload(payload).workflow_continuations;assert.equal(cont[0].state,'file_downloaded');assert.equal(cont[0].next_command,null);
});
console.log('REPORT_CONSUMER_MATRIX_PASS cases='+rows.length+' provider_calls=0');
if(process.env.OZON_MATRIX_REPORT)fs.writeFileSync(process.env.OZON_MATRIX_REPORT,JSON.stringify({status:'PASS',cases:rows,report_creates:creates.length,generated_url_resolvers:7,inline_pdf_operations:2,provider_calls:0},null,2)+'\n');
