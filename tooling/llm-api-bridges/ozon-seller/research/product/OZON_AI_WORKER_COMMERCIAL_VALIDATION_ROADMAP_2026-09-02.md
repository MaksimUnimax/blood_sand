# Ozon AI Worker — Commercial Validation Roadmap

Date: 2026-09-02
Status: ACTIVE
Product gate: `COMMERCIAL_QUERY_CORE_V2_READY_FOR_OPERATOR_REVIEW`
Authority TZ: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Current core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V2_2026-09-02.md`
V1 historical core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V1_2026-09-02.md`
Demand evidence: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`
Instant-BI/correlation evidence: `OZON_AI_WORKER_INSTANT_BI_CORRELATION_RESEARCH_2026-09-02.md`
Free-AI output matrix: `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`
Competitive landscape: `OZON_AI_WORKER_COMPETITIVE_LANDSCAPE_2026-09-02.md`
Synthesis: `OZON_AI_WORKER_COMMERCIAL_RESEARCH_SYNTHESIS_2026-09-02.md`

## Goal

Build an evidence-backed commercial query core that defines what the Ozon AI worker must solve to have a credible sellable value proposition. The core must cover not only diagnosis but also instant analytics, cross-report joins and requested output artifacts. Benchmark the same frozen core first on GPT-5.6 Sol + Bridge, second on Alice Free + Bridge, then on every additional supported AI provider.

## Frozen product model

Product = preferred AI + Ozon Bridge + Ozon cabinet data + external/public context + AI reasoning + requested deliverable.

Coverage is measured at the level of a solved business job, not an API endpoint.

Three product-value classes are mandatory:

1. decision / investigation;
2. instant BI / ad-hoc analytics;
3. cross-report correlation / manual-report replacement.

Output format is a separate product capability and is benchmarked independently from answer correctness.

Default AI baseline = authenticated zero-cost/no-subscription consumer web tier. Ozon Premium entitlement is separate.

## Phase 0 — Product framing and preservation

Status: COMPLETE

- [x] Freeze AI-worker product model.
- [x] Freeze four target segments.
- [x] Freeze demand-first research rule.
- [x] Freeze provider benchmark order: Sol → Alice → additional providers.
- [x] Freeze free-authenticated AI tier as baseline.
- [x] Create dedicated product-gate TZ.
- [x] Preserve work on dedicated research branch.

## Phase 1 — Current capability inventory

Status: COMPLETE FOR V2 PRE-TEST MAPPING

- [x] Confirm accepted build has broad Seller API + Performance API read registry.
- [x] Confirm capability clusters: account/access, catalog, stocks, sales analytics, search visibility, prices/promotions, orders/postings, FBO/FBP supplies, warehouse/logistics, returns/cancellations, finance, reviews/questions and advertising/performance.
- [x] Confirm privacy-gated reads exist for personal/user-generated data.
- [x] Confirm Premium/Premium Plus/Premium Pro entitlement logic exists.
- [x] Confirm Seller and Performance data can be independently requested and correlated by the AI worker.
- [x] Map V2 rows to current product hypotheses without treating endpoint inventory as demand evidence.

Important limitation to preserve: `продажи по складам` is a commercially valid request, but a complete exact current Bridge path for warehouse-attributed sales has not yet been proven. Relevant rows remain `PARTIAL_CANDIDATE` until live evidence proves completeness.

## Phase 2 — External real-demand corpus

Status: COMPLETE FOR CORE V2; OPEN FOR TARGETED GAP EVIDENCE ONLY

Evidence collected from:

- [x] seller forums / real seller problem threads;
- [x] official Ozon seller materials and public channels;
- [x] marketplace-management agencies and freelancers;
- [x] analytics/management software;
- [x] direct AI-agent / AI-analyst competitors;
- [x] real external incidents/seasonal/outage examples;
- [x] seller complaints about reconciling Ozon reports and accounting dates;
- [x] examples requiring separate ad/seller/finance/stock files;
- [x] software explicitly selling `без Excel / без ручной склейки` workflows.

Demand is established for both high-level investigation and routine analytical slicing/joining.

## Phase 3 — Demand normalization

Status: COMPLETE FOR V2

- [x] Normalize real jobs into natural-language AI-worker questions.
- [x] Keep API names out of user prompts.
- [x] Assign four segments and entitlement/user-data dependencies.
- [x] Separate investigation from instant BI and cross-report BI.
- [x] Reject low-value endpoint trivia and duplicate paraphrases.
- [x] Preserve complex correlations as benchmark rows when they eliminate real manual work.

## Phase 4 — Commercial Query Core V2

Status: COMPLETE / AWAITING OPERATOR REVIEW AND FREEZE

Current benchmark size: **57 business rows**.

Composition:

- **33** V1 investigation/decision rows preserved;
- **14** Instant-BI rows;
- **10** Cross-Report BI rows.

Representative Instant-BI rows:

- sales yesterday with revenue/units/top SKU;
- 30-day sales trend;
- top products by revenue and units;
- sales by warehouse ranking — intentionally partial until exact data path is proven;
- FBO stocks by warehouse and SKU;
- turnover/stock-days ranking;
- advertising expense by campaign;
- advertising statistics by SKU;
- finance accrual/deduction grouping;
- returns/cancellations by SKU;
- active supplies/status/timeslots;
- Premium search-query and funnel views.

Representative cross-report rows:

- sales/location × current stock;
- sales × stock × in-transit × turnover for supply priority;
- advertised SKU × stock availability;
- advertising × listing visibility/content/logistics readiness;
- sales × finance/accrual/payment-date reconciliation;
- promotion before/after × costs/COGS;
- advertising direct/associated × total seller sales — exact fields require proof;
- FBS error index × offending postings × monetary impact;
- stock × turnover × COGS × storage/finance;
- accepted supply × stock × product visibility.

## Phase 4A — Deliverable/output benchmark

Status: DEFINED / LIVE TEST PENDING

Nine common output tests are frozen for provider evaluation:

- OUT-01 sorted in-chat table;
- OUT-02 data chart/graph;
- OUT-03 downloadable CSV;
- OUT-04 downloadable XLSX with summary/detail sheets;
- OUT-05 PDF report;
- OUT-06 DOCX/editable document;
- OUT-07 PPTX/client deck;
- OUT-08 exact JSON;
- OUT-09 exact XML.

A provider can PASS the business answer and separately FAIL/PARTIAL the requested artifact.

For downloadable formats distinguish a real downloadable artifact from text inside a code block.

## Phase 4B — Free authenticated AI output capability research

Status: PUBLIC-DOCUMENTATION PASS COMPLETE / LIVE VERIFICATION REQUIRED

Pre-test findings are preserved in `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`.

Current conservative assessment:

- ChatGPT Free: strong file/data-analysis candidate with limits; exact artifact formats must be live tested in normal Free chat, not ChatGPT Work.
- Alice Free: free chat and document analysis are established; target-chat native XLSX/PDF/PPT/data-chart export remains unverified. Alice Pro in Yandex Sheets is a separate surface and is not counted as chat baseline.
- Gemini: very strong free deliverable candidate; current Google documentation exposes office-file generation for all Gemini app users.
- Claude: strong free visualization/Artifacts candidate; native Office-file generation on free tier is not pre-claimed.
- Grok: strong free deliverable candidate under current xAI documentation, subject to usage limits.
- Qwen: free analysis/report candidate; Office artifact output unverified.
- Kimi: do not count Office artifact generation as zero-cost baseline until live proof; current membership/credit documentation creates gating risk.
- DeepSeek/Meta/OpenRouter: output/artifact layer remains materially unverified or model/UI-dependent.

## Phase 5 — Current-product coverage hypothesis

Status: COMPLETE FOR V2 PRE-TEST; NOT A SUCCESS RATE

Each V2 row has a pre-test capability classification. These are hypotheses only.

Known high-value limitations include:

- multi-client safe credential context remains an architectural gap;
- seller COGS/tax/plan/action history must be supplied when Ozon does not own it;
- historical stock forensic completeness may be limited;
- some search/funnel metrics are Premium-gated;
- personal/free-text customer data may be privacy-gated;
- exact warehouse-attributed sales must be proven before marketing;
- direct vs associated advertising-order fields must be proven before marketing;
- external timing correlation must not be presented as causation without evidence.

## Phase 6 — GPT-5.6 Sol + Bridge live benchmark

Status: NEXT AFTER OPERATOR V2 REVIEW/FREEZE

GPT-5.6 Sol is the strongest baseline worker.

For every frozen business query record:

- intent understanding;
- investigation/evidence plan;
- Bridge request correctness;
- safe multi-step orchestration;
- external-source use when appropriate;
- joins/normalization/calculations/sorting;
- uncertainty discipline;
- business usefulness;
- hallucination/causality errors;
- PASS / PARTIAL / FAIL / BLOCKED.

For representative rows also run OUT-01..OUT-09 on the free-authenticated ChatGPT baseline and record artifact correctness separately.

Failures must be classified by cause:

- Bridge data gap;
- missing Ozon entitlement;
- unavailable Ozon data;
- missing seller-side business input;
- AI reasoning/planning failure;
- adapter/delivery failure;
- external-information failure;
- output/artifact capability failure;
- free-tier rate/feature gate;
- safety/privacy constraint.

## Phase 7 — Alice Free + Bridge benchmark

Status: BLOCKED ON SOL BASELINE

Run the same frozen V2 business rows and representative output-suite tests using Alice's authenticated zero-cost baseline.

Do not simplify a commercial question merely to make Alice pass. Product-side guidance adaptations must be separately recorded and retested.

## Phase 8 — Commercial decision checkpoint

Status: BLOCKED ON SOL + ALICE RESULTS

Answer:

1. What exactly can we sell?
2. Which of the 57 business jobs are reliably solved?
3. How much manual report/Excel work is actually eliminated?
4. Which correlations create the strongest willingness-to-pay value?
5. Which output formats can each free AI tier reliably provide?
6. Which segment is strongest: seller standard, seller Premium, service standard, service Premium?
7. What can marketing truthfully promise?
8. Which failures are Bridge/data vs model/provider vs free-tier output limits?
9. Which small changes unlock the most paid demand?
10. Does preferred-AI portability create sufficient differentiation?
11. Is continued multi-AI expansion commercially justified?

Decision statuses:

- `COMMERCIAL_CORE_VALIDATED`
- `COMMERCIAL_CORE_VALIDATED_WITH_PRIORITY_GAPS`
- `COMMERCIAL_VALUE_NOT_YET_PROVEN`
- `PRODUCT_DIRECTION_RETHINK_REQUIRED`

## Phase 9 — Additional AI providers

Status: PAUSED

Only after the commercial decision checkpoint. Each provider is benchmarked against the same frozen V2 core plus relevant output-suite tests.

## Current exact checkpoint

`COMMERCIAL_QUERY_CORE_V2_READY_57_BUSINESS_ROWS_PLUS_9_OUTPUT_TESTS_BEFORE_SOL_LIVE_BENCHMARK`

Next work:

1. operator reviews/edits the 57-row V2 commercial core and nine output tests;
2. freeze exact benchmark wording;
3. prepare materially equivalent live fixtures/rules;
4. run GPT-5.6 Sol + Bridge first;
5. record row-by-row business and artifact results;
6. analyze/fix only evidence-backed gaps;
7. run Alice Free + Bridge on the same frozen benchmark;
8. make the commercial decision before resuming multi-AI expansion.
