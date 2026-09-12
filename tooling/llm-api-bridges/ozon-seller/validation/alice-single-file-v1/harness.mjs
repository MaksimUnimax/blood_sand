import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
export const copy=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
export const CONV='11111111-2222-4333-8444-555555555555';
export function makeIdb(records=new Map(),faults={}) {
 return {open(){if(faults.open)throw Error('fixture IDB unavailable');const q={};queueMicrotask(()=>{q.result={objectStoreNames:{contains(){return true;}},close(){},transaction(){const tx={};tx.objectStore=()=>({get:k=>req(()=>structuredClone(records.get(k))),getAll:()=>req(()=>[...records.values()].map(x=>structuredClone(x))),put:v=>req(()=>{if(faults.put)throw Error('fixture abort');records.set(v.artifact_key,structuredClone(v));return v.artifact_key;}),delete:k=>req(()=>records.delete(k))});function req(fn){const r={};queueMicrotask(()=>{try{r.result=fn();r.onsuccess?.();queueMicrotask(()=>tx.oncomplete?.());}catch(e){r.error=e;r.onerror?.();tx.error=e;tx.onabort?.();}});return r;}return tx;}};q.onsuccess?.();});return q;}};
}
export function runtime(dist,{adapter='alice',store={},sessionStore={},artifacts=new Map(),clock={now:Date.parse('2026-09-12T12:00:00Z')},faults={},fetchImpl}={}) {
 const origin=adapter==='alice'?'https://alice.yandex.ru':'https://chatgpt.com',key=origin+'|'+CONV,tabId=41;
 let into=copy;const listeners=[],connects=[],requests=[],pushes=[];const event={addListener(){},removeListener(){}};
 const area=backing=>({async get(keys){const out={};for(const k of Array.isArray(keys)?keys:typeof keys==='string'?[keys]:Object.keys(backing))out[k]=backing[k];return into(out);},async set(values){Object.assign(backing,copy(values));},async remove(keys){for(const k of Array.isArray(keys)?keys:[keys])delete backing[k];}});
 const identity={status:'confirmed',origin,conversation_id:CONV,ai_id:adapter};
 const chrome={runtime:{onMessage:{addListener(f){listeners.push(f);}},onConnect:{addListener(f){connects.push(f);}},onInstalled:event,lastError:null},storage:{local:area(store),session:area(sessionStore),onChanged:event},tabs:{async get(id){return{id,url:origin+(adapter==='alice'?'/chat/':'/c/')+CONV};},sendMessage(id,m,cb){pushes.push(copy(m));if(cb)queueMicrotask(()=>cb(m.type==='OZ_GET_IDENTITY'?{ok:true,identity}:{ok:true}));return Promise.resolve({ok:true});},async query(){return[];},onRemoved:event},alarms:{onAlarm:event,async create(){},async clear(){return true;}},action:{async setBadgeText(){},async setBadgeBackgroundColor(){}}};
 const quiet={info(){},log(){},warn(){},error(){},debug(){}};
 const context=vm.createContext({console:quiet,chrome,indexedDB:makeIdb(artifacts,faults),crypto:webcrypto,TextEncoder,TextDecoder,URL,Headers,Request,Response,Uint8Array,ArrayBuffer,structuredClone,atob,btoa,queueMicrotask,setTimeout:(f,d)=>{const t=setTimeout(f,d);t.unref();return t;},clearTimeout,setInterval:(f,d)=>{const t=setInterval(f,d);t.unref();return t;},clearInterval,Date:class extends Date{constructor(...a){super(...(a.length?a:[clock.now]));}static now(){return clock.now;}},fetch:async(url,init)=>{requests.push({url:String(url),body:init?.body,headers:init?.headers});if(!fetchImpl)throw Error('unexpected fixture fetch '+url);return fetchImpl(url,init);}});context.globalThis=context;context.self=context;
 into=x=>x===undefined?undefined:vm.runInContext('JSON.parse',context)(JSON.stringify(x));
 const loaded=new Set();function load(rel){if(loaded.has(rel))return;loaded.add(rel);vm.runInContext(fs.readFileSync(path.join(dist,rel),'utf8'),context,{filename:rel});}
 context.importScripts=(...paths)=>paths.forEach(load);load('service_worker_entry.js');
 function seed(kind='manual') {
  store.ozmb_seller_client_id='123456';store.ozmb_seller_api_key='fixture-only';store.ozmb_personal_data_enabled_v1??=false;
  const binding={binding_id:'binding-fixture',revision:1,origin,conversation_id:CONV,conversation_key:key,ai_id:adapter};store.ozmb_conversation_bindings={[key]:binding};
  if(kind==='manual'){store.ozmb_manual_modes={[key]:true};store.ozmb_work_sessions_v1={[key]:{state:'active_visible',revision:1,origin,conversation_id:CONV,conversation_key:key,ai_id:adapter,tab_id:tabId}};store.ozmb_auto_runs={};}
  else store.ozmb_auto_runs={[key]:{run_id:'run-fixture',tab_id:tabId,origin,conversation_id:CONV,conversation_key:key,ai_id:adapter,binding_snapshot:binding,status:'waiting_command',assistant_baseline_ids:['old'],watch_id:'watch-fixture',sequence:0,guidance_rounds:0}};
 }
 function sender(){return {url:origin+(adapter==='alice'?'/chat/':'/c/')+CONV,tab:{id:tabId,url:origin+(adapter==='alice'?'/chat/':'/c/')+CONV}};}
 const invoke=(message,who=sender())=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('worker timeout '+message.type)),3000);const done=x=>{clearTimeout(timer);resolve(copy(x));};try {const ret=listeners.at(-1)(into(message),into(who),done);if(ret!==true)queueMicrotask(()=>done(undefined));}catch(e){clearTimeout(timer);reject(e);}});
 async function port(type,payload={},who=sender()) {let listener;const responses=[];connects.at(-1)({name:'ozon-attachment-delivery-v1',sender:into(who),onMessage:{addListener(f){listener=f;}},onDisconnect:event,postMessage(x){responses.push(copy(x));}});listener(into({request_id:webcrypto.randomUUID(),type,live_owner:{origin,conversation_id:CONV},...payload}));await until(()=>responses.length,'port '+type);return responses[0].response;}
 const owner=(kind='manual')=>kind==='manual'?store.ozmb_manual_operations?.[key]:store.ozmb_auto_runs?.[key];
 async function batch(commands,kind='manual') {
  const source=commands.map(c=>c.help?'OZON_HELP_V2\n'+JSON.stringify(c.help):'OZON_API_V1\n'+JSON.stringify(c)).join('\n\n');
  if(kind==='manual'){const admitted=await invoke({type:'OZ_EXECUTE_COMMAND',command_text:source,conversation_key:key,manual_request_id:'fixture-'+webcrypto.randomUUID()});assert.equal(admitted?.accepted,true,JSON.stringify(admitted));}
  else { // Exercise the real queue using a durable owner, not a provider-only helper.
   const run=store.ozmb_auto_runs[key];run.batch={entries:copy(context.discoverBatchEntries(source)),next_index:0,request_state:'idle',policy_state:'pending',capability_state:'pending',query_planning_state:'pending'};run.status='collecting';await context.processAutoBatch(key,run.run_id);
  }
  await until(()=>['delivering','failed','error'].includes(owner(kind)?.status),'batch completion');assert.equal(owner(kind)?.status,'delivering',JSON.stringify(owner(kind)?.last_error));return copy(owner(kind));
 }
 function payload(o,kind='manual'){return {owner_kind:kind,owner_id:kind==='manual'?o.operation_id:o.run_id,conversation_key:key,delivery_id:o.delivery.delivery_id,actor_id:'fixture-actor'};}
 return {context,seed,batch,invoke,port,payload,owner,requests,pushes,origin,key,tabId,store,sessionStore,artifacts,clock,faults,into};
}
export async function until(fn,label){for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,5));}throw Error(label);}
export function seedFiles(w,refs=['rpf_s_00000000-0000-4000-8000-000000000001','rpf_s_00000000-0000-4000-8000-000000000002']) {w.sessionStore.ozmb_report_file_session_state_v1={schema_version:2,report_code_policies:{},report_file_refs:Object.fromEntries(refs.map((r,i)=>[r,{url:'https://files.ozon.ru/fixture-'+i+'.csv',personal_data_required:r.startsWith('rpf_p_'),created_at_ms:w.clock.now,expires_at_ms:w.clock.now+1800000,provider_expires_at_ms:w.clock.now+1800000}]))};}
export const file=(ref='rpf_s_00000000-0000-4000-8000-000000000001')=>({operation:'report_file_get',params:{file_ref:ref,offset:0,limit:200}});
export const info={operation:'report_info',params:{code:'REPORT_FIXTURE'}};
export const help={help:{cluster:'returns_cancellations',section:'returns'}};
export function provider(url,init) {if(String(url).includes('/v1/report/info'))return Promise.resolve(new Response(JSON.stringify({result:{code:JSON.parse(init.body).code,status:'processing',error:''}}),{headers:{'content-type':'application/json'}}));return Promise.resolve(new Response('sku;qty\n111;3\n',{headers:{'content-type':'text/csv'}}));}
