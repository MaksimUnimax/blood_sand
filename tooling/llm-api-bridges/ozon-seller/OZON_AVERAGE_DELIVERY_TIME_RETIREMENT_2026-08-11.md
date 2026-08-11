# Ozon Seller API — retirement of Average Delivery Time analytics — 2026-08-11

Статус: **CURRENT CORRECTION / DO NOT TARGET**

## Что исправляется

Ранний research-pass пометил следующие Seller API methods как current logistics/quality-diagnostics targets, потому что Ozon обновлял их описания 2026-03-17:

- `/v1/analytics/average-delivery-time`;
- `/v1/analytics/average-delivery-time/details`;
- `/v1/analytics/average-delivery-time/summary`.

Более позднее Ozon-owned уведомление 2026 года имеет приоритет: Ozon сообщил об отключении методов функционала «Среднее время доставки» и прямо указал, что сам функционал полностью отключён, а методы удаляются из документации.

Official article locator:

- `https://dev.ozon.ru/news/698-Otkliuchenie-metodov-funktsionala-Srednee-vremia-dostavki-v-Seller-API/`

Notification source:

- verified `Ozon Seller API notification` changelog (`https://t.me/s/OzonSellerAPI`).

Прямой рендер статьи в текущей research environment недоступен из-за того же redirect-loop, который блокирует другие `dev.ozon.ru/docs.ozon.ru` surfaces. Поэтому этот correction фиксирует только то, что прямо сообщает Ozon notification; детали, которых notification не раскрывает, не реконструируются.

## Current disposition

Все три метода переводятся в:

- `DISABLED / DO NOT TARGET 03A.4`;
- не входят в current read candidate set;
- не могут быть fallback для logistics diagnostics;
- replacement **NOT CONFIRMED**.

Нельзя считать более раннее мартовское обновление описаний доказательством текущей доступности после последующего отключения функционала.

## Что остаётся для logistics diagnostics

Current research contour по-прежнему содержит отдельные read families для:

- seller connection to Ozon Logistics;
- seller warehouse configuration;
- warehouse-level stock;
- delivery methods;
- carriage/shipment configuration;
- clusters/geography;
- postings/orders.

Корректная текущая dependency chain после correction:

`seller logistics connection`
→ `warehouse`
→ `SKU stock by warehouse`
→ `delivery method`
→ `carriage/shipment availability`
→ `cluster/geography`
→ `posting/order outcome`.

Отдельный current read surface, заменяющий отключённый Average Delivery Time analytics для delivery-quality metrics, **не подтверждён**. Если delivery-date/quality evidence присутствует в current posting methods или другом Ozon-owned API, оно должно быть подтверждено отдельно по current contract перед включением в будущий bridge.

## Architecture impact

- не создавать compatibility command для отключённых методов;
- не скрывать отсутствие replacement автоматическим fan-out по posting methods;
- не скрапить кабинет как замену API;
- future provider должен возвращать явный `unsupported/unavailable` для retired operation family, если пользователь запросит её напрямую;
- 03A.3 остаётся открытым до закрытия остальных blocking contracts.
