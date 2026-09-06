# CAP-24 current checkpoint after Run 25 post-patch live report create

Date: 2026-09-06
Status: `AUTHORITATIVE_LATEST_CHECKPOINT__PATCHED_BUILD_VALIDATED__RUN_25_REPORT_CREATE_PASS__NEXT_REPORT_INFO`

This file is the latest CAP-24 continuation checkpoint and supersedes older `NEXT_REPORT_FILE_GET`, `WAITING_FOR_EXECUTABLE_PATCH_AUTHORIZATION`, and `NEXT_RELOAD_PATCHED_EXTENSION_AND_LIVE_PLACEMENT_RETEST` states.

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

## Pre-patch placement/storage failure

Run 22 created the August product-level placement report successfully.

Run 23 reported status `success` and returned an opaque report file ref.

Run 24 attempted `report_file_get` and exposed the Bridge XLSX parser defect:

`REPORT_XLSX_INVALID: XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`

Confirmed root cause:

- workbook relationship targets were unconditionally joined to base `xl`;
- provider targets already rooted under `xl/` became `xl/xl/...`.

Secondary defect:

- report-file GET occurred before XLSX parse;
- post-fetch parser errors lost truthful `external_request_executed` and HTTP status metadata.

## Executable repair and build

Owner explicitly authorized the executable patch.

Runtime patch commit:

`92773026e479671160aab42c0f7590da155e1184`

Runtime blob:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

Dedicated regression commit:

`cb353190c3e13a644601198c6a854b99356f20d6`

Installable artifact:

`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_XLSX_REPORT_REPAIR_92773026.zip`

Artifact SHA-256:

`10517e5afc608ff2f05f7039afad6f7dcc6c53dd25d9fe0e49230673058a0d1f`

Artifact publication commit:

`bd4dd96bd5649f00f8b48861855ee1a2957e1bd5`

GitHub Actions run:

`34037677653`

Validation completed before artifact publication:

- Ubuntu validation: PASS
- Windows validation: PASS
- JS syntax: PASS
- dedicated XLSX relationship regression: PASS
- existing report parser/lifecycle gates: PASS
- full current `run_*.mjs` family: PASS on both OS runners
- ZIP build: PASS
- ZIP member list and byte-for-byte coherence with current `dist-step7-candidate`: PASS
- fresh extraction + XLSX regression against extracted ZIP: PASS

## Run 25 — first live post-patch workflow step

Fresh command after installing/reloading the patched build:

`report_placement_by_products_create` for `2026-08-01..2026-08-31`.

Observed:

- request_id: `38920ed0-ad4f-4651-b419-0beed50f210a`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- external_request_executed: `true`
- capability probe: not performed / not needed
- HTTP status: `200`
- exact request preserved: `true`
- command transformed: `false`
- fresh report code:
  `REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`

Run 25 evidence:

`CAP_24_RUN_25_POST_PATCH_PLACEMENT_REPORT_CREATE_2026-09-06.md`

Interpretation:

- the patched live workflow can create the fresh placement report;
- this does not yet prove XLSX materialization;
- do not reuse the old pre-patch report code or file ref;
- do not infer placement cost from report creation alone.

## Exact next operational action

Perform exactly one dependent `report_info` command using:

`REPORT_seller_placement_by_products_2093109_1788703325_01a07706-bb67-750b-80c5-0f71645e6000`

If status is `success` and a fresh opaque `report_file_ref` is returned, perform one explicit `report_file_get` using that ref.

Live patch acceptance criterion:

- XLSX is materialized successfully;
- no `xl/xl/worksheets/...` path is produced;
- target SKU `1636048691` can be located from explicit report columns.

After successful materialization:

1. isolate target SKU `1636048691`;
2. calculate exact August placement/storage amount from report columns;
3. reconcile against finance before changing CAP-24 totals.

## NO_SKIP_ON_FAILURE state

Until live `report_file_get` succeeds:

- do not mark placement cost as zero;
- do not allocate account-level NON_ITEM placement charges;
- do not fold placement into exact CAP-24 arithmetic;
- do not close CAP-24 as fully resolved.

Current checkpoint:

`CAP_24_RUN_25_REPORT_CREATE_PASS__NEXT_REPORT_INFO__LIVE_XLSX_MATERIALIZATION_PENDING`
