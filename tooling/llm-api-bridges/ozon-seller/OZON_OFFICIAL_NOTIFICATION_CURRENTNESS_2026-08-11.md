# Ozon Seller API — verified notification currentness pass — 2026-08-11

Статус: **CURRENTNESS / DEPRECATION EVIDENCE — NOT FULL SCHEMA AUTHORITY**

## Почему этот источник допустим и где его граница

В web index доступен верифицированный Telegram-канал `Ozon Seller API notification` (`@OzonSellerAPI`). Профиль канала прямо описывает себя как новости Seller API и ссылается на официальную библиотеку `https://docs.ozon.ru/api/seller/#tag/News`. В канале публикуются датированные изменения методов, переносы из beta в main, deprecation и replacement notices.

Для проекта этот источник принимается **только** как Ozon-branded currentness/deprecation notification evidence:

- можно подтвердить, что exact path/family был активен/изменён на указанную дату;
- можно подтвердить объявленную Ozon замену deprecated method;
- можно подтвердить отдельные поля, если changelog прямо называет добавленный/удалённый параметр.

Он **не заменяет** interactive Seller API library для:

- HTTP verb, если он не указан в notification;
- полного request/response schema;
- обязательности всех параметров, кроме прямо названных в notification;
- pagination/cursor/page-size, кроме прямо названных изменений;
- rate limits/quotas;
- history/date windows;
- account role, subscription/Premium restrictions;
- error model.

Поэтому `current path confirmed` и `implementation-ready method confirmed` — разные статусы.

## 1. Catalog / product master — current families confirmed

### `/v3/product/list`

Currentness evidence:

- 2026-02-10: обновлено описание `filter.visibility`;
- 2026-07-09: добавлены `filter.skus` в запрос и `result.items.sku` в ответ.

Conclusion: path family **CURRENT CONFIRMED** as of 2026-07-09. Full schema/HTTP verb/limits still require library extraction.

### `/v3/product/info/list`

Currentness evidence:

- 2026-02-26: обновлено описание `items.is_kgt`;
- 2026-04-06: добавлен `items.showcases_visibility`;
- 2026-07-10: удалён `items.images360` из ответа.

Conclusion: path family **CURRENT CONFIRMED** as of 2026-07-10.

### `/v4/product/info/attributes`

Currentness evidence:

- 2026-02-10: обновлено описание `filter.visibility`.

Conclusion: path family **CURRENT CONFIRMED** as of 2026-02-10; complete field/limit semantics pending.

## 2. Prices / promotion context — current families confirmed

### `/v5/product/info/prices`

Currentness evidence:

- 2026-02-10: обновлено описание `filter.visibility`;
- 2026-05-28: обновлены response fields under `items.marketing_actions`, including action dates/title/value.

Conclusion: current bulk price family **CURRENT CONFIRMED**; it also carries at least some promotion/action context.

### `/v1/product/prices/details`

- 2026-01-15: added as beta for detailed product price information;
- 2026-03-04: moved from beta to main section.

Conclusion: detailed price family **CURRENT MAIN CONFIRMED** as of 2026-03-04.

### Seller actions/promotions

- 2026-03-02 notification lists beta seller-actions families including `/v1/seller-actions/products/list` and `/v1/seller-actions/list` among create/update/mutation methods;
- 2026-03-06 documentation sections for seller promotions were added/renamed.

Conclusion: exact read paths `/v1/seller-actions/list` and `/v1/seller-actions/products/list` have **CURRENT BETA FAMILY EVIDENCE**. They are not implementation-ready until HTTP/schema/access constraints are extracted.

## 3. Warehouses / clusters / stock geography — current replacements clarified

### `/v2/warehouse/list`

- 2026-02-02: moved from beta to main together with warehouse-related methods;
- 2026-03-24: `/v1/warehouse/list` declared deprecated, switch to `/v2/warehouse/list`, shutdown 2026-04-07;
- 2026-04-07: `/v2/warehouse/list` response gained `warehouses.pause_at`.

Conclusion:

- `/v1/warehouse/list` = **DO NOT USE — DISABLED 2026-04-07**;
- `/v2/warehouse/list` = **CURRENT CONFIRMED FAMILY**.

### Ozon/FBO warehouse and cluster dictionaries

- 2026-03-12: `/v1/warehouse/ozon/list` added as beta for Ozon warehouse list;
- 2026-01-16: `/v1/warehouse/fbo/seller/list` added as beta for FBO supply workflows;
- 2026-06-01: `/v2/cluster/list` moved from beta to main.

Conclusion: current warehouse/cluster dictionary families exist. Exact join semantics and completeness for product-level geography remain pending.

### Stock-by-warehouse / stock analytics

- current notification stream reports a new `/v1/product/info/stocks-by-warehouse/fbo` method;
- `/v1/product/info/stocks-by-warehouse/fbs` deprecated on 2026-03-24 and switched to `/v2/product/info/stocks-by-warehouse/fbs` from 2026-04-07;
- `/v1/analytics/stocks` moved from beta to main on 2026-03-24 and is scheduled to return real-time stock data from 2026-08-17.

Conclusion: the future diagnostic design must not rely only on `warehouse_ids` from `/v4/product/info/stocks`; there are explicit current warehouse-level families that need schema extraction.

## 4. FBO/FBS postings — current versions corrected

### FBO

- `/v2/posting/fbo/list` is deprecated and scheduled for shutdown 2026-08-31;
- notification instructs switching to `/v3/posting/fbo/list`.

Conclusion: existing project target `/v3/posting/fbo/list` remains correct.

### FBS list / unfulfilled

- `/v3/posting/fbs/list` and `/v3/posting/fbs/unfulfilled/list` are deprecated and scheduled for shutdown 2026-08-31;
- replacements: `/v4/posting/fbs/list`, `/v4/posting/fbs/unfulfilled/list`;
- 2026-07-22 both v3 and v4 received `integration_type_flow` / `sorting_center` documentation changes during migration;
- `/v3/posting/fbs/get` also received current fields on 2026-07-22 and remains a current detail family in the notification evidence.

Conclusion: future bridge must target **v4 list/unfulfilled**, while `/v3/posting/fbs/get` remains current detail evidence.

## 5. Returns / cancellations — read surfaces now materially clearer

### General returns

- `/v1/returns/list` received filter/response changes on 2025-11-20 (`compensation_status_id`, `compensation_status`), confirming the general return-list family was active late 2025.

### rFBS returns

- `/v2/returns/rfbs/list` had response deprecation notice on 2025-12-26, with only `returns.client_name` scheduled for removal 2026-02-02;
- `/v1/returns/rfbs/action/set` received required-parameter documentation change on 2026-02-12;
- `/v1/returns/settings/utilization/history` and related utilization methods moved from beta to main on 2026-03-04.

### Returns report

- `/v2/report/returns/create` moved to main on 2024-12-20 and received a required `filter` documentation change on 2026-02-12.

Conclusion: returns are no longer an unknown API contour. Exact event fields, pagination/history and scheme coverage still require library extraction before the future bridge can claim a complete return chronology.

### Cancellations / reasons

Currentness evidence:

- 2025-12-30: `/v1/cancel-reason/list`, `/v1/cancel-reason/list-by-order`, `/v1/cancel-reason/list-by-posting` descriptions added/updated;
- 2026-07-09: `/v1/order/cancel/status` and `/v1/posting/cancel/status` response `state` descriptions updated;
- current FBS detail/list families include cancellation metadata in historical official changelog; current v4 list schema still needs direct library extraction to verify exact carry-over.

Conclusion: cancellation status/reason families are **CURRENTLY VISIBLE**, but a complete read-only chronology still needs schema verification.

## 6. Finance / realization — critical deprecation correction

### `/v3/finance/transaction/list`

2026-07-14 notification:

- `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` are deprecated;
- shutdown date: **2026-09-08**;
- replacements: `/v1/finance/accrual/postings`, `/v1/finance/accrual/types`, `/v1/finance/accrual/by-day`.

2026-07-21 additionally updated a response field in `/v1/finance/accrual/by-day`.

Conclusion:

- the old project research entry remains historical/current-until-cutoff evidence but **MUST NOT be the target of 03A.4**;
- future implementation target is the `finance/accrual` family, pending full schema extraction.

### Realization

2025-12-25 notification updated response fields in:

- `/v2/finance/realization`;
- `/v1/finance/realization/posting`.

Conclusion: realization is not merely a 2023 historical lead; these two families had current changelog activity at the end of 2025. Full 2026 schema/currentness recheck remains desirable before implementation.

### Generated reports

2025-12-25 and 2026-02-03 notifications confirm current activity for:

- `/v1/report/info`;
- `/v1/report/list`;
- `/v1/report/placement/by-products/create`;
- `/v1/report/placement/by-supplies/create`;
- `/v1/report/postings/create`;
- `/v2/report/returns/create`.

Conclusion: report job/list/info surface exists; future bridge must model report creation and result retrieval as separate explicit operations with no hidden polling/fan-out.

## 7. Reviews / questions — read families confirmed

### Reviews

2026-03-31 notification updated method descriptions for:

- `/v1/review/comment/list`;
- `/v1/review/count`;
- `/v1/review/info`;
- `/v1/review/list`;
- plus write/status methods outside initial scope.

Conclusion: review read family is **CURRENT CONFIRMED** as of 2026-03-31.

### Questions

- 2025-09-18 notification updated `/v1/question/list` response description;
- question family also includes `/v1/question/count`, `/v1/question/info`, `/v1/question/top-sku` from earlier official notifications.

Conclusion: questions read family is **CONFIRMED FAMILY**, but current 2026 schema/access restrictions still need library refresh.

## 8. Advertising remains the main unresolved external contour

The Seller API community exposes a separate `API рекламной платформы` category, so the contour is real. This pass still did not obtain a current Ozon-owned changelog/library surface that is sufficient to verify the exact read-only host/auth/campaign/statistics methods for impressions, clicks, spend, CTR/CPC/CPM and attributed orders/revenue.

Advertising therefore remains `PENDING` and blocking for full causal seller diagnostics.

## 9. Research impact

This pass supersedes earlier negative-search conclusions **only where the verified changelog now supplies currentness evidence**.

It materially closes endpoint-family existence for:

- catalog/list/product info/attributes;
- prices and seller-action read families;
- seller/Ozon warehouse lists and clusters;
- current FBS list replacement versions;
- returns reports/list families and cancellation status/reason families;
- realization/report families;
- reviews/questions.

It does **not** close 03A.3 because implementation-critical schemas, HTTP verbs where not stated, pagination/history/rate/access constraints and advertising exact API are still incomplete.

`03A.4 — Ozon extension` remains **NOT STARTED**.
