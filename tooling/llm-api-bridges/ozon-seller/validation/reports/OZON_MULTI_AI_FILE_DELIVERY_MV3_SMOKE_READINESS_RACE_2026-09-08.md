# Ozon multi-AI file delivery — MV3 smoke readiness race evidence

Date: 2026-09-08

Status: `SECONDARY_VALIDATION_DEFECT_FROZEN_BEFORE_HARNESS_REPAIR`

## 1. Discovery context

The first full post-wake-fix Actions run on candidate `20dcfbf24ff758433b805f41cc83c93a1b6e6bf2` was run `34206458537`.

Results before the package failure:

- regression / ubuntu-latest: PASS;
- regression / windows-latest: PASS;
- package step `Re-run regression on exact package source`: PASS;
- pinned Chrome for Testing `152.0.7977.82`: acquired successfully;
- native Chrome File/DataTransfer primitive: PASS;
- unpacked MV3 service-worker smoke: FAIL before ZIP build;
- deterministic ZIP build/upload: skipped because of the smoke failure.

## 2. Exact smoke failure

The failing job was `package`, job id `101997090737`.

The first failing assertion was line 168 of `run_file_delivery_extension_worker_smoke.mjs`:

```js
assert.equal(await evaluate(sessionId, `typeof OzonAIDeliveryCapabilities`), "object");
```

Actual value: `"undefined"`.
Expected value: `"object"`.

The harness flow was:

1. open the extension popup;
2. wait only until a target of type `service_worker` with URL `service_worker_entry.js` exists;
3. immediately attach to that target;
4. immediately evaluate worker globals once;
5. fail if initialization is not already complete at that exact instant.

## 3. Why this is classified as a validation readiness race, not a new production bootstrap regression

The smoke-test file at the failing candidate has blob SHA `587c765f6f841a342952701c2223b9c34e46feae`.

The exact same file/blob is present at the earlier final tested commit `3a9586a354b4fd86109ce29051bc8d5605d78a5d`, where the same unpacked-MV3 smoke previously passed.

The current corrective production diff from live-evidence authority `9654f31405d02b309ace42e0644bcd135f07ad55` changes only `dist-step7-candidate/attachment_delivery_port_content.js`; `service_worker_entry.js`, its import order, and worker-side bootstrap files are unchanged.

The smoke therefore contains an unsafe synchronization assumption: `service_worker target exists` is treated as equivalent to `all importScripts/bootstrap globals are initialized`. Chrome may expose the target before the worker has completed top-level initialization.

## 4. Allowed harness repair

The test-only repair may:

- keep the exact target URL and extension ID checks;
- attach to the actual unpacked extension service worker;
- add a bounded readiness wait after attachment;
- require all worker globals used by the smoke to become ready within the existing bounded test horizon;
- retain all existing capability, file-delivery-worker, IndexedDB, provider-capture-wrapper, and Chrome-version assertions after readiness is proven;
- fail with explicit last-observed readiness state if the worker never initializes.

The harness repair must not:

- change production extension code;
- reload/restart until it happens to pass;
- hide a worker exception;
- weaken or delete any existing semantic assertion;
- extend provider/network behavior;
- create any Ozon API request.

A final full workflow run after the harness correction is still mandatory. The failed run `34206458537` is not a PRE-HANDOFF PASS and produces no valid final ZIP.
