import fs from 'node:fs';
import assert from 'node:assert/strict';

const path = process.argv[2];
if (!path) throw new Error('usage: node verify_defect_015_post_install_live_evidence.mjs <evidence.json>');
const e = JSON.parse(fs.readFileSync(path, 'utf8'));

assert.equal(e.schema, 'OZON_DEFECT_015_POST_INSTALL_LIVE_EVIDENCE_V1');
assert.equal(e.artifact_name, 'OZON_BRIDGE_v0.1.19_DEFECT_015_DATE_CONTRACT_REPAIR_2892a1ddeee5.zip');
assert.equal(e.artifact_sha256, 'ff6a766837195e74e09c3a9439afd057f71dca20b042b472cbd1401b2574549a');
assert.equal(e.operator_installed_exact_artifact, true);
assert.equal(e.operation, 'finance_balance');
assert.deepEqual(e.requested_params, { date_from: '2026-08-28', date_to: '2026-09-03' });
assert.equal(e.request_meta?.host_alias, 'seller_api');
assert.equal(e.request_meta?.http_method, 'POST');
assert.ok(['/v1/finance/balance', 'finance_balance'].includes(String(e.request_meta?.path || e.request_meta?.path_alias || '')));
assert.equal(e.external_request_executed, true);
assert.equal(e.exact_request_preserved, true);
assert.equal(e.command_transformed, false);
assert.equal(e.physical_business_request_count, 1);
assert.equal(e.automatic_retry, false);
assert.equal(e.http_status, 200);
assert.equal(e.provider_success, true);
assert.ok(typeof e.request_id === 'string' && e.request_id.length > 0);

console.log('DEFECT_015_POST_INSTALL_EXACT_ARTIFACT_IDENTITY_PASS');
console.log('DEFECT_015_POST_INSTALL_FINANCE_BALANCE_YMD_PASS');
console.log('DEFECT_015_POST_INSTALL_ONE_REQUEST_NO_RETRY_PASS');
console.log('DEFECT_015_POST_INSTALL_LIVE_GATE_PASS');
