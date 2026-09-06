# CAP-18 — Advertising statistics — POST-REPAIR FINAL

Status: PASS_WITH_PRODUCT_LEVEL_COVERAGE_AND_GUIDANCE_GAP

Canonical job:

`Сколько я потратил на рекламу Ozon за 29 августа — 4 сентября 2026 года, сколько продаж реклама атрибутировала, как менялись расходы и ДРР по дням и какие кампании/товары дали основной результат? Используй именно Performance API statistics; не подменяй рекламные расходы Seller Analytics.`

## Live runs

### Run 1 — `performance_expense`

- request_id: `6e34f283-9aed-46e2-ab83-436a1de7bdad`
- HTTP 200
- one logical business result -> one physical business request
- Performance API expense surface returned successfully for `2026-08-29`..`2026-09-04`.

### Run 2 — `performance_daily`

- request_id: `729fc180-2003-4f90-a230-d129d45495b0`
- HTTP 200
- `logical_business_result_count=1`
- `physical_business_request_count=1`
- `external_request_executed=true`
- no command transformation

Derived directly from the returned daily rows:

| Date | Spend, RUB | Attributed orders | Attributed order value, RUB | DRR |
|---|---:|---:|---:|---:|
| 2026-08-29 | 5,426.12 | 22 | 37,400 | 14.51% |
| 2026-08-30 | 8,060.87 | 40 | 67,952 | 11.86% |
| 2026-08-31 | 5,337.70 | 22 | 35,564 | 15.01% |
| 2026-09-01 | 5,534.91 | 24 | 39,882 | 13.88% |
| 2026-09-02 | 4,658.83 | 19 | 32,300 | 14.42% |
| 2026-09-03 | 7,917.49 | 26 | 44,200 | 17.91% |
| 2026-09-04 | 6,872.55 | 35 | 58,888 | 11.67% |
| **TOTAL** | **43,808.47** | **188** | **316,186** | **13.86%** |

Interpretation is strictly Performance attribution. `316,186 RUB` is not total seller revenue.

### Run 3 — `performance_campaign_product`

- request_id: `1715a5f0-c039-4ba7-9f88-8eba4b63072b`
- HTTP 200
- `logical_business_result_count=1`
- `physical_business_request_count=1`
- `external_request_executed=true`
- entitlement `SUPPORTED_AND_ENTITLED`
- exact request preserved; no command transformation
- requested range used explicit RFC3339 `from/to`.

The provider returned campaign-level CPC statistics. Representative/high-impact rows:

- `37130607` — `Печать Поиск 21.03 Вывод в топ 25.03 27.08.2026`: spend `3,867.92`, 9 attributed orders, `15,300` attributed order value, DRR `25.3%`.
- `37130606` — `Зод Чер 27.08.2026`: spend `1,465.67`, 6 orders, `10,200`, DRR `14.4%`.
- `37130620` — `Слав Символы 27.08.2026`: spend `1,634.04`, 6 orders, `9,894`, DRR `16.5%`.
- `37130619` — `Слав Боги 27.08.2026`: spend `1,330.14`, 5 orders, `8,500`, DRR `15.6%`.
- `37130634` — `Печать Реком 21,03 27.08.2026`: spend `3,871.74`, 5 orders, `8,500`, DRR `45.5%`.
- `37130600` — `Зод Античные 27.08.2026`: spend `838.81`, 5 orders, `8,476`, DRR `9.9%`.
- `37130638` — `Православные 27.08.2026`: spend `1,870.17`, 0 attributed orders.
- `37130631` — `Зод Чер 27.08.2026` search-and-category: spend `1,752.13`, `1,700` attributed value, DRR `103.1%`.
- `37130644` — `Слав Символы 27.08.2026` search-and-category: spend `1,591.18`, `1,394` attributed value, DRR `114.1%`.

The daily surface also shows `10384311` (`Продвижение в поиске — все товары`) as the dominant period campaign: spend `17,834.00`, 106 attributed orders, `178,340` attributed order value, period DRR `10.0%`. This all-products campaign is not present in the CPC-only `performance_campaign_product` response and therefore must not be silently merged into that endpoint's scope.

Historical/inactive July campaigns returned zero period spend but still had attributed orders/value. Across the visible inactive `33379xxx` rows this contributes 33 attributed orders and `55,488` RUB with zero displayed period spend. This is attribution carryover, not evidence of free same-day sales.

The sum of displayed CPC campaign spend plus the all-products daily campaign is `0.06 RUB` below the daily total (`43,808.41` vs `43,808.47`), consistent with display-level rounding across aggregate rows; attributed order value reconciles exactly to `316,186`.

## Product-level coverage boundary

The successful `/api/client/statistics/campaign/product/json` response contains campaign fields (`id`, `title`, `objectType`, `status`, `placement`, budgets, `moneySpent`, `views`, `clicks`, `orders`, `ordersMoney`, `drr`, etc.) but no SKU/product identifier.

Current Performance API documentation describes this endpoint as statistics for a CPC/product campaign and enumerates campaign-level report fields; it does not promise a product identifier dimension. Therefore the Bridge registry purpose `Получить рекламную статистику в разрезе кампаний и товаров` overstates the live provider surface.

A separate `performance_sku_statistics` operation exists for CPC product statistics, but its current Bridge contract is near-current only: `dateFrom` may not be earlier than the previous day. It cannot legally answer the historical `2026-08-29`..`2026-09-04` interval on this benchmark date.

Async product-report creation endpoints that could provide historical product reports are intentionally blocked by the current read-only safety policy (`PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST`). They must not be invoked to bypass the benchmark contract.

Therefore:

- campaign-level attribution: PROVEN;
- dominant campaign(s): PROVEN;
- daily spend/DRR dynamics: PROVEN;
- historical product/SKU attribution for this exact interval: **NOT_PROVEN / COVERAGE_BOUNDARY**;
- no SKU winner is fabricated.

## Scoring

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: PASS
- multi_run_orchestration: PASS
- business_answer: PASS_WITH_EXPLICIT_PRODUCT_LEVEL_BOUNDARY
- operator_intervention_required: NO
- bridge_guidance_gap: YES — SEMANTIC/COVERAGE (`performance_campaign_product` purpose overstates product dimension)

## Final business answer

For 29 Aug–4 Sep 2026, Ozon Performance API shows `43,808.47 RUB` advertising spend, 188 attributed orders and `316,186 RUB` attributed order value, for a blended Performance DRR of `13.86%`.

Daily DRR ranged from `11.67%` to `17.91%`; the worst day was 3 Sep and the best was 4 Sep. The largest period contribution visible in the daily Performance statistics came from `Продвижение в поиске — все товары` (`10384311`): `17,834 RUB` spend against `178,340 RUB` attributed order value (10.0% DRR). Among CPC campaigns, `37130607` had the largest attributed value (`15,300 RUB`), while `37130634`, `37130631`, `37130644`, `37130595`, and `37130638` are clear efficiency/problem candidates because of high DRR or spend without attributed orders.

The exact winning SKU/product cannot be stated for this historical interval from the currently legal read-only Performance surfaces. That boundary is explicit rather than inferred away.
