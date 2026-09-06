# CAP-24 — Run 10: finance_accrual_by_day — 2026-08-03 target-SKU evidence

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `ozon-llm-api-bridge v0.1.19`
- Operation: `finance_accrual_by_day`
- Requested date: `2026-08-03`
- Request ID: `cdb2602e-f315-45f1-a1a0-9e1c52f3df4e`
- Logical/physical fingerprint: `0c26aabc`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `200`
- Elapsed: `1402 ms`
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

## Target-SKU POSTING accruals observed on 2026-08-03

Three POSTING records in the response contain target SKU `1636048691`.

| accrual_id | unit_number | schema | sale_amount | sale_commission | delivery total | delivery services | posting total_amount |
|---:|---|---|---:|---:|---:|---|---:|
| `58616380676` | `0238835546-0001-6` | Fbo | 1700.00 | -714.00 | -95.00 | type 32 `-70.00`; type 98 `-25.00` | 891.00 |
| `58638724765` | `0105372211-0617-1` | Fbo | 1700.00 | -714.00 | -75.03 | type 32 `-67.00`; type 29 `-8.03` | 910.97 |
| `58655912915` | `0121890718-0265-1` | Fbo | 1700.00 | -714.00 | -76.51 | type 32 `-67.00`; type 29 `-9.51` | 909.49 |

Observed POSTING subtotals for the target SKU on this accrual date:

- posting sale_amount evidence: `5100.00 RUB`
- sale commission: `-2142.00 RUB`
- delivery/logistics total: `-246.54 RUB`
- summed POSTING total_amount: `2711.46 RUB`

Arithmetic cross-check:

`5100.00 - 2142.00 - 246.54 = 2711.46 RUB`

This is internally consistent for the three target-SKU POSTING rows. Seller Analytics remains the frozen monthly gross-sales source; these finance sale amounts are reconciliation evidence and must not be added as separate revenue.

## Target-SKU ITEM accruals observed on 2026-08-03

Five ITEM components explicitly name target SKU `1636048691`, all with `type_id = 1` (Acquiring / Эквайринг under the preserved provider `/types` dictionary):

- accrual_id `58591921072`, unit `0163823802-0076`: `-6.46 RUB`
- accrual_id `58629908915`, unit `0145202542-0081`: `-15.49 RUB`
- accrual_id `58641461609`, unit `0105372211-0617-1`: `-14.80 RUB`
- accrual_id `58659452298`, unit `0121890718-0265-1`: `-15.58 RUB`
- accrual_id `58674131133`, unit `88852466-0340`: `-15.45 RUB`

Observed target-SKU acquiring subtotal on this accrual date:

`-67.78 RUB`

Some target-SKU acquiring rows do not have a same-day matching target POSTING. They remain attributable because the ITEM rows themselves explicitly identify SKU `1636048691`. Conversely, absence of same-day acquiring for a target POSTING is not evidence of zero acquiring; the monthly collection must aggregate booking dates as Ozon reports them.

## Provisional direct-cost subtotal observed on this accrual date

For evidence actually attributable to the target SKU in this response:

- sale commission: `2142.00 RUB` cost
- delivery/logistics: `246.54 RUB` cost
- acquiring: `67.78 RUB` cost
- provisional observed attributable Ozon costs: `2456.32 RUB`

This is a date-local evidence subtotal only, not the monthly CAP-24 result.

## Cumulative collected subtotal for completed 2026-08-01 through 2026-08-03

Combining Run 08, Run 09 and Run 10, without extrapolation and without yet folding in the separately preserved 2026-08-25 Run 06:

- target POSTING count: `9`
- posting sale_amount evidence: `15300.00 RUB`
- sale commission: `6426.00 RUB` cost
- delivery/logistics: `944.58 RUB` cost
- acquiring observed on those three accrual dates: `119.31 RUB` cost
- provisional attributable Ozon costs observed on 2026-08-01..03: `7489.89 RUB`

These are collection-progress subtotals only. They are not a profitability result and must not be divided by monthly ordered units.

## Returns / reversals observation

The 2026-08-03 response contains negative posting/service events for other SKUs, but no target-SKU reversal/return posting was identified in this day's supplied payload. This does not prove the target SKU had no August returns; the remaining August dates still require collection.

## Unallocated / NON_ITEM discipline

The response includes NON_ITEM charges, including type_ids `94`, `46`, `41` and `54`. None is assigned to SKU `1636048691` because no defensible SKU attribution key is present in those records.

They remain outside the exact target-SKU attributable subtotal under `NO_UNSUPPORTED_COST_ALLOCATION`.

## Coverage / pagination

`last_id = ""`.

Therefore 2026-08-03 is complete for this `/by-day` read and no continuation request is required for this date.

## CAP-24 progression

Completed finance-accrual dates currently preserved for full-August collection:

- `2026-08-01` — Run 08, complete
- `2026-08-02` — Run 09, complete
- `2026-08-03` — Run 10, complete
- `2026-08-25` — Run 06, complete

Next required finance date:

`2026-08-04`

No `/types` refresh is required. The successful provider-derived 124-row dictionary from Run 02 remains the decoding authority for known type IDs.
