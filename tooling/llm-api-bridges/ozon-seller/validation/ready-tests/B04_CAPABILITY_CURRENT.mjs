import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';

const EXPECTED_WORKER='dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const candidateDir=path.resolve(process.argv[2]||'');
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'service_worker.js')))throw new Error('usage: node B04_CAPABILITY_CURRENT.mjs <exact-current-candidate-dir>');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'content SHA mismatch');

const local=new Map(),session=new Map();const runtimeListeners=[],startupListeners=[],alarmListeners=[],removedListeners=[];let fetches=[];let sellerType='PREMIUM_LITE';
function clone(v){return v===undefined?undefined:structuredClone(v)}
function get(map,keys){const out={};if(keys==null){for(const[k,v]of map)out[k]=clone(v);return Promise.resolve(out)}if(typeof keys==='string')keys=[keys];if(Array.isArray(keys)){for(const k of keys)if(map.has(k))out[k]=clone(map.get(k));}else if(typeof keys==='object'){for(const[k,d]of Object.entries(keys))out[k]=map.has(k)?clone(map.get(k)):clone(d)}return Promise.resolve(out)}
function set(map,vals){for(const[k,v]of Object.entries(vals||{}))map.set(k,clone(v));return Promise.resolve()}
const chrome={runtime:{id:'b04-current',lastError:null,onMessage:{addListener(fn){runtimeListeners.push(fn)}},onStartup:{addListener(fn){startupListeners.push(fn)}},onInstalled:{addListener(){}}},storage:{local:{get:k=>get(local,k),set:v=>set(local,v),remove:async()=>{},clear:async()=>local.clear()},session:{get:k=>get(session,k),set:v=>set(session,v),remove:async()=>{},clear:async()=>session.clear()}},tabs:{get:async id=>({id,url:'https://chatgpt.com/'}),query:async()=>[],sendMessage(id,msg,cb){if(cb)queueMicrotask(()=>cb({ok:true}));else return Promise.resolve({ok:true})},onRemoved:{addListener(fn){removedListeners.push(fn)}}},alarms:{create(){},clear:async()=>true,get:async()=>null,getAll:async()=>[],onAlarm:{addListener(fn){alarmListeners.push(fn)}}}};
async function fakeFetch(input,init={}){const url=typeof input==='string'?input:String(input?.url||input);fetches.push({url,method:String(init?.method||input?.method||'GET').toUpperCase()});if(url.endsWith('/v1/seller/info'))return new Response(JSON.stringify({subscription:{type:sellerType,is_premium:sellerType!=='PREMIUM_LITE'},name:'SECRET COMPANY',inn:'SECRET-INN-123'}),{status:200,headers:{'content-type':'application/json'}});throw new Error(`unexpected network in capability-only test: ${url}`)}
const sandbox={console,chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,structuredClone,fetch:fakeFetch,AbortController,Headers,Response,Request,FormData,Blob};sandbox.globalThis=sandbox;sandbox.self=sandbox;
const context=vm.createContext(sandbox);sandbox.importScripts=(...names)=>{for(const name of names){const p=path.join(candidateDir,name);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p})}};vm.runInContext(fs.readFileSync(path.join(candidateDir,'service_worker.js'),'utf8'),context,{filename:'service_worker.js'});
const C=context.OzonContract,KEYS=context.OzonRuntime.STORAGE_KEYS;assert(C&&KEYS&&typeof context.ensureBatchCapabilityAndPlanning==='function','current capability worker functions missing');
await set(local,{[KEYS.SELLER_CLIENT_ID]:'CAP-CLIENT-123',[KEYS.SELLER_API_KEY]:'CAP-API-KEY-SECRET'});

const base={date_from:'2026-08-17',date_to:'2026-08-17',dimension:['day'],limit:10};
const universal=C.normalizeCommand({operation:'analytics_data',params:{...base,metrics:['revenue']}});
const restricted=C.normalizeCommand({operation:'analytics_data',params:{...base,metrics:['returns']}});
const mixed=C.normalizeCommand({operation:'analytics_data',params:{...base,metrics:['revenue','returns']}});
const restrictedDimension=C.normalizeCommand({operation:'analytics_data',params:{...base,dimension:['brand'],metrics:['revenue']}});
const entry=(command,i=0)=>({entry_id:`e${i}`,kind:'command',status:'pending',operation:command.operation,command,command_text:`OZON_API_V1\n${JSON.stringify(command)}`,command_fingerprint:C.commandFingerprint(command)});
async function plan(entries,capabilityResolution=null){
 let owner={operation_id:'owner',status:'requesting',batch:{request_state:'idle',next_index:0,planning_state:'pending',capability_resolution:capabilityResolution,entries}};
 const mutate=async fn=>{owner=fn(owner);return owner};
 const result=await context.ensureBatchCapabilityAndPlanning({ownerKind:'manual',ownerId:'owner',getOwner:async()=>owner,mutateOwner:mutate,ownerMatches:()=>true,isCollecting:()=>true,failOwner:async(code,msg)=>{throw Object.assign(new Error(msg),{code})}});
 return {result,owner};
}

fetches=[];let p=await plan([entry(universal)]);assert(p.result.ok===true&&p.owner.batch.planning_state==='complete','universal planning failed');assert(fetches.length===0,'universal analytics performed capability probe');assert(p.owner.batch.capability_resolution?.probe_performed===false,'universal analytics recorded probe');
console.log('B04_UNIVERSAL_ZERO_CAPABILITY_PROBE_PASS');

fetches=[];sellerType='PREMIUM_LITE';const many=Array.from({length:30},(_,i)=>entry(restricted,i));p=await plan(many);assert(p.result.ok===true,'restricted batch planning failed');assert(fetches.filter(x=>x.url.endsWith('/v1/seller/info')).length===1,'restricted logical batch did not use exactly one fresh capability probe');assert(p.owner.batch.entries.every(x=>x.kind==='planning_error'&&x.execution_command===null),'all-restricted non-entitled batch remained executable');assert(JSON.stringify(p.owner).includes('SECRET COMPANY')===false&&JSON.stringify(p.owner).includes('SECRET-INN-123')===false,'raw seller identity leaked into batch state');
console.log('B04_ONE_PROBE_PER_RELEVANT_BATCH_PASS');
console.log('B04_ALL_RESTRICTED_ZERO_EXECUTABLE_BUSINESS_PASS');
console.log('B04_SELLER_INFO_PRIVACY_PASS');

fetches=[];sellerType='PREMIUM_LITE';p=await plan([entry(mixed)]);assert(fetches.filter(x=>x.url.endsWith('/v1/seller/info')).length===1,'mixed analytics capability probe count wrong');const mixedEntry=p.owner.batch.entries[0];assert(mixedEntry.kind==='command'&&mixedEntry.execution_command,'mixed analytics unexpectedly rejected');assert(JSON.stringify(mixedEntry.execution_command.params.metrics)===JSON.stringify(['revenue']),'mixed analytics did not remove only restricted metric');assert(mixedEntry.planning?.entitlement?.partial===true,'mixed analytics did not record partial entitlement');assert((mixedEntry.planning?.entitlement?.omitted_metrics||[]).includes('returns'),'mixed analytics omission provenance missing');
console.log('B04_MIXED_UNIVERSAL_RESTRICTED_PARTIAL_PASS');

fetches=[];sellerType='PREMIUM_LITE';p=await plan([entry(restrictedDimension)]);assert(p.owner.batch.entries[0].kind==='planning_error','restricted dimension silently changed semantics');assert(p.owner.batch.entries[0].execution_command===null,'restricted dimension remained executable');
console.log('B04_RESTRICTED_DIMENSION_FAIL_CLOSED_PASS');

fetches=[];const stale={state:'requesting',probe_performed:true,request_worker_session_id:'OLD_WORKER_SESSION',started_at:new Date().toISOString(),profile:null};p=await plan([entry(restricted)],stale);assert(fetches.length===0,'stale capability probe replayed after worker restart');assert(p.owner.batch.capability_resolution?.state==='complete','stale capability state not closed durably');assert(p.owner.batch.capability_resolution?.profile?.status==='unknown','stale capability state did not become unknown');
console.log('B04_STALE_PROBE_NO_REPLAY_PASS');

sellerType='PREMIUM_PLUS';const premiumPlan=C.planCommandForSellerCapability(restricted,{status:'known',subscription_type:'PREMIUM_PLUS',is_premium:true,probe_performed:true},Date.now());assert(premiumPlan.action==='execute'&&premiumPlan.command.params.metrics.includes('returns'),'Premium Plus restricted analytics rejected');const unknownPlan=C.planCommandForSellerCapability(restricted,{status:'unknown',subscription_type:'UNKNOWN',probe_performed:true},Date.now());assert(unknownPlan.action==='reject','unknown all-restricted analytics did not fail closed');
console.log('B04_PREMIUM_FULL_SCOPE_AND_UNKNOWN_FAIL_CLOSED_PASS');
console.log('REAL_OZON_REQUESTS=0');
console.log('REAL_PERFORMANCE_REQUESTS=0');
console.log('B04_CAPABILITY_CURRENT_PASS');
