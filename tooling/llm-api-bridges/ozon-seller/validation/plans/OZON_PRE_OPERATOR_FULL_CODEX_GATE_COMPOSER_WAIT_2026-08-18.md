# Ozon Bridge v0.1.19 — full pre-operator Codex gate after Manual composer-wait repair

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_FINAL_GATE`

# FULL STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Project root:
`tooling/llm-api-bridges/ozon-seller/`

## Exact authority

Final gate input checkpoint commit:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Do not validate a moving branch HEAD. Read all candidate/test/gate bytes from this exact checkpoint unless an explicitly named historical blob is required below.

Permanent living full-gate contract at that checkpoint:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Deterministic candidate checkpoint document:
`tooling/llm-api-bridges/ozon-seller/development/manual-delivery-composer-wait/CANDIDATE_CHECKPOINT_2026-08-18.md`

Repair byte manifest:
`tooling/llm-api-bridges/ozon-seller/development/manual-delivery-composer-wait/PATCH_AND_TARGETED_TEST_PARTS.md`

Narrow Manual-OFF authority:
`tooling/llm-api-bridges/ozon-seller/development/manual-delivery-composer-wait/CANCELLATION_SCOPE_CORRECTION_2026-08-18.md`

Targeted engineering evidence:
- `development/manual-delivery-composer-wait/IMPLEMENTATION_AND_TARGETED_EVIDENCE_2026-08-18.md`
- `development/manual-delivery-composer-wait/TARGETED_EVIDENCE_CANONICAL_HARNESS_UPDATE_2026-08-18.md`
- `development/manual-delivery-composer-wait/LIVE_FAILURE_RED_GREEN_ADDENDUM_2026-08-18.md`

New full-gate browser manifest:
`validation/full-gate/COMPOSER_WAIT_BROWSER_HARNESS_MANIFEST.md`

Read all of the above completely before execution.

## Frozen starting artifact

Artifact path at the exact checkpoint:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Expected artifact bytes:
`122719`

Expected artifact SHA-256:
`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Expected frozen production inventory:
`17` files.

Expected frozen hashes before this repair:
- `service_worker.js` = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Reject immediately if the artifact/hash/inventory does not match.

## Exact production repair patch

Patch parts at the exact checkpoint, lexical order:

1. `development/manual-delivery-composer-wait/patch-parts/00.patch.part`
   - bytes `6957`
   - SHA-256 `ef09ba13d67a9d04fc7be8ac1fc18e67b37812afb78597b8abd6cdc5336b839c`
   - Git blob `4b4578995156cafd60221f8d57f678b99b0b00ff`
2. `development/manual-delivery-composer-wait/patch-parts/01.patch.part`
   - bytes `6691`
   - SHA-256 `65e2de64e97859599aeab9fb42e89e614e8bb22cb95feb43af05b3b1f9917b03`
   - Git blob `98feec99e459332df60aae879fa8f2530856c2d0`

Concatenate byte-for-byte. Expected patch:
- bytes `13648`
- SHA-256 `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Reconstruct candidate:

1. fresh-extract the exact frozen ZIP to a writable temporary directory;
2. verify all frozen integrity assertions first;
3. run `git apply --check` for the exact repair patch against the extracted production root;
4. no fuzz, no manual repair, no source rewriting is allowed;
5. apply exactly once;
6. assert exactly two changed production files relative to frozen base:
   - `service_worker.js`
   - `content_script.js`
7. assert the other 15 production files are byte-identical to frozen base;
8. compute exact repaired hashes.

Required repaired content hash:
`content_script.js = ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

The repaired exact-frozen worker SHA must be computed from this exact reconstruction before tests. Record it as `FINAL_WORKER_SHA256` and use that exact value for every subsequent harness integrity assertion in this one run.

If clean patch application or the expected repaired content hash fails, classify `PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE` and STOP. Do not edit production to make it apply.

## Current targeted harness bytes

Parts in lexical order:

- `development/manual-delivery-composer-wait/targeted-test-parts/00.mjs.part`
- `.../01.mjs.part`
- `.../02.mjs.part`
- `.../03.mjs.part`

Verify the exact part blob/size/SHA values from `PATCH_AND_TARGETED_TEST_PARTS.md`.

Concatenated targeted harness:
- bytes `21942`
- SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

It must pass `node --check` and execute against the exact reconstructed candidate.

Required markers include all listed by the manifest, especially:
- `TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS`
- `TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`

## New real-browser composer-wait harness

Parts:

- `validation/full-gate/composer-wait-browser-parts/00.mjs.part`
  - bytes `6925`
  - SHA-256 `50108245f2fd935425ac9b15a03355bf03448ecf4a34ee21598774bd544f2f51`
  - Git blob `b056c2d2b0a6189d310b99944bf14501cc15a6d7`
- `validation/full-gate/composer-wait-browser-parts/01.mjs.part`
  - bytes `6427`
  - SHA-256 `a54ba5b3aa9d70e84c1172d93c2c94244d46ec1208bef3ff600f4b3653b67db5`
  - Git blob `18fc993168945659ae22150dcad23d60677a4638`

Concatenated harness:
- bytes `13352`
- SHA-256 `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`

Run against the exact candidate with `FINAL_WORKER_SHA256`.

Required browser markers:
- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`

## Accepted carry-forward harness source blobs

Use the exact previously accepted source blobs as inputs, materialized separately with `git cat-file blob <sha>` and individually verified by `git hash-object`:

- quota/worker actual-path source blob:
  `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- existing browser countdown/binding source blob:
  `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression carry-forward source blob:
  `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

These historical harnesses were pinned for the frozen repair. For THIS candidate, a temporary test-only wrapper may replace only their hardcoded expected candidate worker/content hashes with:

- worker = computed `FINAL_WORKER_SHA256`
- content = `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

The regression source must compare protected carry-forward behavior from the exact frozen repair base, not require the pre-V3 Step4 worker hash. It may replace its historical base-worker integrity constant with the exact frozen worker hash:

`34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`

Do not weaken its protected function/file assertions.

For the worker actual-path harness, preserve the already accepted final pre-freeze test-fixture corrections only:

- guarded due fixture approximately +8000 ms instead of +200 ms;
- VM storage mock clone values recreated inside worker VM realm rather than host-realm `structuredClone` objects.

Do not change production.

For the existing browser harness, preserve the accepted CFT architecture and test-only launch correction:

- `--enable-unsafe-extension-debugging`;
- resolve Puppeteer from the accepted QA project's existing `node_modules` by temporary junction/symlink if needed.

Do not use `--load-extension` as replacement for `browser.installExtension()` in the accepted final Windows route.

## Accepted Windows QA environment

Use only the already-qualified environment unless the live repository contains a later explicit accepted replacement:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- Puppeteer project root:
  `D:\codex\Test\qa-harness\puppeteer-extension-qa`;
- existing CFT executable under that project;
- dynamic `DevToolsActivePort`;
- `browser.installExtension()`.

Do not install/update Node/npm/Puppeteer/Chrome/dependencies.
Do not use the operator's normal Chrome profile.

## Permanent living gate coverage

Read `OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md` at exact checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029` and build a complete coverage matrix before execution.

Every currently applicable block 1 through 16 must map to one or more executable assertions in the one consolidated runner.

You MAY reuse the exact historical harness sources above and previously accepted executable test logic from live GitHub where appropriate.

If a mandatory bullet in the permanent gate is not actually covered by the reused harnesses, add a TEMPORARY validation-only assertion to the consolidated runner. Do not edit production and do not weaken the gate.

Source-text identity may protect unchanged surfaces, but do not use source-text identity as a substitute for a behavioral assertion where the permanent gate explicitly requires runtime behavior and Codex can test it.

A behavior that exists in the candidate may not be marked `NOT_APPLICABLE` because the harness lacks a test.

## One consolidated runner — mandatory

Create one temporary top-level runner, for example:

`FINAL_OZON_PRE_OPERATOR_FULL_GATE_RUNNER.mjs`

The runner itself must:

1. verify exact checkpoint/artifact/patch/test bytes;
2. reconstruct the exact candidate in a fresh temp directory;
3. compute/pin `FINAL_WORKER_SHA256`;
4. verify repaired content hash and 15 protected files;
5. syntax-check all production JS and parse manifest;
6. reconstruct and run the current targeted harness;
7. run the transformed accepted quota/worker actual-path harness;
8. run the transformed accepted regression carry-forward harness against frozen base -> repaired candidate;
9. run the transformed accepted browser countdown/binding harness;
10. run the new real-browser composer-wait harness;
11. run any additional temporary assertions required to cover every still-applicable bullet in permanent gate blocks 1-16;
12. assert `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, and `OPERATOR_BROWSER_ACTIONS=0` for automated validation;
13. only after functional PASS, package exactly the tested candidate tree to a temporary ZIP;
14. fresh-extract that ZIP;
15. compare all 17 extracted production files byte-for-byte with the tested candidate;
16. rerun fresh-extraction syntax/manifest/inventory checks;
17. print package SHA-256;
18. emit one final umbrella marker only if every required block passed:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Run the top-level runner exactly once for the authoritative execution. Individual source/harness integrity and `node --check` preparation do not count as separate functional test runs.

Do not rerun failing functional blocks until after reporting. A failure is evidence, not permission to modify production or weaken tests.

## Required historical/carry-forward behavior

At minimum preserve all previously accepted frozen-repair markers from worker/browser/regression, including:

Worker/quota:
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
- `V3_WORKER_ACTUAL_PATH_HARNESS_PASS`

Existing browser quota/binding:
- `V3B_VISIBLE_WAIT_PLATE_PASS`
- `V3B_THREE_DECREASING_SECONDS_PASS`
- `V3B_ABSOLUTE_DUE_CLOCK_PASS`
- `V3B_DUPLICATE_CLICK_BLOCKED_PASS`
- `V3B_NATIVE_COPY_INDEPENDENT_PASS`
- `V3B_TWO_OWNER_ISOLATION_INITIAL_PASS`
- `V3B_RESTART_RESTORE_PASS`
- `V3B_DUE_SENDING_STATE_PASS`
- `V3B_TWO_OWNER_ISOLATION_PASS`
- `V3B_CHATGPT_BINDING_PASS`
- `V3B_ALICE_BINDING_PASS`
- `V3B_NO_CROSS_OWNER_REGRESSION_PASS`
- `V3_BROWSER_COUNTDOWN_HARNESS_PASS`

Carry-forward regression:
- `V3B_PROTECTED_15_BYTE_IDENTICAL_PASS`
- `V3B_STEP1_SECURITY_CARRY_FORWARD_PASS`
- `V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS`
- `V3B_STEP3_INTEGRATION_SURFACE_CARRY_FORWARD_PASS`
- `V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS`
- `V3B_DELIVERY_FSM_CARRY_FORWARD_PASS`
- `V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS`
- `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`

These markers do not by themselves waive any additional behavioral assertions demanded by the current permanent gate.

## No-network / safety requirements

All provider behavior must be mocked/intercepted.

Hard totals:

- real Seller credentials: 0;
- real Performance credentials: 0;
- real Ozon requests: 0;
- real Performance requests: 0;
- operator browser actions: 0;
- production files modified by Codex: 0.

No retry/pagination/fan-out/report polling may be added.
No provider request may be used merely to validate this repair.

## Failure classification

On failure, preserve complete stdout/stderr for every internal block and classify the terminal cause as one or more of:

- `PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE`
- `PRODUCTION_BEHAVIOR_FAILURE`
- `HARNESS_FIXTURE_FAILURE`
- `HARNESS_ERROR`
- `ENVIRONMENT_ERROR`
- `PACKAGE_INTEGRITY_FAILURE`

Do not convert a harness/environment problem into a production edit without an actual failing production assertion.

## Report branch

Create validation report branch FROM EXACT gate input checkpoint:

`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Branch:
`validation/ozon-pre-operator-full-gate-composer-wait-2026-08-18`

Allowed committed validation output: exactly one new report file:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_2026-08-18.md`

Do not commit production files, reconstructed candidate, temporary harnesses, package ZIP, credentials or logs containing secrets.

The report must contain the complete coverage matrix for permanent gate blocks 1-16, exact reconstruction hashes, all executed terminal markers, package SHA-256/fresh-extraction result, network counters and failure classification.

After report publication STOP. Do not begin repairs or another run.

## Final response schema

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

candidate:
  frozen_artifact_sha256: d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
  repair_patch_sha256: bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
  final_worker_sha256: <sha256>
  final_content_sha256: ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda
  production_files: 17
  changed_files_exactly_2: PASS|FAIL
  protected_15_byte_identical: PASS|FAIL

full_gate:
  block_01_integrity: PASS|FAIL
  block_02_command_contract: PASS|FAIL
  block_03_provider_security: PASS|FAIL
  block_04_capability_entitlement: PASS|FAIL
  block_05_planner_projection: PASS|FAIL
  block_06_global_quota: PASS|FAIL
  block_07_response_verifier_errors: PASS|FAIL
  block_08_cache_prefetch: PASS|FAIL
  block_09_common_batch: PASS|FAIL
  block_10_normal_delivery: PASS|FAIL
  block_11_occupied_missing_composer: PASS|FAIL
  block_12_manual_off_on: PASS|FAIL
  block_13_ui_binding_owner_isolation: PASS|FAIL
  block_14_performance_regression: PASS|FAIL
  block_15_browser_runtime: PASS|FAIL
  block_16_packaging: PASS|FAIL
  terminal: PASS|FAIL

network:
  real_ozon_requests: 0|<unexpected>
  real_performance_requests: 0|<unexpected>
  operator_browser_actions: 0|<unexpected>

package:
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

production_modifications_by_validator:
  0|<unexpected>

failure_classification:
  NONE|PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR|PACKAGE_INTEGRITY_FAILURE|MULTIPLE

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-2026-08-18

report_commit:
  <sha>
```
