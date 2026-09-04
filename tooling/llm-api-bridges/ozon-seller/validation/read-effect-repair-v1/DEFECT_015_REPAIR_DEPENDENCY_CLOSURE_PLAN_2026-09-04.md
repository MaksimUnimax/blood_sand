# DEFECT-015 — consolidated repair / dependency-closure plan — 2026-09-04

## 1. Authority and execution barrier

This plan is the implementation authority for the repair phase that follows the completed static same-class audit triggered by the live `finance_balance` failure.

Executable baseline under audit:

- repository: `MaksimUnimax/blood_sand`;
- source commit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6`;
- source tree: `2c565626982c1a9a1919add09824ce2c5e44ee29`;
- extension: `v0.1.19`.

Audit authority:

- branch: `audit/ozon-date-contract-sweep-2026-09-04`;
- pre-plan audit HEAD: `b1c75a9bf6503fc382d1847f8b50d29bd4f4dc2e`;
- terminal accounting authority: `DEFECT_015_FULL_OPERATION_ACCOUNTING_2026-09-04.md`.

The static audit is complete and reconciled across all **296 registered read operations**:

- `DATE_AUDITED_MATCH`: 30;
- `DATE_AUDITED_DEFECT`: 29;
- `DATE_AUDITED_NEEDS_LIVE`: 1;
- `PROVIDER_DOCUMENTATION_AMBIGUITY`: 1;
- `LIFECYCLE_ONLY_DEFECT`: 1;
- `NOT_DATE_RELATED`: 234;
- total: 296.

This plan does **not** authorize executable edits by itself. It records what an explicitly authorized repair must change and prove.

Commercial-test barrier remains unchanged:

- STD-06 is **FROZEN ON LIVE FAIL** at `finance_balance`;
- no later STD-06 evidence and no STD-07 execution is allowed before the repaired exact artifact passes the failed step;
- no new Seller API or Performance API live calls are authorized by this plan;
- `analytics_data` remains quarantined as `NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE` and must not be guessed into either PASS or BUG;
- `finance_b2b_sales_json` remains a provider-documentation ambiguity; no invented earliest/latest boundary may be added.

## 2. Why this must be one dependency-closure repair

The sweep showed that the failure class is broader than one incorrect validator. The recurring process error is:

> primitive OpenAPI shape, permissive JavaScript date parsing, a fixed example/template, or mere presence in a fresh Swagger snapshot was treated as sufficient evidence that a request is provider-valid and current.

The repair therefore has to close all consumers of the affected contract assumptions at once:

1. reusable validators;
2. endpoint-specific business guards;
3. operation registry templates/currentness;
4. discovery/guidance and planner assumptions;
5. generated/bundled mirrors;
6. deterministic negative/boundary regressions;
7. delivery/currentness gates;
8. exact artifact packaging and post-install live acceptance.

A patch that changes only `finance_balance`, or only `ozon_contract.js`, is incomplete.

## 3. Confirmed defect population that the repair must close

### 3.1 Seller API — 20 date/period/currentness defects

1. `ozon_auto_add_products`
   - normalizer date-time syntax is acceptable;
   - hard-coded `auto_add_date` is dynamic provider state and cannot be a universal runnable template.

2. `ozon_auto_add_candidates`
   - same dynamic-provider-dependency template defect.

3. `posting_fbo_list`
   - permissive `new Date()` acceptance exists in the relevant date path instead of strict RFC3339 for every supplied boundary;
   - a single-boundary path can bypass the intended date validation;
   - existing one-year maximum behavior must be preserved while closing the syntax/partial-range gap.

4. `fbs_carriage_available_list`
   - provider-retired `/v1/posting/carriage-available/list` remains advertised as current/executable;
   - replacement `/v2/carriage/delivery/list` already exists.

5. `finance_cash_flow_statement_list`
   - RFC3339 wire shape is not the problem;
   - provider permits only half-month report periods (1–15 or 16–last day);
   - the current Aug 1–28 runnable template violates that rule.

6. `finance_transaction_list_v3`
   - missing provider maximum one-month period guard;
   - provider shutdown deadline is 2026-09-08;
   - accrual replacement operations already exist and must become the current guidance path.

7. `finance_balance`
   - **LIVE-CONFIRMED BUG**;
   - effective provider wire format is real `YYYY-MM-DD`, not RFC3339 timestamps;
   - missing ordering and maximum 30-day guards;
   - registry template has the same wrong timestamp shape.

8. `finance_realization_by_day`
   - missing representable-calendar-date validation;
   - missing 32-calendar-day recency rule.

9. `finance_realization_posting`
   - missing month domain `[1,12]`;
   - missing earliest effective business period `2023-08`.

10. `finance_realization_v2`
    - missing earliest effective business period `2023-08`;
    - shared month-domain repair must cover this operation together with posting realization.

11. `finance_products_buyout`
    - raw strings instead of real YMD validation;
    - missing ordering;
    - missing maximum 31-day period.

12. `fbo_draft_timeslot_info`
    - raw strings instead of real YMD;
    - missing ordering/current-date horizon/28-day rule;
    - fixed runnable dates become stale by construction.

13. `carriage_delivery_list_v2`
    - `departure_date` is only lexically checked;
    - impossible calendar dates can pass local preflight.

14. `report_returns_create_v2`
    - shared `format: date-time` path uses permissive `Date.parse()` instead of strict RFC3339;
    - missing last-three-month recency rule;
    - fixed January 2026 template is stale on the audit date.

15. `report_postings_create`
    - shared `format: date-time` path is too permissive.

16. `report_placement_by_products_create`
    - shared `format: date` accepts impossible calendar dates;
    - existing ordering and <=31-day guards are correct and must not regress.

17. `report_placement_by_supplies_create`
    - same impossible-calendar-date shared-validator defect;
    - existing ordering and <=31-day guards must remain green.

18. `report_marked_products_sales_create`
    - shared `format: date` accepts impossible calendar dates;
    - existing ordering guard must remain green.

19. `report_realization_posting_create`
    - primitive month `[1,12]` and `year>=2023` are already present;
    - effective earliest business period `2023-08` is missing.

20. `product_certification_params_v2`
    - `issue_date` strict RFC3339 is already correct;
    - `expired_date.date` and `expired_date.infinite` must be mutually exclusive.

### 3.2 Performance API — 9 date/period defects

1. `performance_expense` — add maximum 62-day statistics-export period.
2. `performance_daily` — add maximum 62-day statistics-export period.
3. `performance_campaign_product` — alternate `from/to` must be strict RFC3339; do **not** invent a 62-day guard because this method is explicitly limit-exempt.
4. `performance_media` — alternate `from/to` strict RFC3339 + maximum 62-day period.
5. `performance_sku_statistics` — enforce provider recency boundary and eliminate the stale static runnable date template; do not impose the global 62-day rule on this explicitly exempt method.
6. `performance_media_csv` — same shared media defects as JSON.
7. `performance_campaign_product_csv` — same alternate-RFC3339 defect as JSON, without an invented 62-day limit.
8. `performance_expense_csv` — same 62-day defect as JSON.
9. `performance_daily_csv` — same 62-day defect as JSON.

### 3.3 Independent lifecycle-only defect

`fbs_stock_by_warehouse_v1` has no input date field but is still part of this repair cycle because the same audit exposed the currentness-process failure:

- retired `/v1/product/info/stocks-by-warehouse/fbs` remains current/executable;
- current `/v2/product/info/stocks-by-warehouse/fbs` already exists.

The repair must prevent both known retired v1 surfaces from remaining ordinary user-visible executable operations and must add a regression that prevents their silent re-entry.

### 3.4 Explicitly unresolved — do not “repair” by guessing

`analytics_data`:

- date-only input is live-proven;
- Bridge also accepts RFC3339;
- static provider evidence is insufficient to prove timestamp rejection;
- keep quarantined until a later explicitly authorized safe live probe after STD-06 is unfrozen.

`finance_b2b_sales_json`:

- `YYYY-MM` syntax matches;
- provider wording about January 2019 is ambiguous;
- no local earliest/latest boundary may be invented from ambiguous prose.

## 4. Required repair architecture

### 4.1 Shared strict real-YMD primitive

Create/reuse one canonical helper that accepts exactly `YYYY-MM-DD` and proves the components form a real calendar date by deterministic UTC round-trip.

It must reject, before network:

- malformed width/separators;
- month 00/13;
- impossible day/month combinations;
- impossible leap-day combinations.

The helper must not rely on implementation-dependent loose parsing.

### 4.2 Shared strict RFC3339 primitive

Use one canonical timezone-bearing RFC3339 helper for all provider fields declared as date-time.

It must reject, before network:

- date-only input when date-time is required;
- timezone-less timestamps;
- arbitrary strings accepted by `Date.parse()` / `new Date()`;
- impossible timestamps.

Shared schema validation (`EFFECT_REPAIR_PARAM_SCHEMAS`) must delegate `format: date-time` to the same strong semantics rather than maintaining a weaker parallel implementation.

### 4.3 Shared interval/period helpers

Introduce deterministic helpers for declared provider interval semantics, with rules enabled only where provider evidence exists:

- `from <= to` ordering;
- maximum N calendar days;
- maximum one calendar month where that is the provider rule;
- half-month financial periods;
- earliest month such as `2023-08`;
- current-relative recency/horizon rules.

Current-relative rules must accept an injected/frozen reference date in tests. Do not make regressions depend on wall-clock timing.

Boundary semantics must be explicit and tested at the provider-documented boundary, not only one day inside/outside.

### 4.4 Endpoint-specific business guards

Shared helpers must not turn into invented global policy. Provider-specific rules remain explicit beside the operation contract, including:

- `finance_balance` <=30 days and YMD;
- cash-flow half-month periods;
- transaction-list <=1 month;
- realization earliest `2023-08` / 32-day daily recency;
- products-buyout <=31 days;
- FBO draft current/future 28-day horizon;
- returns-report last-three-month window;
- placement-report <=31 days;
- Performance 62-day export limits only on non-exempt methods;
- SKU-statistics provider recency rule.

### 4.5 Lifecycle-safe and dynamic templates

A registry `template` must not be certified “runnable” merely because it satisfies JSON shape today.

Required policy:

- current/future date endpoints cannot use permanently fixed historical dates as universal runnable defaults;
- provider-derived selectors (`auto_add_date`) cannot be hard-coded as universal defaults;
- such operations must either expose a dynamic dependency/pre-discovery requirement or be marked as requiring explicit current input rather than as a runnable static sample;
- template certification must validate provider business semantics and currentness, not only schema shape.

### 4.6 Provider lifecycle/currentness gate

Add a mandatory delivery-gate check independent of Swagger presence:

1. enumerate every registered method/path;
2. compare against current official Ozon documentation plus deprecation/retirement notices;
3. resolve superseding retirement dates;
4. if retirement date has passed, the operation cannot remain ordinary `current + execution_enabled`;
5. if a future retirement is announced, record the deadline and replacement before handoff;
6. ensure registry, contract, entitlement, discovery/guidance, templates, generated copies and tests agree;
7. deterministic regression must block known retired paths from returning to current+enabled state.

Known required lifecycle cases:

- disable/remove/migrate `fbs_stock_by_warehouse_v1` in favor of the existing v2 operation;
- disable/remove/migrate `fbs_carriage_available_list` in favor of `carriage_delivery_list_v2`;
- resolve `finance_transaction_list_v3` before its 2026-09-08 provider shutdown and route normal guidance to the already-present accrual replacements.

### 4.7 Certificate expiry XOR

For `product_certification_params_v2`, enforce exactly the provider-compatible expiry representation:

- dated expiry, or
- infinite expiry,
- never both simultaneously.

Negative regression must prove provider request count remains zero when the mutually exclusive representations are combined.

### 4.8 `analytics_data` quarantine

Do not broaden this repair with an assumption about effective timestamp acceptance.

Until a later authorized live probe resolves it:

- preserve the existing known-good YMD path;
- retain explicit `NEEDS_LIVE` evidence;
- do not claim a timestamp BUG or a timestamp MATCH;
- do not use this unresolved row to block deterministic repairs that are already proven elsewhere.

## 5. Mandatory dependency-closure surfaces

The following paths are known direct authorities/consumers and must be inspected during the authorized repair. A change is required only where the affected contract is actually represented, but every listed surface must receive an explicit consistency verdict.

### 5.1 Executable contract and registry

- `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/ozon_contract.js`
- `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/ozon_operation_registry.js`

These are the primary executable repair surfaces for validators, operation-specific guards, registry templates and lifecycle metadata.

### 5.2 Validation / regression gates

At minimum inspect and extend as required:

- `tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_effect_read_repair_gate.mjs`
- `tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_provider_taxonomy_gate.mjs`
- `tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_live_gate_corrective_regression.mjs`
- `tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_all_26_e2e_gate.mjs`
- `tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_exact_26_schema_gate.mjs`
- `tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_generated_document_delivery_gate.mjs`

Where report-file behavior or packaging is touched, also preserve/verify:

- `run_report_file_lifecycle_gate.mjs`
- `run_report_file_session_fail_closed_gate.mjs`
- `run_report_file_workflow_gate.mjs`.

New date/currentness regression coverage must be chained into the ordinary package certification path so it cannot be bypassed by running only a special one-off script.

### 5.3 Canonical delivery gate

- `tooling/llm-api-bridges/ozon-seller/OZON_PATCH_DELIVERY_GATE.md`

The authorized repair must add the provider lifecycle/currentness requirement and the date/business-contract closure requirement to the ordinary delivery gate. A fresh Swagger label must not be accepted as proof of current provider support.

### 5.4 Guidance / discovery / planner consistency

Inspect and update where affected:

- `tooling/llm-api-bridges/ozon-seller/OZON_GUIDED_COMMAND_DISCOVERY_SPEC_2026-08-21.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_REQUEST_PLANNER_ROADMAP_2026-08-17.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`
- `tooling/llm-api-bridges/ozon-seller/README.md`

Guidance must not continue to advertise retired routes, invalid fixed dates, wrong finance wire formats or dynamic provider-derived fields as self-contained runnable requests.

### 5.5 Dist / generated / package mirrors

Known roots that require explicit coherence audit:

- `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/` — candidate authority to repair;
- `tooling/llm-api-bridges/ozon-seller/dist/` — packaged/current mirror if the build flow derives or copies into it;
- `tooling/llm-api-bridges/ozon-seller/dist-step6-accepted/` — historical accepted tree: inspect for stale mirrors/references but do not mutate historical authority blindly.

Any additional generated/bundled/package paths discovered by the build scripts during implementation must be added to dependency closure before certification. Do not fabricate mirror paths from assumptions.

The exact ZIP/artifact handed to the operator must be built from the exact certified repair commit/tree, and its content must match the source/dist state proved by the gates.

## 6. Required repair sequence

The authorized implementation should be performed in this order so shared-root changes are proven before endpoint-specific exceptions and packaging:

### Phase R1 — shared primitives and deterministic date harness

- strict real YMD helper;
- strict RFC3339 helper reuse in all currently weaker consumers;
- deterministic calendar/interval helpers;
- injectable/frozen reference date for relative windows;
- shared EFFECT_REPAIR date/date-time hardening.

First regressions must include malformed/impossible YMD, timezone-less date-time, arbitrary JS-parseable strings and boundary calculations.

### Phase R2 — endpoint-specific business guards

Implement the confirmed finance/report/FBO/Performance constraints without inventing rules for `analytics_data` or `finance_b2b_sales_json`.

Every invalid-input regression must assert **zero physical provider requests**.

### Phase R3 — registry templates and lifecycle state

- repair `finance_balance` template shape;
- remove invalid half-month cash-flow default;
- replace stale current-relative templates with lifecycle-safe/dynamic-input policy;
- remove static provider-derived `auto_add_date` defaults as universally runnable;
- resolve known retired endpoints and transaction-list retirement deadline.

### Phase R4 — guidance, discovery and generated/bundled consistency

Synchronize all user-facing examples and generated copies with the repaired contract. No old RFC3339 `finance_balance`, retired v1 route, stale date default or dynamic selector may survive in a normal runnable path.

### Phase R5 — mandatory gate integration and old-baseline failure proof

Add the new regressions to the ordinary certification chain.

Where deterministic and practical, run the final regression against old authority `249029b0ba8d9e6f9e26182bf678adf42868c6d6` and prove it fails for the pre-fix behavior, then prove the same regression passes on the repair candidate.

At minimum the old baseline must be demonstrably caught for the live `finance_balance` contract defect and shared validator/template/currentness classes that can be reproduced without network.

### Phase R6 — exact candidate build and cross-platform certification

Only after all source/guidance/gate dependencies are closed:

- build the exact candidate;
- run ordinary full package certification, not only targeted defect scripts;
- verify source/dist/generated/package coherence;
- record commit/tree/artifact identity and hashes required by the existing handoff process;
- leave installed-browser/Ozon live acceptance as `PENDING POST-INSTALL` until the exact artifact is installed.

### Phase R7 — exact-artifact post-install rerun

Only after separate authorization for executable repair/install/live continuation:

1. install the exact certified artifact;
2. rerun the failed STD-06 `finance_balance` step with a provider-valid date-only range inside the 30-day bound;
3. require HTTP success and exact request/provenance evidence under the existing live-test contract;
4. only after that PASS unfreeze the remainder of STD-06;
5. do not skip directly to STD-07.

### Phase R8 — later `analytics_data` ambiguity probe, only if still needed

After STD-06 is legitimately unfrozen and only with explicit authorization, perform the smallest safe probe needed to resolve whether full RFC3339 timestamps are accepted or whether Bridge should become YMD-only for `analytics_data`.

Until then it stays quarantined and must not contaminate the deterministic repair acceptance.

## 7. Mandatory invariants and regressions

Every repaired operation/class must satisfy the following applicable invariants.

### Local fail-closed

For provider-invalid input that can be determined statically:

- local validation rejects before transport;
- `external_request_executed = false` or equivalent transport proof;
- `physical_business_request_count = 0`;
- automatic retry count = 0.

### Boundary correctness

For each documented bound:

- exact valid boundary passes;
- first invalid value outside the boundary rejects;
- current-relative tests use a frozen/injected reference date;
- no wall-clock-flaky test data.

### No hidden request rewriting

Do not silently turn a timestamp into YMD or otherwise mutate invalid user input unless such transformation is separately designed, documented and surfaced.

Preserve the truthfulness of `exact_request_preserved` / `command_transformed` metadata.

### Old-baseline regression proof

A new regression is not considered meaningful merely because it passes on the fixed tree. Where deterministic pre-fix reproduction is available, prove the relevant final regression fails on baseline `249029b0...` for the expected reason.

### Lifecycle invariants

- a known retired endpoint cannot be `current + execution_enabled`;
- a future retirement has an explicit deadline and replacement path;
- retired routes cannot silently re-enter through generated registry copies;
- discovery/guidance cannot recommend a retired route as the normal current operation.

### Dynamic-template invariants

- provider-derived values cannot be certified as universal static runnable defaults;
- current/future-only methods cannot ship perpetually fixed historical dates as runnable defaults;
- template certification must include provider business semantics/currentness.

### Source/package coherence

The certified artifact must contain the same repaired contract/registry behavior that was tested from source. Any generated or copied output that differs from the tested authority is a handoff failure.

## 8. Minimum deterministic control set by defect family

The implementation may add more tests, but not fewer than these semantic controls.

### `finance_balance`

- real YMD pair inside 30 days -> pass;
- RFC3339 timestamp -> local reject under the repaired effective-wire contract;
- impossible YMD -> reject / zero provider calls;
- reversed pair -> reject / zero provider calls;
- >30-day pair -> reject / zero provider calls;
- exact documented boundary -> pass.

### Month realization

- `2023-08` -> pass;
- `2023-07` -> reject;
- month 0/13 -> reject where applicable;
- a current supported month -> pass.

### Daily realization

- real date within 32 calendar days -> pass;
- impossible date -> reject;
- first too-old date -> reject;
- exact 32-day boundary -> deterministic pass according to provider semantics.

### Financial/report period rules

- valid cash-flow first-half and second-half periods -> pass;
- arbitrary cross-half range -> reject;
- buyout <=31-day boundary -> pass; over-bound -> reject;
- placement <=31-day boundary retained; impossible calendar date newly rejects;
- returns-report current last-three-month range -> pass; older range -> reject.

### FBO/current-relative

With frozen reference date:

- valid FBO draft interval in horizon -> pass;
- malformed/impossible YMD -> reject;
- reversed interval -> reject;
- outside 28-day/current-date horizon -> reject;
- stale static template must no longer certify runnable.

### Performance

- non-exempt 62-day exact boundary -> pass;
- first over-bound interval -> reject;
- exempt campaign-product/sku methods must not inherit unsupported 62-day rejection;
- alternate `from/to` valid RFC3339 -> pass;
- JS-parseable but non-RFC3339 string -> reject;
- SKU recency boundary and stale-template case -> deterministic controls using frozen current date.

### Shared EFFECT_REPAIR formats

- `2026-02-31` as `format: date` -> reject;
- date-only string in `format: date-time` -> reject;
- timestamp without timezone -> reject;
- valid real YMD -> pass;
- valid RFC3339 -> pass.

### Certificate XOR

- dated expiry only -> pass;
- infinite only -> pass;
- both representations -> local reject / zero provider requests.

### Lifecycle

- registry scan fails if either known retired v1 path is current+enabled;
- transaction-list lifecycle deadline/replacement is represented according to the chosen migration policy;
- current replacement operations remain discoverable and executable under their existing safety/entitlement rules.

## 9. PRE-HANDOFF and post-install acceptance

`PRE-HANDOFF` may be PASS only when all of the following are true on one exact candidate commit/tree:

- all confirmed deterministic DEFECT-015 repairs are implemented;
- all shared and endpoint-specific regressions pass;
- known old-baseline failure proof exists where required;
- lifecycle/currentness gate passes;
- registry/templates/guidance/generated copies are coherent;
- ordinary full cross-platform package certification is green;
- exact artifact identity/hash is recorded;
- no unresolved confirmed defect is hidden by a changed classification.

`analytics_data` may remain explicitly `NEEDS_LIVE`; it is not converted into PASS by PRE-HANDOFF.

Installed-browser/provider acceptance remains **PENDING POST-INSTALL** until the operator installs the exact certified artifact.

STD-06 may be unfrozen only after:

1. the exact certified repaired artifact is installed;
2. the previously failed `finance_balance` step is rerun on that artifact;
3. the provider-valid repaired request succeeds with the expected live evidence/provenance;
4. no regression in request-count/fail-closed behavior is observed.

Then, and only then, continue the remaining STD-06 sequence. STD-07 remains blocked until STD-06 is complete.

## 10. Status of this plan

This document closes the planning step requested by `DEFECT_015_FULL_OPERATION_ACCOUNTING_2026-09-04.md`.

Planning verdict:

`DEFECT_015_REPAIR_DEPENDENCY_CLOSURE_PLAN = READY_FOR_EXPLICIT_REPAIR_AUTHORIZATION`

It is intentionally **not** an implementation PASS and **not** permission to resume live testing.
