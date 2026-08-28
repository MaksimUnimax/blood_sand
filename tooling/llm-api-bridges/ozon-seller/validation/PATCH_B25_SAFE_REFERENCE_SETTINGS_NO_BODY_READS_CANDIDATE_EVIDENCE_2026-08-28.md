# B25 Safe Reference & Settings No-Body Reads — candidate evidence

Status: `B25_AUTHOR_GATE_PASS`

Internal base: `972e0aeb039ae29660985296f410045dade5231c` (B24 candidate, Linux/Windows CI PASS under the temporary no-Codex workflow).
B24 production tree: `000b53f323f50e00833869df4d0b0358339bf138f6526ad8ceb3cc6d1da02354`.

Exact Seller Swagger authority used author-side:
- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

B25 adds six fixed true-no-body Seller reads:
1. `posting_fbo_cancel_reason_list` -> `POST /v1/posting/fbo/cancel-reason/list`
2. `returns_utilization_history` -> `POST /v1/returns/settings/utilization/history`
3. `returns_utilization_info` -> `POST /v1/returns/settings/utilization/info`
4. `product_certification_options` -> `POST /v2/product/certification/options`
5. `warehouse_fbs_pickup_planning_list` -> `POST /v1/warehouse/fbs/pickup/planning/list`
6. `fbp_warehouse_list` -> `POST /v1/fbp/warehouse/list`

All six are non-deprecated in the exact Swagger, have no effective request body, compile as `ALL_ACCOUNTS`, and are exposed as `READ` / `READ_SAFE` / `safe_projection` / `single_read`. Each command builds exactly one fixed Seller POST with no body.

`POST /v1/notification/list` is intentionally NOT enabled in B25. It returns configured callback URLs, which can carry secret-bearing path/query material; that endpoint requires a separate explicit redaction policy before AI exposure.

No retries, pagination, fanout, capability probe, provider chaining or secondary request is introduced. Protected Autorun, Work lifecycle, Manual mode, service worker, credentials, provider transport and guidance bytes remain unchanged.

Author-side exact regression passed registry, true-no-body request construction, contracts, entitlements, guidance zero-request accounting, B24-and-earlier carry-forward, protected runtime identities, exact Swagger currentness/entitlements, notification-list exclusion, and all 18 production JavaScript syntax checks.

Seller business requests during author tests: `0`.
Performance business requests during author tests: `0`.
Credentials used during author tests: `0`.
