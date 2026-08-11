# Ozon Seller API — verified notification currentness pass — 2026-08-11

Статус: **CURRENTNESS / DEPRECATION EVIDENCE — NOT FULL SCHEMA AUTHORITY**

## Источник и граница authority

В web index доступен верифицированный канал `Ozon Seller API notification` (`@OzonSellerAPI`). В профиле он описан как новости Seller API и ведёт на официальную библиотеку `https://docs.ozon.ru/api/seller/#tag/News`. Публикации содержат exact paths, даты изменений, beta→main transitions, deprecation и replacement notices.

Для `blood_sand` этот источник принимается как currentness/deprecation evidence, но **не заменяет** interactive Seller API library для полного method contract: HTTP verb, полной request/response schema, pagination, rate limits, history windows, permissions/subscription restrictions и error model, если они прямо не названы в changelog.

`current path confirmed` ≠ `implementation-ready method confirmed`.

## 1. Catalog / product master

### `/v3/product/list`

- 2026-02-10 — обновлено описание `filter.visibility`;
- 2026-07-09 — добавлены `filter.skus` в запрос и `result.items.sku` в ответ.

Status: **CURRENT CONFIRMED**, checkpoint 2026-07-09.

### `/v3/product/info/list`

- 2026-02-26 — обновлено `items.is_kgt`;
- 2026-04-06 — добавлено `items.showcases_visibility`;
- 2026-07-10 — удалено `items.images360`.

Status: **CURRENT CONFIRMED**, checkpoint 2026-07-10.

### `/v4/product/info/attributes`

- 2026-02-10 — обновлено описание `filter.visibility`.

Status: **CURRENT CONFIRMED**; full field/limit contract pending.

## 2. Prices / promotions

### `/v5/product/info/prices`

- 2026-02-10 — обновлено `filter.visibility`;
- 2026-05-28 — обновлены `items.marketing_actions` и поля actions: `date_from`, `date_to`, `title`, `value`.

Status: **CURRENT CONFIRMED**. Метод несёт как минимум часть promotion/action context.

### `/v1/product/prices/details`

- 2026-01-15 — beta;
- 2026-03-04 — перенесён в основной раздел.

Status: **CURRENT MAIN FAMILY**.

### Seller actions

В notification evidence начала марта 2026 видны read families:

- `/v1/seller-actions/list`;
- `/v1/seller-actions/products/list`.

Status: **CURRENT BETA FAMILY EVIDENCE**; full HTTP/schema/access contract pending.

## 3. Warehouses / clusters / stock geography

### Seller warehouse list

- `/v1/warehouse/list` — deprecated 2026-03-24, отключён 2026-04-07;
- replacement `/v2/warehouse/list` — основной current family; 2026-04-07 добавлен `warehouses.pause_at`.

**Future bridge must not target `/v1/warehouse/list`.**

### Other warehouse/cluster dictionaries

- `/v1/warehouse/ozon/list` — beta added 2026-03-12;
- `/v1/warehouse/fbo/seller/list` — beta added 2026-01-16;
- `/v2/cluster/list` — moved beta→main 2026-06-01.

### Stock by warehouse / analytics

- `/v1/product/info/stocks-by-warehouse/fbo` — new method announced in July 2026;
- `/v1/product/info/stocks-by-warehouse/fbs` — deprecated; replacement `/v2/product/info/stocks-by-warehouse/fbs` from 2026-04-07;
- `/v1/analytics/stocks` — main since 2026-03-24; announced switch to real-time data on **2026-08-17**.

Status: warehouse-level API surface exists, but full schemas and geography joins remain pending.

## 4. FBO/FBS postings — target versions

### FBO

- `/v2/posting/fbo/list` will be disabled 2026-08-31;
- replacement `/v3/posting/fbo/list`.

On **2026-08-04** Ozon again updated `/v3/posting/fbo/list`, specifically `postings.products.is_marketplace_buyout`.

Status: `/v3/posting/fbo/list` is the current target family.

### FBS

- `/v3/posting/fbs/list` and `/v3/posting/fbs/unfulfilled/list` will be disabled 2026-08-31;
- replacements `/v4/posting/fbs/list` and `/v4/posting/fbs/unfulfilled/list`;
- 2026-07-22 v4 methods received `filter.integration_type_flow`, `postings.integration_type_flow`, `postings.sorting_center`;
- `/v3/posting/fbs/get` received `result.integration_type_flow` and `result.sorting_center` on 2026-07-22;
- **2026-08-04** Ozon again updated `/v4/posting/fbs/list` and `/v4/posting/fbs/unfulfilled/list` (`postings.products.is_marketplace_buyout`).

Status: **future list/unfulfilled target = v4**; `/v3/posting/fbs/get` remains current detail-family evidence.

## 5. Returns / cancellations

### Returns

Currentness evidence includes:

- `/v1/returns/list` — active late 2025; compensation fields updated 2025-11-20;
- `/v2/returns/rfbs/list` — active 2025-12-26;
- `/v1/returns/settings/utilization/history` and related utilization methods — beta→main 2026-03-04;
- `/v2/report/returns/create` — current documentation change 2026-02-12 (`filter` required).

Status: return API contour is confirmed, but event fields/history/scheme coverage still require full contract extraction.

### Cancellations / reasons

- `/v1/cancel-reason/list`, `/v1/cancel-reason/list-by-order`, `/v1/cancel-reason/list-by-posting` — documentation updated 2025-12-30;
- `/v1/order/cancel/status`, `/v1/posting/cancel/status` — response `state` descriptions updated 2026-07-09;
- current posting families also carry cancellation-related context, but exact cross-version field coverage must be verified in library.

Status: cancellation status/reason families **CURRENTLY VISIBLE**; complete event chronology pending.

## 6. Finance — mandatory migration before implementation

### Deprecated family

On 2026-07-14 Ozon announced:

- `/v3/finance/transaction/list` — deprecated;
- `/v3/finance/transaction/totals` — deprecated;
- shutdown: **2026-09-08**.

Replacements:

- `/v1/finance/accrual/postings`;
- `/v1/finance/accrual/types`;
- `/v1/finance/accrual/by-day`.

**03A.4 must not be built around `/v3/finance/transaction/list`.**

### `/v1/finance/accrual/by-day`

- 2026-07-21 — updated `accruals.posting.products.delivery.services` description;
- **2026-07-30** — updated request `date` and `last_id`; response added `accruals.container_fees`, updated `accruals.accrued_category` and `last_id`.

Status: **CURRENT TARGET FAMILY**, checkpoint 2026-07-30. Full pagination/history/reconciliation contract pending.

## 7. Realization / generated reports — fresher 2026 confirmation

### Realization

- `/v2/finance/realization` and `/v1/finance/realization/posting` had response changes 2025-12-25;
- **2026-07-28** `/v1/finance/realization/posting` received an updated 400-error `message` description.

Status: `/v1/finance/realization/posting` has direct **2026 currentness evidence**.

### New order-level realization report

On **2026-07-28** Ozon added beta:

- `/v1/report/realization/posting/create` — creation of an order-level realization report.

Status: **CURRENT BETA FAMILY**; exact create/result lifecycle and limits pending.

### Report retrieval

On **2026-07-28**:

- `/v1/report/info` added `result.additional_data`;
- `/v1/report/list` added `result.reports.additional_data`.

Other current report evidence includes `/v1/report/postings/create` and `/v2/report/returns/create`.

Architectural consequence: report creation and later retrieval must be separate explicit bridge operations; no hidden polling/retry/fan-out.

## 8. Reviews / questions

### Reviews

2026-03-31 notification updated:

- `/v1/review/comment/list`;
- `/v1/review/count`;
- `/v1/review/info`;
- `/v1/review/list`.

Status: review read family **CURRENT CONFIRMED** as of 2026-03-31.

### Questions

- `/v1/question/list` directly updated 2025-09-18;
- family also includes `/v1/question/count`, `/v1/question/info`, `/v1/question/top-sku` in Ozon notification history.

Status: question read family confirmed; 2026 contract/access refresh still desirable.

## 9. Push notifications — optional future evidence stream

On **2026-08-04** Ozon updated notification methods and documented event types including:

- `TYPE_FBO_POSTING_NEW`;
- `TYPE_FBO_POSTING_CANCELLED`;
- `TYPE_FBO_POSTING_STATE_CHANGED`;
- `TYPE_FBO_POSTING_DELIVERY_DATE_CHANGED`;
- `TYPE_FBO_STOCKS_CHANGED`;
- `TYPE_ORDER_NEW`;
- `TYPE_ORDER_CANCELLED`;
- `TYPE_ORDER_STATE_CHANGED`.

This is useful future monitoring evidence, but it is **not required for initial read-only bridge** and the bridge must not silently configure subscriptions.

## 10. Advertising / Performance API remains unresolved

Ozon-owned surfaces confirm that Performance API is a separate public API contour and `dev.ozon.ru` exposes an `API рекламной платформы` category. However this research runtime still did not obtain a current Ozon-owned method index sufficient to verify:

- current host/auth model;
- campaign list/status/type;
- campaign→product mapping;
- impressions, clicks, spend, CTR, CPC/CPM;
- attributed orders/revenue;
- query/placement/category/region dimensions;
- read-only budget/bid context.

Third-party integrations are **not** authority for closing this gap.

Status: **PENDING / BLOCKING for full causal seller diagnostics**.

## 11. Research impact

This currentness pass supersedes earlier negative-search conclusions where later verified Ozon notifications directly confirm a path/family.

Endpoint-family existence/currentness is now materially established for catalog, prices, seller actions, warehouses/clusters, current posting versions, returns/cancellation families, finance migration targets, realization/reports and reviews/questions.

What still blocks `03A.3` closure:

1. implementation contracts for these current-confirmed families: HTTP verbs where not independently established, complete request/response schemas, pagination/history/rate/access restrictions;
2. exact advertising/Performance API read surface;
3. final cross-check that no target family is deprecated before coding.

Therefore:

- `03A.3` remains **IN PROGRESS**;
- `03A.4 — Ozon extension` remains **NOT STARTED**.
