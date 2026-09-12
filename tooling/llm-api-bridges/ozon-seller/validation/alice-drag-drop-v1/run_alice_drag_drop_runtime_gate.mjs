import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('.');
const root = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(repoRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const context = { console, URL, TextEncoder, crypto: globalThis.crypto, globalThis: null };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(read('shared/ai_delivery_capabilities.js'), context, { filename: 'ai_delivery_capabilities.js' });
vm.runInContext(read('shared/bridge_autorun_model.js'), context, { filename: 'bridge_autorun_model.js' });
vm.runInContext(read('shared/file_delivery_model_policy.js'), context, { filename: 'file_delivery_model_policy.js' });

const caps = context.OzonAIDeliveryCapabilities;
const model = context.BridgeAutorunModel;
assert.ok(caps && model);

const alice = caps.profile('alice');
const chatgpt = caps.profile('chatgpt');
assert.equal(alice.status, 'implemented');
assert.equal(alice.attachment_strategy, 'drag_drop_v1');
assert.equal(alice.plain_text_max_chars, 90_000);
assert.equal(alice.plain_text_length_metric, 'utf16_code_units');
assert.equal(alice.max_files_per_turn, 1);
assert.equal(alice.max_file_bytes, 100 * 1024 * 1024);
assert.deepEqual(Array.from(alice.accepted_extensions), ['txt', 'pdf', 'doc', 'docx', 'xlsx']);
assert.equal(chatgpt.attachment_strategy, 'file_input_v1');
assert.equal(chatgpt.plain_text_max_chars, 1_048_000);
assert.equal(chatgpt.plain_text_length_metric, 'unicode_code_points');
assert.equal(model.hasLiveAttachmentStrategy('alice'), true);
assert.equal(model.hasLiveAttachmentStrategy('chatgpt'), true);
assert.equal(model.hasLiveAttachmentStrategy('deepseek'), false);

for (const [length, expected] of [[89_999,'plain_text'],[90_000,'plain_text'],[90_001,'text_document'],[364_805,'text_document']]) {
  assert.equal(caps.generatedTextDecision('alice', 'x'.repeat(length)).representation, expected);
}
const emoji = '😀'.repeat(50_001);
assert.equal(caps.generatedTextDecision('alice', emoji).threshold_chars, 100_002);
assert.equal(caps.generatedTextDecision('alice', emoji).representation, 'text_document');
assert.equal(caps.generatedTextDecision('chatgpt', emoji).threshold_chars, 50_001);

const adapters = read('shared/ai_adapters.js');
assert.doesNotMatch(adapters, /function\s+aliceFileInput\s*\(/);
assert.doesNotMatch(adapters, /aliceFileInputScore|aliceUniqueFileInput/);
assert.match(adapters, /function\s+aliceAttachmentSurface\s*\(/);
assert.match(adapters, /InputControls-Plus-Button/);
assert.match(adapters, /aria-label=\\?"Добавить файл/);
assert.match(adapters, /function\s+aliceAttachFiles\s*\(/);
assert.match(adapters, /dispatchFileDrop/);
assert.match(adapters, /kind:\s*"drag_drop_v1"/);
assert.match(adapters, /kind:\s*"file_input_v1"/);
assert.match(adapters, /uploading\|loading\|загружа\|обработ\|ошиб\|error\|не поддерж\|unsupported\|failed\|сбой/);

const web = read('shared/web_file_attachment.js');
assert.match(web, /function\s+dispatchFileDrop\s*\(/);
assert.match(web, /new\s+DataTransfer\s*\(/);
assert.match(web, /new\s+DragEvent\s*\(/);
assert.match(web, /\["dragenter",\s*"dragover",\s*"drop"\]/);
assert.doesNotMatch(web, /dispatchFileDrop[\s\S]{0,2000}\.click\s*\(/);

const port = read('attachment_delivery_port_content.js');
assert.match(port, /\["file_input_v1",\s*"drag_drop_v1"\]/);
assert.match(port, /typeof\s+active\.attachFiles\s*!==\s*"function"/);
assert.match(port, /active\.attachFiles\(surfaceBeforeCommit,\s*files\)/);
assert.doesNotMatch(port, /surfaceBeforeCommit\.input/);
assert.doesNotMatch(port, /setInputFiles\(surfaceBeforeCommit/);
assert.match(port, /ATTACH_OUTCOME_UNKNOWN_NO_RETRY/);

const policy = read('shared/file_delivery_model_policy.js');
assert.match(policy, /\["file_input_v1",\s*"drag_drop_v1"\]\.includes\(strategy\)/);
const worker = read('shared/file_delivery_port_worker.js');
assert.match(worker, /\["file_input_v1",\s*"drag_drop_v1"\]\.includes\(strategy\)/);

const complete = model.claimDelivery({
  origin: 'https://alice.yandex.ru', status: model.RUN_STATUSES.COLLECTING, batch: { entries: [] }
}, { deliveryId: 'alice-dnd-large', mode: 'batch_watch_v1', outgoingText: 'x'.repeat(90_001), reportPrefixApplied: false });
assert.equal(complete.delivery.mode, 'attachment_watch_v1');
assert.equal(complete.delivery.generated_text_document.complete, true);
assert.equal(complete.delivery.generated_text_document.extension, 'txt');
assert.equal(complete.delivery.artifact_text.length, 90_001);

console.log('ALICE_DND_CAPABILITY_CONTRACT_PASS');
console.log('ALICE_DND_NO_PERSISTENT_INPUT_ASSUMPTION_PASS');
console.log('ALICE_DND_ADAPTER_OWNED_TRANSPORT_PASS');
console.log('ALICE_DND_GENERIC_PORT_STRATEGY_SPLIT_PASS');
console.log('ALICE_DND_POLICY_AND_WORKER_CLOSED_SET_PASS');
console.log('ALICE_DND_THRESHOLD_AND_COMPLETE_TXT_PASS');
console.log('ALICE_DRAG_DROP_RUNTIME_GATE_PASS');
