# B15 Catalog Reference Reads — independent test result

## Authority and candidate identity

- Tested commit: `efd4bd964392c686ff48b5d4d260d070a274055b`
- Accepted B14 authority: `b3f16b6d9cc318aa1721fd12c52efc1b2714e9a1`
- Direct parent: PASS; commit distance: `1`.
- Direct delta: PASS; it contains only the six authorized workflow/validation transport, materializer, regression, evidence, and manifest files.  No production extension file is directly committed.
- Gzip patch SHA-256: `56ec5f5714df257875cafe01a861e55281bf1332984d52a8b692870e9b4e2f82` — PASS.
- Decompressed raw patch SHA-256: `02db694b62064385d830ddb1c78ff625f5a47ee61de2bd7cf5fd6d6b82907d3f` — PASS.
- Materialized production tree: 21 files; SHA-256 `401692a486696189cc9bf81f58fd2066fe3babfb087747a7ccbb8519bacce07f` — PASS.

Changed production identities all PASS:

- `shared/ozon_operation_registry.js`: `2b2821c8a19095c4cc21b6a819cb0f7c632d0eba369b272e8adc4761268069e4`
- `shared/ozon_contract.js`: `8bb6f6419cce892d0e7eb1a425039c83b55319d6df91f69666d981615b9a53bf`
- `shared/ozon_entitlements.js`: `112fabe641f9be2f32c23f9cbdcf4e86d20f9016c52b7a0c80a00c48dc01c1e4`

Protected B14 runtime identities all PASS:

- `content_script.js`: `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js`: `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js`: `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js`: `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js`: `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js`: `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js`: `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_guidance.js`: `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`

## Commands and materialization evidence

Executed repository materializer:

```text
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling\llm-api-bridges\ozon-seller\validation\materialize_patch_b15_catalog_reference_reads_candidate.py --repo-root D:\codex\Test\ozon-b15-independent-source-20260827 --work-root D:\codex\Test\ozon-b15-work-20260827 --out D:\codex\Test\ozon-b15-independent-20260827
```

Required B15 markers all PASS:

```text
PATCH_B15_B14_BASE_IDENTITY_PASS
PATCH_B15_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B15_PATCH_APPLY_PASS
PATCH_B15_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B15_CHANGED_FILE_IDENTITIES_PASS
PATCH_B15_PROTECTED_B14_IDENTITIES_PASS
PATCH_B15_TREE_MANIFEST_SHA256_PASS
```

The materializer also passed all predecessor identity gates A1–A5 and B0–B14.

Accepted-base command and result:

```text
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B14_PRICING_STRATEGY_READS_REGRESSION_2026-08-27.mjs D:\codex\Test\ozon-b15-work-20260827\b14-base
B14_PRICING_STRATEGY_REGISTRY_PASS
B14_PRICING_STRATEGY_EXACT_REQUEST_PASS
B14_PRICING_STRATEGY_CONTRACTS_PASS
B14_PRICING_STRATEGY_ENTITLEMENTS_PASS
B14_PRICING_STRATEGY_URL_DATA_ONLY_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B14_PRICING_STRATEGY_PROTECTED_RUNTIME_IDENTITIES_PASS
```

## B15 regression and contracts

Executed:

```text
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B15_CATALOG_REFERENCE_READS_REGRESSION_2026-08-27.mjs D:\codex\Test\ozon-b15-independent-20260827
```

All required markers PASS:

```text
B15_CATALOG_REFERENCE_REGISTRY_PASS
B15_CATALOG_REFERENCE_EXACT_REQUEST_PASS
B15_CATALOG_REFERENCE_CONTRACTS_PASS
B15_CATALOG_REFERENCE_ENTITLEMENTS_PASS
B15_CATALOG_REFERENCE_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B15_CATALOG_REFERENCE_PROTECTED_RUNTIME_IDENTITIES_PASS
B15_SYNTAX_PASS JS=18
```

The regression proves the four fixed, single-read Seller API operations and their contracts:

- `description_category_tree`: `POST /v1/description-category/tree`; optional `language` is restricted to `DEFAULT`, `RU`, `EN`, `TR`, `ZH_HANS`; `{}` is valid.
- `description_category_attributes`: `POST /v1/description-category/attribute`; safe-integer `description_category_id` and `type_id` are required; `language` has the same fixed enum.
- `description_category_attribute_values`: `POST /v1/description-category/attribute/values`; safe-integer `attribute_id`, `description_category_id`, `type_id` and `limit` are required; limit is `1..2000`; `last_value_id` is explicit input only.
- `description_category_attribute_values_search`: `POST /v1/description-category/attribute/values/search`; required safe-integer IDs, limit `1..100`, and a search value of at least two characters.

For every operation the regression passed fixed Seller host/path/method/header/authorization handling, `READ` / `READ_SAFE` / `safe_projection`, `seller_api`, JSON-body single-read execution, currentness, catalog-products/attributes-categories user guidance, no caller-controlled transport, and exactly one request object per normalized command.  It passed rejection of unknown/injection fields and invalid bounds/types.  It also passed no automatic `last_value_id` following, no pagination, retries, fanout, chaining, or provider chaining.

Entitlements PASS: all four keys are known, not required, and plan for execution without Seller capability information; no subscription probe is introduced.  The B15 regression also passed prior pricing/actions/rating/review/supply paths, preserved review and question entitlement behavior, Premium parser distinction, and analytics timing constants.

## External evidence status

`B15_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

No local raw `swagger.json` exists, so the exact-Swagger optional rerun was not performed and no substitute was downloaded or used.  This is allowed by the test instruction and does not invalidate the exact candidate/regression results.

The named GitHub Actions artifact was not downloaded: the local environment has no `gh` executable for the requested run/artifact lookup.  CI artifact retrieval is optional under the instruction; independent exact materialization passed.

## Safety accounting

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B15_CATALOG_REFERENCE_READS_INDEPENDENT_TEST_PASS
