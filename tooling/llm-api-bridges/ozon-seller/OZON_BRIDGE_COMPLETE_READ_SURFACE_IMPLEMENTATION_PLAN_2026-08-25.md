# Ozon Bridge — complete Seller read-surface implementation plan

Date: **2026-08-25**  
Status: **documentation/coverage freeze; production implementation not started in this branch**  
Baseline production candidate: `fix/ozon-work-resume-provider-status-separation-2026-08-24` @ `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`

## 1. Goal

Close the historical coverage gap between Ozon Seller API methods available to the configured API key and the small production operation registry in Ozon Bridge.

This plan freezes filtering decisions **before** implementation. Later implementation phases are not allowed to re-decide ad hoc whether a method “looks safe”. Every path returned by the live `/v1/roles` snapshot has one explicit disposition in the machine-readable coverage inventory under `coverage/methods/`.

Cluster contract: `coverage/OZON_GUIDANCE_CLUSTER_TAXONOMY_V2_2026-08-25.json`.

## 2. Sources and authority

1. **Key-specific availability:** live `POST /v1/roles`, HTTP 200 on 2026-08-25.
2. **Current API contract:** official Ozon Seller Swagger origin `https://docs.ozon.ru/api/seller/swagger.json`.
3. **Pinned machine-readable snapshot:** `MissiaL/ozon-api@1953152c36955225b459cf55963a2c3a7a234661`, generated from the official Swagger. The snapshot contains 463 operations in 57 sections.
4. **Current Bridge registry:** exact A.5 production candidate identified above.
5. **Personal-data behavior:** canonical `OZON_BRIDGE_SESSION_LIFECYCLE_AND_PERSONAL_DATA_POLICY_SPEC_2026-08-21.md`.

A role name containing `read-only` is **not** sufficient evidence. Ozon `/v1/roles` currently lists several paths under read-only roles whose documented purpose changes account/business state. Those paths remain blocked.

## 3. Frozen outcome

- unique Seller paths observed from the configured key: **303**
- already AI-callable in Bridge: **8**
- target AI-callable read surface after this plan: **231**
- new read methods/workflows to implement: **223**
- legacy/deprecated addresses not implemented: **62**
- methods not implemented because they change Ozon data/state: **8**
- external-side-effect method not implemented: **1**
- provider method retained as internal-only infrastructure: **1**

The filtering result is frozen by the coverage inventory. If Ozon later changes its Swagger or `/v1/roles`, that is a **new API-delta review**, not a reason to reopen decisions during implementation of this snapshot.

## 4. Safety classes

### 4.1 `KEEP_CURRENT`
Existing reviewed Bridge operation. Alias stays stable.

### 4.2 `IMPLEMENT_SAFE_READ`
Normal read-only operation. The assistant can provide only symbolic `operation` + validated `params`.

### 4.3 `IMPLEMENT_PERSONAL_DATA_GATED`
The operation is read-only but may return customer/seller personal information. Default output is a safe projection. Fuller data requires an explicit user setting. The assistant cannot turn that setting on itself.

### 4.4 `IMPLEMENT_SENSITIVE_BUSINESS_GATED`
Read-only financial, fiscal, voucher, or similarly confidential business information. It uses a separate explicit access setting and strict output projection.

### 4.5 `IMPLEMENT_READ_WORKFLOW`
The method creates an export/report/label job whose purpose is to **read** already-existing data. This is permitted because it does not edit products, prices, stocks, orders or supply contents. Each workflow step is explicit: `create -> result -> optional explicit status/info command`. No hidden polling.

### 4.6 `IMPLEMENT_FILE_READ`
Binary/PDF/PNG/CSV retrieval is handled as a bounded file result, not blindly inserted as raw page text. Enforce content type, size ceiling, local file ownership, redaction where applicable, and no arbitrary URL fetching.

### 4.7 `DO_NOT_IMPLEMENT_MUTATION`
Never becomes AI-callable while the Bridge is read-only.

### 4.8 `DO_NOT_IMPLEMENT_LEGACY_OR_DEPRECATED`
Do not spend implementation/test surface on an old path. Use its current replacement when one exists.

### 4.9 `KEEP_INTERNAL_ONLY`
Provider infrastructure may use the route, but the assistant cannot call it directly.

## 5. Guidance clusters v2

`OZON_HELP_V1` remains the command prefix. The response `guidance_version` moves to `2`. Existing cluster IDs remain valid; no startup-prompt break is required.

Target clusters:

- **`account_access`** — roles and safe account/subscription capability. Existing ID preserved.
- **`catalog_products`** — product list/cards/descriptions/pictures/content rating/quants and other product reads.
- **`catalog_reference`** — categories, attributes, certificates, brands and reference dictionaries.
- **`stock_inventory`** — current stock, stock by warehouse, stock analytics and turnover. Existing ID preserved.
- **`warehouses_logistics`** — Ozon/seller warehouses, clusters, delivery methods and warehouse reference data.
- **`sales_analytics`** — sales, revenue, ordered units and permitted analytics. Existing ID preserved.
- **`search_visibility`** — buyer search queries, product visibility and search analytics. Existing ID preserved.
- **`orders_fbo`** — FBO postings/status/cancel reasons.
- **`orders_fbs`** — FBS/rFBS postings, documents, statuses and safe order projections.
- **`fulfillment_supply`** — supply orders, cargoes, timeslots, acts and read-only operational statuses. Existing ID preserved.
- **`fbp_fulfillment`** — read-only FBP drafts/orders/warehouses/documents.
- **`returns_cancellations`** — FBO/FBS/rFBS returns and conditional cancellations.
- **`finance_accounting`** — accruals, transactions, realizations, settlements, invoices and receipts.
- **`reports_exports`** — report list/info, read-only report generation and stock/placement exports.
- **`pricing_promotions`** — read-only prices, pricing strategies, actions and candidates; write operations remain forbidden.
- **`customer_feedback`** — reviews, comments, questions and answers on read paths only.
- **`communications`** — chats and notifications; personal data requires explicit permission.
- **`seller_rating`** — rating history/current summary/FBS error index.
- **`advertising_performance`** — existing Performance API read surface; unchanged by this Seller coverage milestone. Existing ID preserved.

### Compatibility rule

The existing six cluster IDs remain accepted: `account_access`, `sales_analytics`, `stock_inventory`, `search_visibility`, `fulfillment_supply`, `advertising_performance`.

`posting_fbo_list` gets primary ownership under `orders_fbo`. For one guidance-version transition it may also appear as a compatibility choice under `fulfillment_supply`; both choices resolve to the same reviewed operation alias and must not duplicate provider work.

## 6. Alias and transport rules

- Existing aliases never change merely because the cluster taxonomy expands.
- Every new path receives one fixed symbolic alias stored in the coverage inventory.
- Alias -> HTTP method/path mapping lives only in trusted provider code.
- Assistant commands cannot contain URL, host, HTTP method, headers, `Client-Id`, `Api-Key`, OAuth token or Authorization.
- Request validation is operation-specific; no permissive “pass arbitrary JSON to arbitrary path” fallback.
- Invalid parameters fail before provider execution.

## 7. Premium and account capability

The cluster layer and entitlement layer are separate.

### 7.1 Premium-tagged read methods

The current Ozon OpenAPI Premium group includes these read paths from the key snapshot:

- `/v1/analytics/data`
- `/v1/analytics/product-queries`
- `/v1/analytics/product-queries/details`
- `/v1/finance/realization/by-day`
- `/v1/product/prices/details`
- `/v1/search-queries/text`
- `/v1/search-queries/top`

The already accepted analytics behavior stays intact:

- `analytics_data`: capability/entitlement can be **field-level**; safe universal metrics may execute without pretending restricted metrics are available.
- `product_queries` / `product_queries_details`: history/features remain capability-sensitive.
- the other Premium-tagged reads are capability-sensitive and execute only when the account entitlement is confirmed.

### 7.2 Capability states

Keep the current normalized subscription states: `UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`.

Rules:

- capability probe at most once per relevant clicked batch;
- no probe for operations that do not need it;
- unknown capability never gets guessed into Premium;
- when the contract allows a universal subset, execute only that subset and report omissions;
- otherwise fail before the business request with a clear entitlement result;
- direct raw `/v1/seller/info` remains unavailable to the assistant.

## 8. Personal and confidential data

The complete read surface must not undo the existing privacy design.

### Default-safe projection

Orders/returns/chat-related operations expose only fields needed for the requested task. Customer name, phone, address, chat contents or equivalent personal fields are removed unless the user explicitly enabled the relevant personal-data mode.

### Explicit personal-data mode

The setting is off by default and cannot be toggled from an assistant command. Turning it on changes only output projection; it does not grant mutation capability.

### Confidential business mode

Financial documents, voucher exports and similar business-sensitive data use a separate opt-in. Credentials are never included in output under any mode.

### History

Provider responses are retained only according to the existing retention policy. Turning off a sensitive mode prevents future sensitive projection; it is not treated as permission to replay old provider calls.

## 9. Reports, files, pagination and retries

### Reports

Report-generation endpoints are explicit read workflows. A single command may make at most one provider business request. If Ozon returns a report code/status, a later `report_info`/equivalent command is separate.

### Files

For PDF/PNG/CSV/file endpoints:

- no arbitrary assistant-supplied download host;
- provider-returned file locator must be validated against the operation contract;
- size/content type are checked before delivery;
- sensitive file content follows the same personal/confidential policy as JSON;
- file retrieval cannot cause another provider operation silently.

### Pagination

No automatic page walking. `cursor`, `offset`, `last_id`, `page` or equivalent continuation data is returned to the model; the next page requires another explicit command.

### Provider errors

No automatic retry for `429`, `4xx`, `5xx`, provider error envelopes, unknown capability result or ambiguous restart state.

## 10. Implementation sequence

### Phase 01 — contract/capability/guidance foundation

1. Add machine-readable operation descriptors for every `IMPLEMENT_*` path.
2. Add per-operation request validators and response policy metadata.
3. Implement Guidance v2 cluster registry and compatibility mapping.
4. Extend capability metadata without changing the accepted one-probe invariant.
5. Add startup-prompt/guidance wording that distinguishes “not in Bridge” from “not available in Ozon API”.
6. Regression: every one of the 303 frozen paths resolves to exactly one policy decision.

### Phase 02 — catalog, stock and warehouse reads

Implement `catalog_products`, `catalog_reference`, `stock_inventory`, `warehouses_logistics`.

Priority proof case: historical/warehouse stock investigation must be able to use warehouse lists, FBO/FBS warehouse stock methods and stock reports without manually asking the operator for product IDs when a prerequisite can be obtained through another read operation.

### Phase 03 — analytics, search, prices and promotions

Implement `sales_analytics`, `search_visibility`, read side of `pricing_promotions`.

Preserve existing analytics quota scheduler, response cardinality verifier and capability planner. Mutation endpoints under pricing/actions remain absent.

### Phase 04 — FBO/FBS orders, supplies and FBP

Implement `orders_fbo`, `orders_fbs`, `fulfillment_supply`, `fbp_fulfillment`.

Personal-data-capable FBS routes land only after their safe projection tests pass. Supply/cargo status reads are allowed; create/delete/activate/bind state-changing methods remain blocked.

### Phase 05 — returns, feedback and seller rating

Implement `returns_cancellations`, `customer_feedback`, `seller_rating`.

Old review/question versions remain excluded where a current version exists.

### Phase 06 — finance, reports and files

Implement `finance_accounting`, `reports_exports`, file-result transport and explicit report workflows. No hidden report polling.

### Phase 07 — personal/confidential surfaces

Enable the already-described explicit opt-in projections for chat, customer-order/return details, financial/fiscal documents, promo-code exports and similar sensitive reads. This phase changes projection availability only; write operations remain impossible.

### Phase 08 — integrated validation and cutover

1. Static inventory completeness.
2. Contract validation: invalid body -> zero provider calls.
3. Fixed-route/credential isolation.
4. Cluster guidance coverage and no duplicate aliases.
5. Premium/capability matrix.
6. privacy mode off/on matrix.
7. one command -> at most one business request.
8. pagination continuation only by explicit next command.
9. no automatic provider retry.
10. owner/tab/conversation isolation.
11. quota/cache state preserved.
12. delivery recovery cannot replay provider work.
13. independent Codex validation of each coherent phase.
14. final controlled logged-in acceptance before release packaging.

## 11. Definition of coverage complete

Coverage for this snapshot is complete only if all of the following are true:

- all 303 key-permitted paths exist in the machine-readable inventory;
- every path has exactly one decision;
- every planned AI-callable path has a fixed alias, cluster, data policy and subscription policy;
- every excluded path has a plain-language reason;
- no mutation path is reachable through an alias or generic fallback;
- all current aliases remain backward compatible;
- Guidance v2 can lead the model to every planned read capability without inventing operations;
- Premium restrictions are decided by capability planning, not by the model guessing;
- personal/confidential data cannot be enabled by command text;
- legacy/deprecated paths are not implemented when a current replacement is selected;
- implementation tests consume this inventory as the source of truth.

## 12. Change-control rule

After this document is accepted, implementation must not re-open endpoint filtering. A method decision changes only when one of these external facts changes:

1. Ozon publishes a new/removed/deprecated method in a newer official Swagger;
2. `/v1/roles` for the configured key changes;
3. the product owner explicitly expands the Bridge beyond read-only;
4. a security/privacy review proves that a previously accepted read route has an unsafe side effect.

Such a change produces a new dated inventory diff. It does not silently modify this frozen snapshot.
