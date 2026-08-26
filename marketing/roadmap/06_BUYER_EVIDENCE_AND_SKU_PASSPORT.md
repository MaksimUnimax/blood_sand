# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — 06.1 COMPLETE; NEXT 06.2**  
Дата старта: **2026-08-26**

## Цель

Связать opportunity map R3 с **реальным ассортиментом Blood & Sand**, seller-side marketplace facts и покупательским evidence, чтобы перед конкурентами/экономикой понимать:

- какие реальные SKU закрывают OU01–OU08;
- какие product families действительно существуют в ассортименте;
- чем отличаются близкие SKU/варианты;
- что покупателю важно при выборе и использовании;
- какие товарные факты уже доказаны, а какие ещё отсутствуют;
- какие seller/platform facts можно использовать дальше без подмены их гипотезами.

Пункт 06 **не назначает финальную IA/Page Jobs** и **не считает экономику канала**.

## Canonical inputs

- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`
- `marketing/data/registry/marketplace_measurements.csv`
- `marketing/data/raw/marketplace/ozon/`
- `marketing/data/DATA_SCHEMA_CONTRACT.md`
- `marketing/data/PRODUCT_SKU_PASSPORT_SCHEMA.md`

## Evidence discipline

1. Product identity, listing identity, marketplace SKU and seller offer/article are separate fields.
2. Dynamic facts (price, stock, orders, revenue, rating) are dated/period-scoped.
3. Revenue is not margin/profit.
4. Sales/performance do not prove buyer motivation.
5. Product title can support identity/form-factor facts, but not unobserved material/quality/meaning claims.
6. Customer reasons require customer/review/question evidence; they are not inferred from order counts.
7. Missing physical/product facts remain `NOT_MEASURED` / `NOT_AVAILABLE`.
8. Ozon facts do not imply Wildberries facts.
9. No personal data beyond aggregate research need.
10. Extension/bridge engineering is not Stage 06 work.
11. Every completed evidence pass is committed before moving on.
12. No final IA/Page Job is frozen in Stage 06.

---

# 06.1 — Existing evidence inventory + passport schema

Status: **[x] COMPLETE**

Artifacts:
- `marketing/research/R4_STAGE06_EVIDENCE_INVENTORY_2026-08-26.md`
- `marketing/data/PRODUCT_SKU_PASSPORT_SCHEMA.md`
- `marketing/data/normalized/products/20260826__provisional_priority_sku_opportunity_map.csv`

Direct reusable evidence confirmed:
- historical Ozon stocks snapshot 2026-08-11, provider-reported total 76 but completeness/pagination not accepted as final master;
- multiple successful Ozon SKU analytics periods with `ordered_units` and `revenue`;
- direct priority identities for Печать Велеса, separate Велес, Алатырь, Vegvisir, Шлем Ужаса and zodiac listings;
- historical category-level customer evidence for auto pendants / Печать Велеса-like products.

Direct one-week seller evidence 2026-08-04..2026-08-10 includes:
- Печать Велеса 35 ordered units / 56,644 ₽ revenue;
- Алатырь 16 / 26,843 ₽;
- Колядник 10 / 16,643 ₽;
- Vegvisir 6 / 9,843 ₽;
- Шлем Ужаса 1 / 1,700 ₽;
- response total 153 ordered units / 250,798 ₽ revenue.

These are dated marketplace facts, not margin/profit or buyer-motive evidence.

Completion criterion: **PASS** — reusable evidence and missing fields are now explicit; no blind recollection required.

# 06.2 — Fresh Ozon assortment/listing baseline

Status: **[ ] NEXT**  
Estimated: **1–3 runs depending on explicit pagination/operations**

Work:
- verify exact current v0.1.19 bridge command contract from repository before execution;
- obtain fresh explicit seller-side enumeration/current listing identity snapshot;
- obtain only additional facts required by passport and supported by current bridge;
- preserve explicit pagination/request provenance;
- normalize Product ↔ Listing ↔ SKU ↔ offer/article identity.

Expected result:
- current Ozon assortment baseline;
- historical Aug-11 stock/analytics evidence retained rather than overwritten.

Completion criterion:
- every listing returned by the canonical fresh enumeration has stable identity or explicit unresolved status.

# 06.3 — Map real assortment to opportunities / product families

Status: **[ ] WAIT**  
Estimated: **1–2 runs**

Work:
- map current SKUs to OU01–OU08;
- resolve real Veles hierarchy;
- separate automotive protection vs mirror-pendant form at product level;
- confirm current Алатырь, Vegvisir and Шлем Ужаса variants;
- evaluate coherent zodiac SKU family;
- mark unmapped products explicitly.

# 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[ ] WAIT**  
Estimated: **1–3 runs**

Work:
- normalize existing customer themes;
- add owned seller-side customer evidence only via supported read surfaces;
- normalize Ozon ordered_units/revenue by period and SKU;
- keep performance separate from motivation.

# 06.5 — Cross-platform status / Wildberries gap

Status: **[ ] WAIT**

Current known state:
- WB official API research exists;
- accepted seller-side WB bridge/channel is not available in `main`;
- public snippets do not substitute for seller data;
- no WB extension development inside this stage.

# 06.6 — Final SKU passports + Stage 07 handoff

Status: **[ ] WAIT**

Completion remains:
- every current Ozon listing in chosen baseline gets a passport row;
- OU01–OU08 have real assortment mapping or explicit gap;
- technical/customer/performance facts have provenance/status;
- WB coverage status explicit;
- no final IA/Page Jobs assigned.

---

# Current continuation point

**NEXT: verify current Ozon v0.1.19 enumeration contract and execute exactly one fresh assortment/listing measurement before any fan-out.**
