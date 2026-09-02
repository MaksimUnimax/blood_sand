# STD-07 Run 2 — total FBO+FBS stock confirmation for replenishment candidates

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Question: `Какие товары у меня скоро закончатся, а какие лежат слишком долго? Что пополнять в первую очередь?`

## Request

Operation: `seller_product_info_list`
Request id: `252bc1a0-fa5a-49aa-accf-fc258336542c`
HTTP: `200`
Physical business requests: `1`
External request executed: `true`

The request selected 22 SKUs from STD-07 Run 1: all turnover rows with `current_stock=0` plus low-IDC candidates (approximately IDC <= 20 days).

## Critical semantic correction

`stock_turnover_analytics.current_stock` is not total sellable FBO+FBS inventory.

Run 2 proves that many rows with zero/very low turnover-surface stock still have substantial FBS inventory. Therefore a weak model must not translate `current_stock=0` into `OUT_OF_STOCK` or recommend new procurement without a cross-surface stock confirmation.

For prioritization below, `free FBO` is calculated as `FBO present - FBO reserved`. FBS rows in this response had reserved=0, so `total free` = `free FBO + FBS present`.

| SKU | Product | FBO present | FBO reserved | Free FBO | FBS present | Total free |
|---|---|---:|---:|---:|---:|---:|
| 2559748332 | Герб России | 3 | 0 | 3 | 44 | 47 |
| 1602722942 | Вегвизир | 16 | 1 | 15 | 34 | 49 |
| 1640330072 | Громовик | 2 | 1 | 1 | 47 | 48 |
| 1842444165 | Родимич | 3 | 2 | 1 | 45 | 46 |
| 1602717077 | Шлем ужаса | 5 | 0 | 5 | 50 | 55 |
| 1720144370 | Дева | 1 | 0 | 1 | 42 | 43 |
| 2186836116 | Скорпион (Античность) | 0 | 0 | 0 | 43 | 43 |
| 1611643847 | Гунгнир | 0 | 0 | 0 | 45 | 45 |
| 1720124782 | Стрелец | 0 | 0 | 0 | 43 | 43 |
| 1720151850 | Лев | 3 | 0 | 3 | 42 | 45 |
| 1640251697 | Алатырь | 3 | 1 | 2 | 50 | 52 |
| 2559437928 | Чур | 0 | 0 | 0 | 39 | 39 |
| 2183985513 | Перун | 3 | 0 | 3 | 42 | 45 |
| 2186766628 | Телец (Античность) | 1 | 0 | 1 | 41 | 42 |
| 2186857668 | Лев (Античность) | 0 | 0 | 0 | 50 | 50 |
| 1720148880 | Овен | 1 | 0 | 1 | 41 | 42 |
| 2271210394 | Близнецы (Символы) | 0 | 0 | 0 | 41 | 41 |
| 1640306007 | Молвинец | 2 | 0 | 2 | 41 | 43 |
| 1720160556 | Скорпион | 0 | 0 | 0 | 49 | 49 |
| 1720153914 | Рак | 0 | 0 | 0 | 42 | 42 |
| 2183921966 | Сварог | 2 | 0 | 2 | 40 | 42 |
| 1720141903 | Водолей | 1 | 0 | 1 | 43 | 44 |

## Replenishment interpretation using Run 1 demand (`ads`) + Run 2 stock

No selected SKU is close to a **total** stockout. All 22 have roughly 39–55 total free FBO+FBS units.

Therefore the immediate replenishment problem is **FBO placement/distribution**, not external procurement.

Strongest FBO replenishment candidates before inbound-supply correlation:

- `2559437928` Чур — free FBO 0; FBS 39; Run1 `ads=0.77`; turnover-surface IDC 0. This is a high-priority FBO-placement candidate, not a total stockout. Additionally, the stale Aug-10 in-transit supply contains 5 units of Чур.
- `1640251697` Алатырь — free FBO 2; FBS 50; `ads=0.73`; approximately 2.7 days of free FBO at the Run1 demand rate.
- `1640330072` Громовик — free FBO 1; FBS 47; `ads=0.35`; approximately 2.9 days of free FBO.
- `2559748332` Герб России — free FBO 3; FBS 44; `ads=0.48`; approximately 6.25 days of free FBO.
- `1842444165` Родимич — free FBO 1; FBS 45; `ads=0.18`; approximately 5.6 days of free FBO.
- `1640306007` Молвинец — free FBO 2; FBS 41; `ads=0.28`; approximately 7.1 days of free FBO.
- `2183921966` Сварог — free FBO 2; FBS 40; `ads=0.30`; approximately 6.7 days of free FBO.
- `1720141903` Водолей — free FBO 1; FBS 43; `ads=0.20`; approximately 5 days of free FBO.

The other `current_stock=0` rows are not urgent on total inventory because they have 41–50 FBS units and materially lower average daily demand.

## Slow-stock side from Run 1 remains valid

Run 2 does not weaken the slow-turnover finding. Products in `GRADES_CRITICAL`, `GRADES_RED`, or `GRADES_NOSALES` remain **do-not-replenish** candidates until demand/price/content/ads are addressed. Highest examples include Козерог (Античность), Знич, Хорс, Козерог (Символы), Рыбы and Весы (Античность, no sales).

## Remaining load-bearing check before final STD-07 answer

Four fresh `DATA_FILLING` supply orders are scheduled for 2026-09-05. Their bundle contents were not yet checked. Before recommending any new FBO movement, correlate the four upcoming bundles with the FBO-priority SKUs above.

Known fresh bundle IDs from STD-06 Run 5:
- `01a0524b-6726-739e-bcc3-d3c751d56138`
- `01a05251-09ff-7557-b613-7437b9024b8d`
- `01a05259-34f7-7059-b226-492671edfc84`
- `01a05264-2b43-7b21-b08c-c93a3d6df65f`

Next operation: one explicit `supply_order_bundle` read for these four bundle IDs, with no hidden fanout.

## Current classification

`STD_07_IN_PROGRESS_TOTAL_STOCKOUT_REJECTED_FBO_DISTRIBUTION_RISK_SUPPORTED_UPCOMING_SUPPLY_CORRELATION_REQUIRED`
