# Ozon API endpoint discovery / verification queue

Дата: 2026-08-10  
Последняя revalidation: 2026-08-11  
Статус: **RESEARCH QUEUE — NOT AN ALLOWLIST**

## Правило

Этот файл содержит endpoint families/paths, которые нужно проверить в current official Ozon documentation. Наличие строки здесь **не означает**, что метод подтверждён, актуален, доступен конкретному кабинету или будет включён в будущий bridge.

В future implementation method можно переносить только после фиксации current official provenance, HTTP method, request/response schema, pagination/history/limits и auth/access restrictions.

Сторонние SDK/Postman/generated clients/зеркала допускаются только для discovery. Они не могут повысить item до `CONFIRMED`.

## Уже подтверждено и queue не требуется

Эти методы уже имеют official provenance в основном audit:

- `POST /v4/product/info/stocks`;
- `POST /v1/analytics/data`;
- `POST /v1/analytics/product-queries`;
- `POST /v1/analytics/product-queries/details`;
- `POST /v3/posting/fbo/list`;
- `POST /v3/posting/fbs/get`;
- `POST /v3/finance/transaction/list`;
- `/v3/supply-order/get`;
- `/v1/supply-order/details`.

Fresh 2026-08-11 official revalidation: `OZON_OFFICIAL_REVALIDATION_2026-08-11.md`.

## Queue 1 — full catalog / product master — BLOCKING

Проверить current official equivalents/versions для следующих discovered method families:

- product list / listing enumeration (`product/list` family);
- bulk product info (`product/info/list` family);
- product attributes/characteristics (`product/info/attributes` family);
- descriptions/rich content/media if separate read surface exists;
- archived/hidden/visibility/moderation/error state;
- category/type/dictionary linkage;
- barcode/dimensions/weight.

Нужно определить, одного ли bulk method достаточно для полного seller master или требуется `list → info → attributes/media` chain.

### 2026-08-11 status

Search/discovery surfaces показывают candidate versioned paths, но current official Seller API library snapshot получить не удалось. Поэтому **ни один candidate catalog endpoint не повышен до CONFIRMED**.

Остаётся blocking.

## Queue 2 — prices / promotions — BLOCKING

Проверить current official equivalents/versions для:

- bulk product prices (`product/info/prices` family);
- price index/marketing price fields;
- discount/promotion participation read state;
- seller actions/promotions listing and product participation;
- old/current/marketing/card price semantics where exposed.

Write methods изменения price/actions исключены из initial scope.

### 2026-08-11 status

Official Ozon project manager confirmed on 2026-02-27 that methods for managing seller's own promotions are working and documented under `БЕТА-МЕТОДЫ → Акции продавца`:

- https://dev.ozon.ru/community/1942-v1-seller-actions-products-add-404-poka/

Therefore seller promotions/actions capability is now:

- `CAPABILITY_CONFIRMED`;
- exact read-only endpoints/schema/pagination/access: `PENDING`.

Do **not** infer a read endpoint from the write-method name mentioned in the topic.

Остаётся blocking.

## Queue 3 — warehouses / logistics geography — BLOCKING

Проверить current official equivalents/versions для:

- seller warehouse list (`warehouse/list` family);
- warehouse/cluster dictionaries;
- FBO/FBS availability mapping;
- delivery method/geography/cluster fields if exposed by read API.

### 2026-08-11 status

Official evidence confirms that current stock data includes `warehouse_ids`, while the 2026 FBO cross-dock change makes `macrolocal_cluster_id` important for supply semantics. This does not replace a current warehouse/cluster dictionary.

Sources:

- https://dev.ozon.ru/community/1747-v4-product-info-stocks-daet-ne-korrektnye-ostatki/
- https://dev.ozon.ru/news/647-Izmeneniia-v-metodakh-Seller-API-pri-rabote-s-postavkami-FBO/

Остаётся blocking.

## Queue 4 — returns / cancellations — BLOCKING

Проверить current official equivalents/versions для:

- returns list (`returns/list` family or its current replacement);
- FBO/FBS return-specific methods if split;
- cancellation/reason/status dictionaries;
- product quantities and timestamps;
- claims/disputes where a read API exists.

### 2026-08-11 status

Current official Seller API community page contains a 2026-05-26 topic `Частичная отмена FBS - как определить через API`. This confirms that partial-cancellation detection remains a current integration need, but the accessible official surface did not provide a resolved exact endpoint/schema.

Source:

- https://dev.ozon.ru/community?category_id=2&page=4

Status:

- current business need: `CONFIRMED`;
- exact return/cancellation read endpoint: `PENDING`.

Остаётся blocking.

## Queue 5 — reports / realization / settlement — BLOCKING

Проверить current official equivalents/versions for:

- realization/settlement report;
- report create/list/info families for generated reports;
- seller services/commissions/logistics/storage/acceptance details;
- payout/reconciliation data.

Generated-report APIs должны быть помечены отдельно: logical read может состоять из явной операции создания report job и отдельной явной операции получения результата; скрытый polling/fan-out будущим bridge запрещён.

### 2026-08-11 status

Fresh pass не получил current exact official methods/schemas для этого слоя.

Остаётся blocking.

## Queue 6 — advertising API — BLOCKING

Отдельный contour; проверить current official host/auth и exact read endpoints для:

- campaigns;
- campaign products;
- campaign/product/day statistics;
- impressions/clicks/spend/CTR/CPC/CPM;
- attributed orders/revenue/conversions;
- query/search/placement/category/region dimensions where available;
- read-only budget/bid facts where exposed.

Никаких campaign/bid/budget mutations в initial bridge.

### 2026-08-11 status

Отдельный advertising API contour остаётся подтверждён как существующий, но current exact read host/auth/stat schema этим проходом не закрыта.

Остаётся blocking.

## Queue 7 — reviews / questions — DESIRABLE/PENDING

Проверить current official read endpoints/permissions for:

- reviews/rating;
- questions;
- answer/status metadata;
- complaint/problem themes.

Это desirable surface: отсутствие доступа не блокирует первый assortment import, но должно быть явно отражено как data gap.

### 2026-08-11 status

Fresh pass не получил exact current official read surface.

## Acceptance checklist для каждого queue item

До статуса `CONFIRMED` записать:

1. official current source URL;
2. exact HTTP method/path/version;
3. auth type;
4. required scopes/account role/subscription;
5. required request parameters;
6. identifiers and fields needed by `blood_sand`;
7. pagination/page size/cursor semantics;
8. history/date limits;
9. rate limit/quota behavior;
10. deprecation/replacement notice;
11. JSON vs binary/generated report response;
12. read-only/business-side-effect classification.

## Stop condition

Если current official source не подтверждает метод или его schema, item остаётся в queue. Нельзя закрывать пробел сторонним SDK и нельзя проектировать endpoint в extension «по памяти».

До закрытия blocking queues 1–6 roadmap `03A.4 — Ozon LLM browser extension` не начинается.
