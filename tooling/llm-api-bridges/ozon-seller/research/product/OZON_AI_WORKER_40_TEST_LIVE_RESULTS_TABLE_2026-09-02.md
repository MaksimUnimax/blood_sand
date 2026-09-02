# Ozon AI Worker — 40-Test Live Results Table

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Scope: Ozon Standard / no Premium.
Gate: 20 Layer-A commercial tests + 20 Layer-B capability-awareness/product-logic tests.
Rule: `NO_SKIP_ON_FAILURE`.

This is the compact authoritative live result ledger. Detailed evidence remains in the benchmark/diagnostic documents.

| # | ID | Business question | Sol business result | Operational reliability | Operator intervention | Runs / incident | Final note |
|---:|---|---|---|---|---|---|---|
| 1 | STD-01 | Дай продажи за вчера: общая выручка и количество заказанных единиц. | PASS — 27,200 RUB; 16 units for 2026-09-01 | FAIL_TRANSIENT_429_THEN_RECOVERED | YES | 3 business + 1 roles diagnostic; first two analytics calls 429; same call later 200 | Recovery-guidance gap discovered; exact 429 trigger unresolved. |
| 2 | STD-02 | Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня. | PASS — total 574,564 RUB / 341 units; top: 2026-08-30 57,776, 2026-08-29 50,745, 2026-08-31 49,640; bottom: 2026-08-26 20,400, 2026-09-01 27,200, 2026-08-25 28,900 | FAIL_FIRST_ATTEMPT_429_THEN_RECOVERED | NO | Run 1 exact 14-day query => 429; Run 2 exact same query 176.815s later => HTTP 200 | Same 14-day payload succeeded, rejecting query-range-too-heavy as supported cause. Recurrent transient analytics quota/provider-state risk remains. |
| 3 | STD-03 | Дай топ-20 товаров за последние 7 дней по выручке. | READY | PENDING | PENDING | 0 | Next Layer-A test. |
| 4 | STD-04 | Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах. | PENDING | PENDING | PENDING | 0 | — |
| 5 | STD-05 | Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж. | PENDING | PENDING | PENDING | 0 | — |
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
| 20 | STD-20 | Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах. | PENDING | PENDING | PENDING | 0 | — |
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

## STD-02 completed incident record

Canonical query: `Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня.`

Period: `2026-08-19`..`2026-09-01` inclusive.

### Run 1 — provider 429

- request id `506f91a1-1e65-42af-a9b6-16ce9ea3d49b`;
- `analytics_data`;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- exactly one physical request;
- HTTP `429`, provider code `8`, category `rate_limit`;
- no automatic retry;
- provider dispatch `1788338573386` = `2026-09-02T08:42:53.386Z`;
- previous successful analytics dispatch `1788337707374` = `2026-09-02T08:28:27.374Z`;
- gap from previous successful analytics request `866.012s` = `14m26.012s`.

Therefore the configured Bridge local 65-second analytics spacing cannot explain Run 1.

### Run 2 — exact-command recovery

Exact same logical command, unchanged.

- request id `2536d0f4-5ab6-4ed2-99f9-5f82503a189d`;
- HTTP `200`;
- exactly one physical request;
- provider dispatch `1788338750201` = `2026-09-02T08:45:50.201Z`;
- gap from Run 1 `176.815s` = `2m56.815s`;
- returned all 14 requested day rows;
- totals `574564 RUB`, `341 ordered_units`.

The fact that the exact same 14-day payload succeeded rejects the working diagnostic hypothesis that the 14-day range itself was inherently too expensive/large.

Strongest supported incident class remains:

`RECURRENT_TRANSIENT_ANALYTICS_METHOD_QUOTA_OR_PROVIDER_STATE / EXACT_TRIGGER_UNRESOLVED`

Potential external/shared quota consumption is not ruled out. Do not claim a more precise Ozon cooldown without provider evidence.

### Ranked answer

Top 3 days by revenue:
1. `2026-08-30` — `57,776 RUB`, `34` units.
2. `2026-08-29` — `50,745 RUB`, `30` units.
3. `2026-08-31` — `49,640 RUB`, `31` units.

Bottom 3 days by revenue:
1. `2026-08-26` — `20,400 RUB`, `12` units.
2. `2026-09-01` — `27,200 RUB`, `16` units.
3. `2026-08-25` — `28,900 RUB`, `17` units.

## Current checkpoint

`FORTY_TEST_GATE_LAYER_A_STD_01_AND_STD_02_COMPLETE_STD_03_READY`
