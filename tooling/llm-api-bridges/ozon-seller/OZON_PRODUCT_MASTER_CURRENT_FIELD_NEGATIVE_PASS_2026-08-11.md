# Ozon Product Master — current-field negative verification pass — 2026-08-11

Status: **blocking gaps remain; no schema inference allowed**

## Current read chain confirmed

Current Ozon-owned notification evidence supports the following read families/currentness:

- `/v3/product/list` — main; current field changes observed through 2026-07-09.
- `/v3/product/info/list` — main; current field changes observed through 2026-07-10.
- `/v4/product/info/attributes` — moved from beta to main on 2025-02-06; `filter.visibility` description refreshed on 2026-02-10.
- `/v2/product/pictures/info` — current replacement for v1; current field removals observed in 2026.
- `/v1/description-category/tree`, `/attribute`, `/attribute/values` — official category/type lineage.

## Fields positively confirmed in current families

### `/v3/product/list`

- request `filter.skus`
- response `result.items.sku`

### `/v3/product/info/list`

Current notification history explicitly confirms fields/changes including:

- `items.sku`
- `items.promotions`
- `items.promotions.is_enabled`
- `items.promotions.type`
- `items.availabilities`
- `items.price_indexes.color_index` current enum work
- `items.is_kgt`
- `items.showcases_visibility`
- `items.images360` removed in 2026

These fragments do not constitute the complete response schema.

## Historical predecessor evidence that MUST NOT be auto-carried forward

Ozon-owned notifications historically confirm:

- `/v2/product/info` and `/v2/product/info/list`: `barcodes` existed in 2023.
- `/v3/products/info/attributes`: `description_category_id` existed in 2023.
- `/v3/products/info/attributes`: `result.type_id` was added in 2024.
- `/v2/product/info`: `type_id` existed historically.

The current research runtime did **not** recover an Ozon-owned schema statement saying that these historical fields are present in current `/v3/product/info/list` or `/v4/product/info/attributes` with the same placement/semantics.

Therefore they remain **unproven current fields**.

## Exact current-field probes with no Ozon-owned contract hit

Searched current Ozon-owned/indexed surfaces for `/v4/product/info/attributes` and current product-info methods with combinations of:

- `name` / title
- `barcode` / `barcodes`
- dimensions / width / height / depth
- weight
- `description_category_id`
- `type_id`
- moderation/error state

No current Ozon-owned method-contract snippet was recovered for these fields.

Third-party generated clients/mirrors show some of these fields, but project source policy classifies those only as discovery hints.

## Current blocking Product Master fields

Do not mark these closed until a current Ozon-owned method contract or an explicit Ozon-owned unavailable classification is recovered:

- title/name
- barcodes
- dimensions/weight
- current `description_category_id` placement
- current `type_id` placement
- video/rich-content
- complete moderation/error state

## Engineering consequence

- Do not copy v2/v3 predecessor response schemas into v3/v4 current methods.
- Do not use write-method request fields such as `/v3/product/import.items.name` as proof of read-method response fields.
- Do not use third-party SDK models as implementation contract authority.
- `/v1/report/products/create` remains a fallback candidate only; its output columns must be verified independently.
- `extension_development_allowed` remains `false`.
