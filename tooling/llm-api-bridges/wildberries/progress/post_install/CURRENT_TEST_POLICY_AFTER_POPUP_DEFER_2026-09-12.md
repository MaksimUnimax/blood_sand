# Current installed-test policy after popup defer

Date: 2026-09-12
Status: CURRENT TEST AUTHORITY

Operator decision: do not patch or continue testing popup-dependent UI now. The WB popup will be rebuilt in the next patch against the Ozon Bridge reference and then its entire UI/Work Session control surface will be retested from scratch.

## Deferred until popup parity patch

- UI-01 popup layout/control parity.
- UI-06 Work Session popup controls and stale status presentation.
- UI-07 popup/session persistence as observed through the current popup.
- UI-08 New Context popup flow.
- Any Show/Hide/manual-mode tests whose semantics are invalidated by the known duplicate `manualMode` vs Work Session authority.
- Autorun is SKIPPED_NON_PROD by operator decision; it is not a production acceptance requirement.

Known defect retained for next patch: after Work Session Start the backend/session state reached `active_visible`, while stale red `WORK_NOT_ACTIVE` remained visible (`FAIL_UI_STATE_SYNC`).

## Continue now: independent functionality only

Run one test at a time and collect defects without patching until the functional pass is complete:

1. ChatGPT conversation identity/binding and cross-chat isolation.
2. Alice identity/binding and fail-closed unknown/ambiguous identity.
3. Manual ordered command path (already UI-05A PASS) and explicit local HELP controls (UI-04 PASS).
4. File/artifact transport and attachment path.
5. Local XLSX reader behavior.
6. Personal Data gate / blocked PII invariant / no replay.
7. MV3 restart/recovery/exactly-once behavior.

After independent functional tests, build one consolidated next patch: Ozon popup parity + Wildberries visual styling + all defects found in this installed pass. Then retest the rebuilt popup and affected functional chains. R1-R8 WB API characterization remains after this provider-neutral acceptance pass.
