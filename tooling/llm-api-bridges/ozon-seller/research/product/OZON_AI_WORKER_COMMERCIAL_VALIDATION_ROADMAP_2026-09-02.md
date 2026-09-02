# Ozon AI Worker — Commercial Validation Roadmap

Date: 2026-09-02
Status: ACTIVE
Product gate: `STANDARD_SOL_LIVE_BENCHMARK_ACTIVE_WITH_WEAK_MODEL_RECOVERY_GAP_DISCOVERED`
Authority TZ: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`
Current core: `OZON_AI_WORKER_COMMERCIAL_QUERY_CORE_V2_2026-09-02.md`
Standard live benchmark: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V2_2026-09-02.md`
Weak-model recovery requirement: `OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`
Failure diagnostics: `OZON_AI_WORKER_LIVE_FAILURE_DIAGNOSTICS_2026-09-02.md`
Demand evidence: `OZON_AI_WORKER_REAL_DEMAND_SOURCE_LEDGER_2026-09-02.md`
Instant-BI/correlation evidence: `OZON_AI_WORKER_INSTANT_BI_CORRELATION_RESEARCH_2026-09-02.md`
Free-AI output matrix: `OZON_AI_WORKER_FREE_AI_OUTPUT_CAPABILITY_MATRIX_2026-09-02.md`
Competitive landscape: `OZON_AI_WORKER_COMPETITIVE_LANDSCAPE_2026-09-02.md`
Synthesis: `OZON_AI_WORKER_COMMERCIAL_RESEARCH_SYNTHESIS_2026-09-02.md`

## Goal

Build an evidence-backed commercial query core that defines what the Ozon AI worker must solve to have a credible sellable value proposition. Benchmark the same Standard core first on GPT-5.6 Sol + Bridge, then harden model-independent Bridge guidance based on observed failures, rerun affected Sol rows, and only after that benchmark Alice Free + Bridge and later providers.

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

Status: COMPLETE / STANDARD SUBSET FROZEN FOR LIVE TEST

Full V2 research core: 57 business rows + 9 output tests.
Current Standard-only live subset: 28 diverse business queries.
Premium testing is deferred; results will later be extrapolated cautiously from Standard where architecture is equivalent and separately marked where entitlement/data semantics prevent safe extrapolation.

## Phase 4 — GPT-5.6 Sol + Bridge Standard live benchmark

Status: ACTIVE

For every frozen Standard query record:

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

Therefore STD-01 is not a clean PASS. It is:

`PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP`

This is evidence that raw provider-error recovery cannot safely be delegated to weaker models.

## Phase 4A — Collect weak-model contract gaps during Sol

Status: ACTIVE

Do not patch the Bridge separately after every row. Continue the current Sol Standard benchmark and collect evidence-backed contract/guidance failures such as:

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

## Phase 5 — Bridge guidance hardening package

Status: BLOCKED ON COMPLETION OF SOL STANDARD BENCHMARK

After Sol completes:

1. group all observed model-independent recovery/guidance gaps;
2. design one coherent Bridge contract hardening package rather than provider-specific prompt hacks;
3. preserve `ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`;
4. preserve no hidden retry/fanout;
5. add deterministic machine-readable recovery metadata for evidence-backed failure classes;
6. add local/adaptive rate-limit guidance only where it is explicitly Bridge policy, never invented as provider truth;
7. rerun every affected Sol row on the hardened candidate;
8. require affected Sol rows to pass without operator rescue before freezing the Alice candidate.

## Phase 6 — GPT-5.6 Sol hardened regression

Status: BLOCKED ON PHASE 5

Only affected rows and a short regression suite need rerun after guidance hardening. Record both answer correctness and whether the model followed Bridge recovery guidance without operator intervention.

Gate to proceed:

`SOL_STANDARD_HARDENED_RECOVERY_REGRESSION_PASS`

## Phase 7 — Alice Free + Bridge benchmark

Status: BLOCKED ON SOL STANDARD + HARDENING REGRESSION

Alice must receive the same frozen business questions against the same hardened Bridge contract. Do not simplify queries to make Alice pass.

This prevents the Alice test from accidentally measuring whether Alice can reverse-engineer raw HTTP/provider failure semantics that should have been normalized by Bridge.

## Phase 8 — Output/deliverable benchmark

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

## Phase 9 — Commercial decision checkpoint

Status: BLOCKED ON SOL + HARDENED SOL + ALICE RESULTS

Answer:

1. What exactly can we sell?
2. Which Standard business jobs are reliably solved?
3. How much manual report/Excel work is eliminated?
4. Which correlations create strongest willingness-to-pay value?
5. Which failures are data/Bridge/model/output related?
6. Can weak consumer AIs recover deterministically using Bridge guidance?
7. What can marketing truthfully promise?
8. Does preferred-AI portability remain credible?
9. Which gaps must be fixed before commercial release?
10. Is further multi-AI expansion commercially justified?

Decision statuses:

- `COMMERCIAL_CORE_VALIDATED`
- `COMMERCIAL_CORE_VALIDATED_WITH_PRIORITY_GAPS`
- `COMMERCIAL_VALUE_NOT_YET_PROVEN`
- `PRODUCT_DIRECTION_RETHINK_REQUIRED`

## Phase 10 — Premium extrapolation and later direct validation

Status: DEFERRED

Current live benchmark is Standard-only. Premium results may be extrapolated only where the business logic and Bridge orchestration are materially identical except for entitlement/data availability. Any Premium-specific API semantics remain unproven until a later direct test.

## Phase 11 — Additional AI providers

Status: PAUSED

Only after the commercial decision checkpoint. Each provider uses the same hardened Bridge contract and same frozen business-query benchmark.

## Current exact checkpoint

`SOL_STANDARD_LIVE_ACTIVE_STD_01_PASS_WITH_429_RECOVERY_GUIDANCE_GAP_STD_02_NEXT`

Next work:

1. continue Standard Sol benchmark from STD-02;
2. record every operational/recovery issue without skipping;
3. finish all Standard Sol rows;
4. harden Bridge guidance from accumulated evidence;
5. rerun affected Sol rows;
6. only then run Alice Free;
7. make commercial decision before resuming multi-AI expansion.
