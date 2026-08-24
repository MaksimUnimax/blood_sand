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

This is a product lifecycle defect, not an Alice/environment classification issue.

## Root cause

Patch A.1 relied on `chrome.runtime.reload()` alone. Runtime reload terminates the current extension runtime, but the implementation did not create a deterministic post-reload browser event that would immediately instantiate the new MV3 service worker. The durable recovery record therefore had no guaranteed new worker execution context in which to resume.

## Patch A.2 behavior

Patch A.2 changes exactly one production file from Patch A.1:

- `service_worker.js`

Before scheduling `chrome.runtime.reload()`, the real `OZ_WORK_REFRESH` route now initiates `chrome.tabs.reload(tab)` for the exact owner AI tab.

Required lifecycle:

1. `beginWorkSessionRefresh()` performs the existing durable terminalization, records recovery, moves the session to `recovering`, closes command acceptance, and hides old extension UI.
2. The extension itself reloads the same owner tab. This is part of the explicit operator `Обновить` action; the user is not required to manually reload or navigate.
3. The route then schedules `chrome.runtime.reload()`.
4. The reloaded supported AI document receives the manifest-declared content scripts afresh.
5. The fresh content runtime communicates with the reloaded extension, causing the new MV3 service worker generation to execute.
6. The new worker's existing startup `resumeWorkSessionRecoveries()` path validates the same tab/origin/adapter/conversation and restores `active_visible` or `active_hidden` according to the durable recovery record.
7. Visible recovery creates fresh extension-owned Ozon buttons; hidden recovery stays hidden until Show.

The same browser tab ID and same conversation URL/identity must be preserved. The page document is intentionally reloaded by the extension as part of recovery.

## Fail-closed tab-reload failure

If `chrome.tabs.reload(tab)` itself fails:

- runtime reload is NOT scheduled by this route;
- the matching recovering session is moved to `error`;
- the matching durable recovery record is removed;
- command acceptance remains closed;
- `WORK_SESSION_REFRESH_TAB_RELOAD_FAILED` is recorded;
- no provider request or replay is created.

## Patch file

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A2_REFRESH_WAKE_2026-08-24.patch`

## Deterministic candidate materialization

Materializer:

`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a2_refresh_wake_candidate.py`

It first materializes the exact accepted Patch A.1 candidate, verifies its hash, then applies the single Patch A.2 Refresh overlay.

Patch A.1 base identity:

- production files: `19`
- `service_worker.js` SHA-256: `f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c`
- tree-manifest SHA-256: `bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33`

Patch A.2 candidate identity:

- production files: `19`
- patched `service_worker.js` SHA-256: `9ccb1e82581c6710e0fba2cf284fbe90735589dd69b36226e423f583ef0894fe`
- sorted tree-manifest SHA-256: `fdf683a2f3b5466efbd5a5906463108ad5e38d584e1d000692cde6a90e6a29f4`

Tree-manifest SHA is SHA-256 over the UTF-8 concatenation, in lexicographic path order, of:

`<relative-path>\0<file-sha256>\n`

for all 19 production files.

## Local validation

Passed against the exact Patch A.2 candidate tree:

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
