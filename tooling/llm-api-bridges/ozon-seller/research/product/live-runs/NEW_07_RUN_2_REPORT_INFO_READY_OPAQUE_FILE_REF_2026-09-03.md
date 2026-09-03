# NEW-07 Run2 — report_info PASS

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Alias under test: `report_placement_by_supplies_create`
Follow-up operation: `report_info`

## Result

PASS.

- request id: `c8c54b96-4560-4194-bf70-c85ac449689c`
- HTTP status: `200`
- elapsed: `1334 ms`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `08962c14`
- physical fingerprint: `08962c14`
- command_transformed: `false`

## Report state

- code: `REPORT_seller_placement_by_supplies_2093109_1788408279_01a06570-b345-7114-9532-c1476a0c61e2`
- status: `success`
- report type: `seller_placement_by_supplies`
- provider file field: `[REDACTED]`
- opaque report file ref: `rpf_49f4be70-84e2-40b7-8224-6a58e409cf29`
- created_at: `2026-09-03T04:04:39.877709Z`
- expires_at: `2026-09-03T07:04:39.877709Z`

## Defect assessment

No new defect discovered in Run2.

DEFECT-002 does not reproduce here: logical and physical fingerprints are identical and `command_transformed=false`.

Next standalone collection step for NEW-07 is an explicit `report_file_get` using the opaque ref above, to determine whether existing DEFECT-001 also applies to `seller_placement_by_supplies`.

Runtime patching remains forbidden until the full standalone + batch collection sweep is exhausted.

RAW evidence:
`live-runs/repaired-26/raw/NEW_07_RUN_2_REPORT_INFO_RAW_2026-09-03.json`
