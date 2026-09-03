# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Primary rule: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Persistent evidence rule: `EVERY_TEST_AND_RESULT_TO_GITHUB_BEFORE_NEXT_COMMAND`

## Execution policy

The test phase and repair phase are separate.

1. Exercise all 26 repaired aliases standalone to the strongest reachable result.
2. Exercise all 26 aliases in real multi-command batches with 2+ independent logical commands.
3. Persist every RAW result, parsed evidence, defect, gate state and recovery checkpoint.
4. A discovered defect does not stop unrelated testing unless it makes further testing technically impossible.
5. **Do not patch runtime during collection.**
6. After the complete defect set is collected, group and patch defects, rebuild/certify, then rerun affected tests.
7. STD-10 remains frozen until the repaired-26 gate is ultimately closed.

## Standalone acceptance

- Immediate JSON: real provider response with usable JSON.
- Report: create -> `report_info` -> `report_file_get` when reachable -> usable structured rows.
- Direct document/PDF: provider response -> opaque ref -> explicit document read.
- Async document: create -> status/get -> opaque ref -> document read.
- Sensitive READ: privacy-gate behavior plus real provider read when enabled.

During collection, a blocked/failed later step is recorded as a defect/partial result and testing continues to the next independent NEW-ID.

## Batch acceptance

Every repaired alias must later appear in at least one real batch with 2+ independent logical commands. Persist and verify:

- `result_count`;
- logical and physical business request counts;
- result order;
- per-result request IDs, aliases and fingerprints;
- params/result isolation;
- transform metadata;
- coalescing behavior;
- controlled partial-failure isolation.

## Persistent evidence

RAW results: `research/product/live-runs/repaired-26/raw/`

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_LIVE_DEFECT_LEDGER_2026-09-03.md`

Recovery authority:
`live-runs/repaired-26/RECOVERY_CHECKPOINT_2026-09-03.md`

## Frozen STD-10

Do not touch:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

NEW-06 must use a separate generic report chain.

## Gate inventory

| # | ID | Alias | Standalone collection state | Batch |
|---:|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | PARTIAL_FAIL — create PASS, info PASS, file POLICY_BLOCKED = DEFECT-001 | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | IN_PROGRESS — create PASS; `report_info` next; DEFECT-002 candidate | PENDING |
| 3 | NEW-03 | `report_postings_create` | PENDING | PENDING |
| 4 | NEW-04 | `report_discounted_create` | PENDING | PENDING |
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

## NEW-01 collected evidence

Run1 create PASS:
- request `d1834261-fbc4-498a-ba2e-6873a6ead564`
- HTTP 200
- code `REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`.

Run2 report_info PASS:
- request `067c8a20-6d5f-46bf-a156-b33f3f9952fd`
- status `success`
- signed file redacted
- opaque ref `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`.

Run3 report_file_get:
- policy request `policy-558df595-6ff0-4eb6-b5f6-03eb658ebe6c`
- physical requests `0`
- external request `false`
- `POLICY_BLOCKED / personal_data_setting_off`.

This is `DEFECT-001`: generic report-file helper is overbroadly privacy-gated for a safe seller-products report. No patch during collection.

## NEW-02 collected evidence

Run1 create PASS:
- alias `report_returns_create_v2`
- request `8b963833-eb57-4fe8-9b34-ff609ddf735c`
- HTTP 200
- physical requests `1`
- external request `true`
- entitlement `SUPPORTED_AND_ENTITLED / all_accounts`
- returned code `REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`.

Planning metadata defect candidate (`DEFECT-002`):
- logical fingerprint `687fa368`
- physical fingerprint `d1fbfbfe`
- `command_transformed=true`
- while `exact_request_preserved=true`.

RAW:
`live-runs/repaired-26/raw/NEW_02_RUN_1_REPORT_RETURNS_CREATE_RAW_2026-09-03.json`

Parsed:
`live-runs/NEW_02_RUN_1_REPORT_RETURNS_CREATE_2026-09-03.md`

## Current collection progress

- Fully final-closed: `0 / 26`.
- Standalone NEW-IDs exercised: `2 / 26`.
- Open defects/candidates: `2`.
- Batch coverage: `0 / 26`.
- Runtime patching: **FORBIDDEN UNTIL COLLECTION COMPLETE**.
- STD-10: frozen.

## Exact next collection step

Continue NEW-02 with one explicit `report_info` for:

`REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6`

If file-ready, attempt `report_file_get` as a later explicit step even though DEFECT-001 may reproduce; record the result rather than patching.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_2_OF_26_EXERCISED_DEFECTS_001_002_OPEN_NEW_02_REPORT_INFO_NEXT_STD_10_FROZEN`
