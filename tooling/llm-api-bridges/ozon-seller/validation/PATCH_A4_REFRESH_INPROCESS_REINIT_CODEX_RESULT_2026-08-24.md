# Patch A.4 Refresh in-process reinitialization — independent D/E browser retest

## Authority and candidate

- Tested branch: `fix/ozon-work-session-refresh-inprocess-reinit-2026-08-24`
- Starting HEAD: `daacf43d8aa06fc9de6ad09903816822480679bd`
- Fresh materialized production files: `19`
- `service_worker.js` SHA-256: `a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc`
- Tree-manifest SHA-256: `acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0`

All inherited A1/A2/A3 materializer markers and all A4 markers passed, including `PATCH_A4_A3_BASE_IDENTITY_PASS`, `PATCH_A4_SEPARATE_WORK_RUNTIME_GENERATION_PASS`, `PATCH_A4_NO_PHYSICAL_EXTENSION_RELOAD_PASS`, `PATCH_A4_INPROCESS_RUNTIME_REINITIALIZATION_PASS`, `PATCH_A4_SAME_TAB_RELOAD_COMPLETION_BARRIER_PASS`, `PATCH_A4_CONTENT_RUNTIME_RENEW_HANDSHAKE_PASS`, `PATCH_A4_SERVICE_WORKER_SHA256_PASS`, `PATCH_A4_PRODUCTION_FILE_COUNT_19_PASS`, and `PATCH_A4_TREE_MANIFEST_SHA256_PASS`.

Candidate JavaScript syntax passed. The designated model, finish/no-Autorun, and A.4 in-process reinitialization regressions passed. The historical physical-reload regression was not used, as required by the A.4 instruction.

## Environment

- Node: `v24.12.0`
- Puppeteer: `25.4.0`
- Chrome for Testing: `151.0.7922.47`
- Extension ID: `cljchenanjmpljmhfcbgpgmblffgaheg`
- Service-worker URL: `chrome-extension://cljchenanjmpljmhfcbgpgmblffgaheg/service_worker.js`

For each independent scenario the harness installed browser-root Target discovery and a page CDP lifecycle observer before Refresh. It did not call `page.reload()`, navigate the owner page, reload/toggle the extension, wake the worker, or inject a replacement content script.

## D — ACTIVE_VISIBLE: PASS

- Physical worker target remained `2B5B52A34BD0D8CEC8EAD17D173ECEF3`.
- Physical `WORKER_SESSION_ID` remained `worker-992b6456-3bfb-4c2c-8c2e-5e45d356f764`.
- Recovery: `work-recovery-73d6ed54-7f29-4fca-bc46-754961102cf0`.
- Work runtime generation changed from `work-runtime-bedd87b7-5937-40f4-83aa-a9b4bfb7241f` to `work-runtime-2d556ecb-f39b-45cc-a8cf-886737a0e6eb`.
- Response proved `runtime_reinitialized=true`, `physical_worker_reloaded=false`, `page_reload_completed=true`, and `restored_state=active_visible`.
- Event order: `WORK_SESSION_REFRESH_RUNTIME_REINITIALIZED` at `2026-08-24T13:11:45.731Z`; same owner URL navigation followed by `DOMContentLoaded` and `load`; `WORK_SESSION_REFRESH_TAB_RELOAD_COMPLETED` at `2026-08-24T13:11:45.776Z`; `WORK_SESSION_REFRESH_RESUMED` at `2026-08-24T13:11:45.795Z`.
- A fresh extension content context (`id=8`) reconnected. Recovery storage was cleared. Final state was `active_visible` with one fresh Ozon button.
- The fresh button's local-only path was clicked: `external_request_executed` remained absent/null, provider requests remained zero, and the persistent dictation control was not clicked.

## E — ACTIVE_HIDDEN: PASS

- Production Hide established `active_hidden`, command acceptance closed, and zero Ozon buttons before Refresh.
- Physical worker target remained `27806D7D9ABB1F029F4F8B597F3147AB`.
- Physical `WORKER_SESSION_ID` remained `worker-8514102b-71cd-4e48-9a8c-46e11848c4f5`.
- Recovery: `work-recovery-77b59d49-6550-4fe7-b78e-783ddcc010d7`.
- Work runtime generation changed from `work-runtime-4481f9cf-562c-4aaf-8e13-b47d06ca088d` to `work-runtime-e097a55b-8739-4245-b470-2a8140e7ada9`.
- Response proved `runtime_reinitialized=true`, `physical_worker_reloaded=false`, `page_reload_completed=true`, and `restored_state=active_hidden`.
- Event order: `WORK_SESSION_REFRESH_RUNTIME_REINITIALIZED` at `2026-08-24T13:11:51.111Z`; same owner URL navigation followed by `DOMContentLoaded` and `load`; `WORK_SESSION_REFRESH_TAB_RELOAD_COMPLETED` at `2026-08-24T13:11:51.188Z`; `WORK_SESSION_REFRESH_RESUMED` at `2026-08-24T13:11:51.207Z`.
- A fresh extension content context (`id=8`) reconnected. Recovery storage was cleared. Hidden state remained button-free; production Show restored `active_visible` and one fresh functional Ozon button.
- The local-only button path produced no external request; dictation was not clicked.

## Protected state, carry-forward and verdict

The filtered protected provider/quota/cache/history/alarm/credential storage snapshot was byte-equal before and after each Refresh. Both browser scenarios had zero real Ozon Seller, Performance, and ChatGPT requests; `OPERATOR_BROWSER_ACTIONS=0`. Production code modified by tester: `0`.

Carried forward unchanged: A PASS, B PASS, C PASS, F PASS, G-control PASS, G3 PASS, H PASS.

Alice: `NOT_EXECUTED_ENVIRONMENT_ONLY`.

Validation blocker: `NONE`.

Final decision: `PATCH_A4_BROWSER_CANDIDATE_ACCEPTED`

