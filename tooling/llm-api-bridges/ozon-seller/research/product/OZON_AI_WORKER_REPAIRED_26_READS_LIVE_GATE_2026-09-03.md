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
| 10 | NEW-10 | `finance_document_b2b_sales` | COLLECTION_COMPLETE_PROVIDER_FAIL — one exact external request, HTTP404/code5, no retry, no report code | PENDING |
| 11 | NEW-11 | `finance_mutual_settlement_report` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS; report_info PASS; file read POLICY_BLOCKED = DEFECT-001 reproduction #10 | PENDING |
| 12 | NEW-12 | `finance_compensation_report` | COLLECTION_COMPLETE_PROVIDER_FAIL — one exact external request, HTTP404/code5, no retry, no report code | PENDING |
| 13 | NEW-13 | `finance_decompensation_report` | COLLECTION_COMPLETE_PROVIDER_FAIL — one exact external request, HTTP404/code5, no retry, no report code | PENDING |
| 14 | NEW-14 | `cargoes_label_create` | SETUP_IN_PROGRESS — registry template `supply_order_list filter.states=[]` returned provider 400 = DEFECT-005; non-empty states setup NEXT | PENDING |
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

- DEFECT-001: generic `report_file_get` is statically privacy-blocked; confirmed on 10 report classes through NEW-11.
- DEFECT-002: transformed create metadata conflicts with `exact_request_preserved=true`; confirmed on NEW-02/03. Clean counterexamples include NEW-04/05/06/07/08/09/11/12/13 and tested report_info paths.
- DEFECT-003: `report_postings_create.delivery_schema` uppercase/lowercase mismatch (`FBO` 400 vs `fbo` 200).
- DEFECT-004: `report_info.additional_data` key/value representation bypasses personal-data redaction; confirmed on NEW-09. NEW-11 did not reproduce it.
- DEFECT-005: `supply_order_list` runtime template and validator allow/advertise `filter.states=[]`, but provider rejects that exact shape with HTTP400/code3.

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## NEW-14 setup Run1 — DEFECT-005

Submitted exact runtime template:
`{"operation":"supply_order_list","params":{"filter":{"states":[]},"limit":100,"sort_by":"ORDER_CREATION","sort_dir":"DESC"}}`.

Observed:
- request `deba7764-b75b-4fbd-ada0-7e163844d109`
- HTTP400 / provider code `3`
- physical1, logical1, external true
- automatic retry false
- exact request preserved true
- fingerprints `d0967438 == d0967438`
- transformed false.

Runtime validator requires `filter.states`, but `validateEnumArray` accepts an empty array. Registry template uses that same empty array. Therefore this setup result establishes DEFECT-005.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_RAW_2026-09-03.json`
- parsed `live-runs/NEW_14_SETUP_RUN_1_SUPPLY_ORDER_LIST_EMPTY_STATES_PROVIDER_400_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `13/26`.
- Collection-complete/partial/provider-fail rows: `13/26`.
- Open numbered defects: `5`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection command

Retry the NEW-14 setup as a distinct business request with an explicit non-empty set containing all currently allowed supply-order states. This is not an automatic retry of the same failed request; params materially differ.

Persist the setup result before any further Ozon command. If real order ids are returned, resolve a real `supply_id` via explicit safe reads only. Never invent provider IDs.

Do not patch runtime. Do not touch frozen STD-10.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_14_SETUP_EMPTY_STATES_DEFECT_005_NONEMPTY_STATES_NEXT_DEFECTS_001_002_003_004_005_OPEN_STD_10_FROZEN`
