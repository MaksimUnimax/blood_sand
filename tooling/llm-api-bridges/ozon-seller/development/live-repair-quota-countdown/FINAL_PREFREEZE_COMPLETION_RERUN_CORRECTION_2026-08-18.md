# Ozon live-repair — FINAL pre-freeze completion same-gate rerun correction

Date: 2026-08-18
Status: SAME FINAL PREFREEZE GATE rerun only. This is not V3G/V3H, not a production repair, not independent acceptance, not live testing, and not release promotion.

## Authority

Repository: `MaksimUnimax/blood_sand`

Exact frozen Step-4 base:
`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Exact V3 production candidate:
`88a20984c55da1f813ca1184bd90089823f51883`

Expected repaired production SHA-256:
- service worker: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- content script: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Original consolidated runner Git blob:
`bdf242f5cb78e506e67adb7b4d06fd0f585824f3`

Same-gate rerun wrapper Git blob:
`b48b7afbe94c09ff6df4538f914709572dfdf0e3`

Source harness blobs remain:
- worker `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

## Previous final-gate evidence

Report commit:
`9488168153e65387f3d4a0f3fd770f53618f9336`

The previous final consolidated run proved all worker actual-path gates PASS and regression terminal PASS. The only failure was the browser block: after runtime extension installation, the harness timed out for 10 seconds waiting for an MV3 `service_worker` target and produced no browser behavior assertion markers. This was classified `ENVIRONMENT_ERROR`.

Production must not be changed on account of this failure.

## Exact test-only correction

The rerun wrapper must verify the original runner Git blob exactly, then inject exactly one browser-harness correction into that runner:

1. keep existing manual Chrome spawn, dynamic `DevToolsActivePort`, Puppeteer connect, runtime `browser.installExtension()`, writable temp area, node_modules junction, host blocking, and dedicated profile;
2. immediately after `browser.installExtension(candidateDir)` create a browser-target CDP session;
3. enable the `ServiceWorker` CDP domain;
4. call `ServiceWorker.startWorker` with scope URL `chrome-extension://<extensionId>/`;
5. wait up to 20 seconds for the exact extension `service_worker` target;
6. if this still times out, print the `startWorker` error (if any) and every current Puppeteer target type+URL before failing.

No production bytes may change. No source harness bytes may be edited directly. The wrapper may create only temporary transformed test harness files and must delete them on completion.

## Required execution

Materialize each Git object separately and verify each with `git hash-object`.

Required files:
- original consolidated runner blob `bdf242f5cb78e506e67adb7b4d06fd0f585824f3`
- rerun wrapper blob `b48b7afbe94c09ff6df4538f914709572dfdf0e3`
- worker source blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser source blob `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression source blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Run `node --check` on the wrapper and original runner.

Then execute the wrapper with the original runner followed by the original final runner arguments:

`node FINAL_PREFREEZE_COMPLETION_RERUN_WRAPPER.mjs FINAL_PREFREEZE_COMPLETION_RUNNER.mjs worker-source.mjs browser-source.mjs regression-source.mjs <STEP4_EXACT_DIR> <V3_EXACT_DIR> <CFT_EXE> D:\codex\Test\qa-harness\puppeteer-extension-qa`

Environment remains Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`. Do not install or update dependencies or browser.

## Required result

Worker must again terminate PASS with all prior markers:
- manual quota_wait
- autorun quota_wait
- privacy
- incompatible miss guarded wait
- due exactly one provider call
- mocked 429 exactly one provider call
- zero immediate retry
- zero alarm replay
- zero startup replay
- Retry-After extension-only.

Regression must again terminate PASS.

Browser must freshly execute and PASS all required markers:
- visible wait plate
- at least three decreasing displayed MM:SS values
- absolute due HH:MM:SS
- due sending state
- restart restore
- duplicate-click blocked/busy state
- two-owner isolation
- ChatGPT binding
- Alice binding
- native Copy independent
- no cross-owner state/delivery regression
- zero provider network.

`REAL_OZON_REQUESTS = 0`
`REAL_PERFORMANCE_REQUESTS = 0`

If the service-worker target still cannot be obtained, classify `ENVIRONMENT_ERROR` and include exact target diagnostics. Do not create another stage or production repair.

If an actual production browser assertion executes and fails, classify `PRODUCTION_BEHAVIOR_FAILURE` with exact stdout/stderr and assertion.

Only if worker, regression, and browser all pass may the verdict be:
`FINAL_PREFREEZE_PASS`.

## Report-only lineage

Create report branch FROM EXACT candidate:
`88a20984c55da1f813ca1184bd90089823f51883`

Branch:
`engineering/ozon-live-repair-final-prefreeze-completion-rerun-2026-08-18`

Allow exactly one new report file:
`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/FINAL_PREFREEZE_COMPLETION_RERUN_REPORT_2026-08-18.md`

After publishing the report, STOP. No freeze commit, no acceptance plan, no live request, no release promotion in this Codex run.

Return exactly:

FINAL_OZON_LIVE_REPAIR_PREFREEZE_RERUN_RESULT

tested_base:
  <sha>

candidate_checkpoint:
  <sha>

integrity:
  source_blobs: PASS|FAIL
  original_runner_blob: PASS|FAIL
  rerun_wrapper_blob: PASS|FAIL
  production_hashes: PASS|FAIL

worker:
  terminal: PASS|FAIL
  manual_quota_wait: PASS|FAIL|UNPROVEN
  autorun_quota_wait: PASS|FAIL|UNPROVEN
  privacy: PASS|FAIL|UNPROVEN
  guarded_wait: PASS|FAIL|UNPROVEN
  due_one_provider_call: PASS|FAIL|UNPROVEN
  one_429_one_provider_call: PASS|FAIL|UNPROVEN
  zero_immediate_retry: PASS|FAIL|UNPROVEN
  zero_alarm_replay: PASS|FAIL|UNPROVEN
  zero_startup_replay: PASS|FAIL|UNPROVEN
  retry_after_extension_only: PASS|FAIL|UNPROVEN

browser:
  terminal: PASS|FAIL
  service_worker_wake: PASS|FAIL|UNPROVEN
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
  <branch>

report_commit:
  <sha>

verdict:
  FINAL_PREFREEZE_PASS|FINAL_PREFREEZE_FAILED
