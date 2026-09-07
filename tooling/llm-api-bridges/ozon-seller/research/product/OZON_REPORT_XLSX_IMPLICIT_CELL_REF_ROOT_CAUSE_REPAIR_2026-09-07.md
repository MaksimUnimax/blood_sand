# Ozon Bridge — XLSX optional cell-reference root-cause repair

Date: 2026-09-07
Status: `CODE_ROOT_CAUSE_PROVEN__FULL_PREHANDOFF_GATES_PASS__LIVE_CAUSAL_ACCEPTANCE_PENDING_POST_INSTALL`

## Business boundary

CAP-24 remains OPEN. The business target is still the actual storage/placement cost for SKU `1636048691`, then reconciliation with finance and inclusion in full Ozon cost per sold unit. Parser success is not business completion.

## Live evidence

Fresh product placement report after the prior namespace build was installed:

- `report_file_get` request id: `568a9261-133f-421a-90cb-113c81097508`
- HTTP: `200`
- physical provider requests: `1`
- content type: `application/octet-stream`
- XLSX bytes: `142845`
- available sheet: `Страница #1`
- columns: `[]`
- row_count: `0`
- rows: `[]`

Therefore the prior namespace build is `LIVE_ACCEPTANCE_FAIL`.

## Exact code root cause

The patched parser still executed this logic for every worksheet cell:

`index = reportColumnIndex(reportXmlAttr(attrs, "r")); if (index === null) continue;`

That makes `<c r="A1">` work but silently discards a valid `<c>` whose cell-reference attribute is absent. SpreadsheetML `CT_Cell/@r` is optional. The parser therefore promoted an optional serialization hint to a mandatory data-presence condition. If all value-bearing cells omit `@r`, worksheet discovery succeeds but every cell is discarded and the exact observed materialization is `columns=[]`, `row_count=0`, `rows=[]`.

The same closed-set sweep found the analogous row issue: `CT_Row/@r` is optional, while the old fallback used the number of previously materialized non-empty rows rather than worksheet order. That does not itself explain zero rows, but it is a dependent stale assumption and is repaired in the same atomic parser boundary.

## Why the previous tests passed and why that was not sufficient

The prior namespace regression was hypothesis-driven rather than a reproduction of the live workbook. Its synthetic worksheet explicitly assigned `r="A1"`, `r="B1"`, etc. to every test cell, then varied namespace prefixes. The older relationship and parser fixtures also carried explicit cell references. Thus the tests proved that the namespace repair handled those fixtures; they never exercised the optional-cell-reference branch that the production parser still mishandled.

The previous dependency report was therefore wrong to state `available-but-unverified dependencies=0`: actual live worksheet cell-coordinate serialization had not been preserved or tested. Artifact byte coherence and the existing regression PASS markers were mechanically valid, but they validated an incomplete behavioral model.

## Exact functional repair

`reportParseSheet` now:

1. treats missing `CT_Cell/@r` as an implicit next-column position;
2. preserves explicit sparse references and advances following implicit cells after the furthest occupied column;
3. supports mixed explicit/implicit references in one row;
4. treats missing `CT_Row/@r` as the next worksheet row and preserves sparse explicit row numbering;
5. fails closed on malformed/out-of-range explicit row or cell references instead of silently discarding them;
6. preserves existing shared-string, inline-string, numeric, boolean, namespace-safe, relationship-target, paging and output behavior.

No alias, request params, retry, fan-out, pagination, provider dispatch, credentials, permissions, opaque-ref lifecycle, entitlement, mutation policy or package dependency changes.

## Dependency closure

| Dependency | Status | Verification |
|---|---|---|
| XLSX ZIP reader/decompression | PASS / unchanged | existing parser gates |
| workbook/sheet relationship resolution | PASS / unchanged | relationship regression |
| arbitrary namespace prefixes | PASS / unchanged | namespace regression |
| `CT_Cell/@r` present | PASS | existing fixtures + new mixed-ref fixture |
| `CT_Cell/@r` absent | REPAIRED / PASS | pre-fix reproduction + post-fix regression |
| mixed explicit/implicit cells | REPAIRED / PASS | dedicated regression |
| explicit sparse cell gaps | PASS | dedicated regression |
| malformed explicit cell ref | FAIL-CLOSED / PASS | dedicated regression |
| `CT_Row/@r` absent | REPAIRED / PASS | dedicated regression |
| explicit sparse row then implicit row | REPAIRED / PASS | dedicated regression |
| malformed explicit row ref | FAIL-CLOSED / PASS | dedicated regression |
| shared strings / inline strings / numeric / boolean | PASS | namespace + parser gates |
| offset/limit pagination | PASS / unchanged | parser gate |
| `ozon_provider.js` opaque refs/TTL/provenance | PASS / unchanged | identity + lifecycle/session gates |
| `ozon_contract.js` / sanitization | PASS / unchanged | identity + full run family |
| operation registry / provider dispatch | PASS / unchanged | identity + full run family |
| service worker / accounting | PASS / unchanged | identity + full run family |
| Seller credentials / report-file credential isolation | PASS / unchanged | report-file gates |
| personal-data policy | PASS / unchanged | no provider/result-policy change |
| trusted report host / SSRF | PASS / unchanged | report-file gates |
| retry/fan-out/pagination request behavior | PASS / unchanged | report-file gates |
| manifest/CSP/permissions | PASS / unchanged | Git identity |
| package manifests/lockfiles | PASS | additions = 0 |
| packaged production tree | PASS | member-set + byte-for-byte + fresh extraction |
| real Ozon causal acceptance | PENDING_POST_INSTALL | exact live bytes were not preserved; requires one fresh read with this exact build |

- unaccounted code dependencies: `0`
- stale parser assumptions found by this sweep after repair: `0`
- available-but-unverified pre-handoff dependencies: `0`
- live-only dependency: `1` — causal real-Ozon materialization after installing this exact artifact

## Validation

The new regression is required to fail against baseline `6544806ae170832829671dbcdd461fcb750933e2` before patching because that baseline silently discards cells without `@r` and returns zero rows.

Post-fix dedicated markers include:

- `OZON_XLSX_OPTIONAL_CELL_REF_MATERIALIZATION_PASS`
- `OZON_XLSX_MIXED_EXPLICIT_IMPLICIT_CELL_REF_PASS`
- `OZON_XLSX_OPTIONAL_ROW_REF_INFERENCE_PASS`
- `OZON_XLSX_SPARSE_EXPLICIT_THEN_IMPLICIT_ROW_REF_PASS`
- `OZON_XLSX_MALFORMED_EXPLICIT_CELL_REF_FAIL_CLOSED_PASS`
- `OZON_XLSX_MALFORMED_EXPLICIT_ROW_REF_FAIL_CLOSED_PASS`
- `OZON_XLSX_IMPLICIT_CELL_REF_ROOT_CAUSE_REGRESSION_PASS`

Also required: namespace regression PASS, relationship regression PASS, existing parser/lifecycle/session/workflow gates PASS, full `run_*.mjs` family PASS on Ubuntu and Windows, JS syntax PASS, package-dependency identity PASS, exact artifact member/byte coherence PASS and fresh-extract PASS.

## Artifact

- artifact: `OZON_BRIDGE_v0.1.19_XLSX_IMPLICIT_CELL_REF_REPAIR_1a64a726.zip`
- SHA-256: `8824e87e0f98be7dc8fa95c6b7b16fa190a76e837c2de896b8d6c440e764a09b`
- runtime patch commit: `1a64a72699a4cd3cc37291a7dcff223e59731010`
- runtime patch blob: `346332d6e298c461e225487ba75faf41b0d51288`
- dist tree: `dc9f9b30eb3830e184e0b16e5e262313afdb811c`
- production files: `21`
- production runtime files changed: `1`
- provider requests during build: `0`

## Epistemic boundary

The code root cause is proven by source, standard-conformant regression and pre-fix reproduction. What is not honestly claimable before the next live read is that the private Ozon worksheet definitely omitted `@r`, because its raw `sheet1.xml` was not preserved by the previous test process. No public indexed copy of this exact placement workbook was found. The causal live test is therefore intentionally one functional change, not another diagnostic build: install this artifact, obtain a fresh report/ref, call one explicit `report_file_get`, and require real columns/rows. If rows materialize, that closes the final causal link. If they do not, this build must not be accepted and the remaining worksheet boundary must be investigated from new evidence.

Final verdict: `FUNCTIONAL_REPAIR_PREHANDOFF_PASS__LIVE_CAUSAL_ACCEPTANCE_PENDING_POST_INSTALL`.
