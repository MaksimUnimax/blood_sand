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
for (const file of ["runtime_names.js", "ozon_operation_registry.js", "ozon_contract.js", "ozon_guidance.js"]) {
  loadClassic(path.join(shared, file));
}

const registry = globalThis.OzonOperationRegistry;
const contract = globalThis.OzonContract;
const guidance = globalThis.OzonGuidance;
assert.ok(registry && contract && guidance);

const FIXED_NOW = Date.UTC(2026, 8, 4, 12, 0, 0);
Date.now = () => FIXED_NOW;

const command = (operation, params) => ({ operation, params });
const normalize = (operation, params) => contract.normalizeCommand(command(operation, params));

function expectLocalReject(operation, params, message = operation) {
  let physicalBusinessRequestCount = 0;
  assert.throws(() => {
    contract.preflightExecution(command(operation, params));
    physicalBusinessRequestCount += 1;
  }, undefined, message);
  assert.equal(physicalBusinessRequestCount, 0, `${message}: provider request count must remain zero`);
}

function expectNormalizeReject(operation, params, message = operation) {
  let physicalBusinessRequestCount = 0;
  assert.throws(() => {
    normalize(operation, params);
    physicalBusinessRequestCount += 1;
  }, undefined, message);
  assert.equal(physicalBusinessRequestCount, 0, `${message}: provider request count must remain zero`);
}

function expectNormalizePass(operation, params, message = operation) {
  const normalized = normalize(operation, params);
  assert.equal(normalized.operation, operation, message);
  return normalized;
}

// 1. LIVE-confirmed finance_balance contract: effective wire format is YMD.
const financeBalanceValid = expectNormalizePass("finance_balance", { date_from: "2026-08-05", date_to: "2026-09-04" });
assert.equal(financeBalanceValid.params.date_from, "2026-08-05");
assert.equal(financeBalanceValid.params.date_to, "2026-09-04");
expectNormalizeReject("finance_balance", { date_from: "2026-08-28T00:00:00Z", date_to: "2026-09-03T23:59:59Z" }, "finance_balance RFC3339 must reject");
expectNormalizeReject("finance_balance", { date_from: "2026-02-31", date_to: "2026-03-01" }, "finance_balance impossible YMD");
expectNormalizeReject("finance_balance", { date_from: "2026-09-04", date_to: "2026-09-03" }, "finance_balance reversed");
expectNormalizeReject("finance_balance", { date_from: "2026-08-04", date_to: "2026-09-04" }, "finance_balance over 30-day difference");
console.log("DEFECT_015_FINANCE_BALANCE_YMD_30_DAY_GATE_PASS");

// 2. Shared strict formats: impossible date and loose JS date-time must fail.
for (const alias of ["report_placement_by_products_create", "report_placement_by_supplies_create"]) {
  expectNormalizePass(alias, { date_from: "2026-01-01", date_to: "2026-01-31" });
  expectNormalizeReject(alias, { date_from: "2026-02-31", date_to: "2026-03-01" }, `${alias} impossible date`);
  expectNormalizeReject(alias, { date_from: "2026-01-01", date_to: "2026-02-01" }, `${alias} >31 calendar days`);
}
expectNormalizeReject("report_marked_products_sales_create", { date: { from: "2026-02-31", to: "2026-03-01" } }, "marked products impossible date");
expectNormalizeReject("report_postings_create", { filter: { processed_at_from: "2026-01-01", processed_at_to: "2026-01-02T00:00:00Z", delivery_schema: ["fbo"] } }, "report postings date-only date-time");
expectNormalizeReject("report_postings_create", { filter: { processed_at_from: "2026-01-01T00:00:00", processed_at_to: "2026-01-02T00:00:00Z", delivery_schema: ["fbo"] } }, "report postings timezone-less date-time");
expectNormalizeReject("report_postings_create", { filter: { processed_at_from: "January 1, 2026", processed_at_to: "2026-01-02T00:00:00Z", delivery_schema: ["fbo"] } }, "report postings JS-parseable non-RFC3339");
expectNormalizeReject("report_postings_create", { filter: { processed_at_from: "2026-02-31T00:00:00Z", processed_at_to: "2026-03-01T00:00:00Z", delivery_schema: ["fbo"] } }, "report postings impossible RFC3339 calendar date");
expectNormalizePass("report_postings_create", { filter: { processed_at_from: "2026-01-01T00:00:00Z", processed_at_to: "2026-01-02T00:00:00Z", delivery_schema: ["fbo"] } });
console.log("DEFECT_015_SHARED_REAL_DATE_STRICT_RFC3339_GATE_PASS");

// 3. posting_fbo_list: every supplied optional boundary is strict RFC3339.
expectNormalizePass("posting_fbo_list", { filter: { since: "2026-09-01T00:00:00Z" } });
expectNormalizeReject("posting_fbo_list", { filter: { since: "2026-09-01" } }, "posting_fbo lone date-only since");
expectNormalizeReject("posting_fbo_list", { filter: { since: "September 1, 2026", to: "2026-09-02T00:00:00Z" } }, "posting_fbo loose JS date");
console.log("DEFECT_015_POSTING_FBO_STRICT_RFC3339_GATE_PASS");

// 4. Finance business-period rules.
const cashBase = { page: 1, page_size: 100, with_details: false };
expectNormalizePass("finance_cash_flow_statement_list", { ...cashBase, date: { from: "2026-09-01T00:00:00Z", to: "2026-09-15T23:59:59Z" } });
expectNormalizePass("finance_cash_flow_statement_list", { ...cashBase, date: { from: "2026-09-16T00:00:00Z", to: "2026-09-30T23:59:59Z" } });
expectNormalizeReject("finance_cash_flow_statement_list", { ...cashBase, date: { from: "2026-09-01T00:00:00Z", to: "2026-09-28T23:59:59Z" } }, "cash-flow arbitrary cross-half period");

// finance_transaction_list_v3 is proactively disabled ahead of the provider sunset,
// but the consolidated contract still contains the proven one-calendar-month guard.
expectNormalizePass("finance_transaction_list_v3", { page: 1, page_size: 100, filter: { date: { from: "2026-08-04T00:00:00Z", to: "2026-09-04T00:00:00Z" } } });
expectNormalizeReject("finance_transaction_list_v3", { page: 1, page_size: 100, filter: { date: { from: "2026-08-04T00:00:00Z", to: "2026-09-05T00:00:00Z" } } }, "transaction > one calendar month");

expectNormalizePass("finance_products_buyout", { date_from: "2026-08-05", date_to: "2026-09-04" });
expectNormalizeReject("finance_products_buyout", { date_from: "2026-08-04", date_to: "2026-09-04" }, "buyout >31 calendar days");
expectNormalizeReject("finance_products_buyout", { date_from: "2026-09-04", date_to: "2026-09-03" }, "buyout reversed");
expectNormalizeReject("finance_products_buyout", { date_from: "2026-02-31", date_to: "2026-03-01" }, "buyout impossible date");
console.log("DEFECT_015_FINANCE_PERIOD_RULES_GATE_PASS");

// 5. Realization calendar and historical boundaries.
expectNormalizePass("finance_realization_posting", { month: 8, year: 2023 });
expectNormalizePass("finance_realization_v2", { month: 8, year: 2023 });
for (const alias of ["finance_realization_posting", "finance_realization_v2"]) {
  expectNormalizeReject(alias, { month: 7, year: 2023 }, `${alias} pre-2023-08`);
  expectNormalizeReject(alias, { month: 13, year: 2026 }, `${alias} month 13`);
}
expectNormalizePass("report_realization_posting_create", { month: 8, year: 2023 });
expectNormalizeReject("report_realization_posting_create", { month: 7, year: 2023 }, "report realization pre-2023-08");
expectNormalizePass("finance_realization_by_day", { day: 4, month: 9, year: 2026 });
expectNormalizePass("finance_realization_by_day", { day: 3, month: 8, year: 2026 }); // exact 32-day age
expectNormalizeReject("finance_realization_by_day", { day: 2, month: 8, year: 2026 }, "realization by-day older than 32 days");
expectNormalizeReject("finance_realization_by_day", { day: 31, month: 2, year: 2026 }, "realization by-day impossible calendar date");
console.log("DEFECT_015_FINANCE_REALIZATION_GATE_PASS");

// 6. Current-relative FBO draft horizon with frozen 2026-09-04 clock.
const fboDraftBase = { draft_id: 1, supply_type: "DIRECT", selected_cluster_warehouses: [] };
expectNormalizePass("fbo_draft_timeslot_info", { ...fboDraftBase, date_from: "2026-09-04", date_to: "2026-09-05" });
expectNormalizePass("fbo_draft_timeslot_info", { ...fboDraftBase, date_from: "2026-09-04", date_to: "2026-10-01" }); // 28-day window inclusive
expectNormalizeReject("fbo_draft_timeslot_info", { ...fboDraftBase, date_from: "2026-09-04", date_to: "2026-10-02" }, "FBO draft outside 28-day horizon");
expectNormalizeReject("fbo_draft_timeslot_info", { ...fboDraftBase, date_from: "2026-09-03", date_to: "2026-09-04" }, "FBO draft starts before current date");
expectNormalizeReject("fbo_draft_timeslot_info", { ...fboDraftBase, date_from: "2026-09-05", date_to: "2026-09-04" }, "FBO draft reversed");
expectNormalizeReject("fbo_draft_timeslot_info", { ...fboDraftBase, date_from: "2026-02-31", date_to: "2026-09-05" }, "FBO draft impossible YMD");
console.log("DEFECT_015_FBO_DRAFT_CURRENT_28_DAY_GATE_PASS");

// 7. carriage_delivery_list_v2 exact real YMD.
expectNormalizePass("carriage_delivery_list_v2", { limit: 1, filter: { departure_date: "2026-09-04" } });
expectNormalizeReject("carriage_delivery_list_v2", { limit: 1, filter: { departure_date: "2026-02-31" } }, "carriage delivery impossible YMD");
console.log("DEFECT_015_CARRIAGE_DELIVERY_REAL_YMD_GATE_PASS");

// 8. Returns report strict RFC3339 + three-calendar-month recency.
const returnsStatus = "DisputeOpened";
expectNormalizePass("report_returns_create_v2", { filter: { date_from: "2026-06-04T00:00:00Z", date_to: "2026-09-03T23:59:59Z", status: returnsStatus } });
expectNormalizeReject("report_returns_create_v2", { filter: { date_from: "2026-06-03T00:00:00Z", date_to: "2026-09-03T23:59:59Z", status: returnsStatus } }, "returns report older than three months");
expectNormalizeReject("report_returns_create_v2", { filter: { date_from: "2026-09-01", date_to: "2026-09-03T23:59:59Z", status: returnsStatus } }, "returns report date-only date-time");
console.log("DEFECT_015_RETURNS_REPORT_RECENCY_GATE_PASS");

// 9. Certification expiry representations are mutually exclusive.
expectNormalizePass("product_certification_params_v2", { params: { expired_date: { infinite: true } } });
expectNormalizePass("product_certification_params_v2", { params: { expired_date: { date: { day: 1, month: 1, year: 2027 } } } });
expectNormalizeReject("product_certification_params_v2", { params: { expired_date: { infinite: false, date: { day: 1, month: 1, year: 2027 } } } }, "certificate date + infinite XOR");
console.log("DEFECT_015_CERTIFICATE_EXPIRY_XOR_GATE_PASS");

// 10. Performance strict alternate RFC3339 and 62-day limits, without leaking
// the global limit into explicitly exempt campaign-product / SKU methods.
for (const alias of ["performance_expense", "performance_daily", "performance_expense_csv", "performance_daily_csv"]) {
  expectNormalizePass(alias, { dateFrom: "2026-07-05", dateTo: "2026-09-04" }); // 62 calendar dates
  expectNormalizeReject(alias, { dateFrom: "2026-07-04", dateTo: "2026-09-04" }, `${alias} over 62 calendar dates`);
}
for (const alias of ["performance_media", "performance_media_csv"]) {
  expectNormalizePass(alias, { dateFrom: "2026-07-05", dateTo: "2026-09-04" });
  expectNormalizeReject(alias, { dateFrom: "2026-07-04", dateTo: "2026-09-04" }, `${alias} over 62 calendar dates`);
  expectNormalizePass(alias, { from: "2026-09-01T00:00:00Z", to: "2026-09-03T00:00:00Z" });
  expectNormalizeReject(alias, { from: "September 1, 2026", to: "2026-09-03T00:00:00Z" }, `${alias} loose alternate RFC3339`);
}
for (const alias of ["performance_campaign_product", "performance_campaign_product_csv"]) {
  expectNormalizePass(alias, { dateFrom: "2026-01-01", dateTo: "2026-09-04" }); // exempt from 62-day limit
  expectNormalizePass(alias, { from: "2026-09-01T00:00:00Z", to: "2026-09-03T00:00:00Z" });
  expectNormalizeReject(alias, { from: "September 1, 2026", to: "2026-09-03T00:00:00Z" }, `${alias} loose alternate RFC3339`);
}
expectNormalizePass("performance_sku_statistics", { dateFrom: "2026-09-03", dateTo: "2026-09-04" });
expectNormalizeReject("performance_sku_statistics", { dateFrom: "2026-09-02", dateTo: "2026-09-04" }, "SKU statistics dateFrom earlier than previous day");
console.log("DEFECT_015_PERFORMANCE_DATE_PERIOD_GATE_PASS");

// 11. Dynamic/current-relative templates are explicitly non-runnable.
for (const alias of [
  "ozon_auto_add_products",
  "ozon_auto_add_candidates",
  "finance_cash_flow_statement_list",
  "fbo_draft_timeslot_info",
  "report_returns_create_v2",
  "performance_sku_statistics"
]) {
  const meta = registry.OPERATIONS[alias];
  assert.ok(meta, alias);
  assert.equal(meta.template, null, `${alias} template must be null`);
  assert.equal(meta.template_runnable, false, `${alias} must be marked non-runnable`);
  assert.ok(Array.isArray(meta.required_parameters) && meta.required_parameters.length > 0, `${alias} must expose required dynamic/current input`);
}
assert.deepEqual(registry.OPERATIONS.finance_balance.template.params, { date_from: "2026-08-01", date_to: "2026-08-28" });
console.log("DEFECT_015_DYNAMIC_TEMPLATE_POLICY_GATE_PASS");

// 12. Provider lifecycle fail-closed. The 2026-09-08 transaction v3 sunset is
// proactively disabled rather than shipped as an about-to-die normal route.
for (const alias of ["fbs_stock_by_warehouse_v1", "fbs_carriage_available_list"]) {
  const meta = registry.OPERATIONS[alias];
  assert.equal(meta.execution_enabled, false, `${alias} must be disabled`);
  assert.equal(meta.currentness, "retired", `${alias} must be retired`);
  assert.equal(meta.guidance_visibility, "hidden", `${alias} must be hidden`);
  expectLocalReject(alias, {}, `${alias} retired local block`);
}
const transaction = registry.OPERATIONS.finance_transaction_list_v3;
assert.equal(transaction.execution_enabled, false);
assert.equal(transaction.currentness, "sunset_2026_09_08");
assert.equal(transaction.guidance_visibility, "hidden");
expectLocalReject("finance_transaction_list_v3", { page: 1, page_size: 100, filter: { posting_number: "P" } }, "transaction v3 proactive sunset block");
for (const alias of ["fbs_stock_by_warehouse_v1", "fbs_carriage_available_list", "finance_transaction_list_v3"]) {
  const visible = registry.operationsForCluster(registry.OPERATIONS[alias].cluster, null, { includeConditional: true, includeHidden: false }).map((row) => row.alias);
  assert.ok(!visible.includes(alias), `${alias} must not be ordinary guidance-visible`);
}
assert.equal(registry.OPERATIONS.fbs_stock_by_warehouse_v2.execution_enabled, true);
assert.equal(registry.OPERATIONS.carriage_delivery_list_v2.execution_enabled, true);
console.log("DEFECT_015_PROVIDER_LIFECYCLE_FAIL_CLOSED_GATE_PASS");

// 13. Explicitly unresolved rows remain unguessed.
assert.equal(registry.OPERATIONS.analytics_data.execution_enabled, true);
expectNormalizePass("analytics_data", { date_from: "2026-09-01", date_to: "2026-09-03", metrics: ["revenue"], dimension: ["sku"], limit: 1 });
assert.doesNotThrow(() => normalize("finance_b2b_sales_json", { date: "2019-01" }));
console.log("DEFECT_015_UNRESOLVED_ROWS_NOT_GUESSED_PASS");

// 14. Guidance cards must honor non-runnable template metadata.
const financeGuidance = guidance.result({ status: "cluster_suggested", cluster: "finance", version: 2 });
for (const alias of ["finance_cash_flow_statement_list"]) {
  const card = financeGuidance.choices.find((choice) => choice.operation === alias);
  if (card) {
    assert.equal(card.template_runnable, false);
    assert.equal(card.template, null);
  }
}
console.log("DEFECT_015_GUIDANCE_TEMPLATE_CURRENTNESS_GATE_PASS");

console.log("DEFECT_015_DATE_REPAIR_GATE_PASS");
