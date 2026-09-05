# STD-17 post-repair Run 4 — CPO daily effectiveness

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Canonical question: `Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?`

## Command

`OZON_API_V1`
`{"operation":"performance_daily","params":{"campaignIds":["10384311"],"dateFrom":"2026-08-29","dateTo":"2026-09-04"}}`

## Runtime evidence

- request_id: `b374c17b-a6b8-40af-96ba-1103c06dc67d`
- HTTP 200
- external_request_executed=true
- exact_request_preserved=true
- command_transformed=false
- logical_business_result_count=1
- physical_business_request_count=1

## Provider rows

Campaign `10384311`, title on this surface `Продвижение в поиске — все товары`:

| date | spend RUB | orders | ordersMoney RUB |
|---|---:|---:|---:|
| 2026-08-29 | 2040.00 | 12 | 20400.00 |
| 2026-08-30 | 3737.60 | 22 | 37376.00 |
| 2026-08-31 | 1948.20 | 12 | 19482.00 |
| 2026-09-01 | 2318.80 | 14 | 23188.00 |
| 2026-09-02 | 1870.00 | 11 | 18700.00 |
| 2026-09-03 | 2550.00 | 15 | 25500.00 |
| 2026-09-04 | 3369.40 | 20 | 33694.00 |

Seven-day totals:

- spend = `17,834.00 RUB`
- orders = `106`
- ordersMoney = `178,340.00 RUB`
- aggregate DRR = `10.00%`
- average spend per order = `168.25 RUB`

The same campaign id appeared in `performance_expense` under the label `Оплата за заказ: выбранные товары`; the identifier, not the mutable display label, is the join key.

## Interpretation

This closes the major CPO ambiguity from STD-16/17. Campaign `10384311` is the largest spend line, but it is not evidence of advertising waste: its seven-day spend-to-attributed-order-money ratio is exactly 10.0%.

Run 3 proved 74 current search-promo SKU with current bid 10% / 170 RUB for the common 1700 RUB price, but that surface does not expose per-SKU paid orders. Therefore the 17,834 RUB cannot be distributed across those 74 SKU without unsupported attribution.

Checkpoint:
`STD_17_CPO_10384311_106_ORDERS_178340_RUB_10_PERCENT_DRR_NO_PER_SKU_ATTRIBUTION`
