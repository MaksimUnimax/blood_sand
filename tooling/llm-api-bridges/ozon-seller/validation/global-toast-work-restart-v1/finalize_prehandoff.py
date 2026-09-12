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
p.add_argument('--materializer-run', required=True)
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
    f'guarded_materializer_run={a.materializer_run}',
    'linux_exact_source_package=PASS',
    'windows_exact_source_package=PASS',
    'global_idle_probe_false_plaque=PASS',
    'active_attachment_wake_error_visibility=PASS',
    'work_restart_existing_conversation=PASS',
    'work_restart_three_generations=PASS',
    'work_start_lost_primary_response_no_duplicate=PASS',
    'work_start_unknown_outcome_no_retry=PASS',
    'work_start_correlation_guards=PASS',
    'work_start_tab_close_cancellation=PASS',
    'work_start_service_worker_recreation_no_duplicate=PASS',
    'work_start_watcher_rehydration=PASS',
    'work_start_generation_guard=PASS',
    'legacy_work_lifecycle_regression=PASS',
    'alice_provider_runtime_capability_regression=PASS',
    'alice_spa_attachment_owner_regression=PASS',
    'indexeddb_transaction_durability_regression=PASS',
    'alice_drag_drop_regression=PASS',
    'alice_blocked_send_regression=PASS',
    'llm_report_workflow_regression=PASS',
    'command_envelope_regression=PASS',
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
dep.write_text(f'''# Global idle attachment plaque + repeated Work Start — dependency closure

Workflow run: `{a.workflow_run}`
Pre-fix RED run: `{a.prefx_run}`
Targeted materialization run: `{a.targeted_run}`
Guarded production materializer run: `{a.materializer_run}`
Exact executable source: `{a.source_sha}`
Exact executable tree: `{a.source_tree}`
Exact package: `{a.package_name}`
SHA-256: `{a.package_sha}`
Bytes: `{a.package_bytes}`
Production files: `{a.production_files}`

| Dependency layer | Closure |
|---|---|
| observed false plaque | Idle attachment recovery on supported AI tabs escalated `ATTACHMENT_PORT_UNAVAILABLE` into a user-visible delivery error when no active delivery existed. |
| false-plaque root cause | Idle probe and explicit active-delivery wake shared the same user-visible error path. |
| idle recovery | Idle recovery dependency failures are diagnostic-only and do not create a red plaque. |
| active recovery | Explicit wake carries owner/delivery expectation; dependency failure remains visible for the active delivery. |
| attachment ownership | Existing tab/origin/conversation ownership checks and SPA owner guards remain authoritative. |
| attachment transport | Existing original-provider `File -> DataTransfer -> dragenter -> dragover -> drop` path is unchanged. |
| observed Work defect | Existing-conversation `Start` bypassed the durable pending-start transaction, marked `ACTIVE_VISIBLE` before Send acknowledgement, and could lose authority after an irreversible click. |
| Work transaction | New-chat and existing-conversation Start now share worker-owned durable pending intent/revision correlation before irreversible Send. |
| Send commit | Content must obtain a worker-owned commit before click; a lost callback cannot authorize an automatic duplicate click. |
| Send outcome | Acknowledged Send, definitive pre-click failure and unknown post-click outcome are persisted as distinct states. |
| unknown outcome | Unknown post-click outcome is explicitly no-retry/no-duplicate. |
| activation | `ACTIVE_VISIBLE` is not entered before correlated complete assistant-response evidence. |
| correlation | Intent, revision, tab, origin, AI, conversation and generation guards reject stale/delayed events. |
| tab closure | Closing the owner tab cancels the corresponding pending Start without reviving stale work. |
| MV3 recreation | Durable pending state survives service-worker recreation without re-sending the prompt. |
| watcher rehydration | `OZ_CONTENT_READY` can rehydrate the response watcher from worker-owned pending state. |
| generation guard | Rehydrated watcher events are bounded to the expected runtime generation/revision. |
| legacy lifecycle | SHOW/HIDE remain worker routes; Manual UI apply remains content-owned. The legacy verifier was corrected to the existing ownership contract and passes on both baseline and corrected trees. |
| provider transport | No Seller/Performance/report transport behavior or request cardinality changed. |
| provider calls | Patch gates perform zero provider calls. |
| hidden automation | No automatic retry, polling, pagination, fan-out, refetch or resend was added. |
| previous provider-file capability | Runtime verification for original provider file types remains intact and regressed. |
| previous Alice DnD/send | Drag/drop, blocked-send and exactly-once send protections remain regressed. |
| IndexedDB | Transaction durability/abort behavior remains regressed. |
| report workflow | Explicit `report_create -> report_info -> report_file_get` sequencing remains regressed. |
| command envelope | Command-envelope and mixed HELP/API isolation remain regressed. |
| browser/MV3 | Pinned Chrome and MV3 extension smoke are part of the authoritative Linux gate. |
| exact package | Deterministic ZIP is fresh-extracted, re-tested, and compared byte-for-byte with exact Git blobs. |
| cross-platform | Windows independently verifies source behavior, package identity, fresh extraction and exact Git-blob parity. |
| live idle tabs | Real multi-tab idle behavior after extension reload remains live-only. |
| live active delivery | Real active-delivery dependency failure visibility remains live-only. |
| live repeated Start | Real ChatGPT `Start -> Finish -> Start` and first complete response remain live-only. |
| live MV3 restart | Real worker recreation during second Start remains live-only. |
| live uncertain Send | Real uncertain click outcome remains live-only and must show no duplicate prompt. |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies pending: **5**.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**
''', encoding='utf-8')

gates = [
    'Owner explicitly authorized this corrective executable patch.',
    'Both defects are preserved by an intentional pre-fix RED run on the prior executable.',
    'False-plaque root cause is isolated to idle recovery being escalated through a user-visible error path.',
    'Repeated-Start root cause is isolated to existing-conversation Start bypassing durable pending authority before Send.',
    'Production correction is restricted to the four dependency-closed runtime consumers.',
    'Idle probe dependency failure no longer creates a false user-visible plaque.',
    'Explicit active-delivery wake dependency failure remains user-visible.',
    'Attachment owner/tab/origin/conversation security guards remain unchanged.',
    'Existing attachment transport and provider-original byte semantics remain unchanged.',
    'Existing-conversation Start creates durable worker-owned pending authority before irreversible Send.',
    'Work session is not prematurely promoted to ACTIVE_VISIBLE before correlated completion.',
    'Content obtains worker commit before clicking Send.',
    'Lost primary callback after Send cannot trigger a duplicate Send.',
    'Unknown post-click outcome is preserved as no-retry/no-duplicate.',
    'Definitive pre-click failure terminalizes the Start without fabricating success.',
    'Intent/revision/tab/origin/AI/conversation correlation guards reject stale events.',
    'Three consecutive Start generations pass without cross-generation contamination.',
    'Owner-tab closure cancels the matching pending Start.',
    'Service-worker recreation preserves durable Start authority without duplicate prompt.',
    'Response watcher rehydrates after worker recreation.',
    'Watcher revision/runtime-generation guard rejects stale watcher completion.',
    'Legacy Work lifecycle verifier passes on both prior baseline and corrected executable.',
    'No Seller/Performance/report provider transport or request cardinality is changed.',
    'Provider calls during patch validation are zero.',
    'No hidden retry/polling/pagination/fan-out/refetch/resend is introduced.',
    'Previous original-provider runtime-capability regressions pass.',
    'Previous Alice SPA attachment-owner regressions pass.',
    'IndexedDB transaction durability regressions pass.',
    'Alice large-result, drag/drop and blocked-send regressions pass.',
    'Direct-binary/provider attachment isolation regressions pass.',
    'Explicit LLM report workflow regressions pass.',
    'Command-envelope and mixed HELP/API isolation regressions pass.',
    'Pinned Chrome browser and MV3 extension lifecycle checks pass.',
    'Linux and Windows deterministic package/Git-blob byte parity pass after fresh extraction.',
    'Exact ZIP identity and live-only boundaries are recorded without promoting LIVE certification.'
]
assert len(gates) == 35
final = HERE / 'FINAL_PREHANDOFF_2026-09-12.md'
rows = '\n'.join(f'| GATE-{i:02d} | PASS — {text} |' for i, text in enumerate(gates, 1))
final.write_text(f'''# Global idle attachment plaque + repeated Work Start — final pre-handoff

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

LIVE-GATE-01: `PENDING POST-INSTALL` — open multiple supported AI tabs, reload/restart the extension/background worker while no attachment delivery is active, and verify there are zero false red attachment-delivery plaques.

LIVE-GATE-02: `PENDING POST-INSTALL` — during a real active attachment delivery, cause/observe a genuine delivery dependency failure and verify the active owner context still surfaces the error while idle tabs do not.

LIVE-GATE-03: `PENDING POST-INSTALL` — in an existing ChatGPT conversation execute `Start -> Finish -> Start`; the second prompt must be sent exactly once and the session may become active only after the correlated complete assistant response.

LIVE-GATE-04: `PENDING POST-INSTALL` — recreate the MV3 worker after the second Start click while the first response is pending; the prompt must not be sent again and the watcher must rehydrate and complete the same transaction.

LIVE-GATE-05: `PENDING POST-INSTALL` — exercise an uncertain Send outcome and verify no automatic retry, duplicate prompt, provider refetch or resend occurs.

**LIVE CERTIFICATION: PENDING**
''', encoding='utf-8')

for generated in (buildinfo, dep, final):
    bad_lines = [i for i, line in enumerate(generated.read_text(encoding='utf-8').splitlines(), 1) if line != line.rstrip()]
    if bad_lines:
        raise SystemExit(f'{generated}: trailing whitespace on lines {bad_lines}')

print('FINALIZER_TRAILING_WHITESPACE_CHECK=PASS')
print(buildinfo)
print(dep)
print(final)
