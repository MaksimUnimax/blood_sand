# B11 Catalog Diagnostics / Content — exact Seller Swagger evidence

Authority:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

Current operations verified:

1. `POST /v1/product/rating-by-sku` — `ProductAPI_GetProductRatingBySku`
   - request body required;
   - required field `skus`;
   - SKU items are string `int64`;
   - no exact maxItems is declared in the request schema.

2. `POST /v1/product/info/description` — `ProductAPI_GetProductInfoDescription`
   - request body required;
   - exact OpenAPI `oneOf` requires either `offer_id` or `product_id`;
   - `offer_id` is string;
   - `product_id` is integer/int64;
   - because both oneOf branches otherwise accept the other property, sending both would satisfy both branches and therefore fails oneOf; B11 enforces exactly one.

3. `POST /v4/product/info/limit` — `ProductAPI_GetUploadQuota`
   - no request body.

4. `POST /v1/product/info/subscription` — `ProductAPI_GetProductInfoSubscription`
   - request body required;
   - required field `skus`;
   - SKU items are string `int64`;
   - no exact maxItems is declared.

5. `POST /v1/product/related-sku/get` — `ProductAPI_ProductGetRelatedSKU`
   - request body required;
   - required field `sku`;
   - item type string `int64`;
   - operation description explicitly says up to `200` SKU per request.

6. `POST /v2/product/pictures/info` — `ProductAPI_ProductInfoPicturesV2`
   - request body required;
   - required `product_id` array;
   - maximum `1000` items;
   - items are string `int64`;
   - response contains `primary_photo`, `photo`, `color_photo` URL arrays and error URL fields.

7. `POST /v1/product/info/wrong-volume` — `ProductAPI_ProductInfoWrongVolume`
   - request body required;
   - required `limit`;
   - `limit` minimum `1`, maximum `1000`;
   - optional string `cursor`.

8. `POST /v1/product/info/discounted` — `ProductAPI_GetProductInfoDiscounted`
   - request body required;
   - required `discounted_skus`;
   - items are string `int64`;
   - no exact maxItems is declared.

All eight operations are non-deprecated in the exact authority.

Exact entitlement compilation returns `ALL_ACCOUNTS` for every B11 endpoint. The complete exact Swagger compiler still reports the existing `12` unresolved rules unrelated to these endpoints.
