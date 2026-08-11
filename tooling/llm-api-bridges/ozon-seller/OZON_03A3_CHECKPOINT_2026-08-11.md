# Ozon 03A.3 — research checkpoint — 2026-08-11

Статус: **IN PROGRESS**  
`03A.4 Ozon extension`: **NOT STARTED**  
Machine gate: `OZON_03A3_COMPLETENESS_V1.json` → `closure_allowed=false`, `extension_development_allowed=false`.

## Что этот checkpoint означает

За текущий research cycle удалось существенно отделить три уровня доказательства:

1. **API contour/path currentness** — существует ли current family и какая версия является target;
2. **contract fragments** — отдельные поля/pagination/deprecation/required inputs, которые Ozon явно менял в changelog;
3. **full implementation contract** — HTTP verb, полный request/response, limits/history/access/error semantics. Этот уровень для большинства P0 methods ещё не закрыт, потому что `docs.ozon.ru` operation pages в текущей runtime уходят в redirect loop.

Нельзя переносить методы в production provider только по уровню 1 или 2.

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

- `/v3/product/list.result.items.sku`
- `/v3/product/info/list.items.sku`.

Still unresolved current read fields:

- title/name;
- barcodes in current v3 bulk-info contract;
- dimensions/weight;
- current `description_category_id` / `type_id` placement in v4 attributes;
- video/rich-content;
- complete moderation/error state.

Category/attribute dictionaries must be freshness-aware: Ozon announced automated category/attribute change-notification mechanisms in 2026, but exact feed contract remains pending.

## Prices / promotions

Current target families:

- `/v5/product/info/prices`;
- `/v1/product/prices/details`;
- `/v1/seller-actions/list`;
- `/v1/seller-actions/products/list`.

Known corrections:

- `price.marketing_price` is removed from current price documentation;
- v5 exposes current `marketing_actions` fragments;
- `/v1/product/prices/details` requires `skus`.

Full price/promotion semantics and contracts remain pending.

## Stock / warehouse / logistics

Current layers now separated:

- core stock `/v4/product/info/stocks`;
- warehouse-level stock families;
- seller warehouses `/v2/warehouse/list`;
- Ozon/FBO warehouse dictionaries;
- `/v2/cluster/list`;
- `/v1/seller/ozon-logistics/info`;
- `/v2/delivery-method/list`;
- `/v2/carriage/delivery/list`;
- average-delivery-time analytics family.

Warehouse v2 pagination fragments are confirmed:

- request `limit`, `cursor`;
- response `cursor`, `has_next`.

Correct diagnostic dependency:

`seller logistics connection → warehouse → SKU stock → delivery method → carriage/shipment → cluster/geography → delivery time → posting/order`.

This is not permission for hidden automatic fan-out.

## Orders / returns / cancellations

Current posting targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Do not target v3 FBS list/unfulfilled; shutdown scheduled 2026-08-31.

Cancellation evidence includes:

- return families;
- cancel-reason/status families;
- `/v2/conditional-cancellation/list` for rFBS conditional cancellation applications.

Mutation siblings remain excluded.

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
- response `last_id`, `accruals.container_fees`, `accruals.accrued_category`.

Generated reports use explicit create → status/info/list → retrieval operations. Report expiry fields are confirmed. Hidden polling is forbidden.

## Operational evidence

Confirmed/research evidence:

- Seller API keys under 2026 policy have 6-month lifetime;
- `/v1/roles` exposes `expires_at`;
- last explicit general-rate Ozon notification evidence: 50 requests/s across all methods per Client ID; revalidate before coding rather than hardcode permanently;
- unified product-operation limit model exists;
- `/v4/product/info/limit` exposes `operation_limits`;
- numeric product quota/reset semantics remain pending;
- `/v1/analytics/stocks` is announced to switch to real-time on 2026-08-17 and must be revalidated after that date.

## Performance API — main external blocker

Confirmed:

- Performance API is a separate public Ozon advertising API contour;
- official documentation root is `https://docs.ozon.ru/api/performance/`;
- Ozon-owned advertising materials recommend Performance API for automation;
- official Ozon webinar recording `lp.ozon.ru/stream/view/3684` exists, but the accessible index does not expose a technical transcript.

Important date correction:

- the linked Ozon Marketplace webinar campaign slug is `webinar_31.07.25`; therefore it is **2025 evidence**, not 2026 currentness evidence.

Not confirmed from Ozon-owned method docs in current runtime:

- host/auth;
- campaign list/status/type;
- campaign→product mapping;
- statistics endpoints;
- impressions/clicks/spend/CTR/CPC/CPM API fields;
- attributed order/revenue metrics;
- dimensions;
- token/report/rate/history/access lifecycle.

Third-party candidate paths remain only in `OZON_PERFORMANCE_DISCOVERY_QUEUE_V1.json` with `ozon_owned_confirmed=false`.

## Why full contracts are still blocked

Direct opens of:

- `https://docs.ozon.ru/api/seller/`;
- direct current Seller API operation links from Ozon notifications;
- `https://docs.ozon.ru/api/performance/`

all fail in the current web runtime with redirect-loop behavior. A direct container-network attempt also could not reach the Ozon docs/API surface because DNS is unavailable in that runtime.

Search restricted to `docs.ozon.ru` did not return operation-body snippets for the needed Performance candidates.

This environmental limitation is **not** permission to use third-party Swagger/SDK as implementation authority.

## Current authoritative next targets

1. Obtain Ozon-owned full contracts for P0 Product Master operations.
2. Obtain full contracts for warehouse/logistics/posting/return/finance/report operations.
3. Resolve Ozon-owned Performance API host/auth/read-statistics contract.
4. Extract numeric quotas, page sizes, history windows and roles/subscription restrictions.
5. Revalidate `/v1/analytics/stocks` after 2026-08-17.
6. Run final currentness/deprecation pass immediately before 03A.4.

Until these gates are closed:

- no Ozon extension code;
- no provider manifest/service worker/content script/popup;
- no real credentials;
- no marketplace write operations.
