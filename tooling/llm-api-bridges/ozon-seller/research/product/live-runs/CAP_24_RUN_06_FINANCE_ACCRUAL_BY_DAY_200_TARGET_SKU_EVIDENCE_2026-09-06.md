# CAP-24 — Run 06: finance_accrual_by_day HTTP 200 + target-SKU attribution evidence (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `finance_accrual_by_day`
- Request ID: `2a87e47f-78bf-4de7-999f-d0a22c34a4d2`
- Logical command fingerprint: `5940f840`
- Physical command fingerprint: `5940f840`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1488 ms`
- Rate-limit metadata: `null`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`
- Requested date: `2026-08-25`
- Response `last_id`: empty string

## Rate-limit diagnostic significance

This run is a different endpoint in the same new finance-accrual family as the repeatedly throttled `POST /v1/finance/accrual/types` method.

`POST /v1/finance/accrual/by-day` succeeded with HTTP 200 while recent `finance_accrual_types` runs returned provider HTTP 429.

Therefore the evidence now materially weakens a shared hard throttle covering the entire `/v1/finance/accrual/*` family. Combined with the successful non-finance control (`POST /v3/product/list` HTTP 200), the observed 429 behavior is increasingly localized to `/v1/finance/accrual/types` or to a method-specific provider quota/state rather than a universal Seller API or finance-accrual-family block.

This does NOT yet prove the exact `/types` quota rule, minimum interval, reset model, or absence of transient provider-side conditions. No static interval may be invented from this run.

Updated diagnostic state:

`BY_DAY_200__FINANCE_FAMILY_HARD_BLOCK_WEAKENED__TYPES_SPECIFIC_OR_METHOD_QUOTA_STATE_PRIMARY`

## CAP-24 commercial evidence

The response also proves that `finance_accrual_by_day` exposes SKU-attributable finance data suitable for the CAP-24 unit-economics job.

Canonical CAP-24 target SKU from Run 01:
- Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

On `2026-08-25`, the supplied response contains multiple records for target SKU `1636048691`, including:

### Posting-attributable commission + delivery

1. unit `44683371-0293-4`
   - accrual_id `60867011731`
   - accrued_category `POSTING`
   - total_amount `897.34 RUB`
   - delivery total `-88.66 RUB`
   - delivery type_id `32`: `-78 RUB`
   - delivery type_id `29`: `-10.66 RUB`
   - sale commission `-714 RUB`
   - commission ratio `0.42`
   - sale amount `1700 RUB`

2. unit `0157219793-0269-1`
   - accrual_id `60873224071`
   - accrued_category `POSTING`
   - total_amount `899.88 RUB`
   - delivery total `-86.12 RUB`
   - delivery type_id `32`: `-70 RUB`
   - delivery type_id `29`: `-16.12 RUB`
   - sale commission `-714 RUB`
   - commission ratio `0.42`
   - sale amount `1700 RUB`

3. unit `49547269-0080-5`
   - accrual_id `60882525997`
   - accrued_category `POSTING`
   - total_amount `906.44 RUB`
   - delivery total `-79.56 RUB`
   - delivery type_id `32`: `-70 RUB`
   - delivery type_id `29`: `-9.56 RUB`
   - sale commission `-714 RUB`
   - commission ratio `0.42`
   - sale amount `1700 RUB`

### Item-attributable acquiring / item fees

The same day includes `ITEM` accruals for target SKU `1636048691` with `type_id = 1`, which the already captured `/types` dictionary identifies as `Acquiring` / `Эквайринг`:

- accrual_id `60846592750`: `-16.07 RUB`
- accrual_id `60858555749`: `-15.69 RUB`
- accrual_id `60885263948`: `-15.09 RUB`
- accrual_id `60890849661`: target-SKU component `-18.68 RUB` within a multi-SKU item-fee accrual

This proves that the new finance-accrual surface can expose commission, delivery/logistics service components and acquiring at a defensible SKU level without allocating unrelated account-level costs to the target SKU.

## Important accounting discipline

The one-day data must not yet be extrapolated to the full month. CAP-24 period remains `2026-08-01` through `2026-08-31`. Every day/page needed for complete August coverage must be acquired explicitly, and account-level `NON_ITEM` charges must remain unallocated unless a defensible SKU attribution key exists.

The response also contains `NON_ITEM` charges (for example type_ids `41`, `46`, `54`), which are not to be distributed to target SKU by revenue share or any invented allocation.

## Next diagnostic experiment

Use the next explicit command as `finance_accrual_types` with no unrelated Ozon request in between. The immediate preceding observed finance-accrual control is now a successful `/by-day` request.

Interpretation:
- `/by-day` 200 -> `/types` 429: strong same-window evidence for method-specific `/types` throttling/state rather than a shared finance-accrual hard block;
- `/by-day` 200 -> `/types` 200: `/types` throttle is transient/non-deterministic and is not a continuously active endpoint block; exact provider rule remains unknown.

No executable Bridge patch is authorized by this evidence file.
