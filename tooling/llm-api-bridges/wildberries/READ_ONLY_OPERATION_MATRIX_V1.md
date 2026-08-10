# Wildberries Bridge — read-only operation matrix v1

Дата: 2026-08-10
Статус: implementation allowlist matrix; official methods audited, real-account smoke still required.

Canonical protocol: `../shared/LLM_API_BRIDGE_PROTOCOL.md`.

Hard invariant:

> **Одна accepted `WB_API_V1` команда = максимум один внешний WB HTTP request.**

Никакого скрытого page loop, retry, polling или fan-out. Если ответ содержит cursor/offset/next token, следующий page — это следующая явная команда LLM/Autorun.

Authorization по current correction note: `Authorization: Bearer <token>`; token добавляет только worker/provider layer.

## Read-only aliases

| Operation alias | HTTP | Fixed official endpoint | Credential category | Ключевые ограничения / роль |
|---|---|---|---|---|
| `seller_info` | GET | `https://common-api.wildberries.ru/api/v1/seller-info` | any category | seller/account identity; 1/min in current docs |
| `jam_subscription` | GET | `https://common-api.wildberries.ru/api/common/v1/subscriptions` | Service token, any category | Jam entitlement for restricted analytics |
| `cards_list` | POST | `https://content-api.wildberries.ru/content/v2/get/cards/list` | Content or Promotion | one cursor page; next cursor returned to LLM |
| `cards_trash` | POST | `https://content-api.wildberries.ru/content/v2/get/cards/trash` | Content/Promotion | one trash page |
| `prices_list` | GET | `https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter` | Prices and Discounts | one offset page; `limit<=1000`; category 10 req/6s |
| `sales_funnel_products` | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products` | Analytics | current vs past period; max current history 365d |
| `sales_funnel_history` | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products/history` | Analytics | direct daily/weekly endpoint max last week |
| `search_report` | POST | `https://seller-analytics-api.wildberries.ru/api/v2/search-report/report` | Analytics + Jam | search visibility/positions/card transitions; one report page/group request |
| `search_product_orders` | POST | `https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/orders` | Analytics + Jam | product search-text positions/orders; max 7-day period in current docs |
| `warehouse_inventory` | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v1/stocks-report/wb-warehouses` | Analytics | current method; 30-min refresh; one offset page; <=250k rows; 1/20s |
| `stock_report_products` | POST | `https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/products/products` | Analytics | one inventory report request; 3/min, interval 20s |
| `orders_since` | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/orders` | Statistics | preliminary operational orders; 90-day guaranteed retention; next `dateFrom` from lastChangeDate |
| `sales_since` | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/sales` | Statistics | preliminary sale/return stream; 90-day guaranteed retention |
| `returns_period` | GET | `https://seller-analytics-api.wildberries.ru/api/v1/analytics/goods-return` | Analytics | max 31 days/request; return reason/status/product linkage |
| `promotion_campaigns` | GET | `https://advert-api.wildberries.ru/adv/v1/promotion/count` | Promotion | campaign IDs grouped by type/status; 5/sec |
| `promotion_campaign_info` | GET | `https://advert-api.wildberries.ru/api/advert/v2/adverts` | Promotion | up to 50 campaign IDs/request |
| `promotion_fullstats` | GET | `https://advert-api.wildberries.ru/adv/v3/fullstats` | Promotion | one official period/id request; no hidden split |
| `promotion_search_clusters` | POST | `https://advert-api.wildberries.ru/adv/v0/normquery/list` | Promotion | active/inactive clusters >=100 views; <=100 advert/product pairs |
| `promotion_search_cluster_stats` | POST | `https://advert-api.wildberries.ru/adv/v0/normquery/stats` | Promotion | one period request; 10/min, interval 6s |
| `promotion_search_cluster_stats_daily` | POST | `https://advert-api.wildberries.ru/adv/v1/normquery/stats` | Promotion | daily cluster stats; CPC support has documented metric gaps |
| `promotions_calendar` | GET | `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions` | Prices and Discounts | current corrected host/category |
| `promotions_details` | GET | `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/details` | Prices and Discounts | current corrected host/category |
| `finance_sales_reports_list` | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/list` | Finance | current realization report list |
| `finance_sales_report_detail` | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed/{reportId}` | Finance | `reportId` decimal int64 only; 1/min; data from 2025-01-01 where available |
| `finance_sales_period_detail` | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed` | Finance | period detail; current docs say data from 2024-01-29; 1/min |
| `feedbacks_list` | GET | `https://feedbacks-api.wildberries.ru/api/v1/feedbacks` | Feedbacks and Questions | one pagination request; category 3/sec; `orderStatus` useful for buyout/return diagnosis |
| `questions_list` | GET | `https://feedbacks-api.wildberries.ru/api/v1/questions` | Feedbacks and Questions | one pagination request; take+skip <=10000 |
| `seller_rating` | GET | `https://feedbacks-api.wildberries.ru/api/common/v1/rating` | Service token, Feedbacks and Questions | seller rating + feedback count |

## Explicitly excluded legacy endpoints

- `GET https://statistics-api.wildberries.ru/api/v1/supplier/stocks` — WB announced replacement with `POST /api/analytics/v1/stocks-report/wb-warehouses` and shutdown 2026-06-23.
- `GET /api/v5/supplier/reportDetailByPeriod` — current Finance v1 methods replace it; WB announced shutdown 2026-07-15.

На текущую дату 2026-08-10 новый bridge эти aliases не содержит.

## Pagination / continuation contract

Examples:

- `cards_list` page 1 → result contains exact WB cursor → LLM emits page 2 command.
- `prices_list` offset 0 → result metadata exposes next offset → LLM emits next command.
- `warehouse_inventory` offset page → next explicit command if more rows exist.
- `orders_since` / `sales_since` → next command uses exact `lastChangeDate` continuation semantics from provider result.

Result must never mark `complete=true` merely because the first page succeeded.

## Weekly sales-drop workflow

This is **not one API operation**. Autorun performs an observable sequence of primitive commands, for example:

1. `seller_info`;
2. pages of `cards_list` needed for complete catalog;
3. pages of `prices_list`;
4. `warehouse_inventory` pages;
5. `sales_funnel_products` for current/comparison periods;
6. Jam search operations if entitled;
7. `orders_since` / `sales_since` continuation requests;
8. `returns_period`;
9. `promotion_campaigns` → campaign info/stats/query clusters;
10. finance report/detail commands;
11. customer evidence commands where causally useful.

Each request/result stays independently visible. The LLM joins evidence by seller/product/nmId/chrtId/warehouse/campaign/order identifiers and tests hypotheses such as:

`regional stockout → lower availability/search/ad delivery → lower card traffic → lower orders`,

while separately checking price/promotion changes, conversion, cancellations/returns and finance.

## Real-account acceptance sequence

After owner inserts WB token(s) locally, without sending them to chat/GitHub:

1. `seller_info` verifies expected account;
2. `cards_list` real page + continuation until full ~70 product scope is proven;
3. `prices_list` mapping;
4. `warehouse_inventory` warehouse/region granularity;
5. funnel analytics;
6. operational order/sale linkage;
7. Promotion reads if category enabled;
8. Finance reads if category enabled;
9. feedback/questions if category enabled;
10. Jam-only operations if subscription exists, otherwise explicit entitlement-unavailable evidence.

No write endpoint is touched.
