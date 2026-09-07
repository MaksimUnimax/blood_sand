# Ozon AI Worker — Sol 44 consolidated root-cause gap ledger

Date: 2026-09-06
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `H1_COMPLETE__ROOT_CAUSES_DEDUPLICATED__H2_HARDENING_DESIGN_NEXT`
Scope: completed Standard Sol primary gate `STD-01..STD-20 + CAP-01..CAP-24`.

Primary terminal result authority:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Roadmap phase authority:
`OZON_AI_WORKER_COMMERCIAL_VALIDATION_ROADMAP_2026-09-02.md`

Rules:

- deduplicate by root cause, not by number of failing runs;
- separate provider/account/data boundaries from Bridge defects and AI-orchestration errors;
- do not turn a provider/data limitation into a Bridge patch merely to make a benchmark green;
- no executable Bridge change is authorized by this ledger;
- all proposed executable work remains blocked on explicit operator authorization.

## Executive result

The 44-row Sol gate is commercially complete but not yet weak-model hardened.

The observed non-clean outcomes collapse into **18 root-cause classes** rather than dozens of independent defects:

- 1 previously real Bridge execution defect is already root-fixed and live-retested;
- 8 current Bridge guidance/contract/capability candidates justify hardening design before Alice;
- 4 current provider/account/data boundaries must remain explicit rather than be “fixed” by invention;
- 2 AI-orchestration/process classes require authority/recipe/regression discipline rather than transport patches;
- 3 documented/no-action classes must remain visible so they are not repeatedly rediscovered as defects.

The most important H2 work is deterministic recovery/continuation/semantics/readiness/entitlement guidance, not hidden retries or provider-specific hacks.

## Root-cause ledger

| ID | Priority | Root cause / class | Type | Affected rows / evidence | Current state | Bridge change justified? | Required H2 / regression consequence |
|---|---|---|---|---|---|---|---|
| H1-01 | P0 | Weak-model recovery after real provider transient/rate-limit failure is not deterministic enough from raw failure semantics | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` | STD-01, STD-02, STD-13, STD-20, CAP-14, CAP-20; CAP-24 finance `/types` recurrence. Authorities: `OZON_AI_WORKER_WEAK_MODEL_RECOVERY_CONTRACT_REQUIREMENT_2026-09-02.md`, `OZON_AI_WORKER_LIVE_FAILURE_DIAGNOSTICS_2026-09-02.md` | OPEN | YES — guidance/recovery contract, not hidden retry | expose machine-readable retryability, same-job preservation, no-zero warning, repeated-failure escalation, safe timing source; rerun representative analytics + non-analytics 429 rows without operator rescue |
| H1-02 | P0 | Offset/list pagination completeness sometimes requires AI inference because result-level continuation is null/ambiguous | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` | STD-05 and STD-08; contrast CAP-12/CAP-17 where explicit provider pagination could be completed. Authority: weak-model recovery requirement | OPEN | YES | generic continuation metadata: requested page size, rows returned, completeness known/unknown, next explicit offset/page recommendation, automatic pagination=false; regression must prove no hidden pagination |
| H1-03 | P0 | Cross-source monetary/order metrics are correlated but not guaranteed to reconcile 1:1 | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` | STD-05, STD-20, CAP-18, CAP-20, CAP-24. Examples: Seller `revenue` vs Performance `ordersMoney`; finance `sale_amount` vs Seller revenue | OPEN | YES | semantic metadata/recipes for accounting vs attribution metrics; explicitly prohibit substitution/double counting; regression on DRR + unit-economics joins |
| H1-04 | P0 | Identifier typing and mechanical parameter repair are weak-model-hostile for int64 identifiers represented as strings | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` | STD-05 `seller_product_list` numeric SKU local rejection; CAP-21 SKU/product_id typing/recovery | OPEN | YES | operation recipes and schema errors should echo expected semantic identifier + string form and exact safe repair; regression using numeric-vs-string SKU/product_id attempts with 0 unintended provider requests |
| H1-05 | P0 | Local request contract is too permissive on some operations whose live provider requires a non-empty selector/filter | `BRIDGE_EXECUTION_DEFECT` / contract-validation drift candidate | STD-10 `ozon_warehouse_list {}` -> provider 400; STD-14 `product_visibility_info {}` -> provider 400 | OPEN / ROOT CAUSE CLASS PROVEN, exact provider requirements per operation need contract review | YES, if registry/provider contract confirms required selector | tighten operation-specific validator/template or return deterministic local guidance; must not burn provider request for a mechanically invalid empty selector after hardening |
| H1-06 | P0 | Static entitlement projection can disagree with live provider permission state | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` + entitlement-model gap | CAP-16 review count: provider 403 while roles include review methods and Bridge entitlement was unknown; CAP-22 `pricing_strategy_ids_by_product_ids`: provider 403 despite static `SUPPORTED_AND_ENTITLED / all_accounts` | OPEN | YES | distinguish static catalog entitlement, live role presence, provider permission result and account/subscription state; never convert 403 to empty business data; rerun representative review/pricing permission branches |
| H1-07 | P0 | Query/search data readiness/freshness is not represented in preflight, forcing live 403 diagnosis | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` | STD-05 search investigation; CAP-21 recent `product_queries`/details 403 while older 2026-08-29 returns 200 | OPEN | YES | machine-readable `DATA_NOT_READY_OR_QUERY_WINDOW_UNKNOWN`, safe older-date recipe where proven, and explicit distinction from subscription denial; regression recent blocked date + proven-ready control date |
| H1-08 | P0 | Provider omission / missing-row semantics can be mistaken for zero | `BRIDGE_GUIDANCE_OR_RECOVERY_GAP` + provider data boundary | CAP-05 turnover omitted four current SKUs even when two had stock; CAP-19 stock surface omission boundary; also general stock joins in STD-07/18 | OPEN | YES — semantic/coverage guidance, not data fabrication | response coverage metadata and `MISSING_ROW_IS_NOT_ZERO`; cross-surface regression must preserve UNKNOWN vs ZERO vs POSITIVE |
| H1-09 | P1 | Provider role exposes category-comparison endpoint but active Bridge registry has no allowlisted operation | `BRIDGE_CAPABILITY_COVERAGE_GAP` | CAP-23: `/v1/analytics/category/comparison` present in provider roles; no active registry operation | OPEN PRODUCT CAPABILITY DECISION | YES only after provider contract research + operator authorization | H2 design exact operation/entitlement/privacy contract and commercial value; do not implement silently; CAP-23 affected-row regression if added |
| H1-10 | P1 | Real XLSX report relationship target was resolved as `xl/xl/...` | `BRIDGE_EXECUTION_DEFECT` | CAP-24 Runs 24–27 | FIXED | DONE — no new change required | retain regression from commit `cb353190c3e13a644601198c6a854b99356f20d6`; live acceptance already passed after root fix commit `92773026e479671160aab42c0f7590da155e1184` |
| H1-11 | P1 | Successful XLSX materialization can yield an empty logical table without enough structural diagnostics to prove provider no-data vs unsupported worksheet shape | `OUTPUT_OR_ARTIFACT_GAP` / observability gap | CAP-24 Run 27 + `CAP_24_RUN_28_EMPTY_PLACEMENT_XLSX_DIAGNOSTIC_AND_COVERAGE_BOUNDARY_2026-09-06.md` | OPEN OBSERVABILITY BOUNDARY; second parser bug NOT proven | YES for safe structural observability; broader parsing only if evidence later proves unsupported shape | expose sanitized worksheet dimension/row/cell structural counts or explicit unsupported-shape state without leaking file/raw XML; regression must distinguish true empty worksheet from parsed-empty/unsupported shape |
| H1-12 | P1 | Explicit independent reads were unnecessarily serialized because AI/outdated authority conflated per-command request cardinality with per-turn command count | `AI_ORCHESTRATION_ERROR` + outdated authority | CAP-24 finance-day collection; authority `OZON_AI_WORKER_EXPLICIT_BATCH_ORCHESTRATION_DEFECT_AND_RULE_2026-09-06.md` | FIXED IN METHODOLOGY/AUTHORITY | NO Bridge transport patch; batch capability already present | retain `EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS`; hardened Sol/Alice regression must prove explicit multi-command batch for known-upfront reads and stepwise dependencies for cursors/report refs |
| H1-13 | P1 | AI can construct malformed batch payload or choose an endpoint whose period contract does not fit the business request | `AI_ORCHESTRATION_ERROR` | CAP-24 malformed one-marker + JSON-array attempt; wrong August use of near-current `performance_sku_statistics` | OPEN AS PORTABILITY/RECIPE RISK | MAYBE guidance/recipes, no transport defect proven | H2 should strengthen examples/parameter constraints and planner-visible period limitations; regression: invalid array remains local/no provider request; historical ad task must choose valid historical surface without operator correction |
| H1-14 | P1 | Expected transport normalization can make `exact_request_preserved=false` / `command_transformed=true`, requiring provenance clarity | `NO_ACTION_REQUIRED / DOCUMENTED_LIMIT` unless audit evidence later fails | CAP-04 FBO/FBS stock; STD-13 FBO stock; CAP-12 continuation; CAP-21 query details | CURRENT BUT AUDITABLE | NO current execution defect proven | keep visible normalized vs requested request metadata and one-command/one-physical invariant; shared provenance regression only |
| H1-15 | P2 | `finance_accrual_types` is a reference dictionary whose repeated identical use enters provider method-specific protection state | `PROVIDER_ACCOUNT_ENTITLEMENT_OR_DATA_BOUNDARY` + operating-pattern issue | CAP-14 and CAP-24; authority `CAP_24_FINANCE_ACCRUAL_TYPES_ROOT_CAUSE_AND_OPERATING_SOLUTION_2026-09-06.md` | OPERATING SOLUTION COMPLETE | NO rate-limit-control patch justified | fetch provider dictionary once, persist/reuse, refresh only on unknown type/evidence trigger; never invent fixed TTL/cooldown; regression should prove no needless repeated `/types` call in finance workflow |
| H1-16 | P2 | Concrete target-product competitor discovery is not proven by current Standard pricing-strategy surfaces | `PROVIDER_ACCOUNT_ENTITLEMENT_OR_DATA_BOUNDARY` / capability boundary | CAP-22 | OPEN COVERAGE BOUNDARY | NO current fix proven; investigate only if a provider-backed target-link operation exists | keep `PARTIAL` commercial claim; optional future provider/API research before any Bridge expansion; never rescue with hand-picked public competitor |
| H1-17 | P2 | Arbitrary historical monthly SKU membership for Performance campaigns is not exposed by current tested contract | `PROVIDER_ACCOUNT_ENTITLEMENT_OR_DATA_BOUNDARY` | CAP-24 Runs 19–21; advertising boundary authority | CLOSED AS DOCUMENTED COVERAGE LIMIT | NO current Bridge fix proven | keep historical campaign spend separate/caveated; if provider later exposes historical SKU membership, add only via new evidence/contract and rerun CAP-24 |
| H1-18 | P2 | Some business evidence is gated by account privacy/user settings rather than Bridge/business data absence | `PROVIDER_ACCOUNT_ENTITLEMENT_OR_DATA_BOUNDARY` | STD-09 required explicit operator privacy-setting intervention | DOCUMENTED | NO automatic bypass allowed | guidance must identify the privacy boundary and required user-controlled setting; never weaken privacy or auto-change account settings; regression only if privacy-guidance code changes |

## Deduplication decisions

### 1. Multiple HTTP 429 results are not multiple Bridge defects

The following were deliberately not counted as separate transport defects:

- analytics 429s in STD-01/02/20/CAP-20;
- FBO stock transient 429 in STD-13;
- finance `/types` 429s in CAP-14/CAP-24.

They have different provider-method evidence, but share one portability requirement: the Bridge result must make same-job recovery/non-zero semantics deterministic without hidden retry. The finance `/types` case also has its own provider-specific operating rule because it is a reference dictionary and repeated reads are the wrong workflow.

### 2. HTTP 403 does not define one root cause

CAP-16, CAP-21 and CAP-22 all observed 403 behavior, but evidence supports different classes:

- CAP-16: review permission/entitlement ambiguity despite role presence;
- CAP-21: recent-data freshness/queryability strongly supported by older-date 200 controls;
- CAP-22: static all-accounts entitlement projection conflicts with provider permission result.

Therefore one generic `HTTP_403_FIX` would be incorrect.

### 3. Provider omission is not zero

CAP-05 and CAP-19 are grouped around missing-row/coverage semantics. The provider may omit a SKU from one surface even while another surface proves the product exists/has stock. Hardening must preserve UNKNOWN/NOT_RETURNED rather than manufacture a zero.

### 4. Coverage boundaries are not benchmark failures to patch away

CAP-22 competitor discovery, CAP-23 Premium/category-position limits, and CAP-24 historical ad/placement attribution boundaries are commercially important truth. They remain bounded capabilities unless a new provider-backed operation/evidence proves additional coverage.

### 5. AI orchestration errors are not Bridge execution defects

The CAP-24 explicit batching mistake, malformed JSON-array batch, and wrong near-current endpoint choice are separated from Bridge/provider defects. Bridge may improve recipes/constraints, but the evidence does not justify calling transport broken.

## H2 hardening candidates — ordered

### P0-A — Unified machine-readable recovery contract

Cover:

- provider failure class;
- business result validity;
- retryable yes/no/unknown;
- repeat-same-logical-command guidance;
- repeated failure count/escalation;
- no-zero/no-empty interpretation guard;
- safe timing source without invented provider reset;
- exact logical command fingerprint / sanitized repair recipe.

Must preserve:
`automatic_retry=false`.

### P0-B — Unified continuation contract

Expose explicit continuation/completeness metadata for offset/page/cursor styles without performing continuation automatically.

Must preserve:
`automatic_pagination=false`.

### P0-C — Semantic/coverage contract

Expose enough machine-readable semantics for weak models to distinguish:

- Seller accounting revenue vs Performance attributed order value;
- finance sale amount vs canonical sales authority;
- FBO-only vs FBO+FBS total stock;
- absent provider row vs numeric zero;
- provider/query data not ready vs entitlement denial;
- static entitlement projection vs live role/provider permission.

### P0-D — Mechanical operation recipes

For operations with known weak-model-hostile mechanics, expose compact recipes:

- identifier namespace + expected int64 string form;
- required non-empty selectors;
- allowed date/readiness constraints;
- explicit safe fallback operation where one is a distinct documented capability, not an invented substitute.

### P1-E — Capability coverage + report observability

Separate product decisions from reliability fixes:

- evaluate `/v1/analytics/category/comparison` registry coverage as an explicit commercial capability candidate;
- add sanitized XLSX structural observability before deciding that another parser expansion is required.

Do not combine these with P0 recovery fixes.

## Affected-row regression matrix draft

| Hardening block | Minimum affected Sol reruns | Shared regression |
|---|---|---|
| Recovery contract | STD-01 or STD-20 analytics recurrence/control; STD-13 non-analytics recovery; CAP-14 finance reference recovery | one explicit command <= one physical request; no auto retry; repeated failure state preserved |
| Continuation contract | STD-08 offset/list case; CAP-12 cursor/last_id control; CAP-17 page inventory control | no hidden pagination; completeness cannot be asserted before terminal signal |
| Cross-source semantics | STD-20 DRR; CAP-18 Performance stats; CAP-24 unit economics | no Seller/Performance/Finance metric substitution or double counting |
| Identifier/parameter recipes | STD-05 identifier type repair; STD-10 or STD-14 empty-selector case; CAP-21 query/attribute identifiers | invalid mechanical request blocked locally when deterministically known; 0 provider requests on local validation |
| Entitlement/readiness | CAP-16 review boundary; CAP-21 recent-vs-ready query dates; CAP-22 pricing-strategy permission branch | 403 not interpreted as zero; correct boundary class and next action exposed |
| Missing-row semantics | CAP-05 turnover omissions; CAP-19 ad-to-stock join | missing/omitted remains UNKNOWN/NOT_RETURNED, not zero |
| Explicit batching | one known-upfront multi-date/SKU read; one dependent report/cursor flow | multiple separate markers accepted; N explicit <= N physical; dependency remains stepwise |
| XLSX relationship regression | existing synthetic report regression only unless code changes | `xl/worksheets/...` normalization remains correct |
| XLSX structural observability | CAP-24 report-file fixture + true-empty synthetic workbook + non-empty workbook | true empty vs unsupported/unparsed shape distinguishable without raw file leakage |
| Category-comparison capability if authorized | CAP-23 only | entitlement/privacy/request-cardinality tests for new registry operation |

## Explicitly not authorized by H1

This ledger does **not** authorize:

- automatic provider retry;
- automatic pagination;
- fixed invented Ozon cooldowns;
- bypassing privacy or subscription gates;
- heuristic SKU allocation of account-level finance/placement costs;
- manually selecting competitor products and calling them provider-discovered;
- adding `/v1/analytics/category/comparison` to registry;
- changing XLSX parser behavior;
- any other executable Bridge patch.

Those decisions belong to H2 design and then explicit operator authorization before H4 implementation.

## H1 completion marker

`SOL_44_H1_ROOT_CAUSE_LEDGER_COMPLETE__18_CLASSES__P0_HARDENING_DESIGN_NEXT__NO_EXECUTABLE_PATCH_AUTHORIZED`

## Exact next action

Proceed directly to **H2 coherent hardening design** for the P0 blocks and H3 affected-row regression matrix refinement.

Do not issue a new Ozon business request while H2/H3 can be completed from preserved evidence.
