import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
const HERE=dirname(fileURLToPath(import.meta.url)); const ROOT=resolve(HERE,"../.."); const source=(p)=>readFileSync(join(ROOT,"dist-step7-candidate",p),"utf8");
vm.runInThisContext(source("shared/ai_delivery_capabilities.js")); vm.runInThisContext(source("shared/bridge_autorun_model.js")); vm.runInThisContext(source("shared/file_delivery_model_policy.js"));
const model=globalThis.BridgeAutorunModel; const large="x".repeat(1_048_001); const conversationKey="https://chatgpt.com|11111111-2222-4333-8444-555555555555";
const claimed=model.claimDelivery({origin:"https://chatgpt.com",status:model.RUN_STATUSES.COLLECTING,tab_id:7,conversation_key:conversationKey,batch:{entries:[]}},{deliveryId:"live-stop",mode:"batch_watch_v1",outgoingText:large});
assert.equal(claimed.delivery.mode,"attachment_watch_v1"); assert.equal(claimed.delivery.phase,"attachment_claimed");
console.log("REG_LIVE_STOP_LARGE_RESULT_CLASSIFIES_ATTACHMENT_PASS");

let changed=null; const sent=[]; const auto_runs={[conversationKey]:{...claimed,run_id:"run-1",tab_id:7,conversation_key:conversationKey}};
const workerCtx=vm.createContext({console,queueMicrotask,setTimeout:(fn)=>{queueMicrotask(fn);return 1;},OzonRuntime:{STORAGE_KEYS:{AUTO_RUNS:"auto_runs",MANUAL_OPERATIONS:"manual_ops"}},chrome:{storage:{local:{async get(){return {auto_runs,manual_ops:{}};}},onChanged:{addListener(fn){changed=fn;}}},tabs:{async sendMessage(tabId,message){sent.push({tabId,message});return {ok:true};}}}}); workerCtx.globalThis=workerCtx;
vm.runInContext(source("shared/file_delivery_wake_worker.js"),workerCtx);
await new Promise(r=>setTimeout(r,0));
assert(sent.some(x=>x.message?.type==="OZ_ATTACHMENT_DELIVERY_WAKE"&&x.message?.delivery_id==="live-stop"));
console.log("REG_LIVE_STOP_STORAGE_WAKE_EMITTED_PASS");

let wakeListener=null; let recoverCalls=0; const contentCtx=vm.createContext({console,queueMicrotask,globalThis:null,chrome:{runtime:{onMessage:{addListener(fn){wakeListener=fn;}}}}}); contentCtx.globalThis=contentCtx; contentCtx.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__={disposed:false,recoverCurrent(){recoverCalls+=1;return Promise.resolve({ok:true});}};
vm.runInContext(source("attachment_delivery_wake_content.js"),contentCtx); assert.equal(wakeListener({type:"OZ_ATTACHMENT_DELIVERY_WAKE"}),false); await new Promise(r=>setTimeout(r,0)); assert.equal(recoverCalls,1);
console.log("REG_LIVE_STOP_WAKE_REACHES_PORT_RECOVERY_PASS");
console.log("FILE_DELIVERY_LIVE_STOP_REPRO_PASS");
