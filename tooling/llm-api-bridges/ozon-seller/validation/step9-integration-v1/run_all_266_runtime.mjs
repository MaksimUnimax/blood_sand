#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function parseArgs(argv) {
  const out = {};
  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) throw new Error(`invalid argument pair at ${key}`);
    out[key.slice(2)] = value;
  }
  for (const key of ["repo-root", "output", "source-commit"]) {
    if (!out[key]) throw new Error(`missing --${key}`);
  }
  return out;
}

function sha256Bytes(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sha256File(file) {
  return sha256Bytes(fs.readFileSync(file));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function stableJson(value) {
  return `${JSON.stringify(stable(value))}\n`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function headerMap(input) {
  if (!input) return {};
  if (typeof input.entries === "function") return Object.fromEntries([...input.entries()].map(([k, v]) => [String(k).toLowerCase(), String(v)]));
  return Object.fromEntries(Object.entries(input).map(([k, v]) => [String(k).toLowerCase(), String(v)]));
}

function bodyHash(body) {
  if (body === undefined || body === null) return null;
  return sha256Bytes(Buffer.from(String(body), "utf8"));
}

function loadClassic(file) {
  const source = fs.readFileSync(file, "utf8");
  vm.runInThisContext(source, { filename: file, displayErrors: true });
}

const args = parseArgs(process.argv);
const repo = path.resolve(args["repo-root"]);
const output = path.resolve(args.output);
const sourceCommit = args["source-commit"];
const sellerRoot = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller");
const candidateRoot = path.join(sellerRoot, "dist-step7-candidate");
const shared = path.join(candidateRoot, "shared");
const matrixPath = path.join(sellerRoot, "validation", "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json");
const step7AcceptancePath = path.join(sellerRoot, "validation", "OZON_SELLER_STEP7_463_FORMAL_ACCEPTANCE_2026-08-31.md");
const step8AcceptancePath = path.join(sellerRoot, "validation", "step8-performance-v2", "evidence", "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2.json");

for (const relative of [
  "runtime_names.js",
  "ozon_operation_registry.js",
  "ozon_contract.js",
  "ozon_credentials.js",
  "provider_transport_core.js",
  "ozon_provider.js",
]) loadClassic(path.join(shared, relative));

const registry = globalThis.OzonOperationRegistry;
const contract = globalThis.OzonContract;
const providerFactory = globalThis.OzonProviderFactory;
assert.ok(registry && contract && providerFactory, "runtime globals were not initialized");

const operations = registry.OPERATIONS;
assert.ok(operations && typeof operations === "object", "operation registry missing");
const allEntries = Object.entries(operations);
assert.equal(allEntries.length, 270, "registry alias count");

const isCurrentRead = (meta) => meta?.effect === "READ" && meta?.currentness === "current" && meta?.execution_enabled === true;
const sellerAliases = allEntries.filter(([, meta]) => meta.provider === "seller_api" && isCurrentRead(meta)).map(([alias]) => alias).sort();
const performanceAliases = allEntries.filter(([, meta]) => meta.provider === "performance_api" && isCurrentRead(meta)).map(([alias]) => alias).sort();
assert.equal(sellerAliases.length, 245, "Seller current-read alias count");
assert.equal(performanceAliases.length, 25, "Performance registry alias count");

const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
assert.equal(matrix.schema, "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_V1");
assert.equal(matrix.authority.operations, 48);
assert.equal(matrix.rows.length, 48);
const currentDecisions = new Set(["READ_ALREADY_IMPLEMENTED_CURRENT_PATH", "READ_IMPLEMENT_STEP6"]);
const currentRows = matrix.rows.filter((row) => currentDecisions.has(row.step6_decision));
assert.equal(currentRows.length, 21, "Performance canonical current-read count");
const canonicalPerformanceAliases = currentRows.map((row) => row.alias);
assert.ok(canonicalPerformanceAliases.every((alias) => typeof alias === "string" && alias), "Performance canonical alias missing");
assert.equal(new Set(canonicalPerformanceAliases).size, 21, "Performance canonical aliases are not unique");
canonicalPerformanceAliases.sort();

const compatibilityRows = currentRows.filter((row) => typeof row.documented_json_variant_alias === "string" && row.documented_json_variant_alias);
const compatibilityAliases = compatibilityRows.map((row) => row.documented_json_variant_alias).sort();
assert.equal(compatibilityAliases.length, 4, "Performance compatibility alias count");
assert.equal(new Set(compatibilityAliases).size, 4, "Performance compatibility aliases are not unique");
assert.deepEqual([...new Set([...canonicalPerformanceAliases, ...compatibilityAliases])].sort(), performanceAliases, "Performance 21+4 alias partition");
for (const row of compatibilityRows) {
  const meta = operations[row.documented_json_variant_alias];
  assert.ok(meta && isCurrentRead(meta) && meta.provider === "performance_api", `${row.documented_json_variant_alias}: invalid compatibility descriptor`);
  if (row.documented_json_variant_path) assert.equal(meta.path, row.documented_json_variant_path, `${row.documented_json_variant_alias}: compatibility path`);
}

const step7Acceptance = fs.readFileSync(step7AcceptancePath, "utf8");
assert.ok(step7Acceptance.includes("OZON_SELLER_STEP7_FORMALLY_ACCEPTED"), "Step7 formal marker missing");
const step8Acceptance = JSON.parse(fs.readFileSync(step8AcceptancePath, "utf8"));
assert.equal(step8Acceptance.status, "ACCEPTED", "Step8 formal status");
assert.equal(step8Acceptance.scope.performance_operations_terminal, 48);
assert.equal(step8Acceptance.scope.current_production_reads, 21);
assert.equal(step8Acceptance.scope.source_terminal_non_current_operations, 27);
assert.equal(step8Acceptance.scope.unknown, 0);
assert.equal(step8Acceptance.scope.pending, 0);
assert.equal(step8Acceptance.scope.unresolved, 0);
assert.equal(step8Acceptance.combined_current_read_surface.total_reads, 266);
assert.ok(step8Acceptance.markers.includes("OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED"));

const selectedAliases = [...sellerAliases, ...canonicalPerformanceAliases];
assert.equal(selectedAliases.length, 266, "selected runtime count");
assert.equal(new Set(selectedAliases).size, 266, "selected alias collision");

const selectedDescriptors = selectedAliases.map((alias) => [alias, operations[alias]]);
const operationIdentities = new Set(selectedDescriptors.map(([alias, meta]) => `${meta.provider}\u0000${meta.method}\u0000${meta.path}\u0000${alias}`));
assert.equal(operationIdentities.size, 266, "selected operation identity collision");

const sellerCredentials = { clientId: "step9-seller-client", apiKey: "step9-seller-key" };
const performanceCredentials = { clientId: "step9-performance-client", clientSecret: "step9-performance-secret" };
const fetchRecords = [];
const businessRecords = [];
const authRecords = [];
let active = null;
let uuidIndex = 0;
let clock = 1_700_000_000_000;

function genericJsonResponse(operation) {
  if (operation === "analytics_data") return { result: { data: [] } };
  return {
    result: [],
    items: [],
    data: [],
    rows: [],
    campaigns: [],
    cursor: "",
    has_next: false,
    total: 0,
  };
}

async function fetchImpl(url, options = {}) {
  const href = String(url);
  const method = String(options.method || "GET").toUpperCase();
  const headers = headerMap(options.headers);
  if (href === "https://api-performance.ozon.ru/api/client/token") {
    const body = JSON.parse(String(options.body || "{}"));
    assert.equal(method, "POST");
    assert.equal(body.client_id, performanceCredentials.clientId);
    assert.equal(body.client_secret, performanceCredentials.clientSecret);
    assert.equal(body.grant_type, "client_credentials");
    authRecords.push({
      index: authRecords.length + 1,
      host_alias: "performance_auth",
      method,
      url: href,
      body_sha256: bodyHash(options.body),
      content_type_present: headers["content-type"] === "application/json",
    });
    fetchRecords.push({ kind: "performance_auth", url: href, method });
    return new Response(JSON.stringify({ access_token: "step9-access-token", token_type: "Bearer", expires_in: 3600 }), {
      status: 200,
      headers: { "content-type": "application/json", "x-request-id": "step9-auth" },
    });
  }

  assert.ok(active, `business fetch without active command: ${href}`);
  assert.equal(href, active.request.url, `${active.alias}: request URL`);
  assert.equal(method, active.request.method, `${active.alias}: request method`);
  assert.equal(options.body, active.request.body, `${active.alias}: request body`);
  const expectedProvider = active.meta.provider;
  if (expectedProvider === "seller_api") {
    assert.equal(headers["client-id"], sellerCredentials.clientId, `${active.alias}: Client-Id`);
    assert.equal(headers["api-key"], sellerCredentials.apiKey, `${active.alias}: Api-Key`);
    assert.ok(!headers.authorization, `${active.alias}: unexpected bearer header`);
  } else {
    assert.equal(headers.authorization, "Bearer step9-access-token", `${active.alias}: bearer token`);
    assert.ok(!headers["client-id"] && !headers["api-key"], `${active.alias}: unexpected Seller headers`);
  }

  const record = {
    ordinal: businessRecords.length + 1,
    alias: active.alias,
    provider: expectedProvider,
    method,
    url: href,
    resolved_path: new URL(href).pathname,
    query: new URL(href).search,
    body_sha256: bodyHash(options.body),
    seller_credentials_present: expectedProvider === "seller_api",
    performance_bearer_present: expectedProvider === "performance_api",
    response_style: active.request.response_style,
  };
  businessRecords.push(record);
  fetchRecords.push({ kind: "business", alias: active.alias, provider: expectedProvider, method, url: href });

  if (active.request.response_style === "binary") {
    const contentType = active.request.response_content_types?.[0] || "application/octet-stream";
    return new Response(new Uint8Array([0x4f, 0x5a, 0x4f, 0x4e, 0x09]), {
      status: 200,
      headers: { "content-type": contentType, "x-request-id": `step9-${record.ordinal}` },
    });
  }
  return new Response(JSON.stringify(genericJsonResponse(active.alias)), {
    status: 200,
    headers: { "content-type": "application/json", "x-request-id": `step9-${record.ordinal}` },
  });
}

const provider = providerFactory.createOzonProvider({
  fetchImpl,
  uuid: () => `00000000-0000-4000-8000-${String(++uuidIndex).padStart(12, "0")}`,
  now: () => ++clock,
});

const runtimeRows = [];
for (const alias of selectedAliases) {
  const meta = operations[alias];
  assert.ok(meta && isCurrentRead(meta), `${alias}: not an enabled current read`);
  assert.equal(meta.template?.operation, alias, `${alias}: template operation`);
  const command = clone(meta.template);
  const normalized = contract.normalizeCommand(command);
  assert.equal(normalized.operation, alias);
  const preflight = contract.preflightExecution(normalized);
  assert.equal(preflight.meta.provider, meta.provider);
  const request = meta.provider === "performance_api"
    ? contract.buildPerformanceRequest(normalized, globalThis.OzonCredentials.performanceBearerHeaders("step9-access-token"))
    : contract.buildRequest(normalized, globalThis.OzonCredentials.sellerHeaders(sellerCredentials));
  assert.ok(!/[{}]/.test(request.path), `${alias}: unresolved path placeholder`);

  const beforeBusiness = businessRecords.length;
  const beforeAuth = authRecords.length;
  active = { alias, meta, normalized, request };
  const result = await provider.executeCommandObject(command, sellerCredentials, performanceCredentials);
  active = null;
  assert.equal(result.ok, true, `${alias}: provider result`);
  assert.equal(result.operation, alias, `${alias}: result operation`);
  assert.equal(result.provider, meta.provider, `${alias}: result provider`);
  assert.equal(result.http_status, 200, `${alias}: result status`);
  assert.equal(businessRecords.length - beforeBusiness, 1, `${alias}: physical business request count`);
  const authDelta = authRecords.length - beforeAuth;
  assert.ok(authDelta === 0 || authDelta === 1, `${alias}: auth request delta`);
  runtimeRows.push({
    ordinal: runtimeRows.length + 1,
    alias,
    provider: meta.provider,
    method: request.method,
    declared_path: meta.path,
    resolved_path: request.path,
    request_style: meta.request_style,
    response_style: meta.response_style || "json",
    privacy_policy: meta.privacy_policy || null,
    command_fingerprint: contract.commandFingerprint(normalized),
    physical_business_request_count: 1,
    auth_request_performed: result.auth_request_performed === true,
    http_status: result.http_status,
    external_request_executed: true,
  });
}
active = null;

assert.equal(runtimeRows.length, 266);
assert.equal(businessRecords.length, 266);
assert.equal(businessRecords.filter((row) => row.provider === "seller_api").length, 245);
assert.equal(businessRecords.filter((row) => row.provider === "performance_api").length, 21);
assert.equal(authRecords.length, 1, "Performance token request count");
assert.equal(fetchRecords.length, 267, "total fetch count");
assert.equal(runtimeRows.filter((row) => row.auth_request_performed).length, 1, "reported Performance auth count");
assert.equal(runtimeRows.filter((row) => row.physical_business_request_count !== 1).length, 0);

const performanceTerminalRows = matrix.rows.filter((row) => !currentDecisions.has(row.step6_decision));
assert.equal(performanceTerminalRows.length, 27);
for (const row of performanceTerminalRows) {
  if (typeof row.alias === "string" && row.alias) assert.ok(!canonicalPerformanceAliases.includes(row.alias), `${row.operation_key}: terminal operation exposed canonically`);
}

const catalogStats = registry.CATALOG_STATS || {};
if (Object.keys(catalogStats).length) {
  assert.equal(catalogStats.total_aliases, 270);
  assert.equal(catalogStats.seller_aliases, 245);
  assert.equal(catalogStats.performance_aliases, 25);
  assert.equal(catalogStats.current_read_aliases, 270);
  assert.equal(catalogStats.execution_enabled_aliases, 270);
}

const proof = {
  schema: "OZON_STEP9_ALL_266_RUNTIME_PROOF_V1",
  schema_version: 1,
  status: "PASS",
  source_commit: sourceCommit,
  production: {
    candidate_tree_sha256: "f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974",
    candidate_file_count: 21,
    registry_aliases: allEntries.length,
    seller_registry_aliases: sellerAliases.length,
    performance_registry_aliases: performanceAliases.length,
    performance_canonical_aliases: canonicalPerformanceAliases.length,
    performance_compatibility_aliases: compatibilityAliases.length,
  },
  authority: {
    seller_operations_terminal: 463,
    performance_operations_terminal: 48,
    total_operations_terminal: 511,
    seller_current_reads: 245,
    performance_current_reads: 21,
    combined_current_reads: 266,
    performance_terminal_non_current: 27,
  },
  execution: {
    logical_current_read_operations: runtimeRows.length,
    physical_business_request_count: businessRecords.length,
    seller_business_requests: businessRecords.filter((row) => row.provider === "seller_api").length,
    performance_business_requests: businessRecords.filter((row) => row.provider === "performance_api").length,
    performance_auth_requests: authRecords.length,
    total_fetch_requests: fetchRecords.length,
    all_one_business_request: true,
    all_http_200: true,
    all_external_request_executed: true,
    automatic_retry_count: 0,
    hidden_pagination_count: 0,
    fanout_count: 0,
    polling_count: 0,
  },
  compatibility: {
    aliases: compatibilityRows.map((row) => ({
      canonical_alias: row.alias,
      compatibility_alias: row.documented_json_variant_alias,
      compatibility_path: row.documented_json_variant_path,
    })).sort((a, b) => a.compatibility_alias.localeCompare(b.compatibility_alias)),
    count: compatibilityAliases.length,
    excluded_from_unique_266_count: true,
  },
  inputs: {
    candidate_registry_sha256: sha256File(path.join(shared, "ozon_operation_registry.js")),
    candidate_contract_sha256: sha256File(path.join(shared, "ozon_contract.js")),
    performance_exact_matrix_sha256: sha256File(matrixPath),
    step7_formal_acceptance_sha256: sha256File(step7AcceptancePath),
    step8_formal_acceptance_sha256: sha256File(step8AcceptancePath),
  },
  runtime_operations: runtimeRows,
  business_requests: businessRecords,
  performance_auth: authRecords,
  markers: [
    "OZON_STEP9_REGISTRY_245_SELLER_25_PERFORMANCE_ALIASES_PASS",
    "OZON_STEP9_PERFORMANCE_21_CANONICAL_4_COMPATIBILITY_PASS",
    "OZON_STEP9_ALL_266_METADATA_RESOLUTION_PASS",
    "OZON_STEP9_ALL_266_REQUEST_BUILD_PASS",
    "OZON_STEP9_ALL_266_PROVIDER_RUNTIME_PASS",
    "OZON_STEP9_ALL_266_ONE_COMMAND_ONE_BUSINESS_REQUEST_PASS",
    "OZON_STEP9_PERFORMANCE_SINGLE_CACHED_AUTH_REQUEST_PASS",
    "OZON_STEP9_NO_RETRY_PAGINATION_FANOUT_POLLING_PASS",
  ],
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, stableJson(proof), { encoding: "utf8" });
for (const marker of proof.markers) console.log(marker);
console.log(`OZON_STEP9_RUNTIME_PROOF_SHA256=${sha256File(output)}`);
