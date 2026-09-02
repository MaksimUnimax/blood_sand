#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true }); }
const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
for (const file of ["ozon_operation_registry.js", "ozon_contract.js"]) loadClassic(path.join(shared, file));
const ops = globalThis.OzonOperationRegistry.OPERATIONS;
const contract = globalThis.OzonContract;
const aliases = ["report_products_create","report_returns_create_v2","report_postings_create","report_discounted_create","report_warehouse_stock","report_placement_by_products_create","report_placement_by_supplies_create","report_marked_products_sales_create","report_realization_posting_create","finance_document_b2b_sales","finance_mutual_settlement_report","finance_compensation_report","finance_decompensation_report","cargoes_label_create","posting_fbs_act_container_labels","posting_fbs_package_label","posting_fbs_package_label_create","cargoes_transport_label_by_order_create","cargoes_transport_label_create","fbp_act_from_create","fbp_act_to_create","fbp_label_create","fbp_draft_direct_product_validate","fbp_draft_dropoff_product_validate","fbp_draft_pickup_product_validate","chat_history_v3"];
for (const alias of aliases) {
  const meta = ops[alias];
  assert.ok(meta, alias);
  const normalized = contract.normalizeCommand(JSON.parse(JSON.stringify(meta.template)));
  assert.equal(normalized.operation, alias);
}

assert.deepEqual(ops.report_marked_products_sales_create.template.params, { date: { from: "2026-01-01", to: "2026-01-01" } });
assert.equal(ops.finance_compensation_report.template.params.date, "2026-01");
assert.deepEqual(ops.cargoes_label_create.template.params.cargoes, [{ cargo_id: 1 }]);
assert.deepEqual(ops.posting_fbs_package_label_create.template.params.posting_number, ["POSTING_NUMBER"]);
assert.deepEqual(ops.cargoes_transport_label_create.template.params.transport_cargo_ids, ["1"]);

const goodPostings = contract.normalizeCommand({ operation: "report_postings_create", params: { filter: {
  processed_at_from: "2026-01-01T00:00:00Z", processed_at_to: "2026-01-02T00:00:00Z", delivery_schema: ["FBO"],
  sku: [1], status_alias: ["delivered"], statuses: [1], title: "x", warehouse_id: [1], delivery_method_id: [1], is_express: false
}, with: { additional_data: false, analytics_data: true, customer_data: false, jewelry_codes: false } } });
assert.equal(goodPostings.params.filter.sku[0], 1);
assert.throws(() => contract.normalizeCommand({ operation: "report_postings_create", params: { filter: { processed_at_from: "2026-01-01T00:00:00Z", processed_at_to: "2026-01-02T00:00:00Z", delivery_schema: ["FBO"], status: ["delivered"] } } }), /неподдерживаем|недопуст|пол/i);

assert.doesNotThrow(() => contract.normalizeCommand({ operation: "report_marked_products_sales_create", params: { date: { from: "2026-01-01", to: "2026-01-31" } } }));
assert.throws(() => contract.normalizeCommand({ operation: "report_marked_products_sales_create", params: { date: "2026-01-01" } }));
assert.throws(() => contract.normalizeCommand({ operation: "report_marked_products_sales_create", params: { date: { from: "2026-01-31", to: "2026-01-01" } } }));

for (const alias of ["finance_document_b2b_sales","finance_mutual_settlement_report","finance_compensation_report","finance_decompensation_report"]) {
  assert.doesNotThrow(() => contract.normalizeCommand({ operation: alias, params: { date: "2026-01" } }));
  assert.throws(() => contract.normalizeCommand({ operation: alias, params: { date: "2026-01-01" } }));
  assert.throws(() => contract.normalizeCommand({ operation: alias, params: { date: "2026-13" } }));
}

for (const alias of ["report_placement_by_products_create","report_placement_by_supplies_create"]) {
  assert.doesNotThrow(() => contract.normalizeCommand({ operation: alias, params: { date_from: "2026-01-01", date_to: "2026-01-31" } }));
  assert.throws(() => contract.normalizeCommand({ operation: alias, params: { date_from: "2026-01-01", date_to: "2026-02-01" } }));
  assert.throws(() => contract.normalizeCommand({ operation: alias, params: { date_from: "2026-01-31", date_to: "2026-01-01" } }));
  assert.throws(() => contract.normalizeCommand({ operation: alias, params: { date_from: "2026/01/01", date_to: "2026-01-01" } }));
}

assert.doesNotThrow(() => contract.normalizeCommand({ operation: "cargoes_label_create", params: { supply_id: 1, cargoes: [{ cargo_id: 2 }] } }));
assert.throws(() => contract.normalizeCommand({ operation: "cargoes_label_create", params: { supply_id: 1, cargoes: [2] } }));
assert.doesNotThrow(() => contract.normalizeCommand({ operation: "posting_fbs_package_label_create", params: { posting_number: ["A", "B"] } }));
assert.throws(() => contract.normalizeCommand({ operation: "posting_fbs_package_label_create", params: { posting_number: "A" } }));
assert.doesNotThrow(() => contract.normalizeCommand({ operation: "cargoes_transport_label_create", params: { supply_id: 1, transport_cargo_ids: ["123"] } }));
assert.throws(() => contract.normalizeCommand({ operation: "cargoes_transport_label_create", params: { supply_id: 1, transport_cargo_ids: [123] } }));
assert.throws(() => contract.normalizeCommand({ operation: "cargoes_transport_label_create", params: { supply_id: 1, transport_cargo_ids: Array.from({length:41}, (_,i)=>String(i+1)) } }));
assert.doesNotThrow(() => contract.normalizeCommand({ operation: "report_realization_posting_create", params: { month: 8, year: 2026 } }));
assert.throws(() => contract.normalizeCommand({ operation: "report_realization_posting_create", params: { month: 13, year: 2026 } }));

console.log("OZON_26_ALL_TEMPLATES_NORMALIZE_PASS");
console.log("OZON_REPORT_POSTINGS_EXACT_FILTER_FIELDS_PASS");
console.log("OZON_MARKED_PRODUCTS_DATE_OBJECT_PASS");
console.log("OZON_FINANCE_MONTH_EXACT_FORMAT_PASS");
console.log("OZON_PLACEMENT_31_DAY_EXACT_BOUND_PASS");
console.log("OZON_CARGOES_LABEL_OBJECT_ITEMS_PASS");
console.log("OZON_PACKAGE_LABEL_CREATE_ARRAY_PASS");
console.log("OZON_TRANSPORT_CARGO_ID_STRING_PASS");
console.log("OZON_REALIZATION_MONTH_BOUND_PASS");
console.log("OZON_EXACT_26_SCHEMA_GATE_PASS");
