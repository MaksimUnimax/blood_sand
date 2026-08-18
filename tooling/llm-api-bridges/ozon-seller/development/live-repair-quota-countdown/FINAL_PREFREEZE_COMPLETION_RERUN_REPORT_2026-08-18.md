# Ozon live-repair final pre-freeze same-gate rerun report

## Accepted-launcher completion rerun — PASS — 2026-08-18

The prior environment-blocked result is superseded for this run. The previously accepted launcher was used unchanged:

`D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\launch-cft.mjs`

Its live GitHub acceptance report was read completely from commit `a5539c8663bb6b48dce197f59e0abfe2d388af93`. The launcher produced dynamic endpoint `http://127.0.0.1:61888`, using Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`, its exact executable, exact spawn arguments, dedicated `browser-profile-final-node`, and `runtime browser.installExtension`.

Accepted-launcher sanity result: `ACCEPTED_LAUNCHER_ENVIRONMENT_PASS`. It proved page targets, `browser.newPage()`, two independent pages, runtime extension installation, and MV3 service-worker target on the existing fixed QA fixture. `OPERATOR_BROWSER_ACTIONS=0`.

### Exact V3 production integrity

- frozen Step-4 base: `4ce190c8bbdc438dcdf407ab4be4dbecd846736df`
- exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- `service_worker.js` SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- production delta: exactly the repaired `service_worker.js` and `content_script.js`; protected 15-file byte-identical regression passed.

### Final worker and regression results

Worker final actual-path harness exited `0` and emitted all required PASS markers: manual public state, autorun public state, privacy, incompatible-cache guarded wait, guarded-due one provider call, one-429 one provider call, zero immediate retry, zero alarm replay, zero startup replay, Retry-After extension-only, `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, and `V3_WORKER_ACTUAL_PATH_HARNESS_PASS`.

Regression final harness exited `0` and emitted `V3B_PROTECTED_15_BYTE_IDENTICAL_PASS`, Step-1 security, Step-2 planner/projection, Step-4 cache/prefetch, delivery FSM, Step-3 integration surface, protected contract functions, and `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`.

### Final V3 browser UI result

The temporary UI test connected to the endpoint produced by the accepted `launch-cft.mjs` lifecycle and installed the exact V3 candidate with runtime `browser.installExtension`. No `/json/new`, custom Chrome spawn, ServiceWorker.enable, or ServiceWorker.startWorker was used. Provider hosts were blocked and no credentials were present.

Exact browser command:

```text
node D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\accepted-browser-run\\accepted-v3-browser.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\v3-exact http://127.0.0.1:61888 D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe
```

Exit code: `0`.

Complete required browser markers:

```text
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
V3_ACCEPTED_BROWSER_EXIT=0
```

Final pre-freeze verdict: `FINAL_PREFREEZE_PASS`. Historical V3C/V3D/V3E/V3F/final failures were harness/environment failures: source materialization/bookkeeping, prohibited or unavailable service-worker CDP assumptions, temporary launcher target discovery, and temporary fixture/context issues. None executed actual production UI assertions and none is classified as a production defect. No V4 was needed. No real Ozon or Performance request occurred.

## Final in-run harness-corrected gate — 2026-08-18

This is the final same-task attempt requested from the live development authority. No new stage, branch, V4, production edit, V3 patch edit, dependency installation, or real provider request was made. The existing report branch remains report-only relative to `88a20984c55da1f813ca1184bd90089823f51883`.

The frozen scope and existing report were read from live GitHub. The temporary external browser harness was corrected in-run only: extension-owned popup context was attempted; no service-worker target, `ServiceWorker.enable`, or `ServiceWorker.startWorker` was required; CFT page-target creation and Puppeteer target discovery were diagnosed with the existing Node `v24.12.0`, Puppeteer `25.4.0`, and CFT `151.0.7922.47`.

### Final consolidated command

```text
node D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\FINAL_PREFREEZE_COMPLETION_RUNNER_CORRECTED.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\worker-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\browser-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\regression-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\step4-exact D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Exit code: `1`.

### Complete final consolidated stdout/stderr

```text
FINAL_SOURCE_GIT_BLOB_INTEGRITY_PASS
FINAL_PRODUCTION_HASH_INTEGRITY_PASS
FINAL_WORKER_TEST_FIXTURE_CORRECTION_PASS
FINAL_WORKER_REALM_SAFE_STORAGE_PASS
FINAL_BROWSER_EXTENSION_DEBUG_LAUNCH_CORRECTION_PASS
FINAL_BROWSER_NODE_MODULES_JUNCTION_PASS
FINAL_TRANSFORMED_HARNESS_SYNTAX_PASS
===== FINAL_WORKER_RUN_STDOUT_BEGIN =====
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
===== FINAL_WORKER_RUN_STDOUT_END =====
===== FINAL_WORKER_RUN_STDERR_BEGIN =====
===== FINAL_WORKER_RUN_STDERR_END =====
FINAL_WORKER_RUN_EXIT_CODE=0
===== FINAL_REGRESSION_RUN_STDOUT_BEGIN =====
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
===== FINAL_REGRESSION_RUN_STDOUT_END =====
===== FINAL_REGRESSION_RUN_STDERR_BEGIN =====
===== FINAL_REGRESSION_RUN_STDERR_END =====
FINAL_REGRESSION_RUN_EXIT_CODE=0
===== FINAL_BROWSER_RUN_STDOUT_BEGIN =====
DEBUG_JSON_NEW=200 {
  "type": "page",
  "url": "about:blank"
}
DEBUG_TARGETS_BEFORE_INSTALL=[{"type":"browser","url":""},{"type":"other","url":""}]
DEBUG_SESSION_METHODS=["constructor","setTarget","target","connection","detached","parentSession","send","onMessage","detach","onClosed","id","hasCallback","getPendingProtocolErrors"]
DEBUG_CONN_METHODS=["constructor","delay","timeout","rejectEmulateNetworkConditionsCalls","_closed","_idGenerator","_sessions","_session","url","send","_rawSend","closeBrowser","onMessage","dispose","isAutoAttached","_createSession","createSession","getPendingProtocolErrors"]
===== FINAL_BROWSER_RUN_STDOUT_END =====
===== FINAL_BROWSER_RUN_STDERR_BEGIN =====
file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232
            throw new TimeoutError(`Timed out after waiting ${ms}ms`, { cause });
                  ^

TimeoutError: Timed out after waiting 10000ms
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1944:31
    at OperatorSubscriber2._this._next (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1001:9)
    at Subscriber2.next (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:704:12)
    at AsyncAction2.<anonymous> (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:2288:31)
    at AsyncAction2._execute (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1368:12)
    at AsyncAction2.execute (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1357:22)
    at AsyncScheduler2.flush (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1435:26)
    at listOnTimeout (node:internal/timers:605:17)
    at process.processTimers (node:internal/timers:541:7) {
  [cause]: undefined
}

Node.js v24.12.0
===== FINAL_BROWSER_RUN_STDERR_END =====
FINAL_BROWSER_RUN_EXIT_CODE=1
FINAL_PREFREEZE_COMPLETION_FAILED
FINAL_CORRECTED_CONSOLIDATED_EXIT=1
```

### Final classification

Worker actual-path harness: PASS. Regression harness: PASS. Browser UI assertions: NOT EXECUTED. The existing CFT process exposes a page through `/json/new` (`HTTP 200`, `type=page`), but Puppeteer `25.4.0` connected to the browser endpoint exposes only `browser` and `other` targets (`pages=0`); `browser.newPage()` hangs and `waitForTarget(type=page)` times out. The extension popup/content-script route therefore cannot be reached in this environment after reasonable temporary harness corrections.

Classification: `ENVIRONMENT_BLOCKED`. Production behavior was not asserted and is not classified as a production failure.

Final status: `FINAL_PREFREEZE_FAILED`. `REAL_OZON_REQUESTS=0`; `REAL_PERFORMANCE_REQUESTS=0`. No post-PASS freeze evidence or acceptance plan was created because PASS was not achieved.

## Current correction rerun — correction commit `f07c63b2145090fb78ed01b355f4d5eea740a126`

This section supersedes the earlier same-gate result below. The existing report branch and report file were updated in place; no new stage or branch was created.

Authority remained frozen Step-4 base `4ce190c8bbdc438dcdf407abbe4dbecd846736df` and exact V3 candidate `88a20984c55da1f813ca1184bd90089823f51883`. No production, V3 patch, dependency, credential, or normal-profile changes were made. `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, and `OPERATOR_BROWSER_ACTIONS=0`.

### Current object integrity

Each object was materialized separately and checked with a separate `git hash-object` command. Observed exact hashes:

- original runner: `bdf242f5cb78e506e67adb7b4d06fd0f585824f3`
- current rerun wrapper: `25fc65b021b1b74f37b995d9609b1ecd5c2bc612`
- worker source: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser source: `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression source: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Both `node --check` commands exited `0` with empty stdout/stderr.

### Exact command and result

```text
node D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\FINAL_PREFREEZE_COMPLETION_RERUN_WRAPPER.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\FINAL_PREFREEZE_COMPLETION_RUNNER.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\worker-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\browser-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\inputs\\regression-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\step4-exact D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun-current\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Exit code: `1`.

Complete consolidated stdout/stderr:

```text
FINAL_RERUN_ORIGINAL_RUNNER_GIT_BLOB=bdf242f5cb78e506e67adb7b4d06fd0f585824f3
FINAL_RERUN_SERVICE_WORKER_WAKE_PATCH_ONLY=PASS
FINAL_SOURCE_GIT_BLOB_INTEGRITY_PASS
FINAL_PRODUCTION_HASH_INTEGRITY_PASS
FINAL_WORKER_TEST_FIXTURE_CORRECTION_PASS
FINAL_WORKER_REALM_SAFE_STORAGE_PASS
FINAL_BROWSER_EXTENSION_DEBUG_LAUNCH_CORRECTION_PASS
FINAL_BROWSER_SERVICE_WORKER_WAKE_CORRECTION_PASS
FINAL_BROWSER_NODE_MODULES_JUNCTION_PASS
FINAL_TRANSFORMED_HARNESS_SYNTAX_PASS
===== FINAL_WORKER_RUN_STDOUT_BEGIN =====
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
===== FINAL_WORKER_RUN_STDOUT_END =====
===== FINAL_WORKER_RUN_STDERR_BEGIN =====
===== FINAL_WORKER_RUN_STDERR_END =====
FINAL_WORKER_RUN_EXIT_CODE=0
===== FINAL_REGRESSION_RUN_STDOUT_BEGIN =====
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
===== FINAL_REGRESSION_RUN_STDOUT_END =====
===== FINAL_REGRESSION_RUN_STDERR_BEGIN =====
===== FINAL_REGRESSION_RUN_STDERR_END =====
FINAL_REGRESSION_RUN_EXIT_CODE=0
===== FINAL_BROWSER_RUN_STDOUT_BEGIN =====
===== FINAL_BROWSER_RUN_STDOUT_END =====
===== FINAL_BROWSER_RUN_STDERR_BEGIN =====
===== FINAL_BROWSER_RUN_STDERR_END =====
FINAL_BROWSER_RUN_EXIT_CODE=1
FINAL_PREFREEZE_COMPLETION_FAILED
file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232
            throw new TimeoutError(`Timed out after waiting ${ms}ms`, { cause });
                  ^
TimeoutError: Timed out after waiting 20000ms
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at listOnTimeout (node:internal/timers:605:17)
    at process.processTimers (node:internal/timers:541:7) {
  [cause]: undefined
}
Node.js v24.12.0
SAME_GATE_EXIT=1
```

Worker and regression fully passed. Browser produced no assertion markers and failed while waiting for the exact extension service-worker target after native wake, before browser assertions. Classification: `ENVIRONMENT_ERROR`. Verdict: `FINAL_PREFREEZE_FAILED`.

Verbatim browser stderr captured by the command (complete):

```text
FINAL_PREFREEZE_COMPLETION_FAILED
file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232
            throw new TimeoutError(`Timed out after waiting ${ms}ms`, { cause });
                  ^

TimeoutError: Timed out after waiting 20000ms
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/util.js:232:19
    at file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1944:31
    at OperatorSubscriber2._this._next (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1001:9)
    at Subscriber2.next (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:704:12)
    at AsyncAction2.<anonymous> (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:2288:31)
    at AsyncAction2._execute (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1368:26)
    at AsyncScheduler2.flush (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/third_party/rxjs/rxjs.js:1435:26)
    at listOnTimeout (node:internal/timers:605:17)
    at process.processTimers (node:internal/timers:541:7) {
  [cause]: undefined
}

Node.js v24.12.0
```

Date: 2026-08-18
Scope: same final pre-freeze gate rerun only; not acceptance, live-provider testing, or release promotion.

## Authority and safety

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Repaired worker SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- Repaired content SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- Node: `v24.12.0`; Puppeteer: `25.4.0`; CFT: `151.0.7922.47`.
- `REAL_OZON_REQUESTS = 0`; `REAL_PERFORMANCE_REQUESTS = 0`.
- No V4, new stage, production, V3 patch, dependency, credential, or normal-profile changes.

## Individual Git blob integrity

Each object was materialized separately and checked with an individual `git hash-object` command:

- original runner: `bdf242f5cb78e506e67adb7b4d06fd0f585824f3`;
- rerun wrapper: `b48b7afbe94c09ff6df4538f914709572dfdf0e3`;
- worker source: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`;
- browser source: `841429741d5ff9144a8a40506e657dc4392fe37c`;
- regression source: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`.

Original runner and rerun wrapper `node --check` both exited `0` with empty stdout/stderr. Production hashes and exact 17-file/protected-file checks passed.

## Exact same-gate command

```text
node inputs/FINAL_PREFREEZE_COMPLETION_RERUN_WRAPPER.mjs inputs/FINAL_PREFREEZE_COMPLETION_RUNNER.mjs inputs/worker-source.mjs inputs/browser-source.mjs inputs/regression-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun\\step4-exact D:\\codex\\Test\\qa-live-repair-final-prefreeze-rerun\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Overall exit code: `1`.

## Complete consolidated stdout/stderr

```text
FINAL_RERUN_ORIGINAL_RUNNER_GIT_BLOB=bdf242f5cb78e506e67adb7b4d06fd0f585824f3
FINAL_RERUN_SERVICE_WORKER_WAKE_PATCH_ONLY=PASS
FINAL_SOURCE_GIT_BLOB_INTEGRITY_PASS
FINAL_PRODUCTION_HASH_INTEGRITY_PASS
FINAL_WORKER_TEST_FIXTURE_CORRECTION_PASS
FINAL_WORKER_REALM_SAFE_STORAGE_PASS
FINAL_BROWSER_EXTENSION_DEBUG_LAUNCH_CORRECTION_PASS
FINAL_BROWSER_SERVICE_WORKER_WAKE_CORRECTION_PASS
FINAL_BROWSER_NODE_MODULES_JUNCTION_PASS
FINAL_TRANSFORMED_HARNESS_SYNTAX_PASS
===== FINAL_WORKER_RUN_STDOUT_BEGIN =====
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
===== FINAL_WORKER_RUN_STDOUT_END =====
===== FINAL_WORKER_RUN_STDERR_BEGIN =====
===== FINAL_WORKER_RUN_STDERR_END =====
FINAL_WORKER_RUN_EXIT_CODE=0
===== FINAL_REGRESSION_RUN_STDOUT_BEGIN =====
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
===== FINAL_REGRESSION_RUN_STDOUT_END =====
===== FINAL_REGRESSION_RUN_STDERR_BEGIN =====
===== FINAL_REGRESSION_RUN_STDERR_END =====
FINAL_REGRESSION_RUN_EXIT_CODE=0
===== FINAL_BROWSER_RUN_STDOUT_BEGIN =====
===== FINAL_BROWSER_RUN_STDOUT_END =====
===== FINAL_BROWSER_RUN_STDERR_BEGIN =====
===== FINAL_BROWSER_RUN_STDERR_END =====
FINAL_BROWSER_RUN_EXIT_CODE=1
FINAL_PREFREEZE_COMPLETION_FAILED
file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/CallbackRegistry.js:102
    #error = new ProtocolError();
             ^

ProtocolError: Protocol error (ServiceWorker.enable): 'ServiceWorker.enable' wasn't found
    at <instance_members_initializer> (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/CallbackRegistry.js:102:14)
    at new Callback (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/CallbackRegistry.js:106:16)
    at CallbackRegistry.create (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/common/CallbackRegistry.js:25:26)
    at CdpSession.send (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/cdp/CdpSession.js:72:14)
    at file:///C:/Users/unyma/AppData/Local/Temp/ozon-final-prefreeze-eRG8CU/browser/FINAL_BROWSER_HARNESS.mjs:36:20

Node.js v24.12.0
```

The worker and regression blocks fully passed. The browser correction reached the CDP wake step but the existing CFT/Puppeteer environment rejected `ServiceWorker.enable` before any browser assertion markers; classification: `ENVIRONMENT_ERROR`.

## Verdict

`FINAL_PREFREEZE_FAILED` due to the browser environment/CDP protocol failure. No real Ozon or Performance request occurred.
