# NEW-05 Run2 — report_info ready with opaque file ref

Date: 2026-09-03
Gate: repaired 26 Seller READ live gate
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias under test: `report_warehouse_stock`
Workflow step: `report_info`

## Result

Classification:
`PASS_REPORT_INFO_READY_OPAQUE_FILE_REF`

Request:
- request id: `f543d8bd-0f37-4f77-b7e2-21439f600870`
- operation: `report_info`
- HTTP: `200`
- elapsed: `1349 ms`
- physical business requests in batch: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `83c2156b`
- physical fingerprint: `83c2156b`
- command transformed: `false`

Provider report state:
- code: `REPORT_seller_stocks_2093109_1788407283_01a06561-80f3-78d2-9c6a-3c829871385f`
- status: `success`
- report type: `seller_stocks`
- provider file: `[REDACTED]`
- created_at: `2026-09-03T03:48:03.956035Z`
- expires_at: `2026-09-03T04:18:03.956035Z`
- opaque Bridge ref: `rpf_304de093-ae1b-46f3-8be0-2a16793361b9`

## Interpretation

The report-info stage is live-provider PASS. The signed provider file location is not exposed to the AI-visible result; Bridge returns an opaque file reference instead.

This step introduces no new defect and does not reproduce DEFECT-002. NEW-05 remains in progress until the explicit file-read step is exercised. During the current collection-first phase, the next purpose is to determine whether existing DEFECT-001 also blocks the safe `seller_stocks` report file.

No runtime patch is allowed before the full standalone + batch defect sweep completes.

Raw evidence:
`live-runs/repaired-26/raw/NEW_05_RUN_2_REPORT_INFO_RAW_2026-09-03.json`
