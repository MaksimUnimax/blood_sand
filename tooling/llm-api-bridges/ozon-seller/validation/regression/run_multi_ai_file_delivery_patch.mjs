import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, webcrypto } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CANDIDATE = join(ROOT, "dist-step7-candidate");
const BASE_SHA = process.env.OZON_FILE_DELIVERY_BASE_SHA || "4f78cc9f84a926cc834256abcb8278b95c9539df";

function source(path) { return readFileSync(join(CANDIDATE, path), "utf8"); }
function sha256Text(text) { return createHash("sha256").update(text).digest("hex"); }
function pass(name) { console.log(`${name}=PASS`); }

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const manifest = JSON.parse(source("manifest.json"));
assert.equal(manifest.background.service_worker, "service_worker_entry.js");
assert.deepEqual(manifest.permissions, ["storage", "alarms", "tabs", "unlimitedStorage"]);
for (const forbidden of ["deepseek.com", "grok.com", "claude.ai", "gemini.google.com", "qwen.ai", "kimi.com"]) {
  assert.equal(manifest.host_permissions.some((item) => item.includes(forbidden)), false, `planned AI host permission leaked: ${forbidden}`);
  assert.equal(manifest.content_scripts.flatMap((item) => item.matches || []).some((item) => item.includes(forbidden)), false, `planned AI content-script match leaked: ${forbidden}`);
}
const contentJs = manifest.content_scripts[0].js;
assert(contentJs.indexOf("shared/ai_delivery_capabilities.js") < contentJs.indexOf("shared/ai_adapters.js"));
assert(contentJs.indexOf("shared/web_file_attachment.js") < contentJs.indexOf("attachment_delivery_content.js"));
assert(contentJs.indexOf("content_script.js") < contentJs.indexOf("attachment_delivery_content.js"));
pass("REG_FILE_DELIVERY_MANIFEST_MINIMUM_PERMISSIONS");

const entry = source("service_worker_entry.js");
const capabilityIndex = entry.indexOf('importScripts("shared/ai_delivery_capabilities.js")');
const legacyWorkerIndex = entry.indexOf('importScripts("service_worker.js")');
const fileWorkerIndex = entry.indexOf('importScripts("shared/file_delivery_worker.js")');
assert(capabilityIndex >= 0 && capabilityIndex < legacyWorkerIndex && legacyWorkerIndex < fileWorkerIndex);
pass("REG_FILE_DELIVERY_BOOTSTRAP_ORDER");

vm.runInThisContext(source("shared/ai_delivery_capabilities.js"), { filename: "ai_delivery_capabilities.js" });
const capabilities = globalThis.OzonAIDeliveryCapabilities;
assert(capabilities);
assert.deepEqual(capabilities.TARGET_AI_IDS, ["chatgpt", "alice", "deepseek", "grok", "claude", "gemini", "qwen", "kimi"]);
assert.equal(capabilities.CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS, 1_048_000);
assert.equal(capabilities.unicodeLength("A😀Б"), 3);
assert.equal(capabilities.utf8ByteLength("A😀Б"), Buffer.byteLength("A😀Б", "utf8"));
pass("REG_MULTI_AI_TARGET_SET_8");
pass("REG_UNICODE_CODEPOINT_THRESHOLD_METRIC");

const below = "x".repeat(1_047_999);
const equal = "x".repeat(1_048_000);
const above = "x".repeat(1_048_001);
assert.equal(capabilities.generatedTextDecision("chatgpt", below).representation, "plain_text");
assert.equal(capabilities.generatedTextDecision("chatgpt", equal).representation, "plain_text");
assert.equal(capabilities.generatedTextDecision("chatgpt", above).representation, "text_document");
assert.equal(capabilities.generatedTextDecision("alice", above).threshold_status, "pending_live_calibration");
assert.equal(capabilities.generatedTextDecision("alice", above).threshold, null);
pass("REG_CHATGPT_THRESHOLD_BELOW_EQUAL_ABOVE");
pass("REG_OTHER_AI_THRESHOLD_NOT_INHERITED");

assert.equal(capabilities.supportsFile("chatgpt", { filename: "result.txt", byte_length: 100 }).supported, true);
assert.equal(capabilities.supportsFile("chatgpt", { filename: "report.xlsx", byte_length: 100 }).supported, true);
assert.equal(capabilities.supportsFile("alice", { filename: "report.xlsx", byte_length: 100 }).supported, false);
assert.equal(capabilities.supportsFile("alice", { filename: "result.txt", byte_length: 100 }).supported, true);
assert.equal(capabilities.supportsFile("qwen", { filename: "report.xlsx", byte_length: 100 }).status, "pending");
assert.equal(capabilities.supportsFile("kimi", { filename: "result.txt", byte_length: 100 }).status, "pending");
assert.equal(capabilities.profile("qwen").accepted_extensions.includes("csv"), false);
assert.equal(capabilities.profile("qwen").accepted_extensions.includes("txt"), false);
pass("REG_TARGET_AI_FILE_CAPABILITY_FAIL_HONEST");
pass("REG_QWEN_NO_UNPROVEN_FORMATS");

vm.runInThisContext(source("shared/bridge_autorun_model.js"), { filename: "bridge_autorun_model.js" });
const model = globalThis.BridgeAutorunModel;
assert(model);
const baseChatgptRun = {
  origin: "https://chatgpt.com",
  status: model.RUN_STATUSES.COLLECTING,
  batch: { entries: [] }
};
const smallClaim = model.claimDelivery(baseChatgptRun, { deliveryId: "small", mode: "batch_watch_v1", outgoingText: "small result" });
assert.equal(smallClaim.delivery.mode, "batch_watch_v1");
assert.equal(smallClaim.delivery.phase, model.DELIVERY_PHASES.CLAIMED);
assert.equal(smallClaim.delivery.outgoing_text, "small result");
const equalClaim = model.claimDelivery(baseChatgptRun, { deliveryId: "equal", mode: "batch_watch_v1", outgoingText: equal });
assert.equal(equalClaim.delivery.mode, "batch_watch_v1");
const largeClaim = model.claimDelivery(baseChatgptRun, { deliveryId: "large", mode: "batch_watch_v1", outgoingText: above });
assert.equal(largeClaim.delivery.mode, "attachment_watch_v1");
assert.equal(largeClaim.delivery.phase, model.ATTACHMENT_PHASES.CLAIMED);
assert.equal(largeClaim.delivery.artifact_text, above);
assert.equal(largeClaim.delivery.generated_text_document.unicode_char_length, 1_048_001);
assert.equal(largeClaim.delivery.generated_text_document.byte_length, 1_048_001);
assert(largeClaim.delivery.generated_text_document.filename.includes("large"));
assert(largeClaim.delivery.outgoing_text.length < 2000);
assert.equal(model.recoveryDecision(largeClaim, "worker-x").type, "attachment_external_handler");
pass("REG_TEXT_DELIVERY_SMALL_PATH_UNCHANGED");
pass("REG_LARGE_TEXT_ATTACHMENT_MODE_CUSTOM_PHASE");

const reportRun = {
  origin: "https://chatgpt.com",
  status: model.RUN_STATUSES.COLLECTING,
  batch: {
    entries: [
      { status: "complete", command: { operation: "report_file_get", params: { file_ref: "rpf_s_alpha" } } },
      { status: "complete", command: { operation: "report_file_get", params: { file_ref: "rpf_s_alpha" } } },
      { status: "complete", command: { operation: "analytics_data", params: {} } }
    ]
  }
};
assert.deepEqual(model.reportFileRefsFromBatch(reportRun), ["rpf_s_alpha"]);
const reportClaim = model.claimDelivery(reportRun, { deliveryId: "report", mode: "batch_watch_v1", outgoingText: "small parsed report" });
assert.equal(reportClaim.delivery.mode, "attachment_watch_v1");
assert.deepEqual(reportClaim.delivery.provider_file_refs, ["rpf_s_alpha"]);
assert.equal(reportClaim.delivery.generated_text_document, null);
assert.equal(reportClaim.delivery.phase, model.ATTACHMENT_PHASES.CLAIMED);
pass("REG_REPORT_FILE_FORCES_ORIGINAL_ATTACHMENT_MODE");
pass("REG_REPORT_FILE_REFS_DEDUPLICATED");

const aliceLargeRun = { ...baseChatgptRun, origin: "https://alice.yandex.ru" };
const aliceLarge = model.claimDelivery(aliceLargeRun, { deliveryId: "alice-large", mode: "batch_watch_v1", outgoingText: above });
assert.equal(aliceLarge.delivery.mode, "batch_watch_v1");
assert.equal(aliceLarge.delivery.generated_text_document, undefined);
pass("REG_ALICE_LARGE_TEXT_REMAINS_PENDING_NOT_CHATGPT_RULE");

const fileWorker = source("shared/file_delivery_worker.js");
assert.equal((fileWorker.match(/await fetchImpl\(\.\.\.args\)/g) || []).length, 1);
assert(fileWorker.includes("response.clone"));
assert(fileWorker.includes("REPORT_FILE_FETCH_COUNT_MISMATCH"));
assert(fileWorker.includes("REPORT_FILE_ARTIFACT_NOT_CAPTURED"));
assert(fileWorker.includes("ATTACH_OUTCOME_UNKNOWN_NO_RETRY"));
assert(fileWorker.includes("ATTACHMENT_SEND_OUTCOME_UNKNOWN_NO_RETRY"));
assert(fileWorker.includes("chrome.storage.session.get(KEYS.REPORT_FILE_SESSION_STATE)"));
assert(!/artifact\s*=\s*\{[^}]*\burl\s*:/s.test(fileWorker));
assert(!/attachments:\s*records\.map\([\s\S]*file_ref/.test(fileWorker));
pass("REG_PROVIDER_FILE_SINGLE_FETCH_CLONE_CAPTURE");
pass("REG_SIGNED_URL_NOT_PERSISTED_IN_ARTIFACT");
pass("REG_ATTACHMENT_UNKNOWN_OUTCOME_NO_RETRY");

const attachmentContent = source("attachment_delivery_content.js");
assert(attachmentContent.includes('"OZ_ATTACHMENT_COMMIT"'));
assert(attachmentContent.includes('"OZ_ATTACHMENT_SEND_COMMIT"'));
assert(attachmentContent.includes('"OZ_ATTACHMENT_SEND_ROLLBACK"'));
assert(attachmentContent.includes('"OZ_ATTACHMENT_CONFIRM"'));
assert(attachmentContent.includes("BB2ComposerSend.clickSynchronously"));
assert(!attachmentContent.includes("/backend-api/files"));
assert(!attachmentContent.includes("navigator.clipboard"));
assert(!attachmentContent.includes("document.execCommand"));
pass("REG_ATTACHMENT_AUTO_SEND_EXACTLY_ONCE_PROTOCOL_PRESENT");
pass("REG_NO_CHATGPT_INTERNAL_UPLOAD_API_OR_CLIPBOARD_WORKAROUND");

const webAttachment = source("shared/web_file_attachment.js");
assert(webAttachment.includes("new DataTransfer()"));
assert(webAttachment.includes("input.files = transfer.files"));
assert(webAttachment.includes('new Event("input", { bubbles: true, composed: true })'));
assert(webAttachment.includes('new Event("change", { bubbles: true })'));
assert(!webAttachment.includes("#upload-files"));
pass("REG_GENERIC_WEB_FILE_PRIMITIVE_NO_AI_SELECTOR");

const adapters = source("shared/ai_adapters.js");
assert(adapters.includes('document.querySelector(\'#upload-files[type="file"]\')'));
assert(adapters.includes('attachment_strategy !== "file_input_v1"') === false);
assert(adapters.includes("attachmentSurface()"));
assert(adapters.includes("attachmentReady(descriptors)"));
assert(adapters.includes('attachmentSurface() { return null; }'));
pass("REG_CHATGPT_ATTACHMENT_SELECTOR_ADAPTER_OWNED");
pass("REG_ALICE_ATTACHMENT_DOM_NOT_GUESSED");

function walkJs(directory, output = []) {
  for (const name of readdirSync(directory)) {
    const full = join(directory, name);
    if (statSync(full).isDirectory()) walkJs(full, output);
    else if (name.endsWith(".js")) output.push(full);
  }
  return output;
}
for (const file of walkJs(CANDIDATE)) execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
pass("REG_ALL_PRODUCTION_JS_NODE_CHECK");

const baseProtected = [
  "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/service_worker.js",
  "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/content_script.js",
  "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/composer_send.js"
];
try {
  execFileSync("git", ["diff", "--exit-code", BASE_SHA, "--", ...baseProtected], { cwd: resolve(ROOT, "../../.."), stdio: "pipe" });
  pass("REG_PROVEN_LEGACY_DELIVERY_FILES_UNMODIFIED");
} catch (error) {
  console.error(error.stdout?.toString() || "");
  console.error(error.stderr?.toString() || "");
  throw error;
}

const digest = sha256Text([
  source("shared/ai_delivery_capabilities.js"),
  source("shared/bridge_autorun_model.js"),
  fileWorker,
  webAttachment,
  adapters,
  attachmentContent,
  source("service_worker_entry.js"),
  JSON.stringify(manifest)
].join("\n---\n"));
console.log(`MULTI_AI_FILE_DELIVERY_PATCH_SURFACE_SHA256=${digest}`);
console.log("MULTI_AI_FILE_DELIVERY_PATCH_REGRESSION_PASS");
