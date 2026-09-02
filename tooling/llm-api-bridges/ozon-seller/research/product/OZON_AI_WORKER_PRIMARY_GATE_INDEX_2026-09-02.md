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

Authoritative current master table:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Historical rows 1-40 are retained in:
`OZON_AI_WORKER_40_TEST_LIVE_RESULTS_TABLE_2026-09-02.md`

The earlier extension-only ledger is retained for traceability:
`OZON_AI_WORKER_PRIMARY_GATE_EXTENSION_RESULTS_2026-09-02.md`

Detailed run evidence remains under:
`research/product/live-runs/`

The legacy filename containing `40_TEST` is retained to preserve history and references; it no longer defines a hard gate-size limit. All future gate result updates should be written to the primary master table.

## New capability authority

`OZON_AI_WORKER_SEO_COMPETITIVE_POSITION_CAPABILITY_REQUIREMENT_2026-09-02.md`

Current capability-layer authority:
`OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`

Despite the historical filename, that document now defines an expandable capability layer with CAP-21…CAP-23 promoted.

## Current Layer-A execution checkpoint

- STD-01…STD-09 complete.
- STD-10 ready.

### STD-06 completed

Question: `Что сегодня в моём кабинете требует внимания в первую очередь?`

Runs 1–6 all reached the provider and returned HTTP 200.

1. `seller_rating_summary`: no critical rating/penalty issue. Penalty score not exceeded; FBS complaints 0; product rating 4.98; price index healthy. Localization 37% was observed but no critical threshold was proven by that response.
2. `stock_turnover_analytics`: 72 rows; turnover grades = 20 critical, 2 red, 34 yellow, 15 green, 1 no-sales. Highest critical turnover examples: Козерог (Античность) 794, Знич 722, Хорс 596, Козерог (Символы) 467, Рыбы 442.67. Eight `current_stock=0` signals were treated as FBO/distribution signals rather than total stockouts because prior cross-operation evidence proved stock-surface semantics differ.
3. `supply_order_status_counter`: no rejected/report-rejected/acceptance emergency; four `DATA_FILLING`, one `IN_TRANSIT`.
4. `supply_order_list`: exactly five active order IDs returned.
5. `supply_order_get`: order `122149074` / `2000062599609` is materially stale. Created 2026-08-10, slot 2026-08-11, last state update 2026-08-12, still `IN_TRANSIT` on 2026-09-02. The four `DATA_FILLING` orders are fresh (created 2026-08-30) with deadline 2026-09-05T06:00:00Z and slot 2026-09-05T07:00:00Z..08:00:00Z.
6. `supply_order_bundle`: stale bundle `019feae9-0fbe-75af-8f63-b9df1ca38840` contains 54 units across 9 SKUs, `has_next=false`: Герб России 2, Чур 5, Печать Велеса 31, Перун 2, Звезда Лады 2, Громовик 2, Алатырь 5, Спаси и Сохрани 2, Шлем ужаса 3.

Final business priority:
1. **Investigate/escalate stale `IN_TRANSIT` supply `122149074` first.** It has remained in transit for roughly three weeks and contains 54 units. `Чур` is particularly relevant because it is a recent top seller and has an FBO/distribution risk signal.
2. **Address critical slow-turnover/no-sales inventory.** Do not blindly replenish the highest critical-turnover SKUs before checking price/content/ads/demand.
3. **Complete the four fresh `DATA_FILLING` orders before the 2026-09-05 deadline.** They are upcoming work, not current failures.
4. Ratings/penalties are not a current urgent issue.

STD-06 classification: `PASS`
Operational reliability: `PASS_ALL_STD06_PROVIDER_READS`
Operator business steering: `NO`

### STD-07 completed

Question: `Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?`

Runs 1–3 all reached the provider and returned HTTP 200.

1. `stock_turnover_analytics`: identified both low-FBO/low-IDC candidates and a large `CRITICAL/RED/NOSALES` do-not-replenish group.
2. `seller_product_info_list`: proved the selected low-FBO candidates still have substantial FBS stock, generally ~39–50 units; broad total-stock procurement emergency rejected. The business problem is primarily FBO allocation/distribution.
3. `supply_order_bundle`: correlated the four fresh 2026-09-05 supply bundles. Most top FBO-risk candidates are already planned: Чур22, Алатырь21, Громовик11, Сварог7, Герб России6, Перун6, Шлем ужаса5, Молвинец2, Родимич1 and others.

Highest uncovered next-FBO candidates after existing inbound is considered:
- `1720141903` Водолей — free FBO 1, ~0.20/day ≈5 FBO days, FBS43;
- `1720148880` Овен — FBO1, ~0.10/day ≈10 days, FBS41;
- `1720124782` Стрелец — FBO0, ~0.10/day, FBS43;
- `2186857668` Лев (Античность) — FBO0, ~0.12/day, FBS50;
- `2271210394` Близнецы (Символы) — FBO0, ~0.15/day, FBS41.

Do not replenish blindly:
- Козерог (Античность) turnover794 / IDC400 CRITICAL;
- Знич722 /450 CRITICAL;
- Хорс596 /350 CRITICAL;
- Козерог (Символы)467 /200 CRITICAL;
- Рыбы442.67 /220 CRITICAL;
- Весы (Античность) NOSALES with stock;
- other RED/CRITICAL items should be demand-reviewed before any new supply.

Final business answer:
- no broad procurement emergency;
- primary task is FBO allocation, not new purchasing;
- complete existing fresh supplies and avoid duplicate replenishment;
- next FBO candidates are Водолей, Овен, Стрелец, Лев (Античность), Близнецы (Символы);
- keep the stale old IN_TRANSIT supply excluded from safe available stock until resolved.

STD-07 classification: `PASS`
Operational reliability: `PASS_ALL_STD07_PROVIDER_READS`
Operator business steering: `NO`

Detailed STD-07 evidence:
- `live-runs/STD_07_RUN_1_STOCK_TURNOVER_2026-09-02.md`
- `live-runs/STD_07_RUN_2_TOTAL_FBO_FBS_STOCK_CONFIRMATION_2026-09-02.md`
- `live-runs/STD_07_RUN_3_FRESH_SUPPLY_BUNDLES_2026-09-02.md`

### STD-08 completed

Question: `Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.`

Runs 1–3 all reached the provider and returned HTTP 200.

Pagination evidence:
- offset0: 100 rows, `pagination=null`;
- offset100: 100 rows, `pagination=null`;
- offset200: 47 rows, `pagination=null`, terminal by short-page inference.

Total: **247 rows across 33 Ozon warehouses**.

This reproduces the Bridge pagination-guidance gap: the model had to infer continuation from row count because Bridge provided no explicit continuation object.

Semantic boundary: this is Ozon warehouse/FBO analytics from `/v2/analytics/stock_on_warehouses`, not total seller FBO+FBS inventory.

Aggregated totals:
- free-to-sell: **628**;
- reserved: **14**;
- promised: **54**.

Top warehouses by current free-to-sell:
1. `Санкт_Петербург_РФЦ` — 101;
2. `ХАБАРОВСК_2_РФЦ` — 71 free +1 reserved +54 promised;
3. `ПУШКИНО_1_РФЦ` — 57;
4. `Екатеринбург_РФЦ_НОВЫЙ` — 48 free +1 reserved;
5. `РОСТОВ_НА_ДОНУ_2_РФЦ` — 45 free +4 reserved;
6. `НИЖНИЙ_НОВГОРОД_2_РФЦ` — 36;
7. `СПБ_ШУШАРЫ_РФЦ` — 28;
8. `ВАТУТИНКИ_РФЦ` — 27 free +2 reserved;
9. `НЕВИННОМЫССК_РФЦ` — 25;
10. `ВОРОНЕЖ_2_РФЦ` — 20.

`ХАБАРОВСК_2_РФЦ` is notable for 54 promised units; promised units are shown separately and are not counted as current free-to-sell.

STD-08 classification: `PASS`
Operational reliability: `PASS_PROVIDER_READS_WITH_REPRODUCED_PAGINATION_GUIDANCE_GAP`
Operator business steering: `NO`

Detailed STD-08 evidence:
- `live-runs/STD_08_RUN_1_STOCK_WAREHOUSE_PAGE_1_2026-09-02.md`
- `live-runs/STD_08_RUN_2_STOCK_WAREHOUSE_PAGE_2_2026-09-02.md`
- `live-runs/STD_08_RUN_3_TERMINAL_PAGE_AND_FINAL_WAREHOUSE_AGGREGATION_2026-09-02.md`

### STD-09 completed

Question: `Дай продажи за вчера по складам от большего к меньшему.`

Run 1 used `posting_fbo_list` with `analytics_data=true` for 2026-09-01. It returned 12 FBO postings, one unit each at 1,700 RUB, with real `analytics_data.warehouse_name` attribution. Initial interpretation excluded the one currently cancelled FBO posting, producing 11 / 18,700, but this did not reconcile to the accepted STD-01 ordered metrics.

Run 2 attempted `fbs_posting_list` with only aggregate analytics requested. Bridge blocked locally before Ozon because `personal_data_setting_off`:
- provider requests: 0;
- `POLICY_BLOCKED`;
- operator action required: enable `Показывать личные данные` and submit a new explicit command.

This is expected current privacy policy behavior, not a provider/API failure. A product hardening requirement was recorded because aggregate FBS business analytics should not require exposing unnecessary customer PII to the AI.

Run 3 repeated the exact FBS read after explicit operator privacy enablement and returned HTTP 200:
- 4 FBS postings;
- all 4 attributed to seller warehouse `Златоуст Чёт`;
- each 1 unit × 1,700 RUB;
- FBS total = **4 units / 6,800 RUB**.

Exact cross-source reconciliation:
- FBO created-order cohort = **12 / 20,400**;
- FBS created-order cohort = **4 / 6,800**;
- combined = **16 / 27,200**;
- exact match to STD-01 `ordered_units=16`, `revenue=27,200`.

The exact reconciliation includes two postings that are currently cancelled (one FBO, one FBS). Therefore the benchmark metric semantics are:

`ANALYTICS_REVENUE_ORDERED_UNITS_ARE_ORDER_CREATION_METRICS_NOT_CURRENT_NONCANCELLED_POSTING_TOTALS`

Final warehouse ranking under the same STD-01 ordered metric semantics:
1. `Златоуст Чёт` — **4 units / 6,800 RUB** (FBS);
2. `СПБ_ШУШАРЫ_РФЦ` — **2 / 3,400** (FBO);
3. ten FBO warehouses — **1 / 1,700** each: `НОВОСИБИРСК_3_РФЦ`, `КРАСНОЯРСК_СТАРЦЕВО_РФЦ`, `РОСТОВ-НА-ДОНУ_РФЦ`, `САНКТ-ПЕТЕРБУРГ_РФЦ`, `НЕВИННОМЫССК_РФЦ`, `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ`, `ВАТУТИНКИ_РФЦ`, `ПУШКИНО_1_РФЦ`, `НИЖНИЙ_НОВГОРОД_2_РФЦ`, `ХОРУГВИНО_РФЦ`.

STD-09 classification: `PASS`
Operational reliability: `PASS_WITH_EXPECTED_LOCAL_PRIVACY_GATE_AND_EXPLICIT_OPERATOR_RETRY`
Operator intervention: `YES_PRIVACY_SETTING_TOGGLE`
Provider incidents: none.

Detailed STD-09 evidence and requirements:
- `live-runs/STD_09_RUN_1_FBO_WAREHOUSE_ATTRIBUTION_2026-09-02.md`
- `live-runs/STD_09_RUN_2_FBS_PRIVACY_POLICY_BLOCK_2026-09-02.md`
- `live-runs/STD_09_RUN_3_FBS_WAREHOUSE_RECONCILIATION_2026-09-02.md`
- `OZON_AI_WORKER_AGGREGATE_FBS_ANALYTICS_PRIVACY_REQUIREMENT_2026-09-02.md`
- `OZON_AI_WORKER_ORDERED_REVENUE_POSTING_STATUS_SEMANTICS_REQUIREMENT_2026-09-02.md`

## Current checkpoint

`PRIMARY_GATE_43_BASELINE_EXPANDABLE_STD_01_TO_STD_09_COMPLETE_STD_10_READY`
