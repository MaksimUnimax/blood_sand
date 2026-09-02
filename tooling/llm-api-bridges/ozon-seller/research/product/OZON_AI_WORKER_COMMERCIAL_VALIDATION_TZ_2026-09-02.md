# Ozon AI Worker — Commercial Validation TZ

Date: 2026-09-02
Status: ACTIVE PRODUCT GATE
Branch: `research/ozon-product-demand-2026-09-02`

## 1. Why this work exists

This document defines the product-validation task that must be completed before further product expansion is treated as commercially justified.

The central question is not whether Ozon Bridge can call many API methods. The central question is:

> Is there a sufficiently valuable, recurring, evidence-backed set of real user business questions that can be sold as a product, and can an AI worker using Ozon Bridge actually answer those questions reliably enough across supported AI providers?

This is a hard product gate. Multi-AI implementation work is paused separately. The project should not advance merely because more adapters or endpoints can be added. We first need to understand exactly what is being sold and whether the core value proposition is real.

## 2. Product being evaluated

The product is NOT the browser extension in isolation.

The product is:

**user → preferred AI → Ozon Bridge → Ozon cabinet data + public web/context + AI analysis → business answer**

The extension is the AI worker's controlled hands/eyes inside Ozon. The user speaks in normal business language and does not need to know Seller API, Performance API, operation aliases, parameters, endpoint names or the structure of Ozon reports.

The AI decides what evidence is needed, which source can provide it, what should be requested from Bridge, what public/external information should be checked, what comparisons/calculations should be made, and how confident the final conclusion can be.

Examples of the intended interaction:

- `На складе Ozon был пожар. У меня там что-то пострадало?`
- `Почему вчера продажи были, а позавчера почти не было?`
- `Почему у меня вырос ДРР?`
- `Что сейчас самое проблемное в кабинете?`
- `Какие товары скоро закончатся?`
- `Почему товар перестал показываться покупателям?`
- `Что изменилось за последнюю неделю и на что мне обратить внимание?`

A valid answer may combine one or more explicit Bridge reads, AI analysis, calculations, public Ozon announcements, calendar/seasonality context, market/news context and other safe sources available to the AI.

## 3. Evaluation unit

The unit of coverage is a **user business question / job-to-be-done**, not an API endpoint.

Do not classify a question as unsupported merely because one endpoint cannot answer it. The AI worker may perform an investigation using multiple explicit steps and external evidence.

Do not classify a question as supported merely because one endpoint returns related data. Support means the user can receive a materially useful business answer with evidence and appropriate uncertainty.

## 4. Segments

The research and query core must be divided into four required segments:

1. `SELLER_STANDARD` — Ozon seller without paid Premium analytics entitlement.
2. `SELLER_PREMIUM` — Ozon seller with Premium / Premium Plus / Premium Pro capabilities where relevant.
3. `SERVICE_STANDARD` — manager, freelancer, agency or other service provider that operates/analyses seller cabinets without relying on Premium-only data.
4. `SERVICE_PREMIUM` — the same professional operator with Premium analytics capabilities available in the seller cabinet.

Where Ozon distinguishes Premium, Premium Plus and Premium Pro, record the exact known dependency instead of flattening it when evidence is available.

## 5. Research rule: demand first, product second

Do not invent a wish-list from the existing operation registry.

First collect real evidence of seller/manager demand from sources such as:

- seller forums and discussions;
- seller communities and public chats/channels;
- Ozon official seller materials and announcements;
- marketplace-management agencies and freelancers describing paid work;
- analytics products marketed to Ozon sellers;
- public case studies;
- educational articles that describe actual operational work;
- public job/role descriptions when useful.

Then normalize recurring real problems into natural-language questions an operator could realistically ask their AI worker.

Only after that map the demand to current Ozon Bridge capabilities.

## 6. What qualifies for the commercial query core

A query should enter the commercial core only when it meets the following standard:

- evidence of a real recurring pain/job exists;
- the outcome has meaningful operational or financial value;
- a normal seller/manager can plausibly formulate it without API knowledge;
- it is testable with a defined evidence expectation;
- it belongs to one or more of the four target segments;
- it is relevant to a read/analysis AI worker, even if final execution/action remains manual;
- it is sufficiently important that failure to solve it would weaken the product's commercial proposition.

The core must include both straightforward fact retrieval and multi-source diagnostic questions. The latter are critical because the product value is the AI worker's ability to investigate, not merely expose raw API data.

## 7. Required core table

The final core table must support comparative AI testing. At minimum each row must contain:

- stable query ID;
- segment;
- Premium requirement / entitlement note;
- natural-language user query;
- business job / why the user pays for it;
- demand evidence source(s);
- demand strength / recurrence assessment;
- required evidence classes (Bridge clusters, external web, calendar/event context, user-provided context, calculations, etc.);
- expected investigation outline without hardcoding an API command;
- current Bridge capability hypothesis: `STRONG`, `PARTIAL`, `GAP`, `UNKNOWN`;
- current product-answerability hypothesis for GPT-5.6 Sol + Bridge;
- **GPT-5.6 Sol live-test result** (initially `PENDING_LIVE_TEST`);
- **Alice live-test result** (initially `PENDING_LIVE_TEST`);
- future columns for every subsequently supported AI provider;
- failure reason / missing capability;
- product/Bridge/adapter work required if failed;
- final commercial-core disposition after testing.

Do not convert pre-test hypotheses into PASS results. A provider column becomes PASS only after the actual test is performed with the Bridge and the expected business answer is evaluated.

## 8. Required test order after research

The commercial core is frozen before provider benchmarking.

Test sequence:

1. GPT-5.6 Sol + Ozon Bridge — strongest baseline worker.
2. Alice + Ozon Bridge — existing second provider baseline.
3. Other AI providers one by one after their adapter/evidence work is ready.

The same query wording and materially equivalent test fixture should be used across providers where possible.

For every row record:

- whether the AI understood the user's business intent;
- whether it selected an appropriate investigation strategy;
- whether Bridge requests were valid and safe;
- whether it requested missing information only when actually necessary;
- whether it found useful external context when appropriate;
- whether it distinguished fact from hypothesis;
- whether the final answer was actionable and understandable;
- whether any hallucinated cabinet facts or unsupported causal claims appeared;
- whether the query should be considered commercially supported on that provider.

## 9. Important product interpretation

The AI worker may use public external context when it materially helps answer the seller's question.

Example: warehouse incident.

A question such as `На складе был пожар. У меня что-нибудь пострадало?` must not be reduced to one stock endpoint. The worker may identify the actual affected warehouse and event window from reliable public/Ozon sources, inspect the user's stock/warehouse state through Bridge, correlate impacted SKUs/locations/status changes and explain what is known, unknown and what evidence is still pending.

Example: sales anomaly.

A question such as `Почему вчера продажи были, а позавчера нет?` may require comparison of sales, stocks, visibility, advertising, price/promotion state, delivery/logistics and external context such as an outage, holiday, seasonality or large marketplace event. External correlation is a hypothesis unless evidence supports causation.

## 10. Read-only boundary

Current product validation concerns an AI worker that primarily reads, investigates, explains and recommends.

A query may be commercially supported even when the final action is manual, for example:

- identify the campaigns wasting budget and recommend what to change;
- identify where to replenish stock and why;
- explain which listing attributes/search queries likely need attention;
- identify unexplained finance discrepancies for escalation.

Do not claim the worker changed prices, bids, promotions, cards or supplies unless a future separately approved write layer actually exists.

## 11. Product-gate decision after benchmark

After GPT-5.6 Sol and Alice testing, produce a decision document answering:

- Is the commercial query core large and valuable enough to sell?
- What percentage is solved strongly by GPT-5.6 Sol + Bridge?
- What percentage is solved strongly by Alice + Bridge?
- Which failures are Bridge capability gaps vs AI reasoning/adapter gaps vs unavailable Ozon data vs missing user business data?
- Which segment has the strongest initial commercial proposition?
- What exactly can marketing/sales truthfully promise today?
- Which small set of improvements unlocks the greatest additional commercial coverage?
- Is continued multi-AI development justified?

No product expansion should be justified solely by endpoint count or provider count.

## 12. Current authoritative product framing

> Each customer gets their own Ozon AI worker inside the AI they already prefer to use. The worker can be asked ordinary business questions about the seller cabinet. Ozon Bridge gives the AI controlled access to cabinet data; the AI decides what information to request, combines it with analysis and external context where useful, and returns a business answer instead of raw API data.

This framing is authoritative for the current commercial-demand research unless explicitly changed by the operator.
