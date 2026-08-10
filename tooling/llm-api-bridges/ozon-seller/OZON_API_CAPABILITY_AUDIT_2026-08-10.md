# Ozon API capability audit — 2026-08-10

Статус: **IN PROGRESS — official-source audit; не считать endpoint allowlist финальным**

Цель: определить read-only поверхность Ozon, достаточную для (1) полного импорта магазина и (2) причинной аналитики продаж.

## Source policy

В capability matrix принимаются только официальные материалы Ozon (`dev.ozon.ru` / официальная Seller API library). Сторонние SDK/Postman/MCP могут использоваться только как подсказка, но не как source of truth.

Официальная интерактивная Seller API library `docs.ozon.ru/api/seller/` в текущем research environment возвращает redirect loop. Поэтому методы ниже разделены на:

- `CONFIRMED` — endpoint/возможность непосредственно подтверждены официальным Ozon source;
- `CATEGORY_CONFIRMED / ENDPOINT_PENDING` — официальный Ozon подтверждает API-категорию/возможность, но exact current method/path должен быть снят из live library перед включением в extension allowlist.

**03A.3 не закрывается**, пока exact library snapshot не позволит проверить product catalog/prices/returns/reports/advertising surface целиком.

## Security / transport

### CONFIRMED — public API only

Ozon прямо требует использовать публичные API (например Seller API) и запрещает automated scraping `www.ozon.ru`, `api.ozon.ru`, `xapi.ozon.ru` и автоматизацию кабинета через Selenium-подобные средства.

Следствие для bridge: только hardcoded official API hosts; никакого scraping кабинета и arbitrary URL.

Source: https://dev.ozon.ru/start/298-Seller-API-kak-izbezhat-blokirovok/

### CONFIRMED — Seller API credentials

Официальный Ozon for dev example использует:

- `Client-Id`
- `Api-Key`
- base host `https://api-seller.ozon.ru`

Source: https://dev.ozon.ru/case/98-Keis-o-novom-instrumente-dlia-kontrolia-tovarnykh-ostatkov-na-sklade/

OAuth существует в контексте приложений; официальный moderator 2026-06 уточняет, что OAuth-token без создания private/public application не существует.

Source: https://dev.ozon.ru/community/2154-Avtorizatsiia-cherez-OAuth-token/

Initial local bridge therefore targets user-created Seller API credentials stored only in extension local storage. OAuth integration is a later option, not a prerequisite for v1 read-only bridge.

---

# Confirmed read capabilities

## 1. Stocks / availability

### `POST /v4/product/info/stocks` — CONFIRMED CURRENT FAMILY

Official Ozon for dev discussion (2025) identifies `/v4/product/info/stocks` as “Информация о количестве товаров” and shows per product:

- `product_id`
- `offer_id`
- FBO/FBS stock blocks
- `present`
- `reserved`
- `sku`
- `warehouse_ids`
- shipment type

Usefulness:

- current sellable availability;
- FBO vs FBS split;
- SKU/listing identity mapping;
- stockout detection;
- warehouse-linked availability evidence.

Source: https://dev.ozon.ru/community/1747-v4-product-info-stocks-daet-ne-korrektnye-ostatki/

Important: current stock alone is not historical stock. For causal analysis the project must snapshot this method over time unless another current official history method is confirmed.

## 2. General seller/product analytics

### `POST /v1/analytics/data` — CONFIRMED

Official Ozon material demonstrates this Seller API method and states that analytics can request metrics including:

- impressions/shows;
- sessions;
- conversions;
- revenue;
- returns;
- ordered quantity (`ordered_units`).

It can be dimensioned by SKU in the documented example.

Usefulness:

- week-over-week product performance;
- funnel changes;
- orders/revenue/returns;
- separating traffic decline from conversion decline;
- correlation with stock state.

Source: https://dev.ozon.ru/case/98-Keis-o-novom-instrumente-dlia-kontrolia-tovarnykh-ostatkov-na-sklade/

Before implementation we must re-read live schema to enumerate **all current allowed metrics, dimensions, date windows, limit/offset and account-plan restrictions**. Do not freeze the historical article’s field list as exhaustive.

## 3. Search query analytics for own products

### `POST /v1/analytics/product-queries` — CONFIRMED
### `POST /v1/analytics/product-queries/details` — CONFIRMED

Ozon introduced these Seller API methods as equivalents of `Аналитика → Товары в поиске → Запросы моего товара`:

- first: general analytics for product queries;
- second: detailed analytics for specific queries.

Ozon states Premium/Premium Plus receive longer history and more data.

Usefulness:

- actual search phrases connected to our Ozon listings;
- SEO/semantic seeds for the future site;
- query-level visibility/demand evidence;
- diagnosis of demand/search-discovery loss before order decline.

Source: https://dev.ozon.ru/news/512-Novye-metody-dlia-raboty-s-analitikoi-po-zaprosam-tovarov-v-Seller-API/

## 4. FBO postings / order facts

### `POST /v3/posting/fbo/list` — CONFIRMED CURRENT FAMILY

Official Ozon community contains current May 2026 support discussion for `/v3/posting/fbo/list`, confirming the active method family.

Usefulness:

- FBO posting/order chronology;
- posting statuses;
- order-level reconciliation with analytics/finance.

Source: https://dev.ozon.ru/community?category_id=2&page=4

Exact response fields, status semantics, pagination and permitted date window must be read from current library before allowlisting.

## 5. FBS posting details

### `POST /v3/posting/fbs/get` — CONFIRMED

Official Ozon developer reply recommends `/v3/posting/fbs/get`, section `products`, to obtain per-product price in an FBS posting when finance transactions alone do not provide enough per-item price detail.

Usefulness:

- FBS order/posting detail;
- product price actually associated with posting;
- reconciliation of sales and finance.

Source: https://dev.ozon.ru/community/712-Zapros-v3-finance-transaction-list-kak-uznat-tsenu-za-tovar

## 6. Finance transactions

### `POST /v3/finance/transaction/list` — CONFIRMED METHOD FAMILY

Official Ozon support discussion explicitly references `/v3/finance/transaction/list` and its transaction item data.

Usefulness:

- transaction-level monetary evidence;
- commissions/services/charges subject to current schema;
- reconciliation against postings and product analytics.

Source: https://dev.ozon.ru/community/712-Zapros-v3-finance-transaction-list-kak-uznat-tsenu-za-tovar

Exact transaction types/fields/date limits/pagination must be confirmed from live library before implementation.

## 7. FBO supply chain

### `/v3/supply-order/get` — CONFIRMED
### `/v1/supply-order/details` — CONFIRMED

Official January 2026 Ozon change notice confirms both methods and adds `macrolocal_cluster_id`; cross-dock changes became effective 2026-02-16.

Usefulness:

- inbound FBO supply status/context;
- logistics delay evidence;
- cluster/macrolocal supply analysis;
- explanation of stockout duration and replenishment failures.

Source: https://dev.ozon.ru/news/647-Izmeneniia-v-metodakh-Seller-API-pri-rabote-s-postavkami-FBO/

---

# Official categories/capabilities requiring exact live-library extraction

These are required for our product and analytics goals, but **must not enter v1 allowlist until exact current method/path/schema is confirmed from Ozon’s official library**.

## A. Full product catalog / listing master — REQUIRED

Need exact read methods for:

- all seller products/listings including archived/hidden where accessible;
- `offer_id`, `product_id`, FBO/FBS `sku`;
- title/name;
- visibility/status;
- category/type;
- attributes/characteristics;
- barcodes;
- dimensions/weight;
- media/image/video references;
- description/rich content if exposed;
- listing errors/moderation state.

Why: this is the source for Ozon side of canonical Product/SKU/MarketplaceListing master.

Status: `ENDPOINT_PENDING`.

## B. Prices / discounts / promotions — REQUIRED

Need exact read methods for:

- current seller price;
- marketplace/card/discounted price where exposed;
- old price;
- Ozon-card/promotional effects where exposed;
- product participation in promotions;
- price index/competitiveness fields if available.

Why: price change is a direct candidate cause of traffic/conversion/sales changes.

Status: `ENDPOINT_PENDING`.

Ozon confirms seller-promotion API methods exist in beta library, but mutation methods remain outside our initial bridge.
Source: https://dev.ozon.ru/community/1942-v1-seller-actions-products-add-404-poka/

## C. Returns / cancellations / claims — REQUIRED

Need exact current read surface for:

- returns;
- cancellation status/reason;
- returned quantities by SKU/listing/posting;
- logistics/rejection reasons where exposed.

Why: gross orders can be stable while realized sales/revenue falls due to cancellation/return deterioration.

Status: `ENDPOINT_PENDING`.

## D. Reports / realization / settlement — REQUIRED

Need exact current read methods for:

- realization/settlement reports;
- seller services/commissions/logistics;
- storage/acceptance fees if exposed;
- accruals/deductions;
- payout/reconciliation.

Status: `ENDPOINT_PENDING`, although transaction list is already confirmed separately.

## E. Warehouses / geography / delivery availability — REQUIRED

Need exact current read methods for seller warehouses and any cluster/region availability fields beyond `warehouse_ids` in stock response.

Why: supports causal chain `regional stockout → delivery availability / ad effectiveness → orders down`.

Status: `ENDPOINT_PENDING`.

## F. Advertising / Performance API — REQUIRED, SEPARATE API CONTOUR

Ozon for dev explicitly exposes a separate `API рекламной платформы` category alongside Seller API.

Need exact current official surface for:

- campaign list/status/type;
- products/SKU attached to campaign;
- daily/campaign/product statistics;
- impressions;
- clicks;
- CTR;
- spend;
- CPC/CPM/other billing model;
- orders/revenue/attributed conversion where API exposes them;
- bids/budgets only as read fields in v1 bridge;
- search phrases/query stats if available;
- placement/category/region dimensions if available.

Initial extension **must not** allow campaign/bid/budget mutations.

Official category evidence: https://dev.ozon.ru/community?category_id=2&page=4

Status: `CATEGORY_CONFIRMED / EXACT_ENDPOINTS_PENDING`.

## G. Reviews / questions / buyer communications — DESIRABLE

Need read methods if current official library permits them:

- reviews/rating;
- questions;
- complaint themes;
- buyer communications metadata without exposing unnecessary personal data.

Usefulness: content passport, FAQ, quality issues, conversion/root-cause evidence.

Status: `ENDPOINT_PENDING`.

---

# Diagnostic model enabled by confirmed + required capabilities

For a requested interval (for example last 7 days vs previous 7 days), bridge/LLM should be able to test competing causes in this order:

1. **Demand/search discovery** — search query analytics, impressions/sessions.
2. **Listing eligibility/visibility** — product status/moderation/hidden state.
3. **Availability** — FBO/FBS stocks, warehouse/cluster availability, stockout intervals.
4. **Price/promo** — price, discount, promotion participation.
5. **Advertising** — active campaigns, SKU inclusion, impressions/clicks/spend/CTR/CPC and attributed outcomes.
6. **Funnel** — product views/sessions → conversion → ordered units/revenue.
7. **Order operations** — FBO/FBS postings/statuses.
8. **Cancellations/returns** — loss after order.
9. **Supply/replenishment** — inbound supply delays and cluster routing.
10. **Finance** — transaction/commission/logistics/realization effect on net result.

No single metric is accepted as cause without temporal/product-level evidence from adjacent layers.

---

# Initial Ozon bridge v1 read-only allowlist candidates

Only `CONFIRMED` methods may enter implementation before the live-library completion pass:

- `product_stocks` → `/v4/product/info/stocks`
- `analytics_data` → `/v1/analytics/data`
- `product_queries` → `/v1/analytics/product-queries`
- `product_query_details` → `/v1/analytics/product-queries/details`
- `fbo_postings` → `/v3/posting/fbo/list`
- `fbs_posting` → `/v3/posting/fbs/get`
- `finance_transactions` → `/v3/finance/transaction/list`
- `fbo_supply_order` → `/v3/supply-order/get`
- `fbo_supply_details` → `/v1/supply-order/details`

Actual implementation gate: each alias must be rechecked against the current official API library schema on the day it is coded/tested.

## Explicitly forbidden in v1

- arbitrary path/URL;
- scraping Ozon site/cabinet;
- create/update/archive products;
- price writes;
- stock writes;
- order status mutations;
- return decisions;
- campaign creation/edit;
- bid/budget changes;
- promotion enrollment;
- any endpoint not present in hardcoded reviewed allowlist.

# Remaining work to close 03A.3

1. Obtain a current official Seller API library/OpenAPI snapshot without redirect-loop.
2. Enumerate exact current read methods for Product, Price, Returns, Reports, Warehouse and buyer communication sections.
3. Enumerate exact current Advertising API read methods and auth model.
4. Capture per-method limits, pagination, maximum history window and plan/subscription restrictions.
5. Produce machine-readable allowlist JSON from that verified snapshot.
6. Only then mark `03A.3` complete and begin production Ozon bridge implementation.
