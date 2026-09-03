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
- standalone aliases exercised: `11/26`
- collection-complete/partial/provider-fail: `11/26`
- batch coverage: `0/26`
- open numbered defects: `4`

## Open defects

- DEFECT-001: generic report-file reads privacy-blocked; confirmed on 10 report classes through NEW-11, including `mutual_settlement`.
- DEFECT-002: planning metadata inconsistency on NEW-02/03; NEW-04/05/06/07/08/09/11 create and tested report-info paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch, `FBO` => 400, `fbo` => 200.
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09. NEW-11 `additional_data=[]` and did not reproduce it.

## NEW-11 preserved state

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

Run2 `report_info`:
- request `f56ad0ed-8795-4c66-8dd9-1da54eb3602c`
- HTTP200
- physical requests `1`
- logical business results `1`
- external request `true`
- exact request preserved `true`
- fingerprints `e19249be == e19249be`
- transformed `false`
- report status `success`
- report type `mutual_settlement`
- file `[REDACTED]`
- opaque ref `rpf_18eb749e-08df-4b99-8107-f4dcbf0a2529`
- additional_data empty.

Run3 `report_file_get`:
- request `policy-58d43bb1-6126-4e4c-9178-7609dc7e858d`
- fingerprint `36df3b67`
- HTTP0
- physical requests `0`
- logical business results `0`
- external request `false`
- `POLICY_BLOCKED / personal_data_setting_off`
- error `OPERATION_DISABLED_BY_USER`
- automatic retry `false`
- stage `personal_data_policy`.

Classification:
`COLLECTION_COMPLETE_PARTIAL_FAIL`

Run3 is DEFECT-001 reproduction #10.

Evidence Run3:
- RAW `live-runs/repaired-26/raw/NEW_11_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_11_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Exact next action

Verify the active runtime contract for NEW-12 `finance_compensation_report`, then issue only the exact NEW-12 standalone command. Persist its result before any downstream report/document read.

Do not touch frozen STD-10. Do not patch runtime.

Checkpoint marker:
`COLLECT_ALL_DEFECTS_NEW_11_COMPLETE_PARTIAL_FAIL_DEFECT_001_SCOPE_10_NEW_12_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
