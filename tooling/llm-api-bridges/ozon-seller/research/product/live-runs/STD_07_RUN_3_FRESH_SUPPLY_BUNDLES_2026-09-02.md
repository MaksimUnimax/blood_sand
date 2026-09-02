# STD-07 Run 3 — Fresh Supply Bundle Coverage

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Business question: `Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?`

## Request

Operation: `supply_order_bundle`
Request id: `495c6304-f86d-4f17-861c-0691336d761f`
HTTP: `200`
Physical business requests: `1`

Queried the four fresh DATA_FILLING bundles planned for 2026-09-05:
- `01a0524b-6726-739e-bcc3-d3c751d56138`
- `01a05251-09ff-7557-b613-7437b9024b8d`
- `01a05259-34f7-7059-b226-492671edfc84`
- `01a05264-2b43-7b21-b08c-c93a3d6df65f`

Provider returned `22` product rows and `has_next=false`.

## Fresh planned quantities

| SKU | Product | Planned qty |
|---|---|---:|
| 1720144370 | Дева | 1 |
| 2559748332 | Герб России | 6 |
| 2559437928 | Чур | 22 |
| 1630040194 | Чернобог | 3 |
| 2184098058 | Стрибог | 2 |
| 2183921966 | Сварог | 7 |
| 1842444165 | Родимич | 1 |
| 1636048691 | Печать Велеса | 5 |
| 2183985513 | Перун | 6 |
| 1640306007 | Молвинец | 2 |
| 2184199958 | Мара | 1 |
| 1640326205 | Колядник | 7 |
| 2184234912 | Звезда Лады | 4 |
| 2184932293 | Даждьбог | 1 |
| 1640330072 | Громовик | 11 |
| 1636041142 | Велес | 6 |
| 1640251697 | Алатырь | 21 |
| 1943215793 | Молитва Иоанна Златоуста | 1 |
| 1602717077 | Шлем ужаса | 5 |
| 1623753672 | Древо Жизни | 3 |
| 1611643847 | Гунгнир | 1 |
| 1602722942 | Вегвизир | 10 |

## Cross-run interpretation

Run 1 (`stock_turnover_analytics`) identified two materially different business groups:
- low-FBO / low-IDC candidates for replenishment/distribution;
- `CRITICAL/RED/NOSALES` slow-turnover products that should not be replenished blindly.

Run 2 (`seller_product_info_list`) proved that the low-FBO candidates generally still have large FBS stock (roughly 39–50 units), so there is no broad total-stock procurement emergency. The main issue is fulfillment-source allocation, especially FBO.

Run 3 proves that most of the strongest low-FBO candidates are already included in the fresh 2026-09-05 supply plan:
- Чур `22`;
- Алатырь `21`;
- Громовик `11`;
- Сварог `7`;
- Герб России `6`;
- Перун `6`;
- Шлем ужаса `5`;
- Молвинец `2`;
- Родимич `1`;
- plus several others.

Therefore the correct commercial recommendation is **not** to create duplicate replenishment for those SKUs before the existing supply plan is completed.

## Highest uncovered FBO/distribution candidates

Using Run1 demand (`ads`) and Run2 free FBO stock (`present - reserved`), the strongest uncovered candidates include:

1. `1720141903` Водолей — free FBO `1`, ads `0.20/day`, about `5` FBO days, FBS `43`, not present in the fresh supply bundles.
2. `1720148880` Овен — free FBO `1`, ads `0.10/day`, about `10` FBO days, FBS `41`, not present in fresh supply.
3. `1720124782` Стрелец — FBO `0`, ads `0.10/day`, FBS `43`, not present in fresh supply.
4. `2186857668` Лев (Античность) — FBO `0`, ads `0.12/day`, FBS `50`, not present in fresh supply.
5. `2271210394` Близнецы (Символы) — FBO `0`, ads `0.15/day`, FBS `41`, not present in fresh supply.

Lower urgency / monitor:
- `2186766628` Телец (Античность): FBO `1`, ads `0.05/day` ≈20 days, FBS `41`, no fresh supply.
- `1720153914` Рак: FBO `0`, FBS `42`, ads `0.08/day`, but turnover grade is YELLOW and current replenishment urgency is below the green/low-days candidates.
- `1720160556` Скорпион: FBO `0`, FBS `49`, but turnover grade is CRITICAL; do not replenish FBO blindly before demand review.

## Do-not-replenish / slow-turnover group

Run1 already established a material overstock/slow-turnover group. Highest examples:
- Козерог (Античность) turnover `794`, IDC `400`, CRITICAL;
- Знич `722 / 450`, CRITICAL;
- Хорс `596 / 350`, CRITICAL;
- Козерог (Символы) `467 / 200`, CRITICAL;
- Рыбы `442.67 / 220`, CRITICAL;
- Весы (Античность): `NOSALES` with stock.

These should not receive new stock until demand/price/content/advertising causes are reviewed.

## Important existing in-transit caveat

The old stale supply `122149074` remains `IN_TRANSIT` and contains additional quantities including:
- Чур `5`;
- Алатырь `5`;
- Громовик `2`;
- Герб России `2`;
- Перун `2`;
- Звезда Лады `2`;
- Печать Велеса `31`;
- and others.

Those units must not be counted as safely available until the stale supply incident is resolved.

## Final STD-07 business answer

- No broad procurement emergency: total FBO+FBS stock remains substantial for tested low-FBO candidates.
- Primary action is FBO allocation, not new purchasing.
- Complete the fresh 2026-09-05 supplies; do not duplicate their quantities.
- Highest uncovered FBO candidates for the next supply: Водолей, Овен, Стрелец, Лев (Античность), Близнецы (Символы).
- Do not replenish CRITICAL/RED/NOSALES slow-turnover products until demand-side causes are addressed.
- Continue treating the stale old IN_TRANSIT supply as unavailable/risky until resolved.

Classification: `PASS`
Operational reliability: `PASS_ALL_STD07_PROVIDER_READS`
Operator business steering: `NO`

## Product/Bridge implication

This test reinforces the existing cross-operation stock-semantics requirement:
`stock_turnover_analytics.current_stock` cannot be interpreted as total sellable inventory. A safe replenishment answer requires correlation across turnover + FBO/FBS stock + inbound supply content.

Principle:
`DO_NOT_RECOMMEND_REPLENISHMENT_FROM_SINGLE_STOCK_SURFACE`

## Checkpoint

`STD_07_COMPLETE_REPLENISHMENT_PLAN_RECONCILED_WITH_FBO_FBS_AND_INBOUND_SUPPLY`
