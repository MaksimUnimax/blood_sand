# 06 — Buyer evidence + полный паспорт SKU

Статус: **[x] COMPLETE — 06.1–06.6 COMPLETE**  
Дата старта: **2026-08-26**  
Дата закрытия: **2026-09-08**

## Цель

Связать R3 opportunity map с реальным ассортиментом Blood & Sand, seller-side marketplace facts и buyer/customer evidence. Stage 06 не назначает финальную IA/Page Jobs и не считает финальную экономику.

## Evidence rules

- Product / listing / SKU / seller offer identities remain separate.
- Dynamic marketplace facts are dated/period-scoped.
- Revenue/sales do not prove buyer motive.
- Seller claims do not become objective product facts.
- Missing physical/customer fields remain explicit missing statuses.
- Ozon evidence does not imply WB evidence.
- Extension engineering is not Stage 06 work.
- Every completed pass is committed before proceeding.
- No final IA/Page Jobs in Stage 06.

---

## 06.1 — Existing evidence inventory + passport schema

Status: **[x] COMPLETE**

Canonical artifacts:
- `marketing/research/R4_STAGE06_EVIDENCE_INVENTORY_2026-08-26.md`
- `marketing/data/PRODUCT_SKU_PASSPORT_SCHEMA.md`

Historical Ozon baseline:
- **76/76 PROVEN** current identities;
- 90d ordered units: **1519**;
- Slavic: 25 / 928;
- zodiac: 37 / 356;
- Norse/runic: 4 / 128;
- remaining: 10 / 107.

---

## 06.2 — Fresh Ozon assortment baseline

Status: **[x] COMPLETE**

Fresh sequence:
- page 1 `7c5e5bc9-4208-44e4-8651-296eb4ce6a7f`: 76 items / total 76 / non-empty cursor;
- terminal `91bbb10d-3ad3-4f39-bda7-b838637e05ac`: items empty / total 76 / cursor empty;
- historical/current identity comparison: **76/76 exact product_id + SKU matches**;
- additions/removals/unresolved: **0/0/0**.

Canonical artifacts:
- `marketing/data/raw/marketplace/ozon/20260826T1102Z__ozon__stocks-current__fresh-page1.md`
- `marketing/data/raw/marketplace/ozon/20260826__ozon__stocks-current__fresh-terminal.md`
- `marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`
- `marketing/research/R4_OZON_FRESH_BASELINE_RESULT_2026-08-26.md`

---

## 06.3 — Current assortment → opportunities

Status: **[x] COMPLETE**

Canonical artifacts:
- `marketing/data/normalized/products/product_opportunity_map.csv`
- `marketing/research/R4_STAGE06_ASSORTMENT_OPPORTUNITY_MAPPING_2026-08-26.md`

Coverage:
- current Ozon identities: **76/76**;
- accepted/reopen-linked identities: **67**;
- intentionally unmapped identities: **9**;
- unresolved joins: **0**.

Key boundaries:
- OU02 `Печать Велеса` and OU06 broader `Велес` remain separate seller/product lanes;
- OU03 automotive use-case and OU04 mirror-pendant form factor remain separate jobs;
- zodiac assortment-side reopen trigger is satisfied by a coherent 37-identity family, but R3 Search/Alice evidence is not overwritten.

---

## Tier A product-passport enrichment

Status: **[x] COMPLETE — PRODUCT INFO 5/5 + ATTRIBUTES 5/5**

Tier A:
1. Печать Велеса — Ozon SKU `1636048691`;
2. Велес — `1636041142`;
3. Алатырь — `1640251697`;
4. Вегвизир — `1602722942`;
5. Шлем Ужаса / Эгисхьяльм — `1602717077`.

Product info:
- request `4a6a224d-43ae-4c7a-a99f-c9842273e43e`;
- HTTP 200;
- 5/5 returned.

Attributes:
- request `877ef57d-d048-4d8d-98f0-d17ce5d71a0d`;
- HTTP 200;
- total 5;
- `last_id=""` terminal.

Common seller-declared physical facts:
- rear-view-mirror automotive pendant framing;
- wooden medallion/obereg;
- diameter 45 mm;
- acrylic beads 12 mm;
- total length 36 cm.

Protection/luck/energy/historical copy remains `SELLER_CLAIM_UNVERIFIED` where not independently supported.

Canonical artifacts:
- `marketing/data/raw/marketplace/ozon/20260907T1721+0500__ozon__seller-product-attributes__tier-a5.md`
- `marketing/data/normalized/products/20260907__ozon__tier-a5__physical-content-passport.csv`
- `marketing/research/R4_STAGE06_TIER_A_ENRICHMENT_FINAL_2026-09-07.md`

---

## 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[x] COMPLETE**

### Direct Ozon buyer text

Reviews:
- request `5649ec00-ecdb-437c-951d-f9edaddf9244` reached provider;
- HTTP 403 auth/permission;
- `BLOCKED_BY_PROVIDER_PERMISSION`.

Questions:
- capability probe HTTP 200;
- endpoint requires `PREMIUM_PLUS`;
- current subscription not entitled;
- business request not executed;
- `BLOCKED_BY_SUBSCRIPTION`.

Combined:
`CURRENT_DIRECT_OZON_BUYER_TEXT = BLOCKED`

Do not infer zero reviews/questions.

Analog/category customer evidence remains separately normalized in:
- `marketing/data/normalized/customer/customer_evidence.csv`.

Recurring analog buyer topics:
- appearance in car;
- size/scale;
- material/finish;
- aging/darkening;
- cord quality;
- hanging/attachment;
- heat/sun resistance;
- packaging;
- gift motive;
- review/social-proof trust.

Seller performance linkage:
- `marketing/data/normalized/products/product_marketplace_metrics.csv`;
- Tier A five products: **623 ordered units / 1,057,274 RUB** over preserved 2026-05-13..2026-08-10 Ozon 90d window;
- approximately **41.0%** of the 1519-unit current-identity baseline;
- revenue is not margin/profit.

### Targeted contrast enrichment

Completed contrast set:
- Busido / Путь Воина;
- zodiac classic Овен;
- zodiac antique Лев;
- zodiac symbols Близнецы.

Product info request `2f3c8b11-1539-4cc1-96fc-8a3647d67ea6`: HTTP 200, 4/4.

Attributes request `b6da99cf-491d-4570-ae30-a5d282ee3345`: HTTP 200, total 4, terminal `last_id=""`.

All four are current automotive mirror-pendant listings and share the same core seller-declared 45 mm wood / 12 mm acrylic / 36 cm construction pattern.

Canonical contrast artifacts:
- `marketing/data/raw/marketplace/ozon/20260907__ozon__seller-product-attributes__contrast4.md`
- `marketing/data/normalized/products/20260907__ozon__contrast4__physical-content-passport.csv`
- `marketing/research/R4_STAGE06_CONTRAST_ENRICHMENT_FINAL_2026-09-07.md`

---

## 06.5 — Cross-platform / Wildberries status

Status: **[x] COMPLETE — FRESH SELLER CATALOG CENSUS PROVEN**

Accepted direct channel:
- `wildberries-llm-api-bridge` v0.1.2;
- operation `cards_list`;
- `POST /content/v2/get/cards/list`;
- explicit cursor pagination.

Fresh pass:
- page 1 request `fc8e8dcd-a1e9-404b-8f7e-5e7db09d2541`: HTTP 200, **100 cards**;
- page 2 request `6e9dea89-d64d-4294-b1e1-d28fe1219b46`: HTTP 200, **8 cards**;
- page 2 returned `8 < limit 100`, therefore terminal;
- overlap by `nmID`: **0**;
- combined fresh seller-account census: **108 unique cards**.

Account composition:
- **88** fresh cards belong to brand `Кровь и Песок` / `Кровь и песок` and are automotive symbolic pendant/talisman listings by current title;
- **20** cards are unrelated/adjacent open-card/puzzle product lines on the same seller account and are excluded from Blood & Sand family counts.

Fresh Blood & Sand WB family shape:
- Slavic/named Slavic: **37** cards;
- zodiac: **37** cards;
- Norse/runic: **4** cards;
- remaining automotive symbolic: **10** cards.

The WB Slavic count exceeds the Ozon Slavic identity count because several symbols have parallel/legacy WB cards. Listing/card count is therefore not treated as unique physical-product count.

Canonical artifacts:
- `marketing/data/raw/marketplace/wildberries/20260908__wb__cards-list__fresh-page1-checkpoint.md`
- `marketing/data/raw/marketplace/wildberries/20260908__wb__cards-list__fresh-page2-terminal-checkpoint.md`
- `marketing/data/normalized/marketplace/wildberries/20260908__wb__cards-list__fresh-page2.csv`
- `marketing/data/normalized/marketplace/wildberries/20260908__wb__cards-list__fresh-current108-identities.csv`

### Preserved WB zodiac performance evidence

A separate completed 12-month `promo_fullstats` dataset exists for campaign `26225434`, 2025-09..2026-08:
- views 630,632;
- clicks 10,635;
- ATB 1,449;
- advertising-attributed orders 213;
- advertising spend 50,163.40 RUB;
- advertising-attributed revenue 283,382 RUB;
- zodiac orders **196**;
- zodiac attributed revenue **260,349 RUB**.

Two-month zodiac-window association:
- observed 45/196 matching-window zodiac orders;
- fixed-margin null mean ≈29.35;
- Monte-Carlo `p ≈ 0.00143`.

This is advertising-attributed evidence only, not total WB seller sales.

Preserved authority:
- `продажи/статистика/wildberries/26225434/monthly_zodiac_funnel.tsv`
- `продажи/статистика/wildberries/26225434/seasonality_analysis_2025-09_2026-08.md`

No seller-wide WB sales/stock read operation was verified from the Stage-06 accepted/current runtime evidence used here. Full WB seller sales/stock remain `NOT_MEASURED`.

---

## 06.6 — Final passports + Stage 07 handoff

Status: **[x] COMPLETE**

Canonical final outputs:
- `marketing/data/normalized/products/product_listing_master.csv`
- `marketing/data/normalized/products/product_opportunity_map.csv`
- `marketing/data/normalized/products/product_marketplace_metrics.csv`
- `marketing/data/normalized/customer/customer_evidence.csv`
- `marketing/research/R4_STAGE06_BUYER_SKU_EVIDENCE_FINAL_2026-09-08.md`

Cross-platform identity control:
- selected Ozon↔WB pairs are recorded only as `PROVISIONAL_STRONG_CROSS_PLATFORM_MATCH`;
- no stable cross-platform `product_master_id` is assigned because no shared provider/barcode authority proves a legal merge;
- marketplace listing identities remain separate.

### Opportunity outcomes

- **OU01 Slavic category** — product gate PASS / KEEP.
- **OU02 Печать Велеса** — product gate PASS / KEEP.
- **OU03 automotive use-case** — product gate PASS / KEEP.
- **OU04 mirror-pendant form factor** — product gate PASS / remains INVESTIGATE for differentiation.
- **OU05 Алатырь** — product gate PASS / KEEP.
- **OU06 broader Велес** — Stage-06 overlap gate PASS; keep separate from OU02 for next stages. Distinct Ozon identities/sales and distinct WB cards prove a real product-side hierarchy.
- **OU07 Vegvisir** — product gate PASS / KEEP.
- **OU08 Шлем Ужаса** — product gate PASS / remains INVESTIGATE because exact Alice usefulness remains unresolved.
- **OU09 broad zodiac** — **REOPEN CONDITION SATISFIED → REOPEN FOR STAGE 07/08 INVESTIGATION**. Coherent 37+37 Ozon/WB assortment plus direct marketplace performance evidence satisfies the Stage-05 reopen condition, but does not override weak/contaminated broad Search/Alice fit or promote zodiac to primary SEO automatically.
- **OU10 generic gift** — reopen condition not proven; remains REJECT_AS_PRIMARY.

Explicit remaining gaps are carried forward, not hidden:
- direct owned review/question text;
- full seller-wide WB sales/stock;
- cord/adjustability and exact hanging construction;
- independent durability/heat/darkening tests;
- stable cross-platform product-master IDs;
- margin/profit/AOV/net economics;
- final IA/Page Jobs.

---

# Stage 07 handoff

Next stage: **competitor / defensible advantage evidence**.

Required questions:
1. Why specialist independents win Slavic/named-symbol searches versus marketplaces.
2. Whether Blood & Sand can organize actual assortment depth into a defensible specialist experience.
3. What product-content gaps matter most: real-car scale, mounting, materials, packaging, source quality, social proof.
4. What historical/source-quality standard is required for Vegvisir and Ægishjálmur.
5. Whether OU04 can differentiate beyond a commodity mirror-pendant catalog.
6. Whether reopened OU09 has a defensible specialist angle despite weak broad Search purity.
7. Which seller claims must become sourced explanation instead of copied marketplace claims.

Do **not** freeze final IA/Page Jobs until later roadmap gates.

# Current continuation point

**ROADMAP 06 COMPLETE. NEXT_ACTION = START_ROADMAP_07_COMPETITOR_AND_DEFENSIBLE_ADVANTAGE_EVIDENCE_FROM_FINAL_STAGE06_HANDOFF.**
