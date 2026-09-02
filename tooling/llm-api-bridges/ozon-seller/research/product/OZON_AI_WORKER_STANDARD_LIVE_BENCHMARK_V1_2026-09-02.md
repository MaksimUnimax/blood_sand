# Ozon AI Worker — Standard-only Live Benchmark V1

Date: 2026-09-02
Status: ACTIVE — GPT-5.6 SOL LIVE TEST STARTING
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
| STD-01 | Instant sales BI | **Дай продажи за вчера: общая выручка и количество заказанных единиц.** | Basic direct analytics retrieval and interpretation. | IN_PROGRESS | — | PENDING | First live test. |
| STD-02 | Period BI | **Покажи продажи за последние 14 дней по дням и выдели 3 лучших и 3 худших дня.** | Period series + sorting. | PENDING | — | PENDING | — |
| STD-03 | Product BI | **Дай топ-20 товаров за последние 7 дней по выручке.** | Product-level ranking without manual export. | PENDING | — | PENDING | — |
| STD-04 | Period comparison | **Сравни продажи вчера и позавчера: выручка, штуки и изменение в процентах.** | Multi-period comparison/calculation. | PENDING | — | PENDING | — |
| STD-05 | Sales diagnosis | **Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.** | Multi-source root-cause investigation + external context if relevant. | PENDING | — | PENDING | — |
| STD-06 | Cabinet health | **Что сегодня в моём кабинете требует внимания в первую очередь?** | Cross-domain audit and prioritization. | PENDING | — | PENDING | — |
| STD-07 | Stock planning | **Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?** | Stock + turnover + sales correlation. | PENDING | — | PENDING | — |
| STD-08 | Stock BI | **Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.** | Warehouse stock aggregation/sorting. | PENDING | — | PENDING | — |
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

## Run log

### STD-01

Canonical question:

`Дай продажи за вчера: общая выручка и количество заказанных единиц.`

Resolved test date: 2026-09-01.

State: `IN_PROGRESS / awaiting Bridge run 1`.

No provider result has been assigned yet.

## Current checkpoint

`STANDARD_ONLY_LIVE_BENCHMARK_28_ROWS_SOL_STD_01_RUN_1_READY`
