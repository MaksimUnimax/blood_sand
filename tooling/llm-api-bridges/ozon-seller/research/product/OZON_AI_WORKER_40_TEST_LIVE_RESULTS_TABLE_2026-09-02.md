# Ozon AI Worker — 40-Test Live Results Table

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Scope: Ozon Standard / no Premium.
Gate: 20 Layer-A commercial tests + 20 Layer-B capability-awareness/product-logic tests.
Rule: `NO_SKIP_ON_FAILURE`.

This is the compact authoritative live result ledger. Detailed raw/intermediate evidence may also be stored under `research/product/live-runs/`.

| # | ID | Business question | Sol business result | Operational reliability | Operator intervention | Runs / incident | Final note |
|---:|---|---|---|---|---|---|---|
| 1 | STD-01 | Дай продажи за вчера: общая выручка и количество заказанных единиц. | PASS — 27,200 RUB; 16 units for 2026-09-01 | FAIL_TRANSIENT_429_THEN_RECOVERED | YES | 3 business + 1 roles diagnostic; first two analytics calls 429; same call later 200 | Recovery-guidance gap discovered; exact 429 trigger unresolved. |
| 2 | STD-02 | Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня. | PASS — total 574,564 RUB / 341 units; top: 2026-08-30 57,776, 2026-08-29 50,745, 2026-08-31 49,640; bottom: 2026-08-26 20,400, 2026-09-01 27,200, 2026-08-25 28,900 | FAIL_FIRST_ATTEMPT_429_THEN_RECOVERED | NO | Run 1 exact 14-day query => 429; Run 2 exact same query 176.815s later => 200 | Same 14-day payload succeeded; range-too-heavy hypothesis rejected. Recurrent transient analytics quota/provider-state risk remains. |
| 3 | STD-03 | Дай топ-20 товаров за последние 7 дней по выручке. | PASS — top SKU 1636048691 / «Печать Велеса» = 45,288 RUB / 27 units; query totals 288,998 RUB / 172 units | PASS_FIRST_ATTEMPT | NO | 1 provider run; `analytics_data`, dimension `sku`, revenue DESC, 200 | Correctly changed from daily analytics to SKU ranking. Top-20 = 220,777 RUB / 131 units ≈76.4% revenue and 76.2% units. |
| 4 | STD-04 | Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах. | PASS — 2026-09-01 vs 2026-08-31: revenue 27,200 vs 49,640 RUB; units 16 vs 31; revenue −22,440 RUB / −45.2%; units −15 / −48.4% | PASS_FIRST_ATTEMPT | NO | 1 provider run; 2-day `analytics_data`, 200 | Comparison and percentages correctly calculated AI-side. |
| 5 | STD-05 | Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж. | IN_PROGRESS — broad SKU decline localized; stock explains part only; advertising-collapse hypothesis rejected; listing/visibility check active | MIXED — provider reads healthy; Run 6 local parameter-validation failure | NO | Run1 analytics 200; Runs2-4 stock pages 200/200/200; Run5 Performance 200; Run6 local guidance, 0 provider requests | New gaps: null pagination required model inference; Seller vs Performance metrics not 1:1; Guidance V2 failed to expose exact mechanical repair for numeric→string SKU identifiers. Next: repeat same `seller_product_list` with string int64 SKUs. |
| 6 | STD-06 | Что сегодня в моём кабинете требует внимания в первую очередь? | PENDING | PENDING | PENDING | 0 | — |
| 7 | STD-07 | Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь? | PENDING | PENDING | PENDING | 0 | — |
| 8 | STD-08 | Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему. | PENDING | PENDING | PENDING | 0 | — |
| 9 | STD-09 | Дай продажи за вчера по складам от большего к меньшему. | PENDING | PENDING | PENDING | 0 | — |
| 10 | STD-10 | На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать? | PENDING | PENDING | PENDING | 0 | — |
| 11 | STD-11 | У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных. | PENDING | PENDING | PENDING | 0 | — |
| 12 | STD-12 | Какие мои поставки сейчас активны и что с каждой происходит? | PENDING | PENDING | PENDING | 0 | — |
| 13 | STD-13 | Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял. | PENDING | PENDING | PENDING | 0 | — |
| 14 | STD-14 | Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна? | PENDING | PENDING | PENDING | 0 | — |
| 15 | STD-15 | Какие товары или склады сейчас имеют ограничения доставки и что именно не так? | PENDING | PENDING | PENDING | 0 | — |
| 16 | STD-16 | Дай рекламные расходы за последние 7 дней и покажи, какие кампании потратили больше всего. | PENDING | PENDING | PENDING | 0 | — |
| 17 | STD-17 | Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый? | PENDING | PENDING | PENDING | 0 | — |
| 18 | STD-18 | Какие товары я сейчас рекламирую, хотя они заканчиваются или уже отсутствуют на нужных складах? | PENDING | PENDING | PENDING | 0 | — |
| 19 | STD-19 | На какие товары я трачу рекламу, хотя карточка плохо заполнена, невидима или имеет ограничения? | PENDING | PENDING | PENDING | 0 | — |
| 20 | STD-20 | Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах. | PENDING | PENDING | PENDING | 0 | After this row start Layer B. |
| 21 | CAP-01 | Capability-awareness layer test 01 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 22 | CAP-02 | Capability-awareness layer test 02 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 23 | CAP-03 | Capability-awareness layer test 03 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 24 | CAP-04 | Capability-awareness layer test 04 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 25 | CAP-05 | Capability-awareness layer test 05 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 26 | CAP-06 | Capability-awareness layer test 06 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 27 | CAP-07 | Capability-awareness layer test 07 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 28 | CAP-08 | Capability-awareness layer test 08 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 29 | CAP-09 | Capability-awareness layer test 09 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 30 | CAP-10 | Capability-awareness layer test 10 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 31 | CAP-11 | Capability-awareness layer test 11 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 32 | CAP-12 | Capability-awareness layer test 12 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 33 | CAP-13 | Capability-awareness layer test 13 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 34 | CAP-14 | Capability-awareness layer test 14 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 35 | CAP-15 | Capability-awareness layer test 15 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 36 | CAP-16 | Capability-awareness layer test 16 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 37 | CAP-17 | Capability-awareness layer test 17 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 38 | CAP-18 | Capability-awareness layer test 18 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 39 | CAP-19 | Capability-awareness layer test 19 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |
| 40 | CAP-20 | Capability-awareness layer test 20 | PENDING | PENDING | PENDING | 0 | Defined in capability-awareness authority. |

## STD-01 completed record

Question: `Дай продажи за вчера: общая выручка и количество заказанных единиц.`

- resolved day: `2026-09-01`;
- two initial exact `analytics_data` reads returned HTTP 429;
- a `roles` diagnostic returned HTTP 200 and proved key/role access including `/v1/analytics/data`;
- exact analytics command later returned HTTP 200 after a longer quiet gap;
- final answer: `27,200 RUB`, `16` ordered units;
- exact 429 trigger remains unresolved between transient method/provider state and untracked/shared quota consumption;
- operator intervention was required because Sol initially attempted to move on instead of preserving the failed business job.

Classification: `PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP`.

## STD-02 completed record

Question: `Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня.`

Period: `2026-08-19`..`2026-09-01`.

Run 1:
- request `506f91a1-1e65-42af-a9b6-16ce9ea3d49b`;
- HTTP 429 despite previous successful analytics request being 866.012s earlier.

Run 2 exact repeat:
- request `2536d0f4-5ab6-4ed2-99f9-5f82503a189d`;
- HTTP 200 after 176.815s;
- totals `574,564 RUB`, `341` units.

Top 3 revenue days:
1. 2026-08-30 — 57,776 RUB / 34 units.
2. 2026-08-29 — 50,745 RUB / 30 units.
3. 2026-08-31 — 49,640 RUB / 31 units.

Bottom 3:
1. 2026-08-26 — 20,400 RUB / 12 units.
2. 2026-09-01 — 27,200 RUB / 16 units.
3. 2026-08-25 — 28,900 RUB / 17 units.

Classification: `PASS_WITH_TRANSIENT_429_ON_FIRST_ATTEMPT`.

## STD-03 completed record

Question: `Дай топ-20 товаров за последние 7 дней по выручке.`

- period `2026-08-26`..`2026-09-01`;
- one `analytics_data` read with dimension `[sku]`, metrics `[revenue, ordered_units]`, revenue DESC, limit 20;
- HTTP 200, one physical request;
- totals `288,998 RUB`, `172` units;
- top SKU `1636048691` «Печать Велеса» = `45,288 RUB`, `27` units;
- top 20 sum `220,777 RUB`, `131` units ≈76.4% revenue / 76.2% units.

Classification: `PASS_FIRST_ATTEMPT`.

## STD-04 completed record

Question: `Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах.`

One two-day analytics read returned:
- 2026-08-31: `49,640 RUB`, `31` units;
- 2026-09-01: `27,200 RUB`, `16` units.

AI calculations:
- revenue delta `−22,440 RUB / −45.2%`;
- units delta `−15 / −48.4%`.

Classification: `PASS_FIRST_ATTEMPT`.

## STD-05 active investigation record

Question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

### Run 1 — day × SKU sales decomposition

Request `530237e4-029c-4f49-b27b-b097cc890748`, `analytics_data`, dimensions `[day, sku]`, HTTP 200.

Findings:
- selling SKUs: `24 → 14`;
- total revenue delta: `−22,440 RUB`;
- gross negative SKU contribution: `−36,652 RUB`;
- positive/new SKU offsets: `+14,212 RUB`;
- largest negatives:
  1. SKU `1720144370` «Дева»: `−5,100 RUB`;
  2. SKU `2184234912` «Звезда Лады»: `−3,094 RUB`;
  3. SKU `1636048691` «Печать Велеса»: `−2,788 RUB`.

Interpretation: broad assortment decline, not a single-SKU collapse.

### Runs 2-4 — current warehouse-stock branch

Operation `stock_on_warehouses_v2` with explicit pages:
- Run 2 offset 0: request `f6e626ef-df0a-400c-b79e-f35aec20b512`, 100 rows, HTTP 200;
- Run 3 offset 100: request `4f710fa8-5a83-491a-9e55-3782df4b27a7`, 100 rows, HTTP 200;
- Run 4 offset 200: request `de07b1f4-e0a0-4a71-b655-e883da7af0b7`, short terminal page, HTTP 200.

Bridge exposed `pagination:null` even for full 100-row pages. Sol had to infer continuation from `rows_returned == limit`; this is recorded as `FULL_PAGE_WITH_NULL_PAGINATION_REQUIRES_MODEL_INFERENCE`.

Current-stock findings for major negative SKUs:
- `1636048691` «Печать Велеса»: about 188 free units across visible warehouses plus promised stock; broad stockout is not supported as explanation for this SKU's decline;
- `1720144370` «Дева»: only 1 free unit was present in the completed current stock report;
- `2184234912` «Звезда Лады»: 5 free units + 2 promised in the completed current stock report.

Interpretation: stock scarcity plausibly contributes to some declining SKUs, especially `Дева` / `Звезда Лады`, but cannot explain the entire broad decline. These are current stocks, not historical 2026-09-01 inventory, so causality is not proven.

### Run 5 — Performance daily advertising comparison

Request `d4f6b587-38af-4e25-86a3-87c84d35ac80`, `performance_daily`, period `2026-08-31`..`2026-09-01`, HTTP 200.

AI aggregation across returned campaign rows:
- ad spend: `5,337.70 → 5,534.91 RUB` = `+3.7%`;
- attributed orders: `22 → 24` = `+9.1%`;
- Performance `ordersMoney`: `35,564 → 39,882 RUB` = `+12.1%`;
- views: about `−5.0%`;
- clicks: about `−3.1%`.

Interpretation: a broad advertising shutdown or sharp ad-volume collapse is not supported as the primary explanation for Seller revenue falling 45.2%.

Cross-source warning discovered: Performance `ordersMoney` is not directly reconcilable 1:1 with Seller `revenue`; on 2026-09-01 Performance attribution is 39,882 RUB while Seller revenue is 27,200 RUB. AI must preserve different attribution/date/metric semantics rather than treating them as the same measure.

### Run 6 — catalog/listing check rejected locally

Intended operation: `seller_product_list` for the 24 SKUs that sold on 2026-08-31.

Observed:
- `OZON_GUIDANCE_RESULT_V2`;
- status `cluster_suggested`;
- cluster `catalog_products`;
- error `INVALID_OPERATION_PARAMS`;
- descriptor operation `seller_product_list`;
- `external_request_executed=false`;
- `physical_business_request_count=0`.

Exact root cause from accepted Bridge contract:
- `seller_product_list.filter.skus` is validated as string int64 identifiers;
- attempted values were JSON numbers;
- correct representation is e.g. `"1636048691"`, not `1636048691`.

Product guidance finding:
`GUIDANCE_KNOWS_OPERATION_BUT_DOES_NOT_EXPOSE_ACTIONABLE_PARAMETER_REPAIR`.

Guidance safely failed closed and identified the correct cluster, but did not expose the exact field/type repair or a safe same-operation retry shape. This is a weak-model portability gap.

Detailed evidence: `live-runs/STD_05_RUN_6_CATALOG_VALIDATION_GUIDANCE_2026-09-02.md`.

### Current STD-05 hypothesis state

- single-SKU collapse: `REJECTED`;
- broad advertising shutdown: `REJECTED`;
- stock scarcity as partial contributor: `SUPPORTED_FOR_SOME_SKUS / NOT_SUFFICIENT_FOR_BROAD_DECLINE`;
- listing/visibility issue: `ACTIVE / NOT YET TESTED`;
- organic-demand/search change: `PLAUSIBLE / NOT YET TESTED`;
- exact historical stock causality: `NOT PROVEN`.

Next exact step: repeat the same `seller_product_list` operation with all `filter.skus` values encoded as string int64s.

## Current checkpoint

`FORTY_TEST_GATE_LAYER_A_STD_01_TO_STD_04_COMPLETE_STD_05_RUN6_VALIDATION_GAP_ROOT_CAUSED_REPEAT_CATALOG_READ_WITH_STRING_SKUS_READY`
