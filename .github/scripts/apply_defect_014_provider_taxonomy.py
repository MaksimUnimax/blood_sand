from pathlib import Path

root = Path('.')
contract = root / 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/ozon_contract.js'
master = root / 'tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_effect_read_repair_gate.mjs'
report_gate = root / 'tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_report_file_workflow_gate.mjs'
taxonomy_gate = root / 'tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_provider_taxonomy_gate.mjs'
defect_doc = root / 'tooling/llm-api-bridges/ozon-seller/research/product/OZON_AI_WORKER_REPAIRED_26_READS_LIVE_DEFECT_014_2026-09-04.md'


def replace_once(path, old, new):
    text = path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, got {count}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8', newline='\n')


replace_once(
    contract,
    '''      const allowedBinaryContentType = provider === "seller_api"\n        ? /^(application\\/pdf|image\\/png)$/\n        : /^(text\\/csv|application\\/zip)$/;\n      if (!contentTypes.length || contentTypes.some((item) => !allowedBinaryContentType.test(String(item)))) {''',
    '''      let allowedBinaryContentType = null;\n      if (provider === "seller_api") allowedBinaryContentType = /^(application\\/pdf|image\\/png)$/;\n      else if (provider === "performance_api") allowedBinaryContentType = /^(text\\/csv|application\\/zip)$/;\n      else if (provider === "report_file") fail("RESPONSE_STYLE_NOT_READY", `${name}: report_file binary response_style должен обрабатываться через opaque report-file transport.`);\n      else fail("INVALID_REGISTRY_PROVIDER", `${name}: неизвестный provider ${provider}.`);\n      if (!contentTypes.length || contentTypes.some((item) => !allowedBinaryContentType.test(String(item)))) {'''
)

replace_once(
    contract,
    '''      const normalized = normalizeCommand(command);\n      const meta = resolveOperation(normalized.operation).meta;\n      if (String(meta.provider || "seller_api") !== "seller_api") {\n        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {\n          status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: false, reason: "performance_provider_not_seller_subscription"\n        });\n      }\n\n      const requirement = globalThis.OzonEntitlements?.requirementFor''',
    '''      const normalized = normalizeCommand(command);\n      const meta = resolveOperation(normalized.operation).meta;\n      const provider = String(meta.provider || "seller_api");\n      if (provider === "performance_api") {\n        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {\n          status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: false, reason: "performance_provider_not_seller_subscription"\n        });\n      }\n      if (provider === "report_file") {\n        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {\n          status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: false, reason: "report_file_provider_not_seller_subscription"\n        });\n      }\n      if (provider !== "seller_api") fail("INVALID_REGISTRY_PROVIDER", `${normalized.operation}: неизвестный provider ${provider}.`);\n\n      const requirement = globalThis.OzonEntitlements?.requirementFor'''
)

replace_once(
    contract,
    '''      const preflight = preflightExecution(command);\n      const { meta } = preflight;\n      if (String(meta.provider || "seller_api") !== "seller_api") fail("WRONG_REQUEST_BUILDER", "Performance operation нельзя отправить через Seller request builder.");\n      if (!/^https:\\/\\/api-seller\\.ozon\\.ru$/.test(sellerApiBase)) fail("INVALID_FIXED_HOST", "Seller API host не прошёл fixed-host guard.");''',
    '''      const preflight = preflightExecution(command);\n      const { meta } = preflight;\n      const provider = String(meta.provider || "seller_api");\n      if (provider !== "seller_api") fail("WRONG_REQUEST_BUILDER", `Provider ${provider} нельзя отправить через Seller request builder.`);\n      if (!/^https:\\/\\/api-seller\\.ozon\\.ru$/.test(sellerApiBase)) fail("INVALID_FIXED_HOST", "Seller API host не прошёл fixed-host guard.");'''
)

replace_once(
    contract,
    '''      const preflight = preflightExecution(command);\n      const { meta } = preflight;\n      if (String(meta.provider || "seller_api") !== "performance_api") fail("WRONG_REQUEST_BUILDER", "Seller operation нельзя отправить через Performance request builder.");\n      if (!/^https:\\/\\/api-performance\\.ozon\\.ru$/.test(performanceApiBase)) fail("INVALID_FIXED_HOST", "Performance API host не прошёл fixed-host guard.");''',
    '''      const preflight = preflightExecution(command);\n      const { meta } = preflight;\n      const provider = String(meta.provider || "seller_api");\n      if (provider !== "performance_api") fail("WRONG_REQUEST_BUILDER", `Provider ${provider} нельзя отправить через Performance request builder.`);\n      if (!/^https:\\/\\/api-performance\\.ozon\\.ru$/.test(performanceApiBase)) fail("INVALID_FIXED_HOST", "Performance API host не прошёл fixed-host guard.");'''
)

taxonomy_gate.write_text(r'''#!/usr/bin/env node
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
assert.ok(C && R);

const providerSet = [...new Set(Object.values(R.OPERATIONS).map((meta) => String(meta?.provider || "seller_api")))].sort();
assert.deepEqual(providerSet, ["performance_api", "report_file", "seller_api"], "provider taxonomy must be explicit and exhaustive");

const reportCommand = { operation: "report_file_get", params: { file_ref: "rpf_s_aaaaaaaaaaaa", offset: 0, limit: 200 } };
const reportRequirement = C.sellerCapabilityRequirement(reportCommand);
assert.equal(reportRequirement.required, false);
assert.equal(reportRequirement.known, true);
const reportPlan = C.planCommandForSellerCapability(reportCommand, { status: "unknown", subscription_type: "UNKNOWN" });
assert.equal(reportPlan.action, "execute");
assert.equal(reportPlan.planning.capability.status, "not_needed");
assert.equal(reportPlan.planning.entitlement.status, "SUPPORTED_AND_ENTITLED");
assert.equal(reportPlan.planning.entitlement.capability_required, false);
assert.equal(reportPlan.planning.entitlement.reason, "report_file_provider_not_seller_subscription");
assert.notEqual(reportPlan.planning.entitlement.reason, "performance_provider_not_seller_subscription");

const performanceCommand = { operation: "performance_campaigns", params: {} };
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

console.log("OZON_PROVIDER_TAXONOMY_EXHAUSTIVE_PASS");
console.log("OZON_REPORT_FILE_ENTITLEMENT_REASON_PASS");
console.log("OZON_PROVIDER_BUILDER_ERROR_CLASSIFICATION_PASS");
console.log("OZON_PROVIDER_UNKNOWN_FAIL_CLOSED_PASS");
''', encoding='utf-8', newline='\n')

replace_once(
    master,
    '''console.log("OZON_EFFECT_READ_REPAIR_CORRECTIVE_REGRESSION_CHAIN_PASS");\nconst lifecycle = spawnSync(process.execPath, [path.join(gateDir, "run_report_file_lifecycle_gate.mjs"), repo], { encoding: "utf8" });''',
    '''console.log("OZON_EFFECT_READ_REPAIR_CORRECTIVE_REGRESSION_CHAIN_PASS");\nconst providerTaxonomy = spawnSync(process.execPath, [path.join(gateDir, "run_provider_taxonomy_gate.mjs"), repo], { encoding: "utf8" });\nif (providerTaxonomy.stdout) process.stdout.write(providerTaxonomy.stdout);\nif (providerTaxonomy.stderr) process.stderr.write(providerTaxonomy.stderr);\nassert.equal(providerTaxonomy.status, 0, "provider taxonomy dependency-closure regression must pass inside package effect gate");\nconsole.log("OZON_EFFECT_READ_REPAIR_PROVIDER_TAXONOMY_CHAIN_PASS");\nconst lifecycle = spawnSync(process.execPath, [path.join(gateDir, "run_report_file_lifecycle_gate.mjs"), repo], { encoding: "utf8" });'''
)

replace_once(
    report_gate,
    '''assert.equal(helper.default_allowed, undefined);\nassert.equal(Object.keys(operations).length, 297);''',
    '''assert.equal(helper.default_allowed, undefined);\nconst reportFilePlan = globalThis.OzonContract.planCommandForSellerCapability(\n  { operation: "report_file_get", params: { file_ref: "rpf_s_aaaaaaaaaaaa", offset: 0, limit: 200 } },\n  { status: "unknown", subscription_type: "UNKNOWN" }\n);\nassert.equal(reportFilePlan.planning.entitlement.reason, "report_file_provider_not_seller_subscription");\nassert.notEqual(reportFilePlan.planning.entitlement.reason, "performance_provider_not_seller_subscription");\nassert.equal(Object.keys(operations).length, 297);'''
)

replace_once(
    report_gate,
    '''console.log("OZON_REPORT_FILE_MV3_HOST_PERMISSIONS_PASS");''',
    '''console.log("OZON_REPORT_FILE_PROVIDER_PLANNING_METADATA_PASS");\nconsole.log("OZON_REPORT_FILE_MV3_HOST_PERMISSIONS_PASS");'''
)

defect_doc.write_text(r'''# DEFECT-014 — report-file provider misclassified as Performance in planning metadata

Date: 2026-09-04
Branch: `research/ozon-product-demand-2026-09-02`
Baseline installed build: `51ab3fbeb97ac6a3fc693fd40a0a81d5d818ca0a`
Classification: `NON_SELLER_BINARY_PROVIDER_ASSUMPTION_MISCLASSIFIES_REPORT_FILE`
Status before repair: `OPEN_CONFIRMED_LIVE`

## Live evidence

The real `report_file_get` workflow succeeded against Ozon with one external GET and HTTP 200, but the result reported:

- `host_alias = report_file`
- `planning.entitlement.reason = performance_provider_not_seller_subscription`

The provider classification in the entitlement reason is therefore false even though file transport itself succeeds.

## Root cause

The contract planner predated the `report_file` provider and used a binary assumption: every provider other than `seller_api` was treated as Performance. When `report_file` was later added as a third provider, that catch-all branch and related builder error assumptions were not exhaustively re-audited.

## Dependency closure

Current provider taxonomy is exactly:

1. `seller_api`
2. `performance_api`
3. `report_file`

The repair removes binary/catch-all assumptions from provider-sensitive contract paths:

- planning metadata;
- Seller request-builder rejection;
- Performance request-builder rejection;
- binary response-style validation.

Seller capability probing and Seller quota bypass remain intentionally shared for all non-Seller providers because neither Performance nor report-file execution uses Seller subscription probing or Seller analytics quota state. Provider execution dispatch already distinguishes all three providers explicitly and is unchanged.

## Acceptance

Pre-handoff requires:

- exhaustive provider taxonomy regression;
- report-file reason is report-file-specific and never Performance-specific;
- Performance reason remains unchanged;
- Seller planning remains unchanged;
- wrong builder errors identify the actual provider;
- unknown/future provider fails closed;
- report-file workflow gate checks planning metadata as part of the full output contract;
- full existing repair/package gate remains green on the final artifact.

Post-install live confirmation must replay the fresh report workflow and confirm the real `report_file_get` output no longer contains the Performance reason.
''', encoding='utf-8', newline='\n')
