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
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic safe report-file reads privacy-blocked; confirmed on 8 report classes through NEW-08.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09 create and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; NEW-09 leaked identifying receiver metadata while personal-data setting was OFF.

## NEW-09 current state

Create PASS:
- operation `report_realization_posting_create`
- completed month August 2026
- request `f69f3965-fe8a-417e-9a59-0e4d43651ed5`
- HTTP200, physical1, external true
- fingerprints `50a8fdbc == 50a8fdbc`
- transformed false
- report code `REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361`.

Report-info PASS with privacy defect:
- request `0ab507a4-3068-43f5-8a5d-54bdc3d09d55`
- HTTP200, physical1, external true
- status `success`
- report type `finance_realization_posting`
- provider file redacted
- opaque ref `rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`
- fingerprints `604b53c9 == 604b53c9`
- transformed false.

DEFECT-004 details:
- `additional_data` exposed identifying receiver metadata while personal-data setting was OFF.
- Do not repeat those values in chat or GitHub.
- Persisted privacy-safe RAW masks every `additional_data.value`.
- Structural keys retained for diagnosis include `ReceiverName`, `ReceiverInn`, `ReceiverKpp`.

Evidence:
- privacy-safe RAW `live-runs/repaired-26/raw/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_SANITIZED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_2026-09-03.md`

## Exact next command

`OZON_API_V1 {"operation":"report_file_get","params":{"file_ref":"rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95","offset":0,"limit":50}}`

Persist whether DEFECT-001 reproduces on `finance_realization_posting`. Keep personal-data setting OFF. Do not patch runtime. After recording, advance to NEW-10.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_09_REPORT_INFO_PRIVACY_LEAK_DEFECT_004_FILE_GET_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
