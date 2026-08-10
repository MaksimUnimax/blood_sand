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

Результат: top-level `tooling/llm-api-bridges/`, shared protocol и provider directories. Актуальный Wordstat v1.1.5 используется как proven reference lifecycle.

### [ ] 03A.3 — Провести полный официальный API-аудит Ozon

Результат: versioned capability matrix с endpoint/method, auth/scope, data fields, history depth, pagination, rate limit, read/write, usefulness для site/analytics и известными gaps.

### [ ] 03A.4 — Реализовать и acceptance-test Ozon LLM bridge

Результат: локальный read-only bridge, credentials local-only, manual + autorun, exactly-once/recovery, pagination evidence, реальные smoke requests к seller account.

### [ ] 03A.5 — Провести полный официальный API-аудит Wildberries

Результат: такая же capability matrix по актуальному WB API.

### [ ] 03A.6 — Реализовать и acceptance-test Wildberries LLM bridge

Результат: локальный read-only bridge с теми же общими lifecycle/security guarantees и реальными smoke requests.

### [ ] 03A.7 — Выгрузить полный ассортимент и доступные seller facts из Ozon и WB

Собрать прежде всего: identifiers, titles, seller article/SKU, marketplace listing ids, categories/subjects, attributes, media refs, prices/discounts, status, warehouse stock, availability и другие доступные product-level facts.

### [ ] 03A.8 — Построить канонический product-centric data layer

Добавить сущности минимум: Product, SKU/Variant, ProductFamily, Category, MarketplaceAccount, MarketplaceListing, Warehouse, StockSnapshot, Order/Sale observation, Return, Finance observation, AdCampaign/AdProduct observation. Query evidence должен уметь ссылаться на family/category/SKU, а не жить отдельно от ассортимента.

### [ ] 03A.9 — Выполнить cross-platform seller analytics baseline

Получить доступную историческую статистику продаж/заказов/остатков/цен/финансов/рекламы и сформировать первый диагностический baseline. Цель — уметь расследовать падение продаж через причинную цепочку: demand → listing availability → regional stock → ad delivery → traffic → conversion → orders → cancellations/returns → finance.

### [ ] 03A.10 — Re-baseline roadmap 03 по всему ассортименту

Сгруппировать ~70 товаров в реальные категории/product families, определить для каждой семьи seed/root queries и приоритет. Печать Велеса становится одним уже исследованным pilot family. После этого пересчитать объём 03 и только затем возобновить Wordstat, далее 04 SERP/Alice.

## Оценка ранов

До завершения официального API-аудита точная оценка разработки неизвестна. Рабочий диапазон пункта: **15–30 содержательных ранов**, включая два API-аудита, две реализации, реальные acceptance tests, первичный seller ingestion и ассортиментную нормализацию.

## Блокеры

- пользователь создаёт/выдаёт необходимые Ozon и WB API credentials/scopes;
- доступность конкретных API методов зависит от типа кабинета, схемы работы и выданных прав;
- любые write/mutation scopes не являются обязательными для этого этапа и по умолчанию отключены.
