# Ozon Seller / Performance API research

Статус: **03A.3 API research in progress. Ozon browser extension does not exist; development has not started.**

Эта директория содержит research/provenance artifacts для будущего read-only LLM↔Ozon bridge.

## Current authority

Главные state/contract artifacts:

1. `OZON_03A3_COMPLETENESS_V1.json` — machine gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — research candidate registry + do-not-use paths;
3. `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` — общая contract queue;
4. `OZON_PRODUCT_MASTER_CONTRACT_QUEUE_V1.json` + `OZON_PRODUCT_REPORT_FALLBACK_2026-08-11.md`;
5. `OZON_LOGISTICS_CONTRACT_QUEUE_V1.json` + `OZON_DELIVERY_QUOTE_PREFLIGHT_2026-08-11.md`;
6. `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md` + `OZON_DELIVERY_DIAGNOSTICS_ALTERNATIVES_2026-08-11.md`;
7. currentness/fragment/operation-locator/operational evidence files;
8. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` + discovery queue.

Older negative-search snapshots are historical/partially superseded where later Ozon-owned evidence confirmed a family.

## Product Master

Primary research chain:

`product/list → product/info/list → attributes → pictures → description-category dictionaries → prices → stock/warehouses`.

Confirmed cross-method join: `sku` between `/v3/product/list` and `/v3/product/info/list`.

Still unproven on current full contracts: title/name, barcodes, dimensions/weight, current category/type placement, video/rich-content, full moderation/error state.

### Generated product-report fallback

`/v1/report/products/create` is an active generated-report family; Ozon updated request `visibility` on 2026-01-22.

It is **fallback only**, not a primary automatic step. Current output columns, exact report type and canonical operation id are not recovered from Ozon-owned docs in this runtime. Therefore the report closes **none** of the missing Product Master fields yet.

Future execution rule: explicit report create → later explicit status/info → later explicit retrieval. No hidden polling.

## Logistics / delivery diagnostics

Current configuration/diagnostic families include seller logistics info, warehouse/delivery-method/carriage configuration, FBS/rFBS error index, products/warehouses with FBS delivery restrictions and FBS posting promised-delivery fields.

The old `/v1/analytics/average-delivery-time*` family is **retired/do-not-target**; Ozon later disabled the whole feature and removed its methods. No one-to-one replacement is assumed.

### Conditional delivery quote surface

Current Ozon evidence also exposes the pre-order contour:

`/v1/delivery/check → /v2/delivery/checkout → /v2/order/create`.

Important boundaries:

- `/v1/delivery/check` has required `client_phone` in current documentation changes, so PII review is mandatory;
- `/v2/delivery/checkout` was updated 2026-08-06 to return preliminary service cost in addition to preliminary delivery time;
- check/checkout are **not seller-wide baseline analytics** and must not run automatically across products/customers;
- side-effect/server-state classification is still pending;
- `/v2/order/create` is a mutation and remains outside initial scope.

## Orders / finance / reports

Current posting targets use `/v3/posting/fbo/list`, `/v3/posting/fbs/get` and v4 FBS list/unfulfilled. Deprecated list versions must not be used.

Finance target is `/v1/finance/accrual/*`; `/v3/finance/transaction/list` and `/totals` shut down 2026-09-08. In `accrual/by-day`, old `type_id` was renamed to `accrual_id`.

Generated reports are always explicit multi-step operations; hidden polling/fan-out is forbidden.

## Operational constraints

Known: Seller API key lifetime 6 months, `/v1/roles.expires_at`, last explicit general-rate evidence 50 req/s per Client ID, unified product-operation limit model, report expiry fields. Unknown numeric/page/history/access values are not guessed.

`/v1/analytics/stocks` has an announced real-time transition on **2026-08-17** and cannot be post-transition revalidated yet on 2026-08-11.

## Performance API — primary external blocker

Ozon-owned 2026 material still explicitly treats Performance API as a public API. Official documentation root is `https://docs.ozon.ru/api/performance/`.

The current runtime cannot retrieve its authoritative method bodies because the docs surface enters a redirect loop. Therefore possible host/auth/campaign/statistics paths from third-party indexes remain discovery-only and are not promoted.

Still missing: Ozon-owned host/auth/token lifecycle, campaign inventory/product mapping, statistics methods/metrics/dimensions, budget/bid read context, rate/history/access contracts.

## Coding gate

`03A.4` remains **NOT STARTED** while `OZON_03A3_COMPLETENESS_V1.json` has `extension_development_allowed=false`.

No deprecated/retired targets, no third-party endpoint promotion, no hidden retries/fan-out/pagination, no PII leakage and no marketplace mutations.
