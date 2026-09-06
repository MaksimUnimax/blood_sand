# CAP-24 — Run 02: isolated finance_accrual_types success (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `finance_accrual_types`
- Request ID: `6ceb04e1-5721-4d61-9f54-021c3c9f062d`
- Logical command fingerprint: `405f0634`
- Physical command fingerprint: `405f0634`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1332 ms`
- Rate-limit metadata: `null`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Command transformed: `false`

## Test purpose

This run was intentionally executed as an isolated `finance_accrual_types` request after a quiet period, without an immediately preceding finance request. Its purpose was to distinguish persistent/account-level endpoint unavailability from a transient or sequence-dependent provider rate-limit state observed earlier in CAP-24.

## Result

The request succeeded with provider HTTP 200 and returned the current accrual-type dictionary (IDs 1..124 in this response).

Therefore the following is now proven:

1. `POST /v1/finance/accrual/types` is currently callable for this seller/account through Bridge.
2. The earlier HTTP 429 on the same operation was not a persistent entitlement failure or permanent endpoint-level block.
3. The earlier 429 was state-dependent: transient, timing-dependent, sequence-dependent, shared-quota-related, or otherwise provider-side conditional.
4. The Bridge-side finance Retry-After/local-quota orchestration gap remains a separate secondary control defect, but it does not explain why the first provider 429 occurred.

## What this run does NOT prove

This isolated success does **not** prove that `finance_accrual_postings` caused the earlier `finance_accrual_types` 429.

It also does not prove:

- that `/postings` and `/types` share one Ozon quota bucket;
- any fixed finance request interval;
- that `Retry-After: 1` is a universal finance rule;
- that request payload size or the 138-posting response specifically caused the throttle;
- that no other concurrent request using the same Client ID contributed to the previous 429.

## Root-cause state after Run 02

`PERSISTENT_ENDPOINT_OR_ENTITLEMENT_BLOCK_REJECTED__SEQUENCE_OR_TRANSIENT_PROVIDER_STATE_REMAINS`

The provider-side first-429 root cause is still not established.

## Next causal experiment

After another clean quiet period, run a controlled pair:

1. one `finance_accrual_postings` request;
2. then, as the next explicit Bridge command, one `finance_accrual_types` request with no unrelated Ozon request in between.

Record exact timestamps, request IDs, HTTP statuses, elapsed times, and any `Retry-After` metadata for both calls.

Interpretation:

- `/postings` 200 -> immediate `/types` 429`: strong evidence that the preceding finance request creates or participates in the provider throttle state; repeat once after a fresh quiet period before declaring a shared-quota relationship.
- `/postings` 200 -> immediate `/types` 200`: the earlier 429 is not deterministically reproduced by this pair; investigate other transient/concurrent/provider conditions rather than inventing a shared finance bucket.
- `/postings` itself 429`: the throttle is broader than a simple `/postings` -> `/types` sequence and needs separate provider-state investigation.

No executable Bridge patch is authorized by this run.
