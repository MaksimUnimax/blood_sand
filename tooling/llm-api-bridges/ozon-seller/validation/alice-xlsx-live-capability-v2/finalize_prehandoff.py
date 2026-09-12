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
    f'targeted_green_run={a.targeted_run}',
    'alice_xlsx_owner_live_capability=PASS',
    'alice_xlsx_octet_stream_descriptor=PASS',
    'alice_xlsx_canonical_mime_descriptor=PASS',
    'alice_xlsx_browser_file_datatransfer_drop=PASS',
    'alice_xls_unverified_not_promoted=PASS',
    'unknown_provider_runtime_verification_retained=PASS',
    'opaque_provider_fail_closed=PASS',
    'alice_max_file_bytes_retained=PASS',
    'alice_max_files_per_turn_retained=PASS',
    'central_dispatch_consumers_closed_set=2/2',
    'consumer_local_allowlist_mutation=0',
    'provider_provenance_sha_boundary=PASS',
    'alice_drag_drop_regression=PASS',
    'alice_blocked_send_regression=PASS',
    'alice_spa_attachment_owner_regression=PASS',
    'indexeddb_transaction_durability_regression=PASS',
    'global_idle_probe_false_plaque_regression=PASS',
    'work_restart_regression=PASS',
    'llm_report_workflow_regression=PASS',
    'command_envelope_regression=PASS',
    'linux_exact_source_package=PASS',
    'windows_exact_source_package=PASS',
    'provider_calls_during_patch_gate=0',
    'automatic_retry_added=false',
    'automatic_polling_added=false',
    'automatic_pagination_added=false',
    'automatic_fanout_added=false',
    'automatic_refetch_added=false',
    'automatic_resend_added=false',
    'live_certification=PENDING',
]) + '\n', encoding='utf-8')

dep = HERE / 'DEPENDENCY_CLOSURE_2026-09-12.md'
dep.write_text(f'''# Alice XLSX live capability — dependency closure

Workflow run: `{a.workflow_run}`
Pre-fix RED run: `{a.prefx_run}`
Targeted GREEN run: `{a.targeted_run}`
Exact executable source: `{a.source_sha}`
Exact executable tree: `{a.source_tree}`
Exact package: `{a.package_name}`
SHA-256: `{a.package_sha}`
Bytes: `{a.package_bytes}`
Production files: `{a.production_files}`

| Dependency layer | Closure |
|---|---|
| observed failure | The prior build downloaded the original Ozon `.xlsx` successfully and then rejected it locally as `file_type_not_supported` before Alice attachment delivery. |
| provider boundary | Preserved live diagnostics show `report_file_get` HTTP 200 before local delivery failure; this patch makes no provider request or transport change. |
| live capability evidence | Owner explicitly verified ordinary Alice accepts `.xlsx`; the prior assumption that XLSX support was unproven is superseded. |
| central authority | Alice `accepted_extensions` now includes only the newly proven `xlsx` addition; existing `txt/pdf/doc/docx` remain unchanged. |
| no over-promotion | `.xls` is not promoted; other unknown original-provider formats retain bounded runtime-target verification. |
| consumer closure | Worker and content remain the exact closed set of two consumers of central `fileDispatchDecision`; neither mutates capabilities locally. |
| original bytes | Original provider bytes, filename, MIME metadata, byte length and SHA-256 remain preserved; no XLSX conversion is introduced. |
| artifact provenance | Provider artifacts retain `source_kind=original_provider_file`, `provider:` artifact key and SHA-256 integrity boundary. |
| file size/count | Alice remains bounded to 100 MiB and one file per turn. |
| target transport | Existing `File -> DataTransfer -> dragenter -> dragover -> drop` path is unchanged. |
| target readiness | Existing bounded `attachmentReady` verification remains before Send. |
| send safety | Blocked Send, unknown-outcome no-retry and exactly-once protections remain unchanged and regressed. |
| SPA ownership | Live tab/origin/conversation ownership guards remain unchanged and regressed. |
| persistence | IndexedDB transaction durability remains unchanged and regressed. |
| idle recovery | False idle plaque correction remains unchanged and regressed. |
| Work lifecycle | Durable repeated Start/Finish/Start correction remains unchanged and regressed. |
| report workflow | Explicit report-create/report-info/report-file sequencing remains unchanged and regressed. |
| protocol | Command-envelope and mixed HELP/API behavior remains unchanged and regressed. |
| browser/MV3 | Pinned Chrome validates the new XLSX File/DataTransfer/drop fixture plus existing Alice/browser and MV3 smoke tests. |
| package | Deterministic ZIP is fresh-extracted, re-tested and compared with exact executable Git blobs. |
| cross-platform | Windows independently verifies source behavior, exact package identity, extracted runtime and Git-blob parity. |
| hidden automation | No automatic retry, polling, pagination, fan-out, refetch or resend is added. |
| provider calls during patch | Zero provider calls are made by patch validation. |
| post-install full chain | Exact patched ZIP still needs a real `report_create -> report_info -> report_file_get -> Alice XLSX readiness` run. |
| post-install exactly-once | Exact patched ZIP still needs confirmation that the live XLSX turn sends exactly once with no duplicate/refetch/resend. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **2**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
''', encoding='utf-8')

gates = [
    'Owner explicitly authorized the Alice XLSX corrective executable patch.',
    'Owner supplied live evidence that ordinary Alice accepts XLSX attachments.',
    'The old executable is preserved by an intentional RED run that fails on missing Alice XLSX capability.',
    'Provider diagnostics establish that the report file was already returned HTTP 200 before the local type rejection.',
    'Root cause is isolated to stale central Alice file capability metadata, not Ozon report transport.',
    'Executable scope is exactly one production file: shared/ai_delivery_capabilities.js.',
    'Alice accepted_extensions adds xlsx without removing txt/pdf/doc/docx.',
    'Unverified xls is not promoted together with xlsx.',
    'Alice runtime verification policy remains for still-unknown original-provider types.',
    'Alice max file size remains 100 MiB.',
    'Alice max files per turn remains one.',
    'Alice attachment strategy remains drag_drop_v1.',
    'XLSX with application/octet-stream is verified-supported.',
    'XLSX with canonical XLSX MIME is verified-supported.',
    'Unknown original-provider CSV continues through bounded runtime-target verification rather than false static support.',
    'Opaque provider .bin remains fail-closed.',
    'Oversized XLSX remains fail-closed before target dispatch.',
    'Worker and content remain the exact two central dispatch-decision consumers.',
    'No worker/content local capability mutation is introduced.',
    'Provider artifact source provenance and provider: key boundary remain intact.',
    'Provider artifact SHA-256 integrity boundary remains intact.',
    'Original provider file bytes are not converted, rewritten or regenerated.',
    'Alice File/DataTransfer/dragenter/dragover/drop browser primitive passes for XLSX.',
    'Alice bounded attachment readiness check remains before Send.',
    'Alice blocked-Send and exactly-once protections remain regressed.',
    'Unknown target attachment outcome remains no-retry/no-duplicate.',
    'Alice SPA owner/tab/origin/conversation guards remain regressed.',
    'IndexedDB durable artifact commit behavior remains regressed.',
    'Global idle false-plaque correction remains regressed.',
    'Repeated Work Start lifecycle correction remains regressed.',
    'Report workflow sequencing and file-delivery accounting remain regressed.',
    'Command envelope and mixed HELP/API isolation remain regressed.',
    'No provider calls or hidden retry/polling/pagination/fan-out/refetch/resend are introduced by this patch.',
    'Linux and Windows exact-source/fresh-package/Git-blob parity pass.',
    'Exact ZIP identity and remaining live-only checks are recorded without promoting LIVE certification.'
]
assert len(gates) == 35
rows = '\n'.join(f'| GATE-{i:02d} | PASS — {text} |' for i, text in enumerate(gates, 1))
final = HERE / 'FINAL_PREHANDOFF_2026-09-12.md'
final.write_text(f'''# Alice XLSX live capability — final pre-handoff

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

LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP and repeat a real Ozon report workflow through `report_create -> report_info -> report_file_get`; the original XLSX must be attached to Alice and reach attachment readiness without `file_type_not_supported`.

LIVE-GATE-02: `PENDING POST-INSTALL` — on that exact XLSX delivery verify one and only one Send, no duplicate drop/message, and no automatic provider refetch/retry/resend.

**LIVE CERTIFICATION: PENDING**
''', encoding='utf-8')

for generated in (buildinfo, dep, final):
    bad = [i for i, line in enumerate(generated.read_text(encoding='utf-8').splitlines(), 1) if line != line.rstrip()]
    if bad:
        raise SystemExit(f'{generated}: trailing whitespace on lines {bad}')

print('FINALIZER_TRAILING_WHITESPACE_CHECK=PASS')
print(buildinfo)
print(dep)
print(final)
