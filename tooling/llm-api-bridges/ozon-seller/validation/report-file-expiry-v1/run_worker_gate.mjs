import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {dist,START,URL_FILE} from './fixtures.mjs';
const origin='https://alice.yandex.ru',conv='12345678-1234-4234-8234-123456789abc',key=`${origin}|${conv}`,tabId=77;
const copy=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const rows=[];
function passed(name,extra={}){rows.push({name,status:'PASS',...extra});console.log(name+' PASS');}
function area(backing,decode=copy){return {async get(keys){if(keys==null)return decode(backing);if(typeof keys==='string')keys=[keys];const out={};for(const k of Array.isArray(keys)?keys:Object.keys(keys)){if(k in backing)out[k]=copy(backing[k]);else if(!Array.isArray(keys))out[k]=copy(keys[k]);}return decode(out);},async set(x){Object.assign(backing,copy(x));},async remove(keys){for(const k of typeof keys==='string'?[keys]:keys)delete backing[k];}};}
function seededStore(runId){const binding={binding_id:'fixture-binding-'+webcrypto.randomUUID(),revision:1,origin,conversation_id:conv,conversation_key:key,ai_id:'alice'};return {ozmb_conversation_bindings:{[key]:binding},ozmb_auto_runs:{[key]:{run_id:runId,tab_id:tabId,origin,conversation_id:conv,conversation_key:key,ai_id:'alice',binding_snapshot:copy(binding),status:'waiting_command',assistant_baseline_ids:['old'],watch_id:'fixture-watch-'+webcrypto.randomUUID(),sequence:0,guidance_rounds:0}},ozmb_seller_client_id:'123456',ozmb_seller_api_key:'fixture-only-not-a-credential',ozmb_personal_data_enabled_v1:false};}
function makeWorker(store,{clock={now:START},fetchImpl,identity={status:'confirmed',origin,conversation_id:conv,ai_id:'alice'},sessionStore={}}={}){
 let intoRealm=copy;
 const listeners=[],requests=[],pushes=[];
 const event={addListener(){},removeListener(){}};
 const chrome={runtime:{onMessage:{addListener(f){listeners.push(f);}},onInstalled:event,lastError:null},storage:{local:area(store,x=>intoRealm(x)),session:area(sessionStore,x=>intoRealm(x)),onChanged:event},tabs:{async get(id){return {id,url:`${origin}/chat/${conv}/`};},sendMessage(id,m,cb){pushes.push(copy(m));queueMicrotask(()=>cb(m.type==='OZ_GET_IDENTITY'?{ok:true,identity}:{ok:true}));},async query(){return [];},onRemoved:event},alarms:{onAlarm:event,async create(){},async clear(){return true;}},action:{async setBadgeText(){},async setBadgeBackgroundColor(){}}};
 const context=vm.createContext({console:{info(){},log(){},warn(){},error(){}},chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,Headers,Request,Response,structuredClone,atob,btoa,queueMicrotask,setTimeout:(f,d)=>{const t=setTimeout(f,d);t.unref();return t;},clearTimeout,setInterval:(f,d)=>{const t=setInterval(f,d);t.unref();return t;},clearInterval,Date:class extends Date{constructor(...a){super(...(a.length?a:[clock.now]));}static now(){return clock.now;}},fetch:async(url,init)=>{requests.push({url:String(url),body:init?.body});return fetchImpl(url,init);}});context.globalThis=context;context.self=context;
 intoRealm=x=>x===undefined?undefined:vm.runInContext("JSON.parse",context)(JSON.stringify(x));
 const loaded=new Set();function load(rel){if(loaded.has(rel))return;loaded.add(rel);vm.runInContext(fs.readFileSync(path.join(dist,rel),'utf8'),context,{filename:rel});}
 context.importScripts=(...files)=>files.forEach(load);
 load('shared/ai_delivery_capabilities.js');load('shared/mixed_batch_discovery.js');load('service_worker.js');load('shared/llm_output_report_workflow_patch.js');load('shared/file_delivery_model_policy.js');
 const listener=listeners.at(-1);assert(listener,'actual worker runtime listener');
 function invoke(message,sender={tab:{id:tabId,url:`${origin}/chat/${conv}/`}}){return new Promise((resolve,reject)=>{let settled=false;const done=v=>{if(!settled){settled=true;clearTimeout(timer);resolve(v);}};const timer=setTimeout(()=>reject(new Error('worker timeout '+message.type)),2000);try{const result=listener(intoRealm(message),intoRealm(sender),done);if(result!==true)queueMicrotask(()=>done(undefined));}catch(e){clearTimeout(timer);reject(e);}});}
 return {context,invoke,requests,pushes,store,sessionStore,run:()=>store.ozmb_auto_runs?.[key],operation:()=>store.ozmb_manual_operations?.[key]};
}
async function until(fn,label){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw new Error(label);}
function scenario(){
 const clock={now:START}, sessionStore={},store=seededStore('unused');store.ozmb_auto_runs={};store.ozmb_manual_modes={[key]:true};store.ozmb_work_sessions_v1={[key]:{state:'active_visible',revision:1,origin,conversation_id:conv,conversation_key:key,ai_id:'alice',tab_id:tabId}};
 let expire=START+60000,status=200,serial=0;const allRequests=[];
 const fetchImpl=async(url,init)=>{
  const u=String(url);allRequests.push({url:u,at:clock.now});
  if(u==='https://api-seller.ozon.ru/v1/report/products/create')return new Response(JSON.stringify({result:{code:'REPORT_MANUAL_FIXTURE'}}),{status:200,headers:{'content-type':'application/json'}});
  if(u==='https://api-seller.ozon.ru/v1/report/info')return new Response(JSON.stringify({result:{code:JSON.parse(init.body).code,status:'success',error:'',file:URL_FILE,report_type:'seller_products',expires_at:new Date(expire).toISOString()}}),{status:200,headers:{'content-type':'application/json'}});
  if(u===URL_FILE){assert.equal(init.credentials,'omit');assert.equal(init.redirect,'error');return new Response(status===200?'sku;qty\n123;4\n':'forbidden',{status,headers:{'content-type':'text/csv'}});}
  throw new Error('Unexpected external call (fixture gate) '+u);
 };
 function worker(){return makeWorker(store,{sessionStore,clock,fetchImpl});}
 async function step(operation,params={},expectCalls=1){
  const w=worker(),m={type:'OZ_EXECUTE_COMMAND',command_text:'OZON_API_V1\n'+JSON.stringify({operation,params}),conversation_key:key,manual_request_id:'fixture-manual-'+(++serial)};
  const admitted=await w.invoke(m);assert.equal(admitted?.accepted,true,JSON.stringify(admitted));await until(()=>w.operation()?.status==='delivering','manual report result '+operation);
  const op=copy(w.operation()),out=op.delivery.artifact_text||op.delivery.outgoing_text,header=JSON.parse(out.slice(out.indexOf('{'),out.indexOf('===== OZON RESULT')).trim());
  assert.equal(w.requests.length,expectCalls,operation+' request count');assert.equal(header.query_planner.physical_business_request_count,expectCalls);assert.equal(op.batch.entries.length,1);assert.equal(op.batch.entries[0].external_request_executed,expectCalls===1);
  assert(!out.includes('FIXTURE_ONLY_SECRET'));assert(!out.includes('fixture-only-not-a-credential'));
  const envelope=w.context.OzonLlmOutputReportWorkflowPatch.resultEnvelopesFromDelivery(out)[0];
  const cont=copy(w.context.OzonLlmOutputReportWorkflowPatch.instructionPayload(out).workflow_continuations);
  if(op.delivery.mode==='batch_watch_v1'){
  const ack={conversation_key:key,owner_kind:'manual',owner_id:op.operation_id,delivery_id:op.delivery.delivery_id,actor_id:'fixture-actor',assistant_baseline_ids:[]};
  assert.equal((await w.invoke({...ack,type:'OZ_BATCH_DELIVERY_INSERT_COMMIT'})).insert_allowed,true);
  assert.equal((await w.invoke({...ack,type:'OZ_BATCH_DELIVERY_INSERTED'})).inserted,true);
  assert.equal((await w.invoke({...ack,type:'OZ_BATCH_DELIVERY_COMPLETE',delivery_confirmed:true,confirmation_basis:'alice_ready',click_attempts:1})).ok,true);
  assert.equal(w.operation().status,'completed');
  }else{
    assert.equal(op.delivery.mode,'attachment_watch_v1');assert.equal(envelope.http_status,200);assert.equal(operation,'report_file_get');
  }
  const next=worker(),duplicate=await next.invoke(m);assert.notEqual(duplicate.accepted,true);assert.equal(next.requests.length,0);
  return {envelope:copy(envelope),cont,out};
 }
 return {step,clock,store,sessionStore,allRequests,setExpiry(v){expire=v;},setStatus(v){status=v;}};
}
{
 const s=scenario();const created=await s.step('report_products_create');assert.equal(created.cont[0].next_command.operation,'report_info');const info=await s.step('report_info',{code:created.envelope.result.result.code});const ref=info.envelope.result.report_file_ref;assert.match(ref,/^rpf_s_/);const file=await s.step('report_file_get',{file_ref:ref});assert.equal(file.envelope.http_status,200);assert.equal(file.envelope.result.format,'csv');assert.equal(file.cont[0].state,'file_downloaded');passed('MANUAL_CHAIN_RECREATION_TEXT_ACKS_FILE_PLAN_NO_DUPLICATES',{fixture_calls:s.allRequests.length});
}
{
 const s=scenario();s.setExpiry(START-1000);const out=await s.step('report_info',{code:'REPORT_EXPIRED_UNKNOWN'});assert.equal(out.envelope.http_status,200);assert.equal(out.envelope.result.file_availability.state,'expired');assert.equal(out.envelope.result.report_file_ref,undefined);assert.equal(out.cont[0].next_command,null);passed('EXPIRED_INFO_HTTP200_ONE_REQUEST_NO_CONTINUATION');
}
{
 const s=scenario();await s.step('report_products_create');s.setExpiry(START+1000);const info=await s.step('report_info',{code:'REPORT_MANUAL_FIXTURE'});s.clock.now+=1000;const out=await s.step('report_file_get',{file_ref:info.envelope.result.report_file_ref},0);assert.equal(out.envelope.http_status,0);assert(out.out.includes('REPORT_FILE_EXPIRED'));passed('EXPIRED_GET_HTTP0_ZERO_REQUEST_ACTUAL_WORKER');
}
{
 const s=scenario(),info=await s.step('report_info',{code:'REPORT_UNKNOWN_HISTORY'});const ref=info.envelope.result.report_file_ref;assert.match(ref,/^rpf_p_/);const blocked=await s.step('report_file_get',{file_ref:ref},0);assert.match(blocked.out,/OPERATION_DISABLED_BY_USER/);passed('UNKNOWN_PROVENANCE_PERSONAL_POLICY_OFF_BLOCKS');s.store.ozmb_personal_data_enabled_v1=true;const allowed=await s.step('report_file_get',{file_ref:ref});assert.equal(allowed.envelope.http_status,200);passed('PERSONAL_POLICY_ON_POSITIVE_CONTROL');
}
{
 const s=scenario();await s.step('report_products_create');const info=await s.step('report_info',{code:'REPORT_MANUAL_FIXTURE'});s.setStatus(403);const out=await s.step('report_file_get',{file_ref:info.envelope.result.report_file_ref});assert.equal(out.envelope.http_status,403);assert.equal(out.envelope.result.error.automatic_retry,false);assert.equal(out.cont.length,0);passed('REAL403_PRESERVED_ONE_REQUEST_NO_RETRY');
}
{
 const s=scenario();const out=await s.step('report_file_get',{file_ref:'rpf_s_00000000-0000-4000-8000-000000000099'},0);assert.equal(out.envelope.http_status,0);assert.match(out.out,/REPORT_FILE_REF_NOT_FOUND/);passed('UNKNOWN_REF_ZERO_REQUEST_AFTER_RECREATION');
}
console.log('REPORT_EXPIRY_WORKER_GATE_PASS cases='+rows.length+' provider_calls=0');
if(process.env.OZON_WORKER_REPORT)fs.writeFileSync(process.env.OZON_WORKER_REPORT,JSON.stringify({status:'PASS',cases:rows,provider_calls:0},null,2)+'\n');
