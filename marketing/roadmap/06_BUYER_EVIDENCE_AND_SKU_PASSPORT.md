# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — 06.1/06.2/06.3/06.4 COMPLETE; 06.5 ACTIVE**  
Дата старта: **2026-08-26**  
Последнее продолжение: **2026-09-07**

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

Historical baseline:
- Ozon snapshot completeness: **76/76 PROVEN**;
- 90d ordered units: **1519**;
- Slavic: 25 / 928;
- zodiac: 37 / 356;
- Norse/runic: 4 / 128;
- remaining: 10 / 107.

---

## 06.2 — Fresh Ozon assortment baseline

Status: **[x] COMPLETE**

Fresh sequence:
- page 1 request `7c5e5bc9-4208-44e4-8651-296eb4ce6a7f`: 76 items / total 76 / non-empty cursor;
- terminal request `91bbb10d-3ad3-4f39-bda7-b838637e05ac`: items empty / total 76 / cursor empty;
- identity comparison vs historical: **76/76 exact product_id + SKU matches**;
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
- current identities: **76/76**;
- accepted/reopen-linked identities: **67**;
- intentionally unmapped identities: **9**;
- unresolved joins: **0**.

Key boundaries retained:
- OU02 Печать Велеса and OU06 broader Велес are separate seller identities;
- OU03 automotive function/use-case and OU04 mirror-pendant form factor remain separate jobs;
- 37 current zodiac identities satisfy the assortment-side OU09 reopen trigger but do not override the R3 broad-query rejection.

---

## Tier A product-passport enrichment

Status: **[x] COMPLETE — PRODUCT INFO 5/5 + ATTRIBUTES 5/5**

Tier A:
1. Печать Велеса — SKU `1636048691`;
2. Велес — `1636041142`;
3. Алатырь — `1640251697`;
4. Вегвизир — `1602722942`;
5. Шлем Ужаса / Эгисхьяльм — `1602717077`.

Product info:
- request `4a6a224d-43ae-4c7a-a99f-c9842273e43e`;
- HTTP 200;
- 5/5 returned;
- current listing titles directly prove automotive rear-view-mirror pendant framing for all five.

Attributes:
- request `877ef57d-d048-4d8d-98f0-d17ce5d71a0d`;
- HTTP 200;
- total 5;
- `last_id=""` terminal.

Common direct seller-declared physical facts:
- wooden medallion/obereg;
- diameter 45 mm;
- acrylic beads 12 mm;
- total talisman length 36 cm.

Top-level Ozon package/dimension fields remain separate observations. Protection/luck/energy claims remain `SELLER_CLAIM_UNVERIFIED`.

Canonical artifacts:
- `marketing/data/raw/marketplace/ozon/20260907T1721+0500__ozon__seller-product-attributes__tier-a5.md`
- `marketing/data/normalized/products/20260907__ozon__tier-a5__physical-content-passport.csv`
- `marketing/research/R4_STAGE06_TIER_A_ENRICHMENT_FINAL_2026-09-07.md`

---

## 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[x] COMPLETE**

### Direct Ozon buyer text

Reviews:
- request `5649ec00-ecdb-437c-951d-f9edaddf9244`;
- real provider request executed;
- HTTP 403 `auth_or_permission`;
- classification: `BLOCKED_BY_PROVIDER_PERMISSION`.

Questions:
- request `capability-967db1fe-1c3c-4d84-af6d-cdc6c92ce091`;
- capability probe HTTP 200;
- subscription `UNSPECIFIED`;
- endpoint requires `PREMIUM_PLUS`;
- business request not executed;
- classification: `BLOCKED_BY_SUBSCRIPTION`.

Combined:

`CURRENT_DIRECT_OZON_BUYER_TEXT = BLOCKED`

Do not infer zero reviews/questions.

Customer evidence:
- analog/category evidence preserved in `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`;
- normalized in `marketing/data/normalized/customer/customer_evidence.csv`;
- remains category/analog evidence and is not silently assigned to owned SKUs.

Seller performance linkage:
- canonical normalized file: `marketing/data/normalized/products/product_marketplace_metrics.csv`;
- Tier A five products: **623 ordered units / 1,057,274 RUB revenue** over preserved 2026-05-13..2026-08-10 90d window;
- approximately **41.0%** of the 1519-unit current-identity baseline;
- sales/revenue do not prove buyer motive or margin.

### Targeted contrast enrichment

Completed contrast set:
- `1602715556` — Бусидо / Путь Воина;
- `1720148880` — zodiac classic Овен;
- `2186857668` — zodiac antique Лев;
- `2271210394` — zodiac symbols Близнецы.

Product info:
- request `2f3c8b11-1539-4cc1-96fc-8a3647d67ea6`;
- HTTP 200;
- 4/4 returned.

Attributes:
- request `b6da99cf-491d-4570-ae30-a5d282ee3345`;
- HTTP 200;
- total 4;
- `last_id=""` terminal.

Contrast result:
- all four are active automotive rear-view-mirror pendant listings under the same Ozon description category/type as Tier A;
- all four share the same core seller-declared physical pattern: wooden 45 mm medallion/talisman, 12 mm acrylic beads, total length 36 cm;
- Busido top-level Ozon observation: 200 g;
- sampled zodiac rows: 300 g;
- all sampled zodiac rows are real current automotive product lines; this strengthens the assortment-side OU09 reopen condition without overturning the R3 broad-Search contamination decision.

Canonical contrast artifacts:
- `marketing/data/raw/marketplace/ozon/20260907__ozon__seller-product-attributes__contrast4.md`
- `marketing/data/normalized/products/20260907__ozon__contrast4__physical-content-passport.csv`
- `marketing/research/R4_STAGE06_CONTRAST_ENRICHMENT_FINAL_2026-09-07.md`

06.4 completion: **PASS**. No further Ozon Tier B/C enrichment is justified by current Stage-06 decision gaps.

---

## 06.5 — Cross-platform / Wildberries status

Status: **[~] ACTIVE**

Required decision:
- determine whether a current accepted Wildberries seller-side read channel exists in the repository/runtime;
- if yes, measure only the seller-side facts needed to relate current WB assortment/performance to the Stage-06 passport;
- if no, classify WB as `BLOCKED/NOT_AVAILABLE` with exact evidence;
- public Search snippets do not substitute for seller-side WB evidence.

Do not start bridge engineering as Stage-06 research work.

---

## 06.6 — Final passports + Stage 07 handoff

Status: **[ ] WAIT**

Close only when WB coverage status is explicit and all current Stage-06 evidence is consolidated into decision-grade passports/handoff.

---

# Current continuation point

**06.5 ACTIVE — inspect the repository/current runtime for an accepted Wildberries seller-side read channel. If one exists, issue only the minimum decision-grade WB commands; otherwise close WB as blocked/not available and proceed to 06.6.**
