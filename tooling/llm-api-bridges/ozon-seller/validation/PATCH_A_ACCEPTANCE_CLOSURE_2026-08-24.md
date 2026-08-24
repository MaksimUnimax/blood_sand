# Ozon Bridge Patch A — acceptance closure

Date: 2026-08-24

Branch: `fix/ozon-work-session-refresh-inprocess-reinit-2026-08-24`

## Independent acceptance authority

Accepted browser result:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A4_REFRESH_INPROCESS_REINIT_CODEX_RESULT_2026-08-24.md`

Result commit:

`14b11ee1e167a656bc4972159ba38a51cdbab6c1`

Decision:

`PATCH_A4_BROWSER_CANDIDATE_ACCEPTED`

Validation blocker: `NONE`.

Alice: `NOT_EXECUTED_ENVIRONMENT_ONLY`; this was explicitly non-blocking in the independent acceptance instruction.

## Accepted product evidence

Carried-forward accepted browser evidence:

- A — existing-chat Start: PASS
- B — new empty-chat Start/pending identity: PASS
- C — Hide/Show: PASS
- F — Finish without Autorun + Start after Finish: PASS
- G-control — Work Send selected; dictation not clicked: PASS
- G3 — three consecutive local `OZON_HELP_V1` deliveries: PASS
- H — stale/wrong pending identity fail-closed: PASS

Final A.4 browser execution additionally proved:

- D — `active_visible` Refresh: PASS
- E — `active_hidden` Refresh + Show restore: PASS
- physical `WORKER_SESSION_ID` remained stable during current-conversation Refresh;
- Work runtime generation changed old -> new;
- same owner AI tab performed the product-owned reload;
- fresh manifest content context reconnected;
- `WORK_SESSION_REFRESH_RESUMED` completed and recovery storage cleared;
- visible state restored a fresh functional Ozon button;
- hidden state remained button-free until production Show, then restored a fresh functional button;
- protected provider/quota/cache/history/alarm/credential snapshot was byte-equal before/after Refresh;
- real Ozon Seller requests = 0;
- real Performance requests = 0;
- real ChatGPT requests = 0;
- production code modified by tester = 0.

## Final accepted candidate identity

Production files: `19`

`service_worker.js` SHA-256:

`a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc`

Sorted 19-file tree-manifest SHA-256:

`acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0`

## Final release artifact

Filename:

`OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_ACCEPTED_2026-08-24.zip`

ZIP size:

`138062` bytes

ZIP SHA-256:

`4bfee6dca838a29ab11c63600b3be19121aa2b111294055c1426d3d01bcbbefb`

Fresh extraction verification:

- files: `19`
- `service_worker.js` SHA-256: `a6088180c7aae74fc3379f0adc7f52dc3180d77fcfe7acf9400dacd22ba293bc`
- tree-manifest SHA-256: `acfba949b5df31f6a489653bb1d473dab7bb771f0089a060cd475b541271beb0`

The exact release ZIP is reproducible from the accepted materialized A.4 tree using:

`tooling/llm-api-bridges/ozon-seller/validation/build_patch_a_accepted_release.py`

The SHA record is:

`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A_ACCEPTED_2026-08-24.zip.sha256`

## Lifecycle conclusion

Patch A Work-session lifecycle is accepted and closed for the tested ChatGPT Work browser matrix. No further Patch A production change is authorized by the completed evidence chain unless a new independent product failure is produced.

`PATCH_A_WORK_SESSION_LIFECYCLE_ACCEPTED_CLOSED`
