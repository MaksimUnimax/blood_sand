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
- collection-complete/partial-fail: `8/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`, `seller_placement_by_products`, `seller_placement_by_supplies`, `marked_products_sales`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08 create paths and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-08 preserved state

Create PASS:
- request `f32ff016-3582-4302-903f-af02f3afd699`
- report code `REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc`
- HTTP200, physical1
- fingerprints `0630aa10 == 0630aa10`
- transformed false.

Report-info PASS:
- request `d220db46-ad97-4744-b7e2-75cf91bf12ed`
- report type `marked_products_sales`
- opaque ref `rpf_e414b482-5e63-4211-99aa-be3ed53ff09b`
- fingerprints `fcc2dd70 == fcc2dd70`
- transformed false.

File-read block:
- request `policy-7fb3e562-2c99-43a9-a203-edae0701f579`
- fingerprint `c35d1869`
- HTTP0, physical0, external false
- `POLICY_BLOCKED / personal_data_setting_off`
- DEFECT-001 reproduction #8.

NEW-08 is `COLLECTION_COMPLETE_PARTIAL_FAIL`.

RAW Run3:
`live-runs/repaired-26/raw/NEW_08_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`

Parsed Run3:
`live-runs/NEW_08_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Exact next action

Start NEW-09. Active runtime contract for `report_realization_posting_create` requires:
- `month`: integer `1..12`;
- `year`: integer `>= 2023`.

Use completed month August 2026.

Exact next command:
`OZON_API_V1 {"operation":"report_realization_posting_create","params":{"month":8,"year":2026}}`

Persist its result before any continuation. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_08_COMPLETE_PARTIAL_FAIL_NEW_09_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
