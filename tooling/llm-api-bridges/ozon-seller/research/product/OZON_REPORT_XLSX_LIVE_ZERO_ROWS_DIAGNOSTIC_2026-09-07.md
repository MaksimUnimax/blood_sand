# Ozon Bridge — XLSX live zero-row diagnostic milestone

Date: 2026-09-07
Status: `PREVIOUS_NAMESPACE_REPAIR_LIVE_ACCEPTANCE_FAIL__DIAGNOSTIC_BUILD_PREHANDOFF_PASS__ROOT_CAUSE_UNPROVEN__LIVE_DIAGNOSTIC_PENDING_POST_INSTALL`

## Business boundary

CAP-24 remains OPEN. The business goal is still to obtain the real storage/placement cost for SKU `1636048691` and include it in full Ozon cost per sold unit. This milestone does not invent that cost and does not count parser work as business success.

## Live failure that triggered this diagnostic

Fresh post-install evidence against the namespace-repair build:

- operation: `report_file_get`
- request_id: `568a9261-133f-421a-90cb-113c81097508`
- HTTP: `200`
- provider request count for the command: `1`
- content type: `application/octet-stream`
- downloaded bytes: `142845`
- detected format: `xlsx`
- available sheet: `Страница #1`
- materialized columns: `[]`
- materialized row_count: `0`
- materialized rows: `[]`

Therefore the prior namespace repair is NOT live-accepted. Its old `PENDING_POST_INSTALL` boundary is resolved as `LIVE_ACCEPTANCE_FAIL`.

## Why this is diagnostic-only

The current parser still ignores every worksheet cell whose `r` cell-reference attribute is absent. That is a concrete code dependency, but the live XLSX raw XML was not preserved, so absence of cell references in the real Ozon workbook is still only a candidate explanation, not proven root cause. A second functional parser fix would therefore be speculative.

This build adds a payload-free structural diagnostic only when an XLSX is successfully opened but materializes as zero columns/zero rows. It reports counts and booleans for row/cell/value/text/formula structures, parser-visible row/cell counts, presence/absence of `r` attributes, shared-string item count, and cell-type counts. It never emits XML snippets, cell values, shared-string values, URLs, credentials, headers or tokens.

## Exact identity

- branch: `diag/ozon-xlsx-live-zero-rows-2026-09-07`
- baseline: `6544806ae170832829671dbcdd461fcb750933e2`
- runtime diagnostic commit: `738dbe8d4ccccb8684da125927e5eeb06beaab43`
- runtime diagnostic blob: `66f64e9fba327f539cfa8b6e937ff34a4e76dd30`
- dist tree: `577bee6686dcc6b13aa9920bad6733621fe1b9d4`
- production files: `21`
- changed production runtime files: `1`
- changed runtime file: `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js`
- new package/runtime dependencies: `0`
- Ozon/provider requests during patch/build: `0`

## Exact production delta

Only `provider_transport_core.js` changes relative to the diagnostic baseline. Two private helpers are added: one counts XML local-name start tags without reading payload values, and one produces a frozen `xlsx_zero_row_structure_v1` count object. `parseXlsxReportBytes` retains decoded worksheet/sharedStrings XML only long enough to parse it and, on the exact empty-sheet condition, attaches `xlsx_structure_diagnostics` to the local parsed result.

No operation alias, request params, retry, pagination, fan-out, host permission, credentials, provider dispatch, opaque ref lifecycle, entitlement, mutation policy or package dependency changes.

## Dependency audit

| Dependency | Status | Verification |
|---|---|---|
| XLSX ZIP reader/decompression | PASS / unchanged | existing parser gates + full run family |
| workbook/sheet relationship resolution | PASS / unchanged | prior relationship regression |
| namespace-safe worksheet/sharedStrings parser | PASS as regression, NOT live accepted as final fix | namespace regression retained; live zero rows recorded above |
| zero-row trigger | PASS | dedicated diagnostic regression |
| row/cell lexical counts | PASS | dedicated prefixed fixture |
| parser row/cell counts | PASS | dedicated prefixed fixture |
| cell `r` presence counts | PASS | missing-ref fixture |
| shared-string count | PASS | dedicated fixture |
| payload non-disclosure | PASS | sentinel values asserted absent from diagnostic object |
| normal non-empty XLSX output | PASS / no diagnostic field | dedicated fixture + namespace regression |
| `ozon_provider.js` opaque ref/TTL/provenance | PASS / unchanged | Git identity + lifecycle/session gates |
| `ozon_contract.js` result sanitization | PASS / unchanged | `report_file_get` remains sanitization-only; full gates |
| operation registry / provider dispatch | PASS / unchanged | Git identity + full gates |
| service worker / request accounting | PASS / unchanged | Git identity + full gates |
| personal-data gate | PASS / unchanged | diagnostics contain structure counts only; provider flow unchanged |
| trusted host / SSRF / credentials | PASS / unchanged | full report-file regression family |
| retry/pagination/fan-out | PASS / unchanged | full report-file regression family |
| manifest/CSP/permissions | PASS / unchanged | Git identity |
| package/lockfiles | PASS | no dependency changes |
| packaged runtime copy | PASS | member-set + byte-for-byte + fresh extraction |
| live real-Ozon structural evidence | PENDING_POST_INSTALL | requires this exact diagnostic build and a fresh report/ref |

- unaccounted dependencies: `0`
- stale assumptions introduced by diagnostic change: `0`
- available-but-unverified dependencies: `0`
- live-only dependencies: `1` — fresh real Ozon XLSX zero-row structural diagnostic

## Validation markers

- `OZON_XLSX_ZERO_ROW_DIAGNOSTIC_TRIGGER_PASS`
- `OZON_XLSX_ZERO_ROW_DIAGNOSTIC_MISSING_CELL_REF_SIGNAL_PASS`
- `OZON_XLSX_ZERO_ROW_DIAGNOSTIC_PREFIX_INDEPENDENT_COUNTS_PASS`
- `OZON_XLSX_ZERO_ROW_DIAGNOSTIC_PAYLOAD_FREE_PASS`
- `OZON_XLSX_ZERO_ROW_DIAGNOSTIC_NONEMPTY_RESULT_NO_TELEMETRY_PASS`
- `OZON_XLSX_LIVE_STRUCTURE_DIAGNOSTICS_REGRESSION_PASS`
- namespace parser regression PASS
- relationship-target regression PASS
- existing report parser/lifecycle/session/workflow gates PASS
- Ubuntu full `run_*.mjs` family PASS
- Windows full `run_*.mjs` family PASS
- fresh extraction PASS

## Artifact

- artifact: `OZON_BRIDGE_v0.1.19_XLSX_LIVE_DIAGNOSTIC_738dbe8d.zip`
- SHA-256: `0e13cc4c4cb8be218930f092744530f437c46429050662612d2da7f1d82dc888`
- dist tree: `577bee6686dcc6b13aa9920bad6733621fe1b9d4`
- production files: `21`

## Required live diagnostic

Install/reload this exact diagnostic artifact. Because previous opaque refs may expire, create a fresh product placement report for `2026-08-01..2026-08-31`, wait via explicit `report_info`, obtain a fresh `report_file_ref`, then issue exactly one explicit `report_file_get`. If the sheet still materializes empty, capture `xlsx_structure_diagnostics` from that same result. That object will distinguish at least: no worksheet rows, parser-vs-lexical tag mismatch, cells present without `r`, values/text/formulas without supported cell materialization, or another structural boundary.

Only after that evidence is obtained may a new root-cause parser repair be authored and subjected to the complete patch/dependency/build/live acceptance cycle.

Final verdict: `DIAGNOSTIC_BUILD_PREHANDOFF_PASS__ROOT_CAUSE_UNPROVEN__LIVE_DIAGNOSTIC_PENDING_POST_INSTALL`.
