# STD-17 post-repair Run 1 — campaign efficiency result

Date: 2026-09-05
Canonical question: `Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Run

Operation: `performance_campaign_product`
Params: `{"dateFrom":"2026-08-29","dateTo":"2026-09-04"}`
Request id: `b49bd998-c749-4765-bd75-57b654ab7967`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / performance_provider_not_seller_subscription`

## Provider shape

The response contains a broad historical campaign catalog plus current-period metrics. The relevant current rows are the 20 `running` CPC campaigns that have non-zero spend in this seven-day period.

Important live boundary: despite the operation registry purpose describing campaign × product statistics, this live JSON response exposes campaign-level rows only. It does not expose SKU/product identity in the returned current rows. Therefore this run can rank campaign efficiency but cannot truthfully rank products.

Also, the largest STD-16 expense row, campaign `10384311` (`Оплата за заказ: выбранные товары`), is absent from this CPC campaign-product response. It is a separate CPO/search-promo contour and must not be mixed into CPC efficiency ranking without an appropriate surface.

## CPC aggregate for 2026-08-29..2026-09-04

Across the 20 current spending CPC campaign rows:

- spend: `25,974.41 RUB`;
- orders: `49`;
- ordersMoney: `82,358.00 RUB`;
- aggregate spend/ordersMoney ratio: `31.54%`;
- six campaigns have `orders=0` while spending a combined `4,390.24 RUB` = `16.90%` of CPC spend.

STD-16 expense minus CPO campaign `10384311` gives `25,974.47 RUB` CPC spend. Difference vs this endpoint is `0.06 RUB`, a negligible endpoint/snapshot rounding difference, but it is preserved rather than silently normalized.

## Weakest current CPC evidence

### Zero-order spend

- `37130638` — `Православные 27.08.2026`, search-and-category: spend `1,870.17`, orders `0`, toCart `14`.
- `37130629` — `Зод Символы 27.08.2026`, search-and-category: spend `888.17`, orders `0`, toCart `23`.
- `37130627` — `Зод Античные 27.08.2026`, search-and-category: spend `668.74`, orders `0`, toCart `21`.
- `37130624` — `Герб 27.08.2026`, search-and-category: spend `597.85`, orders `0`, toCart `23`.
- `37130594` — `Восточные 27.08.2026`, top-promotion: spend `309.66`, orders `0`, toCart `6`.
- `37130622` — `Восточные 27.08.2026`, search-and-category: spend `55.65`, orders `0`, toCart `3`.

Zero orders is not recorded as literally zero commercial intent because several rows have add-to-cart events and attribution timing may differ. It is evidence of weak observed order result for the closed seven-day window.

### Highest DRR among campaigns with orders

- `37130644` — `Слав Символы 27.08.2026`, search-and-category: spend `1,591.18`, orders `1`, ordersMoney `1,394.00`, DRR `114.1%`.
- `37130631` — `Зод Чер 27.08.2026`, search-and-category: spend `1,752.13`, orders `1`, ordersMoney `1,700.00`, DRR `103.1%`.
- `37130595` — `Герб 27.08.2026`, top-promotion: spend `1,626.66`, orders `1`, ordersMoney `1,700.00`, DRR `95.7%`.
- `37130604` — `Зод Символы 27.08.2026`, top-promotion: spend `1,077.51`, orders `1`, ordersMoney `1,700.00`, DRR `63.4%`.
- `37130634` — `Печать Реком 21,03 27.08.2026`, search-and-category: spend `3,871.74`, orders `5`, ordersMoney `8,500.00`, DRR `45.5%`.

These are observed advertising DRR values, not net-margin profitability. No profit/loss claim is made without cost and marketplace fee economics.

## Stronger cohort references

Examples with materially lower observed DRR:

- `37130600` — `Зод Античные 27.08.2026`, top-promotion: DRR `9.9%`.
- `37130617` — `Скандинавские 27.08.2026`, top-promotion: `12.1%`.
- `37130606` — `Зод Чер 27.08.2026`, top-promotion: `14.4%`.
- `37130609` — `Православные 27.08.2026`, top-promotion: `15.4%`.
- `37130619` — `Слав Боги 27.08.2026`, top-promotion: `15.6%`.
- `37130620` — `Слав Символы 27.08.2026`, top-promotion: `16.5%`.
- `37130642` — `Слав Боги 27.08.2026`, search-and-category: `16.8%`.

This contrast is enough to identify where result is weak relative to current account peers without inventing an arbitrary profitability threshold.

## Product-level recovery

Because live `performance_campaign_product` did not expose SKU identity, use `performance_sku_statistics` for the near-current product-level slice that the current registry actually supports.

Registry constraint: `dateFrom` may not be earlier than the previous day. Therefore use the latest completed day `2026-09-04` and pass the 20 current CPC campaign IDs explicitly. This is a one-day product drill-down, not a seven-day replacement.

CPO campaign `10384311` remains a separate contour and should be handled via search-promo/CPO surfaces after the CPC SKU drill-down.

Business answerability: `PARTIAL_PASS_CAMPAIGN_LEVEL_COMPLETE_PRODUCT_LEVEL_PENDING`.
Operational reliability: `PASS_WITH_LIVE_RESPONSE_GRANULARITY_MISMATCH_TO_REGISTRY_PURPOSE`.

Checkpoint:
`STD_17_RUN1_CPC_CAMPAIGN_EFFICIENCY_COMPLETE_SKU_NEAR_CURRENT_DRILLDOWN_NEXT_CPO_SEPARATE`