# Patch B6 Performance API Read Core — independent test result

- Tested commit: `d54bd90179454159c22c5db1f3743a0357dbe23f`
- Accepted B5 authority: `e296ff76b975470e8e12e566e2c4aff29adea00c`
- Gzip patch SHA-256: `04f4151c035b14698107e3e7a54cf6da3c4f137b7a294db976e8df2d5a9c2ac9`
- Raw patch SHA-256: `2b780f1d4bba1e6b4bf2b2a8d6072163bd534f505c63a2f209b95dc21c4bfd9f`
- Materialized 21-file tree SHA-256: `2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`

Commands executed: exact Git checkout; SHA-256 gzip/raw verification; `materialize_patch_b6_performance_read_core_candidate.py`; B1, B2, B3, B4, B5, and B6 deterministic regressions; `node --check` for each of 18 production JavaScript files.

Observed B6 markers:

```text
PATCH_B6_B5_BASE_IDENTITY_PASS
PATCH_B6_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B6_PATCH_APPLY_PASS
PATCH_B6_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B6_CHANGED_FILE_IDENTITIES_PASS
PATCH_B6_PROTECTED_B5_IDENTITIES_PASS
PATCH_B6_TREE_MANIFEST_SHA256_PASS
B6_PERFORMANCE_REGISTRY_PASS
B6_PERFORMANCE_EXACT_REQUEST_PASS
B6_PERFORMANCE_CONTRACTS_PASS
B6_PERFORMANCE_ASYNC_REPORT_SIDE_EFFECTS_BLOCKED_PASS
B6_PERFORMANCE_MUTATIONS_STAY_BLOCKED_PASS
B6_PERFORMANCE_NO_SELLER_CAPABILITY_PROBE_PASS
B6_PERFORMANCE_GUIDANCE_ZERO_REQUEST_PASS
B6_PERFORMANCE_EXISTING_JSON_ROUTES_PRESERVED_PASS
B6_PERFORMANCE_PROTECTED_RUNTIME_IDENTITIES_PASS
B6_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS
```

All applicable B1–B5 carry-forward regression markers also passed.

Changed identities:

- `shared/ozon_operation_registry.js`: `d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b`
- `shared/ozon_contract.js`: `e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7`
- `shared/ozon_entitlements.js` unchanged: `e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`

Protected runtime identities passed: `content_script.js`, `service_worker.js`, `bridge_autorun_model.js`, `work_session_model.js`, `ozon_provider.js`, `provider_transport_core.js`, and `manual_controls.js` match their accepted B5 hashes.

Independent regression inspection verified only these six fixed read operations: `performance_campaign_objects`, `performance_bid_limits`, `performance_campaign_products`, `performance_search_promo_products`, `performance_media`, and `performance_sku_statistics`. It covered strict string-uint64 `campaignId` path replacement, fixed `/json` routes, caller-controlled one-request pagination fields with no continuation, local transport-injection rejection, blocked async report side effects, blocked mutations, and no Seller capability probe for Performance reads. Existing Performance JSON routes remain exact.

`B6_EXACT_PERFORMANCE_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: the exact raw `swagger(1).json` authority (304771 bytes, SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`) was not available locally. No substitute was used. Optional CI artifact was not locally available.

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`
- tester change: this result file only

`PATCH_B6_PERFORMANCE_READ_CORE_INDEPENDENT_TEST_PASS`
