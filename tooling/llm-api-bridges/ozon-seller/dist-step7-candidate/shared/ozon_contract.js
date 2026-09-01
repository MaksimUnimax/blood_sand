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

  function normalizeDescriptionCategoryDependentAttributesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["description_category_id", "type_id"]);
    requireSafeInt64Number(requireField(normalized, "description_category_id"), "params.description_category_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "type_id")) requireSafeInt64Number(normalized.type_id, "params.type_id");
    return normalized;
  }

  function normalizeDescriptionCategoryDependentAttributeValuesParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["parent_attribute_id", "child_attribute_id", "description_category_id", "type_id", "limit", "cursor"]);
    requireSafeInt64Number(requireField(normalized, "parent_attribute_id"), "params.parent_attribute_id");
    requireSafeInt64Number(requireField(normalized, "child_attribute_id"), "params.child_attribute_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "description_category_id")) requireSafeInt64Number(normalized.description_category_id, "params.description_category_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "type_id")) requireSafeInt64Number(normalized.type_id, "params.type_id");
    if (Object.prototype.hasOwnProperty.call(normalized, "limit")) requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 1000 });
    if (Object.prototype.hasOwnProperty.call(normalized, "cursor")) requireString(normalized.cursor, "params.cursor", { nonEmpty: false });
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

  const PERFORMANCE_CAMPAIGN_LOCAL_SORTS = deepFreeze([
    "created_at_desc", "created_at_asc", "updated_at_desc", "updated_at_asc", "from_date_desc", "from_date_asc"
  ]);

  function normalizePerformanceCampaignsParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["campaignIds", "advObjectType", "state", "page", "pageSize", "local_sort", "local_limit"]);
    if (Object.prototype.hasOwnProperty.call(normalized, "campaignIds")) validateOptionalCampaignIds(normalized.campaignIds, "params.campaignIds");
    if (Object.prototype.hasOwnProperty.call(normalized, "advObjectType")) {
      normalized.advObjectType = String(normalized.advObjectType ?? "").trim();
      if (!["SKU", "BANNER", "SEARCH_PROMO", "VIDEO_BANNER"].includes(normalized.advObjectType)) fail("INVALID_OPERATION_PARAMS", "params.advObjectType содержит неподдерживаемый тип кампании.");
    }
    if (Object.prototype.hasOwnProperty.call(normalized, "state")) {
      normalized.state = String(normalized.state ?? "").trim();
      if (!["CAMPAIGN_STATE_UNKNOWN", "CAMPAIGN_STATE_RUNNING", "CAMPAIGN_STATE_PLANNED", "CAMPAIGN_STATE_STOPPED", "CAMPAIGN_STATE_INACTIVE", "CAMPAIGN_STATE_ARCHIVED", "CAMPAIGN_STATE_MODERATION_DRAFT", "CAMPAIGN_STATE_MODERATION_IN_PROGRESS", "CAMPAIGN_STATE_MODERATION_FAILED", "CAMPAIGN_STATE_FINISHED"].includes(normalized.state)) fail("INVALID_OPERATION_PARAMS", "params.state содержит неподдерживаемое состояние кампании.");
    }
    const localSortPresent = Object.prototype.hasOwnProperty.call(normalized, "local_sort");
    if (localSortPresent) {
      normalized.local_sort = String(normalized.local_sort ?? "").trim();
      if (!PERFORMANCE_CAMPAIGN_LOCAL_SORTS.includes(normalized.local_sort)) fail("INVALID_OPERATION_PARAMS", "params.local_sort содержит неподдерживаемую локальную сортировку.");
      if (Object.prototype.hasOwnProperty.call(normalized, "page") || Object.prototype.hasOwnProperty.call(normalized, "pageSize")) {
        fail("INVALID_OPERATION_PARAMS", "params.local_sort нельзя совмещать с provider page/pageSize: глобальная локальная сортировка требует одного полного provider response.");
      }
      if (!Object.prototype.hasOwnProperty.call(normalized, "local_limit")) normalized.local_limit = 100;
      requireInteger(normalized.local_limit, "params.local_limit", { minimum: 1, maximum: 100 });
    } else {
      if (Object.prototype.hasOwnProperty.call(normalized, "local_limit")) fail("INVALID_OPERATION_PARAMS", "params.local_limit используется только вместе с params.local_sort.");
      if (!Object.prototype.hasOwnProperty.call(normalized, "page")) normalized.page = 1;
      if (!Object.prototype.hasOwnProperty.call(normalized, "pageSize")) normalized.pageSize = 100;
      requireInteger(normalized.page, "params.page", { minimum: 1 });
      requireInteger(normalized.pageSize, "params.pageSize", { minimum: 1, maximum: 100 });
    }
    return normalized;
  }

  function performanceCampaignSortSpec(value) {
    const map = {
      created_at_desc: { field: "createdAt", direction: "DESC" }, created_at_asc: { field: "createdAt", direction: "ASC" },
      updated_at_desc: { field: "updatedAt", direction: "DESC" }, updated_at_asc: { field: "updatedAt", direction: "ASC" },
      from_date_desc: { field: "fromDate", direction: "DESC" }, from_date_asc: { field: "fromDate", direction: "ASC" }
    };
    return map[String(value || "")] || null;
  }

  function performanceCampaignDateValue(item, field) {
    const raw = item && typeof item === "object" ? item[field] : null;
    if (typeof raw !== "string" || !raw.trim()) return Number.NEGATIVE_INFINITY;
    const parsed = Date.parse(field === "fromDate" && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw);
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  }

  function campaignRefinementChoices(params, sourceCount) {
    const filters = {};
    for (const key of ["campaignIds", "advObjectType", "state"]) if (Object.prototype.hasOwnProperty.call(params, key)) filters[key] = params[key];
    const choices = [];
    if (!params.local_sort) {
      const page = Number(params.page || 1), pageSize = Number(params.pageSize || 100);
      choices.push({
        id: "next_page", purpose: "Получить следующую явную страницу кампаний без hidden pagination.",
        command: { operation: "performance_campaigns", params: { ...filters, page: page + 1, pageSize } }
      });
    }
    choices.push(
      { id: "active_campaigns", purpose: "Только активные кампании.", command: { operation: "performance_campaigns", params: { ...filters, state: "CAMPAIGN_STATE_RUNNING", page: 1, pageSize: 100 } } },
      { id: "latest_created", purpose: "Самые новые по createdAt; один provider request, затем локальная сортировка Bridge.", command: { operation: "performance_campaigns", params: { ...filters, local_sort: "created_at_desc", local_limit: 100 } } },
      { id: "latest_updated", purpose: "Последние изменённые по updatedAt; один provider request, затем локальная сортировка Bridge.", command: { operation: "performance_campaigns", params: { ...filters, local_sort: "updated_at_desc", local_limit: 100 } } },
      { id: "specific_campaign_ids", purpose: "Только конкретные кампании.", template: { operation: "performance_campaigns", params: { campaignIds: ["CAMPAIGN_ID"], page: 1, pageSize: 100 } } },
      { id: "campaign_products", purpose: "Товары конкретной рекламной кампании.", template: { operation: "performance_campaign_products", params: { campaignId: "CAMPAIGN_ID", page: 1, pageSize: 100 } } },
      { id: "campaign_product_statistics", purpose: "Статистика кампаний в разрезе товаров за период.", template: { operation: "performance_campaign_product", params: { campaignIds: ["CAMPAIGN_ID"], dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD" } } },
      { id: "sku_statistics", purpose: "SKU-статистика по рекламным кампаниям за период.", template: { operation: "performance_sku_statistics", params: { campaignIds: ["CAMPAIGN_ID"], dateFrom: "YYYY-MM-DD", dateTo: "YYYY-MM-DD" } } }
    );
    return { source_count: Number(sourceCount || 0), choices };
  }

  function performanceCampaignsResult(rawResult, context = {}) {
    const source = rawResult && typeof rawResult === "object" && !Array.isArray(rawResult) ? rawResult : {};
    const originalList = Array.isArray(source.list) ? source.list : [];
    const params = context?.params && typeof context.params === "object" ? context.params : {};
    let list = [...originalList];
    const sort = performanceCampaignSortSpec(params.local_sort);
    if (sort) {
      const direction = sort.direction === "ASC" ? 1 : -1;
      list.sort((a, b) => direction * (performanceCampaignDateValue(a, sort.field) - performanceCampaignDateValue(b, sort.field)));
    }
    const limit = sort ? Number(params.local_limit || 100) : Math.min(Number(params.pageSize || 100), 100);
    const visible = list.slice(0, Math.max(1, limit));
    const refinements = campaignRefinementChoices(params, originalList.length);
    return safeReadResult({
      ...source,
      list: visible,
      bridge_view: {
        provider_items_received: originalList.length,
        items_returned_to_ai: visible.length,
        result_bounded: originalList.length > visible.length,
        provider_page: sort ? null : Number(params.page || 1),
        provider_page_size: sort ? null : Number(params.pageSize || 100),
        local_sort: sort ? { ...sort, scope: "single_full_provider_response", additional_provider_requests: 0 } : null,
        hidden_pagination_requests: 0,
        automatic_retry_requests: 0
      },
      refinement_choices: refinements.choices
    }, { operation: "performance_campaigns" });
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
    if (!["seller_api", "performance_api"].includes(provider)) fail("INVALID_REGISTRY_PROVIDER", `${name}: неизвестный provider.`);
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
      if (meta.method === "GET" && meta.request_style !== "query") fail("REQUEST_STYLE_NOT_READY", `${name}: GET требует query builder.`);
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
    description_category_dependent_attributes: { normalizeParams: normalizeDescriptionCategoryDependentAttributesParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_09_01_beta_read" },
    description_category_dependent_attribute_values: { normalizeParams: normalizeDescriptionCategoryDependentAttributeValuesParams, sanitizeResult: safeReadResult, contract_state: "official_swagger_2026_09_01_beta_read_explicit_cursor" },
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
    performance_campaigns: { normalizeParams: normalizePerformanceCampaignsParams, sanitizeResult: performanceCampaignsResult, contract_state: "official_performance_openapi_v2_0_bounded_refinement_v1" },
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

      if (preflight.command.operation === "performance_campaigns") {
        delete requestParams.local_sort;
        delete requestParams.local_limit;
      }
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
      const sanitized = preflight.meta.sanitizeResult(rawResult, { operation: preflight.command.operation, params: preflight.command.params });
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
