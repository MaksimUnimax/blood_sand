# Patch B2 — Prices / Listing State official Swagger evidence

Date: 2026-08-26

## Source identity

Reused exact operator-supplied Ozon Seller API Swagger artifact:

- canonical source: `https://docs.ozon.ru/api/seller/swagger.json`
- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- document version: `2.1`
- path count: `463`
- server: `//api-seller.ozon.ru`

The fixed public URL still produced a redirect loop in the research environment. No alternate URL or mirror was accepted. The exact previously operator-supplied artifact was reused by byte identity.

The same Swagger states a provider-wide Seller API limit of no more than 50 requests per second across all methods for one Client ID. This does not authorize retry, fanout or automatic pagination.

## 1. POST /v5/product/info/prices

- operationId: `ProductAPI_GetProductInfoPrices`
- summary: current product price information
- deprecated: not marked deprecated
- auth headers: required `Client-Id`, required `Api-Key`
- requestBody.required: `true`
- request schema: `productv5GetProductInfoPricesV5Request`
- required request fields: `filter`, `limit`
- root fields:
  - `cursor`: string, optional, next-page pointer
  - `filter`: `productv5Filter`, required
  - `limit`: int32, required, minimum `1`, maximum `1000`
- filter fields:
  - `offer_id`: array of string; description says up to 1000 values
  - `product_id`: array of string `int64`; description says up to 1000 values
  - `visibility`: `productv5GetProductListRequestFilterFilterVisibility`
- current visibility enum is the same current Product visibility enum already accepted in B1, including `ALL`, `VISIBLE`, `INVISIBLE`, `EMPTY_STOCK`, `ARCHIVED`, `AUTO_ARCHIVED`, `VISIBLE_WITH_FBO_STOCK`, and the other values present in the exact snapshot.
- no evidence says offer_id and product_id are mutually exclusive; implementation must not invent such a restriction.
- response schema: `productv5GetProductInfoPricesV5Response`
  - `cursor`: string
  - `items[]`: `productGetProductInfoPricesV5ResponseItem`
  - `total`: int32
- response item joins:
  - `offer_id`
  - `product_id`
- response price surfaces:
  - `price`
  - `marketing_actions`
  - `price_indexes`
  - `commissions`
  - `acquiring`
  - `volume_weight`
- `ItemPricev5` includes:
  - `price`
  - `old_price`
  - `marketing_seller_price`
  - `min_price`
  - `net_price`
  - `retail_price`
  - `currency_code`
  - `vat`
  - auto-action flags
- operation description explicitly says price update history is viewed only in Seller personal cabinet; no history API behavior is inferred.
- endpoint-local subscription restriction: not present
- errors: `400`, `403`, `404`, `409`, `500` via `rpcStatus`
- pagination is caller-controlled `cursor` + `limit`; no automatic continuation is authorized.

## 2. POST /v1/product/prices/details

- operationId: `ProductPricesDetails`
- deprecated: not marked deprecated
- auth headers: required `Client-Id`, required `Api-Key`
- requestBody.required: `true`
- operation description: `Доступно для продавцов с подпиской Premium Pro.`
- endpoint access: `Premium Pro` only
- request schema: `v1ProductPricesDetailsRequest`
- required field: `skus`
- `skus`:
  - array
  - minItems `1`
  - maxItems `1000`
  - items: string `int64`
- no pagination fields in the request or response
- response schema: `v1ProductPricesDetailsResponse`
  - `prices[]`: `v1ProductPricesDetailsResponsePrice`
- response fields include:
  - `offer_id`
  - `sku` int64
  - `price`
  - `customer_price`
  - `price_indexes`
  - `discount_percent` is individually deprecated
- `moneyMoney` and `moneyMoneyCustomerPrice` expose `amount` string and `currency` string.
- errors: `400`, `403`, `404`, `409`, `500` via `rpcStatus`.

## 3. POST /v1/seller-actions/list

- operationId: `SellerActionsList`
- deprecated: not marked deprecated
- auth headers: required `Client-Id`, required `Api-Key`
- requestBody.required: not set in the operation
- request schema: `v1SellerActionsListRequest`
- schema-required field: `limit`
- allowed request fields:
  - `action_ids`
  - `action_type`
  - `limit`
  - `offset`
  - `search`
  - `status`
- `action_ids`:
  - array
  - maxItems `100`
  - item type string `uint64`
- `action_type`: array of enum:
  - `DISCOUNT`
  - `VOUCHER_DISCOUNT`
  - `DISCOUNT_WITH_CONDITION`
  - `INSTALLMENT`
  - `INDIVIDUAL_DISCOUNT_BY_PRODUCTS`
  - `OZON_ACCOUNT_DISCOUNT`
  - `MULTI_LEVEL_DISCOUNT_ON_AMOUNT`
- `limit`: integer `uint64`, minimum `1`, maximum `100`
- `offset`: integer `uint64`, caller-controlled
- `search`: string
- `status`: array of enum:
  - `ACTIVE`
  - `ENDED`
  - `PLANNED`
  - `PAUSED`
- response schema: `v1SellerActionsListResponse`
  - `actions[]`
  - `total` uint64
- action response includes:
  - `action_id`
  - `action_parameters`
  - `allow_delete`
  - `is_editable`
  - `is_participated`
  - `is_turn_on`
  - `sku_count`
- action parameters include title, type, status, start/end date-time, discount values, budget fields and other action configuration.
- endpoint-local subscription restriction: not present
- error response: `default` via `googlerpcStatus`
- pagination is caller-controlled offset/limit; no automatic continuation is authorized.

## 4. POST /v1/seller-actions/products/list

- operationId: `SellerActionsProductsList`
- deprecated: not marked deprecated
- auth headers: required `Client-Id`, required `Api-Key`
- requestBody.required: not set in the operation
- request schema: `v1SellerActionsProductsListRequest`
- schema-required fields:
  - `action_id`
  - `limit`
- allowed request fields:
  - `action_id`: integer `uint64`
  - `cursor`: integer `uint64`
  - `limit`: integer `int64`, minimum `1`, maximum `100`, default `100`
- `action_id` is obtained from `/v1/seller-actions/list`.
- response schema: `v1SellerActionsProductsListResponse`
  - `cursor`: integer `uint64`
  - `has_next`: boolean
  - `products[]`
- product response fields include:
  - `action_price`
  - `base_price`
  - `currency`
  - `discount_percent`
  - `is_active`
  - `min_seller_price`
  - `name`
  - `offer_id`
  - `price`
  - `product_id`
  - `quant_size`
  - `quant_type`
  - `sku[]` string `uint64`
- endpoint-local subscription restriction: not present
- error response: `default` via `googlerpcStatus`
- pagination is caller-controlled cursor/limit; `has_next` is evidence of continuation, but no hidden continuation is authorized.

## Contract decision

All four target contracts are sufficiently closed for a strict fixed-host read-only implementation without guessing.

`PATCH_B2_PRICES_LISTING_STATE_CONTRACTS_CONFIRMED`
