import assert from 'node:assert/strict';
import fs from 'node:fs';
import {world,START,URL_FILE,CREDS,clone,dist} from './fixtures.mjs';
const red=process.argv.includes('--expect-red');
const rows=[];
async function check(name,fn,{prefx=false}={}){
 if(red&&!prefx)return;
 try{await fn();if(red)throw new Error('Pre-fix invariant unexpectedly passed: '+name);rows.push({name,status:'PASS'});console.log(name+' PASS');}
 catch(e){if(red&&e instanceof assert.AssertionError){rows.push({name,status:'EXPECTED_RED',assertion:e.message});console.log(name+' EXPECTED_RED');return;}console.error('CASE_FAILED='+name);throw e;}
}
await check('EXPIRED_REPORT_NEVER_MINTS_REF',async()=>{
 const w=world({info:{expires_at:'2026-09-12T07:55:46.389080Z'}});const r=w.runtime(),out=await r.info();
 assert.equal(out.result.report_file_ref,undefined);assert.equal(out.http_status,200);assert.equal(w.requests.length,1);
 assert.equal(out.result.file_availability.state,'expired');assert.equal(r.continuation(out)[0].next_command,null);
 assert(!out.report_text.includes('FIXTURE_ONLY_SECRET'));assert.equal(out.result.result.status,'success');
},{prefx:true});
await check('DEADLINE_SURVIVES_COMPLETE_MODULE_RECREATION',async()=>{
 const w=world({info:{expires_at:new Date(START+1000).toISOString()}});let r=w.runtime();await r.create();r=w.runtime();const out=await r.info();const ref=out.result.report_file_ref;assert.match(ref,/^rpf_s_/);
 w.advance(1001);r=w.runtime();const n=w.requests.length;await assert.rejects(r.get(ref),e=>e.code==='REPORT_FILE_EXPIRED'&&e.external_request_executed===false);assert.equal(w.requests.length,n);
},{prefx:true});
await check('INVALID_EXPIRY_NOT_TREATED_AS_UNBOUNDED',async()=>{
 const w=world({info:{expires_at:'not-a-date'}});const r=w.runtime(),out=await r.info();assert.equal(out.result.report_file_ref,undefined);assert.equal(out.result.file_availability.state,'invalid_expiry');assert.equal(r.continuation(out)[0].next_command,null);
},{prefx:true});
await check('RETURNS_FIVE_MINUTE_LIMIT',async()=>{
 const w=world({info:{expires_at:'',report_type:'SELLER_RETURNS'}});const out=await w.runtime().info();w.advance(5*60*1000+1);const n=w.requests.length;await assert.rejects(w.runtime().get(out.result.report_file_ref),e=>e.code==='REPORT_FILE_EXPIRED');assert.equal(w.requests.length,n);
},{prefx:true});
await check('PENDING_REPORT_WITH_STALE_FILE_CANNOT_BE_READY',async()=>{
 const w=world({info:{status:'processing',expires_at:new Date(START+60000).toISOString()}});const r=w.runtime(),out=await r.info();assert.equal(out.result.report_file_ref,undefined);assert.notEqual(r.continuation(out)[0].state,'file_ready');
},{prefx:true});
await check('DELAYED_OUTPUT_CANNOT_OFFER_EXPIRED_REF',async()=>{
 const w=world({info:{expires_at:new Date(START+1000).toISOString()}});const r=w.runtime(),out=await r.info();assert.equal(r.continuation(out)[0].state,'file_ready');w.advance(1001);assert.equal(r.continuation(out)[0].next_command,null);
},{prefx:true});
if(red){assert.equal(rows.length,6);console.log('EXPECTED_RED_COUNT='+rows.length);if(process.env.OZON_EXPIRY_REPORT)fs.writeFileSync(process.env.OZON_EXPIRY_REPORT,JSON.stringify({status:'RED_REPRODUCED',cases:rows,provider_calls:0},null,2)+'\n');process.exit(0);}
for(const [name,value] of [['MISSING',undefined],['NULL',null],['EMPTY','']])await check('LEGACY_'+name+'_EXPIRY_USES_BOUNDED_TTL',async()=>{
 const w=world({info:{expires_at:value}});const out=await w.runtime().info();assert.match(out.result.report_file_ref,/^rpf_p_/);assert.equal(out.result.file_availability.provider_expires_at,null);assert.equal(Date.parse(out.result.file_availability.expires_at),w.now+1800000);const file=await w.runtime().get(out.result.report_file_ref);assert.equal(file.http_status,200);
});
for(const value of ['2026-02-30T09:00:00Z','2026-09-12','2026-09-12T25:00:00Z','2026-09-12T09:06:20','2026-09-12T09:06:20+99:00',12345,{},[],true])await check('MALFORMED_DATE_'+JSON.stringify(value),async()=>{
 const w=world({info:{expires_at:value}});const out=await w.runtime().info();assert.equal(out.result.file_availability.state,'invalid_expiry');assert.equal(out.result.report_file_ref,undefined);assert.equal(w.requests.length,1);
});
for(const value of ['2026-09-12T09:06:09.452123Z','2026-09-12T14:06:09.452123+05:00'])await check('RFC3339_PRECISION_OFFSET_'+value,async()=>{
 const w=world({info:{expires_at:value}});const out=await w.runtime().info();assert.equal(Date.parse(out.result.file_availability.provider_expires_at),START+1000);assert.equal((await w.runtime().get(out.result.report_file_ref)).http_status,200);w.advance(1000);const n=w.requests.length;await assert.rejects(w.runtime().get(out.result.report_file_ref),e=>e.code==='REPORT_FILE_EXPIRED');assert.equal(w.requests.length,n);
});
await check('EARLIEST_DEADLINE_PROVIDER_RETURNS_LOCAL',async()=>{
 for(const [type,expires,expected] of [['seller_products',START+7200000,1800000],['seller_returns',START+7200000,300000],['SELLER_RETURNS',START+1000,1000]]){
  const w=world({info:{report_type:type,expires_at:new Date(expires).toISOString()}});const out=await w.runtime().info();assert.equal(Date.parse(out.result.file_availability.expires_at),START+expected);
 }
});
await check('READINESS_RECHECK_AFTER_STORAGE_WAIT',async()=>{
 const w=world({info:{expires_at:new Date(START+100).toISOString()}});let times=0;w.setReadHook(()=>{if(++times===2)w.advance(101);});const out=await w.runtime().info();assert.equal(out.result.report_file_ref,undefined);assert.equal(out.result.file_availability.state,'expired');assert.equal(w.requests.length,1);
});
await check('FINAL_PREFLIGHT_AFTER_ASYNC_REF_READ',async()=>{
 const w=world({info:{expires_at:new Date(START+1000).toISOString()}});const out=await w.runtime().info();w.advance(1000);const n=w.requests.length;await assert.rejects(w.runtime().get(out.result.report_file_ref),e=>e.code==='REPORT_FILE_EXPIRED');assert.equal(w.requests.length,n);
});
await check('LOCAL_RETENTION_IS_NOT_RENEWED_BY_READS',async()=>{
 const w=world({info:{expires_at:new Date(START+7200000).toISOString()}});const out=await w.runtime().info();const ref=out.result.report_file_ref,created=w.state.report_file_refs[ref].created_at_ms;
 w.advance(60000);await w.runtime().get(ref);assert.equal(w.state.report_file_refs[ref].created_at_ms,created);w.setNow(START+1800001);const n=w.requests.length;await assert.rejects(w.runtime().get(ref),e=>e.code==='REPORT_FILE_REF_NOT_FOUND');assert.equal(w.requests.length,n);
});
await check('UNKNOWN_AND_EXPIRED_PROVENANCE_REMAIN_PERSONAL',async()=>{
 const w=world({info:{expires_at:new Date(START+7200000).toISOString()}});await w.runtime().create();w.advance(1800001);const out=await w.runtime().info();assert.match(out.result.report_file_ref,/^rpf_p_/);assert.equal(w.runtime().p.reportFileRefPolicy(out.result.report_file_ref).personal_data_required,true);
});
await check('V1_URL_REFS_REQUIRE_FRESH_RESOLUTION',async()=>{
 const w=world();w.session.ozmb_report_file_session_state_v1={schema_version:1,report_code_policies:{REPORT_FIXTURE:{personal_data_required:false,created_at_ms:START}},report_file_refs:{'rpf_s_00000000-0000-4000-8000-000000999999':{url:URL_FILE,personal_data_required:false,created_at_ms:START}}};
 await assert.rejects(w.runtime().get('rpf_s_00000000-0000-4000-8000-000000999999'),e=>e.code==='REPORT_FILE_REF_NOT_FOUND'&&e.external_request_executed===false);assert.equal(w.requests.length,0);
 const out=await w.runtime().info();assert.match(out.result.report_file_ref,/^rpf_s_/);assert.equal(w.state.schema_version,2);assert.equal((await w.runtime().get(out.result.report_file_ref)).http_status,200);
});
await check('MALFORMED_V2_DEADLINE_CANNOT_BYPASS_EXPIRY',async()=>{
 for(const mutate of [r=>delete r.expires_at_ms,r=>r.expires_at_ms='tomorrow',r=>r.expires_at_ms=START+99999999,r=>r.provider_expires_at_ms='bad',r=>r.provider_expires_at_ms=START+1]){
  const w=world({info:{expires_at:new Date(START+1000).toISOString()}});const out=await w.runtime().info();mutate(w.state.report_file_refs[out.result.report_file_ref]);const n=w.requests.length;await assert.rejects(w.runtime().get(out.result.report_file_ref),e=>e.code==='REPORT_FILE_REF_NOT_FOUND');assert.equal(w.requests.length,n);
 }
});
await check('LIVE_403_NOT_REWRITTEN_OR_RETRIED',async()=>{
 const w=world({info:{expires_at:new Date(START+10000).toISOString()},fetchStatus:403});const out=await w.runtime().info();const file=await w.runtime().get(out.result.report_file_ref);assert.equal(file.http_status,403);assert.equal(file.ok,false);assert.equal(file.result.error.source,'provider');assert.equal(w.requests.length,2);
});
await check('SOURCE_REPORT_RECORD_NOT_ADDITIONAL_DATA_IS_AUTHORITY',async()=>{
 const w=world({info:{additional_data:[{file:'https://cdn1.ozone.ru/not-the-report.csv',expires_at:'2099-01-01T00:00:00Z'}],expires_at:new Date(START-1).toISOString()}});const out=await w.runtime().info();assert.equal(out.result.report_file_ref,undefined);assert.equal(out.result.file_availability.state,'expired');
});
await check('STATE_WRITE_FAILURE_PRESERVES_EXECUTED_ACCOUNTING',async()=>{
 const w=world({info:{expires_at:new Date(START+1000).toISOString()}});w.setWriteHook(()=>{throw new Error('fixture-storage-failure');});await assert.rejects(w.runtime().info(),e=>e.code==='REPORT_FILE_SESSION_STATE_WRITE_FAILED'&&e.external_request_executed===true);assert.equal(w.requests.length,1);
});
console.log('REPORT_FILE_EXPIRY_GATE_PASS cases='+rows.length+' provider_calls=0');
if(process.env.OZON_EXPIRY_REPORT)fs.writeFileSync(process.env.OZON_EXPIRY_REPORT,JSON.stringify({status:'PASS',cases:rows,provider_calls:0},null,2)+'\n');
