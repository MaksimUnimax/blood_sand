# B44 FBO Posting Get — candidate evidence

Base authority: accepted B43 production tree `6c9e371fb4f63cf96daa59984f395a3812c56ae59f726296b9f3f8e75d4bfc31`.

Exact Seller Swagger authority verified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B44 closes the remaining direct FBO posting-detail read that pairs with the already accepted `posting_fbo_list`:
- `posting_fbo_get` — `POST /v2/posting/fbo/get`

The endpoint is current, non-deprecated and exact entitlement compilation classifies it as `ALL_ACCOUNTS`. Exact request schema requires only `posting_number` as a string; optional `translit` is boolean and optional `with` contains boolean `analytics_data`, `financial_data`, and `legal_info`. Swagger declares no `minLength` for `posting_number`, so B44 does not invent one.

Exact response-schema privacy traversal found no phone/email/address/customer-name/client-name/person-name/driver-name/passport fields. The response can include `legal_info` (company name/INN/KPP) and product `digital_codes`; B44 deliberately applies the same stronger FBO safe-projection policy already used by `posting_fbo_list`, redacting both `result.legal_info` and `result.products[].digital_codes`. Injected phone/email/address fields remain redacted. Safe analytics, product, status and financial fields remain available.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, entitlement, exact-Swagger currentness/privacy, FBO strengthened safe projection, zero-request guidance, B43-and-earlier carry-forward, protected runtime byte identities, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command still maps to one physical Seller business request. Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
