# Autorun HELP_V2 — IDB regression timer correction

Full run `34679718000`: Linux PASS, browser/MV3 PASS. Windows syntax, all 39 new behavioral cases, marker/dependency sweep and prior regression scripts 01–14 PASS. Script 15, `run_prefix_transaction_abort_gate.mjs`, failed. Finalizer correctly stayed blocked.

Evidence: artifact `10294041588`, files `failure.json` and `regression-15-run_prefix_transaction_abort_gate.log`.

## Cause

The old test scheduled the transaction outcome automatically 20 ms after request success, then polled request success and waited another 5 ms before checking the writer was pending. The host timer scheduler could deliver the transaction outcome before that check. Its `settled === true` observation therefore did not establish that production resolved on IDBRequest success; it could already have received the correctly awaited transaction abort.

## Exact test-only correction

Commit `ec24d9d4645ea7292c774bee87cc076c73b198d4`, test blob `3a7089709f4185d1f38734bd8c00eb0c0d67e88b`.

The lifecycle fixture now signals request success, flushes promise chains, asserts neither transaction outcome has fired, and checks the writer is pending. Only then does the test explicitly emit abort/complete. Outcomes are enforced once-only and after request success. The watchdog is only a deadlock limit, not an ordering assertion.

All previous pending/ref-publication/raw-byte-preservation/abort/commit/provider-count/static-boundary assertions remain. Production storage code is not changed.

## Local strength checks

The revised test passes against the exact candidate. Two independent ephemeral mutations were then applied to test-only copies of production modules: (1) direct writer resolves on request success; (2) generic writer resolves on request success. Both are rejected by the revised test at their respective pending assertion. Thus the timing correction does not weaken the intended durability guard. Local test blob exactly matches the published blob.

Later selected regression scripts 16–31 were scanned for the same `await delay`/`setTimeout` timing pattern; none contains it.

Production executable remains `0cc968ee4b76d41e9c0361a905812fe49f313585`, tree `f9aa7ea1b1d00d6d3abdb22f1bb6adba78a84a90`. ZIP remains 259715 bytes, SHA-256 `4dd7139232317b1e55c432d47bcb2a7ced89e8c425ffcdfab679694541d1a225`.

A new full Linux → browser/MV3 → Windows → finalization cycle is mandatory. Real provider calls: 0. No PRE-HANDOFF or LIVE PASS is inferred from these partial results.
