# B16 Warehouse / Delivery Diagnostics — candidate evidence

Accepted B15 authority: `09af95fe2aa2ab05adf11d0500fd358e19d013e4`

Production base tree: `401692a486696189cc9bf81f58fd2066fe3babfb087747a7ccbb8519bacce07f`

B16 adds four fixed read-only Seller API operations:
- `seller_delivery_method_list` -> `POST /v2/delivery-method/list`
- `delivery_method_return_settings` -> `POST /v1/delivery-method/return/settings/get`
- `warehouse_invalid_products` -> `POST /v1/warehouse/invalid-products/get`
- `warehouses_with_invalid_products` -> `POST /v1/warehouse/warehouses-with-invalid-products`

The exact Swagger supplied by the operator was verified at 3,933,043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths.

Currentness:
- `/v2/delivery-method/list` is current and non-deprecated.
- legacy `/v1/delivery-method/list` explicitly says it is disabled from 7 April 2026 and points to v2; B16 does not enable it.
- the other three B16 routes are non-deprecated in the exact Swagger.

Safety:
- all four are `READ`, `READ_SAFE`, `safe_projection`, `single_read`;
- no caller-controlled host/path/method/headers/auth;
- no hidden cursor/last_id pagination, retry, fanout, chaining or mutations;
- no real Seller/Performance request is used in validation.

Exact patch identities:
- gzip SHA-256: `c67470516706c723dc4d9d4b199624cc3a354c3ef8082b10db5f3d2bceacdf5e`
- raw SHA-256: `7655c1b793a40321c8b640ce6b5cc05c2df922194900eff27dcef73ace8cd756`
- B16 21-file production tree: `03953160b440712f202c5e710226d93ceb540e132d8e821ea4763904a8b887eb`
- registry: `e85a2033a4cc07141c221fdece96aacfe260e475b03d91937ac5a67f5d4e2ba2`
- contract: `a7d640f88a7830da39c3c75dba7fa93455ee2eca10fb42391c77c19ec919c162`
- entitlements: `96cb9045df3a3d651a801bdc3d5e694bfe520a51b612f23ad593b9b3fae47648`

Author-side exact Swagger regression markers:
`B16_WAREHOUSE_DELIVERY_EXACT_SWAGGER_CURRENTNESS_PASS`
`B16_WAREHOUSE_DELIVERY_EXACT_ENTITLEMENTS_PASS`
