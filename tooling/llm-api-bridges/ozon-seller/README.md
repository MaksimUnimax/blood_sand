# Ozon Seller / Performance API research

Статус: **03A.3 API research in progress. Ozon browser extension does not exist; development has not started.**

Эта директория содержит только research/provenance artifacts для будущего read-only LLM↔Ozon bridge.

## Current authority order внутри этой директории

При конфликте старых и новых research snapshots использовать в таком порядке:

1. `OZON_03A3_COMPLETENESS_V1.json` — текущий machine-readable gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — current research candidate registry + do-not-use deprecated paths;
3. `OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md` — currentness/deprecation evidence до 2026-08-04;
4. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` — отдельный advertising/Performance API blocker;
5. `OZON_OFFICIAL_REVALIDATION_2026-08-11.md`;
6. `OZON_API_CAPABILITY_AUDIT_2026-08-10.md` и более ранние verification/search snapshots.

`OZON_NEGATIVE_VERIFICATION_2026-08-11.md` теперь **historical / partially superseded**: он сохраняется как evidence раннего отрицательного поиска, но не является current status source для catalog/price/warehouse/return/report path families.

## Что теперь подтверждено по currentness

Verified Ozon Seller API notification changelog materially закрыл вопрос существования/current versions для многих ранее неизвестных families:

### Catalog / product master

- `/v3/product/list` — current activity 2026-07-09;
- `/v3/product/info/list` — current activity 2026-07-10;
- `/v4/product/info/attributes` — current family.

### Prices / promotions

- `/v5/product/info/prices` — current, в 2026 обновлялся `marketing_actions` context;
- `/v1/product/prices/details` — moved beta→main 2026-03-04;
- seller-actions read families `/v1/seller-actions/list`, `/v1/seller-actions/products/list` visible in 2026 notification evidence.

### Warehouses / clusters

- `/v2/warehouse/list` — current replacement;
- `/v1/warehouse/list` — **disabled 2026-04-07, do not use**;
- `/v1/warehouse/ozon/list`, `/v1/warehouse/fbo/seller/list`, `/v2/cluster/list` exist as current/beta→main families;
- warehouse-level stock families exist separately from `/v4/product/info/stocks`.

### Orders / postings

Current future targets:

- `/v3/posting/fbo/list`;
- `/v3/posting/fbs/get`;
- `/v4/posting/fbs/list`;
- `/v4/posting/fbs/unfulfilled/list`.

Ozon again updated these target list families on **2026-08-04**.

Do not build against `/v3/posting/fbs/list` or `/v3/posting/fbs/unfulfilled/list`: shutdown scheduled 2026-08-31.

### Returns / cancellations

Current families are now visible for general/rFBS returns, generated returns reports, cancel-reason lookup and cancellation status. Complete cross-scheme event chronology still needs method-contract extraction.

### Finance / realization / reports

Critical correction:

- `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` are deprecated and scheduled for shutdown **2026-09-08**;
- future finance target = `/v1/finance/accrual/postings`, `/v1/finance/accrual/types`, `/v1/finance/accrual/by-day`;
- `/v1/finance/accrual/by-day` has current changes through **2026-07-30**;
- `/v1/finance/realization/posting`, `/v1/report/info`, `/v1/report/list` have direct **2026-07-28** currentness;
- `/v1/report/realization/posting/create` added beta on 2026-07-28.

Generated reports must be modeled as explicit create + later retrieve operations; no hidden polling/fan-out.

### Reviews / questions

- review read family (`/v1/review/list`, `/info`, `/count`, `/comment/list`) has 2026 currentness;
- question read family exists, but 2026 refresh/access contract is still pending.

## Что ещё НЕ готово для coding

Current path/family confirmation не равна implementation-ready contract.

Для большинства newly-confirmed families ещё нужны authoritative Ozon method contracts:

- HTTP verb where not independently established;
- full request/response schema;
- pagination/cursor/page-size/batch limits;
- history/date windows;
- rate limits/quotas;
- roles/scopes/account/subscription restrictions;
- complete error model;
- final deprecation check immediately before coding.

Interactive `docs.ozon.ru/api/seller/` в текущей research environment остаётся недоступна как stable browsable snapshot из-за redirect loop. Это не разрешает заменять её сторонними SDK/collections.

## Performance API — основной отдельный blocker

Ozon-owned advertising sources подтверждают, что `Performance API` — отдельный публичный API для автоматизации рекламных кампаний. Exact documentation root найден как `https://docs.ozon.ru/api/performance/`, но в текущей runtime он также уходит в redirect loop.

Поэтому пока не подтверждены authoritative method contracts для:

- current host/auth;
- campaign list/status/type;
- campaign→product mapping;
- impressions/clicks/spend;
- CTR/CPC/CPM;
- attributed orders/revenue;
- useful dimensions;
- read-only budget/bid context.

Сторонние индексы могут использоваться только как discovery hints; их endpoint snippets не переносятся в allowlist без Ozon-owned verification.

## Жёсткое правило

- public API only;
- no cabinet/site scraping fallback;
- no arbitrary URL transport;
- no write campaign/bid/budget scope in initial bridge;
- no deprecated targets;
- no endpoint promotion from third-party sources;
- `03A.4` не начинается, пока `OZON_03A3_COMPLETENESS_V1.json` содержит `extension_development_allowed=false`.

## Current roadmap disposition

- `03A.3 — Полный официальный API-аудит Ozon` = **[~] IN PROGRESS**;
- `03A.4 — Разработать Ozon LLM browser extension` = **[ ] NOT STARTED**.
