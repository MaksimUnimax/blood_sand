#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true }); }
const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
for (const file of ["ozon_operation_registry.js","ozon_contract.js","ozon_credentials.js","provider_transport_core.js","ozon_provider.js"]) loadClassic(path.join(shared, file));

const operations = globalThis.OzonOperationRegistry.OPERATIONS;
const helper = operations.report_file_get;
assert.ok(helper, "report_file_get descriptor");
assert.equal(helper.provider, "report_file");
assert.equal(helper.effect, "READ");
assert.equal(helper.execution_enabled, true);
assert.equal(helper.privacy_policy, "operator_personal_data_gate");
assert.equal(helper.default_allowed, false);
assert.equal(Object.keys(operations).length, 297);

const signedUrl = "https://cdn1.ozone.ru/s3/reports/private-placement-report.csv?X-Signature=SECRET";
const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url) === "https://api-seller.ozon.ru/v1/report/info") {
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Client-Id"], "client");
    assert.equal(options.headers["Api-Key"], "key");
    return new Response(JSON.stringify({ result: { code: "REPORT_1", status: "success", error: "", file: signedUrl, report_type: "placement_by_products" } }), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (String(url) === signedUrl) {
    assert.equal(options.method, "GET");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.ok(!Object.keys(options.headers || {}).some((k) => /client-id|api-key|authorization/i.test(k)), "Seller credentials must not be sent to report file host");
    return new Response("date;warehouse;sku;qty\n2026-08-21;SAMARA;123;4\n", { status: 200, headers: { "content-type": "text/csv" } });
  }
  throw new Error(`unexpected fetch URL: ${url}`);
};
let uuidCounter = 0;
const uuids = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444"
];
const provider = globalThis.OzonProviderFactory.createOzonProvider({ fetchImpl, uuid: () => uuids[uuidCounter++] || `55555555-5555-4555-8555-${String(uuidCounter).padStart(12,"0")}`, now: () => 1_800_000_000_000 + uuidCounter });
const creds = { clientId: "client", apiKey: "key" };

const info = await provider.executeCommandObject({ operation: "report_info", params: { code: "REPORT_1" } }, creds, {});
assert.equal(info.ok, true);
assert.equal(calls.length, 1);
assert.equal(info.result?.result?.file, "[REDACTED]");
assert.match(info.result?.report_file_ref || "", /^rpf_[A-Za-z0-9_-]{12,120}$/);
assert.ok(!info.report_text.includes(signedUrl), "signed report URL leaked into report_text");
assert.ok(!JSON.stringify(info.result).includes("SECRET"), "signed report URL leaked into sanitized result");
const ref = info.result.report_file_ref;

await assert.rejects(
  provider.executeCommandObject({ operation: "report_file_get", params: { file_ref: "rpf_aaaaaaaaaaaa" } }, {}, {}),
  (error) => error?.code === "REPORT_FILE_REF_NOT_FOUND"
);
assert.equal(calls.length, 1, "unknown ref must not execute network request");

const file = await provider.executeCommandObject({ operation: "report_file_get", params: { file_ref: ref, offset: 0, limit: 200 } }, {}, {});
assert.equal(file.ok, true);
assert.equal(calls.length, 2, "file get must execute exactly one additional request");
assert.equal(file.provider, "report_file");
assert.equal(file.result?.format, "csv");
assert.deepEqual(file.result?.sheet?.columns, ["date", "warehouse", "sku", "qty"]);
assert.deepEqual(file.result?.sheet?.rows, [["2026-08-21", "SAMARA", "123", "4"]]);
assert.equal(file.result?.sheet?.row_count, 1);
assert.equal(file.result?.sheet?.has_more, false);
assert.ok(!JSON.stringify(file.result).includes("file_content_base64"), "base64 must not be exposed to AI");
assert.ok(!file.report_text.includes(signedUrl), "signed URL leaked from file request report");

assert.throws(() => globalThis.ProviderTransportCore.normalizeTrustedReportFileUrl("http://cdn1.ozone.ru/report.csv"), /HTTPS/);
assert.throws(() => globalThis.ProviderTransportCore.normalizeTrustedReportFileUrl("https://evil.example/report.csv"), /host/i);

console.log("OZON_REPORT_FILE_INFO_URL_REDACTED_PASS");
console.log("OZON_REPORT_FILE_OPAQUE_REF_PASS");
console.log("OZON_REPORT_FILE_UNKNOWN_REF_ZERO_REQUEST_PASS");
console.log("OZON_REPORT_FILE_ONE_EXPLICIT_GET_PASS");
console.log("OZON_REPORT_FILE_NO_SELLER_CREDENTIAL_LEAK_PASS");
console.log("OZON_REPORT_FILE_CSV_STRUCTURED_ROWS_PASS");
console.log("OZON_REPORT_FILE_NO_BASE64_AI_OUTPUT_PASS");
console.log("OZON_REPORT_FILE_HOST_SSRF_GUARD_PASS");
console.log("OZON_REPORT_FILE_WORKFLOW_GATE_PASS");
