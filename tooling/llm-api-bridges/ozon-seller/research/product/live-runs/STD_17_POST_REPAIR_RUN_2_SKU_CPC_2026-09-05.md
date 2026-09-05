# STD-17 post-repair Run 2 — SKU CPC evidence

Date: 2026-09-05
Canonical question: `Какие кампании и товары сейчас больше всего съедают рекламный бюджет и где результат слабый?`
Branch: `repair/ozon-date-contract-2026-09-04`

## Run 2

Operation: `performance_sku_statistics`
Request id: `b1241f77-bc01-48b2-b98d-23913042f9eb`
Date window: `2026-09-04..2026-09-04`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / performance_provider_not_seller_subscription`

The request covered the 20 CPC campaign IDs that spent money in STD-16 / STD-17 Run 1. The endpoint returned a real SKU-level breakdown with campaignId, sku, views, clicks, expense, orders, sales, modelOrders, modelSales and drr.

## Same-day spend frame

The 20 CPC campaigns spent `3,503.15 RUB` on 2026-09-04 (carry-forward from the same-day rows in STD-16). Run 2 gives the product attribution for that same day.

Provider outcomes must be read with both direct and model-attributed outcomes:
- `orders/sales` = direct provider outcome fields;
- `modelOrders/modelSales` = separately exposed model-attributed outcomes.

Do not label a row as pure zero-result if either outcome family is non-zero.

## Highest zero-result SKU rows on 2026-09-04

Strictly using rows with both `orders=0` and `modelOrders=0`, the largest single campaign×SKU expenses include:

- campaign `37130607`, SKU `1636048691`: `462.01 RUB`, `66` clicks, `7` carts, `0` direct orders, `0` model orders;
- campaign `37130631`, SKU `1720124782`: `166.80 RUB`, `139` clicks, `3` carts, `0/0` orders;
- campaign `37130620`, SKU `1640326205`: `122.79 RUB`, `22` clicks, `1` cart, `0/0` orders;
- campaign `37130619`, SKU `2183921966`: `117.05 RUB`, `24` clicks, `1` cart, `0/0` orders;
- campaign `37130617`, SKU `1602722942`: `97.48 RUB`, `19` clicks, `4` carts, `0/0` orders;
- campaign `37130638`, SKU `2326866320`: `76.58 RUB`, `26` clicks, `5` carts, `0/0` orders;
- campaign `37130640`, SKU `1602722942`: `71.90 RUB`, `29` clicks, `2` carts, `0/0` orders;
- campaign `37130644`, SKU `1640326205`: `67.31 RUB`, `27` clicks, `3` carts, `0/0` orders;
- campaign `37130594`, SKU `1602715556`: `65.23 RUB`, `13` clicks, `1` cart, `0/0` orders;
- campaign `37130624`, SKU `2559748332`: `51.71 RUB`, `23` clicks, `6` carts, `0/0` orders.

## Cross-campaign SKU view

Several SKUs consumed budget in more than one CPC placement on the same day:

- SKU `1640326205`: `122.79 + 67.31 = 190.10 RUB`, zero direct/model orders across both rows;
- SKU `1602722942`: `97.48 + 71.90 = 169.38 RUB`, zero direct/model orders across both rows;
- SKU `2183921966`: `117.05 + 35.16 = 152.21 RUB`, zero direct/model orders across both rows;
- SKU `2326866320`: `15.88 + 76.58 = 92.46 RUB`, zero direct/model orders across both rows;
- SKU `1602715556`: `65.23 + 5.89 = 71.12 RUB`, zero direct/model orders across both rows;
- SKU `1640330072`: `34.35 + 11.91 = 46.26 RUB`, zero direct/model orders across both rows.

SKU `1636048691` is different: it spent `462.01 RUB` with zero orders in campaign `37130607`, but `789.94 RUB` in campaign `37130634` produced one direct order / `1,700 RUB` sales. Across those two CPC rows the same SKU spent `1,251.95 RUB` for one direct order, an effective spend-to-sales ratio of about `73.64%`. Therefore the product itself must not be called a total zero-result SKU; the problem is placement/campaign-specific and still expensive in aggregate.

Likewise SKU `2559748332` spent `138.94 RUB` with one direct order in campaign `37130595` and `51.71 RUB` with zero orders in campaign `37130624`; aggregate same-day spend `190.65 RUB` against `1,700 RUB` direct sales is about `11.21%`. This is evidence against simplistic per-row labeling.

## Aggregate zero-result pressure

Using the `3,503.15 RUB` same-day CPC spend and excluding rows that had either direct orders or modelOrders, approximately `2,505.78 RUB` of spend (about `71.53%`) sat on rows with neither direct nor model-attributed orders on 2026-09-04.

This is a one-day diagnostic, not a seven-day verdict. The endpoint is intentionally near-current-only, so product-level claims are scoped to 2026-09-04 while campaign-level claims from Run 1 remain scoped to 2026-08-29..2026-09-04.

## CPO boundary

Campaign `10384311` (`Оплата за заказ: выбранные товары`) spent `17,834 RUB` over the seven-day STD-16 window but is absent from both CPC endpoints used in STD-17 so far. It must not be folded into the CPC ranking.

Next step inside STD-17: inspect `performance_search_promo_products` for the current CPO product set, then keep any CPO attribution limitations explicit rather than invent historical SKU spend allocation.

Checkpoint:
`STD_17_RUN2_SKU_CPC_PASS_CPO_PRODUCT_SET_NEXT`
