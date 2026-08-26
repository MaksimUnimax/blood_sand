# Patch B4 Orders / Returns / Cancellations — independent test result

## Authority and identities

- Tested commit: `a0e76fd51b8a8110f919bf58a1f80d05a482266a`
- Accepted B3 authority: `56a52174581633bb2c39624492301d9601f99f66`
- Gzip transport SHA-256: `6c4bcb8db9c29ca6112cd918ef2b50a5b68ad9036bf53b4c866081db97b2d1f7`
- Decompressed raw patch SHA-256: `ea93acada395545e428da24eaef4e82a6a6fd2eda113ff349590954e8530591d`
- Materialized 21-file B4 production tree SHA-256: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`

Changed production identities:

| File | SHA-256 |
| --- | --- |
| `shared/ozon_operation_registry.js` | `cfaa168d5a6734b9d5948dbddeef6e090c431e17e5b312d5f536c4418753d8de` |
| `shared/ozon_contract.js` | `6cc19aa7037d9f6952e7e3704e301725ba44c71730db2aa9bb5d9fb1538c66c6` |
| `shared/ozon_entitlements.js` | `973518cbef3cdcfd454e11af3f13b88b4181993234dee89bfb4f807e4fec5fcf` |

Protected runtime identities:

| File | SHA-256 |
| --- | --- |
| `content_script.js` | `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd` |
| `service_worker.js` | `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87` |
| `shared/bridge_autorun_model.js` | `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5` |
| `shared/work_session_model.js` | `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855` |
| `shared/ozon_provider.js` | `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b` |
| `shared/provider_transport_core.js` | `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8` |
| `shared/manual_controls.js` | `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e` |

## Commands executed

```text
git rev-parse HEAD
Get-FileHash PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_2026-08-26.patch.gz
Python gzip decompression and SHA-256 of the raw patch
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_b4_orders_returns_cancellations_candidate.py . D:\codex\Test\ozon-b4-independent-20260826
node PATCH_B1_ASSORTMENT_MASTER_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b4-independent-20260826
node PATCH_B2_PRICES_LISTING_STATE_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b4-independent-20260826
node PATCH_B3_WAREHOUSE_STOCK_GEOGRAPHY_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b4-independent-20260826
node PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_REGRESSION_2026-08-26.mjs D:\codex\Test\ozon-b4-independent-20260826
node --check <each of 18 materialized production JavaScript files>
```

## Observed PASS markers

```text
PATCH_A1_R2_BASE_IDENTITY_PASS
PATCH_A2_A1_BASE_IDENTITY_PASS
PATCH_A3_A2_BASE_IDENTITY_PASS
PATCH_A4_A3_BASE_IDENTITY_PASS
PATCH_A5_A4_BASE_IDENTITY_PASS
PATCH_B0_A5_BASE_IDENTITY_PASS
PATCH_B1_B0_BASE_IDENTITY_PASS
PATCH_B2_B1_BASE_IDENTITY_PASS
PATCH_B3_B2_BASE_IDENTITY_PASS
PATCH_B4_B3_BASE_IDENTITY_PASS
PATCH_B4_GZIP_TRANSPORT_IDENTITY_PASS
PATCH_B4_PATCH_IDENTITY_PASS
PATCH_B4_PATCH_APPLY_PASS
PATCH_B4_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B4_CHANGED_FILE_IDENTITIES_PASS
PATCH_B4_PROTECTED_B3_IDENTITIES_PASS
PATCH_B4_TREE_MANIFEST_SHA256_PASS
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
B4_ORDERS_RETURNS_REGISTRY_PASS
B4_ORDERS_RETURNS_EXACT_REQUEST_PASS
B4_ORDERS_RETURNS_CONTRACT_PASS
B4_ORDERS_RETURNS_ENTITLEMENTS_PASS
B4_ORDERS_RETURNS_GUIDANCE_PASS
B4_SAFE_PROJECTION_AND_PII_BINDING_PASS
B4_NO_HIDDEN_PAGINATION_REPORT_WORKFLOW_PASS
B4_PROTECTED_RUNTIME_IDENTITIES_PASS
B4_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS
```

## Independent inspection

The seven new fixed, single-read `seller_api` POST operations were verified: `fbs_posting_list`, `fbs_unfulfilled_list`, `returns_list`, `rfbs_returns_list`, `cancel_reason_list`, `order_cancel_status`, and `posting_cancel_status`. Revalidated `posting_fbo_list` and `posting_fbs_get` remain non-duplicated. All use fixed endpoint/entitlement metadata; transport-injection, enum, type, range, mutually-exclusive-time-filter, and unknown-field negatives reject locally before provider execution.

`fbs_posting_list`, `fbs_unfulfilled_list`, `posting_fbs_get`, and `rfbs_returns_list` remain `PERSONAL_DATA_READ_GATED` with `policy_group: personal_data_read`, `default_allowed: false`, conditional guidance, and OFF-setting indication. Personal Data was not enabled and no setting transition or provider replay was performed.

`returns_list` remains READ_SAFE: its sensitive place address is redacted while ordinary product fields remain available. `cancel_reason_list` is exact `no_body`: it accepts only `{}`, rejects non-empty input, builds a POST with `body === undefined`, and does not send `{}`. `return_report_create` is absent; no report creation, polling, retrieval, or fallback workflow exists.

No hidden retry, cursor/last_id continuation, pagination, fanout, write operation, credential exposure, transport ownership change, timer reset, Autorun change, or Work-session change was found.

## Optional artifacts

`OFFICIAL_SWAGGER_COMPILER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: no local raw Swagger with SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` was available; no replacement was used. The optional CI artifact ZIP was likewise unavailable locally.

## Safety accounting and decision

- Seller business requests = `0`
- Performance requests = `0`
- tester production modifications = `0`
- tester changes: this result file only

`PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_INDEPENDENT_TEST_PASS`
