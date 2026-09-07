from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SW = ROOT / 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/service_worker.js'
PT = ROOT / 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js'
MARKER = 'REG_P0_PROVIDER_LIFECYCLE_PATCH_V1'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 occurrence, got {count}')
    return text.replace(old, new, 1)


def replace_count(text, old, new, expected, label):
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'{label}: expected {expected} occurrence(s), got {count}')
    return text.replace(old, new)

sw = SW.read_text(encoding='utf-8')
pt = PT.read_text(encoding='utf-8')
if MARKER in sw and MARKER in pt:
    print('PATCH_ALREADY_APPLIED')
    raise SystemExit(0)

# ---------- service worker lifecycle ----------
sw = replace_once(
    sw,
    'const PROVIDER_QUOTA_ALARM = "ozon-provider-quota-wake-v1";\n',
    'const PROVIDER_QUOTA_ALARM = "ozon-provider-quota-wake-v1";\nconst BATCH_RECOVERY_ALARM = "ozon-batch-recovery-wake-v1";\nconst REG_P0_PROVIDER_LIFECYCLE_PATCH_V1 = true;\n',
    'service-worker constants'
)

old_processors = '''function processAutoBatch(conversationKey, runId) {
  const key = normalizeConversationKey(conversationKey);
  return processBatchQueue({
    conversationKey: key,
    ownerKind: "autorun",
    ownerId: runId,
    getOwner: () => getAutoRun(key),
    mutateOwner: (mutator) => mutateAutoRun(key, mutator),
    ownerMatches: (current) => Boolean(current && current.run_id === runId),
    isCollecting: (current) => Boolean(current && current.status === BridgeAutorunModel.RUN_STATUSES.COLLECTING && current.batch),
    failOwner: (code, message) => markRunError(key, code, message),
    finalizeOwner: (owner, entries) => finalizeAutoBatch(key, runId, entries, owner?.batch || null)
  });
}

function processManualBatch(conversationKey, operationId) {
  const key = normalizeConversationKey(conversationKey);
  return processBatchQueue({
    conversationKey: key,
    ownerKind: "manual",
    ownerId: operationId,
    getOwner: () => getManualOperation(key),
    mutateOwner: (mutator) => mutateManualOperation(key, mutator),
    ownerMatches: (current) => Boolean(current && current.operation_id === operationId),
    isCollecting: (current) => Boolean(current && current.status === MANUAL_OPERATION_STATUSES.REQUESTING && current.batch),
    failOwner: (code, message) => failManualBatch(key, operationId, code, message),
    finalizeOwner: (owner, entries) => finalizeManualBatch(key, operationId, entries, owner?.batch || null)
  });
}
'''
new_processors = old_processors + '''
function batchProcessorFailureCode(error) {
  const code = String(error?.code || error?.name || "BATCH_PROCESSOR_UNCAUGHT").trim();
  return code && code !== "Error" ? code.slice(0, 160) : "BATCH_PROCESSOR_UNCAUGHT";
}

function scheduleBatchRecoveryWake(whenMs = Date.now() + 2000) {
  const when = Math.max(Date.now() + 1, Number(whenMs || 0));
  if (chrome.alarms?.create) {
    try { chrome.alarms.create(BATCH_RECOVERY_ALARM, { when }); return true; } catch (_) {}
  }
  setTimeout(() => { void resumeActiveBatchOperations().catch(() => null); }, Math.max(1, when - Date.now()));
  return false;
}

function launchBatchProcessor(ownerKind, conversationKey, ownerId, source = "unspecified") {
  const key = normalizeConversationKey(conversationKey);
  const kind = String(ownerKind || "");
  const id = String(ownerId || "");
  const promise = kind === "manual" ? processManualBatch(key, id) : processAutoBatch(key, id);
  void Promise.resolve(promise).catch(async (error) => {
    const code = batchProcessorFailureCode(error);
    const message = String(error?.message || error || "Batch processor failed before terminalization.").slice(0, 800);
    await diagnostic("BATCH_PROCESSOR_UNCAUGHT", {
      owner_kind: kind,
      owner_id: id,
      source: String(source || "unspecified").slice(0, 120),
      code
    }, { level: "error" });
    if (kind === "manual") await failManualBatch(key, id, code, message);
    else await markRunError(key, code, message);
  }).catch(() => null);
  return promise;
}

async function resumeActiveBatchOperations() {
  const data = await storageGet([KEYS.MANUAL_OPERATIONS, KEYS.AUTO_RUNS]);
  const manual = data[KEYS.MANUAL_OPERATIONS] && typeof data[KEYS.MANUAL_OPERATIONS] === "object" ? data[KEYS.MANUAL_OPERATIONS] : {};
  const runs = data[KEYS.AUTO_RUNS] && typeof data[KEYS.AUTO_RUNS] === "object" ? data[KEYS.AUTO_RUNS] : {};
  let resumedManual = 0;
  let resumedAuto = 0;
  for (const [conversationKey, operation] of Object.entries(manual)) {
    if (!operation || operation.status !== MANUAL_OPERATION_STATUSES.REQUESTING || !operation.batch) continue;
    launchBatchProcessor("manual", conversationKey, operation.operation_id, "worker_recovery");
    resumedManual += 1;
  }
  for (const [conversationKey, run] of Object.entries(runs)) {
    if (!run || run.status !== BridgeAutorunModel.RUN_STATUSES.COLLECTING || !run.batch) continue;
    launchBatchProcessor("autorun", conversationKey, run.run_id, "worker_recovery");
    resumedAuto += 1;
  }
  if (resumedManual || resumedAuto) {
    await diagnostic("ACTIVE_BATCH_RECOVERY_SCHEDULED", {
      manual_count: resumedManual,
      autorun_count: resumedAuto,
      worker_session_id: WORKER_SESSION_ID
    });
  }
  return { manual_count: resumedManual, autorun_count: resumedAuto };
}
'''
sw = replace_once(sw, old_processors, new_processors, 'batch processors')

old_requesting = '''      if (entry.status === "requesting") {
        const worker = String(owner.batch.request_worker_session_id || "");
        if (worker && worker !== WORKER_SESSION_ID) {
          await failOwner("REQUEST_OUTCOME_UNKNOWN_NO_RETRY", "Service worker перезапустился во время Ozon API request. Исход запроса неизвестен; автоматический повтор запрещён.");
          await diagnostic("REQUEST_RECOVERY_BLOCKED_NO_RETRY", {
            owner_kind: ownerKind,
            owner_id: ownerId,
            queue_index: nextIndex,
            previous_worker_session_id: worker,
            worker_session_id: WORKER_SESSION_ID
          }, { level: "error" });
          return { ok: false, code: "REQUEST_OUTCOME_UNKNOWN_NO_RETRY" };
        }
        return { ok: true, code: "REQUEST_IN_PROGRESS" };
      }
'''
new_requesting = '''      if (entry.status === "requesting") {
        const worker = String(owner.batch.request_worker_session_id || "");
        if (!worker || worker !== WORKER_SESSION_ID) {
          const reason = worker
            ? "Service worker перезапустился во время Ozon API request. Исход запроса неизвестен; автоматический повтор запрещён."
            : "Ozon API request помечен requesting без durable worker owner. Исход запроса неизвестен; автоматический повтор запрещён.";
          await failOwner("REQUEST_OUTCOME_UNKNOWN_NO_RETRY", reason);
          await diagnostic("REQUEST_RECOVERY_BLOCKED_NO_RETRY", {
            owner_kind: ownerKind,
            owner_id: ownerId,
            queue_index: nextIndex,
            previous_worker_session_id: worker || null,
            worker_session_id: WORKER_SESSION_ID,
            missing_worker_owner: !worker
          }, { level: "error" });
          return { ok: false, code: "REQUEST_OUTCOME_UNKNOWN_NO_RETRY" };
        }
        return { ok: true, code: "REQUEST_IN_PROGRESS" };
      }
'''
sw = replace_once(sw, old_requesting, new_requesting, 'requesting recovery')

sw = replace_count(
    sw,
    'setTimeout(() => { void processManualBatch(conversationKey, operation.operation_id); }, 0);',
    'setTimeout(() => { launchBatchProcessor("manual", conversationKey, operation.operation_id, "quota_wake"); }, 0);',
    1,
    'manual quota wake'
)
sw = replace_count(
    sw,
    'setTimeout(() => { void processAutoBatch(conversationKey, run.run_id); }, 0);',
    'setTimeout(() => { launchBatchProcessor("autorun", conversationKey, run.run_id, "quota_wake"); }, 0);',
    1,
    'autorun quota wake'
)
sw = replace_count(
    sw,
    'setTimeout(() => { void processManualBatch(current.conversation_key, current.operation_id); }, 0);',
    'setTimeout(() => { launchBatchProcessor("manual", current.conversation_key, current.operation_id, "content_recovery"); }, 0);',
    1,
    'manual content recovery'
)
sw = replace_once(
    sw,
    '  void processAutoBatch(key, runId);\n  return {\n    ok: true,\n    accepted: true,\n    run_id: runId,',
    '  scheduleBatchRecoveryWake();\n  launchBatchProcessor("autorun", key, runId, "autorun_admission");\n  return {\n    ok: true,\n    accepted: true,\n    run_id: runId,',
    'autorun admission'
)
sw = replace_once(
    sw,
    '  void processManualBatch(key, operationId);\n  return {\n    ok: true,\n    accepted: true,\n    manual_operation_id: operationId,',
    '  scheduleBatchRecoveryWake();\n  launchBatchProcessor("manual", key, operationId, "manual_admission");\n  return {\n    ok: true,\n    accepted: true,\n    manual_operation_id: operationId,',
    'manual admission'
)

old_alarm = '''    if (name === WORK_SESSION_REFRESH_WAKE_ALARM) { void resumeWorkSessionRecoveries(); return; }
    if (name === PROVIDER_QUOTA_ALARM) void resumeProviderQuotaWaits();
'''
new_alarm = '''    if (name === WORK_SESSION_REFRESH_WAKE_ALARM) { void resumeWorkSessionRecoveries(); return; }
    if (name === BATCH_RECOVERY_ALARM) { void resumeActiveBatchOperations().catch(() => null); return; }
    if (name === PROVIDER_QUOTA_ALARM) void resumeProviderQuotaWaits();
'''
sw = replace_once(sw, old_alarm, new_alarm, 'batch recovery alarm listener')
sw = replace_once(
    sw,
    'setTimeout(() => { void resumeProviderQuotaWaits(); void resumeWorkSessionRecoveries(); }, 0);',
    'setTimeout(() => { void resumeProviderQuotaWaits(); void resumeWorkSessionRecoveries(); void resumeActiveBatchOperations().catch(() => null); }, 0);',
    'worker startup recovery'
)

if re.search(r'\bvoid\s+process(?:Manual|Auto)Batch\s*\(', sw):
    raise SystemExit('unmanaged detached batch processor call remains')

# ---------- bounded provider transport ----------
helper_anchor = '''  function normalizedContentType(value) {
    return String(value || "").split(";", 1)[0].trim().toLowerCase();
  }
'''
helper = helper_anchor + '''
  const DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS = 60_000;
  const REG_P0_PROVIDER_LIFECYCLE_PATCH_V1 = true;

  function normalizeProviderTimeoutMs(value) {
    const raw = value === undefined || value === null ? DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS : Number(value);
    if (!Number.isFinite(raw) || raw <= 0) fail("INVALID_PROVIDER_TIMEOUT", "Provider timeout должен быть положительным числом миллисекунд.");
    return Math.max(1, Math.min(300_000, Math.floor(raw)));
  }

  function providerTimeoutError(timeoutMs) {
    const error = new Error(`Ozon provider request превысил deadline ${timeoutMs} ms.`);
    error.code = "PROVIDER_REQUEST_TIMEOUT";
    error.external_request_executed = true;
    error.request_attempted = true;
    error.timeout_ms = timeoutMs;
    return error;
  }

  async function withProviderDeadline(task, timeoutMs = DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS) {
    const ms = normalizeProviderTimeoutMs(timeoutMs);
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    let timer = null;
    let timedOut = false;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        const error = providerTimeoutError(ms);
        reject(error);
        try { controller?.abort(); } catch (_) {}
      }, ms);
    });
    try {
      return await Promise.race([
        Promise.resolve().then(() => task(controller?.signal || null)),
        timeout
      ]);
    } catch (error) {
      if (timedOut && String(error?.code || "") !== "PROVIDER_REQUEST_TIMEOUT") throw providerTimeoutError(ms);
      throw error;
    } finally {
      if (timer !== null) clearTimeout(timer);
    }
  }
'''
pt = replace_once(pt, helper_anchor, helper, 'transport deadline helper')

old_seller_io = '''    const started = now();
    let response;
    try {
      response = await fetchImpl(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" ? undefined : request.body
      });
    } catch (error) {
      const wrapped = new Error(String(error?.message || error || "Provider fetch failed"));
      wrapped.code = "PROVIDER_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }

    const binarySuccess = Boolean(response.ok) && String(request.response_style || "json") === "binary";
    const received = await readResponse(response, { preserveBytes: binarySuccess });
'''
new_seller_io = '''    const started = now();
    let response;
    let received;
    try {
      received = await withProviderDeadline(async (signal) => {
        response = await fetchImpl(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.method === "GET" ? undefined : request.body,
          ...(signal ? { signal } : {})
        });
        const binary = Boolean(response.ok) && String(request.response_style || "json") === "binary";
        return await readResponse(response, { preserveBytes: binary });
      }, timeoutMs);
    } catch (error) {
      if (String(error?.code || "") === "PROVIDER_REQUEST_TIMEOUT") throw error;
      if (response) throw error;
      const wrapped = new Error(String(error?.message || error || "Provider fetch failed"));
      wrapped.code = "PROVIDER_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }

    const binarySuccess = Boolean(response.ok) && String(request.response_style || "json") === "binary";
'''
pt = replace_count(pt, 'async function executeJsonOnce({ fetchImpl, request, now = () => Date.now() }) {', 'async function executeJsonOnce({ fetchImpl, request, now = () => Date.now(), timeoutMs = DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS }) {', 1, 'seller timeout signature')
pt = replace_once(pt, old_seller_io, new_seller_io, 'seller bounded IO')

old_report_io = '''  async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024, parseOptions = {} }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    const trustedUrl = normalizeTrustedReportFileUrl(url);
    const started = now();
    let response;
    try {
      response = await fetchImpl(trustedUrl, {
        method: "GET",
        headers: { Accept: "text/csv,text/plain,application/csv,application/octet-stream,application/zip,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        redirect: "error",
        credentials: "omit"
      });
    } catch (error) {
      const wrapped = new Error(String(error?.message || error || "Report file fetch failed"));
      wrapped.code = "REPORT_FILE_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }
    let received;
    try {
      received = await readResponse(response, { preserveBytes: Boolean(response.ok) });
    } catch (error) {
      throw annotateReportFilePostFetchError(error, response);
    }
'''
new_report_io = '''  async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024, parseOptions = {}, timeoutMs = DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    const trustedUrl = normalizeTrustedReportFileUrl(url);
    const started = now();
    let response;
    let received;
    try {
      received = await withProviderDeadline(async (signal) => {
        response = await fetchImpl(trustedUrl, {
          method: "GET",
          headers: { Accept: "text/csv,text/plain,application/csv,application/octet-stream,application/zip,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
          redirect: "error",
          credentials: "omit",
          ...(signal ? { signal } : {})
        });
        return await readResponse(response, { preserveBytes: Boolean(response.ok) });
      }, timeoutMs);
    } catch (error) {
      if (String(error?.code || "") === "PROVIDER_REQUEST_TIMEOUT") throw error;
      if (response) throw annotateReportFilePostFetchError(error, response);
      const wrapped = new Error(String(error?.message || error || "Report file fetch failed"));
      wrapped.code = "REPORT_FILE_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }
'''
pt = replace_once(pt, old_report_io, new_report_io, 'report bounded IO')

old_perf_sig = 'async function executePerformanceJsonOnce({ fetchImpl, request, now = () => Date.now() }) {'
pt = replace_count(pt, old_perf_sig, 'async function executePerformanceJsonOnce({ fetchImpl, request, now = () => Date.now(), timeoutMs = DEFAULT_PROVIDER_REQUEST_TIMEOUT_MS }) {', 1, 'performance timeout signature')
# Performance IO text is intentionally identical to the original Seller IO block.
pt = replace_once(pt, old_seller_io, new_seller_io, 'performance bounded IO')

SW.write_text(sw, encoding='utf-8')
PT.write_text(pt, encoding='utf-8')
print('REG_P0_PROVIDER_LIFECYCLE_PATCH_APPLIED_PASS')
