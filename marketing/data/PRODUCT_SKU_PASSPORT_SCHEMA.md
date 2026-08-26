# Product / SKU / Marketplace Listing Passport Schema

Version: **1.0**  
Date: **2026-08-26**  
Status: **CANONICAL FOR ROADMAP 06**

This schema extends the project evidence contract for product-centric Stage 06 research. It does not replace `marketing/data/DATA_SCHEMA_CONTRACT.md`.

## 1. Entity separation

Never collapse these identities:

- `ProductMaster` — project-level product/variant identity;
- `ProductFamily` — analytical family such as Veles / zodiac / Slavic symbol group;
- `MarketplaceListing` — one platform listing/product identity;
- marketplace SKU;
- seller offer/article;
- `OpportunityRelation` — mapping to R3 OU01–OU10;
- `CustomerEvidenceObservation`;
- `MarketplacePerformanceObservation`.

One physical/design product may have multiple marketplace listings. One listing can also map to multiple user jobs/opportunities.

## 2. Stable project IDs

### Product master ID

Format:
`pm_<12hex>`

Input for SHA-256 is a canonical cross-platform identity key only after identity is sufficiently proven. Until then use blank `product_master_id` + `identity_status=PROVISIONAL/UNRESOLVED`; do not generate stable IDs from marketplace title alone.

### Product family ID

Format:
`pf_<12hex>`

Created only after family boundary is explicitly accepted in Stage 06.

Marketplace IDs (`product_id`, SKU, offer/article) are preserved exactly as observed and are not replaced with project IDs.

## 3. Canonical listing/passport row fields

### Provenance
- `schema_version`
- `measurement_id`
- `observation_id`
- `evidence_mode` = `OBSERVED | DERIVED | INFERRED`
- `observed_at`
- `observed_at_precision`
- `raw_ref`
- `source_ref`
- `record_status`
- `notes`

### Identity
- `product_master_id`
- `identity_status`
- `product_family_id`
- `family_status`
- `marketplace`
- `seller_offer_id`
- `marketplace_product_id`
- `marketplace_sku`
- `listing_title`
- `listing_status`
- `listing_status_state`

### Classification
- `symbol_name`
- `symbol_status`
- `tradition_family`
- `tradition_status`
- `variant_name`
- `variant_status`
- `zodiac_sign`
- `zodiac_status`
- `form_factor`
- `form_factor_status`
- `use_case`
- `use_case_status`
- `opportunity_ids`
- `opportunity_relation_mode`

Rules:
- text explicitly present in seller title/attribute = `OBSERVED`;
- mapping a listing named `Печать Велеса` to R3 OU02 = `DERIVED`;
- do not infer historical/religious taxonomy from product name if no direct product/category/attribute evidence supports it.

### Physical/product facts
Each field has an adjacent status or observation-level status:
- `medallion_width_mm`
- `medallion_height_mm`
- `medallion_thickness_mm`
- `weight_g`
- `total_length_mm`
- `material`
- `finish_or_coating`
- `cord_material`
- `cord_length_mm`
- `cord_adjustable`
- `bead_count`
- `bead_material`
- `bead_size_mm`
- `attachment_construction`
- `mirror_hanging_construction`
- `tassel_material`
- `package_type`
- `package_contents`
- `primary_image_ref`
- `media_refs`

Allowed status values:
- `MEASURED`
- `NOT_MEASURED`
- `NOT_AVAILABLE`
- `NOT_APPLICABLE`
- `INVALID`

Competitor attributes never fill missing Blood & Sand physical facts.

### Claim evidence
- `claim_text`
- `claim_type`
- `claim_status`
- `claim_source`

Allowed `claim_status`:
- `DIRECT_PRODUCT_FACT`
- `SELLER_CLAIM_UNVERIFIED`
- `TEST_VERIFIED`
- `NOT_SUPPORTED`

Durability, heat resistance, non-darkening, protective effect and similar claims must never be upgraded from assumption/competitor claim to product fact.

## 4. Dynamic marketplace observation schema

Dynamic facts are separate observations, not timeless passport properties.

Fields:
- `marketplace`
- `marketplace_product_id`
- `marketplace_sku`
- `metric_name`
- `metric_value`
- `metric_unit`
- `period_start`
- `period_end`
- `snapshot_at`
- `metric_status`
- provenance fields

Examples:
- FBO stock present/reserved at snapshot time;
- FBS stock present/reserved;
- price at snapshot time;
- ordered_units for exact period;
- revenue RUB for exact period;
- rating/review count at observed time.

Rules:
- `revenue` ≠ margin/profit;
- `ordered_units` ≠ fulfilled units unless provider contract says so;
- zero with `MEASURED` is a real zero;
- missing/unsupported metric remains null with status.

## 5. Customer evidence relation

Customer evidence follows the canonical project schema and adds product/family relation:
- `customer_evidence_id`
- `platform`
- `marketplace_product_id` or family relation where known
- `relation_status`
- `category`: `question | review | complaint | praise | usage | gift | feature_request | other`
- `topic`
- `excerpt_or_paraphrase`
- `evidence_mode`
- source/provenance fields

Stage 06 standard topic vocabulary starts with:
- `appearance_in_car`
- `size_scale`
- `material_finish`
- `darkening_aging`
- `cord_quality`
- `attachment_hanging`
- `heat_sun_resistance`
- `packaging`
- `gift_motive`
- `review_trust`
- `symbol_meaning`
- `design_visual_choice`
- `price_value`

A category-level analog review is not silently assigned to a Blood & Sand SKU.

## 6. Opportunity mapping

Fields:
- `opportunity_id`
- `relation_type`
- `evidence_mode`
- `relation_reason`

Allowed `relation_type`:
- `DIRECT_NAMED_SYMBOL`
- `CATEGORY_MEMBER`
- `USE_CASE_FIT`
- `FORM_FACTOR_FIT`
- `SUPPORTING_VARIANT`
- `REOPEN_TEST`

Example:
- listing title explicitly `Печать Велеса` → OU02 `DIRECT_NAMED_SYMBOL` as DERIVED from observed identity + accepted R3 taxonomy;
- same title explicitly says `Подвеска на зеркало в машину` → OU04 `FORM_FACTOR_FIT`;
- mapping to protection OU03 may be DERIVED only when seller title/category/content directly frames it as `оберег/амулет` for car.

## 7. Completeness levels

Each passport row gets:
- `passport_completeness`

Allowed:
- `IDENTITY_ONLY`
- `IDENTITY_COMMERCE`
- `IDENTITY_PHYSICAL`
- `DECISION_GRADE`

`DECISION_GRADE` for Stage 06 requires:
- stable/current listing identity;
- family/opportunity mapping;
- current listing state;
- key marketplace performance facts where available;
- core physical/content fields either measured or explicitly missing;
- customer-evidence relation either measured or explicitly absent/not available.

It does not require every possible field to be non-null.

## 8. Canonical output paths

Planned Stage 06 outputs:
- `marketing/data/normalized/products/product_listing_master.csv`
- `marketing/data/normalized/products/product_opportunity_map.csv`
- `marketing/data/normalized/products/product_marketplace_metrics.csv`
- `marketing/data/normalized/customer/customer_evidence.csv`
- final report under `marketing/research/`.

Raw provider responses stay immutable under `marketing/data/raw/marketplace/`.

## 9. Control prohibitions

Do not:
- derive material/dimensions from product photos or competitor cards;
- infer buyer motive from sales;
- infer WB listing identity from Ozon title alone;
- treat historical stock as current;
- merge duplicate-looking marketplace listings without identity evidence;
- invent missing variant/family relationships;
- use final IA/Page Job fields in this schema.
