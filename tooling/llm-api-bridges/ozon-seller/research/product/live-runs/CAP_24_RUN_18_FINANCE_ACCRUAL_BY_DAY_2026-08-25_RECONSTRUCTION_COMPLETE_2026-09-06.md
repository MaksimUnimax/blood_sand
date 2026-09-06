# CAP-24 — Run 18: 2026-08-25 monetary ledger reconstruction complete

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime: `ozon-llm-api-bridge v0.1.19`
- Delivery mode: `sequential_batch_single_delivery`
- Logical business result count: `1`
- Physical business request count: `1`
- Operation: `finance_accrual_by_day`
- Requested date: `2026-08-25`
- Request ID: `72b8a67c-8108-403b-a8dd-68f73cee8709`
- Logical/physical fingerprint: `5940f840`
- HTTP status: `200`
- Elapsed: `1502 ms`
- External request executed: `true`
- Capability probe: `not_needed`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`
- Rate-limit metadata: `null`
- Response `last_id`: empty string
- Target Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

## Purpose

This was not routine duplicate collection. Run 06 had already proved provider coverage for 2026-08-25, but only a targeted excerpt of its monetary rows had been preserved. The original complete response was not available for exhaustive final reconciliation.

Run 18 is therefore an explicit evidence-repair reconstruction. Its complete response supersedes the Run-06 excerpt **only for 2026-08-25 monetary materialization**. Run-06 example values must not be added again.

## Coverage result

The provider returned HTTP 200 with empty `last_id`. Therefore the reconstruction response is complete for 2026-08-25 and no continuation is required.

The Bridge invariant is preserved:

`1 explicit business command => 1 physical provider request`.

No hidden pagination, retry, probe, fanout or command transformation occurred.

## Exact target-SKU POSTING rows

Three commission-bearing POSTING rows contain target SKU `1636048691`:

1. accrual `60867011731`, unit `44683371-0293-4`
   - sale commission: `-714.00 RUB`
   - delivery total: `-88.66 RUB`
   - type_id 32: `-78.00 RUB`
   - type_id 29: `-10.66 RUB`
   - sale_amount: `1700 RUB`

2. accrual `60873224071`, unit `0157219793-0269-1`
   - sale commission: `-714.00 RUB`
   - delivery total: `-86.12 RUB`
   - type_id 32: `-70.00 RUB`
   - type_id 29: `-16.12 RUB`
   - sale_amount: `1700 RUB`

3. accrual `60882525997`, unit `49547269-0080-5`
   - sale commission: `-714.00 RUB`
   - delivery total: `-79.56 RUB`
   - type_id 32: `-70.00 RUB`
   - type_id 29: `-9.56 RUB`
   - sale_amount: `1700 RUB`

Exact 2026-08-25 POSTING subtotal for the target SKU:

- sale commission: `2142.00 RUB` cost
- ordinary commission-bearing delivery/logistics: `254.34 RUB` cost

Finance `sale_amount` is reconciliation evidence only and is not added to Seller Analytics monthly revenue.

## Exact target-SKU ITEM rows

Four target-SKU `ITEM` fee components are present, all type_id `1` (`Acquiring`) using the preserved provider-derived Run-02 dictionary:

- accrual `60846592750`, unit `84299727-0377`: `-16.07 RUB`
- accrual `60858555749`, unit `0224246390-0158`: `-15.69 RUB`
- accrual `60885263948`, unit `49547269-0080-5`: `-15.09 RUB`
- accrual `60890849661`, unit `18058233-1599`: target-SKU component `-18.68 RUB`

The last accrual is multi-SKU; only the `1636048691` component is attributed to the target. The other SKU component is excluded.

Exact target-SKU acquiring subtotal: `65.53 RUB` cost.

No target-SKU type_id 38/39 fee appears in this complete reconstruction response.

## Returns/reversals on 2026-08-25

The response contains reversal-like positive commission/acquiring effects for other SKUs, but no such POSTING or ITEM reversal belongs to target SKU `1636048691`.

Therefore no target-SKU reversal offset is added for this day.

## NON_ITEM boundary

The response contains `NON_ITEM` account-level records including type_ids `41`, `46`, and `54`. They do not expose a defensible target-SKU key and therefore remain unallocated. They are not distributed to the target by revenue share or another invented allocation rule.

## Exact 2026-08-25 target-SKU ledger

- sale commission: `2142.00 RUB`
- ordinary commission-bearing delivery/logistics: `254.34 RUB`
- acquiring: `65.53 RUB`
- separate commission-null target-SKU POSTING services: `0.00 RUB`
- other direct target-SKU ITEM fees: `0.00 RUB`
- exact attributable subtotal: `2461.87 RUB`

## Final August finance ledger after reconstruction

Merging Run 18 exactly once into the previously materialized `2026-08-01..24 + 2026-08-26..31` subtotal produces the complete directly attributable August finance ledger for target SKU `1636048691`:

- sale commission: `97497.72 RUB`
- ordinary commission-bearing delivery/logistics: `12097.52 RUB`
- acquiring, net of explicit reversals: `1957.05 RUB`
- separate directly attributable commission-null POSTING services: `1681.71 RUB`
- other direct ITEM fees: `30.00 RUB`
- **total directly attributable Ozon finance costs: `113264.00 RUB`**

This closes the monetary-materialization gap for the August `/by-day` finance evidence.

## Finance-only contribution preview

Canonical Seller Analytics August evidence remains:

- revenue: `259136 RUB`
- `ordered_units`: `155`

Using only directly attributable Ozon finance costs materialized above:

- revenue: `259136.00 RUB`
- attributable finance costs: `113264.00 RUB`
- contribution after these finance costs: `145872.00 RUB`
- attributable finance cost share of revenue: `43.7083%`
- attributable finance cost per ordered unit: `730.74 RUB`
- contribution per ordered unit after these finance costs: `941.11 RUB`

These are **not yet the final CAP-24 unit economics**, because advertising and placement/storage attribution requirements still need to be attempted and any non-attributable account-level expenses must remain explicit coverage gaps.

## Current checkpoint

`CAP_24_FINANCE_LEDGER_COMPLETE__NEXT_ADVERTISING_ATTRIBUTION_ATTEMPT`

No executable Bridge patch is authorized or made by this evidence record.
