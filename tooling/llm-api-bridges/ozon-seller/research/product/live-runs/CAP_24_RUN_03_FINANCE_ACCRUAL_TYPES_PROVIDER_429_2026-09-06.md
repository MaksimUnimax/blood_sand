# CAP-24 — Run 03: finance_accrual_types provider 429 (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `finance_accrual_types`
- Request ID: `afff2a40-88cd-4a05-98fa-500f15b305bd`
- Logical command fingerprint: `405f0634`
- Physical command fingerprint: `405f0634`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `429`
- Elapsed: `1372 ms`
- Retry-After: `1`
- Automatic retry: `false`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`

## Result

A single explicit `finance_accrual_types` command reached Ozon and received a real provider HTTP 429. The Bridge exposed `Retry-After: 1` and did not retry automatically.

This run follows an earlier recorded `finance_accrual_types` request with the exact same command fingerprint (`405f0634`) that succeeded with HTTP 200 after a quiet period.

Therefore the evidence now establishes:

1. `/v1/finance/accrual/types` is not persistently blocked for this account; it can return HTTP 200.
2. The same endpoint can later return provider HTTP 429 with the same logical/physical command fingerprint.
3. A preceding `finance_accrual_postings` call is no longer required as the only candidate explanation for the 429 class, because this 429 was reproduced on a one-request batch containing only `finance_accrual_types`.
4. The failure remains provider-side and state-dependent rather than an entitlement failure, command transformation, hidden retry or local Bridge rejection.

## Important uncertainty

The exact wall-clock interval between the preceding successful `/types` call and this 429 is not encoded in the supplied result. The batch proves there was only one physical request in this execution, but it does not prove there were no other Ozon requests from the same Client ID outside this batch between the two recorded runs.

Therefore this evidence does NOT yet prove:

- a specific endpoint-level minimum interval;
- that repeated `/types` alone deterministically causes the 429;
- that `/types` and `/postings` share one provider quota bucket;
- that the provider rule is exactly one request per second;
- that `Retry-After: 1` is a universal static rule rather than response-specific guidance;
- that no concurrent activity under the same Client ID contributed.

## Updated root-cause state

`PERSISTENT_BLOCK_REJECTED__SAME_ENDPOINT_PROVIDER_429_REPRODUCED__EXACT_QUOTA_RULE_NOT_YET_PROVEN`

The prior narrow hypothesis `preceding finance_accrual_postings is required to trigger finance_accrual_types 429` is no longer sufficient.

## Next causal experiment

Prioritize a controlled same-endpoint timing test before `/postings -> /types` cross-endpoint testing.

After a clean quiet period:

1. Send one explicit `finance_accrual_types` request and require HTTP 200 baseline.
2. Record its exact completion timestamp.
3. Send the same explicit `finance_accrual_types` request again after a deliberately measured interval.
4. Record exact start/completion timestamps, HTTP status and `Retry-After`.

Use a minimal bounded sequence; do not hammer the provider and do not enable hidden retry.

Interpretation:

- baseline 200 -> repeat 429: proves same-endpoint self-throttle can reproduce the failure without `/postings`.
- baseline 200 -> repeat 200: same-endpoint repetition at that measured interval is allowed; continue with a shorter or cross-endpoint controlled interval only if needed.
- baseline itself 429 after a genuine quiet period: investigate broader Client-ID/provider state before any endpoint-family inference.

Only after the same-endpoint timing behavior is established should the controlled `/postings -> /types` pair be used to test whether `/postings` participates in the same provider quota state.

No executable Bridge patch is authorized by this run.
