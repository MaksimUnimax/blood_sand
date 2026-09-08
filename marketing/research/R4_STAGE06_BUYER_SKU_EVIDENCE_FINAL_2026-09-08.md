# R4 — Stage 06 Buyer + SKU Evidence — FINAL — 2026-09-08

Status: **FINAL — ROADMAP 06 EVIDENCE GATES COMPLETE**

Purpose: connect the R3 opportunity map to actual Blood & Sand assortment, marketplace listing/product facts, seller performance and buyer/customer evidence without freezing final IA or Page Jobs.

## 1. Evidence base completed

### Ozon current assortment
- fresh `stocks_current` walk is terminally proven at **76/76** current identities;
- historical/current identity comparison: 76 exact product_id + SKU matches, no additions/removals/unresolved joins;
- 76/76 current Ozon identities mapped to R3 opportunity relations or explicitly left without an accepted R3 relation.

### Wildberries current assortment
Fresh seller-side `cards_list` walk through `wildberries-llm-api-bridge` v0.1.2:
- page 1 request `fc8e8dcd-a1e9-404b-8f7e-5e7db09d2541`: HTTP 200, **100 cards**;
- continuation request `6e9dea89-d64d-4294-b1e1-d28fe1219b46`: HTTP 200, **8 cards**;
- page-2 count `8 < limit 100` proves terminal pagination for this ordered walk;
- overlap by `nmID` between pages: **0**;
- complete fresh account census: **108 unique WB cards**.

The 108 account cards are not one Blood & Sand product family:
- **88** cards normalize to brand `Кровь и Песок` / `Кровь и песок` and all 88 are automotive symbolic pendant/talisman listings by current title;
- **20** cards belong to adjacent/unrelated card/puzzle/open-card product lines on the same seller account and are excluded from Blood & Sand opportunity-family counts.

Canonical WB artifacts:
- `marketing/data/raw/marketplace/wildberries/20260908__wb__cards-list__fresh-page1-checkpoint.md`
- `marketing/data/raw/marketplace/wildberries/20260908__wb__cards-list__fresh-page2-terminal-checkpoint.md`
- `marketing/data/normalized/marketplace/wildberries/20260908__wb__cards-list__fresh-page2.csv`
- `marketing/data/normalized/marketplace/wildberries/20260908__wb__cards-list__fresh-current108-identities.csv`

## 2. Cross-platform family shape

Current Ozon 76-listing shape from the canonical Stage-06 baseline:
- Slavic: **25** identities;
- zodiac: **37**;
- Norse/runic: **4**;
- remaining: **10**.

Fresh WB Blood & Sand 88-card shape:
- Slavic/named Slavic symbols: **37** cards;
- zodiac: **37** cards;
- Norse/runic named symbols: **4** cards;
- remaining automotive symbolic cards: **10**.

The 12-card difference between WB Slavic card count and Ozon Slavic current-identity count is explained by multiple parallel/legacy WB cards for several named Slavic symbols. Therefore marketplace listing/card counts are not treated as unique physical-product counts.

Examples of current WB parallel identities include two current cards for `Печать Велеса`, `Алатырь`, several other Slavic symbols and three zodiac series/variant structures. These remain separate `MarketplaceListing` identities unless a stronger shared product identity is proven.

## 3. Tier A decision-grade product facts

Tier A deep enrichment is complete for:
1. Печать Велеса — Ozon SKU `1636048691`;
2. Велес — `1636041142`;
3. Алатырь — `1640251697`;
4. Вегвизир — `1602722942`;
5. Шлем Ужаса / Эгисхьяльм — `1602717077`.

For all five, current Ozon seller evidence directly supports:
- automotive rear-view-mirror pendant framing;
- wooden medallion/obereg;
- seller-declared diameter **45 mm**;
- acrylic beads **12 mm**;
- total talisman length **36 cm**;
- current active-selling listing state at the product-info measurement;
- price ladder observed at that measurement: price 1700 RUB / min price 1450 RUB / old price 2200 RUB.

Protection/luck/energy/historical claims remain seller claims and are not upgraded to objective product facts.

Tier A preserved 90-day Ozon performance, 2026-05-13..2026-08-10:
- 623 ordered units;
- 1,057,274 RUB revenue;
- approximately 41.0% of the 1,519 ordered-unit current-identity baseline.

This proves commercial importance, not buyer motive and not margin.

## 4. Contrast evidence

Deep contrast rows completed:
- Busido / Путь Воина;
- zodiac classic Овен;
- zodiac antique Лев;
- zodiac symbols Близнецы.

All four are current automotive rear-view-mirror pendant listings under the same Ozon category/type class as Tier A and share the same core seller-declared construction pattern: 45 mm wooden talisman, 12 mm acrylic beads, 36 cm total length.

Ozon 90-day performance for the four contrast rows:
- Busido: 19 units / 32,800 RUB;
- classic Овен: 32 / 54,412 RUB;
- antique Лев: 26 / 44,600 RUB;
- symbols Близнецы: 30 / 52,000 RUB.

## 5. Buyer/customer evidence

### Current direct Ozon buyer text
Reviews:
- request `5649ec00-ecdb-437c-951d-f9edaddf9244` reached Ozon;
- provider returned HTTP 403 auth/permission;
- status: `BLOCKED_BY_PROVIDER_PERMISSION`.

Questions:
- capability probe succeeded;
- current subscription resolved as non-Premium-Plus for the endpoint;
- business request was not executed;
- status: `BLOCKED_BY_SUBSCRIPTION`.

Therefore:
`CURRENT_DIRECT_OZON_BUYER_TEXT = BLOCKED`

This does **not** mean reviews/questions are absent.

### Analog/category buyer evidence
Preserved analog evidence identifies recurring buyer topics:
- appearance in a real car;
- size/visual scale;
- material/finish;
- aging/darkening risk;
- cord quality;
- attachment/hanging mechanism;
- heat/sun resistance;
- packaging;
- gift motive;
- review/social-proof trust.

These remain category/analog observations and are not silently assigned to owned SKUs.

## 6. Wildberries performance evidence and its limit

A separate preserved WB campaign dataset already exists for campaign `26225434` and was reconstructed across **12 complete calendar months, 2025-09 through 2026-08**, from `promo_fullstats`.

Full campaign totals:
- 630,632 views;
- 10,635 clicks;
- 1,449 add-to-basket;
- 213 advertising-attributed orders;
- 50,163.40 RUB ad spend;
- 283,382 RUB advertising-attributed revenue.

Of those:
- **196 attributed orders were zodiac products**;
- zodiac attributed revenue: **260,349 RUB**;
- 17 orders / 23,033 RUB were non-zodiac/cross-sell.

The month × sign relationship is statistically detectable in that preserved advertising dataset. For the two-month zodiac-window test:
- observed: 45 of 196 zodiac orders in the matching two-month windows;
- fixed-margin null mean: about 29.35;
- Monte-Carlo p ≈ 0.00143.

This is advertising-attributed performance only. It is **not total WB sales**, does not prove organic sales by SKU, and does not prove buyer motive.

No seller-wide WB sales/stock read operation was verified from the Stage-06 accepted/current runtime evidence used here. Full WB seller sales/stock therefore remain explicitly `NOT_MEASURED` rather than inferred from advertising.

Canonical preserved source:
- `продажи/статистика/wildberries/26225434/monthly_zodiac_funnel.tsv`
- `продажи/статистика/wildberries/26225434/seasonality_analysis_2025-09_2026-08.md`

## 7. Cross-platform identity rule

The selected Ozon and WB listings show very strong candidate correspondence by seller naming, symbol/variant, automotive form and physical construction.

However no shared provider identifier/barcode/product-master authority was obtained that legally proves one stable cross-platform physical-product identity.

Therefore:
- no stable `product_master_id` is assigned across Ozon and WB;
- candidate relations are recorded as `PROVISIONAL_STRONG_CROSS_PLATFORM_MATCH`;
- marketplace IDs remain separate;
- identical/near-identical titles are never used alone to merge listings.

Decision-grade selected listing passports are materialized in:
- `marketing/data/normalized/products/product_listing_master.csv`.

## 8. Stage-06 opportunity decisions

### OU01 — Slavic category
**PRODUCT GATE: PASS / KEEP**

Broad real assortment exists on both marketplaces. WB additionally shows deep/parallel Slavic listing coverage. Stage 07 must test whether owned specialist experience can organize this breadth better than marketplaces.

### OU02 — Печать Велеса
**PRODUCT GATE: PASS / KEEP**

Direct current Ozon and WB listings exist. Ozon preserved 90-day performance is the strongest single Tier-A product signal: 385 units / 653,271 RUB.

### OU03 — automotive protection/use-case
**PRODUCT GATE: PASS / KEEP**

Current seller titles/content repeatedly frame the product family as automotive talisman/obereg use. This proves seller/product fit to the job, not metaphysical effectiveness.

### OU04 — mirror-pendant form factor
**PRODUCT GATE: PASS / REMAINS INVESTIGATE**

The form factor is genuinely core to the assortment. The unresolved issue is differentiation in a marketplace/commodity-heavy Search lane; that belongs to Stage 07.

### OU05 — Алатырь
**PRODUCT GATE: PASS / KEEP**

Current product presence, physical fit and seller performance are confirmed.

### OU06 — broader Велес family
**STAGE-06 OVERLAP GATE: PASS / KEEP FOR NEXT STAGES**

R3 left OU06 unresolved mainly because of possible overlap with OU02. Stage 06 resolves that product-side question: `Велес` and `Печать Велеса` are distinct current Ozon seller identities with separate sales, and WB also exposes distinct `Велес`, `Знак Велеса` and `Печать Велеса` cards. OU06 is therefore not collapsed into OU02.

This does not decide URL architecture.

### OU07 — Vegvisir
**PRODUCT GATE: PASS / KEEP**

Current Ozon and WB named-symbol listings exist; sellable/current Ozon state and physical fit are confirmed. Historical/source-quality differentiation remains Stage-07 work.

### OU08 — Шлем Ужаса / Эгисхьяльм
**PRODUCT GATE: PASS / REMAINS INVESTIGATE**

Actual current SKU/listing presence and commercial activity are confirmed. The unresolved R3 issue — exact Alice usefulness — was not solved by Stage 06.

### OU09 — broad zodiac
**REOPEN CONDITION: SATISFIED → REOPEN FOR STAGE 07/08 INVESTIGATION**

Stage 05 said to reopen only if Stage 06 proved a coherent Blood & Sand zodiac SKU family with direct customer/marketplace evidence.

Stage 06 now proves:
- 37 current Ozon zodiac identities;
- 37 fresh WB Blood & Sand zodiac cards;
- explicit classic / antique / symbols variant structures;
- preserved Ozon 90-day sales for sampled variants;
- 12-month direct WB advertising-attributed evidence containing 196 zodiac orders / 260,349 RUB zodiac attributed revenue;
- statistically detectable calendar/sign association in the preserved WB campaign dataset.

Therefore the reopen condition is met.

Important: OU09 is **not promoted to primary Search/SEO opportunity** by this result. R3 Search/Alice evidence remains contaminated by stones/jewelry and broad intent. The correct status is `REOPENED_FOR_INVESTIGATION`, with Stage 07/08 responsible for determining whether product differentiation/economics justify a supporting owned-search role.

### OU10 — generic automotive gift
**REOPEN CONDITION: NOT PROVEN / REMAINS REJECT_AS_PRIMARY**

Seller copy and analog customer evidence show gift use exists, but no direct owned-buyer share or economics proves that generic gift demand is a strong/profitable primary acquisition lane.

## 9. Remaining explicit missing facts

Not resolved in Stage 06:
- direct owned-customer review/question text for Ozon;
- direct WB buyer review/question synthesis for the selected listings;
- seller-wide total WB sales and stock by current listing;
- cord material/adjustability and exact hanging construction for Tier-A SKUs;
- independent durability/heat/sun/darkening tests;
- confirmed cross-platform stable product-master IDs;
- margin/profit/AOV/net economics;
- final owned-site IA/Page Jobs.

These are not hidden gaps; they remain explicit statuses.

## 10. Handoff to Stage 07 — competitor / defensible advantage

Stage 07 should now answer:
1. why specialist independents beat marketplaces on Slavic and named-symbol informational/commercial searches;
2. whether Blood & Sand can create a defensible experience around actual product depth rather than just listing the same products;
3. what buyers need to see about size in-car, mounting, materials, packaging and visual scale;
4. what historical/source-quality standard is required for Vegvisir and Ægishjálmur;
5. whether OU04 mirror-pendant pages can be differentiated beyond commodity cataloging;
6. whether reopened OU09 has a defensible specialist content/use-case angle despite poor broad Search purity;
7. which current seller claims must be rewritten as sourced explanation rather than repeated marketplace copy.

## 11. Handoff to Stage 08 — economics

Stage 08 should measure:
- margin/contribution by opportunity-relevant SKU/family;
- direct-site vs Ozon vs WB economics;
- AOV and fulfillment/returns cost;
- value of owned explanatory traffic that converts later on marketplaces;
- economic viability of OU04 and reopened OU09 despite weaker organic differentiation;
- seasonal economics for zodiac using the preserved WB seasonality signal.

## Final Stage-06 decision

**Roadmap 06 evidence collection is complete.**

No further Ozon/WB command is required to close Stage 06 from the currently verified runtime surface. Missing unsupported/blocked fields are carried forward explicitly rather than fabricated.

Proceed to Stage 07 competitor/advantage evidence. Do not freeze final IA/Page Jobs yet.
