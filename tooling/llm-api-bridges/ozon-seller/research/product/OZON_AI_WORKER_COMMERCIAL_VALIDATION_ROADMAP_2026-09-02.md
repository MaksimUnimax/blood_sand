# Ozon AI Worker — Commercial Validation Roadmap

Date: 2026-09-02
Status: ACTIVE
Product gate: `COMMERCIAL_QUERY_CORE_V1_READY_FOR_OPERATOR_REVIEW`
Authority TZ: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V1_2026-09-02.md`
Evidence: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`
Competitive landscape: `OZON_AI_WORKER_COMPETITIVE_LANDSCAPE_2026-09-02.md`
Synthesis: `OZON_AI_WORKER_COMMERCIAL_RESEARCH_SYNTHESIS_2026-09-02.md`

## Goal

Build an evidence-backed commercial query core that defines what the Ozon AI worker must be able to solve to have a credible sellable value proposition. Benchmark the same frozen core first on GPT-5.6 Sol + Bridge, second on Alice + Bridge, and later on each additional AI provider.

## Frozen product model

Product = preferred AI + Ozon Bridge + Ozon cabinet data + external/public context + AI analysis.

Coverage is measured at the level of a solved business question, not an API endpoint.

## Phase 0 — Product framing and preservation

Status: COMPLETE

- [x] Freeze AI-worker product model.
- [x] Freeze four target segments.
- [x] Freeze demand-first research rule.
- [x] Freeze provider benchmark order.
- [x] Create dedicated product-gate TZ.
- [x] Preserve work on a separate research branch.

## Phase 1 — Current capability inventory

Status: COMPLETE FOR CORE V1

- [x] Confirm accepted build has broad Seller API + Performance API read registry.
- [x] Confirm capability clusters: account/access, catalog, stocks, sales analytics, search visibility, prices/promotions, orders/postings, FBO/FBP supplies, warehouse/logistics, returns/cancellations, finance, reviews/questions and advertising/performance.
- [x] Confirm privacy-gated reads exist for personal/user-generated data.
- [x] Confirm Premium/Premium Plus/Premium Pro entitlement logic exists.
- [x] Map each Core V1 query to a current product capability hypothesis.

Important: capability mapping was performed only after independent demand collection. It is not the source of the query core.

## Phase 2 — External real-demand corpus

Status: COMPLETE FOR CORE V1

Collected and preserved evidence from:

- [x] seller forums / real seller problem threads;
- [x] official Ozon seller materials and public channels;
- [x] marketplace-management agencies and freelancers;
- [x] seller analytics/management products;
- [x] direct AI-agent / AI-analyst competitors;
- [x] real external incident and seasonal/outage examples.

Evidence ledger conclusion: recurring paid demand exists for sales diagnostics, inventory/supplies, advertising, finance/profitability, listing/search visibility, returns/reputation and operational reporting.

## Phase 3 — Demand normalization

Status: COMPLETE FOR CORE V1

- [x] Preserve source/original pain.
- [x] Normalize into natural-language AI-worker questions.
- [x] Assign four target segments.
- [x] Assign Premium/privacy/user-data dependencies.
- [x] Reject endpoint-level trivia as the benchmark unit.
- [x] Preserve multi-factor diagnostic questions because they are central to product value.

## Phase 4 — Commercial Query Core V1

Status: COMPLETE / AWAITING OPERATOR REVIEW

Core size: **33 canonical queries**.

Breakdown:

- 13 `SELLER_STANDARD`
- 6 `SELLER_PREMIUM`
- 8 `SERVICE_STANDARD`
- 6 `SERVICE_PREMIUM`

The core deliberately includes both easy fact questions and hard multi-source investigations.

Examples:

- daily cabinet health;
- sales collapse/root cause;
- warehouse incident impact;
- disappearing FBO stock;
- stockout/overstock;
- supply acceptance;
- listing/delivery visibility;
- DRR/ad waste;
- payout reconciliation;
- SKU profit with user cost data;
- search/query/position analytics;
- organic vs paid dependency;
- client morning audit / weekly report;
- full premium professional diagnostic;
- multi-client portfolio triage.

## Phase 5 — Current-product coverage hypothesis

Status: COMPLETE FOR CORE V1

Pre-test distribution across 33 rows:

- `STRONG_CANDIDATE`: 12
- `CONDITIONAL_USER_DATA`: 5
- `PARTIAL_CANDIDATE`: 3
- `PRIVACY_OR_ENTITLEMENT_GATED`: 12
- `CURRENT_PRODUCT_GAP`: 1

This is NOT a success rate.

The explicit current architectural gap is multi-client portfolio triage across several seller credential contexts. Historical stock forensics, causality and seller-only cost/plan data are important limitations but not complete blockers for their whole query families.

## Phase 5A — Competitive landscape

Status: COMPLETE FOR DECISION V1

Direct competition exists:

- Ozon `Умный ассистент`;
- inSales AI analyst;
- Operesso personal Ozon AI manager;
- ReStat AI analytics;
- SuperIntellect, JAFO, AISellerAgent and others.

Therefore generic `chat with your Ozon data` is not a sufficient differentiator.

Candidate differentiation to validate:

1. native operation inside the user's preferred AI;
2. replaceable AI provider over the same Bridge;
3. private cabinet evidence + current public web/event context;
4. Bridge credential/allowlist boundary;
5. evidence-backed provider benchmark over the same commercial core.

## Phase 6 — GPT-5.6 Sol + Bridge benchmark

Status: NEXT AFTER OPERATOR CORE REVIEW

GPT-5.6 Sol is the strongest baseline worker and is tested first.

For every frozen query record:

- intent understanding;
- investigation plan quality;
- Bridge request correctness;
- external-source use when appropriate;
- calculations/correlation quality;
- uncertainty discipline;
- final business usefulness;
- hallucination/unsupported-causality errors;
- final result: PASS / PARTIAL / FAIL / BLOCKED.

Failures must be classified by cause:

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

Run the same frozen core against Alice using materially equivalent fixtures.

Do not simplify a question merely to make a weaker AI pass. If a product-side prompt/guidance adaptation is needed, record it as engineering work and retest explicitly.

## Phase 8 — Commercial decision checkpoint

Status: BLOCKED ON SOL + ALICE RESULTS

Answer:

1. What exactly can we sell?
2. Which commercial query families are reliably solved?
3. Which segment is strongest: seller standard, seller Premium, service standard or service Premium?
4. What can marketing truthfully promise?
5. Which failures are Bridge gaps vs AI/model gaps?
6. Which small changes unlock the most paid demand?
7. Does native preferred-AI operation create enough differentiation from Ozon/inSales/Operesso?
8. Is continued multi-AI expansion justified?

Decision statuses:

- `COMMERCIAL_CORE_VALIDATED`
- `COMMERCIAL_CORE_VALIDATED_WITH_PRIORITY_GAPS`
- `COMMERCIAL_VALUE_NOT_YET_PROVEN`
- `PRODUCT_DIRECTION_RETHINK_REQUIRED`

## Phase 9 — Additional AI providers

Status: PAUSED

Only after the commercial decision checkpoint. Every provider is benchmarked against the same frozen commercial core.

## Current exact checkpoint

`COMMERCIAL_QUERY_CORE_V1_READY_FOR_OPERATOR_REVIEW_BEFORE_SOL_BENCHMARK`

Next work:

1. operator reviews/edits the 33-row commercial core;
2. freeze exact V1 benchmark wording;
3. prepare live test fixtures/rules;
4. run GPT-5.6 Sol + Bridge first;
5. record row-by-row results;
6. only then run Alice.
