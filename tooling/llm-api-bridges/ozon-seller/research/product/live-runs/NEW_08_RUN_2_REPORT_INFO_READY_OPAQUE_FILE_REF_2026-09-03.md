# NEW-08 Run2 — report_info PASS

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Gate mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Operation

`report_info`

Source NEW-08 report code:
`REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc`

## Result

PASS.

- request id: `d220db46-ad97-4744-b7e2-75cf91bf12ed`
- HTTP status: `200`
- elapsed: `1101 ms`
- logical business result count: `1`
- physical business request count: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `fcc2dd70`
- physical fingerprint: `fcc2dd70`
- command_transformed: `false`
- report status: `success`
- report type: `marked_products_sales`
- provider file field: `[REDACTED]`
- opaque report file ref: `rpf_e414b482-5e63-4211-99aa-be3ed53ff09b`
- created at: `2026-09-03T04:13:43.278246Z`
- expires at: `2026-09-04T04:13:43.278246Z`

## Defect assessment

No new defect.

This `report_info` path does not reproduce DEFECT-002: logical and physical fingerprints are identical and `command_transformed=false`.

Next separate collection step: call `report_file_get` on the NEW-08 opaque ref and record whether existing DEFECT-001 extends to `marked_products_sales`.

Runtime patching remains forbidden until standalone + batch defect collection is complete.

RAW evidence:
`live-runs/repaired-26/raw/NEW_08_RUN_2_REPORT_INFO_RAW_2026-09-03.json`
