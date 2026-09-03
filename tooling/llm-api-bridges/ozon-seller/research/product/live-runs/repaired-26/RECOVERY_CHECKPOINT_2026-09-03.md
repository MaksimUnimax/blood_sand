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
- standalone aliases exercised: `10/26`
- collection-complete/partial/provider-fail: `10/26`
- batch coverage: `0/26`
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 9 report classes through NEW-09.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09 create and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; NEW-09 finance realization leaked identifying receiver metadata while personal-data setting was OFF. Do not repeat leaked values.

## NEW-10 preserved state

Submitted command:
`finance_document_b2b_sales` with `date=2026-08`.

Provider result:
- request `7182d4dc-f32a-4c33-834f-d8922775cecb`
- HTTP404 / provider code `5`
- physical requests `1`
- logical business results `1`
- external request `true`
- automatic retry `false`
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key `POST /v1/finance/document-b2b-sales`
- exact request preserved `true`
- fingerprints `04d982c1 == 04d982c1`
- transformed `false`.

Classification:
`COLLECTION_COMPLETE_PROVIDER_FAIL`

The current endpoint contract still accepts required `date` in `YYYY-MM` form, so this single provider 404 does not establish a new bridge defect. Do not automatically repeat the request after 4xx. No report code was returned, therefore no NEW-10 `report_info` / `report_file_get` can follow from this run.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_10_RUN_1_FINANCE_DOCUMENT_B2B_SALES_PROVIDER_404_RAW_2026-09-03.json`
- parsed `live-runs/NEW_10_RUN_1_FINANCE_DOCUMENT_B2B_SALES_PROVIDER_404_2026-09-03.md`

## Exact next action

Start NEW-11 `finance_mutual_settlement_report` with completed month `2026-08`. Persist its provider result before any downstream report/document read. If provider returns 4xx/5xx/error, do not automatically repeat the same business request. Do not patch.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_10_PROVIDER_404_COMPLETE_NEW_11_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
