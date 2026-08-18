# Ozon Bridge v0.1.19 — V3C executable pre-freeze completion gate

Date: 2026-08-18
Status: execution-only engineering gate; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

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

Exact V3 concat SHA-256:

`aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

Expected repaired hashes:

- worker `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- content `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely before execution:

- `development/live-repair-quota-countdown/harness/HARNESS_MANIFEST_V3C_2026-08-18.md`
- V3 exact reconstruction report commit `82b8ec53830047902b8bfcc2886519ae6161fcaf`
- V3 behavioral report commit `0f29fda21c91230cb651dbc84cca2a5f4bc6f7e1`
- V3B report commit `213a9f3597973111cd71409908388d635c5741ef`
- accepted Step-3 validation report
- accepted Step-4 validation report.

The point of V3C is different from the prior gates: the test harness is already supplied. Do NOT replace it with generic smoke tests or prose inspection. Execute the exact harness blobs.

## Hard rules

- Do NOT create V4.
- Do NOT modify any production file.
- Do NOT modify any harness file.
- Do NOT rewrite the V3 patch.
- Do NOT use fuzz, reject mode or manual patch repair.
- Do NOT use real Seller or Performance credentials.
- Do NOT use the operator's normal Chrome profile.
- Do NOT contact real Ozon/Performance endpoints.
- `REAL_OZON_REQUESTS = 0`.
- `REAL_PERFORMANCE_REQUESTS = 0`.
- If a supplied harness fails, report the exact failure; do not substitute another test and do not mark the gate UNPROVEN without the failing command/stdout/stderr.

## 1. Reconstruct exact input trees

Reconstruct frozen Step 4 exactly as previously proven. Require 17/17 hashes and worker SHA:

`7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`

Apply exact V3 concat once, with normal exact patch application. Require:

- worker SHA `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- content SHA `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- exactly two changed production files
- protected fifteen byte-identical.

Use separate temporary directories, e.g. `step4-exact` and `v3-exact`.

## 2. Materialize exact harness blobs

Fetch these exact Git blobs from live GitHub into a temporary harness directory:

- worker harness blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser harness blob `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression harness blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

They correspond respectively to:

- `V3_WORKER_ACTUAL_PATH_HARNESS.mjs`
- `V3_BROWSER_COUNTDOWN_HARNESS.mjs`
- `V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs`

Do not copy a rendered Markdown excerpt. Use exact raw Git blob bytes.

Record byte size and SHA-256 of each materialized harness in the report.

## 3. Syntax gate

Run:

```text
node --check V3_WORKER_ACTUAL_PATH_HARNESS.mjs
node --check V3_BROWSER_COUNTDOWN_HARNESS.mjs
node --check V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs
```

All three must pass.

If any fails: classify `HARNESS_ERROR`, capture exact stderr, publish report, verdict `PREFREEZE_V3C_FAILED`, STOP.

## 4. Worker actual-path harness

Run the exact worker harness against the exact V3 directory:

```text
node V3_WORKER_ACTUAL_PATH_HARNESS.mjs <V3_EXACT_DIR>
```

This run uses a Node VM and in-process mocked `chrome.*` + mocked fetch. It must never contact network.

Require terminal marker:

`V3_WORKER_ACTUAL_PATH_HARNESS_PASS`

Require every intermediate PASS marker listed in `HARNESS_MANIFEST_V3C_2026-08-18.md`, specifically actual manual/autorun public state, privacy, guarded miss/due one-call, 429 one-call/no immediate/alarm/startup replay, Retry-After extension-only.

If it fails, preserve stdout/stderr and classify:

- `HARNESS_ERROR` if the test apparatus itself cannot represent a browser/worker API correctly;
- `PRODUCTION_BEHAVIOR_FAILURE` if the exact repaired production code executes and violates an asserted contract.

Do not repair either during the run.

## 5. Regression carry-forward harness

Run:

```text
node V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs <STEP4_EXACT_DIR> <V3_EXACT_DIR>
```

Require terminal marker:

`V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`

This is the bounded Step1/2/4/delivery closure for byte-identical files and exact protected worker-function bodies. Step3 changed quota functions are not carried forward; their affected semantics are covered freshly by the worker actual-path harness.

## 6. Browser countdown/binding harness

Use the same Chrome for Testing `151.0.7922.47` executable and Puppeteer `25.4.0` installation already proven in prior gates.

Run:

```text
node V3_BROWSER_COUNTDOWN_HARNESS.mjs <V3_EXACT_DIR> <CFT_CHROME_EXECUTABLE>
```

The supplied script itself must implement the accepted route:

`Node child_process.spawn -> CFT -> dynamic DevToolsActivePort -> Puppeteer connect -> browser.installExtension`

It serves synthetic ChatGPT/Alice documents by request interception on the supported origins. It does not use the operator profile and does not need internet content.

Require terminal marker:

`V3_BROWSER_COUNTDOWN_HARNESS_PASS`

Require all browser markers from the manifest, including:

- visible wait plate
- three decreasing seconds
- absolute due clock
- due sending state
- reload/restart restoration
- busy/duplicate-click block
- two-owner isolation
- ChatGPT binding
- Alice binding
- native Copy independence
- no cross-owner regression
- operator actions 0
- real Seller/Performance requests 0.

If Chrome/Puppeteer cannot execute the supplied harness because of a concrete environment/API mismatch, classify `ENVIRONMENT_ERROR` or `HARNESS_ERROR` with exact stderr. Do not silently replace the test.

## 7. Network hard gate

Across all V3C work:

- real Seller requests = `0`
- real Performance requests = `0`
- no real credentials
- mocked worker-harness provider calls do not count as real network and must stay inside the supplied fake fetch.

Any real Ozon/Performance request => `PREFREEZE_V3C_FAILED`.

## 8. Verdict

`PREFREEZE_V3C_PASS` only if:

- exact bytes PASS;
- all three exact harness blobs pass `node --check`;
- worker harness terminal PASS and all required markers PASS;
- regression harness terminal PASS;
- browser harness terminal PASS and all required markers PASS;
- real network counters both 0;
- there is no required UNPROVEN item.

Otherwise `PREFREEZE_V3C_FAILED`.

A `HARNESS_ERROR`/`ENVIRONMENT_ERROR` is still a failed prefreeze gate, but is not a production-defect claim.

## 9. Report-only publication

Create branch from exact candidate checkpoint:

`engineering/ozon-live-repair-prefreeze-executable-v3c-2026-08-18`

Base exactly:

`88a20984c55da1f813ca1184bd90089823f51883`

Create exactly one file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_EXECUTABLE_V3C_REPORT_2026-08-18.md`

Commit message:

`test: execute Ozon live repair V3C harness`

Report must include:

- exact base/candidate hashes;
- harness Git blob SHA, byte size, SHA-256;
- Node/Puppeteer/CFT versions;
- exact commands;
- exit code for each command;
- complete PASS marker matrix;
- for any nonzero exit: relevant stdout/stderr and classification;
- real network counters;
- final verdict.

Branch must be one report-only commit ahead of exact candidate. Push and STOP.

## 10. Final response format

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3C_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  88a20984c55da1f813ca1184bd90089823f51883

harness_syntax:
  worker: PASS|FAIL
  browser: PASS|FAIL
  regression: PASS|FAIL

worker_actual_path:
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
  NONE|HARNESS_ERROR|ENVIRONMENT_ERROR|PRODUCTION_BEHAVIOR_FAILURE

report_branch:
  engineering/ozon-live-repair-prefreeze-executable-v3c-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_V3C_PASS|PREFREEZE_V3C_FAILED

After publishing: STOP. Wait for ChatGPT live-GitHub review before freeze.