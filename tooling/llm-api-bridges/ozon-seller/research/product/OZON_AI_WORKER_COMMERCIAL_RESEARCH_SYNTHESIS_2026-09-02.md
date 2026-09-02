# Ozon AI Worker — Commercial Research Synthesis

Date: 2026-09-02
Status: RESEARCH COMPLETE ENOUGH FOR CORE V1 / LIVE VALIDATION NOT STARTED

## 1. Product-gate question

The project must answer:

> Is there a real, sellable nucleus of recurring Ozon seller/manager jobs, and can the AI-worker product solve them reliably enough to justify continued development and sale?

Product under evaluation:

`user's preferred AI + Ozon Bridge + private Ozon cabinet data + public/current context + AI analysis`

The extension alone is not the product. The endpoint catalog alone is not the value proposition.

## 2. Research result: real demand exists

### Evidence from sellers

Public seller discussions repeatedly show high-value unresolved questions around:

- sudden sales collapse despite apparently unchanged price/stock/advertising;
- stock disappearing from FBO without visible sales;
- stock shortage vs warehouse overstock and how to distribute supply;
- FBO supply delivered but not accepted / not available for sale;
- listing marked selling and in stock but unavailable to customer;
- high DRR and orders disappearing when ads are disabled;
- confusion over Ozon payouts, accruals, logistics/commission deductions and report date bases;
- products becoming unprofitable after marketplace costs, advertising and returns;
- price/action/discount mechanics damaging margin;
- returns, reviews, ratings and customer questions;
- seasonal/outage/current-event explanations for anomalies.

These are actual seller questions found in public forums, not generated from the Bridge operation list.

### Evidence from Ozon itself

Ozon has built analytics for buyer search queries because sellers need to understand:

- which queries show/sell their products;
- search demand;
- average search position;
- revenue attributed to queries;
- Premium-dependent deeper analytics.

Ozon also publicly reports warehouse incidents and seller-specific consequences such as hidden stock, interrupted supplies, rerouting and later inventory/compensation handling. This validates a multi-source AI-worker job where public incident context must be correlated with private cabinet data.

### Evidence from paid human services

Ozon-management agencies/freelancers publicly sell:

- advertising management;
- cards/SEO;
- prices/actions;
- supplies/logistics;
- stock control;
- reviews/questions;
- unit economics/profitability;
- analytics;
- daily/weekly reporting;
- overall cabinet management.

Public offers span from tens of thousands to roughly 100k+ RUB/month depending on scope. This proves the underlying work has material business value.

### Evidence from paid software

Analytics services sell recurring subscriptions for:

- profit/margin by SKU;
- ad efficiency/DRR;
- stock risk and supply planning;
- price/action monitoring;
- returns;
- daily summaries/alerts;
- multi-store reporting;
- AI recommendations.

Observed public subscription anchors range from around 1–5k RUB/month for several seller analytics/AI products, depending on product and plan.

## 3. Research result: direct AI competition exists

Important: market validation does not imply product uniqueness.

Observed direct/near-direct competitors include:

- Ozon's own test `Умный ассистент` inside seller cabinet;
- inSales AI analyst — ordinary-language questions about revenue/profit/ads over marketplace data;
- Operesso — explicitly positioned as a personal Ozon AI manager using Seller API + Performance API;
- ReStat — AI suggestions, morning summaries, profit/ads/stock/supply analysis;
- SuperIntellect — AI agents + Ozon integration in its own multi-model platform;
- JAFO / AISellerAgent and other agentic seller tools.

Therefore `chat with your Ozon data` is not enough as a commercial differentiator.

## 4. Candidate product differentiation that must be proven

The project has a potentially distinct proposition:

1. **Native preferred-AI surface** — customer keeps working in ChatGPT, Alice or another supported AI they already use rather than moving into another dashboard/AI SaaS.
2. **Replaceable AI worker** — same Bridge capability and same commercial benchmark can be used across different AI providers.
3. **Private cabinet + external/current context** — AI can investigate Ozon data together with current web/news/holiday/outage/incident context when required.
4. **Credential boundary** — AI does not receive Ozon credentials and cannot arbitrarily choose network targets; Bridge executes controlled allowlisted operations.
5. **Evidence-backed model support** — provider support can be sold based on a real benchmark of business questions instead of generic `works with AI` claims.

These are hypotheses until benchmarked.

## 5. Commercial Query Core V1

A 33-row canonical query core has been created across four segments:

- 13 `SELLER_STANDARD` queries;
- 6 `SELLER_PREMIUM` queries;
- 8 `SERVICE_STANDARD` queries;
- 6 `SERVICE_PREMIUM` queries.

The core contains business questions, not operation names.

Representative high-value questions:

- `Что сегодня в моём кабинете требует внимания в первую очередь?`
- `Почему вчера продажи резко просели? Найди наиболее вероятные причины.`
- `На складе Ozon был пожар. Был ли там мой товар и что с ним сейчас?`
- `У меня исчез товар с FBO без продаж. Разберись, куда он мог деться.`
- `Какие товары скоро закончатся, а какие лежат слишком долго?`
- `Почему товар есть в кабинете и на остатках, но покупателю недоступен?`
- `Почему вырос ДРР и какие кампании/товары сливают бюджет?`
- `Почему выплата меньше выручки? Разложи, куда ушли деньги.`
- `Какие товары реально продаются в минус?`
- `По каким запросам покупатели находят и покупают мои товары?`
- `Я покупаю продажи рекламой или органика уже работает?`
- `Сделай утренний аудит кабинета клиента.`
- `Подготовь отчёт к созвону с клиентом.`
- `Что изменилось после наших действий на прошлой неделе?`
- `Почему у клиента падают продажи: поиск, реклама, остатки, цена, карточка, логистика или внешний спрос?`
- `У какого из моих клиентов сегодня самая критичная проблема?`

## 6. Pre-test mapping to current Bridge

This section is a capability hypothesis, NOT a provider benchmark result.

Distribution of 33 core rows:

- `STRONG_CANDIDATE`: 12
- `CONDITIONAL_USER_DATA`: 5
- `PARTIAL_CANDIDATE`: 3
- `PRIVACY_OR_ENTITLEMENT_GATED`: 12
- `CURRENT_PRODUCT_GAP`: 1

Interpretation:

- 32/33 rows are not ruled out by current product/data architecture.
- This must NOT be advertised as `97% coverage`: many rows still require Premium, privacy gates, seller-side cost/plan context or have historical/causal limitations.
- Only live GPT-5.6 Sol + Bridge and Alice + Bridge testing can convert hypotheses into PASS/PARTIAL/FAIL/BLOCKED.

The one explicit current architectural gap in Core V1 is professional portfolio triage across several independent seller cabinets:

`У какого из моих клиентов сегодня самая критичная проблема и куда мне идти первым?`

Professional analytics products explicitly sell multi-store/multi-company views, so this gap is commercially meaningful for the service-provider segment.

## 7. Segment assessment before live testing

### SELLER_STANDARD — strongest immediate product hypothesis

Why:
- large evidence-backed demand;
- many required operations are standard Seller/Performance reads;
- straightforward value story: ask why sales/stock/ads/money changed without learning reports/API;
- fewer Premium gates than advanced search analytics.

Risks:
- historical forensic questions such as vanished FBO stock or old warehouse incidents may lack enough retained evidence;
- real profitability needs cost price/tax context not owned by Ozon.

### SELLER_PREMIUM — high analytical value

Why:
- search/query/position analytics turns worker from operational assistant into growth analyst;
- official Ozon materials validate the use cases.

Risks:
- exact available metrics depend on Ozon subscription/entitlement;
- organic-vs-paid causality may remain inferential.

### SERVICE_STANDARD — strong willingness-to-pay proxy

Why:
- daily audits, client reports, ad diagnostics, supplies and unit economics are already paid manager/agency jobs;
- AI can potentially compress several hours of manager analysis.

Risks:
- client plan/action context and cost price must be supplied somewhere;
- reliable reporting requires consistent period handling and no hallucinated explanations.

### SERVICE_PREMIUM — highest strategic value but highest bar

Why:
- combines search, ads, stock, price, content and external context into senior-analyst investigations;
- potentially most differentiated from dashboards.

Risks:
- Premium gates;
- causal reasoning quality;
- multi-client portfolio support currently incomplete.

## 8. What the product may eventually be able to sell — only if live benchmark passes

Candidate promise:

> `Ваш персональный AI-работник по Ozon в том ИИ, которым вы уже пользуетесь. Спросите обычным языком, что происходит в кабинете, почему изменились продажи, где заканчивается товар, куда уходит рекламный бюджет или что требует внимания. Работник сам получает нужные данные Ozon через защищённый Bridge, при необходимости проверяет внешний контекст и объясняет результат.`

This wording is NOT yet approved marketing copy. It is the proposition to validate.

## 9. What cannot yet be claimed

Before live benchmarks we cannot truthfully claim:

- that all 33 core queries are solved;
- that Alice performs close to GPT-5.6 Sol;
- that weaker AI providers can plan multi-step investigations;
- that every warehouse-loss incident can be reconstructed historically;
- that true profit is available without seller cost/tax input;
- that external events are proven causes rather than hypotheses;
- that multi-client agency portfolio monitoring is supported;
- that the product is superior to Ozon/inSales/Operesso.

## 10. Current product-gate verdict

### Demand existence
`PASS`

There is strong external evidence of recurring seller/manager jobs and willingness to pay for both human and software solutions.

### Conversational AI demand
`PASS`

Direct competitors and Ozon itself are deploying conversational AI over seller data.

### Differentiation
`UNPROVEN`

Native preferred-AI surface, external-context investigation and cross-model portability are promising but require benchmark evidence.

### Current Bridge data breadth
`PROMISING`

The accepted registry maps to most core data families, with known entitlement/privacy/user-data/historical limitations.

### Commercial core actually solved
`NOT YET PROVEN`

No live benchmark has yet converted the Core V1 rows into provider PASS/PARTIAL/FAIL/BLOCKED.

## 11. Next hard gate

Freeze/review Commercial Query Core V1, then run:

1. GPT-5.6 Sol + Ozon Bridge across the frozen core.
2. Analyze failures and separate AI vs Bridge/data gaps.
3. Run the same frozen core on Alice + Bridge.
4. Compare provider coverage row-by-row.
5. Only then decide whether to continue adapter expansion, what to improve, and what exact product can be sold.

Current checkpoint marker:

`COMMERCIAL_QUERY_CORE_V1_READY_FOR_OPERATOR_REVIEW_BEFORE_SOL_BENCHMARK`
