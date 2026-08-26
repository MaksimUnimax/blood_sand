# Patch B1 Assortment Master — independent test result

## Authority

- Tested commit: `28b639953e350b5bd89aad4451b1c6077cd22380`
- B1 implementation parent: `99b3cc6ef187eeabb1ddf300394470f5f2319fb7`
- B1 patch SHA-256: `b5d5cec8a4c72b74374c41704b219dadfaf98001d0e2f3ca8734311fe1e08a41`
- Materialized 21-file production-tree SHA-256: `2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740`

The preceding Windows checkout failure (patch SHA-256 `11b6723fcd57ed94172d834aa7d488ca98ef4bb75ad8caf17d0d2d625e5f7a1f`) was recorded before this run. This fresh checkout at the authority commit produced the required patch SHA-256 and therefore establishes it as an EOL/checkout-policy validation failure, not a B1 production implementation failure.

## Commands executed

```text
git rev-parse HEAD
(Get-FileHash -Algorithm SHA256 tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_2026-08-26.patch).Hash.ToLower()
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_b1_assortment_master_candidate.py . D:\codex\Test\ozon-b1-independent-20260826-v2
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b1-independent-20260826-v2
node --check <each of 18 JavaScript files in the materialized production tree>
```

## Materialization markers

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
```

## Regression and inspection evidence

```text
B1_ASSORTMENT_REGISTRY_PASS
B1_ASSORTMENT_EXACT_REQUEST_PASS
B1_ASSORTMENT_CONTRACT_PASS
B1_ASSORTMENT_ENTITLEMENTS_PASS
B1_ASSORTMENT_GUIDANCE_PASS
B1_NO_HIDDEN_PAGINATION_FANOUT_PASS
B1_PROTECTED_B0_IDENTITIES_PASS
B1_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS (18 JavaScript files)
```

Independent inspection confirmed each implemented operation is a `seller_api`, `POST`, `READ`, `json_body`, `execution_enabled: true`, `single_read` operation with its exact fixed endpoint and entitlement key:

- `seller_product_list`: `POST /v3/product/list`
- `seller_product_info_list`: `POST /v3/product/info/list`
- `seller_product_attributes`: `POST /v4/product/info/attributes`

The bundled entitlement entries are `ALL_ACCOUNTS`. The regression executed local rejection checks for injected `url` and `headers`, confirmed exact fixed URLs/methods, normalizer constraints, and one-request/no-hidden-pagination-or-fanout behavior. No provider transport was invoked.

## Production identities

| File | SHA-256 |
| --- | --- |
| `shared/ozon_operation_registry.js` | `286f7746a3c45601dd973cba51d604778ae34d6911c323e818e5756eff7f0853` |
| `shared/ozon_contract.js` | `c633b190a4353501c7b683a8bbbdb799a8b5ae78520a6187fbb874449b64b1b1` |
| `shared/ozon_entitlements.js` | `ede46ce2112d8c07c70855e37dbac2ac82c7fa9746d5c2cf3e4f8c1d75022764` |
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

`OFFICIAL_SWAGGER_COMPILER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: no local raw `swagger.json` with the required SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` was available. No substitute was downloaded or inferred.

The referenced CI artifact ZIP was not available locally, so its optional independent ZIP verification was not re-executed.

## Safety accounting and decision

- Seller business requests: `0`
- Performance requests: `0`
- Tester production modifications: `0`
- Tester changes: this result file only

`PATCH_B1_ASSORTMENT_MASTER_INDEPENDENT_TEST_PASS`
