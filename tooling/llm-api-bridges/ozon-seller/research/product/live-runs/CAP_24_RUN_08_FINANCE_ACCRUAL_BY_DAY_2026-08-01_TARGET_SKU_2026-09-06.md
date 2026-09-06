# CAP-24 — Run 08: finance_accrual_by_day — 2026-08-01 target-SKU evidence

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `ozon-llm-api-bridge v0.1.19`
- Operation: `finance_accrual_by_day`
- Requested date: `2026-08-01`
- Request ID: `7a4e9451-fe79-43c5-8a63-d7792a12485a`
- Logical/physical fingerprint: `068c4ebe`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1409 ms`
- Rate-limit metadata: `null`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`
- Response `last_id`: empty string
- Day coverage status: `COMPLETE_SINGLE_PAGE`

## CAP-24 target identity

Canonical target from Run 01:

- Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

## Target-SKU POSTING accruals observed on 2026-08-01

Four POSTING records in the response contain target SKU `1636048691`.

| accrual_id | unit_number | schema | sale_amount | sale_commission | delivery total | type 32 | type 29 | posting total_amount |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| `58452201519` | `0134461450-0090-3` | Fbo | 1700.00 | -714.00 | -77.52 | -70.00 | -7.52 | 908.48 |
| `58454555500` | `50154313-0308-1` | Fbo | 1700.00 | -714.00 | -78.54 | -70.00 | -8.54 | 907.46 |
| `58471932407` | `37498918-1147-1` | Fbo | 1700.00 | -714.00 | -86.67 | -77.00 | -9.67 | 899.33 |
| `58477698603` | `0149037831-0110-1` | Fbo | 1700.00 | -714.00 | -86.47 | -79.00 | -7.47 | 899.53 |

Observed POSTING subtotals for the target SKU on this accrual date:

- posting sale_amount evidence: `6800.00 RUB`
- sale commission: `-2856.00 RUB`
- delivery/logistics total: `-329.20 RUB`
  - type_id `32`: `-296.00 RUB`
  - type_id `29`: `-33.20 RUB`
- summed POSTING total_amount: `3614.80 RUB`

Arithmetic cross-check:

`6800.00 - 2856.00 - 329.20 = 3614.80 RUB`

This cross-check is internally consistent for the four target-SKU POSTING rows. It must not be added to Seller Analytics revenue as additional revenue; Seller Analytics remains the frozen monthly gross-sales source for CAP-24.

## Target-SKU ITEM accruals observed on 2026-08-01

Two ITEM records contain target SKU `1636048691`, both with `type_id = 1`, identified by the already captured provider `/types` dictionary as Acquiring / Эквайринг:

- accrual_id `58456500400`, unit `50154313-0308-1`: `-15.67 RUB`
- accrual_id `58473941165`, unit `37498918-1147-1`: `-16.09 RUB`

Observed target-SKU acquiring subtotal on this accrual date:

`-31.76 RUB`

Important: the absence of a same-day target ITEM/acquiring row for the other two target POSTING units is **not** evidence that their acquiring cost is zero. CAP-24 is aggregating all August accrual dates, so any later/earlier SKU-attributable ITEM effects must be captured where Ozon books them.

## Provisional direct-cost subtotal observed on this accrual date

For evidence actually attributable to target SKU in this response:

- sale commission: `2856.00 RUB` cost
- delivery/logistics: `329.20 RUB` cost
- acquiring: `31.76 RUB` cost
- provisional observed attributable Ozon costs: `3216.96 RUB`

This is a date-local evidence subtotal only, not the monthly CAP-24 result.

## Unallocated / NON_ITEM discipline

The same response includes account-/non-item-level charges, including type_ids `76`, `46`, `41`, and `54`. They are not assigned to SKU `1636048691` because this response does not provide a defensible SKU attribution key for those NON_ITEM records.

They remain outside the exact target-SKU attributable subtotal under `NO_UNSUPPORTED_COST_ALLOCATION`.

## Coverage / pagination

`last_id = ""`.

Therefore 2026-08-01 is complete for this `/by-day` read and no continuation request is required for this date.

## CAP-24 progression

Completed finance-accrual dates currently preserved for full-August collection:

- `2026-08-01` — Run 08, complete
- `2026-08-25` — Run 06, complete

Next required finance date:

`2026-08-02`

No `/types` refresh is required. The successful provider-derived 124-row dictionary from Run 02 remains the decoding authority for known type IDs.
