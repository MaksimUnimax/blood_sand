# Ozon AI Worker — Commercial Query Core V2

Date: 2026-09-02
Status: RESEARCH V2 — NOT YET LIVE-BENCHMARKED
Supersedes benchmark composition of: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V1_2026-09-02.md`
Authority: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Demand evidence: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`
Instant-BI evidence: `OZON_AI_WORKER_INSTANT_BI_CORRELATION_RESEARCH_2026-09-02.md`
Free output matrix: `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`

## 1. Purpose

This is the current commercial benchmark nucleus.

The product under test is:

`preferred AI + Ozon Bridge + seller cabinet + public/current context + AI reasoning + requested deliverable`

V2 keeps all 33 V1 business questions and adds direct analytics / cross-report correlation jobs whose commercial value is removing navigation, report downloads, Excel joins and manual reconciliation.

No row is a PASS before a live test.

## 2. Provider result vocabulary

- `PENDING_LIVE_TEST`
- `PASS`
- `PARTIAL`
- `FAIL`
- `BLOCKED`

## 3. Current product hypothesis vocabulary

- `STRONG_CANDIDATE`
- `CONDITIONAL_USER_DATA`
- `PARTIAL_CANDIDATE`
- `PRIVACY_OR_ENTITLEMENT_GATED`
- `CURRENT_PRODUCT_GAP`

## 4. Core business-question table

| ID | Segment(s) | Entitlement | Canonical user query | Value class | Why sellable / evidence | Required evidence or correlation | Current hypothesis | GPT-5.6 Sol live | Alice live |
|---|---|---|---|---|---|---|---|---|---|
| SS-01 | SELLER_STANDARD | Standard | **Что сегодня в моём кабинете требует внимания в первую очередь?** | Investigation | Daily manager monitoring; V1 evidence SRC-A01/A03/P02/P05 | sales + stock + supplies + ads + returns + ratings/finance + current incidents; prioritize | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-02 | SELLER_STANDARD | Standard | **Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.** | Investigation | repeated seller sales-collapse pain | period sales + stock + visibility + price/actions + ads + logistics + external calendar/events | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-03 | SELLER_STANDARD | Standard | **На складе Ozon был пожар/авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?** | External+cabinets investigation | real warehouse incidents; unique private/public correlation | public incident/warehouse/date + seller stock/supply/visibility + official consequences | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-04 | SELLER_STANDARD | Standard | **У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.** | Investigation | real seller stock-loss threads | FBO stock views + stock analytics + returns/removals + supplies + inconsistencies | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-05 | SELLER_STANDARD | Standard | **Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?** | Decision | paid stock-planning value | stock + turnover + recent sales + warehouse/cluster | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-06 | SELLER_STANDARD | Standard | **Что с моей поставкой: почему товар уже привёз, а он не принят или не появился в продаже?** | Investigation | recurring supply acceptance blockage | supply/order/bundle/act/cargo/timeslot + stock/visibility | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-07 | SELLER_STANDARD | Standard | **Почему товар в кабинете “продаётся” и остаток есть, а покупателю он не показывается или доставка недоступна?** | Investigation | direct lost-sales job | visibility + stock + invalid-product/logistics/delivery state | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-08 | SELLER_STANDARD | Standard + Performance credentials | **Почему у меня вырос ДРР и какие кампании или товары сейчас сливают рекламный бюджет?** | Investigation | core paid ad-management job | Performance stats + seller sales + stock/card + bids | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-09 | SELLER_STANDARD | Standard | **Почему мне выплатили заметно меньше, чем я вижу в продажах? Разложи, куда ушли деньги.** | Reconciliation | repeated report/payout confusion; BI-E01/E02 | sales/order dates + finance transactions/accruals/balance + payment semantics | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-10 | SELLER_STANDARD | Standard + seller COGS/tax | **Какие мои товары реально продаются в минус после комиссии, логистики, рекламы и возвратов?** | Unit economics | market sells this directly; BI-E03/E08/E09/E10 | finance + ads + sales + returns + seller COGS/tax/other costs | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-11 | SELLER_STANDARD | Standard + COGS for true profit | **Какие мои товары сейчас участвуют в акциях/скидках и где из-за этого стала плохая экономика?** | Decision | promotion/margin risk | prices + action membership + sales/finance/ads + COGS | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-12 | SELLER_STANDARD | Standard | **По каким товарам у меня ненормально много возвратов или отмен и что могло измениться?** | Investigation | returns destroy margin and reveal quality/logistics issues | returns/cancellations + sales + rating/error/logistics + external rule changes | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-13 | SELLER_STANDARD | privacy/subscription may apply | **Какие карточки, отзывы и вопросы покупателей требуют моего внимания сегодня?** | Prioritization | daily manager work | content rating/visibility + review/question counts/text where permitted | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-01 | SELLER_PREMIUM | Premium metrics | **По каким поисковым запросам покупатели находят и покупают мои товары, и какие из них дают больше всего выручки?** | Premium analytics | official Ozon search-query analytics | query + position/views/revenue by SKU | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-02 | SELLER_PREMIUM | Premium metrics | **По каким запросам мои товары потеряли позиции и когда это началось?** | Premium investigation | search position loss | query position across periods + stock/price/ad/visibility context | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-03 | SELLER_PREMIUM | Premium Pro where endpoint requires | **Какие поисковые запросы сейчас популярны в моей нише, но мои товары их почти не покрывают?** | Growth | marketplace-demand discovery | marketplace top/text queries + product query/card data | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-04 | SELLER_PREMIUM | Premium | **Какие слова и характеристики мне реально стоит добавить в карточку на основе запросов покупателей?** | Recommendation | turns search analytics into content work | query/position/conversion + attributes/description/content rating | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-05 | SELLER_PREMIUM | Premium + Performance | **Я получаю продажи благодаря рекламе или товар уже нормально продаётся из органики? Где я слишком завишу от рекламы?** | Correlation | high-value budget allocation | sales + Performance + search visibility/query data across periods | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-06 | SELLER_PREMIUM | Premium metrics | **Что изменилось в моей воронке за две недели: показы, просмотры, корзина, заказы, доставленные товары, возвраты и позиции? Где просадка?** | Funnel analysis | advanced analytics | restricted analytics metrics/dimensions + period comparison | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-01 | SERVICE_STANDARD | Standard | **Сделай утренний аудит кабинета клиента и дай мне 5 самых важных проблем/рисков на сегодня в порядке приоритета.** | Professional monitoring | directly sold agency work | multi-area cabinet scan + current incidents + business prioritization | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-02 | SERVICE_STANDARD | Standard + Performance if used | **Подготовь мне отчёт к созвону с клиентом: что произошло с продажами, рекламой, остатками, возвратами и деньгами за неделю, что хорошо и что плохо.** | Client reporting | recurring paid weekly reporting | Seller + Performance + finance + stocks + returns, period comparisons | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-03 | SERVICE_STANDARD | Standard + client plan input | **Клиент не выполнил план продаж. Разбери, почему, и отдели то, что мы могли контролировать, от внешних факторов.** | Accountability | core manager job | plan input + actual sales/ads/stock/price/visibility/logistics + external context | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-04 | SERVICE_STANDARD | Standard | **Какие SKU клиента надо срочно пополнить, где дефицит, а где уже перетар? Подготовь приоритет поставки.** | Supply planning | agencies/tools sell it | stocks + turnover + sales + supply/in-transit + geography | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-05 | SERVICE_STANDARD | Performance | **Где реклама клиента сейчас сливает деньги: какие кампании и SKU надо проверить в первую очередь и почему?** | Ad management | directly sold paid service | Performance stats + seller sales/stock/card | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-06 | SERVICE_STANDARD | seller COGS/tax | **Какие SKU клиента реально прибыльные, а какие съедают деньги? Покажи, за счёт чего.** | Unit economics | directly sold analytics job | finance + ads + returns + COGS/tax | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-07 | SERVICE_STANDARD | action context supplied | **Что изменилось после наших действий на прошлой неделе — стало лучше или хуже и по каким показателям?** | Client accountability | prove agency impact | user action/date context + before/after KPIs; causality caution | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-08 | SERVICE_STANDARD | Standard | **Составь менеджеру список задач по этому кабинету на сегодня: что делать сначала и почему.** | Workflow | substitutes routine manager cognition | audit findings → evidence-backed prioritized tasks | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-01 | SERVICE_PREMIUM | Premium + Performance | **Почему у клиента падают продажи: проблема в поиске, рекламе, остатках, цене, карточке, логистике или во внешнем спросе? Проведи полноценное расследование.** | Senior investigation | highest-value multi-factor job | search/funnel + ads + stock + price + content + logistics + external | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-02 | SERVICE_PREMIUM | Premium | **Где у клиента есть поисковый спрос, но карточки недополучают показы или продажи? Дай список точек роста.** | Growth analysis | SEO/assortment work | demand/queries + position/views/conversion + card/stock/price | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-03 | SERVICE_PREMIUM | Premium | **Какие карточки клиента надо переписать в первую очередь и какие реальные поисковые запросы использовать в каждой?** | Content prioritization | paid SEO/card work | query data + content rating + descriptions + sales/visibility | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-04 | SERVICE_PREMIUM | Premium + Performance | **На каких SKU клиент зря платит за рекламу, потому что органика уже сильная, а где реклама действительно нужна?** | Cross-channel correlation | direct budget-saving value | search/organic position + ads + sales; causality limits | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-05 | SERVICE_PREMIUM | Premium + Performance | **Подготовь стратегический недельный отчёт клиенту: что выросло/упало, почему это произошло, где деньги теряются и какие 3–5 действий дадут наибольший эффект.** | Senior client report | closest to analyst/manager deliverable | all major evidence areas + external context + prioritized actions | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-06 | SERVICE_PREMIUM | Multi-client credential contexts | **У какого из моих клиентов сегодня самая критичная проблема и куда мне идти первым?** | Portfolio management | high-value agency portfolio job | safe multi-cabinet comparison with no cross-client leakage | CURRENT_PRODUCT_GAP | PENDING_LIVE_TEST | PENDING_LIVE_TEST |

## 5. New Instant-BI rows

These rows test convenience value directly: user asks for a slice/ranking instead of navigating or downloading reports.

| ID | Segment(s) | Entitlement | Canonical user query | Value class | Why sellable / evidence | Required evidence or correlation | Current hypothesis | GPT-5.6 Sol live | Alice live |
|---|---|---|---|---|---|---|---|---|---|
| BI-S01 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Дай продажи за вчера: общая выручка, заказанные единицы и топ-10 SKU по выручке.** | Instant BI | replaces dashboard navigation/export | sales analytics for one day, totals + SKU ranking | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S02 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Покажи продажи за последние 30 дней по дням и выдели самые сильные и самые слабые дни.** | Instant BI | routine trend view | sales analytics grouped by day + local ranking/change calculation | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S03 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Дай топ-20 товаров за неделю: отдельно по выручке и отдельно по количеству проданных единиц.** | Instant BI | common ABC/top-SKU job | SKU-period revenue + ordered units + two rankings | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S04 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Дай продажи за вчера по складам от большего к меньшему.** | Instant BI / cross-report | user example; warehouse/region sales are recognized analytics; BI-E13 | derive sales/location from available postings/warehouse evidence; exact completeness must be proven | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S05 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Покажи текущие остатки FBO по складам и SKU, отсортируй склады по количеству товара.** | Instant BI | stock location otherwise spread across reports; BI-E11 | FBO stock-by-warehouse / stock report | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S06 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Покажи оборачиваемость и запас в днях по товарам: сначала те, которые закончатся раньше всего, потом перетар.** | Instant BI | stock planning sold by analytics tools; BI-E06/E07 | turnover + current stock + ranking | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S07 | SELLER_STANDARD, SERVICE_STANDARD | Performance | **Дай рекламные расходы за неделю по кампаниям от большего к меньшему.** | Instant BI | ad-manager routine | campaign list + expense/daily stats; campaign grouping | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S08 | SELLER_STANDARD, SERVICE_STANDARD | Performance | **Дай рекламную статистику по SKU за неделю и отсортируй товары по расходу на рекламу.** | Instant BI | product-level ad control | Performance SKU/campaign-product statistics | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S09 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Разложи финансовые начисления и удержания за неделю по типам: сумма и доля каждого типа.** | Instant BI | finance reports are hard to read; BI-E01/E02 | finance transactions/accrual types + grouping/calculation | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S10 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Покажи возвраты и отмены за месяц по товарам: количество и доля относительно продаж, где данные позволяют.** | Instant BI | paid quality analytics | returns/cancellations + sales denominator; may require multiple reads | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-S11 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Покажи все активные поставки: что в пути, что принято, что зависло и какие ближайшие таймслоты доступны.** | Instant BI | supply-manager routine | supply orders/status + details + timeslots | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-P01 | SELLER_PREMIUM, SERVICE_PREMIUM | Premium | **Дай поисковые запросы по этому SKU за период: выручка, просмотры/показы и средняя позиция, где доступно.** | Premium instant BI | official Ozon query analytics; BI-E12 | product query/details metrics | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-P02 | SELLER_PREMIUM, SERVICE_PREMIUM | Premium | **Покажи изменение позиций по главным поисковым запросам за две недели: что выросло и что упало сильнее всего.** | Premium instant BI | SEO-manager routine | query position by comparable periods + ranking | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| BI-P03 | SELLER_PREMIUM, SERVICE_PREMIUM | Premium Plus/Pro as metrics require | **Дай воронку по SKU за две недели: показы → просмотры → корзина → заказы → доставлено → возвраты.** | Premium instant BI | replaces multi-metric report work | premium analytics metrics + SKU grouping | PRIVACY_OR_ENTITLEMENT_GATED | PENDING_LIVE_TEST | PENDING_LIVE_TEST |

## 6. New Cross-Report BI rows

These rows explicitly test the worker’s ability to join data that is normally separated by Ozon surfaces/reports.

| ID | Segment(s) | Entitlement | Canonical user query | Value class | Why sellable / evidence | Required evidence or correlation | Current hypothesis | GPT-5.6 Sol live | Alice live |
|---|---|---|---|---|---|---|---|---|---|
| COR-01 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Дай продажи по складам/кластерам и рядом текущие остатки. Где спрос высокий, а запаса мало?** | Cross-report BI | stock tools sell exactly this join; BI-E06/E07 | sales-location evidence + current warehouse/cluster stock + ranking | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-02 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Учитывая продажи, текущие остатки и товар в пути, куда и сколько товара логичнее везти в первую очередь?** | Cross-report BI | replaces supply Excel calculations; BI-E06/E07/E11 | sales + stock + turnover + in-transit/supply + cluster/warehouse | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-03 | SELLER_STANDARD, SERVICE_STANDARD | Performance | **Какие товары я сейчас рекламирую, хотя они заканчиваются или уже отсутствуют на нужных складах?** | Cross-report BI | prevents wasted traffic | Performance advertised SKU + stock-by-warehouse/turnover | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-04 | SELLER_STANDARD, SERVICE_STANDARD | Performance | **На какие товары я трачу рекламу, хотя карточка невидима, плохо заполнена или имеет складские ограничения?** | Cross-report BI | joins ads with readiness instead of separate checks | advertised SKU + visibility/content rating + invalid warehouse/logistics diagnostics | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-05 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Почему продажи за этот период не сходятся с выплатой? Сопоставь заказы, начисления и даты и покажи, какие суммы относятся к разным периодам.** | Reconciliation | direct seller pain; BI-E01 | sales/order date + finance accrual/transaction/payment semantics | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-06 | SELLER_STANDARD, SERVICE_STANDARD | Standard + COGS for true profit | **После участия в акции продажи выросли, но заработал ли я больше? Сравни период до и после с учётом скидки, расходов и моей себестоимости.** | Cross-report BI | promotion effect must be measured by profit, not units | action/price + sales before/after + finance/ads + COGS; causality caution | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-07 | SELLER_STANDARD, SERVICE_STANDARD | Performance; exact fields unverified | **Сколько продаж реклама дала напрямую, сколько ассоциировано, и какую долю всех продаж товара она сопровождает?** | Cross-report BI | sellers currently download Excel to distinguish direct/associated; BI-E04 | Performance direct/associated fields/report + Seller total sales | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-08 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Какие ошибки FBS стоят мне денег: покажи отправления, которые испортили индекс, и связанные расходы/штрафы, если они доступны.** | Cross-report BI | operational mistake → money | FBS error index + offending postings + finance transaction/accrual evidence | PARTIAL_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-09 | SELLER_STANDARD, SERVICE_STANDARD | Standard + seller COGS | **Сколько денег заморожено в медленно оборачиваемом товаре и где хранение начинает съедать экономику?** | Cross-report BI | working-capital/storage analytics are paid products; BI-E03/E10 | stock + turnover + COGS + available storage/finance charges | CONDITIONAL_USER_DATA | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| COR-10 | SELLER_STANDARD, SERVICE_STANDARD | Standard | **Какие товары уже приехали или приняты в поставке, но ещё не появились в доступном остатке или продаже?** | Cross-report BI | supply-to-sale delay | supply/act/status + stock + visibility/product state | STRONG_CANDIDATE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |

## 7. Benchmark size

Business-question core V2:

- V1 preserved: **33** rows;
- new Instant-BI: **14** rows;
- new Cross-Report BI: **10** rows;
- total business rows: **57**.

This is intentionally a benchmark core, not a list of every possible paraphrase.

## 8. Output / deliverable suite

Output format is tested separately from business-answer correctness.

| ID | Requested output | GPT-5.6 Sol Free live | Alice Free live | Future providers |
|---|---|---|---|---|
| OUT-01 | Sorted table in chat | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-02 | Data chart/graph | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-03 | Downloadable CSV | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-04 | Downloadable XLSX with `Summary` + detail sheet(s) | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-05 | PDF management/client report | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-06 | DOCX or equivalent editable document | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-07 | PPTX/client presentation | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-08 | Exact JSON | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |
| OUT-09 | Exact XML | PENDING_LIVE_TEST | PENDING_LIVE_TEST | add per provider |

For OUT-03..OUT-07 distinguish a true downloadable file from a code block containing textual imitation of that format.

## 9. Important benchmark rule

Do not hard-code endpoint names into the natural-language user prompt.

Example test prompt remains simply:

`Дай продажи за вчера по складам от большого к маленькому.`

The provider must determine what evidence it needs, use Bridge safely, perform the join/sort itself, state any completeness limitation and return the requested business view.

The benchmark must therefore score:

- intent understanding;
- evidence planning;
- Bridge request correctness;
- joining/normalization;
- calculations/sorting;
- external context when relevant;
- fact-vs-hypothesis discipline;
- business usefulness;
- requested deliverable quality.

## 10. Current exact checkpoint

`COMMERCIAL_QUERY_CORE_V2_READY_57_BUSINESS_ROWS_PLUS_9_OUTPUT_TESTS_BEFORE_SOL_LIVE_BENCHMARK`
