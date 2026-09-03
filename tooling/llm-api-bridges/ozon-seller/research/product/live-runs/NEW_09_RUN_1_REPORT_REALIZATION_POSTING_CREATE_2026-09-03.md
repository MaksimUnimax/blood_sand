# NEW-09 Run1 — report_realization_posting_create

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command

```json
{"operation":"report_realization_posting_create","params":{"month":8,"year":2026}}
```

## Result

PASS.

- request id: `f69f3965-fe8a-417e-9a59-0e4d43651ed5`
- HTTP status: `200`
- elapsed: `1392 ms`
- logical business result count: `1`
- physical business request count: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key: `POST /v1/report/realization/posting/create`
- exact_request_preserved: `true`
- logical fingerprint: `50a8fdbc`
- physical fingerprint: `50a8fdbc`
- command_transformed: `false`
- report code: `REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361`

## Defect assessment

No new defect discovered.

This is another clean repaired create-path counterexample to DEFECT-002: the logical and physical fingerprints are identical and `command_transformed=false` while `exact_request_preserved=true`.

Do not patch any runtime behavior during collection.

## Next step

Call explicit `report_info` using only the NEW-09 report code above, persist the result, then continue the NEW-09 chain.
