# Ozon Seller API — каталог 303 методов ключа

Дата: 2026-08-25  
Статус: полный фильтр покрытия для последующей реализации; production-код не меняется.

## Проверка полноты

- Источник точного permission surface: `/v1/roles` текущего Seller API ключа.
- Уникальных Seller paths: **303**.
- Строк в каталоге: **303**.
- `PENDING`: **0**.
- Текущий Bridge Seller read aliases: **8**.
- Целевое read-only покрытие после реализации: **228** методов (включая 8 текущих).
- Сознательно исключено: **75**.

### Разбивка решений

- `SUPPORTED`: **8**
- `ADD`: **172**
- `ADD_REDACT`: **34**
- `ADD_REPORT`: **14**
- `NO_WRITE`: **8**
- `NO_PII`: **12**
- `NO_OLD`: **38**
- `NO_CALLBACK`: **1**
- `NO_FILE`: **16**

## Как читать каталог

- `ADD` — добавить как обычный безопасный read.
- `ADD_REDACT` — добавить, но пропускать ответ через строгий allowlist/redaction перед AI.
- `ADD_REPORT` — добавить как явный read-report workflow: создать → отдельной командой проверить → отдельной командой получить.
- `NO_WRITE` — не добавлять, потому что метод меняет состояние кабинета.
- `NO_PII` — не добавлять, потому что метод может раскрыть данные покупателя/контакты/личную переписку.
- `NO_OLD` — не добавлять старую версию; если есть замена, она указана в последнем столбце.
- `NO_CALLBACK` — не добавлять метод, который заставляет Ozon ходить по внешнему URL.
- `NO_FILE` — не передавать через AI-канал операционные PDF/этикетки/штрихкоды/файлы.

## Части каталога

- [OZON_API_METHOD_CATALOG_2026-08-25_PART_01.md](./OZON_API_METHOD_CATALOG_2026-08-25_PART_01.md) — методы 1–51.
- [OZON_API_METHOD_CATALOG_2026-08-25_PART_02.md](./OZON_API_METHOD_CATALOG_2026-08-25_PART_02.md) — методы 52–102.
- [OZON_API_METHOD_CATALOG_2026-08-25_PART_03.md](./OZON_API_METHOD_CATALOG_2026-08-25_PART_03.md) — методы 103–153.
- [OZON_API_METHOD_CATALOG_2026-08-25_PART_04.md](./OZON_API_METHOD_CATALOG_2026-08-25_PART_04.md) — методы 154–204.
- [OZON_API_METHOD_CATALOG_2026-08-25_PART_05.md](./OZON_API_METHOD_CATALOG_2026-08-25_PART_05.md) — методы 205–255.
- [OZON_API_METHOD_CATALOG_2026-08-25_PART_06.md](./OZON_API_METHOD_CATALOG_2026-08-25_PART_06.md) — методы 256–303.

## Premium-family среди этих 303

- `/v1/analytics/data`
- `/v1/analytics/product-queries`
- `/v1/analytics/product-queries/details`
- `/v1/finance/realization/by-day`
- `/v1/product/prices/details`
- `/v1/search-queries/text`
- `/v1/search-queries/top`

Premium не является отдельным кластером. Доступ проверяется существующим capability-путём `/v1/seller/info`; Bridge должен различать «метод есть, но подписка не даёт доступ» и «метода нет».

## Performance API

Четыре существующих read-only alias Performance API не входят в эти 303 Seller paths: `performance_campaigns`, `performance_expense`, `performance_daily`, `performance_campaign_product`. Они остаются в `advertising_performance` и используют отдельный provider/credentials contour.

## Правило актуальности

Фильтр по этим 303 зафиксирован. На этапе кода повторно не решаем, нужен ли метод: сверяем только свежий Ozon-owned request/response contract, лимиты и возможную замену версии после 2026-08-25. Если Ozon позже изменит endpoint, обновляется currentness/replacement metadata, а не вся политика фильтрации.
