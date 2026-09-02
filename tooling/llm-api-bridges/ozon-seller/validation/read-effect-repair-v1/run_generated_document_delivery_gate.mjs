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

const pdfText = "%PDF-1.4\n1 0 obj\n<< /Length 48 >>\nstream\nBT /F1 12 Tf 10 10 Td (LABEL 123) Tj ET\nendstream\nendobj\n%%EOF\n";
const pdfBytes = new TextEncoder().encode(pdfText);
const directParse = await globalThis.ProviderTransportCore.parseAiReadableReportBytes(pdfBytes, { contentType: "application/pdf", pathname: "/label.pdf" });
assert.equal(directParse.format, "pdf");
assert.equal(directParse.text_extract_available, true);
assert.match(directParse.text_extract, /LABEL 123/);

const signedUrl = "https://cdn1.ozone.ru/s3/labels/private-label.pdf?X-Signature=SECRET";
const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url) === "https://api-seller.ozon.ru/v1/cargoes-label/get") {
    return new Response(JSON.stringify({ result: { status: "success", file_url: signedUrl } }), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (String(url) === signedUrl) {
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    return new Response(pdfBytes, { status: 200, headers: { "content-type": "application/pdf" } });
  }
  if (String(url) === "https://api-seller.ozon.ru/v2/posting/fbs/package-label") {
    return new Response(pdfBytes, { status: 200, headers: { "content-type": "application/pdf" } });
  }
  throw new Error(`unexpected fetch URL: ${url}`);
};
let uuidCounter = 0;
const provider = globalThis.OzonProviderFactory.createOzonProvider({
  fetchImpl,
  uuid: () => `11111111-1111-4111-8111-${String(++uuidCounter).padStart(12,"0")}`,
  now: () => 1_800_000_000_000 + uuidCounter
});
const creds = { clientId: "client", apiKey: "key" };

const labelStatus = await provider.executeCommandObject({ operation: "cargoes_label_get", params: { operation_id: "op-1" } }, creds, {});
assert.equal(labelStatus.ok, true);
assert.equal(labelStatus.result?.result?.file_url, "[REDACTED]");
assert.match(labelStatus.result?.generated_file_ref || "", /^rpf_[A-Za-z0-9_-]{12,120}$/);
assert.ok(!JSON.stringify(labelStatus.result).includes("SECRET"));
const urlRef = labelStatus.result.generated_file_ref;
const beforeUrlFetch = calls.length;
const fetchedPdf = await provider.executeCommandObject({ operation: "report_file_get", params: { file_ref: urlRef, offset: 0, limit: 200 } }, {}, {});
assert.equal(calls.length, beforeUrlFetch + 1, "URL-backed generated document must use exactly one explicit GET");
assert.equal(fetchedPdf.result?.format, "pdf");
assert.match(fetchedPdf.result?.text_extract || "", /LABEL 123/);
assert.ok(!JSON.stringify(fetchedPdf.result).includes("file_content_base64"));

const directPdf = await provider.executeCommandObject({ operation: "posting_fbs_package_label", params: { posting_number: ["POSTING"] } }, creds, {});
assert.equal(directPdf.ok, true);
assert.match(directPdf.result?.generated_file_ref || "", /^rpf_[A-Za-z0-9_-]{12,120}$/);
assert.equal(Object.prototype.hasOwnProperty.call(directPdf.result || {}, "file_content_base64"), false);
const inlineRef = directPdf.result.generated_file_ref;
const beforeInlineRead = calls.length;
const inlinePdf = await provider.executeCommandObject({ operation: "report_file_get", params: { file_ref: inlineRef, offset: 0, limit: 200 } }, {}, {});
assert.equal(calls.length, beforeInlineRead, "inline PDF ref read must not execute another provider request");
assert.equal(inlinePdf.result?.format, "pdf");
assert.match(inlinePdf.result?.text_extract || "", /LABEL 123/);
assert.ok(inlinePdf.report_text.includes('"external_request_executed": false'));

console.log("OZON_GENERATED_PDF_TEXT_EXTRACTION_PASS");
console.log("OZON_GENERATED_URL_REDACTED_PASS");
console.log("OZON_GENERATED_URL_OPAQUE_REF_PASS");
console.log("OZON_GENERATED_URL_ONE_EXPLICIT_GET_PASS");
console.log("OZON_DIRECT_PDF_NO_BASE64_AI_OUTPUT_PASS");
console.log("OZON_DIRECT_PDF_INLINE_REF_ZERO_EXTRA_REQUEST_PASS");
console.log("OZON_GENERATED_DOCUMENT_DELIVERY_GATE_PASS");
