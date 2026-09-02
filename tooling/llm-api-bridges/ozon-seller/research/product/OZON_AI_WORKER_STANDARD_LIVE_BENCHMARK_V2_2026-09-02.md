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
| STD-01 | Instant sales BI | Дай продажи за вчера: общая выручка и количество заказанных единиц. | PASS | 3 business + D1 | PENDING | Final exact analytics read HTTP 200: revenue 27,200; ordered units 16 for 2026-09-01. Earlier 429s recovered after 16m53.748s quiet gap; exact trigger unresolved between method/provider cooldown and untracked concurrent quota consumption. |
| STD-02 | Period BI | Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня. | READY | 0 | PENDING | Next Standard live query. Resolve period as 2026-08-19 through 2026-09-01 inclusive. |
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

Canonical business question:

`Дай продажи за вчера: общая выручка и количество заказанных единиц.`

Resolved date: `2026-09-01`.

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

- `/v1/analytics/data` has a method-specific slow quota; current Bridge models the family with 60000 ms minimum plus 5000 ms launch safety.
- 117.962 s > 65 s, therefore simple violation of the Bridge local spacing rule does not explain Run 2.
- Bridge transport would preserve `Retry-After`; delivered 429 results did not contain one.
- leading remaining hypotheses became analytics-method/provider quota state, external/untracked consumption of the same account quota, or an extended provider-side cooldown/circuit condition.

### Diagnostic D1 — `roles`

Command:

```text
OZON_API_V1
{
  "operation": "roles",
  "params": {}
}
```

Observed:
- `POST /v1/roles`;
- exactly one physical business request;
- HTTP `200`;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- no rate-limit metadata;
- current API key expiry: `2027-02-06T08:09:07.738279Z`;
- returned role inventory explicitly includes `/v1/analytics/data` under `Admin read only`.

D1 conclusions:
- `AUTH_OR_ROLE_ERROR` rejected;
- expired-key hypothesis rejected;
- general Seller API/provider path is healthy at the time of D1;
- `OZON_GLOBAL_RATE_LIMIT` is rejected for that observation point because another Seller method returned 200;
- `/v1/analytics/data` is explicitly allowed by the current key;
- the unresolved failure was localized to analytics-method/family quota/provider state or an untracked caller consuming the same quota.

### Business Run 3 / Diagnostic D2 — recovery PASS

Exact same original `analytics_data` command, unchanged:
- date `2026-09-01` through `2026-09-01`;
- dimension `[day]`;
- metrics `[revenue, ordered_units]`;
- limit `100`.

Observed:
- request id `7b670916-262e-46f3-8702-c55dfb862225`;
- exactly one physical business request;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- HTTP `200`;
- elapsed `6007 ms`;
- `last_provider_request_at`: `1788337707374` = 2026-09-02 08:28:27.374 UTC;
- Bridge `next_allowed_at`: `1788337772374` = 2026-09-02 08:29:32.374 UTC;
- no automatic retry;
- provider returned one day row for `2026-09-01`;
- metrics: revenue `27200`, ordered units `16`;
- totals: `[27200, 16]`.

Elapsed from Business Run 2 dispatch to successful D2 dispatch: `1013.748 seconds` = `16m 53.748s`.

### STD-01 business answer

For 2026-09-01:
- revenue: `27,200 RUB`;
- ordered units: `16`.

### STD-01 incident classification

Benchmark result: `PASS`.

Strongest supported root-cause statement for the earlier 429s:

`TRANSIENT_ANALYTICS_METHOD_QUOTA_OR_PROVIDER_STATE_RECOVERED / EXACT_TRIGGER_UNRESOLVED`.

What is proven:
- credentials/role/entitlement were healthy;
- Seller API was globally reachable;
- each Bridge command produced exactly one physical request and no automatic retry;
- Run 2 was already 117.962 seconds after Run 1, so simple violation of the Bridge 65-second local spacing rule does not explain both 429s;
- the exact same logical analytics read later succeeded after a 16m53.748s gap.

What is not proven:
- whether an external/untracked caller consumed the seller-account analytics quota;
- whether Ozon imposed an extended method-specific cooldown;
- whether a provider-side circuit state existed.

Do not invent a more precise cause without additional provider/account evidence. The incident is closed for benchmark progression because the commercial job is operational and the requested data was successfully obtained.

## STD-02 next

Canonical business question:

`Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня.`

Resolved Standard period on 2026-09-02: `2026-08-19` through `2026-09-01` inclusive.

First read should use one explicit `analytics_data` command with dimension `[day]` and Standard metrics `[revenue, ordered_units]`. After the result, rank days by revenue and report the three highest and three lowest days; do not issue another API call unless the returned result proves the first read insufficient.

## Result rule

A business row is not marked PASS/PARTIAL/FAIL/BLOCKED until either a useful final business answer is produced or a persistent underlying constraint is root-caused and shown to prevent the product job.

## Current checkpoint

`STANDARD_V2_STD_01_PASS_STD_02_ANALYTICS_14D_READY`
