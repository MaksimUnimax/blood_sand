# Patch B3 Warehouse / Stock Geography — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `feature/ozon-b3-warehouse-stock-geography-contracts-2026-08-26`
- Exact independently tested commit: `f1a0abb7c22c8b11fcb0eb80ab6508662869ad8d`
- Independent tester result commit: `de850c6f8d1c55eccf640a5713c91e03ec87db63`
- Independent result file: `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_INDEPENDENT_TEST_RESULT_2026-08-26.md`
- Accepted B2 authority: `544b727aee4e5b8be27b92f1cdc0ed517beabac2`
- B3 patch SHA-256: `d5314063b91be87045c42935e259a7731fdc1cacf290cfda1a2035dc238d1b4f`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`

## Accepted production scope

B3 adds exactly these fixed read operations:

- `seller_warehouse_list` -> `POST /v2/warehouse/list`
- `ozon_warehouse_list` -> `POST /v1/warehouse/ozon/list`
- `fbo_seller_warehouse_list` -> `POST /v1/warehouse/fbo/seller/list`
- `cluster_list` -> `POST /v2/cluster/list`
- `fbs_stock_by_warehouse` -> `POST /v2/product/info/stocks-by-warehouse/fbs`
- `fbo_stock_by_warehouse` -> `POST /v1/product/info/stocks-by-warehouse/fbo`
- `stock_analytics` -> `POST /v1/analytics/stocks`

The accepted existing operation `stocks_current` remains the sole bridge operation for `POST /v4/product/info/stocks`; B3 adds no duplicate route.

Exactly three production files differ from accepted B2:

- `shared/ozon_operation_registry.js` -> `12f14ca76eeccb34c5f5ef24bc276260a1309af4d31baffbb5e17342ec365f54`
- `shared/ozon_contract.js` -> `3193207d8e3af865e7a01e2c0757e6483fe87aca7719bade0f65ed8a9cd12a75`
- `shared/ozon_entitlements.js` -> `a55b6694e26a96a5267d327a78e4cdd6b27523dbce3eaafb22946072f076e234`

No `service_worker.js`, `content_script.js`, Autorun, Work-session, Manual-control, provider transport, credentials, quota/cache/history/no-replay, or timing production code changed in B3.

## Deterministic acceptance

Independent materialization re-established the full A1 -> A5 -> B0 -> B1 -> B2 -> B3 identity chain and passed:

- `PATCH_B3_B2_BASE_IDENTITY_PASS`
- `PATCH_B3_PATCH_IDENTITY_PASS`
- `PATCH_B3_PATCH_APPLY_PASS`
- `PATCH_B3_PRODUCTION_FILE_COUNT_21_PASS`
- `PATCH_B3_CHANGED_FILE_IDENTITIES_PASS`
- `PATCH_B3_PROTECTED_B2_IDENTITIES_PASS`
- `PATCH_B3_TREE_MANIFEST_SHA256_PASS`

Accepted B1 and B2 regressions remained green on the B3 tree.

Independent B3 regression passed:

- `B3_WAREHOUSE_STOCK_REGISTRY_PASS`
- `B3_WAREHOUSE_STOCK_EXACT_REQUEST_PASS`
- `B3_WAREHOUSE_STOCK_CONTRACT_PASS`
- `B3_WAREHOUSE_STOCK_ENTITLEMENTS_PASS`
- `B3_WAREHOUSE_STOCK_GUIDANCE_PASS`
- `B3_OPERATIONAL_GEOGRAPHY_SAFE_PROJECTION_PASS`
- `B3_NO_HIDDEN_PAGINATION_FANOUT_PASS`
- `B3_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B3_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS`

The tester made zero Seller business requests, zero Performance requests and zero production modifications.

## Special accepted contract behavior

- `POST /v1/warehouse/fbo/seller/list` and `POST /v2/cluster/list` use `request_style: no_body`; the bridge does not invent or send `{}`.
- operational warehouse geography/address fields remain available in safe projection;
- telephone/contact values remain redacted while Personal Data mode is off;
- no hidden cursor/has-next continuation, retry, fanout, report workflow or write behavior was added.

## Protected semantics

B3 acceptance preserves accepted B2/B1/B0 semantics including Autorun, Work-session lifecycle, Manual mode behavior, provider quota/cache/history, credentials, transport ownership, delivery/no-replay behavior and one-explicit-command/one-business-request.

B3 acceptance does not authorize hidden retry, pagination, fanout, report polling, writes, arbitrary provider transport fields, PII bypass, or guessing missing Ozon API facts.

## Gate for subsequent work

B3 Warehouse / Stock Geography is accepted.

The next roadmap priority after `P0_warehouse_stock_geography` is `P0_orders_returns_cancellations`. Subsequent implementation must begin evidence-first from accepted B3 and close current Ozon-owned contracts before enabling new operations. Autorun and Work-session runtime remain out of scope.
