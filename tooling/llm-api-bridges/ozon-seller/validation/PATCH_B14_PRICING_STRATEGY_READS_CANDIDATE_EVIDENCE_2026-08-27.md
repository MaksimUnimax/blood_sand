# Patch B14 Pricing Strategy Reads — candidate evidence

## Authority

- Accepted B13 authority: `3e48f78a8a0aa0d2bb0e52d7f64bb3bb5fe03605`
- Accepted B13 production tree: `df77a8cff2e446380ec92c38ba818638ab72cae96d2e0f6a2c2b0f1b4ab854b5`
- Exact Seller Swagger bytes: `3933043`
- Exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

## Exact B14 surface

- `pricing_strategy_list` -> `POST /v1/pricing-strategy/list`
- `pricing_strategy_info` -> `POST /v1/pricing-strategy/info`
- `pricing_strategy_products` -> `POST /v1/pricing-strategy/products/list`
- `pricing_strategy_product_info` -> `POST /v1/pricing-strategy/product/info`

The mutation `POST /v1/pricing-strategy/status` remains unexposed.

## Exact request contracts

`/v1/pricing-strategy/list`
- request schema `v1GetStrategyListRequest`;
- required `page`, `limit`;
- both are integer/int64;
- documented page minimum `1`;
- documented limit `1..50`.

`/v1/pricing-strategy/info` and `/v1/pricing-strategy/products/list`
- request schema `v1StrategyRequest`;
- required `strategy_id`;
- string.

`/v1/pricing-strategy/product/info`
- request schema `v1GetStrategyItemInfoRequest`;
- required `product_id`;
- integer/int64 represented as a safe JavaScript integer.
- response field `strategy_competitor_product_url` is a string and remains data-only.

## Entitlements

Exact full-Swagger compilation:
- all four reads: `ALL_ACCOUNTS`;
- endpoint subscription types: `null`;
- full unresolved rule count remains `12`.

## Candidate identities

- B14 raw patch SHA-256: `0c98be2b82c800987b1a8c76e5ef86dcfe53ee5206e80d9fd9aac32e92f38ace`
- B14 gzip patch SHA-256: `b1f9839614e91372404928aa77200450fa120df52fd90fd36a326bfc5339f3ee`
- materialized production file count: `21`
- B14 production tree SHA-256: `fb4877ad074f86d0a855d51b67bcb5b574a2bfc88727f63b83927ff5eb8e64fa`

Changed production identities:
- `shared/ozon_operation_registry.js`: `b51d634d4d8caf9f3489cf59ac9ebe7787798973f90625f90c33615514e06955`
- `shared/ozon_contract.js`: `3596f5b786b563d240d640a770fbc94960da771342bd48777f76979950e6c54d`
- `shared/ozon_entitlements.js`: `05afac352727856cff1084fba9b6fd25532a9e6c2e2c16c3a0e972e2ee07f4a5`

Protected runtime is byte-identical to B13.

## Local deterministic result

Observed:
- `B14_PRICING_STRATEGY_REGISTRY_PASS`
- `B14_PRICING_STRATEGY_EXACT_REQUEST_PASS`
- `B14_PRICING_STRATEGY_CONTRACTS_PASS`
- `B14_PRICING_STRATEGY_ENTITLEMENTS_PASS`
- `B14_PRICING_STRATEGY_URL_DATA_ONLY_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS`
- `B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS`
- `B14_PRICING_STRATEGY_EXACT_SWAGGER_CURRENTNESS_PASS`
- `B14_PRICING_STRATEGY_EXACT_ENTITLEMENTS_PASS`
- `B14_PRICING_STRATEGY_PROTECTED_RUNTIME_IDENTITIES_PASS`

Safety accounting:
- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
