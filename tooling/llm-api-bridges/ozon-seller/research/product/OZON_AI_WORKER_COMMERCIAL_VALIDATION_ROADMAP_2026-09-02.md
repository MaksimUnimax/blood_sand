# Ozon AI Worker — Commercial Validation Roadmap

Date: 2026-09-02
Status: ACTIVE
Product gate: `COMMERCIAL_QUERY_CORE_NOT_YET_VALIDATED`
Authority TZ: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`

## Goal

Build an evidence-backed commercial query core that defines what the Ozon AI worker must be able to solve to have a credible sellable value proposition. Then benchmark the same core first on GPT-5.6 Sol + Bridge, second on Alice + Bridge, and later on each additional AI provider.

## Frozen product model

Product = preferred AI + Ozon Bridge + Ozon cabinet data + external/public context + AI analysis.

Coverage is measured at the level of a solved business question, not at the level of an API endpoint.

## Phase 0 — Product framing and preservation

Status: COMPLETE

- [x] Freeze AI-worker product model.
- [x] Freeze four target segments.
- [x] Freeze demand-first research rule.
- [x] Freeze provider benchmark order.
- [x] Create dedicated product-gate TZ.
- [x] Preserve work on a separate research branch.

## Phase 1 — Current capability inventory

Status: IN PROGRESS

Purpose: understand what data the accepted Bridge can currently expose without using this inventory to invent demand.

- [x] Confirm accepted build has broad Seller API + Performance API read registry.
- [x] Confirm capability clusters include account/access, catalog, stocks, sales analytics, search visibility, prices/promotions, orders/postings, FBO/FBP supplies, warehouse/logistics, returns/cancellations, finance, reviews/questions and advertising/performance.
- [x] Confirm explicit privacy-gated reads exist for some personal/user-generated data.
- [x] Confirm Premium-dependent search/finance operations exist in registry.
- [ ] Produce compact capability-to-evidence map used only for coverage mapping.

## Phase 2 — External real-demand corpus

Status: IN PROGRESS

Required source classes:

- [x] Seller forums / real seller problem threads.
- [x] Official Ozon seller materials.
- [x] Marketplace-management agencies / freelancers selling operational work.
- [x] Analytics/management tools marketed to sellers.
- [ ] Additional public community/chat evidence for underrepresented jobs.
- [ ] Additional evidence for Premium-specific professional analytics jobs.
- [ ] De-duplicate and score recurring demand themes.

Already evidenced recurring themes include:

- unexplained sales collapse / sales anomaly diagnosis;
- FBO stock disappearing or becoming inconsistent;
- stock allocation and shortage/overstock by warehouse;
- delayed/unaccepted FBO supplies;
- delivery/visibility problems despite stock and listing status;
- advertising DRR too high and sales collapsing when ads stop;
- campaign/bid efficiency;
- understanding payouts, commissions, logistics and financial reports;
- profitability/unit economics after marketplace costs;
- pricing/discount/promotion confusion;
- reviews/questions/rating management;
- search-query/position/visibility analytics;
- weekly/daily reporting and cabinet health monitoring;
- agency/freelancer demand for analytics, logistics, cards, ads, reviews and reporting;
- external-event investigation such as warehouse fires, outages, holidays and seasonality.

## Phase 3 — Demand normalization

Status: NOT STARTED

For each evidence-backed job:

1. preserve source and original problem;
2. normalize into one or more realistic natural-language AI-worker queries;
3. assign segment(s);
4. assign Premium dependency where evidenced;
5. state business outcome/value;
6. classify recurrence/importance;
7. reject weak, artificial or low-value queries.

Output: demand ledger.

## Phase 4 — Commercial query core V1

Status: NOT STARTED

Build the frozen benchmark table.

Target initial size: enough rows to cover the recurring sellable jobs without bloating the benchmark with endpoint-level variants. Prefer representative high-value queries over exhaustive paraphrases.

Required query families:

- daily/weekly cabinet health;
- sales anomaly/root-cause investigation;
- stock loss/warehouse incident investigation;
- replenishment/stock allocation;
- supply/acceptance/logistics problems;
- listing visibility/content diagnosis;
- advertising efficiency and DRR;
- search demand/position/keyword analysis;
- pricing/promotions;
- returns/cancellations/quality signals;
- ratings/reviews/questions;
- finance/payout/reconciliation;
- product/SKU profitability where required business inputs are available;
- professional client reporting/audit;
- multi-factor professional diagnostics.

Every row receives a stable ID and evidence links.

## Phase 5 — Current-product coverage hypothesis

Status: NOT STARTED

Map each frozen query to what the AI worker would need:

- Bridge data cluster(s);
- public web/current information;
- calendar/seasonality context;
- calculations;
- user-provided business facts such as cost price where Ozon does not know them;
- unavailable data.

Set only a pre-test hypothesis:

- `STRONG_CANDIDATE`
- `PARTIAL_CANDIDATE`
- `GAP_CANDIDATE`
- `UNKNOWN`

Do NOT mark provider PASS here.

## Phase 6 — GPT-5.6 Sol + Bridge benchmark

Status: BLOCKED ON CORE FREEZE

GPT-5.6 Sol is the strongest baseline worker and is tested first.

For every query record:

- intent understanding;
- investigation plan quality;
- Bridge request correctness;
- external-source use when appropriate;
- calculations/correlation quality;
- uncertainty discipline;
- final business usefulness;
- hallucination/unsupported-causality errors;
- final result: PASS / PARTIAL / FAIL / BLOCKED.

Failures are classified by cause:

- Bridge data gap;
- missing Ozon entitlement;
- unavailable Ozon data;
- missing user business input;
- AI reasoning/planning failure;
- adapter/delivery failure;
- external-information failure;
- safety/privacy constraint.

## Phase 7 — Alice + Bridge benchmark

Status: BLOCKED ON GPT-5.6 SOL BASELINE

Run the same frozen core against Alice with materially equivalent fixtures.

Compare row-by-row against the Sol baseline.

Do not weaken the question to make Alice pass unless a separately recorded UX adaptation is being evaluated.

## Phase 8 — Commercial decision checkpoint

Status: BLOCKED

Before resuming broad multi-AI development, answer:

1. What are we actually selling?
2. Which query families are reliably solved today?
3. Which four-segment proposition is strongest?
4. Which queries create the clearest willingness-to-pay value?
5. What can sales/marketing promise without overclaiming?
6. Is the core broad/valuable enough to justify continuing the product?
7. Which small engineering changes unlock the largest amount of commercial demand?
8. Is multi-AI expansion still justified after the benchmark?

Output decision statuses:

- `COMMERCIAL_CORE_VALIDATED`
- `COMMERCIAL_CORE_VALIDATED_WITH_PRIORITY_GAPS`
- `COMMERCIAL_VALUE_NOT_YET_PROVEN`
- `PRODUCT_DIRECTION_RETHINK_REQUIRED`

## Phase 9 — Additional AI providers

Status: PAUSED

Only after the commercial decision checkpoint.

Provider sequence and adapter work are handled separately. Each added provider is benchmarked against the already frozen commercial core.

## Current exact checkpoint

`PRODUCT_DEMAND_RESEARCH_IN_PROGRESS_BEFORE_COMMERCIAL_QUERY_CORE_V1`

Next work:

1. expand/clean real-demand source corpus;
2. create source/demand ledger;
3. normalize high-value jobs into natural-language queries;
4. build Commercial Query Core V1;
5. map theoretical current-product coverage;
6. freeze core;
7. start GPT-5.6 Sol live benchmark.
