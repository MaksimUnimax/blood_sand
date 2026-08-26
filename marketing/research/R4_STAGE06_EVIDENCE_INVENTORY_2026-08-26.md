# R4 — Stage 06 evidence inventory — 2026-08-26

Status: **06.1 EVIDENCE INVENTORY COMPLETE**

Purpose: establish exactly what buyer/SKU evidence already exists in the repository before requesting any fresh marketplace data.

## 1. Existing direct seller-side Ozon evidence

### 1.1 Stocks snapshot — 2026-08-11

Registry measurement:
- `m_marketplace_20260811T1025Z_f47d23cb`

Raw:
- `marketing/data/raw/marketplace/ozon/20260811T1025Z__ozon__stocks-current__all.json`

Direct facts:
- HTTP 200;
- seller-side Ozon measurement;
- provider reported `total=76` in the registry;
- records expose `product_id`, seller `offer_id`, marketplace `sku`, fulfillment type, present/reserved stock;
- dynamic stock values are dated 2026-08-11 and must not be treated as current on 2026-08-26.

Important completeness boundary:
- registry normalization status remained `PENDING`;
- a result cursor was preserved;
- the historical snapshot must **not** be promoted to a currently complete canonical assortment master without a fresh enumeration/completeness pass.

Directly visible priority identities from this snapshot include:

| Product | Ozon product_id | Ozon SKU | Direct observed stock snapshot |
|---|---:|---:|---|
| `Печать Велеса` | 1119965443 | 1636048691 | FBO 283 present / 2 reserved; FBS 50 present |
| `Велес` | 1119957837 | 1636041142 | FBO 28; FBS 41 |
| `Алатырь (Крест Сварога)` | 1124658338 | 1640251697 | FBO 0; FBS 45 |
| `Вегвизир - Рунический компас` | 1082862005 | 1602722942 | FBO 27; FBS 41 |
| `Шлем ужаса - Эгисхьяльм` | 1082855228 | 1602717077 | FBO 11; FBS 50 |

The same raw snapshot directly shows a substantially broader Slavic assortment, a full/near-full zodiac series, Norse symbols, Orthodox products and other talismans. Product existence is historical direct evidence; current listing state requires refresh.

### 1.2 Ozon SKU analytics measurements

Registry:
- `marketing/data/registry/marketplace_measurements.csv`

Accepted successful windows:
- 2026-07-12..2026-08-10;
- 2026-06-12..2026-07-11;
- 2026-05-13..2026-08-10;
- 2026-08-04..2026-08-10.

Raw files:
- `marketing/data/raw/marketplace/ozon/20260811T103640Z__ozon__analytics-data__sku__20260712_20260810.json`
- `marketing/data/raw/marketplace/ozon/20260811T104017Z__ozon__analytics-data__sku__20260612_20260711.json`
- `marketing/data/raw/marketplace/ozon/20260811T104232Z__ozon__analytics-data__sku__20260513_20260810.json`
- `marketing/data/raw/marketplace/ozon/20260811T113929Z__ozon__analytics-data__sku__20260804_20260810.json`

Metric semantics accepted by the registry for these runs:
- `ordered_units`;
- `revenue`.

Do not infer:
- margin/profit;
- sessions/views from the failed/ambiguous probes;
- buyer motivation from performance.

Direct one-week 2026-08-04..2026-08-10 examples:

| SKU / product title | ordered_units | revenue, ₽ |
|---|---:|---:|
| Печать Велеса | 35 | 56,644 |
| Алатырь | 16 | 26,843 |
| Колядник | 10 | 16,643 |
| Вегвизир | 6 | 9,843 |
| Триглав | 5 | 7,786 |
| Zodiac Овен | 5 | 8,143 |
| Zodiac Близнецы | 4 | 6,800 |
| Сварог | 4 | 6,443 |
| Звезда Лады | 4 | 6,800 |
| Чур | 4 | 6,443 |
| Велес | 3 | 5,100 |
| Шлем Ужаса / Эгисхьяльм | 1 | 1,700 |

Whole response total preserved for that week:
- ordered_units: **153**;
- revenue: **250,798 ₽**.

These are historical marketplace performance facts only.

### 1.3 Failed/ambiguous Ozon probes

Do not normalize as product metrics:
- session-view combined probe: ambiguous metric mapping;
- isolated `session_view`: HTTP 400;
- `product_queries`: HTTP 400.

The failures are useful tooling/contract provenance but are not buyer/SKU evidence.

---

## 2. Existing customer evidence

Canonical legacy report:
- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`

Scope:
- public reviews/cards of similar products, not owned-customer census;
- useful for repeated choice/risk themes, not prevalence estimates.

Repeated themes directly documented:
1. appearance in the real car;
2. size / visual bulk;
3. material / finish and possible darkening over time;
4. cord / attachment quality;
5. heat / sun resistance in car interior;
6. gift motive and packaging;
7. trust/reviews.

Product-content obligations already identified:
- exact dimensions, thickness, weight and total length;
- material / coating;
- cord / bead / tassel construction;
- attachment and hanging method;
- packaging / contents;
- real in-car scale imagery;
- durability/heat/light claims only if directly tested/supported.

Current limitation:
- this is category/analog customer evidence;
- it does not prove each theme for every Blood & Sand SKU.

---

## 3. Opportunity-to-assortment questions inherited from R3

Stage 05 final asks Stage 06 to resolve:
- OU01: is the actual Slavic assortment broad enough for specialist category depth?
- OU02 vs OU06: specific `Печать Велеса` vs broader `Велес` family hierarchy;
- OU03 vs OU04: protection/use-case vs mirror-pendant form-factor at SKU level;
- OU05: current Алатырь product depth;
- OU07: current Vegvisir product fit;
- OU08: actual Шлем Ужаса SKU presence;
- OU09: whether the real zodiac SKU family is coherent enough to reopen a narrower product opportunity despite broad Search contamination.

Historical Ozon evidence already proves that named listings exist for Печать Велеса, Велес, Алатырь, Vegvisir, Шлем Ужаса and multiple zodiac signs. It does **not** by itself prove current state on 2026-08-26.

---

## 4. Current data-layer gap

No canonical normalized Product/SKU/MarketplaceListing passport master exists under `marketing/data/normalized/`.

Current normalized folders cover:
- Wordstat;
- Yandex Search;
- Alice;
- opportunity map.

Therefore Stage 06 must create a new product/SKU normalized layer rather than overload Query Evidence Ledger.

---

## 5. Wildberries coverage status

Current repository evidence:
- official API research exists;
- Wildberries browser extension/accepted seller-side bridge is explicitly **NOT STARTED** in `tooling/llm-api-bridges/wildberries/README.md`.

Stage 06 rule:
- public Search/WB snippets may remain Search evidence;
- they cannot substitute for seller-side WB assortment/analytics;
- Stage 06 must either find another already-authorized accepted WB channel or record the seller-side WB layer as `BLOCKED/NOT_AVAILABLE`;
- extension development is not part of this SEO/research stage.

---

## 6. Fresh-data requirements after inventory

Fresh Ozon collection is justified for:
1. current listing enumeration/completeness;
2. current Product ↔ offer ↔ SKU identity baseline;
3. current status/visibility fields where the bridge exposes them;
4. current price/stock only where needed for the passport;
5. product/attribute/media facts only through verified current operations.

Fresh collection is **not** needed merely to recreate historical ordered_units/revenue windows already committed.

---

# 06.1 inventory verdict

Existing evidence is sufficient to:
- define the passport schema;
- create a provisional direct high-priority SKU mapping;
- prove that the R3 priority families are represented in historical Ozon seller data;
- identify exact missing current/detailed fields.

It is not sufficient to declare a complete current SKU master because the 2026-08-11 stock snapshot had unresolved completeness/pagination status and dynamic listing facts are stale.

Next: verify the **current v0.1.19 Ozon bridge enumeration contract** and run one explicit fresh assortment/listing measurement before any fan-out.
