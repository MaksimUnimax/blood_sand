# Ozon Bridge v0.1.19 — resolved full-gate construction and execution contract

Date: 2026-08-19
Status: `MANDATORY_RESOLVED_FULL_GATE_EXECUTION_CONTRACT`
Scope: validation-only. Production/candidate are immutable.

Authority ledger:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_RESOLVED_AUTHORITY_LEDGER_2026-08-19.md`
commit `7d544b75bf31941af497064d7ae9ce170bda7225`.

Permanent gate exact Git blob:
`28c82b263e6cbd01c744cbfc046241837f1d253e`.

## 1. Core rule: no more one-defect-per-operator-run

The validator must not make the operator relay one harness/environment defect at a time.

The next Codex job has two internal stages and returns **one final result only**:

1. **Validation construction/audit stage** — build/materialize validation-only inputs and helpers, audit them comprehensively, and repair validation-only defects internally until the construction audit is clean. This stage may iterate locally inside the same Codex job. It must not execute the candidate acceptance gate, modify production/candidate, publish an intermediate report, or ask the operator for another action.
2. **One consolidated candidate gate execution** — execute exactly one top-level full-gate runner against the deterministic candidate, collect all safely obtainable current-run evidence, package only if B01-B15 all PASS, publish one final report, STOP.

This preserves the project rule of one consolidated full candidate execution while preventing avoidable validation-harness typos/stubs/path bugs from being discovered one operator rerun at a time.

## 2. No inherited RERUN machinery

The next job must not read, import, source, copy, resume or semantically inherit any `RERUN11` through `RERUN22` top-level runner or plan.

Do not use prior authority-bundle directories, prior runner files, prior report statuses, prior package files, prior package hashes, historical extension ids, or old correction precedence schemas.

The only current authorities are:

- permanent gate exact blob;
- resolved authority ledger `7d544b75...`;
- direct immutable blobs/hashes named by that ledger;
- this execution contract.

If an old report is consulted for debugging architecture, it is non-executable history and cannot provide PASS evidence or configuration precedence.

## 3. Validation construction/audit stage

### 3.1 Fresh workspace

Create one fresh absolute validation workspace with a run nonce. All paths passed to helpers/runner must be absolute.

Create fresh subdirectories for:

- `authorities/`
- `candidate/`
- `helpers/`
- `browser/`
- `reports/`
- `package/` only after the final packaging interlock passes

Do not reuse any prior RERUN workspace/bundle/profile/package.

### 3.2 Authority materialization

Materialize every direct authority from the resolved ledger from live GitHub or from a local object only when the exact object is available and identity is independently verified.

For each authority item create one immutable local record containing exactly:

- `id`
- repository
- source commit/path or direct Git blob
- one `expected_git_blob_sha`
- expected byte length when pinned
- expected SHA-256 when pinned
- local absolute path

There is no override/fallback/corrected/legacy expected identity field.

For every materialized Git object independently compute:

`SHA1("blob " + byteLength + "\0" + rawBytes)`

and compare with the one expected Git blob. When byte length/SHA-256 are pinned, verify those too.

Verify **all** authority items and collect all identity defects before deciding construction readiness. Do not stop at the first mismatch.

Mandatory composite checks:

- repair patch `00+01`: 13648 bytes / SHA-256 `bd011921...`
- E1 `00+01+02+03`: 21942 / `ac228da5...`
- E2 `00+01`: 13352 / `ce38adbf...`

The E1 part02 effective blob is only `10638ac5c70d07af7f68e51259113e8be63289f4`.

### 3.3 Build the complete validation helper suite BEFORE gate execution

Prepare these validation-only executable providers before launching the one candidate gate runner:

- `H01_INTEGRITY.mjs` — candidate/frozen/patch/inventory/syntax/manifest/permissions/production-tree checks.
- `H02_04_CONTRACT_CAPABILITY_SECURITY.mjs` — current candidate command discovery/strict validation, security boundary and complete capability/entitlement matrix.
- `H05_PLANNER_PROJECTION.mjs` — current candidate Step2 contiguous coalescing/nonmetric compatibility/metric cap/projection/provenance/recovery/provider-error behavior.
- `H06_07_QUOTA_VERIFIER.mjs` — current candidate quota family/timing/account isolation/concurrency/restart/Retry-After plus verifier/safe errors.
- `H08_CACHE_PREFETCH.mjs` — current candidate verified cache/prefetch/current quota interaction.
- `H09_BATCH_CORE.mjs` — current Manual/Autorun common batch behavior and reporting/recovery semantics.
- `H10_15_BROWSER_RAW_CDP.mjs` — complete browser/runtime behavior using only the resolved raw-CDP substrate; includes normal delivery, E2 composer-wait behavior, E5 quota-countdown/ChatGPT/Alice/owner behavior, UI/cancellation, Performance browser boundary where applicable and lifecycle checks.
- `H12_OFF_ON_DEEP.mjs` — dedicated deep OFF->ON state-preservation + cold-cache persisted-deadline test required by B12.15/B12.16/B12.22/B12.26.
- `H14_PERFORMANCE.mjs` — dedicated current Performance fixed-host/auth, zero Seller capability probe and no Seller quota/cache application behavior.
- `H_E1_TARGETED.mjs` — byte-exact E1 reconstruction, not rewritten.
- `H_E3_WORKER.mjs` — E3 actual-worker harness adapted only for current hashes, realm-safe fixture compatibility and persisted-due fixture.
- `H_E4_PROTECTED.mjs` — E4 adapted to compare frozen published artifact directly with current repaired candidate.

A helper may cover multiple blocks. Multiple helpers may support one ledger item. No behavioral ledger item may be passed solely by static source text or marker printing.

### 3.4 Helper construction requirements

For generated/adapted helpers:

- record source/provenance authority ids;
- record exact generated helper SHA-256;
- store a machine-readable mapping of concrete assertion functions/checks to ledger IDs;
- adaptation diff must be recorded for E2/E3/E4/E5 derived helpers;
- no production file may be written;
- no assertion may be deleted/weakened to make a helper pass.

Required E3 adaptations:

- expected worker -> `dfc101f6...`
- expected content -> `ab3408a2...`
- use realm-safe storage cloning if needed by Node VM
- use worker-persisted `next_allowed_at` due fixture from blob `44e396...`

Required E4 adaptation:

- base is fresh extraction of frozen published artifact `d794...`
- current candidate is frozen artifact + composer repair
- prove protected 15 bytes equal
- prove protected function bodies not intentionally touched by repair remain exact
- do not require an old Step4 tree

Required E2/E5 browser adaptation:

- behavioral assertions/fixture semantics preserved
- transport port only
- no `browser.newPage()`
- no historical extension-debugging switch
- use current exact raw-PAGE/direct-worker-CDP environment
- local Fetch fulfillment installed before synthetic supported-origin navigation
- zero real ChatGPT/Ozon/Performance network

### 3.5 Construction completeness compiler

Before the candidate gate execution, run a validation-only completeness compiler over the top-level runner and every helper. It must collect **all** defects in one pass and iterate internally until zero defects.

Mandatory checks:

1. `node --check` every `.mjs` helper and top-level runner.
2. All expected authority items exist with one identity field only and all identities PASS.
3. No path references `authority-bundle-rerun20`, `rerun21`, `rerun22`, or any prior RERUN workspace.
4. No imported/executed prior RERUN top-level runner.
5. No old nonexistent E1 `...c70e...` pin in executable metadata/code.
6. No hardcoded historical extension id.
7. No `TODO`, `FIXME` used as implementation placeholder, `stub`, `placeholder`, `not implemented`, `unavailable`, or phase-replacing unconditional throw/return/exit.
8. No accepted browser path contains `browser.newPage()`.
9. No accepted worker path contains `extension.triggerAction()`.
10. No accepted worker path contains `worker.evaluate()` or `worker.evaluateHandle()`.
11. No accepted ServiceWorker activation is attached to browser-level CDP session.
12. Mutable discovery snapshots are mutable (`let` or equivalent) and the existing repeated-refresh self-test passes.
13. Actual spawn-args verification is executed before `browser.installExtension()`.
14. Full raw PAGE Runtime/Page/Fetch implementation present.
15. Full dual-route worker discovery/startWorker-once/direct-CDP implementation present.
16. E2 and E5 behavior mappings contain every required historical behavior assertion, not only Runtime smoke.
17. B10 variants include later-user-Send plus disabled Send/Stop/Unknown/Microphone negative controls.
18. B11 includes wrong-owner composer negative control.
19. B12 deep helper includes binding, credentials/settings, Retry-After state and cold-cache prior-deadline preservation.
20. B13 includes Manual toggle availability and no-global-current-conversation behavior.
21. B14 behavior helper exists and does not merely source-scan.
22. All 164 ledger IDs from `7d544b75...` exist exactly once as seeded requirements; block required counts equal `11,9,9,10,8,18,7,13,9,10,13,26,10,4,7`.
23. Every one of the 164 ids has at least one executable evidence provider mapping.
24. No block status can be set from a phase marker or historical report text.
25. Packaging function is structurally unreachable until literal PASS of B01-B15.
26. Any pre-existing ZIP/package is ignored and cannot be an input to packaging.
27. Real network counters and interception instrumentation exist for Seller, Performance and synthetic ChatGPT/Alice.
28. Candidate byte-drift check surrounds every helper family; a helper cannot silently mutate the candidate.
29. Child helper failures are awaited/recorded rather than causing accidental top-level process loss.
30. Final report code can serialize **all** harness/construction/functional failures, not only the first exception.

The construction stage may fix validation-only helper/runner defects and rerun this compiler internally. It must not ask the operator to run again for these defects.

Only when the construction audit has zero unresolved defects may the one candidate gate execution start.

## 4. One consolidated candidate gate runner

Create one new top-level runner only, with no prior-run imports. Its exact filename must be recorded in the standalone final prompt/report.

### 4.1 Non-fail-fast evidence collection

The candidate run must not stop at the first ordinary assertion/harness/environment failure.

Rules:

- Within a helper, collect all independent assertions where continuing is safe.
- A failed child helper does not prevent other independent helpers from running.
- If browser substrate fails but candidate integrity is valid, still execute all non-browser VM/static functional helpers and report browser-dependent ledger entries as `BLOCKED_BY:BROWSER_SUBSTRATE`.
- If one functional block fails, continue independent later functional blocks.
- Dependent assertions that cannot safely execute are recorded as `executed:false`, `blocked_by:[...]`, never silently omitted.
- Report the complete `failure_set[]`, `harness_defects[]`, `environment_defects[]`, `production_assertion_failures[]`, and `blocked_assertions[]` in the single final report.

Hard-abort exceptions are limited to safety/integrity conditions where continuing would invalidate evidence or risk external side effects:

- unauthorized real external request escapes interception;
- production/frozen authority/source CFT is modified;
- tested candidate bytes drift after freeze;
- real operator profile/credentials are detected;
- candidate cannot be reconstructed/identified at all.

Even after a hard abort, collect all already-available local diagnostics before the single final report; do not request a separate diagnostic run.

### 4.2 Phase A — candidate

Freshly materialize/reconstruct frozen ZIP + exact patch into a new candidate directory. Verify all B01 entries. Keep a canonical 17-file `{path,size,sha256}` snapshot. This is the tested-tree identity for the entire run.

### 4.3 Phase B — browser substrate

Independently verify CFT 308/d7b8 using the literal canonical algorithm. If supplied CFT source does not match, scan the existing QA root for another CFT 151.0.7922.47 tree and accept it only if it independently yields exact 308/d7b8; do not modify mismatching trees.

Fresh-copy selected CFT, setup once exit 78, verify post-setup identity, launch exact no-sandbox validator args, verify actual args before install, install/enumerate runtime-returned extension id, raw PAGE Runtime/Page/Fetch, local fixture, worker activation/runtime/liveness.

If browser substrate fails, collect exact step-by-step diagnostics (launch args, target discovery, registration/scope/startWorker count, direct/raw worker transport errors, browser liveness) in this same run. Then continue all non-browser helpers if safe.

### 4.4 Phase C — all non-browser current behavior

Run and await all current helpers E1/E3/E4 plus H02_04/H05/H06_07/H08/H09/H12/H14. Use mocked providers only.

No current behavioral PASS may come from a historical PASS report.

After every helper, verify the 17-file candidate snapshot has not changed.

### 4.5 Phase D — complete browser/runtime behavior

If substrate is available, run H10_15_BROWSER_RAW_CDP and all browser-backed assertions. It must include:

- current E2 composer-wait exact behavior/markers;
- E5 countdown/ChatGPT/Alice/native-Copy/two-owner/restart behavior;
- normal empty-composer delivery;
- Send-state negative variants;
- Manual toggle availability during pending Manual report;
- wrong-owner/no-global-current-conversation negative cases;
- OFF->ON UI readiness and no resurrection;
- lifecycle restart duplicate prevention;
- zero real network;
- runtime/console failure capture.

After browser helper, verify candidate snapshot unchanged.

### 4.6 Ledger aggregation

Mechanically aggregate all 164 B01-B15 requirements.

For each block report:

- required
- executed
- passed
- failed
- blocked
- missing

Block literal `PASS` iff every required entry has `executed:true` and `pass:true` and none failed/blocked/missing.

A present behavior can never be `NOT_APPLICABLE` because its test failed or was blocked.

### 4.7 Packaging

If any B01-B15 is not literal PASS:

- B16=`NOT_RUN`
- no ZIP created
- report complete failure/blocked set
- STOP after one report

Only if B01-B15 all PASS execute hard runtime interlock, then create a **new** ZIP from the exact tested 17-file tree, fresh-extract, compare every byte, rerun JS syntax/manifest/inventory checks, record new SHA-256 and set B16 PASS.

Never reuse any prior RERUN ZIP/hash/path.

## 5. Result classification

Use the narrowest truthful classifications, and allow more than one category in the detailed failure set:

- `PRODUCTION_BEHAVIOR_FAILURE` — current candidate assertion executed and failed.
- `HARNESS_FIXTURE_FAILURE` — validation fixture semantics wrong while candidate behavior not disproven.
- `HARNESS_ERROR` — validator code/control/authority plumbing defect.
- `ENVIRONMENT_ERROR` — external validation host/browser/process limitation.
- `SAFETY_ABORT` — unauthorized network/profile/credential/immutable-byte breach.

Terminal top-level classification may use the dominant cause, but the full report must list every observed category/failure rather than collapsing to one first error.

## 6. Final report — one only

Publish exactly one report-only validation commit/branch after the consolidated run. No intermediate report commits.

Report at minimum:

- direct resolved authority commit/blob identities
- top-level runner SHA-256 and every helper SHA-256
- construction-audit status and complete construction defect list (expected zero before execution)
- exact command and absolute fresh workspace paths
- candidate hashes/inventory/change scope
- environment/CFT/launch/worker transport evidence
- full 164-entry assertion ledger or a complete machine-readable attachment plus grouped summary
- B01-B15 required/executed/passed/failed/blocked/missing
- complete current helper commands and observed markers/state/counts
- complete failure_set arrays, not first-error-only
- REAL_OZON_REQUESTS, REAL_PERFORMANCE_REQUESTS, REAL_CHATGPT_REQUESTS, OPERATOR_BROWSER_ACTIONS
- production/candidate/source-CFT modification counters
- packaging interlock status
- new package path/SHA/fresh-extract evidence only if B01-B15 all PASS
- umbrella marker only if B01-B16 all PASS

After publishing that one report, STOP and return exactly one final result to the operator.
