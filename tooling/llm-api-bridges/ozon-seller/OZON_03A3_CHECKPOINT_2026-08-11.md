# Ozon 03A.3 — research checkpoint — 2026-08-11

Статус: **IN PROGRESS**  
`03A.4 Ozon extension`: **NOT STARTED**  
Machine gate: `OZON_03A3_COMPLETENESS_V1.json` → `closure_allowed=false`, `extension_development_allowed=false`.

## Evidence levels

Research разделяет:

1. **path/currentness**;
2. **contract fragments**;
3. **full implementation contract**.

Production provider нельзя строить только по 1–2 уровню.

## Critical logistics correction

The earlier research state treated these methods as current after their descriptions were refreshed on 2026-03-17:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`.

A later Ozon-owned 2026 announcement supersedes that state: the **Average Delivery Time functionality is fully disabled and its methods are removed from documentation**.

Disposition:

- all three = **DISABLED / DO NOT TARGET**;
- one-to-one replacement = **NOT CONFIRMED**;
- no scraping or compatibility fallback.

Canonical correction: `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md`.

## Current delivery diagnostics after retirement

Ozon-owned current family evidence provides other causal layers; they are **not a direct replacement for the retired aggregate metric**.

Moved from beta to main on 2026-02-02:

- `/v1/rating/index/fbs/info` — FBS/rFBS error index;
- `/v1/rating/index/fbs/posting/list` — posting-level FBS/rFBS error-index evidence;
- `/v1/warehouse/invalid-products/get` — products with FBS delivery restrictions;
- `/v1/warehouse/warehouses-with-invalid-products` — warehouses containing restricted products.

Current `/v3/posting/fbs/get` has documented response fragments:

- `result.analytics_data.client_delivery_date_begin`;
- `result.analytics_data.client_delivery_date_end`.

These give posting-level promised-delivery evidence for FBS, not aggregate Average Delivery Time analytics.

Current logistics causal graph:

`logistics connection → warehouse → stock → delivery method → delivery restrictions → FBS/rFBS error index → carriage/shipment → cluster/geography → FBS posting promise where confirmed → posting/order outcome`.

Every API call remains explicit; graph ≠ automatic fan-out.

Canonical additional evidence: `OZON_DELIVERY_DIAGNOSTICS_ALTERNATIVES_2026-08-11.md`.

## Product Master

Research chain:

`/v3/product/list`
→ `/v3/product/info/list`
→ `/v4/product/info/attributes`
→ `/v2/product/pictures/info`
→ description-category dictionaries
→ `/v5/product/info/prices`
→ stock/warehouse layers.

Confirmed SKU join:

- `/v3/product/list.result.items.sku`;
- `/v3/product/info/list.items.sku`.

Still unresolved on current full contracts:

- title/name;
- barcodes;
- dimensions/weight;
- current `description_category_id` / `type_id` placement;
- video/rich-content;
- complete moderation/error state.

Category/attribute dictionaries remain freshness-aware evidence.

## Prices / promotions

Current target families:

- `/v5/product/info/prices`;
- `/v1/product/prices/details`;
- `/v1/seller-actions/list`;
- `/v1/seller-actions/products/list`.

Known corrections:

- `price.marketing_price` removed;
- v5 exposes `marketing_actions` fragments;
- `/v1/product/prices/details` requires `skus`.

Full price/promotion contracts remain pending.

## Stock / warehouses

Current layers include core `/v4/product/info/stocks`, warehouse-level stock, `/v2/warehouse/list`, Ozon/FBO warehouse dictionaries and `/v2/cluster/list`.

Warehouse v2 pagination fragments:

- request `limit`, `cursor`;
- response `cursor`, `has_next`.

`/v1/analytics/stocks` is announced to switch to real-time on **2026-08-17** and cannot be post-transition revalidated on 2026-08-11.

## Orders / returns / cancellations

Current posting targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Do not target v3 FBS list/unfulfilled; shutdown scheduled 2026-08-31.

Cancellation evidence includes return families, cancel-reason/status families and `/v2/conditional-cancellation/list`. Mutation siblings remain excluded.

## Finance / realization / reports

Do not target `/v3/finance/transaction/list` or `/v3/finance/transaction/totals`; shutdown scheduled 2026-09-08.

Future finance target:

- `/v1/finance/accrual/postings`;
- `/v1/finance/accrual/types`;
- `/v1/finance/accrual/by-day`.

Known `by-day` fragments:

- request `date`, `last_id`;
- response `last_id`, `accruals.container_fees`, `accruals.accrued_category`, `accruals.accrual_id`;
- `accruals.type_id` renamed to `accruals.accrual_id` on 2026-06-09.

Generated reports use explicit create → status/info/list → retrieval operations. Hidden polling is forbidden.

## Operational evidence

- Seller API keys under 2026 policy: 6-month lifetime;
- `/v1/roles` exposes `expires_at`;
- last explicit general-rate evidence: 50 requests/s per Client ID; revalidate before coding;
- unified product-operation limit model exists;
- `/v4/product/info/limit` exposes `operation_limits`;
- numeric product quota/reset semantics remain pending.

## Performance API — main external blocker

Confirmed:

- Performance API is a separate public Ozon advertising API contour;
- official root: `https://docs.ozon.ru/api/performance/`;
- Ozon-owned 2026 public-API migration material still explicitly includes Performance API.

Still unavailable from Ozon-owned method docs in this runtime:

- host/auth/token lifecycle;
- campaign inventory/product mapping;
- statistics endpoints and metric/dimension contracts;
- attributed order/revenue fields;
- report/rate/history/access lifecycle.

Third-party candidates remain discovery-only.

## Why full contracts are still blocked

Direct Seller/Performance operation pages remain unavailable in the current research runtime due redirect-loop behavior. This does not permit third-party Swagger/SDK as implementation authority.

## Current authoritative next targets

1. Obtain Ozon-owned full P0 Product Master contracts.
2. Extract full contracts/joins/reason taxonomies for delivery restrictions and FBS/rFBS error-index methods.
3. Obtain full warehouse/logistics/posting/return/finance/report contracts.
4. Resolve Ozon-owned Performance API host/auth/read-statistics contract.
5. Extract numeric quotas, page sizes, history windows and role/subscription restrictions.
6. Revalidate `/v1/analytics/stocks` after 2026-08-17.
7. Run final deprecation pass immediately before 03A.4.

Until these gates are closed:

- no Ozon extension code;
- no provider manifest/service worker/content script/popup;
- no real credentials;
- no marketplace write operations.
