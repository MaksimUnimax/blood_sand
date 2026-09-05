# STD-08 post-repair final — current stock by warehouse

Date: 2026-09-05
Business question: `Текущие остатки по складам, склады от большего к меньшему.`
Operation: `stock_on_warehouses_v2`
Endpoint: `POST /v2/analytics/stock_on_warehouses`

## Explicit pagination

The read was completed with three explicit commands; no hidden pagination/fanout/retry was used.

| page | offset | limit | returned rows | HTTP | physical requests | exact request | transformed |
|---:|---:|---:|---:|---:|---:|---|---|
| 1 | 0 | 100 | 100 | 200 | 1 | true | false |
| 2 | 100 | 100 | 100 | 200 | 1 | true | false |
| 3 | 200 | 100 | 28 | 200 | 1 | true | false |

The third page is terminal by short-page semantics (`28 < 100`). Total provider rows: **228**.

## Warehouse aggregation

Aggregation preserves provider warehouse names exactly and sums `free_to_sell_amount`, `promised_amount`, and `reserved_amount` across all rows. Similar-looking warehouse labels were not merged.

Totals across the 228 rows:

- distinct provider warehouse names: **33**
- `free_to_sell_amount`: **587**
- `promised_amount`: **54**
- `reserved_amount`: **7**

Sorted by free-to-sell stock descending:

| # | warehouse_name | free_to_sell | promised | reserved |
|---:|---|---:|---:|---:|
| 1 | Санкт_Петербург_РФЦ | 100 | 0 | 0 |
| 2 | ХАБАРОВСК_2_РФЦ | 69 | 54 | 0 |
| 3 | ПУШКИНО_1_РФЦ | 54 | 0 | 0 |
| 4 | Екатеринбург_РФЦ_НОВЫЙ | 43 | 0 | 0 |
| 5 | РОСТОВ_НА_ДОНУ_2_РФЦ | 38 | 0 | 2 |
| 6 | НИЖНИЙ_НОВГОРОД_2_РФЦ | 35 | 0 | 0 |
| 7 | СПБ_ШУШАРЫ_РФЦ | 28 | 0 | 0 |
| 8 | НЕВИННОМЫССК_РФЦ | 25 | 0 | 0 |
| 9 | ВАТУТИНКИ_РФЦ | 21 | 0 | 3 |
| 10 | ВОРОНЕЖ_2_РФЦ | 20 | 0 | 0 |
| 11 | Ростов_на_Дону_РФЦ | 17 | 0 | 0 |
| 12 | НОВОСИБИРСК_3_РФЦ | 15 | 0 | 0 |
| 13 | ТЮМЕНЬ_РФЦ | 15 | 0 | 0 |
| 14 | КРАСНОЯРСК_СТАРЦЕВО_РФЦ | 14 | 0 | 2 |
| 15 | ХОРУГВИНО_РФЦ | 14 | 0 | 0 |
| 16 | Новосибирск_РФЦ_НОВЫЙ | 13 | 0 | 0 |
| 17 | ПЕРМЬ_РФЦ | 12 | 0 | 0 |
| 18 | ЯРОСЛАВЛЬ_РФЦ | 11 | 0 | 0 |
| 19 | ПУШКИНО_2_РФЦ | 8 | 0 | 0 |
| 20 | Казань_РФЦ_НОВЫЙ | 7 | 0 | 0 |
| 21 | САРАТОВ_РФЦ | 5 | 0 | 0 |
| 22 | УФА_РФЦ | 4 | 0 | 0 |
| 23 | ВОРОНЕЖ_РФЦ | 3 | 0 | 0 |
| 24 | ОМСК_РФЦ | 3 | 0 | 0 |
| 25 | СПБ_БУГРЫ_РФЦ | 3 | 0 | 0 |
| 26 | СПБ_КОЛПИНО_РФЦ | 3 | 0 | 0 |
| 27 | ВОЛГОГРАД_РФЦ | 1 | 0 | 0 |
| 28 | ГРИВНО_РФЦ | 1 | 0 | 0 |
| 29 | ЖУКОВСКИЙ_РФЦ | 1 | 0 | 0 |
| 30 | КАЛИНИНГРАД_МРФЦ | 1 | 0 | 0 |
| 31 | НОВОРОССИЙСК_РФЦ | 1 | 0 | 0 |
| 32 | ПЕТРОВСКОЕ_РФЦ | 1 | 0 | 0 |
| 33 | ТВЕРЬ_РФЦ | 1 | 0 | 0 |

Notable semantic point: `Ростов_на_Дону_РФЦ` and `РОСТОВ_НА_ДОНУ_2_РФЦ` are distinct provider warehouse labels and remain separate.

## Verdict

`STD_08_POST_REPAIR = PASS`

The business question is answered from a complete explicit offset traversal and analysis-layer warehouse aggregation sorted by free sellable stock descending.

Checkpoint: `STD_08_POST_REPAIR_PASS_NEXT_STD09_RUN1`
