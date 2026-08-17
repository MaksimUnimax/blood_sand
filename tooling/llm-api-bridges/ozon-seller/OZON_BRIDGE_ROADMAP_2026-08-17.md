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
- several compatible logical commands may be satisfied by one physical request;
- every logical result must retain its own logical command identity and explicit provenance to the physical request that satisfied it;
- provider optimization must not alter query meaning or delivery ownership semantics.

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

Capability is modeled by operation/field entitlement rules rather than a single global `is_premium` boolean.

## Strict contract behavior retained from accepted Step 1

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

Reviewed advanced metrics include the documented Premium Plus set (`hits_*`, `session_*`, `conv_*`, `returns`, `cancellations`, `delivered_units`, `position_category`). Unknown/invented metrics such as `orders_count` fail local validation instead of wasting a provider request.

Documented operation limits include:

- up to 14 metrics;
- `limit` 1..1000;
- without Premium Plus, data-history and metric/dimension restrictions apply;
- provider method limit: `/v1/analytics/data` no more than one request per minute.

The temporal one-request/minute limit remains a **Step 3 scheduler responsibility**, not Step 2.

When some requested analytics metrics are available and some are not entitled:

- retain the original logical command identity;
- build a safe physical command containing only the entitled subset;
- mark planning as partial and list omitted metrics explicitly;
- do not silently substitute a semantically different metric;
- if all requested metrics are unavailable, execute zero analytics business requests and return structured `SUBSCRIPTION_REQUIRED` or `ENTITLEMENT_UNKNOWN` as appropriate.

Restricted dimensions/sort/filter semantics must not be silently removed if doing so changes query meaning.

### product_queries

Provider operation: `POST /v1/analytics/product-queries`.

Retained contract:

- `date_from` / `date_to` use RFC3339 `date-time` where supplied;
- `page >= 0`;
- `page_size <= 1000`;
- `skus` is an array of string int64 values, max 1000;
- documented sort enum/direction is validated;
- no invented undocumented minimums.

Recent data may be partially available without subscription. Historical data older than the reviewed recent window requires eligible subscription scope.

### product_queries_details

Provider operation: `POST /v1/analytics/product-queries/details`.

Retained contract:

- RFC3339 date-time validation;
- `page >= 0`;
- `page_size <= 100`;
- max 1000 SKU strings;
- `limit_by_sku <= 15`;
- documented sort validation;
- entitlement-aware historical/sort planning.

## Step 2 safe coalescing contract

Step 2 implements a conservative query planner/optimizer and coalescer. “Merge all analytics requests” is explicitly rejected.

### Coalescing unit

Only logical commands that already survived Step-1 strict validation and entitlement planning may enter Step-2 coalescing.

Step 2 may coalesce `analytics_data` logical commands only when their executable physical semantics are compatible.

The merge key must preserve equality of:

- operation (`analytics_data` only for metric-union coalescing);
- `date_from`;
- `date_to`;
- ordered dimensions / dimension semantics;
- filters after deterministic semantic normalization;
- sort semantics after deterministic semantic normalization;
- offset/window semantics.

The union of physical metrics must not exceed 14.

### Limit/window rule

The initial Step-2 implementation is intentionally conservative: different `limit` values are **not coalesced** unless a later independently reviewed rule proves that larger-window fetch + local projection is complete and order-preserving for the exact shape. This avoids accidental top-N or non-additive semantic errors.

### Explicit no-merge cases

Do not coalesce commands with different:

- operations;
- date ranges;
- dimensions or dimension order/shape;
- filters;
- sort metric/direction;
- offset;
- limit/window semantics;
- entitlement-plan semantics that produce different executable query shapes.

Do not derive cross-dimension, cross-filter, cross-window, or cross-date facts. Do not aggregate non-additive metrics locally. Do not infer omitted provider rows from truncated top-N responses.

### Logical/physical projection requirements

For a successful coalesced physical request:

- execute exactly one physical provider call for that coalescing group;
- retain every original logical command and logical fingerprint;
- record one physical request ID/fingerprint and the set/order of metrics physically requested;
- project the provider response back into one logical result per original command;
- each logical result exposes only its requested executable metrics, preserving original metric order;
- Step-1 omitted/restricted metric metadata remains attached to the correct logical command;
- `external_request_executed` is true for logical results backed by that physical provider call;
- no extra synthetic AI-visible result item is created for the physical request itself.

If safe projection cannot be proven for a provider response shape, Step 2 must fail closed for that group rather than guess. Full response-shape verification policy remains Step 3, but Step 2 must not manufacture mappings it cannot deterministically establish.

### Non-coalesced behavior

Commands that are incompatible or are not eligible for Step-2 optimization continue through the existing serial business executor. Performance operations and unrelated Seller operations are not semantically merged by Step 2.

## Quota/rate architecture — future Step 3

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

## Response verification and safe errors — future Step 3

For multi-metric `analytics_data`, do not silently assume positional mapping if provider shape is inconsistent.

If N metrics were physically requested but a response row/totals metric array has an incompatible count, fail with a contract-mismatch diagnostic rather than guessing.

Provider errors exposed to AI should be sanitized structured data. Raw provider bodies, credentials and secret-bearing headers are not AI output.

## Cache/prefetch strategy — future Step 4

Batch coalescing alone does not help weak models that ask related questions across multiple turns.

Planned strategy includes safe verified provider-superset caching, optional deterministic semantic acquisition aliases, explicit cache provenance/freshness, and integrated multi-tab/multi-AI regression.

## Delivery and AI-adapter protection

Provider/planner work must not casually modify proven ChatGPT delivery semantics.

Protected principles:

- ChatGPT delivery remains based on the proven v0.1.12-style lifecycle carried forward into the operator baseline;
- persistent “Начало диктовки” must not be treated as delivery completion;
- Alice identity/delivery semantics are handled separately;
- code-block binding remains native-Copy structural binding to the exact block node, independent of command contents;
- provider planning stays service-worker/provider-side and must not require rewriting AI DOM/composer logic;
- no global “current conversation”.

## Engineering steps and status

### Step 0 — QA harness qualification — ACCEPTED

Accepted Codex/Puppeteer/Chrome for Testing development harness. Intermediate builds no longer require operator ZIP installation.

### Step 1 — Contract + Capability layer — ACCEPTED

Original frozen production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Independent accepted validation report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Validation branch:

`validation/ozon-step1-contract-capability-retest-v2-2026-08-17`

Verdict:

`STEP1_ACCEPTED_FOR_STEP2`

All load-bearing Step-1 gates passed with `OPERATOR_BROWSER_ACTIONS = 0` and `REAL_OZON_REQUESTS = 0`.

### Step 2 — Query planner + safe coalescing — IN PROGRESS

Implement one coherent conservative planner/optimizer and safe `analytics_data` metric-union coalescer while retaining one logical result per original command, exact provenance, Step-1 capability/entitlement semantics and existing serial delivery behavior.

No Step-3 quota scheduler redesign is in scope.

### Step 3 — Global provider quota scheduler + response verifier + safe errors — PENDING

Implement persistent Seller-account/method quota coordination, especially `/v1/analytics/data` one-per-minute behavior across tabs/AIs, response-shape verification and sanitized structured provider errors.

### Step 4 — Cache/prefetch + semantic acquisition profiles + integrated acceptance — PENDING

Add safe reusable provider cache/prefetch, optional deterministic high-level semantic aliases, then integrated multi-tab/multi-AI regression and controlled final live acceptance.

This step breakdown is intentionally coarse. Do not split it into dozens of micro-steps unless a concrete validation failure requires a bounded repair inside the current step.
