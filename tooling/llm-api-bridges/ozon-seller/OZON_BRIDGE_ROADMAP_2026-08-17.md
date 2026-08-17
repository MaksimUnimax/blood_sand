# Ozon Bridge — current engineering roadmap

Date: 2026-08-17
Status: active roadmap/specification

## Target architecture

The bridge is evolving toward:

`marketplace adapters -> common bridge protocol -> AI adapters`

Current AI adapters: ChatGPT and Alice. Future adapters may include other AI chats without changing provider-specific planning/security semantics.

The browser extension must support many tabs/conversations/models simultaneously and independently. There is no global “current conversation”. Binding, run, delivery and recovery state are conversation/owner scoped.

## Provider-side planning architecture

The agreed provider pipeline is:

`clicked code-block batch -> parse whole batch -> strict operation validation -> resolve Seller capability once if needed -> entitlement-plan every logical command -> query planner/optimizer -> safe coalescer -> cache/prefetch -> provider quota scheduler -> Ozon -> response verifier -> safe error normalizer -> logical result projector -> existing batch/delivery engine`

Important separation:

- an **AI logical command** is a data requirement;
- a **physical provider request** is an optimized transport action;
- future planner/coalescer work may allow several logical commands to be satisfied by one physical provider request;
- result provenance must explicitly connect logical command IDs/fingerprints to physical request IDs/fingerprints.

## Batch capability invariant

One Ozon-button click defines one logical batch.

For Seller entitlement-sensitive work:

`ONE BUTTON CLICK = ONE LOGICAL BATCH`

`ONE LOGICAL BATCH = 0 or 1 capability probe + minimum necessary business requests`

Rules:

- parse the complete clicked block before planning;
- perform basic contract validation before entitlement resolution;
- if the batch contains no entitlement-sensitive requirement, execute **0** `/v1/seller/info` probes;
- if capability is needed, execute at most **1** internal `/v1/seller/info` probe for the entire batch;
- never probe once per logical command;
- capability resolution precedes merge/coalescing;
- `/v1/seller/info` is planning infrastructure, not an AI-callable normal operation;
- it must not create an extra `OZON_RESULT` logical item;
- raw seller-info response data such as company/INN/OGRN/ratings must never reach the AI; only reviewed subscription/capability projection may be used.

Reviewed subscription enum:

`UNKNOWN | UNSPECIFIED | PREMIUM | PREMIUM_LITE | PREMIUM_PLUS | PREMIUM_PRO`

Capability must be modeled by operation/field entitlement rules rather than a single global `is_premium` boolean.

## Strict contract behavior

### analytics_data

Provider operation: `POST /v1/analytics/data`.

Required request fields remain `date_from`, `date_to`, `dimension`, `metrics`, `limit`.

Reviewed universal metrics:

- `revenue`;
- `ordered_units`.

Reviewed universal dimensions:

- `unknownDimension`;
- `sku`;
- `spu`;
- `day`;
- `week`;
- `month`.

Reviewed Premium Plus restricted dimensions:

- `year`;
- `category1`;
- `category2`;
- `brand`;
- `modelID`;
- `descriptionType`.

Reviewed advanced metrics include the documented Premium Plus set (`hits_*`, `session_*`, `conv_*`, `returns`, `cancellations`, `delivered_units`, `position_category`). Unknown/invented metrics such as `orders_count` must fail local validation instead of wasting a provider request.

Documented operation limits include:

- up to 14 metrics;
- `limit` 1..1000;
- without Premium Plus, data-history and metric/dimension restrictions apply;
- provider method limit: `/v1/analytics/data` no more than one request per minute.

The temporal one-request/minute limit is a Step 3 scheduler responsibility, not Step 1.

When some requested analytics metrics are available and some are not entitled:

- retain the original logical command identity;
- build a safe physical command containing only the entitled subset;
- mark planning as partial and list omitted metrics explicitly;
- do not silently substitute a semantically different metric;
- if all requested metrics are unavailable, execute zero analytics business requests and return structured `SUBSCRIPTION_REQUIRED` or `ENTITLEMENT_UNKNOWN` as appropriate.

Restricted dimensions/sort/filter semantics must not be silently removed if doing so changes query meaning.

### product_queries

Provider operation: `POST /v1/analytics/product-queries`.

Contract hardening direction:

- `date_from` / `date_to` use RFC3339 `date-time` where supplied;
- `page >= 0`;
- `page_size <= 1000`;
- `skus` is an array of string int64 values, max 1000;
- validate documented sort enum/direction;
- do not invent undocumented minimums.

Recent data may be partially available without subscription. Historical data older than the documented recent window requires an eligible subscription; planning must expose partial subscription scope rather than pretending the response is complete.

### product_queries_details

Provider operation: `POST /v1/analytics/product-queries/details`.

Contract hardening direction:

- RFC3339 date-time validation;
- `page >= 0`;
- `page_size <= 100`;
- max 1000 SKU strings;
- `limit_by_sku <= 15`;
- documented sort validation;
- entitlement-aware historical/sort planning.

## Safe coalescing rules (future Step 2)

The core optimization idea is accepted, but “merge all analytics requests” is rejected as unsafe.

`analytics_data` commands may be merged only when query semantics are compatible.

Safe candidate merge conditions include the same:

- date range;
- dimensions;
- filters;
- sort;
- offset/window semantics;

with metrics union not exceeding 14.

For otherwise identical requests with different compatible limits, the planner may fetch the larger safe window and project/slice locally only when completeness/order semantics remain valid.

Do **not** blindly merge different:

- dimensions;
- filters;
- date ranges;
- sort semantics;
- aggregation shapes.

Do not derive cross-dimension or cross-window facts unless mathematical correctness and completeness are proven. Non-additive metrics and top-N truncation make naïve local aggregation unsafe.

## Quota/rate architecture (future Step 3)

Provider limits are provider contract, not arbitrary bridge throttles.

`/v1/analytics/data` has a documented maximum frequency of one request per minute.

The scheduler must eventually maintain a global quota bucket for the same Seller account/credential identity across ChatGPT, Alice and multiple tabs.

Planned model:

- quota scope: Seller credential/account identity + operation/quota family;
- internal credential hash/revision only, never raw credential values in logs;
- persistent `last_provider_request_at` / `next_allowed_at` state so MV3 worker restart does not reset the quota;
- centralized provider registry/config for `min_interval_ms` and safety margin;
- honor a provider `Retry-After` greater than local next-allowed time when supplied;
- no hidden retry;
- no blind request hammering after 429;
- provider-specific quota enforcement must not reintroduce arbitrary generic request/data caps removed in v0.1.6.

The general Seller API limit and method-specific limits remain distinct quota families; the internal `/v1/seller/info` capability probe consumes Seller API capacity but is not evidence of consuming the `/v1/analytics/data` one-minute method bucket.

## Response verification and safe errors (future Step 3)

For multi-metric `analytics_data`, do not silently assume positional mapping if provider shape is inconsistent.

If N metrics were physically requested but a response row/totals metric array has an incompatible count, fail with a contract-mismatch diagnostic rather than guessing.

Provider errors exposed to AI should be sanitized structured data, e.g.:

- category;
- HTTP status;
- safe provider code;
- safe message/field violations;
- `external_request_executed`;
- retry/next-allowed metadata where known.

Raw provider bodies, credentials and secret-bearing headers are not AI output.

## Cache/prefetch strategy (future Step 4)

Batch coalescing alone does not help weak models that ask related questions across multiple turns.

Planned strategy:

- cache verified provider supersets by safe query shape;
- when an expensive analytics request is made, optionally acquire a safe reusable metric superset, at minimum universal `revenue + ordered_units` when query semantics permit;
- later subset logical requests may be projected from cache with `external_request_executed=false`;
- richer Premium bundles require known capability; never blindly add restricted metrics;
- cache/provenance must state source request and freshness;
- optional cross-tab identical-request dedupe may be added later, but global quota correctness has higher priority.

High-level semantic aliases for weaker models may later compile deterministically into low-level reviewed operations, e.g. sales/search snapshots, without removing the advanced low-level contract.

## Delivery and AI-adapter protection

Provider/planner work must not casually modify proven ChatGPT delivery semantics.

Protected principles:

- ChatGPT delivery remains based on the proven v0.1.12-style lifecycle carried forward into the operator baseline;
- persistent “Начало диктовки” must not be treated as delivery completion;
- Alice identity/delivery semantics are handled separately;
- code-block binding remains native-Copy structural binding to the exact block node, independent of command contents;
- provider planning must stay service-worker/provider-side and must not require rewriting AI DOM/composer logic.

## Engineering steps and status

### Step 0 — QA harness qualification — ACCEPTED

Accepted Codex/Puppeteer/Chrome for Testing development harness. Intermediate builds no longer require operator ZIP installation.

### Step 1 — Contract + Capability layer — IMPLEMENTED, VALIDATION RUNNING

Frozen implementation SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Development branch:

`dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`

Independent Codex validation has been dispatched. Do not begin Step 2 until the report is reviewed.

### Step 2 — Query planner + safe coalescing — PENDING

One coherent step should add the planner/optimizer and safe analytics coalescing while retaining logical-command results/provenance and existing serial delivery semantics.

No quota scheduler redesign in this step unless required by the approved Step 2 plan.

### Step 3 — Global provider quota scheduler + response verifier + safe errors — PENDING

Implement persistent Seller-account quota coordination, especially `/v1/analytics/data` one-per-minute behavior, response-shape verification, and sanitized structured provider errors.

### Step 4 — Cache/prefetch + semantic acquisition profiles + integrated acceptance — PENDING

Add safe reusable provider cache/prefetch, optional deterministic high-level semantic aliases, then run integrated multi-tab/multi-AI regression and controlled final live acceptance.

This step breakdown is intentionally coarse. Do not split it into dozens of micro-steps unless a concrete validation failure requires a bounded repair inside the current step.
