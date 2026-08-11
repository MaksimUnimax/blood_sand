# 03A — Режим сбора marketplace-данных до возврата к сайту

Статус: **[~] АКТИВНЫЙ EXECUTION RULE ДЛЯ 03A**  
Дата фиксации: 2026-08-11  
Scope: Ozon → Wildberries → только затем возврат к выводам и проектированию сайта.

## Решение владельца

На текущем этапе задача — **только собрать, сохранить и проверить доступные фактические данные marketplace**.

До завершения сбора по **обоим** marketplace запрещено использовать частичный Ozon-only или WB-only dataset для дальнейших выводов по сайту.

До этого момента не выполняются:

- проектирование окончательных категорий сайта;
- приоритизация SKU/товаров для сайта;
- re-baseline Wordstat;
- новый полный SERP/Alice pass;
- окончательные SEO/content/Page Job решения;
- окончательная коммерческая модель сайта;
- выводы вида «товар хороший/плохой», «категория приоритетная/неприоритетная» только по данным одной площадки.

Разрешены только технические выводы, необходимые для корректного сбора данных: schema/contract validation, pagination, availability, identity joins, currentness, permissions, read/write classification, ошибки/пропуски и качество capture.

## Порядок исполнения

1. Довести Ozon read-only bridge до покрытия данных, необходимых текущему этапу.
2. Через реальный Ozon account собрать полный доступный Ozon dataset.
3. Сохранить raw evidence без перезаписи и отдельно normalized records.
4. Для каждого требуемого слоя либо получить данные, либо явно зафиксировать `UNAVAILABLE / NOT_EXPOSED / CONTRACT_GAP / ACCESS_RESTRICTED` с причиной.
5. После завершения Ozon collection перейти к Wildberries bridge.
6. Довести WB read-only bridge до эквивалентного требуемого покрытия.
7. Собрать и сохранить полный доступный WB dataset теми же правилами.
8. Только после завершения обеих площадок строить cross-platform Product/SKU/Listing/Category master и возвращаться к дальнейшей работе по сайту.

## Что обязательно собрать по Ozon на этом этапе

### Product / listing identity и полный ассортимент

- seller offer/article identity;
- Ozon product/listing identifiers;
- SKU;
- полный доступный список seller listings/products, включая доступные visibility/archive состояния;
- marketplace title/name;
- listing visibility/status/moderation/error facts, где API их отдаёт.

### Category / type / attributes

- `description_category_id`, где current contract его отдаёт;
- `type_id`, где current contract его отдаёт;
- category/type dictionary evidence;
- характеристики/attributes;
- размеры, вес и другие доступные product facts;
- barcodes, если read contract их отдаёт.

### Media / content

- изображения и их доступные identifiers/URLs/ordering facts;
- video/rich-content/description refs только там, где current read API реально их отдаёт;
- отсутствие поля фиксируется как отсутствие, без реконструкции и догадок.

### Price / promotions

- current seller/customer price facts;
- old/card/marketing price semantics, где доступны;
- promotion participation/context;
- seller/Ozon-funded context только если API явно позволяет его определить.

### Stock / availability / geography

- FBO/FBS stock;
- present/reserved и другие доступные stock states;
- warehouse identifiers;
- seller warehouse dictionaries;
- cluster/geography joins, где доступны;
- текущая availability snapshot.

Если исторической истории остатков/цен API не предоставляет, это фиксируется как gap; исторические значения не выдумываются.

### Seller analytics / demand

Собрать реально доступные product/SKU-level metrics и их фактические contracts, включая там, где API позволяет:

- impressions/shows;
- sessions/traffic;
- conversion metrics;
- ordered units/orders;
- revenue;
- другие доступные read-only metrics.

Периоды и granularity сохраняются как часть measurement provenance. Не смешивать разные метрики и периоды в один искусственный показатель.

### Marketplace search evidence

- product queries;
- product query details;
- доступную историю/глубину;
- query ↔ SKU/listing identity links.

### Orders / fulfilment

- FBO postings;
- FBS postings/list/detail в current версиях;
- quantities/status/timestamps/product joins, где доступны;
- без customer PII в LLM/GitHub evidence.

### Returns / cancellations

- returns;
- cancellations;
- reason/status/timestamps/quantities, где доступны;
- partial events сохранять как фактические события, не сворачивая их в неподтверждённую интерпретацию.

### Reviews / questions

- review list/info/count/comment metadata, где доступно;
- question list/info/count/top-SKU, где доступно;
- customer text допускается только в рамках принятой privacy/sanitization policy и без избыточного PII.

### Finance / realization

- current accrual families;
- product/posting joins;
- commissions/services/logistics/other accrual types, где их отдаёт current API;
- realization/settlement evidence;
- generated reports только явными create/status/retrieve операциями, без скрытого polling/fan-out.

Не строить новый слой на deprecated `/v3/finance/transaction/list` как на future target.

### Supply / logistics

- supply order facts;
- replenishment/status evidence;
- warehouse/cluster links;
- доступные read-only logistics facts.

### Advertising

Если официальный Ozon Performance API удаётся authoritative подключить в read-only режиме, собрать:

- campaign list/status/type;
- campaign ↔ product mapping;
- impressions;
- clicks;
- spend;
- CTR/CPC/CPM;
- attributed orders/revenue;
- read-only budget/bid context;
- доступные dimensions.

Если Performance API остаётся недоступен или current contract не подтверждён, фиксируется явный gap; Seller API данными этот слой не подменяется.

## Правило хранения

Канонический поток текущего этапа:

`request/measurement registry → raw marketplace evidence → normalized marketplace records`

До завершения Ozon + WB **derived site conclusions не создаются**.

Обязательные свойства capture:

- raw append-only;
- timestamp/date и precision;
- provider/account contour без secrets;
- operation/path alias;
- request parameters без credentials;
- pagination/cursor/offset state;
- status/error semantics;
- raw response reference;
- normalized record provenance;
- `null`, `0`, `not measured`, `not exposed`, `access denied` и `contract gap` не смешиваются.

## Security rule

`/v1/roles` используется только как capability evidence и **не является security allowlist**.

Наличие path в Ozon role не означает, что bridge имеет право его исполнять.

Начальный bridge остаётся read-only и fail-closed:

- verified READ operation → может быть разрешена;
- MUTATION → блокируется;
- UNKNOWN effect → блокируется до отдельной проверки.

Методы наподобие `cargoes/create`, `cargoes/delete`, `transport/create`, `bind`, `activate` не становятся разрешёнными только потому, что Ozon включает их в read-only role capability list.

## Текущий фактический Ozon checkpoint

Внешний локальный Ozon bridge `v0.1.1` уже прошёл начальный real-account transport acceptance в пользовательском окружении:

- `OZON_API_V1 → OZON_RESULT_V1` работает в том же диалоге;
- `roles` → `POST /v1/roles` → HTTP 200;
- `analytics_data` → `POST /v1/analytics/data` → HTTP 200 на реальных seller data;
- текущая capability-конфигурация после возврата широкого доступа снова включает `Admin read only` и granular read-only roles.

Это **не означает**, что Ozon collection завершён, и не означает, что все необходимые Product Master operations уже реализованы в bridge.

Пока source/package этого runtime не принят в GitHub как governed canonical Ozon extension, существующие утверждения основного 03A-файла о repository implementation status не считаются автоматически закрытыми этой заметкой.

## Критерий завершения текущего Ozon collection pass

Ozon pass считается собранным только когда для каждого обязательного слоя выше выполнено одно из двух:

1. данные реально сняты и сохранены с provenance; или
2. наличие gap/ограничения доказано и явно записано.

После этого без site-analysis переходить к Wildberries.

## Следующее действие

Начать системный Ozon capture с уже работающих read operations и параллельно добавлять только те недостающие read operations, без которых невозможно закрыть обязательные слои этого документа.
