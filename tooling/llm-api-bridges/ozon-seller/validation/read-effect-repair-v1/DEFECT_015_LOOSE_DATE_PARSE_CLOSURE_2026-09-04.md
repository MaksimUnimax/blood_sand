# DEFECT-015 — loose JavaScript date-parse closure — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

Purpose: exhaust the direct `Date.parse(...)` / `new Date(...)` acceptance paths in the authoritative contract after the live `finance_balance` failure. This is evidence-only. No executable Bridge code is changed and no new Ozon request is performed.

## Audit correction

A later field-vocabulary pass over bare `since/to` fields found a third permissive parser family that the first version of this artifact had incorrectly classified as safe arithmetic: `posting_fbo_list`.

This corrected version supersedes the earlier statement that only Performance alternate fields and `EFFECT_REPAIR_PARAM_SCHEMAS` widened accepted date syntax.

## 1. Confirmed permissive parsing defects

### Performance alternate `from/to`

`performance_media` and `performance_campaign_product` accept alternate provider fields `from/to` that are documented as RFC3339 date-time. Their baseline normalizers validate these values through JavaScript date parsing rather than the strict RFC3339 helper.

Consequences:

- a JavaScript-parseable non-RFC3339 string can pass local preflight;
- the local error text claims RFC3339 semantics that the implementation does not actually enforce.

Classification: **MISSING_GUARD — strict RFC3339**.

The same relevant validator behavior propagates to the corresponding CSV statistics surfaces already recorded in `DEFECT_015_PERFORMANCE_CSV_DATE_SWEEP_2026-09-04.md`.

### Shared `EFFECT_REPAIR_PARAM_SCHEMAS`

The generic schema validator currently implements:

- `format: date-time` through `Date.parse(value)` only;
- `format: date` through lexical `YYYY-MM-DD` regex only.

Therefore:

- `date-time` is broader than strict RFC3339;
- impossible calendar dates can pass `format: date` lexical validation.

Classification: **SHARED MISSING_GUARD**. Detailed affected report operations and corrected operation-specific ordering/range facts are persisted in `DEFECT_015_EFFECT_REPAIR_DATE_SCHEMA_SWEEP_2026-09-04.md`.

### `posting_fbo_list` — direct permissive `new Date()` input validation

Operation: `POST /v3/posting/fbo/list`.

Provider contract:

- optional `filter.since` and `filter.to` are `date-time` fields;
- provider documentation exposes `PERIOD_IS_TOO_LONG` for a period greater than one year.

Executable baseline `normalizePostingFboListParams` does **not** pass these fields through `requireRfc3339DateTime()`.

Its actual behavior is:

```text
if both filter.since and filter.to are present:
    since = new Date(filter.since)
    to    = new Date(filter.to)
    reject only if JavaScript cannot parse either value
    enforce <= 1 year
otherwise:
    no date-time validation is performed for a lone since or lone to
```

Consequences:

1. with both bounds present, any JavaScript-parseable non-RFC3339 spelling may pass local preflight despite the provider field being documented as `date-time`;
2. with only one bound present, that field is not date-validated at all by this normalizer;
3. the one-year maximum-period guard itself is present and should be preserved.

Classification:

- **MISSING_GUARD — strict RFC3339 validation for every present `since/to` boundary**;
- **MATCH — one-year maximum-period guard when both boundaries are present**.

No pair-requiredness defect is asserted here without provider evidence that the two optional fields must always be supplied together.

This finding also corrects the earlier `MATCH — date format` statement for `posting_fbo_list` in the strict-date continuation artifact and operation matrix.

## 2. Direct parse calls that do not widen accepted syntax

After separating the three permissive families above, the remaining `Date.parse(...)` / `new Date(...)` sites in the executable authority are arithmetic or ordering operations performed only after stronger validation.

Examples:

- `assertPeriodAtMostOneYear(...)`: receives fields already passed through strict `requireRfc3339DateTime()` in its normal callers such as current FBS posting ranges;
- seller rating history, FBS error postings, review/question/comment ranges: `Date.parse` is used only after strict RFC3339 normalization;
- Performance YMD period calculations: values are first validated through `requireDateYmd()`;
- finance accrual by-day arithmetic: date is first validated through `requireDateYmd()`;
- `requireDateYmd()` itself uses UTC round-trip to prove a real calendar date;
- `requireAnalyticsDate()` uses real-date round-trip for the YMD branch and a strict RFC3339 regex for its alternate branch;
- analytics subscription-history entitlement calculation receives the already-normalized command;
- placement/marked-products report period arithmetic is downstream of the schema validator; the remaining defect there is the shared schema's missing real-calendar validation, already recorded separately.

These arithmetic uses are not additional wire-format defects.

## 3. Terminal finding for direct JavaScript parser paths

After the correction above, direct parser enumeration has three confirmed acceptance families requiring repair or already represented in repair scope:

1. Performance alternate `from/to` validation;
2. generic `EFFECT_REPAIR_PARAM_SCHEMAS` date/date-time validation;
3. `posting_fbo_list.filter.since/to`.

No fourth independent permissive `Date.parse/new Date` input-validation family was found in the executable authority contract.

Verdict: **LOOSE_DATE_PARSE_FAMILY = CLOSED_WITH_3_CONFIRMED_REPAIR_SURFACES**.

## 4. Full-Bridge closure rule

Helper-name and direct-parser enumeration can still miss bespoke date fields validated only as strings or integers. The field-vocabulary sweep therefore remains the second independent coverage mechanism and includes at minimum:

- `date_from`, `date_to`, `dateFrom`, `dateTo`;
- `from`, `to`, `since` in known time-range structures;
- `interval_start`, `interval_end`;
- `cutoff_from`, `cutoff_to`, delivery/timeslot ranges;
- `published_*`, `processed_at_*`, `created_*`;
- `auto_add_date`, `departure_date`, `issue_date`;
- `day`, `month`, `year` financial/calendar structures;
- schema `format: date`, `format: date-time`, `format: month`;
- alternate vocabulary such as `expires`, `effective`, `window`, `datetime`, `period_from/to`, `dateStart/dateEnd`, `startTime/endTime`.

Only after that field-level sweep is reconciled against the operation registry can the remainder of the registered reads be terminally classified `NOT_DATE_RELATED`.

STD-06 remains **FROZEN ON LIVE FAIL**. No live provider request was made by this audit step.
