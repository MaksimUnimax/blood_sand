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
PROJECT = Path("tooling/llm-api-bridges/ozon-seller")
DIST = PROJECT / "dist-step7-candidate"
VALIDATION = PROJECT / "validation/read-effect-repair-v1"
CORE = DIST / "shared/provider_transport_core.js"
PATCHER = VALIDATION / "apply_report_xlsx_live_structure_diagnostics_2026-09-07.py"
REG = VALIDATION / "run_report_xlsx_live_structure_diagnostics_regression_2026-09-07.mjs"
NS_REG = VALIDATION / "run_report_xlsx_namespace_parser_regression_2026-09-07.mjs"
REL_REG = VALIDATION / "run_report_xlsx_relationship_target_regression_2026-09-06.mjs"
BRANCH = os.environ.get("GITHUB_REF_NAME", "diag/ozon-xlsx-live-zero-rows-2026-09-07")


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
run("node", str(VALIDATION / "run_ai_readable_report_parser_gate.mjs"), ".")
run("node", str(VALIDATION / "run_report_file_lifecycle_gate.mjs"), ".")
run("node", str(VALIDATION / "run_report_file_session_fail_closed_gate.mjs"), ".")
run("node", str(VALIDATION / "run_report_file_workflow_gate.mjs"), ".")
for gate in sorted(VALIDATION.glob("run_*.mjs")):
    run("node", str(gate), ".")
print("OZON_XLSX_LIVE_DIAGNOSTIC_FULL_RUN_GATE_FAMILY_PASS")

changed_runtime = run("git", "diff", "--name-only", BASELINE, "--", str(DIST), capture=True).splitlines()
if changed_runtime != [CORE.as_posix()]:
    raise SystemExit(f"UNEXPECTED_RUNTIME_DELTA: {changed_runtime}")
for unchanged in [DIST / "shared/ozon_provider.js", DIST / "shared/ozon_contract.js", DIST / "shared/ozon_operation_registry.js", DIST / "service_worker.js", DIST / "manifest.json"]:
    run("git", "diff", "--exit-code", BASELINE, "--", str(unchanged))
project_delta = run("git", "diff", "--name-only", BASELINE, "--", str(PROJECT), capture=True).splitlines()
for name in project_delta:
    if Path(name).name in {"package.json", "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml"}:
        raise SystemExit(f"UNEXPECTED_PACKAGE_DEPENDENCY_CHANGE: {name}")
print("OZON_XLSX_LIVE_DIAGNOSTIC_NO_PACKAGE_DEPENDENCY_CHANGE_PASS")

run("git", "config", "user.name", "github-actions[bot]")
run("git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
if subprocess.run(["git", "diff", "--quiet", "--", str(CORE)], cwd=repo).returncode != 0:
    run("git", "add", str(CORE))
    run("git", "diff", "--cached", "--check")
    run("git", "commit", "-m", "diag(ozon): expose payload-free XLSX zero-row structure counts")
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
artifact_name = f"OZON_BRIDGE_v0.1.19_XLSX_LIVE_DIAGNOSTIC_{short}.zip"
buildinfo_name = f"OZON_BRIDGE_v0.1.19_XLSX_LIVE_DIAGNOSTIC_{short}_BUILDINFO.txt"
art_dir = PROJECT / "artifacts"
art_dir.mkdir(parents=True, exist_ok=True)
artifact = art_dir / artifact_name
hashfile = art_dir / f"{artifact_name}.sha256.txt"
buildinfo = art_dir / buildinfo_name
report = PROJECT / "research/product/OZON_REPORT_XLSX_LIVE_ZERO_ROWS_DIAGNOSTIC_2026-09-07.md"
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
    if actual != rel_names: raise SystemExit("ARTIFACT_MEMBER_SET_MISMATCH")
    for rel in rel_names:
        if z.read(rel) != git_show(patch_commit, DIST / rel):
            raise SystemExit(f"ARTIFACT_BYTE_MISMATCH: {rel}")
print("OZON_XLSX_LIVE_DIAGNOSTIC_ARTIFACT_MEMBER_SET_PASS")
print("OZON_XLSX_LIVE_DIAGNOSTIC_ARTIFACT_CANONICAL_BYTE_COHERENCE_PASS")

fresh = Path("/tmp/ozon-xlsx-live-diagnostic-fresh")
shutil.rmtree(fresh, ignore_errors=True)
(fresh / DIST).mkdir(parents=True, exist_ok=True)
with ZipFile(artifact) as z: z.extractall(fresh / DIST)
run("node", str(REG), str(fresh))
run("node", str(NS_REG), str(fresh))
run("node", str(REL_REG), str(fresh))
run("node", str(VALIDATION / "run_ai_readable_report_parser_gate.mjs"), str(fresh))
print("OZON_XLSX_LIVE_DIAGNOSTIC_FRESH_EXTRACT_PASS")

sha = hashlib.sha256(artifact.read_bytes()).hexdigest()
hashfile.write_text(f"{sha}  {artifact_name}\n", encoding="utf-8")
buildinfo.write_text(f"""build_kind=xlsx_live_zero_rows_payload_free_structure_diagnostic
source_branch={BRANCH}
baseline_commit={BASELINE}
runtime_patch_commit={patch_commit}
runtime_patch_blob={patch_blob}
dist_tree={dist_tree}
production_files={len(rel_names)}
artifact_name={artifact_name}
artifact_sha256={sha}
validation=ubuntu_and_windows_full_run_gate_family_pass
diagnostic_regression=pass
namespace_regression=pass
relationship_regression=pass
fresh_extract_byte_coherence=pass
package_dependency_changes=0
production_runtime_files_changed=1
provider_requests=0
previous_namespace_build_live_acceptance=fail_zero_rows
root_cause=unproven
live_diagnostic=pending_post_install
""", encoding="utf-8")

report.write_text(f"""# Ozon Bridge — XLSX live zero-row diagnostic milestone

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

- branch: `{BRANCH}`
- baseline: `{BASELINE}`
- runtime diagnostic commit: `{patch_commit}`
- runtime diagnostic blob: `{patch_blob}`
- dist tree: `{dist_tree}`
- production files: `{len(rel_names)}`
- changed production runtime files: `1`
- changed runtime file: `{CORE.as_posix()}`
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

- artifact: `{artifact_name}`
- SHA-256: `{sha}`
- dist tree: `{dist_tree}`
- production files: `{len(rel_names)}`

## Required live diagnostic

Install/reload this exact diagnostic artifact. Because previous opaque refs may expire, create a fresh product placement report for `2026-08-01..2026-08-31`, wait via explicit `report_info`, obtain a fresh `report_file_ref`, then issue exactly one explicit `report_file_get`. If the sheet still materializes empty, capture `xlsx_structure_diagnostics` from that same result. That object will distinguish at least: no worksheet rows, parser-vs-lexical tag mismatch, cells present without `r`, values/text/formulas without supported cell materialization, or another structural boundary.

Only after that evidence is obtained may a new root-cause parser repair be authored and subjected to the complete patch/dependency/build/live acceptance cycle.

Final verdict: `DIAGNOSTIC_BUILD_PREHANDOFF_PASS__ROOT_CAUSE_UNPROVEN__LIVE_DIAGNOSTIC_PENDING_POST_INSTALL`.
""", encoding="utf-8")

run("git", "add", str(artifact), str(hashfile), str(buildinfo), str(report))
run("git", "diff", "--cached", "--check")
if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=repo).returncode != 0:
    run("git", "commit", "-m", "build(ozon): publish XLSX live diagnostic artifact and closure report")
    run("git", "push", "origin", f"HEAD:{BRANCH}")

print(f"OZON_XLSX_LIVE_DIAGNOSTIC_PATCH_COMMIT={patch_commit}")
print(f"OZON_XLSX_LIVE_DIAGNOSTIC_PATCH_BLOB={patch_blob}")
print(f"OZON_XLSX_LIVE_DIAGNOSTIC_DIST_TREE={dist_tree}")
print(f"OZON_XLSX_LIVE_DIAGNOSTIC_PRODUCTION_FILES={len(rel_names)}")
print(f"OZON_XLSX_LIVE_DIAGNOSTIC_ARTIFACT={artifact.as_posix()}")
print(f"OZON_XLSX_LIVE_DIAGNOSTIC_SHA256={sha}")
print("OZON_XLSX_LIVE_DIAGNOSTIC_PREHANDOFF_PASS__LIVE_PENDING")
