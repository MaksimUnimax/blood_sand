(() => {
  "use strict";

  const TARGET_AI_IDS = Object.freeze([
    "chatgpt",
    "alice",
    "deepseek",
    "grok",
    "claude",
    "gemini",
    "qwen",
    "kimi"
  ]);

  const CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000;

  const PROFILES = Object.freeze({
    chatgpt: Object.freeze({
      id: "chatgpt",
      status: "implemented",
      plain_text_max_chars: CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS,
      attachments_supported: true,
      accepted_extensions: Object.freeze(["txt", "pdf", "png", "csv", "tsv", "zip", "xls", "xlsx", "docx", "pptx"]),
      max_file_bytes: null,
      max_files_per_turn: null,
      attachment_strategy: "file_input_v1"
    }),
    alice: Object.freeze({
      id: "alice",
      status: "implemented",
      plain_text_max_chars: null,
      attachments_supported: true,
      accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx"]),
      max_file_bytes: 100 * 1024 * 1024,
      max_files_per_turn: 1,
      attachment_strategy: "live_profile_required"
    }),
    deepseek: Object.freeze({ id: "deepseek", status: "planned", plain_text_max_chars: null, attachments_supported: null, accepted_extensions: Object.freeze([]), max_file_bytes: null, max_files_per_turn: null, attachment_strategy: "pending" }),
    grok: Object.freeze({ id: "grok", status: "planned", plain_text_max_chars: null, attachments_supported: true, accepted_extensions: Object.freeze(["txt", "pdf", "csv", "xlsx", "docx", "pptx"]), max_file_bytes: null, max_files_per_turn: null, attachment_strategy: "pending" }),
    claude: Object.freeze({ id: "claude", status: "planned", plain_text_max_chars: null, attachments_supported: true, accepted_extensions: Object.freeze(["txt", "pdf", "csv", "xlsx", "docx", "json", "html", "odt", "rtf", "epub"]), max_file_bytes: null, max_files_per_turn: null, attachment_strategy: "pending" }),
    gemini: Object.freeze({ id: "gemini", status: "planned", plain_text_max_chars: null, attachments_supported: true, accepted_extensions: Object.freeze([]), max_file_bytes: null, max_files_per_turn: null, attachment_strategy: "pending" }),
    qwen: Object.freeze({ id: "qwen", status: "planned", plain_text_max_chars: null, attachments_supported: true, accepted_extensions: Object.freeze(["pdf", "xlsx", "xls"]), max_file_bytes: null, max_files_per_turn: null, attachment_strategy: "pending" }),
    kimi: Object.freeze({ id: "kimi", status: "planned", plain_text_max_chars: null, attachments_supported: true, accepted_extensions: Object.freeze(["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]), max_file_bytes: 100 * 1024 * 1024, max_files_per_turn: 50, attachment_strategy: "pending" })
  });

  function adapterIdForOrigin(origin) {
    let host = "";
    try { host = new URL(String(origin || "")).hostname.toLowerCase(); }
    catch (_) { host = String(origin || "").trim().toLowerCase(); }
    if (["chatgpt.com", "chat.openai.com"].includes(host)) return "chatgpt";
    if (host === "alice.yandex.ru") return "alice";
    return null;
  }

  function profile(adapterId) {
    return PROFILES[String(adapterId || "").trim().toLowerCase()] || null;
  }

  function unicodeLength(value) {
    let count = 0;
    for (const _character of String(value || "")) count += 1;
    return count;
  }

  function utf8ByteLength(value) {
    return new TextEncoder().encode(String(value || "")).byteLength;
  }

  function extensionFromFilename(filename) {
    const base = String(filename || "").split(/[\\/]/).pop() || "";
    const index = base.lastIndexOf(".");
    return index > 0 && index < base.length - 1 ? base.slice(index + 1).toLowerCase() : "";
  }

  function supportsFile(adapterId, descriptor = {}) {
    const current = profile(adapterId);
    if (!current) return Object.freeze({ status: "unsupported_adapter", supported: false, reason: "adapter_unknown" });
    if (current.status !== "implemented") return Object.freeze({ status: "pending", supported: false, reason: "adapter_not_implemented" });
    if (current.attachments_supported !== true) return Object.freeze({ status: "unsupported", supported: false, reason: "attachments_not_supported" });
    const extension = String(descriptor.extension || extensionFromFilename(descriptor.filename)).toLowerCase();
    if (current.accepted_extensions.length && !current.accepted_extensions.includes(extension)) {
      return Object.freeze({ status: "unsupported", supported: false, reason: "file_type_not_supported", extension });
    }
    const byteLength = Math.max(0, Number(descriptor.byte_length || descriptor.byteLength || 0));
    if (current.max_file_bytes !== null && current.max_file_bytes !== undefined && Number.isFinite(Number(current.max_file_bytes)) && byteLength > Number(current.max_file_bytes)) {
      return Object.freeze({ status: "unsupported", supported: false, reason: "file_too_large_for_adapter", extension, byte_length: byteLength });
    }
    return Object.freeze({ status: "supported", supported: true, reason: null, extension, byte_length: byteLength });
  }

  function generatedTextDecision(adapterId, text) {
    const current = profile(adapterId);
    if (!current) return Object.freeze({ representation: "plain_text", threshold_status: "unknown_adapter", unicode_chars: unicodeLength(text), threshold: null });
    const chars = unicodeLength(text);
    const hasThreshold = current.plain_text_max_chars !== null && current.plain_text_max_chars !== undefined && Number.isFinite(Number(current.plain_text_max_chars));
    const threshold = hasThreshold ? Number(current.plain_text_max_chars) : null;
    if (threshold === null) return Object.freeze({ representation: "plain_text", threshold_status: "pending_live_calibration", unicode_chars: chars, threshold: null });
    return Object.freeze({
      representation: chars > threshold ? "text_document" : "plain_text",
      threshold_status: "calibrated",
      unicode_chars: chars,
      threshold
    });
  }

  globalThis.OzonAIDeliveryCapabilities = Object.freeze({
    TARGET_AI_IDS,
    PROFILES,
    CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS,
    adapterIdForOrigin,
    profile,
    unicodeLength,
    utf8ByteLength,
    extensionFromFilename,
    supportsFile,
    generatedTextDecision
  });
})();
