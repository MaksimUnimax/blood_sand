# Patch B2 — Prices / Listing State contract research result

Date: 2026-08-26
Final status: `PATCH_B2_PRICES_LISTING_STATE_CONTRACTS_CONFIRMED`

## Authority

- accepted B1 production tree: `2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740`
- B1 acceptance commit: `c76a713a40db18fb21eedcf8f35f5a0555845f0f`
- exact official Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- exact official Swagger bytes: `3933043`
- Seller business requests during research: `0`
- Performance requests during research: `0`
- production modifications during research: `0`

## Confirmed operations

1. `product_prices_bulk`
   - `POST /v5/product/info/prices`
   - `ProductAPI_GetProductInfoPrices`
   - required `filter` + `limit`
   - limit `1..1000`
   - optional caller cursor
   - offer_id/product_id/visibility filter
   - ordinary all-account endpoint

2. `product_price_details`
   - `POST /v1/product/prices/details`
   - `ProductPricesDetails`
   - required `skus`
   - 1..1000 string int64 SKU values
   - no pagination
   - endpoint explicitly restricted to `Premium Pro`

3. `seller_actions_list`
   - `POST /v1/seller-actions/list`
   - `SellerActionsList`
   - schema-required `limit`
   - limit `1..100`
   - action/status/search/offset filters
   - action_ids max 100 string uint64 values
   - ordinary all-account endpoint

4. `seller_action_products`
   - `POST /v1/seller-actions/products/list`
   - `SellerActionsProductsList`
   - schema-required `action_id` + `limit`
   - limit `1..100`
   - caller cursor
   - response `has_next`
   - ordinary all-account endpoint

## Implementation constraints

- fixed Seller API host/method/path only;
- all four remain READ operations even though transport method is POST;
- one explicit command = one physical Seller business request;
- no hidden pagination, retry or fanout;
- no report creation/polling;
- no transport injection;
- no silent JS-number coercion for uint64 identifiers;
- no changes to Autorun, Work-session lifecycle, Manual controls, provider quota/cache/history/no-replay, credentials or transport ownership.

Final decision:

`PATCH_B2_PRICES_LISTING_STATE_CONTRACTS_CONFIRMED`
