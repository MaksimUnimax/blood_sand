(() => {
  "use strict";
  const HELP_PREFIX = globalThis.OzonRuntime?.RUNTIME?.helpPrefix || "OZON_HELP_V1";
  const GUIDANCE_PREFIX = globalThis.OzonRuntime?.RUNTIME?.guidanceResultPrefix || "OZON_GUIDANCE_RESULT_V1";
  const CLUSTERS = Object.freeze({
    sales_analytics: Object.freeze({ description: "Sales, revenue and ordered-unit analytics.", operations: Object.freeze(["analytics_data"]), clues: Object.freeze(["analytics/data", "performance/v2/order", "sales", "sale", "revenue", "turnover", "ordered_units", "продаж", "выруч", "оборот"])}),
    stock_inventory: Object.freeze({ description: "Current stock by product or offer ID.", operations: Object.freeze(["stocks_current"]), clues: Object.freeze(["product/info/stocks", "stock", "stocks", "inventory", "остат", "налич"])}),
    search_visibility: Object.freeze({ description: "Buyer search queries and visibility for selected SKUs.", operations: Object.freeze(["product_queries", "product_queries_details"]), clues: Object.freeze(["product-queries", "search", "query", "queries", "visibility", "поиск", "запрос", "видим"])}),
    fulfillment_supply: Object.freeze({ description: "Read-only FBO postings and supply orders.", operations: Object.freeze(["posting_fbo_list", "supply_order_get", "supply_order_details"]), clues: Object.freeze(["posting/fbo", "supply-order", "posting", "shipment", "supply", "постав", "отправ", "фбо", "fbo"])}),
    advertising_performance: Object.freeze({ description: "Read-only advertising campaigns and statistics.", operations: Object.freeze(["performance_campaigns", "performance_expense", "performance_daily", "performance_campaign_product"]), clues: Object.freeze(["api/client/campaign", "statistics/expense", "statistics/daily", "campaign/product", "advert", "campaign", "expense", "spend", "реклам", "кампан", "расход"])}),
    account_access: Object.freeze({ description: "Roles available to configured Seller credentials.", operations: Object.freeze(["roles"]), clues: Object.freeze(["/v1/roles", "roles", "permissions", "access", "роль", "прав", "доступ"])})
  });
  const BLOCKED = Object.freeze(["posting_fbs_get", "authorization", "api_key", "client_secret", "token", "create", "update", "delete", "activate", "deactivate", "bid"]);
  const INTENT_FIELDS = new Set(["operation", "method", "path", "endpoint", "action"]);
  const SENSITIVE = new Set(["authorization", "api_key", "apikey", "client_id", "clientid", "client_secret", "clientsecret", "token", "access_token", "access-token"]);
  const CARDS = Object.freeze({
    analytics_data: Object.freeze({ purpose: "Revenue and ordered-unit analytics by period.", template: { operation: "analytics_data", params: { date_from: "2026-01-01", date_to: "2026-01-07", dimension: ["day"], metrics: ["revenue"], limit: 100 } } }),
    stocks_current: Object.freeze({ purpose: "Current inventory for product or offer filters.", template: { operation: "stocks_current", params: { filter: { product_id: [1] }, limit: 100 } } }),
    product_queries: Object.freeze({ purpose: "Search-query summary for selected SKUs.", template: { operation: "product_queries", params: { date_from: "2026-01-01T00:00:00Z", page_size: 10, skus: ["1"] } } }),
    product_queries_details: Object.freeze({ purpose: "Detailed search-query information for selected SKUs.", template: { operation: "product_queries_details", params: { date_from: "2026-01-01T00:00:00Z", page_size: 10, skus: ["1"], limit_by_sku: 10 } } }),
    posting_fbo_list: Object.freeze({ purpose: "Read-only FBO posting list; no FBS customer data.", template: { operation: "posting_fbo_list", params: { limit: 10 } } }),
    supply_order_get: Object.freeze({ purpose: "Supply orders by IDs.", template: { operation: "supply_order_get", params: { order_ids: [1] } } }),
    supply_order_details: Object.freeze({ purpose: "One supply-order detail.", template: { operation: "supply_order_details", params: { order_id: 1 } } }),
    performance_campaigns: Object.freeze({ purpose: "Read-only campaign list.", template: { operation: "performance_campaigns", params: {} } }),
    performance_expense: Object.freeze({ purpose: "Advertising expense statistics.", template: { operation: "performance_expense", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } } }),
    performance_daily: Object.freeze({ purpose: "Daily advertising statistics.", template: { operation: "performance_daily", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } } }),
    performance_campaign_product: Object.freeze({ purpose: "Campaign/product advertising statistics.", template: { operation: "performance_campaign_product", params: { dateFrom: "2026-01-01", dateTo: "2026-01-07" } } }),
    roles: Object.freeze({ purpose: "Configured Seller-account roles.", template: { operation: "roles", params: {} } })
  });
  const norm = (value) => String(value || "").toLowerCase().slice(0, 240);
  // Object-tag validation also keeps the pure module usable in a test VM realm.
  const plain = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.prototype.toString.call(value) === "[object Object]");
  function descriptorFromObject(value, errorCode = "INVALID_COMMAND") {
    if (!plain(value)) return Object.freeze({ error_code: String(errorCode), top_level_keys: Object.freeze([]), intent: Object.freeze({}), parameter_keys: Object.freeze([]), sensitive: false });
    const top = Object.keys(value).slice(0, 24).map(norm); const intent = {};
    let sensitive = false;
    for (const key of top) { if (SENSITIVE.has(key)) sensitive = true; if (INTENT_FIELDS.has(key) && typeof value[key] === "string") intent[key] = norm(value[key]); }
    const params = plain(value.params) ? value.params : plain(value.args) ? value.args : {};
    const parameterKeys = Object.keys(params).slice(0, 32).map(norm);
    for (const key of parameterKeys) if (SENSITIVE.has(key)) sensitive = true;
    return Object.freeze({ error_code: String(errorCode || "INVALID_COMMAND").slice(0, 80), top_level_keys: Object.freeze(top), intent: Object.freeze(intent), parameter_keys: Object.freeze(parameterKeys), sensitive });
  }
  function descriptorFromJson(jsonText, errorCode) { try { return descriptorFromObject(JSON.parse(String(jsonText || "")), errorCode); } catch (_) { return descriptorFromObject(null, errorCode || "INVALID_JSON"); } }
  function scoreDescriptor(descriptor, contract = globalThis.OzonContract) {
    const scores = Object.fromEntries(Object.keys(CLUSTERS).map((id) => [id, 0]));
    const rules = [];
    const tokens = [...Object.values(descriptor?.intent || {}), ...(descriptor?.top_level_keys || []), ...(descriptor?.parameter_keys || [])].join(" ");
    for (const [id, cluster] of Object.entries(CLUSTERS)) {
      for (const op of cluster.operations) if (Object.values(descriptor?.intent || {}).includes(op)) { scores[id] += 100; rules.push(`${id}:exact_alias`); }
      for (const clue of cluster.clues) if (tokens.includes(clue)) { scores[id] += clue.includes("/") ? 80 : 20; rules.push(`${id}:clue`); }
    }
    const p = new Set(descriptor?.parameter_keys || []);
    if (["date_from", "date_to", "metrics", "dimension"].filter((x) => p.has(x)).length >= 2) { scores.sales_analytics += 45; rules.push("sales_analytics:analytics_params"); }
    if (["product_id", "offer_id", "warehouse_ids"].filter((x) => p.has(x)).length >= 2) { scores.stock_inventory += 45; rules.push("stock_inventory:stock_params"); }
    if (["skus", "sort_by", "sort_dir", "limit_by_sku"].filter((x) => p.has(x)).length >= 2) { scores.search_visibility += 45; rules.push("search_visibility:search_params"); }
    if (["order_ids", "order_id", "posting_numbers", "since", "to"].filter((x) => p.has(x)).length >= 2) { scores.fulfillment_supply += 45; rules.push("fulfillment_supply:fulfillment_params"); }
    if (["campaignids", "advobjecttype", "datefrom", "dateto"].filter((x) => p.has(x)).length >= 2) { scores.advertising_performance += 45; rules.push("advertising_performance:performance_params"); }
    return Object.freeze({ scores: Object.freeze(scores), rules: Object.freeze(rules) });
  }
  function classify(descriptor, contract = globalThis.OzonContract) {
    const blockedText = [...Object.values(descriptor?.intent || {}), ...(descriptor?.top_level_keys || []), ...(descriptor?.parameter_keys || [])].join(" ");
    if (descriptor?.sensitive || BLOCKED.some((x) => blockedText.includes(x))) return Object.freeze({ status: "unsupported_or_blocked", cluster: null, ...scoreDescriptor(descriptor, contract) });
    const scored = scoreDescriptor(descriptor, contract); const ranked = Object.entries(scored.scores).sort((a,b) => b[1]-a[1]);
    const [first, second] = [ranked[0], ranked[1]];
    return Object.freeze({ status: first[1] >= 45 && first[1] - second[1] >= 20 ? "cluster_identified" : "cluster_required", cluster: first[1] >= 45 && first[1] - second[1] >= 20 ? first[0] : null, ...scored });
  }
  function parseHelp(text) {
    const source = String(text || ""); const count = source.split(HELP_PREFIX).length - 1;
    if (count !== 1) return Object.freeze({ ok: false, code: count > 1 ? "MULTIPLE_HELP_MARKERS" : "NO_HELP_MARKER" });
    const match = source.match(new RegExp(`${HELP_PREFIX}\\s*({[\\s\\S]*})`)); if (!match) return Object.freeze({ ok: false, code: "MISSING_HELP_JSON" });
    try { const value = JSON.parse(match[1]); if (!plain(value) || Object.keys(value).length !== 1 || typeof value.cluster !== "string" || !CLUSTERS[value.cluster]) return Object.freeze({ ok: false, code: "INVALID_HELP_SELECTION" }); return Object.freeze({ ok: true, cluster: value.cluster }); } catch (_) { return Object.freeze({ ok: false, code: "INVALID_HELP_JSON" }); }
  }
  function catalogValidation(contract = globalThis.OzonContract) {
    const registry = contract?.OPERATIONS || {}; const enabled = Object.entries(registry).filter(([,meta]) => meta?.execution_enabled === true && meta?.effect === "READ").map(([op]) => op).sort(); const offered = Object.values(CLUSTERS).flatMap((cluster) => cluster.operations).sort();
    const duplicate = offered.filter((op, i) => offered.indexOf(op) !== i); const missing = enabled.filter((op) => !offered.includes(op)); const unexpected = offered.filter((op) => !enabled.includes(op)); const blocked = offered.filter((op) => registry[op]?.execution_enabled !== true || op === "posting_fbs_get");
    return Object.freeze({ ok: !duplicate.length && !missing.length && !unexpected.length && !blocked.length, enabled: Object.freeze(enabled), offered: Object.freeze(offered), duplicate: Object.freeze(duplicate), missing: Object.freeze(missing), unexpected: Object.freeze(unexpected), blocked: Object.freeze(blocked) });
  }
  function result({ status, cluster = null, error = null, descriptor = null }) {
    const choices = cluster ? CLUSTERS[cluster].operations.map((operation) => ({ operation, purpose: CARDS[operation].purpose, template: CARDS[operation].template })) : Object.entries(CLUSTERS).map(([id, value]) => ({ cluster: id, description: value.description }));
    return Object.freeze({ bridge: "ozon-llm-api-bridge", version: "0.1.19", guidance_version: "1", status, cluster, external_request_executed: false, physical_business_request_count: 0, error: error ? String(error).slice(0, 120) : null, choices, diagnostic: descriptor ? { error_code: descriptor.error_code, top_level_keys: descriptor.top_level_keys, intent: descriptor.intent } : null });
  }
  function format(resultValue) { return `${GUIDANCE_PREFIX}\n${JSON.stringify(resultValue, null, 2)}`; }
  globalThis.OzonGuidance = Object.freeze({ HELP_PREFIX, GUIDANCE_PREFIX, CLUSTERS, CARDS, descriptorFromObject, descriptorFromJson, scoreDescriptor, classify, parseHelp, catalogValidation, result, format });
})();
