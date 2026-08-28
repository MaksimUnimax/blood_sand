# B31 FBS Carriage Container Reads — candidate evidence

Status: `B31_AUTHOR_GATE_PASS`

Internal base: `c4de5f38e52a05b41672a2f2580cc160ef0346b0` (B30 candidate, Linux/Windows CI PASS under temporary no-Codex workflow).
B30 production tree: `4a50a0d40af544aa3006dcf1b378c04c70c555f92179364b12771d2ad1ae72ce`.

Exact Seller Swagger: bytes `3933043`, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, paths `463`.

B31 adds four non-deprecated `CarriageAPI`, `ALL_ACCOUNTS`, read-only methods: `/v1/carriage/container/get`, `/v1/carriage/container/list`, `/v1/carriage/container/status/get`, `/v1/carriage/container/task/info`. All use `READ`, `READ_SAFE`, `safe_projection`, `single_read`, `orders_postings / assembly_carriage`.

Exact-schema oddities are preserved literally rather than repaired. `container/list.cursor` is a string carrying numeric keyword `maximum: 1000`; B31 does not reinterpret it as `maxLength`. `container/status/get.container_ids` is an array carrying numeric keywords `minimum: 1` and `maximum: 1000`; B31 does not reinterpret them as `minItems/maxItems`, so an empty array or more than 1000 explicitly supplied IDs is not rejected solely on count. Element type remains `string/int64`.

Container documents/labels and all state-changing container operations are intentionally excluded. No retries, cursor continuation, polling, fanout, provider chaining, capability probe or secondary request is introduced. Response-schema review found no buyer/customer/phone/email/recipient fields in these four enabled reads.

Seller business requests: `0`. Performance business requests: `0`. Credentials used: `0`.
