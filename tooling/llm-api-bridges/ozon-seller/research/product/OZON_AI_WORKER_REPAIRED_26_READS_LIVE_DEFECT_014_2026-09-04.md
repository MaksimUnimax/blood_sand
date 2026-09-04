# DEFECT-014 — report-file provider misclassified as Performance in planning metadata

Date: 2026-09-04
Branch: `research/ozon-product-demand-2026-09-02`
Baseline installed build: `51ab3fbeb97ac6a3fc693fd40a0a81d5d818ca0a`
Classification: `NON_SELLER_BINARY_PROVIDER_ASSUMPTION_MISCLASSIFIES_REPORT_FILE`
Status before repair: `OPEN_CONFIRMED_LIVE`

## Live evidence

The real `report_file_get` workflow succeeded against Ozon with one external GET and HTTP 200, but the result reported:

- `host_alias = report_file`
- `planning.entitlement.reason = performance_provider_not_seller_subscription`

The provider classification in the entitlement reason is therefore false even though file transport itself succeeds.

## Root cause

The contract planner predated the `report_file` provider and used a binary assumption: every provider other than `seller_api` was treated as Performance. When `report_file` was later added as a third provider, that catch-all branch and related builder error assumptions were not exhaustively re-audited.

## Dependency closure

Current provider taxonomy is exactly:

1. `seller_api`
2. `performance_api`
3. `report_file`

The repair removes binary/catch-all assumptions from all provider-sensitive paths found in the packaged runtime:

- planning metadata;
- Seller request-builder rejection;
- Performance request-builder rejection;
- binary response-style validation;
- direct entitlement classification;
- provider execution dispatch.

Seller capability probing and Seller quota bypass remain intentionally shared for all non-Seller providers because neither Performance nor report-file execution uses Seller subscription probing or Seller analytics quota state. Unknown provider categories now fail honest/closed instead of falling into Seller execution.

## Acceptance

Pre-handoff requires:

- exhaustive provider taxonomy regression;
- report-file reason is report-file-specific and never Performance-specific;
- Performance reason remains unchanged;
- Seller planning remains unchanged;
- wrong builder errors identify the actual provider;
- direct entitlement classification explicitly recognizes both non-Seller providers;
- provider execution dispatch explicitly recognizes all three providers;
- unknown/future provider fails closed before any network request;
- report-file workflow gate checks planning metadata as part of the full output contract;
- full existing repair/package gate remains green on the final artifact.

Post-install live confirmation must replay the fresh report workflow and confirm the real `report_file_get` output no longer contains the Performance reason.
