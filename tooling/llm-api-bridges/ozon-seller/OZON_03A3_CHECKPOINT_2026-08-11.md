# Ozon 03A.3 — research checkpoint — 2026-08-11

Статус: **IN PROGRESS**  
`03A.4 Ozon extension`: **NOT STARTED**  
Machine gate: `closure_allowed=false`, `extension_development_allowed=false`.

## Current upper checkpoint

В доступном Ozon-owned Seller API changelog текущий верхний method-change checkpoint этого прохода — **2026-08-06**. Это не утверждение, что после 6 августа изменений нет; только граница найденного индексируемого evidence.

## Critical logistics correction

Average Delivery Time analytics fully retired in a later 2026 Ozon announcement. Do not target `/v1/analytics/average-delivery-time`, `/details`, `/summary`. No one-to-one replacement is confirmed.

Current delivery diagnostics instead include:

- FBS/rFBS error-index families;
- FBS product/warehouse delivery restrictions;
- FBS posting promised-delivery fields;
- warehouse/delivery-method/carriage configuration.

## Conditional delivery quote

Current pre-order contour:

`/v1/delivery/check → /v2/delivery/checkout → /v2/order/create`.

Research disposition:

- `/v1/delivery/check`: `client_phone` is required in current documentation changes → PII/manual gate;
- `/v2/delivery/checkout`: updated **2026-08-06**; returns preliminary service cost in addition to preliminary delivery time;
- check/checkout are scenario-specific quote/preflight operations, **not seller-wide automatic baseline analytics**;
- side-effect/server-state classification remains pending;
- `/v2/order/create` is mutation and remains outside initial bridge.

Canonical artifact: `OZON_DELIVERY_QUOTE_PREFLIGHT_2026-08-11.md`.

## Product Master + generated report fallback

Primary chain remains direct current Product API families, joined by confirmed `sku` where proven.

Unresolved current fields still include title/name, barcodes, dimensions/weight, current category/type placement, video/rich-content and full moderation/error state.

`/v1/report/products/create` is a current generated-report fallback candidate; request `visibility` was updated 2026-01-22. Its current output columns/report type are not available from Ozon-owned indexed docs in this runtime, so it closes **none** of those gaps yet.

Report execution must remain explicit create → status/info → retrieval, with no hidden polling.

Canonical artifact: `OZON_PRODUCT_REPORT_FALLBACK_2026-08-11.md`.

## Orders / finance / reports

Current posting targets: `/v3/posting/fbo/list`, `/v3/posting/fbs/get`, `/v4/posting/fbs/list`, `/v4/posting/fbs/unfulfilled/list`.

Finance target: `/v1/finance/accrual/postings`, `/types`, `/by-day`; old transaction list/totals shut down 2026-09-08. Current by-day field is `accrual_id`, not renamed `type_id`.

Generated reports are explicit asynchronous/multi-step operations; no hidden polling/fan-out.

## Performance API — primary external blocker

Ozon-owned 2026 material still explicitly includes Performance API among public APIs. Official root: `https://docs.ozon.ru/api/performance/`.

Still unavailable from Ozon-owned method docs in this runtime:

- current API host/auth/token lifecycle;
- campaign inventory/product mapping;
- statistics endpoints and metric/dimension schemas;
- attributed outcome fields;
- budget/bid read context;
- rate/history/access lifecycle.

Third-party candidates remain discovery-only.

## Full-contract environment blocker

Canonical Seller/Performance docs operation URLs consistently fail in this runtime with redirect-loop behavior; container network also cannot resolve `api-seller.ozon.ru`. This is not permission to use third-party Swagger/SDK as implementation authority.

## Next targets

1. Ozon-owned full P0 Product Master contracts and product-report output schema.
2. Full contracts for delivery restrictions/error index and posting delivery fields.
3. Ozon-owned Performance API host/auth/read-statistics contract.
4. Numeric quotas/page sizes/history/access restrictions.
5. Revalidate `/v1/analytics/stocks` after 2026-08-17.
6. Final deprecation scan immediately before 03A.4.

Until then: no Ozon extension code, no real credentials, no write operations.
