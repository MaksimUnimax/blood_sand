# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — 06.1 COMPLETE; 06.2 NEXT**  
Дата старта: **2026-08-26**

## Цель

Связать R3 opportunity map с реальным ассортиментом Blood & Sand, seller-side marketplace facts и buyer/customer evidence. Stage 06 не назначает финальную IA/Page Jobs и не считает финальную экономику.

## Canonical inputs

- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`
- `marketing/research/R4_STAGE06_EVIDENCE_INVENTORY_2026-08-26.md`
- `marketing/data/PRODUCT_SKU_PASSPORT_SCHEMA.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/data/registry/marketplace_measurements.csv`
- `marketing/data/raw/marketplace/ozon/`
- `marketing/data/normalized/marketplace/ozon/`
- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`

## Evidence rules

- Product / listing / SKU / seller offer identities remain separate.
- Dynamic marketplace facts are dated/period-scoped.
- Revenue is not margin/profit.
- Sales do not prove buyer motivation.
- Missing product facts remain explicit missing statuses.
- Ozon evidence does not imply WB evidence.
- Extension engineering is not Stage 06 work.
- Every completed pass is committed before proceeding.
- No final IA/Page Jobs in Stage 06.

---

## 06.1 — Existing evidence inventory + passport schema

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R4_STAGE06_EVIDENCE_INVENTORY_2026-08-26.md`
- `marketing/data/PRODUCT_SKU_PASSPORT_SCHEMA.md`
- `marketing/data/normalized/products/20260826__provisional_priority_sku_opportunity_map.csv`
- `marketing/data/raw/marketplace/ozon/20260812T0148Z__ozon__stocks-current__terminal.json`
- `marketing/data/normalized/marketplace/ozon/20260812__ozon__product-master__current76.csv`
- `marketing/data/normalized/marketplace/ozon/OZON_PRODUCT_FAMILY_BASELINE_2026-08-12.md`

Correct historical baseline:
- initial stocks page total: 76;
- terminal continuation: 0 new items + empty cursor;
- historical 2026-08-11/12 product-level snapshot completeness: **76/76 PROVEN**;
- 90d ordered units across those 76 current-snapshot identities: **1519**.

Historical research-family composition:
- Slavic symbols: 25 / 928 ordered units;
- zodiac classic + symbols + antique: 37 / 356;
- Norse/runic: 4 / 128;
- remaining families: 10 / 107.

R3 priority seller identities directly present historically:
- Печать Велеса;
- separate Велес;
- Алатырь;
- Vegvisir;
- Шлем Ужаса.

Zodiac has three real seller variant families, so Stage 06 keeps a narrow product-level reopen test while preserving R3's broad-search contamination conclusion.

06.1 completion: **PASS**.

---

## 06.2 — Fresh Ozon assortment/listing baseline

Status: **[ ] NEXT**

Purpose is now **currentness/change detection**, not reconstruction of historical completeness.

First gate:
- verify v0.1.19 live contract before execution — COMPLETE;
- `stocks_current` supports `filter:{}` and `limit` 1..1000;
- each explicit command remains bounded to one physical provider request;
- no hidden pagination is assumed.

Execution sequence:
1. one fresh `stocks_current` request with `filter:{}`, `limit:1000`;
2. inspect returned `items`, `total`, `cursor`;
3. only if cursor is non-empty, issue an explicit continuation after verifying its exact request shape;
4. compare fresh identity set with historical 76;
5. collect detail/attribute/price/status facts only where current bridge operations support them and only where needed for passport.

Completion criterion:
- fresh enumeration has explicit terminal/completeness evidence;
- every returned listing identity is normalized or marked unresolved.

---

## 06.3 — Map current assortment to opportunities / product families

Status: **[ ] WAIT**

Must resolve:
- OU02 specific Печать Велеса vs OU06 broader Veles family;
- OU03 protection/use-case vs OU04 mirror form at SKU level;
- current Алатырь / Vegvisir / Шлем Ужаса variants;
- zodiac product-family reopen test;
- unmapped current products.

## 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[ ] WAIT**

Normalize customer themes and seller performance while keeping motivation separate from sales.

## 06.5 — Cross-platform / WB status

Status: **[ ] WAIT**

WB seller-side evidence must be measured through an accepted channel or explicitly marked `BLOCKED/NOT_AVAILABLE`. Public snippets do not substitute. No extension development inside Stage 06.

## 06.6 — Final passports + Stage 07 handoff

Status: **[ ] WAIT**

Close only when current Ozon baseline, opportunity mapping, technical-fact gaps, buyer evidence and WB coverage status are explicit and provenance-safe.

---

# Current continuation point

**06.2: execute one fresh v0.1.19 `stocks_current` request with empty filter and `limit=1000`; inspect cursor before doing anything else.**
