# STD-17 post-repair Run 3 — CPO product set

Date: 2026-09-05
Canonical question: `Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?`
Branch: `repair/ozon-date-contract-2026-09-04`.

## Command

`OZON_API_V1`
`{"operation":"performance_search_promo_products","params":{"page":1,"pageSize":100}}`

## Transport / planner evidence

- request_id: `d2bab1cf-f0bc-491e-8370-67784bb191a0`
- operation: `performance_search_promo_products`
- HTTP 200
- external_request_executed: true
- exact_request_preserved: true
- command_transformed: false
- logical_business_result_count: 1
- physical_business_request_count: 1

## Provider result

- `total = 74`
- requested `pageSize = 100`, therefore the returned first page bounds the complete current CPO product set.
- all returned products identify campaign `10384311` in `hint.campaignId`.
- all returned products have `searchPromoStatus=true` and `isSearchPromoAvailable=true`.
- current returned CPO bid is `10` with `bidPrice = 170 RUB` for the products in the set.
- most products expose a previous bid of `23` / `391 RUB`; the notable exception in this snapshot is SKU `1636048691` (`Печать Велеса`), whose returned previous bid is `0` and was updated on `2026-09-03T01:30:49.111546Z`.

Examples of current CPO products include:
- `2271240621` — Знак зодиака «Дева» (Символы)
- `1720124782` — Знак зодиака «Стрелец»
- `1636048691` — Печать Велеса
- `2559748332` — Герб России
- `2326866320` — Спаси и Сохрани
- `1640326205` — Колядник
- `1602722942` — Вегвизир
- `1611643847` — Гунгнир

The endpoint also returns current/previous-week views and visibility index, but it does **not** return paid-order count, sales, per-SKU CPO spend, or DRR.

## Boundary

STD-16 established seven-day campaign `10384311` spend of `17,834.00 RUB` for `2026-08-29..2026-09-04`.

This Run 3 proves which 74 SKUs are currently in the pay-per-order promotion and their current CPO bid, but it does **not** support allocating the `17,834.00 RUB` expense across those SKUs or declaring individual CPO SKUs wasteful.

Do not divide total expense by current `170 RUB` bid to infer orders: the endpoint exposes previous bid history and the seven-day spend interval can cross bid changes; exact per-order attribution is not provided here.

Next evidence should test whether `performance_daily` for campaign `10384311` exposes campaign-level outcome metrics for the same seven completed days.

Checkpoint:
`STD_17_RUN3_CPO_74_PRODUCT_SET_CURRENT_BID_10_PERCENT_170_RUB_PER_ORDER_PER_SKU_SPEND_AND_OUTCOME_NOT_EXPOSED_DAILY_CPO_OUTCOME_NEXT`
