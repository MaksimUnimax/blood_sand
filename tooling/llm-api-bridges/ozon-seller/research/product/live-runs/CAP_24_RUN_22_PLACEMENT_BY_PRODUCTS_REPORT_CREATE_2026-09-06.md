# CAP-24 Run 22 — August placement-by-products report creation

Date: 2026-09-06
Status: `PASS__REPORT_CREATED__NEXT_DEPENDENT_REPORT_INFO`

## Business purpose

CAP-24 requires an explicit placement/storage attribution attempt for target SKU `1636048691` over frozen month `2026-08-01..2026-08-31`.

Advertising attribution has already been resolved as a documented historical-membership coverage boundary. The next required evidence class is product-level placement/storage.

Target identity:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- frozen period: `2026-08-01..2026-08-31`

## Exact Bridge command

```json
{
  "operation": "report_placement_by_products_create",
  "params": {
    "date_from": "2026-08-01",
    "date_to": "2026-08-31"
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

- request_id: `d11bf6d9-33d2-46a6-89ae-a822b5192674`
- operation: `report_placement_by_products_create`
- fingerprint: `973a081a`
- provider: `ozon`
- host_alias: `seller_api`
- HTTP method: `POST`
- path_alias: `report_placement_by_products_create`
- HTTP status: `200`
- elapsed: `1468 ms`
- external_request_executed: `true`
- capability_probe_executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement key: `POST /v1/report/placement/by-products/create`
- entitlement reason: `all_accounts`
- rule source: `reviewed-openapi-463-2026-08-19`
- exact_request_preserved: `true`
- command_transformed: `false`
- pagination: `null`
- rate_limit: `null`

Invariant preserved:

`1 explicit business command => exactly 1 physical provider request`.

No hidden retry, polling, fanout, pagination, chaining or capability probe was observed.

## Provider result

Returned report code:

`REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`

This proves the August product-level placement report creation route is available and executable for the seller account.

It does **not** yet prove:

- that report generation is finished;
- that the report file is materializable through the Bridge;
- that target SKU `1636048691` occurs in the finished report;
- the exact placement/storage amount attributable to the target SKU.

## Workflow dependency

The workflow is now `DEPENDENT_STEPWISE` because the next operation requires the exact provider-returned report code.

The next command must be exactly one explicit `report_info` read using that code. No polling loop is allowed.

```text
OZON_API_V1
{
  "operation": "report_info",
  "params": {
    "code": "REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312"
  }
}
```

Decision rule after `report_info`:

1. If the report is ready and an opaque `file_ref` is returned, issue one explicit `report_file_get` using that exact ref.
2. If the report is still processing, do not hidden-poll; record the state and only perform another explicit status read as a later operator-visible command if needed.
3. If report generation failed, stop under `NO_SKIP_ON_FAILURE` and preserve the provider failure.
4. If a file can be read, isolate target product/SKU strictly from provider-backed report fields before including placement/storage in exact CAP-24 arithmetic.
5. If target attribution cannot be proven, classify placement as `PLACEMENT_ATTRIBUTION_NOT_AVAILABLE` rather than allocate account-level charges.

## Current checkpoint

`CAP_24_PLACEMENT_REPORT_CREATED__NEXT_REPORT_INFO`

Executable Bridge patch: none.
