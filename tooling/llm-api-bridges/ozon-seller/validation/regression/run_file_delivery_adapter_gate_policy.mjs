import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const source = (path) => readFileSync(join(ROOT, "dist-step7-candidate", path), "utf8");
const context = vm.createContext({ console, TextEncoder, URL, crypto: globalThis.crypto || { randomUUID: () => "00000000-0000-4000-8000-000000000000" } });
context.globalThis = context;
vm.runInContext(source("shared/ai_delivery_capabilities.js"), context);
vm.runInContext(source("shared/bridge_autorun_model.js"), context);
vm.runInContext(source("shared/file_delivery_model_policy.js"), context);
const model = context.BridgeAutorunModel;

const successfulFile = {
  status: "complete",
  http_status: 200,
  command: { operation: "report_file_get", params: { file_ref: "rpf_s_test" } },
  report_text: "parsed report text"
};

const alice = model.claimDelivery({
  origin: "https://alice.yandex.ru",
  status: model.RUN_STATUSES.COLLECTING,
  batch: { entries: [successfulFile] }
}, {
  deliveryId: "alice-report",
  mode: "batch_watch_v1",
  outgoingText: "OZON_BATCH_RESULT_V1\nparsed Alice report text",
  outgoingHash: "alice-hash",
  reportPrefixApplied: false
});
assert.equal(alice.delivery.mode, "attachment_watch_v1");
assert.equal(alice.delivery.phase, model.ATTACHMENT_PHASES.CLAIMED);
assert.deepEqual(Array.from(alice.delivery.provider_file_refs), ["rpf_s_test"]);
assert.equal(alice.delivery.generated_text_document, null);
console.log("REG_ALICE_SINGLE_PROVIDER_FILE_ATTACHMENT_PATH_ENABLED_PASS");

const chatgpt = model.claimDelivery({
  origin: "https://chatgpt.com",
  status: model.RUN_STATUSES.COLLECTING,
  batch: { entries: [successfulFile] }
}, {
  deliveryId: "chatgpt-report",
  mode: "batch_watch_v1",
  outgoingText: "OZON_BATCH_RESULT_V1\nparsed ChatGPT report text",
  reportPrefixApplied: false
});
assert.equal(chatgpt.delivery.mode, "attachment_watch_v1");
assert.deepEqual(Array.from(chatgpt.delivery.provider_file_refs), ["rpf_s_test"]);
console.log("REG_CHATGPT_REPORT_FILE_ATTACHMENT_PATH_ENABLED_PASS");

const aliceBoundary = model.claimDelivery({
  origin: "https://alice.yandex.ru",
  status: model.RUN_STATUSES.COLLECTING,
  batch: { entries: [] }
}, {
  deliveryId: "alice-boundary",
  mode: "batch_watch_v1",
  outgoingText: "x".repeat(90_000),
  reportPrefixApplied: false
});
assert.equal(aliceBoundary.delivery.mode, "batch_watch_v1");

const aliceHuge = model.claimDelivery({
  origin: "https://alice.yandex.ru",
  status: model.RUN_STATUSES.COLLECTING,
  batch: { entries: [] }
}, {
  deliveryId: "alice-huge",
  mode: "batch_watch_v1",
  outgoingText: "x".repeat(90_001),
  reportPrefixApplied: false
});
assert.equal(aliceHuge.delivery.mode, "attachment_watch_v1");
assert.equal(aliceHuge.delivery.generated_text_document.complete, true);
assert.equal(aliceHuge.delivery.generated_text_document.extension, "txt");
assert.equal(aliceHuge.delivery.artifact_text.length, 90_001);
console.log("REG_ALICE_SAFE_LARGE_TEXT_DOCUMENT_RULE_PASS");

console.log("FILE_DELIVERY_ADAPTER_GATE_POLICY_PASS");
