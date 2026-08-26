# SKU Passport Schema V1

Версия: **1.0**  
Дата: 2026-08-26  
Статус: **CANONICAL FOR ROADMAP 06**

Purpose: один канонический product/SKU passport для seller-side, customer и content evidence без подмены неизвестных значений догадками.

## Status semantics

Для измеряемых полей использовать явный status:

- `MEASURED`
- `NOT_MEASURED`
- `NOT_AVAILABLE`
- `NOT_APPLICABLE`
- `INVALID`

`0 + MEASURED` — реальный ноль. `null + NOT_MEASURED` — данных нет.

## Canonical columns

### Identity

`passport_id, canonical_product_name, family_name, symbol_name, variant_name, product_form, platform, platform_product_id, platform_sku, offer_id, listing_title, listing_status, sellable_status, identity_status`

### Opportunity / buyer job

`primary_opportunity_id, secondary_opportunity_ids, buyer_job_primary, buyer_job_secondary, mapping_status, mapping_evidence_ref`

### Physical product facts

`medallion_width_mm, medallion_height_mm, medallion_thickness_mm, weight_g, total_hanging_length_mm, medallion_material, surface_finish_or_coating, cord_material, cord_length_mm, cord_adjustable, bead_count, bead_material, bead_size_mm, tassel_material, mount_construction, rear_side_description, package_type, package_dimensions, package_contents, physical_facts_status, physical_evidence_ref`

### Commerce / availability

`price_current, price_status, stock_fbo_present, stock_fbo_reserved, stock_fbs_present, stock_fbs_reserved, stock_observed_at, ordered_units_7d, revenue_7d, ordered_units_30d, revenue_30d, ordered_units_90d, revenue_90d, rating, review_count, commerce_status, commerce_evidence_ref`

### Buyer evidence

`meaning_choice_driver_status, visual_choice_driver_status, material_choice_driver_status, car_use_case_driver_status, gift_driver_status, price_driver_status, reviews_social_proof_status, buyer_questions_summary, buyer_praise_summary, buyer_complaints_summary, buyer_evidence_ref`

### Content assets

`asset_studio_front, asset_studio_back, asset_scale_reference, asset_in_car, asset_mount_closeup, asset_cord_closeup, asset_package, asset_video, asset_status, asset_evidence_ref`

### Provenance / quality

`observed_at, observed_at_precision, source_type, evidence_mode, raw_ref, source_ref, record_status, notes`

## Identity rules

1. `platform_product_id`, `platform_sku`, `offer_id` остаются source-specific IDs.
2. `passport_id` не должен зависеть от mutable listing title.
3. Cross-platform merge разрешён только при подтвержденной identity; одинаковое название не является достаточным доказательством.
4. Variant design и physical base product не объединяются автоматически.

## Opportunity mapping rules

- OU01: Slavic category breadth.
- OU02: Печать Велеса-specific.
- OU03: automotive protection/use-case; не назначать только по form factor.
- OU04: automotive mirror-hanging/form-factor.
- OU05: Алатырь-specific.
- OU06: broader Veles family distinct from Печать Велеса.
- OU07: Vegvisir-specific.
- OU08: Шлем Ужаса / Ægishjálmur-specific.
- OU09/OU10 retained as reopen/reject evidence, not primary mapping targets unless later decision changes.

## Evidence rules

- seller API = `MARKETPLACE_EVIDENCE`;
- own review/question = `CUSTOMER_EVIDENCE`;
- derived family aggregation = `DERIVED`, never `OBSERVED`;
- physical facts copied from competitor/public similar products are forbidden for own SKU;
- buyer-topic research from similar products may inform audit questions but not own-product facts.

## Current implementation path

Roadmap 06 first builds an Ozon baseline from current seller evidence, then adds missing product attributes/media/price/review evidence and later cross-platform identity.
