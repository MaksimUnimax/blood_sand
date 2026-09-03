# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Primary rule: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Persistent evidence rule: `EVERY_TEST_AND_RESULT_TO_GITHUB_BEFORE_NEXT_COMMAND`

## Phase order

1. Exhaust standalone NEW-01..NEW-26.
2. Exhaust required multi-command batch coverage.
3. Persist all successes/failures/policy blocks/metadata anomalies.
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
| 6 | NEW-06 | `report_placement_by_products_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — independent create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001; no transform anomaly | PENDING |
| 7 | NEW-07 | `report_placement_by_supplies_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001; no transform anomaly | PENDING |
| 8 | NEW-08 | `report_marked_products_sales_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001; no transform anomaly | PENDING |
| 9 | NEW-09 | `report_realization_posting_create` | NEXT | PENDING |
| 10 | NEW-10 | `finance_document_b2b_sales` | PENDING | PENDING |
| 11 | NEW-11 | `finance_mutual_settlement_report` | PENDING | PENDING |
| 12 | NEW-12 | `finance_compensation_report` | PENDING | PENDING |
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

- DEFECT-001: static privacy block on safe `report_file_get`, confirmed on 8 report types: `seller_products`, `seller_returns_v2`, `seller_postings`, `seller_discounted`, `seller_stocks`, `seller_placement_by_products`, `seller_placement_by_supplies`, `marked_products_sales`.
- DEFECT-002: transformed create metadata conflicts with `exact_request_preserved=true`; confirmed on NEW-02/03. Clean repaired paths include NEW-04, NEW-05, NEW-06, NEW-07 and NEW-08 create; tested `report_info` paths are also clean.
- DEFECT-003: `report_postings_create.delivery_schema` uppercase/lowercase mismatch (`FBO` 400 vs `fbo` 200).

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## NEW-08 chain summary

### Run1 — create PASS
- request `f32ff016-3582-4302-903f-af02f3afd699`
- HTTP200, physical1, external true
- fingerprints `0630aa10 == 0630aa10`
- transformed false
- report code `REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc`.

### Run2 — report_info PASS
- request `d220db46-ad97-4744-b7e2-75cf91bf12ed`
- HTTP200, status `success`
- report type `marked_products_sales`
- opaque ref `rpf_e414b482-5e63-4211-99aa-be3ed53ff09b`
- fingerprints `fcc2dd70 == fcc2dd70`
- transformed false.

### Run3 — report_file_get POLICY_BLOCKED
- request `policy-7fb3e562-2c99-43a9-a203-edae0701f579`
- fingerprint `c35d1869`
- HTTP0
- physical0
- external false
- `POLICY_BLOCKED / personal_data_setting_off`
- error `OPERATION_DISABLED_BY_USER`.

This is DEFECT-001 reproduction #8. NEW-08 collection is complete enough to advance.

RAW Run3:
`live-runs/repaired-26/raw/NEW_08_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`

Parsed Run3:
`live-runs/NEW_08_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `8/26`.
- Collection-complete/partial-fail rows: `8/26`.
- Open numbered defects: `3`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

Start NEW-09 `report_realization_posting_create`. Active runtime contract requires integer `month` in `1..12` and integer `year >= 2023`. Use a completed month, persist the result, and do not patch runtime.

Exact next payload:
`{"operation":"report_realization_posting_create","params":{"month":8,"year":2026}}`

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_08_COMPLETE_PARTIAL_FAIL_NEW_09_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
