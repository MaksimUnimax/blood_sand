# DEFECT-015 — strict date continuation sweep — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

This artifact continues the evidence-only date-contract audit after the previously persisted finance, performance, YMD, effect-repair, FBO-draft-timeslot and provider-lifecycle sweeps. It records only static contract conclusions. No executable Bridge file is changed here and no new live Ozon request is authorized or performed. STD-06 remains frozen at the live `finance_balance` failure.

## Audit correction

A later bare-field/`since` sweep re-read the executable `normalizePostingFboListParams` and found that the first version of this artifact incorrectly described `posting_fbo_list` as using strict `requireRfc3339DateTime()`.

The actual baseline uses `new Date(filter.since/to)` only when both boundaries are present. Therefore the earlier `MATCH — date format` conclusion for `posting_fbo_list` is superseded below by **MISSING_GUARD — strict RFC3339**. The one-year maximum-period guard remains a valid `MATCH` finding.

## Classification rule

- `MATCH` means only the audited date/period dimension matches the current provider contract.
- `MISSING_GUARD` means local preflight accepts a combination/currentness/period that current provider evidence says is invalid or constrained.
- `INVALID_RUNNABLE_TEMPLATE` means registry guidance publishes a concrete default request that cannot be considered generically runnable under the provider contract.
- `NOT_DATE_RELATED` means the operation has no input date/time/period surface relevant to this defect class.

## Results

### 1. Reviews and questions

#### `review_list` — `POST /v2/review/list`

Provider contract:
- optional `filters.published_from` and `filters.published_to`;
- both are `string`, `format: date-time`;
- request `limit` is required and constrained to 20..100.

Bridge:
- uses strict `requireRfc3339DateTime()` for both optional publishing dates;
- checks `published_from <= published_to` when both are present;
- enforces the documented limit bounds.

Classification: **MATCH — date format + ordering dimension**.

#### `review_comment_list` — `POST /v1/review/comment/list`

Provider contract:
- optional `filter.published_from` / `filter.published_to`, both `date-time`;
- request semantics require exactly one selector branch: `review_id` or `filter.sku`.

Bridge:
- strict RFC3339 for both optional publishing dates;
- checks ordering;
- explicitly rejects requests unless exactly one of `review_id` or `filter.sku` is selected.

Classification: **MATCH — date format + ordering + selector cross-field rule**.

#### `question_list` — `POST /v1/question/list`

Provider contract:
- optional `filter.date_from` / `filter.date_to`;
- both are `date-time`.

Bridge:
- strict RFC3339 for both;
- checks `date_from <= date_to`.

Classification: **MATCH — date format + ordering dimension**.

### 2. Posting date ranges

#### `posting_fbo_list` — `POST /v3/posting/fbo/list`

Provider contract:
- optional `filter.since` / `filter.to`, both `date-time`;
- provider documentation explicitly rejects a period longer than one year (`PERIOD_IS_TOO_LONG`).

Actual executable Bridge behavior:
- if **both** `filter.since` and `filter.to` are present, it constructs JavaScript `Date` objects and rejects only values that JavaScript cannot parse;
- it then enforces the one-year maximum period;
- it does **not** use `requireRfc3339DateTime()` for these fields;
- if only one boundary is present, this normalizer does not date-validate that lone boundary at all.

Classification:
- **MISSING_GUARD — strict RFC3339 validation for every present `since/to` field**;
- **MATCH — one-year maximum-period guard when both boundaries are present**.

No pair-requiredness defect is asserted without provider evidence that both optional boundaries must always be supplied together.

#### `fbp_posting_list` — `POST /v1/posting/fbp/list`

Provider contract:
- optional `filter.since` / `filter.to`, both `date-time`;
- no additional static maximum-period rule was found in the current OpenAPI schema/description.

Bridge:
- strict RFC3339 for both optional fields.

Classification: **MATCH — documented date format dimension**.

No unsupported maximum-period rule is inferred.

### 3. FBP direct timeslots

#### `fbp_draft_direct_timeslot_get` — `POST /v1/fbp/draft/direct/timeslot/get`

Provider contract requires:
- `bundle_id`;
- `interval_start` — `date-time`;
- `interval_end` — `date-time`;
- `warehouse_id`.

Bridge uses strict RFC3339 for both interval fields and requires both.

Classification: **MATCH — documented date format + requiredness dimension**.

#### `fbp_order_direct_timeslot_list` — `POST /v1/fbp/order/direct/timeslot/list`

Provider contract requires:
- `supply_id`;
- `interval_start` — `date-time`;
- `interval_end` — `date-time`.

Bridge uses strict RFC3339 and requires both interval fields.

Classification: **MATCH — documented date format + requiredness dimension**.

The current OpenAPI does not state a static maximum interval for either direct-timeslot endpoint; no limit is invented by this audit.

### 4. Supply-order date filter

#### `supply_order_list` — `POST /v3/supply-order/list`

Provider contract:
- if `filter.timeslot_from_range` is supplied, its `from` and `to` fields are `date-time`;
- filter states are a required semantic part of the request;
- the request requires `filter`, `limit`, and `sort_by`.

Bridge:
- strict RFC3339 for range `from`/`to`;
- requires non-empty states;
- enforces the surrounding required fields and limit.

Classification: **MATCH — documented date format + requiredness dimension**.

Lifecycle cross-check: the current Bridge uses `supply_order_timeslot_list` → `/v2/supply-order/timeslot/list`, i.e. the replacement for retired `/v1/supply-order/timeslot/get`; no stale v1 read operation was found in the authority registry for this surface.

### 5. ETGB and rFBS

#### `posting_global_etgb` — `POST /v1/posting/global/etgb`

Provider contract requires `date.from` and `date.to`, both `date-time`.

Bridge requires the same nested fields and applies strict RFC3339.

Classification: **MATCH — date format + requiredness dimension**.

No static max-period constraint is stated in the current schema/description, so none is inferred.

#### `rfbs_returns_get` — `POST /v2/returns/rfbs/get`

Resolved correction: this operation accepts only `return_id`; it has no input date/time filter. The earlier audit queue association of this operation with an RFC3339 range was incorrect.

Classification: **NOT_DATE_RELATED**.

### 6. Assembly FBS/carriage families

#### `assembly_carriage_posting_list` — `POST /v1/assembly/carriage/posting/list`
#### `assembly_carriage_product_list` — `POST /v1/assembly/carriage/product/list`

Provider filter contract:
- `carriage_id` required;
- `cutoff_from` / `cutoff_to` optional and `date-time`.

Bridge:
- requires `carriage_id`;
- leaves both cutoff fields optional;
- applies strict RFC3339 when present;
- uses page maximum 100 as documented.

Classification: **MATCH — date format + requiredness dimension** for both.

#### `assembly_fbs_posting_list` — `POST /v1/assembly/fbs/posting/list`

Provider:
- filter requires `cutoff_from` and `cutoff_to`, both `date-time`;
- request requires `filter`, `limit`, `sort_dir`;
- limit maximum 1000.

Bridge requires the two cutoff fields, applies strict RFC3339, requires `sort_dir`, and enforces the 1000 limit.

Classification: **MATCH — date format + requiredness dimension**.

#### `assembly_fbs_product_list` — `POST /v1/assembly/fbs/product/list`

Provider:
- filter requires `cutoff_from` and `cutoff_to`, both `date-time`;
- request requires only `filter` and `limit`; `sort_dir` is optional;
- limit maximum 1000.

Bridge requires both cutoff fields, uses strict RFC3339, and correctly treats `sort_dir` as optional.

Classification: **MATCH — date format + requiredness dimension**.

### 7. FBS carriage containers

#### `fbs_carriage_container_list` — `POST /v1/carriage/container/list`

Provider:
- top-level `filter` is optional;
- if the filter is present it requires `created_from`, `created_to`, and `sort_type`;
- both date fields are `date-time`;
- limit is optional, 1..300.

Bridge:
- leaves the filter optional;
- when supplied, requires `created_from`, `created_to`, `sort_type`;
- applies strict RFC3339 to the two dates;
- enforces limit 1..300.

Registry template `{}` is valid for this request because the provider request schema does not require `filter`.

Classification: **MATCH — date format + conditional requiredness + page limit dimension**.

### 8. Ozon auto-add promotion reads

#### `ozon_auto_add_products` — `POST /v1/actions/auto-add/products/list`
#### `ozon_auto_add_candidates` — `POST /v1/actions/auto-add/products/candidates`

Provider request contract for both:
- `action_id` required;
- `auto_add_date` required, `date-time`;
- `limit` required, 1..100;
- the meaning of `auto_add_date` is not an arbitrary date: provider documentation says to use a value from `result.auto_add_dates` returned by `/v1/actions`.

Bridge normalizer:
- strict RFC3339 for `auto_add_date`;
- requiredness and limit dimension match.

Registry problem:
- both operations publish a concrete hard-coded `auto_add_date: "2035-08-28T14:00:00Z"` as a normal template;
- that value is dynamic provider state tied to a specific action and must come from the current `/v1/actions` response.

Classification:
- **MATCH — normalizer date syntax/requiredness**;
- **INVALID_RUNNABLE_TEMPLATE / DYNAMIC_DEPENDENCY TEMPLATE DEFECT** — the hard-coded provider-derived selector cannot be considered universally runnable.

Repair dependency closure must decide either to mark these templates non-runnable and expose the dependency (`action_id` + one of that action's current `auto_add_dates`) or generate guidance that requires an explicit prior discovery call.

### 9. Certificate parameter discovery

#### `product_certification_params_v2` — `POST /v2/product/certification/params`

Provider request supports optional certificate fields used to determine required parameters for later certificate creation.

Date surfaces:
- `params.issue_date` — `date-time`;
- `params.expired_date.date` — protobuf-style date object with day/month/year bounds;
- `params.expired_date.infinite` — boolean.

Bridge:
- validates `issue_date` with strict RFC3339 — **MATCH**;
- mirrors day/month/year numeric bounds — **MATCH to mechanical schema**;
- validates `infinite` as boolean.

Cross-field gap:
- provider descriptions say not to pass the date when `infinite = true`, and not to pass `infinite` when a date is specified;
- Bridge currently permits an `expired_date` object containing both `date` and `infinite` simultaneously.

Classification: **MISSING_GUARD — mutually exclusive expiry representations**.

This is a preflight defect even though the endpoint itself is a read/parameter-discovery operation: Bridge can forward a provider-conflicting input combination instead of rejecting it locally.

## New defect summary from this continuation

Repair candidates identified in this continuation:

1. `posting_fbo_list` — strict RFC3339 is not actually enforced for optional `filter.since/to`; both-boundary validation uses permissive `new Date()`, and a lone boundary is not date-validated.
2. `ozon_auto_add_products` — dynamic provider-derived `auto_add_date` is incorrectly represented by a static runnable template.
3. `ozon_auto_add_candidates` — same dynamic-template defect.
4. `product_certification_params_v2` — missing mutual-exclusion guard for `expired_date.date` vs `expired_date.infinite`.

Closed `MATCH`/`NOT_DATE_RELATED` surfaces in this artifact:

- `review_list`;
- `review_comment_list`;
- `question_list`;
- `fbp_posting_list`;
- `fbp_draft_direct_timeslot_get`;
- `fbp_order_direct_timeslot_list`;
- `supply_order_list` date range dimension;
- `posting_global_etgb`;
- `rfbs_returns_get` = `NOT_DATE_RELATED`;
- `assembly_carriage_posting_list`;
- `assembly_carriage_product_list`;
- `assembly_fbs_posting_list`;
- `assembly_fbs_product_list`;
- `fbs_carriage_container_list`.

## Remaining queue after this artifact

Later companion sweeps exhaust the named helper families, direct JavaScript parser paths, schema-driven dates and field vocabulary. The terminal remaining task is full operation-registry accounting: every registered read must be assigned either a date-audited verdict or an explicit `NOT_DATE_RELATED`/lifecycle/ambiguity class.

STD-06 remains **FROZEN ON LIVE FAIL**. No new live Ozon request was made in this continuation.
