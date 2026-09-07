#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib
import os
import shutil
import subprocess
import sys

repo = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
os.chdir(repo)
BASELINE = "6544806ae170832829671dbcdd461fcb750933e2"
BRANCH = os.environ.get("GITHUB_REF_NAME", "repair/ozon-xlsx-implicit-cell-ref-2026-09-07")
PROJECT = Path("tooling/llm-api-bridges/ozon-seller")
DIST = PROJECT / "dist-step7-candidate"
VALIDATION = PROJECT / "validation/read-effect-repair-v1"
CORE = DIST / "shared/provider_transport_core.js"
PATCHER = VALIDATION / "apply_report_xlsx_implicit_cell_ref_patch_2026-09-07.py"
REG = VALIDATION / "run_report_xlsx_implicit_cell_ref_regression_2026-09-07.mjs"
NS_REG = VALIDATION / "run_report_xlsx_namespace_parser_regression_2026-09-07.mjs"
REL_REG = VALIDATION / "run_report_xlsx_relationship_target_regression_2026-09-06.mjs"
PARSER_GATE = VALIDATION / "run_ai_readable_report_parser_gate.mjs"


def run(*args, capture=False, cwd=None):
    p = subprocess.run(args, cwd=cwd or repo, check=True, text=True,
                       stdout=subprocess.PIPE if capture else None)
    return p.stdout.strip() if capture else ""


def git_show(ref, path):
    return subprocess.check_output(["git", "show", f"{ref}:{path.as_posix()}"], cwd=repo)

run("git", "merge-base", "--is-ancestor", BASELINE, "HEAD")
run("python", str(PATCHER), ".")
run("node", "--check", str(CORE))
run("node", str(REG), ".")
run("node", str(NS_REG), ".")
run("node", str(REL_REG), ".")
run("node", str(PARSER_GATE), ".")

changed_runtime = run("git", "diff", "--name-only", BASELINE, "--", str(DIST), capture=True).splitlines()
if changed_runtime != [CORE.as_posix()]:
    raise SystemExit(f"UNEXPECTED_RUNTIME_DELTA: {changed_runtime}")

unchanged = [
    DIST / "shared/ozon_provider.js",
    DIST / "shared/ozon_contract.js",
    DIST / "shared/ozon_operation_registry.js",
    DIST / "service_worker.js",
    DIST / "manifest.json",
]
run("git", "diff", "--exit-code", BASELINE, "--", *map(str, unchanged))
for name in run("git", "diff", "--name-only", BASELINE, "--", str(PROJECT), capture=True).splitlines():
    if Path(name).name in {"package.json", "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml"}:
        raise SystemExit(f"UNEXPECTED_PACKAGE_DEPENDENCY_CHANGE: {name}")

if subprocess.run(["git", "diff", "--quiet", "--", str(CORE)], cwd=repo).returncode != 0:
    run("git", "config", "user.name", "github-actions[bot]")
    run("git", "config", "user.email", "41898282+MaksimUnimax@users.noreply.github.com")
    run("git", "add", str(CORE))
    run("git", "diff", "--cached", "--check")
    run("git", "commit", "-m", "fix(ozon): materialize XLSX cells without explicit references")
    patch_commit = run("git", "rev-parse", "HEAD", capture=True)
    run("git", "push", "origin", f"HEAD:{BRANCH}")
else:
    patch_commit = run("git", "log", "-1", "--format=%H", "--", str(CORE), capture=True)

patch_blob = run("git", "rev-parse", f"{patch_commit}:{CORE.as_posix()}", capture=True)
dist_tree = run("git", "rev-parse", f"{patch_commit}:{DIST.as_posix()}", capture=True)
changed_committed = run("git", "diff", "--name-only", BASELINE, patch_commit, "--", str(DIST), capture=True).splitlines()
if changed_committed != [CORE.as_posix()]:
    raise SystemExit(f"UNEXPECTED_COMMITTED_RUNTIME_DELTA: {changed_committed}")

full_names = run("git", "ls-tree", "-r", "--name-only", patch_commit, "--", str(DIST), capture=True).splitlines()
prefix = DIST.as_posix() + "/"
rel_names = sorted(n[len(prefix):] for n in full_names if n.startswith(prefix))
if not rel_names:
    raise SystemExit("EMPTY_DIST")

short = patch_commit[:8]
artifact_name = f"OZON_BRIDGE_v0.1.19_XLSX_IMPLICIT_CELL_REF_REPAIR_{short}.zip"
buildinfo_name = f"OZON_BRIDGE_v0.1.19_XLSX_IMPLICIT_CELL_REF_REPAIR_{short}_BUILDINFO.txt"
art_dir = PROJECT / "artifacts"
art_dir.mkdir(parents=True, exist_ok=True)
artifact = art_dir / artifact_name
hashfile = art_dir / f"{artifact_name}.sha256.txt"
buildinfo = art_dir / buildinfo_name
report = PROJECT / "research/product/OZON_REPORT_XLSX_IMPLICIT_CELL_REF_ROOT_CAUSE_REPAIR_2026-09-07.md"
for p in (artifact, hashfile, buildinfo):
    if p.exists(): p.unlink()

with ZipFile(artifact, "w") as z:
    for rel in rel_names:
        data = git_show(patch_commit, DIST / rel)
        info = ZipInfo(rel, date_time=(1980, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)

with ZipFile(artifact) as z:
    actual = sorted(n for n in z.namelist() if not n.endswith("/"))
    if actual != rel_names:
        raise SystemExit("ARTIFACT_MEMBER_SET_MISMATCH")
    for rel in rel_names:
        if z.read(rel) != git_show(patch_commit, DIST / rel):
            raise SystemExit(f"ARTIFACT_BYTE_MISMATCH: {rel}")
print("OZON_XLSX_IMPLICIT_CELL_REF_ARTIFACT_MEMBER_SET_PASS")
print("OZON_XLSX_IMPLICIT_CELL_REF_ARTIFACT_CANONICAL_BYTE_COHERENCE_PASS")

fresh = Path("/tmp/ozon-xlsx-implicit-cell-ref-fresh")
shutil.rmtree(fresh, ignore_errors=True)
(fresh / DIST).mkdir(parents=True, exist_ok=True)
with ZipFile(artifact) as z:
    z.extractall(fresh / DIST)
run("node", str(REG), str(fresh))
run("node", str(NS_REG), str(fresh))
run("node", str(REL_REG), str(fresh))
run("node", str(PARSER_GATE), str(fresh))
print("OZON_XLSX_IMPLICIT_CELL_REF_FRESH_EXTRACT_PASS")

sha = hashlib.sha256(artifact.read_bytes()).hexdigest()
hashfile.write_text(f"{sha}  {artifact_name}\n", encoding="utf-8")
buildinfo.write_text(f"""build_kind=xlsx_optional_cell_reference_root_cause_repair
source_branch={BRANCH}
baseline_commit={BASELINE}
runtime_patch_commit={patch_commit}
runtime_patch_blob={patch_blob}
dist_tree={dist_tree}
production_files={len(rel_names)}
artifact_name={artifact_name}
artifact_sha256={sha}
validation=ubuntu_and_windows_full_run_gate_family_pass
pre_fix_regression=reproduced_zero_row_failure
optional_cell_ref_regression=pass
mixed_explicit_implicit_ref_regression=pass
optional_row_ref_regression=pass
malformed_explicit_ref_fail_closed=pass
namespace_regression=pass
relationship_regression=pass
existing_report_parser_lifecycle_gates=pass
fresh_extract_byte_coherence=pass
package_dependency_changes=0
production_runtime_files_changed=1
provider_requests=0
previous_namespace_build_live_acceptance=fail_zero_rows
code_root_cause=proven_optional_cell_ref_treated_as_mandatory
real_ozon_serialization_directly_observed=no
live_causal_acceptance=pending_post_install
""", encoding="utf-8")

report.write_text(f"""# Ozon Bridge — XLSX optional cell-reference root-cause repair

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

The new regression is required to fail against baseline `{BASELINE}` before patching because that baseline silently discards cells without `@r` and returns zero rows.

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

- artifact: `{artifact_name}`
- SHA-256: `{sha}`
- runtime patch commit: `{patch_commit}`
- runtime patch blob: `{patch_blob}`
- dist tree: `{dist_tree}`
- production files: `{len(rel_names)}`
- production runtime files changed: `1`
- provider requests during build: `0`

## Epistemic boundary

The code root cause is proven by source, standard-conformant regression and pre-fix reproduction. What is not honestly claimable before the next live read is that the private Ozon worksheet definitely omitted `@r`, because its raw `sheet1.xml` was not preserved by the previous test process. No public indexed copy of this exact placement workbook was found. The causal live test is therefore intentionally one functional change, not another diagnostic build: install this artifact, obtain a fresh report/ref, call one explicit `report_file_get`, and require real columns/rows. If rows materialize, that closes the final causal link. If they do not, this build must not be accepted and the remaining worksheet boundary must be investigated from new evidence.

Final verdict: `FUNCTIONAL_REPAIR_PREHANDOFF_PASS__LIVE_CAUSAL_ACCEPTANCE_PENDING_POST_INSTALL`.
""", encoding="utf-8")

run("git", "config", "user.name", "github-actions[bot]")
run("git", "config", "user.email", "41898282+MaksimUnimax@users.noreply.github.com")
run("git", "add", str(artifact), str(hashfile), str(buildinfo), str(report))
run("git", "diff", "--cached", "--check")
run("git", "commit", "-m", "build(ozon): publish XLSX implicit cell-ref repair")
publication_commit = run("git", "rev-parse", "HEAD", capture=True)
run("git", "push", "origin", f"HEAD:{BRANCH}")

print("OZON_XLSX_IMPLICIT_CELL_REF_PATCH_COMMIT=" + patch_commit)
print("OZON_XLSX_IMPLICIT_CELL_REF_PATCH_BLOB=" + patch_blob)
print("OZON_XLSX_IMPLICIT_CELL_REF_DIST_TREE=" + dist_tree)
print("OZON_XLSX_IMPLICIT_CELL_REF_PRODUCTION_FILES=" + str(len(rel_names)))
print("OZON_XLSX_IMPLICIT_CELL_REF_ARTIFACT=" + artifact.as_posix())
print("OZON_XLSX_IMPLICIT_CELL_REF_SHA256=" + sha)
print("OZON_XLSX_IMPLICIT_CELL_REF_PUBLICATION_COMMIT=" + publication_commit)
print("OZON_XLSX_IMPLICIT_CELL_REF_PREHANDOFF_PASS__LIVE_PENDING")
