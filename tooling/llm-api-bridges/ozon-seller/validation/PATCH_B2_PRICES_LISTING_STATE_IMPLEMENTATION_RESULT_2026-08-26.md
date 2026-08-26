# Patch B2 — Prices / Listing State production implementation result

Date: 2026-08-26
Status: `PATCH_B2_PRICES_LISTING_STATE_CANDIDATE_GREEN`

## Authority

- accepted B1 production tree SHA-256: `2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740`
- exact official Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- B2 patch SHA-256: `bffc2fc1e1e32f400e89bc3164f582b86a64a7f579af46d231f63baa427dfd63`
- B2 candidate production tree SHA-256: `3566796bc960530e230e054cbdaf08b8dd3ef826eb6eba756f4a7d436492f32c`

## Production delta

Exactly three production files change relative to accepted B1:

- `shared/ozon_operation_registry.js` -> `6abe5437515cc757d46038bc09afe19a72a5cd7a6554a3bc8afd35c812a48f40`
- `shared/ozon_contract.js` -> `fd4f5a6db4a3715e9fb07694054e0329a455b58971a1585c237d1b5e06ca1174`
- `shared/ozon_entitlements.js` -> `91fd5e0fe6d3a10a88cae8c837b8e90c45010bd4a4da46c2ff0c964f9b8063a5`

No other production file changes.

## Added read operations

- `product_prices_bulk` -> `POST /v5/product/info/prices`
- `product_price_details` -> `POST /v1/product/prices/details`
- `seller_actions_list` -> `POST /v1/seller-actions/list`
- `seller_action_products` -> `POST /v1/seller-actions/products/list`

## Contract behavior

- strict field allowlists;
- exact Ozon limits and enums from the fixed Swagger;
- string int64 validation for product/SKU identifiers where the schema uses string int64;
- string uint64 validation for `seller_actions_list.action_ids`;
- numeric uint64 action/cursor values are accepted only when representable as safe nonnegative JavaScript integers, preventing silent numeric corruption;
- caller-controlled cursor/offset only;
- no automatic pagination;
- exact Premium Pro entitlement for `product_price_details`;
- all other B2 targets use ordinary all-account entitlement;
- dynamic Swagger compiler independently produces the same entitlement classification.

## Local validation

Passed:

- `B2_PRICES_LISTING_REGISTRY_PASS`
- `B2_PRICES_LISTING_EXACT_REQUEST_PASS`
- `B2_PRICES_LISTING_CONTRACT_PASS`
- `B2_PRICES_LISTING_ENTITLEMENTS_PASS`
- `B2_PRICES_LISTING_GUIDANCE_PASS`
- `B2_NO_HIDDEN_PAGINATION_FANOUT_PASS`
- `B2_B1_ASSORTMENT_REGRESSION_PASS`
- `B2_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B2_OFFICIAL_SWAGGER_CONTRACT_PASS`
- `B2_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS`
- `B2_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS`

Seller requests: `0`
Performance requests: `0`
