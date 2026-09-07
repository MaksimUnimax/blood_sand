# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — 06.1/06.2/06.3 COMPLETE; Tier A enrichment COMPLETE; 06.4 ACTIVE**  
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

### Product info

- operation: `seller_product_info_list`;
- request `4a6a224d-43ae-4c7a-a99f-c9842273e43e`;
- HTTP 200;
- 5/5 returned.

Fresh direct seller titles prove all five are automotive rear-view-mirror pendants. Three Slavic items are directly framed as `Славянский оберег - Подвеска на зеркало в машину`; Vegvisir and Шлем Ужаса as `Амулет - Подвеска на зеркало в машину`.

All five product-info rows were current selling listings (`Продается`, moderation approved, validation success) with returned price 1700 RUB / min 1450 / old 2200 in that snapshot.

### Attributes

- operation: `seller_product_attributes`;
- request `877ef57d-d048-4d8d-98f0-d17ce5d71a0d`;
- HTTP 200;
- total **5**;
- `last_id=""` — terminal.

Direct seller-declared common physical facts:
- wooden medallion/obereg;
- diameter 45 mm;
- acrylic beads 12 mm;
- total talisman length 36 cm.

Top-level Ozon 40×130/140×130 mm and 200 g fields are retained as marketplace dimension/weight observations and are not relabeled as medallion dimensions/weight.

Seller protection/luck/energy claims remain `SELLER_CLAIM_UNVERIFIED`.

Canonical artifacts:
- `marketing/data/raw/marketplace/ozon/20260907T1721+0500__ozon__seller-product-attributes__tier-a5.md`
- `marketing/data/normalized/products/20260907__ozon__tier-a5__physical-content-passport.csv`
- `marketing/research/R4_STAGE06_TIER_A_ENRICHMENT_FINAL_2026-09-07.md`

Tier A enrichment completion: **PASS**.

---

## 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[~] ACTIVE**

Sequence:
1. collect current direct Ozon buyer evidence for the priority SKU set through accepted read-only review/question operations when access permits;
2. normalize buyer text by topic while preserving source/product linkage;
3. link existing/current seller performance facts separately;
4. never infer buyer motive from sales;
5. decide whether Tier B automotive contrast and Tier C zodiac representatives are needed from actual decision gaps rather than automatic broad pulls.

Buyer topic vocabulary:
- appearance_in_car
- size_scale
- material_finish
- darkening_aging
- cord_quality
- attachment_hanging
- heat_sun_resistance
- packaging
- gift_motive
- review_trust
- symbol_meaning
- design_visual_choice
- price_value

Accepted B9 buyer-read surface verified:
- `review_list` → `POST /v2/review/list`;
- `review_info` → `POST /v2/review/info`;
- `question_list` → `POST /v1/question/list`.

Privacy/access boundary:
- these operations are `PERSONAL_DATA_READ_GATED`, default OFF unless the operator personal-data gate is enabled;
- `review_list` / `review_info` entitlement may remain `ENTITLEMENT_UNKNOWN` because access can come from either review-management subscription or Premium Pro;
- `question_list` is Premium Plus gated.

No hidden pagination/fanout is allowed.

---

## 06.5 — Cross-platform / WB status

Status: **[ ] WAIT**

WB seller-side evidence must be measured through an accepted channel or explicitly marked `BLOCKED/NOT_AVAILABLE`. Public snippets do not substitute.

## 06.6 — Final passports + Stage 07 handoff

Status: **[ ] WAIT**

Close only when current Ozon baseline, opportunity mapping, technical-fact gaps, buyer evidence and WB coverage status are explicit and provenance-safe.

---

# Current continuation point

**06.4 ACTIVE. Run one direct `review_list` request for the five Tier A SKUs, newest first, up to 100 reviews. Save and normalize that result before any review-info, questions, Tier B/C or new performance calls.**
