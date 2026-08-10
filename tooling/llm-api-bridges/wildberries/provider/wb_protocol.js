(() => {
  "use strict";

  const PREFIX = "WB_API_V1";
  const RESULT_PREFIX = "WB_RESULT_V1";
  const VERSION = "0.1.0-dev";

  const HOSTS = Object.freeze({
    content: "content-api.wildberries.ru",
    analytics: "seller-analytics-api.wildberries.ru",
    prices: "discounts-prices-api.wildberries.ru",
    marketplace: "marketplace-api.wildberries.ru",
    promotion: "advert-api.wildberries.ru",
    finance: "finance-api.wildberries.ru",
    statistics: "statistics-api.wildberries.ru",
    supplies: "supplies-api.wildberries.ru",
    common: "common-api.wildberries.ru",
    calendar: "dp-calendar-api.wildberries.ru"
  });

  const OPERATIONS = Object.freeze({
    cards_list: { method: "POST", host: "content", path: "/content/v2/get/cards/list", credential: "content", effect: "READ", body: true },
    cards_trash: { method: "POST", host: "content", path: "/content/v2/get/cards/trash", credential: "content", effect: "READ", body: true },
    prices_all: { method: "GET", host: "prices", path: "/api/v2/list/goods/filter", credential: "prices", effect: "READ", query: true },
    prices_by_nm: { method: "POST", host: "prices", path: "/api/v2/list/goods/filter", credential: "prices", effect: "READ", body: true },
    size_prices: { method: "GET", host: "prices", path: "/api/v2/list/goods/size/nm", credential: "prices", effect: "READ", query: true },
    price_quarantine: { method: "GET", host: "prices", path: "/api/v2/quarantine/goods", credential: "prices", effect: "READ", query: true },
    seller_warehouses: { method: "GET", host: "marketplace", path: "/api/v3/warehouses", credential: "marketplace", effect: "READ", query: true },
    offices: { method: "GET", host: "marketplace", path: "/api/v3/offices", credential: "marketplace", effect: "READ", query: true },
    fbs_stocks: { method: "POST", host: "marketplace", path: "/api/v3/stocks/{warehouseId}", credential: "marketplace", effect: "READ", body: true, pathParam: "warehouseId", pathType: "uint" },
    stock_products_analytics: { method: "POST", host: "analytics", path: "/api/v2/stocks-report/products/products", credential: "analytics", effect: "READ", body: true },
    stock_groups_analytics: { method: "POST", host: "analytics", path: "/api/v2/stocks-report/products/groups", credential: "analytics", effect: "READ", body: true },
    sales_funnel_products: { method: "POST", host: "analytics", path: "/api/analytics/v3/sales-funnel/products", credential: "analytics", effect: "READ", body: true },
    sales_funnel_history: { method: "POST", host: "analytics", path: "/api/analytics/v3/sales-funnel/products/history", credential: "analytics", effect: "READ", body: true },
    sales_funnel_group_history: { method: "POST", host: "analytics", path: "/api/analytics/v3/sales-funnel/grouped/history", credential: "analytics", effect: "READ", body: true },
    search_report: { method: "POST", host: "analytics", path: "/api/v2/search-report/report", credential: "analytics", effect: "READ", body: true, restriction: "JAM" },
    analytics_download_create: { method: "POST", host: "analytics", path: "/api/v2/nm-report/downloads", credential: "analytics", effect: "READ", body: true },
    analytics_download_list: { method: "GET", host: "analytics", path: "/api/v2/nm-report/downloads", credential: "analytics", effect: "READ", query: true },
    analytics_download_file: { method: "GET", host: "analytics", path: "/api/v2/nm-report/downloads/file/{downloadId}", credential: "analytics", effect: "READ", query: true, pathParam: "downloadId", pathType: "safe_id", response: "BINARY" },
    fbs_orders: { method: "GET", host: "marketplace", path: "/api/v3/orders", credential: "marketplace", effect: "READ", query: true },
    fbs_new_orders: { method: "GET", host: "marketplace", path: "/api/v3/orders/new", credential: "marketplace", effect: "READ", query: true },
    statistics_orders: { method: "GET", host: "statistics", path: "/api/v1/supplier/orders", credential: "statistics", effect: "READ", query: true },
    statistics_sales: { method: "GET", host: "statistics", path: "/api/v1/supplier/sales", credential: "statistics", effect: "READ", query: true },
    fbw_warehouses: { method: "GET", host: "supplies", path: "/api/v1/warehouses", credential: "supplies", effect: "READ", query: true },
    fbw_acceptance_options: { method: "POST", host: "supplies", path: "/api/v1/acceptance/options", credential: "supplies", effect: "READ", body: true },
    fbw_supplies_list: { method: "POST", host: "supplies", path: "/api/v1/supplies", credential: "supplies", effect: "READ", body: true },
    fbw_supply_details: { method: "GET", host: "supplies", path: "/api/v1/supplies/{ID}", credential: "supplies", effect: "READ", query: true, pathParam: "ID", pathType: "uint" },
    fbw_supply_products: { method: "GET", host: "supplies", path: "/api/v1/supplies/{ID}/goods", credential: "supplies", effect: "READ", query: true, pathParam: "ID", pathType: "uint" },
    fbw_supply_package: { method: "GET", host: "supplies", path: "/api/v1/supplies/{ID}/package", credential: "supplies", effect: "READ", query: true, pathParam: "ID", pathType: "uint" },
    seller_info: { method: "GET", host: "common", path: "/api/v1/seller-info", credential: "common", effect: "READ", query: true },
    region_sales: { method: "GET", host: "analytics", path: "/api/v1/analytics/region-sale", credential: "analytics", effect: "READ", query: true },
    goods_returns: { method: "GET", host: "analytics", path: "/api/v1/analytics/goods-return", credential: "analytics", effect: "READ", query: true },
    seller_balance: { method: "GET", host: "finance", path: "/api/v1/account/balance", credential: "finance", effect: "READ", query: true },
    sales_reports_list: { method: "POST", host: "finance", path: "/api/finance/v1/sales-reports/list", credential: "finance", effect: "READ", body: true },
    realization_details_period: { method: "POST", host: "finance", path: "/api/finance/v1/sales-reports/detailed", credential: "finance", effect: "READ", body: true },
    realization_details_report: { method: "POST", host: "finance", path: "/api/finance/v1/sales-reports/detailed/{reportId}", credential: "finance", effect: "READ", body: true, pathParam: "reportId", pathType: "uint" },
    campaigns_list: { method: "GET", host: "promotion", path: "/adv/v1/promotion/count", credential: "promotion", effect: "READ", query: true },
    campaigns_info: { method: "GET", host: "promotion", path: "/api/advert/v2/adverts", credential: "promotion", effect: "READ", query: true },
    campaign_products: { method: "POST", host: "promotion", path: "/adv/v2/supplier/nms", credential: "promotion", effect: "READ", body: true },
    campaign_cluster_bids: { method: "POST", host: "promotion", path: "/adv/v0/normquery/get-bids", credential: "promotion", effect: "READ", body: true },
    campaign_cluster_stats: { method: "POST", host: "promotion", path: "/adv/v0/normquery/stats", credential: "promotion", effect: "READ", body: true },
    campaign_stats: { method: "GET", host: "promotion", path: "/adv/v3/fullstats", credential: "promotion", effect: "READ", query: true },
    promotion_balance: { method: "GET", host: "promotion", path: "/adv/v1/balance", credential: "promotion", effect: "READ", query: true },
    promotions_calendar: { method: "GET", host: "calendar", path: "/api/v1/calendar/promotions", credential: "prices", effect: "READ", query: true },
    promotions_details: { method: "GET", host: "calendar", path: "/api/v1/calendar/promotions/details", credential: "prices", effect: "READ", query: true }
  });
  for (const value of Object.values(OPERATIONS)) Object.freeze(value);

  function fail(code, message) { const error = new Error(message || code); error.code = code; throw error; }
  function cleanObject(value, name) {
    if (value === undefined) return Object.freeze({});
    if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_PARAMS", `${name} должен быть JSON-объектом.`);
    for (const forbidden of ["url", "host", "headers", "method", "authorization", "token", "api_key"]) {
      if (Object.prototype.hasOwnProperty.call(value, forbidden)) fail("FORBIDDEN_TRANSPORT_FIELD", `${forbidden} запрещён в LLM-команде.`);
    }
    const json = JSON.stringify(value);
    if (new TextEncoder().encode(json).length > 512 * 1024) fail("PARAMS_TOO_LARGE", `${name} слишком большой.`);
    return Object.freeze(structuredClone(value));
  }
  function normalizePathValue(value, type, name) {
    const text = String(value ?? "").trim();
    if (!text) fail("MISSING_PATH_PARAM", `Не указан ${name}.`);
    if (type === "uint" && !/^\d{1,20}$/.test(text)) fail("INVALID_PATH_PARAM", `${name} должен быть положительным числовым id.`);
    if (type === "safe_id" && !/^[A-Za-z0-9._:-]{1,160}$/.test(text)) fail("INVALID_PATH_PARAM", `${name} имеет недопустимый формат.`);
    return text;
  }
  function normalizeCommand(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("INVALID_JSON_ROOT", "Команда должна быть JSON-объектом.");
    const operation = String(raw.operation || "").trim();
    if (!operation) fail("MISSING_OPERATION", "Не указано поле operation.");
    const meta = OPERATIONS[operation];
    if (!meta) fail("UNSUPPORTED_OPERATION", `Операция ${operation} не разрешена.`);
    if (meta.effect !== "READ") fail("MUTATION_FORBIDDEN", operation);
    const params = cleanObject(raw.params, "params");
    const path = {};
    if (meta.pathParam) path[meta.pathParam] = normalizePathValue(raw.path?.[meta.pathParam], meta.pathType, meta.pathParam);
    if (raw.path !== undefined && (!raw.path || typeof raw.path !== "object" || Array.isArray(raw.path))) fail("INVALID_PATH_PARAMS", "path должен быть JSON-объектом.");
    const normalized = { operation, params };
    if (meta.pathParam) normalized.path = Object.freeze(path);
    return Object.freeze(normalized);
  }
  function parseCommand(text) {
    const source = String(text || "").replace(/\u00a0/g, " ").trim();
    if (!source.startsWith(PREFIX)) fail("NOT_WB_COMMAND", `Команда должна начинаться с ${PREFIX}`);
    const rest = source.slice(PREFIX.length).trim();
    if (!rest) fail("MISSING_JSON", `После ${PREFIX} должен идти JSON-объект.`);
    let raw; try { raw = JSON.parse(rest); } catch (error) { fail("INVALID_JSON", `Некорректный JSON: ${error.message}`); }
    return normalizeCommand(raw);
  }
  function queryString(params) {
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(params || {})) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) for (const item of value) usp.append(key, String(item));
      else if (typeof value === "object") fail("INVALID_QUERY_PARAM", `GET query ${key} не может быть объектом.`);
      else usp.append(key, String(value));
    }
    const text = usp.toString();
    return text ? `?${text}` : "";
  }
  function buildRequest(command) {
    const meta = OPERATIONS[command.operation];
    if (!meta) fail("UNSUPPORTED_OPERATION", command.operation);
    const host = HOSTS[meta.host];
    if (!host) fail("INVALID_HOST_ALIAS", meta.host);
    let path = meta.path;
    if (meta.pathParam) path = path.replace(`{${meta.pathParam}}`, encodeURIComponent(command.path[meta.pathParam]));
    const qs = meta.query ? queryString(command.params) : "";
    return Object.freeze({ url: `https://${host}${path}${qs}`, host, method: meta.method, credential: meta.credential, effect: meta.effect,
      response: meta.response || "JSON", restriction: meta.restriction || null,
      headers: Object.freeze({ ...(meta.body ? { "Content-Type": "application/json" } : {}) }), body: meta.body ? command.params : undefined });
  }
  function attachCredentials(request, credentials) {
    const token = String(credentials?.[request.credential] || "").trim();
    if (!token) fail("TOKEN_MISSING", `Нет WB token категории ${request.credential}.`);
    if (/[^\x20-\x7E]/.test(token)) fail("INVALID_CREDENTIAL_ENCODING", "WB token должен быть ASCII header-safe.");
    return Object.freeze({ ...request, headers: Object.freeze({ ...request.headers, Authorization: `Bearer ${token}` }) });
  }
  function redactRequestForEvidence(request) { return Object.freeze({ host: request.host, method: request.method, path: new URL(request.url).pathname,
    credential: request.credential, effect: request.effect, response: request.response, restriction: request.restriction }); }
  function commandFingerprint(command) { const json = JSON.stringify(command); let hash = 2166136261; for (let i=0;i<json.length;i+=1){hash^=json.charCodeAt(i);hash=Math.imul(hash,16777619);} return (hash>>>0).toString(16).padStart(8,"0"); }
  function formatResultReport({ requestId, command, httpStatus, result, elapsedMs, pagination, rateLimit }) {
    const envelope = { bridge: "wildberries-llm-api-bridge", version: VERSION, request_id: requestId, operation: command.operation, command,
      http_status: Number(httpStatus || 0), elapsed_ms: Number(elapsedMs || 0), result };
    if (pagination !== undefined) envelope.pagination = pagination;
    if (rateLimit !== undefined) envelope.rate_limit = rateLimit;
    return `${RESULT_PREFIX}\n${JSON.stringify(envelope, null, 2)}`;
  }
  function isCommandText(text) { return String(text || "").replace(/\u00a0/g, " ").trim().startsWith(PREFIX); }

  globalThis.WBProtocol = Object.freeze({ PREFIX, RESULT_PREFIX, VERSION, HOSTS, OPERATIONS, parseCommand, normalizeCommand, buildRequest, attachCredentials,
    redactRequestForEvidence, commandFingerprint, formatResultReport, isCommandText });
})();
