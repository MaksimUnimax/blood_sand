# Ozon Bridge v0.1.19 — V3D executable pre-freeze gate

Date: 2026-08-18
Status: harness-correction execution gate only; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

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

Expected repaired hashes:

- `service_worker.js` = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely before execution:

- `development/live-repair-quota-countdown/V3C_FAILURE_REVIEW_2026-08-18.md`
- `development/live-repair-quota-countdown/harness-v3d/HARNESS_MANIFEST_V3D_2026-08-18.md`
- V3C report commit `283af1fde8cb0253cca0b275c245fb48dd9c7ab2`
- V3 exact reconstruction report commit `82b8ec53830047902b8bfcc2886519ae6161fcaf`
- accepted Step-3 validation report
- accepted Step-4 validation report.

## Purpose

V3C did not establish a new production defect. Its worker scenario used a guarded due boundary only about 200 ms in the future and then waited specifically for `quota_waiting`; this creates a fixture race because real async admission/planning/cache/storage work can reach quota acquisition after that boundary. Its browser harness never started because bare ESM imports could not resolve the already-installed Puppeteer package from the standalone harness directory.

V3D corrects ONLY those two harness conditions. Production bytes remain exactly V3.

## Prohibitions

- Do NOT create V4.
- Do NOT modify any production file.
- Do NOT modify the V3 patch.
- Do NOT install, update, remove or vendor Puppeteer, Puppeteer-core, Chrome, Node or any npm package.
- Do NOT use fuzz, `--reject`, manual patch repair or alternate production bytes.
- Do NOT use real Seller or Performance credentials.
- Do NOT contact Ozon or Performance.
- `REAL_OZON_REQUESTS = 0`.
- `REAL_PERFORMANCE_REQUESTS = 0`.
- Do NOT use the operator's normal browser profile.

## Exact V3C source harnesses

Materialize raw Git blobs exactly:

Worker:

- Git blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- SHA-256 `92818e7348212f13a06a806ebb5e86776a877171d8344964ffc1dfbd66355d78`

Browser:

- Git blob `841429741d5ff9144a8a40506e657dc4392fe37c`
- SHA-256 `05c8ce0d0799b4891b79f73cf1201a2ed187f0527128b35802286280988ea534`

Regression:

- Git blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`
- SHA-256 `10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0`

## Exact V3D runners

Materialize raw Git blobs exactly from the development branch:

Worker runner:

- path `development/live-repair-quota-countdown/harness-v3d/V3D_WORKER_RACE_CORRECTION_RUNNER.mjs`
- Git blob `541b38acd7d4f3a933d1130052562a6340084064`
- SHA-256 `cdfc1ff6a16dc4ca0f1213545a7b1851f756af118c9466cb0f38eccee2af1e6f`

Browser runner:

- path `development/live-repair-quota-countdown/harness-v3d/V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs`
- Git blob `05ac3864c852aa1a44744bf8f207596476ee6b53`
- SHA-256 `fb6ae0600168970943a4eff59ee62d2c6c165661f3144e231496799f3e73191f`

Before execution, verify all raw SHA-256 values above and run `node --check` on both V3D runners and all three V3C harnesses.

Any mismatch is `HARNESS_INTEGRITY_ERROR` and STOP.

## Exact repaired candidate

Reconstruct or re-use an external exact repaired tree only after verifying:

- worker SHA `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
- content SHA `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- 17-file inventory;
- protected fifteen byte-identical to Step 4.

No production edit is allowed.

# A. Worker corrected actual-path run

Execute exactly:

`node V3D_WORKER_RACE_CORRECTION_RUNNER.mjs <EXACT_V3C_WORKER_HARNESS> <EXACT_V3_CANDIDATE_DIR>`

The runner itself must print:

- `V3D_WORKER_SOURCE_SHA256=92818e...`
- `V3D_WORKER_RACE_FIX_ONLY=PASS`
- a corrected test-harness SHA.

It is allowed to change exactly one TEST-HARNESS line in a temporary file:

from due ≈ +200 ms to due ≈ +8000 ms.

It must not change production.

Required downstream PASS markers from the corrected worker harness:

- actual manual quota_wait;
- actual autorun quota_wait;
- public privacy;
- incompatible cache miss reaches durable guarded wait;
- zero provider calls before due;
- one provider call at/after due;
- no duplicate provider call;
- fresh mocked 429 = exactly one provider call;
- zero immediate retry;
- zero alarm replay;
- zero startup replay;
- Retry-After extension-only;
- `REAL_OZON_REQUESTS=0` externally (all provider behavior mocked/intercepted).

If the V3D runner integrity/transformation fails: `HARNESS_ERROR`.

If the corrected harness reaches its production assertions and one fails: `PRODUCTION_BEHAVIOR_FAILURE` with exact marker/assertion, stdout and stderr.

# B. Browser module-location corrected run

Use the already-existing accepted Puppeteer QA project. The previous V3C Chrome path was under:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\...`

Locate the existing project root containing either:

- `node_modules/puppeteer/package.json`, or
- `node_modules/puppeteer-core/package.json`.

Do NOT install anything.

Verify from that same project root that its existing package is the accepted Puppeteer `25.4.0` environment and use CFT `151.0.7922.47`.

Execute exactly:

`node V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs <EXACT_V3C_BROWSER_HARNESS> <EXACT_V3_CANDIDATE_DIR> <CFT_151_EXECUTABLE> <PUPPETEER_PROJECT_ROOT>`

The runner must verify the V3C browser harness SHA, copy its bytes unchanged into the Puppeteer project root, re-verify the SHA, run `node --check`, then execute the unchanged harness there.

Required browser PASS markers:

- visible Ozon wait plate;
- three decreasing displayed countdown values;
- absolute due clock;
- due sending state;
- restart/reload restore from durable due;
- duplicate bridge click blocked/busy;
- two-owner countdown isolation;
- ChatGPT structural binding;
- Alice structural binding;
- native Copy independence;
- no cross-owner regression;
- operator browser actions = 0;
- real Ozon requests = 0;
- real Performance requests = 0;
- terminal browser harness PASS.

If an existing package/project root cannot be located although the accepted QA environment is present, classify `ENVIRONMENT_ERROR` and provide exact searched paths. Do not install anything.

If Chrome/extension starts and an actual browser assertion fails, classify `PRODUCTION_BEHAVIOR_FAILURE` with exact assertion/stdout/stderr.

# C. Regression carry-forward re-run

Execute the exact unchanged V3C regression harness:

`node V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs <EXACT_STEP4_DIR> <EXACT_V3_CANDIDATE_DIR>`

Require its terminal PASS and all protected Step1–4/delivery markers.

# D. Network boundary

The entire V3D run must end with:

- real Ozon requests = 0;
- real Performance requests = 0.

No live rerun is authorized.

# Verdict

`PREFREEZE_V3D_PASS` only if A, B, C and D all PASS with no mandatory UNPROVEN/FAIL.

Otherwise `PREFREEZE_V3D_FAILED` and record exact classification(s):

- `HARNESS_INTEGRITY_ERROR`
- `HARNESS_ERROR`
- `ENVIRONMENT_ERROR`
- `PRODUCTION_BEHAVIOR_FAILURE`

Do not convert one class into another.

# Report-only branch

Create report branch FROM EXACT:

`88a20984c55da1f813ca1184bd90089823f51883`

Branch:

`engineering/ozon-live-repair-prefreeze-executable-v3d-2026-08-18`

Create exactly one new file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_EXECUTABLE_V3D_REPORT_2026-08-18.md`

No production files, harnesses or plans may be added to the report branch.

After publishing the report, STOP.

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3D_RESULT

tested_base:
  <40-char base>

candidate_checkpoint:
  <40-char candidate>

worker:
  runner_integrity: PASS|FAIL
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
  runner_integrity: PASS|FAIL
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
  real_ozon_requests: <integer>
  real_performance_requests: <integer>

failure_classification:
  NONE|HARNESS_INTEGRITY_ERROR|HARNESS_ERROR|ENVIRONMENT_ERROR|PRODUCTION_BEHAVIOR_FAILURE|MULTIPLE

report_branch:
  engineering/ozon-live-repair-prefreeze-executable-v3d-2026-08-18

report_commit:
  <40-char sha>

verdict:
  PREFREEZE_V3D_PASS|PREFREEZE_V3D_FAILED
