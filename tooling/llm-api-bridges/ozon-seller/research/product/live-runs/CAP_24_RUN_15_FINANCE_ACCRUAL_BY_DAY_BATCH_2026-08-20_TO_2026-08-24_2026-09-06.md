# CAP-24 — Run 15: explicit finance_accrual_by_day batch — 2026-08-20 through 2026-08-24

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime: `ozon-llm-api-bridge v0.1.19`
- Delivery mode: `sequential_batch_single_delivery`
- Logical business result count: `5`
- Physical business request count: `5`
- Target Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

## Batch execution evidence

All five explicit independent `finance_accrual_by_day` commands succeeded.

| Date | Request ID | Fingerprint | HTTP | last_id |
|---|---|---|---:|---|
| 2026-08-20 | `71e8d56e-db41-492b-b056-5633249fb1aa` | `85a16f83` | 200 | empty |
| 2026-08-21 | `6770f4f7-5d49-4f3d-bec9-cbaab8ab25ba` | `a76371d4` | 200 | empty |
| 2026-08-22 | `a9e7e2ea-8cee-4c9f-93fc-3a0c7818d452` | `b5cc49c5` | 200 | empty |
| 2026-08-23 | `c5c0f48f-31c0-483d-bb38-a124e7ca43d0` | `d23784d6` | 200 | empty |
| 2026-08-24 | `c926b366-ecc4-4412-995c-8abf13b602ab` | `a4d8e3af` | 200 | empty |

Therefore 2026-08-20 through 2026-08-24 are complete and require no continuation.

## Attribution discipline

Seller Analytics remains the frozen monthly gross-sales authority (`259136 RUB`, `ordered_units = 155`). This batch only collects finance events directly attributable to SKU `1636048691`.

Included:
- sale commission on target-SKU commission-bearing POSTING rows;
- delivery/logistics services on those rows;
- target-SKU ITEM `type_id=1` acquiring charges;
- commission-null target-SKU POSTING service events kept separately from ordinary sale logistics.

Excluded from exact target-SKU subtotal:
- `NON_ITEM` rows without a defensible SKU key;
- unrelated-SKU ITEM/POSTING rows;
- unrelated-SKU reversals.

## 2026-08-20

Commission-bearing target-SKU POSTING rows: `7`.

- sale commission: `4876.62 RUB`
- ordinary delivery/logistics: `583.07 RUB`
- acquiring: `43.64 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `5503.33 RUB`.

The `1411 RUB` seller-price target row on unit `61296518-0406-1` carries `592.62 RUB` commission and `74.17 RUB` delivery; it is preserved at its actual finance values rather than normalized to the more common `1700 RUB` sale rows.

## 2026-08-21

Commission-bearing target-SKU POSTING rows: `5`.

- sale commission: `3448.62 RUB`
- ordinary delivery/logistics: `432.30 RUB`
- acquiring: `50.64 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `3931.56 RUB`.

The unrelated-SKU reversal on unit `52632780-0170-1` is excluded from the target subtotal because its SKU is `1720151850`, not `1636048691`.

## 2026-08-22

Commission-bearing target-SKU POSTING rows: `2`.

- sale commission: `1428.00 RUB`
- ordinary delivery/logistics: `167.03 RUB`
- acquiring: `29.86 RUB`

Additional commission-null target-SKU POSTING service events:

Unit `0153699641-0688-33`:
- type_id `29`: `10.24 RUB` cost
- type_id `32`: `77.00 RUB` cost
- type_id `59`: `67.00 RUB` cost
- subtotal: `154.24 RUB`

Unit `0247422884-0107-2`:
- type_id `29`: `1.44 RUB` cost
- type_id `32`: `69.00 RUB` cost
- type_id `59`: `67.00 RUB` cost
- subtotal: `137.44 RUB`

Additional direct service subtotal: `291.68 RUB`.

Date subtotal: `1916.57 RUB`.

## 2026-08-23

Commission-bearing target-SKU POSTING rows: `0`.

- sale commission: `0.00 RUB`
- ordinary delivery/logistics: `0.00 RUB`
- target-SKU acquiring ITEM fees: `30.78 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `30.78 RUB`.

The two target-SKU acquiring rows (`14.93 RUB` and `15.85 RUB`) are retained because the ITEM payload itself explicitly identifies SKU `1636048691`; no same-day commission-bearing POSTING is invented or required for that attribution.

## 2026-08-24

Commission-bearing target-SKU POSTING rows: `1`.

- sale commission: `714.00 RUB`
- ordinary delivery/logistics: `79.17 RUB`
- acquiring: `6.89 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `800.06 RUB`.

## Batch subtotal — 2026-08-20 through 2026-08-24

- sale commission: `10467.24 RUB`
- ordinary commission-bearing delivery/logistics: `1261.57 RUB`
- acquiring: `161.81 RUB`
- separate directly attributable commission-null POSTING services: `291.68 RUB`
- total exact attributable Ozon costs in this batch: `12182.30 RUB`

## Cumulative collection subtotal — 2026-08-01 through 2026-08-24

Combining Runs 08–15, without extrapolation:

- sale commission: `76383.72 RUB`
- ordinary commission-bearing delivery/logistics: `9568.85 RUB`
- acquiring, net of explicit reversals already observed in prior runs: `1513.32 RUB`
- separate directly attributable commission-null POSTING services: `1268.33 RUB`
- cumulative exact attributable subtotal through 2026-08-24: `88734.22 RUB`

Separately preserved complete date `2026-08-25` remains valid and is not included in the contiguous 01–24 subtotal above.

This is still not the final monthly unit-economics result.

## Progression

Complete finance dates now preserved:
- `2026-08-01` through `2026-08-25`

Remaining first-page dates:
- `2026-08-26` through `2026-08-31`

Next default action: explicit batch for `2026-08-26` through `2026-08-30`, then `2026-08-31` unless a returned dependency/failure changes the sequence.
