# Occupied/missing composer live-failure RED/GREEN addendum — 2026-08-18

Status: `TARGETED_RED_GREEN_CONFIRMED`

Two separate old-behavior failures are now explicitly covered.

## RED 1 — Manual OFF left pending report owner active

Old behavior failed the targeted worker regression with:

`Manual OFF did not delete the pending pre-insert delivery`

The repaired worker passes owner-local cancellation, OFF -> ON readiness, quota/cache preservation, other-owner preservation, narrow non-cancellation states and late-insert race-barrier assertions.

## RED 2 — temporarily missing composer failed recovery

The actual old `performBatchClaimedDelivery` function was extracted from the operator v0.1.19 content script and executed with the correct Manual owner/conversation but no currently discoverable composer.

Old result:

`EXPECTED_RED:COMPOSER_NOT_FOUND`

The repaired function, exercised by the current canonical GitHub targeted harness, emits:

`TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`

and proves:

- no terminal `COMPOSER_NOT_FOUND` for this recoverable Manual pre-insert condition;
- no insert commit while composer is unavailable;
- same Manual composer wait is entered;
- provider execution is not replayed.

Current canonical targeted harness authority is the four-part manifest in `PATCH_AND_TARGETED_TEST_PARTS.md`, SHA-256:

`ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.