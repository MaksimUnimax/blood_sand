# B23 Seller Account & Ozon Logistics Reads — candidate evidence

Status: `B23_AUTHOR_GATE_PASS`

Internal base: `e13926d46fb35e9f634595619a370a6290db773d` (B22 candidate, CI PASS; independent Codex gate intentionally skipped under temporary workflow).
B22 production tree: `e3facdb871a287477b59594ca03b1252719750e597f00c2b3261344867436aa9`.

Exact Seller Swagger authority used author-side:
- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

B23 adds two fixed read-only Seller operations:
1. `seller_info` -> `POST /v1/seller/info`
2. `seller_ozon_logistics_info` -> `POST /v1/seller/ozon-logistics/info`

Both are exact current `SellerInfo` operations, non-deprecated, with no requestBody in the supplied Swagger. The bridge sends true no-body POST requests, fixes host/method/path, rejects caller transport injection, and executes no automatic follow-up calls.

Exact entitlement compilation marks both routes `ALL_ACCOUNTS` with no endpoint subscription restriction. No Seller capability probe is required.

Author-side regression passed registry, exact request construction, contracts, result sanitization, entitlements, guidance zero-request accounting, B22-and-earlier carry-forward, protected runtime identities, exact Swagger currentness/entitlements, and 18 JavaScript syntax checks.

Seller business requests during author tests: `0`.
Performance business requests during author tests: `0`.
Credentials used during author tests: `0`.
