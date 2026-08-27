# B13 Promotions / Market Reads — independent test result

- Tested commit: `fbb1311a9d09938a33e54fbdfaf380075505fa80`
- Accepted B12 authority/direct parent: `1f659c16408c39955e4aa5a5c5faf0c2bee1c905`
- Gzip/raw patch SHA-256: `431165f6690175aa1b788fbeabbc541a6c8595e6df8250336710a7e44524ad07` / `3ae79617e1def360f764382466477c23572db1a80d471626702dbe6351ec7ca3`
- Materialized 21-file B13 tree: `df77a8cff2e446380ec92c38ba818638ab72cae96d2e0f6a2c2b0f1b4ab854b5`

The direct Git delta contains exactly the authorized workflow, B13 transport patch, materializer, regression, and candidate evidence files; no extension production file is directly committed.

Changed identities match authority: registry `a86ade0fb3ed7d9654bab9c1809bbd44a4267bd17c2e7088aec5e23c51dfbe9e`; contract `4aa5d025443bbe178c0812acc98534aedbf2648090f532f0ae897179a46cf08b`; entitlements `bd96f978d2346a9f9a5b2cf083198000ec536e453d3fc0d5dc9743145cc44f08`.

Commands: exact checkout/direct-delta verification, gzip/raw SHA verification, B13 materializer, B11 and B12 regressions on exact chained bases, B13 regression, and `node --check` on all 18 production JavaScript files.

```text
PATCH_B13_B12_BASE_IDENTITY_PASS
PATCH_B13_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B13_PATCH_APPLY_PASS
PATCH_B13_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B13_CHANGED_FILE_IDENTITIES_PASS
PATCH_B13_PROTECTED_B12_IDENTITIES_PASS
PATCH_B13_TREE_MANIFEST_SHA256_PASS
B13_PROMOTIONS_MARKET_REGISTRY_PASS
B13_PROMOTIONS_MARKET_EXACT_REQUEST_PASS
B13_PROMOTIONS_MARKET_CONTRACTS_PASS
B13_PROMOTIONS_MARKET_ENTITLEMENTS_PASS
B13_PROMOTIONS_NO_AUTOPAGINATION_AND_GUIDANCE_ZERO_REQUEST_PASS
B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS
B13_PROMOTIONS_MARKET_PROTECTED_RUNTIME_IDENTITIES_PASS
B13_SYNTAX_PASS
```

The five fixed read operations passed contract verification: `ozon_actions_list` (current GET no-body), `ozon_action_candidates` and `ozon_action_products` (current), and beta `ozon_auto_add_products` plus `ozon_auto_add_candidates`. All are safe-projection, direct all-account reads without capability probes; no host/path/method/header injection, pagination, retry, fanout, chaining, or mutation is enabled. Existing Seller Actions operations remain fixed and enabled.

Protected runtime identities passed for content script, service worker, Autorun, Work-session, provider, transport, Manual controls, and guidance.

`B13_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: exact raw Seller Swagger and optional CI artifact were unavailable locally; no substitute was used.

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`
- tester change: this result file only

`PATCH_B13_PROMOTIONS_MARKET_READS_INDEPENDENT_TEST_PASS`
