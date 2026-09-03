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
| 10 | NEW-10 | `finance_document_b2b_sales` | COLLECTION_COMPLETE_PROVIDER_FAIL — HTTP404/code5, no retry, no report code | PENDING |
| 11 | NEW-11 | `finance_mutual_settlement_report` | COLLECTION_COMPLETE_PARTIAL_FAIL — create PASS; report_info PASS; file read POLICY_BLOCKED = DEFECT-001 reproduction #10 | PENDING |
| 12 | NEW-12 | `finance_compensation_report` | COLLECTION_COMPLETE_PROVIDER_FAIL — HTTP404/code5, no retry, no report code | PENDING |
| 13 | NEW-13 | `finance_decompensation_report` | COLLECTION_COMPLETE_PROVIDER_FAIL — HTTP404/code5, no retry, no report code | PENDING |
| 14 | NEW-14 | `cargoes_label_create` | COLLECTION_COMPLETE_PROVIDER_RATE_LIMIT_FAIL — real supply id; one exact request; HTTP429/code8; no auto retry; no downstream ref | PENDING |
| 15 | NEW-15 | `posting_fbs_act_container_labels` | SETUP_IN_PROGRESS — exact `fbs_act_list {limit:50}` template provider 400 = DEFECT-006; explicit period-filter A/B NEXT | PENDING |
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

- DEFECT-001: generic `report_file_get` statically privacy-blocked; confirmed on 10 report classes.
- DEFECT-002: transformed create metadata conflicts with `exact_request_preserved=true`; confirmed on NEW-02/03. Multiple later paths are clean counterexamples.
- DEFECT-003: `report_postings_create.delivery_schema` case mismatch (`FBO` 400 vs `fbo` 200).
- DEFECT-004: `report_info.additional_data` key/value privacy-redaction bypass; confirmed on NEW-09.
- DEFECT-005: `supply_order_list` template/validator accepts `filter.states=[]`, provider rejects it; non-empty A/B passes.
- DEFECT-006: `fbs_act_list` registry/validator allows and advertises `{limit:50}` without filter, provider rejects that form HTTP400/code3; explicit period-filter control pending.

## NEW-15 setup Run1

Exact active registry template:
`OZON_API_V1 {"operation":"fbs_act_list","params":{"limit":50}}`

Observed:
- request `8ee3ff42-c8aa-4b98-9412-c73af369440b`
- HTTP400 / provider code `3`
- physical1, logical1, external true
- automatic retry false
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved true
- fingerprints `937e3a3f == 937e3a3f`
- transformed false.

Runtime `normalizeFbsActListParams` requires `limit`, treats `filter` as optional, and requires `date_from` + `date_to` only when filter exists. Current API documentation shows the list request with the period filter. This establishes DEFECT-006 scope and requires a materially different A/B request, not a retry of the same business request.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_RAW_2026-09-03.json`
- parsed `live-runs/NEW_15_SETUP_RUN_1_FBS_ACT_LIST_TEMPLATE_PROVIDER_400_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `14/26`.
- Collection-complete/partial/provider-fail rows: `14/26`.
- Open numbered defects: `6`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection command

Run materially different safe setup read with explicit completed-period filter:
`OZON_API_V1 {"operation":"fbs_act_list","params":{"filter":{"date_from":"2026-08-01T00:00:00Z","date_to":"2026-08-31T23:59:59Z"},"limit":50}}`

The active runtime accepts date fields as strings; current public request documentation requires the period fields when using the filter. Persist the result before any further Ozon command. Do not patch runtime. Do not touch frozen STD-10.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_15_SETUP_TEMPLATE_400_DEFECT_006_PERIOD_FILTER_AB_NEXT_DEFECTS_001_002_003_004_005_006_OPEN_STD_10_FROZEN`
