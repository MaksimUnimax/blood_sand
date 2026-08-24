# Patch A.1 completion-only retest result

- Tested branch: `fix/ozon-work-session-finish-no-autorun-2026-08-24`
- Starting HEAD: `3027033f0930e697a6ba5ceed29ac61e90dc6f21`
- Prior evidence accepted: `735029a09e93a54cd68d9fe66484bbef26e6b12b` for A/B/C/F/G-control/H.
- Candidate production files: 19
- `service_worker.js` SHA-256: `f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c`
- Tree manifest SHA-256: `bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33`
- Candidate production bytes were not modified.

## D — explicit Refresh, active visible

Result: `FAIL`.

Executed the real `OZ_WORK_REFRESH` route once after establishing `active_visible` on the same synthetic ChatGPT Work page. The response scheduled runtime recovery, after which the existing browser page reported the content runtime turning Manual OFF. The required replacement worker target was not observable before the Puppeteer wait expired. Exact runner failure:

`Error: new service worker target did not appear`

The subsequent CFT/Puppeteer session also emitted:

`TargetCloseError: Protocol error (Runtime.callFunctionOn): Target closed`

Therefore no valid `WORK_SESSION_REFRESH_RESUMED` evidence, new runtime generation, recovery-record clearing, or post-refresh same-page functional-button proof was available. D is not PASS.

## E — Refresh while hidden

Result: `FAIL`.

Executed Hide first and verified the session entered `active_hidden` with zero Ozon buttons, then invoked `OZ_WORK_REFRESH` once without page navigation. The browser target closed during runtime renewal before a new worker target and resumed diagnostic could be observed. Exact error:

`TargetCloseError: Protocol error (Runtime.callFunctionOn): Target closed`

No valid `WORK_SESSION_REFRESH_RESUMED` evidence or hidden restore/Show proof was available. E is not PASS.

## G3 — three consecutive local OZON_HELP_V1 deliveries

Result: `PASS`.

All three operations used only local guidance (`OZON_HELP_V1`, cluster `stock_inventory`) and the Work send completion basis `work_submit_disabled_after_click`:

| # | operation_id | delivery_id | delivery sendClicks | dictationClicks | external_request_executed |
|---|---|---|---:|---:|---|
| 1 | `ozmanual-44f5f1df-8368-4409-88dc-37b6468447cf` | `manual-delivery-ba9f0243-a8ee-44e5-9e5e-250f3c8a0139` | 2 | 0 | false |
| 2 | `ozmanual-a27a7195-e315-4553-8bbc-cae1b1c79e43` | `manual-delivery-12addaed-93d2-4768-8b9c-d4fc65b810e8` | 3 | 0 | false |
| 3 | `ozmanual-4a2e0c25-1c1b-45a8-a108-f0fe556946d7` | `manual-delivery-579509ad-b2f0-44de-a6a5-e852c936f66d` | 4 | 0 | false |

The counter values include the initial Work Start prompt; each delivery incremented `sendClicks` exactly once, and the three delivery deltas total exactly three. For each delivery the diagnostics contained `MANUAL_BATCH_ACCEPTED`, `GUIDANCE_CLUSTER_SELECTED` with `external_request_executed=false`, `BATCH_COLLECTION_COMPLETED`, `DELIVERY_INSERT_COMMITTED`, `DELIVERY_INSERTED`, `SEND_CLICKED`, `DELIVERY_CONFIRMATION_RECEIVED`, and `DELIVERY_SUCCESS`. The persistent dictation control remained present and was never clicked. Provider network counter was 0.

## Counters and environment-only status

- `REAL_OZON_SELLER_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`
- `REAL_CHATGPT_REQUESTS = 0`
- `OPERATOR_BROWSER_ACTIONS = 0`
- Production code modified by tester: `0`
- Alice: `NOT_EXECUTED_ENVIRONMENT_ONLY` — no established installed Alice environment was available.

## Final decision

`PATCH_A1_BROWSER_CANDIDATE_REJECTED`

Failed product scenarios: D explicit Refresh active-visible runtime renewal; E hidden Refresh runtime renewal/restore. Alice is environment-only and is not the rejection reason.
