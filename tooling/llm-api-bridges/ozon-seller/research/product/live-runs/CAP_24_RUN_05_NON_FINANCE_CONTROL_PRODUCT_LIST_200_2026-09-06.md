# CAP-24 — Run 05: non-finance control seller_product_list HTTP 200 (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `seller_product_list`
- Request ID: `b43da9ca-373e-4797-8748-a363af720268`
- Logical command fingerprint: `9d82cd2e`
- Physical command fingerprint: `9d82cd2e`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1355 ms`
- Rate-limit metadata: `null`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`

## Test purpose

This was the requested cross-surface control after `finance_accrual_types` returned a provider HTTP 429 even on a quiet-baseline run. The purpose was to distinguish a broad Seller API / Client-ID hard throttle from a finance-family or endpoint-specific provider state.

## Result

The single explicit `POST /v3/product/list` request reached Ozon and returned HTTP 200 with one product row and `total = 76`.

Therefore the current evidence establishes:

1. the Client ID was not under a hard provider-wide block affecting all Seller API methods at this moment;
2. the Bridge transport, credentials and general Seller API connectivity were healthy enough for a non-finance request to succeed;
3. the repeated `finance_accrual_types` 429 class is now materially more localized to the finance-accrual surface or `/types` itself rather than a universal Seller API throttle;
4. this does not yet distinguish an endpoint-specific `/types` throttle from a shared finance-accrual quota/state.

## What is NOT yet proven

This run does not prove:

- that every non-finance Seller API method would succeed;
- that no broader Client-ID quota exists at all;
- that `/types` alone owns the quota;
- that all finance-accrual methods share one quota bucket;
- any fixed retry interval or method-specific rate limit.

## Updated root-cause state

`PROVIDER_WIDE_HARD_BLOCK_REJECTED__FINANCE_FAMILY_OR_TYPES_SPECIFIC_STATE_REMAINS`

## Next causal experiment

Use one different finance-accrual operation as the next explicit request, with a minimal supported payload and no `/types` request in the same batch. The goal is to distinguish:

- different finance method HTTP 200 -> evidence shifts toward `/types`-specific provider state;
- different finance method HTTP 429 -> evidence shifts toward a shared finance-accrual/provider quota state.

Do not patch Bridge and do not invent a static finance interval until the provider-side scope is established.
