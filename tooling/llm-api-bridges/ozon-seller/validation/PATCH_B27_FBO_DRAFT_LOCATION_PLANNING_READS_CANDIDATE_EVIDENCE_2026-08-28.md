# B27 FBO Draft Location Planning Reads — candidate evidence

Status: `B27_AUTHOR_GATE_PASS`

Internal base: `9cf6670b5373fad36e459c61f8424b2198b86030` (B26 candidate, Linux/Windows CI PASS under temporary no-Codex workflow).
B26 production tree: `bad94d29fa3c34db76dbea3dc93b3aff94a4042739eb5d70312c93e35fff9852`.

Exact Seller Swagger: bytes `3933043`, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, paths `463`.

B27 adds two fixed read-only FBO draft planning operations:
1. `fbo_draft_cluster_list` -> `POST /v1/cluster/list`
2. `fbo_draft_warehouse_list` -> `POST /v1/warehouse/fbo/list`

Both are non-deprecated `FboSupplyRequest` operations, `ALL_ACCOUNTS`, `READ`, `READ_SAFE`, `safe_projection`, `single_read`.

Contract follows exact Swagger without invented bounds: `cluster_type` is required enum `CLUSTER_TYPE_OZON|CLUSTER_TYPE_CIS`; optional `cluster_ids` is an array of int64 strings with no invented min/max. Warehouse request requires `filter_by_supply_type` enum array and `search:string` with exact `minLength:4`; no invented array minimum is applied.

`POST /v2/draft/timeslot/info` is intentionally deferred: its exact snapshot exposes a suspicious date pattern with a leading space plus a dynamic 28-day description. B27 does not guess or silently repair that contract.

No retries, pagination, polling, fanout, capability probe, provider chaining or secondary request. Protected runtime bytes unchanged. Seller requests `0`; Performance requests `0`; credentials used `0`.
