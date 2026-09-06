# CAP-24 — Run 12: explicit finance_accrual_by_day batch — 2026-08-05 through 2026-08-09

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime: `ozon-llm-api-bridge v0.1.19`
- Delivery mode: `sequential_batch_single_delivery`
- Logical business result count: `5`
- Physical business request count: `5`
- Batch orchestration rule: `EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS`
- Target Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

## Batch execution evidence

All five explicit commands were independent first-page `finance_accrual_by_day` reads with known calendar dates. The Bridge executed exactly one physical provider request per explicit command and returned one batch delivery.

| Date | Request ID | Fingerprint | HTTP | external | exact preserved | transformed | last_id |
|---|---|---|---:|---|---|---|---|
| 2026-08-05 | `ecdb1fe4-ed40-43c9-a7bf-70e12c79642c` | `be2458fa` | 200 | true | true | false | empty |
| 2026-08-06 | `3777958b-fa05-4ad7-8acf-0d8a5a09ba08` | `d4707a77` | 200 | true | true | false | empty |
| 2026-08-07 | `78cf6f7e-a9ea-47cd-a469-952665552a73` | `3ef55748` | 200 | true | true | false | empty |
| 2026-08-08 | `c034e7ec-4a6c-470e-a0bf-c1bdfafd768a` | `62d9a625` | 200 | true | true | false | empty |
| 2026-08-09 | `09daa96c-fafa-4124-bfe7-1d7bb8f43ac1` | `d46c3536` | 200 | true | true | false | empty |

Therefore all five dates are complete and require no `last_id` continuation.

## What is being collected

Seller Analytics remains the frozen August gross-sales authority (`259136 RUB`, `ordered_units = 155`). This finance batch is not a second sales measurement. It collects provider financial events directly attributable to SKU `1636048691`:

- sale commission;
- delivery/logistics services;
- acquiring ITEM charges;
- target-SKU posting-only service charges / return-flow / reversal-related direct events where the SKU key is explicit;
- any other exact ITEM/POSTING deductions tied to the target SKU.

`NON_ITEM` rows without a defensible SKU key remain unallocated and are excluded from the exact target-SKU subtotal.

## 2026-08-05

Commission-bearing target-SKU sale POSTING rows: `9`.

- sale commission: `6426.00 RUB` cost
- ordinary commission-bearing posting delivery/logistics: `735.85 RUB` cost
- target-SKU type_id `1` ITEM/acquiring components: `76.84 RUB` cost

Additional target-SKU POSTING service events on unit `0127581096-0124-4`, each with `commission = null`:

- type_id `32`: `-70.00 RUB`
- type_id `59`: `-70.00 RUB`
- type_id `29`: `-25.00 RUB`
- type_id `45`: `-15.00 RUB`

Additional direct posting-service subtotal: `180.00 RUB` cost.

These four service rows are preserved separately from ordinary sale-posting delivery so they are not silently collapsed into a normal-sale logistics average. Their SKU attribution is explicit and therefore they belong to the direct-finance ledger; exact economic labeling of every service ID must use the preserved provider type dictionary rather than inference.

Date-local attributable subtotal:

`6426.00 + 735.85 + 76.84 + 180.00 = 7418.69 RUB`

## 2026-08-06

Commission-bearing target-SKU sale POSTING rows: `3`.

- sale commission: `2142.00 RUB` cost
- delivery/logistics: `246.53 RUB` cost
- acquiring: `46.05 RUB` cost
- attributable subtotal: `2434.58 RUB`

No additional target-SKU posting-only service row was identified beyond those counted above.

## 2026-08-07

Commission-bearing target-SKU sale POSTING rows: `4`.

- sale commission: `2856.00 RUB` cost
- delivery/logistics: `321.82 RUB` cost
- acquiring: `93.17 RUB` cost
- attributable subtotal: `3270.99 RUB`

## 2026-08-08

Commission-bearing target-SKU sale POSTING rows: `6`.

- sale commission: `4284.00 RUB` cost
- delivery/logistics: `632.37 RUB` cost
- acquiring: `73.95 RUB` cost
- attributable subtotal: `4990.32 RUB`

One target posting (`89615475-0048-1`) has materially higher delivery/logistics (`217.95 RUB`) than the usual target rows. It is preserved exactly as provider evidence and must not be normalized away.

## 2026-08-09

Commission-bearing target-SKU sale POSTING rows: `6`.

One target sale posting (`0177591982-0015-1`) uses `sale_amount = 1343 RUB` with commission `564.06 RUB`; the other target sale postings use the observed 1700 RUB basis. Preserve the actual provider values and do not replace them with a fixed current/unit price.

- sale commission: `4134.06 RUB` cost
- delivery/logistics: `494.92 RUB` cost
- acquiring: `83.15 RUB` cost
- attributable subtotal: `4712.13 RUB`

## Batch subtotal — 2026-08-05 through 2026-08-09

- sale commission: `19842.06 RUB`
- ordinary commission-bearing delivery/logistics: `2431.49 RUB`
- acquiring: `373.16 RUB`
- additional target direct posting services on 2026-08-05: `180.00 RUB`
- total exact attributable Ozon costs in this five-date batch: `22826.71 RUB`

## Cumulative collection subtotal — 2026-08-01 through 2026-08-09

Combining preserved Runs 08–11 with this batch, without extrapolation:

- sale commission: `29124.06 RUB`
- ordinary commission-bearing delivery/logistics: `3729.16 RUB`
- acquiring: `607.65 RUB`
- separate directly attributable posting-only services: `180.00 RUB`
- total exact attributable Ozon costs collected for 2026-08-01..09: `33640.87 RUB`

This is not the final monthly result because remaining August finance dates still need coverage. Do not divide this subtotal by monthly ordered units as if the month were complete.

Separately preserved complete date `2026-08-25` from Run 06 remains valid and will be folded into the final monthly ledger after full coverage is complete.

## Attribution discipline

Large `NON_ITEM` rows in the batch, including recurring type_ids such as `41`, `46`, `54`, and `72`, are not assigned to the target SKU. Their presence in the same day does not create a defensible SKU attribution key.

No account-level pro-rata allocation is permitted under `NO_UNSUPPORTED_COST_ALLOCATION`.

## Batch orchestration significance

This run directly validates the corrected project rule:

`ONE DATE PER COMMAND != ONE COMMAND PER ASSISTANT TURN`

Observed:

`5 explicit business commands => 5 physical provider requests => 1 sequential batch delivery`

No hidden retry, hidden pagination, hidden fanout or implicit continuation occurred.

## Progression

Complete finance dates now preserved:

- `2026-08-01` through `2026-08-09`
- `2026-08-25`

Remaining first-page dates:

- `2026-08-10` through `2026-08-24`
- `2026-08-26` through `2026-08-31`

Next default action: another bounded explicit batch of independent first-page date reads. If any date returns non-empty `last_id`, issue that specific continuation later as a dependent explicit command.
