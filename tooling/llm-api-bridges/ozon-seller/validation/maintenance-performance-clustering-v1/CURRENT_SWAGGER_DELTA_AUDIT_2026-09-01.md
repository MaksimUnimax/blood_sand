# Ozon Bridge — current Swagger delta audit

Date: 2026-09-01  
Scope: Ozon API only. Production sorting/clustering patch remains blocked until the operation surface is refreshed and reviewed.

## Sources

Current owner-provided Swagger files were compared directly against the frozen authority inputs used by the accepted bridge work.

| Source | Operations | SHA-256 |
|---|---:|---|
| Seller Swagger uploaded 2026-09-01 | 465 | `b323a83c3ae8746e2d545b1ad194cfa0fe269dc82667e07cf7ba2ffe798d5d72` |
| Frozen Seller Swagger 2026-08-25 | 463 | `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40` |
| Performance Swagger uploaded 2026-09-01 | 48 | `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec` |
| Frozen Performance Swagger 2026-08-29 | 48 | `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec` |

## Executive result

`SWAGGER_DELTA_FOUND_TWO_NEW_SELLER_READS_PERFORMANCE_UNCHANGED`

### Seller

Exact OpenAPI `(method, path)` comparison:

- frozen authority: `463`;
- current Swagger: `465`;
- added: `2`;
- removed: `0`;
- existing 463 operation objects changed: `0`;
- existing component schemas changed: `0`;
- component schemas added: `7`, all belonging to the two new operations.

Therefore the Seller change since the frozen 2026-08-25 authority is isolated and exact: two new beta read operations added on 2026-09-01.

### Performance

The owner-provided Performance Swagger is byte-for-byte identical to the frozen 2026-08-29 authority file.

- current operations: `48`;
- Step8 matrix operations: `48`;
- new operation keys: `0`;
- removed operation keys: `0`;
- accepted current read authority remains `21`;
- terminal split remains `21 read / 9 server-side generation / 16 mutation / 2 deprecated`;
- executable Performance aliases remain `25` because four documented JSON variants are separate Bridge aliases but do not increase the 48-operation authority universe.

There is no newly discovered Performance read endpoint to add before the advertising clustering work.

## Two new Seller reads missing from current production

### 1. `POST /v1/description-category/dependent-attributes`

Official summary: `Получить зависимые характеристики`.

Semantics: returns parent/child dependent-attribute identifier pairs. No marketplace state mutation, report generation, artifact creation or unstructured customer content.

Proposed Bridge contract:

- alias: `description_category_dependent_attributes`;
- provider: `seller_api`;
- effect: `READ`;
- safety: `READ_SAFE`;
- privacy: `safe_projection`;
- cluster: `catalog_products`;
- section: `attributes_categories`;
- required request field: `description_category_id`;
- optional: `type_id`;
- one explicit command -> at most one Seller request.

Terminal candidate: `CURRENT_READ_ACCEPTED`.

### 2. `POST /v1/description-category/dependent-attributes/values`

Official summary: `Получить возможные значения дочерней характеристики`.

Semantics: returns possible child values for parent values. No marketplace state mutation, report generation, artifact creation or unstructured customer content.

Proposed Bridge contract:

- alias: `description_category_dependent_attribute_values`;
- provider: `seller_api`;
- effect: `READ`;
- safety: `READ_SAFE`;
- privacy: `safe_projection`;
- cluster: `catalog_products`;
- section: `attributes_categories`;
- required: `parent_attribute_id`, `child_attribute_id`;
- optional: `description_category_id`, `type_id`, `cursor`, `limit`;
- official `limit`: `1..1000`, default `100`;
- `cursor` is caller-controlled explicit pagination only;
- Bridge must not auto-follow the cursor.

Terminal candidate: `CURRENT_READ_ACCEPTED`.

## Current registry coverage relative to the old authority

The current production Seller registry contains exactly the same 245 `(method,path)` pairs that the accepted Step7 terminal matrix classified as `ACCEPTED_IMPLEMENTED_READ`.

- old accepted reads: `245`;
- current Seller aliases: `245`;
- pair-set mismatch: `0`.

So the missing current reads are not old Step7 omissions: they are the two new operations added after the frozen Seller authority date.

If both new reads are accepted and nothing else is reclassified, the arithmetic would become:

- Seller read authority: `247`;
- Performance read authority: `21`;
- total read authority: `268`;
- executable aliases: `247 Seller + 25 Performance = 272`.

These are projected counts only until currentness cleanup below is resolved.

## Currentness cleanup found during the same audit

Two currently exposed Seller read aliases remain present as paths in the current Swagger, but their own operation descriptions carry shutdown dates that are already in the past:

1. `fbs_stock_by_warehouse_v1`
   - `POST /v1/product/info/stocks-by-warehouse/fbs`
   - Swagger says it was to be disabled 2026-04-07.
   - replacement already exists in production: `/v2/product/info/stocks-by-warehouse/fbs`.

2. `fbs_carriage_available_list`
   - `POST /v1/posting/carriage-available/list`
   - Swagger says it was to be disabled 2026-03-20.
   - replacement already exists in production: `/v2/carriage/delivery/list`.

This is a currentness inconsistency in Ozon's own current Swagger: the paths are still present while the descriptions say they should already be disabled. Do not silently count them as definitely current or delete them solely from the path diff. They require explicit terminal/currentness reclassification (and, if needed, a minimal live availability check) before refreshing the formal read count.

Also noted but not yet expired on 2026-09-01:

- `finance_transaction_list_v3` is documented to be disabled on 2026-09-08;
- its accrual replacements are already implemented in the Bridge.

## Advertising/clustering consequence

The advertising bounded-result/sorting patch remains blocked.

Required order now:

1. Add/classify the two new Seller dependent-attribute reads.
2. Resolve the two past-shutdown legacy read aliases as current vs sunset/replaced.
3. Regenerate the complete current operations inventory and cluster coverage.
4. Owner reviews the refreshed inventory.
5. Only then implement the advertising clustering/refinement/bounded-response patch.

No advertising production code was changed by this audit.
