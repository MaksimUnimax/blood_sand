# CAP-24 Run 27 — post-patch placement XLSX materialization success with empty parsed sheet

Date: 2026-09-06
Status: `PASS__XLSX_ROOT_CAUSE_LIVE_FIXED__BUSINESS_CONTENT_EMPTY_OR_UNPARSED_DIAGNOSTIC_REQUIRED`

## Purpose

Decisive live retest of the XLSX relationship-target root-cause repair using the fresh post-patch report chain from Runs 25–26.

Fresh report code:

`REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`

Fresh opaque file ref:

`rpf_s_4f3147b9-c3d3-4722-8f32-7a8585276b3e`

## Bridge result

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner status: `complete`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- capability probe: not needed / not performed

Request/result:

- request_id: `aa240a26-6370-43cb-9079-350f6f5fa55b`
- operation: `report_file_get`
- logical command fingerprint: `6a7a0deb`
- physical command fingerprint: `cd385e7d`
- command_transformed: `true`
- exact_request_preserved: `false`
- provider: `ozon`
- host_alias: `report_file`
- method: `GET`
- external_request_executed: `true`
- HTTP status: `200`
- elapsed_ms: `1113`
- pagination: `null`
- rate_limit: `null`

The logical/physical fingerprint difference is retained as observed evidence and is not silently classified here. It must be evaluated against the report-file command normalization/defaulting contract before being treated as a defect.

## Materialized document

- content_type: `application/octet-stream`
- byte_length: `142845`
- parsed format: `xlsx`
- available_sheets: `["Страница #1"]`

Parsed first sheet:

- name: `Страница #1`
- columns: `[]`
- row_count: `0`
- offset: `0`
- limit: `200`
- rows: `[]`
- row_numbers: `[]`
- has_more: `false`
- next_offset: `null`

## Live patch verdict

The original Run-24 defect is live-fixed.

Pre-patch failure:

`REPORT_XLSX_INVALID: XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`

Post-patch Run 27:

- external report-file GET executed;
- HTTP 200;
- XLSX recognized;
- workbook opened;
- sheet relationship resolved;
- sheet name discovered;
- no `xl/xl/worksheets/...` failure.

Therefore:

`XLSX_WORKBOOK_RELATIONSHIP_TARGET_DOUBLE_XL_PREFIX = LIVE_FIXED`

The telemetry defect is also live-fixed on the success path: the result truthfully reports one physical request and `external_request_executed=true` with HTTP 200.

## Remaining business-content boundary

The successful XLSX parse returned an empty logical table (`columns=[]`, `row_count=0`). This must **not** yet be converted to `placement_cost = 0`.

Two materially different explanations remain possible:

1. the Ozon placement-by-products report genuinely contains no business rows for the requested August period; or
2. the workbook contains populated content in an OOXML representation not extracted by the current cell parser.

Until that distinction is proven, CAP-24 placement remains unresolved.

Do not:

- infer zero placement cost from this parser output alone;
- allocate account-level NON_ITEM placement charges to the SKU;
- repeat the same `report_file_get` without a new diagnostic purpose;
- reopen the already-fixed `xl/xl` relationship defect.

## Next diagnostic objective

Verify the authoritative semantics/output structure of `seller_placement_by_products` and determine whether an empty parsed sheet is a legitimate no-data result or a second parser coverage gap.

Current classification:

`XLSX_ROOT_CAUSE_LIVE_ACCEPTANCE_PASS__PLACEMENT_CONTENT_SEMANTICS_OR_CELL_PARSER_COVERAGE_DIAGNOSTIC_NEXT`
