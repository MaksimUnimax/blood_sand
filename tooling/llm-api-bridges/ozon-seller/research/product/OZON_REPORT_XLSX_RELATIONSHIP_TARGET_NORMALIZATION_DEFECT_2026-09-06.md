# Ozon Bridge — XLSX workbook relationship target normalization defect

Date: 2026-09-06
Status: `CONFIRMED_ROOT_CAUSE__EXECUTABLE_FIX_PENDING_OWNER_AUTHORIZATION`

## Scope

This defect was discovered during CAP-24 SKU monthly unit-economics placement/storage attribution.

Affected flow:

`report_placement_by_products_create -> report_info -> report_file_get -> XLSX parser`

The first two provider steps succeed. The blocker is inside Bridge XLSX materialization.

## Reproduction evidence

CAP-24 report creation:

- report type: `seller_placement_by_products`
- frozen period: `2026-08-01..2026-08-31`
- report code: `REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`

`report_info` returned:

- status: `success`
- opaque ref: `rpf_s_4103b32b-f042-44d9-a542-7eab43c94848`

`report_file_get` then returned:

- error code: `REPORT_XLSX_INVALID`
- message: `XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`
- automatic retry: `false`

Evidence file:

`research/product/live-runs/CAP_24_RUN_24_REPORT_FILE_GET_XLSX_PARSER_BLOCKER_2026-09-06.md`

## Confirmed root cause

Current executable source:

`dist-step7-candidate/shared/provider_transport_core.js`

`parseXlsxReportBytes(...)` reads workbook relationships and stores each relationship target using:

```js
relationships.set(id, reportJoinZipPath("xl", target));
```

`reportJoinZipPath(...)` initializes path components from `base`, then appends target components unless they are `.` or `..`.

For the failing provider workbook relationship, the resulting requested worksheet path was:

```text
xl/xl/worksheets/sheet1.xml
```

That result is only possible when the relationship target already contains an `xl/...` package-root component (possibly preceded by `./`). The parser then adds a second `xl/` prefix.

Root-cause classification:

`XLSX_WORKBOOK_RELATIONSHIP_TARGET_DOUBLE_PREFIX`

The defect is generic to report XLSX files whose workbook relationship target is already rooted under `xl/`; it is not specific to one report code, one seller, one SKU or placement reports.

## Required root-cause behavior

Workbook relationship resolution must correctly support at least:

```text
worksheets/sheet1.xml      -> xl/worksheets/sheet1.xml
xl/worksheets/sheet1.xml   -> xl/worksheets/sheet1.xml
/xl/worksheets/sheet1.xml  -> xl/worksheets/sheet1.xml
```

Do not implement a report-code or seller-specific workaround.

Candidate implementation principle:

- distinguish already package-rooted `xl/...` targets from targets relative to `xl/workbook.xml`;
- retain safe normalization of `.` and `..` segments;
- optionally use ZIP-entry existence as a deterministic fallback only between semantically valid normalized candidates;
- remain fail-closed for traversal/invalid entries.

## Secondary observability defect

`executeTrustedReportFileOnce(...)` performs a real `fetch(trustedUrl)`, reads bytes, and then invokes `parseAiReadableReportBytes(...)`.

A parser error such as `REPORT_XLSX_INVALID` is thrown after the external file request has already happened. The generic parser `fail(...)` error does not carry the post-fetch metadata.

Observed CAP-24 result therefore reported:

```text
external_request_executed = false
http_status = 0
```

although the XLSX parser could only have received bytes after the report-file GET.

Classification:

`REPORT_FILE_POST_FETCH_PARSE_ERROR_OBSERVABILITY_LOSS`

Required behavior on post-fetch parse failure:

- preserve `external_request_executed = true`;
- preserve actual HTTP status when known;
- preserve original parse error code/message;
- preserve `automatic_retry = false`;
- do not perform a hidden retry.

## Regression requirements

Required tests for any authorized patch:

1. relative workbook target `worksheets/sheet1.xml` parses;
2. `xl/worksheets/sheet1.xml` parses without double-prefixing;
3. `/xl/worksheets/sheet1.xml` parses safely;
4. target using legal `.` / `..` normalization remains correct;
5. invalid/missing worksheet remains fail-closed;
6. successful external GET + parser failure reports external request truthfully;
7. no hidden retry;
8. report-file opaque-ref provenance gate remains intact;
9. existing CSV/PDF/XLSX parser regressions remain PASS.

## Commercial impact

CAP-24 can create and complete a product-level placement report, but cannot consume this valid XLSX through the Bridge. This blocks exact product-level placement/storage attribution and degrades the seller-facing unit-economics capability.

This is therefore a Level-3 technical defect justified by a Level-2 business capability failure and Level-0 commercial validation.

## Authorization boundary

No executable Bridge patch has been made.

Current state:

`ROOT_CAUSE_CONFIRMED__PATCH_REQUIRED_FOR_CAP24_PLACEMENT_MATERIALIZATION__OWNER_AUTHORIZATION_REQUIRED`
