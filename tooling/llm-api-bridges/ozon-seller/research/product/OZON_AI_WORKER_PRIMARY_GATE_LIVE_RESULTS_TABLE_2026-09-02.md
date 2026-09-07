# Ozon AI Worker — Primary Gate Live Results Table

Updated: 2026-09-06
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `AUTHORITATIVE_TERMINAL_SOL_RESULTS__44_OF_44_ROWS_COMPLETE`
Scope: Ozon Standard / no Premium baseline, with entitlement/coverage boundaries recorded explicitly.
Rule: `NO_SKIP_ON_FAILURE`.
Gate policy: expandable only for materially distinct commercial capabilities.

This is the current terminal Sol result ledger. It supersedes the historical state in which STD-10 was frozen and later rows were marked `FROZEN` / `PENDING`.

Detailed run evidence and row-level final materializations remain under:
`research/product/live-runs/`

**Important:** `COMPLETE` does not mean first-attempt clean. Final classifications below deliberately preserve provider limits, entitlement boundaries, recovery incidents, Bridge guidance/capability gaps, operator interventions, and AI-orchestration mistakes where they were observed.

## Terminal 44-row primary gate

| # | ID | Business / capability question | Final Sol classification | Reliability / boundary summary | Final evidence authority |
|---:|---|---|---|---|---|
| 1 | STD-01 | Daily sales: revenue + ordered units | `PASS` | transient analytics 429 then recovered; operator diagnostic steering occurred | preserved STD-01 live evidence in `live-runs/` |
| 2 | STD-02 | Sales by day; 3 best and 3 worst days | `PASS` | first attempt 429 then exact repeat recovered | preserved STD-02 live evidence in `live-runs/` |
| 3 | STD-03 | Top 20 products by revenue | `PASS` | first-attempt provider success | preserved STD-03 live evidence in `live-runs/` |
| 4 | STD-04 | Compare two periods: revenue, units, % | `PASS` | first-attempt provider success | preserved STD-04 live evidence in `live-runs/` |
| 5 | STD-05 | Explain a sharp sales drop | `PASS_WITH_LIMITS` | multi-factor diagnosis; search freshness/queryability limit and multiple guidance/semantic lessons preserved | `live-runs/STD_05_*` evidence |
| 6 | STD-06 | What needs attention first today? | `PASS` | multi-surface manager audit completed; repaired finance dependency closed | `live-runs/STD_06_*` evidence |
| 7 | STD-07 | What will run out, what is slow, what to replenish? | `PASS` | safe three-surface replenishment logic; no one-stock-surface shortcut | `live-runs/STD_07_POST_REPAIR_FINAL_2026-09-05.md` |
| 8 | STD-08 | Current stock by warehouse | `PASS` | provider reads completed; pagination-guidance issue preserved | `live-runs/STD_08_POST_REPAIR_FINAL_2026-09-05.md` |
| 9 | STD-09 | Yesterday's sales by warehouse | `PASS` | FBO+FBS reconciliation complete; explicit operator privacy-setting intervention recorded | `live-runs/STD_09_POST_REPAIR_FBO_FBS_WAREHOUSE_SALES_2026-09-05.md` |
| 10 | STD-10 | Warehouse incident/fire: was seller stock there? | `PASS_WITH_EXPLICIT_INCIDENT_CAUSALITY_AND_HISTORICAL_SNAPSHOT_LIMITS` | empty warehouse-filter provider 400 contract-drift signal preserved; exact incident exposure proven without claiming causality | `live-runs/STD_10_POST_REPAIR_FINAL_2026-09-05.md` |
| 11 | STD-11 | FBO item disappeared without sales | `PASS` | exact reservation evidence explained the disappearance | `live-runs/STD_11_POST_REPAIR_FINAL_2026-09-05.md` |
| 12 | STD-12 | Which supplies are active and what is happening with each? | `PASS` | three explicit provider reads; complete active set with terminal `last_id` | `live-runs/STD_12_POST_REPAIR_FINAL_2026-09-05.md` |
| 13 | STD-13 | Supply arrived but was not accepted / not sellable | `PASS_WITH_EXPLICIT_PROVENANCE_LIMIT` | one transient FBO 429 recovered explicitly; current stock not falsely attributed to a specific supply | `live-runs/STD_13_POST_REPAIR_FINAL_2026-09-05.md` |
| 14 | STD-14 | Item has stock but is invisible / delivery unavailable | `PASS_NO_CURRENT_CASE_FOUND` | no current account case; `product_visibility_info {}` local/provider contract gap recorded | `live-runs/STD_14_POST_REPAIR_FINAL_2026-09-05.md` |
| 15 | STD-15 | Products/warehouses with delivery restrictions | `PASS_CURRENT_ZERO` | fresh dedicated diagnostic returned no affected warehouses; duplicate provider call avoided | `live-runs/STD_15_POST_REPAIR_FINAL_2026-09-05.md` |
| 16 | STD-16 | Ad spend for 7 days; most expensive campaigns | `PASS` | first-attempt Performance success; exact spend aggregation | `live-runs/STD_16_POST_REPAIR_FINAL_AD_SPEND_2026-09-05.md` |
| 17 | STD-17 | Campaigns/products wasting budget | `PASS` | CPC waste identified; CPO spend not falsely split per SKU | `live-runs/STD_17_POST_REPAIR_FINAL_2026-09-05.md` |
| 18 | STD-18 | Paid ads on items running out / missing on needed warehouses | `PASS` | zero/low FBO separated from total cross-channel stockout | `live-runs/STD_18_POST_REPAIR_FINAL_2026-09-05.md` |
| 19 | STD-19 | Paid ads on weak/invisible cards | `PASS_WITH_TWO_ADVERTISED_FAILED_UPDATE_WARNINGS_AND_UNIFORM_RICH_CONTENT_GAP` | current invisibility/delivery restriction was not fabricated; content-rating gap retained | `live-runs/STD_19_POST_REPAIR_FINAL_2026-09-05.md` |
| 20 | STD-20 | Why did DRR rise? Ads × sales | `PASS_WITH_RECORDED_TRANSIENT_ANALYTICS_429_RECOVERY` | claimed DRR increase rejected by evidence; identical analytics request recovered after provider 429 | `live-runs/STD_20_POST_REPAIR_FINAL_2026-09-05.md` |
| 21 | CAP-01 | Catalog / product inventory awareness | `PASS` | current catalog discovered without operator enumeration | `live-runs/CAP_01_POST_REPAIR_FINAL_2026-09-05.md` |
| 22 | CAP-02 | Product visibility awareness | `PASS` | dedicated visibility surface used for full current catalog | `live-runs/CAP_02_POST_REPAIR_FINAL_2026-09-05.md` |
| 23 | CAP-03 | Content/card quality awareness | `PASS` | dedicated content-rating surface; deterministic worst-card findings | `live-runs/CAP_03_POST_REPAIR_FINAL_2026-09-05.md` |
| 24 | CAP-04 | Current stock by warehouse awareness | `PASS` | FBO/FBS ID and stock-surface semantics preserved; known transport normalization retained | `live-runs/CAP_04_POST_REPAIR_FINAL_2026-09-05.md` |
| 25 | CAP-05 | Stock turnover / stock analytics awareness | `PASS_WITH_PROVIDER_OMISSION_LIMIT` | dedicated turnover surface omitted four SKUs; omission not interpreted as zero | `live-runs/CAP_05_POST_REPAIR_FINAL_2026-09-05.md` |
| 26 | CAP-06 | Warehouses / clusters / logistics geography | `PASS` | FBO fulfillment warehouse IDs kept distinct from seller warehouse IDs | `live-runs/CAP_06_POST_REPAIR_FINAL_2026-09-05.md` |
| 27 | CAP-07 | Supply-order list/status | `PASS` | current active supply set discovered and lifecycle progression preserved | `live-runs/CAP_07_POST_REPAIR_FINAL_2026-09-05.md` |
| 28 | CAP-08 | Supply details / acceptance drill-down | `PASS` | nested supply state distinguished from broader parent-order state | `live-runs/CAP_08_POST_REPAIR_FINAL_2026-09-05.md` |
| 29 | CAP-09 | FBO postings/orders | `PASS` | dedicated posting evidence; explicit analytics_data enrichment when warehouse fields were required | `live-runs/CAP_09_POST_REPAIR_FINAL_2026-09-05.md` |
| 30 | CAP-10 | Prices / price details | `PASS_WITH_ENTITLEMENT_BOUNDARY` | Premium-Pro details blocked before business request; all-account price surface used instead | `live-runs/CAP_10_POST_REPAIR_FINAL_2026-09-05.md` |
| 31 | CAP-11 | Promotions/actions | `PASS` | dedicated action + product participation surfaces, not embedded price metadata alone | `live-runs/CAP_11_POST_REPAIR_FINAL_2026-09-05.md` |
| 32 | CAP-12 | Returns/cancellations | `PASS` | explicit two-page continuation; actual cancellation rows kept separate from reason dictionary | `live-runs/CAP_12_POST_REPAIR_FINAL_2026-09-05.md` |
| 33 | CAP-13 | Finance balance/accruals | `PASS` | balance identity reconciled; sales flow not mislabeled as payout/balance | `live-runs/CAP_13_POST_REPAIR_FINAL_2026-09-05.md` |
| 34 | CAP-14 | Finance transactions/reconciliation | `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY` | finance type dictionary returned two 429s before explicit recovery; no hidden retry | `live-runs/CAP_14_POST_REPAIR_FINAL_2026-09-06.md` |
| 35 | CAP-15 | Ratings / FBS error index | `PASS` | aggregate/current index and historical affected postings separated correctly | `live-runs/CAP_15_POST_REPAIR_FINAL_2026-09-06.md` |
| 36 | CAP-16 | Reviews/questions aggregate | `PASS_WITH_ENTITLEMENT_BOUNDARIES_AND_REVIEW_ENTITLEMENT_GUIDANCE_GAP` | review 403 not interpreted as zero; roles/entitlement evidence retained | `live-runs/CAP_16_POST_REPAIR_FINAL_2026-09-06.md` |
| 37 | CAP-17 | Advertising campaigns | `PASS` | 1128 campaign inventory completed with explicit pagination; no hidden autopagination | `live-runs/CAP_17_POST_REPAIR_FINAL_2026-09-06.md` |
| 38 | CAP-18 | Advertising statistics | `PASS_WITH_PRODUCT_LEVEL_COVERAGE_AND_GUIDANCE_GAP` | Performance metrics completed; product-level/guidance boundary retained | `live-runs/CAP_18_POST_REPAIR_FINAL_2026-09-06.md` |
| 39 | CAP-19 | Cross-surface orchestration | `PASS_WITH_STOCK_PROVIDER_OMISSION_LIMIT` | ad-to-stock join completed; absent stock row not converted to zero | `live-runs/CAP_19_POST_REPAIR_FINAL_2026-09-06.md` |
| 40 | CAP-20 | Bridge + external-world investigation | `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY` | seller/private evidence separated from public context; one transient analytics 429 recovered | `live-runs/CAP_20_POST_REPAIR_FINAL_2026-09-06.md` |
| 41 | CAP-21 | SEO / semantic core of own card | `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP` | factual own-card/query evidence; no invented market queries/rank | `live-runs/CAP_21_POST_REPAIR_FINAL_2026-09-06.md` |
| 42 | CAP-22 | Competitor SEO / positioning benchmark | `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` | no defensibly linked target-specific competitor card set; partial kept partial | `live-runs/CAP_22_POST_REPAIR_FINAL_2026-09-06.md` |
| 43 | CAP-23 | Category/search position & coverage boundary | `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES` | `position=null` not converted to zero; Premium/Bridge category-position limits explicit | `live-runs/CAP_23_POST_REPAIR_FINAL_2026-09-06.md` |
| 44 | CAP-24 | SKU monthly unit economics | `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` | exact finance core complete; historical ad membership and placement amount remain explicit coverage boundaries | `live-runs/CAP_24_POST_REPAIR_FINAL_2026-09-06.md` |

## Gate completion

Terminal business/capability classification coverage:

- STD rows complete: **20 / 20**
- CAP rows complete: **24 / 24**
- total primary gate complete: **44 / 44**
- remaining `PENDING` primary-gate rows: **0**
- remaining `FROZEN` primary-gate rows: **0**

This is a **Sol evidence-completion gate**, not a declaration that Bridge hardening is complete.

## Cross-row reliability state

Observed outcomes that require consolidated treatment before Alice include, without limitation:

- transient provider rate-limit behavior and deterministic recovery guidance;
- parameter/type repair guidance and local/provider contract drift;
- pagination and explicit continuation semantics;
- entitlement vs permission vs data-readiness/queryability distinctions;
- privacy-safe aggregation / opaque file provenance;
- stock-surface semantic boundaries and provider omissions;
- explicit batching for independent known-upfront reads vs dependent stepwise orchestration;
- provider-role endpoint vs Bridge-registry capability gaps;
- Performance historical SKU attribution limits;
- report/XLSX parser reliability and worksheet observability;
- AI-orchestration mistakes observed during CAP-24, which must be separated from Bridge/provider failures.

## Historical freeze supersession

The prior checkpoint:

`PRIMARY_GATE_43_FROZEN_AFTER_STD10_RUN11_REPAIRED_26_READS_LIVE_GATE_ACTIVE...`

is historical and superseded.

The current restart point is not STD-10, STD-12, CAP-01, CAP-21, CAP-24, or another business test.

## Current checkpoint

`PRIMARY_GATE_44_SOL_TERMINAL_RESULTS_COMPLETE__NEXT_CONSOLIDATED_GAP_LEDGER_AND_HARDENING_DESIGN`
