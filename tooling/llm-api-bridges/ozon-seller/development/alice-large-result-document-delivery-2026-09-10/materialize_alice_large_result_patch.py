#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected exactly one match in {path}: {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


caps = DIST / "shared/ai_delivery_capabilities.js"
replace_once(
    caps,
    '  const CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000;\n',
    '  const CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000;\n'
    '  const ALICE_MAX_SAFE_PLAIN_TEXT_UTF16_CODE_UNITS = 90_000;\n'
)
replace_once(
    caps,
    '      plain_text_max_chars: CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS,\n'
    '      attachments_supported: true,',
    '      plain_text_max_chars: CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS,\n'
    '      plain_text_length_metric: "unicode_code_points",\n'
    '      attachments_supported: true,'
)
replace_once(
    caps,
    '      plain_text_max_chars: null,\n'
    '      attachments_supported: true,\n'
    '      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),\n'
    '      max_file_bytes: 100 * 1024 * 1024,\n'
    '      max_files_per_turn: 1,\n'
    '      attachment_strategy: "live_profile_required"',
    '      plain_text_max_chars: ALICE_MAX_SAFE_PLAIN_TEXT_UTF16_CODE_UNITS,\n'
    '      plain_text_length_metric: "utf16_code_units",\n'
    '      attachments_supported: true,\n'
    '      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),\n'
    '      max_file_bytes: 100 * 1024 * 1024,\n'
    '      max_files_per_turn: 1,\n'
    '      attachment_strategy: "file_input_v1"'
)
replace_once(
    caps,
    '''  function generatedTextDecision(adapterId, text) {\n    const current = profile(adapterId);\n    if (!current) return Object.freeze({ representation: "plain_text", threshold_status: "unknown_adapter", unicode_chars: unicodeLength(text), threshold: null });\n    const chars = unicodeLength(text);\n    const hasThreshold = current.plain_text_max_chars !== null && current.plain_text_max_chars !== undefined && Number.isFinite(Number(current.plain_text_max_chars));\n    const threshold = hasThreshold ? Number(current.plain_text_max_chars) : null;\n    if (threshold === null) return Object.freeze({ representation: "plain_text", threshold_status: "pending_live_calibration", unicode_chars: chars, threshold: null });\n    return Object.freeze({\n      representation: chars > threshold ? "text_document" : "plain_text",\n      threshold_status: "calibrated",\n      unicode_chars: chars,\n      threshold\n    });\n  }\n''',
    '''  function generatedTextDecision(adapterId, text) {\n    const current = profile(adapterId);\n    const value = String(text || "");\n    const unicodeChars = unicodeLength(value);\n    if (!current) return Object.freeze({ representation: "plain_text", threshold_status: "unknown_adapter", unicode_chars: unicodeChars, threshold_chars: unicodeChars, length_metric: "unicode_code_points", threshold: null });\n    const metric = current.plain_text_length_metric === "utf16_code_units" ? "utf16_code_units" : "unicode_code_points";\n    const thresholdChars = metric === "utf16_code_units" ? value.length : unicodeChars;\n    const hasThreshold = current.plain_text_max_chars !== null && current.plain_text_max_chars !== undefined && Number.isFinite(Number(current.plain_text_max_chars));\n    const threshold = hasThreshold ? Number(current.plain_text_max_chars) : null;\n    if (threshold === null) return Object.freeze({ representation: "plain_text", threshold_status: "pending_live_calibration", unicode_chars: unicodeChars, threshold_chars: thresholdChars, length_metric: metric, threshold: null });\n    return Object.freeze({\n      representation: thresholdChars > threshold ? "text_document" : "plain_text",\n      threshold_status: "calibrated",\n      unicode_chars: unicodeChars,\n      threshold_chars: thresholdChars,\n      length_metric: metric,\n      threshold\n    });\n  }\n'''
)
replace_once(
    caps,
    '    CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS,\n',
    '    CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS,\n'
    '    ALICE_MAX_SAFE_PLAIN_TEXT_UTF16_CODE_UNITS,\n'
)

adapters = DIST / "shared/ai_adapters.js"
insert_anchor = '  const CHATGPT_COPY_ANCHORS = new WeakMap();\n'
alice_helpers = r'''  function aliceAttachmentScopes() {
    const context = aliceComposerContext();
    if (!context?.root) return [];
    const scopes = [];
    const add = (node) => {
      if (!(node instanceof Element) || scopes.includes(node)) return;
      scopes.push(node);
    };
    add(context.form);
    add(context.root);
    let node = context.root.parentElement;
    for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
      add(node);
      if (node === document.body) break;
    }
    return scopes;
  }

  function aliceFileInputScore(input) {
    if (!(input instanceof HTMLInputElement) || !input.isConnected || input.disabled || String(input.type || "").toLowerCase() !== "file") return -1;
    const accept = String(input.getAttribute("accept") || "").toLowerCase();
    const docAccept = /(?:\.txt|\.pdf|\.docx?|text\/plain|application\/pdf|msword|officedocument)/.test(accept);
    const imageOnly = Boolean(accept) && /image\//.test(accept) && !docAccept;
    if (imageOnly) return -1;
    const token = [input.id, input.name, input.getAttribute("data-testid") || "", input.getAttribute("aria-label") || "", input.getAttribute("title") || ""].join(" ").toLowerCase();
    let score = docAccept ? 500 : 0;
    if (/attach|upload|file|document|прикреп|файл|документ/.test(token)) score += 200;
    return score;
  }

  function aliceUniqueFileInput(scope) {
    if (!(scope instanceof Element)) return null;
    const candidates = [...scope.querySelectorAll('input[type="file"]')]
      .filter((input) => aliceFileInputScore(input) >= 0)
      .map((input) => ({ input, score: aliceFileInputScore(input) }));
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score);
    const top = candidates[0];
    return candidates.filter((item) => item.score === top.score).length === 1 ? top.input : null;
  }

  function aliceFileInput() {
    const scopes = aliceAttachmentScopes();
    for (const scope of scopes) {
      const all = [...scope.querySelectorAll('input[type="file"]')].filter((input) => input instanceof HTMLInputElement && input.isConnected && !input.disabled);
      if (!all.length) continue;
      return aliceUniqueFileInput(scope);
    }
    const documentCandidates = [...document.querySelectorAll('input[type="file"]')]
      .filter((input) => aliceFileInputScore(input) >= 0)
      .map((input) => ({ input, score: aliceFileInputScore(input) }));
    if (!documentCandidates.length) return null;
    documentCandidates.sort((a, b) => b.score - a.score);
    const top = documentCandidates[0];
    return documentCandidates.filter((item) => item.score === top.score).length === 1 ? top.input : null;
  }

  function aliceAttachmentPreview(filename) {
    const target = String(filename || "").trim();
    if (!target) return null;
    const selectors = '[data-testid*="attach" i], [data-testid*="file" i], [data-testid*="upload" i], [data-filename], [data-file-name], [aria-label], [title]';
    for (const scope of aliceAttachmentScopes()) {
      const matches = [...scope.querySelectorAll(selectors)].filter((node) => {
        const token = [node.getAttribute("data-filename") || "", node.getAttribute("data-file-name") || "", node.getAttribute("aria-label") || "", node.getAttribute("title") || "", node.textContent || ""].join(" ");
        return token.includes(target);
      });
      if (!matches.length) continue;
      const leaves = matches.filter((node) => !matches.some((other) => other !== node && node.contains(other)));
      return leaves.length === 1 ? leaves[0] : (matches.length === 1 ? matches[0] : null);
    }
    return null;
  }

'''
text = adapters.read_text(encoding="utf-8")
if text.count(insert_anchor) != 1:
    raise RuntimeError("Alice adapter helper anchor drift")
adapters.write_text(text.replace(insert_anchor, alice_helpers + insert_anchor, 1), encoding="utf-8")
replace_once(
    adapters,
    '    deliveryCapabilities() { return globalThis.OzonAIDeliveryCapabilities?.profile?.("alice") || null; },\n'
    '    attachmentSurface() { return null; },\n'
    '    attachmentReady() { return false; },',
    '    deliveryCapabilities() { return globalThis.OzonAIDeliveryCapabilities?.profile?.("alice") || null; },\n'
    '    attachmentSurface() { const input = aliceFileInput(); const context = aliceComposerContext(); return input ? { input, root: context?.root || input.parentElement || document.documentElement } : null; },\n'
    '    attachmentPreview(filename) { return aliceAttachmentPreview(filename); },\n'
    '    attachmentReady(descriptors) {\n'
    '      const list = Array.isArray(descriptors) ? descriptors : [];\n'
    '      if (!list.length) return false;\n'
    '      return list.every((descriptor) => {\n'
    '        const preview = aliceAttachmentPreview(descriptor.filename);\n'
    '        if (!preview?.isConnected || preview.matches?.(\'[aria-busy="true"]\') || preview.querySelector?.(\'[aria-busy="true"]\')) return false;\n'
    '        const status = [preview.getAttribute?.("data-status") || "", preview.getAttribute?.("aria-label") || "", preview.getAttribute?.("title") || ""].join(" ").toLowerCase();\n'
    '        return !/uploading|loading|загруз|обработ/.test(status);\n'
    '      });\n'
    '    },'
)

port = DIST / "attachment_delivery_port_content.js"
replace_once(
    port,
    '  async function buildFiles(recovery) {\n'
    '    const metadata = await request("OZ_ATTACHMENT_ARTIFACT_META", ownerPayload(recovery));',
    '  function assertAttachmentCountSupported(active, descriptors) {\n'
    '    const profile = active?.deliveryCapabilities?.() || null;\n'
    '    const maxFiles = Number(profile?.max_files_per_turn);\n'
    '    if (profile?.max_files_per_turn !== null && profile?.max_files_per_turn !== undefined && Number.isFinite(maxFiles) && descriptors.length > maxFiles) {\n'
    '      throw Object.assign(new Error(`Target AI accepts at most ${maxFiles} attachment(s) per turn; ${descriptors.length} are required for this complete delivery.`), { code: "TARGET_AI_FILE_COUNT_UNSUPPORTED" });\n'
    '    }\n'
    '    return profile;\n'
    '  }\n\n'
    '  async function buildFiles(recovery) {\n'
    '    const metadata = await request("OZ_ATTACHMENT_ARTIFACT_META", ownerPayload(recovery));'
)
replace_once(
    port,
    '    const active = adapter();\n'
    '    const profile = active?.deliveryCapabilities?.() || null;\n'
    '    if (!profile || profile.attachment_strategy !== "file_input_v1") throw Object.assign(new Error("Target AI has no verified file-input attachment strategy in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });',
    '    const active = adapter();\n'
    '    const profile = assertAttachmentCountSupported(active, descriptors);\n'
    '    if (!profile || profile.attachment_strategy !== "file_input_v1") throw Object.assign(new Error("Target AI has no verified file-input attachment strategy in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });'
)
replace_once(
    port,
    '    if (!active || !descriptors.length) throw Object.assign(new Error("Committed attachment has no adapter/descriptors for reconciliation."), { code: "ATTACHMENT_RECONCILIATION_DATA_MISSING" });\n'
    '    const ready = await waitAttachmentReady(active, descriptors, ATTACH_RECONCILE_TIMEOUT_MS);',
    '    if (!active || !descriptors.length) throw Object.assign(new Error("Committed attachment has no adapter/descriptors for reconciliation."), { code: "ATTACHMENT_RECONCILIATION_DATA_MISSING" });\n'
    '    assertAttachmentCountSupported(active, descriptors);\n'
    '    const ready = await waitAttachmentReady(active, descriptors, ATTACH_RECONCILE_TIMEOUT_MS);'
)

reg = ROOT / "validation/regression/run_file_delivery_adapter_gate_policy.mjs"
replace_once(
    reg,
    '''const alice = model.claimDelivery({\n  origin: "https://alice.yandex.ru",\n  status: model.RUN_STATUSES.COLLECTING,\n  batch: { entries: [successfulFile] }\n}, {\n  deliveryId: "alice-report",\n  mode: "batch_watch_v1",\n  outgoingText: "OZON_BATCH_RESULT_V1\\nparsed Alice report text",\n  outgoingHash: "alice-hash",\n  reportPrefixApplied: false\n});\nassert.equal(alice.delivery.mode, "batch_watch_v1");\nassert.equal(alice.delivery.phase, model.DELIVERY_PHASES.CLAIMED);\nassert.equal(alice.delivery.outgoing_text, "OZON_BATCH_RESULT_V1\\nparsed Alice report text");\nassert.equal(alice.delivery.outgoing_hash, "alice-hash");\nassert.equal(alice.delivery.generated_text_document, undefined);\nconsole.log("REG_ALICE_REPORT_FILE_TEXT_PATH_PRESERVED_UNTIL_ATTACHMENT_PROFILE_PASS");\n''',
    '''const alice = model.claimDelivery({\n  origin: "https://alice.yandex.ru",\n  status: model.RUN_STATUSES.COLLECTING,\n  batch: { entries: [successfulFile] }\n}, {\n  deliveryId: "alice-report",\n  mode: "batch_watch_v1",\n  outgoingText: "OZON_BATCH_RESULT_V1\\nparsed Alice report text",\n  outgoingHash: "alice-hash",\n  reportPrefixApplied: false\n});\nassert.equal(alice.delivery.mode, "attachment_watch_v1");\nassert.equal(alice.delivery.phase, model.ATTACHMENT_PHASES.CLAIMED);\nassert.deepEqual(Array.from(alice.delivery.provider_file_refs), ["rpf_s_test"]);\nassert.equal(alice.delivery.generated_text_document, null);\nconsole.log("REG_ALICE_SINGLE_PROVIDER_FILE_ATTACHMENT_PATH_ENABLED_PASS");\n'''
)
replace_once(
    reg,
    '''const aliceHuge = model.claimDelivery({\n  origin: "https://alice.yandex.ru",\n  status: model.RUN_STATUSES.COLLECTING,\n  batch: { entries: [] }\n}, {\n  deliveryId: "alice-huge",\n  mode: "batch_watch_v1",\n  outgoingText: "x".repeat(1_048_001),\n  reportPrefixApplied: false\n});\nassert.equal(aliceHuge.delivery.mode, "batch_watch_v1");\nconsole.log("REG_ALICE_DOES_NOT_INHERIT_CHATGPT_LARGE_TEXT_RULE_PASS");\n''',
    '''const aliceBoundary = model.claimDelivery({\n  origin: "https://alice.yandex.ru",\n  status: model.RUN_STATUSES.COLLECTING,\n  batch: { entries: [] }\n}, {\n  deliveryId: "alice-boundary",\n  mode: "batch_watch_v1",\n  outgoingText: "x".repeat(90_000),\n  reportPrefixApplied: false\n});\nassert.equal(aliceBoundary.delivery.mode, "batch_watch_v1");\n\nconst aliceHuge = model.claimDelivery({\n  origin: "https://alice.yandex.ru",\n  status: model.RUN_STATUSES.COLLECTING,\n  batch: { entries: [] }\n}, {\n  deliveryId: "alice-huge",\n  mode: "batch_watch_v1",\n  outgoingText: "x".repeat(90_001),\n  reportPrefixApplied: false\n});\nassert.equal(aliceHuge.delivery.mode, "attachment_watch_v1");\nassert.equal(aliceHuge.delivery.generated_text_document.complete, true);\nassert.equal(aliceHuge.delivery.generated_text_document.extension, "txt");\nassert.equal(aliceHuge.delivery.artifact_text.length, 90_001);\nconsole.log("REG_ALICE_SAFE_LARGE_TEXT_DOCUMENT_RULE_PASS");\n'''
)

print("ALICE_LARGE_RESULT_PATCH_MATERIALIZED")
