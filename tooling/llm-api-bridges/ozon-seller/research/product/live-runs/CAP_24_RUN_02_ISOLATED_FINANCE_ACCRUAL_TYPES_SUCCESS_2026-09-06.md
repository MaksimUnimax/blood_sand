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

Therefore the following is proven:

1. `POST /v1/finance/accrual/types` is callable for this seller/account through Bridge.
2. The earlier HTTP 429 on the same operation was not a persistent entitlement failure or permanent endpoint-level block.
3. The earlier 429 was provider-side and state-dependent.
4. This run does **not** prove any Bridge rate-limit-control defect. The earlier wording that treated missing finance-local `next_allowed_at` as a secondary defect is withdrawn and superseded by the final CAP-24 root-cause record.

## What this run does NOT prove

This isolated success does **not** prove that `finance_accrual_postings` caused the earlier `finance_accrual_types` 429.

It also does not prove:

- that `/postings` and `/types` share one Ozon quota bucket;
- any fixed finance request interval;
- that `Retry-After: 1` is a universal finance rule;
- that request payload size or the 138-posting response specifically caused the throttle;
- that no other concurrent request using the same Client ID contributed to the previous 429.

## Root-cause state after Run 02

At the time of Run 02:

`PERSISTENT_ENDPOINT_OR_ENTITLEMENT_BLOCK_REJECTED__PROVIDER_STATE_REMAINS`

Later Runs 03–07 and external authority checks supersede the provisional Run-02 hypotheses. Current authority:

`CAP_24_FINANCE_ACCRUAL_TYPES_ROOT_CAUSE_AND_OPERATING_SOLUTION_2026-09-06.md`

Final class recorded there:

`METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_METHOD_QUOTA__FINANCE_ACCRUAL_TYPES`

## Historical next-test note

The original Run-02 record proposed a `/postings -> /types` causal pair. Later evidence made that unnecessary as the primary discriminator: `/types` reproduced 429 without `/postings`, non-finance `/product/list` stayed 200, and neighboring `/finance/accrual/by-day` stayed 200 immediately before another `/types` 429.

No executable Bridge patch is authorized by this evidence file.
