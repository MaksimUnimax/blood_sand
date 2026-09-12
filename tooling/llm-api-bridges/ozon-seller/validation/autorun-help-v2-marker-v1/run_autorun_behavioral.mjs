import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const input=path.resolve(process.argv[2]||'.');
const dist=fs.existsSync(path.join(input,'content_script.js'))?input:path.join(input,'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const pre=process.argv.includes('--expect-red');
const raw=fs.readFileSync(path.join(dist,'content_script.js'),'utf8').replace(/\r\n/g,'\n');
const origin='https://chatgpt.com', conv='12345678-1234-4234-8234-123456789abc', key=`${origin}|${conv}`, tabId=77;
const copy=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const checkRows=[];
function passed(name,extra={}){checkRows.push({name,status:'PASS',...extra});console.log(name+'=PASS');}
function makeContent({source=raw,onSend=async()=>({ok:true,accepted:true,item_count:1}),noAdapter=false}={}){
  let time=10000, reads=0;
  const messages=[],calls=[],diagnostics=[],timers=new Map();let nextTimer=0;
  class FakeElement {
    constructor(){this.style={};this.children=[];this.id='';this.complete=true;this.text='';this.textContent='';this.isConnected=true;}
    setAttribute(){} addEventListener(){} removeEventListener(){} remove(){this.isConnected=false;}
    appendChild(x){this.children.push(x);return x;} insertBefore(x){this.children.unshift(x);return x;}
    get firstChild(){return this.children[0]||null;}
    querySelector(){return null;} querySelectorAll(){return [];} closest(){return null;}
  }
  const document={documentElement:new FakeElement(),body:new FakeElement(),querySelector(){return null;},querySelectorAll(){return [];},getElementById(){return null;},createElement(){return new FakeElement();},createTextNode(t){return {nodeType:3,nodeValue:t};},addEventListener(){}};
  const location={origin,pathname:`/c/${conv}`,href:`${origin}/c/${conv}`};
  const adapter={id:'chatgpt',assistantMessages:()=>messages,userMessages:()=>[],messageId:m=>m.id,messageText:m=>{reads++;return typeof m.text==='function'?m.text(reads):m.text;},messageComplete:m=>m.complete};
  class Clock extends Date {static now(){return time;}}
  const context=vm.createContext({console:{info(){},log(){},warn(){},error(){}},Date:Clock,TextEncoder,TextDecoder,URL,crypto:webcrypto,Element:FakeElement,HTMLElement:FakeElement,Node:{TEXT_NODE:3},document,location,window:{addEventListener(){},removeEventListener(){}},MutationObserver:class{observe(){}disconnect(){}},setTimeout:(f,d)=>{timers.set(++nextTimer,{f,d});return nextTimer;},clearTimeout:id=>timers.delete(id),setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},queueMicrotask,
    OzonAIAdapters:{adapterForLocation:()=>noAdapter?null:adapter},
    chrome:{runtime:{lastError:null,sendMessage(m,cb){if(m.type==='OZ_RECORD_DIAGNOSTIC'){diagnostics.push(m);cb({ok:true});return;}calls.push(copy(m));Promise.resolve(onSend(m)).then(cb);},onMessage:{addListener(){},removeListener(){}}}}
  });context.globalThis=context;
  for(const f of ['shared/conversation_identity.js','shared/runtime_names.js','shared/ozon_operation_registry.js','shared/ozon_contract.js'])vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),context,{filename:f});
  const anchor='  document.addEventListener("pointerdown",';
  assert.equal(source.split(anchor).length,2,'unique pre-initialization instrumentation anchor');
  // Only export lexical functions/state before DOM bootstrapping; function bodies remain exact production bytes.
  source=source.replace(anchor,`  globalThis.__autorunTest={beginAutoWatch,autoTick,candidateAfterAssistantBaseline,stopAutoWatch,identity:conversationIdentity,state:()=>({active:!!activeAutoWatch,firstSeen:autoFirstSeen,inFlight:autoTickInFlight,manual:manualEnabled}),setManual:()=>{manualEnabled=true;},dispose:()=>{runtime.disposed=true;}};\n  return;\n${anchor}`);
  vm.runInContext(source,context,{filename:'exact-content-script-with-test-export.js'});
  const t=context.__autorunTest;
  const watch={run_id:'run-'+webcrypto.randomUUID(),watch_id:'watch-'+webcrypto.randomUUID(),origin,conversation_id:conv,conversation_key:key,assistant_baseline_ids:['old']};
  function add(text,complete=true,id='new-'+webcrypto.randomUUID()){const e=new FakeElement();e.id=id;e.text=text;e.complete=complete;messages.push(e);return e;}
  return {context,t,watch,location,messages,calls,diagnostics,timers,add,resetReads(){reads=0;},get reads(){return reads;},async tick(ms=0){time+=ms;await t.autoTick();},async accept(){assert.equal(t.beginAutoWatch(watch),true);await t.autoTick();time+=2001;await t.autoTick();},readyCalls:()=>calls.filter(x=>x.type==='OZ_AUTO_MESSAGE_READY')};
}
const help=c=>`OZON_HELP_V2\n${JSON.stringify({cluster:c})}`;
const single=help('stocks_inventory'),triple=['catalog_products','stocks_inventory','finance'].map(help).join('\n\n');
const api='OZON_API_V1\n{"operation":"seller_product_list","params":{"filter":{},"limit":1}}';
const v1='OZON_HELP_V1\n{"cluster":"stocks_inventory"}';
for(const [name,text,helpOnly] of [['HELP_V2_SINGLE',single,true],['HELP_V2_TRIPLE',triple,true],['HELP_V2_API_MIXED',single+'\n'+api,false],['API_V1',api,false],['HELP_V1',v1,false]]){
 const c=makeContent();c.add(text);await c.accept();
 const expected=pre&&helpOnly?0:1;
 assert.equal(c.readyCalls().length,expected,name+' actual worker handoff count');
 if(expected){assert.equal(c.readyCalls()[0].assistant_text,text);assert.equal(c.t.state().active,false);await c.tick(5000);assert.equal(c.readyCalls().length,1);}
 else {assert.equal(c.t.state().firstSeen,null);assert.equal(c.t.state().active,true);assert.equal(c.diagnostics.filter(x=>x.event==='PROMPT_CANDIDATE_STABILITY_STARTED').length,0);}
 passed((pre?'PREFX_':'POSTFIX_')+name,{handoffs:expected});
}
if(pre){
 // Prove the independent second failing guard: fix first scan in memory only and execute actual autoTick.
 const source=raw.replace('const hasMarker = messageText.includes(OzonContract.PREFIX) || messageText.includes(OzonRuntime.RUNTIME.helpPrefix);','const hasMarker = messageText.includes(OzonContract.PREFIX) || messageText.includes(OzonRuntime.RUNTIME.helpPrefix) || messageText.includes(OzonRuntime.RUNTIME.helpPrefixV2);');
 assert.notEqual(source,raw,'baseline first guard exists');
 const c=makeContent({source});c.add(single);await c.accept();assert.equal(c.readyCalls().length,0);assert.equal(c.diagnostics.filter(x=>x.event==='PROMPT_CANDIDATE_STABILITY_STARTED').length,1);passed('PREFX_SECOND_GUARD_INDEPENDENTLY_BLOCKS_HELP_V2');
 console.log('PREFX_BEHAVIORAL_RED_REPRODUCED=PASS');process.exit(0);
}
for(const [name,text] of [['PLAIN_TEXT','Обычный ответ'],['RESULT_ONLY','OZON_GUIDANCE_RESULT_V2\n{}'],['PARTIAL_HELP_TOKEN','OZON_HELP_V'],['NO_MESSAGE',null]]){
 const c=makeContent();if(text!==null)c.add(text);await c.accept();assert.equal(c.readyCalls().length,0);passed(name+'_NO_ADMISSION');
}
{
 const c=makeContent();const m=c.add(single,false);await c.accept();assert.equal(c.readyCalls().length,0);m.complete=true;await c.tick();assert.equal(c.readyCalls().length,0);await c.tick(1999);assert.equal(c.readyCalls().length,0);await c.tick(2);assert.equal(c.readyCalls().length,1);passed('STREAMING_AND_2000MS_STABILITY_GUARD');
}
{
 const c=makeContent();c.add(single,true,'old');await c.accept();assert.equal(c.readyCalls().length,0);passed('BASELINE_ASSISTANT_NOT_REPLAYED');
}
{
 const c=makeContent();c.add(single);c.add('newer plain text');await c.accept();assert.equal(c.readyCalls().length,0);passed('ONLY_LATEST_NEW_ASSISTANT_IS_CANDIDATE');
}
for(const [name,mutate] of [['WRONG_CONVERSATION',c=>{c.location.pathname='/c/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';}],['WRONG_ORIGIN',c=>{c.location.origin='https://example.invalid';}],['UNCONFIRMED_ROOT',c=>{c.location.pathname='/';}],['WRONG_WATCH_KEY',c=>{c.watch.conversation_key+='wrong';}]]){
 const c=makeContent();c.add(single);mutate(c);assert.equal(c.t.beginAutoWatch(c.watch),false);await c.tick(3000);assert.equal(c.readyCalls().length,0);passed(name+'_BLOCKED');
}
{
 const c=makeContent();c.add(single);assert(c.t.beginAutoWatch(c.watch));await c.tick();c.location.pathname='/c/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';await c.tick(2001);assert.equal(c.readyCalls().length,0);assert.equal(c.t.state().active,false);passed('SPA_CHANGE_DURING_STABILITY_STOPS_WATCH');
}
{
 const c=makeContent();const m=c.add(single);assert(c.t.beginAutoWatch(c.watch));await c.tick();m.text=help('finance');await c.tick(2001);assert.equal(c.readyCalls().length,0);await c.tick(2001);assert.equal(c.readyCalls().length,1);assert.equal(c.readyCalls()[0].assistant_text,m.text);passed('CHANGED_FINGERPRINT_RESTARTS_STABILITY');
}
for(const [name,recheckText] of [['REMOVED_MARKER','ordinary answer'],['CHANGED_TEXT',help('finance')]]){
 const c=makeContent();c.add(n=>n<3?single:recheckText);await c.accept();assert.equal(c.readyCalls().length,0);passed('FINAL_RECHECK_'+name+'_BLOCKED');
}
{
 const c=makeContent();const m=c.add(single);assert(c.t.beginAutoWatch(c.watch));await c.tick();let reads=0;const adapter=c.context.OzonAIAdapters.adapterForLocation();adapter.messageComplete=()=>++reads===1;await c.tick(2001);assert.equal(c.readyCalls().length,0);passed('FINAL_RECHECK_COMPLETENESS_BLOCKED');
}
{
 const c=makeContent();c.add(single);c.t.setManual();assert(c.t.beginAutoWatch(c.watch));assert.equal(c.t.state().manual,false);passed('AUTORUN_DISABLES_MANUAL_MODE');
}
{
 const c=makeContent();c.add(single);assert(c.t.beginAutoWatch(c.watch));await c.tick();c.t.dispose();await c.tick(2001);assert.equal(c.readyCalls().length,0);passed('DISPOSED_CONTENT_CANNOT_ADMIT');
}
{
 const c=makeContent();c.add(single);assert(c.t.beginAutoWatch(c.watch));await c.tick();await Promise.all([c.tick(2001),c.tick()]);assert.equal(c.readyCalls().length,1);passed('CONCURRENT_TICKS_SINGLE_HANDOFF');
}

function area(backing,decode=copy){return {async get(keys){if(keys==null)return decode(backing);if(typeof keys==='string')keys=[keys];const out={};for(const k of Array.isArray(keys)?keys:Object.keys(keys)){if(k in backing)out[k]=copy(backing[k]);else if(!Array.isArray(keys))out[k]=copy(keys[k]);}return decode(out);},async set(x){Object.assign(backing,copy(x));},async remove(keys){for(const k of typeof keys==='string'?[keys]:keys)delete backing[k];}};}
function seededStore(runId){const binding={binding_id:'fixture-binding-'+webcrypto.randomUUID(),revision:1,origin,conversation_id:conv,conversation_key:key,ai_id:'chatgpt'};return {ozmb_conversation_bindings:{[key]:binding},ozmb_auto_runs:{[key]:{run_id:runId,tab_id:tabId,origin,conversation_id:conv,conversation_key:key,ai_id:'chatgpt',binding_snapshot:copy(binding),status:'waiting_command',assistant_baseline_ids:['old'],watch_id:'fixture-watch-'+webcrypto.randomUUID(),sequence:0,guidance_rounds:0}},ozmb_seller_client_id:'123456',ozmb_seller_api_key:'fixture-only-not-a-credential',ozmb_personal_data_enabled_v1:false};}
function makeWorker(store,{identity={status:'confirmed',origin,conversation_id:conv,ai_id:'chatgpt'},sessionStore={}}={}){
 let intoRealm=copy;
 const listeners=[],requests=[],pushes=[];
 const event={addListener(){},removeListener(){}};
 const chrome={runtime:{onMessage:{addListener(f){listeners.push(f);}},onInstalled:event,lastError:null},storage:{local:area(store,x=>intoRealm(x)),session:area(sessionStore,x=>intoRealm(x)),onChanged:event},tabs:{async get(id){return {id,url:`${origin}/c/${conv}`};},sendMessage(id,m,cb){pushes.push(copy(m));queueMicrotask(()=>cb(m.type==='OZ_GET_IDENTITY'?{ok:true,identity}:{ok:true}));},async query(){return [];},onRemoved:event},alarms:{onAlarm:event,async create(){},async clear(){return true;}},action:{async setBadgeText(){},async setBadgeBackgroundColor(){}}};
 const context=vm.createContext({console:{info(){},log(){},warn(){},error(){}},chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,Headers,Request,Response,structuredClone,atob,btoa,queueMicrotask,setTimeout:(f,d)=>{const t=setTimeout(f,d);t.unref();return t;},clearTimeout,setInterval:(f,d)=>{const t=setInterval(f,d);t.unref();return t;},clearInterval,fetch:async(url,init)=>{requests.push({url:String(url),body:init?.body});assert.equal(String(url),'https://api-seller.ozon.ru/v3/product/list','only fixture-approved API endpoint');return new Response(JSON.stringify({result:{items:[],total:0,last_id:''}}),{status:200,headers:{'content-type':'application/json'}});}});context.globalThis=context;context.self=context;
 intoRealm=x=>x===undefined?undefined:vm.runInContext("JSON.parse",context)(JSON.stringify(x));
 const loaded=new Set();function load(rel){if(loaded.has(rel))return;loaded.add(rel);vm.runInContext(fs.readFileSync(path.join(dist,rel),'utf8'),context,{filename:rel});}
 context.importScripts=(...files)=>files.forEach(load);
 load('shared/ai_delivery_capabilities.js');load('shared/mixed_batch_discovery.js');load('service_worker.js');load('shared/llm_output_report_workflow_patch.js');load('shared/file_delivery_model_policy.js');
 const listener=listeners.at(-1);assert(listener,'actual worker runtime listener');
 function invoke(message,sender={tab:{id:tabId,url:`${origin}/c/${conv}`}}){return new Promise((resolve,reject)=>{let settled=false;const done=v=>{if(!settled){settled=true;clearTimeout(timer);resolve(v);}};const timer=setTimeout(()=>reject(new Error('worker timeout '+message.type)),2000);try{const result=listener(intoRealm(message),intoRealm(sender),done);if(result!==true)queueMicrotask(()=>done(undefined));}catch(e){clearTimeout(timer);reject(e);}});}
 return {context,invoke,requests,pushes,store,sessionStore,run:()=>store.ozmb_auto_runs?.[key]};
}
async function until(fn,label){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw new Error(label);}
for(const [name,text,expectedKinds,expectedRequests] of [['SINGLE',single,['guidance'],0],['TRIPLE',triple,['guidance','guidance','guidance'],0],['MIXED',single+'\n'+api,['guidance','command'],1],['API_THEN_HELP',api+'\n'+single,['command','guidance'],1],['MALFORMED_HELP_THEN_VALID','OZON_HELP_V2 nope\n'+single,['guidance','guidance'],0]]){
 const runId='fixture-run-'+webcrypto.randomUUID(),store=seededStore(runId),beforeRecreation=makeWorker(store),w=makeWorker(store,{sessionStore:beforeRecreation.sessionStore});
 assert.equal(beforeRecreation.requests.length,0);
 const c=makeContent({onSend:m=>w.invoke(m)});c.watch.run_id=runId;c.watch.watch_id=w.run().watch_id;c.add(text);await c.accept();assert.equal(c.readyCalls().length,1);
 try { await until(()=>w.run()?.status==='delivering','complete actual worker queue '+name); } catch(e) { console.error(JSON.stringify({state:w.run(),diagnostics:store.ozmb_diagnostics,requests:w.requests},null,2)); throw e; }
 assert.deepEqual(w.run().batch.entries.map(e=>e.kind),expectedKinds);assert(w.run().batch.entries.every(e=>e.status==='complete'));assert.equal(w.requests.length,expectedRequests);assert.equal(w.run().batch.next_index,expectedKinds.length);
 for(const e of w.run().batch.entries.filter(e=>e.kind==='guidance')){assert.equal(e.external_request_executed,false);assert.equal(e.http_status,0);assert.match(e.report_text,/OZON_GUIDANCE_RESULT_V2/);assert.match(e.report_text,/"physical_business_request_count": 0/);}
 const output=w.run().delivery.artifact_text||w.run().delivery.outgoing_text;assert.match(output,/OZON_BATCH_RESULT_V1/);assert.match(output,/OZON_LLM_INSTRUCTIONS_V1/);
 const header=JSON.parse(output.slice(output.indexOf('{'),output.indexOf('===== OZON RESULT')).trim());assert.equal(header.result_count,expectedKinds.length);assert.equal(header.query_planner.physical_business_request_count,expectedRequests);assert.equal(header.query_planner.logical_business_result_count,expectedRequests);
 for(const e of w.run().batch.entries.filter(e=>e.kind==='command')){assert.equal(e.http_status,200);assert.equal(e.external_request_executed,true);}
 const again=await w.invoke(c.readyCalls()[0]);assert.equal(again.accepted,false);assert.equal(w.requests.length,expectedRequests);
 passed('FULL_CONTENT_WORKER_QUEUE_OUTPUT_'+name,{provider_requests:0,fixture_transport_calls:expectedRequests});
 // Recreate the full worker with the durable stores: already admitted message cannot create a duplicate queue/request.
 const w2=makeWorker(store,{sessionStore:w.sessionStore});const duplicate=await w2.invoke(c.readyCalls()[0]);assert.equal(duplicate.accepted,false);assert.equal(w2.requests.length,0);assert.equal(w2.run().delivery.delivery_id,w.run().delivery.delivery_id);passed('WORKER_RECREATION_NO_DUPLICATE_'+name);
}
for(const [name,options,change] of [['WRONG_TAB',{},(_,m)=>({tab:{id:88,url:`${origin}/c/${conv}`}})],['WRONG_LIVE_CONVERSATION',{identity:{status:'confirmed',origin,conversation_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ai_id:'chatgpt'}},null],['MISSING_BINDING',{},s=>{delete s.ozmb_conversation_bindings;}],['MISSING_RUN',{},s=>{s.ozmb_auto_runs={};}],['MANUAL_MODE',{},s=>{s.ozmb_manual_modes={[key]:true};}]]){
 const rid='fixture-'+webcrypto.randomUUID(),store=seededStore(rid);let sender;if(change)sender=change(store);const w=makeWorker(store,options);const r=await w.invoke({type:'OZ_AUTO_MESSAGE_READY',run_id:rid,conversation_key:key,assistant_turn_id:'fixture-turn-'+webcrypto.randomUUID(),assistant_text:single},sender);assert.notEqual(r?.accepted,true,name+JSON.stringify(r));assert.equal(w.requests.length,0);passed('WORKER_'+name+'_FAIL_CLOSED',{code:r?.code});
}
console.log('AUTORUN_FULL_BEHAVIORAL_PASS');
console.log('BEHAVIORAL_CASE_COUNT='+checkRows.length);
console.log('provider_calls_during_test=0');
if(process.env.OZON_TEST_REPORT)fs.writeFileSync(process.env.OZON_TEST_REPORT,JSON.stringify({cases:checkRows,provider_calls:0,scope:'actual content functions and full worker runtime; deterministic DOM/Chrome transport boundaries; not live AI'},null,2)+'\n');
