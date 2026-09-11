from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist-step7-candidate"
CAP = DIST / "shared" / "ai_delivery_capabilities.js"
WORKER = DIST / "shared" / "file_delivery_port_worker.js"
CONTENT = DIST / "attachment_delivery_port_content.js"


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one replacement target, got {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    CAP,
    '      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),\n      max_file_bytes: 100 * 1024 * 1024,',
    '      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),\n      original_provider_file_type_policy: "runtime_target_verification",\n      max_file_bytes: 100 * 1024 * 1024,'
)

insert_marker = '  function generatedTextDecision(adapterId, text) {'
insert = '''  function fileDispatchDecision(adapterId, descriptor = {}) {\n    const current = profile(adapterId);\n    const staticSupport = supportsFile(adapterId, descriptor);\n    const extension = String(descriptor.extension || extensionFromFilename(descriptor.filename)).toLowerCase();\n    const byteLength = Math.max(0, Number(descriptor.byte_length || descriptor.byteLength || 0));\n    const mimeType = String(descriptor.mime_type || descriptor.mimeType || "").split(";", 1)[0].trim().toLowerCase();\n    const sourceKind = String(descriptor.source_kind || "").trim().toLowerCase();\n    const artifactKey = String(descriptor.artifact_key || "").trim();\n    const sha256 = String(descriptor.sha256 || "").trim().toLowerCase();\n\n    if (!current) return Object.freeze({ ...staticSupport, dispatch_allowed: false, runtime_verification_required: false });\n    if (current.max_file_bytes !== null && current.max_file_bytes !== undefined && Number.isFinite(Number(current.max_file_bytes)) && byteLength > Number(current.max_file_bytes)) {\n      return Object.freeze({ status: "unsupported", supported: false, dispatch_allowed: false, runtime_verification_required: false, reason: "file_too_large_for_adapter", extension, byte_length: byteLength, mime_type: mimeType, source_kind: sourceKind });\n    }\n    if (staticSupport.supported === true) {\n      return Object.freeze({ status: "verified_supported", supported: true, dispatch_allowed: true, runtime_verification_required: false, reason: null, extension, byte_length: byteLength, mime_type: mimeType, source_kind: sourceKind });\n    }\n\n    const runtimePolicy = String(current.original_provider_file_type_policy || "");\n    const integrityBackedOriginalProviderFile = sourceKind === "original_provider_file"\n      && artifactKey.startsWith("provider:")\n      && /^[a-f0-9]{64}$/.test(sha256);\n    const typeIsConcrete = Boolean(extension && extension !== "bin" && mimeType && mimeType !== "application/octet-stream");\n    if (staticSupport.reason === "file_type_not_supported"\n      && runtimePolicy === "runtime_target_verification"\n      && integrityBackedOriginalProviderFile\n      && typeIsConcrete) {\n      return Object.freeze({\n        status: "runtime_verification_required",\n        supported: false,\n        dispatch_allowed: true,\n        runtime_verification_required: true,\n        reason: "target_runtime_verification_required",\n        extension,\n        byte_length: byteLength,\n        mime_type: mimeType,\n        source_kind: sourceKind\n      });\n    }\n    return Object.freeze({ ...staticSupport, dispatch_allowed: false, runtime_verification_required: false, mime_type: mimeType, source_kind: sourceKind });\n  }\n\n'''
replace_once(CAP, insert_marker, insert + insert_marker)

replace_once(
    CAP,
    '    supportsFile,\n    generatedTextDecision',
    '    supportsFile,\n    fileDispatchDecision,\n    generatedTextDecision'
)

replace_once(
    WORKER,
    '      const support = OzonAIDeliveryCapabilities.supportsFile(delivery.adapter_id, record);\n      if (support.supported !== true) throw Object.assign(new Error(`Target AI does not support original attachment type .${record.extension || "unknown"}.`), { code: "TARGET_AI_FILE_TYPE_UNSUPPORTED" });',
    '      const decision = OzonAIDeliveryCapabilities.fileDispatchDecision(delivery.adapter_id, record);\n      if (decision.dispatch_allowed !== true) throw Object.assign(new Error(`Target AI attachment preflight rejected .${record.extension || "unknown"}: ${decision.reason || "unsupported"}.`), { code: "TARGET_AI_FILE_TYPE_UNSUPPORTED" });'
)

replace_once(
    CONTENT,
    '      const support = OzonAIDeliveryCapabilities.supportsFile(active.id, descriptor);\n      if (support.supported !== true) throw Object.assign(new Error(`Target AI cannot attach ${descriptor.filename}.`), { code: "TARGET_AI_FILE_TYPE_UNSUPPORTED" });',
    '      const decision = OzonAIDeliveryCapabilities.fileDispatchDecision(active.id, descriptor);\n      if (decision.dispatch_allowed !== true) throw Object.assign(new Error(`Target AI attachment preflight rejected ${descriptor.filename}: ${decision.reason || "unsupported"}.`), { code: "TARGET_AI_FILE_TYPE_UNSUPPORTED" });'
)

print("ALICE_ORIGINAL_PROVIDER_RUNTIME_CAPABILITY_PATCH_MATERIALIZED")
