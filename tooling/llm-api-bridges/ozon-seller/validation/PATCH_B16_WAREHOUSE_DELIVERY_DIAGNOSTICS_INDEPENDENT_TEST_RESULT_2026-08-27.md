# B16 Warehouse / Delivery Diagnostics — independent test result

## Tested authority

- Tested commit: `a3e0586f5d16d063b12d71863b90626b26d32a33`
- Accepted B15 authority: `09af95fe2aa2ab05adf11d0500fd358e19d013e4`
- Direct parent and one-commit ancestry: PASS.
- Direct Git delta: PASS.  It contains only the six authorized workflow/validation transport, materializer, regression, evidence, and manifest files; no production extension file is directly committed.
- Gzip patch SHA-256: `c67470516706c723dc4d9d4b199624cc3a354c3ef8082b10db5f3d2bceacdf5e` — PASS.
- Decompressed raw patch SHA-256: `7655c1b793a40321c8b640ce6b5cc05c2df922194900eff27dcef73ace8cd756` — PASS.
- B16 materialized tree: 21 production files, SHA-256 `03953160b440712f202c5e710226d93ceb540e132d8e821ea4763904a8b887eb` — PASS.

Changed production identities PASS:

- `shared/ozon_operation_registry.js`: `e85a2033a4cc07141c221fdece96aacfe260e475b03d91937ac5a67f5d4e2ba2`
- `shared/ozon_contract.js`: `a7d640f88a7830da39c3c75dba7fa93455ee2eca10fb42391c77c19ec919c162`
- `shared/ozon_entitlements.js`: `96cb9045df3a3d651a801bdc3d5e694bfe520a51b612f23ad593b9b3fae47648`

Protected B15 runtime identities all PASS:

- `content_script.js`: `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js`: `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js`: `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js`: `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js`: `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js`: `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js`: `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_guidance.js`: `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`

## Materialization and regression evidence

Executed repository materializer:

```text
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling\llm-api-bridges\ozon-seller\validation\materialize_patch_b16_warehouse_delivery_diagnostics_candidate.py --repo-root D:\codex\Test\ozon-b16-independent-source-20260827 --work-root D:\codex\Test\ozon-b16-work-20260827 --out D:\codex\Test\ozon-b16-independent-20260827
```

Required B16 markers all PASS:

```text
PATCH_B16_B15_BASE_IDENTITY_PASS
PATCH_B16_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B16_PATCH_APPLY_PASS
PATCH_B16_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B16_CHANGED_FILE_IDENTITIES_PASS
PATCH_B16_PROTECTED_B15_IDENTITIES_PASS
PATCH_B16_TREE_MANIFEST_SHA256_PASS
```

All predecessor materialization identity gates A1–A5 and B0–B15 also passed.

Accepted B15 base regression passed:

```text
B15_CATALOG_REFERENCE_REGISTRY_PASS
B15_CATALOG_REFERENCE_EXACT_REQUEST_PASS
B15_CATALOG_REFERENCE_CONTRACTS_PASS
B15_CATALOG_REFERENCE_ENTITLEMENTS_PASS
B15_CATALOG_REFERENCE_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B15_CATALOG_REFERENCE_PROTECTED_RUNTIME_IDENTITIES_PASS
```

B16 regression passed:

```text
B16_WAREHOUSE_DELIVERY_REGISTRY_PASS
B16_WAREHOUSE_DELIVERY_EXACT_REQUEST_PASS
B16_WAREHOUSE_DELIVERY_CONTRACTS_PASS
B16_WAREHOUSE_DELIVERY_ENTITLEMENTS_PASS
B16_WAREHOUSE_DELIVERY_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B16_WAREHOUSE_DELIVERY_PROTECTED_RUNTIME_IDENTITIES_PASS
B16_SYNTAX_PASS JS=18
```

## B16 contract and safety results

The regression passed all four fixed Seller API single-read contracts, each with provider `seller_api`, effect `READ`, `READ_SAFE`, safe projection, currentness, execution enabled, warehouse-logistics guidance, no caller-controlled transport or authorization material, and exactly one physical request object per command:

- `seller_delivery_method_list`: `POST /v2/delivery-method/list`; `limit` integer/int64 `1..100`; explicit cursor only; `sort_dir` restricted to `ASC`/`DESC`; delivery-method/provider/warehouse ID filters accept only string int64 values (maximum 100 each); status is restricted to the six specified values.
- `delivery_method_return_settings`: `POST /v1/delivery-method/return/settings/get`; requires a safe-integer `delivery_method_id`.
- `warehouse_invalid_products`: `POST /v1/warehouse/invalid-products/get`; requires a safe-integer `warehouse_id`; optional safe-integer `last_id` is explicit only.
- `warehouses_with_invalid_products`: `POST /v1/warehouse/warehouses-with-invalid-products`; accepts only `{}` and creates POST with `body = undefined`.

Invalid types, unsafe integers, bound violations, unknown fields, and transport injection fields were rejected.  No cursor/`last_id` loop, automatic pagination, retry, warehouse or delivery-method fanout, chained detail call, or provider chaining is enabled.  The legacy `POST /v1/delivery-method/list` route is excluded; the executable route is v2 only.

Entitlements PASS: each B16 key is known and not required; planning executes without Seller capability information and creates no subscription capability probe.  Existing `seller_warehouse_list` and all listed B15/B14/B13/B12/B11/B10/B9/B8/B7 paths/entitlements, Premium parser distinction, review/question behavior, and analytics constants remain covered by carry-forward regression.

## External evidence status

`B16_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

The exact raw Seller Swagger was not present locally, so no substitute was downloaded or used and the optional exact-Swagger rerun was not executed.  This condition is explicitly non-failing under the instruction.

The named GitHub Actions run/artifact was not downloaded because no `gh` executable is installed in the tester environment.  Artifact availability is optional when independent exact materialization succeeds.

## Safety accounting

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B16_WAREHOUSE_DELIVERY_DIAGNOSTICS_INDEPENDENT_TEST_PASS
