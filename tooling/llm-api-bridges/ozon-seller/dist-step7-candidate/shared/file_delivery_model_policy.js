/* global BridgeAutorunModel, OzonAIDeliveryCapabilities */
(() => {
  "use strict";

  const BASE = globalThis.BridgeAutorunModel;
  if (!BASE || typeof BASE.claimDelivery !== "function") throw new Error("BridgeAutorunModel is required before file delivery policy.");

  function successfulReportFileRef(entry) {
    if (!entry || entry.status !== "complete") return null;
    const operation = String(entry?.command?.operation || entry?.operation || "");
    if (operation !== "report_file_get") return null;
    const httpStatus = Number(entry.http_status || 0);
    if (!(httpStatus >= 200 && httpStatus < 300)) return null;
    return String(entry?.command?.params?.file_ref || "").trim() || null;
  }

  function needsCompleteTextCompanion(run, payload, providerFileRefs) {
    if (!Array.isArray(providerFileRefs) || providerFileRefs.length === 0) return false;
    if (payload?.reportPrefixApplied === true) return true;
    const entries = Array.isArray(run?.batch?.entries) ? run.batch.entries : [];
    if (!entries.length) return false;
    return entries.some((entry) => successfulReportFileRef(entry) === null);
  }

  function generatedDocument(deliveryId, text) {
    const value = String(text || "");
    const capabilities = globalThis.OzonAIDeliveryCapabilities;
    return Object.freeze({
      artifact_id: `generated-${String(deliveryId || "")}`,
      filename: `ozon-bridge-result-${String(deliveryId || "")}.txt`,
      mime_type: "text/plain;charset=utf-8",
      extension: "txt",
      unicode_char_length: capabilities?.unicodeLength?.(value) ?? [...value].length,
      byte_length: capabilities?.utf8ByteLength?.(value) ?? new TextEncoder().encode(value).byteLength,
      complete: true,
      materialization_reason: "mixed_batch_companion"
    });
  }

  function claimDelivery(run, payload = {}) {
    const next = BASE.claimDelivery(run, payload);
    if (!next?.delivery || next.delivery.mode !== "attachment_watch_v1") return next;
    const providerFileRefs = Array.isArray(next.delivery.provider_file_refs) ? next.delivery.provider_file_refs : [];
    if (!providerFileRefs.length || next.delivery.generated_text_document) return next;
    if (!needsCompleteTextCompanion(run, payload, providerFileRefs)) return next;

    const completeText = String(payload.outgoingText || "");
    return {
      ...next,
      delivery: {
        ...next.delivery,
        artifact_text: completeText,
        generated_text_document: generatedDocument(next.delivery.delivery_id || payload.deliveryId, completeText)
      }
    };
  }

  globalThis.BridgeAutorunModel = Object.freeze({
    ...BASE,
    claimDelivery,
    successfulReportFileRef,
    needsCompleteTextCompanion
  });
})();
