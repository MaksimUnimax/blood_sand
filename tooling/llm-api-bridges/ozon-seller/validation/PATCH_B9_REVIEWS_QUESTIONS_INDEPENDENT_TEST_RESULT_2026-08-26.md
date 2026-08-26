# Patch B9 Reviews / Questions — independent test result

- Tested commit: `ae222f9a07d8fd4ca40f4894cbe2baf01ae71887`
- Accepted B8 authority: `600a6922fd3f339fb2d57bc3828d51ecba1670d7`
- Gzip patch SHA-256: `5974889dffd45003b505d8be4d088366fdd5118578ca96358d609e0797704e7f`
- Raw patch SHA-256: `b938688273bbf66732d9c45b4765e7a87db94f5e1d6a1a5ce2ccc1060aa4bb8a`
- Materialized 21-file B9 tree SHA-256: `d955dbfd1a667e40ea0cb04374b31e0cfe95bbf75b3b355d11c50d10f748a6d5`

Changed production hashes match authority:

- `shared/ozon_operation_registry.js`: `e157dfa70ecddc2d473d5968e045448f8d5693ed6553063798b417743a1d88eb`
- `shared/ozon_contract.js`: `e80b3d07f6deef12412e8ddfc99dad4ad62236b932ed2a7246b8afb90c9ef674`
- `shared/ozon_entitlements.js`: `8f006b298fb4bdff969ba4cca54f796821bacc124c078203d6e2f49fd418df70`

Commands: exact Git checkout; gzip/raw SHA verification; B9 materializer; B1–B6 regressions on B9; B7 regression on `<work-root>/b8-work/b7-base`; B8 regression on `<work-root>/b8-base`; B9 regression; `node --check` for all 18 production JS files.

Observed B9 markers:

```text
PATCH_B9_B8_BASE_IDENTITY_PASS
PATCH_B9_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B9_PATCH_APPLY_PASS
PATCH_B9_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B9_CHANGED_FILE_IDENTITIES_PASS
PATCH_B9_PROTECTED_B8_IDENTITIES_PASS
PATCH_B9_TREE_MANIFEST_SHA256_PASS
B9_REVIEWS_QUESTIONS_REGISTRY_PASS
B9_REVIEWS_QUESTIONS_EXACT_REQUEST_PASS
B9_REVIEWS_QUESTIONS_CONTRACTS_PASS
B9_REVIEWS_QUESTIONS_PERSONAL_DATA_GATE_CONTRACT_PASS
B9_REVIEWS_QUESTIONS_ENTITLEMENT_PLANNING_PASS
B9_B8_SUPPLY_AND_B7_ENTITLEMENT_SEMANTICS_CARRY_FORWARD_PASS
B9_REVIEWS_QUESTIONS_GUIDANCE_ZERO_REQUEST_PASS
B9_REVIEWS_QUESTIONS_PROTECTED_RUNTIME_IDENTITIES_PASS
B9_SYNTAX_PASS
```

All B1–B8 prescribed carry-forward markers passed. The B9 surface is exactly fixed Seller reads `review_list` (`POST /v2/review/list`), `review_info` (`POST /v2/review/info`), and `question_list` (`POST /v1/question/list`); obsolete v1 review routes are not promoted. Deterministic checks cover fixed transport, strict request contracts, zero-request guidance, Personal Data gate contract, entitlement planning, and B7/B8 semantics. No mutation, retry, pagination, fanout, or provider request was enabled.

Protected runtime hashes passed for content script, service worker, Autorun, Work-session, provider, transport, Manual controls, and guidance.

`B9_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: exact Seller Swagger was unavailable locally and not substituted. Optional CI artifact was not locally available.

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`
- tester change: this result file only

`PATCH_B9_REVIEWS_QUESTIONS_INDEPENDENT_TEST_PASS`
