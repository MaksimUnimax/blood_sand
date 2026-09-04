# DEFECT-015 — loose JavaScript date-parse closure — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

Purpose: exhaust the direct `Date.parse(...)` / `new Date(...)` acceptance paths in the authoritative contract after the live `finance_balance` failure. This is evidence-only. No executable Bridge code is changed and no new Ozon request is performed.

## 1. Confirmed permissive parsing defects already in repair scope

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

Classification: **SHARED MISSING_GUARD**. Detailed affected report operations and the corrected operation-specific ordering/range facts are persisted in `DEFECT_015_EFFECT_REPAIR_DATE_SCHEMA_SWEEP_2026-09-04.md`.

## 2. Direct parse calls that do not widen accepted syntax

The remaining `Date.parse(...)` / `new Date(...)` sites in the executable authority are arithmetic or ordering operations performed only after stronger validation.

Examples:

- `assertPeriodAtMostOneYear(...)`: receives fields already passed through strict `requireRfc3339DateTime()`;
- seller rating history, FBS error postings, review/question/comment ranges: `Date.parse` is used only after strict RFC3339 normalization;
- Performance YMD period calculations: values are first validated through `requireDateYmd()`;
- finance accrual by-day arithmetic: date is first validated through `requireDateYmd()`;
- `requireDateYmd()` itself uses UTC round-trip to prove a real calendar date;
- `requireAnalyticsDate()` uses real-date round-trip for the YMD branch and a strict RFC3339 regex for its alternate branch;
- analytics subscription-history entitlement calculation receives the already-normalized command;
- placement/marked-products report period arithmetic is downstream of the schema validator; the remaining defect there is the shared schema's missing real-calendar validation, already recorded separately.

These arithmetic uses are not additional wire-format defects.

## 3. Negative finding

After enumerating direct `Date.parse(...)` and `new Date(...)` uses in the authority contract, no third independent permissive parsing family was found beyond:

1. Performance alternate `from/to` validation;
2. generic `EFFECT_REPAIR_PARAM_SCHEMAS` date/date-time validation.

Everything else either belongs to a strict helper itself or computes ordering/range after a stronger validator has already constrained the input.

Verdict: **LOOSE_DATE_PARSE_FAMILY = CLOSED** for the executable baseline.

## 4. Remaining route to exhaustive full-Bridge closure

Helper-name and direct-parser enumeration can still miss bespoke date fields validated only as strings or integers. The final static sweep therefore must search the authoritative contract/schema by date-field vocabulary, including at minimum:

- `date_from`, `date_to`, `dateFrom`, `dateTo`;
- `from`, `to`, `since` in known time-range structures;
- `interval_start`, `interval_end`;
- `cutoff_from`, `cutoff_to`, delivery/timeslot ranges;
- `published_*`, `processed_at_*`, `created_*`;
- `auto_add_date`, `departure_date`, `issue_date`;
- `day`, `month`, `year` financial/calendar structures;
- schema `format: date`, `format: date-time`, `format: month`.

Only after that field-level sweep is reconciled against the operation registry can the remainder of the registered reads be terminally classified `NOT_DATE_RELATED`.

STD-06 remains **FROZEN ON LIVE FAIL**. No live provider request was made by this audit step.
