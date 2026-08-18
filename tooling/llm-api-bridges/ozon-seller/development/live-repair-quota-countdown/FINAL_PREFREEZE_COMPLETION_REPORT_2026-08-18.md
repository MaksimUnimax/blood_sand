# Ozon live-repair final consolidated pre-freeze report

Date: 2026-08-18
Scope: one consolidated engineering pre-freeze gate; not acceptance, live-provider testing, or release promotion.

## Authority and safety

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Repaired worker SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- Repaired content SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- Exact repaired tree: 17 production files; protected fifteen byte-identical.
- Node: `v24.12.0`; Puppeteer: `25.4.0`; CFT: `151.0.7922.47`.
- `REAL_OZON_REQUESTS = 0`; `REAL_PERFORMANCE_REQUESTS = 0`.
- No V4, production, V3 patch, dependency, credential, or normal-profile changes.

## Blob and runner integrity

Each source blob and the consolidated runner were materialized separately and individually checked with `git hash-object`; all exact object IDs passed:

- worker source: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`;
- browser source: `841429741d5ff9144a8a40506e657dc4392fe37c`;
- regression source: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`;
- consolidated runner: `bdf242f5cb78e506e67adb7b4d06fd0f585824f3`.

`node --check inputs/FINAL_PREFREEZE_COMPLETION_RUNNER.mjs` exited `0` with empty stdout/stderr.

## Exact consolidated command

```text
node inputs/FINAL_PREFREEZE_COMPLETION_RUNNER.mjs inputs/worker-source.mjs inputs/browser-source.mjs inputs/regression-source.mjs D:\\codex\\Test\\qa-live-repair-final-prefreeze\\step4-exact D:\\codex\\Test\\qa-live-repair-final-prefreeze\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Overall exit code: `1`.

## Complete runner output

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
    at AsyncAction2.execute (node:internal/timers:541:10)
    at process.processTimers (node:internal/timers:541:17) {
  [cause]: undefined
}

Node.js v24.12.0
===== FINAL_BROWSER_RUN_STDERR_END =====
FINAL_BROWSER_RUN_EXIT_CODE=1
FINAL_PREFREEZE_COMPLETION_FAILED
```

The worker and regression blocks passed completely. The browser block produced no browser assertion markers and failed with a Puppeteer timeout before completion; classification is `ENVIRONMENT_ERROR`, not a production assertion failure.

## Verdict

`FINAL_PREFREEZE_COMPLETION_FAILED` due to the browser block environment timeout. Real Ozon and Performance request counts are both zero.
