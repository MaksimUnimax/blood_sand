# NEW-01 Run2 — report_info ready with opaque file ref

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Gate: repaired 26 Seller READ live gate
Status: `PASS_REPORT_INFO_READY_REPORT_FILE_GET_NEXT`
Rule: `NO_SKIP_ON_FAILURE`

## Workflow under test

NEW-01:
`report_products_create -> report_info -> report_file_get -> structured rows`

Run1 created independent test report code:

`REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`

This code is unrelated to and isolated from the frozen STD-10 forensic report code.

## Bridge execution evidence

Batch:

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner.status: `complete`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- capability probe: not performed / `not_needed`.

Result:

- request_id: `067c8a20-6d5f-46bf-a156-b33f3f9952fd`
- operation: `report_info`
- fingerprint: `ed53518d`
- provider: `ozon`
- host_alias: `seller_api`
- HTTP method: `POST`
- path_alias: `report_info`
- external_request_executed: `true`
- HTTP status: `200`
- elapsed_ms: `1349`
- pagination: `null`
- rate_limit: `null`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- exact_request_preserved: `true`
- command_transformed: `false`.

Provider result:

- code: `REPORT_seller_products_2093109_1788403235_01a06523-ba89-7bab-b5a2-7512338e658e`
- status: `success`
- error: empty
- file: `[REDACTED]`
- report_type: `seller_products`
- created_at: `2026-09-03T02:40:35.467646Z`
- expires_at: `2026-09-04T13:40:35.467646Z`
- opaque report file ref: `rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8`.

## Classification

Provider/business read: **PASS**.

Operational reliability:
`PASS_LIVE_REPORT_INFO_READY_WITH_OPAQUE_FILE_REF`

The report completed successfully and the repaired provider layer redacted the signed provider file URL from GPT-visible output while surfacing an opaque bridge file reference.

## Security / delivery proof

This live result proves:

1. real `report_info` succeeds for a repaired report workflow;
2. provider signed file location is not exposed (`file=[REDACTED]`);
3. Bridge returns a separate opaque `report_file_ref`;
4. async report status is `success`, so no polling is required for this report;
5. exactly one physical provider request was made.

## What remains before NEW-01 standalone PASS

NEW-01 is not fully closed yet. The opaque ref must be read explicitly via `report_file_get`, and the returned file must be converted to GPT-usable structured rows without raw base64 or signed URL leakage.

Exact next standalone step:

`report_file_get(file_ref=rpf_bd4312a0-5525-4c5c-9332-be8fc2b912b8)`

## Batch acceptance note

Per operator instruction, all 26 repaired commands now require a second acceptance dimension in addition to standalone behavior: each must participate in a real multi-command batch with at least two independent logical commands. NEW-01 will therefore require both:

- standalone full report workflow PASS; and
- later batch-mode participation PASS.

Checkpoint:
`NEW_01_RUN2_REPORT_INFO_SUCCESS_OPAQUE_REF_REPORT_FILE_GET_NEXT_BATCH_ACCEPTANCE_ALSO_REQUIRED`
