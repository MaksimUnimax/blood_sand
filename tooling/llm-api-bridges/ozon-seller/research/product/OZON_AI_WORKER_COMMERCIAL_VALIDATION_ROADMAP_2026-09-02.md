# Ozon AI Worker — Commercial Validation Roadmap

Date: 2026-09-02
Status: ACTIVE
Product gate: `FORTY_TEST_STANDARD_GATE_ACTIVE_LAYER_A_THEN_CAPABILITY_AWARENESS_LAYER_B`
Authority TZ: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Current core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V2_2026-09-02.md`
Standard live benchmark: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V2_2026-09-02.md`
Capability-awareness layer: `OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`
Weak-model recovery requirement: `OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`
Failure diagnostics: `OZON_AI_WORKER_LIVE_FAILURE_DIAGNOSTICS_2026-09-02.md`
Demand evidence: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`
Instant-BI/correlation evidence: `OZON_AI_WORKER_INSTANT_BI_CORRELATION_RESEARCH_2026-09-02.md`
Free-AI output matrix: `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`
Competitive landscape: `OZON_AI_WORKER_COMPETITIVE_LANDSCAPE_2026-09-02.md`
Synthesis: `OZON_AI_WORKER_COMMERCIAL_RESEARCH_SYNTHESIS_2026-09-02.md`

## Goal

Build an evidence-backed commercial query core that proves whether the Ozon AI worker is actually sellable. The live Standard product gate is now exactly **40 tests** split into two layers:

- **Layer A: STD-01..STD-20** — real sellable business questions using the current Bridge contract.
- **Layer B: CAP-01..CAP-20** — capability-awareness/product-logic tests that prove whether the AI understands the breadth of Bridge data and can select materially different data surfaces and correlations without the operator teaching it API operations.

After both Sol layers are complete, harden model-independent Bridge guidance based on observed failures, rerun affected Sol rows, and only then benchmark Alice Free + Bridge and later providers.

Product = preferred AI + Ozon Bridge + Ozon cabinet data + external/public context + AI reasoning + requested deliverable.

Coverage is measured at the level of a solved business job, not an API endpoint.

## Mandatory benchmark rules

1. `NO_SKIP_ON_FAILURE` — failed/blocked rows are diagnosed before moving on.
2. One user business question may require multiple explicit Bridge runs.
3. Exactly one `OZON_API_V1` command is sent at a time.
4. Premium endpoints/metrics are excluded from the current Standard pass.
5. Business answer correctness and operational reliability are scored separately.
6. Any failure that required operator intervention because the AI/Bridge contract did not make the next action deterministic is recorded as a weak-model portability gap.
7. `DO_NOT_REQUIRE_MODEL_INTELLIGENCE_FOR_KNOWN_RECOVERY_MECHANICS` — known provider/transport recovery behavior should ultimately be normalized by Bridge guidance rather than inferred independently by each AI.
8. `DO_NOT_CONFUSE_REPHRASING_WITH_CAPABILITY_COVERAGE` — changing dates, top-N, sorting or interpretation while using the same underlying data source does not prove the worker knows the Bridge capability surface.
9. A Layer B test is valid only if it exercises a materially different data surface or a materially new multi-surface orchestration path.

## Phase 0 — Product framing and preservation

Status: COMPLETE

- [x] Freeze AI-worker product model.
- [x] Freeze target segments.
- [x] Freeze demand-first research rule.
- [x] Freeze provider order: Sol → Alice → additional providers.
- [x] Freeze authenticated zero-cost AI tier as default baseline.
- [x] Preserve work on dedicated research branch.

## Phase 1 — Current capability inventory

Status: COMPLETE FOR PRE-TEST MAPPING

- [x] Broad Seller API + Performance API read registry confirmed.
- [x] Standard/Premium entitlement logic confirmed.
- [x] Seller and Performance data can be requested independently and correlated by AI.
- [x] Known gaps preserved rather than marketed as covered.

## Phase 2 — External real-demand corpus

Status: COMPLETE FOR CURRENT CORE

Demand evidence collected from seller forums, official Ozon materials, agencies/freelancers, analytics products, AI competitors, public incidents, report-reconciliation pain and manual Excel workflows.

## Phase 3 — Commercial core

Status: COMPLETE / STANDARD LIVE GATE DEFINED

Full V2 research core: 57 business rows + 9 output tests.

Primary live Standard gate: **40 tests = 20 + 20**.

- Layer A uses STD-01 through STD-20.
- Layer B uses CAP-01 through CAP-20.
- Existing STD-21 through STD-28 are preserved as reserve/extended commercial cases outside the primary 40-test gate; they are not deleted.

Premium testing is deferred; results will later be extrapolated cautiously from Standard where architecture is equivalent and separately marked where entitlement/data semantics prevent safe extrapolation.

## Phase 4 — Layer A: GPT-5.6 Sol + Bridge business-job benchmark

Status: ACTIVE

Run `STD-01` through `STD-20`.

For every row record:

- user-level intent understanding;
- operation/request selection;
- multi-run investigation where needed;
- external-source use where needed;
- joins/calculation/sorting;
- uncertainty discipline;
- final business usefulness;
- first-attempt success vs recovery path;
- any model/operator intervention needed to recover;
- PASS / PARTIAL / FAIL / BLOCKED plus reliability flags.

### STD-01 finding

`STD-01` eventually produced the correct answer (27,200 RUB revenue, 16 ordered units for 2026-09-01), but the first two identical `/v1/analytics/data` calls returned provider HTTP 429 before the third identical call succeeded after a longer quiet period.

Important product finding: GPT-5.6 Sol initially attempted to move on rather than immediately preserve the same business job and recover it; the operator had to enforce `NO_SKIP_ON_FAILURE`.

Therefore STD-01 is:

`PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP`

This proves raw provider-error recovery cannot safely be delegated to weaker models.

## Phase 4A — Collect weak-model contract gaps during Layer A

Status: ACTIVE

Do not patch the Bridge separately after every row. Continue Layer A and collect evidence-backed contract/guidance failures such as:

- 429/rate-limit recovery;
- malformed/unsupported refinement recovery;
- entitlement/privacy guidance;
- pagination continuation;
- empty-result vs error distinction;
- exact retry-command preservation;
- diagnostics after repeated identical provider failure;
- any place where Sol needed operator intervention or non-obvious API-specific inference.

Authority requirement document:

`OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`

## Phase 5 — Layer B: GPT-5.6 Sol capability-awareness / product-logic benchmark

Status: BLOCKED UNTIL STD-20 COMPLETE

Start immediately after `STD-20`.

Run exactly 20 additional tests `CAP-01` through `CAP-20` according to:

`OZON_AI_WORKER_CAPABILITY_AWARENESS_LAYER_20_TESTS_2026-09-02.md`

### Purpose of Layer B

Layer A proves whether the worker can answer selected commercial questions. Layer B proves whether the AI actually understands what the Bridge can do.

Specifically test whether the AI:

- recognizes that requested Ozon information can be obtained through Bridge;
- selects the correct semantic data family without being told an operation name;
- uses bounded command discovery/help when uncertain instead of inventing operations;
- does not default to `analytics_data` for unrelated tasks;
- understands distinct surfaces such as catalog, visibility, card diagnostics, stocks, turnover, warehouses/clusters, supply orders, postings, prices, promotions, returns, finance, ratings/FBS errors, reviews/questions and Performance advertising;
- performs sequential multi-run orchestration across different surfaces when the business job requires it;
- combines Bridge data with external/public context when appropriate;
- distinguishes unavailable data, entitlement/privacy gates and provider errors from real business zeros;
- finishes without operator teaching the model the API inventory.

### Existing guided-discovery context

The repository already contains `OZON_GUIDED_COMMAND_DISCOVERY_SPEC_2026-08-21.md`, created because Alice previously invented unsupported commands when it did not understand the Bridge contract.

That design mainly handles invalid attempts after they happen. Layer B will determine whether commercial weak-model portability also requires stronger proactive/bounded capability-awareness guidance so the model knows what kinds of information the Bridge can obtain before it guesses.

## Phase 6 — Consolidated Bridge guidance hardening package

Status: BLOCKED ON COMPLETION OF BOTH SOL LAYERS

After STD-20 + CAP-20:

1. group all observed recovery, discovery and capability-awareness gaps;
2. design one coherent Bridge contract hardening package rather than provider-specific prompt hacks;
3. preserve `ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`;
4. preserve no hidden retry/fanout;
5. add deterministic machine-readable recovery metadata for evidence-backed failure classes;
6. add bounded capability discovery/awareness where evidence shows weak models need it;
7. ensure the AI can learn available semantic data families without receiving credentials/transport control or a giant fragile operation manual;
8. rerun every affected Sol row;
9. require affected Sol rows to pass without operator rescue before freezing the Alice candidate.

## Phase 7 — GPT-5.6 Sol hardened regression

Status: BLOCKED ON PHASE 6

Rerun all affected STD/CAP rows plus a short regression suite. Record both answer correctness and whether the model followed Bridge recovery/capability guidance without operator intervention.

Gate to proceed:

`SOL_40_TEST_GATE_HARDENED_REGRESSION_PASS`

## Phase 8 — Alice Free + Bridge 40-test benchmark

Status: BLOCKED ON SOL 40-TEST GATE + HARDENING REGRESSION

Alice must receive the same 40-test Standard gate against the same hardened Bridge contract. Do not simplify queries to make Alice pass.

This prevents Alice testing from measuring whether Alice can reverse-engineer raw API/provider semantics that should have been normalized by Bridge.

## Phase 9 — Output/deliverable benchmark

Status: PENDING

Representative queries will also test:

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

Status: BLOCKED ON SOL + HARDENED SOL + ALICE RESULTS

Answer:

1. What exactly can we sell?
2. Which Standard business jobs are reliably solved?
3. Does the AI understand enough of the Bridge capability surface to behave like a worker rather than an endpoint-specific chatbot?
4. How much manual report/Excel work is eliminated?
5. Which correlations create strongest willingness-to-pay value?
6. Which failures are data/Bridge/model/output related?
7. Can weak consumer AIs recover and discover capabilities deterministically using Bridge guidance?
8. What can marketing truthfully promise?
9. Does preferred-AI portability remain credible?
10. Which gaps must be fixed before commercial release?
11. Is further multi-AI expansion commercially justified?

Decision statuses:

- `COMMERCIAL_CORE_VALIDATED`
- `COMMERCIAL_CORE_VALIDATED_WITH_PRIORITY_GAPS`
- `COMMERCIAL_VALUE_NOT_YET_PROVEN`
- `PRODUCT_DIRECTION_RETHINK_REQUIRED`

## Phase 11 — Premium extrapolation and later direct validation

Status: DEFERRED

Current live benchmark is Standard-only. Premium results may be extrapolated only where the business logic and Bridge orchestration are materially identical except for entitlement/data availability. Any Premium-specific API semantics remain unproven until a later direct test.

## Phase 12 — Additional AI providers

Status: PAUSED

Only after the commercial decision checkpoint. Each provider uses the same hardened Bridge contract and same frozen 40-test gate.

## Current exact checkpoint

`FORTY_TEST_GATE_LAYER_A_ACTIVE_STD_01_DONE_STD_02_NEXT_LAYER_B_AFTER_STD_20`

Next work:

1. continue Layer A from STD-02;
2. record every operational/recovery issue without skipping;
3. finish STD-01 through STD-20;
4. freeze exact natural-language wording for CAP-01 through CAP-20 using the already frozen capability surfaces plus Layer A evidence;
5. run all 20 Layer B capability/product-logic tests on Sol;
6. consolidate recovery + capability-awareness gaps into one Bridge hardening package;
7. rerun affected Sol rows;
8. only then run Alice Free against the same 40-test gate;
9. make commercial decision before resuming multi-AI expansion.
