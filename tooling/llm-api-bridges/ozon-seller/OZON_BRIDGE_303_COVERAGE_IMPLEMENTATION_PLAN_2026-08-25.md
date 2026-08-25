# Ozon Bridge — 303-role read-coverage implementation plan

Date: 2026-08-25  
Status: documentation/coverage milestone; **not production authorization**  
Branch: `docs/ozon-api-complete-coverage-2026-08-25`

## 1. Goal

Expand Ozon Bridge from the current narrow guided set to the account-authorized read surface identified by the 303-role classification, while keeping the existing read-only, privacy, quota, one-request, and work-session guarantees.

A method appearing in `/v1/roles` is not enough to expose it. Each alias needs a fixed current contract, validator, safe response projection, guidance recipe and regression coverage.

## 2. Fixed coverage numbers

The live Seller key grants 303 exact methods:

- 98 `READ_SAFE`
- 65 `READ_CONDITIONAL`
- 19 `READ_PII_BLOCKED`
- 84 `MUTATION_BLOCKED`
- 37 `LEGACY_AUTHORIZED_NOT_TARGET`

Target Seller read surface: **163 methods**.

Existing Seller Bridge coverage: **8 enabled aliases**. Existing Performance provider: **4 enabled read aliases** and remains separate.

Immediate normal-read expansion pool: **90 methods**. Conditional expansion pool: **65 methods**.

## 3. New guidance cluster model

Replace the assumption that six clusters describe the Seller API. Keep compatibility aliases where useful, but implement the target semantic model:

1. `account_access` — roles and account capability reads.
2. `catalog_products` — product list/info, attributes, descriptions, images, content rating, related SKUs, rich content and read-only diagnostics.
3. `stocks_inventory` — aggregate stock, FBO/FBS stock by warehouse and FBO stock analytics.
4. `warehouse_cluster_logistics` — warehouses, clusters and seller logistics configuration/reference reads.
5. `sales_analytics` — Seller analytics other than search and stock.
6. `search_visibility` — product-query and marketplace search-query analytics.
7. `prices_promotions` — product prices and read-only promotion/action lists.
8. `orders_postings` — FBO/FBS/FBP posting and assembly reads, subject to privacy gates.
9. `supplies_fbo` — supply orders, supply status, draft/status/reference reads and cargo reference reads.
10. `returns_cancellations` — cancel reasons, cancellation status and safe return views.
11. `finance_settlement` — accruals, balances, realization and seller financial reads.
12. `reports_exports` — report creation/status/list/info with explicit multi-step semantics.
13. `delivery_fbs_diagnostics` — delivery methods, carriage status, FBS error index and operational diagnostics.
14. `reviews_questions` — aggregate/safe views initially; content-bearing rows remain privacy-blocked.
15. `certification_reference` — certificate types/status/reference/list reads.
16. `seller_settings_reference` — read-only seller/FBS configuration and management information.
17. `customer_communications` — not enabled by default; chat content is privacy-blocked.
18. `reference_data` — neutral reference reads not naturally owned by another business cluster.

Performance API remains `advertising_performance` and is not merged into Seller `/v1/roles` accounting.

### Compatibility rule

Existing cluster IDs may remain accepted during migration:

- `stock_inventory` -> `stocks_inventory`
- `fulfillment_supply` -> `supplies_fbo`
- `sales_analytics`, `search_visibility`, `account_access`, `advertising_performance` remain stable.

Do not break old startup prompts while new guidance is rolled out.

## 4. Capability model: Free, Premium and live roles

Do not hard-code subscription entitlement from an OpenAPI section label.

Required capability decision:

```text
CURRENT_CONTRACT
  AND LIVE_ROLE_GRANT
  AND BRIDGE_SAFETY_CLASS
  AND REQUEST_VALIDATION
  AND RESPONSE_PRIVACY_PROJECTION
  => runnable alias
```

The live Free account currently grants ten methods placed in the OpenAPI `Premium` section. Therefore `is_premium=false` must not suppress a method that the exact account role list grants.

Runtime restrictions are still possible. A metric, dimension, period or field can require a qualifying subscription even when the endpoint itself is role-authorized. In that case:

- execute only the explicit requested operation;
- return the provider's safe error/result;
- do not silently replace the metric;
- do not retry with another period;
- do not claim the whole endpoint is unavailable unless the provider contract/result proves that.

### Role discovery behavior

For the next Bridge version, treat `/v1/roles` as capability metadata.

Do **not** add hidden provider calls merely to refresh roles before every command. Acceptable designs are:

- operator explicitly runs `roles`, then the verified result updates local capability metadata; or
- capability metadata is refreshed by a separately explicit account-access action.

The role cache needs its own timestamp and credential-identity scope. It must not reset quota/timers/history/cache for business operations.

## 5. Phase 1 — high-value `READ_SAFE` expansion

Priority is business usefulness and prerequisite chaining, not raw endpoint count.

### 5.1 Stocks and warehouse geography — first

Add fixed aliases for:

- `POST /v1/analytics/stocks`
- `POST /v1/product/info/stocks-by-warehouse/fbo`
- `POST /v2/product/info/stocks-by-warehouse/fbs`
- `POST /v2/warehouse/list`
- `POST /v1/warehouse/fbo/seller/list`
- `POST /v1/warehouse/ozon/list` only after its current beta/main contract is revalidated
- `POST /v2/cluster/list`

Why first: this directly fixes the tested failure mode where the model saw only `stocks_current` and concluded warehouse/historical capabilities did not exist.

`/v1/analytics/stocks` deserves the first contract because its current response exposes warehouse identifiers/names, SKU/offer information, cluster identifiers and multiple stock quantities.

### 5.2 Product master prerequisites

Add:

- `POST /v3/product/list`
- `POST /v3/product/info/list`
- `POST /v4/product/info/attributes`
- `POST /v1/product/info/description`
- `POST /v2/product/pictures/info`
- `POST /v1/rich-content/get`
- read-only category/attribute tree methods
- safe certificate/reference reads

This lets the AI obtain product/SKU/offer prerequisites itself instead of asking the user for identifiers the Bridge can retrieve.

### 5.3 Prices, promotions and search

Add safe reads for:

- `POST /v5/product/info/prices`
- `POST /v1/product/prices/details`
- seller-action list/product candidate/list reads
- `POST /v1/search-queries/text`
- `POST /v1/search-queries/top`

Existing product-query aliases remain.

### 5.4 Supply and logistics

Add safe reads for:

- `POST /v3/supply-order/list`
- `POST /v1/supply-order/item`
- warehouse and cluster reference methods
- delivery-method lists
- non-PII carriage list/get reads
- rating/error-index reads

### 5.5 Finance and cancellation references

Add safe finance/account methods, cancel-reason lists, status/reference methods and aggregated diagnostics that have no personal-data payload.

## 6. Phase 2 — `READ_CONDITIONAL` generated reports and documents

Implement one workflow family at a time. Do not create a generic arbitrary-report transport.

For each report family expose separate fixed aliases such as:

```text
report_<family>_create
report_list
report_info
```

Rules:

- create is one explicit external request;
- status/info is another explicit external request;
- retrieval/file handling is another explicit operation if needed;
- no hidden polling;
- no hidden sleep/retry loop;
- no automatic download into model context;
- binary/PDF/XLS/ZIP data is handled as a file artifact or metadata, not embedded blindly in the LLM result;
- customer-data report options default off and may remain permanently blocked.

The current role list includes report creation for postings, products, returns and realization postings plus report list/info. These can be added after exact request/response contracts are verified.

## 7. Phase 3 — privacy-gated row-level reads

`READ_PII_BLOCKED` is not an invitation to redact ad hoc in JavaScript.

Before enabling a blocked endpoint:

1. enumerate every response field from the current contract;
2. identify customer/contact/user/message fields;
3. define a positive allowlist of fields that may cross the LLM boundary;
4. transform the provider response into that allowlisted projection;
5. prove raw provider payload is not written to model-visible logs/history;
6. add fixtures containing synthetic PII and assert it is absent from the delivered result;
7. independently browser-test the exact alias.

Priority blocked families include:

- FBS posting detail/list surfaces;
- chat history;
- courier contact reads;
- user info/list;
- question/review content reads.

The existing `posting_fbs_get` remains blocked until this work is complete.

## 8. Phase 4 — legacy role grants

The 37 `LEGACY_AUTHORIZED_NOT_TARGET` methods must not be implemented from names alone.

For each:

- search current Ozon-owned docs/changelog;
- identify current replacement or confirm current exact contract;
- if replaced, map the business capability to the replacement, not the legacy path;
- if current exact contract is recovered, re-run semantic classification;
- if state-changing, keep mutation-blocked;
- if read-safe/conditional, add to the appropriate target cluster.

Authorization from `/v1/roles` never overrides currentness/deprecation safety.

## 9. Historical stock research lane

This is a dedicated contract task, not a guessed alias.

Known facts at this milestone:

- `stocks_current` (`POST /v4/product/info/stocks`) is current aggregate stock and works with `filter:{}`.
- `POST /v1/analytics/stocks` is role-authorized and provides warehouse-level current stock analytics.
- `POST /v1/product/info/stocks-by-warehouse/fbo` and `POST /v2/product/info/stocks-by-warehouse/fbs` are role-authorized warehouse-level reads.
- current OpenAPI includes `POST /v1/report/warehouse/stock`, but this account's live 303 roles do not grant it.
- the recovered `/v1/report/warehouse/stock` request does not prove arbitrary historical date selection.

Next historical-stock research must search the **full current report/finance/supply/stock-movement surfaces** and classify one of these outcomes with evidence:

A. direct stock snapshot by date exists and the current account is authorized;  
B. direct historical report exists but the current key is not authorized;  
C. exact stock-at-date can be reconstructed from a proven complete movement ledger;  
D. upstream current API does not expose sufficient data for exact reconstruction.

Do not jump from Bridge guidance absence to outcome D.

## 10. Alias implementation contract

Every new alias needs a registry record with at least:

- alias;
- provider;
- exact HTTP method;
- exact fixed path;
- semantic cluster;
- safety class;
- role requirement;
- subscription notes;
- request schema;
- required/optional parameters;
- numeric/date/page limits;
- response projection;
- pagination token semantics;
- PII policy;
- cacheability;
- quota class;
- currentness evidence;
- deprecation/replacement state.

The model may supply only documented business parameters. It may never supply transport/auth fields.

## 11. Guidance behavior

The startup prompt remains universal and does not enumerate the full API.

When the AI needs data:

1. preserve the original user task;
2. use a confirmed current alias if known;
3. otherwise request the relevant cluster guidance;
4. if a prerequisite is missing, prefer another safe Bridge read to obtain it;
5. emit at most one Bridge command in a response;
6. after the result, either answer the original task or explain the next single read needed;
7. never invent an alias;
8. never conclude “Ozon API cannot do this” merely because the current Bridge cluster lacks an operation.

Guidance should distinguish:

- `BRIDGE_SUPPORTED`
- `BRIDGE_NOT_YET_SUPPORTED`
- `ACCOUNT_NOT_AUTHORIZED`
- `BLOCKED_MUTATION`
- `BLOCKED_PII`
- `LEGACY_CONTRACT_NOT_TARGET`

This prevents incomplete Bridge coverage from being misreported as upstream API impossibility.

## 12. Testing and acceptance per expansion batch

Each batch must include:

- exact artifact/tree identity;
- schema/registry test: every enabled alias has one cluster and one fixed method/path;
- role-capability test;
- validator positive/negative tests;
- no arbitrary transport injection;
- no mutation aliases;
- PII projection regression;
- one-command/one-request assertion;
- no hidden retry/pagination/fanout;
- quota/timer/cache/history preservation;
- Manual mode delivery regression;
- existing guided-discovery regression;
- lifecycle A.4/A.5 regressions;
- **no Autorun code changes** for this coverage work unless separately scoped and authorized.

Codex remains an independent tester only. Production expansion is accepted only after exact candidate browser validation.

## 13. Suggested delivery batches

To keep reviewable contracts:

- **B1 — Stock/geography:** analytics stocks, FBO/FBS warehouse stocks, warehouses, clusters.
- **B2 — Product prerequisites:** product list/info/attributes/description/images/rich content.
- **B3 — Price/search/promotion reads.**
- **B4 — Supply/logistics safe reads.**
- **B5 — Finance/cancellation safe reads.**
- **B6 — Generated reports/documents.**
- **B7 — Privacy-projected row-level reads**, only where the allowlist contract is proven.
- **B8 — Legacy/replacement reconciliation.**

Do not implement all additional aliases in one patch.

## 14. Completion criterion

This roadmap is complete only when every method derived into the target read surface has one terminal implementation state:

- `ENABLED_ACCEPTED`
- `GATED_ACCEPTED`
- `BLOCKED_BY_ACCOUNT`
- `BLOCKED_BY_POLICY`
- `REPLACED_CURRENT_METHOD`
- `RETIRED_NOT_TARGET`

No `PENDING`, no guessed aliases, and no “unsupported by Ozon” conclusion based solely on current Bridge coverage.