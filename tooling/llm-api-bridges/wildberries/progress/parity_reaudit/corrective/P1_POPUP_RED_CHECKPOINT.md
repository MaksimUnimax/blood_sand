# Popup / Work authority — RED checkpoint
Date: 2026-09-12
Status: IMPLEMENTATION NEXT / NOT RELEASE

The own-button checkpoint was fully read back at ac4faf2b18abf322c19f23a3a5e875af2afeefbb, blob a1826afbdbcefe55cf4c351d219647876af80e4b. All seven surface code/evidence parts are verified; no restart of that work is needed.

## Exact worker RED
Runner: local `tests/popup_work_worker.mjs`, reuses actual WB service_worker/importScripts VM, storage and tab mocks. Evidence: `evidence/red-popup-worker/run/results.jsonl` plus stdout/stderr. Completed: 1 PASS / 15 FAIL, exit 1, zero real provider calls.
Reproduced: legacy manual boolean overrides visible/hidden/inactive/error Work; missing Work plus stale true still enables manual; visible Work plus false legacy rejects HELP; legacy setter bypass; public popup state lacks Work/options; later sync revives hidden/finished manual; bound inactive cannot resume visibility; successful Show does not require content acknowledgement; missing durable-busy state. The existing popup-only sender guard passes.

## Popup browser harness status
Actual popup HTML/CSS/script loading in Chromium is in local `tests/popup_browser.py`. 12 planned scenarios. Initial and r2 runs have one remaining `cb is not a function` fixture error from promise-vs-callback Chrome tab messaging. Those runs do NOT establish all 11 failures as product evidence. Correct the Chrome mock compatibility and rerun RED before drawing final counts. Missing Ozon-derived Work controls and competing manual/Autorun UI are independently source-confirmed. Do not modify production to satisfy a broken fixture.

Actual local before-popup source snapshot: `before_popup/`. Local red WIP archive: P1_POPUP_RED_WIP.tar.gz, SHA256 07b48c5ac6d238065e159fc05621426a1a83ec11d7f3b9d497bb36f7318fbd53. This archive has not yet been published; canonical raw runner/results will be included with the verified corrected-code checkpoint.

## Next implementation
Work alone determines manual eligibility; deprecate legacy setter; expose Work/options/manual-busy state; Show/Hide/Refresh require real content acknowledgement and fail closed, with no provider replay; Resume only an existing bound conversation. One popup controller with Ozon control hierarchy, WB branding, no production Autorun/manual switch, distinct result auto-send, honest packaged-registry status, WB credential controls, local diagnostics and editable global settings. Per-tab AI override must be backed by tab+origin state, not merely labelled per-tab while remaining global. Preserve unsaved textarea edits during state refresh and report action failures without stale global WORK_NOT_ACTIVE overriding current Work.

P4/P7 pending Start send/response transaction is not closed by this block and still blocks final handoff. No owner tests or WB provider characterization.
