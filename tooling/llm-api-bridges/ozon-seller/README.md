# Ozon Seller / Performance API bridge

Статус: **read-only Ozon LLM↔API Bridge реализован; канонические reference snapshots v0.1.3, v0.1.4 и v0.1.5 существуют. Research artifacts 03A.3 сохранены как историческая/provenance база и больше не являются authority для факта существования расширения.**

Эта директория содержит одновременно research/provenance artifacts, operational constraints, versioned immutable bridge snapshots и текущую эксплуатационную документацию.

## Current implementation authority

Для состояния реализованного bridge использовать в таком порядке:

1. `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` — обязательный канонический append-only журнал истории bridge;
2. `reference-0.1.5/` — текущий version-specific immutable evidence snapshot; исправляет Manual error-to-chat lifecycle и завершает общий Manual/Autorun controlled-error invariant;
3. `reference-0.1.4/` — неизменяемый предыдущий snapshot исправления Autorun pre-execution observability gap;
4. `reference-0.1.3/` — неизменяемый более ранний accepted snapshot и базовый lineage artifact;
5. version-specific changelog/test/build/package evidence внутри соответствующего `reference-*` каталога.

### Mandatory append-only rule

Любое последующее изменение production bridge, defect fix, security change, test-hardening pass, packaging/build evidence, release, operational incident, acceptance/rejection decision или superseding correction считается документированным только после добавления новой датированной секции **в конец** `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md`.

Исторические записи в `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` запрещено переписывать, переставлять, удалять, сокращать или молча исправлять. Ошибка в старой записи исправляется только новой append-only correction entry с явной ссылкой на затронутую запись.

Version-specific `reference-*` каталоги являются evidence snapshots и не переписываются задним числом ради нового релиза.

## Historical research authority

Следующие state/contract artifacts остаются важной research/provenance базой, но их старые lifecycle/status формулировки не должны использоваться для вывода, что bridge ещё не существует:

1. `OZON_03A3_COMPLETENESS_V1.json` — исторический research machine gate;
2. `OZON_READ_ONLY_ALLOWLIST_V1.json` — research candidate registry + do-not-use paths;
3. `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` — общая contract queue;
4. `OZON_PRODUCT_MASTER_CONTRACT_QUEUE_V1.json` + `OZON_PRODUCT_REPORT_FALLBACK_2026-08-11.md`;
5. `OZON_LOGISTICS_CONTRACT_QUEUE_V1.json` + `OZON_DELIVERY_QUOTE_PREFLIGHT_2026-08-11.md`;
6. `OZON_AVERAGE_DELIVERY_TIME_RETIREMENT_2026-08-11.md` + `OZON_DELIVERY_DIAGNOSTICS_ALTERNATIVES_2026-08-11.md`;
7. currentness/fragment/operation-locator/operational evidence files;
8. `OZON_PERFORMANCE_API_GAP_2026-08-11.md` + discovery queue.

Older negative-search snapshots are historical/partially superseded where later Ozon-owned evidence confirmed a family.

## Product Master

Primary research chain:

`product/list → product/info/list → attributes → pictures → description-category dictionaries → prices → stock/warehouses`.

Confirmed cross-method join: `sku` between `/v3/product/list` and `/v3/product/info/list`.

Still unproven on current full contracts: title/name, barcodes, dimensions/weight, current category/type placement, video/rich-content, full moderation/error state.

### Generated product-report fallback

`/v1/report/products/create` is an active generated-report family; Ozon updated request `visibility` on 2026-01-22.

It is **fallback only**, not a primary automatic step. Current output columns, exact report type and canonical operation id are not recovered from Ozon-owned docs in this runtime. Therefore the report closes **none** of the missing Product Master fields yet.

Future execution rule: explicit report create → later explicit status/info → later explicit retrieval. No hidden polling.

## Logistics / delivery diagnostics

Current configuration/diagnostic families include seller logistics info, warehouse/delivery-method/carriage configuration, FBS/rFBS error index, products/warehouses with FBS delivery restrictions and FBS posting promised-delivery fields.

The old `/v1/analytics/average-delivery-time*` family is **retired/do-not-target**; Ozon later disabled the whole feature and removed its methods. No one-to-one replacement is assumed.

### Conditional delivery quote surface

Current Ozon evidence also exposes the pre-order contour:

`/v1/delivery/check → /v2/delivery/checkout → /v2/order/create`.

Important boundaries:

- `/v1/delivery/check` has required `client_phone` in current documentation changes, so PII review is mandatory;
- `/v2/delivery/checkout` was updated 2026-08-06 to return preliminary service cost in addition to preliminary delivery time;
- check/checkout are **not seller-wide baseline analytics** and must not run automatically across products/customers;
- side-effect/server-state classification is still pending;
- `/v2/order/create` is a mutation and remains outside initial scope.

## Orders / finance / reports

Current posting targets use `/v3/posting/fbo/list`, `/v3/posting/fbs/get` and v4 FBS list/unfulfilled. Deprecated list versions must not be used.

Finance target is `/v1/finance/accrual/*`; `/v3/finance/transaction/list` and `/totals` shut down 2026-09-08. In `accrual/by-day`, old `type_id` was renamed to `accrual_id`.

Generated reports are always explicit multi-step operations; hidden polling/fan-out is forbidden.

## Operational constraints

Known: Seller API key lifetime 6 months, `/v1/roles.expires_at`, last explicit general-rate evidence 50 req/s per Client ID, unified product-operation limit model, report expiry fields. Unknown numeric/page/history/access values are not guessed.

`/v1/analytics/stocks` has an announced real-time transition on **2026-08-17** and cannot be post-transition revalidated yet on 2026-08-12.

For implemented bridge behavior and current release history, use `OZON_BRIDGE_APPEND_ONLY_DOCUMENTATION.md` plus the matching immutable `reference-*` snapshot rather than stale lifecycle text in older research artifacts.

## Performance API — separate bridge gap

Ozon-owned 2026 material treats Performance API as a separate public API surface. Performance support is not implied by the Seller bridge reference snapshots.

Current Performance research/gap evidence remains in `OZON_PERFORMANCE_API_GAP_2026-08-11.md` and related discovery artifacts. Any future Performance bridge implementation must follow the same read-only/security principles and receive its own explicit implementation/evidence history.

## Implementation safety invariants

For the implemented Seller bridge lineage:

- one accepted `OZON_API_V1` command executes at most one external Ozon API request;
- no hidden retry, pagination loop or fan-out;
- no arbitrary URL/host/method/header injection from assistant text;
- credentials remain isolated from ChatGPT/content-script output;
- no customer PII collection through intentionally blocked surfaces;
- no mutation/write operations in the read-only bridge;
- controlled Manual and Autorun failures that occur after trusted conversation/binding ownership but before provider execution must be represented observably to ChatGPT with `external_request_executed:false` rather than disappearing into a local-only UI error path;
- provider transport exceptions after one attempted request must be represented as `OZON_RESULT_V1 result.error` with no hidden retry;
- identity/binding/security failures that cannot safely establish the target conversation remain fail-closed and are not injected into an untrusted or wrong chat.
