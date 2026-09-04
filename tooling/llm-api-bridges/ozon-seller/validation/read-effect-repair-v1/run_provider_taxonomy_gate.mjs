#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
const load = (name) => vm.runInThisContext(fs.readFileSync(path.join(shared, name), "utf8"), { filename: name });
globalThis.OzonRuntime = { RUNTIME: { version: "0.1.19" } };
load("ozon_operation_registry.js");
load("ozon_entitlements.js");
load("ozon_contract.js");

const C = globalThis.OzonContract;
const R = globalThis.OzonOperationRegistry;
const E = globalThis.OzonEntitlements;
assert.ok(C && R && E);

const providerSet = [...new Set(Object.values(R.OPERATIONS).map((meta) => String(meta?.provider || "seller_api")))].sort();
assert.deepEqual(providerSet, ["performance_api", "report_file", "seller_api"], "provider taxonomy must be explicit and exhaustive");

const reportCommand = { operation: "report_file_get", params: { file_ref: "rpf_s_aaaaaaaaaaaa", offset: 0, limit: 200 } };
const reportRequirement = C.sellerCapabilityRequirement(reportCommand);
assert.equal(reportRequirement.required, false);
assert.equal(reportRequirement.known, true);
const directReportEntitlement = E.requirementFor(reportCommand);
assert.equal(directReportEntitlement.required, false);
assert.equal(directReportEntitlement.known, true);
assert.equal(directReportEntitlement.rule_source, "not_seller_or_missing");
assert.deepEqual(directReportEntitlement.reasons, []);
const reportPlan = C.planCommandForSellerCapability(reportCommand, { status: "unknown", subscription_type: "UNKNOWN" });
assert.equal(reportPlan.action, "execute");
assert.equal(reportPlan.planning.capability.status, "not_needed");
assert.equal(reportPlan.planning.entitlement.status, "SUPPORTED_AND_ENTITLED");
assert.equal(reportPlan.planning.entitlement.capability_required, false);
assert.equal(reportPlan.planning.entitlement.reason, "report_file_provider_not_seller_subscription");
assert.notEqual(reportPlan.planning.entitlement.reason, "performance_provider_not_seller_subscription");

const performanceCommand = { operation: "performance_campaigns", params: {} };
const directPerformanceEntitlement = E.requirementFor(performanceCommand);
assert.equal(directPerformanceEntitlement.required, false);
assert.equal(directPerformanceEntitlement.known, true);
assert.equal(directPerformanceEntitlement.rule_source, "not_seller_or_missing");
const performancePlan = C.planCommandForSellerCapability(performanceCommand, { status: "unknown", subscription_type: "UNKNOWN" });
assert.equal(performancePlan.action, "execute");
assert.equal(performancePlan.planning.entitlement.reason, "performance_provider_not_seller_subscription");

const sellerCommand = { operation: "report_products_create", params: {} };
const sellerPlan = C.planCommandForSellerCapability(sellerCommand, { status: "unknown", subscription_type: "UNKNOWN" });
assert.equal(sellerPlan.action, "execute");
assert.equal(sellerPlan.planning.entitlement.reason, "all_accounts");

assert.throws(() => C.buildRequest(reportCommand, {}), (error) => {
  assert.equal(error?.code, "WRONG_REQUEST_BUILDER");
  assert.match(String(error?.message || ""), /report_file/);
  assert.doesNotMatch(String(error?.message || ""), /Performance operation/);
  return true;
});
assert.throws(() => C.buildPerformanceRequest(reportCommand, {}), (error) => {
  assert.equal(error?.code, "WRONG_REQUEST_BUILDER");
  assert.match(String(error?.message || ""), /report_file/);
  assert.doesNotMatch(String(error?.message || ""), /Seller operation/);
  return true;
});

const sellerRequest = C.buildRequest(sellerCommand, { "Client-Id": "client", "Api-Key": "key" });
assert.equal(sellerRequest.host_alias, "seller_api");
const performanceRequest = C.buildPerformanceRequest(performanceCommand, { Authorization: "Bearer x" });
assert.equal(performanceRequest.host_alias, "performance_api");

const reportMeta = C.OPERATIONS.report_file_get;
assert.throws(() => globalThis.OzonContractFactory.createOzonContract({
  operations: {
    report_file_binary_probe: {
      ...reportMeta,
      response_style: "binary",
      response_content_types: ["text/csv"]
    }
  }
}), (error) => {
  assert.equal(error?.code, "RESPONSE_STYLE_NOT_READY");
  assert.match(String(error?.message || ""), /report_file binary response_style/);
  return true;
});

assert.throws(() => globalThis.OzonContractFactory.createOzonContract({
  operations: {
    future_provider_probe: {
      ...reportMeta,
      provider: "future_provider"
    }
  }
}), (error) => error?.code === "INVALID_REGISTRY_PROVIDER");

const realRegistry = globalThis.OzonOperationRegistry;
globalThis.OzonOperationRegistry = Object.freeze({ operation: () => ({ provider: "future_provider", method: "GET", path: "/future" }) });
const unknownEntitlement = E.requirementFor({ operation: "future_provider_probe", params: {} });
assert.equal(unknownEntitlement.known, false);
assert.deepEqual(unknownEntitlement.reasons, ["unknown_provider"]);
globalThis.OzonOperationRegistry = realRegistry;

load("ozon_credentials.js");
globalThis.ProviderTransportCore = Object.freeze({});
load("ozon_provider.js");
const fakeContract = Object.freeze({
  normalizeCommand: (command) => command,
  preflightExecution: () => ({ meta: { provider: "future_provider" } })
});
const fakeProvider = globalThis.OzonProviderFactory.createOzonProvider({ contract: fakeContract, fetchImpl: async () => { throw new Error("network must not execute"); }, uuid: () => "aaaaaaaaaaaa", now: () => 1 });
await assert.rejects(
  fakeProvider.executeCommandObject({ operation: "future_provider_probe", params: {} }, {}, {}),
  (error) => error?.code === "INVALID_PROVIDER_DISPATCH" && error?.external_request_executed === false
);

const providerSource = fs.readFileSync(path.join(shared, "ozon_provider.js"), "utf8");
assert.match(providerSource, /else if \(provider === "seller_api"\)/);
assert.match(providerSource, /INVALID_PROVIDER_DISPATCH/);
const serviceWorkerSource = fs.readFileSync(path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "service_worker.js"), "utf8");
assert.match(serviceWorkerSource, /if \(String\(preflight\.meta\.provider \|\| "seller_api"\) !== "seller_api"\) \{\s*return Object\.freeze\(\{ required: false, allowed: true, quota: null \}\);/);

console.log("OZON_PROVIDER_TAXONOMY_EXHAUSTIVE_PASS");
console.log("OZON_REPORT_FILE_ENTITLEMENT_REASON_PASS");
console.log("OZON_NON_SELLER_DIRECT_ENTITLEMENT_CLASSIFICATION_PASS");
console.log("OZON_PROVIDER_BUILDER_ERROR_CLASSIFICATION_PASS");
console.log("OZON_PROVIDER_EXECUTION_DISPATCH_EXHAUSTIVE_PASS");
console.log("OZON_PROVIDER_UNKNOWN_FAIL_CLOSED_PASS");
