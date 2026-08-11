# Ozon Performance API — blocking research gap — 2026-08-11

Статус: **API CONTOUR CONFIRMED / OFFICIAL DOC ROOT IDENTIFIED / IMPLEMENTATION CONTRACT PENDING / BLOCKING 03A.3**

## 1. Что уже подтверждено Ozon-owned sources

Performance API — отдельный публичный Ozon API для автоматизации рекламных процессов.

Evidence:

- `Ozon Seller API notification` прямо перечисляет `Seller API, Performance API и другие публичные API Ozon`;
- верифицированный канал `Ozon Реклама` рекомендует продавцам начинать автоматизацию продвижения с Performance API;
- Ozon Реклама проводил отдельный вебинар `Внешнее API`, посвящённый автоматизации рекламных кампаний;
- Ozon Реклама отдельно сообщал, что изменения ставок в `Продвижении в поиске` затрагивают Performance API и приводят к deprecation/replacement API methods;
- `dev.ozon.ru` community имеет отдельную категорию `API рекламной платформы`.

Conclusion: **существование и актуальность advertising API contour подтверждены**.

## 2. Official documentation root найден

Discovery pass выявил точный Ozon-owned documentation root:

- `https://docs.ozon.ru/api/performance/`

Прямое открытие этого exact official URL в текущем web runtime возвращает `400 Redirect loop detected`. Независимая попытка получить тот же Ozon URL из container runtime не дошла до HTTP из-за DNS failure этой среды.

Следовательно проблема сейчас не в неизвестном адресе документации, а в том, что current execution environment не может получить её authoritative contents.

## 3. Что нам нужно для `blood_sand`

Future read-only bridge должен получить evidence минимум по:

1. campaign inventory:
   - campaign id;
   - status;
   - type/tool;
   - lifecycle/dates;
2. campaign → product/SKU mapping;
3. delivery:
   - impressions;
   - clicks;
   - spend;
   - CTR;
   - CPC/CPM where applicable;
4. attributed outcome:
   - orders;
   - units;
   - revenue/sales;
   - DRR/ACOS-like metrics where exposed;
5. diagnostic dimensions:
   - product;
   - day/date;
   - campaign;
   - placement/tool;
   - query/search where exposed;
   - category/region where exposed;
6. read-only context:
   - budget;
   - strategy/bid state where exposed.

Campaign/bid/budget mutations are outside initial scope.

## 4. Third-party discovery hints — NOT AUTHORITY / NOT ALLOWLIST

A current documentation index that states it mirrors `https://docs.ozon.ru/api/performance/` exposes candidate contract hints. They are preserved here **only so a later official-doc pass knows what exact strings to verify**.

Unverified discovery candidates include:

- possible host: `api-performance.ozon.ru`;
- possible auth shape: Bearer/service-account credentials;
- campaign family candidate: `GET /api/client/campaign`;
- statistics candidates:
  - `POST /api/client/statistics/json`;
  - `GET /api/client/statistics/{UUID}`;
  - `GET /api/client/statistics/report`;
  - `GET /api/client/statistics/list`;
  - `GET /api/client/statistics/externallist`;
  - `GET /api/client/statistics/campaign/product`;
- product mapping candidate: `/campaign/{campaignId}/products` family.

**None of these candidates is promoted to `OZON_READ_ONLY_ALLOWLIST_V1.json`.**

Why: project source policy requires current Ozon-owned contract confirmation. Mirrored snippets can be stale, can collapse multiple versions and do not provide a reliable deprecation/currentness boundary.

## 5. Independent corroboration — also NOT Ozon authority

Current Yandex-owned integration documentation for Ozon Performance API tells Ozon sellers to create Performance API credentials and supplies `Client ID` + `Client Secret` to the integration.

This is useful corroboration that a service-account credential model exists, but it is **not used to establish Ozon endpoint/auth contract** because the project requires Ozon-owned authority for provider implementation.

## 6. Business metrics definitely exist in Ozon advertising analytics, API exposure not assumed

Ozon Реклама current materials discuss campaign analytics with business metrics such as:

- impressions;
- clicks;
- orders/sales;
- conversion;
- DRR;
- campaign/tool-level breakdowns.

This confirms that our desired diagnostic data classes are product-relevant. It does **not** prove that every UI metric is exposed via Performance API or under the discovery candidate methods above.

UI capability ≠ API contract.

## 7. Current exact gap

Authoritative Ozon method contracts are still missing for:

- current host/base URL;
- authentication/token lifetime/refresh model;
- campaign list/status/type;
- campaign→product mapping;
- statistics generation/retrieval;
- exact metric names and units;
- supported dimensions/grouping;
- sync vs async report lifecycle;
- pagination;
- date/history windows;
- quotas/rate limits;
- account/role restrictions;
- deprecation/currentness for each target read method.

## 8. Gate

Until a current Ozon-owned Performance API method reference/spec is successfully retrieved:

- `advertising_performance_api.status = pending`;
- no advertising path enters research allowlist;
- `03A.3 = IN PROGRESS`;
- `03A.4 Ozon extension = NOT STARTED`;
- scraping the advertising cabinet is not a fallback;
- mutation methods are excluded even if discovered.

## 9. Next verification target

Preferred authoritative artifacts, in order:

1. current content from `https://docs.ozon.ru/api/performance/`;
2. Ozon-owned OpenAPI/Swagger/spec referenced by that documentation;
3. Ozon-owned current technical article/changelog that explicitly supplies host/auth/read methods and schemas.

The next pass should use the discovery candidates only as exact search probes against those Ozon-owned sources, then record for every accepted read method:

- HTTP verb/path;
- auth;
- required parameters/body;
- response schema/metrics;
- pagination or async report lifecycle;
- date/history limits;
- quota/rate limit;
- account restrictions;
- current/deprecated status;
- business-side-effect classification.
