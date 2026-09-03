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
- standalone aliases exercised: `12/26`
- collection-complete/partial/provider-fail: `12/26`
- batch coverage: `0/26`
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 10 report classes through NEW-11, including `mutual_settlement`.
- DEFECT-002: planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09/11/12 and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09. NEW-11 `additional_data=[]` and did not reproduce it.

## NEW-12 preserved state

Run1 `finance_compensation_report` with `date=2026-08`:
- request `27840128-438a-4e03-8b70-97ee571c55de`
- HTTP404 / provider code `5`
- physical requests `1`
- logical business results `1`
- external request `true`
- automatic retry `false`
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key `POST /v1/finance/compensation`
- exact request preserved `true`
- fingerprints `0fb59a8f == 0fb59a8f`
- transformed `false`
- no report code returned.

Classification:
`COLLECTION_COMPLETE_PROVIDER_FAIL`

No downstream `report_info` or `report_file_get` can follow from this run. Do not automatically retry the same 4xx provider request.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_12_RUN_1_FINANCE_COMPENSATION_REPORT_PROVIDER_404_RAW_2026-09-03.json`
- parsed `live-runs/NEW_12_RUN_1_FINANCE_COMPENSATION_REPORT_PROVIDER_404_2026-09-03.md`

## Exact next action

Run NEW-13 `finance_decompensation_report` with completed month `2026-08`. The active runtime contract requires `date` in month format and optional `language`.

Persist its provider result before any downstream report/document read. On provider 4xx/5xx/error do not automatically repeat the same business request.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_12_PROVIDER_404_COMPLETE_NEW_13_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
