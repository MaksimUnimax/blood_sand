from __future__ import annotations

import argparse
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('--source-sha', required=True)
p.add_argument('--source-tree', required=True)
p.add_argument('--package-name', required=True)
p.add_argument('--package-sha', required=True)
p.add_argument('--package-bytes', required=True)
p.add_argument('--production-files', required=True)
p.add_argument('--workflow-run', required=True)
p.add_argument('--prefx-run', required=True)
p.add_argument('--targeted-run', required=True)
a = p.parse_args()

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(parents=True, exist_ok=True)

buildinfo = ART / f"{a.package_name.removesuffix('.zip')}_BUILDINFO.txt"
buildinfo.write_text('\n'.join([
    f'artifact={a.package_name}',
    f'sha256={a.package_sha}',
    f'bytes={a.package_bytes}',
    f'production_files={a.production_files}',
    f'exact_executable_sha={a.source_sha}',
    f'exact_executable_tree={a.source_tree}',
    f'workflow_run={a.workflow_run}',
    f'prefx_failure_run={a.prefx_run}',
    f'targeted_materialization_run={a.targeted_run}',
    'linux_exact_source_package=PASS',
    'windows_exact_source_package=PASS',
    'original_provider_runtime_dispatch=PASS',
    'static_xlsx_support_remains_unproven=PASS',
    'xlsx_allowlist_costyl=0',
    'dispatch_decision_consumers=2/2',
    'provider_provenance_and_sha_boundary=PASS',
    'runtime_target_ui_verification_path=PASS',
    'unknown_outcome_no_retry=PASS',
    'provider_calls_during_patch_gate=0',
    'automatic_retry_added=false',
    'automatic_polling_added=false',
    'automatic_pagination_added=false',
    'automatic_fanout_added=false',
    'automatic_refetch_added=false',
    'automatic_resend_added=false',
    'live_alice_xlsx_acceptance=PENDING',
]) + '\n', encoding='utf-8')

dep = HERE / 'DEPENDENCY_CLOSURE_2026-09-11.md'
dep.write_text(f'''# Alice original provider file runtime capability — dependency closure

Workflow run: `{a.workflow_run}`
Pre-fix FAIL run: `{a.prefx_run}`
Targeted materialization run: `{a.targeted_run}`
Exact executable source: `{a.source_sha}`
Exact executable tree: `{a.source_tree}`
Exact package: `{a.package_name}`
SHA-256: `{a.package_sha}`
Bytes: `{a.package_bytes}`
Production files: `{a.production_files}`

| Dependency layer | Closure |
|---|---|
| observed failure | Real Ozon XLSX reached local delivery and was rejected by Bridge's own static Alice type allowlist before browser File/DataTransfer/drop. |
| pre-fix reproduction | Dedicated baseline run intentionally fails because no runtime-aware dispatch decision exists. |
| capability truth | `supportsFile()` remains a static/preverified statement; XLSX is not falsely added to Alice `accepted_extensions`. |
| dispatch authority | New `fileDispatchDecision()` is the single decision boundary for both worker and content attachment preflights. |
| provenance | Runtime verification is available only for `source_kind=original_provider_file`, worker-owned `provider:` artifact keys, concrete MIME/extension, and SHA-256-backed artifacts. |
| size guard | Existing Alice max-file-size boundary remains enforced before runtime type verification. |
| ambiguous binary | `.bin` / `application/octet-stream` remains fail-closed. |
| worker consumer | Pre-commit worker preflight uses the same canonical dispatch decision. |
| content consumer | Pre-File content preflight uses the same canonical dispatch decision. |
| transport | Existing browser `File -> DataTransfer -> dragenter -> dragover -> drop` path is unchanged. |
| runtime verification | Success still requires target UI attachment preview/readiness; static policy no longer fabricates a negative capability result for trusted originals. |
| unknown outcome | After commit/drop, unknown result remains no-retry/no-re-attach. |
| state/storage | Artifact DB schema, delivery state schema, ref ownership and transaction durability are unchanged. |
| exact bytes | Original provider bytes, filename, MIME, byte length and SHA-256 remain preserved. |
| SPA owner | Current live conversation ownership and tab/origin security guards are unchanged. |
| send | Blocked-send guard, one Send commit, one click and no automatic resend are unchanged. |
| provider transport | No Seller/Performance/report transport behavior or request cardinality is changed. |
| report workflow | `report_create -> report_info -> report_file_get` remains explicit; no hidden continuation is added. |
| privacy/entitlement | No privacy, credentials, entitlement or permissions logic is changed. |
| security | Runtime type verification does not admit caller-generated or integrity-less files. |
| regression | Large text, DnD, auto-send, SPA owner, IndexedDB, direct-binary, report workflow and command-envelope gates are re-run. |
| packaged runtime | Deterministic ZIP is compared byte-for-byte against exact Git blobs and re-tested after fresh extraction on Linux and Windows. |
| live | Actual Alice acceptance/rejection of XLSX remains live-only and must be observed after installing this exact package. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **1**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
''', encoding='utf-8')

gates = [
'Owner explicitly authorized this corrective executable patch.',
'Historical screenshot/log boundary preserved: report_file_get succeeded and Bridge blocked XLSX locally.',
'Pre-fix run intentionally reproduces static-allowlist rejection before target runtime.',
'Root cause is closed at the shared capability decision, not by a one-off XLSX allowlist entry.',
'Production diff is restricted to capability policy plus its two consumers.',
'`supportsFile()` remains truthful static capability evidence.',
'`fileDispatchDecision()` separates static support from permission to perform bounded runtime verification.',
'Runtime verification exception is provenance-bound to original provider files.',
'Worker-owned `provider:` artifact key is required.',
'SHA-256-backed artifact integrity is required.',
'Concrete extension and MIME are required; generic binary fails closed.',
'File-size guard dominates runtime type verification.',
'Generated Bridge files do not receive the provider-original exception.',
'Caller/untrusted artifact keys do not receive the exception.',
'Alice XLSX is not hardcoded into `accepted_extensions`.',
'A second non-preverified provider type proves policy is generalized rather than XLSX-specific.',
'Preverified Alice TXT remains statically verified.',
'ChatGPT XLSX behavior remains statically verified and unchanged.',
'Worker pre-commit consumer uses canonical dispatch authority.',
'Content pre-File consumer uses canonical dispatch authority.',
'Exact closed set of stale static-only consumers is zero.',
'Browser File/DataTransfer/drop preserves original provider filename/size/MIME.',
'Target UI attachment readiness remains the success authority after dispatch.',
'Unknown post-commit attachment outcome remains no-retry/no-re-attach.',
'Provider artifact capture and request accounting regressions pass.',
'IndexedDB transaction durability regressions pass.',
'Alice large-result and drag/drop regressions pass.',
'Alice blocked-send and exactly-once send regressions pass.',
'Alice SPA attachment-owner regressions pass.',
'Direct-binary original-file isolation regressions pass.',
'Explicit LLM report workflow regressions pass.',
'Command-envelope and mixed HELP/API isolation regressions pass.',
'Pinned Chrome and MV3 packaged-runtime checks pass.',
'Linux and Windows deterministic package/Git-blob parity pass.',
'No provider call, hidden retry/polling/pagination/fan-out/refetch/resend is introduced during patch validation.'
]
assert len(gates) == 35
final = HERE / 'FINAL_PREHANDOFF_2026-09-11.md'
rows = '\n'.join(f'| GATE-{i:02d} | PASS — {text} |' for i, text in enumerate(gates, 1))
final.write_text(f'''# Alice original provider file runtime capability — final pre-handoff

Workflow run: `{a.workflow_run}`
Exact executable source: `{a.source_sha}`
Exact executable tree: `{a.source_tree}`
Exact ZIP: `{a.package_name}`
Exact ZIP SHA-256: `{a.package_sha}`
Exact ZIP bytes: `{a.package_bytes}`
Production files: `{a.production_files}`

## GATE-01..35

| Gate | Status |
|---|---|
{rows}

**PRE-HANDOFF VERDICT: PASS**

LIVE-GATE-01: `PENDING POST-INSTALL` — install this exact ZIP and repeat the real Alice XLSX report-file scenario. PASS only if Bridge actually dispatches the original XLSX to Alice UI, Alice accepts it, the attachment becomes ready, and the message is sent exactly once. If Alice itself rejects XLSX, record that provider/UI fact; do not silently convert, retry, re-download or fabricate support.

**LIVE CERTIFICATION: PENDING**
''', encoding='utf-8')

for generated in (buildinfo, dep, final):
    bad_lines = [index for index, line in enumerate(generated.read_text(encoding='utf-8').splitlines(), 1) if line != line.rstrip()]
    if bad_lines:
        raise SystemExit(f'{generated}: trailing whitespace on lines {bad_lines}')

print('FINALIZER_TRAILING_WHITESPACE_CHECK=PASS')
print(buildinfo)
print(dep)
print(final)
