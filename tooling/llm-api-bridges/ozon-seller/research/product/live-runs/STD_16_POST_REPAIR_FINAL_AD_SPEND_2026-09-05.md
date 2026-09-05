# STD-16 post-repair final — advertising spend

Date: 2026-09-05
Canonical question: `Дай рекламные расходы за последние 7 дней и покажи, какие кампании потратили больше всего.`
Period: `2026-08-29..2026-09-04` inclusive — seven fully completed days, excluding incomplete 2026-09-05.
Branch: `repair/ozon-date-contract-2026-09-04`.

## Run 1

Operation: `performance_expense`
Request id: `87a08c64-7a03-40cc-abed-d779034b195f`
HTTP: `200`
Provider: `performance_api`
External request executed: `true`
Logical/physical business requests: `1/1`
Exact request preserved: `true`
Command transformed: `false`
Entitlement: `SUPPORTED_AND_ENTITLED / performance_provider_not_seller_subscription`.

The response already contained campaign id, campaign title, date and `moneySpent`, so no follow-up campaign-name lookup was required.

## Seven-day total

Total `moneySpent`: **43,808.47 RUB**.

Daily totals:

| Date | Spend, RUB |
|---|---:|
| 2026-08-29 | 5,426.12 |
| 2026-08-30 | 8,060.87 |
| 2026-08-31 | 5,337.70 |
| 2026-09-01 | 5,534.91 |
| 2026-09-02 | 4,658.83 |
| 2026-09-03 | 7,917.49 |
| 2026-09-04 | 6,872.55 |

## Campaign ranking by spend

Campaign IDs are treated as authoritative identities because several different campaigns share the same visible title.

| Rank | Campaign ID | Title | Spend, RUB | Share |
|---:|---|---|---:|---:|
| 1 | `10384311` | Оплата за заказ: выбранные товары | 17,834.00 | 40.71% |
| 2 | `37130634` | Печать Реком 21,03 27.08.2026 | 3,871.74 | 8.84% |
| 3 | `37130607` | Печать Поиск 21.03 Вывод в топ 25.03 27.08.2026 | 3,867.93 | 8.83% |
| 4 | `37130638` | Православные 27.08.2026 | 1,870.18 | 4.27% |
| 5 | `37130631` | Зод Чер 27.08.2026 | 1,752.13 | 4.00% |
| 6 | `37130620` | Слав Символы 27.08.2026 | 1,634.04 | 3.73% |
| 7 | `37130595` | Герб 27.08.2026 | 1,626.66 | 3.71% |
| 8 | `37130644` | Слав Символы 27.08.2026 | 1,591.18 | 3.63% |
| 9 | `37130606` | Зод Чер 27.08.2026 | 1,465.67 | 3.35% |
| 10 | `37130619` | Слав Боги 27.08.2026 | 1,330.15 | 3.04% |
| 11 | `37130604` | Зод Символы 27.08.2026 | 1,077.53 | 2.46% |
| 12 | `37130629` | Зод Символы 27.08.2026 | 888.17 | 2.03% |
| 13 | `37130642` | Слав Боги 27.08.2026 | 854.26 | 1.95% |
| 14 | `37130600` | Зод Античные 27.08.2026 | 838.81 | 1.91% |
| 15 | `37130617` | Скандинавские 27.08.2026 | 783.95 | 1.79% |
| 16 | `37130627` | Зод Античные 27.08.2026 | 668.73 | 1.53% |
| 17 | `37130640` | Скандинавские 27.08.2026 | 628.40 | 1.43% |
| 18 | `37130624` | Герб 27.08.2026 | 597.85 | 1.36% |
| 19 | `37130594` | Восточные 27.08.2026 | 309.67 | 0.71% |
| 20 | `37130609` | Православные 27.08.2026 | 261.77 | 0.60% |
| 21 | `37130622` | Восточные 27.08.2026 | 55.65 | 0.13% |

Top 3 campaigns consumed **25,573.67 RUB / 58.38%** of all spend.
Top 5 consumed **29,195.98 RUB / 66.64%**.

## Business answer

For the seven completed days 2026-08-29 through 2026-09-04, advertising spend was **43,808.47 RUB**. The single largest campaign by a wide margin was `10384311` (`Оплата за заказ: выбранные товары`) at **17,834 RUB**, or **40.71%** of all advertising spend. The next two campaigns were `37130634` and `37130607`, both near **3.87k RUB** each. Campaign concentration is high: the top three account for **58.38%** of the total budget.

STD-16 asks only for spend and highest-spending campaigns. This response is therefore sufficient by itself; do not infer advertising efficiency or waste from spend alone.

## Final classification

Business answerability: `PASS`.
Operational reliability: `PASS_FIRST_ATTEMPT`.
Provider/API incidents: `NONE`.
Additional API lookup required: `NO`.

Checkpoint:
`STD_16_POST_REPAIR_PASS_SEVEN_DAY_SPEND_43808_47_TOP_CAMPAIGN_10384311_SHARE_40_71_STD_17_READY`
