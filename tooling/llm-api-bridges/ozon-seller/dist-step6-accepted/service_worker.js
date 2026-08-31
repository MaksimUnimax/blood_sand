/* global BB2ConversationIdentity, BB2ManualControls, OzonRuntime, OzonCredentials, OzonOperationRegistry, OzonEntitlements, OzonContract, OzonGuidance, OzonWorkSessionModel, BridgeAutorunModel, ProviderTransportCore, OzonProvider */
importScripts("shared/conversation_identity.js", "shared/runtime_names.js", "shared/work_session_model.js", "shared/manual_controls.js", "shared/ozon_credentials.js", "shared/ozon_operation_registry.js", "shared/ozon_entitlements.js", "shared/ozon_contract.js", "shared/ozon_guidance.js", "shared/bridge_autorun_model.js", "shared/provider_transport_core.js", "shared/ozon_provider.js");

const VERSION = "0.1.19";
const CREDENTIAL_BACKUP_FORMAT = "ozon-bridge-credentials-backup";
const CREDENTIAL_BACKUP_VERSION = 2;
const LEGACY_CREDENTIAL_BACKUP_FORMAT = "ozon-bridge-seller-credentials-backup";
const LEGACY_CREDENTIAL_BACKUP_VERSION = 1;
const KEYS = OzonRuntime.STORAGE_KEYS;
const MAX_DIAGNOSTICS = 1500;
const WORKER_SESSION_ID = `worker-${crypto.randomUUID()}`;
let workSessionRuntimeGeneration = `work-runtime-${crypto.randomUUID()}`;
const DEFAULT_AUTO_START_TEXT = OzonRuntime.DEFAULT_AUTO_START_TEXT;
const AI_MODES = new Set(["auto", "chatgpt", "alice"]);
function normalizeAIMode(value) {
  const mode = String(value || "auto").trim().toLowerCase();
  return AI_MODES.has(mode) ? mode : "auto";
}

let bindingWriteLock = Promise.resolve();
let autoRunsWriteLock = Promise.resolve();
let manualOperationsWriteLock = Promise.resolve();
let prefixWriteLock = Promise.resolve();
let startPromptWriteLock = Promise.resolve();
let migrationWriteLock = Promise.resolve();
let diagnosticsWriteLock = Promise.resolve();
let copyProfilesWriteLock = Promise.resolve();
let tabAIModesWriteLock = Promise.resolve();
let providerQuotaWriteLock = Promise.resolve();
let providerResultCacheWriteLock = Promise.resolve();

const PROVIDER_QUOTA_SCHEMA_VERSION = 1;
const PROVIDER_QUOTA_ALARM = "ozon-provider-quota-wake-v1";
const WORK_SESSION_REFRESH_WAKE_ALARM = "ozon-work-session-refresh-wake-v1";
const ANALYTICS_QUOTA_FAMILY = "seller.analytics_data.v1";
const STOCK_TURNOVER_QUOTA_FAMILY = "seller.analytics_turnover_stocks.v1";
const ANALYTICS_MIN_INTERVAL_MS = 60_000;
const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;
const PROVIDER_RESULT_CACHE_SCHEMA_VERSION = 1;
const ANALYTICS_CACHE_TTL_MS = 60_000;

// Reference-parity single-flight: one worker-owned browser delivery attempt per run.
// This is deliberately the same primitive used by Business Bridge 2.0.0.22.
const deliveryAttemptRequests = new Map();
const batchCollectionRequests = new Map();
function singleFlight(map, key, fn) {
  if (map.has(key)) return map.get(key);
  const request = Promise.resolve().then(fn).finally(() => {
    if (map.get(key) === request) map.delete(key);
  });
  map.set(key, request);
  return request;
}

function storageGet(keys) { return chrome.storage.local.get(keys); }
function storageSet(values) { return chrome.storage.local.set(values); }
function storageRemove(keys) { return chrome.storage.local.remove(keys); }
function sessionGet(keys) { return chrome.storage.session.get(keys); }
function sessionSet(values) { return chrome.storage.session.set(values); }

function withProviderQuotaWrite(fn) {
  const next = providerQuotaWriteLock.then(fn, fn);
  providerQuotaWriteLock = next.catch(() => null);
  return next;
}

function withProviderResultCacheWrite(fn) {
  const next = providerResultCacheWriteLock.then(fn, fn);
  providerResultCacheWriteLock = next.catch(() => null);
  return next;
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function sellerQuotaIdentity(rawCredentials) {
  const credentials = OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
  const encoder = new TextEncoder();
  const accountDigest = await crypto.subtle.digest("SHA-256", encoder.encode(`seller-account-v1\0${credentials.clientId}`));
  const revisionDigest = await crypto.subtle.digest("SHA-256", encoder.encode(`seller-credential-v1\0${credentials.clientId}\0${credentials.apiKey}`));
  return Object.freeze({
    account_hash: bytesToHex(accountDigest),
    credential_revision: bytesToHex(revisionDigest)
  });
}

function normalizedProviderResultCacheState(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return {
    schema_version: PROVIDER_RESULT_CACHE_SCHEMA_VERSION,
    accounts: source.accounts && typeof source.accounts === "object" && !Array.isArray(source.accounts) ? { ...source.accounts } : {}
  };
}

function jsonCacheClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeAnalyticsCacheMetadata(value, nowMs = Date.now()) {
  if (!value || typeof value !== "object") return null;
  const storedAt = Math.max(0, Number(value.stored_at || 0));
  const expiresAt = Math.max(0, Number(value.expires_at || 0));
  return Object.freeze({
    hit: value.hit === true,
    profile_id: value.profile_id ? String(value.profile_id).slice(0, 120) : null,
    stored_at: storedAt,
    expires_at: expiresAt,
    age_ms: storedAt ? Math.max(0, Number(nowMs) - storedAt) : 0,
    source_request_id: value.source_request_id ? String(value.source_request_id).slice(0, 200) : null,
    source_physical_command_fingerprint: value.source_physical_command_fingerprint ? String(value.source_physical_command_fingerprint).slice(0, 80) : null,
    cached_metrics: Array.isArray(value.cached_metrics) ? value.cached_metrics.map((metric) => String(metric)) : [],
    requested_metrics: Array.isArray(value.requested_metrics) ? value.requested_metrics.map((metric) => String(metric)) : []
  });
}

function acquisitionPlanning(basePlanning, profile) {
  const base = basePlanning && typeof basePlanning === "object" ? basePlanning : {};
  if (!profile?.applicable) return base;
  return {
    ...base,
    acquisition: {
      profile_id: String(profile.profile_id || "analytics_basic_metrics_v1"),
      prefetch_applied: profile.prefetch_applied === true,
      requested_metrics: Array.isArray(profile.requested_metrics) ? [...profile.requested_metrics] : [],
      physical_metrics: Array.isArray(profile.physical_metrics) ? [...profile.physical_metrics] : []
    }
  };
}

function cachePlanning(basePlanning, cacheMeta) {
  const base = basePlanning && typeof basePlanning === "object" ? basePlanning : {};
  const safe = safeAnalyticsCacheMetadata(cacheMeta);
  return safe ? { ...base, cache: safe } : base;
}

async function readAnalyticsResultCache(command, rawCredentials, nowMs = Date.now()) {
  const normalized = OzonContract.normalizeCommand(command);
  if (normalized.operation !== "analytics_data") return Object.freeze({ hit: false, reason: "operation_not_cacheable" });
  const descriptor = OzonContract.analyticsCoalescingDescriptor(normalized);
  if (!descriptor?.eligible) return Object.freeze({ hit: false, reason: "analytics_not_cacheable" });
  const identity = await sellerQuotaIdentity(rawCredentials);
  const data = await storageGet(KEYS.PROVIDER_RESULT_CACHE);
  const state = normalizedProviderResultCacheState(data[KEYS.PROVIDER_RESULT_CACHE]);
  const account = state.accounts[identity.account_hash];
  const entries = account?.entries && typeof account.entries === "object" && !Array.isArray(account.entries) ? Object.values(account.entries) : [];
  const requestedMetrics = [...descriptor.metrics];
  const candidates = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    if (Number(entry.expires_at || 0) <= Number(nowMs)) continue;
    if (String(entry.compatibility_key || "") !== String(descriptor.compatibility_key || "")) continue;
    const cachedMetrics = Array.isArray(entry.metrics) ? entry.metrics.map((metric) => String(metric)) : [];
    if (!cachedMetrics.length || new Set(cachedMetrics).size !== cachedMetrics.length) continue;
    if (requestedMetrics.some((metric) => !cachedMetrics.includes(metric))) continue;
    try {
      const params = jsonCacheClone(normalized.params);
      params.metrics = cachedMetrics;
      const cachedCommand = OzonContract.normalizeCommand({ operation: "analytics_data", params });
      OzonContract.verifyProviderResponse(cachedCommand, entry.result);
      const projected = OzonContract.projectAnalyticsDataResult(entry.result, cachedMetrics, requestedMetrics);
      candidates.push({ entry, cachedMetrics, projected, extra: cachedMetrics.length - requestedMetrics.length });
    } catch (_) {}
  }
  if (!candidates.length) return Object.freeze({ hit: false, reason: "cache_miss" });
  candidates.sort((a, b) => a.extra - b.extra || Number(b.entry.stored_at || 0) - Number(a.entry.stored_at || 0));
  const chosen = candidates[0];
  const metadata = safeAnalyticsCacheMetadata({
    hit: true,
    profile_id: chosen.entry.profile_id || null,
    stored_at: chosen.entry.stored_at,
    expires_at: chosen.entry.expires_at,
    source_request_id: chosen.entry.source_request_id || null,
    source_physical_command_fingerprint: chosen.entry.source_physical_command_fingerprint || null,
    cached_metrics: chosen.cachedMetrics,
    requested_metrics: requestedMetrics
  }, nowMs);
  return Object.freeze({ hit: true, result: chosen.projected, http_status: Number(chosen.entry.http_status || 200), cache: metadata });
}

async function readAnalyticsResultCacheForCurrentSettings(command) {
  try {
    const settings = await getSettings();
    const normalized = OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: false });
    if (normalized.present !== true) return Object.freeze({ hit: false, reason: "credentials_unavailable" });
    return await readAnalyticsResultCache(command, settings.sellerCredentials);
  } catch (_) {
    return Object.freeze({ hit: false, reason: "cache_read_unavailable" });
  }
}

async function storeAnalyticsResultCache(command, providerResult, rawCredentials, profile = null, nowMs = Date.now()) {
  const normalized = OzonContract.normalizeCommand(command);
  if (normalized.operation !== "analytics_data" || providerResult?.ok !== true || !providerResult?.result) return false;
  const descriptor = OzonContract.analyticsCoalescingDescriptor(normalized);
  if (!descriptor?.eligible) return false;
  OzonContract.verifyProviderResponse(normalized, providerResult.result);
  const identity = await sellerQuotaIdentity(rawCredentials);
  const storedResult = jsonCacheClone(providerResult.result);
  await withProviderResultCacheWrite(async () => {
    const data = await storageGet(KEYS.PROVIDER_RESULT_CACHE);
    const state = normalizedProviderResultCacheState(data[KEYS.PROVIDER_RESULT_CACHE]);
    const currentAccount = state.accounts[identity.account_hash] && typeof state.accounts[identity.account_hash] === "object"
      ? { ...state.accounts[identity.account_hash] }
      : { entries: {} };
    const currentEntries = currentAccount.entries && typeof currentAccount.entries === "object" && !Array.isArray(currentAccount.entries) ? { ...currentAccount.entries } : {};
    for (const [entryId, entry] of Object.entries(currentEntries)) {
      if (!entry || Number(entry.expires_at || 0) <= Number(nowMs)) delete currentEntries[entryId];
    }
    let targetId = null;
    for (const [entryId, entry] of Object.entries(currentEntries)) {
      if (String(entry?.compatibility_key || "") !== String(descriptor.compatibility_key || "")) continue;
      const metrics = Array.isArray(entry?.metrics) ? entry.metrics.map(String) : [];
      if (JSON.stringify(metrics) === JSON.stringify(descriptor.metrics)) { targetId = entryId; break; }
    }
    if (!targetId) targetId = `analytics-${crypto.randomUUID()}`;
    currentEntries[targetId] = {
      compatibility_key: descriptor.compatibility_key,
      compatibility_fingerprint: descriptor.compatibility_fingerprint,
      metrics: [...descriptor.metrics],
      result: storedResult,
      source_request_id: providerResult.request_id ? String(providerResult.request_id).slice(0, 200) : null,
      source_physical_command_fingerprint: providerResult.executed_command_fingerprint ? String(providerResult.executed_command_fingerprint).slice(0, 80) : OzonContract.commandFingerprint(normalized),
      http_status: Number(providerResult.http_status || 200),
      profile_id: profile?.profile_id ? String(profile.profile_id).slice(0, 120) : null,
      stored_at: Number(nowMs),
      expires_at: Number(nowMs) + ANALYTICS_CACHE_TTL_MS
    };
    state.accounts[identity.account_hash] = { entries: currentEntries, updated_at: new Date(Number(nowMs)).toISOString() };
    await storageSet({ [KEYS.PROVIDER_RESULT_CACHE]: state });
  });
  return true;
}

async function storeAnalyticsResultCacheForCurrentSettings(command, providerResult, profile = null) {
  try {
    const settings = await getSettings();
    const normalized = OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: false });
    if (normalized.present !== true) return false;
    return await storeAnalyticsResultCache(command, providerResult, settings.sellerCredentials, profile);
  } catch (_) {
    return false;
  }
}

function normalizedQuotaState(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return {
    schema_version: PROVIDER_QUOTA_SCHEMA_VERSION,
    accounts: source.accounts && typeof source.accounts === "object" && !Array.isArray(source.accounts) ? { ...source.accounts } : {}
  };
}

function parseRetryAfterAt(value, nowMs = Date.now()) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    const seconds = Number(text);
    if (!Number.isFinite(seconds) || seconds < 0) return null;
    return Math.ceil(Number(nowMs) + seconds * 1000);
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? Math.max(Number(nowMs), parsed) : null;
}

function safeQuotaMetadata(value) {
  if (!value || typeof value !== "object") return null;
  return Object.freeze({
    family: String(value.family || ANALYTICS_QUOTA_FAMILY),
    min_interval_ms: Math.max(0, Number(value.min_interval_ms || 0)),
    bridge_launch_safety_ms: ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
    effective_interval_ms: ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
    dispatched_at: Number(value.dispatched_at || 0),
    next_allowed_at: Number(value.next_allowed_at || 0),
    credential_scope_id: String(value.account_hash || "").slice(0, 16) || null,
    credential_revision: String(value.credential_revision || "").slice(0, 16) || null,
    automatic_retry: false
  });
}

async function acquireAnalyticsProviderQuota(rawCredentials, nowMs = Date.now(), familyKey = ANALYTICS_QUOTA_FAMILY) {
  const identity = await sellerQuotaIdentity(rawCredentials);
  return withProviderQuotaWrite(async () => {
    const currentNow = Math.max(Number(nowMs || 0), Date.now());
    const data = await storageGet(KEYS.PROVIDER_QUOTA_STATE);
    const state = normalizedQuotaState(data[KEYS.PROVIDER_QUOTA_STATE]);
    const account = state.accounts[identity.account_hash] && typeof state.accounts[identity.account_hash] === "object"
      ? { ...state.accounts[identity.account_hash] }
      : { credential_revision: identity.credential_revision, families: {} };
    const families = account.families && typeof account.families === "object" ? { ...account.families } : {};
    const family = families[familyKey] && typeof families[familyKey] === "object"
      ? { ...families[familyKey] }
      : {};
    const lastProviderRequestAt = Math.max(0, Number(family.last_provider_request_at || 0));
    const guardedFromLastAttempt = lastProviderRequestAt > 0
      ? lastProviderRequestAt + ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS
      : 0;
    const nextAllowedAt = Math.max(0, Number(family.next_allowed_at || 0), guardedFromLastAttempt);
    if (currentNow < nextAllowedAt) {
      return Object.freeze({
        allowed: false,
        family: familyKey,
        min_interval_ms: ANALYTICS_MIN_INTERVAL_MS,
        bridge_launch_safety_ms: ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
        effective_interval_ms: ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
        account_hash: identity.account_hash,
        credential_revision: identity.credential_revision,
        next_allowed_at: nextAllowedAt,
        wait_ms: nextAllowedAt - currentNow,
        automatic_retry: false
      });
    }
    const dispatchedAt = currentNow;
    const next = dispatchedAt + ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS;
    families[familyKey] = {
      min_interval_ms: ANALYTICS_MIN_INTERVAL_MS,
      bridge_launch_safety_ms: ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
      effective_interval_ms: ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
      last_provider_request_at: dispatchedAt,
      next_allowed_at: next,
      credential_revision: identity.credential_revision,
      updated_at: new Date(dispatchedAt).toISOString()
    };
    state.accounts[identity.account_hash] = {
      credential_revision: identity.credential_revision,
      families,
      updated_at: new Date(dispatchedAt).toISOString()
    };
    await storageSet({ [KEYS.PROVIDER_QUOTA_STATE]: state });
    return Object.freeze({
      allowed: true,
      family: familyKey,
      min_interval_ms: ANALYTICS_MIN_INTERVAL_MS,
      bridge_launch_safety_ms: ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
      effective_interval_ms: ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
      account_hash: identity.account_hash,
      credential_revision: identity.credential_revision,
      dispatched_at: dispatchedAt,
      next_allowed_at: next,
      wait_ms: 0,
      automatic_retry: false
    });
  });
}

async function extendAnalyticsQuotaFromRetryAfter(quotaPermit, retryAfter, nowMs = Date.now()) {
  if (!quotaPermit?.account_hash || !retryAfter) return safeQuotaMetadata(quotaPermit);
  const familyKey = String(quotaPermit.family || ANALYTICS_QUOTA_FAMILY);
  const retryAt = parseRetryAfterAt(retryAfter, nowMs);
  if (!retryAt) return safeQuotaMetadata(quotaPermit);
  return withProviderQuotaWrite(async () => {
    const data = await storageGet(KEYS.PROVIDER_QUOTA_STATE);
    const state = normalizedQuotaState(data[KEYS.PROVIDER_QUOTA_STATE]);
    const account = state.accounts[quotaPermit.account_hash] && typeof state.accounts[quotaPermit.account_hash] === "object"
      ? { ...state.accounts[quotaPermit.account_hash] }
      : { credential_revision: quotaPermit.credential_revision || null, families: {} };
    const families = account.families && typeof account.families === "object" ? { ...account.families } : {};
    const family = families[familyKey] && typeof families[familyKey] === "object"
      ? { ...families[familyKey] }
      : {};
    const effectiveNext = Math.max(Number(family.next_allowed_at || 0), Number(quotaPermit.next_allowed_at || 0), retryAt);
    families[familyKey] = {
      ...family,
      min_interval_ms: ANALYTICS_MIN_INTERVAL_MS,
      bridge_launch_safety_ms: ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
      effective_interval_ms: ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
      last_provider_request_at: Number(family.last_provider_request_at || quotaPermit.dispatched_at || 0),
      next_allowed_at: effectiveNext,
      credential_revision: quotaPermit.credential_revision || family.credential_revision || null,
      retry_after_applied_at: Number(nowMs),
      updated_at: new Date(Number(nowMs)).toISOString()
    };
    state.accounts[quotaPermit.account_hash] = { ...account, families, updated_at: new Date(Number(nowMs)).toISOString() };
    await storageSet({ [KEYS.PROVIDER_QUOTA_STATE]: state });
    return safeQuotaMetadata({ ...quotaPermit, next_allowed_at: effectiveNext });
  });
}

async function prepareProviderQuotaForCommand(command) {
  const normalized = OzonContract.normalizeCommand(command);
  const preflight = OzonContract.preflightExecution(normalized);
  if (String(preflight.meta.provider || "seller_api") !== "seller_api") {
    return Object.freeze({ required: false, allowed: true, quota: null });
  }
  const quotaFamily = normalized.operation === "analytics_data"
    ? ANALYTICS_QUOTA_FAMILY
    : (normalized.operation === "stock_turnover_analytics" ? STOCK_TURNOVER_QUOTA_FAMILY : null);
  if (!quotaFamily) return Object.freeze({ required: false, allowed: true, quota: null });
  let settings;
  try { settings = await getSettings(); }
  catch (_) { return Object.freeze({ required: true, allowed: true, quota: null, scheduler_skipped: "credentials_unavailable" }); }
  let present = false;
  try { present = OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: false }).present === true; }
  catch (_) { present = false; }
  if (!present) return Object.freeze({ required: true, allowed: true, quota: null, scheduler_skipped: "credentials_unavailable" });
  try {
    const permit = await acquireAnalyticsProviderQuota(settings.sellerCredentials, Date.now(), quotaFamily);
    return Object.freeze({ required: true, allowed: permit.allowed === true, quota: permit });
  } catch (error) {
    const blocked = Object.assign(new Error("Persistent provider quota state недоступен; rate-limited Seller provider request заблокирован до восстановления scheduler state."), {
      code: "PROVIDER_QUOTA_STATE_UNAVAILABLE",
      external_request_executed: false,
      scheduler_cause_code: String(error?.code || error?.name || "QUOTA_STATE_ERROR").slice(0, 160)
    });
    return Object.freeze({ required: true, allowed: false, quota: null, error: blocked });
  }
}

function scheduleProviderQuotaWake(whenMs) {
  const when = Math.max(Date.now() + 1, Number(whenMs || 0));
  if (chrome.alarms?.create) {
    try { chrome.alarms.create(PROVIDER_QUOTA_ALARM, { when }); return; } catch (_) {}
  }
  setTimeout(() => { void resumeProviderQuotaWaits(); }, Math.max(1, when - Date.now()));
}

async function resumeProviderQuotaWaits() {
  const data = await storageGet([KEYS.MANUAL_OPERATIONS, KEYS.AUTO_RUNS]);
  const now = Date.now();
  let earliest = null;
  const manual = data[KEYS.MANUAL_OPERATIONS] && typeof data[KEYS.MANUAL_OPERATIONS] === "object" ? data[KEYS.MANUAL_OPERATIONS] : {};
  const runs = data[KEYS.AUTO_RUNS] && typeof data[KEYS.AUTO_RUNS] === "object" ? data[KEYS.AUTO_RUNS] : {};
  for (const [conversationKey, operation] of Object.entries(manual)) {
    const wait = operation?.batch?.request_state === "quota_waiting" ? Number(operation.batch?.quota_wait?.next_allowed_at || 0) : 0;
    if (!wait) continue;
    if (wait <= now) setTimeout(() => { void processManualBatch(conversationKey, operation.operation_id); }, 0);
    else earliest = earliest === null ? wait : Math.min(earliest, wait);
  }
  for (const [conversationKey, run] of Object.entries(runs)) {
    const wait = run?.batch?.request_state === "quota_waiting" ? Number(run.batch?.quota_wait?.next_allowed_at || 0) : 0;
    if (!wait) continue;
    if (wait <= now) setTimeout(() => { void processAutoBatch(conversationKey, run.run_id); }, 0);
    else earliest = earliest === null ? wait : Math.min(earliest, wait);
  }
  if (earliest !== null) scheduleProviderQuotaWake(earliest);
}

function withTabAIModesWrite(fn) {
  const next = tabAIModesWriteLock.then(fn, fn);
  tabAIModesWriteLock = next.catch(() => null);
  return next;
}

async function getTabAIMode(tabId) {
  const tab = normalizeTabId(tabId);
  const data = await sessionGet(KEYS.AI_TAB_MODES);
  const modes = data[KEYS.AI_TAB_MODES] && typeof data[KEYS.AI_TAB_MODES] === "object" ? data[KEYS.AI_TAB_MODES] : {};
  return normalizeAIMode(modes[String(tab)]);
}

async function setTabAIMode(tabId, value) {
  const tab = normalizeTabId(tabId);
  const mode = normalizeAIMode(value);
  return withTabAIModesWrite(async () => {
    const data = await sessionGet(KEYS.AI_TAB_MODES);
    const modes = { ...(data[KEYS.AI_TAB_MODES] && typeof data[KEYS.AI_TAB_MODES] === "object" ? data[KEYS.AI_TAB_MODES] : {}) };
    if (mode === "auto") delete modes[String(tab)];
    else modes[String(tab)] = mode;
    await sessionSet({ [KEYS.AI_TAB_MODES]: modes });
    return mode;
  });
}

async function clearTabAIMode(tabId) {
  const tab = normalizeTabId(tabId);
  return withTabAIModesWrite(async () => {
    const data = await sessionGet(KEYS.AI_TAB_MODES);
    const modes = { ...(data[KEYS.AI_TAB_MODES] && typeof data[KEYS.AI_TAB_MODES] === "object" ? data[KEYS.AI_TAB_MODES] : {}) };
    if (!Object.prototype.hasOwnProperty.call(modes, String(tab))) return false;
    delete modes[String(tab)];
    await sessionSet({ [KEYS.AI_TAB_MODES]: modes });
    return true;
  });
}

async function detectedAIForTab(tabId) {
  const tab = await chrome.tabs.get(normalizeTabId(tabId));
  let origin = "";
  try { origin = new URL(String(tab?.url || "")).origin.toLowerCase(); } catch (_) {}
  return { tab, origin, ai_id: BB2ConversationIdentity.providerForOrigin(origin) };
}
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function withDiagnosticsWrite(fn) {
  const next = diagnosticsWriteLock.then(fn, fn);
  diagnosticsWriteLock = next.catch(() => null);
  return next;
}

function withCopyProfilesWrite(fn) {
  const next = copyProfilesWriteLock.then(fn, fn);
  copyProfilesWriteLock = next.catch(() => null);
  return next;
}

function copyProfileCollection(raw) {
  return BB2ManualControls.normalizeCopyButtonProfileCollection(raw);
}

async function getCopyButtonProfiles() {
  const data = await storageGet(KEYS.COPY_BUTTON_PROFILES);
  return copyProfileCollection(data[KEYS.COPY_BUTTON_PROFILES] || null);
}

async function broadcastCopyButtonProfiles(collection) {
  const normalized = copyProfileCollection(collection);
  const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*", "https://alice.yandex.ru/*"] }).catch(() => []);
  await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "OZ_SET_COPY_BUTTON_PROFILES", profiles: normalized }).catch(() => null) : null));
  return normalized;
}

async function saveCopyButtonProfile(profile) {
  const normalized = BB2ManualControls.normalizeCopyButtonProfile(profile);
  if (!normalized) throw Object.assign(new Error("Invalid Copy button profile."), { code: "INVALID_COPY_BUTTON_PROFILE" });
  return withCopyProfilesWrite(async () => {
    const current = await getCopyButtonProfiles();
    const key = BB2ManualControls.copyButtonProfileKey(normalized);
    const currentKeys = new Set(current.profiles.map(BB2ManualControls.copyButtonProfileKey));
    const profiles = currentKeys.has(key) ? current.profiles : [...current.profiles, normalized];
    if (profiles.length > BB2ManualControls.MAX_CUSTOM_COPY_BUTTON_PROFILES) {
      throw Object.assign(new Error(`Достигнут безопасный предел ${BB2ManualControls.MAX_CUSTOM_COPY_BUTTON_PROFILES} пользовательских Copy-профилей.`), { code: "COPY_PROFILE_LIMIT" });
    }
    const merged = copyProfileCollection({ kind: "bb2_manual_copy_profiles_v2", profiles });
    await storageSet({ [KEYS.COPY_BUTTON_PROFILES]: merged });
    await broadcastCopyButtonProfiles(merged);
    return merged;
  });
}

async function clearCopyButtonProfiles() {
  return withCopyProfilesWrite(async () => {
    const empty = copyProfileCollection(null);
    await storageSet({ [KEYS.COPY_BUTTON_PROFILES]: empty });
    await broadcastCopyButtonProfiles(empty);
    return empty;
  });
}

function sanitizeDiagnosticValue(value, key = "", depth = 0) {
  const lower = String(key || "").toLowerCase();
  if (["token", "authorization", "api_key", "api-key", "client_id", "client-id", "clientid", "prompt_text", "report_text", "outgoing_text", "body", "credential"].includes(lower) || lower.includes("token") || lower.includes("secret") || lower.includes("api_key") || lower.includes("api-key") || lower.includes("client_id") || lower.includes("client-id") || lower.includes("clientid")) {
    return undefined;
  }
  if (depth > 4) return "[depth-limited]";
  if (typeof value === "string") return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  if (value === null || ["number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizeDiagnosticValue(item, "", depth + 1)).filter((item) => item !== undefined);
  if (typeof value === "object") {
    const result = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      const safe = sanitizeDiagnosticValue(childValue, childKey, depth + 1);
      if (safe !== undefined) result[childKey] = safe;
    }
    return result;
  }
  return String(value);
}

function safeDiagnosticDetails(details = {}) {
  return sanitizeDiagnosticValue(details, "", 0) || {};
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function canonicalBackupValue(value) {
  if (Array.isArray(value)) return value.map(canonicalBackupValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalBackupValue(value[key])]));
  }
  return value;
}

async function exportCredentialsBackup() {
  const settings = await getSettings();
  const seller = OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: false });
  const performance = OzonCredentials.normalizePerformanceCredentials(settings.performanceCredentials, { required: false });
  if (!seller.present && !performance.present) {
    throw Object.assign(new Error("Нет сохранённых Ozon credentials для экспорта."), { code: "NO_CREDENTIALS_TO_EXPORT" });
  }
  const payload = {
    seller_client_id: seller.clientId,
    seller_api_key: seller.apiKey,
    performance_client_id: performance.clientId,
    performance_client_secret: performance.clientSecret
  };
  return {
    format: CREDENTIAL_BACKUP_FORMAT,
    backup_version: CREDENTIAL_BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    extension_version: VERSION,
    extension_id: chrome.runtime.id || null,
    contains_secrets: true,
    credentials_sha256: await sha256Hex(JSON.stringify(canonicalBackupValue(payload))),
    credentials: payload
  };
}

async function verifyBackupChecksum(backup) {
  if (backup.contains_secrets !== true) {
    throw Object.assign(new Error("Backup credentials не помечен как secret-bearing."), { code: "INVALID_CREDENTIAL_BACKUP" });
  }
  const incoming = backup.credentials;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    throw Object.assign(new Error("Backup не содержит credentials object."), { code: "INVALID_CREDENTIAL_BACKUP" });
  }
  const expectedHash = String(backup.credentials_sha256 || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(expectedHash)) {
    throw Object.assign(new Error("Backup не содержит корректную SHA-256 checksum."), { code: "INVALID_CREDENTIAL_BACKUP_CHECKSUM" });
  }
  const actualHash = await sha256Hex(JSON.stringify(canonicalBackupValue(incoming)));
  if (actualHash !== expectedHash) {
    throw Object.assign(new Error("Контрольная сумма backup credentials не совпала."), { code: "CREDENTIAL_BACKUP_CHECKSUM_MISMATCH" });
  }
  return incoming;
}

async function importCredentialsBackup(backup) {
  const isLegacy = backup?.format === LEGACY_CREDENTIAL_BACKUP_FORMAT && Number(backup?.backup_version || 0) === LEGACY_CREDENTIAL_BACKUP_VERSION;
  const isCurrent = backup?.format === CREDENTIAL_BACKUP_FORMAT && Number(backup?.backup_version || 0) === CREDENTIAL_BACKUP_VERSION;
  if (!isLegacy && !isCurrent) {
    throw Object.assign(new Error("Это не поддерживаемый backup Ozon Bridge credentials."), { code: "INVALID_CREDENTIAL_BACKUP" });
  }
  const incoming = await verifyBackupChecksum(backup);
  if (isLegacy) {
    const seller = OzonCredentials.normalizeSellerCredentials({
      clientId: incoming.seller_client_id,
      apiKey: incoming.seller_api_key
    }, { required: true });
    await storageSet({
      [KEYS.SELLER_CLIENT_ID]: seller.clientId,
      [KEYS.SELLER_API_KEY]: seller.apiKey
    });
    await setStatus({ ok: true, code: "CREDENTIALS_IMPORTED", message: "Legacy Seller credentials импортированы; существующие Performance credentials не изменялись." });
    const settings = await getSettings();
    return {
      ...OzonCredentials.publicCredentialState(settings.sellerCredentials),
      ...OzonCredentials.publicPerformanceCredentialState(settings.performanceCredentials),
      legacy_import: true
    };
  }

  const seller = OzonCredentials.normalizeSellerCredentials({
    clientId: incoming.seller_client_id,
    apiKey: incoming.seller_api_key
  }, { required: false });
  const performance = OzonCredentials.normalizePerformanceCredentials({
    clientId: incoming.performance_client_id,
    clientSecret: incoming.performance_client_secret
  }, { required: false });
  if (!seller.present && !performance.present) {
    throw Object.assign(new Error("Backup не содержит ни одной полной пары Ozon credentials."), { code: "INVALID_CREDENTIAL_BACKUP" });
  }
  await storageSet({
    [KEYS.SELLER_CLIENT_ID]: seller.clientId,
    [KEYS.SELLER_API_KEY]: seller.apiKey,
    [KEYS.PERFORMANCE_CLIENT_ID]: performance.clientId,
    [KEYS.PERFORMANCE_CLIENT_SECRET]: performance.clientSecret
  });
  OzonProvider.clearPerformanceToken();
  await setStatus({ ok: true, code: "CREDENTIALS_IMPORTED", message: "Seller + Performance credentials импортированы из проверенного локального backup." });
  return {
    ...OzonCredentials.publicCredentialState(seller),
    ...OzonCredentials.publicPerformanceCredentialState(performance),
    legacy_import: false
  };
}

async function diagnostic(event, details = {}, options = {}) {
  try {
    return await withDiagnosticsWrite(async () => {
      const current = await storageGet([KEYS.DIAGNOSTICS, KEYS.DIAGNOSTIC_SEQ]);
      const list = Array.isArray(current[KEYS.DIAGNOSTICS]) ? current[KEYS.DIAGNOSTICS] : [];
      const sequence = Math.max(0, Number(current[KEYS.DIAGNOSTIC_SEQ] || 0)) + 1;
      const safe = safeDiagnosticDetails(details);
      const record = {
        sequence,
        event_id: `event-${sequence}-${crypto.randomUUID()}`,
        at: new Date().toISOString(),
        runtime_version: VERSION,
        source: String(options.source || safe.source || "service_worker"),
        level: String(options.level || safe.level || "info"),
        event: String(event || "UNKNOWN_EVENT"),
        ...safe
      };
      list.push(record);
      await storageSet({
        [KEYS.DIAGNOSTICS]: list.slice(-MAX_DIAGNOSTICS),
        [KEYS.DIAGNOSTIC_SEQ]: sequence
      });
      return record;
    });
  } catch (_) {
    return null;
  }
}

function normalizeConversationKey(value) {
  const key = String(value || "").trim();
  if (!key || key.length > 300) {
    throw Object.assign(new Error("Не удалось определить текущий AI-диалог."), { code: "INVALID_CONVERSATION_KEY" });
  }
  return key;
}

function normalizeTabId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error("Не удалось определить вкладку поддерживаемого AI."), { code: "INVALID_TAB_ID" });
  return id;
}

function normalizeIdentity(identity) {
  const origin = String(identity?.origin || "").trim().toLowerCase();
  const aiId = BB2ConversationIdentity.providerForOrigin(origin);
  const conversationId = identity?.conversation_id ? String(identity.conversation_id).trim().toLowerCase() : null;
  const status = String(identity?.status || (conversationId ? "confirmed" : "unknown"));
  if (!aiId) {
    throw Object.assign(new Error("Origin не принадлежит поддерживаемому AI (ChatGPT/Alice)."), { code: "INVALID_AI_ORIGIN" });
  }
  if (status === "conflict") {
    throw Object.assign(new Error("Path и canonical указывают на разные AI-диалоги. Autorun заблокирован fail-closed."), { code: "CONVERSATION_IDENTITY_CONFLICT" });
  }
  if (identity?.ai_id && String(identity.ai_id) !== aiId) {
    throw Object.assign(new Error("AI adapter identity не совпадает с origin."), { code: "AI_IDENTITY_MISMATCH" });
  }
  return {
    origin,
    ai_id: aiId,
    conversation_id: conversationId,
    status: conversationId ? "confirmed" : "unknown",
    source: String(identity?.source || "none"),
    chat_path: String(identity?.chat_path || "")
  };
}

function conversationKeyFromIdentity(identity) {
  const normalized = normalizeIdentity(identity);
  if (!normalized.conversation_id) return null;
  return `${normalized.origin}|${normalized.conversation_id}`;
}

function expectedDeliveryConfirmationBasis(origin) {
  const provider = BB2ConversationIdentity.providerForOrigin(String(origin || "").toLowerCase());
  if (provider === "chatgpt") return "microphone";
  if (provider === "alice") return "alice_ready";
  return "";
}

function acceptedDeliveryConfirmationBasis(origin, basis) {
  const received = String(basis || "");
  if (received === expectedDeliveryConfirmationBasis(origin)) return true;
  return BB2ConversationIdentity.providerForOrigin(String(origin || "").toLowerCase()) === "chatgpt"
    && received === "work_submit_disabled_after_click";
}

function legacyConversationKey(identity) {
  const normalized = normalizeIdentity(identity);
  return normalized.ai_id === "chatgpt" && normalized.conversation_id ? `chatgpt:c:${normalized.conversation_id}` : null;
}

function sameConversationIdentity(a, b) {
  const left = normalizeIdentity(a);
  const right = normalizeIdentity(b);
  return Boolean(left.conversation_id && right.conversation_id && left.origin === right.origin && left.conversation_id === right.conversation_id);
}

async function tabIdentity(tabId) {
  const tab = normalizeTabId(tabId);
  const response = await tabMessage(tab, { type: "OZ_GET_IDENTITY" });
  if (!response?.ok || !response.identity) {
    throw Object.assign(new Error(response?.error || "Не удалось прочитать identity AI-диалога."), { code: response?.code || "IDENTITY_UNAVAILABLE" });
  }
  return normalizeIdentity(response.identity);
}

async function assertTabConversation(tabId, conversationKey, expectedConversationId = null) {
  const key = normalizeConversationKey(conversationKey);
  const identity = await tabIdentity(tabId);
  const liveKey = conversationKeyFromIdentity(identity);
  if (!liveKey || liveKey !== key) {
    throw Object.assign(new Error("Привязанная вкладка открыта на другом или неподтверждённом AI-диалоге."), { code: "CONVERSATION_MISMATCH" });
  }
  if (expectedConversationId && identity.conversation_id !== String(expectedConversationId).toLowerCase()) {
    throw Object.assign(new Error("Conversation ID вкладки не совпадает с owner-run."), { code: "CONVERSATION_MISMATCH" });
  }
  return identity;
}

function withBindingWrite(fn) {
  const next = bindingWriteLock.then(fn, fn);
  bindingWriteLock = next.catch(() => null);
  return next;
}

async function getConversationBindings() {
  const data = await storageGet(KEYS.CONVERSATION_BINDINGS);
  return { ...(data[KEYS.CONVERSATION_BINDINGS] || {}) };
}

async function getWorkSessions() { const data = await storageGet(KEYS.WORK_SESSIONS); return { ...(data[KEYS.WORK_SESSIONS] || {}) }; }
async function getPendingWorkStarts() { const data = await storageGet(KEYS.PENDING_WORK_STARTS); return { ...(data[KEYS.PENDING_WORK_STARTS] || {}) }; }
async function getWorkRecoveries() { const data = await storageGet(KEYS.WORK_SESSION_RECOVERIES); return { ...(data[KEYS.WORK_SESSION_RECOVERIES] || {}) }; }
async function workSessionFor(key) { const sessions = await getWorkSessions(); return OzonWorkSessionModel.normalize(sessions[key], key); }
function transitionWorkSessionRecord(sessions, key, expectedRevision, nextState, patch = {}) {
  const current = OzonWorkSessionModel.normalize(sessions[key], key);
  if (expectedRevision !== null && Number(expectedRevision) !== current.revision) {
    throw Object.assign(new Error("Устаревшее событие work-session проигнорировано."), { code: "WORK_SESSION_STALE_EVENT" });
  }
  const next = OzonWorkSessionModel.transition(current, nextState, { ...patch, conversation_key: key });
  sessions[key] = next;
  return next;
}
async function mutateWorkSession(key, expectedRevision, nextState, patch = {}) {
  return withBindingWrite(async () => {
    const sessions = await getWorkSessions();
    const next = transitionWorkSessionRecord(sessions, key, expectedRevision, nextState, patch);
    await storageSet({ [KEYS.WORK_SESSIONS]: sessions });
    return next;
  });
}
async function retireWorkSession(key) { return mutateWorkSession(key, null, OzonWorkSessionModel.STATES.FINISHING).then((session) => mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.INACTIVE)); }
async function createPendingWorkStart(tab, identity) {
  const pending = await getPendingWorkStarts();
  const slot = String(tab);
  const now = new Date().toISOString();
  const existing = pending[slot] || null;
  if (existing) {
    const sameSurface = existing.origin === identity.origin && existing.ai_id === identity.ai_id;
    const unexpired = String(existing.expires_at || "") > now;
    if (sameSurface && unexpired) return { duplicate: true, transaction: existing };
    delete pending[slot];
    await storageSet({ [KEYS.PENDING_WORK_STARTS]: pending });
    await diagnostic("WORK_PENDING_START_STALE_RETIRED", { tab_id: tab, reason: unexpired ? "surface_changed" : "expired", external_request_executed: false });
  }
  const transaction = { version: 1, state: OzonWorkSessionModel.STATES.PENDING_IDENTITY, intent_id: `work-start-${crypto.randomUUID()}`, revision: 1, tab_id: tab, origin: identity.origin, ai_id: identity.ai_id, created_at: now, expires_at: new Date(Date.now() + 120000).toISOString(), prompt_delivered: false, observed_conversation_id: null, first_response_complete: false };
  pending[slot] = transaction;
  await storageSet({ [KEYS.PENDING_WORK_STARTS]: pending });
  return { duplicate: false, transaction };
}

async function clearPendingWorkStart(tab, intentId, revision, reason) {
  const starts = await getPendingWorkStarts();
  const slot = String(tab);
  const current = starts[slot] || null;
  if (!current || current.intent_id !== String(intentId || "") || Number(current.revision) !== Number(revision)) return false;
  delete starts[slot];
  await storageSet({ [KEYS.PENDING_WORK_STARTS]: starts });
  await diagnostic("WORK_PENDING_START_TERMINAL", { tab_id: tab, intent_id: current.intent_id, revision: current.revision, reason: String(reason || "terminal"), external_request_executed: false });
  return true;
}
async function terminalizeRefreshOperation(key) {
  const operation = await getManualOperation(key);
  if (!operation || !manualOperationActive(operation)) return { operation_id: null, phase: "none", provider_dispatched: false, delivery_preserved: false };

  if (operation.status === MANUAL_OPERATION_STATUSES.DELIVERING) {
    return {
      operation_id: operation.operation_id,
      phase: `delivery:${String(operation.delivery?.phase || "unknown")}`,
      provider_dispatched: true,
      provider_result_durable: true,
      delivery_preserved: true,
      delivery_id: operation.delivery?.delivery_id || operation.delivery_id || null
    };
  }

  const requestState = String(operation.batch?.request_state || "idle");
  const entries = Array.isArray(operation.batch?.entries) ? operation.batch.entries : [];
  const requestInFlight = requestState === "requesting" || entries.some((entry) => entry?.status === "requesting");
  const code = requestInFlight ? "REQUEST_OUTCOME_UNKNOWN_NO_RETRY" : "OPERATOR_REFRESH_BEFORE_PROVIDER";
  const message = requestInFlight
    ? "Refresh выполнен во время provider request: исход запроса неизвестен; автоматический повтор запрещён."
    : requestState === "quota_waiting"
      ? "Refresh отменил только текущую logical operation во время quota wait. Глобальные quota timers/state сохранены; автоматическое продолжение этой operation запрещено."
      : "Refresh отменил текущую logical operation до следующего provider dispatch.";

  await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operation.operation_id) return current;
    return {
      ...current,
      status: MANUAL_OPERATION_STATUSES.FAILED,
      request_worker_session_id: null,
      completed_at: new Date().toISOString(),
      last_error: { code, message, at: new Date().toISOString() },
      batch: current.batch ? {
        ...current.batch,
        request_state: requestInFlight ? "outcome_unknown" : "terminal",
        request_worker_session_id: null
      } : current.batch
    };
  });
  return { operation_id: operation.operation_id, phase: requestState, provider_dispatched: requestInFlight, delivery_preserved: false, code };
}

async function terminalizeFinishOperation(key) {
  const operation = await getManualOperation(key);
  if (!operation || !manualOperationActive(operation)) return { operation_id: null, code: null, provider_dispatched: false };
  const requestState = String(operation.batch?.request_state || "idle");
  const entries = Array.isArray(operation.batch?.entries) ? operation.batch.entries : [];
  const requestInFlight = operation.status === MANUAL_OPERATION_STATUSES.REQUESTING && (requestState === "requesting" || entries.some((entry) => entry?.status === "requesting"));
  const deliveryPending = operation.status === MANUAL_OPERATION_STATUSES.DELIVERING;
  const code = requestInFlight ? "REQUEST_OUTCOME_UNKNOWN_NO_RETRY" : (deliveryPending ? "OPERATOR_FINISH_DELIVERY_ABANDONED" : "OPERATOR_FINISH_BEFORE_PROVIDER");
  const message = requestInFlight
    ? "Finish выполнен во время provider request: исход неизвестен; автоматический повтор запрещён."
    : deliveryPending
      ? "Finish завершил work-session после сохранения provider result; недоставленный результат не будет автоматически replay-иться."
      : "Finish отменил текущую logical operation до provider dispatch.";
  await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operation.operation_id) return current;
    return {
      ...current,
      status: MANUAL_OPERATION_STATUSES.FAILED,
      request_worker_session_id: null,
      completed_at: new Date().toISOString(),
      last_error: { code, message, at: new Date().toISOString() },
      batch: current.batch ? {
        ...current.batch,
        request_state: requestInFlight ? "outcome_unknown" : "terminal",
        request_worker_session_id: null
      } : current.batch
    };
  });
  return { operation_id: operation.operation_id, code, provider_dispatched: requestInFlight || deliveryPending };
}

async function beginWorkSessionRefresh(tab, key) {
  const session = await workSessionFor(key);
  if (![OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN].includes(session.state)) {
    throw Object.assign(new Error("Refresh доступен только для активной work-session."), { code: "WORK_SESSION_NOT_ACTIVE" });
  }
  const recoveries = await getWorkRecoveries();
  if (recoveries[key]) return { already_in_progress: true, recovery: recoveries[key] };
  const live = await assertTabConversation(tab, key);
  const operation = await terminalizeRefreshOperation(key);
  const recovering = await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.RECOVERING);
  await setWorkSessionCommandAcceptance(key, false);
  await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: false, conversation_key: key });
  const recovery = {
    version: 1,
    recovery_id: `work-recovery-${crypto.randomUUID()}`,
    revision: recovering.revision,
    old_runtime_generation: workSessionRuntimeGeneration,
    new_runtime_generation: `work-runtime-${crypto.randomUUID()}`,
    worker_session_id: WORKER_SESSION_ID,
    tab_id: tab,
    origin: live.origin,
    ai_id: live.ai_id,
    conversation_id: live.conversation_id,
    conversation_key: key,
    previous_state: session.state,
    operation,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 120000).toISOString(),
    expected_visible: session.state === OzonWorkSessionModel.STATES.ACTIVE_VISIBLE
  };
  recoveries[key] = recovery;
  await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });
  await diagnostic("WORK_SESSION_REFRESH_PREPARED", { recovery_id: recovery.recovery_id, old_runtime_generation: recovery.old_runtime_generation, new_runtime_generation: recovery.new_runtime_generation, worker_session_id: WORKER_SESSION_ID, operation_phase: operation.phase, provider_dispatched: operation.provider_dispatched, delivery_preserved: operation.delivery_preserved === true });
  return { already_in_progress: false, recovery };
}

async function waitForRefreshTabIdentity(recovery, timeoutMs = 15000) {
  const deadline = Date.now() + Math.max(1000, Number(timeoutMs || 15000));
  let lastCode = "IDENTITY_UNAVAILABLE";
  let lastError = "Content runtime is not ready after extension reload.";
  while (Date.now() < deadline) {
    const response = await tabMessage(Number(recovery.tab_id), { type: "OZ_GET_IDENTITY" });
    if (response?.ok && response.identity) {
      const identity = normalizeIdentity(response.identity);
      const matches = identity.origin === recovery.origin && identity.ai_id === recovery.ai_id && identity.conversation_id === recovery.conversation_id;
      if (!matches) return { ok: false, code: "WORK_REFRESH_CONTEXT_INVALID", identity };
      return { ok: true, identity };
    }
    lastCode = response?.code || "IDENTITY_UNAVAILABLE";
    lastError = response?.error || lastError;
    await sleep(250);
  }
  return { ok: false, code: "WORK_REFRESH_CONTENT_RECONNECT_TIMEOUT", error: lastError, last_code: lastCode };
}

async function reloadRefreshOwnerTabInProcess(recovery, timeoutMs = 15000) {
  const tabId = Number(recovery?.tab_id || 0);
  if (!Number.isInteger(tabId) || tabId <= 0) {
    return { ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: "Recovery owner tab is missing." };
  }
  const loaded = await new Promise((resolve) => {
    let settled = false;
    let sawLoading = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { chrome.tabs.onUpdated.removeListener(listener); } catch (_) {}
      resolve(result);
    };
    const listener = (updatedTabId, changeInfo, tab) => {
      if (Number(updatedTabId) !== tabId) return;
      if (changeInfo?.status === "loading") sawLoading = true;
      if (changeInfo?.status === "complete" && sawLoading) finish({ ok: true, tab });
    };
    const timer = setTimeout(() => finish({ ok: false, code: "WORK_REFRESH_TAB_RELOAD_TIMEOUT", error: "AI tab reload did not complete in time." }), Math.max(1000, Number(timeoutMs || 15000)));
    chrome.tabs.onUpdated.addListener(listener);
    Promise.resolve(chrome.tabs.reload(tabId)).catch((error) => {
      finish({ ok: false, code: "WORK_REFRESH_TAB_RELOAD_FAILED", error: error?.message || String(error) });
    });
  });
  if (!loaded?.ok) return loaded;
  await diagnostic("WORK_SESSION_REFRESH_TAB_RELOAD_COMPLETED", {
    recovery_id: recovery.recovery_id,
    tab_id: tabId,
    conversation_key: recovery.conversation_key,
    worker_session_id: WORKER_SESSION_ID,
    runtime_generation: recovery.new_runtime_generation
  });
  return { ok: true, tab_id: tabId };
}

let workSessionRecoveryResumeInFlight = null;
async function resumeWorkSessionRecoveries() {
  if (workSessionRecoveryResumeInFlight) return workSessionRecoveryResumeInFlight;
  workSessionRecoveryResumeInFlight = resumeWorkSessionRecoveriesOnce().finally(() => { workSessionRecoveryResumeInFlight = null; });
  return workSessionRecoveryResumeInFlight;
}

async function resumeWorkSessionRecoveriesOnce() {
  const recoveries = await getWorkRecoveries();
  for (const [key, recovery] of Object.entries(recoveries)) {
    if (!recovery || recovery.expires_at < new Date().toISOString()) {
      delete recoveries[key];
      continue;
    }
    const session = await workSessionFor(key);
    if (session.state !== OzonWorkSessionModel.STATES.RECOVERING || Number(session.revision) !== Number(recovery.revision)) continue;
    const identityCheck = await waitForRefreshTabIdentity(recovery);
    if (!identityCheck.ok) {
      await setWorkSessionCommandAcceptance(key, false);
      await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: identityCheck.code || "WORK_REFRESH_CONTEXT_INVALID" } });
      await diagnostic(identityCheck.code || "WORK_REFRESH_CONTEXT_INVALID", { recovery_id: recovery.recovery_id, tab_id: recovery.tab_id, last_code: identityCheck.last_code || null, error: identityCheck.error || null }, { level: "error" });
      delete recoveries[key];
      continue;
    }

    // Runtime/content renewal is a handshake while the session is still RECOVERING and command acceptance is closed.
    // Only after the new generation confirms the exact tab/conversation do we restore active_visible/active_hidden.
    const runtimeGeneration = String(recovery.new_runtime_generation || workSessionRuntimeGeneration);
    const handshake = await tabMessage(Number(recovery.tab_id), { type: "OZ_WORK_RUNTIME_RENEW", runtime_generation: runtimeGeneration, conversation_key: key, visible: false });
    if (!handshake?.ok || handshake.runtime_generation !== runtimeGeneration || handshake.applied !== true) {
      await setWorkSessionCommandAcceptance(key, false);
      await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: handshake?.code || "WORK_REFRESH_CONTENT_RECONNECT_FAILED" } });
      delete recoveries[key];
      continue;
    }

    const target = recovery.expected_visible ? OzonWorkSessionModel.STATES.ACTIVE_VISIBLE : OzonWorkSessionModel.STATES.ACTIVE_HIDDEN;
    const restored = await mutateWorkSession(key, session.revision, target);
    await setWorkSessionCommandAcceptance(key, target === OzonWorkSessionModel.STATES.ACTIVE_VISIBLE);
    if (target === OzonWorkSessionModel.STATES.ACTIVE_VISIBLE) {
      const applied = await tabMessage(Number(recovery.tab_id), { type: "OZ_WORK_APPLY_VISIBILITY", visible: true, conversation_key: key });
      if (!applied?.ok || applied.applied !== true) {
        await setWorkSessionCommandAcceptance(key, false);
        await mutateWorkSession(key, restored.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: applied?.code || "WORK_REFRESH_VISIBLE_RESTORE_FAILED" } });
        delete recoveries[key];
        continue;
      }
    }
    delete recoveries[key];
    await diagnostic("WORK_SESSION_REFRESH_RESUMED", { recovery_id: recovery.recovery_id, old_runtime_generation: recovery.old_runtime_generation, new_runtime_generation: runtimeGeneration, worker_session_id: WORKER_SESSION_ID, restored_state: target, delivery_preserved: recovery.operation?.delivery_preserved === true, ui_record_generation: handshake.ui_record_generation || null });
  }
  await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });
  if (Object.keys(recoveries).length === 0) {
    try { await chrome.alarms.clear(WORK_SESSION_REFRESH_WAKE_ALARM); } catch (_) {}
  }
}

function normalizeBindingRecord(record, key = null) {
  if (!record || typeof record !== "object") return null;
  const origin = String(record.origin || "").trim().toLowerCase();
  const conversationId = String(record.conversation_id || "").trim().toLowerCase();
  const conversationKey = String(record.conversation_key || key || "").trim();
  const bindingId = String(record.binding_id || "").trim();
  const revision = Math.max(1, Number(record.revision || 1));
  if (!bindingId || !origin || !conversationId || !conversationKey) return null;
  if (`${origin}|${conversationId}` !== conversationKey) return null;
  return {
    binding_id: bindingId,
    revision,
    origin,
    ai_id: BB2ConversationIdentity.providerForOrigin(origin),
    conversation_id: conversationId,
    conversation_key: conversationKey,
    bound_at: record.bound_at || null,
    updated_at: record.updated_at || record.bound_at || null
  };
}

async function bindingForConversationKey(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const bindings = await getConversationBindings();
  return normalizeBindingRecord(bindings[key], key);
}

async function strictBindingForIdentity(identity) {
  const normalized = normalizeIdentity(identity);
  const key = conversationKeyFromIdentity(normalized);
  if (!key) {
    throw Object.assign(new Error("AI conversation identity не подтверждена; явная привязка невозможна."), { code: "CONVERSATION_NOT_CONFIRMED" });
  }
  const binding = await bindingForConversationKey(key);
  if (!binding) {
    throw Object.assign(new Error("Этот AI-диалог не привязан к Ozon Bridge. Сначала нажмите «Привязать диалог» в popup."), { code: "CONVERSATION_NOT_BOUND" });
  }
  if (binding.origin !== normalized.origin || binding.conversation_id !== normalized.conversation_id || binding.conversation_key !== key) {
    throw Object.assign(new Error("Conversation binding не совпадает с текущим AI-диалогом."), { code: "CONVERSATION_BINDING_MISMATCH" });
  }
  return binding;
}

function bindingSnapshot(binding) {
  return {
    binding_id: String(binding.binding_id),
    binding_revision: Math.max(1, Number(binding.revision || 1)),
    origin: String(binding.origin),
    ai_id: String(binding.ai_id || BB2ConversationIdentity.providerForOrigin(binding.origin) || ""),
    conversation_id: String(binding.conversation_id),
    conversation_key: String(binding.conversation_key)
  };
}

async function assertRunBinding(run) {
  if (!run) throw Object.assign(new Error("Run отсутствует."), { code: "AUTO_RUN_NOT_FOUND" });
  const liveBinding = await bindingForConversationKey(run.conversation_key);
  if (!liveBinding) {
    throw Object.assign(new Error("Привязка AI-диалога к Ozon Bridge отсутствует. Run заблокирован fail-closed."), { code: "CONVERSATION_NOT_BOUND" });
  }
  const snap = run.binding_snapshot || null;
  if (!snap) {
    throw Object.assign(new Error("Активный run не содержит binding snapshot. Снова явно привяжите этот диалог в popup для безопасной миграции run."), { code: "RUN_BINDING_SNAPSHOT_MISSING" });
  }
  if (String(snap.binding_id || "") !== liveBinding.binding_id ||
      String(snap.origin || "") !== liveBinding.origin ||
      String(snap.conversation_id || "") !== liveBinding.conversation_id ||
      String(snap.conversation_key || "") !== liveBinding.conversation_key) {
    throw Object.assign(new Error("Binding активного run не совпадает с текущей явной привязкой диалога."), { code: "RUN_BINDING_MISMATCH" });
  }
  return liveBinding;
}

async function bindConversation(context, options = {}) {
  const tab = normalizeTabId(context?.tab_id);
  const expected = normalizeIdentity({
    origin: context?.origin,
    conversation_id: context?.conversation_id,
    status: context?.conversation_id ? "confirmed" : "unknown"
  });
  if (!expected.conversation_id) {
    throw Object.assign(new Error("Нужен подтверждённый диалог ChatGPT /c/<id> или Alice /chat/<id>."), { code: "CONVERSATION_NOT_CONFIRMED" });
  }
  const live = await tabIdentity(tab);
  if (!sameConversationIdentity(live, expected)) {
    throw Object.assign(new Error("Контекст popup изменился. Откройте popup заново в нужном AI-диалоге."), { code: "POPUP_CONTEXT_STALE" });
  }
  const key = await resolveConfirmedConversationKey(live);
  const workStartIntentId = String(options?.work_start_intent_id || "").trim() || null;
  return withBindingWrite(async () => {
    const bindings = await getConversationBindings();
    const previous = normalizeBindingRecord(bindings[key], key);
    const now = new Date().toISOString();
    const record = {
      binding_id: (previous?.binding_id && String(previous.binding_id).startsWith("ozbind-")) ? previous.binding_id : `ozbind-${crypto.randomUUID()}`,
      revision: Math.max(0, Number(previous?.revision || 0)) + 1,
      origin: live.origin,
      ai_id: live.ai_id,
      conversation_id: live.conversation_id,
      conversation_key: key,
      bound_at: previous?.bound_at || now,
      updated_at: now
    };
    bindings[key] = record;
    const bindingUpdates = { [KEYS.CONVERSATION_BINDINGS]: bindings };

    if (!previous) {
      const manualData = await storageGet(KEYS.MANUAL_MODES);
      const modes = { ...(manualData[KEYS.MANUAL_MODES] || {}) };
      delete modes[key];
      bindingUpdates[KEYS.MANUAL_MODES] = modes;
    }

    if (workStartIntentId) {
      const sessions = await getWorkSessions();
      const currentSession = OzonWorkSessionModel.normalize(sessions[key], key);
      if (![OzonWorkSessionModel.STATES.INACTIVE, OzonWorkSessionModel.STATES.ERROR].includes(currentSession.state)) {
        throw Object.assign(new Error("Work-session уже существует; повторный Start не должен перепривязывать диалог."), { code: "WORK_SESSION_ALREADY_EXISTS" });
      }
      transitionWorkSessionRecord(sessions, key, currentSession.revision, OzonWorkSessionModel.STATES.BINDING, {
        tab_id: tab,
        origin: live.origin,
        ai_id: live.ai_id,
        conversation_id: live.conversation_id,
        start_intent_id: workStartIntentId,
        error: null
      });
      bindingUpdates[KEYS.WORK_SESSIONS] = sessions;
    }

    await storageSet(bindingUpdates);

    const existing = await getAutoRun(key);
    if (existing && !existing.binding_snapshot && !BridgeAutorunModel.isTerminalStatus(existing.status)) {
      await mutateAutoRun(key, (current) => current ? { ...current, binding_snapshot: bindingSnapshot(record) } : current);
      await diagnostic("LEGACY_RUN_BOUND_BY_EXPLICIT_OPERATOR_ACTION", { run_id: existing.run_id, binding_id: record.binding_id, conversation_key: key });
    }
    await diagnostic("CONVERSATION_BOUND", { binding_id: record.binding_id, binding_revision: record.revision, conversation_key: key, tab_id: tab, work_session_start: Boolean(workStartIntentId) });
    return record;
  });
}

function withMigrationWrite(fn) {
  const next = migrationWriteLock.then(fn, fn);
  migrationWriteLock = next.catch(() => null);
  return next;
}

async function migrateLegacyConversationStorage(identity) {
  const normalized = normalizeIdentity(identity);
  const realKey = conversationKeyFromIdentity(normalized);
  const oldKey = legacyConversationKey(normalized);
  if (!realKey || !oldKey || realKey === oldKey) return realKey;
  return withMigrationWrite(async () => {
    const data = await storageGet([KEYS.MANUAL_MODES, KEYS.AUTO_RUNS, KEYS.REPORT_PREFIXES, KEYS.AUTO_START_PROMPTS]);
    const maps = {
      [KEYS.MANUAL_MODES]: { ...(data[KEYS.MANUAL_MODES] || {}) },
      [KEYS.AUTO_RUNS]: { ...(data[KEYS.AUTO_RUNS] || {}) },
      [KEYS.REPORT_PREFIXES]: { ...(data[KEYS.REPORT_PREFIXES] || {}) },
      [KEYS.AUTO_START_PROMPTS]: { ...(data[KEYS.AUTO_START_PROMPTS] || {}) }
    };
    const updates = {};
    for (const storageKey of Object.keys(maps)) {
      const map = maps[storageKey];
      if (Object.prototype.hasOwnProperty.call(map, oldKey) && !Object.prototype.hasOwnProperty.call(map, realKey)) {
        map[realKey] = map[oldKey];
        if (storageKey === KEYS.AUTO_RUNS && map[realKey]) {
          map[realKey] = {
            ...map[realKey],
            conversation_key: realKey,
            conversation_id: normalized.conversation_id,
            origin: normalized.origin
          };
        }
      }
      delete map[oldKey];
      updates[storageKey] = map;
    }
    await storageSet(updates);
    return realKey;
  });
}

async function resolveConfirmedConversationKey(identity) {
  const normalized = normalizeIdentity(identity);
  const key = conversationKeyFromIdentity(normalized);
  if (!key) {
    throw Object.assign(new Error("Нужен подтверждённый AI-диалог. Для нового Alice-чата на "/" сначала отправьте обычное первое сообщение и дождитесь /chat/<id>/ с активным history item; до этого Ozon Bridge fail-closed."), { code: "CONVERSATION_NOT_CONFIRMED" });
  }
  await migrateLegacyConversationStorage(normalized);
  return key;
}

async function resolvePopupContext(tabId, expectedIdentity = null) {
  const tab = normalizeTabId(tabId);
  const live = await tabIdentity(tab);
  if (expectedIdentity) {
    const expected = normalizeIdentity(expectedIdentity);
    const eitherConfirmed = Boolean(live.conversation_id || expected.conversation_id);
    const sameUnconfirmedSurface = !eitherConfirmed && live.origin === expected.origin && live.ai_id === expected.ai_id;
    if (!sameUnconfirmedSurface && !sameConversationIdentity(live, expected)) {
      throw Object.assign(new Error("Контекст popup изменился. Откройте popup заново в нужном AI-диалоге."), { code: "POPUP_CONTEXT_STALE" });
    }
  }
  const key = await resolveConfirmedConversationKey(live);
  return { tab_id: tab, conversation_key: key, identity: live };
}

async function getSettings() {
  const data = await storageGet([
    KEYS.SELLER_CLIENT_ID, KEYS.SELLER_API_KEY,
    KEYS.PERFORMANCE_CLIENT_ID, KEYS.PERFORMANCE_CLIENT_SECRET,
    KEYS.AUTO_SEND, KEYS.PERSONAL_DATA_ENABLED, KEYS.SELLER_API_METADATA, KEYS.LAST_STATUS
  ]);
  return {
    sellerCredentials: OzonCredentials.normalizeSellerCredentials({
      clientId: data[KEYS.SELLER_CLIENT_ID] || "",
      apiKey: data[KEYS.SELLER_API_KEY] || ""
    }),
    performanceCredentials: OzonCredentials.normalizePerformanceCredentials({
      clientId: data[KEYS.PERFORMANCE_CLIENT_ID] || "",
      clientSecret: data[KEYS.PERFORMANCE_CLIENT_SECRET] || ""
    }),
    autoSend: data[KEYS.AUTO_SEND] !== false,
    personalDataEnabled: data[KEYS.PERSONAL_DATA_ENABLED] === true,
    sellerApiMetadata: OzonEntitlements.normalizeSnapshot(data[KEYS.SELLER_API_METADATA] || null),
    lastStatus: data[KEYS.LAST_STATUS] || null
  };
}

function sellerApiMetadataDiff(previousSnapshot, nextSnapshot) {
  const previous = OzonEntitlements.normalizeSnapshot(previousSnapshot);
  const next = OzonEntitlements.normalizeSnapshot(nextSnapshot);
  const previousInventory = previous.inventory && typeof previous.inventory === "object" ? previous.inventory : {};
  const nextInventory = next.inventory && typeof next.inventory === "object" ? next.inventory : {};
  const previousKeys = new Set(Object.keys(previousInventory));
  const nextKeys = new Set(Object.keys(nextInventory));
  const added = [...nextKeys].filter((key) => !previousKeys.has(key));
  const removed = [...previousKeys].filter((key) => !nextKeys.has(key));
  const changed = [...nextKeys].filter((key) => previousKeys.has(key) && JSON.stringify(previousInventory[key]) !== JSON.stringify(nextInventory[key]));
  const previousRules = previous.operations && typeof previous.operations === "object" ? previous.operations : {};
  const nextRules = next.operations && typeof next.operations === "object" ? next.operations : {};
  const ruleKeys = new Set([...Object.keys(previousRules), ...Object.keys(nextRules)]);
  const entitlementChanged = [...ruleKeys].filter((key) => JSON.stringify(previousRules[key] || null) !== JSON.stringify(nextRules[key] || null));
  return Object.freeze({ added: added.length, removed: removed.length, changed: changed.length, entitlement_changed: entitlementChanged.length });
}

async function refreshSellerApiMetadata() {
  const fixedUrl = OzonEntitlements.OFFICIAL_SWAGGER_URL;
  const beforeData = await storageGet(KEYS.SELLER_API_METADATA);
  const before = OzonEntitlements.normalizeSnapshot(beforeData[KEYS.SELLER_API_METADATA] || null);
  let response;
  try {
    response = await fetch(fixedUrl, { method: "GET", redirect: "follow", cache: "no-store", credentials: "omit", headers: { Accept: "application/json" } });
  } catch (error) {
    throw Object.assign(new Error(`Не удалось загрузить официальный Seller Swagger: ${error.message || String(error)}. Предыдущие правила сохранены.`), { code: "SELLER_METADATA_FETCH_FAILED" });
  }
  let finalUrl;
  try { finalUrl = new URL(String(response.url || fixedUrl)); }
  catch (_) { throw Object.assign(new Error("Ozon Swagger вернул некорректный final URL. Предыдущие правила сохранены."), { code: "SELLER_METADATA_FINAL_URL_INVALID" }); }
  if (finalUrl.protocol !== "https:" || finalUrl.hostname !== "docs.ozon.ru") {
    throw Object.assign(new Error(`Ozon Swagger redirect на неподтверждённый host ${finalUrl.hostname || "unknown"}; обновление отклонено.`), { code: "SELLER_METADATA_REDIRECT_REJECTED" });
  }
  if (!response.ok) throw Object.assign(new Error(`Ozon Swagger HTTP ${response.status}. Предыдущие правила сохранены.`), { code: "SELLER_METADATA_HTTP_ERROR", http_status: response.status });
  const text = await response.text();
  if (!text || text.length < 100000) throw Object.assign(new Error("Ozon Swagger выглядит неполным; обновление отклонено."), { code: "SELLER_METADATA_PAYLOAD_TOO_SMALL" });
  const sourceHash = bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  let swagger;
  try { swagger = JSON.parse(text); }
  catch (error) { throw Object.assign(new Error(`Ozon Swagger не является корректным JSON: ${error.message || String(error)}.`), { code: "SELLER_METADATA_JSON_INVALID" }); }
  const next = OzonEntitlements.compileSnapshot(swagger, { sourceHash, capturedAt: new Date().toISOString() });
  const validation = OzonEntitlements.validateSwagger(swagger);
  if (!validation.ok || Number(next?.source?.operation_count || 0) !== validation.operation_count) {
    throw Object.assign(new Error("Скомпилированный Seller metadata snapshot не прошёл проверку целостности."), { code: "SELLER_METADATA_COMPILE_INVALID" });
  }
  const diff = sellerApiMetadataDiff(before, next);
  await storageSet({ [KEYS.SELLER_API_METADATA]: next });
  const summary = OzonEntitlements.summary(next);
  await diagnostic("SELLER_API_METADATA_UPDATED", {
    source_hash: summary.source_hash,
    operation_count: summary.operation_count,
    entitlement_rule_count: summary.entitlement_rule_count,
    unresolved_rule_count: summary.unresolved_rule_count,
    added: diff.added,
    removed: diff.removed,
    changed: diff.changed,
    entitlement_changed: diff.entitlement_changed,
    external_request_executed: false
  });
  return Object.freeze({ ...summary, ...diff, updated: true, business_request_executed: false });
}

async function getManualMode(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const data = await storageGet(KEYS.MANUAL_MODES);
  const modes = data[KEYS.MANUAL_MODES] || {};
  return modes[key] === true;
}

const MANUAL_OPERATION_STATUSES = Object.freeze({
  REQUESTING: "requesting",
  DELIVERING: "delivering",
  COMPLETED: "completed",
  FAILED: "failed"
});

function manualOperationActive(operation) {
  return Boolean(operation && [MANUAL_OPERATION_STATUSES.REQUESTING, MANUAL_OPERATION_STATUSES.DELIVERING].includes(operation.status));
}

function publicQuotaWait(owner) {
  const batch = owner?.batch;
  const wait = batch?.request_state === "quota_waiting" && batch?.quota_wait && typeof batch.quota_wait === "object"
    ? batch.quota_wait
    : null;
  const nextAllowedAt = Math.max(0, Number(wait?.next_allowed_at || 0));
  if (!wait || nextAllowedAt <= 0) return null;
  return Object.freeze({
    family: String(wait.family || ANALYTICS_QUOTA_FAMILY),
    min_interval_ms: ANALYTICS_MIN_INTERVAL_MS,
    bridge_launch_safety_ms: ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
    effective_interval_ms: ANALYTICS_MIN_INTERVAL_MS + ANALYTICS_QUOTA_LAUNCH_SAFETY_MS,
    next_allowed_at: nextAllowedAt,
    queue_index: Math.max(0, Number(wait.queue_index || 0)),
    waiting_since: wait.waiting_since ? String(wait.waiting_since) : null,
    automatic_retry: false
  });
}

function publicManualOperation(operation) {
  if (!operation) return null;
  return {
    operation_id: operation.operation_id || null,
    manual_request_id: operation.manual_request_id || null,
    status: operation.status || null,
    owner_tab_id: operation.tab_id || null,
    request_id: operation.request_id || null,
    delivery_id: operation.delivery_id || null,
    operation: operation.operation || null,
    command_summary: operation.command_summary || null,
    delivery_confirmed: operation.delivery_confirmed === true,
    created_at: operation.created_at || null,
    updated_at: operation.updated_at || null,
    completed_at: operation.completed_at || null,
    quota_wait: publicQuotaWait(operation),
    last_error: operation.last_error || null
  };
}

async function getManualOperation(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const data = await storageGet(KEYS.MANUAL_OPERATIONS);
  return (data[KEYS.MANUAL_OPERATIONS] || {})[key] || null;
}

function withManualOperationsWrite(fn) {
  const next = manualOperationsWriteLock.then(fn, fn);
  manualOperationsWriteLock = next.catch(() => null);
  return next;
}

async function mutateManualOperation(conversationKey, mutator) {
  const key = normalizeConversationKey(conversationKey);
  return withManualOperationsWrite(async () => {
    const data = await storageGet(KEYS.MANUAL_OPERATIONS);
    const operations = { ...(data[KEYS.MANUAL_OPERATIONS] || {}) };
    const current = operations[key] || null;
    const next = await mutator(current);
    if (next) operations[key] = { ...next, updated_at: new Date().toISOString() };
    else delete operations[key];
    await storageSet({ [KEYS.MANUAL_OPERATIONS]: operations });
    return operations[key] || null;
  });
}

function manualDeliveryPendingBeforeInsert(operation) {
  return Boolean(
    operation
    && operation.status === MANUAL_OPERATION_STATUSES.DELIVERING
    && operation.delivery?.mode === "batch_watch_v1"
    && operation.delivery?.phase === BridgeAutorunModel.DELIVERY_PHASES.CLAIMED
  );
}

async function cancelManualPendingPreInsertDelivery(conversationKey, reason = "manual_mode_disabled") {
  const key = normalizeConversationKey(conversationKey);
  let cancelled = null;
  await mutateManualOperation(key, (current) => {
    if (!manualDeliveryPendingBeforeInsert(current)) return current;
    cancelled = {
      operation_id: current.operation_id || null,
      manual_request_id: current.manual_request_id || null,
      delivery_id: current.delivery?.delivery_id || current.delivery_id || null,
      tab_id: current.tab_id || null
    };
    return null;
  });
  if (cancelled) {
    await diagnostic("MANUAL_PENDING_DELIVERY_CANCELLED", {
      conversation_key: key,
      operation_id: cancelled.operation_id,
      manual_request_id: cancelled.manual_request_id,
      delivery_id: cancelled.delivery_id,
      tab_id: cancelled.tab_id,
      reason
    });
  }
  return cancelled;
}

async function getAutoRun(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const data = await storageGet(KEYS.AUTO_RUNS);
  const runs = data[KEYS.AUTO_RUNS] || {};
  return runs[key] || null;
}

function withAutoRunsWrite(fn) {
  const next = autoRunsWriteLock.then(fn, fn);
  autoRunsWriteLock = next.catch(() => null);
  return next;
}

async function mutateAutoRun(conversationKey, mutator) {
  const key = normalizeConversationKey(conversationKey);
  return withAutoRunsWrite(async () => {
    const data = await storageGet(KEYS.AUTO_RUNS);
    const runs = { ...(data[KEYS.AUTO_RUNS] || {}) };
    const current = runs[key] || null;
    const next = await mutator(current);
    if (next) runs[key] = { ...next, updated_at: new Date().toISOString() };
    else delete runs[key];
    await storageSet({ [KEYS.AUTO_RUNS]: runs });
    return runs[key] || null;
  });
}

async function writeManualModeState(conversationKey, enabled) {
  const key = normalizeConversationKey(conversationKey);
  if (enabled === true) {
    const run = await getAutoRun(key);
    if (run && !BridgeAutorunModel.canEnableManualMode(run.status)) {
      throw Object.assign(new Error("Авторежим активен. Сначала нажмите «Пауза», затем включайте работу через кнопку Ozon."), { code: "AUTO_MODE_ACTIVE" });
    }
  }
  const data = await storageGet(KEYS.MANUAL_MODES);
  const modes = { ...(data[KEYS.MANUAL_MODES] || {}) };
  if (enabled === true) modes[key] = true;
  else delete modes[key];
  await storageSet({ [KEYS.MANUAL_MODES]: modes });
  return enabled === true;
}
async function setManualMode(conversationKey, enabled) {
  const key = normalizeConversationKey(conversationKey);
  const result = await writeManualModeState(key, enabled);
  if (enabled !== true) await cancelManualPendingPreInsertDelivery(key, "manual_mode_disabled");
  return result;
}
async function setWorkSessionCommandAcceptance(conversationKey, enabled) {
  return writeManualModeState(conversationKey, enabled === true);
}
async function workSessionManualEnabled(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const [manualEnabled, session] = await Promise.all([getManualMode(key), workSessionFor(key)]);
  return manualEnabled === true && session.state === OzonWorkSessionModel.STATES.ACTIVE_VISIBLE;
}

function withPrefixWrite(fn) {
  const next = prefixWriteLock.then(fn, fn);
  prefixWriteLock = next.catch(() => null);
  return next;
}

async function getReportPrefix(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const data = await storageGet(KEYS.REPORT_PREFIXES);
  return (data[KEYS.REPORT_PREFIXES] || {})[key] || null;
}

async function saveReportPrefix(conversationKey, payload) {
  const key = normalizeConversationKey(conversationKey);
  return withPrefixWrite(async () => {
    const data = await storageGet(KEYS.REPORT_PREFIXES);
    const prefixes = { ...(data[KEYS.REPORT_PREFIXES] || {}) };
    const current = prefixes[key] || null;
    const normalized = BridgeAutorunModel.normalizePrefixRecord({
      enabled: payload.report_prefix_enabled === true,
      text: String(payload.report_prefix_text ?? current?.text ?? ""),
      interval: payload.report_prefix_interval,
      delivered_count: current?.delivered_count || 0,
      last_applied_at_count: current?.last_applied_at_count || 0,
      last_confirmed_delivery_id: current?.last_confirmed_delivery_id || null,
      updated_at: new Date().toISOString()
    });
    if (normalized && (normalized.enabled || normalized.text)) prefixes[key] = normalized;
    else delete prefixes[key];
    await storageSet({ [KEYS.REPORT_PREFIXES]: prefixes });
    return prefixes[key] || null;
  });
}

async function noteConfirmedPrefix(conversationKey, applied, deliveryId = "") {
  const key = normalizeConversationKey(conversationKey);
  return withPrefixWrite(async () => {
    const data = await storageGet(KEYS.REPORT_PREFIXES);
    const prefixes = { ...(data[KEYS.REPORT_PREFIXES] || {}) };
    const current = prefixes[key] || null;
    if (!current) return null;
    prefixes[key] = BridgeAutorunModel.noteConfirmedPrefix(current, applied === true, deliveryId);
    await storageSet({ [KEYS.REPORT_PREFIXES]: prefixes });
    return prefixes[key];
  });
}

function withStartPromptWrite(fn) {
  const next = startPromptWriteLock.then(fn, fn);
  startPromptWriteLock = next.catch(() => null);
  return next;
}

function normalizeAutoStartPromptText(value) {
  const text = String(value ?? "").replace(/\r\n?/g, "\n").trim();
  if (!text) throw Object.assign(new Error("Стартовый prompt autorun не может быть пустым."), { code: "AUTO_START_PROMPT_EMPTY" });
  if (Array.from(text).length > 30000) throw Object.assign(new Error("Стартовый prompt autorun слишком длинный (максимум 30000 символов)."), { code: "AUTO_START_PROMPT_TOO_LONG" });
  return text;
}

async function getAutoStartPrompt(conversationKey, { ensureStored = true } = {}) {
  const key = normalizeConversationKey(conversationKey);
  return withStartPromptWrite(async () => {
    const data = await storageGet(KEYS.AUTO_START_PROMPTS);
    const prompts = { ...(data[KEYS.AUTO_START_PROMPTS] || {}) };
    const current = prompts[key] || null;
    if (current?.text && String(current.text).trim()) {
      const normalizedCurrent = normalizeAutoStartPromptText(current.text);
      if (current.is_default === true && normalizedCurrent !== DEFAULT_AUTO_START_TEXT) {
        const migrated = { text: DEFAULT_AUTO_START_TEXT, is_default: true, updated_at: new Date().toISOString() };
        if (ensureStored) {
          prompts[key] = migrated;
          await storageSet({ [KEYS.AUTO_START_PROMPTS]: prompts });
        }
        return migrated;
      }
      return {
        text: normalizedCurrent,
        is_default: current.is_default === true,
        updated_at: current.updated_at || null
      };
    }
    const record = {
      text: DEFAULT_AUTO_START_TEXT,
      is_default: true,
      updated_at: new Date().toISOString()
    };
    if (ensureStored) {
      prompts[key] = record;
      await storageSet({ [KEYS.AUTO_START_PROMPTS]: prompts });
    }
    return record;
  });
}

async function saveAutoStartPrompt(conversationKey, text) {
  const key = normalizeConversationKey(conversationKey);
  const normalizedText = normalizeAutoStartPromptText(text);
  return withStartPromptWrite(async () => {
    const data = await storageGet(KEYS.AUTO_START_PROMPTS);
    const prompts = { ...(data[KEYS.AUTO_START_PROMPTS] || {}) };
    prompts[key] = {
      text: normalizedText,
      is_default: normalizedText === DEFAULT_AUTO_START_TEXT,
      updated_at: new Date().toISOString()
    };
    await storageSet({ [KEYS.AUTO_START_PROMPTS]: prompts });
    return prompts[key];
  });
}

async function resetAutoStartPrompt(conversationKey) {
  return saveAutoStartPrompt(conversationKey, DEFAULT_AUTO_START_TEXT);
}

function publicRun(run) {
  if (!run) return null;
  return {
    run_id: run.run_id,
    status: run.status,
    owner_tab_id: run.tab_id || null,
    conversation_id: run.conversation_id || null,
    binding_id: run.binding_snapshot?.binding_id || null,
    binding_revision: Number(run.binding_snapshot?.binding_revision || 0) || null,
    sequence: Number(run.sequence || 0),
    pause_requested: run.pause_requested === true,
    finish_requested: run.finish_requested === true,
    last_operation: run.last_operation || null,
    last_command_summary: run.last_command_summary || null,
    last_assistant_turn_id: run.last_assistant_turn_id || null,
    batch_total: Array.isArray(run.batch?.entries) ? run.batch.entries.length : 0,
    batch_completed: run.batch ? Math.max(0, Number(run.batch.next_index || 0)) : 0,
    created_at: run.created_at || null,
    updated_at: run.updated_at || null,
    quota_wait: publicQuotaWait(run),
    last_error: run.last_error || null
  };
}

async function commonPublicSettingsFields() {
  const settings = await getSettings();
  const [sendData, microphoneData, copyProfiles] = await Promise.all([
    storageGet(KEYS.SEND_BUTTON_PROFILE),
    storageGet(KEYS.MICROPHONE_BUTTON_PROFILE),
    getCopyButtonProfiles()
  ]);
  const credentialState = OzonCredentials.publicCredentialState(settings.sellerCredentials);
  const performanceCredentialState = OzonCredentials.publicPerformanceCredentialState(settings.performanceCredentials);
  const operationNames = Object.keys(OzonContract.OPERATIONS || {});
  const enabledOperations = operationNames.filter((name) => OzonContract.OPERATIONS[name]?.execution_enabled === true);
  return {
    version: VERSION,
    ...credentialState,
    ...performanceCredentialState,
    provider_execution_ready: enabledOperations.length > 0,
    provider_operation_count: operationNames.length,
    provider_enabled_operation_count: enabledOperations.length,
    provider_enabled_operations: enabledOperations,
    provider_gate: enabledOperations.length > 0 ? "OPEN" : "CLOSED",
    ai_mode: "auto",
    ai_mode_scope: "per_tab",
    auto_send: settings.autoSend,
    personal_data_enabled: settings.personalDataEnabled === true,
    seller_api_metadata: OzonEntitlements.summary(settings.sellerApiMetadata),
    send_button_profile: sendData[KEYS.SEND_BUTTON_PROFILE] || null,
    microphone_button_profile: microphoneData[KEYS.MICROPHONE_BUTTON_PROFILE] || null,
    copy_button_profiles: copyProfiles,
    copy_button_profile_count: copyProfiles.profiles.length,
    copy_button_builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT,
    last_status: settings.lastStatus?.scope === "provider" && settings.lastStatus?.code !== "SAFE_PROBE_NOT_CONFIGURED" ? settings.lastStatus : null
  };
}

async function publicSettingsState(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const common = await commonPublicSettingsFields();
  const [manualMode, manualOperation, run, prefix, startPrompt, binding, workSession] = await Promise.all([
    getManualMode(key), getManualOperation(key), getAutoRun(key), getReportPrefix(key), getAutoStartPrompt(key), bindingForConversationKey(key), workSessionFor(key)
  ]);
  return {
    ...common,
    page_context_available: true,
    conversation_key: key,
    binding: binding ? { bound: true, ...binding } : { bound: false, binding_id: null, revision: null },
    manual_mode: binding && workSession.state === OzonWorkSessionModel.STATES.ACTIVE_VISIBLE ? manualMode : false,
    manual_operation: binding ? publicManualOperation(manualOperation) : null,
    manual_operation_active: binding ? manualOperationActive(manualOperation) : false,
    work_session: workSession,
    auto_run: publicRun(run),
    auto_start_prompt: {
      text: String(startPrompt?.text || DEFAULT_AUTO_START_TEXT),
      is_default: startPrompt?.is_default === true,
      updated_at: startPrompt?.updated_at || null
    },
    report_prefix: prefix ? {
      enabled: prefix.enabled === true,
      text: String(prefix.text || ""),
      interval: Number(prefix.interval || 1),
      delivered_count: Number(prefix.delivered_count || 0),
      last_applied_at_count: Number(prefix.last_applied_at_count || 0),
      updated_at: prefix.updated_at || null
    } : null
  };
}

async function publicGlobalSettingsState(pageContextError = null) {
  const common = await commonPublicSettingsFields();
  return {
    ...common,
    page_context_available: false,
    page_context_error: pageContextError ? String(pageContextError).slice(0, 800) : null,
    conversation_key: null,
    binding: { bound: false, binding_id: null, revision: null },
    manual_mode: false,
    manual_operation: null,
    manual_operation_active: false,
    work_session: OzonWorkSessionModel.normalize(null, null),
    auto_run: null,
    auto_start_prompt: { text: DEFAULT_AUTO_START_TEXT, is_default: true, updated_at: null },
    report_prefix: null
  };
}

async function setStatus(status) {
  const clean = {
    scope: "provider",
    ok: Boolean(status.ok),
    code: String(status.code || "").slice(0, 120),
    message: String(status.message || "").slice(0, 800),
    http_status: Number(status.http_status || 0),
    at: new Date().toISOString()
  };
  await storageSet({ [KEYS.LAST_STATUS]: clean });
  return clean;
}

async function executeOzonCore(commandText, { executionCommand = null, planning = null, quotaPermit = null } = {}) {
  const settings = await getSettings();
  const command = OzonContract.parseCommand(commandText);
  const physicalCommand = executionCommand ? OzonContract.normalizeCommand(executionCommand) : command;
  if (physicalCommand.operation !== command.operation) throw Object.assign(new Error("Planned physical operation не совпадает с logical operation."), { code: "PLANNED_OPERATION_MISMATCH" });
  const fingerprint = OzonContract.commandFingerprint(command);
  const physicalFingerprint = OzonContract.commandFingerprint(physicalCommand);
  await diagnostic("OZON_REQUEST_STARTED", {
    operation: command.operation,
    command_fingerprint: fingerprint,
    physical_command_fingerprint: physicalFingerprint,
    command_transformed: fingerprint !== physicalFingerprint
  });
  try {
    const response = typeof OzonProvider.executeCommandObject === "function"
      ? await OzonProvider.executeCommandObject(physicalCommand, settings.sellerCredentials, settings.performanceCredentials, {
          reportCommand: command,
          planning,
          quota: safeQuotaMetadata(quotaPermit),
          onProviderResponse: quotaPermit ? async ({ response }) => extendAnalyticsQuotaFromRetryAfter(quotaPermit, response?.responseMeta?.retry_after) : null
        })
      : await OzonProvider.executeCommand(commandText, settings.sellerCredentials, settings.performanceCredentials);
    await diagnostic("OZON_REQUEST_FINISHED", {
      request_id: response.request_id || null,
      operation: command.operation,
      provider: response.provider || OzonContract.preflightExecution(command).meta.provider || "seller_api",
      command_fingerprint: fingerprint,
      physical_command_fingerprint: response.executed_command_fingerprint || physicalFingerprint,
      http_status: response.http_status,
      ok: response.ok,
      quota_family: response.rate_limit?.quota_family || null,
      next_allowed_at: Number(response.rate_limit?.next_allowed_at || 0)
    }, { level: response.ok ? "info" : "warning" });
    await setStatus(response.ok
      ? { ok: true, code: "CONNECTED", message: "Последний Ozon API запрос выполнен успешно.", http_status: response.http_status }
      : { ok: false, code: "OZON_API_ERROR", message: `Ozon API вернул HTTP ${response.http_status}.`, http_status: response.http_status });
    return { ...response, auto_send: settings.autoSend };
  } catch (error) {
    const safe = OzonContract.safeBridgeErrorPayload(error, Number(error?.http_status || 0));
    await diagnostic("OZON_REQUEST_FAILED", {
      operation: command.operation,
      command_fingerprint: fingerprint,
      physical_command_fingerprint: physicalFingerprint,
      code: safe.code,
      error: safe.message,
      http_status: safe.http_status,
      external_request_executed: safe.external_request_executed === true
    }, { level: "error" });
    await setStatus({ ok: false, code: safe.code, message: safe.message, http_status: safe.http_status });
    throw error;
  }
}

function buildExecutionErrorResult(command, fingerprint, error, elapsedMs = 0, planning = null) {
  const safe = OzonContract.safeBridgeErrorPayload(error, Number(error?.http_status || 0));
  const preflight = OzonContract.preflightExecution(command);
  const requestId = crypto.randomUUID();
  const reportText = OzonContract.formatResultReport({
    requestId,
    command,
    requestMeta: {
      host_alias: String(preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: safe.external_request_executed === true,
      capability_probe_executed: planning?.capability?.probe_performed === true,
      capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0)
    },
    httpStatus: safe.http_status,
    result: { error: safe },
    elapsedMs: Math.max(0, Number(elapsedMs || 0)),
    pagination: null,
    rateLimit: error?.rate_limit || null,
    planning
  });
  return Object.freeze({
    ok: false,
    bridge_error: true,
    request_id: requestId,
    operation: command.operation,
    command_fingerprint: fingerprint,
    http_status: safe.http_status,
    report_text: reportText,
    response_meta: null,
    error: safe,
    external_request_executed: safe.external_request_executed === true
  });
}

function buildCapabilityPlanningErrorResult(command, fingerprint, plan) {
  const source = Object.assign(new Error(String(plan?.error?.message || "Capability planning rejected the command.")), { code: String(plan?.error?.code || "CAPABILITY_PLANNING_REJECTED") });
  const safe = OzonContract.safeBridgeErrorPayload(source, 0);
  const preflight = OzonContract.preflightExecution(command);
  const requestId = `capability-${crypto.randomUUID()}`;
  const planning = plan?.planning || null;
  const reportText = OzonContract.formatResultReport({
    requestId,
    command,
    requestMeta: {
      host_alias: String(preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: false,
      capability_probe_executed: planning?.capability?.probe_performed === true,
      capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0)
    },
    httpStatus: 0,
    result: {
      error: {
        ...safe,
        stage: "capability_planning",
        external_request_executed: false
      }
    },
    elapsedMs: 0,
    pagination: null,
    rateLimit: null,
    planning
  });
  return Object.freeze({
    ok: false,
    bridge_error: true,
    pre_execution_error: true,
    request_id: requestId,
    operation: command.operation,
    command_fingerprint: fingerprint,
    http_status: 0,
    report_text: reportText,
    response_meta: null,
    error: safe,
    external_request_executed: false
  });
}

function buildPersonalDataPolicyErrorResult(command, fingerprint) {
  const source = Object.assign(new Error("Операция может передать личные данные в AI-чат. Чтобы выполнить запрос, включите «Показывать личные данные» в настройках Ozon Bridge, затем явно запустите новую команду."), { code: "OPERATION_DISABLED_BY_USER" });
  const safe = OzonContract.safeBridgeErrorPayload(source, 0);
  const preflight = OzonContract.preflightExecution(command);
  const requestId = `policy-${crypto.randomUUID()}`;
  const reportText = OzonContract.formatResultReport({
    requestId,
    command,
    requestMeta: {
      host_alias: String(preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: false,
      capability_probe_executed: false,
      capability_probe_http_status: 0
    },
    httpStatus: 0,
    result: {
      status: "personal_data_setting_required",
      error: { ...safe, stage: "personal_data_policy", external_request_executed: false },
      operator_action: "enable_personal_data_setting_and_submit_new_command"
    },
    elapsedMs: 0,
    pagination: null,
    rateLimit: null,
    planning: {
      capability: { status: "not_needed", subscription_type: "UNKNOWN", probe_performed: false, probe_http_status: 0, probe_error_code: null },
      entitlement: { status: "POLICY_BLOCKED", partial: false, reason: "personal_data_setting_off" }
    }
  });
  return Object.freeze({
    ok: false, bridge_error: true, pre_execution_error: true, request_id: requestId, operation: command.operation,
    command_fingerprint: fingerprint, http_status: 0, report_text: reportText, response_meta: null, error: safe, external_request_executed: false
  });
}

async function applyPrefixToReport(conversationKey, reportText) {
  const prefix = await getReportPrefix(conversationKey);
  const result = BridgeAutorunModel.applyReportPrefix(reportText, prefix);
  return { outgoing_text: result.text, report_prefix_applied: result.applied };
}

function buildPreExecutionErrorResult({ error, stage = "command_parse", commandFingerprint = "", requestIdPrefix = "preexec" }) {
  const sourceError = error instanceof Error ? error : Object.assign(new Error(String(error || "Ozon Bridge pre-execution error.")), { code: "PREEXEC_ERROR" });
  const safe = OzonContract.safeBridgeErrorPayload(sourceError, 0);
  const cleanStage = String(stage || "pre_execution").slice(0, 80);
  const suppliedFingerprint = String(commandFingerprint || "").trim().toLowerCase();
  const fingerprint = /^[a-f0-9]{8,64}$/.test(suppliedFingerprint)
    ? suppliedFingerprint
    : OzonContract.textFingerprint(`${cleanStage}|${safe.code}|${safe.message}`);
  const requestId = `${String(requestIdPrefix || "preexec").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "preexec"}-${crypto.randomUUID()}`;
  const reportText = OzonContract.formatPreExecutionErrorReport({
    requestId,
    error: sourceError,
    stage: cleanStage,
    commandFingerprint: fingerprint
  });
  return Object.freeze({
    ok: false,
    bridge_error: true,
    pre_execution_error: true,
    request_id: requestId,
    operation: null,
    command_fingerprint: fingerprint,
    http_status: 0,
    report_text: reportText,
    external_request_executed: false
  });
}


async function executeManualCommand(commandText, conversationKey, sender, manualRequestId) {
  const key = normalizeConversationKey(conversationKey);
  const senderTabId = Number(sender?.tab?.id || 0);
  if (!Number.isInteger(senderTabId) || senderTabId <= 0) {
    throw Object.assign(new Error("Ручная Ozon-команда должна приходить из content script поддерживаемого AI."), { code: "MANUAL_SENDER_TAB_MISSING" });
  }
  const requestToken = String(manualRequestId || "").trim();
  if (!requestToken) throw Object.assign(new Error("Manual request ID отсутствует."), { code: "MANUAL_REQUEST_ID_MISSING" });
  const liveIdentity = await assertTabConversation(senderTabId, key);
  const binding = await strictBindingForIdentity(liveIdentity);
  const manualAutoSend = (await getSettings()).autoSend !== false;
  const workSession = await workSessionFor(key);

  let entries;
  let sourceStage = "command_discovery";
  if (workSession.state !== OzonWorkSessionModel.STATES.ACTIVE_VISIBLE) {
    sourceStage = "work_session_gate";
    entries = [batchErrorEntry(Object.assign(new Error("Work-session этого AI-диалога не находится в состоянии active_visible. Ozon API request не выполнен."), { code: "WORK_SESSION_NOT_VISIBLE" }), sourceStage, OzonContract.textFingerprint(commandText))];
  } else if (!(await getManualMode(key))) {
    sourceStage = "manual_gate";
    entries = [batchErrorEntry(Object.assign(new Error("Кнопка Ozon выключена для этого AI-диалога. API-запрос не выполнен."), { code: "MANUAL_MODE_OFF" }), sourceStage, OzonContract.textFingerprint(commandText))];
  } else {
    const run = await getAutoRun(key);
    if (run && !BridgeAutorunModel.canEnableManualMode(run.status)) {
      sourceStage = "manual_gate";
      entries = [batchErrorEntry(Object.assign(new Error("Авторежим активен. Ручной API-вызов не выполнен."), { code: "AUTO_MODE_ACTIVE" }), sourceStage, OzonContract.textFingerprint(commandText))];
    } else {
      try {
        entries = discoverBatchEntries(commandText);
      } catch (error) {
        entries = [batchErrorEntry(error, "command_discovery", OzonContract.textFingerprint(commandText))];
      }
      if (!entries.length) {
        entries = [batchErrorEntry(Object.assign(new Error("В тексте не найдено ни одной OZON_API_V1 команды."), { code: "NO_OZON_COMMANDS" }), "command_discovery", OzonContract.textFingerprint(commandText))];
      }
    }
  }

  const operationId = `ozmanual-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let duplicateOperation = null;
  const operation = await mutateManualOperation(key, (current) => {
    if (current?.manual_request_id === requestToken) {
      duplicateOperation = current;
      return current;
    }
    if (manualOperationActive(current)) return current;
    return {
      operation_id: operationId,
      manual_request_id: requestToken,
      conversation_key: key,
      origin: liveIdentity.origin,
      conversation_id: liveIdentity.conversation_id,
      binding_snapshot: bindingSnapshot(binding),
      tab_id: senderTabId,
      status: MANUAL_OPERATION_STATUSES.REQUESTING,
      operation: null,
      last_operation: null,
      command_summary: `${entries.length} queued OZON_API_V1 item(s)`,
      request_id: null,
      request_worker_session_id: null,
      delivery_id: null,
      outgoing_text: null,
      auto_send: manualAutoSend,
      report_prefix_applied: false,
      delivery_confirmed: false,
      delivery: null,
      batch: {
        phase: "collecting",
        source: "manual_copy",
        entries,
        next_index: 0,
        request_state: "idle",
        request_worker_session_id: null,
        planning_state: "pending",
        capability_resolution: null,
        query_planning_state: "pending",
        query_plan: null,
        quota_wait: null,
        request_quota: null,
        created_at: now
      },
      created_at: now,
      completed_at: null,
      last_error: null
    };
  });
  if (duplicateOperation) {
    throw Object.assign(new Error("Эта ручная операция уже принята. Повторный API-вызов запрещён."), { code: "MANUAL_REQUEST_DUPLICATE", operation_id: duplicateOperation.operation_id });
  }
  if (!operation || operation.operation_id !== operationId) {
    throw Object.assign(new Error("Bridge уже выполняет или доставляет ручной Ozon batch."), { code: "MANUAL_OPERATION_ACTIVE" });
  }
  await diagnostic("MANUAL_BATCH_ACCEPTED", {
    operation_id: operationId,
    manual_request_id: requestToken,
    conversation_id: liveIdentity.conversation_id,
    tab_id: senderTabId,
    item_count: entries.length,
    command_count: entries.filter((entry) => entry.kind === "command").length,
    pre_execution_error_count: entries.filter((entry) => entry.kind !== "command").length,
    source_stage: sourceStage
  });
  void processManualBatch(key, operationId);
  return {
    ok: true,
    accepted: true,
    manual_operation_id: operationId,
    manual_request_id: requestToken,
    item_count: entries.length,
    command_count: entries.filter((entry) => entry.kind === "command").length,
    pre_execution_error_count: entries.filter((entry) => entry.kind !== "command").length
  };
}

function manualBatchRecoveryPayload(operation, type) {
  if (!operation || operation.status !== MANUAL_OPERATION_STATUSES.DELIVERING || operation.delivery?.mode !== "batch_watch_v1") return null;
  return {
    type,
    owner_kind: "manual",
    owner_id: operation.operation_id,
    operation_id: operation.operation_id,
    manual_request_id: operation.manual_request_id || "",
    conversation_key: operation.conversation_key,
    origin: operation.origin,
    conversation_id: operation.conversation_id,
    delivery_id: operation.delivery?.delivery_id || operation.delivery_id || "",
    delivery_mode: operation.delivery?.mode || "batch_watch_v1",
    delivery_phase: operation.delivery?.phase || null,
    request_id: "",
    outgoing_text: String(operation.delivery?.outgoing_text || operation.outgoing_text || ""),
    outgoing_hash: "",
    report_prefix_applied: operation.delivery?.report_prefix_applied === true || operation.report_prefix_applied === true,
    baseline_user_turn_ids: [],
    baseline_assistant_turn_ids: Array.isArray(operation.delivery?.baseline_assistant_turn_ids) ? operation.delivery.baseline_assistant_turn_ids : []
  };
}

async function manualOwnerDecision(operation, candidateTabId, { allowRebind = true } = {}) {
  const candidate = normalizeTabId(candidateTabId);
  if (!operation || !manualOperationActive(operation)) return { owner: false, reason: "manual_operation_missing", operation };
  if (Number(operation.tab_id) === candidate) {
    await assertTabConversation(candidate, operation.conversation_key, operation.conversation_id);
    return { owner: true, rebound: false, operation };
  }
  const oldTab = await chrome.tabs.get(Number(operation.tab_id)).catch(() => null);
  let oldOwnsConversation = false;
  if (oldTab?.id) {
    const oldIdentity = await tabIdentity(oldTab.id).catch(() => null);
    if (oldIdentity) oldOwnsConversation = conversationKeyFromIdentity(oldIdentity) === operation.conversation_key;
  }
  if (oldOwnsConversation) return { owner: false, reason: "duplicate_non_owner", owner_tab_id: operation.tab_id, operation };
  if (!allowRebind) return { owner: false, reason: "owner_unavailable", owner_tab_id: operation.tab_id, operation };
  await assertTabConversation(candidate, operation.conversation_key, operation.conversation_id);
  const rebound = await mutateManualOperation(operation.conversation_key, (current) => {
    if (!current || current.operation_id !== operation.operation_id || !manualOperationActive(current)) return current;
    return { ...current, tab_id: candidate };
  });
  return { owner: true, rebound: true, operation: rebound || operation };
}

async function manualRecoveryForContent(operation, candidateTabId) {
  if (!operation || !manualOperationActive(operation)) return { owner: true, recovery: null, operation };
  const owner = await manualOwnerDecision(operation, candidateTabId, { allowRebind: true });
  if (!owner.owner) return { ...owner, recovery: null };
  let current = owner.operation || operation;
  if (current.status === MANUAL_OPERATION_STATUSES.REQUESTING) {
    const requestState = String(current.batch?.request_state || "idle");
    const requestWorker = String(current.batch?.request_worker_session_id || "");
    if (requestState === "requesting" && requestWorker && requestWorker !== WORKER_SESSION_ID) {
      current = await failManualBatch(current.conversation_key, current.operation_id, "REQUEST_OUTCOME_UNKNOWN_NO_RETRY", "Service worker перезапустился во время ручного Ozon API request. Исход запроса неизвестен; автоматический повтор запрещён.");
      await diagnostic("REQUEST_RECOVERY_BLOCKED_NO_RETRY", { owner_kind: "manual", owner_id: current?.operation_id || operation.operation_id, previous_worker_session_id: requestWorker, worker_session_id: WORKER_SESSION_ID }, { level: "error" });
      return { owner: true, rebound: owner.rebound === true, operation: current, recovery: null };
    }
    setTimeout(() => { void processManualBatch(current.conversation_key, current.operation_id); }, 0);
    return { owner: true, rebound: owner.rebound === true, operation: current, recovery: null };
  }
  if (current.status !== MANUAL_OPERATION_STATUSES.DELIVERING || current.delivery?.mode !== "batch_watch_v1") return { owner: true, rebound: owner.rebound === true, operation: current, recovery: null };
  if (current.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) return { owner: true, rebound: owner.rebound === true, operation: current, recovery: manualBatchRecoveryPayload(current, "deliver_claimed") };
  if (current.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) return { owner: true, rebound: owner.rebound === true, operation: current, recovery: manualBatchRecoveryPayload(current, "watch_delivery") };
  if (current.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return { owner: true, rebound: owner.rebound === true, operation: current, recovery: { ...manualBatchRecoveryPayload(current, "delivery_insert_outcome_unknown"), code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" } };
  return { owner: true, rebound: owner.rebound === true, operation: current, recovery: null };
}


async function tabMessage(tabId, message) {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const error = chrome.runtime.lastError;
        if (error) return resolve({ ok: false, code: "TAB_MESSAGE_ERROR", error: error.message });
        resolve(response || { ok: false, code: "EMPTY_RESPONSE", error: "Пустой ответ вкладки." });
      });
    } catch (error) {
      resolve({ ok: false, code: "TAB_MESSAGE_ERROR", error: String(error?.message || error) });
    }
  });
}

async function stopWatch(run, reason) {
  if (!run?.tab_id) return;
  await diagnostic("PROMPT_WATCH_STOP_REQUESTED", { run_id: run.run_id, tab_id: run.tab_id, reason: reason || "worker" });
  const response = await tabMessage(run.tab_id, { type: "OZ_AUTO_STOP_WATCH", run_id: run.run_id, reason: reason || "worker" });
  await diagnostic("PROMPT_WATCH_STOP_RESPONSE", { run_id: run.run_id, tab_id: run.tab_id, ok: response?.ok === true, code: response?.code || null, error: response?.error || null }, { level: response?.ok === true ? "info" : "warning" });
}

async function beginWatch(run) {
  if (!run || run.status !== BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) return { ok: false, code: "RUN_NOT_WAITING" };
  await assertRunBinding(run);
  await assertTabConversation(run.tab_id, run.conversation_key, run.conversation_id);
  return tabMessage(run.tab_id, {
    type: "OZ_AUTO_BEGIN_WATCH",
    run_id: run.run_id,
    conversation_key: run.conversation_key,
    origin: run.origin,
    conversation_id: run.conversation_id,
    watch_id: run.watch_id,
    assistant_baseline_ids: Array.isArray(run.assistant_baseline_ids) ? run.assistant_baseline_ids : []
  });
}

async function markRunError(conversationKey, code, message) {
  const key = normalizeConversationKey(conversationKey);
  const run = await mutateAutoRun(key, (current) => current ? {
    ...current,
    status: BridgeAutorunModel.RUN_STATUSES.ERROR,
    last_error: { code: String(code || "AUTO_RUN_ERROR"), message: String(message || "Autorun error"), at: new Date().toISOString() }
  } : null);
  if (run) await stopWatch(run, "run_error");
  return run;
}

async function ownerDecision(run, candidateTabId, { allowRebind = true } = {}) {
  const candidate = normalizeTabId(candidateTabId);
  if (!run) return { owner: false, reason: "run_missing", run: null };
  await assertRunBinding(run);
  if (Number(run.tab_id) === candidate) {
    await assertTabConversation(candidate, run.conversation_key, run.conversation_id);
    return { owner: true, rebound: false, run };
  }

  const oldTab = await chrome.tabs.get(Number(run.tab_id)).catch(() => null);
  let oldOwnsConversation = false;
  if (oldTab?.id) {
    const oldIdentity = await tabIdentity(oldTab.id).catch(() => null);
    if (oldIdentity) oldOwnsConversation = conversationKeyFromIdentity(oldIdentity) === run.conversation_key;
  }
  if (oldOwnsConversation) {
    return { owner: false, reason: "duplicate_non_owner", owner_tab_id: run.tab_id, run };
  }

  if (!allowRebind || BridgeAutorunModel.isTerminalStatus(run.status)) {
    return { owner: false, reason: "owner_unavailable", owner_tab_id: run.tab_id, run };
  }
  await assertTabConversation(candidate, run.conversation_key, run.conversation_id);
  const rebound = await mutateAutoRun(run.conversation_key, (current) => {
    if (!current || current.run_id !== run.run_id) return current;
    return { ...current, tab_id: candidate };
  });
  return { owner: true, rebound: true, run: rebound };
}

async function commitAutoStart(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let run = await getAutoRun(key);
  if (!run || run.run_id !== runId) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_START_STATE_MISMATCH", error: "Run не найден или не совпадает." };
  }
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(run.tab_id)) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_NON_OWNER_TAB", error: "Start commit пришёл не из owner-вкладки." };
  }
  await assertTabConversation(senderTabId, key, run.conversation_id);
  await assertRunBinding(run);
  const phase = run.start_delivery?.phase || BridgeAutorunModel.START_PHASES.NONE;
  if (phase === BridgeAutorunModel.START_PHASES.CONFIRMED) {
    return { ok: true, committed: true, click_allowed: false, already_confirmed: true };
  }
  if (phase === BridgeAutorunModel.START_PHASES.COMMITTED) {
    // Commit is the irreversible boundary. Even the same content runtime must never receive a second click grant.
    return { ok: true, committed: true, click_allowed: false, already_committed: true };
  }
  if (run.status !== BridgeAutorunModel.RUN_STATUSES.STARTING) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_START_STATE_MISMATCH", error: "Run не находится в start state." };
  }
  let clickAllowed = false;
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.status !== BridgeAutorunModel.RUN_STATUSES.STARTING) return current;
    const currentPhase = current.start_delivery?.phase || BridgeAutorunModel.START_PHASES.NONE;
    if (currentPhase !== BridgeAutorunModel.START_PHASES.NONE) return current;
    clickAllowed = true;
    return BridgeAutorunModel.commitStart(current, {
      baselineUserTurnIds: message.baseline_user_turn_ids,
      actorId
    });
  });
  if (!clickAllowed) {
    return { ok: true, committed: true, click_allowed: false, already_committed: true };
  }
  await diagnostic("START_COMMITTED_BEFORE_CLICK", { run_id: runId, tab_id: senderTabId, actor_id: actorId || null, baseline_user_turn_count: run?.start_delivery?.baseline_user_turn_ids?.length || 0 });
  return { ok: true, committed: true, click_allowed: true, run: publicRun(run) };
}

async function finalizeCommittedStartFromComposerEmpty(key, runId, senderTabId, assistantBaselineIds = [], diagnostics = {}) {
  let didConfirm = false;
  let run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId) return current;
    if (current.start_delivery?.phase === BridgeAutorunModel.START_PHASES.CONFIRMED) return current;
    if (current.status !== BridgeAutorunModel.RUN_STATUSES.STARTING || current.start_delivery?.phase !== BridgeAutorunModel.START_PHASES.COMMITTED) return current;
    didConfirm = true;
    return BridgeAutorunModel.afterConfirmedStart(current, assistantBaselineIds || []);
  });
  if (!didConfirm && run?.start_delivery?.phase !== BridgeAutorunModel.START_PHASES.CONFIRMED) {
    return { ok: false, code: "AUTO_START_CONFIRM_RACE", error: "Start state изменился конкурентно до подтверждения." };
  }
  if (didConfirm) {
    await diagnostic("START_CONFIRMED", {
      run_id: runId,
      tab_id: senderTabId,
      confirmation_basis: "composer_empty_after_committed_click",
      click_attempts: Number(diagnostics.click_attempts || 0),
      status: run?.status || null
    });
    if (run?.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
    else if (run) await stopWatch(run, `start_complete:${run.status}`);
  }
  return { ok: true, confirmed: true, already_confirmed: !didConfirm, run: publicRun(run) };
}

async function completeAutoStart(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  const run = await getAutoRun(key);
  if (!run || run.run_id !== runId) {
    return { ok: false, code: "AUTO_START_STATE_MISMATCH", error: "Run не найден или не совпадает." };
  }
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(run.tab_id)) {
    return { ok: false, code: "AUTO_NON_OWNER_TAB", error: "Start confirmation пришёл не из owner-вкладки." };
  }
  await assertTabConversation(senderTabId, key, run.conversation_id);
  await assertRunBinding(run);
  if (run.start_delivery?.phase === BridgeAutorunModel.START_PHASES.CONFIRMED) {
    return { ok: true, confirmed: true, already_confirmed: true, run: publicRun(run) };
  }
  if (run.status !== BridgeAutorunModel.RUN_STATUSES.STARTING) {
    return { ok: false, code: "AUTO_START_STATE_MISMATCH", error: "Run не находится в start state." };
  }
  if (run.start_delivery?.phase !== BridgeAutorunModel.START_PHASES.COMMITTED) {
    return { ok: false, code: "AUTO_START_NOT_COMMITTED", error: "Start ещё не committed." };
  }
  if (message.reconcile !== true && run.start_delivery?.commit_actor_id && actorId && run.start_delivery.commit_actor_id !== actorId) {
    return { ok: false, code: "AUTO_START_ACTOR_MISMATCH", error: "Start confirmation пришёл от другого content runtime." };
  }

  // Reference parity: for the normal start path, a committed click followed by an empty composer is the confirmation boundary.
  // Reconciliation may prove the same fact by locating the already-created user turn, but no user-turn DOM match is required here.
  if (message.composer_empty !== true) {
    await diagnostic("START_CONFIRMATION_PENDING", { run_id: runId, tab_id: senderTabId, click_attempts: Number(message.click_attempts || 0), confirmation_basis: "composer_not_empty" }, { level: "warning" });
    return { ok: true, confirmed: false, pending_reconciliation: true, run: publicRun(run) };
  }
  return await finalizeCommittedStartFromComposerEmpty(key, runId, senderTabId, message.assistant_baseline_ids || [], {
    click_attempts: message.click_attempts
  });
}

function startRecoveryPayload(run) {
  return {
    type: "dispatch_start",
    run_id: run.run_id,
    conversation_key: run.conversation_key,
    origin: run.origin,
    conversation_id: run.conversation_id,
    message_text: String(run.start_delivery?.message_text || "")
  };
}

function deliveryRecoveryPayload(run, type) {
  return {
    type,
    owner_kind: "autorun",
    owner_id: run.run_id,
    run_id: run.run_id,
    conversation_key: run.conversation_key,
    origin: run.origin,
    conversation_id: run.conversation_id,
    delivery_id: run.delivery?.delivery_id || "",
    delivery_mode: run.delivery?.mode || "legacy",
    delivery_phase: run.delivery?.phase || null,
    request_id: run.delivery?.request_id || "",
    outgoing_text: String(run.delivery?.outgoing_text || ""),
    outgoing_hash: run.delivery?.outgoing_hash || "",
    report_prefix_applied: run.delivery?.report_prefix_applied === true,
    baseline_user_turn_ids: Array.isArray(run.delivery?.baseline_user_turn_ids) ? run.delivery.baseline_user_turn_ids : [],
    baseline_assistant_turn_ids: Array.isArray(run.delivery?.baseline_assistant_turn_ids) ? run.delivery.baseline_assistant_turn_ids : []
  };
}

async function recoveryPayloadForRun(run) {
  if (!run || BridgeAutorunModel.isTerminalStatus(run.status)) return null;
  await assertRunBinding(run);
  const decision = BridgeAutorunModel.recoveryDecision(run, WORKER_SESSION_ID);
  if (decision.type === "unsafe_request_outcome") {
    const previousWorkerSessionId = run.status === BridgeAutorunModel.RUN_STATUSES.COLLECTING
      ? (run.batch?.request_worker_session_id || null)
      : (run.request_worker_session_id || null);
    const failed = await markRunError(run.conversation_key, decision.code, "Service worker перезапустился во время Ozon API request. Исход запроса неизвестен; автоматический повтор запрещён, чтобы не создать второй provider API-вызов.");
    await diagnostic("REQUEST_RECOVERY_BLOCKED_NO_RETRY", { run_id: run.run_id, previous_worker_session_id: previousWorkerSessionId, worker_session_id: WORKER_SESSION_ID }, { level: "error" });
    return { type: "request_outcome_unknown", code: decision.code, run: publicRun(failed) };
  }
  if (decision.type === "dispatch_start") return startRecoveryPayload(run);
  if (decision.type === "reconcile_start") {
    return {
      ...startRecoveryPayload(run),
      type: "reconcile_start",
      baseline_user_turn_ids: Array.isArray(run.start_delivery?.baseline_user_turn_ids) ? run.start_delivery.baseline_user_turn_ids : []
    };
  }
  if (decision.type === "resume_collection") {
    setTimeout(() => { void processAutoBatch(run.conversation_key, run.run_id); }, 0);
    return { type: "collection_resuming", run_id: run.run_id };
  }
  if (decision.type === "deliver_claimed") return deliveryRecoveryPayload(run, "deliver_claimed");
  if (decision.type === "watch_delivery") return deliveryRecoveryPayload(run, "watch_delivery");
  if (decision.type === "unsafe_insert_outcome") {
    await diagnostic("DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY", { run_id: run.run_id, delivery_id: run.delivery?.delivery_id || null, phase: run.delivery?.phase || null }, { level: "error" });
    return { ...deliveryRecoveryPayload(run, "delivery_insert_outcome_unknown"), code: decision.code };
  }
  if (decision.type === "reconcile_delivery") return deliveryRecoveryPayload(run, "reconcile_delivery");
  if (decision.type === "request_in_progress") return { type: "request_in_progress", run_id: run.run_id };
  if (decision.type === "paused") return { type: "paused", run_id: run.run_id };
  return null;
}

async function startAutoRun(conversationKey, tabId) {
  const key = normalizeConversationKey(conversationKey);
  const tab = normalizeTabId(tabId);
  const liveIdentity = await assertTabConversation(tab, key);
  await migrateLegacyConversationStorage(liveIdentity);
  const binding = await strictBindingForIdentity(liveIdentity);
  const settings = await getSettings();
  OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: true });
  if (!Object.values(OzonContract.OPERATIONS).some((meta) => meta.execution_enabled === true)) throw Object.assign(new Error("Ozon provider execution gate закрыт: нет ни одной implementation-ready READ operation."), { code: "PROVIDER_GATE_CLOSED" });
  if (await getManualMode(key)) throw Object.assign(new Error("Сначала отключите ручной режим Ozon."), { code: "MANUAL_MODE_ACTIVE" });
  const manualOperation = await getManualOperation(key);
  if (manualOperationActive(manualOperation)) {
    await diagnostic("AUTO_MODE_START_BLOCKED_BY_MANUAL_OPERATION", { operation_id: manualOperation.operation_id || null, status: manualOperation.status || null, conversation_id: liveIdentity.conversation_id || null, tab_id: tab }, { level: "warning" });
    throw Object.assign(new Error("Дождитесь завершения уже принятого ручного Ozon request/delivery."), { code: "MANUAL_OPERATION_ACTIVE" });
  }
  const existing = await getAutoRun(key);
  if (existing && !BridgeAutorunModel.isTerminalStatus(existing.status)) {
    throw Object.assign(new Error("Для этого диалога уже существует активный Ozon autorun."), { code: "AUTO_RUN_ALREADY_ACTIVE" });
  }

  const startPrompt = await getAutoStartPrompt(key);
  const now = new Date().toISOString();
  let run = {
    run_id: `ozrun-${crypto.randomUUID()}`,
    conversation_key: key,
    origin: liveIdentity.origin,
    conversation_id: liveIdentity.conversation_id,
    binding_snapshot: bindingSnapshot(binding),
    tab_id: tab,
    status: BridgeAutorunModel.RUN_STATUSES.STARTING,
    sequence: 0,
    pause_requested: false,
    finish_requested: false,
    assistant_baseline_ids: [],
    watch_id: null,
    last_assistant_turn_id: null,
    last_command_fingerprint: null,
    last_operation: null,
    last_command_summary: null,
    last_error: null,
    start_delivery: {
      phase: BridgeAutorunModel.START_PHASES.NONE,
      message_text: String(startPrompt.text || ""),
      baseline_user_turn_ids: [],
      commit_actor_id: null,
      committed_at: null,
      confirmed_at: null
    },
    delivery: null,
    last_confirmed_delivery_id: null,
    last_confirmed_report_prefix_applied: false,
    last_confirmed_user_turn_id: null,
    created_at: now,
    updated_at: now
  };
  run = await mutateAutoRun(key, () => run);

  // Report prefix is deliberately NOT read or applied here. It belongs only to post-API result delivery.
  await diagnostic("START_DISPATCH_REQUESTED", { run_id: run.run_id, tab_id: tab });
  const response = await tabMessage(tab, {
    type: "OZ_AUTO_SEND_START",
    run_id: run.run_id,
    conversation_key: key,
    origin: run.origin,
    conversation_id: run.conversation_id,
    message_text: startPrompt.text
  });
  await diagnostic("START_DISPATCH_RESPONSE", {
    run_id: run.run_id,
    tab_id: tab,
    ok: response?.ok === true,
    committed: response?.committed === true,
    composer_empty: response?.composer_empty === true,
    click_attempts: Number(response?.click_attempts || 0),
    code: response?.code || null,
    error: response?.error || null
  }, { level: response?.ok === true ? "info" : "warning" });

  run = await getAutoRun(key) || run;
  if (response?.ok && response?.composer_empty === true) {
    const finalized = await finalizeCommittedStartFromComposerEmpty(
      key,
      run.run_id,
      tab,
      Array.isArray(response.assistant_baseline_ids) ? response.assistant_baseline_ids : [],
      { click_attempts: response.click_attempts }
    );
    if (!finalized?.ok) throw Object.assign(new Error(finalized?.error || "Start composer confirmation failed."), { code: finalized?.code || "AUTO_START_CONFIRM_FAILED" });
    await diagnostic("START_SEND_COMPLETED", { run_id: run.run_id, tab_id: tab, click_attempts: Number(response?.click_attempts || 0) });
    return finalized.run;
  }
  if (!response?.ok) {
    if ((run.start_delivery?.phase || BridgeAutorunModel.START_PHASES.NONE) === BridgeAutorunModel.START_PHASES.NONE) {
      run = await markRunError(key, response?.code || "AUTO_START_FAILED", response?.error || "Не удалось подготовить/отправить стартовое сообщение autorun.");
      throw Object.assign(new Error(response?.error || "Не удалось отправить стартовое сообщение autorun."), { code: response?.code || "AUTO_START_FAILED" });
    }
    // After commit the click outcome can be ambiguous. Never auto-resend; leave STARTING for reconciliation.
    await diagnostic("START_RESPONSE_LOST_AFTER_COMMIT", { run_id: run.run_id, phase: run.start_delivery?.phase || null }, { level: "warning" });
  } else if ((run.start_delivery?.phase || BridgeAutorunModel.START_PHASES.NONE) === BridgeAutorunModel.START_PHASES.COMMITTED) {
    await diagnostic("START_CONFIRMATION_PENDING", { run_id: run.run_id, tab_id: tab, click_attempts: Number(response?.click_attempts || 0), confirmation_basis: "composer_not_empty" }, { level: "warning" });
  }
  return publicRun(await getAutoRun(key) || run);
}

async function handleAutoPreExecutionError(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const assistantTurnId = String(message.assistant_turn_id || "").slice(0, 240);
  const senderTabId = Number(sender?.tab?.id || 0);
  const currentRun = await getAutoRun(key);
  if (!currentRun || currentRun.run_id !== runId) return { ok: false, accepted: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(currentRun.tab_id)) {
    return { ok: false, accepted: false, code: "AUTO_NON_OWNER_TAB", error: "Ошибка OZON_API_V1 обнаружена не во вкладке-owner активного autorun." };
  }
  try {
    await assertTabConversation(senderTabId, key, currentRun.conversation_id);
    await assertRunBinding(currentRun);
  } catch (error) {
    return { ok: false, accepted: false, code: error.code || "CONVERSATION_MISMATCH", error: error.message };
  }
  if (await getManualMode(key)) return { ok: false, paused: true, code: "MANUAL_MODE_ACTIVE", error: "Ручной режим включён; autorun не доставляет ошибку команды." };

  const sourceError = Object.assign(new Error(String(message.error_message || "Ozon Autorun не смог обработать команду до API-вызова.")), {
    code: String(message.error_code || "AUTO_PREEXEC_ERROR")
  });
  const safe = OzonContract.safeBridgeErrorPayload(sourceError, 0);
  const stage = String(message.error_stage || "pre_execution").slice(0, 80);
  const preexec = buildPreExecutionErrorResult({
    error: sourceError,
    stage,
    commandFingerprint: String(message.command_fingerprint || ""),
    requestIdPrefix: "auto-preexec"
  });
  const fingerprint = preexec.command_fingerprint;
  const requestId = preexec.request_id;
  const reportText = preexec.report_text;
  const prefixed = await applyPrefixToReport(key, reportText);
  const outgoingHash = await sha256Hex(prefixed.outgoing_text);
  const deliveryId = `delivery-${crypto.randomUUID()}`;
  let deliveryGranted = false;

  const run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId) return current;
    if (Number(current.tab_id) !== senderTabId) return current;
    if (current.status !== BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) return current;
    if (current.last_assistant_turn_id === assistantTurnId && current.last_command_fingerprint === fingerprint) return current;
    deliveryGranted = true;
    const claimed = BridgeAutorunModel.claimDelivery({
      ...current,
      last_assistant_turn_id: assistantTurnId,
      last_command_fingerprint: fingerprint,
      last_operation: null,
      last_command_summary: `pre_execution_error:${safe.code}`,
      last_error: {
        code: safe.code,
        message: safe.message,
        stage,
        external_request_executed: false,
        recoverable: true,
        at: new Date().toISOString()
      }
    }, {
      deliveryId,
      requestId,
      outgoingText: prefixed.outgoing_text,
      outgoingHash,
      reportPrefixApplied: prefixed.report_prefix_applied === true
    });
    claimed.request_worker_session_id = null;
    claimed.request_completed_at = new Date().toISOString();
    return claimed;
  });

  if (!run || run.run_id !== runId) return { ok: false, accepted: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
  if (!deliveryGranted) return { ok: true, accepted: false, ignored: true, status: run.status };

  await diagnostic("AUTO_PREEXEC_ERROR_ACCEPTED", {
    run_id: runId,
    tab_id: senderTabId,
    assistant_turn_id: assistantTurnId || null,
    stage,
    code: safe.code,
    command_fingerprint: fingerprint,
    delivery_id: deliveryId,
    request_id: requestId,
    external_request_executed: false,
    outgoing_hash: outgoingHash
  }, { level: "warning" });
  await diagnostic("DELIVERY_CLAIMED", {
    run_id: runId,
    delivery_id: deliveryId,
    request_id: requestId,
    report_prefix_applied: prefixed.report_prefix_applied === true,
    outgoing_hash: outgoingHash,
    source: "pre_execution_error"
  }, { level: "warning" });

  void attemptAutoDelivery(key, runId);
  return {
    ok: false,
    bridge_error: true,
    pre_execution_error: true,
    accepted: true,
    request_id: requestId,
    operation: null,
    command_fingerprint: fingerprint,
    http_status: 0,
    report_text: reportText,
    ...prefixed,
    run_id: runId,
    delivery_id: deliveryId,
    outgoing_hash: outgoingHash,
    sequence: Number(run.sequence || 0),
    external_request_executed: false
  };
}

function batchEntryFromDiscovery(entry) {
  if (entry?.ok === true) {
    return {
      kind: "command",
      status: "pending",
      operation: entry.command.operation,
      command_text: entry.command_text,
      command: entry.command,
      command_fingerprint: entry.command_fingerprint,
      request_id: null,
      http_status: null,
      external_request_executed: null,
      report_text: null
    };
  }
  const sourceError = Object.assign(new Error(String(entry?.message || "Некорректная OZON_API_V1 команда.")), { code: String(entry?.code || "INVALID_COMMAND") });
  return batchErrorEntry(sourceError, String(entry?.stage || "command_discovery"), String(entry?.command_fingerprint || ""), entry?.attempt_descriptor || null);
}

function batchErrorEntry(error, stage = "command_discovery", commandFingerprint = "", attemptDescriptor = null) {
  const sourceError = error instanceof Error ? error : Object.assign(new Error(String(error || "Некорректная OZON_API_V1 команда.")), { code: "INVALID_COMMAND" });
  const safe = OzonContract.safeBridgeErrorPayload(sourceError, 0);
  return {
    kind: "pre_execution_error",
    status: "pending",
    error: {
      code: safe.code,
      message: safe.message,
      stage: String(stage || "command_discovery").slice(0, 80),
      command_fingerprint: String(commandFingerprint || "").trim().toLowerCase(),
      attempt_descriptor: attemptDescriptor || null
    },
    request_id: null,
    http_status: 0,
    external_request_executed: false,
    report_text: null
  };
}

function discoverBatchEntries(text) {
  const source = String(text || "");
  const apiCount = source.split(OzonRuntime.RUNTIME.commandPrefix).length - 1;
  const helpCountV1 = source.split(OzonRuntime.RUNTIME.helpPrefix).length - 1;
  const helpCountV2 = source.split(OzonRuntime.RUNTIME.helpPrefixV2 || "OZON_HELP_V2").length - 1;
  const helpCount = helpCountV1 + helpCountV2;
  if (apiCount && helpCount) return [batchErrorEntry(Object.assign(new Error("OZON_HELP нельзя смешивать с OZON_API_V1 в одном assistant response."), { code: "MIXED_HELP_AND_API" }), "guidance_discovery", OzonContract.textFingerprint(source))];
  if (helpCount) {
    const help = OzonGuidance.parseHelp(source);
    if (!help.ok) return [{ kind: "guidance", status: "pending", guidance: { status: "guidance_error", cluster: null, section: null, version: helpCountV2 ? 2 : 1, error: help.code }, request_id: null, http_status: 0, external_request_executed: false, report_text: null }];
    return [{ kind: "guidance", status: "pending", guidance: { status: help.section ? "section_selected" : "cluster_selected", cluster: help.cluster, section: help.section || null, version: help.version || 1, error: null }, request_id: null, http_status: 0, external_request_executed: false, report_text: null }];
  }
  return OzonContract.discoverCommands(source).map(batchEntryFromDiscovery);
}

function localGuidanceResult(entry) {
  const error = entry?.error || {};
  const descriptor = error.attempt_descriptor || OzonContract.sanitizedAttemptDescriptor(null, error.code || "INVALID_COMMAND");
  const classified = entry?.kind === "guidance" ? entry.guidance : OzonGuidance.classify(descriptor);
  const status = String(classified.status || "cluster_required");
  const cluster = classified.cluster || null;
  const section = classified.section || null;
  const version = Number(classified.version || 1) >= 2 ? 2 : 1;
  const payload = OzonGuidance.result({ status, cluster, section, version, error: error.code || classified.error || null, descriptor });
  return { request_id: `guidance-${crypto.randomUUID()}`, report_text: OzonGuidance.format(payload), status, cluster, section, version, external_request_executed: false };
}

function safeBatchCapabilitySummary(batch) {
  const resolution = batch?.capability_resolution;
  if (!resolution || typeof resolution !== "object") return { performed: false, status: "not_resolved", subscription_type: null, http_status: 0, error_code: null };
  const profile = resolution.profile && typeof resolution.profile === "object" ? resolution.profile : {};
  return {
    performed: resolution.probe_performed === true || profile.probe_performed === true,
    status: String(profile.status || (resolution.state === "not_needed" ? "not_needed" : "unknown")),
    subscription_type: profile.subscription_type ? String(profile.subscription_type) : null,
    http_status: Number(profile.probe_http_status || 0),
    error_code: profile.probe_error_code ? String(profile.probe_error_code).slice(0, 160) : null
  };
}

function formatCombinedBatchReport(entries, batch = null) {
  const reports = (Array.isArray(entries) ? entries : []).map((entry) => String(entry?.report_text || "").trim()).filter(Boolean);
  const capabilitySummary = safeBatchCapabilitySummary(batch);
  const queryPlannerSummary = safeBatchQueryPlannerSummary(batch, entries);
  const header = {
    bridge: "ozon-llm-api-bridge",
    version: VERSION,
    delivery_mode: "sequential_batch_single_delivery",
    result_count: reports.length,
    capability_probe: capabilitySummary,
    query_planner: queryPlannerSummary
  };
  const parts = ["OZON_BATCH_RESULT_V1", JSON.stringify(header, null, 2)];
  reports.forEach((report, index) => {
    parts.push(`===== OZON RESULT ${index + 1}/${reports.length} =====`, report);
  });
  return parts.join("\n\n");
}

async function ensureBatchLocalPolicy({ ownerKind, ownerId, getOwner, mutateOwner, ownerMatches, isCollecting, failOwner }) {
  let owner = await getOwner();
  if (!owner || !ownerMatches(owner)) return { ok: false, code: "BATCH_OWNER_NOT_ACTIVE" };
  if (!isCollecting(owner) || !owner.batch) return { ok: true, code: "BATCH_NOT_COLLECTING", owner };
  if (owner.batch.policy_state === "complete") return { ok: true, code: "BATCH_POLICY_READY", owner };
  if (Math.max(0, Number(owner.batch.next_index || 0)) !== 0 || (owner.batch.entries || []).some((entry) => entry?.status === "requesting" || entry?.status === "complete")) {
    await failOwner("BATCH_POLICY_MIGRATION_UNSAFE", "Batch уже начал исполнение до применения personal-data policy; новые provider requests запрещены.");
    return { ok: false, code: "BATCH_POLICY_MIGRATION_UNSAFE" };
  }
  const settings = await getSettings();
  const personalDataEnabled = settings.personalDataEnabled === true;
  const nextEntries = (owner.batch.entries || []).map((entry) => {
    if (!entry || entry.kind !== "command" || !entry.command) return entry;
    const meta = OzonOperationRegistry.operation(entry.command.operation);
    if (meta?.policy_group !== "personal_data_read" || personalDataEnabled) return entry;
    return {
      ...entry,
      kind: "policy_error",
      status: "pending",
      error: {
        code: "OPERATION_DISABLED_BY_USER",
        message: "Операция может передать личные данные в AI-чат. Чтобы выполнить запрос, включите «Показывать личные данные» в настройках Ozon Bridge, затем явно запустите новую команду.",
        policy: "personal_data_setting_required"
      },
      execution_command: null,
      planning: null
    };
  });
  let stored = false;
  owner = await mutateOwner((current) => {
    if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch || current.batch.policy_state === "complete") return current;
    if (Math.max(0, Number(current.batch.next_index || 0)) !== 0 || current.batch.request_state !== "idle") return current;
    stored = true;
    return { ...current, batch: { ...current.batch, entries: nextEntries, policy_state: "complete", policy_personal_data_enabled: personalDataEnabled, policy_completed_at: new Date().toISOString() } };
  });
  if (!stored) {
    await failOwner("BATCH_POLICY_STORE_RACE", "Personal-data policy не удалось сохранить до provider execution; business requests запрещены.");
    return { ok: false, code: "BATCH_POLICY_STORE_RACE" };
  }
  const blockedCount = nextEntries.filter((entry) => entry?.kind === "policy_error").length;
  if (blockedCount) await diagnostic("PERSONAL_DATA_POLICY_BLOCKED", { owner_kind: ownerKind, owner_id: ownerId, blocked_count: blockedCount, external_request_executed: false }, { level: "warning" });
  return { ok: true, code: "BATCH_POLICY_READY", owner };
}

function capabilityUnknownProfile(code = "CAPABILITY_PROBE_OUTCOME_UNKNOWN_NO_RETRY") {
  return Object.freeze({
    status: "unknown",
    subscription_type: "UNKNOWN",
    is_premium: null,
    probe_performed: true,
    probe_http_status: 0,
    probe_error_code: String(code || "CAPABILITY_PROBE_OUTCOME_UNKNOWN_NO_RETRY").slice(0, 160)
  });
}

async function ensureBatchCapabilityAndPlanning({ ownerKind, ownerId, getOwner, mutateOwner, ownerMatches, isCollecting, failOwner }) {
  let owner = await getOwner();
  if (!owner || !ownerMatches(owner)) return { ok: false, code: "BATCH_OWNER_NOT_ACTIVE" };
  if (!isCollecting(owner) || !owner.batch) return { ok: true, code: "BATCH_NOT_COLLECTING", owner };
  if (owner.batch.planning_state === "complete") return { ok: true, code: "BATCH_PLANNING_READY", owner };

  const entries = Array.isArray(owner.batch.entries) ? owner.batch.entries : [];
  const nextIndex = Math.max(0, Number(owner.batch.next_index || 0));
  if (nextIndex > 0 || entries.some((entry) => entry?.status === "requesting" || entry?.status === "complete")) {
    await failOwner("BATCH_PLANNING_MIGRATION_UNSAFE", "Batch уже начал исполнение без Step 1 capability plan; новые provider requests запрещены.");
    return { ok: false, code: "BATCH_PLANNING_MIGRATION_UNSAFE" };
  }

  const commandEntries = entries.filter((entry) => entry?.kind === "command" && entry?.command);
  const planningAtMs = Date.now();
  const settingsForPlanning = await getSettings();
  const entitlementSnapshot = settingsForPlanning.sellerApiMetadata;
  const capabilityRequired = commandEntries.some((entry) => {
    try { return OzonContract.sellerCapabilityRequirement(entry.command, planningAtMs, entitlementSnapshot).required === true; }
    catch (_) { return false; }
  });

  let resolution = owner.batch.capability_resolution && typeof owner.batch.capability_resolution === "object" ? owner.batch.capability_resolution : null;
  if (!capabilityRequired) {
    const profile = { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false, probe_http_status: 0, probe_error_code: null };
    owner = await mutateOwner((current) => {
      if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch || current.batch.planning_state === "complete") return current;
      if (Math.max(0, Number(current.batch.next_index || 0)) !== 0 || current.batch.request_state !== "idle") return current;
      return { ...current, batch: { ...current.batch, capability_resolution: { state: "not_needed", probe_performed: false, profile, resolved_at: new Date().toISOString() } } };
    });
    resolution = owner?.batch?.capability_resolution || { state: "not_needed", profile };
  } else {
    if (resolution?.state === "requesting" && String(resolution.request_worker_session_id || "") !== WORKER_SESSION_ID) {
      const profile = capabilityUnknownProfile();
      owner = await mutateOwner((current) => {
        if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
        const live = current.batch.capability_resolution;
        if (live?.state !== "requesting" || String(live.request_worker_session_id || "") === WORKER_SESSION_ID) return current;
        return { ...current, batch: { ...current.batch, capability_resolution: { state: "complete", probe_performed: true, profile, resolved_at: new Date().toISOString(), request_worker_session_id: null } } };
      });
      resolution = owner?.batch?.capability_resolution || { state: "complete", profile };
      await diagnostic("CAPABILITY_PROBE_RECOVERY_NO_RETRY", { owner_kind: ownerKind, owner_id: ownerId, code: profile.probe_error_code }, { level: "warning" });
    }

    if (!resolution || !["complete", "not_needed"].includes(String(resolution.state || ""))) {
      let probeGranted = false;
      owner = await mutateOwner((current) => {
        if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
        if (current.batch.planning_state === "complete") return current;
        const live = current.batch.capability_resolution;
        if (live?.state === "complete" || live?.state === "not_needed") return current;
        if (live?.state === "requesting") return current;
        if (Math.max(0, Number(current.batch.next_index || 0)) !== 0 || current.batch.request_state !== "idle") return current;
        probeGranted = true;
        return {
          ...current,
          batch: {
            ...current.batch,
            capability_resolution: {
              state: "requesting",
              probe_performed: true,
              request_worker_session_id: WORKER_SESSION_ID,
              started_at: new Date().toISOString(),
              profile: null
            }
          }
        };
      });
      if (probeGranted) {
        await diagnostic("CAPABILITY_PROBE_STARTED", { owner_kind: ownerKind, owner_id: ownerId, path_alias: "seller_info_internal" });
        const profile = await OzonProvider.resolveSellerCapability(settingsForPlanning.sellerCredentials);
        let stored = false;
        owner = await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          const live = current.batch.capability_resolution;
          if (live?.state !== "requesting" || live?.request_worker_session_id !== WORKER_SESSION_ID) return current;
          stored = true;
          return { ...current, batch: { ...current.batch, capability_resolution: { state: "complete", probe_performed: true, profile, resolved_at: new Date().toISOString(), request_worker_session_id: null } } };
        });
        if (!stored) {
          await failOwner("CAPABILITY_PROBE_STORE_RACE", "Capability probe завершился, но durable batch state изменился; business requests запрещены.");
          return { ok: false, code: "CAPABILITY_PROBE_STORE_RACE" };
        }
        await diagnostic("CAPABILITY_PROBE_FINISHED", {
          owner_kind: ownerKind, owner_id: ownerId, status: profile.status, subscription_type: profile.subscription_type, http_status: profile.probe_http_status, error_code: profile.probe_error_code
        }, { level: profile.status === "known" ? "info" : "warning" });
        resolution = owner.batch.capability_resolution;
      } else {
        owner = await getOwner();
        resolution = owner?.batch?.capability_resolution || null;
        if (resolution?.state === "requesting" && resolution.request_worker_session_id === WORKER_SESSION_ID) return { ok: true, code: "CAPABILITY_PROBE_IN_PROGRESS", owner };
        if (!resolution || !["complete", "not_needed"].includes(String(resolution.state || ""))) return { ok: false, code: "CAPABILITY_PROBE_NOT_READY" };
      }
    }
  }

  owner = await getOwner();
  if (!owner || !ownerMatches(owner) || !isCollecting(owner) || !owner.batch) return { ok: false, code: "BATCH_OWNER_NOT_ACTIVE" };
  if (owner.batch.planning_state === "complete") return { ok: true, code: "BATCH_PLANNING_READY", owner };
  const profile = owner.batch.capability_resolution?.profile || { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false, probe_http_status: 0, probe_error_code: null };
  let plannedEntries;
  try {
    plannedEntries = (owner.batch.entries || []).map((entry) => {
      if (!entry || entry.kind !== "command" || !entry.command) return entry;
      const plan = OzonContract.planCommandForSellerCapability(entry.command, profile, planningAtMs, entitlementSnapshot);
      if (plan.action === "reject") {
        return {
          ...entry,
          kind: "planning_error",
          status: "pending",
          error: { code: String(plan.error?.code || "CAPABILITY_PLANNING_REJECTED"), message: String(plan.error?.message || "Capability planning rejected command.") },
          execution_command: null,
          planning: plan.planning || null
        };
      }
      return { ...entry, execution_command: plan.command, planning: plan.planning || null };
    });
  } catch (error) {
    await failOwner(error.code || "BATCH_CAPABILITY_PLANNING_FAILED", error.message || String(error));
    return { ok: false, code: error.code || "BATCH_CAPABILITY_PLANNING_FAILED" };
  }

  let planningStored = false;
  owner = await mutateOwner((current) => {
    if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
    if (current.batch.planning_state === "complete") return current;
    if (Math.max(0, Number(current.batch.next_index || 0)) !== 0 || current.batch.request_state !== "idle") return current;
    planningStored = true;
    return {
      ...current,
      batch: {
        ...current.batch,
        entries: plannedEntries,
        planning_state: "complete",
        planning_at_ms: planningAtMs,
        planning_completed_at: new Date().toISOString()
      }
    };
  });
  if (!planningStored) {
    await failOwner("BATCH_PLANNING_STORE_RACE", "Capability plan не удалось сохранить до provider execution; business requests запрещены.");
    return { ok: false, code: "BATCH_PLANNING_STORE_RACE" };
  }
  await diagnostic("BATCH_CAPABILITY_PLANNING_COMPLETED", {
    owner_kind: ownerKind,
    owner_id: ownerId,
    capability_probe_performed: owner.batch.capability_resolution?.probe_performed === true,
    capability_status: owner.batch.capability_resolution?.profile?.status || "not_needed",
    planned_command_count: plannedEntries.filter((entry) => entry?.kind === "command").length,
    planning_error_count: plannedEntries.filter((entry) => entry?.kind === "planning_error").length
  });
  return { ok: true, code: "BATCH_PLANNING_READY", owner };
}

function safeBatchQueryPlannerSummary(batch, entries = []) {
  const plan = batch?.query_plan && typeof batch.query_plan === "object" ? batch.query_plan : {};
  const groups = Array.isArray(plan.groups) ? plan.groups : [];
  const completed = Array.isArray(entries) ? entries : [];
  const businessEntries = completed.filter((entry) => entry?.external_request_executed === true);
  const physicalIds = new Set();
  for (const entry of businessEntries) {
    const identity = String(entry?.physical_request_id || entry?.request_id || "").trim();
    if (identity) physicalIds.add(identity);
  }
  return {
    status: String(batch?.query_planning_state || "not_planned"),
    coalesced_group_count: groups.length,
    coalesced_logical_count: groups.reduce((total, group) => total + (Array.isArray(group?.member_indexes) ? group.member_indexes.length : 0), 0),
    logical_business_result_count: businessEntries.length,
    physical_business_request_count: physicalIds.size
  };
}

function buildBatchQueryPlan(entries) {
  const source = Array.isArray(entries) ? entries : [];
  const plannedEntries = source.map((entry) => entry && typeof entry === "object" ? { ...entry } : entry);
  const groups = [];
  let index = 0;
  while (index < plannedEntries.length) {
    const first = plannedEntries[index];
    if (!first || first.kind !== "command" || !first.command) {
      index += 1;
      continue;
    }
    const firstExecution = first.execution_command || first.command;
    let firstDescriptor;
    try {
      firstDescriptor = OzonContract.analyticsCoalescingDescriptor(firstExecution);
    } catch (_) {
      index += 1;
      continue;
    }
    if (!firstDescriptor?.eligible) {
      index += 1;
      continue;
    }

    const memberIndexes = [index];
    const executionCommands = [firstExecution];
    const unionMetrics = [...firstDescriptor.metrics];
    const seenMetrics = new Set(unionMetrics);
    let cursor = index + 1;
    while (cursor < plannedEntries.length) {
      const candidate = plannedEntries[cursor];
      if (!candidate || candidate.kind !== "command" || !candidate.command) break;
      const candidateExecution = candidate.execution_command || candidate.command;
      let descriptor;
      try {
        descriptor = OzonContract.analyticsCoalescingDescriptor(candidateExecution);
      } catch (_) {
        break;
      }
      if (!descriptor?.eligible || descriptor.compatibility_key !== firstDescriptor.compatibility_key) break;
      const nextUnion = [...unionMetrics];
      const nextSeen = new Set(seenMetrics);
      for (const metric of descriptor.metrics) {
        if (!nextSeen.has(metric)) {
          nextSeen.add(metric);
          nextUnion.push(metric);
        }
      }
      if (nextUnion.length > 14) break;
      memberIndexes.push(cursor);
      executionCommands.push(candidateExecution);
      unionMetrics.splice(0, unionMetrics.length, ...nextUnion);
      seenMetrics.clear();
      for (const metric of nextSeen) seenMetrics.add(metric);
      cursor += 1;
    }

    if (memberIndexes.length < 2) {
      index += 1;
      continue;
    }

    const physical = OzonContract.buildAnalyticsCoalescedCommand(executionCommands);
    const physicalFingerprint = OzonContract.commandFingerprint(physical.command);
    const groupId = `analytics-${memberIndexes[0]}-${physical.compatibility_fingerprint}-${physicalFingerprint}`;
    const group = {
      group_id: groupId,
      operation: "analytics_data",
      leader_index: memberIndexes[0],
      member_indexes: [...memberIndexes],
      physical_command: physical.command,
      physical_command_fingerprint: physicalFingerprint,
      physical_metrics: [...physical.metrics],
      compatibility_fingerprint: physical.compatibility_fingerprint
    };
    groups.push(group);
    for (const memberIndex of memberIndexes) {
      plannedEntries[memberIndex] = {
        ...plannedEntries[memberIndex],
        query_group_id: groupId,
        query_group_leader_index: memberIndexes[0]
      };
    }
    index = cursor;
  }
  return Object.freeze({
    version: 1,
    strategy: "contiguous_analytics_metric_union",
    groups: groups.map((group) => Object.freeze({ ...group, member_indexes: Object.freeze([...group.member_indexes]), physical_metrics: Object.freeze([...group.physical_metrics]) })),
    entries: plannedEntries
  });
}

async function ensureBatchQueryPlanning({ ownerKind, ownerId, getOwner, mutateOwner, ownerMatches, isCollecting, failOwner }) {
  let owner = await getOwner();
  if (!owner || !ownerMatches(owner)) return { ok: false, code: "BATCH_OWNER_NOT_ACTIVE" };
  if (!isCollecting(owner) || !owner.batch) return { ok: true, code: "BATCH_NOT_COLLECTING", owner };
  if (owner.batch.query_planning_state === "complete") return { ok: true, code: "BATCH_QUERY_PLANNING_READY", owner };
  if (owner.batch.planning_state !== "complete") {
    await failOwner("BATCH_QUERY_PLANNING_BEFORE_CAPABILITY", "Query planning запрещён до завершения Step 1 capability/entitlement planning.");
    return { ok: false, code: "BATCH_QUERY_PLANNING_BEFORE_CAPABILITY" };
  }
  const entries = Array.isArray(owner.batch.entries) ? owner.batch.entries : [];
  const nextIndex = Math.max(0, Number(owner.batch.next_index || 0));
  if (nextIndex > 0 || entries.some((entry) => entry?.status === "requesting" || entry?.status === "complete")) {
    await failOwner("BATCH_QUERY_PLANNING_MIGRATION_UNSAFE", "Batch уже начал business execution без Step 2 query plan; новые provider requests запрещены.");
    return { ok: false, code: "BATCH_QUERY_PLANNING_MIGRATION_UNSAFE" };
  }

  let queryPlan;
  try {
    queryPlan = buildBatchQueryPlan(entries);
  } catch (error) {
    await failOwner(error.code || "BATCH_QUERY_PLANNING_FAILED", error.message || String(error));
    return { ok: false, code: error.code || "BATCH_QUERY_PLANNING_FAILED" };
  }

  let stored = false;
  owner = await mutateOwner((current) => {
    if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
    if (current.batch.query_planning_state === "complete") return current;
    if (current.batch.planning_state !== "complete") return current;
    if (Math.max(0, Number(current.batch.next_index || 0)) !== 0 || current.batch.request_state !== "idle") return current;
    if ((current.batch.entries || []).some((entry) => entry?.status === "requesting" || entry?.status === "complete")) return current;
    stored = true;
    return {
      ...current,
      batch: {
        ...current.batch,
        entries: queryPlan.entries,
        query_planning_state: "complete",
        query_plan: {
          version: queryPlan.version,
          strategy: queryPlan.strategy,
          groups: queryPlan.groups,
          completed_at: new Date().toISOString()
        }
      }
    };
  });
  if (!stored) {
    owner = await getOwner();
    if (owner?.batch?.query_planning_state === "complete") return { ok: true, code: "BATCH_QUERY_PLANNING_READY", owner };
    await failOwner("BATCH_QUERY_PLANNING_STORE_RACE", "Query plan не удалось сохранить до provider execution; business requests запрещены.");
    return { ok: false, code: "BATCH_QUERY_PLANNING_STORE_RACE" };
  }
  await diagnostic("BATCH_QUERY_PLANNING_COMPLETED", {
    owner_kind: ownerKind,
    owner_id: ownerId,
    coalesced_group_count: queryPlan.groups.length,
    coalesced_logical_count: queryPlan.groups.reduce((total, group) => total + group.member_indexes.length, 0)
  });
  return { ok: true, code: "BATCH_QUERY_PLANNING_READY", owner };
}

function findBatchQueryGroup(batch, groupId) {
  const groups = Array.isArray(batch?.query_plan?.groups) ? batch.query_plan.groups : [];
  return groups.find((group) => String(group?.group_id || "") === String(groupId || "")) || null;
}

function coalescedPlanningForEntry(entry, group, physicalRequestId, physicalFingerprint, cacheMeta = null) {
  const base = entry?.planning && typeof entry.planning === "object" ? entry.planning : {};
  const logicalFingerprint = String(entry?.command_fingerprint || OzonContract.commandFingerprint(entry?.command));
  const withCache = cachePlanning(base, cacheMeta);
  return {
    ...withCache,
    execution: {
      ...(withCache.execution && typeof withCache.execution === "object" ? withCache.execution : {}),
      logical_command_fingerprint: logicalFingerprint,
      physical_command_fingerprint: String(physicalFingerprint || group?.physical_command_fingerprint || ""),
      command_transformed: logicalFingerprint !== String(physicalFingerprint || group?.physical_command_fingerprint || ""),
      coalesced: true,
      physical_request_id: physicalRequestId ? String(physicalRequestId) : null,
      coalescing_group_id: String(group?.group_id || ""),
      coalesced_logical_count: Array.isArray(group?.member_indexes) ? group.member_indexes.length : 0,
      physical_metrics: Array.isArray(group?.physical_metrics) ? [...group.physical_metrics] : [],
      projected_metrics: Array.isArray(entry?.execution_command?.params?.metrics) ? [...entry.execution_command.params.metrics] : (Array.isArray(entry?.command?.params?.metrics) ? [...entry.command.params.metrics] : [])
    }
  };
}

function buildCoalescedLogicalResult(entry, group, physicalResult, projectionError = null) {
  const command = OzonContract.normalizeCommand(entry.command);
  const preflight = OzonContract.preflightExecution(command);
  const physicalRequestId = physicalResult?.request_id || physicalResult?.physical_attempt_id || null;
  const physicalFingerprint = physicalResult?.executed_command_fingerprint || group?.physical_command_fingerprint || null;
  const planning = coalescedPlanningForEntry(entry, group, physicalRequestId, physicalFingerprint, physicalResult?.cache || null);
  const requestId = `logical-${crypto.randomUUID()}`;
  const externalRequestExecuted = physicalResult?.external_request_executed !== false;
  let resultPayload;
  let bridgeError = false;
  let safeError = null;
  if (projectionError) {
    safeError = OzonContract.safeBridgeErrorPayload(projectionError, Number(physicalResult?.http_status || 0));
    resultPayload = { error: { ...safeError, stage: "query_projection", external_request_executed: externalRequestExecuted } };
    bridgeError = true;
  } else if (physicalResult?.ok === true) {
    const logicalMetrics = Array.isArray(entry?.execution_command?.params?.metrics) ? entry.execution_command.params.metrics : entry.command.params.metrics;
    resultPayload = OzonContract.projectAnalyticsDataResult(physicalResult.result, group.physical_metrics, logicalMetrics);
  } else {
    resultPayload = physicalResult?.result && typeof physicalResult.result === "object"
      ? physicalResult.result
      : { error: OzonContract.safeBridgeErrorPayload(Object.assign(new Error("Coalesced provider request failed without a safe result payload."), { code: "COALESCED_PROVIDER_RESULT_MISSING" }), Number(physicalResult?.http_status || 0)) };
  }
  const reportText = OzonContract.formatResultReport({
    requestId,
    command,
    requestMeta: {
      host_alias: String(physicalResult?.provider || preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: externalRequestExecuted,
      capability_probe_executed: planning?.capability?.probe_performed === true,
      capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0),
      physical_request_id: physicalRequestId,
      physical_command_fingerprint: physicalFingerprint,
      coalescing_group_id: group.group_id,
      coalesced_logical_count: group.member_indexes.length
    },
    httpStatus: Number(physicalResult?.http_status || 0),
    result: resultPayload,
    elapsedMs: Number(physicalResult?.elapsed_ms || 0),
    pagination: null,
    rateLimit: physicalResult?.rate_limit || null,
    planning
  });
  return Object.freeze({
    ok: projectionError ? false : physicalResult?.ok === true,
    bridge_error: bridgeError,
    request_id: requestId,
    physical_request_id: physicalRequestId,
    operation: command.operation,
    command_fingerprint: String(entry.command_fingerprint || OzonContract.commandFingerprint(command)),
    executed_command_fingerprint: physicalFingerprint,
    http_status: Number(physicalResult?.http_status || 0),
    report_text: reportText,
    error: safeError,
    external_request_executed: externalRequestExecuted
  });
}

function buildCoalescedExecutionErrorResult(entry, group, error, elapsedMs = 0, physicalAttemptId = null) {
  const command = OzonContract.normalizeCommand(entry.command);
  const preflight = OzonContract.preflightExecution(command);
  const safe = OzonContract.safeBridgeErrorPayload(error, Number(error?.http_status || 0));
  const physicalFingerprint = group?.physical_command_fingerprint || null;
  const planning = coalescedPlanningForEntry(entry, group, physicalAttemptId, physicalFingerprint);
  const requestId = `logical-${crypto.randomUUID()}`;
  const reportText = OzonContract.formatResultReport({
    requestId,
    command,
    requestMeta: {
      host_alias: String(preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: safe.external_request_executed === true,
      capability_probe_executed: planning?.capability?.probe_performed === true,
      capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0),
      physical_request_id: physicalAttemptId,
      physical_command_fingerprint: physicalFingerprint,
      coalescing_group_id: group.group_id,
      coalesced_logical_count: group.member_indexes.length
    },
    httpStatus: Number(safe.http_status || 0),
    result: { error: { ...safe, external_request_executed: safe.external_request_executed === true } },
    elapsedMs: Math.max(0, Number(elapsedMs || 0)),
    pagination: null,
    rateLimit: error?.rate_limit || null,
    planning
  });
  return Object.freeze({
    ok: false,
    bridge_error: true,
    request_id: requestId,
    physical_request_id: physicalAttemptId,
    operation: command.operation,
    command_fingerprint: String(entry.command_fingerprint || OzonContract.commandFingerprint(command)),
    executed_command_fingerprint: physicalFingerprint,
    http_status: Number(safe.http_status || 0),
    report_text: reportText,
    error: safe,
    external_request_executed: safe.external_request_executed === true
  });
}

function buildCachedSingleResult(entry, cacheHit) {
  const command = OzonContract.normalizeCommand(entry.command);
  const executionCommand = OzonContract.normalizeCommand(entry.execution_command || entry.command);
  const preflight = OzonContract.preflightExecution(command);
  const cacheMeta = safeAnalyticsCacheMetadata(cacheHit?.cache);
  const planning = cachePlanning(entry.planning || null, cacheMeta);
  const requestId = `cache-${crypto.randomUUID()}`;
  const executionFingerprint = OzonContract.commandFingerprint(executionCommand);
  const reportText = OzonContract.formatResultReport({
    requestId,
    command,
    requestMeta: {
      host_alias: String(preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: false,
      capability_probe_executed: planning?.capability?.probe_performed === true,
      capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0),
      physical_command_fingerprint: executionFingerprint
    },
    httpStatus: Number(cacheHit?.http_status || 200),
    result: cacheHit.result,
    elapsedMs: 0,
    pagination: null,
    rateLimit: null,
    planning
  });
  return Object.freeze({
    ok: true,
    cache_hit: true,
    request_id: requestId,
    physical_request_id: null,
    operation: command.operation,
    command_fingerprint: String(entry.command_fingerprint || OzonContract.commandFingerprint(command)),
    executed_command_fingerprint: executionFingerprint,
    http_status: Number(cacheHit?.http_status || 200),
    report_text: reportText,
    result: cacheHit.result,
    external_request_executed: false,
    cache: cacheMeta
  });
}

function projectPrefetchedSingleResult(entry, providerResult, profile) {
  if (providerResult?.ok !== true || !profile?.applicable) return providerResult;
  const executionCommand = OzonContract.normalizeCommand(entry.execution_command || entry.command);
  const requestedMetrics = Array.isArray(executionCommand.params?.metrics) ? executionCommand.params.metrics : [];
  const physicalMetrics = Array.isArray(profile.physical_metrics) ? profile.physical_metrics : requestedMetrics;
  const projected = OzonContract.projectAnalyticsDataResult(providerResult.result, physicalMetrics, requestedMetrics);
  const command = OzonContract.normalizeCommand(entry.command);
  const preflight = OzonContract.preflightExecution(command);
  const planning = acquisitionPlanning(entry.planning || null, profile);
  const reportText = OzonContract.formatResultReport({
    requestId: providerResult.request_id,
    command,
    requestMeta: {
      host_alias: String(providerResult.provider || preflight.meta.provider || "seller_api"),
      http_method: preflight.meta.method,
      path_alias: command.operation,
      external_request_executed: true,
      capability_probe_executed: planning?.capability?.probe_performed === true,
      capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0),
      physical_request_id: providerResult.request_id || null,
      physical_command_fingerprint: providerResult.executed_command_fingerprint || OzonContract.commandFingerprint(profile.command)
    },
    httpStatus: Number(providerResult.http_status || 0),
    result: projected,
    elapsedMs: Number(providerResult.elapsed_ms || 0),
    pagination: null,
    rateLimit: providerResult.rate_limit || null,
    planning
  });
  return Object.freeze({
    ...providerResult,
    report_text: reportText,
    result: projected,
    external_request_executed: true,
    acquisition_profile: profile.profile_id || null
  });
}

async function persistBatchQuotaWait({ ownerKind, ownerId, nextIndex, quota, mutateOwner, ownerMatches, isCollecting, groupId = null }) {
  let stored = false;
  const safe = safeQuotaMetadata(quota);
  await mutateOwner((current) => {
    if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
    if (Number(current.batch.next_index || 0) !== Number(nextIndex)) return current;
    if (current.batch.request_state === "requesting") return current;
    stored = true;
    return {
      ...current,
      batch: {
        ...current.batch,
        request_state: "quota_waiting",
        request_worker_session_id: null,
        quota_wait: {
          ...safe,
          owner_kind: String(ownerKind || "batch"),
          owner_id: String(ownerId || "").slice(0, 200),
          queue_index: Number(nextIndex),
          coalescing_group_id: groupId ? String(groupId).slice(0, 120) : null,
          waiting_since: new Date().toISOString()
        }
      }
    };
  });
  if (stored) {
    await diagnostic("PROVIDER_QUOTA_WAITING", {
      owner_kind: ownerKind,
      owner_id: ownerId,
      queue_index: Number(nextIndex),
      quota_family: safe?.family || null,
      next_allowed_at: Number(safe?.next_allowed_at || 0),
      min_interval_ms: Number(safe?.min_interval_ms || 0),
      credential_scope_id: safe?.credential_scope_id || null
    });
    scheduleProviderQuotaWake(Number(safe?.next_allowed_at || Date.now() + 1000));
  }
  return stored;
}

function processBatchQueue({
  conversationKey,
  ownerKind,
  ownerId,
  getOwner,
  mutateOwner,
  ownerMatches,
  isCollecting,
  failOwner,
  finalizeOwner
}) {
  const key = normalizeConversationKey(conversationKey);
  const flightKey = `${String(ownerKind || "batch")}:${String(ownerId || "")}`;
  return singleFlight(batchCollectionRequests, flightKey, async () => {
    const initialOwner = await getOwner();
    const initialEntries = Array.isArray(initialOwner?.batch?.entries) ? initialOwner.batch.entries : [];
    // Guidance and policy blocks are local results. Personal-data policy is
    // applied before any subscription probe, quota/cache scheduling or provider call.
    if (initialEntries.some((entry) => entry?.kind === "command")) {
      const policyPrepared = await ensureBatchLocalPolicy({ ownerKind, ownerId, getOwner, mutateOwner, ownerMatches, isCollecting, failOwner });
      if (!policyPrepared?.ok) return policyPrepared || { ok: false, code: "BATCH_POLICY_FAILED" };
      const afterPolicy = await getOwner();
      const remainingCommands = Array.isArray(afterPolicy?.batch?.entries) ? afterPolicy.batch.entries.some((entry) => entry?.kind === "command") : false;
      if (remainingCommands) {
        const prepared = await ensureBatchCapabilityAndPlanning({ ownerKind, ownerId, getOwner, mutateOwner, ownerMatches, isCollecting, failOwner });
        if (!prepared?.ok) return prepared || { ok: false, code: "BATCH_PLANNING_FAILED" };
        if (prepared.code === "CAPABILITY_PROBE_IN_PROGRESS") return { ok: true, code: "CAPABILITY_PROBE_IN_PROGRESS" };
        const queryPrepared = await ensureBatchQueryPlanning({ ownerKind, ownerId, getOwner, mutateOwner, ownerMatches, isCollecting, failOwner });
        if (!queryPrepared?.ok) return queryPrepared || { ok: false, code: "BATCH_QUERY_PLANNING_FAILED" };
      }
    }
    while (true) {
      let owner = await getOwner();
      if (!owner || !ownerMatches(owner)) return { ok: false, code: "BATCH_OWNER_NOT_ACTIVE" };
      if (!isCollecting(owner) || !owner.batch) return { ok: true, code: "BATCH_NOT_COLLECTING", status: owner.status || null };

      const entries = Array.isArray(owner.batch.entries) ? owner.batch.entries : [];
      const nextIndex = Math.max(0, Number(owner.batch.next_index || 0));
      if (nextIndex >= entries.length) return await finalizeOwner(owner, entries);

      const entry = entries[nextIndex];
      if (!entry) {
        await failOwner("BATCH_ENTRY_MISSING", `Batch entry ${nextIndex} отсутствует.`);
        return { ok: false, code: "BATCH_ENTRY_MISSING" };
      }
      if (entry.status === "complete") {
        await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          return { ...current, batch: { ...current.batch, next_index: nextIndex + 1 } };
        });
        continue;
      }
      if (entry.status === "requesting") {
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

      if (entry.kind === "pre_execution_error" || entry.kind === "guidance") {
        const guidance = localGuidanceResult(entry);
        if (entry.kind === "pre_execution_error") await diagnostic("GUIDANCE_ATTEMPT_CLASSIFIED", { owner_kind: ownerKind, owner_id: ownerId, code: entry.error?.code || "INVALID_COMMAND", status: guidance.status, cluster: guidance.cluster, external_request_executed: false });
        else await diagnostic("GUIDANCE_CLUSTER_SELECTED", { owner_kind: ownerKind, owner_id: ownerId, status: guidance.status, cluster: guidance.cluster, external_request_executed: false });
        const result = guidance;
        let stored = false;
        await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          const currentEntries = [...(current.batch.entries || [])];
          const currentEntry = currentEntries[nextIndex];
          if (!currentEntry || currentEntry.status !== "pending") return current;
          currentEntries[nextIndex] = {
            ...currentEntry,
            status: "complete",
            request_id: result.request_id,
            http_status: 0,
            external_request_executed: false,
            report_text: result.report_text,
            request_completed_at: new Date().toISOString()
          };
          stored = true;
          return {
            ...current,
            batch: {
              ...current.batch,
              entries: currentEntries,
              next_index: nextIndex + 1,
              request_state: "idle",
              request_worker_session_id: null
            }
          };
        });
        if (!stored) return { ok: false, code: "BATCH_ENTRY_STORE_RACE" };
        await diagnostic("BATCH_PREEXEC_RESULT_STORED", {
          owner_kind: ownerKind,
          owner_id: ownerId,
          queue_index: nextIndex,
          code: entry.error?.code || entry.guidance?.status || "GUIDANCE",
          external_request_executed: false
        }, { level: "warning" });
        continue;
      }

      if (entry.kind === "policy_error") {
        const result = buildPersonalDataPolicyErrorResult(entry.command, entry.command_fingerprint);
        let stored = false;
        await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          const currentEntries = [...(current.batch.entries || [])];
          const currentEntry = currentEntries[nextIndex];
          if (!currentEntry || currentEntry.status !== "pending" || currentEntry.kind !== "policy_error") return current;
          currentEntries[nextIndex] = { ...currentEntry, status: "complete", request_id: result.request_id, http_status: 0, external_request_executed: false, report_text: result.report_text, request_completed_at: new Date().toISOString() };
          stored = true;
          return { ...current, batch: { ...current.batch, entries: currentEntries, next_index: nextIndex + 1, request_state: "idle", request_worker_session_id: null } };
        });
        if (!stored) return { ok: false, code: "BATCH_POLICY_RESULT_STORE_RACE" };
        await diagnostic("BATCH_PERSONAL_DATA_POLICY_RESULT_STORED", { owner_kind: ownerKind, owner_id: ownerId, queue_index: nextIndex, operation: entry.operation, code: "OPERATION_DISABLED_BY_USER", external_request_executed: false }, { level: "warning" });
        continue;
      }

      if (entry.kind === "planning_error") {
        const plan = { error: entry.error || {}, planning: entry.planning || null };
        const result = buildCapabilityPlanningErrorResult(entry.command, entry.command_fingerprint, plan);
        let stored = false;
        await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          const currentEntries = [...(current.batch.entries || [])];
          const currentEntry = currentEntries[nextIndex];
          if (!currentEntry || currentEntry.status !== "pending" || currentEntry.kind !== "planning_error") return current;
          currentEntries[nextIndex] = {
            ...currentEntry,
            status: "complete",
            request_id: result.request_id,
            http_status: 0,
            external_request_executed: false,
            report_text: result.report_text,
            request_completed_at: new Date().toISOString()
          };
          stored = true;
          return { ...current, batch: { ...current.batch, entries: currentEntries, next_index: nextIndex + 1, request_state: "idle", request_worker_session_id: null } };
        });
        if (!stored) return { ok: false, code: "BATCH_PLANNING_RESULT_STORE_RACE" };
        await diagnostic("BATCH_CAPABILITY_RESULT_STORED", {
          owner_kind: ownerKind, owner_id: ownerId, queue_index: nextIndex, operation: entry.operation, code: entry.error?.code || "CAPABILITY_PLANNING_REJECTED", external_request_executed: false
        }, { level: "warning" });
        continue;
      }

      if (entry.kind === "command" && entry.query_group_id) {
        const group = findBatchQueryGroup(owner.batch, entry.query_group_id);
        if (!group || Number(group.leader_index) !== nextIndex || !Array.isArray(group.member_indexes) || group.member_indexes.length < 2) {
          await failOwner("BATCH_QUERY_PLAN_CORRUPT", "Durable query plan не совпадает с текущим queue index; provider request запрещён.");
          return { ok: false, code: "BATCH_QUERY_PLAN_CORRUPT" };
        }
        const expectedIndexes = group.member_indexes.map((value) => Number(value));
        if (expectedIndexes.some((value, offset) => value !== nextIndex + offset)) {
          await failOwner("BATCH_QUERY_PLAN_NONCONTIGUOUS", "Step 2 coalescing допускает только contiguous logical commands; provider request запрещён.");
          return { ok: false, code: "BATCH_QUERY_PLAN_NONCONTIGUOUS" };
        }

        const groupCacheHit = await readAnalyticsResultCacheForCurrentSettings(group.physical_command);
        if (groupCacheHit.hit === true) {
          const members = expectedIndexes.map((memberIndex) => owner.batch.entries[memberIndex]);
          const virtualPhysicalResult = {
            ok: true,
            request_id: null,
            physical_attempt_id: null,
            provider: "seller_api",
            executed_command_fingerprint: group.physical_command_fingerprint,
            http_status: Number(groupCacheHit.http_status || 200),
            result: groupCacheHit.result,
            elapsed_ms: 0,
            rate_limit: null,
            external_request_executed: false,
            cache: groupCacheHit.cache
          };
          const logicalResults = members.map((member) => buildCoalescedLogicalResult(member, group, virtualPhysicalResult));
          let cacheStored = false;
          owner = await mutateOwner((current) => {
            if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
            if (Number(current.batch.next_index || 0) !== nextIndex) return current;
            if (current.batch.request_state === "requesting") return current;
            const currentEntries = [...(current.batch.entries || [])];
            for (let offset = 0; offset < expectedIndexes.length; offset += 1) {
              const memberIndex = expectedIndexes[offset];
              const currentEntry = currentEntries[memberIndex];
              const logicalResult = logicalResults[offset];
              if (!currentEntry || currentEntry.status !== "pending" || !logicalResult) return current;
              currentEntries[memberIndex] = {
                ...currentEntry,
                status: "complete",
                request_id: logicalResult.request_id || null,
                physical_request_id: null,
                http_status: Number(logicalResult.http_status || 0),
                external_request_executed: false,
                executed_command_fingerprint: group.physical_command_fingerprint || null,
                cache_hit: true,
                report_text: String(logicalResult.report_text || ""),
                request_completed_at: new Date().toISOString()
              };
            }
            cacheStored = true;
            return { ...current, batch: { ...current.batch, entries: currentEntries, next_index: expectedIndexes[expectedIndexes.length - 1] + 1, request_state: "idle", request_worker_session_id: null, quota_wait: null, request_quota: null } };
          });
          if (!cacheStored) return { ok: false, code: "PROVIDER_CACHE_RESULT_STORE_RACE" };
          await diagnostic("PROVIDER_CACHE_HIT", { owner_kind: ownerKind, owner_id: ownerId, queue_index: nextIndex, logical_count: logicalResults.length, coalescing_group_id: group.group_id, external_request_executed: false });
          continue;
        }

        const quotaDecision = await prepareProviderQuotaForCommand(group.physical_command);
        if (quotaDecision.error) {
          const members = expectedIndexes.map((memberIndex) => owner.batch.entries[memberIndex]);
          const logicalResults = members.map((member) => buildCoalescedExecutionErrorResult(member, group, quotaDecision.error, 0, null));
          let stored = false;
          owner = await mutateOwner((current) => {
            if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
            if (Number(current.batch.next_index || 0) !== nextIndex) return current;
            const currentEntries = [...(current.batch.entries || [])];
            for (let offset = 0; offset < expectedIndexes.length; offset += 1) {
              const memberIndex = expectedIndexes[offset];
              const currentEntry = currentEntries[memberIndex];
              const logicalResult = logicalResults[offset];
              if (!currentEntry || currentEntry.status !== "pending" || !logicalResult) return current;
              currentEntries[memberIndex] = {
                ...currentEntry, status: "complete", request_id: logicalResult.request_id || null, physical_request_id: null,
                http_status: 0, external_request_executed: false, executed_command_fingerprint: group.physical_command_fingerprint || null,
                report_text: String(logicalResult.report_text || ""), request_completed_at: new Date().toISOString()
              };
            }
            stored = true;
            return { ...current, batch: { ...current.batch, entries: currentEntries, next_index: expectedIndexes[expectedIndexes.length - 1] + 1, request_state: "idle", request_worker_session_id: null, quota_wait: null, request_quota: null } };
          });
          if (!stored) return { ok: false, code: "PROVIDER_QUOTA_ERROR_STORE_RACE" };
          await diagnostic("PROVIDER_QUOTA_STATE_UNAVAILABLE", { owner_kind: ownerKind, owner_id: ownerId, queue_index: nextIndex, logical_count: logicalResults.length, external_request_executed: false }, { level: "error" });
          continue;
        }
        if (quotaDecision.required && !quotaDecision.allowed) {
          await persistBatchQuotaWait({ ownerKind, ownerId, nextIndex, quota: quotaDecision.quota, mutateOwner, ownerMatches, isCollecting, groupId: group.group_id });
          return { ok: true, code: "PROVIDER_QUOTA_WAITING", next_allowed_at: Number(quotaDecision.quota?.next_allowed_at || 0) };
        }

        let groupGranted = false;
        owner = await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          if (current.batch.query_planning_state !== "complete" || !["idle", "quota_waiting"].includes(String(current.batch.request_state || "idle"))) return current;
          const liveGroup = findBatchQueryGroup(current.batch, entry.query_group_id);
          if (!liveGroup || Number(liveGroup.leader_index) !== nextIndex) return current;
          const currentEntries = [...(current.batch.entries || [])];
          for (const memberIndex of expectedIndexes) {
            const member = currentEntries[memberIndex];
            if (!member || member.kind !== "command" || member.status !== "pending" || String(member.query_group_id || "") !== String(group.group_id)) return current;
          }
          const startedAt = new Date().toISOString();
          for (const memberIndex of expectedIndexes) currentEntries[memberIndex] = { ...currentEntries[memberIndex], status: "requesting", request_started_at: startedAt };
          groupGranted = true;
          return {
            ...current,
            last_operation: "analytics_data",
            batch: {
              ...current.batch,
              entries: currentEntries,
              request_state: "requesting",
              request_worker_session_id: WORKER_SESSION_ID,
              quota_wait: null,
              request_quota: safeQuotaMetadata(quotaDecision.quota)
            }
          };
        });
        if (!groupGranted) continue;

        const liveEntries = owner.batch.entries;
        const liveMembers = expectedIndexes.map((memberIndex) => liveEntries[memberIndex]);
        const liveLeader = liveMembers[0];
        await diagnostic("BATCH_COALESCED_REQUEST_STARTED", {
          owner_kind: ownerKind,
          owner_id: ownerId,
          queue_index: nextIndex,
          queue_total: liveEntries.length,
          coalescing_group_id: group.group_id,
          logical_count: liveMembers.length,
          physical_command_fingerprint: group.physical_command_fingerprint,
          physical_metrics: group.physical_metrics
        });

        const requestStartedAt = Date.now();
        const physicalAttemptId = `physical-attempt-${crypto.randomUUID()}`;
        let physicalResult = null;
        let logicalResults;
        try {
          physicalResult = { ...(await executeOzonCore(liveLeader.command_text, {
            executionCommand: group.physical_command,
            planning: coalescedPlanningForEntry(liveLeader, group, physicalAttemptId, group.physical_command_fingerprint),
            quotaPermit: quotaDecision.quota
          })), physical_attempt_id: physicalAttemptId };
          if (physicalResult.ok === true) {
            await storeAnalyticsResultCacheForCurrentSettings(group.physical_command, physicalResult, null);
            try {
              logicalResults = liveMembers.map((member) => buildCoalescedLogicalResult(member, group, physicalResult));
            } catch (projectionError) {
              logicalResults = liveMembers.map((member) => buildCoalescedLogicalResult(member, group, physicalResult, projectionError));
              await diagnostic("BATCH_COALESCED_PROJECTION_FAILED", {
                owner_kind: ownerKind,
                owner_id: ownerId,
                coalescing_group_id: group.group_id,
                physical_request_id: physicalResult.request_id || null,
                code: String(projectionError?.code || "ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE")
              }, { level: "error" });
            }
          } else {
            logicalResults = liveMembers.map((member) => buildCoalescedLogicalResult(member, group, physicalResult));
          }
        } catch (error) {
          logicalResults = liveMembers.map((member) => buildCoalescedExecutionErrorResult(member, group, error, Date.now() - requestStartedAt, physicalAttemptId));
        }

        let stored = false;
        owner = await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          if (current.batch.request_state !== "requesting" || current.batch.request_worker_session_id !== WORKER_SESSION_ID) return current;
          const currentEntries = [...(current.batch.entries || [])];
          for (let offset = 0; offset < expectedIndexes.length; offset += 1) {
            const memberIndex = expectedIndexes[offset];
            const currentEntry = currentEntries[memberIndex];
            const logicalResult = logicalResults[offset];
            if (!currentEntry || currentEntry.status !== "requesting" || String(currentEntry.query_group_id || "") !== String(group.group_id) || !logicalResult) return current;
          }
          const completedAt = new Date().toISOString();
          for (let offset = 0; offset < expectedIndexes.length; offset += 1) {
            const memberIndex = expectedIndexes[offset];
            const currentEntry = currentEntries[memberIndex];
            const logicalResult = logicalResults[offset];
            currentEntries[memberIndex] = {
              ...currentEntry,
              status: "complete",
              request_id: logicalResult.request_id || null,
              physical_request_id: logicalResult.physical_request_id || physicalResult?.request_id || null,
              http_status: Number(logicalResult.http_status || 0),
              external_request_executed: logicalResult.external_request_executed === true,
              executed_command_fingerprint: logicalResult.executed_command_fingerprint || group.physical_command_fingerprint || null,
              report_text: String(logicalResult.report_text || ""),
              request_completed_at: completedAt
            };
          }
          const firstBridgeError = logicalResults.find((result) => result?.bridge_error === true);
          stored = true;
          return {
            ...current,
            batch: {
              ...current.batch,
              entries: currentEntries,
              next_index: expectedIndexes[expectedIndexes.length - 1] + 1,
              request_state: "idle",
              request_worker_session_id: null,
              quota_wait: null,
              request_quota: null
            },
            last_error: firstBridgeError ? {
              code: firstBridgeError.error?.code || "OZON_BRIDGE_ERROR",
              message: firstBridgeError.error?.message || "Coalesced bridge execution error converted to logical results.",
              at: new Date().toISOString(),
              recoverable: true
            } : null
          };
        });
        if (!stored) {
          await failOwner("BATCH_COALESCED_RESULT_STORE_RACE", "Coalesced Ozon result получен, но durable batch state изменился до atomic logical projection store. Автоматический повтор запрещён.");
          return { ok: false, code: "BATCH_COALESCED_RESULT_STORE_RACE" };
        }
        await diagnostic("BATCH_COALESCED_RESULTS_STORED", {
          owner_kind: ownerKind,
          owner_id: ownerId,
          queue_index: nextIndex,
          logical_count: logicalResults.length,
          physical_request_id: physicalResult?.request_id || null,
          physical_command_fingerprint: physicalResult?.executed_command_fingerprint || group.physical_command_fingerprint || null,
          http_status: Number(physicalResult?.http_status || logicalResults[0]?.http_status || 0),
          external_request_executed: logicalResults.some((result) => result?.external_request_executed === true)
        }, { level: logicalResults.some((result) => result?.ok === false) ? "warning" : "info" });
        continue;
      }

      const requestedPhysicalCommand = entry.execution_command || entry.command;
      const singleCacheHit = await readAnalyticsResultCacheForCurrentSettings(requestedPhysicalCommand);
      if (singleCacheHit.hit === true) {
        const result = buildCachedSingleResult(entry, singleCacheHit);
        let cacheStored = false;
        owner = await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          if (current.batch.request_state === "requesting") return current;
          const currentEntries = [...(current.batch.entries || [])];
          const currentEntry = currentEntries[nextIndex];
          if (!currentEntry || currentEntry.status !== "pending" || currentEntry.kind !== "command") return current;
          currentEntries[nextIndex] = { ...currentEntry, status: "complete", request_id: result.request_id || null, http_status: Number(result.http_status || 0), external_request_executed: false, executed_command_fingerprint: result.executed_command_fingerprint || null, cache_hit: true, report_text: String(result.report_text || ""), request_completed_at: new Date().toISOString() };
          cacheStored = true;
          return { ...current, batch: { ...current.batch, entries: currentEntries, next_index: nextIndex + 1, request_state: "idle", request_worker_session_id: null, quota_wait: null, request_quota: null } };
        });
        if (!cacheStored) return { ok: false, code: "PROVIDER_CACHE_RESULT_STORE_RACE" };
        await diagnostic("PROVIDER_CACHE_HIT", { owner_kind: ownerKind, owner_id: ownerId, queue_index: nextIndex, logical_count: 1, operation: entry.operation, external_request_executed: false });
        continue;
      }
      const acquisitionProfile = OzonContract.reviewedAnalyticsAcquisitionProfile(requestedPhysicalCommand);
      const physicalCommandForQuota = acquisitionProfile?.applicable ? acquisitionProfile.command : requestedPhysicalCommand;
      const executionPlanning = acquisitionPlanning(entry.planning || null, acquisitionProfile);
      const quotaDecision = await prepareProviderQuotaForCommand(physicalCommandForQuota);
      if (quotaDecision.error) {
        const result = buildExecutionErrorResult(entry.command, entry.command_fingerprint, quotaDecision.error, 0, executionPlanning);
        let stored = false;
        owner = await mutateOwner((current) => {
          if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
          if (Number(current.batch.next_index || 0) !== nextIndex) return current;
          const currentEntries = [...(current.batch.entries || [])];
          const currentEntry = currentEntries[nextIndex];
          if (!currentEntry || currentEntry.status !== "pending") return current;
          currentEntries[nextIndex] = { ...currentEntry, status: "complete", request_id: result.request_id || null, http_status: 0, external_request_executed: false, executed_command_fingerprint: null, report_text: String(result.report_text || ""), request_completed_at: new Date().toISOString() };
          stored = true;
          return { ...current, batch: { ...current.batch, entries: currentEntries, next_index: nextIndex + 1, request_state: "idle", request_worker_session_id: null, quota_wait: null, request_quota: null } };
        });
        if (!stored) return { ok: false, code: "PROVIDER_QUOTA_ERROR_STORE_RACE" };
        await diagnostic("PROVIDER_QUOTA_STATE_UNAVAILABLE", { owner_kind: ownerKind, owner_id: ownerId, queue_index: nextIndex, logical_count: 1, external_request_executed: false }, { level: "error" });
        continue;
      }
      if (quotaDecision.required && !quotaDecision.allowed) {
        await persistBatchQuotaWait({ ownerKind, ownerId, nextIndex, quota: quotaDecision.quota, mutateOwner, ownerMatches, isCollecting });
        return { ok: true, code: "PROVIDER_QUOTA_WAITING", next_allowed_at: Number(quotaDecision.quota?.next_allowed_at || 0) };
      }

      let requestGranted = false;
      owner = await mutateOwner((current) => {
        if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
        if (Number(current.batch.next_index || 0) !== nextIndex) return current;
        const currentEntries = [...(current.batch.entries || [])];
        const currentEntry = currentEntries[nextIndex];
        if (!currentEntry || currentEntry.status !== "pending" || currentEntry.kind !== "command") return current;
        requestGranted = true;
        currentEntries[nextIndex] = { ...currentEntry, status: "requesting", request_started_at: new Date().toISOString() };
        return {
          ...current,
          last_operation: currentEntry.operation || null,
          batch: {
            ...current.batch,
            entries: currentEntries,
            request_state: "requesting",
            request_worker_session_id: WORKER_SESSION_ID,
            quota_wait: null,
            request_quota: safeQuotaMetadata(quotaDecision.quota)
          }
        };
      });
      if (!requestGranted) continue;

      const liveEntry = owner.batch.entries[nextIndex];
      await diagnostic("BATCH_REQUEST_STARTED", {
        owner_kind: ownerKind,
        owner_id: ownerId,
        queue_index: nextIndex,
        queue_total: owner.batch.entries.length,
        operation: liveEntry.operation,
        command_fingerprint: liveEntry.command_fingerprint
      });
      let result;
      const requestStartedAt = Date.now();
      try {
        result = await executeOzonCore(liveEntry.command_text, { executionCommand: physicalCommandForQuota, planning: executionPlanning, quotaPermit: quotaDecision.quota });
        if (result?.ok === true && physicalCommandForQuota.operation === "analytics_data") {
          await storeAnalyticsResultCacheForCurrentSettings(physicalCommandForQuota, result, acquisitionProfile);
          result = projectPrefetchedSingleResult(liveEntry, result, acquisitionProfile);
        }
      } catch (error) {
        try {
          result = buildExecutionErrorResult(liveEntry.command, liveEntry.command_fingerprint, error, Date.now() - requestStartedAt, executionPlanning);
        } catch (reportError) {
          await failOwner(reportError.code || "BATCH_ERROR_REPORT_FAILED", reportError.message || String(reportError));
          throw reportError;
        }
      }

      let stored = false;
      owner = await mutateOwner((current) => {
        if (!current || !ownerMatches(current) || !isCollecting(current) || !current.batch) return current;
        if (Number(current.batch.next_index || 0) !== nextIndex) return current;
        if (current.batch.request_state !== "requesting" || current.batch.request_worker_session_id !== WORKER_SESSION_ID) return current;
        const currentEntries = [...(current.batch.entries || [])];
        const currentEntry = currentEntries[nextIndex];
        if (!currentEntry || currentEntry.status !== "requesting") return current;
        currentEntries[nextIndex] = {
          ...currentEntry,
          status: "complete",
          request_id: result.request_id || null,
          http_status: Number(result.http_status || 0),
          external_request_executed: result.external_request_executed !== false && (result.external_request_executed === true || result.bridge_error !== true),
          executed_command_fingerprint: result.executed_command_fingerprint || null,
          report_text: String(result.report_text || ""),
          request_completed_at: new Date().toISOString()
        };
        stored = true;
        return {
          ...current,
          batch: {
            ...current.batch,
            entries: currentEntries,
            next_index: nextIndex + 1,
            request_state: "idle",
            request_worker_session_id: null,
            quota_wait: null,
            request_quota: null
          },
          last_error: result.bridge_error ? {
            code: result.error?.code || "OZON_BRIDGE_ERROR",
            message: result.error?.message || "Bridge execution error converted to batch result.",
            at: new Date().toISOString(),
            recoverable: true
          } : null
        };
      });
      if (!stored) {
        await failOwner("BATCH_RESULT_STORE_RACE", "Ozon result получен, но durable batch state изменился до сохранения. Автоматический повтор запрещён.");
        return { ok: false, code: "BATCH_RESULT_STORE_RACE" };
      }
      await diagnostic("BATCH_RESULT_STORED", {
        owner_kind: ownerKind,
        owner_id: ownerId,
        queue_index: nextIndex,
        queue_total: owner.batch.entries.length,
        operation: liveEntry.operation,
        request_id: result.request_id || null,
        executed_command_fingerprint: result.executed_command_fingerprint || null,
        http_status: Number(result.http_status || 0),
        external_request_executed: result.external_request_executed !== false && (result.external_request_executed === true || result.bridge_error !== true)
      });
    }
  });
}

async function failManualBatch(conversationKey, operationId, code, message) {
  const key = normalizeConversationKey(conversationKey);
  const operation = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId) return current;
    return {
      ...current,
      status: MANUAL_OPERATION_STATUSES.FAILED,
      request_worker_session_id: null,
      completed_at: new Date().toISOString(),
      last_error: { code: String(code || "MANUAL_BATCH_ERROR"), message: String(message || "Manual batch error"), at: new Date().toISOString() }
    };
  });
  await diagnostic("MANUAL_BATCH_FAILED", { operation_id: operationId, code: String(code || "MANUAL_BATCH_ERROR") }, { level: "error" });
  return operation;
}

async function finalizeAutoBatch(conversationKey, runId, entries, batchSnapshot = null) {
  const key = normalizeConversationKey(conversationKey);
  const combinedReport = formatCombinedBatchReport(entries, batchSnapshot);
  const prefixed = await applyPrefixToReport(key, combinedReport);
  const deliveryId = `delivery-${crypto.randomUUID()}`;
  let claimed = false;
  const run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.status !== BridgeAutorunModel.RUN_STATUSES.COLLECTING || !current.batch) return current;
    const currentEntries = Array.isArray(current.batch.entries) ? current.batch.entries : [];
    if (Math.max(0, Number(current.batch.next_index || 0)) < currentEntries.length) return current;
    if (currentEntries.some((entry) => entry?.status !== "complete")) return current;
    claimed = true;
    const next = BridgeAutorunModel.claimDelivery(current, {
      deliveryId,
      requestId: "",
      outgoingText: prefixed.outgoing_text,
      outgoingHash: "",
      reportPrefixApplied: prefixed.report_prefix_applied === true,
      mode: "batch_watch_v1"
    });
    next.batch = {
      ...current.batch,
      phase: "collected",
      request_state: "idle",
      request_worker_session_id: null,
      combined_report_ready: true,
      collected_at: new Date().toISOString()
    };
    return next;
  });
  if (!claimed) return { ok: false, code: "BATCH_FINALIZE_RACE" };
  await diagnostic("BATCH_COLLECTION_COMPLETED", { owner_kind: "autorun", owner_id: runId, result_count: entries.length, delivery_id: deliveryId, report_prefix_applied: prefixed.report_prefix_applied === true });
  void attemptAutoDelivery(key, runId);
  return { ok: true, collected: true, result_count: entries.length, delivery_id: deliveryId };
}

async function finalizeManualBatch(conversationKey, operationId, entries, batchSnapshot = null) {
  const key = normalizeConversationKey(conversationKey);
  const combinedReport = formatCombinedBatchReport(entries, batchSnapshot);
  const prefixed = await applyPrefixToReport(key, combinedReport);
  const deliveryId = `manual-delivery-${crypto.randomUUID()}`;
  let claimed = false;
  const operation = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId || current.status !== MANUAL_OPERATION_STATUSES.REQUESTING || !current.batch) return current;
    const currentEntries = Array.isArray(current.batch.entries) ? current.batch.entries : [];
    if (Math.max(0, Number(current.batch.next_index || 0)) < currentEntries.length) return current;
    if (currentEntries.some((entry) => entry?.status !== "complete")) return current;
    claimed = true;
    const next = BridgeAutorunModel.claimDelivery(current, {
      deliveryId,
      requestId: "",
      outgoingText: prefixed.outgoing_text,
      outgoingHash: "",
      reportPrefixApplied: prefixed.report_prefix_applied === true,
      mode: "batch_watch_v1"
    });
    next.delivery_id = deliveryId;
    next.outgoing_text = prefixed.outgoing_text;
    next.report_prefix_applied = prefixed.report_prefix_applied === true;
    next.request_worker_session_id = null;
    next.batch = {
      ...current.batch,
      phase: "collected",
      request_state: "idle",
      request_worker_session_id: null,
      combined_report_ready: true,
      collected_at: new Date().toISOString()
    };
    return next;
  });
  if (!claimed) return { ok: false, code: "BATCH_FINALIZE_RACE" };
  await diagnostic("BATCH_COLLECTION_COMPLETED", { owner_kind: "manual", owner_id: operationId, result_count: entries.length, delivery_id: deliveryId, report_prefix_applied: prefixed.report_prefix_applied === true });
  void attemptManualBatchDelivery(key, operationId);
  return { ok: true, collected: true, result_count: entries.length, delivery_id: deliveryId, operation };
}

function processAutoBatch(conversationKey, runId) {
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

async function handleAutoMessage(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const assistantTurnId = String(message.assistant_turn_id || "");
  const assistantText = String(message.assistant_text || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  const currentRun = await getAutoRun(key);
  if (!currentRun || currentRun.run_id !== runId) return { ok: false, accepted: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(currentRun.tab_id)) {
    return { ok: false, accepted: false, code: "AUTO_NON_OWNER_TAB", error: "Assistant message появился не во вкладке-owner активного autorun." };
  }
  try {
    await assertTabConversation(senderTabId, key, currentRun.conversation_id);
    await assertRunBinding(currentRun);
  } catch (error) { return { ok: false, accepted: false, code: error.code || "CONVERSATION_MISMATCH", error: error.message }; }
  if (await getManualMode(key)) return { ok: false, paused: true, code: "MANUAL_MODE_ACTIVE", error: "Ручной режим включён; autorun не выполняет команды." };
  if (currentRun.status !== BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) return { ok: true, accepted: false, ignored: true, status: currentRun.status };
  if (assistantTurnId && currentRun.last_assistant_turn_id === assistantTurnId) return { ok: true, accepted: false, ignored: true, status: currentRun.status };

  let entries;
  try { entries = discoverBatchEntries(assistantText); }
  catch (error) {
    return await handleAutoPreExecutionError({
      ...message,
      error_stage: "assistant_message_discovery",
      error_code: error.code || "COMMAND_DISCOVERY_FAILED",
      error_message: error.message || String(error),
      command_fingerprint: OzonContract.textFingerprint(assistantText)
    }, sender);
  }
  if (!entries.length) return { ok: true, accepted: false, ignored: true, code: "NO_OZON_COMMANDS", status: currentRun.status };
  const guidanceOnly = entries.every((entry) => entry?.kind !== "command");
  const nextGuidanceRound = guidanceOnly ? Number(currentRun.guidance_rounds || 0) + 1 : 0;
  const guidanceLimitReached = guidanceOnly && nextGuidanceRound >= 5;
  if (guidanceLimitReached) entries = [{ kind: "guidance", status: "pending", guidance: { status: "guidance_error", cluster: null, error: "GUIDANCE_ROUND_LIMIT" }, request_id: null, http_status: 0, external_request_executed: false, report_text: null }];

  const messageFingerprint = OzonContract.textFingerprint(assistantText);
  let collectionGranted = false;
  const run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.status !== BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) return current;
    if (assistantTurnId && current.last_assistant_turn_id === assistantTurnId) return current;
    collectionGranted = true;
    return {
      ...current,
      status: BridgeAutorunModel.RUN_STATUSES.COLLECTING,
      last_assistant_turn_id: assistantTurnId || null,
      last_command_fingerprint: messageFingerprint,
      last_operation: null,
      last_command_summary: `${entries.length} queued OZON_API_V1 item(s)`,
      last_error: null,
      guidance_rounds: nextGuidanceRound,
      pause_after_guidance_limit: guidanceLimitReached,
      batch: {
        phase: "collecting",
        assistant_turn_id: assistantTurnId || null,
        entries,
        next_index: 0,
        request_state: "idle",
        request_worker_session_id: null,
        planning_state: "pending",
        capability_resolution: null,
        query_planning_state: "pending",
        query_plan: null,
        quota_wait: null,
        request_quota: null,
        created_at: new Date().toISOString()
      }
    };
  });
  if (!collectionGranted) return { ok: true, accepted: false, ignored: true, status: run?.status || null };

  await diagnostic("BATCH_ACCEPTED", {
    run_id: runId,
    tab_id: senderTabId,
    assistant_turn_id: assistantTurnId || null,
    item_count: entries.length,
    command_count: entries.filter((entry) => entry.kind === "command").length,
    pre_execution_error_count: entries.filter((entry) => entry.kind !== "command").length,
    message_fingerprint: messageFingerprint
  });
  if (guidanceLimitReached) await diagnostic("GUIDANCE_ROUND_LIMIT", { run_id: runId, guidance_rounds: nextGuidanceRound, external_request_executed: false }, { level: "warning" });
  void processAutoBatch(key, runId);
  return {
    ok: true,
    accepted: true,
    run_id: runId,
    item_count: entries.length,
    command_count: entries.filter((entry) => entry.kind === "command").length,
    pre_execution_error_count: entries.filter((entry) => entry.kind !== "command").length
  };
}

function attemptAutoDelivery(conversationKey, runId) {
  const key = normalizeConversationKey(conversationKey);
  return singleFlight(deliveryAttemptRequests, String(runId || ""), async () => {
    const run = await getAutoRun(key);
    if (!run || BridgeAutorunModel.isTerminalStatus(run.status)) return { ok: false, code: "AUTO_RUN_NOT_ACTIVE" };
    if (run.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING || !run.delivery) return { ok: false, code: "AUTO_RUN_NOT_DELIVERING" };
    const phase = run.delivery.phase;
    let recoveryType = null;
    if (run.delivery.mode === "batch_watch_v1") {
      if (phase === BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) recoveryType = "deliver_claimed";
      else if (phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) recoveryType = "watch_delivery";
      else if (phase === BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return { ok: false, code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" };
    } else {
      if (phase === BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) recoveryType = "deliver_claimed";
      else if (phase === BridgeAutorunModel.DELIVERY_PHASES.COMMITTED) recoveryType = "reconcile_delivery";
    }
    if (!recoveryType) return { ok: false, code: "AUTO_DELIVERY_NOT_ACTIONABLE" };
    const recovery = deliveryRecoveryPayload(run, recoveryType);
    const pushType = run.delivery.mode === "batch_watch_v1" ? "OZ_BATCH_DELIVERY_AVAILABLE" : "OZ_AUTO_DELIVERY_AVAILABLE";
    const push = await tabMessage(Number(run.tab_id), { type: pushType, recovery });
    await diagnostic("DELIVERY_PUSH_RESPONSE", {
      run_id: run.run_id,
      delivery_id: run.delivery.delivery_id,
      delivery_mode: run.delivery.mode || "legacy",
      phase,
      recovery_type: recoveryType,
      ok: push?.ok === true,
      code: push?.code || null
    }, { level: push?.ok === true ? "info" : "warning" });
    return push;
  });
}

function attemptManualBatchDelivery(conversationKey, operationId) {
  const key = normalizeConversationKey(conversationKey);
  return singleFlight(deliveryAttemptRequests, `manual:${String(operationId || "")}`, async () => {
    const operation = await getManualOperation(key);
    if (!operation || operation.operation_id !== operationId || operation.status !== MANUAL_OPERATION_STATUSES.DELIVERING || operation.delivery?.mode !== "batch_watch_v1") {
      return { ok: false, code: "MANUAL_BATCH_NOT_DELIVERING" };
    }
    let recoveryType = null;
    if (operation.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) recoveryType = "deliver_claimed";
    else if (operation.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) recoveryType = "watch_delivery";
    else if (operation.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return { ok: false, code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" };
    if (!recoveryType) return { ok: false, code: "MANUAL_BATCH_DELIVERY_NOT_ACTIONABLE" };
    const recovery = manualBatchRecoveryPayload(operation, recoveryType);
    const push = await tabMessage(Number(operation.tab_id), { type: "OZ_BATCH_DELIVERY_AVAILABLE", recovery });
    await diagnostic("DELIVERY_PUSH_RESPONSE", {
      owner_kind: "manual",
      owner_id: operationId,
      delivery_id: operation.delivery.delivery_id,
      delivery_mode: "batch_watch_v1",
      phase: operation.delivery.phase,
      recovery_type: recoveryType,
      ok: push?.ok === true,
      code: push?.code || null
    }, { level: push?.ok === true ? "info" : "warning" });
    return push;
  });
}

async function commitManualBatchDeliveryInsert(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const operationId = String(message.owner_id || message.operation_id || "");
  const deliveryId = String(message.delivery_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let operation = await getManualOperation(key);
  if (!operation || operation.operation_id !== operationId || operation.status !== MANUAL_OPERATION_STATUSES.DELIVERING || operation.delivery?.mode !== "batch_watch_v1") {
    return { ok: false, committed: false, insert_allowed: false, code: "MANUAL_DELIVERY_STATE_MISMATCH", error: "Manual batch delivery не находится в ожидаемом state." };
  }
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(operation.tab_id)) return { ok: false, committed: false, insert_allowed: false, code: "MANUAL_NON_OWNER_TAB", error: "Manual batch delivery insert commit пришёл не из owner-вкладки." };
  if (!(await getManualMode(key))) return { ok: false, committed: false, insert_allowed: false, code: "MANUAL_MODE_DISABLED", error: "Ручной режим выключен; pending delivery отменена до вставки отчёта." };
  const liveIdentity = await assertTabConversation(senderTabId, key, operation.conversation_id);
  const binding = await strictBindingForIdentity(liveIdentity);
  if (String(operation.binding_snapshot?.binding_id || "") !== String(binding.binding_id || "")) return { ok: false, committed: false, insert_allowed: false, code: "MANUAL_BINDING_MISMATCH", error: "Manual batch binding изменился." };
  if (operation.delivery?.delivery_id !== deliveryId) return { ok: false, committed: false, insert_allowed: false, code: "MANUAL_DELIVERY_ID_MISMATCH", error: "Delivery ID не совпадает." };
  if (operation.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) return { ok: true, committed: true, insert_allowed: false, already_inserted: true, recovery: manualBatchRecoveryPayload(operation, "watch_delivery") };
  if (operation.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return { ok: true, committed: true, insert_allowed: false, outcome_unknown: true, code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" };
  if (operation.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) return { ok: false, committed: false, insert_allowed: false, code: "MANUAL_DELIVERY_NOT_CLAIMED", error: "Delivery ещё не готов к insertion commit." };
  let insertAllowed = false;
  operation = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId || current.delivery?.delivery_id !== deliveryId || current.delivery?.mode !== "batch_watch_v1") return current;
    if (current.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) return current;
    insertAllowed = true;
    return BridgeAutorunModel.commitDeliveryInsert(current, { deliveryId, actorId, assistantBaselineIds: message.assistant_baseline_ids });
  });
  if (!insertAllowed) return { ok: true, committed: true, insert_allowed: false, outcome_unknown: true, code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" };
  await diagnostic("DELIVERY_INSERT_COMMITTED", { owner_kind: "manual", owner_id: operationId, delivery_id: deliveryId, tab_id: senderTabId, actor_id: actorId || null });
  return { ok: true, committed: true, insert_allowed: true, operation: publicManualOperation(operation) };
}

async function markManualBatchDeliveryInserted(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const operationId = String(message.owner_id || message.operation_id || "");
  const deliveryId = String(message.delivery_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let operation = await getManualOperation(key);
  if (!operation || operation.operation_id !== operationId || operation.status !== MANUAL_OPERATION_STATUSES.DELIVERING || operation.delivery?.mode !== "batch_watch_v1") return { ok: false, inserted: false, code: "MANUAL_DELIVERY_STATE_MISMATCH", error: "Manual batch delivery не находится в expected state." };
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(operation.tab_id)) return { ok: false, inserted: false, code: "MANUAL_NON_OWNER_TAB", error: "Inserted ack пришёл не из owner-вкладки." };
  await assertTabConversation(senderTabId, key, operation.conversation_id);
  if (operation.delivery?.delivery_id !== deliveryId) return { ok: false, inserted: false, code: "MANUAL_DELIVERY_ID_MISMATCH", error: "Delivery ID не совпадает." };
  if (operation.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) return { ok: true, inserted: true, already_inserted: true, recovery: manualBatchRecoveryPayload(operation, "watch_delivery") };
  if (operation.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return { ok: false, inserted: false, code: "MANUAL_DELIVERY_INSERT_NOT_COMMITTED", error: "Insertion не committed." };
  if (operation.delivery.commit_actor_id && actorId && operation.delivery.commit_actor_id !== actorId) return { ok: false, inserted: false, code: "MANUAL_DELIVERY_ACTOR_MISMATCH", error: "Inserted ack пришёл от другого content runtime." };
  let inserted = false;
  operation = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId || current.delivery?.delivery_id !== deliveryId || current.delivery?.mode !== "batch_watch_v1") return current;
    if (current.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return current;
    const next = BridgeAutorunModel.markDeliveryInserted(current, { deliveryId, actorId });
    inserted = next?.delivery?.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED;
    return next;
  });
  if (!inserted) return { ok: false, inserted: false, code: "MANUAL_DELIVERY_INSERT_ACK_RACE", error: "Delivery state изменился до inserted ack." };
  await diagnostic("DELIVERY_INSERTED", { owner_kind: "manual", owner_id: operationId, delivery_id: deliveryId, tab_id: senderTabId });
  return { ok: true, inserted: true, recovery: manualBatchRecoveryPayload(operation, "watch_delivery") };
}

async function completeManualBatchDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const operationId = String(message.owner_id || message.operation_id || "");
  const deliveryId = String(message.delivery_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let operation = await getManualOperation(key);
  if (!operation || operation.operation_id !== operationId) throw Object.assign(new Error("Batch delivery confirmation не соответствует активной manual operation."), { code: "MANUAL_DELIVERY_STATE_MISMATCH" });
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(operation.tab_id)) throw Object.assign(new Error("Batch delivery confirmation пришёл не из owner-вкладки."), { code: "MANUAL_NON_OWNER_TAB" });
  await assertTabConversation(senderTabId, key, operation.conversation_id);
  if (operation.status === MANUAL_OPERATION_STATUSES.COMPLETED && operation.last_confirmed_delivery_id === deliveryId) return publicManualOperation(operation);
  if (operation.status !== MANUAL_OPERATION_STATUSES.DELIVERING || operation.delivery?.mode !== "batch_watch_v1") throw Object.assign(new Error("Manual operation больше не находится в batch delivery state."), { code: "MANUAL_DELIVERY_STATE_MISMATCH" });
  if (!deliveryId || operation.delivery.delivery_id !== deliveryId) throw Object.assign(new Error("Batch delivery ID не совпадает."), { code: "MANUAL_DELIVERY_ID_MISMATCH" });
  if (operation.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERTED) throw Object.assign(new Error("Delivery confirmation разрешён только после confirmed insertion."), { code: "MANUAL_DELIVERY_NOT_INSERTED" });
  const expectedBasis = expectedDeliveryConfirmationBasis(operation.origin);
  const confirmed = message.delivery_confirmed === true && acceptedDeliveryConfirmationBasis(operation.origin, message.confirmation_basis);
  await diagnostic("DELIVERY_CONFIRMATION_RECEIVED", { owner_kind: "manual", owner_id: operationId, delivery_id: deliveryId, delivery_mode: "batch_watch_v1", delivery_confirmed: confirmed, confirmation_basis: String(message.confirmation_basis || ""), click_attempts: Number(message.click_attempts || 0) }, { level: confirmed ? "info" : "warning" });
  if (!confirmed) return publicManualOperation(operation);
  const prefixApplied = operation.delivery.report_prefix_applied === true;
  await noteConfirmedPrefix(key, prefixApplied, deliveryId);
  let didConfirm = false;
  operation = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId) return current;
    if (current.status === MANUAL_OPERATION_STATUSES.COMPLETED && current.last_confirmed_delivery_id === deliveryId) return current;
    if (current.status !== MANUAL_OPERATION_STATUSES.DELIVERING || current.delivery?.delivery_id !== deliveryId || current.delivery?.mode !== "batch_watch_v1" || current.delivery?.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERTED) return current;
    didConfirm = true;
    return {
      ...current,
      status: MANUAL_OPERATION_STATUSES.COMPLETED,
      delivery_confirmed: true,
      last_confirmed_delivery_id: deliveryId,
      last_confirmed_report_prefix_applied: prefixApplied,
      click_attempts: Number(message.click_attempts || 0),
      batch: null,
      delivery: null,
      outgoing_text: null,
      request_worker_session_id: null,
      completed_at: new Date().toISOString(),
      last_error: null
    };
  });
  if (!didConfirm && operation?.last_confirmed_delivery_id !== deliveryId) throw Object.assign(new Error("Manual batch delivery state изменился конкурентно до подтверждения."), { code: "MANUAL_DELIVERY_CONFIRM_RACE" });
  if (didConfirm) await diagnostic("DELIVERY_SUCCESS", { owner_kind: "manual", owner_id: operationId, delivery_id: deliveryId, confirmation_basis: String(message.confirmation_basis || expectedBasis) });
  return publicManualOperation(operation);
}

async function failManualBatchDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const operationId = String(message.owner_id || message.operation_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  const operation = await getManualOperation(key);
  if (!operation || operation.operation_id !== operationId) return null;
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(operation.tab_id)) return publicManualOperation(operation);
  const preserved = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId || current.status !== MANUAL_OPERATION_STATUSES.DELIVERING || !current.delivery) return current;
    return { ...current, last_error: { code: String(message.code || "DELIVERY_FAILED"), message: String(message.error || "Не удалось доставить Ozon batch result в текущий AI."), at: new Date().toISOString(), recoverable: true } };
  });
  await diagnostic("DELIVERY_FAILED_BUT_PRESERVED", { owner_kind: "manual", owner_id: operationId, delivery_id: operation.delivery?.delivery_id || null, phase: operation.delivery?.phase || null, code: message.code || "DELIVERY_FAILED" }, { level: "warning" });
  return publicManualOperation(preserved);
}

async function completeBatchDelivery(message, sender) {
  return String(message.owner_kind || "autorun") === "manual"
    ? await completeManualBatchDelivery(message, sender)
    : await completeBatchAutoDelivery({ ...message, run_id: String(message.owner_id || message.run_id || "") }, sender);
}

async function failBatchDelivery(message, sender) {
  return String(message.owner_kind || "autorun") === "manual"
    ? await failManualBatchDelivery(message, sender)
    : await failAutoDelivery({ ...message, run_id: String(message.owner_id || message.run_id || "") }, sender);
}

async function commitBatchDeliveryInsert(message, sender) {
  if (String(message.owner_kind || "autorun") === "manual") return await commitManualBatchDeliveryInsert(message, sender);
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let run = await getAutoRun(key);
  if (!run || run.run_id !== runId || run.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING || run.delivery?.mode !== "batch_watch_v1") {
    return { ok: false, committed: false, insert_allowed: false, code: "AUTO_DELIVERY_STATE_MISMATCH", error: "Batch delivery не находится в ожидаемом state." };
  }
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(run.tab_id)) {
    return { ok: false, committed: false, insert_allowed: false, code: "AUTO_NON_OWNER_TAB", error: "Batch delivery insert commit пришёл не из owner-вкладки." };
  }
  await assertTabConversation(senderTabId, key, run.conversation_id);
  await assertRunBinding(run);
  if (run.delivery?.delivery_id !== deliveryId) return { ok: false, committed: false, insert_allowed: false, code: "AUTO_DELIVERY_ID_MISMATCH", error: "Delivery ID не совпадает." };
  if (run.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) {
    return { ok: true, committed: true, insert_allowed: false, already_inserted: true, recovery: deliveryRecoveryPayload(run, "watch_delivery") };
  }
  if (run.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) {
    return { ok: true, committed: true, insert_allowed: false, outcome_unknown: true, code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" };
  }
  if (run.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) {
    return { ok: false, committed: false, insert_allowed: false, code: "AUTO_DELIVERY_NOT_CLAIMED", error: "Delivery ещё не готов к insertion commit." };
  }
  let insertAllowed = false;
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.delivery?.delivery_id !== deliveryId || current.delivery?.mode !== "batch_watch_v1") return current;
    if (current.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) return current;
    insertAllowed = true;
    return BridgeAutorunModel.commitDeliveryInsert(current, {
      deliveryId,
      actorId,
      assistantBaselineIds: message.assistant_baseline_ids
    });
  });
  if (!insertAllowed) return { ok: true, committed: true, insert_allowed: false, outcome_unknown: true, code: "DELIVERY_INSERT_OUTCOME_UNKNOWN_NO_RETRY" };
  await diagnostic("DELIVERY_INSERT_COMMITTED", { run_id: runId, delivery_id: deliveryId, tab_id: senderTabId, actor_id: actorId || null, assistant_baseline_count: run?.delivery?.baseline_assistant_turn_ids?.length || 0 });
  return { ok: true, committed: true, insert_allowed: true, run: publicRun(run) };
}

async function markBatchDeliveryInserted(message, sender) {
  if (String(message.owner_kind || "autorun") === "manual") return await markManualBatchDeliveryInserted(message, sender);
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let run = await getAutoRun(key);
  if (!run || run.run_id !== runId || run.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING || run.delivery?.mode !== "batch_watch_v1") {
    return { ok: false, inserted: false, code: "AUTO_DELIVERY_STATE_MISMATCH", error: "Batch delivery не находится в expected state." };
  }
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(run.tab_id)) return { ok: false, inserted: false, code: "AUTO_NON_OWNER_TAB", error: "Inserted ack пришёл не из owner-вкладки." };
  await assertTabConversation(senderTabId, key, run.conversation_id);
  await assertRunBinding(run);
  if (run.delivery?.delivery_id !== deliveryId) return { ok: false, inserted: false, code: "AUTO_DELIVERY_ID_MISMATCH", error: "Delivery ID не совпадает." };
  if (run.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED) return { ok: true, inserted: true, already_inserted: true, recovery: deliveryRecoveryPayload(run, "watch_delivery") };
  if (run.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return { ok: false, inserted: false, code: "AUTO_DELIVERY_INSERT_NOT_COMMITTED", error: "Insertion не committed." };
  if (run.delivery.commit_actor_id && actorId && run.delivery.commit_actor_id !== actorId) return { ok: false, inserted: false, code: "AUTO_DELIVERY_ACTOR_MISMATCH", error: "Inserted ack пришёл от другого content runtime." };
  let inserted = false;
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.delivery?.delivery_id !== deliveryId || current.delivery?.mode !== "batch_watch_v1") return current;
    if (current.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) return current;
    const next = BridgeAutorunModel.markDeliveryInserted(current, { deliveryId, actorId });
    inserted = next?.delivery?.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERTED;
    return next;
  });
  if (!inserted) return { ok: false, inserted: false, code: "AUTO_DELIVERY_INSERT_ACK_RACE", error: "Delivery state изменился до inserted ack." };
  await diagnostic("DELIVERY_INSERTED", { run_id: runId, delivery_id: deliveryId, tab_id: senderTabId });
  return { ok: true, inserted: true, recovery: deliveryRecoveryPayload(run, "watch_delivery") };
}

async function commitAutoDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let run = await getAutoRun(key);
  if (!run || run.run_id !== runId || run.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_DELIVERY_STATE_MISMATCH", error: "Run не находится в delivery state." };
  }
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(run.tab_id)) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_NON_OWNER_TAB", error: "Delivery commit пришёл не из owner-вкладки." };
  }
  await assertTabConversation(senderTabId, key, run.conversation_id);
  await assertRunBinding(run);
  if (run.delivery?.delivery_id !== deliveryId) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_DELIVERY_ID_MISMATCH", error: "Delivery ID не совпадает с активной доставкой." };
  }
  if (run.delivery?.phase === BridgeAutorunModel.DELIVERY_PHASES.CONFIRMED) {
    return { ok: true, committed: true, click_allowed: false, already_confirmed: true };
  }
  if (run.delivery?.phase === BridgeAutorunModel.DELIVERY_PHASES.COMMITTED) {
    // Commit is the irreversible boundary. Never grant a second browser click after it, even to the same runtime.
    return { ok: true, committed: true, click_allowed: false, already_committed: true, recovery: deliveryRecoveryPayload(run, "reconcile_delivery") };
  }
  if (run.delivery?.phase !== BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_DELIVERY_NOT_CLAIMED", error: "Delivery ещё не claimable." };
  }
  let clickAllowed = false;
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.delivery?.delivery_id !== deliveryId) return current;
    if (current.delivery?.phase !== BridgeAutorunModel.DELIVERY_PHASES.CLAIMED) return current;
    clickAllowed = true;
    return BridgeAutorunModel.commitDelivery(current, {
      deliveryId,
      baselineUserTurnIds: message.baseline_user_turn_ids,
      actorId
    });
  });
  if (!clickAllowed) {
    const latest = await getAutoRun(key);
    return { ok: true, committed: true, click_allowed: false, already_committed: true, recovery: latest ? deliveryRecoveryPayload(latest, "reconcile_delivery") : null };
  }
  await diagnostic("DELIVERY_COMMITTED_BEFORE_CLICK", { run_id: runId, delivery_id: deliveryId, tab_id: senderTabId, actor_id: actorId || null, baseline_user_turn_count: run?.delivery?.baseline_user_turn_ids?.length || 0 });
  return { ok: true, committed: true, click_allowed: true, run: publicRun(run) };
}

async function completeBatchAutoDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  let currentRun = await getAutoRun(key);
  if (!currentRun || currentRun.run_id !== runId) throw Object.assign(new Error("Batch delivery confirmation не соответствует активному autorun."), { code: "AUTO_DELIVERY_STATE_MISMATCH" });
  const senderTabId = Number(sender?.tab?.id || 0);
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(currentRun.tab_id)) throw Object.assign(new Error("Batch delivery confirmation пришёл не из owner-вкладки."), { code: "AUTO_NON_OWNER_TAB" });
  await assertTabConversation(senderTabId, key, currentRun.conversation_id);
  await assertRunBinding(currentRun);
  if (deliveryId && currentRun.last_confirmed_delivery_id === deliveryId) {
    await noteConfirmedPrefix(key, currentRun.last_confirmed_report_prefix_applied === true, deliveryId);
    return publicRun(currentRun);
  }
  if (currentRun.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING || currentRun.delivery?.mode !== "batch_watch_v1") throw Object.assign(new Error("Run больше не находится в batch delivery state."), { code: "AUTO_DELIVERY_STATE_MISMATCH" });
  if (!deliveryId || currentRun.delivery.delivery_id !== deliveryId) throw Object.assign(new Error("Batch delivery ID не совпадает."), { code: "AUTO_DELIVERY_ID_MISMATCH" });
  if (currentRun.delivery.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERTED) throw Object.assign(new Error("Delivery confirmation разрешён только после confirmed insertion."), { code: "AUTO_DELIVERY_NOT_INSERTED" });

  const expectedBasis = expectedDeliveryConfirmationBasis(currentRun.origin);
  const confirmed = message.delivery_confirmed === true && acceptedDeliveryConfirmationBasis(currentRun.origin, message.confirmation_basis);
  await diagnostic("DELIVERY_CONFIRMATION_RECEIVED", {
    run_id: runId,
    delivery_id: deliveryId,
    delivery_mode: "batch_watch_v1",
    delivery_confirmed: confirmed,
    confirmation_basis: String(message.confirmation_basis || ""),
    click_attempts: Number(message.click_attempts || 0)
  }, { level: confirmed ? "info" : "warning" });
  if (!confirmed) return publicRun(currentRun);

  const prefixApplied = currentRun.delivery.report_prefix_applied === true;
  const baselineAssistantIds = Array.isArray(currentRun.delivery.baseline_assistant_turn_ids) ? currentRun.delivery.baseline_assistant_turn_ids : [];
  await noteConfirmedPrefix(key, prefixApplied, deliveryId);
  let didConfirm = false;
  let run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId) return current;
    if (current.last_confirmed_delivery_id === deliveryId) return current;
    if (current.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING || current.delivery?.delivery_id !== deliveryId || current.delivery?.mode !== "batch_watch_v1" || current.delivery?.phase !== BridgeAutorunModel.DELIVERY_PHASES.INSERTED) return current;
    didConfirm = true;
    const confirmedCurrent = {
      ...current,
      delivery: { ...current.delivery, phase: BridgeAutorunModel.DELIVERY_PHASES.CONFIRMED, confirmed_at: new Date().toISOString() }
    };
    const next = BridgeAutorunModel.afterConfirmedDelivery(confirmedCurrent);
    if (current.pause_after_guidance_limit === true) {
      next.status = BridgeAutorunModel.RUN_STATUSES.PAUSED;
      next.last_error = { code: "GUIDANCE_ROUND_LIMIT", message: "Достигнут лимит локальных guidance rounds; продолжите в Manual mode или начните задачу с более точной командой." };
      next.pause_after_guidance_limit = false;
    }
    next.last_confirmed_delivery_id = deliveryId;
    next.last_confirmed_report_prefix_applied = prefixApplied;
    next.last_confirmed_user_turn_id = null;
    next.delivery = null;
    if (next.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) {
      next.assistant_baseline_ids = baselineAssistantIds;
      next.watch_id = `watch-${crypto.randomUUID()}`;
    }
    return next;
  });
  if (!run || run.run_id !== runId) return null;
  if (!didConfirm && run.last_confirmed_delivery_id !== deliveryId) throw Object.assign(new Error("Batch delivery state изменился конкурентно до подтверждения."), { code: "AUTO_DELIVERY_CONFIRM_RACE" });
  if (didConfirm) {
    await diagnostic("DELIVERY_SUCCESS", { run_id: runId, status: run.status, sequence: Number(run.sequence || 0), delivery_id: deliveryId, confirmation_basis: String(message.confirmation_basis || expectedBasis) });
    if (run.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
    else await stopWatch(run, `delivery_complete:${run.status}`);
  }
  return publicRun(run);
}

async function completeAutoDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  let currentRun = await getAutoRun(key);
  if (!currentRun || currentRun.run_id !== runId) {
    throw Object.assign(new Error("Delivery confirmation не соответствует активному autorun."), { code: "AUTO_DELIVERY_STATE_MISMATCH" });
  }
  if (currentRun.delivery?.mode === "batch_watch_v1") return await completeBatchAutoDelivery(message, sender);
  const senderTabId = Number(sender?.tab?.id || 0);
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(currentRun.tab_id)) {
    throw Object.assign(new Error("Delivery confirmation пришёл не из owner-вкладки autorun."), { code: "AUTO_NON_OWNER_TAB" });
  }
  await assertTabConversation(senderTabId, key, currentRun.conversation_id);
  await assertRunBinding(currentRun);

  // Duplicate confirmation after an already finalized delivery is idempotent.
  if (deliveryId && currentRun.last_confirmed_delivery_id === deliveryId) {
    await noteConfirmedPrefix(key, currentRun.last_confirmed_report_prefix_applied === true, deliveryId);
    return publicRun(currentRun);
  }
  if (currentRun.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING) {
    throw Object.assign(new Error("Run больше не находится в delivery state."), { code: "AUTO_DELIVERY_STATE_MISMATCH" });
  }
  if (!deliveryId || currentRun.delivery?.delivery_id !== deliveryId) {
    throw Object.assign(new Error("Delivery confirmation ID не совпадает с активной доставкой."), { code: "AUTO_DELIVERY_ID_MISMATCH" });
  }
  if (currentRun.delivery?.phase !== BridgeAutorunModel.DELIVERY_PHASES.COMMITTED) {
    throw Object.assign(new Error("Delivery confirmation разрешён только после commit."), { code: "AUTO_DELIVERY_NOT_COMMITTED" });
  }
  await diagnostic("DELIVERY_CONFIRMATION_RECEIVED", { run_id: runId, delivery_id: deliveryId, delivery_confirmed: message.delivery_confirmed === true, composer_empty: message.composer_empty === true, click_attempts: Number(message.click_attempts || 0) }, { level: message.delivery_confirmed === true ? "info" : "warning" });
  if (message.delivery_confirmed !== true) {
    const pending = await mutateAutoRun(key, (current) => {
      if (!current || current.run_id !== runId || current.delivery?.delivery_id !== deliveryId) return current;
      return {
        ...current,
        last_error: {
          code: "DELIVERY_CONFIRMATION_PENDING",
          message: "Send был committed, но новый user-turn пока не подтверждён. Автоматический повтор Send/API запрещён; разрешена только reconciliation.",
          at: new Date().toISOString(),
          recoverable: true
        }
      };
    });
    return publicRun(pending);
  }

  // Prefix accounting is idempotent by delivery_id, so duplicate/concurrent confirmations cannot increment twice.
  const prefixApplied = currentRun.delivery?.report_prefix_applied === true;
  await noteConfirmedPrefix(key, prefixApplied, deliveryId);

  let didConfirm = false;
  let run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId) return current;
    if (current.last_confirmed_delivery_id === deliveryId) return current;
    if (current.status !== BridgeAutorunModel.RUN_STATUSES.DELIVERING || current.delivery?.delivery_id !== deliveryId || current.delivery?.phase !== BridgeAutorunModel.DELIVERY_PHASES.COMMITTED) return current;
    didConfirm = true;
    const confirmedCurrent = {
      ...current,
      delivery: {
        ...current.delivery,
        phase: BridgeAutorunModel.DELIVERY_PHASES.CONFIRMED,
        confirmed_at: new Date().toISOString(),
        confirmed_user_turn_id: message.confirmed_user_turn_id || null
      }
    };
    const next = BridgeAutorunModel.afterConfirmedDelivery(confirmedCurrent);
    next.last_confirmed_delivery_id = deliveryId;
    next.last_confirmed_report_prefix_applied = prefixApplied;
    next.last_confirmed_user_turn_id = message.confirmed_user_turn_id || null;
    next.delivery = null;
    if (next.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) {
      next.assistant_baseline_ids = Array.isArray(message.assistant_baseline_ids) ? message.assistant_baseline_ids : [];
      next.watch_id = `watch-${crypto.randomUUID()}`;
    }
    return next;
  });
  if (!run || run.run_id !== runId) return null;
  if (!didConfirm && run.last_confirmed_delivery_id !== deliveryId) {
    throw Object.assign(new Error("Delivery state изменился конкурентно до подтверждения."), { code: "AUTO_DELIVERY_CONFIRM_RACE" });
  }
  if (didConfirm) {
    await diagnostic("DELIVERY_COMPLETED", { run_id: runId, status: run.status, sequence: Number(run.sequence || 0), delivery_id: deliveryId });
    if (run.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
    else await stopWatch(run, `delivery_complete:${run.status}`);
  }
  return publicRun(run);
}

async function failAutoDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const run = await getAutoRun(key);
  if (!run || run.run_id !== String(message.run_id || "")) return null;
  const senderTabId = Number(sender?.tab?.id || 0);
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(run.tab_id)) return publicRun(run);
  await assertTabConversation(senderTabId, key, run.conversation_id).catch(() => null);
  if (run.status === BridgeAutorunModel.RUN_STATUSES.DELIVERING && run.delivery) {
    const preserved = await mutateAutoRun(key, (current) => {
      if (!current || current.run_id !== run.run_id) return current;
      return {
        ...current,
        last_error: {
          code: String(message.code || "DELIVERY_FAILED"),
          message: String(message.error || "Не удалось доставить Ozon result в текущий AI."),
          at: new Date().toISOString(),
          recoverable: true
        }
      };
    });
    await diagnostic("DELIVERY_FAILED_BUT_PRESERVED", { run_id: run.run_id, delivery_id: run.delivery?.delivery_id || null, phase: run.delivery?.phase || null, code: message.code || "DELIVERY_FAILED" }, { level: "warning" });
    return publicRun(preserved);
  }
  const failed = await markRunError(key, message.code || "DELIVERY_FAILED", message.error || "Не удалось доставить Ozon result в текущий AI.");
  return publicRun(failed);
}

async function pauseAutoRun(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const existing = await getAutoRun(key);
  if (!existing) throw Object.assign(new Error("Активный autorun не найден."), { code: "AUTO_RUN_NOT_FOUND" });
  await assertRunBinding(existing);
  let shouldStopWatch = false;
  const run = await mutateAutoRun(key, (current) => {
    if (!current) return null;
    const decision = BridgeAutorunModel.pauseDecision(current.status);
    if (decision === "immediate") {
      shouldStopWatch = true;
      return { ...current, status: BridgeAutorunModel.RUN_STATUSES.PAUSED, pause_requested: false };
    }
    if (decision === "deferred") return { ...current, pause_requested: true };
    return current;
  });
  if (!run) throw Object.assign(new Error("Активный autorun не найден."), { code: "AUTO_RUN_NOT_FOUND" });
  if (shouldStopWatch) await stopWatch(run, "operator_pause");
  return publicRun(run);
}

async function resumeAutoRun(conversationKey, tabId) {
  const key = normalizeConversationKey(conversationKey);
  const tab = normalizeTabId(tabId);
  if (await getManualMode(key)) throw Object.assign(new Error("Перед продолжением autorun выключите ручной режим Ozon."), { code: "MANUAL_MODE_ACTIVE" });
  const manualOperation = await getManualOperation(key);
  if (manualOperationActive(manualOperation)) throw Object.assign(new Error("Дождитесь завершения уже принятого ручного Ozon request/delivery."), { code: "MANUAL_OPERATION_ACTIVE" });
  const settings = await getSettings();
  OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: true });
  if (!Object.values(OzonContract.OPERATIONS).some((meta) => meta.execution_enabled === true)) throw Object.assign(new Error("Ozon provider execution gate закрыт: нет ни одной implementation-ready READ operation."), { code: "PROVIDER_GATE_CLOSED" });
  const current = await getAutoRun(key);
  if (!current || current.status !== BridgeAutorunModel.RUN_STATUSES.PAUSED) throw Object.assign(new Error("Run не находится на паузе."), { code: "AUTO_RUN_NOT_PAUSED" });
  await assertRunBinding(current);

  const owner = await ownerDecision(current, tab, { allowRebind: true });
  if (!owner.owner) {
    throw Object.assign(new Error(`Этот autorun принадлежит другой AI-вкладке (tab ${owner.owner_tab_id || current.tab_id}).`), { code: "AUTO_NON_OWNER_TAB" });
  }
  const ownedRun = owner.run || current;
  const baseline = await tabMessage(tab, {
    type: "OZ_AUTO_GET_BASELINE",
    run_id: ownedRun.run_id,
    conversation_key: key,
    conversation_id: ownedRun.conversation_id
  });
  if (!baseline.ok) throw Object.assign(new Error(baseline.error || "Не удалось получить baseline текущего AI."), { code: baseline.code || "BASELINE_FAILED" });
  const run = await mutateAutoRun(key, (runNow) => {
    if (!runNow || runNow.run_id !== ownedRun.run_id || runNow.status !== BridgeAutorunModel.RUN_STATUSES.PAUSED) return runNow;
    return {
      ...runNow,
      tab_id: tab,
      status: BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND,
      pause_requested: false,
      assistant_baseline_ids: Array.isArray(baseline.assistant_baseline_ids) ? baseline.assistant_baseline_ids : [],
      watch_id: `watch-${crypto.randomUUID()}`
    };
  });
  if (run?.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
  return publicRun(run);
}

async function stopAutoRun(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const existing = await getAutoRun(key);
  if (!existing) throw Object.assign(new Error("Autorun не найден."), { code: "AUTO_RUN_NOT_FOUND" });
  await assertRunBinding(existing);
  let stopNow = false;
  const run = await mutateAutoRun(key, (current) => {
    if (!current) return null;
    if (current.status === BridgeAutorunModel.RUN_STATUSES.DELIVERING && current.delivery?.mode === "batch_watch_v1") {
      stopNow = true;
      return { ...current, status: BridgeAutorunModel.RUN_STATUSES.STOPPED, finish_requested: false, pause_requested: false, batch: null, delivery: null };
    }
    if (current.status === BridgeAutorunModel.RUN_STATUSES.REQUESTING || current.status === BridgeAutorunModel.RUN_STATUSES.COLLECTING || current.status === BridgeAutorunModel.RUN_STATUSES.DELIVERING || current.status === BridgeAutorunModel.RUN_STATUSES.STARTING) {
      return { ...current, finish_requested: true };
    }
    stopNow = true;
    return { ...current, status: BridgeAutorunModel.RUN_STATUSES.STOPPED, finish_requested: false, pause_requested: false, batch: null, delivery: null };
  });
  if (!run) throw Object.assign(new Error("Autorun не найден."), { code: "AUTO_RUN_NOT_FOUND" });
  if (stopNow) await stopWatch(run, "operator_finish");
  return publicRun(run);
}

async function testConnection() {
  const settings = await getSettings();
  const sellerConfigured = OzonCredentials.normalizeSellerCredentials(settings.sellerCredentials, { required: false }).present;
  const performanceConfigured = OzonCredentials.normalizePerformanceCredentials(settings.performanceCredentials, { required: false }).present;
  if (!sellerConfigured && !performanceConfigured) {
    const status = await setStatus({ ok: false, code: "MISSING_CREDENTIALS", message: "Seller и Performance credentials не сохранены.", http_status: 0 });
    return { ok: false, ...status };
  }
  try {
    const seller = sellerConfigured ? await OzonProvider.testConnection(settings.sellerCredentials) : null;
    const performance = performanceConfigured ? await OzonProvider.testPerformanceConnection(settings.performanceCredentials) : null;
    const ok = (!sellerConfigured || seller?.ok === true) && (!performanceConfigured || performance?.ok === true);
    const parts = [];
    if (sellerConfigured) parts.push(seller?.ok ? `Seller /v1/roles HTTP ${seller.http_status}` : `Seller ERROR ${seller?.code || seller?.http_status || "unknown"}`);
    else parts.push("Seller: не настроен");
    if (performanceConfigured) parts.push(performance?.ok ? "Performance auth: OK" : `Performance ERROR ${performance?.code || performance?.http_status || "unknown"}`);
    else parts.push("Performance: не настроен");
    const message = parts.join(" · ");
    const status = await setStatus({
      ok,
      code: ok ? "CONNECTED" : (performance?.code || seller?.code || "OZON_API_ERROR"),
      message,
      http_status: Number(performance?.http_status || seller?.http_status || 0)
    });
    return {
      ok,
      ...status,
      message,
      seller,
      performance,
      expires_at: seller?.expires_at || null,
      roles_count: Number.isInteger(seller?.roles_count) ? seller.roles_count : null,
      methods_count: Number.isInteger(seller?.methods_count) ? seller.methods_count : null,
      elapsed_ms: Number(seller?.elapsed_ms || 0)
    };
  } catch (error) {
    const status = await setStatus({ ok: false, code: error.code || "CONNECTION_TEST_FAILED", message: error.message || String(error), http_status: Number(error?.http_status || 0) });
    return { ok: false, ...status };
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  void (async () => { await clearTabAIMode(tabId); const starts = await getPendingWorkStarts(); if (starts[String(tabId)]) { delete starts[String(tabId)]; await storageSet({ [KEYS.PENDING_WORK_STARTS]: starts }); await diagnostic("WORK_PENDING_START_CANCELLED_TAB_CLOSED", { tab_id: tabId, external_request_executed: false }); } })().catch(() => null);
});

if (chrome.alarms?.onAlarm?.addListener) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    const name = String(alarm?.name || "");
    if (name === WORK_SESSION_REFRESH_WAKE_ALARM) { void resumeWorkSessionRecoveries(); return; }
    if (name === PROVIDER_QUOTA_ALARM) void resumeProviderQuotaWaits();
  });
}
setTimeout(() => { void resumeProviderQuotaWaits(); void resumeWorkSessionRecoveries(); }, 0);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message?.type) {
      case "OZ_RESOLVE_POPUP_CONTEXT": {
        const context = await resolvePopupContext(message.tab_id, message.identity || null);
        return { ok: true, context };
      }
      case "OZ_BIND_CONVERSATION": {
        const binding = await bindConversation(message.context || {});
        return { ok: true, binding, state: await publicSettingsState(binding.conversation_key) };
      }
      case "OZ_GET_SETTINGS_STATE":
        return { ok: true, state: await publicSettingsState(message.conversation_key) };
      case "OZ_GET_GLOBAL_SETTINGS_STATE":
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      case "OZ_REFRESH_SELLER_API_METADATA": {
        try {
          const summary = await refreshSellerApiMetadata();
          return { ok: true, summary, state: await publicGlobalSettingsState(null) };
        } catch (error) {
          await diagnostic("SELLER_API_METADATA_UPDATE_FAILED", { code: error.code || "SELLER_METADATA_UPDATE_FAILED", http_status: Number(error?.http_status || 0), external_request_executed: false }, { level: "warning" });
          return { ok: false, code: error.code || "SELLER_METADATA_UPDATE_FAILED", error: error.message || String(error), state: await publicGlobalSettingsState(null) };
        }
      }
      case "OZ_GET_TAB_AI_MODE": {
        const tabId = sender?.tab?.id ? normalizeTabId(sender.tab.id) : normalizeTabId(message.tab_id);
        const [{ ai_id: detectedAIId }, mode] = await Promise.all([detectedAIForTab(tabId), getTabAIMode(tabId)]);
        return { ok: true, tab_id: tabId, ai_mode: mode, ai_mode_scope: "per_tab", detected_ai_id: detectedAIId || null };
      }
      case "OZ_SET_TAB_AI_MODE": {
        const tabId = normalizeTabId(message.tab_id);
        const detected = await detectedAIForTab(tabId);
        if (!detected.ai_id) {
          return { ok: false, code: "UNSUPPORTED_AI_TAB", error: "Текущая вкладка не принадлежит поддерживаемому AI." };
        }
        const previousMode = await getTabAIMode(tabId);
        const mode = await setTabAIMode(tabId, message.ai_mode);
        const applied = await tabMessage(tabId, { type: "OZ_APPLY_AI_MODE", ai_mode: mode });
        if (!applied?.ok) {
          await setTabAIMode(tabId, previousMode);
          return { ok: false, code: applied?.code || "TAB_AI_MODE_APPLY_FAILED", error: applied?.error || "Не удалось применить AI adapter к текущей вкладке; override откатан." };
        }
        await diagnostic("TAB_AI_MODE_CHANGED", { tab_id: tabId, ai_mode: mode, previous_ai_mode: previousMode, detected_ai_id: detected.ai_id, adapter_id: applied.adapter_id || null });
        return { ok: true, tab_id: tabId, ai_mode: mode, ai_mode_scope: "per_tab", detected_ai_id: detected.ai_id, adapter_id: applied.adapter_id || null };
      }
      case "OZ_SET_AI_MODE":
        return { ok: false, code: "GLOBAL_AI_MODE_REMOVED", error: "Глобальный AI mode удалён: adapter override задаётся только для текущей вкладки." };
      case "OZ_SAVE_GLOBAL_SETTINGS": {
        const current = await getSettings();
        const values = { [KEYS.AUTO_SEND]: message.auto_send !== false, [KEYS.PERSONAL_DATA_ENABLED]: message.personal_data_enabled === true };
        const newClientId = typeof message.seller_client_id === "string" ? message.seller_client_id.trim() : "";
        const newApiKey = typeof message.seller_api_key === "string" ? message.seller_api_key.trim() : "";
        if (newClientId || newApiKey) {
          const credentials = OzonCredentials.normalizeSellerCredentials({
            clientId: newClientId || current.sellerCredentials.clientId,
            apiKey: newApiKey || current.sellerCredentials.apiKey
          }, { required: true });
          values[KEYS.SELLER_CLIENT_ID] = credentials.clientId;
          values[KEYS.SELLER_API_KEY] = credentials.apiKey;
        }
        const newPerformanceClientId = typeof message.performance_client_id === "string" ? message.performance_client_id.trim() : "";
        const newPerformanceClientSecret = typeof message.performance_client_secret === "string" ? message.performance_client_secret.trim() : "";
        if (newPerformanceClientId || newPerformanceClientSecret) {
          const performanceCredentials = OzonCredentials.normalizePerformanceCredentials({
            clientId: newPerformanceClientId || current.performanceCredentials.clientId,
            clientSecret: newPerformanceClientSecret || current.performanceCredentials.clientSecret
          }, { required: true });
          values[KEYS.PERFORMANCE_CLIENT_ID] = performanceCredentials.clientId;
          values[KEYS.PERFORMANCE_CLIENT_SECRET] = performanceCredentials.clientSecret;
          OzonProvider.clearPerformanceToken();
        }
        await storageSet(values);
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      }
      case "OZ_SAVE_SETTINGS": {
        const key = normalizeConversationKey(message.conversation_key);
        const current = await getSettings();
        const values = { [KEYS.AUTO_SEND]: message.auto_send !== false, [KEYS.PERSONAL_DATA_ENABLED]: message.personal_data_enabled === true };
        const newClientId = typeof message.seller_client_id === "string" ? message.seller_client_id.trim() : "";
        const newApiKey = typeof message.seller_api_key === "string" ? message.seller_api_key.trim() : "";
        if (newClientId || newApiKey) {
          const credentials = OzonCredentials.normalizeSellerCredentials({
            clientId: newClientId || current.sellerCredentials.clientId,
            apiKey: newApiKey || current.sellerCredentials.apiKey
          }, { required: true });
          values[KEYS.SELLER_CLIENT_ID] = credentials.clientId;
          values[KEYS.SELLER_API_KEY] = credentials.apiKey;
        }
        const newPerformanceClientId = typeof message.performance_client_id === "string" ? message.performance_client_id.trim() : "";
        const newPerformanceClientSecret = typeof message.performance_client_secret === "string" ? message.performance_client_secret.trim() : "";
        if (newPerformanceClientId || newPerformanceClientSecret) {
          const performanceCredentials = OzonCredentials.normalizePerformanceCredentials({
            clientId: newPerformanceClientId || current.performanceCredentials.clientId,
            clientSecret: newPerformanceClientSecret || current.performanceCredentials.clientSecret
          }, { required: true });
          values[KEYS.PERFORMANCE_CLIENT_ID] = performanceCredentials.clientId;
          values[KEYS.PERFORMANCE_CLIENT_SECRET] = performanceCredentials.clientSecret;
          OzonProvider.clearPerformanceToken();
        }
        await storageSet(values);
        await saveReportPrefix(key, message);
        if (typeof message.auto_start_prompt_text === "string") await saveAutoStartPrompt(key, message.auto_start_prompt_text);
        return { ok: true, state: await publicSettingsState(key) };
      }
      case "OZ_RESET_AUTO_START_PROMPT": {
        const key = normalizeConversationKey(message.conversation_key);
        await resetAutoStartPrompt(key);
        return { ok: true, state: await publicSettingsState(key) };
      }
      case "OZ_WORK_RESUME": {
        const tab = normalizeTabId(message.tab_id);
        const key = normalizeConversationKey(message.conversation_key);
        const session = await workSessionFor(key);
        if (session.state !== OzonWorkSessionModel.STATES.INACTIVE) {
          return { ok: false, code: "WORK_SESSION_NOT_INACTIVE", error: "Продолжить работу без prompt можно только из inactive work-session." };
        }
        const live = await assertTabConversation(tab, key);
        const binding = await strictBindingForIdentity(live);
        const manualOperation = await getManualOperation(key);
        if (manualOperationActive(manualOperation)) {
          return { ok: false, code: "WORK_RESUME_OPERATION_ACTIVE", error: "Нельзя продолжить inactive work-session: обнаружена незавершённая manual operation." };
        }
        const bindingSession = await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.BINDING, {
          tab_id: tab,
          origin: live.origin,
          ai_id: live.ai_id,
          conversation_id: live.conversation_id,
          start_intent_id: null,
          error: null
        });
        const visible = await mutateWorkSession(key, bindingSession.revision, OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, { error: null });
        try {
          await setWorkSessionCommandAcceptance(key, true);
          const applied = await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: true, conversation_key: key });
          if (!applied?.ok || applied.applied !== true) throw Object.assign(new Error(applied?.error || "Content script не подтвердил Resume."), { code: applied?.code || "WORK_RESUME_CONTENT_REJECTED" });
        } catch (error) {
          await setWorkSessionCommandAcceptance(key, false);
          await mutateWorkSession(key, visible.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: error.code || "WORK_RESUME_FAILED" } });
          return { ok: false, code: error.code || "WORK_RESUME_FAILED", error: error.message || String(error) };
        }
        await diagnostic("WORK_SESSION_RESUMED_WITHOUT_PROMPT", {
          tab_id: tab,
          conversation_key: key,
          binding_id: binding.binding_id,
          binding_revision: binding.revision,
          session_revision: visible.revision,
          external_request_executed: false
        });
        return { ok: true, resumed_without_prompt: true, binding, session: visible, state: await publicSettingsState(key) };
      }
      case "OZ_WORK_SHOW": {
        const tab = normalizeTabId(message.tab_id);
        const key = normalizeConversationKey(message.conversation_key);
        const session = await workSessionFor(key);
        if (session.state !== OzonWorkSessionModel.STATES.ACTIVE_HIDDEN) return { ok: false, code: "WORK_SESSION_NOT_HIDDEN", error: "Показать кнопку разрешено только для активной скрытой work-session." };
        const live = await assertTabConversation(tab, key);
        await strictBindingForIdentity(live);
        const next = await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ACTIVE_VISIBLE);
        try {
          await setWorkSessionCommandAcceptance(key, true);
          const applied = await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: true, conversation_key: key });
          if (!applied?.ok || applied.applied !== true) throw Object.assign(new Error(applied?.error || "Content script не подтвердил Show."), { code: applied?.code || "WORK_SHOW_CONTENT_REJECTED" });
        } catch (error) {
          await setWorkSessionCommandAcceptance(key, false);
          await mutateWorkSession(key, next.revision, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN);
          return { ok: false, code: error.code || "WORK_SHOW_FAILED", error: error.message || String(error) };
        }
        return { ok: true, session: next, state: await publicSettingsState(key) };
      }
      case "OZ_WORK_REFRESH": {
        const tab = normalizeTabId(message.tab_id);
        const key = normalizeConversationKey(message.conversation_key);
        const begun = await beginWorkSessionRefresh(tab, key);
        if (begun.already_in_progress) return { ok: true, code: "REFRESH_ALREADY_IN_PROGRESS", recovery: begun.recovery };
        const oldRuntimeGeneration = String(begun.recovery.old_runtime_generation || workSessionRuntimeGeneration);
        const newRuntimeGeneration = String(begun.recovery.new_runtime_generation || `work-runtime-${crypto.randomUUID()}`);
        workSessionRuntimeGeneration = newRuntimeGeneration;
        await diagnostic("WORK_SESSION_REFRESH_RUNTIME_REINITIALIZED", {
          recovery_id: begun.recovery.recovery_id,
          tab_id: tab,
          conversation_key: key,
          worker_session_id: WORKER_SESSION_ID,
          old_runtime_generation: oldRuntimeGeneration,
          new_runtime_generation: newRuntimeGeneration
        });
        const pageReload = await reloadRefreshOwnerTabInProcess(begun.recovery);
        if (!pageReload.ok) {
          const session = await workSessionFor(key);
          await setWorkSessionCommandAcceptance(key, false);
          if (session.state === OzonWorkSessionModel.STATES.RECOVERING && Number(session.revision) === Number(begun.recovery.revision)) {
            await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED" } });
          }
          const recoveries = await getWorkRecoveries();
          if (recoveries[key]?.recovery_id === begun.recovery.recovery_id) {
            delete recoveries[key];
            await storageSet({ [KEYS.WORK_SESSION_RECOVERIES]: recoveries });
          }
          await diagnostic(pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED", { recovery_id: begun.recovery.recovery_id, tab_id: tab, worker_session_id: WORKER_SESSION_ID, runtime_generation: newRuntimeGeneration, error: pageReload.error || null }, { level: "error" });
          return { ok: false, code: pageReload.code || "WORK_REFRESH_TAB_RELOAD_FAILED", error: pageReload.error || "AI tab reload failed.", recovery: begun.recovery };
        }
        await resumeWorkSessionRecoveries();
        const restored = await workSessionFor(key);
        const restoredOk = [OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN].includes(restored.state);
        if (!restoredOk) {
          return { ok: false, code: restored.error?.code || "WORK_REFRESH_RECOVERY_FAILED", error: "Work-session recovery did not restore an active state.", recovery: begun.recovery, session: restored };
        }
        return {
          ok: true,
          recovery: begun.recovery,
          runtime_reinitialized: true,
          physical_worker_reloaded: false,
          worker_session_id: WORKER_SESSION_ID,
          old_runtime_generation: oldRuntimeGeneration,
          new_runtime_generation: newRuntimeGeneration,
          page_reload_completed: true,
          restored_state: restored.state
        };
      }

      case "OZ_WORK_START": {
        const tab = normalizeTabId(message.tab_id);
        const startIntentId = String(message.start_intent_id || crypto.randomUUID());
        const live = await tabIdentity(tab);
        if (!live.ai_id || !live.origin) return { ok: false, code: "WORK_START_UNSUPPORTED_PAGE", error: "Текущая вкладка не является поддерживаемым AI-диалогом." };

        if (!live.conversation_id) {
          const pending = await createPendingWorkStart(tab, live);
          if (pending.duplicate) return { ok: true, accepted: false, code: "WORK_START_ALREADY_PENDING", pending_start: pending.transaction };
          const sent = await tabMessage(tab, { type: "OZ_WORK_SEND_INITIAL_PROMPT", intent_id: pending.transaction.intent_id, revision: pending.transaction.revision, prompt_text: DEFAULT_AUTO_START_TEXT });
          if (!sent?.ok || sent.sent !== true) {
            const starts = await getPendingWorkStarts();
            delete starts[String(tab)];
            await storageSet({ [KEYS.PENDING_WORK_STARTS]: starts });
            return { ok: false, code: sent?.code || "WORK_START_SEND_FAILED", error: sent?.error || "Initial prompt не отправлен." };
          }
          const starts = await getPendingWorkStarts();
          if (starts[String(tab)]?.intent_id === pending.transaction.intent_id) {
            starts[String(tab)] = { ...starts[String(tab)], prompt_delivered: true };
            await storageSet({ [KEYS.PENDING_WORK_STARTS]: starts });
          }
          return { ok: true, accepted: true, pending_start: { ...pending.transaction, prompt_delivered: true } };
        }

        const key = await resolveConfirmedConversationKey(live);
        const currentSession = await workSessionFor(key);
        if ([OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN].includes(currentSession.state)) {
          await strictBindingForIdentity(live);
          const prompt = await getAutoStartPrompt(key);
          const sent = await tabMessage(tab, { type: "OZ_WORK_SEND_INITIAL_PROMPT", intent_id: startIntentId, revision: currentSession.revision, prompt_text: String(prompt?.text || DEFAULT_AUTO_START_TEXT) });
          if (!sent?.ok || sent.sent !== true) return { ok: false, code: sent?.code || "WORK_START_SEND_FAILED", error: sent?.error || "Initial prompt не отправлен." };
          return { ok: true, resent_prompt_only: true, session: currentSession, state: await publicSettingsState(key) };
        }
        if (![OzonWorkSessionModel.STATES.INACTIVE, OzonWorkSessionModel.STATES.ERROR].includes(currentSession.state)) {
          return { ok: false, code: "WORK_START_ALREADY_IN_PROGRESS", error: `Work-session уже находится в состоянии ${currentSession.state}.` };
        }

        const binding = await bindConversation({ tab_id: tab, origin: live.origin, conversation_id: live.conversation_id }, { work_start_intent_id: startIntentId });
        const bindingSession = await workSessionFor(key);
        if (bindingSession.state !== OzonWorkSessionModel.STATES.BINDING) throw Object.assign(new Error("Work-session не вошла в binding после атомарной привязки."), { code: "WORK_START_BINDING_STATE_INVALID" });
        const visible = await mutateWorkSession(key, bindingSession.revision, OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, { error: null });
        try {
          await setWorkSessionCommandAcceptance(key, true);
          const applied = await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: true, conversation_key: key });
          if (!applied?.ok || applied.applied !== true) throw Object.assign(new Error(applied?.error || "Content script не подтвердил включение кнопки Ozon."), { code: applied?.code || "WORK_START_CONTENT_REJECTED" });
        } catch (error) {
          await setWorkSessionCommandAcceptance(key, false);
          await mutateWorkSession(key, visible.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: error.code || "WORK_START_CONTENT_REJECTED" } });
          return { ok: false, code: error.code || "WORK_START_CONTENT_REJECTED", error: error.message || String(error) };
        }
        const prompt = await getAutoStartPrompt(key);
        const sent = await tabMessage(tab, { type: "OZ_WORK_SEND_INITIAL_PROMPT", intent_id: startIntentId, revision: visible.revision, prompt_text: String(prompt?.text || DEFAULT_AUTO_START_TEXT) });
        if (!sent?.ok || sent.sent !== true) {
          await setWorkSessionCommandAcceptance(key, false);
          await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: false, conversation_key: key });
          await mutateWorkSession(key, visible.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: sent?.code || "WORK_START_SEND_FAILED" } });
          return { ok: false, code: sent?.code || "WORK_START_SEND_FAILED", error: sent?.error || "Initial prompt не отправлен." };
        }
        return { ok: true, binding, session: visible, state: await publicSettingsState(key) };
      }
      case "OZ_WORK_PENDING_IDENTITY": {
        const tab = normalizeTabId(sender?.tab?.id || message.tab_id);
        const starts = await getPendingWorkStarts();
        const pending = starts[String(tab)] || null;
        if (!pending || pending.intent_id !== String(message.intent_id || "") || Number(pending.revision) !== Number(message.revision)) return { ok: false, code: "WORK_PENDING_STALE_OR_INVALID" };
        const identity = normalizeIdentity(message.identity || {});
        if (String(pending.expires_at || "") <= new Date().toISOString()) {
          await clearPendingWorkStart(tab, pending.intent_id, pending.revision, "response_timeout");
          return { ok: false, code: "WORK_PENDING_TIMEOUT" };
        }
        if (pending.origin !== identity.origin || pending.ai_id !== identity.ai_id || !identity.conversation_id) {
          await clearPendingWorkStart(tab, pending.intent_id, pending.revision, "identity_mismatch");
          return { ok: false, code: "WORK_PENDING_IDENTITY_MISMATCH" };
        }
        if (pending.observed_conversation_id && pending.observed_conversation_id !== identity.conversation_id) {
          await clearPendingWorkStart(tab, pending.intent_id, pending.revision, "conversation_changed");
          return { ok: false, code: "WORK_PENDING_CONVERSATION_CHANGED" };
        }
        if (message.first_response_complete !== true) {
          starts[String(tab)] = { ...pending, observed_conversation_id: identity.conversation_id, first_response_complete: false };
          await storageSet({ [KEYS.PENDING_WORK_STARTS]: starts });
          return { ok: true, waiting: true };
        }
        try {
          const binding = await bindConversation({ tab_id: tab, origin: identity.origin, conversation_id: identity.conversation_id }, { work_start_intent_id: pending.intent_id });
          const key = binding.conversation_key;
          const bindingSession = await workSessionFor(key);
          if (bindingSession.state !== OzonWorkSessionModel.STATES.BINDING) throw Object.assign(new Error("Pending Start не вошёл в binding."), { code: "WORK_PENDING_BINDING_STATE_INVALID" });
          const visible = await mutateWorkSession(key, bindingSession.revision, OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, { error: null });
          try {
            await setWorkSessionCommandAcceptance(key, true);
            const applied = await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: true, conversation_key: key });
            if (!applied?.ok || applied.applied !== true) throw Object.assign(new Error(applied?.error || "Content script не подтвердил включение кнопки Ozon."), { code: applied?.code || "WORK_PENDING_CONTENT_REJECTED" });
          } catch (error) {
            await setWorkSessionCommandAcceptance(key, false);
            await mutateWorkSession(key, visible.revision, OzonWorkSessionModel.STATES.ERROR, { error: { code: error.code || "WORK_PENDING_CONTENT_REJECTED" } });
            throw error;
          }
          await clearPendingWorkStart(tab, pending.intent_id, pending.revision, "bound_after_first_response");
          return { ok: true, binding, session: visible };
        } catch (error) {
          await clearPendingWorkStart(tab, pending.intent_id, pending.revision, error.code || "binding_failed");
          return { ok: false, code: error.code || "WORK_PENDING_BIND_FAILED", error: error.message || String(error) };
        }
      }
      case "OZ_WORK_PENDING_TIMEOUT": {
        const tab = normalizeTabId(sender?.tab?.id || message.tab_id);
        const cleared = await clearPendingWorkStart(tab, message.intent_id, message.revision, "response_timeout");
        return { ok: true, cleared };
      }
      case "OZ_WORK_PENDING_CANCEL": {
        const tab = normalizeTabId(sender?.tab?.id || message.tab_id);
        const cleared = await clearPendingWorkStart(tab, message.intent_id, message.revision, message.reason || "content_cancelled");
        return { ok: true, cleared };
      }
      case "OZ_WORK_HIDE": {
        const tab = normalizeTabId(message.tab_id);
        const key = normalizeConversationKey(message.conversation_key);
        const session = await workSessionFor(key);
        if (session.state !== OzonWorkSessionModel.STATES.ACTIVE_VISIBLE) return { ok: false, code: "WORK_SESSION_NOT_VISIBLE", error: "Убрать кнопку разрешено только для активной visible work-session." };
        await assertTabConversation(tab, key);
        const next = await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN);
        await setWorkSessionCommandAcceptance(key, false);
        const applied = await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: false, conversation_key: key });
        if (!applied?.ok || applied.applied !== true) return { ok: false, code: applied?.code || "WORK_HIDE_CONTENT_REJECTED", error: applied?.error || "Work-session уже скрыта и provider gate закрыт, но content script не подтвердил удаление UI." };
        return { ok: true, session: next, state: await publicSettingsState(key) };
      }
      case "OZ_WORK_FINISH": {
        const tab = normalizeTabId(message.tab_id);
        const key = normalizeConversationKey(message.conversation_key);
        const session = await workSessionFor(key);
        if (![OzonWorkSessionModel.STATES.ACTIVE_VISIBLE, OzonWorkSessionModel.STATES.ACTIVE_HIDDEN, OzonWorkSessionModel.STATES.ERROR].includes(session.state)) return { ok: false, code: "WORK_SESSION_NOT_ACTIVE", error: "Завершить работу можно только для активной work-session." };
        const finishing = await mutateWorkSession(key, session.revision, OzonWorkSessionModel.STATES.FINISHING);
        await setWorkSessionCommandAcceptance(key, false);
        await tabMessage(tab, { type: "OZ_WORK_APPLY_VISIBILITY", visible: false, conversation_key: key });
        const terminalized = await terminalizeFinishOperation(key);
        const autoRun = await getAutoRun(key);
        if (autoRun) {
          try {
            await stopAutoRun(key);
          } catch (error) {
            if (error?.code !== "AUTO_RUN_NOT_FOUND") throw error;
          }
        }
        await withBindingWrite(async () => {
          const sessions = await getWorkSessions();
          const current = OzonWorkSessionModel.normalize(sessions[key], key);
          if (current.state !== OzonWorkSessionModel.STATES.FINISHING || current.revision !== finishing.revision) throw Object.assign(new Error("Work-session изменилась во время Finish."), { code: "WORK_FINISH_STALE_SESSION" });
          transitionWorkSessionRecord(sessions, key, current.revision, OzonWorkSessionModel.STATES.INACTIVE, { tab_id: null, origin: null, ai_id: null, conversation_id: null, start_intent_id: null, error: null });
          await storageSet({ [KEYS.WORK_SESSIONS]: sessions });
        });
        await diagnostic("WORK_SESSION_FINISHED_BINDING_PRESERVED", { conversation_key: key, tab_id: tab, external_request_executed: false });
        return { ok: true, terminalized_operation: terminalized, binding_preserved: true, state: await publicSettingsState(key) };
      }
      case "OZ_SET_MANUAL_MODE": {
        const key = normalizeConversationKey(message.conversation_key);
        if (message.enabled === true) {
          const tab = normalizeTabId(message.tab_id);
          const liveIdentity = await assertTabConversation(tab, key);
          await strictBindingForIdentity(liveIdentity);
          const session = await workSessionFor(key);
          if (session.state !== OzonWorkSessionModel.STATES.ACTIVE_VISIBLE) return { ok: false, code: "WORK_SESSION_NOT_VISIBLE", error: "Legacy Manual ON не может обходить Work-session; используйте «Начать работу» / «Показать кнопку»." };
        }
        const enabled = await setManualMode(key, message.enabled === true);
        return { ok: true, enabled, state: await publicSettingsState(key) };
      }
      case "OZ_GET_MANUAL_STATE": {
        const key = normalizeConversationKey(message.conversation_key);
        const senderTabId = Number(sender?.tab?.id || 0);
        if (senderTabId <= 0) return { ok: true, enabled: false, ready: false, bound: false, manual_operation_active: false };
        const liveIdentity = await assertTabConversation(senderTabId, key);
        try {
          await strictBindingForIdentity(liveIdentity);
        } catch (error) {
          if (error?.code === "CONVERSATION_NOT_BOUND") return { ok: true, enabled: false, ready: false, bound: false, manual_operation_active: false };
          throw error;
        }
        const [storedEnabled, operation, session] = await Promise.all([getManualMode(key), getManualOperation(key), workSessionFor(key)]);
        const enabled = storedEnabled === true && session.state === OzonWorkSessionModel.STATES.ACTIVE_VISIBLE;
        const active = manualOperationActive(operation);
        return { ok: true, enabled, ready: enabled === true && !active, bound: true, work_session_state: session.state, manual_operation_active: active, manual_operation: publicManualOperation(operation) };
      }
      case "OZ_CONTENT_READY":
      case "OZ_CONTENT_SYNC": {
        const senderTabId = Number(sender?.tab?.id || 0);
        if (!Number.isInteger(senderTabId) || senderTabId <= 0) return { ok: false, code: "CONTENT_TAB_MISSING", error: "Content sync пришёл без AI tab." };
        const identity = normalizeIdentity(message.identity || {});
        const key = await resolveConfirmedConversationKey(identity);
        const liveIdentity = await assertTabConversation(senderTabId, key, identity.conversation_id);
        let binding = null;
        try { binding = await strictBindingForIdentity(liveIdentity); } catch (error) { if (error?.code !== "CONVERSATION_NOT_BOUND") throw error; }
        let run = await getAutoRun(key);
        let manualOperation = binding ? await getManualOperation(key) : null;
        let manualRecovery = null;
        let manualOwner = Boolean(binding);
        let manualRebound = false;
        if (binding && manualOperationActive(manualOperation)) {
          const manualDecision = await manualRecoveryForContent(manualOperation, senderTabId);
          manualOwner = manualDecision.owner === true;
          manualRebound = manualDecision.rebound === true;
          manualOperation = manualDecision.operation || manualOperation;
          manualRecovery = manualDecision.recovery || null;
          if (manualRebound) await diagnostic("MANUAL_OPERATION_TAB_REBOUND_AFTER_OLD_TAB_GONE", { operation_id: manualOperation?.operation_id || null, tab_id: senderTabId, status: manualOperation?.status || null });
        }
        let owner = Boolean(binding);
        let ownerTabId = run?.tab_id || null;
        let rebound = false;
        if (binding && run && !BridgeAutorunModel.isTerminalStatus(run.status)) {
          const decision = await ownerDecision(run, senderTabId, { allowRebind: true });
          owner = decision.owner === true;
          ownerTabId = decision.owner_tab_id || decision.run?.tab_id || run.tab_id;
          rebound = decision.rebound === true;
          run = decision.run || run;
          if (rebound) await diagnostic("RUN_TAB_REBOUND_AFTER_OLD_TAB_GONE", { run_id: run.run_id, tab_id: senderTabId, status: run.status });
        }
        let recovery = null;
        if (owner && run && !BridgeAutorunModel.isTerminalStatus(run.status)) {
          if (run.status === BridgeAutorunModel.RUN_STATUSES.DELIVERING && run.delivery) {
            if (run.delivery.mode === "batch_watch_v1" && run.delivery.phase === BridgeAutorunModel.DELIVERY_PHASES.INSERT_COMMITTED) {
              recovery = await recoveryPayloadForRun(run);
            } else {
              setTimeout(() => { void attemptAutoDelivery(key, run.run_id); }, 0);
            }
          } else {
            recovery = await recoveryPayloadForRun(run);
          }
          run = await getAutoRun(key) || run;
        }
        return {
          ok: true,
          conversation_key: key,
          identity: liveIdentity,
          binding: binding ? { bound: true, ...binding } : { bound: false, binding_id: null, revision: null },
          owner,
          owner_tab_id: ownerTabId,
          rebound,
          manual_mode: binding ? await workSessionManualEnabled(key) : false,
          manual_operation: binding ? publicManualOperation(manualOperation) : null,
          manual_operation_owner: manualOwner,
          manual_operation_rebound: manualRebound,
          manual_recovery: manualOwner ? manualRecovery : null,
          auto_run: publicRun(run),
          recovery,
          auto_watch: owner && run?.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND ? {
            run_id: run.run_id,
            conversation_key: run.conversation_key,
            origin: run.origin,
            conversation_id: run.conversation_id,
            watch_id: run.watch_id,
            assistant_baseline_ids: Array.isArray(run.assistant_baseline_ids) ? run.assistant_baseline_ids : [],
            status: run.status
          } : null
        };
      }
      case "OZ_EXPORT_CREDENTIALS": {
        const backup = await exportCredentialsBackup();
        await diagnostic("CREDENTIALS_EXPORTED", { backup_version: backup.backup_version, contains_secrets: true });
        return { ok: true, backup };
      }
      case "OZ_IMPORT_CREDENTIALS": {
        const credentialState = await importCredentialsBackup(message.backup);
        await diagnostic("CREDENTIALS_IMPORTED", { backup_version: Number(message.backup?.backup_version || 0), seller_credentials_present: credentialState.seller_credentials_present === true, performance_credentials_present: credentialState.performance_credentials_present === true, legacy_import: credentialState.legacy_import === true });
        if (typeof message.conversation_key === "string" && message.conversation_key.trim()) return { ok: true, state: await publicSettingsState(message.conversation_key) };
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      }
      case "OZ_CLEAR_CREDENTIALS": {
        await storageRemove([KEYS.SELLER_CLIENT_ID, KEYS.SELLER_API_KEY, KEYS.PERFORMANCE_CLIENT_ID, KEYS.PERFORMANCE_CLIENT_SECRET]);
        OzonProvider.clearPerformanceToken();
        await setStatus({ ok: false, code: "CREDENTIALS_CLEARED", message: "Ozon Seller + Performance credentials удалены из chrome.storage.local." });
        if (typeof message.conversation_key === "string" && message.conversation_key.trim()) return { ok: true, state: await publicSettingsState(message.conversation_key) };
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      }
      case "OZ_TEST_CONNECTION":
        return await testConnection();
      case "OZ_EXECUTE_COMMAND":
        return await executeManualCommand(String(message.command_text || ""), message.conversation_key, sender, message.manual_request_id);
      case "OZ_BATCH_DELIVERY_INSERT_COMMIT":
        return await commitBatchDeliveryInsert(message, sender);
      case "OZ_BATCH_DELIVERY_INSERTED":
        return await markBatchDeliveryInserted(message, sender);
      case "OZ_BATCH_DELIVERY_COMPLETE":
        return { ok: true, owner: await completeBatchDelivery(message, sender) };
      case "OZ_BATCH_DELIVERY_FAILED":
        return { ok: true, owner: await failBatchDelivery(message, sender) };
      case "OZ_REPORT_DELIVERY_CONFIRMED": {
        const key = normalizeConversationKey(message.conversation_key);
        const senderTabId = Number(sender?.tab?.id || 0);
        if (!Number.isInteger(senderTabId) || senderTabId <= 0) throw Object.assign(new Error("Delivery confirmation пришёл без AI tab."), { code: "DELIVERY_SENDER_TAB_MISSING" });
        const liveIdentity = await assertTabConversation(senderTabId, key);
        await strictBindingForIdentity(liveIdentity);
        await noteConfirmedPrefix(key, message.report_prefix_applied === true, String(message.delivery_id || ""));
        return { ok: true };
      }
      case "OZ_GET_AUTO_RECOVERY": {
        const key = normalizeConversationKey(message.conversation_key);
        const senderTabId = Number(sender?.tab?.id || 0);
        const run = await getAutoRun(key);
        if (!run || run.run_id !== String(message.run_id || "")) return { ok: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
        const owner = await ownerDecision(run, senderTabId, { allowRebind: true });
        if (!owner.owner) return { ok: false, code: "AUTO_NON_OWNER_TAB", error: "Recovery запрошен не owner-вкладкой." };
        const recovery = await recoveryPayloadForRun(owner.run || run);
        return { ok: true, recovery };
      }
      case "OZ_AUTO_START":
        return { ok: true, run: await startAutoRun(message.conversation_key, message.tab_id) };
      case "OZ_AUTO_START_COMMIT_REQUEST":
        return await commitAutoStart(message, sender);
      case "OZ_AUTO_START_COMPLETE":
        return await completeAutoStart(message, sender);
      case "OZ_AUTO_PAUSE":
        return { ok: true, run: await pauseAutoRun(message.conversation_key) };
      case "OZ_AUTO_RESUME":
        return { ok: true, run: await resumeAutoRun(message.conversation_key, message.tab_id) };
      case "OZ_AUTO_STOP":
        return { ok: true, run: await stopAutoRun(message.conversation_key) };
      case "OZ_AUTO_MESSAGE_READY":
        return await handleAutoMessage(message, sender);
      case "OZ_AUTO_COMMAND_READY":
        return await handleAutoMessage({ ...message, assistant_text: String(message.command_text || "") }, sender);
      case "OZ_AUTO_PREEXEC_ERROR":
        return await handleAutoPreExecutionError(message, sender);
      case "OZ_AUTO_DELIVERY_INSERT_COMMIT":
        return await commitBatchDeliveryInsert(message, sender);
      case "OZ_AUTO_DELIVERY_INSERTED":
        return await markBatchDeliveryInserted(message, sender);
      case "OZ_AUTO_DELIVERY_COMMIT_REQUEST":
        return await commitAutoDelivery(message, sender);
      case "OZ_AUTO_DELIVERY_COMPLETE":
        return { ok: true, run: await completeAutoDelivery(message, sender) };
      case "OZ_AUTO_DELIVERY_FAILED":
        return { ok: true, run: await failAutoDelivery(message, sender) };
      case "OZ_GET_SEND_BUTTON_PROFILE": {
        const data = await storageGet(KEYS.SEND_BUTTON_PROFILE);
        return { ok: true, profile: data[KEYS.SEND_BUTTON_PROFILE] || null };
      }
      case "OZ_SAVE_SEND_BUTTON_PROFILE": {
        const profile = message.profile || null;
        if (!profile || profile.kind !== "bb2_manual_send_button_v1") throw new Error("Invalid send button profile.");
        await storageSet({ [KEYS.SEND_BUTTON_PROFILE]: profile });
        const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*", "https://alice.yandex.ru/*"] }).catch(() => []);
        await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "OZ_SET_SEND_BUTTON_PROFILE", profile }).catch(() => null) : null));
        await diagnostic("SEND_BUTTON_PROFILE_SAVED", { kind: profile.kind, tag: profile.tag, testid: profile.testid, aria: profile.aria });
        return { ok: true };
      }
      case "OZ_CLEAR_SEND_BUTTON_PROFILE": {
        await storageSet({ [KEYS.SEND_BUTTON_PROFILE]: null });
        const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*", "https://alice.yandex.ru/*"] }).catch(() => []);
        await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "OZ_SET_SEND_BUTTON_PROFILE", profile: null }).catch(() => null) : null));
        await diagnostic("SEND_BUTTON_PROFILE_CLEARED", {});
        return { ok: true };
      }
      case "OZ_GET_MICROPHONE_BUTTON_PROFILE": {
        const data = await storageGet(KEYS.MICROPHONE_BUTTON_PROFILE);
        return { ok: true, profile: data[KEYS.MICROPHONE_BUTTON_PROFILE] || null };
      }
      case "OZ_SAVE_MICROPHONE_BUTTON_PROFILE": {
        const profile = message.profile || null;
        if (!profile || profile.kind !== "bb2_manual_microphone_button_v1") throw new Error("Invalid microphone button profile.");
        await storageSet({ [KEYS.MICROPHONE_BUTTON_PROFILE]: profile });
        const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*", "https://alice.yandex.ru/*"] }).catch(() => []);
        await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "OZ_SET_MICROPHONE_BUTTON_PROFILE", profile }).catch(() => null) : null));
        await diagnostic("MICROPHONE_BUTTON_PROFILE_SAVED", { kind: profile.kind, tag: profile.tag, testid: profile.testid, aria: profile.aria });
        return { ok: true };
      }
      case "OZ_CLEAR_MICROPHONE_BUTTON_PROFILE": {
        await storageSet({ [KEYS.MICROPHONE_BUTTON_PROFILE]: null });
        const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*", "https://alice.yandex.ru/*"] }).catch(() => []);
        await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "OZ_SET_MICROPHONE_BUTTON_PROFILE", profile: null }).catch(() => null) : null));
        await diagnostic("MICROPHONE_BUTTON_PROFILE_CLEARED", {});
        return { ok: true };
      }
      case "OZ_GET_COPY_BUTTON_PROFILES": {
        const profiles = await getCopyButtonProfiles();
        return { ok: true, profiles, builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT };
      }
      case "OZ_SAVE_COPY_BUTTON_PROFILE": {
        const normalized = BB2ManualControls.normalizeCopyButtonProfile(message.profile || null);
        if (!normalized) throw Object.assign(new Error("Invalid Copy button profile."), { code: "INVALID_COPY_BUTTON_PROFILE" });
        const profiles = await saveCopyButtonProfile(normalized);
        await diagnostic("COPY_BUTTON_PROFILE_ADDED", { adapter_id: normalized.adapter_id, testid: normalized.testid || null, aria: normalized.aria || null, custom_profile_count: profiles.profiles.length });
        return { ok: true, profiles, builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT };
      }
      case "OZ_CLEAR_COPY_BUTTON_PROFILES": {
        const profiles = await clearCopyButtonProfiles();
        await diagnostic("COPY_BUTTON_PROFILES_CLEARED", { builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT });
        return { ok: true, profiles, builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT };
      }
      case "OZ_GET_DIAGNOSTICS": {
        const data = await storageGet(KEYS.DIAGNOSTICS);
        return { ok: true, diagnostics: data[KEYS.DIAGNOSTICS] || [] };
      }
      case "OZ_CLEAR_DIAGNOSTICS":
        await storageSet({ [KEYS.DIAGNOSTICS]: [] });
        return { ok: true };
      case "OZ_RECORD_DIAGNOSTIC":
        await diagnostic(String(message.event || "CONTENT_DIAGNOSTIC"), { source: "content_script", tab_id: sender.tab?.id || null, ...(message.details || {}) });
        return { ok: true };
      default:
        return { ok: false, code: "UNKNOWN_MESSAGE", error: "Неизвестная команда расширения." };
    }
  })().then(sendResponse).catch(async (error) => {
    const code = String(error?.code || (error?.name === "AbortError" ? "REQUEST_TIMEOUT" : "EXTENSION_ERROR"));
    const text = String(error?.message || error || "Unknown error");
    await diagnostic("EXTENSION_MESSAGE_FAILED", { message_type: String(message?.type || ""), code, error: text, tab_id: sender?.tab?.id || null }, { level: "error" }).catch(() => null);
    sendResponse({ ok: false, code, error: text });
  });
  return true;
});
