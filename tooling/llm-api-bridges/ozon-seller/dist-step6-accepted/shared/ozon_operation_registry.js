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
        answers: "Ответы на вопросы."
      },
      clues: ["review", "question", "answer", "отзыв", "вопрос", "ответ"]
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
