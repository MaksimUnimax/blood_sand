# Patch A.2 — explicit Refresh wake candidate manifest

Branch: `fix/ozon-work-session-refresh-wake-2026-08-24`

Source rejection commit: `9be4e3769cca649c51cfe05ceac924c583eee159`

## Accepted evidence carried forward

The prior Patch A.1 browser evidence remains valid for unchanged production behavior:

- A — existing chat Start: PASS
- B — new empty chat Start: PASS
- C — Hide/Show: PASS
- F — Finish without Autorun + Start after Finish: PASS
- G-control — Work Send selected, persistent dictation not clicked: PASS
- G3 — three consecutive local `OZON_HELP_V1` deliveries: PASS
- H — stale/wrong pending identity fail-closed: PASS
- real Ozon Seller/Performance requests: 0
- Alice: environment-only NOT_EXECUTED

Only D and E remain rejected product scenarios.

## Confirmed Patch A.1 Refresh defect

The completion-only browser run executed the real `OZ_WORK_REFRESH` route for both visible and hidden work-sessions.

Observed:

- durable recovery was prepared;
- `chrome.runtime.reload()` destroyed the old MV3 service worker;
- no replacement service-worker target appeared in the accepted Puppeteer wait;
- therefore no new runtime generation executed `resumeWorkSessionRecoveries()`;
- no `WORK_SESSION_REFRESH_RESUMED` diagnostic appeared;
- visible/hidden restore could not occur.

Exact previous runner evidence included:

- `Error: new service worker target did not appear`
- `TargetCloseError: Protocol error (Runtime.callFunctionOn): Target closed`

This is a product lifecycle defect.

## Root cause

Patch A.1 relied on `chrome.runtime.reload()` alone. The implementation persisted a correct durable recovery intent but did not create a deterministic post-reload wake path for the new MV3 worker. It also attempted only one immediate content identity lookup when recovery resumed. Therefore two timing windows existed:

1. the new worker might never be instantiated promptly after runtime reload;
2. even if instantiated, it could race the reloaded page before the fresh manifest content script became ready.

## Patch A.2 behavior

Patch A.2 changes exactly one production file from Patch A.1:

- `service_worker.js`

No content-script, popup, manifest, provider, quota, cache, credentials or work-session-model file changes.

### Explicit recovery lifecycle

1. `beginWorkSessionRefresh()` performs the existing durable terminalization, records recovery, moves the session to `recovering`, closes command acceptance, and removes old extension-owned UI.
2. The route schedules a one-shot named wake alarm for the post-runtime generation. On Chrome versions supporting it, the alarm is created with `persistAcrossSessions: true`; a compatibility fallback create is attempted otherwise.
3. The extension itself invokes `chrome.tabs.reload(tab)` for the exact owner AI tab. The user is not required to manually reload or navigate.
4. Only after owner-tab reload is accepted does the route schedule `chrome.runtime.reload()`.
5. The page reload provides the normal manifest content-script bootstrap path. The wake alarm is a fallback event capable of instantiating the new MV3 service worker even if page/runtime timing does not do so immediately.
6. New-worker recovery is single-flight so startup and wake-alarm callbacks cannot concurrently mutate the same recovery.
7. Recovery waits up to 15 seconds, polling every 250 ms, for a fresh content runtime to answer `OZ_GET_IDENTITY`.
8. Once a valid identity is available, exact tab/origin/adapter/conversation correlation is still mandatory. A valid mismatching identity fails closed immediately; only not-yet-ready content runtime is retried.
9. The existing `OZ_WORK_RUNTIME_RENEW` handshake then proves the new runtime generation.
10. Durable state is restored to `active_visible` or `active_hidden` according to `expected_visible`.
11. Visible recovery re-enables command acceptance and creates fresh Ozon controls. Hidden recovery remains hidden until explicit Show.
12. `WORK_SESSION_REFRESH_RESUMED` records old and new runtime generations and restored state.
13. When no recovery remains, the fallback wake alarm is cleared.

The same browser tab ID and same conversation URL/identity must survive the extension-initiated document reload.

## Fail-closed behavior

If `chrome.tabs.reload(tab)` fails:

- runtime reload is not scheduled by this route;
- any scheduled wake alarm is cleared;
- the matching recovering session becomes `error`;
- the matching durable recovery record is removed;
- command acceptance remains closed;
- `WORK_SESSION_REFRESH_TAB_RELOAD_FAILED` is recorded;
- no provider request or replay is created.

If a fresh content runtime does not appear within the bounded reconnect window:

- recovery becomes `error` with `WORK_REFRESH_CONTENT_RECONNECT_TIMEOUT`;
- the recovery record is terminalized/removed;
- command acceptance remains closed;
- no provider replay occurs.

## Overlay authority

Audit-readable overlay specification:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A2_REFRESH_WAKE_2026-08-24.patch`

Exact deterministic executable authority:

`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a2_refresh_wake_candidate.py`

The materializer first reconstructs/verifies the exact Patch A.1 candidate and then applies only single-anchor Patch A.2 overlays.

## Candidate identity

Patch A.1 base:

- production files: `19`
- `service_worker.js` SHA-256: `f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c`
- tree-manifest SHA-256: `bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33`

Final Patch A.2:

- production files: `19`
- patched `service_worker.js` SHA-256: `1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6`
- sorted tree-manifest SHA-256: `ce4ab71244a4ffe7bad680cb99f10360ceec5f55e76410eb8b83d8b686234b3f`

Tree-manifest SHA is SHA-256 over the UTF-8 concatenation, in lexicographic path order, of:

`<relative-path>\0<file-sha256>\n`

for all 19 production files.

## Local validation

Passed against the exact final Patch A.2 candidate tree:

- `ALL_JS_SYNTAX_PASS`
- `WORK_SESSION_HIDE_SHOW_LEGAL_TRANSITIONS_PASS`
- `WORK_SESSION_FINISH_RETIRES_SESSION_PASS`
- `WORK_SESSION_FINISH_NO_AUTORUN_OPTIONAL_PASS`
- `WORK_SESSION_REFRESH_PHASE_TERMINALIZATION_PASS`
- `WORK_SESSION_REFRESH_SINGLE_FLIGHT_AND_RUNTIME_RENEWAL_PASS`
- `WORK_SESSION_REFRESH_GENERATION_HANDSHAKE_PASS`
- `WORK_SESSION_REFRESH_VISIBLE_HIDDEN_RESTORE_PASS`
- `WORK_SESSION_REFRESH_PROTECTED_SCHEDULER_PRESERVATION_PASS`
- `WORK_SESSION_REFRESH_REGRESSION_PASS`
- `WORK_SESSION_REFRESH_OWNER_TAB_BOOTSTRAP_PASS`
- `WORK_SESSION_REFRESH_PERSISTENT_WAKE_FALLBACK_PASS`
- `WORK_SESSION_REFRESH_CONTENT_RECONNECT_WAIT_PASS`
- `WORK_SESSION_REFRESH_RESUME_SINGLE_FLIGHT_PASS`
- `WORK_SESSION_REFRESH_RUNTIME_RELOAD_AFTER_TAB_RELOAD_PASS`
- `WORK_SESSION_REFRESH_TAB_RELOAD_FAILURE_FAIL_CLOSED_PASS`
- `WORK_SESSION_REFRESH_WAKE_REGRESSION_PASS`

Dedicated new regression:

`tooling/llm-api-bridges/ozon-seller/validation/WORK_SESSION_REFRESH_WAKE_REGRESSION_2026-08-24.mjs`

## Scope exclusions

Patch A.2 does not alter:

- provider dispatch or transport;
- quota scheduling or `next_allowed_at`;
- provider cache/history/no-replay evidence;
- credentials;
- Manual delivery state machine;
- Work send/dictation classifier;
- content-script code;
- popup code;
- work-session state model;
- G3 local delivery behavior;
- Alice adapter behavior.

## Decision

`PATCH_A2_REFRESH_WAKE_READY_FOR_INDEPENDENT_D_E_BROWSER_RETEST`
