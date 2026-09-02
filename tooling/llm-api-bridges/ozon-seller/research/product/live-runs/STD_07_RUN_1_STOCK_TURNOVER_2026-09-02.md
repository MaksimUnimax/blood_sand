# STD-07 Run 1 — Stock turnover ranking

Date: 2026-09-02
Question: `Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?`

Operation: `stock_turnover_analytics`
Request id: `94e84cdc-570a-49dc-8a7b-6479e92b2645`
Fingerprint: `6a5a8a63`
HTTP: `200`
External request executed: `true`
Physical business requests: `1`
Pagination: `null`
Quota family: `seller.analytics_turnover_stocks.v1`, min interval 60000 ms.

## Interpretation rule

This operation is useful for turnover / days-cover ranking, but prior STD-05 cross-operation evidence proved that its `current_stock` must not be treated as total FBO+FBS sellable stock. Therefore:
- `GRADES_CRITICAL/RED/NOSALES` is sufficient evidence to identify products that should not be blindly replenished;
- low/zero `current_stock` is only a replenishment candidate until total current FBO+FBS stock is checked with a richer product/stock surface.

Observed arithmetic is consistent with `idc ≈ current_stock / ads`, i.e. days of stock cover on the returned stock contour. Examples: 3 / 0.73 ≈ 4.11 for SKU 1640251697; 191 / 4.32 ≈ 44.21 for SKU 1636048691.

## Highest-priority low-cover candidates from Run 1

Zero-current-stock signals (must verify total FBO+FBS before calling stockout):
- 1611643847 Гунгнир — current_stock 0, ads 0.22, IDC 0, turnover 48.92 GREEN.
- 1720124782 Стрелец — current_stock 0, ads 0.10, IDC 0, turnover 36.83 GREEN.
- 1720153914 Рак — current_stock 0, ads 0.08, IDC 0, turnover 145.4 YELLOW.
- 1720160556 Скорпион — current_stock 0, ads 0.03, IDC 0, turnover 223.5 CRITICAL (do not automatically replenish despite zero FBO signal).
- 2186836116 Скорпион (Античность) — current_stock 0, ads 0.09, IDC 0, turnover 17 GREEN.
- 2186857668 Лев (Античность) — current_stock 0, ads 0.12, IDC 0, turnover 40.71 GREEN.
- 2271210394 Близнецы (Символы) — current_stock 0, ads 0.15, IDC 0, turnover 52.78 GREEN.
- 2559437928 Чур — current_stock 0, ads 0.77, IDC 0, turnover 25.78 GREEN; recent sales context makes this especially important.

Low IDC candidates (≤20 days on this contour):
- 1640251697 Алатырь — 3 stock / ADS 0.73 / IDC 4.11 / turnover 19.95 GREEN.
- 1720141903 Водолей — 1 / 0.20 / IDC 5 / turnover 69.08 YELLOW.
- 1640330072 Громовик — 2 / 0.35 / IDC 5.71 / turnover 80.48 YELLOW.
- 2559748332 Герб России — 3 / 0.48 / IDC 6.25 / turnover 31.1 GREEN.
- 2183921966 Сварог — 2 / 0.30 / IDC 6.67 / turnover 28.06 GREEN.
- 1640306007 Молвинец — 2 / 0.28 / IDC 7.14 / turnover 59.53 GREEN.
- 1720148880 Овен — 1 / 0.10 / IDC 10 / turnover 84.5 YELLOW.
- 2183985513 Перун — 3 / 0.28 / IDC 10.71 / turnover 36.65 GREEN.
- 1602717077 Шлем ужаса — 5 / 0.33 / IDC 15.15 / turnover 74.65 YELLOW.
- 1602722942 Вегвизир — 16 / 1.02 / IDC 15.69 / turnover 47.51 GREEN.
- 1842444165 Родимич — 3 / 0.18 / IDC 16.67 / turnover 29.27 GREEN.
- 1720151850 Лев — 3 / 0.18 / IDC 16.67 / turnover 59.18 GREEN.
- 1720144370 Дева — 1 / 0.05 / IDC 20 / turnover 65 YELLOW.
- 2186766628 Телец (Античность) — 1 / 0.05 / IDC 20 / turnover 119.33 YELLOW.

## Clear do-not-replenish / slow-turnover group

Most severe `GRADES_CRITICAL` examples:
- 2186852750 Козерог (Античность): turnover 794, IDC 400.
- 1640326230 Знич: turnover 722, IDC 450.
- 2184168890 Хорс: turnover 596, IDC 350.
- 2271246783 Козерог (Символы): turnover 467, IDC 200.
- 1720155616 Рыбы: turnover 442.67, IDC 220.
- 1640334195 Всеславец: turnover 382, IDC 250.
- 2186848313 Рыбы (Античность): turnover 385, IDC 200.
- 2186846833 Водолей (Античность): turnover 337.67, IDC 240.
- 2271251938 Овен (Символы): turnover 321.5, IDC 233.33.
- 2184133137 Макошь: turnover 294, IDC 120.

`GRADES_NOSALES`:
- 2186802133 Весы (Античность): current_stock 7, ads 0, IDC null, turnover null. Do not replenish; investigate price/content/demand instead.

## Current business conclusion

Run 1 is sufficient to identify overstock / no-sales products that should not be replenished. It is not sufficient to finalize the urgent replenishment list because the low-stock signal is not total FBO+FBS stock.

Next step: one explicit `seller_product_info_list` read by SKU for the zero-current-stock and low-IDC candidates, then calculate total FBO+FBS present/reserved stock and rank true replenishment urgency against ADS/IDC.