# Ozon AI Worker — Standard-only Live Benchmark V1

Date: 2026-09-02
Status: ACTIVE — GPT-5.6 SOL LIVE TEST IN PROGRESS
Scope: authenticated Ozon seller **without Premium**. Premium rows are excluded from live testing for now and will be evaluated later by evidence-based extrapolation and, if needed, a separate Premium pass.
Authority: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Parent core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V2_2026-09-02.md`

## Test rule

The benchmark unit is the user's natural-language business question, not one API call.

For each row:

1. The operator asks the canonical user question.
2. GPT-5.6 Sol chooses the next required Bridge read without being given an endpoint workflow.
3. Exactly one `OZON_API_V1` command is issued at a time.
4. The operator returns the Bridge result.
5. Sol analyses the result and either:
   - asks for another explicit Bridge read;
   - uses public web/context/calculation where useful;
   - asks for load-bearing seller-only data if genuinely required; or
   - produces the final answer.
6. Multi-run investigations are explicitly allowed and are expected for complex rows.
7. A row receives `PASS`, `PARTIAL`, `FAIL` or `BLOCKED` only after the final business answer is evaluated.
8. Every run and conclusion is recorded here. Nothing load-bearing is kept only in chat.
9. A transient provider/runtime rate limit does **not** count as a business-answer FAIL. The exact failed physical request is recorded. After two separated identical reads that both receive provider 429, the row is parked as `IN_PROGRESS / TEMPORARY_PROVIDER_RATE_LIMIT` and testing moves to a different quota family; it can be resumed later. No automatic retry is allowed.

## Provider order

1. GPT-5.6 Sol + Bridge — current live pass.
2. Alice + Bridge — only after the Sol baseline is complete.
3. Other AIs later against the same frozen query wording.

## Premium rule

No Premium/Premium Plus/Premium Pro endpoint or Premium-only metric is intentionally requested in this pass.

Premium value will first be extrapolated from:

- success/failure of the same reasoning patterns on Standard data;
- documented Premium data availability;
- whether failures are caused by reasoning/orchestration versus missing Standard data.

A Premium extrapolation is never written as a live PASS.

## Frozen Standard query set — 28 diverse queries

| ID | Family | Canonical user query | Expected investigation value | Sol status | Sol runs | Alice status | Notes |
|---|---|---|---|---|---|---|---|
| STD-01 | Instant sales BI | **Дай продажи за вчера: общая выручка и количество заказанных единиц.** | Basic direct analytics retrieval and interpretation. | IN_PROGRESS / TEMP_RATE_LIMIT | 2 | PENDING | Two identical Standard-entitled reads, ~118 s apart, both received provider HTTP 429. Correct operation/metrics and one-request invariant proven; business data not returned. Park and resume later. |
| STD-02 | Period BI | **Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня.** | Period series + sorting. | PENDING | — | PENDING | — |
| STD-03 | Product BI | **Дай топ-20 товаров за последние 7 дней по выручке.** | Product-level ranking without manual export. | PENDING | — | PENDING | — |
| STD-04 | Period comparison | **Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах.** | Multi-period comparison/calculation. | PENDING | — | PENDING | — |
| STD-05 | Sales diagnosis | **Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.** | Multi-source root-cause investigation + external context if relevant. | PENDING | — | PENDING | — |
| STD-06 | Cabinet health | **Что сегодня в моём кабинете требует внимания в первую очередь?** | Cross-domain audit and prioritization. | PENDING | — | PENDING | — |
| STD-07 | Stock planning | **Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?** | Stock + turnover + sales correlation. | PENDING | — | PENDING | — |
| STD-08 | Stock BI | **Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.** | Warehouse stock aggregation/sorting. | IN_PROGRESS | — | PENDING | Selected next to avoid the temporarily blocked `seller.analytics_data.v1` quota family. |
| STD-09 | Sales × warehouse | **Дай продажи за вчера по складам от большего к меньшему.** | Valuable cross-report warehouse attribution; explicit capability stress test. | PENDING | — | PENDING | Known pre-test uncertainty. |
| STD-10 | External incident | **На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?** | Public incident research + private cabinet correlation. | PENDING | — | PENDING | — |
| STD-11 | Stock forensics | **У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.** | Stock + returns/removals/supplies reconciliation. | PENDING | — | PENDING | Historical evidence may limit result. |
| STD-12 | Supply status | **Какие мои поставки сейчас активны и что с каждой происходит?** | Instant supply dashboard replacement. | PENDING | — | PENDING | — |
| STD-13 | Supply diagnosis | **Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.** | Supply + acts + stock + visibility diagnosis. | PENDING | — | PENDING | — |
| STD-14 | Availability diagnosis | **Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна?** | Visibility + logistics + restrictions correlation. | PENDING | — | PENDING | — |
| STD-15 | Logistics diagnostics | **Какие товары или склады сейчас имеют ограничения доставки и что именно не так?** | Warehouse/product logistics diagnostics. | PENDING | — | PENDING | — |
| STD-16 | Advertising BI | **Дай рекламные расходы за последние 7 дней и покажи, какие кампании потратили больше всего.** | Performance analytics retrieval/ranking. | PENDING | — | PENDING | Standard Performance API, not Seller Premium analytics. |
| STD-17 | Advertising waste | **Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?** | Ads × sales correlation. | PENDING | — | PENDING | — |
| STD-18 | Ads × stock | **Какие товары я сейчас рекламирую, хотя они заканчиваются или уже отсутствуют на нужных складах?** | Avoid paid traffic to unavailable stock. | PENDING | — | PENDING | — |
| STD-19 | Ads × listing state | **На какие товары я трачу рекламу, хотя карточка плохо заполнена, невидима или имеет ограничения?** | Ads × content/visibility/logistics correlation. | PENDING | — | PENDING | — |
| STD-20 | DRR diagnosis | **Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах.** | Performance × sales period comparison. | PENDING | — | PENDING | — |
| STD-21 | Finance reconciliation | **Почему мне выплатили заметно меньше, чем я вижу в продажах? Разложи, куда ушли деньги.** | Sales × finance reconciliation; different accounting dates. | PENDING | — | PENDING | — |
| STD-22 | Finance BI | **Разложи финансовые начисления и удержания за последние 7 дней по типам: сумма каждого и доля в общей сумме.** | Finance grouping/calculation without manual Excel. | PENDING | — | PENDING | — |
| STD-23 | Unit economics | **Какие мои товары реально продаются в минус после комиссии, логистики, рекламы и возвратов?** | Ozon data + seller COGS/tax when needed. | PENDING | — | PENDING | Must request seller-only cost data only if load-bearing. |
| STD-24 | Promotions × economics | **Какие товары сейчас участвуют в акциях и стало ли мне от этих акций выгоднее?** | Actions/prices × sales/finance; true profit may require COGS. | PENDING | — | PENDING | — |
| STD-25 | Returns/cancellations | **По каким товарам у меня ненормально много возвратов или отмен и что могло измениться?** | Returns/cancellations × sales/logistics signals without Premium-only analytics metrics. | PENDING | — | PENDING | Do not use Premium-only analytics metrics intentionally. |
| STD-26 | Seller rating/FBS errors | **Что сейчас ухудшает мой рейтинг или индекс ошибок FBS и какие отправления на это повлияли?** | Rating + error postings + possible finance impact. | PENDING | — | PENDING | — |
| STD-27 | Listing quality | **Какие карточки у меня сейчас самые проблемные: плохо заполнены, невидимы или требуют исправления?** | Content rating + visibility + diagnostics. | PENDING | — | PENDING | — |
| STD-28 | Manager deliverable | **Подготовь недельный отчёт по кабинету: продажи, реклама, остатки, поставки, возвраты и деньги; выдели 5 главных выводов и 5 задач на следующую неделю.** | Full Standard AI-worker synthesis; tests whether product replaces manual report assembly. | PENDING | — | PENDING | Multi-run expected. |

## Result rubric

### PASS
The AI worker reaches a materially useful, evidence-backed business answer with correct Bridge orchestration, calculations, uncertainty handling and understandable conclusions.

### PARTIAL
The answer is still useful but one or more load-bearing facts cannot be established with available Standard data, or reasoning is materially incomplete.

### FAIL
Required data is available but the AI worker chooses the wrong investigation, produces incorrect calculations, invents facts or fails to produce a commercially useful answer.

### BLOCKED
The test cannot proceed because of credentials/runtime/adapter/privacy/access limitations or because the needed Ozon capability is not available in the Standard contour.

Transient Ozon/provider rate limits are recorded as temporary infrastructure blockers while the row remains `IN_PROGRESS`; they do not by themselves determine the final business-query result.

## Run log

### STD-01

Canonical question:

`Дай продажи за вчера: общая выручка и количество заказанных единиц.`

Resolved test date: 2026-09-01.

#### Run 1

AI-selected command:

```text
OZON_API_V1
{
  "operation": "analytics_data",
  "params": {
    "date_from": "2026-09-01",
    "date_to": "2026-09-01",
    "dimension": ["day"],
    "metrics": ["revenue", "ordered_units"],
    "limit": 100
  }
}
```

Observed Bridge result:

- operation: `analytics_data`;
- provider: `seller_api`;
- HTTP method/path: `POST /v1/analytics/data`;
- entitlement: `SUPPORTED_AND_ENTITLED`;
- entitlement reason: `all_accounts`;
- requested metrics preserved: `revenue`, `ordered_units`;
- logical business result count: 1;
- physical business request count: 1;
- external request executed: true;
- HTTP status: `429`;
- provider error category: `rate_limit`;
- quota family: `seller.analytics_data.v1`;
- minimum interval recorded by Bridge: `60000 ms`;
- automatic retry: false;
- no sales data returned.

Assessment after run 1:

- AI intent/operation selection: **correct**;
- Standard entitlement selection: **correct / proven**;
- request safety and one-request invariant: **PASS for this run**;
- business answer: **not yet evaluable**;
- blocker: `TEMPORARY_PROVIDER_RATE_LIMIT`;
- no inference such as `zero sales` is permitted from this response;
- do not change operation/metrics merely because of the 429.

#### Run 2

The exact same logical command was explicitly retried. Observed Bridge result:

- same logical command fingerprint: `728628d4`;
- same `analytics_data` operation and Standard-entitled metrics;
- logical business result count: 1;
- physical business request count: 1;
- external request executed: true;
- HTTP status: `429` again;
- provider error category: `rate_limit`;
- quota family: `seller.analytics_data.v1`;
- automatic retry: false;
- no sales data returned;
- provider-request timestamps show Run 2 occurred about **118 seconds after Run 1**, which is longer than the Bridge-reported local minimum interval of 60000 ms.

Assessment after run 2:

- repeated 429 is therefore not explained by an immediate violation of the Bridge's local 60-second interval alone;
- likely provider-side quota/window or another external rate-limit condition;
- still no evidence about actual sales values;
- further immediate repeats of this same quota family would add little benchmark value and could waste provider quota;
- STD-01 is parked, not failed.

State: `IN_PROGRESS / TEMPORARY_PROVIDER_RATE_LIMIT_AFTER_2_EXPLICIT_RUNS / RESUME_LATER`.

### STD-08

Canonical question:

`Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.`

State: `IN_PROGRESS / RUN_1_READY`.

Reason for out-of-order selection: STD-02 through STD-05 depend directly on the currently rate-limited Seller analytics family. STD-08 exercises a different stock/warehouse family and lets the live benchmark continue without conflating provider throttling with model capability.

## Current checkpoint

`STANDARD_ONLY_LIVE_BENCHMARK_SOL_STD_01_PARKED_2X429_STD_08_RUN_1_READY`
