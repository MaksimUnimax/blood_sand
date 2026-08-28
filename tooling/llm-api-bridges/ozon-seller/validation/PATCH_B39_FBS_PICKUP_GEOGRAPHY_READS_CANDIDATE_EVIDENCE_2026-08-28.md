# B39 FBS Pickup Geography Reads — candidate evidence

Base authority: B38 production tree `8011faa572366f8d9de3bf7cfcbc198a00e93140471a7d9624a4461b425b48bf`.

Adds exactly two Seller read-only operations:
- `warehouse_fbs_pickup_history_list` — `POST /v1/warehouse/fbs/pickup/history/list`
- `delivery_polygon_list` — `POST /v1/polygon/list`

Safety: one explicit command => one request; no automatic cursor continuation, retries, fanout, provider chaining, mutations, documents, credentials, or customer PII. Warehouse names are operational seller logistics data; polygon coordinates describe delivery geography, not customer addresses.

Exact Swagger authority used author-side: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

Author gates: registry/contract/entitlements, request construction, Swagger currentness, safe projection, zero-request guidance, B38-and-earlier carry-forward, protected runtime identities, and 18 production-JS syntax checks all PASS.

Seller business requests: 0. Performance business requests: 0. Credentials used: 0.
