# Wildberries API capability audit — 2026-08-10

Статус: **OFFICIAL API AUDIT / READ-ONLY BASELINE**

Цель: зафиксировать текущий официальный Wildberries API surface, достаточный для полного импорта ассортимента, товарно-складской аналитики, диагностики продаж, рекламы, финансов и customer evidence.

## 1. Source-of-truth policy

Authority для этого документа:

- официальный developer portal `https://dev.wildberries.ru`;
- текущие OpenAPI-разделы;
- официальные release notes WB API.

Форум и сторонние SDK не являются authority для endpoint/schema. Методы, которые WB официально объявил deprecated/disabled, не включаются в новый production allowlist.

## 2. Auth / service boundaries

WB разделяет API на функциональные категории токена и отдельные hostnames. Для нашего read-only bridge нужны как минимум категории:

- Content;
- Analytics;
- Prices and Discounts;
- Statistics;
- Promotion;
- Feedbacks and Questions;
- Finance;
- при необходимости Marketplace для seller-warehouse/FBS facts.

Credentials хранятся только локально. Для v1 используем read-only access где это возможно и не включаем mutation endpoints.

Основные hostnames, которые понадобятся:

- `common-api.wildberries.ru`;
- `content-api.wildberries.ru`;
- `discounts-prices-api.wildberries.ru`;
- `seller-analytics-api.wildberries.ru`;
- `statistics-api.wildberries.ru`;
- `advert-api.wildberries.ru`;
- `feedbacks-api.wildberries.ru`;
- `finance-api.wildberries.ru`;
- `marketplace-api.wildberries.ru` — только если нужен отдельный seller-warehouse/FBS surface.

## 3. Seller identity

### GET `/api/v1/seller-info`
Host: `https://common-api.wildberries.ru`

Назначение:

- seller name;
- account ID (`sid`);
- INN (`tin`);
- trademark where present.

Метод доступен с токеном любой категории. Это обязательный первый smoke call: credentials должны быть привязаны к ожидаемому кабинету до сбора данных.

### GET `/api/common/v1/subscriptions`

Официально добавлен 2026-04-02. Возвращает состояние Jam subscription. Нужен потому, что часть расширенной Search Analytics доступна только с Jam.

## 4. Full product catalog / content passport

### POST `/content/v2/get/cards/list`
Host: `https://content-api.wildberries.ru`

Возвращает созданные карточки товаров. Поддерживает cursor pagination; для полного каталога продолжаем до конца, не обрезая на первых 100 карточках.

Использование:

- `nmID` / WB listing identity;
- seller vendor code/article;
- title;
- brand;
- subject/category relationship;
- dimensions/characteristics;
- sizes/variants;
- barcodes;
- media/images and other card facts exposed by response;
- timestamps/status facts exposed by current schema.

### POST `/content/v2/get/cards/trash`

Отдельно получает карточки в корзине/удалённом состоянии. Это важно: master не должен ошибочно считать исчезнувший listing никогда не существовавшим.

### Categories / subjects / characteristics

В Content API официально доступны справочники parent categories, subjects, characteristics и brands. Их используем для построения canonical Category/ProductFamily layer, а не только для копирования marketplace names.

## 5. Prices and discounts

### GET `/api/v2/list/goods/filter`
Host: `https://discounts-prices-api.wildberries.ru`

Полный список цен можно получать без article filter с `limit=1000` и `offset` pagination до пустого массива.

Официальный response surface включает product/size identifiers и price/discount data; используем для price snapshots и связки с карточками.

Текущий общий limit категории Prices and Discounts, указанный в официальной документации: 10 requests / 6 seconds, interval 600 ms, burst 5.

## 6. Sales funnel analytics

### POST `/api/analytics/v3/sales-funnel/products`
Host: `https://seller-analytics-api.wildberries.ru`
Token category: Analytics.

Метод сравнивает ключевые метрики товаров current period vs comparable past period. Данные обновляются примерно раз в час; основной поток orders/card transitions/add-to-cart обычно появляется в течение часа, часть данных может дозаполняться позже.

Максимальная глубина current report: последние 365 дней.

Ключевая роль: главный seller/SKU funnel для ответа «где именно просели продажи — спрос, карточка, корзина или заказ».

### POST `/api/analytics/v3/sales-funnel/products/history`

Daily/weekly product-card statistics. Прямой history endpoint ограничен максимум последней неделей; для более длинной детализации WB указывает использовать Seller Analytics CSV (`DETAIL_HISTORY_REPORT`).

### POST `/api/analytics/v3/sales-funnel/grouped/history`

Та же временная аналитика с grouping по subject/brand/tag; пригодна для product-family/category baseline.

## 7. Search analytics

### POST `/api/v2/search-report/report`
Host: `https://seller-analytics-api.wildberries.ru`
Token: Analytics.
Requirement: Jam subscription.

Даёт main search report, включая:

- general information;
- positions;
- visibility;
- transitions to product card;
- grouped table.

Это критично для SEO/marketplace-demand связи и диагностики падения organic marketplace discovery.

### POST `/api/v2/search-report/product/orders`

Orders and positions by product search texts; current official method accepts a period up to 7 days and a concrete `nmId`, plus searchTexts. Нужен для связывания query → product → order.

## 8. Current stock by WB warehouse/region

### POST `/api/analytics/v1/stocks-report/wb-warehouses`
Host: `https://seller-analytics-api.wildberries.ru`
Token: Analytics.

Это **текущий метод**, добавленный в 2026 и заменивший старый Statistics stocks endpoint.

Официальные свойства:

- data updated every 30 minutes;
- one row per product size per warehouse;
- up to 250,000 rows per response;
- offset pagination;
- filters by `nmIds` / `chrtIds` up to 1000;
- warehouse ID/name;
- shipping region (`regionName`);
- limit: 1 request / 20 seconds per account.

Критическая аналитическая роль: позволяет проверить гипотезу `flagship stockout in warehouse/region → lower availability → lower traffic/ad delivery/orders`.

### Запрещённый legacy path

`GET /api/v1/supplier/stocks` был официально помечен deprecated и должен был быть отключён 2026-06-23. На текущую дату 2026-08-10 новый bridge на него не строится.

## 9. Inventory analytics by products

### POST `/api/v2/stocks-report/products/products`
Host: `https://seller-analytics-api.wildberries.ru`
Token: Analytics.

Формирует dataset inventory by products и может работать без product filters для всего отчёта. Официальный limit: 3 requests/minute, interval 20 seconds, burst 3.

Использование: аналитический stock layer поверх текущего warehouse snapshot.

## 10. Operational orders and sales

### GET `/api/v1/supplier/orders`
Host: `https://statistics-api.wildberries.ru`
Token category: Statistics.

- data updated every 30 minutes;
- one row = one order/item;
- `srid` is order identity;
- storage guaranteed no more than 90 days;
- preliminary operational data;
- conditional ~80,000 row response size, continuation via `lastChangeDate` → next `dateFrom`.

### GET `/api/v1/supplier/sales`
Host: same.

- sale and return information;
- data updated every 30 minutes;
- one row = one sale/return item;
- 90-day guaranteed history;
- preliminary operational data;
- exact finance reconciliation should use realization reports instead;
- continuation via `lastChangeDate`.

Для недельной диагностики эти методы полезны как оперативный поток; финальную прибыль/комиссии берём из Finance.

## 11. Returns

### GET `/api/v1/analytics/goods-return`
Host: `https://seller-analytics-api.wildberries.ru`

Отчёт о возвратах товаров продавцу. Один request — максимум 31 day period. Response включает product/order linkage и reason/status facts (например `nmId`, `orderId`, `srid`, reason, returnType, status, subject, dates).

## 12. Promotion / advertising

Host: `https://advert-api.wildberries.ru`
Token: Promotion.

### GET `/adv/v1/promotion/count`

Списки всех рекламных кампаний продавца, grouped by type/status, IDs and last change time. Official limit: 5 req/sec, interval 200 ms, burst 5.

### GET `/api/advert/v2/adverts`

Campaign information by IDs/status/payment type; up to 50 IDs per request. Нужен для campaign → product association and active/paused/completed state.

### GET `/adv/v3/fullstats`

Current campaign statistics endpoint. Для collector design период и campaign IDs должны дробиться только по официальным bounds, а каждый underlying HTTP request отражаться в evidence.

### POST `/adv/v0/normquery/list`

Возвращает active/inactive search clusters with at least 100 views for campaign/product pairs. Official limit: 5 req/sec, interval 200 ms, burst 10.

### POST `/adv/v0/normquery/stats`

Search cluster statistics for requested period. Official limit: 10 req/min, interval 6 sec, burst 20.

### POST `/adv/v1/normquery/stats`

Daily/search-cluster statistics. Official 2026 release notes state that both v0/v1 normquery stats now support CPC campaigns too; for CPC, `views`, `ctr`, `cpm` are unavailable while the remaining metrics are provided.

Нужные dimensions/metrics для root-cause:

- campaign;
- product/nmId;
- search cluster/query;
- date;
- impressions where applicable;
- clicks;
- CTR where applicable;
- CPC/CPM where applicable;
- add-to-basket;
- orders/units;
- spend;
- average position;
- campaign status/product membership.

## 13. Finance — source of truth for monetary reconciliation

Host: `https://finance-api.wildberries.ru`
Token: Finance.

### POST `/api/finance/v1/sales-reports/list`

Current realization/sales report list method introduced 2026-04-15.

### POST `/api/finance/v1/sales-reports/detailed/{reportId}`

Details by report ID; official docs state data from 2025-01-01. Request limit: 1/minute.

### POST `/api/finance/v1/sales-reports/detailed`

Details for a period; data available from 2024-01-29 according to current docs. Supports requested `fields` list and current normalized field naming. Request limit: 1/minute.

### Deprecated finance endpoint excluded

Legacy `GET /api/v5/supplier/reportDetailByPeriod` was officially scheduled for shutdown on 2026-07-15. It is **not** used by the new bridge.

## 14. Feedbacks, questions, seller/customer evidence

Host: `https://feedbacks-api.wildberries.ru`
Token category: Feedbacks and Questions.

### GET `/api/v1/feedbacks`

Feedback list with filters, sorting and pagination. Current category limit: 3 req/sec, interval 333 ms, burst 6.

2026 release notes added `orderStatus` to feedback retrieval (`buyout`, `rejected`, `returned`, `notSpecified`), making review analysis substantially more useful for return/quality diagnosis.

### GET `/api/v1/questions`

Question list with filters and pagination. Can request up to 10,000 within take/skip bounds; supports nmId, answered status and date filters.

### GET `/api/common/v1/rating`

Seller rating + feedback count; useful as account/customer baseline.

Mutation methods for answering feedback/questions are excluded from v1.

## 15. What WB API gives us for the site

For product migration/content strategy we can build a canonical dataset from:

`cards + categories/subjects/characteristics + price snapshots + warehouse stock + marketplace identifiers + reviews/questions`

Then map:

`WB listing → canonical Product → SKU/Variant → ProductFamily → Category`.

This is materially better than manually copying 70 card titles: we preserve stable IDs, variants, characteristics and evidence provenance.

## 16. What WB API gives us for sales-drop diagnostics

Required comparison bundle for period A vs period B:

1. seller identity + subscription/access state;
2. full catalog/status;
3. price/discount snapshots;
4. current/historical stocks by WB warehouse/region;
5. sales funnel by SKU/day;
6. search visibility/query performance;
7. operational orders/sales;
8. returns;
9. campaign state/product membership;
10. campaign/search-cluster stats;
11. finance realization details;
12. feedback/orderStatus and questions where useful.

Analysis can then test causal candidates rather than correlate one chart:

`stock availability → search/ad eligibility & visibility → card traffic → cart conversion → orders → buyouts/returns → net finance`.

## 17. Data-quality rules

- Operational `orders/sales` are preliminary and are not the final financial source.
- Finance realization details are authoritative for reconciliation where they cover the event.
- Search analytics may require Jam; missing entitlement is recorded as `UNAVAILABLE_BY_SUBSCRIPTION`, not zero.
- Empty API result is not automatically zero demand/stock unless method semantics prove that.
- Current stock snapshots and historical funnel/finance observations are separate measurements.
- No deprecated endpoint is silently substituted for a current one.
- No automatic mutation/write action in v1.

## 18. Audit outcome

Wildberries has a sufficiently broad official read-only API surface to support both project objectives:

1. full seller assortment ingestion for the future site;
2. multi-layer business diagnostics including stock geography, search, advertising, funnel, returns and finance.

Before marking the **bridge implementation** accepted, every allowlisted operation still requires a real authenticated smoke against the owner's account, because actual access can depend on token categories, subscription and seller model.
