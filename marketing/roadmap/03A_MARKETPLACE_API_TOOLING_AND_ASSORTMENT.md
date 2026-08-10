# 03A — Marketplace API tooling и полный ассортимент

Статус: **[~] В РАБОТЕ — обязательный блокирующий этап перед продолжением 03/04**  
Дата начала: 2026-08-10

## Почему этот пункт добавлен

Текущий Wordstat/SERP research был построен как пилот вокруг референсного семейства «Печать Велеса / автомобильные подвески». Фактический бизнес-scope — перенос полного магазина, порядка 70 товаров. Продолжать SERP/Alice/контентную стратегию по одному пилотному семейству означало бы принять пилот за весь ассортимент.

Стратегия AI-Native Hybrid Search Commerce **не меняется**. Меняется полнота входных данных и объект исследования: от одного reference family к полному брендовому каталогу.

## Критерий завершения

Пункт закрывается только когда одновременно:

- текущий Yandex Wordstat bridge сохранён как reference tooling;
- создан и acceptance-tested read-only Ozon bridge;
- создан и acceptance-tested read-only Wildberries bridge;
- получен полный доступный ассортимент продавца с обеих площадок;
- создан канонический Product/SKU/Listing/Category master с cross-platform identity mapping;
- определены product families/categories для семантического исследования;
- исследовательская schema расширена product-centric сущностями;
- roadmap 03 re-baselined по полному ассортименту;
- дальнейший Wordstat/SERP/Alice research запрещён как «полный брендовый» до выполнения этого gate.

## Конкретные шаги

### [x] 03A.1 — Зафиксировать проблему scope и остановить дальнейшие Wordstat API-вызовы

Результат: пилотный Wordstat остаётся evidence; текущий root set имеет 13/14, но не считается полным исследованием бренда. Autorun остановлен оператором.

### [~] 03A.2 — Создать общий LLM↔API toolkit и импортировать актуальный Yandex reference

Сделано:

- создан `tooling/llm-api-bridges/`;
- создан общий архитектурный контракт `shared/LLM_API_BRIDGE_PROTOCOL.md`;
- предоставленный владельцем Wordstat v1.1.5 зафиксирован как canonical reference в `yandex-wordstat/CANONICAL_REFERENCE_1.1.5.md`;
- исходный предоставленный ZIP повторно проверен: version `1.1.5`, SHA-256 `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`, regression `283/283 PASS`.

Остаётся до `[x]`: физически сохранить/материализовать executable artifact/source representation внутри repository и доказать восстановление byte-for-byte до того же ZIP/hash.

### [~] 03A.3 — Провести полный официальный API-аудит Ozon

Артефакт:

- `tooling/llm-api-bridges/ozon-seller/OZON_API_CAPABILITY_AUDIT_2026-08-10.md`

Уже подтверждены официальными источниками и внесены в first read-only provider core:

- product stocks;
- general analytics;
- product search-query analytics;
- FBO/FBS postings;
- finance transaction list;
- FBO supply order/details.

Также подтверждён отдельный advertising API contour.

Почему шаг ещё не `[x]`: официальный интерактивный Seller API library/Swagger в текущем research environment попадает в redirect loop. Поэтому exact current methods/schemas для полного product catalog, prices/promotions, returns, realization/reports, seller warehouse/geography и advertising endpoint set не выдумываются и должны быть дополнительно сняты из доступного official library snapshot/live docs.

### [~] 03A.4 — Реализовать и acceptance-test Ozon LLM bridge

Сделано:

- `ozon-seller/provider/ozon_protocol.js`;
- `OZON_API_V1 → OZON_RESULT_V1`;
- symbolic allowlist only;
- fixed `api-seller.ozon.ru` host;
- read-only aliases только для уже подтверждённых official methods;
- `Client-Id` + `Api-Key` добавляются worker/provider layer, а не LLM command;
- arbitrary URL/host/headers/method/credentials injection запрещены;
- Unicode command/result поддерживается;
- evidence-redaction не возвращает credentials.

Provider core входит в общий security regression `shared/tests/provider_protocols.test.mjs`.

Остаётся: browser extension runtime/popup/manual/autorun/exactly-once/durable recovery, completion Ozon allowlist после 03A.3, packaged Chromium tests и real seller-account smoke requests.

### [x] 03A.5 — Провести полный официальный API-аудит Wildberries для initial read-only bridge

Артефакт:

- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_AUDIT_2026-08-10.md`

Официально подтверждены необходимые для первой read-only версии поверхности:

- cards/catalog identity;
- categories/subjects/attributes reference layer;
- prices/discounts/quarantine;
- seller warehouses + FBS stock;
- WB stock analytics/history;
- sales funnel;
- search-query analytics;
- generated analytics CSV;
- FBS orders;
- region/brand/hidden-product/return reports;
- finance/realization;
- promotion campaigns, products, cluster stats, campaign stats and promotion calendar;
- отдельные optional feedback/question/chat/return domains для будущего content/customer evidence.

Зафиксированы token categories, official API domains, Jam restrictions where documented, known date/history windows and deprecated endpoints that must not be used for new bridge.

Правило: каждый alias всё равно revalidated against current official OpenAPI непосредственно перед production coding/release, потому что WB активно заменяет/deprecates methods.

### [~] 03A.6 — Реализовать и acceptance-test Wildberries LLM bridge

Сделано:

- `wildberries/provider/wb_protocol.js`;
- `WB_API_V1 → WB_RESULT_V1`;
- fixed host aliases по official WB domains;
- operation → fixed host/method/path/credential-category mapping;
- Content / Prices / Marketplace / Analytics / Promotion / Finance credential slots;
- typed path params, которые не позволяют path injection;
- arbitrary URL/host/headers/method/token injection запрещены;
- только READ aliases;
- binary analytics download явно маркируется как binary response;
- Jam restriction маркируется в operation metadata.

Ozon+WB provider-core regression:

- `11/11 PASS`;
- `node --check` обоих provider protocol modules — PASS;
- live GitHub blob SHA provider files и теста совпали с байтами, на которых выполнен этот regression.

Остаётся: browser extension runtime/popup/manual/autorun/exactly-once/durable recovery, expanded alias validation schemas, packaged Chromium tests и real WB-account smoke requests.

### [ ] 03A.7 — Выгрузить полный ассортимент и доступные seller facts из Ozon и WB

Собрать прежде всего: identifiers, titles, seller article/SKU, marketplace listing ids, categories/subjects, attributes, media refs, prices/discounts, status, warehouse stock, availability и другие доступные product-level facts.

### [ ] 03A.8 — Построить канонический product-centric data layer

Добавить сущности минимум: Product, SKU/Variant, ProductFamily, Category, MarketplaceAccount, MarketplaceListing, Warehouse, StockSnapshot, Order/Sale observation, Return, Finance observation, AdCampaign/AdProduct observation. Query evidence должен уметь ссылаться на family/category/SKU, а не жить отдельно от ассортимента.

### [ ] 03A.9 — Выполнить cross-platform seller analytics baseline

Получить доступную историческую статистику продаж/заказов/остатков/цен/финансов/рекламы и сформировать первый диагностический baseline. Цель — уметь расследовать падение продаж через причинную цепочку: demand → listing availability → regional stock → ad delivery → traffic → conversion → orders → cancellations/returns → finance.

### [ ] 03A.10 — Re-baseline roadmap 03 по всему ассортименту

Сгруппировать ~70 товаров в реальные категории/product families, определить для каждой семьи seed/root queries и приоритет. Печать Велеса становится одним уже исследованным pilot family. После этого пересчитать объём 03 и только затем возобновить Wordstat, далее 04 SERP/Alice.

## Оценка ранов

После первого официального API-аудита диапазон **15–30 содержательных ранов** остаётся рабочим. Основная неопределённость теперь не в доступности данных WB, а в completion Ozon exact library surface, browser-extension parity с proven Wordstat lifecycle, real-account acceptance и последующем cross-platform ingestion.

## Блокеры

- пользователь создаёт/выдаёт необходимые Ozon и WB API credentials/scopes;
- доступность конкретных API методов зависит от типа кабинета, схемы работы, подписки и выданных прав;
- Ozon official interactive Seller API library должен стать доступен для completion exact endpoint/schema audit;
- любые write/mutation scopes не являются обязательными для этого этапа и по умолчанию отключены.
