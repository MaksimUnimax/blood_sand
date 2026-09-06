# CAP-24 — Run 09: finance_accrual_by_day — 2026-08-02 target-SKU evidence

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `ozon-llm-api-bridge v0.1.19`
- Operation: `finance_accrual_by_day`
- Requested date: `2026-08-02`
- Request ID: `f0eca32b-6bba-4c7d-a32a-dcddb476d6b7`
- Logical/physical fingerprint: `6e38ffcb`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1463 ms`
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

## Target-SKU POSTING accruals observed on 2026-08-02

Two POSTING records in the response contain target SKU `1636048691`.

| accrual_id | unit_number | schema | sale_amount | sale_commission | delivery total | type 32 | type 29 | posting total_amount |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| `58521466152` | `94756808-0185-1` | Fbo | 1700.00 | -714.00 | -292.55 | -278.00 | -14.55 | 693.45 |
| `58523265835` | `67524685-0090-1` | Fbo | 1700.00 | -714.00 | -76.29 | -70.00 | -6.29 | 909.71 |

Observed POSTING subtotals for the target SKU on this accrual date:

- posting sale_amount evidence: `3400.00 RUB`
- sale commission: `-1428.00 RUB`
- delivery/logistics total: `-368.84 RUB`
  - type_id `32`: `-348.00 RUB`
  - type_id `29`: `-20.84 RUB`
- summed POSTING total_amount: `1603.16 RUB`

Arithmetic cross-check:

`3400.00 - 1428.00 - 368.84 = 1603.16 RUB`

This cross-check is internally consistent for the two target-SKU POSTING rows. It must not be added to Seller Analytics revenue as additional revenue; Seller Analytics remains the frozen monthly gross-sales source for CAP-24.

Important observation: unit `94756808-0185-1` carries unusually high delivery/logistics evidence (`-292.55 RUB`, of which type 32 is `-278 RUB`). This is preserved exactly as provider evidence and must not be normalized or treated as an error without independent evidence.

## Target-SKU ITEM accruals observed on 2026-08-02

Two ITEM records contain target SKU `1636048691`, both with `type_id = 1`, identified by the already captured provider `/types` dictionary as Acquiring / Эквайринг:

- accrual_id `58524548352`, unit `67524685-0090-1`: `-13.63 RUB`
- accrual_id `58580641001`, unit `77223381-0603`: `-6.14 RUB`

Observed target-SKU acquiring subtotal on this accrual date:

`-19.77 RUB`

The acquiring row on unit `77223381-0603` does not have a matching target-SKU POSTING in this same day's response. It remains attributable to the target SKU because the ITEM row itself explicitly names SKU `1636048691`; CAP-24 does not require same-day posting co-occurrence for SKU-level item-fee attribution.

Conversely, absence of a same-day target acquiring row for unit `94756808-0185-1` is not evidence that acquiring cost is zero. Full-August collection must retain all target-SKU ITEM effects on the dates Ozon books them.

## Provisional direct-cost subtotal observed on this accrual date

For evidence actually attributable to target SKU in this response:

- sale commission: `1428.00 RUB` cost
- delivery/logistics: `368.84 RUB` cost
- acquiring: `19.77 RUB` cost
- provisional observed attributable Ozon costs: `1816.61 RUB`

This is a date-local evidence subtotal only, not the monthly CAP-24 result.

## Cumulative collected subtotal for completed 2026-08-01 and 2026-08-02 only

Combining Run 08 and Run 09, without extrapolation and without including the separately preserved 2026-08-25 Run 06 yet:

- target POSTING count: `6`
- posting sale_amount evidence: `10200.00 RUB`
- sale commission: `4284.00 RUB` cost
- delivery/logistics: `698.04 RUB` cost
- acquiring observed on those two accrual dates: `51.53 RUB` cost
- provisional attributable Ozon costs observed on 2026-08-01..02: `5033.57 RUB`

These are collection-progress subtotals only. They are not a two-day profitability result and must not be divided by monthly ordered units.

## Unallocated / NON_ITEM discipline

The same response includes NON_ITEM charges including type_ids `46`, `72`, `41`, and `54`. They are not assigned to SKU `1636048691` because this response does not provide a defensible SKU attribution key for those records.

They remain outside the exact target-SKU attributable subtotal under `NO_UNSUPPORTED_COST_ALLOCATION`.

## Coverage / pagination

`last_id = ""`.

Therefore 2026-08-02 is complete for this `/by-day` read and no continuation request is required for this date.

## CAP-24 progression

Completed finance-accrual dates currently preserved for full-August collection:

- `2026-08-01` — Run 08, complete
- `2026-08-02` — Run 09, complete
- `2026-08-25` — Run 06, complete

Next required finance date:

`2026-08-03`

No `/types` refresh is required. The successful provider-derived 124-row dictionary from Run 02 remains the decoding authority for known type IDs.
