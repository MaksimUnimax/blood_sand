# B20 Catalog Certificate Data Reads — accepted

Status: `PATCH_B20_CATALOG_CERTIFICATE_DATA_READS_ACCEPTED`

- Accepted B19 authority: `23586900e59de9f743fe9fc2aac6e5883c644b4b`
- Exact B20 candidate: `515f6f890ee413547864e857d1f42698f59a5163`
- Independent tester commit: `95be30a042da176f8e4b301a5a57e5e5de577d5d`
- Independent decision: `PATCH_B20_CATALOG_CERTIFICATE_DATA_READS_INDEPENDENT_TEST_PASS`
- Gzip patch SHA-256: `a56cfc934f42a6b4ad9f67a71fd7e230a280c84779f2a92071f773663c1ed190`
- Raw patch SHA-256: `b72ccb007d13aafd904c3ff6aee8aef1a9bcbf3085271d7e4f087539d112abb2`
- Accepted production tree: `126ac9add7c099b758a962415fdbf0c662e00f0b51482228cf9c58a01afd7496`
- Production file count: `21`

Accepted B20 reads:

- `product_certificate_info` → `POST /v1/product/certificate/info`
- `product_certificate_list` → `POST /v1/product/certificate/list`
- `product_certificate_products` → `POST /v1/product/certificate/products/list`

The products-list bridge contract intentionally exposes the newer `limit` / optional `last_id` branch and does not expose deprecated `page` / `page_size` inputs.

Certificate mutations remain excluded. No automatic pagination, retries, fanout, document fetching, chained calls, or provider chaining are introduced.

Exact Seller Swagger author-side authority remained:

- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

Final CI run for the corrected B20 candidate: `33044053377`; Linux and Windows passed. Artifact ID `9634931905`, digest `sha256:6fcef84e4e188ef5fdef21fac51a84b6e4a606c0c7d399ef6823a38f87bc9ea4`.

Independent safety accounting:

- Seller business requests = `0`
- Performance business requests = `0`
- credentials used = `0`
- tester production modifications = `0`

Subsequent work must use this acceptance commit as the authority base and preserve protected runtime behavior unless separately scoped.