/* global BB2ConversationIdentity, BB2ManualControls, WordstatProtocol, WordstatAutorunModel */
importScripts("shared/conversation_identity.js", "shared/manual_controls.js", "shared/wordstat_protocol.js", "shared/autorun_model.js");

const VERSION = "1.1.5";
const KEYS = Object.freeze({
  API_KEY: "wsmb_api_key",
  FOLDER_ID: "wsmb_folder_id",
  AUTO_SEND: "wsmb_auto_send",
  CONVERSATION_BINDINGS: "wsmb_conversation_bindings",
  MANUAL_MODES: "wsmb_manual_modes",
  MANUAL_OPERATIONS: "wsmb_manual_operations",
  AUTO_RUNS: "wsmb_auto_runs",
  REPORT_PREFIXES: "wsmb_report_prefix_configs",
  AUTO_START_PROMPTS: "wsmb_auto_start_prompts",
  SEND_BUTTON_PROFILE: "wsmb_send_button_profile",
  COPY_BUTTON_PROFILES: "wsmb_copy_button_profiles",
  DIAGNOSTICS: "wsmb_diagnostics",
  DIAGNOSTIC_SEQ: "wsmb_diagnostic_sequence",
  LAST_STATUS: "wsmb_last_status"
});
const FETCH_TIMEOUT_MS = 30000;
const MAX_RESPONSE_BYTES = 1_500_000;
const MAX_DIAGNOSTICS = 1500;
const WORKER_SESSION_ID = `worker-${crypto.randomUUID()}`;
const DEFAULT_AUTO_START_TEXT = [
  "ЭТО НАЧАЛО АВТОМАТИЧЕСКОЙ РАБОТЫ WORDSTAT.",
  "Продолжай текущий сбор Wordstat по активному плану/roadmap этого диалога.",
  "",
  "СПЕЦИАЛЬНЫЕ БЛОКИ ВО ВРЕМЯ AUTORUN РАЗРЕШЕНЫ ИСКЛЮЧИТЕЛЬНО ДЛЯ ИСПОЛНЯЕМЫХ КОМАНД РАСШИРЕНИЯ YANDEX WORDSTAT, НАЧИНАЮЩИХСЯ С WORDSTAT_API_V1.",
  "",
  "Любая готовая WORDSTAT_API_V1 команда, предназначенная расширению, обязательно выводится целиком ровно в одном специальном writing/code/копируемом блоке. В одном ответе допускается не более одной исполняемой WORDSTAT_API_V1 команды.",
  "",
  "АБСОЛЮТНЫЙ ЗАПРЕТ: запрещено использовать специальные блоки для любого содержимого, которое не является исполняемой WORDSTAT_API_V1 командой для этого расширения.",
  "В частности, запрещено помещать в специальные блоки: обычные ответы; анализ; объяснения; рассуждения; уточнения; вопросы; отчёты; progress preface; GitHub-проверки; acceptance/rejection verdict; описание ошибок; root-cause analysis; примеры; SQL; фрагменты кода; псевдокод; документацию; цитаты; таблицы; списки; команды, не являющиеся WORDSTAT_API_V1; любые другие материалы.",
  "Всё содержимое, которое не является исполняемой WORDSTAT_API_V1 командой, выводится только обычным текстом вне специальных блоков. Если ответ не содержит WORDSTAT_API_V1 команды, использование специальных блоков запрещено полностью.",
  "",
  "ПРАВИЛО СТОИМОСТИ ПЕРЕД КАЖДЫМ API-ВЫЗОВОМ:",
  "Непосредственно перед каждой исполняемой WORDSTAT_API_V1 командой заново проверь через интернет актуальный официальный тариф Yandex Search API / Wordstat по официальному источнику Яндекса. Не переиспользуй цену из предыдущего шага, даже если он был только что.",
  "Обычным текстом вне специального блока кратко укажи метод, phrase, region/device/period и другие существенные параметры текущего запроса, а также стоимость именно одного этого вызова. Только после свежей проверки тарифа и такого пояснения выдай ровно один исполняемый WORDSTAT_API_V1 block.",
  "",
  "Один WORDSTAT_API_V1 = один Yandex API request. Не объединяй разные phrase в один вызов, не делай batch и не повторяй неуспешный API-запрос автоматически.",
  "После WORDSTAT_RESULT_V1 обработай evidence по текущему roadmap и продолжи следующий шаг. Если следующий шаг не требует Wordstat API, не используй специальный блок.",
  "",
  "ПРАВИЛО ЗАВЕРШЕНИЯ AUTORUN: когда сбор по активному плану/roadmap полностью закончен и следующий Wordstat API-вызов больше не нужен, ответь только точным сообщением: сбор закончен. Не добавляй к нему пояснения, отчёт, итог, список, специальный блок или любой другой текст."
].join("\n");

let bindingWriteLock = Promise.resolve();
let autoRunsWriteLock = Promise.resolve();
let manualOperationsWriteLock = Promise.resolve();
let prefixWriteLock = Promise.resolve();
let startPromptWriteLock = Promise.resolve();
let migrationWriteLock = Promise.resolve();
let diagnosticsWriteLock = Promise.resolve();
let copyProfilesWriteLock = Promise.resolve();

// Reference-parity single-flight: one worker-owned browser delivery attempt per run.
// This is deliberately the same primitive used by Business Bridge 2.0.0.22.
const deliveryAttemptRequests = new Map();
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
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function normalizeApiKey(value, { required = false } = {}) {
  const key = String(value ?? "").trim();
  if (!key) {
    if (required) throw Object.assign(new Error("API key не сохранён в расширении."), { code: "API_KEY_MISSING" });
    return "";
  }
  if (key.length > 2048) {
    throw Object.assign(new Error("API key слишком длинный."), { code: "INVALID_API_KEY" });
  }
  for (let i = 0; i < key.length; i += 1) {
    const code = key.charCodeAt(i);
    if (code < 0x21 || code > 0x7e) {
      throw Object.assign(new Error(`API key содержит недопустимый символ в позиции ${i + 1}. Вставьте исходный ASCII API key без кириллицы, типографских/невидимых символов и пробелов.`), { code: "INVALID_API_KEY" });
    }
  }
  return key;
}

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
  const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*"] }).catch(() => []);
  await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "WS_SET_COPY_BUTTON_PROFILES", profiles: normalized }).catch(() => null) : null));
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
  if (["token", "authorization", "api_key", "prompt_text", "report_text", "outgoing_text", "body", "credential"].includes(lower) || lower.includes("token") || lower.includes("secret") || lower.includes("api_key")) {
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
    throw Object.assign(new Error("Не удалось определить текущий ChatGPT-диалог."), { code: "INVALID_CONVERSATION_KEY" });
  }
  return key;
}

function normalizeTabId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error("Не удалось определить вкладку ChatGPT."), { code: "INVALID_TAB_ID" });
  return id;
}

function normalizeIdentity(identity) {
  const origin = String(identity?.origin || "").trim().toLowerCase();
  const conversationId = identity?.conversation_id ? String(identity.conversation_id).trim().toLowerCase() : null;
  const status = String(identity?.status || (conversationId ? "confirmed" : "unknown"));
  if (!/^https:\/\/(chatgpt\.com|chat\.openai\.com)$/.test(origin)) {
    throw Object.assign(new Error("Не удалось подтвердить origin ChatGPT-диалога."), { code: "INVALID_CHATGPT_ORIGIN" });
  }
  if (status === "conflict") {
    throw Object.assign(new Error("Path и canonical указывают на разные ChatGPT-диалоги. Autorun заблокирован fail-closed."), { code: "CONVERSATION_IDENTITY_CONFLICT" });
  }
  return {
    origin,
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

function legacyConversationKey(identity) {
  const normalized = normalizeIdentity(identity);
  return normalized.conversation_id ? `chatgpt:c:${normalized.conversation_id}` : null;
}

function sameConversationIdentity(a, b) {
  const left = normalizeIdentity(a);
  const right = normalizeIdentity(b);
  return Boolean(left.conversation_id && right.conversation_id && left.origin === right.origin && left.conversation_id === right.conversation_id);
}

async function tabIdentity(tabId) {
  const tab = normalizeTabId(tabId);
  const response = await tabMessage(tab, { type: "WS_GET_IDENTITY" });
  if (!response?.ok || !response.identity) {
    throw Object.assign(new Error(response?.error || "Не удалось прочитать identity ChatGPT-диалога."), { code: response?.code || "IDENTITY_UNAVAILABLE" });
  }
  return normalizeIdentity(response.identity);
}

async function assertTabConversation(tabId, conversationKey, expectedConversationId = null) {
  const key = normalizeConversationKey(conversationKey);
  const identity = await tabIdentity(tabId);
  const liveKey = conversationKeyFromIdentity(identity);
  if (!liveKey || liveKey !== key) {
    throw Object.assign(new Error("Привязанная вкладка открыта на другом или неподтверждённом ChatGPT-диалоге."), { code: "CONVERSATION_MISMATCH" });
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
    throw Object.assign(new Error("ChatGPT conversation identity не подтверждена; явная привязка невозможна."), { code: "CONVERSATION_NOT_CONFIRMED" });
  }
  const binding = await bindingForConversationKey(key);
  if (!binding) {
    throw Object.assign(new Error("Этот ChatGPT-диалог не привязан к Wordstat Bridge. Сначала нажмите «Привязать диалог» в popup."), { code: "CONVERSATION_NOT_BOUND" });
  }
  if (binding.origin !== normalized.origin || binding.conversation_id !== normalized.conversation_id || binding.conversation_key !== key) {
    throw Object.assign(new Error("Conversation binding не совпадает с текущим ChatGPT-диалогом."), { code: "CONVERSATION_BINDING_MISMATCH" });
  }
  return binding;
}

function bindingSnapshot(binding) {
  return {
    binding_id: String(binding.binding_id),
    binding_revision: Math.max(1, Number(binding.revision || 1)),
    origin: String(binding.origin),
    conversation_id: String(binding.conversation_id),
    conversation_key: String(binding.conversation_key)
  };
}

async function assertRunBinding(run) {
  if (!run) throw Object.assign(new Error("Run отсутствует."), { code: "AUTO_RUN_NOT_FOUND" });
  const liveBinding = await bindingForConversationKey(run.conversation_key);
  if (!liveBinding) {
    throw Object.assign(new Error("Привязка ChatGPT-диалога к Wordstat Bridge отсутствует. Run заблокирован fail-closed."), { code: "CONVERSATION_NOT_BOUND" });
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

async function bindConversation(context) {
  const tab = normalizeTabId(context?.tab_id);
  const expected = normalizeIdentity({
    origin: context?.origin,
    conversation_id: context?.conversation_id,
    status: context?.conversation_id ? "confirmed" : "unknown"
  });
  if (!expected.conversation_id) {
    throw Object.assign(new Error("Нужен подтверждённый ChatGPT-диалог /c/<conversation-id>."), { code: "CONVERSATION_NOT_CONFIRMED" });
  }
  const live = await tabIdentity(tab);
  if (!sameConversationIdentity(live, expected)) {
    throw Object.assign(new Error("Контекст popup изменился. Откройте popup заново в нужном ChatGPT-диалоге."), { code: "POPUP_CONTEXT_STALE" });
  }
  const key = await resolveConfirmedConversationKey(live);
  return withBindingWrite(async () => {
    const bindings = await getConversationBindings();
    const previous = normalizeBindingRecord(bindings[key], key);
    const now = new Date().toISOString();
    const record = {
      binding_id: previous?.binding_id || `wsbind-${crypto.randomUUID()}`,
      revision: Math.max(0, Number(previous?.revision || 0)) + 1,
      origin: live.origin,
      conversation_id: live.conversation_id,
      conversation_key: key,
      bound_at: previous?.bound_at || now,
      updated_at: now
    };
    bindings[key] = record;
    const bindingUpdates = { [KEYS.CONVERSATION_BINDINGS]: bindings };
    // A pre-1.1.5 manual-mode bit must not silently become armed merely because the operator
    // performs the first explicit bind. The first bind is authorization, not implicit mode activation.
    if (!previous) {
      const manualData = await storageGet(KEYS.MANUAL_MODES);
      const modes = { ...(manualData[KEYS.MANUAL_MODES] || {}) };
      delete modes[key];
      bindingUpdates[KEYS.MANUAL_MODES] = modes;
    }
    await storageSet(bindingUpdates);

    // Explicit operator binding is the only allowed migration path for an older active run
    // that predates binding snapshots. Never auto-bind on extension upgrade.
    const existing = await getAutoRun(key);
    if (existing && !existing.binding_snapshot && !WordstatAutorunModel.isTerminalStatus(existing.status)) {
      await mutateAutoRun(key, (current) => current ? { ...current, binding_snapshot: bindingSnapshot(record) } : current);
      await diagnostic("LEGACY_RUN_BOUND_BY_EXPLICIT_OPERATOR_ACTION", { run_id: existing.run_id, binding_id: record.binding_id, conversation_key: key });
    }
    await diagnostic("CONVERSATION_BOUND", { binding_id: record.binding_id, binding_revision: record.revision, conversation_key: key, tab_id: tab });
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
    throw Object.assign(new Error("Нужен подтверждённый ChatGPT-диалог /c/<conversation-id>. В новом пустом чате сначала создайте диалог, затем откройте popup снова."), { code: "CONVERSATION_NOT_CONFIRMED" });
  }
  await migrateLegacyConversationStorage(normalized);
  return key;
}

async function resolvePopupContext(tabId, expectedIdentity = null) {
  const tab = normalizeTabId(tabId);
  const live = await tabIdentity(tab);
  if (expectedIdentity) {
    const expected = normalizeIdentity(expectedIdentity);
    if (!sameConversationIdentity(live, expected)) {
      throw Object.assign(new Error("Контекст popup изменился. Откройте popup заново в нужном ChatGPT-диалоге."), { code: "POPUP_CONTEXT_STALE" });
    }
  }
  const key = await resolveConfirmedConversationKey(live);
  return { tab_id: tab, conversation_key: key, identity: live };
}

async function getSettings() {
  const data = await storageGet([KEYS.API_KEY, KEYS.FOLDER_ID, KEYS.AUTO_SEND, KEYS.LAST_STATUS]);
  return {
    apiKey: String(data[KEYS.API_KEY] || ""),
    folderId: String(data[KEYS.FOLDER_ID] || WordstatProtocol.DEFAULT_FOLDER_ID),
    autoSend: data[KEYS.AUTO_SEND] !== false,
    lastStatus: data[KEYS.LAST_STATUS] || null
  };
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

function publicManualOperation(operation) {
  if (!operation) return null;
  return {
    operation_id: operation.operation_id || null,
    manual_request_id: operation.manual_request_id || null,
    status: operation.status || null,
    owner_tab_id: operation.tab_id || null,
    request_id: operation.request_id || null,
    delivery_id: operation.delivery_id || null,
    method: operation.method || null,
    phrase: operation.phrase || null,
    delivery_confirmed: operation.delivery_confirmed === true,
    created_at: operation.created_at || null,
    updated_at: operation.updated_at || null,
    completed_at: operation.completed_at || null,
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

async function setManualMode(conversationKey, enabled) {
  const key = normalizeConversationKey(conversationKey);
  if (enabled === true) {
    const run = await getAutoRun(key);
    if (run && !WordstatAutorunModel.canEnableManualMode(run.status)) {
      throw Object.assign(new Error("Авторежим активен. Сначала нажмите «Пауза», затем включайте ручной режим."), { code: "AUTO_MODE_ACTIVE" });
    }
  }
  const data = await storageGet(KEYS.MANUAL_MODES);
  const modes = { ...(data[KEYS.MANUAL_MODES] || {}) };
  if (enabled === true) modes[key] = true;
  else delete modes[key];
  await storageSet({ [KEYS.MANUAL_MODES]: modes });
  return enabled === true;
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
    const normalized = WordstatAutorunModel.normalizePrefixRecord({
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
    prefixes[key] = WordstatAutorunModel.noteConfirmedPrefix(current, applied === true, deliveryId);
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
      return {
        text: normalizeAutoStartPromptText(current.text),
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
    last_method: run.last_method || null,
    last_phrase: run.last_phrase || null,
    last_assistant_turn_id: run.last_assistant_turn_id || null,
    created_at: run.created_at || null,
    updated_at: run.updated_at || null,
    last_error: run.last_error || null
  };
}

async function commonPublicSettingsFields() {
  const settings = await getSettings();
  const [sendData, copyProfiles] = await Promise.all([
    storageGet(KEYS.SEND_BUTTON_PROFILE),
    getCopyButtonProfiles()
  ]);
  return {
    version: VERSION,
    has_api_key: Boolean(settings.apiKey),
    folder_id: settings.folderId,
    auto_send: settings.autoSend,
    send_button_profile: sendData[KEYS.SEND_BUTTON_PROFILE] || null,
    copy_button_profiles: copyProfiles,
    copy_button_profile_count: copyProfiles.profiles.length,
    copy_button_builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT,
    last_status: settings.lastStatus
  };
}

async function publicSettingsState(conversationKey) {
  const key = normalizeConversationKey(conversationKey);
  const common = await commonPublicSettingsFields();
  const [manualMode, manualOperation, run, prefix, startPrompt, binding] = await Promise.all([
    getManualMode(key), getManualOperation(key), getAutoRun(key), getReportPrefix(key), getAutoStartPrompt(key), bindingForConversationKey(key)
  ]);
  return {
    ...common,
    page_context_available: true,
    conversation_key: key,
    binding: binding ? { bound: true, ...binding } : { bound: false, binding_id: null, revision: null },
    manual_mode: binding ? manualMode : false,
    manual_operation: binding ? publicManualOperation(manualOperation) : null,
    manual_operation_active: binding ? manualOperationActive(manualOperation) : false,
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
    auto_run: null,
    auto_start_prompt: { text: DEFAULT_AUTO_START_TEXT, is_default: true, updated_at: null },
    report_prefix: null
  };
}

async function setStatus(status) {
  const clean = {
    ok: Boolean(status.ok),
    code: String(status.code || "").slice(0, 120),
    message: String(status.message || "").slice(0, 800),
    http_status: Number(status.http_status || 0),
    at: new Date().toISOString()
  };
  await storageSet({ [KEYS.LAST_STATUS]: clean });
  return clean;
}

async function readResponseBounded(response) {
  const reader = response.body?.getReader?.();
  if (!reader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
      throw Object.assign(new Error("Ответ Yandex превышает безопасный лимит расширения."), { code: "RESPONSE_TOO_LARGE" });
    }
    return text;
  }
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      try { await reader.cancel(); } catch (_) {}
      throw Object.assign(new Error("Ответ Yandex превышает безопасный лимит расширения."), { code: "RESPONSE_TOO_LARGE" });
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

async function yandexFetch({ url, body, apiKey }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer"
    });
    const rawText = await readResponseBounded(response);
    let parsed = null;
    try { parsed = rawText ? JSON.parse(rawText) : {}; } catch (_) {}
    return {
      ok: response.ok,
      status: response.status,
      parsed,
      rawText,
      elapsedMs: Math.round(performance.now() - started)
    };
  } finally {
    clearTimeout(timer);
  }
}

async function executeWordstatCore(commandText) {
  const settings = await getSettings();
  const apiKey = normalizeApiKey(settings.apiKey, { required: true });
  if (!settings.folderId) throw Object.assign(new Error("Folder ID не сохранён в расширении."), { code: "FOLDER_ID_MISSING" });
  const command = WordstatProtocol.parseCommand(commandText);
  const request = WordstatProtocol.buildRequest(command, settings.folderId);
  const requestId = crypto.randomUUID();
  await diagnostic("YANDEX_REQUEST_STARTED", { request_id: requestId, method: command.method, phrase: command.phrase || null, regions: command.regions || [], devices: command.devices || [], num_phrases: command.numPhrases || null });
  const response = await yandexFetch({ ...request, apiKey });
  await diagnostic("YANDEX_REQUEST_FINISHED", { request_id: requestId, method: command.method, phrase: command.phrase || null, http_status: response.status, ok: response.ok, elapsed_ms: response.elapsedMs }, { level: response.ok ? "info" : "warning" });
  let reportText;
  if (!response.ok) {
    const errorPayload = WordstatProtocol.safeErrorPayload(response.status, response.rawText, response.parsed);
    await setStatus({ ok: false, ...errorPayload });
    reportText = WordstatProtocol.formatResultReport({
      requestId,
      command,
      httpStatus: response.status,
      elapsedMs: response.elapsedMs,
      result: { error: errorPayload }
    });
  } else {
    await setStatus({ ok: true, code: "CONNECTED", message: "Последний Wordstat API запрос выполнен успешно.", http_status: response.status });
    reportText = WordstatProtocol.formatResultReport({
      requestId,
      command,
      httpStatus: response.status,
      elapsedMs: response.elapsedMs,
      result: response.parsed ?? response.rawText
    });
  }
  return {
    ok: response.ok,
    request_id: requestId,
    command,
    http_status: response.status,
    report_text: reportText,
    auto_send: settings.autoSend
  };
}

async function applyPrefixToReport(conversationKey, reportText) {
  const prefix = await getReportPrefix(conversationKey);
  const result = WordstatAutorunModel.applyReportPrefix(reportText, prefix);
  return { outgoing_text: result.text, report_prefix_applied: result.applied };
}

async function executeManualCommand(commandText, conversationKey, sender, manualRequestId) {
  const key = normalizeConversationKey(conversationKey);
  const senderTabId = Number(sender?.tab?.id || 0);
  if (!Number.isInteger(senderTabId) || senderTabId <= 0) {
    throw Object.assign(new Error("Ручная Wordstat-команда должна приходить из ChatGPT content script."), { code: "MANUAL_SENDER_TAB_MISSING" });
  }
  const requestToken = String(manualRequestId || "").trim();
  if (!requestToken) throw Object.assign(new Error("Manual request ID отсутствует."), { code: "MANUAL_REQUEST_ID_MISSING" });
  const liveIdentity = await assertTabConversation(senderTabId, key);
  const binding = await strictBindingForIdentity(liveIdentity);
  if (!(await getManualMode(key))) {
    throw Object.assign(new Error("Ручной режим Wordstat выключен для этого ChatGPT-диалога. API-запрос по Copy не выполнен."), { code: "MANUAL_MODE_OFF" });
  }
  const run = await getAutoRun(key);
  if (run && !WordstatAutorunModel.canEnableManualMode(run.status)) {
    throw Object.assign(new Error("Авторежим активен. Ручной API-вызов разрешён только когда run на паузе."), { code: "AUTO_MODE_ACTIVE" });
  }
  const parsed = WordstatProtocol.parseCommand(commandText);
  let duplicateOperation = null;
  const operationId = `wsmanual-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
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
      method: parsed.method,
      phrase: parsed.phrase || null,
      request_id: null,
      request_worker_session_id: WORKER_SESSION_ID,
      delivery_id: null,
      outgoing_text: null,
      auto_send: true,
      report_prefix_applied: false,
      delivery_confirmed: false,
      created_at: now,
      completed_at: null,
      last_error: null
    };
  });
  if (duplicateOperation) {
    throw Object.assign(new Error("Эта ручная операция уже принята. Повторный API-вызов запрещён."), { code: "MANUAL_REQUEST_DUPLICATE", operation_id: duplicateOperation.operation_id });
  }
  if (!operation || operation.operation_id !== operationId) {
    throw Object.assign(new Error("Bridge уже выполняет или доставляет ручной Wordstat-запрос."), { code: "MANUAL_OPERATION_ACTIVE" });
  }
  await diagnostic("MANUAL_OPERATION_CLAIMED", { operation_id: operationId, manual_request_id: requestToken, conversation_id: liveIdentity.conversation_id, tab_id: senderTabId, method: parsed.method, phrase: parsed.phrase || null });
  try {
    const result = await executeWordstatCore(commandText);
    const prefixed = await applyPrefixToReport(key, result.report_text);
    const deliveryId = `manual-delivery-${operationId}`;
    await mutateManualOperation(key, (current) => {
      if (!current || current.operation_id !== operationId) return current;
      return {
        ...current,
        status: MANUAL_OPERATION_STATUSES.DELIVERING,
        request_id: result.request_id || null,
        delivery_id: deliveryId,
        outgoing_text: prefixed.outgoing_text || result.report_text,
        auto_send: result.auto_send !== false,
        report_prefix_applied: prefixed.report_prefix_applied === true,
        last_error: null
      };
    });
    await diagnostic("MANUAL_OPERATION_DELIVERING", { operation_id: operationId, delivery_id: deliveryId, request_id: result.request_id || null, tab_id: senderTabId });
    return { ...result, ...prefixed, manual_operation_id: operationId, manual_request_id: requestToken, delivery_id: deliveryId };
  } catch (error) {
    await mutateManualOperation(key, (current) => {
      if (!current || current.operation_id !== operationId) return current;
      return { ...current, status: MANUAL_OPERATION_STATUSES.FAILED, completed_at: new Date().toISOString(), last_error: { code: error.code || "MANUAL_OPERATION_FAILED", message: String(error.message || error) } };
    });
    await diagnostic("MANUAL_OPERATION_FAILED", { operation_id: operationId, code: error.code || "MANUAL_OPERATION_FAILED", error: String(error.message || error) }, { level: "error" });
    throw error;
  }
}

function manualDeliveryRecoveryPayload(operation) {
  if (!operation || operation.status !== MANUAL_OPERATION_STATUSES.DELIVERING || !operation.delivery_id || !operation.outgoing_text) return null;
  return {
    type: "manual_deliver",
    operation_id: operation.operation_id,
    manual_request_id: operation.manual_request_id || "",
    conversation_key: operation.conversation_key,
    origin: operation.origin,
    conversation_id: operation.conversation_id,
    delivery_id: operation.delivery_id,
    request_id: operation.request_id || "",
    outgoing_text: operation.outgoing_text,
    auto_send: operation.auto_send !== false,
    report_prefix_applied: operation.report_prefix_applied === true
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
    if (current.request_worker_session_id && current.request_worker_session_id !== WORKER_SESSION_ID) {
      current = await mutateManualOperation(current.conversation_key, (record) => {
        if (!record || record.operation_id !== current.operation_id || record.status !== MANUAL_OPERATION_STATUSES.REQUESTING) return record;
        return {
          ...record,
          status: MANUAL_OPERATION_STATUSES.FAILED,
          completed_at: new Date().toISOString(),
          last_error: {
            code: "MANUAL_REQUEST_OUTCOME_UNKNOWN",
            message: "Service worker перезапустился во время ручного Yandex request. Исход запроса неизвестен; автоматический повтор запрещён."
          }
        };
      });
      await diagnostic("MANUAL_REQUEST_RECOVERY_BLOCKED_NO_RETRY", { operation_id: current?.operation_id || operation.operation_id, previous_worker_session_id: operation.request_worker_session_id || null, worker_session_id: WORKER_SESSION_ID }, { level: "error" });
      return { owner: true, rebound: owner.rebound === true, operation: current, recovery: null };
    }
    return { owner: true, rebound: owner.rebound === true, operation: current, recovery: null };
  }
  return { owner: true, rebound: owner.rebound === true, operation: current, recovery: manualDeliveryRecoveryPayload(current) };
}

async function completeManualOperation(message, sender, failed = false) {
  const key = normalizeConversationKey(message.conversation_key);
  const operationId = String(message.manual_operation_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  if (!operationId) throw Object.assign(new Error("Manual operation ID отсутствует."), { code: "MANUAL_OPERATION_ID_MISSING" });
  if (!Number.isInteger(senderTabId) || senderTabId <= 0) throw Object.assign(new Error("Manual completion пришёл без ChatGPT tab."), { code: "MANUAL_SENDER_TAB_MISSING" });
  const liveIdentity = await assertTabConversation(senderTabId, key);
  await strictBindingForIdentity(liveIdentity);
  let transitioned = false;
  const operation = await mutateManualOperation(key, (current) => {
    if (!current || current.operation_id !== operationId) return current;
    if (current.tab_id !== senderTabId) return current;
    if (!manualOperationActive(current)) return current;
    transitioned = true;
    return {
      ...current,
      status: failed ? MANUAL_OPERATION_STATUSES.FAILED : MANUAL_OPERATION_STATUSES.COMPLETED,
      delivery_confirmed: message.delivery_confirmed === true,
      confirmed_user_turn_id: message.confirmed_user_turn_id || null,
      composer_empty: message.composer_empty === true,
      click_attempts: Number(message.click_attempts || 0),
      completed_at: new Date().toISOString(),
      last_error: failed ? { code: String(message.code || "MANUAL_DELIVERY_FAILED"), message: String(message.error || "Manual delivery failed") } : null
    };
  });
  if (!operation || operation.operation_id !== operationId) return { ok: false, code: "MANUAL_OPERATION_NOT_FOUND", error: "Manual operation не найдена или не принадлежит этой вкладке." };
  if (!transitioned && manualOperationActive(operation)) return { ok: false, code: "MANUAL_OPERATION_STATE_MISMATCH", error: "Manual operation не может быть завершена из текущего состояния." };
  await diagnostic(failed ? "MANUAL_OPERATION_DELIVERY_FAILED" : "MANUAL_OPERATION_COMPLETED", { operation_id: operationId, delivery_id: operation.delivery_id || null, request_id: operation.request_id || null, delivery_confirmed: operation.delivery_confirmed === true, composer_empty: operation.composer_empty === true, click_attempts: Number(operation.click_attempts || 0) }, { level: failed ? "error" : "info" });
  return { ok: true, operation: publicManualOperation(operation) };
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
  const response = await tabMessage(run.tab_id, { type: "WS_AUTO_STOP_WATCH", run_id: run.run_id, reason: reason || "worker" });
  await diagnostic("PROMPT_WATCH_STOP_RESPONSE", { run_id: run.run_id, tab_id: run.tab_id, ok: response?.ok === true, code: response?.code || null, error: response?.error || null }, { level: response?.ok === true ? "info" : "warning" });
}

async function beginWatch(run) {
  if (!run || run.status !== WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND) return { ok: false, code: "RUN_NOT_WAITING" };
  await assertRunBinding(run);
  await assertTabConversation(run.tab_id, run.conversation_key, run.conversation_id);
  return tabMessage(run.tab_id, {
    type: "WS_AUTO_BEGIN_WATCH",
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
    status: WordstatAutorunModel.RUN_STATUSES.ERROR,
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

  if (!allowRebind || WordstatAutorunModel.isTerminalStatus(run.status)) {
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
  const phase = run.start_delivery?.phase || WordstatAutorunModel.START_PHASES.NONE;
  if (phase === WordstatAutorunModel.START_PHASES.CONFIRMED) {
    return { ok: true, committed: true, click_allowed: false, already_confirmed: true };
  }
  if (phase === WordstatAutorunModel.START_PHASES.COMMITTED) {
    // Commit is the irreversible boundary. Even the same content runtime must never receive a second click grant.
    return { ok: true, committed: true, click_allowed: false, already_committed: true };
  }
  if (run.status !== WordstatAutorunModel.RUN_STATUSES.STARTING) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_START_STATE_MISMATCH", error: "Run не находится в start state." };
  }
  let clickAllowed = false;
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.status !== WordstatAutorunModel.RUN_STATUSES.STARTING) return current;
    const currentPhase = current.start_delivery?.phase || WordstatAutorunModel.START_PHASES.NONE;
    if (currentPhase !== WordstatAutorunModel.START_PHASES.NONE) return current;
    clickAllowed = true;
    return WordstatAutorunModel.commitStart(current, {
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
    if (current.start_delivery?.phase === WordstatAutorunModel.START_PHASES.CONFIRMED) return current;
    if (current.status !== WordstatAutorunModel.RUN_STATUSES.STARTING || current.start_delivery?.phase !== WordstatAutorunModel.START_PHASES.COMMITTED) return current;
    didConfirm = true;
    return WordstatAutorunModel.afterConfirmedStart(current, assistantBaselineIds || []);
  });
  if (!didConfirm && run?.start_delivery?.phase !== WordstatAutorunModel.START_PHASES.CONFIRMED) {
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
    if (run?.status === WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
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
  if (run.start_delivery?.phase === WordstatAutorunModel.START_PHASES.CONFIRMED) {
    return { ok: true, confirmed: true, already_confirmed: true, run: publicRun(run) };
  }
  if (run.status !== WordstatAutorunModel.RUN_STATUSES.STARTING) {
    return { ok: false, code: "AUTO_START_STATE_MISMATCH", error: "Run не находится в start state." };
  }
  if (run.start_delivery?.phase !== WordstatAutorunModel.START_PHASES.COMMITTED) {
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
    run_id: run.run_id,
    conversation_key: run.conversation_key,
    origin: run.origin,
    conversation_id: run.conversation_id,
    delivery_id: run.delivery?.delivery_id || "",
    request_id: run.delivery?.request_id || "",
    outgoing_text: String(run.delivery?.outgoing_text || ""),
    outgoing_hash: run.delivery?.outgoing_hash || "",
    report_prefix_applied: run.delivery?.report_prefix_applied === true,
    baseline_user_turn_ids: Array.isArray(run.delivery?.baseline_user_turn_ids) ? run.delivery.baseline_user_turn_ids : []
  };
}

async function recoveryPayloadForRun(run) {
  if (!run || WordstatAutorunModel.isTerminalStatus(run.status)) return null;
  await assertRunBinding(run);
  const decision = WordstatAutorunModel.recoveryDecision(run, WORKER_SESSION_ID);
  if (decision.type === "unsafe_request_outcome") {
    const failed = await markRunError(run.conversation_key, decision.code, "Service worker перезапустился во время Yandex API request. Исход запроса неизвестен; автоматический повтор запрещён, чтобы не создать второй платный API-вызов.");
    await diagnostic("REQUEST_RECOVERY_BLOCKED_NO_RETRY", { run_id: run.run_id, previous_worker_session_id: run.request_worker_session_id || null, worker_session_id: WORKER_SESSION_ID }, { level: "error" });
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
  if (decision.type === "deliver_claimed") return deliveryRecoveryPayload(run, "deliver_claimed");
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
  if (!settings.apiKey) throw Object.assign(new Error("Сначала сохраните Yandex API key."), { code: "API_KEY_MISSING" });
  if (!settings.folderId) throw Object.assign(new Error("Сначала сохраните Folder ID."), { code: "FOLDER_ID_MISSING" });
  if (await getManualMode(key)) throw Object.assign(new Error("Сначала отключите ручной режим Wordstat."), { code: "MANUAL_MODE_ACTIVE" });
  const manualOperation = await getManualOperation(key);
  if (manualOperationActive(manualOperation)) {
    await diagnostic("AUTO_MODE_START_BLOCKED_BY_MANUAL_OPERATION", { operation_id: manualOperation.operation_id || null, status: manualOperation.status || null, conversation_id: liveIdentity.conversation_id || null, tab_id: tab }, { level: "warning" });
    throw Object.assign(new Error("Дождитесь завершения уже принятого ручного Wordstat request/delivery."), { code: "MANUAL_OPERATION_ACTIVE" });
  }
  const existing = await getAutoRun(key);
  if (existing && !WordstatAutorunModel.isTerminalStatus(existing.status)) {
    throw Object.assign(new Error("Для этого диалога уже существует активный Wordstat autorun."), { code: "AUTO_RUN_ALREADY_ACTIVE" });
  }

  const startPrompt = await getAutoStartPrompt(key);
  const now = new Date().toISOString();
  let run = {
    run_id: `wsrun-${crypto.randomUUID()}`,
    conversation_key: key,
    origin: liveIdentity.origin,
    conversation_id: liveIdentity.conversation_id,
    binding_snapshot: bindingSnapshot(binding),
    tab_id: tab,
    status: WordstatAutorunModel.RUN_STATUSES.STARTING,
    sequence: 0,
    pause_requested: false,
    finish_requested: false,
    assistant_baseline_ids: [],
    watch_id: null,
    last_assistant_turn_id: null,
    last_command_fingerprint: null,
    last_method: null,
    last_phrase: null,
    last_error: null,
    start_delivery: {
      phase: WordstatAutorunModel.START_PHASES.NONE,
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
    type: "WS_AUTO_SEND_START",
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
    if ((run.start_delivery?.phase || WordstatAutorunModel.START_PHASES.NONE) === WordstatAutorunModel.START_PHASES.NONE) {
      run = await markRunError(key, response?.code || "AUTO_START_FAILED", response?.error || "Не удалось подготовить/отправить стартовое сообщение autorun.");
      throw Object.assign(new Error(response?.error || "Не удалось отправить стартовое сообщение autorun."), { code: response?.code || "AUTO_START_FAILED" });
    }
    // After commit the click outcome can be ambiguous. Never auto-resend; leave STARTING for reconciliation.
    await diagnostic("START_RESPONSE_LOST_AFTER_COMMIT", { run_id: run.run_id, phase: run.start_delivery?.phase || null }, { level: "warning" });
  } else if ((run.start_delivery?.phase || WordstatAutorunModel.START_PHASES.NONE) === WordstatAutorunModel.START_PHASES.COMMITTED) {
    await diagnostic("START_CONFIRMATION_PENDING", { run_id: run.run_id, tab_id: tab, click_attempts: Number(response?.click_attempts || 0), confirmation_basis: "composer_not_empty" }, { level: "warning" });
  }
  return publicRun(await getAutoRun(key) || run);
}

async function handleAutoCommand(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const assistantTurnId = String(message.assistant_turn_id || "");
  const commandText = String(message.command_text || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  const currentRun = await getAutoRun(key);
  if (!currentRun || currentRun.run_id !== runId) return { ok: false, accepted: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
  if (!Number.isInteger(senderTabId) || senderTabId !== Number(currentRun.tab_id)) {
    return { ok: false, accepted: false, code: "AUTO_NON_OWNER_TAB", error: "Этот WORDSTAT_API_V1 block появился не во вкладке-owner активного autorun." };
  }
  try {
    await assertTabConversation(senderTabId, key, currentRun.conversation_id);
    await assertRunBinding(currentRun);
  } catch (error) { return { ok: false, accepted: false, code: error.code || "CONVERSATION_MISMATCH", error: error.message }; }
  if (await getManualMode(key)) return { ok: false, paused: true, code: "MANUAL_MODE_ACTIVE", error: "Ручной режим включён; autorun не выполняет команду." };
  let parsed;
  try { parsed = WordstatProtocol.parseCommand(commandText); }
  catch (error) { return { ok: false, accepted: false, code: error.code || "INVALID_COMMAND", error: error.message }; }
  const fingerprint = WordstatProtocol.commandFingerprint(parsed);

  let requestGranted = false;
  let run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId) return current;
    if (Number(current.tab_id) !== senderTabId) return current;
    if (current.status !== WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND) return current;
    if (current.last_assistant_turn_id === assistantTurnId && current.last_command_fingerprint === fingerprint) return current;
    requestGranted = true;
    return {
      ...current,
      status: WordstatAutorunModel.RUN_STATUSES.REQUESTING,
      request_worker_session_id: WORKER_SESSION_ID,
      request_started_at: new Date().toISOString(),
      last_assistant_turn_id: assistantTurnId,
      last_command_fingerprint: fingerprint,
      last_method: parsed.method,
      last_phrase: parsed.phrase || null,
      last_error: null
    };
  });

  if (!run || run.run_id !== runId) return { ok: false, accepted: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
  if (!requestGranted) {
    return { ok: true, accepted: false, ignored: true, status: run.status };
  }

  await diagnostic("AUTO_COMMAND_ACCEPTED", { run_id: runId, tab_id: senderTabId, assistant_turn_id: assistantTurnId, method: parsed.method, phrase: parsed.phrase || null, command_fingerprint: fingerprint });
  let result;
  try {
    result = await executeWordstatCore(commandText);
  } catch (error) {
    await markRunError(key, error.code || "AUTO_REQUEST_FAILED", error.message || String(error));
    throw error;
  }

  const deliveryId = `delivery-${crypto.randomUUID()}`;
  const prefixed = await applyPrefixToReport(key, result.report_text);
  const outgoingHash = await sha256Hex(prefixed.outgoing_text);
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId) return current;
    const claimed = WordstatAutorunModel.claimDelivery(current, {
      deliveryId,
      requestId: result.request_id,
      outgoingText: prefixed.outgoing_text,
      outgoingHash,
      reportPrefixApplied: prefixed.report_prefix_applied === true
    });
    claimed.request_worker_session_id = null;
    claimed.request_completed_at = new Date().toISOString();
    return claimed;
  });
  await diagnostic("DELIVERY_CLAIMED", { run_id: runId, delivery_id: deliveryId, request_id: result.request_id, report_prefix_applied: prefixed.report_prefix_applied === true, outgoing_hash: outgoingHash });

  // Reference parity: delivery is worker-owned and single-flight. The command caller only receives
  // acceptance metadata; it never starts a competing content-side delivery path.
  void attemptAutoDelivery(key, runId);

  return {
    ...result,
    ...prefixed,
    accepted: true,
    run_id: runId,
    delivery_id: deliveryId,
    outgoing_hash: outgoingHash,
    sequence: Number(run?.sequence || 0)
  };
}

function attemptAutoDelivery(conversationKey, runId) {
  const key = normalizeConversationKey(conversationKey);
  return singleFlight(deliveryAttemptRequests, String(runId || ""), async () => {
    const run = await getAutoRun(key);
    if (!run || WordstatAutorunModel.isTerminalStatus(run.status)) return { ok: false, code: "AUTO_RUN_NOT_ACTIVE" };
    if (run.status !== WordstatAutorunModel.RUN_STATUSES.DELIVERING || !run.delivery) return { ok: false, code: "AUTO_RUN_NOT_DELIVERING" };
    const phase = run.delivery.phase;
    if (![WordstatAutorunModel.DELIVERY_PHASES.CLAIMED, WordstatAutorunModel.DELIVERY_PHASES.COMMITTED].includes(phase)) {
      return { ok: false, code: "AUTO_DELIVERY_NOT_ACTIONABLE" };
    }
    const recovery = deliveryRecoveryPayload(run, phase === WordstatAutorunModel.DELIVERY_PHASES.COMMITTED ? "reconcile_delivery" : "deliver_claimed");
    const push = await tabMessage(Number(run.tab_id), { type: "WS_AUTO_DELIVERY_AVAILABLE", recovery });
    await diagnostic("DELIVERY_PUSH_RESPONSE", {
      run_id: run.run_id,
      delivery_id: run.delivery.delivery_id,
      phase,
      ok: push?.ok === true,
      code: push?.code || null
    }, { level: push?.ok === true ? "info" : "warning" });
    return push;
  });
}

async function commitAutoDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  const actorId = String(message.actor_id || "");
  const senderTabId = Number(sender?.tab?.id || 0);
  let run = await getAutoRun(key);
  if (!run || run.run_id !== runId || run.status !== WordstatAutorunModel.RUN_STATUSES.DELIVERING) {
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
  if (run.delivery?.phase === WordstatAutorunModel.DELIVERY_PHASES.CONFIRMED) {
    return { ok: true, committed: true, click_allowed: false, already_confirmed: true };
  }
  if (run.delivery?.phase === WordstatAutorunModel.DELIVERY_PHASES.COMMITTED) {
    // Commit is the irreversible boundary. Never grant a second browser click after it, even to the same runtime.
    return { ok: true, committed: true, click_allowed: false, already_committed: true, recovery: deliveryRecoveryPayload(run, "reconcile_delivery") };
  }
  if (run.delivery?.phase !== WordstatAutorunModel.DELIVERY_PHASES.CLAIMED) {
    return { ok: false, committed: false, click_allowed: false, code: "AUTO_DELIVERY_NOT_CLAIMED", error: "Delivery ещё не claimable." };
  }
  let clickAllowed = false;
  run = await mutateAutoRun(key, (current) => {
    if (!current || current.run_id !== runId || current.delivery?.delivery_id !== deliveryId) return current;
    if (current.delivery?.phase !== WordstatAutorunModel.DELIVERY_PHASES.CLAIMED) return current;
    clickAllowed = true;
    return WordstatAutorunModel.commitDelivery(current, {
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

async function completeAutoDelivery(message, sender) {
  const key = normalizeConversationKey(message.conversation_key);
  const runId = String(message.run_id || "");
  const deliveryId = String(message.delivery_id || "");
  let currentRun = await getAutoRun(key);
  if (!currentRun || currentRun.run_id !== runId) {
    throw Object.assign(new Error("Delivery confirmation не соответствует активному autorun."), { code: "AUTO_DELIVERY_STATE_MISMATCH" });
  }
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
  if (currentRun.status !== WordstatAutorunModel.RUN_STATUSES.DELIVERING) {
    throw Object.assign(new Error("Run больше не находится в delivery state."), { code: "AUTO_DELIVERY_STATE_MISMATCH" });
  }
  if (!deliveryId || currentRun.delivery?.delivery_id !== deliveryId) {
    throw Object.assign(new Error("Delivery confirmation ID не совпадает с активной доставкой."), { code: "AUTO_DELIVERY_ID_MISMATCH" });
  }
  if (currentRun.delivery?.phase !== WordstatAutorunModel.DELIVERY_PHASES.COMMITTED) {
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
    if (current.status !== WordstatAutorunModel.RUN_STATUSES.DELIVERING || current.delivery?.delivery_id !== deliveryId || current.delivery?.phase !== WordstatAutorunModel.DELIVERY_PHASES.COMMITTED) return current;
    didConfirm = true;
    const confirmedCurrent = {
      ...current,
      delivery: {
        ...current.delivery,
        phase: WordstatAutorunModel.DELIVERY_PHASES.CONFIRMED,
        confirmed_at: new Date().toISOString(),
        confirmed_user_turn_id: message.confirmed_user_turn_id || null
      }
    };
    const next = WordstatAutorunModel.afterConfirmedDelivery(confirmedCurrent);
    next.last_confirmed_delivery_id = deliveryId;
    next.last_confirmed_report_prefix_applied = prefixApplied;
    next.last_confirmed_user_turn_id = message.confirmed_user_turn_id || null;
    next.delivery = null;
    if (next.status === WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND) {
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
    if (run.status === WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
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
  if (run.status === WordstatAutorunModel.RUN_STATUSES.DELIVERING && run.delivery) {
    const preserved = await mutateAutoRun(key, (current) => {
      if (!current || current.run_id !== run.run_id) return current;
      return {
        ...current,
        last_error: {
          code: String(message.code || "DELIVERY_FAILED"),
          message: String(message.error || "Не удалось доставить Wordstat result в ChatGPT."),
          at: new Date().toISOString(),
          recoverable: true
        }
      };
    });
    await diagnostic("DELIVERY_FAILED_BUT_PRESERVED", { run_id: run.run_id, delivery_id: run.delivery?.delivery_id || null, phase: run.delivery?.phase || null, code: message.code || "DELIVERY_FAILED" }, { level: "warning" });
    return publicRun(preserved);
  }
  const failed = await markRunError(key, message.code || "DELIVERY_FAILED", message.error || "Не удалось доставить Wordstat result в ChatGPT.");
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
    const decision = WordstatAutorunModel.pauseDecision(current.status);
    if (decision === "immediate") {
      shouldStopWatch = true;
      return { ...current, status: WordstatAutorunModel.RUN_STATUSES.PAUSED, pause_requested: false };
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
  if (await getManualMode(key)) throw Object.assign(new Error("Перед продолжением autorun выключите ручной режим Wordstat."), { code: "MANUAL_MODE_ACTIVE" });
  const manualOperation = await getManualOperation(key);
  if (manualOperationActive(manualOperation)) throw Object.assign(new Error("Дождитесь завершения уже принятого ручного Wordstat request/delivery."), { code: "MANUAL_OPERATION_ACTIVE" });
  const settings = await getSettings();
  if (!settings.apiKey) throw Object.assign(new Error("API key не сохранён."), { code: "API_KEY_MISSING" });
  const current = await getAutoRun(key);
  if (!current || current.status !== WordstatAutorunModel.RUN_STATUSES.PAUSED) throw Object.assign(new Error("Run не находится на паузе."), { code: "AUTO_RUN_NOT_PAUSED" });
  await assertRunBinding(current);

  const owner = await ownerDecision(current, tab, { allowRebind: true });
  if (!owner.owner) {
    throw Object.assign(new Error(`Этот autorun принадлежит другой вкладке ChatGPT (tab ${owner.owner_tab_id || current.tab_id}).`), { code: "AUTO_NON_OWNER_TAB" });
  }
  const ownedRun = owner.run || current;
  const baseline = await tabMessage(tab, {
    type: "WS_AUTO_GET_BASELINE",
    run_id: ownedRun.run_id,
    conversation_key: key,
    conversation_id: ownedRun.conversation_id
  });
  if (!baseline.ok) throw Object.assign(new Error(baseline.error || "Не удалось получить baseline ChatGPT."), { code: baseline.code || "BASELINE_FAILED" });
  const run = await mutateAutoRun(key, (runNow) => {
    if (!runNow || runNow.run_id !== ownedRun.run_id || runNow.status !== WordstatAutorunModel.RUN_STATUSES.PAUSED) return runNow;
    return {
      ...runNow,
      tab_id: tab,
      status: WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND,
      pause_requested: false,
      assistant_baseline_ids: Array.isArray(baseline.assistant_baseline_ids) ? baseline.assistant_baseline_ids : [],
      watch_id: `watch-${crypto.randomUUID()}`
    };
  });
  if (run?.status === WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND) await beginWatch(run);
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
    if (current.status === WordstatAutorunModel.RUN_STATUSES.REQUESTING || current.status === WordstatAutorunModel.RUN_STATUSES.DELIVERING || current.status === WordstatAutorunModel.RUN_STATUSES.STARTING) {
      return { ...current, finish_requested: true };
    }
    stopNow = true;
    return { ...current, status: WordstatAutorunModel.RUN_STATUSES.STOPPED, finish_requested: false, pause_requested: false };
  });
  if (!run) throw Object.assign(new Error("Autorun не найден."), { code: "AUTO_RUN_NOT_FOUND" });
  if (stopNow) await stopWatch(run, "operator_finish");
  return publicRun(run);
}

async function testConnection() {
  const settings = await getSettings();
  const apiKey = normalizeApiKey(settings.apiKey, { required: true });
  if (!settings.folderId) throw Object.assign(new Error("Сначала сохраните Folder ID."), { code: "FOLDER_ID_MISSING" });
  const request = WordstatProtocol.buildRequest({ method: "getRegionsTree" }, settings.folderId);
  const response = await yandexFetch({ ...request, apiKey });
  if (!response.ok) {
    const payload = WordstatProtocol.safeErrorPayload(response.status, response.rawText, response.parsed);
    await setStatus({ ok: false, ...payload });
    return { ok: false, ...payload };
  }
  const containsRussia = JSON.stringify(response.parsed || {}).includes('"225"');
  const status = await setStatus({ ok: true, code: "CONNECTED", message: containsRussia ? "API доступен; дерево регионов получено." : "API доступен; ответ GetRegionsTree получен.", http_status: response.status });
  return { ok: true, ...status, elapsed_ms: response.elapsedMs };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message?.type) {
      case "WS_RESOLVE_POPUP_CONTEXT": {
        const context = await resolvePopupContext(message.tab_id, message.identity || null);
        return { ok: true, context };
      }
      case "WS_BIND_CONVERSATION": {
        const binding = await bindConversation(message.context || {});
        return { ok: true, binding, state: await publicSettingsState(binding.conversation_key) };
      }
      case "WS_GET_SETTINGS_STATE":
        return { ok: true, state: await publicSettingsState(message.conversation_key) };
      case "WS_GET_GLOBAL_SETTINGS_STATE":
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      case "WS_SAVE_GLOBAL_SETTINGS": {
        const current = await getSettings();
        const folderId = String(message.folder_id || current.folderId || WordstatProtocol.DEFAULT_FOLDER_ID).trim();
        if (!folderId || folderId.length > 50) return { ok: false, code: "INVALID_FOLDER_ID", error: "Folder ID пустой или слишком длинный." };
        const values = {
          [KEYS.FOLDER_ID]: folderId,
          [KEYS.AUTO_SEND]: message.auto_send !== false
        };
        if (typeof message.api_key === "string" && message.api_key.trim()) values[KEYS.API_KEY] = normalizeApiKey(message.api_key, { required: true });
        await storageSet(values);
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      }
      case "WS_SAVE_SETTINGS": {
        const key = normalizeConversationKey(message.conversation_key);
        const current = await getSettings();
        const folderId = String(message.folder_id || current.folderId || WordstatProtocol.DEFAULT_FOLDER_ID).trim();
        if (!folderId || folderId.length > 50) return { ok: false, code: "INVALID_FOLDER_ID", error: "Folder ID пустой или слишком длинный." };
        const values = {
          [KEYS.FOLDER_ID]: folderId,
          [KEYS.AUTO_SEND]: message.auto_send !== false
        };
        if (typeof message.api_key === "string" && message.api_key.trim()) values[KEYS.API_KEY] = normalizeApiKey(message.api_key, { required: true });
        await storageSet(values);
        await saveReportPrefix(key, message);
        if (typeof message.auto_start_prompt_text === "string") await saveAutoStartPrompt(key, message.auto_start_prompt_text);
        return { ok: true, state: await publicSettingsState(key) };
      }
      case "WS_RESET_AUTO_START_PROMPT": {
        const key = normalizeConversationKey(message.conversation_key);
        await resetAutoStartPrompt(key);
        return { ok: true, state: await publicSettingsState(key) };
      }
      case "WS_SET_MANUAL_MODE": {
        const key = normalizeConversationKey(message.conversation_key);
        if (message.enabled === true) {
          const tab = normalizeTabId(message.tab_id);
          const liveIdentity = await assertTabConversation(tab, key);
          await strictBindingForIdentity(liveIdentity);
        }
        const enabled = await setManualMode(key, message.enabled === true);
        return { ok: true, enabled, state: await publicSettingsState(key) };
      }
      case "WS_GET_MANUAL_STATE": {
        const key = normalizeConversationKey(message.conversation_key);
        const senderTabId = Number(sender?.tab?.id || 0);
        if (senderTabId <= 0) return { ok: true, enabled: false, bound: false };
        const liveIdentity = await assertTabConversation(senderTabId, key);
        try {
          await strictBindingForIdentity(liveIdentity);
        } catch (error) {
          if (error?.code === "CONVERSATION_NOT_BOUND") return { ok: true, enabled: false, bound: false };
          throw error;
        }
        return { ok: true, enabled: await getManualMode(key), bound: true };
      }
      case "WS_CONTENT_READY":
      case "WS_CONTENT_SYNC": {
        const senderTabId = Number(sender?.tab?.id || 0);
        if (!Number.isInteger(senderTabId) || senderTabId <= 0) return { ok: false, code: "CONTENT_TAB_MISSING", error: "Content sync пришёл без ChatGPT tab." };
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
        if (binding && run && !WordstatAutorunModel.isTerminalStatus(run.status)) {
          const decision = await ownerDecision(run, senderTabId, { allowRebind: true });
          owner = decision.owner === true;
          ownerTabId = decision.owner_tab_id || decision.run?.tab_id || run.tab_id;
          rebound = decision.rebound === true;
          run = decision.run || run;
          if (rebound) await diagnostic("RUN_TAB_REBOUND_AFTER_OLD_TAB_GONE", { run_id: run.run_id, tab_id: senderTabId, status: run.status });
        }
        let recovery = null;
        if (owner && run && !WordstatAutorunModel.isTerminalStatus(run.status)) {
          if (run.status === WordstatAutorunModel.RUN_STATUSES.DELIVERING && run.delivery) {
            // Same as the reference CONTENT_READY contour: the worker resumes its own cycle.
            // Do not hand a second claimed-delivery execution path back to content.
            setTimeout(() => { void attemptAutoDelivery(key, run.run_id); }, 0);
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
          manual_mode: binding ? await getManualMode(key) : false,
          manual_operation: binding ? publicManualOperation(manualOperation) : null,
          manual_operation_owner: manualOwner,
          manual_operation_rebound: manualRebound,
          manual_recovery: manualOwner ? manualRecovery : null,
          auto_run: publicRun(run),
          recovery,
          auto_watch: owner && run?.status === WordstatAutorunModel.RUN_STATUSES.WAITING_COMMAND ? {
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
      case "WS_CLEAR_KEY": {
        await storageRemove(KEYS.API_KEY);
        await setStatus({ ok: false, code: "API_KEY_CLEARED", message: "API key удалён из chrome.storage.local." });
        if (typeof message.conversation_key === "string" && message.conversation_key.trim()) {
          return { ok: true, state: await publicSettingsState(message.conversation_key) };
        }
        return { ok: true, state: await publicGlobalSettingsState(message.page_context_error || null) };
      }
      case "WS_TEST_CONNECTION":
        return await testConnection();
      case "WS_EXECUTE_COMMAND":
        return await executeManualCommand(String(message.command_text || ""), message.conversation_key, sender, message.manual_request_id);
      case "WS_MANUAL_DELIVERY_COMPLETE":
        return await completeManualOperation(message, sender, false);
      case "WS_MANUAL_DELIVERY_FAILED":
        return await completeManualOperation(message, sender, true);
      case "WS_REPORT_DELIVERY_CONFIRMED": {
        const key = normalizeConversationKey(message.conversation_key);
        const senderTabId = Number(sender?.tab?.id || 0);
        if (!Number.isInteger(senderTabId) || senderTabId <= 0) throw Object.assign(new Error("Delivery confirmation пришёл без ChatGPT tab."), { code: "DELIVERY_SENDER_TAB_MISSING" });
        const liveIdentity = await assertTabConversation(senderTabId, key);
        await strictBindingForIdentity(liveIdentity);
        await noteConfirmedPrefix(key, message.report_prefix_applied === true, String(message.delivery_id || ""));
        return { ok: true };
      }
      case "WS_GET_AUTO_RECOVERY": {
        const key = normalizeConversationKey(message.conversation_key);
        const senderTabId = Number(sender?.tab?.id || 0);
        const run = await getAutoRun(key);
        if (!run || run.run_id !== String(message.run_id || "")) return { ok: false, code: "AUTO_RUN_NOT_FOUND", error: "Autorun не найден." };
        const owner = await ownerDecision(run, senderTabId, { allowRebind: true });
        if (!owner.owner) return { ok: false, code: "AUTO_NON_OWNER_TAB", error: "Recovery запрошен не owner-вкладкой." };
        const recovery = await recoveryPayloadForRun(owner.run || run);
        return { ok: true, recovery };
      }
      case "WS_AUTO_START":
        return { ok: true, run: await startAutoRun(message.conversation_key, message.tab_id) };
      case "WS_AUTO_START_COMMIT_REQUEST":
        return await commitAutoStart(message, sender);
      case "WS_AUTO_START_COMPLETE":
        return await completeAutoStart(message, sender);
      case "WS_AUTO_PAUSE":
        return { ok: true, run: await pauseAutoRun(message.conversation_key) };
      case "WS_AUTO_RESUME":
        return { ok: true, run: await resumeAutoRun(message.conversation_key, message.tab_id) };
      case "WS_AUTO_STOP":
        return { ok: true, run: await stopAutoRun(message.conversation_key) };
      case "WS_AUTO_COMMAND_READY":
        return await handleAutoCommand(message, sender);
      case "WS_AUTO_DELIVERY_COMMIT_REQUEST":
        return await commitAutoDelivery(message, sender);
      case "WS_AUTO_DELIVERY_COMPLETE":
        return { ok: true, run: await completeAutoDelivery(message, sender) };
      case "WS_AUTO_DELIVERY_FAILED":
        return { ok: true, run: await failAutoDelivery(message, sender) };
      case "WS_GET_SEND_BUTTON_PROFILE": {
        const data = await storageGet(KEYS.SEND_BUTTON_PROFILE);
        return { ok: true, profile: data[KEYS.SEND_BUTTON_PROFILE] || null };
      }
      case "WS_SAVE_SEND_BUTTON_PROFILE": {
        const profile = message.profile || null;
        if (!profile || profile.kind !== "bb2_manual_send_button_v1") throw new Error("Invalid send button profile.");
        await storageSet({ [KEYS.SEND_BUTTON_PROFILE]: profile });
        const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*"] }).catch(() => []);
        await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "WS_SET_SEND_BUTTON_PROFILE", profile }).catch(() => null) : null));
        await diagnostic("SEND_BUTTON_PROFILE_SAVED", { kind: profile.kind, tag: profile.tag, testid: profile.testid, aria: profile.aria });
        return { ok: true };
      }
      case "WS_CLEAR_SEND_BUTTON_PROFILE": {
        await storageSet({ [KEYS.SEND_BUTTON_PROFILE]: null });
        const tabs = await chrome.tabs.query({ url: ["https://chatgpt.com/*", "https://chat.openai.com/*"] }).catch(() => []);
        await Promise.all(tabs.map((tab) => tab.id ? tabMessage(tab.id, { type: "WS_SET_SEND_BUTTON_PROFILE", profile: null }).catch(() => null) : null));
        await diagnostic("SEND_BUTTON_PROFILE_CLEARED", {});
        return { ok: true };
      }
      case "WS_GET_COPY_BUTTON_PROFILES": {
        const profiles = await getCopyButtonProfiles();
        return { ok: true, profiles, builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT };
      }
      case "WS_SAVE_COPY_BUTTON_PROFILE": {
        const normalized = BB2ManualControls.normalizeCopyButtonProfile(message.profile || null);
        if (!normalized) throw Object.assign(new Error("Invalid Copy button profile."), { code: "INVALID_COPY_BUTTON_PROFILE" });
        const profiles = await saveCopyButtonProfile(normalized);
        await diagnostic("COPY_BUTTON_PROFILE_ADDED", { adapter_id: normalized.adapter_id, testid: normalized.testid || null, aria: normalized.aria || null, custom_profile_count: profiles.profiles.length });
        return { ok: true, profiles, builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT };
      }
      case "WS_CLEAR_COPY_BUTTON_PROFILES": {
        const profiles = await clearCopyButtonProfiles();
        await diagnostic("COPY_BUTTON_PROFILES_CLEARED", { builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT });
        return { ok: true, profiles, builtin_adapter_count: BB2ManualControls.BUILTIN_MANUAL_COPY_ADAPTER_COUNT };
      }
      case "WS_GET_DIAGNOSTICS": {
        const data = await storageGet(KEYS.DIAGNOSTICS);
        return { ok: true, diagnostics: data[KEYS.DIAGNOSTICS] || [] };
      }
      case "WS_CLEAR_DIAGNOSTICS":
        await storageSet({ [KEYS.DIAGNOSTICS]: [] });
        return { ok: true };
      case "WS_RECORD_DIAGNOSTIC":
        await diagnostic(String(message.event || "CONTENT_DIAGNOSTIC"), { source: "content_script", tab_id: sender.tab?.id || null, ...(message.details || {}) });
        return { ok: true };
      default:
        return { ok: false, code: "UNKNOWN_MESSAGE", error: "Неизвестная команда расширения." };
    }
  })().then(sendResponse).catch(async (error) => {
    const code = String(error?.code || (error?.name === "AbortError" ? "REQUEST_TIMEOUT" : "EXTENSION_ERROR"));
    const text = String(error?.message || error || "Unknown error");
    await setStatus({ ok: false, code, message: text }).catch(() => null);
    sendResponse({ ok: false, code, error: text });
  });
  return true;
});
