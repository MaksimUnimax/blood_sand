# CAP-24 current checkpoint after Run 24 and XLSX parser repair

Date: 2026-09-06
Status: `AUTHORITATIVE_LATEST_CHECKPOINT__XLSX_ROOT_CAUSE_PATCHED__TARGETED_REGRESSION_PASS__LIVE_EXTENSION_RELOAD_RETEST_REQUIRED`

This file is the latest CAP-24 continuation checkpoint and supersedes older `NEXT_REPORT_FILE_GET` / `WAITING_FOR_EXECUTABLE_PATCH_AUTHORIZATION` states.

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

## Placement/storage evidence before repair

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
- Bridge XLSX parser failure:
  `REPORT_XLSX_INVALID: XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`
- automatic retry: false

Confirmed root cause:

- workbook relationship targets were unconditionally joined to base `xl`;
- a provider target already rooted under `xl/` therefore became `xl/xl/...`.

Secondary confirmed defect:

- report-file GET occurs before XLSX parse;
- post-fetch parser errors previously lost `external_request_executed` and HTTP status metadata.

## Executable repair now implemented

Owner explicitly authorized patching.

Runtime patch commit:

`92773026e479671160aab42c0f7590da155e1184`

Patched runtime blob:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

Regression-test commit:

`cb353190c3e13a644601198c6a854b99356f20d6`

Dependency-closure report commit:

`4ba47cb6d516d16d9dea437ef13f95510380908a`

Defect authority update commit:

`2cc499ca679391fa4a780cf23f28e9471b501abc`

Patch authority:

`../OZON_REPORT_XLSX_RELATIONSHIP_TARGET_NORMALIZATION_DEFECT_2026-09-06.md`

Detailed dependency closure:

`../OZON_REPORT_XLSX_RELATIONSHIP_TARGET_PATCH_AND_DEPENDENCY_CLOSURE_2026-09-06.md`

## Patch behavior

Workbook relationship targets now normalize safely:

```text
worksheets/sheet1.xml       -> xl/worksheets/sheet1.xml
./worksheets/sheet1.xml     -> xl/worksheets/sheet1.xml
xl/worksheets/sheet1.xml    -> xl/worksheets/sheet1.xml
/xl/worksheets/sheet1.xml   -> xl/worksheets/sheet1.xml
../xl/worksheets/sheet1.xml -> xl/worksheets/sheet1.xml
```

Traversal above package root and external relationships remain fail-closed.

Post-fetch report-file parser failures now preserve:

- `external_request_executed=true`;
- `request_attempted=true`;
- actual HTTP status;
- original parser code/message.

No retry was added.

## Validation completed

Exact patched runtime Git blob matched locally before execution:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

Exact regression-script Git blob matched locally:

`4e8c3f7749fc444174be7321a4dc315f6421f39b`

`node --check` PASS.

Dedicated XLSX/telemetry regression: all PASS, including relative/rooted/absolute targets, legal parent normalization, missing-entry fail-closed, traversal fail-closed, external relationship fail-closed, truthful post-fetch telemetry and one-fetch/no-retry.

Collateral exact-blob smoke: CSV, PDF, unsupported-format fail-closed, report URL trust gate, report-file success path, Seller JSON transport, Performance JSON transport — PASS.

No automatic GitHub Actions run existed for the patch/test head, and the current local environment cannot network-clone the full repository. Do not claim a fresh broad-suite PASS that was not executed.

## Current operational boundary

The GitHub branch is patched, but an already loaded browser extension is not hot-reloaded by a Git commit.

The prior report/file ref also has finite lifetime and may expire before retest.

Therefore do not reuse the old Run-24 failure as a post-patch result and do not claim CAP-24 placement resolved yet.

## Exact next operational action

1. reload/build the patched `dist-step7-candidate` extension using the existing operator/Codex validation procedure;
2. after reload, create a **fresh** placement-by-products report for `2026-08-01..2026-08-31` if the old report/ref is expired;
3. perform one explicit `report_info` using the returned code;
4. perform one explicit `report_file_get` using the returned opaque ref;
5. verify live XLSX materialization;
6. isolate target SKU `1636048691` from explicit report columns;
7. calculate exact placement/storage amount;
8. reconcile it against finance before changing CAP-24 totals.

## NO_SKIP_ON_FAILURE state

Until live patched extension retest succeeds:

- do not mark placement cost as zero;
- do not allocate account-level NON_ITEM placement charges;
- do not fold placement into exact CAP-24 arithmetic;
- do not close CAP-24 as fully resolved.

Current checkpoint:

`CAP_24_XLSX_PATCH_IMPLEMENTED__TARGETED_REGRESSION_PASS__NEXT_RELOAD_PATCHED_EXTENSION_AND_LIVE_PLACEMENT_RETEST`
