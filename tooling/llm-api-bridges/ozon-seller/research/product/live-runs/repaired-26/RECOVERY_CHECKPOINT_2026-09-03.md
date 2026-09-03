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

That code belongs only to the frozen forensic workflow. NEW-06 has its own independent report code and opaque ref.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `6/26`
- collection-complete/partial-fail: `5/26`
- batch coverage: `0/26`
- open numbered defects: `3`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06 create and tested `report_info` calls are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.

## NEW-06 current state

Independent create PASS:
- operation `report_placement_by_products_create`
- completed date range `2026-09-01..2026-09-02`
- request `5171ffdb-7762-4bb9-ae8a-1663f1932045`
- HTTP200
- physical requests 1
- external request true
- fingerprints `85e4f38a == 85e4f38a`
- transformed false
- exact_request_preserved true
- independent report code `REPORT_seller_placement_by_products_2093109_1788407770_01a06568-ee50-7d2e-bcca-9594563e3735`.

Report-info PASS:
- request `e78e1813-43de-41d9-ac9a-32d00c5fcc5c`
- HTTP200
- physical requests 1
- external request true
- status `success`
- report type `seller_placement_by_products`
- provider file redacted
- opaque ref `rpf_ec4858fd-8af3-4da5-a7c3-ddd4ec1753b9`
- fingerprints `c5855b10 == c5855b10`
- transformed false
- exact_request_preserved true
- expires at `2026-09-03T06:56:10.706976Z`.

RAW:
`live-runs/repaired-26/raw/NEW_06_RUN_2_REPORT_INFO_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_06_RUN_2_REPORT_INFO_READY_OPAQUE_FILE_REF_2026-09-03.md`

## Exact next command

`OZON_API_V1 {"operation":"report_file_get","params":{"file_ref":"rpf_ec4858fd-8af3-4da5-a7c3-ddd4ec1753b9","offset":0,"limit":50}}`

Persist whether DEFECT-001 reproduces on `seller_placement_by_products`. Do not patch runtime. After recording, advance to NEW-07. Never touch the frozen STD-10 report code during this gate.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_06_REPORT_INFO_PASS_FILE_GET_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
