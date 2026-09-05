# Ozon AI Worker — continuous primary-gate run plan

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Status: ACTIVE EXECUTION ROUTE
Authority: `OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md` + current exact repaired v0.1.19 artifact.

## Execution rule

- Primary gate = exactly 43 rows: `STD-01..STD-20` + `CAP-01..CAP-23`.
- Historical/reserve `STD-21..STD-28` are not part of this primary gate.
- Execute one explicit Bridge business command at a time.
- On each successful result: classify, preserve evidence, and immediately issue the next required command/run without pausing for operator permission.
- A multi-read business test is still one test; execute its reads sequentially, one command at a time, until the business question is actually answered.
- Stop only on a real provider/runtime failure, unresolved safety/privacy/entitlement gate, or missing dependency that would make the next command a guess.
- Never hide pagination/fanout/retry. One logical command must remain one physical business request unless an explicitly documented workflow says otherwise.
- Never infer total inventory from a single stock surface.
- Runtime patching remains prohibited without explicit operator authorization.

## Current restart position

DEFECT-015 post-install `finance_balance` rerun passed on repaired exact artifact:
- request id `9daa5629-bd39-452a-a0c0-10667d96399a`;
- `POST /v1/finance/balance`;
- HTTP 200;
- `external_request_executed=true`;
- `exact_request_preserved=true`;
- `command_transformed=false`;
- 1 logical business result / 1 physical business request;
- no capability probe.

STD-06 post-repair finance dependency is therefore closed. The external-Ozon context check is non-Bridge evidence and must be completed before advancing. After that, next Bridge business test is `STD-07`, beginning with the turnover surface.

## Authoritative 43-row route

| # | ID | Business/capability test | Why it exists | Required ranking / ordering discipline |
|---:|---|---|---|---|
| 1 | STD-01 | Daily sales: revenue + ordered units | Prove basic sales analytics and arithmetic | Totals; no fixed row sort |
| 2 | STD-02 | Sales by day; 3 best and 3 worst days | Prove time-series calculation and ranking | Chronological series + best 3 DESC + worst 3 ASC |
| 3 | STD-03 | Top 20 products by revenue | Prove SKU-level revenue ranking | Revenue DESC, top 20 |
| 4 | STD-04 | Compare two periods: revenue, units, % | Prove comparable-period arithmetic | Period order fixed; delta/contribution, not provider row order |
| 5 | STD-05 | Explain a sharp sales drop | Prove multi-factor diagnosis without invented causality | Rank hypotheses/findings by evidence strength and business impact |
| 6 | STD-06 | What needs attention first today? | Prove manager-style cabinet audit across sales, stock, supply, finance, ratings, external context | Priority DESC by urgency × impact × evidence |
| 7 | STD-07 | What will run out, what is slow, what to replenish? | Prove safe replenishment logic across turnover + total FBO/FBS + inbound supply | Low cover / FBO risk first; slow/CRITICAL/NOSALES separated; never use one stock surface alone |
| 8 | STD-08 | Current stock by warehouse | Prove current warehouse inventory aggregation | Warehouse free stock DESC |
| 9 | STD-09 | Yesterday's sales by warehouse | Prove FBO+FBS warehouse attribution and reconciliation to sales total | Revenue/units by warehouse DESC |
| 10 | STD-10 | Warehouse incident/fire: was seller stock there? | Prove forensic correlation of external incident + seller private evidence | Chronological/event relevance; affected warehouse/SKU first |
| 11 | STD-11 | FBO item disappeared without sales | Prove reservation/removal/transfer forensic reasoning | Chronological state transition; exact matching posting/reservation first |
| 12 | STD-12 | Which supplies are active and what is happening with each? | Prove supply-order inventory/status awareness | Prefer newest/recently changed active orders; exact API supports supply sort controls below |
| 13 | STD-13 | Supply arrived but was not accepted / not sellable | Prove acceptance-chain drill-down | Chronological supply status/acceptance chain |
| 14 | STD-14 | Item has stock but is invisible / delivery unavailable | Prove visibility + stock + delivery troubleshooting | Blocking causes first, then evidence-backed alternatives |
| 15 | STD-15 | Products/warehouses with delivery restrictions | Prove logistics restriction awareness | Most affected/highest-risk restrictions first |
| 16 | STD-16 | Ad spend for 7 days; most expensive campaigns | Prove Performance read + spend aggregation | Spend DESC |
| 17 | STD-17 | Campaigns/products wasting budget | Prove ads × sales/result cross-analysis | Waste priority: high spend + weak result first |
| 18 | STD-18 | Paid ads on items running out / missing on needed warehouses | Prove ads × stock risk orchestration | Paid-traffic × low-stock risk DESC |
| 19 | STD-19 | Paid ads on weak/invisible cards | Prove ads × card visibility/content cross-check | Spend-at-risk / card-problem severity DESC |
| 20 | STD-20 | Why did DRR rise? Ads × sales | Prove numerator/denominator decomposition | Rank drivers by contribution to DRR change |
| 21 | CAP-01 | Catalog / product inventory awareness | Prove worker can enumerate/identify seller products safely | No fixed sort; stable identifiers over presentation order |
| 22 | CAP-02 | Product visibility awareness | Prove visibility-state interpretation | Blocked/invisible/problem states before healthy states |
| 23 | CAP-03 | Content/card quality awareness | Prove card-content/quality interpretation | Lowest-quality/highest-impact cards first when ranking is requested |
| 24 | CAP-04 | Current stock by warehouse awareness | Prove warehouse-level stock surface | Warehouse stock DESC when asked for ranking |
| 25 | CAP-05 | Stock turnover / stock analytics awareness | Prove turnover semantics and stock-surface boundaries | Low cover first for risk; highest IDC/CRITICAL/NOSALES first for overstock |
| 26 | CAP-06 | Warehouses / clusters / logistics geography | Prove warehouse/cluster/logistics mapping | Geographic/business grouping; no universal fixed sort |
| 27 | CAP-07 | Supply-order list/status | Prove active supply enumeration and state handling | API sort controls: `ORDER_CREATION`, `ORDER_STATE_UPDATED_AT`, `TIMESLOT_FROM_UTC`, `TIMESLOT_FROM_LOCAL`; direction `ASC|DESC` |
| 28 | CAP-08 | Supply details / acceptance drill-down | Prove per-supply status/content/acceptance traversal | Chronological status chain; no universal fixed provider sort |
| 29 | CAP-09 | FBO postings/orders | Prove posting/order evidence retrieval | Where supported, `sort_dir=ASC|DESC`; use requested chronology explicitly |
| 30 | CAP-10 | Prices / price details | Prove price state and price-detail interpretation | Business ranking by price gap/problem severity, not arbitrary API order |
| 31 | CAP-11 | Promotions/actions | Prove promotion participation/state awareness | Active/current first; then relevant dates/impact |
| 32 | CAP-12 | Returns/cancellations | Prove return/cancel reason analysis | Frequency/financial impact DESC; chronology when investigating an event |
| 33 | CAP-13 | Finance balance/accruals | Prove current balance/accrual surface and exact date contract | No row sort; arithmetic reconciliation |
| 34 | CAP-14 | Finance transactions/reconciliation | Prove transaction-level financial reconciliation | Chronological ledger + amount/driver ranking as needed |
| 35 | CAP-15 | Ratings / FBS error index | Prove seller-health/rating awareness | Worst/problem indicators first |
| 36 | CAP-16 | Reviews/questions aggregate | Prove feedback surface and privacy discipline | `review_list` / `question_list` support `sort_dir=ASC|DESC`; comments also `ASC|DESC` |
| 37 | CAP-17 | Advertising campaigns | Prove Performance campaign inventory/currentness | Business sort depends on task: spend/date/status; do not invent unsupported provider sort |
| 38 | CAP-18 | Advertising statistics | Prove Performance metrics/statistics interpretation | Spend/result/KPI ranking explicit in business answer |
| 39 | CAP-19 | Cross-surface orchestration | Prove safe joins across Seller/Performance surfaces | Ranking follows the business question; preserve source semantics |
| 40 | CAP-20 | Bridge + external-world investigation | Prove private cabinet + public/current external evidence correlation | External events by relevance/recency; seller evidence remains primary for private facts |
| 41 | CAP-21 | SEO / semantic core of own card | Prove own-card search-query/SEO analysis where entitled | Product-query sort: `BY_SEARCHES|BY_VIEWS|BY_POSITION|BY_CONVERSION|BY_GMV`; direction `DESCENDING|ASCENDING` |
| 42 | CAP-22 | Competitor SEO / positioning benchmark | Prove competitive search/positioning analysis within coverage | Marketplace-query sort: `CLIENT_COUNT|ADD_TO_CART|CONVERSION_TO_CART|AVG_PRICE`, direction `ASC|DESC`; product-query sorts above when applicable |
| 43 | CAP-23 | Category/search position & coverage boundary | Prove category/search-position capability and explicit entitlement/coverage limits | Prefer `BY_POSITION`, `BY_SEARCHES`, `BY_VIEWS`, `BY_CONVERSION`, or `BY_GMV` according to question; direction explicit |

## Exact sort controls currently admitted by repaired runtime

These are runtime contract controls, not promises that every test uses them:

- Product/search query analytics: `sort_by = BY_SEARCHES | BY_VIEWS | BY_POSITION | BY_CONVERSION | BY_GMV`; `sort_dir = DESCENDING | ASCENDING`.
- Marketplace search-query text: `sort_by = CLIENT_COUNT | ADD_TO_CART | CONVERSION_TO_CART | AVG_PRICE`; `sort_dir = ASC | DESC`.
- Supply-order list: `sort_by = ORDER_CREATION | ORDER_STATE_UPDATED_AT | TIMESLOT_FROM_UTC | TIMESLOT_FROM_LOCAL`; `sort_dir = ASC | DESC`.
- FBS/FBP and several posting/list surfaces: `sort_dir = ASC | DESC` where that operation explicitly exposes it.
- Reviews/questions/comments: `sort_dir = ASC | DESC`.
- Do not fabricate a provider sort field where the operation has none; perform requested ranking deterministically in the analysis layer.

## STD-07 fixed three-read workflow

Historical live evidence establishes the safe business workflow:

1. `stock_turnover_analytics` — identify low-cover and slow/CRITICAL/NOSALES candidates; its `current_stock` is **not** total FBO+FBS inventory.
2. `seller_product_info_list` — for selected candidates, calculate total/free FBO + FBS stock and reject false stockout conclusions.
3. `supply_order_bundle` — correlate urgent FBO candidates with fresh inbound supply contents so we do not recommend duplicate replenishment.

After each successful read, continue immediately to the next read. After Run 3, close STD-07 and advance directly to STD-08.

Checkpoint: `PRIMARY_GATE_CONTINUOUS_ROUTE_LOCKED_NEXT_STD07_RUN1_AFTER_STD06_CLOSE`.
