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
| 2 | STD-02 | Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня. | PASS — 574,564 RUB / 341 units; top 30.08, 29.08, 31.08; bottom 26.08, 01.09, 25.08 | FAIL_FIRST_ATTEMPT_429_THEN_RECOVERED | NO | Run1 429; exact repeat 176.815s later 200 | Exact same 14-day payload succeeded; range-too-heavy hypothesis rejected. |
| 3 | STD-03 | Дай топ-20 товаров за последние 7 дней по выручке. | PASS — top SKU 1636048691 «Печать Велеса» = 45,288 RUB / 27 units | PASS_FIRST_ATTEMPT | NO | 1 `analytics_data` SKU-ranked read, 200 | Top-20 = 220,777 RUB / 131 units ≈76.4% revenue / 76.2% units. |
| 4 | STD-04 | Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах. | PASS — revenue 49,640→27,200 RUB = −45.2%; units 31→16 = −48.4% | PASS_FIRST_ATTEMPT | NO | 1 two-day analytics read, 200 | Correct AI-side comparison and percent calculations. |
| 5 | STD-05 | Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж. | IN_PROGRESS — broad SKU decline localized; broad ad shutdown rejected; mass listing failure rejected; total-current-stock shortage not supported; organic/search branch hit 403 but key role is confirmed; freshness-window control next | MIXED — provider reads mostly healthy; Run6 local validation failure; Run9 provider 403; Run10 roles 200 | NO operator business steering; Sol inferred several mechanics | Runs1-5,7-8,10 provider 200; Run6 local guidance/0 provider; Run9 `product_queries` 403 | Run10 proves `/v1/analytics/product-queries` is present in `Admin read only`, rejecting missing-key-role cause. New candidate root cause: recent-data freshness/calculation window vs account/provider policy. Next: controlled older-date `product_queries` diagnostic. |
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

## STD-01 summary

- date `2026-09-01`;
- two exact `analytics_data` attempts returned 429;
- `roles` proved `/v1/analytics/data` access and key validity;
- same business command later returned 200;
- final `27,200 RUB / 16 units`;
- classification `PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP`.

## STD-02 summary

- period `2026-08-19..2026-09-01`;
- Run1 429 after 866.012s since previous successful analytics request;
- exact repeat 176.815s later returned 200;
- total `574,564 RUB / 341 units`;
- classification `PASS_WITH_TRANSIENT_429_ON_FIRST_ATTEMPT`.

## STD-03 summary

- period `2026-08-26..2026-09-01`;
- one SKU-ranked `analytics_data` read returned 200;
- total `288,998 RUB / 172 units`;
- top SKU `1636048691` «Печать Велеса» `45,288 RUB / 27 units`;
- classification `PASS_FIRST_ATTEMPT`.

## STD-04 summary

- `2026-08-31`: `49,640 RUB / 31 units`;
- `2026-09-01`: `27,200 RUB / 16 units`;
- revenue `−22,440 / −45.2%`;
- units `−15 / −48.4%`;
- classification `PASS_FIRST_ATTEMPT`.

## STD-05 active investigation

### Run 1 — sales decomposition

Request `530237e4-029c-4f49-b27b-b097cc890748`, `analytics_data`, dimensions `[day,sku]`, HTTP 200.

- selling SKUs `24→14`;
- gross negative SKU contribution `−36,652 RUB`;
- positive/new offsets `+14,212 RUB`;
- net `−22,440 RUB`;
- largest negatives: `1720144370` −5,100; `2184234912` −3,094; `1636048691` −2,788.

Conclusion: broad assortment decline, not one-SKU collapse.

### Runs 2-4 — warehouse-stock surface

`stock_on_warehouses_v2` pages:
- offset0 request `f6e626ef-df0a-400c-b79e-f35aec20b512`: 100 rows/200;
- offset100 request `4f710fa8-5a83-491a-9e55-3782df4b27a7`: 100 rows/200;
- offset200 request `de07b1f4-e0a0-4a71-b655-e883da7af0b7`: short terminal page/200.

Finding: Bridge exposed `pagination:null`, forcing model inference. Later Run8 proved this surface did not represent all sellable FBS+FBO stock, so earlier apparent scarcity for `Дева`/`Звезда Лады` must not be treated as total-stock evidence.

### Run 5 — advertising

Request `d4f6b587-38af-4e25-86a3-87c84d35ac80`, `performance_daily`, HTTP 200.

2026-08-31→2026-09-01:
- spend `5,337.70→5,534.91` = +3.7%;
- attributed orders `22→24` = +9.1%;
- Performance `ordersMoney 35,564→39,882` = +12.1%;
- views ≈−5.0%; clicks ≈−3.1%.

Conclusion: broad advertising shutdown rejected. `ordersMoney` is not 1:1 reconcilable with Seller `revenue`.

### Run 6 — local validation failure

`seller_product_list` with numeric SKUs was rejected locally: `INVALID_OPERATION_PARAMS`, 0 provider requests.

Root cause: `filter.skus` requires string int64 identifiers. Guidance V2 knew the operation/cluster but did not expose the exact mechanical repair.

### Run 7 — catalog list success

Request `a901f1bc-577f-4ef8-978a-a902cf06cedb`, `seller_product_list`, HTTP 200.

- all 24/24 SKUs returned;
- none archived;
- each had at least FBO or FBS stock.

Conclusion: mass archive/disappearance rejected.

Detailed evidence: `live-runs/STD_05_RUN_7_CATALOG_LIST_SUCCESS_2026-09-02.md`.

### Run 8 — detailed product info

Request `81021a84-4dab-48cf-961c-c41ae613d8d1`, `seller_product_info_list`, HTTP 200.

Across all 24 products:
- `status_name=Продается`;
- `moderate_status=approved`;
- `validation_status=success`;
- `availability=AVAILABLE`;
- `has_price=true`, `has_stock=true`;
- normal `errors=[]`.

One local product defect: SKU `2184199958` «Мара» has `status_failed=imported`, `status_description=Не обновлен`, while still sellable/available.

Cross-operation stock correction:
- `Дева` `1720144370`: `1 FBO + 42 FBS`;
- `Звезда Лады` `2184234912`: `5 FBO + 43 FBS`;
- `Печать Велеса` `1636048691`: `192 FBO + 50 FBS`.

Thus total-current-stock shortage is not supported as the broad explanation.

Detailed evidence: `live-runs/STD_05_RUN_8_PRODUCT_INFO_2026-09-02.md`.

### Run 9 — organic/search query attempt blocked by provider

Request `4b947e9e-2549-4387-b885-992dccae6d56`, `product_queries`, endpoint `POST /v1/analytics/product-queries`.

- Bridge preflight: `SUPPORTED_AND_ENTITLED`, reason `provider_may_return_subscription_dependent_scope`;
- provider: HTTP `403`, code `7`, `auth_or_permission`;
- external request executed: true;
- no business data.

Initial classification:
`PROVIDER_403_ENTITLEMENT_OR_ROLE_MISMATCH / EXACT_CAUSE_PENDING_ROLES_DIAGNOSTIC`.

This contradicts the strength of Bridge preflight wording and creates an entitlement-model gap.

Detailed evidence: `live-runs/STD_05_RUN_9_PRODUCT_QUERIES_403_2026-09-02.md`.
Entitlement hardening requirement: `OZON_AI_WORKER_ENTITLEMENT_PREFLIGHT_GAP_REQUIREMENT_2026-09-02.md`.

### Run 10 — roles diagnostic

Request `816ec939-9f7a-4110-9aa6-239fcd9f8085`, `roles`, HTTP 200.

- `/v1/analytics/product-queries` is explicitly present in `Admin read only`;
- `/v1/analytics/product-queries/details` is also present;
- key expires `2027-02-06T08:09:07.738279Z`.

Conclusion: missing API-key role is rejected as the Run9 cause.

Current strongest classification:
`PRODUCT_QUERIES_PROVIDER_403_WITH_ROLE_PRESENT / KEY_ROLE_CAUSE_REJECTED`.

A documented recent-data calculation/freshness window is now the next controlled hypothesis because Run9 requested `2026-08-31` only two days before the test date `2026-09-02`. Do not classify the whole operation as Standard-blocked until an older-date control is tried.

Detailed evidence: `live-runs/STD_05_RUN_10_ROLES_DIAGNOSTIC_2026-09-02.md`.

### Current STD-05 hypothesis state

- single-SKU collapse: `REJECTED`;
- broad advertising shutdown: `REJECTED`;
- mass listing/archive/visibility failure: `REJECTED_FOR_CURRENT_STATE`;
- broad current-stock shortage: `NOT SUPPORTED`;
- local card defect: `SUPPORTED_FOR_MARA_ONLY`;
- exact historical stock causality on 2026-09-01: `NOT PROVEN`;
- organic/search change: `UNTESTED / RUN9_BLOCKED_BY_403`;
- missing API-key role: `REJECTED_BY_RUN10`;
- recent-data freshness/calculation window: `PLAUSIBLE / CONTROL_PENDING`;
- account/subscription/provider policy: `PLAUSIBLE / NOT YET DISTINGUISHED_FROM_FRESHNESS`.

## Current checkpoint

`FORTY_TEST_GATE_LAYER_A_STD_01_TO_STD_04_COMPLETE_STD_05_RUN10_ROLE_CAUSE_REJECTED_OLDER_DATE_PRODUCT_QUERIES_CONTROL_NEXT`
