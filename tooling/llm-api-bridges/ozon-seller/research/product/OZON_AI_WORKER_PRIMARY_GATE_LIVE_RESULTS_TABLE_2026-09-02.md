# Ozon AI Worker — Primary Gate Live Results Table

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: AUTHORITATIVE LIVE RESULT TABLE
Scope: Ozon Standard / no Premium for current baseline; entitlement/coverage boundaries are recorded explicitly.
Rule: `NO_SKIP_ON_FAILURE`
Gate policy: expandable only for materially distinct commercial capabilities.

| # | ID | Business / capability question | Result | Reliability | Operator steering | Runs | Key finding / next state |
|---:|---|---|---|---|---|---:|---|
| 1 | STD-01 | Дай продажи за вчера: общая выручка и количество заказанных единиц. | PASS — 27,200 RUB / 16 units | TRANSIENT_429_THEN_RECOVERED | YES | 4 incl. roles diagnostic | Recovery-guidance gap; same analytics command later 200. |
| 2 | STD-02 | Продажи за 14 дней по дням; 3 лучших и 3 худших дня. | PASS — 574,564 RUB / 341 units | FIRST_ATTEMPT_429_THEN_RECOVERED | NO | 2 | Same 14-day payload succeeded; range-too-heavy hypothesis rejected. |
| 3 | STD-03 | Топ-20 товаров за 7 дней по выручке. | PASS | PASS_FIRST_ATTEMPT | NO | 1 | Top SKU `1636048691` Печать Велеса = 45,288 RUB / 27 units. |
| 4 | STD-04 | Сравни вчера и позавчера: выручка, штуки, %. | PASS | PASS_FIRST_ATTEMPT | NO | 1 | Revenue −45.2%; units −48.4%. |
| 5 | STD-05 | Почему вчера продажи резко просели? | PASS_WITH_LIMITS | MIXED_ROOT_CAUSED | NO | 11 | Strongest explanation: normal demand/day-of-week variance; broad ads/listing/stock failure rejected; search target dates blocked by freshness window. Multiple Bridge hardening gaps recorded. |
| 6 | STD-06 | Что сегодня в кабинете требует внимания в первую очередь? | PASS | PASS_ALL_PROVIDER_READS | NO | 6 | #1 stale `IN_TRANSIT` supply `122149074` with 54 units; #2 critical slow-turnover inventory; #3 four fresh DATA_FILLING orders due 2026-09-05. Ratings healthy. |
| 7 | STD-07 | Какие товары скоро закончатся, какие лежат слишком долго, что пополнять? | PENDING | PENDING | PENDING | 0 | READY |
| 8 | STD-08 | Текущие остатки по складам, склады от большего к меньшему. | PENDING | PENDING | PENDING | 0 | — |
| 9 | STD-09 | Продажи за вчера по складам. | PENDING | PENDING | PENDING | 0 | — |
| 10 | STD-10 | Авария/пожар на складе Ozon: был ли там мой товар и что контролировать? | PENDING | PENDING | PENDING | 0 | — |
| 11 | STD-11 | Исчез товар с FBO без продаж: куда мог деться? | PENDING | PENDING | PENDING | 0 | — |
| 12 | STD-12 | Какие поставки сейчас активны и что с каждой происходит? | PENDING | PENDING | PENDING | 0 | — |
| 13 | STD-13 | Товар привезён, но не принят/не появился в продаже: где застрял? | PENDING | PENDING | PENDING | 0 | — |
| 14 | STD-14 | Товар и остаток есть, но покупателю не показывается/доставка недоступна. | PENDING | PENDING | PENDING | 0 | — |
| 15 | STD-15 | Какие товары/склады имеют ограничения доставки? | PENDING | PENDING | PENDING | 0 | — |
| 16 | STD-16 | Рекламные расходы 7 дней и самые затратные кампании. | PENDING | PENDING | PENDING | 0 | — |
| 17 | STD-17 | Какие кампании/товары съедают бюджет и где слабый результат? | PENDING | PENDING | PENDING | 0 | — |
| 18 | STD-18 | Какие рекламируемые товары заканчиваются/нет на нужных складах? | PENDING | PENDING | PENDING | 0 | — |
| 19 | STD-19 | На какие рекламируемые товары трачу деньги при плохой/невидимой карточке? | PENDING | PENDING | PENDING | 0 | — |
| 20 | STD-20 | Почему вырос ДРР? Реклама × продажи. | PENDING | PENDING | PENDING | 0 | After this start capability layer. |
| 21 | CAP-01 | Catalog / product inventory awareness | PENDING | PENDING | PENDING | 0 | — |
| 22 | CAP-02 | Product visibility awareness | PENDING | PENDING | PENDING | 0 | — |
| 23 | CAP-03 | Content/card quality awareness | PENDING | PENDING | PENDING | 0 | — |
| 24 | CAP-04 | Current stock by warehouse awareness | PENDING | PENDING | PENDING | 0 | — |
| 25 | CAP-05 | Stock turnover / stock analytics awareness | PENDING | PENDING | PENDING | 0 | — |
| 26 | CAP-06 | Warehouses / clusters / logistics geography | PENDING | PENDING | PENDING | 0 | — |
| 27 | CAP-07 | Supply-order list/status | PENDING | PENDING | PENDING | 0 | — |
| 28 | CAP-08 | Supply details / acceptance drill-down | PENDING | PENDING | PENDING | 0 | — |
| 29 | CAP-09 | FBO postings/orders | PENDING | PENDING | PENDING | 0 | — |
| 30 | CAP-10 | Prices / price details | PENDING | PENDING | PENDING | 0 | — |
| 31 | CAP-11 | Promotions/actions | PENDING | PENDING | PENDING | 0 | — |
| 32 | CAP-12 | Returns/cancellations | PENDING | PENDING | PENDING | 0 | — |
| 33 | CAP-13 | Finance balance/accruals | PENDING | PENDING | PENDING | 0 | — |
| 34 | CAP-14 | Finance transactions/reconciliation | PENDING | PENDING | PENDING | 0 | — |
| 35 | CAP-15 | Ratings / FBS error index | PENDING | PENDING | PENDING | 0 | — |
| 36 | CAP-16 | Reviews/questions aggregate | PENDING | PENDING | PENDING | 0 | — |
| 37 | CAP-17 | Advertising campaigns | PENDING | PENDING | PENDING | 0 | — |
| 38 | CAP-18 | Advertising statistics | PENDING | PENDING | PENDING | 0 | — |
| 39 | CAP-19 | Cross-surface orchestration | PENDING | PENDING | PENDING | 0 | — |
| 40 | CAP-20 | Bridge + external-world investigation | PENDING | PENDING | PENDING | 0 | — |
| 41 | CAP-21 | SEO / semantic core of own card | PENDING | PENDING | PENDING | 0 | Description + attributes + content rating + real product search queries. |
| 42 | CAP-22 | Competitor SEO / positioning benchmark | PENDING | PENDING | PENDING | 0 | Ozon competitor/price links where available + public-web competitor cards + query semantics. |
| 43 | CAP-23 | Category/search position & coverage boundary | PENDING | PENDING | PENDING | 0 | Standard vs Premium vs Bridge-registry boundary; `/v1/analytics/category/comparison` role-visible but currently not Bridge-registered. |

## Current checkpoint

`PRIMARY_GATE_43_BASELINE_EXPANDABLE_STD_01_TO_STD_06_COMPLETE_STD_07_READY`

## Detailed evidence

Detailed live-run evidence is stored under `research/product/live-runs/`. The historical `OZON_AI_WORKER_40_TEST_LIVE_RESULTS_TABLE_2026-09-02.md` is retained for traceability but this file is the authoritative table for all future gate updates.
