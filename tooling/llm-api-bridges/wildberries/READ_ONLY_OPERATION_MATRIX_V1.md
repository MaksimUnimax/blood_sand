# Wildberries Bridge — read-only operation matrix v1

Дата: 2026-08-10
Статус: implementation allowlist draft; endpoints confirmed against current official WB API documentation/release notes, real-account smoke still required.

Command family: `WB_API_V1` → `WB_RESULT_V1`.

## Operation registry

| Operation | Type | HTTP | Official endpoint | Token category / access | Important bounds / freshness | Use |
|---|---|---|---|---|---|---|
| `seller_info` | single_request | GET | `https://common-api.wildberries.ru/api/v1/seller-info` | any category | 1/min, burst 10 | verify seller/account identity (`sid`, name, `tin`, trademark) |
| `jam_subscription` | single_request | GET | `https://common-api.wildberries.ru/api/common/v1/subscriptions` | Service token, any category | entitlement check | determine whether Jam-only analytics are available |
| `catalog_list` | collector | POST | `https://content-api.wildberries.ru/content/v2/get/cards/list` | Content or Promotion per current docs | cursor pagination, normally 100/page | full active product-card inventory |
| `catalog_trash` | collector | POST | `https://content-api.wildberries.ru/content/v2/get/cards/trash` | Content/Promotion per current docs | cursor pagination | deleted/trashed listing history |
| `prices_list` | collector | GET | `https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter` | Prices and Discounts | limit ≤1000; offset until empty; category 10 req/6s | prices/discounts by product/size |
| `sales_funnel_period` | collector | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products` | Analytics | max last 365 days; hourly updates | compare product funnel current vs past period |
| `sales_funnel_history` | collector | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products/history` | Analytics | max last week via direct endpoint; hourly | day/week SKU funnel |
| `search_report` | collector | POST | `https://seller-analytics-api.wildberries.ru/api/v2/search-report/report` | Analytics + Jam | report/group pagination | search visibility, positions, card transitions |
| `search_product_orders` | collector | POST | `https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/orders` | Analytics + Jam | max 7-day period; one nmId; search text bounds | query → position → orders evidence |
| `warehouse_inventory` | collector | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v1/stocks-report/wb-warehouses` | Analytics, Personal/Service | 30-min data; ≤250k rows/page; offset; nmIds/chrtIds ≤1000; 1/20s | current stock by size, WB warehouse and shipping region |
| `stock_report_products` | collector | POST | `https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/products/products` | Analytics | 3/min, interval 20s | inventory analytics by product |
| `orders_since` | collector | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/orders` | Statistics | preliminary; 30-min update; ≤90-day guaranteed history; ~80k response continuation via lastChangeDate | operational orders |
| `sales_since` | collector | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/sales` | Statistics | preliminary; 30-min; ≤90-day guaranteed history; continuation via lastChangeDate | sales/returns operational flow |
| `returns_period` | collector | GET | `https://seller-analytics-api.wildberries.ru/api/v1/analytics/goods-return` | Analytics | ≤31 days/request; 1/min | return reasons/status/product linkage |
| `promotion_campaigns` | single_request | GET | `https://advert-api.wildberries.ru/adv/v1/promotion/count` | Promotion | 5/sec, interval 200ms, burst 5 | all campaign IDs grouped by type/status |
| `promotion_campaign_info` | collector | GET | `https://advert-api.wildberries.ru/api/advert/v2/adverts` | Promotion | up to 50 campaign IDs | campaign status/payment/product membership |
| `promotion_fullstats` | collector | GET | `https://advert-api.wildberries.ru/adv/v3/fullstats` | Promotion | campaign/period limits must be validated in parser from current docs before implementation | aggregate/daily campaign stats |
| `promotion_search_clusters` | collector | POST | `https://advert-api.wildberries.ru/adv/v0/normquery/list` | Promotion | ≤100 advert/product items; 5/sec, burst 10 | active/inactive query clusters ≥100 views |
| `promotion_search_cluster_stats` | collector | POST | `https://advert-api.wildberries.ru/adv/v0/normquery/stats` | Promotion | ≤100 items; 10/min, interval 6s, burst 20 | period cluster stats |
| `promotion_search_cluster_stats_daily` | collector | POST | `https://advert-api.wildberries.ru/adv/v1/normquery/stats` | Promotion | current docs/release notes; CPC has unavailable views/CTR/CPM | daily cluster/ad/product metrics |
| `finance_sales_reports_list` | collector | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/list` | Finance | current v1 report API | report registry for reconciliation |
| `finance_sales_report_detail` | collector | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed/{reportId}` | Finance | data since 2025-01-01; 1/min; availability may depend on registration country | detailed realization by report |
| `finance_sales_period_detail` | collector | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed` | Finance | data from 2024-01-29; 1/min; selectable fields | authoritative period-level monetary reconciliation |
| `feedbacks_list` | collector | GET | `https://feedbacks-api.wildberries.ru/api/v1/feedbacks` | Feedbacks and Questions | 3/sec category limit; pagination/filter | reviews, orderStatus, product/customer evidence |
| `questions_list` | collector | GET | `https://feedbacks-api.wildberries.ru/api/v1/questions` | Feedbacks and Questions | take+skip ≤10k; 3/sec category limit | questions/objections/FAQ evidence |
| `seller_rating` | single_request | GET | `https://feedbacks-api.wildberries.ru/api/common/v1/rating` | Service token, Feedbacks and Questions | 1/min per current seller-info docs | seller rating + feedback count baseline |

## Explicitly excluded legacy/deprecated methods

### `GET https://statistics-api.wildberries.ru/api/v1/supplier/stocks`

Do not implement. WB announced replacement with `POST /api/analytics/v1/stocks-report/wb-warehouses` and shutdown on 2026-06-23.

### `GET /api/v5/supplier/reportDetailByPeriod`

Do not implement. WB introduced current Finance v1 realization methods and announced legacy shutdown on 2026-07-15.

## Collector rules per operation

### Catalog

`catalog_list` continues official cursor pagination until response proves exhaustion. It returns:

- all page traces;
- count of cards;
- cursor history;
- `complete=true` only after exhaustion.

Do not merge `catalog_trash` into active catalog silently; store status/source explicitly.

### Prices

`prices_list` uses `limit=1000` maximum and monotonically advances offset. Empty data marks exhaustion. Product/size rows remain separate observations.

### Warehouse inventory

`warehouse_inventory` uses official offset pagination. One row remains keyed by at least `nmId/chrtId + warehouseId`; never sum regions into a single stock number before raw/normalized storage.

### Statistics orders/sales

Continuation is based on the exact `lastChangeDate` from the final returned row. Because the methods are change streams and preliminary, dedupe must use stable row/order identifiers such as `srid` plus event semantics, not just timestamps.

### Promotion

Campaign list and campaign info are separate. A weekly diagnostic should first discover all campaign IDs/states, then collect stats for relevant campaigns/products. Search cluster data must preserve `advertId + nmId + query/cluster + date` dimensions.

### Finance

Finance endpoints are slow (notably 1/min for detail methods). Collector must queue before unsent requests to respect intervals; no 429 retry-loop. Exact finance rows are not replaced by operational `sales` estimates.

## Proposed command examples — protocol shape only

These are design examples, **not executable commands in this document**.

`seller_info`:

- operation: seller_info
- no caller-supplied URL/headers/token

`catalog_list`:

- operation: catalog_list
- collect_all: true
- optional card filters constrained by provider parser

`warehouse_inventory`:

- operation: warehouse_inventory
- optional nm_ids
- collect_all_pages: true

`weekly_diagnostic_bundle` is intentionally **not** a provider operation. It is an LLM workflow that issues several governed operations so each API evidence layer remains visible and attributable.

## Minimum real-account acceptance

With owner WB token(s), smoke in this order:

1. `seller_info` — verify expected account.
2. `catalog_list` — collect all ~70 listings and verify pagination/count.
3. `prices_list` — map price rows to catalog.
4. `warehouse_inventory` — prove warehouse/region stock granularity.
5. `sales_funnel_period` — compare last 7 days to previous 7.
6. `orders_since` + `sales_since` — prove operational event linkage.
7. `promotion_campaigns` + representative stats — prove ads linkage.
8. `finance_sales_period_detail` — prove monetary reconciliation.
9. `feedbacks_list` / `questions_list` — prove product customer-evidence linkage.
10. Jam-only search methods if subscription indicates access; otherwise record entitlement gap rather than failure.

No write endpoint is touched during acceptance.
