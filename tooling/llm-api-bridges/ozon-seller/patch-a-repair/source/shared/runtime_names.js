(() => {
  "use strict";
  const RUNTIME = Object.freeze({
    version: "0.1.19",
    commandPrefix: "OZON_API_V1",
    resultPrefix: "OZON_RESULT_V1",
    helpPrefix: "OZON_HELP_V1",
    guidanceResultPrefix: "OZON_GUIDANCE_RESULT_V1",
    messagePrefix: "OZ_",
    runtimeKey: "__OZON_LLM_API_BRIDGE_RUNTIME__",
    stageAttr: "data-ozon-bridge-stage",
    stageDeliveryAttr: "data-ozon-bridge-delivery"
  });
  const STORAGE_KEYS = Object.freeze({
    AI_MODE: "ozmb_ai_mode", // deprecated global key; v0.1.19 execution routing ignores it
    AI_TAB_MODES: "ozmb_tab_ai_modes_v1",
    SELLER_CLIENT_ID: "ozmb_seller_client_id",
    SELLER_API_KEY: "ozmb_seller_api_key",
    PERFORMANCE_CLIENT_ID: "ozmb_performance_client_id",
    PERFORMANCE_CLIENT_SECRET: "ozmb_performance_client_secret",
    AUTO_SEND: "ozmb_auto_send",
    CONVERSATION_BINDINGS: "ozmb_conversation_bindings",
    MANUAL_MODES: "ozmb_manual_modes",
    MANUAL_OPERATIONS: "ozmb_manual_operations",
    AUTO_RUNS: "ozmb_auto_runs",
    WORK_SESSIONS: "ozmb_work_sessions_v1",
    PENDING_WORK_STARTS: "ozmb_pending_work_starts_v1",
    WORK_SESSION_RECOVERIES: "ozmb_work_session_recoveries_v1",
    REPORT_PREFIXES: "ozmb_report_prefix_configs",
    AUTO_START_PROMPTS: "ozmb_auto_start_prompts",
    SEND_BUTTON_PROFILE: "ozmb_send_button_profile",
    MICROPHONE_BUTTON_PROFILE: "ozmb_microphone_button_profile",
    COPY_BUTTON_PROFILES: "ozmb_copy_button_profiles",
    DIAGNOSTICS: "ozmb_diagnostics",
    DIAGNOSTIC_SEQ: "ozmb_diagnostic_sequence",
    PROVIDER_QUOTA_STATE: "ozmb_provider_quota_state_v1",
    PROVIDER_RESULT_CACHE: "ozmb_provider_result_cache_v1",
    LAST_STATUS: "ozmb_last_status"
  });
  const DEFAULT_AUTO_START_TEXT = [
    "ЭТО НАЧАЛО АВТОМАТИЧЕСКОЙ READ-ONLY РАБОТЫ OZON BRIDGE.",
    "Продолжай текущую Ozon-задачу по активному плану/roadmap этого диалога.",
    "",
    "В одном ответе можно разместить одну или несколько команд OZON_API_V1 в любом месте обычного текста; специальный writing/code block не требуется.",
    "Каждая команда должна иметь форму OZON_API_V1 + один JSON-объект. Bridge найдёт команды по всему assistant message и выполнит их строго по очереди.",
    "Bridge сначала собирает результаты всех найденных команд и только затем доставляет один объединённый OZON_RESULT_V1-отчёт в текущий выбранный AI.",
    "",
    "Один OZON_API_V1 = не более одного бизнес-запроса к выбранному Ozon API. Для Performance API bridge может отдельно получить/обновить короткоживущий Bearer token через официальный /api/client/token перед бизнес-запросом; бизнес-запрос не replay-ится автоматически.",
    "Никаких скрытых retry, pagination-loop или fan-out бизнес-операций.",
    "Если результат содержит cursor/offset/last_id/следующую страницу, сформируй отдельную следующую OZON_API_V1 команду только если она действительно нужна.",
    "При HTTP 429/4xx/5xx или result.error от bridge/provider не повторяй тот же запрос автоматически: сначала обработай OZON_RESULT_V1, причину ошибки и при необходимости измени следующий read-only запрос.",
    "Ошибки manual и autorun до внешнего Ozon API request (parse/validation/watcher) также приходят как OZON_RESULT_V1; request_meta.external_request_executed=false означает, что внешний Ozon API request не выполнялся.",
    "Если bridge вернул OZON_GUIDANCE_RESULT_V1 с выбором cluster, ответь ровно одним OZON_HELP_V1 JSON с cluster; это локальная помощь и не вызывает Ozon.",
    "Не передавай url, host, HTTP method, headers, Client-Id, Api-Key, Client Secret, access token или Authorization: выбирай только operation из allowlist и params.",
    "Seller READ aliases v0.1.12: roles, stocks_current, analytics_data, product_queries, product_queries_details, posting_fbo_list, supply_order_get, supply_order_details.",
    "Performance READ aliases v0.1.12: performance_campaigns, performance_expense, performance_daily, performance_campaign_product.",
    "posting_fbs_get намеренно заблокирован: endpoint может содержать customer PII.",
    "Все известные mutation endpoints Ozon Performance API (создание/активация/деактивация кампаний, изменение параметров, добавление/удаление товаров, изменение ставок, enable/disable продвижения) заблокированы кодом, включая mutation-методы с HTTP GET.",
    "Не запрашивай customer PII и не используй mutation/write operations.",
    "",
    "После OZON_RESULT_V1 обработай evidence и продолжи следующий необходимый read-only шаг.",
    "Когда задача завершена и следующий Ozon API вызов больше не нужен, ответь только: сбор закончен."
  ].join("\\n");
  globalThis.OzonRuntime = Object.freeze({ RUNTIME, STORAGE_KEYS, DEFAULT_AUTO_START_TEXT });
})();
