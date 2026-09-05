# STD-07 post-repair Run 1 — stock turnover

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Business question: `Какие товары у меня скоро закончатся, какие лежат слишком долго, что пополнять?`

## Provider evidence

- operation: `stock_turnover_analytics`
- request id: `df2beebf-fa3d-40ed-abbe-c9dbe30d03ee`
- provider: Ozon Seller API
- method: `POST`
- path alias: `stock_turnover_analytics`
- HTTP: `200`
- external request executed: `true`
- capability probe: not needed / not performed
- exact request preserved: `true`
- command transformed: `false`
- logical business result count: `1`
- physical business request count: `1`
- automatic retry: `false`
- quota family: `seller.analytics_turnover_stocks.v1`
- minimum interval: `60000 ms`
- pagination metadata: `null`

Classification: `STD_07_RUN_1_PASS`.

## Semantic rule

`stock_turnover_analytics.current_stock` is not sufficient evidence of total sellable FBO+FBS inventory. A zero or low value is only a replenishment candidate until a richer current product/stock surface confirms FBO + FBS inventory.

`GRADES_CRITICAL`, `GRADES_RED`, and `GRADES_NOSALES` identify slow/no-sales inventory that must not be replenished blindly.

## Candidate set for Run 2

Selection rule: all rows with `current_stock=0`, plus nonzero low-cover rows with `idc <= 20`.

24 unique SKU candidates:

`1611643847, 1640330072, 1720124782, 1720141903, 1720144370, 1720148880, 1720153914, 1720160556, 2183921966, 2186836116, 2186857668, 2271210394, 2559437928, 2559748332, 1640251697, 1640306007, 1842444165, 2183985513, 1720151850, 1602717077, 1602722942, 2271188511, 1720137256, 2186766628`.

Highest immediate turnover-surface risk signals include:

- `2559437928` Чур — current 1, ADS 0.70, IDC 1.43, GREEN;
- `2559748332` Герб России — current 1, ADS 0.53, IDC 1.89, GREEN;
- `1640251697` Алатырь — current 2, ADS 0.73, IDC 2.74, GREEN;
- `1640306007` Молвинец — current 2, ADS 0.30, IDC 6.67, GREEN;
- `1842444165` Родимич — current 2, ADS 0.20, IDC 10, GREEN;
- `2183985513` Перун — current 3, ADS 0.28, IDC 10.71, GREEN;
- `1720151850` Лев — current 2, ADS 0.18, IDC 11.11, GREEN;
- zero-current rows include Гунгнир, Громовик, Стрелец, Водолей, Дева, Овен, Рак, Скорпион, Сварог, Скорпион (Античность), Лев (Античность), Близнецы (Символы).

## Slow / do-not-replenish examples

- `2186852750` Козерог (Античность): IDC 400, turnover 794, CRITICAL;
- `1640326230` Знич: IDC 450, turnover 723, CRITICAL;
- `2184168890` Хорс: IDC 300, turnover 595, CRITICAL;
- `2271246783` Козерог (Символы): IDC 200, turnover 466, CRITICAL;
- `1720155616` Рыбы: IDC 220, turnover 441.67, CRITICAL;
- `1640334195` Всеславец: IDC 250, turnover 381, CRITICAL;
- `2186846833` Водолей (Античность): IDC 220, turnover 336.67, CRITICAL;
- `2271251938` Овен (Символы): IDC 233.33, turnover 320.5, CRITICAL;
- `2186802133` Весы (Античность): NOSALES with current stock 7.

## Next step

Run 2 must use `seller_product_info_list` with exactly one identifier group. The certified artifact contract allows `offer_id`, `product_id`, or `sku`; for these selected marketplace SKU identifiers use `params.sku`.

After Run 2, calculate free FBO and total FBO+FBS stock, then continue immediately to fresh inbound `supply_order_bundle` correlation.

Checkpoint: `STD_07_POST_REPAIR_RUN1_PASS_RUN2_TOTAL_FBO_FBS_CONFIRMATION_NEXT`.
