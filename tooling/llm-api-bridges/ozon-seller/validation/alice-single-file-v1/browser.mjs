import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const EXTENSION = resolve(process.argv[3] || join(ROOT, "dist-step7-candidate"));
const chromePath = process.argv[2] || process.env.CHROME_PATH || "google-chrome";
const profile = mkdtempSync(join(tmpdir(), "ozon-file-delivery-extension-smoke-"));

function unpackedExtensionId(path) {
  const hex = createHash("sha256").update(resolve(path), "utf8").digest("hex").slice(0, 32);
  return [...hex].map((character) => String.fromCharCode("a".charCodeAt(0) + parseInt(character, 16))).join("");
}

function sleep(ms) { return new Promise((resolveSleep) => setTimeout(resolveSleep, ms)); }

const expectedExtensionId = unpackedExtensionId(EXTENSION);
const chromeArgs = [
  "--no-sandbox",
  "--disable-gpu",
  "--disable-background-networking",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${profile}`,
  "--remote-debugging-pipe",
  `--disable-extensions-except=${EXTENSION}`,
  `--load-extension=${EXTENSION}`,
  "about:blank"
];
if (!process.env.DISPLAY) chromeArgs.unshift("--headless=new");

// Chromium's --remote-debugging-pipe contract is fixed to FD 3 for requests and
// FD 4 for responses. Node exposes those child descriptors as stdio[3]/stdio[4].
const child = spawn(chromePath, chromeArgs, { stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"] });
const cdpInput = child.stdio[3];
const cdpOutput = child.stdio[4];
assert(cdpInput && cdpOutput, "Chrome CDP pipe descriptors 3/4 were not created");

const notifications=[];
let stderr = "";
child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
  if (stderr.length > 200_000) stderr = stderr.slice(-200_000);
});

function cdpPipeSession() {
  let id = 0;
  let buffer = Buffer.alloc(0);
  let closed = false;
  const pending = new Map();

  function rejectAll(error) {
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(error);
    }
    pending.clear();
  }

  function consume() {
    while (true) {
      const separator = buffer.indexOf(0);
      if (separator < 0) return;
      const frame = buffer.subarray(0, separator);
      buffer = buffer.subarray(separator + 1);
      if (!frame.length) continue;
      let message;
      try {
        message = JSON.parse(frame.toString("utf8"));
      } catch (error) {
        rejectAll(new Error(`Invalid CDP pipe JSON: ${error.message}; frame=${frame.toString("utf8").slice(0, 1000)}`));
        return;
      }
      if (!message.id) { notifications.push(message); void handleEvent(message); continue; }
      if (!pending.has(message.id)) continue;
      const item = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(item.timer);
      if (message.error) item.reject(new Error(message.error.message || `CDP error ${message.error.code || ""}`));
      else item.resolve(message.result);
    }
  }

  cdpOutput.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
    consume();
  });
  cdpInput.on("error", (error) => rejectAll(new Error(error.message+" stderr="+stderr)));
  child.stdout.on("error", (error) => rejectAll(new Error(error.message+" stderr="+stderr)));
  child.stderr.on("error", (error) => rejectAll(error));
  cdpOutput.on("error", (error) => rejectAll(new Error(error.message+" stderr="+stderr)));
  cdpOutput.on("close", () => {
    closed = true;
    rejectAll(new Error(`Chrome CDP output pipe closed. stderr=${stderr}`));
  });
  child.once("exit", (code, signal) => {
    closed = true;
    rejectAll(new Error(`Chrome exited code=${code} signal=${signal}. stderr=${stderr}`));
  });

  return {
    async call(method, params = {}, sessionId = null, timeoutMs = 15_000) {
      if (closed) throw new Error(`CDP pipe is closed before ${method}. stderr=${stderr}`);
      const requestId = ++id;
      const payload = { id: requestId, method, params };
      if (sessionId) payload.sessionId = sessionId;
      const promise = new Promise((resolvePending, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`Timed out waiting for CDP pipe response to ${method}. stderr=${stderr}`));
        }, timeoutMs);
        pending.set(requestId, { resolve: resolvePending, reject, timer });
      });
      cdpInput.write(`${JSON.stringify(payload)}\0`);
      return await promise;
    },
    close() {
      try { cdpInput.end(); } catch (_) {}
    }
  };
}

const browser = cdpPipeSession();

async function waitForBrowserPipe() {
  const deadline = Date.now() + 15_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const version = await browser.call("Browser.getVersion", {}, null, 2_000);
      if (version?.product) return version;
    } catch (error) {
      lastError = error;
    }
    if (child.exitCode !== null) throw new Error(`Chrome exited before CDP pipe became ready. stderr=${stderr}`);
    await sleep(100);
  }
  throw new Error(`Timed out waiting for Chrome CDP pipe. last_error=${lastError?.message || "none"} stderr=${stderr}`);
}

async function waitForServiceWorker() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const { targetInfos = [] } = await browser.call("Target.getTargets");
    const worker = targetInfos.find((target) => target.type === "service_worker" && String(target.url || "") === `chrome-extension://${expectedExtensionId}/service_worker_entry.js`);
    if (worker?.targetId) return worker;
    await sleep(100);
  }
  const { targetInfos = [] } = await browser.call("Target.getTargets").catch(() => ({ targetInfos: [] }));
  throw new Error(`Timed out waiting for activated extension service worker ${expectedExtensionId}. targets=${JSON.stringify(targetInfos)} stderr=${stderr}`);
}

async function evaluate(sessionId, expression) {
  const result = await browser.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (result?.exceptionDetails) throw new Error(`Runtime.evaluate exception: ${JSON.stringify(result.exceptionDetails)}`);
  return result?.result?.value;
}

async function waitForServiceWorkerBootstrap(sessionId) {
  const deadline = Date.now() + 15_000;
  let lastObserved = null;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      lastObserved = await evaluate(sessionId, `(() => ({
        capabilities: typeof OzonAIDeliveryCapabilities,
        file_delivery_worker: typeof OzonFileDeliveryWorker,
        provider_transport: typeof ProviderTransportCore,
        indexed_db: typeof indexedDB
      }))()`);
      if (lastObserved?.capabilities === "object" &&
          lastObserved?.file_delivery_worker === "object" &&
          lastObserved?.provider_transport === "object" &&
          lastObserved?.indexed_db === "object") {
        return lastObserved;
      }
    } catch (error) {
      lastError = error;
    }
    if (child.exitCode !== null) {
      throw new Error(`Chrome exited while waiting for service-worker bootstrap. last_observed=${JSON.stringify(lastObserved)} last_error=${lastError?.message || "none"} stderr=${stderr}`);
    }
    await sleep(50);
  }
  throw new Error(`Timed out waiting for service-worker bootstrap readiness. last_observed=${JSON.stringify(lastObserved)} last_error=${lastError?.message || "none"} stderr=${stderr}`);
}

const rows=[];const conversation='11111111-2222-4333-8444-555555555555';
const origin='https://alice.yandex.ru',pageUrl=origin+'/chat/'+conversation;
let pageSession,workerSession,world;
async function handleEvent(e){if(e.method==='Fetch.requestPaused'){
 const request=e.params;
 try{if(request.request.url===pageUrl)await browser.call('Fetch.fulfillRequest',{requestId:request.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from('<!doctype html><html><body>Offline Alice origin fixture. No network.</body></html>').toString('base64')},e.sessionId);
 else await browser.call('Fetch.failRequest',{requestId:request.requestId,errorReason:'Aborted'},e.sessionId);}catch(_){}
}}
function passed(name){rows.push(name);console.log('PASS',name);}
async function evalWorld(expression){const r=await browser.call('Runtime.evaluate',{expression,contextId:world,awaitPromise:true,returnByValue:true},pageSession);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
async function port(type,owner){return evalWorld(`new Promise((ok,no)=>{
 const port=chrome.runtime.connect({name:'ozon-attachment-delivery-v1'});const id=crypto.randomUUID();const timer=setTimeout(()=>no(Error('port timeout')),8000);
 port.onMessage.addListener(r=>{if(r.request_id===id){clearTimeout(timer);port.disconnect();ok(r.response);}});
 port.postMessage({request_id:id,type:${JSON.stringify(type)},conversation_key:${JSON.stringify(origin+'|'+conversation)},owner_kind:'manual',owner_id:${JSON.stringify(owner.operation_id)},delivery_id:${JSON.stringify(owner.delivery.delivery_id)},actor_id:'real-chrome-fixture',live_owner:{origin:${JSON.stringify(origin)},conversation_id:${JSON.stringify(conversation)}},attached_filenames:['fixture.csv'],confirmed_user_turn_id:'fixture-user-turn'});
})`);}
const init=`(async()=>{
 globalThis.__fixtureCalls=[];
 globalThis.OzonProvider=OzonDirectBinaryDeliveryPatch.wrapProvider(OzonProviderFactory.createOzonProvider({fetchImpl:async(url,options)=>{
  __fixtureCalls.push(String(url));
  if(String(url).includes('/v1/report/info'))return new Response(JSON.stringify({result:{code:'REPORT_CHROME_FIXTURE',status:'processing',note:globalThis.__largeText?'X'.repeat(95000):'small-result'}}),{headers:{'content-type':'application/json'}});
  if(String(url).startsWith('https://files.ozon.ru/'))return new Response('sku;qty\\n111;3\\n',{headers:{'content-type':'text/csv'}});
  throw Error('Unexpected fixture request');
 }}));
 return true;
})()`;
const seed=`(async()=>{
 const tab=(await chrome.tabs.query({url:${JSON.stringify(pageUrl)}}))[0];if(!tab)throw Error('fixture tab missing');
 const key=${JSON.stringify(origin+'|'+conversation)};
 const settings={ozmb_seller_client_id:'fixture-client',ozmb_seller_api_key:'fixture-only',ozmb_personal_data_enabled_v1:false,ozmb_manual_modes:{[key]:true}};
 await chrome.storage.local.set(settings);
 const t=Date.now(),ref1='rpf_s_00000000-0000-4000-8000-000000000001',ref2='rpf_s_00000000-0000-4000-8000-000000000002';
 await chrome.storage.session.set({ozmb_report_file_session_state_v1:{schema_version:2,report_code_policies:{},report_file_refs:Object.fromEntries([ref1,ref2].map((r,i)=>[r,{url:'https://files.ozon.ru/fixture-'+i+'.csv',personal_data_required:false,created_at_ms:t,expires_at_ms:t+1800000,provider_expires_at_ms:t+1800000}]))}});
 const source='OZON_API_V1\\n'+JSON.stringify({operation:'report_file_get',params:{file_ref:ref1,offset:0,limit:200}})+'\\nOZON_API_V1\\n'+JSON.stringify({operation:'report_file_get',params:{file_ref:ref2,offset:0,limit:200}})+'\\nOZON_API_V1\\n'+JSON.stringify({operation:'report_info',params:{code:'REPORT_CHROME_FIXTURE'}})+'\\nOZON_HELP_V2\\n'+JSON.stringify({cluster:'returns_cancellations',section:'returns'});
 const owner={operation_id:'chrome-'+crypto.randomUUID(),origin:${JSON.stringify(origin)},conversation_id:${JSON.stringify(conversation)},conversation_key:key,ai_id:'alice',tab_id:tab.id,status:'requesting',batch:{entries:discoverBatchEntries(source),next_index:0,request_state:'idle',policy_state:'pending',capability_state:'pending',query_planning_state:'pending'}};
 await chrome.storage.local.set({ozmb_manual_operations:{[key]:owner}});await processManualBatch(key,owner.operation_id);
 return await getManualOperation(key);
})()`;
const readArtifact=(ref)=>`(async()=>{
 const db=await new Promise((ok,no)=>{const q=indexedDB.open('ozon_bridge_delivery_artifacts_v1',1);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error);});
 try{return await new Promise((ok,no)=>{const tx=db.transaction('artifacts','readonly'),q=tx.objectStore('artifacts').get('provider:'+${JSON.stringify(ref)});let r;q.onsuccess=()=>{const a=q.result;r=a?{text:new TextDecoder().decode(a.bytes),length:a.byte_length,hash:a.sha256,expires:a.expires_at_ms}:null;};q.onerror=()=>no(q.error);tx.oncomplete=()=>ok(r);tx.onabort=()=>no(tx.error);});}finally{db.close();}
})()`;
try{
 await waitForBrowserPipe();
 const popup=await browser.call('Target.createTarget',{url:`chrome-extension://${expectedExtensionId}/popup.html`});const ps=(await browser.call('Target.attachToTarget',{targetId:popup.targetId,flatten:true})).sessionId;
 await browser.call('ServiceWorker.enable',{},ps);
 const target=await browser.call('Target.createTarget',{url:'about:blank'});pageSession=(await browser.call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 await browser.call('Runtime.enable',{},pageSession);await browser.call('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]},pageSession);
 await browser.call('Page.navigate',{url:pageUrl},pageSession);
 for(let i=0;i<80&&!world;i++){for(const e of notifications.filter(e=>e.sessionId===pageSession&&e.method==='Runtime.executionContextCreated')){const id=e.params.context.id;try{const r=await browser.call('Runtime.evaluate',{expression:'typeof OzonRuntime!=="undefined" && typeof chrome.runtime.connect==="function"',contextId:id,returnByValue:true},pageSession);if(r.result?.value===true){world=id;break;}}catch(_){}}if(!world)await sleep(100);}
 assert(world,'real extension isolated world not found');
 await evalWorld('globalThis.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__?.dispose?.(); true');
 let worker=await waitForServiceWorker();workerSession=(await browser.call('Target.attachToTarget',{targetId:worker.targetId,flatten:true})).sessionId;await waitForServiceWorkerBootstrap(workerSession);
 async function block(sid){await browser.call('Network.enable',{},sid);await browser.call('Network.setBlockedURLs',{urls:['*api-seller.ozon.ru*','*api-performance.ozon.ru*','*files.ozon.ru*','*ozone.ru*']},sid);}
 await block(workerSession);await evaluate(workerSession,init);
 const o=await evaluate(workerSession,seed);assert.equal(o.status,'delivering');assert.equal(o.batch.entries[1].http_status,0);assert.equal(await evaluate(workerSession,'__fixtureCalls.length'),2);
 const c=await port('OZ_ATTACHMENT_COMMIT',o);assert.equal(c.ok,true,JSON.stringify(c));assert.equal(c.attach_allowed,true);assert.equal(c.recovery.artifact_descriptors.length,1);assert.ok(c.recovery.outgoing_text.includes('TARGET_AI_FILE_LIMIT'));assert.ok(c.recovery.outgoing_text.includes('OZON_GUIDANCE_RESULT_V2'));passed('actual worker queue + real Port: one file, deferred second, full text and HELP');
 for(const name of ['OZ_ATTACHMENT_READY','OZ_ATTACHMENT_SEND_COMMIT','OZ_ATTACHMENT_CONFIRM'])assert.equal((await port(name,o)).ok,true);
 await evaluate(workerSession,'globalThis.__largeText=true');const big=await evaluate(workerSession,seed);const bigc=await port('OZ_ATTACHMENT_COMMIT',big);assert.equal(bigc.ok,true,JSON.stringify(bigc));assert.equal(bigc.recovery.artifact_descriptors.length,1);assert(bigc.recovery.outgoing_text.length<90000);assert(bigc.recovery.outgoing_text.includes('full_text_deferred'));
 const saved=await evaluate(workerSession,readArtifact(big.delivery.retained_text_ref));assert.equal(saved.text,big.delivery.inline_result_text);assert.equal(saved.hash,createHash('sha256').update(saved.text).digest('hex'));passed('overflow: actual IndexedDB transaction persisted complete exact TXT before receipt');
 for(const name of ['OZ_ATTACHMENT_READY','OZ_ATTACHMENT_SEND_COMMIT','OZ_ATTACHMENT_CONFIRM'])assert.equal((await port(name,big)).ok,true);
 assert.deepEqual(await evaluate(workerSession,readArtifact(big.delivery.retained_text_ref)),saved);passed('confirm current original preserves pending TXT artifact');
 await evaluate(workerSession,'globalThis.__mustDisappear=true');let version;
 for(let i=0;i<80&&!version;i++){for(const e of notifications)for(const v of e.params?.versions||[])if(v.scriptURL===worker.url&&v.runningStatus==='running')version=v.versionId;if(!version)await sleep(100);}
 assert(version);const oldTarget=worker.targetId;await browser.call('Target.detachFromTarget',{sessionId:workerSession});await browser.call('ServiceWorker.stopWorker',{versionId:version},ps);
 await evaluate(ps,`chrome.runtime.sendMessage({type:'OZ_GET_GLOBAL_SETTINGS_STATE'}).then(()=>true)`);
 for(let i=0;i<80;i++){worker=await waitForServiceWorker();if(worker.targetId!==oldTarget)break;await sleep(100);}assert.notEqual(worker.targetId,oldTarget);
 workerSession=(await browser.call('Target.attachToTarget',{targetId:worker.targetId,flatten:true})).sessionId;await waitForServiceWorkerBootstrap(workerSession);await block(workerSession);assert.equal(await evaluate(workerSession,'globalThis.__mustDisappear===undefined'),true);await evaluate(workerSession,init);passed('actual stopWorker -> new target -> new global context');
 assert.deepEqual(await evaluate(workerSession,readArtifact(big.delivery.retained_text_ref)),saved);
 const local=await evaluate(workerSession,`(async()=>{const key=${JSON.stringify(origin+'|'+conversation)},prior=await getManualOperation(key);const command={operation:'report_file_get',params:{file_ref:${JSON.stringify(big.delivery.retained_text_ref)},offset:0,limit:200}};const owner={...prior,operation_id:'local-'+crypto.randomUUID(),status:'requesting',delivery:null,batch:{entries:discoverBatchEntries('OZON_API_V1\\n'+JSON.stringify(command)),next_index:0,request_state:'idle',policy_state:'pending',capability_state:'pending',query_planning_state:'pending'}};await chrome.storage.local.set({ozmb_manual_operations:{[key]:owner}});await processManualBatch(key,owner.operation_id);return await getManualOperation(key);})()`);
 assert.equal(JSON.parse(local.batch.entries[0].report_text.slice('OZON_RESULT_V1\n'.length)).result.delivery.state,'local_file_ready',local.batch.entries[0].report_text);assert.equal(local.batch.entries[0].http_status,0);assert.equal(local.batch.entries[0].external_request_executed,false);assert.equal(await evaluate(workerSession,'__fixtureCalls.length'),0);const lc=await port('OZ_ATTACHMENT_COMMIT',local);assert.equal(lc.ok,true,JSON.stringify(lc));assert.equal(lc.recovery.artifact_descriptors.length,1);assert.equal(lc.recovery.artifact_descriptors[0].source_kind,'generated_bridge_text');passed('after new worker: local exact-command read delivers one TXT with zero Ozon calls');
 const network=notifications.filter(e=>e.method==='Network.requestWillBeSent'&&/^https:\/\/(?:api-seller\.ozon\.ru|api-performance\.ozon\.ru|files\.ozon\.ru)/.test(e.params?.request?.url||''));assert.equal(network.length,0);passed('real browser network observation: zero Ozon calls');
 console.log(JSON.stringify({status:'PASS',cases:rows,worker_recreated:true,provider_calls:0}));
 if(process.env.OZON_SINGLE_BROWSER_REPORT)writeFileSync(process.env.OZON_SINGLE_BROWSER_REPORT,JSON.stringify({status:'PASS',cases:rows,worker_recreated:true,provider_calls:0},null,2));
}finally{browser.close();try{child.kill('SIGTERM');}catch(_){}await Promise.race([new Promise(r=>child.once('exit',r)),sleep(3000)]);if(child.exitCode===null)child.kill('SIGKILL');rmSync(profile,{recursive:true,force:true});}
