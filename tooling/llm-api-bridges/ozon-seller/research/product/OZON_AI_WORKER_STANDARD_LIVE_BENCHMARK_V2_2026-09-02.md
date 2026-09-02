# Ozon AI Worker — Standard-only Live Benchmark V2

Date: 2026-09-02
Status: ACTIVE — GPT-5.6 SOL LIVE TEST / NO-SKIP FAILURE DIAGNOSTICS
Supersedes: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V1_2026-09-02.md`
Failure diagnostics: `OZON_AI_WORKER_LIVE_FAILURE_DIAGNOSTICS_2026-09-02.md`
Scope: authenticated Ozon seller without Premium.

## Mandatory test rule

`NO_SKIP_ON_FAILURE`

A blocked/failed run is investigated before moving to another commercial query. Do not park a row merely to continue the benchmark. The failure itself is product evidence and must be root-caused to the strongest evidence-backed class available.

One user business question may require multiple explicit Bridge runs. Exactly one `OZON_API_V1` command is sent at a time; after every result GPT-5.6 Sol decides the next read/diagnostic or gives the final business answer.

Premium endpoints/metrics are excluded from this pass.

## Frozen Standard core — 28 queries

| ID | Family | Canonical query | Sol status | Runs | Alice | Current note |
|---|---|---|---|---:|---|---|
| STD-01 | Instant sales BI | Дай продажи за вчера: общая выручка и количество заказанных единиц. | IN_PROGRESS / ROOT_CAUSE_DIAGNOSTICS | 2 business + D1 pending | PENDING | Two `/v1/analytics/data` calls ~117.962 s apart both returned 429; do not skip. |
| STD-02 | Period BI | Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня. | PENDING | 0 | PENDING | — |
| STD-03 | Product BI | Дай топ-20 товаров за последние 7 дней по выручке. | PENDING | 0 | PENDING | — |
| STD-04 | Period comparison | Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах. | PENDING | 0 | PENDING | — |
| STD-05 | Sales diagnosis | Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж. | PENDING | 0 | PENDING | — |
| STD-06 | Cabinet health | Что сегодня в моём кабинете требует внимания в первую очередь? | PENDING | 0 | PENDING | — |
| STD-07 | Stock planning | Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь? | PENDING | 0 | PENDING | — |
| STD-08 | Stock BI | Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему. | PENDING | 0 | PENDING | Earlier pivot cancelled; not started. |
| STD-09 | Sales × warehouse | Дай продажи за вчера по складам от большего к меньшему. | PENDING | 0 | PENDING | — |
| STD-10 | External incident | На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать? | PENDING | 0 | PENDING | — |
| STD-11 | Stock forensics | У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных. | PENDING | 0 | PENDING | — |
| STD-12 | Supply status | Какие мои поставки сейчас активны и что с каждой происходит? | PENDING | 0 | PENDING | — |
| STD-13 | Supply diagnosis | Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял. | PENDING | 0 | PENDING | — |
| STD-14 | Availability | Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна? | PENDING | 0 | PENDING | — |
| STD-15 | Logistics | Какие товары или склады сейчас имеют ограничения доставки и что именно не так? | PENDING | 0 | PENDING | — |
| STD-16 | Advertising BI | Дай рекламные расходы за последние 7 дней и покажи, какие кампании потратили больше всего. | PENDING | 0 | PENDING | — |
| STD-17 | Advertising waste | Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый? | PENDING | 0 | PENDING | — |
| STD-18 | Ads × stock | Какие товары я сейчас рекламирую, хотя они заканчиваются или уже отсутствуют на нужных складах? | PENDING | 0 | PENDING | — |
| STD-19 | Ads × listing | На какие товары я трачу рекламу, хотя карточка плохо заполнена, невидима или имеет ограничения? | PENDING | 0 | PENDING | — |
| STD-20 | DRR diagnosis | Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах. | PENDING | 0 | PENDING | — |
| STD-21 | Finance reconciliation | Почему мне выплатили заметно меньше, чем я вижу в продажах? Разложи, куда ушли деньги. | PENDING | 0 | PENDING | — |
| STD-22 | Finance BI | Разложи финансовые начисления и удержания за последние 7 дней по типам: сумма каждого и доля в общей сумме. | PENDING | 0 | PENDING | — |
| STD-23 | Unit economics | Какие мои товары реально продаются в минус после комиссии, логистики, рекламы и возвратов? | PENDING | 0 | PENDING | — |
| STD-24 | Promotions | Какие товары сейчас участвуют в акциях и стало ли мне от этих акций выгоднее? | PENDING | 0 | PENDING | — |
| STD-25 | Returns/cancellations | По каким товарам у меня ненормально много возвратов или отмен и что могло измениться? | PENDING | 0 | PENDING | — |
| STD-26 | Rating/FBS errors | Что сейчас ухудшает мой рейтинг или индекс ошибок FBS и какие отправления на это повлияли? | PENDING | 0 | PENDING | — |
| STD-27 | Listing quality | Какие карточки у меня сейчас самые проблемные: плохо заполнены, невидимы или требуют исправления? | PENDING | 0 | PENDING | — |
| STD-28 | Manager report | Подготовь недельный отчёт по кабинету: продажи, реклама, остатки, поставки, возвраты и деньги; выдели 5 главных выводов и 5 задач на следующую неделю. | PENDING | 0 | PENDING | — |

## STD-01 live record

### Business Run 1

Command: `analytics_data`, 2026-09-01, dimensions `[day]`, metrics `[revenue, ordered_units]`.

Observed:
- entitlement `SUPPORTED_AND_ENTITLED`, reason `all_accounts`;
- exactly one physical business request;
- HTTP 429, provider code 8, category `rate_limit`;
- `seller.analytics_data.v1` local min interval 60000 ms;
- no automatic retry;
- no sales data.

### Business Run 2

Exact same logical command.

Observed:
- exactly one physical business request;
- HTTP 429 again;
- no automatic retry;
- no sales data;
- dispatch interval from Run 1: `117.962 seconds`.

### Root-cause analysis after Run 2

- `/v1/analytics/data` has a method-specific limit of one request per minute per seller account.
- accepted Bridge source uses 60000 ms plus 5000 ms launch safety for this quota family.
- 117.962 s > 65 s, therefore simple violation of the Bridge local spacing rule does not explain Run 2.
- Bridge transport would preserve `Retry-After`; delivered results did not contain it.
- remaining leading hypotheses: another/untracked caller consuming the same seller-account method quota, or an extended Ozon provider-side cooldown/circuit state after prior traffic.
- global/auth/provider health has not yet been isolated.

### Diagnostic D1 — pending

Call `roles` once. Purpose: if it returns 200, reject global Seller API/auth outage and localize failure to analytics-specific provider state. If it also 429s, investigate provider-wide/account-wide throttling before any further business query.

## Result rule

A business row is not marked PASS/PARTIAL/FAIL/BLOCKED until either a useful final business answer is produced or a persistent underlying constraint is root-caused and shown to prevent the product job.

## Current checkpoint

`STANDARD_V2_NO_SKIP_STD_01_D1_ROLES_READY`
