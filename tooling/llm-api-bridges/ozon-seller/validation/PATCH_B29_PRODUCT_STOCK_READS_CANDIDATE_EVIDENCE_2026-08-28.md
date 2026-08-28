# B29 Product & FBS Warehouse Stock Reads — candidate evidence

Status: `B29_AUTHOR_GATE_PASS`

Internal base: `4c1502c27e1136d7ecec83c959d04162b6d6ddb6` (B28 corrected candidate, Linux/Windows CI PASS under temporary no-Codex workflow).
B28 production tree: `dfea505a5be004c3c802280d94d18f0be070ca93ce3259777dd3f0414e4b836e`.

Exact Seller Swagger authority: bytes `3933043`, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, paths `463`.

B29 adds six fixed read-only Seller operations:
1. `product_visibility_info` -> `POST /v1/product/visibility/info`
2. `product_quant_list` -> `POST /v1/product/quant/list`
3. `product_quant_info` -> `POST /v1/product/quant/info`
4. `product_placement_zone_info` -> `POST /v1/product/placement-zone/info`
5. `product_stairway_discount_by_quantity_get` -> `POST /v1/product/stairway-discount/by-quantity/get`
6. `product_fbs_warehouse_stocks` -> `POST /v1/product/info/warehouse/stocks`

All six are non-deprecated, `ALL_ACCOUNTS`, `READ`, `READ_SAFE`, `safe_projection`, `single_read`.

Exact Swagger bounds are preserved without invented limits: visibility SKU list 1..350; quant info code list 1..1000; placement-zone SKU list 1..150; stairway-discount SKU list only maximum 5000 (empty list is not prohibited by Swagger); warehouse stock `limit` 1..1000. Quant-list `limit:int64` has no Swagger minimum/maximum, so B29 does not invent one.

No automatic cursor pagination, retries, fanout, provider chaining, capability probe or secondary request is introduced. Every AI command yields at most one physical Seller request.

FBP archive/draft/order reads were explicitly NOT enabled in B29 because their response schema can include pickup `sender_name` and `sender_phone`; those require a separate privacy/authorization contract rather than `safe_projection`.

Seller business requests: `0`.
Performance business requests: `0`.
Credentials used: `0`.
