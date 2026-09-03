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

## Inventory

| # | ID | Alias | Standalone collection | Batch |
|---:|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001 | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | PARTIAL_FAIL — create PASS, report_info PASS, file read POLICY_BLOCKED = DEFECT-001; create metadata = DEFECT-002 | PENDING |
| 3 | NEW-03 | `report_postings_create` | COLLECTION_COMPLETE_PARTIAL_FAIL — lowercase fbo create PASS + report_info PASS; file read POLICY_BLOCKED = DEFECT-001; DEFECT-002/003 confirmed | PENDING |
| 4 | NEW-04 | `report_discounted_create` | NEXT | PENDING |
| 5 | NEW-05 | `report_warehouse_stock` | PENDING | PENDING |
| 6 | NEW-06 | `report_placement_by_products_create` | PARTIAL_EXTERNAL_EVIDENCE — frozen STD-10 create cannot be reused | PENDING |
| 7 | NEW-07 | `report_placement_by_supplies_create` | PENDING | PENDING |
| 8 | NEW-08 | `report_marked_products_sales_create` | PENDING | PENDING |
| 9 | NEW-09 | `report_realization_posting_create` | PENDING | PENDING |
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

### DEFECT-001

Generic safe report-file reads are statically privacy-blocked. Confirmed on three independent safe report types:
- NEW-01 `seller_products`;
- NEW-02 `seller_returns_v2`;
- NEW-03 `seller_postings`.

All three file reads: local `POLICY_BLOCKED / personal_data_setting_off`, physical requests `0`, external request `false`.

### DEFECT-002

Repeated planning metadata inconsistency: physical fingerprint differs and `command_transformed=true` while entitlement reports `exact_request_preserved=true`. Confirmed on NEW-02 and NEW-03 create paths. NEW-03 `report_info` did not reproduce it.

### DEFECT-003

`report_postings_create.filter.delivery_schema` case mismatch. Live A/B on same past range:
- `["FBO"]` => HTTP400;
- `["fbo"]` => HTTP200.

## NEW-03 final collection state

Successful create:
- request `8e92df34-abdc-450f-a82b-dd55605bb7ac`
- report code `REPORT_seller_postings_2093109_1788406191_01a06550-d51a-7587-9280-b9432c90825c`.

Report-info PASS:
- request `72342313-8c33-4e39-a047-56c01716cf28`
- status `success`
- report type `seller_postings`
- opaque ref `rpf_4619d324-8228-4c8e-b8be-c4c1ea05b92c`.

File-read policy block:
- request `policy-5e9052c9-6106-4f28-846c-e1717fd88c1f`
- HTTP0
- physical requests 0
- external request false
- reason `personal_data_setting_off`.

RAW:
`live-runs/repaired-26/raw/NEW_03_RUN_5_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_03_RUN_5_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `3/26`.
- Open numbered defects/candidates: `3`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

Start NEW-04 `report_discounted_create` with a fresh standalone create request. Persist its RAW/result before any following step. Do not patch any existing defect during collection.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_03_COLLECTION_COMPLETE_PARTIAL_FAIL_NEW_04_CREATE_NEXT_DEFECTS_001_002_003_OPEN_STD_10_FROZEN`
