# STD-06 Run 6 — stale IN_TRANSIT supply bundle

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Test: `STD-06 — Что сегодня в моём кабинете требует внимания в первую очередь?`
Operation: `supply_order_bundle`
Request ID: `16b2d0c8-15f9-483c-bedf-5a9a6a8f44c6`
HTTP: 200
Physical business requests: 1

## Context

Run 5 identified order `122149074` / order number `2000062599609` as `IN_TRANSIT`.

- created: `2026-08-10T09:01:34.061334Z`
- last state update: `2026-08-12T08:18:31.704993Z`
- original timeslot: `2026-08-11T14:00:00Z` → `2026-08-11T15:00:00Z`
- drop-off: `ЗЛАТОУСТ_89`
- bundle: `019feae9-0fbe-75af-8f63-b9df1ca38840`

On 2026-09-02 the order is still `IN_TRANSIT`, making it a materially stale supply state requiring operator attention. This is not called a proven loss; it is classified as a potentially stuck/stale supply until Ozon resolves or updates it.

## Bundle contents

Total: **54 units across 9 SKUs**; `has_next=false`.

| SKU | Product | Qty |
|---|---|---:|
| 2559748332 | Герб России | 2 |
| 2559437928 | Чур | 5 |
| 1636048691 | Печать Велеса | 31 |
| 2183985513 | Перун | 2 |
| 2184234912 | Звезда Лады | 2 |
| 1640330072 | Громовик | 2 |
| 1640251697 | Алатырь (Крест Сварога) | 5 |
| 2326866320 | Спаси и Сохрани | 2 |
| 1602717077 | Шлем ужаса — Эгисхьяльм | 3 |

## Cross-surface business relevance

The 54 units are not equally urgent:

- `Чур` (5 units in the stale supply) is a recent top seller: in STD-03 it generated `20,052 RUB / 12 units` over the latest 7-day period. Run 2 turnover surface currently showed `current_stock=0`, but prior product-info evidence showed FBS stock exists. Therefore this is specifically an FBO/distribution risk, not a proven total stockout.
- `Печать Велеса` contributes 31/54 units (~57.4%) of the stale supply but already has substantial current stock in other surfaces, so the stale shipment is less urgent for immediate availability of this SKU.
- `Звезда Лады`, `Алатырь`, `Громовик`, `Перун` and the remaining SKUs add smaller but real inventory exposure.

## STD-06 final prioritization supported by Runs 1–6

1. **Priority 1 — investigate/escalate stale supply `122149074` / `2000062599609`.** It has remained `IN_TRANSIT` since 2026-08-12 and contains 54 units. Business urgency is increased by the presence of `Чур` and several lower-stock SKUs.
2. **Priority 2 — act on critically slow-turning inventory.** Run 2 found 20 `GRADES_CRITICAL` turnover SKUs and one `GRADES_NOSALES` SKU. Highest turnover examples: Козерог (Античность) `794`, Знич `722`, Хорс `596`, Козерог (Символы) `467`, Рыбы `442.67`.
3. **Priority 3 — complete four fresh `DATA_FILLING` supply orders before deadline.** All four were created on 2026-08-30 with data-filling deadline `2026-09-05T06:00:00Z`; they are not stale today but are upcoming work.
4. Seller ratings/penalties are currently not an urgent issue: Run 1 showed no penalty-score exceedance, FBS complaints 0, product rating 4.98 and healthy price-index state.
5. No supply rejection/report-rejection/acceptance emergency was found in Run 3.

## Final classification

Business answer: `PASS`
Operational reliability: `PASS_ALL_STD06_PROVIDER_READS`
Operator intervention required for AI planning: `NO`

Product-logic success: Sol selected and correlated multiple independent surfaces (ratings → turnover → supply status → active-order list → order details → bundle contents) without reducing the question to one generic analytics endpoint.

Final marker:
`STD_06_PASS_PRIORITY1_STALE_IN_TRANSIT_SUPPLY_PRIORITY2_CRITICAL_TURNOVER_PRIORITY3_UPCOMING_DATA_FILLING`
