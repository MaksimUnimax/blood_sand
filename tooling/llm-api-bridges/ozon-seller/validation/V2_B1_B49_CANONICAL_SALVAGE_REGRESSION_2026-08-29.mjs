import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const canonicalRoot = path.resolve(process.argv[2]);
const historicalRoot = path.resolve(process.argv[3]);
const candidateRoot = path.resolve(process.argv[4]);
const manifestPath = path.resolve(process.argv[5]);

const CORE_MODULES = [
  'runtime_names.js',
  'ozon_operation_registry.js',
  'ozon_entitlements.js',
  'ozon_contract.js',
  'ozon_guidance.js',
];
const MERGED_FILES = new Set([
  'shared/ozon_operation_registry.js',
  'shared/ozon_contract.js',
  'shared/ozon_entitlements.js',
]);
const RATING_ALIASES = new Set([
  'seller_rating_summary',
  'seller_rating_history',
  'seller_fbs_error_index',
  'seller_fbs_error_postings',
]);
const SELLER_CLUSTERS = new Set([
  'account_access',
  'catalog_products',
  'stocks_inventory',
  'sales_analytics',
  'search_visibility',
  'prices_promotions',
  'orders_postings',
  'supplies_fbo',
  'warehouse_logistics',
  'returns_cancellations',
  'finance',
  'reviews_questions',
  '_workflow',
]);

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function listFiles(root) {
  const out = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.isFile()) out.push(path.relative(root, p).replaceAll('\\', '/'));
    }
  }
  walk(root);
  return out.sort();
}

async function loadRoot(root, tag) {
  for (const key of ['OzonRuntimeNames','OzonOperationRegistry','OzonEntitlements','OzonContract','OzonGuidance']) {
    try { delete globalThis[key]; } catch {}
  }
  for (const name of CORE_MODULES) {
    const url = pathToFileURL(path.join(root, 'shared', name)).href + `?salvage=${tag}-${Date.now()}-${name}`;
    await import(url);
  }
  const R = globalThis.OzonOperationRegistry;
  const E = globalThis.OzonEntitlements;
  const C = globalThis.OzonContract;
  const G = globalThis.OzonGuidance;
  assert(R && E && C && G, `failed to load bridge modules from ${root}`);
  return { R, E, C, G };
}

function stable(value) {
  if (value === undefined) return { __undefined: true };
  if (value instanceof URLSearchParams) return { __urlsearchparams: [...value.entries()] };
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = stable(value[k]);
    return out;
  }
  if (Array.isArray(value)) return value.map(stable);
  return value;
}

function captureRequest(env, meta) {
  try {
    const cmd = env.C.normalizeCommand(meta.template);
    const req = env.C.buildRequest(cmd, {});
    assert(!Array.isArray(req), `${meta.alias || meta.path}: buildRequest returned an array`);
    return { ok: true, command: stable(cmd), request: stable(req) };
  } catch (error) {
    return {
      ok: false,
      code: error?.code || null,
      name: error?.name || null,
      message: String(error?.message || error),
    };
  }
}

function captureEntitlement(env, meta) {
  try {
    const cmd = env.C.normalizeCommand(meta.template);
    return { ok: true, value: stable(env.E.requirementFor(cmd)) };
  } catch (error) {
    return { ok: false, code: error?.code || null, name: error?.name || null };
  }
}

const canonical = await loadRoot(canonicalRoot, 'canonical');
const historical = await loadRoot(historicalRoot, 'historical');
const candidate = await loadRoot(candidateRoot, 'candidate');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.counts.unique_historical_seller_operation_keys_touched, 182);
assert.equal(manifest.counts.unique_historical_performance_operation_keys_touched, 6);
assert.equal(manifest.counts.aliases_requiring_fixed_cluster_reclassification, 4);
assert.equal(manifest.counts.aliases_outside_current_463_requiring_currentness_reconciliation, 0);
console.log('V2_B1_B49_SALVAGE_MANIFEST_AUTHORITY_PASS');

const canonicalFiles = listFiles(canonicalRoot);
const candidateFiles = listFiles(candidateRoot);
assert.deepEqual(candidateFiles, canonicalFiles, 'candidate file set differs from canonical B1');
for (const rel of canonicalFiles) {
  if (MERGED_FILES.has(rel)) continue;
  assert.equal(
    sha256(fs.readFileSync(path.join(candidateRoot, rel))),
    sha256(fs.readFileSync(path.join(canonicalRoot, rel))),
    `protected runtime changed: ${rel}`,
  );
}
console.log('V2_B1_B49_PROTECTED_RUNTIME_BYTE_IDENTITY_PASS');

const canonicalOps = canonical.R.OPERATIONS;
const historicalOps = historical.R.OPERATIONS;
const candidateOps = candidate.R.OPERATIONS;

for (const [alias, meta] of Object.entries(canonicalOps)) {
  assert(candidateOps[alias], `canonical alias missing from candidate: ${alias}`);
  assert.deepEqual(candidateOps[alias], meta, `canonical B1 registry semantics changed: ${alias}`);
  assert.deepEqual(captureRequest(candidate, candidateOps[alias]), captureRequest(canonical, meta), `canonical B1 request semantics changed: ${alias}`);
  assert.deepEqual(captureEntitlement(candidate, candidateOps[alias]), captureEntitlement(canonical, meta), `canonical B1 entitlement semantics changed: ${alias}`);
}
console.log('V2_B1_B49_CANONICAL_B1_ALIAS_REQUEST_ENTITLEMENT_PRESERVATION_PASS');

const historicalSellerAliases = Object.entries(historicalOps).filter(([, meta]) => meta?.provider === 'seller_api');
assert.equal(historicalSellerAliases.length, 191, 'historical B49 Seller alias count changed');
let historicalSellerSalvaged = 0;
for (const [alias, historicalMeta] of historicalSellerAliases) {
  const candMeta = candidateOps[alias];
  assert(candMeta, `historical Seller alias missing from candidate: ${alias}`);
  if (canonicalOps[alias]) continue;

  const expectedMeta = structuredClone(historicalMeta);
  if (RATING_ALIASES.has(alias)) {
    expectedMeta.cluster = 'sales_analytics';
    expectedMeta.section = 'delivery_returns_cancellations_metrics';
  }
  assert.deepEqual(candMeta, expectedMeta, `historical Seller registry semantics changed unexpectedly: ${alias}`);
  assert.deepEqual(captureRequest(candidate, candMeta), captureRequest(historical, historicalMeta), `historical Seller request semantics changed: ${alias}`);
  assert.deepEqual(captureEntitlement(candidate, candMeta), captureEntitlement(historical, historicalMeta), `historical Seller entitlement semantics changed: ${alias}`);
  historicalSellerSalvaged += 1;
}
assert(historicalSellerSalvaged > 0);
console.log('V2_B1_B49_HISTORICAL_SELLER_READ_CONTRACT_SALVAGE_PASS');

for (const alias of RATING_ALIASES) {
  const meta = candidateOps[alias];
  assert(meta, alias);
  assert.equal(meta.provider, 'seller_api', alias);
  assert.equal(meta.effect, 'READ', alias);
  assert.equal(meta.execution_enabled, true, alias);
  assert.equal(meta.currentness, 'current', alias);
  assert.equal(meta.safety_class, 'READ_SAFE', alias);
  assert.equal(meta.cluster, 'sales_analytics', alias);
  assert.equal(meta.section, 'delivery_returns_cancellations_metrics', alias);
}
for (const [alias, meta] of Object.entries(candidateOps)) {
  if (meta?.provider !== 'seller_api') continue;
  if (meta.execution_enabled && meta.effect === 'READ') {
    assert(SELLER_CLUSTERS.has(meta.cluster), `${alias}: unauthorized Seller cluster ${meta.cluster}`);
  }
  assert.notEqual(meta.cluster, 'seller_health', `${alias}: seller_health must not remain`);
}
console.log('V2_B1_B49_FIXED_SELLER_RATING_TAXONOMY_PASS');

const historicalPerformance = Object.entries(historicalOps).filter(([, meta]) => meta?.provider === 'performance_api');
assert.equal(historicalPerformance.length, 10, 'historical B49 Performance alias count changed');
for (const [alias, meta] of historicalPerformance) {
  const candMeta = candidateOps[alias];
  assert(candMeta, `accepted historical Performance alias missing: ${alias}`);
  if (!canonicalOps[alias]) {
    assert.deepEqual(candMeta, meta, `accepted B6 Performance carry-forward changed: ${alias}`);
  }
}
console.log('V2_B1_B49_ACCEPTED_PERFORMANCE_CARRY_FORWARD_PASS');

const candidateSellerOps = Object.entries(candidateOps).filter(([, meta]) => meta?.provider === 'seller_api');
for (const [alias, meta] of candidateSellerOps) {
  if (!meta.execution_enabled || meta.effect !== 'READ') continue;
  const result = captureRequest(candidate, meta);
  if (result.ok) {
    assert(!Array.isArray(result.request), `${alias}: hidden multi-request result`);
  }
}
assert.equal(candidate.R.catalogValidation(candidate.C.OPERATIONS).ok, true);
console.log('V2_B1_B49_SINGLE_COMMAND_SINGLE_REQUEST_AND_CATALOG_PASS');

console.log(JSON.stringify({
  canonical_aliases_preserved: Object.keys(canonicalOps).length,
  historical_seller_aliases: historicalSellerAliases.length,
  historical_seller_aliases_salvaged_beyond_canonical: historicalSellerSalvaged,
  historical_performance_aliases_preserved: historicalPerformance.length,
  candidate_registry_aliases: Object.keys(candidateOps).length,
}, null, 2));
console.log('V2_B1_B49_CANONICAL_SALVAGE_AUTHOR_GATE_PASS');
