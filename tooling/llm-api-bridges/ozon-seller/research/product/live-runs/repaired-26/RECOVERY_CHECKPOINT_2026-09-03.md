# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch collection is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-6ac5e04697cb`

That code belongs only to the frozen forensic workflow.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `7/26`
- collection-complete/partial-fail: `6/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`, `seller_placement_by_products`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07 create paths and tested `report_info` calls are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-07 current state

Create PASS:
- operation `report_placement_by_supplies_create`
- completed date range `2026-09-01..2026-09-02`
- request `5c5d7784-4989-4ed1-9724-70d3aa3adb5e`
- HTTP200
- physical requests 1
- external request true
- fingerprints `2a4cb92d == 2a4cb92d`
- transformed false
- exact_request_preserved true
- report code `REPORT_seller_placement_by_supplies_2093109_1788408279_01a06570-b345-7114-9532-c1476a0c61e2`.

Report-info PASS:
- request `c8c54b96-4560-4194-bf70-c85ac449689c`
- HTTP200
- physical requests 1
- external request true
- status `success`
- report type `seller_placement_by_supplies`
- provider file redacted
- opaque ref `rpf_49f4be70-84e2-40b7-8224-6a58e409cf29`
- fingerprints `08962c14 == 08962c14`
- transformed false
- exact_request_preserved true
- expires at `2026-09-03T07:04:39.877709Z`.

RAW:
`live-runs/repaired-26/raw/NEW_07_RUN_2_REPORT_INFO_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_07_RUN_2_REPORT_INFO_READY_OPAQUE_FILE_REF_2026-09-03.md`

## Exact next command

`OZON_API_V1 {"operation":"report_file_get","params":{"file_ref":"rpf_49f4be70-84e2-40b7-8224-6a58e409cf29","offset":0,"limit":50}}`

Persist whether DEFECT-001 reproduces on `seller_placement_by_supplies`. Do not patch runtime. After recording, advance to NEW-08.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_07_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
