# CAP-24 Run 29 — dual storage/placement report creation

Date: 2026-09-07
Status: `PASS__PRODUCT_AND_SUPPLY_PLACEMENT_REPORTS_CREATED`

Purpose: reopen CAP-24 storage/placement as a mandatory unit-economics cost class and create two independent August reports for structural and business reconciliation.

Frozen period: `2026-08-01..2026-08-31`.
Target SKU: `1636048691`.

## Batch execution

Bridge: `ozon-llm-api-bridge v0.1.19`
Delivery mode: `sequential_batch_single_delivery`
Result count: `2`
Query planner: `complete`
Logical business result count: `2`
Physical business request count: `2`
Capability probe: not needed / not performed

No hidden retry, polling, pagination, fanout or chaining occurred.

## Result 1 — product-level placement report

Operation: `report_placement_by_products_create`
Request ID: `4fa1b66e-b0ad-4d9e-9da6-d99adc811344`
Logical/physical fingerprint: `973a081a`
Provider: Seller API
HTTP method: POST
HTTP status: `200`
Elapsed: `1406 ms`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`

Report code:
`REPORT_seller_placement_by_products_2093109_1788751309_01a079e2-e9bd-7f23-91fe-4d6519b47290`

## Result 2 — supply-level placement report

Operation: `report_placement_by_supplies_create`
Request ID: `72a090d2-4d2b-473d-972a-0111dccc1166`
Logical/physical fingerprint: `3ded06d1`
Provider: Seller API
HTTP method: POST
HTTP status: `200`
Elapsed: `363 ms`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`

Report code:
`REPORT_seller_placement_by_supplies_2093109_1788751309_01a079e2-eb9f-75ad-9cc5-e873d377162a`

## Meaning

Both official August storage/placement report-generation paths are available on this account and accepted the same frozen period.

This does not yet prove any numeric storage cost. The next step is to read both report states. Because both report codes are already known and neither `report_info` request depends on the other, they should be issued together as two explicit commands in one batch.

If both reports are ready, each returned opaque file ref must then be materialized through `report_file_get` and the product-vs-supply XLSX structures compared.

Checkpoint:
`CAP_24_RUN_29_PASS__NEXT_DUAL_REPORT_INFO`
