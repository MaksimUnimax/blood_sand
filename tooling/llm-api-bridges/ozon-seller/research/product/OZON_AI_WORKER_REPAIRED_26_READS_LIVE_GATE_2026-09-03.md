# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `PAUSED_BY_OPERATOR_AFTER_NEW_01_RUN2`
Rule: `NO_SKIP_ON_FAILURE`

## Purpose

Before resuming the frozen product-demand/STD-10 investigation, fully validate all 26 Seller READ commands recovered by the READ-effect reclassification repair against the real Ozon account/environment.

## Mandatory persistent evidence protocol

No live test or result may exist only in chat.

Before any following operator command, every completed live step must be stored in GitHub as applicable:

1. raw normalized `OZON_BATCH_RESULT_V1` / `OZON_RESULT_V1` under `live-runs/repaired-26/raw/`;
2. parsed human-readable evidence with request ids, fingerprints, provider/HTTP/entitlement/execution metadata and semantic interpretation;
3. this gate ledger updated to the exact current state;
4. a recovery checkpoint preserving live codes/refs, frozen codes, completed steps and exact resume point;
5. failures, policy blocks, processing states and parser failures are persisted before any retry/fix.

## Two-dimensional final acceptance: standalone + batch

Every repaired alias must pass both dimensions.

### A. Standalone

- Immediate JSON READ: successful real provider read with usable JSON.
- Report workflow: create -> explicit `report_info` -> explicit `report_file_get` when file ready -> usable structured rows.
- Direct PDF/document: provider response -> opaque file ref -> explicit local file/document read; no signed URL/base64 leak.
- Async generated document: create -> explicit status/get -> opaque ref -> explicit document read where available.
- Personal-data READ: verify privacy gate and then real provider read after explicit operator enablement if needed.

### B. Multi-command batch

Every repaired alias must also participate successfully in at least one real `OZON_API_V1` batch containing 2+ independent logical commands.

For each batch verify and persist:

- `result_count` equals expected delivered results;
- `logical_business_result_count` matches logical commands;
- `physical_business_request_count` matches actual provider requests after only permitted planner behavior;
- result order matches command order;
- each result has its own correct request_id, operation and fingerprint;
- params/results do not cross-contaminate commands;
- exact-request / transform metadata is correct per result;
- unrelated commands are not unexpectedly coalesced;
- controlled partial failure does not corrupt or misattribute other results.

The 26-command gate cannot close until standalone and batch coverage are both complete.

## Isolation from frozen STD-10

Do not touch the frozen forensic report code during this gate:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

NEW-06 must use a separate generic report chain.

## Gate inventory

| # | ID | Alias | Class | Standalone state | Batch state |
|---:|---|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | report workflow | IN_PROGRESS — create PASS + report_info PASS; file read remains | PENDING |
| 2 | NEW-02 | `report_returns_create_v2` | report workflow | PENDING | PENDING |
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

## NEW-01 Run1 — create

`report_products_create` live PASS:

- request id `d1834261-fbc4-498a-ba2e-6873a6ead564`;
- HTTP 200;
- physical provider requests 1;
- exact request preserved;
- no transform;
- code `REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`.

Parsed evidence:
`live-runs/NEW_01_RUN_1_REPORT_PRODUCTS_CREATE_2026-09-03.md`

Raw evidence:
`live-runs/repaired-26/raw/NEW_01_RUN_1_REPORT_PRODUCTS_CREATE_RAW_2026-09-03.json`

## NEW-01 Run2 — report_info

`report_info` live PASS:

- request id `067c8a20-6d5f-46bf-a156-b33f3f9952fd`;
- HTTP 200;
- physical provider requests 1;
- status `success`;
- report type `seller_products`;
- signed provider file field redacted as `[REDACTED]`;
- opaque bridge ref `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`;
- exact request preserved;
- no transform.

This live result proves the safe `report_info` handoff: provider URL is not exposed while an opaque file ref is available.

Parsed evidence:
`live-runs/NEW_01_RUN_2_REPORT_INFO_READY_OPAQUE_FILE_REF_2026-09-03.md`

Raw evidence:
`live-runs/repaired-26/raw/NEW_01_RUN_2_REPORT_INFO_RAW_2026-09-03.json`

## Current progress at pause

- Fully final-closed: `0 / 26`.
- NEW-01 standalone: create PASS + report_info PASS; explicit `report_file_get` remains.
- NEW-01 batch: PENDING.
- NEW-02..NEW-26: not started except NEW-06 external partial create evidence from frozen STD-10.
- STD-10 remains frozen after Run11.

## Exact standalone resume point

When the operator explicitly resumes this gate, NEW-01 continues from the already-issued opaque ref:

`rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`

The next standalone step is the explicit `report_file_get` for that ref. Do not recreate the product report and do not repeat `report_info` unless the ref has expired and that expiration is itself persisted as evidence.

Batch coverage must also be scheduled and persisted before NEW-01 can be final-closed.

Checkpoint:
`REPAIRED_26_READS_LIVE_GATE_PAUSED_NEW_01_CREATE_AND_REPORT_INFO_PASS_FILE_READ_NEXT_BATCH_REQUIRED_STD_10_FROZEN`
