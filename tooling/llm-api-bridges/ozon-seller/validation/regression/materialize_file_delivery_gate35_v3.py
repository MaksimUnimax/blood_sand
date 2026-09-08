from pathlib import Path
import json
import textwrap

ROOT = Path('tooling/llm-api-bridges/ozon-seller')
DIST = ROOT / 'dist-step7-candidate'
REG = ROOT / 'validation/regression'


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).lstrip('\n').rstrip() + '\n', encoding='utf-8')


# Exact MV3 worker bootstrap. The historical provider/request worker stays byte-unchanged.
write(DIST / 'service_worker_entry.js', r'''
    /* Multi-AI delivery bootstrap. Historical worker stays byte-unchanged; delivery policy wraps it additively. */
    importScripts("shared/ai_delivery_capabilities.js");
    importScripts("service_worker.js");
    importScripts("shared/file_delivery_model_policy.js");
    /* Attachment RPC uses a named runtime Port so the legacy catch-all onMessage listener cannot race responses. */
    importScripts("shared/file_delivery_port_worker.js");
    /* Storage changes wake only affected tabs; the Port remains the sole attachment RPC channel. */
    importScripts("shared/file_delivery_wake_worker.js");
''')

# Mixed-batch and adapter-safety policy.
write(DIST / 'shared/file_delivery_model_policy.js', r'''
    /* global BridgeAutorunModel, OzonAIDeliveryCapabilities */
    (() => {
      "use strict";

      const BASE = globalThis.BridgeAutorunModel;
      if (!BASE || typeof BASE.claimDelivery !== "function") throw new Error("BridgeAutorunModel is required before file delivery policy.");

      function successfulReportFileRef(entry) {
        if (!entry || entry.status !== "complete") return null;
        const operation = String(entry?.command?.operation || entry?.operation || "");
        if (operation !== "report_file_get") return null;
        const httpStatus = Number(entry.http_status || 0);
        if (!(httpStatus >= 200 && httpStatus < 300)) return null;
        return String(entry?.command?.params?.file_ref || "").trim() || null;
      }

      function needsCompleteTextCompanion(run, payload, providerFileRefs) {
        if (!Array.isArray(providerFileRefs) || providerFileRefs.length === 0) return false;
        if (payload?.reportPrefixApplied === true) return true;
        const entries = Array.isArray(run?.batch?.entries) ? run.batch.entries : [];
        if (!entries.length) return false;
        return entries.some((entry) => successfulReportFileRef(entry) === null);
      }

      function generatedDocument(deliveryId, text) {
        const value = String(text || "");
        const capabilities = globalThis.OzonAIDeliveryCapabilities;
        return Object.freeze({
          artifact_id: `generated-${String(deliveryId || "")}`,
          filename: `ozon-bridge-result-${String(deliveryId || "")}.txt`,
          mime_type: "text/plain;charset=utf-8",
          extension: "txt",
          unicode_char_length: capabilities?.unicodeLength?.(value) ?? [...value].length,
          byte_length: capabilities?.utf8ByteLength?.(value) ?? new TextEncoder().encode(value).byteLength,
          complete: true,
          materialization_reason: "mixed_batch_companion"
        });
      }

      function legacyTextClaim(run, payload) {
        return {
          ...run,
          status: BASE.RUN_STATUSES.DELIVERING,
          delivery: {
            delivery_id: String(payload.deliveryId || ""),
            phase: BASE.DELIVERY_PHASES.CLAIMED,
            mode: String(payload.mode || "legacy"),
            request_id: String(payload.requestId || ""),
            outgoing_text: String(payload.outgoingText || ""),
            outgoing_hash: String(payload.outgoingHash || ""),
            report_prefix_applied: payload.reportPrefixApplied === true,
            baseline_user_turn_ids: [],
            commit_actor_id: null,
            claimed_at: new Date().toISOString()
          }
        };
      }

      function hasLiveAttachmentStrategy(adapterId) {
        const profile = globalThis.OzonAIDeliveryCapabilities?.profile?.(adapterId) || null;
        return Boolean(profile?.status === "implemented" && profile?.attachment_strategy === "file_input_v1");
      }

      function claimDelivery(run, payload = {}) {
        const next = BASE.claimDelivery(run, payload);
        if (!next?.delivery || next.delivery.mode !== "attachment_watch_v1") return next;

        if (!hasLiveAttachmentStrategy(next.delivery.adapter_id)) {
          if (next.delivery.generated_text_document) return next;
          return legacyTextClaim(run, payload);
        }

        const providerFileRefs = Array.isArray(next.delivery.provider_file_refs) ? next.delivery.provider_file_refs : [];
        if (!providerFileRefs.length || next.delivery.generated_text_document) return next;
        if (!needsCompleteTextCompanion(run, payload, providerFileRefs)) return next;

        const completeText = String(payload.outgoingText || "");
        return {
          ...next,
          delivery: {
            ...next.delivery,
            artifact_text: completeText,
            generated_text_document: generatedDocument(next.delivery.delivery_id || payload.deliveryId, completeText)
          }
        };
      }

      globalThis.BridgeAutorunModel = Object.freeze({
        ...BASE,
        claimDelivery,
        successfulReportFileRef,
        needsCompleteTextCompanion,
        hasLiveAttachmentStrategy
      });
    })();
''')

# Exact content-side scripts: named Port plus one-way wake; old one-shot content runtime is not loaded.
manifest_path = DIST / 'manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
manifest['background'] = {'service_worker': 'service_worker_entry.js'}
scripts = [item for item in manifest['content_scripts'][0]['js'] if item not in {
    'attachment_delivery_content.js', 'attachment_delivery_port_content.js', 'attachment_delivery_wake_content.js'
}]
scripts.extend(['attachment_delivery_port_content.js', 'attachment_delivery_wake_content.js'])
manifest['content_scripts'][0]['js'] = scripts
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Event-driven recovery is primary; the 60s poll is only a failsafe.
port_path = DIST / 'attachment_delivery_port_content.js'
port = port_path.read_text(encoding='utf-8')
port = port.replace('const RECOVERY_POLL_MS = 1500;', 'const RECOVERY_POLL_MS = 60_000;')
if 'runtime.recoverCurrent = recoverCurrent;' not in port:
    anchor = '  ensurePort();\n'
    if anchor not in port:
        raise SystemExit('PORT_CONTENT_BOOTSTRAP_ANCHOR_MISSING')
    port = port.replace(anchor, '  runtime.recoverCurrent = recoverCurrent;\n' + anchor, 1)
if 'const RECOVERY_POLL_MS = 60_000;' not in port or 'runtime.recoverCurrent = recoverCurrent;' not in port:
    raise SystemExit('PORT_CONTENT_MATERIALIZATION_FAILED')
port_path.write_text(port, encoding='utf-8')

# Superseded one-shot runtime files are removed from the production package.
(DIST / 'attachment_delivery_content.js').unlink(missing_ok=True)
(DIST / 'shared/file_delivery_worker.js').unlink(missing_ok=True)

# Current-architecture static/model regression.
write(REG / 'run_multi_ai_file_delivery_patch.mjs', r'''
    import assert from "node:assert/strict";
    import { execFileSync } from "node:child_process";
    import { webcrypto } from "node:crypto";
    import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
    import { dirname, join, resolve } from "node:path";
    import { fileURLToPath } from "node:url";
    import vm from "node:vm";

    const HERE = dirname(fileURLToPath(import.meta.url));
    const ROOT = resolve(HERE, "../..");
    const CANDIDATE = join(ROOT, "dist-step7-candidate");
    const BASE_SHA = process.env.OZON_FILE_DELIVERY_BASE_SHA || "4f78cc9f84a926cc834256abcb8278b95c9539df";
    const source = (path) => readFileSync(join(CANDIDATE, path), "utf8");
    const pass = (name) => console.log(`${name}=PASS`);
    if (!globalThis.crypto) globalThis.crypto = webcrypto;

    const manifest = JSON.parse(source("manifest.json"));
    assert.equal(manifest.background.service_worker, "service_worker_entry.js");
    assert.deepEqual(manifest.permissions, ["storage", "alarms", "tabs", "unlimitedStorage"]);
    for (const forbidden of ["deepseek.com", "grok.com", "claude.ai", "gemini.google.com", "qwen.ai", "kimi.com"]) {
      assert.equal(manifest.host_permissions.some((item) => item.includes(forbidden)), false);
      assert.equal(manifest.content_scripts.flatMap((item) => item.matches || []).some((item) => item.includes(forbidden)), false);
    }
    const js = manifest.content_scripts[0].js;
    assert.equal(js.includes("attachment_delivery_content.js"), false);
    assert(js.includes("attachment_delivery_port_content.js"));
    assert(js.includes("attachment_delivery_wake_content.js"));
    assert(js.indexOf("shared/web_file_attachment.js") < js.indexOf("attachment_delivery_port_content.js"));
    assert(js.indexOf("content_script.js") < js.indexOf("attachment_delivery_port_content.js"));
    assert(js.indexOf("attachment_delivery_port_content.js") < js.indexOf("attachment_delivery_wake_content.js"));
    pass("REG_FILE_DELIVERY_MANIFEST_NAMED_PORT_WIRING");

    const entry = source("service_worker_entry.js");
    const order = [
      'importScripts("shared/ai_delivery_capabilities.js")',
      'importScripts("service_worker.js")',
      'importScripts("shared/file_delivery_model_policy.js")',
      'importScripts("shared/file_delivery_port_worker.js")',
      'importScripts("shared/file_delivery_wake_worker.js")'
    ].map((token) => entry.indexOf(token));
    assert(order.every((value) => value >= 0));
    assert.deepEqual([...order].sort((a,b)=>a-b), order);
    assert.equal(existsSync(join(CANDIDATE, "attachment_delivery_content.js")), false);
    assert.equal(existsSync(join(CANDIDATE, "shared/file_delivery_worker.js")), false);
    pass("REG_FILE_DELIVERY_BOOTSTRAP_COMPLETE_ORDER");
    pass("REG_STALE_ONE_SHOT_RUNTIME_REMOVED");

    vm.runInThisContext(source("shared/ai_delivery_capabilities.js"), { filename: "ai_delivery_capabilities.js" });
    vm.runInThisContext(source("shared/bridge_autorun_model.js"), { filename: "bridge_autorun_model.js" });
    vm.runInThisContext(source("shared/file_delivery_model_policy.js"), { filename: "file_delivery_model_policy.js" });
    const capabilities = globalThis.OzonAIDeliveryCapabilities;
    const model = globalThis.BridgeAutorunModel;
    assert.deepEqual(capabilities.TARGET_AI_IDS, ["chatgpt","alice","deepseek","grok","claude","gemini","qwen","kimi"]);
    assert.equal(capabilities.CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS, 1_048_000);
    const base = { origin: "https://chatgpt.com", status: model.RUN_STATUSES.COLLECTING, batch: { entries: [] } };
    const small = model.claimDelivery(base, { deliveryId:"small", mode:"batch_watch_v1", outgoingText:"small" });
    assert.equal(small.delivery.mode, "batch_watch_v1");
    const equalText = "x".repeat(1_048_000);
    const aboveText = "x".repeat(1_048_001);
    assert.equal(model.claimDelivery(base, { deliveryId:"equal", mode:"batch_watch_v1", outgoingText:equalText }).delivery.mode, "batch_watch_v1");
    const large = model.claimDelivery(base, { deliveryId:"large", mode:"batch_watch_v1", outgoingText:aboveText });
    assert.equal(large.delivery.mode, "attachment_watch_v1");
    assert.equal(large.delivery.phase, model.ATTACHMENT_PHASES.CLAIMED);
    assert.equal(large.delivery.artifact_text, aboveText);
    assert.equal(large.delivery.generated_text_document.unicode_char_length, 1_048_001);
    assert(large.delivery.outgoing_text.length < 2000);
    pass("REG_CHATGPT_THRESHOLD_BELOW_EQUAL_ABOVE");
    pass("REG_LARGE_TEXT_ATTACHMENT_MODE");

    const pureReportRun = { origin:"https://chatgpt.com", status:model.RUN_STATUSES.COLLECTING, batch:{entries:[
      {status:"complete", http_status:200, command:{operation:"report_file_get",params:{file_ref:"rpf_s_a"}}}
    ]}};
    const pure = model.claimDelivery(pureReportRun,{deliveryId:"pure",mode:"batch_watch_v1",outgoingText:"parsed"});
    assert.equal(pure.delivery.mode,"attachment_watch_v1");
    assert.deepEqual(pure.delivery.provider_file_refs,["rpf_s_a"]);
    assert.equal(pure.delivery.generated_text_document,null);

    const mixedRun = { origin:"https://chatgpt.com", status:model.RUN_STATUSES.COLLECTING, batch:{entries:[
      {status:"complete",http_status:200,command:{operation:"report_file_get",params:{file_ref:"rpf_s_a"}}},
      {status:"complete",http_status:200,command:{operation:"performance_media",params:{}}}
    ]}};
    const mixedText = "OZON_BATCH_RESULT_V1\ncomplete mixed content";
    const mixed = model.claimDelivery(mixedRun,{deliveryId:"mixed",mode:"batch_watch_v1",outgoingText:mixedText});
    assert.equal(mixed.delivery.mode,"attachment_watch_v1");
    assert.equal(mixed.delivery.artifact_text,mixedText);
    assert.equal(mixed.delivery.generated_text_document.materialization_reason,"mixed_batch_companion");
    pass("REG_ORIGINAL_REPORT_FILE_ATTACHMENT_MODE");
    pass("REG_MIXED_BATCH_COMPLETE_TEXT_COMPANION");

    const failedReportRun = { origin:"https://chatgpt.com", status:model.RUN_STATUSES.COLLECTING, batch:{entries:[
      {status:"complete",http_status:403,command:{operation:"report_file_get",params:{file_ref:"rpf_s_denied"}}}
    ]}};
    const failed = model.claimDelivery(failedReportRun,{deliveryId:"failed",mode:"batch_watch_v1",outgoingText:"provider error"});
    assert.equal(failed.delivery.mode,"batch_watch_v1");
    pass("REG_FAILED_REPORT_FILE_STAYS_TEXT_ERROR");

    const alice = { ...base, origin:"https://alice.yandex.ru" };
    const aliceLarge = model.claimDelivery(alice,{deliveryId:"alice",mode:"batch_watch_v1",outgoingText:aboveText});
    assert.equal(aliceLarge.delivery.mode,"batch_watch_v1");
    assert.equal(capabilities.generatedTextDecision("alice",aboveText).threshold_status,"pending_live_calibration");
    pass("REG_OTHER_AI_THRESHOLD_NOT_INHERITED");

    const portWorker = source("shared/file_delivery_port_worker.js");
    assert(portWorker.includes('const PORT_NAME = "ozon-attachment-delivery-v1"'));
    assert(portWorker.includes("chrome.runtime.onConnect.addListener"));
    assert.equal(portWorker.includes("chrome.runtime.onMessage.addListener"),false);
    assert(portWorker.includes("response.clone"));
    assert(portWorker.includes("REPORT_FILE_FETCH_COUNT_MISMATCH"));
    assert(portWorker.includes("REPORT_FILE_ARTIFACT_NOT_CAPTURED"));
    pass("REG_ATTACHMENT_RPC_NAMED_PORT_ONLY");
    pass("REG_PROVIDER_FILE_SINGLE_FETCH_CAPTURE_PRESENT");

    const wakeWorker = source("shared/file_delivery_wake_worker.js");
    assert(wakeWorker.includes("chrome.storage.onChanged.addListener"));
    assert(wakeWorker.includes('type: "OZ_ATTACHMENT_DELIVERY_WAKE"'));
    assert.equal(wakeWorker.includes("chrome.runtime.onMessage"),false);
    const portContent = source("attachment_delivery_port_content.js");
    assert(portContent.includes('const PORT_NAME = "ozon-attachment-delivery-v1"'));
    assert(portContent.includes("chrome.runtime.connect"));
    assert.equal(portContent.includes("chrome.runtime.sendMessage"),false);
    assert(portContent.includes("runtime.recoverCurrent = recoverCurrent;"));
    assert(portContent.includes("const RECOVERY_POLL_MS = 60_000;"));
    assert(!portContent.includes("/backend-api/files"));
    assert(!portContent.includes("navigator.clipboard"));
    pass("REG_ATTACHMENT_WAKE_TO_PORT_RECOVERY_WIRING");
    pass("REG_ATTACHMENT_RARE_FAILSAFE_POLL");

    const web = source("shared/web_file_attachment.js");
    assert(web.includes("new DataTransfer()"));
    assert(web.includes("input.files = transfer.files"));
    assert(!web.includes("#upload-files"));
    const adapters = source("shared/ai_adapters.js");
    assert(adapters.includes('document.querySelector(\'#upload-files[type="file"]\')'));
    assert(adapters.includes("attachmentSurface()"));
    pass("REG_GENERIC_WEB_FILE_PRIMITIVE_NO_AI_SELECTOR");
    pass("REG_CHATGPT_SELECTOR_ADAPTER_OWNED");

    function walkJs(directory,out=[]) { for (const name of readdirSync(directory)) { const full=join(directory,name); if(statSync(full).isDirectory()) walkJs(full,out); else if(name.endsWith(".js")) out.push(full); } return out; }
    for (const file of walkJs(CANDIDATE)) execFileSync(process.execPath,["--check",file],{stdio:"pipe"});
    pass("REG_ALL_PRODUCTION_JS_NODE_CHECK");

    const protectedFiles = [
      "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/service_worker.js",
      "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/content_script.js",
      "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/composer_send.js"
    ];
    execFileSync("git",["diff","--exit-code",BASE_SHA,"--",...protectedFiles],{cwd:resolve(ROOT,"../../.."),stdio:"pipe"});
    pass("REG_PROVEN_LEGACY_DELIVERY_FILES_UNMODIFIED");
    console.log("MULTI_AI_FILE_DELIVERY_PATCH_REGRESSION_PASS");
''')

# Named-Port state-machine regression, replacing the old one-shot onMessage harness.
write(REG / 'run_file_delivery_port_worker_state_machine.mjs', r'''
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
    const storage={auto_runs:{},manual_ops:{},manual_modes:{},prefixes:{}};
    let onConnect=null;
    const normalize=(keys)=>Array.isArray(keys)?keys:(typeof keys==="string"?[keys]:Object.keys(keys||{}));

    const context=vm.createContext({
      console,URL,TextEncoder,Uint8Array,ArrayBuffer,crypto:webcrypto,queueMicrotask,Promise,setTimeout,clearTimeout,structuredClone,
      indexedDB:{open(){throw new Error("not used");}},
      OzonRuntime:{STORAGE_KEYS:{REPORT_FILE_SESSION_STATE:"report_state",MANUAL_OPERATIONS:"manual_ops",AUTO_RUNS:"auto_runs",REPORT_PREFIXES:"prefixes",MANUAL_MODES:"manual_modes"}},
      ProviderTransportCore:{normalizeTrustedReportFileUrl(v){return String(v);},async executeTrustedReportFileOnce(){throw new Error("provider must not execute");},reportBase64ToBytes(){return new Uint8Array(0);}},
      BB2ConversationIdentity:{resolve({origin,pathname}){const m=String(pathname||"").match(/\/c\/([0-9a-f-]+)/i);return {origin:String(origin||"").toLowerCase(),conversation_id:m?.[1]?.toLowerCase()||null,status:m?"confirmed":"unknown",ai_id:"chatgpt"};}},
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
    async function call(type,payload={}){const request_id=`r${++seq}`;listener({request_id,type,...payload});for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,0));const idx=responses.findIndex(x=>x.request_id===request_id);if(idx>=0)return responses.splice(idx,1)[0].response;}throw new Error(`timeout ${type}`);}
    const owner={owner_kind:"autorun",owner_id:"run-1",run_id:"run-1",conversation_key:conversationKey,delivery_id:"delivery-1"};
    const recovery=await call("OZ_ATTACHMENT_RECOVERY_GET",owner); assert.equal(recovery.ok,true); assert.equal(recovery.recovery.delivery_phase,"attachment_ready");
    console.log("REG_ATTACHMENT_PORT_RECOVERY_GET_PASS");
    const first=await call("OZ_ATTACHMENT_SEND_COMMIT",{...owner,actor_id:"content-1",baseline_user_turn_ids:["before"]}); assert.equal(first.ok,true); assert.equal(first.click_allowed,true);
    const second=await call("OZ_ATTACHMENT_SEND_COMMIT",{...owner,actor_id:"content-1",baseline_user_turn_ids:["before"]}); assert.equal(second.ok,true); assert.equal(second.click_allowed,false); assert.equal(second.already_committed,true);
    console.log("REG_ATTACHMENT_PORT_SEND_COMMIT_SINGLE_FLIGHT_PASS");
    const rollback=await call("OZ_ATTACHMENT_SEND_ROLLBACK",{...owner,actor_id:"content-1",click_event_observed:false}); assert.equal(rollback.ok,true); assert.equal(rollback.rolled_back,true); assert.equal(storage.auto_runs[conversationKey].delivery.phase,"attachment_ready");
    console.log("REG_ATTACHMENT_PORT_SAFE_ROLLBACK_PASS");
    console.log("FILE_DELIVERY_PORT_WORKER_STATE_MACHINE_PASS");
''')
(REG / 'run_file_delivery_worker_state_machine.mjs').unlink(missing_ok=True)

# Exact live failure reproduction: classification -> storage wake -> content recovery entry.
write(REG / 'run_file_delivery_live_stop_repro.mjs', r'''
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
''')

# Capture accounting must exercise the actual Port worker capture wrapper.
cap = REG / 'run_file_delivery_capture_accounting.mjs'
cap_text = cap.read_text(encoding='utf-8')
cap_text = cap_text.replace('dist-step7-candidate/shared/file_delivery_worker.js', 'dist-step7-candidate/shared/file_delivery_port_worker.js')
cap_text = cap_text.replace('file_delivery_worker.js', 'file_delivery_port_worker.js')
cap_text = cap_text.replace('runtime: { onMessage: { addListener() {} } },', 'runtime: { onConnect: { addListener() {} } },')
cap.write_text(cap_text, encoding='utf-8')

# Permanent patch workflow: exact current regression set, no stale runtime inventory.
write(Path('.github/workflows/ozon-multi-ai-file-delivery-patch.yml'), r'''
    name: Ozon multi-AI file delivery patch
    on:
      push:
        branches: [repair/ozon-multi-ai-file-delivery-2026-09-08]
        paths:
          - 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/**'
          - 'tooling/llm-api-bridges/ozon-seller/validation/regression/run_multi_ai_file_delivery_patch.mjs'
          - 'tooling/llm-api-bridges/ozon-seller/validation/regression/run_file_delivery_*.mjs'
          - '.github/workflows/ozon-multi-ai-file-delivery-patch.yml'
    permissions: { contents: read }
    jobs:
      regression:
        strategy: { fail-fast: false, matrix: { os: [ubuntu-latest, windows-latest] } }
        runs-on: ${{ matrix.os }}
        steps:
          - uses: actions/checkout@v4
            with: { fetch-depth: 0 }
          - uses: actions/setup-node@v4
            with: { node-version: '24.12.0' }
          - name: Run exact file-delivery regression set
            shell: bash
            env: { OZON_FILE_DELIVERY_BASE_SHA: 4f78cc9f84a926cc834256abcb8278b95c9539df }
            run: |
              set -euo pipefail
              R=tooling/llm-api-bridges/ozon-seller/validation/regression
              node "$R/run_multi_ai_file_delivery_patch.mjs"
              node "$R/run_file_delivery_capture_accounting.mjs"
              node "$R/run_file_delivery_port_worker_state_machine.mjs"
              node "$R/run_file_delivery_mixed_batch_policy.mjs"
              node "$R/run_file_delivery_adapter_gate_policy.mjs"
              node "$R/run_file_delivery_wake_lifecycle.mjs"
              node "$R/run_file_delivery_live_stop_repro.mjs"
      package:
        needs: regression
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
            with: { fetch-depth: 0 }
          - uses: actions/setup-node@v4
            with: { node-version: '24.12.0' }
          - name: Re-run exact regression set
            shell: bash
            env: { OZON_FILE_DELIVERY_BASE_SHA: 4f78cc9f84a926cc834256abcb8278b95c9539df }
            run: |
              set -euo pipefail
              R=tooling/llm-api-bridges/ozon-seller/validation/regression
              node "$R/run_multi_ai_file_delivery_patch.mjs"
              node "$R/run_file_delivery_capture_accounting.mjs"
              node "$R/run_file_delivery_port_worker_state_machine.mjs"
              node "$R/run_file_delivery_mixed_batch_policy.mjs"
              node "$R/run_file_delivery_adapter_gate_policy.mjs"
              node "$R/run_file_delivery_wake_lifecycle.mjs"
              node "$R/run_file_delivery_live_stop_repro.mjs"
          - name: Browser File and DataTransfer primitive
            shell: bash
            run: node tooling/llm-api-bridges/ozon-seller/validation/regression/run_file_attachment_browser_primitive.mjs "$(command -v google-chrome)"
          - name: Installed MV3 worker smoke
            shell: bash
            run: xvfb-run -a node tooling/llm-api-bridges/ozon-seller/validation/regression/run_file_delivery_extension_worker_smoke.mjs "$(command -v google-chrome)" "$GITHUB_WORKSPACE/tooling/llm-api-bridges/ozon-seller/dist-step7-candidate"
''')

# The superseded one-shot mutator is no longer an active dependency.
Path('.github/workflows/ozon-file-delivery-apply-mixed-policy-once.yml').unlink(missing_ok=True)

print('FILE_DELIVERY_GATE35_MATERIALIZATION_V3=PASS')
