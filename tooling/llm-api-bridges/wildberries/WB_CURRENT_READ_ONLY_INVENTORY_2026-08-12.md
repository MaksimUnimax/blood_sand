# Wildberries current read-only inventory — 2026-08-12

Status: **CURRENT OPENAPI SNAPSHOT / SECURITY-CLASSIFIED / NOT YET RELEASED**

This document is a derived current-state inventory built from the machine-readable OpenAPI 3.0.1 specifications exposed by the current official Wildberries Swagger navigation on 2026-08-12. It does not rewrite the frozen v0.1.1 baseline and is not itself a release record.

## Source snapshot

- official Swagger navigation: `https://dev.wildberries.ru/swagger`
- generated at UTC: `2026-08-12T10:55:37.939022+00:00`
- current navigation categories: **13/13 archived, missing 0**
- current OpenAPI totals: **265 paths / 286 operations**
- uploaded snapshot archive SHA-256: `4130a44f3c05cfceae62591c54fac028e45fc2235d403874941639bb5e9f0c4f`; bytes: `275298`
- uploaded `inventory.json` SHA-256: `8b6175708f698579c4a3c9621c698bfd01f76fac66e60ccc48923f26dc35f9ad`; bytes: `88942`
- `14-wbd.yaml` is intentionally excluded from current inventory because the current official Swagger navigation has no WBD category and `/swagger/wbd` is 404 in the captured source manifest.

### Official machine-readable source files

| Category | OpenAPI source | SHA-256 | Operations |
|---|---|---|---:|
| Общее | `https://dev.wildberries.ru/api/swagger/yaml/ru/01-general.yaml` | `2b3f150f4bfcc7ec77de9cf09d5a25984a05b64e3ace829e2b55945ff1a787fd` | 10 |
| Работа с товарами | `https://dev.wildberries.ru/api/swagger/yaml/ru/02-items.yaml` | `caf3868c8e0fc23cbafc9eafcbbbbb07a9a03e5876a8bf46d7814c5f847e3080` | 52 |
| Заказы FBS | `https://dev.wildberries.ru/api/swagger/yaml/ru/03-orders-fbs.yaml` | `9c37415a352cfa6e152812160aca86eba3f471effa7d6745b3d79d90a38e9aba` | 40 |
| Заказы DBW | `https://dev.wildberries.ru/api/swagger/yaml/ru/04-orders-dbw.yaml` | `b48c46a47a5088b78603c685413a094d9525e6cb38163b911467530d1f2710e9` | 16 |
| DBS | `https://dev.wildberries.ru/api/swagger/yaml/ru/05-orders-dbs.yaml` | `bffe0e945f602ac37fce54ce03fce5ab6edc63f04add357319a464b646ea804e` | 20 |
| Самовывоз | `https://dev.wildberries.ru/api/swagger/yaml/ru/06-in-store-pickup.yaml` | `cb21e6c24d56c0cab3f464a46afba66e804b9b1dd689041f057c3038151aea08` | 17 |
| Поставки FBW | `https://dev.wildberries.ru/api/swagger/yaml/ru/07-orders-fbw.yaml` | `44a66827fd5b270653d4ddf6c97ab3e5da42e655ffc9cdfe21a12faedfdf3dc9` | 7 |
| Маркетинг и продвижение | `https://dev.wildberries.ru/api/swagger/yaml/ru/08-promotion.yaml` | `12d4c1f02cdedc854531e3f35b82963efeeb041f3edfc534292114431a6a63e8` | 39 |
| Общение с покупателями | `https://dev.wildberries.ru/api/swagger/yaml/ru/09-communications.yaml` | `6eced75c68a9ff87b0cc159aa0a11a326c024dc613c0e5b3c201ff75949bb9c5` | 25 |
| Тарифы | `https://dev.wildberries.ru/api/swagger/yaml/ru/10-rates.yaml` | `b4f5ab5f5d7a243157eb29b821b6d7cdcd03f1cabb107dabffb5a64cdca209a7` | 5 |
| Аналитика и данные | `https://dev.wildberries.ru/api/swagger/yaml/ru/11-analytics.yaml` | `09bd2c45731801bf5c1205d60a88fb0be8a1a6b3cbd8edd2c59919d0f29afefd` | 20 |
| Отчёты | `https://dev.wildberries.ru/api/swagger/yaml/ru/12-reports.yaml` | `98251cdb4dd02f4f26cbdb4be15dd264cb52413088e72155046782503b9421ab` | 24 |
| Документы и бухгалтерия | `https://dev.wildberries.ru/api/swagger/yaml/ru/13-finances.yaml` | `1e3b4bcd8c134451982721198440ad4de6b23ee089f09234213794f45d4fb5c7` | 11 |

## Classification rule

Every one of the 286 current operations was classified by semantic effect, not by HTTP verb. This is required because the official WB API contains both read-by-POST methods and mutating GET methods.

- `READ_SAFE` — factual retrieval with no seller/business state mutation identified.
- `READ_SANITIZED` — factual retrieval that may contain customer/order/free-text fields and therefore requires the existing recursive customer-safe sanitizer.
- `READ_DERIVED` — creates/regenerates a derived report or generated identifier result without changing seller commerce configuration; still one command = at most one request.
- `READ_PII_BLOCKED` — semantically read-only, but the endpoint directly exposes buyer/user/courier/contact/chat identity data and must remain execution-disabled in the default bridge.
- `MUTATION_BLOCKED` — changes seller/API state and is excluded from the read-only inventory below.

Current totals:

- **150 `READ_SAFE`**
- **19 `READ_SANITIZED`**
- **6 `READ_DERIVED`**
- **13 `READ_PII_BLOCKED`**
- **98 `MUTATION_BLOCKED`**
- therefore **188 read/read-derived surfaces total**
- default executable candidates after privacy boundary: **175** (`150 + 19 + 6`)

## Complete current read/read-derived surface

### Общее

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/01-general.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/ping` | Проверка подключения |  |
| `READ_SAFE` | `GET` | `/api/communications/v2/news` | Получение новостей портала продавцов |  |
| `READ_SAFE` | `GET` | `/api/v1/seller-info` | Получить информацию о продавце |  |
| `READ_SAFE` | `GET` | `/api/common/v1/rating` | Получить рейтинг продавца |  |
| `READ_SAFE` | `GET` | `/api/common/v1/subscriptions` | Получить информацию о подписке Джем |  |
| `READ_SAFE` | `GET` | `/api/common/v1/tariff-constructor/options` | Получить информацию об опциях Конструктора тарифов |  |
| `READ_PII_BLOCKED` | `GET` | `/api/v1/users` | Получить список активных или приглашённых пользователей продавца | seller user names/phones/emails/access data |

### Работа с товарами

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/02-items.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/content/v2/object/parent/all` | Родительские категории товаров |  |
| `READ_SAFE` | `GET` | `/content/v2/object/all` | Список предметов |  |
| `READ_SAFE` | `GET` | `/content/v2/object/charcs/{subjectId}` | Характеристики предмета |  |
| `READ_SAFE` | `GET` | `/content/v2/directory/colors` | Цвет |  |
| `READ_SAFE` | `GET` | `/content/v2/directory/kinds` | Пол |  |
| `READ_SAFE` | `GET` | `/content/v2/directory/countries` | Страна производства |  |
| `READ_SAFE` | `GET` | `/content/v2/directory/seasons` | Сезон |  |
| `READ_SAFE` | `GET` | `/content/v2/directory/vat` | Ставка НДС |  |
| `READ_SAFE` | `GET` | `/content/v2/directory/tnved` | ТНВЭД-код |  |
| `READ_SAFE` | `GET` | `/api/content/v1/brands` | Бренды |  |
| `READ_SAFE` | `GET` | `/content/v2/tags` | Список ярлыков |  |
| `READ_SAFE` | `POST` | `/content/v2/get/cards/list` | Список карточек товаров |  |
| `READ_SAFE` | `POST` | `/content/v2/cards/error/list` | Список несозданных карточек товаров с ошибками |  |
| `READ_SAFE` | `POST` | `/content/v2/get/cards/trash` | Список карточек товаров в корзине |  |
| `READ_SAFE` | `GET` | `/content/v2/cards/limits` | Лимиты карточек товаров |  |
| `READ_DERIVED` | `POST` | `/content/v2/barcodes` | Генерация баркодов | generates barcode values without editing cards |
| `READ_SAFE` | `POST` | `/api/content/v1/recommendations/list` | Список рекомендаций в карточках товаров |  |
| `READ_SAFE` | `GET` | `/api/v2/history/tasks` | Состояние обработанной загрузки |  |
| `READ_SAFE` | `GET` | `/api/v2/history/goods/task` | Детализация обработанной загрузки |  |
| `READ_SAFE` | `GET` | `/api/v2/buffer/tasks` | Состояние необработанной загрузки |  |
| `READ_SAFE` | `GET` | `/api/v2/buffer/goods/task` | Детализация необработанной загрузки |  |
| `READ_SAFE` | `GET` | `/api/v2/list/goods/filter` | Получить товары с ценами |  |
| `READ_SAFE` | `POST` | `/api/v2/list/goods/filter` | Получить товары с ценами по артикулам |  |
| `READ_SAFE` | `GET` | `/api/v2/list/goods/size/nm` | Получить размеры товара с ценами |  |
| `READ_SAFE` | `GET` | `/api/v2/quarantine/goods` | Получить товары в карантине |  |
| `READ_SAFE` | `POST` | `/api/v3/stocks/{warehouseId}` | Получить остатки товаров |  |
| `READ_SAFE` | `GET` | `/api/v3/offices` | Получить список складов WB |  |
| `READ_SAFE` | `GET` | `/api/v3/warehouses` | Получить список складов продавца |  |
| `READ_PII_BLOCKED` | `GET` | `/api/v3/dbw/warehouses/{warehouseId}/contacts` | Список контактов | warehouse contact personal data |

### Заказы FBS

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/03-orders-fbs.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/api/v3/passes/offices` | Получить список складов, для которых требуется пропуск |  |
| `READ_PII_BLOCKED` | `GET` | `/api/v3/passes` | Получить список пропусков | driver/pass identity data |
| `READ_SANITIZED` | `GET` | `/api/v3/orders/new` | Получить список новых сборочных заданий | order payload may contain customer-related fields |
| `READ_SANITIZED` | `GET` | `/api/v3/orders` | Получить информацию о сборочных заданиях | order payload may contain customer-related fields |
| `READ_SAFE` | `POST` | `/api/v3/orders/status` | Получить статусы сборочных заданий |  |
| `READ_SANITIZED` | `GET` | `/api/v3/supplies/orders/reshipment` | Получить все сборочные задания для повторной отгрузки | order payload may contain customer-related fields |
| `READ_SAFE` | `POST` | `/api/v3/orders/stickers` | Получить стикеры сборочных заданий |  |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/orders/meta` | Получить идентификаторы маркировки сборочных заданий |  |
| `READ_SAFE` | `POST` | `/api/v3/orders/stickers/cross-border` | Получить стикеры сборочных заданий трансграничных поставок |  |
| `READ_SAFE` | `POST` | `/api/v3/orders/status/history` | История статусов для сборочных заданий трансграничных поставок |  |
| `READ_PII_BLOCKED` | `POST` | `/api/v3/orders/client` | Заказы с информацией по клиенту | direct customer identity data |
| `READ_SAFE` | `GET` | `/api/v3/supplies` | Получить список поставок |  |
| `READ_SAFE` | `GET` | `/api/v3/supplies/{supplyId}` | Получить информацию о поставке |  |
| `READ_SAFE` | `GET` | `/api/marketplace/v3/supplies/{supplyId}/order-ids` | Получить ID сборочных заданий поставки |  |
| `READ_SAFE` | `GET` | `/api/v3/supplies/{supplyId}/barcode` | Получить QR-код поставки |  |
| `READ_SAFE` | `GET` | `/api/v3/supplies/{supplyId}/trbx` | Получить список грузомест поставки |  |
| `READ_SAFE` | `POST` | `/api/v3/supplies/{supplyId}/trbx/stickers` | Получить стикеры грузомест поставки |  |
| `READ_SANITIZED` | `GET` | `/api/marketplace/v3/fbs/orders/archive` | Получить список архивных сборочных заданий | order payload may contain customer-related fields |
| `READ_SAFE` | `GET` | `/api/marketplace/v3/fbs/settings/autoreturns` | Получить настройки автовозврата продавца |  |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/fbs/settings/autoreturns/items` | Получить настройки автовозврата товаров |  |
| `READ_SAFE` | `GET` | `/api/marketplace/v3/fbs/settings/autoreturns/subcategories/restricted` | Получить предметы, которые не хранятся на складах WB |  |

### Заказы DBW

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/04-orders-dbw.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SANITIZED` | `GET` | `/api/v3/dbw/orders/new` | Получить список новых сборочных заданий | order payload may contain customer-related fields |
| `READ_SANITIZED` | `GET` | `/api/v3/dbw/orders` | Получить информацию о завершенных сборочных заданиях | order payload may contain customer-related fields |
| `READ_SAFE` | `POST` | `/api/v3/dbw/orders/delivery-date` | Получить дату и время доставки |  |
| `READ_PII_BLOCKED` | `POST` | `/api/marketplace/v3/dbw/orders/client` | Информация о покупателе | direct buyer identity data |
| `READ_SAFE` | `POST` | `/api/v3/dbw/orders/status` | Получить статусы сборочных заданий |  |
| `READ_SAFE` | `POST` | `/api/v3/dbw/orders/stickers` | Получить стикеры сборочных заданий |  |
| `READ_PII_BLOCKED` | `POST` | `/api/v3/dbw/orders/courier` | Информация о курьере | courier identity/contact data |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/dbw/orders/meta/details` | Получить идентификаторы маркировки сборочных заданий |  |

### DBS

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/05-orders-dbs.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SANITIZED` | `GET` | `/api/v3/dbs/orders/new` | Получить список новых сборочных заданий | order payload may contain customer-related fields |
| `READ_SANITIZED` | `GET` | `/api/v3/dbs/orders` | Получить информацию о завершенных сборочных заданиях | order payload may contain customer-related fields |
| `READ_SAFE` | `POST` | `/api/v3/dbs/groups/info` | Получить информацию о платной доставке |  |
| `READ_PII_BLOCKED` | `POST` | `/api/v3/dbs/orders/client` | Информация о покупателе | direct buyer identity data |
| `READ_PII_BLOCKED` | `POST` | `/api/marketplace/v3/dbs/orders/b2b/info` | Информация о покупателе B2B | buyer organization identifiers/name |
| `READ_SAFE` | `POST` | `/api/v3/dbs/orders/delivery-date` | Получить дату и время доставки |  |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/dbs/orders/status/info` | Получить статусы сборочных заданий |  |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/dbs/orders/stickers` | Получить стикеры для сборочных заданий с доставкой в ПВЗ |  |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/dbs/orders/meta/details` | Получить идентификаторы маркировки сборочных заданий |  |

### Самовывоз

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/06-in-store-pickup.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SANITIZED` | `GET` | `/api/v3/click-collect/orders/new` | Получить список новых сборочных заданий | order payload may contain customer-related fields |
| `READ_PII_BLOCKED` | `POST` | `/api/v3/click-collect/orders/client` | Информация о покупателе | direct buyer identity data |
| `READ_PII_BLOCKED` | `POST` | `/api/v3/click-collect/orders/client/identity` | Проверить, что заказ принадлежит покупателю | direct buyer identity verification |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/click-collect/orders/status/info` | Получить статусы сборочных заданий |  |
| `READ_SANITIZED` | `GET` | `/api/v3/click-collect/orders` | Получить информацию о завершённых сборочных заданиях | order payload may contain customer-related fields |
| `READ_SAFE` | `POST` | `/api/marketplace/v3/click-collect/orders/meta/details` | Получить идентификаторы маркировки сборочных заданий |  |

### Поставки FBW

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/07-orders-fbw.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `POST` | `/api/v1/acceptance/options` | Опции приёмки |  |
| `READ_SAFE` | `GET` | `/api/v1/warehouses` | Список складов |  |
| `READ_SAFE` | `GET` | `/api/v1/transit-tariffs` | Транзитные направления |  |
| `READ_SAFE` | `POST` | `/api/v1/supplies` | Список поставок |  |
| `READ_SAFE` | `GET` | `/api/v1/supplies/{ID}` | Детали поставки |  |
| `READ_SAFE` | `GET` | `/api/v1/supplies/{ID}/goods` | Товары поставки |  |
| `READ_SAFE` | `GET` | `/api/v1/supplies/{ID}/package` | Упаковка поставки |  |

### Маркетинг и продвижение

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/08-promotion.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/adv/v1/promotion/count` | Списки кампаний |  |
| `READ_SAFE` | `GET` | `/api/advert/v2/adverts` | Информация о кампаниях |  |
| `READ_SAFE` | `POST` | `/api/advert/v1/bids/min` | Минимальные ставки для карточек товаров |  |
| `READ_SAFE` | `GET` | `/adv/v1/supplier/subjects` | Предметы для кампаний |  |
| `READ_SAFE` | `POST` | `/adv/v2/supplier/nms` | Карточки товаров для кампаний |  |
| `READ_SAFE` | `GET` | `/adv/v1/balance` | Баланс |  |
| `READ_SAFE` | `GET` | `/adv/v1/budget` | Бюджет кампании |  |
| `READ_SAFE` | `GET` | `/adv/v1/upd` | Получение истории затрат |  |
| `READ_SAFE` | `GET` | `/adv/v1/payments` | Получение истории пополнений счёта |  |
| `READ_SAFE` | `GET` | `/api/advert/v0/bids/recommendations` | Рекомендуемые ставки для карточек товаров и поисковых кластеров |  |
| `READ_SAFE` | `POST` | `/adv/v0/normquery/stats` | Статистика поисковых кластеров |  |
| `READ_SAFE` | `POST` | `/adv/v0/normquery/get-bids` | Список ставок поисковых кластеров |  |
| `READ_SAFE` | `GET` | `/api/advert/v1/config` | Конфигурационные значения продвижения |  |
| `READ_SAFE` | `POST` | `/adv/v0/normquery/get-minus` | Список минус-фраз кампаний |  |
| `READ_SAFE` | `GET` | `/adv/v1/count` | Количество медиакампаний |  |
| `READ_SAFE` | `GET` | `/adv/v1/adverts` | Список медиакампаний |  |
| `READ_SAFE` | `GET` | `/adv/v1/advert` | Информация о медиакампании |  |
| `READ_SAFE` | `GET` | `/adv/v3/fullstats` | Статистика кампаний |  |
| `READ_SAFE` | `POST` | `/adv/v1/stats` | Статистика медиакампаний |  |
| `READ_SAFE` | `GET` | `/api/v1/calendar/promotions` | Список акций |  |
| `READ_SAFE` | `GET` | `/api/v1/calendar/promotions/details` | Детальная информация об акциях |  |
| `READ_SAFE` | `GET` | `/api/v1/calendar/promotions/nomenclatures` | Список товаров для участия в акции |  |
| `READ_SAFE` | `POST` | `/adv/v0/normquery/list` | Списки активных и неактивных поисковых кластеров |  |
| `READ_SAFE` | `POST` | `/adv/v1/normquery/stats` | Статистика по поисковым кластерам с детализацией по дням |  |

### Общение с покупателями

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/09-communications.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/api/v1/new-feedbacks-questions` | Непросмотренные отзывы и вопросы |  |
| `READ_SAFE` | `GET` | `/api/v1/questions/count-unanswered` | Неотвеченные вопросы |  |
| `READ_SAFE` | `GET` | `/api/v1/questions/count` | Количество вопросов |  |
| `READ_SANITIZED` | `GET` | `/api/v1/questions` | Список вопросов | customer-generated content / return data; sanitize identity/free-text secrets |
| `READ_SANITIZED` | `GET` | `/api/v1/question` | Получить вопрос по ID | customer-generated content / return data; sanitize identity/free-text secrets |
| `READ_SAFE` | `GET` | `/api/v1/feedbacks/count-unanswered` | Необработанные отзывы |  |
| `READ_SAFE` | `GET` | `/api/v1/feedbacks/count` | Количество отзывов |  |
| `READ_SANITIZED` | `GET` | `/api/v1/feedbacks` | Список отзывов | customer-generated content / return data; sanitize identity/free-text secrets |
| `READ_SANITIZED` | `GET` | `/api/v1/feedback` | Получить отзыв по ID | customer-generated content / return data; sanitize identity/free-text secrets |
| `READ_SANITIZED` | `GET` | `/api/v1/feedbacks/archive` | Список архивных отзывов | customer-generated content / return data; sanitize identity/free-text secrets |
| `READ_SANITIZED` | `GET` | `/api/feedbacks/v1/pins` | Список закреплённых и откреплённых отзывов | customer-generated content / return data; sanitize identity/free-text secrets |
| `READ_SAFE` | `GET` | `/api/feedbacks/v1/pins/count` | Количество закреплённых и откреплённых отзывов |  |
| `READ_SAFE` | `GET` | `/api/feedbacks/v1/pins/limits` | Лимиты закреплённых отзывов |  |
| `READ_PII_BLOCKED` | `GET` | `/api/v1/seller/chats` | Список чатов | buyer chat metadata |
| `READ_PII_BLOCKED` | `GET` | `/api/v1/seller/events` | События чатов | buyer chat events/messages |
| `READ_PII_BLOCKED` | `GET` | `/api/v1/seller/download/{id}` | Получить файл из сообщения | buyer chat attachment content |
| `READ_SANITIZED` | `GET` | `/api/v1/claims` | Заявки покупателей на возврат | customer-generated content / return data; sanitize identity/free-text secrets |

### Тарифы

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/10-rates.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/api/v1/tariffs/commission` | Комиссия по категориям товаров |  |
| `READ_SAFE` | `GET` | `/api/tariffs/v1/acceptance/coefficients` | Тарифы на поставку |  |
| `READ_SAFE` | `GET` | `/api/v1/tariffs/box` | Тарифы для коробов |  |
| `READ_SAFE` | `GET` | `/api/v1/tariffs/pallet` | Тарифы для монопаллет |  |
| `READ_SAFE` | `GET` | `/api/v1/tariffs/return` | Тарифы на возврат |  |

### Аналитика и данные

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/11-analytics.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `POST` | `/api/analytics/v3/sales-funnel/products` | Статистика карточек товаров за период |  |
| `READ_SAFE` | `POST` | `/api/analytics/v3/sales-funnel/products/history` | Статистика карточек товаров по дням |  |
| `READ_SAFE` | `POST` | `/api/analytics/v3/sales-funnel/grouped/history` | Статистика групп карточек товаров по дням |  |
| `READ_DERIVED` | `POST` | `/api/v2/nm-report/downloads` | Создать отчёт | creates derived analytics report task |
| `READ_SAFE` | `GET` | `/api/v2/nm-report/downloads` | Получить список отчётов |  |
| `READ_DERIVED` | `POST` | `/api/v2/nm-report/downloads/retry` | Сгенерировать отчёт повторно | regenerates derived report; no seller business-state mutation |
| `READ_SAFE` | `GET` | `/api/v2/nm-report/downloads/file/{downloadId}` | Получить отчёт |  |
| `READ_SAFE` | `POST` | `/api/v2/search-report/report` | Основная страница |  |
| `READ_SAFE` | `POST` | `/api/v2/search-report/table/groups` | Пагинация по группам |  |
| `READ_SAFE` | `POST` | `/api/v2/search-report/table/details` | Пагинация по товарам в группе |  |
| `READ_SAFE` | `POST` | `/api/v2/search-report/product/search-texts` | Поисковые запросы по товару |  |
| `READ_SAFE` | `POST` | `/api/v2/search-report/product/orders` | Заказы и позиции по поисковым запросам товара |  |
| `READ_SAFE` | `POST` | `/api/analytics/v1/stocks-report/wb-warehouses` | Остатки на складах WB |  |
| `READ_SAFE` | `POST` | `/api/v2/stocks-report/products/groups` | Данные по группам |  |
| `READ_SAFE` | `POST` | `/api/v2/stocks-report/products/products` | Данные по товарам |  |
| `READ_SAFE` | `POST` | `/api/v2/stocks-report/products/sizes` | Данные по размерам |  |
| `READ_SAFE` | `POST` | `/api/v2/stocks-report/offices` | Данные по складам |  |
| `READ_SAFE` | `POST` | `/api/analytics/v2/item-rating` | Получить отчёт |  |
| `READ_SAFE` | `POST` | `/api/analytics/v1/item-rating` | Получить отчёт |  |
| `READ_SAFE` | `POST` | `/api/analytics/v1/order-feed` | Получить отчёт |  |

### Отчёты

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/12-reports.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SANITIZED` | `GET` | `/api/v1/supplier/orders` | Заказы | seller order/sale report; sanitize buyer-related fields if present |
| `READ_SANITIZED` | `GET` | `/api/v1/supplier/sales` | Продажи | seller order/sale report; sanitize buyer-related fields if present |
| `READ_SAFE` | `POST` | `/api/v1/analytics/excise-report` | Получить отчёт |  |
| `READ_DERIVED` | `GET` | `/api/v1/warehouse_remains` | Создать отчёт | creates report task via GET |
| `READ_SAFE` | `GET` | `/api/v1/warehouse_remains/tasks/{task_id}/status` | Проверить статус |  |
| `READ_SAFE` | `GET` | `/api/v1/warehouse_remains/tasks/{task_id}/download` | Получить отчёт |  |
| `READ_SAFE` | `GET` | `/api/analytics/v1/measurement-penalties` | Удержания за занижение габаритов упаковки |  |
| `READ_SAFE` | `GET` | `/api/analytics/v1/warehouse-measurements` | Замеры склада |  |
| `READ_SAFE` | `GET` | `/api/analytics/v1/deductions` | Подмены и неверные вложения |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/antifraud-details` | Самовыкупы |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/goods-labeling` | Маркировка товара |  |
| `READ_DERIVED` | `GET` | `/api/v1/acceptance_report` | Создать отчёт | creates report task via GET |
| `READ_SAFE` | `GET` | `/api/v1/acceptance_report/tasks/{task_id}/status` | Проверить статус |  |
| `READ_SAFE` | `GET` | `/api/v1/acceptance_report/tasks/{task_id}/download` | Получить отчёт |  |
| `READ_DERIVED` | `GET` | `/api/v1/paid_storage` | Создать отчёт | creates report task via GET |
| `READ_SAFE` | `GET` | `/api/v1/paid_storage/tasks/{task_id}/status` | Проверить статус |  |
| `READ_SAFE` | `GET` | `/api/v1/paid_storage/tasks/{task_id}/download` | Получить отчёт |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/region-sale` | Получить отчёт |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/brand-share/brands` | Бренды продавца |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/brand-share/parent-subjects` | Родительские категории бренда |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/brand-share` | Получить отчёт |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/banned-products/blocked` | Получить отчёт |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/banned-products/shadowed` | Скрытые из каталога |  |
| `READ_SAFE` | `GET` | `/api/v1/analytics/goods-return` | Получить отчёт |  |

### Документы и бухгалтерия

Source: `https://dev.wildberries.ru/api/swagger/yaml/ru/13-finances.yaml`

| Status | HTTP | Path | Summary | Note |
|---|---|---|---|---|
| `READ_SAFE` | `GET` | `/api/v1/account/balance` | Получить баланс продавца |  |
| `READ_SAFE` | `POST` | `/api/finance/v1/sales-reports/list` | Список отчётов реализации |  |
| `READ_SAFE` | `POST` | `/api/finance/v1/sales-reports/detailed/{reportId}` | Детализации к отчётам реализации по ID отчётов |  |
| `READ_SAFE` | `POST` | `/api/finance/v1/sales-reports/detailed` | Детализации к отчётам реализации за период |  |
| `READ_SAFE` | `POST` | `/api/finance/v1/acquiring/list` | Список отчётов об издержках на приём платежей |  |
| `READ_SAFE` | `POST` | `/api/finance/v1/acquiring/detailed/{reportId}` | Детализации к отчётам об издержках на приём платежей по ID отчётов |  |
| `READ_SAFE` | `POST` | `/api/finance/v1/acquiring/detailed` | Детализации к отчётам об издержках на приём платежей за период |  |
| `READ_SAFE` | `GET` | `/api/v1/documents/categories` | Категории документов |  |
| `READ_SAFE` | `GET` | `/api/v1/documents/list` | Список документов |  |
| `READ_SAFE` | `GET` | `/api/v1/documents/download` | Получить документ |  |
| `READ_SAFE` | `POST` | `/api/v1/documents/download/all` | Получить документы |  |

## Direct PII read surfaces that stay blocked

These 13 methods are intentionally listed rather than omitted so completeness is explicit:

| Category | HTTP | Path | Reason |
|---|---|---|---|
| Общее | `GET` | `/api/v1/users` | seller user names/phones/emails/access data |
| Работа с товарами | `GET` | `/api/v3/dbw/warehouses/{warehouseId}/contacts` | warehouse contact personal data |
| Заказы FBS | `GET` | `/api/v3/passes` | driver/pass identity data |
| Заказы FBS | `POST` | `/api/v3/orders/client` | direct customer identity data |
| Заказы DBW | `POST` | `/api/marketplace/v3/dbw/orders/client` | direct buyer identity data |
| Заказы DBW | `POST` | `/api/v3/dbw/orders/courier` | courier identity/contact data |
| DBS | `POST` | `/api/v3/dbs/orders/client` | direct buyer identity data |
| DBS | `POST` | `/api/marketplace/v3/dbs/orders/b2b/info` | buyer organization identifiers/name |
| Самовывоз | `POST` | `/api/v3/click-collect/orders/client` | direct buyer identity data |
| Самовывоз | `POST` | `/api/v3/click-collect/orders/client/identity` | direct buyer identity verification |
| Общение с покупателями | `GET` | `/api/v1/seller/chats` | buyer chat metadata |
| Общение с покупателями | `GET` | `/api/v1/seller/events` | buyer chat events/messages |
| Общение с покупателями | `GET` | `/api/v1/seller/download/{id}` | buyer chat attachment content |

## Mutations

The same OpenAPI snapshot contains **98 operations classified `MUTATION_BLOCKED`**. They were reviewed as part of the exhaustive 286-operation pass but are not reproduced in this read-only inventory table. Examples include card/price/stock edits, order status transitions, campaign start/pause/stop/delete (including mutating GET methods), campaign bids/budgets, replies/messages, return-claim decisions, and metadata writes.

## Current implementation consequence

This inventory is the authority for the next implementation/currentness patch, together with a fresh live-GitHub read immediately before any production write. It does **not** mean all 175 executable candidates already exist in production v0.1.1. Registry delta and endpoint/method replacements must be applied separately and tested before release.

Dynamic documentation discovery design is separate future work; the current snapshot was obtained without changing the production extension.