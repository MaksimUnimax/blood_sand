# Ozon Performance API — blocking research gap — 2026-08-11

Статус: **API CONTOUR CONFIRMED / IMPLEMENTATION CONTRACT PENDING / BLOCKING 03A.3**

## 1. Что уже подтверждено Ozon-owned sources

Performance API — не стороннее название и не предположение.

Ozon Seller API notification в сообщении о миграции TLS прямо перечисляет `Seller API, Performance API и другие публичные API Ozon`.

Ozon Реклама — верифицированный канал рекламной платформы Ozon — прямо рекомендует продавцам, которые хотят автоматизировать продвижение, начинать с `Performance API`, и ссылается на вебинар `Внешнее API`, посвящённый автоматизации рекламных кампаний.

Тот же Ozon Реклама ранее сообщал, что изменения логики ставок в `Продвижении в поиске` затрагивают работу в Performance API: старые методы ставок должны становиться deprecated/заменяться новыми.

`dev.ozon.ru` community отдельно показывает категорию `API рекламной платформы`.

Вывод: **существование и актуальность отдельного рекламного API-контура подтверждены**.

## 2. Что нам реально нужно для `blood_sand`

Будущий read-only bridge должен уметь получать evidence минимум по следующим слоям:

1. campaign inventory:
   - campaign id;
   - status;
   - type/tool;
   - date/lifecycle state;
2. campaign → product/SKU mapping;
3. delivery:
   - impressions;
   - clicks;
   - spend;
   - CTR;
   - CPC/CPM where applicable;
4. outcome attribution:
   - orders;
   - units;
   - revenue/sales attributed to promotion;
   - DRR/ACOS-like metrics where exposed;
5. dimensions useful for root-cause analysis:
   - product;
   - day/date;
   - campaign;
   - placement/tool;
   - search/query where exposed;
   - category/region where exposed;
6. read-only context:
   - current budget;
   - strategy/bid state where exposed.

Mutations campaign/bid/budget are explicitly outside initial scope.

## 3. Что текущий research pass НЕ смог подтвердить

Несмотря на Ozon-owned confirmation самого Performance API, текущая индексируемая поверхность не дала authoritative exact method contract для:

- current API host/base URL;
- authentication headers/token flow;
- campaign list endpoint;
- campaign product endpoint;
- statistics request endpoint(s);
- statistics result/download endpoint(s), если используется async report flow;
- exact metric names;
- supported grouping/dimensions;
- period/history limits;
- pagination;
- quotas/rate limits;
- account/role restrictions.

Official `docs.ozon.ru` Seller API library не является заменой: Performance API — отдельный contour. Нужна именно его current Ozon-owned documentation surface.

## 4. Почему сторонние SDK/интеграторы не закрывают gap

Поиск находит сторонние системы, которые утверждают, что получают рекламную статистику через Performance API. Это полезно как evidence того, что practical statistics integration существует, но не подходит как authority для:

- exact current endpoint;
- auth;
- schemas;
- deprecation/currentness;
- limits;
- safety allowlist будущего расширения.

Поэтому ни один сторонний path не переносится в `OZON_READ_ONLY_ALLOWLIST_V1.json`.

## 5. Дополнительное product-level evidence

Ozon Реклама подтверждает, что рекламная аналитика оперирует такими бизнес-метриками, как показы, клики, заказы/продажи, конверсии и ДРР в зависимости от инструмента. Это подтверждает правильность наших требуемых data classes, но **не доказывает, что все эти поля доступны через Performance API конкретными методами**.

Следовательно UI analytics и API capability нельзя автоматически отождествлять.

## 6. Gate

До получения current Ozon-owned Performance API contract:

- `advertising_performance_api.status = pending`;
- `03A.3 = IN PROGRESS`;
- `03A.4 Ozon extension = NOT STARTED`;
- advertising endpoints не добавляются в allowlist;
- scraping рекламного кабинета не используется как fallback.

## 7. Следующая verification target

Нужно получить один из следующих authoritative artifacts:

1. current Ozon Performance API documentation index;
2. Ozon-owned method reference pages;
3. Ozon-owned OpenAPI/Swagger/specification;
4. Ozon-owned current technical material, где явно перечислены host/auth/read methods/statistics contract.

После этого для каждого read method нужно записать: HTTP verb/path, auth, request/response, pagination/async lifecycle, history window, quota/rate limit, account restrictions, deprecation status и business-side-effect classification.
