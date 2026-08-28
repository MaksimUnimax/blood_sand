# B26 FBO Posting Detail Read — candidate evidence

Status: `B26_AUTHOR_GATE_PASS`

Base B25: `0f246f8dc715857853f37e3e1a02aeb77beefa26` (Linux/Windows PASS).

Adds `posting_fbo_get` -> `POST /v2/posting/fbo/get` as a fixed current read-only Seller operation. Exact request: required `posting_number:string`; optional `translit:boolean`; optional `with` with only `analytics_data`, `financial_data`, `legal_info` booleans. Exact Swagger defines no `minLength` for posting_number, so B26 does not invent one.

Safety: fixed host/method/path, unknown/transport fields rejected, one command = one request, no pagination/retry/fanout/chaining. Result uses safe projection; author test confirms buyer-like `phone` and `customer_name` keys are redacted while requested financial/legal fields survive.

Exact Seller Swagger: 3933043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths. Route non-deprecated, `FBO`, ALL_ACCOUNTS, no capability probe.

B25 carry-forward, protected runtime and 18 JS syntax checks: PASS. Seller requests `0`; Performance requests `0`; credentials `0`.
