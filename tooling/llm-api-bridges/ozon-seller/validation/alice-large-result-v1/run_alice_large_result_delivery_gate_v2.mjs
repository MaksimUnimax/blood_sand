import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('.');
const root = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(repoRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const context = { console, URL, TextEncoder, crypto: globalThis.crypto || { randomUUID: () => '00000000-0000-4000-8000-000000000000' }, globalThis: null };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(read('shared/ai_delivery_capabilities.js'), context, { filename: 'ai_delivery_capabilities.js' });
vm.runInContext(read('shared/bridge_autorun_model.js'), context, { filename: 'bridge_autorun_model.js' });
vm.runInContext(read('shared/file_delivery_model_policy.js'), context, { filename: 'file_delivery_model_policy.js' });

const caps = context.OzonAIDeliveryCapabilities;
const model = context.BridgeAutorunModel;
assert.ok(caps && model, 'delivery capability/model runtime must load');

const alice = caps.profile('alice');
const chatgpt = caps.profile('chatgpt');
assert.equal(alice?.plain_text_max_chars, 90_000);
assert.equal(alice?.plain_text_length_metric, 'utf16_code_units');
assert.equal(alice?.attachment_strategy, 'file_input_v1');
assert.equal(alice?.max_files_per_turn, 1);
assert.equal(chatgpt?.plain_text_max_chars, 1_048_000);
assert.equal(chatgpt?.plain_text_length_metric, 'unicode_code_points');

for (const [length, expected] of [[89_999, 'plain_text'], [90_000, 'plain_text'], [90_001, 'text_document'], [364_805, 'text_document']]) {
  const decision = caps.generatedTextDecision('alice', 'a'.repeat(length));
  assert.equal(decision.representation, expected, `Alice boundary ${length}`);
  assert.equal(decision.threshold_chars, length);
  assert.equal(decision.length_metric, 'utf16_code_units');
}

const emoji = '😀'.repeat(50_001);
const emojiDecision = caps.generatedTextDecision('alice', emoji);
assert.equal(emojiDecision.unicode_chars, 50_001);
assert.equal(emojiDecision.threshold_chars, 100_002);
assert.equal(emojiDecision.representation, 'text_document');
assert.equal(caps.generatedTextDecision('chatgpt', emoji).threshold_chars, 50_001, 'ChatGPT Unicode-code-point metric must remain unchanged');
assert.equal(caps.generatedTextDecision('chatgpt', 'a'.repeat(1_048_000)).representation, 'plain_text');
assert.equal(caps.generatedTextDecision('chatgpt', 'a'.repeat(1_048_001)).representation, 'text_document');

const txtAtLimit = caps.supportsFile('alice', { filename: 'result.txt', byte_length: 100 * 1024 * 1024 });
const txtOverLimit = caps.supportsFile('alice', { filename: 'result.txt', byte_length: 100 * 1024 * 1024 + 1 });
assert.equal(txtAtLimit.supported, true);
assert.equal(txtOverLimit.supported, false);
assert.equal(txtOverLimit.reason, 'file_too_large_for_adapter');
assert.equal(caps.supportsFile('alice', { filename: 'result.csv', byte_length: 100 }).supported, false);

function collecting(origin, entries = []) {
  return { origin, status: model.RUN_STATUSES.COLLECTING, batch: { entries } };
}

const atBoundary = model.claimDelivery(collecting('https://alice.yandex.ru'), {
  deliveryId: 'alice-90000', mode: 'batch_watch_v1', outgoingText: 'x'.repeat(90_000), reportPrefixApplied: false
});
assert.equal(atBoundary.delivery.mode, 'batch_watch_v1');

const large = model.claimDelivery(collecting('https://alice.yandex.ru'), {
  deliveryId: 'alice-90001', mode: 'batch_watch_v1', outgoingText: 'x'.repeat(90_001), reportPrefixApplied: false
});
assert.equal(large.delivery.mode, 'attachment_watch_v1');
assert.equal(large.delivery.phase, model.ATTACHMENT_PHASES.CLAIMED);
assert.equal(large.delivery.generated_text_document.filename, 'ozon-bridge-result-alice-90001.txt');
assert.equal(large.delivery.generated_text_document.complete, true);
assert.equal(large.delivery.generated_text_document.byte_length, 90_001);
assert.equal(large.delivery.artifact_text.length, 90_001);
assert.match(large.delivery.outgoing_text, /^OZON_BATCH_RESULT_V1\n/);
assert.equal(large.delivery.text_decision.length_metric, 'utf16_code_units');

const reportEntry = {
  status: 'complete', http_status: 200,
  command: { operation: 'report_file_get', params: { file_ref: 'rpf_s_alice' } },
  report_text: 'parsed report text'
};
const providerFile = model.claimDelivery(collecting('https://alice.yandex.ru', [reportEntry]), {
  deliveryId: 'alice-provider-file', mode: 'batch_watch_v1', outgoingText: 'small result', reportPrefixApplied: false
});
assert.equal(providerFile.delivery.mode, 'attachment_watch_v1');
assert.deepEqual(Array.from(providerFile.delivery.provider_file_refs), ['rpf_s_alice']);
assert.equal(providerFile.delivery.generated_text_document, null);

const adapterSource = read('shared/ai_adapters.js');
assert.doesNotMatch(adapterSource, /attachmentSurface\(\)\s*\{\s*return null;\s*\}/);
assert.doesNotMatch(adapterSource, /attachmentReady\(\)\s*\{\s*return false;\s*\}/);
assert.match(adapterSource, /function aliceFileInput\s*\(/);
assert.match(adapterSource, /function aliceAttachmentPreview\s*\(/);
assert.match(adapterSource, /imageOnly/);

const portSource = read('attachment_delivery_port_content.js');
assert.match(portSource, /TARGET_AI_FILE_COUNT_UNSUPPORTED/);
assert.match(portSource, /assertAttachmentCountSupported\(active, descriptors\)/);
assert.doesNotMatch(portSource, /automatic[_ -]?retry\s*=\s*true/i);

console.log('ALICE_LARGE_RESULT_CAPABILITY_BOUNDARIES_PASS');
console.log('ALICE_UTF16_SAFETY_METRIC_PASS');
console.log('CHATGPT_THRESHOLD_SEMANTICS_UNCHANGED_PASS');
console.log('ALICE_GENERATED_TXT_PLAN_PASS');
console.log('ALICE_SINGLE_PROVIDER_FILE_PLAN_PASS');
console.log('ALICE_FILE_COUNT_FAIL_CLOSED_GUARD_PRESENT_PASS');
console.log('ALICE_LARGE_RESULT_DELIVERY_GATE_V2_PASS');
