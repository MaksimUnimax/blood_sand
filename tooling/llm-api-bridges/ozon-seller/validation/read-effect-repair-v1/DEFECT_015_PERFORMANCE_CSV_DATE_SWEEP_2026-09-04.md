# DEFECT-015 — Performance CSV date/period twin sweep — 2026-09-04

Authority executable baseline: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

Purpose: close the separate CSV operation identities that were not individually enumerated in `DEFECT_015_PERFORMANCE_DATE_SWEEP_2026-09-04.md`. These are distinct registered Bridge operations even when they share a normalizer with their JSON counterpart.

No executable Bridge file is changed. No live provider request is performed or authorized. STD-06 remains frozen on the live `finance_balance` failure.

## Provider rule

Current Ozon Performance API documentation states that statistics-export limits apply to reports in the Statistics section and sets the maximum export period to **62 days**. Method-specific exemptions override that global limit. The current provider description for campaign-product statistics explicitly says that method does not consume Performance API limits and exposes CSV at `/api/client/statistics/campaign/product`, with JSON available by adding `/json`.

## Bridge binding proof

The authority contract binds the CSV operations to the same normalizers used by the corresponding JSON operations:

- `performance_media_csv` -> `normalizePerformanceMediaParams`
- `performance_campaign_product_csv` -> `normalizePerformanceCampaignProductParams`
- `performance_expense_csv` -> `normalizePerformanceDateRangeParams`
- `performance_daily_csv` -> `normalizePerformanceDateRangeParams`

Therefore any date-validation defect in those shared normalizers is independently reachable through each registered CSV operation.

## Findings

### `performance_media_csv` — `GET /api/client/statistics/campaign/media`

Bridge accepts either YMD `dateFrom/dateTo` or alternate `from/to` via `normalizePerformanceMediaParams`.

Inherited defects:
1. alternate `from/to` are checked with loose JavaScript date parsing (`new Date(value).getTime()`), not strict RFC3339 syntax even though the validation error claims RFC3339;
2. no local 62-day maximum-period guard exists.

Verdict: **MISSING_GUARD — strict RFC3339 alternate format** + **MISSING_GUARD — max 62-day statistics export period**.

### `performance_campaign_product_csv` — `GET /api/client/statistics/campaign/product`

Bridge uses `normalizePerformanceCampaignProductParams` for the CSV route.

Provider explicitly marks this method as not consuming Performance API limits, so the global 62-day limit is not inferred for it.

Inherited defect:
- alternate `from/to` use loose JavaScript date parsing rather than strict RFC3339 validation.

Verdict: **MISSING_GUARD — strict RFC3339 alternate format**.

### `performance_expense_csv` — `GET /api/client/statistics/expense`

Bridge uses the same `normalizePerformanceDateRangeParams` as JSON expense statistics:
- YMD syntax and ordering are validated;
- the provider-wide Statistics export limit is 62 days;
- no local 62-day guard exists.

Verdict: **MATCH — YMD format/order** + **MISSING_GUARD — max 62-day statistics export period**.

### `performance_daily_csv` — `GET /api/client/statistics/daily`

Bridge uses the same `normalizePerformanceDateRangeParams` as JSON daily statistics:
- YMD syntax and ordering are validated;
- no local 62-day guard exists.

Verdict: **MATCH — YMD format/order** + **MISSING_GUARD — max 62-day statistics export period**.

## Audit correction

The original Performance date sweep correctly identified the shared validator defects but enumerated only the JSON operation names. Under the owner's command to audit **all methods**, shared implementation does not collapse distinct registry operations. These four CSV operations are therefore now explicitly included in the defect population.

No live calls were made. No executable repair is performed in this audit commit.