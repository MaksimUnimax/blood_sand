import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';

const EXPECTED_WORKER='dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const EXPECTED_CONTRACT='0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5';
const candidateDir=path.resolve(process.argv[2]||'');
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'service_worker.js')))throw new Error('usage: node B05_B07_B08_ANALYTICS_CURRENT.mjs <exact-current-candidate-dir>');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'content SHA mismatch');
assert(sha(path.join(candidateDir,'shared/ozon_contract.js'))===EXPECTED_CONTRACT,'contract SHA mismatch');

const local=new Map(),session=new Map();
const runtimeListeners=[],alarmListeners=[],startupListeners=[],installedListeners=[],removedListeners=[];
function clone(v){return v===undefined?undefined:structuredClone(v)}
function storageGet(map,keys){const out={};if(keys==null){for(const[k,v]of map)out[k]=clone(v);return Promise.resolve(out)}if(typeof keys==='string')keys=[keys];if(Array.isArray(keys)){for(const k of keys)if(map.has(k))out[k]=clone(map.get(k));}else if(typeof keys==='object'){for(const[k,d]of Object.entries(keys))out[k]=map.has(k)?clone(map.get(k)):clone(d)}return Promise.resolve(out)}
function storageSet(map,values){for(const[k,v]of Object.entries(values||{}))map.set(k,clone(v));return Promise.resolve()}
function storageRemove(map,keys){if(!Array.isArray(keys))keys=[keys];for(const k of keys)map.delete(k);return Promise.resolve()}
const chrome={
 runtime:{id:'current-analytics-test',lastError:null,onMessage:{addListener(fn){runtimeListeners.push(fn)}},onStartup:{addListener(fn){startupListeners.push(fn)}},onInstalled:{addListener(fn){installedListeners.push(fn)}}},
 storage:{local:{get:k=>storageGet(local,k),set:v=>storageSet(local,v),remove:k=>storageRemove(local,k),clear:()=>{local.clear();return Promise.resolve()}},session:{get:k=>storageGet(session,k),set:v=>storageSet(session,v),remove:k=>storageRemove(session,k),clear:()=>{session.clear();return Promise.resolve()}}},
 tabs:{get:async id=>({id,url:'https://chatgpt.com/'}),query:async()=>[],sendMessage(id,msg,cb){if(typeof cb==='function')queueMicrotask(()=>cb({ok:true}));else return Promise.resolve({ok:true})},onRemoved:{addListener(fn){removedListeners.push(fn)}}},
 alarms:{create(){},clear:async()=>true,get:async()=>null,getAll:async()=>[],onAlarm:{addListener(fn){alarmListeners.push(fn)}}}
};
const sandbox={console,chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,structuredClone,AbortController,Headers,Response,Request,FormData,Blob,fetch:async()=>{throw new Error('network not allowed in B05/B07/B08 direct test')}};
sandbox.globalThis=sandbox;sandbox.self=sandbox;
const context=vm.createContext(sandbox);
sandbox.importScripts=(...names)=>{for(const name of names){const p=path.join(candidateDir,name);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p})}};
vm.runInContext(fs.readFileSync(path.join(candidateDir,'service_worker.js'),'utf8'),context,{filename:'service_worker.js'});
const C=context.OzonContract,KEYS=context.OzonRuntime.STORAGE_KEYS;
assert(C&&KEYS,'contract/runtime globals missing');

const cmd=(metrics=['revenue'],extra={})=>C.normalizeCommand({operation:'analytics_data',params:{date_from:'2026-08-17',date_to:'2026-08-17',dimension:['day'],metrics,limit:10,...extra}});
const revenue=cmd(['revenue']);
const units=cmd(['ordered_units']);
const two=cmd(['revenue','ordered_units']);

// B05: compatibility, deterministic union, projection, fail-closed projection.
const dRevenue=C.analyticsCoalescingDescriptor(revenue),dUnits=C.analyticsCoalescingDescriptor(units);
assert(dRevenue.eligible===true&&dUnits.eligible===true,'compatible analytics unexpectedly ineligible');
assert(dRevenue.compatibility_key===dUnits.compatibility_key,'metric-only difference changed compatibility key');
const physical=C.buildAnalyticsCoalescedCommand([revenue,units]);
assert(JSON.stringify(physical.metrics)===JSON.stringify(['revenue','ordered_units']),'metric union/order wrong');
assert(JSON.stringify(physical.command.params.metrics)===JSON.stringify(['revenue','ordered_units']),'physical metrics wrong');
let mismatchRejected=false;try{C.buildAnalyticsCoalescedCommand([revenue,cmd(['ordered_units'],{limit:11})])}catch(_){mismatchRejected=true}assert(mismatchRejected,'different non-metric semantics coalesced');
const providerRaw={result:{data:[{dimensions:[{id:'2026-08-17',name:'2026-08-17'}],metrics:[100,7]}],totals:[100,7]}};
const projectedRevenue=C.projectAnalyticsDataResult(providerRaw,['revenue','ordered_units'],['revenue']);
const projectedUnits=C.projectAnalyticsDataResult(providerRaw,['revenue','ordered_units'],['ordered_units']);
assert(JSON.stringify(projectedRevenue.result.data[0].metrics)===JSON.stringify([100])&&JSON.stringify(projectedRevenue.result.totals)===JSON.stringify([100]),'revenue projection wrong');
assert(JSON.stringify(projectedUnits.result.data[0].metrics)===JSON.stringify([7])&&JSON.stringify(projectedUnits.result.totals)===JSON.stringify([7]),'ordered_units projection wrong');
let projectionRejected=false;try{C.projectAnalyticsDataResult({result:{data:[{metrics:[1]}]}},['revenue','ordered_units'],['revenue'])}catch(_){projectionRejected=true}assert(projectionRejected,'unprovable projection did not fail closed');
console.log('B05_COMPATIBLE_COALESCE_PASS');
console.log('B05_NONMETRIC_MISMATCH_NO_COALESCE_PASS');
console.log('B05_DETERMINISTIC_UNION_AND_PROJECTION_PASS');
console.log('B05_UNPROJECTABLE_FAIL_CLOSED_PASS');

// B07: current response verifier and safe errors.
const verified=C.verifyProviderResponse(two,providerRaw);
assert(verified?.verified===true&&verified.metric_count===2,'valid analytics response not verified');
for(const bad of [null,{},{result:{}},{result:{data:{}}},{result:{data:[{metrics:[1]}]}},{result:{totals:[1]}}]){
  let rejected=false;try{C.verifyProviderResponse(two,bad)}catch(e){rejected=e?.code==='PROVIDER_RESPONSE_CONTRACT_MISMATCH'||String(e?.message||'').length>0}assert(rejected,`invalid provider response accepted: ${JSON.stringify(bad)}`);
}
const safe429=C.safeErrorPayload(429,'SECRET raw provider body',{code:'RATE_LIMIT',message:'SECRET'});
assert(safe429.http_status===429&&safe429.category==='rate_limit'&&safe429.automatic_retry===false&&safe429.external_request_executed===true,'429 safe error metadata wrong');
assert(!JSON.stringify(safe429).includes('SECRET'),'raw 429 provider message leaked');
const transport=C.safeBridgeErrorPayload(Object.assign(new Error('transport failed'),{code:'PROVIDER_FETCH_FAILED',request_attempted:true,http_status:0}),0);
assert(transport.category==='transport'&&transport.external_request_executed===true&&transport.automatic_retry===false,'transport provenance wrong');
const storageErr=C.safeBridgeErrorPayload(Object.assign(new Error('storage failed'),{code:'STORAGE_READ_FAILED'}),0);
assert(storageErr.external_request_executed===false&&storageErr.automatic_retry===false,'pre-fetch storage failure provenance wrong');
console.log('B07_VALID_RESPONSE_VERIFIED_PASS');
console.log('B07_INVALID_200_FAILS_CLOSED_PASS');
console.log('B07_429_SAFE_NO_RETRY_PASS');
console.log('B07_TRANSPORT_AND_PREFETCH_PROVENANCE_PASS');

// B08: fixed prefetch profile + real current worker cache functions.
const profile=C.reviewedAnalyticsAcquisitionProfile(revenue);
assert(profile.applicable===true&&profile.profile_id==='analytics_basic_metrics_v1'&&profile.prefetch_applied===true,'basic metrics profile not applied');
assert(JSON.stringify(profile.requested_metrics)===JSON.stringify(['revenue']),'profile requested metrics wrong');
assert(JSON.stringify(profile.physical_metrics)===JSON.stringify(['revenue','ordered_units']),'profile physical metrics wrong');
const restricted=C.reviewedAnalyticsAcquisitionProfile(cmd(['returns']));
assert(restricted.applicable===false,'restricted metric was widened by prefetch');

const creds={client_id:'SELLER-CLIENT-123',api_key:'SELLER-API-KEY-SECRET'};
const rotated={client_id:'SELLER-CLIENT-123',api_key:'ROTATED-SELLER-API-KEY'};
const other={client_id:'OTHER-SELLER-999',api_key:'OTHER-KEY'};
await storageSet(local,{[KEYS.PROVIDER_RESULT_CACHE]:{schema_version:1,accounts:{}}});
const providerResult={ok:true,result:providerRaw,request_id:'cache-source-1',executed_command_fingerprint:C.commandFingerprint(two),http_status:200};
const stored=await context.storeAnalyticsResultCache(two,providerResult,creds,{profile_id:'analytics_basic_metrics_v1'},100000);
assert(stored===true,'verified result not cached');
const rawState=(await storageGet(local,KEYS.PROVIDER_RESULT_CACHE))[KEYS.PROVIDER_RESULT_CACHE];
const serialized=JSON.stringify(rawState);
assert(!serialized.includes(creds.client_id)&&!serialized.includes(creds.api_key),'raw credentials leaked into cache');
let hit=await context.readAnalyticsResultCache(revenue,creds,100500);
assert(hit.hit===true,'same Seller compatible safe superset cache miss');
assert(JSON.stringify(hit.result.result.data[0].metrics)===JSON.stringify([100]),'cache projection wrong');
assert(hit.cache?.profile_id==='analytics_basic_metrics_v1','cache profile provenance missing');
let rotatedHit=await context.readAnalyticsResultCache(units,rotated,100500);
assert(rotatedHit.hit===true,'same Client-Id rotated key did not reuse account cache');
let otherMiss=await context.readAnalyticsResultCache(revenue,other,100500);
assert(otherMiss.hit===false,'different Seller shared cache');
let semanticMiss=await context.readAnalyticsResultCache(cmd(['revenue'],{limit:11}),creds,100500);
assert(semanticMiss.hit===false,'incompatible nonmetric semantics hit cache');
let expired=await context.readAnalyticsResultCache(revenue,creds,160001);
assert(expired.hit===false,'expired cache entry hit');
const beforeBad=JSON.stringify((await storageGet(local,KEYS.PROVIDER_RESULT_CACHE))[KEYS.PROVIDER_RESULT_CACHE]);
assert(await context.storeAnalyticsResultCache(two,{ok:false,result:null},creds,null,120000)===false,'provider error cached');
let malformedRejected=false;try{await context.storeAnalyticsResultCache(two,{ok:true,result:{result:{data:[{metrics:[1]}]}},request_id:'bad'},creds,null,120000)}catch(_){malformedRejected=true}assert(malformedRejected,'malformed analytics response entered cache');
const afterBad=JSON.stringify((await storageGet(local,KEYS.PROVIDER_RESULT_CACHE))[KEYS.PROVIDER_RESULT_CACHE]);
assert(afterBad===beforeBad,'bad response mutated cache');
console.log('B08_BASIC_METRICS_PREFETCH_SAFE_PASS');
console.log('B08_VERIFIED_SUPERSET_CACHE_PROJECTION_PASS');
console.log('B08_SELLER_ISOLATION_AND_KEY_ROTATION_PASS');
console.log('B08_SEMANTIC_AND_TTL_MISS_PASS');
console.log('B08_ERROR_MALFORMED_NOT_CACHED_PASS');
console.log('B08_CACHE_CREDENTIAL_PRIVACY_PASS');
console.log('REAL_OZON_REQUESTS=0');
console.log('REAL_PERFORMANCE_REQUESTS=0');
console.log('B05_B07_B08_ANALYTICS_CURRENT_PASS');
