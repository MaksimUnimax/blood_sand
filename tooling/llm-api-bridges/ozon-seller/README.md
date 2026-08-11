# Ozon Seller / Performance API research

Статус: **03A.3 API research in progress. Ozon browser extension does not exist; development has not started.**

Эта директория содержит только research/provenance artifacts для будущего read-only LLM↔Ozon bridge.

## Current authority order

При конфликте старых и новых snapshots использовать:

1. `OZON_03A3_COMPLETENESS_V1.json` — текущий machine-readable gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — current candidate registry + deprecated/do-not-use paths;
3. `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` — общая per-operation очередь contract gaps;
4. `OZON_PRODUCT_MASTER_CONTRACT_QUEUE_V1.json` — P0 contract queue для Product/SKU/Listing/Category master;
5. `OZON_LOGISTICS_CONTRACT_QUEUE_V1.json` — current logistics/restriction/error diagnostics contract queue;
6. `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md` — correction: Average Delivery Time family retired;
7. `OZON_DELIVERY_DIAGNOSTICS_ALTERNATIVES_2026-08-11.md` — current FBS/rFBS error-index, delivery-restriction and posting-promise alternatives;
8. `OZON_PRODUCT_MASTER_JOIN_EVIDENCE_V1.json` — доказанные cross-method identifiers/fields;
9. `OZON_PRODUCT_MASTER_COVERAGE_2026-08-11.md` — product master read-chain coverage;
10. `OZON_CATEGORY_ATTRIBUTE_FRESHNESS_2026-08-11.md` — dynamic category/attribute freshness requirement;
11. `OZON_LOGISTICS_GEOGRAPHY_COVERAGE_2026-08-11.md` — logistics/geography diagnostic coverage;
12. `OZON_CONTRACT_FRAGMENT_REGISTRY_2026-08-11.json` — Ozon-owned pagination/expiry/rate/field fragments;
13. `OZON_CANONICAL_OPERATION_LOCATORS_2026-08-11.json` — exact official `#operation` locators only where observed;
14. `OZON_OPERATIONAL_CONSTRAINTS_2026-08-11.md` — key lifetime, rate/product-operation limits, reports/pagination;
15. `OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md` — currentness/deprecation evidence;
16. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` — Performance API blocker;
17. `OZON_PERFORMANCE_DISCOVERY_QUEUE_V1.json` — discovery-only probes;
18. base audits/revalidation files.

`OZON_NEGATIVE_VERIFICATION_2026-08-11.md` is historical / partially superseded and is not current status authority for families later confirmed by Ozon changelog evidence.

## Product Master

Current/canonical research chain:

`/v3/product/list`
→ `/v3/product/info/list`
→ `/v4/product/info/attributes`
→ `/v2/product/pictures/info`
→ description-category dictionary chain
→ `/v5/product/info/prices`
→ stock/warehouse layers.

Confirmed SKU join:

- `/v3/product/list.result.items.sku` ↔ `/v3/product/info/list.items.sku`.

Still not proven on current full contracts:

- complete seller offer/article mapping;
- title/name;
- barcodes on current v3 bulk info;
- dimensions/weight;
- current `description_category_id` / `type_id` placement in v4 attributes;
- video/rich-content;
- complete moderation/error state.

Category/attribute dictionaries are dynamic evidence and must preserve snapshot freshness.

## Warehouses / logistics / geography

Current configuration families:

- `/v2/warehouse/list`;
- `/v1/warehouse/ozon/list`;
- `/v1/warehouse/fbo/seller/list`;
- `/v2/cluster/list`;
- warehouse-level stock families;
- `/v1/seller/ozon-logistics/info`;
- `/v2/delivery-method/list`;
- `/v2/carriage/delivery/list`.

Warehouse v2 pagination fragments: request `limit`, `cursor`; response `cursor`, `has_next`.

### Average Delivery Time — retired

A later Ozon-owned 2026 announcement supersedes the March description refresh: the **Average Delivery Time functionality was fully disabled and its methods removed from documentation**.

Do not target:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`.

One-to-one replacement is not confirmed.

### Current delivery diagnostics alternatives

Current main families identified by Ozon:

- `/v1/rating/index/fbs/info` — FBS/rFBS error-index information;
- `/v1/rating/index/fbs/posting/list` — posting-level FBS/rFBS error-index evidence;
- `/v1/warehouse/invalid-products/get` — products with FBS delivery restrictions;
- `/v1/warehouse/warehouses-with-invalid-products` — warehouses containing such products.

All four were moved from beta to main on 2026-02-02. Full contracts remain pending.

Current `/v3/posting/fbs/get` has documented response fragments:

- `result.analytics_data.client_delivery_date_begin`;
- `result.analytics_data.client_delivery_date_end`.

These are posting-level promised-delivery fields, **not** a replacement aggregate Average Delivery Time metric.

Correct current diagnostic chain:

`logistics connection → warehouse → stock → delivery method → delivery restrictions → FBS/rFBS error index → carriage/shipment → cluster/geography → posting promise → posting/order outcome`.

No hidden automatic fan-out is authorized.

## Orders / returns / cancellations

Future posting targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Do not target v3 FBS list/unfulfilled: shutdown scheduled 2026-08-31.

Returns/cancellation evidence includes general/rFBS return families, generated returns report, cancel-reason/status families and `/v2/conditional-cancellation/list`. Mutation siblings remain outside initial scope.

## Finance / realization / reports

Do not design future code around `/v3/finance/transaction/list` or `/v3/finance/transaction/totals`; shutdown is scheduled for **2026-09-08**.

Future finance target:

- `/v1/finance/accrual/postings`;
- `/v1/finance/accrual/types`;
- `/v1/finance/accrual/by-day`.

Current `by-day` fragments include request `date`, `last_id`; response `last_id`, `accruals.container_fees`, `accruals.accrued_category`, `accruals.accrual_id`.

Correction: `accruals.type_id` was renamed to `accruals.accrual_id` on 2026-06-09.

Generated reports remain explicit create → status/info/list → explicit retrieval operations. Hidden polling/fan-out is forbidden.

## Operational constraints

- Seller API key lifetime under the 2026 policy: **6 months**; `/v1/roles` exposes `expires_at`;
- last explicit Ozon notification general-rate evidence: **50 requests/s across all methods per Client ID**; revalidate before coding;
- unified product-operation limit model exists;
- `/v4/product/info/limit` exposes `operation_limits`; numeric bucket/reset semantics remain pending;
- `/v1/product/prices/details` requires `skus`;
- generated report expiry is exposed;
- `/v1/analytics/stocks` is announced to switch to real-time on **2026-08-17** and cannot be post-transition revalidated yet on 2026-08-11.

No unknown quota/page-size value is guessed.

## Performance API — primary separate blocker

Ozon-owned sources confirm Performance API as a separate public advertising API; 2026 public-API migration material still includes it. Official root:

`https://docs.ozon.ru/api/performance/`

The current runtime receives a redirect loop. Candidate host/auth/statistics paths from third-party indexes remain discovery-only and are not promoted.

Still missing Ozon-owned contracts for host/auth/token lifecycle, campaign inventory/product mapping, advertising statistics/metrics/dimensions, read-only budget/bid context and report/rate/history/access restrictions.

## Coding gate

Current path/family evidence is not an implementation-ready contract.

Before `03A.4` every selected operation still needs current Ozon-owned verification of HTTP verb, complete request/response, pagination/history, rate/quota, access restrictions, side-effect classification and final deprecation status.

Rules:

- public API only; no cabinet/site scraping fallback;
- no arbitrary URL transport;
- initial provider read-only;
- no deprecated/retired targets;
- no endpoint promotion from third-party sources;
- no automatic unbounded pagination;
- no hidden retries/fan-out;
- generated reports use separate explicit operations;
- `03A.4` cannot start while `OZON_03A3_COMPLETENESS_V1.json` has `extension_development_allowed=false`.

## Current roadmap disposition

- `03A.3 — Полный официальный API-аудит Ozon` = **[~] IN PROGRESS**;
- `03A.4 — Разработать Ozon LLM browser extension` = **[ ] NOT STARTED**.
