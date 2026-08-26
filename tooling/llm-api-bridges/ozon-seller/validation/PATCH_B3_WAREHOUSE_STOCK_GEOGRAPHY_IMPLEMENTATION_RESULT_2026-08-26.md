# Patch B3 Warehouse / Stock Geography — production implementation result

Date: 2026-08-26
Status: `PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_CANDIDATE_GREEN`

## Base and identities

- accepted B2 production tree: `3566796bc960530e230e054cbdaf08b8dd3ef826eb6eba756f4a7d436492f32c`
- exact official Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- B3 patch SHA-256: `d5314063b91be87045c42935e259a7731fdc1cacf290cfda1a2035dc238d1b4f`
- B3 candidate tree SHA-256: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`

Exactly three production files change from accepted B2:

- `shared/ozon_operation_registry.js` -> `12f14ca76eeccb34c5f5ef24bc276260a1309af4d31baffbb5e17342ec365f54`
- `shared/ozon_contract.js` -> `3193207d8e3af865e7a01e2c0757e6483fe87aca7719bade0f65ed8a9cd12a75`
- `shared/ozon_entitlements.js` -> `a55b6694e26a96a5267d327a78e4cdd6b27523dbce3eaafb22946072f076e234`

No service worker, content script, Autorun, Work-session, Manual-control, provider, scheduler, credentials, cache/history/no-replay or timing file changes.

## New fixed read operations

- `seller_warehouse_list` -> `POST /v2/warehouse/list`
- `ozon_warehouse_list` -> `POST /v1/warehouse/ozon/list`
- `fbo_seller_warehouse_list` -> `POST /v1/warehouse/fbo/seller/list`
- `cluster_list` -> `POST /v2/cluster/list`
- `fbs_stock_by_warehouse` -> `POST /v2/product/info/stocks-by-warehouse/fbs`
- `fbo_stock_by_warehouse` -> `POST /v1/product/info/stocks-by-warehouse/fbo`
- `stock_analytics` -> `POST /v1/analytics/stocks`

Accepted `stocks_current` remains the single bridge alias for `/v4/product/info/stocks`.

## Implementation details

- strict request allowlists and official enums;
- string-int64 validation for provider identifiers represented as OpenAPI string/int64;
- caller-controlled cursor only;
- no automatic `has_next` continuation;
- all seven bundled entitlement rules `ALL_ACCOUNTS`;
- bodyless official POST operations use a fixed `no_body` request style, so `buildRequest` emits `body: undefined` rather than inventing `{}`;
- existing JSON-body POSTs retain their previous construction path;
- operational warehouse addresses are allowed through safe projection for warehouse geography;
- contact/phone fields continue to redact;
- no hidden retry, pagination, fanout, report workflow or write operation.

## Local deterministic validation

Passed:

- `B3_WAREHOUSE_STOCK_REGISTRY_PASS`
- `B3_WAREHOUSE_STOCK_EXACT_REQUEST_PASS`
- `B3_WAREHOUSE_STOCK_CONTRACT_PASS`
- `B3_WAREHOUSE_STOCK_ENTITLEMENTS_PASS`
- `B3_WAREHOUSE_STOCK_GUIDANCE_PASS`
- `B3_OPERATIONAL_GEOGRAPHY_SAFE_PROJECTION_PASS`
- `B3_NO_HIDDEN_PAGINATION_FANOUT_PASS`
- `B3_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B3_OFFICIAL_SWAGGER_CONTRACT_PASS`
- `B3_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS`

Accepted B2 deterministic regression also remains green on the B3 candidate. All candidate JavaScript files pass `node --check`.

Seller requests during implementation validation: `0`.
Performance requests during implementation validation: `0`.
