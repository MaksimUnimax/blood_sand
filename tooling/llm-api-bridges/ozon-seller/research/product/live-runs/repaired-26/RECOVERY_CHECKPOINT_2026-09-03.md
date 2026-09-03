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
- standalone aliases exercised: `9/26`
- collection-complete/partial-fail: `8/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`, `seller_placement_by_products`, `seller_placement_by_supplies`, `marked_products_sales`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09 create paths and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-09 current state

Create PASS:
- operation `report_realization_posting_create`
- completed month August 2026 (`month=8`, `year=2026`)
- request `f69f3965-fe8a-417e-9a59-0e4d43651ed5`
- HTTP200
- physical requests 1
- external request true
- fingerprints `50a8fdbc == 50a8fdbc`
- transformed false
- exact_request_preserved true
- report code `REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361`.

RAW:
`live-runs/repaired-26/raw/NEW_09_RUN_1_REPORT_REALIZATION_POSTING_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_09_RUN_1_REPORT_REALIZATION_POSTING_CREATE_2026-09-03.md`

## Exact next command

`OZON_API_V1 {"operation":"report_info","params":{"code":"REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361"}}`

Persist that result before any following command. If ready, subsequent separate step is `report_file_get` on NEW-09's opaque ref to scope DEFECT-001. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_09_CREATE_PASS_REPORT_INFO_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
