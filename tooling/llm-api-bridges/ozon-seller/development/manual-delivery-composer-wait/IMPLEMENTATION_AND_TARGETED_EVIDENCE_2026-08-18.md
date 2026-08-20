# Ozon Bridge v0.1.19 — occupied-composer Manual delivery repair: implementation and targeted evidence

Date: 2026-08-18
Status: `TARGETED_ENGINEERING_PASS`

Repository: `MaksimUnimax/blood_sand`

Development branch:
`dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

## Incident and defect

A controlled logged-in run proved the quota scheduler itself resumed correctly: after the durable wait, the second Seller analytics provider request started automatically and completed with HTTP 200.

The failure occurred after provider completion during report delivery. The target ChatGPT composer contained unrelated operator text. The existing Manual delivery path returned `COMPOSER_CONTAINS_OTHER_TEXT`, preserved the worker-owned report, but did not maintain an active durable composer-clear wait. The Manual owner therefore remained active/busy and Ozon controls could remain disabled.

This work fixes only that delivery/recovery defect and the required Manual OFF cancellation behavior.

The complete v0.1.19 logged-in Step1+Step2+Step3+Step4+quota+delivery live suite remains pending and MUST NOT be marked passed because of this repair.

## Required behavior implemented

### Occupied or temporarily unavailable Manual composer

When a Manual batch report is already worker-owned in pre-insert `CLAIMED` delivery state and the correct target composer is occupied or temporarily unavailable:

- existing operator composer text is not modified;
- the report remains worker-owned and recoverable;
- content runtime enters a Manual-only composer-clear wait rather than reporting terminal delivery failure;
- the persistent plate text is exactly:
  `Очистите поле ввода, чтобы получить отчёт.`
- the plate has no automatic expiry while the pending delivery remains active;
- observation is event-driven with `MutationObserver` and uses the existing 2000 ms delivery interval only as fallback resilience;
- the current composer is reacquired on wake rather than retaining a stale DOM node;
- when the correct composer becomes empty, the code re-enters the existing `performBatchClaimedDelivery` path;
- existing worker insert-commit authority remains the irreversible insertion permission boundary;
- the report is inserted exactly once;
- after the worker acknowledges `inserted`, the composer-wait plate is removed;
- the existing downstream one-Send-click / Microphone confirmation watcher remains the delivery authority;
- content runtime disposal/reload can reconstruct the wait from the still worker-owned claimed delivery without provider replay or duplicate insertion.

Autorun occupied-composer semantics were not broadened by this repair. The new waiting behavior is Manual-specific.

## Manual OFF cancellation scope

Manual OFF does NOT perform a broad subsystem reset.

The worker cancels only a current Manual operation satisfying all of:

- `status === delivering`;
- `delivery.mode === batch_watch_v1`;
- `delivery.phase === claimed`.

That is the narrow state where the provider work/report already exists but browser insertion has not been committed.

Manual OFF does NOT delete a Manual operation that is:

- still `requesting` / quota-waiting;
- already `insert_committed`;
- already `inserted`.

This avoids pretending that an already committed/possibly executed browser side effect can safely be undone.

The OFF flag is persisted before cancellation. `commitManualBatchDeliveryInsert` then rechecks live Manual mode and rejects any late content-runtime insert attempt with `MANUAL_MODE_DISABLED`. This is the race barrier between operator cancellation and a stale content runtime.

After OFF -> ON, the old pending claimed delivery is gone and worker state is ready for a new Manual operation when no other operation is active.

## State explicitly not reset

The cancellation path does not write or reset:

- provider quota state;
- `last_provider_request_at`;
- `next_allowed_at`;
- nominal analytics minimum `60000` ms;
- bridge launch safety `5000` ms;
- effective guarded interval `65000` ms;
- Retry-After extension state;
- verified analytics result cache / TTL state;
- conversation binding;
- Seller credentials or credential revision through this path;
- other Manual owners;
- unrelated Autorun owners;
- Performance state;
- native ChatGPT Copy behavior.

A new cold-cache request after OFF -> ON therefore remains subject to the already persisted same-Seller quota deadline.

## Production delta

Repair patch SHA-256:
`bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Repair patch bytes:
`13648`

Git numstat of the repair patch:

- `content_script.js`: `+147 / -3`
- `service_worker.js`: `+39 / -0`

No other production file is represented by the repair patch.

The byte-exact patch and targeted test-part manifests are authoritative in:
`PATCH_AND_TARGETED_TEST_PARTS.md`.

## RED defect reproduction

Before the production correction, the targeted regression harness was run against the old Manual delivery behavior.

It failed through the actual worker runtime Manual-mode path at the expected defect:

`Error: Manual OFF did not delete the pending pre-insert delivery`

This establishes that the regression test detects the real stuck-owner condition rather than only source-scanning for the new implementation.

The old occupied-composer delivery path likewise threw instead of entering a Manual composer-clear wait.

## GREEN targeted execution

Canonical GitHub targeted harness SHA-256:
`ba5f90e3dcde4cf877e81d645f2b724e545a314ccd07e4f7e0588a11142283ad`

The harness bytes were reconstructed from the exact GitHub parts and passed `node --check` before execution.

Passing targeted markers:

- `TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS`
- `TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS`
- `TARGETED_QUOTA_CACHE_PRESERVED_PASS`
- `TARGETED_OTHER_OWNER_PRESERVED_PASS`
- `TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS`
- `TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS`
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`

The test drives the actual service-worker runtime handler for:

- `OZ_SET_MANUAL_MODE` OFF;
- `OZ_SET_MANUAL_MODE` ON;
- `OZ_GET_MANUAL_STATE`.

It also executes the actual changed content delivery/wait functions extracted from production source.

Provider fetch count during Manual cancellation/re-enable is zero.

## Quota/cache preservation assertions

The targeted worker fixture seeds the persistent namespaces used by the accepted later architecture:

- `ozmb_provider_quota_state_v1`;
- `ozmb_provider_result_cache_v1`.

The seeded quota object contains the reviewed family and timing surfaces including:

- `seller.analytics_data.v1`;
- `min_interval_ms: 60000`;
- `bridge_launch_safety_ms: 5000`;
- `effective_interval_ms: 65000`;
- `last_provider_request_at`;
- `next_allowed_at`.

The complete quota and cache objects are compared before/after Manual OFF and after re-enable. They remain structurally/JSON byte-equivalent in the targeted execution. `next_allowed_at` is also asserted explicitly after worker-owned readiness is restored.

No provider call is made by cancellation, re-enable or the late-insert race barrier.

## Owner/isolation assertions

Targeted tests prove:

- another Manual owner operation remains unchanged;
- an unrelated Autorun owner remains unchanged;
- OFF -> ON does not resurrect the cancelled old report;
- cancellation is not generalized to request/quota-wait or post-commit delivery phases.

## Content/composer assertions

Targeted tests prove:

- unrelated draft remains unchanged while waiting;
- exact persistent plate text is present;
- insert commit is not attempted while draft is occupied;
- content-runtime wait can be stopped/recreated while the worker still owns the delivery;
- clearing composer produces exactly one insert commit and one inserted acknowledgement;
- the report text is inserted exactly once;
- no false `OZ_BATCH_DELIVERY_FAILED` is emitted for the normal occupied-composer wait;
- the existing post-insert delivery watcher is entered exactly once;
- Manual OFF destroys the local waiter/plate and a later composer-clear event cannot insert the cancelled report.

## Exact frozen content-script compatibility

The accepted Step1 through Step4 work did not change `content_script.js`; V3 quota/countdown was the only later content change before this repair.

The accepted V3 content delta was reconstructed on the operator baseline and produced SHA-256:

`d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

which exactly matches the published frozen repair authority.

The new repair patch passed `git apply --check` against that exact frozen content with no fuzz/manual editing. Repaired exact frozen content:

- bytes: `118915`;
- SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
- `node --check`: PASS.

The targeted harness also passed with this exact V3/frozen content-script present, proving the composer-wait repair did not remove the quota-countdown content logic.

## Worker compatibility review

The accepted Step1/Step2/Step3/Step4/V3 raw deltas were reviewed for overlap with the worker areas modified by this repair.

Step3/Step4 provider quota/cache work changes provider/planner/queue regions and persistent quota/cache helpers. V3 changes quota constants/acquisition/Retry-After/public quota state. The current repair does not modify those functions.

A worker fixture shaped with the accepted V3 public quota insertion plus substantial line displacement passed `git apply --check` for this repair without fuzz/manual repair. The canonical targeted harness then passed on the repaired V3-shaped context.

This is targeted development compatibility evidence. It is deliberately not described as an exact full frozen-worker reconstruction PASS.

## Security and architecture boundary

This repair adds no:

- provider operation;
- host/method/header/auth surface;
- credential surface;
- mutation endpoint;
- provider retry;
- pagination/fan-out/report polling;
- provider request from composer waiting;
- provider request from Manual OFF/ON.

The worker remains the report/delivery owner. The content runtime waits only for local DOM readiness and cannot bypass worker insert permission.

## Test-stage decision

Targeted engineering decision:

`TARGETED_ENGINEERING_PASS`

This completed stage may be independently validated by Codex under the active incremental workflow. If Codex finds a production, harness, fixture or environment issue, correct the affected layer and rerun validation for this stage before continuing.

Exact package verification and any logged-in/live checks remain separate release/operator work when an installable build is prepared.
