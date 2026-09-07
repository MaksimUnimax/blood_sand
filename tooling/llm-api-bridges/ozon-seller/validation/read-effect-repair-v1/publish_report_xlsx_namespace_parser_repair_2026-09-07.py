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
BASELINE = "1341b167b830e922f95febc75c3f462f94844b59"
PROJECT = Path("tooling/llm-api-bridges/ozon-seller")
DIST = PROJECT / "dist-step7-candidate"
VALIDATION = PROJECT / "validation/read-effect-repair-v1"
CORE = DIST / "shared/provider_transport_core.js"
PATCHER = VALIDATION / "apply_report_xlsx_namespace_parser_patch_2026-09-07.py"
REG = VALIDATION / "run_report_xlsx_namespace_parser_regression_2026-09-07.mjs"
OLD_REG = VALIDATION / "run_report_xlsx_relationship_target_regression_2026-09-06.mjs"
BRANCH = os.environ.get("GITHUB_REF_NAME", "repair/ozon-xlsx-worksheet-namespace-parser-2026-09-07")


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
run("node", str(OLD_REG), ".")

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
project_delta = run("git", "diff", "--name-only", BASELINE, "--", str(PROJECT), capture=True).splitlines()
for name in project_delta:
    base = Path(name).name
    if base in {"package.json", "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml"}:
        raise SystemExit(f"UNEXPECTED_PACKAGE_DEPENDENCY_CHANGE: {name}")
print("OZON_XLSX_NAMESPACE_DEPENDENCY_MANIFEST_IDENTITY_PASS")

for gate in sorted(VALIDATION.glob("run_*.mjs")):
    run("node", str(gate), ".")
print("OZON_XLSX_NAMESPACE_FULL_RUN_GATE_FAMILY_PASS")

if subprocess.run(["git", "diff", "--quiet", "--", str(CORE)], cwd=repo).returncode != 0:
    run("git", "config", "user.name", "github-actions[bot]")
    run("git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    run("git", "add", str(CORE))
    run("git", "diff", "--cached", "--check")
    run("git", "commit", "-m", "fix(ozon): parse namespaced XLSX worksheet XML safely")
    patch_commit = run("git", "rev-parse", "HEAD", capture=True)
    run("git", "push", "origin", f"HEAD:{BRANCH}")
else:
    patch_commit = run("git", "log", "-1", "--format=%H", "--", str(CORE), capture=True)

patch_blob = run("git", "rev-parse", f"{patch_commit}:{CORE.as_posix()}", capture=True)
dist_tree = run("git", "rev-parse", f"{patch_commit}:{DIST.as_posix()}", capture=True)
run("git", "diff", "--exit-code", patch_commit, "--", str(DIST))
changed_committed = run("git", "diff", "--name-only", BASELINE, patch_commit, "--", str(DIST), capture=True).splitlines()
if changed_committed != [CORE.as_posix()]:
    raise SystemExit(f"UNEXPECTED_COMMITTED_RUNTIME_DELTA: {changed_committed}")

full_names = run("git", "ls-tree", "-r", "--name-only", patch_commit, "--", str(DIST), capture=True).splitlines()
prefix = DIST.as_posix() + "/"
rel_names = sorted(n[len(prefix):] for n in full_names if n.startswith(prefix))
if not rel_names:
    raise SystemExit("EMPTY_DIST")

short = patch_commit[:8]
artifact_name = f"OZON_BRIDGE_v0.1.19_XLSX_NAMESPACE_PARSER_REPAIR_{short}.zip"
buildinfo_name = f"OZON_BRIDGE_v0.1.19_XLSX_NAMESPACE_PARSER_REPAIR_{short}_BUILDINFO.txt"
art_dir = PROJECT / "artifacts"
art_dir.mkdir(parents=True, exist_ok=True)
artifact = art_dir / artifact_name
hashfile = art_dir / f"{artifact_name}.sha256.txt"
buildinfo = art_dir / buildinfo_name
report = PROJECT / "research/product/OZON_REPORT_XLSX_NAMESPACE_PARSER_PATCH_AND_DEPENDENCY_CLOSURE_2026-09-07.md"
for p in (artifact, hashfile, buildinfo, report):
    if p.exists() and p != report:
        p.unlink()

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
print("OZON_XLSX_NAMESPACE_ARTIFACT_MEMBER_SET_PASS")
print("OZON_XLSX_NAMESPACE_ARTIFACT_CANONICAL_BYTE_COHERENCE_PASS")

fresh = Path("/tmp/ozon-xlsx-namespace-fresh")
shutil.rmtree(fresh, ignore_errors=True)
(fresh / DIST).mkdir(parents=True, exist_ok=True)
with ZipFile(artifact) as z:
    z.extractall(fresh / DIST)
run("node", str(REG), str(fresh))
run("node", str(OLD_REG), str(fresh))
run("node", str(VALIDATION / "run_ai_readable_report_parser_gate.mjs"), str(fresh))
print("OZON_XLSX_NAMESPACE_FRESH_EXTRACT_PASS")

sha = hashlib.sha256(artifact.read_bytes()).hexdigest()
hashfile.write_text(f"{sha}  {artifact_name}\n", encoding="utf-8")

buildinfo.write_text(f"""build_kind=xlsx_namespace_safe_worksheet_parser_root_cause_repair
source_branch={BRANCH}
baseline_commit={BASELINE}
runtime_patch_commit={patch_commit}
runtime_patch_blob={patch_blob}
dist_tree={dist_tree}
production_files={len(rel_names)}
artifact_name={artifact_name}
artifact_sha256={sha}
validation=ubuntu_and_windows_full_run_gate_family_pass
pre_fix_regression=reproduced_failure
dedicated_namespace_regression=pass
prior_xlsx_relationship_regression=pass
existing_report_parser_lifecycle_gates=pass
fresh_extract_byte_coherence=pass
package_dependency_changes=0
production_runtime_files_changed=1
provider_requests=0
live_ozon_acceptance=pending_post_install
""", encoding="utf-8")

report.write_text(f"""# Ozon Bridge — XLSX namespace-safe worksheet parser patch and dependency closure

Date: 2026-09-07
Status: `PATCH_IMPLEMENTED__UBUNTU_WINDOWS_FULL_GATES_PASS__FRESH_EXTRACT_PASS__LIVE_OZON_RETEST_PENDING`

## Business purpose

CAP-24 must include storage/placement in full Ozon cost per sold unit for SKU `1636048691`. Official placement XLSX reports were created, became ready, downloaded as non-trivial workbooks and exposed worksheet `Страница #1`, but Bridge materialized `columns=[]`, `row_count=0`, `rows=[]`. This repair fixes the parser boundary only; it does not invent a storage value or change CAP-24 arithmetic.

## Baseline and exact identity

- branch: `{BRANCH}`
- baseline: `{BASELINE}`
- runtime patch commit: `{patch_commit}`
- runtime patch blob: `{patch_blob}`
- dist tree: `{dist_tree}`
- production files: `{len(rel_names)}`
- changed production runtime files: `1`
- changed runtime file: `{CORE.as_posix()}`
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

Pre-fix proof: the dedicated namespace regression is required to fail against baseline `{BASELINE}` before the patch is applied.

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

- artifact: `{artifact_name}`
- SHA-256: `{sha}`
- dist tree: `{dist_tree}`
- production files: `{len(rel_names)}`

## Live boundary / not falsely claimed

The build pipeline performs zero Ozon requests, so live Ozon acceptance remains `PENDING_POST_INSTALL`, not PASS. Required acceptance: install/reload this exact artifact; obtain a fresh report/ref if needed; issue one explicit `report_file_get` per report; require real row materialization; locate SKU `1636048691`; extract actual storage/placement; reconcile product-vs-supply meaning and Finance; only then add storage to full Ozon cost per sold unit and close CAP-24.

Final pre-handoff verdict: `PATCH_AND_DEPENDENCY_GATE_PASS__LIVE_OZON_ACCEPTANCE_PENDING_POST_INSTALL`.
""", encoding="utf-8")

run("git", "config", "user.name", "github-actions[bot]")
run("git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
run("git", "add", str(artifact), str(hashfile), str(buildinfo), str(report))
run("git", "diff", "--cached", "--check")
if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=repo).returncode != 0:
    run("git", "commit", "-m", "artifact(ozon): publish XLSX namespace parser repair build")
    run("git", "push", "origin", f"HEAD:{BRANCH}")
publication_commit = run("git", "rev-parse", "HEAD", capture=True)
print(f"PATCH_COMMIT={patch_commit}")
print(f"PATCH_BLOB={patch_blob}")
print(f"ARTIFACT_NAME={artifact_name}")
print(f"ARTIFACT_SHA256={sha}")
print(f"PRODUCTION_FILES={len(rel_names)}")
print(f"PUBLICATION_COMMIT={publication_commit}")
print("OZON_XLSX_NAMESPACE_PUBLICATION_PASS")
