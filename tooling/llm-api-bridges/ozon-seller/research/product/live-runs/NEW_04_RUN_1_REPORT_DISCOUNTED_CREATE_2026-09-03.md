# NEW-04 Run1 — report_discounted_create

Date: 2026-09-03
Gate: repaired 26 Seller READ live collection
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command

`report_discounted_create` with empty params.

## Result

Provider PASS.

- request id: `51dfec0d-655b-4a77-9fba-ca4af1fb6f6e`
- HTTP: `200`
- elapsed: `1407 ms`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- exact request preserved: `true`
- logical fingerprint: `02e64eda`
- physical fingerprint: `02e64eda`
- command transformed: `false`
- coalesced groups/logicals: `0/0`

Returned report code:

`REPORT_seller_discounted_2093109_1788406644_01a06557-c01b-7f31-9c51-b82d2a402ca7`

## Classification

`PASS_NEW_04_REPORT_DISCOUNTED_CREATE`

No new defect was observed on this create step.

This is a useful counterexample for `DEFECT-002`: not every repaired report-create alias is transformed. NEW-04 preserved the exact logical fingerprint and reported `command_transformed=false` consistently with `exact_request_preserved=true`.

NEW-04 is not standalone-complete yet. Next step is one explicit `report_info` for the returned report code. If ready, later attempt `report_file_get` to determine whether `DEFECT-001` extends to `seller_discounted`.

Raw evidence:
`repaired-26/raw/NEW_04_RUN_1_REPORT_DISCOUNTED_CREATE_RAW_2026-09-03.json`
