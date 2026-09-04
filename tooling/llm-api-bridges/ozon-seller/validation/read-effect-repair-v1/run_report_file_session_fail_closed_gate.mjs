#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true }); }
const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");

const sessionData = {};
const sessionGets = [];
const sessionSets = [];
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
globalThis.chrome = { storage: { session: {
  async get(key) { sessionGets.push(key); return { [key]: clone(sessionData[key]) }; },
  async set(values) { sessionSets.push(Object.keys(values)); Object.assign(sessionData, clone(values)); }
} } };

for (const file of ["runtime_names.js","ozon_operation_registry.js","ozon_contract.js","ozon_credentials.js","provider_transport_core.js","ozon_provider.js"]) loadClassic(path.join(shared, file));

const key = globalThis.OzonRuntime.STORAGE_KEYS.REPORT_FILE_SESSION_STATE;
assert.equal(key, "ozmb_report_file_session_state_v1");
const providerSource = fs.readFileSync(path.join(shared, "ozon_provider.js"), "utf8");
assert.match(providerSource, /OzonRuntime\?\.STORAGE_KEYS\?\.REPORT_FILE_SESSION_STATE/);
assert.match(providerSource, /typeof rawRecord\.personal_data_required !== "boolean"/);

const nowMs = 1_800_000_000_000;
const malformedRef = "rpf_s_malformed_record_0001";
sessionData[key] = {
  schema_version: 1,
  report_code_policies: {
    REPORT_MALFORMED_POLICY: { created_at_ms: nowMs }
  },
  report_file_refs: {
    [malformedRef]: { url: "https://cdn1.ozone.ru/malformed.csv?X-Signature=SECRET", created_at_ms: nowMs }
  }
};

const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url) === "https://api-seller.ozon.ru/v1/report/info") {
    return new Response(JSON.stringify({ result: {
      code: "REPORT_MALFORMED_POLICY",
      status: "success",
      error: "",
      file: "https://cdn1.ozone.ru/new-personal.csv?X-Signature=HIDDEN",
      report_type: "seller_products"
    } }), { status: 200, headers: { "content-type": "application/json" } });
  }
  throw new Error(`unexpected fetch: ${url}`);
};
const provider = globalThis.OzonProviderFactory.createOzonProvider({
  fetchImpl,
  uuid: () => "99999999-9999-4999-8999-999999999999",
  now: () => nowMs
});
const creds = { clientId: "client", apiKey: "key" };

// Missing boolean in code provenance must be discarded, so report_info falls back to personal-data-required.
const info = await provider.executeCommandObject({ operation: "report_info", params: { code: "REPORT_MALFORMED_POLICY" } }, creds, {});
assert.equal(info.ok, true);
assert.match(info.result?.report_file_ref || "", /^rpf_p_/);
assert.deepEqual(provider.reportFileRefPolicy(info.result.report_file_ref), { known: true, personal_data_required: true });
assert.equal(info.result?.result?.file, "[REDACTED]");

// Missing boolean in a stored safe-looking file record must be discarded and must execute zero report-file requests.
const before = calls.length;
await assert.rejects(
  provider.executeCommandObject({ operation: "report_file_get", params: { file_ref: malformedRef } }, {}, {}),
  (error) => error?.code === "REPORT_FILE_REF_NOT_FOUND" && error?.external_request_executed === false
);
assert.equal(calls.length, before);
assert.ok(sessionGets.every((seen) => seen === key));
assert.ok(sessionSets.length >= 1);
const normalized = sessionData[key];
assert.equal(Object.prototype.hasOwnProperty.call(normalized.report_code_policies || {}, "REPORT_MALFORMED_POLICY"), false);
assert.equal(Object.prototype.hasOwnProperty.call(normalized.report_file_refs || {}, malformedRef), false);
assert.ok(Object.keys(normalized.report_file_refs || {}).some((ref) => /^rpf_p_/.test(ref)));

console.log("OZON_REPORT_SESSION_RUNTIME_KEY_PASS");
console.log("OZON_REPORT_SESSION_MALFORMED_CODE_POLICY_FAIL_CLOSED_PASS");
console.log("OZON_REPORT_SESSION_MALFORMED_FILE_REF_ZERO_REQUEST_PASS");
console.log("OZON_REPORT_SESSION_FAIL_CLOSED_GATE_PASS");
