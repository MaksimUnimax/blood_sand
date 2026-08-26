# Patch B2 Prices / Listing State — independent test result

## Authority

- Tested commit: `dab5dadf497e83a90d1d4e93c0131f30ff6667c5`
- Accepted B1 authority commit: `c76a713a40db18fb21eedcf8f35f5a0555845f0f`
- B2 patch SHA-256: `bffc2fc1e1e32f400e89bc3164f582b86a64a7f579af46d231f63baa427dfd63`
- Materialized B2 production-tree SHA-256: `3566796bc960530e230e054cbdaf08b8dd3ef826eb6eba756f4a7d436492f32c`
- Materialized production file count: `21`

## Commands executed

```text
git rev-parse HEAD
(Get-FileHash -Algorithm SHA256 tooling/llm-api-bridges/ozon-seller/validation/PATCH_B2_PRICES_LISTING_STATE_2026-08-26.patch).Hash.ToLower()
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_b2_prices_listing_state_candidate.py . D:\codex\Test\ozon-b2-independent-20260826
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b2-independent-20260826
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B2_PRICES_LISTING_STATE_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b2-independent-20260826
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
B2_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS
```

## Independent operation and security evidence

Inspection and deterministic assertions verified the following fixed `seller_api` `POST` `READ` `json_body` `execution_enabled: true` `single_read` operations:

- `product_prices_bulk` — `POST /v5/product/info/prices`, entitlement `ALL_ACCOUNTS`.
- `product_price_details` — `POST /v1/product/prices/details`, entitlement `SUBSCRIPTION_RESTRICTED`, `endpoint_allowed_subscription_types: ["PREMIUM_PRO"]`.
- `seller_actions_list` — `POST /v1/seller-actions/list`, entitlement `ALL_ACCOUNTS`.
- `seller_action_products` — `POST /v1/seller-actions/products/list`, entitlement `ALL_ACCOUNTS`.

The local regression proved fixed URL/method construction and rejected injected `url`, `headers`, a top-level `method` override, unknown filter fields, unsafe uint64 values, invalid enums, and out-of-range limits before provider execution. It also verified the B2 operations retain one-command/one-fixed-request behavior and add no hidden pagination, offset/cursor continuation, fanout, retry, report workflow, write operation, credential exposure, or transport-ownership change.

## Production identities

| File | SHA-256 |
| --- | --- |
| `shared/ozon_operation_registry.js` | `6abe5437515cc757d46038bc09afe19a72a5cd7a6554a3bc8afd35c812a48f40` |
| `shared/ozon_contract.js` | `fd4f5a6db4a3715e9fb07694054e0329a455b58971a1585c237d1b5e06ca1174` |
| `shared/ozon_entitlements.js` | `91fd5e0fe6d3a10a88cae8c837b8e90c45010bd4a4da46c2ff0c964f9b8063a5` |
| `content_script.js` | `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd` |
| `service_worker.js` | `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87` |
| `shared/bridge_autorun_model.js` | `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5` |
| `shared/work_session_model.js` | `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855` |
| `shared/ozon_provider.js` | `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b` |
| `shared/provider_transport_core.js` | `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8` |
| `shared/manual_controls.js` | `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e` |
| `shared/ai_adapters.js` | `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9` |
| `shared/conversation_identity.js` | `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57` |

## Optional artifacts

`OFFICIAL_SWAGGER_COMPILER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: no local `swagger.json` with the required SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` was present. No substitute was downloaded or used.

The optional CI artifact ZIP was not available locally and was not independently verified.

## Safety accounting and decision

- Seller business requests: `0`
- Performance requests: `0`
- Tester production modifications: `0`
- Tester changes: this result file only

`PATCH_B2_PRICES_LISTING_STATE_INDEPENDENT_TEST_PASS`
