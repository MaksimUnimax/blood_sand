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
    const error = "Не найдена активная вкладка ChatGPT.";
    if (required) throw new Error(error);
    popupContext = null;
    return { available: false, tab_id: null, error };
  }

  const page = await tabMessage(tab.id, { type: "WS_PAGE_CONTEXT" });
  if (!page.ok || !page.identity) {
    const error = page.error || "Content script текущей ChatGPT-вкладки недоступен. Глобальные настройки расширения всё равно доступны.";
    if (required) throw new Error(error);
    popupContext = null;
    return { available: false, tab_id: tab.id, error };
  }

  const resolved = await send("WS_RESOLVE_POPUP_CONTEXT", { tab_id: tab.id, identity: page.identity });
  if (!resolved.ok || !resolved.context?.conversation_key) {
    const error = resolved.error || "Нужен подтверждённый ChatGPT-диалог /c/<conversation-id>.";
    if (required) throw new Error(error);
    popupContext = null;
    return { available: false, tab_id: tab.id, error };
  }

  popupContext = {
    available: true,
    tab_id: resolved.context.tab_id,
    conversation_key: resolved.context.conversation_key,
    identity: resolved.context.identity
  };
  return popupContext;
}

function status(text, tone = "") {
  $("status").textContent = text;
  $("status").className = `status ${tone}`.trim();
}

function runLabel(run) {
  if (!run) return "Не запущен";
  const labels = {
    starting: "Запускается / reconciliation",
    waiting_command: "Ждёт WORDSTAT_API_V1",
    requesting: "Yandex API",
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
    "reportPrefixText", "reportPrefixInterval", "pickSend", "pickCopy"
  ]) {
    const element = $(id);
    if (element) element.disabled = !enabled;
  }
}

function renderState(state) {
  lastState = state;
  const pageAvailable = state.page_context_available !== false;
  const bound = pageAvailable && state.binding?.bound === true;
  $("versionBadge").textContent = `v${state.version || "1.1.5"}`;
  $("folderId").value = state.folder_id || "b1gqfm5c5vn6aingakbe";
  $("autoSend").checked = state.auto_send !== false;
  $("manualMode").checked = pageAvailable && state.manual_mode === true;
  $("keyState").textContent = state.has_api_key ? "Ключ сохранён локально. Для замены вставьте новый и нажмите «Сохранить»." : "Ключ ещё не сохранён.";

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
  $("lastCommand").textContent = run?.last_method ? `${run.last_method}${run.last_phrase ? `: ${run.last_phrase}` : ""}` : "—";
  const active = run && !["stopped", "error"].includes(run.status);
  const busy = run && ["starting", "waiting_command", "requesting", "delivering"].includes(run.status);
  const paused = run?.status === "paused";
  const manualOperationActive = state.manual_operation_active === true;

  setConversationControlsEnabled(pageAvailable);
  const banner = $("bindingBanner");
  banner.classList.toggle("bound", bound);
  banner.classList.toggle("unbound", !bound);
  $("bindingState").textContent = !pageAvailable ? "Контекст ChatGPT недоступен" : (bound ? "Диалог привязан" : "Диалог не привязан");
  $("bindingMeta").textContent = !pageAvailable
    ? (state.page_context_error || "Глобальные настройки доступны, но действия диалога отключены.")
    : (bound
      ? `ChatGPT: ${state.binding.conversation_id} · binding ${state.binding.binding_id} · rev ${state.binding.revision}`
      : "Нажмите «Привязать диалог». До этого Manual/Autorun не могут вызвать Yandex API или Send.");
  $("bindConversation").textContent = bound ? "Перепривязать диалог" : "Привязать диалог";
  $("bindConversation").disabled = !pageAvailable;

  $("startAuto").disabled = !pageAvailable || !bound || Boolean(active) || state.manual_mode === true || manualOperationActive || !state.has_api_key;
  $("pauseAuto").disabled = !pageAvailable || !bound || !busy;
  $("resumeAuto").disabled = !pageAvailable || !bound || !paused || state.manual_mode === true || manualOperationActive;
  $("finishAuto").disabled = !pageAvailable || !bound || !active;
  $("manualMode").disabled = !pageAvailable || !bound || Boolean(busy);
  $("autoSend").disabled = false;

  $("sendButtonState").textContent = state.send_button_profile ? "Выбрана" : "Не выбрана";
  const builtinCopy = Number(state.copy_button_builtin_adapter_count || 2);
  const customCopy = Number(state.copy_button_profile_count || state.copy_button_profiles?.profiles?.length || 0);
  $("copyButtonState").textContent = customCopy > 0 ? `${builtinCopy} встроенных + ${customCopy} выбранных` : `${builtinCopy} встроенных`;

  if (!pageAvailable) {
    $("manualModeMeta").textContent = "Контекст ChatGPT недоступен: глобальные API/кнопочные настройки доступны, действия текущего диалога отключены.";
  } else if (!bound) {
    $("manualModeMeta").textContent = "Недоступен: сначала явно привяжите этот ChatGPT-диалог к Wordstat Bridge.";
  } else if (manualOperationActive) {
    const op = state.manual_operation || {};
    $("manualModeMeta").textContent = `Ручная операция ещё выполняется/доставляется${op.phrase ? `: ${op.phrase}` : ""}. Autorun заблокирован до завершения этой операции.`;
  } else if (state.manual_mode) {
    $("manualModeMeta").textContent = "Включен: последние 5 существующих и все новые локальные Copy вооружены жёлтым Wordstat-действием.";
  } else if (paused) {
    $("manualModeMeta").textContent = "Autorun на паузе: ручной режим можно включить для точечных Copy-запросов.";
  } else if (active) {
    $("manualModeMeta").textContent = "Выключен: autorun управляет новыми WORDSTAT_API_V1 blocks.";
  } else {
    $("manualModeMeta").textContent = "Выключен: страница не наблюдается ручным режимом.";
  }
}

async function refresh() {
  const context = await resolvePopupContext({ required: false });
  const response = context.available
    ? await send("WS_GET_SETTINGS_STATE", { conversation_key: context.conversation_key })
    : await send("WS_GET_GLOBAL_SETTINGS_STATE", { page_context_error: context.error || "Контекст ChatGPT недоступен." });
  if (!response.ok) return status(response.error || "Не удалось прочитать настройки.", "error");
  renderState(response.state);

  if (!context.available) {
    const last = response.state.last_status;
    const suffix = last ? `\nПоследний API status: ${last.code || (last.ok ? "OK" : "ERROR")} · ${last.at || ""}` : "";
    status(`Контекст ChatGPT недоступен. Popup не падает: API key, Folder ID, Auto Send, сохранённые Send/Copy profiles и диагностика доступны.${suffix}`);
    return;
  }
  const last = response.state.last_status;
  if (last?.ok) status(`${last.message || "API доступен."}\n${last.at || ""}`, "ok");
  else if (last) status(`${last.code || "ERROR"}: ${last.message || ""}\n${last.at || ""}`, "error");
  else if (response.state.binding?.bound !== true) status("Диалог не привязан. Нажмите «Привязать диалог»; без binding Manual/Autorun заблокированы.");
  else status("Диалог привязан. Сохраните ключ и нажмите «Проверить API».");
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
    api_key: includeKey ? $("apiKey").value : "",
    folder_id: $("folderId").value,
    auto_send: $("autoSend").checked
  };
  const response = context.available
    ? await send("WS_SAVE_SETTINGS", {
      ...common,
      report_prefix_enabled: $("reportPrefixEnabled").checked,
      report_prefix_text: $("reportPrefixText").value,
      report_prefix_interval: Number($("reportPrefixInterval").value || 1),
      auto_start_prompt_text: $("autoStartPromptText").value,
      conversation_key: context.conversation_key
    })
    : await send("WS_SAVE_GLOBAL_SETTINGS", { ...common, page_context_error: context.error || null });
  if (includeKey) $("apiKey").value = "";
  if (!response.ok) throw Object.assign(new Error(response.error || "Ошибка сохранения."), { code: response.code });
  renderState(response.state);
  return { state: response.state, page_context_available: context.available };
}

$("bindConversation").addEventListener("click", () => busy($("bindConversation"), async () => {
  try {
    const context = await resolvePopupContext();
    const response = await send("WS_BIND_CONVERSATION", {
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
    status(`Диалог явно привязан к Wordstat Bridge. Binding: ${response.binding?.binding_id || "—"}, rev ${response.binding?.revision || "—"}.`, "ok");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("manualMode").addEventListener("change", async () => {
  const enabled = $("manualMode").checked;
  try {
    const context = await resolvePopupContext();
    const response = await send("WS_SET_MANUAL_MODE", { enabled, conversation_key: context.conversation_key, tab_id: context.tab_id });
    if (!response.ok) {
      $("manualMode").checked = !enabled;
      return status(response.error || "Не удалось изменить ручной режим.", "error");
    }
    await tabMessage(context.tab_id, { type: "WS_APPLY_MANUAL_MODE", enabled, conversation_key: context.conversation_key });
    renderState(response.state);
    status(enabled ? "Ручной режим включён для этого диалога." : "Ручной режим выключен; observer/listeners и жёлтая декорация сняты.", "ok");
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
    status(saved.page_context_available ? "Настройки текущего диалога сохранены локально." : "Глобальные настройки сохранены. Conversation-specific start prompt/prefix не изменялись, потому что контекст ChatGPT недоступен.", "ok");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("test").addEventListener("click", () => busy($("test"), async () => {
  $("test").textContent = "Проверяю…";
  try {
    await saveAll();
    const response = await send("WS_TEST_CONNECTION");
    if (!response.ok) {
      await refresh();
      return status(`${response.code || "ERROR"}: ${response.error || response.message || "Проверка не пройдена."}`, "error");
    }
    await refresh();
    status(`${response.message || "Wordstat API доступен."}${response.elapsed_ms ? `\n${response.elapsed_ms} ms` : ""}`, "ok");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("clearKey").addEventListener("click", () => busy($("clearKey"), async () => {
  if (!confirm("Удалить сохранённый Yandex API key из расширения?")) return;
  const response = await send("WS_CLEAR_KEY", {});
  if (!response.ok) return status(response.error || "Не удалось удалить ключ.", "error");
  await refresh();
  status("API key удалён.", "ok");
}));

$("startAuto").addEventListener("click", () => busy($("startAuto"), async () => {
  try {
    const saved = await saveAll();
    if (!saved.page_context_available) throw new Error("Autorun нельзя запустить без доступного контекста ChatGPT.");
    const approved = confirm("Запустить Wordstat Autorun?\n\nБудет отправлен сохранённый стартовый prompt БЕЗ report-prefix. Затем только новый валидный WORDSTAT_API_V1 block owner-вкладки этого диалога сможет запустить ровно один Yandex API request без отдельного Copy-click. Используйте «Пауза» или «Завершить» для остановки.");
    if (!approved) return status("Autorun не запущен.");
    const context = await resolvePopupContext();
    const response = await send("WS_AUTO_START", { conversation_key: context.conversation_key, tab_id: context.tab_id });
    if (!response.ok) {
      await refresh();
      return status(`${response.code || "ERROR"}: ${response.error || "Не удалось запустить autorun."}`, "error");
    }
    await refresh();
    status(response.run?.status === "waiting_command" ? "Autorun запущен. Start подтверждён; жду следующий WORDSTAT_API_V1." : "Start committed/отправлен, но run ещё ожидает подтверждение user-turn; автоматический повтор Send запрещён.", response.run?.status === "waiting_command" ? "ok" : "");
  } catch (error) {
    await refresh();
    status(error.message || String(error), "error");
  }
}));

$("pauseAuto").addEventListener("click", () => busy($("pauseAuto"), async () => {
  const context = await resolvePopupContext();
  const response = await send("WS_AUTO_PAUSE", { conversation_key: context.conversation_key });
  if (!response.ok) return status(`${response.code || "ERROR"}: ${response.error || "Не удалось поставить run на паузу."}`, "error");
  const deferred = response.run?.pause_requested === true;
  await refresh();
  status(deferred ? "Пауза запрошена. Уже начатый API/result будет доведён до безопасной delivery/reconciliation границы, затем run остановится." : "Autorun на паузе. Можно включить ручной режим.", "ok");
}));

$("resumeAuto").addEventListener("click", () => busy($("resumeAuto"), async () => {
  const context = await resolvePopupContext();
  const response = await send("WS_AUTO_RESUME", { conversation_key: context.conversation_key, tab_id: context.tab_id });
  if (!response.ok) return status(`${response.code || "ERROR"}: ${response.error || "Не удалось продолжить run."}`, "error");
  await refresh();
  status("Autorun продолжен; watcher ждёт следующий новый WORDSTAT_API_V1.", "ok");
}));

$("finishAuto").addEventListener("click", () => busy($("finishAuto"), async () => {
  if (!confirm("Завершить Wordstat autorun этого диалога?")) return;
  const context = await resolvePopupContext();
  const response = await send("WS_AUTO_STOP", { conversation_key: context.conversation_key });
  if (!response.ok) return status(`${response.code || "ERROR"}: ${response.error || "Не удалось завершить run."}`, "error");
  const deferred = response.run?.finish_requested === true;
  await refresh();
  status(deferred ? "Завершение запрошено. Уже начатый API/result не дублируется и будет доведён до безопасной delivery/reconciliation границы." : "Autorun завершён.", "ok");
}));

$("resetAutoStartPrompt").addEventListener("click", () => busy($("resetAutoStartPrompt"), async () => {
  try {
    const context = await resolvePopupContext();
    const response = await send("WS_RESET_AUTO_START_PROMPT", { conversation_key: context.conversation_key });
    if (!response.ok) return status(response.error || "Не удалось вернуть стартовый prompt по умолчанию.", "error");
    renderState(response.state);
    status("Стартовый prompt autorun возвращён к встроенному безопасному варианту.", "ok");
  } catch (error) {
    status(error.message || String(error), "error");
  }
}));

$("reportPrefixInterval").addEventListener("input", () => {
  const n = Math.max(1, Math.min(999, Number($("reportPrefixInterval").value || 1)));
  $("reportPrefixHint").textContent = n === 1 ? "N = 1 — перед каждым подтверждённо доставленным результатом. Чистый WORDSTAT_RESULT_V1 внутри не изменяется." : `Префикс будет применяться примерно раз в ${n} подтверждённых результатов. Счётчик увеличивается только после подтверждённой доставки.`;
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
  const response = await send("WS_GET_DIAGNOSTICS", {});
  if (!response.ok) {
    if (!silent) status(response.error || "Не удалось загрузить журнал.", "error");
    return;
  }
  lastDiagnostics = Array.isArray(response.diagnostics) ? response.diagnostics : [];
  renderDiagnostics();
}

function downloadDiagnostics() {
  const payload = {
    format: "wordstat-bridge-diagnostics",
    exported_at: new Date().toISOString(),
    extension_version: "1.1.5",
    current_run_id: lastState?.auto_run?.run_id || null,
    events: lastDiagnostics
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wordstat-bridge-diagnostics-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("pickSend").addEventListener("click", () => busy($("pickSend"), async () => {
  const context = await resolvePopupContext();
  const response = await tabMessage(context.tab_id, { type: "WS_START_SEND_BUTTON_PICKER" });
  if (!response.ok) throw new Error(response.error || "Не удалось запустить выбор Send-кнопки.");
  status("Выберите Send-кнопку прямо в ChatGPT. Тестовое сообщение не отправится.", "ok");
}));

$("clearSend").addEventListener("click", () => busy($("clearSend"), async () => {
  const response = await send("WS_CLEAR_SEND_BUTTON_PROFILE", {});
  if (!response.ok) throw new Error(response.error || "Не удалось сбросить Send-кнопку.");
  await refresh();
  status("Выбор Send-кнопки сброшен. Автоматическое распознавание остаётся активным.", "ok");
}));

$("pickCopy").addEventListener("click", () => busy($("pickCopy"), async () => {
  const context = await resolvePopupContext();
  const response = await tabMessage(context.tab_id, { type: "WS_START_COPY_BUTTON_PICKER" });
  if (!response.ok) throw new Error(response.error || "Не удалось запустить выбор Copy-кнопки.");
  status("Нажмите локальную Copy-кнопку внутри writing/code block. Выбор не скопирует блок и не запустит Wordstat API.", "ok");
}));

$("clearCopy").addEventListener("click", () => busy($("clearCopy"), async () => {
  const response = await send("WS_CLEAR_COPY_BUTTON_PROFILES", {});
  if (!response.ok) throw new Error(response.error || "Не удалось сбросить пользовательские Copy-профили.");
  await refresh();
  status("Пользовательские Copy-профили сброшены. Два встроенных адаптера продолжают работать.", "ok");
}));

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
  const response = await send("WS_CLEAR_DIAGNOSTICS", {});
  if (!response.ok) throw new Error(response.error || "Не удалось очистить журнал.");
  lastDiagnostics = [];
  renderDiagnostics();
  status("Журнал очищен.", "ok");
}));

refresh().then(() => loadDiagnostics(true)).catch((error) => status(error.message || String(error), "error"));
diagnosticsTimer = setInterval(() => loadDiagnostics(true).catch(() => null), 1500);
window.addEventListener("unload", () => { if (diagnosticsTimer) clearInterval(diagnosticsTimer); });
