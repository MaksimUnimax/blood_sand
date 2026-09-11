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

vm.runInContext(read('shared/runtime_names.js'), context, { filename: 'runtime_names.js' });
vm.runInContext(read('shared/bridge_autorun_model.js'), context, { filename: 'bridge_autorun_model.js' });

const runtime = context.OzonRuntime;
const model = context.BridgeAutorunModel;
assert.ok(runtime && model, 'runtime/model missing');

const prompt = String(runtime.DEFAULT_AUTO_START_TEXT || '');
assert.match(prompt, /ОДИН[^\n]*text code block/i, 'startup prompt must require one command form');
assert.match(prompt, /кнопк[^\n]*Ozon/i, 'startup prompt must explain Ozon button');
assert.match(prompt, /не[^\n]*копир[^\n]*встав/i, 'startup prompt must say manual copy/paste is not required');
assert.match(prompt, /независим[^\n]*один/i, 'startup prompt must group independent envelopes');

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

const infoReadyPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-info',
  operation: 'report_info', http_status: 200,
  result: { result: { code: 'REPORT_fresh_123', status: 'success' }, report_file_ref: 'rpf_s_freshRef123' }
};
const infoOut = model.applyReportPrefix(batch([infoReadyPayload]), null).text;
assert.match(infoOut, /"state"\s*:\s*"file_ready"/, 'report_info ready state missing');
assert.match(infoOut, /"operation"\s*:\s*"report_file_get"/, 'report_info must expose report_file_get next command');
assert.match(infoOut, /"file_ref"\s*:\s*"rpf_s_freshRef123"/, 'fresh file_ref must be preserved');
assert.doesNotMatch(infoOut, /https?:\/\//i, 'instruction tail must not expose provider URL');

const infoPendingPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-info-pending',
  operation: 'report_info', http_status: 200,
  result: { result: { code: 'REPORT_fresh_123', status: 'processing' } }
};
const pendingOut = model.applyReportPrefix(batch([infoPendingPayload]), null).text;
assert.match(pendingOut, /"state"\s*:\s*"pending"/, 'pending report state missing');
assert.match(pendingOut, /"automatic_continuation"\s*:\s*false/, 'pending workflow must not poll automatically');
assert.match(pendingOut, /"operation"\s*:\s*"report_info"/, 'pending workflow must expose explicit report_info command');

const filePayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-file',
  operation: 'report_file_get', http_status: 200,
  result: { content_type: 'text/csv', row_count: 10 }
};
const fileOut = model.applyReportPrefix(batch([filePayload]), null).text;
assert.match(fileOut, /"state"\s*:\s*"file_downloaded"/, 'terminal file state missing');
assert.match(fileOut, /"next_command"\s*:\s*null/, 'terminal file workflow must not create another command');

const normalPayload = {
  bridge: 'ozon-llm-api-bridge', version: '0.1.19', request_id: 'r-normal',
  operation: 'analytics_data', http_status: 200,
  result: { result: { totals: [100, 2] } }
};
const normalOut = model.applyReportPrefix(batch([normalPayload, normalPayload]), null).text;
assert.equal((normalOut.match(/OZON_LLM_INSTRUCTIONS_V1/g) || []).length, 1, 'multi-result delivery must still have one instruction tail');
assert.match(normalOut, /"workflow_continuations"\s*:\s*\[\s*\]/, 'normal batch must not fabricate workflow continuation');

console.log('OZON_LLM_OUTPUT_REPORT_WORKFLOW_GATE_PASS');
