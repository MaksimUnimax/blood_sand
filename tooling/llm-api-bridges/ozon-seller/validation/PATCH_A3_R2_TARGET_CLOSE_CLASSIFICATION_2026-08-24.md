# Patch A.3 R2 target-close classification

Branch: `fix/ozon-work-session-refresh-response-boundary-2026-08-24`

Historical R2 result:
`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A3_REFRESH_RESPONSE_BOUNDARY_CODEX_RESULT_R2_2026-08-24.md`

Historical R2 result commit:
`fd3bb0966a83d3d6d29ca158dde223679ca8f99f`

## Classification

The R2 run successfully materialized the exact Patch A.3 production candidate and entered the browser phase.

It proved an important A.3 behavior that A.2 did not achieve:

- `OZ_WORK_REFRESH` returned the A.3 response-boundary acknowledgment;
- the old service-worker target then closed;
- inspection through that old target failed with `TargetCloseError`.

The old target closing is an EXPECTED A.3 lifecycle event, not itself a product failure. Patch A.3 intentionally executes `chrome.runtime.reload()` immediately after sending the public Refresh response.

The R2 result does not contain browser-level CDP target lifecycle evidence showing that observation continued independently after the old worker target was destroyed. It records `TargetCloseError` while inspecting the old runtime and then reports that the required replacement runtime proof was not completed.

Therefore the evidence is insufficient to distinguish these two possibilities:

1. product failure: no replacement service-worker runtime was ever created/woken;
2. test-substrate failure: the replacement runtime existed or appeared after old-target teardown, but the harness lost its observation context when the old target closed.

D and E therefore remain unaccepted, but this R2 evidence must not be used as authority for a new production patch until browser-level target observation survives the expected old-worker teardown.

## Production identity remains unchanged

No production change is authorized by this classification.

Exact Patch A.3 candidate remains:

- production files: `19`
- `service_worker.js` SHA-256: `d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770`
- tree-manifest SHA-256: `ddb3cc38586191dd4d015e189847472157ff4ed00c54856f4a11ea4c1b249a21`

## Required next observation boundary

The next independent run must create a browser-level CDP target observer BEFORE invoking Refresh. That observer must not be attached only to the old service-worker target.

It must record at minimum:

- `Target.targetCreated`;
- `Target.targetDestroyed`;
- `Target.targetInfoChanged`;
- timestamps and target IDs/URLs;
- page navigation/load events for the owner AI tab.

After the Refresh response:

- destruction/closure of the old service-worker target is expected;
- `TargetCloseError` from any old-target session must be caught and classified as expected teardown;
- the harness must continue from the browser-level observer;
- only absence of any renewed extension service-worker execution within the full bounded wake window may be classified as product failure;
- if Chrome/CDP reuses a target representation, a new execution context plus a different `WORKER_SESSION_ID` is sufficient proof of runtime renewal;
- once renewed runtime exists, the run must continue through post-runtime same-tab reload, content reconnect, `WORK_SESSION_REFRESH_RESUMED`, state restore and functional button proof.

## Chrome lifecycle note

The tested environment is Chrome 151 with the extension loaded unpacked. The candidate uses `chrome.alarms` with `persistAcrossSessions: true`, supported in Chrome 150+, as the durable post-reload wake event. The test must allow that product event to wake the new service worker; it must not manually wake or reload the extension.

## Decision

`PATCH_A3_R2_INCONCLUSIVE_AFTER_EXPECTED_OLD_TARGET_TEARDOWN`

Next action:
`PATCH_A3_D_E_R3_BROWSER_LEVEL_TARGET_OBSERVER_RETEST`
