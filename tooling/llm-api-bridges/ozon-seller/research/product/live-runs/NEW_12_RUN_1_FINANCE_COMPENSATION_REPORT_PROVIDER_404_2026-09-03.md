# NEW-12 Run1 — finance_compensation_report

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command

`finance_compensation_report` with completed month `2026-08`.

## Observed

- request_id: `27840128-438a-4e03-8b70-97ee571c55de`
- HTTP: `404`
- provider error code: `5`
- logical business result count: `1`
- physical business request count: `1`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key: `POST /v1/finance/compensation`
- exact_request_preserved: `true`
- logical fingerprint: `0fb59a8f`
- physical fingerprint: `0fb59a8f`
- command_transformed: `false`

## Classification

`COLLECTION_COMPLETE_PROVIDER_FAIL`

The active runtime contract requires `date` in month format and the submitted value `2026-08` satisfies that contract. One provider HTTP404/code5 therefore does not by itself establish a new bridge defect.

No report code was returned, so there is no valid downstream `report_info` or `report_file_get` step for this run. Per collection rules, the same 4xx business request must not be automatically retried.

This result is another clean counterexample narrowing DEFECT-002 because the logical and physical fingerprints are identical and `command_transformed=false` while `exact_request_preserved=true`.

## Evidence

RAW: `live-runs/repaired-26/raw/NEW_12_RUN_1_FINANCE_COMPENSATION_REPORT_PROVIDER_404_RAW_2026-09-03.json`

## Next

Advance to NEW-13 `finance_decompensation_report` after updating the defect ledger, live gate, and recovery checkpoint. Do not patch runtime and do not touch frozen STD-10.
