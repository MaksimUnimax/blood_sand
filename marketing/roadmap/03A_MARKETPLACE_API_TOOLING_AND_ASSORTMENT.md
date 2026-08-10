# 03A — Marketplace API tooling и полный ассортимент

Статус: **[~] В РАБОТЕ — обязательный блокирующий этап перед продолжением 03/04**  
Дата начала: 2026-08-10

## Почему этот пункт добавлен

Текущий Wordstat/SERP research был построен как пилот вокруг референсного семейства «Печать Велеса / автомобильные подвески». Фактический business scope — перенос полного магазина, порядка 70 товаров. Продолжать SERP/Alice/контентную стратегию по одному пилотному семейству означало бы принять пилот за весь ассортимент.

Стратегия AI-Native Hybrid Search Commerce **не меняется**. Меняется полнота входных данных и объект исследования: от одного reference family к полному брендовому каталогу.

## Критерий завершения

Пункт закрывается только когда одновременно:

- текущий Yandex Wordstat bridge сохранён как reference tooling;
- создан и real-account acceptance-tested read-only Ozon bridge;
- создан и real-account acceptance-tested read-only Wildberries bridge;
- получен полный доступный ассортимент продавца с обеих площадок;
- создан канонический Product/SKU/Listing/Category master с cross-platform identity mapping;
- определены product families/categories для семантического исследования;
- исследовательская schema расширена product-centric сущностями;
- roadmap 03 re-baselined по полному ассортименту;
- дальнейший Wordstat/SERP/Alice research запрещён как «полный брендовый» до выполнения этого gate.

## Конкретные шаги

### [x] 03A.1 — Зафиксировать проблему scope и остановить дальнейшие Wordstat API-вызовы

Пилотный Wordstat остаётся evidence; root set остановлен на 13/14 и не считается полным исследованием бренда. Последний старый root не запускается до re-baseline полного ассортимента.

### [~] 03A.2 — Создать общий LLM↔API toolkit и импортировать актуальный Yandex reference

Сделано:

- создан `tooling/llm-api-bridges/`;
- создан общий контракт `shared/LLM_API_BRIDGE_PROTOCOL.md`;
- предоставленный владельцем Wordstat v1.1.5 закреплён как canonical reference;
- exact uploaded ZIP повторно проверен: version `1.1.5`, SHA-256 `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`, regression `283/283 PASS`.

Остаётся до `[x]`: сохранить executable Wordstat artifact/source representation внутри repository и доказать byte-for-byte reconstruction до того же hash.

### [~] 03A.3 — Провести полный официальный API-аудит Ozon

Артефакт:

- `tooling/llm-api-bridges/ozon-seller/OZON_API_CAPABILITY_AUDIT_2026-08-10.md`

Официально подтверждены и уже allowlisted в provider core:

- product stocks;
- general seller/product analytics;
- product search-query analytics;
- FBO/FBS postings;
- finance transaction list;
- FBO supply order/details.

Подтверждён отдельный advertising API contour.

Шаг остаётся `[~]`: текущий official interactive Seller API library/Swagger недоступен из research environment из-за redirect loop. Поэтому exact current read methods/schemas для полного catalog, prices/promotions, returns, realization/reports, warehouse/geography и advertising surface не выдумываются и должны быть завершены по доступному official snapshot/live docs.

### [~] 03A.4 — Реализовать и acceptance-test Ozon LLM bridge

Сделано:

- `OZON_API_V1 → OZON_RESULT_V1`;
- symbolic hard allowlist; assistant не передаёт raw URL/host/method/headers;
- `Client-Id` + `Api-Key` существуют только local worker/provider path;
- read-only provider core;
- общий exactly-once transport;
- durable operation model и execution core;
- concurrent duplicate fence;
- no hidden retry on 429/network/timeout;
- old-session `requesting` после worker restart → `REQUEST_OUTCOME_UNKNOWN`, no replay;
- committed `delivering` recovery без повторного Ozon request;
- tab ownership/rebind protection;
- Manual + Autorun + Pause/Resume/Finish browser-extension candidate собран;
- source candidate: manifest v3 / version `0.1.0`, JS syntax PASS;
- full real Chromium MV3 mocked lifecycle PASS;
- Manual: 1 accepted command → exactly 1 mock Seller API request;
- Autorun: 2 sequential commands → exactly 2 additional requests, `sequence=2`;
- Pause → Resume → Finish PASS;
- fresh ZIP extraction byte-compare: `13/13` files identical;
- полный Chromium lifecycle повторён **из clean extracted fresh ZIP**: PASS;
- candidate ZIP SHA-256: `5a50cbd79d0e5710d40410d921a189af602dbe337add07c50d36270b8270d2ac`.

Evidence:

- `tooling/llm-api-bridges/ozon-seller/ACCEPTANCE_CANDIDATE_0.1.0.md`

Почему ещё не `[x]`:

- real Ozon Seller credentials/account не тестировались;
- Ozon exact API audit ещё не полностью закрыт;
- real response schemas, account permissions, pagination/rate-limit behaviour не подтверждены.

### [x] 03A.5 — Провести официальный API-аудит Wildberries для initial read-only bridge

Артефакты:

- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_AUDIT_2026-08-10.md`;
- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md` — текущие точечные corrections имеют приоритет при конфликте со старой формулировкой audit.

Для initial read-only bridge подтверждены: cards/catalog, product reference data, prices/discounts/quarantine, seller warehouses/FBS stock, stock analytics/history, sales funnel, search-query analytics, generated analytics CSV, FBS orders, regional/return reports, finance/realization, promotion campaigns/products/query-cluster/campaign stats и promotions calendar.

Перед browser acceptance дополнительно перепроверены и исправлены:

- `Authorization: Bearer <token>`;
- promotions calendar → `dp-calendar-api.wildberries.ru`;
- calendar credential category → Prices and Discounts;
- finance `reportId` → decimal int64-only path parameter.

Deprecated endpoints не используются как основа нового bridge. Каждый alias всё равно revalidated непосредственно перед production release.

### [~] 03A.6 — Реализовать и acceptance-test Wildberries LLM bridge

Сделано:

- `WB_API_V1 → WB_RESULT_V1`;
- fixed official host aliases and credential-category mapping;
- Bearer auth worker-side only;
- typed path params/path traversal rejection;
- read-only allowlist;
- общий exactly-once transport + durable runtime/execution core;
- binary analytics download явно отделён от JSON result;
- Jam restriction маркируется в operation metadata;
- shared provider protocol/transport/runtime/execution regression после current corrections: **38/38 PASS**;
- full real Chromium MV3 mocked lifecycle PASS;
- popup `/ping` → one mock request with exact Bearer header;
- Manual `cards_list` → exactly 1 request;
- Autorun `cards_list` + `sales_funnel_products` → exactly 2 requests, `sequence=2`;
- Pause → Resume → Finish PASS;
- total mock API calls = 4 (`ping + Manual + 2 Autorun`), duplicates = 0;
- fresh ZIP source/extracted byte compare `13/13`;
- full lifecycle повторён **из clean extracted fresh ZIP**: PASS;
- candidate ZIP SHA-256: `612f0509003ef6bdbdba565d377ac61a29e2b361bb20bca9bf04e51b53b1b989`.

Evidence:

- `tooling/llm-api-bridges/wildberries/ACCEPTANCE_CANDIDATE_0.1.0.md`

Почему ещё не `[x]`:

- real WB token/account не тестировались;
- фактически доступные token categories и Jam entitlement неизвестны;
- real pagination/rate limits/binary generated reports ещё не проверены.

### [ ] 03A.7 — Выгрузить полный ассортимент и доступные seller facts из Ozon и WB

После real-account acceptance собрать identifiers, titles, seller article/SKU, marketplace listing IDs, categories/subjects, variants, attributes, media refs, prices/discounts, listing state, warehouses/stocks/availability и другие доступные product-level facts.

### [ ] 03A.8 — Построить канонический product-centric data layer

Добавить сущности минимум: Product, SKU/Variant, ProductFamily, Category, MarketplaceAccount, MarketplaceListing, Warehouse, StockSnapshot, Order/Sale observation, Return, Finance observation, AdCampaign/AdProduct observation. Query evidence должен ссылаться на family/category/SKU, а не жить отдельно от ассортимента.

### [ ] 03A.9 — Выполнить cross-platform seller analytics baseline

Получить доступную историческую статистику продаж/заказов/остатков/цен/финансов/рекламы и сформировать первый diagnostic baseline. Цель: расследовать падение продаж через причинную цепочку `demand → listing eligibility → price/promo → regional/warehouse stock → ad delivery → traffic → funnel → orders → cancellations/returns → replenishment → finance`.

### [ ] 03A.10 — Re-baseline roadmap 03 по всему ассортименту

Сгруппировать ~70 товаров в реальные categories/product families, определить seed/root queries и приоритет для каждой семьи. «Печать Велеса» становится одним уже исследованным pilot family. Только после этого возобновить Wordstat и затем 04 SERP/Alice.

## Текущий технический regression baseline

Общий provider protocol + transport + durable runtime/execution suite: **38/38 PASS**.

Mocked Chromium используется только для доказательства lifecycle/exactly-once/security mechanics и не подменяет real marketplace account acceptance.

## Блокеры

- владелец создаёт и вводит Ozon/WB credentials **только в local extension popup, не в чат и не в GitHub**;
- фактические API capabilities зависят от типа кабинета, token scopes/categories, subscription/Jam и account permissions;
- completion Ozon exact official API surface ещё нужен;
- write/mutation operations не являются частью initial bridge и остаются запрещёнными.
