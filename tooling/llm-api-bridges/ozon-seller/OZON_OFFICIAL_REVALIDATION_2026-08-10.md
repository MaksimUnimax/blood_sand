# Ozon Seller API — official revalidation pass — 2026-08-10

Статус: **RESEARCH ONLY / NO EXTENSION IMPLEMENTATION**

Этот файл фиксирует свежую повторную проверку официальных Ozon-источников перед разработкой будущего read-only LLM bridge.

## 1. Главный blocker official library

Повторная попытка открыть официальную интерактивную Seller API library:

`https://docs.ozon.ru/api/seller/`

в research environment снова завершилась `Redirect loop detected`.

Следствие: 03A.3 нельзя закрывать только по старым статьям/комьюнити. Exact current schema, pagination, rate limits и permissions для неподтверждённых разделов не выдумываются.

## 2. Что повторно подтверждено официальными Ozon-источниками

### Public API policy

Для автоматизации Ozon требует использовать публичные API, например Seller API. Automated scraping `www.ozon.ru`, `api.ozon.ru`, `xapi.ozon.ru` и Selenium-подобная автоматизация личного кабинета не должны использоваться как замена Seller API.

Official source:
https://dev.ozon.ru/start/298-Seller-API-kak-izbezhat-blokirovok/

### Seller API authentication contour

Официальный Ozon material показывает Seller API host:

`https://api-seller.ozon.ru`

и headers:

- `Client-Id`
- `Api-Key`

Official source:
https://dev.ozon.ru/case/98-Keis-o-novom-instrumente-dlia-kontrolia-tovarnykh-ostatkov-na-sklade/

### Current product stock family

`POST /v4/product/info/stocks`

Официальное обсуждение 2025 подтверждает current v4 family и показывает product-level поля:

- `product_id`
- `offer_id`
- FBO/FBS stock blocks
- `present`
- `reserved`
- `sku`
- `warehouse_ids`
- `shipment_type`

Official source:
https://dev.ozon.ru/community/1747-v4-product-info-stocks-daet-ne-korrektnye-ostatki/

Important: официальный старый кейс 2023 использует `/v3/product/info/stocks`; его нельзя использовать как current endpoint. Для будущей реализации current evidence имеет приоритет: `/v4/product/info/stocks`.

### General analytics

`POST /v1/analytics/data`

Официальный кейс подтверждает возможность получать seller/product analytics и показывает как минимум metrics класса:

- impressions/shows
- sessions
- conversions
- revenue
- returns
- ordered units

и dimension по SKU в примере.

Official source:
https://dev.ozon.ru/case/98-Keis-o-novom-instrumente-dlia-kontrolia-tovarnykh-ostatkov-na-sklade/

Важно: пример старый; его `limit=1000`, metric list и period logic не считаются доказательством текущего полного contract. Перед coding нужен current live schema pass.

### Search-query analytics for seller products

Current exact methods confirmed by official Ozon news:

- `POST /v1/analytics/product-queries`
- `POST /v1/analytics/product-queries/details`

Ozon прямо указывает, что Premium/Premium Plus дают более длинную историю и расширенный объём данных.

Official source:
https://dev.ozon.ru/news/512-Novye-metody-dlia-raboty-s-analitikoi-po-zaprosam-tovarov-v-Seller-API/

### FBO postings

`POST /v3/posting/fbo/list`

Методная семья подтверждается свежим official community listing 2026.

Official source:
https://dev.ozon.ru/community?category_id=2&page=4

### FBS posting detail

`POST /v3/posting/fbs/get`

Официальный ответ разработчика Ozon рекомендует раздел `products` этого метода для получения product-level price по posting.

Official source:
https://dev.ozon.ru/community/712-Zapros-v3-finance-transaction-list-kak-uznat-tsenu-za-tovar

### Finance transactions

`POST /v3/finance/transaction/list`

Current method family подтверждается официальным Ozon support discussion.

Official source:
https://dev.ozon.ru/community/712-Zapros-v3-finance-transaction-list-kak-uznat-tsenu-za-tovar

### FBO supply chain

Current official change notice 2026 подтверждает:

- `/v3/supply-order/get`
- `/v1/supply-order/details`

Для cross-dock с 2026-02-16 добавлен/актуализирован `macrolocal_cluster_id`; `warehouse_id` для cross-dock потерял прежнюю значимость.

Official source:
https://dev.ozon.ru/news/647-Izmeneniia-v-metodakh-Seller-API-pri-rabote-s-postavkami-FBO/

### Advertising contour exists separately

Ozon for dev официально разделяет Seller API и `API рекламной платформы`. Это отдельный contour, который будущий analytics bridge должен исследовать отдельно, а не смешивать с `api-seller.ozon.ru` без официального подтверждения host/auth/methods.

Official source:
https://dev.ozon.ru/community?category_id=2&page=4

## 3. Что НЕ подтверждено достаточно для coding

До получения current official Seller API library/OpenAPI snapshot остаются `PENDING`:

1. Полный seller catalog/listing master: все товары, archive/hidden, title, category/type, attributes, barcodes, dimensions, media, description/rich content, moderation/errors.
2. Current prices/discounts/promotion read methods и точные price fields.
3. Returns/cancellations/claims read surface и reason/status semantics.
4. Current realization/settlement/report read methods кроме уже подтверждённого finance transaction list.
5. Seller warehouses / cluster / geography / delivery-availability read methods, кроме данных, которые видны через current stock/supply methods.
6. Exact Advertising API read methods/auth/hosts/stat fields: campaign list, product bindings, impressions, clicks, spend, CTR, CPC/CPM, attributed orders/revenue, query stats where exposed.
7. Reviews/questions/buyer communications read methods и permissions.
8. Per-method current rate limits, pagination contracts, date/history windows и account/Premium restrictions для всех будущих aliases.

## 4. Research conclusion for 03A.3

03A.3 остаётся `[~]`.

Достаточно подтверждены базовые analytics/stock/order/finance/supply capabilities, чтобы понимать, что Ozon API пригоден для причинной seller-аналитики. Но этого пока недостаточно для разработки полноценного Ozon extension под задачу полного магазина, потому что catalog/prices/returns/settlement/advertising surface ещё не снята из current official library.

До закрытия этого gap **Ozon extension не разрабатывать**.
