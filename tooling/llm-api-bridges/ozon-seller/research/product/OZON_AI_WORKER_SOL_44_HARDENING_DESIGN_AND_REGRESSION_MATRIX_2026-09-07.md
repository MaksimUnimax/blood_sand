# Ozon AI Worker — Sol 44 hardening design + affected-row regression matrix

Date: 2026-09-07
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `H2_DESIGN_COMPLETE__H3_MATRIX_COMPLETE__H4_BLOCKED_ON_OPERATOR_AUTHORIZATION`

Parent authority:
`OZON_AI_WORKER_SOL_44_CONSOLIDATED_ROOT_CAUSE_GAP_LEDGER_2026-09-06.md`

Primary terminal Sol ledger:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Roadmap:
`OZON_AI_WORKER_COMMERCIAL_VALIDATION_ROADMAP_2026-09-02.md`

## 0. Boundary

This document is a design specification only.

It does **not** authorize an executable Bridge patch.

No Ozon provider requests are required to complete H2/H3.

Implementation remains blocked until explicit operator authorization.

The design must preserve all current safety/cardinality invariants:

- one explicit business command -> at most one physical business request;
- `N` explicit batch commands -> at most `N` sequential physical requests;
- no hidden retry;
- no hidden pagination;
- no hidden fanout;
- no hidden polling;
- no implicit chaining;
- privacy and opaque-reference boundaries remain fail-closed;
- provider/account/data limits are never converted into invented business values.

## 1. Architecture fit

The current Bridge already has the correct architectural seams for the hardening package. The design should extend those seams instead of adding a parallel orchestration subsystem.

### 1.1 `shared/ozon_guidance.js`

Current responsibilities already include:

- guidance clusters;
- operation cards;
- `required_parameters`;
- runnable templates;
- `entitlement_key`;
- `privacy_policy`;
- `workflow_role`;
- `OZON_GUIDANCE_RESULT_V2`.

H2 role:

**primary AI-facing contract surface** for operation recipes, semantic warnings, request preconditions, date/readiness constraints, recovery hints and workflow dependency metadata.

### 1.2 `shared/ozon_operation_registry.js`

H2 role:

**declarative operation metadata authority**.

Add only evidence-backed metadata that is stable enough to be operation contract, such as:

- identifier semantics;
- required non-empty selectors;
- known date-window limitations;
- response coverage semantics;
- pagination style;
- semantic tags for cross-source comparison;
- reference-dictionary role;
- workflow dependency role.

Do not put provider runtime state into static registry metadata.

### 1.3 `shared/ozon_contract.js`

Current live evidence proves two operation normalizers accept empty selectors that the provider rejected:

- `normalizeProductVisibilityInfoParams` accepts `{}` because `skus` is optional locally;
- `normalizeOzonWarehouseListParams` accepts `{}` because `warehouse_types` is optional locally.

H2 role:

**deterministic local mechanical validation and sanitized repair metadata** where provider contract evidence proves the request shape is invalid.

It must not become a business-policy engine.

### 1.4 `shared/ozon_entitlements.js`

Current bundled snapshot explicitly contains unresolved review entitlement rules and also statically marks some operations `ALL_ACCOUNTS` even when live provider permission evidence later disagreed.

H2 role:

**layered entitlement evidence model**, not a stronger static assertion.

### 1.5 `service_worker.js`

Current worker already owns:

- provider quota state for selected families;
- command execution lifecycle;
- batch delivery;
- physical request accounting;
- result delivery;
- cache/provenance metadata.

H2 role:

**attach normalized recovery / continuation / semantics metadata to the delivered result without performing hidden recovery actions.**

### 1.6 `shared/provider_transport_core.js`

Current transport safely captures response status/meta and already parses report files.

H2 role:

- retain safe provider response metadata;
- optionally expose sanitized XLSX structural diagnostics if authorized;
- do not expose raw provider secret/error payloads or raw worksheet XML.

## 2. H2-A — Unified recovery contract

Targets H1-01.

### 2.1 Goal

A weak model must not need to infer from raw HTTP status whether it should:

- repeat the same logical command;
- change operation;
- wait for a data window;
- diagnose entitlement;
- stop because the request itself is invalid.

The Bridge must describe the strongest evidence-backed next action while still requiring the AI to issue the next explicit command.

### 2.2 Proposed result shape

Illustrative schema, exact field names may be refined during implementation:

```text
recovery: {
  business_result_valid: false,
  failure_class: "PROVIDER_RATE_LIMIT" | "PROVIDER_PERMISSION" | "DATA_NOT_READY" | "LOCAL_VALIDATION" | "PROVIDER_REQUEST" | "UNKNOWN",
  retryable: true | false | null,
  action: "REPEAT_SAME_LOGICAL_COMMAND" | "WAIT_FOR_DATA_WINDOW" | "USE_PROVEN_READY_DATE" | "CHECK_ENTITLEMENT" | "REPAIR_PARAMETERS" | "DIAGNOSE" | "STOP",
  same_operation_required: true | false | null,
  same_business_job_required: true,
  automatic_retry: false,
  do_not_interpret_as_business_zero: true,
  retry_after: <provider value or null>,
  retry_not_before: <only when safely derivable>,
  timing_source: "provider_retry_after" | "bridge_known_family_policy" | "unknown",
  repeated_failure_count: <local evidence count or null>,
  logical_command_fingerprint: "...",
  repair_recipe: <sanitized deterministic recipe or null>
}
```

### 2.3 Hard rules

- Never invent a provider reset time.
- `Retry-After: 1` is not a universal one-request-per-second contract.
- A provider 429 remains one physical request and is never automatically retried.
- Repeated failure count may affect **guidance**, not create hidden provider traffic.
- A local validation error must have `external_request_executed=false` and `physical_business_request_count=0`.
- Provider 403 must never default to `ENTITLEMENT_ERROR` without supporting entitlement evidence.

### 2.4 Required representative regressions

- STD-01/STD-20 analytics-style rate limit recovery semantics.
- STD-13 non-analytics provider 429 semantics.
- CAP-14 `finance_accrual_types` recurrence semantics, with the separate dictionary reuse policy preserved.

## 3. H2-B — Unified continuation contract

Targets H1-02.

### 3.1 Goal

A weak model must not infer completeness from `rows.length == limit`.

### 3.2 Proposed shape

```text
continuation: {
  style: "offset" | "cursor" | "last_id" | "page" | "none" | "unknown",
  result_complete: true | false | null,
  terminal_signal_source: "provider" | "short_page_contract" | "explicit_total" | "unknown",
  page_size_requested: <number|null>,
  rows_returned: <number|null>,
  current_offset: <number|null>,
  next_offset: <number|null>,
  current_page: <number|null>,
  next_page: <number|null>,
  next_cursor_present: true | false | null,
  last_id_present: true | false | null,
  next_read_recommended: true | false | null,
  automatic_pagination: false
}
```

### 3.3 Rules

- Provider terminal signals outrank inferred signals.
- Short-page terminal inference is allowed only for operations whose contract makes that safe.
- If page is full and no provider terminal signal exists, report completeness as `null`, not `true`.
- Never execute the continuation automatically.

### 3.4 Regressions

- STD-08 offset-style warehouse stock read.
- CAP-12 `last_id` continuation.
- CAP-17 explicit campaign page continuation.

## 4. H2-C — Cross-source semantic contract

Targets H1-03 and part of H1-08.

### 4.1 Goal

Prevent false joins, double counting and false zero inference.

### 4.2 Semantic metadata classes

Operation cards/result metadata should be able to expose concise tags such as:

```text
semantic_contract: {
  source_family: "seller_analytics" | "finance" | "performance" | "stock" | "report",
  metric_roles: [
    {
      field: "revenue",
      role: "SELLER_GROSS_SALES_AUTHORITY",
      direct_equivalents: [],
      correlation_only_with: ["performance.ordersMoney"],
      do_not_add_with: ["finance.sale_amount"]
    }
  ],
  missing_row_semantics: "NOT_ZERO_UNLESS_PROVIDER_CONTRACT_SAYS_ZERO",
  coverage_scope: "FBO_ONLY" | "FBS_ONLY" | "ACCOUNT_LEVEL" | "SKU_LEVEL" | "CAMPAIGN_LEVEL" | "UNKNOWN"
}
```

### 4.3 Frozen examples from Sol evidence

- Seller Analytics `revenue` is the monthly gross-sales authority in CAP-24.
- Finance `sale_amount` is reconciliation evidence and must not be added again.
- Performance `ordersMoney` is attributed advertising output and is not 1:1 Seller revenue.
- FBO zero does not mean total FBO+FBS stockout.
- Missing turnover/stock row does not mean numeric zero.
- NON_ITEM account-level finance rows do not become SKU cost without an attribution key.

### 4.4 Regressions

- STD-20 DRR explanation.
- CAP-18 Performance statistics interpretation.
- CAP-19 ad × stock join.
- CAP-24 full unit-economics arithmetic and double-counting control.

## 5. H2-D — Mechanical operation recipes

Targets H1-04, H1-05 and H1-13.

### 5.1 Identifier recipes

Operation cards should expose the semantic namespace and representation expected by the operation.

Example:

```text
identifiers: {
  skus: {
    semantic: "OZON_SKU",
    representation: "string_int64",
    minimum_items: 1,
    maximum_items: 350
  },
  product_ids: {
    semantic: "SELLER_PRODUCT_ID",
    representation: "string_int64"
  }
}
```

A validation result should be able to say:

`Expected Ozon SKU as decimal int64 string, e.g. "1636048691"; numeric JSON value was not sent to provider.`

### 5.2 Required non-empty selectors

For operations where live/provider contract evidence proves an empty request is mechanically invalid, the Bridge should reject locally before external execution.

Current candidates requiring contract confirmation before implementation:

- `product_visibility_info` -> non-empty `skus`;
- `ozon_warehouse_list` -> non-empty `warehouse_types`.

After confirmation, expected failure contract:

- local `INVALID_OPERATION_PARAMS` or more specific error;
- `external_request_executed=false`;
- `physical_business_request_count=0`;
- guidance with exact required selector.

### 5.3 Date / period recipe

The operation card must expose hard date constraints already known in the registry.

Critical example:

- `performance_sku_statistics` is near-current only and cannot be used as an arbitrary August historical SKU-statistics surface.

This rule must be planner-visible before the model constructs the command.

### 5.4 Explicit batch recipe

Guidance must repeat the already-corrected authority:

- multiple independent known-upfront commands -> explicit batch of multiple complete markers;
- each marker followed by exactly one JSON object;
- never one marker followed by a JSON array;
- dependent cursor/report-ref steps remain separate.

No service-worker batch transport change is required by this design.

## 6. H2-E — Entitlement / permission / data-readiness evidence model

Targets H1-06 and H1-07.

### 6.1 Problem

A single static `SUPPORTED_AND_ENTITLED` flag is too strong when live provider/account evidence may disagree.

### 6.2 Proposed evidence layers

```text
access_evidence: {
  static_contract: "ALL_ACCOUNTS" | "SUBSCRIPTION_RESTRICTED" | "UNKNOWN",
  seller_subscription: "..." | null,
  role_method_present: true | false | null,
  provider_permission_result: "ALLOWED" | "DENIED" | "NOT_TESTED",
  data_readiness: "READY" | "NOT_READY" | "UNKNOWN",
  final_access_class: "SUPPORTED_AND_ENTITLED" | "SUPPORTED_BUT_NOT_ENTITLED" | "PERMISSION_DENIED" | "DATA_NOT_READY" | "UNKNOWN"
}
```

### 6.3 Rules

- Static snapshot is evidence, not omniscient truth.
- Role presence proves key permission declaration, not necessarily successful business access for every date/account state.
- Provider 403 is not business zero.
- Query-control evidence can support `DATA_NOT_READY` when the same operation/account returns 200 for a proven older date and 403 for a recent date.
- Do not call CAP-21 recent 403 a subscription denial.
- Do not call CAP-22 provider 403 an empty strategy mapping.

### 6.4 Regressions

- CAP-16 review count permission boundary.
- CAP-21 recent blocked date + proven-ready 2026-08-29 control.
- CAP-22 pricing strategy ID permission branch.
- CAP-10 Premium Pro preflight remains locally blocked with zero business request.

## 7. H2-F — Missing-row / coverage semantics

Targets H1-08.

### 7.1 Result-level coverage metadata

For operations where the provider may omit requested entities, results should allow:

```text
coverage: {
  requested_entity_count: <n|null>,
  returned_entity_count: <n|null>,
  omitted_entity_count: <n|null>,
  omission_semantics: "UNKNOWN_NOT_ZERO" | "PROVIDER_CONFIRMED_ZERO" | "NOT_APPLICABLE",
  complete_entity_identity_check_possible: true | false
}
```

### 7.2 Regression

CAP-05 must continue to report the four omitted turnover SKUs as omitted/unknown, not zero.

CAP-19 must preserve missing stock evidence as unknown rather than fabricating stockout.

## 8. H2-G — Reference dictionary policy

Targets H1-15.

`finance_accrual_types` must be treated as a reference dictionary, not transaction data.

Design rule:

- fetch once when needed;
- persist provider-derived mapping/provenance;
- reuse for `/by-day` and `/postings`;
- refresh only when an unknown type appears or explicit taxonomy refresh is required;
- a refresh 429 does not erase the prior dictionary;
- unknown type remains `TYPE_DICTIONARY_REFRESH_PENDING`;
- do not invent a fixed TTL or method cooldown.

This can be implemented as guidance/cache policy without creating background refreshes.

Regression:

A multi-day finance workflow must not call `/types` repeatedly when all encountered type IDs are already known.

## 9. H2-H — XLSX structural observability

Targets H1-11.

The relationship-target defect itself is already fixed and must not be reopened.

The remaining issue is diagnosis of a successfully fetched workbook whose parsed logical table is empty.

### 9.1 Safe diagnostics candidate

Without exposing raw XML, parsed report metadata may include:

```text
xlsx_structure: {
  sheet_name: "Страница #1",
  worksheet_byte_length: <number>,
  dimension_ref: "A1:K200" | null,
  matched_row_tag_count: <number>,
  matched_cell_tag_count: <number>,
  nonempty_physical_row_count: <number>,
  parser_shape: "SUPPORTED_ROWS_CELLS" | "NO_MATCHED_ROWS" | "UNKNOWN",
  logical_row_count: <number>
}
```

### 9.2 Security boundary

Do not expose:

- raw worksheet XML;
- signed URLs;
- opaque-ref internals;
- hidden provider file identifiers beyond existing safe opaque ref;
- arbitrary file contents outside current sanitized report parser behavior.

### 9.3 Regression fixtures

At minimum:

1. ordinary populated workbook;
2. genuinely empty workbook;
3. workbook whose sheet exists but parser row/cell match count is zero;
4. existing relationship-target normalization regression.

The result must let the AI distinguish `TRUE_EMPTY` from `PARSED_EMPTY_CAUSE_UNKNOWN` where evidence permits.

## 10. H2-I — Category-comparison capability candidate

Targets H1-09.

This is **not** part of the P0 reliability package and must not be silently bundled into it.

Evidence:

- provider role includes `/v1/analytics/category/comparison`;
- current active Bridge registry has no operation for it;
- CAP-23 therefore closed with a Bridge capability coverage boundary.

Before any implementation, H4 would require a separate explicit authorization after:

1. current provider contract/schema is confirmed;
2. entitlement/subscription semantics are confirmed;
3. privacy/result projection is designed;
4. commercial value is judged material enough to expand the Bridge surface;
5. request-cardinality and regression rules are defined.

Until then CAP-23 remains truthful and complete with the coverage boundary.

## 11. H3 — affected-row regression matrix

The hardened Sol rerun must be **targeted**, not a blind 44-row replay.

| Block | Required row reruns | Local/shared regression | Provider traffic requirement |
|---|---|---|---|
| A Recovery | STD-20 or STD-01; STD-13; CAP-14 | synthetic/provider-failure result envelope tests | only explicit live control where needed; never hidden retry |
| B Continuation | STD-08; CAP-12; CAP-17 | offset + cursor + page fixtures | explicit continuation only |
| C Cross-source semantics | STD-20; CAP-18; CAP-19; CAP-24 | deterministic join/double-counting assertions | reuse preserved evidence where possible; live rerun only after implementation acceptance |
| D Mechanical recipes | STD-05; STD-10; STD-14; CAP-21; CAP-24 orchestration | invalid numeric int64, empty selector, malformed batch, historical-vs-near-current date validation | invalid local cases must produce 0 provider requests |
| E Entitlement/readiness | CAP-10; CAP-16; CAP-21; CAP-22 | layered access-evidence tests | provider calls only when necessary to prove current live branch behavior |
| F Missing-row semantics | CAP-05; CAP-19 | requested-vs-returned identity fixtures | no extra calls simply to turn omission into zero |
| G Dictionary reuse | CAP-14/CAP-24 finance workflow | persisted known-type mapping fixture | no repeated `/types` unless unknown ID trigger exists |
| H XLSX observability | CAP-24 report workflow | populated / true-empty / no-row-match / relationship-target fixtures | fresh provider report only if needed to live-accept new observability fields |
| Explicit batching methodology | one independent multi-command control + one dependent report/cursor control | batch parser markers/JSON-object validation | `N explicit <= N physical`; dependent next step not preissued |
| Category comparison if separately authorized | CAP-23 | new-operation schema/entitlement/privacy tests | exactly one explicit provider call per command |

## 12. H3 gate conditions

Before Alice, all authorized hardening changes must satisfy:

1. affected Sol business answers remain materially correct;
2. known recovery mechanics no longer require operator API reasoning;
3. invalid mechanical requests fail locally where the provider contract is deterministic;
4. no hidden retry/pagination/fanout/polling/chaining is introduced;
5. provider/data/entitlement boundaries remain explicit rather than being falsely “fixed”;
6. one explicit command -> at most one physical request remains true;
7. explicit batch supports multiple independent commands without changing per-command cardinality;
8. privacy/opaque-reference redaction remains fail-closed;
9. all regression artifacts are committed and read back;
10. final gate is recorded as:

`SOL_44_TEST_GATE_HARDENED_REGRESSION_PASS`

## 13. Recommended implementation decomposition after authorization

Do not implement everything in one giant patch.

Recommended dependency order:

### Patch group 1 — contract-only AI guidance metadata

- operation-card recipes;
- semantic tags;
- continuation contract metadata;
- recovery result envelope;
- access/readiness evidence shape.

Expected risk: low-to-medium.

### Patch group 2 — deterministic local validation corrections

- proven required non-empty selectors;
- identifier repair hints;
- period/date constraints already present in registry but insufficiently surfaced.

Expected risk: medium because provider-contract parity must be exact.

### Patch group 3 — safe report observability

- XLSX structure diagnostics only;
- no broader parser support unless new evidence proves it is required.

Expected risk: medium.

### Separate product-capability patch — category comparison

Only if separately authorized after contract/entitlement research.

Do not couple this feature expansion to reliability hardening.

## 14. No-patch boundary

As of this document:

`EXECUTABLE_BRIDGE_PATCH_AUTHORIZED = NO`

Allowed now:

- documentation;
- regression design;
- source inspection;
- exact implementation prompt preparation for Codex/operator review.

Not allowed now:

- modifying runtime JS;
- adding registry operations;
- changing parser behavior;
- changing automatic retry/pagination behavior;
- changing privacy controls.

## Final checkpoint

`SOL_44_H2_H3_COMPLETE__IMPLEMENTABLE_DESIGN_FROZEN__H4_AWAITING_EXPLICIT_OPERATOR_AUTHORIZATION__NO_NEW_OZON_BUSINESS_REQUEST_REQUIRED`
