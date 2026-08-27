# Patch B20 Catalog Certificate Data Reads — Candidate Evidence

## Authority

- Accepted B19 authority: `23586900e59de9f743fe9fc2aac6e5883c644b4b`
- Accepted B19 production tree: `5d67ec8a6b58d510898ddd87de8c8ced3ef3c1233e67680a476e46baef409615`
- Exact Seller Swagger: `3933043` bytes
- Exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Paths: `463`

## B20 scope

B20 adds three current read-only CertificationAPI operations:

1. `product_certificate_info` -> `POST /v1/product/certificate/info`
2. `product_certificate_list` -> `POST /v1/product/certificate/list`
3. `product_certificate_products` -> `POST /v1/product/certificate/products/list`

All three are fixed `seller_api` single reads, `READ_SAFE`, `safe_projection`, all-account, and expose no caller-controlled transport.

## Exact contracts

`product_certificate_info` requires `certificate_number` string. The exact schema has no `minLength`, so B20 does not invent one.

`product_certificate_list` requires int32 `page` and `page_size`; exact descriptions define page minimum `1` and page_size `1..1000`. Optional `offer_id`, `status`, and `type` remain strings. No automatic page continuation.

`product_certificate_products` requires int32 `certificate_id`. The exact request schema supports two alternatives: deprecated `page/page_size` fields or the newer `limit` branch. B20 intentionally exposes only the `limit` branch (`1..1000`), with optional explicit int64 `last_id` and optional string `product_status_code`. Deprecated `page/page_size` inputs are not exposed. No automatic `last_id` continuation.

## Safety

Certificate information contains seller business-document metadata and Ozon verification comments, not buyer personal-data fields. B20 uses safe projection and does not fetch, upload, bind, unbind, create, or delete documents.

Certificate mutations remain excluded:
- `/v1/product/certificate/bind`
- `/v1/product/certificate/create`
- `/v2/product/certificate/create`
- `/v1/product/certificate/delete`
- `/v1/product/certificate/unbind`

## Author-side verification

Passed locally against the exact B20 tree and exact Seller Swagger:

- `B20_CATALOG_CERTIFICATE_DATA_REGISTRY_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_EXACT_REQUEST_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_CONTRACTS_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_ENTITLEMENTS_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS`
- `B20_B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_EXACT_SWAGGER_CURRENTNESS_PASS`
- `B20_CATALOG_CERTIFICATE_DATA_EXACT_ENTITLEMENTS_PASS`

All 18 production JavaScript files pass `node --check`.

Seller business requests: `0`.
Performance business requests: `0`.
Credentials: `0`.
