# R4 — Stage 06 evidence inventory — 2026-08-26

Status: **06.1 COMPLETE — CORRECTED AFTER ACCEPTED-BRANCH RECOVERY**

Purpose: establish exactly what buyer/SKU evidence already exists before requesting fresh marketplace data.

## Correction note

The first 06.1 pass saw the initial 2026-08-11 stock page in `main` but not the later accepted-branch terminal continuation/master. A subsequent audit of the accepted Ozon v0.1.19 lineage recovered those missing research artifacts.

Therefore the correct historical fact is:

**the 2026-08-11/12 product-level Ozon `stocks_current` snapshot is proven complete at 76 current product identities.**

The snapshot is still dated and must not be treated as current on 2026-08-26.

Recovered into `main`:
- `marketing/data/raw/marketplace/ozon/20260812T0148Z__ozon__stocks-current__terminal.json`
- `marketing/data/normalized/marketplace/ozon/20260812__ozon__product-master__current76.csv`
- `marketing/data/normalized/marketplace/ozon/OZON_PRODUCT_FAMILY_BASELINE_2026-08-12.md`

---

## 1. Historical complete Ozon assortment baseline

Initial raw page:
- `marketing/data/raw/marketplace/ozon/20260811T1025Z__ozon__stocks-current__all.json`
- request `30418b9b-1908-4cb2-a9da-9841ec4ece8a`
- HTTP 200
- total 76
- non-empty continuation cursor

Terminal continuation:
- `marketing/data/raw/marketplace/ozon/20260812T0148Z__ozon__stocks-current__terminal.json`
- request `c1258c03-c621-4088-8b86-6b7427f503d1`
- HTTP 200
- `items=[]`
- `total=76`
- `cursor=""`

Accepted interpretation:
- pagination complete: **true**;
- additional terminal items: **0**;
- complete product-level current-snapshot count: **76**.

This is direct historical seller evidence, not a current 2026-08-26 listing census.

### Current-snapshot research families

Recovered 76-row current-only normalized master:
- `marketing/data/normalized/marketplace/ozon/20260812__ozon__product-master__current76.csv`

Validated composition from accepted baseline:

| Product family | Current SKU count | 90d ordered units | Share of 1519 |
|---|---:|---:|---:|
| `slavic_symbols_oberegs` | 25 | 928 | 61.1% |
| `zodiac_classic` | 12 | 171 | 11.3% |
| `zodiac_symbols` | 12 | 102 | 6.7% |
| `zodiac_antique` | 13 | 83 | 5.5% |
| `norse_runic` | 4 | 128 | 8.4% |
| `patriotic` | 2 | 33 | 2.2% |
| `orthodox_christian` | 2 | 28 | 1.8% |
| `universal_symbols` | 3 | 27 | 1.8% |
| `warrior_talismans` | 3 | 19 | 1.3% |
| **TOTAL** | **76** | **1519** | **100.0%** |

Important: `product_family` is a research classification from observed seller naming, not official Ozon category taxonomy.

### Direct R3-priority identities

| Product | product_id | SKU | 90d ordered_units |
|---|---:|---:|---:|
| Печать Велеса | 1119965443 | 1636048691 | 385 |
| Велес | 1119957837 | 1636041142 | 48 |
| Алатырь (Крест Сварога) | 1124658338 | 1640251697 | 84 |
| Вегвизир - Рунический компас | 1082862005 | 1602722942 | 84 |
| Шлем ужаса - Эгисхьяльм | 1082855228 | 1602717077 | 22 |

These identities directly confirm that OU02/OU05/OU06/OU07/OU08 map to real seller assortment in the historical complete snapshot.

The master also proves actual depth for OU01 Slavic category and three distinct zodiac variant families relevant to the OU09 reopen test.

---

## 2. Historical Ozon performance evidence

Successful analytics windows already committed:
- 2026-07-12..2026-08-10;
- 2026-06-12..2026-07-11;
- 2026-05-13..2026-08-10;
- 2026-08-04..2026-08-10.

Accepted metric semantics:
- `ordered_units`;
- `revenue`.

90-day complete-family baseline:
- total ordered units across the 76 current-snapshot identities: **1519**.

One-week 2026-08-04..2026-08-10 response:
- ordered_units total: **153**;
- revenue total: **250,798 ₽**.

Examples:
- Печать Велеса 35 / 56,644 ₽;
- Алатырь 16 / 26,843 ₽;
- Колядник 10 / 16,643 ₽;
- Вегвизир 6 / 9,843 ₽;
- Шлем Ужаса 1 / 1,700 ₽.

Rules:
- revenue is not margin/profit;
- sales do not prove buyer motivation;
- low/zero units do not prove weak product quality without exposure context.

Failed/ambiguous session/search-query probes remain non-metrics and are not normalized as buyer evidence.

---

## 3. Existing customer evidence

Canonical report:
- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`

It is analog/category customer evidence, not an owned-customer census.

Repeated documented themes:
- appearance in real car;
- size / visual bulk;
- material / finish / aging;
- cord and attachment quality;
- heat / sun resistance;
- packaging / gift motive;
- trust/reviews.

Future product-passport obligations:
- exact dimensions / thickness / weight / total length;
- material/coating;
- cord/bead/tassel construction;
- hanging/attachment method;
- packaging/contents;
- real in-car scale media;
- durability claims only when directly supported.

---

## 4. Stage 06 normalized layer

Canonical schema now exists:
- `marketing/data/PRODUCT_SKU_PASSPORT_SCHEMA.md`

Provisional high-priority mapping:
- `marketing/data/normalized/products/20260826__provisional_priority_sku_opportunity_map.csv`

Recovered historical 76-item master:
- `marketing/data/normalized/marketplace/ozon/20260812__ozon__product-master__current76.csv`

A new **current** 2026-08-26 listing/passport master still does not exist.

---

## 5. R3 questions already answered by historical assortment evidence

### OU01 — Slavic category depth
Historical Ozon snapshot: **YES, substantial** — 25 current `slavic_symbols_oberegs` identities and 928 / 1519 90d ordered units in the accepted research family model.

This supports assortment depth, not future IA.

### OU02 vs OU06 — Печать Велеса vs broader Велес
Historical seller data contains **separate live-snapshot identities**:
- `Печать Велеса`;
- `Велес`.

Therefore the R3 distinction is not theoretical. Exact variant/product hierarchy still needs current product-detail facts.

### OU05 / OU07 / OU08
Алатырь, Vegvisir and Шлем Ужаса all have direct seller identities and non-zero 90d ordered units.

### OU09 zodiac reopen test
The actual seller assortment contains three separate zodiac research families:
- 12 classic;
- 12 symbols;
- 13 antique;
with combined 356 / 1519 historical 90d ordered units.

This **reopens the product-assortment question**, but does not overturn R3 Search conclusion that broad zodiac acquisition intent is contaminated. Stage 06 must preserve both facts.

---

## 6. Wildberries status

Repository evidence still shows:
- WB API research exists;
- accepted seller-side WB bridge/channel is not available in `main`;
- public Search snippets cannot substitute for seller-side WB evidence.

Stage 06 will explicitly mark this platform layer measured or blocked; it will not start bridge development as research work.

---

## 7. What actually needs fresh Ozon collection

Because a complete historical 76-item baseline already exists, fresh collection is now narrower:

1. refresh current 2026-08-26 product identity/stock presence;
2. compare identity set to the historical 76 baseline;
3. only then collect current product detail/attributes/price/status facts needed by the passport where the current v0.1.19 allowlist actually supports them;
4. do not re-run old 90-day analytics merely to reconstruct the already-preserved historical baseline.

## 06.1 final verdict

**PASS.** Stage 06 starts from a proven complete historical 76-item Ozon assortment baseline plus 90-day seller performance, not from an incomplete stock page.

The remaining reason for a fresh Ozon call is **currentness/change detection**, not historical completeness.

Next: one v0.1.19 `stocks_current` fresh page with the documented maximum `limit=1000`, then inspect its returned cursor before any continuation or fan-out.
