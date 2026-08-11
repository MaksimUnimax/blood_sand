# Ozon Seller API — Product/SKU master coverage — 2026-08-11

Статус: **RESEARCH COVERAGE MAP — current product/media evidence + category dictionary lineage; NOT implementation-ready contract**

Цель: проверить, из каких current/canonical Ozon read families можно собрать Ozon-side `Product / SKU / MarketplaceListing / Category` master для полного магазина.

## 1. Enumeration / listing identity

### `/v3/product/list`

Currentness:

- current through 2026-07-09;
- request gained `filter.skus`;
- response gained `result.items.sku`.

Canonical official locator:

- `#operation/ProductAPI_GetProductListv3`.

Role in master:

- seller product/listing enumeration;
- SKU/list identity seed;
- visibility/filter entry point.

Still missing before implementation:

- full request/response contract;
- pagination/limits;
- exact archived/hidden/error coverage;
- permissions/quota semantics.

## 2. Bulk product/listing information

### `/v3/product/info/list`

Currentness:

- `items.is_kgt` description updated 2026-02-26;
- `items.showcases_visibility` added 2026-04-06;
- `items.images360` removed 2026-07-10.

Canonical official locator:

- `#operation/ProductAPI_GetProductInfoList`.

Role in master:

- bulk product/listing facts by identifiers;
- current visibility-related evidence;
- likely core listing metadata, subject to full schema extraction.

Important current correction:

- do **not** assume `images360` remains available from this method.

Still missing:

- full current field inventory;
- batch size/input ids;
- exact title/barcode/dimensions/media/category coverage;
- permissions/quota.

## 3. Attributes / type linkage

### `/v4/product/info/attributes`

Currentness:

- current family referenced by Ozon Seller API notification on 2026-02-10 together with product list/stocks/prices.

Role in master:

- current candidate for product characteristics/attribute evidence;
- category/type linkage must be read from the actual current response contract before coding.

Historical migration context relevant to interpretation:

- Ozon introduced `description_category_id` to product-info/attributes lineage when migrating away from old `category_id`;
- in September 2024 Ozon added `type_id` to the attributes-response lineage and published guidance on transition to `type_id`.

Do **not** silently assume every historical field survives unchanged in `/v4/product/info/attributes`; full current schema is still required.

## 4. Product images / media — current read family confirmed

### `/v2/product/pictures/info`

Currentness:

- introduced as beta 2024-12-11;
- `/v1/product/pictures/info` removed 2025-02-10 in favour of v2;
- current activity confirmed again **2026-06-09**, when Ozon removed `items.photo_360` from the response.

Canonical official locator:

- `#operation/ProductAPI_ProductInfoPicturesV2`.

Role in master:

- product image references independent of bulk product-info method;
- media coverage should explicitly join this family where `/v3/product/info/list` is insufficient.

Current media correction:

- `items.photo_360` is removed;
- `/v3/product/info/list.items.images360` is also removed;
- 360-degree media therefore must **not** be promised as a current master field from these read methods.

Still missing:

- HTTP verb/full request contract;
- input identifiers and batch/page limits;
- exact image fields/order/primary-image semantics;
- video/rich-media availability, if any;
- permissions/quota.

## 5. Category / type dictionary chain — canonical replacement confirmed, 2026 refresh pending

Ozon replaced the older category APIs with the `description-category` family:

- `/v1/description-category/tree` — category/type tree;
- `/v1/description-category/attribute` — attributes for category/type;
- `/v1/description-category/attribute/values` — allowed attribute values.

Official canonical operation locators:

- `/v1/description-category/tree` → `#operation/DescriptionCategoryAPI_GetTree`;
- `/v1/description-category/attribute` → `#operation/DescriptionCategoryAPI_GetAttributes`;
- `/v1/description-category/attribute/values` → `#operation/DescriptionCategoryAPI_GetAttributeValues`.

Official migration facts:

- family introduced as replacement in 2023;
- old `/v2/category/tree`, `/v3/category/attribute`, `/v2/category/attribute/values` removed from documentation in March 2024 and redirected to this family;
- Ozon added request/response examples to all three description-category methods in May 2024.

Freshness boundary:

- a direct 2026 update for `tree/attribute/attribute-values` was not found in the current indexed changelog pass;
- however the `description-category` contour is still actively developed: `/v1/description-category/tips` was added as beta on **2026-03-17**.

Disposition:

- treat the three dictionary methods as **official canonical target lineage / 2026 currentness refresh pending**;
- do not mark their full contracts current-ready until the live library or another 2026 Ozon-owned source confirms them.

## 6. Identity transition rules that matter to the master

Historical Ozon migration evidence establishes that:

- `description_category_id` replaced old `category_id` semantics in the product/category workflow;
- `type_id` became a separate important product-type identifier;
- old category endpoints are not the desired future target.

Engineering consequence:

The future Ozon master must preserve distinct identifiers rather than collapsing them into one generic category id:

- seller offer/article identity;
- Ozon product/listing identity;
- SKU identity;
- `description_category_id` where current schema exposes it;
- `type_id` where current schema exposes it.

Exact fields must be verified in current response contracts before implementation.

## 7. Current Product/SKU master coverage verdict

Endpoint-family coverage is now materially sufficient to define the intended read chain:

`/v3/product/list`
→ `/v3/product/info/list`
→ `/v4/product/info/attributes`
→ `/v2/product/pictures/info`
→ description-category dictionary chain
→ `/v5/product/info/prices`
→ stock/warehouse families.

But this is still a **research chain, not an implementation sequence**. One LLM command must not automatically fan out through this chain. Each future provider request/pagination step must remain explicit and controlled according to bridge invariants.

Remaining Product Master blockers:

- full current contracts/HTTP verbs;
- enumeration pagination/batch limits;
- exact identity/status/title/barcode/dimension fields;
- category/type fields in current v4 attributes/product info;
- media/video/rich-content coverage;
- dictionary-family 2026 currentness refresh;
- current price/status semantics;
- permissions/quotas.

Therefore `03A.3` remains in progress and `03A.4` remains not started.
