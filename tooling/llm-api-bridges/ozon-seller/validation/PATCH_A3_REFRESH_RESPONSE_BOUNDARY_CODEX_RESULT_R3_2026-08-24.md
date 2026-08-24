# Patch A.3 Refresh response-boundary — R3 root-observer retest

## Tested authority and candidate

- Branch: `fix/ozon-work-session-refresh-response-boundary-2026-08-24`
- Starting HEAD: `2b369e33a5599f87bc85dc0a16f297c2c90e00d2`
- Candidate materializer: `materialize_patch_a3_refresh_response_boundary_candidate.py`
- Production files: `19`
- `service_worker.js` SHA-256: `d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770`
- Tree-manifest SHA-256: `ddb3cc38586191dd4d015e189847472157ff4ed00c54856f4a11ea4c1b249a21`

All A1/A2/A3 materializer markers passed, including `PATCH_A3_A2_BASE_IDENTITY_PASS`, `PATCH_A3_RESPONSE_BOUNDARY_RELOAD_PASS`, `PATCH_A3_NO_TIMER_RUNTIME_RELOAD_PASS`, `PATCH_A3_POST_RUNTIME_TAB_RELOAD_PASS`, `PATCH_A3_SERVICE_WORKER_SHA256_PASS`, `PATCH_A3_PRODUCTION_FILE_COUNT_19_PASS`, and `PATCH_A3_TREE_MANIFEST_SHA256_PASS`.

All candidate JavaScript syntax checks passed. `WORK_SESSION_MODEL_REGRESSION_2026-08-21.mjs`, `WORK_SESSION_REFRESH_REGRESSION_2026-08-23.mjs`, and `WORK_SESSION_REFRESH_RESPONSE_BOUNDARY_REGRESSION_2026-08-24.mjs` passed their applicable markers. The pre-existing pending-start regression reached its pending-state markers, then stopped on its legacy source-shape assertion `show/hide UI lifecycle route missing`; this did not substitute for either browser D/E assertion.

Historical A.3 and R2 reports were preserved unchanged.

## Environment and observer setup

- Node: `v24.12.0`
- Puppeteer: `25.4.0`
- Chrome for Testing: `151.0.7922.47`
- Extension ID: `hadjlhcmgidljnjndfhkphibmjfgokhj`
- Worker URL: `chrome-extension://hadjlhcmgidljnjndfhkphibmjfgokhj/service_worker.js`

Before Start and every Refresh, the harness created a browser-root CDP session and enabled `Target.setDiscoverTargets({discover:true})`. It recorded `Target.targetCreated`, `Target.targetDestroyed`, and `Target.targetInfoChanged`; it also created an independent owner-page CDP observer with `Page.enable`, `Page.setLifecycleEventsEnabled`, and lifecycle/frame-navigation listeners. The root observer was not attached to the old worker and survived both Refresh invocations.

No manual extension reload, toggle, or worker wake was performed.

## D — ACTIVE_VISIBLE: FAIL

Start established `active_visible` with command acceptance and an Ozon button. Refresh was invoked exactly once using the content-runtime message path.

Public response:

```json
{"ok":true,"runtime_reload_scheduled":true,"page_reload_deferred_to_new_runtime":true,"wake_alarm_scheduled":true}
```

Old worker target and generation:

- Target: `CE5B38AC379CBCD13E8C883A460AF54A`
- `WORKER_SESSION_ID`: `worker-beae81f2-3b49-4f89-b10f-cfc1979b7676`

The only relevant root target lifecycle event was `Target.targetDestroyed` for `774F621E057253A0BD1CEC94C405D725` immediately after the response. It was the closing extension-page transport target, not the old worker target. The old worker session did not produce a successful post-response evaluation; its bounded teardown probe timed out, which was logged as expected old-session non-observation and did not abort the root observer.

For the full 45-second root-observer window, no newly created worker target, no reused-target renewed execution context, and no different `WORKER_SESSION_ID` appeared for the extension worker URL. Therefore there is no eligible new worker CDP session and no product-owned post-runtime page reload, fresh content reconnect, `WORK_SESSION_REFRESH_POST_RUNTIME_TAB_RELOAD_SCHEDULED`, or `WORK_SESSION_REFRESH_RESUMED` evidence. The independent owner-page observer recorded only paint/interactive lifecycle events, not a same-tab document reload.

Classification: `WORK_REFRESH_NEW_RUNTIME_NOT_WOKEN_AFTER_RELOAD`.

## E — ACTIVE_HIDDEN: FAIL

An independent fresh browser run established `active_visible`, executed production Hide, and proved `active_hidden` with zero Ozon buttons before Refresh. Refresh was then invoked exactly once.

Public response:

```json
{"ok":true,"runtime_reload_scheduled":true,"page_reload_deferred_to_new_runtime":true,"wake_alarm_scheduled":true}
```

Old worker target and generation:

- Target: `E46FB4C0379CA0CA9242191C973CF718`
- `WORKER_SESSION_ID`: `worker-ca99a929-bb1d-4a1b-b49d-11e4bf891e92`

The root observer again remained live. Its only target-destroyed event was `82E09842029315D7464FD7D61C5B0BDC`, the extension-page transport target, not the worker target. The old-worker bounded teardown probe timed out; no old-worker TargetCloseError was allowed to escape and terminate the harness.

Across the full 45-second root-observer window, no renewed extension worker execution appeared: there was no new worker target, no later distinct worker execution context for the same URL, and no different `WORKER_SESSION_ID`. Consequently no new-generation owner-tab reload, `WORK_SESSION_REFRESH_RESUMED` restoration to `active_hidden`, recovery clearing, or production Show restoration to a fresh functional button could be executed.

Classification: `WORK_REFRESH_NEW_RUNTIME_NOT_WOKEN_AFTER_RELOAD`.

## Counters and decision

- Real Ozon Seller requests: `0`
- Real Performance requests: `0`
- Real ChatGPT requests: `0`
- Operator browser actions: `0`
- Production code modified by tester: `0`
- Alice: `NOT_EXECUTED_ENVIRONMENT_ONLY`
- Validation blocker: `NONE` — the required root observer was installed before Refresh and survived the old extension-page teardown.

Carried forward unchanged: A PASS, B PASS, C PASS, F PASS, G-control PASS, G3 PASS, H PASS.

Final decision: `PATCH_A3_BROWSER_CANDIDATE_REJECTED`

