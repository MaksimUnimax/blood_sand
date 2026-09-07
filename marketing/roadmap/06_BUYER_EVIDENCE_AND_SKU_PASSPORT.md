# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — 06.1 COMPLETE; 06.2 COMPLETE; 06.3 COMPLETE; Tier A product-info 5/5 COMPLETE; NEXT ATTRIBUTES**  
Дата старта: **2026-08-26**  
Последнее продолжение: **2026-09-07**

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

Historical baseline:
- product-level snapshot completeness: **76/76 PROVEN**;
- 90d ordered units across current-snapshot identities: **1519**;
- Slavic symbols: 25 / 928 ordered units;
- zodiac families: 37 / 356;
- Norse/runic: 4 / 128;
- remaining: 10 / 107.

R3 priority identities present:
- Печать Велеса;
- Велес;
- Алатырь;
- Vegvisir;
- Шлем Ужаса.

06.1 completion: **PASS**.

---

## 06.2 — Fresh Ozon assortment/listing baseline

Status: **[x] COMPLETE**

Fresh sequence:
1. page 1 — request `7c5e5bc9-4208-44e4-8651-296eb4ce6a7f`, HTTP 200, 76 items, `total=76`, non-empty cursor;
2. explicit continuation — request `91bbb10d-3ad3-4f39-bda7-b838637e05ac`, HTTP 200, `items=[]`, `total=76`, empty cursor;
3. terminal status: **TERMINAL_76_OF_76_PROVEN**;
4. fresh-vs-historical `product_id + SKU`: **76/76 exact matches**;
5. additions/removals/unresolved: **0 / 0 / 0**.

Artifacts:
- `marketing/data/raw/marketplace/ozon/20260826T1102Z__ozon__stocks-current__fresh-page1.md`
- `marketing/data/raw/marketplace/ozon/20260826__ozon__stocks-current__fresh-terminal.md`
- `marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`
- `marketing/research/R4_OZON_FRESH_BASELINE_RESULT_2026-08-26.md`

06.2 completion: **PASS**.

---

## 06.3 — Map current assortment to opportunities / product families

Status: **[x] COMPLETE**

Canonical artifacts:
- `marketing/data/normalized/products/product_opportunity_map.csv`
- `marketing/research/R4_STAGE06_ASSORTMENT_OPPORTUNITY_MAPPING_2026-08-26.md`

Coverage:
- current identities represented: **76/76**;
- relation/unmapped rows: **93**;
- identities with accepted/reopen relation: **67**;
- identities with no accepted R3 relation: **9**;
- unresolved joins: **0**.

Resolved boundaries:
- OU02 `Печать Велеса` and OU06 broader `Велес` remain separate current seller identities;
- OU03 is use-case/function; OU04 is mirror-pendant form factor;
- all 37 zodiac identities remain current, satisfying the assortment-side OU09 reopen trigger but not overriding the R3 broad-search rejection;
- 9 current products remain intentionally unmapped.

Targeted enrichment queue:
- Tier A: Печать Велеса, Велес, Алатырь, Vegvisir, Шлем Ужаса;
- Tier B contrast: Бусидо / current `Талисман в машину` offer;
- Tier C zodiac representatives: classic Овен, antique Лев, symbols Близнецы.

06.3 completion: **PASS**.

---

## Tier A product-passport enrichment

Status: **[~] PRODUCT INFO 5/5 COMPLETE; ATTRIBUTES NEXT**

Contract authority:
- `marketing/research/R4_STAGE06_OZON_TIER_A_ENRICHMENT_CONTRACT_2026-08-26.md`

Historical runtime-mismatch evidence retained:
- `marketing/research/R4_OZON_RUNTIME_B8_MISMATCH_2026-08-26.md`
- `marketing/data/raw/marketplace/ozon/20260826T1139Z__ozon__seller-product-info-list__runtime-unsupported.md`

### Runtime blocker resolution — 2026-09-07

Current operator runtime successfully accepted and executed `seller_product_info_list`:
- request `4a6a224d-43ae-4c7a-a99f-c9842273e43e`;
- HTTP 200;
- `external_request_executed=true`;
- one physical Seller request;
- result: **5/5 Tier A SKUs returned**.

Artifacts:
- `marketing/data/raw/marketplace/ozon/20260907T1221Z__ozon__seller-product-info-list__tier-a5.md`
- `marketing/data/normalized/products/20260907__ozon__tier-a5__product-info.csv`
- `marketing/research/R4_STAGE06_TIER_A_PRODUCT_INFO_RESULT_2026-09-07.md`

### Product-info conclusions

Fresh direct seller listing titles now prove the automotive mirror-pendant framing for all five Tier A identities:
- Шлем Ужаса: `Амулет - Подвеска на зеркало в машину ...`;
- Vegvisir: `Амулет - Подвеска на зеркало в машину ...`;
- Велес: `Славянский оберег - Подвеска на зеркало в машину ...`;
- Печать Велеса: `Славянский оберег - Подвеска на зеркало в машину ...`;
- Алатырь: `Славянский оберег - Подвеска на зеркало в машину ...`.

Thus OU04 `FORM_FACTOR_FIT` no longer relies only on historical listing-title evidence for Tier A; it has fresh direct seller evidence. OU03 automotive symbolic/use-case framing is also directly supported by `оберег/амулет + в машину` wording.

All five are currently:
- `Продается`;
- moderation `approved`;
- validation `success`;
- not archived;
- price `1700 RUB`, min price `1450`, old price `2200` in this snapshot.

Current passport completeness after product-info: **IDENTITY_COMMERCE**.

Still missing decision-grade physical/content facts such as material, dimensions, cord/bead/hanging construction and package/content attributes. Therefore a targeted attributes request for exactly the same five SKUs is authorized.

Exact next command:

```text
OZON_API_V1
{"operation":"seller_product_attributes","params":{"filter":{"sku":["1636048691","1636041142","1640251697","1602722942","1602717077"]},"last_id":"","limit":1000,"sort_by":"sku","sort_dir":"ASC"}}
```

No broad 76-SKU attributes pull yet.

---

## 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[ ] NEXT, after Tier A attributes normalization**

Normalize customer themes and seller performance while keeping motivation separate from sales. Expand Tier B/C enrichment only when Tier A results show a concrete decision need.

## 06.5 — Cross-platform / WB status

Status: **[ ] WAIT**

WB seller-side evidence must be measured through an accepted channel or explicitly marked `BLOCKED/NOT_AVAILABLE`. Public snippets do not substitute.

## 06.6 — Final passports + Stage 07 handoff

Status: **[ ] WAIT**

Close only when current Ozon baseline, opportunity mapping, technical-fact gaps, buyer evidence and WB coverage status are explicit and provenance-safe.

---

# Current continuation point

**Run exactly one Tier A `seller_product_attributes` request for SKUs `1636048691`, `1636041142`, `1640251697`, `1602722942`, `1602717077`; save and normalize the direct result before any Tier B/C or buyer/performance expansion.**
