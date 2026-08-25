# Patch B1 — Assortment Master operator Swagger evidence

Date: 2026-08-25
Status: OFFICIAL CONTRACT EVIDENCE CAPTURED — B1 contract research gate may close.

## Source provenance and byte identity

The operator followed the fixed official-source procedure and supplied the resulting `swagger.json` from:

`https://docs.ozon.ru/api/seller/swagger.json`

No Seller or Performance business endpoint was used to obtain this evidence.

Captured artifact validation:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- `openapi`: `3.0.0`
- `info.title`: `Документация Ozon Seller API`
- `info.version`: `2.1`
- `servers[0].url`: `//api-seller.ozon.ru`
- path count: `463`
- all three B1 target paths are present
- recursive local `$ref` closure is complete for all three target operations
- unresolved local `$ref` count: `0`

The browser final redirect chain / raw HTTP status was not separately recorded in the evidence package. No value is invented for those fields. The supplied file itself is retained only by its byte identity above; this validation record stores bounded contract evidence rather than committing the 3.9 MB OpenAPI document.

## Target 1 — `/v3/product/list`

Current official contract:

- HTTP method: `POST`
- operationId: `ProductAPI_GetProductList`
- summary: `Список товаров`
- request body: required
- auth parameters: required `Client-Id` and `Api-Key` headers
- operation is not marked deprecated

Important correction to older repository locator evidence:

- older locator evidence recorded `ProductAPI_GetProductListv3`;
- current supplied Swagger records `ProductAPI_GetProductList`;
- B1 implementation MUST use the current Swagger operation identity and MUST NOT preserve the stale operationId as current authority.

Request schema: `productv3GetProductListRequest`

- `filter.offer_id` — list of seller offer IDs; minItems 1; maxItems 1000
- `filter.product_id` — list of Ozon product IDs; minItems 1; maxItems 1000
- `filter.skus` — list of Ozon SKUs; minItems 1; maxItems 1000
- `filter.visibility` — current visibility enum from Swagger
- `last_id` — continuation token; send the previous response `last_id` to request the next page
- `limit` — integer; documentation states minimum 1 and maximum 1000

Operation description additionally states:

- when filtering by identifiers, no more than one identifier group is used at a time, maximum 1000 products;
- when not filtering by identifiers, pagination uses `limit` and `last_id`.

Success response: `productv3GetProductListResponse`

`result.items[]` contains at least:

- `product_id`
- `offer_id`
- `sku`
- `has_fbo_stocks`
- `has_fbs_stocks`
- `archived`
- `is_discounted`
- `quants`

Pagination response fields:

- `result.last_id`
- `result.total`

Documented error response statuses: `400`, `403`, `404`, `409`, `500`, using `rpcStatus`.

## Target 2 — `/v3/product/info/list`

Current official contract:

- HTTP method: `POST`
- operationId: `ProductAPI_GetProductInfoList`
- summary: `Получить информацию о товарах по идентификаторам`
- request body: required
- auth parameters: required `Client-Id` and `Api-Key` headers
- operation is not marked deprecated

Request schema: `v3GetProductInfoListRequest`

Accepted identifier arrays:

- `offer_id[]` — string seller offer IDs
- `product_id[]` — string/int64-formatted Ozon product IDs
- `sku[]` — string/int64-formatted Ozon SKUs

The operation description states that at most 1000 products may be supplied across `offer_id`, `product_id`, and `sku` in one request. The official example contains all three arrays, so B1 MUST NOT invent an exactly-one-array restriction for this method.

There is no pagination request/continuation field in this method contract.

Success response: `v3GetProductInfoListResponse` with `items[]`.

Current `items[]` contract includes, among other fields:

- `id` (`product_id`)
- `offer_id`
- `sku`
- `name`
- `barcodes`
- `description_category_id`
- `type_id`
- `is_kgt`
- `is_archived`
- `is_autoarchived`
- `images`
- `primary_image`
- `price`, `old_price`, `min_price`
- `promotions`
- `statuses`
- `stocks`
- `visibility_details`
- `errors`
- `created_at`, `updated_at`
- `volume_weight`

`items[].showcases_visibility` is NOT present in the current response schema.

Legacy `items[].images360` is NOT present in the current response schema.

`items[].is_prepayment_allowed` is still present but is individually marked deprecated; the operation itself is not deprecated.

Documented error response statuses: `400`, `403`, `404`, `409`, `500`, using `rpcStatus`.

## Target 3 — `/v4/product/info/attributes`

Current official contract:

- HTTP method: `POST`
- operationId: `ProductAPI_GetProductAttributesV4`
- summary: `Получить описание характеристик товара`
- request body: required
- auth parameters: required `Client-Id` and `Api-Key` headers
- operation is not marked deprecated

Request schema: `productv4GetProductAttributesV4Request`

Fields:

- `filter.offer_id` — list-form in official example/schema item definition
- `filter.product_id` — list-form; description says up to 1000 values
- `filter.sku` — array of string/int64-formatted SKUs
- `filter.visibility` — current visibility enum
- `last_id` — continuation token
- `limit` — int32, minimum 1, maximum 1000
- `sort_by` — documented values: `sku`, `offer_id`, `id`, `title`
- `sort_dir` — description documents `asc` and `desc`

Official-contract inconsistency preserved explicitly:

- `sort_dir` description lists lowercase `asc` / `desc`;
- the official request example uses uppercase `ASC`;
- B1 MUST NOT silently choose one interpretation as the only valid contract without evidence. If the bridge validates this field locally, it may accept only variants explicitly evidenced by the official document rather than inventing additional values.

Success response: `productv4GetProductAttributesV4Response`.

Pagination response fields:

- `last_id`
- `total`

`result[]` includes at least:

- `id` (`product_id`)
- `offer_id`
- `sku`
- `name`
- `description_category_id`
- `type_id`
- `barcode`, `barcodes`
- `height`, `depth`, `width`, `dimension_unit`
- `weight`, `weight_unit`
- `primary_image`, `images`
- `attributes`
- `attributes_with_defaults`
- `complex_attributes`
- `model_info`
- `pdf_list`

Documented error response statuses: `400`, `403`, `404`, `409`, `500`, using `rpcStatus`.

## Historical-claim re-check against this exact Swagger

1. `/v3/product/list` supports `filter.skus`: `CURRENT_SWAGGER_PRESENT`
2. `/v3/product/list` response exposes `result.items[].sku`: `CURRENT_SWAGGER_PRESENT`
3. `/v3/product/list` supports visibility filtering: `CURRENT_SWAGGER_PRESENT`
4. `/v3/product/info/list` exposes `items[].showcases_visibility`: `CURRENT_SWAGGER_ABSENT`
5. `/v3/product/info/list` exposes `items[].is_kgt`: `CURRENT_SWAGGER_PRESENT`
6. `/v3/product/info/list` does not expose legacy `items[].images360`: `CURRENT_SWAGGER_PRESENT` (absence confirmed)
7. `/v4/product/info/attributes` supports visibility filtering: `CURRENT_SWAGGER_PRESENT`
8. `sku` remains a usable join between product list and product info list: `CURRENT_SWAGGER_PRESENT`

## Entitlement / rate evidence

No target-local Premium/subscription restriction is present in the three operation definitions or their required schema closures.

The same official Swagger's general Seller API process documentation states a provider-wide ceiling of no more than 50 requests per second for all methods per Client ID. This is provider-wide evidence, not a target-specific page/batch quota and MUST NOT be rewritten into hidden retry/fanout behavior.

## Execution implications

The three B1 core read contracts are now sufficiently specified to implement fixed-host, fixed-method, strict read operations without guessing transport, request body, pagination continuation, response traversal, or join identity.

One explicit bridge command remains one physical Seller business request. Pagination continuation is explicit via `last_id`; the bridge must not automatically iterate pages.

Final evidence decision:

`PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`
