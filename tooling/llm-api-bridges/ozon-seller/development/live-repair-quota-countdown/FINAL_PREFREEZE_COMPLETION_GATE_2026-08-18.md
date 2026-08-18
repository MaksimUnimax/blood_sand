# Ozon Bridge v0.1.19 — FINAL pre-freeze completion gate

Date: 2026-08-18
Status: one consolidated engineering pre-freeze gate; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

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

Expected repaired production SHA-256:
- `service_worker.js` = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely before execution:
- `development/live-repair-quota-countdown/PREFREEZE_DIAGNOSTIC_V3F_REPORT_2026-08-18.md` from report commit `5b8bcb1bd590540fd277acc254d476e2291a0f92`;
- accepted Step-1 retest report commit `249669986d61c5df708dd5b635fe30662120336f`;
- accepted Step-3 validation report;
- accepted Step-4 validation report.

## V3F engineering conclusion

V3F proved that the prior worker failure was a harness fixture failure, not a production quota failure. The durable operation failed before query planning/quota acquisition with `INVALID_PARAMS_VALUE`, `providerCalls=[]`, unchanged quota state, and no `quota_wait`. The cause is the Node VM storage mock returning host-realm objects after `structuredClone`; strict production JSON/plain-object validation is therefore exercised against foreign-realm mock objects rather than Chrome-storage JSON values.

V3F also proved the browser path had not reached extension assertions: CFT closed during `Extensions.loadUnpacked`. The final browser correction preserves the accepted manual architecture `child_process.spawn -> CFT 151.0.7922.47 -> dynamic DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension`, while enabling extension debugging in the launched CFT process and resolving Puppeteer through the existing QA project's `node_modules`.

No production correction is authorized by V3F.

## Exact source harness Git blobs

Materialize each object separately using Git object commands and verify each with an individual `git hash-object <file>`:

- worker source: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser source: `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression source: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Do not use positional/parallel hash mapping.

## Exact consolidated runner

Path on development branch:
`development/live-repair-quota-countdown/final-prefreeze/FINAL_PREFREEZE_COMPLETION_RUNNER.mjs`

Git blob:
`bdf242f5cb78e506e67adb7b4d06fd0f585824f3`

Materialize this exact blob separately and verify:

`git hash-object FINAL_PREFREEZE_COMPLETION_RUNNER.mjs`

must return exactly:

`bdf242f5cb78e506e67adb7b4d06fd0f585824f3`

Then execute:

`node --check FINAL_PREFREEZE_COMPLETION_RUNNER.mjs`

Do not edit the runner.

## Required exact reconstructed directories

Reconstruct the exact Step-4 tree and exact V3 repaired tree using the already accepted/reconstruction authorities. Before execution assert:

- Step-4 worker SHA-256 `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`;
- V3 worker SHA-256 `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
- V3 content SHA-256 `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- exact 17-file production inventory;
- protected fifteen byte-identical.

## Environment

Use the existing accepted QA environment only:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- Puppeteer project root `D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa`;
- existing CFT executable under that QA project.

Do not install or update Node/npm/Puppeteer/Chrome/dependencies.
Do not use the normal operator Chrome profile.

## One consolidated execution

Run exactly one consolidated command:

`node FINAL_PREFREEZE_COMPLETION_RUNNER.mjs <worker-source.mjs> <browser-source.mjs> <regression-source.mjs> <STEP4_EXACT_DIR> <V3_EXACT_DIR> <CFT_EXE> D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa`

The runner itself performs all three blocks: worker actual path, regression, browser countdown/binding.

### Worker test-only correction inside runner

The runner is allowed to alter only temporary test harness bytes. It must not alter production.

It corrects exactly:
1. guarded due fixture from approximately +200 ms to approximately +8000 ms;
2. Node VM mock storage cloning so values returned to the worker are JSON-parsed in the worker VM realm rather than host-realm `structuredClone` objects.

The actual repaired `service_worker.js` remains byte-identical.

Required worker terminal markers from the underlying actual-path harness:
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

### Regression

Required terminal marker:
- `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`

This must include the protected 15 / Step1 / Step2 / Step3 integration / Step4 cache / delivery FSM markers emitted by the exact regression source.

### Browser test-only correction inside runner

The runner preserves exact production and the accepted browser architecture. It changes only temporary browser-harness launch bytes to add `--enable-unsafe-extension-debugging`, and links the writable temporary browser harness directory to the existing Puppeteer QA project's `node_modules`.

The extension must be installed through `browser.installExtension()` after CFT launch/connect. Do not replace this with `--load-extension` or another browser framework.

Required browser markers:
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
- `OPERATOR_BROWSER_ACTIONS=0`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `V3_BROWSER_COUNTDOWN_HARNESS_PASS`

## Network and safety

All provider behavior remains mocked/intercepted.

Hard requirements:
- no real Seller credentials;
- no real Performance credentials;
- no real Ozon request;
- no real Performance request;
- `REAL_OZON_REQUESTS = 0`;
- `REAL_PERFORMANCE_REQUESTS = 0`;
- no retry added;
- no production edit;
- no V4 unless a fresh actual production assertion proves a production defect.

## Classification and no-more-fragmentation rule

This is the final consolidated pre-freeze gate, not a new V3 letter stage.

If the runner ends with `FINAL_PREFREEZE_COMPLETION_PASS`, report PASS.

If it ends with FAILED, preserve the complete runner stdout/stderr sections and classify each failed block as exactly one of:
- `PRODUCTION_BEHAVIOR_FAILURE`
- `HARNESS_FIXTURE_FAILURE`
- `HARNESS_ERROR`
- `ENVIRONMENT_ERROR`

Do not create a V3G/V3H/etc.
Do not create a new production version merely because the harness/environment failed.
A production V4 is justified only by a concrete assertion on the actual repaired production path after the final fixture/environment corrections above.

## Report lineage

Create report branch FROM EXACT:
`88a20984c55da1f813ca1184bd90089823f51883`

Branch:
`engineering/ozon-live-repair-final-prefreeze-completion-2026-08-18`

Allowed exactly one new file:
`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/FINAL_PREFREEZE_COMPLETION_REPORT_2026-08-18.md`

No production file. No harness file. No plan file. Report only.

After report publication STOP.

Return exactly:

FINAL_OZON_LIVE_REPAIR_PREFREEZE_RESULT

tested_base:
  <sha>

candidate_checkpoint:
  <sha>

integrity:
  source_blobs: PASS|FAIL
  runner_blob: PASS|FAIL
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
  engineering/ozon-live-repair-final-prefreeze-completion-2026-08-18

report_commit:
  <sha>

verdict:
  FINAL_PREFREEZE_PASS|FINAL_PREFREEZE_FAILED
