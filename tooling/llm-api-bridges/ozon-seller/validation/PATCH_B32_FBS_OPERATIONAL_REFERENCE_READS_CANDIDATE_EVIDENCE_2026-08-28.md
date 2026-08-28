# B32 FBS Operational Reference Reads — candidate evidence

Status: `B32_AUTHOR_GATE_PASS`

Internal base: `f35eb35f016d484b7541bdbce8813d7cb391c96a` (B31 corrected candidate, Linux/Windows CI PASS under temporary no-Codex workflow).
B31 production tree: `8f371897d63a3c79bb11c8587db63fdb5335aa588f49f329d791b888d9ca55ae`.

Exact Seller Swagger authority: bytes `3933043`, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, paths `463`.

B32 adds five non-deprecated `ALL_ACCOUNTS` read-only operations: `/v2/posting/fbs/product/country/list`, `/v1/posting/fbs/restrictions`, `/v2/posting/fbs/act/get-postings`, `/v1/warehouse/fbs/return-mile/check`, and `/v1/warehouse/fbs/return-mile/info`.

All five are `READ`, `READ_SAFE`, `safe_projection`, `single_read`. They expose country reference data, FBS acceptance restrictions, postings already bound to a known act, and return-mile planning/status data. Response review found no buyer/customer/phone/email/recipient fields. Return-point address/coordinates are operational warehouse geography, not personal customer data.

Exact Swagger oddity is preserved: `warehouse_ids` is an array carrying numeric `minimum: 1` and `maximum: 1000`, but has no `minItems`/`maxItems`; B32 does not reinterpret those numeric keywords as array-count limits. Element type remains string/int64.

No retries, automatic pagination, polling, fanout, provider chaining, capability probe or secondary request. No label/barcode/document endpoint and no state-changing route is added. Protected runtime bytes are unchanged.

Seller business requests: `0`. Performance business requests: `0`. Credentials used: `0`.
