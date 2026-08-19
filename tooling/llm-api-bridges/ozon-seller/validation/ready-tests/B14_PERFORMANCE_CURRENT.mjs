import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';

const EXPECTED_WORKER='dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const candidateDir=path.resolve(process.argv[2]||'');
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'service_worker.js')))throw new Error('usage: node B14_PERFORMANCE_CURRENT.mjs <exact-current-candidate-dir>');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'content SHA mismatch');

const contractSrc=fs.readFileSync(path.join(candidateDir,'shared/ozon_contract.js'),'utf8');
const providerSrc=fs.readFileSync(path.join(candidateDir,'shared/ozon_provider.js'),'utf8');
const credentialsSrc=fs.readFileSync(path.join(candidateDir,'shared/ozon_credentials.js'),'utf8');
assert(contractSrc.includes('performance_api'),'current contract has no Performance provider surface');
assert(contractSrc.includes('https://api-performance.ozon.ru'),'fixed Performance API host missing');
assert(!/params\.(?:url|host|headers|authorization|client_secret)/i.test(contractSrc),'assistant params appear to control Performance transport');

function extractFunction(src,name){const patterns=[`async function ${name}(`,`function ${name}(`];let at=-1;for(const p of patterns){at=src.indexOf(p);if(at>=0)break}if(at<0)throw new Error(`function missing: ${name}`);const open=src.indexOf('{',at);let depth=0,quote=null,escape=false,line=false,block=false;for(let i=open;i<src.length;i++){const c=src[i],n=src[i+1];if(line){if(c==='\n')line=false;continue}if(block){if(c==='*'&&n==='/'){block=false;i++}continue}if(quote){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===quote)quote=null;continue}if(c==='/'&&n==='/'){line=true;i++;continue}if(c==='/'&&n==='*'){block=true;i++;continue}if(c==='"'||c==="'"||c==='`'){quote=c;continue}if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0)return src.slice(at,i+1)}}throw new Error(`unterminated function: ${name}`)}
const executePerformanceSrc=extractFunction(providerSrc,'executePerformanceCommand');
assert(executePerformanceSrc.includes('getPerformanceToken'),'Performance execution no longer uses token acquisition');
assert(executePerformanceSrc.includes('buildPerformanceRequest'),'Performance execution no longer uses fixed contract request builder');
assert(executePerformanceSrc.includes('performanceBearerHeaders'),'Performance execution no longer uses Performance bearer headers');
assert(!/sellerCredentials|seller_api|Api-Key/i.test(executePerformanceSrc),'Performance execution contains Seller auth path');
console.log('B14_FIXED_PERFORMANCE_HOST_AND_EXECUTION_PATH_PASS');

const local=new Map(),session=new Map();const runtimeListeners=[],startupListeners=[],alarmListeners=[],removedListeners=[];
function clone(v){return v===undefined?undefined:structuredClone(v)}
function get(map,keys){const out={};if(keys==null){for(const[k,v]of map)out[k]=clone(v);return Promise.resolve(out)}if(typeof keys==='string')keys=[keys];if(Array.isArray(keys)){for(const k of keys)if(map.has(k))out[k]=clone(map.get(k));}else if(typeof keys==='object'){for(const[k,d]of Object.entries(keys))out[k]=map.has(k)?clone(map.get(k)):clone(d)}return Promise.resolve(out)}
function set(map,vals){for(const[k,v]of Object.entries(vals||{}))map.set(k,clone(v));return Promise.resolve()}
const chrome={runtime:{id:'b14-current',lastError:null,onMessage:{addListener(fn){runtimeListeners.push(fn)}},onStartup:{addListener(fn){startupListeners.push(fn)}},onInstalled:{addListener(){}}},storage:{local:{get:k=>get(local,k),set:v=>set(local,v),remove:async()=>{},clear:async()=>local.clear()},session:{get:k=>get(session,k),set:v=>set(session,v),remove:async()=>{},clear:async()=>session.clear()}},tabs:{get:async id=>({id,url:'https://chatgpt.com/'}),query:async()=>[],sendMessage(id,msg,cb){if(cb)queueMicrotask(()=>cb({ok:true}));else return Promise.resolve({ok:true})},onRemoved:{addListener(fn){removedListeners.push(fn)}}},alarms:{create(){},clear:async()=>true,get:async()=>null,getAll:async()=>[],onAlarm:{addListener(fn){alarmListeners.push(fn)}}}};
let unexpectedNetwork=0;async function noNetwork(){unexpectedNetwork++;throw new Error('network forbidden in B14 boundary test')}
const sandbox={console,chrome,crypto:webcrypto,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,structuredClone,fetch:noNetwork,AbortController,Headers,Response,Request,FormData,Blob};sandbox.globalThis=sandbox;sandbox.self=sandbox;
const context=vm.createContext(sandbox);sandbox.importScripts=(...names)=>{for(const name of names){const p=path.join(candidateDir,name);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p})}};vm.runInContext(fs.readFileSync(path.join(candidateDir,'service_worker.js'),'utf8'),context,{filename:'service_worker.js'});
const C=context.OzonContract,Cred=context.OzonCredentials,KEYS=context.OzonRuntime.STORAGE_KEYS;
assert(C&&Cred&&KEYS,'current runtime globals missing');
assert(typeof Cred.normalizePerformanceCredentials==='function','normalizePerformanceCredentials missing');
assert(typeof Cred.performanceBearerHeaders==='function','performanceBearerHeaders missing');
const perfCreds=Cred.normalizePerformanceCredentials({client_id:'PERF_CLIENT_ID',client_secret:'PERF_CLIENT_SECRET'},{required:true});
assert(perfCreds.present===true,'Performance credentials not accepted by current credential model');
const bearer=Cred.performanceBearerHeaders('PERF_ACCESS_TOKEN');
const authValue=bearer.Authorization||bearer.authorization;
assert(authValue==='Bearer PERF_ACCESS_TOKEN','Performance bearer header changed');
assert(!Object.keys(bearer).some(k=>/^Client-Id$|^Api-Key$/i.test(k)),'Seller credentials leaked into Performance bearer headers');
console.log('B14_PERFORMANCE_AUTH_SEPARATION_PASS');

const capabilitySource=String(C.sellerCapabilityRequirement);
assert(capabilitySource.includes('preflight.meta.provider')&&capabilitySource.includes('seller_api')&&capabilitySource.includes('required: false'),'capability function lacks non-Seller early boundary');
console.log('B14_PERFORMANCE_ZERO_SELLER_CAPABILITY_BOUNDARY_PASS');

assert(typeof context.prepareProviderQuotaForCommand==='function','prepareProviderQuotaForCommand missing');
assert(typeof context.readAnalyticsResultCache==='function'&&typeof context.storeAnalyticsResultCache==='function','analytics cache functions missing');
const originalContract=context.OzonContract;
const perfCommand={operation:'__performance_boundary_fixture__',params:{}};
context.OzonContract={...originalContract,normalizeCommand:()=>perfCommand,preflightExecution:()=>({meta:{provider:'performance_api',method:'GET'}}),analyticsCoalescingDescriptor:()=>({eligible:false})};
const quotaBefore={schema_version:1,accounts:{sentinel:{families:{'seller.analytics_data.v1':{last_provider_request_at:123,next_allowed_at:456}}}}};
const cacheBefore={schema_version:1,accounts:{sentinel:{entries:{x:{stored_at:1,expires_at:999999}}}}};
await set(local,{[KEYS.PROVIDER_QUOTA_STATE]:quotaBefore,[KEYS.PROVIDER_RESULT_CACHE]:cacheBefore});
const quotaResult=await context.prepareProviderQuotaForCommand(perfCommand);
assert(quotaResult?.required===false&&quotaResult?.allowed===true&&quotaResult?.quota===null,'Performance classification entered Seller quota scheduler');
assert(JSON.stringify((await get(local,KEYS.PROVIDER_QUOTA_STATE))[KEYS.PROVIDER_QUOTA_STATE])===JSON.stringify(quotaBefore),'Performance boundary mutated Seller quota state');
const cacheRead=await context.readAnalyticsResultCache(perfCommand,{client_id:'SELLER',api_key:'SELLER_KEY'});
assert(cacheRead?.hit===false&&cacheRead?.reason==='operation_not_cacheable','Performance classification entered Seller analytics cache lookup');
const cacheStore=await context.storeAnalyticsResultCache(perfCommand,{ok:true,result:{anything:true}},{client_id:'SELLER',api_key:'SELLER_KEY'});
assert(cacheStore===false,'Performance classification entered Seller analytics cache store');
assert(JSON.stringify((await get(local,KEYS.PROVIDER_RESULT_CACHE))[KEYS.PROVIDER_RESULT_CACHE])===JSON.stringify(cacheBefore),'Performance boundary mutated Seller cache state');
context.OzonContract=originalContract;
assert(unexpectedNetwork===0,'B14 boundary test unexpectedly executed network');
console.log('B14_NO_SELLER_QUOTA_OR_CACHE_FOR_PERFORMANCE_PASS');
console.log('REAL_OZON_REQUESTS=0');
console.log('REAL_PERFORMANCE_REQUESTS=0');
console.log('B14_PERFORMANCE_CURRENT_PASS');
