# Ozon AI Worker — Primary Gate Live Results Table

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: AUTHORITATIVE LIVE RESULT TABLE — PRODUCT GATE FROZEN
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
| 7 | STD-07 | Какие товары скоро закончатся, какие лежат слишком долго, что пополнять? | PASS | PASS_ALL_STD07_PROVIDER_READS | NO | 3 | Total-stock procurement emergency rejected: selected low-FBO candidates retain ~39–55 FBO+FBS units. Main action is FBO allocation. Fresh 2026-09-05 supplies already cover most top candidates. Highest uncovered next-FBO candidates: Водолей, Овен, Стрелец, Лев (Античность), Близнецы (Символы). |
| 8 | STD-08 | Текущие остатки по складам, склады от большего к меньшему. | PASS | PASS_PROVIDER_READS_WITH_REPRODUCED_PAGINATION_GUIDANCE_GAP | NO | 3 | 247 rows / 33 Ozon warehouses. Free-to-sell 628, reserved14, promised54. Pagination guidance gap reproduced. |
| 9 | STD-09 | Продажи за вчера по складам. | PASS — exact FBO+FBS warehouse reconstruction = 16 units / 27,200 RUB | PASS_WITH_EXPECTED_LOCAL_PRIVACY_GATE_AND_EXPLICIT_OPERATOR_RETRY | YES_PRIVACY_SETTING_TOGGLE | 3 | FBO12/20,400 + FBS4/6,800 = exact STD-01 total. Ordered metrics include postings that are currently cancelled. |
| 10 | STD-10 | Авария/пожар на складе Ozon: был ли там мой товар и что контролировать? | REOPENED_FROZEN_AFTER_RUN11 | PASS_FIRST_12_LIVE_PROVIDER_READS_PLUS_271_READ_26_OF_26_E2E_BROWSER_REPAIR_CERTIFIED | YES_OPERATOR_FREEZE_BEFORE_REPORT_INFO | 12 live + repair certification | Run11 successfully created the August placement report and returned code `REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`. **Operator froze STD-10 before `report_info`.** The code is preserved and must not be touched until the separate `OZON_AI_WORKER_REPAIRED_26_READS_LIVE_GATE_2026-09-03.md` is fully closed. On later resume, first command remains one explicit `report_info` for the preserved code. |
| 11 | STD-11 | Исчез товар с FBO без продаж: куда мог деться? | PASS — free-FBO disappearance explained by exact active-order reservation | PASS_FIRST_PROVIDER_READ | NO | 1 | SKU `1720141903`: free FBO 1→0 while present stayed1 and reserved0→1; exact active posting explains reservation rather than physical loss. |
| 12 | STD-12 | Какие поставки сейчас активны и что с каждой происходит? | FROZEN | PENDING | OPERATOR_FREEZE | 0 | Do not execute while repaired-26 live gate is active. |
| 13 | STD-13 | Товар привезён, но не принят/не появился в продаже: где застрял? | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 14 | STD-14 | Товар и остаток есть, но покупателю не показывается/доставка недоступна. | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 15 | STD-15 | Какие товары/склады имеют ограничения доставки? | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 16 | STD-16 | Рекламные расходы 7 дней и самые затратные кампании. | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 17 | STD-17 | Какие кампании/товары съедают бюджет и где слабый результат? | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 18 | STD-18 | Какие рекламируемые товары заканчиваются/нет на нужных складах? | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 19 | STD-19 | На какие рекламируемые товары трачу деньги при плохой/невидимой карточке? | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 20 | STD-20 | Почему вырос ДРР? Реклама × продажи. | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 21 | CAP-01 | Catalog / product inventory awareness | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 22 | CAP-02 | Product visibility awareness | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 23 | CAP-03 | Content/card quality awareness | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 24 | CAP-04 | Current stock by warehouse awareness | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 25 | CAP-05 | Stock turnover / stock analytics awareness | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 26 | CAP-06 | Warehouses / clusters / logistics geography | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 27 | CAP-07 | Supply-order list/status | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 28 | CAP-08 | Supply details / acceptance drill-down | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 29 | CAP-09 | FBO postings/orders | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 30 | CAP-10 | Prices / price details | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 31 | CAP-11 | Promotions/actions | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 32 | CAP-12 | Returns/cancellations | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 33 | CAP-13 | Finance balance/accruals | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 34 | CAP-14 | Finance transactions/reconciliation | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 35 | CAP-15 | Ratings / FBS error index | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 36 | CAP-16 | Reviews/questions aggregate | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 37 | CAP-17 | Advertising campaigns | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 38 | CAP-18 | Advertising statistics | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 39 | CAP-19 | Cross-surface orchestration | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 40 | CAP-20 | Bridge + external-world investigation | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 41 | CAP-21 | SEO / semantic core of own card | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 42 | CAP-22 | Competitor SEO / positioning benchmark | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |
| 43 | CAP-23 | Category/search position & coverage boundary | FROZEN | PENDING | OPERATOR_FREEZE | 0 | — |

## Active priority gate

`OZON_AI_WORKER_REPAIRED_26_READS_LIVE_GATE_2026-09-03.md`

Current repaired-READ live progress: **0 / 26 fully closed**.

`NEW-06 report_placement_by_products_create` has partial external evidence from STD-10 Run11, but that forensic report code is frozen and cannot be consumed by the new-command gate. A separate generic end-to-end test is required before NEW-06 can be marked PASS.

## Current checkpoint

`PRIMARY_GATE_43_FROZEN_AFTER_STD10_RUN11_REPAIRED_26_READS_LIVE_GATE_ACTIVE_0_OF_26_NEW01_NEXT`

## Detailed evidence

Detailed live-run evidence is stored under `research/product/live-runs/`. Product-demand testing resumes only after the repaired-26 live gate is fully closed.
