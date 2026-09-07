# Ozon AI Worker — continuous primary-gate run plan

Updated: 2026-09-06
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `SOL_PRIMARY_GATE_44_COMPLETE__CONTINUOUS_ROUTE_MOVED_TO_HARDENING`
Authority: `OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md` + row-level final evidence under `research/product/live-runs/`.
Gate-size authority: `OZON_AI_WORKER_PRIMARY_GATE_INDEX_2026-09-02.md`.
Batch authority: `OZON_AI_WORKER_EXPLICIT_BATCH_ORCHESTRATION_DEFECT_AND_RULE_2026-09-06.md`.

## Current execution rule

- Primary gate = exactly **44 current rows**: `STD-01..STD-20` + `CAP-01..CAP-24`.
- Historical/reserve `STD-21..STD-28` remain outside the primary gate.
- `NO_SKIP_ON_FAILURE`: a real provider/runtime/business-evidence blocker must be diagnosed, not silently skipped.
- One explicit Bridge business command must create at most one physical business request.
- For `N` explicit commands, at most `N` physical business requests are permitted.
- `EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS`: when multiple independent reads and all parameters are known upfront, emit multiple separate `OZON_API_V1` objects in one assistant response and let the Bridge execute the explicit sequential batch.
- Use conversation-stepwise execution only when the next command genuinely depends on prior output, such as cursor/`last_id`, discovered IDs, report code/file ref, a causal diagnosis, entitlement/privacy branch, or a stop condition.
- Never hide pagination, retry, fanout, polling, chaining, or capability probes.
- Never infer total inventory from one stock surface.
- Never convert `null`, unavailable attribution, or an empty parser output into a numeric zero without evidence.
- Runtime patching remains prohibited without explicit operator authorization.
- After a meaningful live result: classify -> persist evidence -> read back -> only then advance.

## Current route state

All 44 Sol primary-gate rows have reached terminal evidence-backed business classifications.

| # | ID | Business / capability test | Current route state |
|---:|---|---|---|
| 1 | STD-01 | Daily sales: revenue + ordered units | COMPLETE |
| 2 | STD-02 | Sales by day; 3 best and 3 worst days | COMPLETE |
| 3 | STD-03 | Top 20 products by revenue | COMPLETE |
| 4 | STD-04 | Compare two periods: revenue, units, % | COMPLETE |
| 5 | STD-05 | Explain a sharp sales drop | COMPLETE_WITH_LIMITS |
| 6 | STD-06 | What needs attention first today? | COMPLETE |
| 7 | STD-07 | What will run out, what is slow, what to replenish? | COMPLETE |
| 8 | STD-08 | Current stock by warehouse | COMPLETE |
| 9 | STD-09 | Yesterday's sales by warehouse | COMPLETE |
| 10 | STD-10 | Warehouse incident/fire: was seller stock there? | COMPLETE_POST_REPAIR |
| 11 | STD-11 | FBO item disappeared without sales | COMPLETE |
| 12 | STD-12 | Which supplies are active and what is happening with each? | COMPLETE |
| 13 | STD-13 | Supply arrived but was not accepted / not sellable | COMPLETE_WITH_PROVENANCE_LIMIT |
| 14 | STD-14 | Item has stock but is invisible / delivery unavailable | COMPLETE_NO_CURRENT_CASE_WITH_CONTRACT_GAP |
| 15 | STD-15 | Products/warehouses with delivery restrictions | COMPLETE_CURRENT_ZERO |
| 16 | STD-16 | Ad spend for 7 days; most expensive campaigns | COMPLETE |
| 17 | STD-17 | Campaigns/products wasting budget | COMPLETE |
| 18 | STD-18 | Paid ads on items running out / missing on needed warehouses | COMPLETE |
| 19 | STD-19 | Paid ads on weak/invisible cards | COMPLETE_WITH_WARNINGS |
| 20 | STD-20 | Why did DRR rise? Ads × sales | COMPLETE_WITH_TRANSIENT_429_RECOVERY |
| 21 | CAP-01 | Catalog / product inventory awareness | COMPLETE |
| 22 | CAP-02 | Product visibility awareness | COMPLETE |
| 23 | CAP-03 | Content/card quality awareness | COMPLETE |
| 24 | CAP-04 | Current stock by warehouse awareness | COMPLETE |
| 25 | CAP-05 | Stock turnover / stock analytics awareness | COMPLETE |
| 26 | CAP-06 | Warehouses / clusters / logistics geography | COMPLETE |
| 27 | CAP-07 | Supply-order list/status | COMPLETE |
| 28 | CAP-08 | Supply details / acceptance drill-down | COMPLETE |
| 29 | CAP-09 | FBO postings/orders | COMPLETE |
| 30 | CAP-10 | Prices / price details | COMPLETE |
| 31 | CAP-11 | Promotions/actions | COMPLETE |
| 32 | CAP-12 | Returns/cancellations | COMPLETE |
| 33 | CAP-13 | Finance balance/accruals | COMPLETE |
| 34 | CAP-14 | Finance transactions/reconciliation | COMPLETE |
| 35 | CAP-15 | Ratings / FBS error index | COMPLETE |
| 36 | CAP-16 | Reviews/questions aggregate | COMPLETE |
| 37 | CAP-17 | Advertising campaigns | COMPLETE |
| 38 | CAP-18 | Advertising statistics | COMPLETE |
| 39 | CAP-19 | Cross-surface orchestration | COMPLETE |
| 40 | CAP-20 | Bridge + external-world investigation | COMPLETE |
| 41 | CAP-21 | SEO / semantic core of own card | `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP` |
| 42 | CAP-22 | Competitor SEO / positioning benchmark | `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` |
| 43 | CAP-23 | Category/search position & coverage boundary | `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES` |
| 44 | CAP-24 | SKU monthly unit economics | `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` |

Detailed result truth belongs to the row-level final evidence and the primary live-result master; this route table is only the execution-state authority.

## Historical route checkpoint — superseded

Earlier versions of this plan stopped at a 43-row route and described STD-07 or later rows as the next execution point. That was correct only for the historical repair/resume stage.

Do **not** resume from:

- `PRIMARY_GATE_CONTINUOUS_ROUTE_LOCKED_NEXT_STD07...`
- the old STD-10 freeze;
- any `CAP-01 pending` / `CAP-23 pending` checkpoint;
- the old 40-row or 43-row gate size.

Those states are superseded by the current 44-row completion evidence.

## Important reliability findings retained for hardening

Completion does not erase recovery evidence. The consolidated hardening phase must preserve, at minimum:

1. provider 429 recovery behavior and the requirement not to skip the business job;
2. deterministic parameter/type repair where provider/Bridge mechanics are known;
3. pagination guidance and continuation semantics;
4. entitlement vs provider queryability vs data-readiness separation;
5. privacy-safe aggregation and opaque report-file provenance;
6. stock-surface semantic boundaries and cross-surface reconciliation;
7. `EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS` plus stepwise dependency discipline;
8. bounded capability discovery instead of invented operations;
9. Performance historical SKU-attribution limits;
10. report/XLSX parsing reliability and the remaining placement worksheet-observability boundary;
11. provider-role endpoint vs Bridge-registry capability coverage gaps;
12. AI-orchestration errors observed during the Sol pass, including malformed explicit batch construction and wrong historical endpoint choice.

## Exact next work

There is no next live primary-gate business row.

The next continuous route is:

### H1 — consolidated gap ledger

Read the final STD/CAP evidence and existing defect/requirement authorities; deduplicate findings by root cause and classify each as:

- `BRIDGE_EXECUTION_DEFECT`
- `BRIDGE_GUIDANCE_OR_RECOVERY_GAP`
- `BRIDGE_CAPABILITY_COVERAGE_GAP`
- `PROVIDER_ACCOUNT_ENTITLEMENT_OR_DATA_BOUNDARY`
- `AI_ORCHESTRATION_ERROR`
- `OUTPUT_OR_ARTIFACT_GAP`
- `NO_ACTION_REQUIRED / DOCUMENTED_LIMIT`

### H2 — coherent hardening design

For gaps that should be solved in Bridge, define one coherent machine-readable contract/guidance package rather than per-row prompt hacks.

Do not implement executable changes without explicit operator authorization.

### H3 — affected-row regression matrix

Map every proposed hardening item to the exact Sol rows it affected and define the minimum rerun set plus shared regressions.

### H4 — executable hardening, only after authorization

Implement authorized root-cause changes, preserving security/privacy and physical-request cardinality invariants.

### H5 — hardened Sol regression

Rerun all affected rows. Gate:

`SOL_44_TEST_GATE_HARDENED_REGRESSION_PASS`

Only after this gate may the same frozen business/capability suite be applied to Alice Free.

## Current checkpoint

`SOL_PRIMARY_GATE_44_COMPLETE__NEXT_H1_CONSOLIDATED_GAP_LEDGER__NO_NEW_BUSINESS_ROW`
