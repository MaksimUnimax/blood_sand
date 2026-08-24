# Patch A.3 — Refresh response-boundary candidate manifest

Branch: `fix/ozon-work-session-refresh-response-boundary-2026-08-24`

Source rejection commit: `2dc38294cf99d0ac74a61f1f8417f4e9ecfa015b`

## Carried-forward accepted evidence

Unchanged product behavior remains accepted from prior browser runs:

- A — existing chat Start: PASS
- B — new empty chat Start: PASS
- C — Hide/Show: PASS
- F — Finish without Autorun + Start after Finish: PASS
- G-control — Work Send selected, persistent dictation not clicked: PASS
- G3 — three consecutive local `OZON_HELP_V1` deliveries: PASS
- H — stale/wrong pending identity fail-closed: PASS
- real Ozon Seller/Performance requests: 0
- Alice: environment-only NOT_EXECUTED

Only D and E require new execution.

## Confirmed Patch A.2 defect

The A.2 browser retest executed real visible and hidden Refresh routes.

The route response reported `runtime_reload_scheduled=true`, but the service-worker target did not change even after the bounded wait:

- D old target: `886443BF0DDE17B22F07458C85969899`; observed target remained identical;
- E old target: `FE7656E447533B8473E3ED62E21776B0`; observed target remained identical after 30 seconds;
- no new runtime generation;
- no `WORK_SESSION_REFRESH_RESUMED`.

Therefore the old-worker timer-based `setTimeout(() => chrome.runtime.reload(), 0)` did not provide a reliable MV3 message-event lifetime boundary.

## Root-cause correction

Patch A.3 changes exactly one production file from Patch A.2:

- `service_worker.js`

The correction has two linked parts.

### 1. Runtime reload is invoked at the active message-response boundary

The Refresh route now prepares durable recovery and the wake alarm, records `WORK_SESSION_REFRESH_RUNTIME_RELOAD_ARMED`, and returns an internal `runtime_reload_after_response` marker.

The common runtime message completion handler:

1. creates the public response;
2. removes the internal marker;
3. calls `sendResponse(publicResponse)`;
4. immediately calls `chrome.runtime.reload()` in the same active callback turn.

There is no timer or later old-worker callback between public acknowledgment and runtime reload.

### 2. The new runtime owns the AI-tab reload

A.2 reloaded the AI page before extension runtime reload. That can create a content script belonging to the old runtime and then invalidate it when the extension reloads.

A.3 removes the old-runtime page reload. During durable recovery resume, the new worker generation first calls `chrome.tabs.reload(recovery.tab_id)` itself and records `WORK_SESSION_REFRESH_POST_RUNTIME_TAB_RELOAD_SCHEDULED` with the new `WORKER_SESSION_ID`.

Only after that does the existing bounded A.2 reconnect loop wait for the fresh manifest content script and exact identity.

This preserves the same browser tab ID and conversation URL/identity while ensuring the content runtime belongs to the renewed extension generation.

## Fail-closed behavior

If post-runtime owner-tab reload fails:

- command acceptance remains false;
- session becomes `error`;
- matching durable recovery is removed;
- `WORK_REFRESH_TAB_RELOAD_FAILED` is recorded with the new runtime generation;
- no provider request/replay is created.

A.2 content reconnect timeout, exact identity correlation, generation handshake, hidden/visible restore, recovery cleanup and protected state preservation remain intact.

## Candidate identity

Patch A.2 base:

- production files: `19`
- `service_worker.js` SHA-256: `1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6`
- tree-manifest SHA-256: `ce4ab71244a4ffe7bad680cb99f10360ceec5f55e76410eb8b83d8b686234b3f`

Final Patch A.3:

- production files: `19`
- `service_worker.js` SHA-256: `d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770`
- sorted tree-manifest SHA-256: `ddb3cc38586191dd4d015e189847472157ff4ed00c54856f4a11ea4c1b249a21`

Tree-manifest SHA is SHA-256 over the UTF-8 concatenation, lexicographic path order, of:

`<relative-path>\0<file-sha256>\n`

for all 19 production files.

## Authorities

Audit-readable overlay:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A3_REFRESH_RESPONSE_BOUNDARY_2026-08-24.patch`

Deterministic materializer:

`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a3_refresh_response_boundary_candidate.py`

Dedicated regression:

`tooling/llm-api-bridges/ozon-seller/validation/WORK_SESSION_REFRESH_RESPONSE_BOUNDARY_REGRESSION_2026-08-24.mjs`

## Local validation against the exact A.3 tree

- production files: 19
- all production JavaScript: `node --check` PASS
- `WORK_SESSION_REFRESH_ROUTE_RESPONSE_BOUNDARY_PASS`
- `WORK_SESSION_REFRESH_POST_RUNTIME_TAB_RELOAD_PASS`
- `WORK_SESSION_REFRESH_DIRECT_RELOAD_AFTER_RESPONSE_PASS`
- `WORK_SESSION_REFRESH_A2_DURABLE_RECOVERY_PRESERVED_PASS`
- `WORK_SESSION_REFRESH_RESPONSE_BOUNDARY_REGRESSION_PASS`
- exact final `service_worker.js` SHA-256 PASS
- exact final tree-manifest SHA-256 PASS

Patch A.3 does not change provider transport, quota scheduling, cache/history, credentials, Manual delivery behavior, Work Send/dictation classification, content-script, popup, manifest or work-session model.

## Decision

`PATCH_A3_REFRESH_RESPONSE_BOUNDARY_READY_FOR_INDEPENDENT_D_E_BROWSER_RETEST`
