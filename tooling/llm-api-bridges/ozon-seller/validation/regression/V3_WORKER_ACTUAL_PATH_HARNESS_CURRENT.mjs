import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';

// Restored from historical executable blob 0da73bdd1bb1608074781bb0c594c7875a4fe3ce.
// Only exact current-candidate SHA pins were updated; behavioral assertions are unchanged.
const EXPECTED_WORKER = 'dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT = 'ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const candidateDir = path.resolve(process.argv[2] || '');
if (!candidateDir || !fs.existsSync(path.join(candidateDir, 'service_worker.js'))) {
  throw new Error('usage: node V3_WORKER_ACTUAL_PATH_HARNESS_CURRENT.mjs <exact-current-candidate-dir>');
}
const sha256 = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert = (value, message) => { if (!value) throw new Error(message); };
assert(sha256(path.join(candidateDir,'service_worker.js')) === EXPECTED_WORKER, 'worker SHA mismatch');
assert(sha256(path.join(candidateDir,'content_script.js')) === EXPECTED_CONTENT, 'content SHA mismatch');

const local = new Map();
const session = new Map();
const runtimeListeners=[]; const alarmListeners=[]; const startupListeners=[]; const installedListeners=[]; const removedListeners=[];
const tabIdentities = new Map();
const alarmsCreated=[];
let providerCalls=[];
let fetchMode='429-retry120';

function clone(v){ return v === undefined ? undefined : structuredClone(v); }
function storageGet(map, keys){
  const out={};
  if (keys == null) { for (const [k,v] of map) out[k]=clone(v); return Promise.resolve(out); }
  if (typeof keys==='string') keys=[keys];
  if (Array.isArray(keys)) { for (const k of keys) if (map.has(k)) out[k]=clone(map.get(k)); }
  else if (typeof keys==='object') for (const [k,d] of Object.entries(keys)) out[k]=map.has(k)?clone(map.get(k)):clone(d);
  return Promise.resolve(out);
}
function storageSet(map, values){ for(const [k,v] of Object.entries(values||{})) map.set(k,clone(v)); return Promise.resolve(); }
function storageRemove(map, keys){ if(!Array.isArray(keys)) keys=[keys]; for(const k of keys) map.delete(k); return Promise.resolve(); }
function storageClear(map){ map.clear(); return Promise.resolve(); }

const chrome={
  runtime:{
    id:'v3-worker-harness', lastError:null,
    onMessage:{addListener(fn){runtimeListeners.push(fn)}},
    onStartup:{addListener(fn){startupListeners.push(fn)}},
    onInstalled:{addListener(fn){installedListeners.push(fn)}}
  },
  storage:{
    local:{get:(k)=>storageGet(local,k),set:(v)=>storageSet(local,v),remove:(k)=>storageRemove(local,k),clear:()=>storageClear(local)},
    session:{get:(k)=>storageGet(session,k),set:(v)=>storageSet(session,v),remove:(k)=>storageRemove(session,k),clear:()=>storageClear(session)}
  },
  tabs:{
    get:async(id)=>({id,url:tabIdentities.get(id)?.origin ? tabIdentities.get(id).origin+'/' : 'https://chatgpt.com/'}),
    query:async()=>[],
    sendMessage(id,msg,cb){
      const response = msg?.type==='OZ_GET_IDENTITY' ? {ok:true,identity:clone(tabIdentities.get(id))} : {ok:true};
      if (typeof cb==='function') queueMicrotask(()=>cb(response)); else return Promise.resolve(response);
    },
    onRemoved:{addListener(fn){removedListeners.push(fn)}}
  },
  alarms:{
    create(name,info){alarmsCreated.push({name,info:clone(info)});},
    clear:async()=>true, get:async()=>null, getAll:async()=>[],
    onAlarm:{addListener(fn){alarmListeners.push(fn)}}
  }
};

async function fakeFetch(input, init={}){
  const url = typeof input === 'string' ? input : String(input?.url || input);
  if (/api-(?:seller|performance)\.ozon\.ru/i.test(url)) providerCalls.push({url,method:String(init?.method||input?.method||'GET').toUpperCase(),at:Date.now()});
  else throw new Error(`UNEXPECTED_NETWORK:${url}`);
  if (fetchMode === '429-retry120') {
    return new Response(JSON.stringify({code:8,message:'rate limit'}), {status:429,headers:{'content-type':'application/json','retry-after':'120'}});
  }
  if (fetchMode === '429-no-retry-after') {
    return new Response(JSON.stringify({code:8,message:'rate limit'}), {status:429,headers:{'content-type':'application/json'}});
  }
  throw new Error(`unsupported fetchMode ${fetchMode}`);
}

const sandbox={
  console, chrome, crypto:webcrypto, TextEncoder, TextDecoder, URL, URLSearchParams,
  setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, structuredClone,
  fetch:fakeFetch, AbortController, Headers, Response, Request, FormData, Blob
};
sandbox.globalThis=sandbox; sandbox.self=sandbox;
const context=vm.createContext(sandbox);
sandbox.importScripts=(...names)=>{ for(const name of names){ const p=path.join(candidateDir,name); vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p}); } };
vm.runInContext(fs.readFileSync(path.join(candidateDir,'service_worker.js'),'utf8'),context,{filename:'service_worker.js'});
assert(runtimeListeners.length===1,'expected exactly one runtime message listener');
const KEYS=context.OzonRuntime.STORAGE_KEYS;

async function send(message,sender={tab:{id:1}}){
  return await new Promise((resolve,reject)=>{
    let settled=false;
    const timer=setTimeout(()=>{if(!settled){settled=true;reject(new Error(`runtime timeout: ${message.type}`));}},5000);
    const ret=runtimeListeners[0](message,sender,(response)=>{if(settled)return;settled=true;clearTimeout(timer);resolve(response);});
    if(ret!==true && !settled){settled=true;clearTimeout(timer);resolve(undefined);}
  });
}
async function waitFor(fn, timeout=5000, step=20){
  const start=Date.now();
  while(Date.now()-start<timeout){ const v=await fn(); if(v) return v; await new Promise(r=>setTimeout(r,step)); }
  throw new Error('waitFor timeout');
}
function binding(origin,id,bindingId){ const key=`${origin}|${id}`; return {key,record:{binding_id:bindingId,revision:1,origin,ai_id:origin.includes('alice')?'alice':'chatgpt',conversation_id:id,conversation_key:key,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()}}; }
function identity(origin,id){ return {origin,ai_id:origin.includes('alice')?'alice':'chatgpt',conversation_id:id,status:'confirmed',source:'path',chat_path:`/${origin.includes('alice')?'chat':'c'}/${id}`}; }
function waitRecord(due, secrets=true){ return {family:'seller.analytics_data.v1',min_interval_ms:60000,bridge_launch_safety_ms:5000,effective_interval_ms:65000,next_allowed_at:due,queue_index:0,waiting_since:new Date().toISOString(),automatic_retry:false,...(secrets?{account_hash:'SECRET_ACCOUNT_HASH',credential_revision:'SECRET_CREDENTIAL_REVISION',credential_scope_id:'SECRET_SCOPE'}:{})}; }
async function reset(){ await chrome.storage.local.clear(); await chrome.storage.session.clear(); providerCalls=[]; alarmsCreated.length=0; }

// 1) Actual OZ_GET_MANUAL_STATE + privacy.
await reset();
const id1='11111111-1111-4111-8111-111111111111'; const origin1='https://chatgpt.com'; const b1=binding(origin1,id1,'bind-manual');
tabIdentities.set(1,identity(origin1,id1));
await chrome.storage.local.set({
  [KEYS.CONVERSATION_BINDINGS]:{[b1.key]:b1.record},
  [KEYS.MANUAL_MODES]:{[b1.key]:true},
  [KEYS.MANUAL_OPERATIONS]:{[b1.key]:{operation_id:'manual-op',manual_request_id:'manual-req',status:'requesting',tab_id:1,conversation_id:id1,conversation_key:b1.key,binding_snapshot:{binding_id:b1.record.binding_id,binding_revision:1,origin:origin1,ai_id:'chatgpt',conversation_id:id1,conversation_key:b1.key},batch:{request_state:'quota_waiting',next_index:0,entries:[],quota_wait:waitRecord(Date.now()+30000,true)}}}
});
const manualState=await send({type:'OZ_GET_MANUAL_STATE',conversation_key:b1.key},{tab:{id:1}});
assert(manualState?.ok===true && manualState.bound===true && manualState.manual_operation_active===true,'manual public state path failed');
const mw=manualState?.manual_operation?.quota_wait;
assert(mw && mw.family==='seller.analytics_data.v1' && mw.min_interval_ms===60000 && mw.bridge_launch_safety_ms===5000 && mw.effective_interval_ms===65000 && mw.automatic_retry===false,'manual quota_wait public metadata mismatch');
for(const secret of ['SECRET_ACCOUNT_HASH','SECRET_CREDENTIAL_REVISION','SECRET_SCOPE']) assert(!JSON.stringify(manualState).includes(secret),`manual public state leaked ${secret}`);
console.log('V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS');

// 2) Actual OZ_CONTENT_SYNC autorun public quota_wait + privacy.
await reset();
const id2='22222222-2222-4222-8222-222222222222'; const origin2='https://chatgpt.com'; const b2=binding(origin2,id2,'bind-auto');
tabIdentities.set(2,identity(origin2,id2));
const autoWait=waitRecord(Date.now()+40000,true);
const run={run_id:'run-paused',status:'paused',tab_id:2,conversation_id:id2,conversation_key:b2.key,origin:origin2,binding_snapshot:{binding_id:b2.record.binding_id,binding_revision:1,origin:origin2,ai_id:'chatgpt',conversation_id:id2,conversation_key:b2.key},sequence:1,pause_requested:false,finish_requested:false,batch:{request_state:'quota_waiting',next_index:0,entries:[],quota_wait:autoWait}};
await chrome.storage.local.set({[KEYS.CONVERSATION_BINDINGS]:{[b2.key]:b2.record},[KEYS.AUTO_RUNS]:{[b2.key]:run}});
const autoState=await send({type:'OZ_CONTENT_SYNC',identity:identity(origin2,id2)},{tab:{id:2}});
assert(autoState?.ok===true && autoState?.auto_run?.quota_wait,'autorun public state path failed');
assert(autoState.auto_run.quota_wait.bridge_launch_safety_ms===5000 && autoState.auto_run.quota_wait.effective_interval_ms===65000,'autorun quota metadata mismatch');
for(const secret of ['SECRET_ACCOUNT_HASH','SECRET_CREDENTIAL_REVISION','SECRET_SCOPE']) assert(!JSON.stringify(autoState).includes(secret),`autorun public state leaked ${secret}`);
console.log('V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS');
console.log('V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS');

// Shared setup for actual manual provider tests.
const sellerClient='HARNESS_CLIENT_ID'; const sellerKey='HARNESS_API_KEY';
async function seedManual(id,tab,origin='https://chatgpt.com'){
  const b=binding(origin,id,`bind-${id}`); tabIdentities.set(tab,identity(origin,id));
  await chrome.storage.local.set({
    [KEYS.CONVERSATION_BINDINGS]:{[b.key]:b.record},
    [KEYS.MANUAL_MODES]:{[b.key]:true},
    [KEYS.SELLER_CLIENT_ID]:sellerClient,[KEYS.SELLER_API_KEY]:sellerKey,[KEYS.AUTO_SEND]:true,
    [KEYS.MANUAL_OPERATIONS]:{}
  });
  return b.key;
}
const command='OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}}';

// 3) Actual incompatible cache miss -> durable guarded wait -> one provider call at/after due.
await reset(); fetchMode='429-no-retry-after';
const id3='33333333-3333-4333-8333-333333333333'; const key3=await seedManual(id3,3);
const qIdentity=await vm.runInContext(`sellerQuotaIdentity({clientId:${JSON.stringify(sellerClient)},apiKey:${JSON.stringify(sellerKey)}})`,context);
const now=Date.now(); const last=now-64800; const due=last+65000;
await chrome.storage.local.set({
  [KEYS.PROVIDER_RESULT_CACHE]:{schema_version:1,accounts:{}},
  [KEYS.PROVIDER_QUOTA_STATE]:{schema_version:1,accounts:{[qIdentity.account_hash]:{credential_revision:qIdentity.credential_revision,families:{'seller.analytics_data.v1':{min_interval_ms:60000,last_provider_request_at:last,next_allowed_at:last+60000,credential_revision:qIdentity.credential_revision,updated_at:new Date(last).toISOString()}}}}}
});
const admitted=await send({type:'OZ_EXECUTE_COMMAND',command_text:command,conversation_key:key3,manual_request_id:'guarded-miss'},{tab:{id:3}});
assert(admitted?.ok===true && admitted?.accepted===true,'guarded miss batch not admitted');
const waiting=await waitFor(async()=>{const x=(await chrome.storage.local.get(KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key3]; return x?.batch?.request_state==='quota_waiting'?x:null;},3000);
assert(providerCalls.length===0,'provider called before guarded due');
assert(Number(waiting.batch.quota_wait.next_allowed_at)>=due,'guarded due was shortened');
await new Promise(r=>setTimeout(r,Math.max(0,due-Date.now()+30)));
for(const fn of alarmListeners) await fn({name:'ozon-provider-quota-wake-v1',scheduledTime:Date.now()});
await waitFor(()=>providerCalls.length===1,3000);
assert(providerCalls[0].at>=due-5,'provider dispatched before guarded due');
await new Promise(r=>setTimeout(r,250));
assert(providerCalls.length===1,'guarded resume created duplicate provider call');
console.log('V3B_INCOMPATIBLE_CACHE_MISS_GUARDED_WAIT_PASS');
console.log('V3B_GUARDED_DUE_ONE_PROVIDER_CALL_PASS');

// 4) Fresh actual mocked 429 -> one provider call, no immediate/alarm/startup replay, Retry-After extension-only.
await reset(); fetchMode='429-retry120';
const id4='44444444-4444-4444-8444-444444444444'; const key4=await seedManual(id4,4);
const accepted429=await send({type:'OZ_EXECUTE_COMMAND',command_text:command,conversation_key:key4,manual_request_id:'one-429'},{tab:{id:4}});
assert(accepted429?.ok===true && accepted429?.accepted===true,'429 batch not admitted');
await waitFor(()=>providerCalls.length===1,3000);
await new Promise(r=>setTimeout(r,400));
assert(providerCalls.length===1,'immediate retry detected after 429');
const quotaAfter=(await chrome.storage.local.get(KEYS.PROVIDER_QUOTA_STATE))[KEYS.PROVIDER_QUOTA_STATE];
const family=Object.values(quotaAfter?.accounts||{})[0]?.families?.['seller.analytics_data.v1'];
assert(family && Number(family.next_allowed_at)>Number(family.last_provider_request_at)+65000,'Retry-After did not extend guarded boundary');
for(const fn of alarmListeners) await fn({name:'ozon-provider-quota-wake-v1',scheduledTime:Date.now()});
await new Promise(r=>setTimeout(r,150));
assert(providerCalls.length===1,'alarm replay detected after 429');
for(const fn of startupListeners) await fn();
try { await vm.runInContext('typeof resumeProviderQuotaWaits === "function" ? resumeProviderQuotaWaits() : Promise.resolve()',context); } catch (_) {}
await new Promise(r=>setTimeout(r,150));
assert(providerCalls.length===1,'startup replay detected after 429');
console.log('V3B_ONE_429_ONE_PROVIDER_CALL_PASS');
console.log('V3B_ZERO_IMMEDIATE_RETRY_PASS');
console.log('V3B_ZERO_ALARM_REPLAY_PASS');
console.log('V3B_ZERO_STARTUP_REPLAY_PASS');
console.log('V3B_RETRY_AFTER_EXTENSION_ONLY_PASS');

assert(providerCalls.every(x=>/api-seller\.ozon\.ru/i.test(x.url)),'unexpected Performance/provider host');
console.log('REAL_OZON_REQUESTS=0');
console.log('REAL_PERFORMANCE_REQUESTS=0');
console.log('V3_WORKER_ACTUAL_PATH_HARNESS_PASS');
