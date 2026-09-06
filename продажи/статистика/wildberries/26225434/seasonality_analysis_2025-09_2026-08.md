# Wildberries campaign 26225434 — zodiac seasonality analysis

Period: 2025-09-01 through 2026-08-31 (12 full calendar months).

Source: `promo_fullstats` responses collected through `wildberries-llm-api-bridge` v0.1.2. This analysis concerns advertising-attributed orders reported by WB for campaign 26225434; it is not a substitute for all organic + advertising sales by SKU.

## 1. Full-year advertising funnel

Across the 12-month period:

- views: 630,632
- clicks: 10,635
- weighted CTR: 1.686%
- add-to-basket: 1,449
- attributed orders: 213
- canceled: 7
- spend: 50,163.40 RUB
- attributed revenue: 283,382 RUB
- weighted CPC: 4.72 RUB
- click-to-order CR: 2.003%
- CPA: 235.51 RUB
- ROAS: 5.649x
- basket/click rate: 13.625%
- order/basket rate: 14.700%
- CPM: 79.54 RUB
- attributed AOV: 1,330.43 RUB

Of the 213 attributed campaign orders, 196 were zodiac products and 17 were non-zodiac/cross-sell products. Zodiac attributed revenue was 260,349 RUB; non-zodiac attributed revenue was 23,033 RUB.

## 2. May 2026 closeout

May totals:

- views: 54,401
- clicks: 904
- CTR: 1.66%
- add-to-basket: 123
- attributed orders: 12
- canceled: 0
- spend: 3,752.55 RUB
- attributed revenue: 16,316 RUB
- CPC: 4.15 RUB
- CR: 1.33%
- CPA: 312.71 RUB
- ROAS: 4.348x

May zodiac attribution reconciles as 11 orders / 14,973 RUB plus one non-zodiac `Печать Велеса` order / 1,343 RUB = 12 orders / 16,316 RUB.

May zodiac orders by sign:

| Sign | Orders | Attributed revenue, RUB |
| --- | ---: | ---: |
| Овен | 1 | 1,362 |
| Телец | 3 | 4,077 |
| Близнецы | 1 | 1,362 |
| Рак | 0 | 0 |
| Лев | 2 | 2,724 |
| Дева | 0 | 0 |
| Весы | 0 | 0 |
| Скорпион | 1 | 1,362 |
| Стрелец | 0 | 0 |
| Козерог | 1 | 1,362 |
| Водолей | 2 | 2,724 |
| Рыбы | 0 | 0 |

May boosterStats contains one observation for each calendar day for three active nmIds:

| Sign | nmId | Observations | Avg position | Min | Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Козерог | 262622381 | 31 | 39.74 | 21 | 78 |
| Водолей | 262669813 | 31 | 30.65 | 17 | 62 |
| Скорпион | 462723607 | 31 | 125.26 | 59 | 212 |

Compared with April, May had +25.0% views and +10.2% clicks, but attributed orders fell 36.8%. CPA increased from about 160.85 RUB to 312.71 RUB and ROAS fell from about 8.39x to 4.35x. The decline therefore came from conversion efficiency rather than a collapse in traffic.

## 3. Seasonality definition

Because the requested analysis is monthly, zodiac season is represented by the two calendar months containing each conventional zodiac interval:

- Овен: March + April
- Телец: April + May
- Близнецы: May + June
- Рак: June + July
- Лев: July + August
- Дева: August + September
- Весы: September + October
- Скорпион: October + November
- Стрелец: November + December
- Козерог: December + January
- Водолей: January + February
- Рыбы: February + March

This is a calendar-month proxy, not a day-level zodiac-window test.

## 4. Aggregate month/sign dependence

The 12 x 12 zodiac order matrix contains 196 zodiac attributed orders.

A Pearson month-by-sign independence statistic is 169.01. The ordinary asymptotic chi-square approximation is not relied upon because the table is sparse. Instead, a fixed-margin Monte Carlo test was run by generating 200,000 random contingency tables with the observed monthly totals and observed sign totals held fixed.

Monte Carlo result for general month/sign association: p ≈ 0.0030.

The more direct seasonality test counts orders falling in each sign's two-month zodiac window. Observed: 45 of 196 zodiac orders (22.96%). Under fixed margins, the Monte Carlo null mean is about 29.35 orders, with a 95% simulated interval of roughly 20 to 39. Observed 45 is about 53% above the null expectation. Fixed-margin Monte Carlo p ≈ 0.00143.

Using only each sign's primary calendar month (the month containing most days of the sign's conventional interval), 27 zodiac orders are observed versus a null mean of about 15.63; fixed-margin Monte Carlo p ≈ 0.00313.

Therefore the year contains a statistically detectable relationship between calendar month and which zodiac sign receives attributed orders. The effect is not uniform across all 12 signs.

## 5. Sign-level two-month season signal

`Over-index` below compares the sign's share of zodiac orders inside its two-month zodiac window with its share across the other ten months. Values above 1 indicate positive seasonal concentration.

| Sign | Total zodiac orders | Orders in two-month zodiac window | Share of sign's annual orders in window | Over-index vs other months | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Близнецы | 10 | 3 | 30.0% | 3.57x | strong positive signal |
| Овен | 19 | 6 | 31.6% | 3.02x | strong positive signal |
| Дева | 8 | 3 | 37.5% | 2.86x | strong positive signal, low count |
| Рыбы | 8 | 4 | 50.0% | 2.50x | strong positive signal, low count |
| Скорпион | 36 | 5 | 13.9% | 2.47x | strong positive signal after controlling for monthly volume |
| Лев | 13 | 5 | 38.5% | 1.93x | moderate positive signal |
| Водолей | 13 | 6 | 46.2% | 1.85x | moderate positive signal |
| Телец | 28 | 7 | 25.0% | 1.84x | moderate positive signal |
| Весы | 13 | 1 | 7.7% | 1.40x | weak positive signal |
| Рак | 15 | 3 | 20.0% | 1.28x | weak positive signal |
| Козерог | 20 | 2 | 10.0% | 0.57x | no positive seasonal signal in this year |
| Стрелец | 13 | 0 | 0.0% | 0.00x | inverse/no seasonal signal in this year |

## 6. Annual sign totals

| Sign | Attributed orders | Attributed revenue, RUB | Share of zodiac orders |
| --- | ---: | ---: | ---: |
| Скорпион | 36 | 49,885 | 18.37% |
| Телец | 28 | 36,944 | 14.29% |
| Козерог | 20 | 25,802 | 10.20% |
| Овен | 19 | 25,522 | 9.69% |
| Рак | 15 | 19,765 | 7.65% |
| Лев | 13 | 17,690 | 6.63% |
| Весы | 13 | 16,444 | 6.63% |
| Стрелец | 13 | 16,832 | 6.63% |
| Водолей | 13 | 17,077 | 6.63% |
| Близнецы | 10 | 13,507 | 5.10% |
| Дева | 8 | 10,591 | 4.08% |
| Рыбы | 8 | 10,290 | 4.08% |

## 7. Conclusion and limits

The one-year campaign data supports the hypothesis that the mix of zodiac-product attributed orders depends on calendar month. At the aggregate level the effect is materially stronger than expected under a month/sign independence model, and the conventional two-month zodiac windows capture substantially more attributed orders than the fixed-margin null expectation.

This should not be read as proof that every sign individually follows its zodiac season. The strongest positive signals are Близнецы, Овен, Дева, Рыбы and Скорпион; moderate positive signals are Лев, Водолей and Телец; Рак and Весы are weak; Козерог and Стрелец do not show a positive seasonal pattern in this single year.

Important confounders remain: campaign intensity changed sharply by month; advertising positions and product participation changed; some orders are attributed to historical/cross-sell nmIds with zero direct ad views in the order row; and this dataset is promo-attributed rather than complete WB sales. A stronger causal/product-demand analysis would compare each sign's monthly orders against its own impressions/clicks/add-to-basket/spend and, ideally, against complete SKU sales outside advertising attribution.
