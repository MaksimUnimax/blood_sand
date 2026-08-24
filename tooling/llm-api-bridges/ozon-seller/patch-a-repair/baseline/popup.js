let lastDiagnostics = [];
let diagnosticsTimer = null;
const $ = (id) => document.getElementById(id);
let popupContext = null;
let lastState = null;

function send(type, payload = {}) {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type, ...payload }, (response) => {
    const err = chrome.runtime.lastError;
    if (err) return resolve({ ok: false, error: err.message, code: "RUNTIME_ERROR" });
    resolve(response || { ok: false, error: "Пустой ответ." });
  }));
}

function tabMessage(tabId, message) {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const err = chrome.runtime.lastError;
        if (err) return resolve({ ok: false, code: "TAB_MESSAGE_ERROR", error: err.message });
        resolve(response || { ok: false, code: "EMPTY_RESPONSE", error: "Пустой ответ вкладки." });
      });
    } catch (error) {
      resolve({ ok: false, code: "TAB_MESSAGE_ERROR", error: String(error?.message || error) });
    }
  });
}

async function resolvePopupContext({ required = true } = {}) {
  let tab = null;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = tabs[0] || null;
  } catch (error) {
    if (required) throw error;
    popupContext = null;
    return { available: false, tab_id: null, error: error.message || String(error) };
  }
  if (!tab?.id) {
    const error = "Не найдена активная вкладка поддерживаемого AI.";
    if (required) throw new Error(error);
    popupContext = null;
    return { available: false, tab_id: null, error };
  }

  const page = await tabMessage(tab.id, { type: "OZ_PAGE_CONTEXT" });
  if (!page.ok || !page.identity) {
    const error = page.error || "Content script текущей AI-вкладки недоступен. Глобальные Ozon credentials и диагностика всё равно доступны.";
    if (required) throw new Error(error);
    popupContext = { available: false, tab_id: tab.id, page: page || null, error };
    return popupContext;
  }

  const resolved = await send("OZ_RESOLVE_POPUP_CONTEXT", { tab_id: tab.id, identity: page.identity });
  if (!resolved.ok || !resolved.context?.conversation_key) {
    const aliceRootPending = page.identity?.ai_id === "alice" && !page.identity?.conversation_id && String(page.identity?.chat_path || "") === "/";
    const error = aliceRootPending
      ? 'Новый чат Alice ещё не имеет устойчивой conversation identity. Отправьте первое обычное сообщение; после появления /chat/<id>/ bridge сможет безопасно привязать этот диалог.'
      : (resolved.error || "Нужен подтверждённый поддерживаемый AI-диалог с conversation id.");
    if (required) throw new Error(error);
    popupContext = { available: false, tab_id: tab.id, page, error };
    return popupContext;
  }

  popupContext = {
    available: true,
    tab_id: resolved.context.tab_id,
    conversation_key: resolved.context.conversation_key,
    identity: resolved.context.identity,
    page
  };
  return popupContext;
}

function status(text, tone = "") {
  $("status").textContent = text;
  $("status").className = `status ${tone}`.trim();
}

function downloadJson(fileName, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function runLabel(run) {
  if (!run) return "Не запущен";
  const labels = {
    starting: "Запускается / reconciliation",
    waiting_command: "Ждёт OZON_API_V1",
    requesting: "Ozon API",
    collecting: "Собирает пакет последовательно",
    delivering: "Доставляет / reconciliation",
    paused: "Пауза",
    stopped: "Завершён",
    error: "Ошибка"
  };
  return labels[run.status] || run.status || "—";
}

function setConversationControlsEnabled(enabled) {
  for (const id of [
    "startAuto", "pauseAuto", "resumeAuto", "finishAuto", "manualMode",
    "autoStartPromptText", "resetAutoStartPrompt", "reportPrefixEnabled",
    "reportPrefixText", "reportPrefixInterval"
  ]) {
    const element = $(id);
    if (element) element.disabled = !enabled;
  }
}

function renderState(state) {
  if (state?.ai_mode_scope === "per_tab" && !state?.tab_id && lastState?.tab_id) {
    state = { ...state, ai_mode: lastState.ai_mode, detected_ai_id: lastState.detected_ai_id || null, tab_id: lastState.tab_id };
  }
  lastState = state;
  const pageAvailable = state.page_context_available !== false;
  const bound = pageAvailable && state.binding?.bound === true;
  $("versionBadge").textContent = `v${state.version || "0.1.19"}`;
  const selectedAIMode = ["auto", "chatgpt", "alice"].includes(String(state.ai_mode || "")) ? String(state.ai_mode) : "auto";
  $("aiMode").value = selectedAIMode;
  const detectedLabel = state.detected_ai_id === "chatgpt" ? "ChatGPT" : (state.detected_ai_id === "alice" ? "Алиса" : "не определён");
  $("aiModeMeta").textContent = selectedAIMode === "auto"
    ? `Только эта вкладка: Auto по hostname. Обнаружен: ${detectedLabel}. Другие вкладки не затрагиваются.`
    : `Override только этой вкладки: ${selectedAIMode === "chatgpt" ? "ChatGPT" : "Алиса"}. Другие вкладки работают независимо; несовпадение с hostname fail-closed.`;
  $("autoSend").checked = state.auto_send !== false;
  $("manualMode").checked = pageAvailable && state.manual_mode === true;
  $("credentialState").textContent = state.seller_credentials_present ? "Seller Client-Id и Api-Key сохранены локально. Для замены вставьте новые значения и нажмите «Сохранить всё»." : "Seller credentials ещё не сохранены полностью.";
  $("performanceCredentialState").textContent = state.performance_credentials_present ? "Performance Client ID и Client Secret сохранены локально. Bearer token будет получен только service worker и в чат не попадёт." : "Performance credentials ещё не сохранены полностью.";
  $("providerGate").textContent = state.provider_gate || "CLOSED";
  $("providerOperations").textContent = `${Number(state.provider_enabled_operation_count || 0)} / ${Number(state.provider_operation_count || 0)}`;
  const enabledOps = Array.isArray(state.provider_enabled_operations) ? state.provider_enabled_operations : [];
  $("providerGateMeta").textContent = state.provider_execution_ready
    ? `READ operations готовы: ${enabledOps.join(", ") || "—"}. posting_fbs_get остаётся заблокирован из-за customer PII.`
    : "Execution gate CLOSED: нет исполняемых READ operations.";

  const startPrompt = state.auto_start_prompt || {};
  $("autoStartPromptText").value = startPrompt.text || "";

  const prefix = state.report_prefix || {};
  $("reportPrefixEnabled").checked = prefix.enabled === true;
  $("reportPrefixText").value = prefix.text || "";
  $("reportPrefixInterval").value = String(prefix.interval || 1);
  $("prefixDelivered").textContent = String(prefix.delivered_count || 0);

  const run = pageAvailable ? state.auto_run : null;
  $("runState").textContent = runLabel(run);
  $("runSequence").textContent = String(run?.sequence || 0);
  $("lastCommand").textContent = run?.last_operation || run?.last_command_summary || "—";
  const active = run && !["stopped", "error"].includes(run.status);
  const busy = run && ["starting", "waiting_command", "requesting", "collecting", "delivering"].includes(run.status);
  const paused = run?.status === "paused";
  const manualOperationActive = state.manual_operation_active === true;

  setConversationControlsEnabled(pageAvailable);
  const banner = $("bindingBanner");
  banner.classList.toggle("bound", bound);
  banner.classList.toggle("unbound", !bound);
  $("bindingState").textContent = !pageAvailable ? "Контекст AI недоступен" : (bound ? "Диалог привязан" : "Диалог не привязан");
  $("bindingMeta").textContent = !pageAvailable
    ? (state.page_context_error || "Глобальные настройки доступны, но действия диалога отключены.")
    : (bound
      ? `${state.binding.ai_id || state.ai_mode || "AI"}: ${state.binding.conversation_id} · binding ${state.binding.binding_id} · rev ${state.binding.revision}`
      : "Нажмите «Привязать диалог». До этого Manual/Autorun не могут вызвать Ozon API или Send.");
  $("bindConversation").textContent = bound ? "Перепривязать диалог" : "Привязать диалог";
  $("bindConversation").disabled = !pageAvailable;

  $("startAuto").disabled = !pageAvailable || !bound || Boolean(active) || state.manual_mode === true || manualOperationActive || !state.seller_credentials_present || !state.provider_execution_ready;
  $("pauseAuto").disabled = !pageAvailable || !bound || !busy;
  $("resumeAuto").disabled = !pageAvailable || !bound || !paused || state.manual_mode === true || manualOperationActive || !state.provider_execution_ready;
  $("finishAuto").disabled = !pageAvailable || !bound || !active;
  $("manualMode").disabled = !pageAvailable || !bound || Boolean(busy) || !state.provider_execution_ready;
  $("autoSend").disabled = false;

  if (!pageAvailable) {
    $("manualModeMeta").textContent = "Контекст AI недоступен: глобальные API-настройки доступны, действия текущего диалога отключены.";
  } else if (!bound) {
    $("manualModeMeta").textContent = "Недоступен: сначала явно привяжите этот AI-диалог к Ozon Bridge.";
  } else if (manualOperationActive) {
    const op = state.manual_operation || {};
    $("manualModeMeta").textContent = `Ручная операция ещё выполняется/доставляется${(op.command_summary || op.operation) ? `: ${op.command_summary || op.operation}` : ""}. Autorun заблокирован до завершения этой операции.`;
  } else if (state.manual_mode) {
    $("manualModeMeta").textContent = "Включен: последние 5 существующих и все новые структурно найденные code blocks получают собственную кнопку Ozon.";
  } else if (paused) {
    $("manualModeMeta").textContent = "Autorun на паузе: ручной режим можно включить для точечных Copy-запросов.";
  } else if (active) {
    $("manualModeMeta").textContent = "Выключен: autorun сканирует полные assistant messages на OZON_API_V1 и выполняет найденные команды последовательно.";
  } else {
    $("manualModeMeta").textContent = "Выключен: страница не наблюдается ручным режимом.";
  }
}

async function refresh() {
  const context = await resolvePopupContext({ required: false });
  const [response, tabAI] = await Promise.all([
    context.available
      ? send("OZ_GET_SETTINGS_STATE", { conversation_key: context.conversation_key })
      : send("OZ_GET_GLOBAL_SETTINGS_STATE", { page_context_error: context.error || "Контекст AI недоступен." }),
    context.tab_id ? send("OZ_GET_TAB_AI_MODE", { tab_id: context.tab_id }) : Promise.resolve({ ok: false })
  ]);
  if (!response.ok) return status(response.error || "Не удалось прочитать настройки.", "error");
  const state = {
    ...response.state,
    ai_mode: tabAI?.ok ? tabAI.ai_mode : "auto",
    ai_mode_scope: "per_tab",
    detected_ai_id: tabAI?.ok ? tabAI.detected_ai_id : (context.page?.identity?.ai_id || null),
    tab_id: context.tab_id || null
  };
  renderState(state);

  if (!context.available) {
    const last = response.state.last_status;
    const suffix = last ? `\nПоследний API status: ${last.code || (last.ok ? "OK" : "ERROR")} · ${last.at || ""}` : "";
    status(`Контекст AI недоступен. Popup остаётся доступен: Seller + Performance credentials, AI selector и диагностика работают.${suffix}`);
    return;
  }
  const last = response.state.last_status;
  if (last?.ok) status(`${last.message || "API доступен."}\n${last.at || ""}`, "ok");
  else if (last) status(`${last.code || "ERROR"}: ${last.message || ""}\n${last.at || ""}`, "error");
  else if (response.state.binding?.bound !== true) status("Диалог не привязан. Нажмите «Привязать диалог»; без binding Manual/Autorun заблокированы.");
  else status("Диалог привязан. Сохраните Seller credentials; при необходимости добавьте Performance credentials рядом и нажмите «Проверить API». READ allowlist показан в Provider gate.");
}

async function busy(button, fn) {
  const old = button.textContent;
  button.disabled = true;
  try { return await fn(); }
  finally {
    button.textContent = old;
    button.disabled = false;
    if (lastState) renderState(lastState);
  }
}

async function saveAll({ includeKey = true } = {}) {
  const context = await resolvePopupContext({ required: false });
  const common = {
    seller_client_id: includeKey ? $("clientId").value : "",
    seller_api_key: includeKey ? $("apiKey").value : "",
    performance_client_id: includeKey ? $("performanceClientId").value : "",
    performance_client_secret: includeKey ? $("performanceClientSecret").value : "",
    auto_send: $("autoSend").checked
  };
  const response = context.available
    ? await send("OZ_SAVE_SETTINGS", {
      ...common,
      report_prefix_enabled: $("reportPrefixEnabled").checked,
      report_prefix_text: $("reportPrefixText").value,
      report_prefix_interval: Number($("reportPrefixInterval").value || 1),
      auto_start_prompt_text: $("autoStartPromptText").value,
      conversation_key: context.conversation_key
    })
    : await send("OZ_SAVE_GLOBAL_SETTINGS", { ...common, page_context_error: context.error || null });
  if (includeKey) {
    $("clientId").value = "";
    $("apiKey").value = "";
    $("performanceClientId").value = "";
    $("performanceClientSecret").value = "";
  }
  if (!response.ok) throw Object.assign(new Error(response.error || "Ошибка сохранения."), { code: response.code });
  renderState(response.state);
  return { state: response.state, page_context_available: context.available };
}

$("aiMode").addEventListener("change", async () => {
  const requested = $("aiMode").value;
  const context = await resolvePopupContext({ required: false });
  if (!context.tab_id) {
    status("Не удалось определить текущую вкладку для AI adapter override.", "error");
    return refresh();
  }
  const response = await send("OZ_SET_TAB_AI_MODE", { tab_id: context.tab_id, ai_mode: requested });
  if (!response.ok) {
    status(response.error || "Не удалось изменить AI adapter этой вкладки.", "error");
    return refresh();
  }
  popupContext = null;
  await refresh();
  status(requested === "auto"
    ? "Эта вкладка: Auto по hostname. Остальные вкладки не изменялись."
    : `Эта вкладка: adapter override ${requested === "chatgpt" ? "ChatGPT" : "Алиса"}. Остальные вкладки не изменялись.`, "ok");
});

$("bindConversation").addEventListener("click", () => busy($("bindConversation"), async () => {
  try {
    const context = await resolvePopupContext();
    const response = await send("OZ_BIND_CONVERSATION", {
      context: {
        tab_id: context.tab_id,
        origin: context.identity.origin,
        conversation_id: context.identity.conversation_id
      }
    });
    if (!response.ok) {
      await refresh();
      return status(`${response.code || "ERROR"}: ${response.error || "Не удалось привязать диалог."}`, "error");
    }
    await refresh();
    status(`Диалог явно привязан к Ozon Bridge. Binding: ${response.binding?.binding_id || "—"}, rev ${response.binding?.revision || "—"}.`, "ok");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("manualMode").addEventListener("change", async () => {
  const enabled = $("manualMode").checked;
  try {
    const context = await resolvePopupContext();
    const response = await send("OZ_SET_MANUAL_MODE", { enabled, conversation_key: context.conversation_key, tab_id: context.tab_id });
    if (!response.ok) {
      $("manualMode").checked = !enabled;
      return status(response.error || "Не удалось изменить ручной режим.", "error");
    }
    await tabMessage(context.tab_id, { type: "OZ_APPLY_MANUAL_MODE", enabled, conversation_key: context.conversation_key });
    renderState(response.state);
    status(enabled ? "Ручной режим включён для этого диалога." : "Ручной режим выключен; observer/listeners и extension-owned Ozon buttons сняты.", "ok");
  } catch (error) {
    $("manualMode").checked = !enabled;
    status(error.message || String(error), "error");
    await refresh();
  }
});

$("save").addEventListener("click", () => busy($("save"), async () => {
  $("save").textContent = "Сохраняю…";
  try {
    const saved = await saveAll();
    await refresh();
    status(saved.page_context_available ? "Настройки текущего диалога сохранены локально." : "Глобальные настройки сохранены. Conversation-specific start prompt/prefix не изменялись, потому что контекст AI недоступен.", "ok");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("test").addEventListener("click", () => busy($("test"), async () => {
  $("test").textContent = "Проверяю…";
  try {
    await saveAll();
    const response = await send("OZ_TEST_CONNECTION");
    if (!response.ok) {
      await refresh();
      return status(`${response.code || "ERROR"}: ${response.error || response.message || "Проверка не пройдена."}`, "error");
    }
    await refresh();
    const detail = [
      response.expires_at ? `Seller ключ действует до: ${response.expires_at}` : null,
      Number.isInteger(response.roles_count) ? `Seller ролей: ${response.roles_count}` : null,
      Number.isInteger(response.methods_count) ? `Seller методов: ${response.methods_count}` : null,
      response.performance?.ok ? "Performance token: OK" : null,
      response.performance && !response.performance.ok ? `Performance: ${response.performance.code || "ERROR"}` : null,
      response.elapsed_ms ? `${response.elapsed_ms} ms` : null
    ].filter(Boolean).join(" · ");
    status(`${response.message || "Ozon API доступен."}${detail ? `\n${detail}` : ""}`, "ok");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("exportCredentials").addEventListener("click", () => busy($("exportCredentials"), async () => {
  try {
    const response = await send("OZ_EXPORT_CREDENTIALS", {});
    if (!response.ok || !response.backup) throw new Error(response.error || "Не удалось экспортировать credentials.");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJson(`ozon-bridge-credentials-${stamp}.json`, response.backup);
    $("credentialBackupMeta").textContent = "Credentials экспортированы. Backup v2 содержит все сохранённые Seller + Performance credentials и является секретом.";
    status("Все Ozon credentials экспортированы в локальный JSON backup. Храните файл как секрет.", "ok");
  } catch (error) {
    status(`Экспорт не выполнен: ${error.message || String(error)}`, "error");
  }
}));

$("chooseCredentialImport").addEventListener("click", () => $("credentialImportFile").click());
$("credentialImportFile").addEventListener("change", async () => {
  const file = $("credentialImportFile").files?.[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    const context = await resolvePopupContext({ required: false });
    const response = await send("OZ_IMPORT_CREDENTIALS", {
      backup,
      conversation_key: context.available ? context.conversation_key : null,
      page_context_error: context.available ? null : (context.error || "Контекст AI недоступен.")
    });
    if (!response.ok) throw new Error(`${response.code || "IMPORT_ERROR"}: ${response.error || "Не удалось импортировать credentials."}`);
    $("clientId").value = "";
    $("apiKey").value = "";
    $("performanceClientId").value = "";
    $("performanceClientSecret").value = "";
    $("credentialBackupMeta").textContent = "Credentials импортированы после проверки формата, полноты пар и SHA-256 checksum. Legacy Seller-only backup v1 не стирает существующие Performance credentials.";
    await refresh();
    status("Ozon credentials импортированы локально. Для сетевой проверки нажмите «Проверить API».", "ok");
  } catch (error) {
    status(`Импорт не выполнен: ${error.message || String(error)}`, "error");
  } finally {
    $("credentialImportFile").value = "";
  }
});

$("clearCredentials").addEventListener("click", () => busy($("clearCredentials"), async () => {
  if (!confirm("Удалить все сохранённые Seller + Performance credentials из расширения?")) return;
  const response = await send("OZ_CLEAR_CREDENTIALS", {});
  if (!response.ok) return status(response.error || "Не удалось удалить ключ.", "error");
  await refresh();
  status("Все Ozon credentials удалены.", "ok");
}));

$("startAuto").addEventListener("click", () => busy($("startAuto"), async () => {
  try {
    const saved = await saveAll();
    if (!saved.page_context_available) throw new Error("Autorun нельзя запустить без доступного контекста поддерживаемого AI.");
    const approved = confirm("Запустить Ozon Autorun?\n\nБудет отправлен сохранённый стартовый prompt БЕЗ report-prefix. Затем только новый валидный OZON_API_V1 block owner-вкладки этого диалога сможет запустить ровно один allowlisted business request без отдельного Copy-click. Для Performance API перед ним может потребоваться отдельный auth token request. Используйте «Пауза» или «Завершить» для остановки.");
    if (!approved) return status("Autorun не запущен.");
    const context = await resolvePopupContext();
    const response = await send("OZ_AUTO_START", { conversation_key: context.conversation_key, tab_id: context.tab_id });
    if (!response.ok) {
      await refresh();
      return status(`${response.code || "ERROR"}: ${response.error || "Не удалось запустить autorun."}`, "error");
    }
    await refresh();
    status(response.run?.status === "waiting_command" ? "Autorun запущен. Start подтверждён; жду следующий OZON_API_V1." : "Start committed/отправлен, но run ещё ожидает подтверждение user-turn; автоматический повтор Send запрещён.", response.run?.status === "waiting_command" ? "ok" : "");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("pauseAuto").addEventListener("click", () => busy($("pauseAuto"), async () => {
  const context = await resolvePopupContext();
  const response = await send("OZ_AUTO_PAUSE", { conversation_key: context.conversation_key });
  if (!response.ok) return status(`${response.code || "ERROR"}: ${response.error || "Не удалось поставить run на паузу."}`, "error");
  const deferred = response.run?.pause_requested === true;
  await refresh();
  status(deferred ? "Пауза запрошена. Уже начатый API/result будет доведён до безопасной delivery/reconciliation границы, затем run остановится." : "Autorun на паузе. Можно включить ручной режим.", "ok");
}));

$("resumeAuto").addEventListener("click", () => busy($("resumeAuto"), async () => {
  const context = await resolvePopupContext();
  const response = await send("OZ_AUTO_RESUME", { conversation_key: context.conversation_key, tab_id: context.tab_id });
  if (!response.ok) return status(`${response.code || "ERROR"}: ${response.error || "Не удалось продолжить run."}`, "error");
  await refresh();
  status("Autorun продолжен; watcher ждёт следующий новый OZON_API_V1.", "ok");
}));

$("finishAuto").addEventListener("click", () => busy($("finishAuto"), async () => {
  if (!confirm("Завершить Ozon autorun этого диалога?")) return;
  const context = await resolvePopupContext();
  const response = await send("OZ_AUTO_STOP", { conversation_key: context.conversation_key });
  if (!response.ok) return status(`${response.code || "ERROR"}: ${response.error || "Не удалось завершить run."}`, "error");
  const deferred = response.run?.finish_requested === true;
  await refresh();
  status(deferred ? "Завершение запрошено. Уже начатый API/result не дублируется и будет доведён до безопасной delivery/reconciliation границы." : "Autorun завершён.", "ok");
}));

$("resetAutoStartPrompt").addEventListener("click", () => busy($("resetAutoStartPrompt"), async () => {
  try {
    const context = await resolvePopupContext();
    const response = await send("OZ_RESET_AUTO_START_PROMPT", { conversation_key: context.conversation_key });
    if (!response.ok) return status(response.error || "Не удалось вернуть стартовый prompt по умолчанию.", "error");
    renderState(response.state);
    status("Стартовый prompt autorun возвращён к встроенному безопасному варианту.", "ok");
  } catch (error) {
    status(error.message || String(error), "error");
  }
}));

$("reportPrefixInterval").addEventListener("input", () => {
  const n = Math.max(1, Math.min(999, Number($("reportPrefixInterval").value || 1)));
  $("reportPrefixHint").textContent = n === 1 ? "N = 1 — перед каждым подтверждённо доставленным результатом. Чистый OZON_RESULT_V1 внутри не изменяется." : `Префикс будет применяться примерно раз в ${n} подтверждённых результатов. Счётчик увеличивается только после подтверждённой доставки.`;
});

function diagnosticsForFilter() {
  const filter = $("diagnosticsFilter")?.value || "current";
  const currentRunId = lastState?.auto_run?.run_id || null;
  if (filter === "all") return lastDiagnostics;
  if (filter === "send") return lastDiagnostics.filter((item) => /(COMPOSER|SEND|DELIVERY|START_|PRE_SEND|RECOVER|RECONCIL)/.test(String(item.event || "").toUpperCase()));
  if (filter === "errors") return lastDiagnostics.filter((item) => {
    const level = String(item.level || "").toLowerCase();
    const event = String(item.event || "").toUpperCase();
    return ["error", "warning"].includes(level) || /(ERROR|FAILED|BLOCKED|TIMEOUT|CONFLICT|REJECTED|MISMATCH|UNKNOWN)/.test(event);
  });
  if (!currentRunId) return lastDiagnostics.filter((item) => !item.run_id).slice(-120);
  return lastDiagnostics.filter((item) => !item.run_id || item.run_id === currentRunId);
}

function renderDiagnostics() {
  const filtered = diagnosticsForFilter();
  $("diagnosticsCount").textContent = String(lastDiagnostics.length);
  $("diagnosticsMeta").textContent = `Показано ${Math.min(filtered.length, 250)} из ${lastDiagnostics.length}; последний sequence: ${lastDiagnostics.at(-1)?.sequence || 0}.`;
  $("diagnostics").textContent = JSON.stringify(filtered.slice(-250), null, 2);
}

async function loadDiagnostics(silent = false) {
  const response = await send("OZ_GET_DIAGNOSTICS", {});
  if (!response.ok) {
    if (!silent) status(response.error || "Не удалось загрузить журнал.", "error");
    return;
  }
  lastDiagnostics = Array.isArray(response.diagnostics) ? response.diagnostics : [];
  renderDiagnostics();
}

function downloadDiagnostics() {
  const payload = {
    format: "ozon-bridge-diagnostics",
    exported_at: new Date().toISOString(),
    extension_version: "0.1.19",
    current_run_id: lastState?.auto_run?.run_id || null,
    events: lastDiagnostics
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ozon-bridge-diagnostics-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


$("diagnosticsFilter").addEventListener("change", renderDiagnostics);
$("loadDiagnostics").addEventListener("click", () => busy($("loadDiagnostics"), async () => { await loadDiagnostics(false); }));
$("copyDiagnostics").addEventListener("click", () => busy($("copyDiagnostics"), async () => {
  await loadDiagnostics(true);
  await navigator.clipboard.writeText($("diagnostics").textContent || "[]");
  status("Показанный журнал скопирован.", "ok");
}));
$("downloadDiagnostics").addEventListener("click", () => busy($("downloadDiagnostics"), async () => {
  await loadDiagnostics(true);
  downloadDiagnostics();
  status("Полный журнал сохранён в JSON.", "ok");
}));
$("clearDiagnostics").addEventListener("click", () => busy($("clearDiagnostics"), async () => {
  const response = await send("OZ_CLEAR_DIAGNOSTICS", {});
  if (!response.ok) throw new Error(response.error || "Не удалось очистить журнал.");
  lastDiagnostics = [];
  renderDiagnostics();
  status("Журнал очищен.", "ok");
}));

refresh().then(() => loadDiagnostics(true)).catch((error) => status(error.message || String(error), "error"));
diagnosticsTimer = setInterval(() => loadDiagnostics(true).catch(() => null), 1500);
window.addEventListener("unload", () => { if (diagnosticsTimer) clearInterval(diagnosticsTimer); });
