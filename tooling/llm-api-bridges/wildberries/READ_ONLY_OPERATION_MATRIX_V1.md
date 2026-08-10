# Wildberries API — read-only research capability matrix v1

Дата: 2026-08-10  
Статус: **RESEARCH / INPUT FOR FUTURE EXTENSION DESIGN**

Этот документ НЕ является implementation allowlist и не доказывает существование Wildberries extension. Он фиксирует исследованные официальные read-capabilities, которые могут быть использованы при будущем проектировании 03A.6 после повторной сверки официальной документации на дату coding.

При конфликте с более ранним audit приоритет имеет `WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md` и актуальная официальная документация WB API.

## Current read capabilities

| Research capability | HTTP | Current official endpoint | Token category / access | Что получаем / ограничения |
|---|---|---|---|---|
| Seller identity | GET | `https://common-api.wildberries.ru/api/v1/seller-info` | suitable authorized token | seller/account identity; использовать для проверки кабинета при будущем real-account acceptance |
| Subscription/Jam entitlement | GET | `https://common-api.wildberries.ru/api/common/v1/subscriptions` | зависит от token type/current docs | наличие подписок, влияющих на analytics capabilities |
| Product cards | POST | `https://content-api.wildberries.ru/content/v2/get/cards/list` | Content | карточки продавца; cursor pagination; при >100 карточках нужны последовательные pages |
| Product cards in trash | POST | `https://content-api.wildberries.ru/content/v2/get/cards/trash` | Content | карточки из корзины/удалённого набора читаются отдельно |
| Prices and discounts | GET | `https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter` | Prices and Discounts | `nmID`, `vendorCode`, sizes, price, discountedPrice, clubDiscountedPrice, currency, discounts и др.; `limit<=1000` + offset pagination |
| Seller warehouses | GET | `https://marketplace-api.wildberries.ru/api/v3/warehouses` | Marketplace | список складов продавца |
| Seller/FBS inventory | POST | `https://marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}` | Marketplace | текущие остатки на конкретном складе продавца; current limit class до 300 req/min, interval 200 ms, burst 20 для соответствующей группы методов |
| WB warehouse remains report | GET task flow | `https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains` + `/tasks/{task_id}/status` + `/download` | Analytics | current async flow для отчёта по остаткам на складах WB; собственные snapshots нужны для полноценной истории остатков |
| Sales funnel products | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products` | Analytics | funnel/product performance за выбранный период и comparison data согласно current schema |
| Sales funnel history | POST | `https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products/history` | Analytics | daily/weekly history; direct history ограничена коротким периодом, для длинных периодов используется generated report flow |
| Generated seller analytics | API task/download flow | `https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads` family | Analytics / возможны Jam restrictions | CSV/generated reports для более длинных периодов; отдельные limits/storage/entitlement rules |
| Search analytics/report | POST | `https://seller-analytics-api.wildberries.ru/api/v2/search-report/...` current family | Analytics; часть возможностей может требовать Jam | поисковая видимость, позиции/переходы/заказы по current official schema; перед coding exact methods повторно сверить |
| FBS new orders | GET | `https://marketplace-api.wildberries.ru/api/v3/orders/new` | Marketplace | новые FBS orders |
| FBS orders | GET | `https://marketplace-api.wildberries.ru/api/v3/orders` | Marketplace | FBS order history; один запрос максимум за 30 календарных дней + pagination |
| FBS order statuses | POST | `https://marketplace-api.wildberries.ru/api/v3/orders/status` | Marketplace | read status lookup for provided order identifiers; будущий bridge должен использовать только read semantics |
| Goods returns analytics | GET | `https://seller-analytics-api.wildberries.ru/api/v1/analytics/goods-return` current family | Analytics | возвраты/причины/товарная связь согласно current schema; exact limits перед coding повторно проверить |
| Finance report list | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/list` | Finance | current realization/sales reports list |
| Finance period detail | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed` | Finance | detailed report by period; official docs indicate data from 2024-01-29 |
| Finance report-ID detail | POST | `https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed/{reportId}` | Finance | detailed report by report ID; decimal int64 ID; official docs indicate data from 2025-01-01 where available |
| Acquiring report list | POST | `https://finance-api.wildberries.ru/api/finance/v1/acquiring/list` | Finance; account/country restrictions possible | acquiring expense report list |
| Acquiring details | POST | `https://finance-api.wildberries.ru/api/finance/v1/acquiring/detailed` and `/{reportId}` | Finance; account/country restrictions possible | acquiring expense detail |
| Promotion campaign groups | GET | `https://advert-api.wildberries.ru/adv/v1/promotion/count` | Promotion | campaign IDs grouped by current type/status semantics |
| Promotion campaign information | GET | `https://advert-api.wildberries.ru/api/advert/v2/adverts` | Promotion | campaign/product configuration information for requested campaigns |
| Promotion search-cluster stats | POST | `https://advert-api.wildberries.ru/adv/v0/normquery/stats` | Promotion | search-cluster statistics; exact metric/period contract must be revalidated before coding |
| Promotion calendar | GET | `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions` | Prices and Discounts | calendar of promotions |
| Promotion details | GET | `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/details` | Prices and Discounts | promotion details |
| Promotion nomenclatures | GET | `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/nomenclatures` | Prices and Discounts | products/nomenclatures participating or eligible according to current schema |
| Feedbacks | GET | `https://feedbacks-api.wildberries.ru/api/v1/feedbacks` | Feedbacks and Questions | reviews/feedbacks; useful for product-content and quality diagnostics |
| Questions | GET | `https://feedbacks-api.wildberries.ru/api/v1/questions` | Feedbacks and Questions | buyer questions; pagination/current limits must be respected |
| Seller rating | GET | `https://feedbacks-api.wildberries.ru/api/common/v1/rating` | Feedbacks and Questions / token-type restrictions possible | seller rating and related aggregate data |

## Explicitly deprecated / not a basis for future design

- `GET https://statistics-api.wildberries.ru/api/v1/supplier/stocks` — deprecated; current research uses warehouse-remains Analytics flow instead.
- `GET https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod` — announced for shutdown 2026-07-15; current finance foundation is `finance-api.wildberries.ru/api/finance/v1/sales-reports/...`.

## Authorization research

Current official auth uses:

`Authorization: Bearer <token>`

For Service/Basic token flows current documentation can additionally require `X-Client-Secret`; Personal tokens must be treated separately. Exact token type/category mapping must be checked against the seller's real credentials during future 03A.7 acceptance.

## Pagination / multi-request implications for future design

Many business questions cannot be answered by one marketplace request. Examples:

- cards: cursor pages;
- prices: offset pages;
- FBS orders: pagination and max 30-day request window;
- warehouse-remains and generated analytics: asynchronous create/status/download flows;
- campaign/statistics collections: separate campaign-list and statistics calls;
- finance: report list and detail calls.

Future extension must expose these requests transparently to the LLM. No hidden unbounded retry/fan-out/pagination should be introduced merely to make a workflow look like one call.

## What this matrix enables later

After 03A.6 and real-account acceptance, these capabilities should allow evidence collection for:

`assortment → listing/card state → price/promo → warehouses/stocks → search/funnel → orders → returns → advertising → finance → feedback/questions`.

That is enough to support the project's intended causal diagnostics, including cases such as a flagship SKU becoming unavailable on a warehouse/region and subsequent changes in traffic, advertising delivery and orders.

## Research gate before 03A.6

Before any WB extension code is written:

1. Re-open official category Swagger/release notes on the coding date.
2. Confirm each endpoint that will actually be used, its token category/type, request/response schema, pagination, rate limits and history window.
3. Remove any endpoint newly deprecated by WB.
4. Freeze a separate reviewed implementation allowlist only then.

**Wildberries extension does not exist yet. This file is research input only.**
