# Ozon Bridge v0.1.19 — executable evidence manifest for the permanent pre-operator gate

Date: 2026-08-19
Status: `MANDATORY_EXECUTABLE_EVIDENCE_MANIFEST`
Scope: validation-only. Production/candidate bytes are immutable.

## Purpose

This manifest prevents a top-level validator from declaring a permanent block PASS from a phase marker, a reduced smoke test, a historical PASS report, or packaging success.

The live permanent gate remains authoritative:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
blob SHA `28c82b263e6cbd01c744cbfc046241837f1d253e`.

For every applicable bullet in permanent blocks 01-15 the final runner MUST create an assertion-ledger entry with:

- stable assertion id `B<block>.<ordinal>`;
- exact permanent-gate requirement text or an unambiguous normalized equivalent;
- `executed: true`;
- `pass: true|false`;
- validation source name and SHA-256 of the exact executable source used;
- exact command/transport used;
- concrete observed evidence (marker/value/count/state transition), not merely a phase marker;
- real-network counters applicable to that assertion.

A block may be literal `PASS` only if every applicable assertion-ledger entry for that block exists, executed, and passed. Missing evidence => block `NOT_PROVEN`/FAIL and no packaging.

Historical reports are architecture/coverage authorities only. Historical PASS results MUST NOT be copied forward as current execution evidence.

## Immutable current candidate

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- inventory: 17 production files
- changed versus frozen artifact: exactly `service_worker.js`, `content_script.js`
- protected: remaining 15 byte-identical.

## Executable evidence authorities

### E1 — current composer-wait targeted harness (mandatory changed-code evidence)

Reconstruct exactly from:

- `development/manual-delivery-composer-wait/targeted-test-parts/00.mjs.part`, blob `ced9b470a6d4dd143303144b3db76888924358c2`
- `01.mjs.part`, blob `401fbe78bbe921affa3adb6f1ddf0cf973a899e2`
- `02.mjs.part`, blob `10638ac5c70e07af7f68e51259113e8be63289f4`
- `03.mjs.part`, blob `42a8e9ee07138eadf62cad80fa584fa532cfc65f`

Expected concatenated bytes `21942`, SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.

Required current markers:

- `TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS`
- `TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS`
- `TARGETED_QUOTA_CACHE_PRESERVED_PASS`
- `TARGETED_OTHER_OWNER_PRESERVED_PASS`
- `TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS`
- `TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS`
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`.

These are necessary but NOT sufficient for blocks 01-14.

### E2 — current composer-wait browser behavior (mandatory block 15 + blocks 10-13 evidence)

Authority manifest commit `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`.
Original exact harness parts:

- blob `b056c2d2b0a6189d310b99944bf14501cc15a6d7`
- blob `18fc993168945659ae22150dcad23d60677a4638`
- concatenated bytes `13352`, SHA-256 `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`.

Because the accepted Windows validator now uses the RERUN18-proven raw-PAGE/direct-worker-CDP substrate, the final runner may port the browser *transport only*. It MUST preserve every behavioral assertion from the pinned harness and emit all exact markers:

- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`.

The port source SHA-256 MUST be recorded and its assertion mapping must be reviewed against the pinned harness before execution. A reduced smoke test is forbidden.

### E3 — actual worker-path quota/public-state evidence

Historical executable blob: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`.
It is an actual `service_worker.js` VM/chrome-storage/fetch harness. It may be adapted only for current expected worker/content SHA pins and validation fixture compatibility; semantic assertions may not be removed/weakened. Record original blob SHA, adapted harness SHA-256 and exact diff; adaptation may not change production.

Required evidence at minimum:

- `V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS`
- `V3B_INCOMPATIBLE_CACHE_MISS_GUARDED_WAIT_PASS`
- `V3B_GUARDED_DUE_ONE_PROVIDER_CALL_PASS`
- `V3B_ONE_429_ONE_PROVIDER_CALL_PASS`
- `V3B_ZERO_IMMEDIATE_RETRY_PASS`
- `V3B_ZERO_ALARM_REPLAY_PASS`
- `V3B_ZERO_STARTUP_REPLAY_PASS`
- `V3B_RETRY_AFTER_EXTENSION_ONLY_PASS`
- `V3_WORKER_ACTUAL_PATH_HARNESS_PASS`.

Do not interpret the historical harness's mocked provider counter as a real provider request. External real-network counters remain zero.

### E4 — protected behavior carry-forward

Historical executable blob: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`.
Use it to prove protected-byte/function/contract carry-forward, adapting only deterministic current candidate/artifact/patch path/hash inputs where required.

Historical carry-forward markers include:

- `V3B_PROTECTED_15_BYTE_IDENTICAL_PASS`
- `V3B_STEP1_SECURITY_CARRY_FORWARD_PASS`
- `V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS`
- `V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS`
- `V3B_DELIVERY_FSM_CARRY_FORWARD_PASS`
- `V3B_STEP3_INTEGRATION_SURFACE_CARRY_FORWARD_PASS`
- `V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS`
- `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`.

Carry-forward markers are supporting evidence, never a substitute for current executable behavior where the worker/content changed or the permanent gate explicitly requires behavioral verification.

### E5 — Step 2 planner/coalescing/projection current execution

Coverage authority: independent acceptance report commit `662efb3737e5f7d702751a2407d9d154a2d83ea9`, which records the accepted actual-path `step2-acceptance.mjs` architecture.

The final run MUST execute a validation-only Step-2 harness against the exact current worker. If the historical temporary harness is retained locally, copy it into the run workspace, record its SHA-256, and inspect it before execution. If it is absent, construct a replacement validation-only harness BEFORE the top-level run and make implementation-completeness fail unless it contains executable assertions for every block-05 bullet. Historical output may guide fixture semantics but may not count as execution.

Required current markers/equivalent ledger evidence:

- `STEP2_PLANNER_ACTUAL_HELPERS_PASS`
- `STEP2_COALESCE_UNION_MAX14_PASS`
- `STEP2_FAIL_CLOSED_PRESERVED_SEMANTICS_PASS`
- `STEP2_PROJECTION_PROVEN_PASS`
- `STEP2_GROUP_REQUESTING_RECOVERY_PASS`
- actual physical-provider call count/provenance assertions, provider-error no replay, unprojectable-response fail-closed.

### E6 — Step 3 quota/security/verifier current execution

Coverage authority: independent acceptance report `662efb...` plus permanent blocks 03, 04, 06, 07.

The final run MUST execute current-worker validation harnesses for all of these markers/equivalent ledger evidence:

Quota/scheduler:
- `STEP3_QUOTA_ACTUAL_HELPERS_WIRED_PASS`
- `STEP3_QUOTA_SAME_SELLER_SERIAL_PASS`
- `STEP3_QUOTA_DUE_RESUME_PASS`
- `STEP3_QUOTA_CACHE_BEFORE_QUOTA_PASS`
- `STEP3_QUOTA_RETRY_AFTER_EXTENDS_PASS`
- `STEP3_QUOTA_RESTART_REQUESTING_NO_REPLAY_PASS`
- `STEP3_QUOTA_SAFE_PUBLIC_PASS`
- `STEP3_QUOTA_CREDENTIAL_ROTATION_PASS`
- `STEP3_QUOTA_ACCOUNT_ISOLATION_PASS`
- `STEP3_INDEPENDENT_CONCURRENT_ACQUIRE_PASS`.

Security/entitlement/fail-closed:
- `STEP3_INDEPENDENT_MALFORMED_ZERO_PROVIDER_PASS`
- `STEP3_INDEPENDENT_UNSUPPORTED_ZERO_PROVIDER_PASS`
- `STEP3_INDEPENDENT_RESTRICTED_ZERO_BUSINESS_PASS`
- `STEP3_INDEPENDENT_RESTRICTED_FILTER_SORT_UNSUPPORTED_ZERO_PROVIDER_PASS`
- `STEP3_INDEPENDENT_FIXED_HOST_AND_NO_MUTATION_PASS`
- `STEP3_INDEPENDENT_NO_RETRY_PAGINATION_FANOUT_PASS`
- `STEP3_INDEPENDENT_CREDENTIAL_PRIVACY_PASS`
- `STEP3_INDEPENDENT_PROVIDER_AUTH_FIXED_PASS`
- `STEP3_INDEPENDENT_POSTING_FBS_GET_BLOCKED_PASS`
- `STEP3_INDEPENDENT_NO_TRUNCATION_PASS`.

Verifier:
- `STEP3_INDEPENDENT_VERIFIER_SAFE_ERRORS_PASS`
- `STEP3_INDEPENDENT_VERIFIER_PROVIDER_ROWS_MISMATCH_PASS`
- `STEP3_INDEPENDENT_VERIFIER_INVALID_RESPONSE_PASS`
- `STEP3_INDEPENDENT_VERIFIER_HTTP429_PASS`
- `STEP3_INDEPENDENT_VERIFIER_RETRY_AFTER_EXTEND_ONLY_PASS`
- `STEP3_INDEPENDENT_VERIFIER_TRANSPORT_REQUESTED_PASS`
- `STEP3_INDEPENDENT_VERIFIER_STORAGE_FAILURE_ZERO_PROVIDER_PASS`
- `STEP3_INDEPENDENT_VERIFIER_RESTART_REQUESTING_NO_REPLAY_PASS`
- `STEP3_INDEPENDENT_VERIFIER_SUCCESS_COUNT_VALIDATION_PASS`.

Additionally the assertion ledger must explicitly cover every Seller capability/entitlement bullet in permanent block 04 (universal zero-probe, at-most-one relevant probe, raw seller-info privacy, mixed/restricted semantics, Performance-only zero Seller probe). A block-04 PASS cannot be inferred from Step-3 security markers alone.

### E7 — Step 4 verified cache/prefetch current execution

Coverage authority: independent acceptance report `662efb...` plus permanent block 08.

Required current markers/equivalent executable evidence:

- `STEP4_CACHE_ACTUAL_HELPERS_WIRED_PASS`
- `STEP4_CACHE_EXACT_SAFE_SUPERSET_PASS`
- `STEP4_CACHE_DANGEROUS_MISS_PASS`
- `STEP4_CACHE_TTL_QUOTA_PASS`
- `STEP4_CACHE_INVALID_NOT_STORED_PASS`
- `STEP4_CACHE_RESTART_PASS`
- `STEP4_CACHE_PREFETCH_PASS`
- `STEP4_CACHE_PREFETCH_RESTRICTED_SAFE_PASS`
- `STEP4_CACHE_PRIVACY_PASS`
- `STEP4_CACHE_LOGICAL_PROVENANCE_PASS`
- `STEP4_CACHE_METRIC_ORDER_FAIL_CLOSED_PASS`.

### E8 — common Manual/Autorun batch + UI/owner/Performance current execution

Coverage authority: permanent blocks 09, 10, 13, 14 and historical independent/realUI accepted behavior catalog from `662efb...`.

The current execution MUST behaviorally prove, not merely scan source, at minimum:

- one command = one-entry batch and multi-command logical order;
- strictly serial physical calls where required;
- safe continuation for malformed/validation entries;
- completed entries not replayed; old `requesting` ambiguity fail-closed;
- one final batch report with truthful logical/physical counts;
- Manual and Autorun ownership separation;
- normal empty-composer commit-before-insert, exactly one insertion, at-most-one recognized Send, Microphone success/cleanup, no provider replay;
- native Copy independence;
- two ChatGPT-owner isolation;
- ChatGPT/Alice isolation;
- binding/reload survival and no global current-conversation assumption;
- Performance-only path does not invoke Seller capability probing and does not receive Seller quota/cache semantics; Performance host/auth behavior remains unchanged; real Performance requests zero.

Historical behavior names to preserve in the current ledger where applicable include:
`REALUI_COPY_UNBOUND_PASS`, `REALUI_POSTING_ON_BUTTON_BOUND_PASS`, `REALUI_ALICE_OZON_BOUND_PASS`, `REALUI_OZON_BINDING_INDEPENDENT_PASS`, `REALUI_BINDING_RELOAD_PASS`, `REALUI_NATIVE_COPY_TABLE_PASS`, `REALUI_RELOAD_SURVIVAL_PASS`, `REALUI_MULTI_CONV_ISOLATION_PASS`, `REALUI_TWO_AI_OZON_BINDING_PASS`, `REALUI_CHATGPT_AUTO_SEND_PASS`, `REALUI_ALICE_AUTO_SEND_PASS`, `REALUI_AI_OWNERSHIP_FENCING_PASS`, `REALUI_SEND_WATCHER_PATIENCE_PASS`, `REALUI_SEND_WATCHER_TIMEOUT_PASS`, `REALUI_AUTORUN_SEQUENCE_PASS`, `REALUI_MULTI_COMMAND_ORDER_PASS`, `REALUI_MANUAL_SEQUENCE_SELLER_PASS`, `REALUI_MANUAL_COPY_INDEPENDENT_PASS`, `REALUI_MANUAL_SEQUENCE_PERFORMANCE_PASS`, `REALUI_BATCH_MANUAL_ONE_REPORT_PASS`, `REALUI_BATCH_MANUAL_PARTIAL_VALIDATION_PASS`, `REALUI_BATCH_AUTORUN_ONE_REPORT_PASS`, `REALUI_BATCH_AUTORUN_EXPAND_PASS`, `REALUI_QUEUED_MANUAL_RESTART_PASS`, `REALUI_QUEUED_BINDING_PRESERVE_PASS`, `REALUI_QUEUED_NEWEST_FIFO_PASS`, `REALUI_PROVIDER_WAIT_COUNTDOWN_PERSISTS_PASS`, `REALUI_PROVIDER_WAIT_AUTO_START_PASS`, `REALUI_PROVIDER_WAIT_OWNER_ISOLATION_PASS`, `REALUI_PROVIDER_WAIT_CANCELLED_NO_LATE_CALL_PASS`, `REALUI_PROVIDER_WAIT_RESTART_COUNTDOWN_RESUME_PASS`.

Equivalent current assertions may replace historical marker names only when the report explicitly maps them one-to-one to permanent-gate ledger ids.

## Permanent block evidence mapping

- Block 01: deterministic reconstruction + syntax/manifest/permissions/inventory + E4 integrity evidence.
- Block 02: dedicated current strict-command/validation ledger covering every block-02 bullet; historical report alone is insufficient.
- Block 03: E6 security evidence + fixed-host/network instrumentation + full ledger.
- Block 04: E6 entitlement/capability evidence + explicit block-04 ledger.
- Block 05: E5 + E4 carry-forward.
- Block 06: E3 + E6 quota + queue behavior, exact 60000/5000/65000.
- Block 07: E6 verifier.
- Block 08: E7.
- Block 09: E8 common-batch executable behavior.
- Block 10: E8 normal delivery + browser/runtime behavioral evidence.
- Block 11: E1 + E2.
- Block 12: E1 + E2 + E3 quota/public-state preservation evidence.
- Block 13: E2 + E8 owner/binding/native-Copy behavior.
- Block 14: E8 Performance boundary + fixed-host instrumentation.
- Block 15: complete raw-CDP browser/runtime matrix, including E2 and all applicable historical/current browser assertions. Reduced Runtime smoke tests cannot pass block 15.

## Packaging interlock — mandatory runtime invariant

Initialize blocks 01-15 to `NOT_PROVEN`.

Before invoking ANY packaging function, the exact runner MUST execute a runtime assertion equivalent to:

```js
for (let i = 1; i <= 15; i++) {
  if (blocks[String(i).padStart(2,'0')] !== 'PASS') {
    throw new Error(`PACKAGING_FORBIDDEN_BLOCK_${String(i).padStart(2,'0')}_NOT_PASS`);
  }
}
```

Block 16 MUST remain `NOT_RUN` unless this interlock passes. A ZIP created before this check is invalid and must be deleted from the run workspace or clearly quarantined as non-handoff evidence.

The RERUN18 ZIP SHA-256 `565e07256348778e9389883834bfed72cd2c5fcfc3a519f41723e1936749c2339` is explicitly `INVALID_FOR_OPERATOR_HANDOFF` and MUST NOT be reused as a tested package.

After blocks 01-15 literal PASS, block 16 must package exactly that same tested 17-file tree, fresh-extract, verify every byte, syntax and manifest. Only then may block16=PASS and only if all 01-16 PASS may `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` be emitted.

## Final report requirements

The one consolidated report MUST include:

1. exact runner SHA and every validation harness SHA;
2. full assertion ledger grouped B01..B15;
3. for each block, count `required/executed/passed/failed/missing`;
4. all required markers from E1-E8 actually observed in this run or explicit ledger mappings for equivalent current assertions;
5. zero real Ozon/Performance/ChatGPT network and zero operator actions;
6. selected CFT authority and accepted raw-PAGE/direct-worker-CDP transport;
7. packaging-interlock result;
8. package path/SHA and fresh-extract byte identity only if 01-15 PASS;
9. umbrella marker only if every block 01-16 is literal PASS.

Any missing mandatory assertion is a HARNESS_ERROR/NOT_PROVEN, never a PASS.