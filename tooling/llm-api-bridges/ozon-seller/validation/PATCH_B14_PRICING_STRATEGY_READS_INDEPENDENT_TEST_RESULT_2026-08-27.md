# B14 Pricing Strategy Reads — independent test result

- Tested commit: `3fc4676506c76bf874e4e6443c96188066c365de`
- Accepted B13 authority/direct parent: `3e48f78a8a0aa0d2bb0e52d7f64bb3bb5fe03605`
- Gzip/raw patch SHA-256: `b1f9839614e91372404928aa77200450fa120df52fd90fd36a326bfc5339f3ee` / `0c98be2b82c800987b1a8c76e5ef86dcfe53ee5206e80d9fd9aac32e92f38ace`
- Materialized 21-file B14 tree: `fb4877ad074f86d0a855d51b67bcb5b574a2bfc88727f63b83927ff5eb8e64fa`

The direct Git delta contains only the authorized workflow, transport patch, materializer, regression, and candidate evidence; no production extension file is directly committed.

Changed identities match authority: registry `b51d634d4d8caf9f3489cf59ac9ebe7787798973f90625f90c33615514e06955`; contract `3596f5b786b563d240d640a770fbc94960da771342bd48777f76979950e6c54d`; entitlements `05afac352727856cff1084fba9b6fd25532a9e6c2e2c16c3a0e972e2ee07f4a5`.

Commands: exact checkout/direct-delta verification, gzip/raw SHA verification, B14 materializer, B13 regression on exact chained B13 base, B14 regression, and `node --check` for all 18 production JavaScript files.

```text
PATCH_B14_B13_BASE_IDENTITY_PASS
PATCH_B14_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B14_PATCH_APPLY_PASS
PATCH_B14_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B14_CHANGED_FILE_IDENTITIES_PASS
PATCH_B14_PROTECTED_B13_IDENTITIES_PASS
PATCH_B14_TREE_MANIFEST_SHA256_PASS
B14_PRICING_STRATEGY_REGISTRY_PASS
B14_PRICING_STRATEGY_EXACT_REQUEST_PASS
B14_PRICING_STRATEGY_CONTRACTS_PASS
B14_PRICING_STRATEGY_ENTITLEMENTS_PASS
B14_PRICING_STRATEGY_URL_DATA_ONLY_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS
B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B14_PRICING_STRATEGY_PROTECTED_RUNTIME_IDENTITIES_PASS
B14_SYNTAX_PASS
```

The four fixed all-account reads passed exact contract checks: `pricing_strategy_list`, `pricing_strategy_info`, `pricing_strategy_products`, and `pricing_strategy_product_info`. The status mutation route is absent. Competitor URLs are response data only: no URL opening/fetching, pagination, retry, fanout, chaining, or capability probe is enabled.

Protected runtime identities passed for content script, service worker, Autorun, Work-session, provider, transport, Manual controls, and guidance.

`B14_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: exact raw Swagger and optional CI artifact were unavailable locally; no substitute was used.

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`
- tester change: this result file only

`PATCH_B14_PRICING_STRATEGY_READS_INDEPENDENT_TEST_PASS`
