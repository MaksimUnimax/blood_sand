# B30 FBS Delivery & Assembly Reads — candidate evidence

Status: `B30_AUTHOR_GATE_PASS`

Internal base: `3e6439a6021921b4e53e7c71a7ed72a9b5237aa3` (B29 corrected candidate, Linux/Windows CI PASS under temporary no-Codex workflow).
B29 production tree: `ce095effe9dd2f81c46528015a30ce8a839665fb84affb69010c4c34e2736502`.

Exact Seller Swagger: bytes `3933043`, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, paths `463`.

B30 adds eight fixed read-only DeliveryFBS operations: carriage availability/info, FBS act list/status, carriage assembly posting/product lists, and FBS assembly posting/product lists. All are non-deprecated, `ALL_ACCOUNTS`, `READ`, `READ_SAFE`, `safe_projection`, `single_read`.

Exact contract rules are preserved without invented lower bounds: act list limit max 50; carriage assembly list limit max 100; FBS assembly list limit max 1000; FBS assembly delivery_method_id max 1000. RFC3339 validation is used only where Swagger declares `format: date-time`. The act-list filter date strings have no Swagger format/minLength and therefore remain plain required strings when the optional filter block is supplied.

`POST /v2/carriage/delivery/list` is intentionally NOT enabled because the exact Swagger snapshot contains a suspicious leading-space date pattern; B30 does not guess or repair that contract. No barcode/PDF/label/document-producing endpoints are added. Recursive response-schema review found no buyer/customer/phone/email/recipient fields in the eight enabled operations; product/logistics names and picture/provider icon URLs remain data only and are never auto-fetched.

No retries, automatic cursor/offset pagination, polling, fanout, capability probe, provider chaining or secondary request. Protected runtime bytes unchanged. Seller requests `0`; Performance requests `0`; credentials used `0`.
