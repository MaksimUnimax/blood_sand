import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

function load(rel,name,extra={}){const file=fileURLToPath(new URL(rel,import.meta.url));const ctx={console,URL,URLSearchParams,TextEncoder,TextDecoder,Uint8Array,AbortController,setTimeout,clearTimeout,structuredClone,Date,...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});return ctx[name];}
const protocol=load('../../ozon-seller/provider/ozon_protocol.js','OzonProtocol');
const transport=load('../provider_transport.js','LLMProviderTransport');
const model=load('../provider_runtime_model.js','LLMProviderRuntimeModel');
const coreFactory=load('../provider_execution_core.js','LLMProviderExecutionCore');

function storageMock(){let data={};return{async get(key){return{[key]:structuredClone(data[key])}},async set(obj){data={...data,...structuredClone(obj)}},dump(){return structuredClone(data)}}}
function fakeResponse(body,status=200){const bytes=new TextEncoder().encode(JSON.stringify(body));return{status,ok:status>=200&&status<300,headers:{get(n){if(String(n).toLowerCase()==='content-type')return'application/json';if(String(n).toLowerCase()==='content-length')return String(bytes.length);return null;}},async arrayBuffer(){return bytes.buffer}}}
function ids(){let i=0;return()=>`id-${++i}`}
function makeCore({fetchImpl,session='ws-1',store=storageMock(),credentials=async()=>({clientId:'1',apiKey:'key'})}={}){
 const tx={...transport,executeOne:(request,opts)=>transport.executeOne(request,{...opts,fetchImpl})};
 return{store,core:coreFactory.create({provider:'ozon',protocol,transport:tx,runtimeModel:model,storage:store,storageKey:'ops',getCredentials:credentials,workerSessionId:session,makeId:ids(),now:()=>1000})};
}
const command='OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-01"}}';

test('concurrent same request is claimed before fetch and executes exactly one HTTP request',async()=>{
 let fetchCalls=0, release;const gate=new Promise(r=>release=r);
 const {core}=makeCore({fetchImpl:async()=>{fetchCalls++;await gate;return fakeResponse({ok:true})}});
 const p1=core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1'});
 await new Promise(r=>setTimeout(r,0));
 const p2=core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1'});
 await assert.rejects(p2,e=>e?.code==='REQUEST_DUPLICATE');assert.equal(fetchCalls,1);release();
 const result=await p1;assert.equal(result.http_status,200);assert.equal(fetchCalls,1);
});

test('different request while active is blocked and does not fetch twice',async()=>{
 let fetchCalls=0,release;const gate=new Promise(r=>release=r);const {core}=makeCore({fetchImpl:async()=>{fetchCalls++;await gate;return fakeResponse({ok:true})}});
 const p1=core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1'});await new Promise(r=>setTimeout(r,0));
 await assert.rejects(core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r2'}),e=>e?.code==='OPERATION_ACTIVE');assert.equal(fetchCalls,1);release();await p1;
});

test('durable delivering is stored before caller receives outgoing text, then completes by matching delivery id',async()=>{
 const {core}=makeCore({fetchImpl:async()=>fakeResponse({result:'я'})});
 const r=await core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1',outgoingPrefix:'PREFIX'});
 const op=await core.getOperation('c');assert.equal(op.status,'delivering');assert.equal(op.delivery_id,r.delivery_id);assert.equal(op.outgoing_text,r.outgoing_text);assert.match(op.outgoing_text,/PREFIX/);
 const done=await core.completeDelivery({conversationKey:'c',operationId:r.operation_id,deliveryId:r.delivery_id,confirmedTurnId:'turn'});assert.equal(done.status,'completed');assert.equal(done.confirmed_user_turn_id,'turn');
});

test('credentials are loaded only after durable claim and never stored in operation',async()=>{
 let seenStatus=null;let coreRef;const store=storageMock();const credentials=async()=>{seenStatus=(await coreRef.getOperation('c')).status;return{clientId:'77',apiKey:'super-secret'}};
 const made=makeCore({store,credentials,fetchImpl:async()=>fakeResponse({ok:true})});coreRef=made.core;
 await coreRef.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1'});assert.equal(seenStatus,'requesting');assert.doesNotMatch(JSON.stringify(store.dump()),/super-secret|"77"/);
});

test('transport timeout marks terminal failed outcome_unknown and never retries',async()=>{
 let calls=0;const fetchImpl=(u,o)=>new Promise((res,rej)=>{calls++;o.signal.addEventListener('abort',()=>rej(new Error('abort')),{once:true})});
 const store=storageMock();const tx={...transport,executeOne:(request,opts)=>transport.executeOne(request,{...opts,fetchImpl,timeoutMs:5})};
 const core=coreFactory.create({provider:'ozon',protocol,transport:tx,runtimeModel:model,storage:store,storageKey:'ops',getCredentials:async()=>({clientId:'1',apiKey:'k'}),workerSessionId:'ws-1',makeId:ids(),now:Date.now});
 await assert.rejects(core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1'}),e=>e?.code==='REQUEST_TIMEOUT');assert.equal(calls,1);
 const op=await core.getOperation('c');assert.equal(op.status,'failed');assert.equal(op.last_error.outcome_unknown,true);
});

test('restart during requesting converts old-session op to unknown failure and never calls provider',async()=>{
 const store=storageMock();
 const op=model.createRequesting({operationId:'op',requestId:'req',provider:'ozon',conversationKey:'c',tabId:1,commandFingerprint:'f',normalizedCommand:{operation:'analytics_data'},workerSessionId:'ws-old'},{now:()=>1});await store.set({ops:{c:op}});
 let fetchCalls=0;const second=coreFactory.create({provider:'ozon',protocol,transport:{...transport,executeOne:async()=>{fetchCalls++;throw new Error('must not')}},runtimeModel:model,storage:store,storageKey:'ops',getCredentials:async()=>({}),workerSessionId:'ws-new',makeId:ids(),now:()=>2});
 const r=await second.recoverConversation({conversationKey:'c',candidateTabId:1,liveOwnerTabId:1});assert.equal(r.action,'fail_unknown_request');assert.equal(r.operation.status,'failed');assert.equal(fetchCalls,0);
});

test('restart during delivering returns exact stored delivery and can rebind only after owner loss',async()=>{
 const store=storageMock();let op=model.createRequesting({operationId:'op',requestId:'req',provider:'ozon',conversationKey:'c',tabId:1,commandFingerprint:'f',normalizedCommand:{operation:'analytics_data'},workerSessionId:'ws-old'},{now:()=>1});
 op=model.markDelivering(op,{deliveryId:'d',reportText:'R',outgoingText:'P\n\nR'},{now:()=>2});await store.set({ops:{c:op}});
 const core=coreFactory.create({provider:'ozon',protocol,transport,runtimeModel:model,storage:store,storageKey:'ops',getCredentials:async()=>({}),workerSessionId:'ws-new',makeId:ids(),now:()=>3});
 const blocked=await core.recoverConversation({conversationKey:'c',candidateTabId:2,liveOwnerTabId:1});assert.equal(blocked.action,'duplicate_non_owner');
 const rebound=await core.recoverConversation({conversationKey:'c',candidateTabId:2,liveOwnerTabId:null});assert.equal(rebound.action,'recover_delivery');assert.equal(rebound.rebound,true);assert.equal(rebound.recovery.outgoing_text,'P\n\nR');assert.equal((await core.getOperation('c')).tab_id,2);
});

test('delivery mismatch cannot complete or fail someone else operation',async()=>{
 const {core}=makeCore({fetchImpl:async()=>fakeResponse({ok:true})});const r=await core.execute({commandText:command,conversationKey:'c',tabId:1,requestId:'r1'});
 await assert.rejects(core.completeDelivery({conversationKey:'c',operationId:r.operation_id,deliveryId:'wrong'}),e=>e?.code==='DELIVERY_ID_MISMATCH');
 await assert.rejects(core.failDelivery({conversationKey:'c',operationId:r.operation_id,deliveryId:'wrong'}),e=>e?.code==='DELIVERY_ID_MISMATCH');
 assert.equal((await core.getOperation('c')).status,'delivering');
});
