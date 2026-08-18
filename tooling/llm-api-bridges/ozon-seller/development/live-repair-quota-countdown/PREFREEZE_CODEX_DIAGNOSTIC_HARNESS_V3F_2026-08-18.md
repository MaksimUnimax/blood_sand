# Ozon Bridge v0.1.19 — V3F diagnostic pre-freeze gate

Date: 2026-08-18
Status: diagnostic engineering gate only; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

# FULL STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project root:

`tooling/llm-api-bridges/ozon-seller/`

Exact production candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

Exact frozen Step-4 base:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Expected repaired production hashes:

- `service_worker.js` = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely before execution:

- `development/live-repair-quota-countdown/V3E_FAILURE_REVIEW_2026-08-18.md`
- V3E report commit `754f81d4e4f237ea79e4ab4727c67dd7e9cb5dc8`
- accepted Step-1 retest report commit `249669986d61c5df708dd5b635fe30662120336f`
- accepted Step-3 validation report
- accepted Step-4 validation report.

## Exact source harness Git blobs

Materialize separately using Git object commands and verify with `git hash-object`:

- worker source: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser source: `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression source: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

## Exact V3F runner Git blobs

- worker diagnostic runner: `3f08db7056e76eeff0f0a101083c869475b81c65`
- browser junction runner: `3f0348c2e3541bd8dc70d25e5768c5c7913d3778`

Paths:

- `development/live-repair-quota-countdown/harness-v3f/V3F_WORKER_STATE_DIAGNOSTIC_RUNNER.mjs`
- `development/live-repair-quota-countdown/harness-v3f/V3F_BROWSER_JUNCTION_RUNNER.mjs`

Materialize each runner separately and require its `git hash-object` result to equal the exact blob above.

## Rules

- Do NOT create V4.
- Do NOT modify V3 production bytes or V3 patch.
- Do NOT modify the supplied V3F runners.
- Do NOT install/update Node, npm, Puppeteer, Chrome, or dependencies.
- Do NOT use real Seller/Performance credentials.
- Do NOT use an operator Chrome profile.
- Do NOT contact Ozon or Performance.
- `REAL_OZON_REQUESTS = 0`.
- `REAL_PERFORMANCE_REQUESTS = 0`.

## Reconstruct exact V3 candidate

Independently reconstruct exact frozen Step 4 and apply exact V3 concat as already proven. Before tests require:

- worker SHA exact expected above;
- content SHA exact expected above;
- protected 15 byte-identical.

## Worker diagnostic command

Execute:

`node V3F_WORKER_STATE_DIAGNOSTIC_RUNNER.mjs <exact-worker-source.mjs> <V3_EXACT_DIR>`

The runner is permitted to change TEST HARNESS only:

- `last=now-64800` -> `last=now-57000`;
- add timeout logging around the existing guarded-wait assertion.

It must NOT change production.

If the guarded wait passes and the full source harness reaches terminal PASS, record all worker behavioral items PASS.

If it still times out, the report MUST include the complete emitted lines:

- `V3F_DEBUG_MANUAL_OPERATION=...`
- `V3F_DEBUG_QUOTA_STATE=...`
- `V3F_DEBUG_CACHE_STATE=...`
- `V3F_DEBUG_PROVIDER_CALLS=...`
- `V3F_DEBUG_DIAGNOSTICS=...`

Do not summarize away fields needed to determine:

- batch `request_state`;
- `query_planning_state`;
- entry `status` and planning/error fields;
- `last_error`;
- stored quota family timestamps;
- whether a provider call occurred before timeout;
- last diagnostic event names/codes.

Classify the worker only after the diagnostic state is available:

- `PRODUCTION_BEHAVIOR_FAILURE` only if the exact state proves production violated the intended quota contract;
- otherwise `HARNESS_FIXTURE_FAILURE` or `HARNESS_ERROR` with exact reason.

## Browser command

Use the already-existing accepted environment:

- Puppeteer `25.4.0` project root: `D:\codex\Test\qa-harness\puppeteer-extension-qa`
- CFT `151.0.7922.47` executable under that project as used in V3E.

Execute:

`node V3F_BROWSER_JUNCTION_RUNNER.mjs <exact-browser-source.mjs> <V3_EXACT_DIR> <CFT_EXE> <PUPPETEER_PROJECT_ROOT>`

The runner must:

- preserve exact browser source Git blob `841429741d5ff9144a8a40506e657dc4392fe37c`;
- use a writable temporary directory;
- create only a test-only `node_modules` junction to the existing QA project's `node_modules`;
- execute the exact unmodified browser harness bytes.

If junction creation itself is blocked, classify `ENVIRONMENT_ERROR` and provide exact error. Do not substitute a different browser harness.

If browser harness executes and an assertion fails, classify that assertion as `PRODUCTION_BEHAVIOR_FAILURE` and provide exact stdout/stderr.

## Regression

Re-run the exact regression source harness:

`node <exact-regression-source.mjs> <STEP4_EXACT_DIR> <V3_EXACT_DIR>`

Require terminal `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`.

## Report-only branch

Create branch FROM EXACT:

`88a20984c55da1f813ca1184bd90089823f51883`

Branch:

`engineering/ozon-live-repair-prefreeze-diagnostic-v3f-2026-08-18`

Allowed change: exactly one new report file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_DIAGNOSTIC_V3F_REPORT_2026-08-18.md`

No production/test-harness source may be committed to the report branch.

After report publication STOP.

## Final result format

Return exactly:

```text
CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3F_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  88a20984c55da1f813ca1184bd90089823f51883

integrity:
  worker_source: PASS|FAIL
  browser_source: PASS|FAIL
  regression_source: PASS|FAIL
  worker_runner: PASS|FAIL
  browser_runner: PASS|FAIL

worker:
  test_only_transform: PASS|FAIL
  manual_quota_wait: PASS|FAIL
  autorun_quota_wait: PASS|FAIL
  privacy: PASS|FAIL
  guarded_wait_observed: PASS|FAIL
  diagnostic_state_captured: PASS|FAIL|NOT_NEEDED
  due_one_provider_call: PASS|FAIL|UNPROVEN
  one_429_one_provider_call: PASS|FAIL|UNPROVEN
  zero_immediate_retry: PASS|FAIL|UNPROVEN
  zero_alarm_replay: PASS|FAIL|UNPROVEN
  zero_startup_replay: PASS|FAIL|UNPROVEN
  retry_after_extension_only: PASS|FAIL|UNPROVEN

browser:
  junction_created: PASS|FAIL
  relocated_blob_identical: PASS|FAIL
  visible_wait_plate: PASS|FAIL|UNPROVEN
  three_decreasing_seconds: PASS|FAIL|UNPROVEN
  absolute_due_clock: PASS|FAIL|UNPROVEN
  due_sending_state: PASS|FAIL|UNPROVEN
  restart_restore: PASS|FAIL|UNPROVEN
  duplicate_click_blocked: PASS|FAIL|UNPROVEN
  two_owner_isolation: PASS|FAIL|UNPROVEN
  chatgpt_binding: PASS|FAIL|UNPROVEN
  alice_binding: PASS|FAIL|UNPROVEN
  native_copy_independent: PASS|FAIL|UNPROVEN
  no_cross_owner_regression: PASS|FAIL|UNPROVEN

regression:
  terminal: PASS|FAIL

network:
  real_ozon_requests: 0
  real_performance_requests: 0

failure_classification:
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR|MULTIPLE

report_branch:
  engineering/ozon-live-repair-prefreeze-diagnostic-v3f-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_V3F_PASS|PREFREEZE_V3F_FAILED
```

`PREFREEZE_V3F_PASS` requires the complete worker source harness terminal PASS, complete browser source harness terminal PASS, regression terminal PASS, exact integrity, and zero real provider requests. Otherwise fail with evidence.
