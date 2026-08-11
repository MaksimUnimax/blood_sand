# Ozon Seller API — operational constraints evidence — 2026-08-11

Статус: **RESEARCH / PARTIAL CONTRACT EVIDENCE — NOT IMPLEMENTATION COMPLETE**

Цель: отдельно фиксировать operational constraints, которые уже подтверждены Ozon-owned currentness sources и должны попасть в будущий bridge/acceptance design. Отсутствующие числа/лимиты не додумываются.

## 1. API key lifecycle

Verified `Ozon Seller API notification` сообщает:

- с **13 февраля 2026 года** у Seller API-ключа есть срок действия;
- ключ активен **6 месяцев с момента создания**;
- 20 февраля 2026 в разделе документации `Авторизация через API-ключ` обновлена информация;
- `/v1/roles` получил response field `expires_at`.

Engineering consequence for future Ozon bridge:

- локальное credential state должно различать `missing`, `invalid`, `expired/expiring` там, где это можно определить безопасно;
- real-account acceptance должен зафиксировать actual key expiry/roles response, не выводя secret в LLM/log;
- ошибка авторизации после ранее успешной работы не должна автоматически интерпретироваться как network/provider outage;
- secrets по-прежнему хранятся только локально.

Source currentness:

- verified `@OzonSellerAPI` notification stream, February 2026.

## 2. Unified product-operation limits

Verified Ozon notification сообщает:

- с **24 февраля 2026** введён единый лимит на операции с товарами для множества Seller API methods;
- 9 июня 2026 `/v4/product/info/limit` получил response field `operation_limits`.

What is proven:

- product operations have an explicit shared-limit model;
- Ozon exposes method-family limit information through `/v4/product/info/limit`.

What is **not** proven from currently readable evidence:

- exact numeric quota values;
- reset cadence/window;
- which exact read methods share the same bucket;
- whether every catalog read call consumes the same quota;
- exact semantics of all `operation_limits` fields.

Engineering consequence:

- future bridge must not hardcode guessed product-operation quotas;
- before implementation/acceptance, full `/v4/product/info/limit` contract and relevant method-specific limit notes must be extracted;
- if a command requires a provider request whose quota state is material, preflight logic must use official returned limit information where possible rather than a stale constant.

## 3. 429 handling / rate-limit metadata

Ozon notification separately reports a 2026 update for `/v1/product/unarchive`: on `429 Too Many Requests`, additional data is returned in response headers to help optimise requests.

This is mutation-side evidence and the method itself is outside initial read-only scope, but it establishes an important transport lesson:

- Ozon may carry actionable throttling metadata in response headers;
- future transport should preserve safe non-secret rate-limit headers in diagnostics instead of reducing all 429 responses to a generic error.

Exact header names/semantics for the future read allowlist remain pending and must be verified method-by-method/current docs.

## 4. Known required request fields from current changelog

The current notification stream supplies several explicit required-field corrections relevant to planned read/report operations.

### `/v1/product/prices/details`

As of 2026-02-12:

- request `skus` is required.

### `/v2/report/returns/create`

As of 2026-02-12:

- request `filter` is required.

### `/v1/report/postings/create`

As of 2026-02-12:

- `filter.processed_at_from` is required;
- `filter.processed_at_to` is required.

These facts can be preserved in research specs, but complete bodies/limits still require authoritative method contracts before coding.

## 5. Pagination/cursor evidence visible in current changelog

For `/v1/finance/accrual/by-day`, Ozon updated request fields `date` and `last_id` on 2026-07-30, and response `last_id` as well.

This provides direct evidence that the new finance replacement family uses a continuation/cursor-like field.

What remains pending:

- precise `last_id` semantics;
- page size/limit relationship;
- terminal condition;
- ordering stability;
- date window;
- replay/idempotency implications.

Future bridge rule remains: one explicit command = one explicit provider request. Automatic unbounded continuation through `last_id` is forbidden; pagination must be explicit/controlled.

## 6. Generated report lifecycle

Current report families include:

- `/v1/report/realization/posting/create`;
- `/v1/report/postings/create`;
- `/v2/report/returns/create`;
- `/v1/report/list`;
- `/v1/report/info`.

Currentness evidence confirms separate create and list/info surfaces. Therefore initial architecture must model generated reports as separate explicit operations:

1. explicit report creation request;
2. later explicit status/info/list request;
3. explicit retrieval/download operation if current contract requires it.

No hidden polling, retry loop or automatic fan-out is allowed.

## 7. Deprecation windows are operational constraints

Known near-term shutdowns as of 2026-08-11:

- `/v2/posting/fbo/list` → shutdown **2026-08-31**, use `/v3/posting/fbo/list`;
- `/v3/posting/fbs/list` → shutdown **2026-08-31**, use `/v4/posting/fbs/list`;
- `/v3/posting/fbs/unfulfilled/list` → shutdown **2026-08-31**, use `/v4/posting/fbs/unfulfilled/list`;
- `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` → shutdown **2026-09-08**, use `/v1/finance/accrual/*` family.

Future acceptance must include a fresh deprecation scan immediately before coding/package acceptance, because a path that is callable today may already be a bad implementation target.

## 8. Stock analytics transition

Ozon announced that `/v1/analytics/stocks` switches to real-time data on **2026-08-17**. Before that transition, notification states data is updated twice daily at 07:00 and 16:00 UTC.

As of project date 2026-08-11 this change is still future.

Engineering consequence:

- do not freeze assumptions about freshness before 2026-08-17;
- revalidate the method after the announced transition before 03A.4/real-account acceptance;
- diagnostics must preserve source timestamp/freshness and not present delayed stock analytics as a live stock snapshot.

## 9. Remaining operational-contract gaps

Still blocking implementation:

- exact rate limits/quotas for each target read method;
- full shared product-limit model and `/v4/product/info/limit` schema;
- all page sizes/cursors/terminal conditions;
- history/date windows;
- account roles/scopes/subscription/Premium restrictions;
- response type JSON vs binary/generated report;
- safe headers worth retaining in diagnostics;
- current error taxonomy;
- Performance API auth/token lifetime/rate/report semantics.

## 10. Gate disposition

This artifact reduces `method_level_operational_constraints` uncertainty but does **not** close it.

- `03A.3` remains `[~] IN PROGRESS`;
- `03A.4` remains `NOT STARTED`.
