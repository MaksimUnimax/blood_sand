# STD-08 Run 3 — terminal page + final warehouse aggregation

Date: 2026-09-02
Question: `Покажи текущие остатки по складам и отсортируй склады от наибольшего остатка к наименьшему.`

## Run 3 provider result

Operation: `stock_on_warehouses_v2`

- request_id: `2f5428a2-104c-402b-b7ed-e7680a1cd084`
- offset: `200`
- limit: `100`
- warehouse_type: `ALL`
- HTTP: `200`
- physical business requests: `1`
- external_request_executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED`
- `pagination=null`
- logical fingerprint: `4252a4b8`
- physical fingerprint: `60fcc984`
- `command_transformed=true`
- rows returned on page 3: `47`

Because page 3 is shorter than the requested limit 100, it is treated as the terminal page under the explicit-pagination operating rule.

Page counts:
- offset 0: 100 rows
- offset 100: 100 rows
- offset 200: 47 rows
- total: **247 rows**

The Bridge still returned `pagination=null` on every page, reproducing the known pagination-guidance gap.

## Semantic boundary

These totals are for the Ozon warehouse/FBO analytics surface returned by `/v2/analytics/stock_on_warehouses`.

They MUST NOT be presented as the seller's total FBO+FBS inventory. Earlier cross-operation evidence proved that large FBS stocks can exist outside this surface.

Primary sorting metric for the user's question is `free_to_sell_amount`. `reserved_amount` and `promised_amount` are shown separately and are not silently added to sellable stock.

## Final warehouse aggregation

Across 247 rows and 33 warehouses:

- total free-to-sell: **628**
- total reserved: **14**
- total promised: **54**

Sorted by `free_to_sell_amount` descending:

| Rank | Warehouse | Free to sell | Reserved | Promised |
|---:|---|---:|---:|---:|
| 1 | Санкт_Петербург_РФЦ | 101 | 0 | 0 |
| 2 | ХАБАРОВСК_2_РФЦ | 71 | 1 | 54 |
| 3 | ПУШКИНО_1_РФЦ | 57 | 0 | 0 |
| 4 | Екатеринбург_РФЦ_НОВЫЙ | 48 | 1 | 0 |
| 5 | РОСТОВ_НА_ДОНУ_2_РФЦ | 45 | 4 | 0 |
| 6 | НИЖНИЙ_НОВГОРОД_2_РФЦ | 36 | 0 | 0 |
| 7 | СПБ_ШУШАРЫ_РФЦ | 28 | 0 | 0 |
| 8 | ВАТУТИНКИ_РФЦ | 27 | 2 | 0 |
| 9 | НЕВИННОМЫССК_РФЦ | 25 | 0 | 0 |
| 10 | ВОРОНЕЖ_2_РФЦ | 20 | 0 | 0 |
| 11 | Ростов_на_Дону_РФЦ | 19 | 1 | 0 |
| 12 | КРАСНОЯРСК_СТАРЦЕВО_РФЦ | 17 | 0 | 0 |
| 13 | НОВОСИБИРСК_3_РФЦ | 15 | 0 | 0 |
| 14 | ХОРУГВИНО_РФЦ | 15 | 0 | 0 |
| 15 | Казань_РФЦ_НОВЫЙ | 14 | 1 | 0 |
| 16 | Новосибирск_РФЦ_НОВЫЙ | 14 | 1 | 0 |
| 17 | ТЮМЕНЬ_РФЦ | 14 | 0 | 0 |
| 18 | ЯРОСЛАВЛЬ_РФЦ | 14 | 0 | 0 |
| 19 | ПЕРМЬ_РФЦ | 12 | 0 | 0 |
| 20 | САРАТОВ_РФЦ | 7 | 1 | 0 |
| 21 | ПУШКИНО_2_РФЦ | 7 | 0 | 0 |
| 22 | УФА_РФЦ | 4 | 1 | 0 |
| 23 | ВОРОНЕЖ_РФЦ | 3 | 0 | 0 |
| 24 | ОМСК_РФЦ | 3 | 0 | 0 |
| 25 | СПБ_БУГРЫ_РФЦ | 3 | 0 | 0 |
| 26 | СПБ_КОЛПИНО_РФЦ | 3 | 0 | 0 |
| 27 | ВОЛГОГРАД_РФЦ | 1 | 0 | 0 |
| 28 | КАЛИНИНГРАД_МРФЦ | 1 | 0 | 0 |
| 29 | НИЖНИЙ_НОВГОРОД_РФЦ | 1 | 0 | 0 |
| 30 | НОВОРОССИЙСК_РФЦ | 1 | 0 | 0 |
| 31 | ПЕТРОВСКОЕ_РФЦ | 1 | 0 | 0 |
| 32 | ТВЕРЬ_РФЦ | 1 | 0 | 0 |
| 33 | ДОМОДЕДОВО_РФЦ | 0 | 1 | 0 |

## Business answer

The largest current free-to-sell FBO/warehouse balances are concentrated in:
1. Санкт_Петербург_РФЦ — 101
2. ХАБАРОВСК_2_РФЦ — 71
3. ПУШКИНО_1_РФЦ — 57
4. Екатеринбург_РФЦ_НОВЫЙ — 48
5. РОСТОВ_НА_ДОНУ_2_РФЦ — 45

`ХАБАРОВСК_2_РФЦ` is also operationally notable because it carries **54 promised units**, matching the old in-transit supply evidence discovered in STD-06. Promised stock is not counted as currently free-to-sell.

## STD-08 classification

Business result: `PASS`

Operational reliability: `PASS_PROVIDER_READS_WITH_REPRODUCED_PAGINATION_GUIDANCE_GAP`

Operator business steering: `NO`

Runs: `3`

Product gap:
`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_TO_INFER_PAGINATION_FROM_ROW_COUNT`

The model had to infer continuation from a full page twice because Bridge exposed `pagination=null` instead of an explicit continuation object.

## Next state

`STD_08_COMPLETE_STD_09_READY`
