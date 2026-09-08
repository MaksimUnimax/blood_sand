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
const recoveryExportToken = "runtime.recoverCurrent = recoverCurrent;";
assert.equal(portContent.split(recoveryExportToken).length - 1, 1, "recoverCurrent must have exactly one runtime export");
const recoverDefinitionIndex = portContent.indexOf("async function recoverCurrent()");
const recoverExportIndex = portContent.indexOf(recoveryExportToken);
const normalStartupPortIndex = portContent.indexOf("\n  ensurePort();", recoverExportIndex);
const reconnectStart = portContent.indexOf("function scheduleReconnect()");
const reconnectEnd = portContent.indexOf("function ensurePort()", reconnectStart);
assert(recoverDefinitionIndex >= 0 && recoverExportIndex > recoverDefinitionIndex, "recoverCurrent export must occur after its production definition");
assert(normalStartupPortIndex > recoverExportIndex, "recoverCurrent export must occur before normal-start ensurePort");
assert(reconnectStart >= 0 && reconnectEnd > reconnectStart);
assert.equal(portContent.slice(reconnectStart, reconnectEnd).includes(recoveryExportToken), false, "recovery export must not depend on reconnect-only execution");
assert(portContent.includes("const RECOVERY_POLL_MS = 60_000;"));
assert(!portContent.includes("/backend-api/files"));
assert(!portContent.includes("navigator.clipboard"));
pass("REG_ATTACHMENT_NORMAL_START_RECOVERY_EXPORT_PLACEMENT");
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
