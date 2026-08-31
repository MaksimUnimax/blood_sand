(() => {
  "use strict";
  const RUNTIME = Object.freeze({
    version: "0.1.19",
    commandPrefix: "OZON_API_V1",
    resultPrefix: "OZON_RESULT_V1",
    helpPrefix: "OZON_HELP_V1",
    helpPrefixV2: "OZON_HELP_V2",
    guidanceResultPrefix: "OZON_GUIDANCE_RESULT_V1",
    guidanceResultPrefixV2: "OZON_GUIDANCE_RESULT_V2",
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
    PERSONAL_DATA_ENABLED: "ozmb_personal_data_enabled_v1",
    SELLER_API_METADATA: "ozmb_seller_api_metadata_v1",
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
    "ЭТО НАЧАЛО РАБОТЫ С OZON BRIDGE.",
    "Этот AI-диалог используется как канал между владельцем магазина и Ozon Seller / Performance API.",
    "",
    "Bridge обрабатывает только специальные команды в ответах ассистента. Он не читает сообщения пользователя для определения нужной операции и не подменяет ошибочную команду автоматически.",
    "",
    "Для запроса данных напиши: OZON_API_V1 + один JSON-объект вида {\"operation\":\"разрешённый_alias\",\"params\":{}}.",
    "Если Bridge вернул OZON_GUIDANCE_RESULT_V1 и просит выбрать раздел, ответь ровно одним OZON_HELP_V1 JSON вида {\"cluster\":\"cluster_id\"}.",
    "",
    "Доступные смысловые разделы:",
    "- sales_analytics — продажи, выручка и аналитика;",
    "- stock_inventory — текущие остатки;",
    "- search_visibility — поисковые запросы и видимость товаров;",
    "- fulfillment_supply — отправления FBO/FBS и поставки;",
    "- advertising_performance — рекламные кампании и статистика;",
    "- account_access — роли и доступ API-ключа.",
    "",
    "Одна OZON_API_V1 команда создаёт не более одного business request к выбранному Ozon API. Никаких скрытых retry, pagination-loop или fan-out business operations.",
    "Если нужен следующий cursor/offset/last_id/page, сформируй отдельную следующую OZON_API_V1 команду только после обработки текущего результата.",
    "При HTTP 429/4xx/5xx или result.error не повторяй тот же business request автоматически.",
    "",
    "Не передавай url, host, HTTP method, headers, Client-Id, Api-Key, Client Secret, access token или Authorization. Выбирай только operation из разрешённого allowlist и params.",
    "READ-операции, способные вернуть персональные данные, разрешены только при отдельной включённой настройке расширения. Если такая политика не разрешает операцию, не пытайся обходить её.",
    "Mutation/write operations недоступны.",
    "",
    "После OZON_RESULT_V1 обработай evidence и продолжи следующий необходимый read-only шаг. Когда следующий Ozon API вызов больше не нужен, ответь только: сбор закончен."
  ].join("\n");
  globalThis.OzonRuntime = Object.freeze({ RUNTIME, STORAGE_KEYS, DEFAULT_AUTO_START_TEXT });
})();
