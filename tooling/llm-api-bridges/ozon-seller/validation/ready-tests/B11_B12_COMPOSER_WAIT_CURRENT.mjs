import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const candidateDir = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(candidateDir, 'service_worker.js'))) throw new Error('usage: node TARGETED_COMPOSER_WAIT_REGRESSION.mjs <candidate-dir>');
const assert = (v,m)=>{ if(!v) throw new Error(m); };
const clone = (v)=> v === undefined ? undefined : structuredClone(v);

function extractFunction(src,name){
  const patterns=[`async function ${name}(`,`function ${name}(`]; let at=-1;
  for(const p of patterns){at=src.indexOf(p); if(at>=0) break;}
  if(at<0) throw new Error(`function missing: ${name}`);
  const open=src.indexOf('{',at); let depth=0,quote=null,escape=false,line=false,block=false;
  for(let i=open;i<src.length;i++){
    const c=src[i],n=src[i+1];
    if(line){if(c==='\n')line=false;continue;} if(block){if(c==='*'&&n==='/'){block=false;i++;}continue;}
    if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote){quote=null;}continue;}
    if(c==='/'&&n==='/'){line=true;i++;continue;} if(c==='/'&&n==='*'){block=true;i++;continue;} if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++; else if(c==='}'){depth--; if(depth===0) return src.slice(at,i+1);}
  }
  throw new Error(`unterminated function: ${name}`);
}

// ---------- Worker: Manual OFF must cancel only a pre-insert pending manual delivery. ----------
const local = new Map(), session = new Map();
const runtimeListeners=[], alarmListeners=[], startupListeners=[], installedListeners=[], removedListeners=[];
let providerCalls=0;
function storageGet(map, keys){
  const out={}; if(keys==null){for(const[k,v]of map)out[k]=clone(v);return Promise.resolve(out);} if(typeof keys==='string')keys=[keys];
  if(Array.isArray(keys)){for(const k of keys)if(map.has(k))out[k]=clone(map.get(k));}
  else if(typeof keys==='object'){for(const[k,d]of Object.entries(keys))out[k]=map.has(k)?clone(map.get(k)):clone(d);}
  return Promise.resolve(out);
}
function storageSet(map, values){for(const[k,v]of Object.entries(values||{}))map.set(k,clone(v));return Promise.resolve();}
function storageRemove(map, keys){if(!Array.isArray(keys))keys=[keys];for(const k of keys)map.delete(k);return Promise.resolve();}
const tabIdentity={origin:'https://chatgpt.com',ai_id:'chatgpt',conversation_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',status:'confirmed',source:'path',chat_path:'/c/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
const chrome={
  runtime:{id:'targeted-regression',lastError:null,onMessage:{addListener:f=>runtimeListeners.push(f)},onStartup:{addListener:f=>startupListeners.push(f)},onInstalled:{addListener:f=>installedListeners.push(f)}},
  storage:{local:{get:k=>storageGet(local,k),set:v=>storageSet(local,v),remove:k=>storageRemove(local,k),clear:()=>{local.clear();return Promise.resolve();}},session:{get:k=>storageGet(session,k),set:v=>storageSet(session,v),remove:k=>storageRemove(session,k),clear:()=>{session.clear();return Promise.resolve();}}},
  tabs:{get:async(id)=>({id,url:'https://chatgpt.com/c/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}),query:async()=>[],sendMessage(id,msg,cb){const r=msg?.type==='OZ_GET_IDENTITY'?{ok:true,identity:clone(tabIdentity)}:{ok:true};if(cb)queueMicrotask(()=>cb(r));else return Promise.resolve(r);},onRemoved:{addListener:f=>removedListeners.push(f)}},
  alarms:{create(){},clear:async()=>true,get:async()=>null,getAll:async()=>[],onAlarm:{addListener:f=>alarmListeners.push(f)}}
};
async function fakeFetch(){providerCalls++; throw new Error('PROVIDER_CALL_FORBIDDEN');}
const sandbox={console,chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,structuredClone,fetch:fakeFetch,AbortController,Headers,Response,Request,FormData,Blob};
sandbox.globalThis=sandbox;sandbox.self=sandbox;
const context=vm.createContext(sandbox);
sandbox.importScripts=(...names)=>{for(const name of names){const p=path.join(candidateDir,name);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p});}};
vm.runInContext(fs.readFileSync(path.join(candidateDir,'service_worker.js'),'utf8'),context,{filename:'service_worker.js'});
assert(runtimeListeners.length===1,'expected one worker runtime listener');
async function send(message,sender={tab:{id:1}}){ return await new Promise((resolve,reject)=>{ let settled=false; const t=setTimeout(()=>{if(!settled){settled=true;reject(new Error(`runtime timeout: ${message.type}`));}},3000); const ret=runtimeListeners[0](message,sender,(response)=>{if(settled)return;settled=true;clearTimeout(t);resolve(response);}); if(ret!==true && !settled){settled=true;clearTimeout(t);resolve(undefined);} }); }
const KEYS=context.OzonRuntime.STORAGE_KEYS;
const conversationKey=`${tabIdentity.origin}|${tabIdentity.conversation_id}`;
const otherKey='https://chatgpt.com|bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const now=Date.now();
const QUOTA_STORAGE_KEY='ozmb_provider_quota_state_v1';
const CACHE_STORAGE_KEY='ozmb_provider_result_cache_v1';
const quotaState={schema_version:1,accounts:{acct:{credential_revision:'rev',families:{'seller.analytics_data.v1':{min_interval_ms:60000,bridge_launch_safety_ms:5000,effective_interval_ms:65000,last_provider_request_at:now-1000,next_allowed_at:now+64000,credential_revision:'rev',updated_at:new Date().toISOString()}}}}};
const cacheState={schema_version:1,accounts:{acct:{entries:{fingerprint:{stored_at:now-5000,expires_at:now+55000,payload:{ok:true}}}}}};
const pending={operation_id:'manual-op-pending',manual_request_id:'req-pending',status:'delivering',tab_id:1,conversation_id:tabIdentity.conversation_id,conversation_key:conversationKey,origin:tabIdentity.origin,binding_snapshot:{binding_id:'bind-a',binding_revision:1},delivery_id:'delivery-pending',outgoing_text:'REPORT',delivery:{delivery_id:'delivery-pending',mode:'batch_watch_v1',phase:'claimed',outgoing_text:'REPORT',report_prefix_applied:false,baseline_assistant_turn_ids:[]},batch:{phase:'collected',request_state:'idle',entries:[],next_index:0}};
const otherPending={...pending,operation_id:'manual-op-other',manual_request_id:'req-other',conversation_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',conversation_key:otherKey,tab_id:2,delivery_id:'delivery-other',delivery:{...pending.delivery,delivery_id:'delivery-other'}};
const otherAutorun={run_id:'auto-other',status:'waiting_command',tab_id:3,conversation_key:'https://chatgpt.com|cccccccc-cccc-4ccc-8ccc-cccccccccccc',conversation_id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'};
await chrome.storage.local.set({
  [KEYS.CONVERSATION_BINDINGS]:{[conversationKey]:{binding_id:'bind-a',revision:1,origin:tabIdentity.origin,ai_id:'chatgpt',conversation_id:tabIdentity.conversation_id,conversation_key:conversationKey,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()}},
  [KEYS.MANUAL_MODES]:{[conversationKey]:true,[otherKey]:true},
  [KEYS.MANUAL_OPERATIONS]:{[conversationKey]:pending,[otherKey]:otherPending},
  [KEYS.AUTO_RUNS]:{[otherAutorun.conversation_key]:otherAutorun},
  [QUOTA_STORAGE_KEY]:quotaState,
  [CACHE_STORAGE_KEY]:cacheState
});
const quotaKey=QUOTA_STORAGE_KEY;
const cacheKey=CACHE_STORAGE_KEY;
const beforeQuota=JSON.stringify((await chrome.storage.local.get(quotaKey))[quotaKey]);
const beforeCache=JSON.stringify((await chrome.storage.local.get(cacheKey))[cacheKey]);
const beforeOther=JSON.stringify((await chrome.storage.local.get(KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS][otherKey]);
const beforeAuto=JSON.stringify((await chrome.storage.local.get(KEYS.AUTO_RUNS))[KEYS.AUTO_RUNS]);
const offResponse=await send({type:'OZ_SET_MANUAL_MODE',enabled:false,conversation_key:conversationKey,tab_id:1},{tab:{id:1}});
assert(offResponse?.ok===true && offResponse?.enabled===false && offResponse?.state?.manual_operation_active===false,'actual OZ_SET_MANUAL_MODE OFF did not release pending Manual operation');
const afterOff=(await chrome.storage.local.get([KEYS.MANUAL_MODES,KEYS.MANUAL_OPERATIONS,quotaKey,cacheKey,KEYS.AUTO_RUNS]));
assert(afterOff[KEYS.MANUAL_MODES]?.[conversationKey] !== true,'manual mode did not turn OFF');
assert(!afterOff[KEYS.MANUAL_OPERATIONS]?.[conversationKey],'Manual OFF did not delete the pending pre-insert delivery');
assert(JSON.stringify(afterOff[quotaKey])===beforeQuota,'Manual OFF mutated provider quota state');
assert(JSON.stringify(afterOff[cacheKey])===beforeCache,'Manual OFF mutated provider cache state');
assert(JSON.stringify(afterOff[KEYS.MANUAL_OPERATIONS]?.[otherKey])===beforeOther,'Manual OFF mutated another owner operation');
assert(JSON.stringify(afterOff[KEYS.AUTO_RUNS])===beforeAuto,'Manual OFF mutated unrelated autorun state');
assert(providerCalls===0,'Manual OFF caused a provider request');
const onResponse=await send({type:'OZ_SET_MANUAL_MODE',enabled:true,conversation_key:conversationKey,tab_id:1},{tab:{id:1}});
assert(onResponse?.ok===true && onResponse?.enabled===true && onResponse?.state?.manual_operation_active===false,'actual OZ_SET_MANUAL_MODE ON did not restore clean Manual state');
assert(await vm.runInContext(`getManualMode(${JSON.stringify(conversationKey)})`,context)===true,'Manual mode did not turn back ON');
assert(await vm.runInContext(`getManualOperation(${JSON.stringify(conversationKey)})`,context)===null,'old pending delivery reappeared after OFF -> ON');
{ const quotaAfterOn=JSON.stringify((await chrome.storage.local.get(quotaKey))[quotaKey]); assert(quotaAfterOn===beforeQuota,'OFF -> ON reset/changed provider quota timer state'); }
const publicAfterOn=await send({type:'OZ_GET_MANUAL_STATE',conversation_key:conversationKey},{tab:{id:1}});
assert(publicAfterOn?.ok===true && publicAfterOn?.bound===true && publicAfterOn?.enabled===true && publicAfterOn?.ready===true && publicAfterOn?.manual_operation_active===false,'OFF -> ON did not restore worker-owned Manual readiness');
assert(((await chrome.storage.local.get(quotaKey))[quotaKey]).accounts.acct.families['seller.analytics_data.v1'].next_allowed_at===quotaState.accounts.acct.families['seller.analytics_data.v1'].next_allowed_at,'OFF -> ON changed next_allowed_at while restoring readiness');
console.log('TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS');
console.log('TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS');
console.log('TARGETED_QUOTA_CACHE_PRESERVED_PASS');
console.log('TARGETED_OTHER_OWNER_PRESERVED_PASS');
console.log('TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS');

async function assertNonCancellablePreserved(operation, label){
  await chrome.storage.local.set({[KEYS.MANUAL_MODES]:{[conversationKey]:true},[KEYS.MANUAL_OPERATIONS]:{[conversationKey]:operation}});
  await vm.runInContext(`setManualMode(${JSON.stringify(conversationKey)}, false)`,context);
  const stored=(await chrome.storage.local.get(KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[conversationKey]||null;
  assert(stored?.operation_id===operation.operation_id,`Manual OFF deleted non-cancellable state: ${label}`);
}
await assertNonCancellablePreserved({...pending,operation_id:'manual-requesting',status:'requesting',delivery:null,delivery_id:null,batch:{phase:'collecting',request_state:'quota_waiting',next_allowed_at:now+64000}},'requesting/quota_waiting');
await assertNonCancellablePreserved({...pending,operation_id:'manual-insert-committed',delivery:{...pending.delivery,phase:'insert_committed'}},'insert_committed');
await assertNonCancellablePreserved({...pending,operation_id:'manual-inserted',delivery:{...pending.delivery,phase:'inserted'}},'inserted');
assert(providerCalls===0,'non-cancellable OFF scope test caused provider request');
console.log('TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS');

await chrome.storage.local.set({[KEYS.MANUAL_MODES]:{},[KEYS.MANUAL_OPERATIONS]:{[conversationKey]:pending}});
const deniedCommit=await vm.runInContext(`commitManualBatchDeliveryInsert({conversation_key:${JSON.stringify(conversationKey)},owner_id:'manual-op-pending',delivery_id:'delivery-pending',actor_id:'late-runtime',assistant_baseline_ids:[]},{tab:{id:1}})`,context);
assert(deniedCommit?.insert_allowed===false&&deniedCommit?.code==='MANUAL_MODE_DISABLED','late insert commit was not blocked after Manual OFF');
assert(providerCalls===0,'late commit barrier caused provider request');
console.log('TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS');

const contentSrc=fs.readFileSync(path.join(candidateDir,'content_script.js'),'utf8');
const performSrc=extractFunction(contentSrc,'performBatchClaimedDelivery');
let waitStarted=0, commitCalls=0;
const contentContext=vm.createContext({
  sameConversation:()=>true,
  conversationKeyFromLocation:()=>conversationKey,
  primaryComposerContext:()=>({composer:{}}),
  canonicalText:(v)=>String(v||'').trim(),
  composerText:()=> 'operator draft',
  startManualComposerClearWait:(recovery)=>{waitStarted++;return {ok:true,waiting_for_composer_clear:true,recovery};},
  sendRuntime:async()=>{commitCalls++;return {ok:false};},
  assistantTurnIds:()=>[], runtimeId:'runtime-test', setComposerText:()=>{}, recordContentDiagnostic:()=>{}, toast:()=>{}, currentAIAdapter:()=>({label:'ChatGPT'}), runBatchDeliveryWatch:async()=>({ok:true})
});
vm.runInContext(`${performSrc}\nthis.__perform=performBatchClaimedDelivery;`,contentContext);
let occupiedResult, occupiedError=null;
try { occupiedResult=await contentContext.__perform({delivery_mode:'batch_watch_v1',owner_kind:'manual',owner_id:'manual-op',conversation_key:conversationKey,origin:tabIdentity.origin,conversation_id:tabIdentity.conversation_id,delivery_id:'delivery-pending',outgoing_text:'REPORT'}); }
catch(e){ occupiedError=e; }
assert(!occupiedError,`occupied composer still fails delivery instead of waiting: ${occupiedError?.code||occupiedError?.message}`);
assert(occupiedResult?.waiting_for_composer_clear===true,'occupied composer did not enter manual composer-clear wait');
assert(waitStarted===1,'manual composer-clear wait not started exactly once');
assert(commitCalls===0,'delivery insert commit attempted while composer occupied');
console.log('TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS');

const helperStart=contentSrc.indexOf('  function stopManualComposerWait');
const helperEnd=contentSrc.indexOf('  async function performBatchClaimedDelivery',helperStart);
assert(helperStart>=0&&helperEnd>helperStart,'manual composer wait helper block missing');
const helperSrc=contentSrc.slice(helperStart,helperEnd);
let composerValue='operator draft'; let setCalls=[]; let failedCalls=0; let commitCount=0; let insertedCount=0; let watchCount=0;
let lastObserver=null; const diag=[]; const toastMap=new Map();
class FakeMutationObserver { constructor(cb){this.cb=cb;lastObserver=this;} observe(){} disconnect(){} trigger(){this.cb();} }
const deep=vm.createContext({console,setTimeout,clearTimeout,Promise,MutationObserver:FakeMutationObserver,document:{documentElement:{}},
  activeManualComposerWait:null,manualEnabled:true,manualConversationKey:conversationKey,MANUAL_COMPOSER_WAIT_TOAST_KEY:'manual-report-composer-wait',DELIVERY_WATCH_INTERVAL_MS:2000,
  statusToastByKey:toastMap,current:()=>true,sameConversation:()=>true,conversationKeyFromLocation:()=>conversationKey,
  primaryComposerContext:()=>({composer:{},form:{}}),composerText:()=>composerValue,canonicalText:v=>String(v||'').trim(),
  toast:(text,tone,timeout,key)=>{toastMap.set(key,{text,tone,timeout});return {};},clearToast:(key)=>toastMap.delete(key),
  recordContentDiagnostic:(e,d)=>diag.push([e,d]),assistantTurnIds:()=>[],runtimeId:'runtime-deep',
  setComposerText:(_c,text)=>{setCalls.push(text);composerValue=text;},currentAIAdapter:()=>({label:'ChatGPT'}),
  runBatchDeliveryWatch:async()=>{watchCount++;return {ok:true};},
  sendRuntime:async(type,payload)=>{if(type==='OZ_BATCH_DELIVERY_INSERT_COMMIT'){commitCount++;return {ok:true,insert_allowed:true};}if(type==='OZ_BATCH_DELIVERY_INSERTED'){insertedCount++;return {ok:true,inserted:true,recovery:{...payload,delivery_mode:'batch_watch_v1',type:'watch_delivery'}};}if(type==='OZ_BATCH_DELIVERY_FAILED'){failedCalls++;return {ok:true};}return {ok:true};}
});
vm.runInContext(`let activeManualComposerWait=null; let manualEnabled=true; let manualConversationKey=${JSON.stringify(conversationKey)}; const MANUAL_COMPOSER_WAIT_TOAST_KEY='manual-report-composer-wait'; const DELIVERY_WATCH_INTERVAL_MS=2000; ${helperSrc} ${performSrc} this.__start=startManualComposerClearWait; this.__stop=stopManualComposerWait; this.__getActive=()=>activeManualComposerWait; this.__setManual=(v)=>{manualEnabled=v};`,deep);
const recovery={delivery_mode:'batch_watch_v1',owner_kind:'manual',owner_id:'manual-op-deep',conversation_key:conversationKey,origin:tabIdentity.origin,conversation_id:tabIdentity.conversation_id,delivery_id:'delivery-deep',outgoing_text:'REPORT'};
const waitResult=deep.__start(recovery);
assert(waitResult?.waiting_for_composer_clear===true,'deep waiter did not start');
await new Promise(r=>setTimeout(r,0));
assert(toastMap.get('manual-report-composer-wait')?.text==='Очистите поле ввода, чтобы получить отчёт.','persistent plate text mismatch');
assert(composerValue==='operator draft'&&setCalls.length===0,'waiter mutated occupied operator draft');
assert(commitCount===0,'waiter committed before composer clear');
deep.__stop('content_dispose');
assert(!toastMap.has('manual-report-composer-wait'),'dispose did not clear old wait plate');
const restartResult=deep.__start(recovery); assert(restartResult?.waiting_for_composer_clear===true,'recovery did not restore composer wait');
await new Promise(r=>setTimeout(r,0));
assert(toastMap.has('manual-report-composer-wait'),'recovery did not restore persistent plate');
composerValue='';
assert(lastObserver,'composer wait did not install MutationObserver'); lastObserver.trigger();
for(let i=0;i<50&&insertedCount<1;i++) await new Promise(r=>setTimeout(r,5));
assert(commitCount===1&&insertedCount===1,'composer clear did not produce exactly one commit/insert');
assert(setCalls.length===1&&setCalls[0]==='REPORT','report was not inserted exactly once after clear');
assert(failedCalls===0,'composer wait path reported a false delivery failure');
assert(!toastMap.has('manual-report-composer-wait'),'plate remained after successful insert');
assert(watchCount===1,'existing post-insert delivery watch was not entered exactly once');
console.log('TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS');
console.log('TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS');
composerValue='another draft'; setCalls=[]; commitCount=0; insertedCount=0; watchCount=0;
const recovery2={...recovery,owner_id:'manual-op-cancel',delivery_id:'delivery-cancel'};
deep.__setManual(true); deep.__start(recovery2); await new Promise(r=>setTimeout(r,0));
assert(toastMap.has('manual-report-composer-wait'),'cancel scenario plate missing');
deep.__setManual(false); deep.__stop('manual_mode_disabled');
assert(!deep.__getActive(),'Manual OFF did not destroy local composer waiter');
assert(!toastMap.has('manual-report-composer-wait'),'Manual OFF did not remove wait plate');
composerValue=''; if(lastObserver) lastObserver.trigger(); await new Promise(r=>setTimeout(r,10));
assert(commitCount===0&&insertedCount===0&&setCalls.length===0,'cancelled waiter inserted report after Manual OFF');
console.log('TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS');
console.log('TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS');
console.log('TARGETED_COMPOSER_WAIT_REGRESSION_PASS');

{
  let missingWaitStarted=0, missingCommitCalls=0;
  const missingContext=vm.createContext({
    sameConversation:()=>true,
    conversationKeyFromLocation:()=>conversationKey,
    primaryComposerContext:()=>null,
    canonicalText:(v)=>String(v||'').trim(),
    composerText:()=>'',
    startManualComposerClearWait:(recovery)=>{missingWaitStarted++;return {ok:true,waiting_for_composer_clear:true,recovery};},
    sendRuntime:async()=>{missingCommitCalls++;return {ok:false};},
    assistantTurnIds:()=>[],runtimeId:'runtime-missing',setComposerText:()=>{},recordContentDiagnostic:()=>{},toast:()=>{},currentAIAdapter:()=>({label:'ChatGPT'}),runBatchDeliveryWatch:async()=>({ok:true})
  });
  vm.runInContext(`${performSrc}\nthis.__perform=performBatchClaimedDelivery;`,missingContext);
  let missingResult, missingError=null;
  try {
    missingResult=await missingContext.__perform({delivery_mode:'batch_watch_v1',owner_kind:'manual',owner_id:'manual-op-missing',conversation_key:conversationKey,origin:tabIdentity.origin,conversation_id:tabIdentity.conversation_id,delivery_id:'delivery-missing',outgoing_text:'REPORT'});
  } catch (error) { missingError=error; }
  assert(!missingError,`temporarily missing composer still fails Manual recovery: ${missingError?.code||missingError?.message}`);
  assert(missingResult?.waiting_for_composer_clear===true,'missing composer did not enter Manual composer-clear wait');
  assert(missingWaitStarted===1,'missing composer wait not started exactly once');
  assert(missingCommitCalls===0,'insert commit attempted while composer is missing');
  console.log('TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS');
}
console.log('TARGETED_COMPOSER_WAIT_REGRESSION_PASS');
