# Ozon live-repair V3E Git-blob executable report

Date: 2026-08-18
Scope: harness-integrity correction execution gate only; not acceptance, live-provider testing, or release promotion.

## Authority and safety

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Repaired worker SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- Repaired content SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- Exact repaired tree: 17 production files; protected fifteen byte-identical.
- Node: `v24.12.0`; Puppeteer: `25.4.0`; CFT target: `151.0.7922.47`.
- `REAL_OZON_REQUESTS = 0`; `REAL_PERFORMANCE_REQUESTS = 0`.
- No V4, production, V3 patch, dependency, credential, or normal-profile changes.

## Git object integrity

Each object was materialized separately and checked with an individual `git hash-object` command:

| file | command result |
|---|---|
| `worker-source.mjs` | `0da73bdd1bb1608074781bb0c594c7875a4fe3ce` |
| `browser-source.mjs` | `841429741d5ff9144a8a40506e657dc4392fe37c` |
| `regression-source.mjs` | `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` |
| `worker-runner.mjs` | `9f0df0c911316fcc8850506937aa10f987cadb3f` |
| `browser-runner.mjs` | `d6ba37ab27b5f71b6be1c7dec8b8a82db95fdd83` |

All five one-to-one mappings passed. The V3D SHA-256 labeling was not used as authority.

## Syntax commands

All commands exited `0` with empty stdout/stderr:

```text
node --check inputs/worker-runner.mjs
node --check inputs/browser-runner.mjs
node --check inputs/worker-source.mjs
node --check inputs/browser-source.mjs
node --check inputs/regression-source.mjs
```

## Worker runner

Exact command:

```text
node inputs/worker-runner.mjs D:\\codex\\Test\\qa-live-repair-executable-v3e\\inputs\\worker-source.mjs D:\\codex\\Test\\qa-live-repair-executable-v3e\\v3-exact
```

Exit code: `1`.

stdout/stderr:

```text
V3E_WORKER_SOURCE_GIT_BLOB=0da73bdd1bb1608074781bb0c594c7875a4fe3ce
V3E_WORKER_SOURCE_SHA256=10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0
V3E_WORKER_CORRECTED_SHA256=cf09ef7946bf69feb0f0594c9c434a2f8338d5de9f0f890685f88d0057e5d7b1
V3E_WORKER_RACE_FIX_ONLY=PASS
V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS
V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS
V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS
Error: waitFor timeout
    at waitFor (file:///C:/Users/unyma/AppData/Local/Temp/ozon-v3e-worker-YkYW9c/V3E_WORKER_ACTUAL_PATH_HARNESS.mjs:101:9)
    at async file:///C:/Users/unyma/AppData/Local/Temp/ozon-v3e-worker-YkYW9c/V3E_WORKER_ACTUAL_PATH_HARNESS.mjs:163:15
Node.js v24.12.0
```

The V3E runner applied only the permitted test-fixture race correction and the exact repaired worker then timed out in the guarded incompatible-cache-miss scenario. Classification: `PRODUCTION_BEHAVIOR_FAILURE`.

## Browser runner

Exact command:

```text
node inputs/browser-runner.mjs D:\\codex\\Test\\qa-live-repair-executable-v3e\\inputs\\browser-source.mjs D:\\codex\\Test\\qa-live-repair-executable-v3e\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Exit code: `1`.

stdout: empty.

stderr:

```text
Error: EPERM: operation not permitted, open 'D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\.v3e-browser-harness-15652-1787036983656.mjs'
    at file:///D:/codex/Test/qa-live-repair-executable-v3e/inputs/browser-runner.mjs:24:4
Node.js v24.12.0
```

The Git blob integrity check and existing Puppeteer package resolution passed, but the runner could not write its required relocated harness file into the existing QA project root. No browser assertion ran. Classification: `ENVIRONMENT_ERROR`.

## Regression harness

Exact command:

```text
node inputs/regression-source.mjs D:\\codex\\Test\\qa-live-repair-executable-v3e\\step4-exact D:\\codex\\Test\\qa-live-repair-executable-v3e\\v3-exact
```

Exit code: `0`, stderr empty. Required markers:

```text
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
```

## Verdict

V3E fails with multiple classifications: `PRODUCTION_BEHAVIOR_FAILURE` from the corrected actual worker path and `ENVIRONMENT_ERROR` from the browser runner's required relocation write. No real Ozon/Performance request occurred.
