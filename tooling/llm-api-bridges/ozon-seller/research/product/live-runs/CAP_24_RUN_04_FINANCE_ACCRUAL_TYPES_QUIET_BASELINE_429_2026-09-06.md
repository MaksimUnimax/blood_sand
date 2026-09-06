# CAP-24 — Run 04: finance_accrual_types quiet-baseline 429 (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `finance_accrual_types`
- Request ID: `689f9bfb-0666-4a2e-a0f0-2f8fb275e011`
- Logical command fingerprint: `405f0634`
- Physical command fingerprint: `405f0634`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `429`
- Elapsed: `1266 ms`
- Retry-After: `1`
- Automatic retry: `false`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`

## Test context

This result was supplied as the follow-up to the requested clean-quiet baseline test for `finance_accrual_types`. The result payload itself does not encode the wall-clock duration of the preceding quiet interval, so the evidence file does not manufacture an exact wait time. If the operator executed the instructed two-minute no-Ozon quiet window, this run is the first `/types` request after that window.

## Result

The single explicit `/v1/finance/accrual/types` request reached Ozon and received a real provider HTTP 429 with `Retry-After: 1`. The Bridge did not retry and did not transform the command.

Combined with Run 02, where the exact same command fingerprint returned HTTP 200, and Run 03, where it returned HTTP 429, the current evidence establishes a state-dependent provider throttle rather than a permanent endpoint block or entitlement failure.

If the requested long quiet window was observed, the simple hypothesis `short same-endpoint cooldown alone explains the 429` is materially weakened: a fresh single request can still be rejected after a much longer interval than the response's one-second Retry-After hint.

## What is NOT yet proven

This run does not prove:

- a universal `/types` minimum interval;
- a one-second or sixty-second quota rule;
- that `/postings` and `/types` share a finance bucket;
- that the throttle is global across all Seller API methods;
- that the throttle is isolated to `/types`;
- that no other process/request under the same Client ID contributed outside the observed Bridge batch;
- that `Retry-After: 1` describes the complete provider quota-reset state.

## Authority check

Preserved Ozon-owned rate-limit evidence says the last general evidence was 50 requests per second across all methods per Client ID, while method-specific limits may differ. The preserved finance-accrual authority explicitly lists method-specific rate limits as still missing. Therefore no static finance interval may be invented from current evidence.

## Updated root-cause state

`QUIET_BASELINE_TYPES_429__SHORT_ENDPOINT_COOLDOWN_INSUFFICIENT__CLIENT_ID_OR_FINANCE_OR_ENDPOINT_STATE_UNRESOLVED`

## Next causal experiment

Do not hammer `/types` again. Use one explicit control request on a different Seller API surface with no Bridge local quota family, then compare provider behavior.

Recommended control:

```text
OZON_API_V1
{
  "operation": "seller_product_list",
  "params": {
    "filter": {},
    "limit": 1
  }
}
```

Interpretation:

- control HTTP 200 while `/types` remains 429: rejects a provider-wide hard block across all Seller API methods at that moment and shifts evidence toward endpoint/finance-family-specific state;
- control HTTP 429: broader Client-ID/provider-wide throttle becomes materially more plausible, although the control method's own quota still must be considered;
- local Bridge rejection/no external request: invalid control; choose another execution-enabled read-only Seller API operation.

No executable Bridge patch is authorized by this run.
