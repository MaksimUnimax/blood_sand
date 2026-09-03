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
- collection-complete/partial-fail: `9/26`
- batch coverage: `0/26`
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 9 report classes through NEW-09.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09 create and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; NEW-09 finance realization leaked identifying receiver metadata while personal-data setting was OFF. Do not repeat leaked values.

## NEW-09 preserved state

Create PASS:
- request `f69f3965-fe8a-417e-9a59-0e4d43651ed5`
- report code `REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361`
- HTTP200, physical1
- fingerprints `50a8fdbc == 50a8fdbc`
- transformed false.

Report-info PASS with privacy defect:
- request `0ab507a4-3068-43f5-8a5d-54bdc3d09d55`
- report type `finance_realization_posting`
- opaque ref `rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`
- fingerprints `604b53c9 == 604b53c9`
- transformed false
- identifying `additional_data` values leaked; GitHub evidence masks them.

File-read block:
- request `policy-c52040e3-2327-4a14-be83-f786a928b053`
- fingerprint `928bfa76`
- HTTP0, physical0, external false
- `POLICY_BLOCKED / personal_data_setting_off`
- DEFECT-001 reproduction #9.

NEW-09 is `COLLECTION_COMPLETE_PARTIAL_FAIL`.

Evidence Run3:
- RAW `live-runs/repaired-26/raw/NEW_09_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_09_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Exact next action

Start NEW-10 `finance_document_b2b_sales` only after confirming its exact runtime opaque-document flow. Use a completed month, persist the provider result, and then perform only the explicit document-read operation prescribed by runtime. Do not patch.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_09_COMPLETE_PARTIAL_FAIL_NEW_10_DOCUMENT_FLOW_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
