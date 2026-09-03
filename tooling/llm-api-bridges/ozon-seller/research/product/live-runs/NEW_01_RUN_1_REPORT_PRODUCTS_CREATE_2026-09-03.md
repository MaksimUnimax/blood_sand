# NEW-01 — Run1 report_products_create

Date: 2026-09-03
Gate: `OZON_AI_WORKER_REPAIRED_26_READS_LIVE_GATE_2026-09-03.md`
Status: `PASS_CREATE_REPORT_INFO_NEXT`
Rule: `NO_SKIP_ON_FAILURE`

## Purpose

Live-test the repaired Seller READ workflow `report_products_create` against the real Ozon provider and, if creation succeeds, continue the same NEW-01 workflow explicitly through `report_info` and `report_file_get` before NEW-01 can be marked PASS.

## Bridge execution

Batch metadata:

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
- error_code: `null`

Result metadata:

- request_id: `d1834261-fbc4-498a-ba2e-6873a6ead564`
- operation: `report_products_create`
- command fingerprint: `e289e300`
- provider: `ozon`
- host_alias: `seller_api`
- HTTP method: `POST`
- path_alias: `report_products_create`
- external_request_executed: `true`
- capability_probe_executed: `false`
- HTTP status: `200`
- elapsed_ms: `1405`
- pagination: `null`
- rate_limit: `null`

Planning / entitlement:

- capability_required: `false`
- entitlement_key: `POST /v1/report/products/create`
- exact_request_preserved: `true`
- partial: `false`
- entitlement reason: `all_accounts`
- rule_source: `reviewed-openapi-463-2026-08-19`
- entitlement status: `SUPPORTED_AND_ENTITLED`
- logical fingerprint: `e289e300`
- physical fingerprint: `e289e300`
- command_transformed: `false`

Provider result:

`REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`

## Classification

Create step: **PASS**.

Operational reliability:

`PASS_FIRST_LIVE_REPORT_PRODUCTS_CREATE`

This proves the repaired `report_products_create` alias reaches the real Ozon Seller API, uses exactly one physical provider request, is entitled for the current account, preserves the explicit command, and returns a concrete report code.

## What is not yet proven

NEW-01 is **not yet PASS as a full workflow** because the report contents have not been retrieved.

The create acknowledgement does not prove:

- report status/completion;
- presence of a downloadable file;
- opaque report-file URL redaction on the live provider response;
- successful `report_file_get` on a real Ozon-generated report;
- successful structured parsing of the real report rows.

## Exact next step

Call exactly one `report_info` request for:

`REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`

If the provider reports processing, persist that state and do not advance to NEW-02. If a `report_file_ref` is returned, the next explicit step will be `report_file_get`.

Checkpoint:
`REPAIRED_26_READS_NEW_01_CREATE_PASS_REPORT_INFO_NEXT`
