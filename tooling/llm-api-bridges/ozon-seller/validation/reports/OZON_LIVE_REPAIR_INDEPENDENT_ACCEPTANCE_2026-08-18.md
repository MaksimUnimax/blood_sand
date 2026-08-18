# Ozon live-repair independent synthetic acceptance

## Latest same-acceptance rerun — PASS

This section supersedes historical failed report commit `592f1d483a8b408f58ca10f0b114b25083474b03`. No new stage or branch was created.

Authority: frozen target `66bc4ac712b345d499b10982e7f5124279265b88`; authoritative Step-4 base `4ce190c8bbdc438dcdf407abbe4dbecd846736df`; exact V3 candidate `88a20984c55da1f813ca1184bd90089823f51883`.

Fresh environment: Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`; no installation or update. Integrity remained PASS and HEAD/merge-base remained the exact frozen target.

### Worker and regression

```text
node D:\codex\Test\qa-live-repair-independent-acceptance\worker-acceptance.mjs D:\codex\Test\qa-live-repair-independent-acceptance\v3-exact
exit=0
V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS
V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS
V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS
V3B_INCOMPATIBLE_CACHE_MISS_GUARDED_WAIT_PASS
V3B_GUARDED_DUE_ONE_PROVIDER_CALL_PASS
V3B_ONE_429_ONE_PROVIDER_CALL_PASS
V3B_ZERO_IMMEDIATE_RETRY_PASS
V3B_ZERO_ALARM_REPLAY_PASS
V3B_ZERO_STARTUP_REPLAY_PASS
V3B_RETRY_AFTER_EXTENSION_ONLY_PASS
V3_WORKER_ACTUAL_PATH_HARNESS_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
```

```text
node D:\codex\Test\qa-live-repair-independent-acceptance\regression-acceptance.mjs D:\codex\Test\qa-live-repair-independent-acceptance\step4-exact D:\codex\Test\qa-live-repair-independent-acceptance\v3-exact
exit=0
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_CARRY_FORWARD_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
```

### Independent Step 2–4

Step 2 command `node D:\codex\Test\qa-live-repair-independent-acceptance\step2-acceptance.mjs` exited `0`. The corrected temporary fixture reached actual `processBatchQueue`, one synthetic provider call, coalescing/projection, provider-error, restart, and unprojectable-response assertions. The report showed `external_request_executed: true`, `coalesced_logical_count: 3`, physical metrics `revenue, ordered_units, hits_view`, projected metric `revenue`, physical request id `physical-1`, and physical fingerprint `physical-fp`.

Step 3, cache, and queue commands each exited `0`:

```text
STEP3_INDEPENDENT_VERIFIER_SAFE_ERRORS_PASS
STEP3_INDEPENDENT_IDENTITY_PRIVACY_PASS
STEP3_INDEPENDENT_GLOBAL_QUOTA_RETRY_PASS
STEP3_INDEPENDENT_FAMILY_SCOPE_PASS
STEP4_INDEPENDENT_CACHE_SEMANTICS_PASS
STEP4_INDEPENDENT_CACHE_PRIVACY_ADMISSION_PASS
STEP4_INDEPENDENT_FIXED_PROFILE_PASS
STEP4_INDEPENDENT_QUEUE_CACHE_ZERO_QUOTA_PROVIDER_PASS
STEP4_INDEPENDENT_COALESCED_CACHE_FANOUT_PASS
STEP4_INDEPENDENT_CACHE_PROVENANCE_PASS
```

### Browser

Command used the accepted launcher endpoint `http://127.0.0.1:50502` and exited `0`:

```text
node D:\codex\Test\qa-live-repair-final-prefreeze-rerun-current\accepted-browser-run\accepted-v3-browser.mjs D:\codex\Test\qa-live-repair-independent-acceptance\v3-exact http://127.0.0.1:50502 D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64\chrome.exe
```

Fresh markers:

```text
ALICE_SYNTHETIC_DOCUMENT_INTERCEPTED=PASS
V3B_VISIBLE_WAIT_PLATE_PASS
V3B_THREE_DECREASING_SECONDS_PASS
V3B_ABSOLUTE_DUE_CLOCK_PASS
V3B_DUPLICATE_CLICK_BLOCKED_PASS
V3B_NATIVE_COPY_INDEPENDENT_PASS
V3B_TWO_OWNER_ISOLATION_INITIAL_PASS
V3B_RESTART_RESTORE_PASS
V3B_DUE_SENDING_STATE_PASS
V3B_TWO_OWNER_ISOLATION_PASS
V3B_CHATGPT_BINDING_PASS
V3B_ALICE_BINDING_PASS
V3B_NO_CROSS_OWNER_REGRESSION_PASS
OPERATOR_BROWSER_ACTIONS=0
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
V3_BROWSER_COUNTDOWN_HARNESS_PASS
HARNESS_CREATED_PAGES_REMAINING=0
```

The Alice precondition verified the synthetic marker, active ChatListItem, CodeBlock/message code, and standalone input. Stale pages were closed before the attempt and all harness-created pages were closed in `finally`.

### Latest result

```text
integrity=PASS
worker=PASS
step1_4_regression=PASS
step2_independent_actual_path=PASS
browser_ui=PASS
alice_synthetic_intercept=PASS
tab_cleanup=PASS
production_behavior_failure=NONE
real_ozon_requests=0
real_performance_requests=0
operator_browser_actions=0
failure_classification=NONE
verdict=INDEPENDENT_ACCEPTANCE_PASS
```

Date: 2026-08-18

## Authority and scope

- Tested frozen target: `66bc4ac712b345d499b10982e7f5124279265b88`
- Authoritative Step-4 base: `4ce190c8bbdc438dcdf407ab4be4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Report branch merge-base: `66bc4ac712b345d499b10982e7f5124279265b88`
- No production files, V3 patch, credentials, dependencies, or system settings were changed.
- `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `OPERATOR_BROWSER_ACTIONS=0`.

## Integrity

PASS. The checked-out HEAD and merge-base are exactly the frozen target and the worktree was clean before report creation. The candidate artifact hashes were:

```text
service_worker.js 34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a
content_script.js d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001
```

The MV3 manifest parsed successfully with version `0.1.19`; the candidate package contained only the expected six top-level files. The authoritative Step-4 worker hash was `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`.

## Environment

The existing accepted local environment was used without installation or update:

```text
Node v24.12.0
Puppeteer 25.4.0
CFT 151.0.7922.47
```

The unchanged local launcher command was `node D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`; it started CFT at `http://127.0.0.1:59253` with the dedicated `browser-profile-final-node` profile. Launcher stdout is preserved in `D:\codex\Test\qa-live-repair-independent-acceptance\launcher.stdout.txt`; stderr is `D:\codex\Test\qa-live-repair-independent-acceptance\launcher.stderr.txt`.

## Worker

PASS. Command:

```text
node D:\codex\Test\qa-live-repair-independent-acceptance\worker-acceptance.mjs
```

Exit code: `0`.

Observed stdout markers:

```text
V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS
V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS
V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS
V3B_INCOMPATIBLE_CACHE_MISS_GUARDED_WAIT_PASS
V3B_GUARDED_DUE_ONE_PROVIDER_CALL_PASS
V3B_ONE_429_ONE_PROVIDER_CALL_PASS
V3B_ZERO_IMMEDIATE_RETRY_PASS
V3B_ZERO_ALARM_REPLAY_PASS
V3B_ZERO_STARTUP_REPLAY_PASS
V3B_RETRY_AFTER_EXTENSION_ONLY_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
V3_WORKER_ACTUAL_PATH_HARNESS_PASS
WORKER_ACCEPTANCE_EXIT=0
```

The temporary fixture correction changed only the test fixture timing and VM storage representation; production artifacts were untouched.

## Step 1–4 regression

FAIL as a complete independent matrix because the legacy Step-2 queue fixture did not execute its intended synthetic provider path. The carry-forward regression and independent Step 3/4 checks passed:

```text
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_CARRY_FORWARD_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
STEP3_INDEPENDENT_VERIFIER_SAFE_ERRORS_PASS
STEP3_INDEPENDENT_IDENTITY_PRIVACY_PASS
STEP3_INDEPENDENT_GLOBAL_QUOTA_RETRY_PASS
STEP3_INDEPENDENT_FAMILY_SCOPE_PASS
STEP4_INDEPENDENT_CACHE_SEMANTICS_PASS
STEP4_INDEPENDENT_CACHE_PRIVACY_ADMISSION_PASS
STEP4_INDEPENDENT_FIXED_PROFILE_PASS
STEP4_INDEPENDENT_QUEUE_CACHE_ZERO_QUOTA_PROVIDER_PASS
STEP4_INDEPENDENT_COALESCED_CACHE_FANOUT_PASS
STEP4_INDEPENDENT_CACHE_PROVENANCE_PASS
```

The Step-2 command was `node D:\codex\Test\qa-live-repair-independent-acceptance\step2-acceptance.mjs`; its debug result had `external_request_executed:false` and `ReferenceError: [REDACTED_SECRET] is not defined` before the intended queue assertion. This is classified as a harness error, not a production behavior failure. Full temporary harness output remains in the acceptance working directory.

## Browser UI

FAIL / HARNESS_ERROR. Command:

```text
node D:\codex\Test\qa-live-repair-final-prefreeze-rerun-current\accepted-browser-run\accepted-v3-browser.mjs D:\codex\Test\qa-live-repair-independent-acceptance\v3-exact http://127.0.0.1:59253 D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64\chrome.exe
```

Exit code: `1`.

The harness reached ChatGPT A/B binding, but the Alice synthetic page was not intercepted and retained an existing Yandex DOM. Its exact diagnostic result was `applied:false`, `source:"alice_path_without_active_history"`, followed by:

```text
Error: browser waitFor timeout
```

No browser UI assertion was reached, no provider network was observed, and this run does not prove a production failure. Full combined stdout/stderr is preserved at `D:\codex\Test\qa-live-repair-independent-acceptance\browser.stdout-stderr.txt`.

## Verdict

`INDEPENDENT_ACCEPTANCE_FAIL` because the mandatory complete Step 1–4 matrix and browser UI gate were not fully proven in this run. No real Ozon or Performance request was made.
