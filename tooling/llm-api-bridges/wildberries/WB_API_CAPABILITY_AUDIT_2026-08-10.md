# Wildberries API capability audit — 2026-08-10

Статус: **OFFICIAL API SURFACE AUDITED FOR INITIAL READ-ONLY BRIDGE**

Цель: определить read-only поверхность WB для полного импорта ассортимента и причинной аналитики seller performance.

Source of truth: только официальная документация `dev.wildberries.ru`.

## 1. Auth and provider domains

WB использует `HeaderApiKey`; токены имеют категории, и разные API-категории живут на разных доменах.

Official domain map includes:

- Content — `content-api.wildberries.ru`
- Analytics — `seller-analytics-api.wildberries.ru`
- Prices and Discounts — `discounts-prices-api.wildberries.ru`
- Marketplace — `marketplace-api.wildberries.ru`
- Statistics — `statistics-api.wildberries.ru`
- Promotion — `advert-api.wildberries.ru`
- Feedbacks and Questions — `feedbacks-api.wildberries.ru`
- Buyers Chat — `buyer-chat-api.wildberries.ru`
- Supplies — `supplies-api.wildberries.ru`
- Buyers Returns — `returns-api.wildberries.ru`
- Documents — `documents-api.wildberries.ru`
- Finance — `finance-api.wildberries.ru`
- Tariffs/News/Seller Info — `common-api.wildberries.ru`

Several categories also have sandbox domains.

Source: https://dev.wildberries.ru/ru/openapi/api-information

Bridge consequence: host is selected only from operation allowlist. Assistant never supplies arbitrary URL or Authorization value.

---

# 2. Product/catalog master

## `POST /content/v2/get/cards/list`
Host: `content-api.wildberries.ru`
Token category: Content (also documented as available with Promotion in this read context)

Returns created product cards; supports cursor pagination beyond 100 cards.

Critical identity/product fields available in card workflow include:

- `nmID` — WB article;
- `vendorCode` — seller article;
- `subjectID`;
- title;
- brand;
- description;
- dimensions/weight;
- sizes/variants;
- barcodes and other card attributes/media according to card schema.

Source: https://dev.wildberries.ru/openapi//work-with-products
Official implementation guide: https://dev.wildberries.ru/en/news/101

## `POST /content/v2/get/cards/trash`
Returns cards in trash; pagination supported.

Why we need both: a canonical marketplace listing master must distinguish active cards from deleted/trashed historical cards instead of silently losing identity.

## Content reference data

Official Product API also exposes reads for:

- categories;
- subjects;
- characteristics;
- brands;
- tags/labels.

These reads will be included where needed to normalize `subjectID`/attributes into our ProductFamily/Category layer.

Source: https://dev.wildberries.ru/docs/openapi/work-with-products

---

# 3. Prices and discounts

## `GET /api/v2/list/goods/filter`
Host: `discounts-prices-api.wildberries.ru`
Token category: Prices and Discounts

Returns products with prices. For all products, use `limit <= 1000` plus `offset` pagination until empty result.

## `POST /api/v2/list/goods/filter`
Same host/category; reads prices for multiple WB articles.

Observed response fields include:

- `nmID`;
- `vendorCode`;
- sizes;
- base `price`;
- `discountedPrice`;
- `clubDiscountedPrice`;
- seller `discount`;
- `clubDiscount`;
- currency;
- `editableSizePrice`;
- `isBadTurnover`.

## `GET /api/v2/list/goods/size/nm`
Returns size-level product price data for a given `nmID` where size pricing is supported.

## `GET /api/v2/quarantine/goods`
Returns products whose attempted price is in price quarantine.

Sources:
- https://dev.wildberries.ru/en/docs/openapi/work-with-products
- https://dev.wildberries.ru/en/news/151

Important limitation from official WB API employee: the Product Prices API does not expose every platform-side discount layer as a complete final buyer-price decomposition. Do not infer unavailable WB-funded discount fields.
Source: https://dev.wildberries.ru/forum/1466

Initial bridge is read-only: price upload/update methods are excluded.

---

# 4. Seller warehouses and FBS stocks

## `GET /api/v3/warehouses`
Host: `marketplace-api.wildberries.ru`
Token category: Marketplace

Returns seller warehouses, including warehouse id, linked office, name and status-related fields.

## `GET /api/v3/offices`
Returns WB offices available for linking to seller warehouse, including city/federal district/coordinates where present.

## `POST /api/v3/stocks/{warehouseId}`
Returns FBS product stocks for provided `chrtIds`.

Response includes `chrtId` and amount.

Current stock API uses size ID `chrtId`; this identity must be obtained from product cards and persisted in our SKU/Variant mapping.

Source: https://dev.wildberries.ru/docs/openapi/work-with-products

Mutation methods (`PUT/DELETE /api/v3/stocks/{warehouseId}`) are explicitly **not** in initial bridge allowlist.

---

# 5. WB warehouse stock and stock history

## Analytics stock report family

Official Analytics API includes stock reports by products/groups and regional shipment/warehouse detail.

### `POST /api/v2/stocks-report/products/products`
Host: `seller-analytics-api.wildberries.ru`
Token category: Analytics

Returns inventory analytics by products; can work on specified `nmIDs` or entire report and supports period/stock type filters.

### `POST /api/v2/stocks-report/products/groups`
Returns stock data grouped by subject/brand/tag.

Source: https://dev.wildberries.ru/ru/openapi/analytics

## Historical stock via seller analytics CSV

### `POST /api/v2/nm-report/downloads`
Creates advanced analytics report generation task.

### `GET /api/v2/nm-report/downloads`
Checks report status/list.

### `GET /api/v2/nm-report/downloads/file/{downloadId}`
Downloads generated ZIP/CSV.

Official report types include:

- `STOCK_HISTORY_REPORT_CSV`
- `STOCK_HISTORY_DAILY_CSV`

Stock-history CSV is available for up to 3 months and does not require Jam according to current WB knowledge-base documentation.

Sources:
- https://dev.wildberries.ru/knowledge-base/articles/019d49a3-f76b-7f22-82f3-54930b8f59e8/analitika-prodavtsa-csv
- https://dev.wildberries.ru/en/openapi/analytics

Important: legacy Statistics `GET /api/v1/supplier/stocks` is documented as deprecated/removal-bound. Do not build new bridge around it.
Source: https://dev.wildberries.ru/en/openapi/reports

---

# 6. Sales funnel / product analytics

Token category: Analytics; host `seller-analytics-api.wildberries.ru`.

## `POST /api/analytics/v3/sales-funnel/products`
Compares key product metrics for current period vs comparable previous period.

## `POST /api/analytics/v3/sales-funnel/products/history`
Product-card statistics by day/week. Current direct method documents maximum last week; report updates hourly.

Official description explicitly covers event layers including:

- product-card transitions/views;
- add-to-cart;
- orders;
- buyouts;
- cancellations;
- returns.

For longer periods, official docs direct to Seller Analytics CSV (`DETAIL_HISTORY_REPORT` etc.).

## `POST /api/analytics/v3/sales-funnel/grouped/history`
Daily/weekly funnel grouped by subjects, brands and tags.

Sources:
- https://dev.wildberries.ru/ru/openapi/analytics
- https://dev.wildberries.ru/en/openapi/analytics

This is a core root-cause layer: traffic → cart → order → buyout/cancel/return.

---

# 7. Search-query analytics / SEO evidence

Token category: Analytics; host `seller-analytics-api.wildberries.ru`.

Current official docs state these methods require **Jam subscription**.

## `POST /api/v2/search-report/report`
Returns main search-query report with:

- general information;
- product positions;
- visibility;
- transitions to product card;
- grouped query data;
- optional substituted SKUs/search texts.

Additional methods in this family provide group pagination and products within group.

Official docs also expose product-focused query reports such as top search texts and orders/average positions by search query; implementation must derive exact current paths/schemas directly from this same OpenAPI section when adding aliases.

Sources:
- https://dev.wildberries.ru/ru/openapi/analytics
- https://dev.wildberries.ru/news/297

This is strategically high-value for our site because it supplies **actual marketplace buyer query evidence**, not guessed SEO keywords.

---

# 8. Orders / operational status (FBS)

Token category: Marketplace; host `marketplace-api.wildberries.ru`.

## `GET /api/v3/orders`
Returns FBS assembly-order information for a requested period, with pagination; one request may cover max 30 calendar days according to current docs.

## `GET /api/v3/orders/new`
Returns new assembly orders.

## status/read metadata methods
Read-only status and metadata methods can be used for operational reconciliation where needed.

Source: https://dev.wildberries.ru/openapi/orders-fbs/

Mutation/cancellation/label/supply actions remain outside initial analytics bridge unless later separately approved.

---

# 9. Main reports: warehouses, orders, sales

Official Reports API states main reports provide statistics for:

- warehouses;
- orders;
- sales.

It also exposes reports for:

1. warehouse stocks;
2. mandatory marking;
3. deductions;
4. paid acceptance;
5. paid storage;
6. sales by regions;
7. brand share;
8. hidden products;
9. returns and goods movements.

Source: https://dev.wildberries.ru/ru/openapi/reports

## `GET /api/v1/analytics/region-sale`
Host: `seller-analytics-api.wildberries.ru`
Token category: Analytics

Returns sales grouped by regions; current docs allow up to 31 days per report.

## `GET /api/v1/analytics/brand-share/brands`
Lists seller brands eligible for brand-share report.

## `GET /api/v1/analytics/brand-share/parent-subjects`
Gets parent categories for seller brand.

## `GET /api/v1/analytics/brand-share`
Brand share report; current docs allow up to 365 days and data since 2022-11-01.

## Hidden/banned products
Official Reports API includes read methods for blocked cards and hidden-from-catalog goods with reasons. This is critical for explaining sudden traffic/sales loss caused by listing eligibility.

## `GET /api/v1/analytics/goods-return`
Returns seller goods-return report; current docs allow max 31 days.

Source: https://dev.wildberries.ru/ru/openapi/reports

---

# 10. Finance

## `GET /api/v1/account/balance`
Returns seller account balance fields including currency/current/available-to-withdraw values.

## `POST /api/finance/v1/sales-reports/detailed`
Host: `finance-api.wildberries.ru`
Returns realization/sales-report details for a period. Current docs state data available since 2024-01-29.

## `POST /api/finance/v1/sales-reports/detailed/{reportId}`
Returns details by realization report ID; current docs state data available since 2025-01-01 for this endpoint.

Official Finance/Documents surface also provides financial documents/accounting artifacts.

Sources:
- https://dev.wildberries.ru/ru/openapi/financial-reports-and-accounting
- https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting

Usefulness: net economic result, commissions/deductions/logistics/realization reconciliation rather than only gross orders.

---

# 11. Advertising / promotion — exceptionally strong diagnostic surface

Host: `advert-api.wildberries.ru`
Token category: Promotion

Official Promotion API supports:

- campaign lists/info;
- campaign configuration and product/query-cluster parameters;
- campaign finance;
- campaign/media statistics;
- promotions calendar.

For our initial bridge only read methods are allowlisted.

## `GET /adv/v1/promotion/count`
Lists all seller promotion campaigns grouped by type/status, with IDs and change time.

## `GET /api/advert/v2/adverts`
Returns campaign information filtered by statuses/payment types/IDs.

## `POST /adv/v2/supplier/nms`
Returns product cards available for campaigns; useful for campaign↔SKU mapping.

## `POST /adv/v0/normquery/get-bids`
Returns search-cluster bid information by campaign IDs/WB articles. Initial bridge treats it as read-only diagnostic evidence.

## `POST /adv/v0/normquery/stats`
Returns statistics by search clusters for selected campaign period.

Release notes from 2026-04 state cluster statistics support CPC campaigns too, although some display metrics are unavailable for CPC.

## `GET /adv/v3/fullstats`
Current campaign-statistics method; maximum period per request is 31 days; supports up to 50 campaign IDs per request according to current docs.

Response metrics shown by official docs include at campaign/application/SKU layers such as:

- views;
- clicks;
- CTR;
- CPC;
- spend/sum;
- add-to-baskets (`atbs`);
- orders;
- conversion rate (`cr`);
- sold units/related counters where returned;
- order/sales sum (`sum_price`);
- `nmId` product detail.

## `GET /adv/v1/balance`
Returns promotion account/balance information.

## promotions calendar
Read methods include:

- `GET /api/v1/calendar/promotions`
- `GET /api/v1/calendar/promotions/details`
- product eligibility/list methods in same official section.

Sources:
- https://dev.wildberries.ru/ru/openapi/promotion
- https://dev.wildberries.ru/release-notes

This directly enables the user’s example causal chain:

`SKU stockout / availability change → campaign product availability/delivery → impressions/clicks/spend change → product funnel/orders decline`.

No bid/campaign/budget mutation method is included in v1 bridge.

---

# 12. Reviews / questions / buyer communication

Official WB domain map exposes separate categories/domains for:

- Feedbacks and Questions;
- Buyers Chat;
- Buyers Returns.

These will be read-only optional modules for content research and quality diagnostics after core commerce/analytics functions are accepted.

No buyer personal data should be requested or returned unless strictly necessary for an explicitly approved operational task.

Source: https://dev.wildberries.ru/ru/openapi/api-information

---

# 13. What the WB bridge can diagnose

For period A vs B and per Product/SKU, LLM can combine:

1. **Catalog state** — card exists, attributes, subject/category, hidden/block conditions.
2. **Price state** — base/discounted/club price, quarantine indicators.
3. **Availability** — seller FBS warehouse stocks plus WB stock analytics/history.
4. **Search discovery** — real buyer search queries, positions, visibility, card transitions.
5. **Advertising** — campaign membership/status, clusters, views/clicks/CTR/CPC/spend/cart/orders/revenue-related metrics.
6. **Funnel** — card transitions → cart → order → buyout/cancel/return.
7. **Region** — sales by region and stock/shipment geography where available.
8. **Operations** — FBS order state.
9. **Returns/movements** — goods-return reports.
10. **Finance** — realization details/balance and accounting evidence.

Therefore an analysis “sales fell 30%” can test multiple competing explanations rather than guessing from one chart.

---

# 14. Initial WB bridge read-only operation aliases

Planned hard allowlist candidates:

### identity/catalog
- `cards_list` → `POST /content/v2/get/cards/list`
- `cards_trash` → `POST /content/v2/get/cards/trash`
- category/subject/characteristic/brand read aliases from official Content section

### price
- `prices_all` → `GET /api/v2/list/goods/filter`
- `prices_by_nm` → `POST /api/v2/list/goods/filter`
- `size_prices` → `GET /api/v2/list/goods/size/nm`
- `price_quarantine` → `GET /api/v2/quarantine/goods`

### warehouses/stocks
- `seller_warehouses` → `GET /api/v3/warehouses`
- `offices` → `GET /api/v3/offices`
- `fbs_stocks` → `POST /api/v3/stocks/{warehouseId}`
- `stock_products_analytics` → `POST /api/v2/stocks-report/products/products`
- `stock_groups_analytics` → `POST /api/v2/stocks-report/products/groups`

### funnel/search
- `sales_funnel_products` → `POST /api/analytics/v3/sales-funnel/products`
- `sales_funnel_history` → `POST /api/analytics/v3/sales-funnel/products/history`
- `sales_funnel_group_history` → `POST /api/analytics/v3/sales-funnel/grouped/history`
- `search_report` → `POST /api/v2/search-report/report` (Jam restriction applies)
- exact aliases for product search-text/orders reports will be added from same current OpenAPI before coding.

### generated analytics CSV
- `analytics_download_create` → `POST /api/v2/nm-report/downloads`
- `analytics_download_list` → `GET /api/v2/nm-report/downloads`
- `analytics_download_file` → `GET /api/v2/nm-report/downloads/file/{downloadId}`

### orders/reports/finance
- `fbs_orders` → `GET /api/v3/orders`
- `fbs_new_orders` → `GET /api/v3/orders/new`
- `region_sales` → `GET /api/v1/analytics/region-sale`
- `brand_share` family → official brand-share GET methods
- `goods_returns` → `GET /api/v1/analytics/goods-return`
- `seller_balance` → `GET /api/v1/account/balance`
- `realization_details_period` → `POST /api/finance/v1/sales-reports/detailed`
- `realization_details_report` → `POST /api/finance/v1/sales-reports/detailed/{reportId}`

### promotion
- `campaigns_list` → `GET /adv/v1/promotion/count`
- `campaigns_info` → `GET /api/advert/v2/adverts`
- `campaign_products` → `POST /adv/v2/supplier/nms`
- `campaign_cluster_bids` → `POST /adv/v0/normquery/get-bids`
- `campaign_cluster_stats` → `POST /adv/v0/normquery/stats`
- `campaign_stats` → `GET /adv/v3/fullstats`
- `promotion_balance` → `GET /adv/v1/balance`
- `promotions_calendar` → `GET /api/v1/calendar/promotions`
- `promotions_details` → `GET /api/v1/calendar/promotions/details`

Every alias has fixed host + fixed HTTP method + validated input schema. The LLM never sends raw URL.

# 15. Explicitly excluded from v1

Even though WB API supports them, initial bridge forbids:

- card create/edit/delete;
- media writes;
- price/discount writes;
- stock writes/deletes;
- warehouse create/edit/delete;
- order mutation/cancel/status actions;
- supply mutations;
- campaign create/start/pause/delete/rename;
- bid changes;
- campaign product changes;
- promotion enrollment;
- arbitrary request URL/method.

# 16. Acceptance implications

WB bridge will require multiple local token slots/categories because one universal credential may not have every category enabled. Popup must show per-category credential presence/test status without ever rendering stored token value back to content script/LLM.

Before release, each alias is revalidated against current official OpenAPI because WB actively deprecates/replaces methods. Deprecated methods (for example legacy stock/stat endpoints) are not frozen into our bridge merely because old examples exist.
