# Ozon query value — QV1 organic monetized phrases — 2026-09-12

## Status

`QV1 = COMPLETE__PERSISTED_SOURCE_EXTRACTION`

- source period: `2026-08-13..2026-09-10`;
- raw observations: `4,440`;
- unique `(sku, query)` pairs after slice deduplication: `4,310`;
- pairs with `gmv > 0`: `162`;
- unique monetized raw phrases: `146`;
- SKUs with monetized phrase evidence: `50`;
- sum of attributed query×SKU GMV: `131,393.07 RUB`.

## Interpretation

`gmv > 0` is retained as direct monetary evidence returned by Ozon for a query×SKU pair. It is not CPC, profit, or permission to add the phrase to card content.

The saved response has no usable transition/click layer: `unique_view_users` and `view_conversion` are empty in all deduplicated rows, while `order_count` is zero even where `gmv > 0`. Therefore clicks and order counts are not inferred from this dataset.

Four source slices are bounded Ozon observations; this register is not claimed to contain every monetized query in the marketplace.

## Top 25 by attributed GMV

| Rank | Query | GMV, RUB | SKU count | Max observed search users |
|---:|---|---:|---:|---:|
| 1 | оберег в машину | 4,776.00 | 3 | 1190 |
| 2 | подвеска в машину | 4,296.00 | 4 | 7092 |
| 3 | славянский оберег в машину | 4,097.47 | 3 | 33 |
| 4 | оберег в машину славянский | 2,459.00 | 3 | 23 |
| 5 | четки славянские | 2,435.00 | 2 | 41 |
| 6 | подвеска в машину на зеркало | 2,111.00 | 2 | 6256 |
| 7 | ловец снов в машину мужской | 1,764.00 | 1 | 0 |
| 8 | от сглаза оберег в машину | 1,705.00 | 1 | 8 |
| 9 | в машину на зеркало | 1,704.00 | 2 | 183 |
| 10 | четки с коловратом | 1,628.00 | 1 | 0 |
| 11 | оберег славянский в машину | 1,578.00 | 1 | 1 |
| 12 | печать велеса | 1,499.00 | 1 | 432 |
| 13 | оберег сварога | 1,446.00 | 1 | 15 |
| 14 | подвеска на зеркало в машину | 1,413.00 | 2 | 1288 |
| 15 | коловрат в машину | 1,368.00 | 2 | 20 |
| 16 | подвеска в машину дева | 1,327.00 | 2 | 5 |
| 17 | четки в автомобиль славянские | 1,265.00 | 1 | 3 |
| 18 | толстовка велес | 1,160.11 | 1 | 1 |
| 19 | славянский оберег | 1,122.00 | 2 | 498 |
| 20 | руны подвеска дерево в машину на защиту | 1,120.00 | 1 | 0 |
| 21 | набор подвесок в машину | 1,092.93 | 1 | 2 |
| 22 | амулет | 1,071.00 | 1 | 3190 |
| 23 | велес амулет в машину | 1,058.00 | 1 | 1 |
| 24 | славянский оберег для машины | 1,053.00 | 1 | 1 |
| 25 | четки со знаком зодиака | 1,032.00 | 1 | 0 |

## Important false-positive warning

The monetized layer still contains phrases that are not safe SEO targets. Example: `толстовка велес` has positive attributed GMV for a Veles pendant SKU. Economic evidence and semantic relevance are therefore separate gates.

## Local recipient artifact

A recipient XLSX was materialized from the persisted analytical artifact with two complete data sheets: aggregated monetized phrases and all monetized `query×SKU` pairs. The XLSX is a recipient view; the canonical raw authority remains the saved Ozon observations in `01_QUERY_OBSERVATIONS_MASTER.tsv`.

## Next block

`QV2`: advertising economics and API capability reconciliation — phrase-level ad report availability, clicks/spend/orders/revenue, and the exact Bridge gap.
