import fs from 'node:fs';
import crypto from 'node:crypto';
import { URL } from 'node:url';

const SOURCE_URL = 'https://docs.ozon.ru/api/seller/swagger.json';
const TARGET_PATHS = [
  '/v3/product/list',
  '/v3/product/info/list',
  '/v4/product/info/attributes'
];
const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
const ALLOWED_BROWSER_ACQUISITIONS = new Set(['chrome_cdp_response_body', 'chrome_browser_download']);

const args = process.argv.slice(2);
const outputPath = args.shift() || '';
if (!outputPath) {
  throw new Error('usage: node extract_b1_assortment_swagger_evidence.mjs <output-md> [--input <swagger.json> --proof <browser-proof.json>]');
}

let inputPath = '';
let proofPath = '';
while (args.length) {
  const flag = args.shift();
  if (flag === '--input') {
    inputPath = args.shift() || '';
  } else if (flag === '--proof') {
    proofPath = args.shift() || '';
  } else {
    throw new Error(`unknown argument: ${flag}`);
  }
}
if (Boolean(inputPath) !== Boolean(proofPath)) {
  throw new Error('--input and --proof must be provided together');
}

const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const stableJson = value => JSON.stringify(value, null, 2);

function collectRefs(value, refs = new Set()) {
  if (!value || typeof value !== 'object') return refs;
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, refs);
    return refs;
  }
  if (typeof value.$ref === 'string') refs.add(value.$ref);
  for (const nested of Object.values(value)) collectRefs(nested, refs);
  return refs;
}

function resolveLocalRef(document, ref) {
  if (!ref.startsWith('#/')) return undefined;
  const parts = ref.slice(2).split('/').map(part => part.replace(/~1/g, '/').replace(/~0/g, '~'));
  let current = document;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

function referencedClosure(document, operation) {
  const pending = [...collectRefs(operation)];
  const seen = new Set();
  const schemas = {};
  const unresolved = [];
  while (pending.length) {
    const ref = pending.shift();
    if (seen.has(ref)) continue;
    seen.add(ref);
    const resolved = resolveLocalRef(document, ref);
    if (resolved === undefined) {
      unresolved.push(ref);
      continue;
    }
    schemas[ref] = resolved;
    for (const nested of collectRefs(resolved)) {
      if (!seen.has(nested)) pending.push(nested);
    }
  }
  return { schemas, unresolved };
}

function assertAllowedSourceUrl(value, label) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'docs.ozon.ru' || parsed.pathname !== '/api/seller/swagger.json') {
    throw new Error(`${label} is not the fixed Ozon Seller Swagger source: ${value}`);
  }
}

function assertSwagger(document, finalUrl) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) throw new Error('Seller Swagger root is not an object');
  if (!(typeof document.openapi === 'string' || typeof document.swagger === 'string')) throw new Error('Seller Swagger has no openapi/swagger marker');
  if (!document.paths || typeof document.paths !== 'object' || Array.isArray(document.paths)) throw new Error('Seller Swagger paths is missing/invalid');
  if (Object.keys(document.paths).length < 100) throw new Error(`Seller Swagger path inventory too small: ${Object.keys(document.paths).length}`);
  assertAllowedSourceUrl(finalUrl, 'Seller Swagger final URL');
}

function readBrowserProof(path) {
  let proof;
  try {
    proof = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Browser proof parse failed: ${error.message}`);
  }
  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) throw new Error('Browser proof root is not an object');
  if (proof.requested_url !== SOURCE_URL) throw new Error(`Browser proof requested_url mismatch: ${proof.requested_url}`);
  assertAllowedSourceUrl(proof.final_url, 'Browser proof final_url');
  if (Number(proof.status) !== 200) throw new Error(`Browser proof HTTP status is not 200: ${proof.status}`);
  if (!ALLOWED_BROWSER_ACQUISITIONS.has(proof.acquisition)) throw new Error(`Browser proof acquisition is not allowed: ${proof.acquisition}`);
  const timestamp = Date.parse(proof.retrieved_at_utc);
  if (!Number.isFinite(timestamp)) throw new Error(`Browser proof retrieved_at_utc is invalid: ${proof.retrieved_at_utc}`);
  return proof;
}

let bytes;
let finalUrl = SOURCE_URL;
let retrievedAtUtc = new Date().toISOString();
let acquisition = 'node_fetch';
let browserProof = null;

if (inputPath) {
  browserProof = readBrowserProof(proofPath);
  bytes = fs.readFileSync(inputPath);
  if (!bytes.length) throw new Error('Browser-acquired Seller Swagger file is empty');
  finalUrl = browserProof.final_url;
  retrievedAtUtc = browserProof.retrieved_at_utc;
  acquisition = browserProof.acquisition;
  console.log('B1_SWAGGER_BROWSER_ACQUISITION_PROOF_PASS');
} else {
  const response = await fetch(SOURCE_URL, {
    method: 'GET',
    redirect: 'follow',
    headers: { accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Seller Swagger HTTP ${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
  finalUrl = response.url || SOURCE_URL;
  retrievedAtUtc = new Date().toISOString();
}

let document;
try {
  document = JSON.parse(bytes.toString('utf8'));
} catch (error) {
  throw new Error(`Seller Swagger JSON parse failed: ${error.message}`);
}
assertSwagger(document, finalUrl);

const missing = TARGET_PATHS.filter(target => !(target in document.paths));
if (missing.length) throw new Error(`Seller Swagger missing target paths: ${missing.join(', ')}`);

const snapshot = {
  requested_url: SOURCE_URL,
  final_url: finalUrl,
  retrieved_at_utc: retrievedAtUtc,
  acquisition,
  byte_length: bytes.length,
  sha256: sha256(bytes),
  openapi: document.openapi || null,
  swagger: document.swagger || null,
  path_count: Object.keys(document.paths).length,
  servers: document.servers || null,
  host: document.host || null,
  basePath: document.basePath || null
};

const targetEvidence = {};
for (const target of TARGET_PATHS) {
  const pathItem = document.paths[target];
  const operations = {};
  for (const [method, operation] of Object.entries(pathItem)) {
    const lower = method.toLowerCase();
    if (!HTTP_METHODS.has(lower)) continue;
    const closure = referencedClosure(document, operation);
    operations[lower.toUpperCase()] = {
      operation,
      referenced_components: closure.schemas,
      unresolved_refs: closure.unresolved
    };
  }
  if (!Object.keys(operations).length) throw new Error(`Target path has no HTTP operations: ${target}`);
  targetEvidence[target] = {
    path_level_parameters: pathItem.parameters || null,
    operations
  };
}

const lines = [];
lines.push('# Patch B1 — Assortment Master Swagger evidence');
lines.push('');
lines.push('Generated deterministically from bytes acquired from the fixed Ozon-owned Seller API Swagger source.');
lines.push('');
lines.push('## Snapshot metadata');
lines.push('');
lines.push('```json');
lines.push(stableJson(snapshot));
lines.push('```');
lines.push('');
for (const target of TARGET_PATHS) {
  lines.push(`## ${target}`);
  lines.push('');
  lines.push('```json');
  lines.push(stableJson(targetEvidence[target]));
  lines.push('```');
  lines.push('');
}

fs.writeFileSync(outputPath, lines.join('\n'), { encoding: 'utf8' });
console.log('B1_SWAGGER_FETCH_PASS');
console.log('B1_SWAGGER_DOCUMENT_VALIDATION_PASS');
console.log('B1_ASSORTMENT_TARGET_PATHS_PRESENT_PASS');
console.log('B1_ASSORTMENT_REFERENCED_SCHEMA_CLOSURE_PASS');
console.log(snapshot.sha256);
console.log(outputPath);
