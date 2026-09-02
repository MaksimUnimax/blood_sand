# STD-09 Run 3 — FBS warehouse reconciliation

Date: 2026-09-02
Question: `Дай продажи за вчера по складам от большего к меньшему.`

## Command

`fbs_posting_list` for `2026-09-01T00:00:00Z..2026-09-01T23:59:59Z`, limit 100, analytics_data enabled.

## Bridge result

- request_id: `3db5d3fe-3614-4f85-a2a2-c202a2c12da9`
- HTTP 200
- one physical business request
- external_request_executed=true
- entitlement: `SUPPORTED_AND_ENTITLED`
- endpoint: `POST /v4/posting/fbs/list`
- has_next=false
- cursor=""

This was the explicit retry after the expected local privacy-policy block in Run 2. The operator enabled the Bridge personal-data setting before this new explicit command.

## FBS postings returned

Four FBS postings were created in the target UTC day. Every posting contains exactly one unit at 1,700 RUB, and every posting is attributed to the seller warehouse `Златоуст Чёт` (`warehouse_id=1020001773680000`).

1. `0159594438-0096-1` — Колядник — 1 × 1,700 RUB — current status `delivering`.
2. `0237006959-0002-1` — Рыбы (Символы) — 1 × 1,700 RUB — current status `cancelled`.
3. `57165739-0320-1` — Родимич — 1 × 1,700 RUB — current status `delivering`.
4. `68627427-0255-1` — Звезда Лады — 1 × 1,700 RUB — current status `delivering`.

FBS ordered totals for the target day:
- ordered units: **4**;
- ordered value: **6,800 RUB**;
- warehouse: `Златоуст Чёт` = **4 units / 6,800 RUB**.

## Exact cross-source reconciliation

STD-09 Run 1 FBO postings for the same target day contained 12 postings, each one unit at 1,700 RUB:
- FBO ordered units = **12**;
- FBO ordered value = **20,400 RUB**.

Combining FBO + FBS:
- `12 + 4 = 16` ordered units;
- `20,400 + 6,800 = 27,200 RUB`.

This exactly matches STD-01 `analytics_data` for 2026-09-01:
- `ordered_units = 16`;
- `revenue = 27,200 RUB`.

## Important metric semantics discovered

The exact reconciliation only works when postings that were created in the target day but are **currently cancelled** are still included in the warehouse attribution for the benchmark's `revenue + ordered_units` semantics.

There are two such postings across FBO+FBS:
- one FBO posting at `НЕВИННОМЫССК_РФЦ`;
- one FBS posting at `Златоуст Чёт`.

If both current cancelled postings are removed, only 14 units / 23,800 RUB remain, which does **not** reconcile to STD-01.

Therefore for this benchmark:

`ANALYTICS_REVENUE_ORDERED_UNITS_ARE_ORDER_CREATION_METRICS_NOT_CURRENT_NONCANCELLED_POSTING_TOTALS`

Current posting status is a later lifecycle state and must not be used to rewrite the historical ordered-unit/revenue metric without an explicit metric-definition change.

## Warehouse ranking for 2026-09-01 under STD-01 metric semantics

1. `Златоуст Чёт` — **4 units / 6,800 RUB** (FBS).
2. `СПБ_ШУШАРЫ_РФЦ` — **2 units / 3,400 RUB** (FBO).
3. The following warehouses each contributed **1 unit / 1,700 RUB** (FBO):
   - `НОВОСИБИРСК_3_РФЦ`
   - `КРАСНОЯРСК_СТАРЦЕВО_РФЦ`
   - `РОСТОВ-НА-ДОНУ_РФЦ`
   - `САНКТ-ПЕТЕРБУРГ_РФЦ`
   - `НЕВИННОМЫССК_РФЦ`
   - `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ`
   - `ВАТУТИНКИ_РФЦ`
   - `ПУШКИНО_1_РФЦ`
   - `НИЖНИЙ_НОВГОРОД_2_РФЦ`
   - `ХОРУГВИНО_РФЦ`

Total: **16 units / 27,200 RUB**.

## Product/privacy finding

Run 2 was locally blocked because `fbs_posting_list` is operation-level `PERSONAL_DATA_READ_GATED`, despite this business task requiring only aggregate product/price/warehouse fields. Run 3 succeeded only after the operator explicitly enabled the personal-data setting.

This preserves current privacy behavior but exposes a commercial usability gap for safe aggregate analytics.

## STD-09 final classification

Business result: `PASS`.

Operational reliability: `PASS_WITH_EXPECTED_LOCAL_PRIVACY_GATE_AND_EXPLICIT_OPERATOR_RETRY`.

Operator intervention: `YES_PRIVACY_SETTING_TOGGLE`.

Provider incidents: none; both provider-executed reads returned HTTP 200.
