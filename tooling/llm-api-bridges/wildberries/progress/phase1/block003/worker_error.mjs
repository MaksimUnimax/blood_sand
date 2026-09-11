// Exact service_worker entry point, real contract/provider/transport, mocked Chrome and fetch.
// No real credentials or network API is made available to the VM.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
fs.mkdirSync(out,{recursive:false});
const rows=[], fd=fs.openSync(path.join(out,'results.jsonl'),'wx');
const identity={origin:'https://chatgpt.com',conversation_id:'11111111-1111-1111-1111-111111111111',status:'confirmed',source:'synthetic-fixture'};
const key=identity.origin+'|'+identity.conversation_id;
const command='WB_API_V1\n{"operation":"seller_info","params":{}}';
function fixture(){
 const binding={...identity,binding_id:'fixture-binding',revision:1,conversation_key:key};
 return {
  wbmb_seller_token:'offline-fixture-token',wbmb_auto_send:false,
  wbmb_conversation_bindings:{[key]:binding},
  wbmb_auto_runs:{[key]:{
   run_id:'fixture-run',conversation_key:key,origin:identity.origin,conversation_id:identity.conversation_id,
   binding_snapshot:{...binding,binding_revision:1},tab_id:1,status:'waiting_command',sequence:0,
   pause_requested:false,finish_requested:false,assistant_baseline_ids:[],watch_id:'fixture-watch'
  }}
 };
}
function boot(data,mode='network',count={calls:0}){
 let listener;const messages=[];
 const clone=v=>v===undefined?undefined:structuredClone(v);
 const sandbox={URL,URLSearchParams,TextEncoder,TextDecoder,AbortController,Headers,Response,Uint8Array,crypto:crypto.webcrypto,setTimeout,clearTimeout,console,btoa:s=>Buffer.from(s,'binary').toString('base64')};
 const tab={id:1,url:'https://chatgpt.com/c/'+identity.conversation_id};
 sandbox.chrome={runtime:{lastError:null,onMessage:{addListener:f=>{listener=f}}},
  storage:{local:{
   async get(keys){if(keys===null)return clone(data);return Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(k=>[k,clone(data[k])]))},
   async set(values){Object.assign(data,clone(values))},async remove(keys){for(const k of Array.isArray(keys)?keys:[keys])delete data[k]}
  }},tabs:{async get(){return tab},async query(){return [tab]},sendMessage(id,m,cb){messages.push(m);queueMicrotask(()=>cb(m.type==='WB_GET_IDENTITY'?{ok:true,identity}: {ok:false,code:'SYNTHETIC_DELIVERY_UNAVAILABLE'}))}}};
 sandbox.fetch=async()=>{
  count.calls++;
  if(mode==='network')throw new Error('Synthetic network failure');
  if(mode==='abort')throw Object.assign(new Error('Synthetic abort'),{name:'AbortError'});
  if(mode==='read-error')return {ok:true,status:200,headers:new Headers(),text:async()=>{throw Object.assign(new Error('Synthetic body read failure'),{code:'BODY_READ_FAILED',http_status:200})}};
  return new Response(JSON.stringify(mode==='429'?{title:'rate limited'}:{seller:'fixture'}),{status:mode==='429'?429:200,headers:{'Content-Type':'application/json',...(mode==='429'?{'Retry-After':'60'}:{})}});
 };
 const context=vm.createContext(sandbox);
 sandbox.importScripts=(...files)=>{for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f,timeout:3000})};
 vm.runInContext(fs.readFileSync(path.join(root,'service_worker.js'),'utf8'),context,{filename:'service_worker.js',timeout:3000});
 return {context,count,messages,data,
  dispatch(message){return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Synthetic message timed out')),5000);
   try{const retained=listener(message,{tab},response=>{clearTimeout(timer);resolve(response)});assert.equal(retained,true)}catch(e){clearTimeout(timer);reject(e)}
  })},
  async settle(){await vm.runInContext('Promise.all([...deliveryAttemptRequests.values()])',context)}
 };
}
async function test(id,fn){
 try{const detail=await fn();const row={id,status:'PASS',detail:detail??null};rows.push(row);fs.writeSync(fd,JSON.stringify(row)+'\n');fs.fsyncSync(fd)}
 catch(e){const row={id,status:'FAIL',error:e.stack};rows.push(row);fs.writeSync(fd,JSON.stringify(row)+'\n');fs.fsyncSync(fd);console.error(id,e.message)}
}
const message={type:'WB_AUTO_COMMAND_READY',conversation_key:key,run_id:'fixture-run',assistant_turn_id:'synthetic-turn',command_text:command};
for(const [mode,code,status] of [['network','PROVIDER_FETCH_FAILED',0],['abort','REQUEST_TIMEOUT',0],['read-error','BODY_READ_FAILED',200]]){
 await test('AUTORUN-ERROR-REPORT:'+mode,async()=>{
  const worker=boot(fixture(),mode);const response=await worker.dispatch(message);await worker.settle();
  assert.equal(response.accepted,true,JSON.stringify(response));assert.equal(response.ok,false);assert.equal(response.bridge_error,true);assert.equal(response.http_status,status);
  const report=JSON.parse(response.report_text.slice('WB_RESULT_V1\n'.length));
  assert.equal(report.result.error.code,code);assert.equal(report.http_status,status);
  const meta=worker.context.WBContract.resolveOperation('seller_info');
  assert.equal(report.request_meta.host_alias,meta.host);assert.equal(report.request_meta.http_method,meta.method);assert.equal(report.request_meta.provider,'wildberries');
  assert.equal(worker.count.calls,1);assert.equal(worker.data.wbmb_auto_runs[key].status,'delivering');
  assert.equal(worker.data.wbmb_auto_runs[key].delivery.outgoing_text,response.outgoing_text);
  assert.equal(worker.data.wbmb_last_status.http_status,status);
  assert.equal(worker.data.wbmb_diagnostics.some(x=>x.event==='AUTO_ERROR_REPORT_FAILED'),false);
  assert.equal(response.report_text.includes('offline-fixture-token'),false);
  return {provider_calls:worker.count.calls,code,http_status:status,delivery_state:'delivering'};
 });
}
await test('AUTORUN-SUCCESS-POSITIVE',async()=>{
 const w=boot(fixture(),'success');const r=await w.dispatch(message);await w.settle();
 assert.equal(r.accepted,true);assert.equal(r.ok,true);assert.equal(r.http_status,200);assert.equal(w.count.calls,1);
 assert.equal(w.data.wbmb_auto_runs[key].status,'delivering');
});
await test('AUTORUN-429-NO-RETRY',async()=>{
 const w=boot(fixture(),'429');const r=await w.dispatch(message);await w.settle();
 assert.equal(r.accepted,true);assert.equal(r.ok,false);assert.equal(r.http_status,429);assert.equal(w.count.calls,1);
 const duplicate=await w.dispatch(message);await w.settle();assert.equal(duplicate.accepted,false);assert.equal(w.count.calls,1);
});
await test('AUTORUN-ERROR-RECOVERY-NEW-WORKER',async()=>{
 const data=fixture(),counter={calls:0};const first=boot(data,'network',counter);
 const r=await first.dispatch(message);await first.settle();assert.equal(r.accepted,true);
 const second=boot(data,'network',counter);
 const recovered=await second.dispatch({type:'WB_GET_AUTO_RECOVERY',conversation_key:key,run_id:'fixture-run'});await second.settle();
 assert.equal(recovered.ok,true);assert.equal(recovered.recovery.type,'deliver_claimed');
 assert.equal(recovered.recovery.outgoing_text,r.outgoing_text);assert.equal(counter.calls,1);
 const duplicate=await second.dispatch(message);await second.settle();assert.equal(duplicate.accepted,false);assert.equal(counter.calls,1);
 return {worker_instances:2,provider_calls:1,report_restored_byte_equal:true};
});
await test('AUTORUN-UNKNOWN-OUTCOME-NEW-WORKER-ZERO-CALLS',async()=>{
 const data=fixture();data.wbmb_auto_runs[key].status='requesting';data.wbmb_auto_runs[key].request_worker_session_id='previous-worker-fixture';
 const w=boot(data);const r=await w.dispatch({type:'WB_GET_AUTO_RECOVERY',conversation_key:key,run_id:'fixture-run'});await w.settle();
 assert.equal(r.ok,true);assert.equal(r.recovery.code,'REQUEST_OUTCOME_UNKNOWN_NO_RETRY');assert.equal(data.wbmb_auto_runs[key].status,'error');assert.equal(w.count.calls,0);
});
for(const operation of ['subscriptions','unknown-alias'])await test('AUTORUN-BLOCKED-ALIAS:'+operation,async()=>{
 const w=boot(fixture());const r=await w.dispatch({...message,command_text:'WB_API_V1\n'+JSON.stringify({operation,params:{}})});await w.settle();
 assert.equal(r.accepted,false);assert.equal(w.count.calls,0);assert.equal(w.data.wbmb_auto_runs[key].status,'waiting_command');
});
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const summary={checks:rows.length,passed:rows.filter(x=>x.status==='PASS').length,failed:rows.filter(x=>x.status==='FAIL').length,real_wb_requests:0,scope:'actual worker message handler + contract/provider/transport; mocked Chrome and provider; not installed/live acceptance',worker_sha256:sha(path.join(root,'service_worker.js')),runner_sha256:sha(new URL(import.meta.url))};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');fs.closeSync(fd);console.log(JSON.stringify(summary,null,2));if(summary.failed)process.exitCode=1;
