# CAP-24 — Run 07: finance_accrual_types 429 immediately after finance_accrual_by_day 200 (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `finance_accrual_types`
- Request ID: `2f01d55b-6ff3-4449-b1f8-b8da9c44ed9d`
- Logical command fingerprint: `405f0634`
- Physical command fingerprint: `405f0634`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `429`
- Elapsed: `1373 ms`
- Retry-After: `1`
- Automatic retry: `false`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`

## Test purpose

This was the requested same-window cross-method control immediately following a successful `finance_accrual_by_day` request in the same new finance-accrual family. Its purpose was to distinguish a shared finance-accrual throttle from a method-specific `/v1/finance/accrual/types` provider state.

## Result

The preceding `POST /v1/finance/accrual/by-day` request returned HTTP 200. The next explicit Ozon command, `POST /v1/finance/accrual/types`, reached Ozon and returned provider HTTP 429 with `Retry-After: 1`.

Combined with prior CAP-24 evidence:

1. `finance_accrual_types` has returned HTTP 200 at least once for the same account and exact command fingerprint;
2. repeated `finance_accrual_types` calls have returned provider HTTP 429;
3. a quiet-baseline `finance_accrual_types` run also returned 429;
4. non-finance `seller_product_list` returned HTTP 200 while `/types` was in the failing state;
5. neighboring `finance_accrual_by_day` returned HTTP 200 in the same finance-accrual family;
6. immediately after that successful `/by-day`, `/types` again returned HTTP 429.

Therefore the failure scope is now materially localized to `/v1/finance/accrual/types` or to a provider quota/state that is specific to that method. The evidence no longer supports a provider-wide hard block or a hard throttle shared by the entire finance-accrual family as the primary explanation.

## Root-cause class now established

`METHOD_SPECIFIC_PROVIDER_THROTTLE_OR_STATE__FINANCE_ACCRUAL_TYPES`

This classification is a causal scope result: the provider-side 429 is specific to the `/types` method surface under the observed account/state. It does **not** yet establish the exact quota algorithm or reset window.

## What remains unknown

The following are still not proven:

- exact allowed request count per interval for `/types`;
- exact reset interval;
- whether the mechanism is a documented quota or a transient/beta provider defect;
- whether `Retry-After: 1` describes the complete reset state;
- whether other concurrent clients using the same credentials can influence the method-specific state.

## Authority check

Current preserved project authority did not contain a method-specific rate limit for `/v1/finance/accrual/types`. A fresh web search on 2026-09-06 likewise did not surface an official Ozon source publishing a numeric limit specifically for this method. Ozon's notification channel documents the migration to `/v1/finance/accrual/{postings,types,by-day}` but does not state a numeric `/types` quota in the surfaced material.

Therefore no static `1s`, `60s`, or other locally invented interval is justified by current evidence.

## Bridge-side secondary defect remains separate

Bridge v0.1.19 still does not maintain a finance-specific local quota state for `finance_accrual_types`, so after provider 429 it does not convert the observed `Retry-After` into a locally enforced `next_allowed_at` for this operation. That remains a separate orchestration/control gap. It explains avoidable repeated provider exposure after a 429, but it is not the cause of the first provider 429.

## CAP-24 impact

The `/types` failure does not block finance evidence acquisition itself because `/by-day` is operational and returns SKU-attributable finance details. The type dictionary was also successfully obtained once earlier and can be used as preserved evidence for type-id interpretation, subject to freshness discipline.

No executable Bridge patch is authorized by this evidence file.
