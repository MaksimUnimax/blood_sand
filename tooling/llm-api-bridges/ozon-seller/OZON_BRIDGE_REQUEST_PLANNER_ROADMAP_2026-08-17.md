# Ozon Bridge — request planner, capability, quota and diagnostics roadmap

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Working branch: `work/ozon-data-collection-2026-08-11`
Canonical branch HEAD before this document: `50afcc835c5dc374d320dbaeda27062fd5c0f848`
Status: **design / implementation gate; no production code change is claimed by this document**.

Companion documents:

- `OZON_BRIDGE_PRODUCT_DIRECTION_2026-08-13.md`
- `OZON_BRIDGE_MULTI_AI_MIGRATION_ROADMAP_2026-08-13.md`
- `OZON_BRIDGE_BOUNDARY_AUDIT_2026-08-12.md`

## 1. Why this roadmap exists

The earlier bridge architecture treated an accepted AI command approximately as one physical provider request and executed batch items sequentially. That model is safe, but it is inefficient for provider methods with severe method-specific quotas and it places too much burden on the AI model to produce an optimal request plan.

Live operator testing against an external v0.1.19 candidate exposed the practical failure mode:

- `POST /v1/analytics/data` succeeded for `revenue`;
- a separate request succeeded for `ordered_units`;
- immediate subsequent requests returned HTTP 429;
- the official Ozon contract already records that `/v1/analytics/data` may be used **not more than once per minute**;
- the same contract allows up to **14 metrics** in one analytics request.

The product must work with weaker web AIs such as Alice as well as stronger models. Therefore request optimization, subscription awareness, quota enforcement and error interpretation cannot be delegated primarily to the model.

The bridge must evolve from:

`AI command -> provider request`

into:

`AI logical data requirements -> validated execution plan -> minimum safe provider requests`.

This is a provider/core planning change. It must not be implemented by rewriting proven ChatGPT/Alice DOM binding or delivery behavior.

## 2. Non-negotiable architectural boundary

The change belongs between command parsing and provider transport:

`AI adapter -> command discovery/parser -> logical batch -> contract validator -> capability resolver -> entitlement filter -> request planner/coalescer -> cache/prefetch -> quota scheduler -> provider transport -> response verifier -> safe error normalizer -> logical result projector -> existing batch delivery`.

Protected areas that are not part of this task unless a dependency is explicitly proven:

- native Copy -> exact code-block binding;
- ChatGPT delivery FSM and its proven completion semantics;
- Alice DOM/delivery implementation except where it consumes the common result protocol;
- conversation ownership and fail-closed binding;
- credential isolation;
- fixed provider hosts and methods;
- mutation blocklist;
- customer-PII protections;
- no arbitrary assistant-controlled transport.

## 3. One click means one logical batch

A click on one bound Ozon code block creates one logical batch containing every valid `OZON_API_V1` command in that exact block.

Before any business-data provider call, the worker must inspect the complete logical batch and build an execution plan.

Example:

- 30 logical commands in one code block do **not** imply 30 immediate Ozon requests;
- the planner may satisfy many logical commands from one physical request when equivalence is proven;
- the final AI-facing report still describes the logical command outcomes, not merely the physical request count.

The plan must retain traceability from every logical command to the physical request/cache entry that satisfied it.

## 4. Strict contract validation before provider execution

Weak-model mistakes must be rejected before they consume provider quota whenever the official contract is known.

Validation must be operation-specific and include, where the current official contract provides it:

- required fields;
- enums;
- date/time formats;
- page/page_size bounds;
- limit/offset bounds;
- SKU type/count bounds;
- metric and dimension enums;
- sort keys/directions;
- subscription/history rules;
- operation-specific rate rules.

Known example:

- `/v1/analytics/data` uses `ordered_units` for ordered product units;
- `orders_count` is not a valid `analytics_data` metric and must not be silently rewritten to `ordered_units`, because “number of orders” and “number of ordered units” are not guaranteed to be semantically identical.

Invalid but recognizable model output should produce a structured bridge validation result with `external_request_executed:false` and, when safe, allowed values or a precise corrective hint.

Do not repair malformed JSON silently.

## 5. Seller subscription/capability resolution

### 5.1 Source

Use the read-only `POST /v1/seller/info` capability surface to resolve seller subscription state. The official response schema exposes a subscription object with `is_premium` and a subscription type including:

- `UNKNOWN`;
- `UNSPECIFIED`;
- `PREMIUM`;
- `PREMIUM_LITE`;
- `PREMIUM_PLUS`;
- `PREMIUM_PRO`.

### 5.2 Probe frequency

The capability probe is **batch-scoped, not command-scoped**.

For one clicked block containing 30 logical commands:

- never call `/v1/seller/info` 30 times;
- perform at most one capability probe for that logical batch when capability-dependent requirements are present;
- if the batch has no capability-dependent requirements, the planner may omit the probe;
- a future fresh capability cache may allow zero probes, but the initial implementation may deliberately re-check once per relevant clicked batch for simpler, fresher semantics.

The capability probe is an internal prerequisite and must not appear to the AI as a separate user-requested result item.

### 5.3 Privacy

`/v1/seller/info` can contain company identity and rating data that are not needed for entitlement planning.

The capability resolver must retain/expose only reviewed capability fields required by the planner. It must not forward the raw seller-info response, INN/OGRN/company fields or unrelated ratings into the AI conversation.

### 5.4 Capability states

The planner must distinguish at least:

1. `SUPPORTED_AND_ENTITLED` — contract supports the field/metric and the current seller tier allows it;
2. `SUPPORTED_BUT_NOT_ENTITLED` — contract supports it but the seller subscription does not;
3. `ENTITLEMENT_UNKNOWN` — contract supports it but seller capability could not be established;
4. `UNSUPPORTED` — the requested field/metric is not in the reviewed contract for that operation.

These states must not be collapsed into one generic 400/error.

## 6. Entitlement registry and partial-result semantics

Entitlement is operation/feature-specific, not one global `is_premium` boolean.

The reviewed registry must encode rules such as:

- `analytics_data.revenue` -> available to all sellers;
- `analytics_data.ordered_units` -> available to all sellers;
- Premium-only analytics metrics -> exact allowed subscription tiers from the current official contract;
- `product_queries` / `product_queries_details` -> their own subscription/history rules, which differ from `analytics_data`.

If a logical analytics command requests both available and unavailable metrics, the planner should not send the unavailable metrics merely to see how Ozon behaves.

Example logical request:

`metrics = [revenue, ordered_units, hits_view, conv_tocart]`

If the seller lacks the required tier:

- physical request contains only the entitled subset;
- the logical result is marked partial;
- the report names each omitted metric and the subscription requirement;
- the AI is explicitly told that these requested facts were unavailable because of the seller's current Ozon subscription and should say so to the user.

If **all** requested metrics are unavailable by subscription, perform zero analytics provider requests and return `SUBSCRIPTION_REQUIRED` / equivalent with `external_request_executed:false`.

If entitlement is unknown, do not claim the user lacks Premium. Report capability as unknown and either resolve it through the one batch-level capability probe or fail closed for tier-restricted fields.

## 7. Analytics request coalescing

### 7.1 Objective

Exploit the provider's bulk request shape so multiple logical `analytics_data` commands can become fewer physical `/v1/analytics/data` requests.

### 7.2 Safe first implementation

Coalescing must be semantic, not text-based.

Define a normalized merge signature containing all request properties that affect the meaning/order of rows except the fields explicitly proven safe to widen. At minimum, initial merge compatibility should require equality of:

- operation;
- `date_from`;
- `date_to`;
- `dimension`;
- normalized `filters`;
- normalized `sort`;
- compatible pagination window.

For compatible commands:

- union unique requested metrics;
- never exceed the current provider maximum of 14 metrics;
- preserve deterministic metric ordering and record the mapping;
- where sort/offset semantics are identical, a wider `limit` may be used and narrower logical results may be projected locally only when equivalence is proven.

Example:

- logical A requests `revenue`;
- logical B requests `ordered_units`;
- same date range/dimension/filter/sort/window;

Physical request may request `[revenue, ordered_units]` once and the result projector satisfies both logical commands.

### 7.3 Do not merge by changing analytical grain

Do **not** automatically merge requests with different dimensions by constructing a larger dimension list.

Example:

- `dimension=[sku]` and `dimension=[day]`

must not become `dimension=[sku,day]` unless a future rule proves that the resulting dataset can be projected back without semantic loss.

Likewise, do not merge incompatible filters, sort semantics or arbitrary date windows by heuristic aggregation.

Any advanced merge rule must have a mathematical equivalence proof plus regression tests.

### 7.4 Pagination/window coalescing

Potential safe optimization such as combining adjacent windows (`offset=0,limit=100` + `offset=100,limit=100` -> one `offset=0,limit=200`) may be added only after exact ordering/terminal semantics are proven and only within provider limits.

It is not required for the first planner release.

## 8. Superset prefetch and cache

Batch coalescing alone cannot solve a weak model that asks for one metric, waits for the result, then asks for another metric ten seconds later.

Therefore design a second optimization layer:

- a physical request may obtain a reviewed safe superset of data when doing so does not change semantics or require unavailable subscription capabilities;
- extra obtained fields may be stored in a provider-data cache with provenance;
- later logical requests may be satisfied from that cache with `external_request_executed:false`.

Initial conservative profile for non-Premium sales-by-SKU analytics may include the two universally available metrics `revenue` and `ordered_units` when the query shape is identical.

Do not blindly prefetch every Premium metric. Capability requirements, context/result size and response-contract risk must be considered.

Cache entries must be keyed by provider account identity/revision plus normalized query semantics, must carry acquisition time and provenance, and must be invalidated deliberately.

## 9. Provider quota registry and scheduler

### 9.1 Quotas are provider/account scoped

The `/v1/analytics/data` one-per-minute rule is not per tab and not per AI conversation.

If ChatGPT and Alice use the same Seller account, they share the provider quota.

Quota key must therefore be based on a non-secret internal account/credential identity plus provider/quota family, not on tab/conversation.

### 9.2 Configurable provider limits

Do not scatter literal `60000` constants through production code.

Create a reviewed quota registry with fields conceptually like:

- provider;
- operation/quota family;
- scope;
- `min_interval_ms`;
- safety margin;
- source/contract version;
- optional local operator override;
- effective value.

Current default for `analytics_data` is the official one-minute interval. It must be changeable in one reviewed configuration point if Ozon changes the rule.

AI text must never be able to modify the quota value.

### 9.3 Durable state

Quota state such as `last_request_at` / `next_allowed_at` must survive MV3 service-worker restart. Otherwise a worker restart could forget the previous call and immediately violate the provider window.

### 9.4 No hidden retry

The scheduler must not turn a provider 429 into an automatic retry loop.

There are two distinct cases:

1. before provider execution, the bridge itself knows the next legal slot — it may queue/wait for the planned request or return an explicit local rate-window result, according to the accepted UX;
2. after Ozon returns 429, expose the failure safely and do not retry automatically.

If the provider supplies `Retry-After` or other reviewed safe rate metadata, expose it and ensure the effective next-allowed time does not undercut the stricter known contract/provider instruction.

## 10. Physical execution plan versus logical results

The planner must explicitly store both layers.

Logical command record:

- original logical index;
- normalized operation;
- requested semantic fields;
- validation/capability decision;
- physical plan reference or cache reference;
- projection rule;
- final logical status.

Physical request record:

- provider/host/path/method alias;
- normalized physical params;
- contributing logical command indexes;
- quota bucket;
- execution status;
- request ID;
- response verification status.

One physical request may satisfy multiple logical commands.

The bridge must never lose provenance when it merges, widens or serves from cache.

## 11. Revised request-count invariant

The old rule “one accepted command = at most one external request” needs a precise scope after capability planning.

New intended invariant:

- one logical business command must never trigger hidden retry, hidden pagination, hidden fan-out or multiple business requests;
- multiple compatible logical commands may share one business provider request;
- one clicked logical batch may additionally perform **at most one reviewed internal seller-capability probe** when required;
- cache hits perform zero business provider requests;
- every external request, including the capability probe, is observable in safe diagnostics and attributable to the batch;
- completed business requests are never replayed during recovery.

Any future exception requires an explicit contract/lifecycle review rather than silently expanding transport behavior.

## 12. Safe error normalization

The current generic message “Ozon API request failed; inspect local diagnostics” is insufficient for autonomous/weak AI recovery.

Introduce a reviewed safe error normalizer that can expose useful provider reasons without leaking credentials, transport secrets, customer PII or arbitrary raw provider bodies.

Required categories include at least:

- `BRIDGE_VALIDATION_ERROR`;
- `UNSUPPORTED_VALUE`;
- `SUBSCRIPTION_REQUIRED`;
- `CAPABILITY_NOT_CONFIRMED`;
- `PROVIDER_RATE_WINDOW`;
- `PROVIDER_INVALID_ARGUMENT`;
- `PROVIDER_AUTH_OR_ACCESS` where safely distinguishable;
- `PROVIDER_RESPONSE_CONTRACT_MISMATCH`;
- generic sanitized provider failure fallback.

For 429 include safe rate metadata when available:

- retry-after seconds;
- next allowed time;
- source (`configured_contract`, `provider_header`, etc.);
- whether an external request was executed.

Do not expose raw provider error text until that operation/error family has an explicit sanitizer.

## 13. Response contract verification

The planner knows the physical request and therefore knows what response shape is expected.

For positional analytics metrics, if a physical request asks for N metrics and a returned row does not contain N metric values, do not silently map values by guesswork.

Return `PROVIDER_RESPONSE_CONTRACT_MISMATCH` or another reviewed partial-result classification only when the omission can be proven safely.

This gate specifically prevents a case where an invalid/unavailable requested metric disappears and remaining positional values are mislabelled.

## 14. `product_queries` and `product_queries_details` contract correction

Before further live experimentation, strengthen their validators from the official schema rather than relying on the permissive current candidate behavior.

At minimum review/encode:

- date-time format for `date_from`/`date_to` where documented;
- current interval/history rules;
- required fields;
- page/page_size bounds;
- SKU representation/count;
- `limit_by_sku` for details;
- `sort_by` and `sort_dir` enums;
- subscription-dependent history/metric behavior.

Do not infer that an omitted `date_to` is always invalid merely because examples include it; follow the actual required list and documented history semantics.

The purpose is to turn model mistakes into zero-request validation results rather than repeated provider 400 probes.

## 15. Final AI-facing batch report

The existing principle of one final batch delivery should remain.

The final report must be richer enough for a weak model to explain limitations correctly. It should be able to express:

- requested logical command count;
- physical business request count;
- capability probe executed yes/no;
- cache hits;
- merged/coalesced logical indexes;
- partial results;
- unavailable metrics and exact reason category;
- subscription requirement for omitted features;
- rate-window waits/failures;
- provider error safe reason;
- response-contract mismatch;
- `external_request_executed` semantics.

Do not make the user-facing AI infer subscription truncation from missing array elements.

## 16. Weak-model correction policy

The bridge may programmatically correct **execution shape** when equivalence is proven:

- merge compatible requests;
- widen metric sets within reviewed limits;
- serve equivalent data from cache;
- enforce provider quotas;
- omit features known to be unavailable under the current subscription while reporting them explicitly.

The bridge must not silently correct **business meaning** when equivalence is not proven:

- do not rewrite `orders_count` to `ordered_units`;
- do not change dimensions to force merge;
- do not change arbitrary periods/filters;
- do not substitute one endpoint's concept for another merely because names are similar.

Ambiguous corrections must be returned to the AI as actionable structured errors.

## 17. Suggested implementation phases

### Phase A — contract and registry hardening

- current official schema extraction for enabled operations;
- metric/dimension/sort/date validation;
- entitlement registry;
- quota registry;
- reviewed safe error taxonomy.

Exit: invalid known commands fail before provider request.

### Phase B — batch capability resolver

- internal `/v1/seller/info` support;
- at most one relevant-batch probe;
- strict field minimization/privacy;
- entitlement decisions and explicit partial results.

Exit: Premium-sensitive batch is planned with known seller capabilities and no unnecessary per-command probes.

### Phase C — analytics coalescer

- normalized merge signature;
- metric union <= provider maximum;
- deterministic metric-order map;
- logical-to-physical provenance;
- result projection.

Exit: compatible 2/5/10 analytics logical commands can be proved to use one physical analytics request.

### Phase D — durable quota scheduler

- account-scoped quota buckets;
- configurable one-minute analytics interval;
- persistence across worker restart;
- provider Retry-After integration;
- no hidden retry.

Exit: parallel conversations cannot violate the shared analytics quota.

### Phase E — response verifier and safe provider diagnostics

- expected metric-count/shape verification;
- structured safe provider errors;
- explicit 429 metadata;
- entitlement/partial metadata in final report.

Exit: Alice/ChatGPT can explain why data are missing without local console inspection for the common reviewed error families.

### Phase F — conservative cache/prefetch

- exact query provenance cache;
- safe reviewed superset acquisition;
- cross-turn cache hits;
- invalidation/age policy.

Exit: a weak model requesting `revenue` and then `ordered_units` for the same query shape need not consume a second analytics call when the first acquisition safely included both.

## 18. Acceptance matrix

Implementation is not accepted until tests prove at least:

1. 30-command logical block performs at most one seller-info capability probe.
2. Batch with no entitlement-dependent requirement performs zero unnecessary capability probes.
3. Same-shape `revenue` + `ordered_units` logical commands merge to one `/v1/analytics/data` call.
4. More than 14 unique metrics split/fail according to reviewed planner policy without sending an invalid provider request.
5. Different dimensions do not merge in the initial safe implementation.
6. Unsupported metric fails before provider execution with an actionable safe reason.
7. Non-entitled metric is omitted/rejected with explicit subscription metadata; if no entitled metric remains, analytics fetch count is zero.
8. `ENTITLEMENT_UNKNOWN` is not misreported as “no subscription”.
9. One-minute analytics quota is shared across tabs/conversations for the same Seller account.
10. Worker restart does not erase the next-allowed analytics time.
11. Different Seller accounts do not incorrectly share one quota bucket.
12. Provider 429 is not automatically retried.
13. `Retry-After` is surfaced safely when available.
14. Metric count/response mismatch is rejected rather than positionally guessed.
15. Merged physical result projects back to correct logical command indexes/order.
16. Cache hit performs zero provider request and identifies its provenance.
17. Internal seller-info probe never leaks company/INN/OGRN/raw ratings to the AI report.
18. Existing fixed-host/auth/PII/mutation protections remain green.
19. Existing conversation binding and delivery regressions remain green and are not rewritten for this planner feature.
20. Recovery never replays an already completed physical business request.

## 19. Objective criticism / known trade-offs

### Complexity increase

This is materially more complex than a serial HTTP queue. The new state space includes logical commands, physical requests, capability state, quota state, cache state and projection provenance.

That complexity is justified only because the provider has expensive method-specific quotas and the product explicitly targets weak models that cannot reliably optimize requests themselves.

### Coalescing risk

A wrong merge can produce a successful-looking but semantically incorrect report. Therefore the first implementation should be deliberately conservative: merge only exact-equivalent query shapes with proven safe widening.

### Cache risk

Stale cached analytics can mislead the AI. Cache provenance/time must be explicit internally; do not introduce a cache until invalidation/freshness semantics are reviewed.

### Capability-probe overhead

A seller-info probe is still a real Seller API request and counts toward the general Seller API traffic budget, even though it is not the `/analytics/data` one-per-minute request. One probe per relevant logical batch is acceptable; one probe per command is not.

### Provider changes

Quota and entitlement rules can change. They must live in reviewed registries with a single configurable source of truth, not in AI prompts or scattered constants.

### Physical impossibility remains

If ten required analytics queries are genuinely incompatible and cannot be projected from a common provider dataset, the bridge cannot truthfully compress them into one provider call. The planner should minimize calls, then obey the provider quota rather than fabricate equivalence.

## 20. Next implementation gate

Before writing production code:

1. re-read the current operator candidate source used as implementation baseline;
2. inventory exact modules/functions between parser and provider transport;
3. pin the current official schemas for `/v1/analytics/data`, `/v1/seller/info`, `/v1/analytics/product-queries`, `/v1/analytics/product-queries/details`;
4. define the exact logical-plan and physical-plan data structures;
5. define the entitlement registry and quota registry schemas;
6. define the first merge-safe equivalence rules;
7. define the safe error schema/result compatibility policy;
8. write tests for the acceptance matrix before changing the protected delivery/AI adapter code;
9. implement in the provider/core planning layer only;
10. prove protected DOM/delivery/provider-security dependencies unchanged or regression-tested.

Only after those gates should a new extension candidate be assembled.

## DEFECT_015_PLANNER_DATE_POLICY_V1

Planner output must preserve the caller's exact valid date representation and fail closed on provider-invalid ranges before transport. It must not silently rewrite timestamps into dates, manufacture provider-derived selectors, or revive hidden retired operations. Current-relative requests require explicit current input or a separately proven dependency-resolution step.
