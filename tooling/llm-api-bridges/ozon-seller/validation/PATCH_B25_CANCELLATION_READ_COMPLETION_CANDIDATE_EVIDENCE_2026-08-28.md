# B25 Cancellation Read Completion — candidate evidence

Status: `B25_AUTHOR_GATE_PASS`

Internal base: B24 `972e0aeb039ae29660985296f410045dade5231c`, Linux/Windows CI PASS.

B25 adds two current read-only Seller operations:
1. `posting_fbo_cancel_reason_list` -> `POST /v1/posting/fbo/cancel-reason/list` (true no-body POST).
2. `order_cancel_check` -> `POST /v1/order/cancel/check` (required `order_number:string`).

Exact Seller Swagger authority: 3933043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths. Both routes are non-deprecated and compile as ALL_ACCOUNTS with no capability probe. Swagger does not define `minLength` for `order_number`; B25 therefore validates type/requiredness but does not invent a non-empty constraint.

No cancellation mutation is enabled. One command produces one request; no retry, pagination, fanout, polling, provider chaining or secondary request is introduced. Protected runtime files remain byte-identical.

Author regression, B24 carry-forward, exact Swagger currentness/entitlements and 18 JS syntax checks: PASS.
Seller business requests: `0`. Performance business requests: `0`. Credentials used: `0`.
