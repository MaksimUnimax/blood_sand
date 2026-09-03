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

That code belongs only to the frozen forensic workflow. NEW-06 must create and use a separate generic report code.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `5/26`
- collection-complete/partial-fail: `5/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05 create and tested `report_info` calls are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-05 preserved state

Setup warehouse:
- `1020001773680000`
- `Златоуст Чёт`
- `fbs`.

Create PASS:
- request `bd63066b-55bf-44cc-baec-98bed0d4ed47`
- code `REPORT_seller_stocks_2093109_1788407283_01a06561-80f3-78d2-9c6a-3c829871385f`
- HTTP200, physical1, transformed false.

Report-info PASS:
- request `f543d8bd-0f37-4f77-b7e2-21439f600870`
- report type `seller_stocks`
- opaque ref `rpf_304de093-ae1b-46f3-8be0-2a16793361b9`.

File-read block:
- request `policy-af96433d-9756-4b57-82da-6a058e782aec`
- HTTP0, physical0, external false
- `POLICY_BLOCKED / personal_data_setting_off`
- DEFECT-001 reproduction #5.

## Exact next command

Start NEW-06 with an independent generic placement report over a completed interval:

`OZON_API_V1 {"operation":"report_placement_by_products_create","params":{"date_from":"2026-09-01","date_to":"2026-09-02"}}`

Persist its RAW/result/code before any following command. Never call `report_info` on the frozen STD-10 code during this gate.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_05_COMPLETE_PARTIAL_FAIL_NEW_06_GENERIC_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
