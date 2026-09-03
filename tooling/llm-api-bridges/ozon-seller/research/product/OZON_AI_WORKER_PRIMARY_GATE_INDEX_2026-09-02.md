# Ozon AI Worker — Primary Gate Index

Updated: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: AUTHORITATIVE GATE-SIZE / LEDGER INDEX — PRODUCT GATE FROZEN

## Gate policy

The original 40-test gate is a baseline, not a hard ceiling.

Primary gate expands only for materially distinct commercial capabilities or meaningful entitlement/coverage boundaries.

`EXPAND_GATE_FOR_DISTINCT_COMMERCIAL_CAPABILITY_NOT_FOR_TEST_COUNT`

Every promoted test must preserve `NO_SKIP_ON_FAILURE`, persist meaningful runs/results, and record capability/entitlement/recovery/coverage gaps.

## Current primary gate

Current baseline size: **43 rows**.

- Rows 1–20: `STD-01` … `STD-20`.
- Rows 21–43: `CAP-01` … `CAP-23`.

Authoritative live-result master:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Detailed run evidence:
`research/product/live-runs/`

## Operator freeze after STD-10 Run11

The entire product-demand primary gate is frozen after STD-10 Run11.

Frozen point:

- `report_placement_by_products_create` live request succeeded;
- Ozon returned HTTP200;
- preserved report code:
  `REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`;
- `report_info` was **not** executed after the operator freeze.

Freeze authority:
`live-runs/STD_10_FROZEN_AFTER_RUN11_PENDING_26_NEW_READS_LIVE_GATE_2026-09-03.md`

Forensic authority:
`live-runs/STD_10_REOPENED_HISTORICAL_STOCK_DAMAGE_RECONSTRUCTION_2026-09-02.md`

## Layer-A state while frozen

| Row | ID | State |
|---:|---|---|
| 1 | STD-01 | PASS |
| 2 | STD-02 | PASS |
| 3 | STD-03 | PASS |
| 4 | STD-04 | PASS |
| 5 | STD-05 | PASS_WITH_LIMITS |
| 6 | STD-06 | PASS |
| 7 | STD-07 | PASS |
| 8 | STD-08 | PASS |
| 9 | STD-09 | PASS |
| 10 | STD-10 | REOPENED_FROZEN_AFTER_RUN11 |
| 11 | STD-11 | PASS |
| 12 | STD-12 | FROZEN |
| 13 | STD-13 | FROZEN |
| 14 | STD-14 | FROZEN |
| 15 | STD-15 | FROZEN |
| 16 | STD-16 | FROZEN |
| 17 | STD-17 | FROZEN |
| 18 | STD-18 | FROZEN |
| 19 | STD-19 | FROZEN |
| 20 | STD-20 | FROZEN |

`CAP-01` … `CAP-23`: **FROZEN/PENDING** until the repaired-26 live gate closes.

## Active priority gate

`OZON_AI_WORKER_REPAIRED_26_READS_LIVE_GATE_2026-09-03.md`

Purpose: fully live-test all 26 repaired Seller READ commands/workflows before returning to STD-10 or any other primary-gate row.

Current live progress:

- fully closed: **0 / 26**;
- `NEW-06 report_placement_by_products_create`: partial external evidence exists from STD-10 Run11, but the forensic report code is frozen and cannot be consumed by this gate;
- next gate item: `NEW-01 report_products_create`.

For reports and async generated documents, a create acknowledgement alone is not enough. The workflow must be taken to its strongest GPT-usable result through explicit reads, without hidden polling.

## Resume rule

Do not resume STD-10 until the repaired-26 live gate is fully complete.

When it is complete, the first resumed STD-10 command remains exactly one `report_info` request for the preserved Run11 code.

Do not resume STD-12, later STD rows, capability rows, or the multi-AI workstream before that point.

## Current checkpoint

`PRIMARY_GATE_43_FROZEN_AFTER_STD10_RUN11_REPAIRED_26_READS_LIVE_GATE_ACTIVE_0_OF_26_NEW01_NEXT`
