# NEW-04 Run2 — report_info ready / opaque file ref

Date: 2026-09-03
Gate: repaired 26 Seller READ live gate
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias under test: `report_discounted_create`

## Result

`report_info` succeeded against Ozon.

- request id: `3f4eaf12-b7bf-4a3b-976d-d0439593ff83`
- HTTP: `200`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `d397b76a`
- physical fingerprint: `d397b76a`
- command transformed: `false`
- provider report status: `success`
- report type: `seller_discounted`
- provider file field exposed to AI: `[REDACTED]`
- opaque Bridge file ref: `rpf_b58f09ca-4ca1-4ca5-a362-68d6da57b6d2`
- created_at: `2026-09-03T03:37:24.764962Z`
- expires_at: `2026-09-04T03:37:24.764962Z`

## Interpretation

Run2 proves the async report handoff is successful and URL-safe: the signed provider file is redacted while the Bridge supplies an opaque ref. This step does not reproduce DEFECT-002 because logical and physical fingerprints are identical and `command_transformed=false`.

NEW-04 remains incomplete in standalone collection until `report_file_get` is attempted. That next step is needed to determine whether DEFECT-001 also affects the `seller_discounted` report class.

RAW:
`live-runs/repaired-26/raw/NEW_04_RUN_2_REPORT_INFO_RAW_2026-09-03.json`

Classification:
`PASS_REPORT_INFO_READY_OPAQUE_FILE_REF_FILE_READ_NEXT`
