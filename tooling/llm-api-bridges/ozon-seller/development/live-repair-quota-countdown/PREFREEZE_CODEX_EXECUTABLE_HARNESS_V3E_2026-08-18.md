# Ozon Bridge v0.1.19 — V3E Git-blob executable pre-freeze gate

Date: 2026-08-18
Status: harness-integrity correction execution gate only; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

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

Expected exact repaired production hashes:

- `service_worker.js` = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely before execution:

- `development/live-repair-quota-countdown/V3D_INTEGRITY_REVIEW_2026-08-18.md`
- `development/live-repair-quota-countdown/harness-v3e/HARNESS_MANIFEST_V3E_2026-08-18.md`
- V3D report commit `9bc364feb79664fb07928ab417c01c542f0c78d1`
- V3C report commit `283af1fde8cb0253cca0b275c245fb48dd9c7ab2`
- V3 exact reconstruction report commit `82b8ec53830047902b8bfcc2886519ae6161fcaf`
- accepted Step-3 validation report
- accepted Step-4 validation report.

## Purpose

V3D did not execute the worker/browser corrected scenarios because its test bookkeeping associated three SHA-256 values with the wrong immutable source harness names. Direct live Git blob inspection proves the blob identities themselves are correct.

V3E removes secondary SHA-256 mapping from source-harness integrity. The authoritative source identity is the Git blob ID itself.

Do NOT reinterpret the V3D SHA-256 rotation as a production defect.

## Hard rules

- Do NOT create V4.
- Do NOT modify V3 production or V3 patch.
- Do NOT modify the V3E runners.
- Do NOT modify source harness bytes except the one worker test-fixture transformation performed internally by the supplied worker runner.
- Do NOT install or update npm, Puppeteer, Chrome, or any dependency.
- Do NOT use real Seller or Performance credentials.
- Do NOT use a normal operator Chrome profile.
- Do NOT contact Ozon or Performance.
- `REAL_OZON_REQUESTS = 0`.
- `REAL_PERFORMANCE_REQUESTS = 0`.

The report branch MUST be based exactly on production candidate `88a20984c55da1f813ca1184bd90089823f51883`, not on this plan commit.

## 1. Exact tree

Reconstruct/reuse exact V3 repaired tree and verify:

- worker SHA-256 = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
- content SHA-256 = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- 17 production files;
- protected fifteen byte-identical to exact Step 4.

If any fail: STOP as `CANDIDATE_INTEGRITY_ERROR`.

## 2. Materialize exact source harness blobs by Git object ID

Fetch the development branch/object data as needed, then materialize the following Git objects into three distinct files using Git object commands, for example `git cat-file blob <sha> > <file>`.

Worker source:

`0da73bdd1bb1608074781bb0c594c7875a4fe3ce`

Browser source:

`841429741d5ff9144a8a40506e657dc4392fe37c`

Regression source:

`57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Immediately run `git hash-object <file>` separately for each materialized file.

Required exact output mapping:

- worker file -> `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser file -> `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression file -> `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Do NOT calculate these three in a parallel array and then associate results by positional order. Record each command and its output independently.

If any mapping fails: STOP as `GIT_BLOB_MATERIALIZATION_ERROR` and include exact commands/stdout/stderr.

## 3. Materialize exact V3E runners by Git object ID

Worker runner Git blob:

`9f0df0c911316fcc8850506937aa10f987cadb3f`

Browser runner Git blob:

`d6ba37ab27b5f71b6be1c7dec8b8a82db95fdd83`

Materialize each separately via Git object ID and require `git hash-object` to return the same ID.

Runner source paths for human cross-check only:

- `development/live-repair-quota-countdown/harness-v3e/V3E_WORKER_GIT_BLOB_RUNNER.mjs`
- `development/live-repair-quota-countdown/harness-v3e/V3E_BROWSER_GIT_BLOB_RUNNER.mjs`

Run:

`node --check V3E_WORKER_GIT_BLOB_RUNNER.mjs`

`node --check V3E_BROWSER_GIT_BLOB_RUNNER.mjs`

Also syntax-check the three exact source harness files.

Any syntax/integrity failure: STOP as `HARNESS_INTEGRITY_ERROR` with exact stderr.

## 4. Execute worker V3E runner

Run exactly:

`node V3E_WORKER_GIT_BLOB_RUNNER.mjs <exact-worker-source-harness-file> <V3_EXACT_DIR>`

The runner itself must print:

- `V3E_WORKER_SOURCE_GIT_BLOB=0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- `V3E_WORKER_RACE_FIX_ONLY=PASS`

It applies only the test fixture correction from guarded due about +200 ms to guarded due about +8000 ms.

Required downstream worker markers:

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

If runner integrity passes but a downstream production assertion fails, classify `PRODUCTION_BEHAVIOR_FAILURE` and include exact command, exit code, stdout and relevant stderr. Do not repair production.

## 5. Execute browser V3E runner

Reuse the already-existing accepted QA environment from V3D:

Puppeteer project root observed in V3D:

`D:\codex\Test\qa-harness\puppeteer-extension-qa`

Existing Puppeteer version:

`25.4.0`

Existing CFT executable observed in V3D:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64\chrome.exe`

CFT target:

`151.0.7922.47`

Do not install or update anything.

If these exact paths are unavailable in the current environment, locate the already-existing QA project/CFT used by V3C/V3D without installing anything. Record the resolved paths and versions. If no existing environment exists, STOP as `ENVIRONMENT_ERROR`.

Run:

`node V3E_BROWSER_GIT_BLOB_RUNNER.mjs <exact-browser-source-harness-file> <V3_EXACT_DIR> <CFT_EXECUTABLE> <PUPPETEER_PROJECT_ROOT>`

The runner itself must print:

- `V3E_BROWSER_SOURCE_GIT_BLOB=841429741d5ff9144a8a40506e657dc4392fe37c`
- `V3E_BROWSER_RELOCATED_BYTES_IDENTICAL=PASS`

Required downstream browser markers:

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

If exact source/runner integrity and environment resolution pass but a browser assertion fails, classify `PRODUCTION_BEHAVIOR_FAILURE` and include exact command/exit/stdout/stderr. Do not repair production.

## 6. Regression harness

Run the exact regression source file materialized from Git blob `57574ef6...`:

`node <exact-regression-harness-file> <STEP4_EXACT_DIR> <V3_EXACT_DIR>`

Require terminal marker:

`V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`

and the individual protected/regression markers.

## 7. Network boundary

Real provider counters must remain exactly:

`REAL_OZON_REQUESTS = 0`

`REAL_PERFORMANCE_REQUESTS = 0`

Synthetic mocked calls inside VM tests do not count as real provider requests.

## 8. Verdict

PASS only if:

- exact V3 candidate bytes PASS;
- all five materialized Git object IDs map one-to-one to the exact expected files;
- runner syntax PASS;
- worker V3E terminal and all required worker markers PASS;
- browser V3E terminal and all required browser markers PASS;
- regression terminal PASS;
- real request counters are zero.

PASS verdict exactly:

`PREFREEZE_V3E_PASS`

Any failure:

`PREFREEZE_V3E_FAILED`

with exactly one primary classification:

- `CANDIDATE_INTEGRITY_ERROR`
- `GIT_BLOB_MATERIALIZATION_ERROR`
- `HARNESS_INTEGRITY_ERROR`
- `ENVIRONMENT_ERROR`
- `PRODUCTION_BEHAVIOR_FAILURE`

Do not use generic `UNPROVEN` if a command failed. Include exact command, exit code, stdout and relevant stderr.

## 9. Report-only branch

Create branch exactly:

`engineering/ozon-live-repair-prefreeze-executable-v3e-2026-08-18`

FROM EXACT:

`88a20984c55da1f813ca1184bd90089823f51883`

Create exactly one file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_EXECUTABLE_V3E_REPORT_2026-08-18.md`

No production files. No harness files on report branch. No plan copy.

Commit message:

`test: execute Ozon live repair V3E Git-blob prefreeze harness`

After publication STOP.

## Required final response

Return exactly this schema:

```text
CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3E_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  88a20984c55da1f813ca1184bd90089823f51883

git_blob_integrity:
  worker_source: PASS|FAIL
  browser_source: PASS|FAIL
  regression_source: PASS|FAIL
  worker_runner: PASS|FAIL
  browser_runner: PASS|FAIL

worker:
  race_fix_only: PASS|FAIL
  manual_quota_wait: PASS|FAIL
  autorun_quota_wait: PASS|FAIL
  privacy: PASS|FAIL
  incompatible_miss_guarded_wait: PASS|FAIL
  due_one_provider_call: PASS|FAIL
  one_429_one_provider_call: PASS|FAIL
  zero_immediate_retry: PASS|FAIL
  zero_alarm_replay: PASS|FAIL
  zero_startup_replay: PASS|FAIL
  retry_after_extension_only: PASS|FAIL

browser:
  relocated_bytes_identical: PASS|FAIL
  puppeteer_25_4_0: PASS|FAIL
  cft_151: PASS|FAIL
  visible_wait_plate: PASS|FAIL
  three_decreasing_seconds: PASS|FAIL
  absolute_due_clock: PASS|FAIL
  due_sending_state: PASS|FAIL
  restart_restore: PASS|FAIL
  duplicate_click_blocked: PASS|FAIL
  two_owner_isolation: PASS|FAIL
  chatgpt_binding: PASS|FAIL
  alice_binding: PASS|FAIL
  native_copy_independent: PASS|FAIL
  no_cross_owner_regression: PASS|FAIL

regression:
  protected_15: PASS|FAIL
  step1_security: PASS|FAIL
  step2_planner_projection: PASS|FAIL
  step3_integration_surface: PASS|FAIL
  step4_cache_prefetch: PASS|FAIL
  delivery_fsm: PASS|FAIL

network:
  real_ozon_requests: 0|NONZERO
  real_performance_requests: 0|NONZERO

failure_classification:
  NONE|CANDIDATE_INTEGRITY_ERROR|GIT_BLOB_MATERIALIZATION_ERROR|HARNESS_INTEGRITY_ERROR|ENVIRONMENT_ERROR|PRODUCTION_BEHAVIOR_FAILURE

report_branch:
  engineering/ozon-live-repair-prefreeze-executable-v3e-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_V3E_PASS|PREFREEZE_V3E_FAILED
```
