# CAP-24 current checkpoint after Run 26 post-patch report info

Date: 2026-09-06
Status: `AUTHORITATIVE_LATEST_CHECKPOINT__PATCHED_BUILD_VALIDATED__RUN_26_REPORT_INFO_PASS__NEXT_REPORT_FILE_GET`

This file is the latest CAP-24 continuation checkpoint and supersedes older pre-patch, reload, report-create and report-info pending states.

## Completed business evidence

Target:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- frozen month: `2026-08-01..2026-08-31`
- Seller Analytics revenue: `259136.00 RUB`
- Seller Analytics semantic: `ordered_units = 155`

Exact directly attributable August finance ledger:

- commission: `97497.72 RUB`
- ordinary delivery/logistics: `12097.52 RUB`
- acquiring: `1957.05 RUB`
- commission-null direct POSTING services: `1681.71 RUB`
- other direct ITEM fees: `30.00 RUB`
- total exact direct finance cost: `113264.00 RUB`

Finance-only contribution preview:

- `145872.00 RUB` total
- `941.11 RUB` per ordered unit

Advertising:

- historical campaign spend for four strongly target-linked campaigns: `35785.11 RUB`
- current campaign-product reads: each campaign returns only target SKU `1636048691`
- historical campaign CSV reconciles the same `35785.11 RUB`
- historical SKU membership interval is not exposed by current Performance surfaces
- strict classification remains advertising attribution coverage boundary; do not silently fold `35785.11 RUB` into unconditional exact SKU costs.

## Pre-patch XLSX failure and repair

Run 24 exposed:

`REPORT_XLSX_INVALID: XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`

Root cause: workbook relationship targets already rooted under `xl/` were unconditionally joined to base `xl`.

Secondary defect: post-fetch parser failures lost truthful `external_request_executed` and HTTP status metadata.

Executable repair:

- runtime patch commit: `92773026e479671160aab42c0f7590da155e1184`
- runtime blob: `5255fa0bfe76e0b5add2bafb942acabf092bac68`
- regression commit: `cb353190c3e13a644601198c6a854b99356f20d6`
- installable artifact: `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_XLSX_REPORT_REPAIR_92773026.zip`
- artifact SHA-256: `10517e5afc608ff2f05f7039afad6f7dcc6c53dd25d9fe0e49230673058a0d1f`
- artifact publication commit: `bd4dd96bd5649f00f8b48861855ee1a2957e1bd5`
- GitHub Actions run: `34037677653`

Validation before publication:

- Ubuntu: PASS
- Windows: PASS
- JS syntax: PASS
- dedicated XLSX relationship regression: PASS
- existing report parser/lifecycle gates: PASS
- full current `run_*.mjs` family: PASS on both OS runners
- ZIP build/coherence/fresh-extraction XLSX regression: PASS

## Run 25 — fresh post-patch report create

- operation: `report_placement_by_products_create`
- period: `2026-08-01..2026-08-31`
- request_id: `38920ed0-ad4f-4651-b419-0beed50f210a`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- external_request_executed: `true`
- HTTP `200`
- exact request preserved: `true`
- command transformed: `false`
- report code: `REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`

Evidence: `CAP_24_RUN_25_POST_PATCH_PLACEMENT_REPORT_CREATE_2026-09-06.md`.

## Run 26 — fresh post-patch report info

- operation: `report_info`
- request_id: `6b90fcba-bdc4-4260-8994-acedb5176f77`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- external_request_executed: `true`
- HTTP `200`
- exact request preserved: `true`
- command transformed: `false`
- report status: `success`
- report_type: `seller_placement_by_products`
- created_at: `2026-09-06T14:02:05.033302Z`
- expires_at: `2026-09-06T17:02:05.033302Z`
- fresh opaque ref: `rpf_s_4f3147b9-c3d3-4722-8f32-7a8585276b3e`

Evidence: `CAP_24_RUN_26_POST_PATCH_PLACEMENT_REPORT_INFO_SUCCESS_2026-09-06.md`.

Interpretation:

- fresh post-patch report workflow is ready;
- report creation and report-info handoff are live PASS;
- XLSX parser fix itself is not live accepted until `report_file_get` materializes this fresh report successfully.

## Exact next operational action

Perform exactly one dependent `report_file_get` using:

`rpf_s_4f3147b9-c3d3-4722-8f32-7a8585276b3e`

Do not create another report and do not reuse old pre-patch refs.

Live patch acceptance criterion:

- external file GET/materialization succeeds;
- no former `xl/xl/worksheets/...` path error;
- XLSX columns/rows are returned;
- target SKU `1636048691` can be located from explicit report columns.

After successful materialization:

1. inspect report schema and all available sheets;
2. isolate target SKU `1636048691`;
3. calculate exact August placement/storage amount from explicit report columns;
4. reconcile against finance before changing CAP-24 totals.

## NO_SKIP_ON_FAILURE state

Until live `report_file_get` succeeds:

- do not mark placement cost as zero;
- do not allocate account-level NON_ITEM placement charges;
- do not fold placement into exact CAP-24 arithmetic;
- do not close CAP-24 as fully resolved.

Current checkpoint:

`CAP_24_RUN_26_REPORT_INFO_PASS__NEXT_REPORT_FILE_GET__DECISIVE_LIVE_XLSX_PATCH_TEST`
