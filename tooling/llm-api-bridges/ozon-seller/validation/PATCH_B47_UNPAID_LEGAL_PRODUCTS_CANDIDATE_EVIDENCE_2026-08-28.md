# B47 Unpaid Legal Products — candidate evidence

Base authority: accepted B46 production tree `44e6a11daf318d51cef85bebf648f35fca97a1ed7fbabbbb2e487f99d827bbaf`.

Exact Seller Swagger authority reverified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B47 adds one direct safe FBS business read:
- `posting_unpaid_legal_product_list` — `POST /v1/posting/unpaid-legal/product/list`

The method returns products from unpaid orders placed by legal entities. Exact response fields are limited to `product_id`, `offer_id`, `quantity`, `name`, `image_url`, and page `cursor`; there are no buyer/company identity, phone, email, address, person, document, barcode, token, webhook, or secret fields.

Exact request schema requires `limit` (`int32`, 1..1000) and allows optional string `cursor`. Swagger declares no `cursor.minLength`, so B47 does not invent one. Cursor advances the page only when explicitly supplied in a new AI command; there is no automatic pagination.

Exact entitlement compilation classifies the endpoint as `ALL_ACCOUNTS`. It is current, non-deprecated, and has no shutdown warning.

A nearby notification reference candidate (`POST /v1/notification/push-type/list`) was explicitly excluded after recursive schema inspection because its response contains `types[].seller_endpoint.url`, exposing configured notification endpoint URLs. Conditional-cancellation free-text reads remain excluded for the previously recorded privacy reason.

Runtime `safe_projection` preserves ordinary product `image_url` while still redacting injected customer/address/phone/email fields. One explicit AI command still maps to one physical Seller request.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, entitlement, exact-Swagger currentness/privacy and rejected-gap evidence, safe projection, zero-request guidance, B46-and-earlier carry-forward, protected runtime byte identities, deterministic recursive materialization, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
