# DEFECT-015 — Performance API date/period sweep — 2026-09-04

Authority: `249029b0ba8d9e6f9e26182bf678adf42868c6d6`, Bridge `v0.1.19`.

Current provider reference: Ozon Performance API OpenAPI v2.0 (`ozon-performance-openapi.json`).

## Global provider rule

The current Performance API documentation states a **62-day limit per statistics export**. This applies to statistics export surfaces unless the method explicitly says it does not consume Performance API limits.

## Findings

### `performance_expense` — MISSING_GUARD: 62-day period

- Bridge endpoint: `GET /api/client/statistics/expense/json`.
- `dateFrom/dateTo` are correctly enforced as `YYYY-MM-DD`.
- Bridge rejects reversed dates when both are present.
- Provider Statistics export limit: 62 days.
- No local 62-day guard exists in `normalizePerformanceDateRangeParams`.

Verdict: **MATCH — YMD format** + **MISSING_GUARD — max 62-day export period**.

### `performance_daily` — MISSING_GUARD: 62-day period

- Bridge endpoint: `GET /api/client/statistics/daily/json`.
- `dateFrom/dateTo` are correctly enforced as `YYYY-MM-DD`.
- Provider says missing dates return the last 7 days.
- No local 62-day guard exists in `normalizePerformanceDateRangeParams`.

Verdict: **MATCH — YMD format** + **MISSING_GUARD — max 62-day export period**.

### `performance_media` — two missing guards

- Bridge endpoint: `GET /api/client/statistics/campaign/media/json`.
- Provider supports either:
  - `dateFrom/dateTo` as `YYYY-MM-DD`, or
  - `from/to` as RFC3339 date-time.
- Bridge YMD path is strict and ordering-aware.
- Bridge alternate `from/to` path only checks `new Date(value).getTime()`, not strict RFC3339 syntax, while emitting an RFC3339 error message.
- Method is not marked exempt from Statistics export limits; no local 62-day guard exists.

Verdict: **MATCH — YMD format** + **MISSING_GUARD — strict RFC3339 alternate format** + **MISSING_GUARD — max 62-day period**.

### `performance_campaign_product` — YMD live-proven; loose alternate RFC3339 validation

- Bridge endpoint: `GET /api/client/statistics/campaign/product/json`.
- Provider documents `dateFrom/dateTo` as YMD and `from/to` as RFC3339 date-time.
- Live STD-06 YMD request for 2026-08-28..2026-09-03 returned HTTP 200 with exact request preserved.
- Provider explicitly says this method does **not consume Performance API limits**, so the global 62-day limit is not mechanically applied without method-specific evidence.
- Bridge alternate `from/to` uses loose JavaScript date parsing instead of strict RFC3339 validation.

Verdict: **MATCH — YMD wire format** + **MISSING_GUARD — strict RFC3339 alternate format**.

### `performance_sku_statistics` — MISSING_GUARD + INVALID_RUNNABLE_TEMPLATE

- Bridge endpoint: `POST /api/client/statistics/products/sku`.
- Current provider schema `extstatisticsSearchPromoProductsSKUStatisticsRequest`:
  - `dateFrom`: YMD; description says start date must be **not earlier than the previous day**;
  - `dateTo`: YMD;
  - method explicitly says it does **not consume Performance API limits**.
- Bridge normalizer checks only YMD syntax and `dateFrom <= dateTo`; it does not enforce the provider recency boundary.
- Authority registry publishes this runnable template:

  `{"dateFrom":"2026-01-01","dateTo":"2026-01-07"}`

- Audit date is 2026-09-04, so that default is months older than the provider's current documented admissible start date.

Verdict: **MISSING_GUARD — provider recency boundary** + **INVALID_RUNNABLE_TEMPLATE — CONFIRMED**.

This is a strong example of why package validation must verify templates against current provider semantics, not only schema shape.

## Non-finding: `posting_fbo_list`

A loose `new Date()` usage exists in period arithmetic for `posting_fbo_list`, but its `filter.since/to` values are first passed through strict `requireRfc3339DateTime()`. Therefore the `new Date()` call there does not widen accepted wire syntax; it is only used to calculate the one-year bound.

Verdict: **NOT A LOOSE-FORMAT DEFECT**.

## Required repair closure when authorized

1. Add a reusable strict RFC3339 path for all Performance `from/to` fields that are documented as date-time.
2. Add provider-period guard(s) for non-exempt Statistics exports (62 days).
3. Add `performance_sku_statistics` recency validation based on the current provider rule.
4. Replace its stale hard-coded registry template with a lifecycle-safe/non-stale strategy; a static January 2026 date cannot remain a runnable default in September 2026 when the provider only allows near-current data.
5. Audit all registry templates, guidance/examples, bundled/generated copies and deterministic tests for the same constraints.
6. Do not infer the 62-day limit for methods explicitly marked exempt unless current method-specific evidence requires it.

STD-06 remains **FROZEN ON LIVE FAIL**. No Performance live probes are issued during this audit.
