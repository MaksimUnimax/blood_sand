# Patch B1 — Assortment Master contract research result

Date: 2026-08-25
Final status: `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`

## Authority and provenance

- Branch: `feature/ozon-b1-assortment-master-contracts-2026-08-25`
- Previous environment-only result commit: `8053ddfddca115badc8857e1e49c873cb40e0ba2`
- Operator evidence record commit: `0bf15febc68c9478a3a8d49e0f93dcbe9b428e39`
- Fixed official source requested from operator browser: `https://docs.ozon.ru/api/seller/swagger.json`
- Production modifications during contract research: `0`
- Real Seller business requests during contract research: `0`
- Real Performance requests during contract research: `0`

The prior Node redirect-loop and missing persistent-Chrome failures were environment-only and are superseded by an operator-supplied official Swagger artifact.

## Swagger validation

Operator-supplied `swagger.json`:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Ozon Seller API document version: `2.1`
- server: `//api-seller.ozon.ru`
- path count: `463`
- all three target paths present
- recursive local `$ref` closure complete for all three target operations
- unresolved local refs: `0`

The browser final redirect chain and raw HTTP status were not separately captured; no values are invented for them. Contract confirmation is based on the supplied Ozon Seller OpenAPI artifact, its byte identity, document validation, target presence, and closed local reference graph.

Detailed bounded evidence:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_OPERATOR_SWAGGER_EVIDENCE_2026-08-25.md`

## Confirmed target operations

1. `/v3/product/list`
   - method: `POST`
   - operationId: `ProductAPI_GetProductList`
   - request body required
   - pagination: explicit `last_id` + `limit`; no automatic continuation is authorized
   - limit evidence: 1..1000
   - identifier filters: `offer_id`, `product_id`, `skus`; one identifier group at a time, maximum 1000 products
   - response continuation: `result.last_id`
   - response total: `result.total`

2. `/v3/product/info/list`
   - method: `POST`
   - operationId: `ProductAPI_GetProductInfoList`
   - request body required
   - identifier arrays: `offer_id`, `product_id`, `sku`
   - maximum 1000 products across the identifier parameters in one request
   - no pagination/continuation field in the contract
   - response: `items[]`

3. `/v4/product/info/attributes`
   - method: `POST`
   - operationId: `ProductAPI_GetProductAttributesV4`
   - request body required
   - filters: `offer_id`, `product_id`, `sku`, `visibility`
   - pagination: explicit `last_id` + `limit`
   - limit: 1..1000
   - documented sort fields: `sku`, `offer_id`, `id`, `title`
   - `sort_dir` official evidence is internally inconsistent: description says `asc`/`desc`, example uses `ASC`; implementation must preserve that uncertainty rather than inventing an extra interpretation
   - response continuation: `last_id`
   - response total: `total`

All three operations require `Client-Id` and `Api-Key` header parameters and are not marked deprecated.

Documented error responses for all three: `400`, `403`, `404`, `409`, `500` using `rpcStatus`.

## Current-contract corrections

- `/v3/product/list` current operationId is `ProductAPI_GetProductList`; the older repository locator value `ProductAPI_GetProductListv3` is stale and must not be treated as current authority.
- `/v3/product/info/list.items[].showcases_visibility` is absent from this exact current Swagger.
- `/v3/product/info/list.items[].images360` is absent from this exact current Swagger.
- `/v3/product/info/list.items[].is_kgt` is present.
- `/v3/product/info/list.items[].is_prepayment_allowed` is individually marked deprecated; this does not deprecate the operation.

## Historical claim re-check

1. `/v3/product/list` supports `filter.skus`: `CURRENT_SWAGGER_PRESENT`
2. `/v3/product/list` exposes `result.items[].sku`: `CURRENT_SWAGGER_PRESENT`
3. `/v3/product/list` supports visibility filtering: `CURRENT_SWAGGER_PRESENT`
4. `/v3/product/info/list` exposes `items[].showcases_visibility`: `CURRENT_SWAGGER_ABSENT`
5. `/v3/product/info/list` exposes `items[].is_kgt`: `CURRENT_SWAGGER_PRESENT`
6. `/v3/product/info/list` does not expose legacy `items[].images360`: `CURRENT_SWAGGER_PRESENT`
7. `/v4/product/info/attributes` supports visibility filtering: `CURRENT_SWAGGER_PRESENT`
8. `sku` remains a usable list/info join: `CURRENT_SWAGGER_PRESENT`

## Rate / entitlement evidence

No target-local Premium/subscription restriction appears in the three operation definitions or their required schema closures.

The same official Swagger's general Seller API process documentation states a provider-wide limit of no more than 50 requests per second across all methods for one Client ID. This does not authorize hidden retry, fanout, automatic pagination, or quota guessing.

## Gate decision

The B1 core Product Master contract gap is closed without guessing transport or schema.

Production implementation is now authorized for these three fixed read operations, subject to all accepted B0 invariants:

- fixed Seller API host/method/path;
- strict allowlisted request fields;
- one explicit command = one physical Seller business request;
- no hidden pagination/fanout/retry;
- exact command preserved through entitlement planning;
- no changes to Autorun, Work-session lifecycle, Manual button timing/state, provider quota/cache/history/no-replay semantics, credentials or transport ownership unless explicitly required and separately evidenced.

Final decision:

`PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`
