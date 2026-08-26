# 06 — Buyer + SKU Evidence

Статус: **[~] В РАБОТЕ**  
Дата старта: 2026-08-26

## Цель

Преобразовать opportunity map этапа 05 в product-grounded evidence: понять, какие реальные SKU поддерживают OU01–OU08, какие buyer jobs они фактически закрывают, чем отличаются, что покупатель должен знать до покупки и где ассортимент не подтверждает поисковую возможность.

Этот этап **не** фиксирует финальную IA, URL count, Page Jobs или UI. Он даёт продуктовую и покупательскую основу для этапов 07–09.

## Жёсткие правила

1. Marketplace/customer facts хранятся отдельно от hypotheses/decisions.
2. `0` не равен `NOT_MEASURED`; отсутствие данных фиксируется явным status.
3. Нельзя переносить характеристики похожих товаров на Blood & Sand SKU без прямого evidence.
4. Нельзя объявлять SKU sellable/current только по старому названию или SERP visibility; нужен seller-side evidence.
5. Один физический/коммерческий SKU может поддерживать несколько buyer jobs и несколько opportunity units.
6. OU09/OU10 не возвращаются в primary только из-за существования товара; нужны product + buyer + commercial evidence.
7. После каждого законченного measurement/normalization pass — commit в GitHub до следующего прохода.

---

# 06.1 — Inventory reusable evidence + canonical passport schema + provisional SKU↔opportunity map

Статус: **[x] COMPLETE — 2026-08-26**

## Reusable evidence уже в репозитории

### Seller-side Ozon

- current-stock snapshot: 76 product records;
- `product_id`, `offer_id`, Ozon `sku`, FBO/FBS present/reserved stock;
- SKU-level `ordered_units` + `revenue` windows, включая 90-day slice `2026-05-13..2026-08-10`;
- shorter analytics windows for recency comparison;
- registry with measurement IDs/provenance.

Canonical raw refs:

- `marketing/data/raw/marketplace/ozon/20260811T1025Z__ozon__stocks-current__all.json`
- `marketing/data/raw/marketplace/ozon/20260811T104232Z__ozon__analytics-data__sku__20260513_20260810.json`
- `marketing/data/raw/marketplace/ozon/20260811T103640Z__ozon__analytics-data__sku__20260712_20260810.json`
- `marketing/data/raw/marketplace/ozon/20260811T113929Z__ozon__analytics-data__sku__20260804_20260810.json`
- `marketing/data/registry/marketplace_measurements.csv`

### Customer evidence

Reusable buyer-topic research exists for automotive pendants / Печать Велеса:

- appearance in real car;
- size / visual bulk;
- material and darkening risk;
- cord / attachment / weak points;
- sunlight/heat durability;
- gift motive / packaging;
- trust/reviews.

Canonical ref:

- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`

### Search / Alice / opportunity evidence

Stage 05 provides OU01–OU10 boundaries and exact Stage 06 questions. Reuse, do not re-run paid Search by default.

Canonical ref:

- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`

## Evidence currently missing / not yet normalized

As of this checkpoint:

- no normalized full SKU passport table;
- no complete current product-info/attributes/media snapshot in `marketing/data/raw/marketplace/`;
- no seller-side raw Wildberries measurement stored under `marketing/data/raw/marketplace/`;
- no own-SKU normalized dimensions/material/coating/cord/beads/tassel/mount/packaging/contents evidence;
- no own-SKU review/question evidence normalized by buyer topic;
- no current rating/review-count field joined to each SKU;
- no direct image-asset audit by required view (`studio`, `in_car`, `back`, `mount`, `package`, `scale`, `video`);
- no canonical SKU family hierarchy yet;
- no cross-platform Ozon↔WB identity mapping yet.

These are Stage 06 work items, not assumptions.

---

# Canonical SKU passport schema v1

A passport is one canonical product/SKU record with source-specific listing evidence attached. Unknown values remain null with explicit status.

## A. Identity

- `passport_id`
- `canonical_product_name`
- `family_name`
- `symbol_name`
- `variant_name`
- `product_form`
- `platform`
- `platform_product_id`
- `platform_sku`
- `offer_id`
- `listing_title`
- `listing_status`
- `sellable_status`
- `identity_status`

## B. Opportunity / buyer-job mapping

- `primary_opportunity_id`
- `secondary_opportunity_ids`
- `buyer_job_primary`
- `buyer_job_secondary`
- `mapping_status`
- `mapping_evidence_ref`

## C. Physical product facts

- `medallion_width_mm`
- `medallion_height_mm`
- `medallion_thickness_mm`
- `weight_g`
- `total_hanging_length_mm`
- `medallion_material`
- `surface_finish_or_coating`
- `cord_material`
- `cord_length_mm`
- `cord_adjustable`
- `bead_count`
- `bead_material`
- `bead_size_mm`
- `tassel_material`
- `mount_construction`
- `rear_side_description`
- `package_type`
- `package_dimensions`
- `package_contents`
- `physical_facts_status`
- `physical_evidence_ref`

## D. Commerce / availability

- `price_current`
- `price_status`
- `stock_fbo_present`
- `stock_fbo_reserved`
- `stock_fbs_present`
- `stock_fbs_reserved`
- `stock_observed_at`
- `ordered_units_7d`
- `revenue_7d`
- `ordered_units_30d`
- `revenue_30d`
- `ordered_units_90d`
- `revenue_90d`
- `rating`
- `review_count`
- `commerce_status`
- `commerce_evidence_ref`

## E. Buyer evidence

- `meaning_choice_driver_status`
- `visual_choice_driver_status`
- `material_choice_driver_status`
- `car_use_case_driver_status`
- `gift_driver_status`
- `price_driver_status`
- `reviews_social_proof_status`
- `buyer_questions_summary`
- `buyer_praise_summary`
- `buyer_complaints_summary`
- `buyer_evidence_ref`

## F. Content-asset coverage

- `asset_studio_front`
- `asset_studio_back`
- `asset_scale_reference`
- `asset_in_car`
- `asset_mount_closeup`
- `asset_cord_closeup`
- `asset_package`
- `asset_video`
- `asset_status`
- `asset_evidence_ref`

## G. Provenance / quality

- `observed_at`
- `observed_at_precision`
- `source_type`
- `evidence_mode`
- `record_status`
- `notes`

Canonical schema artifact: `marketing/data/SKU_PASSPORT_SCHEMA_V1.md`.

---

# Provisional mapping rules

- OU01 — Slavic category: any directly confirmed Slavic symbol SKU can support category breadth.
- OU02 — Печать Велеса: only Печать Велеса-specific SKU/variants.
- OU03 — automotive protection/use-case: only when product positioning/evidence supports protection/use-case, not merely because it hangs in a car.
- OU04 — mirror-pendant form factor: automotive hanging pendant/listing form.
- OU05 — Алатырь-specific SKU.
- OU06 — broader Велес family distinct from Печать Велеса.
- OU07 — Vegvisir-specific SKU.
- OU08 — Шлем Ужаса / Ægishjálmur-specific SKU.
- OU09 remains `REJECT_AS_PRIMARY`, but zodiac SKU existence is recorded as reopen evidence.
- non-symbol/generic/form-only SKUs may map to OU04 while remaining outside named-symbol opportunities.

Provisional mapping artifact:

- `marketing/data/normalized/sku_passport/20260826__sku_opportunity_mapping_provisional_v1.csv`

---

# 06.2 — Build current Ozon product passport baseline

Статус: **[ ] NEXT**

Required evidence:

1. complete current product/listing identity for all seller products;
2. current listing titles/status/visibility;
3. attributes sufficient for material/dimensions/product-form fields;
4. media/image references where API exposes them;
5. current price;
6. current stocks joined to identity;
7. seller analytics windows joined by SKU;
8. explicit unresolved fields retained as `NOT_MEASURED` / `NOT_AVAILABLE`.

Output target:

- `marketing/data/normalized/sku_passport/ozon_sku_passport_v1.csv`
- validation report with row counts, duplicate identities, missing joins and opportunity coverage.

---

# 06.3 — Build actual family hierarchy

Статус: **[ ]**

Questions:

- Is OU06 truly separate from OU02 in real assortment?
- Which Slavic symbols form a coherent category vs isolated SKUs?
- Are automotive pendants one physical platform with symbolic variants?
- Does the same physical base product recur across multiple symbol designs?
- Which products are commodity/form-only and cannot support owned-search differentiation?

Output: canonical family hierarchy + overlap report.

---

# 06.4 — Buyer evidence for own SKU / own listings

Статус: **[ ]**

Collect and normalize own marketplace reviews/questions where available, keeping direct buyer evidence separate from competitor/public evidence.

Priority clusters:

- symbol meaning / suitability;
- visual design;
- real-car appearance and size;
- material / darkening / finish;
- cord / mount / durability;
- packaging / gift;
- delivery / damage;
- price/value;
- trust / social proof.

---

# 06.5 — Physical + content asset audit

Статус: **[ ]**

For opportunity-priority SKUs first (OU02, OU01 representative, OU03, OU05, OU07, OU08): verify which passport facts and visual views are actually documented. No unsupported quality/durability promises.

---

# 06.6 — Stage 06 decision report

Статус: **[ ]**

Deliverables:

- actual SKU→opportunity coverage;
- family hierarchy;
- buyer choice drivers and objections;
- current sellable variants for Алатырь / Vegvisir / Шлем Ужаса;
- OU09 reopen/keep-rejected decision;
- commodity SKU list;
- evidence gaps that Stage 07/08 must resolve.

## Completion gate

Stage 06 closes only when:

- every current SKU has a canonical identity and mapping status;
- opportunity-priority SKU families have current seller-side commercial evidence;
- own-buyer evidence is normalized where available;
- physical/content unknowns are explicit rather than guessed;
- OU02↔OU06 hierarchy is resolved enough for Stage 07;
- OU09 reopen condition is evaluated from actual assortment/buyer evidence;
- final Stage 06 report is committed.

Until then: **do not freeze final IA/Page Jobs and do not start site development.**
