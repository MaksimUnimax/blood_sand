# Ozon AI + Bridge — Product Coverage Model

Date: 2026-09-02
Status: RESEARCH_MODEL_ACTIVE
Base production source: `516ecf140538ad2838d39dcd01c7428efc1880d3`

## Product definition

The product is **not the browser extension/API bridge in isolation**.

The product is a personal AI worker for an Ozon seller or a seller-service professional, operating inside the AI interface the user already prefers.

Canonical interaction:

`operator business question -> AI decides what it needs to investigate -> Bridge retrieves private Ozon account data -> AI may add public/current context -> AI analyses the evidence -> AI answers in business language`

The operator is not expected to know Ozon API endpoint names, operation aliases, parameters, schemas or which source is required.

The AI is the reasoning/orchestration layer. The Bridge is the controlled data-access layer — effectively the worker's hands for private Ozon data.

## What “manages the cabinet” means in the current product

Current accepted product surface is read-oriented. Therefore the worker currently "manages" the cabinet in the sense that it can:

- observe current state;
- answer operational questions;
- investigate incidents and anomalies;
- analyse sales, stocks, logistics, finance, search and advertising data;
- explain what changed and why the evidence points to particular causes;
- combine account data with legitimate public/current context;
- recommend what the operator should inspect or do next.

It must **not** be described as already changing prices, campaigns, stocks, shipments or other seller state unless such write capabilities are explicitly implemented and accepted later.

## Unit of product coverage

The unit of coverage is a **real user business question / job-to-be-done**, not an endpoint.

Correct question for research:

> Can the AI worker, using the current Bridge capabilities plus legitimate external/public context and its own analysis, produce a useful evidence-based answer to this operator question?

Incorrect question:

> Is there one endpoint that directly returns the answer?

A multi-source investigation can be fully covered even when no single endpoint corresponds to the user's wording.

## Example — warehouse fire

User:

> "Сгорели склады Ozon. У меня что-нибудь пострадало?"

Correct worker behavior can include:

1. Find current public/official information about the incident: exact warehouse/logistics center, dates, region/cluster, operational consequences and Ozon statements.
2. Use Bridge data to inspect the seller's relevant stocks, warehouse distribution, supply/posting state and visible symptoms associated with that location/cluster where current API data allows it.
3. Compare the seller-specific evidence against the incident timeline.
4. Explain what is proven, what is only a hypothesis and what information may not yet have settled in Ozon systems.
5. Give the operator a concrete conclusion and next checks.

There does not need to be a `warehouse_fire_damage` API operation for this business question to be product-covered.

## Example — sales disappeared on one day

User:

> "Почему вчера были продажи, а позавчера нет?"

The worker can investigate rather than merely return a sales metric:

- confirm the sales anomaly through Seller API data;
- inspect stock availability and visibility;
- inspect advertising activity/performance where Performance API data is available;
- inspect price/promotion or rating/logistics evidence where relevant;
- compare with calendar/date context, holidays, large public events or other external factors when there is credible evidence;
- rank likely explanations instead of pretending one causal factor is proven.

The product value is the investigation and conclusion, not the raw endpoint output.

## Target user structure for demand research

Two account-access levels:

1. Seller without Ozon Premium-class analytics entitlement.
2. Seller with Premium / Premium Plus / Premium Pro where relevant.

Two user roles inside each level:

A. Seller / business owner / in-house operator.
B. Professional serving sellers: account manager, marketplace manager, advertising specialist, analyst, agency or similar service provider.

This creates four research segments:

1. Seller — non-Premium.
2. Seller — Premium.
3. Seller-service professional — non-Premium client/account.
4. Seller-service professional — Premium client/account.

## Required research method

Do not invent feature ideas first.

Collect real demand from observable materials such as:

- seller forums;
- public seller chats/communities;
- articles and case studies;
- agency/analyst materials;
- Ozon seller education/help/news materials;
- public discussions of actual operational incidents, advertising problems, stock problems, finance/reconciliation problems, logistics problems and search/visibility problems.

For every demand item preserve the evidence source and normalize it into the way a real operator would ask the AI worker in plain language.

Then map each request against the complete product system, not Bridge alone.

## Coverage classification

- `FULLY_COVERED` — current AI + Bridge + legitimate contextual/web evidence can answer the business question usefully.
- `COVERED_WITH_UNCERTAINTY` — useful investigation and ranked diagnosis are possible, but one unique cause cannot be proven.
- `ENTITLEMENT_LIMITED` — technically supportable, but required Ozon data depends on Premium/other entitlement.
- `PRIVACY_GATED` — supportable only when the relevant personal-data read gate is enabled.
- `DATA_PENDING` — required Ozon data exists conceptually but has not yet settled/published; worker can still state what is known and what is pending.
- `NOT_COVERED` — no legitimate current data path lets the worker answer usefully.

## Core product proposition

> Give the Ozon seller or seller-service professional a personal AI worker inside the AI they already use. They ask ordinary business questions; the AI independently decides what seller-account data and public context it needs, uses Ozon Bridge as its controlled hands, analyses the evidence and returns an actionable answer.

This product proposition is the authority for the demand/coverage research phase.