# STD-10 REOPENED — Run11 placement-by-products report creation

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `PASS_REPORT_CREATE_REPORT_INFO_NEXT`
Rule: `NO_SKIP_ON_FAILURE`

## Purpose

Create the historical Ozon product-placement report spanning the full August 2026 window so STD-10 can attempt to recover the load-bearing pre-incident Samara stock baseline around the 2026-08-22 Chapayevsk incident.

Requested report window:

- `date_from = 2026-08-01`
- `date_to = 2026-08-31`

Operation:

`report_placement_by_products_create`

Provider endpoint:

`POST /v1/report/placement/by-products/create`

## Bridge execution evidence

Batch:

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner.status: `complete`
- coalesced_group_count: `0`
- coalesced_logical_count: `0`
- logical_business_result_count: `1`
- physical_business_request_count: `1`

Capability probe:

- performed: `false`
- status: `not_needed`
- subscription_type: `UNKNOWN`
- http_status: `0`

Result:

- request_id: `02abef62-83d6-4333-a2dd-813cf2f947fc`
- operation: `report_placement_by_products_create`
- command fingerprint: `973a081a`
- provider: `ozon`
- host_alias: `seller_api`
- http_method: `POST`
- path_alias: `report_placement_by_products_create`
- external_request_executed: `true`
- capability_probe_executed: `false`
- HTTP status: `200`
- elapsed_ms: `346`
- pagination: `null`
- rate_limit: `null`

Entitlement/planning:

- capability_required: `false`
- entitlement_key: `POST /v1/report/placement/by-products/create`
- entitlement status: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- rule_source: `reviewed-openapi-463-2026-08-19`
- exact_request_preserved: `true`
- partial: `false`
- logical command fingerprint: `973a081a`
- physical command fingerprint: `973a081a`
- command_transformed: `false`

Provider result:

`code = REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Classification

Provider/business read: **PASS**.

Operational reliability:

`PASS_FIRST_POST_REPAIR_LIVE_PLACEMENT_REPORT_CREATE`

The repaired browser runtime successfully executed the previously unavailable passive report-creation READ against the live Ozon Seller API. This is direct live evidence that the READ-classification repair is usable in the operator's real test environment, not only in mock/CI gates.

## What this result proves

It proves that:

1. the repaired Bridge accepts and dispatches `report_placement_by_products_create`;
2. exactly one physical Ozon business request was made;
3. Ozon returned HTTP 200;
4. Ozon accepted the report request and issued a concrete report code;
5. the command was preserved without transformation;
6. no Premium/capability probe was required for this request.

## What this result does NOT prove

The create acknowledgement does **not** reveal the report rows and therefore does not yet prove:

- whether seller inventory was physically/accountedly present at `САМАРА_РФЦ` immediately before the incident;
- the pre-incident quantity by SKU;
- whether any units were destroyed/lost;
- the size of any unexplained stock delta;
- whether a compensation/write-off should be attributed to the incident.

Do not treat the successful creation acknowledgement as a historical-stock answer.

## Exact next read

Use exactly one explicit `report_info` request with the returned code:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

If `report_info` reports the file ready and returns an opaque `report_file_ref`, the subsequent step will be one explicit `report_file_get`. If the report is still processing, do not skip or invent data; handle the returned state as the next evidence checkpoint.

Checkpoint:

`STD_10_REOPENED_RUN11_PLACEMENT_REPORT_CREATED_REPORT_INFO_NEXT`
