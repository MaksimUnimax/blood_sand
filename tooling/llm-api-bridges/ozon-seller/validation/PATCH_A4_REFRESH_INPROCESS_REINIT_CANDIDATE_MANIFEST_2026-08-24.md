# Patch A.4 — Work-session Refresh in-process runtime reinitialization

Branch: `fix/ozon-work-session-refresh-inprocess-reinit-2026-08-24`

Source confirmed product rejection:
- result: `tooling/llm-api-bridges/ozon-seller/validation/PATCH_A3_REFRESH_RESPONSE_BOUNDARY_CODEX_RESULT_R3_2026-08-24.md`
- commit: `ef856d1618d410fccdd748afa671bc39d8c05a0e`
- classification in both D and E: `WORK_REFRESH_NEW_RUNTIME_NOT_WOKEN_AFTER_RELOAD`

## Confirmed A.3 root cause

A.3 proved that `chrome.runtime.reload()` can terminate/invalidate the current extension runtime, but the browser test also proved that no renewed service-worker execution is guaranteed to appear afterward without an external extension event.

R3 installed a browser-root CDP observer before Refresh and kept it alive for 45 seconds after the Refresh response. In both visible and hidden flows it observed no new service-worker target, no reused-target renewed execution context, and no new `WORKER_SESSION_ID`. Therefore the A.3 scheme depended on a bootstrap that the extension itself could not guarantee after killing its own runtime.

The old wake-alarm approach does not solve this boundary: an alarm listener lives in the extension runtime that must first exist to receive the alarm. A durable recovery record is useful after a natural worker restart, but it cannot itself force a dead/reloaded extension runtime to execute.

## Specification authority

The Patch A lifecycle specification requires `Обновить` to provide a real stuck-session recovery and says:

- the service-worker runtime is genuinely **renewed or reinitialized** through a supported extension lifecycle mechanism;
- stale content-script handlers and old Ozon button records cannot execute;
- the already-open supported AI page gets a fresh functional content-script/button lifecycle without manual user reload;
- no command is automatically replayed;
- credentials, quota families/`next_allowed_at`, provider cache/history/no-replay evidence, alarms/schedules, settings and other conversations must survive.

The specification does **not** require `chrome.runtime.reload()` or a different physical worker process/target. Patch A.4 therefore uses the explicitly allowed `reinitialized` path rather than continuing to depend on self-bootstrap after physical extension reload.

## Patch A.4 architecture

Patch A.4 changes exactly one production file from the exact A.3 candidate:

- `service_worker.js`

### 1. Physical worker identity remains stable

`WORKER_SESSION_ID` remains the physical service-worker boot/request-ownership identity used by provider/no-replay logic.

Patch A.4 does not rotate it during current-conversation Refresh. This is intentional: globally changing provider request ownership just to repair one conversation could corrupt or invalidate unrelated conversations' in-flight ownership.

### 2. Work-session recovery gets its own generation

Patch A.4 introduces:

`workSessionRuntimeGeneration`

Each explicit Refresh durably records:

- `old_runtime_generation`
- a fresh `new_runtime_generation`
- unchanged physical `worker_session_id`

The current work-session generation is rotated before recreating the page/content lifecycle. This generation is only a Work-session/UI recovery generation; it is not provider request ownership.

### 3. No physical extension self-reload

The `OZ_WORK_REFRESH` route contains no `chrome.runtime.reload()` and no delayed runtime-reload timer.

Instead, after `beginWorkSessionRefresh()` has terminalized the current logical operation according to no-replay rules, hidden the current Ozon UI and persisted durable recovery, A.4 records:

`WORK_SESSION_REFRESH_RUNTIME_REINITIALIZED`

with the same `WORKER_SESSION_ID` and different old/new Work runtime generations.

### 4. Fresh same-tab document/content lifecycle

A.4 installs a `chrome.tabs.onUpdated` completion barrier **before** calling `chrome.tabs.reload(ownerTab)`.

The barrier requires an observed transition:

`loading -> complete`

for the exact owner tab. It removes its listener on success, failure or timeout.

Only after this real same-tab reload completes does A.4 record:

`WORK_SESSION_REFRESH_TAB_RELOAD_COMPLETED`

The user does not manually reload the page.

### 5. Fresh content runtime handshake and restoration

After document reload completion, the existing bounded reconnect loop waits for the fresh manifest content script and exact conversation identity.

The service worker then sends:

`OZ_WORK_RUNTIME_RENEW`

with the durable `new_runtime_generation`.

The content script stops its Manual observer, tears down stale button state, acknowledges the exact generation and produces a fresh `ui_record_generation`.

The worker then restores exactly the prior state:

- `active_visible` -> command acceptance true + fresh Ozon button lifecycle;
- `active_hidden` -> command acceptance false + zero Ozon buttons until explicit Show.

Successful completion records:

`WORK_SESSION_REFRESH_RESUMED`

with `old_runtime_generation != new_runtime_generation` and the unchanged physical `worker_session_id`.

### 6. Protected state remains protected

Patch A.4 does not clear/reinitialize:

- Seller/Performance credentials;
- provider quota families or `next_allowed_at`;
- provider cache/history/no-replay records;
- provider request ownership of other conversations;
- Autorun state of other conversations;
- bindings of other conversations;
- global settings;
- delivery/batch single-flight maps globally.

The current conversation operation is still terminalized by the pre-existing durable Refresh rules before UI/runtime reinitialization.

## Exact candidate identity

Patch A.3 base identity:

- production files: `19`
- `service_worker.js` SHA-256: `d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770`
- tree-manifest SHA-256: `ddb3cc38586191dd4d015e189847472157ff4ed00c54856f4a11ea4c1b249a21`

Patch A.4 final identity:

- production files: `19`
- `service_worker.js` SHA-256: `a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc`
- sorted 19-file tree-manifest SHA-256: `acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0`

Tree-manifest SHA is SHA-256 over the UTF-8 concatenation, lexicographic relative-path order, of:

`<relative-path>\0<file-sha256>\n`

## Authorities

Audit overlay:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A4_REFRESH_INPROCESS_REINIT_2026-08-24.patch`

Deterministic materializer:

`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a4_refresh_inprocess_reinit_candidate.py`

Dedicated regression:

`tooling/llm-api-bridges/ozon-seller/validation/WORK_SESSION_REFRESH_INPROCESS_REINIT_REGRESSION_2026-08-24.mjs`

## Local validation against exact A.4 tree

- production files: `19`
- all production JavaScript: `node --check` PASS
- `WORK_SESSION_HIDE_SHOW_LEGAL_TRANSITIONS_PASS`
- `WORK_SESSION_FINISH_RETIRES_SESSION_PASS`
- `WORK_SESSION_STALE_ILLEGAL_TRANSITION_REJECTED_PASS`
- `WORK_SESSION_FINISH_NO_AUTORUN_OPTIONAL_PASS`
- `WORK_SESSION_FINISH_EXISTING_AUTORUN_STOP_PRESERVED_PASS`
- `WORK_SESSION_FINISH_RETIRES_SESSION_PASS`
- `WORK_SESSION_REFRESH_SEPARATE_RUNTIME_GENERATION_PASS`
- `WORK_SESSION_REFRESH_INPROCESS_ROUTE_PASS`
- `WORK_SESSION_REFRESH_FRESH_DOCUMENT_BARRIER_PASS`
- `WORK_SESSION_REFRESH_GENERATION_HANDSHAKE_PASS`
- `WORK_SESSION_REFRESH_PROTECTED_STATE_PASS`
- `WORK_SESSION_REFRESH_INPROCESS_REINIT_REGRESSION_PASS`
- deterministic A.4 materializer reproduced exact service-worker SHA and exact tree SHA from an exact A.3 input.

### Historical regression note

`WORK_SESSION_REFRESH_REGRESSION_2026-08-23.mjs` is preserved as historical evidence but contains a source-shape assertion that specifically requires `chrome.runtime.reload()` and `new_runtime_generation: WORKER_SESSION_ID`.

That assertion is superseded for Patch A.4 because the governing specification explicitly permits runtime **reinitialization**, and A.4 deliberately separates Work-session recovery generation from physical provider worker ownership. The historical file must not be edited or used as a rejection gate for A.4. Its phase-terminalization/state principles remain represented by the newer A.4 regression and browser gates.

## Decision

`PATCH_A4_REFRESH_INPROCESS_REINIT_READY_FOR_INDEPENDENT_D_E_BROWSER_RETEST`
