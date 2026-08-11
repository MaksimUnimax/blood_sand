# Ozon Seller / Performance API research

Статус: **03A.3 API research in progress. Ozon browser extension does not exist; development has not started.**

Эта директория содержит только research/provenance artifacts для будущего read-only LLM↔Ozon bridge.

## Current authority order

При конфликте старых и новых snapshots использовать:

1. `OZON_03A3_COMPLETENESS_V1.json` — текущий machine-readable gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — current candidate registry + deprecated/do-not-use paths;
3. `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` — общая per-operation очередь contract gaps;
4. `OZON_PRODUCT_MASTER_CONTRACT_QUEUE_V1.json` — P0 contract queue для Product/SKU/Listing/Category master;
5. `OZON_LOGISTICS_CONTRACT_QUEUE_V1.json` — warehouse → delivery method → carriage → delivery-time contract queue;
6. `OZON_PRODUCT_MASTER_JOIN_EVIDENCE_V1.json` — доказанные cross-method identifiers/fields;
7. `OZON_PRODUCT_MASTER_COVERAGE_2026-08-11.md` — product master read-chain coverage;
8. `OZON_CATEGORY_ATTRIBUTE_FRESHNESS_2026-08-11.md` — dynamic category/attribute freshness requirement;
9. `OZON_LOGISTICS_GEOGRAPHY_COVERAGE_2026-08-11.md` — logistics/geography diagnostic coverage;
10. `OZON_CONTRACT_FRAGMENT_REGISTRY_2026-08-11.json` — Ozon-owned pagination/expiry/rate/field fragments;
11. `OZON_CANONICAL_OPERATION_LOCATORS_2026-08-11.json` — exact official `#operation` locators only where actually observed;
12. `OZON_OPERATIONAL_CONSTRAINTS_2026-08-11.md` — key lifetime, rate/product-operation limits, reports/pagination;
13. `OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md` — currentness/deprecation evidence;
14. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` — Performance API blocker;
15. `OZON_PERFORMANCE_DISCOVERY_QUEUE_V1.json` — discovery-only probes, all unverified by Ozon contract until promoted explicitly;
16. base audits/revalidation files.

`OZON_NEGATIVE_VERIFICATION_2026-08-11.md` is historical / partially superseded and is not current status authority for families later confirmed by Ozon changelog evidence.

## Product Master — current research state

Current/canonical read families now form a concrete evidence chain:

`/v3/product/list`
→ `/v3/product/info/list`
→ `/v4/product/info/attributes`
→ `/v2/product/pictures/info`
→ `/v1/description-category/tree`
→ `/v1/description-category/attribute`
→ `/v1/description-category/attribute/values`
→ `/v5/product/info/prices`
→ stock/warehouse families.

This is a **research dependency chain, not an automatic execution chain**.

Confirmed join evidence:

- `/v3/product/list.result.items.sku` ↔ `/v3/product/info/list.items.sku`.

Confirmed current fragments include:

- product-info `items.promotions`, `items.showcases_visibility`, `items.is_kgt`;
- `items.images360` removed from `/v3/product/info/list`;
- `items.photo_360` removed from `/v2/product/pictures/info`;
- `/v5/product/info/prices` current `marketing_actions` context;
- old `price.marketing_price` removed from current documentation.

Still **not proven on the current read contract** and therefore not promised by the future master:

- complete seller offer/article mapping;
- complete product/listing ids across all selected methods;
- title/name field on current v3 product-info contract;
- barcodes on current v3 contract;
- dimensions/weight;
- current placement of `description_category_id` / `type_id` in v4 attributes;
- video/rich-content coverage;
- complete moderation/error state.

Category/attribute dictionaries are dynamic evidence. Ozon announced automated mechanisms for critical category/attribute changes in 2026; exact feed contract is still pending. Product master must therefore preserve source/snapshot freshness rather than treating dictionaries as permanent static truth.

## Warehouses / logistics / geography

Current warehouse families include:

- `/v2/warehouse/list` — current replacement; old v1 disabled;
- `/v1/warehouse/ozon/list`;
- `/v1/warehouse/fbo/seller/list`;
- `/v2/cluster/list`;
- warehouse-level stock families.

Confirmed `/v2/warehouse/list` pagination fragments:

- request `limit`, `cursor`;
- response `cursor`, `has_next`.

Current logistics families additionally include:

- `/v1/seller/ozon-logistics/info` — seller connection to Ozon Logistics;
- `/v2/delivery-method/list` — current delivery-method family for warehouse logistics;
- `/v2/carriage/delivery/list` — current delivery/carriage family, with request `filter.delivery_method_id` fragment;
- `/v1/analytics/average-delivery-time`, `/details`, `/summary` — current analytics family for delivery-time diagnostics.

Correct diagnostic dependency is broader than `stock > 0`:

`seller logistics connection`
→ `warehouse`
→ `SKU stock by warehouse`
→ `delivery method`
→ `carriage/shipment availability`
→ `cluster/geography`
→ `delivery-time evidence`
→ `posting/order outcome`.

Full contracts/scheme coverage remain pending.

## Orders / returns / cancellations

Future posting targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Do not target v3 FBS list/unfulfilled: shutdown scheduled 2026-08-31.

Returns/cancellation evidence includes:

- `/v1/returns/list`;
- `/v2/returns/rfbs/list`;
- `/v2/report/returns/create`;
- cancel-reason/status families;
- `/v2/conditional-cancellation/list` for rFBS conditional cancellation applications.

Write siblings `/approve` and `/reject` are outside initial scope.

## Finance / realization / reports

Do not design future code around:

- `/v3/finance/transaction/list`;
- `/v3/finance/transaction/totals`.

They are scheduled for shutdown **2026-09-08**.

Future finance target family:

- `/v1/finance/accrual/postings`;
- `/v1/finance/accrual/types`;
- `/v1/finance/accrual/by-day`.

Current contract fragments for `by-day` include request `date`, `last_id` and response `last_id`, `accruals.container_fees`, `accruals.accrued_category`.

Current report/realization families include `/v1/finance/realization/posting`, `/v1/report/realization/posting/create`, `/v1/report/info`, `/v1/report/list`, `/v1/report/postings/create`, `/v2/report/returns/create`.

Generated reports are explicit create → later status/info/list → explicit retrieval operations. Hidden polling/fan-out is forbidden.

## Operational constraints already established

- Seller API key lifetime under the 2026 policy: **6 months**; `/v1/roles` exposes `expires_at`;
- last explicit Ozon notification general rate evidence: **50 requests/s across all methods per Client ID**; revalidate before coding rather than hardcoding permanently;
- unified product-operation limit model exists from 2026-02-24;
- `/v4/product/info/limit` exposes `operation_limits`; canonical locator `ProductAPI_GetUploadQuota`; numeric bucket/reset semantics remain pending;
- `/v1/product/prices/details` requires `skus`;
- `/v2/report/returns/create` requires `filter`;
- `/v1/report/postings/create` requires `filter.processed_at_from` and `filter.processed_at_to`;
- `/v1/report/info` / `/v1/report/list` expose report expiry fields;
- `/v1/analytics/stocks` is scheduled to switch to real-time on **2026-08-17** and must be revalidated after that date.

No unknown quota/page-size value is guessed.

## Performance API — primary separate blocker

Ozon-owned sources confirm Performance API as a separate public advertising API. Official root:

`https://docs.ozon.ru/api/performance/`

The current runtime receives a redirect loop from that documentation surface. Therefore candidate host/auth/statistics paths from third-party indexes remain **discovery only** and are not promoted to the allowlist.

Still missing Ozon-owned contracts for:

- host/auth/token lifecycle;
- campaign list/status/type;
- campaign→product mapping;
- impressions/clicks/spend;
- CTR/CPC/CPM;
- attributed orders/revenue;
- useful dimensions;
- read-only budget/bid context;
- report/rate/history/access restrictions.

## Coding gate

Current path/family evidence is not an implementation-ready contract.

Before `03A.4` every selected operation still needs current Ozon-owned verification of HTTP verb, complete request/response, pagination/history, rate/quota, access restrictions, side-effect classification and a final deprecation scan.

Rules:

- public API only; no cabinet/site scraping fallback;
- no arbitrary URL transport;
- initial provider read-only;
- no deprecated targets;
- no endpoint promotion from third-party sources;
- no automatic unbounded pagination;
- no hidden retries/fan-out;
- generated reports use separate explicit operations;
- `03A.4` cannot start while `OZON_03A3_COMPLETENESS_V1.json` has `extension_development_allowed=false`.

## Current roadmap disposition

- `03A.3 — Полный официальный API-аудит Ozon` = **[~] IN PROGRESS**;
- `03A.4 — Разработать Ozon LLM browser extension` = **[ ] NOT STARTED**.
