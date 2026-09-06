# Ozon Bridge — XLSX report parser patch and dependency closure

Date: 2026-09-06
Status: `PATCH_IMPLEMENTED__EXACT_BLOB_TARGETED_REGRESSION_PASS__LIVE_EXTENSION_RETEST_REQUIRED`

## Authorization

The owner explicitly authorized an executable root-cause patch after CAP-24 Run 24 proved that a valid Ozon `seller_placement_by_products` report could be created and reach `status=success`, but Bridge `report_file_get` failed in its XLSX parser with:

`REPORT_XLSX_INVALID: XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`

This patch is not a report-code, seller, SKU or placement-report workaround. It repairs generic workbook relationship target resolution and the post-fetch parse-error telemetry defect discovered by the same run.

## Baseline and commits

Branch:

`repair/ozon-date-contract-2026-09-04`

Baseline HEAD before executable patch:

`b3b69b010db24922c4e4a9e620001e52a876430e`

Runtime patch commit:

`92773026e479671160aab42c0f7590da155e1184`

Runtime patched blob:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

Regression-test commit:

`cb353190c3e13a644601198c6a854b99356f20d6`

Regression-test blob:

`4e8c3f7749fc444174be7321a4dc315f6421f39b`

Git compare from baseline through runtime patch proved that the executable commit changed exactly one runtime file:

`tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js`

Runtime diff size:

- additions: `50`
- deletions: `7`
- total changes: `57`

No other executable/runtime file changed in that commit.

A second commit added exactly one dedicated validation script:

`tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_report_xlsx_relationship_target_regression_2026-09-06.mjs`

## Exact functional changes

### Change 1 — dedicated workbook relationship target resolver

Added internal function:

`reportResolveWorkbookRelationshipTarget(rawTarget, rawTargetMode)`

It distinguishes:

- workbook-relative targets such as `worksheets/sheet1.xml`;
- package-root-like targets such as `xl/worksheets/sheet1.xml`;
- absolute package paths such as `/xl/worksheets/sheet1.xml`.

Required normalization now is:

```text
worksheets/sheet1.xml      -> xl/worksheets/sheet1.xml
./worksheets/sheet1.xml    -> xl/worksheets/sheet1.xml
xl/worksheets/sheet1.xml   -> xl/worksheets/sheet1.xml
/xl/worksheets/sheet1.xml  -> xl/worksheets/sheet1.xml
../xl/worksheets/sheet1.xml -> xl/worksheets/sheet1.xml
```

The resolver rejects:

- traversal above package root;
- backslash path syntax;
- scheme-based external URI targets;
- network-path targets beginning `//`;
- `TargetMode="External"`.

### Change 2 — `parseXlsxReportBytes` uses the dedicated resolver

Before:

```js
relationships.set(id, reportJoinZipPath("xl", target));
```

After:

- reads `TargetMode` as well as `Id` and `Target`;
- calls the dedicated workbook relationship resolver;
- leaves worksheet selection, shared strings, row parsing, pagination and ZIP entry reads unchanged.

This removes the double-`xl/` root cause without changing general ZIP reader behavior.

### Change 3 — post-fetch report-file error annotation

Added internal function:

`annotateReportFilePostFetchError(error, response)`

For errors occurring after a report-file HTTP response already exists, it preserves the original error code/message and adds:

- `external_request_executed = true`;
- `request_attempted = true`;
- `http_status = response.status`.

### Change 4 — `executeTrustedReportFileOnce` preserves post-fetch truth

Two post-fetch stages are now guarded:

1. response-body read;
2. AI-readable report parsing.

If either throws, the error is rethrown with the truthful external-request metadata above.

The existing report-size error also now explicitly has `request_attempted=true`.

No retry was added.

# Dependency inventory and safety closure

The inventory below includes both modified dependencies and unchanged dependencies whose behavior is reachable from or consumes the modified code.

## A. `provider_transport_core.js` internal dependency graph

### A1. `fail(code, message)` — `UNCHANGED`

Dependency role:
- common fail-closed error constructor used throughout transport/parser code.

Risk from patch:
- new resolver uses existing `fail` for invalid XLSX paths.

Why safe:
- signature and behavior are unchanged;
- new error sites use the existing `REPORT_XLSX_INVALID` class instead of inventing a new public contract;
- existing callers are unaffected.

Protection:
- traversal/external/missing-entry regression cases all fail with expected parser errors.

### A2. `headerValue` / `safeResponseMeta` / `normalizedContentType` — `UNCHANGED`

Dependency role:
- HTTP metadata and content-type normalization.

Risk from patch:
- post-fetch error annotation reads `response.status`, while normal successful response metadata still uses these helpers.

Why safe:
- no code was edited;
- successful report-file smoke test still returns HTTP 200 and parsed CSV;
- Seller/Performance JSON smoke tests also remain 200/parsed.

### A3. `readResponse` — `UNCHANGED`

Dependency role:
- reads text/binary response bytes exactly once.

Risk from patch:
- errors thrown by this unchanged function after a real report-file fetch are now annotated before propagation.

Why safe:
- normal return shape is unchanged;
- no additional read and no retry was introduced;
- only error metadata becomes more truthful.

Protection:
- report-file success smoke test performs one fetch and parses normally;
- post-fetch parse regression proves one fetch only.

### A4. `normalizeTrustedReportFileUrl` — `UNCHANGED`

Dependency role:
- allowlists trusted Ozon/Ozone HTTPS report-file hosts and rejects credentials/nonstandard ports/untrusted hosts.

Risk from patch:
- none functionally; it remains before the fetch and before all parsing.

Why safe:
- patch does not move or bypass URL validation;
- new XLSX relationship resolver operates only inside downloaded ZIP package entries and does not convert relationship targets into network requests.

Protection:
- exact-blob smoke test passes trusted `cdn1.ozone.ru` and rejects `example.com`;
- regression verifies report-file GET still sends `credentials:"omit"` and no Seller/Performance auth headers.

### A5. `reportBase64ToBytes` — `UNCHANGED`

Dependency role:
- inline generated PDF path.

Risk from patch:
- none; URL-backed XLSX parsing does not modify inline Base64 handling.

Why safe:
- no call site or export changed;
- parser dispatch for PDF remains unchanged.

### A6. PDF parser family (`reportLatin1`, `pdfDecodeLiteral`, `pdfDecodeHex`, `pdfExtractTextOperators`, `parsePdfDocumentBytes`) — `UNCHANGED`

Dependency role:
- AI-readable PDF extraction for generated documents/reports.

Risk from patch:
- shared top-level `parseAiReadableReportBytes` remains the dispatcher.

Why safe:
- no PDF branch was edited;
- exact patched blob PDF smoke test still extracts `REPORT OK`.

Protection:
- `OZON_REPORT_PDF_UNCHANGED_PASS`.

### A7. CSV parser family (`reportHeaders`, `parseDelimitedReportText`) — `UNCHANGED`

Dependency role:
- CSV and ZIP-contained CSV report parsing/pagination.

Risk from patch:
- same top-level dispatcher as XLSX.

Why safe:
- no CSV code edited;
- exact patched blob parses SKU CSV and URL-backed CSV successfully.

Protection:
- `OZON_REPORT_CSV_UNCHANGED_PASS`;
- `OZON_REPORT_FILE_SUCCESS_PATH_UNCHANGED_PASS`.

### A8. XML helpers (`reportXmlDecode`, `reportXmlAttr`) — `UNCHANGED`

Dependency role:
- extracts workbook/sheet attributes including relationship `Id`, `Target`, and now `TargetMode`.

Risk from patch:
- one additional attribute name is read through the same helper.

Why safe:
- helper implementation/signature unchanged;
- absent `TargetMode` returns null exactly as existing optional attributes do;
- `TargetMode="External"` is now explicitly fail-closed.

Protection:
- internal target cases and external target-mode regression pass.

### A9. ZIP reader (`zipView`, `zipU16`, `zipU32`, `createReportZipReader`, `reader.get`, `reader.names`) — `UNCHANGED`

Dependency role:
- bounded ZIP/XLSX central-directory and entry reader.

Risk from patch:
- it receives a corrected normalized worksheet path.

Why safe:
- no ZIP parsing code changed;
- no fallback to arbitrary entries was added;
- missing entry still fails closed;
- path traversal is rejected before `reader.get` for workbook relationship targets.

Protection:
- stored-ZIP regression parses five valid relationship forms;
- missing worksheet remains `REPORT_XLSX_INVALID`;
- traversal above package root is rejected.

### A10. `reportJoinZipPath` — `UNCHANGED`

Dependency role:
- previous generic join helper.

Risk from patch:
- workbook relationship resolution no longer uses it.

Why safe:
- function body was deliberately left byte-for-byte unchanged to avoid changing semantics for any other/future caller;
- only the known-invalid workbook usage was replaced by a dedicated resolver.

### A11. `reportResolveWorkbookRelationshipTarget` — `NEW / CHANGED`

Dependency role:
- workbook-specific internal OPC path resolution.

Safety properties:
- preserves standard relative path behavior;
- accepts the exact rooted shape proved by live Ozon XLSX evidence;
- rejects traversal above root and external targets;
- does not issue network requests;
- does not inspect seller-specific/report-specific identifiers.

Protection:
- relative, dot-relative, rooted `xl/`, absolute `/xl/`, legal parent normalization all PASS;
- traversal/external URI/TargetMode External all fail closed.

### A12. `reportParseSharedStrings` / `reportParseSheet` — `UNCHANGED`

Dependency role:
- turns provider worksheet XML into columns/rows with pagination.

Risk from patch:
- receives worksheet bytes that previously could not be found for rooted relationship targets.

Why safe:
- no value conversion, header, row-number, offset, limit or pagination semantics changed;
- regression checks parsed target SKU and numeric value.

### A13. `parseXlsxReportBytes` — `CHANGED`

Dependency role:
- XLSX workbook metadata, relationships, sheet selection and row parser orchestration.

Exact edit:
- relationship target normalization only.

What did not change:
- workbook entry names;
- relationship/workbook XML regexes except reading optional TargetMode;
- sheet-name selection;
- shared-string location;
- worksheet read;
- row parsing;
- output schema.

Why safe:
- standard relative target still passes;
- live-defect rooted forms now pass;
- unsafe relationship targets fail earlier and more explicitly.

### A14. `parseAiReadableReportBytes` — `UNCHANGED`

Dependency role:
- format dispatcher for XLSX, CSV/TXT, ZIP, PDF and old XLS rejection.

Risk from patch:
- XLSX branch invokes modified internal parser.

Why safe:
- public signature/export unchanged;
- format detection/order unchanged;
- CSV/PDF/unsupported-format exact-blob smoke tests pass.

### A15. `annotateReportFilePostFetchError` — `NEW / CHANGED`

Dependency role:
- preserves factual request metadata after a report file was already fetched.

Why safe:
- error code and message are preserved;
- no success response is modified;
- no credentials/URL are added to the public error;
- no retry is triggered;
- it only runs after a `Response` object exists.

Protection:
- simulated HTTP 200 + broken XLSX preserves `REPORT_XLSX_INVALID`, `http_status=200`, `external_request_executed=true`, `request_attempted=true`.

### A16. `executeTrustedReportFileOnce` — `CHANGED`

Dependency role:
- single trusted URL-backed report-file GET and parser handoff.

Exact edits:
- annotate body-read failures after fetch;
- annotate parser failures after fetch;
- mark oversize error `request_attempted=true`.

Unchanged invariants:
- one GET only;
- `redirect:"error"`;
- `credentials:"omit"`;
- Accept header unchanged;
- trusted-host validation occurs before fetch;
- 16 MiB default limit unchanged;
- no automatic retry;
- successful return schema unchanged.

Protection:
- post-fetch broken XLSX test counts exactly one fetch;
- successful CSV report-file GET remains PASS.

### A17. Seller `executeJsonOnce` — `UNCHANGED`

Dependency role:
- all normal Seller API traffic.

Risk from patch:
- same module file was edited, so accidental collateral change had to be checked.

Why safe:
- compare/readback shows no edit to this function;
- exact patched blob mocked Seller POST remains one request, HTTP 200, parsed JSON.

Protection:
- `OZON_SELLER_JSON_TRANSPORT_UNCHANGED_PASS`.

### A18. Performance `executePerformanceJsonOnce` — `UNCHANGED`

Dependency role:
- Performance API/auth/statistics transport.

Risk from patch:
- same source module.

Why safe:
- no Performance branch changed;
- exact patched blob mocked Performance GET remains one request, HTTP 200, parsed JSON.

Protection:
- `OZON_PERFORMANCE_JSON_TRANSPORT_UNCHANGED_PASS`.

### A19. Public `ProviderTransportCore` export object — `UNCHANGED`

Dependency role:
- cross-module API consumed by provider layer/tests.

Why safe:
- no export was added, removed or renamed;
- both new helpers remain private internals;
- existing public method signatures stay identical.

## B. Cross-module dependencies

### B1. `dist-step7-candidate/shared/ozon_provider.js` — `UNCHANGED`

Relevant dependencies:
- `registerReportFile`;
- `resolveReportFileRef`;
- `reportFileRefPolicy`;
- `executeReportFileCommand`;
- `executeCommandObject`.

Why safe:
- Git compare proves file unchanged;
- it still calls the same exported `executeTrustedReportFileOnce({fetchImpl,url,now,parseOptions})` signature;
- successful core return schema is unchanged;
- parser failure remains an exception, but now carries truthful metadata for the existing upper error serializer;
- no report URL is exposed and opaque-ref behavior is unchanged.

### B2. report-file session/provenance state in `ozon_provider.js` — `UNCHANGED`

Relevant behavior:
- `rpf_s_` / `rpf_p_` marker policy;
- 30-minute TTL;
- session storage;
- signed URL retained only behind opaque ref;
- unknown/expired refs fail before external request.

Why safe:
- runtime patch occurs after opaque ref resolution;
- no session key/schema/TTL/policy code changed;
- the new path resolver acts only after report bytes are already downloaded.

### B3. personal-data policy inheritance — `UNCHANGED`

Why safe:
- no `personal_data_required` calculation, marker or operator setting was edited;
- URL-backed file download still receives only the resolved opaque record;
- new regression verifies no Seller/Performance credential header is sent to CDN.

### B4. `dist-step7-candidate/shared/ozon_contract.js` — `UNCHANGED`

Relevant dependency:
- normalizes `report_file_get` params (`file_ref`, optional sheet/offset/limit), preflight and safe result/error rendering.

Why safe:
- no command shape or output schema changed;
- modified core consumes the exact same `parseOptions` values;
- no new operator parameter is introduced.

### B5. `dist-step7-candidate/shared/ozon_operation_registry.js` — `UNCHANGED`

Relevant entries:
- `report_file_get`;
- `report_info`;
- `report_placement_by_products_create`.

Why safe:
- operation names/providers/effect/safety/privacy/workflow roles unchanged;
- the patch repairs implementation beneath the existing `report_file_get` contract rather than changing registry semantics.

### B6. `dist-step7-candidate/service_worker.js` — `UNCHANGED`

Relevant dependency:
- serializes provider/Bridge execution errors using `error.http_status` and `error.external_request_executed`.

Why safe:
- serializer is unchanged;
- it now receives correct post-fetch facts instead of missing fields;
- no batching/planning/delivery logic changes;
- no retry is introduced.

Expected behavior change is intentional:
- the same class of post-fetch XLSX parser failure should now report an actual file HTTP status and `external_request_executed=true`.

### B7. query planner / sequential batch delivery — `UNCHANGED`

Why safe:
- no command discovery/planning/service-worker code changed;
- report-file operation remains one explicit dependent command;
- transport still performs at most one file GET.

### B8. Seller credentials and headers — `UNCHANGED`

Why safe:
- Seller credentials are never passed into `executeTrustedReportFileOnce`;
- its GET headers remain the fixed Accept header only;
- `credentials:"omit"` remains unchanged.

Protection:
- targeted regression explicitly asserts no `client-id`, `api-key`, or `authorization` header.

### B9. Performance credentials/token/cache — `UNCHANGED`

Why safe:
- Performance functions and token lifecycle are not in the report-file call path;
- `executePerformanceJsonOnce` exact-blob smoke PASS.

### B10. report pagination (`sheet`, `offset`, `limit`) — `UNCHANGED`

Why safe:
- `executeTrustedReportFileOnce` still forwards the same parseOptions;
- `parseXlsxReportBytes` still passes the unchanged options into `reportParseSheet`;
- no defaults changed (`offset=0`, `limit=200`).

### B11. report size guard — `UNCHANGED` limit, `CHANGED` telemetry only

Why safe:
- 16 MiB default remains exactly the same;
- only `request_attempted=true` was added to an error that necessarily follows a completed fetch/read;
- no size is accepted that was previously rejected.

### B12. report content-type/format dispatch — `UNCHANGED`

Why safe:
- content-type normalization and branch ordering are unchanged;
- old binary XLS remains rejected;
- unsupported format remains fail-closed.

### B13. ZIP compression/runtime built-ins — `UNCHANGED`

Dependencies:
- `DataView`;
- `TextDecoder`;
- `Blob`;
- `Response`;
- `DecompressionStream("deflate-raw")`.

Why safe:
- no dependency/package/runtime requirement changed;
- new resolver is plain string/path logic only.

### B14. PDF/direct generated-document workflows — `UNCHANGED`

Why safe:
- inline PDF path uses `reportBase64ToBytes` + `parseAiReadableReportBytes` PDF branch, neither edited;
- URL PDF path uses same trusted download function, and the only success-path change is none;
- error annotation affects only error metadata after a performed fetch.

### B15. CSV report workflows — `UNCHANGED`

Why safe:
- CSV parser and download success path unchanged;
- exact patched blob URL-backed CSV smoke PASS.

### B16. placement report create/info endpoints — `UNCHANGED`

Why safe:
- patch begins only at report file XLSX parsing;
- Run 22/23 provider operations are not modified;
- report code/ref lifecycle remains the same.

### B17. finance, analytics and CAP-24 arithmetic — `UNCHANGED`

Why safe:
- no finance/analytics operation or evidence number is modified;
- patch only enables consumption of a previously unreadable placement XLSX;
- placement cost will be added to CAP-24 only after a new live report is successfully parsed and target SKU is explicitly identified.

### B18. advertising/Performance CAP-24 coverage boundary — `UNCHANGED`

Why safe:
- this patch does not alter any Performance advertising evidence or historical-membership classification.

### B19. extension version / manifest / packaging — `UNCHANGED`

Why safe:
- this is an in-branch repair to current `dist-step7-candidate` v0.1.19 runtime;
- no manifest permission, host permission, CSP, content script or version string changes are required for the parser fix.

Operational implication:
- the already loaded browser extension does not become patched merely because Git changed; it must be reloaded/rebuilt according to the existing operator validation protocol before live retest.

## Validation actually executed

### 1. Exact Git blob verification

The locally executed `provider_transport_core.js` was hashed with Git blob semantics.

Observed local blob:

`5255fa0bfe76e0b5add2bafb942acabf092bac68`

This exactly equals GitHub readback blob `5255fa0b...`.

The locally executed regression script blob was also matched exactly to GitHub:

`4e8c3f7749fc444174be7321a4dc315f6421f39b`

Therefore targeted tests ran against the exact committed bytes, not an approximate reconstruction.

### 2. JavaScript syntax

`node --check provider_transport_core.js` — PASS.

### 3. Dedicated XLSX/telemetry regression gate

All PASS:

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

### 4. Exact-blob collateral transport/parser smoke

All PASS:

```text
OZON_REPORT_CSV_UNCHANGED_PASS
OZON_REPORT_PDF_UNCHANGED_PASS
OZON_REPORT_FORMAT_FAIL_CLOSED_UNCHANGED_PASS
OZON_REPORT_URL_TRUST_GATE_UNCHANGED_PASS
OZON_REPORT_FILE_SUCCESS_PATH_UNCHANGED_PASS
OZON_SELLER_JSON_TRANSPORT_UNCHANGED_PASS
OZON_PERFORMANCE_JSON_TRANSPORT_UNCHANGED_PASS
```

### 5. Git diff/readback

Runtime commit modifies exactly one runtime file. No caller/registry/contract/service-worker file changed.

## Validation not falsely claimed

No GitHub Actions workflow was automatically started for the regression-test commit (`total_count=0` for that head SHA).

The current execution environment has no network access to clone the full Git repository, and the GitHub connector exposes no workflow-dispatch action. Therefore this report does **not** claim a fresh post-patch PASS for every large repository-wide gate such as:

- `run_all_26_e2e_gate.mjs`;
- `run_report_file_lifecycle_gate.mjs`;
- `run_report_file_session_fail_closed_gate.mjs`;
- `run_step7_regression.py`;
- `run_step7_privacy.py`.

Their source files are unchanged, and the patch was deliberately scoped to preserve their documented contracts, but a fresh full-suite execution remains part of release/reload validation if the operator environment can run them.

## Live retest requirement

The committed patch does not modify the already loaded extension process in the browser.

Before CAP-24 placement can resume:

1. load/reload the patched `dist-step7-candidate` extension according to the existing validation protocol;
2. because the old report/ref has a finite lifetime, create a fresh August placement-by-products report if necessary;
3. `report_info` once with the returned code;
4. `report_file_get` once with the returned opaque ref;
5. verify the live result no longer contains `xl/xl/worksheets/...`;
6. inspect target SKU `1636048691` and exact placement/storage amount;
7. reconcile against finance evidence before changing final CAP-24 arithmetic.

## Current patch conclusion

`ROOT_CAUSE_PATCH_IMPLEMENTED__TARGETED_EXACT_BLOB_REGRESSION_PASS__DEPENDENCY_CLOSURE_DOCUMENTED__FULL_REPO_AND_LIVE_RETEST_PENDING`
