# CAP-24 Run 24 — report_file_get XLSX parser blocker

Date: 2026-09-06
Status: `BLOCKED__BRIDGE_XLSX_RELATIONSHIP_PATH_NORMALIZATION_DEFECT`

## Business purpose

Continue the dependent CAP-24 placement/storage attribution workflow for target SKU `1636048691` after:

- Run 22 created the August `seller_placement_by_products` report;
- Run 23 confirmed report status `success` and returned a safe opaque `report_file_ref`.

Target identity:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- frozen period: `2026-08-01..2026-08-31`

Report code:

`REPORT_seller_placement_by_products_2093109_1788697286_01a076aa-9779-798b-94a6-b859c6661312`

Opaque file ref:

`rpf_s_4103b32b-f042-44d9-a542-7eab43c94848`

## Exact command

```text
OZON_API_V1
{
  "operation": "report_file_get",
  "params": {
    "file_ref": "rpf_s_4103b32b-f042-44d9-a542-7eab43c94848"
  }
}
```

## Observed Bridge result

Batch envelope:

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery_mode: `sequential_batch_single_delivery`
- result_count: `1`
- query_planner.status: `complete`
- coalesced_group_count: `0`
- coalesced_logical_count: `0`
- logical_business_result_count: `0`
- physical_business_request_count: `0`
- capability probe: not needed

Result:

- request_id: `96a920e2-4526-4b0a-ae72-781325bb30a1`
- operation: `report_file_get`
- fingerprint: `fbc9d57d`
- host_alias: `report_file`
- HTTP method: `GET`
- path_alias: `report_file_get`
- reported `external_request_executed`: `false`
- reported HTTP status: `0`
- elapsed: `2337 ms`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `report_file_provider_not_seller_subscription`
- automatic_retry: `false`

Bridge error:

- source: `bridge`
- category: `bridge_error`
- code: `REPORT_XLSX_INVALID`
- message: `XLSX sheet entry отсутствует: xl/xl/worksheets/sheet1.xml`

No automatic retry occurred.

## Root-cause diagnosis from current branch source

Current source:

`tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js`

The XLSX parser reads:

- `xl/workbook.xml`;
- `xl/_rels/workbook.xml.rels`.

For each workbook relationship it currently performs the equivalent of:

```js
relationships.set(id, reportJoinZipPath("xl", target));
```

`reportJoinZipPath(base, target)` starts with all path components from `base` and then appends all non-dot components from `target`.

Therefore, when the relationship target already contains a package-root `xl/...` path (as necessarily occurred here, modulo a possible leading `./`), the parser constructs:

```text
base   = xl
target = xl/worksheets/sheet1.xml
result = xl/xl/worksheets/sheet1.xml
```

The thrown error contains that exact duplicated path:

`xl/xl/worksheets/sheet1.xml`.

This is direct evidence that the XLSX relationship target was normalized incorrectly by the Bridge before the worksheet lookup.

Classification:

`BRIDGE_DEFECT__XLSX_WORKBOOK_RELATIONSHIP_TARGET_DOUBLE_XL_PREFIX`

This is not evidence that the Ozon report generation failed. Run 23 already proved the report itself reached provider status `success` and exposed an opaque file ref.

## Secondary observability defect

The returned result says:

- `external_request_executed = false`;
- `http_status = 0`.

Current `executeTrustedReportFileOnce` source performs `fetch(trustedUrl)` first, reads the response bytes, and only then invokes `parseAiReadableReportBytes(...)`.

The observed `REPORT_XLSX_INVALID` can only arise inside the XLSX parser after bytes reached `parseAiReadableReportBytes`.

For this URL-backed XLSX report path, that means the external report-file GET occurred before the parser error.

However parser errors thrown by `fail(...)` do not carry:

- `external_request_executed = true`;
- the successful report-file HTTP status.

The service-worker error result then serializes the missing metadata as `false` / `0`.

Classification:

`BRIDGE_OBSERVABILITY_DEFECT__POST_FETCH_REPORT_PARSE_ERROR_MISREPORTED_AS_NO_EXTERNAL_REQUEST`

The `physical_business_request_count = 0` field may intentionally exclude the special `report_file` pseudo-provider from business-request accounting and is therefore not independently promoted as a defect here. The explicit `external_request_executed=false` field is materially inconsistent with the source execution path for this XLSX parse failure.

## Why retrying the same command is not valid

A repeated `report_file_get` against the same unchanged Bridge/parser would reconstruct the same invalid worksheet path and fail deterministically.

Therefore:

- do not retry the same file ref as if this were provider instability;
- do not recreate the report merely to obtain another file ref;
- do not bypass the opaque-ref provenance gate;
- do not allocate placement/storage from account-level finance data instead.

## Required fix scope — not executed

No executable Bridge patch is authorized by the owner in the current CAP-24 workflow.

Required implementation work, if separately authorized, must repair root cause rather than special-case this report code.

Minimum functional requirement for worksheet relationship resolution:

- standard relative target `worksheets/sheet1.xml` must resolve to `xl/worksheets/sheet1.xml`;
- package-root-like target `xl/worksheets/sheet1.xml` must remain `xl/worksheets/sheet1.xml`, not become `xl/xl/...`;
- leading-root form `/xl/worksheets/sheet1.xml` must resolve safely to the same package entry;
- existing `.` / `..` normalization and ZIP path safety must remain fail-closed.

A robust implementation should resolve workbook relationship targets according to the actual package path and/or test candidate paths against ZIP entries, not blindly prepend `xl` to an already-rooted `xl/...` target.

Observability repair must also preserve post-fetch facts when document parsing fails:

- `external_request_executed = true`;
- actual file-download HTTP status where available;
- no automatic retry.

## Required regression tests if patch is authorized

At minimum:

1. XLSX workbook relationship target `worksheets/sheet1.xml` parses successfully.
2. XLSX workbook relationship target `xl/worksheets/sheet1.xml` parses successfully without duplicated `xl/`.
3. XLSX workbook relationship target `/xl/worksheets/sheet1.xml` parses safely.
4. Missing worksheet still produces `REPORT_XLSX_INVALID` without path traversal or silent fallback to unrelated entries.
5. A successful report-file HTTP GET followed by XLSX parse failure reports `external_request_executed=true` and preserves HTTP status.
6. No retry/polling is introduced.
7. Existing PDF/CSV/report-file provenance behavior remains unchanged.

## CAP-24 effect

Placement/storage exact attribution is blocked at file materialization even though:

- report creation succeeded;
- report generation status is success;
- opaque file ref was obtained.

Under `NO_SKIP_ON_FAILURE`, CAP-24 does not proceed as though placement had been resolved.

Current strict arithmetic remains unchanged:

- Seller Analytics August revenue: `259136.00 RUB`
- ordered_units: `155`
- exact directly attributable finance costs: `113264.00 RUB`
- finance-only contribution preview: `145872.00 RUB`
- advertising evidence: strongly target-linked `35785.11 RUB` with historical membership-interval coverage boundary
- placement/storage: `BLOCKED_BY_BRIDGE_XLSX_PARSER_DEFECT`

## Current checkpoint

`CAP_24_BLOCKED__PLACEMENT_REPORT_XLSX_PARSER_DEFECT__EXECUTABLE_FIX_REQUIRES_OWNER_AUTHORIZATION`

Executable Bridge patch performed: **NO**.
