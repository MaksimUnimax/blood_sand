# Wildberries campaign 26225434 — traffic-efficiency analytics as of 2026-09-06

Analytical date: **2026-09-06**  
Campaign: **26225434 — `Реком Зод Чер`**

## 1. Decision objective

This is an **operational traffic-efficiency** snapshot. The optimization target is:

> **maximum volume of cheap clicks from the active zodiac SKUs.**

The decision in this document deliberately uses only:

- impression volume;
- CTR;
- CPC as the direct economic consequence of CTR under the campaign's nearly uniform CPM.

**Orders, revenue, CR and CPO are not used in the traffic ranking.**  
The annual zodiac-seasonality study is a separate analytical axis and is not allowed to override the traffic ranking inside this document.

## 2. Current campaign configuration

Fresh `promo_campaigns` read on 2026-09-06:

- bridge: `wildberries-llm-api-bridge` v0.1.2;
- request id: `da313100-3932-4738-ab60-c3ebfb3474c8`;
- campaign status: `9` (active);
- payment type: `cpm`;
- bid type: `unified`;
- placements: search + recommendations;
- all 9 active nmIds have `7000` kopecks bid in search and recommendations, i.e. **70 RUB CPM bid**.

Active zodiac SKUs:

| Sign | nmId |
| --- | ---: |
| Дева | 262669814 |
| Лев | 262669815 |
| Овен | 262669816 |
| Телец | 262629137 |
| Весы | 262661039 |
| Стрелец | 262678027 |
| Скорпион | 462723607 |
| Козерог | 262622381 |
| Водолей | 262669813 |

This uniform bid structure makes cross-SKU CTR particularly useful: with comparable CPM, higher CTR directly produces a cheaper click.

## 3. Fresh 14-day window: 2026-08-24 through 2026-09-06

Source: fresh `promo_fullstats`, request id `4c0d35e6-a4f0-4a58-8468-f469fcd1809b`.

Campaign total for the 14-day window:

- views: **45,453**
- clicks: **714**
- CTR: **1.57%**
- spend: **3,169.37 RUB**
- CPC: **4.44 RUB**

Traffic-only SKU comparison:

| Sign | Views | Clicks | CTR | CPC, approx. RUB | Traffic-only conclusion |
| --- | ---: | ---: | ---: | ---: | --- |
| **Дева** | **6,006** | 115 | **1.92%** | **3.64** | **CORE KEEP** — high volume + best CTR |
| **Козерог** | **6,531** | 112 | **1.72%** | **4.07** | **CORE KEEP** — maximum volume + above-average CTR |
| **Стрелец** | **6,206** | 101 | **1.63%** | **4.28** | **CORE KEEP** — very high volume + acceptable CTR |
| **Овен** | **5,041** | 93 | **1.85%** | **3.78** | **CORE KEEP** — high CTR + substantial volume |
| Скорпион | 3,923 | 62 | 1.58% | 4.41 | KEEP — approximately campaign-average click efficiency |
| Водолей | 4,770 | 72 | 1.51% | 4.62 | WATCH / KEEP — slightly below average, but current trend improved |
| Телец | 4,166 | 60 | 1.44% | 4.84 | REMOVE CANDIDATE — lower CTR and moderate volume |
| Весы | 5,211 | 66 | 1.27% | 5.51 | REMOVE CANDIDATE — volume exists, but impressions convert poorly into clicks |
| **Лев** | 3,599 | 33 | **0.92%** | **7.60** | **REMOVE FIRST** — lowest CTR and most expensive click |

The four core traffic generators are therefore:

**Дева + Козерог + Стрелец + Овен.**

Together they account for:

- **23,784 views** in the 14-day window;
- **421 clicks**;
- about **59% of all campaign clicks** with only 4 of the 9 active zodiac SKUs.

## 4. 31-day control window from WB Excel export

Control source: `statistics-26225434-2026_08_07-2026_09_07.xlsx`.

Important date note: although the filename contains `2026_09_07`, the workbook's daily `Рекомендации` sheet contains observed rows from **2026-08-07 through 2026-09-06** only. No 2026-09-07 row is used. The effective observed control window is therefore **31 days: 2026-08-07 through 2026-09-06**.

Campaign total in the workbook:

- views: **93,819**
- clicks: **1,529**
- CTR: **1.63%**
- spend: **6,537.60 RUB**
- CPC: **4.28 RUB**

For each active sign, `Прямая` and `Мультикарточка` rows were combined because both belong to the same active nmId and traffic objective.

| Sign | Views, 31d | Clicks, 31d | CTR, 31d | CPC, 31d RUB | Views, last 14d | CTR, last 14d | Current direction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **Дева** | 11,925 | 233 | **1.95%** | **3.57** | 6,006 | **1.92%** | stable high CTR; recent daily volume higher |
| **Овен** | 10,277 | 198 | **1.93%** | **3.61** | 5,041 | **1.85%** | still very strong; small CTR softening |
| **Козерог** | **13,619** | 221 | 1.62% | 4.30 | **6,531** | **1.72%** | **improving CTR + maximum scale** |
| **Стрелец** | 11,158 | 188 | **1.68%** | **4.14** | **6,206** | 1.63% | very strong increase in impression volume |
| Скорпион | 7,820 | 127 | 1.62% | 4.29 | 3,923 | 1.58% | near average; recent volume higher |
| **Водолей** | 9,390 | 129 | 1.37% | 5.08 | 4,770 | **1.51%** | **clear recent improvement** |
| Телец | 9,661 | 144 | 1.49% | 4.66 | 4,166 | 1.44% | below average; recent volume slightly lower |
| **Весы** | **11,480** | 179 | 1.56% | 4.46 | 5,211 | **1.27%** | **CTR deterioration despite preserved scale** |
| **Лев** | 8,489 | 110 | 1.30% | 5.37 | 3,599 | **0.92%** | **strong deterioration in both CTR and scale** |

## 5. Non-overlapping trend check

To avoid misleading overlap between the 31-day and 14-day windows, the first **17 days (2026-08-07..2026-08-23)** were also compared with the last **14 days (2026-08-24..2026-09-06)**.

| Sign | CTR first 17d | CTR last 14d | Views/day first 17d | Views/day last 14d | Volume change |
| --- | ---: | ---: | ---: | ---: | ---: |
| Дева | 1.99% | 1.92% | 348 | 429 | **+23%** |
| Овен | 2.01% | 1.85% | 308 | 360 | **+17%** |
| Козерог | 1.54% | **1.72%** | 417 | **467** | **+12%** |
| Стрелец | 1.76% | 1.63% | 291 | **443** | **+52%** |
| Скорпион | 1.67% | 1.58% | 229 | 280 | **+22%** |
| Водолей | 1.23% | **1.51%** | 272 | 341 | **+25%** |
| Телец | 1.53% | 1.44% | 323 | 298 | **-8%** |
| Весы | **1.80%** | **1.27%** | 369 | 372 | **+1%** |
| Лев | **1.57%** | **0.92%** | 288 | 257 | **-11%** |

This non-overlapping comparison confirms the main operational conclusions:

- **Козерог** is genuinely improving: more daily impressions and higher CTR.
- **Стрелец** is receiving much more scale while keeping CTR above the campaign's weak-SKU range.
- **Водолей** improved materially and should not be removed before another control.
- **Весы** did not lose scale; the problem is specifically CTR deterioration.
- **Лев** deteriorated most clearly: lower scale and much lower CTR.
- **Телец** has neither a scale advantage nor a CTR advantage in the current window.

## 6. Placement structure

The 31-day Excel `Рекомендации` sheet accounts for:

- recommendations views: **86,080** of 93,819 (**91.75%**);
- recommendations clicks: **1,402** of 1,529 (**91.69%**);
- recommendations spend: **5,996.04 RUB** of 6,537.60 RUB (**91.72%**);
- recommendations CTR: **1.63%**;
- recommendations CPC: **4.28 RUB**.

The remaining placements account for 7,739 views / 127 clicks / 541.56 RUB, with CTR and CPC very close to recommendations.

For the last 14 days, recommendations likewise represent about **92.6%** of views, clicks and spend.

Therefore the current optimization problem is primarily **which SKU can absorb a large recommendation-impression volume while maintaining a strong CTR**, rather than a search-vs-recommendations placement problem.

## 7. Traffic-only operational decision as of 2026-09-06

### Core keep

- **Дева**
- **Козерог**
- **Стрелец**
- **Овен**

These four combine scale and click efficiency best.

### Keep / secondary

- **Скорпион** — around campaign-average CTR; no traffic reason for immediate removal.
- **Водолей** — below the leaders, but the non-overlapping trend is improving strongly; retain under control.

### Remove candidates

Order of traffic-only removal:

1. **Лев** — remove first.
2. **Весы** — high impression supply but weak current CTR; expensive click.
3. **Телец** — below-average CTR without a compensating scale advantage.

This ranking is **strictly for the cheap-mass-click objective**. It does not use sales or zodiac seasonality.

## 8. Relationship to the annual seasonality study

The annual seasonality analysis remains useful for deciding **when to re-test or re-introduce signs**, but it answers a different question.

- Seasonality asks: *does interest/response change around a sign's calendar period?*
- This report asks: *which currently active SKU is generating the cheapest mass click right now?*

For current traffic allocation, the latter is the authority. A sign should not be removed merely because it is out of season if it continues to provide high-volume, high-CTR traffic.
