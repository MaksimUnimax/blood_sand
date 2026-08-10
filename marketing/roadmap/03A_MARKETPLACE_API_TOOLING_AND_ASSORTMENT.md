# 03A — Marketplace API tooling и полный ассортимент

Статус: **[~] В РАБОТЕ — обязательный блокирующий этап перед продолжением 03/04**  
Дата начала: 2026-08-10

## Почему этот пункт добавлен

Текущий Wordstat/SERP research был построен как пилот вокруг референсного семейства «Печать Велеса / автомобильные подвески». Фактический business scope — перенос полного магазина, порядка 70 товаров. Продолжать SERP/Alice/контентную стратегию по одному пилотному семейству означало бы принять пилот за весь ассортимент.

Стратегия AI-Native Hybrid Search Commerce **не меняется**. Перед продолжением стратегии добавляется обязательный инфраструктурный и data-ingestion этап: изучить API маркетплейсов, затем разработать два read-only LLM bridge, получить полный ассортимент и seller evidence, построить product-centric master и только после этого re-baseline поисковое исследование по всему каталогу.

## Жёсткий порядок работ

1. Зафиксировать scope-проблему и остановить старый Wordstat pilot.
2. Сохранить действующий Yandex Wordstat bridge как архитектурный референс.
3. Полностью исследовать официальный Ozon API и зафиксировать доступные read capabilities.
4. Только после завершения исследования Ozon — разработать Ozon browser extension.
5. Исследовать официальный Wildberries API и зафиксировать доступные read capabilities.
6. Только после завершения исследования WB — разработать Wildberries browser extension.
7. Ввести реальные credentials локально и провести real-account acceptance обоих расширений.
8. Выгрузить полный ассортимент и доступную seller-статистику с обеих площадок.
9. Построить единый Product/SKU/Listing/Category master и product-centric data layer.
10. Получить seller analytics baseline и затем re-baseline roadmap 03 по всему ассортименту.

**Важно:** на текущем этапе Ozon и WB расширений ещё нет. Их разработка — будущие отдельные шаги 03A.4 и 03A.6. Нельзя считать design-документы, API matrices или mock/prototype code готовым расширением.

## Критерий завершения 03A

Пункт закрывается только когда одновременно:

- текущий Yandex Wordstat bridge сохранён как reference tooling;
- официальный read-only API surface Ozon исследован в объёме, достаточном для ассортимента и seller analytics;
- разработан и real-account acceptance-tested read-only Ozon bridge;
- официальный read-only API surface Wildberries исследован в объёме, достаточном для ассортимента и seller analytics;
- разработан и real-account acceptance-tested read-only Wildberries bridge;
- получен полный доступный ассортимент продавца с обеих площадок;
- создан канонический Product/SKU/Listing/Category master с cross-platform identity mapping;
- определены product families/categories для семантического исследования;
- исследовательская schema расширена product-centric сущностями;
- roadmap 03 re-baselined по полному ассортименту.

До выполнения этого gate дальнейший Wordstat/SERP/Alice research нельзя считать полным брендовым исследованием.

## Конкретные шаги

### [x] 03A.1 — Зафиксировать проблему scope и остановить дальнейшие Wordstat API-вызовы

Пилотный Wordstat остаётся evidence. Root set остановлен на 13/14 и не считается полным исследованием бренда. Последний старый root не запускается до re-baseline полного ассортимента.

### [~] 03A.2 — Создать toolkit structure и сохранить актуальный Yandex reference

Сделано:

- создан `tooling/llm-api-bridges/`;
- созданы provider-директории `yandex-wordstat/`, `ozon-seller/`, `wildberries/` и `shared/`;
- создан общий design contract `shared/LLM_API_BRIDGE_PROTOCOL.md`;
- предоставленный владельцем Wordstat v1.1.5 закреплён как canonical reference;
- исходный предоставленный ZIP ранее проверен: version `1.1.5`, SHA-256 `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`, regression `283/283 PASS`.

Остаётся до `[x]`: физически сохранить проверяемое executable/source representation действующего Yandex bridge внутри repository без изменения исходного поведения и зафиксировать provenance.

### [~] 03A.3 — Полный официальный API-аудит Ozon

Текущие исследовательские артефакты:

- `tooling/llm-api-bridges/ozon-seller/OZON_API_CAPABILITY_AUDIT_2026-08-10.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_OFFICIAL_REVALIDATION_2026-08-10.md` — свежая повторная official-source сверка;
- `tooling/llm-api-bridges/ozon-seller/OZON_READ_ONLY_ALLOWLIST_V1.json` — исследовательский machine-readable список подтверждённых read methods, не implementation code.

Повторно подтверждены официальными Ozon-источниками:

- public API only: scraping кабинета/непубличных Ozon surfaces не использовать;
- Seller API host/auth contour: `api-seller.ozon.ru`, `Client-Id` + `Api-Key`;
- current stock family: `POST /v4/product/info/stocks`;
- seller/product analytics: `POST /v1/analytics/data`;
- query analytics: `POST /v1/analytics/product-queries` и `/details`;
- FBO postings: `/v3/posting/fbo/list`;
- FBS posting detail: `/v3/posting/fbs/get`;
- finance transactions: `/v3/finance/transaction/list`;
- FBO supply: `/v3/supply-order/get` и `/v1/supply-order/details`;
- отдельное существование advertising API contour.

Важно: старый Ozon example использует `/v3/product/info/stocks`; current official evidence 2025 подтверждает `/v4/product/info/stocks`, поэтому будущая разработка не должна копировать старую v3 ручку из historical example.

Шаг остаётся `[~]`. Повторная попытка открыть official interactive Seller API library `https://docs.ozon.ru/api/seller/` в research environment снова дала redirect loop. Поэтому ещё нужно снять current exact read surface и schemas для:

- полного catalog/listing master;
- prices/discounts/promotions;
- returns/cancellations/claims;
- reports/realization/settlement;
- warehouses/geography/delivery availability;
- advertising campaign/product/statistics methods и auth/hosts;
- reviews/questions/buyer communications;
- current per-method pagination, limits, history windows и account/Premium restrictions.

До закрытия этого gap **03A.4 не начинать** и неподтверждённые endpoints не выдумывать.

### [ ] 03A.4 — Разработать Ozon LLM browser extension

**НЕ НАЧАТО. Ozon extension сейчас не существует.**

Начать только после достаточного закрытия 03A.3.

Планируемые требования:

- использовать действующий Yandex Wordstat bridge как lifecycle/reference, а не переписывать механику вслепую;
- локальное хранение `Client-Id` + `Api-Key`, секреты не передаются LLM и не коммитятся в GitHub;
- read-only hard allowlist только подтверждённых официальных операций;
- `OZON_API_V1 → OZON_RESULT_V1`;
- Manual и Autorun;
- одна принятая команда = один явный API request;
- без скрытых retries/fan-out/pagination loops;
- exactly-once ownership/recovery и fail-closed behavior;
- затем static tests, browser tests, fresh-package tests и только после этого real-account acceptance с ключами владельца.

### [x] 03A.5 — Официальный API-аудит Wildberries для будущего read-only bridge

Исследовательские артефакты:

- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_AUDIT_2026-08-10.md`;
- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md` — current corrections имеют приоритет при конфликте со старой формулировкой audit;
- `tooling/llm-api-bridges/wildberries/READ_ONLY_OPERATION_MATRIX_V1.md`.

Для будущего bridge исследованы необходимые read-классы: cards/catalog, prices/discounts, seller warehouses/FBS stock, WB warehouse remains, sales funnel, generated analytics reports, FBS orders, finance/realization, promotion campaigns/statistics и promotions calendar.

Fresh 2026 revalidation выявила обязательные current corrections:

- auth: `Authorization: Bearer <token>`; Service/Basic flow может дополнительно требовать `X-Client-Secret`;
- cards master: `POST content-api.wildberries.ru/content/v2/get/cards/list` + отдельный trash list, cursor pagination >100;
- prices: `GET discounts-prices-api.wildberries.ru/api/v2/list/goods/filter`, `limit <= 1000` + offset;
- seller warehouses: `GET marketplace-api.wildberries.ru/api/v3/warehouses`;
- FBS inventory: `POST marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}`;
- старый `GET statistics-api.../api/v1/supplier/stocks` помечен deprecated/к удалению; current WB warehouse remains строится через async `seller-analytics-api ... /api/v1/warehouse_remains` task/status/download flow;
- FBS orders: `GET /api/v3/orders/new`, `GET /api/v3/orders`, `POST /api/v3/orders/status`; list period максимум 30 календарных дней одним запросом;
- критично: старый `GET /api/v5/supplier/reportDetailByPeriod` был объявлен к отключению 2026-07-15 и не должен использоваться будущим bridge;
- current finance replacement: `POST finance-api.wildberries.ru/api/finance/v1/sales-reports/list`, `/detailed`, `/detailed/{reportId}`; отдельные acquiring report methods также существуют;
- sales funnel current family: `/api/analytics/v3/sales-funnel/...`; generated CSV flow используется для более длинных периодов и имеет собственные ограничения/Jam requirements;
- promotion API имеет отдельный contour; promotions calendar использует `dp-calendar-api.wildberries.ru` и Prices & Discounts category.

Deprecated endpoints не использовать. Перед coding/release каждый фактически используемый endpoint повторно сверяется с актуальной официальной документацией/release notes.

### [ ] 03A.6 — Разработать Wildberries LLM browser extension

**НЕ НАЧАТО. Wildberries extension сейчас не существует.**

Начать отдельным этапом после API research.

Планируемые требования:

- локальное хранение WB token(s) с учётом реальных category/scope/token-type requirements;
- read-only hard allowlist;
- `WB_API_V1 → WB_RESULT_V1`;
- Manual и Autorun;
- одна принятая команда = один явный API request;
- без скрытых retries и неограниченной автоматической pagination;
- точно контролируемая обработка JSON и generated/binary reports;
- secrets никогда не попадают в LLM result/log;
- lifecycle/exactly-once/recovery по Yandex reference;
- затем static/browser/package tests и real-account acceptance.

### [ ] 03A.7 — Real-account acceptance Ozon и Wildberries

После разработки владелец вводит credentials только локально в popup соответствующего расширения. В чат и GitHub ключи не отправляются.

Нужно подтвердить реальные account permissions/scopes, response schemas, rate limits, pagination, доступную глубину истории, платные/Jam/Premium ограничения и отсутствие утечки секретов.

### [ ] 03A.8 — Выгрузить полный ассортимент и доступные seller facts из Ozon и WB

После real-account acceptance собрать по всему магазину identifiers, seller article/SKU, marketplace listing IDs, titles, categories/subjects, variants, attributes, media refs, prices/discounts, listing state, warehouses/stocks/availability и другие доступные product-level facts.

Цель — получить весь фактический ассортимент, а не работать только с «Печатью Велеса».

### [ ] 03A.9 — Построить канонический product-centric data layer

Добавить сущности минимум: Product, SKU/Variant, ProductFamily, Category, MarketplaceAccount, MarketplaceListing, Warehouse, StockSnapshot, Order/Sale observation, Return, Finance observation, AdCampaign/AdProduct observation.

Query evidence должен ссылаться на family/category/SKU, а не жить отдельно от ассортимента.

### [ ] 03A.10 — Выполнить cross-platform seller analytics baseline

Получить доступную историческую статистику продаж/заказов/остатков/цен/финансов/рекламы и сформировать первый diagnostic baseline.

Цель — уметь расследовать изменение продаж через цепочку:

`demand → listing eligibility → price/promo → regional/warehouse stock → ad delivery → traffic → funnel → orders → cancellations/returns → replenishment → finance`.

### [ ] 03A.11 — Re-baseline roadmap 03 по всему ассортименту

Сгруппировать порядка 70 товаров в реальные categories/product families, определить seed/root queries и приоритет для каждой семьи. «Печать Велеса» становится одним уже исследованным pilot family.

Только после этого возобновить Wordstat и затем перейти к 04 SERP/Alice уже как к исследованию полного бренда.

## Блокеры / правила

- Ozon/WB credentials вводятся только локально после разработки соответствующего расширения;
- до 03A.4 и 03A.6 никаких утверждений о существовании Ozon/WB extension быть не должно;
- фактические API capabilities зависят от типа кабинета, token scopes/categories, token type, подписок и account permissions;
- write/mutation operations не являются частью initial bridges и остаются запрещёнными до отдельного решения;
- API research и extension development — разные этапы и не должны смешиваться в статусах roadmap.
