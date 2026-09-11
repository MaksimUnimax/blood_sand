import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const HERE=dirname(fileURLToPath(import.meta.url));
const ROOT=resolve(HERE,"../..");
const source=(p)=>readFileSync(join(ROOT,"dist-step7-candidate",p),"utf8");
const conversationId="11111111-2222-4333-8444-555555555555";
const conversationKey=`https://chatgpt.com|${conversationId}`;
const liveOwner={origin:"https://chatgpt.com",conversation_id:conversationId};
const storage={auto_runs:{},manual_ops:{},manual_modes:{},prefixes:{}};
let onConnect=null;
const normalize=(keys)=>Array.isArray(keys)?keys:(typeof keys==="string"?[keys]:Object.keys(keys||{}));

const context=vm.createContext({
  console,URL,TextEncoder,Uint8Array,ArrayBuffer,crypto:webcrypto,queueMicrotask,Promise,setTimeout,clearTimeout,structuredClone,
  indexedDB:{open(){throw new Error("not used");}},
  OzonRuntime:{STORAGE_KEYS:{REPORT_FILE_SESSION_STATE:"report_state",MANUAL_OPERATIONS:"manual_ops",AUTO_RUNS:"auto_runs",REPORT_PREFIXES:"prefixes",MANUAL_MODES:"manual_modes"}},
  ProviderTransportCore:{normalizeTrustedReportFileUrl(v){return String(v);},async executeTrustedReportFileOnce(){throw new Error("provider must not execute");},reportBase64ToBytes(){return new Uint8Array(0);}},
  BB2ConversationIdentity:{
    providerForOrigin(origin){return String(origin||"").toLowerCase()==="https://chatgpt.com"?"chatgpt":null;},
    conversationIdFromPath(pathname,provider="chatgpt"){if(provider!=="chatgpt")return null;const m=String(pathname||"").match(/\/c\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i);return m?.[1]?.toLowerCase()||null;},
    resolve({origin,pathname}){const m=String(pathname||"").match(/\/c\/([0-9a-f-]+)/i);return {origin:String(origin||"").toLowerCase(),conversation_id:m?.[1]?.toLowerCase()||null,status:m?"confirmed":"unknown",ai_id:"chatgpt"};}
  },
  OzonAIDeliveryCapabilities:{extensionFromFilename(n){return String(n||"").split(".").pop();},unicodeLength(v){return [...String(v||"")].length;},profile(){return null;},supportsFile(){return {supported:false};}},
  chrome:{
    storage:{local:{async get(keys){const out={};for(const k of normalize(keys))out[k]=structuredClone(storage[k]??{});return out;},async set(values){for(const [k,v] of Object.entries(values||{}))storage[k]=structuredClone(v);}},session:{async get(){return {report_state:{report_file_refs:{}}};}},onChanged:{addListener(){}}},
    runtime:{onConnect:{addListener(fn){onConnect=fn;}}},
    tabs:{async sendMessage(){return {ok:true};}}
  }
});
context.globalThis=context;
vm.runInContext(source("shared/bridge_autorun_model.js"),context,{filename:"bridge_autorun_model.js"});
vm.runInContext(source("shared/file_delivery_port_worker.js"),context,{filename:"file_delivery_port_worker.js"});
assert.equal(typeof onConnect,"function");
const model=context.BridgeAutorunModel;
storage.auto_runs[conversationKey]={run_id:"run-1",tab_id:7,origin:"https://chatgpt.com",conversation_id:conversationId,conversation_key:conversationKey,status:"delivering",sequence:0,pause_requested:false,finish_requested:false,delivery:{delivery_id:"delivery-1",mode:"attachment_watch_v1",phase:model.ATTACHMENT_PHASES.READY,adapter_id:"chatgpt",outgoing_text:'OZON_BATCH_RESULT_V1\\n{"delivery_id":"delivery-1"}',report_prefix_applied:false,artifact_descriptors:[],attached_filenames:["result.txt"],baseline_user_turn_ids:[],baseline_assistant_turn_ids:[],commit_actor_id:"content-1",attachment_send_actor_id:null}};

let listener=null; const responses=[];
const port={name:"ozon-attachment-delivery-v1",sender:{tab:{id:7,url:`https://chatgpt.com/c/${conversationId}`},url:`https://chatgpt.com/c/${conversationId}`},onMessage:{addListener(fn){listener=fn;}},onDisconnect:{addListener(){}},postMessage(msg){responses.push(structuredClone(msg));}};
onConnect(port); assert.equal(typeof listener,"function");
let seq=0;
async function call(type,payload={}){const request_id=`r${++seq}`;listener({request_id,type,...payload,live_owner:liveOwner});for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,0));const idx=responses.findIndex(x=>x.request_id===request_id);if(idx>=0)return responses.splice(idx,1)[0].response;}throw new Error(`timeout ${type}`);}
const owner={owner_kind:"autorun",owner_id:"run-1",run_id:"run-1",conversation_key:conversationKey,delivery_id:"delivery-1"};
const recovery=await call("OZ_ATTACHMENT_RECOVERY_GET",owner); assert.equal(recovery.ok,true); assert.equal(recovery.recovery.delivery_phase,"attachment_ready");
console.log("REG_ATTACHMENT_PORT_RECOVERY_GET_PASS");
const first=await call("OZ_ATTACHMENT_SEND_COMMIT",{...owner,actor_id:"content-1",baseline_user_turn_ids:["before"]}); assert.equal(first.ok,true); assert.equal(first.click_allowed,true);
const second=await call("OZ_ATTACHMENT_SEND_COMMIT",{...owner,actor_id:"content-1",baseline_user_turn_ids:["before"]}); assert.equal(second.ok,true); assert.equal(second.click_allowed,false); assert.equal(second.already_committed,true);
console.log("REG_ATTACHMENT_PORT_SEND_COMMIT_SINGLE_FLIGHT_PASS");
const rollback=await call("OZ_ATTACHMENT_SEND_ROLLBACK",{...owner,actor_id:"content-1",click_event_observed:false}); assert.equal(rollback.ok,true); assert.equal(rollback.rolled_back,true); assert.equal(storage.auto_runs[conversationKey].delivery.phase,"attachment_ready");
console.log("REG_ATTACHMENT_PORT_SAFE_ROLLBACK_PASS");
console.log("FILE_DELIVERY_PORT_WORKER_STATE_MACHINE_PASS");
