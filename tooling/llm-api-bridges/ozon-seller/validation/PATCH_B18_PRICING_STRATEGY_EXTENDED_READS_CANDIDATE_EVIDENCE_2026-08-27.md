# Patch B18 Pricing Strategy Extended Reads — Candidate Evidence

## Authority

- Accepted B17 authority: `87626dbe2b9192f8c0c6bc6cd58ebbbce70c76e7`
- Accepted B17 production tree: `4577b9ac48988560caaa66e197179d76b05d35ce5f515f241a3b63e558b80e34`
- Exact Seller Swagger: `3933043` bytes
- Exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Paths: `463`

## B18 scope

B18 adds two current read-only PricingStrategyAPI operations:

1. `pricing_strategy_competitors` -> `POST /v1/pricing-strategy/competitors/list`
2. `pricing_strategy_ids_by_product_ids` -> `POST /v1/pricing-strategy/strategy-ids-by-product-ids`

Both are fixed single reads, `READ_SAFE`, `safe_projection`, all-account, and do not expose caller-controlled transport.

## Exact contracts

`pricing_strategy_competitors` uses `v1GetCompetitorsRequest`: required integer/int64 `page` and `limit`. Exact descriptions state page minimum `1` and limit `1..50`. There is no automatic page continuation.

`pricing_strategy_ids_by_product_ids` uses `v1ItemIDsRequest`: required `product_id` array of string int64 values. Exact description caps one request at 50 product IDs. B18 enforces that cap and never splits/fans out the array. No undocumented minimum array size is invented.

## Mutations excluded

B18 does not enable pricing-strategy create, update, delete, status changes, product add or product delete operations.

## Author-side verification

Passed locally against the exact B18 tree and exact Seller Swagger:

- `B18_PRICING_STRATEGY_EXTENDED_REGISTRY_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_EXACT_REQUEST_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_CONTRACTS_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_ENTITLEMENTS_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS`
- `B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_EXACT_SWAGGER_CURRENTNESS_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_EXACT_ENTITLEMENTS_PASS`
- `B18_PRICING_STRATEGY_EXTENDED_PROTECTED_RUNTIME_IDENTITIES_PASS`

All 18 production JavaScript files pass `node --check`.
Seller business requests: `0`. Performance business requests: `0`. Credentials: `0`.
