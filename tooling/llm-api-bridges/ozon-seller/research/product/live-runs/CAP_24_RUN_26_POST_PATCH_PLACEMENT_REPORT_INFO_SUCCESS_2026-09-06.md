# CAP-24 Run 26 — post-patch placement report info success

Date: 2026-09-06
Status: `PASS__POST_PATCH_FRESH_REPORT_READY__NEXT_REPORT_FILE_GET`

## Purpose

Second live CAP-24 step after installing/reloading the XLSX report repair build. Verify that the fresh August `seller_placement_by_products` report created in Run 25 reaches `success` and yields a fresh opaque `report_file_ref` for the live XLSX parser retest.

Frozen CAP-24 period:

`2026-08-01..2026-08-31`

Fresh Run 25 report code:

`REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`

## Bridge result

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner: `complete`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- capability probe: not needed / not performed

Request/result:

- request_id: `6b90fcba-bdc4-4260-8994-acedb5176f77`
- operation: `report_info`
- command fingerprint: `e19b6a55`
- provider: `ozon`
- host_alias: `seller_api`
- method: `POST`
- external_request_executed: `true`
- HTTP status: `200`
- elapsed_ms: `600`
- pagination: `null`
- rate_limit: `null`

Planning/entitlement:

- status: `SUPPORTED_AND_ENTITLED`
- capability_required: `false`
- entitlement_key: `POST /v1/report/info`
- reason: `all_accounts`
- rule_source: `reviewed-openapi-463-2026-08-19`
- exact_request_preserved: `true`
- logical fingerprint = physical fingerprint = `e19b6a55`
- command_transformed: `false`

## Fresh report state

- code: `REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`
- status: `success`
- error: empty
- report_type: `seller_placement_by_products`
- created_at: `2026-09-06T14:02:05.033302Z`
- expires_at: `2026-09-06T17:02:05.033302Z`
- provider file URL remains redacted in public result
- fresh opaque report_file_ref: `rpf_s_4f3147b9-c3d3-4722-8f32-7a8585276b3e`

## Interpretation

The fresh post-patch report workflow is ready for the decisive live XLSX materialization test. Run 26 itself does not exercise the XLSX parser; it proves only report readiness and opaque file-ref handoff.

Do not reuse the pre-patch Run 23 file ref. Do not create another report before this fresh ref is tested.

## Exact next dependent action

Call `report_file_get` exactly once using:

`rpf_s_4f3147b9-c3d3-4722-8f32-7a8585276b3e`

Live acceptance criterion:

- report file GET/materialization succeeds;
- the former `xl/xl/worksheets/...` failure is absent;
- returned XLSX columns/rows are available for explicit target-SKU lookup.

Current classification:

`POST_PATCH_REPORT_INFO_PASS__LIVE_XLSX_MATERIALIZATION_NEXT`
