/* global BridgeAutorunModel, OzonAIDeliveryCapabilities */
(() => {
  "use strict";

  const BASE = globalThis.BridgeAutorunModel;
  if (!BASE || typeof BASE.claimDelivery !== "function") throw new Error("BridgeAutorunModel is required before file delivery policy.");

  function successfulReportFileRef(entry) {
    if (!entry || entry.status !== "complete") return null;
    const httpStatus = Number(entry.http_status || 0);
    if (!(httpStatus >= 200 && httpStatus < 300)) return null;
    const operation = String(entry?.command?.operation || entry?.operation || "");
    const ref = operation === "report_file_get"
      ? String(entry?.command?.params?.file_ref || "").trim()
      : String(BASE.directInlineFileRefFromReportText?.(entry) || "").trim();
    return /^rpf_[sp]_[A-Za-z0-9_-]+$/.test(ref) ? ref : null;
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

  function legacyTextClaim(run, payload) {
    return {
      ...run,
      status: BASE.RUN_STATUSES.DELIVERING,
      delivery: {
        delivery_id: String(payload.deliveryId || ""),
        phase: BASE.DELIVERY_PHASES.CLAIMED,
        mode: String(payload.mode || "legacy"),
        request_id: String(payload.requestId || ""),
        outgoing_text: String(payload.outgoingText || ""),
        outgoing_hash: String(payload.outgoingHash || ""),
        report_prefix_applied: payload.reportPrefixApplied === true,
        baseline_user_turn_ids: [],
        commit_actor_id: null,
        claimed_at: new Date().toISOString()
      }
    };
  }

  function hasLiveAttachmentStrategy(adapterId) {
    const profile = globalThis.OzonAIDeliveryCapabilities?.profile?.(adapterId) || null;
    return Boolean(profile?.status === "implemented" && profile?.attachment_strategy === "file_input_v1");
  }

  function claimDelivery(run, payload = {}) {
    const next = BASE.claimDelivery(run, payload);
    if (!next?.delivery || next.delivery.mode !== "attachment_watch_v1") return next;

    if (!hasLiveAttachmentStrategy(next.delivery.adapter_id)) {
      if (next.delivery.generated_text_document) return next;
      return legacyTextClaim(run, payload);
    }

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
    needsCompleteTextCompanion,
    hasLiveAttachmentStrategy
  });
})();
