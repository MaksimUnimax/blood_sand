# Patch B19 Catalog Certification Reference Reads — Candidate Evidence

## Authority

- Accepted B18 authority: `f8c0a706bdd5d5d763e50f1162ba7989ed064908`
- Accepted B18 production tree: `300e1fe642cf0bb108f39d3e35fd4f8d97140e60ae4cc76361407685d2b0ad75`
- Exact Seller Swagger: `3933043` bytes
- Exact Seller Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- Paths: `463`

## B19 scope

B19 adds seven read-only catalog certification/reference operations:

1. `brand_company_certification_list` -> `POST /v1/brand/company-certification/list`
2. `product_certificate_product_status_list` -> `POST /v1/product/certificate/product_status/list`
3. `product_certificate_rejection_reasons` -> `POST /v1/product/certificate/rejection_reasons/list`
4. `product_certificate_status_list` -> `POST /v1/product/certificate/status/list`
5. `product_certificate_types` -> `GET /v1/product/certificate/types`
6. `product_certificate_accordance_types` -> `GET /v2/product/certificate/accordance-types/list`
7. `product_certification_categories` -> `POST /v2/product/certification/list`

All seven are fixed `READ_SAFE` / `safe_projection` single reads and expose no caller-controlled host, URL, method, headers, or authorization material.

## Currentness

The exact Swagger states that legacy `POST /v1/product/certification/list` was to be disabled on 14 April 2025 and points clients to `POST /v2/product/certification/list`; B19 enables only v2.

For accordance types, B19 uses the explicit version-2 route `GET /v2/product/certificate/accordance-types/list`. The older v1 read is not added, avoiding duplicate surface; B19 does not falsely claim Swagger marks v1 deprecated.

## Exact request contracts

`brand_company_certification_list` requires `page` and `page_size`, both `integer/int32`. The exact schema gives no minimum/maximum, so B19 enforces int32 representation but does not invent pagination bounds or automatic page advancement.

The three certificate status/rejection POST methods have no request body and accept only empty params.

The two GET dictionary methods have no request body/operation query parameters beyond authentication and accept only empty params.

`product_certification_categories` requires `page` and `page_size` as integer/int64. Exact `page_size` is `1..1000`; `page` has no documented minimum. B19 does not invent a page minimum and does not auto-page.

## Entitlements and safety

The exact Swagger declares no subscription restriction for the seven B19 reads. They compile to `ALL_ACCOUNTS` and require no Seller capability probe.

B19 does not enable certificate creation, binding, unbinding, deletion, or any other certificate mutation.

## Author-side verification

Passed locally against the exact B19 tree and exact Seller Swagger:

- `B19_CATALOG_CERTIFICATION_REGISTRY_PASS`
- `B19_CATALOG_CERTIFICATION_EXACT_REQUEST_PASS`
- `B19_CATALOG_CERTIFICATION_CONTRACTS_PASS`
- `B19_CATALOG_CERTIFICATION_ENTITLEMENTS_PASS`
- `B19_CATALOG_CERTIFICATION_NO_AUTOPAGINATION_GUIDANCE_ZERO_REQUEST_PASS`
- `B19_B18_B17_B16_B15_B14_B13_B12_B11_B10_B9_B8_B7_SEMANTICS_CARRY_FORWARD_PASS`
- `B19_CATALOG_CERTIFICATION_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B19_CATALOG_CERTIFICATION_EXACT_SWAGGER_CURRENTNESS_PASS`
- `B19_CATALOG_CERTIFICATION_EXACT_ENTITLEMENTS_PASS`

All 18 production JavaScript files pass `node --check`.

Seller business requests: `0`. Performance business requests: `0`. Credentials: `0`.
