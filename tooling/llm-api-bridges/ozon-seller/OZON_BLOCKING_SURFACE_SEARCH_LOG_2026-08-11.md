# Ozon Seller API — blocking surface search log — 2026-08-11

Статус: **RESEARCH LOG — official-domain evidence only; NOT implementation spec**

Цель: оставить воспроизводимый журнал того, какие blocking data surfaces roadmap 03A.3 были повторно проверены через официальные Ozon sources и какой статус допустим после проверки.

## Classification

- `CONFIRMED` — exact current method/capability имеет достаточное official evidence.
- `CAPABILITY_VISIBLE / ENDPOINT_PENDING` — официальный Ozon подтверждает существование функционального API-контура, но exact read method/schema не получены.
- `HISTORICAL_LEAD` — path встречается на official domain, но материал слишком старый для current allowlist.
- `NOT_CONFIRMED` — current exact official path/schema не найден; это не доказательство отсутствия метода.

## 1. Catalog / product master

Official-domain searches выполнялись по:

- exact `/v3/product/list`;
- exact `/v3/product/info/list`;
- exact `/v4/product/info/attributes`;
- русским формулировкам списка товаров, характеристик и карточек продавца.

Result:

- current exact enumeration method: `NOT_CONFIRMED`;
- current bulk product info method: `NOT_CONFIRMED`;
- current attributes method: `NOT_CONFIRMED`.

Старый official material 2023 показывает, что category attribute dictionaries существовали (`/v2/category/attribute/values`), но это только `HISTORICAL_LEAD`.

## 2. Prices / promotions

Official-domain searches выполнялись по:

- exact `/v5/product/info/prices` и price-family wording;
- seller promotion/actions.

Result:

- exact current product-price read method/schema: `NOT_CONFIRMED`;
- seller promotions/actions API capability: `CONFIRMED ACTIVE` по official topic 2026-02-27;
- exact read-only promotion list/detail/product participation: `ENDPOINT_PENDING`.

Official source:

- `https://dev.ozon.ru/community/1942-v1-seller-actions-products-add-404-poka/`

## 3. Warehouses / clusters / geography

Official-domain searches выполнялись по `warehouse/list`, `список складов`, seller warehouse/geography wording.

Result:

- current seller warehouse dictionary/list endpoint: `NOT_CONFIRMED`;
- current stock family `/v4/product/info/stocks`: already `CONFIRMED`, response includes `warehouse_ids`;
- FBO supply `/v3/supply-order/get` and `/v1/supply-order/details`: already `CONFIRMED`;
- from 2026-02-16 cross-dock logic must use `macrolocal_cluster_id`; `warehouse_id` loses relevance for cross-dock.

Official current source:

- `https://dev.ozon.ru/news/647-Izmeneniia-v-metodakh-Seller-API-pri-rabote-s-postavkami-FBO/`

Disposition: warehouse IDs and cluster IDs without a verified dictionary/geography surface are insufficient for regional diagnostic joins.

## 4. Returns / cancellations

Official-domain searches выполнялись по return/returns/возвраты/отмены FBS.

Result:

- exact current product-level return list method: `NOT_CONFIRMED`;
- exact cancellation list/detail/reason method: `NOT_CONFIRMED`;
- current need to detect partial FBS cancellation: `CONFIRMED CURRENT INTEGRATION NEED` по official Seller API community 2026-05-26;
- aggregate `returns` capability through `/v1/analytics/data` has historical official evidence, but aggregate metric does not replace event-level return chronology.

Current official community surface:

- `https://dev.ozon.ru/community?category_id=2&page=4`

Disposition: cancellation/return event layer remains blocking for causal diagnostics.

## 5. Realization / reports / settlement

Official-domain searches выполнялись по current realization/report/settlement/finance wording.

Result:

- current exact realization/report replacement: `NOT_CONFIRMED`;
- `/v1/finance/realization`: found only as a 2023 official community path, therefore `HISTORICAL_LEAD`;
- `/v3/finance/transaction/list`: separate transaction family already has official provenance and remains useful, but is not treated as a complete replacement for realization/settlement reports.

Historical official lead:

- `https://dev.ozon.ru/community?page=72`

Confirmed finance/posting join evidence:

- `https://dev.ozon.ru/community/712-Zapros-v3-finance-transaction-list-kak-uznat-tsenu-za-tovar`

## 6. Advertising

Official community navigation explicitly exposes a separate `API рекламной платформы` category.

A historical official community topic shows a campaign/product mutation request under `/api/client/campaign/{id}/products`, but this evidence is not sufficient for the project's read-only statistics surface.

Result:

- advertising API contour: `CAPABILITY_VISIBLE`;
- current host/auth: `ENDPOINT_PENDING`;
- campaign list/status: `ENDPOINT_PENDING`;
- campaign → product mapping: `ENDPOINT_PENDING`;
- impressions/clicks/spend/CTR/CPC/CPM/orders/revenue statistics: `ENDPOINT_PENDING`;
- mutations: explicitly outside initial bridge scope.

Official surfaces:

- `https://dev.ozon.ru/community?category_id=2&page=4`
- `https://dev.ozon.ru/community/1110-Stavka-ne-vkhodit-v-diapazon-dopustimykh-znachenii/`

## 7. Reviews / questions

Official-domain search found current-ish review API evidence:

- `/v1/review/comment/create` appears in an official Ozon for dev topic dated 2025-10-25.

Official source:

- `https://dev.ozon.ru/community/1766-v1-review-comment-create-rabota-s-otzyvami/`

Interpretation:

- review API capability: `CAPABILITY_VISIBLE`;
- exact read-only review list/detail method: `ENDPOINT_PENDING`;
- exact questions read API: `NOT_CONFIRMED`.

The write/comment method itself is **not** eligible for the initial read-only bridge.

## 8. Official library access

`https://docs.ozon.ru/api/seller/` remains unavailable from the current research runtime as a stable browsable snapshot because requests enter a redirect/error loop.

This blocks authoritative extraction of schemas, pagination, limits, history and restrictions for the pending families.

No third-party mirror is allowed to close that gap.

## 9. Current decision

After this search pass there is still not enough official evidence to promote any new blocking endpoint into `OZON_READ_ONLY_ALLOWLIST_V1.json`.

Roadmap disposition therefore remains:

- `03A.3` = `[~] IN PROGRESS`;
- `03A.4 Ozon extension` = `[ ] NOT STARTED`.

Next official-evidence target remains the live Seller API library or another current Ozon-owned source that exposes exact methods/schemas for catalog, prices, returns/cancellations, warehouses/geography, reports/settlement and advertising statistics.