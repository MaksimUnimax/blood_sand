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

## Progress

- final closed: `0/26`
- standalone aliases exercised: `5/26`
- collection-complete/partial-fail: `4/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on seller_products, seller_returns_v2, seller_postings, seller_discounted.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05 clean counterexamples.
- DEFECT-003: report_postings delivery_schema case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-05 setup

Real FBS seller warehouse:
- id `1020001773680000`
- name `Златоуст Чёт`
- type `fbs`.

## NEW-05 current state

Create PASS:
- operation `report_warehouse_stock`
- request `bd63066b-55bf-44cc-baec-98bed0d4ed47`
- HTTP200
- physical requests 1
- external request true
- fingerprints `f8e4cdac == f8e4cdac`
- transformed false
- report code `REPORT_seller_stocks_2093109_1788407283_01a06561-80f3-78d2-9c6a-3c829871385f`.

## Exact next command

`OZON_API_V1 {"operation":"report_info","params":{"code":"REPORT_seller_stocks_2093109_1788407283_01a06561-80f3-78d2-9c6a-3c829871385f"}}`

If ready, next separate step is `report_file_get` to scope DEFECT-001 on seller_stocks. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_05_CREATE_PASS_REPORT_INFO_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
