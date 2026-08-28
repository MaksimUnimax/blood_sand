# B28 FBO Transport Cargo Read & Status — candidate evidence

Status: `B28_AUTHOR_GATE_PASS`

Internal base: `5f710e4bda429b01d96d67f8fc5b8cb48c23d95c` (B27 candidate, Linux/Windows CI PASS under temporary no-Codex workflow).
B27 production tree: `b185ef32e587856610dbd6f811fea93dcef324b6839f14dee3a2385d1e50005a`.

Exact Seller Swagger: bytes `3933043`, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI `3.0.0`, paths `463`.

B28 adds five fixed read-only FBO transport/cargo operations:
1. `fbo_cargoes_v2_get` -> `POST /v2/cargoes/get`
2. `fbo_cargoes_v2_delete_status` -> `POST /v2/cargoes/delete/status`
3. `fbo_cargoes_transport_activate_status` -> `POST /v1/cargoes/transport/activate/status`
4. `fbo_cargoes_transport_bind_status` -> `POST /v1/cargoes/transport/bind/status`
5. `fbo_cargoes_supplies_get` -> `POST /v1/cargoes/supplies/get`

All five are non-deprecated `FBOTransport` operations, `ALL_ACCOUNTS`, `READ`, `READ_SAFE`, `safe_projection`, `single_read`.

Exact request limits are preserved: `/v2/cargoes/get` requires `supplies` with maximum 100; every supply item requires `cargo_ids` (int64 strings) and `supply_id` (int64 safe JS number). `/v1/cargoes/supplies/get` requires `supply_ids` with maximum 50. Status routes require explicit `operation_id` where Swagger marks it required; no minLength is invented.

`POST /v1/cargoes/transport/create/status` is intentionally deferred because its exact snapshot does not mark `operation_id` as required. B28 does not silently strengthen that schema.

Mutations (`/v2/cargoes/delete`, `/v1/cargoes/transport/activate`, `/v1/cargoes/transport/bind`, `/v1/cargoes/transport/create`) remain disabled. No polling, retries, pagination, fanout, capability probe, provider chaining or secondary request is introduced.

Author-side exact regression passed registry, exact request construction, contracts, entitlements, guidance zero-request accounting, B27-and-earlier carry-forward, protected runtime identities, exact Swagger currentness/entitlements, deferred ambiguous-route exclusion, and all 18 production JavaScript syntax checks.

Seller business requests: `0`.
Performance business requests: `0`.
Credentials used: `0`.
