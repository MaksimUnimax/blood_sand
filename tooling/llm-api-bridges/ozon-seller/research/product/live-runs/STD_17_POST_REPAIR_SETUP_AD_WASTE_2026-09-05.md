# STD-17 post-repair setup — advertising waste

Date: 2026-09-05
Canonical question: `Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?`
Branch: `repair/ozon-date-contract-2026-09-04`.

## Carry-forward authority from STD-16

STD-16 closed the seven completed days `2026-08-29..2026-09-04` with total spend `43,808.47 RUB` and 21 campaign IDs that actually spent money.

Spend alone is not sufficient to call a campaign or SKU wasteful. STD-17 must add outcome metrics in the same period and preferably at campaign × product level.

## Correct first surface

Use `performance_campaign_product` (`GET /api/client/statistics/campaign/product/json`). Registry purpose: advertising statistics in campaign × product breakdown.

Use the same completed seven-day range as STD-16 so spend and effectiveness are directly comparable:

- `dateFrom=2026-08-29`
- `dateTo=2026-09-04`

Do not use `performance_sku_statistics` for this seven-day job: current registry marks that operation as near-current-only with `dateFrom` not earlier than the previous day.

## Run 1 next

`OZON_API_V1`
`{"operation":"performance_campaign_product","params":{"dateFrom":"2026-08-29","dateTo":"2026-09-04"}}`

Required evidence:

- campaign id/title where exposed;
- SKU/product identity;
- spend and outcome metrics returned by provider;
- enough data to distinguish high spend from weak result rather than labelling spend itself as waste.

If the response is too broad or provider requires campaign filtering, recover inside the same job using the already known 21 spending campaign IDs from STD-16.

Checkpoint:
`STD_17_POST_REPAIR_CAMPAIGN_PRODUCT_SEVEN_DAY_STATS_NEXT`
