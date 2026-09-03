# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `ACTIVE_COLLECT_ALL_DEFECTS_BEFORE_PATCHING`
Primary rule: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Persistent evidence rule: `EVERY_TEST_AND_RESULT_TO_GITHUB_BEFORE_NEXT_COMMAND`

## Purpose

Fully validate all 26 Seller READ commands recovered by the READ-effect repair against the real Ozon account/environment before returning to the frozen product-demand/STD-10 investigation.

The test phase and repair phase are now intentionally separated:

1. run the entire standalone inventory;
2. run required multi-command batch coverage;
3. persist every success/failure/policy block/processing state;
4. collect the complete defect set;
5. only after the test sweep is exhausted, patch the collected defects together;
6. rebuild/certify the browser package;
7. rerun every affected test;
8. resume frozen STD-10 only after the repaired 26 gate closes.

A discovered defect does **not** stop progression to unrelated tests unless it makes further testing technically impossible. Do not patch defects during the collection phase.

## Mandatory persistent evidence protocol

No live test or result may exist only in chat.

Before the following operator command, every completed live step must be stored in GitHub as applicable:

1. raw normalized `OZON_BATCH_RESULT_V1` / `OZON_RESULT_V1` under `live-runs/` or `live-runs/repaired-26/raw/`;
2. parsed human-readable evidence with request ids, fingerprints, provider/HTTP/entitlement/execution metadata and semantic interpretation;
3. this gate ledger updated to exact current state;
4. a recovery checkpoint preserving codes/refs, defects and exact next command;
5. failures/policy blocks/processing/parser failures persisted before continuing.

Defect authority:
`OZON_AI_WORKER_REPAIRED_26_READS_DEFECT_LEDGER_2026-09-03.md`

## Two-dimensional final acceptance: standalone + batch

Every repaired alias must pass both dimensions after the later repair/rerun phase.

### A. Standalone

- Immediate JSON READ: real provider read with semantically usable JSON.
- Report workflow: create -> `report_info` -> `report_file_get` when file ready -> usable structured rows.
- Direct PDF/document: provider response -> opaque ref -> explicit document read; no signed URL/base64 leak.
- Async generated document: create -> explicit status/get -> opaque ref -> explicit document read.
- Personal-data READ: privacy-gate behavior + explicit provider read when operator setting permits it.

During defect collection, a failed later step does not erase successful earlier steps; record the exact partial state and continue to the next independent NEW-ID.

### B. Multi-command batch

Every repaired alias must participate in at least one real batch containing 2+ independent logical commands.

For each batch persist and verify:

- `result_count`;
- `logical_business_result_count`;
- `physical_business_request_count`;
- result ordering;
- independent request ids / operations / fingerprints;
- no params/result cross-contamination;
- correct exact-request / transform metadata;
- no unexpected coalescing;
- controlled partial failure does not corrupt other results.

Batch tests are part of the same collection-first phase. Batch defects are added to the same defect ledger and are not patched until the sweep is complete.

## Isolation from frozen STD-10

Do not touch the frozen forensic report code during this gate:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

NEW-06 must use a separate generic report chain.

## Gate inventory

| # | ID | Alias | Class | Standalone collection state | Batch state |
|---:|---|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | report workflow | PARTIAL_FAIL — create PASS + report_info PASS; file read POLICY_BLOCKED, DEFECT-001 | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | report workflow | NEXT | PENDING |
| 3 | NEW-03 | `report_postings_create` | report workflow | PENDING | PENDING |
| 4 | NEW-04 | `report_discounted_create` | report workflow | PENDING | PENDING |
| 5 | NEW-05 | `report_warehouse_stock` | report workflow | PENDING | PENDING |
| 6 | NEW-06 | `report_placement_by_products_create` | report workflow | PARTIAL_EXTERNAL_EVIDENCE — frozen STD-10 create exists but cannot be reused | PENDING |
| 7 | NEW-07 | `report_placement_by_supplies_create` | report workflow | PENDING | PENDING |
| 8 | NEW-08 | `report_marked_products_sales_create` | report workflow | PENDING | PENDING |
| 9 | NEW-09 | `report_realization_posting_create` | report workflow | PENDING | PENDING |
| 10 | NEW-10 | `finance_document_b2b_sales` | finance report/document | PENDING | PENDING |
| 11 | NEW-11 | `finance_mutual_settlement_report` | finance report/document | PENDING | PENDING |
| 12 | NEW-12 | `finance_compensation_report` | finance report/document | PENDING | PENDING |
| 13 | NEW-13 | `finance_decompensation_report` | finance report/document | PENDING | PENDING |
| 14 | NEW-14 | `cargoes_label_create` | async generated document | PENDING | PENDING |
| 15 | NEW-15 | `posting_fbs_act_container_labels` | direct PDF/document | PENDING | PENDING |
| 16 | NEW-16 | `posting_fbs_package_label` | direct PDF/document | PENDING | PENDING |
| 17 | NEW-17 | `posting_fbs_package_label_create` | async generated document | PENDING | PENDING |
| 18 | NEW-18 | `cargoes_transport_label_by_order_create` | async generated document | PENDING | PENDING |
| 19 | NEW-19 | `cargoes_transport_label_create` | async generated document | PENDING | PENDING |
| 20 | NEW-20 | `fbp_act_from_create` | async generated document | PENDING | PENDING |
| 21 | NEW-21 | `fbp_act_to_create` | async generated document | PENDING | PENDING |
| 22 | NEW-22 | `fbp_label_create` | async generated document | PENDING | PENDING |
| 23 | NEW-23 | `fbp_draft_direct_product_validate` | immediate validation READ | PENDING | PENDING |
| 24 | NEW-24 | `fbp_draft_dropoff_product_validate` | immediate validation READ | PENDING | PENDING |
| 25 | NEW-25 | `fbp_draft_pickup_product_validate` | immediate validation READ | PENDING | PENDING |
| 26 | NEW-26 | `chat_history_v3` | gated sensitive READ | PENDING | PENDING |

## NEW-01 evidence collected

### Run1 — create PASS

`report_products_create`

- request id `d1834261-fbc4-498a-ba2e-6873a6ead564`;
- HTTP 200;
- physical provider requests 1;
- exact request preserved;
- no transform;
- report code `REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`.

### Run2 — report_info PASS

- request id `067c8a20-6d5f-46bf-a156-b33f3f9952fd`;
- HTTP 200;
- status `success`;
- report type `seller_products`;
- signed file field redacted;
- opaque ref `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`.

### Run3 — report_file_get local policy FAIL

- request id `policy-558df595-6ff0-4eb6-b5f6-03eb658ebe6c`;
- physical provider requests `0`;
- external request executed `false`;
- HTTP `0`;
- `POLICY_BLOCKED`;
- reason `personal_data_setting_off`;
- error `OPERATION_DISABLED_BY_USER`.

Classified as `DEFECT-001`: overbroad static personal-data policy on the generic report-file helper. Do not patch yet; determine its full scope across the remaining report/document tests.

Raw Run3:
`live-runs/raw/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_RAW_2026-09-03.txt`

Parsed Run3:
`live-runs/NEW_01_RUN_3_REPORT_FILE_GET_POLICY_BLOCKED_2026-09-03.md`

## Current collection progress

- Fully final-closed: `0 / 26`.
- Standalone NEW-IDs exercised at least once: `1 / 26`.
- Open defects: `1` (`DEFECT-001`).
- Batch coverage: not started.
- Runtime patching: **forbidden until collection sweep completes**.
- STD-10 remains frozen after Run11.

## Exact next collection step

Continue with NEW-02 `report_returns_create_v2`. NEW-01 is left at its exact partial state; do not retry its file read and do not modify the runtime during collection.

Checkpoint:
`REPAIRED_26_READS_COLLECT_ALL_DEFECTS_1_OF_26_EXERCISED_DEFECT_001_OPEN_NEW_02_NEXT_STD_10_FROZEN`
