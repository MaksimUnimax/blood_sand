# Ozon Seller / Performance API research

Статус: **03A.3 API research in progress. Ozon browser extension does not exist; development has not started.**

Эта директория содержит только research/provenance artifacts для будущего read-only LLM↔Ozon bridge.

## Current authority order

При конфликте старых и новых snapshots использовать:

1. `OZON_03A3_COMPLETENESS_V1.json` — текущий machine-readable gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — current candidate registry + deprecated/do-not-use paths;
3. `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` — общая per-operation очередь contract gaps;
4. `OZON_PRODUCT_MASTER_CONTRACT_QUEUE_V1.json` — P0 contract queue для Product/SKU/Listing/Category master;
5. `OZON_LOGISTICS_CONTRACT_QUEUE_V1.json` — current warehouse → delivery method → carriage contract queue;
6. `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md` — current correction: Average Delivery Time analytics family fully retired, do not target;
7. `OZON_PRODUCT_MASTER_JOIN_EVIDENCE_V1.json` — доказанные cross-method identifiers/fields;
8. `OZON_PRODUCT_MASTER_COVERAGE_2026-08-11.md` — product master read-chain coverage;
9. `OZON_CATEGORY_ATTRIBUTE_FRESHNESS_2026-08-11.md` — dynamic category/attribute freshness requirement;
10. `OZON_LOGISTICS_GEOGRAPHY_COVERAGE_2026-08-11.md` — logistics/geography diagnostic coverage;
11. `OZON_CONTRACT_FRAGMENT_REGISTRY_2026-08-11.json` — Ozon-owned pagination/expiry/rate/field fragments;
12. `OZON_CANONICAL_OPERATION_LOCATORS_2026-08-11.json` — exact official `#operation` locators only where actually observed;
13. `OZON_OPERATIONAL_CONSTRAINTS_2026-08-11.md` — key lifetime, rate/product-operation limits, reports/pagination;
14. `OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md` — currentness/deprecation evidence;
15. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` — Performance API blocker;
16. `OZON_PERFORMANCE_DISCOVERY_QUEUE_V1.json` — discovery-only probes, all unverified by Ozon contract until promoted explicitly;
17. base audits/revalidation files.

`OZON_NEGATIVE_VERIFICATION_2026-08-11.md` is historical / partially superseded and is not current status authority for families later confirmed by Ozon changelog evidence.

## Product Master — current research state

Current/canonical research chain:

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

Confirmed join:

- `/v3/product/list.result.items.sku` ↔ `/v3/product/info/list.items.sku`.

Confirmed fragments include product-info promotions/showcase visibility, current pictures lineage and current price `marketing_actions`. Removed legacy fields such as `images360`, `photo_360` and `price.marketing_price` must not be treated as current.

Still not proven on current contracts and therefore not promised by the future master:

- complete seller offer/article mapping;
- title/name on current v3 bulk-info contract;
- barcodes on current v3 contract;
- dimensions/weight;
- current `description_category_id` / `type_id` placement in v4 attributes;
- video/rich-content coverage;
- complete moderation/error state.

Category/attribute dictionaries are dynamic evidence; Product Master must preserve source/snapshot freshness.

## Warehouses / logistics / geography

Current warehouse/configuration families include:

- `/v2/warehouse/list`;
- `/v1/warehouse/ozon/list`;
- `/v1/warehouse/fbo/seller/list`;
- `/v2/cluster/list`;
- warehouse-level stock families;
- `/v1/seller/ozon-logistics/info`;
- `/v2/delivery-method/list`;
- `/v2/carriage/delivery/list`.

Confirmed `/v2/warehouse/list` pagination fragments:

- request `limit`, `cursor`;
- response `cursor`, `has_next`.

### Current correction: Average Delivery Time analytics retired

The earlier March-2026 description refresh for:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`

is superseded by a later Ozon-owned 2026 retirement announcement: the **Average Delivery Time functionality was fully disabled and its methods removed from documentation**.

Therefore all three are now **DO NOT TARGET**. No replacement read method is confirmed.

Correct current logistics dependency:

`seller logistics connection`
→ `warehouse`
→ `SKU stock by warehouse`
→ `delivery method`
→ `carriage/shipment availability`
→ `cluster/geography`
→ `posting/order outcome`.

If current posting or another Ozon-owned method exposes delivery-date/quality evidence, it must be verified separately before use; no replacement is inferred.

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

Future finance target family:

- `/v1/finance/accrual/postings`;
- `/v1/finance/accrual/types`;
- `/v1/finance/accrual/by-day`.

Current `by-day` fragments include request `date`, `last_id`; response `last_id`, `accruals.container_fees`, `accruals.accrued_category`, `accruals.accrual_id`.

Important correction: `accruals.type_id` was renamed to `accruals.accrual_id` on 2026-06-09. Do not model the old field name as current.

Generated reports remain explicit create → later status/info/list → explicit retrieval operations. Hidden polling/fan-out is forbidden.

## Operational constraints already established

- Seller API key lifetime under the 2026 policy: **6 months**; `/v1/roles` exposes `expires_at`;
- last explicit Ozon notification general-rate evidence: **50 requests/s across all methods per Client ID**; revalidate before coding rather than hardcoding permanently;
- unified product-operation limit model exists;
- `/v4/product/info/limit` exposes `operation_limits`; numeric bucket/reset semantics remain pending;
- `/v1/product/prices/details` requires `skus`;
- generated report expiry is exposed;
- `/v1/analytics/stocks` is announced to switch to real-time on **2026-08-17** and cannot be revalidated before that future date.

No unknown quota/page-size value is guessed.

## Performance API — primary separate blocker

Ozon-owned sources confirm Performance API as a separate public advertising API and 2026 public-API migration material still explicitly includes Performance API. Official root:

`https://docs.ozon.ru/api/performance/`

The current runtime receives a redirect loop from that documentation surface. Therefore candidate host/auth/statistics paths from third-party indexes remain **discovery only** and are not promoted to the allowlist.

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
