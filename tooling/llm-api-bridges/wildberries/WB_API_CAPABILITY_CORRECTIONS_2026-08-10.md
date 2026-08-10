# Wildberries API capability corrections — 2026-08-10

Статус: **CURRENT RESEARCH CORRECTION NOTE / NO EXTENSION IMPLEMENTATION**

Этот файл корректирует конкретные утверждения в `WB_API_CAPABILITY_AUDIT_2026-08-10.md`. При конфликте по пунктам ниже приоритет имеет эта correction note и текущая официальная документация WB API.

## 1. Authorization header

Актуальная официальная документация Wildberries требует:

`Authorization: Bearer <token>`

Для Service/Basic token flow может дополнительно требоваться `X-Client-Secret`; Personal token не должен получать этот заголовок.

Официальные источники:
- https://dev.wildberries.ru/knowledge-base/articles/019d49a1-0d73-71e9-be3e-b2c44567470c/sistema-avtorizatsii-wb-api
- https://dev.wildberries.ru/knowledge-base/articles/019d49a1-bd37-76b4-931d-fa5fa437b85e/rabota-s-tokenami-dlia-partnerskikh-servisov

## 2. Product cards — current read master

Current exact read method:

`POST https://content-api.wildberries.ru/content/v2/get/cards/list`

Назначение: список созданных карточек товаров. Карточки из корзины не возвращаются и читаются отдельным методом:

`POST https://content-api.wildberries.ru/content/v2/get/cards/trash`

Для более чем 100 карточек используется cursor pagination.

Официальный источник:
https://dev.wildberries.ru/docs/openapi/work-with-products

## 3. Prices and discounts — current read method

Current exact read method for all products with prices:

`GET https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter`

Для полного списка используется `limit <= 1000` + `offset` pagination до пустого массива.

Current product data includes at least:

- `nmID`
- `vendorCode`
- sizes / sizeID
- price
- discountedPrice
- clubDiscountedPrice
- currency
- discount / clubDiscount
- editableSizePrice
- bad-turnover marker where applicable

Официальный источник:
https://dev.wildberries.ru/en/docs/openapi/work-with-products

## 4. Seller warehouses and FBS inventory

Current seller warehouses read method:

`GET https://marketplace-api.wildberries.ru/api/v3/warehouses`

Current seller-warehouse inventory read method:

`POST https://marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}`

Для методов seller warehouses/inventory официальный limit class: до 300 requests/minute, interval 200 ms, burst 20 (с дополнительными правилами по 409 для соответствующих методов).

Официальный источник:
https://dev.wildberries.ru/en/openapi/work-with-products

## 5. WB warehouse stock report — deprecated old method

Старый:

`GET https://statistics-api.wildberries.ru/api/v1/supplier/stocks`

официально помечен deprecated и был заявлен к удалению 23 июня 2026 года. Его нельзя использовать как основу будущего bridge.

Для текущего отчёта по остаткам на складах WB использовать asynchronous Analytics flow:

1. `GET https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains`
2. `GET https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/{task_id}/status`
3. `GET https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/{task_id}/download`

Важное ограничение: statistics service не хранит историю остатков как полноценный time series; для нашей причинной аналитики собственные регулярные snapshots всё равно нужны.

Официальный источник:
https://dev.wildberries.ru/openapi/reports

## 6. FBS orders

Current exact methods:

- `GET https://marketplace-api.wildberries.ru/api/v3/orders/new`
- `GET https://marketplace-api.wildberries.ru/api/v3/orders`
- `POST https://marketplace-api.wildberries.ru/api/v3/orders/status`

`GET /api/v3/orders` позволяет получить данные за максимум 30 календарных дней за один запрос и использует pagination.

Официальный источник:
https://dev.wildberries.ru/openapi/orders-fbs/

## 7. Finance — critical 2026 replacement

Старый метод:

`GET https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod`

был официально объявлен к отключению **15 июля 2026 года**. На текущую дату проекта он не должен считаться current finance foundation.

Current Finance API methods:

- `POST https://finance-api.wildberries.ru/api/finance/v1/sales-reports/list`
- `POST https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed`
- `POST https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed/{reportId}`

Для detailed-by-period данные доступны с 29 января 2024 года. Для detailed-by-report-ID официальная документация указывает данные с 1 января 2025 года; доступность конкретного варианта может зависеть от страны регистрации.

Current finance methods используют token category **Finance**; новые report methods доступны Personal/Service token types согласно официальной документации/release notes.

Официальные источники:
- https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting
- https://dev.wildberries.ru/en/release-notes?id=474

### Acquiring expenses

Current Finance API также содержит:

- `POST /api/finance/v1/acquiring/list`
- `POST /api/finance/v1/acquiring/detailed`
- `POST /api/finance/v1/acquiring/detailed/{reportId}`

Для этих methods действуют отдельные country/token restrictions; их включение в future read-only bridge должно зависеть от фактического seller account.

## 8. Promotions calendar — отдельный host и credential category

Актуальные read endpoints календаря акций:

- `GET https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions`
- `GET https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/details`
- `GET https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/nomenclatures`

Для доступа используется token category **Prices and Discounts**, не Promotion.

Официальный источник:
https://dev.wildberries.ru/ru/openapi/promotion

## 9. Promotion/advertising read surface

Current official Promotion API подтверждает read methods для campaign lists/info и statistics, включая:

- `GET /adv/v1/promotion/count`
- `GET /api/advert/v2/adverts`
- search-cluster statistics `POST /adv/v0/normquery/stats`
- finance/balance/history methods Promotion contour

API использует отдельный `advert-api.wildberries.ru` contour и token category Promotion.

Официальный источник:
https://dev.wildberries.ru/ru/openapi/promotion

## 10. Analytics sales funnel

Current exact methods include:

- `POST https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products`
- `POST https://seller-analytics-api.wildberries.ru/api/analytics/v3/sales-funnel/products/history`
- grouped history method

Daily/weekly history method даёт максимум последнюю неделю. Для периода до года используется generated Seller Analytics CSV (`/api/v2/nm-report/downloads` flow); generated reports имеют отдельные storage/limit/Jam restrictions.

Официальный источник:
https://dev.wildberries.ru/en/openapi/analytics

## 11. Research status

WB API audit остаётся исследовательским артефактом. **Wildberries extension не существует и разработка ещё не начата.**

Перед началом 03A.6 нужно сформировать final read-only method set из current endpoints выше, повторно проверить release notes на дату coding и только затем проектировать команды `WB_API_V1`.
