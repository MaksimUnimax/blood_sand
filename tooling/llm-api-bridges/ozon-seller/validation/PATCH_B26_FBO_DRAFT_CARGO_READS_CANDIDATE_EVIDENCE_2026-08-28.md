# B26 FBO Draft & Cargo Reads — candidate evidence

Status: `B26_AUTHOR_GATE_PASS`

Internal base: `4d8121a686b466bccfa998ebd5217091ae9345cf` (B25 candidate, Linux/Windows CI PASS under the temporary no-Codex workflow).
B25 production tree: `4d2653ed339b37f317e3d4e3be33a1485f8cdf5f6375ace839c3df21e5bde387`.

Exact Seller Swagger authority used author-side:
- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

B26 adds six fixed read-only FBO draft/cargo operations:
1. `fbo_draft_create_info` -> `POST /v2/draft/create/info`
2. `fbo_draft_supply_create_status` -> `POST /v2/draft/supply/create/status`
3. `fbo_cargoes_create_info` -> `POST /v2/cargoes/create/info`
4. `fbo_cargoes_get` -> `POST /v1/cargoes/get`
5. `fbo_cargoes_delete_status` -> `POST /v1/cargoes/delete/status`
6. `fbo_cargoes_rules_get` -> `POST /v1/cargoes/rules/get`

All six are exact-Swagger, non-deprecated, `ALL_ACCOUNTS`, `READ`, `READ_SAFE`, `safe_projection`, `single_read`.

Exact request rules:
- `draft_id` is an integer/int64 represented as a safe JavaScript number; no invented minimum/maximum.
- `operation_id` is a required string; exact Swagger declares no minLength, so B26 does not invent one.
- `supply_ids` are int64 strings; maximum 100 is enforced where declared by schema/description; no invented minimum array length.

B26 never polls operation status automatically. Every command produces exactly one physical Seller request. Mutations `/v2/draft/supply/create`, `/v2/cargoes/create`, and `/v1/cargoes/delete` remain disabled.

No retries, hidden pagination, fanout, capability probe, provider chaining or secondary request is introduced. Protected Autorun, Work lifecycle, Manual mode, service worker, credentials, provider transport and guidance bytes remain unchanged.

Author-side exact regression passed registry, exact requests, contracts, entitlements, guidance zero-request accounting, B25-and-earlier carry-forward, protected runtime identities, exact Swagger currentness/entitlements, mutation exclusion, and all 18 production JavaScript syntax checks.

Seller business requests during author tests: `0`.
Performance business requests during author tests: `0`.
Credentials used during author tests: `0`.
