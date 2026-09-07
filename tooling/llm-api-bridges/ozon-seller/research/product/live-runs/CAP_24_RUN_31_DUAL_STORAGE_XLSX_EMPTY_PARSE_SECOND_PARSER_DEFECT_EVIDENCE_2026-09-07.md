# CAP-24 Run 31 — dual storage XLSX materialization exposes second parser-coverage defect class

Date: 2026-09-07
Status: `FAIL_BUSINESS_MATERIALIZATION__SECOND_XLSX_WORKSHEET_PARSER_COVERAGE_DEFECT_STRONGLY_PROVEN`

Frozen period: `2026-08-01..2026-08-31`.
Target SKU: `1636048691`.

## Purpose

Materialize both official Ozon August storage/placement reports after CAP-24 was reopened because storage is mandatory for seller-facing unit economics.

The two report types are independent structural controls:

1. product-level placement cost report;
2. supply-level placement cost report.

Both were created and readied successfully in Runs 29-30.

## Batch execution

Bridge: `ozon-llm-api-bridge v0.1.19`
Delivery mode: `sequential_batch_single_delivery`
Result count: `2`
Logical business result count: `2`
Physical business request count: `2`
Capability probe: not needed / not performed.

No hidden retry, polling, pagination, fanout or chaining occurred.

## Result 1 — product-level placement XLSX

Request ID: `44780eac-587d-40e6-906a-091fc32f9b31`
Operation: `report_file_get`
HTTP: `200`
External request executed: `true`
Logical fingerprint: `1d217d74`
Physical fingerprint: `5edf6fba`
Command transformed: `true`
Content type: `application/octet-stream`
Byte length: **`142845`**
Detected format: `xlsx`
Available sheets: `["Страница #1"]`
Parsed sheet:
- name: `Страница #1`
- columns: `[]`
- row_count: `0`
- rows: `[]`
- has_more: `false`

## Result 2 — supply-level placement XLSX

Request ID: `32653d62-b3c5-4d74-8aff-188561b346cb`
Operation: `report_file_get`
HTTP: `200`
External request executed: `true`
Logical fingerprint: `c4c8e30f`
Physical fingerprint: `b57635a1`
Command transformed: `true`
Content type: `application/octet-stream`
Byte length: **`13176`**
Detected format: `xlsx`
Available sheets: `["Страница #1"]`
Parsed sheet:
- name: `Страница #1`
- columns: `[]`
- row_count: `0`
- rows: `[]`
- has_more: `false`

## What this proves

The first XLSX relationship-target defect remains fixed:

- both report files were fetched successfully;
- both XLSX containers were recognized;
- workbook metadata was opened;
- workbook relationships resolved;
- the worksheet entry was found;
- sheet `Страница #1` was discovered for both files;
- no `xl/xl/worksheets/...` failure occurred.

The remaining failure happens after worksheet discovery, inside the worksheet-to-logical-table parsing stage.

The same empty logical parse occurs for two different official report types with materially different file sizes (`142845` vs `13176` bytes). Therefore a product-report-specific no-data explanation is no longer sufficient.

Strongest current classification:

`SECOND_XLSX_WORKSHEET_PARSER_COVERAGE_DEFECT_STRONGLY_PROVEN`

The exact unsupported OOXML representation is not yet observable from the sanitized current result because raw worksheet XML and structural counts are intentionally not exposed.

## Why this is not a proven zero-storage result

The Bridge currently returns `columns=[] / row_count=0` whenever `reportParseSheet` fails to produce any non-empty matched physical row.

That state collapses at least two materially different realities:

1. genuinely empty worksheet;
2. populated worksheet whose XML row/cell representation is outside the parser's currently supported shape.

Run 31 now supplies a dual-report control strongly favoring parser coverage failure as the root-cause class, but it still does not reveal which concrete XML construct is responsible.

Do not infer:

- storage/placement = `0 RUB`;
- no FBO storage costs in August;
- no target-SKU placement row.

## Current parser limitation relevant to diagnosis

The current `reportParseSheet` recognizes only unprefixed paired worksheet tags matching:

- `<row ...>...</row>`
- `<c ...>...</c>`

and values through supported `<v>` / inline-string / shared-string patterns.

The current live result exposes none of the following safe structural facts:

- worksheet XML byte length;
- worksheet dimension ref;
- count of row-like elements;
- count of cell-like elements;
- namespace-prefixed row/cell presence;
- inlineStr/sharedStrings/formula/type distribution;
- whether `<sheetData>` is physically empty.

Without those diagnostics, choosing a particular parser expansion would be guesswork.

## Required next engineering diagnostic

Before changing parsing semantics, add a privacy-safe, payload-free XLSX worksheet structural diagnostic to the successful `report_file_get` result, for example:

- worksheet_xml_byte_length;
- worksheet_dimension_ref;
- sheet_data_present;
- unprefixed_row_element_count;
- namespace_prefixed_row_element_count;
- unprefixed_cell_element_count;
- namespace_prefixed_cell_element_count;
- supported_value_element_count;
- shared_strings_count;
- parser_physical_rows_emitted;
- parser_data_rows_emitted.

Do not expose raw XML, cell text, URLs, credentials, personal data or file bytes.

One fresh materialization of each report after that diagnostic is sufficient to reveal the concrete OOXML shape and support a root-cause parser patch without guessing.

Executable diagnostic/parser modification requires explicit operator authorization under project rules.

## CAP-24 state

`CAP_24_REOPENED__STORAGE_MANDATORY__BLOCKED_BY_SECOND_XLSX_WORKSHEET_PARSER_COVERAGE_DEFECT`

The previous finance-only and advertising-sensitive calculations remain provisional components only.

Storage must be recovered and reconciled before final all-Ozon unit economics is closed.

Checkpoint:
`CAP_24_RUN_31_SECOND_XLSX_WORKSHEET_PARSER_COVERAGE_DEFECT_STRONGLY_PROVEN__DIAGNOSTIC_PATCH_AUTHORIZATION_REQUIRED`
