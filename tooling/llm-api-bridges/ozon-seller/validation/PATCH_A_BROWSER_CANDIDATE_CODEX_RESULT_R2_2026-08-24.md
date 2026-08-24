# Patch A browser candidate — R2 result

final_decision: `PATCH_A_BROWSER_CANDIDATE_REJECTED`

tested_branch: `test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24`
branch_head_fetched_before_testing: `932fd20579372972152253f1d8e3a6b3a844df6e`
transport_source: `tooling/llm-api-bridges/ozon-seller/validation/transport-r2/part-000.b64` through `part-020.b64`
historical_first_run_result_preserved: YES

## Candidate transport identity

- part count: 21
- parts `part-000.b64` through `part-019.b64`: 9000 bytes each
- `part-020.b64`: 2008 bytes
- every part Git blob SHA: PASS against the R2 integrity record
- concatenated base64 length: 182008
- reconstructed ZIP byte size: 136504
- reconstructed ZIP SHA-256: `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`
- reconstructed ZIP Git blob SHA: `7292fbbc4133ddad046da050c11d67adf9419183`
- fresh extraction production file count: 19
- historical truncated binary artifact: NOT_USED

The reconstructed ZIP was used as the only browser candidate. No candidate rebuild, repack, patch, or production edit was performed.

## Browser environment

- Node: v24.12.0
- Puppeteer: 25.4.0
- Chrome for Testing: 151.0.7922.47
- browser: isolated temporary profile, CFT, Puppeteer CDP
- browser pages: synthetic intercepted ChatGPT origin pages at `https://chatgpt.com`
- Alice: no established installed Alice browser environment was available
- provider requests observed by the test harness: 0

## Browser matrix A–I

### A — existing ChatGPT conversation Start

`NOT_EXECUTED` as a complete section. The actual existing-ID Start route did execute successfully: `OZ_WORK_START` returned `ok=true`, session `active_visible`, and the initial prompt click count was 1; a second Start returned `resent_prompt_only=true` and the count became 2. Autorun remained null. The required final functional Ozon button could not be proven because the synthetic document did not expose a recognized copy/code-block surface; observed Ozon button count was 0.

### B — new empty ChatGPT conversation Start

`PASS` for the executed assertions: initial prompt was delivered once, duplicate Start returned `WORK_START_ALREADY_PENDING`, and after the synthetic URL identity plus completed assistant response the session became `active_visible`. No fake ID was created by the worker route. Evidence: `duplicate_code=WORK_START_ALREADY_PENDING`, `new_send_count=1`, `state=active_visible`.

### C — Hide / Show

`NOT_EXECUTED` as a complete section. Worker Hide returned `ok=true` with `active_hidden`; the visible Ozon button count was 0 before and after because the synthetic code-block surface was not recognized. Show returned `ok=true` with `active_visible`, but a fresh functional button was not observable. The state-only portion passed; the required stale-button and fresh-button assertions remain unproven.

### D — explicit Refresh without page reload

`NOT_EXECUTED`. `OZ_WORK_REFRESH` was invoked, but the post-refresh assertion did not obtain the required successful reopened extension state. Exact final-run evidence: `AssertionError`, `Expected values to be strictly equal: false !== true`. No manual page reload was performed.

### E — Refresh while hidden

`NOT_EXECUTED`. The hidden-refresh continuation was not safely executable after the failed post-refresh substrate assertion. No claim of product PASS is made.

### F — Finish and Start after Finish

`FAIL` — actual production worker assertion executed and failed.

Action: sent `OZ_WORK_FINISH` for the active visible session.

Expected: `{ok:true}`, session transitions to `inactive`, and a later Start sends one prompt.

Observed exact response: `{ok:false, code:"AUTO_RUN_NOT_FOUND", error:"Autorun не найден."}`. The following settings snapshot showed `work_session.state="finishing"`, revision 5, rather than `inactive`. This is a production behavior failure in the Finish route; no provider request was made.

### G — ChatGPT Work / real Send / dictation / three deliveries

`NOT_EXECUTED` as a complete section. The exact Work selector was present and `aria-disabled="false"`; however the loaded page did not retain the required dictation control (`dictation_present=false`), so dictation discrimination was not proven. Three safe/local deliveries were not executed because no authorized provider/mock fixture was available; no real Ozon request was made.

### H — stale/wrong correlation fail-closed

`NOT_EXECUTED` as the complete matrix. One actual stale identity route was executed and returned `WORK_PENDING_STALE_OR_INVALID`. The required independent tab, origin, adapter, conversation, and revision cases were not all executed in the browser run.

### I — Alice

`NOT_EXECUTED`. Exact blocker: no established installed Alice browser environment was available in the accepted QA project. No synthetic Alice page was counted as Alice acceptance evidence.

## Supplemental existing regressions

- `WORK_SESSION_NEW_CHAT_PENDING_TRANSACTION_PASS`
- `WORK_SESSION_PENDING_START_SINGLE_FLIGHT_PASS`
- `WORK_SESSION_PENDING_IDENTITY_COMPLETION_GUARDED_PASS`
- `WORK_SESSION_CORRELATION_WRONG_INTENT_REVISION_ORIGIN_ADAPTER_REJECTED_PASS`
- `WORK_SESSION_PROMPT_FAILURE_TERMINAL_ERROR_PASS`
- `WORK_SESSION_TAB_CLOSE_AND_DELAYED_EVENT_FAIL_CLOSED_PASS`
- `WORK_SESSION_REFRESH_PHASE_TERMINALIZATION_PASS`
- `WORK_SESSION_REFRESH_SINGLE_FLIGHT_AND_RUNTIME_RENEWAL_PASS`
- `WORK_SESSION_REFRESH_GENERATION_HANDSHAKE_PASS`
- `WORK_SESSION_REFRESH_VISIBLE_HIDDEN_RESTORE_PASS`
- `WORK_SESSION_REFRESH_PROTECTED_SCHEDULER_PRESERVATION_PASS`
- `WORK_SESSION_REFRESH_REGRESSION_PASS`
- Existing pending-start static regression also reported `show/hide UI lifecycle route missing` at its `OZ_APPLY_MANUAL_MODE` assertion; this was recorded as evidence and not repaired.

## Safety and change accounting

- `REAL_OZON_BUSINESS_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `REAL_CHATGPT_REQUESTS=0` (synthetic intercepted pages only)
- operator browser actions: 0
- production code changed: 0
- candidate bytes changed: 0
- candidate rebuilt/repackaged: NO
- new release ZIP: NOT_BUILT
- production credentials changed: NO

The only repository change for R2 is this result/evidence file. The historical first-run result file remains unchanged.
