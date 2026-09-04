# DEFECT-015 — finance realization contract sweep — 2026-09-04

Authority under audit:

- source commit `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- extension `v0.1.19`

Provider reference: current Ozon Seller OpenAPI snapshot generated from the official Seller Swagger.

## 1. `finance_realization_posting` — confirmed missing guards

Bridge:

- endpoint: `POST /v1/finance/realization/posting`
- normalizer: `normalizeFinanceRealizationMonthParams`
- accepts required `month` and `year` as arbitrary `int32`; no month bounds, no earliest-report boundary.
- current registry template `{month:8, year:2023}` is within the provider-supported historical boundary.

Provider contract:

- report is available from the current period back through **August 2023 inclusive**;
- request requires `month` and `year`;
- documented provider 400 error descriptions explicitly include:
  - month must be inside **[1, 12]**;
  - year must be **>= 2023**;
  - unrepresentable calendar date is invalid;
  - report availability still starts at August 2023, so `year=2023, month<8` is also outside the supported business period.

Verdict:

- **MISSING_GUARD — month range [1,12]**;
- **MISSING_GUARD — earliest effective report period 2023-08**.

A simple `year >= 2023` check is not sufficient: January–July 2023 are still outside the documented report window.

## 2. `finance_realization_v2` — confirmed missing earliest-period guard

Bridge:

- endpoint: `POST /v2/finance/realization`
- same `normalizeFinanceRealizationMonthParams` as posting report;
- required `month/year` are only checked as `int32`;
- registry template `{month:8, year:2026}` is currently within the supported period.

Provider contract:

- method explicitly states: report can be obtained for periods **not earlier than August 2023**;
- older reports are available only in the seller cabinet;
- request schema requires `month` and `year`.

Verdict:

- **MISSING_GUARD — earliest effective report period 2023-08**;
- **MONTH-DOMAIN GUARD REQUIRED IN SHARED NORMALIZER** because the same normalizer is shared with `finance_realization_posting`, whose provider errors explicitly define month `[1,12]`.

Dependency implication: repairing the shared month normalizer must prove both operations, not only one.

## 3. `finance_realization_by_day` — confirmed missing 32-day guard; calendar-validation gap

Bridge:

- endpoint: `POST /v1/finance/realization/by-day`
- normalizer: `normalizeFinanceRealizationByDayParams`
- requires `day`, `month`, `year`, but only checks each as `int32`;
- no real calendar-date construction/validation;
- no recency window check.
- registry template `{day:28, month:8, year:2026}` is within 32 days on the audit date 2026-09-04.

Provider contract:

- requires all three fields `day`, `month`, `year`;
- returns realization data for one day;
- data is available **no more than 32 calendar days from the current date**;
- endpoint returns HTTP 400 for invalid parameters.

Verdict:

- **MISSING_GUARD — 32-calendar-day recency window**;
- **MISSING_GUARD — representable calendar date**: the Bridge currently accepts combinations such as impossible day/month values because `int32` alone does not establish a real date. This guard should be implemented by constructing and round-tripping the UTC calendar date, not by separate loose integer checks only.

The provider schema itself does not publish numeric min/max for day/month, so do not fabricate independent day/month limits beyond enforcing a representable calendar date and the documented 32-day window.

## Shared-root-cause implication

`normalizeFinanceRealizationMonthParams` was treated as sufficient because it mirrored the mechanically typed OpenAPI request shape (`int32`). The provider business constraints live partly in endpoint prose and error descriptions. This is the same process class exposed by `finance_balance`:

> schema primitive/type validation alone is not enough to certify an operation contract.

Required future repair closure must inspect:

1. request primitive/schema type;
2. endpoint prose constraints;
3. provider error descriptions/examples;
4. registry template/default;
5. guidance/discovery text;
6. all source/dist/generated copies;
7. deterministic negative and positive controls.

## Required deterministic controls when patching is authorized

### `finance_realization_posting`

- valid `2023-08` → preflight pass;
- month `0` → local reject / zero provider requests;
- month `13` → local reject / zero provider requests;
- `2023-07` → local reject / zero provider requests;
- current supported month → preflight pass.

### `finance_realization_v2`

- `2023-08` → preflight pass;
- `2023-07` → local reject;
- current supported month → preflight pass;
- shared month `0/13` negative controls.

### `finance_realization_by_day`

- real date within 32-day window → preflight pass;
- impossible calendar date → local reject;
- date older than 32 calendar days → local reject;
- exact 32-day boundary → deterministic boundary test based on an injected/frozen reference date, not wall-clock flakiness.

## Commercial-test status

STD-06 remains **FROZEN ON LIVE FAIL** at `finance_balance`. These findings expand the same repair cycle; they do not authorize executable changes and do not resume live testing.
