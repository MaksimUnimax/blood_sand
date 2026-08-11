# Ozon 03A.3 — research checkpoint — 2026-08-11

Статус: **IN PROGRESS**  
`03A.4 Ozon extension`: **NOT STARTED**  
Machine gate: `OZON_03A3_COMPLETENESS_V1.json` → `closure_allowed=false`, `extension_development_allowed=false`.

## Что этот checkpoint означает

Research разделяет три уровня доказательства:

1. **API contour/path currentness** — существует ли current family и какая версия является target;
2. **contract fragments** — отдельные fields/pagination/deprecation/required inputs, которые Ozon явно подтверждает/меняет;
3. **full implementation contract** — HTTP verb, полный request/response, limits/history/access/error semantics.

Нельзя переносить методы в production provider только по уровню 1 или 2.

## Critical correction of this pass — Average Delivery Time retired

Ранний research считал current следующие методы, потому что Ozon обновлял их описания 2026-03-17:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`.

Более позднее Ozon-owned уведомление 2026 года имеет приоритет: функционал **«Среднее время доставки» полностью отключён**, а его методы удаляются из документации.

Current disposition:

- все три метода = **DISABLED / DO NOT TARGET 03A.4**;
- replacement = **NOT CONFIRMED**;
- current logistics diagnostics больше не строится вокруг этой analytics family;
- replacement нельзя угадывать по posting fields или сторонним SDK.

Canonical correction: `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md`.

## Product Master — target read coverage определён

Research chain:

`/v3/product/list`
→ `/v3/product/info/list`
→ `/v4/product/info/attributes`
→ `/v2/product/pictures/info`
→ description-category dictionary chain
→ `/v5/product/info/prices`
→ stock / warehouse layers.

Confirmed SKU join:

- `/v3/product/list.result.items.sku`;
- `/v3/product/info/list.items.sku`.

Still unresolved current read fields:

- title/name;
- barcodes in current v3 bulk-info contract;
- dimensions/weight;
- current `description_category_id` / `type_id` placement in v4 attributes;
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

- `price.marketing_price` removed from current price documentation;
- v5 exposes current `marketing_actions` fragments;
- `/v1/product/prices/details` requires `skus`.

Full price/promotion semantics and contracts remain pending.

## Stock / warehouse / logistics

Current layers:

- core stock `/v4/product/info/stocks`;
- warehouse-level stock families;
- seller warehouses `/v2/warehouse/list`;
- Ozon/FBO warehouse dictionaries;
- `/v2/cluster/list`;
- `/v1/seller/ozon-logistics/info`;
- `/v2/delivery-method/list`;
- `/v2/carriage/delivery/list`.

Warehouse v2 pagination fragments:

- request `limit`, `cursor`;
- response `cursor`, `has_next`.

Correct current dependency:

`seller logistics connection → warehouse → SKU stock → delivery method → carriage/shipment → cluster/geography → posting/order`.

Delivery-quality/date evidence is now an explicit **gap** after retirement of Average Delivery Time analytics. It may only be reintroduced from a separately verified current Ozon-owned contract.

## Orders / returns / cancellations

Current posting targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Do not target v3 FBS list/unfulfilled; shutdown scheduled 2026-08-31.

Cancellation evidence includes return families, cancel-reason/status families and `/v2/conditional-cancellation/list`. Mutation siblings remain excluded.

## Finance / realization / reports

Do not target:

- `/v3/finance/transaction/list`;
- `/v3/finance/transaction/totals`.

They are scheduled for shutdown 2026-09-08.

Future finance target:

- `/v1/finance/accrual/postings`;
- `/v1/finance/accrual/types`;
- `/v1/finance/accrual/by-day`.

Known `by-day` fragments:

- request `date`, `last_id`;
- response `last_id`, `accruals.container_fees`, `accruals.accrued_category`, `accruals.accrual_id`;
- current correction: `accruals.type_id` was renamed to `accruals.accrual_id` on 2026-06-09.

Generated reports use explicit create → status/info/list → retrieval operations. Hidden polling is forbidden.

## Operational evidence

Confirmed/research evidence:

- Seller API keys under 2026 policy have 6-month lifetime;
- `/v1/roles` exposes `expires_at`;
- last explicit general-rate Ozon notification evidence: 50 requests/s across all methods per Client ID; revalidate before coding rather than hardcode permanently;
- unified product-operation limit model exists;
- `/v4/product/info/limit` exposes `operation_limits`;
- numeric product quota/reset semantics remain pending;
- `/v1/analytics/stocks` is announced to switch to real-time on 2026-08-17 and therefore cannot be post-transition revalidated yet on 2026-08-11.

## Performance API — main external blocker

Confirmed:

- Performance API is a separate public Ozon advertising API contour;
- official documentation root is `https://docs.ozon.ru/api/performance/`;
- Ozon-owned 2026 public-API migration material still explicitly includes Performance API;
- official Ozon webinar recording exists, but accessible index does not expose a technical transcript.

Important date correction retained:

- linked Ozon Marketplace webinar campaign slug `webinar_31.07.25` = **2025 evidence**, not 2026 currentness evidence.

Not confirmed from Ozon-owned method docs in current runtime:

- host/auth;
- campaign list/status/type;
- campaign→product mapping;
- statistics endpoints;
- metric/dimension contracts;
- attributed order/revenue fields;
- token/report/rate/history/access lifecycle.

Third-party candidates remain discovery-only with `ozon_owned_confirmed=false`.

## Why full contracts are still blocked

Direct opens of Seller API operation pages and `https://docs.ozon.ru/api/performance/` fail in the current research runtime with redirect-loop behavior. Container network access cannot substitute because Ozon docs/API DNS is unavailable there.

This environmental limitation is **not** permission to use third-party Swagger/SDK as implementation authority.

## Current authoritative next targets

1. Obtain Ozon-owned full contracts for P0 Product Master operations.
2. Obtain full contracts for warehouse/logistics/posting/return/finance/report operations.
3. Determine whether a current Ozon-owned replacement/alternative exists for retired delivery-quality analytics; do not assume one.
4. Resolve Ozon-owned Performance API host/auth/read-statistics contract.
5. Extract numeric quotas, page sizes, history windows and roles/subscription restrictions.
6. Revalidate `/v1/analytics/stocks` after 2026-08-17.
7. Run final currentness/deprecation pass immediately before 03A.4.

Until these gates are closed:

- no Ozon extension code;
- no provider manifest/service worker/content script/popup;
- no real credentials;
- no marketplace write operations.
