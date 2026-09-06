# CAP-24 current checkpoint after Run 24

Date: 2026-09-06
Status: `AUTHORITATIVE_LATEST_CHECKPOINT__PLACEMENT_BLOCKED_BY_CONFIRMED_XLSX_PARSER_DEFECT`

This file is the latest CAP-24 continuation checkpoint and supersedes the older `NEXT_REPORT_FILE_GET` state in `CAP_24_SETUP_2026-09-06.md` until that long setup file is reconciled.

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
- strict classification: advertising attribution coverage boundary; do not silently fold `35785.11 RUB` into unconditional exact SKU costs

## Placement/storage state

Run 22:

- `report_placement_by_products_create` for `2026-08-01..2026-08-31`
- HTTP 200
- report creation PASS
- report code: `REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`

Run 23:

- `report_info`
- HTTP 200
- report status: `success`
- report type: `seller_placement_by_products`
- opaque file ref: `rpf_s_4103b32b-f042-44d9-a542-7eab43c94848`

Run 24:

- `report_file_get`
- failed in Bridge XLSX parser with:
  `REPORT_XLSX_INVALID: XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`
- automatic retry: false

Root cause is confirmed in current source `dist-step7-candidate/shared/provider_transport_core.js`:

- workbook relationship targets are unconditionally passed through `reportJoinZipPath("xl", target)`;
- when target already starts under `xl/`, Bridge constructs `xl/xl/...`;
- worksheet lookup therefore fails.

Secondary confirmed observability issue:

- report-file URL GET occurs before XLSX parse;
- parser failure loses post-fetch metadata and result reports `external_request_executed=false`, `http_status=0`.

Authority:

- Run 24 evidence: `CAP_24_RUN_24_REPORT_FILE_GET_XLSX_PARSER_BLOCKER_2026-09-06.md`
- defect diagnosis: `../OZON_REPORT_XLSX_RELATIONSHIP_TARGET_NORMALIZATION_DEFECT_2026-09-06.md`

## NO_SKIP_ON_FAILURE state

Do not:

- repeat the unchanged `report_file_get`;
- recreate the placement report as a workaround;
- bypass opaque report-file provenance;
- infer SKU placement/storage from account-level NON_ITEM fees;
- advance as if placement attribution passed.

## Authorization boundary

Executable Bridge changes require explicit owner authorization.

No executable patch has been made.

If owner authorizes repair, next engineering task is:

1. repair XLSX workbook relationship target resolution generically;
2. repair post-fetch parser-error observability (`external_request_executed=true`, preserve HTTP status);
3. add regression tests for relative/rooted worksheet relationships and telemetry;
4. read back patched source/tests from Git;
5. reload/test the patched extension as required by the existing Bridge validation protocol;
6. recreate/retrieve a fresh placement report if the prior report/ref has expired;
7. resume CAP-24 at product-level placement file materialization.

If owner does not authorize executable repair, CAP-24 can only close with placement marked as a Bridge materialization coverage defect, not as exact zero cost.

Current checkpoint:

`CAP_24_BLOCKED__PLACEMENT_XLSX_PARSER_ROOT_CAUSE_CONFIRMED__WAITING_FOR_EXECUTABLE_PATCH_AUTHORIZATION_OR_EXPLICIT_BOUNDARY_CLOSE`
