# 03A — Marketplace API tooling и полный ассортимент

Статус: **[~] В РАБОТЕ — обязательный блокирующий этап перед продолжением 03/04**  
Дата начала: 2026-08-10  
Последняя синхронизация research state: 2026-08-11

## Почему этот пункт добавлен

Wordstat/SERP pilot был построен вокруг семейства «Печать Велеса / автомобильные подвески», тогда как фактический business scope — полный магазин, порядка 70 товаров. Продолжать SERP/Alice/контентную стратегию по одному pilot family означало бы принять пилот за весь ассортимент.

Стратегия AI-Native Hybrid Search Commerce не меняется. Перед её продолжением нужен инфраструктурный/data-ingestion слой: исследовать marketplace API, затем разработать read-only LLM bridges, получить полный ассортимент и seller evidence, построить product-centric master и только после этого re-baseline поисковое исследование.

## Жёсткий порядок работ

1. Зафиксировать scope-проблему и остановить старый Wordstat pilot.
2. Сохранить действующий Yandex Wordstat bridge как архитектурный референс.
3. Полностью исследовать официальный Ozon API и зафиксировать read capabilities/current versions/contracts.
4. Только после достаточного закрытия 03A.3 — разработать Ozon browser extension.
5. Исследовать официальный Wildberries API.
6. Только после WB research — разработать Wildberries browser extension.
7. Ввести реальные credentials локально и провести real-account acceptance обоих расширений.
8. Выгрузить полный ассортимент и seller facts/statistics с обеих площадок.
9. Построить единый Product/SKU/Listing/Category master и product-centric data layer.
10. Получить seller analytics baseline и re-baseline roadmap 03 по всему ассортименту.

**Важно:** Ozon и WB расширений сейчас нет. API matrices, research allowlists, protocol/design docs и mocks не считаются extension implementation.

## Критерий завершения 03A

03A закрывается только когда одновременно:

- Yandex Wordstat bridge сохранён как проверяемый reference tooling;
- Ozon read-only API surface исследован в объёме, достаточном для ассортимента и seller diagnostics;
- Ozon bridge разработан и прошёл real-account acceptance;
- WB read-only API surface исследован;
- WB bridge разработан и прошёл real-account acceptance;
- получен полный доступный ассортимент продавца с обеих площадок;
- создан канонический Product/SKU/Listing/Category master с cross-platform identity mapping;
- определены real product families/categories для семантического исследования;
- research schema расширена product-centric entities;
- roadmap 03 re-baselined по полному ассортименту.

До этого дальнейший Wordstat/SERP/Alice research нельзя считать полным брендовым исследованием.

---

## Конкретные шаги

### [x] 03A.1 — Зафиксировать scope-проблему и остановить дальнейшие Wordstat API-вызовы

Сделано.

Pilot Wordstat остаётся evidence. Root set остановлен на 13/14 и не считается полным исследованием бренда. Последний старый root не запускается до re-baseline полного ассортимента.

### [~] 03A.2 — Создать toolkit structure и сохранить актуальный Yandex reference

Сделано:

- создан `tooling/llm-api-bridges/`;
- provider dirs: `yandex-wordstat/`, `ozon-seller/`, `wildberries/`, `shared/`;
- создан shared design contract;
- exact owner-supplied Wordstat v1.1.5 закреплён как canonical reference;
- exact uploaded ZIP повторно проверен 2026-08-11:
  - size `174927` bytes;
  - SHA-256 `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`;
  - 44 ZIP entries;
  - fresh regression `283/283 PASS`, `0 FAIL`.

Не закрыто:

- exact executable/source repository payload пока отсутствует.

Причина не скрывается: controlled Base64/Git-blob transport tests через доступный GitHub connector не прошли byte-integrity validation. Повреждённая экспериментальная ветка не является authority и не сливается в `main`.

Authoritative provenance: `tooling/llm-api-bridges/yandex-wordstat/IMPORT_MANIFEST.md`.

До `[x]`: физически сохранить проверяемый executable/source representation через канал, где результат можно сверить с canonical SHA.

### [~] 03A.3 — Полный официальный API-аудит Ozon

**Статус после currentness pass 2026-08-11: endpoint-family discovery существенно продвинут, но implementation contracts и Performance API ещё блокируют coding.**

Current authority artifacts:

- `tooling/llm-api-bridges/ozon-seller/OZON_03A3_COMPLETENESS_V1.json`;
- `tooling/llm-api-bridges/ozon-seller/OZON_READ_ONLY_ALLOWLIST_V1.json`;
- `tooling/llm-api-bridges/ozon-seller/OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_PERFORMANCE_API_GAP_2026-08-11.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_API_CAPABILITY_AUDIT_2026-08-10.md`.

#### 03A.3.1 — Security/auth baseline — подтверждено

- public API only; cabinet/site scraping fallback не использовать;
- Seller API host/auth contour: `api-seller.ozon.ru`, seller-created `Client-Id` + `Api-Key`;
- OAuth без private/public Ozon application не существует;
- credentials будущего bridge хранятся локально и не уходят LLM/GitHub.

#### 03A.3.2 — Catalog/product master — current families подтверждены, full contract pending

Currentness evidence подтверждает:

- `/v3/product/list` — updated 2026-07-09;
- `/v3/product/info/list` — updated 2026-07-10;
- `/v4/product/info/attributes` — current family.

Это снимает старый вопрос «существуют ли current catalog paths», но **не закрывает implementation contract**.

Нужно ещё снять authoritative:

- HTTP verbs where not independently established;
- full request/response schemas;
- pagination/batch limits;
- archive/hidden/visibility/moderation/error semantics;
- category/type/attribute/media/rich-content completeness;
- permissions.

#### 03A.3.3 — Prices/promotions — current families подтверждены, contract pending

Currentness evidence:

- `/v5/product/info/prices` — current through 2026-05-28; `marketing_actions` context виден в changelog;
- `/v1/product/prices/details` — moved beta→main 2026-03-04;
- seller-actions read families `/v1/seller-actions/list`, `/v1/seller-actions/products/list` visible in 2026 notifications.

Нужно ещё: exact HTTP/contracts, complete price semantics, pagination, promotion participation/access restrictions.

#### 03A.3.4 — Stocks/warehouses/clusters — current versions уточнены

Confirmed core:

- `POST /v4/product/info/stocks`.

Current families:

- `/v2/warehouse/list`;
- `/v1/warehouse/ozon/list`;
- `/v1/warehouse/fbo/seller/list`;
- `/v2/cluster/list`;
- `/v2/product/info/stocks-by-warehouse/fbs`;
- `/v1/product/info/stocks-by-warehouse/fbo`;
- `/v1/analytics/stocks`.

Do not use:

- `/v1/warehouse/list` — disabled 2026-04-07;
- `/v1/product/info/stocks-by-warehouse/fbs` — replaced by v2.

Important currentness: `/v1/analytics/stocks` announced real-time switch for 2026-08-17; before implementation this transition must be rechecked.

Still pending: full contracts, warehouse↔cluster↔geography joins and history strategy.

#### 03A.3.5 — Seller/product/search analytics — core confirmed, schema refresh pending

Confirmed:

- `POST /v1/analytics/data`;
- `POST /v1/analytics/product-queries`;
- `POST /v1/analytics/product-queries/details`.

Need current complete metrics/dimensions, history/date limits, pagination/limits and plan restrictions.

#### 03A.3.6 — FBO/FBS postings — future target versions corrected

Use future target families:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Ozon updated target list families again on 2026-08-04.

Do not design against:

- `/v2/posting/fbo/list` — shutdown scheduled 2026-08-31;
- `/v3/posting/fbs/list` — shutdown scheduled 2026-08-31;
- `/v3/posting/fbs/unfulfilled/list` — shutdown scheduled 2026-08-31.

Still pending: full v4 contracts, date windows/pagination and complete status/cancellation semantics.

#### 03A.3.7 — Returns/cancellations — families confirmed, chronology contract pending

Visible/current families include:

- `/v1/returns/list`;
- `/v2/returns/rfbs/list`;
- `/v2/report/returns/create`;
- `/v1/cancel-reason/list`;
- `/v1/cancel-reason/list-by-order`;
- `/v1/cancel-reason/list-by-posting`;
- `/v1/order/cancel/status`;
- `/v1/posting/cancel/status`.

Current 2026 Seller API community independently confirms partial FBS cancellation as a live integration problem.

Still pending: exact event-level quantities/timestamps/reasons, FBO/FBS/rFBS coverage, partial cancellation representation, pagination/history and claims/disputes availability.

#### 03A.3.8 — Supply/replenishment — core confirmed

Confirmed:

- `/v3/supply-order/get`;
- `/v1/supply-order/details`;
- cross-dock current logic uses `macrolocal_cluster_id`; historical `warehouse_id` assumptions must not be copied blindly.

Still pending: complete status chronology/schema and operational limits.

#### 03A.3.9 — Finance — mandatory migration identified

Critical current correction:

- `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` are deprecated;
- shutdown scheduled **2026-09-08**;
- future target family:
  - `/v1/finance/accrual/postings`;
  - `/v1/finance/accrual/types`;
  - `/v1/finance/accrual/by-day`.

`/v1/finance/accrual/by-day` updated through **2026-07-30**, including `date`, `last_id`, `accruals.container_fees` changes.

**03A.4 must not be built around old v3 transaction list.**

Still pending: full accrual contracts, pagination/history, product/posting joins and fee taxonomy.

#### 03A.3.10 — Realization/reports — current families confirmed

Current evidence:

- `/v1/finance/realization/posting` — updated 2026-07-28;
- `/v1/report/realization/posting/create` — beta added 2026-07-28;
- `/v1/report/info` — updated 2026-07-28;
- `/v1/report/list` — updated 2026-07-28;
- `/v1/report/postings/create`;
- `/v2/report/returns/create`;
- `/v2/finance/realization` remains a currentness-refresh target.

Generated reports must be separate explicit create→retrieve bridge operations. Hidden polling/fan-out запрещён.

Still pending: full contracts, period/history limits, settlement/payout coverage and report lifecycle details.

#### 03A.3.11 — Reviews/questions — read families visible

Review read families have 2026 currentness:

- `/v1/review/list`;
- `/v1/review/info`;
- `/v1/review/count`;
- `/v1/review/comment/list`.

Question family includes `/v1/question/list`, `/info`, `/count`, `/top-sku`; 2026 refresh/access contract still desirable.

This layer is useful but non-blocking for first assortment import.

#### 03A.3.12 — Performance API / advertising — главный отдельный unresolved blocker

Ozon-owned sources confirm:

- `Performance API` is a separate public Ozon API for advertising automation;
- Ozon Реклама explicitly promotes it for external automation;
- official documentation root is discoverable as `https://docs.ozon.ru/api/performance/`.

Но current research runtime получает redirect loop и не может authoritative extract method contract.

Still needed:

- current host/auth;
- campaign list/status/type;
- campaign→product mapping;
- impressions/clicks/spend;
- CTR/CPC/CPM;
- attributed orders/revenue;
- useful dimensions;
- read-only budget/bid state;
- async report lifecycle, pagination/history/rate limits/access restrictions.

Third-party Performance API indexes/integrators remain discovery-only and do not enter allowlist.

#### 03A.3.13 — Method-level operational constraints — blocking

Across newly current-confirmed Seller API families still need authoritative extraction of:

- HTTP verbs where not already confirmed;
- complete request/response schemas;
- pagination/cursor/page-size/batch limits;
- history/date windows;
- rate limits/quotas;
- roles/scopes/subscription restrictions;
- JSON vs generated/binary response behavior;
- final deprecation scan immediately before coding.

#### 03A.3 gate

`OZON_03A3_COMPLETENESS_V1.json` currently has:

- `closure_allowed=false`;
- `extension_development_allowed=false`.

Therefore **03A.3 remains `[~]` and 03A.4 must not start yet**.

### [ ] 03A.4 — Разработать Ozon LLM browser extension

**НЕ НАЧАТО. Ozon extension сейчас не существует.**

Начать только после достаточного закрытия 03A.3.

Планируемые требования:

- use Yandex Wordstat bridge as lifecycle/reference, not as marketplace request schema;
- local credentials only; secrets never emitted to LLM/GitHub;
- read-only hard allowlist only from verified current operations;
- `OZON_API_V1 → OZON_RESULT_V1`;
- Manual + Autorun;
- one accepted command = one explicit external API request;
- no hidden retries/fan-out/pagination loops;
- exactly-once ownership/recovery, fail-closed around unknown request outcomes;
- generated reports modeled as explicit create/retrieve operations;
- static tests → browser tests → fresh-package tests → real-account acceptance.

### [x] 03A.5 — Официальный API-аудит Wildberries для будущего read-only bridge

Исследовательские артефакты:

- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_AUDIT_2026-08-10.md`;
- `tooling/llm-api-bridges/wildberries/WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md` — current corrections имеют приоритет над старым audit;
- `tooling/llm-api-bridges/wildberries/READ_ONLY_OPERATION_MATRIX_V1.md`.

Для future bridge исследованы cards/catalog, prices/discounts, seller warehouses/FBS stock, WB warehouse remains, sales funnel, generated analytics reports, FBS orders, finance/realization, promotion campaigns/statistics и promotions calendar.

Critical 2026 corrections:

- auth: `Authorization: Bearer <token>`; Service/Basic flow may additionally require `X-Client-Secret`;
- cards: `POST content-api.wildberries.ru/content/v2/get/cards/list` + trash list, cursor pagination;
- prices: `GET discounts-prices-api.wildberries.ru/api/v2/list/goods/filter`, `limit <= 1000` + offset;
- seller warehouses: `GET marketplace-api.wildberries.ru/api/v3/warehouses`;
- FBS inventory: `POST marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}`;
- old `statistics-api.../api/v1/supplier/stocks` deprecated; current warehouse-remains uses async `seller-analytics-api ... /api/v1/warehouse_remains` flow;
- FBS orders: `GET /api/v3/orders/new`, `GET /api/v3/orders`, `POST /api/v3/orders/status`; list period max 30 calendar days per request;
- old `GET /api/v5/supplier/reportDetailByPeriod` announced for shutdown 2026-07-15 and must not be used;
- current finance: `POST finance-api.wildberries.ru/api/finance/v1/sales-reports/list`, `/detailed`, `/detailed/{reportId}`;
- sales funnel: `/api/analytics/v3/sales-funnel/...`;
- promotion API separate contour; promotions calendar uses `dp-calendar-api.wildberries.ru`.

Before coding/release every actually used WB endpoint is rechecked against current official docs/release notes.

### [ ] 03A.6 — Разработать Wildberries LLM browser extension

**НЕ НАЧАТО. Wildberries extension сейчас не существует.**

Начать отдельным этапом после API research.

Requirements:

- local WB token(s), correct category/scope/token type;
- read-only hard allowlist;
- `WB_API_V1 → WB_RESULT_V1`;
- Manual + Autorun;
- one accepted command = one explicit request;
- no hidden retries/unbounded pagination;
- controlled JSON + generated/binary reports;
- secrets never enter LLM result/log;
- lifecycle/exactly-once/recovery by Yandex reference;
- static/browser/package tests + real-account acceptance.

### [ ] 03A.7 — Real-account acceptance Ozon и Wildberries

После разработки владелец вводит credentials только локально в popup соответствующего расширения. В чат/GitHub ключи не отправляются.

Подтвердить реальные permissions/scopes, response schemas, rate limits, pagination, history depth, paid/Jam/Premium restrictions и отсутствие утечки secrets.

### [ ] 03A.8 — Выгрузить полный ассортимент и seller facts из Ozon и WB

После acceptance собрать identifiers, seller article/SKU, marketplace listing IDs, titles, categories/subjects, variants, attributes, media refs, prices/discounts, listing state, warehouses/stocks/availability и другие доступные product-level facts по всему магазину.

Цель — весь фактический ассортимент, а не только «Печать Велеса».

### [ ] 03A.9 — Построить канонический product-centric data layer

Минимальные entities:

- Product;
- SKU/Variant;
- ProductFamily;
- Category;
- MarketplaceAccount;
- MarketplaceListing;
- Warehouse;
- StockSnapshot;
- Order/Sale observation;
- Return;
- Finance observation;
- AdCampaign/AdProduct observation.

Query evidence должен ссылаться на family/category/SKU.

### [ ] 03A.10 — Выполнить cross-platform seller analytics baseline

Получить доступную историческую статистику продаж/заказов/остатков/цен/финансов/рекламы и сформировать первый diagnostic baseline.

Diagnostic chain:

`demand → listing eligibility → price/promo → regional/warehouse stock → ad delivery → traffic → funnel → orders → cancellations/returns → replenishment → finance`.

### [ ] 03A.11 — Re-baseline roadmap 03 по всему ассортименту

Сгруппировать порядка 70 товаров в реальные categories/product families, определить seed/root queries и приоритет для каждой семьи. «Печать Велеса» остаётся одним уже исследованным pilot family.

Только после этого возобновить Wordstat и перейти к 04 SERP/Alice как к исследованию полного бренда.

---

## Блокеры / правила

- Ozon/WB credentials вводятся только локально после разработки соответствующего extension;
- до 03A.4/03A.6 нельзя утверждать, что marketplace extensions существуют;
- API capability зависит от account permissions, scopes/token type/subscriptions;
- initial bridges read-only; write/mutation operations запрещены до отдельного решения;
- API research и extension development — разные этапы;
- currentness/deprecation evidence и full implementation contract — разные уровни доказательства;
- сторонний SDK/collection/index не закрывает Ozon/WB endpoint gate;
- непосредственно перед coding каждого provider проводится финальный currentness/deprecation pass.
