import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const capsPath = path.join(root, 'shared', 'ai_delivery_capabilities.js');
const adaptersPath = path.join(root, 'shared', 'ai_adapters.js');
const capsSource = fs.readFileSync(capsPath, 'utf8');
const adaptersSource = fs.readFileSync(adaptersPath, 'utf8');

const context = { console, URL, TextEncoder, globalThis: null };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(capsSource, context, { filename: capsPath });
const caps = context.OzonAIDeliveryCapabilities;
assert.ok(caps, 'OzonAIDeliveryCapabilities must load');

const alice = caps.profile('alice');
const chatgpt = caps.profile('chatgpt');
assert.equal(alice?.plain_text_max_chars, 90_000, 'ALICE_SAFE_PLAIN_TEXT_THRESHOLD_MUST_BE_90000');
assert.equal(alice?.attachment_strategy, 'drag_drop_v1', 'ALICE_ATTACHMENT_STRATEGY_MUST_BE_DRAG_DROP_V1');
assert.equal(chatgpt?.plain_text_max_chars, 1_048_000, 'CHATGPT_THRESHOLD_MUST_REMAIN_UNCHANGED');

for (const [length, expected] of [
  [89_999, 'plain_text'],
  [90_000, 'plain_text'],
  [90_001, 'text_document'],
  [364_805, 'text_document']
]) {
  const decision = caps.generatedTextDecision('alice', 'a'.repeat(length));
  assert.equal(decision.representation, expected, `ALICE_BOUNDARY_${length}`);
}

// Alice composer counters are browser-side JS character counters. The safety metric must
// never undercount UTF-16 code units (notably surrogate-pair emoji) against the 100k live limit.
const emoji = '😀'.repeat(50_001); // 50,001 code points / 100,002 UTF-16 code units.
const emojiDecision = caps.generatedTextDecision('alice', emoji);
assert.equal(emojiDecision.representation, 'text_document', 'ALICE_UTF16_EMOJI_MUST_NOT_UNDERCOUNT');
assert.ok(Number(emojiDecision.threshold_chars ?? 0) >= 100_002, 'ALICE_DECISION_MUST_EXPOSE_SAFE_MEASURED_LENGTH');

// Do not regress ChatGPT's established Unicode-code-point threshold semantics.
assert.equal(caps.generatedTextDecision('chatgpt', 'a'.repeat(1_048_000)).representation, 'plain_text');
assert.equal(caps.generatedTextDecision('chatgpt', 'a'.repeat(1_048_001)).representation, 'text_document');

// Structural guards: Alice must use the live-evidenced body drag/drop transport, not an invented
// persistent composer-local file input. Readiness stays exact-filename and fail-closed.
assert.doesNotMatch(adaptersSource, /function aliceFileInput\s*\(/, 'ALICE_PERSISTENT_FILE_INPUT_MODEL_FORBIDDEN');
assert.match(adaptersSource, /function aliceAttachmentSurface\s*\(/, 'ALICE_DRAG_DROP_SURFACE_REQUIRED');
assert.match(adaptersSource, /InputControls-Plus-Button/, 'ALICE_LIVE_PLUS_CAPABILITY_MARKER_REQUIRED');
assert.match(adaptersSource, /function aliceAttachFiles\s*\(/, 'ALICE_ADAPTER_OWNED_ATTACHMENT_TRANSPORT_REQUIRED');
assert.match(adaptersSource, /dispatchFileDrop/, 'ALICE_BODY_DROP_PRIMITIVE_REQUIRED');
assert.match(adaptersSource, /function aliceAttachmentPreview\s*\(/, 'ALICE_ATTACHMENT_PREVIEW_RESOLVER_REQUIRED');

console.log('ALICE_LARGE_RESULT_DELIVERY_GATE_PASS');
