# Ozon AI Worker — Commercial Query Core V1

Date: 2026-09-02
Status: RESEARCH V1 — NOT YET LIVE-BENCHMARKED
Authority: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Evidence ledger: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`

## Purpose

This is the benchmark nucleus for deciding whether the product has enough commercial value to continue.

The rows are not API commands. They are canonical natural-language business questions a seller/manager could plausibly ask their AI worker.

The product under test is:

`preferred AI + Ozon Bridge + Ozon cabinet data + external/public context + AI analysis`

The same frozen questions will later be tested first with GPT-5.6 Sol + Bridge, then Alice + Bridge, then each additional AI provider.

## Status vocabulary

### Bridge/product hypothesis

- `STRONG_CANDIDATE` — current accepted read registry appears to expose the main cabinet evidence needed; AI may require several explicit reads and/or web research.
- `CONDITIONAL_USER_DATA` — cabinet data is available but material seller-side business data such as cost price/tax/plan is not owned by Ozon and must be supplied by user/context.
- `PARTIAL_CANDIDATE` — valuable question is likely answerable only in some timings/cases because historical/movement/causality evidence is incomplete.
- `PRIVACY_OR_ENTITLEMENT_GATED` — capability exists but may require operator privacy gate and/or Ozon subscription entitlement.
- `CURRENT_PRODUCT_GAP` — current architecture/data access is missing a load-bearing capability.

### Provider live benchmark

- `PENDING_LIVE_TEST`
- `PASS`
- `PARTIAL`
- `FAIL`
- `BLOCKED`

A pre-test hypothesis is never a PASS.

## Commercial-core table

| ID | Segment | Canonical user query | Why this is sellable | Evidence | Needed evidence/investigation | Current product hypothesis | GPT-5.6 Sol + Bridge pre-test | GPT-5.6 Sol live | Alice live |
|---|---|---|---|---|---|---|---|---|---|
| SS-01 | SELLER_STANDARD | **Что сегодня в моём кабинете требует внимания в первую очередь?** | Replaces daily manual checking; directly matches paid manager/analytics monitoring work. | SRC-A01, SRC-A03, SRC-P02, SRC-P05 | Compare recent sales, stock risks, supplies/orders, ads, returns, ratings/finance anomalies; current Ozon incidents if relevant; prioritize by business impact. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-02 | SELLER_STANDARD | **Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.** | High urgency/revenue loss; repeated seller pain. | SRC-S01, SRC-S02, SRC-S09, SRC-S17 | Compare sales periods; stocks; visibility; prices/actions; ads; ratings/logistics; external outage/holiday/seasonality/current events; separate facts from hypotheses. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-03 | SELLER_STANDARD | **На складе Ozon был пожар/авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?** | Real incident can put inventory/revenue at risk; unique advantage of combining web + private cabinet data. | SRC-X01, SRC-S03 | Identify affected warehouse/event from reliable public/Ozon sources; correlate seller stock/supply/visibility/current states; check cancellation/rerouting/official compensation info; state historical uncertainty. | PARTIAL_CANDIDATE | ANSWERABLE_WITH_LIMITS | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-04 | SELLER_STANDARD | **У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.** | Direct stock-loss/money-risk investigation; seller forum evidence. | SRC-S03 | Reconcile FBO stock views, stock analytics, returns/removals/supply state and any available movement-like evidence; identify contradictions and what must be escalated. | PARTIAL_CANDIDATE | ANSWERABLE_WITH_LIMITS | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-05 | SELLER_STANDARD | **Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?** | Inventory cash-flow and lost-sales value; widely sold analytics feature. | SRC-S04, SRC-P02, SRC-P03, SRC-P05 | Stocks by warehouse/cluster, turnover, recent sales; rank stockout and overstock risk; avoid pretending forecast is guaranteed. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-06 | SELLER_STANDARD | **Что с моей поставкой: почему товар уже привёз, а он не принят или не появился в продаже?** | Operational blockage freezes stock and sales; repeated seller problem. | SRC-S06, SRC-S07 | Supply/order status, bundle/content, acts/statuses, cargo/labels/timeslot/warehouse states; visibility/stocks after acceptance; current Ozon incident if relevant. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-07 | SELLER_STANDARD | **Почему товар в кабинете “продаётся” и остаток есть, а покупателю он не показывается или доставка недоступна?** | Direct lost-sales problem. | SRC-S08 | Product visibility, stock, warehouse restrictions, delivery methods/geography, invalid-product diagnostics, seller logistics state; external Ozon restrictions if current. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-08 | SELLER_STANDARD | **Почему у меня вырос ДРР и какие кампании или товары сейчас сливают рекламный бюджет?** | Advertising waste is a major paid-management job. | SRC-S09, SRC-S10, SRC-A01, SRC-A04, SRC-P02 | Performance campaign/product statistics, daily expense, sales context, bid/min/competitive data, stock/card state; identify waste vs low demand vs low conversion. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-09 | SELLER_STANDARD | **Почему мне выплатили заметно меньше, чем я вижу в продажах? Разложи, куда ушли деньги.** | Seller cash/reconciliation pain is frequent and highly concrete. | SRC-S12, SRC-S13 | Finance transactions, accruals, balance, realization/reports where available; distinguish order/sale/payment dates; explain marketplace deductions without inventing cost price. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-10 | SELLER_STANDARD | **Какие мои товары реально продаются в минус после комиссии, логистики, рекламы и возвратов?** | Core willingness-to-pay analytics job; turnover alone is insufficient. | SRC-S13, SRC-P01, SRC-P02, SRC-P03 | Ozon finance + ads + sales/returns per SKU plus seller-provided cost price/tax/other costs; calculate and rank negative contribution. | CONDITIONAL_USER_DATA | ANSWERABLE_IF_COST_DATA_GIVEN | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-11 | SELLER_STANDARD | **Какие мои товары сейчас участвуют в акциях/скидках и где из-за этого стала плохая экономика?** | Unexpected promotion/price changes directly affect margin. | SRC-S14, SRC-A04, SRC-P02 | Current prices, action participation/candidates, pricing strategies, finance/ad context; profitability requires cost data if user asks for true profit. | CONDITIONAL_USER_DATA | LIKELY_ANSWERABLE_WITH_COST_LIMIT | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-12 | SELLER_STANDARD | **По каким товарам у меня ненормально много возвратов или отмен и что могло измениться?** | Returns destroy margin and reveal quality/logistics problems. | SRC-S13, SRC-P01, SRC-P05 | Returns/cancellations, period/product sales analytics, rating/error signals, stock/logistics changes, public/current rule changes where relevant. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SS-13 | SELLER_STANDARD | **Какие карточки, отзывы и вопросы покупателей требуют моего внимания сегодня?** | Daily operational manager work; impacts conversion/reputation. | SRC-S11, SRC-S15, SRC-A03 | Content rating/visibility; aggregated review/question counts; text-level reviews/questions if privacy/subscription gates permit; rank urgency. | PRIVACY_OR_ENTITLEMENT_GATED | ANSWERABLE_WITH_GATES | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-01 | SELLER_PREMIUM | **По каким поисковым запросам покупатели находят и покупают мои товары, и какие из них дают больше всего выручки?** | Official Premium analytics value; directly actionable for content/SEO. | SRC-O01, SRC-O04 | Product-query analytics by SKU, views/position/revenue metrics where entitlement permits; compare meaningful query contribution. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-02 | SELLER_PREMIUM | **По каким запросам мои товары потеряли позиции и когда это началось?** | Search-position loss is a commercial growth problem. | SRC-O01, SRC-S01 | Query details/position metrics over comparable periods plus stock/price/ad/visibility context; avoid causal overclaim. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-03 | SELLER_PREMIUM | **Какие поисковые запросы сейчас популярны в моей нише, но мои товары их почти не покрывают?** | Direct discovery/growth opportunity; marketplace search endpoints are Premium Pro-oriented in current registry. | SRC-O01, SRC-O04 | Marketplace top/text query data, seller product queries/attributes/descriptions; identify demand gaps, not arbitrary keyword stuffing. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM_PRO | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-04 | SELLER_PREMIUM | **Какие слова и характеристики мне реально стоит добавить в карточку на основе запросов покупателей?** | Turns Premium analytics into concrete action; matches agency SEO/card work. | SRC-O01, SRC-A01, SRC-A05 | Search queries/position/conversion + current product attributes/description/content rating; propose evidence-backed content changes. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-05 | SELLER_PREMIUM | **Я получаю продажи благодаря рекламе или товар уже нормально продаётся из органики? Где я слишком завишу от рекламы?** | High-value budget-allocation question; sellers report orders disappearing when ads stop. | SRC-S09, SRC-O01, SRC-P02 | Sales + Performance stats + search visibility/query data across periods; infer dependency with uncertainty; do not claim exact attribution if data cannot prove it. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_LIMITS | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| SP-06 | SELLER_PREMIUM | **Что изменилось в моей воронке за две недели: показы, просмотры, корзина, заказы, доставленные товары, возвраты и позиции? Где просадка?** | Premium analytics enables deeper funnel diagnosis instead of raw sales. | SRC-O01, SRC-O04, SRC-P03 | Analytics restricted metrics/dimensions where entitlement permits; period comparison; explain where conversion changed. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-01 | SERVICE_STANDARD | **Сделай утренний аудит кабинета клиента и дай мне 5 самых важных проблем/рисков на сегодня в порядке приоритета.** | Agencies sell ongoing control and daily reporting; saves manager time. | SRC-A01, SRC-A03, SRC-A04, SRC-P02 | Multi-area scan: sales, stock, supplies, ads, returns, ratings, finance/current incidents; rank by likely business impact and evidence confidence. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-02 | SERVICE_STANDARD | **Подготовь мне отчёт к созвону с клиентом: что произошло с продажами, рекламой, остатками, возвратами и деньгами за неделю, что хорошо и что плохо.** | Weekly reporting is directly sold by agencies/managers. | SRC-A01, SRC-A03, SRC-A04, SRC-P06 | Period comparisons across Seller + Performance + finance/stock/returns; synthesize executive summary and evidence-backed action list. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-03 | SERVICE_STANDARD | **Клиент не выполнил план продаж. Разбери, почему, и отдели то, что мы могли контролировать, от внешних факторов.** | Core manager accountability/job; more valuable than dashboard. | SRC-A01, SRC-A02, SRC-S01, SRC-S02 | User/client plan input + actual sales, stock, ads, price, visibility, logistics and external context; classify controllable vs external with uncertainty. | CONDITIONAL_USER_DATA | ANSWERABLE_IF_PLAN_GIVEN | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-04 | SERVICE_STANDARD | **Какие SKU клиента надо срочно пополнить, где дефицит, а где уже перетар? Подготовь приоритет поставки.** | Agencies sell supply planning and stock control. | SRC-S04, SRC-A01, SRC-A04, SRC-P02 | Stocks/warehouses/turnover/recent sales/supply states; rank urgency; warehouse allocation may require demand-by-cluster evidence. | PARTIAL_CANDIDATE | ANSWERABLE_WITH_LIMITS | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-05 | SERVICE_STANDARD | **Где реклама клиента сейчас сливает деньги: какие кампании и SKU надо проверить в первую очередь и почему?** | Paid advertising-management service. | SRC-S09, SRC-S10, SRC-A01, SRC-A04 | Performance campaign/product stats, expense/DRR, bid data, sales/stock/card state; prioritize, recommend without making writes. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-06 | SERVICE_STANDARD | **Какие SKU клиента реально прибыльные, а какие съедают деньги? Покажи, за счёт чего.** | Unit economics and margin control are standard paid agency/analytics products. | SRC-S13, SRC-A01, SRC-A04, SRC-P01 | Ozon deductions + ad costs + returns + seller-provided COGS/tax/other costs; calculate per SKU and explain drivers. | CONDITIONAL_USER_DATA | ANSWERABLE_IF_COST_DATA_GIVEN | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-07 | SERVICE_STANDARD | **Что изменилось после наших действий на прошлой неделе — стало лучше или хуже и по каким показателям?** | Agencies must prove value to client; recurring retention/reporting job. | SRC-A01, SRC-A02, SRC-A03 | User supplies action/date context; compare before/after sales, ads, stock, price/actions, visibility/returns; caution on causation. | CONDITIONAL_USER_DATA | ANSWERABLE_IF_ACTION_CONTEXT_GIVEN | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AS-08 | SERVICE_STANDARD | **Составь менеджеру список задач по этому кабинету на сегодня: что делать сначала и почему.** | Converts analytics into manager workflow; directly substitutes routine manager cognition. | SRC-A03, SRC-A06, SRC-P02 | Derive from cabinet audit; each task must cite detected evidence/risk; distinguish recommendation from write action. | STRONG_CANDIDATE | LIKELY_ANSWERABLE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-01 | SERVICE_PREMIUM | **Почему у клиента падают продажи: проблема в поиске, рекламе, остатках, цене, карточке, логистике или во внешнем спросе? Проведи полноценное расследование.** | Highest-value professional diagnostic; combines exactly the work agencies sell separately. | SRC-S01, SRC-S02, SRC-S09, SRC-O01, SRC-A01 | Premium search/funnel + ads + stock + price + content + logistics + external events/seasonality; rank hypotheses by evidence. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-02 | SERVICE_PREMIUM | **Где у клиента есть поисковый спрос, но карточки недополучают показы или продажи? Дай список точек роста.** | SEO/assortment growth opportunity sold by agencies and analytics tools. | SRC-O01, SRC-A01, SRC-A05, SRC-P03 | Marketplace/product query demand, positions, views/conversion, listing attributes/content rating, stock/price availability. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-03 | SERVICE_PREMIUM | **Какие карточки клиента надо переписать в первую очередь и какие реальные поисковые запросы использовать в каждой?** | Converts Premium data into paid SEO/content management work. | SRC-O01, SRC-S11, SRC-A01 | Query analytics + content rating + current attributes/descriptions + sales/visibility; prioritize by opportunity, not just low content score. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-04 | SERVICE_PREMIUM | **На каких SKU клиент зря платит за рекламу, потому что органика уже сильная, а где реклама действительно нужна?** | Potential direct advertising savings; premium-professional value. | SRC-S09, SRC-O01, SRC-A01, SRC-P02 | Organic/query/position signals + paid campaign/product stats + period changes; treat cannibalization as inference unless directly provable. | PRIVACY_OR_ENTITLEMENT_GATED | ANSWERABLE_WITH_CAUSALITY_LIMITS | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-05 | SERVICE_PREMIUM | **Подготовь стратегический недельный отчёт клиенту: что выросло/упало, почему это произошло, где деньги теряются и какие 3–5 действий дадут наибольший эффект.** | Closest conversational replacement for senior marketplace analyst/manager report. | SRC-A01, SRC-A02, SRC-A03, SRC-A04, SRC-P06 | Premium + standard cabinet evidence, ads, finance, stock, returns, search, external context; rank actions by evidence/impact and state unknowns. | PRIVACY_OR_ENTITLEMENT_GATED | LIKELY_ANSWERABLE_WITH_PREMIUM | PENDING_LIVE_TEST | PENDING_LIVE_TEST |
| AP-06 | SERVICE_PREMIUM | **У какого из моих клиентов сегодня самая критичная проблема и куда мне идти первым?** | Strong agency portfolio value; multi-store products explicitly sell this convenience. | SRC-P01, SRC-P04, SRC-P06 | Requires safe access to several distinct seller credential contexts, comparable health scores and strict no-cross-client leakage. | CURRENT_PRODUCT_GAP | NOT_YET_PRODUCT_COMPLETE | PENDING_LIVE_TEST | PENDING_LIVE_TEST |

## Why these 33 queries form the initial commercial core

The core deliberately avoids endpoint-level trivia. It covers the repeated work people already pay for:

1. daily monitoring and prioritization;
2. revenue-anomaly investigation;
3. stock loss and external warehouse incidents;
4. stock/replenishment/supply control;
5. listing availability/content problems;
6. advertising waste and dependency;
7. finance/payout explanation;
8. unit economics and price/action profitability;
9. returns/reputation signals;
10. Premium search/funnel analytics;
11. agency reporting and accountability;
12. senior multi-factor diagnostics;
13. multi-client portfolio management as an explicit high-value current gap.

## Current accepted Bridge evidence relevant to this core

The accepted registry at commit `516ecf140538ad2838d39dcd01c7428efc1880d3` already exposes read clusters for:

- catalog/products/content/visibility;
- stocks by FBO/FBS warehouse and stock analytics/turnover;
- seller sales analytics and ratings;
- search/product-query analytics plus marketplace search operations with Premium-related restrictions;
- prices, pricing strategies, actions/promotions;
- FBO/FBS/FBP postings;
- supplies, timeslots, cargoes and statuses;
- warehouses, clusters, logistics and delivery diagnostics;
- returns/cancellations;
- finance/accruals/transactions/balance/realization/reports;
- reviews/questions/chats with privacy/subscription gates where applicable;
- Performance API campaigns, products, bids, expenses, daily/product/media statistics and report workflows.

This means the commercial question is no longer `do we have any useful data?` The next question is whether the AI worker can orchestrate these reads and external research into consistently useful answers.

## Live benchmark acceptance rubric

A provider receives `PASS` on a row only when the full AI-worker interaction demonstrates all applicable points:

1. Understands the seller's business intent without requiring API terminology.
2. Chooses a sensible investigation sequence.
3. Uses Bridge operations safely and correctly.
4. Uses current public/web context when the question genuinely needs it.
5. Does not invent cabinet facts or external events.
6. Distinguishes observed facts from plausible hypotheses.
7. Performs comparisons/calculations correctly.
8. Asks for seller-only input such as cost price only when actually load-bearing.
9. Gives a concise business conclusion, not a raw JSON dump.
10. Gives actionable next steps while respecting current read-only boundary.

`PARTIAL` means the answer is still useful but a load-bearing fact is unavailable or reasoning is materially incomplete.

`FAIL` means the interaction does not produce a commercially useful answer despite the required data being available.

`BLOCKED` means the test could not be performed because of entitlement, privacy gate, credentials, adapter/runtime or unavailable data.

## Commercial decision rule after Sol + Alice

The next major product decision is made only after these rows have actual live results for GPT-5.6 Sol and Alice.

The decision must separate:

- queries solved by both;
- queries solved only by the stronger AI;
- queries failing due to Bridge/data gaps;
- queries failing due to model reasoning/planning;
- queries requiring Premium;
- queries requiring seller-side business data;
- queries requiring architectural work such as safe multi-client context.

Only then decide what exact product promise can be sold and whether continuing multi-AI expansion is justified.
