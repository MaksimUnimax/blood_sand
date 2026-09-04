# DEFECT-015 — strict YYYY-MM-DD sweep — 2026-09-04

Authority: `249029b0ba8d9e6f9e26182bf678adf42868c6d6`, extension `v0.1.19`.

Purpose: audit every use of the Bridge `requireDateYmd()` family against the current Ozon contract. This is separate from the strict-RFC3339 sweep so date-only matches are not confused with the `finance_balance` failure.

## Helper under audit

`requireDateYmd()` accepts only a real calendar date in exact `YYYY-MM-DD` form.

## Verified rows

### `removal_from_stock_list` — MATCH

- Endpoint: `POST /v1/removal/from-stock/list`.
- Bridge: `date_from` and `date_to` required; strict `YYYY-MM-DD`; `limit` required 1..500; optional `last_id`.
- Current OpenAPI request schema `v1GetSupplierReturnsSummaryReportRequest` requires `date_from`, `date_to`, `limit`, describes both dates explicitly as `YYYY-MM-DD`, and defines `limit` 1..500.
- Endpoint request example uses `2025-03-01` through `2025-03-30`.
- Current schema does not state a maximum reporting interval or explicit ordering constraint; do not invent one without provider evidence.

Verdict: **MATCH — format + requiredness + documented limit**.

### `removal_from_supply_list` — MATCH

- Endpoint: `POST /v1/removal/from-supply/list`.
- Bridge uses the same `normalizeRemovalReportParams` as the stock report.
- Current OpenAPI request schema `v1GetSupplyReturnsSummaryReportRequest` requires `date_from`, `date_to`, `limit`, documents both dates as `YYYY-MM-DD`, and defines `limit` 1..500.
- No documented max-period or explicit ordering constraint was found in the current schema.

Verdict: **MATCH — format + requiredness + documented limit**.

### `finance_accrual_by_day` — MATCH on audited dimensions

- Bridge: exact date-only `date`, required `last_id`, date must be >= `2022-01-01`.
- Current generated/current provider contract evidence requires `date` and `last_id`, uses day-based semantics, and documents the earliest date as 2022-01-01.
- This method is one of the replacements for retiring `/v3/finance/transaction/list`.

Verdict: **MATCH — date format / earliest date / required continuation field**.

### `fbs_act_list` — YMD format live-proven

- Bridge requires `filter.date_from` and `filter.date_to` as `YYYY-MM-DD` and rejects reversed ordering.
- A valid dated request passed live during DEFECT-006 repair; provider returned HTTP 200.
- Separate max-period semantics remain independently auditable.

Verdict: **MATCH — wire format / ordering guard**.

## Performance API date family

Current Performance OpenAPI 2.0 explicitly documents:

- global statistics-export limit: **62 days per export**;
- `dateFrom` / `dateTo`: calendar dates `YYYY-MM-DD`;
- where `from` / `to` exist: RFC3339 `date-time`;
- `performance_campaign_product` and `performance_sku_statistics` explicitly state that they do **not consume Performance API limits**, so the global 62-day export limit must not be mechanically imposed on those two without method-specific evidence.

### `performance_campaign_product` — MATCH for YMD; loose RFC3339 validation for alternate fields

- Endpoint: `GET /api/client/statistics/campaign/product/json` (JSON suffix of documented `/api/client/statistics/campaign/product`).
- `dateFrom/dateTo` are documented as `YYYY-MM-DD`; Bridge uses strict YMD and rejects reversed ranges.
- Live STD-06 request `2026-08-28..2026-09-03` returned HTTP 200 with exact request preserved.
- Alternate `from/to` are documented as RFC3339 date-time.
- Bridge does **not** call strict `requireRfc3339DateTime()` for these alternate fields; it only checks `new Date(value).getTime()`, which accepts a broader set of JavaScript date strings.

Verdict:

- **MATCH — `dateFrom/dateTo` YMD wire format**;
- **MISSING_GUARD — strict RFC3339 enforcement for alternate `from/to`**.

Do not classify this as a live provider failure; the defect is that local preflight claims RFC3339 but does not actually enforce the documented wire format.

### `performance_media` — MATCH YMD + MISSING_GUARD for RFC3339 + 62-day period

- Endpoint: `GET /api/client/statistics/campaign/media/json`.
- Current OpenAPI documents `dateFrom/dateTo` as `YYYY-MM-DD` and `from/to` as RFC3339 date-time.
- Bridge YMD validation is strict and ordering-aware.
- Bridge alternate `from/to` validation uses loose JavaScript `new Date(...)` parsing instead of strict RFC3339 validation.
- Unlike campaign-product, this method is not marked exempt from Performance API export limits; the global Statistics limit is 62 days.
- No local 62-day guard was found in `normalizePerformanceMediaParams`.

Verdict: **MATCH — YMD format** + **MISSING_GUARD — strict RFC3339 alternate format** + **MISSING_GUARD — 62-day export period**.

### `performance_expense` — MATCH YMD + MISSING_GUARD 62-day period

- Endpoint: `GET /api/client/statistics/expense/json`.
- Current OpenAPI documents optional `dateFrom/dateTo` as `YYYY-MM-DD`; when omitted, provider returns the last 7 days.
- Bridge uses strict YMD and checks ordering when both are present.
- No local 62-day period guard was found.
- Method has no explicit exemption from Statistics export limits.

Verdict: **MATCH — YMD format** + **MISSING_GUARD — 62-day export period**.

### `performance_daily` — MATCH YMD + MISSING_GUARD 62-day period

- Endpoint: `GET /api/client/statistics/daily/json`.
- Current OpenAPI documents optional `dateFrom/dateTo` as `YYYY-MM-DD`; when omitted, provider returns the last 7 days.
- Bridge uses strict YMD and checks ordering when both are present.
- No local 62-day period guard was found.
- Method has no explicit exemption from Statistics export limits.

Verdict: **MATCH — YMD format** + **MISSING_GUARD — 62-day export period**.

### `performance_sku_statistics` — YMD format consistent; no 62-day claim yet

- Endpoint: `POST /api/client/statistics/products/sku`.
- Added by current Performance API on 2026-06-08.
- Method explicitly states it does **not consume Performance API limits**.
- Bridge uses strict YMD and ordering when both fields are present.
- Current request schema still needs exact field/requiredness inspection before a full MATCH row is closed.

Verdict: **YMD format consistent / detailed row still open**. Do **not** apply the 62-day export limit solely from the global limit table because this method is explicitly exempt.

## Important loose-date finding

A search of authority `ozon_contract.js` found `new Date(...).getTime()` validation paths that print an RFC3339 error message without using the strict RFC3339 regex. Confirmed relevant paths include Performance `media.from/to` and `campaign_product.from/to`.

By contrast, `posting_fbo_list` is **not** part of this loose-format defect: its `filter.since/to` are first normalized with strict `requireRfc3339DateTime()`; subsequent `new Date()` calls are only used for the one-year period calculation.

## Evidence sources

- Seller OpenAPI snapshot: `MissiaL/ozon-api/references/ozon-seller-openapi.json`.
- Performance OpenAPI snapshot: `MissiaL/ozon-api/references/ozon-performance-openapi.json`, identifies itself as Ozon Performance API v2.0 and includes the 62-day statistics-export limit.

## Open queue

1. Resolve exact request schema/requiredness for `performance_sku_statistics`.
2. Check remaining Performance statistics methods/templates for 62-day guards and strict alternate-date validation.
3. Resolve all remaining non-Performance `requireDateYmd()` call sites (current exact helper usage set is small: removal reports, finance accrual by day, FBS acts, Performance statistics).
4. Cross-check generated/bundled copies and deterministic tests.
5. Keep `analytics_data` separate: mixed `requireAnalyticsDate()` remains `NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE`.

STD-06 remains **FROZEN ON LIVE FAIL**; this static sweep issues no live Ozon requests.
