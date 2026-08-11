# Ozon Seller / Performance API research

Статус: **03A.3 API research in progress. Ozon browser extension does not exist; development has not started.**

Эта директория содержит только research/provenance artifacts для будущего read-only LLM↔Ozon bridge.

## Current authority order внутри этой директории

При конфликте старых и новых research snapshots использовать в таком порядке:

1. `OZON_03A3_COMPLETENESS_V1.json` — текущий machine-readable gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — current research candidate registry + do-not-use deprecated paths;
3. `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` — per-operation очередь недостающих implementation contracts;
4. `OZON_CONTRACT_FRAGMENT_REGISTRY_2026-08-11.json` — подтверждённые Ozon-owned fragments: cursor pagination, report expiry, conditional cancellations, rate evidence и field deprecations;
5. `OZON_CANONICAL_OPERATION_LOCATORS_2026-08-11.json` — exact official `#operation` locators, только когда они реально видны в Ozon notification links;
6. `OZON_OPERATIONAL_CONSTRAINTS_2026-08-11.md` — key lifetime, product-operation limits, 429/report/pagination evidence;
7. `OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md` — currentness/deprecation evidence до 2026-08-04;
8. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` — advertising/Performance API blocker;
9. `OZON_PERFORMANCE_DISCOVERY_QUEUE_V1.json` — discovery-only exact probes; `ozon_owned_confirmed=false` до official verification;
10. `OZON_OFFICIAL_REVALIDATION_2026-08-11.md` и базовые audits.

`OZON_NEGATIVE_VERIFICATION_2026-08-11.md` — historical / partially superseded evidence раннего отрицательного поиска, не current status source для уже подтверждённых path families.

## Current path/version evidence

### Catalog / product master

- `/v3/product/list` — current activity 2026-07-09;
- `/v3/product/info/list` — current activity 2026-07-10;
- `/v4/product/info/attributes` — current family.

Canonical Seller API anchors подтверждены Ozon-owned migration links для:

- `/v3/product/list` → `#operation/ProductAPI_GetProductListv3`;
- `/v3/product/info/list` → `#operation/ProductAPI_GetProductInfoList`.

### Prices / promotions

- `/v5/product/info/prices` — current; `marketing_actions` updated 2026-05-28;
- старый `price.marketing_price` удалён из current documentation 2025-11-12 — не проектировать вокруг него;
- `/v1/product/prices/details` — main since 2026-03-04;
- seller-actions read families `/v1/seller-actions/list`, `/v1/seller-actions/products/list` visible in 2026 notification evidence.

### Warehouses / clusters

- `/v2/warehouse/list` — current replacement;
- `/v1/warehouse/list` — **disabled 2026-04-07, do not use**;
- `/v1/warehouse/ozon/list`, `/v1/warehouse/fbo/seller/list`, `/v2/cluster/list` — current families;
- warehouse-level stock methods exist separately from `/v4/product/info/stocks`.

Confirmed pagination fragments for `/v2/warehouse/list`:

- request: `limit`, `cursor`;
- response: `cursor`, later `has_next`.

Numeric max `limit` remains pending.

### Orders / postings

Future targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Target list families updated again **2026-08-04**.

Do not build against v3 FBS list/unfulfilled: shutdown scheduled 2026-08-31.

### Returns / cancellations

Current evidence layers now include:

- `/v1/returns/list`;
- `/v2/returns/rfbs/list`;
- `/v2/report/returns/create`;
- cancel-reason/status families;
- **`/v2/conditional-cancellation/list`** for rFBS conditional cancellation applications.

`/v2/conditional-cancellation/list` lifecycle:

- beta added 2025-04-30;
- moved to main 2025-06-03;
- old v1 list/get removed in favor of v2 on 2025-09-03.

Write siblings `/approve` and `/reject` remain outside initial read-only scope.

Canonical anchors confirmed for:

- `/v1/returns/list` → `#operation/returnsList`;
- `/v2/report/returns/create` → `#operation/ReportAPI_ReportReturnsCreate`.

### Finance / realization / reports

Critical correction:

- `/v3/finance/transaction/list` and `/totals` shutdown scheduled **2026-09-08**;
- future target = `/v1/finance/accrual/postings`, `/types`, `/by-day`;
- `/v1/finance/accrual/by-day` updated through **2026-07-30** and exposes `date`, `last_id`, response `last_id`, `container_fees`, `accrued_category` fragments;
- `/v1/finance/realization/posting`, `/v1/report/info`, `/v1/report/list` have 2026-07-28 currentness;
- `/v1/report/realization/posting/create` added beta 2026-07-28.

Generated reports are explicit create → later info/list/retrieve operations; hidden polling/fan-out forbidden.

Confirmed report fragments:

- `/v1/report/info` exposes `result.expires_at`;
- `/v1/report/list` exposes `result.reports.expires_at`;
- canonical `/v1/report/info` locator = `#operation/ReportAPI_ReportInfo`.

### Reviews / questions

Review read family has 2026 currentness; question family exists but needs 2026 access/contract refresh.

## Operational constraints already established

- Seller API keys created under the 2026-02-13 policy live **6 months**; `/v1/roles` exposes `expires_at`;
- last explicit Ozon notification evidence for provider-wide rate is **50 requests/s across all methods per Client ID** (2025-05-22), with common rate-limit error documented 2025-06-05; no later general-rate change was found in the 2026 notification search, but this is **not hardcoded forever** — revalidate before coding;
- from 2026-02-24 Ozon has a unified product-operation limit model;
- `/v4/product/info/limit` exposes `operation_limits`, while numeric bucket/reset semantics remain pending;
- required-field fragments: `/v1/product/prices/details` requires `skus`; `/v2/report/returns/create` requires `filter`; `/v1/report/postings/create` requires `filter.processed_at_from` and `filter.processed_at_to`;
- `/v1/analytics/stocks` announced real-time switch on **2026-08-17**; revalidate after that date before implementation.

No unknown quota/page-size value is guessed.

## Что ещё НЕ готово для coding

Current path/family evidence ≠ implementation-ready contract.

`OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` + `OZON_CONTRACT_FRAGMENT_REGISTRY_2026-08-11.json` track what is known and missing. Still required for P0 targets:

- HTTP verb where not independently established;
- full request/response schema;
- pagination/cursor/page-size/batch limits;
- history/date windows;
- current quotas/rate limits;
- roles/scopes/account/subscription restrictions;
- complete error model;
- final deprecation scan immediately before coding.

Interactive `docs.ozon.ru/api/seller/` remains inaccessible in this runtime due redirect loop. Third-party SDKs/mirrors do not close contracts.

## Performance API — основной отдельный blocker

Ozon-owned sources confirm Performance API as separate public advertising API. Official documentation root: `https://docs.ozon.ru/api/performance/`, but the current runtime also gets a redirect loop.

`OZON_PERFORMANCE_DISCOVERY_QUEUE_V1.json` contains exact discovery probes, but every candidate is `ozon_owned_confirmed=false` and does not enter allowlist.

Still missing authoritative Ozon contracts for host/auth, campaigns, product mapping, advertising statistics, dimensions, budgets/bids and async/token/rate/history lifecycle.

## Жёсткие правила

- public API only; no cabinet/site scraping fallback;
- no arbitrary URL transport;
- initial provider is read-only;
- no deprecated targets;
- no endpoint promotion from third-party sources;
- no automatic unbounded pagination;
- generated reports = separate explicit operations;
- `03A.4` cannot start while `OZON_03A3_COMPLETENESS_V1.json` says `extension_development_allowed=false`.

## Current roadmap disposition

- `03A.3 — Полный официальный API-аудит Ozon` = **[~] IN PROGRESS**;
- `03A.4 — Разработать Ozon LLM browser extension` = **[ ] NOT STARTED**.
