import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../dist-step7-candidate");
const capabilityPath = path.join(dist, "shared", "ai_delivery_capabilities.js");
const workerPath = path.join(dist, "shared", "file_delivery_port_worker.js");
const contentPath = path.join(dist, "attachment_delivery_port_content.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const capabilitySource = fs.readFileSync(capabilityPath, "utf8");
const workerSource = fs.readFileSync(workerPath, "utf8");
const contentSource = fs.readFileSync(contentPath, "utf8");

const context = {
  globalThis: {},
  URL,
  TextEncoder,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Array,
  console
};
context.globalThis = context;
vm.runInNewContext(capabilitySource, context, { filename: capabilityPath });
const caps = context.OzonAIDeliveryCapabilities;
assert(caps, "OzonAIDeliveryCapabilities was not materialized");

const alice = caps.profile("alice");
assert(alice?.status === "implemented", "Alice profile must remain implemented");
assert(alice?.attachments_supported === true, "Alice attachments must remain enabled");
assert(alice?.attachment_strategy === "drag_drop_v1", "Alice drag/drop strategy changed unexpectedly");
assert(alice?.max_files_per_turn === 1, "Alice max-files contract changed unexpectedly");
assert(alice?.max_file_bytes === 100 * 1024 * 1024, "Alice max-file-bytes contract changed unexpectedly");

// Live evidence supplied by the owner on 2026-09-12: ordinary alice.yandex.ru accepts XLSX.
assert(alice.accepted_extensions.includes("xlsx"), "PREFX_ALICE_XLSX_CAPABILITY_MISSING");

const providerXlsx = {
  artifact_key: "provider:rpf_s_live_xlsx_regression",
  source_kind: "original_provider_file",
  filename: "REPORT_seller_placement_by_products_live.xlsx",
  mime_type: "application/octet-stream",
  extension: "xlsx",
  byte_length: 7924,
  sha256: "a".repeat(64)
};
const staticSupport = caps.supportsFile("alice", providerXlsx);
assert(staticSupport.supported === true, `Alice XLSX must be statically supported after live proof; got ${JSON.stringify(staticSupport)}`);
const dispatch = caps.fileDispatchDecision("alice", providerXlsx);
assert(dispatch.dispatch_allowed === true, `Alice XLSX dispatch must be allowed; got ${JSON.stringify(dispatch)}`);
assert(dispatch.status === "verified_supported", `Alice XLSX must no longer be runtime-unknown; got ${dispatch.status}`);
assert(dispatch.runtime_verification_required === false, "Alice XLSX must not require runtime type verification after live proof");

const oversized = { ...providerXlsx, byte_length: 100 * 1024 * 1024 + 1 };
const oversizedDecision = caps.fileDispatchDecision("alice", oversized);
assert(oversizedDecision.dispatch_allowed === false && oversizedDecision.reason === "file_too_large_for_adapter", "Alice size guard must remain fail-closed");

const generatedUnknown = {
  artifact_key: "generated:test.csv",
  source_kind: "generated_bridge_text",
  filename: "generated.csv",
  mime_type: "text/csv",
  extension: "csv",
  byte_length: 100,
  sha256: "b".repeat(64)
};
const generatedDecision = caps.fileDispatchDecision("alice", generatedUnknown);
assert(generatedDecision.dispatch_allowed === false, "Unverified generated file types must remain blocked");

const unknownProvider = {
  artifact_key: "provider:rpf_s_unknown",
  source_kind: "original_provider_file",
  filename: "unknown.bin",
  mime_type: "application/octet-stream",
  extension: "bin",
  byte_length: 100,
  sha256: "c".repeat(64)
};
const unknownDecision = caps.fileDispatchDecision("alice", unknownProvider);
assert(unknownDecision.dispatch_allowed === false, "Opaque provider .bin must remain blocked");

assert(workerSource.includes("OzonAIDeliveryCapabilities.fileDispatchDecision(delivery.adapter_id, record)"), "Worker must consume central fileDispatchDecision authority");
assert(contentSource.includes("OzonAIDeliveryCapabilities.fileDispatchDecision(active.id, descriptor)"), "Content transport must consume central fileDispatchDecision authority");
assert(!workerSource.includes("accepted_extensions.push"), "Worker must not mutate capability allowlists");
assert(!contentSource.includes("accepted_extensions.push"), "Content must not mutate capability allowlists");

console.log("ALICE_XLSX_LIVE_CAPABILITY=PASS");
console.log("ALICE_XLSX_STATIC_SUPPORT=PASS");
console.log("ALICE_XLSX_OCTET_STREAM_DESCRIPTOR=PASS");
console.log("ALICE_XLSX_OVERSIZE_FAIL_CLOSED=PASS");
console.log("ALICE_GENERATED_UNKNOWN_FAIL_CLOSED=PASS");
console.log("ALICE_OPAQUE_PROVIDER_FAIL_CLOSED=PASS");
console.log("CENTRAL_DISPATCH_AUTHORITY_CONSUMERS=PASS");
console.log("PROVIDER_CALLS_DURING_GATE=0");
