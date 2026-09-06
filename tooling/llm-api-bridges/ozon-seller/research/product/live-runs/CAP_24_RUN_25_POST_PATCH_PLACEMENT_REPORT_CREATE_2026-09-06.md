# CAP-24 Run 25 — post-patch placement-by-products report create

Date: 2026-09-06
Status: `PASS__POST_PATCH_FRESH_REPORT_CREATED__NEXT_REPORT_INFO`

## Purpose

First live CAP-24 request after installing/reloading the XLSX report repair build `OZON_BRIDGE_v0.1.19_XLSX_REPORT_REPAIR_92773026.zip`.

This run intentionally creates a fresh August placement-by-products report. It does not reuse the pre-patch Run 22 report code or Run 23 file ref.

Frozen CAP-24 period:

`2026-08-01..2026-08-31`

## Explicit command

```json
{
  "operation": "report_placement_by_products_create",
  "params": {
    "date_from": "2026-08-01",
    "date_to": "2026-08-31"
  }
}
```

## Bridge result

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner status: `complete`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- capability probe: not needed / not performed

Result request:

- request_id: `38920ed0-ad4f-4651-b419-0beed50f210a`
- operation: `report_placement_by_products_create`
- command fingerprint: `973a081a`
- provider: `ozon`
- host_alias: `seller_api`
- method: `POST`
- path_alias: `report_placement_by_products_create`
- external_request_executed: `true`
- capability_probe_executed: `false`
- HTTP status: `200`
- elapsed_ms: `434`
- pagination: `null`
- rate_limit: `null`

Planning/entitlement:

- status: `SUPPORTED_AND_ENTITLED`
- capability_required: `false`
- entitlement_key: `POST /v1/report/placement/by-products/create`
- reason: `all_accounts`
- rule_source: `reviewed-openapi-463-2026-08-19`
- exact_request_preserved: `true`
- logical fingerprint = physical fingerprint = `973a081a`
- command_transformed: `false`

## Fresh report code

`REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`

## Interpretation

The first live post-patch workflow step passed. A fresh product-level placement report was accepted by Ozon with exactly one physical provider request for one explicit business command.

This run does **not** test XLSX parsing yet. The XLSX root-cause fix is only live-proven when this fresh report reaches `success`, yields a new opaque file ref, and `report_file_get` successfully materializes the XLSX without the former `xl/xl/worksheets/...` path failure.

No placement amount is inferred from report creation alone.

## Exact next dependent action

Call `report_info` exactly once with the fresh report code above. Do not create another report and do not reuse the pre-patch report/file ref.

Current classification:

`POST_PATCH_REPORT_CREATE_PASS__LIVE_XLSX_MATERIALIZATION_PENDING`
