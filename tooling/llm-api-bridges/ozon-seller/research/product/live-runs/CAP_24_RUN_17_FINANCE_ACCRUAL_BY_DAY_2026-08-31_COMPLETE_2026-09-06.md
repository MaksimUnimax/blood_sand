# CAP-24 — Run 17: finance_accrual_by_day — 2026-08-31 complete

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime: `ozon-llm-api-bridge v0.1.19`
- Delivery mode: `sequential_batch_single_delivery`
- Logical business result count: `1`
- Physical business request count: `1`
- Coalesced group count: `0`
- Coalesced logical count: `0`
- Operation: `finance_accrual_by_day`
- Requested date: `2026-08-31`
- Request ID: `6fad4ad9-d9e7-4bca-aa5b-e11e30ce6300`
- Logical/physical fingerprint: `7b8a5675`
- HTTP status: `200`
- Elapsed: `1455 ms`
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

## Coverage result

The provider returned HTTP 200 with empty `last_id`, so `2026-08-31` is complete and requires no continuation request.

With the previously preserved complete dates, `finance_accrual_by_day` provider coverage now exists for every date in the frozen CAP-24 month:

`2026-08-01` through `2026-08-31` inclusive.

Routine daily finance collection is therefore complete. Successful dates must not be repeated merely to rebuild the sequence.

The execution also preserves the Bridge invariant for this request:

`1 explicit business command => 1 physical provider request`.

No hidden pagination, retry, capability probe, fanout or command transformation occurred.

## Target-SKU finance evidence for 2026-08-31

There is no commission-bearing POSTING row for target SKU `1636048691` in this complete day response.

### ITEM type_id 1 — Acquiring

Directly target-SKU-attributable ITEM rows:

- accrual `61497974399`, unit `82072634-0355`: `-6.46 RUB`
- accrual `61503562309`, unit `0160509506-0069`: `-12.18 RUB`
- accrual `61622406897`, unit `64480726-0561`: `-15.03 RUB`

Acquiring subtotal: `33.67 RUB` cost.

### Commission-null target-SKU POSTING service events

Unit `32835521-0321-1` has four directly target-SKU-attributable service events with no commission object:

- type_id `29`: `-8.62 RUB`
- type_id `45`: `-15.00 RUB`
- type_id `32`: `-70.00 RUB`
- type_id `59`: `-67.00 RUB`

Commission-null direct POSTING service subtotal: `160.62 RUB` cost.

These events are kept separate from ordinary logistics attached to commission-bearing sale rows so they are not silently treated as a sale or double counted.

### Other direct ITEM fees

The target SKU also has:

- accrual `61546964349`, type_id `38`: `-5.00 RUB`
- accrual `61546964350`, type_id `39`: `-10.00 RUB`

Other direct ITEM fee subtotal: `15.00 RUB` cost.

These are directly SKU-attributable, but they are not type_id `1` Acquiring. No unsupported semantic label is invented beyond `other direct ITEM fees` here.

## Exact 2026-08-31 target-SKU subtotal

- sale commission: `0.00 RUB`
- ordinary commission-bearing delivery/logistics: `0.00 RUB`
- acquiring: `33.67 RUB`
- separate directly attributable commission-null POSTING services: `160.62 RUB`
- other direct ITEM fees: `15.00 RUB`
- exact attributable subtotal: `209.29 RUB`

## NON_ITEM boundary

The response contains many `NON_ITEM` account-level rows, including type_ids `41`, `46`, `54` and a positive type_id `25` record. None carries a defensible target-SKU key in this response. They remain outside the exact target-SKU subtotal and must not be allocated by revenue share or another invented key.

## Cumulative materialized subtotal excluding 2026-08-25 monetary ledger

Adding Run 17 to the already reconciled materialized dates `2026-08-01..24` and `2026-08-26..30` gives:

- sale commission: `95355.72 RUB`
- ordinary commission-bearing delivery/logistics: `11843.18 RUB`
- acquiring, net of explicit reversals already materialized: `1891.52 RUB`
- separate directly attributable commission-null POSTING services: `1681.71 RUB`
- other direct ITEM fees: `30.00 RUB`
- exact subtotal for materialized dates `2026-08-01..24 + 2026-08-26..31`: `110802.13 RUB`

This is not yet the final August finance subtotal because the complete provider response for `2026-08-25` was previously recorded only as a targeted evidence excerpt rather than a full monetary target-SKU ledger.

## 2026-08-25 evidence gap and anti-double-count rule

Run 06 proves `2026-08-25` itself was provider-complete (`HTTP 200`, empty `last_id`) and preserves several target-SKU commission, delivery and acquiring examples. However, that document does not establish that its listed examples exhaust every target-SKU row in the original complete response.

The final monthly monetary ledger therefore must not promote the Run-06 excerpt into an exhaustive day subtotal by assumption.

If a reconstruction re-read of `2026-08-25` is used to repair this materialization gap, the fresh complete day response supersedes the old excerpt **for monetary day materialization only**. Run 06 remains historical evidence but its example amounts must not be added again, preventing double counting.

## Current checkpoint

`CAP_24_FINANCE_DAILY_COLLECTION_COMPLETE__AUG25_MONETARY_LEDGER_RECONSTRUCTION_REQUIRED`

No executable Bridge patch is authorized or made by this evidence record.
