# Ozon AI Worker — repaired 26 Seller READ live gate

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `ACTIVE_PRIORITY_GATE`
Rule: `NO_SKIP_ON_FAILURE`

## Purpose

Before resuming the frozen product-demand/STD-10 investigation, fully validate all 26 Seller READ commands that were recovered by the READ-effect reclassification repair.

This is a **live provider gate**, not a mock/CI gate. The existing 26/26 CI certification proves executable contracts and mocked end-to-end chains; this gate proves real Ozon behavior in the operator's account/environment.

## Global acceptance rule

A command is `PASS` only when its real provider behavior has been exercised to the strongest usable endpoint for its result class.

- Immediate JSON READ: one successful real provider request with semantically usable result.
- Report generator: create request -> explicit `report_info` -> explicit `report_file_get` when a file is available; inspect structured rows. A create acknowledgement alone is `PARTIAL`, not `PASS`.
- Direct PDF/document READ: real provider response -> opaque file ref -> explicit local `report_file_get`/document extraction path where applicable; verify no raw base64/signed URL leaks to GPT-visible result.
- Async label/document generator: create -> explicit status/get retrieval -> opaque file ref -> explicit file read where the provider supplies a document.
- Personal-data READ: verify existing Personal Data gate behavior and, after explicit operator enablement if required, real provider read.

On provider/business failure, stop immediately under `NO_SKIP_ON_FAILURE`; persist the failure and fix before advancing.

## Isolation from frozen STD-10

The frozen forensic report code must not be touched by this gate:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

Any test of `report_placement_by_products_create` inside this gate must use a separate generic test report and must not call `report_info` on the frozen STD-10 code.

## Gate inventory

| # | ID | Alias | Class | Live state | Full-close requirement |
|---:|---|---|---|---|---|
| 1 | NEW-01 | `report_products_create` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 2 | NEW-02 | `report_returns_create_v2` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 3 | NEW-03 | `report_postings_create` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 4 | NEW-04 | `report_discounted_create` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 5 | NEW-05 | `report_warehouse_stock` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 6 | NEW-06 | `report_placement_by_products_create` | report workflow | PARTIAL_EXTERNAL_EVIDENCE | Run11 create PASS exists in STD-10, but frozen forensic code is off-limits; separate generic chain required for full gate PASS |
| 7 | NEW-07 | `report_placement_by_supplies_create` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 8 | NEW-08 | `report_marked_products_sales_create` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 9 | NEW-09 | `report_realization_posting_create` | report workflow | PENDING | create -> report_info -> file -> structured rows |
| 10 | NEW-10 | `finance_document_b2b_sales` | finance report/document | PENDING | real request + returned document/report retrieval to GPT-usable result |
| 11 | NEW-11 | `finance_mutual_settlement_report` | finance report/document | PENDING | real request + returned document/report retrieval to GPT-usable result |
| 12 | NEW-12 | `finance_compensation_report` | finance report/document | PENDING | real request + returned document/report retrieval to GPT-usable result |
| 13 | NEW-13 | `finance_decompensation_report` | finance report/document | PENDING | real request + returned document/report retrieval to GPT-usable result |
| 14 | NEW-14 | `cargoes_label_create` | async generated document | PENDING | create -> `cargoes_label_get` -> opaque ref -> document read |
| 15 | NEW-15 | `posting_fbs_act_container_labels` | direct PDF/document | PENDING | direct PDF -> opaque ref -> document read |
| 16 | NEW-16 | `posting_fbs_package_label` | direct PDF/document | PENDING | direct PDF -> opaque ref -> document read |
| 17 | NEW-17 | `posting_fbs_package_label_create` | async generated document | PENDING | create -> `posting_fbs_package_label_get_v1` -> opaque ref -> document read |
| 18 | NEW-18 | `cargoes_transport_label_by_order_create` | async generated document | PENDING | create -> `cargoes_label_transport_by_order_status` -> opaque ref -> document read |
| 19 | NEW-19 | `cargoes_transport_label_create` | async generated document | PENDING | create -> `cargoes_label_transport_status` -> opaque ref -> document read |
| 20 | NEW-20 | `fbp_act_from_create` | async generated document | PENDING | create -> `fbp_act_from_get` -> opaque ref -> document read |
| 21 | NEW-21 | `fbp_act_to_create` | async generated document | PENDING | create -> `fbp_act_to_get` -> opaque ref -> document read |
| 22 | NEW-22 | `fbp_label_create` | async generated document | PENDING | create -> `fbp_label_get` -> opaque ref -> document read |
| 23 | NEW-23 | `fbp_draft_direct_product_validate` | immediate validation READ | PENDING | real provider JSON result |
| 24 | NEW-24 | `fbp_draft_dropoff_product_validate` | immediate validation READ | PENDING | real provider JSON result |
| 25 | NEW-25 | `fbp_draft_pickup_product_validate` | immediate validation READ | PENDING | real provider JSON result |
| 26 | NEW-26 | `chat_history_v3` | gated sensitive READ | PENDING | privacy gate + explicit provider read + safe result |

## Execution order

Default order is NEW-01 -> NEW-26. Do not batch unrelated commands.

For every async workflow, finish that workflow completely before advancing to the next NEW-ID. If the provider reports `processing`, persist that state and re-check only with a later explicit command; do not silently poll.

When an operation requires a real account-specific identifier (posting, cargo, supply, warehouse, etc.), use already-proven IDs when valid; otherwise perform the minimum necessary existing READ discovery as a setup substep and persist it. Setup reads do not count as one of the 26 repaired commands.

## Current progress

- Fully closed: `0 / 26`
- Partial external evidence: `NEW-06` create call succeeded live during STD-10 Run11, but its forensic code is frozen and not reusable for this gate.
- Active next command: `NEW-01 report_products_create`.

## Frozen workstreams while this gate runs

- STD-10: frozen after Run11.
- STD-12: paused.
- STD-13..STD-20: paused.
- CAP-01..CAP-23: paused.
- Multi-AI workstream: remains paused.

## Resume condition for product-demand gate

Only after all 26 rows are `PASS` (or an explicitly accepted, evidence-backed provider entitlement boundary is resolved and recorded) may the product-demand gate resume.

First command on STD-10 resume remains the previously frozen `report_info` call for its preserved report code.

Checkpoint:
`REPAIRED_26_READS_LIVE_GATE_0_OF_26_COMPLETE_NEW_01_REPORT_PRODUCTS_CREATE_NEXT_STD_10_FROZEN`
