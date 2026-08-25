# Ozon Seller API — 303 live-role coverage milestone

Date: 2026-08-25  
Branch: `docs/ozon-api-complete-coverage-2026-08-25`  
Account capability source: live `POST /v1/roles` response  
Bridge baseline: `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`

## 1. What this milestone closes

This milestone classifies **all 303 exact method/path grants** returned by the configured Seller API credentials. There are **no `PENDING`, unknown, or unclassified rows** in the machine registry.

This is a Bridge safety/implementation classification, not an attempt to reinterpret Ozon's authorization service. Three questions are kept separate:

1. **Account authorization:** is exact `method + path` granted by the live `/v1/roles` response?
2. **Current contract:** is the exact method/path recovered in the current 463-operation Ozon Seller OpenAPI mirror?
3. **Bridge eligibility:** is the operation safe for the read-only Bridge, conditionally safe, PII-blocked, mutation-blocked, or legacy/not-target?

The machine authority for this milestone is `OZON_API_303_ROLE_METHOD_CLASSIFICATION_2026-08-25.json`.

## 2. Live account snapshot

The captured account metadata is:

- `subscription_type = Free`
- `is_premium = false`
- `is_premium_plus = false`
- `is_advertising = false`
- `is_analytics = false`
- `is_crossborder = false`
- `is_brand = false`
- `company_type = Seller`
- `seller_type = Marketplace`
- exact role grants = **303**

Every registry row is therefore an account-authorized Seller API method for this key at the time of the capture.

## 3. Current OpenAPI reconciliation

The current reference used for contract reconciliation is the 463-operation Seller OpenAPI mirror in `MissiaL/ozon-api`, whose index identifies its source as Ozon's Seller Swagger.

Exact reconciliation used by this milestone:

- live role entries: **303**
- unique live `(method,path)` pairs: **303**
- current OpenAPI operations in the mirror: **463**
- live role paths with no exact current-mirror match: **37**
- live role methods that are in the current OpenAPI `Premium` section: **10**

The 37 role-only methods are **not treated as implementation-ready just because the key is authorized**. They are classified `LEGACY_AUTHORIZED_NOT_TARGET` until an exact current Ozon-owned contract is recovered.

## 4. Classification totals

| Classification | Count |
| --- | ---: |
| READ_SAFE | 98 |
| READ_CONDITIONAL | 65 |
| READ_PII_BLOCKED | 19 |
| MUTATION_BLOCKED | 84 |
| LEGACY_AUTHORIZED_NOT_TARGET | 37 |

Total: **303**.

Definitions:

- `READ_SAFE` — ordinary informational read candidate.
- `READ_CONDITIONAL` — read/status/export/document operation that needs an explicit workflow, privacy, binary, or contract gate.
- `READ_PII_BLOCKED` — read-like surface that can expose personal/customer/contact/message data; excluded until a safe field projection is proven.
- `MUTATION_BLOCKED` — changes business state or starts a state-changing workflow; never exposed by the read-only Bridge.
- `LEGACY_AUTHORIZED_NOT_TARGET` — live authorization exists, but the exact current contract was not recovered.

The resulting target read surface for the current account is **163 methods**: **98 normal safe reads + 65 gated reads**.

## 5. Current Bridge coverage versus target

The current Seller side of Bridge v0.1.19 exposes **8 enabled Seller aliases** represented in the 303-role set:

- `analytics_data`
- `product_queries`
- `product_queries_details`
- `stocks_current`
- `posting_fbo_list`
- `supply_order_get`
- `supply_order_details`
- `roles`

The existing Performance API provider contributes four additional enabled read aliases and stays a separate provider surface.

Against the Seller target of 163 safe/gated reads:

- current enabled Seller reads: **8**
- additional normal safe candidates: **90**
- additional gated candidates: **65**
- PII exclusions: **19** total, including current explicit blocked `posting_fbs_get`
- mutation exclusions: **84**
- legacy/current-contract exclusions: **37**

This is the core coverage finding: **absence from the current six Bridge guidance clusters is often a Bridge coverage gap, not proof that Ozon Seller API lacks the capability.**

## 6. Replacement target clusters

The coverage registry assigns the target read surface to these semantic domains:

- `account_access`
- `catalog_products`
- `stocks_inventory`
- `warehouse_cluster_logistics`
- `sales_analytics`
- `search_visibility`
- `prices_promotions`
- `orders_postings`
- `supplies_fbo`
- `returns_cancellations`
- `finance_settlement`
- `reports_exports`
- `delivery_fbs_diagnostics`
- `reviews_questions`
- `certification_reference`
- `seller_settings_reference`
- `customer_communications`
- `reference_data`

The old six-cluster guidance is too narrow for full read coverage. `advertising_performance` remains a separate Performance API domain rather than being counted inside Seller `/v1/roles`.

## 7. Premium versus Free: exact rule

The live account says `subscription_type=Free` and `is_premium=false`, but its `/v1/roles` grants **all ten methods currently grouped under the OpenAPI `Premium` section**:

- `POST /v1/analytics/data`
- `POST /v1/analytics/product-queries`
- `POST /v1/analytics/product-queries/details`
- `POST /v1/chat/send/message`
- `POST /v1/chat/start`
- `POST /v1/finance/realization/by-day`
- `POST /v1/product/prices/details`
- `POST /v1/search-queries/text`
- `POST /v1/search-queries/top`
- `POST /v2/chat/read`

Therefore Bridge must **not** implement the rule “Premium section => unavailable on Free”.

The correct capability gate is:

1. exact current method/path contract exists;
2. exact method/path is present in the current account's `/v1/roles`;
3. Bridge safety policy permits it;
4. request validator/privacy projection permits the concrete call;
5. any metric/history/field/subscription restriction is handled from the provider response, without hidden substitution or retry.

The OpenAPI section label is descriptive documentation metadata; the live role grant is the stronger account-specific reachability signal. It still does not guarantee every metric, dimension, period, or field will succeed.

## 8. Stock/history gap — corrected finding

The original business test exposed a real guidance gap.

Already proven in Bridge:

- `POST /v4/product/info/stocks` -> `stocks_current`
- `filter: {}` works on the real account and can enumerate the current stock set.

But the live 303-role set also grants current stock surfaces that Bridge does **not** expose yet:

- `POST /v1/analytics/stocks`
- `POST /v1/product/info/stocks-by-warehouse/fbo`
- `POST /v2/product/info/stocks-by-warehouse/fbs`

The current OpenAPI contract for `/v1/analytics/stocks` includes `warehouse_id` and `warehouse_name` in the response, so it is directly relevant to warehouse-level stock analysis.

The current OpenAPI also contains `POST /v1/report/warehouse/stock`, which creates an FBS warehouse-stock report and returns a report code for later `/v1/report/info`. However, that report endpoint is **not present in this account's 303 live role grants**, and the recovered request contract does not establish an arbitrary historical `date_from/date_to` stock snapshot.

Therefore the safe conclusion is:

- the earlier “product IDs are required” claim was wrong;
- the earlier “Ozon API cannot provide other stock data” inference was also wrong;
- current Bridge guidance is materially incomplete for stock/warehouse reads;
- the proven current stock endpoints still do **not** by themselves establish exact historical stock-at-date capability;
- historical reconstruction/report capability must be researched as a separate contract problem rather than declared impossible.

## 9. 37 role-authorized methods excluded for missing exact current contract

These methods appeared in the live `/v1/roles` response but were not recovered as exact method/path entries in the current 463-operation mirror:

- `POST /v1/assembly-posting-found/resolve`
- `POST /v1/calendar/day/list`
- `POST /v1/cargoes/label/transport-by-order/create`
- `POST /v1/cargoes/label/transport-by-order/get`
- `POST /v1/cargoes/transport/container/delete`
- `POST /v1/cargoes/transport/container/delete/status`
- `POST /v1/cargoes/transport/container/get`
- `POST /v1/cargoes/transport/container/list`
- `POST /v1/cargoes/transport/container/remove`
- `POST /v1/cargoes/transport/container/set`
- `POST /v1/cargoes/transport/container/set/status`
- `POST /v1/carriage/ettn/status`
- `POST /v1/cluster/list`
- `POST /v1/fbo/basket/available`
- `POST /v1/fbo/basket/create`
- `POST /v1/fbo/basket/get`
- `POST /v1/fbo/basket/get-stickers/pdf`
- `POST /v1/fbo/basket/get-stickers/zip`
- `POST /v1/fbo/basket/get-transit`
- `POST /v1/fbo/basket/set`
- `POST /v1/fbo/basket/sticker/add`
- `POST /v1/fbo/basket/sticker/create`
- `POST /v1/fbo/basket/sticker/delete`
- `POST /v1/fbo/basket/sticker/get`
- `POST /v1/fbo/basket/sticker/set`
- `POST /v1/fbo/operation-status`
- `POST /v1/fbo/supply`
- `POST /v1/fbo/supply/close`
- `POST /v1/fbo/supply/create`
- `POST /v1/fbo/supply/remove`
- `POST /v1/fbo/supply/remove/status`
- `POST /v1/posting/fbs/child-label/create`
- `POST /v1/posting/fbs/child-label/get`
- `POST /v1/posting/fbs/create-multi-box-labels`
- `POST /v1/posting/fbs/parent-label/create`
- `POST /v1/posting/fbs/parent-label/get`
- `POST /v1/posting/fbs/sku-label/get`

They are deliberately fail-closed. A later milestone may reclassify an item only after recovering its exact current Ozon-owned contract or a documented current replacement.

## 10. Safety boundary preserved

Coverage expansion must not change these invariants:

- one explicit Bridge command -> at most one external business request;
- no hidden retry;
- no hidden pagination;
- no hidden fanout;
- no AI-controlled URL, host, HTTP method, headers, or credentials;
- no credentials in model-visible payloads;
- no customer PII in model results or logs;
- generated report create/status/retrieve steps remain separate explicit commands;
- no reset of provider quota timing, cache, request history, credentials, or work-session state as a feature mechanism;
- no Autorun changes in this milestone;
- mutation operations stay excluded even when the current account is authorized to call them.

## 11. Machine checks

The registry must satisfy these invariants:

- `role_keys == 303`
- unique `(method,path) == 303`
- every role resolves to exactly one terminal classification
- no classification contains `PENDING`
- `98 + 65 + 19 + 84 + 37 == 303`
- all class override lists are pairwise disjoint
- all 8 current Seller aliases map to exact role entries
- current blocked `posting_fbs_get` resolves to `READ_PII_BLOCKED`
- all 10 Premium-tagged live-role methods are explicitly represented

The target registry and implementation plan are separate so production code does not accidentally treat a research classification as authorization to enable an operation.