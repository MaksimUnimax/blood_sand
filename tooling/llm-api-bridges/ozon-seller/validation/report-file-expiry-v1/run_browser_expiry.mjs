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
      if (!message.id) { notifications.push(message); continue; }
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
const rows=[];
function passed(name){rows.push({name,status:'PASS'});console.log(name+' PASS');}
const init=`(async()=>{
 const saved=await chrome.storage.session.get('__report_expiry_fixture');
 globalThis.__fixture=saved.__report_expiry_fixture||{clock:Date.now(),expiry:Date.now()+60000};
 globalThis.__fixtureCalls=[];
 const fileUrl='https://cdn1.ozone.ru/expiry-fixture/report.csv?signature=FIXTURE_ONLY';
 globalThis.__fixtureProvider=OzonProviderFactory.createOzonProvider({now:()=>__fixture.clock,fetchImpl:async(url,options)=>{
  __fixtureCalls.push(String(url));
  if(String(url)==='https://api-seller.ozon.ru/v1/report/products/create')return new Response(JSON.stringify({result:{code:'REPORT_BROWSER_FIXTURE'}}),{headers:{'content-type':'application/json'}});
  if(String(url)==='https://api-seller.ozon.ru/v1/report/info')return new Response(JSON.stringify({result:{code:'REPORT_BROWSER_FIXTURE',status:'success',error:'',file:fileUrl,report_type:'seller_products',expires_at:new Date(__fixture.expiry).toISOString()}}),{headers:{'content-type':'application/json'}});
  if(String(url)===fileUrl){if(options.credentials!=='omit'||options.redirect!=='error')throw Error('transport security changed');return new Response('sku;qty\\n123;4\\n',{headers:{'content-type':'text/csv'}});}
  throw Error('Unexpected fixture transport endpoint');
 }});
 return true;
})()`;
const readArtifact=`(async()=>{
 const data=await chrome.storage.session.get('__report_expiry_fixture');const ref=data.__report_expiry_fixture.ref;
 const db=await new Promise((ok,no)=>{const r=indexedDB.open('ozon_bridge_delivery_artifacts_v1',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
 try{return await new Promise((ok,no)=>{const tx=db.transaction('artifacts','readonly');const request=tx.objectStore('artifacts').get('provider:'+ref);let result;request.onsuccess=()=>{const a=request.result;result=a?{text:new TextDecoder().decode(a.bytes),sha:a.sha256,expiry:a.expires_at_ms,created:a.created_at_ms}:null;};request.onerror=()=>no(request.error);tx.oncomplete=()=>ok(result);tx.onabort=()=>no(tx.error);});}finally{db.close();}
})()`;
try{
 await waitForBrowserPipe();
 const popup=await browser.call('Target.createTarget',{url:`chrome-extension://${expectedExtensionId}/popup.html`});
 const ps=(await browser.call('Target.attachToTarget',{targetId:popup.targetId,flatten:true})).sessionId;
 await browser.call('ServiceWorker.enable',{},ps);
 let target=await waitForServiceWorker();let sid=(await browser.call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 await waitForServiceWorkerBootstrap(sid);
 async function blockOzon(session){await browser.call('Network.enable',{},session);await browser.call('Network.setBlockedURLs',{urls:['*api-seller.ozon.ru*','*api-performance.ozon.ru*','*ozone.ru*']},session);}
 await blockOzon(sid);await evaluate(sid,init);
 const first=await evaluate(sid,`(async()=>{
  const p=__fixtureProvider,c={clientId:'fixture-client',apiKey:'fixture-only'};
  await p.executeCommandObject({operation:'report_products_create',params:{}},c,{});
  const info=await p.executeCommandObject({operation:'report_info',params:{code:'REPORT_BROWSER_FIXTURE'}},c,{});
  __fixture.ref=info.result.report_file_ref;await chrome.storage.session.set({__report_expiry_fixture:__fixture});
  const file=await p.executeCommandObject({operation:'report_file_get',params:{file_ref:__fixture.ref}},{},{});
  const state=(await chrome.storage.session.get(OzonRuntime.STORAGE_KEYS.REPORT_FILE_SESSION_STATE))[OzonRuntime.STORAGE_KEYS.REPORT_FILE_SESSION_STATE];
  globalThis.__mustDisappearOnRestart=true;
  return {status:file.http_status,format:file.result.format,calls:__fixtureCalls.length,ref:__fixture.ref,record:state.report_file_refs[__fixture.ref].expires_at_ms,expiry:__fixture.expiry,schema:state.schema_version};
 })()`);
 assert.equal(first.status,200);assert.equal(first.format,'csv');assert.equal(first.calls,3);assert.match(first.ref,/^rpf_s_/);assert.equal(first.record,first.expiry);assert.equal(first.schema,2);passed('REAL_CHROME_PROVIDER_CREATE_INFO_GET_SESSION_DEADLINE');
 const artifact=await evaluate(sid,readArtifact);assert.equal(artifact.text,'sku;qty\n123;4\n');assert.equal(artifact.sha,createHash('sha256').update(artifact.text).digest('hex'));assert(artifact.expiry>first.expiry);passed('REAL_CAPTURE_WRAPPER_STORES_EXACT_BYTES_IN_INDEXEDDB');
 // Stop the actual extension SW, not merely a JS factory, then wake it using a local settings read.
 let versionId=null;
 for(let i=0;i<30&&!versionId;i++){for(const e of notifications)for(const v of e.params?.versions||[])if(v.scriptURL===target.url&&v.runningStatus==='running')versionId=v.versionId;if(!versionId)await sleep(50);}
 assert(versionId,'CDP must identify the real extension worker version');
 const oldTarget=target.targetId;await browser.call('Target.detachFromTarget',{sessionId:sid});await browser.call('ServiceWorker.stopWorker',{versionId},ps);
 await evaluate(ps,`chrome.runtime.sendMessage({type:'OZ_GET_GLOBAL_SETTINGS_STATE'}).then(()=>true)`);
 for(let i=0;i<100;i++){target=await waitForServiceWorker();if(target.targetId!==oldTarget)break;await sleep(50);}
 assert.notEqual(target.targetId,oldTarget,'worker target must actually change');sid=(await browser.call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 await waitForServiceWorkerBootstrap(sid);await blockOzon(sid);assert.equal(await evaluate(sid,'globalThis.__mustDisappearOnRestart===undefined'),true);passed('ACTUAL_MV3_STOP_AND_NEW_WORKER_ACTIVATION');
 await evaluate(sid,init);
 const expired=await evaluate(sid,`(async()=>{
  const state=(await chrome.storage.session.get(OzonRuntime.STORAGE_KEYS.REPORT_FILE_SESSION_STATE))[OzonRuntime.STORAGE_KEYS.REPORT_FILE_SESSION_STATE];
  const deadline=state.report_file_refs[__fixture.ref].expires_at_ms;
  __fixture.clock=deadline;let error=null;
  try{await __fixtureProvider.executeCommandObject({operation:'report_file_get',params:{file_ref:__fixture.ref}},{},{});}catch(e){error={code:e.code,external:e.external_request_executed};}
  return {deadline,calls:__fixtureCalls.length,error};
 })()`);
 assert.equal(expired.deadline,first.expiry);assert.equal(expired.calls,0);assert.equal(expired.error.code,'REPORT_FILE_EXPIRED');assert.equal(expired.error.external,false);passed('EXPIRED_GET_AFTER_REAL_SW_RESTART_ZERO_NETWORK_CALLS');
 const preserved=await evaluate(sid,readArtifact);assert.deepEqual(preserved,artifact);passed('URL_EXPIRY_DOES_NOT_DELETE_VALID_DOWNLOADED_ARTIFACT');
 const oldInfo=await evaluate(sid,`(async()=>{
  const out=await __fixtureProvider.executeCommandObject({operation:'report_info',params:{code:'REPORT_BROWSER_FIXTURE'}},{clientId:'fixture-client',apiKey:'fixture-only'},{});
  return {status:out.http_status,ref:out.result.report_file_ref||null,state:out.result.file_availability.state,next:OzonLlmOutputReportWorkflowPatch.instructionPayload(out.report_text).workflow_continuations[0].next_command,calls:__fixtureCalls.length};
 })()`);
 assert.equal(oldInfo.status,200);assert.equal(oldInfo.state,'expired');assert.equal(oldInfo.ref,null);assert.equal(oldInfo.next,null);assert.equal(oldInfo.calls,1);passed('EXPIRED_INFO_NO_NEW_REF_OR_CONTINUATION_REAL_BROWSER');
 const network=notifications.filter(e=>e.method==='Network.requestWillBeSent'&&/^https:\/\/(?:api-seller\.ozon\.ru|api-performance\.ozon\.ru|cdn1\.ozone\.ru)/.test(e.params?.request?.url||''));assert.equal(network.length,0);passed('BROWSER_NETWORK_OBSERVATION_NO_REAL_OZON_REQUEST');
 console.log('REPORT_EXPIRY_REAL_MV3_PASS');
 if(process.env.OZON_BROWSER_EXPIRY_REPORT)writeFileSync(process.env.OZON_BROWSER_EXPIRY_REPORT,JSON.stringify({status:'PASS',cases:rows,real_worker_recreated:true,provider_calls:0},null,2)+'\n');
}finally{
 browser.close();try{child.kill('SIGTERM');}catch(_){}await Promise.race([new Promise(r=>child.once('exit',r)),sleep(3000)]);try{if(child.exitCode===null)child.kill('SIGKILL');}catch(_){}rmSync(profile,{recursive:true,force:true});
}
