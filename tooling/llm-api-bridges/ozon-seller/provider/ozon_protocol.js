(() => {
  "use strict";

  const PREFIX = "OZON_API_V1";
  const RESULT_PREFIX = "OZON_RESULT_V1";
  const VERSION = "0.1.0-dev";
  const BASE_URL = "https://api-seller.ozon.ru";

  // Only methods directly confirmed from official Ozon sources are present here.
  // Exact request bodies still follow the provider's live API schema and are not
  // expanded into a permissive URL/method transport.
  const OPERATIONS = Object.freeze({
    product_stocks: Object.freeze({ method: "POST", path: "/v4/product/info/stocks", credential: "seller", effect: "READ" }),
    analytics_data: Object.freeze({ method: "POST", path: "/v1/analytics/data", credential: "seller", effect: "READ" }),
    product_queries: Object.freeze({ method: "POST", path: "/v1/analytics/product-queries", credential: "seller", effect: "READ" }),
    product_query_details: Object.freeze({ method: "POST", path: "/v1/analytics/product-queries/details", credential: "seller", effect: "READ" }),
    fbo_postings: Object.freeze({ method: "POST", path: "/v3/posting/fbo/list", credential: "seller", effect: "READ" }),
    fbs_posting: Object.freeze({ method: "POST", path: "/v3/posting/fbs/get", credential: "seller", effect: "READ" }),
    finance_transactions: Object.freeze({ method: "POST", path: "/v3/finance/transaction/list", credential: "seller", effect: "READ" }),
    fbo_supply_order: Object.freeze({ method: "POST", path: "/v3/supply-order/get", credential: "seller", effect: "READ" }),
    fbo_supply_details: Object.freeze({ method: "POST", path: "/v1/supply-order/details", credential: "seller", effect: "READ" })
  });

  function fail(code, message) {
    const error = new Error(message || code);
    error.code = code;
    throw error;
  }

  function normalizeObject(value, name, { maxBytes = 512 * 1024 } = {}) {
    if (value === undefined) return Object.freeze({});
    if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_PARAMS", `${name} должен быть JSON-объектом.`);
    let json;
    try { json = JSON.stringify(value); } catch { fail("INVALID_PARAMS", `${name} не сериализуется в JSON.`); }
    if (new TextEncoder().encode(json).length > maxBytes) fail("PARAMS_TOO_LARGE", `${name} слишком большой.`);
    if (Object.prototype.hasOwnProperty.call(value, "url") || Object.prototype.hasOwnProperty.call(value, "host") ||
        Object.prototype.hasOwnProperty.call(value, "headers") || Object.prototype.hasOwnProperty.call(value, "method") ||
        Object.prototype.hasOwnProperty.call(value, "authorization") || Object.prototype.hasOwnProperty.call(value, "api_key") ||
        Object.prototype.hasOwnProperty.call(value, "client_id")) {
      fail("FORBIDDEN_TRANSPORT_FIELD", "URL/host/headers/method/credentials не могут задаваться из LLM-команды.");
    }
    return Object.freeze(structuredClone(value));
  }

  function normalizeCommand(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("INVALID_JSON_ROOT", "Команда должна быть JSON-объектом.");
    const operation = String(raw.operation || "").trim();
    if (!operation) fail("MISSING_OPERATION", "Не указано поле operation.");
    const meta = OPERATIONS[operation];
    if (!meta) fail("UNSUPPORTED_OPERATION", `Операция ${operation} не разрешена.`);
    if (meta.effect !== "READ") fail("MUTATION_FORBIDDEN", `Операция ${operation} не является read-only.`);
    const params = normalizeObject(raw.params, "params");
    return Object.freeze({ operation, params });
  }

  function parseCommand(text) {
    const source = String(text || "").replace(/\u00a0/g, " ").trim();
    if (!source.startsWith(PREFIX)) fail("NOT_OZON_COMMAND", `Команда должна начинаться с ${PREFIX}`);
    const rest = source.slice(PREFIX.length).trim();
    if (!rest) fail("MISSING_JSON", `После ${PREFIX} должен идти JSON-объект.`);
    let raw;
    try { raw = JSON.parse(rest); } catch (error) { fail("INVALID_JSON", `Некорректный JSON: ${error.message}`); }
    return normalizeCommand(raw);
  }

  function buildRequest(command) {
    const meta = OPERATIONS[command.operation];
    if (!meta) fail("UNSUPPORTED_OPERATION", command.operation);
    return Object.freeze({
      url: `${BASE_URL}${meta.path}`,
      host: "api-seller.ozon.ru",
      method: meta.method,
      credential: meta.credential,
      effect: meta.effect,
      headers: Object.freeze({ "Content-Type": "application/json" }),
      body: command.params
    });
  }

  function attachCredentials(request, credentials) {
    const clientId = String(credentials?.clientId || "").trim();
    const apiKey = String(credentials?.apiKey || "").trim();
    if (!clientId) fail("CLIENT_ID_MISSING", "Ozon Client-Id не сохранён.");
    if (!apiKey) fail("API_KEY_MISSING", "Ozon Api-Key не сохранён.");
    if (/[^\x20-\x7E]/.test(clientId) || /[^\x20-\x7E]/.test(apiKey)) fail("INVALID_CREDENTIAL_ENCODING", "Ozon credentials должны быть ASCII header-safe.");
    return Object.freeze({
      ...request,
      headers: Object.freeze({ ...request.headers, "Client-Id": clientId, "Api-Key": apiKey })
    });
  }

  function redactRequestForEvidence(request) {
    return Object.freeze({ host: request.host, method: request.method, path_alias: request.url.slice(BASE_URL.length), credential: request.credential, effect: request.effect });
  }

  function commandFingerprint(command) {
    const json = JSON.stringify(command);
    let hash = 2166136261;
    for (let i = 0; i < json.length; i += 1) { hash ^= json.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function formatResultReport({ requestId, command, httpStatus, result, elapsedMs, pagination, rateLimit }) {
    const envelope = { bridge: "ozon-llm-api-bridge", version: VERSION, request_id: requestId, operation: command.operation, command,
      http_status: Number(httpStatus || 0), elapsed_ms: Number(elapsedMs || 0), result };
    if (pagination !== undefined) envelope.pagination = pagination;
    if (rateLimit !== undefined) envelope.rate_limit = rateLimit;
    return `${RESULT_PREFIX}\n${JSON.stringify(envelope, null, 2)}`;
  }

  function isCommandText(text) { return String(text || "").replace(/\u00a0/g, " ").trim().startsWith(PREFIX); }

  globalThis.OzonProtocol = Object.freeze({ PREFIX, RESULT_PREFIX, VERSION, BASE_URL, OPERATIONS, parseCommand, normalizeCommand, buildRequest,
    attachCredentials, redactRequestForEvidence, commandFingerprint, formatResultReport, isCommandText });
})();
