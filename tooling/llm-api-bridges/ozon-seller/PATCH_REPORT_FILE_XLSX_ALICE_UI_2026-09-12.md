# Ozon Bridge — report expiry + XLSX delivery to Alice + closable status plates

**PRE-HANDOFF PASS. LIVE CERTIFICATION: PENDING POST-INSTALL.** Final CI `34690423195`.

Executable `aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3`; tree `550e5881534563f7482b49eca6cb20517bed73f8`.

Installable ZIP `OZON_BRIDGE_v0.1.19_REPORT_XLSX_ALICE_UI_20260912.zip` — 262661 bytes — SHA-256 `c65a068836b5842172edc2e7cdf184758b105d81e3d04064767abf6b03bdbecd`.

## What the live evidence proved before this combined repair
The freshly generated report path reached `report_file_get` with HTTP 200. The expiry correction therefore worked live. The remaining failure was after download: the Bridge rejected/delivered the captured provider file with incorrect generic attachment metadata. The operator manually attached the same XLSX to Alice without the extension and Alice accepted it, separating target support from Bridge classification.

## Root cause
`file_delivery_port_worker.js` captured the original bytes correctly, but when Ozon returned an opaque URL and generic `application/octet-stream` (or container-like ZIP metadata), artifact filename/MIME were derived only from transport headers/URL. The same one-fetch response had already been parsed as `format="xlsx"`; that proven format was discarded. The artifact could therefore become `.bin`/octet-stream and fail Bridge/Alice preflight despite valid XLSX bytes.

## Production repair
The artifact classifier now receives the already-produced parser result. A parser-proven OOXML workbook canonicalizes generic transport metadata to `.xlsx` and `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. The original bytes are not converted or regenerated. Concrete non-container provider MIME is preserved. Generic content that the parser cannot identify stays `.bin` and remains fail-closed. No second fetch, retry, report_info, create, polling, resend or fan-out was added.

## Status plates
The main `content_script.js` toast already had a close button. The independent attachment-delivery status plate did not. It now has the same explicit `×` for info, success and error states. Clicking it removes only the visual status element; it does not cancel, confirm, retry, mutate or delete the underlying delivery. A generation token also prevents an older timeout from deleting a newer replacement plate.

## Why this is not a workaround
There is no special case for the user report code, warehouse, URL, request ID or Alice error string. The change sits at the generic boundary where validated provider bytes become a typed artifact. It reuses evidence already computed by the existing parser, preserves exact bytes and single-fetch accounting, and keeps unknown types blocked. The UI change is centralized in the shared attachment status renderer rather than patched into one error message.

## Compatibility and regression boundaries
Combined production scope is exactly 4 of 32 files relative to the accepted HELP_V2 baseline; 28 files are byte-identical. The previous expiry logic remains in the same two files. Attachment classification and status rendering are the two additional production files. Existing personal-data provenance, trusted-host, IndexedDB durability, worker recreation, HELP_V2, XLSX parser, drag/drop and send regressions were rerun.

## Test-authority corrections discovered by fail-stop runs
Several historical tests encoded obsolete literal source shapes: an old no-argument `recoverCurrent()` signature, an ancient legacy commit baseline, a FakeDOM without standard `setAttribute`, and a literal two-argument artifact-store call. Those tests were not disabled. Their semantic invariants were preserved and updated to current architecture, with the old sealed fixture kept and a v2 DOM-complete fixture added. Intermediate failed runs remain part of the execution record.

## Remaining live boundary
The final package is pre-handoff certified, not live certified. After installation, use a new explicit report create → actual code → report_info → actual ref → report_file_get and verify that Alice receives the XLSX automatically. Then verify close controls and lifecycle/no-duplicate behavior. LIVE-GATE-01..05 remain pending.
