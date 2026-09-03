#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
function loadClassic(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true }); }
const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
loadClassic(path.join(shared, "ozon_operation_registry.js"));
loadClassic(path.join(shared, "ozon_contract.js"));
const registry = globalThis.OzonOperationRegistry;
const contract = globalThis.OzonContract;
assert.ok(registry && contract);
const operations = registry.OPERATIONS;
const entries = Object.entries(operations);
const providerOf = (meta) => String(meta?.provider || "seller_api");
const isEnabledRead = (meta) => meta?.effect === "READ" && meta?.execution_enabled === true;
const isCurrentRead = (meta) => isEnabledRead(meta) && meta?.currentness === "current";
const sellerAll = entries.filter(([,meta]) => providerOf(meta) === "seller_api");
const sellerReads = sellerAll.filter(([,meta]) => isEnabledRead(meta));
const sellerCurrentReads = sellerAll.filter(([,meta]) => isCurrentRead(meta));
const sellerBetaReads = sellerAll.filter(([,meta]) => isEnabledRead(meta) && meta?.currentness === "beta");
const performanceReads = entries.filter(([,meta]) => providerOf(meta) === "performance_api" && isEnabledRead(meta));
const internalReads = entries.filter(([,meta]) => providerOf(meta) === "report_file" && isEnabledRead(meta));
const repairAliases = ["report_products_create","report_returns_create_v2","report_postings_create","report_discounted_create","report_warehouse_stock","report_placement_by_products_create","report_placement_by_supplies_create","report_marked_products_sales_create","report_realization_posting_create","finance_document_b2b_sales","finance_mutual_settlement_report","finance_compensation_report","finance_decompensation_report","cargoes_label_create","posting_fbs_act_container_labels","posting_fbs_package_label","posting_fbs_package_label_create","cargoes_transport_label_by_order_create","cargoes_transport_label_create","fbp_act_from_create","fbp_act_to_create","fbp_label_create","fbp_draft_direct_product_validate","fbp_draft_dropoff_product_validate","fbp_draft_pickup_product_validate","chat_history_v3"];
console.log("EFFECT_REPAIR_PARTITION", JSON.stringify({ total: entries.length, seller_enabled_reads: sellerReads.length, seller_current_reads: sellerCurrentReads.length, seller_beta_reads: sellerBetaReads.length, performance_enabled_reads: performanceReads.length, internal_reads: internalReads.length }));
assert.equal(entries.length, 297, "registry aliases incl internal report file helper");
assert.equal(repairAliases.length, 26);
assert.equal(sellerReads.length, 271);
assert.equal(sellerCurrentReads.length, 269);
assert.equal(sellerBetaReads.length, 2);
assert.deepEqual(sellerBetaReads.map(([alias]) => alias).sort(), ["ozon_auto_add_candidates","ozon_auto_add_products"].sort());
assert.equal(performanceReads.length, 25);
assert.deepEqual(internalReads.map(([alias]) => alias), ["report_file_get"]);
const entitlementText = fs.readFileSync(path.join(shared, "ozon_entitlements.js"), "utf8");
for (const alias of repairAliases) {
  const meta = operations[alias];
  assert.ok(meta); assert.equal(meta.effect, "READ"); assert.equal(meta.execution_enabled, true); assert.equal(providerOf(meta), "seller_api"); assert.equal(meta.template?.operation, alias);
  assert.ok(entitlementText.includes(`"${meta.entitlement_key}"`));
  const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
  assert.equal(normalized.operation, alias);
  if (meta.privacy_policy === "safe_projection") {
    const request = contract.buildRequest(normalized, { "Client-Id": "client", "Api-Key": "key" });
    assert.equal(request.method, "POST"); assert.equal(request.path, meta.path); assert.ok(!/[{}]/.test(request.path));
  }
}
const gated = repairAliases.filter((alias) => operations[alias].privacy_policy === "operator_personal_data_gate");
assert.deepEqual(gated.sort(), ["chat_history_v3","posting_fbs_act_container_labels","posting_fbs_package_label"].sort());
const binary = repairAliases.filter((alias) => operations[alias].response_style === "binary");
assert.deepEqual(binary.sort(), ["posting_fbs_act_container_labels","posting_fbs_package_label"].sort());
const classifier = fs.readFileSync(path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "validation", "build_ozon_seller_step7_terminal_matrix.py"), "utf8");
assert.ok(classifier.includes("PASSIVE_ARTIFACT_GENERATION_WITHOUT_BUSINESS_STATE_CHANGE_IS_READ"));
assert.ok(!classifier.includes("SERVER_SIDE_GENERATION_IS_NOT_A_READ"));
console.log("OZON_EFFECT_READ_REPAIR_REGISTRY_297_WITH_INTERNAL_HELPER_PASS");
console.log("OZON_EFFECT_READ_REPAIR_SELLER_ENABLED_271_PASS");
console.log("OZON_EFFECT_READ_REPAIR_SELLER_CURRENT_269_BETA_2_PASS");
console.log("OZON_EFFECT_READ_REPAIR_ALIASES_26_PASS");
console.log("OZON_EFFECT_READ_REPAIR_GATE_PASS");
const gateDir = path.dirname(fileURLToPath(import.meta.url));
const corrective = spawnSync(process.execPath, [path.join(gateDir, "run_live_gate_corrective_regression.mjs"), repo], { encoding: "utf8" });
if (corrective.stdout) process.stdout.write(corrective.stdout);
if (corrective.stderr) process.stderr.write(corrective.stderr);
assert.equal(corrective.status, 0, "live-gate corrective regression must pass inside package effect gate");
console.log("OZON_EFFECT_READ_REPAIR_CORRECTIVE_REGRESSION_CHAIN_PASS");
