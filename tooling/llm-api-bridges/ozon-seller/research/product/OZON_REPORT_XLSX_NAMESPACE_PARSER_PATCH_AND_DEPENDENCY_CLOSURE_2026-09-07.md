# Ozon Bridge — XLSX namespace-safe worksheet parser patch and dependency closure

Date: 2026-09-07
Status: `PATCH_IMPLEMENTED__UBUNTU_WINDOWS_FULL_GATES_PASS__FRESH_EXTRACT_PASS__LIVE_OZON_RETEST_PENDING`

## Business purpose

CAP-24 must include storage/placement in full Ozon cost per sold unit for SKU `1636048691`. Official placement XLSX reports were created, became ready, downloaded as non-trivial workbooks and exposed worksheet `Страница #1`, but Bridge materialized `columns=[]`, `row_count=0`, `rows=[]`. This repair fixes the parser boundary only; it does not invent a storage value or change CAP-24 arithmetic.

## Baseline and exact identity

- branch: `repair/ozon-xlsx-worksheet-namespace-parser-2026-09-07`
- baseline: `1341b167b830e922f95febc75c3f462f94844b59`
- runtime patch commit: `d9c171d46105f04339b4b96f7de6dde81e080514`
- runtime patch blob: `4cbe58b72440d080f957443bc18f5d8186c02ff0`
- dist tree: `04e26d521db41c12e83e5564ef8c56215b7f5ecc`
- production files: `21`
- changed production runtime files: `1`
- changed runtime file: `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js`
- new npm/package/runtime dependencies: `0`
- provider/business requests during patch/build: `0`

## Root cause

The XLSX implementation parsed SpreadsheetML/OPC XML by literal namespace-less tag spelling. It recognized `<row>`, `<c>`, `<v>`, `<t>`, `<si>`, `<sheet>` and `<Relationship>`, while valid OOXML may serialize the same local names with arbitrary namespace prefixes such as `<x:row>`, `<main:row>` or `<pkg:Relationship>`. Workbook worksheet-id extraction also assumed the literal `r:id` prefix. The previous relationship-target repair remains intact; this defect is one layer lower, after worksheet resolution succeeds.

## Exact production repair

Two private dependency-free helpers were added inside `provider_transport_core.js`:

- `reportXmlQualifiedElementPattern(localName, flags)` — matches a local element name with no prefix or any XML-like prefix, pairs the exact qualified closing name, and accepts self-closing elements.
- `reportXmlAttrLocalName(tag, localName)` — reads a namespace-qualified or unqualified attribute by local name when prefix identity is not semantically fixed.

The XLSX parser now uses them for workbook `sheet`, OPC `Relationship`, shared `si/t`, worksheet `row/c/v/t`, arbitrary worksheet relationship-id prefix and self-closing cells. No public API, operation name, retry, request count, credentials, permission, pagination default or output schema changed.

# Dependency audit

## Internal parser graph

| Dependency | Status | Evidence |
|---|---|---|
| `reportXmlDecode` | UNCHANGED / PASS | same entity decoder used by new paths |
| `reportXmlAttr` | UNCHANGED / PASS | exact scalar attributes remain unchanged |
| `reportColumnIndex` | UNCHANGED / PASS | A/B reconstruction passes |
| `reportHeaders` | UNCHANGED / PASS | existing and dedicated gates pass |
| ZIP reader/decompression | UNCHANGED / PASS | exact artifact and parser gates pass |
| prior relationship-target resolver | UNCHANGED / PASS | 2026-09-06 relationship regression passes |
| `reportParseSharedStrings` | CHANGED / PASS | arbitrary prefixes + shared strings covered |
| `reportParseSheet` | CHANGED / PASS | rows/cells/inline/numeric/boolean/self-closing covered |
| `parseXlsxReportBytes` | CHANGED / PASS | namespaced workbook/sheet/OPC relationship covered |
| format dispatcher | UNCHANGED / PASS | existing parser gate family passes |
| trusted report-file transport | UNCHANGED / PASS | old no-retry/telemetry regression passes |
| public `ProviderTransportCore` exports | UNCHANGED / PASS | no export delta |

## Cross-module graph

| Dependency | Status | Evidence |
|---|---|---|
| `shared/ozon_provider.js` / opaque `rpf_*` refs / TTL / provenance | UNCHANGED / PASS | Git identity + lifecycle/session gates |
| `shared/ozon_contract.js` | UNCHANGED / PASS | Git identity + full run family |
| `shared/ozon_operation_registry.js` | UNCHANGED / PASS | Git identity; operation semantics untouched |
| `service_worker.js` | UNCHANGED / PASS | Git identity; batching/accounting untouched |
| query planner / sequential delivery | UNCHANGED / PASS | full run family |
| Seller credentials/headers | UNCHANGED / PASS | report-file path remains credential-free |
| Performance token/cache/headers | UNCHANGED / PASS | no transport delta |
| personal-data policy | UNCHANGED / PASS | parser runs after bytes are downloaded |
| sheet/offset/limit pagination | UNCHANGED / PASS | existing parser gates |
| content-type/format dispatch | UNCHANGED / PASS | existing parser gates |
| report size guard | UNCHANGED / PASS | no limit change |
| manifest/host permissions/CSP | UNCHANGED / PASS | Git identity |
| package manifests/lockfiles | UNCHANGED / PASS | dependency-manifest gate; additions = 0 |
| extension version | UNCHANGED / PASS | v0.1.19 parser-only repair |
| placement create/info | UNCHANGED / PASS | repair starts only at XLSX parsing |
| Finance/analytics/CAP-24 arithmetic | UNCHANGED / PASS | no business value changed pre-live |

## Closed-set and secondary-defect sweep

The audit did not stop at the first failing `row` boundary. Every parser site carrying the same literal-tag/prefix assumption was traced: workbook `sheet`, OPC `Relationship`, worksheet relationship-id attribute, shared `si/t`, worksheet `row/c/v/t`, inline strings and self-closing cells.

- unaccounted dependencies: `0`
- stale literal-prefix assumptions found by this sweep after patch: `0`
- available-but-unverified dependencies: `0`
- package/runtime dependency changes: `0`
- live-only dependency: one fresh real Ozon placement XLSX read after installing/reloading this exact build

# Validation

Pre-fix proof: the dedicated namespace regression is required to fail against baseline `1341b167b830e922f95febc75c3f462f94844b59` before the patch is applied.

Dedicated post-fix markers:

- `OZON_REPORT_XLSX_NAMESPACE_PREFIX_X_PASS`
- `OZON_REPORT_XLSX_NAMESPACE_PREFIX_ARBITRARY_PASS`
- `OZON_REPORT_XLSX_WORKBOOK_RELATIONSHIP_PREFIX_ARBITRARY_PASS`
- `OZON_REPORT_XLSX_SHARED_STRINGS_NAMESPACED_PASS`
- `OZON_REPORT_XLSX_INLINE_STRING_NAMESPACED_PASS`
- `OZON_REPORT_XLSX_NUMERIC_VALUE_NAMESPACED_PASS`
- `OZON_REPORT_XLSX_BOOLEAN_VALUE_NAMESPACED_PASS`
- `OZON_REPORT_XLSX_SELF_CLOSING_CELL_PASS`
- `OZON_REPORT_XLSX_NAMESPACE_PARSER_REGRESSION_PASS`

Repository gates: Ubuntu full `run_*.mjs` PASS; Windows full `run_*.mjs` PASS; prior XLSX relationship regression PASS; existing report parser/lifecycle/session/workflow gates PASS; JavaScript syntax PASS.

Artifact gates:

- `OZON_XLSX_NAMESPACE_ARTIFACT_MEMBER_SET_PASS`
- `OZON_XLSX_NAMESPACE_ARTIFACT_CANONICAL_BYTE_COHERENCE_PASS`
- `OZON_XLSX_NAMESPACE_FRESH_EXTRACT_PASS`

## Build

- artifact: `OZON_BRIDGE_v0.1.19_XLSX_NAMESPACE_PARSER_REPAIR_d9c171d4.zip`
- SHA-256: `d12316c1f16bffb03ef46e01bb8bb5b196c97a2d63ad3814fabda78bb6cb9e66`
- dist tree: `04e26d521db41c12e83e5564ef8c56215b7f5ecc`
- production files: `21`

## Live boundary / not falsely claimed

The build pipeline performs zero Ozon requests, so live Ozon acceptance remains `PENDING_POST_INSTALL`, not PASS. Required acceptance: install/reload this exact artifact; obtain a fresh report/ref if needed; issue one explicit `report_file_get` per report; require real row materialization; locate SKU `1636048691`; extract actual storage/placement; reconcile product-vs-supply meaning and Finance; only then add storage to full Ozon cost per sold unit and close CAP-24.

Final pre-handoff verdict: `PATCH_AND_DEPENDENCY_GATE_PASS__LIVE_OZON_ACCEPTANCE_PENDING_POST_INSTALL`.
