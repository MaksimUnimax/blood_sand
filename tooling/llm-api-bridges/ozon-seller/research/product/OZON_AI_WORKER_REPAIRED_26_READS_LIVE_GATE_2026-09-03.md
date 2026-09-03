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
| 12 | NEW-12 | `finance_compensation_report` | COLLECTION_COMPLETE_PROVIDER_FAIL — one exact external request, HTTP404/code5, no retry, no report code; no new bridge defect opened | PENDING |
| 13 | NEW-13 | `finance_decompensation_report` | NEXT | PENDING |
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

- DEFECT-001: generic `report_file_get` is statically privacy-blocked; confirmed on 10 report classes through NEW-11, including `mutual_settlement`.
- DEFECT-002: transformed create metadata conflicts with `exact_request_preserved=true`; confirmed on NEW-02/03. Clean counterexamples include NEW-04/05/06/07/08/09/11/12 and tested report_info paths.
- DEFECT-003: `report_postings_create.delivery_schema` uppercase/lowercase mismatch (`FBO` 400 vs `fbo` 200).
- DEFECT-004: `report_info.additional_data` key/value representation bypasses personal-data redaction; confirmed on NEW-09 finance realization. NEW-11 `mutual_settlement` returned empty `additional_data` and did not reproduce it.

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## NEW-12 summary — provider 404, no new bridge defect

Submitted:
`finance_compensation_report` with `date=2026-08`.

Observed:
- request `27840128-438a-4e03-8b70-97ee571c55de`
- HTTP404, provider code `5`
- physical requests `1`, logical results `1`
- external request `true`
- automatic retry `false`
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key `POST /v1/finance/compensation`
- exact request preserved `true`
- fingerprints `0fb59a8f == 0fb59a8f`
- transformed `false`
- no report code returned.

Classification: `COLLECTION_COMPLETE_PROVIDER_FAIL`.

No downstream `report_info` or `report_file_get` is possible from this run. Do not automatically repeat the same 4xx business request.

Evidence:
- RAW `live-runs/repaired-26/raw/NEW_12_RUN_1_FINANCE_COMPENSATION_REPORT_PROVIDER_404_RAW_2026-09-03.json`
- parsed `live-runs/NEW_12_RUN_1_FINANCE_COMPENSATION_REPORT_PROVIDER_404_2026-09-03.md`

## Progress

- Fully final-closed: `0/26`.
- Standalone aliases exercised: `12/26`.
- Collection-complete/partial/provider-fail rows: `12/26`.
- Open numbered defects: `4`.
- Batch coverage: `0/26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

Start NEW-13 `finance_decompensation_report` with completed month `2026-08`. Persist its provider result before any downstream report/document read. On provider 4xx/5xx/error do not automatically repeat the same business request. Do not touch frozen STD-10. Do not patch runtime.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_NEW_12_PROVIDER_404_COMPLETE_NEW_13_NEXT_DEFECTS_001_002_003_004_OPEN_STD_10_FROZEN`
