# R4 — Stage 06 buyer evidence + seller performance linkage — 2026-09-07

Status: **06.4 COMPLETE — direct buyer text blocked; preserved evidence normalized; targeted contrast justified**

## 1. Direct current Ozon buyer-text status

Current direct Ozon buyer text is not available under the current account/permission state.

### Reviews

- operation: `review_list`;
- request: `5649ec00-ecdb-437c-951d-f9edaddf9244`;
- real provider request executed: yes;
- HTTP 403 `auth_or_permission`;
- classification: `BLOCKED_BY_PROVIDER_PERMISSION`.

### Questions

- operation: `question_list`;
- request: `capability-967db1fe-1c3c-4d84-af6d-cdc6c92ce091`;
- capability probe HTTP 200;
- current subscription: `UNSPECIFIED`;
- endpoint requirement: `PREMIUM_PLUS`;
- business request executed: no;
- classification: `BLOCKED_BY_SUBSCRIPTION`.

Combined:

`CURRENT_DIRECT_OZON_BUYER_TEXT = BLOCKED`

This is not evidence of zero reviews/questions or zero buyer interest.

Canonical access report:
- `marketing/research/R4_STAGE06_BUYER_CHANNEL_ACCESS_RESULT_2026-09-07.md`

## 2. Existing customer evidence normalized

Source:
- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`

Canonical normalized layer:
- `marketing/data/normalized/customer/customer_evidence.csv`

Retained analog/category themes:
- appearance in real car;
- size / visual scale;
- material / finish;
- darkening / aging risk on analogous products;
- cord quality;
- attachment/hanging construction;
- heat/sun resistance;
- packaging;
- gift motive;
- review trust.

These remain `CATEGORY_ANALOG` evidence. They are not silently assigned to Blood & Sand SKUs.

## 3. Preserved seller performance normalized

Source period:
- 2026-05-13..2026-08-10 (90 days)

Raw source:
- `marketing/data/raw/marketplace/ozon/20260811T104232Z__ozon__analytics-data__sku__20260513_20260810.json`

Canonical normalized layer:
- `marketing/data/normalized/products/product_marketplace_metrics.csv`

### Tier A five-SKU performance

| SKU | Product | 90d ordered units | 90d revenue RUB |
|---|---|---:|---:|
| 1636048691 | Печать Велеса | 385 | 653271 |
| 1636041142 | Велес | 48 | 80317 |
| 1640251697 | Алатырь | 84 | 143243 |
| 1602722942 | Вегвизир | 84 | 142643 |
| 1602717077 | Шлем Ужаса / Эгисхьяльм | 22 | 37800 |
| **TOTAL** |  | **623** | **1057274** |

Tier A accounts for 623 / 1519 = approximately **41.0%** of ordered units in the preserved current-identity 90-day seller baseline.

Interpretation rule:
- these numbers prove seller-side commercial activity for the exact historical period;
- they do **not** prove why buyers chose the products;
- revenue is not margin/profit.

## 4. Contrast set evidence

The 06.3 enrichment queue proposed one Tier B automotive contrast and three Tier C zodiac representatives. Historical seller performance shows they are not dead/placeholder listings:

| Tier | SKU | Product | 90d units | 90d revenue RUB |
|---|---|---|---:|---:|
| B | 1602715556 | Бусидо — Путь Воина | 19 | 32800 |
| C | 1720148880 | Zodiac classic — Овен | 32 | 54412 |
| C | 2186857668 | Zodiac antique — Лев | 26 | 44600 |
| C | 2271210394 | Zodiac symbols — Близнецы | 30 | 52000 |
| **TOTAL** |  |  | **107** | **183812** |

The three zodiac representatives alone account for 88 ordered units in the preserved 90-day period.

## 5. Targeted enrichment decision

**Tier B/C enrichment is justified and should be performed.**

Reason 1 — automotive contrast:
- Tier A proves five high-priority named-symbol products use the automotive rear-view-mirror pendant framing;
- one non-Tier-A automotive talisman with real historical sales is needed to test whether the same physical/listing construction is a generic chassis across the broader automotive product line or specific to named-symbol opportunities.

Reason 2 — zodiac reopen test:
- the fresh 76-item census confirms 37 current zodiac identities across three seller research families;
- R3 still rejects broad zodiac Search as a primary acquisition opportunity because intent is contaminated;
- three cross-family current listing/attribute representatives are needed to establish whether the seller-side zodiac assortment is physically/content-wise one coherent product family or materially different variants.

This is a concrete Stage-06 product decision gap, not automatic broad enrichment.

## 6. No fresh analytics rerun required now

The preserved 90-day seller performance is already sufficient for the Stage-06 linkage role because:
- the period is explicit;
- the 76 current-identity baseline is preserved;
- Stage 06 needs evidence of real commercial activity and relative product-family depth, not current revenue forecasting;
- fresh current listing/stock status was already measured separately in 06.2/Tier A enrichment.

Do not rerun the same historical period merely to reconstruct already-preserved evidence.

## 7. Next exact step

Collect current `seller_product_info_list` for exactly four contrast SKUs:
- `1602715556` — Бусидо;
- `1720148880` — zodiac classic Овен;
- `2186857668` — zodiac antique Лев;
- `2271210394` — zodiac symbols Близнецы.

Then collect attributes for the same four only if product-info leaves the expected physical/content comparison gap.
