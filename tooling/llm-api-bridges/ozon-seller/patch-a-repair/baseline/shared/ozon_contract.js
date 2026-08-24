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
  const ANALYTICS_FULL_TIERS = deepFreeze(["PREMIUM_PLUS", "PREMIUM_PRO"]);
  const PRODUCT_QUERIES_FULL_TIERS = deepFreeze(["PREMIUM", "PREMIUM_PLUS", "PREMIUM_PRO"]);
  const PRODUCT_QUERY_SORT_BY = deepFreeze(["BY_SEARCHES", "BY_VIEWS", "BY_POSITION", "BY_CONVERSION", "BY_GMV"]);
  const PRODUCT_QUERY_SORT_DIR = deepFreeze(["DESCENDING", "ASCENDING"]);
  const PRODUCT_QUERY_DETAILS_RESTRICTED_SORT = deepFreeze(["BY_VIEWS", "BY_POSITION", "BY_CONVERSION"]);
  const PRODUCT_QUERY_DETAILS_RESTRICTED_SORT_TIERS = deepFreeze(["PREMIUM", "PREMIUM_PLUS"]);
  const FILTER_OPS = deepFreeze(["EQ", "GT", "GTE", "LT", "LTE"]);

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
    return false;
  }

  function shouldRedactResultField(operation, fieldPath, key) {
    if (operation === "posting_fbo_list") {
      if (/^postings\[\]\.legal_info(?:\.|$)/.test(fieldPath)) return true;
      if (/^postings\[\]\.products\[\]\.digital_codes$/.test(fieldPath)) return true;
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

  function validateSkuArray(value, path, maximum) {
    const array = assertMaxItems(value, path, maximum);
    for (let index = 0; index < array.length; index += 1) requireInt64String(array[index], `${path}[${index}]`);
    return array;
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

  function normalizeSupplyOrderGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertMaxItems(requireField(normalized, "order_ids"), "params.order_ids", 50);
    return normalized;
  }

  function normalizeSupplyOrderDetailsParams(params) {
    const normalized = requirePlainObject(params, "params");
    requireInteger(requireField(normalized, "order_id"), "params.order_id");
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

  function safeReadResult(rawResult, context = {}) {
    return redactSensitiveResult(rawResult, context);
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

  function analyticsRestrictedDependencies(params) {
    const metrics = Array.isArray(params.metrics) ? params.metrics : [];
    const dimensions = Array.isArray(params.dimension) ? params.dimension : [];
    const sort = Array.isArray(params.sort) ? params.sort : [];
    const filters = Array.isArray(params.filters) ? params.filters : [];
    return {
      restricted_metrics: metrics.filter((metric) => ANALYTICS_RESTRICTED_METRICS.includes(metric)),
      restricted_dimensions: dimensions.filter((dimension) => ANALYTICS_RESTRICTED_DIMENSIONS.includes(dimension)),
      restricted_sort_keys: sort.map((item) => item?.key).filter((key) => ANALYTICS_RESTRICTED_METRICS.includes(key)),
      restricted_filter_keys: filters.map((item) => item?.key).filter((key) => ANALYTICS_RESTRICTED_METRICS.includes(key) || ANALYTICS_RESTRICTED_DIMENSIONS.includes(key))
    };
  }

  function isOlderThanMonths(value, atMs, months) {
    const parsed = parseKnownDate(value);
    const boundary = shiftUtcMonths(atMs, -Math.abs(Number(months || 0)));
    return parsed !== null && boundary !== null && parsed < boundary;
  }



  function validateOperationMeta(name, meta) {
    if (!/^[a-z][a-z0-9_]{0,119}$/.test(String(name))) fail("INVALID_REGISTRY_OPERATION", `Некорректный operation alias: ${name}`);
    if (!meta || typeof meta !== "object") fail("INVALID_REGISTRY_META", `${name}: operation metadata отсутствует.`);
    if (!/^(GET|POST)$/.test(String(meta.method))) fail("INVALID_REGISTRY_METHOD", `${name}: неподдерживаемый HTTP method.`);
    if (!/^\/[^?#]*$/.test(String(meta.path)) || String(meta.path).includes("..")) fail("INVALID_REGISTRY_PATH", `${name}: небезопасный fixed path.`);
    const provider = String(meta.provider || "seller_api");
    if (!["seller_api", "performance_api"].includes(provider)) fail("INVALID_REGISTRY_PROVIDER", `${name}: неизвестный provider.`);
    if (provider === "performance_api") assertPerformanceMutationBlocked(meta.method, meta.path);
    if (meta.effect !== "READ") return;
    if (meta.execution_enabled === true) {
      if (typeof meta.normalizeParams !== "function") fail("PARAM_SCHEMA_NOT_READY", `${name}: нет request normalizer.`);
      if (typeof meta.sanitizeResult !== "function") fail("RESULT_POLICY_NOT_READY", `${name}: нет result/PII policy.`);
      if (meta.method === "GET" && meta.request_style !== "query") fail("REQUEST_STYLE_NOT_READY", `${name}: GET требует query builder.`);
      if (meta.method === "POST" && meta.request_style !== "json_body") fail("REQUEST_STYLE_NOT_READY", `${name}: POST требует JSON-body.`);
    }
  }

  const OPERATIONS = deepFreeze({
    roles: { method: "POST", path: "/v1/roles", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "current_key_info", normalizeParams: normalizeEmptyParams, sanitizeResult: safeReadResult },
    stocks_current: { method: "POST", path: "/v4/product/info/stocks", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizeStocksCurrentParams, sanitizeResult: safeReadResult },
    analytics_data: { method: "POST", path: "/v1/analytics/data", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizeAnalyticsDataParams, sanitizeResult: safeReadResult },
    product_queries: { method: "POST", path: "/v1/analytics/product-queries", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizeProductQueriesParams, sanitizeResult: safeReadResult },
    product_queries_details: { method: "POST", path: "/v1/analytics/product-queries/details", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizeProductQueriesDetailsParams, sanitizeResult: safeReadResult },
    posting_fbo_list: { method: "POST", path: "/v3/posting/fbo/list", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizePostingFboListParams, sanitizeResult: safeReadResult },
    posting_fbs_get: { method: "POST", path: "/v3/posting/fbs/get", effect: "READ", request_style: "json_body", execution_enabled: false, contract_state: "blocked_customer_pii_surface" },
    supply_order_get: { method: "POST", path: "/v3/supply-order/get", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizeSupplyOrderGetParams, sanitizeResult: safeReadResult },
    supply_order_details: { method: "POST", path: "/v1/supply-order/details", effect: "READ", request_style: "json_body", execution_enabled: true, contract_state: "official_limits_v2_1", normalizeParams: normalizeSupplyOrderDetailsParams, sanitizeResult: safeReadResult },

    performance_campaigns: { provider: "performance_api", method: "GET", path: "/api/client/campaign", effect: "READ", request_style: "query", execution_enabled: true, contract_state: "official_performance_openapi_v2_0", normalizeParams: normalizePerformanceCampaignsParams, sanitizeResult: safeReadResult },
    performance_expense: { provider: "performance_api", method: "GET", path: "/api/client/statistics/expense/json", effect: "READ", request_style: "query", execution_enabled: true, contract_state: "official_performance_openapi_v2_0_json_suffix", normalizeParams: normalizePerformanceDateRangeParams, sanitizeResult: safeReadResult },
    performance_daily: { provider: "performance_api", method: "GET", path: "/api/client/statistics/daily/json", effect: "READ", request_style: "query", execution_enabled: true, contract_state: "official_performance_openapi_v2_0_json_suffix", normalizeParams: normalizePerformanceDateRangeParams, sanitizeResult: safeReadResult },
    performance_campaign_product: { provider: "performance_api", method: "GET", path: "/api/client/statistics/campaign/product/json", effect: "READ", request_style: "query", execution_enabled: true, contract_state: "official_performance_openapi_v2_0_json_suffix", normalizeParams: normalizePerformanceCampaignProductParams, sanitizeResult: safeReadResult }
  });

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

    function sellerCapabilityRequirement(command, atMs = Date.now()) {
      const normalized = normalizeCommand(command);
      const preflight = resolveOperation(normalized.operation);
      if (String(preflight.meta.provider || "seller_api") !== "seller_api") return deepFreeze({ required: false, reasons: [] });
      if (normalized.operation === "analytics_data") {
        const dependencies = analyticsRestrictedDependencies(normalized.params);
        const reasons = [];
        if (dependencies.restricted_metrics.length) reasons.push("restricted_metrics");
        if (dependencies.restricted_dimensions.length) reasons.push("restricted_dimensions");
        if (dependencies.restricted_sort_keys.length) reasons.push("restricted_sort");
        if (dependencies.restricted_filter_keys.length) reasons.push("restricted_filter");
        if (isOlderThanMonths(normalized.params.date_from, atMs, 3)) reasons.push("history_over_3_months");
        return deepFreeze({ required: reasons.length > 0, reasons });
      }
      if (normalized.operation === "product_queries" || normalized.operation === "product_queries_details") {
        return deepFreeze({ required: true, reasons: ["subscription_affects_response_scope"] });
      }
      return deepFreeze({ required: false, reasons: [] });
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

    function planAnalyticsDataForCapability(command, profile, atMs) {
      const normalized = normalizeCommand(command);
      const capability = normalizeCapabilityProfile(profile);
      const dependencies = analyticsRestrictedDependencies(normalized.params);
      const historyRestricted = isOlderThanMonths(normalized.params.date_from, atMs, 3);
      const needsCapability = dependencies.restricted_metrics.length || dependencies.restricted_dimensions.length || dependencies.restricted_sort_keys.length || dependencies.restricted_filter_keys.length || historyRestricted;
      if (!needsCapability) {
        return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {
          status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: false, reason: "universal_analytics_scope"
        });
      }

      const fullAnalytics = capability.status === "known" && ANALYTICS_FULL_TIERS.includes(capability.subscription_type);
      const unknown = capability.status !== "known";
      if (fullAnalytics) {
        return planningExecute(normalized, normalized, capability, {
          status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: true, reason: "premium_plus_or_pro"
        });
      }

      const unavailableStatus = unknown ? "ENTITLEMENT_UNKNOWN" : "SUPPORTED_BUT_NOT_ENTITLED";
      const unavailableCode = unknown ? "ENTITLEMENT_UNKNOWN" : "SUBSCRIPTION_REQUIRED";
      const unavailableMessage = unknown
        ? "Не удалось подтвердить подписку продавца для ограниченных analytics_data параметров; restricted часть запроса не отправлена в Ozon."
        : "Запрошенные analytics_data параметры требуют Ozon Premium Plus или Premium Pro.";

      if (historyRestricted) {
        return planningReject(normalized, capability, { code: unavailableCode, message: unavailableMessage, entitlementStatus: unavailableStatus, reason: "history_over_3_months", extra: { required_tiers: [...ANALYTICS_FULL_TIERS] } });
      }
      if (dependencies.restricted_dimensions.length) {
        return planningReject(normalized, capability, { code: unavailableCode, message: unavailableMessage, entitlementStatus: unavailableStatus, reason: "restricted_dimension_changes_grain", extra: { unavailable_dimensions: [...dependencies.restricted_dimensions], required_tiers: [...ANALYTICS_FULL_TIERS] } });
      }
      if (dependencies.restricted_sort_keys.length) {
        return planningReject(normalized, capability, { code: unavailableCode, message: unavailableMessage, entitlementStatus: unavailableStatus, reason: "restricted_sort_changes_result_set", extra: { unavailable_sort_keys: [...dependencies.restricted_sort_keys], required_tiers: [...ANALYTICS_FULL_TIERS] } });
      }
      if (dependencies.restricted_filter_keys.length) {
        return planningReject(normalized, capability, { code: unavailableCode, message: unavailableMessage, entitlementStatus: unavailableStatus, reason: "restricted_filter_changes_result_set", extra: { unavailable_filter_keys: [...dependencies.restricted_filter_keys], required_tiers: [...ANALYTICS_FULL_TIERS] } });
      }

      const allowedMetrics = normalized.params.metrics.filter((metric) => ANALYTICS_UNIVERSAL_METRICS.includes(metric));
      if (dependencies.restricted_metrics.length && !allowedMetrics.length) {
        return planningReject(normalized, capability, { code: unavailableCode, message: unavailableMessage, entitlementStatus: unavailableStatus, reason: "all_requested_metrics_unavailable", extra: { unavailable_metrics: [...dependencies.restricted_metrics], required_tiers: [...ANALYTICS_FULL_TIERS] } });
      }
      if (dependencies.restricted_metrics.length) {
        const params = sanitizeJsonValue(normalized.params, "planning.params", { rejectTransportKeys: false });
        params.metrics = allowedMetrics;
        const executionCommand = normalizeCommand({ operation: normalized.operation, params });
        return planningExecute(normalized, executionCommand, capability, {
          status: unavailableStatus,
          partial: true,
          capability_required: true,
          reason: unknown ? "restricted_metrics_entitlement_unknown" : "restricted_metrics_not_entitled",
          omitted_metrics: [...dependencies.restricted_metrics],
          executed_metrics: [...allowedMetrics],
          required_tiers: [...ANALYTICS_FULL_TIERS]
        });
      }
      return planningExecute(normalized, normalized, capability, {
        status: unavailableStatus, partial: false, capability_required: true, reason: "capability_checked"
      });
    }

    function planProductQueriesForCapability(command, profile, atMs) {
      const normalized = normalizeCommand(command);
      const capability = normalizeCapabilityProfile(profile);
      const fullEntitled = capability.status === "known" && PRODUCT_QUERIES_FULL_TIERS.includes(capability.subscription_type);
      const oldHistory = isOlderThanMonths(normalized.params.date_from, atMs, 1);
      if (oldHistory && !fullEntitled) {
        const unknown = capability.status !== "known";
        return planningReject(normalized, capability, {
          code: unknown ? "ENTITLEMENT_UNKNOWN" : "SUBSCRIPTION_REQUIRED",
          message: unknown ? "Не удалось подтвердить подписку для product_queries за период старше месяца; business request не отправлен." : "Product queries за даты старше месяца требуют Premium, Premium Plus или Premium Pro.",
          entitlementStatus: unknown ? "ENTITLEMENT_UNKNOWN" : "SUPPORTED_BUT_NOT_ENTITLED",
          reason: "history_over_1_month",
          extra: { required_tiers: [...PRODUCT_QUERIES_FULL_TIERS] }
        });
      }
      const scope = capability.status !== "known" ? "unknown" : (fullEntitled ? "full" : "partial_by_subscription");
      const status = capability.status !== "known" ? "ENTITLEMENT_UNKNOWN" : (fullEntitled ? "SUPPORTED_AND_ENTITLED" : "SUPPORTED_BUT_NOT_ENTITLED");
      return planningExecute(normalized, normalized, capability, {
        status,
        partial: scope !== "full",
        capability_required: true,
        reason: "product_queries_response_scope",
        provider_data_scope: scope,
        full_analytics_tiers: [...PRODUCT_QUERIES_FULL_TIERS]
      });
    }

    function planProductQueriesDetailsForCapability(command, profile, atMs) {
      const normalized = normalizeCommand(command);
      const capability = normalizeCapabilityProfile(profile);
      const fullEntitled = capability.status === "known" && PRODUCT_QUERIES_FULL_TIERS.includes(capability.subscription_type);
      const oldHistory = isOlderThanMonths(normalized.params.date_from, atMs, 1);
      if (oldHistory && !fullEntitled) {
        const unknown = capability.status !== "known";
        return planningReject(normalized, capability, {
          code: unknown ? "ENTITLEMENT_UNKNOWN" : "SUBSCRIPTION_REQUIRED",
          message: unknown ? "Не удалось подтвердить подписку для product_queries_details за период старше месяца; business request не отправлен." : "Product query details за даты старше месяца требуют Premium, Premium Plus или Premium Pro.",
          entitlementStatus: unknown ? "ENTITLEMENT_UNKNOWN" : "SUPPORTED_BUT_NOT_ENTITLED",
          reason: "history_over_1_month",
          extra: { required_tiers: [...PRODUCT_QUERIES_FULL_TIERS] }
        });
      }

      const sortBy = String(normalized.params.sort_by || "");
      if (PRODUCT_QUERY_DETAILS_RESTRICTED_SORT.includes(sortBy)) {
        if (capability.status !== "known") {
          return planningReject(normalized, capability, { code: "ENTITLEMENT_UNKNOWN", message: `Не удалось подтвердить entitlement для product_queries_details sort_by=${sortBy}.`, entitlementStatus: "ENTITLEMENT_UNKNOWN", reason: "restricted_sort_entitlement_unknown", extra: { sort_by: sortBy, documented_tiers: [...PRODUCT_QUERY_DETAILS_RESTRICTED_SORT_TIERS] } });
        }
        if (capability.subscription_type === "PREMIUM_PRO") {
          return planningReject(normalized, capability, { code: "ENTITLEMENT_UNKNOWN", message: `Официальный контракт неоднозначен для Premium Pro и product_queries_details sort_by=${sortBy}; bridge не будет угадывать entitlement.`, entitlementStatus: "ENTITLEMENT_UNKNOWN", reason: "premium_pro_sort_contract_ambiguous", extra: { sort_by: sortBy, documented_tiers: [...PRODUCT_QUERY_DETAILS_RESTRICTED_SORT_TIERS] } });
        }
        if (!PRODUCT_QUERY_DETAILS_RESTRICTED_SORT_TIERS.includes(capability.subscription_type)) {
          return planningReject(normalized, capability, { code: "SUBSCRIPTION_REQUIRED", message: `product_queries_details sort_by=${sortBy} требует Premium или Premium Plus по текущему контракту.`, entitlementStatus: "SUPPORTED_BUT_NOT_ENTITLED", reason: "restricted_sort_not_entitled", extra: { sort_by: sortBy, required_tiers: [...PRODUCT_QUERY_DETAILS_RESTRICTED_SORT_TIERS] } });
        }
      }

      const scope = capability.status !== "known" ? "unknown" : (fullEntitled ? "full" : "partial_by_subscription");
      const status = capability.status !== "known" ? "ENTITLEMENT_UNKNOWN" : (fullEntitled ? "SUPPORTED_AND_ENTITLED" : "SUPPORTED_BUT_NOT_ENTITLED");
      return planningExecute(normalized, normalized, capability, {
        status,
        partial: scope !== "full",
        capability_required: true,
        reason: "product_queries_details_response_scope",
        provider_data_scope: scope,
        full_analytics_tiers: [...PRODUCT_QUERIES_FULL_TIERS]
      });
    }

    function planCommandForSellerCapability(command, profile, atMs = Date.now()) {
      const normalized = normalizeCommand(command);
      if (normalized.operation === "analytics_data") return planAnalyticsDataForCapability(normalized, profile, atMs);
      if (normalized.operation === "product_queries") return planProductQueriesForCapability(normalized, profile, atMs);
      if (normalized.operation === "product_queries_details") return planProductQueriesDetailsForCapability(normalized, profile, atMs);
      return planningExecute(normalized, normalized, { status: "not_needed", subscription_type: "UNKNOWN", is_premium: null, probe_performed: false }, {
        status: "SUPPORTED_AND_ENTITLED", partial: false, capability_required: false, reason: "operation_not_subscription_sensitive"
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
        body: meta.method === "POST" ? JSON.stringify(preflight.command.params) : undefined,
        operation: preflight.command.operation,
        path: meta.path,
        host_alias: "seller_api"
      });
    }

    function buildPerformanceRequest(command, headers) {
      const preflight = preflightExecution(command);
      const { meta } = preflight;
      if (String(meta.provider || "seller_api") !== "performance_api") fail("WRONG_REQUEST_BUILDER", "Seller operation нельзя отправить через Performance request builder.");
      if (!/^https:\/\/api-performance\.ozon\.ru$/.test(performanceApiBase)) fail("INVALID_FIXED_HOST", "Performance API host не прошёл fixed-host guard.");
      assertPerformanceMutationBlocked(meta.method, meta.path);
      const query = meta.request_style === "query" ? encodeQueryParams(preflight.command.params) : "";
      const url = `${performanceApiBase}${meta.path}${query ? `?${query}` : ""}`;
      return deepFreeze({
        url,
        method: meta.method,
        headers: { ...headers },
        body: meta.method === "POST" ? JSON.stringify(preflight.command.params) : undefined,
        operation: preflight.command.operation,
        path: meta.path,
        host_alias: "performance_api"
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
      formatResultReport,
      formatPreExecutionErrorReport,
      isCommandText
    });
  }

  const OzonContract = createOzonContract();
  globalThis.OzonContract = OzonContract;
  globalThis.OzonContractFactory = Object.freeze({ createOzonContract, OPERATIONS, PERFORMANCE_MUTATION_BLOCKLIST });
})();
