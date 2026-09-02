# Ozon AI Worker — Primary Gate Index

Date: 2026-09-02
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

- Rows 1-20: `STD-01` … `STD-20`.
- Rows 21-40: `CAP-01` … `CAP-20`.
- Row 41: `CAP-21` own-card SEO / semantic core.
- Row 42: `CAP-22` competitor SEO / positioning benchmark.
- Row 43: `CAP-23` category/search position & coverage boundary.

The gate remains evidence-driven and expandable if later live testing identifies another materially distinct commercial capability.

## Result ledgers

Historical/current rows 1-40 remain in:
`OZON_AI_WORKER_40_TEST_LIVE_RESULTS_TABLE_2026-09-02.md`

Rows 41+ are recorded in:
`OZON_AI_WORKER_PRIMARY_GATE_EXTENSION_RESULTS_2026-09-02.md`

Detailed run evidence remains under:
`research/product/live-runs/`

The legacy filename containing `40_TEST` is retained to preserve history and references; it no longer defines a hard gate-size limit.

## New capability authority

`OZON_AI_WORKER_SEO_COMPETITIVE_POSITION_CAPABILITY_REQUIREMENT_2026-09-02.md`

Current capability-layer authority:
`OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`

Despite the historical filename, that document now defines an expandable capability layer with CAP-21…CAP-23 promoted.

## Current Layer-A execution checkpoint

- STD-01…STD-05 complete.
- STD-06 active.
- STD-06 Run 1 (`seller_rating_summary`) returned HTTP 200. No critical rating/penalty issue: penalty score not exceeded, FBS complaints 0, product rating 4.98, price index healthy. Localization is 37% but no critical threshold is proven by that response.
- STD-06 Run 2 (`stock_turnover_analytics`) returned HTTP 200 with 72 rows. Turnover grades: 20 critical, 2 red, 34 yellow, 15 green, 1 no-sales. Material slow-turnover/overstock cluster found; highest critical turnover values include Козерог (Античность) 794, Знич 722, Хорс 596, Козерог (Символы) 467, Рыбы 442.67.
- Run 2 also returned eight `current_stock=0` signals. These are not treated as total stockouts because prior cross-operation evidence proves stock surfaces differ; `Чур` and `Стрелец` are high-priority FBO/distribution checks because they were recent top sellers.
- Detailed Run 2 evidence: `live-runs/STD_06_RUN_2_STOCK_TURNOVER_2026-09-02.md`.
- Next STD-06 triage read: `supply_order_status_counter` to identify overdue/rejected/in-transit/acceptance supply states before final prioritization.

## Current checkpoint

`PRIMARY_GATE_43_BASELINE_EXPANDABLE_STD_06_RUN2_TURNOVER_RISKS_FOUND_SUPPLY_STATUS_COUNTER_NEXT`
