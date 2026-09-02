# STD-06 Run 2 — Stock turnover triage

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Question: `Что сегодня в моём кабинете требует внимания в первую очередь?`

## Request

Operation: `stock_turnover_analytics`
Request ID: `451ef9a1-fbff-4f57-b16a-e015439a3c73`
Logical fingerprint: `6a5a8a63`
HTTP: `200`
Physical business requests: `1`
Automatic retry: `false`
Quota family: `seller.analytics_turnover_stocks.v1`
Requested: `limit=1000`, `offset=0`, `sku=[]`
Rows returned: `72`
Bridge pagination metadata: `null`

The response is a short page (`72 < 1000`), so under the endpoint's explicit offset contract this is treated as the completed current turnover snapshot for this triage run. No hidden pagination was used.

## Grade distribution

Turnover grade across 72 rows:
- `GRADES_CRITICAL`: 20
- `GRADES_RED`: 2
- `GRADES_YELLOW`: 34
- `GRADES_GREEN`: 15
- `GRADES_NOSALES`: 1

IDC grade across 72 rows:
- `GRADES_CRITICAL`: 9
- `GRADES_RED`: 2
- `GRADES_YELLOW`: 21
- `GRADES_GREEN`: 39
- `GRADES_NOSALES`: 1

## Highest overstock / slow-turnover signals

Largest turnover values among critical rows:
1. SKU `2186852750` — Козерог (Античность): current_stock `8`, turnover `794`, IDC `400`, both `GRADES_CRITICAL`.
2. SKU `1640326230` — Знич: current_stock `9`, turnover `722`, IDC `450`, both `GRADES_CRITICAL`.
3. SKU `2184168890` — Хорс: current_stock `7`, turnover `596`, IDC `350`, both `GRADES_CRITICAL`.
4. SKU `2271246783` — Козерог (Символы): current_stock `4`, turnover `467`, IDC `200`, both `GRADES_CRITICAL`.
5. SKU `1720155616` — Рыбы: current_stock `11`, turnover `442.67`, IDC `220`, both `GRADES_CRITICAL`.
6. SKU `2186848313` — Рыбы (Античность): current_stock `4`, turnover `385`, IDC `200`, both `GRADES_CRITICAL`.
7. SKU `1640334195` — Всеславец: current_stock `5`, turnover `382`, IDC `250`, both `GRADES_CRITICAL`.
8. SKU `2186846833` — Водолей (Античность): current_stock `12`, turnover `337.67`, IDC `240`, both `GRADES_CRITICAL`.
9. SKU `2271251938` — Овен (Символы): current_stock `7`, turnover `321.5`, IDC `233.33`, both `GRADES_CRITICAL`.
10. SKU `2184133137` — Макошь: current_stock `6`, turnover `294`, turnover `GRADES_CRITICAL`.

One explicit no-sales row:
- SKU `2186802133` — Весы (Античность): current_stock `7`, `ads=0`, IDC/turnover `null`, both `GRADES_NOSALES`.

Business implication: these SKUs should not be blindly replenished; they are candidates for overstock/slow-turnover action, promotion/content/price review, or inventory redistribution depending on later evidence.

## Zero-current-stock signals

Eight rows returned `current_stock=0`:
- `1611643847` — Гунгнир; turnover `48.92`, green.
- `1720124782` — Стрелец; turnover `36.83`, green.
- `1720153914` — Рак; turnover `145.4`, yellow.
- `1720160556` — Скорпион; turnover `223.5`, critical.
- `2186836116` — Скорпион (Античность); turnover `17`, green.
- `2186857668` — Лев (Античность); turnover `40.71`, green.
- `2271210394` — Близнецы (Символы); turnover `52.78`, green.
- `2559437928` — Чур; turnover `25.78`, green.

High-commercial-impact members from prior STD-03 seven-day sales:
- `2559437928` Чур: `20,052 RUB / 12 units` over 2026-08-26..2026-09-01.
- `1720124782` Стрелец: `13,600 RUB / 8 units` over the same period.

These are priority replenishment/distribution checks because recent demand exists.

## Important cross-operation semantic correction

Do **not** interpret `stock_turnover_analytics.current_stock=0` as proof that the product is completely unavailable across all selling schemes.

STD-05 already proved that stock surfaces differ. Example:
- `2559437928` Чур had `0` FBO stock in detailed product info but `39` FBS units.
- `1720124782` Стрелец had `0` FBO stock but `43` FBS units.

Therefore Run 2 indicates FBO/current-turnover stock risk and assortment imbalance, not necessarily a total marketplace stockout. Weak models must not collapse these stock surfaces into one universal quantity.

## Current STD-06 triage state

Rating branch from Run 1:
- no penalty-score breach;
- FBS complaints 0;
- product rating 4.98;
- price-index status healthy;
- no critical rating issue found.

Inventory/turnover branch from Run 2:
- materially actionable slow-turnover/overstock cluster exists;
- at least two recent high-selling SKUs show zero current turnover-stock and require replenishment/distribution verification;
- current-stock semantics require cross-surface interpretation.

Next triage surface: supply-order status counts. Use `supply_order_status_counter` to determine whether overdue/rejected/in-transit/acceptance supply states change today's priorities before producing the final ordered action list.

## Classification

`STD_06_IN_PROGRESS / TURNOVER_AND_FBO_STOCK_RISKS_FOUND / SUPPLY_STATUS_TRIAGE_NEXT`
