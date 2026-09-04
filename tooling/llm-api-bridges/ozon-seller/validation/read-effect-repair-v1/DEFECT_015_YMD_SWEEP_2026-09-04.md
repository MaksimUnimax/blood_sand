# DEFECT-015 — strict YYYY-MM-DD sweep — 2026-09-04

Authority: `249029b0ba8d9e6f9e26182bf678adf42868c6d6`, extension `v0.1.19`.

Purpose: audit every use of the Bridge `requireDateYmd()` family against the current Ozon contract. This is separate from the strict-RFC3339 sweep so date-only matches are not confused with the `finance_balance` failure.

## Helper under audit

`requireDateYmd()` accepts only a real calendar date in exact `YYYY-MM-DD` form.

## Verified rows

### `removal_from_stock_list` — MATCH

- Endpoint: `POST /v1/removal/from-stock/list`.
- Bridge: `date_from` and `date_to` required; strict `YYYY-MM-DD`; `limit` required 1..500; optional `last_id`.
- Current OpenAPI request schema `v1GetSupplierReturnsSummaryReportRequest`:
  - requires `date_from`, `date_to`, `limit`;
  - describes both dates explicitly as `YYYY-MM-DD`;
  - endpoint request example uses `2025-03-01` through `2025-03-30`;
  - `limit` minimum 1, maximum 500.
- Current schema does not state a maximum reporting interval or an explicit `date_from <= date_to` constraint. Do not invent a missing guard without provider evidence.

Verdict: **MATCH — format + requiredness + documented limit**.

### `removal_from_supply_list` — MATCH

- Endpoint: `POST /v1/removal/from-supply/list`.
- Bridge uses the same `normalizeRemovalReportParams` as the stock report.
- Current OpenAPI request schema `v1GetSupplyReturnsSummaryReportRequest`:
  - requires `date_from`, `date_to`, `limit`;
  - both dates are explicitly documented as `YYYY-MM-DD`;
  - request example uses date-only values;
  - `limit` minimum 1, maximum 500.
- No documented max-period or explicit ordering constraint was found in the current schema.

Verdict: **MATCH — format + requiredness + documented limit**.

### `finance_accrual_by_day` — MATCH on audited dimensions

- Bridge: exact date-only `date`, required `last_id`, date must be >= `2022-01-01`.
- Current generated/current provider contract evidence requires the date and `last_id`, uses the day-based API semantics, and documents the earliest date as 2022-01-01.
- This method is one of the replacements for the retiring `/v3/finance/transaction/list` family.

Verdict: **MATCH — date format / earliest date / required continuation field**.

### `fbs_act_list` — YMD format already live-proven

- Bridge normalizer requires `filter.date_from` and `filter.date_to` as `YYYY-MM-DD` and rejects reversed ordering.
- A valid dated request passed live during DEFECT-006 repair on the current product lineage; provider returned HTTP 200.
- This row remains subject to any separate max-period audit, but the YMD wire format itself is provider-proven.

Verdict: **MATCH — wire format / ordering guard**.

### Performance date-only family — provider-proven at least for campaign-product statistics

Bridge strict-YMD normalizers include:

- `normalizePerformanceSkuStatisticsParams`;
- `normalizePerformanceMediaParams`;
- `normalizePerformanceDateRangeParams`;
- `normalizePerformanceCampaignProductParams`.

All use `dateFrom` / `dateTo` as `YYYY-MM-DD` and reject reversed ranges when both fields are present.

Live STD-06 proof:

- `performance_campaign_product`
- `dateFrom=2026-08-28`, `dateTo=2026-09-03`
- provider `performance_api`
- HTTP 200
- exact request preserved.

Verdict for `performance_campaign_product`: **MATCH — YMD wire format**.

The remaining Performance YMD operations still require per-endpoint static/current-contract confirmation before they are marked MATCH individually.

## Evidence source

Current OpenAPI snapshot opened from:

`MissiaL/ozon-api/references/ozon-seller-openapi.json`

It identifies itself as Ozon Seller API documentation generated from the official Seller Swagger. For the removal methods the relevant schemas are `v1GetSupplierReturnsSummaryReportRequest` and `v1GetSupplyReturnsSummaryReportRequest`.

## Open queue

1. Resolve all remaining `requireDateYmd()` call sites to operation names/endpoints.
2. Check date-only format, requiredness, ordering and max/min period separately.
3. Check published registry templates/defaults for every YMD operation.
4. Cross-check generated/bundled copies and deterministic tests.
5. Keep `analytics_data` separate: it uses the mixed `requireAnalyticsDate()` helper and is currently `NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE`.

STD-06 remains **FROZEN ON LIVE FAIL**; this static sweep issues no live Ozon requests.
