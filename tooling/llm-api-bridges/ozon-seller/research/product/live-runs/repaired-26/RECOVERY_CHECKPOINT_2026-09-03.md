# Repaired 26 READ live gate — recovery checkpoint

Date: 2026-09-03
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Branch: `research/ozon-product-demand-2026-09-02`

## Governing mode

`COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

Do not patch runtime until standalone + required batch collection is exhausted. Persist every result before the next Ozon command.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-6ac5e04697cb`

That code belongs only to the frozen forensic workflow.

## Progress

- final closed: `0/26`
- standalone aliases exercised: `11/26`
- collection-complete/partial/provider-fail: `10/26`
- batch coverage: `0/26`
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 9 report classes through NEW-09.
- DEFECT-002: create planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09/11 create and tested report-info paths are clean counterexamples.
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

## NEW-11 active state

Run1 `finance_mutual_settlement_report` with `date=2026-08`:
- request `57544b21-6d26-4ad3-80fa-fb4bed1b9a85`
- HTTP200
- physical requests `1`
- logical business results `1`
- external request `true`
- exact request preserved `true`
- fingerprints `29860803 == 29860803`
- transformed `false`
- report code `REPORT_mutual_settlement_2093109_1788412383_01a065af-5079-78cb-a6b5-1110c3c9686a`.

Classification:
`IN_PROGRESS_CREATE_PASS_REPORT_INFO_NEXT`

No new defect from Run1. The unchanged fingerprints are another clean counterexample for DEFECT-002.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_11_RUN_1_FINANCE_MUTUAL_SETTLEMENT_REPORT_RAW_2026-09-03.json`
- parsed `live-runs/NEW_11_RUN_1_FINANCE_MUTUAL_SETTLEMENT_REPORT_2026-09-03.md`

## Exact next action

Run NEW-11 `report_info` for this exact independent code only:
`REPORT_mutual_settlement_2093109_1788412383_01a065af-5079-78cb-a6b5-1110c3c9686a`.

Persist the result before any explicit file/document read. Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_11_CREATE_PASS_REPORT_INFO_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
