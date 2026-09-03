# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Primary rule: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Persistent evidence rule: `EVERY_TEST_AND_RESULT_TO_GITHUB_BEFORE_NEXT_COMMAND`

## Phase order

1. Exhaust standalone NEW-01..NEW-26.
2. Exhaust required multi-command batch coverage.
3. Persist all successes/failures/policy blocks/metadata anomalies/privacy leaks.
4. Only then patch the complete defect set.
5. Rebuild/certify and rerun affected cases.
6. Resume frozen STD-10 only after the 26-command gate closes.

Runtime patching is forbidden during collection.

## Frozen STD-10

Do not touch:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

That code belongs only to the frozen forensic STD-10 workflow.

## Inventory

| # | ID | Alias | Standalone collection | Batch |
|---:|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001; create metadata = DEFECT-002 | PENDING |
| 3 | NEW-03 | `report_postings_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — lowercase fbo create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001; DEFECT-002/003 confirmed | PENDING |
| 4 | NEW-04 | `report_discounted_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 5 | NEW-05 | `report_warehouse_stock` | COLLECTION_COMPLETE_PARTIAL_FAIL — real FBS setup PASS + create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 6 | NEW-06 | `report_placement_by_products_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — independent create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 7 | NEW-07 | `report_placement_by_supplies_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 8 | NEW-08 | `report_marked_products_sales_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 9 | NEW-09 | `report_realization_posting_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS; report_info PASS with DEFECT-004 privacy leak; file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 10 | NEW-10 | `finance_document_b2b_sales` | COLLECTION_COMPLETE_PROVIDER_FAIL — one exact external request, HTTP404/code5, no retry, no report code; no new bridge defect opened | PENDING |
| 11 | NEW-11 | `finance_mutual_settlement_report` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS clean; report_info PASS clean; file read POLICY_BLOCKED = DEFECT-001 reproduction #10 | PENDING |
| 12 | NEW-12 | `finance_compensation_report` | NEXT | PENDING |
| 13 | NEW-13 | `finance_decompensation_report` | PENDING | PENDING |
| 14 | NEW-14 | `cargoes_label_create` | PENDING | PENDING |
| 15 | NEW-15 | `posting_fbs_act_container_labels` | PENDING | PENDING |
| 16 | NEW-16 | `posting_fbs_package_label` | PENDING | PENDING |
| 17 | NEW-17 | `posting_fbs_package_label_create` | PENDING | PENDING |
| 18 | NEW-18 | `cargoes_transport_label_by_order_create` | PENDING | PENDING |
| 19 | NEW-19 | `cargoes_transport_label_create` | PENDING | PENDING |
| 20 | NEW-20 | `fbp_act_from_create` | PENDING | PENDING |
| 21 | NEW-21 | `fbp_act_to_create` | PENDING | PENDING |
| 22 | NEW-22 | `fbp_label_create` | PENDING | PENDING |
| 23 | NEW-23 | `fbp_draft_direct_product_validate` | PENDING | PENDING |
| 24 | NEW-24 | `fbp_draft_dropoff_product_validate` | PENDING | PENDING |
| 25 | NEW-25 | `fbp_draft_pickup_product_validate` | PENDING | PENDING |
| 26 | NEW-26 | `chat_history_v3` | PENDING | PENDING |

## Defects collected

- DEFECT-001: generic `report_file_get` is statically privacy-blocked; confirmed on 10 report classes through NEW-11, now including `mutual_settlement`.
- DEFECT-002: transformed create metadata conflicts with `exact_request_preserved=true`; confirmed on NEW-02/03. Clean create counterexamples include NEW-04/05/06/07/08/09/11; NEW-11 report_info is also clean.
- DEFECT-003: `report_postings_create.delivery_schema` uppercase/lowercase mismatch (`FBO` 400 vs `fbo` 200).
- DEFECT-004: `report_info.additional_data` key/value representation bypasses personal-data redaction; confirmed on NEW-09 finance realization. NEW-11 `mutual_settlement` returned empty `additional_data` and did not reproduce it.

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## NEW-10 summary — provider 404, no new bridge defect

- request `7182d4dc-f32a-4c33-834f-d8922775cecb`
- operation `finance_document_b2b_sales`, date `2026-08`
- HTTP404 / provider code `5`
- physical requests `1`, logical results `1`
- external request `true`
- automatic retry `false`
- exact request preserved `true`
- fingerprints `04d982c1 == 04d982c1`
- transformed `false`
- no report code; downstream report read impossible.

Classification: `COLLECTION_COMPLETE_PROVIDER_FAIL`.

## NEW-11 chain summary

### Run1 — create PASS clean
- operation `finance_mutual_settlement_report`
- date `2026-08`
- request `57544b21-6d26-4ad3-80fa-fb4bed1b9a85`
- HTTP200, physical1, logical1, external true
- exact request preserved `true`
- fingerprints `29860803 == 29860803`
- transformed `false`
- report code `REPORT_mutual_settlement_2093109_1788412383_01a065af-5079-78cb-a6b5-1110c3c9686a`.

### Run2 — report_info PASS clean
- request `f56ad0ed-8795-4c66-8dd9-1da54eb3602c`
- HTTP200, physical1, logical1, external true
- exact request preserved `true`
- fingerprints `e19249be == e19249be`
- transformed `false`
- report status `success`
- report type `mutual_settlement`
- provider file field redacted
- opaque ref `rpf_18eb749e-08df-4b99-8107-f4dcbf0a2529`
- `additional_data=[]`; DEFECT-004 not reproduced on this report.

### Run3 — report_file_get POLICY_BLOCKED
- request `policy-58d43bb1-6126-4e4c-9178-7609dc7e858d`
- fingerprint `36df3b67`
- HTTP0
- physical0, logical0
- external false
- `POLICY_BLOCKED / personal_data_setting_off`
- error `OPERATION_DISABLED_BY_USER`
- automatic retry false.

This is DEFECT-001 reproduction #10. NEW-11 is `COLLECTION_COMPLETE_PARTIAL_FAIL`.

Evidence Run3:
- RAW `live-runs/repaired-26/raw/NEW_11_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_11_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `11/26`.
- Collection-complete/partial/provider-fail rows: `11/26`.
- Open numbered defects: `4`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

Start NEW-12 `finance_compensation_report` only after confirming its exact active-runtime input contract. Persist the provider result before any downstream report/document read. On provider 4xx/5xx/error do not automatically repeat the same business request. Do not touch frozen STD-10. Do not patch runtime.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_11_COMPLETE_PARTIAL_FAIL_DEFECT_001_SCOPE_10_NEW_12_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
