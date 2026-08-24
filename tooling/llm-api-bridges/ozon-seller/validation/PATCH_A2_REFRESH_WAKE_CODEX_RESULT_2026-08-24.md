# Patch A.2 Refresh wake D/E retest

## Identity

- Tested branch: `fix/ozon-work-session-refresh-wake-2026-08-24`
- Starting HEAD: `c5a547c68ab7344668be1f7e92b5f090528577d6`
- Candidate was freshly materialized outside the repository production tree.
- Production file count: 19
- `service_worker.js` SHA-256: `1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6`
- Tree manifest SHA-256: `ce4ab71244a4ffe7bad680cb99f10360ceec5f55e76410eb8b83d8b686234b3f`
- All required A1/A2 materialization markers were observed, including persistent wake fallback and content reconnect wait markers.
- Independent 19-file inventory and both hashes: PASS.
- `node --check` for every production JavaScript file: PASS (`ALL_JS_SYNTAX_PASS`).

## Environment

- CFT: Chrome 151.0.7922.47
- Puppeteer: 25.4.0
- Node: v24.19.0
- Synthetic intercepted ChatGPT Work page; no operator profile or manual browser actions.

## Carried-forward evidence

Accepted unchanged evidence from `9be4e3769cca649c51cfe05ceac924c583eee159` and its referenced result: A PASS, B PASS, C PASS, F PASS, G-control PASS, G3 PASS, H PASS, provider requests 0. G3 was not repeated.

## D — explicit Refresh, active_visible

Result: `FAIL`.

The real production route was invoked exactly once after establishing an active-visible session and functional Ozon button. The route response passed the required assertions: `ok=true`, `page_reload_scheduled=true`, and `runtime_reload_scheduled=true` (the A2 response also exposes the wake fallback in the same route). The same synthetic URL/tab was used; the harness did not reload or navigate the ChatGPT page.

Observed service-worker target evidence:

- old target ID: `886443BF0DDE17B22F07458C85969899`
- current target list after the bounded wait: the same target ID and same service-worker URL
- required new target: not observed
- exact harness error: `Error: NEW_WORKER_NOT_OBSERVED old=886443BF0DDE17B22F07458C85969899 targets=[{"id":"886443BF0DDE17B22F07458C85969899","url":"chrome-extension://ehcmnnjaolhkbalhjbneddhpbgihlbek/service_worker.js"}]`

Because no new runtime target appeared, no matching `WORK_SESSION_REFRESH_RESUMED`, new runtime generation, cleared recovery record, or post-refresh fresh-button proof could be established. D is an executed product lifecycle failure under the instruction’s acceptance criteria.

## E — Refresh while active_hidden

Result: `FAIL`.

In a fresh browser session, the production Hide route first produced `active_hidden` and zero Ozon buttons. The real `OZ_WORK_REFRESH` route was then invoked exactly once while hidden, without harness reload/navigation. Its response was:

- `ok=true`
- `page_reload_scheduled=true`
- `runtime_reload_scheduled=true`
- `wake_alarm_scheduled=true`
- recovery ID: `work-recovery-c632f4b5-77d7-4241-b016-c31e617d4c28`
- old runtime generation: `worker-7f6dbf07-9c94-438e-8e26-36e7599c41ed`
- old service-worker target ID: `FE7656E447533B8473E3ED62E21776B0`
- target after 30 seconds: `FE7656E447533B8473E3ED62E21776B0` (same target)
- `same_target=true`
- post-refresh diagnostics: empty; no `WORK_SESSION_REFRESH_RESUMED`

The pre-refresh state was `active_hidden`, with command acceptance disabled and zero Ozon buttons. Since the required old-to-new target transition and hidden recovery proof did not occur, E is an executed product lifecycle failure. Show/visible restore was not attempted after the failed hidden renewal.

## Regression markers

`WORK_SESSION_HIDE_SHOW_LEGAL_TRANSITIONS_PASS`, `WORK_SESSION_FINISH_RETIRES_SESSION_PASS`, `WORK_SESSION_STALE_ILLEGAL_TRANSITION_REJECTED_PASS`, `WORK_SESSION_REFRESH_PHASE_TERMINALIZATION_PASS`, `WORK_SESSION_REFRESH_SINGLE_FLIGHT_AND_RUNTIME_RENEWAL_PASS`, `WORK_SESSION_REFRESH_GENERATION_HANDSHAKE_PASS`, `WORK_SESSION_REFRESH_VISIBLE_HIDDEN_RESTORE_PASS`, `WORK_SESSION_REFRESH_PROTECTED_SCHEDULER_PRESERVATION_PASS`, `WORK_SESSION_REFRESH_REGRESSION_PASS`, `WORK_SESSION_FINISH_NO_AUTORUN_OPTIONAL_PASS`, `WORK_SESSION_FINISH_EXISTING_AUTORUN_STOP_PRESERVED_PASS`, `WORK_SESSION_REFRESH_OWNER_TAB_BOOTSTRAP_PASS`, `WORK_SESSION_REFRESH_PERSISTENT_WAKE_FALLBACK_PASS`, `WORK_SESSION_REFRESH_CONTENT_RECONNECT_WAIT_PASS`, `WORK_SESSION_REFRESH_RESUME_SINGLE_FLIGHT_PASS`, `WORK_SESSION_REFRESH_RUNTIME_RELOAD_AFTER_TAB_RELOAD_PASS`, `WORK_SESSION_REFRESH_TAB_RELOAD_FAILURE_FAIL_CLOSED_PASS`, `WORK_SESSION_REFRESH_WAKE_REGRESSION_PASS`.

## Counters and decision

- `REAL_OZON_SELLER_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`
- `REAL_CHATGPT_REQUESTS = 0`
- `OPERATOR_BROWSER_ACTIONS = 0`
- production code modified by tester: `0`
- Alice: `NOT_EXECUTED_ENVIRONMENT_ONLY`; no established installed Alice environment was available.

Final decision: `PATCH_A2_BROWSER_CANDIDATE_REJECTED`

Failed product scenarios: D explicit active-visible Refresh wake/recovery; E hidden Refresh wake/recovery. Alice is environment-only and is not the rejection reason.
