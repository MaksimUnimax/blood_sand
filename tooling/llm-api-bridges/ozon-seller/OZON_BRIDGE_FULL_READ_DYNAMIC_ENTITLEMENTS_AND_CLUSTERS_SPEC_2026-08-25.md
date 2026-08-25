# Ozon Bridge — full read coverage, dynamic Premium rules and generated guidance

Date: 2026-08-25  
Status: **implementation authority for the next Seller API coverage expansion**  
Branch: `docs/ozon-api-complete-coverage-2026-08-25`  
Production baseline to preserve: exact v0.1.19 A.5 candidate lineage from `9ebc673c2e0dd9dc24f6cbab90455396328f0aad` unless a later accepted baseline is explicitly selected before implementation.

## 1. Decisions fixed by this specification

This specification replaces the earlier idea that the current account's 303 `/v1/roles` grants define the full Bridge implementation target.

The following decisions are fixed and must not be redesigned during implementation.

### 1.1 Full implementation inventory comes from the complete current Seller API contract

The Bridge implementation universe is the **complete current Ozon Seller OpenAPI/Swagger**, not the current account's `/v1/roles` response.

Current research snapshot used by this design:

- canonical Ozon source: `https://docs.ozon.ru/api/seller/swagger.json`;
- audited mirror: `MissiaL/ozon-api/references/ozon-seller-openapi.json`;
- mirror index states **463 paths / 463 operations** for the captured current Seller API.

`POST /v1/roles` remains useful account/key capability evidence, but it answers only:

> Which methods are granted to this API key now?

It must **not** be used to decide which Ozon methods the Bridge should implement globally. A Free/current key can omit capabilities that must still be implemented for another subscription or account.

### 1.2 Premium detection keeps the existing `/v1/seller/info` mechanism

The existing internal fixed `POST /v1/seller/info` capability probe remains the source for the configured seller's current subscription profile.

The current safe projection remains conceptually valid:

- capability status;
- `subscription_type`;
- `is_premium` when supplied;
- probe performed/status/error metadata.

Seller identity, tax/company data and unrelated seller information remain outside the model-visible result.

### 1.3 Premium entitlement rules are no longer permanent hard-coded business constants

Constants such as:

- `ANALYTICS_FULL_TIERS`;
- `PRODUCT_QUERIES_FULL_TIERS`;
- `PRODUCT_QUERY_DETAILS_RESTRICTED_SORT_TIERS`;

are treated as the **current legacy implementation**, not the target architecture.

The new implementation keeps the same pre-request idea — detect the current seller subscription and explain a Premium restriction before sending a business request when the rule is known — but the rule table is generated from the current Ozon contract and can be refreshed without rewriting production planning code.

### 1.4 Cluster membership is part of the operation record

There must be one operation registry. Every enabled operation carries its own:

- cluster;
- section;
- guidance description/template metadata;
- safety/privacy classification;
- entitlement reference;
- workflow role.

Guidance is generated from that registry.

There must no longer be an independently maintained list where `ozon_contract.js` knows an operation but `ozon_guidance.js` can forget to expose it.

### 1.5 Reports are not a user-facing top-level business cluster

The user normally asks for sales, stock, returns, finance or postings — not for an API implementation detail called a report.

Report-producing operations belong to the business cluster they serve. Generic helpers such as `report_info` are hidden workflow helpers and are surfaced as the next step only when a prior explicit report operation produced a report code.

### 1.6 No hidden semantic rewrite

The current implementation can remove unavailable restricted analytics metrics and send a reduced physical command.

That behavior is not the target for the full-read implementation.

If the user/AI explicitly requests a read operation with parameters that are known to require a subscription the account does not have, Bridge returns a clear subscription error before the business request. It does **not** silently remove metrics, dimensions, sorting, history or filters and execute a different query.

If the Premium rule is unknown/stale, Bridge does not invent one. The exact safe request may be sent and Ozon's provider result remains the final authority.

## 2. What exists today and must be preserved until replaced

Current v0.1.19 Seller Bridge exposes the following enabled Seller aliases:

- `analytics_data`;
- `product_queries`;
- `product_queries_details`;
- `stocks_current`;
- `posting_fbo_list`;
- `supply_order_get`;
- `supply_order_details`;
- `roles`.

The Performance provider separately exposes:

- `performance_campaigns`;
- `performance_expense`;
- `performance_daily`;
- `performance_campaign_product`.

`posting_fbs_get` is present but disabled because the raw surface can expose customer personal data.

The current contract/capability implementation already has these useful properties and they remain:

- fixed provider hosts;
- fixed operation registry;
- AI cannot supply URL, HTTP method, headers or credentials;
- strict operation-specific parameter validation;
- internal `/v1/seller/info` probe at most once where the current planner says capability is needed;
- no hidden provider retry;
- no hidden pagination;
- no hidden fanout;
- no hidden report polling;
- safe provider errors;
- provider quota/cache/history survive unrelated UI/session operations.

The current guided discovery has six manually maintained clusters:

- `sales_analytics`;
- `stock_inventory`;
- `search_visibility`;
- `fulfillment_supply`;
- `advertising_performance`;
- `account_access`.

The cluster mechanism itself remains useful. The independently maintained static catalog does not.

## 3. Sources of truth — keep them separate

The implementation must distinguish four different facts.

### 3.1 API contract source

Answers:

> What methods exist now, what are their request/response schemas, current/deprecated state and documented restrictions?

Source: current official Seller Swagger/OpenAPI.

### 3.2 Account subscription source

Answers:

> What subscription does this seller currently have?

Source: internal fixed `POST /v1/seller/info` probe.

### 3.3 API-key role source

Answers:

> What exact methods are currently granted to this API key?

Source: `POST /v1/roles`.

This is runtime capability/diagnostic metadata, not the full implementation inventory and not the Premium-tier map.

### 3.4 Provider execution result

Answers:

> Did this exact request actually succeed now?

Source: the actual Ozon API response.

A local metadata table must never override a successful provider response. A provider restriction/error must never be silently changed into a different business query.

## 4. Dynamic Premium entitlement registry

### 4.1 Required data model

Add a dedicated entitlement registry generated from the current Seller Swagger.

Conceptual record:

```json
{
  "key": "POST /v1/analytics/data",
  "source": {
    "swagger_sha256": "...",
    "operation_pointer": "...",
    "captured_at": "..."
  },
  "default_access": "ALL_ACCOUNTS",
  "allowed_subscription_types": null,
  "feature_rules": [
    {
      "selector": "params.metrics[*]=some_metric",
      "allowed_subscription_types": ["PREMIUM_PLUS", "PREMIUM_PRO"],
      "source_pointer": "...",
      "source_text_hash": "..."
    }
  ]
}
```

Do **not** implement the subscription model as a guessed numeric hierarchy such as `FREE < PREMIUM < PLUS < PRO` and then compare `minimum_tier`.

Use explicit allowed sets for each rule because Ozon documentation can define different combinations for different methods/features.

Examples of valid rule shapes:

```text
ALL_ACCOUNTS
PREMIUM only
PREMIUM | PREMIUM_PLUS | PREMIUM_PRO
PREMIUM_PLUS | PREMIUM_PRO
PREMIUM_PRO only
endpoint available to all + selected metric/sort/history restricted
UNKNOWN / could not parse safely
```

### 4.2 Updater

Implement a fixed-source metadata update action, for example:

`OZ_REFRESH_SELLER_API_METADATA`

It is infrastructure, not an `OZON_API_V1` business operation.

The updater must:

1. fetch only the fixed official Ozon Seller Swagger URL configured in extension code;
2. reject redirects to an unapproved host;
3. reject AI/user-controlled URL, method or headers;
4. verify that the payload is valid expected OpenAPI/Swagger and contains a plausible Seller API inventory;
5. calculate a source hash;
6. build a complete operation-contract snapshot;
7. extract all subscription-related endpoint and feature restrictions into the entitlement registry;
8. validate the generated registry before storing it;
9. atomically replace metadata only after the complete update passes;
10. keep the previous last-known-good snapshot on any network, parse, schema, redirect or validation failure;
11. return a safe update summary: source hash, operation count, added/removed/changed operation count, entitlement-rule changes, unresolved-rule count;
12. never change provider quota, business request history, result cache, credentials, Manual owner, Work session or Autorun state.

The extension package must also contain a reviewed bundled last-known-good metadata snapshot so a docs-site outage does not disable normal Bridge work.

### 4.3 Update frequency

No hidden Swagger fetch is required before every business command.

Required paths:

- bundled reviewed snapshot at installation/build time;
- explicit operator action in the popup: **Update Ozon API rules**;
- implementation/test tooling may refresh the bundled snapshot during a release build.

A later scheduled freshness feature may be added only as a separate reviewed change.

### 4.4 Parser fail-closed behavior

If a Swagger update changes wording or schema and a Premium rule cannot be safely extracted:

- mark that rule `UNKNOWN`;
- do not invent the required subscription;
- do not overwrite a complete registry with a structurally incomplete one unless the update policy explicitly supports per-record last-known-good retention and proves source identity;
- do not falsely tell the AI that a specific Premium tier is required.

For an operation/feature whose entitlement is `UNKNOWN`, safe execution is allowed to reach Ozon unless another Bridge safety rule blocks it. The provider response decides the concrete call.

### 4.5 Runtime entitlement flow

For a supported safe read command:

```text
normalize + validate command
        ↓
resolve operation record
        ↓
look up entitlement rule
        ↓
rule says ALL_ACCOUNTS
        → no seller subscription probe needed

rule contains subscription restriction
        → use existing /v1/seller/info capability resolver
        → compare current subscription against explicit allowed set
        → if not allowed: zero business requests + clear Premium explanation
        → if allowed: send exact requested command

rule UNKNOWN/stale
        → do not guess
        → send exact safe command
        → Ozon response is authoritative
```

Required local error example:

```json
{
  "code": "SUBSCRIPTION_REQUIRED",
  "message": "Этот запрос доступен только для Ozon Premium Plus или Premium Pro.",
  "required_subscription_types": ["PREMIUM_PLUS", "PREMIUM_PRO"],
  "external_request_executed": false
}
```

The exact human-readable wording is generated from the current rule metadata.

### 4.6 Provider error annotation

Do not map every HTTP 403 to Premium. `403` can mean other access problems.

If a provider error can be positively identified as subscription-related from current documented/safely matched evidence, Bridge may append a structured explanatory field such as:

```json
{
  "access_explanation": {
    "type": "subscription_required",
    "required_subscription_types": ["PREMIUM_PRO"]
  }
}
```

Otherwise return the ordinary safe provider error without claiming Premium.

## 5. `/v1/roles` in the target architecture

`/v1/roles` remains implemented and gains a second use as account/key capability metadata.

A refreshed role snapshot may be stored with:

- credential identity fingerprint, never the credential itself;
- fetched timestamp;
- exact allowed method/path pairs;
- provider expiry when supplied.

Guidance may use a fresh role snapshot to display:

- `available_for_current_key`;
- `not_listed_for_current_key`;
- `role_snapshot_unknown/stale`.

However:

- the global operation registry is never reduced to the current role snapshot;
- Premium rules are never inferred from roles;
- a role snapshot does not replace the safety policy;
- write/mutation operations remain blocked even if roles allow them.

## 6. Full Seller read implementation target

The implementation target is **all current Seller API operations from the full current Swagger that can be safely exposed as read behavior**.

Every current Swagger operation must receive exactly one terminal safety/currentness class in the generated coverage manifest:

- `READ_SAFE` — ordinary information retrieval;
- `READ_WORKFLOW` — report/document/status flow that is observational but requires explicit multi-step commands;
- `READ_PII_PROJECTION_REQUIRED` — useful read but raw result contains customer/contact/message/user fields; disabled until a positive safe projection exists;
- `MUTATION_BLOCKED` — creates, edits, deletes, approves, cancels, activates, sends, changes status/business state or otherwise modifies seller/Ozon state;
- `DEPRECATED_REPLACED` — current docs mark it deprecated and a current replacement is known;
- `CONTRACT_UNRESOLVED` — insufficient current contract evidence; disabled until resolved.

There is no `PENDING` state allowed in a release candidate.

The old 303-role classification remains useful evidence for the current key but is not the complete target because current Swagger contains operations that this key may not expose.

## 7. Unified operation registry

Add/produce one authoritative operation registry.

Each operation record must contain at least:

```text
alias
provider
http_method
fixed_path
currentness
safety_class
pii_policy
cluster
section
guidance_visibility
purpose
template/request_shape
request_validator
response_projection
pagination_model
workflow_role
entitlement_key
quota_class
cache_policy
source_openapi_operation
source_hash
```

### 7.1 Registry invariants

- an enabled alias has exactly one fixed provider/method/path;
- no arbitrary transport fields are accepted from AI text;
- every enabled user-facing operation has exactly one business cluster and section;
- hidden technical workflow helpers are explicitly marked and never appear as a top-level user cluster;
- every enabled operation has an entitlement reference, even when the rule is `ALL_ACCOUNTS`;
- every enabled operation has a privacy policy;
- every current Swagger operation has a terminal coverage state;
- deprecated operations are not selectable when a current replacement exists;
- guidance is derived from this registry, not maintained separately.

## 8. Business cluster taxonomy

Use **12 Seller business clusters** plus the existing separate Performance cluster.

### 8.1 `account_access`

Purpose: seller/API access and read-only configuration information.

Sections:

- `roles_access`;
- `seller_capability`;
- `seller_settings`.

Examples: roles, safe seller logistics/settings reads.

### 8.2 `catalog_products`

Purpose: product catalogue/master data.

Sections:

- `product_list_info`;
- `attributes_categories`;
- `description_content`;
- `pictures`;
- `certification`;
- `limits_diagnostics`.

### 8.3 `stocks_inventory`

Purpose: inventory and stock availability.

Sections:

- `current_aggregate`;
- `warehouse_fbo`;
- `warehouse_fbs`;
- `stock_analytics`;
- `stock_movement_turnover`.

Existing `stocks_current` belongs here.

### 8.4 `sales_analytics`

Purpose: seller business analytics other than search and inventory.

Sections:

- `sales_revenue_units`;
- `delivery_returns_cancellations_metrics`;
- `period_product_category`;
- `turnover_delivery_time`.

Existing `analytics_data` belongs here.

### 8.5 `search_visibility`

Purpose: marketplace/product search analytics and visibility.

Sections:

- `product_queries`;
- `query_details`;
- `marketplace_search_queries`.

Existing `product_queries` and `product_queries_details` belong here.

### 8.6 `prices_promotions`

Purpose: read-only prices, pricing strategy information and promotion/action information.

Sections:

- `prices`;
- `pricing_strategy`;
- `actions_promotions`.

Mutation methods that create/update/archive actions remain blocked even though read methods from the same API family are enabled.

### 8.7 `orders_postings`

Purpose: FBO/FBS/FBP posting/order and carriage information.

Sections:

- `fbo_postings`;
- `fbs_postings`;
- `fbp_postings`;
- `assembly_carriage`;
- `labels_documents`.

Existing `posting_fbo_list` belongs here.

Raw FBS operations with customer data remain privacy-blocked until a positive response projection is implemented.

### 8.8 `supplies_fbo`

Purpose: FBO supply-order, cargo, draft and timeslot information.

Sections:

- `supply_orders`;
- `supply_items_status`;
- `drafts_timeslots`;
- `cargoes`.

Existing `supply_order_get` and `supply_order_details` belong here.

### 8.9 `warehouse_logistics`

Purpose: warehouse, cluster and delivery/logistics reference information.

Sections:

- `clusters`;
- `ozon_warehouses`;
- `seller_warehouses`;
- `delivery_methods`;
- `warehouse_diagnostics`.

### 8.10 `returns_cancellations`

Purpose: return information, cancel reasons and cancellation/status reads.

Sections:

- `cancel_reasons`;
- `conditional_cancellations`;
- `fbo_returns`;
- `fbs_rfbs_returns`;
- `return_status_inventory`.

### 8.11 `finance`

Purpose: seller finance, accrual, balance, realization and transaction reads.

Sections:

- `accruals`;
- `balance_settlement`;
- `realization`;
- `transactions`;
- `finance_reports`.

### 8.12 `reviews_questions`

Purpose: review/question counts, aggregate analytics and safe content reads.

Sections:

- `review_aggregate`;
- `question_aggregate`;
- `review_content`;
- `question_content`.

Content sections remain disabled until their privacy projection is proven.

### 8.13 `advertising_performance` — separate provider

Keep the existing Performance API cluster separate from Seller API coverage.

Sections may be introduced later if the Performance read inventory grows, but this Seller expansion must not change Performance transport/auth semantics.

## 9. Technical workflow helpers

Operations such as generic report status/info are not normal top-level business options.

Mark them:

```text
guidance_visibility = workflow_only
cluster = _workflow
```

`_workflow` is an internal namespace, never a cluster offered to the user/AI for semantic selection.

A report create operation is assigned to its business cluster, for example:

```text
postings report -> orders_postings
returns report  -> returns_cancellations
finance report  -> finance
products report -> catalog_products
stock report    -> stocks_inventory
```

After an explicit create step returns a report code, the result metadata may advertise the exact next helper alias (`report_info`) and required parameter shape.

No hidden polling.

## 10. Guidance is generated from the operation registry

`shared/ozon_guidance.js` becomes a projection/formatting layer over the operation registry and current capability metadata.

It must not contain a second authoritative operation catalog.

### 10.1 Top-level behavior

For a cluster with a small number of selectable operations, return the operations directly.

For a larger cluster, return sections first.

Target help protocol:

```text
OZON_HELP_V2
{"cluster":"stocks_inventory"}
```

or:

```text
OZON_HELP_V2
{"cluster":"stocks_inventory","section":"warehouse_fbo"}
```

### 10.2 Backward compatibility

Continue accepting the old V1 cluster selections during migration.

Compatibility aliases:

```text
stock_inventory     -> stocks_inventory
fulfillment_supply  -> supplies_fbo
sales_analytics     -> sales_analytics
search_visibility   -> search_visibility
account_access      -> account_access
advertising_performance -> advertising_performance
```

The V1 marker routes into the same V2 registry-backed engine. Do not maintain two catalogs.

### 10.3 Guidance option metadata

Each operation option should expose only safe model-useful metadata:

- Bridge alias;
- short purpose;
- valid command template;
- section;
- pagination hint when required;
- availability badge derived from current subscription metadata and optional fresh role snapshot.

Possible availability states:

```text
AVAILABLE_NOW
AVAILABLE_WITH_LIMITS
REQUIRES_SUBSCRIPTION
CURRENT_KEY_NOT_LISTED
ACCESS_UNKNOWN
BLOCKED_PRIVACY
BLOCKED_MUTATION
DEPRECATED_REPLACED
```

A Premium requirement is an operation/feature property, **not a cluster**.

## 11. Current account capability presentation

When a current seller subscription is known, guidance may render:

```text
search_queries_top — requires Premium Pro
analytics_data — available; selected metrics/features may require Premium Plus/Pro
stocks_by_warehouse_fbo — available for this subscription; key role may still be checked by provider
```

Do not remove Premium-only operations from the registry or pretend they do not exist on a Free account. Show them with their current access requirement.

This is why the complete Swagger, not the Free account's role list, is the implementation universe.

## 12. Implementation file plan

### 12.1 New shared modules

Recommended separation:

- `shared/ozon_operation_registry.js` — unified operation records and registry validation;
- `shared/ozon_entitlements.js` — bundled entitlement metadata, current metadata validation, rule matching and update compiler/runtime helpers.

If implementation chooses different filenames, responsibilities must remain separate and testable.

### 12.2 `shared/ozon_contract.js`

Refactor from being both operation catalog and entitlement hard-code toward:

- strict command envelope/parser;
- operation lookup from unified registry;
- operation-specific validators;
- safety checks;
- provider request building;
- response projection/redaction;
- planning using `ozon_entitlements` + seller capability.

After parity is proven, remove hard-coded tier arrays that duplicate generated entitlement metadata.

### 12.3 `shared/ozon_guidance.js`

Replace static cluster operation lists with registry-driven output.

Keep:

- command templates/descriptions as operation-record fields or generated safe fields;
- help marker validation;
- compatibility cluster aliases;
- local zero-provider guidance behavior.

### 12.4 `shared/ozon_provider.js`

Keep fixed Seller/Performance transport and the existing safe `resolveSellerCapability()` behavior.

Add no arbitrary metadata URL support.

Metadata fetch, if placed here, must use a fixed official docs URL and separate request class from Seller business API quota/accounting.

### 12.5 `service_worker.js`

Add:

- metadata refresh action/state;
- atomic last-known-good metadata storage;
- account capability metadata storage if roles refresh is implemented;
- registry-backed guidance dispatch;
- runtime entitlement planning with exact command preservation;
- safe metadata refresh report.

Do not touch Work lifecycle semantics or reset provider state.

### 12.6 Popup

Add an operator-visible action such as:

**Update Ozon API rules**

Display:

- bundled/current metadata timestamp;
- source hash/operation count;
- last refresh result;
- entitlement rules changed count;
- unresolved count;
- whether the extension is using bundled or refreshed metadata.

This action must not be confused with Seller API key testing or business data collection.

### 12.7 Manifest

If runtime metadata refresh requires access to `docs.ozon.ru`, add only the exact required docs host permission.

Do not broaden Seller/Performance host permissions and do not add arbitrary network destinations.

## 13. Full-read implementation order

The safety/filter policy is fixed by this document. Implementation may be validated in batches, but the team must not redesign classification or clusters between batches.

### B0 — registry compiler and metadata foundation

- ingest current complete Seller Swagger;
- build full operation catalog;
- assign terminal coverage class to every current operation;
- assign business cluster/section to every enabled read operation;
- build entitlement registry;
- produce machine manifest with **zero unclassified operations**;
- implement metadata updater + last-known-good validation;
- no business coverage expansion yet.

### B1 — stocks + warehouse logistics

Implement all safe current reads in:

- `stocks_inventory`;
- `warehouse_logistics`.

This includes the known missing warehouse-level stock APIs before any historical-stock conclusion is made.

### B2 — catalogue/product prerequisites

Implement all safe current reads in `catalog_products`.

Goal: AI can obtain product/SKU/offer/category/attribute prerequisites itself rather than asking the operator when Ozon can provide them.

### B3 — analytics + search + prices/promotions

Implement all safe current reads in:

- `sales_analytics`;
- `search_visibility`;
- `prices_promotions`.

This batch exercises dynamic feature-level Premium rules most heavily.

### B4 — orders/postings + supply

Implement safe current reads in:

- `orders_postings`;
- `supplies_fbo`.

PII-bearing row/detail surfaces stay disabled until their positive projections are separately accepted.

### B5 — returns + finance

Implement safe current reads in:

- `returns_cancellations`;
- `finance`.

### B6 — reviews/questions + account/configuration

Implement safe aggregate/reference reads in:

- `reviews_questions`;
- `account_access`.

Content-bearing privacy surfaces remain behind projection gates.

### B7 — report/document workflows

Enable observational asynchronous/document workflows already assigned to their business clusters.

Rules remain:

- one explicit create command;
- one explicit status/info command;
- one explicit retrieval command where needed;
- no hidden polling/retry;
- no hidden download into model text;
- binary result handled as file/artifact metadata where appropriate.

### B8 — privacy projections

For each useful `READ_PII_PROJECTION_REQUIRED` endpoint:

- enumerate response fields;
- define positive allowlist;
- create synthetic PII fixture;
- prove blocked fields never reach model-visible result/log;
- then reclassify only the projected alias as enabled.

Do not expose raw response and then redact opportunistically.

## 14. Methods that are not implemented and why

Exclusion explanations in user-facing documentation must use plain language.

Examples:

- **Mutation/write method:** “Не реализуем этот метод, потому что он может изменить данные или состояние магазина: создать, удалить, подтвердить, отменить, обновить или отправить что-либо.”
- **Personal-data read:** “Пока не реализуем этот метод, потому что его обычный ответ может содержать данные клиента, контактные данные или сообщения. Сначала нужен безопасный вариант ответа без этих данных.”
- **Deprecated method:** “Не реализуем старую версию, потому что Ozon уже пометил её устаревшей; используем текущую замену.”
- **Unresolved contract:** “Пока не реализуем, потому что текущая документация не даёт достаточно надёжного описания запроса/ответа; угадывать контракт нельзя.”

Do not use internal-only labels as the sole explanation to the operator.

## 15. Required tests

### 15.1 Coverage/compiler

- current Swagger operation count recorded;
- every current operation terminally classified;
- zero unclassified enabled candidates;
- no duplicate method/path aliases;
- every enabled user-facing alias has cluster + section;
- every enabled alias has entitlement record;
- every enabled alias has privacy policy;
- every deprecated path has replacement/retired disposition.

### 15.2 Dynamic entitlement update

Use fixtures representing rule changes without production code edits:

1. a method changes from `PREMIUM_PRO` to `PREMIUM_PLUS|PREMIUM_PRO`;
2. a feature becomes available to all accounts;
3. a formerly unrestricted parameter becomes Premium-only;
4. Swagger wording/schema cannot be parsed;
5. docs endpoint redirects to another host;
6. downloaded metadata has fewer/malformed operations;
7. update interrupted before commit.

Expected result: valid changes update metadata; unsafe/incomplete updates leave last-known-good metadata untouched.

### 15.3 Subscription planning

Fixtures for:

- no subscription restriction -> zero seller-info probe;
- Premium restriction + matching subscription -> exact command executes;
- restriction + non-matching subscription -> zero business request + clear required-tier result;
- partial endpoint with restricted feature -> exact feature rule applied;
- unknown rule -> no guessed rejection;
- no silent metric/filter/sort/history removal.

### 15.4 Guidance

- enabled registry operation automatically appears in exactly one business cluster/section;
- disabled/mutation operation never appears as selectable;
- workflow-only helper is not top-level selectable;
- old V1 cluster IDs resolve through compatibility aliases;
- large clusters return sections before long operation lists;
- availability labels follow current entitlement metadata without changing cluster membership.

### 15.5 Existing regressions

Preserve and run only relevant accepted regressions for:

- fixed provider boundary;
- quota/cache/history;
- one explicit command/one external request;
- no hidden retry/pagination/fanout/report polling;
- Manual delivery and owner isolation;
- guided discovery;
- Work lifecycle A.4/A.5 relevant paths.

**Autorun is outside the scope of this coverage implementation and must not be modified unless separately authorized.**

## 16. Codex role

Codex remains an independent tester only for this workflow.

Implementation/fixes are produced before Codex validation. Codex receives exact candidate identity and test protocol, does not redesign production code, and reports PASS/FAIL evidence.

## 17. Completion criterion for full read coverage

The full-read milestone is complete only when:

1. the complete current Seller Swagger inventory is captured with source identity;
2. every current operation has a terminal coverage state;
3. every safe read/read-workflow operation intended for Bridge has an implemented fixed alias, validator, response policy and accepted test evidence;
4. every enabled operation belongs to the registry-driven cluster/section taxonomy;
5. guidance contains no independent operation catalog;
6. Premium rules are supplied by validated refreshable metadata rather than permanent business constants;
7. the current seller subscription is still resolved through the existing safe `/v1/seller/info` mechanism;
8. `/v1/roles` is treated as current key capability metadata, not as the global API inventory or Premium map;
9. every excluded current operation has a plain-language reason;
10. no mutation is exposed;
11. no raw customer PII is exposed;
12. there are no `PENDING` or `UNCLASSIFIED` operations in the release coverage manifest;
13. existing provider/quota/cache/delivery/lifecycle invariants remain intact.

`FULL_READ_DYNAMIC_ENTITLEMENTS_AND_REGISTRY_GUIDANCE_SPEC_READY`