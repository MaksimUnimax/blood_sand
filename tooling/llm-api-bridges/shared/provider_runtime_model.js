(() => {
  "use strict";

  const STATUS = Object.freeze({
    REQUESTING: "requesting",
    DELIVERING: "delivering",
    COMPLETED: "completed",
    FAILED: "failed"
  });

  function fail(code, message) {
    const error = new Error(message || code);
    error.code = code;
    throw error;
  }
  function text(value, name, max = 512) {
    const out = String(value ?? "").trim();
    if (!out) fail(`MISSING_${name.toUpperCase()}`, `${name} обязателен.`);
    if (out.length > max) fail(`INVALID_${name.toUpperCase()}`, `${name} слишком длинный.`);
    return out;
  }
  function nonNegativeInt(value, name) {
    const n = Number(value ?? 0);
    if (!Number.isInteger(n) || n < 0) fail(`INVALID_${name.toUpperCase()}`, `${name} должен быть целым >= 0.`);
    return n;
  }
  function nowIso(now) {
    const ms = Number(now());
    if (!Number.isFinite(ms)) fail("INVALID_CLOCK", "Clock должен возвращать timestamp.");
    return new Date(ms).toISOString();
  }
  function clone(value) { return structuredClone(value); }
  function isTerminal(op) { return op?.status === STATUS.COMPLETED || op?.status === STATUS.FAILED; }
  function isActive(op) { return op?.status === STATUS.REQUESTING || op?.status === STATUS.DELIVERING; }

  function createRequesting({ operationId, requestId, provider, conversationKey, tabId, commandFingerprint, normalizedCommand, workerSessionId, createdAt }, { now = Date.now } = {}) {
    const at = createdAt || nowIso(now);
    return Object.freeze({
      operation_id: text(operationId, "operation_id"),
      request_id: text(requestId, "request_id"),
      provider: text(provider, "provider", 80),
      conversation_key: text(conversationKey, "conversation_key", 2048),
      tab_id: nonNegativeInt(tabId, "tab_id"),
      command_fingerprint: text(commandFingerprint, "command_fingerprint", 256),
      normalized_command: clone(normalizedCommand ?? {}),
      request_worker_session_id: text(workerSessionId, "worker_session_id"),
      status: STATUS.REQUESTING,
      delivery_id: null,
      report_text: null,
      outgoing_text: null,
      http_status: null,
      elapsed_ms: null,
      last_error: null,
      created_at: at,
      updated_at: at,
      completed_at: null
    });
  }

  function sameRequest(op, { requestId, conversationKey }) {
    return Boolean(op && op.request_id === String(requestId || "").trim() && op.conversation_key === String(conversationKey || "").trim());
  }

  function claim(existing, request, options) {
    if (existing && isActive(existing)) {
      if (sameRequest(existing, request)) return Object.freeze({ granted: false, duplicate: true, code: "REQUEST_DUPLICATE", operation: existing });
      return Object.freeze({ granted: false, duplicate: false, code: "OPERATION_ACTIVE", operation: existing });
    }
    const operation = createRequesting(request, options);
    return Object.freeze({ granted: true, duplicate: false, code: "GRANTED", operation });
  }

  function markDelivering(op, { deliveryId, reportText, outgoingText, httpStatus, elapsedMs }, { now = Date.now } = {}) {
    if (op?.status !== STATUS.REQUESTING) fail("INVALID_TRANSITION", `markDelivering требует requesting, получено ${op?.status}`);
    const report = String(reportText ?? "");
    const outgoing = String(outgoingText ?? report);
    if (!report) fail("EMPTY_REPORT", "report_text пуст.");
    if (!outgoing) fail("EMPTY_OUTGOING", "outgoing_text пуст.");
    return Object.freeze({ ...op,
      status: STATUS.DELIVERING,
      delivery_id: text(deliveryId, "delivery_id"),
      report_text: report,
      outgoing_text: outgoing,
      http_status: Number.isFinite(Number(httpStatus)) ? Number(httpStatus) : null,
      elapsed_ms: Number.isFinite(Number(elapsedMs)) ? Math.max(0, Number(elapsedMs)) : null,
      updated_at: nowIso(now),
      last_error: null
    });
  }

  function markFailed(op, { code, message, outcomeUnknown = false }, { now = Date.now } = {}) {
    if (!op || isTerminal(op)) return op;
    const at = nowIso(now);
    return Object.freeze({ ...op,
      status: STATUS.FAILED,
      last_error: Object.freeze({ code: text(code || "OPERATION_FAILED", "error_code", 160), message: String(message || code || "Operation failed").slice(0, 2000), outcome_unknown: outcomeUnknown === true }),
      updated_at: at,
      completed_at: at
    });
  }

  function markCompleted(op, { confirmedTurnId = null }, { now = Date.now } = {}) {
    if (op?.status === STATUS.COMPLETED) return op;
    if (op?.status !== STATUS.DELIVERING) fail("INVALID_TRANSITION", `markCompleted требует delivering, получено ${op?.status}`);
    const at = nowIso(now);
    return Object.freeze({ ...op,
      status: STATUS.COMPLETED,
      confirmed_user_turn_id: confirmedTurnId === null ? null : String(confirmedTurnId).slice(0, 512),
      updated_at: at,
      completed_at: at,
      last_error: null
    });
  }

  function recoverAfterWorkerStart(op, workerSessionId, { now = Date.now } = {}) {
    if (!op) return Object.freeze({ action: "none", operation: null });
    const currentSession = text(workerSessionId, "worker_session_id");
    if (op.status === STATUS.REQUESTING) {
      if (op.request_worker_session_id === currentSession) return Object.freeze({ action: "same_session_requesting", operation: op });
      const failed = markFailed(op, { code: "REQUEST_OUTCOME_UNKNOWN", message: "Worker restarted while provider request was requesting; automatic replay is forbidden.", outcomeUnknown: true }, { now });
      return Object.freeze({ action: "fail_unknown_request", operation: failed });
    }
    if (op.status === STATUS.DELIVERING) {
      return Object.freeze({ action: "recover_delivery", operation: op, recovery: Object.freeze({
        operation_id: op.operation_id,
        request_id: op.request_id,
        provider: op.provider,
        conversation_key: op.conversation_key,
        delivery_id: op.delivery_id,
        outgoing_text: op.outgoing_text,
        report_text: op.report_text
      }) });
    }
    return Object.freeze({ action: "terminal", operation: op });
  }

  function ownerDecision(op, { candidateTabId, liveOwnerTabId, candidateConversationKey }) {
    if (!isActive(op)) return Object.freeze({ owner: false, reason: "inactive" });
    if (String(candidateConversationKey || "") !== op.conversation_key) return Object.freeze({ owner: false, reason: "conversation_mismatch" });
    const candidate = nonNegativeInt(candidateTabId, "candidate_tab_id");
    if (Number.isInteger(liveOwnerTabId) && liveOwnerTabId >= 0 && liveOwnerTabId !== candidate && liveOwnerTabId === op.tab_id) {
      return Object.freeze({ owner: false, reason: "duplicate_non_owner", rebound: false });
    }
    if (candidate === op.tab_id) return Object.freeze({ owner: true, reason: "current_owner", rebound: false });
    return Object.freeze({ owner: true, reason: "rebound_after_owner_loss", rebound: true });
  }

  function rebindOwner(op, candidateTabId, { now = Date.now } = {}) {
    if (!isActive(op)) fail("OPERATION_NOT_ACTIVE", "Нельзя rebind terminal operation.");
    return Object.freeze({ ...op, tab_id: nonNegativeInt(candidateTabId, "candidate_tab_id"), updated_at: nowIso(now) });
  }

  globalThis.LLMProviderRuntimeModel = Object.freeze({ STATUS, isTerminal, isActive, createRequesting, sameRequest, claim, markDelivering, markFailed, markCompleted,
    recoverAfterWorkerStart, ownerDecision, rebindOwner });
})();
