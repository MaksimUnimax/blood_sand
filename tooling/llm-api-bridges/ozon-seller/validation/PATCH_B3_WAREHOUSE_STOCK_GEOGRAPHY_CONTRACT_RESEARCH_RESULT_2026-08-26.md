# Patch B3 Warehouse / Stock Geography — contract research result

Date: 2026-08-26
Result: `PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_CONTRACTS_CONFIRMED`

The exact operator-supplied official Seller Swagger with SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` closes the current `P0_warehouse_stock_geography` contract gate.

Accepted B0 already implements `/v4/product/info/stocks` as `stocks_current`; B3 must not create a duplicate alias/business-request route for the queue's historical `product_stock_core` record.

Production implementation is allowed for these seven queue IDs only:

- `seller_warehouse_list` -> `POST /v2/warehouse/list`
- `ozon_warehouse_list` -> `POST /v1/warehouse/ozon/list`
- `fbo_seller_warehouse_list` -> `POST /v1/warehouse/fbo/seller/list`
- `cluster_list` -> `POST /v2/cluster/list`
- `fbs_stock_by_warehouse` -> `POST /v2/product/info/stocks-by-warehouse/fbs`
- `fbo_stock_by_warehouse` -> `POST /v1/product/info/stocks-by-warehouse/fbo`
- `stock_analytics` -> `POST /v1/analytics/stocks`

Implementation constraints:

- fixed Seller host/method/path only;
- read-only only;
- `/v1/warehouse/fbo/seller/list` and `/v2/cluster/list` have no OpenAPI requestBody and must be emitted with no request body;
- caller controls every cursor; `has_next` must not trigger automatic continuation;
- no hidden retry/fanout/pagination;
- exact request field allowlists and enums from official Swagger;
- no undocumented minimum limits or identifier exclusivity rules;
- `stock_analytics` rejects simultaneous `cluster_ids` + `macrolocal_cluster_ids` as explicitly documented;
- business warehouse addresses may be retained as operational geography, while personal/contact phone fields remain under existing safe redaction;
- all seven endpoint entitlement rules are `ALL_ACCOUNTS` according to the exact Swagger compiler;
- Autorun, Work-session lifecycle, Manual mode, provider scheduler/cache/history/no-replay, credentials and transport ownership remain protected and out of scope.
