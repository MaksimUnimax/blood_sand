# Ozon Bridge Step 4 — cache/prefetch + semantic acquisition implementation and local evidence

Date: 2026-08-18
Status: implementation complete locally; independent Codex validation is still required before final controlled live acceptance.

## Accepted base

Exact accepted Step-3 production target:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Independent Step-3 validation report ref:

`21b004b`

Decision:

`STEP3_ACCEPTED_FOR_STEP4`

The accepted Step-3 candidate was reconstructed again from the exact operator baseline plus accepted Step-1, Step-2 and Step-3 raw patch layers before Step-4 work. All frozen Step-3 production hashes matched.

## Scope implemented

Step 4 adds only a conservative verified analytics cache/prefetch layer and one fixed semantic acquisition profile.

### Verified persistent analytics cache

New internal storage key:

`ozmb_provider_result_cache_v1`

Only successful, already verified `analytics_data` results are cacheable.

Cache reuse requires:

- same internal Seller account hash;
- exact Step-2 analytics compatibility key, which preserves date range, dimensions/order, filters/array order, sort, offset, limit and all other normalized non-metric query semantics;
- an unexpired entry;
- cached metrics being an exact/safe superset of the requested executable metrics;
- successful re-verification of the cached provider result before projection.

The fixed cache TTL is `60000` ms. The AI cannot provide or modify cache keys, TTL, Seller identity, storage namespace or cache policy.

Different Seller accounts cannot share cache. API-key rotation for the same Seller Client-Id preserves the account-scoped cache because identity remains Seller-account scoped. Raw Client-Id and Api-Key are never stored in cache state.

Cache hits are checked before Step-3 quota acquisition because they execute no provider request. A miss proceeds through the existing Step-3 quota scheduler unchanged.

Cache hit logical provenance explicitly records `external_request_executed=false`, freshness timestamps/age, cached/requested metric sets, fixed acquisition profile id when applicable, and source request/fingerprint metadata. Internal account hash is not AI-visible.

Provider errors, bridge errors and malformed/unverifiable responses are never stored. Expired entries are ignored and pruned on later writes. No arbitrary entry-count/data-size cap or silent truncation was added.

### Safe metric-superset reuse

A verified cached analytics result may satisfy a logical request only by deterministic metric projection using the accepted Step-2 `projectAnalyticsDataResult` function.

No date, dimension, filter, sort, offset or limit/window widening is allowed. No top-N expansion, local aggregation, cross-filter derivation or cross-dimension derivation is introduced.

Step-2 coalesced groups may be satisfied from a compatible verified cache. In that case all original logical identities/results are still emitted, but no current physical request is fabricated: `external_request_executed=false` and current physical request id is null while cache-source provenance remains explicit.

### Reviewed semantic acquisition profile / prefetch

Fixed internal profile:

`analytics_basic_metrics_v1`

It applies only to already-normalized `analytics_data` executable commands whose requested metrics are a non-empty subset of the universal metrics:

`revenue`, `ordered_units`

The profile may physically request exactly:

`["revenue", "ordered_units"]`

while preserving every other normalized query parameter unchanged. It never adds restricted metrics and never changes date range, dimensions, filters, sort, offset or limit.

The prefetched provider result is verified by the accepted Step-3 verifier, cached, then locally projected back to the logical executable metric set before delivery. The AI sees only the logical requested executable metrics; acquisition metadata records the fixed profile and physical metric superset.

No new AI-callable provider operation, URL, host, method, headers or credentials surface was added.

## Production delta

Exactly three of the 17 production files change relative to accepted Step 3:

- `service_worker.js` -> `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` -> `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` -> `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

The other fourteen production files are byte-identical to accepted Step 3, including manifest, content script, popup surfaces, AI adapters, composer, conversation identity, credentials, provider transport and `shared/ozon_provider.js`.

Manifest permissions and host permissions are therefore byte-identical to accepted Step 3.

## Protected function audit

Brace-aware raw function-body hashing proved these accepted functions remain byte-identical between Step 3 and Step 4:

### Step 1 / capability

- `ensureBatchCapabilityAndPlanning`
- `planCommandForSellerCapability`

### Step 2 / planner and projector

- `buildBatchQueryPlan`
- `ensureBatchQueryPlanning`
- `analyticsCoalescingDescriptor`
- `buildAnalyticsCoalescedCommand`
- `projectAnalyticsDataResult`

### Step 3 / quota, verifier and durable wait

- `acquireAnalyticsProviderQuota`
- `extendAnalyticsQuotaFromRetryAfter`
- `prepareProviderQuotaForCommand`
- `persistBatchQuotaWait`
- `verifyProviderResponse`

### Delivery FSM

- `finalizeAutoBatch`
- `finalizeManualBatch`
- `attemptAutoDelivery`
- `attemptManualBatchDelivery`

Step-4 integration intentionally changes `processBatchQueue` to add cache lookup/store and fixed prefetch around the already accepted planner/quota/provider flow.

## Local executable evidence

Environment used after reconstruction:

- Node `v22.16.0`
- Git/Python from the current engineering container

All provider behavior in Step-4 tests was mocked. `REAL_OZON_REQUESTS = 0`.

PASS:

- fixed acquisition profile accepts universal `revenue` subset and compiles to exactly `revenue + ordered_units`;
- restricted metric profile attempt is inapplicable and does not widen entitlement;
- verified two-metric cache entry serves exact `revenue` and `ordered_units` logical projections;
- different limit/window semantics miss cache;
- different Seller account misses cache;
- same Seller with rotated Api-Key reuses account-scoped cache;
- expired cache misses;
- provider error is not cached;
- malformed cardinality cannot be cached;
- serialized cache state contains neither raw Seller Client-Id nor Api-Key;
- cache-hit report carries `external_request_executed=false` plus explicit cache provenance/freshness;
- prefetched two-metric provider result projects back to one requested metric before delivery;
- cache lookup does not mutate Step-3 quota state;
- actual worker queue: first `revenue` logical command => one quota decision + one mocked physical provider call using fixed prefetch profile;
- following compatible `ordered_units` logical command => cache hit with zero second quota acquisition and zero second provider call;
- Step-2 coalesced two-logical-command group can be satisfied atomically from the verified cache with zero new provider request;
- incompatible/different-limit request remains a cache miss and still invokes Step-3 quota/provider path;
- all production JavaScript passes `node --check`;
- `manifest.json` parses;
- `git diff --check` passes;
- fresh accepted-Step3 copy + exact Step-4 patch reconstructed all 17 production files byte-for-byte.

Patch reconstruction:

- concatenated Step-4 patch size: `29136`
- SHA-256: `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

All six GitHub patch parts were checked after transport by exact size and Git blob SHA; every live object matched the local raw bytes.

## Security and acceptance boundary

Step 4 does not add arbitrary assistant-controlled cache policy, transport fields, mutation operations, retry, pagination, report polling or a cache-based bypass for a real cache miss.

This local evidence is not independent acceptance. Synthetic cache/worker tests are not a claim of real logged-in ChatGPT/Alice/Ozon acceptance.

After an independent Codex Step-4 validation accepts the exact frozen implementation target, the project still requires a separate controlled final live acceptance gate in the operator's real browser/profile and controlled real Ozon environment before canonical release promotion.
