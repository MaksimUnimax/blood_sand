# Ozon Bridge — XLSX workbook relationship target normalization defect

Date: 2026-09-06
Status: `ROOT_CAUSE_PATCH_IMPLEMENTED__TARGETED_EXACT_BLOB_REGRESSION_PASS__LIVE_RETEST_REQUIRED`

## Scope

This defect was discovered during CAP-24 SKU monthly unit-economics placement/storage attribution.

Affected flow:

`report_placement_by_products_create -> report_info -> report_file_get -> XLSX parser`

Run 22 report creation and Run 23 report readiness succeeded. Run 24 failed inside Bridge XLSX materialization.

## Reproduction evidence

CAP-24 report:

- report type: `seller_placement_by_products`
- frozen period: `2026-08-01..2026-08-31`
- report code: `REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`

`report_info` returned:

- status: `success`
- opaque ref: `rpf_s_4103b32b-f042-44d9-a542-7eab43c94848`

`report_file_get` returned:

- error code: `REPORT_XLSX_INVALID`
- message: `XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`
- automatic retry: `false`

Evidence file:

`research/product/live-runs/CAP_24_RUN_24_REPORT_FILE_GET_XLSX_PARSER_BLOCKER_2026-09-06.md`

## Confirmed root cause

Current runtime authority:

`dist-step7-candidate/shared/provider_transport_core.js`

Before the patch, `parseXlsxReportBytes(...)` normalized every workbook relationship target through:

```js
reportJoinZipPath("xl", target)
```

For a provider target already rooted under `xl/`, this produced:

```text
xl/ + xl/worksheets/sheet1.xml
= xl/xl/worksheets/sheet1.xml
```

Root-cause classification:

`XLSX_WORKBOOK_RELATIONSHIP_TARGET_DOUBLE_PREFIX`

This was generic to XLSX reports with an already package-rooted workbook relationship target; it was not specific to the seller, SKU, report code, or placement report.

## Secondary confirmed observability defect

`executeTrustedReportFileOnce(...)` performs the real report-file GET and reads response bytes before XLSX parsing.

A parser error therefore occurs after an external request has already happened, but the previous parser error object carried no post-fetch metadata. The upper error serializer consequently reported:

```text
external_request_executed = false
http_status = 0
```

Classification:

`REPORT_FILE_POST_FETCH_PARSE_ERROR_OBSERVABILITY_LOSS`

## Authorized root-cause patch

Owner authorization was explicitly granted on 2026-09-06.

Runtime patch commit:

`92773026e479671160aab42c0f7590da155e1184`

Patched runtime blob:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

Regression-test commit:

`cb353190c3e13a644601198c6a854b99356f20d6`

Patch/dependency-closure authority:

`OZON_REPORT_XLSX_RELATIONSHIP_TARGET_PATCH_AND_DEPENDENCY_CLOSURE_2026-09-06.md`

## Implemented behavior

The runtime now has a dedicated workbook relationship resolver with these semantics:

```text
worksheets/sheet1.xml       -> xl/worksheets/sheet1.xml
./worksheets/sheet1.xml     -> xl/worksheets/sheet1.xml
xl/worksheets/sheet1.xml    -> xl/worksheets/sheet1.xml
/xl/worksheets/sheet1.xml   -> xl/worksheets/sheet1.xml
../xl/worksheets/sheet1.xml -> xl/worksheets/sheet1.xml
```

It fails closed on:

- traversal above package root;
- backslash path separators;
- scheme/network external targets;
- `TargetMode="External"`.

`parseXlsxReportBytes` now reads optional `TargetMode` and uses this dedicated resolver instead of blindly prepending `xl/`.

No ZIP reader, sheet parser, CSV parser, PDF parser, Seller transport, Performance transport, opaque-ref policy, command contract, registry, service worker, batching, retry, or credentials code was modified.

## Observability repair

Post-fetch report-file errors are now rethrown with:

- original error code/message;
- `external_request_executed=true`;
- `request_attempted=true`;
- actual response HTTP status.

The report-size error also truthfully records `request_attempted=true`.

No automatic retry was added.

## Targeted exact-blob validation

The locally executed runtime file was hashed with Git blob semantics and matched the GitHub blob exactly:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

The regression script also matched its GitHub blob exactly:

`4e8c3f7749fc444174be7321a4dc315f6421f39b`

`node --check` for the exact patched runtime: PASS.

Dedicated regression markers all PASS:

```text
OZON_REPORT_XLSX_RELATIVE_TARGET_PASS
OZON_REPORT_XLSX_DOT_RELATIVE_TARGET_PASS
OZON_REPORT_XLSX_ROOTED_XL_TARGET_PASS
OZON_REPORT_XLSX_ABSOLUTE_XL_TARGET_PASS
OZON_REPORT_XLSX_LEGAL_PARENT_NORMALIZATION_PASS
OZON_REPORT_XLSX_MISSING_ENTRY_FAIL_CLOSED_PASS
OZON_REPORT_XLSX_TRAVERSAL_FAIL_CLOSED_PASS
OZON_REPORT_XLSX_EXTERNAL_URI_FAIL_CLOSED_PASS
OZON_REPORT_XLSX_TARGET_MODE_EXTERNAL_FAIL_CLOSED_PASS
OZON_REPORT_FILE_POST_FETCH_PARSE_TELEMETRY_PASS
OZON_REPORT_FILE_POST_FETCH_PARSE_NO_RETRY_PASS
OZON_REPORT_XLSX_RELATIONSHIP_TARGET_REGRESSION_PASS
```

Collateral exact-blob smoke markers all PASS:

```text
OZON_REPORT_CSV_UNCHANGED_PASS
OZON_REPORT_PDF_UNCHANGED_PASS
OZON_REPORT_FORMAT_FAIL_CLOSED_UNCHANGED_PASS
OZON_REPORT_URL_TRUST_GATE_UNCHANGED_PASS
OZON_REPORT_FILE_SUCCESS_PATH_UNCHANGED_PASS
OZON_SELLER_JSON_TRANSPORT_UNCHANGED_PASS
OZON_PERFORMANCE_JSON_TRANSPORT_UNCHANGED_PASS
```

## Full-suite honesty boundary

No GitHub Actions run was automatically created for the patch/test head, the connected GitHub tool does not expose workflow dispatch, and the local execution environment cannot network-clone the repository.

Therefore this authority does not claim a fresh post-patch PASS for every broad repository gate. Full-suite/release regression remains required in an environment with the complete repository checkout.

This limitation does not invalidate the exact-blob targeted regression above; it only prevents a false claim about unrelated broad suites.

## Live extension retest still required

A Git commit does not hot-reload the already running browser extension.

Before CAP-24 placement attribution can be promoted from blocked to resolved:

1. reload/build the patched `dist-step7-candidate` through the existing operator validation procedure;
2. create a fresh August placement-by-products report if the old report/ref has expired;
3. perform one explicit `report_info`;
4. perform one explicit `report_file_get` using the returned opaque ref;
5. verify live parsing succeeds without `xl/xl/...`;
6. identify target SKU `1636048691` from report columns;
7. calculate exact placement/storage amount only from provider-backed target rows;
8. reconcile against finance evidence before CAP-24 final arithmetic.

## Current state

`PATCH_IMPLEMENTED__TARGETED_REGRESSION_PASS__FULL_REPO_AND_LIVE_RETEST_PENDING`
