import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const repo = process.argv[2] || '.';
const dist = path.join(repo, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const read = (name) => fs.readFileSync(path.join(dist, name), 'utf8');

const context = vm.createContext({
  console,
  TextEncoder,
  TextDecoder,
  crypto: globalThis.crypto,
  setTimeout,
  clearTimeout
});
context.globalThis = context;

for (const file of [
  'shared/runtime_names.js',
  'shared/ozon_operation_registry.js',
  'shared/ozon_guidance.js',
  'shared/bridge_autorun_model.js',
  'shared/llm_output_report_workflow_patch.js'
]) vm.runInContext(read(file), context, { filename: file });

const runtime = context.OzonRuntime;
const model = context.BridgeAutorunModel;
const guidance = context.OzonGuidance;
const patch = context.OzonLlmOutputReportWorkflowPatch;
assert.ok(runtime && model && guidance && patch, 'runtime/model/guidance/patch missing');

const prompt = String(runtime.DEFAULT_AUTO_START_TEXT || '');
assert.match(prompt, /максимум ОДИН[^\n]*command block/i, 'startup prompt must require one command form');
assert.match(prompt, /кнопк[^\n]*Ozon/i, 'startup prompt must explain Ozon button');
assert.match(prompt, /Не требуй[^\n]*копир[^\n]*встав/i, 'startup prompt must say manual copy/paste is not required');
assert.match(prompt, /НЕЗАВИСИМЫЕ[^\n]*один text code block/i, 'startup prompt must group independent envelopes');
assert.match(prompt, /create[^\n]*свежий code[^\n]*report_info[^\n]*свежий file_ref[^\n]*report_file_get/i, 'startup prompt must define report workflow');
assert.match(prompt, /workflow_continuations\[\]\.next_command/i, 'startup prompt must defer to exact Bridge continuation');

const batch = (payloads) => [
  'OZON_BATCH_RESULT_V1',
  JSON.stringify({ bridge: 'ozon-llm-api-bridge', version: '0.1.19', delivery_mode: 'sequential_batch_single_delivery', result_count: payloads.length }, null, 2),
  ...payloads.flatMap((payload, index) => [`===== OZON RESULT ${index + 1}/${payloads.length} =====`, 'OZON_RESULT_V1', JSON.stringify(payload, null, 2)])
].join('\n');

const createPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-create',
  operation: 'report_placement_by_products_create', http_status: 200,
  result: { result: { code: 'REPORT_fresh_123' } }
};
const createOut = model.applyReportPrefix(batch([createPayload]), null).text;
assert.equal((createOut.match(/OZON_LLM_INSTRUCTIONS_V1/g) || []).length, 1, 'exactly one LLM instruction tail per delivery');
assert.match(createOut, /"operation"\s*:\s*"report_info"/, 'create must expose report_info next command');
assert.match(createOut, /"code"\s*:\s*"REPORT_fresh_123"/, 'create must preserve fresh report code');
assert.match(createOut, /"submit_control"\s*:\s*"Ozon"/, 'tail must name Ozon control');
assert.match(createOut, /"max_command_forms_per_response"\s*:\s*1/, 'tail must require one form');
assert.match(createOut, /"group_independent_envelopes"\s*:\s*true/, 'tail must group independent envelopes');
assert.match(createOut, /"manual_copy_paste_required"\s*:\s*false/, 'manual copy paste must not be required');
assert.equal(model.applyReportPrefix(createOut, null).text, createOut, 'tail append must be idempotent across recovery');

const infoReadyPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-info',
  operation: 'report_info', http_status: 200,
  result: { result: { code: 'REPORT_fresh_123', status: 'success', file: '[REDACTED]' }, report_file_ref: 'rpf_s_freshRef123' }
};
const infoOut = model.applyReportPrefix(batch([infoReadyPayload]), null).text;
assert.match(infoOut, /"state"\s*:\s*"file_ready"/, 'report_info ready state missing');
assert.match(infoOut, /"operation"\s*:\s*"report_file_get"/, 'report_info must expose report_file_get next command');
assert.match(infoOut, /"file_ref"\s*:\s*"rpf_s_freshRef123"/, 'fresh file_ref must be preserved');
assert.match(infoOut, /"offset"\s*:\s*0/, 'report file offset must be explicit');
assert.match(infoOut, /"limit"\s*:\s*200/, 'report file limit must be explicit');
assert.doesNotMatch(infoOut, /signed\.example|X-Amz-|Signature=/i, 'instruction flow must not expose signed provider URL');

const infoPendingPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-info-pending',
  operation: 'report_info', http_status: 200,
  result: { result: { code: 'REPORT_fresh_123', status: 'processing' } }
};
const pendingOut = model.applyReportPrefix(batch([infoPendingPayload]), null).text;
assert.match(pendingOut, /"state"\s*:\s*"pending"/, 'pending report state missing');
assert.match(pendingOut, /"automatic_continuation"\s*:\s*false/, 'pending workflow must not poll automatically');
assert.match(pendingOut, /"operation"\s*:\s*"report_info"/, 'pending workflow must expose explicit report_info command');

const infoReadyMissingRefPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-info-ready-missing-ref',
  operation: 'report_info', http_status: 200,
  result: { result: { code: 'REPORT_fresh_123', status: 'success', file: '[REDACTED]' } }
};
const missingRefOut = model.applyReportPrefix(batch([infoReadyMissingRefPayload]), null).text;
assert.match(missingRefOut, /"state"\s*:\s*"blocked_missing_fresh_file_ref"/, 'ready without opaque file ref must fail closed');
assert.doesNotMatch(missingRefOut, /"operation"\s*:\s*"report_file_get"/, 'must not fabricate report_file_get without fresh file_ref');

const filePayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-file',
  operation: 'report_file_get', http_status: 200,
  result: { content_type: 'text/csv', row_count: 10 }
};
const fileOut = model.applyReportPrefix(batch([filePayload]), null).text;
assert.match(fileOut, /"state"\s*:\s*"file_downloaded"/, 'terminal file state missing');
assert.match(fileOut, /"next_command"\s*:\s*null/, 'terminal file workflow must not create another command');

const generatedReadyPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-generated',
  operation: 'cargoes_label_get', http_status: 200,
  result: { status: 'success', generated_file_ref: 'rpf_s_generated123' }
};
const generatedReadyOut = model.applyReportPrefix(batch([generatedReadyPayload]), null).text;
assert.match(generatedReadyOut, /"kind"\s*:\s*"generated_document"/, 'generated document workflow kind missing');
assert.match(generatedReadyOut, /"operation"\s*:\s*"report_file_get"/, 'generated URL document must continue through opaque report_file_get');
assert.match(generatedReadyOut, /"file_ref"\s*:\s*"rpf_s_generated123"/, 'generated document must preserve opaque fresh ref');

const generatedCreatePayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-label-create',
  operation: 'cargoes_label_create', http_status: 200,
  result: { operation_id: 'op-fresh-1', status: 'created' }
};
const generatedCreateOut = model.applyReportPrefix(batch([generatedCreatePayload]), null).text;
assert.match(generatedCreateOut, /"operation"\s*:\s*"cargoes_label_get"/, 'generated document create must expose exact resolver');
assert.match(generatedCreateOut, /"operation_id"\s*:\s*"op-fresh-1"/, 'generated document create must preserve fresh operation id');

const generatedBlockedPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-label-create-bad',
  operation: 'cargoes_label_create', http_status: 200,
  result: { status: 'created' }
};
const generatedBlockedOut = model.applyReportPrefix(batch([generatedBlockedPayload]), null).text;
assert.match(generatedBlockedOut, /"state"\s*:\s*"blocked_missing_fresh_dependencies"/, 'missing generated-doc dependency must fail closed');
assert.doesNotMatch(generatedBlockedOut, /"operation"\s*:\s*"cargoes_label_get"/, 'missing dependency must not fabricate resolver command');

const directBinaryPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-inline',
  operation: 'posting_fbs_package_label', http_status: 200,
  result: { generated_file_inline: true, generated_file_ref: 'rpf_s_inline123', content_type: 'application/pdf' }
};
const directBinaryOut = model.applyReportPrefix(batch([directBinaryPayload]), null).text;
assert.match(directBinaryOut, /"state"\s*:\s*"file_downloaded"/, 'direct binary already captured for attachment must be terminal');
assert.doesNotMatch(directBinaryOut, /"operation"\s*:\s*"report_file_get"/, 'direct binary must not trigger a redundant second provider/file request');

const failedCreatePayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-fail',
  operation: 'report_products_create', http_status: 500,
  result: { error: { code: 'PROVIDER_ERROR' } }
};
const failedOut = model.applyReportPrefix(batch([failedCreatePayload]), null).text;
assert.match(failedOut, /"workflow_continuations"\s*:\s*\[\s*\]/, 'failed provider request must not create dependent continuation');

const normalPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-normal',
  operation: 'analytics_data', http_status: 200,
  result: { result: { totals: [100, 2] } }
};
const normalOut = model.applyReportPrefix(batch([normalPayload, normalPayload]), null).text;
assert.equal((normalOut.match(/OZON_LLM_INSTRUCTIONS_V1/g) || []).length, 1, 'multi-result delivery must still have one instruction tail');
assert.match(normalOut, /"workflow_continuations"\s*:\s*\[\s*\]/, 'normal batch must not fabricate workflow continuation');

const guidancePayload = guidance.result({ status: 'section_selected', cluster: 'finance', section: 'documents_reports', version: 2 });
const reportInfoCard = guidancePayload.choices.find((choice) => choice.operation === 'report_info');
assert.ok(reportInfoCard, 'report_info guidance card missing');
assert.deepEqual(JSON.parse(JSON.stringify(reportInfoCard.workflow)), { kind: 'report_download', role: 'resolve_file', next_operation: 'report_file_get' }, 'guidance must expose report workflow metadata');

assert.equal(patch.workflowMetadataForOperation('analytics_data'), null, 'ordinary reads must not be mislabeled as report workflow');

console.log('OZON_LLM_OUTPUT_REPORT_WORKFLOW_GATE_PASS');
