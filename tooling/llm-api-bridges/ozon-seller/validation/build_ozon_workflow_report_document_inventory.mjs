import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidateRoot = path.resolve(process.argv[2]);
const masterPath = path.resolve(process.argv[3]);
const outDir = path.resolve(process.argv[4]);

const EXPECTED_SELLER_SWAGGER_SHA256 = '39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40';
const HISTORICAL = {
  B5: {
    commit: 'e296ff76b975470e8e12e566e2c4aff29adea00c',
    accepted_single_reads: {
      report_list: 'POST /v1/report/list',
      report_info: 'POST /v1/report/info',
    },
    boundary: 'report create/retrieval/download workflow not authorized automatically; file URLs redacted and never auto-fetched',
  },
  B24: {
    commit: '972e0aeb039ae29660985296f410045dade5231c',
    accepted_single_reads: {
      supply_order_act_accept_status: 'POST /v1/supply-order/act/accept/status',
      supply_order_act_product_get: 'POST /v1/supply-order/act/product/get',
      supply_order_act_summary_get: 'POST /v1/supply-order/act/summary/get',
      supply_order_cancel_status: 'POST /v1/supply-order/cancel/status',
      supply_order_content_update_status: 'POST /v1/supply-order/content/update/status',
      supply_order_content_update_validation: 'POST /v1/supply-order/content/update/validation',
      supply_order_pass_status: 'POST /v1/supply-order/pass/status',
      supply_order_timeslot_status: 'POST /v1/supply-order/timeslot/status',
    },
    boundary: 'status/get/validation reads are explicit single reads; mutation endpoints remain separate and disabled',
  },
  B37: {
    commit: 'cfd9a4b695fafa56f91af59a3723eb56171a1794',
    accepted_single_reads: {
      removal_from_stock_list: 'POST /v1/removal/from-stock/list',
      removal_from_supply_list: 'POST /v1/removal/from-supply/list',
    },
    boundary: 'report-named removal data is a direct read; no automatic last_id pagination, retry, polling, fanout, chaining, or secondary request',
  },
  B40: {
    commit: '2c3cae10d6c204628403e82c8c763b402970303a',
    accepted_single_reads: {
      finance_balance: 'POST /v1/finance/balance',
      finance_realization_by_day: 'POST /v1/finance/realization/by-day',
      finance_realization_posting: 'POST /v1/finance/realization/posting',
      finance_realization_v2: 'POST /v2/finance/realization',
    },
    boundary: 'direct finance reads only; async report creators and PDF/CSV/barcode/document endpoints were excluded',
  },
};

function csvEscape(v) {
  const s = Array.isArray(v) ? v.join('|') : String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}

function candidateReasons(row) {
  const p = row.fixed_path.toLowerCase();
  const purpose = row.purpose.toLowerCase();
  const tag = row.source_category_tag.toLowerCase();
  const reasons = [];
  if (tag === 'reportapi') reasons.push('REPORT_API_CATEGORY');
  if (/report|отч[её]т/.test(`${p} ${purpose}`)) reasons.push('REPORT_SIGNAL');
  if (/\/pdf(?:\/|$)|pdf|document|документ|акт(?:\s|$)|\/act(?:\/|$)|barcode|штрихкод|label|этикет|certificate|сертификат|invoice|накладн/.test(`${p} ${purpose}`)) reasons.push('DOCUMENT_SIGNAL');
  if (/\/status(?:\/|$)|\/result(?:\/|$)|\/validation(?:\/|$)|\/info(?:\/|$)|\/download(?:\/|$)|\/file(?:\/|$)|\/task(?:\/|$)|статус|результат|скач|файл/.test(`${p} ${purpose}`)) reasons.push('WORKFLOW_RESULT_SIGNAL');
  if (/\/create(?:\/|$)|создан|создать|сгенер|генерац|запуск/.test(`${p} ${purpose}`)) reasons.push('GENERATION_OR_START_SIGNAL');
  return [...new Set(reasons)];
}

function pendingClass(row, reasons) {
  const p = row.fixed_path.toLowerCase();
  const purpose = row.purpose.toLowerCase();
  if (reasons.includes('GENERATION_OR_START_SIGNAL')) return 'SERVER_SIDE_GENERATION_OR_WORKFLOW_START_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED';
  if (reasons.includes('DOCUMENT_SIGNAL')) return 'DOCUMENT_READ_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED';
  if (reasons.includes('WORKFLOW_RESULT_SIGNAL')) return 'DIRECT_OR_WORKFLOW_RESULT_READ_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED';
  if (/list|список|информац|получить|данн/.test(`${p} ${purpose}`)) return 'DIRECT_READ_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED';
  return 'WORKFLOW_REPORT_DOCUMENT_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED';
}

for (const key of ['OzonRuntimeNames','OzonOperationRegistry']) { try { delete globalThis[key]; } catch {} }
await import(pathToFileURL(path.join(candidateRoot,'shared/runtime_names.js')).href + `?wrd=${Date.now()}`);
await import(pathToFileURL(path.join(candidateRoot,'shared/ozon_operation_registry.js')).href + `?wrd=${Date.now()}`);
const R = globalThis.OzonOperationRegistry;
assert(R, 'operation registry unavailable');
const acceptedSeller = Object.entries(R.OPERATIONS).filter(([,m]) => m?.provider === 'seller_api');
assert.equal(acceptedSeller.length, 191, 'accepted Step3 Seller alias count changed');
const acceptedByKey = new Map();
for (const [alias, meta] of acceptedSeller) {
  const key = `${meta.method} ${meta.path}`;
  assert(!acceptedByKey.has(key), `accepted duplicate method+path ${key}`);
  acceptedByKey.set(key, {alias, meta});
}
assert.equal(acceptedByKey.size, 191);

const master = JSON.parse(fs.readFileSync(masterPath,'utf8'));
assert.equal(master.schema, 'OZON_FULL_API_MASTER_CHECKLIST_V2');
assert.equal(master.sources.seller_exact_contract_authority.operations, 463);
assert.equal(master.sources.seller_exact_contract_authority.sha256, EXPECTED_SELLER_SWAGGER_SHA256);
const sellerRows = master.rows.filter(r => r.provider === 'seller_api');
assert.equal(sellerRows.length, 463);
const masterKeys = new Set(sellerRows.map(r => r.operation_key));
assert.equal(masterKeys.size, 463);
for (const key of acceptedByKey.keys()) assert(masterKeys.has(key), `accepted Seller alias outside current 463: ${key}`);
console.log('WORKFLOW_DOCUMENT_INVENTORY_191_ACCEPTED_MAP_TO_463_PASS');

const historicalRows = [];
for (const [stage, evidence] of Object.entries(HISTORICAL)) {
  for (const [alias, operationKey] of Object.entries(evidence.accepted_single_reads)) {
    const accepted = acceptedByKey.get(operationKey);
    assert(accepted, `${stage} accepted operation missing from Step3: ${operationKey}`);
    assert.equal(accepted.alias, alias, `${stage} alias drift for ${operationKey}`);
    assert.equal(accepted.meta.effect, 'READ', `${stage}/${alias} effect drift`);
    assert(['single_read','single_request'].includes(accepted.meta.workflow_role), `${stage}/${alias} workflow role drift: ${accepted.meta.workflow_role}`);
    historicalRows.push({stage, commit:evidence.commit, alias, operation_key:operationKey, boundary:evidence.boundary});
  }
}
assert.equal(historicalRows.length, 16);
console.log('WORKFLOW_DOCUMENT_INVENTORY_B5_B24_B37_B40_CARRY_FORWARD_PASS');

const rows = [];
for (const row of sellerRows) {
  const reasons = candidateReasons(row);
  if (!reasons.length) continue;
  const accepted = acceptedByKey.get(row.operation_key) ?? null;
  let step5Classification;
  let exactSchemaDecision;
  if (accepted) {
    const meta = accepted.meta;
    if (meta.effect === 'READ' && ['single_read','single_request'].includes(meta.workflow_role)) {
      step5Classification = 'ACCEPTED_DIRECT_SINGLE_READ';
      exactSchemaDecision = 'CARRY_FORWARD_ACCEPTED_STEP3_METADATA';
    } else if (meta.effect === 'READ') {
      step5Classification = 'ACCEPTED_EXPLICIT_WORKFLOW_READ_STEP';
      exactSchemaDecision = 'CARRY_FORWARD_ACCEPTED_STEP3_METADATA_REVIEW_WORKFLOW_ROLE';
    } else {
      step5Classification = 'ACCEPTED_NON_READ_REQUIRES_STEP5_REVIEW';
      exactSchemaDecision = 'REVIEW_ACCEPTED_METADATA_BEFORE_ANY_WORKFLOW_USE';
    }
  } else {
    step5Classification = pendingClass(row, reasons);
    exactSchemaDecision = 'REQUIRES_EXACT_ACCEPTED_SWAGGER_SNAPSHOT';
  }
  rows.push({
    operation_key: row.operation_key,
    http_method: row.http_method,
    fixed_path: row.fixed_path,
    source_category_tag: row.source_category_tag,
    source_category_title: row.source_category_title,
    purpose: row.purpose,
    detection_reasons: reasons,
    accepted_step3_alias: accepted?.alias ?? null,
    accepted_step3_effect: accepted?.meta?.effect ?? null,
    accepted_step3_workflow_role: accepted?.meta?.workflow_role ?? null,
    accepted_step3_privacy_policy: accepted?.meta?.privacy_policy ?? null,
    step5_classification: step5Classification,
    exact_schema_decision: exactSchemaDecision,
  });
}
assert(rows.length > 0 && rows.length < 463, 'candidate scan bounds invalid');
const acceptedCandidateRows = rows.filter(r => r.accepted_step3_alias);
const pendingRows = rows.filter(r => !r.accepted_step3_alias);
assert(acceptedCandidateRows.length > 0, 'expected accepted workflow/report/document candidates');
assert(pendingRows.length > 0, 'expected unimplemented candidates requiring exact schema review');
for (const row of pendingRows) assert.equal(row.exact_schema_decision, 'REQUIRES_EXACT_ACCEPTED_SWAGGER_SNAPSHOT');
console.log('WORKFLOW_DOCUMENT_INVENTORY_PENDING_ROWS_FAIL_CLOSED_PASS');

const reportCreates = rows.filter(r => /\/report\/.*\/create$|\/report\/[^/]+\/create$/.test(r.fixed_path));
for (const row of reportCreates) {
  if (!row.accepted_step3_alias) assert.equal(row.step5_classification, 'SERVER_SIDE_GENERATION_OR_WORKFLOW_START_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED');
}
console.log('WORKFLOW_DOCUMENT_INVENTORY_REPORT_CREATE_NOT_AUTO_READ_PASS');

const counts = {
  seller_master_rows: 463,
  accepted_step3_seller_aliases: 191,
  step5_candidate_rows: rows.length,
  accepted_step3_candidate_rows: acceptedCandidateRows.length,
  pending_exact_schema_candidate_rows: pendingRows.length,
  accepted_direct_single_reads: rows.filter(r => r.step5_classification === 'ACCEPTED_DIRECT_SINGLE_READ').length,
  accepted_explicit_workflow_read_steps: rows.filter(r => r.step5_classification === 'ACCEPTED_EXPLICIT_WORKFLOW_READ_STEP').length,
  generation_or_workflow_start_candidates_pending: rows.filter(r => r.step5_classification === 'SERVER_SIDE_GENERATION_OR_WORKFLOW_START_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED').length,
  document_read_candidates_pending: rows.filter(r => r.step5_classification === 'DOCUMENT_READ_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED').length,
  workflow_result_read_candidates_pending: rows.filter(r => r.step5_classification === 'DIRECT_OR_WORKFLOW_RESULT_READ_CANDIDATE_EXACT_SCHEMA_REVIEW_REQUIRED').length,
};

fs.mkdirSync(outDir,{recursive:true});
const payload = {
  schema: 'OZON_WORKFLOW_REPORT_DOCUMENT_INVENTORY_V1',
  as_of: '2026-08-29',
  roadmap_step: 5,
  status: 'WORKFLOW_REPORT_DOCUMENT_CANDIDATE_UNIVERSE_BUILT_EXACT_SCHEMA_DECISIONS_PENDING',
  authorities: {
    seller_master_operations: 463,
    seller_exact_swagger_sha256: EXPECTED_SELLER_SWAGGER_SHA256,
    accepted_step3_seller_aliases: 191,
    historical_acceptance: HISTORICAL,
  },
  invariants: [
    'NO_HIDDEN_PAGINATION',
    'NO_HIDDEN_RETRY',
    'NO_HIDDEN_POLLING',
    'NO_HIDDEN_FANOUT',
    'NO_PROVIDER_CHAINING',
    'ONE_EXPLICIT_COMMAND_ONE_BUSINESS_REQUEST',
    'REPORT_CREATE_IS_NOT_ASSUMED_TO_BE_A_READ',
    'DOCUMENT_URL_IS_NOT_AUTO_FETCHED',
  ],
  counts,
  historical_carry_forward_rows: historicalRows.sort((a,b)=>a.stage.localeCompare(b.stage)||a.alias.localeCompare(b.alias)),
  rows: rows.sort((a,b)=>a.operation_key.localeCompare(b.operation_key)),
  boundary: 'This inventory identifies the Step5 candidate surface. Accepted Step3 metadata is carried forward. Unimplemented rows remain fail-closed and require exact accepted Swagger schema review before implementation or terminal rejection. Detection signals are discovery-only and are not semantic authority.',
  final_action: 'USE_AS_STEP5_CANDIDATE_MATRIX; NEXT CLASSIFY_PENDING_ROWS_WITH_EXACT_ACCEPTED_SWAGGER_AND_IMPLEMENT_ONLY_EXPLICIT_READ_STEPS',
};
fs.writeFileSync(path.join(outDir,'OZON_WORKFLOW_REPORT_DOCUMENT_INVENTORY_2026-08-29.json'), JSON.stringify(payload,null,2)+'\n');

const headers = ['operation_key','http_method','fixed_path','source_category_tag','purpose','detection_reasons','accepted_step3_alias','accepted_step3_effect','accepted_step3_workflow_role','accepted_step3_privacy_policy','step5_classification','exact_schema_decision'];
const csv = [headers.join(',')];
for (const row of payload.rows) csv.push(headers.map(h=>csvEscape(row[h])).join(','));
fs.writeFileSync(path.join(outDir,'OZON_WORKFLOW_REPORT_DOCUMENT_INVENTORY_2026-08-29.csv'), csv.join('\n')+'\n');

const hist = historicalRows.sort((a,b)=>a.stage.localeCompare(b.stage)||a.alias.localeCompare(b.alias)).map(r=>`- ${r.stage}: \`${r.alias}\` → \`${r.operation_key}\``).join('\n');
const md = `# Ozon Seller workflow / report / document inventory — 2026-08-29\n\nStatus: \`WORKFLOW_REPORT_DOCUMENT_CANDIDATE_UNIVERSE_BUILT_EXACT_SCHEMA_DECISIONS_PENDING\`\n\n## Counts\n\n- Seller master rows: **463**.\n- Accepted Step3 Seller aliases: **191**.\n- Step5 candidate rows: **${rows.length}**.\n- Candidates already represented by accepted Step3 aliases: **${acceptedCandidateRows.length}**.\n- Candidate rows still requiring exact-schema decision: **${pendingRows.length}**.\n- Accepted direct single reads in this candidate surface: **${counts.accepted_direct_single_reads}**.\n- Accepted explicit workflow read steps: **${counts.accepted_explicit_workflow_read_steps}**.\n\n## Historical accepted workflow/report/document carry-forward\n\n${hist}\n\nB5/B24/B37/B40 boundaries are preserved: report/result/status reads may be explicit single commands, while report creation, mutation, automatic download, hidden polling, retry, pagination, fanout and provider chaining are not inferred or added.\n\n## Fail-closed rule\n\nCandidate detection is discovery-only. Any row without an accepted Step3 alias remains \`REQUIRES_EXACT_ACCEPTED_SWAGGER_SNAPSHOT\`. A path or purpose containing report/status/PDF/document/create is not by itself semantic authority.\n\nNo Seller or Performance business API request is performed by this inventory.\n`;
fs.writeFileSync(path.join(outDir,'OZON_WORKFLOW_REPORT_DOCUMENT_INVENTORY_SUMMARY_2026-08-29.md'), md);

console.log(JSON.stringify(counts));
console.log('OZON_WORKFLOW_REPORT_DOCUMENT_INVENTORY_AUTHOR_GATE_PASS');
