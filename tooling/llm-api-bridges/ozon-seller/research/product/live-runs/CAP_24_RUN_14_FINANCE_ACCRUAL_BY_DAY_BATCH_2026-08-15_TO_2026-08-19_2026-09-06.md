# CAP-24 — Run 14: explicit finance_accrual_by_day batch — 2026-08-15 through 2026-08-19

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
| 2026-08-15 | `228b27ff-8704-444b-9552-187c4788a7e5` | `672f9a3b` | 200 | empty |
| 2026-08-16 | `303bc0ff-2586-4fd1-8fc5-a0937a7fb27d` | `df7f0e2e` | 200 | empty |
| 2026-08-17 | `1d9cfecc-8ac3-4584-a70a-e5944f56d3ad` | `509170dd` | 200 | empty |
| 2026-08-18 | `078a6eb3-f612-4f48-9a78-c4ce71bd4987` | `91a4d490` | 200 | empty |
| 2026-08-19 | `90b50966-479b-41bf-8aa6-641201b32b64` | `db3b89bf` | 200 | empty |

Therefore 2026-08-15 through 2026-08-19 are complete and require no continuation.

## Attribution discipline

Seller Analytics remains the frozen monthly gross-sales authority (`259136 RUB`, `ordered_units = 155`). This batch only collects finance events directly attributable to SKU `1636048691`.

Included:
- sale commission on target-SKU commission-bearing POSTING rows;
- delivery/logistics services on those rows;
- target-SKU ITEM `type_id=1` acquiring charges, net of explicit positive reversals;
- commission-null target-SKU POSTING service events kept separately from ordinary sale logistics.

Excluded from exact target-SKU subtotal:
- `NON_ITEM` rows without a defensible SKU key;
- unrelated-SKU ITEM/POSTING rows.

## 2026-08-15

Commission-bearing target-SKU POSTING rows: `3`.

- sale commission: `2142.00 RUB`
- ordinary delivery/logistics: `255.24 RUB`
- acquiring, net of explicit reversal: `45.98 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `2443.22 RUB`.

Acquiring note: unit `0108072073-0414` contains `-14.26 RUB` and a matching `+14.26 RUB` reversal, so that pair nets to zero rather than being double-counted as cost.

## 2026-08-16

Commission-bearing target-SKU POSTING rows: `2`.

- sale commission: `1428.00 RUB`
- ordinary delivery/logistics: `176.78 RUB`
- acquiring: `25.30 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `1630.08 RUB`.

## 2026-08-17

Commission-bearing target-SKU POSTING rows: `4`.

- sale commission: `2856.00 RUB`
- ordinary delivery/logistics: `355.37 RUB`
- acquiring: `27.50 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `3238.87 RUB`.

## 2026-08-18

Commission-bearing target-SKU POSTING rows: `8`.

- sale commission: `5712.00 RUB`
- ordinary delivery/logistics: `663.67 RUB`
- acquiring: `101.87 RUB`
- additional target commission-null service events: `0.00 RUB`

Date subtotal: `6477.54 RUB`.

## 2026-08-19

Commission-bearing target-SKU POSTING rows: `4`.

- sale commission: `2856.00 RUB`
- ordinary delivery/logistics: `324.31 RUB`
- acquiring: `73.04 RUB`

Additional commission-null target-SKU POSTING service events on unit `0185595799-0365-1`:
- type_id `29`: `9.33 RUB` cost
- type_id `32`: `77.00 RUB` cost
- type_id `59`: `67.00 RUB` cost

Additional direct service subtotal: `153.33 RUB`.

Date subtotal: `3406.68 RUB`.

## Batch subtotal — 2026-08-15 through 2026-08-19

- sale commission: `14994.00 RUB`
- ordinary commission-bearing delivery/logistics: `1775.37 RUB`
- acquiring: `273.69 RUB`
- separate directly attributable commission-null POSTING services: `153.33 RUB`
- total exact attributable Ozon costs in this batch: `17196.39 RUB`

## Cumulative collection subtotal — 2026-08-01 through 2026-08-19

Combining Runs 08–14, without extrapolation:

- sale commission: `65916.48 RUB`
- ordinary commission-bearing delivery/logistics: `8307.28 RUB`
- acquiring: `1351.51 RUB`
- separate directly attributable commission-null POSTING services: `976.65 RUB`
- cumulative exact attributable subtotal through 2026-08-19: `76551.92 RUB`

Separately preserved complete date `2026-08-25` remains valid and is not included in the contiguous 01–19 subtotal above.

This is still not the final monthly unit-economics result.

## Progression

Complete finance dates now preserved:
- `2026-08-01` through `2026-08-19`
- `2026-08-25`

Remaining first-page dates:
- `2026-08-20` through `2026-08-24`
- `2026-08-26` through `2026-08-31`

Next default action: explicit batch for `2026-08-20` through `2026-08-24`.
