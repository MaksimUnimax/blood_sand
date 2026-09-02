# Ozon AI Worker — Capability Awareness / Product Logic Layer (baseline 20, expandable)

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: PLANNED — START ONLY AFTER STD-20
Scope: authenticated Ozon seller without Premium.

## Why this layer exists

The first Standard live benchmark exposed a deeper product requirement: testing many phrasings of the same Seller Analytics endpoint does not prove that an AI worker understands the actual capability surface of Ozon Bridge.

The commercial product is `preferred AI + Bridge + Ozon data + external context + reasoning`. Therefore a weak model must be able to understand that the Bridge can obtain many different classes of Ozon data, select the relevant data class, request it correctly, continue with additional reads when needed, and combine the results into a business answer.

This layer tests product logic, not merely endpoint correctness.

## Main objective

`PROVE_THAT_THE_AI_CAN_DISCOVER_AND_USE_THE_BREADTH_OF_BRIDGE_CAPABILITIES`

The AI must not be rewarded for issuing the same `analytics_data` read repeatedly with different sorting or interpretation instructions. Each test must exercise a materially different Bridge data surface or a materially new cross-surface orchestration path.

## Relationship to the primary commercial gate

The originally frozen 40-test gate is now treated as a **baseline, not a hard ceiling**:

- Layer A baseline: `STD-01` … `STD-20` — real sellable business questions on the current Bridge contract.
- Layer B baseline: `CAP-01` … `CAP-20` — capability-awareness / product-logic questions started only after STD-20 is completed.
- Additional CAP rows may be promoted into the **same primary gate** when they represent a materially distinct commercial capability discovered during live research.

Gate-size principle:

`EXPAND_GATE_FOR_DISTINCT_COMMERCIAL_CAPABILITY_NOT_FOR_TEST_COUNT`

Do not add cosmetic variants merely to increase coverage count. Every added primary-gate row must justify a new data surface, a materially new orchestration path, a new entitlement/coverage boundary, or a clearly distinct commercial job.

Existing `STD-21` … `STD-28` remain preserved as reserve/extended commercial cases unless specifically promoted later.

As of 2026-09-02, primary-gate capability rows `CAP-21` … `CAP-23` are promoted for SEO/semantic-core, competitor-card benchmarking, and category/search-position coverage. The current primary gate is therefore **43 baseline rows (20 STD + 23 CAP), expandable if further distinct capabilities are discovered**.

## What Layer B must measure

For every CAP row record separately:

1. Did the AI recognize that the requested information is obtainable through Bridge?
2. Did it select the correct semantic data family without being told an API operation name?
3. Did it use command discovery/help instead of inventing unsupported operations when uncertain?
4. Did it request the minimum useful data rather than defaulting to Seller Analytics for everything?
5. Did it preserve the business job across multiple explicit runs when one read was insufficient?
6. Did it correlate different Seller/Performance data surfaces when the question required it?
7. Did it use external/public context only when that context actually added evidence?
8. Did it distinguish missing data, unavailable entitlement, privacy gating and provider errors from a real business zero/empty result?
9. Did it avoid hallucinating fields or pretending that Ozon exposes data that it does not?
10. Did it reach a useful business answer without operator teaching the model the endpoint inventory?

## Capability-awareness requirement discovered

The repository already contains the earlier design authority `OZON_GUIDED_COMMAND_DISCOVERY_SPEC_2026-08-21.md`, created after Alice invented unsupported operations when it did not know the Bridge contract.

That older design primarily helps after an invalid/unknown attempted command. The commercial AI-worker product needs a broader guarantee: the model must have a bounded way to understand what classes of Ozon data the Bridge can provide before or during planning, not only after it guesses incorrectly.

Layer B is intended to reveal exactly how much additional capability-discovery guidance is needed for weak models.

## Baseline capability/product-logic surfaces

Exact natural-language wording for each row is frozen when the row becomes active so it can incorporate evidence from Layer A without changing already-executed rows.

| ID | Primary capability surface | What the test must prove |
|---|---|---|
| CAP-01 | Catalog / product inventory | AI understands it can obtain the seller's product/card inventory instead of asking the operator to list SKUs manually. |
| CAP-02 | Product visibility | AI can determine whether products are visible/available and use the dedicated visibility surface rather than inferring visibility from sales. |
| CAP-03 | Content/card quality | AI can obtain card/content diagnostics or rating/recommendation data where available and explain what needs fixing. |
| CAP-04 | Current stock by warehouse | AI can request warehouse-level inventory through the relevant stock surface rather than treating `analytics_data` as universal. |
| CAP-05 | Stock turnover / stock analytics | AI recognizes turnover/stock-days as a separate analytical surface and can rank shortages/overstock. |
| CAP-06 | Ozon warehouses / clusters / logistics geography | AI can discover warehouse/cluster/logistics reference data when the business question depends on location. |
| CAP-07 | Supply-order list/status | AI can retrieve active supply orders and identify their current states. |
| CAP-08 | Supply-order details / acceptance | AI can drill from a supply identifier into details/acceptance/status evidence using additional explicit reads. |
| CAP-09 | FBO postings/orders | AI can use posting/order data when shipment/order evidence is needed rather than trying to answer from aggregate analytics alone. |
| CAP-10 | Prices / price details | AI understands current pricing data is available and can compare/inspect prices without requesting a manual export. |
| CAP-11 | Promotions/actions | AI can identify current promotion/action participation and candidate/product status from the relevant read surfaces. |
| CAP-12 | Returns / cancellations | AI can retrieve return/cancellation evidence and distinguish it from aggregate sales decline. |
| CAP-13 | Finance balance/accruals | AI can request finance-specific data for money questions instead of equating sales revenue with payout. |
| CAP-14 | Finance transactions / reconciliation | AI can use transaction/accrual/posting finance data and perform a multi-read reconciliation when needed. |
| CAP-15 | Ratings / FBS error index | AI recognizes seller rating/FBS error diagnostics as a separate data source and can identify contributing postings where available. |
| CAP-16 | Reviews / questions aggregate surface | AI recognizes review/question information as available subject to privacy/entitlement rules and handles gates explicitly. |
| CAP-17 | Advertising campaigns | AI understands Performance campaign inventory is a separate provider/data family and can obtain active campaign context. |
| CAP-18 | Advertising statistics | AI can obtain expense/daily/product advertising statistics and not confuse them with Seller sales analytics. |
| CAP-19 | Cross-surface orchestration | AI combines at least two materially different Bridge surfaces (for example ads × stock, sales × finance, supply × visibility) through sequential explicit commands. |
| CAP-20 | Bridge + external-world investigation | AI combines Ozon cabinet evidence with public/external context for a real-world event or market explanation while separating facts from hypotheses. |
| CAP-21 | Own-card SEO / semantic core | AI combines product title/info, description, attributes, Ozon content rating and real product-query evidence to identify semantic gaps and SEO/content recommendations. |
| CAP-22 | Competitor SEO / positioning benchmark | AI discovers relevant competitors where evidence exists, keeps private seller evidence separate from public competitor-card evidence, and compares semantics/content/price without inventing competitor private metrics. |
| CAP-23 | Category/search position & coverage boundary | AI determines what own search-position evidence is available, handles Premium-only `position_category` honestly, and surfaces the current Bridge coverage gap for `/v1/analytics/category/comparison` if still absent. |

Authority for CAP-21…CAP-23:
`OZON_AI_WORKER_SEO_COMPETITIVE_POSITION_CAPABILITY_REQUIREMENT_2026-09-02.md`.

## Diversity rule

A CAP row is invalid if it merely changes:

- date range;
- sort order;
- top-N count;
- chart/table wording;
- interpretation text;

while using essentially the same underlying data surface as another row.

A valid CAP row must either:

- exercise a materially different operation/data family;
- exercise a materially new multi-surface orchestration path whose value is the correlation itself; or
- exercise a commercially important entitlement/coverage boundary that changes what the AI worker can truthfully answer.

## Scoring

Each CAP test receives at least these fields:

- `capability_recognition`: PASS/PARTIAL/FAIL
- `operation_or_cluster_selection`: PASS/PARTIAL/FAIL
- `discovery_help_usage_when_needed`: PASS/PARTIAL/FAIL/NOT_NEEDED
- `multi_run_orchestration`: PASS/PARTIAL/FAIL/NOT_NEEDED
- `business_answer`: PASS/PARTIAL/FAIL/BLOCKED
- `operator_intervention_required`: YES/NO
- `bridge_guidance_gap`: NONE / RECOVERY / CAPABILITY_DISCOVERY / ENTITLEMENT / PAGINATION / COVERAGE / OTHER
- `notes`

SEO/competitive-position rows additionally record the fields defined in the SEO competitive-position authority document.

## Product implication

The target is not that every AI memorizes hundreds of Ozon operations. The target is that Bridge exposes enough structured capability information and guidance that a weaker authenticated free AI can behave like an Ozon worker without the operator teaching it the API.

If Layer B shows that models repeatedly fail because they do not know which data exists, the fix belongs in Bridge capability-discovery/guidance rather than provider-specific prompt hacks.

## Gate order

1. Continue current Layer A without changing its live questions.
2. Finish `STD-01` … `STD-20` under `NO_SKIP_ON_FAILURE`.
3. Freeze exact wording for active CAP rows based on the capability surfaces above and Layer A evidence.
4. Run all current primary-gate CAP rows on GPT-5.6 Sol + current Bridge.
5. Persist every run/result and any newly justified primary-gate extension.
6. Consolidate recovery + capability-awareness + coverage gaps into one Bridge guidance-hardening package.
7. Rerun affected Sol tests without operator rescue.
8. Freeze hardened candidate.
9. Run the same final primary gate on Alice Free and later providers.

## Current checkpoint

`PRIMARY_GATE_BASELINE_40_EXPANDED_TO_43_WITH_CAP_21_TO_CAP_23_AND_REMAINS_EVIDENCE_DRIVEN_EXPANDABLE`
