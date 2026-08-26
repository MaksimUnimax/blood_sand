# Patch B3 Warehouse / Stock Geography — operator Swagger evidence

Date: 2026-08-26
Status: `PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_OPERATOR_SWAGGER_EVIDENCE_CAPTURED`

## Authority

Exact operator-supplied Ozon Seller Swagger artifact reused from B1/B2 research:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Seller API server: `api-seller.ozon.ru`

No third-party mirror, SDK, inferred API version, or guessed contract field was used.

## Current priority closure

The historical queue `P0_warehouse_stock_geography` contains eight records. The already accepted B0 operation `stocks_current` satisfies `/v4/product/info/stocks`, so B3 does not add a second alias for that provider request.

Remaining official targets:

- `seller_warehouse_list` -> `POST /v2/warehouse/list`, operationId `WarehouseListV2`, JSON request `v2WarehouseListV2Request`.
- `ozon_warehouse_list` -> `POST /v1/warehouse/ozon/list`, operationId `WarehouseOZONList`, JSON request `v1WarehouseOZONListRequest`.
- `fbo_seller_warehouse_list` -> `POST /v1/warehouse/fbo/seller/list`, operationId `WarehouseFboSellerList`, **no requestBody**.
- `cluster_list` -> `POST /v2/cluster/list`, operationId `DraftClusterList`, **no requestBody**.
- `fbs_stock_by_warehouse` -> `POST /v2/product/info/stocks-by-warehouse/fbs`, operationId `ProductAPI_GetProductInfoStocksByWarehouseFbsV2`, JSON request `v2GetProductInfoStocksByWarehouseFbsRequestV2`.
- `fbo_stock_by_warehouse` -> `POST /v1/product/info/stocks-by-warehouse/fbo`, operationId `GetProductInfoStocksByWarehouseFbo`, JSON request `product.v1.GetProductInfoStocksByWarehouseFboRequest`.
- `stock_analytics` -> `POST /v1/analytics/stocks`, operationId `AnalyticsAPI_AnalyticsStocks`, JSON request `v1AnalyticsStocksRequest`.

## Contract facts

`/v2/warehouse/list`: required `limit`, schema maximum `200`; caller-controlled `cursor`; `warehouse_ids` string-int64 array with schema maximum `200`. Response exposes cursor/has_next and warehouse identity/status/type/geography.

`/v1/warehouse/ozon/list`: optional `warehouse_types` only. Exact enum: `FULL_FILLMENT`, `FULL_FILLMENT_RETURNS`, `FULL_FILLMENT_DEFECT`, `EXPRESS_DARK_STORE`, `CROSS_DOCK`, `SORTING_CENTER`, `PHARMACY`, `DISTRIBUTION_CENTER`, `ORDERS_RECEIVING_POINT`, `OUTSOURCE_FF`, `B2B`, `EXTERNAL_FF`.

`/v1/warehouse/fbo/seller/list` and `/v2/cluster/list`: no OpenAPI requestBody. B3 must not invent `{}`.

`/v2/product/info/stocks-by-warehouse/fbs`: required `limit`, maximum `1000`; optional caller cursor; `offer_id` max `1000`; `sku` string-int64 max `1000`; response has cursor/has_next; no automatic continuation authorized.

`/v1/product/info/stocks-by-warehouse/fbo`: required `limit`, maximum `1000`; official description says pass `offer_ids` or `skus`; B3 requires at least one identifier field but does not invent mutual exclusivity; optional caller cursor; both arrays max `1000`, SKU values string-int64.

`/v1/analytics/stocks`: required `skus`, maximum `100`; optional string-int64 cluster/macrolocal/warehouse arrays; exact enums preserved for `item_tags`, `placement_zone`, `turnover_grades`; `unmarked_stocks_only` boolean. Operation description explicitly forbids simultaneous `cluster_ids` and `macrolocal_cluster_ids`.

The analytics operation description says that from 17 August 2026 stock information is real-time while the same description still includes older twice-daily update text. B3 records the inconsistency and does not invent a stronger freshness guarantee.

## Entitlements and safety

The accepted dynamic Swagger entitlement compiler classifies all seven endpoints as `ALL_ACCOUNTS` with no endpoint subscription allowlist or feature-level rule.

All seven are fixed read-only Seller operations. Bodyless POSTs require fixed `request_style: no_body`; all cursors remain caller-controlled; no hidden retry, pagination, fanout, report workflow or write is authorized. Warehouse business addresses may be retained as operational geography while contact/phone data remains under existing redaction.
