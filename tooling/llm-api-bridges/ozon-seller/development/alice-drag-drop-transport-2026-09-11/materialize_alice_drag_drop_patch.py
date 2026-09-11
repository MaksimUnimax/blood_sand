#!/usr/bin/env python3
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DIST = ROOT / "dist-step7-candidate"


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"anchor drift in {path}: expected 1 occurrence, got {count}\nANCHOR:\n{old[:500]}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


# 1) Capability contract: ChatGPT remains file_input_v1; Alice gets its proven first-party body drop transport.
caps = DIST / "shared/ai_delivery_capabilities.js"
replace_once(
    caps,
    '''    alice: Object.freeze({\n      id: "alice",\n      status: "implemented",\n      plain_text_max_chars: ALICE_MAX_SAFE_PLAIN_TEXT_UTF16_CODE_UNITS,\n      plain_text_length_metric: "utf16_code_units",\n      attachments_supported: true,\n      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),\n      max_file_bytes: 100 * 1024 * 1024,\n      max_files_per_turn: 1,\n      attachment_strategy: "file_input_v1"\n    }),''',
    '''    alice: Object.freeze({\n      id: "alice",\n      status: "implemented",\n      plain_text_max_chars: ALICE_MAX_SAFE_PLAIN_TEXT_UTF16_CODE_UNITS,\n      plain_text_length_metric: "utf16_code_units",\n      attachments_supported: true,\n      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),\n      max_file_bytes: 100 * 1024 * 1024,\n      max_files_per_turn: 1,\n      attachment_strategy: "drag_drop_v1"\n    }),'''
)

# 2) Generic browser primitive: exact File/DataTransfer body-level drag/drop with no click/picker.
web = DIST / "shared/web_file_attachment.js"
replace_once(
    web,
    '''  function fileListSnapshot(input) {\n    if (!inputAcceptsFiles(input)) return [];\n    return [...(input.files || [])].map((file) => ({ name: file.name, size: file.size, type: file.type || "" }));\n  }\n''',
    '''  function dispatchFileDrop(target, files) {\n    if (!(target instanceof EventTarget) || !target.isConnected) throw Object.assign(new Error("Target AI drag-drop surface is not connected."), { code: "ATTACHMENT_DROP_TARGET_INVALID" });\n    const list = Array.isArray(files) ? files : [];\n    if (!list.length || list.some((file) => !(file instanceof File))) throw Object.assign(new Error("Attachment file list is empty or invalid."), { code: "ATTACHMENT_FILE_LIST_INVALID" });\n    const transfer = new DataTransfer();\n    for (const file of list) transfer.items.add(file);\n    const actual = [...(transfer.files || [])];\n    if (actual.length !== list.length || actual.some((file, index) => file.name !== list[index].name || file.size !== list[index].size || String(file.type || "") !== String(list[index].type || ""))) {\n      throw Object.assign(new Error("Browser DataTransfer did not preserve the complete attachment set."), { code: "ATTACHMENT_DROP_FILESET_MISMATCH" });\n    }\n    const eventOptions = { bubbles: true, cancelable: true, composed: true, dataTransfer: transfer };\n    for (const type of ["dragenter", "dragover", "drop"]) target.dispatchEvent(new DragEvent(type, eventOptions));\n    return Object.freeze({\n      dispatched: 3,\n      file_count: actual.length,\n      files: Object.freeze(actual.map((file) => Object.freeze({ name: file.name, size: file.size, type: file.type || "" })))\n    });\n  }\n\n  function fileListSnapshot(input) {\n    if (!inputAcceptsFiles(input)) return [];\n    return [...(input.files || [])].map((file) => ({ name: file.name, size: file.size, type: file.type || "" }));\n  }\n'''
)
replace_once(
    web,
    '''    setInputFiles,\n    fileListSnapshot\n''',
    '''    setInputFiles,\n    dispatchFileDrop,\n    fileListSnapshot\n'''
)

# 3) AI adapter: replace the invented persistent Alice input model with the live-evidenced DnD capability marker + body transport.
adapters = DIST / "shared/ai_adapters.js"
text = adapters.read_text(encoding="utf-8")
start = text.index("  function aliceAttachmentScopes() {")
end = text.index("  const CHATGPT_COPY_ANCHORS", start)
replacement = r'''  function aliceComposerShell() {
    const context = aliceComposerContext();
    if (!context?.composer || !(context.root instanceof Element)) return null;
    const standaloneInput = context.composer.closest('.Standalone-Input') || context.root.closest?.('.Standalone-Input') || context.root;
    if (!(standaloneInput instanceof Element)) return null;
    const controls = standaloneInput.querySelector('[data-testid="input-controls-root"]') || context.root.querySelector?.('[data-testid="input-controls-root"]');
    if (!(controls instanceof Element) || !controls.isConnected) return null;
    const plus = controls.querySelector('button[data-testid="InputControls-Plus-Button"][aria-label="Добавить файл"][aria-haspopup="dialog"]');
    if (!(plus instanceof HTMLElement) || !visible(plus) || controlDisabled(plus)) return null;
    if (!(document.body instanceof HTMLElement) || !document.body.isConnected) return null;
    return { context, standaloneInput, controls, plus };
  }

  function aliceAttachmentSurface() {
    const shell = aliceComposerShell();
    if (!shell) return null;
    return { kind: "drag_drop_v1", root: document.body, composer_root: shell.standaloneInput, controls_root: shell.controls, capability_marker: shell.plus };
  }

  function aliceAttachFiles(surface, files) {
    if (surface?.kind !== "drag_drop_v1" || surface.root !== document.body || !surface.root?.isConnected) {
      throw Object.assign(new Error("Alice drag-drop attachment surface is unavailable."), { code: "TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE" });
    }
    const live = aliceAttachmentSurface();
    if (!live || live.root !== surface.root || !surface.capability_marker?.isConnected || live.capability_marker !== surface.capability_marker) {
      throw Object.assign(new Error("Alice drag-drop capability marker changed before attachment dispatch."), { code: "TARGET_AI_ATTACHMENT_SURFACE_CHANGED" });
    }
    const helper = globalThis.OzonWebFileAttachment;
    if (typeof helper?.dispatchFileDrop !== "function") throw Object.assign(new Error("Alice drag-drop browser primitive is unavailable."), { code: "TARGET_AI_ATTACHMENT_TRANSPORT_UNAVAILABLE" });
    return helper.dispatchFileDrop(live.root, files);
  }

  function aliceAttachmentScopes() {
    const shell = aliceComposerShell();
    if (!shell) return [];
    const scopes = [];
    const add = (node) => { if (node instanceof Element && node.isConnected && !scopes.includes(node)) scopes.push(node); };
    add(shell.standaloneInput);
    add(shell.context.root);
    const topControls = shell.standaloneInput.querySelector?.('.StandaloneInput-TopControls');
    add(topControls);
    return scopes;
  }

  function aliceAttachmentPreview(filename) {
    const target = String(filename || "").trim();
    if (!target) return null;
    const matches = [];
    for (const scope of aliceAttachmentScopes()) {
      for (const node of scope.querySelectorAll('*')) {
        if (!(node instanceof HTMLElement) || !node.isConnected) continue;
        const attrs = [
          node.getAttribute('data-filename') || '', node.getAttribute('data-file-name') || '',
          node.getAttribute('aria-label') || '', node.getAttribute('title') || ''
        ].map((value) => String(value).trim()).filter(Boolean);
        const exactAttr = attrs.some((value) => value === target || value.includes(target));
        const nodeText = String(node.textContent || '').replace(/\u00a0/g, ' ').trim();
        const exactText = nodeText === target;
        if (exactAttr || exactText) matches.push(node);
      }
      if (matches.length) break;
    }
    if (!matches.length) return null;
    const leaves = matches.filter((node) => !matches.some((other) => other !== node && node.contains(other)));
    const candidates = leaves.length ? leaves : matches;
    return candidates.length === 1 ? candidates[0] : null;
  }

  function aliceAttachmentStatusText(preview) {
    if (!(preview instanceof HTMLElement)) return "";
    const tokens = [];
    let node = preview;
    for (let depth = 0; node instanceof HTMLElement && depth < 4; depth += 1, node = node.parentElement) {
      tokens.push(node.getAttribute('data-status') || '', node.getAttribute('aria-label') || '', node.getAttribute('title') || '', node.textContent || '');
      if (node.classList?.contains('Standalone-Input')) break;
    }
    return tokens.join(' ').replace(/\u00a0/g, ' ').toLowerCase();
  }

'''
adapters.write_text(text[:start] + replacement + text[end:], encoding="utf-8")

replace_once(
    adapters,
    '''    attachmentSurface() { const input = chatgptFileInput(); return input ? { input, root: input.closest("form") || document.documentElement } : null; },\n    attachmentPreview(filename) { return chatgptAttachmentPreview(filename); },''',
    '''    attachmentSurface() { const input = chatgptFileInput(); return input ? { kind: "file_input_v1", input, root: input.closest("form") || document.documentElement } : null; },\n    attachFiles(surface, files) {\n      if (surface?.kind !== "file_input_v1" || !surface.input?.isConnected) throw Object.assign(new Error("ChatGPT file-input attachment surface is unavailable."), { code: "TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE" });\n      return globalThis.OzonWebFileAttachment.setInputFiles(surface.input, files);\n    },\n    attachmentPreview(filename) { return chatgptAttachmentPreview(filename); },'''
)
replace_once(
    adapters,
    '''    deliveryCapabilities() { return globalThis.OzonAIDeliveryCapabilities?.profile?.("alice") || null; },\n    attachmentSurface() { const input = aliceFileInput(); const context = aliceComposerContext(); return input ? { input, root: context?.root || input.parentElement || document.documentElement } : null; },\n    attachmentPreview(filename) { return aliceAttachmentPreview(filename); },\n    attachmentReady(descriptors) {\n      const list = Array.isArray(descriptors) ? descriptors : [];\n      if (!list.length) return false;\n      return list.every((descriptor) => {\n        const preview = aliceAttachmentPreview(descriptor.filename);\n        if (!preview?.isConnected || !visible(preview) || preview.matches?.('[aria-busy="true"]') || preview.querySelector?.('[aria-busy="true"]')) return false;\n        const status = [preview.getAttribute?.("data-status") || "", preview.getAttribute?.("aria-label") || "", preview.getAttribute?.("title") || ""].join(" ").toLowerCase();\n        return !/uploading|loading|загруз|обработ/.test(status);\n      });\n    },''',
    '''    deliveryCapabilities() { return globalThis.OzonAIDeliveryCapabilities?.profile?.("alice") || null; },\n    attachmentSurface() { return aliceAttachmentSurface(); },\n    attachFiles(surface, files) { return aliceAttachFiles(surface, files); },\n    attachmentPreview(filename) { return aliceAttachmentPreview(filename); },\n    attachmentReady(descriptors) {\n      const list = Array.isArray(descriptors) ? descriptors : [];\n      if (!list.length) return false;\n      return list.every((descriptor) => {\n        const preview = aliceAttachmentPreview(descriptor.filename);\n        if (!preview?.isConnected || !visible(preview) || preview.matches?.('[aria-busy="true"]') || preview.querySelector?.('[aria-busy="true"]')) return false;\n        const status = aliceAttachmentStatusText(preview);\n        return !/uploading|loading|загружа|обработ|ошиб|error|не поддерж|unsupported|failed|сбой/.test(status);\n      });\n    },'''
)

# 4) Generic content port: explicit supported strategy set + adapter-owned transport. Commit-before-mutation stays unchanged.
port = DIST / "attachment_delivery_port_content.js"
replace_once(
    port,
    '''  function assertAttachmentCountSupported(active, descriptors) {\n    const profile = active?.deliveryCapabilities?.() || null;\n''',
    '''  function attachmentStrategySupported(profile) {\n    return ["file_input_v1", "drag_drop_v1"].includes(String(profile?.attachment_strategy || ""));\n  }\n\n  function assertAttachmentCountSupported(active, descriptors) {\n    const profile = active?.deliveryCapabilities?.() || null;\n'''
)
replace_once(
    port,
    '''    if (!profile || profile.attachment_strategy !== "file_input_v1") throw Object.assign(new Error("Target AI has no verified file-input attachment strategy in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });''',
    '''    if (!profile || !attachmentStrategySupported(profile)) throw Object.assign(new Error("Target AI has no verified attachment strategy in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });'''
)
replace_once(
    port,
    '''    const surfaceBeforeCommit = active.attachmentSurface?.();\n    if (!surfaceBeforeCommit?.input) throw Object.assign(new Error("Target AI file-input attachment surface is unavailable."), { code: "TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE" });\n    const commit = await request("OZ_ATTACHMENT_COMMIT", { ...ownerPayload(recovery), actor_id: runtime.id });''',
    '''    const profile = active.deliveryCapabilities?.() || null;\n    if (!profile || !attachmentStrategySupported(profile) || typeof active.attachFiles !== "function") throw Object.assign(new Error("Target AI attachment strategy is unavailable."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });\n    const surfaceBeforeCommit = active.attachmentSurface?.();\n    if (!surfaceBeforeCommit || surfaceBeforeCommit.kind !== profile.attachment_strategy || !surfaceBeforeCommit.root?.isConnected) throw Object.assign(new Error("Target AI attachment surface is unavailable."), { code: "TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE" });\n    const commit = await request("OZ_ATTACHMENT_COMMIT", { ...ownerPayload(recovery), actor_id: runtime.id });'''
)
replace_once(
    port,
    '''    if (!surfaceBeforeCommit.input.isConnected) throw Object.assign(new Error("Target AI attachment input detached after commit; automatic re-attach is forbidden."), { code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY" });\n    OzonWebFileAttachment.setInputFiles(surfaceBeforeCommit.input, files);\n    const ready = await waitAttachmentReady(active, descriptors, ATTACH_READY_TIMEOUT_MS);''',
    '''    if (!surfaceBeforeCommit.root?.isConnected) throw Object.assign(new Error("Target AI attachment surface detached after commit; automatic re-attach is forbidden."), { code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY" });\n    try {\n      active.attachFiles(surfaceBeforeCommit, files);\n    } catch (error) {\n      throw Object.assign(new Error(`Attachment transport outcome is unknown after commit; automatic re-attach is forbidden: ${error?.message || error}`), { code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY", cause: error });\n    }\n    const ready = await waitAttachmentReady(active, descriptors, ATTACH_READY_TIMEOUT_MS);'''
)

# 5) Model policy: both explicitly implemented transports count as live attachment strategies.
policy = DIST / "shared/file_delivery_model_policy.js"
replace_once(
    policy,
    '''  function hasLiveAttachmentStrategy(adapterId) {\n    const profile = globalThis.OzonAIDeliveryCapabilities?.profile?.(adapterId) || null;\n    return Boolean(profile?.status === "implemented" && profile?.attachment_strategy === "file_input_v1");\n  }''',
    '''  function hasLiveAttachmentStrategy(adapterId) {\n    const profile = globalThis.OzonAIDeliveryCapabilities?.profile?.(adapterId) || null;\n    const strategy = String(profile?.attachment_strategy || "");\n    return Boolean(profile?.status === "implemented" && ["file_input_v1", "drag_drop_v1"].includes(strategy));\n  }'''
)

# 6) Worker capability gate: preserve fail-closed semantics while admitting only the two implemented transports.
worker = DIST / "shared/file_delivery_port_worker.js"
replace_once(
    worker,
    '''  function adapterCanAttach(delivery, records) {\n    const profile = OzonAIDeliveryCapabilities.profile(delivery?.adapter_id);\n    if (!profile || profile.status !== "implemented" || profile.attachment_strategy !== "file_input_v1") {\n      throw Object.assign(new Error("Target AI attachment adapter is not implemented/live-profiled in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });\n    }''',
    '''  function adapterCanAttach(delivery, records) {\n    const profile = OzonAIDeliveryCapabilities.profile(delivery?.adapter_id);\n    const strategy = String(profile?.attachment_strategy || "");\n    if (!profile || profile.status !== "implemented" || !["file_input_v1", "drag_drop_v1"].includes(strategy)) {\n      throw Object.assign(new Error("Target AI attachment adapter is not implemented/live-profiled in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });\n    }'''
)

# 7) Active Alice gates: switch from the disproven persistent-input model to the corrective transport contract.
gate1 = ROOT / "validation/alice-large-result-v1/run_alice_large_result_delivery_gate.mjs"
replace_once(gate1, "assert.equal(alice?.attachment_strategy, 'file_input_v1', 'ALICE_ATTACHMENT_STRATEGY_MUST_BE_EXECUTABLE');", "assert.equal(alice?.attachment_strategy, 'drag_drop_v1', 'ALICE_ATTACHMENT_STRATEGY_MUST_BE_DRAG_DROP_V1');")
replace_once(
    gate1,
    '''// Structural guards: oversized Alice delivery must have a real file-input surface and readiness\n// implementation; null/false stubs are prohibited. This remains fail-closed at runtime if no\n// uniquely attributable input/preview can be found.\nassert.doesNotMatch(adaptersSource, /attachmentSurface\\(\\)\\s*\\{\\s*return null;\\s*\\}/, 'ALICE_ATTACHMENT_SURFACE_NULL_STUB_FORBIDDEN');\nassert.doesNotMatch(adaptersSource, /attachmentReady\\(\\)\\s*\\{\\s*return false;\\s*\\}/, 'ALICE_ATTACHMENT_READY_FALSE_STUB_FORBIDDEN');\nassert.match(adaptersSource, /function aliceFileInput\\s*\\(/, 'ALICE_FILE_INPUT_RESOLVER_REQUIRED');\nassert.match(adaptersSource, /function aliceAttachmentPreview\\s*\\(/, 'ALICE_ATTACHMENT_PREVIEW_RESOLVER_REQUIRED');''',
    '''// Structural guards: Alice must use the live-evidenced body drag/drop transport, not an invented\n// persistent composer-local file input. Readiness stays exact-filename and fail-closed.\nassert.doesNotMatch(adaptersSource, /function aliceFileInput\\s*\\(/, 'ALICE_PERSISTENT_FILE_INPUT_MODEL_FORBIDDEN');\nassert.match(adaptersSource, /function aliceAttachmentSurface\\s*\\(/, 'ALICE_DRAG_DROP_SURFACE_REQUIRED');\nassert.match(adaptersSource, /InputControls-Plus-Button/, 'ALICE_LIVE_PLUS_CAPABILITY_MARKER_REQUIRED');\nassert.match(adaptersSource, /function aliceAttachFiles\\s*\\(/, 'ALICE_ADAPTER_OWNED_ATTACHMENT_TRANSPORT_REQUIRED');\nassert.match(adaptersSource, /dispatchFileDrop/, 'ALICE_BODY_DROP_PRIMITIVE_REQUIRED');\nassert.match(adaptersSource, /function aliceAttachmentPreview\\s*\\(/, 'ALICE_ATTACHMENT_PREVIEW_RESOLVER_REQUIRED');'''
)

gate2 = ROOT / "validation/alice-large-result-v1/run_alice_large_result_delivery_gate_v2.mjs"
replace_once(gate2, "assert.equal(alice?.attachment_strategy, 'file_input_v1');", "assert.equal(alice?.attachment_strategy, 'drag_drop_v1');")
replace_once(
    gate2,
    '''assert.match(adapterSource, /function aliceFileInput\\s*\\(/);\nassert.match(adapterSource, /function aliceAttachmentPreview\\s*\\(/);\nassert.match(adapterSource, /imageOnly/);''',
    '''assert.doesNotMatch(adapterSource, /function aliceFileInput\\s*\\(/);\nassert.match(adapterSource, /function aliceAttachmentSurface\\s*\\(/);\nassert.match(adapterSource, /InputControls-Plus-Button/);\nassert.match(adapterSource, /function aliceAttachFiles\\s*\\(/);\nassert.match(adapterSource, /dispatchFileDrop/);\nassert.match(adapterSource, /function aliceAttachmentPreview\\s*\\(/);'''
)

print("ALICE_DRAG_DROP_CORRECTIVE_PATCH_MATERIALIZED")
