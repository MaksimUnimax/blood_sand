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
      "POST /v1/fbp/warehouse/list": { default_access: "UNKNOWN", endpoint_allowed_subscription_types: null, feature_rules: [] },
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

  const LIVE_PROVIDER_ACCOUNT_PERMISSION_UNKNOWN = new Set(["POST /v1/fbp/warehouse/list"]);

  function requirementFor(command, snapshot = null, atMs = Date.now()) {
    const registryMeta = globalThis.OzonOperationRegistry?.operation?.(command?.operation) || null;
    if (!registryMeta) return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], rule_source: "not_seller_or_missing" });
    const provider = String(registryMeta.provider || "seller_api");
    if (provider === "performance_api" || provider === "report_file") return deepFreeze({ required: false, known: true, allowed_subscription_types: [], reasons: [], rule_source: "not_seller_or_missing" });
    if (provider !== "seller_api") return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: ["unknown_provider"], rule_source: "unknown_provider" });
    const active = normalizeSnapshot(snapshot);
    const key = String(registryMeta.entitlement_key || `${registryMeta.method} ${registryMeta.path}`);
    if (LIVE_PROVIDER_ACCOUNT_PERMISSION_UNKNOWN.has(key)) {
      return deepFreeze({ required: false, known: false, allowed_subscription_types: [], reasons: ["provider_account_permission_unknown"], entitlement_key: key, rule_source: "live-provider-2026-09-03" });
    }
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
