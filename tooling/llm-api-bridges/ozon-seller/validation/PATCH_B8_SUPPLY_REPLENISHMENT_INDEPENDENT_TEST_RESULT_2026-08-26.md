# Patch B8 Supply / Replenishment — independent test result

- Tested commit: `d40d213de9c6d753f21525a4797671401d585218`
- Accepted B7 authority: `3769590c49e3deb5951769b3a27c79706a4f3ba9`
- Gzip patch SHA-256: `2b407798ee27593c88239131234780b7a7d8dcf29ed7a7104f439a41a64f26b7`
- Raw patch SHA-256: `b3b685b928857d31bc2de6bf65f761c39ab66391c439ce8a65ecb38f7e83ec86`
- Materialized 21-file B8 tree SHA-256: `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`

Changed production identities:

- `shared/ozon_operation_registry.js`: `a2ecd81db1862281bd5dc12284a16c46e1ad61cab48a4c7406b50245d8dcd796`
- `shared/ozon_contract.js`: `49dfac7276311b391bc9918348edca0086e5832de359a693c10e6d912487e447`
- `shared/ozon_entitlements.js`: `cee472cfe526776a774c173033f1c94769b79d926668ffe892194fb4dbaab6bc`

Commands: exact Git checkout; gzip/raw SHA verification; `materialize_patch_b8_supply_replenishment_candidate.py`; B1–B6 regressions on B8; B7 regression on the materializer-created B7 base; B8 regression; `node --check` for all 18 production JS files.

Observed B8 PASS markers:

```text
PATCH_B8_B7_BASE_IDENTITY_PASS
PATCH_B8_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B8_PATCH_APPLY_PASS
PATCH_B8_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B8_CHANGED_FILE_IDENTITIES_PASS
PATCH_B8_PROTECTED_B7_IDENTITIES_PASS
PATCH_B8_TREE_MANIFEST_SHA256_PASS
B8_SUPPLY_REPLENISHMENT_REGISTRY_PASS
B8_SUPPLY_REPLENISHMENT_EXACT_REQUEST_PASS
B8_SUPPLY_REPLENISHMENT_CONTRACTS_PASS
B8_B7_ANALYTICS_SEMANTICS_CARRY_FORWARD_PASS
B8_SUPPLY_REPLENISHMENT_SAFE_PROJECTION_PASS
B8_SUPPLY_REPLENISHMENT_GUIDANCE_ZERO_REQUEST_PASS
B8_SUPPLY_REPLENISHMENT_PROTECTED_RUNTIME_IDENTITIES_PASS
B8_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS
```

All B1–B6 carry-forward markers passed. The required B7 regression passed on `<work-root>/b7-base` and its analytics entitlement semantics were independently carried forward on B8.

Six exact current fixed Seller reads were verified: `supply_order_list`, `supply_order_get`, `supply_order_status_counter` (no-body POST), `supply_order_bundle`, `supply_order_timeslot_list` (v2), and `supply_order_details`. Contract negatives, strict identifier types, no pagination/fanout, legacy-route exclusion, currentness, and safe projection passed. Details redact `driver_name`, `driver_phone`, and `vehicle_number` while allowed operational warehouse addresses remain available.

B7 semantics remain intact on B8: fixed analytics/search routes and worker quota constants are unchanged; `premium-program` is not `PREMIUM_PRO`, while `podpiska-premium-pro` is.

Protected runtime hashes passed for content script, service worker, Autorun, Work-session, provider, transport, and Manual controls.

`B8_EXACT_SELLER_SWAGGER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`: no exact raw Seller Swagger was locally available. The optional CI artifact was not locally available; no substitutes were downloaded or used.

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`
- tester change: this result file only

`PATCH_B8_SUPPLY_REPLENISHMENT_INDEPENDENT_TEST_PASS`
