# Ozon Bridge v0.1.19 — post-PASS repair freeze evidence

Date: 2026-08-18  
Status: `FROZEN_READY_FOR_INDEPENDENT_ACCEPTANCE`

## Frozen authority

- exact frozen Step-4 base: `4ce190c8bbdc438dcdf407ab4be4dbecd846736df`
- exact V3 production candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- exact repaired `service_worker.js` SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- exact repaired `content_script.js` SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- production delta: exactly the two repaired production files above; no other production logic was changed by this freeze evidence.
- protected 15 files: byte-identical regression PASS.

## Worker evidence

The final worker actual-path harness passed: manual durable quota wait, autorun durable quota wait, public-state privacy, incompatible-cache miss guarded wait, effective 65000 ms boundary, no provider call before due, exactly one provider call when due, one mocked 429 with exactly one provider call, zero immediate retry, zero alarm replay, zero startup replay, and Retry-After extension-only.

Markers included `V3_WORKER_ACTUAL_PATH_HARNESS_PASS`, `REAL_OZON_REQUESTS=0`, and `REAL_PERFORMANCE_REQUESTS=0`. Exit code: `0`.

## Regression evidence

The final regression harness passed protected 15-file identity, Step-1 security, Step-2 planner/projection, Step-3 integration surface, Step-4 cache/prefetch, delivery FSM, and protected contract functions. Marker: `V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`. Exit code: `0`.

## Browser UI evidence

The previously accepted launcher was reused unchanged:

`D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\launch-cft.mjs`

Accepted environment: Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`. The launcher proved dynamic DevToolsActivePort, Puppeteer connect, page targets, two pages, runtime `browser.installExtension`, MV3 service worker, and zero operator actions on its fixed QA fixture before the V3 run.

The exact V3 candidate was runtime-installed through that accepted endpoint. Synthetic ChatGPT A, ChatGPT B, and Alice pages were used; provider hosts were blocked; no credentials or real sites were used.

All required UI markers passed:

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
```

## Historical failure interpretation

V3C, V3D, V3E, V3F, and earlier final-gate failures were harness/materialization/environment failures, including invalid service-worker CDP assumptions, source bookkeeping, temporary fixture/context issues, and use of a non-accepted launcher path. They did not execute a failing actual production UI assertion and are not production defects. No V4 was needed.

## Freeze decision

Final consolidated pre-freeze decision: `FINAL_PREFREEZE_PASS`. This evidence commit is the frozen repair implementation target. Independent acceptance is authorized only as a separate next task after this commit; it is not executed here.

Safety totals: `REAL_OZON_REQUESTS=0`; `REAL_PERFORMANCE_REQUESTS=0`.
