# B18 Pricing Strategy Extended Reads — independent test result

- Tested commit: `65374fdff02d2d5c18531109ab524c6b14503350`
- Accepted B17 authority: `87626dbe2b9192f8c0c6bc6cd58ebbbce70c76e7`
- Direct parent and one-commit ancestry: PASS. The direct delta contains only the six authorized B18 workflow/validation files and no directly committed production extension file.
- Gzip patch SHA-256: `fa25cda2f81db2fc0a969a40bc6469c4dc645d494be69c4986cef0566e16b834` — PASS.
- Raw patch SHA-256: `5900c5e7d2b4080505ff39d5bfb6d07025592817760635aa3aa813cbddae85a6` — PASS.
- Materialized production tree: 21 files; SHA-256 `300e1fe642cf0bb108f39d3e35fd4f8d97140e60ae4cc76361407685d2b0ad75` — PASS.

Changed production identities PASS:

- `shared/ozon_operation_registry.js`: `af9d4b0f90f7daf995364edae3e8c4fcaf7fc640d79b9efc4cc82a8a796058f8`
- `shared/ozon_contract.js`: `ef52a12406b2161ef4a53faefd61b86a315c3de83bb8c59b594d2240e2975f7b`
- `shared/ozon_entitlements.js`: `bd0f6a2d867f7d0e2e1c65b1dce843f02cf45a88945b0acb9f9f9afb12707ad8`

Protected runtime identities all PASS: `content_script.js` `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`; `service_worker.js` `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`; `bridge_autorun_model.js` `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`; `work_session_model.js` `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`; `ozon_provider.js` `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`; `provider_transport_core.js` `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`; `manual_controls.js` `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`; `ozon_guidance.js` `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`.

## Commands and markers

```text
C:\Users\unyma\AppData\Local\Programs\Python\Python311\python.exe tooling\llm-api-bridges\ozon-seller\validation\materialize_patch_b18_pricing_strategy_extended_reads_candidate.py --repo-root D:\codex\Test\ozon-b18-independent-source-20260827 --work-root D:\codex\Test\ozon-b18-work-20260827 --out D:\codex\Test\ozon-b18-independent-20260827
PATCH_B18_B17_BASE_IDENTITY_PASS
PATCH_B18_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B18_PATCH_APPLY_PASS
PATCH_B18_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B18_CHANGED_FILE_IDENTITIES_PASS
PATCH_B18_PROTECTED_B17_IDENTITIES_PASS
PATCH_B18_TREE_MANIFEST_SHA256_PASS
```

All predecessor A1–A5 and B0–B17 materializer gates passed.  B17 accepted-base regression passed all eight B17 markers.  B18 regression passed:

```text
B18_PRICING_STRATEGY_EXTENDED_REGISTRY_PASS
B18_PRICING_STRATEGY_EXTENDED_EXACT_REQUEST_PASS
B18_PRICING_STRATEGY_EXTENDED_CONTRACTS_PASS
B18_PRICING_STRATEGY_EXTENDED_ENTITLEMENTS_PASS
B18_PRICING_STRATEGY_EXTENDED_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B18_PRICING_STRATEGY_EXTENDED_PROTECTED_RUNTIME_IDENTITIES_PASS
B18_SYNTAX_PASS JS=18
```

The regression passed both fixed single-read Seller API contracts: `pricing_strategy_competitors` (`POST /v1/pricing-strategy/competitors/list`, safe integer page >=1 and limit 1..50, explicit page only) and `pricing_strategy_ids_by_product_ids` (`POST /v1/pricing-strategy/strategy-ids-by-product-ids`, string int64 product IDs, maximum 50, no invented minimum). It rejects invalid/unsafe/injected data; 51 IDs are rejected rather than split. Both are `READ_SAFE`, safe projection, current, JSON-body, all-accounts reads with no capability probe or caller-controlled transport.

The regression passed exclusion of all listed pricing mutations, preservation of existing pricing reads and B17–B7 behavior, and no arrays, page loops, automatic pagination/retry, fanout, chained details or provider chaining.

`B18_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

No exact local raw Seller Swagger was available, so no substitute was downloaded or used. The named CI artifact was not downloaded because GitHub Actions CLI tooling is unavailable in this environment; this is non-failing after exact independent materialization.

- Seller business requests: `0`
- Performance business requests: `0`
- Credentials used: `0`
- Tester production modifications: `0`

PATCH_B18_PRICING_STRATEGY_EXTENDED_READS_INDEPENDENT_TEST_PASS
