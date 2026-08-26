# Patch B3 Warehouse / Stock Geography — independent test result

## Authority

- Tested commit: `f1a0abb7c22c8b11fcb0eb80ab6508662869ad8d`
- Accepted B2 authority: `544b727aee4e5b8be27b92f1cdc0ed517beabac2`
- B3 patch SHA-256: `d5314063b91be87045c42935e259a7731fdc1cacf290cfda1a2035dc238d1b4f`
- Materialized B3 production-tree SHA-256: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`
- Materialized production file count: `21`

## Commands executed

```text
git rev-parse HEAD
(Get-FileHash -Algorithm SHA256 tooling/llm-api-bridges/ozon-seller/validation/PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_2026-08-26.patch).Hash.ToLower()
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_b3_warehouse_stock_geography_candidate.py . D:\codex\Test\ozon-b3-independent-20260826
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b3-independent-20260826
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B2_PRICES_LISTING_STATE_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b3-independent-20260826
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b3-independent-20260826
node --check <each of 18 JavaScript files in the materialized production tree>
```

## Observed PASS markers

```text
PATCH_A1_R2_BASE_IDENTITY_PASS
PATCH_A1_ONLY_SERVICE_WORKER_OVERLAY_PASS
PATCH_A1_SERVICE_WORKER_SHA256_PASS
PATCH_A1_PRODUCTION_FILE_COUNT_19_PASS
PATCH_A1_TREE_MANIFEST_SHA256_PASS
PATCH_A2_A1_BASE_IDENTITY_PASS
PATCH_A2_REFRESH_OVERLAYS_SINGLE_ANCHOR_PASS
PATCH_A2_PERSISTENT_WAKE_FALLBACK_PASS
PATCH_A2_CONTENT_RECONNECT_WAIT_PASS
PATCH_A2_SERVICE_WORKER_SHA256_PASS
PATCH_A2_PRODUCTION_FILE_COUNT_19_PASS
PATCH_A2_TREE_MANIFEST_SHA256_PASS
PATCH_A3_A2_BASE_IDENTITY_PASS
PATCH_A3_RESPONSE_BOUNDARY_RELOAD_PASS
PATCH_A3_NO_TIMER_RUNTIME_RELOAD_PASS
PATCH_A3_POST_RUNTIME_TAB_RELOAD_PASS
PATCH_A3_SERVICE_WORKER_SHA256_PASS
PATCH_A3_PRODUCTION_FILE_COUNT_19_PASS
PATCH_A3_TREE_MANIFEST_SHA256_PASS
PATCH_A4_A3_BASE_IDENTITY_PASS
PATCH_A4_SEPARATE_WORK_RUNTIME_GENERATION_PASS
PATCH_A4_NO_PHYSICAL_EXTENSION_RELOAD_PASS
PATCH_A4_INPROCESS_RUNTIME_REINITIALIZATION_PASS
PATCH_A4_SAME_TAB_RELOAD_COMPLETION_BARRIER_PASS
PATCH_A4_CONTENT_RUNTIME_RENEW_HANDSHAKE_PASS
PATCH_A4_SERVICE_WORKER_SHA256_PASS
PATCH_A4_PRODUCTION_FILE_COUNT_19_PASS
PATCH_A4_TREE_MANIFEST_SHA256_PASS
PATCH_A5_A4_BASE_IDENTITY_PASS
PATCH_A5_PROVIDER_STATUS_SCOPE_PASS
PATCH_A5_RUNTIME_ERRORS_DIAGNOSTIC_ONLY_PASS
PATCH_A5_RESUME_WITHOUT_PROMPT_PASS
PATCH_A5_FINISH_BINDING_PRESERVED_PASS
PATCH_A5_POPUP_INACTIVE_BOUND_RESUME_PASS
PATCH_A5_POPUP_SHA256_PASS
PATCH_A5_SERVICE_WORKER_SHA256_PASS
PATCH_A5_PRODUCTION_FILE_COUNT_19_PASS
PATCH_A5_TREE_MANIFEST_SHA256_PASS
PATCH_B0_A5_BASE_IDENTITY_PASS
PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B0_PATCH_APPLY_PASS
PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B0_CHANGED_FILE_IDENTITIES_PASS
PATCH_B0_TREE_MANIFEST_SHA256_PASS
PATCH_B1_B0_BASE_IDENTITY_PASS
PATCH_B1_PATCH_IDENTITY_PASS
PATCH_B1_PATCH_APPLY_PASS
PATCH_B1_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B1_CHANGED_FILE_IDENTITIES_PASS
PATCH_B1_PROTECTED_B0_IDENTITIES_PASS
PATCH_B1_TREE_MANIFEST_SHA256_PASS
PATCH_B2_B1_BASE_IDENTITY_PASS
PATCH_B2_PATCH_IDENTITY_PASS
PATCH_B2_PATCH_APPLY_PASS
PATCH_B2_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B2_CHANGED_FILE_IDENTITIES_PASS
PATCH_B2_PROTECTED_B1_IDENTITIES_PASS
PATCH_B2_TREE_MANIFEST_SHA256_PASS
PATCH_B3_B2_BASE_IDENTITY_PASS
PATCH_B3_PATCH_IDENTITY_PASS
PATCH_B3_PATCH_APPLY_PASS
PATCH_B3_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B3_CHANGED_FILE_IDENTITIES_PASS
PATCH_B3_PROTECTED_B2_IDENTITIES_PASS
PATCH_B3_TREE_MANIFEST_SHA256_PASS
B1_ASSORTMENT_REGISTRY_PASS
B1_ASSORTMENT_EXACT_REQUEST_PASS
B1_ASSORTMENT_CONTRACT_PASS
B1_ASSORTMENT_ENTITLEMENTS_PASS
B1_ASSORTMENT_GUIDANCE_PASS
B1_NO_HIDDEN_PAGINATION_FANOUT_PASS
B1_PROTECTED_B0_IDENTITIES_PASS
B2_PRICES_LISTING_REGISTRY_PASS
B2_PRICES_LISTING_EXACT_REQUEST_PASS
B2_PRICES_LISTING_CONTRACT_PASS
B2_PRICES_LISTING_ENTITLEMENTS_PASS
B2_PRICES_LISTING_GUIDANCE_PASS
B2_NO_HIDDEN_PAGINATION_FANOUT_PASS
B2_B1_ASSORTMENT_REGRESSION_PASS
B2_PROTECTED_RUNTIME_IDENTITIES_PASS
B3_WAREHOUSE_STOCK_REGISTRY_PASS
B3_WAREHOUSE_STOCK_EXACT_REQUEST_PASS
B3_WAREHOUSE_STOCK_CONTRACT_PASS
B3_WAREHOUSE_STOCK_ENTITLEMENTS_PASS
B3_WAREHOUSE_STOCK_GUIDANCE_PASS
B3_OPERATIONAL_GEOGRAPHY_SAFE_PROJECTION_PASS
B3_NO_HIDDEN_PAGINATION_FANOUT_PASS
B3_PROTECTED_RUNTIME_IDENTITIES_PASS
B3_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS
```

## Independent operation, no-body, and privacy evidence

The seven B3 operations were verified as fixed `seller_api` `POST` `READ`, `execution_enabled: true`, `single_read`, `ALL_ACCOUNTS` operations with fixed entitlement keys and no caller-controlled host, URL, method, headers, or authentication:

- `seller_warehouse_list` — `/v2/warehouse/list`
- `ozon_warehouse_list` — `/v1/warehouse/ozon/list`
- `fbo_seller_warehouse_list` — `/v1/warehouse/fbo/seller/list`
- `cluster_list` — `/v2/cluster/list`
- `fbs_stock_by_warehouse` — `/v2/product/info/stocks-by-warehouse/fbs`
- `fbo_stock_by_warehouse` — `/v1/product/info/stocks-by-warehouse/fbo`
- `stock_analytics` — `/v1/analytics/stocks`

`stocks_current` remains the sole existing operation for `POST /v4/product/info/stocks`; no duplicate `product_stock_core` route was introduced.

The two no-body operations, `fbo_seller_warehouse_list` and `cluster_list`, use `request_style: no_body`, require exactly `{}`, reject arbitrary parameters locally, build `POST` requests with `body === undefined`, and do not send `{}`.

Local contract negatives covered injected URL/headers, unknown fields, invalid warehouse and stock-analysis enums, unsafe/wrong numeric identifiers, out-of-range limits, conflicting `cluster_ids` plus `macrolocal_cluster_ids`, and non-empty no-body parameters. No provider transport was invoked. No hidden retry, cursor/has-next continuation, fanout, report workflow, write operation, credential exposure, provider ownership change, timer/reset, Autorun, or Work-session change was added.

The sanitizer test retained operational warehouse address information and redacted telephone/contact values as `[REDACTED]`; Personal Data mode was not enabled.

## Production identities

| File | SHA-256 |
| --- | --- |
| `shared/ozon_operation_registry.js` | `12f14ca76eeccb34c5f5ef24bc276260a1309af4d31baffbb5e17342ec365f54` |
| `shared/ozon_contract.js` | `3193207d8e3af865e7a01e2c0757e6483fe87aca7719bade0f65ed8a9cd12a75` |
| `shared/ozon_entitlements.js` | `a55b6694e26a96a5267d327a78e4cdd6b27523dbce3eaafb22946072f076e234` |
| `content_script.js` | `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd` |
| `service_worker.js` | `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87` |
| `shared/bridge_autorun_model.js` | `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5` |
| `shared/work_session_model.js` | `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855` |
| `shared/ozon_provider.js` | `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b` |
| `shared/provider_transport_core.js` | `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8` |
| `shared/manual_controls.js` | `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e` |

## Optional artifacts

`OFFICIAL_SWAGGER_COMPILER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: no locally available raw `swagger.json` had the required SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; no replacement was used.

The optional CI artifact ZIP was not locally available and was not independently verified.

## Safety accounting and decision

- Seller business requests: `0`
- Performance requests: `0`
- Tester production modifications: `0`
- Tester changes: this result file only

`PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_INDEPENDENT_TEST_PASS`
