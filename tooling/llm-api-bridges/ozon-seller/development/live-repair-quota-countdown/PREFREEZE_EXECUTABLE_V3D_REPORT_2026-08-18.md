# Ozon live-repair V3D executable harness report

Date: 2026-08-18
Scope: harness-correction execution gate only; not acceptance, live-provider testing, or release promotion.

## Authority and safety

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Repaired worker SHA: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- Repaired content SHA: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- Exact repaired tree: 17 files; protected fifteen byte-identical.
- `REAL_OZON_REQUESTS = 0`; `REAL_PERFORMANCE_REQUESTS = 0`.
- No production, V3 patch, harness source, dependency, browser, or credential changes were made.

## Environment

- Node: `v24.12.0`
- Existing Puppeteer QA project: `D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa`
- Existing Puppeteer: `25.4.0`
- CFT path: `D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe`
- CFT target: `151.0.7922.47`

## Raw harness transport

The exact live Git blobs were materialized by path. The supplied expected SHA mapping conflicts with the actual raw blob bytes:

| path/blob | bytes | actual SHA-256 | supplied expected SHA |
|---|---:|---|---|
| worker `0da73bdd1bb1608074781bb0c594c7875a4fe3ce` | 14382 | `10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0` | `92818e7348212f13a06a806ebb5e86776a877171d8344964ffc1dfbd66355d78` |
| browser `841429741d5ff9144a8a40506e657dc4392fe37c` | 12384 | `92818e7348212f13a06a806ebb5e86776a877171d8344964ffc1dfbd66355d78` | `05c8ce0d0799b4891b79f73cf1201a2ed187f0527128b35802286280988ea534` |
| regression `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` | 4152 | `05c8ce0d0799b4891b79f73cf1201a2ed187f0527128b35802286280988ea534` | `10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0` |

The V3D runners themselves matched authority:

- worker runner blob `541b38acd7d4f3a933d1130052562a6340084064`, 2419 bytes, SHA-256 `cdfc1ff6a16dc4ca0f1213545a7b1851f756af118c9466cb0f38eccee2af1e6f`;
- browser runner blob `05ac3864c852aa1a44744bf8f207596476ee6b53`, 2345 bytes, SHA-256 `fb6ae0600168970943a4eff59ee62d2c6c165661f3144e231496799f3e73191f`.

## Exact commands

Syntax commands all exited `0` with empty stdout/stderr:

```text
node --check V3D_WORKER_RACE_CORRECTION_RUNNER.mjs
node --check V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs
node --check ..\V3_WORKER_ACTUAL_PATH_HARNESS.mjs
node --check ..\V3_BROWSER_COUNTDOWN_HARNESS.mjs
node --check ..\V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs
```

Worker runner command:

```text
node V3D_WORKER_RACE_CORRECTION_RUNNER.mjs D:\\codex\\Test\\qa-live-repair-executable-v3d\\V3_WORKER_ACTUAL_PATH_HARNESS.mjs D:\\codex\\Test\\qa-live-repair-executable-v3d\\v3-exact
```

Exit code: `1`.

Output/stderr:

```text
Error: V3C worker harness SHA-256 mismatch
    at V3D_WORKER_RACE_CORRECTION_RUNNER.mjs:15:48
Node.js v24.12.0
```

The runner stopped at its integrity guard before applying the test-only +8000 ms fixture correction or executing production. Classification: `HARNESS_INTEGRITY_ERROR`.

Browser runner command:

```text
node V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs D:\\codex\\Test\\qa-live-repair-executable-v3d\\V3_BROWSER_COUNTDOWN_HARNESS.mjs D:\\codex\\Test\\qa-live-repair-executable-v3d\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Exit code: `1`.

Output/stderr:

```text
Error: V3C browser harness SHA-256 mismatch
    at V3D_BROWSER_MODULE_LOCATION_RUNNER.mjs:16:48
Node.js v24.12.0
```

The runner stopped at its integrity guard before copying or executing the browser harness. Classification: `HARNESS_INTEGRITY_ERROR`.

Regression command:

```text
node V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs D:\\codex\\Test\\qa-live-repair-executable-v3d\\step4-exact D:\\codex\\Test\\qa-live-repair-executable-v3d\\v3-exact
```

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

## Verdict

Both supplied V3D runners correctly rejected the exact path/blob materialization because the live Git blob contents do not match the SHA values the runners require. No runner was edited, no source bytes were swapped to force a pass, and no production execution was claimed. Classification: `HARNESS_INTEGRITY_ERROR`.

The V3D prefreeze gate therefore fails. Real Ozon and Performance request counts are both zero.
