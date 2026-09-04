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
const providerSource = fs.readFileSync(path.join(shared, "ozon_provider.js"), "utf8");
assert.match(providerSource, /chrome\?\.storage\?\.session/);
assert.match(providerSource, /ozmb_report_file_session_state_v1/);
assert.match(providerSource, /rpf_\$\{marker\}_/);

const signedCsvUrl = "https://cdn1.ozone.ru/lifecycle/safe.csv?X-Signature=SECRET";
const asyncPdfUrl = "https://cdn1.ozone.ru/lifecycle/cargo.pdf?X-Signature=SECRET2";
const pdfText = "%PDF-1.4\n1 0 obj\n<< /Length 55 >>\nstream\nBT /F1 12 Tf 10 10 Td (OZON LIFECYCLE OK) Tj ET\nendstream\nendobj\n%%EOF\n";
const pdfBytes = new TextEncoder().encode(pdfText);
const calls = [];
let reportInfoUrl = signedCsvUrl;

const fetchImpl = async (url, options = {}) => {
  const raw = String(url);
  calls.push({ url: raw, options });
  const pathname = new URL(raw).pathname;
  if (pathname === operations.report_products_create.path) {
    return new Response(JSON.stringify({ result: { code: "REPORT_LIFECYCLE_SAFE" } }), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (pathname === "/v1/report/info") {
    const body = JSON.parse(String(options.body || "{}"));
    return new Response(JSON.stringify({ result: { code: body.code, status: "success", error: "", file: reportInfoUrl, report_type: "seller_products" } }), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (raw === signedCsvUrl) {
    assert.equal(options.method, "GET");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.ok(!Object.keys(options.headers || {}).some((key) => /client-id|api-key|authorization/i.test(key)));
    return new Response("sku;qty\n123;4\n", { status: 200, headers: { "content-type": "text/csv" } });
  }
  if (pathname === operations.posting_fbs_package_label.path) {
    return new Response(pdfBytes, { status: 200, headers: { "content-type": "application/pdf" } });
  }
  if (pathname === operations.cargoes_label_get.path) {
    return new Response(JSON.stringify({ result: { file_guid: "GUID", file_url: asyncPdfUrl }, status: "SUCCESS", errors: { error_reasons: [] } }), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (raw === asyncPdfUrl) {
    assert.equal(options.method, "GET");
    assert.equal(options.credentials, "omit");
    assert.ok(!Object.keys(options.headers || {}).some((key) => /client-id|api-key|authorization/i.test(key)));
    return new Response(pdfBytes, { status: 200, headers: { "content-type": "application/pdf" } });
  }
  throw new Error(`unexpected lifecycle URL: ${raw}`);
};

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
let storedState = null;
const store = {
  async get() { return clone(storedState); },
  async set(value) { storedState = clone(value); }
};
let nowMs = 1_800_000_000_000;
let uuidCounter = 0;
const creds = { clientId: "client", apiKey: "key" };
function provider() {
  return globalThis.OzonProviderFactory.createOzonProvider({
    fetchImpl,
    reportStateStore: store,
    uuid: () => `77777777-7777-4777-8777-${String(++uuidCounter).padStart(12, "0")}`,
    now: () => nowMs
  });
}

// A -> B: safe report-code provenance survives provider/worker-equivalent recreation.
const A = provider();
const create = await A.executeCommandObject({ operation: "report_products_create", params: {} }, creds, {});
assert.equal(create.ok, true);
assert.equal(create.result?.result?.code, "REPORT_LIFECYCLE_SAFE");
const B = provider();
const info = await B.executeCommandObject({ operation: "report_info", params: { code: "REPORT_LIFECYCLE_SAFE" } }, creds, {});
assert.equal(info.ok, true);
assert.match(info.result?.report_file_ref || "", /^rpf_s_/);
assert.deepEqual(B.reportFileRefPolicy(info.result.report_file_ref), { known: true, personal_data_required: false });
assert.equal(info.result?.result?.file, "[REDACTED]");
assert.ok(!info.report_text.includes(signedCsvUrl));
assert.ok(!JSON.stringify(info.result).includes("SECRET"));

// B -> C: opaque URL ref survives recreation and executes exactly one trusted GET.
const beforeCsv = calls.length;
const C = provider();
const file = await C.executeCommandObject({ operation: "report_file_get", params: { file_ref: info.result.report_file_ref, offset: 0, limit: 200 } }, {}, {});
assert.equal(file.ok, true);
assert.equal(calls.length, beforeCsv + 1);
assert.equal(file.provider, "report_file");
assert.equal(file.http_status, 200);
assert.equal(file.result?.format, "csv");
assert.deepEqual(file.result?.sheet?.rows, [["123", "4"]]);
assert.ok(!file.report_text.includes(signedCsvUrl));
assert.ok(!JSON.stringify(file.result).includes("file_content_base64"));

// Unknown historical report provenance remains fail-closed after recreation.
reportInfoUrl = "https://cdn1.ozone.ru/lifecycle/historical.csv?X-Signature=HIDDEN";
const D = provider();
const historical = await D.executeCommandObject({ operation: "report_info", params: { code: "REPORT_HISTORICAL_UNKNOWN" } }, creds, {});
assert.match(historical.result?.report_file_ref || "", /^rpf_p_/);
assert.deepEqual(D.reportFileRefPolicy(historical.result.report_file_ref), { known: true, personal_data_required: true });
assert.deepEqual(D.reportFileRefPolicy("rpf_missing"), { known: false, personal_data_required: false });

// Fabricated/unknown safe-looking ref remains zero-request and cannot resolve another record.
const beforeMissing = calls.length;
await assert.rejects(
  provider().executeCommandObject({ operation: "report_file_get", params: { file_ref: "rpf_s_fabricated" } }, {}, {}),
  (error) => error?.code === "REPORT_FILE_REF_NOT_FOUND" && error?.external_request_executed === false
);
assert.equal(calls.length, beforeMissing);

// Direct inline PDF generated_file_ref survives recreation with zero extra provider/network request.
const E = provider();
const direct = await E.executeCommandObject(JSON.parse(JSON.stringify(operations.posting_fbs_package_label.template)), creds, {});
assert.equal(direct.ok, true);
assert.match(direct.result?.generated_file_ref || "", /^rpf_p_/);
assert.ok(!JSON.stringify(direct.result).includes("file_content_base64"));
const beforeInline = calls.length;
const F = provider();
const inlineFile = await F.executeCommandObject({ operation: "report_file_get", params: { file_ref: direct.result.generated_file_ref } }, {}, {});
assert.equal(calls.length, beforeInline);
assert.equal(inlineFile.result?.format, "pdf");
assert.match(inlineFile.result?.text_extract || inlineFile.result?.text || "", /OZON LIFECYCLE OK/);

// Async generated URL ref survives recreation and still isolates Seller credentials.
const G = provider();
const asyncDoc = await G.executeCommandObject({ operation: "cargoes_label_get", params: { operation_id: "OP_CARGO" } }, creds, {});
assert.equal(asyncDoc.ok, true);
assert.match(asyncDoc.result?.generated_file_ref || "", /^rpf_[sp]_/);
assert.ok(!JSON.stringify(asyncDoc.result).includes("cdn1.ozone.ru"));
const beforeAsyncFile = calls.length;
const H = provider();
const asyncFile = await H.executeCommandObject({ operation: "report_file_get", params: { file_ref: asyncDoc.result.generated_file_ref } }, {}, {});
assert.equal(calls.length, beforeAsyncFile + 1);
assert.equal(asyncFile.result?.format, "pdf");
assert.match(asyncFile.result?.text_extract || asyncFile.result?.text || "", /OZON LIFECYCLE OK/);
assert.ok(!asyncFile.report_text.includes(asyncPdfUrl));

// TTL remains 30 minutes and expiry stays zero-request/fail-closed.
const expiredRef = asyncDoc.result.generated_file_ref;
nowMs += 30 * 60 * 1000 + 1;
const beforeExpired = calls.length;
await assert.rejects(
  provider().executeCommandObject({ operation: "report_file_get", params: { file_ref: expiredRef } }, {}, {}),
  (error) => error?.code === "REPORT_FILE_REF_NOT_FOUND" && error?.external_request_executed === false
);
assert.equal(calls.length, beforeExpired);

// Session storage failures are explicit; they never fabricate safe state.
const readFailStore = { async get() { throw new Error("read down"); }, async set() {} };
await assert.rejects(
  globalThis.OzonProviderFactory.createOzonProvider({ fetchImpl, reportStateStore: readFailStore }).executeCommandObject({ operation: "report_file_get", params: { file_ref: "rpf_s_any" } }, {}, {}),
  (error) => error?.code === "REPORT_FILE_SESSION_STATE_READ_FAILED" && error?.external_request_executed === false
);
const writeFailStore = { async get() { return null; }, async set() { throw new Error("write down"); } };
await assert.rejects(
  globalThis.OzonProviderFactory.createOzonProvider({ fetchImpl, reportStateStore: writeFailStore, uuid: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", now: () => 1_800_000_000_000 }).executeCommandObject({ operation: "report_products_create", params: {} }, creds, {}),
  (error) => error?.code === "REPORT_FILE_SESSION_STATE_WRITE_FAILED" && error?.external_request_executed === true
);

console.log("OZON_REPORT_SESSION_CHROME_STORAGE_WIRING_PASS");
console.log("OZON_REPORT_CODE_PROVENANCE_RECREATION_PASS");
console.log("OZON_REPORT_FILE_REF_RECREATION_PASS");
console.log("OZON_REPORT_UNKNOWN_PROVENANCE_FAIL_CLOSED_RECREATION_PASS");
console.log("OZON_REPORT_UNKNOWN_REF_ZERO_REQUEST_RECREATION_PASS");
console.log("OZON_REPORT_INLINE_PDF_REF_RECREATION_PASS");
console.log("OZON_REPORT_GENERATED_URL_REF_RECREATION_PASS");
console.log("OZON_REPORT_SESSION_TTL_FAIL_CLOSED_PASS");
console.log("OZON_REPORT_SESSION_STORAGE_FAILURE_FAIL_HONEST_PASS");
console.log("OZON_REPORT_FILE_LIFECYCLE_GATE_PASS");
