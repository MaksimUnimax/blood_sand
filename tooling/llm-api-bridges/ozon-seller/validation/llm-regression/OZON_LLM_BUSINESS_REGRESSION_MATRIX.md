# Ozon Seller Bridge — cross-LLM business regression matrix

Status: CURRENT 44-ROW CROSS-LLM AUTHORITY
Date: 2026-09-12
Canonical source: `research/product/OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`
Canonical source state: `Updated: 2026-09-06` / `AUTHORITATIVE_TERMINAL_SOL_RESULTS__44_OF_44_ROWS_COMPLETE`

This is the compact cross-LLM view. Detailed prompts, required results, transcript evidence, and run history belong in the dedicated document for each target LLM.

## Accounting

| Measure | Sol/GPT baseline | Alice |
|---|---:|---:|
| Defined canonical tests | 44 | 44 |
| STD | 20/20 terminal | 0/20 evidenced |
| CAP | 24/24 terminal | 0/24 evidenced |
| Total transcript/evidence status | 44/44 terminal baseline | 0/44 / NOT_RUN |
| Live certification implied by this table | No | No |

## Exact terminal 44-row matrix

| # | ID | Business / capability question | Sol/GPT terminal baseline | Alice latest | Alice evidence | Regression delta |
|---:|---|---|---|---|---|---|
| 1 | STD-01 | Daily sales: revenue + ordered units | PASS | NOT_RUN | — | — |
| 2 | STD-02 | Sales by day; 3 best and 3 worst days | PASS | NOT_RUN | — | — |
| 3 | STD-03 | Top 20 products by revenue | PASS | NOT_RUN | — | — |
| 4 | STD-04 | Compare two periods: revenue, units, % | PASS | NOT_RUN | — | — |
| 5 | STD-05 | Explain a sharp sales drop | PASS_WITH_LIMITS | NOT_RUN | — | — |
| 6 | STD-06 | What needs attention first today? | PASS | NOT_RUN | — | — |
| 7 | STD-07 | What will run out, what is slow, what to replenish? | PASS | NOT_RUN | — | — |
| 8 | STD-08 | Current stock by warehouse | PASS | NOT_RUN | — | — |
| 9 | STD-09 | Yesterday's sales by warehouse | PASS | NOT_RUN | — | — |
| 10 | STD-10 | Warehouse incident/fire: was seller stock there? | PASS_WITH_EXPLICIT_INCIDENT_CAUSALITY_AND_HISTORICAL_SNAPSHOT_LIMITS | NOT_RUN | — | — |
| 11 | STD-11 | FBO item disappeared without sales | PASS | NOT_RUN | — | — |
| 12 | STD-12 | Which supplies are active and what is happening with each? | PASS | NOT_RUN | — | — |
| 13 | STD-13 | Supply arrived but was not accepted / not sellable | PASS_WITH_EXPLICIT_PROVENANCE_LIMIT | NOT_RUN | — | — |
| 14 | STD-14 | Item has stock but is invisible / delivery unavailable | PASS_NO_CURRENT_CASE_FOUND | NOT_RUN | — | — |
| 15 | STD-15 | Products/warehouses with delivery restrictions | PASS_CURRENT_ZERO | NOT_RUN | — | — |
| 16 | STD-16 | Ad spend for 7 days; most expensive campaigns | PASS | NOT_RUN | — | — |
| 17 | STD-17 | Campaigns/products wasting budget | PASS | NOT_RUN | — | — |
| 18 | STD-18 | Paid ads on items running out / missing on needed warehouses | PASS | NOT_RUN | — | — |
| 19 | STD-19 | Paid ads on weak/invisible cards | PASS_WITH_TWO_ADVERTISED_FAILED_UPDATE_WARNINGS_AND_UNIFORM_RICH_CONTENT_GAP | NOT_RUN | — | — |
| 20 | STD-20 | Why did DRR rise? Ads × sales | PASS_WITH_RECORDED_TRANSIENT_ANALYTICS_429_RECOVERY | NOT_RUN | — | — |
| 21 | CAP-01 | Catalog / product inventory awareness | PASS | NOT_RUN | — | — |
| 22 | CAP-02 | Product visibility awareness | PASS | NOT_RUN | — | — |
| 23 | CAP-03 | Content/card quality awareness | PASS | NOT_RUN | — | — |
| 24 | CAP-04 | Current stock by warehouse awareness | PASS | NOT_RUN | — | — |
| 25 | CAP-05 | Stock turnover / stock analytics awareness | PASS_WITH_PROVIDER_OMISSION_LIMIT | NOT_RUN | — | — |
| 26 | CAP-06 | Warehouses / clusters / logistics geography | PASS | NOT_RUN | — | — |
| 27 | CAP-07 | Supply-order list/status | PASS | NOT_RUN | — | — |
| 28 | CAP-08 | Supply details / acceptance drill-down | PASS | NOT_RUN | — | — |
| 29 | CAP-09 | FBO postings/orders | PASS | NOT_RUN | — | — |
| 30 | CAP-10 | Prices / price details | PASS_WITH_ENTITLEMENT_BOUNDARY | NOT_RUN | — | — |
| 31 | CAP-11 | Promotions/actions | PASS | NOT_RUN | — | — |
| 32 | CAP-12 | Returns/cancellations | PASS | NOT_RUN | — | — |
| 33 | CAP-13 | Finance balance/accruals | PASS | NOT_RUN | — | — |
| 34 | CAP-14 | Finance transactions/reconciliation | PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY | NOT_RUN | — | — |
| 35 | CAP-15 | Ratings / FBS error index | PASS | NOT_RUN | — | — |
| 36 | CAP-16 | Reviews/questions aggregate | PASS_WITH_ENTITLEMENT_BOUNDARIES_AND_REVIEW_ENTITLEMENT_GUIDANCE_GAP | NOT_RUN | — | — |
| 37 | CAP-17 | Advertising campaigns | PASS | NOT_RUN | — | — |
| 38 | CAP-18 | Advertising statistics | PASS_WITH_PRODUCT_LEVEL_COVERAGE_AND_GUIDANCE_GAP | NOT_RUN | — | — |
| 39 | CAP-19 | Cross-surface orchestration | PASS_WITH_STOCK_PROVIDER_OMISSION_LIMIT | NOT_RUN | — | — |
| 40 | CAP-20 | Bridge + external-world investigation | PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY | NOT_RUN | — | — |
| 41 | CAP-21 | SEO / semantic core of own card | PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP | NOT_RUN | — | — |
| 42 | CAP-22 | Competitor SEO / positioning benchmark | PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY | NOT_RUN | — | — |
| 43 | CAP-23 | Category/search position & coverage boundary | PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES | NOT_RUN | — | — |
| 44 | CAP-24 | SKU monthly unit economics | PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY | NOT_RUN | — | — |

## Update policy

1. Update a target LLM column only from transcript-backed evidence.
2. Keep the canonical ID/business objective aligned to the terminal Sol 44-row authority; do not renumber or substitute another capability taxonomy.
3. Maintain a dedicated per-LLM suite containing prompt, required result, detailed verdict, and raw dialogue evidence.
4. Never erase an earlier target run. Append a run record and update only the compact `latest` view here.
5. Record regression as semantic delta, not merely HTTP status delta.
6. Classify failures separately as LLM, Bridge, provider/account/data, target UI, or invalid run; do not charge a provider/Bridge failure to the LLM without evidence.

Current Alice authority: `ALICE_BUSINESS_REGRESSION_SUITE.md`.