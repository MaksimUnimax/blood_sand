# Ozon AI Worker — Commercial Validation Roadmap

Updated: 2026-09-06
Status: `SOL_PRIMARY_GATE_44_COMPLETE__PHASE_6_HARDENING_ACTIVE`
Product gate: `44_ROWS__STD_01_TO_STD_20__CAP_01_TO_CAP_24__SOL_COMPLETE`
Authority TZ: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Current core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V2_2026-09-02.md`
Standard live benchmark: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V2_2026-09-02.md`
Capability-awareness layer: `OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`
Primary gate index: `OZON_AI_WORKER_PRIMARY_GATE_INDEX_2026-09-02.md`
Primary terminal Sol ledger: `OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`
Extension results: `OZON_AI_WORKER_PRIMARY_GATE_EXTENSION_RESULTS_2026-09-02.md`
Weak-model recovery requirement: `OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`
Failure diagnostics: `OZON_AI_WORKER_LIVE_FAILURE_DIAGNOSTICS_2026-09-02.md`
Demand evidence: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`
Instant-BI/correlation evidence: `OZON_AI_WORKER_INSTANT_BI_CORRELATION_RESEARCH_2026-09-02.md`
Free-AI output matrix: `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`
Competitive landscape: `OZON_AI_WORKER_COMPETITIVE_LANDSCAPE_2026-09-02.md`
Synthesis: `OZON_AI_WORKER_COMMERCIAL_RESEARCH_SYNTHESIS_2026-09-02.md`
Explicit batch orchestration rule: `OZON_AI_WORKER_EXPLICIT_BATCH_ORCHESTRATION_DEFECT_AND_RULE_2026-09-06.md`
CAP-24 unit-economics authority: `OZON_AI_WORKER_UNIT_ECONOMICS_CAPABILITY_REQUIREMENT_2026-09-06.md`

## Goal

Build an evidence-backed commercial query core that proves whether the Ozon AI worker is actually sellable and whether its business jobs can be executed through a model-independent Bridge contract without requiring the operator to teach API mechanics.

The live Standard Sol primary gate has expanded, by the existing promotion rule, to **44 rows**:

- **Layer A: STD-01..STD-20** — real seller business questions;
- **Layer B / capability rows: CAP-01..CAP-24** — distinct capability-awareness, multi-surface orchestration and coverage-boundary jobs.

The original 40-row gate remains historical baseline context, not the current gate size.

Product = preferred AI + Ozon Bridge + Ozon cabinet data + external/public context + AI reasoning + requested deliverable.

Coverage is measured at the level of a solved business job, not an API endpoint.

## Mandatory benchmark rules

1. `NO_SKIP_ON_FAILURE` — failed/blocked rows are diagnosed before moving on.
2. One user business question may require multiple explicit Bridge commands/runs.
3. `EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS` — when several read commands are independent and all parameters are known before execution, prefer multiple separate explicit `OZON_API_V1` objects in one assistant response so the Bridge executes them as an explicit sequential batch.
4. Use conversation-stepwise execution only when the next command depends on previous output: cursor/`last_id`, discovered IDs, report code/file ref, causal diagnosis, privacy/entitlement branch or another real dependency.
5. Preserve `ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`. For `N` explicit commands, at most `N` sequential physical business requests are permitted.
6. No hidden retry, hidden pagination, hidden fanout, polling, implicit chaining or hidden capability probes.
7. Premium endpoints/metrics remain outside the Standard baseline; entitlement boundaries are valid evidence and must not be represented as business zeros.
8. Business-answer correctness and operational reliability are scored separately.
9. Any failure requiring operator intervention because the AI/Bridge contract did not make the next action deterministic is a weak-model portability gap.
10. `DO_NOT_REQUIRE_MODEL_INTELLIGENCE_FOR_KNOWN_RECOVERY_MECHANICS` — known recovery behavior should ultimately be normalized by Bridge guidance rather than rediscovered by each model.
11. `DO_NOT_CONFUSE_REPHRASING_WITH_CAPABILITY_COVERAGE` — changing dates/top-N/sort while using the same source does not prove a new capability.
12. A promoted CAP row is valid only when it exercises a materially distinct business capability, materially new multi-surface path or meaningful coverage/entitlement boundary.
13. Do not infer a missing row, `null`, unavailable attribution or empty parser output as numeric zero without evidence.
14. Executable Bridge changes require explicit operator authorization.
15. Meaningful live evidence must be persisted and read back before the next test or phase transition.

## Phase 0 — Product framing and preservation

Status: COMPLETE

- [x] Freeze AI-worker product model.
- [x] Freeze target segments.
- [x] Freeze demand-first research rule.
- [x] Freeze provider order: Sol -> Alice -> additional providers.
- [x] Freeze authenticated zero-cost AI tier as default baseline.
- [x] Preserve work in Git with live-run evidence.

## Phase 1 — Current capability inventory

Status: COMPLETE FOR CURRENT SOL GATE

- [x] Broad Seller API + Performance API read registry confirmed.
- [x] Standard/Premium entitlement behavior exercised.
- [x] Seller and Performance data correlated by AI across multiple jobs.
- [x] Report generation + opaque file materialization exercised.
- [x] Known gaps preserved rather than marketed as covered.

## Phase 2 — External real-demand corpus

Status: COMPLETE FOR CURRENT CORE

Demand evidence was collected from seller forums, official Ozon materials, agencies/freelancers, analytics products, AI competitors, public incidents, report-reconciliation pain and manual Excel workflows.

## Phase 3 — Commercial core / primary-gate definition

Status: COMPLETE / EXPANDED TO 44 ROWS

The original V2 research core and 40-row Standard gate were expanded only when materially distinct commercial jobs were proven necessary.

Current gate:

- `STD-01..STD-20` — 20 rows;
- `CAP-01..CAP-20` — original 20 capability-awareness rows;
- `CAP-21` — own-card SEO / semantic core;
- `CAP-22` — competitor SEO / positioning discovery;
- `CAP-23` — category/search-position and coverage boundary;
- `CAP-24` — SKU monthly unit economics across Seller Analytics, Finance, Performance and placement-report workflow.

Total: **44 rows**.

Existing reserve `STD-21..STD-28` remains outside the primary gate.

## Phase 4 — Layer A: GPT-5.6 Sol + Bridge business-job benchmark

Status: COMPLETE — `STD-01..STD-20 = 20/20 TERMINAL`

All twenty seller-business rows reached terminal evidence-backed classifications.

The Layer-A pass established both business value and portability/recovery lessons, including:

- sales/period/ranking calculations;
- diagnosis rather than raw reporting;
- stock-surface reconciliation;
- supply/warehouse/incident forensics;
- visibility and delivery diagnostics;
- Performance spend, waste and DRR analysis;
- transient provider 429 recovery;
- privacy and local/provider contract boundaries;
- explicit refusal to invent causes or stock states when evidence was absent.

Detailed final truth belongs to the primary terminal Sol ledger and row evidence.

## Phase 4A — Weak-model/recovery gap collection during Layer A

Status: COMPLETE FOR DISCOVERY / INPUT TO PHASE 6

Observed evidence includes:

- 429/rate-limit recovery;
- malformed/unsupported refinement recovery;
- entitlement/privacy guidance;
- pagination continuation;
- empty-result vs error distinction;
- exact retry-command preservation;
- diagnostics after repeated identical provider failure;
- local/provider contract drift;
- stock-surface semantic boundaries;
- explicit batching vs dependency-stepwise orchestration.

These findings are not yet considered fully hardened merely because the Sol business rows completed.

## Phase 5 — GPT-5.6 Sol capability-awareness / product-logic benchmark

Status: COMPLETE — `CAP-01..CAP-24 = 24/24 TERMINAL`

The original Layer-B design began as CAP-01..CAP-20 and was expanded through the gate-promotion rule to CAP-24.

The completed capability rows proved or bounded:

- catalog and visibility;
- content/card quality;
- FBO/FBS stock and turnover;
- warehouses/clusters and supply orders;
- postings;
- prices and entitlement fallback;
- promotions;
- returns/cancellations;
- finance balance/accrual/reconciliation;
- seller ratings/FBS error index;
- reviews/questions and entitlement guidance;
- Performance campaign inventory/statistics;
- cross-surface advertising-to-stock logic;
- Bridge + external-world investigation;
- own-card SEO/search-query semantics;
- competitor discovery boundary;
- category/search-position boundary;
- full monthly SKU unit economics with attribution discipline.

Terminal extension classifications:

- CAP-21: `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP`
- CAP-22: `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY`
- CAP-23: `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES`
- CAP-24: `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY`

Authority:
`OZON_AI_WORKER_PRIMARY_GATE_EXTENSION_RESULTS_2026-09-02.md`

## CAP-24 commercial evidence checkpoint

CAP-24 selected real sold SKU `1636048691` for August 2026 and proved:

- Seller Analytics revenue: `259136.00 RUB`;
- `ordered_units = 155`;
- exact directly attributable Ozon finance costs: `113264.00 RUB`;
- known-attributable Ozon-side contribution: `145872.00 RUB`;
- known-attributable contribution / ordered unit: `941.11 RUB`.

Strongly target-linked historical advertising spend `35785.11 RUB` is kept outside the strict exact core because the arbitrary August historical SKU membership interval is not exposed.

Product-level placement/storage amount is `PLACEMENT_ATTRIBUTION_NOT_AVAILABLE`, not proven zero. The report generation/file path was exercised end-to-end, a real XLSX relationship-target parser defect was fixed at root cause and live-retested, but the final empty logical worksheet cannot be certified as a true zero from preserved evidence.

This is a commercially useful but truthfully bounded result, hence:

`PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY`

## Phase 6 — Consolidated Bridge guidance / capability hardening package

Status: **ACTIVE**

Entry gate is satisfied because the complete **44-row Sol evidence pass is finished**.

### H1 — consolidated root-cause gap ledger

Group all observed findings by root cause, not by test number. At minimum classify findings as:

- `BRIDGE_EXECUTION_DEFECT`
- `BRIDGE_GUIDANCE_OR_RECOVERY_GAP`
- `BRIDGE_CAPABILITY_COVERAGE_GAP`
- `PROVIDER_ACCOUNT_ENTITLEMENT_OR_DATA_BOUNDARY`
- `AI_ORCHESTRATION_ERROR`
- `OUTPUT_OR_ARTIFACT_GAP`
- `NO_ACTION_REQUIRED / DOCUMENTED_LIMIT`

For every finding record:

- affected rows;
- exact evidence authority;
- whether the business job still completed;
- whether operator rescue was required;
- whether the issue is current after later repairs;
- whether a Bridge change is justified;
- regression needed if changed.

### H2 — coherent hardening design

Design one machine-readable Bridge contract/guidance package rather than provider-specific prompt hacks or per-test exceptions.

Preserve:

- physical request cardinality;
- no hidden behavior;
- privacy/opaque-reference guarantees;
- bounded capability discovery;
- explicit batching semantics;
- deterministic stepwise dependencies;
- entitlement/data-readiness distinctions;
- source semantics and no fabricated zeros/attribution.

### H3 — affected-row regression matrix

Map each proposed hardening item to all affected Sol rows and shared regressions.

### H4 — executable implementation

**BLOCKED ON EXPLICIT OPERATOR AUTHORIZATION.**

Documentation/diagnostic design may proceed; executable Bridge patching may not.

### H5 — hardened Sol rerun

After authorized implementation, rerun every affected Sol row plus shared regressions.

Gate:

`SOL_44_TEST_GATE_HARDENED_REGRESSION_PASS`

## Phase 7 — GPT-5.6 Sol hardened regression

Status: BLOCKED ON PHASE 6 DESIGN + AUTHORIZED IMPLEMENTATION

Do not rerun all 44 blindly. Use the affected-row regression matrix plus shared safety/cardinality/capability-awareness tests.

Required outcome:

- business answer still correct;
- known recovery/capability mechanics deterministic without operator rescue;
- no hidden requests introduced;
- prior provider/data/entitlement boundaries remain boundaries rather than being falsely converted into Bridge “fixes”.

Gate to proceed:

`SOL_44_TEST_GATE_HARDENED_REGRESSION_PASS`

## Phase 8 — Alice Free + Bridge 44-row benchmark

Status: BLOCKED ON HARDENED SOL GATE

Alice must receive the **same 44-row Standard business/capability gate** against the same hardened Bridge contract.

Do not simplify questions or reduce coverage to make Alice pass.

The purpose is to measure preferred-AI portability after Bridge mechanics are normalized, not Alice's ability to reverse-engineer raw provider semantics.

## Phase 9 — Output/deliverable benchmark

Status: PENDING

Representative business queries will separately test:

- sorted table;
- graph/chart;
- CSV;
- XLSX;
- PDF;
- DOCX;
- PPTX;
- JSON;
- XML.

Artifact capability is scored separately from business-answer correctness.

## Phase 10 — Commercial decision checkpoint

Status: BLOCKED ON HARDENED SOL + ALICE RESULTS

Answer:

1. What exactly can we sell?
2. Which Standard business jobs are reliably solved?
3. Does the AI understand enough of the Bridge capability surface to behave like a worker rather than an endpoint-specific chatbot?
4. How much manual report/Excel work is eliminated?
5. Which correlations create strongest willingness-to-pay value?
6. Which failures are provider/data/entitlement/Bridge/model/output related?
7. Can weak consumer AIs recover, discover capabilities and orchestrate explicit batches deterministically using Bridge guidance?
8. What can marketing truthfully promise?
9. Does preferred-AI portability remain credible?
10. Which gaps must be fixed before commercial release?
11. Is further multi-AI expansion commercially justified?
12. What price is justified by the set of reliably solved seller jobs and time/risk eliminated?

Decision statuses:

- `COMMERCIAL_CORE_VALIDATED`
- `COMMERCIAL_CORE_VALIDATED_WITH_PRIORITY_GAPS`
- `COMMERCIAL_VALUE_NOT_YET_PROVEN`
- `PRODUCT_DIRECTION_RETHINK_REQUIRED`

## Phase 11 — Premium extrapolation and later direct validation

Status: DEFERRED

Premium results may be extrapolated only where business logic and Bridge orchestration are materially identical except for entitlement/data availability. Premium-specific semantics remain unproven until direct validation.

## Phase 12 — Additional AI providers

Status: PAUSED

Only after the commercial decision checkpoint. Each provider uses the same hardened Bridge contract and same frozen 44-row gate unless a later gate-promotion authority explicitly adds a distinct capability.

## Current exact checkpoint

`SOL_PRIMARY_GATE_44_COMPLETE__PHASE_6_H1_CONSOLIDATED_GAP_LEDGER_ACTIVE__NO_NEW_PRIMARY_BUSINESS_ROW`

Next work:

1. build the consolidated 44-row Sol root-cause gap ledger from final evidence;
2. deduplicate repeated incidents so one root cause is not counted as many product defects;
3. separate Bridge-fixable issues from provider/account/entitlement/data boundaries and AI-orchestration mistakes;
4. design the coherent hardening package and affected-row regression matrix;
5. do **not** implement executable Bridge changes without explicit operator authorization;
6. after authorization and implementation, pass hardened Sol regression;
7. only then run Alice Free on the same 44-row gate;
8. run output-artifact benchmark and make the commercial/pricing decision from evidence.
