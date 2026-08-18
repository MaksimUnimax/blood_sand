# Ozon live-repair V3C executable harness report

Date: 2026-08-18
Scope: execution-only engineering gate; not acceptance, live-provider testing, or release promotion.

## Exact inputs and safety

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- V3 repaired worker SHA: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- V3 repaired content SHA: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- Frozen worker SHA: `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- Frozen content SHA: `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- V3 concat SHA: `aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`
- Exact repaired input tree: 17 files; exactly two production files differ and protected fifteen are byte-identical.
- `REAL_OZON_REQUESTS = 0`; `REAL_PERFORMANCE_REQUESTS = 0`.
- No real credentials, production changes, V3 patch changes, fuzz, reject mode, or manual repair.

## Supplied harness materialization

Raw Git blobs were materialized without Markdown rendering:

| harness | Git blob | bytes | SHA-256 |
|---|---|---:|---|
| `V3_WORKER_ACTUAL_PATH_HARNESS.mjs` | `0da73bdd1bb1608074781bb0c594c7875a4fe3ce` | 14382 | `92818e7348212f13a06a806ebb5e86776a877171d8344964ffc1dfbd66355d78` |
| `V3_BROWSER_COUNTDOWN_HARNESS.mjs` | `841429741d5ff9144a8a40506e657dc4392fe37c` | 12384 | `05c8ce0d0799b4891b79f73cf1201a2ed187f0527128b35802286280988ea534` |
| `V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs` | `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` | 4152 | `10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0` |

Environment versions: Node `v24.12.0`; Puppeteer `25.4.0`; CFT executable `Chrome/151.0.7922.47` from the supplied path.

## Exact commands and results

### Syntax commands

| command | exit code | stdout | stderr |
|---|---:|---|---|
| `node --check V3_WORKER_ACTUAL_PATH_HARNESS.mjs` | 0 | empty | empty |
| `node --check V3_BROWSER_COUNTDOWN_HARNESS.mjs` | 0 | empty | empty |
| `node --check V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs` | 0 | empty | empty |

### Worker actual-path harness

Command:

`node V3_WORKER_ACTUAL_PATH_HARNESS.mjs D:\\codex\\Test\\qa-live-repair-executable-v3c\\v3-exact`

Exit code: `1`.

stdout before failure:

```text
V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS
V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS
V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS
```

stderr/terminal failure:

```text
file:///D:/codex/Test/qa-live-repair-executable-v3c/harness/V3_WORKER_ACTUAL_PATH_HARNESS.mjs:101
  throw new Error('waitFor timeout');
        ^
Error: waitFor timeout
    at waitFor (file:///D:/codex/Test/qa-live-repair-executable-v3c/harness/V3_WORKER_ACTUAL_PATH_HARNESS.mjs:101:9)
    at async file:///D:/codex/Test/qa-live-repair-executable-v3c/harness/V3_WORKER_ACTUAL_PATH_HARNESS.mjs:163:15
Node.js v24.12.0
```

The exact repaired production worker and actual runtime handlers executed far enough to pass manual state, autorun state, and privacy. The timeout occurred in the supplied guarded incompatible-cache-miss scenario before the required wait/due markers. Classification: `PRODUCTION_BEHAVIOR_FAILURE`.

### Regression carry-forward harness

Command:

`node V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs D:\\codex\\Test\\qa-live-repair-executable-v3c\\step4-exact D:\\codex\\Test\\qa-live-repair-executable-v3c\\v3-exact`

Exit code: `0`.

stdout:

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

stderr: empty.

### Browser countdown harness

Command:

`node V3_BROWSER_COUNTDOWN_HARNESS.mjs D:\\codex\\Test\\qa-live-repair-executable-v3c\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe`

Exit code: `1`.

stdout: empty.

stderr/terminal failure:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'puppeteer-core' imported from D:\\codex\\Test\\qa-live-repair-executable-v3c\\harness\\V3_BROWSER_COUNTDOWN_HARNESS.mjs
Node.js v24.12.0
```

The supplied browser harness did not start because its exact execution environment could not resolve its declared `puppeteer-core` import. Classification: `ENVIRONMENT_ERROR`. It was not replaced with another browser test.

## Marker matrix

- Worker actual path: manual PASS; autorun PASS; privacy PASS; incompatible miss guarded wait FAIL; due one provider call UNPROVEN; 429 one-call UNPROVEN; zero immediate retry UNPROVEN; zero alarm replay UNPROVEN; zero startup replay UNPROVEN; Retry-After extension-only UNPROVEN.
- Regression carry-forward: terminal PASS; protected fifteen PASS; Step 1 security PASS; Step 2 planner/projection PASS; Step 3 integration surface PASS; Step 4 cache/prefetch PASS; delivery FSM PASS.
- Browser countdown: all required browser markers UNPROVEN because the supplied harness had `ENVIRONMENT_ERROR` before execution.

## Verdict

The V3C gate fails: the supplied worker harness produced a production-behavior failure in the guarded cache-miss path, and the supplied browser harness produced an environment error. No real Ozon or Performance request occurred.
