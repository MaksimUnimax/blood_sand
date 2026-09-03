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

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on seller_products, seller_returns_v2, seller_postings, seller_discounted. NEW-05 seller_stocks file-read is the next scope check.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05 create and NEW-05 report_info are clean counterexamples.
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

Report-info PASS:
- request `f543d8bd-0f37-4f77-b7e2-21439f600870`
- HTTP200
- status `success`
- report type `seller_stocks`
- signed provider file redacted
- opaque ref `rpf_304de093-ae1b-46f3-8be0-2a16793361b9`
- fingerprints `83c2156b == 83c2156b`
- transformed false
- expires at `2026-09-03T04:18:03.956035Z`.

## Exact next command

`OZON_API_V1 {"operation":"report_file_get","params":{"file_ref":"rpf_304de093-ae1b-46f3-8be0-2a16793361b9","offset":0,"limit":50}}`

Persist whether DEFECT-001 reproduces on seller_stocks. Do not patch runtime. After recording, advance to NEW-06 using an independent generic placement report; never use the frozen STD-10 report code.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_05_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
