import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';

const EXPECTED_WORKER='dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const candidateDir=path.resolve(process.argv[2]||'');
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'service_worker.js')))throw new Error('usage: node B09_COMMON_BATCH_CURRENT.mjs <exact-current-candidate-dir>');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'content SHA mismatch');

const local=new Map(),session=new Map();
const runtimeListeners=[],startupListeners=[],alarmListeners=[],removedListeners=[];
const tabIdentities=new Map();
let calls=[];let activeBusiness=0,maxBusiness=0;
function clone(v){return v===undefined?undefined:structuredClone(v)}
function get(map,keys){const out={};if(keys==null){for(const[k,v]of map)out[k]=clone(v);return Promise.resolve(out)}if(typeof keys==='string')keys=[keys];if(Array.isArray(keys)){for(const k of keys)if(map.has(k))out[k]=clone(map.get(k));}else if(typeof keys==='object'){for(const[k,d]of Object.entries(keys))out[k]=map.has(k)?clone(map.get(k)):clone(d)}return Promise.resolve(out)}
function set(map,vals){for(const[k,v]of Object.entries(vals||{}))map.set(k,clone(v));return Promise.resolve()}
function remove(map,keys){if(!Array.isArray(keys))keys=[keys];for(const k of keys)map.delete(k);return Promise.resolve()}
const chrome={
 runtime:{id:'b09-current',lastError:null,onMessage:{addListener(fn){runtimeListeners.push(fn)}},onStartup:{addListener(fn){startupListeners.push(fn)}},onInstalled:{addListener(){}}},
 storage:{local:{get:k=>get(local,k),set:v=>set(local,v),remove:k=>remove(local,k),clear:async()=>local.clear()},session:{get:k=>get(session,k),set:v=>set(session,v),remove:k=>remove(session,k),clear:async()=>session.clear()}},
 tabs:{get:async id=>({id,url:(tabIdentities.get(id)?.origin||'https://chatgpt.com')+'/'}),query:async()=>[],sendMessage(id,msg,cb){const response=msg?.type==='OZ_GET_IDENTITY'?{ok:true,identity:clone(tabIdentities.get(id))}:{ok:false,code:'COMPOSER_NOT_FOUND'};if(typeof cb==='function')queueMicrotask(()=>cb(response));else return Promise.resolve(response)},onRemoved:{addListener(fn){removedListeners.push(fn)}}},
 alarms:{create(){},clear:async()=>true,get:async()=>null,getAll:async()=>[],onAlarm:{addListener(fn){alarmListeners.push(fn)}}}
};
async function fakeFetch(input,init={}){
 const url=typeof input==='string'?input:String(input?.url||input);const method=String(init?.method||input?.method||'GET').toUpperCase();const at=Date.now();
 if(url.endsWith('/v1/seller/info')){calls.push({kind:'capability',url,method,at});return new Response(JSON.stringify({subscription:{type:'PREMIUM_PLUS',is_premium:true}}),{status:200,headers:{'content-type':'application/json'}})}
 if(url.includes('/v1/analytics/product-queries')){activeBusiness++;maxBusiness=Math.max(maxBusiness,activeBusiness);calls.push({kind:'business',url,method,at});await new Promise(r=>setTimeout(r,80));activeBusiness--;return new Response(JSON.stringify({result:{items:[]}}),{status:200,headers:{'content-type':'application/json'}})}
 throw new Error(`unexpected network: ${url}`);
}
const sandbox={console,chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,structuredClone,fetch:fakeFetch,AbortController,Headers,Response,Request,FormData,Blob};sandbox.globalThis=sandbox;sandbox.self=sandbox;
const context=vm.createContext(sandbox);sandbox.importScripts=(...names)=>{for(const name of names){const p=path.join(candidateDir,name);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p})}};vm.runInContext(fs.readFileSync(path.join(candidateDir,'service_worker.js'),'utf8'),context,{filename:'service_worker.js'});
assert(runtimeListeners.length===1,'runtime message listener missing');assert(typeof context.processBatchQueue==='function','processBatchQueue missing');
const KEYS=context.OzonRuntime.STORAGE_KEYS,C=context.OzonContract;
async function send(message,sender={tab:{id:9}}){return await new Promise((resolve,reject)=>{let done=false;const timer=setTimeout(()=>{if(!done){done=true;reject(new Error(`runtime timeout: ${message.type}`))}},5000);const ret=runtimeListeners[0](message,sender,response=>{if(done)return;done=true;clearTimeout(timer);resolve(response)});if(ret!==true&&!done){done=true;clearTimeout(timer);resolve(undefined)}})}
async function waitFor(fn,timeout=10000,step=30){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await new Promise(r=>setTimeout(r,step))}throw new Error('waitFor timeout')}
function identity(origin,id){return{origin,ai_id:'chatgpt',conversation_id:id,status:'confirmed',source:'path',chat_path:`/c/${id}`}}
function binding(origin,id){const key=`${origin}|${id}`;return{key,record:{binding_id:`bind-${id}`,revision:1,origin,ai_id:'chatgpt',conversation_id:id,conversation_key:key,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()}}}
async function seed(id){local.clear();session.clear();calls=[];activeBusiness=0;maxBusiness=0;const origin='https://chatgpt.com',b=binding(origin,id);tabIdentities.set(9,identity(origin,id));await set(local,{[KEYS.CONVERSATION_BINDINGS]:{[b.key]:b.record},[KEYS.MANUAL_MODES]:{[b.key]:true},[KEYS.SELLER_CLIENT_ID]:'B09-CLIENT',[KEYS.SELLER_API_KEY]:'B09-KEY',[KEYS.AUTO_SEND]:true,[KEYS.MANUAL_OPERATIONS]:{},[KEYS.AUTO_RUNS]:{}});return b.key}
const pq=(date='2026-08-17T00:00:00Z')=>`OZON_API_V1\n${JSON.stringify({operation:'product_queries',params:{date_from:date,page:0,page_size:10,skus:['123456789'],sort_by:'BY_SEARCHES',sort_dir:'DESCENDING'}})}`;
const pqd=(date='2026-08-17T00:00:00Z')=>`OZON_API_V1\n${JSON.stringify({operation:'product_queries_details',params:{date_from:date,page:0,page_size:10,skus:['123456789'],limit_by_sku:5,sort_by:'BY_SEARCHES',sort_dir:'DESCENDING'}})}`;
const validationError=`OZON_API_V1\n${JSON.stringify({operation:'product_queries',params:{date_from:'2026-08-17T00:00:00Z',page:-1,page_size:10,skus:['123456789'],sort_by:'BY_SEARCHES',sort_dir:'DESCENDING'}})}`;

let key=await seed('99999999-9999-4999-8999-999999999999');let admitted=await send({type:'OZ_EXECUTE_COMMAND',command_text:pq(),conversation_key:key,manual_request_id:'one'});assert(admitted?.ok===true&&admitted?.accepted===true,'single command not admitted');let op=await waitFor(async()=>{const x=(await get(local,KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key];return x?.batch?.entries?.[0]?.status==='complete'?x:null});assert(op.batch.entries.length===1,'single command did not remain one-entry batch');assert(calls.filter(x=>x.kind==='business').length===1,'single command physical request count wrong');
console.log('B09_ONE_COMMAND_ONE_ENTRY_PASS');

key=await seed('88888888-8888-4888-8888-888888888888');admitted=await send({type:'OZ_EXECUTE_COMMAND',command_text:`${pq()}\n\nТекст между командами.\n\n${pqd()}`,conversation_key:key,manual_request_id:'two'});assert(admitted?.ok===true&&admitted?.accepted===true,'multi command not admitted');op=await waitFor(async()=>{const x=(await get(local,KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key];return x?.batch?.entries?.length===2&&x.batch.entries.every(e=>e.status==='complete')?x:null});assert(op.batch.entries.map(e=>e.operation).join(',')==='product_queries,product_queries_details','logical order changed');assert(calls.filter(x=>x.kind==='capability').length===1,'multi command batch performed more than one capability probe');assert(calls.filter(x=>x.kind==='business').length===2,'multi command business count wrong');assert(maxBusiness===1,'provider calls overlapped');assert(new Set(op.batch.entries.map(e=>e.request_id)).size===2,'logical entries lost separate request identities');
console.log('B09_MULTI_COMMAND_ORDER_PASS');console.log('B09_STRICT_SERIAL_PHYSICAL_CALLS_PASS');console.log('B09_LOGICAL_RESULTS_REMAIN_SEPARATE_PASS');

key=await seed('77777777-7777-4777-8777-777777777777');admitted=await send({type:'OZ_EXECUTE_COMMAND',command_text:`${pq()}\n\n${validationError}\n\n${pqd()}`,conversation_key:key,manual_request_id:'partial'});assert(admitted?.ok===true&&admitted?.accepted===true,'partial-validation batch not admitted');op=await waitFor(async()=>{const x=(await get(local,KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key];return x?.batch?.entries?.length===3&&x.batch.entries.every(e=>e.status==='complete')?x:null});assert(op.batch.entries[0].operation==='product_queries'&&op.batch.entries[2].operation==='product_queries_details','valid entries around validation error lost order');assert(op.batch.entries[1].external_request_executed===false,'validation-error entry executed provider request');assert(calls.filter(x=>x.kind==='business').length===2,'validation-error entry changed business request count');assert(maxBusiness===1,'partial batch physical calls overlapped');
console.log('B09_PARTIAL_VALIDATION_SAFE_CONTINUATION_PASS');console.log('B09_VALIDATION_ENTRY_ZERO_PROVIDER_PASS');

const beforeReplay=calls.filter(x=>x.kind==='business').length;for(const fn of startupListeners)await fn();try{await vm.runInContext('typeof resumeProviderQuotaWaits==="function"?resumeProviderQuotaWaits():Promise.resolve()',context)}catch(_){}await new Promise(r=>setTimeout(r,300));assert(calls.filter(x=>x.kind==='business').length===beforeReplay,'completed entries replayed on startup/recovery');
console.log('B09_COMPLETED_ENTRIES_NO_REPLAY_PASS');

const oldCommand=C.parseCommand(pq());let oldOwner={operation_id:'old-requesting',status:'requesting',batch:{request_state:'requesting',request_worker_session_id:'OLD_WORKER_SESSION',next_index:0,planning_state:'complete',capability_resolution:{state:'not_needed',probe_performed:false,profile:{status:'not_needed',subscription_type:'UNKNOWN',probe_performed:false}},query_planning_state:'complete',query_plan:null,entries:[{entry_id:'old-e0',kind:'command',status:'requesting',operation:oldCommand.operation,command:oldCommand,execution_command:oldCommand,command_text:pq(),command_fingerprint:C.commandFingerprint(oldCommand)}]}};calls=[];let failed=null;
await context.processBatchQueue({conversationKey:'https://chatgpt.com|old',ownerKind:'manual',ownerId:'old-requesting',getOwner:async()=>oldOwner,mutateOwner:async fn=>{oldOwner=fn(oldOwner);return oldOwner},ownerMatches:current=>current?.operation_id==='old-requesting',isCollecting:current=>current?.status==='requesting',failOwner:async(code,message)=>{failed={code,message};oldOwner={...oldOwner,status:'error',last_error:{code,message}};return oldOwner},finalizeOwner:async()=>{throw new Error('old requesting ambiguity must not finalize')}});
assert(calls.filter(x=>x.kind==='business').length===0,'old requesting ambiguity replayed provider request');assert(failed?.code==='REQUEST_OUTCOME_UNKNOWN_NO_RETRY'||String(failed?.code||'').includes('REQUEST_OUTCOME_UNKNOWN'),'old requesting ambiguity did not fail closed');
console.log('B09_OLD_REQUESTING_FAIL_CLOSED_PASS');

console.log('REAL_OZON_REQUESTS=0');console.log('REAL_PERFORMANCE_REQUESTS=0');console.log('B09_COMMON_BATCH_CURRENT_PASS');
