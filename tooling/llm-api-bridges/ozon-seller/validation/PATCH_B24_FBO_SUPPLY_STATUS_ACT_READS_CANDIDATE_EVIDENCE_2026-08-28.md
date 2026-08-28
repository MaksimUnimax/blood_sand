# B24 FBO Supply Status & Act Reads — candidate evidence

Status: `B24_AUTHOR_GATE_PASS`

B24 adds eight fixed read-only Seller operations to the existing FBO supply workflow:

1. `supply_order_act_accept_status` -> `POST /v1/supply-order/act/accept/status`
2. `supply_order_act_product_get` -> `POST /v1/supply-order/act/product/get`
3. `supply_order_act_summary_get` -> `POST /v1/supply-order/act/summary/get`
4. `supply_order_cancel_status` -> `POST /v1/supply-order/cancel/status`
5. `supply_order_content_update_status` -> `POST /v1/supply-order/content/update/status`
6. `supply_order_content_update_validation` -> `POST /v1/supply-order/content/update/validation`
7. `supply_order_pass_status` -> `POST /v1/supply-order/pass/status`
8. `supply_order_timeslot_status` -> `POST /v1/supply-order/timeslot/status`

All eight are exact-Swagger, non-deprecated, ALL_ACCOUNTS, `READ`, `READ_SAFE`, `safe_projection`, `single_read`.

No mutation endpoint is enabled. In particular B24 keeps disabled:
- `/v1/supply-order/act/accept`
- `/v1/supply-order/cancel`
- `/v1/supply-order/content/update`
- `/v1/supply-order/pass/create`
- `/v1/supply-order/timeslot/update`

The old `/v1/supply-order/timeslot/get` is also intentionally NOT enabled: exact Swagger says it would be disabled on 19 August 2026 and directs callers to already-supported `/v2/supply-order/timeslot/list`.

Every status lookup requires an explicit caller-supplied `operation_id`; B24 never polls automatically. Every command produces at most one physical Seller request. No retries, pagination, fanout, provider chaining, capability probe, or secondary request is introduced.

Author-side exact regression passed registry, request construction, exact schemas, entitlements, guidance zero-request accounting, B23-and-earlier carry-forward, protected runtime identities, exact Swagger currentness, explicit deprecated-route exclusion, and all 18 production JavaScript syntax checks.

Seller business requests during author tests: `0`.
Performance business requests during author tests: `0`.
Credentials used during author tests: `0`.
