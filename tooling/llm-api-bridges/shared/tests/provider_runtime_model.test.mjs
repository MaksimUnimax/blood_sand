import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const filename=fileURLToPath(new URL('../provider_runtime_model.js',import.meta.url));
const ctx={console,structuredClone,Date}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(filename,'utf8'),ctx,{filename});
const m=ctx.LLMProviderRuntimeModel;
const req=(over={})=>({operationId:'op-1',requestId:'req-1',provider:'ozon',conversationKey:'chat-1',tabId:7,commandFingerprint:'abc',normalizedCommand:{operation:'analytics_data'},workerSessionId:'ws-1',...over});

test('claim atomically grants first request and duplicates same request without second grant',()=>{
 const a=m.claim(null,req(),{now:()=>1}); assert.equal(a.granted,true); assert.equal(a.operation.status,'requesting');
 const dup=m.claim(a.operation,req(),{now:()=>2}); assert.equal(dup.granted,false); assert.equal(dup.duplicate,true); assert.equal(dup.code,'REQUEST_DUPLICATE');
 const other=m.claim(a.operation,req({requestId:'req-2',operationId:'op-2'}),{now:()=>3}); assert.equal(other.granted,false); assert.equal(other.code,'OPERATION_ACTIVE');
});

test('requesting -> delivering stores stable exact report/delivery metadata',()=>{
 const op=m.claim(null,req(),{now:()=>100}).operation;
 const d=m.markDelivering(op,{deliveryId:'del-1',reportText:'OZON_RESULT_V1\n{"x":"я"}',outgoingText:'prefix\n\nOZON_RESULT_V1\n{"x":"я"}',httpStatus:200,elapsedMs:55},{now:()=>200});
 assert.equal(d.status,'delivering'); assert.equal(d.delivery_id,'del-1'); assert.match(d.outgoing_text,/prefix/); assert.equal(d.http_status,200); assert.equal(d.elapsed_ms,55);
});

test('delivering -> completed is idempotent only after delivery',()=>{
 const op=m.markDelivering(m.claim(null,req(),{now:()=>1}).operation,{deliveryId:'d',reportText:'r',outgoingText:'r'},{now:()=>2});
 const done=m.markCompleted(op,{confirmedTurnId:'turn-9'},{now:()=>3}); assert.equal(done.status,'completed'); assert.equal(done.confirmed_user_turn_id,'turn-9');
 assert.equal(m.markCompleted(done,{confirmedTurnId:'other'},{now:()=>4}),done);
 assert.throws(()=>m.markCompleted(m.claim(null,req(),{now:()=>5}).operation,{}, {now:()=>6}),e=>e?.code==='INVALID_TRANSITION');
});

test('worker restart during requesting fails unknown and never returns replay action',()=>{
 const op=m.claim(null,req(),{now:()=>1}).operation;
 const r=m.recoverAfterWorkerStart(op,'ws-2',{now:()=>2}); assert.equal(r.action,'fail_unknown_request'); assert.equal(r.operation.status,'failed');
 assert.equal(r.operation.last_error.code,'REQUEST_OUTCOME_UNKNOWN'); assert.equal(r.operation.last_error.outcome_unknown,true);
 assert.notEqual(r.action,'replay_request'); assert.equal(Object.prototype.hasOwnProperty.call(r,'replay'), false);
});

test('same worker session requesting is not failed or replayed',()=>{
 const op=m.claim(null,req(),{now:()=>1}).operation;
 const r=m.recoverAfterWorkerStart(op,'ws-1',{now:()=>2}); assert.equal(r.action,'same_session_requesting'); assert.equal(r.operation,op);
});

test('worker restart during delivering returns exact recovery without API request semantics',()=>{
 const d=m.markDelivering(m.claim(null,req(),{now:()=>1}).operation,{deliveryId:'del',reportText:'RAW',outgoingText:'P\n\nRAW'},{now:()=>2});
 const r=m.recoverAfterWorkerStart(d,'ws-2',{now:()=>3}); assert.equal(r.action,'recover_delivery'); assert.equal(r.recovery.delivery_id,'del'); assert.equal(r.recovery.outgoing_text,'P\n\nRAW');
 assert.equal(r.recovery.report_text,'RAW'); assert.equal(r.recovery.operation_id,'op-1');
});

test('failed operation is terminal and does not get replaced by stale failure/completion',()=>{
 const op=m.claim(null,req(),{now:()=>1}).operation; const f=m.markFailed(op,{code:'HTTP_500',message:'bad'},{now:()=>2}); assert.equal(f.status,'failed');
 assert.equal(m.markFailed(f,{code:'X'},{now:()=>3}),f); assert.equal(m.recoverAfterWorkerStart(f,'ws-2').action,'terminal');
});

test('owner decision prevents live second tab stealing and allows rebound only after owner loss',()=>{
 const d=m.markDelivering(m.claim(null,req(),{now:()=>1}).operation,{deliveryId:'d',reportText:'r',outgoingText:'r'},{now:()=>2});
 const old=m.ownerDecision(d,{candidateTabId:7,liveOwnerTabId:7,candidateConversationKey:'chat-1'}); assert.equal(old.owner,true); assert.equal(old.rebound,false);
 const second=m.ownerDecision(d,{candidateTabId:9,liveOwnerTabId:7,candidateConversationKey:'chat-1'}); assert.equal(second.owner,false); assert.equal(second.reason,'duplicate_non_owner');
 const rebound=m.ownerDecision(d,{candidateTabId:9,liveOwnerTabId:null,candidateConversationKey:'chat-1'}); assert.equal(rebound.owner,true); assert.equal(rebound.rebound,true);
 const reboundOp=m.rebindOwner(d,9,{now:()=>3}); assert.equal(reboundOp.tab_id,9);
});

test('conversation mismatch can never own active operation',()=>{
 const op=m.claim(null,req(),{now:()=>1}).operation;
 const r=m.ownerDecision(op,{candidateTabId:7,liveOwnerTabId:7,candidateConversationKey:'chat-other'}); assert.equal(r.owner,false); assert.equal(r.reason,'conversation_mismatch');
});
