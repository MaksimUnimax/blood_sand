#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true }); }
const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
for (const file of ["ozon_operation_registry.js", "provider_transport_core.js"]) loadClassic(path.join(shared, file));

const parser = globalThis.ProviderTransportCore.parseAiReadableReportBytes;
assert.equal(typeof parser, "function", "parseAiReadableReportBytes export");
const descriptor = globalThis.OzonOperationRegistry.OPERATIONS.report_file_get;
assert.ok(descriptor);
assert.equal(descriptor.request_style, "opaque_file_ref");
assert.equal(descriptor.template.params.offset, 0);
assert.equal(descriptor.template.params.limit, 200);

const XLSX_B64 = "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";
const xlsxBytes = Uint8Array.from(Buffer.from(XLSX_B64, "base64"));
const xlsx = await parser(xlsxBytes, {
  contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pathname: "/report.xlsx",
  offset: 0,
  limit: 1
});
assert.equal(xlsx.format, "xlsx");
assert.deepEqual(xlsx.available_sheets, ["Placement"]);
assert.deepEqual(xlsx.sheet.columns, ["date", "warehouse", "sku", "qty"]);
assert.equal(xlsx.sheet.row_count, 2);
assert.deepEqual(xlsx.sheet.rows, [["2026-08-21", "SAMARA", "123", 4]]);
assert.deepEqual(xlsx.sheet.row_numbers, [2]);
assert.equal(xlsx.sheet.has_more, true);
assert.equal(xlsx.sheet.next_offset, 1);

const xlsxPage2 = await parser(xlsxBytes, {
  contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pathname: "/report.xlsx",
  sheet: "Placement",
  offset: 1,
  limit: 10
});
assert.deepEqual(xlsxPage2.sheet.rows, [["2026-08-22", "OTHER", "456", 2]]);
assert.equal(xlsxPage2.sheet.has_more, false);
assert.equal(xlsxPage2.sheet.next_offset, null);

const csvBytes = new TextEncoder().encode('date;warehouse;sku;qty\n2026-08-21;SAMARA;123;4\n2026-08-22;OTHER;456;2\n');
const csv = await parser(csvBytes, { contentType: "text/csv", pathname: "/report.csv", offset: 1, limit: 1 });
assert.equal(csv.format, "csv");
assert.deepEqual(csv.sheet.columns, ["date", "warehouse", "sku", "qty"]);
assert.equal(csv.sheet.row_count, 2);
assert.deepEqual(csv.sheet.rows, [["2026-08-22", "OTHER", "456", "2"]]);
assert.equal(csv.sheet.has_more, false);
assert.ok(!JSON.stringify(csv).includes("file_content_base64"));
assert.ok(!JSON.stringify(xlsx).includes("file_content_base64"));

await assert.rejects(
  parser(new Uint8Array([1,2,3,4]), { contentType: "application/octet-stream", pathname: "/report.bin" }),
  (error) => error?.code === "REPORT_FILE_FORMAT_UNSUPPORTED"
);

console.log("OZON_REPORT_XLSX_PARSE_PASS");
console.log("OZON_REPORT_XLSX_PAGINATION_PASS");
console.log("OZON_REPORT_CSV_PARSE_PASS");
console.log("OZON_REPORT_NO_BASE64_AI_OUTPUT_PASS");
console.log("OZON_REPORT_UNSUPPORTED_FORMAT_FAIL_CLOSED_PASS");
console.log("OZON_AI_READABLE_REPORT_PARSER_GATE_PASS");
