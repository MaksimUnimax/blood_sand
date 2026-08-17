# Ozon Bridge — current engineering roadmap

Date: 2026-08-17
Status: active roadmap/specification; Step 2 frozen for independent validation.

## Target architecture

`marketplace adapters -> common bridge protocol -> AI adapters`

Current AI adapters are ChatGPT and Alice. Tabs/conversations/models are independent; there is no global “current conversation”.

Provider pipeline:

`clicked code-block batch -> parse whole batch -> strict operation validation -> resolve Seller capability once if needed -> entitlement-plan logical commands -> query planner/optimizer -> safe coalescer -> cache/prefetch -> provider quota scheduler -> Ozon -> response verifier -> safe error normalizer -> logical result projector -> existing batch/delivery engine`

Logical commands are data requirements. Physical provider requests are transport actions. Optimization must preserve query semantics, logical identity, provenance and delivery ownership.

## Accepted Step-1 invariants

One Ozon-button click is one logical batch.

For Seller entitlement-sensitive work:

- strict contract validation occurs before entitlement planning;
- a relevant batch performs at most one internal `POST /v1/seller/info` capability probe;
- universal/performance-only work performs zero Seller capability probes;
- seller-info is infrastructure, not AI-callable;
- raw seller identity/company/rating fields never reach AI output;
- reviewed enum: `UNKNOWN | UNSPECIFIED | PREMIUM | PREMIUM_LITE | PREMIUM_PLUS | PREMIUM_PRO`;
- UNKNOWN is never treated as “no subscription”;
- partial analytics may remove only unavailable metrics when remaining semantics stay valid;
- restricted dimension/sort/filter semantics are rejected rather than silently removed;
- worker restart after an unknown in-flight capability probe does not blindly re-probe.

Accepted Step-1 validation report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Verdict:

`STEP1_ACCEPTED_FOR_STEP2`

## Contract facts retained

### `analytics_data`

`POST /v1/analytics/data`

Required: `date_from`, `date_to`, `dimension`, `metrics`, `limit`.

Reviewed universal metrics: `revenue`, `ordered_units`.

Reviewed universal dimensions: `unknownDimension`, `sku`, `spu`, `day`, `week`, `month`.

Reviewed restricted dimensions include `year`, `category1`, `category2`, `brand`, `modelID`, `descriptionType`.

Maximum reviewed metric count: 14. `limit`: 1..1000.

Documented method frequency is no more than one request per minute. **Temporal enforcement belongs to Step 3, not Step 2.**

### `product_queries`

`POST /v1/analytics/product-queries`

RFC3339 date-time, `page >= 0`, `page_size <= 1000`, max 1000 SKU strings, reviewed sort validation, no invented undocumented minimums.

### `product_queries_details`

`POST /v1/analytics/product-queries/details`

RFC3339 date-time, `page >= 0`, `page_size <= 100`, max 1000 SKU strings, `limit_by_sku <= 15`, reviewed sort/entitlement behavior.

## Step 2 safe coalescing contract

Step 2 is intentionally conservative. “Merge all analytics requests” is rejected.

Only logical commands that already survived Step-1 validation and entitlement planning may enter coalescing.

Only contiguous compatible `analytics_data` commands are coalesced. Contiguous-only grouping preserves physical execution order around unrelated operations.

Compatibility is evaluated on the Step-1 executable physical command. Equality is preserved for every normalized physical parameter except `metrics`, including:

- operation;
- `date_from` / `date_to`;
- ordered dimensions;
- filters and array order;
- sort and array order;
- offset;
- limit/window semantics;
- any other reviewed normalized physical parameter.

Object key order may be normalized deterministically; array order remains semantic.

Different limits are not coalesced in Step 2.

Metric union preserves deterministic first-seen order and cannot exceed 14. A command that would push a group beyond 14 remains outside that group.

Duplicate metric positions inside one logical executable command are treated as ineligible for coalescing rather than guessed.

Do not derive cross-dimension, cross-filter, cross-window or cross-date facts. Do not locally aggregate non-additive metrics or infer rows hidden by top-N truncation.

### Logical / physical projection

One successful coalesced physical request must produce one logical result per original command.

Each logical result retains:

- distinct logical request ID;
- original logical command fingerprint;
- Step-1 capability/entitlement metadata;
- shared physical request ID;
- shared physical command fingerprint;
- `coalescing_group_id`;
- physical metric set/order;
- its own projected executable metric set/order.

No extra AI-visible result item is created for the physical request itself.

Projection must fail closed when provider metric arrays cannot be mapped deterministically. Cardinality mismatch or missing projection surfaces yields sanitized `ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE` logical errors with the already-executed physical request recorded and no retry.

Provider HTTP errors similarly fan out safe logical errors with shared physical provenance and no retry.

### Durable ownership

All logical members of a coalesced group are durably marked requesting under one worker session before the physical provider call.

A later worker observing that group requesting under a previous session performs zero replay and uses the accepted unknown-outcome no-retry behavior.

A partially executed old batch without a Step-2 query plan is not retroactively regrouped; it fails closed as migration-unsafe.

## Step 3 boundary

Step 2 does **not** implement:

- global Seller account quota buckets;
- persistent `last_provider_request_at` / `next_allowed_at` scheduler state;
- `/v1/analytics/data` one-per-minute coordination across tabs/AIs;
- waiting/sleep scheduling;
- automatic Retry-After retry;
- broad response-verifier/error-normalizer redesign.

Retry-After may be safely reported as metadata only.

## Delivery / AI adapter protection

Provider planning remains worker/provider-side.

Protected:

- native Copy structurally anchors the exact code block;
- Ozon button exists independent of code contents; parser decides command validity;
- no content fingerprint is used as block identity;
- one extension-owned top-level Shadow DOM overlay;
- multi-tab/conversation ownership remains independent;
- proven ChatGPT delivery FSM is not rewritten;
- persistent “Начало диктовки” is not delivery completion;
- Alice lifecycle remains separate;
- AI cannot inject arbitrary URL/host/method/headers/auth/credentials;
- mutations remain blocked;
- `posting_fbs_get` remains blocked for customer PII;
- no hidden provider retry/pagination/report polling;
- no arbitrary generic bridge caps or silent truncation.

## Engineering status

### Step 0 — QA harness — ACCEPTED

Accepted Windows/Puppeteer/CFT intermediate validation route remains closed and authoritative.

### Step 1 — Contract + Capability — ACCEPTED

Original logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction-v2 target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report commit:

`249669986d61c5df708dd5b635fe30662120336f`

### Step 2 — Query planner + safe coalescing — IMPLEMENTED / FROZEN / VALIDATION PENDING

Development branch:

`dev/ozon-v0.1.19-step2-query-planner-coalescing-2026-08-17`

Branch base / Step-1 acceptance decision:

`c8d6a10b63b7c02095a6cc6626f5aa508e16a8bd`

**Frozen implementation target:**

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Step-2 patch SHA-256:

`93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

Exactly three production files differ from accepted Step 1:

- `service_worker.js` — `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`
- `shared/ozon_contract.js` — `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`
- `shared/ozon_provider.js` — `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`

The other fourteen production files are byte-identical to accepted Step 1.

Local mocked executable suite and fresh patch reconstruction passed; local evidence is not independent acceptance.

Standalone validation plan:

`validation/plans/OZON_STEP2_QUERY_PLANNER_COALESCING_CODEX_VALIDATION_2026-08-17.md`

Plan commit:

`f628f5c6bd85e925ddf96bea672f6aa080ff5377`

Expected validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Step 3 remains blocked until the full Step-2 GitHub report is reviewed and accepted.

### Step 3 — Global quota scheduler + response verifier + safe errors — BLOCKED

After Step-2 acceptance, implement persistent cross-tab/AI quota coordination, method quota families, response verification and sanitized provider errors without hidden retry.

### Step 4 — Cache/prefetch + semantic acquisition + integrated acceptance — BLOCKED

After Step 3, implement verified reusable cache/prefetch, reviewed semantic acquisition profiles and integrated multi-tab/multi-AI/final live acceptance.

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED_FOR_STEP2`

`STEP2 = FROZEN_WAITING_FOR_CODEX_VALIDATION`

`STEP3 = BLOCKED`

`STEP4 = BLOCKED`
