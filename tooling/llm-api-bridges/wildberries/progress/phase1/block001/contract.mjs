// Offline full provider-path regression. No native fetch is exposed to either VM.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const base=path.resolve(process.argv[2]), candidate=path.resolve(process.argv[3]), out=path.resolve(process.argv[4]);
fs.mkdirSync(out,{recursive:false});
const fd=fs.openSync(path.join(out,'results.jsonl'),'wx');
const results=[];
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function test(id,fn){
 try {const detail=await fn(); const r={id,status:'PASS',detail:detail??null};results.push(r);fs.writeSync(fd,JSON.stringify(r)+'\n');fs.fsyncSync(fd);}
 catch(e){const r={id,status:'FAIL',error:e.stack};results.push(r);fs.writeSync(fd,JSON.stringify(r)+'\n');fs.fsyncSync(fd);console.error(id,e.message);}
}
function load(root){
 const calls=[];const sandbox={URL,URLSearchParams,TextEncoder,TextDecoder,AbortController,Headers,Response,crypto:crypto.webcrypto,setTimeout,clearTimeout,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};
 sandbox.fetch=async (...args)=>{calls.push(args);return new Response('{}',{status:200,headers:{'Content-Type':'application/json'}});};
 const context=vm.createContext(sandbox);
 for(const file of ['wb_operations','wb_contract','wb_credentials','provider_transport_core','wb_provider'])vm.runInContext(fs.readFileSync(path.join(root,'shared',file+'.js'),'utf8'),context,{filename:file+'.js',timeout:3000});
 return {context,calls,c:context.WBContract,provider:context.WBProvider};
}
const old=load(base), cur=load(candidate);const canonical=o=>'WB_API_V1\n'+JSON.stringify(o);
await test('REGISTRY-BYTES-UNCHANGED',()=>assert.equal(digest(path.join(base,'shared/wb_operations.js')),digest(path.join(candidate,'shared/wb_operations.js'))));
await test('CREDENTIAL-BYTES-UNCHANGED',()=>assert.equal(digest(path.join(base,'shared/wb_credentials.js')),digest(path.join(candidate,'shared/wb_credentials.js'))));
await test('BASELINE-RED-TOPLEVEL-QUERY-BYPASS',()=>{
 const bad='WB_API_V1\n{"operation":"tariff_box","query":{"injected":"yes"}}';
 assert.doesNotThrow(()=>old.c.parseCommand(bad));
 assert.throws(()=>cur.c.parseCommand(bad),e=>e.code==='UNKNOWN_COMMAND_FIELD');
 return {pre_fix:'ACCEPTED_INVALID_COMMAND',candidate:'REJECTED'};
});
const negatives=[
 ['TA-003','WB_API_V1\n{"operation":','INVALID_JSON'],
 ['TA-004',canonical({operation:'seller_info',params:{},unexpected:true}),'UNKNOWN_COMMAND_FIELD'],
 ['TA-005',canonical({operation:'seller_info',params:{},url:'https://untrusted.invalid'}),'UNKNOWN_COMMAND_FIELD'],
 ['TA-006',canonical({operation:'seller_info',params:{headers:{Authorization:'secret-fixture'}}}),'TRANSPORT_INJECTION_REJECTED'],
 ['INTERNAL-BYPASS',canonical({operation:'tariff_box',query:{anything:'x'},path:{}}),'UNKNOWN_COMMAND_FIELD'],
 ['TOP-HEADERS',canonical({operation:'seller_info',params:{},headers:{}}),'UNKNOWN_COMMAND_FIELD'],
 ['TOP-METHOD',canonical({operation:'seller_info',params:{},method:'POST'}),'UNKNOWN_COMMAND_FIELD'],
 ['PARAMS-MISSING',canonical({operation:'seller_info'}),'INVALID_OPERATION_PARAMS'],
 ['PARAMS-ARRAY',canonical({operation:'seller_info',params:[]}),'INVALID_OPERATION_PARAMS'],
 ['OPERATION-NONSTRING',canonical({operation:3,params:{}}),'MISSING_OPERATION'],
 ['PATH-NONOBJECT',canonical({operation:'seller_info',params:{path:[]}}),'INVALID_PATH_PARAMS'],
 ['QUERY-NONOBJECT',canonical({operation:'seller_info',params:{query:3}}),'INVALID_QUERY_PARAMS'],
 ['REQUIRED-QUERY',canonical({operation:'tariff_box',params:{query:{}}}),'MISSING_QUERY_PARAM'],
 ['UNDECLARED-QUERY',canonical({operation:'seller_info',params:{query:{x:1}}}),'UNSUPPORTED_QUERY_PARAM'],
 ['TA-009',canonical({operation:'subscriptions',params:{}}),'OPERATION_BLOCKED'],
 ['TA-010',canonical({operation:'does_not_exist',params:{}}),'UNSUPPORTED_OPERATION'],
 ['UNSAFE-PROTOTYPE','WB_API_V1\n{"operation":"cards_list","params":{"__proto__":{"polluted":true}}}','UNSAFE_JSON_KEY']
];
for(const [id,text,code] of negatives)await test(id+'-ZERO-NETWORK',async()=>{
 const n=cur.calls.length;
 await assert.rejects(cur.provider.executeCommand(text,{token:'offline-fixture-token'}),e=>e.code===code);
 assert.equal(cur.calls.length,n);return {error:code,physical_requests:0};
});
await test('NO-PROTOTYPE-POLLUTION',()=>assert.equal({}.polluted,undefined));
await test('TA-001-PROVIDER-SINGLE-REQUEST',async()=>{const n=cur.calls.length;const r=await cur.provider.executeCommand(canonical({operation:'seller_info',params:{}}),{token:'offline-fixture-token'});assert.equal(r.ok,true);assert.equal(cur.calls.length-n,1);});
await test('RESOLVED-STATE-REVALIDATION',()=>{
 const c=cur.c.parseCommand(canonical({operation:'tariff_box',params:{query:{date:'2026-08-01'}}}));
 const restored=JSON.parse(JSON.stringify(c)); delete restored.query.date;
 assert.throws(()=>cur.c.buildRequest(restored),e=>e.code==='MISSING_QUERY_PARAM');
 restored.query.date='2026-08-01';restored.query.rogue='1';
 assert.throws(()=>cur.c.buildRequest(restored),e=>e.code==='UNSUPPORTED_QUERY_PARAM');
});
await test('NBSP-PRESERVED-IN-PAYLOAD',()=>{const text=canonical({operation:'cards_list',params:{body:{note:'a\u00a0b'}}});const c=cur.c.parseCommand(text);assert.equal(c.body.note,'a\u00a0b');});
await test('FACTORY-NO-PERMISSIVE-INGRESS',()=>{
 const factory=cur.context.WBContractFactory.createWBContract({operations:{fixture:{effect:'READ',execution_enabled:true,method:'GET',path:'/fixture'}}});
 assert.throws(()=>factory.parseCommand(canonical({operation:'fixture',params:{},headers:{}})),e=>e.code==='UNKNOWN_COMMAND_FIELD');
});
function paramsFor(m){
 const params={};const names=[...m.path.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(x=>x[1]);
 if(names.length)params.path=Object.fromEntries(names.map(x=>[x,'fixture-1']));
 if(m.required_query_keys.length)params.query=Object.fromEntries(m.required_query_keys.map(x=>[x,/date|time|from|to/i.test(x)?'2026-08-01':'1']));
 if(m.body_required)params.body={fixture:'unchanged',ids:[1,2]};return params;
}
for(const m of Object.values(cur.c.OPERATIONS).filter(x=>x.execution_enabled))await test('REQUEST-PARITY:'+m.alias,async()=>{
 const text=canonical({operation:m.alias,params:paramsFor(m)});
 const a=old.c.buildRequest(old.c.parseCommand(text),{Authorization:'Bearer offline-fixture-token'});
 const b=cur.c.buildRequest(cur.c.parseCommand(text),{Authorization:'Bearer offline-fixture-token'});
 assert.deepEqual(JSON.parse(JSON.stringify(b)),JSON.parse(JSON.stringify(a)));
 const restored=JSON.parse(JSON.stringify(cur.c.parseCommand(text)));
 assert.equal(cur.c.commandFingerprint(restored),old.c.commandFingerprint(old.c.parseCommand(text)));
 assert.equal(cur.c.buildRequest(restored).url,b.url);
 const n=cur.calls.length;const r=await cur.provider.executeCommand(text,{token:'offline-fixture-token'});
 assert.equal(cur.calls.length-n,1);assert.equal(cur.calls.at(-1)[0],b.url);
 const options=cur.calls.at(-1)[1];assert.equal(options.method,b.method);assert.equal(options.body,b.body);assert.equal(r.ok,true);
 return {mock_requests:1,host:m.host,method:m.method};
});
const summary={checks:results.length,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,real_wb_requests:0,scope:'contract ingress + mocked request serialization, NOT full Phase1 or live acceptance',files:{'wb_contract.js':digest(path.join(candidate,'shared/wb_contract.js')),'wb_operations.js':digest(path.join(candidate,'shared/wb_operations.js'))},runner_sha256:digest(new URL(import.meta.url))};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');fs.closeSync(fd);console.log(JSON.stringify(summary,null,2));if(summary.failed)process.exitCode=1;
