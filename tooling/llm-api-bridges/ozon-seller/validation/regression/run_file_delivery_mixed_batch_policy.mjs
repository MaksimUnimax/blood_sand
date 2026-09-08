import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const source = (path) => readFileSync(join(ROOT, "dist-step7-candidate", path), "utf8");

const context = vm.createContext({
  console,
  TextEncoder,
  URL,
  crypto: globalThis.crypto || { randomUUID: () => "00000000-0000-4000-8000-000000000000" }
});
context.globalThis = context;
vm.runInContext(source("shared/ai_delivery_capabilities.js"), context, { filename: "ai_delivery_capabilities.js" });
vm.runInContext(source("shared/bridge_autorun_model.js"), context, { filename: "bridge_autorun_model.js" });
const baseModel = context.BridgeAutorunModel;
vm.runInContext(source("shared/file_delivery_model_policy.js"), context, { filename: "file_delivery_model_policy.js" });
const model = context.BridgeAutorunModel;
assert.notEqual(model.claimDelivery, baseModel.claimDelivery);

const reportEntry = (ref, status = 200) => ({
  status: "complete",
  http_status: status,
  command: { operation: "report_file_get", params: { file_ref: ref } },
  report_text: status >= 200 && status < 300 ? "successful parsed file result" : "file error result"
});
const analyticsEntry = {
  status: "complete",
  http_status: 200,
  command: { operation: "analytics_data", params: {} },
  report_text: "ordinary analytics result"
};

function run(entries) {
  return {
    origin: "https://chatgpt.com",
    status: model.RUN_STATUSES.COLLECTING,
    batch: { entries }
  };
}

const pure = model.claimDelivery(run([reportEntry("rpf_s_a"), reportEntry("rpf_s_b")]), {
  deliveryId: "pure-report",
  mode: "batch_watch_v1",
  outgoingText: "OZON_BATCH_RESULT_V1\npure parsed report metadata",
  reportPrefixApplied: false
});
assert.equal(pure.delivery.mode, "attachment_watch_v1");
assert.deepEqual(Array.from(pure.delivery.provider_file_refs), ["rpf_s_a", "rpf_s_b"]);
assert.equal(pure.delivery.generated_text_document, null);
assert.equal(pure.delivery.artifact_text, null);
console.log("REG_PURE_REPORT_BATCH_ORIGINAL_FILES_ONLY_PASS");

const mixedText = "OZON_BATCH_RESULT_V1\nreport file plus analytics business result";
const mixed = model.claimDelivery(run([reportEntry("rpf_s_a"), analyticsEntry]), {
  deliveryId: "mixed-report",
  mode: "batch_watch_v1",
  outgoingText: mixedText,
  reportPrefixApplied: false
});
assert.equal(mixed.delivery.mode, "attachment_watch_v1");
assert.deepEqual(Array.from(mixed.delivery.provider_file_refs), ["rpf_s_a"]);
assert.equal(mixed.delivery.artifact_text, mixedText);
assert.equal(mixed.delivery.generated_text_document.complete, true);
assert.equal(mixed.delivery.generated_text_document.materialization_reason, "mixed_batch_companion");
assert.equal(mixed.delivery.generated_text_document.unicode_char_length, [...mixedText].length);
assert.equal(mixed.delivery.generated_text_document.byte_length, new TextEncoder().encode(mixedText).byteLength);
console.log("REG_MIXED_REPORT_BATCH_COMPLETE_TEXT_COMPANION_PASS");

const successAndFailureText = "OZON_BATCH_RESULT_V1\nsuccessful file plus failed file error";
const successAndFailure = model.claimDelivery(run([reportEntry("rpf_s_ok"), reportEntry("rpf_s_denied", 403)]), {
  deliveryId: "mixed-file-error",
  mode: "batch_watch_v1",
  outgoingText: successAndFailureText,
  reportPrefixApplied: false
});
assert.deepEqual(Array.from(successAndFailure.delivery.provider_file_refs), ["rpf_s_ok"]);
assert.equal(successAndFailure.delivery.artifact_text, successAndFailureText);
assert.equal(successAndFailure.delivery.generated_text_document.materialization_reason, "mixed_batch_companion");
console.log("REG_REPORT_SUCCESS_PLUS_FILE_ERROR_COMPANION_PASS");

const prefixedText = "INSTRUCTION PREFIX\n\nOZON_BATCH_RESULT_V1\npure report";
const prefixed = model.claimDelivery(run([reportEntry("rpf_s_prefixed")]), {
  deliveryId: "prefixed-report",
  mode: "batch_watch_v1",
  outgoingText: prefixedText,
  reportPrefixApplied: true
});
assert.equal(prefixed.delivery.artifact_text, prefixedText);
assert.equal(prefixed.delivery.generated_text_document.materialization_reason, "mixed_batch_companion");
console.log("REG_REPORT_PREFIX_PRESERVED_IN_COMPLETE_TEXT_COMPANION_PASS");

const huge = "x".repeat(1_048_001);
const oversized = model.claimDelivery(run([reportEntry("rpf_s_huge")]), {
  deliveryId: "huge-report",
  mode: "batch_watch_v1",
  outgoingText: huge,
  reportPrefixApplied: false
});
assert.equal(oversized.delivery.generated_text_document.complete, true);
assert.equal(oversized.delivery.artifact_text, huge);
assert.notEqual(oversized.delivery.generated_text_document.materialization_reason, "mixed_batch_companion");
console.log("REG_OVERSIZED_REPORT_BATCH_THRESHOLD_DOCUMENT_PRESERVED_PASS");

const failedOnly = model.claimDelivery(run([reportEntry("rpf_s_fail", 403)]), {
  deliveryId: "failed-only",
  mode: "batch_watch_v1",
  outgoingText: "OZON_BATCH_RESULT_V1\nfile error",
  reportPrefixApplied: false
});
assert.equal(failedOnly.delivery.mode, "batch_watch_v1");
assert.equal(failedOnly.delivery.generated_text_document, undefined);
console.log("REG_FAILED_ONLY_REPORT_BATCH_REMAINS_TEXT_PASS");

console.log("FILE_DELIVERY_MIXED_BATCH_POLICY_PASS");
