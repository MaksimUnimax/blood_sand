# DEFECT-015 — shared effect-repair date schema sweep — 2026-09-04

Authority under audit:

- source commit `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- extension `v0.1.19`
- shared validator: `validateEffectRepairValue()` in `dist-step7-candidate/shared/ozon_contract.js`

This file records a shared contract defect discovered while exhaustively auditing all date/time/period-bearing Seller reads after the live `finance_balance` failure.

## Audit correction

A later direct read of the executable baseline found that the first version of this artifact overstated the defect for the two placement-report operations.

`normalizeEffectRepairParams()` already contains operation-specific logic for:

- `report_placement_by_products_create`;
- `report_placement_by_supplies_create`.

That baseline logic already:

1. parses `date_from` and `date_to` after appending `T00:00:00Z`;
2. rejects a reversed interval (`date_to < date_from`);
3. rejects a placement-report period greater than the documented 31 calendar days.

`report_marked_products_sales_create` also already has an operation-specific ordering check for `date.from <= date.to`.

Therefore the earlier statements that the placement reports were missing a 31-day period guard were incorrect and are superseded by this corrected version. The remaining confirmed defect is still real: the shared `format: date` validator checks lexical shape only, so an impossible calendar date can reach those later calculations and be normalized by JavaScript date parsing instead of being rejected locally.

## Shared root cause

`EFFECT_REPAIR_PARAM_SCHEMAS` uses JSON-schema-like `format` values, but the common validator implements them too loosely:

```text
format=date      -> regex ^YYYY-MM-DD$ only
format=month     -> regex YYYY-(01..12)
format=date-time -> Date.parse(value) only
```

Consequences:

1. **`date-time` is not enforced as RFC3339/OpenAPI date-time.** A JavaScript-parseable string outside the provider's documented `date-time` syntax can pass local preflight.
2. **`date` checks shape but not calendar validity.** Impossible dates such as `2026-02-31` match the regex and pass the shared validator.
3. The generic validator itself does not provide interval ordering or endpoint-specific max/recency rules. Some operations already add those rules in `normalizeEffectRepairParams()`; others do not. Audit conclusions therefore must be operation-specific rather than inferred from the generic validator alone.

This is a shared-root-cause repair surface, not a collection of unrelated endpoint mistakes.

## Affected date-time schemas

### `report_returns_create_v2`

Provider endpoint: `POST /v2/report/returns/create`.

Provider contract:

- `filter` required;
- `filter.date_from`, `filter.date_to`, `filter.status` required;
- both date fields are `format: date-time`;
- provider description says report data is available **only for the last three months**.

Bridge schema:

- correctly marks the fields as `format: date-time`;
- shared validator only calls `Date.parse()` rather than strict RFC3339 validation;
- no three-month recency guard exists in the schema-driven validation path.

Authority registry template:

```json
{"filter":{"date_from":"2026-01-01T00:00:00Z","date_to":"2026-01-01T00:00:00Z","status":"DisputeOpened"}}
```

Audit date is `2026-09-04`, so this template is far outside the provider's documented last-three-month window.

Verdict:

- **MISSING_GUARD — strict RFC3339 date-time enforcement**;
- **MISSING_GUARD — provider last-3-month recency window**;
- **INVALID_RUNNABLE_TEMPLATE — CONFIRMED**.

The operation has previous live positive evidence with valid RFC3339 input, so the valid path works; the defect is insufficient local rejection plus a now-invalid published default.

### `report_postings_create`

Provider endpoint: `POST /v1/report/postings/create`.

Provider contract:

- `filter.processed_at_from` and `filter.processed_at_to` required;
- both are `format: date-time`;
- current provider request example uses RFC3339 timestamps such as `2021-09-02T17:10:54.861Z`.

Bridge schema marks the fields as `date-time`, but the shared validator accepts anything `Date.parse()` accepts.

Verdict:

- **MISSING_GUARD — strict RFC3339 date-time enforcement**.

No provider max-history period is asserted here without explicit evidence. The fixed January 2026 template is therefore not classified invalid solely because it is old.

## Affected date-only schemas

### `report_placement_by_products_create`

Provider endpoint: `POST /v1/report/placement/by-products/create`.

Provider contract:

- `date_from` and `date_to` required;
- both documented as `YYYY-MM-DD`;
- `date_to` description explicitly says **maximum period — 31 days**.

Bridge:

- shared schema uses `format: date`;
- shared validator checks regex shape only, not a real calendar date;
- operation-specific code already rejects reversed intervals;
- operation-specific code already rejects a period greater than 31 calendar days.

Verdict:

- **MISSING_GUARD — representable calendar date**;
- **MATCH — interval ordering guard**;
- **MATCH — documented 31-day maximum-period guard**.

Registry template uses a one-day historical interval and is not classified invalid from current provider evidence.

### `report_placement_by_supplies_create`

Provider endpoint: `POST /v1/report/placement/by-supplies/create`.

Provider contract is parallel to the products report:

- required `date_from/date_to`;
- `YYYY-MM-DD`;
- maximum period **31 days**.

Bridge uses the same shared date-format validation and the same operation-specific ordering/31-day logic as the products report.

Verdict:

- **MISSING_GUARD — representable calendar date**;
- **MATCH — interval ordering guard**;
- **MATCH — documented 31-day maximum-period guard**.

### `report_marked_products_sales_create`

Provider endpoint: `POST /v1/report/marked-products-sales/create`.

Provider contract:

- nested `date.from` and `date.to` are required in the current documentation change log/request contract;
- both are documented as `YYYY-MM-DD` calendar dates.

Bridge:

- shared schema uses `format: date`, so impossible calendar combinations can pass the regex;
- operation-specific code already rejects `date.to < date.from`.

Verdict:

- **MISSING_GUARD — representable calendar date**;
- **MATCH — interval ordering guard**.

No maximum period is claimed without current provider evidence.

## Shared interval-ordering status

The generic schema validator itself does not enforce `from <= to` / `date_from <= date_to`. This is not, by itself, proof that every schema-driven range operation lacks ordering validation.

Confirmed baseline exceptions already protected by operation-specific logic:

- `report_placement_by_products_create` — ordering + 31-day maximum present;
- `report_placement_by_supplies_create` — ordering + 31-day maximum present;
- `report_marked_products_sales_create` — ordering present.

For remaining schema-driven ranges, ordering or range limits are promoted to defects only where current provider evidence proves the rule and no downstream operation-specific guard is present. Do not fabricate undocumented limits.

## Month-format schemas in the same shared validator

The following operations use `format: month` and the shared regex does at least enforce the lexical domain `YYYY-01..YYYY-12`:

- `finance_document_b2b_sales`
- `finance_mutual_settlement_report`
- `finance_compensation_report`
- `finance_decompensation_report`

These are **not automatically defects** from the shared format implementation. They still require separate provider audit for earliest/latest supported period and any current-period restrictions.

`report_realization_posting_create` is also schema-driven, but its schema already includes `month` minimum/maximum and `year` minimum. It still needs its business-period boundary audited independently from the primitive schema; that boundary is recorded separately in `DEFECT_015_FINANCE_REALIZATION_SWEEP_2026-09-04.md`.

## Required repair architecture when authorized

Do not patch individual report schemas one by one while leaving the shared validator weak.

Required shared invariants:

1. `format: date` -> exact `YYYY-MM-DD` **and real calendar date round-trip**;
2. `format: date-time` -> strict RFC3339 date-time with timezone, matching the existing strong helper semantics;
3. preserve existing operation-specific guards rather than reimplementing them inconsistently:
   - placement reports: existing ordering + <=31-day logic remains authoritative;
   - marked-products sales: existing ordering logic remains authoritative;
4. add missing endpoint-specific constraints only where provider evidence proves them:
   - returns report: last 3 months;
   - other operations only where current provider evidence proves a bound;
5. preserve `exact_request_preserved` truthfulness: validation must reject locally rather than silently rewrite unless transformation is explicitly designed and surfaced;
6. audit registry templates and guidance, not only the validator;
7. update all source/dist/generated copies and deterministic regressions.

## Required deterministic controls

Shared controls:

- date-only impossible date (`2026-02-31`) -> local reject, physical requests 0;
- date-time date-only string (`2026-08-28`) -> local reject for a `format: date-time` field;
- date-time without timezone -> local reject;
- valid RFC3339 -> pass schema validation;
- valid real YMD -> pass schema validation.

Operation-specific controls:

- `report_returns_create_v2`: older than three months -> local reject; current valid range -> pass;
- placement products/supplies: preserve regression proving reversed range rejection and the existing 31-day boundary behavior;
- marked-products sales: preserve regression proving reversed range rejection;
- stale `report_returns_create_v2` registry template must no longer certify as runnable.

## Evidence sources

Current Seller OpenAPI snapshot generated from official Ozon Seller Swagger:

- `/v2/report/returns/create`: `v2ReportReturnsCreateRequestFilter` documents `date-time` and last-three-month availability;
- `/v1/report/postings/create`: `reportCreateCompanyPostingsReportRequestFilter` documents `processed_at_from/to` as `date-time` and request example uses RFC3339;
- `v1CreatePlacementByProductsReportRequest`: `YYYY-MM-DD`, max 31 days;
- `v1CreatePlacementBySuppliesReportRequest`: `YYYY-MM-DD`, max 31 days;
- `ReportMarkedProductsSalesCreateRequestDate`: `from/to` as `YYYY-MM-DD`.

Executable-baseline readback additionally confirms the operation-specific placement and marked-products range guards described above.

STD-06 remains **FROZEN ON LIVE FAIL**. This evidence collection does not authorize executable changes or new live provider calls.
