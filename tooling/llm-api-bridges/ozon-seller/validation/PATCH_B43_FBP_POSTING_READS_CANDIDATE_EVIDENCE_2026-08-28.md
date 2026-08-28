# B43 FBP Posting Reads — candidate evidence

Base authority: accepted B42 production tree `ecf74daa52ff700861b34fae756107d4f6a5c331907afc6c47a7cb65f61e3418`.

Exact Seller Swagger authority verified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B43 closes one coherent read-only FBP posting cluster with exactly two operations:
- `fbp_posting_list` — `POST /v1/posting/fbp/list`
- `fbp_posting_get` — `POST /v1/posting/fbp/get`

Both operations are current, non-deprecated and have no shutdown marker. Exact entitlement compilation classifies both as `ALL_ACCOUNTS`. The list request keeps `cursor` explicitly operator/AI supplied; no automatic continuation is added. Swagger declares `limit` 1..100 and `sort_dir` enum `ASC|DESC`; those constraints are enforced. `sort_by` is documented text but has no machine-readable enum, so B43 does not invent one. `posting_number` is required for the get operation, but Swagger has no minLength, so empty-string rejection is not invented.

Exact response-schema privacy traversal found no phone/email/address/customer-name/client-name/person-name/driver-name/passport fields. `customer_price` is a price object rather than identity data; analytics city/region are coarse operational analytics fields. Runtime `safe_projection` remains active and still redacts injected customer/address/phone/email fields.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, entitlement, exact-Swagger currentness/privacy, safe projection, zero-request guidance, B42-and-earlier carry-forward, protected runtime byte identities, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command still maps to one physical Seller business request. Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
