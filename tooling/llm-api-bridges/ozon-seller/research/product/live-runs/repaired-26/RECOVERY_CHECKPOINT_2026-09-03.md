# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch collection is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

That code belongs only to the frozen forensic workflow.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `8/26`
- collection-complete/partial-fail: `7/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`, `seller_placement_by_products`, `seller_placement_by_supplies`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08 create paths and tested `report_info` calls are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-08 current state

Create PASS:
- operation `report_marked_products_sales_create`
- completed date interval `2026-09-01..2026-09-02`
- request `f32ff016-3582-4302-903f-af02f3afd699`
- HTTP200
- physical requests 1
- external request true
- fingerprints `0630aa10 == 0630aa10`
- transformed false
- exact_request_preserved true
- report code `REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc`.

RAW:
`live-runs/repaired-26/raw/NEW_08_RUN_1_REPORT_MARKED_PRODUCTS_SALES_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_08_RUN_1_REPORT_MARKED_PRODUCTS_SALES_CREATE_2026-09-03.md`

## Exact next command

`OZON_API_V1 {"operation":"report_info","params":{"code":"REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc"}}`

Persist that result before any following command. If ready, subsequent separate step is `report_file_get` on NEW-08's opaque ref to scope DEFECT-001. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_08_CREATE_PASS_REPORT_INFO_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
