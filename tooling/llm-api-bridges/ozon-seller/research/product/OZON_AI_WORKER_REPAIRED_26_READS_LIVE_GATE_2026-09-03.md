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
| 9 | NEW-09 | `report_realization_posting_create` | IN_PROGRESS_PARTIAL_FAIL — create PASS; report_info PASS but leaked receiver identity metadata = DEFECT-004; file read NEXT | PENDING |
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
- DEFECT-002: transformed create metadata conflicts with `exact_request_preserved=true`; confirmed on NEW-02/03. Clean repaired create counterexamples include NEW-04/05/06/07/08/09; tested report-info transform metadata is also clean.
- DEFECT-003: `report_postings_create.delivery_schema` uppercase/lowercase mismatch (`FBO` 400 vs `fbo` 200).
- DEFECT-004: `report_info.additional_data` key/value representation bypasses personal-data redaction. NEW-09 `finance_realization_posting` exposed identifying receiver metadata while personal-data setting was OFF.

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## NEW-09 chain

### Run1 — create PASS

- operation `report_realization_posting_create`
- completed month August 2026
- request `f69f3965-fe8a-417e-9a59-0e4d43651ed5`
- HTTP200, physical1, external true
- fingerprints `50a8fdbc == 50a8fdbc`
- transformed false
- report code `REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361`.

### Run2 — report_info PASS with DEFECT-004 privacy leak

- request `0ab507a4-3068-43f5-8a5d-54bdc3d09d55`
- HTTP200
- physical requests `1`
- external request true
- status `success`
- report type `finance_realization_posting`
- provider file `[REDACTED]`
- opaque ref `rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`
- fingerprints `604b53c9 == 604b53c9`
- transformed false
- exact_request_preserved true.

Privacy failure:
- `additional_data` contained unredacted identifying receiver metadata although personal-data setting was OFF.
- Sensitive values are not persisted verbatim in GitHub; privacy-safe RAW masks all `additional_data.value` fields.
- Structural evidence preserves semantic keys including `ReceiverName`, `ReceiverInn`, `ReceiverKpp` to prove the bypass.

Evidence:
- privacy-safe RAW `live-runs/repaired-26/raw/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_SANITIZED_RAW_2026-09-03.json`
- parsed `live-runs/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `9/26`.
- Collection-complete/partial-fail rows: `8/26`.
- Open numbered defects: `4`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

NEW-09 `report_file_get` using:
`rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`

Record whether DEFECT-001 extends to `finance_realization_posting`. Do not enable personal-data setting, do not repeat the leaked identity values, and do not patch runtime. After persisting that result, advance to NEW-10.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_09_REPORT_INFO_PRIVACY_LEAK_DEFECT_004_FILE_GET_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
