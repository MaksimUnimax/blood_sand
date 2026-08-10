# Wildberries API capability corrections — 2026-08-10

Статус: **CURRENT CORRECTION NOTE**

Этот файл корректирует конкретные утверждения в `WB_API_CAPABILITY_AUDIT_2026-08-10.md`. До следующей полной ревизии capability audit при конфликте по пунктам ниже приоритет имеет этот correction note и текущий provider code.

## 1. Authorization header

Актуальная официальная документация Wildberries требует:

`Authorization: Bearer <token>`

Initial bridge больше не передаёт raw token без схемы `Bearer`.

Официальный источник:
https://dev.wildberries.ru/knowledge-base/articles/019d49a1-0d73-71e9-be3e-b2c44567470c/sistema-avtorizatsii-wb-api

Provider regression отдельно проверяет exact header form.

## 2. Promotions Calendar — отдельный host и credential category

Календарь акций не относится к `advert-api.wildberries.ru` transport.

Актуальные официальные read endpoints:

- `GET https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions`
- `GET https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/details`

Для доступа используется token category **Цены и скидки / Prices and Discounts**, не Promotion.

Официальный источник:
https://dev.wildberries.ru/ru/openapi/promotion

Provider aliases исправлены:

- `promotions_calendar` → host alias `calendar`, credential alias `prices`
- `promotions_details` → host alias `calendar`, credential alias `prices`

`dp-calendar-api.wildberries.ru` добавлен в fixed host allowlist и MV3 host permissions candidate.

## 3. Finance report ID type

Для:

`POST https://finance-api.wildberries.ru/api/finance/v1/sales-reports/detailed/{reportId}`

официальная документация задаёт `reportId` как `integer<int64>`.

Следствие:

- path parameter принимает только decimal integer id;
- произвольная строка/safe-id не принимается;
- path traversal/injection отклоняется до сети.

Официальный источник:
https://dev.wildberries.ru/docs/openapi/financial-reports-and-accounting

## 4. Regression state

После этих исправлений общий local provider protocol + transport + durable runtime/execution regression: **38/38 PASS**.

В live GitHub синхронизированы:

- `wildberries/provider/wb_protocol.js`
- `shared/tests/provider_protocols.test.mjs`

Остальной browser-extension acceptance остаётся отдельным gate и не считается доказанным этим correction note.
