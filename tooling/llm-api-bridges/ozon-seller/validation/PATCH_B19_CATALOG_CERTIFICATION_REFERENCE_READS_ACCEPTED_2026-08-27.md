# Patch B19 Catalog Certification Reference Reads — ACCEPTED

- Candidate: `ae34aa6218b675d2c7d91bee7a605fb92d6b86e5`
- Independent validation: `0f57152170b552c2aed49887fbb6ce6c0373b30c`
- Accepted B18 authority: `f8c0a706bdd5d5d763e50f1162ba7989ed064908`
- Materialized production tree: `5d67ec8a6b58d510898ddd87de8c8ced3ef3c1233e67680a476e46baef409615`
- Independent result: `PATCH_B19_CATALOG_CERTIFICATION_REFERENCE_READS_INDEPENDENT_TEST_PASS`
- Seller business requests during independent validation: `0`
- Performance business requests during independent validation: `0`
- Credentials used during independent validation: `0`
- Tester production modifications: `0`

Accepted B19 read surface:
- `brand_company_certification_list` -> `POST /v1/brand/company-certification/list`
- `product_certificate_product_status_list` -> `POST /v1/product/certificate/product_status/list`
- `product_certificate_rejection_reasons` -> `POST /v1/product/certificate/rejection_reasons/list`
- `product_certificate_status_list` -> `POST /v1/product/certificate/status/list`
- `product_certificate_types` -> `GET /v1/product/certificate/types`
- `product_certificate_accordance_types` -> `GET /v2/product/certificate/accordance-types/list`
- `product_certification_categories` -> `POST /v2/product/certification/list`

Legacy `POST /v1/product/certification/list` remains excluded. Certificate mutations remain disabled. No automatic pagination, retry, fanout or provider chaining is enabled. Protected runtime remains unchanged.

`PATCH_B19_CATALOG_CERTIFICATION_REFERENCE_READS_ACCEPTED`