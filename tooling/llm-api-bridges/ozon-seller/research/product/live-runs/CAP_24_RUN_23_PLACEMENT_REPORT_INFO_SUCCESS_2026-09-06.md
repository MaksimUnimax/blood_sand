# CAP-24 Run 23 — Placement report info success

Date: 2026-09-06
Status: `PASS__REPORT_READY__OPAQUE_FILE_REF_RECEIVED__NEXT_REPORT_FILE_GET`

## Purpose

Continue the dependent CAP-24 placement/storage attribution workflow for target SKU `1636048691` over frozen month `2026-08-01..2026-08-31` after Run 22 successfully created the product-level placement report.

Target identity:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`

Run 22 report code:

`REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`

## Exact Bridge command executed

```text
OZON_API_V1
{
  "operation": "report_info",
  "params": {
    "code": "REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312"
  }
}
```

## Observed Bridge execution

Batch envelope:

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner.status: `complete`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- coalesced_group_count: `0`
- coalesced_logical_count: `0`
- capability probe: not needed

Provider result:

- request_id: `868643e4-0468-4b67-86ad-b566e79a029b`
- operation: `report_info`
- fingerprint: `75652571`
- provider: `ozon`
- host_alias: `seller_api`
- HTTP method: `POST`
- path_alias: `report_info`
- HTTP status: `200`
- elapsed: `1437 ms`
- external_request_executed: `true`
- capability_probe_executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement key: `POST /v1/report/info`
- entitlement reason: `all_accounts`
- rule source: `reviewed-openapi-463-2026-08-19`
- exact_request_preserved: `true`
- command_transformed: `false`
- pagination: `null`
- rate_limit: `null`

Invariant preserved:

`1 explicit business command => exactly 1 physical provider request`.

No hidden retry, polling, fanout, pagination, chaining or capability probe was observed.

## Provider report state

The provider returned:

- code: `REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`
- status: `success`
- error: empty
- file field: redacted in Bridge result
- report_type: `seller_placement_by_products`
- created_at: `2026-09-06T12:21:26.522220Z`
- expires_at: `2026-09-06T15:21:26.522220Z`
- additional_data: empty

Bridge also returned the opaque report file reference:

`rpf_s_4103b32b-f042-44d9-a542-7eab43c94848`

This proves:

1. report generation completed successfully;
2. the report type is the expected product-level placement report;
3. the Bridge preserved an opaque provider-backed file reference suitable for the guarded file-read path.

It does **not** yet prove:

- that `report_file_get` can materialize the report bytes/content;
- that target SKU `1636048691` exists in the report;
- the exact August placement/storage cost attributable to the target SKU.

## Workflow dependency

The workflow remains `DEPENDENT_STEPWISE` because the next operation requires the exact opaque `report_file_ref` returned by this result.

Do not recreate the report and do not repeat `report_info` before attempting the file read.

## Exact next command

```text
OZON_API_V1
{
  "operation": "report_file_get",
  "params": {
    "file_ref": "rpf_s_4103b32b-f042-44d9-a542-7eab43c94848"
  }
}
```

Decision rule after `report_file_get`:

1. If file content is returned, inspect the provider-backed columns and isolate target SKU/product strictly by explicit identity fields.
2. If a target row is found, preserve the exact signed placement/storage amounts and reconcile them against finance coverage without double counting.
3. If the file is readable but target product cannot be defensibly isolated, record `PLACEMENT_ATTRIBUTION_NOT_AVAILABLE`.
4. If the file-read operation fails, stop under `NO_SKIP_ON_FAILURE`, preserve the exact Bridge/provider failure, and classify the materialization boundary rather than guessing.
5. Do not allocate account-level or unidentified placement charges heuristically.

## Current checkpoint

`CAP_24_PLACEMENT_REPORT_READY__NEXT_REPORT_FILE_GET`

Executable Bridge patch: none.
