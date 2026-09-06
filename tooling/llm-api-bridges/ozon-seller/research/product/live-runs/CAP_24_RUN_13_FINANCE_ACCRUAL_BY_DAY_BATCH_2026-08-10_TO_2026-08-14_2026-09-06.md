# CAP-24 — Run 13: explicit finance_accrual_by_day batch — 2026-08-10 through 2026-08-14

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
| 2026-08-10 | `860ebcc4-9fb3-4b39-ba10-c99938273396` | `a2fe5938` | 200 | empty |
| 2026-08-11 | `c9f85837-8f1b-43d7-80f6-89b77299ef5d` | `24140567` | 200 | empty |
| 2026-08-12 | `cc91393a-906e-44b8-9dc0-b2d0e4b2fd13` | `980eb9aa` | 200 | empty |
| 2026-08-13 | `04c5c822-29d1-4878-a342-6c33c3bd5a47` | `43a43279` | 200 | empty |
| 2026-08-14 | `e2686ebe-1dd6-4e39-8ac9-ab1e18a3401c` | `a8f161ec` | 200 | empty |

Therefore 2026-08-10 through 2026-08-14 are complete and require no continuation.

## Attribution discipline

Seller Analytics remains the frozen monthly gross-sales authority (`259136 RUB`, `ordered_units = 155`). This batch only collects finance events directly attributable to SKU `1636048691`.

Included:
- sale commission on target-SKU commission-bearing POSTING rows;
- delivery/logistics services on those rows;
- target-SKU ITEM `type_id=1` acquiring charges;
- commission-null target-SKU POSTING service events kept separately from ordinary sale logistics.

Excluded from exact target-SKU subtotal:
- `NON_ITEM` rows without a defensible SKU key;
- unrelated-SKU ITEM/POSTING rows.

## 2026-08-10

Commission-bearing target-SKU POSTING rows: `7`.

- sale commission: `4548.18 RUB`
- ordinary delivery/logistics: `581.33 RUB`
- acquiring: `57.04 RUB`

Additional commission-null target-SKU POSTING service events on unit `0125830324-0195-1`:
- type_id `29`: `9.65 RUB` cost
- type_id `32`: `77.00 RUB` cost
- type_id `59`: `77.00 RUB` cost

Additional direct service subtotal: `163.65 RUB`.

Date subtotal: `5350.20 RUB`.

## 2026-08-11

Commission-bearing target-SKU POSTING rows: `10`.

- sale commission: `6690.18 RUB`
- ordinary delivery/logistics: `963.84 RUB`
- acquiring: `148.22 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `7802.24 RUB`.

## 2026-08-12

Commission-bearing target-SKU POSTING rows: `5`.

- sale commission: `3420.06 RUB`
- ordinary delivery/logistics: `429.82 RUB`
- acquiring: `110.89 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `3960.77 RUB`.

## 2026-08-13

Commission-bearing target-SKU POSTING rows: `4`.

- sale commission: `2856.00 RUB`
- ordinary delivery/logistics: `338.50 RUB`
- acquiring: `105.02 RUB`

Additional commission-null target-SKU POSTING service events on unit `0102594320-0109-1`:
- type_id `32`: `77.00 RUB` cost
- type_id `59`: `85.00 RUB` cost

Additional direct service subtotal: `162.00 RUB`.

Date subtotal: `3461.52 RUB`.

## 2026-08-14

Commission-bearing target-SKU POSTING rows: `6`.

- sale commission: `4284.00 RUB`
- ordinary delivery/logistics: `489.26 RUB`
- acquiring: `49.00 RUB`

Additional commission-null target-SKU POSTING service events:

Unit `0146333073-0399-1`:
- type_id `29`: `8.46 RUB`
- type_id `32`: `78.00 RUB`
- type_id `59`: `67.00 RUB`

Unit `0193168587-0272-1`:
- type_id `29`: `20.21 RUB`
- type_id `32`: `77.00 RUB`
- type_id `59`: `67.00 RUB`

Additional direct service subtotal: `317.67 RUB`.

Date subtotal: `5139.93 RUB`.

## Batch subtotal — 2026-08-10 through 2026-08-14

- sale commission: `21798.42 RUB`
- ordinary commission-bearing delivery/logistics: `2802.75 RUB`
- acquiring: `470.17 RUB`
- separate directly attributable commission-null POSTING services: `643.32 RUB`
- total exact attributable Ozon costs in this batch: `25714.66 RUB`

## Cumulative collection subtotal — 2026-08-01 through 2026-08-14

Combining Runs 08–13, without extrapolation:

- previous exact attributable subtotal through 2026-08-09: `33640.87 RUB`
- Run 13 subtotal: `25714.66 RUB`
- cumulative exact attributable subtotal through 2026-08-14: `59355.53 RUB`

Separately preserved complete date `2026-08-25` from Run 06 remains valid and is not included in the contiguous 01–14 subtotal above.

This is still not the final monthly unit-economics result.

## Progression

Complete finance dates now preserved:
- `2026-08-01` through `2026-08-14`
- `2026-08-25`

Remaining first-page dates:
- `2026-08-15` through `2026-08-24`
- `2026-08-26` through `2026-08-31`

Next default action: explicit batch for `2026-08-15` through `2026-08-19`.
