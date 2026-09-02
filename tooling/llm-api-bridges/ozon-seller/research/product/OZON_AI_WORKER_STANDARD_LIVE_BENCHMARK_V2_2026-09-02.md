# Ozon AI Worker — Standard-only Live Benchmark V2

Date: 2026-09-02
Status: ACTIVE — GPT-5.6 SOL LIVE TEST / NO-SKIP FAILURE DIAGNOSTICS
Supersedes: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V1_2026-09-02.md`
Failure diagnostics: `OZON_AI_WORKER_LIVE_FAILURE_DIAGNOSTICS_2026-09-02.md`
Weak-model recovery requirement: `OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`
Capability-awareness Layer B: `OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`
Scope: authenticated Ozon seller without Premium.

## Mandatory test rule

`NO_SKIP_ON_FAILURE`

A blocked/failed run is investigated before moving to another commercial query. Do not park a row merely to continue the benchmark. The failure itself is product evidence and must be root-caused to the strongest evidence-backed class available.

One user business question may require multiple explicit Bridge runs. Exactly one `OZON_API_V1` command is sent at a time; after every result GPT-5.6 Sol decides the next read/diagnostic or gives the final business answer.

Premium endpoints/metrics are excluded from this pass.

## 40-test commercial product gate

The primary Standard live gate is now exactly **40 tests in two layers**.

### Layer A — 20 current commercial questions

Execute `STD-01` through `STD-20` exactly as the current live benchmark. These test whether the worker can solve sellable business questions with the current Bridge contract.

### Layer B — 20 capability-awareness / product-logic tests

Start only after `STD-20` is complete. Execute `CAP-01` through `CAP-20` from `OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`.

Layer B exists because varying a date range, top-N count or interpretation of the same `analytics_data` response does not prove that an AI understands what data the Bridge can obtain. Layer B must exercise materially different data surfaces and cross-surface orchestration paths: catalog, visibility, content diagnostics, stock, turnover, warehouse/logistics references, supplies, postings, prices, promotions, returns/cancellations, finance, ratings/FBS errors, reviews/questions, Performance campaigns/statistics, multi-surface joins and Bridge + external-world investigation.

The goal is to determine whether a weak AI can recognize that the necessary Ozon information is obtainable through Bridge, select the right data family, use discovery/help instead of guessing unsupported operations, issue additional explicit reads when needed, and complete the business job without the operator teaching it the API.

### Reserve rows

`STD-21` through `STD-28` remain preserved as extended commercial cases. They are **not deleted**, but they are outside the primary 40-test gate unless later promoted. This keeps prior research intact while making the main gate exactly 20 + 20 as instructed.

## Mandatory reliability scoring rule

A row may be answerable and still expose a product reliability/model-portability gap. Record separately:

- final business-answer correctness;
- first-attempt operational success;
- provider/API incidents;
- whether the model chose the correct recovery without operator intervention;
- whether the Bridge contract made the recovery action deterministic.

Do not collapse these into a clean PASS.

## Layer A — active Standard commercial questions (STD-01..STD-20)

| ID | Family | Canonical query | Sol status | Runs | Alice | Current note |
|---|---|---|---|---:|---|---|
| STD-01 | Instant sales BI | Дай продажи за вчера: общая выручка и количество заказанных единиц. | PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP | 3 business + D1 | PENDING | Final exact analytics read HTTP 200: revenue 27,200; ordered units 16 for 2026-09-01. First two exact reads returned 429. Sol initially attempted to move to another query; operator enforced NO_SKIP and same-job diagnosis/retry. This is a Bridge/model-portability hardening requirement before Alice. |
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
| STD-20 | DRR diagnosis | Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах. | PENDING | 0 | PENDING | **After this row, stop Layer A and start CAP-01..CAP-20.** |

## Preserved reserve commercial rows (outside primary 40-test gate)

| ID | Family | Canonical query | Status |
|---|---|---|---|
| STD-21 | Finance reconciliation | Почему мне выплатили заметно меньше, чем я вижу в продажах? Разложи, куда ушли деньги. | RESERVE |
| STD-22 | Finance BI | Разложи финансовые начисления и удержания за последние 7 дней по типам: сумма каждого и доля в общей сумме. | RESERVE |
| STD-23 | Unit economics | Какие мои товары реально продаются в минус после комиссии, логистики, рекламы и возвратов? | RESERVE |
| STD-24 | Promotions | Какие товары сейчас участвуют в акциях и стало ли мне от этих акций выгоднее? | RESERVE |
| STD-25 | Returns/cancellations | По каким товарам у меня ненормально много возвратов или отмен и что могло измениться? | RESERVE |
| STD-26 | Rating/FBS errors | Что сейчас ухудшает мой рейтинг или индекс ошибок FBS и какие отправления на это повлияли? | RESERVE |
| STD-27 | Listing quality | Какие карточки у меня сейчас самые проблемные: плохо заполнены, невидимы или требуют исправления? | RESERVE |
| STD-28 | Manager report | Подготовь недельный отчёт по кабинету: продажи, реклама, остатки, поставки, возвраты и деньги; выдели 5 главных выводов и 5 задач на следующую неделю. | RESERVE |

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

### AI-planning incident discovered in Step 1

After the repeated 429, GPT-5.6 Sol initially proposed parking STD-01 and continuing another business query. The operator correctly rejected that behavior and required diagnosis of the active business job.

This is now a benchmark finding, not chat-only context:

`SOL_REQUIRED_OPERATOR_INTERVENTION_TO_PRESERVE_FAILED_BUSINESS_JOB`

Implication:

- if GPT-5.6 Sol can make this recovery-planning error, weaker models are at greater risk;
- known API recovery mechanics cannot depend on model cleverness;
- Bridge must eventually provide machine-readable deterministic recovery guidance for known failures;
- this must be hardened before Alice Free is used as a meaningful provider benchmark.

Detailed requirement: `OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`.

### Root-cause analysis after Run 2

- `/v1/analytics/data` has a method-specific slow quota; current Bridge models the family with 60000 ms minimum plus 5000 ms launch safety.
- 117.962 s > 65 s, therefore simple violation of the Bridge local spacing rule does not explain Run 2.
- Bridge transport would preserve `Retry-After`; delivered 429 results did not contain one.
- leading remaining hypotheses became analytics-method/provider quota state, external/untracked consumption of the same account quota, or an extended provider-side cooldown/circuit condition.

### Diagnostic D1 — `roles`

Observed:
- `POST /v1/roles`;
- exactly one physical business request;
- HTTP `200`;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- current API key expiry: `2027-02-06T08:09:07.738279Z`;
- returned role inventory explicitly includes `/v1/analytics/data` under `Admin read only`.

D1 conclusions:
- `AUTH_OR_ROLE_ERROR` rejected;
- expired-key hypothesis rejected;
- general Seller API/provider path healthy at observation point;
- global Seller API rate-limit hypothesis rejected at that observation point;
- analytics method explicitly allowed by current key.

### Business Run 3 / Diagnostic D2 — recovery PASS

Exact same original `analytics_data` command succeeded.

Observed:
- request id `7b670916-262e-46f3-8702-c55dfb862225`;
- exactly one physical business request;
- entitlement `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- HTTP `200`;
- provider returned revenue `27200` and ordered units `16` for `2026-09-01`;
- totals `[27200, 16]`;
- no automatic retry.

Elapsed from Business Run 2 dispatch to successful D2 dispatch: `1013.748 seconds` = `16m 53.748s`.

### STD-01 business answer

For 2026-09-01:
- revenue: `27,200 RUB`;
- ordered units: `16`.

### STD-01 final classification

Business answerability: `PASS`.
Operational first-attempt reliability: `FAIL_TRANSIENT_429`.
Model-independent recovery guidance: `GAP`.
Operator intervention required during recovery planning: `YES`.
Combined benchmark status:

`PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP`

Strongest supported root-cause statement for the provider incident:

`TRANSIENT_ANALYTICS_METHOD_QUOTA_OR_PROVIDER_STATE_RECOVERED / EXACT_TRIGGER_UNRESOLVED`.

Do not invent a more precise provider cause without additional evidence.

## STD-02 next

Canonical business question:

`Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня.`

Resolved Standard period on 2026-09-02: `2026-08-19` through `2026-09-01` inclusive.

First read should use one explicit `analytics_data` command with dimension `[day]` and Standard metrics `[revenue, ordered_units]`. After the result, rank days by revenue and report the three highest and three lowest days; do not issue another API call unless the returned result proves the first read insufficient.

## Result rule

A business row is not marked complete until either a useful final business answer is produced or a persistent underlying constraint is root-caused and shown to prevent the product job. Completion status must preserve reliability/model-guidance flags rather than overwriting them with a clean PASS.

## Current checkpoint

`FORTY_TEST_GATE_LAYER_A_ACTIVE_STD_01_DONE_STD_02_READY_LAYER_B_CAP_01_TO_CAP_20_AFTER_STD_20`
