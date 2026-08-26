# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — 06.1 COMPLETE; 06.2 COMPLETE; 06.3 COMPLETE; Tier A enrichment BLOCKED BY RUNTIME DEPLOYMENT MISMATCH**  
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

Status: **[x] COMPLETE**

Purpose: **currentness/change detection**, not reconstruction of historical completeness.

Fresh sequence:
1. page 1 — request `7c5e5bc9-4208-44e4-8651-296eb4ce6a7f`, HTTP 200, 76 items, `total=76`, non-empty cursor;
2. explicit continuation — request `91bbb10d-3ad3-4f39-bda7-b838637e05ac`, HTTP 200, `items=[]`, `total=76`, empty cursor;
3. terminal status: **TERMINAL_76_OF_76_PROVEN**;
4. fresh-vs-historical `product_id + SKU` identity comparison: **76/76 exact matches**;
5. additions: **0**; removals: **0**; unresolved returned identities: **0**.

Artifacts:
- `marketing/data/raw/marketplace/ozon/20260826T1102Z__ozon__stocks-current__fresh-page1.md`
- `marketing/data/raw/marketplace/ozon/20260826__ozon__stocks-current__fresh-terminal.md`
- `marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`
- `marketing/research/R4_OZON_FRESH_BASELINE_RESULT_2026-08-26.md`

Interpretation:
- no Ozon assortment identity churn detected versus the proven 2026-08-11/12 baseline at the `product_id + SKU` level;
- this does **not** imply unchanged price, attributes, listing state, stock quantities, media or performance;
- targeted detail/attribute/price/status enrichment remains a passport obligation, but is selected after 06.3 mapping so calls are decision-driven rather than indiscriminate across all 76 listings.

06.2 completion criterion:
- explicit terminal/completeness evidence — **PASS**;
- every returned listing identity normalized or unresolved — **76 normalized / 0 unresolved**.

06.2 completion: **PASS**.

---

## 06.3 — Map current assortment to opportunities / product families

Status: **[x] COMPLETE**

Canonical artifacts:
- `marketing/data/normalized/products/product_opportunity_map.csv`
- `marketing/research/R4_STAGE06_ASSORTMENT_OPPORTUNITY_MAPPING_2026-08-26.md`

Coverage:
- fresh current identities represented: **76/76**;
- relation/unmapped rows: **93**;
- identities with at least one accepted/reopen relation: **67**;
- identities with no accepted R3 relation: **9**;
- unresolved joins: **0**.

Resolved boundaries:
- OU02 specific `Печать Велеса` and OU06 broader `Велес` remain separate current seller identities; both are also OU01 category members;
- OU03 remains a function/use-case relation and OU04 remains a mirror-pendant form relation; historical explicit listing-title evidence is carried only with provenance `MAPPED_HISTORICAL_LISTING_TITLE`, not silently upgraded to a fresh physical-product observation;
- current named priority identities for Печать Велеса, Алатырь, Велес, Vegvisir and Шлем Ужаса are present;
- all 37 zodiac identities remain current across classic/symbols/antique seller families, so OU09 meets the **assortment-side reopen trigger** but remains a product/buyer investigation rather than a primary broad acquisition lane;
- 9 real current products have no accepted R3 relation and remain explicitly unmapped rather than retroactively forced into an opportunity.

Targeted enrichment queue selected from decision need:
- Tier A: Печать Велеса, Велес, Алатырь, Vegvisir, Шлем Ужаса;
- Tier B contrast: Бусидо / current `Талисман в машину` offer;
- Tier C zodiac representatives: classic Овен, antique Лев, symbols Близнецы.

06.3 completion: **PASS**.

---

## Tier A product-passport enrichment gate

Status: **[x] CONTRACT VERIFIED; [!] RUNNING RUNTIME MISMATCH; [ ] RUN 1 PENDING AFTER B8 RELOAD**

Contract artifact:
- `marketing/research/R4_STAGE06_OZON_TIER_A_ENRICHMENT_CONTRACT_2026-08-26.md`

Runtime mismatch checkpoint:
- `marketing/research/R4_OZON_RUNTIME_B8_MISMATCH_2026-08-26.md`
- raw direct result: `marketing/data/raw/marketplace/ozon/20260826T1139Z__ozon__seller-product-info-list__runtime-unsupported.md`

Current accepted B8 v0.1.19 carries forward B1 Assortment Master. Exact supported read operations include:
- `seller_product_info_list` -> `POST /v3/product/info/list`;
- `seller_product_attributes` -> `POST /v4/product/info/attributes`.

The first five-SKU request was attempted once but was rejected locally before provider execution:
- observed running guidance protocol: `OZON_GUIDANCE_RESULT_V1`, `guidance_version=1`;
- `UNSUPPORTED_OPERATION` for `seller_product_info_list`;
- only the six legacy guidance clusters were exposed;
- `external_request_executed=false`;
- `physical_business_request_count=0`;
- no Seller HTTP request occurred.

Classification: **LOCAL_RUNTIME_OPERATION_REGISTRY_MISMATCH**. The running extension shares version string `0.1.19` but is not the accepted B8 production tree.

Accepted B8 deployment authority:
- workflow run `32956210474`;
- head `d40d213de9c6d753f21525a4797671401d585218`;
- Actions artifact `9602060227` / `ozon-b8-supply-replenishment-candidate`;
- GitHub digest `sha256:1b2b7bef857f705c1fe4b960c8d32f3cd205dca89eb16736b576bb1a77c61db9`;
- accepted production tree SHA-256 `c96f993566ff0e715cd7959182ef787639d20accfb578de2e8495b85a79d6d84`.

Do not retry any B1+ operation against the current runtime. Reload the accepted B8 exact extension tree first, then retry the same one-request five-SKU command.

---

## 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[ ] NEXT, after minimum targeted passport enrichment**

Normalize customer themes and seller performance while keeping motivation separate from sales.

Before broad buyer/performance linkage, collect only the minimum current product detail/attribute evidence needed to resolve Tier A product passport gaps and the OU03/OU04 / OU02/OU06 boundary questions. Expand to Tier B/C only if the Tier A result shows it is decision-relevant.

## 06.5 — Cross-platform / WB status

Status: **[ ] WAIT**

WB seller-side evidence must be measured through an accepted channel or explicitly marked `BLOCKED/NOT_AVAILABLE`. Public snippets do not substitute. No extension development inside Stage 06.

## 06.6 — Final passports + Stage 07 handoff

Status: **[ ] WAIT**

Close only when current Ozon baseline, opportunity mapping, technical-fact gaps, buyer evidence and WB coverage status are explicit and provenance-safe.

---

# Current continuation point

**Replace/reload the running extension with the accepted B8 Actions artifact (`ozon-b8-exact/` tree), then retry exactly one Tier A `seller_product_info_list` request for SKUs `1636048691`, `1636041142`, `1640251697`, `1602722942`, `1602717077`. Save and normalize the direct result before any separate attributes call.**
