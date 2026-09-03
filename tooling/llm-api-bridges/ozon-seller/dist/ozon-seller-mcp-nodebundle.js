"use strict";

/* BEGIN shared/runtime_names.js */
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

/* END shared/runtime_names.js */

/* BEGIN shared/ozon_operation_registry.js */
(() => {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object") return value;
    const seen = new WeakSet();
    const stack = [value];
    while (stack.length) {
      const current = stack.pop();
      if (!current || typeof current !== "object" || seen.has(current)) continue;
      seen.add(current);
      Object.freeze(current);
      for (const child of Object.values(current)) if (child && typeof child === "object" && !seen.has(child)) stack.push(child);
    }
    return value;
  }

  const CLUSTER_ALIASES = deepFreeze({
    stock_inventory: "stocks_inventory",
    fulfillment_supply: "supplies_fbo"
  });

  const CLUSTERS = deepFreeze({
    account_access: {
      description: "Доступ API-ключа и безопасная информация о кабинете продавца.",
      sections: {
        roles_access: "Роли и методы API-ключа.",
        seller_capability: "Подписка и возможности кабинета.",
        seller_settings: "Безопасные настройки и подключения продавца."
      },
      clues: ["roles", "access", "permission", "seller", "роль", "прав", "доступ", "кабинет"]
    },
    catalog_products: {
      description: "Каталог товаров, карточки, характеристики и справочные данные.",
      sections: {
        product_list_info: "Списки и информация о товарах.",
        attributes_categories: "Категории и характеристики.",
        description_content: "Описание и rich content.",
        pictures: "Изображения товаров.",
        certification: "Сертификаты и справочники.",
        limits_diagnostics: "Лимиты и диагностика карточек."
      },
      clues: ["product", "sku", "offer", "attribute", "category", "catalog", "товар", "карточ", "характер", "категор"]
    },
    stocks_inventory: {
      description: "Остатки и наличие товаров, включая разрез по складам FBO/FBS.",
      sections: {
        current_aggregate: "Текущие агрегированные остатки.",
        warehouse_fbo: "Остатки по складам FBO.",
        warehouse_fbs: "Остатки по складам FBS/rFBS.",
        stock_analytics: "Аналитика остатков.",
        stock_movement_turnover: "Оборачиваемость и движение остатков."
      },
      clues: ["stock", "stocks", "inventory", "warehouse stock", "остат", "налич"]
    },
    sales_analytics: {
      description: "Продажи, выручка и бизнес-аналитика продавца.",
      sections: {
        sales_revenue_units: "Выручка и заказанные единицы.",
        delivery_returns_cancellations_metrics: "Метрики доставки, возвратов и отмен.",
        period_product_category: "Периодная аналитика по товарам и категориям.",
        turnover_delivery_time: "Оборачиваемость и скорость доставки."
      },
      clues: ["analytics", "sales", "revenue", "turnover", "ordered_units", "продаж", "выруч", "оборот", "аналит"]
    },
    search_visibility: {
      description: "Поисковые запросы покупателей и видимость товаров.",
      sections: {
        product_queries: "Запросы моих товаров.",
        query_details: "Детализация запросов по товару.",
        marketplace_search_queries: "Поисковые запросы маркетплейса."
      },
      clues: ["search", "query", "queries", "visibility", "поиск", "запрос", "видим"]
    },
    prices_promotions: {
      description: "Цены, ценовые стратегии, акции и скидки — только чтение.",
      sections: {
        prices: "Информация о ценах.",
        pricing_strategy: "Чтение ценовых стратегий.",
        actions_promotions: "Акции и доступные для них товары."
      },
      clues: ["price", "pricing", "action", "promo", "discount", "цен", "акци", "скид"]
    },
    orders_postings: {
      description: "Отправления FBO/FBS/FBP, сборка, перевозки и документы.",
      sections: {
        fbo_postings: "Отправления FBO.",
        fbs_postings: "Отправления FBS/rFBS.",
        fbp_postings: "Отправления FBP.",
        assembly_carriage: "Сборка и перевозки.",
        labels_documents: "Этикетки и документы."
      },
      clues: ["posting", "order", "fbo", "fbs", "fbp", "carriage", "shipment", "отправ", "заказ", "отгруз"]
    },
    supplies_fbo: {
      description: "Поставки FBO/FBP, заявки, грузоместа и таймслоты.",
      sections: {
        supply_orders: "Заявки на поставку.",
        supply_contents: "Состав поставок.",
        drafts: "Черновики поставок.",
        cargoes: "Грузоместа.",
        timeslots: "Интервалы поставки.",
        acts: "Акты поставки."
      },
      clues: ["supply", "supply-order", "draft", "cargo", "timeslot", "постав", "грузомест", "таймслот"]
    },
    warehouse_logistics: {
      description: "Склады, кластеры, методы доставки и логистические справочники.",
      sections: {
        clusters: "Кластеры Ozon.",
        ozon_warehouses: "Склады Ozon и партнёрские склады.",
        seller_warehouses: "Склады продавца и безопасные справочники их настройки.",
        delivery_methods: "Методы и полигоны доставки.",
        warehouse_diagnostics: "Безопасные статусы и диагностика складской логистики."
      },
      clues: ["warehouse", "cluster", "delivery-method", "logistics", "склад", "кластер", "логист"]
    },
    returns_cancellations: {
      description: "Возвраты, возвратные отгрузки и причины/заявки на отмену.",
      sections: {
        returns: "Возвраты товаров.",
        return_giveout: "Возвратные отгрузки.",
        cancellations: "Отмены и причины отмены."
      },
      clues: ["return", "returns", "cancel", "cancellation", "возврат", "отмен"]
    },
    finance: {
      description: "Финансовые операции чтения, начисления, транзакции и реализация.",
      sections: {
        accruals_balance: "Начисления и баланс.",
        realization: "Реализация товаров.",
        transactions: "Транзакции.",
        documents_reports: "Финансовые документы и отчёты чтения."
      },
      clues: ["finance", "realization", "transaction", "balance", "accrual", "финанс", "баланс", "начисл", "реализац"]
    },
    reviews_questions: {
      description: "Отзывы, вопросы и ответы; персональные тексты регулируются настройкой оператора.",
      sections: {
        reviews: "Отзывы.",
        review_comments: "Комментарии к отзывам.",
        questions: "Вопросы покупателей.",
        answers: "Ответы на вопросы.",
        chats: "Список чатов без чтения истории сообщений."
      },
      clues: ["review", "question", "answer", "chat", "отзыв", "вопрос", "ответ", "чат"]
    },
    advertising_performance: {
      provider: "performance_api",
      description: "Рекламные кампании и статистика Performance API.",
      sections: {
        campaigns: "Кампании.",
        statistics: "Статистика и расходы."
      },
      clues: ["campaign", "advert", "expense", "performance", "реклам", "кампан", "расход"]
    }
  });

  const OPERATIONS = deepFreeze({
    seller_product_list: {
      provider: "seller_api", method: "POST", path: "/v3/product/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v3/product/list", workflow_role: "single_read",
      purpose: "Получить список товаров Seller API без скрытой автопагинации.", template: { operation: "seller_product_list", params: { filter: {}, limit: 100 } }
    },
    seller_product_info_list: {
      provider: "seller_api", method: "POST", path: "/v3/product/info/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v3/product/info/list", workflow_role: "single_read",
      purpose: "Получить информацию о товарах по одной группе идентификаторов.", template: { operation: "seller_product_info_list", params: { product_id: ["1"] } }
    },
    seller_product_attributes: {
      provider: "seller_api", method: "POST", path: "/v4/product/info/attributes", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "attributes_categories", guidance_visibility: "user", entitlement_key: "POST /v4/product/info/attributes", workflow_role: "single_read",
      purpose: "Получить характеристики товаров по идентификаторам и видимости без скрытой автопагинации.", template: { operation: "seller_product_attributes", params: { filter: {}, limit: 100 } }
    },
    description_category_tree: {
      provider: "seller_api", method: "POST", path: "/v1/description-category/tree", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "attributes_categories", guidance_visibility: "user", entitlement_key: "POST /v1/description-category/tree", workflow_role: "single_read",
      purpose: "Получить актуальное дерево категорий и типов товаров.", template: { operation: "description_category_tree", params: {} }
    },
    description_category_attributes: {
      provider: "seller_api", method: "POST", path: "/v1/description-category/attribute", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "attributes_categories", guidance_visibility: "user", entitlement_key: "POST /v1/description-category/attribute", workflow_role: "single_read",
      purpose: "Получить характеристики выбранной категории и типа товара.", template: { operation: "description_category_attributes", params: { description_category_id: 1, type_id: 1 } }
    },
    description_category_attribute_values: {
      provider: "seller_api", method: "POST", path: "/v1/description-category/attribute/values", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "attributes_categories", guidance_visibility: "user", entitlement_key: "POST /v1/description-category/attribute/values", workflow_role: "single_read",
      purpose: "Получить справочные значения характеристики с явным limit/last_value_id без скрытой автопагинации.", template: { operation: "description_category_attribute_values", params: { attribute_id: 1, description_category_id: 1, limit: 100, type_id: 1 } }
    },
    description_category_attribute_values_search: {
      provider: "seller_api", method: "POST", path: "/v1/description-category/attribute/values/search", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "attributes_categories", guidance_visibility: "user", entitlement_key: "POST /v1/description-category/attribute/values/search", workflow_role: "single_read",
      purpose: "Найти справочные значения характеристики по тексту без скрытой автопагинации.", template: { operation: "description_category_attribute_values_search", params: { attribute_id: 1, description_category_id: 1, limit: 100, type_id: 1, value: "Name" } }
    },
    brand_company_certification_list: {
      provider: "seller_api", method: "POST", path: "/v1/brand/company-certification/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/brand/company-certification/list", workflow_role: "single_read",
      purpose: "Получить список брендов, для товаров которых требуется предоставить сертификаты, с явной страницей без скрытой автопагинации.", template: { operation: "brand_company_certification_list", params: { page: 1, page_size: 100 } }
    },
    product_certificate_product_status_list: {
      provider: "seller_api", method: "POST", path: "/v1/product/certificate/product_status/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/product/certificate/product_status/list", workflow_role: "single_read",
      purpose: "Получить справочник возможных статусов товаров при привязке к сертификату.", template: { operation: "product_certificate_product_status_list", params: {} }
    },
    product_certificate_rejection_reasons: {
      provider: "seller_api", method: "POST", path: "/v1/product/certificate/rejection_reasons/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/product/certificate/rejection_reasons/list", workflow_role: "single_read",
      purpose: "Получить справочник причин отклонения сертификатов.", template: { operation: "product_certificate_rejection_reasons", params: {} }
    },
    product_certificate_status_list: {
      provider: "seller_api", method: "POST", path: "/v1/product/certificate/status/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/product/certificate/status/list", workflow_role: "single_read",
      purpose: "Получить справочник возможных статусов сертификатов.", template: { operation: "product_certificate_status_list", params: {} }
    },
    product_certificate_types: {
      provider: "seller_api", method: "GET", path: "/v1/product/certificate/types", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "GET /v1/product/certificate/types", workflow_role: "single_read",
      purpose: "Получить справочник типов документов для сертификации товаров.", template: { operation: "product_certificate_types", params: {} }
    },
    product_certificate_accordance_types: {
      provider: "seller_api", method: "GET", path: "/v2/product/certificate/accordance-types/list", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "GET /v2/product/certificate/accordance-types/list", workflow_role: "single_read",
      purpose: "Получить актуальный справочник типов соответствия требованиям для сертификатов.", template: { operation: "product_certificate_accordance_types", params: {} }
    },
    product_certification_categories: {
      provider: "seller_api", method: "POST", path: "/v2/product/certification/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v2/product/certification/list", workflow_role: "single_read",
      purpose: "Получить список категорий товаров, для которых требуется сертификация, с явной страницей без скрытой автопагинации.", template: { operation: "product_certification_categories", params: { page: 1, page_size: 100 } }
    },
    product_certification_options: {
      provider: "seller_api", method: "POST", path: "/v2/product/certification/options", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v2/product/certification/options", workflow_role: "single_read",
      purpose: "Получить справочные параметры для создания сертификата качества.", template: { operation: "product_certification_options", params: {} }
    },
    product_certificate_info: {
      provider: "seller_api", method: "POST", path: "/v1/product/certificate/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/product/certificate/info", workflow_role: "single_read",
      purpose: "Получить информацию об одном сертификате по явно переданному номеру.", template: { operation: "product_certificate_info", params: { certificate_number: "CERTIFICATE_NUMBER" } }
    },
    product_certificate_list: {
      provider: "seller_api", method: "POST", path: "/v1/product/certificate/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/product/certificate/list", workflow_role: "single_read",
      purpose: "Получить список сертификатов продавца с явной страницей без скрытой автопагинации.", template: { operation: "product_certificate_list", params: { page: 1, page_size: 100 } }
    },
    product_certificate_products: {
      provider: "seller_api", method: "POST", path: "/v1/product/certificate/products/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "certification", guidance_visibility: "user", entitlement_key: "POST /v1/product/certificate/products/list", workflow_role: "single_read",
      purpose: "Получить товары, привязанные к сертификату, через актуальный limit/last_id режим без скрытой автопагинации.", template: { operation: "product_certificate_products", params: { certificate_id: 1, limit: 100 } }
    },
    product_content_rating: {
      provider: "seller_api", method: "POST", path: "/v1/product/rating-by-sku", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "limits_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/product/rating-by-sku", workflow_role: "single_read",
      purpose: "Получить контент-рейтинг товаров и рекомендации по его повышению по явно переданным SKU.", template: { operation: "product_content_rating", params: { skus: ["1"] } }
    },
    product_info_description: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/description", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "description_content", guidance_visibility: "user", entitlement_key: "POST /v1/product/info/description", workflow_role: "single_read",
      purpose: "Получить описание одного товара по offer_id или product_id.", template: { operation: "product_info_description", params: { offer_id: "OFFER_ID" } }
    },
    product_upload_quota: {
      provider: "seller_api", method: "POST", path: "/v4/product/info/limit", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "limits_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v4/product/info/limit", workflow_role: "single_read",
      purpose: "Получить текущие лимиты на ассортимент, создание, обновление и операции с товарами.", template: { operation: "product_upload_quota", params: {} }
    },
    product_subscription_count: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/subscription", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/info/subscription", workflow_role: "single_read",
      purpose: "Получить количество пользователей, подписавшихся на уведомление о поступлении выбранных товаров.", template: { operation: "product_subscription_count", params: { skus: ["1"] } }
    },
    product_related_sku: {
      provider: "seller_api", method: "POST", path: "/v1/product/related-sku/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/related-sku/get", workflow_role: "single_read",
      purpose: "Получить связанные единые SKU по явно переданным старым SKU FBS/FBO.", template: { operation: "product_related_sku", params: { sku: ["1"] } }
    },
    product_pictures_info: {
      provider: "seller_api", method: "POST", path: "/v2/product/pictures/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "pictures", guidance_visibility: "user", entitlement_key: "POST /v2/product/pictures/info", workflow_role: "single_read",
      purpose: "Получить ссылки на изображения выбранных товаров без автоматической загрузки этих файлов.", template: { operation: "product_pictures_info", params: { product_id: ["1"] } }
    },
    product_wrong_volume: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/wrong-volume", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "limits_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/product/info/wrong-volume", workflow_role: "single_read",
      purpose: "Получить товары с некорректными объёмно-весовыми характеристиками без скрытого продолжения cursor.", template: { operation: "product_wrong_volume", params: { limit: 100 } }
    },
    product_discounted_info: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/discounted", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/info/discounted", workflow_role: "single_read",
      purpose: "Получить состояние, дефекты и основной SKU для явно переданных уценённых FBO-товаров.", template: { operation: "product_discounted_info", params: { discounted_skus: ["1"] } }
    },
    product_prices_bulk: {
      provider: "seller_api", method: "POST", path: "/v5/product/info/prices", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "prices", guidance_visibility: "user", entitlement_key: "POST /v5/product/info/prices", workflow_role: "single_read",
      purpose: "Получить текущую информацию о ценах товаров без скрытой автопагинации.", template: { operation: "product_prices_bulk", params: { filter: {}, limit: 100 } }
    },
    product_price_details: {
      provider: "seller_api", method: "POST", path: "/v1/product/prices/details", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "prices", guidance_visibility: "user", entitlement_key: "POST /v1/product/prices/details", workflow_role: "single_read",
      purpose: "Получить подробную информацию о ценах товаров по SKU.", template: { operation: "product_price_details", params: { skus: ["1"] } }
    },
    pricing_strategy_list: {
      provider: "seller_api", method: "POST", path: "/v1/pricing-strategy/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "pricing_strategy", guidance_visibility: "user", entitlement_key: "POST /v1/pricing-strategy/list", workflow_role: "single_read",
      purpose: "Получить список ценовых стратегий с явной page/limit без скрытой автопагинации.", template: { operation: "pricing_strategy_list", params: { page: 1, limit: 20 } }
    },
    pricing_strategy_info: {
      provider: "seller_api", method: "POST", path: "/v1/pricing-strategy/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "pricing_strategy", guidance_visibility: "user", entitlement_key: "POST /v1/pricing-strategy/info", workflow_role: "single_read",
      purpose: "Получить параметры выбранной ценовой стратегии.", template: { operation: "pricing_strategy_info", params: { strategy_id: "00000000-0000-0000-0000-000000000000" } }
    },
    pricing_strategy_products: {
      provider: "seller_api", method: "POST", path: "/v1/pricing-strategy/products/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "pricing_strategy", guidance_visibility: "user", entitlement_key: "POST /v1/pricing-strategy/products/list", workflow_role: "single_read",
      purpose: "Получить товары выбранной ценовой стратегии одним запросом.", template: { operation: "pricing_strategy_products", params: { strategy_id: "00000000-0000-0000-0000-000000000000" } }
    },
    pricing_strategy_product_info: {
      provider: "seller_api", method: "POST", path: "/v1/pricing-strategy/product/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "pricing_strategy", guidance_visibility: "user", entitlement_key: "POST /v1/pricing-strategy/product/info", workflow_role: "single_read",
      purpose: "Получить цену и ссылку на товар конкурента для товара в стратегии; ссылка возвращается как данные и автоматически не открывается.", template: { operation: "pricing_strategy_product_info", params: { product_id: 1 } }
    },
    pricing_strategy_competitors: {
      provider: "seller_api", method: "POST", path: "/v1/pricing-strategy/competitors/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "pricing_strategy", guidance_visibility: "user", entitlement_key: "POST /v1/pricing-strategy/competitors/list", workflow_role: "single_read",
      purpose: "Получить список конкурентов для ценовых стратегий с явной page/limit без скрытой автопагинации.", template: { operation: "pricing_strategy_competitors", params: { page: 1, limit: 20 } }
    },
    pricing_strategy_ids_by_product_ids: {
      provider: "seller_api", method: "POST", path: "/v1/pricing-strategy/strategy-ids-by-product-ids", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "pricing_strategy", guidance_visibility: "user", entitlement_key: "POST /v1/pricing-strategy/strategy-ids-by-product-ids", workflow_role: "single_read",
      purpose: "Получить назначенные ценовые стратегии для явного списка product_id одним запросом без fanout.", template: { operation: "pricing_strategy_ids_by_product_ids", params: { product_id: ["1"] } }
    },
    seller_actions_list: {
      provider: "seller_api", method: "POST", path: "/v1/seller-actions/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/seller-actions/list", workflow_role: "single_read",
      purpose: "Получить список акций продавца с явной пагинацией offset/limit.", template: { operation: "seller_actions_list", params: { limit: 100, offset: 0 } }
    },
    seller_action_products: {
      provider: "seller_api", method: "POST", path: "/v1/seller-actions/products/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/seller-actions/products/list", workflow_role: "single_read",
      purpose: "Получить товары, участвующие в выбранной акции, без скрытого продолжения cursor.", template: { operation: "seller_action_products", params: { action_id: 1, limit: 100 } }
    },
    seller_action_candidates: {
      provider: "seller_api", method: "POST", path: "/v1/seller-actions/products/candidates", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/seller-actions/products/candidates", workflow_role: "single_read",
      purpose: "Получить товары, доступные для выбранной акции продавца, с только явным cursor без скрытой автопагинации.", template: { operation: "seller_action_candidates", params: { action_id: 1, limit: 100 } }
    },
    ozon_actions_list: {
      provider: "seller_api", method: "GET", path: "/v1/actions", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "GET /v1/actions", workflow_role: "single_read",
      purpose: "Получить список акций Ozon, доступных продавцу для участия.", template: { operation: "ozon_actions_list", params: {} }
    },
    ozon_action_candidates: {
      provider: "seller_api", method: "POST", path: "/v1/actions/candidates", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/actions/candidates", workflow_role: "single_read",
      purpose: "Получить товары, доступные для выбранной акции Ozon, без скрытого продолжения last_id.", template: { operation: "ozon_action_candidates", params: { action_id: 1, limit: 100 } }
    },
    ozon_action_products: {
      provider: "seller_api", method: "POST", path: "/v1/actions/products", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/actions/products", workflow_role: "single_read",
      purpose: "Получить товары, участвующие в выбранной акции Ozon, без скрытого продолжения last_id.", template: { operation: "ozon_action_products", params: { action_id: 1, limit: 100 } }
    },
    ozon_auto_add_products: {
      provider: "seller_api", method: "POST", path: "/v1/actions/auto-add/products/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "beta", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/actions/auto-add/products/list", workflow_role: "single_read",
      purpose: "Получить beta-список товаров с автодобавлением в акцию без скрытой offset-пагинации.", template: { operation: "ozon_auto_add_products", params: { action_id: 1, auto_add_date: "2035-08-28T14:00:00Z", limit: 100 } }
    },
    ozon_auto_add_candidates: {
      provider: "seller_api", method: "POST", path: "/v1/actions/auto-add/products/candidates", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "beta", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user", entitlement_key: "POST /v1/actions/auto-add/products/candidates", workflow_role: "single_read",
      purpose: "Получить beta-список кандидатов для автодобавления в акцию без скрытой offset-пагинации.", template: { operation: "ozon_auto_add_candidates", params: { action_id: 1, auto_add_date: "2035-08-28T14:00:00Z", limit: 100 } }
    },
    stock_on_warehouses_v2: {
      provider: "seller_api", method: "POST", path: "/v2/analytics/stock_on_warehouses", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "stock_analytics", guidance_visibility: "user", entitlement_key: "POST /v2/analytics/stock_on_warehouses", workflow_role: "single_read",
      purpose: "Получить отчёт по остаткам товаров на складах; offset продолжает выборку только отдельной явной командой.", template: { operation: "stock_on_warehouses_v2", params: { limit: 100, offset: 0, warehouse_type: "ALL" } }
    },
    roles: {
      provider: "seller_api", method: "POST", path: "/v1/roles", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "account_access", section: "roles_access", guidance_visibility: "user", entitlement_key: "POST /v1/roles", workflow_role: "single_read",
      purpose: "Получить роли и методы, разрешённые текущему Seller API-ключу.", template: { operation: "roles", params: {} }
    },
    seller_info: {
      provider: "seller_api", method: "POST", path: "/v1/seller/info", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "account_access", section: "seller_settings", guidance_visibility: "user", entitlement_key: "POST /v1/seller/info", workflow_role: "single_read",
      purpose: "Получить информацию о кабинете продавца, компании, рейтингах и подписке.", template: { operation: "seller_info", params: {} }
    },
    seller_ozon_logistics_info: {
      provider: "seller_api", method: "POST", path: "/v1/seller/ozon-logistics/info", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "account_access", section: "seller_settings", guidance_visibility: "user", entitlement_key: "POST /v1/seller/ozon-logistics/info", workflow_role: "single_read",
      purpose: "Получить статус подключения Ozon Доставки и доступные схемы FBO/FBS.", template: { operation: "seller_ozon_logistics_info", params: {} }
    },
    stocks_current: {
      provider: "seller_api", method: "POST", path: "/v4/product/info/stocks", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "current_aggregate", guidance_visibility: "user", entitlement_key: "POST /v4/product/info/stocks", workflow_role: "single_read",
      purpose: "Получить текущие остатки товаров.", template: { operation: "stocks_current", params: { filter: {}, limit: 100 } }
    },
    warehouse_fbs_create_dropoff_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/create/drop-off/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/create/drop-off/list", workflow_role: "single_read",
      purpose: "Получить доступные drop-off пункты для настройки FBS-склада; адреса относятся только к логистическим пунктам.", template: { operation: "warehouse_fbs_create_dropoff_list", params: { country_code: "RU", is_kgt: false } }
    },
    warehouse_fbs_update_dropoff_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/update/drop-off/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/update/drop-off/list", workflow_role: "single_read",
      purpose: "Получить доступные drop-off пункты для изменения настроек явно выбранного FBS-склада.", template: { operation: "warehouse_fbs_update_dropoff_list", params: { warehouse_id: 1 } }
    },
    warehouse_fbs_create_dropoff_timeslot_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/create/drop-off/timeslot/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/create/drop-off/timeslot/list", workflow_role: "single_read",
      purpose: "Получить таймслоты drop-off для создания FBS-склада по явно выбранному логистическому пункту.", template: { operation: "warehouse_fbs_create_dropoff_timeslot_list", params: { drop_off_point_id: 1 } }
    },
    warehouse_fbs_update_dropoff_timeslot_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/update/drop-off/timeslot/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/update/drop-off/timeslot/list", workflow_role: "single_read",
      purpose: "Получить таймслоты drop-off для изменения настроек явно выбранного FBS-склада.", template: { operation: "warehouse_fbs_update_dropoff_timeslot_list", params: { drop_off_point_id: 1, warehouse_id: 1 } }
    },
    warehouse_fbs_create_pickup_timeslot_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/create/pick-up/timeslot/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/create/pick-up/timeslot/list", workflow_role: "single_read",
      purpose: "Получить таймслоты pick-up для создания FBS-склада по явно заданным координатам склада.", template: { operation: "warehouse_fbs_create_pickup_timeslot_list", params: { is_kgt: false, address_coordinates: { latitude: 55.75, longitude: 37.62 } } }
    },
    warehouse_fbs_update_pickup_timeslot_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/update/pick-up/timeslot/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/update/pick-up/timeslot/list", workflow_role: "single_read",
      purpose: "Получить таймслоты pick-up для изменения настроек явно выбранного FBS-склада.", template: { operation: "warehouse_fbs_update_pickup_timeslot_list", params: { warehouse_id: 1 } }
    },
    warehouse_fbs_create_return_point_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/create/return-point/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/create/return-point/list", workflow_role: "single_read",
      purpose: "Получить логистические пункты возврата для создания FBS-склада; last_id продолжает выборку только отдельной явной командой.", template: { operation: "warehouse_fbs_create_return_point_list", params: { country_code: "RU", coordinates: { latitude: 55.75, longitude: 37.62 }, limit: 100 } }
    },
    warehouse_fbs_update_return_point_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/update/return-point/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/update/return-point/list", workflow_role: "single_read",
      purpose: "Получить логистические пункты возврата для изменения FBS-склада; last_id продолжает выборку только отдельной явной командой.", template: { operation: "warehouse_fbs_update_return_point_list", params: { warehouse_id: 1, limit: 100 } }
    },
    warehouse_fbs_pickup_history_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/pickup/history/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/pickup/history/list", workflow_role: "single_read",
      purpose: "Получить историю FBS-отгрузок курьеру; cursor продолжает выборку только отдельной явной командой.", template: { operation: "warehouse_fbs_pickup_history_list", params: { limit: 100 } }
    },
    delivery_polygon_list: {
      provider: "seller_api", method: "POST", path: "/v1/polygon/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "user", entitlement_key: "POST /v1/polygon/list", workflow_role: "single_read",
      purpose: "Получить геометрию и время доставки полигонов для явно выбранных склада и метода доставки.", template: { operation: "delivery_polygon_list", params: { delivery_method_id: 1, warehouse_id: 1 } }
    },
    warehouse_fbs_pickup_planning_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/pickup/planning/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/pickup/planning/list", workflow_role: "single_read",
      purpose: "Получить список складов, доступных для планирования FBS-отгрузок курьеру.", template: { operation: "warehouse_fbs_pickup_planning_list", params: {} }
    },
    fbp_warehouse_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/warehouse/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "ozon_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/warehouse/list", workflow_role: "single_read",
      purpose: "Получить список партнёрских складов FBP.", template: { operation: "fbp_warehouse_list", params: {} }
    },
    seller_warehouse_list: {
      provider: "seller_api", method: "POST", path: "/v2/warehouse/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v2/warehouse/list", workflow_role: "single_read",
      purpose: "Получить список складов FBS/rFBS с явным cursor/limit без скрытой автопагинации.", template: { operation: "seller_warehouse_list", params: { limit: 100 } }
    },
    seller_delivery_method_list: {
      provider: "seller_api", method: "POST", path: "/v2/delivery-method/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "user", entitlement_key: "POST /v2/delivery-method/list", workflow_role: "single_read",
      purpose: "Получить методы доставки realFBS-складов с явным cursor/limit без скрытой автопагинации.", template: { operation: "seller_delivery_method_list", params: { limit: 100 } }
    },
    delivery_method_return_settings: {
      provider: "seller_api", method: "POST", path: "/v1/delivery-method/return/settings/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "user", entitlement_key: "POST /v1/delivery-method/return/settings/get", workflow_role: "single_read",
      purpose: "Получить возвратные настройки выбранного rFBS-метода доставки.", template: { operation: "delivery_method_return_settings", params: { delivery_method_id: 1 } }
    },
    warehouse_invalid_products: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/invalid-products/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "warehouse_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/invalid-products/get", workflow_role: "single_read",
      purpose: "Получить товары с ограничениями доставки на выбранном складе без скрытого продолжения last_id.", template: { operation: "warehouse_invalid_products", params: { warehouse_id: 1 } }
    },
    warehouses_with_invalid_products: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/warehouses-with-invalid-products", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "warehouse_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/warehouses-with-invalid-products", workflow_role: "single_read",
      purpose: "Получить склады, на которых есть товары с ограничениями доставки.", template: { operation: "warehouses_with_invalid_products", params: {} }
    },
    ozon_warehouse_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/ozon/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "ozon_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/ozon/list", workflow_role: "single_read",
      purpose: "Получить список складов Ozon и их географические/типовые данные.", template: { operation: "ozon_warehouse_list", params: {} }
    },
    fbo_seller_warehouse_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbo/seller/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "seller_warehouses", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbo/seller/list", workflow_role: "single_read",
      purpose: "Получить список FBO-складов продавца без request body.", template: { operation: "fbo_seller_warehouse_list", params: {} }
    },
    cluster_list: {
      provider: "seller_api", method: "POST", path: "/v2/cluster/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "clusters", guidance_visibility: "user", entitlement_key: "POST /v2/cluster/list", workflow_role: "single_read",
      purpose: "Получить макролокальные кластеры Ozon без request body.", template: { operation: "cluster_list", params: {} }
    },
    fbs_stock_by_warehouse: {
      provider: "seller_api", method: "POST", path: "/v2/product/info/stocks-by-warehouse/fbs", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "warehouse_fbs", guidance_visibility: "user", entitlement_key: "POST /v2/product/info/stocks-by-warehouse/fbs", workflow_role: "single_read",
      purpose: "Получить остатки FBS/rFBS по складам без скрытого продолжения cursor.", template: { operation: "fbs_stock_by_warehouse", params: { sku: ["1"], limit: 100 } }
    },
    fbo_stock_by_warehouse: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/stocks-by-warehouse/fbo", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "warehouse_fbo", guidance_visibility: "user", entitlement_key: "POST /v1/product/info/stocks-by-warehouse/fbo", workflow_role: "single_read",
      purpose: "Получить остатки FBO по складам для явно указанных offer_ids/skus без скрытой автопагинации.", template: { operation: "fbo_stock_by_warehouse", params: { skus: ["1"], limit: 100 } }
    },
    stock_analytics: {
      provider: "seller_api", method: "POST", path: "/v1/analytics/stocks", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "stock_analytics", guidance_visibility: "user", entitlement_key: "POST /v1/analytics/stocks", workflow_role: "single_read",
      purpose: "Получить текущую аналитику остатков по SKU и фильтрам складов/кластеров.", template: { operation: "stock_analytics", params: { skus: ["1"] } }
    },
    stock_turnover_analytics: {
      provider: "seller_api", method: "POST", path: "/v1/analytics/turnover/stocks", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "stock_movement_turnover", guidance_visibility: "user", entitlement_key: "POST /v1/analytics/turnover/stocks", workflow_role: "single_read",
      purpose: "Получить оборачиваемость и уровень текущего остатка товаров; offset продолжает выборку только отдельной явной командой.", template: { operation: "stock_turnover_analytics", params: { limit: 100, offset: 0, sku: [] } }
    },
    warehouse_fbs_return_mile_check: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/return-mile/check", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "warehouse_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/return-mile/check", workflow_role: "single_read",
      purpose: "Проверить необходимость настройки возвратной мили FBS по явно заданным параметрам склада.", template: { operation: "warehouse_fbs_return_mile_check", params: { country_code: "RU", first_mile_type: "DROP_OFF", is_kgt: false } }
    },
    warehouse_fbs_return_mile_info: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbs/return-mile/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "warehouse_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbs/return-mile/info", workflow_role: "single_read",
      purpose: "Получить настройки возвратной мили и безопасную операционную географию для явно указанных FBS-складов.", template: { operation: "warehouse_fbs_return_mile_info", params: { warehouse_ids: ["1"] } }
    },
    warehouse_operation_status: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/operation/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "warehouse_diagnostics", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/operation/status", workflow_role: "single_read",
      purpose: "Получить статус явно указанной операции склада без автоматического polling.", template: { operation: "warehouse_operation_status", params: { operation_id: "operation-id" } }
    },
    supplier_available_warehouses: {
      provider: "seller_api", method: "GET", path: "/v1/supplier/available_warehouses", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "ozon_warehouses", guidance_visibility: "user", entitlement_key: "GET /v1/supplier/available_warehouses", workflow_role: "single_read",
      purpose: "Получить активные склады Ozon и их среднюю загруженность без дополнительных запросов.", template: { operation: "supplier_available_warehouses", params: {} }
    },
    product_fbs_warehouse_stocks: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/warehouse/stocks", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "stocks_inventory", section: "warehouse_fbs", guidance_visibility: "user", entitlement_key: "POST /v1/product/info/warehouse/stocks", workflow_role: "single_read",
      purpose: "Получить остатки на одном явно указанном FBS/rFBS складе без скрытой пагинации.", template: { operation: "product_fbs_warehouse_stocks", params: { limit: 100, warehouse_id: 1 } }
    },
    analytics_data: {
      provider: "seller_api", method: "POST", path: "/v1/analytics/data", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "sales_analytics", section: "sales_revenue_units", guidance_visibility: "user", entitlement_key: "POST /v1/analytics/data", workflow_role: "single_read",
      purpose: "Получить аналитику продаж по периоду, метрикам и группировкам.", template: { operation: "analytics_data", params: { date_from: "2026-01-01", date_to: "2026-01-07", dimension: ["day"], metrics: ["revenue"], limit: 100 } }
    },
    product_queries: {
      provider: "seller_api", method: "POST", path: "/v1/analytics/product-queries", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "search_visibility", section: "product_queries", guidance_visibility: "user", entitlement_key: "POST /v1/analytics/product-queries", workflow_role: "single_read",
      purpose: "Получить сводку поисковых запросов по выбранным SKU.", template: { operation: "product_queries", params: { date_from: "2026-01-01T00:00:00Z", page_size: 10, skus: ["1"] } }
    },
    product_queries_details: {
      provider: "seller_api", method: "POST", path: "/v1/analytics/product-queries/details", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "search_visibility", section: "query_details", guidance_visibility: "user", entitlement_key: "POST /v1/analytics/product-queries/details", workflow_role: "single_read",
      purpose: "Получить детализацию поисковых запросов по выбранным SKU.", template: { operation: "product_queries_details", params: { date_from: "2026-01-01T00:00:00Z", page_size: 10, skus: ["1"], limit_by_sku: 10 } }
    },
    marketplace_search_queries_text: {
      provider: "seller_api", method: "POST", path: "/v1/search-queries/text", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "search_visibility", section: "marketplace_search_queries", guidance_visibility: "user", entitlement_key: "POST /v1/search-queries/text", workflow_role: "single_read",
      purpose: "Получить поисковые запросы маркетплейса по тексту; Premium Pro; offset продолжает выборку только отдельной явной командой.", template: { operation: "marketplace_search_queries_text", params: { limit: "50", offset: "0", text: "куртка" } }
    },
    marketplace_search_queries_top: {
      provider: "seller_api", method: "POST", path: "/v1/search-queries/top", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "search_visibility", section: "marketplace_search_queries", guidance_visibility: "user", entitlement_key: "POST /v1/search-queries/top", workflow_role: "single_read",
      purpose: "Получить популярные поисковые запросы маркетплейса; Premium Pro; offset продолжает выборку только отдельной явной командой.", template: { operation: "marketplace_search_queries_top", params: { limit: "50", offset: "0" } }
    },
    posting_fbo_list: {
      provider: "seller_api", method: "POST", path: "/v3/posting/fbo/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbo_postings", guidance_visibility: "user", entitlement_key: "POST /v3/posting/fbo/list", workflow_role: "single_read",
      purpose: "Получить список отправлений FBO.", template: { operation: "posting_fbo_list", params: { limit: 10 } }
    },
    posting_fbo_get: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbo/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbo_postings", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbo/get", workflow_role: "single_read",
      purpose: "Получить безопасную информацию об одном отправлении FBO по явно заданному posting_number.", template: { operation: "posting_fbo_get", params: { posting_number: "12345678-0001-1" } }
    },
    fbp_posting_list: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbp/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbp_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbp/list", workflow_role: "single_read",
      purpose: "Получить список FBP-отправлений; cursor продолжает выборку только отдельной явной командой.", template: { operation: "fbp_posting_list", params: { limit: 100, sort_dir: "ASC" } }
    },
    fbp_posting_get: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbp/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbp_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbp/get", workflow_role: "single_read",
      purpose: "Получить безопасную информацию об одном FBP-отправлении по явно заданному posting_number.", template: { operation: "fbp_posting_get", params: { posting_number: "12345678-0001-1" } }
    },
    posting_unpaid_legal_product_list: {
      provider: "seller_api", method: "POST", path: "/v1/posting/unpaid-legal/product/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/unpaid-legal/product/list", workflow_role: "single_read",
      purpose: "Получить список неоплаченных товаров из заказов юридических лиц; cursor продолжает выборку только отдельной явной командой.", template: { operation: "posting_unpaid_legal_product_list", params: { limit: 100 } }
    },
    fbs_posting_list: {
      provider: "seller_api", method: "POST", path: "/v4/posting/fbs/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "conditional", entitlement_key: "POST /v4/posting/fbs/list", workflow_role: "single_read",
      purpose: "Получить список отправлений FBS; ответ может содержать данные покупателя/получателя.", template: { operation: "fbs_posting_list", params: { filter: { since: "2026-01-01T00:00:00Z", to: "2026-01-02T00:00:00Z" }, limit: 10 } }
    },
    fbs_unfulfilled_list: {
      provider: "seller_api", method: "POST", path: "/v4/posting/fbs/unfulfilled/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "conditional", entitlement_key: "POST /v4/posting/fbs/unfulfilled/list", workflow_role: "single_read",
      purpose: "Получить список необработанных отправлений FBS; ответ может содержать данные покупателя/получателя.", template: { operation: "fbs_unfulfilled_list", params: { limit: 10 } }
    },
    posting_fbs_get: {
      provider: "seller_api", method: "POST", path: "/v3/posting/fbs/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "conditional", entitlement_key: "POST /v3/posting/fbs/get", workflow_role: "single_read",
      purpose: "Получить подробную информацию об отправлении FBS; ответ может содержать данные покупателя/получателя.", template: { operation: "posting_fbs_get", params: { posting_number: "12345678-0001-1" } }
    },
    fbs_carriage_available_list: {
      provider: "seller_api", method: "POST", path: "/v1/posting/carriage-available/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/posting/carriage-available/list", workflow_role: "single_read",
      purpose: "Получить доступные перевозки для метода доставки и, при необходимости, явной даты отгрузки.", template: { operation: "fbs_carriage_available_list", params: { delivery_method_id: 1 } }
    },
    fbs_carriage_get: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/get", workflow_role: "single_read",
      purpose: "Получить безопасную информацию об одной явно указанной FBS-перевозке.", template: { operation: "fbs_carriage_get", params: { carriage_id: 1 } }
    },
    fbs_act_list: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/list", workflow_role: "single_read",
      purpose: "Получить список FBS-актов без скрытой пагинации.", template: { operation: "fbs_act_list", params: { limit: 50 } }
    },
    fbs_act_check_status: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/check-status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/check-status", workflow_role: "single_read",
      purpose: "Проверить статус явно указанного задания формирования FBS-акта без автоматического polling.", template: { operation: "fbs_act_check_status", params: { id: 1 } }
    },
    assembly_carriage_posting_list: {
      provider: "seller_api", method: "POST", path: "/v1/assembly/carriage/posting/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/assembly/carriage/posting/list", workflow_role: "single_read",
      purpose: "Получить отправления одной перевозки для сборки без скрытого продолжения cursor.", template: { operation: "assembly_carriage_posting_list", params: { filter: { carriage_id: 1 }, limit: 100 } }
    },
    assembly_carriage_product_list: {
      provider: "seller_api", method: "POST", path: "/v1/assembly/carriage/product/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/assembly/carriage/product/list", workflow_role: "single_read",
      purpose: "Получить товары одной перевозки для сборки без скрытого продолжения cursor.", template: { operation: "assembly_carriage_product_list", params: { filter: { carriage_id: 1 }, limit: 100 } }
    },
    assembly_fbs_posting_list: {
      provider: "seller_api", method: "POST", path: "/v1/assembly/fbs/posting/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/assembly/fbs/posting/list", workflow_role: "single_read",
      purpose: "Получить FBS-отправления для сборки по явному cutoff-периоду без скрытой пагинации.", template: { operation: "assembly_fbs_posting_list", params: { filter: { cutoff_from: "2026-01-01T00:00:00Z", cutoff_to: "2026-01-02T00:00:00Z" }, limit: 100, sort_dir: "ASC" } }
    },
    assembly_fbs_product_list: {
      provider: "seller_api", method: "POST", path: "/v1/assembly/fbs/product/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/assembly/fbs/product/list", workflow_role: "single_read",
      purpose: "Получить FBS-товары для сборки по явному cutoff-периоду без скрытого offset-продолжения.", template: { operation: "assembly_fbs_product_list", params: { filter: { cutoff_from: "2026-01-01T00:00:00Z", cutoff_to: "2026-01-02T00:00:00Z" }, limit: 100 } }
    },
    fbs_carriage_container_get: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/container/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/container/get", workflow_role: "single_read",
      purpose: "Получить безопасную информацию об одном явно указанном грузоместе FBS.", template: { operation: "fbs_carriage_container_get", params: { container_id: 1 } }
    },
    fbs_carriage_container_list: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/container/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/container/list", workflow_role: "single_read",
      purpose: "Получить список грузомест FBS без скрытого продолжения cursor.", template: { operation: "fbs_carriage_container_list", params: {} }
    },
    fbs_carriage_container_status_get: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/container/status/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/container/status/get", workflow_role: "single_read",
      purpose: "Получить статусы явно переданного набора грузомест FBS.", template: { operation: "fbs_carriage_container_status_get", params: { container_ids: ["1"] } }
    },
    fbs_carriage_container_task_info: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/container/task/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/container/task/info", workflow_role: "single_read",
      purpose: "Получить статус задачи грузового места без автоматического polling.", template: { operation: "fbs_carriage_container_task_info", params: { task_id: 1 } }
    },
    fbs_product_country_list: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/product/country/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/product/country/list", workflow_role: "single_read",
      purpose: "Получить справочник доступных стран-изготовителей FBS без скрытых дополнительных запросов.", template: { operation: "fbs_product_country_list", params: {} }
    },
    fbs_posting_restrictions: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbs/restrictions", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbs/restrictions", workflow_role: "single_read",
      purpose: "Получить габаритные, весовые и ценовые ограничения пункта приёма для явно указанного FBS-отправления.", template: { operation: "fbs_posting_restrictions", params: { posting_number: "12345678-0001-1" } }
    },
    fbs_posting_timeslot_change_restrictions: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbs/timeslot/change-restrictions", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbs/timeslot/change-restrictions", workflow_role: "single_read",
      purpose: "Получить доступный интервал переноса доставки и оставшееся число переносов для одного явно указанного FBS/rFBS-отправления.", template: { operation: "fbs_posting_timeslot_change_restrictions", params: { posting_number: "12345678-0001-1" } }
    },
    fbs_act_get_postings: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/get-postings", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/get-postings", workflow_role: "single_read",
      purpose: "Получить отправления одного явно указанного FBS-акта без fanout и вторичных запросов.", template: { operation: "fbs_act_get_postings", params: { id: 1 } }
    },
    product_import_info: {
      provider: "seller_api", method: "POST", path: "/v1/product/import/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/import/info", workflow_role: "single_read",
      purpose: "Получить статус ранее запущенной задачи импорта товара по явно указанному task_id без polling.", template: { operation: "product_import_info", params: { task_id: 1 } }
    },
    product_action_timer_status: {
      provider: "seller_api", method: "POST", path: "/v1/product/action/timer/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "prices", guidance_visibility: "user", entitlement_key: "POST /v1/product/action/timer/status", workflow_role: "single_read",
      purpose: "Получить статус таймера актуальности минимальной цены для явно переданных товаров без скрытого fanout.", template: { operation: "product_action_timer_status", params: { product_ids: ["1"] } }
    },
    fbs_carriage_ettn_status: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/ettn/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/ettn/status", workflow_role: "single_read",
      purpose: "Получить статус проверки электронной ТТН для явно указанной FBS-перевозки без polling и документов.", template: { operation: "fbs_carriage_ettn_status", params: { carriage_id: 1 } }
    },
    fbs_traceable_attribute_list: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbs/product/traceable/attribute", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbs/product/traceable/attribute", workflow_role: "single_read",
      purpose: "Получить список незаполненных прослеживаемых атрибутов для явно указанного FBS-отправления.", template: { operation: "fbs_traceable_attribute_list", params: { posting_number: "12345678-0001-1" } }
    },
    returns_list: {
      provider: "seller_api", method: "POST", path: "/v1/returns/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "user", entitlement_key: "POST /v1/returns/list", workflow_role: "single_read",
      purpose: "Получить информацию о возвратах FBO и FBS.", template: { operation: "returns_list", params: { limit: 100 } }
    },
    rfbs_returns_list: {
      provider: "seller_api", method: "POST", path: "/v2/returns/rfbs/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "conditional", entitlement_key: "POST /v2/returns/rfbs/list", workflow_role: "single_read",
      purpose: "Получить заявки на возврат rFBS; ответ может содержать имя клиента.", template: { operation: "rfbs_returns_list", params: { limit: 100 } }
    },
    returns_utilization_history: {
      provider: "seller_api", method: "POST", path: "/v1/returns/settings/utilization/history", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "user", entitlement_key: "POST /v1/returns/settings/utilization/history", workflow_role: "single_read",
      purpose: "Получить историю изменений настроек автоутилизации возвратов.", template: { operation: "returns_utilization_history", params: {} }
    },
    returns_utilization_info: {
      provider: "seller_api", method: "POST", path: "/v1/returns/settings/utilization/info", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "user", entitlement_key: "POST /v1/returns/settings/utilization/info", workflow_role: "single_read",
      purpose: "Получить текущие настройки автоутилизации возвратов.", template: { operation: "returns_utilization_info", params: {} }
    },
    removal_from_stock_list: {
      provider: "seller_api", method: "POST", path: "/v1/removal/from-stock/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "user", entitlement_key: "POST /v1/removal/from-stock/list", workflow_role: "single_read",
      purpose: "Получить отчёт по вывозу и утилизации со стока FBO; следующая страница только отдельной явной командой с last_id.", template: { operation: "removal_from_stock_list", params: { date_from: "2026-08-01", date_to: "2026-08-28", limit: 100 } }
    },
    removal_from_supply_list: {
      provider: "seller_api", method: "POST", path: "/v1/removal/from-supply/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "user", entitlement_key: "POST /v1/removal/from-supply/list", workflow_role: "single_read",
      purpose: "Получить отчёт по вывозу и утилизации с поставки FBO; следующая страница только отдельной явной командой с last_id.", template: { operation: "removal_from_supply_list", params: { date_from: "2026-08-01", date_to: "2026-08-28", limit: 100 } }
    },
    returns_company_fbs_info: {
      provider: "seller_api", method: "POST", path: "/v1/returns/company/fbs/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "return_giveout", guidance_visibility: "user", entitlement_key: "POST /v1/returns/company/fbs/info", workflow_role: "single_read",
      purpose: "Получить количество возвратов FBS и информацию по drop-off пунктам.", template: { operation: "returns_company_fbs_info", params: { pagination: { limit: 100 } } }
    },
    return_giveout_is_enabled: {
      provider: "seller_api", method: "POST", path: "/v1/return/giveout/is-enabled", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "return_giveout", guidance_visibility: "user", entitlement_key: "POST /v1/return/giveout/is-enabled", workflow_role: "single_read",
      purpose: "Проверить, доступно ли получение возвратных отгрузок по штрихкоду.", template: { operation: "return_giveout_is_enabled", params: {} }
    },
    return_giveout_list: {
      provider: "seller_api", method: "POST", path: "/v1/return/giveout/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "return_giveout", guidance_visibility: "user", entitlement_key: "POST /v1/return/giveout/list", workflow_role: "single_read",
      purpose: "Получить список активных возвратных отгрузок.", template: { operation: "return_giveout_list", params: { limit: 100 } }
    },
    return_giveout_info: {
      provider: "seller_api", method: "POST", path: "/v1/return/giveout/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "return_giveout", guidance_visibility: "user", entitlement_key: "POST /v1/return/giveout/info", workflow_role: "single_read",
      purpose: "Получить информацию о возвратной отгрузке.", template: { operation: "return_giveout_info", params: { giveout_id: 1 } }
    },
    cancel_reason_list: {
      provider: "seller_api", method: "POST", path: "/v1/cancel-reason/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/cancel-reason/list", workflow_role: "single_read",
      purpose: "Получить возможные причины отмены отправлений и заказов.", template: { operation: "cancel_reason_list", params: {} }
    },
    posting_fbs_cancel_reason_list: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/cancel-reason/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/cancel-reason/list", workflow_role: "single_read",
      purpose: "Получить причины отмены, доступные для FBS/rFBS отправлений.", template: { operation: "posting_fbs_cancel_reason_list", params: {} }
    },
    posting_fbs_cancel_reason: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbs/cancel-reason", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbs/cancel-reason", workflow_role: "single_read",
      purpose: "Получить причины отмены для явно заданных FBS/rFBS отправлений одним прямым запросом.", template: { operation: "posting_fbs_cancel_reason", params: { related_posting_numbers: ["12345678-0001-1"] } }
    },
    posting_fbo_cancel_reason_list: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbo/cancel-reason/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbo/cancel-reason/list", workflow_role: "single_read",
      purpose: "Получить причины отмены, доступные для FBO-отправлений.", template: { operation: "posting_fbo_cancel_reason_list", params: {} }
    },
    cancel_reason_list_by_order: {
      provider: "seller_api", method: "POST", path: "/v1/cancel-reason/list-by-order", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/cancel-reason/list-by-order", workflow_role: "single_read",
      purpose: "Получить возможные причины отмены для конкретного заказа.", template: { operation: "cancel_reason_list_by_order", params: { order_number: "12345678-0001" } }
    },
    cancel_reason_list_by_posting: {
      provider: "seller_api", method: "POST", path: "/v1/cancel-reason/list-by-posting", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/cancel-reason/list-by-posting", workflow_role: "single_read",
      purpose: "Получить возможные причины отмены для конкретного отправления.", template: { operation: "cancel_reason_list_by_posting", params: { posting_number: "12345678-0001-1" } }
    },
    order_cancel_status: {
      provider: "seller_api", method: "POST", path: "/v1/order/cancel/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/order/cancel/status", workflow_role: "single_read",
      purpose: "Получить статус отмены заказа.", template: { operation: "order_cancel_status", params: { order_number: "12345678-0001" } }
    },
    posting_cancel_status: {
      provider: "seller_api", method: "POST", path: "/v1/posting/cancel/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/posting/cancel/status", workflow_role: "single_read",
      purpose: "Проверить статус отмены отправления.", template: { operation: "posting_cancel_status", params: { posting_number: "12345678-0001-1" } }
    },
    finance_accrual_postings: {
      provider: "seller_api", method: "POST", path: "/v1/finance/accrual/postings", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "accruals_balance", guidance_visibility: "user", entitlement_key: "POST /v1/finance/accrual/postings", workflow_role: "single_read",
      purpose: "Получить начисления по указанным номерам отправлений.", template: { operation: "finance_accrual_postings", params: { posting_numbers: ["12345678-0001-1"] } }
    },
    finance_accrual_types: {
      provider: "seller_api", method: "POST", path: "/v1/finance/accrual/types", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "accruals_balance", guidance_visibility: "user", entitlement_key: "POST /v1/finance/accrual/types", workflow_role: "single_read",
      purpose: "Получить справочник типов начислений.", template: { operation: "finance_accrual_types", params: {} }
    },
    finance_accrual_by_day: {
      provider: "seller_api", method: "POST", path: "/v1/finance/accrual/by-day", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "accruals_balance", guidance_visibility: "user", entitlement_key: "POST /v1/finance/accrual/by-day", workflow_role: "single_read",
      purpose: "Получить начисления за один день; продолжение last_id выполняется только отдельной явной командой.", template: { operation: "finance_accrual_by_day", params: { date: "2026-08-25", last_id: "" } }
    },
    finance_cash_flow_statement_list: {
      provider: "seller_api", method: "POST", path: "/v1/finance/cash-flow-statement/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "documents_reports", guidance_visibility: "user", entitlement_key: "POST /v1/finance/cash-flow-statement/list", workflow_role: "single_read",
      purpose: "Получить финансовый отчёт денежных потоков; следующая страница только отдельной явной командой.", template: { operation: "finance_cash_flow_statement_list", params: { date: { from: "2026-08-01T00:00:00Z", to: "2026-08-28T23:59:59Z" }, page: 1, page_size: 100, with_details: true } }
    },
    finance_transaction_list_v3: {
      provider: "seller_api", method: "POST", path: "/v3/finance/transaction/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "transactions", guidance_visibility: "user", entitlement_key: "POST /v3/finance/transaction/list", workflow_role: "single_read",
      purpose: "Получить список финансовых транзакций; page продолжает выборку только отдельной явной командой.", template: { operation: "finance_transaction_list_v3", params: { page: 1, page_size: 100, filter: { date: { from: "2026-08-01T00:00:00Z", to: "2026-08-28T23:59:59Z" } } } }
    },
    finance_balance: {
      provider: "seller_api", method: "POST", path: "/v1/finance/balance", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "accruals_balance", guidance_visibility: "user", entitlement_key: "POST /v1/finance/balance", workflow_role: "single_read",
      purpose: "Получить отчёт о балансе за явно заданный период.", template: { operation: "finance_balance", params: { date_from: "2026-08-01T00:00:00Z", date_to: "2026-08-28T23:59:59Z" } }
    },
    finance_realization_by_day: {
      provider: "seller_api", method: "POST", path: "/v1/finance/realization/by-day", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "realization", guidance_visibility: "user", entitlement_key: "POST /v1/finance/realization/by-day", workflow_role: "single_read",
      purpose: "Получить суммы реализации за один явно заданный день; endpoint требует Premium Plus или Premium Pro.", template: { operation: "finance_realization_by_day", params: { day: 28, month: 8, year: 2026 } }
    },
    finance_realization_posting: {
      provider: "seller_api", method: "POST", path: "/v1/finance/realization/posting", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "realization", guidance_visibility: "user", entitlement_key: "POST /v1/finance/realization/posting", workflow_role: "single_read",
      purpose: "Получить позаказный отчёт о реализации за явно заданный месяц старого периода, поддерживаемого endpoint.", template: { operation: "finance_realization_posting", params: { month: 8, year: 2023 } }
    },
    finance_realization_v2: {
      provider: "seller_api", method: "POST", path: "/v2/finance/realization", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "realization", guidance_visibility: "user", entitlement_key: "POST /v2/finance/realization", workflow_role: "single_read",
      purpose: "Получить месячный отчёт о реализации товаров версии 2.", template: { operation: "finance_realization_v2", params: { month: 8, year: 2026 } }
    },
    finance_products_buyout: {
      provider: "seller_api", method: "POST", path: "/v1/finance/products/buyout", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "documents_reports", guidance_visibility: "user", entitlement_key: "POST /v1/finance/products/buyout", workflow_role: "single_read",
      purpose: "Получить прямой JSON-отчёт о товарах, выкупленных Ozon, за явно заданный период без скрытых дополнительных запросов.", template: { operation: "finance_products_buyout", params: { date_from: "2026-08-01", date_to: "2026-08-28" } }
    },
    report_list: {
      provider: "seller_api", method: "POST", path: "/v1/report/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "documents_reports", guidance_visibility: "user", entitlement_key: "POST /v1/report/list", workflow_role: "single_read",
      purpose: "Получить список ранее сформированных отчётов без создания новых отчётов.", template: { operation: "report_list", params: { page: 1, page_size: 100 } }
    },
    report_info: {
      provider: "seller_api", method: "POST", path: "/v1/report/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "documents_reports", guidance_visibility: "user", entitlement_key: "POST /v1/report/info", workflow_role: "single_read",
      purpose: "Получить информацию об уже созданном отчёте по его коду; файл автоматически не загружается.", template: { operation: "report_info", params: { code: "REPORT_CODE" } }
    },
    report_file_get: {
      provider: "report_file", method: "GET", path: "/__opaque_report_file__", effect: "READ", request_style: "opaque_file_ref", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false,
      cluster: "finance", section: "documents_reports", guidance_visibility: "conditional", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить и безопасно разобрать готовый файл отчёта/документа по opaque ref без раскрытия signed URL или base64.", template: { operation: "report_file_get", params: { file_ref: "REPORT_FILE_REF", offset: 0, limit: 200 } }
    },
    report_products_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/products/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/products/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт по товарам", template: {"operation":"report_products_create","params":{}}
    },
    report_returns_create_v2: {
      provider: "seller_api", method: "POST", path: "/v2/report/returns/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "returns_cancellations", section: "returns",
      guidance_visibility: "user", entitlement_key: "POST /v2/report/returns/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о возвратах", template: {"operation":"report_returns_create_v2","params":{"filter":{"date_from":"2026-01-01T00:00:00Z","date_to":"2026-01-01T00:00:00Z","status":"DisputeOpened"}}}
    },
    report_postings_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/postings/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/postings/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт об отправлениях", template: {"operation":"report_postings_create","params":{"filter":{"processed_at_from":"2026-01-01T00:00:00Z","processed_at_to":"2026-01-01T00:00:00Z","delivery_schema":["FBO"]}}}
    },
    report_discounted_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/discounted/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/discounted/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт об уценённых товарах", template: {"operation":"report_discounted_create","params":{}}
    },
    report_warehouse_stock: {
      provider: "seller_api", method: "POST", path: "/v1/report/warehouse/stock", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "stocks_inventory", section: "warehouse_fbs",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/warehouse/stock", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт об остатках на FBS-складе", template: {"operation":"report_warehouse_stock","params":{"warehouseId":["1"]}}
    },
    report_placement_by_products_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/placement/by-products/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "stocks_inventory", section: "stock_movement_turnover",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/placement/by-products/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить отчёт о стоимости размещения по товарам", template: {"operation":"report_placement_by_products_create","params":{"date_from":"2026-01-01","date_to":"2026-01-01"}}
    },
    report_placement_by_supplies_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/placement/by-supplies/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "supply_orders",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/placement/by-supplies/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить отчёт о стоимости размещения по поставкам", template: {"operation":"report_placement_by_supplies_create","params":{"date_from":"2026-01-01","date_to":"2026-01-01"}}
    },
    report_marked_products_sales_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/marked-products-sales/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "sales_analytics", section: "period_product_category",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/marked-products-sales/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать отчёт по продажам товаров с маркировкой", template: {"operation":"report_marked_products_sales_create","params":{"date":{"from":"2026-01-01","to":"2026-01-01"}}}
    },
    report_realization_posting_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/realization/posting/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "realization",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/realization/posting/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить позаказный отчёт о реализации товаров", template: {"operation":"report_realization_posting_create","params":{"month":8,"year":2026}}
    },
    finance_document_b2b_sales: {
      provider: "seller_api", method: "POST", path: "/v1/finance/document-b2b-sales", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/document-b2b-sales", workflow_role: "explicit_workflow_read_step",
      purpose: "Реестр продаж юридическим лицам", template: {"operation":"finance_document_b2b_sales","params":{"date":"2026-01"}}
    },
    finance_mutual_settlement_report: {
      provider: "seller_api", method: "POST", path: "/v1/finance/mutual-settlement", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/mutual-settlement", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о взаиморасчётах", template: {"operation":"finance_mutual_settlement_report","params":{"date":"2026-01"}}
    },
    finance_compensation_report: {
      provider: "seller_api", method: "POST", path: "/v1/finance/compensation", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/compensation", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о компенсациях", template: {"operation":"finance_compensation_report","params":{"date":"2026-01"}}
    },
    finance_decompensation_report: {
      provider: "seller_api", method: "POST", path: "/v1/finance/decompensation", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/decompensation", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о декомпенсациях", template: {"operation":"finance_decompensation_report","params":{"date":"2026-01"}}
    },
    cargoes_label_create: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes-label/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/cargoes-label/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать этикетки для грузомест", template: {"operation":"cargoes_label_create","params":{"supply_id":1,"cargoes":[{"cargo_id":1}]}}
    },
    posting_fbs_act_container_labels: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/get-container-labels", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/get-container-labels", workflow_role: "single_read", response_style: "binary", response_content_types: ["application/pdf"],
      purpose: "Этикетки для грузового места", template: {"operation":"posting_fbs_act_container_labels","params":{"id":1}}
    },
    posting_fbs_package_label: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/package-label", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/package-label", workflow_role: "single_read", response_style: "binary", response_content_types: ["application/pdf"],
      purpose: "Напечатать этикетку", template: {"operation":"posting_fbs_package_label","params":{"posting_number":["POSTING_NUMBER"]}}
    },
    posting_fbs_package_label_create: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/package-label/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/package-label/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Создать задание на формирование этикеток", template: {"operation":"posting_fbs_package_label_create","params":{"posting_number":["POSTING_NUMBER"]}}
    },
    cargoes_transport_label_by_order_create: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/label/transport-by-order/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/label/transport-by-order/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать этикетки для транспортных грузомест по заявке", template: {"operation":"cargoes_transport_label_by_order_create","params":{"order_id":1}}
    },
    cargoes_transport_label_create: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/label/transport/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/label/transport/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать этикетки транспортных грузомест", template: {"operation":"cargoes_transport_label_create","params":{"supply_id":1,"transport_cargo_ids":["1"]}}
    },
    fbp_act_from_create: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/act-from/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/act-from/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать акт приёмки", template: {"operation":"fbp_act_from_create","params":{"supply_id":"1"}}
    },
    fbp_act_to_create: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/act-to/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/act-to/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать транспортную накладную", template: {"operation":"fbp_act_to_create","params":{"supply_id":"1"}}
    },
    fbp_label_create: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/label/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/label/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Cоздать задание на генерацию этикеток", template: {"operation":"fbp_label_create","params":{"supply_id":"1"}}
    },
    fbp_draft_direct_product_validate: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/direct/product/validate", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "drafts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/direct/product/validate", workflow_role: "single_read",
      purpose: "Проверить список товаров для склада партнёра", template: {"operation":"fbp_draft_direct_product_validate","params":{"skus":[{"count":1,"sku":1}],"warehouse_id":1}}
    },
    fbp_draft_dropoff_product_validate: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/drop-off/product/validate", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "drafts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/drop-off/product/validate", workflow_role: "single_read",
      purpose: "Проверить список товаров, которые склад партнёра может принять", template: {"operation":"fbp_draft_dropoff_product_validate","params":{"skus":[{"count":1,"sku":1}],"warehouse_id":1}}
    },
    fbp_draft_pickup_product_validate: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/pick-up/product/validate", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "drafts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/pick-up/product/validate", workflow_role: "single_read",
      purpose: "Провалидировать список товаров для pick-up поставки", template: {"operation":"fbp_draft_pickup_product_validate","params":{"skus":[{"count":1,"sku":1}],"warehouse_id":1}}
    },
    chat_history_v3: {
      provider: "seller_api", method: "POST", path: "/v3/chat/history", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "reviews_questions", section: "chats",
      guidance_visibility: "conditional", entitlement_key: "POST /v3/chat/history", workflow_role: "single_read",
      purpose: "История чата", template: {"operation":"chat_history_v3","params":{"chat_id":"1"}}
    },
    supply_order_list: {
      provider: "seller_api", method: "POST", path: "/v3/supply-order/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v3/supply-order/list", workflow_role: "single_read",
      purpose: "Получить список идентификаторов заявок на поставку.", template: { operation: "supply_order_list", params: { filter: { states: [] }, limit: 100, sort_by: "ORDER_CREATION", sort_dir: "DESC" } }
    },
    supply_order_get: {
      provider: "seller_api", method: "POST", path: "/v3/supply-order/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v3/supply-order/get", workflow_role: "single_read",
      purpose: "Получить заявки на поставку по идентификаторам.", template: { operation: "supply_order_get", params: { order_ids: [1] } }
    },
    supply_order_status_counter: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/status/counter", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/status/counter", workflow_role: "single_read",
      purpose: "Получить количество заявок на поставку по статусам.", template: { operation: "supply_order_status_counter", params: {} }
    },
    supply_order_bundle: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/bundle", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/bundle", workflow_role: "single_read",
      purpose: "Получить товарный состав поставки или заявки на поставку.", template: { operation: "supply_order_bundle", params: { bundle_ids: ["BUNDLE_ID"], limit: 100 } }
    },
    supply_order_timeslot_list: {
      provider: "seller_api", method: "POST", path: "/v2/supply-order/timeslot/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v2/supply-order/timeslot/list", workflow_role: "single_read",
      purpose: "Получить актуальный список доступных интервалов поставки.", template: { operation: "supply_order_timeslot_list", params: { order_id: 1 } }
    },
    supply_order_details: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/details", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/details", workflow_role: "single_read",
      purpose: "Получить подробную информацию о заявке на поставку.", template: { operation: "supply_order_details", params: { order_id: 1 } }
    },
    supply_order_act_accept_status: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/act/accept/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/act/accept/status", workflow_role: "single_read",
      purpose: "Получить статус согласования акта по явному operation_id; без автоматического polling.", template: { operation: "supply_order_act_accept_status", params: { operation_id: "OPERATION_ID" } }
    },
    supply_order_act_product_get: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/act/product/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/act/product/get", workflow_role: "single_read",
      purpose: "Получить информацию о товарах в акте по идентификатору поставки.", template: { operation: "supply_order_act_product_get", params: { supply_id: 1 } }
    },
    supply_order_act_summary_get: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/act/summary/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/act/summary/get", workflow_role: "single_read",
      purpose: "Получить информацию об акте по идентификатору заявки на поставку.", template: { operation: "supply_order_act_summary_get", params: { order_id: 1 } }
    },
    supply_order_cancel_status: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/cancel/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/cancel/status", workflow_role: "single_read",
      purpose: "Получить статус ранее запущенной отмены по явному operation_id; без автоматического polling.", template: { operation: "supply_order_cancel_status", params: { operation_id: "OPERATION_ID" } }
    },
    supply_order_content_update_status: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/content/update/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/content/update/status", workflow_role: "single_read",
      purpose: "Получить статус ранее запущенного редактирования состава по явному operation_id; без polling.", template: { operation: "supply_order_content_update_status", params: { operation_id: "OPERATION_ID" } }
    },
    supply_order_content_update_validation: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/content/update/validation", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/content/update/validation", workflow_role: "single_read",
      purpose: "Проверить новый товарный состав поставки без применения изменения.", template: { operation: "supply_order_content_update_validation", params: { new_bundle_id: "BUNDLE_ID", supply_id: 1 } }
    },
    supply_order_pass_status: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/pass/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/pass/status", workflow_role: "single_read",
      purpose: "Получить статус ввода данных о водителе и автомобиле по явному operation_id; без polling.", template: { operation: "supply_order_pass_status", params: { operation_id: "OPERATION_ID" } }
    },
    supply_order_timeslot_status: {
      provider: "seller_api", method: "POST", path: "/v1/supply-order/timeslot/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "user", entitlement_key: "POST /v1/supply-order/timeslot/status", workflow_role: "single_read",
      purpose: "Получить статус ранее запущенного изменения интервала по явному operation_id; без polling.", template: { operation: "supply_order_timeslot_status", params: { operation_id: "OPERATION_ID" } }
    },
    fbo_draft_create_info: {
      provider: "seller_api", method: "POST", path: "/v2/draft/create/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "user", entitlement_key: "POST /v2/draft/create/info", workflow_role: "single_read",
      purpose: "Получить информацию о ранее созданном черновике заявки на поставку.", template: { operation: "fbo_draft_create_info", params: { draft_id: 1 } }
    },
    fbo_draft_supply_create_status: {
      provider: "seller_api", method: "POST", path: "/v2/draft/supply/create/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "user", entitlement_key: "POST /v2/draft/supply/create/status", workflow_role: "single_read",
      purpose: "Получить статус создания заявки на поставку по явному draft_id без автоматического polling.", template: { operation: "fbo_draft_supply_create_status", params: { draft_id: 1 } }
    },
    fbo_draft_cluster_list: {
      provider: "seller_api", method: "POST", path: "/v1/cluster/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "user", entitlement_key: "POST /v1/cluster/list", workflow_role: "single_read",
      purpose: "Получить кластеры и их склады для планирования FBO-поставки.", template: { operation: "fbo_draft_cluster_list", params: { cluster_type: "CLUSTER_TYPE_OZON" } }
    },
    fbo_draft_warehouse_list: {
      provider: "seller_api", method: "POST", path: "/v1/warehouse/fbo/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "user", entitlement_key: "POST /v1/warehouse/fbo/list", workflow_role: "single_read",
      purpose: "Найти точки отгрузки для кросс-докинга или прямой FBO-поставки.", template: { operation: "fbo_draft_warehouse_list", params: { filter_by_supply_type: ["CREATE_TYPE_DIRECT"], search: "Ozon" } }
    },
    fbo_draft_timeslot_info: {
      provider: "seller_api", method: "POST", path: "/v2/draft/timeslot/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "timeslots", guidance_visibility: "user", entitlement_key: "POST /v2/draft/timeslot/info", workflow_role: "single_read",
      purpose: "Получить доступные таймслоты для явно выбранного FBO-черновика и складов кластера; без скрытых дополнительных запросов.", template: { operation: "fbo_draft_timeslot_info", params: { date_from: "2026-08-28", date_to: "2026-08-29", draft_id: 1, supply_type: "DIRECT", selected_cluster_warehouses: [{ macrolocal_cluster_id: 1, storage_warehouse_id: 1 }] } }
    },
    fbp_draft_dropoff_province_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/drop-off/province/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/drop-off/province/list", workflow_role: "single_read",
      purpose: "Получить список провинций для планирования FBP drop-off по явному warehouse_id.", template: { operation: "fbp_draft_dropoff_province_list", params: { warehouse_id: 1 } }
    },
    fbp_draft_dropoff_point_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/drop-off/point/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/drop-off/point/list", workflow_role: "single_read",
      purpose: "Получить drop-off пункты выбранной провинции; продолжение страницы только отдельной явной командой.", template: { operation: "fbp_draft_dropoff_point_list", params: { page_size: 50, province_uuid: "PROVINCE_UUID", warehouse_id: 1 } }
    },
    fbp_draft_dropoff_point_timetable: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/drop-off/point/timetable", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "timeslots", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/drop-off/point/timetable", workflow_role: "single_read",
      purpose: "Получить расписание выбранного FBP drop-off пункта.", template: { operation: "fbp_draft_dropoff_point_timetable", params: { drop_off_point_id: 1, province_uuid: "PROVINCE_UUID", warehouse_id: 1 } }
    },
    fbp_draft_direct_timeslot_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/direct/timeslot/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "timeslots", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/direct/timeslot/get", workflow_role: "single_read",
      purpose: "Получить доступные таймслоты для прямой FBP-поставки в явно заданном интервале.", template: { operation: "fbp_draft_direct_timeslot_get", params: { bundle_id: "BUNDLE_ID", interval_start: "2026-08-28T00:00:00Z", interval_end: "2026-08-29T00:00:00Z", warehouse_id: 1 } }
    },
    fbp_order_direct_timeslot_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/order/direct/timeslot/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "timeslots", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/order/direct/timeslot/list", workflow_role: "single_read",
      purpose: "Получить доступные таймслоты для уже созданной FBP-поставки в явно заданном интервале.", template: { operation: "fbp_order_direct_timeslot_list", params: { interval_start: "2026-08-28T00:00:00Z", interval_end: "2026-08-29T00:00:00Z", supply_id: "SUPPLY_ID" } }
    },
    fbp_order_dropoff_timetable: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/order/drop-off/timetable", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "timeslots", guidance_visibility: "user", entitlement_key: "POST /v1/fbp/order/drop-off/timetable", workflow_role: "single_read",
      purpose: "Получить график работы выбранного FBP drop-off пункта для поставки.", template: { operation: "fbp_order_dropoff_timetable", params: { drop_off_point_id: 1, province_uuid: "PROVINCE_UUID", warehouse_id: 1 } }
    },
    fbo_cargoes_create_info: {
      provider: "seller_api", method: "POST", path: "/v2/cargoes/create/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v2/cargoes/create/info", workflow_role: "single_read",
      purpose: "Получить информацию о результате установки грузомест по явному operation_id.", template: { operation: "fbo_cargoes_create_info", params: { operation_id: "OPERATION_ID" } }
    },
    fbo_cargoes_get: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/get", workflow_role: "single_read",
      purpose: "Получить информацию о грузоместах для явно переданных идентификаторов поставок.", template: { operation: "fbo_cargoes_get", params: { supply_ids: ["1"] } }
    },
    fbo_cargoes_delete_status: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/delete/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/delete/status", workflow_role: "single_read",
      purpose: "Получить статус ранее запущенного удаления грузоместа по явному operation_id без автоматического polling.", template: { operation: "fbo_cargoes_delete_status", params: { operation_id: "OPERATION_ID" } }
    },
    fbo_cargoes_rules_get: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/rules/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/rules/get", workflow_role: "single_read",
      purpose: "Получить чек-лист правил установки грузомест для явно переданных идентификаторов поставок.", template: { operation: "fbo_cargoes_rules_get", params: { supply_ids: ["1"] } }
    },
    fbo_cargoes_v2_get: {
      provider: "seller_api", method: "POST", path: "/v2/cargoes/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v2/cargoes/get", workflow_role: "single_read",
      purpose: "Получить информацию о грузоместах для явно указанных поставок и идентификаторов грузомест.", template: { operation: "fbo_cargoes_v2_get", params: { supplies: [{ supply_id: 1, cargo_ids: ["1"] }] } }
    },
    fbo_cargoes_v2_delete_status: {
      provider: "seller_api", method: "POST", path: "/v2/cargoes/delete/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v2/cargoes/delete/status", workflow_role: "single_read",
      purpose: "Получить статус ранее запущенного удаления грузомест по явному operation_id без автоматического polling.", template: { operation: "fbo_cargoes_v2_delete_status", params: { operation_id: "OPERATION_ID" } }
    },
    fbo_cargoes_transport_activate_status: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/transport/activate/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/transport/activate/status", workflow_role: "single_read",
      purpose: "Получить статус включения или отключения транспортных грузомест по явному operation_id без автоматического polling.", template: { operation: "fbo_cargoes_transport_activate_status", params: { operation_id: "OPERATION_ID" } }
    },
    fbo_cargoes_transport_bind_status: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/transport/bind/status", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/transport/bind/status", workflow_role: "single_read",
      purpose: "Получить статус связывания или отвязывания грузомест по явному operation_id без автоматического polling.", template: { operation: "fbo_cargoes_transport_bind_status", params: { operation_id: "OPERATION_ID" } }
    },
    fbo_cargoes_supplies_get: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/supplies/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/supplies/get", workflow_role: "single_read",
      purpose: "Получить информацию о грузоместах для явно переданных идентификаторов поставок.", template: { operation: "fbo_cargoes_supplies_get", params: { supply_ids: ["1"] } }
    },
    product_visibility_info: {
      provider: "seller_api", method: "POST", path: "/v1/product/visibility/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/visibility/info", workflow_role: "single_read",
      purpose: "Получить информацию о видимости явно указанных SKU или доступную сводку без скрытых повторных запросов.", template: { operation: "product_visibility_info", params: { skus: ["1"] } }
    },
    product_quant_list: {
      provider: "seller_api", method: "POST", path: "/v1/product/quant/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/quant/list", workflow_role: "single_read",
      purpose: "Получить список эконом-товаров одним явным запросом без скрытой пагинации.", template: { operation: "product_quant_list", params: { limit: 100 } }
    },
    product_quant_info: {
      provider: "seller_api", method: "POST", path: "/v1/product/quant/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/quant/info", workflow_role: "single_read",
      purpose: "Получить информацию об эконом-товарах по явно переданным кодам квантов.", template: { operation: "product_quant_info", params: { quant_code: ["QUANT_CODE"] } }
    },
    product_placement_zone_info: {
      provider: "seller_api", method: "POST", path: "/v1/product/placement-zone/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "catalog_products", section: "product_list_info", guidance_visibility: "user", entitlement_key: "POST /v1/product/placement-zone/info", workflow_role: "single_read",
      purpose: "Получить зоны размещения товаров по явно переданным SKU перед поставкой.", template: { operation: "product_placement_zone_info", params: { skus: ["1"] } }
    },
    product_stairway_discount_by_quantity_get: {
      provider: "seller_api", method: "POST", path: "/v1/product/stairway-discount/by-quantity/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "prices_promotions", section: "prices", guidance_visibility: "user", entitlement_key: "POST /v1/product/stairway-discount/by-quantity/get", workflow_role: "single_read",
      purpose: "Получить текущую скидку от количества для явно переданных SKU.", template: { operation: "product_stairway_discount_by_quantity_get", params: { skus: ["1"] } }
    },
    seller_rating_summary: {
      provider: "seller_api", method: "POST", path: "/v1/rating/summary", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "sales_analytics", section: "delivery_returns_cancellations_metrics", guidance_visibility: "user", entitlement_key: "POST /v1/rating/summary", workflow_role: "single_read",
      purpose: "Получить текущие рейтинги продавца и их пороги.", template: { operation: "seller_rating_summary", params: {} }
    },
    seller_rating_history: {
      provider: "seller_api", method: "POST", path: "/v1/rating/history", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "sales_analytics", section: "delivery_returns_cancellations_metrics", guidance_visibility: "user", entitlement_key: "POST /v1/rating/history", workflow_role: "single_read",
      purpose: "Получить историю выбранных рейтингов продавца за явный период.", template: { operation: "seller_rating_history", params: { date_from: "2026-08-01T00:00:00Z", date_to: "2026-08-26T23:59:59Z", ratings: ["rating_on_time"] } }
    },
    seller_fbs_error_index: {
      provider: "seller_api", method: "POST", path: "/v1/rating/index/fbs/info", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "sales_analytics", section: "delivery_returns_cancellations_metrics", guidance_visibility: "user", entitlement_key: "POST /v1/rating/index/fbs/info", workflow_role: "single_read",
      purpose: "Получить текущий индекс ошибок FBS/rFBS и стоимость обработки ошибок.", template: { operation: "seller_fbs_error_index", params: {} }
    },
    seller_fbs_error_postings: {
      provider: "seller_api", method: "POST", path: "/v1/rating/index/fbs/posting/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "sales_analytics", section: "delivery_returns_cancellations_metrics", guidance_visibility: "user", entitlement_key: "POST /v1/rating/index/fbs/posting/list", workflow_role: "single_read",
      purpose: "Получить отправления, повлиявшие на индекс ошибок FBS/rFBS, без скрытой автопагинации.", template: { operation: "seller_fbs_error_postings", params: { filter: { date_from: "2026-08-01T00:00:00Z", date_to: "2026-08-26T23:59:59Z" }, limit: 100 } }
    },
    review_list: {
      provider: "seller_api", method: "POST", path: "/v2/review/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "reviews_questions", section: "reviews", guidance_visibility: "conditional", entitlement_key: "POST /v2/review/list", workflow_role: "single_read",
      purpose: "Получить список отзывов покупателей; свободный пользовательский текст доступен только при включённой настройке личных данных.", template: { operation: "review_list", params: { limit: 100, sort_dir: "DESC" } }
    },
    review_info: {
      provider: "seller_api", method: "POST", path: "/v2/review/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "reviews_questions", section: "reviews", guidance_visibility: "conditional", entitlement_key: "POST /v2/review/info", workflow_role: "single_read",
      purpose: "Получить отзыв по идентификатору; свободный пользовательский текст доступен только при включённой настройке личных данных.", template: { operation: "review_info", params: { review_id: "REVIEW_ID" } }
    },
    review_comment_list: {
      provider: "seller_api", method: "POST", path: "/v1/review/comment/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "reviews_questions", section: "review_comments", guidance_visibility: "conditional", entitlement_key: "POST /v1/review/comment/list", workflow_role: "single_read",
      purpose: "Получить комментарии к отзыву; свободный текст доступен только при включённой настройке личных данных.", template: { operation: "review_comment_list", params: { review_id: "REVIEW_ID", limit: 100, sort_dir: "ASC" } }
    },
    review_count: {
      provider: "seller_api", method: "POST", path: "/v2/review/count", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "reviews_questions", section: "reviews", guidance_visibility: "user", entitlement_key: "POST /v2/review/count", workflow_role: "single_read",
      purpose: "Получить агрегированное количество отзывов по статусам без текста отзывов.", template: { operation: "review_count", params: {} }
    },
    question_list: {
      provider: "seller_api", method: "POST", path: "/v1/question/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "reviews_questions", section: "questions", guidance_visibility: "conditional", entitlement_key: "POST /v1/question/list", workflow_role: "single_read",
      purpose: "Получить вопросы покупателей; имя автора и свободный пользовательский текст доступны только при включённой настройке личных данных.", template: { operation: "question_list", params: { limit: 100, sort_dir: "DESC" } }
    },
    question_answer_list: {
      provider: "seller_api", method: "POST", path: "/v1/question/answer/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "reviews_questions", section: "answers", guidance_visibility: "conditional", entitlement_key: "POST /v1/question/answer/list", workflow_role: "single_read",
      purpose: "Получить ответы на вопрос; имя автора и свободный текст доступны только при включённой настройке личных данных.", template: { operation: "question_answer_list", params: { question_id: "QUESTION_ID", sku: 1 } }
    },
    question_count: {
      provider: "seller_api", method: "POST", path: "/v1/question/count", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "reviews_questions", section: "questions", guidance_visibility: "user", entitlement_key: "POST /v1/question/count", workflow_role: "single_read",
      purpose: "Получить агрегированное количество вопросов по статусам без текста вопросов.", template: { operation: "question_count", params: {} }
    },
    question_info: {
      provider: "seller_api", method: "POST", path: "/v1/question/info", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "reviews_questions", section: "questions", guidance_visibility: "conditional", entitlement_key: "POST /v1/question/info", workflow_role: "single_read",
      purpose: "Получить вопрос по идентификатору; имя автора и свободный текст доступны только при включённой настройке личных данных.", template: { operation: "question_info", params: { question_id: "QUESTION_ID" } }
    },
    question_top_sku: {
      provider: "seller_api", method: "POST", path: "/v1/question/top-sku", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "reviews_questions", section: "questions", guidance_visibility: "user", entitlement_key: "POST /v1/question/top-sku", workflow_role: "single_read",
      purpose: "Получить SKU с наибольшим количеством вопросов без текста и имён авторов.", template: { operation: "question_top_sku", params: { limit: 100 } }
    },
    product_certificate_accordance_types_v1: {
      provider: "seller_api", method: "GET", path: "/v1/product/certificate/accordance-types", effect: "READ", request_style: "query", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "catalog_products", section: "certification", guidance_visibility: "user",
      entitlement_key: "GET /v1/product/certificate/accordance-types", workflow_role: "single_read", purpose: "Список типов соответствия требованиям (версия 1)", template: {"operation":"product_certificate_accordance_types_v1","params":{}}
    },
    cargoes_label_get: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes-label/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user",
      entitlement_key: "POST /v1/cargoes-label/get", workflow_role: "explicit_workflow_read_step", purpose: "Получить идентификатор этикетки для грузомест", template: {"operation":"cargoes_label_get","params":{"operation_id":"op-1"}}
    },
    cargoes_label_transport_by_order_status: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/label/transport-by-order/status", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user",
      entitlement_key: "POST /v1/cargoes/label/transport-by-order/status", workflow_role: "explicit_workflow_read_step", purpose: "Получить статус генерации этикеток для транспортных грузомеcт по идентификатору поставки", template: {"operation":"cargoes_label_transport_by_order_status","params":{"operation_id":"op-1"}}
    },
    cargoes_label_transport_status: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/label/transport/status", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user",
      entitlement_key: "POST /v1/cargoes/label/transport/status", workflow_role: "explicit_workflow_read_step", purpose: "Получить статус генерации этикеток транспортных грузомест по идентификатору грузоместа", template: {"operation":"cargoes_label_transport_status","params":{"operation_id":"op-1"}}
    },
    cargoes_transport_create_status: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/transport/create/status", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes", guidance_visibility: "user",
      entitlement_key: "POST /v1/cargoes/transport/create/status", workflow_role: "single_read", purpose: "Получить статус создания транспортного грузоместа", template: {"operation":"cargoes_transport_create_status","params":{"operation_id":"op-1"}}
    },
    carriage_act_discrepancy_pdf: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/act-discrepancy/pdf", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings",
      section: "labels_documents", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/act-discrepancy/pdf", workflow_role: "single_read", purpose: "Получить акт о расхождениях по отгрузке FBS", template: {"operation":"carriage_act_discrepancy_pdf","params":{"carriage_id":1}}
    },
    carriage_container_document_get: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/container/document/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings",
      section: "labels_documents", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/container/document/get", workflow_role: "single_read", purpose: "Получить документы по грузоместам — ТрН и лист отгрузки", template: {"operation":"carriage_container_document_get","params":{"container_ids":["1"]}}
    },
    carriage_container_label_get: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/container/label/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings",
      section: "labels_documents", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/container/label/get", workflow_role: "single_read", purpose: "Получить этикетку по грузоместам", template: {"operation":"carriage_container_label_get","params":{"container_ids":["1"]}}
    },
    carriage_courier_contact_get: {
      provider: "seller_api", method: "POST", path: "/v1/carriage/courier-contact/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings",
      section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v1/carriage/courier-contact/get", workflow_role: "single_read", purpose: "Получить контактные данные продавца для курьера", template: {"operation":"carriage_courier_contact_get","params":{"carriage_id":1}}
    },
    delivery_point_info: {
      provider: "seller_api", method: "POST", path: "/v1/delivery/point/info", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "user",
      entitlement_key: "POST /v1/delivery/point/info", workflow_role: "single_read", purpose: "Получить информацию о точке самовывоза", template: {"operation":"delivery_point_info","params":{"map_point_ids":["1"]}}
    },
    fbp_act_from_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/act-from/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts", guidance_visibility: "user",
      entitlement_key: "POST /v1/fbp/act-from/get", workflow_role: "explicit_workflow_read_step", purpose: "Получить статус генерации акта приёмки", template: {"operation":"fbp_act_from_get","params":{"file_uuid":"00000000-0000-0000-0000-000000000000"}}
    },
    fbp_act_to_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/act-to/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts", guidance_visibility: "user",
      entitlement_key: "POST /v1/fbp/act-to/get", workflow_role: "explicit_workflow_read_step", purpose: "Получить статус генерации транспортной накладной", template: {"operation":"fbp_act_to_get","params":{"code":"code-1","supply_id":"1"}}
    },
    fbp_label_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/label/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts", guidance_visibility: "user",
      entitlement_key: "POST /v1/fbp/label/get", workflow_role: "explicit_workflow_read_step", purpose: "Получить статус задания на генерацию этикеток", template: {"operation":"fbp_label_get","params":{"code":"code-1","supply_id":"1"}}
    },
    posting_fbs_package_label_get_v1: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbs/package-label/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "labels_documents", guidance_visibility: "user",
      entitlement_key: "POST /v1/posting/fbs/package-label/get", workflow_role: "explicit_workflow_read_step", purpose: "Получить файл с этикетками", template: {"operation":"posting_fbs_package_label_get_v1","params":{"task_id":1}}
    },
    fbs_stock_by_warehouse_v1: {
      provider: "seller_api", method: "POST", path: "/v1/product/info/stocks-by-warehouse/fbs", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "stocks_inventory", section: "warehouse_fbs", guidance_visibility: "user",
      entitlement_key: "POST /v1/product/info/stocks-by-warehouse/fbs", workflow_role: "single_read", purpose: "Информация об остатках на складах продавца (FBS и rFBS)", template: {"operation":"fbs_stock_by_warehouse_v1","params":{"sku":["1"]}}
    },
    receipts_get: {
      provider: "seller_api", method: "POST", path: "/v1/receipts/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "finance",
      section: "documents_reports", guidance_visibility: "user", entitlement_key: "POST /v1/receipts/get", workflow_role: "single_read", purpose: "Получить чек в формате PDF", template: {"operation":"receipts_get","params":{"receipt_id":"1"}}
    },
    return_giveout_barcode: {
      provider: "seller_api", method: "POST", path: "/v1/return/giveout/barcode", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "returns_cancellations", section: "return_giveout", guidance_visibility: "user",
      entitlement_key: "POST /v1/return/giveout/barcode", workflow_role: "single_read", purpose: "Значение штрихкода для возвратных отгрузок", template: {"operation":"return_giveout_barcode","params":{}}
    },
    return_giveout_get_pdf: {
      provider: "seller_api", method: "POST", path: "/v1/return/giveout/get-pdf", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "returns_cancellations",
      section: "return_giveout", guidance_visibility: "user", entitlement_key: "POST /v1/return/giveout/get-pdf", workflow_role: "single_read", response_style: "binary", response_content_types: ["application/pdf"], purpose: "Штрихкод для получения возвратной отгрузки в формате PDF", template: {"operation":"return_giveout_get_pdf","params":{}}
    },
    return_giveout_get_png: {
      provider: "seller_api", method: "POST", path: "/v1/return/giveout/get-png", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "returns_cancellations",
      section: "return_giveout", guidance_visibility: "user", entitlement_key: "POST /v1/return/giveout/get-png", workflow_role: "single_read", response_style: "binary", response_content_types: ["image/png"], purpose: "Штрихкод для получения возвратной отгрузки в формате PNG", template: {"operation":"return_giveout_get_png","params":{}}
    },
    seller_actions_voucher_get: {
      provider: "seller_api", method: "POST", path: "/v1/seller-actions/voucher/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "user",
      entitlement_key: "POST /v1/seller-actions/voucher/get", workflow_role: "explicit_workflow_read_step", purpose: "Получить файл с промокодами в формате CSV", template: {"operation":"seller_actions_voucher_get","params":{"action_id":1}}
    },
    invoice_get: {
      provider: "seller_api", method: "POST", path: "/v2/invoice/get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports", guidance_visibility: "user",
      entitlement_key: "POST /v2/invoice/get", workflow_role: "single_read", purpose: "Получить информацию о счёте-фактуре", template: {"operation":"invoice_get","params":{"posting_number":"1"}}
    },
    posting_fbs_act_get_barcode: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/get-barcode", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings",
      section: "labels_documents", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/get-barcode", workflow_role: "single_read", response_style: "binary", response_content_types: ["image/png"], purpose: "Штрихкод для отгрузки отправления", template: {"operation":"posting_fbs_act_get_barcode","params":{"id":1}}
    },
    posting_fbs_act_get_barcode_text: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/get-barcode/text", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "labels_documents", guidance_visibility: "user",
      entitlement_key: "POST /v2/posting/fbs/act/get-barcode/text", workflow_role: "single_read", purpose: "Значение штрихкода для отгрузки отправления", template: {"operation":"posting_fbs_act_get_barcode_text","params":{"id":1}}
    },
    posting_fbs_act_get_pdf: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/get-pdf", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings",
      section: "labels_documents", guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/get-pdf", workflow_role: "single_read", response_style: "binary", response_content_types: ["application/pdf"], purpose: "Получить PDF c документами", template: {"operation":"posting_fbs_act_get_pdf","params":{"id":1}}
    },
    posting_fbs_get_by_barcode: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/get-by-barcode", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user",
      entitlement_key: "POST /v2/posting/fbs/get-by-barcode", workflow_role: "single_read", purpose: "Получить информацию об отправлении по штрихкоду", template: {"operation":"posting_fbs_get_by_barcode","params":{"barcode":"1"}}
    },
    product_certification_params_v2: {
      provider: "seller_api", method: "POST", path: "/v2/product/certification/params", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "catalog_products", section: "certification", guidance_visibility: "user",
      entitlement_key: "POST /v2/product/certification/params", workflow_role: "single_read", purpose: "Получить обязательные параметры для создания сертификата качества", template: {"operation":"product_certification_params_v2","params":{}}
    },
    fbs_posting_product_exemplar_status_v5: {
      provider: "seller_api", method: "POST", path: "/v5/fbs/posting/product/exemplar/status", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user",
      entitlement_key: "POST /v5/fbs/posting/product/exemplar/status", workflow_role: "single_read", purpose: "Получить статус добавления экземпляров", template: {"operation":"fbs_posting_product_exemplar_status_v5","params":{"posting_number":"1"}}
    },
    fbs_posting_product_exemplar_create_or_get_v6: {
      provider: "seller_api", method: "POST", path: "/v6/fbs/posting/product/exemplar/create-or-get", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user",
      entitlement_key: "POST /v6/fbs/posting/product/exemplar/create-or-get", workflow_role: "single_read", purpose: "Получить данные созданных экземпляров", template: {"operation":"fbs_posting_product_exemplar_create_or_get_v6","params":{"posting_number":"1"}}
    },
    arrival_pass_list: {
      provider: "seller_api", method: "POST", path: "/v1/pass/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "conditional", entitlement_key: "POST /v1/pass/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу пропусков; данные водителей доступны только при включённой настройке личных данных.", template: { operation: "arrival_pass_list", params: { limit: 100 } }
    },
    fbs_product_exemplar_validate: {
      provider: "seller_api", method: "POST", path: "/v5/fbs/posting/product/exemplar/validate", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v5/fbs/posting/product/exemplar/validate", workflow_role: "single_read",
      purpose: "Проверить коды маркировки перед явной операцией с отправлением без изменения его состояния.", template: { operation: "fbs_product_exemplar_validate", params: { posting_number: "POSTING_NUMBER", products: [{ product_id: 1, exemplars: [{}] }] } }
    },
    carriage_delivery_list_v2: {
      provider: "seller_api", method: "POST", path: "/v2/carriage/delivery/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "assembly_carriage", guidance_visibility: "user", entitlement_key: "POST /v2/carriage/delivery/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу методов доставки и отгрузок.", template: { operation: "carriage_delivery_list_v2", params: { limit: 100 } }
    },
    posting_fbs_pickup_code_verify: {
      provider: "seller_api", method: "POST", path: "/v1/posting/fbs/pick-up-code/verify", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/fbs/pick-up-code/verify", workflow_role: "single_read",
      purpose: "Проверить предоставленный код курьера для отправления без изменения состояния отправления.", template: { operation: "posting_fbs_pickup_code_verify", params: { pickup_code: "000000", posting_number: "POSTING_NUMBER" } }
    },
    posting_global_etgb: {
      provider: "seller_api", method: "POST", path: "/v1/posting/global/etgb", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "labels_documents", guidance_visibility: "user", entitlement_key: "POST /v1/posting/global/etgb", workflow_role: "single_read",
      purpose: "Получить таможенные декларации ETGB за явно указанный период.", template: { operation: "posting_global_etgb", params: { date: { from: "2026-01-01T00:00:00Z", to: "2026-01-02T00:00:00Z" } } }
    },
    rfbs_returns_get: {
      provider: "seller_api", method: "POST", path: "/v2/returns/rfbs/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "returns_cancellations", section: "returns", guidance_visibility: "conditional", entitlement_key: "POST /v2/returns/rfbs/get", workflow_role: "single_read",
      purpose: "Получить заявку на возврат rFBS; сведения о покупателе доступны только при включённой настройке личных данных.", template: { operation: "rfbs_returns_get", params: { return_id: 1 } }
    },
    conditional_cancellation_list: {
      provider: "seller_api", method: "POST", path: "/v2/conditional-cancellation/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "conditional", entitlement_key: "POST /v2/conditional-cancellation/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу заявок на отмену rFBS; пользовательские данные доступны только при включённой настройке личных данных.", template: { operation: "conditional_cancellation_list", params: { limit: 100 } }
    },
    chat_list_v3: {
      provider: "seller_api", method: "POST", path: "/v3/chat/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "reviews_questions", section: "chats", guidance_visibility: "user", entitlement_key: "POST /v3/chat/list", workflow_role: "single_read",
      purpose: "Получить метаданные одной явной страницы чатов без чтения истории и тел сообщений.", template: { operation: "chat_list_v3", params: { limit: 30 } }
    },
    finance_b2b_sales_json: {
      provider: "seller_api", method: "POST", path: "/v1/finance/document-b2b-sales/json", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "finance", section: "documents_reports", guidance_visibility: "conditional", entitlement_key: "POST /v1/finance/document-b2b-sales/json", workflow_role: "single_read",
      purpose: "Получить реестр продаж юридическим лицам в JSON; реквизиты доступны только при включённой настройке личных данных.", template: { operation: "finance_b2b_sales_json", params: { date: "2019-01" } }
    },
    receipts_seller_list: {
      provider: "seller_api", method: "POST", path: "/v1/receipts/seller/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "finance", section: "documents_reports", guidance_visibility: "user", entitlement_key: "POST /v1/receipts/seller/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу чеков продавца с безопасной проекцией результата.", template: { operation: "receipts_seller_list", params: { page: 0, page_size: 100 } }
    },
    discount_task_list_v2: {
      provider: "seller_api", method: "POST", path: "/v2/actions/discounts-task/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "prices_promotions", section: "actions_promotions", guidance_visibility: "conditional", entitlement_key: "POST /v2/actions/discounts-task/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу заявок покупателей на скидку; пользовательские данные доступны только при включённой настройке личных данных.", template: { operation: "discount_task_list_v2", params: { limit: 50, status: "ALL" } }
    },
    posting_digital_list_v2: {
      provider: "seller_api", method: "POST", path: "/v2/posting/digital/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v2/posting/digital/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу цифровых отправлений с редактированием чувствительных полей результата.", template: { operation: "posting_digital_list_v2", params: { limit: 100 } }
    },
    notification_list: {
      provider: "seller_api", method: "POST", path: "/v1/notification/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "account_access", section: "seller_settings", guidance_visibility: "user", entitlement_key: "POST /v1/notification/list", workflow_role: "single_read",
      purpose: "Получить информацию о подключённых URL уведомлений без выполнения webhook-проверки.", template: { operation: "notification_list", params: {} }
    },
    notification_push_type_list: {
      provider: "seller_api", method: "POST", path: "/v1/notification/push-type/list", effect: "READ", request_style: "no_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "account_access", section: "seller_settings", guidance_visibility: "user", entitlement_key: "POST /v1/notification/push-type/list", workflow_role: "single_read",
      purpose: "Получить справочник типов push-уведомлений.", template: { operation: "notification_push_type_list", params: {} }
    },
    fbp_archive_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/archive/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "conditional", entitlement_key: "POST /v1/fbp/archive/get", workflow_role: "single_read",
      purpose: "Получить завершённую FBP-поставку; контактные данные доступны только при включённой настройке личных данных.", template: { operation: "fbp_archive_get", params: { supply_id: "1" } }
    },
    fbp_archive_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/archive/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "conditional", entitlement_key: "POST /v1/fbp/archive/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу завершённых FBP-поставок; контактные данные доступны только при включённой настройке личных данных.", template: { operation: "fbp_archive_list", params: { count: "100" } }
    },
    fbp_draft_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "conditional", entitlement_key: "POST /v1/fbp/draft/get", workflow_role: "single_read",
      purpose: "Получить черновик FBP-поставки; контактные данные доступны только при включённой настройке личных данных.", template: { operation: "fbp_draft_get", params: { supply_id: "1" } }
    },
    fbp_draft_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "supplies_fbo", section: "drafts", guidance_visibility: "conditional", entitlement_key: "POST /v1/fbp/draft/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу черновиков FBP-поставки; контактные данные доступны только при включённой настройке личных данных.", template: { operation: "fbp_draft_list", params: { count: 100 } }
    },
    fbp_order_get: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/order/get", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "conditional", entitlement_key: "POST /v1/fbp/order/get", workflow_role: "single_read",
      purpose: "Получить FBP-поставку; контактные данные доступны только при включённой настройке личных данных.", template: { operation: "fbp_order_get", params: { supply_id: "1" } }
    },
    fbp_order_list: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/order/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "supplies_fbo", section: "supply_orders", guidance_visibility: "conditional", entitlement_key: "POST /v1/fbp/order/list", workflow_role: "single_read",
      purpose: "Получить одну явную страницу FBP-поставок; контактные данные доступны только при включённой настройке личных данных.", template: { operation: "fbp_order_list", params: { count: 100 } }
    },
    delivery_check: {
      provider: "seller_api", method: "POST", path: "/v1/delivery/check", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "conditional", entitlement_key: "POST /v1/delivery/check", workflow_role: "single_read",
      purpose: "Проверить доступность доставки для номера покупателя только при включённой настройке личных данных.", template: { operation: "delivery_check", params: { client_phone: "79990000000" } }
    },
    delivery_checkout_v2: {
      provider: "seller_api", method: "POST", path: "/v2/delivery/checkout", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate",
      policy_group: "personal_data_read", default_allowed: false,
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "conditional", entitlement_key: "POST /v2/delivery/checkout", workflow_role: "single_read",
      purpose: "Получить доступные варианты доставки с номером покупателя только при включённой настройке личных данных.", template: { operation: "delivery_checkout_v2", params: { buyer_phone: "79990000000", delivery_schema: "MIX", items: [{ sku: 1, quantity: 1 }] } }
    },
    delivery_map: {
      provider: "seller_api", method: "POST", path: "/v1/delivery/map", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "user", entitlement_key: "POST /v1/delivery/map", workflow_role: "single_read",
      purpose: "Получить точки доставки для явно указанной области карты.", template: { operation: "delivery_map", params: { viewport: { left_bottom: { lat: 55, long: 37 }, right_top: { lat: 56, long: 38 } }, zoom: 10 } }
    },
    delivery_point_list: {
      provider: "seller_api", method: "POST", path: "/v1/delivery/point/list", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "warehouse_logistics", section: "delivery_methods", guidance_visibility: "user", entitlement_key: "POST /v1/delivery/point/list", workflow_role: "single_read",
      purpose: "Получить список точек самовывоза.", template: { operation: "delivery_point_list", params: {} }
    },
    order_cancel_check: {
      provider: "seller_api", method: "POST", path: "/v1/order/cancel/check", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "returns_cancellations", section: "cancellations", guidance_visibility: "user", entitlement_key: "POST /v1/order/cancel/check", workflow_role: "single_read",
      purpose: "Проверить возможность отмены заказа без изменения его состояния.", template: { operation: "order_cancel_check", params: { order_number: "ORDER_NUMBER" } }
    },
    posting_marks: {
      provider: "seller_api", method: "POST", path: "/v1/posting/marks", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "orders_postings", section: "fbs_postings", guidance_visibility: "user", entitlement_key: "POST /v1/posting/marks", workflow_role: "single_read",
      purpose: "Получить маркировки экземпляров для явно указанных отправлений.", template: { operation: "posting_marks", params: { posting_numbers: ["POSTING_NUMBER"] } }
    },
    performance_campaigns: {
      provider: "performance_api", method: "GET", path: "/api/client/campaign", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/campaign", workflow_role: "single_read",
      purpose: "Получить список рекламных кампаний.", template: { operation: "performance_campaigns", params: {} }
    },
    performance_campaign_objects: {
      provider: "performance_api", method: "GET", path: "/api/client/campaign/{campaignId}/objects", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/campaign/{campaignId}/objects", workflow_role: "single_read",
      purpose: "Получить список продвигаемых объектов в кампании.", template: { operation: "performance_campaign_objects", params: { campaignId: "1" } }
    },
    performance_bid_limits: {
      provider: "performance_api", method: "GET", path: "/api/client/limits/list", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/limits/list", workflow_role: "single_read",
      purpose: "Получить лимиты ставок для инструментов продвижения.", template: { operation: "performance_bid_limits", params: {} }
    },
    performance_campaign_products: {
      provider: "performance_api", method: "GET", path: "/api/client/campaign/{campaignId}/v2/products", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/campaign/{campaignId}/v2/products", workflow_role: "single_read",
      purpose: "Получить список товаров кампании без скрытой автопагинации.", template: { operation: "performance_campaign_products", params: { campaignId: "1", page: 1, pageSize: 100 } }
    },
    performance_search_promo_products: {
      provider: "performance_api", method: "POST", path: "/api/client/campaign/search_promo/v2/products", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE POST /api/client/campaign/search_promo/v2/products", workflow_role: "single_read",
      purpose: "Получить список товаров в продвижении с оплатой за заказ без скрытой автопагинации.", template: { operation: "performance_search_promo_products", params: { page: 1, pageSize: 100 } }
    },
    performance_expense: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/expense/json", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/expense/json", workflow_role: "single_read",
      purpose: "Получить статистику рекламных расходов.", template: { operation: "performance_expense", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_daily: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/daily/json", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/daily/json", workflow_role: "single_read",
      purpose: "Получить дневную рекламную статистику.", template: { operation: "performance_daily", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_campaign_product: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/campaign/product/json", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/campaign/product/json", workflow_role: "single_read",
      purpose: "Получить рекламную статистику в разрезе кампаний и товаров.", template: { operation: "performance_campaign_product", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_media: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/campaign/media/json", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/campaign/media/json", workflow_role: "single_read",
      purpose: "Получить рекламную статистику по медийным кампаниям в JSON.", template: { operation: "performance_media", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_sku_statistics: {
      provider: "performance_api", method: "POST", path: "/api/client/statistics/products/sku", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE POST /api/client/statistics/products/sku", workflow_role: "single_read",
      purpose: "Получить статистику по товарам в оплате за клик.", template: { operation: "performance_sku_statistics", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_min_bid_by_sku: {
      provider: "performance_api", method: "POST", path: "/api/client/min/sku", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE POST /api/client/min/sku", workflow_role: "single_read",
      purpose: "Получить минимальную ставку для товаров по SKU.", template: { operation: "performance_min_bid_by_sku", params: { sku: ["1"] } }
    },
    performance_products_with_bonuses: {
      provider: "performance_api", method: "GET", path: "/api/client/products_with_bonuses", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/products_with_bonuses", workflow_role: "single_read",
      purpose: "Получить список SKU товаров с бонусами.", template: { operation: "performance_products_with_bonuses", params: {} }
    },
    performance_statistics_status: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/{UUID}", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/{UUID}", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить статус ранее явно запрошенного отчёта.", template: { operation: "performance_statistics_status", params: { UUID: "00000000-0000-0000-0000-000000000000" } }
    },
    performance_statistics_list_ui: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/list", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/list", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить одну явную страницу отчётов, созданных через интерфейс.", template: { operation: "performance_statistics_list_ui", params: { page: 1, pageSize: 100 } }
    },
    performance_statistics_list_api: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/externallist", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/externallist", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить одну явную страницу отчётов, созданных через API.", template: { operation: "performance_statistics_list_api", params: { page: 1, pageSize: 100 } }
    },
    performance_statistics_report_download: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/report", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/report", workflow_role: "explicit_workflow_read_step",
      response_style: "binary", response_content_types: ["text/csv", "application/zip"],
      purpose: "Скачать ранее подготовленный Performance отчёт одним явным запросом.", template: { operation: "performance_statistics_report_download", params: { UUID: "00000000-0000-0000-0000-000000000000" } }
    },
    performance_media_csv: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/campaign/media", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/campaign/media", workflow_role: "single_read",
      response_style: "binary", response_content_types: ["text/csv"],
      purpose: "Получить статистику по медийным кампаниям в документированном CSV-формате.", template: { operation: "performance_media_csv", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_campaign_product_csv: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/campaign/product", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/campaign/product", workflow_role: "single_read",
      response_style: "binary", response_content_types: ["text/csv"],
      purpose: "Получить статистику кампаний и товаров в документированном CSV-формате.", template: { operation: "performance_campaign_product_csv", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_expense_csv: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/expense", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/expense", workflow_role: "single_read",
      response_style: "binary", response_content_types: ["text/csv"],
      purpose: "Получить статистику расходов в документированном CSV-формате.", template: { operation: "performance_expense_csv", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_daily_csv: {
      provider: "performance_api", method: "GET", path: "/api/client/statistics/daily", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/statistics/daily", workflow_role: "single_read",
      response_style: "binary", response_content_types: ["text/csv"],
      purpose: "Получить дневную статистику в документированном CSV-формате.", template: { operation: "performance_daily_csv", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } }
    },
    performance_competitive_bids: {
      provider: "performance_api", method: "GET", path: "/api/client/campaign/{campaignId}/products/bids/competitive", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/campaign/{campaignId}/products/bids/competitive", workflow_role: "single_read",
      purpose: "Получить конкурентные ставки для явно указанных SKU кампании.", template: { operation: "performance_competitive_bids", params: { campaignId: "1", skus: ["1"] } }
    },
    performance_cpo_min_bids: {
      provider: "performance_api", method: "POST", path: "/api/client/search_promo/get_cpo_min_bids", effect: "READ", request_style: "json_body",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "campaigns", guidance_visibility: "user", entitlement_key: "PERFORMANCE POST /api/client/search_promo/get_cpo_min_bids", workflow_role: "single_read",
      purpose: "Получить фиксированные CPO-ставки для явно указанных SKU.", template: { operation: "performance_cpo_min_bids", params: { skus: ["1"] } }
    },
    performance_vendor_statistics_list: {
      provider: "performance_api", method: "GET", path: "/api/client/vendors/statistics/list", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/vendors/statistics/list", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить одну явную страницу отчётов аналитики внешнего трафика.", template: { operation: "performance_vendor_statistics_list", params: { page: 1, pageSize: 100 } }
    },
    performance_vendor_statistics_status: {
      provider: "performance_api", method: "GET", path: "/api/client/vendors/statistics/{UUID}", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/vendors/statistics/{UUID}", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить статус ранее явно запрошенного отчёта внешнего трафика.", template: { operation: "performance_vendor_statistics_status", params: { UUID: "00000000-0000-0000-0000-000000000000", vendor: true } }
    },
    performance_vendor_tag: {
      provider: "performance_api", method: "GET", path: "/api/client/organisation/vendor_tag", effect: "READ", request_style: "query",
      execution_enabled: true, currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection",
      cluster: "advertising_performance", section: "statistics", guidance_visibility: "user", entitlement_key: "PERFORMANCE GET /api/client/organisation/vendor_tag", workflow_role: "single_read",
      purpose: "Получить префикс UTM-метки организации.", template: { operation: "performance_vendor_tag", params: { orgId: "1" } }
    }
  });

  function canonicalClusterId(value) {
    const id = String(value || "").trim();
    return CLUSTER_ALIASES[id] || id;
  }

  function operation(alias) {
    return OPERATIONS[String(alias || "").trim()] || null;
  }

  function operationsForCluster(clusterId, section = null, { includeConditional = true, includeHidden = false } = {}) {
    const cluster = canonicalClusterId(clusterId);
    return Object.entries(OPERATIONS)
      .filter(([, meta]) => meta.cluster === cluster)
      .filter(([, meta]) => section == null || meta.section === String(section))
      .filter(([, meta]) => includeHidden || meta.guidance_visibility !== "hidden")
      .filter(([, meta]) => includeConditional || meta.guidance_visibility !== "conditional")
      .map(([alias, meta]) => ({ alias, meta }));
  }

  function catalogValidation(contractOperations = globalThis.OzonContract?.OPERATIONS || null) {
    const errors = [];
    const seen = new Set();
    for (const [alias, meta] of Object.entries(OPERATIONS)) {
      if (seen.has(alias)) errors.push(`duplicate:${alias}`);
      seen.add(alias);
      if (!CLUSTERS[meta.cluster]) errors.push(`cluster_missing:${alias}:${meta.cluster}`);
      if (!CLUSTERS[meta.cluster]?.sections?.[meta.section]) errors.push(`section_missing:${alias}:${meta.cluster}:${meta.section}`);
      if (!meta.entitlement_key) errors.push(`entitlement_missing:${alias}`);
      if (!meta.privacy_policy) errors.push(`privacy_missing:${alias}`);
      if (contractOperations) {
        const contract = contractOperations[alias];
        if (!contract) errors.push(`contract_missing:${alias}`);
        else if (contract.method !== meta.method || contract.path !== meta.path || String(contract.provider || "seller_api") !== String(meta.provider || "seller_api")) errors.push(`contract_transport_mismatch:${alias}`);
      }
    }
    if (contractOperations) {
      for (const [alias, meta] of Object.entries(contractOperations)) {
        if (meta?.execution_enabled === true && !OPERATIONS[alias]) errors.push(`registry_missing_enabled:${alias}`);
      }
    }
    return deepFreeze({ ok: errors.length === 0, errors });
  }

  globalThis.OzonOperationRegistry = deepFreeze({
    CLUSTERS,
    CLUSTER_ALIASES,
    OPERATIONS,
    canonicalClusterId,
    operation,
    operationsForCluster,
    catalogValidation
  });
})();

/* END shared/ozon_operation_registry.js */

/* BEGIN shared/ozon_entitlements.js */
(() => {
  "use strict";

  const SNAPSHOT_SCHEMA = "OZON_SELLER_ENTITLEMENTS_V1";
  const OFFICIAL_SWAGGER_URL = "https://docs.ozon.ru/api/seller/swagger.json";
  const KNOWN_SUBSCRIPTIONS = Object.freeze(["UNKNOWN", "UNSPECIFIED", "PREMIUM", "PREMIUM_LITE", "PREMIUM_PLUS", "PREMIUM_PRO"]);

  function deepFreeze(value) {
    if (!value || typeof value !== "object") return value;
    const seen = new WeakSet();
    const stack = [value];
    while (stack.length) {
      const current = stack.pop();
      if (!current || typeof current !== "object" || seen.has(current)) continue;
      seen.add(current);
      Object.freeze(current);
      for (const child of Object.values(current)) if (child && typeof child === "object" && !seen.has(child)) stack.push(child);
    }
    return value;
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  const ANALYTICS_RESTRICTED_METRICS = Object.freeze([
    "unknown_metric", "hits_view_search", "hits_view_pdp", "hits_view",
    "hits_tocart_search", "hits_tocart_pdp", "hits_tocart",
    "session_view_search", "session_view_pdp", "session_view",
    "conv_tocart_search", "conv_tocart_pdp", "conv_tocart",
    "returns", "cancellations", "delivered_units", "position_category"
  ]);
  const ANALYTICS_RESTRICTED_DIMENSIONS = Object.freeze(["year", "category1", "category2", "brand", "modelID", "descriptionType"]);
  const PRODUCT_QUERY_DETAILS_RESTRICTED_SORT = Object.freeze(["BY_VIEWS", "BY_POSITION", "BY_CONVERSION"]);

  const BUNDLED_SNAPSHOT = deepFreeze({
    schema: SNAPSHOT_SCHEMA,
    source: {
      kind: "bundled_last_known_good",
      canonical_url: OFFICIAL_SWAGGER_URL,
      captured_at: "2026-08-25T00:00:00.000Z",
      operation_count: 463,
      source_hash: "reviewed-openapi-463-2026-08-19"
    },
    unresolved_rule_count: 4,
    unresolved_rules: [
      { key: "POST /v2/review/list", reason: "endpoint_subscription_alternative_unrepresentable" },
      { key: "POST /v2/review/info", reason: "endpoint_subscription_alternative_unrepresentable" },
      { key: "POST /v1/review/comment/list", reason: "endpoint_subscription_alternative_unrepresentable" },
      { key: "POST /v2/review/count", reason: "endpoint_subscription_alternative_unrepresentable" }
    ],
    inventory: {},
    operations: {
      "POST /v3/product/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/product/info/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v4/product/info/attributes": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/description-category/tree": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/description-category/attribute": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/description-category/attribute/values": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/description-category/attribute/values/search": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/brand/company-certification/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/certificate/product_status/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/certificate/rejection_reasons/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/certificate/status/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "GET /v1/product/certificate/types": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "GET /v2/product/certificate/accordance-types/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/product/certification/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/product/certification/options": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/certificate/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/certificate/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/certificate/products/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/rating-by-sku": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/description": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v4/product/info/limit": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/subscription": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/related-sku/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/product/pictures/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/wrong-volume": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/discounted": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v5/product/info/prices": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/prices/details": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PRO"], feature_rules: [] },
      "POST /v1/pricing-strategy/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/pricing-strategy/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/pricing-strategy/products/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/pricing-strategy/product/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/pricing-strategy/competitors/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/pricing-strategy/strategy-ids-by-product-ids": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/seller-actions/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/seller-actions/products/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/seller-actions/products/candidates": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "GET /v1/actions": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/actions/candidates": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/actions/products": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/actions/auto-add/products/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/actions/auto-add/products/candidates": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/analytics/stock_on_warehouses": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbp/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbp/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/roles": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/seller/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/visibility/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/quant/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/quant/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/placement-zone/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/stairway-discount/by-quantity/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/warehouse/stocks": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },

      "POST /v1/seller/ozon-logistics/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v4/product/info/stocks": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/create/drop-off/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/update/drop-off/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/create/drop-off/timeslot/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/update/drop-off/timeslot/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/create/pick-up/timeslot/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/update/pick-up/timeslot/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/create/return-point/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/update/return-point/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/pickup/history/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/polygon/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/pickup/planning/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/warehouse/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/warehouse/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/delivery-method/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/delivery-method/return/settings/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/invalid-products/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/warehouses-with-invalid-products": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/ozon/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbo/seller/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/cluster/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/product/info/stocks-by-warehouse/fbs": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/stocks-by-warehouse/fbo": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/analytics/stocks": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/analytics/turnover/stocks": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/return-mile/check": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/return-mile/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/operation/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "GET /v1/supplier/available_warehouses": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/warehouse/stocks": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/posting/fbo/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbo/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/unpaid-legal/product/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v4/posting/fbs/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v4/posting/fbs/unfulfilled/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/posting/fbs/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/carriage-available/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/check-status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/assembly/carriage/posting/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/assembly/carriage/product/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/assembly/fbs/posting/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/assembly/fbs/product/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/container/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/container/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/container/status/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/container/task/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/product/country/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbs/restrictions": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbs/timeslot/change-restrictions": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/get-postings": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/return-mile/check": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbs/return-mile/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/import/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/action/timer/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/operation/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "GET /v1/supplier/available_warehouses": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/ettn/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbs/product/traceable/attribute": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/returns/settings/utilization/history": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/returns/settings/utilization/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/removal/from-stock/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/removal/from-supply/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/returns/company/fbs/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/return/giveout/is-enabled": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/return/giveout/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/return/giveout/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/returns/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/returns/rfbs/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cancel-reason/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/cancel-reason/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbs/cancel-reason": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbo/cancel-reason/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cancel-reason/list-by-order": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cancel-reason/list-by-posting": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/order/cancel/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/cancel/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/accrual/postings": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/accrual/types": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/accrual/by-day": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/cash-flow-statement/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/finance/transaction/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/balance": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/realization/by-day": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PLUS", "PREMIUM_PRO"], feature_rules: [] },
      "POST /v1/finance/realization/posting": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/finance/realization": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/products/buyout": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/products/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/report/returns/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/postings/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/discounted/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/warehouse/stock": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/placement/by-products/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/placement/by-supplies/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/marked-products-sales/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/realization/posting/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/document-b2b-sales": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/mutual-settlement": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/compensation": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/decompensation": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes-label/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/get-container-labels": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/package-label": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/package-label/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/label/transport-by-order/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/label/transport/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/act-from/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/act-to/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/label/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/direct/product/validate": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/drop-off/product/validate": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/pick-up/product/validate": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/chat/history": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/supply-order/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/supply-order/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/status/counter": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/bundle": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/supply-order/timeslot/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/details": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/act/accept/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/act/product/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/act/summary/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/cancel/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/content/update/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/content/update/validation": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/pass/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/supply-order/timeslot/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/draft/create/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/draft/supply/create/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cluster/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/warehouse/fbo/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/draft/timeslot/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/drop-off/province/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/drop-off/point/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/drop-off/point/timetable": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/direct/timeslot/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/order/direct/timeslot/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/order/drop-off/timetable": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/cargoes/create/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/delete/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/rules/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/cargoes/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/cargoes/delete/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/transport/activate/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/transport/bind/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/supplies/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/rating/summary": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/rating/history": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/rating/index/fbs/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/rating/index/fbs/posting/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/review/list": { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/review/info": { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/review/comment/list": { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/review/count": { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/question/list": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PLUS"], feature_rules: [] },
      "POST /v1/question/answer/list": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PLUS"], feature_rules: [] },
      "POST /v1/question/count": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PLUS"], feature_rules: [] },
      "POST /v1/question/info": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PLUS"], feature_rules: [] },
      "POST /v1/question/top-sku": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PLUS"], feature_rules: [] },
      "GET /v1/product/certificate/accordance-types": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes-label/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/label/transport-by-order/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/label/transport/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/transport/create/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/act-discrepancy/pdf": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/container/document/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/container/label/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/carriage/courier-contact/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/delivery/point/info": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/act-from/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/act-to/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/label/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/posting/fbs/package-label/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/product/info/stocks-by-warehouse/fbs": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/receipts/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/return/giveout/barcode": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/return/giveout/get-pdf": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/return/giveout/get-png": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/seller-actions/voucher/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/invoice/get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/get-barcode": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/get-barcode/text": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/get-pdf": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/get-by-barcode": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/product/certification/params": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v5/fbs/posting/product/exemplar/status": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v6/fbs/posting/product/exemplar/create-or-get": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/analytics/data": {
        default_access: "ALL_ACCOUNTS",
        endpoint_allowed_subscription_types: null,
        feature_rules: [
          { id: "analytics_history_over_3_months", selector: { type: "date_older_than_months", field: "date_from", months: 3 }, allowed_subscription_types: ["PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_operation_description" },
          { id: "analytics_restricted_metrics", selector: { type: "array_contains_any", field: "metrics", values: [...ANALYTICS_RESTRICTED_METRICS] }, allowed_subscription_types: ["PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_request_schema" },
          { id: "analytics_restricted_dimensions", selector: { type: "array_contains_any", field: "dimension", values: [...ANALYTICS_RESTRICTED_DIMENSIONS] }, allowed_subscription_types: ["PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_request_schema" },
          { id: "analytics_restricted_sort", selector: { type: "object_array_key_contains_any", field: "sort", key: "key", values: [...ANALYTICS_RESTRICTED_METRICS] }, allowed_subscription_types: ["PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_request_schema" },
          { id: "analytics_restricted_filters", selector: { type: "object_array_key_contains_any", field: "filters", key: "key", values: [...ANALYTICS_RESTRICTED_METRICS, ...ANALYTICS_RESTRICTED_DIMENSIONS] }, allowed_subscription_types: ["PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_request_schema" }
        ]
      },
      "POST /v1/analytics/product-queries": {
        default_access: "ALL_ACCOUNTS_PARTIAL_RESPONSE",
        endpoint_allowed_subscription_types: null,
        feature_rules: [
          { id: "product_queries_history_over_1_month", selector: { type: "date_older_than_months", field: "date_from", months: 1 }, allowed_subscription_types: ["PREMIUM", "PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_operation_description" }
        ]
      },
      "POST /v1/analytics/product-queries/details": {
        default_access: "ALL_ACCOUNTS_PARTIAL_RESPONSE",
        endpoint_allowed_subscription_types: null,
        feature_rules: [
          { id: "product_queries_details_history_over_1_month", selector: { type: "date_older_than_months", field: "date_from", months: 1 }, allowed_subscription_types: ["PREMIUM", "PREMIUM_PLUS", "PREMIUM_PRO"], source: "current_swagger_operation_description" },
          { id: "product_queries_details_restricted_sort", selector: { type: "value_in", field: "sort_by", values: [...PRODUCT_QUERY_DETAILS_RESTRICTED_SORT] }, allowed_subscription_types: ["PREMIUM", "PREMIUM_PLUS"], source: "current_swagger_request_schema" }
        ]
      },
      "POST /v1/search-queries/text": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PRO"], feature_rules: [] },
      "POST /v1/search-queries/top": { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: ["PREMIUM_PRO"], feature_rules: [] }
    }
  });

  function normalizeAllowedTypes(values) {
    const set = new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim().toUpperCase()).filter((value) => KNOWN_SUBSCRIPTIONS.includes(value) && !["UNKNOWN", "UNSPECIFIED"].includes(value)));
    return [...set].sort();
  }

  function subscriptionTypesFromText(text) {
    let source = String(text || "");
    const result = [];
    const add = (value) => { if (!result.includes(value)) result.push(value); };
    if (/premium[\s_-]*pro\b|podpiska-premium-pro\b/i.test(source)) add("PREMIUM_PRO");
    if (/premium[\s_-]*plus|subscription-premium-plus/i.test(source)) add("PREMIUM_PLUS");
    if (/premium[\s_-]*lite/i.test(source)) add("PREMIUM_LITE");
    source = source
      .replace(/premium[\s_-]*pro\b/ig, "")
      .replace(/premium[\s_-]*plus/ig, "")
      .replace(/premium[\s_-]*lite/ig, "")
      .replace(/podpiska-premium-pro\b/ig, "")
      .replace(/subscription-premium-plus/ig, "");
    if (/\bpremium\b|premium-program/i.test(source)) add("PREMIUM");
    return normalizeAllowedTypes(result);
  }

  function hasUnrepresentableAlternativeEntitlement(description) {
    const text = String(description || "");
    return /Управление отзывами|podpiska-upravlenie-otzyvami/i.test(text);
  }

  function looksLikeEndpointRestriction(description) {
    const text = String(description || "");
    if (!text) return false;
    if (/без подписк[иы].{0,160}(част|доступ|показ)/is.test(text)) return false;
    if (/полная аналитика доступна/is.test(text)) return false;
    return /(доступн[а-я ]{0,30}(?:только )?(?:для )?продавц[а-я ]{0,40}с подписк|могут только продавцы с подписк|доступен только с подписк|доступно только с подписк)/is.test(text);
  }

  function resolveRef(swagger, ref) {
    if (!ref || typeof ref !== "string" || !ref.startsWith("#/")) return null;
    let node = swagger;
    for (const encoded of ref.slice(2).split("/")) {
      const key = encoded.replace(/~1/g, "/").replace(/~0/g, "~");
      node = node && typeof node === "object" ? node[key] : null;
      if (node == null) return null;
    }
    return node;
  }

  function requestSchema(swagger, operation) {
    const schema = operation?.requestBody?.content?.["application/json"]?.schema || null;
    if (schema?.$ref) return resolveRef(swagger, schema.$ref) || schema;
    return schema;
  }

  function propertySchema(swagger, schema, name) {
    let resolved = schema;
    if (resolved?.$ref) resolved = resolveRef(swagger, resolved.$ref) || resolved;
    let prop = resolved?.properties?.[name] || null;
    if (prop?.$ref) prop = resolveRef(swagger, prop.$ref) || prop;
    return prop;
  }

  function operationFor(swagger, method, path) {
    return swagger?.paths?.[path]?.[String(method || "").toLowerCase()] || null;
  }

  function validateSwagger(swagger) {
    const errors = [];
    if (!swagger || typeof swagger !== "object" || Array.isArray(swagger)) errors.push("root_not_object");
    if (!/^3\./.test(String(swagger?.openapi || ""))) errors.push("openapi_version_not_3");
    if (!/Ozon Seller API/i.test(String(swagger?.info?.title || ""))) errors.push("unexpected_title");
    const servers = Array.isArray(swagger?.servers) ? swagger.servers : [];
    if (!servers.some((item) => /api-seller\.ozon\.ru/i.test(String(item?.url || "")))) errors.push("seller_server_missing");
    const paths = swagger?.paths && typeof swagger.paths === "object" ? swagger.paths : {};
    const operationCount = Object.values(paths).reduce((count, item) => count + Object.keys(item || {}).filter((method) => ["get", "post", "put", "delete", "patch"].includes(method)).length, 0);
    if (operationCount < 400 || operationCount > 2000) errors.push(`implausible_operation_count:${operationCount}`);
    return deepFreeze({ ok: errors.length === 0, errors, operation_count: operationCount });
  }

  function operationKey(method, path) {
    return `${String(method || "").toUpperCase()} ${String(path || "")}`;
  }

  function compileKnownFeatureRules(swagger, operations, unresolved) {
    const plusAndPro = ["PREMIUM_PLUS", "PREMIUM_PRO"];
    const allPremium = ["PREMIUM", "PREMIUM_PLUS", "PREMIUM_PRO"];

    const analyticsOp = operationFor(swagger, "POST", "/v1/analytics/data");
    if (analyticsOp) {
      const key = "POST /v1/analytics/data";
      const schema = requestSchema(swagger, analyticsOp);
      const dimensionDescription = String(propertySchema(swagger, schema, "dimension")?.description || "");
      const metricsDescription = String(propertySchema(swagger, schema, "metrics")?.description || "");
      const opDescription = String(analyticsOp.description || "");
      const premiumEvidence = /Premium Plus/i.test(dimensionDescription) && /Premium Plus/i.test(metricsDescription) && /Premium Pro/i.test(opDescription);
      if (premiumEvidence) {
        operations[key] = {
          ...(operations[key] || { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] }),
          default_access: "ALL_ACCOUNTS",
          endpoint_allowed_subscription_types: null,
          feature_rules: [
            { id: "analytics_history_over_3_months", selector: { type: "date_older_than_months", field: "date_from", months: 3 }, allowed_subscription_types: plusAndPro, source: "swagger_compiler" },
            { id: "analytics_restricted_metrics", selector: { type: "array_contains_any", field: "metrics", values: [...ANALYTICS_RESTRICTED_METRICS] }, allowed_subscription_types: plusAndPro, source: "swagger_compiler" },
            { id: "analytics_restricted_dimensions", selector: { type: "array_contains_any", field: "dimension", values: [...ANALYTICS_RESTRICTED_DIMENSIONS] }, allowed_subscription_types: plusAndPro, source: "swagger_compiler" },
            { id: "analytics_restricted_sort", selector: { type: "object_array_key_contains_any", field: "sort", key: "key", values: [...ANALYTICS_RESTRICTED_METRICS] }, allowed_subscription_types: plusAndPro, source: "swagger_compiler" },
            { id: "analytics_restricted_filters", selector: { type: "object_array_key_contains_any", field: "filters", key: "key", values: [...ANALYTICS_RESTRICTED_METRICS, ...ANALYTICS_RESTRICTED_DIMENSIONS] }, allowed_subscription_types: plusAndPro, source: "swagger_compiler" }
          ]
        };
      } else unresolved.push({ key, reason: "analytics_feature_rules_not_parsed" });
    }

    for (const path of ["/v1/analytics/product-queries", "/v1/analytics/product-queries/details"]) {
      const op = operationFor(swagger, "POST", path);
      if (!op) continue;
      const key = `POST ${path}`;
      const description = String(op.description || "");
      const historyEvidence = /раньше месяца назад доступна только с подпиской/i.test(description) && ["PREMIUM", "PREMIUM_PLUS", "PREMIUM_PRO"].every((tier) => subscriptionTypesFromText(description).includes(tier));
      if (!historyEvidence) {
        unresolved.push({ key, reason: "product_query_history_rule_not_parsed" });
        continue;
      }
      const rules = [{
        id: path.endsWith("/details") ? "product_queries_details_history_over_1_month" : "product_queries_history_over_1_month",
        selector: { type: "date_older_than_months", field: "date_from", months: 1 },
        allowed_subscription_types: allPremium,
        source: "swagger_compiler"
      }];
      if (path.endsWith("/details")) {
        const schema = requestSchema(swagger, op);
        const sortSchema = propertySchema(swagger, schema, "sort_by");
        const sortText = String(sortSchema?.description || "");
        const sortTiers = subscriptionTypesFromText(sortText);
        if (/BY_VIEWS/.test(sortText) && /BY_POSITION/.test(sortText) && /BY_CONVERSION/.test(sortText) && sortTiers.length) {
          rules.push({ id: "product_queries_details_restricted_sort", selector: { type: "value_in", field: "sort_by", values: [...PRODUCT_QUERY_DETAILS_RESTRICTED_SORT] }, allowed_subscription_types: sortTiers, source: "swagger_compiler" });
        } else unresolved.push({ key, reason: "product_queries_details_sort_rule_not_parsed" });
      }
      operations[key] = { default_access: "ALL_ACCOUNTS_PARTIAL_RESPONSE", endpoint_allowed_subscription_types: null, feature_rules: rules };
    }
  }

  function compileSnapshot(swagger, { sourceHash = "", capturedAt = new Date().toISOString() } = {}) {
    const validation = validateSwagger(swagger);
    if (!validation.ok) {
      const error = new Error(`Seller Swagger validation failed: ${validation.errors.join(", ")}`);
      error.code = "SELLER_SWAGGER_INVALID";
      throw error;
    }
    const operations = {};
    const inventory = {};
    const unresolved = [];
    for (const [path, item] of Object.entries(swagger.paths || {})) {
      for (const method of ["get", "post", "put", "delete", "patch"]) {
        const op = item?.[method];
        if (!op || typeof op !== "object") continue;
        const key = operationKey(method, path);
        inventory[key] = {
          summary: String(op.summary || "").slice(0, 400),
          operation_id: String(op.operationId || "").slice(0, 240),
          deprecated: op.deprecated === true,
          section: String(op?.["x-ozon-section"]?.name || "").slice(0, 120),
          section_group: String(op?.["x-ozon-section"]?.group || "").slice(0, 120)
        };
        operations[key] = { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] };
        const description = String(op.description || "");
        if (!looksLikeEndpointRestriction(description)) continue;
        if (hasUnrepresentableAlternativeEntitlement(description)) {
          unresolved.push({ key, reason: "endpoint_subscription_alternative_unrepresentable" });
          operations[key] = { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] };
          continue;
        }
        const allowed = subscriptionTypesFromText(description);
        if (!allowed.length) {
          unresolved.push({ key, reason: "endpoint_subscription_text_unparsed" });
          operations[key] = { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] };
          continue;
        }
        operations[key] = { default_access: "SUBSCRIPTION_RESTRICTED", endpoint_allowed_subscription_types: allowed, feature_rules: [] };
      }
    }

    compileKnownFeatureRules(swagger, operations, unresolved);
    const snapshot = {
      schema: SNAPSHOT_SCHEMA,
      source: {
        kind: "official_swagger_refresh",
        canonical_url: OFFICIAL_SWAGGER_URL,
        captured_at: String(capturedAt || new Date().toISOString()),
        operation_count: validation.operation_count,
        source_hash: String(sourceHash || "")
      },
      unresolved_rule_count: unresolved.length,
      unresolved_rules: unresolved.slice(0, 200),
      inventory,
      operations
    };
    return deepFreeze(snapshot);
  }

  function normalizeSnapshot(value) {
    if (!value || typeof value !== "object" || value.schema !== SNAPSHOT_SCHEMA || !value.operations || typeof value.operations !== "object") return BUNDLED_SNAPSHOT;
    const count = Number(value?.source?.operation_count || 0);
    if (count && (count < 400 || count > 2000)) return BUNDLED_SNAPSHOT;
    return value;
  }

  function parseDate(value) {
    const time = Date.parse(String(value || ""));
    return Number.isFinite(time) ? time : null;
  }

  function shiftUtcMonths(atMs, months) {
    const date = new Date(Number(atMs));
    if (!Number.isFinite(date.getTime())) return null;
    const out = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + Number(months || 0), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    return out.getTime();
  }

  function selectorMatches(selector, params, atMs) {
    if (!selector || typeof selector !== "object") return false;
    const field = String(selector.field || "");
    const value = params?.[field];
    if (selector.type === "date_older_than_months") {
      const parsed = parseDate(value);
      const boundary = shiftUtcMonths(atMs, -Math.abs(Number(selector.months || 0)));
      return parsed !== null && boundary !== null && parsed < boundary;
    }
    if (selector.type === "array_contains_any") {
      if (!Array.isArray(value)) return false;
      const allowed = new Set(Array.isArray(selector.values) ? selector.values : []);
      return value.some((item) => allowed.has(item));
    }
    if (selector.type === "object_array_key_contains_any") {
      if (!Array.isArray(value)) return false;
      const allowed = new Set(Array.isArray(selector.values) ? selector.values : []);
      const key = String(selector.key || "key");
      return value.some((item) => item && typeof item === "object" && allowed.has(item[key]));
    }
    if (selector.type === "value_in") {
      return (Array.isArray(selector.values) ? selector.values : []).includes(value);
    }
    return false;
  }

  function intersectAllowedSets(sets) {
    if (!sets.length) return [];
    let current = new Set(sets[0]);
    for (const values of sets.slice(1)) current = new Set(values.filter((value) => current.has(value)));
    return [...current].sort();
  }

  function requirementFor(command, snapshot = null, atMs = Date.now()) {
    const registryMeta = globalThis.OzonOperationRegistry?.operation?.(command?.operation) || null;
    if (!registryMeta || registryMeta.provider === "performance_api") return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], rule_source: "not_seller_or_missing" });
    const active = normalizeSnapshot(snapshot);
    const key = String(registryMeta.entitlement_key || `${registryMeta.method} ${registryMeta.path}`);
    const rule = active.operations?.[key] || BUNDLED_SNAPSHOT.operations?.[key] || null;
    if (!rule) return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: ["entitlement_rule_unknown"], entitlement_key: key, rule_source: active.source?.source_hash || null });
    if (rule.default_access === "UNKNOWN") return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: ["entitlement_rule_unknown"], entitlement_key: key, rule_source: active.source?.source_hash || null });

    const matched = [];
    const sets = [];
    if (Array.isArray(rule.endpoint_allowed_subscription_types) && rule.endpoint_allowed_subscription_types.length) {
      sets.push(normalizeAllowedTypes(rule.endpoint_allowed_subscription_types));
      matched.push("endpoint_subscription_restriction");
    }
    for (const feature of Array.isArray(rule.feature_rules) ? rule.feature_rules : []) {
      if (!selectorMatches(feature.selector, command?.params || {}, atMs)) continue;
      const allowed = normalizeAllowedTypes(feature.allowed_subscription_types);
      if (!allowed.length) return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: [`unparsed_feature:${feature.id || "unknown"}`], entitlement_key: key, rule_source: active.source?.source_hash || null });
      sets.push(allowed);
      matched.push(String(feature.id || "feature_restriction"));
    }
    if (!sets.length) return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], entitlement_key: key, rule_source: active.source?.source_hash || null, default_access: rule.default_access || "ALL_ACCOUNTS" });
    const allowed = intersectAllowedSets(sets);
    if (!allowed.length) return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: ["conflicting_entitlement_rules", ...matched], entitlement_key: key, rule_source: active.source?.source_hash || null });
    return deepFreeze({ required: true, known: true, allowed_subscription_types: allowed, reasons: matched, entitlement_key: key, rule_source: active.source?.source_hash || null, default_access: rule.default_access || "ALL_ACCOUNTS" });
  }

  function humanTierList(values) {
    const labels = { PREMIUM: "Premium", PREMIUM_LITE: "Premium Lite", PREMIUM_PLUS: "Premium Plus", PREMIUM_PRO: "Premium Pro" };
    return (Array.isArray(values) ? values : []).map((value) => labels[value] || value).join(" или ");
  }

  function summary(snapshot = null) {
    const active = normalizeSnapshot(snapshot);
    return deepFreeze({
      schema: active.schema,
      source_kind: active.source?.kind || "unknown",
      source_hash: active.source?.source_hash || null,
      captured_at: active.source?.captured_at || null,
      operation_count: Number(active.source?.operation_count || 0),
      entitlement_rule_count: Object.keys(active.operations || {}).length,
      inventory_count: Object.keys(active.inventory || {}).length,
      unresolved_rule_count: Number(active.unresolved_rule_count || 0)
    });
  }

  globalThis.OzonEntitlements = deepFreeze({
    SNAPSHOT_SCHEMA,
    OFFICIAL_SWAGGER_URL,
    KNOWN_SUBSCRIPTIONS,
    BUNDLED_SNAPSHOT,
    validateSwagger,
    compileSnapshot,
    normalizeSnapshot,
    requirementFor,
    subscriptionTypesFromText,
    humanTierList,
    summary,
    clone
  });
})();

/* END shared/ozon_entitlements.js */

/* BEGIN shared/ozon_credentials.js */
(() => {
  "use strict";
  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function normalizeHeaderCredential(value, name, { required = false } = {}) {
    const text = String(value ?? "").trim();
    if (!text) {
      if (required) fail(`MISSING_${name.toUpperCase()}`, `${name} не сохранён.`);
      return "";
    }
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i);
      if (code <= 0x1f || code === 0x7f) {
        fail(`INVALID_${name.toUpperCase()}`, `${name} содержит управляющий символ в позиции ${i + 1}.`);
      }
    }
    return text;
  }

  function normalizeSellerCredentials(input = {}, { required = false } = {}) {
    const clientId = normalizeHeaderCredential(input.clientId, "client_id", { required });
    const apiKey = normalizeHeaderCredential(input.apiKey, "api_key", { required });
    if ((clientId && !apiKey) || (!clientId && apiKey)) {
      fail("INCOMPLETE_SELLER_CREDENTIALS", "Client-Id и Api-Key должны быть сохранены вместе.");
    }
    return Object.freeze({ clientId, apiKey, present: Boolean(clientId && apiKey) });
  }

  function normalizePerformanceCredentials(input = {}, { required = false } = {}) {
    const clientId = normalizeHeaderCredential(input.clientId, "performance_client_id", { required });
    const clientSecret = normalizeHeaderCredential(input.clientSecret, "performance_client_secret", { required });
    if ((clientId && !clientSecret) || (!clientId && clientSecret)) {
      fail("INCOMPLETE_PERFORMANCE_CREDENTIALS", "Performance Client ID и Client Secret должны быть сохранены вместе.");
    }
    return Object.freeze({ clientId, clientSecret, present: Boolean(clientId && clientSecret) });
  }

  function sellerHeaders(credentials) {
    const normalized = normalizeSellerCredentials(credentials, { required: true });
    return Object.freeze({
      "Client-Id": normalized.clientId,
      "Api-Key": normalized.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    });
  }

  function performanceTokenRequest(credentials) {
    const normalized = normalizePerformanceCredentials(credentials, { required: true });
    return Object.freeze({
      url: "https://api-performance.ozon.ru/api/client/token",
      method: "POST",
      headers: Object.freeze({
        "Content-Type": "application/json",
        Accept: "application/json"
      }),
      body: JSON.stringify({
        client_id: normalized.clientId,
        client_secret: normalized.clientSecret,
        grant_type: "client_credentials"
      }),
      host_alias: "performance_auth"
    });
  }

  function performanceBearerHeaders(accessToken) {
    const token = normalizeHeaderCredential(accessToken, "performance_access_token", { required: true });
    return Object.freeze({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    });
  }

  function publicCredentialState(credentials) {
    const normalized = normalizeSellerCredentials(credentials, { required: false });
    return Object.freeze({
      seller_client_id_present: Boolean(normalized.clientId),
      seller_api_key_present: Boolean(normalized.apiKey),
      seller_credentials_present: normalized.present
    });
  }

  function publicPerformanceCredentialState(credentials) {
    const normalized = normalizePerformanceCredentials(credentials, { required: false });
    return Object.freeze({
      performance_client_id_present: Boolean(normalized.clientId),
      performance_client_secret_present: Boolean(normalized.clientSecret),
      performance_credentials_present: normalized.present
    });
  }

  globalThis.OzonCredentials = Object.freeze({
    normalizeSellerCredentials,
    normalizePerformanceCredentials,
    sellerHeaders,
    performanceTokenRequest,
    performanceBearerHeaders,
    publicCredentialState,
    publicPerformanceCredentialState
  });
})();

/* END shared/ozon_credentials.js */

/* BEGIN shared/provider_transport_core.js */
(() => {
  "use strict";
  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function headerValue(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") return headers.get(name);
    const target = String(name).toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
      if (String(key).toLowerCase() === target) return String(value);
    }
    return null;
  }

  function safeResponseMeta(response) {
    return Object.freeze({
      content_type: headerValue(response?.headers, "content-type"),
      content_length: headerValue(response?.headers, "content-length"),
      request_id: headerValue(response?.headers, "x-request-id") || headerValue(response?.headers, "request-id"),
      retry_after: headerValue(response?.headers, "retry-after")
    });
  }

  function normalizedContentType(value) {
    return String(value || "").split(";", 1)[0].trim().toLowerCase();
  }

  function bytesToBase64(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "";
    for (let index = 0; index < source.length; index += 3) {
      const a = source[index];
      const b = index + 1 < source.length ? source[index + 1] : 0;
      const c = index + 2 < source.length ? source[index + 2] : 0;
      const triple = (a << 16) | (b << 8) | c;
      out += alphabet[(triple >> 18) & 63];
      out += alphabet[(triple >> 12) & 63];
      out += index + 1 < source.length ? alphabet[(triple >> 6) & 63] : "=";
      out += index + 2 < source.length ? alphabet[triple & 63] : "=";
    }
    return out;
  }

  async function readResponse(response, { preserveBytes = false } = {}) {
    if (!response) fail("EMPTY_RESPONSE", "Provider response отсутствует.");
    const decoder = new TextDecoder();
    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();
      const chunks = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || []);
        total += bytes.byteLength;
        chunks.push(bytes);
      }
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return preserveBytes
        ? Object.freeze({ rawText: "", bytes: merged, byteLength: total })
        : Object.freeze({ rawText: decoder.decode(merged), byteLength: total });
    }
    if (preserveBytes && typeof response.arrayBuffer === "function") {
      const merged = new Uint8Array(await response.arrayBuffer());
      return Object.freeze({ rawText: "", bytes: merged, byteLength: merged.byteLength });
    }
    const rawText = typeof response.text === "function" ? await response.text() : String(response.body ?? "");
    const encoded = new TextEncoder().encode(rawText);
    return preserveBytes
      ? Object.freeze({ rawText: "", bytes: encoded, byteLength: encoded.byteLength })
      : Object.freeze({ rawText, byteLength: encoded.byteLength });
  }

  async function executeJsonOnce({ fetchImpl, request, now = () => Date.now() }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    if (!request || typeof request !== "object") fail("INVALID_REQUEST", "Trusted request object обязателен.");
    if (!/^https:\/\/api-seller\.ozon\.ru\//.test(String(request.url || ""))) fail("UNTRUSTED_REQUEST_HOST", "Разрешён только fixed Ozon Seller API host.");
    if (!/^(GET|POST)$/.test(String(request.method || ""))) fail("UNTRUSTED_REQUEST_METHOD", "Разрешены только заранее зафиксированные GET/POST read methods.");

    const started = now();
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
    let parsed = null;
    let rawText = received.rawText || "";
    if (binarySuccess) {
      const expected = Array.isArray(request.response_content_types)
        ? request.response_content_types.map(normalizedContentType).filter(Boolean)
        : [];
      const actual = normalizedContentType(headerValue(response?.headers, "content-type"));
      if (expected.length && actual && !expected.includes(actual)) {
        const error = new Error(`Ozon Seller API вернул неожиданный binary content-type: ${actual}.`);
        error.code = "PROVIDER_BINARY_CONTENT_TYPE_MISMATCH";
        error.http_status = Number(response.status || 0);
        error.external_request_executed = true;
        throw error;
      }
      parsed = Object.freeze({
        content_type: actual || expected[0] || "application/octet-stream",
        byte_length: received.byteLength,
        encoding: "base64",
        file_content_base64: bytesToBase64(received.bytes)
      });
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); }
      catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0),
      ok: Boolean(response.ok),
      rawText,
      parsed,
      byteLength: received.byteLength,
      elapsedMs: Math.max(0, Number(now() - started) || 0),
      responseMeta: safeResponseMeta(response)
    });
  }


  function normalizeTrustedReportFileUrl(rawUrl) {
    let parsed;
    try { parsed = new URL(String(rawUrl || "")); }
    catch (_) { fail("UNTRUSTED_REPORT_FILE_URL", "Report file URL от Ozon некорректен."); }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) fail("UNTRUSTED_REPORT_FILE_URL", "Report file URL должен быть HTTPS без credentials/нестандартного порта.");
    const host = String(parsed.hostname || "").toLowerCase();
    const allowed = host === "ozone.ru" || host.endsWith(".ozone.ru") || host === "ozon.ru" || host.endsWith(".ozon.ru");
    if (!allowed) fail("UNTRUSTED_REPORT_FILE_HOST", `Неподдерживаемый Ozon report file host: ${host || "empty"}.`);
    return parsed.toString();
  }



  function reportBase64ToBytes(value) {
    const input = String(value || "").replace(/\s+/g, "");
    if (!input || input.length % 4 !== 0) fail("INVALID_BASE64", "Некорректный base64 документ.");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = new Map([...alphabet].map((ch, index) => [ch, index]));
    const out = [];
    for (let i = 0; i < input.length; i += 4) {
      const a = lookup.get(input[i]), b = lookup.get(input[i + 1]);
      const c = input[i + 2] === "=" ? 0 : lookup.get(input[i + 2]);
      const d = input[i + 3] === "=" ? 0 : lookup.get(input[i + 3]);
      if ([a,b,c,d].some((v) => v === undefined)) fail("INVALID_BASE64", "Некорректный base64 документ.");
      const triple = (a << 18) | (b << 12) | (c << 6) | d;
      out.push((triple >> 16) & 255);
      if (input[i + 2] !== "=") out.push((triple >> 8) & 255);
      if (input[i + 3] !== "=") out.push(triple & 255);
    }
    return new Uint8Array(out);
  }

  function reportLatin1(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    let out = "";
    const chunk = 0x4000;
    for (let i = 0; i < source.length; i += chunk) out += String.fromCharCode(...source.subarray(i, Math.min(source.length, i + chunk)));
    return out;
  }

  function pdfDecodeLiteral(raw) {
    let out = "";
    const text = String(raw || "");
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] !== "\\") { out += text[i]; continue; }
      i += 1;
      if (i >= text.length) break;
      const ch = text[i];
      const mapped = { n:"\n", r:"\r", t:"\t", b:"\b", f:"\f", "(":"(", ")":")", "\\":"\\" }[ch];
      if (mapped !== undefined) { out += mapped; continue; }
      if (/[0-7]/.test(ch)) {
        let oct = ch;
        for (let j = 0; j < 2 && /[0-7]/.test(text[i + 1] || ""); j += 1) { i += 1; oct += text[i]; }
        out += String.fromCharCode(parseInt(oct, 8));
        continue;
      }
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      else if (ch !== "\r" && ch !== "\n") out += ch;
    }
    return out;
  }

  function pdfDecodeHex(raw) {
    let hex = String(raw || "").replace(/\s+/g, "");
    if (hex.length % 2) hex += "0";
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      let out = "";
      for (let i = 2; i + 1 < bytes.length; i += 2) out += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
      return out;
    }
    return reportLatin1(bytes);
  }

  function pdfExtractTextOperators(content) {
    const text = String(content || "");
    const pieces = [];
    for (const match of text.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj\b/g)) pieces.push(pdfDecodeLiteral(match[1]));
    for (const match of text.matchAll(/<([0-9A-Fa-f\s]+)>\s*Tj\b/g)) pieces.push(pdfDecodeHex(match[1]));
    for (const arrayMatch of text.matchAll(/\[([\s\S]*?)\]\s*TJ\b/g)) {
      let joined = "";
      for (const literal of arrayMatch[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g)) joined += pdfDecodeLiteral(literal[1]);
      for (const hex of arrayMatch[1].matchAll(/<([0-9A-Fa-f\s]+)>/g)) joined += pdfDecodeHex(hex[1]);
      if (joined) pieces.push(joined);
    }
    return pieces.map((value) => String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, " ").trim()).filter(Boolean);
  }

  async function parsePdfDocumentBytes(bytes, { maxTextChars = 30000 } = {}) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const latin = reportLatin1(source);
    const pieces = pdfExtractTextOperators(latin);
    const streamPattern = /<<([\s\S]{0,4096}?)>>\s*stream\r?\n/g;
    let match;
    while ((match = streamPattern.exec(latin)) !== null) {
      const dataStart = streamPattern.lastIndex;
      const end = latin.indexOf("endstream", dataStart);
      if (end < 0) break;
      let dataEnd = end;
      while (dataEnd > dataStart && (latin[dataEnd - 1] === "\r" || latin[dataEnd - 1] === "\n")) dataEnd -= 1;
      if (/\/FlateDecode\b/.test(match[1])) {
        try {
          if (typeof DecompressionStream !== "function") fail("PDF_DEFLATE_UNAVAILABLE", "Runtime не поддерживает PDF FlateDecode.");
          const compressed = source.slice(dataStart, dataEnd);
          const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate"));
          const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
          pieces.push(...pdfExtractTextOperators(reportLatin1(inflated)));
        } catch (_) {
          // Some PDFs use predictors/font encodings; fail-soft on text extraction while preserving document metadata.
        }
      } else pieces.push(...pdfExtractTextOperators(latin.slice(dataStart, dataEnd)));
      streamPattern.lastIndex = end + 9;
    }
    const unique = [];
    const seen = new Set();
    for (const piece of pieces) {
      const normalized = piece.replace(/\s+/g, " ").trim();
      if (normalized && !seen.has(normalized)) { seen.add(normalized); unique.push(normalized); }
    }
    const joined = unique.join("\n");
    return Object.freeze({
      format: "pdf",
      text_extract_available: Boolean(joined),
      text_extract: joined.slice(0, maxTextChars),
      text_truncated: joined.length > maxTextChars
    });
  }

  function reportXmlDecode(value) {
    return String(value || "")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }

  function reportXmlAttr(tag, name) {
    const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(tag || "").match(new RegExp(`(?:\\s|^)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    return match ? reportXmlDecode(match[1] ?? match[2] ?? "") : null;
  }

  function reportColumnIndex(cellRef) {
    const letters = String(cellRef || "").match(/^[A-Za-z]+/);
    if (!letters) return null;
    let value = 0;
    for (const ch of letters[0].toUpperCase()) value = value * 26 + (ch.charCodeAt(0) - 64);
    return value - 1;
  }

  function reportHeaders(values) {
    const seen = new Map();
    return values.map((value, index) => {
      let base = String(value ?? "").trim();
      if (!base) base = `column_${index + 1}`;
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      return count === 1 ? base : `${base}_${count}`;
    });
  }

  function parseDelimitedReportText(rawText, { offset = 0, limit = 200, name = "Report" } = {}) {
    const text = String(rawText || "").replace(/^\uFEFF/, "");
    const firstLine = text.split(/\r?\n/, 1)[0] || "";
    const candidates = [";", ",", "\t"];
    let delimiter = ";";
    let best = -1;
    for (const candidate of candidates) {
      let count = 0, quoted = false;
      for (let i = 0; i < firstLine.length; i += 1) {
        const ch = firstLine[i];
        if (ch === '"') {
          if (quoted && firstLine[i + 1] === '"') i += 1;
          else quoted = !quoted;
        } else if (!quoted && ch === candidate) count += 1;
      }
      if (count > best) { best = count; delimiter = candidate; }
    }
    const parsedRows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === delimiter) { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field.replace(/\r$/, "")); parsedRows.push(row); row = []; field = ""; }
      else field += ch;
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, "")); parsedRows.push(row); }
    while (parsedRows.length && parsedRows[parsedRows.length - 1].every((v) => String(v).trim() === "")) parsedRows.pop();
    const headerIndex = parsedRows.findIndex((r) => r.some((v) => String(v).trim() !== ""));
    if (headerIndex < 0) return Object.freeze({ name, columns: [], row_count: 0, offset, limit, rows: [], has_more: false, next_offset: null });
    const columns = reportHeaders(parsedRows[headerIndex]);
    const data = parsedRows.slice(headerIndex + 1).filter((r) => r.some((v) => String(v).trim() !== ""));
    const boundedOffset = Math.min(offset, data.length);
    const selected = data.slice(boundedOffset, boundedOffset + limit).map((r) => {
      const out = Array(columns.length).fill("");
      for (let i = 0; i < Math.min(columns.length, r.length); i += 1) out[i] = r[i];
      return out;
    });
    const next = boundedOffset + selected.length;
    return Object.freeze({ name, columns, row_count: data.length, offset: boundedOffset, limit, rows: selected, has_more: next < data.length, next_offset: next < data.length ? next : null });
  }

  function zipView(bytes) { return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); }
  function zipU16(view, offset) { return view.getUint16(offset, true); }
  function zipU32(view, offset) { return view.getUint32(offset, true); }

  function createReportZipReader(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const view = zipView(source);
    let eocd = -1;
    const minimum = Math.max(0, source.length - 65557);
    for (let pos = source.length - 22; pos >= minimum; pos -= 1) {
      if (zipU32(view, pos) === 0x06054b50) { eocd = pos; break; }
    }
    if (eocd < 0) fail("REPORT_ZIP_INVALID", "ZIP/XLSX: EOCD не найден.");
    const total = zipU16(view, eocd + 10);
    const centralOffset = zipU32(view, eocd + 16);
    if (total === 0xffff || centralOffset === 0xffffffff) fail("REPORT_ZIP64_UNSUPPORTED", "ZIP64 отчёты пока не поддерживаются.");
    const entries = new Map();
    let pos = centralOffset;
    const decoder = new TextDecoder("utf-8");
    for (let index = 0; index < total; index += 1) {
      if (pos + 46 > source.length || zipU32(view, pos) !== 0x02014b50) fail("REPORT_ZIP_INVALID", "ZIP central directory повреждён.");
      const flags = zipU16(view, pos + 8);
      const method = zipU16(view, pos + 10);
      const compressedSize = zipU32(view, pos + 20);
      const uncompressedSize = zipU32(view, pos + 24);
      const nameLength = zipU16(view, pos + 28);
      const extraLength = zipU16(view, pos + 30);
      const commentLength = zipU16(view, pos + 32);
      const localOffset = zipU32(view, pos + 42);
      if ((flags & 1) !== 0) fail("REPORT_ZIP_ENCRYPTED_UNSUPPORTED", "Зашифрованный ZIP не поддерживается.");
      if ([compressedSize, uncompressedSize, localOffset].some((v) => v === 0xffffffff)) fail("REPORT_ZIP64_UNSUPPORTED", "ZIP64 отчёты пока не поддерживаются.");
      const nameStart = pos + 46;
      const name = decoder.decode(source.slice(nameStart, nameStart + nameLength));
      entries.set(name.replace(/\\/g, "/"), Object.freeze({ method, compressedSize, uncompressedSize, localOffset }));
      pos = nameStart + nameLength + extraLength + commentLength;
    }
    async function get(name) {
      const meta = entries.get(String(name || "").replace(/^\//, ""));
      if (!meta) return null;
      const local = meta.localOffset;
      if (local + 30 > source.length || zipU32(view, local) !== 0x04034b50) fail("REPORT_ZIP_INVALID", `ZIP local header повреждён: ${name}`);
      const nameLength = zipU16(view, local + 26);
      const extraLength = zipU16(view, local + 28);
      const dataStart = local + 30 + nameLength + extraLength;
      const compressed = source.slice(dataStart, dataStart + meta.compressedSize);
      if (meta.method === 0) return compressed;
      if (meta.method !== 8) fail("REPORT_ZIP_METHOD_UNSUPPORTED", `ZIP compression method ${meta.method} не поддерживается.`);
      if (typeof DecompressionStream !== "function") fail("REPORT_DEFLATE_UNAVAILABLE", "Runtime не поддерживает DecompressionStream(deflate-raw).");
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      const output = new Uint8Array(await new Response(stream).arrayBuffer());
      if (meta.uncompressedSize && output.byteLength !== meta.uncompressedSize) fail("REPORT_ZIP_SIZE_MISMATCH", `ZIP entry size mismatch: ${name}`);
      return output;
    }
    return Object.freeze({ names: Object.freeze([...entries.keys()]), get });
  }

  function reportJoinZipPath(base, target) {
    const parts = String(base || "").split("/").filter(Boolean);
    for (const piece of String(target || "").replace(/^\//, "").split("/")) {
      if (!piece || piece === ".") continue;
      if (piece === "..") parts.pop(); else parts.push(piece);
    }
    return parts.join("/");
  }

  function reportParseSharedStrings(xml) {
    const values = [];
    for (const match of String(xml || "").matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)) {
      let value = "";
      for (const text of match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)) value += reportXmlDecode(text[1]);
      values.push(value);
    }
    return values;
  }

  function reportParseSheet(xml, sharedStrings, name, { offset = 0, limit = 200 } = {}) {
    const physicalRows = [];
    for (const rowMatch of String(xml || "").matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/gi)) {
      const rowNumber = Number(reportXmlAttr(rowMatch[1], "r")) || physicalRows.length + 1;
      const values = [];
      for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
        const attrs = cellMatch[1], body = cellMatch[2];
        const index = reportColumnIndex(reportXmlAttr(attrs, "r"));
        if (index === null) continue;
        const type = reportXmlAttr(attrs, "t") || "n";
        let raw = "";
        if (type === "inlineStr") {
          for (const text of body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)) raw += reportXmlDecode(text[1]);
        } else {
          const valueMatch = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
          raw = valueMatch ? reportXmlDecode(valueMatch[1]) : "";
        }
        let value = raw;
        if (type === "s") value = sharedStrings[Number(raw)] ?? raw;
        else if (type === "b") value = raw === "1";
        else if ((type === "n" || !type) && raw !== "" && Number.isFinite(Number(raw))) value = Number(raw);
        values[index] = value;
      }
      while (values.length && values[values.length - 1] === undefined) values.pop();
      for (let i = 0; i < values.length; i += 1) if (values[i] === undefined) values[i] = "";
      if (values.some((value) => String(value ?? "").trim() !== "")) physicalRows.push({ row_number: rowNumber, values });
    }
    if (!physicalRows.length) return Object.freeze({ name, columns: [], row_count: 0, offset, limit, rows: [], row_numbers: [], has_more: false, next_offset: null });
    const columns = reportHeaders(physicalRows[0].values);
    const data = physicalRows.slice(1);
    const boundedOffset = Math.min(offset, data.length);
    const page = data.slice(boundedOffset, boundedOffset + limit);
    const rows = page.map(({ values }) => {
      const out = Array(columns.length).fill("");
      for (let i = 0; i < Math.min(columns.length, values.length); i += 1) out[i] = values[i];
      return out;
    });
    const next = boundedOffset + rows.length;
    return Object.freeze({ name, columns, row_count: data.length, offset: boundedOffset, limit, rows, row_numbers: page.map((r) => r.row_number), has_more: next < data.length, next_offset: next < data.length ? next : null });
  }

  async function parseXlsxReportBytes(bytes, options = {}) {
    const reader = createReportZipReader(bytes);
    const workbookBytes = await reader.get("xl/workbook.xml");
    const relsBytes = await reader.get("xl/_rels/workbook.xml.rels");
    if (!workbookBytes || !relsBytes) fail("REPORT_XLSX_INVALID", "XLSX workbook metadata отсутствует.");
    const decoder = new TextDecoder("utf-8");
    const workbookXml = decoder.decode(workbookBytes);
    const relsXml = decoder.decode(relsBytes);
    const relationships = new Map();
    for (const match of relsXml.matchAll(/<Relationship\b([^>]*)\/?\s*>/gi)) {
      const id = reportXmlAttr(match[1], "Id"), target = reportXmlAttr(match[1], "Target");
      if (id && target) relationships.set(id, reportJoinZipPath("xl", target));
    }
    const sheets = [];
    for (const match of workbookXml.matchAll(/<sheet\b([^>]*)\/?\s*>/gi)) {
      const name = reportXmlAttr(match[1], "name") || `Sheet${sheets.length + 1}`;
      const rid = reportXmlAttr(match[1], "r:id");
      const target = rid ? relationships.get(rid) : null;
      if (target) sheets.push({ name, target });
    }
    if (!sheets.length) fail("REPORT_XLSX_INVALID", "XLSX worksheets отсутствуют.");
    const requested = options.sheet == null ? sheets[0] : sheets.find((item) => item.name === String(options.sheet));
    if (!requested) fail("REPORT_SHEET_NOT_FOUND", `XLSX sheet не найден: ${options.sheet}`);
    const sharedBytes = await reader.get("xl/sharedStrings.xml");
    const shared = sharedBytes ? reportParseSharedStrings(decoder.decode(sharedBytes)) : [];
    const sheetBytes = await reader.get(requested.target);
    if (!sheetBytes) fail("REPORT_XLSX_INVALID", `XLSX sheet entry отсутствует: ${requested.target}`);
    const sheet = reportParseSheet(decoder.decode(sheetBytes), shared, requested.name, options);
    return Object.freeze({ format: "xlsx", available_sheets: Object.freeze(sheets.map((item) => item.name)), sheet });
  }

  async function parseAiReadableReportBytes(bytes, { contentType = "", pathname = "", sheet = null, offset = 0, limit = 200 } = {}) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const ct = normalizedContentType(contentType);
    const lower = String(pathname || "").toLowerCase();
    const zipMagic = source.length >= 4 && source[0] === 0x50 && source[1] === 0x4b && source[2] === 0x03 && source[3] === 0x04;
    if (ct === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || lower.endsWith(".xlsx")) {
      return await parseXlsxReportBytes(source, { sheet, offset, limit });
    }
    if (["text/csv", "application/csv", "text/plain", "application/json"].includes(ct) || lower.endsWith(".csv") || lower.endsWith(".txt")) {
      const text = new TextDecoder("utf-8").decode(source);
      return Object.freeze({ format: "csv", available_sheets: Object.freeze(["Report"]), sheet: parseDelimitedReportText(text, { offset, limit, name: "Report" }) });
    }
    if (zipMagic || ct === "application/zip" || lower.endsWith(".zip")) {
      const reader = createReportZipReader(source);
      if (reader.names.includes("xl/workbook.xml")) return await parseXlsxReportBytes(source, { sheet, offset, limit });
      const csvName = reader.names.find((name) => /\.(csv|txt)$/i.test(name));
      if (csvName) {
        const csv = await reader.get(csvName);
        return Object.freeze({ format: "zip_csv", archive_entry: csvName, available_sheets: Object.freeze([csvName]), sheet: parseDelimitedReportText(new TextDecoder("utf-8").decode(csv), { offset, limit, name: csvName }) });
      }
      fail("REPORT_ZIP_CONTENT_UNSUPPORTED", "ZIP отчёт не содержит поддерживаемый XLSX/CSV файл.");
    }
    if (ct === "application/pdf" || lower.endsWith(".pdf")) return await parsePdfDocumentBytes(source);
    if (ct === "application/vnd.ms-excel" || lower.endsWith(".xls")) fail("REPORT_XLS_BINARY_UNSUPPORTED", "Старый XLS binary формат не поддерживается; ожидается XLSX из report_info.");
    fail("REPORT_FILE_FORMAT_UNSUPPORTED", `Неподдерживаемый формат отчёта: ${ct || lower || "unknown"}.`);
  }

  async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024, parseOptions = {} }) {
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
    const received = await readResponse(response, { preserveBytes: Boolean(response.ok) });
    if (received.byteLength > maxBytes) {
      const error = new Error(`Report file превышает лимит bridge ${maxBytes} bytes.`);
      error.code = "REPORT_FILE_TOO_LARGE";
      error.http_status = Number(response.status || 0);
      error.external_request_executed = true;
      throw error;
    }
    const contentType = normalizedContentType(headerValue(response?.headers, "content-type"));
    let parsed = null;
    let rawText = received.rawText || "";
    if (response.ok) {
      const pathname = (() => { try { return new URL(trustedUrl).pathname.toLowerCase(); } catch (_) { return ""; } })();
      const report = await parseAiReadableReportBytes(received.bytes || new Uint8Array(), {
        contentType, pathname, sheet: parseOptions.sheet ?? null, offset: Number(parseOptions.offset || 0), limit: Number(parseOptions.limit || 200)
      });
      parsed = Object.freeze({ content_type: contentType || "application/octet-stream", byte_length: received.byteLength, ...report });
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); } catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0), ok: Boolean(response.ok), rawText, parsed,
      byteLength: received.byteLength, elapsedMs: Math.max(0, Number(now() - started) || 0), responseMeta: safeResponseMeta(response)
    });
  }

  async function executePerformanceJsonOnce({ fetchImpl, request, now = () => Date.now() }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    if (!request || typeof request !== "object") fail("INVALID_REQUEST", "Trusted request object обязателен.");
    if (!/^https:\/\/api-performance\.ozon\.ru\//.test(String(request.url || ""))) fail("UNTRUSTED_REQUEST_HOST", "Разрешён только fixed Ozon Performance API host.");
    if (!/^(GET|POST)$/.test(String(request.method || ""))) fail("UNTRUSTED_REQUEST_METHOD", "Performance bridge допускает только заранее зафиксированные GET/POST read/auth methods.");

    const started = now();
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
    let parsed = null;
    let rawText = received.rawText || "";
    if (binarySuccess) {
      const expected = Array.isArray(request.response_content_types)
        ? request.response_content_types.map(normalizedContentType).filter(Boolean)
        : [];
      const actual = normalizedContentType(headerValue(response?.headers, "content-type"));
      if (expected.length && actual && !expected.includes(actual)) {
        const error = new Error(`Ozon Performance API вернул неожиданный binary content-type: ${actual}.`);
        error.code = "PROVIDER_BINARY_CONTENT_TYPE_MISMATCH";
        error.http_status = Number(response.status || 0);
        error.external_request_executed = true;
        throw error;
      }
      parsed = Object.freeze({
        content_type: actual || expected[0] || "application/octet-stream",
        byte_length: received.byteLength,
        encoding: "base64",
        file_content_base64: bytesToBase64(received.bytes)
      });
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); }
      catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0),
      ok: Boolean(response.ok),
      rawText,
      parsed,
      byteLength: received.byteLength,
      elapsedMs: Math.max(0, Number(now() - started) || 0),
      responseMeta: safeResponseMeta(response)
    });
  }

  globalThis.ProviderTransportCore = Object.freeze({
    readResponse,
    normalizeTrustedReportFileUrl,
    reportBase64ToBytes,
    parsePdfDocumentBytes,
    parseAiReadableReportBytes,
    executeTrustedReportFileOnce,
    executeJsonOnce,
    executePerformanceJsonOnce
  });
})();

/* END shared/provider_transport_core.js */

/* BEGIN shared/ozon_contract.js */
(() => {
  "use strict";
  const FORBIDDEN_TRANSPORT_KEYS = new Set([
    "url", "uri", "host", "hostname", "method", "headers", "authorization",
    "api-key", "api_key", "apikey", "client-id", "client_id", "clientid",
    "client-secret", "client_secret", "clientsecret", "token", "access-token", "access_token"
  ]);
  const SENSITIVE_RESULT_KEYS = [
    /phone/i, /email/i, /addressee/i, /recipient/i, /customer/i,
    /passport/i, /first[_-]?name/i, /last[_-]?name/i, /middle[_-]?name/i,
    /full[_-]?name/i, /^fio$/i, /driver[_-]?name/i, /vehicle[_-]?number/i,
    /digital[_-]?codes?/i, /authorization/i, /api[_-]?key/i,
    /client[_-]?secret/i, /access[_-]?token/i, /^token$/i
  ];

  const SELLER_SUBSCRIPTION_TYPES = deepFreeze([
    "UNKNOWN", "UNSPECIFIED", "PREMIUM", "PREMIUM_LITE", "PREMIUM_PLUS", "PREMIUM_PRO"
  ]);
  const ANALYTICS_UNIVERSAL_METRICS = deepFreeze(["revenue", "ordered_units"]);
  const ANALYTICS_RESTRICTED_METRICS = deepFreeze([
    "unknown_metric", "hits_view_search", "hits_view_pdp", "hits_view",
    "hits_tocart_search", "hits_tocart_pdp", "hits_tocart",
    "session_view_search", "session_view_pdp", "session_view",
    "conv_tocart_search", "conv_tocart_pdp", "conv_tocart",
    "returns", "cancellations", "delivered_units", "position_category"
  ]);
  const ANALYTICS_METRICS = deepFreeze([...ANALYTICS_UNIVERSAL_METRICS, ...ANALYTICS_RESTRICTED_METRICS]);
  const ANALYTICS_UNIVERSAL_DIMENSIONS = deepFreeze(["unknownDimension", "sku", "spu", "day", "week", "month"]);
  const ANALYTICS_RESTRICTED_DIMENSIONS = deepFreeze(["year", "category1", "category2", "brand", "modelID", "descriptionType"]);
  const ANALYTICS_DIMENSIONS = deepFreeze([...ANALYTICS_UNIVERSAL_DIMENSIONS, ...ANALYTICS_RESTRICTED_DIMENSIONS]);
  const PRODUCT_QUERY_SORT_BY = deepFreeze(["BY_SEARCHES", "BY_VIEWS", "BY_POSITION", "BY_CONVERSION", "BY_GMV"]);
  const PRODUCT_QUERY_SORT_DIR = deepFreeze(["DESCENDING", "ASCENDING"]);
  const PRODUCT_VISIBILITY = deepFreeze([
    "ALL", "VISIBLE", "INVISIBLE", "EMPTY_STOCK", "NOT_MODERATED", "MODERATED", "DISABLED", "STATE_FAILED",
    "READY_TO_SUPPLY", "VALIDATION_STATE_PENDING", "VALIDATION_STATE_FAIL", "VALIDATION_STATE_SUCCESS", "TO_SUPPLY", "IN_SALE",
    "REMOVED_FROM_SALE", "OVERPRICED", "CRITICALLY_OVERPRICED", "EMPTY_BARCODE", "BARCODE_EXISTS", "QUARANTINE", "ARCHIVED",
    "OVERPRICED_WITH_STOCK", "PARTIAL_APPROVED", "AUTO_ARCHIVED", "MANUAL_ARCHIVED", "SEASONAL_AUTO_ARCHIVED", "VISIBLE_WITH_FBO_STOCK"
  ]);
  const DESCRIPTION_CATEGORY_LANGUAGES = Object.freeze(["DEFAULT", "RU", "EN", "TR", "ZH_HANS"]);
  const DELIVERY_METHOD_SORT_DIR = Object.freeze(["ASC", "DESC"]);
  const DELIVERY_METHOD_STATUSES = Object.freeze(["NEW", "EDITED", "ACTIVE", "DISABLED", "WAITING", "BROKEN"]);
  const SELLER_ACTION_TYPES = deepFreeze([
    "DISCOUNT", "VOUCHER_DISCOUNT", "DISCOUNT_WITH_CONDITION", "INSTALLMENT",
    "INDIVIDUAL_DISCOUNT_BY_PRODUCTS", "OZON_ACCOUNT_DISCOUNT", "MULTI_LEVEL_DISCOUNT_ON_AMOUNT"
  ]);
  const SELLER_ACTION_STATUSES = deepFreeze(["ACTIVE", "ENDED", "PLANNED", "PAUSED"]);
  const OZON_WAREHOUSE_TYPES = deepFreeze([
    "FULL_FILLMENT", "FULL_FILLMENT_RETURNS", "FULL_FILLMENT_DEFECT", "EXPRESS_DARK_STORE", "CROSS_DOCK", "SORTING_CENTER",
    "PHARMACY", "DISTRIBUTION_CENTER", "ORDERS_RECEIVING_POINT", "OUTSOURCE_FF", "B2B", "EXTERNAL_FF"
  ]);
  const STOCK_ITEM_TAGS = deepFreeze(["ITEM_ATTRIBUTE_NONE", "ECONOM", "NOVEL", "DISCOUNT", "FBS_RETURN", "SUPER", "MARKABLE"]);
  const STOCK_PLACEMENT_ZONES = deepFreeze(["PLACEMENT_ZONE_NONE", "CLOSED_ZONE", "DANGEROUS_GOOD", "PRODUCTS_PLUS_17", "SORT", "NON_SORT_MEZ", "OVERSIZE", "JEWELRY", "UNRESOLVED"]);
  const STOCK_TURNOVER_GRADES = deepFreeze(["TURNOVER_GRADE_NONE", "DEFICIT", "POPULAR", "ACTUAL", "SURPLUS", "NO_SALES", "WAS_NO_SALES", "RESTRICTED_NO_SALES", "COLLECTING_DATA", "WAITING_FOR_SUPPLY", "WAS_DEFICIT", "WAS_POPULAR", "WAS_ACTUAL", "WAS_SURPLUS"]);
  const STOCK_ON_WAREHOUSE_TYPES = deepFreeze(["ALL", "EXPRESS_DARK_STORE", "NOT_EXPRESS_DARK_STORE"]);
  const FILTER_OPS = deepFreeze(["EQ", "GT", "GTE", "LT", "LTE"]);
  const SUPPLY_ORDER_STATES = deepFreeze([
    "DATA_FILLING", "READY_TO_SUPPLY", "ACCEPTED_AT_SUPPLY_WAREHOUSE", "IN_TRANSIT",
    "ACCEPTANCE_AT_STORAGE_WAREHOUSE", "REPORTS_CONFIRMATION_AWAITING", "REPORT_REJECTED",
    "COMPLETED", "REJECTED_AT_SUPPLY_WAREHOUSE", "CANCELLED", "OVERDUE"
  ]);
  const SUPPLY_ORDER_SORT_BY = deepFreeze(["ORDER_CREATION", "ORDER_STATE_UPDATED_AT", "TIMESLOT_FROM_UTC", "TIMESLOT_FROM_LOCAL"]);
  const SUPPLY_ORDER_SORT_DIR = deepFreeze(["ASC", "DESC"]);
  const SUPPLY_ORDER_TIMESLOT_FILTER_TYPES = deepFreeze(["BY_LOCAL_TIME", "BY_UTC_TIME"]);
  const SUPPLY_ORDER_BUNDLE_SORT_FIELDS = deepFreeze(["SKU", "NAME", "QUANTITY", "TOTAL_VOLUME_IN_LITRES"]);
  const REVIEW_ORDER_STATUSES = deepFreeze(["ALL", "DELIVERED", "CANCELLED"]);
  const REVIEW_STATUSES = deepFreeze(["ALL", "NEW", "VIEWED", "PROCESSED"]);
  const REVIEW_SORT_DIR = deepFreeze(["ASC", "DESC"]);
  const QUESTION_STATUSES = deepFreeze(["NEW", "ALL", "VIEWED", "PROCESSED", "UNPROCESSED"]);
  const QUESTION_SORT_DIR = deepFreeze(["DESC", "ASC"]);
  const SELLER_RATING_TYPES = deepFreeze([
    "rating_on_time", "rating_review_avg_score_total", "rating_ssl", "rating_on_time_supply_delivery",
    "rating_order_accuracy", "rating_on_time_supply_cancellation", "rating_reaction_time",
    "rating_average_response_time", "rating_replied_dialogs_ratio", "rating_general_indicator_fbs_rfbs",
    "rating_price_green", "rating_price_yellow", "rating_price_red", "rating_price_super"
  ]);

  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object") return value;
    const seen = new WeakSet();
    const stack = [value];
    while (stack.length) {
      const current = stack.pop();
      if (!current || typeof current !== "object" || seen.has(current)) continue;
      seen.add(current);
      Object.freeze(current);
      for (const child of Object.values(current)) {
        if (child && typeof child === "object" && !seen.has(child)) stack.push(child);
      }
    }
    return value;
  }

  function normalizedKey(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  }

  function cloneJsonPrimitive(value, path) {
    if (value === null || typeof value === "boolean" || typeof value === "string") return { primitive: true, value };
    if (typeof value === "number") {
      if (!Number.isFinite(value)) fail("INVALID_NUMBER", `${path}: число должно быть конечным.`);
      return { primitive: true, value };
    }
    return { primitive: false, value: null };
  }

  function sanitizeJsonValue(value, path = "params", { rejectTransportKeys = true } = {}) {
    const rootPrimitive = cloneJsonPrimitive(value, path);
    if (rootPrimitive.primitive) return rootPrimitive.value;
    if (!value || typeof value !== "object" || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)) {
      fail("INVALID_PARAMS_VALUE", `${path}: разрешены только JSON-значения.`);
    }

    const output = Array.isArray(value) ? [] : {};
    const seen = new WeakSet([value]);
    const stack = [{ source: value, target: output, path }];
    while (stack.length) {
      const frame = stack.pop();
      const entries = Array.isArray(frame.source)
        ? frame.source.map((child, index) => [index, child])
        : Object.entries(frame.source);
      for (const [key, child] of entries) {
        const childPath = Array.isArray(frame.source) ? `${frame.path}[${key}]` : `${frame.path}.${key}`;
        if (!Array.isArray(frame.source) && rejectTransportKeys && FORBIDDEN_TRANSPORT_KEYS.has(normalizedKey(key))) {
          fail("TRANSPORT_INJECTION_REJECTED", `${childPath}: transport/auth поле запрещено в команде.`);
        }
        const primitive = cloneJsonPrimitive(child, childPath);
        if (primitive.primitive) {
          frame.target[key] = primitive.value;
          continue;
        }
        if (!child || typeof child !== "object" || (!Array.isArray(child) && Object.getPrototypeOf(child) !== Object.prototype)) {
          fail("INVALID_PARAMS_VALUE", `${childPath}: разрешены только JSON-значения.`);
        }
        if (seen.has(child)) fail("INVALID_PARAMS_VALUE", `${childPath}: циклические/повторно-ссылающиеся объекты не являются JSON-деревом.`);
        seen.add(child);
        const childTarget = Array.isArray(child) ? [] : {};
        frame.target[key] = childTarget;
        stack.push({ source: child, target: childTarget, path: childPath });
      }
    }
    return output;
  }

  function resultPath(parentPath, key, parentIsArray) {
    if (parentIsArray) return `${parentPath}[]`;
    return parentPath ? `${parentPath}.${key}` : String(key);
  }

  function isAllowedOperationalAddress(operation, fieldPath) {
    if (operation === "supply_order_get") {
      return fieldPath === "orders[].dropoff_warehouse.address" || fieldPath === "orders[].supplies[].storage_warehouse.address";
    }
    if (operation === "supply_order_details") return fieldPath === "supplies[].storage_warehouse.address";
    if (operation === "seller_warehouse_list") return fieldPath === "warehouses[].address_info" || fieldPath === "warehouses[].address_info.address";
    if (operation === "ozon_warehouse_list" || operation === "fbo_seller_warehouse_list") return fieldPath === "warehouses[].address";
    if ([
      "warehouse_fbs_create_dropoff_list", "warehouse_fbs_update_dropoff_list",
      "warehouse_fbs_create_return_point_list", "warehouse_fbs_update_return_point_list"
    ].includes(operation)) return fieldPath === "points[].address";
    return false;
  }

  function shouldRedactResultField(operation, fieldPath, key) {
    if ((operation === "report_list" || operation === "report_info") && String(key) === "file") return true;
    if (["cargoes_label_get", "cargoes_label_transport_by_order_status", "cargoes_label_transport_status", "fbp_act_from_get", "fbp_act_to_get", "fbp_label_get", "posting_fbs_package_label_get_v1"].includes(operation) && ["file_url", "cdn_url", "label_url"].includes(String(key))) return true;
    if (operation === "posting_fbo_list") {
      if (/^postings\[\]\.legal_info(?:\.|$)/.test(fieldPath)) return true;
      if (/^postings\[\]\.products\[\]\.digital_codes$/.test(fieldPath)) return true;
    }
    if (operation === "posting_fbo_get") {
      if (/^result\.legal_info(?:\.|$)/.test(fieldPath)) return true;
      if (/^result\.products\[\]\.digital_codes$/.test(fieldPath)) return true;
    }
    if (operation === "supply_order_details") {
      if (/^vehicle\.value\.(?:driver_name|driver_phone|vehicle_number)$/.test(fieldPath)) return true;
    }
    if (/address/i.test(String(key))) return !isAllowedOperationalAddress(operation, fieldPath);
    return SENSITIVE_RESULT_KEYS.some((pattern) => pattern.test(String(key)));
  }

  function redactSensitiveResult(value, { operation = "" } = {}) {
    if (value === null || typeof value === "boolean" || typeof value === "string") return value;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (!value || typeof value !== "object") return String(value);

    const output = Array.isArray(value) ? [] : {};
    const seen = new WeakSet([value]);
    const stack = [{ source: value, target: output, path: "" }];
    while (stack.length) {
      const frame = stack.pop();
      if (Array.isArray(frame.source)) {
        for (let index = 0; index < frame.source.length; index += 1) {
          const child = frame.source[index];
          if (child === null || typeof child === "boolean" || typeof child === "string") {
            frame.target[index] = child;
          } else if (typeof child === "number") {
            frame.target[index] = Number.isFinite(child) ? child : null;
          } else if (!child || typeof child !== "object") {
            frame.target[index] = String(child);
          } else {
            if (seen.has(child)) fail("INVALID_RESULT_VALUE", `${frame.path}[]: циклический provider result.`);
            seen.add(child);
            const childTarget = Array.isArray(child) ? [] : {};
            frame.target[index] = childTarget;
            stack.push({ source: child, target: childTarget, path: `${frame.path}[]` });
          }
        }
        continue;
      }

      for (const [key, child] of Object.entries(frame.source)) {
        const fieldPath = resultPath(frame.path, key, false);
        if (shouldRedactResultField(operation, fieldPath, key)) {
          frame.target[key] = "[REDACTED]";
          continue;
        }
        if (child === null || typeof child === "boolean" || typeof child === "string") {
          frame.target[key] = child;
        } else if (typeof child === "number") {
          frame.target[key] = Number.isFinite(child) ? child : null;
        } else if (!child || typeof child !== "object") {
          frame.target[key] = String(child);
        } else {
          if (seen.has(child)) fail("INVALID_RESULT_VALUE", `${fieldPath}: циклический provider result.`);
          seen.add(child);
          const childTarget = Array.isArray(child) ? [] : {};
          frame.target[key] = childTarget;
          stack.push({ source: child, target: childTarget, path: fieldPath });
        }
      }
    }
    return output;
  }

  function requirePlainObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
      fail("INVALID_OPERATION_PARAMS", `${path} должен быть JSON-объектом.`);
    }
    return value;
  }

  function requireArray(value, path) {
    if (!Array.isArray(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть массивом.`);
    return value;
  }

  function requireInteger(value, path, { minimum = null, maximum = null } = {}) {
    if (!Number.isInteger(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть целым числом.`);
    if (minimum !== null && value < minimum) fail("OZON_LIMIT_VIOLATION", `${path}: минимум ${minimum} по контракту Ozon.`);
    if (maximum !== null && value > maximum) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} по контракту Ozon.`);
    return value;
  }

  function requireFiniteNumber(value, path) {
    if (typeof value !== "number" || !Number.isFinite(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть конечным числом.`);
    return value;
  }

  function assertMaxItems(value, path, maximum) {
    const array = requireArray(value, path);
    if (array.length > maximum) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} элементов по контракту Ozon.`);
    return array;
  }

  function requireField(object, field, path = "params") {
    if (!Object.prototype.hasOwnProperty.call(object, field)) fail("INVALID_OPERATION_PARAMS", `${path}.${field} обязателен по контракту Ozon.`);
    return object[field];
  }

  function requireString(value, path, { nonEmpty = true } = {}) {
    if (typeof value !== "string") fail("INVALID_OPERATION_PARAMS", `${path} должен быть строкой.`);
    const text = value.trim();
    if (nonEmpty && !text) fail("INVALID_OPERATION_PARAMS", `${path} не может быть пустой строкой.`);
    return value;
  }

  function requireEnum(value, path, allowed) {
    const text = requireString(value, path).trim();
    if (!allowed.includes(text)) fail("INVALID_OPERATION_PARAMS", `${path}: неподдерживаемое значение ${text}.`);
    return text;
  }

  function requireRfc3339DateTime(value, path) {
    const text = requireString(value, path).trim();
    const rfc3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!rfc3339.test(text) || Number.isNaN(Date.parse(text))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть RFC3339 date-time с часовым поясом.`);
    return text;
  }

  function requireAnalyticsDate(value, path) {
    const text = requireString(value, path).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const parsed = new Date(`${text}T00:00:00Z`);
      if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text) return text;
    }
    const rfc3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!rfc3339.test(text) || Number.isNaN(Date.parse(text))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть ISO date (YYYY-MM-DD) или RFC3339 date-time.`);
    return text;
  }

  function requireInt64String(value, path) {
    const text = requireString(value, path).trim();
    if (!/^-?\d+$/.test(text)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть строковым int64.`);
    try {
      const parsed = BigInt(text);
      if (parsed < -9223372036854775808n || parsed > 9223372036854775807n) fail("INVALID_OPERATION_PARAMS", `${path} выходит за диапазон int64.`);
    } catch (error) {
      if (error?.code) throw error;
      fail("INVALID_OPERATION_PARAMS", `${path} должен быть строковым int64.`);
    }
    return text;
  }

  function requireUint64String(value, path) {
    const text = requireString(value, path).trim();
    if (!/^\d+$/.test(text)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть строковым uint64.`);
    try {
      const parsed = BigInt(text);
      if (parsed < 0n || parsed > 18446744073709551615n) fail("INVALID_OPERATION_PARAMS", `${path} выходит за диапазон uint64.`);
    } catch (error) {
      if (error?.code) throw error;
      fail("INVALID_OPERATION_PARAMS", `${path} должен быть строковым uint64.`);
    }
    return text;
  }

  function requireSafeUint64Number(value, path) {
    if (!Number.isSafeInteger(value) || value < 0) fail("INVALID_OPERATION_PARAMS", `${path} должен быть безопасным неотрицательным целым числом для uint64.`);
    return value;
  }

  function validateEnumArray(value, path, allowed) {
    const array = requireArray(value, path);
    for (let index = 0; index < array.length; index += 1) requireEnum(array[index], `${path}[${index}]`, allowed);
    return array;
  }

  function validateSkuArray(value, path, maximum) {
    const array = assertMaxItems(value, path, maximum);
    for (let index = 0; index < array.length; index += 1) requireInt64String(array[index], `${path}[${index}]`);
    return array;
  }

  function validateIdentifierArray(value, path, { minimum = null, maximum = null, int64 = false } = {}) {
    const array = requireArray(value, path);
    if (minimum !== null && array.length < minimum) fail("OZON_LIMIT_VIOLATION", `${path}: минимум ${minimum} элементов по контракту Ozon.`);
    if (maximum !== null && array.length > maximum) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} элементов по контракту Ozon.`);
    for (let index = 0; index < array.length; index += 1) {
      if (int64) requireInt64String(array[index], `${path}[${index}]`);
      else requireString(array[index], `${path}[${index}]`);
    }
    return array;
  }

  function normalizeSellerProductListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "last_id", "limit"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["offer_id", "product_id", "skus", "visibility"], "params.filter");
      const identifierFields = ["offer_id", "product_id", "skus"].filter((field) => Object.prototype.hasOwnProperty.call(filter, field));
      if (identifierFields.length > 1) fail("INVALID_OPERATION_PARAMS", "params.filter: для seller_product_list разрешена только одна группа идентификаторов: offer_id, product_id или skus.");
      if (Object.prototype.hasOwnProperty.call(filter, "offer_id")) validateIdentifierArray(filter.offer_id, "params.filter.offer_id", { minimum: 1, maximum: 1000 });
      if (Object.prototype.hasOwnProperty.call(filter, "product_id")) validateIdentifierArray(filter.product_id, "params.filter.product_id", { minimum: 1, maximum: 1000, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "skus")) validateIdentifierArray(filter.skus, "params.filter.skus", { minimum: 1, maximum: 1000, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "visibility")) filter.visibility = requireEnum(filter.visibility, "params.filter.visibility", PRODUCT_VISIBILITY);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    return normalized;
  }

  function normalizeSellerProductInfoListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["offer_id", "product_id", "sku"]);
    const identifierFields = ["offer_id", "product_id", "sku"].filter((field) => Object.prototype.hasOwnProperty.call(normalized, field));
    if (identifierFields.length !== 1) fail("INVALID_OPERATION_PARAMS", "params должен содержать ровно одну однотипную группу идентификаторов: offer_id, product_id или sku.");
    const field = identifierFields[0];
    validateIdentifierArray(normalized[field], `params.${field}`, { minimum: 1, maximum: 1000, int64: field !== "offer_id" });
    return normalized;
  }

  function normalizeSellerProductAttributesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "last_id", "limit", "sort_by", "sort_dir"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["offer_id", "product_id", "sku", "visibility"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "offer_id")) validateIdentifierArray(filter.offer_id, "params.filter.offer_id");
      if (Object.prototype.hasOwnProperty.call(filter, "product_id")) validateIdentifierArray(filter.product_id, "params.filter.product_id", { maximum: 1000, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "sku")) validateIdentifierArray(filter.sku, "params.filter.sku", { int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "visibility")) filter.visibility = requireEnum(filter.visibility, "params.filter.visibility", PRODUCT_VISIBILITY);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_by")) requireString(normalized.sort_by, "params.sort_by");
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) requireString(normalized.sort_dir, "params.sort_dir");
    return normalized;
  }

  function normalizeDescriptionCategoryTreeParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["language"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "language")) normalized.language = requireEnum(normalized.language, "params.language", DESCRIPTION_CATEGORY_LANGUAGES);
    return normalized;
  }

  function normalizeDescriptionCategoryAttributesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["description_category_id", "language", "type_id"]);
    requireSafeInt64Number(requireField(normalized, "description_category_id"), "params.description_category_id");
    requireSafeInt64Number(requireField(normalized, "type_id"), "params.type_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "language")) normalized.language = requireEnum(normalized.language, "params.language", DESCRIPTION_CATEGORY_LANGUAGES);
    return normalized;
  }

  function normalizeDescriptionCategoryAttributeValuesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["attribute_id", "description_category_id", "language", "last_value_id", "limit", "type_id"]);
    requireSafeInt64Number(requireField(normalized, "attribute_id"), "params.attribute_id");
    requireSafeInt64Number(requireField(normalized, "description_category_id"), "params.description_category_id");
    requireSafeInt64Number(requireField(normalized, "type_id"), "params.type_id");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 2000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_value_id")) requireSafeInt64Number(normalized.last_value_id, "params.last_value_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "language")) normalized.language = requireEnum(normalized.language, "params.language", DESCRIPTION_CATEGORY_LANGUAGES);
    return normalized;
  }

  function normalizeDescriptionCategoryAttributeValuesSearchParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["attribute_id", "description_category_id", "limit", "type_id", "value"]);
    requireSafeInt64Number(requireField(normalized, "attribute_id"), "params.attribute_id");
    requireSafeInt64Number(requireField(normalized, "description_category_id"), "params.description_category_id");
    requireSafeInt64Number(requireField(normalized, "type_id"), "params.type_id");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    normalized.value = requireString(requireField(normalized, "value"), "params.value");
    if (normalized.value.length < 2) fail("OZON_LIMIT_VIOLATION", "params.value: минимум 2 символа по контракту Ozon.");
    return normalized;
  }

  function requireInt32Number(value, path) {
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) fail("INVALID_OPERATION_PARAMS", `${path} должен быть целым числом int32.`);
    return value;
  }

  function normalizeBrandCompanyCertificationListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "page_size"]);
    requireInt32Number(requireField(normalized, "page"), "params.page");
    requireInt32Number(requireField(normalized, "page_size"), "params.page_size");
    return normalized;
  }

  function normalizeProductCertificationCategoriesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "page_size"]);
    requireSafeInt64Number(requireField(normalized, "page"), "params.page");
    requireSafeInt64Number(requireField(normalized, "page_size"), "params.page_size");
    requireInteger(normalized.page_size, "params.page_size", { minimum: 1, maximum: 1000 });
    return normalized;
  }

  function normalizeProductCertificateInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["certificate_number"]);
    requireString(requireField(normalized, "certificate_number"), "params.certificate_number", { nonEmpty: false });
    return normalized;
  }

  function normalizeProductCertificateListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["offer_id", "status", "type", "page", "page_size"]);
    requireInt32Number(requireField(normalized, "page"), "params.page");
    requireInt32Number(requireField(normalized, "page_size"), "params.page_size");
    requireInteger(normalized.page, "params.page", { minimum: 1 });
    requireInteger(normalized.page_size, "params.page_size", { minimum: 1, maximum: 1000 });
    for (const field of ["offer_id", "status", "type"]) {
      if (Object.prototype.hasOwnProperty.call(normalized, field)) requireString(normalized[field], `params.${field}`, { nonEmpty: false });
    }
    return normalized;
  }

  function normalizeProductCertificateProductsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["certificate_id", "last_id", "limit", "product_status_code"]);
    requireInt32Number(requireField(normalized, "certificate_id"), "params.certificate_id");
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "product_status_code")) requireString(normalized.product_status_code, "params.product_status_code", { nonEmpty: false });
    return normalized;
  }

  function normalizeProductContentRatingParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    validateIdentifierArray(requireField(normalized, "skus"), "params.skus", { int64: true });
    return normalized;
  }

  function normalizeProductInfoDescriptionParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["offer_id", "product_id"]);
    const hasOffer = Object.prototype.hasOwnProperty.call(normalized, "offer_id");
    const hasProduct = Object.prototype.hasOwnProperty.call(normalized, "product_id");
    if (hasOffer === hasProduct) fail("INVALID_OPERATION_PARAMS", "Нужно передать ровно один идентификатор: params.offer_id или params.product_id.");
    if (hasOffer) requireString(normalized.offer_id, "params.offer_id", { nonEmpty: false });
    if (hasProduct) requireSafeInt64Number(normalized.product_id, "params.product_id");
    return normalized;
  }

  function normalizeProductSubscriptionCountParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    validateIdentifierArray(requireField(normalized, "skus"), "params.skus", { int64: true });
    return normalized;
  }

  function normalizeProductRelatedSkuParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["sku"]);
    validateIdentifierArray(requireField(normalized, "sku"), "params.sku", { maximum: 200, int64: true });
    return normalized;
  }

  function normalizeProductPicturesInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["product_id"]);
    validateIdentifierArray(requireField(normalized, "product_id"), "params.product_id", { maximum: 1000, int64: true });
    return normalized;
  }

  function normalizeProductWrongVolumeParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }

  function normalizeProductDiscountedInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["discounted_skus"]);
    validateIdentifierArray(requireField(normalized, "discounted_skus"), "params.discounted_skus", { int64: true });
    return normalized;
  }

  function normalizeProductPricesBulkParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    const filter = requirePlainObject(requireField(normalized, "filter"), "params.filter");
    assertAllowedFields(filter, ["offer_id", "product_id", "visibility"], "params.filter");
    if (Object.prototype.hasOwnProperty.call(filter, "offer_id")) validateIdentifierArray(filter.offer_id, "params.filter.offer_id", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(filter, "product_id")) validateIdentifierArray(filter.product_id, "params.filter.product_id", { maximum: 1000, int64: true });
    if (Object.prototype.hasOwnProperty.call(filter, "visibility")) filter.visibility = requireEnum(filter.visibility, "params.filter.visibility", PRODUCT_VISIBILITY);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 1000 });
    return normalized;
  }

  function normalizeProductPriceDetailsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    validateIdentifierArray(requireField(normalized, "skus"), "params.skus", { minimum: 1, maximum: 1000, int64: true });
    return normalized;
  }

  function normalizeSellerActionsListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["action_ids", "action_type", "limit", "offset", "search", "status"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "action_ids")) {
      const ids = requireArray(normalized.action_ids, "params.action_ids");
      if (ids.length > 100) fail("OZON_LIMIT_VIOLATION", "params.action_ids: максимум 100 элементов по контракту Ozon.");
      for (let index = 0; index < ids.length; index += 1) requireUint64String(ids[index], `params.action_ids[${index}]`);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "action_type")) validateEnumArray(normalized.action_type, "params.action_type", SELLER_ACTION_TYPES);
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireSafeUint64Number(normalized.offset, "params.offset");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) requireString(normalized.search, "params.search", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "status")) validateEnumArray(normalized.status, "params.status", SELLER_ACTION_STATUSES);
    return normalized;
  }

  function normalizeSellerActionProductsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["action_id", "cursor", "limit"]);
    requireSafeUint64Number(requireField(normalized, "action_id"), "params.action_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireSafeUint64Number(normalized.cursor, "params.cursor");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    return normalized;
  }

  function normalizePricingStrategyListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "limit"]);
    requireSafeInt64Number(requireField(normalized, "page"), "params.page");
    requireInteger(normalized.page, "params.page", { minimum: 1 });
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 50 });
    return normalized;
  }

  function normalizePricingStrategyIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["strategy_id"]);
    normalized.strategy_id = requireString(requireField(normalized, "strategy_id"), "params.strategy_id");
    return normalized;
  }

  function normalizePricingStrategyProductInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["product_id"]);
    requireSafeInt64Number(requireField(normalized, "product_id"), "params.product_id");
    return normalized;
  }

  function normalizePricingStrategyCompetitorsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "limit"]);
    requireSafeInt64Number(requireField(normalized, "page"), "params.page");
    requireInteger(normalized.page, "params.page", { minimum: 1 });
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 50 });
    return normalized;
  }

  function normalizePricingStrategyIdsByProductIdsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["product_id"]);
    const productIds = assertMaxItems(requireField(normalized, "product_id"), "params.product_id", 50);
    for (let index = 0; index < productIds.length; index += 1) requireInt64String(productIds[index], `params.product_id[${index}]`);
    return normalized;
  }

  function normalizeOzonActionPageParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["action_id", "limit", "last_id"]);
    requireFiniteNumber(requireField(normalized, "action_id"), "params.action_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireFiniteNumber(normalized.limit, "params.limit");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireFiniteNumber(normalized.last_id, "params.last_id");
    return normalized;
  }

  function normalizeOzonAutoAddActionParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["action_id", "auto_add_date", "limit", "offset"]);
    requireSafeUint64Number(requireField(normalized, "action_id"), "params.action_id");
    normalized.auto_add_date = requireRfc3339DateTime(requireField(normalized, "auto_add_date"), "params.auto_add_date");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireSafeUint64Number(normalized.offset, "params.offset");
    return normalized;
  }

  function validateWarehouseSetupCoordinates(value, path) {
    const coordinates = requirePlainObject(value, path);
    assertAllowedFields(coordinates, ["latitude", "longitude"], path);
    requireFiniteNumber(requireField(coordinates, "latitude", path), `${path}.latitude`);
    requireFiniteNumber(requireField(coordinates, "longitude", path), `${path}.longitude`);
    return coordinates;
  }

  function validateWarehouseSetupSearch(value, path, { addressMaxLength = null, typesMaxItems = null } = {}) {
    const search = requirePlainObject(value, path);
    assertAllowedFields(search, ["address", "types"], path);
    if (Object.prototype.hasOwnProperty.call(search, "address")) {
      requireString(search.address, `${path}.address`, { nonEmpty: false });
      if (addressMaxLength !== null && [...search.address].length > addressMaxLength) fail("OZON_LIMIT_VIOLATION", `${path}.address: максимум ${addressMaxLength} символов по контракту Ozon.`);
    }
    if (Object.prototype.hasOwnProperty.call(search, "types")) {
      if (typesMaxItems !== null) assertMaxItems(search.types, `${path}.types`, typesMaxItems);
      validateEnumArray(search.types, `${path}.types`, ["PVZ", "PPZ", "SC"]);
    }
    return search;
  }

  function normalizeWarehouseFbsCreateDropoffListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["coordinates", "country_code", "is_kgt", "search"]);
    normalized.country_code = requireString(requireField(normalized, "country_code"), "params.country_code", { nonEmpty: false });
    if (typeof requireField(normalized, "is_kgt") !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.is_kgt должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "coordinates")) validateWarehouseSetupCoordinates(normalized.coordinates, "params.coordinates");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search", { addressMaxLength: 1000, typesMaxItems: 3 });
    return normalized;
  }

  function normalizeWarehouseFbsUpdateDropoffListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["search", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search", { typesMaxItems: 3 });
    return normalized;
  }

  function normalizeWarehouseFbsCreateDropoffTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["drop_off_point_id"]);
    requireSafeInt64Number(requireField(normalized, "drop_off_point_id"), "params.drop_off_point_id");
    return normalized;
  }

  function normalizeWarehouseFbsUpdateDropoffTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["drop_off_point_id", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "drop_off_point_id"), "params.drop_off_point_id");
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }

  function normalizeWarehouseFbsCreatePickupTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["address_coordinates", "is_kgt"]);
    validateWarehouseSetupCoordinates(requireField(normalized, "address_coordinates"), "params.address_coordinates");
    if (typeof requireField(normalized, "is_kgt") !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.is_kgt должен быть boolean.");
    return normalized;
  }

  function normalizeWarehouseFbsUpdatePickupTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }

  function normalizeWarehouseFbsCreateReturnPointListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["coordinates", "country_code", "last_id", "limit", "search", "selected_dropoff_point_id"]);
    validateWarehouseSetupCoordinates(requireField(normalized, "coordinates"), "params.coordinates");
    normalized.country_code = requireString(requireField(normalized, "country_code"), "params.country_code", { nonEmpty: false });
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 500 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "selected_dropoff_point_id")) requireSafeInt64Number(normalized.selected_dropoff_point_id, "params.selected_dropoff_point_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search");
    return normalized;
  }

  function normalizeWarehouseFbsUpdateReturnPointListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["current_dropoff_point_id", "current_return_point_id", "last_id", "limit", "search", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 500 });
    for (const field of ["current_dropoff_point_id", "current_return_point_id", "last_id"]) {
      if (Object.prototype.hasOwnProperty.call(normalized, field)) requireSafeInt64Number(normalized[field], `params.${field}`);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search");
    return normalized;
  }

  function normalizeWarehouseFbsPickupHistoryListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["planned_date", "warehouse_id", "was_planned"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "planned_date")) requireString(filter.planned_date, "params.filter.planned_date", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_id")) validateIdentifierArray(filter.warehouse_id, "params.filter.warehouse_id", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "was_planned") && typeof filter.was_planned !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.filter.was_planned должен быть boolean.");
    }
    return normalized;
  }

  function normalizeDeliveryPolygonListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["delivery_method_id", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "delivery_method_id"), "params.delivery_method_id");
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }

  function normalizeSellerWarehouseListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit", "cursor", "warehouse_ids"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { maximum: 200 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_ids")) validateIdentifierArray(normalized.warehouse_ids, "params.warehouse_ids", { int64: true });
    return normalized;
  }


  function normalizeSellerDeliveryMethodListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", DELIVERY_METHOD_SORT_DIR);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["delivery_method_ids", "provider_ids", "status", "warehouse_ids"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "delivery_method_ids")) validateIdentifierArray(filter.delivery_method_ids, "params.filter.delivery_method_ids", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "provider_ids")) validateIdentifierArray(filter.provider_ids, "params.filter.provider_ids", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_ids")) validateIdentifierArray(filter.warehouse_ids, "params.filter.warehouse_ids", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "status")) validateEnumArray(filter.status, "params.filter.status", DELIVERY_METHOD_STATUSES);
    }
    return normalized;
  }

  function normalizeDeliveryMethodReturnSettingsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["delivery_method_id"]);
    requireSafeInt64Number(requireField(normalized, "delivery_method_id"), "params.delivery_method_id");
    return normalized;
  }

  function normalizeWarehouseInvalidProductsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["last_id", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    return normalized;
  }

  function normalizeOzonWarehouseListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_types"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_types")) validateEnumArray(normalized.warehouse_types, "params.warehouse_types", OZON_WAREHOUSE_TYPES);
    return normalized;
  }

  function normalizeFbsStockByWarehouseParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit", "offer_id", "sku"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { maximum: 1000 });
    const selectors = ["offer_id", "sku"].filter((field) => Object.prototype.hasOwnProperty.call(normalized, field));
    if (selectors.length !== 1) fail("INVALID_OPERATION_PARAMS", "params должен содержать ровно одно поле: offer_id или sku.");
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "offer_id")) validateIdentifierArray(normalized.offer_id, "params.offer_id", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sku")) validateIdentifierArray(normalized.sku, "params.sku", { maximum: 1000, int64: true });
    return normalized;
  }

  function normalizeFboStockByWarehouseParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit", "offer_ids", "skus"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "offer_ids")) validateIdentifierArray(normalized.offer_ids, "params.offer_ids");
    if (Object.prototype.hasOwnProperty.call(normalized, "skus")) validateIdentifierArray(normalized.skus, "params.skus", { int64: true });
    return normalized;
  }

  function normalizeStockAnalyticsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cluster_ids", "item_tags", "macrolocal_cluster_ids", "placement_zone", "skus", "turnover_grades", "unmarked_stocks_only", "warehouse_ids"]);
    validateIdentifierArray(requireField(normalized, "skus"), "params.skus", { int64: true });
    if (Object.prototype.hasOwnProperty.call(normalized, "cluster_ids") && Object.prototype.hasOwnProperty.call(normalized, "macrolocal_cluster_ids")) {
      fail("INVALID_OPERATION_PARAMS", "params: cluster_ids и macrolocal_cluster_ids нельзя использовать одновременно по контракту Ozon.");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "cluster_ids")) validateIdentifierArray(normalized.cluster_ids, "params.cluster_ids", { int64: true });
    if (Object.prototype.hasOwnProperty.call(normalized, "macrolocal_cluster_ids")) validateIdentifierArray(normalized.macrolocal_cluster_ids, "params.macrolocal_cluster_ids", { int64: true });
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_ids")) validateIdentifierArray(normalized.warehouse_ids, "params.warehouse_ids", { int64: true });
    if (Object.prototype.hasOwnProperty.call(normalized, "item_tags")) validateEnumArray(normalized.item_tags, "params.item_tags", STOCK_ITEM_TAGS);
    if (Object.prototype.hasOwnProperty.call(normalized, "placement_zone")) validateEnumArray(normalized.placement_zone, "params.placement_zone", STOCK_PLACEMENT_ZONES);
    if (Object.prototype.hasOwnProperty.call(normalized, "turnover_grades")) validateEnumArray(normalized.turnover_grades, "params.turnover_grades", STOCK_TURNOVER_GRADES);
    if (Object.prototype.hasOwnProperty.call(normalized, "unmarked_stocks_only") && typeof normalized.unmarked_stocks_only !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.unmarked_stocks_only должен быть boolean.");
    return normalized;
  }

  function normalizeStockTurnoverAnalyticsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit", "offset", "sku"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireInt32Number(normalized.offset, "params.offset");
    if (Object.prototype.hasOwnProperty.call(normalized, "sku")) {
      const sku = requireArray(normalized.sku, "params.sku");
      for (let index = 0; index < sku.length; index += 1) requireInt64String(sku[index], `params.sku[${index}]`);
    }
    return normalized;
  }

  function normalizeStockOnWarehousesV2Params(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit", "offset", "warehouse_type"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireSafeInt64Number(normalized.offset, "params.offset");
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_type")) normalized.warehouse_type = requireEnum(normalized.warehouse_type, "params.warehouse_type", STOCK_ON_WAREHOUSE_TYPES);
    return normalized;
  }

  function normalizeStocksCurrentParams(params) {
    const normalized = requirePlainObject(params, "params");
    requirePlainObject(requireField(normalized, "filter"), "params.filter");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 1000 });
    return normalized;
  }

  function normalizeAnalyticsDataParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to", "dimension", "metrics", "filters", "sort", "limit", "offset"]);
    for (const field of ["date_from", "date_to", "dimension", "metrics", "limit"]) requireField(normalized, field);
    normalized.date_from = requireAnalyticsDate(normalized.date_from, "params.date_from");
    normalized.date_to = requireAnalyticsDate(normalized.date_to, "params.date_to");
    const dimensions = requireArray(normalized.dimension, "params.dimension");
    for (let index = 0; index < dimensions.length; index += 1) requireEnum(dimensions[index], `params.dimension[${index}]`, ANALYTICS_DIMENSIONS);
    const metrics = assertMaxItems(normalized.metrics, "params.metrics", 14);
    for (let index = 0; index < metrics.length; index += 1) requireEnum(metrics[index], `params.metrics[${index}]`, ANALYTICS_METRICS);
    if (Object.prototype.hasOwnProperty.call(normalized, "filters")) {
      const filters = requireArray(normalized.filters, "params.filters");
      for (let index = 0; index < filters.length; index += 1) {
        const filter = requirePlainObject(filters[index], `params.filters[${index}]`);
        assertAllowedFields(filter, ["key", "op", "value"], `params.filters[${index}]`);
        if (Object.prototype.hasOwnProperty.call(filter, "key")) {
          const key = requireString(filter.key, `params.filters[${index}].key`).trim();
          if (key === "brand" || (!ANALYTICS_DIMENSIONS.includes(key) && !ANALYTICS_METRICS.includes(key))) {
            fail("INVALID_OPERATION_PARAMS", `params.filters[${index}].key не является разрешённой metric/dimension для analytics_data.`);
          }
        }
        if (Object.prototype.hasOwnProperty.call(filter, "op")) requireEnum(filter.op, `params.filters[${index}].op`, FILTER_OPS);
        if (Object.prototype.hasOwnProperty.call(filter, "value")) requireString(filter.value, `params.filters[${index}].value`, { nonEmpty: false });
      }
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "sort")) {
      const sort = requireArray(normalized.sort, "params.sort");
      for (let index = 0; index < sort.length; index += 1) {
        const item = requirePlainObject(sort[index], `params.sort[${index}]`);
        assertAllowedFields(item, ["key", "order"], `params.sort[${index}]`);
        if (Object.prototype.hasOwnProperty.call(item, "key")) requireEnum(item.key, `params.sort[${index}].key`, ANALYTICS_METRICS);
        if (Object.prototype.hasOwnProperty.call(item, "order")) requireEnum(item.order, `params.sort[${index}].order`, ["ASC", "DESC"]);
      }
    }
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireInteger(normalized.offset, "params.offset", { minimum: 0 });
    return normalized;
  }

  function normalizeProductQueriesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to", "page", "page_size", "skus", "sort_by", "sort_dir"]);
    for (const field of ["date_from", "page_size", "skus"]) requireField(normalized, field);
    normalized.date_from = requireRfc3339DateTime(normalized.date_from, "params.date_from");
    if (Object.prototype.hasOwnProperty.call(normalized, "date_to")) normalized.date_to = requireRfc3339DateTime(normalized.date_to, "params.date_to");
    requireInteger(normalized.page_size, "params.page_size", { maximum: 1000 });
    validateSkuArray(normalized.skus, "params.skus", 1000);
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) requireInteger(normalized.page, "params.page", { minimum: 0 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_by")) normalized.sort_by = requireEnum(normalized.sort_by, "params.sort_by", PRODUCT_QUERY_SORT_BY);
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", PRODUCT_QUERY_SORT_DIR);
    return normalized;
  }

  function normalizeProductQueriesDetailsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to", "limit_by_sku", "page", "page_size", "skus", "sort_by", "sort_dir"]);
    for (const field of ["date_from", "page_size", "skus", "limit_by_sku"]) requireField(normalized, field);
    normalized.date_from = requireRfc3339DateTime(normalized.date_from, "params.date_from");
    if (Object.prototype.hasOwnProperty.call(normalized, "date_to")) normalized.date_to = requireRfc3339DateTime(normalized.date_to, "params.date_to");
    requireInteger(normalized.page_size, "params.page_size", { maximum: 100 });
    validateSkuArray(normalized.skus, "params.skus", 1000);
    requireInteger(normalized.limit_by_sku, "params.limit_by_sku", { maximum: 15 });
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) requireInteger(normalized.page, "params.page", { minimum: 0 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_by")) normalized.sort_by = requireEnum(normalized.sort_by, "params.sort_by", PRODUCT_QUERY_SORT_BY);
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", PRODUCT_QUERY_SORT_DIR);
    return normalized;
  }

  function requireInt64StringAtMost(value, path, maximum) {
    const text = requireInt64String(value, path);
    if (BigInt(text) > BigInt(maximum)) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} по контракту Ozon.`);
    return text;
  }

  function normalizeMarketplaceSearchQueriesTextParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit", "offset", "sort_by", "sort_dir", "text"]);
    for (const field of ["limit", "offset", "text"]) requireField(normalized, field);
    normalized.limit = requireInt64StringAtMost(normalized.limit, "params.limit", 50);
    normalized.offset = requireInt64StringAtMost(normalized.offset, "params.offset", 50);
    requireString(normalized.text, "params.text", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_by")) normalized.sort_by = requireEnum(normalized.sort_by, "params.sort_by", ["CLIENT_COUNT", "ADD_TO_CART", "CONVERSION_TO_CART", "AVG_PRICE"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    return normalized;
  }

  function normalizeMarketplaceSearchQueriesTopParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit", "offset"]);
    normalized.limit = requireInt64StringAtMost(requireField(normalized, "limit"), "params.limit", 50);
    normalized.offset = requireInt64StringAtMost(requireField(normalized, "offset"), "params.offset", 1000);
    return normalized;
  }

  function requireSafeInt64Number(value, path) {
    if (!Number.isSafeInteger(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть безопасным целым числом для int64.`);
    return value;
  }

  function validateBooleanFields(object, allowed, path) {
    const block = requirePlainObject(object, path);
    assertAllowedFields(block, allowed, path);
    for (const [key, value] of Object.entries(block)) {
      if (typeof value !== "boolean") fail("INVALID_OPERATION_PARAMS", `${path}.${key} должен быть boolean.`);
    }
    return block;
  }

  function assertPeriodAtMostOneYear(from, to, path) {
    const fromMs = Date.parse(from);
    const toMs = Date.parse(to);
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) fail("INVALID_OPERATION_PARAMS", `${path}: некорректный date-time.`);
    const oneYearLater = new Date(fromMs);
    oneYearLater.setUTCFullYear(oneYearLater.getUTCFullYear() + 1);
    if (toMs > oneYearLater.getTime()) fail("OZON_LIMIT_VIOLATION", `${path}: период не может быть больше одного года по контракту Ozon.`);
  }

  function validateFromToObject(value, path, { requirePair = false, fromKey = "from", toKey = "to" } = {}) {
    const range = requirePlainObject(value, path);
    assertAllowedFields(range, [fromKey, toKey], path);
    const hasFrom = Object.prototype.hasOwnProperty.call(range, fromKey);
    const hasTo = Object.prototype.hasOwnProperty.call(range, toKey);
    if (requirePair && hasFrom !== hasTo) fail("INVALID_OPERATION_PARAMS", `${path}: поля ${fromKey} и ${toKey} должны передаваться вместе.`);
    if (hasFrom) range[fromKey] = requireRfc3339DateTime(range[fromKey], `${path}.${fromKey}`);
    if (hasTo) range[toKey] = requireRfc3339DateTime(range[toKey], `${path}.${toKey}`);
    return range;
  }

  function normalizePostingFboListParams(params) {
    const normalized = requirePlainObject(params, "params");
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "order_numbers")) assertMaxItems(filter.order_numbers, "params.filter.order_numbers", 1000);
      if (Object.prototype.hasOwnProperty.call(filter, "posting_numbers")) assertMaxItems(filter.posting_numbers, "params.filter.posting_numbers", 1000);
      if (Object.prototype.hasOwnProperty.call(filter, "since") && Object.prototype.hasOwnProperty.call(filter, "to")) {
        const since = new Date(filter.since);
        const to = new Date(filter.to);
        if (Number.isNaN(since.getTime()) || Number.isNaN(to.getTime())) fail("INVALID_OPERATION_PARAMS", "params.filter.since/to должны быть date-time по контракту Ozon.");
        const oneYearLater = new Date(since.getTime());
        oneYearLater.setUTCFullYear(oneYearLater.getUTCFullYear() + 1);
        if (to.getTime() > oneYearLater.getTime()) fail("OZON_LIMIT_VIOLATION", "params.filter: период posting_fbo_list не может быть больше одного года по контракту Ozon.");
      }
    }
    return normalized;
  }

  function normalizePostingFboGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number", "translit", "with"]);
    normalized.posting_number = requireString(requireField(normalized, "posting_number"), "params.posting_number", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "translit") && typeof normalized.translit !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.translit должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "with")) validateBooleanFields(normalized.with, ["analytics_data", "financial_data", "legal_info"], "params.with");
    return normalized;
  }

  function normalizeFbpPostingListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_by", "sort_dir"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_by")) requireString(normalized.sort_by, "params.sort_by", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["name", "offer_id", "posting_numbers", "since", "statuses", "to"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "name")) requireString(filter.name, "params.filter.name", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "offer_id")) requireString(filter.offer_id, "params.filter.offer_id", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "posting_numbers")) validateIdentifierArray(filter.posting_numbers, "params.filter.posting_numbers");
      if (Object.prototype.hasOwnProperty.call(filter, "statuses")) validateIdentifierArray(filter.statuses, "params.filter.statuses");
      if (Object.prototype.hasOwnProperty.call(filter, "since")) filter.since = requireRfc3339DateTime(filter.since, "params.filter.since");
      if (Object.prototype.hasOwnProperty.call(filter, "to")) filter.to = requireRfc3339DateTime(filter.to, "params.filter.to");
    }
    return normalized;
  }

  function normalizeFbpPostingGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number"]);
    normalized.posting_number = requireString(requireField(normalized, "posting_number"), "params.posting_number", { nonEmpty: false });
    return normalized;
  }

  function normalizePostingUnpaidLegalProductListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }

  function normalizeFbsPostingListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir", "translit", "with"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "translit") && typeof normalized.translit !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.translit должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "with")) validateBooleanFields(normalized.with, ["analytics_data", "barcodes", "financial_data", "legal_info"], "params.with");

    const filter = requirePlainObject(requireField(normalized, "filter"), "params.filter");
    assertAllowedFields(filter, ["delivery_method_ids", "integration_type_flow", "is_blr_traceable", "last_changed_status_date", "order_id", "order_numbers", "provider_ids", "since", "statuses", "to", "warehouse_ids"], "params.filter");
    filter.since = requireRfc3339DateTime(requireField(filter, "since", "params.filter"), "params.filter.since");
    filter.to = requireRfc3339DateTime(requireField(filter, "to", "params.filter"), "params.filter.to");
    assertPeriodAtMostOneYear(filter.since, filter.to, "params.filter");
    if (Object.prototype.hasOwnProperty.call(filter, "delivery_method_ids")) validateIdentifierArray(filter.delivery_method_ids, "params.filter.delivery_method_ids", { maximum: 1000, int64: true });
    if (Object.prototype.hasOwnProperty.call(filter, "integration_type_flow")) validateEnumArray(filter.integration_type_flow, "params.filter.integration_type_flow", ["ozon", "aggregator", "non_integrated", "3pl_tracking", "hybrid", "hybrid_aggregator", "hybrid_non_integrated", "hybrid_3pl_tracking", "click_and_collect", "FBP"]);
    if (Object.prototype.hasOwnProperty.call(filter, "is_blr_traceable") && typeof filter.is_blr_traceable !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.filter.is_blr_traceable должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(filter, "last_changed_status_date")) validateFromToObject(filter.last_changed_status_date, "params.filter.last_changed_status_date");
    if (Object.prototype.hasOwnProperty.call(filter, "order_id")) requireSafeInt64Number(filter.order_id, "params.filter.order_id");
    if (Object.prototype.hasOwnProperty.call(filter, "order_numbers")) validateIdentifierArray(filter.order_numbers, "params.filter.order_numbers", { maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(filter, "provider_ids")) validateIdentifierArray(filter.provider_ids, "params.filter.provider_ids", { maximum: 1000, int64: true });
    if (Object.prototype.hasOwnProperty.call(filter, "statuses")) validateEnumArray(filter.statuses, "params.filter.statuses", ["awaiting_registration", "acceptance_in_progress", "awaiting_approve", "awaiting_packaging", "awaiting_deliver", "arbitration", "client_arbitration", "delivering", "driver_pickup", "delivered", "cancelled", "not_accepted", "sent_by_seller"]);
    if (Object.prototype.hasOwnProperty.call(filter, "warehouse_ids")) validateIdentifierArray(filter.warehouse_ids, "params.filter.warehouse_ids", { maximum: 1000, int64: true });
    return normalized;
  }

  function normalizeFbsUnfulfilledListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir", "translit", "with"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "translit") && typeof normalized.translit !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.translit должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "with")) validateBooleanFields(normalized.with, ["analytics_data", "barcodes", "financial_data", "legal_info"], "params.with");
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["cutoff_from", "cutoff_to", "delivering_date_from", "delivering_date_to", "delivery_method_ids", "last_changed_status_date", "provider_ids", "statuses", "warehouse_ids"], "params.filter");
      const cutoffPresent = Object.prototype.hasOwnProperty.call(filter, "cutoff_from") || Object.prototype.hasOwnProperty.call(filter, "cutoff_to");
      const deliveryPresent = Object.prototype.hasOwnProperty.call(filter, "delivering_date_from") || Object.prototype.hasOwnProperty.call(filter, "delivering_date_to");
      if (cutoffPresent && deliveryPresent) fail("INVALID_OPERATION_PARAMS", "params.filter: cutoff и delivering_date нельзя использовать вместе по контракту Ozon.");
      if (cutoffPresent) {
        filter.cutoff_from = requireRfc3339DateTime(requireField(filter, "cutoff_from", "params.filter"), "params.filter.cutoff_from");
        filter.cutoff_to = requireRfc3339DateTime(requireField(filter, "cutoff_to", "params.filter"), "params.filter.cutoff_to");
        assertPeriodAtMostOneYear(filter.cutoff_from, filter.cutoff_to, "params.filter.cutoff");
      }
      if (deliveryPresent) {
        filter.delivering_date_from = requireRfc3339DateTime(requireField(filter, "delivering_date_from", "params.filter"), "params.filter.delivering_date_from");
        filter.delivering_date_to = requireRfc3339DateTime(requireField(filter, "delivering_date_to", "params.filter"), "params.filter.delivering_date_to");
        assertPeriodAtMostOneYear(filter.delivering_date_from, filter.delivering_date_to, "params.filter.delivering_date");
      }
      if (Object.prototype.hasOwnProperty.call(filter, "delivery_method_ids")) validateIdentifierArray(filter.delivery_method_ids, "params.filter.delivery_method_ids", { maximum: 1000, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "last_changed_status_date")) validateFromToObject(filter.last_changed_status_date, "params.filter.last_changed_status_date");
      if (Object.prototype.hasOwnProperty.call(filter, "provider_ids")) validateIdentifierArray(filter.provider_ids, "params.filter.provider_ids", { maximum: 1000, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "statuses")) validateEnumArray(filter.statuses, "params.filter.statuses", ["acceptance_in_progress", "awaiting_approve", "awaiting_packaging", "awaiting_registration", "awaiting_deliver", "arbitration", "client_arbitration", "delivering", "driver_pickup", "not_accepted"]);
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_ids")) validateIdentifierArray(filter.warehouse_ids, "params.filter.warehouse_ids", { maximum: 1000, int64: true });
    }
    return normalized;
  }

  function normalizeReturnsListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "limit", "last_id"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { maximum: 500 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      const dateFilters = ["logistic_return_date", "storage_tariffication_start_date", "visual_status_change_moment"];
      assertAllowedFields(filter, [...dateFilters, "order_id", "posting_numbers", "product_name", "offer_id", "visual_status_name", "warehouse_id", "barcode", "return_schema", "compensation_status_id"], "params.filter");
      const selectedDateFilters = dateFilters.filter((field) => Object.prototype.hasOwnProperty.call(filter, field));
      if (selectedDateFilters.length > 1) fail("INVALID_OPERATION_PARAMS", "params.filter: используйте только один временной фильтр возвратов по контракту Ozon.");
      for (const field of selectedDateFilters) validateFromToObject(filter[field], `params.filter.${field}`, { fromKey: "time_from", toKey: "time_to" });
      if (Object.prototype.hasOwnProperty.call(filter, "order_id")) requireSafeInt64Number(filter.order_id, "params.filter.order_id");
      if (Object.prototype.hasOwnProperty.call(filter, "posting_numbers")) validateIdentifierArray(filter.posting_numbers, "params.filter.posting_numbers", { maximum: 50 });
      if (Object.prototype.hasOwnProperty.call(filter, "product_name")) requireString(filter.product_name, "params.filter.product_name", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "offer_id")) requireString(filter.offer_id, "params.filter.offer_id", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "visual_status_name")) filter.visual_status_name = requireEnum(filter.visual_status_name, "params.filter.visual_status_name", ["DisputeOpened", "OnSellerApproval", "ArrivedAtReturnPlace", "OnSellerClarification", "OnSellerClarificationAfterPartialCompensation", "OfferedPartialCompensation", "ReturnMoneyApproved", "PartialCompensationReturned", "CancelledDisputeNotOpen", "Rejected", "CrmRejected", "Cancelled", "Approved", "ApprovedByOzon", "ReceivedBySeller", "MovingToSeller", "ReturningToSellerByCourier", "Utilizing", "Utilized", "MoneyReturned", "PartialCompensationInProcess", "DisputeYouOpened", "CompensationRejected", "DisputeOpening", "CompensationOffered", "WaitingCompensation", "SendingError", "CompensationRejectedBySla", "CompensationRejectedBySeller", "MovingToOzon", "ReturnedToOzon", "MoneyReturnedBySystem", "WaitingShipment"]);
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_id")) requireSafeInt64Number(filter.warehouse_id, "params.filter.warehouse_id");
      if (Object.prototype.hasOwnProperty.call(filter, "barcode")) requireString(filter.barcode, "params.filter.barcode", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "return_schema")) filter.return_schema = requireEnum(filter.return_schema, "params.filter.return_schema", ["FBS", "FBO"]);
      if (Object.prototype.hasOwnProperty.call(filter, "compensation_status_id")) requireInteger(filter.compensation_status_id, "params.filter.compensation_status_id", { minimum: 1, maximum: 4 });
    }
    return normalized;
  }

  function normalizeRfbsReturnsListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "last_id", "limit"]);
    requireInteger(requireField(normalized, "limit"), "params.limit");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireInteger(normalized.last_id, "params.last_id", { minimum: -2147483648, maximum: 2147483647 });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["offer_id", "posting_number", "group_state", "created_at"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "offer_id")) requireString(filter.offer_id, "params.filter.offer_id", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "posting_number")) requireString(filter.posting_number, "params.filter.posting_number", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "group_state")) validateEnumArray(filter.group_state, "params.filter.group_state", ["All", "New", "Delivering", "Checkout", "Arbitration", "Approved", "Rejected"]);
      if (Object.prototype.hasOwnProperty.call(filter, "created_at")) validateFromToObject(filter.created_at, "params.filter.created_at");
    }
    return normalized;
  }

  function normalizeRemovalReportParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to", "last_id", "limit"]);
    normalized.date_from = requireDateYmd(requireField(normalized, "date_from"), "params.date_from");
    normalized.date_to = requireDateYmd(requireField(normalized, "date_to"), "params.date_to");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 500 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    return normalized;
  }

  function normalizeReturnsCompanyFbsInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "pagination"]);
    const pagination = requirePlainObject(requireField(normalized, "pagination"), "params.pagination");
    assertAllowedFields(pagination, ["last_id", "limit"], "params.pagination");
    requireInteger(requireField(pagination, "limit"), "params.pagination.limit", { minimum: -2147483648, maximum: 500 });
    if (Object.prototype.hasOwnProperty.call(pagination, "last_id")) requireSafeInt64Number(pagination.last_id, "params.pagination.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["place_id"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "place_id")) requireSafeInt64Number(filter.place_id, "params.filter.place_id");
    }
    return normalized;
  }

  function normalizeReturnGiveoutListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["last_id", "limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    return normalized;
  }

  function normalizeReturnGiveoutInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["giveout_id"]);
    requireSafeInt64Number(requireField(normalized, "giveout_id"), "params.giveout_id");
    return normalized;
  }

  function normalizePostingFbsCancelReasonParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["related_posting_numbers"]);
    const values = requireArray(requireField(normalized, "related_posting_numbers"), "params.related_posting_numbers");
    for (let index = 0; index < values.length; index += 1) requireString(values[index], `params.related_posting_numbers[${index}]`, { nonEmpty: false });
    return normalized;
  }

  function normalizeCancelReasonListByOrderParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["order_number"]);
    requireString(requireField(normalized, "order_number"), "params.order_number");
    return normalized;
  }

  function normalizeCancelReasonListByPostingParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number"]);
    requireString(requireField(normalized, "posting_number"), "params.posting_number");
    return normalized;
  }

  function normalizeOrderCancelStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["order_number"]);
    requireString(requireField(normalized, "order_number"), "params.order_number");
    return normalized;
  }

  function normalizePostingCancelStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "posting_number")) requireString(normalized.posting_number, "params.posting_number");
    return normalized;
  }

  function normalizeFinanceAccrualPostingsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_numbers"]);
    validateIdentifierArray(requireField(normalized, "posting_numbers"), "params.posting_numbers", { minimum: 1, maximum: 200 });
    return normalized;
  }

  function normalizeFinanceAccrualByDayParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date", "last_id"]);
    const date = requireDateYmd(requireField(normalized, "date"), "params.date");
    if (date < "2022-01-01") fail("OZON_LIMIT_VIOLATION", "params.date: самая ранняя дата начислений по контракту Ozon — 2022-01-01.");
    requireString(requireField(normalized, "last_id"), "params.last_id", { nonEmpty: false });
    return normalized;
  }

  function normalizeFinanceCashFlowStatementListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date", "page", "page_size", "with_details"]);
    const date = requirePlainObject(requireField(normalized, "date"), "params.date");
    assertAllowedFields(date, ["from", "to"], "params.date");
    date.from = requireRfc3339DateTime(requireField(date, "from", "params.date"), "params.date.from");
    date.to = requireRfc3339DateTime(requireField(date, "to", "params.date"), "params.date.to");
    requireInt32Number(requireField(normalized, "page"), "params.page");
    requireInt32Number(requireField(normalized, "page_size"), "params.page_size");
    if (Object.prototype.hasOwnProperty.call(normalized, "with_details") && typeof normalized.with_details !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.with_details должен быть boolean.");
    return normalized;
  }

  function normalizeFinanceTransactionListV3Params(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "page", "page_size"]);
    requireSafeInt64Number(requireField(normalized, "page"), "params.page");
    const pageSize = requireSafeInt64Number(requireField(normalized, "page_size"), "params.page_size");
    if (pageSize > 1000) fail("OZON_LIMIT_VIOLATION", "params.page_size: максимум 1000 по контракту Ozon.");
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["date", "operation_type", "posting_number", "transaction_type"], "params.filter");
      const hasDate = Object.prototype.hasOwnProperty.call(filter, "date");
      const hasPosting = Object.prototype.hasOwnProperty.call(filter, "posting_number");
      if (hasDate === hasPosting) fail("INVALID_OPERATION_PARAMS", "params.filter должен содержать ровно одно из полей date или posting_number по oneOf-контракту Ozon.");
      if (hasDate) {
        const date = requirePlainObject(filter.date, "params.filter.date");
        assertAllowedFields(date, ["from", "to"], "params.filter.date");
        if (Object.prototype.hasOwnProperty.call(date, "from")) date.from = requireRfc3339DateTime(date.from, "params.filter.date.from");
        if (Object.prototype.hasOwnProperty.call(date, "to")) date.to = requireRfc3339DateTime(date.to, "params.filter.date.to");
      }
      if (hasPosting) requireString(filter.posting_number, "params.filter.posting_number", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "operation_type")) {
        const values = requireArray(filter.operation_type, "params.filter.operation_type");
        for (let i = 0; i < values.length; i += 1) requireString(values[i], `params.filter.operation_type[${i}]`, { nonEmpty: false });
      }
      if (Object.prototype.hasOwnProperty.call(filter, "transaction_type")) requireString(filter.transaction_type, "params.filter.transaction_type", { nonEmpty: false });
    }
    return normalized;
  }

  function normalizeFinanceBalanceParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to"]);
    normalized.date_from = requireRfc3339DateTime(requireField(normalized, "date_from"), "params.date_from");
    normalized.date_to = requireRfc3339DateTime(requireField(normalized, "date_to"), "params.date_to");
    return normalized;
  }

  function normalizeFinanceRealizationByDayParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["day", "month", "year"]);
    requireInt32Number(requireField(normalized, "day"), "params.day");
    requireInt32Number(requireField(normalized, "month"), "params.month");
    requireInt32Number(requireField(normalized, "year"), "params.year");
    return normalized;
  }

  function normalizeFinanceRealizationMonthParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["month", "year"]);
    requireInt32Number(requireField(normalized, "month"), "params.month");
    requireInt32Number(requireField(normalized, "year"), "params.year");
    return normalized;
  }

  function normalizeFinanceProductsBuyoutParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to"]);
    requireString(requireField(normalized, "date_from"), "params.date_from");
    requireString(requireField(normalized, "date_to"), "params.date_to");
    return normalized;
  }

  function normalizeReportListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "page_size", "report_type"]);
    requireInteger(requireField(normalized, "page"), "params.page");
    requireInteger(requireField(normalized, "page_size"), "params.page_size", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "report_type")) requireString(normalized.report_type, "params.report_type", { nonEmpty: false });
    return normalized;
  }

  function normalizeReportInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["code"]);
    requireString(requireField(normalized, "code"), "params.code");
    return normalized;
  }

  function normalizeEmptyJsonBodyParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, []);
    return {};
  }

  function normalizeSellerRatingHistoryParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to", "ratings", "with_premium_scores"]);
    normalized.date_from = requireRfc3339DateTime(requireField(normalized, "date_from"), "params.date_from");
    normalized.date_to = requireRfc3339DateTime(requireField(normalized, "date_to"), "params.date_to");
    if (Date.parse(normalized.date_from) > Date.parse(normalized.date_to)) {
      fail("INVALID_OPERATION_PARAMS", "params.date_from не может быть позже params.date_to.");
    }
    validateEnumArray(requireField(normalized, "ratings"), "params.ratings", SELLER_RATING_TYPES);
    if (Object.prototype.hasOwnProperty.call(normalized, "with_premium_scores") && typeof normalized.with_premium_scores !== "boolean") {
      fail("INVALID_OPERATION_PARAMS", "params.with_premium_scores должен быть boolean.");
    }
    return normalized;
  }

  function normalizeSellerFbsErrorPostingsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    const filter = requirePlainObject(requireField(normalized, "filter"), "params.filter");
    assertAllowedFields(filter, ["date_from", "date_to", "posting_numbers"], "params.filter");
    filter.date_from = requireRfc3339DateTime(requireField(filter, "date_from", "params.filter"), "params.filter.date_from");
    filter.date_to = requireRfc3339DateTime(requireField(filter, "date_to", "params.filter"), "params.filter.date_to");
    if (Date.parse(filter.date_from) > Date.parse(filter.date_to)) {
      fail("INVALID_OPERATION_PARAMS", "params.filter.date_from не может быть позже params.filter.date_to.");
    }
    if (Object.prototype.hasOwnProperty.call(filter, "posting_numbers")) {
      validateIdentifierArray(filter.posting_numbers, "params.filter.posting_numbers", { maximum: 1000 });
    }
    requireInteger(requireField(normalized, "limit"), "params.limit", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }

  function normalizeReviewListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filters", "last_id", "limit", "sort_dir"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 20, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", REVIEW_SORT_DIR);
    if (Object.prototype.hasOwnProperty.call(normalized, "filters")) {
      const filters = requirePlainObject(normalized.filters, "params.filters");
      assertAllowedFields(filters, ["order_status", "published_from", "published_to", "skus", "status"], "params.filters");
      if (Object.prototype.hasOwnProperty.call(filters, "order_status")) filters.order_status = requireEnum(filters.order_status, "params.filters.order_status", REVIEW_ORDER_STATUSES);
      if (Object.prototype.hasOwnProperty.call(filters, "published_from")) filters.published_from = requireRfc3339DateTime(filters.published_from, "params.filters.published_from");
      if (Object.prototype.hasOwnProperty.call(filters, "published_to")) filters.published_to = requireRfc3339DateTime(filters.published_to, "params.filters.published_to");
      if (filters.published_from && filters.published_to && Date.parse(filters.published_from) > Date.parse(filters.published_to)) {
        fail("INVALID_OPERATION_PARAMS", "params.filters.published_from не может быть позже params.filters.published_to.");
      }
      if (Object.prototype.hasOwnProperty.call(filters, "skus")) validateIdentifierArray(filters.skus, "params.filters.skus", { maximum: 1000, int64: true });
      if (Object.prototype.hasOwnProperty.call(filters, "status")) filters.status = requireEnum(filters.status, "params.filters.status", REVIEW_STATUSES);
    }
    return normalized;
  }

  function normalizeReviewInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["review_id"]);
    requireString(requireField(normalized, "review_id"), "params.review_id", { nonEmpty: false });
    return normalized;
  }

  function normalizeQuestionListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "last_id", "limit", "sort_dir"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", QUESTION_SORT_DIR);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["date_from", "date_to", "status"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "date_from")) filter.date_from = requireRfc3339DateTime(filter.date_from, "params.filter.date_from");
      if (Object.prototype.hasOwnProperty.call(filter, "date_to")) filter.date_to = requireRfc3339DateTime(filter.date_to, "params.filter.date_to");
      if (filter.date_from && filter.date_to && Date.parse(filter.date_from) > Date.parse(filter.date_to)) {
        fail("INVALID_OPERATION_PARAMS", "params.filter.date_from не может быть позже params.filter.date_to.");
      }
      if (Object.prototype.hasOwnProperty.call(filter, "status")) filter.status = requireEnum(filter.status, "params.filter.status", QUESTION_STATUSES);
    }
    return normalized;
  }

  function normalizeReviewCommentListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "limit", "offset", "review_id", "sort_dir"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 20, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireInteger(normalized.offset, "params.offset");
    if (Object.prototype.hasOwnProperty.call(normalized, "review_id")) requireString(normalized.review_id, "params.review_id", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", REVIEW_SORT_DIR);
    let hasFilterSku = false;
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["published_from", "published_to", "sku"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "published_from")) filter.published_from = requireRfc3339DateTime(filter.published_from, "params.filter.published_from");
      if (Object.prototype.hasOwnProperty.call(filter, "published_to")) filter.published_to = requireRfc3339DateTime(filter.published_to, "params.filter.published_to");
      if (filter.published_from && filter.published_to && Date.parse(filter.published_from) > Date.parse(filter.published_to)) {
        fail("INVALID_OPERATION_PARAMS", "params.filter.published_from не может быть позже params.filter.published_to.");
      }
      if (Object.prototype.hasOwnProperty.call(filter, "sku")) {
        requireSafeInt64Number(filter.sku, "params.filter.sku");
        hasFilterSku = true;
      }
    }
    const hasReviewId = Object.prototype.hasOwnProperty.call(normalized, "review_id");
    if (hasReviewId === hasFilterSku) {
      fail("INVALID_OPERATION_PARAMS", "params должен содержать ровно один селектор: review_id или filter.sku.");
    }
    return normalized;
  }

  function normalizeQuestionAnswerListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["last_id", "question_id", "sku"]);
    requireString(requireField(normalized, "question_id"), "params.question_id", { nonEmpty: false });
    requireSafeInt64Number(requireField(normalized, "sku"), "params.sku");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id") && normalized.last_id !== null) {
      requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    }
    return normalized;
  }

  function normalizeQuestionInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["question_id"]);
    requireString(requireField(normalized, "question_id"), "params.question_id", { nonEmpty: false });
    return normalized;
  }

  function normalizeQuestionTopSkuParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    return normalized;
  }


  const EFFECT_REPAIR_PARAM_SCHEMAS = deepFreeze({"report_products_create":{"type":"object","properties":{"language":{"type":"string"},"offer_id":{"type":"array","items":{"type":"string"}},"search":{"type":"string"},"sku":{"type":"array","items":{"type":"integer"}},"visibility":{"type":"string","enum":["ALL","VALIDATION_STATE_FAIL","TO_SUPPLY","IN_SALE","REMOVED_FROM_SALE","PARTIAL_APPROVED","IMAGE_ABSENT","ARCHIVED","AUTO_ARCHIVED","MANUAL_ARCHIVED"]}}},"report_returns_create_v2":{"type":"object","required":["filter"],"properties":{"filter":{"type":"object","required":["date_from","date_to","status"],"properties":{"delivery_schema":{"type":"string","enum":["FBS","FBO","ALL"]},"date_from":{"type":"string","format":"date-time"},"date_to":{"type":"string","format":"date-time"},"status":{"type":"string","enum":["DisputeOpened","OnSellerApproval","ArrivedAtReturnPlace","OnSellerClarification","OnSellerClarificationAfterPartialCompensation","OfferedPartialCompensation","ReturnMoneyApproved","PartialCompensationReturned","CancelledDisputeNotOpen","Rejected","CrmRejected","Cancelled","Approved","ApprovedByOzon","ReceivedBySeller","MovingToSeller","ReturnCompensated","ReturningToSellerByCourier","Utilizing","Utilized","MoneyReturned","PartialCompensationInProcess","DisputeYouOpened","CompensationRejected","DisputeOpening","CompensationOffered","WaitingCompensation","SendingError","CompensationRejectedBySla","CompensationRejectedBySeller","MovingToOzon","ReturnedToOzon","MoneyReturnedBySystem","WaitingShipment"]}}},"language":{"type":"string"}}},"report_postings_create":{"type":"object","required":["filter"],"properties":{"filter":{"type":"object","required":["processed_at_from","processed_at_to","delivery_schema"],"properties":{"cancel_reason_id":{"type":"array","items":{"type":"integer"}},"delivery_schema":{"type":"array","items":{"type":"string"}},"offer_id":{"type":"string"},"processed_at_from":{"type":"string","format":"date-time"},"processed_at_to":{"type":"string","format":"date-time"},"sku":{"type":"array","items":{"type":"integer"}},"status_alias":{"type":"array","items":{"type":"string"}},"statuses":{"type":"array","items":{"type":"integer"}},"title":{"type":"string"},"warehouse_id":{"type":"array","items":{"type":"integer"}},"delivery_method_id":{"type":"array","items":{"type":"integer"}},"is_express":{"type":"boolean"}}},"language":{"type":"string"},"with":{"type":"object","properties":{"additional_data":{"type":"boolean"},"analytics_data":{"type":"boolean"},"customer_data":{"type":"boolean"},"jewelry_codes":{"type":"boolean"}}}}},"report_discounted_create":{"type":"object"},"report_warehouse_stock":{"type":"object","required":["warehouseId"],"properties":{"language":{"type":"string"},"warehouseId":{"type":"array","items":{"type":"string"}}}},"report_placement_by_products_create":{"type":"object","required":["date_from","date_to"],"properties":{"date_from":{"type":"string","format":"date"},"date_to":{"type":"string","format":"date"}}},"report_placement_by_supplies_create":{"type":"object","required":["date_from","date_to"],"properties":{"date_from":{"type":"string","format":"date"},"date_to":{"type":"string","format":"date"}}},"report_marked_products_sales_create":{"type":"object","required":["date"],"properties":{"date":{"type":"object","required":["from","to"],"properties":{"from":{"type":"string","format":"date"},"to":{"type":"string","format":"date"}}}}},"report_realization_posting_create":{"type":"object","required":["month","year"],"properties":{"month":{"type":"integer","minimum":1,"maximum":12},"year":{"type":"integer","minimum":2023}}},"finance_document_b2b_sales":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},"finance_mutual_settlement_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},"finance_compensation_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},"finance_decompensation_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},"cargoes_label_create":{"type":"object","required":["supply_id"],"properties":{"cargoes":{"type":"array","items":{"type":"object","properties":{"cargo_id":{"type":"integer"}}}},"supply_id":{"type":"integer"}}},"posting_fbs_act_container_labels":{"type":"object","required":["id"],"properties":{"id":{"type":"integer"}}},"posting_fbs_package_label":{"type":"object","required":["posting_number"],"properties":{"posting_number":{"type":"array","items":{"type":"string"},"maxItems":20}}},"posting_fbs_package_label_create":{"type":"object","required":["posting_number"],"properties":{"posting_number":{"type":"array","items":{"type":"string"}}}},"cargoes_transport_label_by_order_create":{"type":"object","required":["order_id"],"properties":{"order_id":{"type":"integer"}}},"cargoes_transport_label_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"integer"},"transport_cargo_ids":{"type":"array","maxItems":40,"items":{"type":"string"}}}},"fbp_act_from_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},"fbp_act_to_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},"fbp_label_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},"fbp_draft_direct_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer"},"sku":{"type":"integer"}}}},"warehouse_id":{"type":"integer"}}},"fbp_draft_dropoff_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer"},"sku":{"type":"integer"}}}},"warehouse_id":{"type":"integer"}}},"fbp_draft_pickup_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer"},"sku":{"type":"integer"}}}},"warehouse_id":{"type":"integer"}}},"chat_history_v3":{"type":"object","required":["chat_id"],"properties":{"chat_id":{"type":"string"},"direction":{"type":"string"},"filter":{"type":"object","properties":{"message_ids":{"type":"array","items":{"type":"string"}}}},"from_message_id":{"type":"integer"},"limit":{"type":"integer"}}}});

  function validateEffectRepairValue(value, schema, path) {
    if (!schema || typeof schema !== "object") return;
    if (Array.isArray(schema.enum) && schema.enum.length && !schema.enum.includes(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть одним из: ${schema.enum.join(", ")}.`);
    const type = schema.type;
    if (type === "object") {
      const object = requirePlainObject(value, path);
      const properties = schema.properties || {};
      assertAllowedFields(object, Object.keys(properties));
      for (const key of schema.required || []) requireField(object, key);
      for (const [key, child] of Object.entries(object)) if (Object.prototype.hasOwnProperty.call(properties, key)) validateEffectRepairValue(child, properties[key], `${path}.${key}`);
      return;
    }
    if (type === "array") {
      const array = requireArray(value, path);
      if (Number.isInteger(schema.maxItems) && array.length > schema.maxItems) fail("INVALID_OPERATION_PARAMS", `${path} содержит слишком много элементов.`);
      if (Number.isInteger(schema.minItems) && array.length < schema.minItems) fail("INVALID_OPERATION_PARAMS", `${path} содержит слишком мало элементов.`);
      for (let index = 0; index < array.length; index += 1) validateEffectRepairValue(array[index], schema.items || {}, `${path}[${index}]`);
      return;
    }
    if (type === "integer") { if (!Number.isInteger(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть целым числом.`); if (Number.isFinite(schema.minimum) && value < schema.minimum) fail("INVALID_OPERATION_PARAMS", `${path} должен быть >= ${schema.minimum}.`); if (Number.isFinite(schema.maximum) && value > schema.maximum) fail("INVALID_OPERATION_PARAMS", `${path} должен быть <= ${schema.maximum}.`); return; }
    if (type === "number") { if (typeof value !== "number" || !Number.isFinite(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть конечным числом.`); return; }
    if (type === "boolean") { if (typeof value !== "boolean") fail("INVALID_OPERATION_PARAMS", `${path} должен быть boolean.`); return; }
    if (type === "string" || !type) {
      if (typeof value !== "string") fail("INVALID_OPERATION_PARAMS", `${path} должен быть строкой.`);
      if (Number.isInteger(schema.maxLength) && value.length > schema.maxLength) fail("INVALID_OPERATION_PARAMS", `${path} длиннее допустимого.`);
      if (schema.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть датой YYYY-MM-DD.`);
      if (schema.format === "month" && !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть периодом YYYY-MM.`);
      if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть ISO date-time.`);
    }
  }

  function normalizeEffectRepairParams(operation, params) {
    const schema = EFFECT_REPAIR_PARAM_SCHEMAS[operation];
    if (!schema) fail("INVALID_OPERATION_PARAMS", `Для ${operation} отсутствует effect-repair schema.`);
    const normalized = requirePlainObject(params, "params");
    validateEffectRepairValue(normalized, schema, "params");

    if (operation === "report_placement_by_products_create" || operation === "report_placement_by_supplies_create") {
      const start = Date.parse(`${normalized.date_from}T00:00:00Z`);
      const end = Date.parse(`${normalized.date_to}T00:00:00Z`);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) fail("INVALID_OPERATION_PARAMS", "params.date_to должен быть не раньше params.date_from.");
      if ((end - start) / 86400000 > 30) fail("INVALID_OPERATION_PARAMS", "Период placement-отчёта не может превышать 31 календарный день.");
    }
    if (operation === "report_marked_products_sales_create") {
      const start = Date.parse(`${normalized.date.from}T00:00:00Z`);
      const end = Date.parse(`${normalized.date.to}T00:00:00Z`);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) fail("INVALID_OPERATION_PARAMS", "params.date.to должен быть не раньше params.date.from.");
    }
    return normalized;
  }


  function normalizeReportFileGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["file_ref", "sheet", "offset", "limit"]);
    const value = requireString(requireField(normalized, "file_ref"), "params.file_ref");
    if (!/^rpf_[A-Za-z0-9_-]{12,120}$/.test(value)) fail("INVALID_OPERATION_PARAMS", "params.file_ref должен быть opaque report file ref bridge.");
    normalized.file_ref = value;
    if (Object.prototype.hasOwnProperty.call(normalized, "sheet")) requireString(normalized.sheet, "params.sheet");
    if (!Object.prototype.hasOwnProperty.call(normalized, "offset")) normalized.offset = 0;
    if (!Object.prototype.hasOwnProperty.call(normalized, "limit")) normalized.limit = 200;
    requireInteger(normalized.offset, "params.offset", { minimum: 0, maximum: 1000000 });
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 500 });
    return normalized;
  }

  function normalizeSupplyOrderListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "last_id", "limit", "sort_by", "sort_dir"]);
    const filter = requirePlainObject(requireField(normalized, "filter"), "params.filter");
    assertAllowedFields(filter, ["dropoff_warehouse_ids", "order_number_search", "states", "timeslot_from_range"], "params.filter");
    validateEnumArray(requireField(filter, "states", "params.filter"), "params.filter.states", SUPPLY_ORDER_STATES);
    if (Object.prototype.hasOwnProperty.call(filter, "dropoff_warehouse_ids")) {
      validateIdentifierArray(filter.dropoff_warehouse_ids, "params.filter.dropoff_warehouse_ids", { int64: true });
    }
    if (Object.prototype.hasOwnProperty.call(filter, "order_number_search")) {
      const query = requireString(filter.order_number_search, "params.filter.order_number_search");
      if (query.trim().length < 3) fail("OZON_LIMIT_VIOLATION", "params.filter.order_number_search: минимум 3 символа по контракту Ozon.");
    }
    if (Object.prototype.hasOwnProperty.call(filter, "timeslot_from_range")) {
      const range = requirePlainObject(filter.timeslot_from_range, "params.filter.timeslot_from_range");
      assertAllowedFields(range, ["from", "timeslot_filter_type", "to"], "params.filter.timeslot_from_range");
      if (Object.prototype.hasOwnProperty.call(range, "from")) range.from = requireRfc3339DateTime(range.from, "params.filter.timeslot_from_range.from");
      if (Object.prototype.hasOwnProperty.call(range, "to")) range.to = requireRfc3339DateTime(range.to, "params.filter.timeslot_from_range.to");
      if (Object.prototype.hasOwnProperty.call(range, "timeslot_filter_type")) {
        range.timeslot_filter_type = requireEnum(range.timeslot_filter_type, "params.filter.timeslot_from_range.timeslot_filter_type", SUPPLY_ORDER_TIMESLOT_FILTER_TYPES);
      }
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    normalized.sort_by = requireEnum(requireField(normalized, "sort_by"), "params.sort_by", SUPPLY_ORDER_SORT_BY);
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", SUPPLY_ORDER_SORT_DIR);
    return normalized;
  }

  function normalizeSupplyOrderGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertMaxItems(requireField(normalized, "order_ids"), "params.order_ids", 50);
    return normalized;
  }

  function normalizeSupplyOrderBundleParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["bundle_ids", "is_asc", "item_tags_calculation", "last_id", "limit", "query", "sort_field"]);
    validateIdentifierArray(requireField(normalized, "bundle_ids"), "params.bundle_ids", { minimum: 1, maximum: 100 });
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "is_asc") && typeof normalized.is_asc !== "boolean") {
      fail("INVALID_OPERATION_PARAMS", "params.is_asc должен быть boolean.");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "item_tags_calculation")) {
      const tags = requirePlainObject(normalized.item_tags_calculation, "params.item_tags_calculation");
      assertAllowedFields(tags, ["dropoff_warehouse_id", "storage_warehouse_ids"], "params.item_tags_calculation");
      requireString(requireField(tags, "dropoff_warehouse_id", "params.item_tags_calculation"), "params.item_tags_calculation.dropoff_warehouse_id");
      validateIdentifierArray(requireField(tags, "storage_warehouse_ids", "params.item_tags_calculation"), "params.item_tags_calculation.storage_warehouse_ids", { maximum: 25 });
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireString(normalized.last_id, "params.last_id", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "query")) requireString(normalized.query, "params.query", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_field")) normalized.sort_field = requireEnum(normalized.sort_field, "params.sort_field", SUPPLY_ORDER_BUNDLE_SORT_FIELDS);
    return normalized;
  }

  function normalizeSupplyOrderTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["order_id"]);
    requireSafeInt64Number(requireField(normalized, "order_id"), "params.order_id");
    return normalized;
  }

  function normalizeSupplyOrderDetailsParams(params) {
    const normalized = requirePlainObject(params, "params");
    requireInteger(requireField(normalized, "order_id"), "params.order_id");
    return normalized;
  }

  function normalizeSupplyOrderOperationIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["operation_id"]);
    requireString(requireField(normalized, "operation_id"), "params.operation_id", { nonEmpty: false });
    return normalized;
  }

  function normalizeSupplyOrderActProductGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["supply_id"]);
    requireSafeInt64Number(requireField(normalized, "supply_id"), "params.supply_id");
    return normalized;
  }

  function normalizeSupplyOrderActSummaryGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["order_id"]);
    requireSafeInt64Number(requireField(normalized, "order_id"), "params.order_id");
    return normalized;
  }

  function normalizeSupplyOrderContentUpdateValidationParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["new_bundle_id", "supply_id"]);
    requireString(requireField(normalized, "new_bundle_id"), "params.new_bundle_id", { nonEmpty: false });
    requireSafeInt64Number(requireField(normalized, "supply_id"), "params.supply_id");
    return normalized;
  }

  function normalizeFboDraftIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["draft_id"]);
    requireSafeInt64Number(requireField(normalized, "draft_id"), "params.draft_id");
    return normalized;
  }

  function normalizeFboDraftClusterListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cluster_ids", "cluster_type"]);
    normalized.cluster_type = requireEnum(requireField(normalized, "cluster_type"), "params.cluster_type", ["CLUSTER_TYPE_OZON", "CLUSTER_TYPE_CIS"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cluster_ids")) validateIdentifierArray(normalized.cluster_ids, "params.cluster_ids", { int64: true });
    return normalized;
  }

  function normalizeFboDraftWarehouseListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter_by_supply_type", "search"]);
    validateEnumArray(requireField(normalized, "filter_by_supply_type"), "params.filter_by_supply_type", ["CREATE_TYPE_CROSSDOCK", "CREATE_TYPE_DIRECT"]);
    const search = requireField(normalized, "search");
    if (typeof search !== "string") fail("INVALID_OPERATION_PARAMS", "params.search должен быть строкой.");
    if ([...search].length < 4) fail("OZON_LIMIT_VIOLATION", "params.search: минимум 4 символа по контракту Ozon.");
    return normalized;
  }

  function normalizeFboDraftTimeslotInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date_from", "date_to", "draft_id", "selected_cluster_warehouses", "supply_type"]);
    normalized.date_from = requireString(requireField(normalized, "date_from"), "params.date_from", { nonEmpty: false });
    normalized.date_to = requireString(requireField(normalized, "date_to"), "params.date_to", { nonEmpty: false });
    requireSafeInt64Number(requireField(normalized, "draft_id"), "params.draft_id");
    normalized.supply_type = requireEnum(requireField(normalized, "supply_type"), "params.supply_type", ["CROSSDOCK", "DIRECT", "MULTI_CLUSTER"]);
    const warehouses = assertMaxItems(requireField(normalized, "selected_cluster_warehouses"), "params.selected_cluster_warehouses", 20);
    for (let index = 0; index < warehouses.length; index += 1) {
      const item = requirePlainObject(warehouses[index], `params.selected_cluster_warehouses[${index}]`);
      assertAllowedFields(item, ["macrolocal_cluster_id", "storage_warehouse_id"], `params.selected_cluster_warehouses[${index}]`);
      if (Object.prototype.hasOwnProperty.call(item, "macrolocal_cluster_id")) requireSafeInt64Number(item.macrolocal_cluster_id, `params.selected_cluster_warehouses[${index}].macrolocal_cluster_id`);
      if (Object.prototype.hasOwnProperty.call(item, "storage_warehouse_id")) requireSafeInt64Number(item.storage_warehouse_id, `params.selected_cluster_warehouses[${index}].storage_warehouse_id`);
    }
    return normalized;
  }

  function normalizeFbpWarehouseIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }

  function normalizeFbpDropoffPointListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["next_page_number", "page_size", "province_uuid", "warehouse_id"]);
    requireInt32Number(requireField(normalized, "page_size"), "params.page_size");
    normalized.province_uuid = requireString(requireField(normalized, "province_uuid"), "params.province_uuid", { nonEmpty: false });
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "next_page_number")) requireInt32Number(normalized.next_page_number, "params.next_page_number");
    return normalized;
  }

  function normalizeFbpDropoffTimetableParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["drop_off_point_id", "province_uuid", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "drop_off_point_id"), "params.drop_off_point_id");
    normalized.province_uuid = requireString(requireField(normalized, "province_uuid"), "params.province_uuid", { nonEmpty: false });
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }

  function normalizeFbpDraftDirectTimeslotParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["bundle_id", "interval_end", "interval_start", "warehouse_id"]);
    normalized.bundle_id = requireString(requireField(normalized, "bundle_id"), "params.bundle_id", { nonEmpty: false });
    normalized.interval_end = requireRfc3339DateTime(requireField(normalized, "interval_end"), "params.interval_end");
    normalized.interval_start = requireRfc3339DateTime(requireField(normalized, "interval_start"), "params.interval_start");
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }

  function normalizeFbpOrderDirectTimeslotParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["interval_end", "interval_start", "supply_id"]);
    normalized.interval_end = requireRfc3339DateTime(requireField(normalized, "interval_end"), "params.interval_end");
    normalized.interval_start = requireRfc3339DateTime(requireField(normalized, "interval_start"), "params.interval_start");
    normalized.supply_id = requireString(requireField(normalized, "supply_id"), "params.supply_id", { nonEmpty: false });
    return normalized;
  }

  function normalizeFboCargoesSupplyIdsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["supply_ids"]);
    validateIdentifierArray(requireField(normalized, "supply_ids"), "params.supply_ids", { maximum: 100, int64: true });
    return normalized;
  }

  function normalizeFboCargoesSupplyIds50Params(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["supply_ids"]);
    validateIdentifierArray(requireField(normalized, "supply_ids"), "params.supply_ids", { maximum: 50, int64: true });
    return normalized;
  }

  function normalizeFboCargoesV2GetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["supplies"]);
    const supplies = requireField(normalized, "supplies");
    if (!Array.isArray(supplies)) fail("INVALID_OPERATION_PARAMS", "params.supplies должен быть массивом.");
    if (supplies.length > 100) fail("OZON_LIMIT_VIOLATION", "params.supplies: максимум 100 элементов по контракту Ozon.");
    for (let i = 0; i < supplies.length; i += 1) {
      const item = requirePlainObject(supplies[i], `params.supplies[${i}]`);
      assertAllowedFields(item, ["cargo_ids", "supply_id"]);
      validateIdentifierArray(requireField(item, "cargo_ids"), `params.supplies[${i}].cargo_ids`, { int64: true });
      requireSafeInt64Number(requireField(item, "supply_id"), `params.supplies[${i}].supply_id`);
    }
    return normalized;
  }

  function normalizeProductVisibilityInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "skus")) validateIdentifierArray(normalized.skus, "params.skus", { minimum: 1, maximum: 350, int64: true });
    return normalized;
  }

  function normalizeProductQuantListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit", "visibility"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "visibility")) normalized.visibility = requireEnum(normalized.visibility, "params.visibility", [
      "ALL","VISIBLE","INVISIBLE","EMPTY_STOCK","NOT_MODERATED","MODERATED","DISABLED","STATE_FAILED","READY_TO_SUPPLY",
      "VALIDATION_STATE_PENDING","VALIDATION_STATE_FAIL","VALIDATION_STATE_SUCCESS","TO_SUPPLY","IN_SALE","REMOVED_FROM_SALE",
      "OVERPRICED","CRITICALLY_OVERPRICED","EMPTY_BARCODE","BARCODE_EXISTS","QUARANTINE","ARCHIVED","OVERPRICED_WITH_STOCK","PARTIAL_APPROVED"
    ]);
    return normalized;
  }

  function normalizeProductQuantInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["quant_code"]);
    const values = requireArray(requireField(normalized, "quant_code"), "params.quant_code");
    if (values.length < 1) fail("OZON_LIMIT_VIOLATION", "params.quant_code: минимум 1 элемент по контракту Ozon.");
    if (values.length > 1000) fail("OZON_LIMIT_VIOLATION", "params.quant_code: максимум 1000 элементов по контракту Ozon.");
    for (let i = 0; i < values.length; i += 1) requireString(values[i], `params.quant_code[${i}]`, { nonEmpty: false });
    return normalized;
  }

  function normalizeProductPlacementZoneInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    validateIdentifierArray(requireField(normalized, "skus"), "params.skus", { minimum: 1, maximum: 150, int64: true });
    return normalized;
  }

  function normalizeProductStairwayDiscountByQuantityParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    validateIdentifierArray(requireField(normalized, "skus"), "params.skus", { maximum: 5000, int64: true });
    return normalized;
  }

  function normalizeProductFbsWarehouseStocksParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }

  function normalizeFbsCarriageAvailableListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["delivery_method_id", "departure_date"]);
    requireSafeInt64Number(requireField(normalized, "delivery_method_id"), "params.delivery_method_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "departure_date")) normalized.departure_date = requireRfc3339DateTime(normalized.departure_date, "params.departure_date");
    return normalized;
  }

  function normalizeFbsCarriageGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["carriage_id"]);
    requireSafeInt64Number(requireField(normalized, "carriage_id"), "params.carriage_id");
    return normalized;
  }

  function normalizeFbsActListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { maximum: 50 });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["date_from", "date_to", "integration_type", "status"], "params.filter");
      requireString(requireField(filter, "date_from", "params.filter"), "params.filter.date_from", { nonEmpty: false });
      requireString(requireField(filter, "date_to", "params.filter"), "params.filter.date_to", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "integration_type")) requireString(filter.integration_type, "params.filter.integration_type", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "status")) {
        const statuses = requireArray(filter.status, "params.filter.status");
        for (let i = 0; i < statuses.length; i += 1) requireString(statuses[i], `params.filter.status[${i}]`, { nonEmpty: false });
      }
    }
    return normalized;
  }

  function normalizeFbsActCheckStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["id"]);
    requireSafeInt64Number(requireField(normalized, "id"), "params.id");
    return normalized;
  }

  function normalizeAssemblyCarriageFilter(filter, pathName) {
    const normalized = requirePlainObject(filter, pathName);
    assertAllowedFields(normalized, ["carriage_id", "cutoff_from", "cutoff_to", "delivery_method_id"], pathName);
    requireSafeInt64Number(requireField(normalized, "carriage_id", pathName), `${pathName}.carriage_id`);
    if (Object.prototype.hasOwnProperty.call(normalized, "cutoff_from")) normalized.cutoff_from = requireRfc3339DateTime(normalized.cutoff_from, `${pathName}.cutoff_from`);
    if (Object.prototype.hasOwnProperty.call(normalized, "cutoff_to")) normalized.cutoff_to = requireRfc3339DateTime(normalized.cutoff_to, `${pathName}.cutoff_to`);
    if (Object.prototype.hasOwnProperty.call(normalized, "delivery_method_id")) requireSafeInt64Number(normalized.delivery_method_id, `${pathName}.delivery_method_id`);
    return normalized;
  }

  function normalizeAssemblyCarriageListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    normalizeAssemblyCarriageFilter(requireField(normalized, "filter"), "params.filter");
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }

  function normalizeAssemblyFbsFilter(filter, pathName) {
    const normalized = requirePlainObject(filter, pathName);
    assertAllowedFields(normalized, ["cutoff_from", "cutoff_to", "delivery_method_id"], pathName);
    normalized.cutoff_from = requireRfc3339DateTime(requireField(normalized, "cutoff_from", pathName), `${pathName}.cutoff_from`);
    normalized.cutoff_to = requireRfc3339DateTime(requireField(normalized, "cutoff_to", pathName), `${pathName}.cutoff_to`);
    if (Object.prototype.hasOwnProperty.call(normalized, "delivery_method_id")) {
      requireSafeInt64Number(normalized.delivery_method_id, `${pathName}.delivery_method_id`);
      requireInteger(normalized.delivery_method_id, `${pathName}.delivery_method_id`, { maximum: 1000 });
    }
    return normalized;
  }

  function normalizeAssemblyFbsPostingListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir"]);
    normalizeAssemblyFbsFilter(requireField(normalized, "filter"), "params.filter");
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { maximum: 1000 });
    normalized.sort_dir = requireEnum(requireField(normalized, "sort_dir"), "params.sort_dir", ["ASC", "DESC"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }

  function normalizeAssemblyFbsProductListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filter", "limit", "offset", "sort_dir"]);
    normalizeAssemblyFbsFilter(requireField(normalized, "filter"), "params.filter");
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireSafeInt64Number(normalized.offset, "params.offset");
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    return normalized;
  }

  function normalizeFbsCarriageContainerGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["container_id"]);
    requireSafeInt64Number(requireField(normalized, "container_id"), "params.container_id");
    return normalized;
  }

  function normalizeFbsCarriageContainerListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) {
      requireSafeInt64Number(normalized.limit, "params.limit");
      requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 300 });
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["cargo_type", "created_from", "created_to", "sort_type", "statuses", "warehouse_id"], "params.filter");
      filter.created_from = requireRfc3339DateTime(requireField(filter, "created_from", "params.filter"), "params.filter.created_from");
      filter.created_to = requireRfc3339DateTime(requireField(filter, "created_to", "params.filter"), "params.filter.created_to");
      requireString(requireField(filter, "sort_type", "params.filter"), "params.filter.sort_type", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "cargo_type")) requireString(filter.cargo_type, "params.filter.cargo_type", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "statuses")) {
        const values = requireArray(filter.statuses, "params.filter.statuses");
        for (let i = 0; i < values.length; i += 1) requireString(values[i], `params.filter.statuses[${i}]`, { nonEmpty: false });
      }
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_id")) requireSafeInt64Number(filter.warehouse_id, "params.filter.warehouse_id");
    }
    return normalized;
  }

  function normalizeFbsCarriageContainerStatusGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["container_ids"]);
    validateIdentifierArray(requireField(normalized, "container_ids"), "params.container_ids", { int64: true });
    return normalized;
  }

  function normalizeFbsCarriageContainerTaskInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["task_id"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "task_id")) requireSafeInt64Number(normalized.task_id, "params.task_id");
    return normalized;
  }

  function normalizeFbsProductCountryListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["name_search"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "name_search")) requireString(normalized.name_search, "params.name_search", { nonEmpty: false });
    return normalized;
  }

  function normalizeFbsPostingRestrictionsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number"]);
    requireString(requireField(normalized, "posting_number"), "params.posting_number");
    return normalized;
  }

  function normalizeFbsPostingTimeslotChangeRestrictionsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number"]);
    normalized.posting_number = requireString(requireField(normalized, "posting_number"), "params.posting_number", { nonEmpty: false });
    return normalized;
  }

  function normalizeFbsActGetPostingsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["id"]);
    requireSafeInt64Number(requireField(normalized, "id"), "params.id");
    return normalized;
  }

  function normalizeWarehouseFbsReturnMileCheckParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["country_code", "first_mile_type", "is_kgt", "warehouse_id"]);
    requireString(requireField(normalized, "country_code"), "params.country_code");
    normalized.first_mile_type = requireEnum(requireField(normalized, "first_mile_type"), "params.first_mile_type", ["PICK_UP", "DROP_OFF"]);
    if (typeof requireField(normalized, "is_kgt") !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.is_kgt должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_id")) requireSafeInt64Number(normalized.warehouse_id, "params.warehouse_id");
    return normalized;
  }

  function normalizeWarehouseFbsReturnMileInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_ids"]);
    validateIdentifierArray(requireField(normalized, "warehouse_ids"), "params.warehouse_ids", { int64: true });
    return normalized;
  }

  function normalizeProductImportInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["task_id"]);
    requireSafeInt64Number(requireField(normalized, "task_id"), "params.task_id");
    return normalized;
  }

  function normalizeProductActionTimerStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["product_ids"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "product_ids")) validateIdentifierArray(normalized.product_ids, "params.product_ids", { int64: true });
    return normalized;
  }

  function normalizeWarehouseOperationStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["operation_id"]);
    requireString(requireField(normalized, "operation_id"), "params.operation_id");
    return normalized;
  }

  function normalizeFbsCarriageEttnStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["carriage_id"]);
    requireSafeInt64Number(requireField(normalized, "carriage_id"), "params.carriage_id");
    return normalized;
  }

  function normalizeFbsTraceableAttributeListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number"]);
    requireString(requireField(normalized, "posting_number"), "params.posting_number");
    return normalized;
  }

  function normalizePassthroughParams(params) {
    if (!params || typeof params !== "object" || Array.isArray(params) || Object.getPrototypeOf(params) !== Object.prototype) {
      fail("INVALID_OPERATION_PARAMS", "params должен быть JSON-объектом.");
    }
    return params;
  }

  function normalizeEmptyParams(params) {
    const normalized = normalizePassthroughParams(params);
    if (Object.keys(normalized).length !== 0) fail("ROLES_PARAMS_MUST_BE_EMPTY", "roles не принимает params.");
    return {};
  }

  function normalizeNoBodyParams(params) {
    const normalized = normalizePassthroughParams(params);
    if (Object.keys(normalized).length !== 0) fail("INVALID_OPERATION_PARAMS", "Эта операция не принимает request body/params по контракту Ozon.");
    return {};
  }

  function normalizePostingFbsGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number", "with"]);
    const postingNumber = String(requireField(normalized, "posting_number") ?? "").trim();
    if (!postingNumber) fail("INVALID_OPERATION_PARAMS", "params.posting_number должен быть непустой строкой.");
    normalized.posting_number = postingNumber;
    if (Object.prototype.hasOwnProperty.call(normalized, "with")) {
      const withBlock = requirePlainObject(normalized.with, "params.with");
      assertAllowedFields(withBlock, ["analytics_data", "barcodes", "financial_data", "legal_info", "product_exemplars", "related_postings", "translit"], "params.with");
      for (const [key, value] of Object.entries(withBlock)) {
        if (typeof value !== "boolean") fail("INVALID_OPERATION_PARAMS", `params.with.${key} должен быть boolean.`);
      }
    }
    return normalized;
  }

  function authorizedPersonalDataReadResult(rawResult) {
    // The global operator policy gate runs before any provider request. Once ON,
    // the model-visible result may contain the requested personal fields, while
    // transport/auth injection remains impossible and diagnostics stay payload-free.
    return sanitizeJsonValue(rawResult, "result", { rejectTransportKeys: false });
  }

  function safeReadResult(rawResult, context = {}) {
    return redactSensitiveResult(rawResult, context);
  }

  function normalizeStep5OperationIdParams(params, { required = true } = {}) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["operation_id"]);
    if (required) requireString(requireField(normalized, "operation_id"), "params.operation_id");
    else if (Object.prototype.hasOwnProperty.call(normalized, "operation_id")) requireString(normalized.operation_id, "params.operation_id");
    return normalized;
  }

  function normalizeStep5CarriageIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["carriage_id"]);
    requireSafeInt64Number(requireField(normalized, "carriage_id"), "params.carriage_id");
    return normalized;
  }

  function normalizeStep5ContainerIdsParams(params, { required = true, maximum = null } = {}) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["container_ids"]);
    if (required) {
      const values = validateIdentifierArray(requireField(normalized, "container_ids"), "params.container_ids", { int64: true });
      if (maximum !== null && values.length > maximum) fail("OZON_LIMIT_VIOLATION", `params.container_ids: максимум ${maximum} элементов по контракту Ozon.`);
    } else if (Object.prototype.hasOwnProperty.call(normalized, "container_ids")) {
      const values = validateIdentifierArray(normalized.container_ids, "params.container_ids", { int64: true });
      if (maximum !== null && values.length > maximum) fail("OZON_LIMIT_VIOLATION", `params.container_ids: максимум ${maximum} элементов по контракту Ozon.`);
    }
    return normalized;
  }

  function normalizeStep5DeliveryPointInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["map_point_ids"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "map_point_ids")) {
      validateIdentifierArray(normalized.map_point_ids, "params.map_point_ids", { maximum: 100, int64: true });
    }
    return normalized;
  }

  function normalizeStep5FileUuidParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["file_uuid"]);
    requireString(requireField(normalized, "file_uuid"), "params.file_uuid");
    return normalized;
  }

  function normalizeStep5CodeSupplyParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["code", "supply_id"]);
    requireString(requireField(normalized, "code"), "params.code");
    requireString(requireField(normalized, "supply_id"), "params.supply_id");
    return normalized;
  }

  function normalizeStep5TaskIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["task_id"]);
    requireSafeInt64Number(requireField(normalized, "task_id"), "params.task_id");
    return normalized;
  }

  function normalizeStep5FbsStocksByWarehouseParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["sku", "offer_id"]);
    const hasSku = Object.prototype.hasOwnProperty.call(normalized, "sku");
    const hasOffer = Object.prototype.hasOwnProperty.call(normalized, "offer_id");
    if (hasSku === hasOffer) fail("INVALID_OPERATION_PARAMS", "params должен содержать ровно одно из полей sku или offer_id по oneOf контракту Ozon.");
    if (hasSku) validateIdentifierArray(normalized.sku, "params.sku", { int64: true });
    if (hasOffer) validateIdentifierArray(normalized.offer_id, "params.offer_id", { int64: true });
    return normalized;
  }

  function normalizeStep5SingleStringParam(params, field) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, [field]);
    requireString(requireField(normalized, field), `params.${field}`);
    return normalized;
  }

  function normalizeStep5ActionIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["action_id"]);
    requireSafeUint64Number(requireField(normalized, "action_id"), "params.action_id");
    return normalized;
  }

  function normalizeStep5IdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["id"]);
    requireSafeInt64Number(requireField(normalized, "id"), "params.id");
    return normalized;
  }

  function normalizeStep5CertificationParamsV2(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["params"]);
    if (!Object.prototype.hasOwnProperty.call(normalized, "params")) return normalized;
    const certificate = requirePlainObject(normalized.params, "params.params");
    assertAllowedFields(certificate, [
      "accordance_type", "certificate_country", "certificate_type", "expired_date", "files",
      "issue_date", "link_to_registry", "name", "number", "product_type", "skus"
    ], "params.params");
    if (Object.prototype.hasOwnProperty.call(certificate, "accordance_type")) certificate.accordance_type = requireEnum(certificate.accordance_type, "params.params.accordance_type", ["UNKNOWN","EAEU","NATIONAL","TECHNICAL_REGULATIONS_RF","TECHNICAL_REGULATIONS_CU","GOST","CHEMICAL_PRODUCTS","SAFETY_DATA_SHEET","REJECTION_LETTER"]);
    if (Object.prototype.hasOwnProperty.call(certificate, "certificate_country")) {
      requireString(certificate.certificate_country, "params.params.certificate_country", { nonEmpty: false });
      if ([...certificate.certificate_country].length > 2) fail("OZON_LIMIT_VIOLATION", "params.params.certificate_country: максимум 2 символа по контракту Ozon.");
    }
    if (Object.prototype.hasOwnProperty.call(certificate, "certificate_type")) certificate.certificate_type = requireEnum(certificate.certificate_type, "params.params.certificate_type", ["UNKNOWN","CERTIFICATE_OF_CONFORMITY","DECLARATION","CERTIFICATE_OF_REGISTRATION","REGISTRATION_CERTIFICATE","REFUSED_LETTER","VETERINARY_COVER_DOCUMENT","SAFETY_DATA_SHEET"]);
    if (Object.prototype.hasOwnProperty.call(certificate, "expired_date")) {
      const expired = requirePlainObject(certificate.expired_date, "params.params.expired_date");
      assertAllowedFields(expired, ["date", "infinite"], "params.params.expired_date");
      if (Object.prototype.hasOwnProperty.call(expired, "infinite") && typeof expired.infinite !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.params.expired_date.infinite должен быть boolean.");
      if (Object.prototype.hasOwnProperty.call(expired, "date")) {
        const date = requirePlainObject(expired.date, "params.params.expired_date.date");
        assertAllowedFields(date, ["day", "month", "year"], "params.params.expired_date.date");
        if (Object.prototype.hasOwnProperty.call(date, "day")) requireInteger(date.day, "params.params.expired_date.date.day", { minimum: 0, maximum: 31 });
        if (Object.prototype.hasOwnProperty.call(date, "month")) requireInteger(date.month, "params.params.expired_date.date.month", { minimum: 0, maximum: 12 });
        if (Object.prototype.hasOwnProperty.call(date, "year")) requireInteger(date.year, "params.params.expired_date.date.year", { minimum: 0, maximum: 9999 });
      }
    }
    if (Object.prototype.hasOwnProperty.call(certificate, "files")) {
      const files = requireArray(certificate.files, "params.params.files");
      for (let index = 0; index < files.length; index += 1) {
        const file = requirePlainObject(files[index], `params.params.files[${index}]`);
        assertAllowedFields(file, ["file_content", "name"], `params.params.files[${index}]`);
        requireString(requireField(file, "file_content", `params.params.files[${index}]`), `params.params.files[${index}].file_content`, { nonEmpty: false });
        requireString(requireField(file, "name", `params.params.files[${index}]`), `params.params.files[${index}].name`);
      }
    }
    if (Object.prototype.hasOwnProperty.call(certificate, "issue_date")) certificate.issue_date = requireRfc3339DateTime(certificate.issue_date, "params.params.issue_date");
    for (const field of ["link_to_registry", "name", "number"]) {
      if (Object.prototype.hasOwnProperty.call(certificate, field)) requireString(certificate[field], `params.params.${field}`, { nonEmpty: false });
    }
    if (Object.prototype.hasOwnProperty.call(certificate, "product_type")) certificate.product_type = requireEnum(certificate.product_type, "params.params.product_type", ["UNKNOWN","PRODUCTS_SUBJECT_TO_REGISTRATION","PESTICIDE","AGROCHEMICAL","FEED_ADDITIVE","MEDICAL_PRODUCT","MEDICINE","VETERINARY_DRUG","PHARMACEUTICAL_SUBSTANCE"]);
    if (Object.prototype.hasOwnProperty.call(certificate, "skus")) validateIdentifierArray(certificate.skus, "params.params.skus", { int64: true });
    return normalized;
  }

  const PERFORMANCE_MUTATION_BLOCKLIST = deepFreeze([
    { method: "POST", path: "/api/client/campaign/cpc/v2/product", reason: "create_campaign" },
    { method: "POST", path: "/api/client/campaign/{campaignId}/activate", reason: "activate_campaign" },
    { method: "POST", path: "/api/client/campaign/{campaignId}/deactivate", reason: "deactivate_campaign" },
    { method: "PATCH", path: "/api/client/campaign/{campaignId}", reason: "edit_campaign" },
    { method: "POST", path: "/api/client/campaign/{campaignId}/products", reason: "add_campaign_products" },
    { method: "PUT", path: "/api/client/campaign/{campaignId}/products", reason: "update_product_bids" },
    { method: "POST", path: "/api/client/campaign/{campaignId}/products/delete", reason: "delete_campaign_products" },
    { method: "POST", path: "/api/client/campaign/search_promo/v2/bids/set", reason: "set_search_promo_bid" },
    { method: "POST", path: "/api/client/search_promo/product/enable", reason: "enable_search_promo" },
    { method: "POST", path: "/api/client/search_promo/product/disable", reason: "disable_search_promo" },
    { method: "POST", path: "/api/client/campaign/search_promo/v2/bids/delete", reason: "delete_search_promo_bid" },
    { method: "GET", path: "/api/client/campaign/all_sku_promo/activate", reason: "activate_all_sku_promo" },
    { method: "GET", path: "/api/client/campaign/all_sku_promo/deactivate", reason: "deactivate_all_sku_promo" },
    { method: "GET", path: "/api/client/campaign/all_sku_promo/set_bid", reason: "set_all_sku_promo_bid" },
    { method: "POST", path: "/api/client/campaign/search_promo/carrots/enable", reason: "enable_carrots" },
    { method: "POST", path: "/api/client/campaign/search_promo/carrots/disable", reason: "disable_carrots" }
  ]);

  const PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST = deepFreeze([
    { method: "POST", path: "/api/client/statistics", reason: "create_campaign_statistics_report" },
    { method: "POST", path: "/api/client/statistics/video", reason: "create_video_statistics_report" },
    { method: "POST", path: "/api/client/statistics/attribution", reason: "create_attribution_report" },
    { method: "POST", path: "/api/client/statistic/orders/generate", reason: "create_search_promo_orders_report" },
    { method: "POST", path: "/api/client/statistic/products/generate", reason: "create_search_promo_products_report" },
    { method: "GET", path: "/api/client/statistics/all_sku_promo/orders/generate", reason: "create_all_sku_orders_report" },
    { method: "GET", path: "/api/client/statistics/all_sku_promo/products/generate", reason: "create_all_sku_products_report" },
    { method: "POST", path: "/api/client/statistics/phrases", reason: "create_search_phrases_report" },
    { method: "POST", path: "/api/client/vendors/statistics", reason: "create_vendor_statistics_report" }
  ]);

  function assertAllowedFields(object, allowed, path = "params") {
    const allowedSet = new Set(allowed);
    const extra = Object.keys(object).filter((key) => !allowedSet.has(key));
    if (extra.length) fail("UNKNOWN_OPERATION_PARAM", `${path}: неизвестные поля: ${extra.join(", ")}`);
  }

  function requireDateYmd(value, path) {
    const text = String(value ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть датой ГГГГ-ММ-ДД.`);
    const parsed = new Date(`${text}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) fail("INVALID_OPERATION_PARAMS", `${path} содержит некорректную дату.`);
    return text;
  }

  function validateOptionalCampaignIds(value, path) {
    const array = requireArray(value, path);
    for (let index = 0; index < array.length; index += 1) {
      const text = String(array[index] ?? "").trim();
      if (!/^\d+$/.test(text)) fail("INVALID_OPERATION_PARAMS", `${path}[${index}] должен быть uint64-идентификатором кампании.`);
      array[index] = text;
    }
    return array;
  }

  function validateStrictPerformanceCampaignIds(value, path) {
    const array = requireArray(value, path);
    for (let index = 0; index < array.length; index += 1) requireUint64String(array[index], `${path}[${index}]`);
    return array;
  }

  function normalizePerformanceCampaignObjectParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignId"]);
    normalized.campaignId = requireUint64String(requireField(normalized, "campaignId"), "params.campaignId");
    return normalized;
  }

  function normalizePerformanceCampaignProductsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignId", "page", "pageSize"]);
    normalized.campaignId = requireUint64String(requireField(normalized, "campaignId"), "params.campaignId");
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) requireInteger(normalized.page, "params.page");
    if (Object.prototype.hasOwnProperty.call(normalized, "pageSize")) requireInteger(normalized.pageSize, "params.pageSize");
    return normalized;
  }

  function normalizePerformanceSearchPromoProductsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "pageSize"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) requireInteger(normalized.page, "params.page", { minimum: 1 });
    if (Object.prototype.hasOwnProperty.call(normalized, "pageSize")) requireInteger(normalized.pageSize, "params.pageSize");
    return normalized;
  }

  function normalizePerformanceSkuStatisticsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignIds", "dateFrom", "dateTo"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "campaignIds")) validateStrictPerformanceCampaignIds(normalized.campaignIds, "params.campaignIds");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateFrom")) normalized.dateFrom = requireDateYmd(normalized.dateFrom, "params.dateFrom");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateTo")) normalized.dateTo = requireDateYmd(normalized.dateTo, "params.dateTo");
    if (normalized.dateFrom && normalized.dateTo && normalized.dateFrom > normalized.dateTo) {
      fail("INVALID_OPERATION_PARAMS", "params.dateFrom не может быть позже params.dateTo.");
    }
    return normalized;
  }

  function normalizePerformanceMediaParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignIds", "from", "to", "dateFrom", "dateTo"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "campaignIds")) validateStrictPerformanceCampaignIds(normalized.campaignIds, "params.campaignIds");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateFrom")) normalized.dateFrom = requireDateYmd(normalized.dateFrom, "params.dateFrom");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateTo")) normalized.dateTo = requireDateYmd(normalized.dateTo, "params.dateTo");
    if (normalized.dateFrom && normalized.dateTo && normalized.dateFrom > normalized.dateTo) {
      fail("INVALID_OPERATION_PARAMS", "params.dateFrom не может быть позже params.dateTo.");
    }
    for (const field of ["from", "to"]) {
      if (!Object.prototype.hasOwnProperty.call(normalized, field)) continue;
      const text = String(normalized[field] ?? "").trim();
      if (!text || Number.isNaN(new Date(text).getTime())) fail("INVALID_OPERATION_PARAMS", `params.${field} должен быть RFC3339 date-time.`);
      normalized[field] = text;
    }
    return normalized;
  }

  function normalizePerformanceCampaignsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignIds", "advObjectType", "state", "page", "pageSize"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "campaignIds")) validateOptionalCampaignIds(normalized.campaignIds, "params.campaignIds");
    if (Object.prototype.hasOwnProperty.call(normalized, "advObjectType")) {
      normalized.advObjectType = String(normalized.advObjectType ?? "").trim();
      if (!["SKU", "BANNER", "SEARCH_PROMO", "VIDEO_BANNER"].includes(normalized.advObjectType)) fail("INVALID_OPERATION_PARAMS", "params.advObjectType содержит неподдерживаемый тип кампании.");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "state")) {
      normalized.state = String(normalized.state ?? "").trim();
      if (!["CAMPAIGN_STATE_UNKNOWN", "CAMPAIGN_STATE_RUNNING", "CAMPAIGN_STATE_PLANNED", "CAMPAIGN_STATE_STOPPED", "CAMPAIGN_STATE_INACTIVE", "CAMPAIGN_STATE_ARCHIVED", "CAMPAIGN_STATE_MODERATION_DRAFT", "CAMPAIGN_STATE_MODERATION_IN_PROGRESS", "CAMPAIGN_STATE_MODERATION_FAILED", "CAMPAIGN_STATE_FINISHED"].includes(normalized.state)) fail("INVALID_OPERATION_PARAMS", "params.state содержит неподдерживаемое состояние кампании.");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) requireInteger(normalized.page, "params.page", { minimum: 1 });
    if (Object.prototype.hasOwnProperty.call(normalized, "pageSize")) requireInteger(normalized.pageSize, "params.pageSize", { minimum: 1 });
    return normalized;
  }

  function normalizePerformanceDateRangeParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignIds", "dateFrom", "dateTo"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "campaignIds")) validateOptionalCampaignIds(normalized.campaignIds, "params.campaignIds");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateFrom")) normalized.dateFrom = requireDateYmd(normalized.dateFrom, "params.dateFrom");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateTo")) normalized.dateTo = requireDateYmd(normalized.dateTo, "params.dateTo");
    if (normalized.dateFrom && normalized.dateTo && normalized.dateFrom > normalized.dateTo) {
      fail("INVALID_OPERATION_PARAMS", "params.dateFrom не может быть позже params.dateTo.");
    }
    return normalized;
  }

  function normalizePerformanceCampaignProductParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignIds", "from", "to", "dateFrom", "dateTo"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "campaignIds")) validateOptionalCampaignIds(normalized.campaignIds, "params.campaignIds");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateFrom")) normalized.dateFrom = requireDateYmd(normalized.dateFrom, "params.dateFrom");
    if (Object.prototype.hasOwnProperty.call(normalized, "dateTo")) normalized.dateTo = requireDateYmd(normalized.dateTo, "params.dateTo");
    if (normalized.dateFrom && normalized.dateTo && normalized.dateFrom > normalized.dateTo) {
      fail("INVALID_OPERATION_PARAMS", "params.dateFrom не может быть позже params.dateTo.");
    }
    for (const field of ["from", "to"]) {
      if (!Object.prototype.hasOwnProperty.call(normalized, field)) continue;
      const text = String(normalized[field] ?? "").trim();
      if (!text || Number.isNaN(new Date(text).getTime())) fail("INVALID_OPERATION_PARAMS", `params.${field} должен быть RFC3339 date-time.`);
      normalized[field] = text;
    }
    return normalized;
  }

  function normalizePerformanceSkuArray(value, path, { maximum = null } = {}) {
    const array = requireArray(value, path);
    if (maximum != null && array.length > maximum) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} элементов по контракту Ozon.`);
    for (let index = 0; index < array.length; index += 1) {
      array[index] = requireUint64String(array[index], `${path}[${index}]`);
    }
    return array;
  }

  function normalizePerformanceMinBidBySkuParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["marketplaceId", "paymentType", "sku"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "marketplaceId")) {
      normalized.marketplaceId = String(normalized.marketplaceId ?? "").trim();
      if (!["MARKETPLACE_ID_RU", "MARKETPLACE_ID_KZ", "MARKETPLACE_ID_BY"].includes(normalized.marketplaceId)) {
        fail("INVALID_OPERATION_PARAMS", "params.marketplaceId содержит неподдерживаемое значение.");
      }
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "paymentType")) {
      normalized.paymentType = String(normalized.paymentType ?? "").trim();
      if (!["CPO", "CPC", "CPC_TOP"].includes(normalized.paymentType)) {
        fail("INVALID_OPERATION_PARAMS", "params.paymentType содержит неподдерживаемое значение.");
      }
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "sku")) normalizePerformanceSkuArray(normalized.sku, "params.sku");
    return normalized;
  }

  function normalizePerformancePageParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "pageSize"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) requireInteger(normalized.page, "params.page", { minimum: 1 });
    if (Object.prototype.hasOwnProperty.call(normalized, "pageSize")) requireInteger(normalized.pageSize, "params.pageSize", { minimum: 1 });
    return normalized;
  }

  function normalizePerformanceUuidValue(value, path) {
    const text = requireString(value, path);
    if (!/^[A-Za-z0-9_-]{1,160}$/.test(text)) fail("INVALID_OPERATION_PARAMS", `${path} содержит неподдерживаемый идентификатор отчёта.`);
    return text;
  }

  function normalizePerformanceUuidPathParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["UUID"]);
    normalized.UUID = normalizePerformanceUuidValue(requireField(normalized, "UUID"), "params.UUID");
    return normalized;
  }

  function normalizePerformanceReportDownloadParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["UUID"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "UUID")) normalized.UUID = normalizePerformanceUuidValue(normalized.UUID, "params.UUID");
    return normalized;
  }

  function normalizePerformanceCompetitiveBidsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignId", "skus"]);
    normalized.campaignId = requireUint64String(requireField(normalized, "campaignId"), "params.campaignId");
    if (Object.prototype.hasOwnProperty.call(normalized, "skus")) normalizePerformanceSkuArray(normalized.skus, "params.skus", { maximum: 200 });
    return normalized;
  }

  function normalizePerformanceCpoMinBidsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["skus"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "skus")) normalizePerformanceSkuArray(normalized.skus, "params.skus", { maximum: 200 });
    return normalized;
  }

  function normalizePerformanceVendorStatisticsStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["UUID", "vendor"]);
    normalized.UUID = normalizePerformanceUuidValue(requireField(normalized, "UUID"), "params.UUID");
    if (requireField(normalized, "vendor") !== true) fail("INVALID_OPERATION_PARAMS", "params.vendor должен быть true по контракту Ozon.");
    normalized.vendor = true;
    return normalized;
  }

  function normalizePerformanceVendorTagParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["orgId"]);
    normalized.orgId = requireUint64String(requireField(normalized, "orgId"), "params.orgId");
    return normalized;
  }

  function encodeQueryParams(params) {
    const parts = [];
    for (const [key, value] of Object.entries(params || {})) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        for (const item of value) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.join("&");
  }

  function assertPerformanceMutationBlocked(method, path) {
    const normalizedMethod = String(method || "").toUpperCase();
    const normalizedPath = String(path || "");
    const blocked = PERFORMANCE_MUTATION_BLOCKLIST.find((item) => item.method === normalizedMethod && item.path === normalizedPath);
    if (blocked) fail("PERFORMANCE_MUTATION_BLOCKED", `Performance API mutation запрещена политикой bridge: ${blocked.reason}.`);
    return true;
  }

  function assertPerformanceAsyncReportSideEffectBlocked(method, path) {
    const normalizedMethod = String(method || "").toUpperCase();
    const normalizedPath = String(path || "");
    const blocked = PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST.find((item) => item.method === normalizedMethod && item.path === normalizedPath);
    if (blocked) fail("PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKED", `Performance API async report creation запрещено политикой bridge: ${blocked.reason}.`);
    return true;
  }

  function parseKnownDate(value) {
    const text = String(value || "").trim();
    if (!text) return null;
    const millis = /^\d{4}-\d{2}-\d{2}$/.test(text) ? Date.parse(`${text}T00:00:00Z`) : Date.parse(text);
    return Number.isFinite(millis) ? millis : null;
  }

  function shiftUtcMonths(atMs, months) {
    const source = new Date(Number(atMs));
    if (Number.isNaN(source.getTime())) return null;
    const year = source.getUTCFullYear();
    const month = source.getUTCMonth() + Number(months || 0);
    const day = source.getUTCDate();
    const targetFirst = new Date(Date.UTC(year, month, 1, source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds(), source.getUTCMilliseconds()));
    const targetYear = targetFirst.getUTCFullYear();
    const targetMonth = targetFirst.getUTCMonth();
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    targetFirst.setUTCDate(Math.min(day, lastDay));
    return targetFirst.getTime();
  }

  function normalizeCapabilityProfile(profile) {
    const source = profile && typeof profile === "object" ? profile : {};
    const rawStatus = String(source.status || "unknown").toLowerCase();
    const status = rawStatus === "known" ? "known" : (rawStatus === "not_needed" ? "not_needed" : "unknown");
    const rawType = String(source.subscription_type || source.type || "UNKNOWN").trim().toUpperCase();
    const subscriptionType = SELLER_SUBSCRIPTION_TYPES.includes(rawType) ? rawType : "UNKNOWN";
    return deepFreeze({
      status,
      subscription_type: subscriptionType,
      is_premium: typeof source.is_premium === "boolean" ? source.is_premium : null,
      probe_performed: source.probe_performed === true,
      probe_http_status: Number(source.probe_http_status || source.http_status || 0),
      probe_error_code: source.probe_error_code ? String(source.probe_error_code).slice(0, 160) : null
    });
  }


  function validateOperationMeta(name, meta) {
    if (!/^[a-z][a-z0-9_]{0,119}$/.test(String(name))) fail("INVALID_REGISTRY_OPERATION", `Некорректный operation alias: ${name}`);
    if (!meta || typeof meta !== "object") fail("INVALID_REGISTRY_META", `${name}: operation metadata отсутствует.`);
    if (!/^(GET|POST)$/.test(String(meta.method))) fail("INVALID_REGISTRY_METHOD", `${name}: неподдерживаемый HTTP method.`);
    if (!/^\/[^?#]*$/.test(String(meta.path)) || String(meta.path).includes("..")) fail("INVALID_REGISTRY_PATH", `${name}: небезопасный fixed path.`);
    const provider = String(meta.provider || "seller_api");
    if (!["seller_api", "performance_api", "report_file"].includes(provider)) fail("INVALID_REGISTRY_PROVIDER", `${name}: неизвестный provider.`);
    if (provider === "performance_api") {
      assertPerformanceMutationBlocked(meta.method, meta.path);
      assertPerformanceAsyncReportSideEffectBlocked(meta.method, meta.path);
    }
    if (meta.effect !== "READ") return;
    const responseStyle = String(meta.response_style || "json");
    if (!["json", "binary"].includes(responseStyle)) fail("RESPONSE_STYLE_NOT_READY", `${name}: неподдерживаемый response_style.`);
    if (responseStyle === "binary") {
      const contentTypes = Array.isArray(meta.response_content_types) ? meta.response_content_types : [];
      const allowedBinaryContentType = provider === "seller_api"
        ? /^(application\/pdf|image\/png)$/
        : /^(text\/csv|application\/zip)$/;
      if (!contentTypes.length || contentTypes.some((item) => !allowedBinaryContentType.test(String(item)))) {
        fail("RESPONSE_STYLE_NOT_READY", `${name}: binary response содержит неподдерживаемый fixed content type для provider ${provider}.`);
      }
    }
    if (meta.execution_enabled === true) {
      if (typeof meta.normalizeParams !== "function") fail("PARAM_SCHEMA_NOT_READY", `${name}: нет request normalizer.`);
      if (typeof meta.sanitizeResult !== "function") fail("RESULT_POLICY_NOT_READY", `${name}: нет result/PII policy.`);
      if (meta.method === "GET" && meta.request_style !== "query" && !(provider === "report_file" && meta.request_style === "opaque_file_ref")) fail("REQUEST_STYLE_NOT_READY", `${name}: GET требует query builder.`);
      if (provider === "report_file" && meta.request_style !== "opaque_file_ref") fail("REQUEST_STYLE_NOT_READY", `${name}: report_file требует opaque_file_ref builder.`);
      if (meta.method === "POST" && !["json_body", "no_body"].includes(meta.request_style)) fail("REQUEST_STYLE_NOT_READY", `${name}: POST требует fixed json_body/no_body builder.`);
    }
  }

  function requireFiniteNumber(value, path) {
    if (typeof value !== "number" || !Number.isFinite(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть конечным числом.`);
    return value;
  }
  function validateEnumArray(value, path, allowed) {
    const array = requireArray(value, path);
    for (let index = 0; index < array.length; index += 1) requireEnum(array[index], `${path}[${index}]`, allowed);
    return array;
  }
  function validateIdentifierArray(value, path, { minimum = null, maximum = null, int64 = false } = {}) {
    const array = requireArray(value, path);
    if (minimum !== null && array.length < minimum) fail("OZON_LIMIT_VIOLATION", `${path}: минимум ${minimum} элементов по контракту Ozon.`);
    if (maximum !== null && array.length > maximum) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} элементов по контракту Ozon.`);
    for (let index = 0; index < array.length; index += 1) {
      if (int64) requireInt64String(array[index], `${path}[${index}]`);
      else requireString(array[index], `${path}[${index}]`);
    }
    return array;
  }
  function requireInt32Number(value, path) {
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) fail("INVALID_OPERATION_PARAMS", `${path} должен быть целым числом int32.`);
    return value;
  }
  function validateWarehouseSetupCoordinates(value, path) {
    const coordinates = requirePlainObject(value, path);
    assertAllowedFields(coordinates, ["latitude", "longitude"], path);
    requireFiniteNumber(requireField(coordinates, "latitude", path), `${path}.latitude`);
    requireFiniteNumber(requireField(coordinates, "longitude", path), `${path}.longitude`);
    return coordinates;
  }
  function validateWarehouseSetupSearch(value, path, { addressMaxLength = null, typesMaxItems = null } = {}) {
    const search = requirePlainObject(value, path);
    assertAllowedFields(search, ["address", "types"], path);
    if (Object.prototype.hasOwnProperty.call(search, "address")) {
      requireString(search.address, `${path}.address`, { nonEmpty: false });
      if (addressMaxLength !== null && [...search.address].length > addressMaxLength) fail("OZON_LIMIT_VIOLATION", `${path}.address: максимум ${addressMaxLength} символов по контракту Ozon.`);
    }
    if (Object.prototype.hasOwnProperty.call(search, "types")) {
      if (typesMaxItems !== null) assertMaxItems(search.types, `${path}.types`, typesMaxItems);
      validateEnumArray(search.types, `${path}.types`, ["PVZ", "PPZ", "SC"]);
    }
    return search;
  }
  function normalizeWarehouseFbsCreateDropoffListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["coordinates", "country_code", "is_kgt", "search"]);
    normalized.country_code = requireString(requireField(normalized, "country_code"), "params.country_code", { nonEmpty: false });
    if (typeof requireField(normalized, "is_kgt") !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.is_kgt должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "coordinates")) validateWarehouseSetupCoordinates(normalized.coordinates, "params.coordinates");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search", { addressMaxLength: 1000, typesMaxItems: 3 });
    return normalized;
  }
  function normalizeWarehouseFbsUpdateDropoffListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["search", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search", { typesMaxItems: 3 });
    return normalized;
  }
  function normalizeWarehouseFbsCreateDropoffTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["drop_off_point_id"]);
    requireSafeInt64Number(requireField(normalized, "drop_off_point_id"), "params.drop_off_point_id");
    return normalized;
  }
  function normalizeWarehouseFbsUpdateDropoffTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["drop_off_point_id", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "drop_off_point_id"), "params.drop_off_point_id");
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }
  function normalizeWarehouseFbsCreatePickupTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["address_coordinates", "is_kgt"]);
    validateWarehouseSetupCoordinates(requireField(normalized, "address_coordinates"), "params.address_coordinates");
    if (typeof requireField(normalized, "is_kgt") !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.is_kgt должен быть boolean.");
    return normalized;
  }
  function normalizeWarehouseFbsUpdatePickupTimeslotListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }
  function normalizeWarehouseFbsCreateReturnPointListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["coordinates", "country_code", "last_id", "limit", "search", "selected_dropoff_point_id"]);
    validateWarehouseSetupCoordinates(requireField(normalized, "coordinates"), "params.coordinates");
    normalized.country_code = requireString(requireField(normalized, "country_code"), "params.country_code", { nonEmpty: false });
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 500 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "selected_dropoff_point_id")) requireSafeInt64Number(normalized.selected_dropoff_point_id, "params.selected_dropoff_point_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search");
    return normalized;
  }
  function normalizeWarehouseFbsUpdateReturnPointListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["current_dropoff_point_id", "current_return_point_id", "last_id", "limit", "search", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 500 });
    for (const field of ["current_dropoff_point_id", "current_return_point_id", "last_id"]) {
      if (Object.prototype.hasOwnProperty.call(normalized, field)) requireSafeInt64Number(normalized[field], `params.${field}`);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "search")) validateWarehouseSetupSearch(normalized.search, "params.search");
    return normalized;
  }
  function normalizeWarehouseFbsPickupHistoryListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["planned_date", "warehouse_id", "was_planned"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "planned_date")) requireString(filter.planned_date, "params.filter.planned_date", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_id")) validateIdentifierArray(filter.warehouse_id, "params.filter.warehouse_id", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "was_planned") && typeof filter.was_planned !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.filter.was_planned должен быть boolean.");
    }
    return normalized;
  }
  function normalizeDeliveryPolygonListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["delivery_method_id", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "delivery_method_id"), "params.delivery_method_id");
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    return normalized;
  }
  function normalizeSellerDeliveryMethodListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", DELIVERY_METHOD_SORT_DIR);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["delivery_method_ids", "provider_ids", "status", "warehouse_ids"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "delivery_method_ids")) validateIdentifierArray(filter.delivery_method_ids, "params.filter.delivery_method_ids", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "provider_ids")) validateIdentifierArray(filter.provider_ids, "params.filter.provider_ids", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "warehouse_ids")) validateIdentifierArray(filter.warehouse_ids, "params.filter.warehouse_ids", { maximum: 100, int64: true });
      if (Object.prototype.hasOwnProperty.call(filter, "status")) validateEnumArray(filter.status, "params.filter.status", DELIVERY_METHOD_STATUSES);
    }
    return normalized;
  }
  function normalizeDeliveryMethodReturnSettingsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["delivery_method_id"]);
    requireSafeInt64Number(requireField(normalized, "delivery_method_id"), "params.delivery_method_id");
    return normalized;
  }
  function normalizeWarehouseInvalidProductsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["last_id", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    return normalized;
  }
  function normalizeOzonWarehouseListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_types"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_types")) validateEnumArray(normalized.warehouse_types, "params.warehouse_types", OZON_WAREHOUSE_TYPES);
    return normalized;
  }
  function normalizeStockTurnoverAnalyticsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["limit", "offset", "sku"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "offset")) requireInt32Number(normalized.offset, "params.offset");
    if (Object.prototype.hasOwnProperty.call(normalized, "sku")) {
      const sku = requireArray(normalized.sku, "params.sku");
      for (let index = 0; index < sku.length; index += 1) requireInt64String(sku[index], `params.sku[${index}]`);
    }
    return normalized;
  }
  function requireSafeInt64Number(value, path) {
    if (!Number.isSafeInteger(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть безопасным целым числом для int64.`);
    return value;
  }
  function normalizeProductFbsWarehouseStocksParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "limit", "warehouse_id"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    requireSafeInt64Number(requireField(normalized, "warehouse_id"), "params.warehouse_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    return normalized;
  }
  function normalizeWarehouseFbsReturnMileCheckParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["country_code", "first_mile_type", "is_kgt", "warehouse_id"]);
    requireString(requireField(normalized, "country_code"), "params.country_code");
    normalized.first_mile_type = requireEnum(requireField(normalized, "first_mile_type"), "params.first_mile_type", ["PICK_UP", "DROP_OFF"]);
    if (typeof requireField(normalized, "is_kgt") !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.is_kgt должен быть boolean.");
    if (Object.prototype.hasOwnProperty.call(normalized, "warehouse_id")) requireSafeInt64Number(normalized.warehouse_id, "params.warehouse_id");
    return normalized;
  }
  function normalizeWarehouseFbsReturnMileInfoParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["warehouse_ids"]);
    validateIdentifierArray(requireField(normalized, "warehouse_ids"), "params.warehouse_ids", { int64: true });
    return normalized;
  }
  function normalizeWarehouseOperationStatusParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["operation_id"]);
    requireString(requireField(normalized, "operation_id"), "params.operation_id");
    return normalized;
  }
  function normalizeNoBodyParams(params) {
    const normalized = normalizePassthroughParams(params);
    if (Object.keys(normalized).length !== 0) fail("INVALID_OPERATION_PARAMS", "Эта операция не принимает request body/params по контракту Ozon.");
    return {};
  }


  function normalizeStep7OptionalStringArray(value, path, maximum = null) {
    const items = requireArray(value, path);
    if (maximum !== null && items.length > maximum) fail("OZON_LIMIT_VIOLATION", `${path}: максимум ${maximum} элементов по контракту Ozon.`);
    for (let index = 0; index < items.length; index += 1) requireString(items[index], `${path}[${index}]`, { nonEmpty: false });
    return items;
  }

  function normalizeStep7Int32String(value, path) {
    const text = requireInt64String(value, path);
    const number = BigInt(text);
    if (number < -2147483648n || number > 2147483647n) fail("INVALID_OPERATION_PARAMS", `${path} должен быть целым числом int32 в строковом формате.`);
    return text;
  }

  function normalizeStep7ArrivalPassListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    requireInteger(requireField(normalized, "limit"), "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["arrival_pass_ids", "arrival_reason", "dropoff_point_ids", "only_active_passes", "warehouse_ids"], "params.filter");
      for (const field of ["arrival_pass_ids", "dropoff_point_ids", "warehouse_ids"]) {
        if (Object.prototype.hasOwnProperty.call(filter, field)) validateIdentifierArray(filter[field], `params.filter.${field}`, { int64: true });
      }
      if (Object.prototype.hasOwnProperty.call(filter, "arrival_reason")) requireString(filter.arrival_reason, "params.filter.arrival_reason", { nonEmpty: false });
      if (Object.prototype.hasOwnProperty.call(filter, "only_active_passes") && typeof filter.only_active_passes !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.filter.only_active_passes должен быть boolean.");
    }
    return normalized;
  }

  function normalizeStep7ExemplarValidateParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_number", "products"]);
    normalized.posting_number = requireString(requireField(normalized, "posting_number"), "params.posting_number");
    const products = requireArray(requireField(normalized, "products"), "params.products");
    for (let index = 0; index < products.length; index += 1) {
      const product = requirePlainObject(products[index], `params.products[${index}]`);
      assertAllowedFields(product, ["exemplars", "product_id"], `params.products[${index}]`);
      requireSafeInt64Number(requireField(product, "product_id", `params.products[${index}]`), `params.products[${index}].product_id`);
      const exemplars = requireArray(requireField(product, "exemplars", `params.products[${index}]`), `params.products[${index}].exemplars`);
      for (let exemplarIndex = 0; exemplarIndex < exemplars.length; exemplarIndex += 1) {
        const exemplarPath = `params.products[${index}].exemplars[${exemplarIndex}]`;
        const exemplar = requirePlainObject(exemplars[exemplarIndex], exemplarPath);
        assertAllowedFields(exemplar, ["gtd", "marks", "rnpt", "weight"], exemplarPath);
        if (Object.prototype.hasOwnProperty.call(exemplar, "gtd")) requireString(exemplar.gtd, `${exemplarPath}.gtd`, { nonEmpty: false });
        if (Object.prototype.hasOwnProperty.call(exemplar, "rnpt")) requireString(exemplar.rnpt, `${exemplarPath}.rnpt`, { nonEmpty: false });
        if (Object.prototype.hasOwnProperty.call(exemplar, "weight")) requireFiniteNumber(exemplar.weight, `${exemplarPath}.weight`);
        if (Object.prototype.hasOwnProperty.call(exemplar, "marks")) {
          const marks = requireArray(exemplar.marks, `${exemplarPath}.marks`);
          for (let markIndex = 0; markIndex < marks.length; markIndex += 1) {
            const markPath = `${exemplarPath}.marks[${markIndex}]`;
            const mark = requirePlainObject(marks[markIndex], markPath);
            assertAllowedFields(mark, ["mark", "mark_type"], markPath);
            if (Object.prototype.hasOwnProperty.call(mark, "mark")) requireString(mark.mark, `${markPath}.mark`, { nonEmpty: false });
            if (Object.prototype.hasOwnProperty.call(mark, "mark_type")) requireString(mark.mark_type, `${markPath}.mark_type`, { nonEmpty: false });
          }
        }
      }
    }
    return normalized;
  }

  function normalizeStep7CarriageDeliveryListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["delivery_method_id", "departure_date"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "delivery_method_id")) requireSafeInt64Number(filter.delivery_method_id, "params.filter.delivery_method_id");
      if (Object.prototype.hasOwnProperty.call(filter, "departure_date")) {
        const date = requireString(filter.departure_date, "params.filter.departure_date");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("INVALID_OPERATION_PARAMS", "params.filter.departure_date должен иметь формат YYYY-MM-DD.");
      }
    }
    return normalized;
  }

  function normalizeStep7PickupCodeVerifyParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["pickup_code", "posting_number"]);
    normalized.pickup_code = requireString(requireField(normalized, "pickup_code"), "params.pickup_code");
    normalized.posting_number = requireString(requireField(normalized, "posting_number"), "params.posting_number");
    return normalized;
  }

  function normalizeStep7EtgbParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date"]);
    const date = requirePlainObject(requireField(normalized, "date"), "params.date");
    assertAllowedFields(date, ["from", "to"], "params.date");
    date.from = requireRfc3339DateTime(requireField(date, "from", "params.date"), "params.date.from");
    date.to = requireRfc3339DateTime(requireField(date, "to", "params.date"), "params.date.to");
    return normalized;
  }

  function normalizeStep7RfbsReturnsGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["return_id"]);
    requireSafeInt64Number(requireField(normalized, "return_id"), "params.return_id");
    return normalized;
  }

  function normalizeStep7ConditionalCancellationListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["filters", "last_id", "limit", "with"]);
    requireInt32Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { maximum: 500 });
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "filters")) {
      const filters = requirePlainObject(normalized.filters, "params.filters");
      assertAllowedFields(filters, ["cancellation_initiator", "posting_number", "state"], "params.filters");
      if (Object.prototype.hasOwnProperty.call(filters, "cancellation_initiator")) validateEnumArray(filters.cancellation_initiator, "params.filters.cancellation_initiator", ["OZON", "SELLER", "CLIENT", "SYSTEM", "DELIVERY"]);
      if (Object.prototype.hasOwnProperty.call(filters, "posting_number")) normalizeStep7OptionalStringArray(filters.posting_number, "params.filters.posting_number");
      if (Object.prototype.hasOwnProperty.call(filters, "state")) filters.state = requireEnum(filters.state, "params.filters.state", ["ALL", "ON_APPROVAL", "APPROVED", "REJECTED"]);
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "with")) validateBooleanFields(normalized.with, ["counter"], "params.with");
    return normalized;
  }

  function normalizeStep7ChatListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit"]);
    requireSafeInt64Number(requireField(normalized, "limit"), "params.limit");
    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["chat_status", "unread_only"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "chat_status")) filter.chat_status = requireEnum(filter.chat_status, "params.filter.chat_status", ["ALL", "OPENED", "CLOSED"]);
      if (Object.prototype.hasOwnProperty.call(filter, "unread_only") && typeof filter.unread_only !== "boolean") fail("INVALID_OPERATION_PARAMS", "params.filter.unread_only должен быть boolean.");
    }
    return normalized;
  }

  function normalizeStep7FinanceB2bSalesJsonParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["date"]);
    normalized.date = requireString(requireField(normalized, "date"), "params.date");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(normalized.date)) fail("INVALID_OPERATION_PARAMS", "params.date должен иметь формат YYYY-MM.");
    return normalized;
  }

  function normalizeStep7ReceiptsSellerListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["page", "page_size", "posting_numbers"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "page")) {
      requireSafeInt64Number(normalized.page, "params.page");
      requireInteger(normalized.page, "params.page", { minimum: 0 });
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "page_size")) {
      requireSafeInt64Number(normalized.page_size, "params.page_size");
      requireInteger(normalized.page_size, "params.page_size", { minimum: 1, maximum: 100 });
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "posting_numbers")) normalizeStep7OptionalStringArray(normalized.posting_numbers, "params.posting_numbers");
    return normalized;
  }

  function normalizeStep7DiscountTaskListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["last_id", "limit", "status"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) {
      requireSafeInt64Number(normalized.limit, "params.limit");
      if (![5, 10, 15, 20, 30, 50].includes(normalized.limit)) fail("INVALID_OPERATION_PARAMS", "params.limit содержит неподдерживаемое значение.");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "status")) normalized.status = requireEnum(normalized.status, "params.status", ["ALL", "NEW", "APPROVED", "DECLINED"]);
    return normalized;
  }

  function normalizeStep7PostingDigitalListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["cursor", "filter", "limit", "sort_dir", "with"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) {
      requireSafeInt64Number(normalized.limit, "params.limit");
      requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 100 });
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "sort_dir")) normalized.sort_dir = requireEnum(normalized.sort_dir, "params.sort_dir", ["ASC", "DESC"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "filter")) {
      const filter = requirePlainObject(normalized.filter, "params.filter");
      assertAllowedFields(filter, ["order_numbers", "posting_numbers", "since", "to"], "params.filter");
      if (Object.prototype.hasOwnProperty.call(filter, "order_numbers")) normalizeStep7OptionalStringArray(filter.order_numbers, "params.filter.order_numbers", 1000);
      if (Object.prototype.hasOwnProperty.call(filter, "posting_numbers")) normalizeStep7OptionalStringArray(filter.posting_numbers, "params.filter.posting_numbers", 1000);
      if (Object.prototype.hasOwnProperty.call(filter, "since")) filter.since = requireRfc3339DateTime(filter.since, "params.filter.since");
      if (Object.prototype.hasOwnProperty.call(filter, "to")) filter.to = requireRfc3339DateTime(filter.to, "params.filter.to");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "with")) validateBooleanFields(normalized.with, ["analytics_data", "financial_data", "legal_info"], "params.with");
    return normalized;
  }

  function normalizeStep7SupplyIdParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["supply_id"]);
    normalized.supply_id = requireString(requireField(normalized, "supply_id"), "params.supply_id");
    return normalized;
  }

  function normalizeStep7FbpArchiveListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["count", "last_id"]);
    normalized.count = normalizeStep7Int32String(requireField(normalized, "count"), "params.count");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) normalized.last_id = requireInt64String(normalized.last_id, "params.last_id");
    return normalized;
  }

  function normalizeStep7FbpListParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["count", "last_id"]);
    requireInt32Number(requireField(normalized, "count"), "params.count");
    if (Object.prototype.hasOwnProperty.call(normalized, "last_id")) requireSafeInt64Number(normalized.last_id, "params.last_id");
    return normalized;
  }

  function normalizeStep7DeliveryCheckParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["client_phone"]);
    normalized.client_phone = requireString(requireField(normalized, "client_phone"), "params.client_phone");
    if (!/^7\d{10}$/.test(normalized.client_phone)) fail("INVALID_OPERATION_PARAMS", "params.client_phone должен иметь формат 7XXXXXXXXXX.");
    return normalized;
  }

  function normalizeStep7Coordinates(value, path, latitudeKey = "latitude", longitudeKey = "longitude") {
    const coordinates = requirePlainObject(value, path);
    assertAllowedFields(coordinates, [latitudeKey, longitudeKey], path);
    if (Object.prototype.hasOwnProperty.call(coordinates, latitudeKey)) requireFiniteNumber(coordinates[latitudeKey], `${path}.${latitudeKey}`);
    if (Object.prototype.hasOwnProperty.call(coordinates, longitudeKey)) requireFiniteNumber(coordinates[longitudeKey], `${path}.${longitudeKey}`);
    return coordinates;
  }

  function normalizeStep7DeliveryCheckoutParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["buyer_phone", "delivery_schema", "delivery_type", "items"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "buyer_phone")) requireString(normalized.buyer_phone, "params.buyer_phone", { nonEmpty: false });
    if (Object.prototype.hasOwnProperty.call(normalized, "delivery_schema")) normalized.delivery_schema = requireEnum(normalized.delivery_schema, "params.delivery_schema", ["MIX", "FBO", "FBS"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "delivery_type")) {
      const deliveryType = requirePlainObject(normalized.delivery_type, "params.delivery_type");
      assertAllowedFields(deliveryType, ["courier", "pick_up"], "params.delivery_type");
      if (Object.prototype.hasOwnProperty.call(deliveryType, "courier")) {
        const courier = requirePlainObject(deliveryType.courier, "params.delivery_type.courier");
        assertAllowedFields(courier, ["coordinates"], "params.delivery_type.courier");
        if (Object.prototype.hasOwnProperty.call(courier, "coordinates")) normalizeStep7Coordinates(courier.coordinates, "params.delivery_type.courier.coordinates");
      }
      if (Object.prototype.hasOwnProperty.call(deliveryType, "pick_up")) {
        const pickup = requirePlainObject(deliveryType.pick_up, "params.delivery_type.pick_up");
        assertAllowedFields(pickup, ["map_point_id"], "params.delivery_type.pick_up");
        if (Object.prototype.hasOwnProperty.call(pickup, "map_point_id")) requireSafeInt64Number(pickup.map_point_id, "params.delivery_type.pick_up.map_point_id");
      }
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "items")) {
      const items = requireArray(normalized.items, "params.items");
      if (items.length > 1000) fail("OZON_LIMIT_VIOLATION", "params.items: максимум 1000 элементов по контракту Ozon.");
      for (let index = 0; index < items.length; index += 1) {
        const itemPath = `params.items[${index}]`;
        const item = requirePlainObject(items[index], itemPath);
        assertAllowedFields(item, ["offer_id", "quantity", "sku"], itemPath);
        if (Object.prototype.hasOwnProperty.call(item, "offer_id")) requireString(item.offer_id, `${itemPath}.offer_id`, { nonEmpty: false });
        if (Object.prototype.hasOwnProperty.call(item, "quantity")) requireSafeInt64Number(item.quantity, `${itemPath}.quantity`);
        if (Object.prototype.hasOwnProperty.call(item, "sku")) requireSafeInt64Number(item.sku, `${itemPath}.sku`);
      }
    }
    return normalized;
  }

  function normalizeStep7DeliveryMapParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["viewport", "zoom"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "viewport")) {
      const viewport = requirePlainObject(normalized.viewport, "params.viewport");
      assertAllowedFields(viewport, ["left_bottom", "right_top"], "params.viewport");
      if (Object.prototype.hasOwnProperty.call(viewport, "left_bottom")) normalizeStep7Coordinates(viewport.left_bottom, "params.viewport.left_bottom", "lat", "long");
      if (Object.prototype.hasOwnProperty.call(viewport, "right_top")) normalizeStep7Coordinates(viewport.right_top, "params.viewport.right_top", "lat", "long");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "zoom")) {
      requireInt32Number(normalized.zoom, "params.zoom");
      requireInteger(normalized.zoom, "params.zoom", { minimum: 0, maximum: 19 });
    }
    return normalized;
  }

  function normalizeStep7OrderCancelCheckParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["order_number"]);
    normalized.order_number = requireString(requireField(normalized, "order_number"), "params.order_number");
    return normalized;
  }

  function normalizeStep7PostingMarksParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["posting_numbers"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "posting_numbers")) normalizeStep7OptionalStringArray(normalized.posting_numbers, "params.posting_numbers");
    return normalized;
  }

  const IMPLEMENTATION_BINDINGS = Object.freeze({
    seller_product_list: { normalizeParams: normalizeSellerProductListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b1" },
    seller_product_info_list: { normalizeParams: normalizeSellerProductInfoListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b1" },
    seller_product_attributes: { normalizeParams: normalizeSellerProductAttributesParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b1" },
    description_category_tree: { normalizeParams: normalizeDescriptionCategoryTreeParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b15" },
    description_category_attributes: { normalizeParams: normalizeDescriptionCategoryAttributesParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b15" },
    description_category_attribute_values: { normalizeParams: normalizeDescriptionCategoryAttributeValuesParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b15_explicit_pagination" },
    description_category_attribute_values_search: { normalizeParams: normalizeDescriptionCategoryAttributeValuesSearchParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b15" },
    brand_company_certification_list: { normalizeParams: normalizeBrandCompanyCertificationListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_explicit_page" },
    product_certificate_product_status_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_no_body" },
    product_certificate_rejection_reasons: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_no_body" },
    product_certificate_status_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_no_body" },
    product_certificate_types: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_get_no_params" },
    product_certificate_accordance_types: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_get_v2_no_params" },
    product_certification_categories: { normalizeParams: normalizeProductCertificationCategoriesParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b19_v2_explicit_page" },
    product_certification_options: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b25_no_body" },
    product_certificate_info: { normalizeParams: normalizeProductCertificateInfoParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b20" },
    product_certificate_list: { normalizeParams: normalizeProductCertificateListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b20_explicit_page" },
    product_certificate_products: { normalizeParams: normalizeProductCertificateProductsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b20_limit_cursor_only" },
    product_content_rating: { normalizeParams: normalizeProductContentRatingParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11" },
    product_info_description: { normalizeParams: normalizeProductInfoDescriptionParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11" },
    product_upload_quota: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11_no_body" },
    product_subscription_count: { normalizeParams: normalizeProductSubscriptionCountParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11" },
    product_related_sku: { normalizeParams: normalizeProductRelatedSkuParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11" },
    product_pictures_info: { normalizeParams: normalizeProductPicturesInfoParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11_urls_exposed_no_fetch" },
    product_wrong_volume: { normalizeParams: normalizeProductWrongVolumeParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11_cursor_explicit" },
    product_discounted_info: { normalizeParams: normalizeProductDiscountedInfoParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b11" },
    product_prices_bulk: { normalizeParams: normalizeProductPricesBulkParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b2" },
    product_price_details: { normalizeParams: normalizeProductPriceDetailsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b2" },
    pricing_strategy_list: { normalizeParams: normalizePricingStrategyListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b14" },
    pricing_strategy_info: { normalizeParams: normalizePricingStrategyIdParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b14" },
    pricing_strategy_products: { normalizeParams: normalizePricingStrategyIdParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b14" },
    pricing_strategy_product_info: { normalizeParams: normalizePricingStrategyProductInfoParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b14_competitor_url_data_only" },
    pricing_strategy_competitors: { normalizeParams: normalizePricingStrategyCompetitorsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b18" },
    pricing_strategy_ids_by_product_ids: { normalizeParams: normalizePricingStrategyIdsByProductIdsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b18" },
    seller_actions_list: { normalizeParams: normalizeSellerActionsListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b2" },
    seller_action_products: { normalizeParams: normalizeSellerActionProductsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b2" },
    seller_action_candidates: { normalizeParams: normalizeSellerActionProductsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b45_seller_action_candidates_explicit_cursor" },
    ozon_actions_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b13_get_no_params" },
    ozon_action_candidates: { normalizeParams: normalizeOzonActionPageParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b13" },
    ozon_action_products: { normalizeParams: normalizeOzonActionPageParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b13" },
    ozon_auto_add_products: { normalizeParams: normalizeOzonAutoAddActionParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b13_beta" },
    ozon_auto_add_candidates: { normalizeParams: normalizeOzonAutoAddActionParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b13_beta" },
    stock_on_warehouses_v2: { normalizeParams: normalizeStockOnWarehousesV2Params, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b34" },
    roles: { normalizeParams: normalizeEmptyParams, sanitizeResult: safeReadResult, contract_state: "current_key_info" },
    seller_info: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b23_no_body" },
    seller_ozon_logistics_info: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b23_no_body" },
    stocks_current: { normalizeParams: normalizeStocksCurrentParams, sanitizeResult: safeReadResult, contract_state: "official_limits_v2_1" },
    warehouse_fbs_create_dropoff_list: { normalizeParams: normalizeWarehouseFbsCreateDropoffListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references" },
    warehouse_fbs_update_dropoff_list: { normalizeParams: normalizeWarehouseFbsUpdateDropoffListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references" },
    warehouse_fbs_create_dropoff_timeslot_list: { normalizeParams: normalizeWarehouseFbsCreateDropoffTimeslotListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references" },
    warehouse_fbs_update_dropoff_timeslot_list: { normalizeParams: normalizeWarehouseFbsUpdateDropoffTimeslotListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references" },
    warehouse_fbs_create_pickup_timeslot_list: { normalizeParams: normalizeWarehouseFbsCreatePickupTimeslotListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references" },
    warehouse_fbs_update_pickup_timeslot_list: { normalizeParams: normalizeWarehouseFbsUpdatePickupTimeslotListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references" },
    warehouse_fbs_create_return_point_list: { normalizeParams: normalizeWarehouseFbsCreateReturnPointListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references_explicit_last_id" },
    warehouse_fbs_update_return_point_list: { normalizeParams: normalizeWarehouseFbsUpdateReturnPointListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b42_fbs_warehouse_setup_references_explicit_last_id" },
    warehouse_fbs_pickup_history_list: { normalizeParams: normalizeWarehouseFbsPickupHistoryListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b39_fbs_pickup_geography" },
    delivery_polygon_list: { normalizeParams: normalizeDeliveryPolygonListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b39_fbs_pickup_geography" },
    warehouse_fbs_pickup_planning_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b25_no_body" },
    fbp_warehouse_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b25_no_body" },
    seller_warehouse_list: { normalizeParams: normalizeSellerWarehouseListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3" },
    seller_delivery_method_list: { normalizeParams: normalizeSellerDeliveryMethodListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b16_explicit_cursor" },
    delivery_method_return_settings: { normalizeParams: normalizeDeliveryMethodReturnSettingsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b16" },
    warehouse_invalid_products: { normalizeParams: normalizeWarehouseInvalidProductsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b16_explicit_last_id" },
    warehouses_with_invalid_products: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b16_no_body" },
    ozon_warehouse_list: { normalizeParams: normalizeOzonWarehouseListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3" },
    fbo_seller_warehouse_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3_no_body" },
    cluster_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3_no_body" },
    fbs_stock_by_warehouse: { normalizeParams: normalizeFbsStockByWarehouseParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3" },
    fbo_stock_by_warehouse: { normalizeParams: normalizeFboStockByWarehouseParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3" },
    stock_analytics: { normalizeParams: normalizeStockAnalyticsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b3" },
    stock_turnover_analytics: { normalizeParams: normalizeStockTurnoverAnalyticsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b34" },
    warehouse_fbs_return_mile_check: { normalizeParams: normalizeWarehouseFbsReturnMileCheckParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32" },
    warehouse_fbs_return_mile_info: { normalizeParams: normalizeWarehouseFbsReturnMileInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32_array_numeric_keywords_not_reinterpreted" },
    warehouse_operation_status: { normalizeParams: normalizeWarehouseOperationStatusParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33" },
    supplier_available_warehouses: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33_get_no_params" },
    product_fbs_warehouse_stocks: { normalizeParams: normalizeProductFbsWarehouseStocksParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    analytics_data: { normalizeParams: normalizeAnalyticsDataParams, sanitizeResult: safeReadResult, contract_state: "official_limits_v2_1" },
    product_queries: { normalizeParams: normalizeProductQueriesParams, sanitizeResult: safeReadResult, contract_state: "official_limits_v2_1" },
    product_queries_details: { normalizeParams: normalizeProductQueriesDetailsParams, sanitizeResult: safeReadResult, contract_state: "official_limits_v2_1" },
    marketplace_search_queries_text: { normalizeParams: normalizeMarketplaceSearchQueriesTextParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b35_premium_pro" },
    marketplace_search_queries_top: { normalizeParams: normalizeMarketplaceSearchQueriesTopParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b35_premium_pro" },
    fbp_posting_list: { normalizeParams: normalizeFbpPostingListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b43_fbp_postings_explicit_cursor" },
    fbp_posting_get: { normalizeParams: normalizeFbpPostingGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b43_fbp_posting_get" },
    posting_fbo_list: { normalizeParams: normalizePostingFboListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b4_revalidated" },
    posting_fbo_get: { normalizeParams: normalizePostingFboGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b44_fbo_posting_get" },
    posting_unpaid_legal_product_list: { normalizeParams: normalizePostingUnpaidLegalProductListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b47_unpaid_legal_products_explicit_cursor" },
    fbs_posting_list: { normalizeParams: normalizeFbsPostingListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_25_b4_personal_data_read" },
    fbs_unfulfilled_list: { normalizeParams: normalizeFbsUnfulfilledListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_25_b4_personal_data_read" },
    posting_fbs_get: { normalizeParams: normalizePostingFbsGetParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_25_b4_revalidated_personal_data_read" },
    fbs_carriage_available_list: { normalizeParams: normalizeFbsCarriageAvailableListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    fbs_carriage_get: { normalizeParams: normalizeFbsCarriageGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    fbs_act_list: { normalizeParams: normalizeFbsActListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    fbs_act_check_status: { normalizeParams: normalizeFbsActCheckStatusParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    assembly_carriage_posting_list: { normalizeParams: normalizeAssemblyCarriageListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    assembly_carriage_product_list: { normalizeParams: normalizeAssemblyCarriageListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    assembly_fbs_posting_list: { normalizeParams: normalizeAssemblyFbsPostingListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    assembly_fbs_product_list: { normalizeParams: normalizeAssemblyFbsProductListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b30" },
    fbs_carriage_container_get: { normalizeParams: normalizeFbsCarriageContainerGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b31" },
    fbs_carriage_container_list: { normalizeParams: normalizeFbsCarriageContainerListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b31" },
    fbs_carriage_container_status_get: { normalizeParams: normalizeFbsCarriageContainerStatusGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b31" },
    fbs_carriage_container_task_info: { normalizeParams: normalizeFbsCarriageContainerTaskInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b31" },
    fbs_product_country_list: { normalizeParams: normalizeFbsProductCountryListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32" },
    fbs_posting_restrictions: { normalizeParams: normalizeFbsPostingRestrictionsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32" },
    fbs_posting_timeslot_change_restrictions: { normalizeParams: normalizeFbsPostingTimeslotChangeRestrictionsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b49_fbs_posting_timeslot_change_restrictions" },
    fbs_act_get_postings: { normalizeParams: normalizeFbsActGetPostingsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32" },
    warehouse_fbs_return_mile_check: { normalizeParams: normalizeWarehouseFbsReturnMileCheckParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32" },
    warehouse_fbs_return_mile_info: { normalizeParams: normalizeWarehouseFbsReturnMileInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b32_array_numeric_keywords_not_reinterpreted" },
    product_import_info: { normalizeParams: normalizeProductImportInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33" },
    product_action_timer_status: { normalizeParams: normalizeProductActionTimerStatusParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33_array_maximum_not_reinterpreted" },
    warehouse_operation_status: { normalizeParams: normalizeWarehouseOperationStatusParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33" },
    supplier_available_warehouses: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33_get_no_params" },
    fbs_carriage_ettn_status: { normalizeParams: normalizeFbsCarriageEttnStatusParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33" },
    fbs_traceable_attribute_list: { normalizeParams: normalizeFbsTraceableAttributeListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b33" },
    returns_list: { normalizeParams: normalizeReturnsListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b4" },
    rfbs_returns_list: { normalizeParams: normalizeRfbsReturnsListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_25_b4_personal_data_read" },
    returns_utilization_history: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b25_no_body" },
    returns_utilization_info: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b25_no_body" },
    removal_from_stock_list: { normalizeParams: normalizeRemovalReportParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b37_explicit_last_id" },
    removal_from_supply_list: { normalizeParams: normalizeRemovalReportParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b37_explicit_last_id" },
    returns_company_fbs_info: { normalizeParams: normalizeReturnsCompanyFbsInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b21" },
    return_giveout_is_enabled: { normalizeParams: normalizeEmptyJsonBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b21_empty_json" },
    return_giveout_list: { normalizeParams: normalizeReturnGiveoutListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b21" },
    return_giveout_info: { normalizeParams: normalizeReturnGiveoutInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b21" },
    cancel_reason_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b4_no_body" },
    posting_fbs_cancel_reason_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b22_no_body" },
    posting_fbs_cancel_reason: { normalizeParams: normalizePostingFbsCancelReasonParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b46_fbs_posting_cancel_reason" },
    posting_fbo_cancel_reason_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b25_no_body" },
    cancel_reason_list_by_order: { normalizeParams: normalizeCancelReasonListByOrderParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b22" },
    cancel_reason_list_by_posting: { normalizeParams: normalizeCancelReasonListByPostingParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_27_b22" },
    order_cancel_status: { normalizeParams: normalizeOrderCancelStatusParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b4" },
    posting_cancel_status: { normalizeParams: normalizePostingCancelStatusParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b4" },
    finance_accrual_postings: { normalizeParams: normalizeFinanceAccrualPostingsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b5" },
    finance_accrual_types: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b5_no_body" },
    finance_accrual_by_day: { normalizeParams: normalizeFinanceAccrualByDayParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b5" },
    finance_cash_flow_statement_list: { normalizeParams: normalizeFinanceCashFlowStatementListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b38_finance_ledger" },
    finance_transaction_list_v3: { normalizeParams: normalizeFinanceTransactionListV3Params, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b38_finance_ledger" },
    finance_balance: { normalizeParams: normalizeFinanceBalanceParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b40_finance_realization_balance" },
    finance_realization_by_day: { normalizeParams: normalizeFinanceRealizationByDayParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b40_finance_realization_balance" },
    finance_realization_posting: { normalizeParams: normalizeFinanceRealizationMonthParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b40_finance_realization_balance" },
    finance_realization_v2: { normalizeParams: normalizeFinanceRealizationMonthParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b40_finance_realization_balance" },
    finance_products_buyout: { normalizeParams: normalizeFinanceProductsBuyoutParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b41_finance_buyout" },
    report_list: { normalizeParams: normalizeReportListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b5_existing_report_read" },
    report_info: { normalizeParams: normalizeReportInfoParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_25_b5_existing_report_read" },
    report_file_get: { normalizeParams: normalizeReportFileGetParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "opaque_report_file_ref_v1" },
    report_products_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_products_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_returns_create_v2: { normalizeParams: (params) => normalizeEffectRepairParams("report_returns_create_v2", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_postings_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_postings_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_discounted_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_discounted_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_warehouse_stock: { normalizeParams: (params) => normalizeEffectRepairParams("report_warehouse_stock", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_placement_by_products_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_placement_by_products_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_placement_by_supplies_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_placement_by_supplies_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_marked_products_sales_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_marked_products_sales_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_realization_posting_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_realization_posting_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_document_b2b_sales: { normalizeParams: (params) => normalizeEffectRepairParams("finance_document_b2b_sales", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_mutual_settlement_report: { normalizeParams: (params) => normalizeEffectRepairParams("finance_mutual_settlement_report", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_compensation_report: { normalizeParams: (params) => normalizeEffectRepairParams("finance_compensation_report", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_decompensation_report: { normalizeParams: (params) => normalizeEffectRepairParams("finance_decompensation_report", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    cargoes_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("cargoes_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    posting_fbs_act_container_labels: { normalizeParams: (params) => normalizeEffectRepairParams("posting_fbs_act_container_labels", params), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    posting_fbs_package_label: { normalizeParams: (params) => normalizeEffectRepairParams("posting_fbs_package_label", params), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    posting_fbs_package_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("posting_fbs_package_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    cargoes_transport_label_by_order_create: { normalizeParams: (params) => normalizeEffectRepairParams("cargoes_transport_label_by_order_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    cargoes_transport_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("cargoes_transport_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_act_from_create: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_act_from_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_act_to_create: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_act_to_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_draft_direct_product_validate: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_draft_direct_product_validate", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_draft_dropoff_product_validate: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_draft_dropoff_product_validate", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_draft_pickup_product_validate: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_draft_pickup_product_validate", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    chat_history_v3: { normalizeParams: (params) => normalizeEffectRepairParams("chat_history_v3", params), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    supply_order_list: { normalizeParams: normalizeSupplyOrderListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b8" },
    supply_order_get: { normalizeParams: normalizeSupplyOrderGetParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b8_revalidated" },
    supply_order_status_counter: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b8_no_body" },
    supply_order_bundle: { normalizeParams: normalizeSupplyOrderBundleParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b8" },
    supply_order_timeslot_list: { normalizeParams: normalizeSupplyOrderTimeslotListParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b8" },
    supply_order_details: { normalizeParams: normalizeSupplyOrderDetailsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b8_revalidated" },
    supply_order_act_accept_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_act_product_get: { normalizeParams: normalizeSupplyOrderActProductGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_act_summary_get: { normalizeParams: normalizeSupplyOrderActSummaryGetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_cancel_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_content_update_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_content_update_validation: { normalizeParams: normalizeSupplyOrderContentUpdateValidationParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_pass_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    supply_order_timeslot_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b24" },
    fbo_draft_create_info: { normalizeParams: normalizeFboDraftIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b26" },
    fbo_draft_supply_create_status: { normalizeParams: normalizeFboDraftIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b26" },
    fbo_draft_cluster_list: { normalizeParams: normalizeFboDraftClusterListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b27" },
    fbo_draft_warehouse_list: { normalizeParams: normalizeFboDraftWarehouseListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b27" },
    fbo_draft_timeslot_info: { normalizeParams: normalizeFboDraftTimeslotInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b48_fbo_draft_timeslot_info" },
    fbp_draft_dropoff_province_list: { normalizeParams: normalizeFbpWarehouseIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b36" },
    fbp_draft_dropoff_point_list: { normalizeParams: normalizeFbpDropoffPointListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b36_explicit_page" },
    fbp_draft_dropoff_point_timetable: { normalizeParams: normalizeFbpDropoffTimetableParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b36" },
    fbp_draft_direct_timeslot_get: { normalizeParams: normalizeFbpDraftDirectTimeslotParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b36" },
    fbp_order_direct_timeslot_list: { normalizeParams: normalizeFbpOrderDirectTimeslotParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b36" },
    fbp_order_dropoff_timetable: { normalizeParams: normalizeFbpDropoffTimetableParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b36" },
    fbo_cargoes_create_info: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b26" },
    fbo_cargoes_get: { normalizeParams: normalizeFboCargoesSupplyIdsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b26" },
    fbo_cargoes_delete_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b26" },
    fbo_cargoes_rules_get: { normalizeParams: normalizeFboCargoesSupplyIdsParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b26" },
    fbo_cargoes_v2_get: { normalizeParams: normalizeFboCargoesV2GetParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b28" },
    fbo_cargoes_v2_delete_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b28" },
    fbo_cargoes_transport_activate_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b28" },
    fbo_cargoes_transport_bind_status: { normalizeParams: normalizeSupplyOrderOperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b28" },
    fbo_cargoes_supplies_get: { normalizeParams: normalizeFboCargoesSupplyIds50Params, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b28" },
    product_visibility_info: { normalizeParams: normalizeProductVisibilityInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    product_quant_list: { normalizeParams: normalizeProductQuantListParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    product_quant_info: { normalizeParams: normalizeProductQuantInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    product_placement_zone_info: { normalizeParams: normalizeProductPlacementZoneInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    product_stairway_discount_by_quantity_get: { normalizeParams: normalizeProductStairwayDiscountByQuantityParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    product_fbs_warehouse_stocks: { normalizeParams: normalizeProductFbsWarehouseStocksParams, sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_08_28_b29" },
    seller_rating_summary: { normalizeParams: normalizeEmptyJsonBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b10" },
    seller_rating_history: { normalizeParams: normalizeSellerRatingHistoryParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b10" },
    seller_fbs_error_index: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b10_no_body" },
    seller_fbs_error_postings: { normalizeParams: normalizeSellerFbsErrorPostingsParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_26_b10" },
    review_list: { normalizeParams: normalizeReviewListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_26_b9_v2_personal_data_read" },
    review_info: { normalizeParams: normalizeReviewInfoParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_26_b9_v2_personal_data_read" },
    review_comment_list: { normalizeParams: normalizeReviewCommentListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_27_b17_personal_data_read" },
    review_count: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b17_no_body" },
    question_list: { normalizeParams: normalizeQuestionListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_26_b9_personal_data_read" },
    question_answer_list: { normalizeParams: normalizeQuestionAnswerListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_27_b17_personal_data_read" },
    question_count: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b17_no_body" },
    question_info: { normalizeParams: normalizeQuestionInfoParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "official_swagger_2026_08_27_b17_personal_data_read" },
    question_top_sku: { normalizeParams: normalizeQuestionTopSkuParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_08_27_b17" },
    product_certificate_accordance_types_v1: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    cargoes_label_get: { normalizeParams: normalizeStep5OperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    cargoes_label_transport_by_order_status: { normalizeParams: normalizeStep5OperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    cargoes_label_transport_status: { normalizeParams: normalizeStep5OperationIdParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    cargoes_transport_create_status: { normalizeParams: (params) => normalizeStep5OperationIdParams(params, { required: false }), sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    carriage_act_discrepancy_pdf: { normalizeParams: normalizeStep5CarriageIdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    carriage_container_document_get: { normalizeParams: normalizeStep5ContainerIdsParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    carriage_container_label_get: { normalizeParams: (params) => normalizeStep5ContainerIdsParams(params, { required: false, maximum: 300 }), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    carriage_courier_contact_get: { normalizeParams: normalizeStep5CarriageIdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    delivery_point_info: { normalizeParams: normalizeStep5DeliveryPointInfoParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    fbp_act_from_get: { normalizeParams: normalizeStep5FileUuidParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    fbp_act_to_get: { normalizeParams: normalizeStep5CodeSupplyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    fbp_label_get: { normalizeParams: normalizeStep5CodeSupplyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    posting_fbs_package_label_get_v1: { normalizeParams: normalizeStep5TaskIdParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    fbs_stock_by_warehouse_v1: { normalizeParams: normalizeStep5FbsStocksByWarehouseParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    receipts_get: { normalizeParams: (params) => normalizeStep5SingleStringParam(params, "receipt_id"), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    return_giveout_barcode: { normalizeParams: normalizeEmptyJsonBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    return_giveout_get_pdf: { normalizeParams: normalizeEmptyJsonBodyParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    return_giveout_get_png: { normalizeParams: normalizeEmptyJsonBodyParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    seller_actions_voucher_get: { normalizeParams: normalizeStep5ActionIdParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    invoice_get: { normalizeParams: (params) => normalizeStep5SingleStringParam(params, "posting_number"), sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    posting_fbs_act_get_barcode: { normalizeParams: normalizeStep5IdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    posting_fbs_act_get_barcode_text: { normalizeParams: normalizeStep5IdParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    posting_fbs_act_get_pdf: { normalizeParams: normalizeStep5IdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    posting_fbs_get_by_barcode: { normalizeParams: (params) => normalizeStep5SingleStringParam(params, "barcode"), sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    product_certification_params_v2: { normalizeParams: normalizeStep5CertificationParamsV2, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    fbs_posting_product_exemplar_status_v5: { normalizeParams: (params) => normalizeStep5SingleStringParam(params, "posting_number"), sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    fbs_posting_product_exemplar_create_or_get_v6: { normalizeParams: (params) => normalizeStep5SingleStringParam(params, "posting_number"), sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step5" },
    arrival_pass_list: { normalizeParams: normalizeStep7ArrivalPassListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    fbs_product_exemplar_validate: { normalizeParams: normalizeStep7ExemplarValidateParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    carriage_delivery_list_v2: { normalizeParams: normalizeStep7CarriageDeliveryListParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    posting_fbs_pickup_code_verify: { normalizeParams: normalizeStep7PickupCodeVerifyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    posting_global_etgb: { normalizeParams: normalizeStep7EtgbParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    rfbs_returns_get: { normalizeParams: normalizeStep7RfbsReturnsGetParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    conditional_cancellation_list: { normalizeParams: normalizeStep7ConditionalCancellationListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    chat_list_v3: { normalizeParams: normalizeStep7ChatListParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7_metadata_only" },
    finance_b2b_sales_json: { normalizeParams: normalizeStep7FinanceB2bSalesJsonParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    receipts_seller_list: { normalizeParams: normalizeStep7ReceiptsSellerListParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    discount_task_list_v2: { normalizeParams: normalizeStep7DiscountTaskListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    posting_digital_list_v2: { normalizeParams: normalizeStep7PostingDigitalListParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    notification_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7_no_body" },
    notification_push_type_list: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7_no_body" },
    fbp_archive_get: { normalizeParams: normalizeStep7SupplyIdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    fbp_archive_list: { normalizeParams: normalizeStep7FbpArchiveListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    fbp_draft_get: { normalizeParams: normalizeStep7SupplyIdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    fbp_draft_list: { normalizeParams: normalizeStep7FbpListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    fbp_order_get: { normalizeParams: normalizeStep7SupplyIdParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    fbp_order_list: { normalizeParams: normalizeStep7FbpListParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    delivery_check: { normalizeParams: normalizeStep7DeliveryCheckParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    delivery_checkout_v2: { normalizeParams: normalizeStep7DeliveryCheckoutParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    delivery_map: { normalizeParams: normalizeStep7DeliveryMapParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    delivery_point_list: { normalizeParams: normalizeEmptyJsonBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7_empty_json" },
    order_cancel_check: { normalizeParams: normalizeStep7OrderCancelCheckParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    posting_marks: { normalizeParams: normalizeStep7PostingMarksParams, sanitizeResult: safeReadResult, contract_state: "exact_operator_swagger_2026_08_25_step7" },
    performance_campaigns: { normalizeParams: normalizePerformanceCampaignsParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_v2_0" },
    performance_campaign_objects: { normalizeParams: normalizePerformanceCampaignObjectParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_2026_08_26_b6" },
    performance_bid_limits: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_2026_08_26_b6" },
    performance_campaign_products: { normalizeParams: normalizePerformanceCampaignProductsParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_2026_08_26_b6" },
    performance_search_promo_products: { normalizeParams: normalizePerformanceSearchPromoProductsParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_2026_08_26_b6" },
    performance_expense: { normalizeParams: normalizePerformanceDateRangeParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_v2_0_json_suffix" },
    performance_daily: { normalizeParams: normalizePerformanceDateRangeParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_v2_0_json_suffix" },
    performance_campaign_product: { normalizeParams: normalizePerformanceCampaignProductParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_v2_0_json_suffix" },
    performance_media: { normalizeParams: normalizePerformanceMediaParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_2026_08_26_b6_json_suffix" },
    performance_sku_statistics: { normalizeParams: normalizePerformanceSkuStatisticsParams, sanitizeResult: safeReadResult, contract_state: "official_performance_openapi_2026_08_26_b6" },
    performance_min_bid_by_sku: { normalizeParams: normalizePerformanceMinBidBySkuParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_products_with_bonuses: { normalizeParams: normalizeNoBodyParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_statistics_status: { normalizeParams: normalizePerformanceUuidPathParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_statistics_list_ui: { normalizeParams: normalizePerformancePageParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_statistics_list_api: { normalizeParams: normalizePerformancePageParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_statistics_report_download: { normalizeParams: normalizePerformanceReportDownloadParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_media_csv: { normalizeParams: normalizePerformanceMediaParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6_csv" },
    performance_campaign_product_csv: { normalizeParams: normalizePerformanceCampaignProductParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6_csv" },
    performance_expense_csv: { normalizeParams: normalizePerformanceDateRangeParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6_csv" },
    performance_daily_csv: { normalizeParams: normalizePerformanceDateRangeParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6_csv" },
    performance_competitive_bids: { normalizeParams: normalizePerformanceCompetitiveBidsParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_cpo_min_bids: { normalizeParams: normalizePerformanceCpoMinBidsParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_vendor_statistics_list: { normalizeParams: normalizePerformancePageParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_vendor_statistics_status: { normalizeParams: normalizePerformanceVendorStatisticsStatusParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" },
    performance_vendor_tag: { normalizeParams: normalizePerformanceVendorTagParams, sanitizeResult: safeReadResult, contract_state: "exact_performance_openapi_2026_08_29_step6" }
  });

  const OPERATION_METADATA = globalThis.OzonOperationRegistry?.OPERATIONS || {};
  const OPERATIONS = deepFreeze(Object.fromEntries(Object.entries(OPERATION_METADATA).map(([alias, metadata]) => {
    const binding = IMPLEMENTATION_BINDINGS[alias] || {};
    return [alias, { ...metadata, ...binding }];
  })));


  function createOzonContract({
    operations = OPERATIONS,
    prefix = "OZON_API_V1",
    resultPrefix = "OZON_RESULT_V1",
    version = globalThis.OzonRuntime?.RUNTIME?.version || "0.1.19",
    sellerApiBase = "https://api-seller.ozon.ru",
    performanceApiBase = "https://api-performance.ozon.ru"
  } = {}) {
    const registry = {};
    for (const [name, meta] of Object.entries(operations)) {
      validateOperationMeta(name, meta);
      registry[name] = deepFreeze({ ...meta });
    }
    deepFreeze(registry);

    function resolveOperation(name) {
      const operation = String(name || "").trim();
      if (!operation || operation.length > 120) fail("INVALID_OPERATION", "operation отсутствует или слишком длинный.");
      const meta = registry[operation];
      if (!meta) fail("UNSUPPORTED_OPERATION", `Операция ${operation} не разрешена.`);
      if (meta.effect !== "READ") fail("NON_READ_OPERATION_REJECTED", `Операция ${operation} не является READ.`);
      return { operation, meta };
    }

    function normalizeCommand(raw) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("INVALID_JSON_ROOT", "Команда должна быть JSON-объектом.");
      const extra = Object.keys(raw).filter((key) => !["operation", "params"].includes(key));
      if (extra.length) fail("UNKNOWN_TOP_LEVEL_FIELD", `Неизвестные поля команды: ${extra.join(", ")}`);
      const { operation, meta } = resolveOperation(raw.operation);
      const params = sanitizeJsonValue(raw.params === undefined ? {} : raw.params);
      const normalizedParams = meta.execution_enabled === true && typeof meta.normalizeParams === "function"
        ? sanitizeJsonValue(meta.normalizeParams(params), "normalized_params")
        : params;
      return deepFreeze({ operation, params: normalizedParams });
    }

    function sellerCapabilityRequirement(command, atMs = Date.now(), entitlementSnapshot = null) {
      const normalized = normalizeCommand(command);
      const preflight = resolveOperation(normalized.operation);
      if (String(preflight.meta.provider || "seller_api") !== "seller_api") return deepFreeze({ required: false, known: true, reasons: [] });
      const requirement = globalThis.OzonEntitlements?.requirementFor
        ? globalThis.OzonEntitlements.requirementFor(normalized, entitlementSnapshot, atMs)
        : { required: false, known: false, allowed_subscription_types: [], reasons: ["entitlement_module_missing"] };
      return deepFreeze({
        required: requirement.required === true,
        known: requirement.known !== false,
        reasons: [...(requirement.reasons || [])],
        allowed_subscription_types: [...(requirement.allowed_subscription_types || [])],
        entitlement_key: requirement.entitlement_key || preflight.meta.entitlement_key || `${preflight.meta.method} ${preflight.meta.path}`,
        rule_source: requirement.rule_source || null
      });
    }

    function planningMeta(profile, entitlement) {
      const capability = normalizeCapabilityProfile(profile);
      return deepFreeze({
        capability: {
          status: capability.status,
          subscription_type: capability.subscription_type,
          is_premium: capability.is_premium,
          probe_performed: capability.probe_performed,
          probe_http_status: capability.probe_http_status,
          probe_error_code: capability.probe_error_code
        },
        entitlement: { ...entitlement }
      });
    }

    function planningReject(command, profile, { code, message, entitlementStatus, reason, extra = {} }) {
      return deepFreeze({
        action: "reject",
        command: normalizeCommand(command),
        error: { code, message },
        planning: planningMeta(profile, {
          status: entitlementStatus,
          partial: false,
          reason,
          ...extra
        })
      });
    }

    function planningExecute(logicalCommand, executionCommand, profile, entitlement) {
      return deepFreeze({
        action: "execute",
        command: normalizeCommand(executionCommand),
        logical_command: normalizeCommand(logicalCommand),
        planning: planningMeta(profile, entitlement)
      });
    }

    function planCommandForSellerCapability(command, profile, atMs = Date.now(), entitlementSnapshot = null) {
      const normalized = normalizeCommand(command);
      const meta = resolveOperation(normalized.operation).meta;
      if (String(meta.provider || "seller_api") !== "seller_api") {
        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {
          status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: false, reason: "performance_provider_not_seller_subscription"
        });
      }

      const requirement = globalThis.OzonEntitlements?.requirementFor
        ? globalThis.OzonEntitlements.requirementFor(normalized, entitlementSnapshot, atMs)
        : { required: false, known: false, allowed_subscription_types: [], reasons: ["entitlement_module_missing"] };

      if (requirement.known === false) {
        // Unknown/stale metadata is not converted into a guessed Premium block.
        // The exact safe request is allowed to reach Ozon, which is authoritative.
        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {
          status: "ENTITLEMENT_UNKNOWN",
          partial: false,
          capability_required: false,
          reason: (requirement.reasons || ["entitlement_rule_unknown"])[0],
          entitlement_key: requirement.entitlement_key || meta.entitlement_key || `${meta.method} ${meta.path}`,
          rule_source: requirement.rule_source || null,
          exact_request_preserved: true
        });
      }

      if (requirement.required !== true) {
        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {
          status: "SUPPORTED_AND_ENTITLED",
          partial: false,
          capability_required: false,
          reason: requirement.default_access === "ALL_ACCOUNTS_PARTIAL_RESPONSE" ? "provider_may_return_subscription_dependent_scope" : "all_accounts",
          entitlement_key: requirement.entitlement_key || meta.entitlement_key || `${meta.method} ${meta.path}`,
          rule_source: requirement.rule_source || null,
          exact_request_preserved: true
        });
      }

      const capability = normalizeCapabilityProfile(profile);
      const allowed = Array.isArray(requirement.allowed_subscription_types) ? requirement.allowed_subscription_types : [];
      const tierText = globalThis.OzonEntitlements?.humanTierList ? globalThis.OzonEntitlements.humanTierList(allowed) : allowed.join(" / ");
      if (capability.status !== "known") {
        return planningReject(normalized, capability, {
          code: "ENTITLEMENT_UNKNOWN",
          message: `Не удалось подтвердить текущую подписку продавца для запроса, который по актуальным правилам Ozon требует ${tierText || "определённую подписку"}. Запрос не изменён и не отправлен.`,
          entitlementStatus: "ENTITLEMENT_UNKNOWN",
          reason: (requirement.reasons || ["subscription_required"])[0],
          extra: { required_subscription_types: [...allowed], entitlement_key: requirement.entitlement_key || null, rule_source: requirement.rule_source || null, exact_request_preserved: true }
        });
      }
      if (!allowed.includes(capability.subscription_type)) {
        return planningReject(normalized, capability, {
          code: "SUBSCRIPTION_REQUIRED",
          message: `Этот запрос доступен только для Ozon ${tierText || allowed.join(" / ")}.`,
          entitlementStatus: "SUPPORTED_BUT_NOT_ENTITLED",
          reason: (requirement.reasons || ["subscription_required"])[0],
          extra: { required_subscription_types: [...allowed], entitlement_key: requirement.entitlement_key || null, rule_source: requirement.rule_source || null, exact_request_preserved: true }
        });
      }
      return planningExecute(normalized, normalized, capability, {
        status: "SUPPORTED_AND_ENTITLED",
        partial: false,
        capability_required: true,
        reason: (requirement.reasons || ["subscription_requirement_satisfied"])[0],
        required_subscription_types: [...allowed],
        entitlement_key: requirement.entitlement_key || null,
        rule_source: requirement.rule_source || null,
        exact_request_preserved: true
      });
    }

    function parseCommand(text) {
      const source = String(text || "").replace(/\u00a0/g, " ").trim();
      if (!source.startsWith(prefix)) fail("NOT_OZON_COMMAND", `Команда должна начинаться с ${prefix}`);
      const rest = source.slice(prefix.length).trim();
      if (!rest) fail("MISSING_JSON", `После ${prefix} должен идти JSON-объект.`);
      let raw;
      try { raw = JSON.parse(rest); }
      catch (error) { fail("INVALID_JSON", `Некорректный JSON: ${error.message}`); }
      return normalizeCommand(raw);
    }

    function extractBalancedJsonObject(source, objectStart) {
      if (source[objectStart] !== "{") return { ok: false, code: "MISSING_JSON", message: `После ${prefix} должен идти JSON-объект.` };
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = objectStart; index < source.length; index += 1) {
        const char = source[index];
        if (inString) {
          if (escaped) { escaped = false; continue; }
          if (char === "\\") { escaped = true; continue; }
          if (char === "\"") inString = false;
          continue;
        }
        if (char === "\"") { inString = true; continue; }
        if (char === "{") depth += 1;
        else if (char === "}") {
          depth -= 1;
          if (depth === 0) return { ok: true, json_text: source.slice(objectStart, index + 1), end_index: index + 1 };
          if (depth < 0) break;
        }
      }
      return { ok: false, code: "INVALID_JSON", message: "JSON-объект после OZON_API_V1 не завершён." };
    }

    // This deliberately retains syntax only: bounded key names and intent labels,
    // never raw parameter values, credentials, or surrounding assistant text.
    function sanitizedAttemptDescriptor(value, errorCode = "INVALID_COMMAND") {
      if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
        return Object.freeze({ error_code: String(errorCode).slice(0, 80), top_level_keys: Object.freeze([]), intent: Object.freeze({}), parameter_keys: Object.freeze([]), sensitive: false });
      }
      const clean = (item) => String(item || "").toLowerCase().slice(0, 240);
      const top = Object.keys(value).slice(0, 24).map(clean);
      const sensitiveNames = new Set(["authorization", "api_key", "apikey", "client_id", "clientid", "client_secret", "clientsecret", "token", "access_token", "access-token"]);
      const intentFields = new Set(["operation", "method", "path", "endpoint", "action"]);
      const intent = {};
      for (const key of top) if (intentFields.has(key) && typeof value[key] === "string") intent[key] = clean(value[key]);
      const params = value.params && typeof value.params === "object" && !Array.isArray(value.params) ? value.params : value.args && typeof value.args === "object" && !Array.isArray(value.args) ? value.args : {};
      const parameterKeys = Object.keys(params).slice(0, 32).map(clean);
      return Object.freeze({ error_code: String(errorCode).slice(0, 80), top_level_keys: Object.freeze(top), intent: Object.freeze(intent), parameter_keys: Object.freeze(parameterKeys), sensitive: top.some((key) => sensitiveNames.has(key)) || parameterKeys.some((key) => sensitiveNames.has(key)) });
    }

    function discoverCommands(text) {
      const source = String(text || "").replace(/\u00a0/g, " ");
      const ignorableSeparator = /[\s\u200B\u2060\u00AD]/u;
      const discovered = [];
      let cursor = 0;
      while (cursor < source.length) {
        const markerIndex = source.indexOf(prefix, cursor);
        if (markerIndex < 0) break;
        const afterMarker = markerIndex + prefix.length;
        let objectStart = afterMarker;
        while (objectStart < source.length && ignorableSeparator.test(source[objectStart])) objectStart += 1;
        if (source[objectStart] !== "{") {
          discovered.push(Object.freeze({
            ok: false,
            marker_index: markerIndex,
            code: "MISSING_JSON",
            message: `После ${prefix} должен непосредственно идти JSON-объект.`
          }));
          cursor = afterMarker;
          continue;
        }
        const extracted = extractBalancedJsonObject(source, objectStart);
        if (!extracted.ok) {
          discovered.push(Object.freeze({
            ok: false,
            marker_index: markerIndex,
            code: extracted.code || "INVALID_JSON",
            message: extracted.message || "Некорректный JSON после OZON_API_V1."
          }));
          cursor = afterMarker;
          continue;
        }
        const commandText = `${prefix} ${extracted.json_text}`;
        let rawAttempt = null;
        try { rawAttempt = JSON.parse(extracted.json_text); } catch (_) { /* parseCommand returns the exact existing JSON error */ }
        try {
          const command = parseCommand(commandText);
          discovered.push(Object.freeze({
            ok: true,
            marker_index: markerIndex,
            command_text: commandText,
            command,
            command_fingerprint: commandFingerprint(command)
          }));
        } catch (error) {
          discovered.push(Object.freeze({
            ok: false,
            marker_index: markerIndex,
            code: String(error?.code || "INVALID_COMMAND"),
            message: String(error?.message || error || "Некорректная команда."),
            attempt_descriptor: sanitizedAttemptDescriptor(rawAttempt, String(error?.code || "INVALID_COMMAND"))
          }));
        }
        cursor = extracted.end_index;
      }
      return Object.freeze(discovered);
    }

    function preflightExecution(command) {
      const normalized = normalizeCommand(command);
      const { meta } = resolveOperation(normalized.operation);
      if (meta.execution_enabled !== true) fail("OPERATION_BLOCKED", `Операция ${normalized.operation} отключена политикой bridge.`);
      validateOperationMeta(normalized.operation, meta);
      return { command: normalized, meta };
    }

    function buildRequest(command, headers) {
      const preflight = preflightExecution(command);
      const { meta } = preflight;
      if (String(meta.provider || "seller_api") !== "seller_api") fail("WRONG_REQUEST_BUILDER", "Performance operation нельзя отправить через Seller request builder.");
      if (!/^https:\/\/api-seller\.ozon\.ru$/.test(sellerApiBase)) fail("INVALID_FIXED_HOST", "Seller API host не прошёл fixed-host guard.");
      return deepFreeze({
        url: `${sellerApiBase}${meta.path}`,
        method: meta.method,
        headers: { ...headers },
        body: meta.method === "POST" && meta.request_style === "json_body" ? JSON.stringify(preflight.command.params) : undefined,
        operation: preflight.command.operation,
        path: meta.path,
        host_alias: "seller_api",
        response_style: String(meta.response_style || "json"),
        response_content_types: Array.isArray(meta.response_content_types) ? [...meta.response_content_types] : ["application/json"]
      });
    }

    function buildPerformanceRequest(command, headers) {
      const preflight = preflightExecution(command);
      const { meta } = preflight;
      if (String(meta.provider || "seller_api") !== "performance_api") fail("WRONG_REQUEST_BUILDER", "Seller operation нельзя отправить через Performance request builder.");
      if (!/^https:\/\/api-performance\.ozon\.ru$/.test(performanceApiBase)) fail("INVALID_FIXED_HOST", "Performance API host не прошёл fixed-host guard.");
      assertPerformanceMutationBlocked(meta.method, meta.path);
      assertPerformanceAsyncReportSideEffectBlocked(meta.method, meta.path);

      let fixedPath = String(meta.path);
      const requestParams = { ...preflight.command.params };
      if (fixedPath.includes("{campaignId}")) {
        const campaignId = requireUint64String(requireField(requestParams, "campaignId"), "params.campaignId");
        fixedPath = fixedPath.replace("{campaignId}", encodeURIComponent(campaignId));
        delete requestParams.campaignId;
      }
      if (fixedPath.includes("{UUID}")) {
        const reportUuid = normalizePerformanceUuidValue(requireField(requestParams, "UUID"), "params.UUID");
        fixedPath = fixedPath.replace("{UUID}", encodeURIComponent(reportUuid));
        delete requestParams.UUID;
      }
      if (/[{}]/.test(fixedPath)) fail("INVALID_FIXED_PATH_TEMPLATE", "Performance API path содержит неподдерживаемый фиксированный placeholder.");

      const query = meta.request_style === "query" ? encodeQueryParams(requestParams) : "";
      const url = `${performanceApiBase}${fixedPath}${query ? `?${query}` : ""}`;
      return deepFreeze({
        url,
        method: meta.method,
        headers: { ...headers },
        body: meta.method === "POST" && meta.request_style === "json_body" ? JSON.stringify(requestParams) : undefined,
        operation: preflight.command.operation,
        path: fixedPath,
        host_alias: "performance_api",
        response_style: String(meta.response_style || "json"),
        response_content_types: Array.isArray(meta.response_content_types) ? [...meta.response_content_types] : ["application/json"]
      });
    }

    function sanitizeResult(command, rawResult) {
      const preflight = preflightExecution(command);
      const sanitized = preflight.meta.sanitizeResult(rawResult, { operation: preflight.command.operation });
      return deepFreeze(sanitizeJsonValue(sanitized, "result", { rejectTransportKeys: false }));
    }

    function fnv1aFingerprint(value) {
      const text = String(value || "");
      let hash = 2166136261;
      for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function commandFingerprint(command) {
      return fnv1aFingerprint(JSON.stringify(normalizeCommand(command)));
    }

    function textFingerprint(text) {
      const source = String(text || "").replace(/\u00a0/g, " ").trim();
      return fnv1aFingerprint(source);
    }

    function stableSemanticClone(value) {
      if (Array.isArray(value)) return value.map((item) => stableSemanticClone(item));
      if (value && typeof value === "object") {
        const out = {};
        for (const key of Object.keys(value).sort()) out[key] = stableSemanticClone(value[key]);
        return out;
      }
      return value;
    }

    function analyticsCoalescingDescriptor(command) {
      const normalized = normalizeCommand(command);
      if (normalized.operation !== "analytics_data") {
        return deepFreeze({ eligible: false, reason: "operation_not_analytics_data", metrics: [], compatibility_key: null, compatibility_fingerprint: null });
      }
      const metrics = Array.isArray(normalized.params.metrics) ? [...normalized.params.metrics] : [];
      if (!metrics.length) {
        return deepFreeze({ eligible: false, reason: "analytics_metrics_empty", metrics, compatibility_key: null, compatibility_fingerprint: null });
      }
      if (new Set(metrics).size !== metrics.length) {
        return deepFreeze({ eligible: false, reason: "duplicate_metrics_preserve_exact_semantics", metrics, compatibility_key: null, compatibility_fingerprint: null });
      }
      const params = sanitizeJsonValue(normalized.params, "coalescing.params", { rejectTransportKeys: false });
      delete params.metrics;
      const compatibilityKey = JSON.stringify(stableSemanticClone({ operation: normalized.operation, params }));
      return deepFreeze({
        eligible: true,
        reason: "compatible_shape_candidate",
        metrics,
        compatibility_key: compatibilityKey,
        compatibility_fingerprint: fnv1aFingerprint(compatibilityKey)
      });
    }

    function buildAnalyticsCoalescedCommand(commands) {
      const list = Array.isArray(commands) ? commands : [];
      if (list.length < 2) fail("ANALYTICS_COALESCING_GROUP_TOO_SMALL", "Coalesced analytics group должен содержать минимум две logical команды.");
      const normalized = list.map((command) => normalizeCommand(command));
      const descriptors = normalized.map((command) => analyticsCoalescingDescriptor(command));
      if (descriptors.some((descriptor) => descriptor.eligible !== true)) fail("ANALYTICS_COALESCING_INELIGIBLE", "Одна из analytics_data команд не допускает safe coalescing.");
      const compatibilityKey = descriptors[0].compatibility_key;
      if (descriptors.some((descriptor) => descriptor.compatibility_key !== compatibilityKey)) fail("ANALYTICS_COALESCING_SEMANTICS_MISMATCH", "analytics_data команды имеют несовместимую query semantics.");
      const metrics = [];
      const seen = new Set();
      for (const descriptor of descriptors) {
        for (const metric of descriptor.metrics) {
          if (!seen.has(metric)) {
            seen.add(metric);
            metrics.push(metric);
          }
        }
      }
      if (metrics.length > 14) fail("ANALYTICS_COALESCING_METRIC_LIMIT", "Union analytics_data metrics превышает 14.");
      const params = sanitizeJsonValue(normalized[0].params, "coalescing.physical_params", { rejectTransportKeys: false });
      params.metrics = metrics;
      const physicalCommand = normalizeCommand({ operation: "analytics_data", params });
      return deepFreeze({
        command: physicalCommand,
        metrics: [...metrics],
        compatibility_key: compatibilityKey,
        compatibility_fingerprint: descriptors[0].compatibility_fingerprint
      });
    }

    function reviewedAnalyticsAcquisitionProfile(command) {
      const normalized = normalizeCommand(command);
      if (normalized.operation !== "analytics_data") {
        return deepFreeze({ applicable: false, profile_id: null, prefetch_applied: false, command: normalized, requested_metrics: [], physical_metrics: [] });
      }
      const descriptor = analyticsCoalescingDescriptor(normalized);
      const requestedMetrics = Array.isArray(normalized.params.metrics) ? [...normalized.params.metrics] : [];
      if (!descriptor.eligible || !requestedMetrics.length || requestedMetrics.some((metric) => !ANALYTICS_UNIVERSAL_METRICS.includes(metric))) {
        return deepFreeze({ applicable: false, profile_id: null, prefetch_applied: false, command: normalized, requested_metrics: requestedMetrics, physical_metrics: requestedMetrics });
      }
      const physicalMetrics = [...ANALYTICS_UNIVERSAL_METRICS];
      const params = sanitizeJsonValue(normalized.params, "acquisition_profile.params", { rejectTransportKeys: false });
      params.metrics = physicalMetrics;
      const physicalCommand = normalizeCommand({ operation: "analytics_data", params });
      return deepFreeze({
        applicable: true,
        profile_id: "analytics_basic_metrics_v1",
        prefetch_applied: physicalMetrics.some((metric) => !requestedMetrics.includes(metric)),
        command: physicalCommand,
        requested_metrics: requestedMetrics,
        physical_metrics: physicalMetrics
      });
    }

    function projectAnalyticsDataResult(rawResult, physicalMetricsInput, logicalMetricsInput) {
      const physicalMetrics = Array.isArray(physicalMetricsInput) ? physicalMetricsInput.map((metric) => String(metric)) : [];
      const logicalMetrics = Array.isArray(logicalMetricsInput) ? logicalMetricsInput.map((metric) => String(metric)) : [];
      if (!physicalMetrics.length || new Set(physicalMetrics).size !== physicalMetrics.length) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "Physical metrics list не является однозначным набором.");
      if (!logicalMetrics.length || new Set(logicalMetrics).size !== logicalMetrics.length) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "Logical metrics list не является однозначным набором.");
      const indexByMetric = new Map(physicalMetrics.map((metric, index) => [metric, index]));
      if (logicalMetrics.some((metric) => !indexByMetric.has(metric))) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "Logical metrics не являются подмножеством physical metrics.");

      const projected = sanitizeJsonValue(rawResult, "coalesced_result", { rejectTransportKeys: false });
      if (!projected || typeof projected !== "object" || Array.isArray(projected)) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "analytics_data response должен быть объектом.");
      const result = projected.result;
      if (!result || typeof result !== "object" || Array.isArray(result)) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "analytics_data response.result отсутствует или имеет неподдерживаемую форму.");

      const logicalIndexes = logicalMetrics.map((metric) => indexByMetric.get(metric));
      let projectableSurfaceSeen = false;
      if (Object.prototype.hasOwnProperty.call(result, "data")) {
        if (!Array.isArray(result.data)) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "analytics_data result.data должен быть массивом.");
        result.data = result.data.map((row, rowIndex) => {
          if (!row || typeof row !== "object" || Array.isArray(row)) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", `analytics_data result.data[${rowIndex}] должен быть объектом.`);
          if (!Array.isArray(row.metrics) || row.metrics.length !== physicalMetrics.length) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", `analytics_data result.data[${rowIndex}].metrics не совпадает с physical metrics cardinality.`);
          return { ...row, metrics: logicalIndexes.map((index) => row.metrics[index]) };
        });
        projectableSurfaceSeen = true;
      }
      if (Object.prototype.hasOwnProperty.call(result, "totals")) {
        if (!Array.isArray(result.totals) || result.totals.length !== physicalMetrics.length) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "analytics_data result.totals не совпадает с physical metrics cardinality.");
        result.totals = logicalIndexes.map((index) => result.totals[index]);
        projectableSurfaceSeen = true;
      }
      if (!projectableSurfaceSeen) fail("ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE", "analytics_data response не содержит проверяемой metric projection surface.");
      return deepFreeze(projected);
    }

    function providerErrorCategory(status) {
      const code = Number(status || 0);
      if (code === 429) return "rate_limit";
      if (code === 401 || code === 403) return "auth_or_permission";
      if (code >= 500) return "provider_server";
      if (code >= 400) return "provider_request";
      return "provider_error";
    }

    function verifyProviderResponse(command, rawResult) {
      const normalized = normalizeCommand(command);
      if (rawResult === null || rawResult === undefined) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", `${normalized.operation}: provider response body отсутствует.`);
      if (normalized.operation !== "analytics_data") return deepFreeze({ verified: true, operation: normalized.operation, rule: "sanitization_only" });
      if (!rawResult || typeof rawResult !== "object" || Array.isArray(rawResult)) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", "analytics_data response должен быть JSON object.");
      const result = rawResult.result;
      if (!result || typeof result !== "object" || Array.isArray(result)) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", "analytics_data response.result отсутствует или имеет неподдерживаемую форму.");
      const expectedMetrics = Array.isArray(normalized.params.metrics) ? normalized.params.metrics.length : 0;
      if (!expectedMetrics) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", "analytics_data verification requires a non-empty physical metrics list.");
      let verifiedSurface = false;
      if (Object.prototype.hasOwnProperty.call(result, "data")) {
        if (!Array.isArray(result.data)) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", "analytics_data result.data должен быть массивом.");
        for (let index = 0; index < result.data.length; index += 1) {
          const row = result.data[index];
          if (!row || typeof row !== "object" || Array.isArray(row)) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", `analytics_data result.data[${index}] должен быть объектом.`);
          if (!Array.isArray(row.metrics) || row.metrics.length !== expectedMetrics) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", `analytics_data result.data[${index}].metrics cardinality не совпадает с physical request.`);
        }
        verifiedSurface = true;
      }
      if (Object.prototype.hasOwnProperty.call(result, "totals")) {
        if (!Array.isArray(result.totals) || result.totals.length !== expectedMetrics) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", "analytics_data result.totals cardinality не совпадает с physical request.");
        verifiedSurface = true;
      }
      if (!verifiedSurface) fail("PROVIDER_RESPONSE_CONTRACT_MISMATCH", "analytics_data response не содержит проверяемой metrics surface.");
      return deepFreeze({ verified: true, operation: normalized.operation, metric_count: expectedMetrics, rule: "analytics_metric_cardinality" });
    }

    function safeErrorPayload(status, rawText, parsed) {
      const candidate = parsed && typeof parsed === "object" ? parsed : null;
      const rawCode = candidate?.code || candidate?.error?.code || candidate?.status || "OZON_API_ERROR";
      const codeText = String(rawCode).trim();
      const code = /^[A-Za-z0-9_.:-]{1,160}$/.test(codeText) ? codeText : "OZON_API_ERROR";
      return Object.freeze({
        source: "provider",
        category: providerErrorCategory(status),
        http_status: Number(status || 0),
        code,
        message: "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",
        automatic_retry: false,
        external_request_executed: true
      });
    }

    function safeBridgeErrorPayload(error, httpStatus = 0) {
      const rawCode = error?.code || error?.name || "OZON_BRIDGE_ERROR";
      const codeText = String(rawCode).trim();
      const code = /^[A-Za-z0-9_.:-]{1,160}$/.test(codeText) ? codeText : "OZON_BRIDGE_ERROR";
      let message = String(error?.message || "Ozon Bridge не смог завершить обработку запроса.");
      message = message
        .replace(/https?:\/\/[^\s]+/gi, "[REDACTED_URL]")
        .replace(/(?:Api-Key|Client-Id|Authorization)\s*[:=]\s*[^\s,;]+/gi, (match) => `${match.split(/[:=]/)[0]}=[REDACTED]`)
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
        .replace(/\b[A-Za-z0-9_\-]{32,}\b/g, "[REDACTED_SECRET]")
        .replace(/\+?\d[\d ()-]{8,}\d/g, "[REDACTED_PHONE]")
        .slice(0, 700);
      const externalRequestExecuted = error?.external_request_executed === true || error?.request_attempted === true;
      const category = code === "PROVIDER_RESPONSE_CONTRACT_MISMATCH" ? "provider_contract"
        : code === "PROVIDER_FETCH_FAILED" ? "transport"
        : code.startsWith("PROVIDER_QUOTA_") ? "rate_limit"
        : "bridge_error";
      return Object.freeze({
        source: "bridge",
        category,
        http_status: Number(httpStatus || error?.http_status || 0),
        code,
        message,
        automatic_retry: false,
        external_request_executed: externalRequestExecuted
      });
    }

    function formatResultReport({ requestId, command, requestMeta, httpStatus, result, elapsedMs, pagination = null, rateLimit = null, planning = null }) {
      const normalized = normalizeCommand(command);
      const requestMetaOut = {
        provider: "ozon",
        host_alias: String(requestMeta?.host_alias || "seller_api"),
        http_method: String(requestMeta?.http_method || ""),
        path_alias: String(requestMeta?.path_alias || normalized.operation)
      };
      if (typeof requestMeta?.external_request_executed === "boolean") requestMetaOut.external_request_executed = requestMeta.external_request_executed;
      if (typeof requestMeta?.capability_probe_executed === "boolean") requestMetaOut.capability_probe_executed = requestMeta.capability_probe_executed;
      if (Number.isFinite(Number(requestMeta?.capability_probe_http_status))) requestMetaOut.capability_probe_http_status = Number(requestMeta.capability_probe_http_status || 0);
      if (requestMeta?.physical_request_id) requestMetaOut.physical_request_id = String(requestMeta.physical_request_id).slice(0, 200);
      if (requestMeta?.physical_command_fingerprint) requestMetaOut.physical_command_fingerprint = String(requestMeta.physical_command_fingerprint).slice(0, 80);
      if (requestMeta?.coalescing_group_id) requestMetaOut.coalescing_group_id = String(requestMeta.coalescing_group_id).slice(0, 120);
      if (Number.isInteger(Number(requestMeta?.coalesced_logical_count)) && Number(requestMeta.coalesced_logical_count) > 0) requestMetaOut.coalesced_logical_count = Number(requestMeta.coalesced_logical_count);
      const envelope = {
        bridge: "ozon-llm-api-bridge",
        version,
        request_id: String(requestId || ""),
        operation: normalized.operation,
        command: { operation: normalized.operation, fingerprint: commandFingerprint(normalized) },
        request_meta: requestMetaOut,
        http_status: Number(httpStatus || 0),
        elapsed_ms: Number(elapsedMs || 0),
        pagination,
        rate_limit: rateLimit,
        planning: planning ? sanitizeJsonValue(planning, "planning", { rejectTransportKeys: false }) : null,
        result
      };
      return `${resultPrefix}\n${JSON.stringify(envelope, null, 2)}`;
    }

    function formatPreExecutionErrorReport({ requestId, error, stage = "command_parse", commandFingerprint: rawFingerprint = "" }) {
      const safe = safeBridgeErrorPayload(error, 0);
      const cleanStage = /^[a-z0-9_.:-]{1,80}$/i.test(String(stage || "")) ? String(stage) : "pre_execution";
      const cleanFingerprint = /^[a-f0-9]{8,64}$/i.test(String(rawFingerprint || "")) ? String(rawFingerprint).toLowerCase() : "00000000";
      const envelope = {
        bridge: "ozon-llm-api-bridge",
        version,
        request_id: String(requestId || ""),
        operation: null,
        command: {
          accepted: false,
          fingerprint: cleanFingerprint
        },
        request_meta: {
          provider: "ozon",
          stage: cleanStage,
          external_request_executed: false
        },
        http_status: 0,
        elapsed_ms: 0,
        pagination: null,
        rate_limit: null,
        result: {
          error: {
            ...safe,
            stage: cleanStage,
            external_request_executed: false
          }
        }
      };
      return `${resultPrefix}\n${JSON.stringify(envelope, null, 2)}`;
    }

    function isCommandText(text) {
      return String(text || "").replace(/\u00a0/g, " ").trim().startsWith(prefix);
    }

    return Object.freeze({
      PREFIX: prefix,
      RESULT_PREFIX: resultPrefix,
      VERSION: version,
      SELLER_API_BASE: sellerApiBase,
      PERFORMANCE_API_BASE: performanceApiBase,
      PERFORMANCE_MUTATION_BLOCKLIST,
      PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST,
      OPERATIONS: registry,
      parseCommand,
      discoverCommands,
      sanitizedAttemptDescriptor,
      normalizeCommand,
      resolveOperation,
      preflightExecution,
      buildRequest,
      buildPerformanceRequest,
      sanitizeResult,
      commandFingerprint,
      textFingerprint,
      analyticsCoalescingDescriptor,
      buildAnalyticsCoalescedCommand,
      reviewedAnalyticsAcquisitionProfile,
      projectAnalyticsDataResult,
      verifyProviderResponse,
      safeErrorPayload,
      safeBridgeErrorPayload,
      sellerCapabilityRequirement,
      planCommandForSellerCapability,
      normalizeCapabilityProfile,
      SELLER_SUBSCRIPTION_TYPES,
      ANALYTICS_METRICS,
      ANALYTICS_DIMENSIONS,
      operationRegistry: globalThis.OzonOperationRegistry || null,
      formatResultReport,
      formatPreExecutionErrorReport,
      isCommandText
    });
  }

  const OzonContract = createOzonContract();
  globalThis.OzonContract = OzonContract;
  globalThis.OzonContractFactory = Object.freeze({ createOzonContract, OPERATIONS, PERFORMANCE_MUTATION_BLOCKLIST, PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST });
})();

/* END shared/ozon_contract.js */

/* BEGIN shared/ozon_provider.js */
(() => {
  "use strict";

  function findFirstField(value, keyName, depth = 0) {
    if (depth > 8 || value === null || value === undefined) return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findFirstField(item, keyName, depth + 1);
        if (found !== null && found !== undefined) return found;
      }
      return null;
    }
    if (typeof value !== "object") return null;
    for (const [key, child] of Object.entries(value)) {
      if (String(key).toLowerCase() === String(keyName).toLowerCase()) return child;
      const found = findFirstField(child, keyName, depth + 1);
      if (found !== null && found !== undefined) return found;
    }
    return null;
  }

  function arrayCountForField(value, field) {
    const found = findFirstField(value, field);
    return Array.isArray(found) ? found.length : null;
  }

  function safeQuotaRateMeta(quota, retryAfter = null) {
    const source = quota && typeof quota === "object" ? quota : {};
    const output = {};
    if (source.family) output.quota_family = String(source.family).slice(0, 120);
    if (Number.isFinite(Number(source.min_interval_ms))) output.min_interval_ms = Math.max(0, Number(source.min_interval_ms || 0));
    if (Number.isFinite(Number(source.dispatched_at))) output.last_provider_request_at = Number(source.dispatched_at);
    if (Number.isFinite(Number(source.next_allowed_at))) output.next_allowed_at = Number(source.next_allowed_at);
    if (retryAfter) output.retry_after = String(retryAfter).slice(0, 160);
    output.automatic_retry = false;
    return Object.keys(output).length > 1 ? Object.freeze(output) : null;
  }

  function createOzonProvider({
    contract = globalThis.OzonContract,
    fetchImpl = globalThis.fetch,
    uuid = () => globalThis.crypto.randomUUID(),
    now = () => Date.now()
  } = {}) {
    let performanceToken = null;

    const reportFileRefs = new Map();
    const REPORT_FILE_REF_TTL_MS = 30 * 60 * 1000;
    const REPORT_FILE_REF_MAX = 128;

    function pruneReportFileRefs() {
      const current = Number(now());
      for (const [ref, record] of reportFileRefs.entries()) {
        if (!record || current - Number(record.created_at_ms || 0) > REPORT_FILE_REF_TTL_MS) reportFileRefs.delete(ref);
      }
      while (reportFileRefs.size > REPORT_FILE_REF_MAX) reportFileRefs.delete(reportFileRefs.keys().next().value);
    }

    function registerReportFile(rawUrl) {
      const trustedUrl = globalThis.ProviderTransportCore.normalizeTrustedReportFileUrl(rawUrl);
      pruneReportFileRefs();
      const token = String(uuid()).replace(/[^A-Za-z0-9_-]/g, "");
      const ref = `rpf_${token}`;
      reportFileRefs.set(ref, Object.freeze({ url: trustedUrl, created_at_ms: Number(now()) }));
      pruneReportFileRefs();
      return ref;
    }

    function resolveReportFileRef(ref) {
      pruneReportFileRefs();
      const record = reportFileRefs.get(String(ref || ""));
      if (!record) {
        const error = new Error("Report file ref неизвестен или истёк. Повторите report_info отдельной командой.");
        error.code = "REPORT_FILE_REF_NOT_FOUND";
        error.external_request_executed = false;
        throw error;
      }
      return record;
    }

    async function executeReportFileCommand(command) {
      const record = resolveReportFileRef(command.params.file_ref);
      if (record.inline_base64) {
        const started = Number(now());
        const bytes = globalThis.ProviderTransportCore.reportBase64ToBytes(record.inline_base64);
        const parsedDocument = await globalThis.ProviderTransportCore.parseAiReadableReportBytes(bytes, { contentType: record.content_type || "application/pdf", pathname: "/inline-document.pdf", sheet: command.params.sheet ?? null, offset: Number(command.params.offset || 0), limit: Number(command.params.limit || 200) });
        const response = Object.freeze({ httpStatus: 200, ok: true, rawText: "", parsed: Object.freeze({ content_type: record.content_type || "application/pdf", byte_length: bytes.byteLength, ...parsedDocument }), byteLength: bytes.byteLength, elapsedMs: Math.max(0, Number(now()) - started), responseMeta: Object.freeze({ content_type: record.content_type || "application/pdf", content_length: String(bytes.byteLength), request_id: null, retry_after: null }) });
        const request = Object.freeze({ method: "GET", host_alias: "report_file", path: "/__opaque_inline_document__", operation: "report_file_get", response_style: "binary", response_content_types: null, external_request_executed: false });
        return { request, response, auth_request_performed: false };
      }
      const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now, parseOptions: command.params });
      const request = Object.freeze({ method: "GET", host_alias: "report_file", path: "/__opaque_report_file__", operation: "report_file_get", response_style: "binary", response_content_types: null, external_request_executed: true });
      return { request, response, auth_request_performed: false };
    }



    const GENERATED_DOCUMENT_URL_FIELD_BY_OPERATION = Object.freeze({
      cargoes_label_get: "file_url",
      cargoes_label_transport_by_order_status: "file_url",
      cargoes_label_transport_status: "file_url",
      fbp_act_from_get: "cdn_url",
      fbp_act_to_get: "label_url",
      fbp_label_get: "label_url",
      posting_fbs_package_label_get_v1: "file_url"
    });
    const DIRECT_PDF_OPERATIONS = new Set(["posting_fbs_act_container_labels", "posting_fbs_package_label"]);

    function registerInlineGeneratedDocument(binaryPayload) {
      const contentType = String(binaryPayload?.content_type || "application/octet-stream").toLowerCase();
      const base64 = String(binaryPayload?.file_content_base64 || "");
      if (!base64 || contentType !== "application/pdf") return null;
      pruneReportFileRefs();
      const token = String(uuid()).replace(/[^A-Za-z0-9_-]/g, "");
      const ref = `rpf_${token}`;
      reportFileRefs.set(ref, Object.freeze({ inline_base64: base64, content_type: contentType, byte_length: Number(binaryPayload?.byte_length || 0), created_at_ms: Number(now()) }));
      pruneReportFileRefs();
      return ref;
    }

    function clearPerformanceToken() {
      performanceToken = null;
    }

    async function getPerformanceToken(rawPerformanceCredentials, { force = false } = {}) {
      const credentials = globalThis.OzonCredentials.normalizePerformanceCredentials(rawPerformanceCredentials, { required: true });
      const current = Number(now());
      if (!force && performanceToken?.access_token && current < Number(performanceToken.expires_at_ms || 0) - 30_000) {
        return Object.freeze({ access_token: performanceToken.access_token, expires_at_ms: performanceToken.expires_at_ms, auth_request_performed: false, http_status: 0 });
      }

      const tokenRequest = globalThis.OzonCredentials.performanceTokenRequest(credentials);
      const response = await globalThis.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl, request: tokenRequest, now });
      if (!response.ok) {
        clearPerformanceToken();
        const error = new Error(`Ozon Performance auth отклонён: HTTP ${response.httpStatus}.`);
        error.code = "PERFORMANCE_AUTH_FAILED";
        error.http_status = response.httpStatus;
        throw error;
      }
      const payload = response.parsed && typeof response.parsed === "object" ? response.parsed : {};
      const accessToken = String(payload.access_token || "").trim();
      const tokenType = String(payload.token_type || "Bearer").trim();
      const expiresIn = Number(payload.expires_in || 0);
      if (!accessToken || !/^Bearer$/i.test(tokenType) || !Number.isFinite(expiresIn) || expiresIn <= 0) {
        clearPerformanceToken();
        const error = new Error("Ozon Performance auth вернул некорректный token response.");
        error.code = "INVALID_PERFORMANCE_TOKEN_RESPONSE";
        error.http_status = response.httpStatus;
        throw error;
      }
      performanceToken = Object.freeze({
        access_token: accessToken,
        expires_at_ms: current + Math.max(1, Math.floor(expiresIn)) * 1000
      });
      return Object.freeze({ access_token: accessToken, expires_at_ms: performanceToken.expires_at_ms, auth_request_performed: true, http_status: response.httpStatus });
    }

    async function executeSellerCommand(command, rawCredentials) {
      const credentials = globalThis.OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
      const request = contract.buildRequest(command, globalThis.OzonCredentials.sellerHeaders(credentials));
      const response = await globalThis.ProviderTransportCore.executeJsonOnce({ fetchImpl, request, now });
      return { request, response, auth_request_performed: false };
    }

    async function resolveSellerCapability(rawCredentials) {
      try {
        const credentials = globalThis.OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
        const request = Object.freeze({
          url: `${contract.SELLER_API_BASE}/v1/seller/info`,
          method: "POST",
          headers: globalThis.OzonCredentials.sellerHeaders(credentials),
          body: undefined,
          operation: "__seller_capability_probe__",
          path: "/v1/seller/info",
          host_alias: "seller_api"
        });
        const response = await globalThis.ProviderTransportCore.executeJsonOnce({ fetchImpl, request, now });
        if (!response.ok) {
          const safeError = contract.safeErrorPayload(response.httpStatus, response.rawText, response.parsed);
          return Object.freeze({
            status: "unknown",
            subscription_type: "UNKNOWN",
            is_premium: null,
            probe_performed: true,
            probe_http_status: response.httpStatus,
            probe_error_code: safeError.code || "SELLER_CAPABILITY_PROBE_HTTP_ERROR"
          });
        }
        const payload = response.parsed && typeof response.parsed === "object" ? response.parsed : {};
        const subscription = payload.subscription && typeof payload.subscription === "object" && !Array.isArray(payload.subscription) ? payload.subscription : {};
        const rawType = String(subscription.type || "UNKNOWN").trim().toUpperCase();
        const allowedTypes = Array.isArray(contract.SELLER_SUBSCRIPTION_TYPES) ? contract.SELLER_SUBSCRIPTION_TYPES : [];
        const subscriptionType = allowedTypes.includes(rawType) ? rawType : "UNKNOWN";
        const known = subscriptionType !== "UNKNOWN";
        return Object.freeze({
          status: known ? "known" : "unknown",
          subscription_type: subscriptionType,
          is_premium: typeof subscription.is_premium === "boolean" ? subscription.is_premium : null,
          probe_performed: true,
          probe_http_status: response.httpStatus,
          probe_error_code: known ? null : "SELLER_CAPABILITY_SUBSCRIPTION_UNKNOWN"
        });
      } catch (error) {
        return Object.freeze({
          status: "unknown",
          subscription_type: "UNKNOWN",
          is_premium: null,
          probe_performed: true,
          probe_http_status: Number(error?.http_status || 0),
          probe_error_code: String(error?.code || "SELLER_CAPABILITY_PROBE_FAILED").slice(0, 160)
        });
      }
    }

    async function executePerformanceCommand(command, rawPerformanceCredentials) {
      const token = await getPerformanceToken(rawPerformanceCredentials);
      const request = contract.buildPerformanceRequest(command, globalThis.OzonCredentials.performanceBearerHeaders(token.access_token));
      const response = await globalThis.ProviderTransportCore.executePerformanceJsonOnce({ fetchImpl, request, now });
      if (response.httpStatus === 401) clearPerformanceToken();
      return { request, response, auth_request_performed: token.auth_request_performed === true };
    }

    async function executeCommandObject(commandInput, rawCredentials, rawPerformanceCredentials = {}, { reportCommand = null, planning = null, quota = null, onProviderResponse = null } = {}) {
      const command = contract.normalizeCommand(commandInput);
      const logicalCommand = reportCommand ? contract.normalizeCommand(reportCommand) : command;
      if (logicalCommand.operation !== command.operation) {
        const error = new Error("Logical и physical operation должны совпадать.");
        error.code = "PLANNED_OPERATION_MISMATCH";
        throw error;
      }
      const preflight = contract.preflightExecution(command);
      const provider = String(preflight.meta.provider || "seller_api");
      const execution = provider === "report_file"
        ? await executeReportFileCommand(command)
        : (provider === "performance_api"
          ? await executePerformanceCommand(command, rawPerformanceCredentials)
          : await executeSellerCommand(command, rawCredentials));
      const { request, response } = execution;
      let effectiveQuota = quota;
      if (typeof onProviderResponse === "function") {
        try { effectiveQuota = await onProviderResponse({ command, request, response, quota }) || quota; }
        catch (hookError) {
          hookError.code = hookError.code || "PROVIDER_QUOTA_RESPONSE_HOOK_FAILED";
          hookError.http_status = Number(response.httpStatus || 0);
          hookError.external_request_executed = true;
          hookError.response_meta = response.responseMeta;
          throw hookError;
        }
      }
      const requestId = String(uuid());
      const errorPayload = response.ok ? null : contract.safeErrorPayload(response.httpStatus, response.rawText, response.parsed);
      let result;
      if (response.ok) {
        try { contract.verifyProviderResponse(command, response.parsed ?? response.rawText); }
        catch (verificationError) {
          verificationError.code = verificationError.code || "PROVIDER_RESPONSE_CONTRACT_MISMATCH";
          verificationError.http_status = Number(response.httpStatus || 0);
          verificationError.external_request_executed = true;
          verificationError.response_meta = response.responseMeta;
          verificationError.rate_limit = safeQuotaRateMeta(effectiveQuota, response.responseMeta.retry_after);
          throw verificationError;
        }

        result = contract.sanitizeResult(command, response.parsed ?? response.rawText);
        if (command.operation === "report_info") {
          const rawFile = findFirstField(response.parsed, "file");
          if (typeof rawFile === "string" && rawFile.trim()) {
            const fileRef = registerReportFile(rawFile.trim());
            result = Object.freeze({ ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }), report_file_ref: fileRef });
          }
        }

        const generatedUrlField = GENERATED_DOCUMENT_URL_FIELD_BY_OPERATION[command.operation];
        if (generatedUrlField) {
          const rawGeneratedUrl = findFirstField(response.parsed, generatedUrlField);
          if (typeof rawGeneratedUrl === "string" && rawGeneratedUrl.trim()) {
            const generatedRef = registerReportFile(rawGeneratedUrl.trim());
            result = Object.freeze({ ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }), generated_file_ref: generatedRef });
          }
        }
        if (DIRECT_PDF_OPERATIONS.has(command.operation)) {
          const generatedRef = registerInlineGeneratedDocument(response.parsed);
          if (generatedRef) {
            const safe = result && typeof result === "object" && !Array.isArray(result) ? { ...result } : { result };
            delete safe.file_content_base64;
            safe.generated_file_ref = generatedRef;
            safe.format = "pdf";
            result = Object.freeze(safe);
          }
        }
      } else {
        result = { error: errorPayload };
      }
      const safePlanning = planning ? {
        ...planning,
        execution: {
          logical_command_fingerprint: contract.commandFingerprint(logicalCommand),
          physical_command_fingerprint: contract.commandFingerprint(command),
          command_transformed: contract.commandFingerprint(logicalCommand) !== contract.commandFingerprint(command)
        }
      } : null;
      const reportText = contract.formatResultReport({
        requestId,
        command: logicalCommand,
        requestMeta: {
          host_alias: request.host_alias,
          http_method: request.method,
          path_alias: logicalCommand.operation,
          external_request_executed: request.external_request_executed !== false,
          capability_probe_executed: planning?.capability?.probe_performed === true,
          capability_probe_http_status: Number(planning?.capability?.probe_http_status || 0)
        },
        httpStatus: response.httpStatus,
        result,
        elapsedMs: response.elapsedMs,
        pagination: null,
        rateLimit: safeQuotaRateMeta(effectiveQuota, response.responseMeta.retry_after),
        planning: safePlanning
      });
      return Object.freeze({
        ok: response.ok,
        request_id: requestId,
        operation: logicalCommand.operation,
        provider: request.host_alias,
        command_fingerprint: contract.commandFingerprint(logicalCommand),
        executed_command_fingerprint: contract.commandFingerprint(command),
        http_status: response.httpStatus,
        report_text: reportText,
        response_meta: response.responseMeta,
        result,
        elapsed_ms: Number(response.elapsedMs || 0),
        rate_limit: safeQuotaRateMeta(effectiveQuota, response.responseMeta.retry_after),
        auth_request_performed: execution.auth_request_performed === true
      });
    }

    async function executeCommand(commandText, rawCredentials, rawPerformanceCredentials = {}) {
      const command = contract.parseCommand(commandText);
      return executeCommandObject(command, rawCredentials, rawPerformanceCredentials);
    }

    async function testConnection(rawCredentials, probeCommandText = null) {
      const credentials = globalThis.OzonCredentials.normalizeSellerCredentials(rawCredentials, { required: true });
      if (probeCommandText) return executeCommand(probeCommandText, rawCredentials, {});
      const command = { operation: "roles", params: {} };
      const request = contract.buildRequest(command, globalThis.OzonCredentials.sellerHeaders(credentials));
      const response = await globalThis.ProviderTransportCore.executeJsonOnce({ fetchImpl, request, now });
      if (!response.ok) {
        const error = contract.safeErrorPayload(response.httpStatus, response.rawText, response.parsed);
        return Object.freeze({
          ok: false,
          code: error.code || "OZON_API_ERROR",
          message: `Ozon Seller API отклонил /v1/roles: HTTP ${response.httpStatus}.`,
          http_status: response.httpStatus,
          elapsed_ms: response.elapsedMs,
          response_meta: response.responseMeta
        });
      }
      const payload = response.parsed && typeof response.parsed === "object" ? response.parsed : {};
      const expiresAt = findFirstField(payload, "expires_at");
      const rolesCount = arrayCountForField(payload, "roles");
      const methodsCount = arrayCountForField(payload, "methods");
      return Object.freeze({
        ok: true,
        code: "CONNECTED",
        message: "Ozon Seller API доступен; credentials приняты методом /v1/roles.",
        http_status: response.httpStatus,
        elapsed_ms: response.elapsedMs,
        expires_at: typeof expiresAt === "string" ? expiresAt : null,
        roles_count: Number.isInteger(rolesCount) ? rolesCount : null,
        methods_count: Number.isInteger(methodsCount) ? methodsCount : null,
        response_meta: response.responseMeta
      });
    }

    async function testPerformanceConnection(rawPerformanceCredentials) {
      try {
        const token = await getPerformanceToken(rawPerformanceCredentials, { force: true });
        return Object.freeze({
          ok: true,
          code: "PERFORMANCE_CONNECTED",
          message: "Ozon Performance API credentials приняты сервисом авторизации. У Performance API нет аналога Seller /v1/roles в официальном OpenAPI.",
          http_status: Number(token.http_status || 200),
          token_expires_at_ms: token.expires_at_ms,
          auth_request_performed: true
        });
      } catch (error) {
        return Object.freeze({
          ok: false,
          code: String(error?.code || "PERFORMANCE_CONNECTION_TEST_FAILED"),
          message: String(error?.message || error || "Ozon Performance API auth failed"),
          http_status: Number(error?.http_status || 0),
          auth_request_performed: true
        });
      }
    }

    return Object.freeze({ executeCommand, executeCommandObject, resolveSellerCapability, testConnection, testPerformanceConnection, clearPerformanceToken });
  }

  const OzonProvider = createOzonProvider();
  globalThis.OzonProvider = OzonProvider;
  globalThis.OzonProviderFactory = Object.freeze({ createOzonProvider });
})();

/* END shared/ozon_provider.js */

/* BEGIN Step 7 MCP stdio shell */
const readline = require('node:readline');
let personalDataEnabled = process.env.STEP7_PERSONAL_DATA_ENABLED === '1';

function authorizationGranted(args) {
  if (personalDataEnabled) return true;
  const candidates = [
    args?.authorization,
    args?.personal_data_authorization,
    args?.consent,
    args?.privacy_authorization,
    args?.personal_data_consent,
    args?.input?.authorization,
    args?.input?.personal_data_authorization,
    args?.input?.consent,
    args?.input?.privacy_authorization,
    args?.input?.personal_data_consent,
  ];
  for (const value of candidates) {
    if (value === true || value === 'granted' || value === 'authorized' || value === 'allow') return true;
    if (value && typeof value === 'object') {
      const allowed = value.granted === true || value.authorized === true || value.allow === true ||
        value.approved === true || value.decision === 'allow' ||
        value.personal_data === true || value.personal_data_read === true;
      const scope = value.scope;
      const scopes = Array.isArray(value.scopes) ? value.scopes : [];
      const scoped = scope === 'personal_data' || scope === 'personal_data_read' ||
        scope === 'personal_data.read' || scopes.includes('personal_data') ||
        scopes.includes('personal_data_read') || scopes.includes('personal_data.read');
      if (allowed || scoped) return true;
    }
  }
  return false;
}

function send(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

function toolResult(payload, isError = false) {
  return {isError, content: [{type: 'text', text: JSON.stringify(payload)}]};
}

async function handle(message) {
  const id = message.id;
  const method = message.method;
  if (method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {tools: {}},
        serverInfo: {name: 'ozon-seller-mcp', version: '0.1.19-step7'},
      },
    });
    return;
  }
  if (method === 'notifications/initialized') return;
  if (method === 'tools/list') {
    send({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [{
          name: 'ozon',
          description: 'Ozon Seller read-only bridge',
          inputSchema: {
            type: 'object',
            properties: {
              operation: {type: 'string'},
              input: {type: 'object'},
              authorization: {},
            },
            required: ['operation'],
          },
        }],
      },
    });
    return;
  }
  if (method === 'ozon/settings/set-personal-data') {
    personalDataEnabled = message.params?.enabled === true;
    if (id !== undefined) {
      send({jsonrpc: '2.0', id, result: {enabled: personalDataEnabled, replayed_command_count: 0}});
    }
    return;
  }
  if (method !== 'tools/call') {
    if (id !== undefined) send({jsonrpc: '2.0', id, error: {code: -32601, message: 'Method not found'}});
    return;
  }
  const args = message.params?.arguments || {};
  const operation = String(args.operation || '');
  const meta = globalThis.OzonOperationRegistry.operation(operation);
  if (!meta) {
    send({jsonrpc: '2.0', id, result: toolResult({
      ok: false,
      code: 'UNSUPPORTED_OPERATION',
      operation,
      external_request_executed: false,
      physical_business_request_count: 0,
      attempt_count: 0,
    }, true)});
    return;
  }
  if (meta.policy_group === 'personal_data_read' && !authorizationGranted(args)) {
    send({jsonrpc: '2.0', id, result: toolResult({
      ok: false,
      code: 'OPERATION_DISABLED_BY_USER',
      message: 'Personal Data authorization is required; enable the existing personal_data_read policy and explicitly resubmit.',
      policy: 'personal_data_setting_required',
      operation,
      external_request_executed: false,
      physical_business_request_count: 0,
      attempt_count: 0,
    }, true)});
    return;
  }
  try {
    const command = {operation, params: args.input && typeof args.input === 'object' ? args.input : {}};
    const response = await globalThis.OzonProvider.executeCommandObject(
      command,
      {clientId: process.env.OZON_CLIENT_ID || '', apiKey: process.env.OZON_API_KEY || ''},
      {}
    );
    send({jsonrpc: '2.0', id, result: toolResult({
      ok: response.ok === true,
      operation,
      provider: response.provider,
      http_status: response.http_status,
      external_request_executed: true,
      physical_business_request_count: 1,
      attempt_count: 1,
      result: response.result,
    }, response.ok !== true)});
  } catch (error) {
    send({jsonrpc: '2.0', id, result: toolResult({
      ok: false,
      operation,
      code: String(error?.code || 'STEP7_MCP_EXECUTION_FAILED'),
      message: String(error?.message || error),
      external_request_executed: Boolean(error?.external_request_executed),
      physical_business_request_count: error?.external_request_executed ? 1 : 0,
      attempt_count: error?.external_request_executed ? 1 : 0,
    }, true)});
  }
}

const rl = readline.createInterface({input: process.stdin, crlfDelay: Infinity});
rl.on('line', line => {
  let message;
  try { message = JSON.parse(line); }
  catch {
    send({jsonrpc: '2.0', id: null, error: {code: -32700, message: 'Parse error'}});
    return;
  }
  Promise.resolve(handle(message)).catch(error => {
    if (message.id !== undefined) send({jsonrpc: '2.0', id: message.id, error: {code: -32603, message: String(error)}});
  });
});
/* END Step 7 MCP stdio shell */
