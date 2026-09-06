# CAP-24 — Run 16: explicit finance_accrual_by_day batch — 2026-08-26 through 2026-08-30

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime: `ozon-llm-api-bridge v0.1.19`
- Delivery mode: `sequential_batch_single_delivery`
- Logical business result count: `5`
- Physical business request count: `5`
- Coalesced group count: `0`
- Coalesced logical count: `0`
- Target Ozon SKU: `1636048691`
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`

## Batch execution evidence

All five explicit independent `finance_accrual_by_day` commands succeeded.

| Date | Request ID | Fingerprint | HTTP | last_id |
|---|---|---|---:|---|
| 2026-08-26 | `fb727c68-be55-495b-8ea2-27890ddadd19` | `747ec321` | 200 | empty |
| 2026-08-27 | `181d1499-0638-4432-a6d1-733d4e3ee958` | `ed5bfdf2` | 200 | empty |
| 2026-08-28 | `6f36d271-a070-42aa-ace4-a485f166f306` | `0a20236b` | 200 | empty |
| 2026-08-29 | `4fade750-3f9e-42de-b0d0-70352d32a43a` | `c4c1e25c` | 200 | empty |
| 2026-08-30 | `5e1b6e0f-a1d8-4444-a0ad-7d7c8c873d98` | `ea7452c6` | 200 | empty |

Therefore 2026-08-26 through 2026-08-30 are complete and require no continuation.

## Attribution discipline

Seller Analytics remains the frozen monthly gross-sales authority (`259136 RUB`, `ordered_units = 155`). This batch only collects finance events directly attributable to SKU `1636048691`.

Included:
- sale commission on target-SKU commission-bearing POSTING rows;
- delivery/logistics services on those rows;
- target-SKU ITEM `type_id=1` acquiring charges;
- commission-null target-SKU POSTING service events kept separately from ordinary sale logistics;
- other target-SKU ITEM deductions that are directly attributed by the provider payload.

Excluded from exact target-SKU subtotal:
- `NON_ITEM` rows without a defensible SKU key;
- unrelated-SKU ITEM/POSTING rows and reversals.

Important new evidence on 2026-08-26:
- target SKU has ITEM `type_id=38 = -5 RUB`;
- target SKU has ITEM `type_id=39 = -10 RUB`.

These are directly SKU-attributable costs, but they are not `type_id=1` Acquiring and therefore are preserved as a separate `other direct ITEM fees` category. No unsupported semantic name is invented here.

## 2026-08-26

Commission-bearing target-SKU POSTING rows: `8`.

- sale commission: `5712.00 RUB`
- ordinary delivery/logistics: `698.89 RUB`
- acquiring (`type_id=1`): `100.69 RUB`
- other direct ITEM fees (`type_id=38/39`): `15.00 RUB`
- commission-null target POSTING service events: `0.00 RUB`

Date subtotal: `6526.58 RUB`.

## 2026-08-27

Commission-bearing target-SKU POSTING rows: `4`.

- sale commission: `2856.00 RUB`
- ordinary delivery/logistics: `347.79 RUB`
- acquiring: `44.84 RUB`
- other direct ITEM fees: `0.00 RUB`
- commission-null target POSTING service events: `0.00 RUB`

Date subtotal: `3248.63 RUB`.

## 2026-08-28

Commission-bearing target-SKU POSTING rows: `6`.

- sale commission: `4284.00 RUB`
- ordinary delivery/logistics: `530.55 RUB`
- acquiring: `45.44 RUB`
- other direct ITEM fees: `0.00 RUB`

Additional commission-null target-SKU POSTING service event:
- unit `0259337413-0005-2`
- type_id `32`: `74.00 RUB` cost
- type_id `98`: `25.00 RUB` cost
- subtotal: `99.00 RUB`

Date subtotal: `4958.99 RUB`.

## 2026-08-29

Commission-bearing target-SKU POSTING rows: `4`.

- sale commission: `2856.00 RUB`
- ordinary delivery/logistics: `347.11 RUB`
- acquiring: `83.98 RUB`
- other direct ITEM fees: `0.00 RUB`
- commission-null target POSTING service events: `0.00 RUB`

Date subtotal: `3287.09 RUB`.

The acquiring subtotal includes target-SKU ITEM rows that are directly attributable even where no same-day commission-bearing POSTING for the same unit is present. No sale event is invented to force one-to-one matching.

## 2026-08-30

Commission-bearing target-SKU POSTING rows: `4`.

Three target sale rows carry `50%` commission (`850 RUB` each) and one carries `42%` commission (`714 RUB`). Values are preserved as returned rather than normalized.

- sale commission: `3264.00 RUB`
- ordinary delivery/logistics: `349.99 RUB`
- acquiring: `69.58 RUB`
- other direct ITEM fees: `0.00 RUB`

Additional commission-null target-SKU POSTING service events on unit `59958837-0837-1`:
- type_id `29`: `8.76 RUB` cost
- type_id `32`: `78.00 RUB` cost
- type_id `59`: `67.00 RUB` cost
- subtotal: `153.76 RUB`

Date subtotal: `3837.33 RUB`.

## Batch subtotal — 2026-08-26 through 2026-08-30

- sale commission: `18972.00 RUB`
- ordinary commission-bearing delivery/logistics: `2274.33 RUB`
- acquiring: `344.53 RUB`
- separate directly attributable commission-null POSTING services: `252.76 RUB`
- other direct ITEM fees: `15.00 RUB`
- total exact attributable Ozon costs in this batch: `21858.62 RUB`

## Collection subtotal excluding separately preserved 2026-08-25

Combining the already reconciled contiguous subtotal for 2026-08-01 through 2026-08-24 with this Run 16 batch gives:

- sale commission: `95355.72 RUB`
- ordinary commission-bearing delivery/logistics: `11843.18 RUB`
- acquiring, net of explicit reversals already observed in prior runs: `1857.85 RUB`
- separate directly attributable commission-null POSTING services: `1521.09 RUB`
- other direct ITEM fees: `15.00 RUB`
- exact subtotal for `2026-08-01..24 + 2026-08-26..30`: `110592.84 RUB`

`2026-08-25` remains a complete preserved provider day (`HTTP 200`, empty `last_id`) but its existing Run-06 evidence file was written as a targeted evidence excerpt rather than as a fully materialized monetary day ledger. Therefore this document does not silently infer that the excerpt is exhaustive. The day will be folded into the final monthly ledger from preserved evidence during final reconciliation.

This is still not the final monthly unit-economics result.

## Progression

Complete finance dates now preserved:
- `2026-08-01` through `2026-08-30`

Remaining first-page date:
- `2026-08-31`

Next default action: one explicit `finance_accrual_by_day` command for `2026-08-31`. If its `last_id` is empty and HTTP 200, first-page finance collection for the full frozen month is complete and the workflow moves to monthly reconciliation rather than more routine `/by-day` collection.
