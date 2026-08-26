# Patch B7 Analytics / Search — independent test result

- Tested commit: `27f1b2d0e94282ff45eae2be27a1e03170e422c7`
- Accepted B6 authority: `d6ec73e48e3ad51da23323016b2dcdf34f21ef0c`
- Gzip patch SHA-256: `a3d88d1be345254aa99522f148c01907111bbd3d87463b22d632f5ea0f15fb3a`
- Raw patch SHA-256: `4c1de93a97938f9541936cd1edf8060a21b93acf19b296f16cf81a4994cfeac4`
- Materialized 21-file B7 tree SHA-256: `dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c`
- Sole changed production file: `shared/ozon_entitlements.js` = `c22377e2224564646ca29637491e9cb719a466adee68d1ca2bebf0a80b3c7530`

Commands: exact Git checkout; gzip/raw SHA verification; `materialize_patch_b7_analytics_search_candidate.py`; B1–B6 carry-forward regressions; B7 regression; `node --check` for all 18 production JS files.

Observed B7 PASS markers:

```text
PATCH_B7_B6_BASE_IDENTITY_PASS
PATCH_B7_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B7_PATCH_APPLY_PASS
PATCH_B7_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B7_CHANGED_FILE_IDENTITY_PASS
PATCH_B7_PROTECTED_B6_IDENTITIES_PASS
PATCH_B7_TREE_MANIFEST_SHA256_PASS
B7_ANALYTICS_SEARCH_REGISTRY_PASS
B7_ANALYTICS_SEARCH_EXACT_REQUEST_PASS
B7_ANALYTICS_SEARCH_CONTRACTS_PASS
B7_ANALYTICS_PREMIUM_PRO_URL_FALSE_POSITIVE_BLOCKED_PASS
B7_ANALYTICS_SEARCH_GUIDANCE_ZERO_REQUEST_PASS
B7_ANALYTICS_QUOTA_RUNTIME_PRESERVED_PASS
B7_ANALYTICS_PROTECTED_B6_IDENTITIES_PASS
B7_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS
```

All B1–B6 carry-forward regression markers passed.

Independent checks confirmed that the three fixed P1 reads remain `analytics_data`, `product_queries`, and `product_queries_details`, each fixed `seller_api` POST JSON single-read with no injection, pagination, fanout, or B7 retry. The unchanged worker retains `ANALYTICS_MIN_INTERVAL_MS = 60_000` and `ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000`.

The exact false-positive regression passed: `premium-program` resolves as `PREMIUM`, not `PREMIUM_PRO`; real `podpiska-premium-pro` still resolves as `PREMIUM_PRO`; ordinary Premium/Premium Plus detection remains correct. Product-query operations remain `ALL_ACCOUNTS_PARTIAL_RESPONSE`; B7 only narrows the false field-level Premium-Pro URL match.

Protected B6 identities passed for registry, contract, content script, service worker, Autorun, Work-session, provider, transport, and Manual controls.

`B7_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: the exact raw Seller Swagger was unavailable locally; no substitute or download was used. Optional CI artifact was also unavailable locally.

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`
- tester change: this result file only

`PATCH_B7_ANALYTICS_SEARCH_INDEPENDENT_TEST_PASS`
