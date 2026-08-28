# B35 candidate evidence

- Scope: marketplace search-query analytics reads.
- Added: `marketplace_search_queries_text` -> `POST /v1/search-queries/text`; `marketplace_search_queries_top` -> `POST /v1/search-queries/top`.
- Exact Swagger: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; 463 paths.
- Both operations: current, non-deprecated, key-permitted, Premium Pro only.
- No automatic subscription capability probe: unknown capability rejects before business request; known Premium Pro executes; other tiers reject.
- Text request: required string/int64 `limit` max 50, required string/int64 `offset` max 50, required string `text` with no invented minLength; optional exact sort enums.
- Top request: required string/int64 `limit` max 50, required string/int64 `offset` max 1000; no invented minimum for either field.
- No automatic pagination/retries/fanout/provider chaining.
- Response graph privacy scan: no buyer/customer/phone/email/recipient/address fields.
- Author gate: PASS. Seller requests = 0; Performance requests = 0; credentials used = 0.
