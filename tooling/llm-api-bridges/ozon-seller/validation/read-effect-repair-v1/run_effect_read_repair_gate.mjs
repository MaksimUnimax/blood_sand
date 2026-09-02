#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) {
  vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true });
}
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
const repairAliases = ["report_products_create","report_returns_create_v2","report_postings_create","report_discounted_create","report_warehouse_stock","report_placement_by_products_create","report_placement_by_supplies_create","report_marked_products_sales_create","report_realization_posting_create","finance_document_b2b_sales","finance_mutual_settlement_report","finance_compensation_report","finance_decompensation_report","cargoes_label_create","posting_fbs_act_container_labels","posting_fbs_package_label","posting_fbs_package_label_create","cargoes_transport_label_by_order_create","cargoes_transport_label_create","fbp_act_from_create","fbp_act_to_create","fbp_label_create","fbp_draft_direct_product_validate","fbp_draft_dropoff_product_validate","fbp_draft_pickup_product_validate","chat_history_v3"];
console.log("EFFECT_REPAIR_PARTITION", JSON.stringify({ total: entries.length, seller_all: sellerAll.length, seller_enabled_reads: sellerReads.length, seller_current_reads: sellerCurrentReads.length, seller_beta_reads: sellerBetaReads.length, performance_enabled_reads: performanceReads.length }));
console.log("EFFECT_REPAIR_BETA_READS", JSON.stringify(sellerBetaReads.map(([alias,meta]) => ({ alias, path: meta.path }))));
assert.equal(entries.length, 296, "registry aliases");
assert.equal(repairAliases.length, 26);
assert.equal(sellerReads.length, 271, "Seller enabled reads including beta");
assert.equal(sellerCurrentReads.length, 269, "Seller current reads");
assert.equal(sellerBetaReads.length, 2, "Seller beta reads");
assert.deepEqual(sellerBetaReads.map(([alias]) => alias).sort(), ["ozon_auto_add_candidates","ozon_auto_add_products"].sort(), "expected beta reads");
assert.equal(performanceReads.length, 25, "Performance enabled aliases");
const entitlementText = fs.readFileSync(path.join(shared, "ozon_entitlements.js"), "utf8");
for (const alias of repairAliases) {
  const meta = operations[alias];
  assert.ok(meta, `${alias} descriptor`);
  assert.equal(meta.effect, "READ", `${alias} effect`);
  assert.equal(meta.execution_enabled, true, `${alias} enabled`);
  assert.equal(providerOf(meta), "seller_api", `${alias} provider`);
  assert.equal(meta.template?.operation, alias, `${alias} template operation`);
  assert.ok(entitlementText.includes(`"${meta.entitlement_key}"`), `${alias} entitlement`);
  const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
  assert.equal(normalized.operation, alias, `${alias} normalize`);
  if (meta.privacy_policy === "safe_projection") {
    const request = contract.buildRequest(normalized, { "Client-Id": "client", "Api-Key": "key" });
    assert.equal(request.method, "POST", `${alias} method`);
    assert.equal(request.path, meta.path, `${alias} fixed path`);
    assert.ok(!/[{}]/.test(request.path), `${alias} unresolved placeholder`);
  }
}
const gated = repairAliases.filter((alias) => operations[alias].privacy_policy === "operator_personal_data_gate");
assert.deepEqual(gated.sort(), ["chat_history_v3","posting_fbs_act_container_labels","posting_fbs_package_label"].sort());
const binary = repairAliases.filter((alias) => operations[alias].response_style === "binary");
assert.deepEqual(binary.sort(), ["posting_fbs_act_container_labels","posting_fbs_package_label"].sort());
const classifier = fs.readFileSync(path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "validation", "build_ozon_seller_step7_terminal_matrix.py"), "utf8");
assert.ok(classifier.includes("PASSIVE_ARTIFACT_GENERATION_WITHOUT_BUSINESS_STATE_CHANGE_IS_READ"));
assert.ok(!classifier.includes("SERVER_SIDE_GENERATION_IS_NOT_A_READ"));
console.log("OZON_EFFECT_READ_REPAIR_REGISTRY_296_PASS");
console.log("OZON_EFFECT_READ_REPAIR_SELLER_ENABLED_271_PASS");
console.log("OZON_EFFECT_READ_REPAIR_SELLER_CURRENT_269_BETA_2_PASS");
console.log("OZON_EFFECT_READ_REPAIR_ALIASES_26_PASS");
console.log("OZON_EFFECT_READ_REPAIR_PRIVACY_3_GATE_PASS");
console.log("OZON_EFFECT_READ_REPAIR_BINARY_2_PASS");
console.log("OZON_EFFECT_READ_REPAIR_SCHEMA_NORMALIZATION_26_PASS");
console.log("OZON_EFFECT_READ_REPAIR_GATE_PASS");
