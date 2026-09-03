# Ozon AI Worker — Primary Gate Index

Updated: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: AUTHORITATIVE GATE-SIZE / LEDGER INDEX

## Gate policy

The original 40-test gate is a baseline, not a hard ceiling.

Primary gate expands only for materially distinct commercial capabilities or meaningful entitlement/coverage boundaries.

`EXPAND_GATE_FOR_DISTINCT_COMMERCIAL_CAPABILITY_NOT_FOR_TEST_COUNT`

Do not add cosmetic date/sort/top-N variants merely to increase test count.

Every promoted test must:
- have a concrete commercial/product-logic reason;
- be persisted before execution;
- preserve `NO_SKIP_ON_FAILURE`;
- persist every meaningful run/result;
- record capability, entitlement, recovery and coverage gaps.

## Current primary gate

Current baseline size: **43 rows**.

- Rows 1–20: `STD-01` … `STD-20`.
- Rows 21–40: `CAP-01` … `CAP-20`.
- Row 41: `CAP-21` own-card SEO / semantic core.
- Row 42: `CAP-22` competitor SEO / positioning benchmark.
- Row 43: `CAP-23` category/search position & coverage boundary.

The gate remains evidence-driven and expandable if later live testing identifies another materially distinct commercial capability.

## Result ledgers

Authoritative live-result master:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Historical rows 1–40:
`OZON_AI_WORKER_40_TEST_LIVE_RESULTS_TABLE_2026-09-02.md`

Detailed run evidence:
`research/product/live-runs/`

Historical filenames containing `40_TEST` are retained for traceability only. They do not define the current gate size or current execution state.

## Current Layer-A execution state

| Row | ID | State | Current note |
|---:|---|---|---|
| 1 | STD-01 | PASS | 27,200 RUB / 16 ordered units; transient 429 recovered. |
| 2 | STD-02 | PASS | 14-day sales completed. |
| 3 | STD-03 | PASS | Top-20 by revenue completed. |
| 4 | STD-04 | PASS | Day-over-day comparison completed. |
| 5 | STD-05 | PASS_WITH_LIMITS | Strongest explanation normal demand/day-of-week variance; freshness limitation recorded. |
| 6 | STD-06 | PASS | Stale `IN_TRANSIT` supply `122149074` is first operational priority. |
| 7 | STD-07 | PASS | Main inventory action is FBO allocation, not broad procurement. |
| 8 | STD-08 | PASS | 247 FBO warehouse rows / 33 warehouses; pagination-guidance gap recorded. |
| 9 | STD-09 | PASS | FBO+FBS exact reconciliation = 16 units / 27,200 RUB. |
| 10 | STD-10 | REOPENED_IN_PROGRESS | August placement report accepted by Ozon; concrete report code returned; `report_info` is next. |
| 11 | STD-11 | PASS | Apparent FBO disappearance explained by active-order reservation. |
| 12 | STD-12 | READY_PAUSED | Prepared; execution remains paused until STD-10 closes. |
| 13 | STD-13 | PENDING | — |
| 14 | STD-14 | PENDING | — |
| 15 | STD-15 | PENDING | — |
| 16 | STD-16 | PENDING | — |
| 17 | STD-17 | PENDING | — |
| 18 | STD-18 | PENDING | — |
| 19 | STD-19 | PENDING | — |
| 20 | STD-20 | PENDING | — |

## Capability-layer state

`CAP-01` … `CAP-23`: **PENDING**.

Capability authority:
`OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`

SEO / competitive-position authority:
`OZON_AI_WORKER_SEO_COMPETITIVE_POSITION_CAPABILITY_REQUIREMENT_2026-09-02.md`

## STD-10 current authority

STD-10 is **not completed**. Any older index text that described STD-10 as completed after its original four-run pass is superseded.

Current forensic authority:
`live-runs/STD_10_REOPENED_HISTORICAL_STOCK_DAMAGE_RECONSTRUCTION_2026-09-02.md`

Certified READ-repair/browser-package evidence:
`live-runs/STD_10_READ_REPAIR_BROWSER_PACKAGE_CERTIFIED_2026-09-03.md`

Latest live evidence:
`live-runs/STD_10_REOPENED_RUN_11_PLACEMENT_BY_PRODUCTS_REPORT_CREATED_2026-09-03.md`

Current proven evidence includes:

- exact incident warehouse `САМАРА_РФЦ`, warehouse id `23128509046000`;
- seller FBO flow through that warehouse immediately before the incident;
- current sampled exposed-SKU Samara zero;
- no finance transactions classified `compensation` in the tested post-incident window;
- no formal Samara removal/utilization rows in the complete accessible removal report;
- Runs7–9: no Samara FBO postings across the tested post-incident windows;
- Run10: `report_list` returned `reports=[]`, `total=0`;
- READ re-audit found and repaired the false-negative report/document/validation classification;
- repaired runtime certified at 271 Seller READ aliases / 26 exact repaired schemas / 26-of-26 repaired workflows E2E;
- deterministic browser extension package certified on Ubuntu and Windows;
- Run11: live `report_placement_by_products_create` for `2026-08-01..2026-08-31` reached Ozon with one physical business request and HTTP200;
- Run11 report code: `REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`.

Run11 proves report acceptance only. It does not yet expose historical placement rows and therefore does not prove any burned/lost quantity.

## Exact next STD-10 evidence path

Execute exactly one explicit `report_info` read for:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

If the report is ready and an opaque `report_file_ref` is returned, the following operator step will be one explicit `report_file_get`. If the report is still processing, persist that state and do not skip ahead.

Do not infer historical stock, fire causality or burned/lost units from the create acknowledgement alone.

## Current checkpoint

`PRIMARY_GATE_43_STD_10_REOPENED_RUN11_PLACEMENT_REPORT_CREATED_REPORT_INFO_NEXT_STD_12_PAUSED`
