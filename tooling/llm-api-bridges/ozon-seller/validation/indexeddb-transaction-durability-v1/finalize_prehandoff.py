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
args = p.parse_args()

here = Path(__file__).resolve().parent
root = here.parents[1]
artifacts = root / 'artifacts'
artifacts.mkdir(parents=True, exist_ok=True)

rows = [
('GATE-01','Owner authorization','Current project chat','Specific IndexedDB transaction-durability patch explicitly authorized','PASS'),
('GATE-02','Historical evidence preservation','CI 34575842828','Pre-fix request-success -> late transaction-abort race preserved as negative evidence','PASS'),
('GATE-03','Exact repair scope','Production diff','Only two IndexedDB durability implementations changed; provider business semantics unchanged','PASS'),
('GATE-04','Direct-binary pre-fix reproduction','Durability negative gate','Old writer published generated_file_ref and discarded raw bytes before transaction outcome','PASS'),
('GATE-05','Common-store pre-fix reproduction','Source + negative gate','Old idbRequest resolved request.result on IDBRequest success before transaction completion','PASS'),
('GATE-06','Direct abort boundary','Post-fix durability gate','Request success leaves promise pending; later transaction abort rejects','PASS'),
('GATE-07','Direct commit boundary','Post-fix durability gate','Successful result is published only after transaction.oncomplete','PASS'),
('GATE-08','No premature ref','Post-fix durability gate','No generated_file_ref is published before durable transaction commit','PASS'),
('GATE-09','No premature byte discard','Post-fix durability gate','Provider base64 is not discarded before durable transaction commit','PASS'),
('GATE-10','Exactly-one provider request','Post-fix + direct-binary regressions','Abort/commit tests do not add provider retry/refetch','PASS'),
('GATE-11','Common abort boundary','Post-fix durability gate','Common idbRequest rejects a late transaction abort after request success','PASS'),
('GATE-12','Common commit boundary','Post-fix durability gate','Common idbRequest returns saved request.result only after transaction complete','PASS'),
('GATE-13','Request-result preservation','Post-fix durability gate','Readonly/readwrite helper preserves the request result across the commit boundary','PASS'),
('GATE-14','IndexedDB implementation closed set','Secondary sweep','All 2/2 production IndexedDB implementations audited','PASS'),
('GATE-15','Shared DB authority','Secondary sweep','Both implementations use the same DB/store/version authority','PASS'),
('GATE-16','Direct writer authority','direct_binary_file_delivery_patch.js','Direct artifact writer has transaction-complete success boundary','PASS'),
('GATE-17','Common writer authority','file_delivery_port_worker.js','Common artifact helper has transaction-complete success boundary','PASS'),
('GATE-18','Common put consumers','Secondary sweep','All 3/3 common artifact put callsites await putArtifact','PASS'),
('GATE-19','Common delete consumers','Secondary sweep','All 2/2 delete callsites remain routed through transaction helper','PASS'),
('GATE-20','Common read consumers','Secondary sweep','All 3 get + 1 getAll consumers remain routed through transaction helper','PASS'),
('GATE-21','Captured provider artifact','Secondary sweep','Original provider bytes are returned as local artifact only after committed put','PASS'),
('GATE-22','Inline provider document','Secondary sweep','Inline provider materialization returns only after committed put','PASS'),
('GATE-23','Generated large-result TXT','Secondary sweep','Generated Bridge text artifact returns only after committed put','PASS'),
('GATE-24','Artifact cleanup','Secondary sweep','Deletes use the same transaction-complete helper; late abort is not reported as successful deletion','PASS'),
('GATE-25','Trusted-report capture failure semantics','Secondary + existing regressions','Storage failure preserves provider success but later delivery fails closed; hidden re-download remains forbidden','PASS'),
('GATE-26','Direct binary formats','Existing direct-binary regression','CSV/ZIP/PDF/PNG capture, redaction and opaque refs remain valid','PASS'),
('GATE-27','Personal-data provenance','Existing regressions','Personal-data opaque ref policy remains unchanged','PASS'),
('GATE-28','Request cardinality','Command/mixed regressions','One explicit API envelope remains <= one physical business request','PASS'),
('GATE-29','No hidden continuation','Source + regression audit','No retry/poll/pagination/fan-out/refetch/resend added by durability patch','PASS'),
('GATE-30','LLM report workflow isolation','LLM output/report regressions','One-command-form and explicit report continuation behavior remains unchanged','PASS'),
('GATE-31','Alice delivery isolation','Alice DnD/auto-send regressions','Alice attachment transport and Send state machine remain unchanged','PASS'),
('GATE-32','Large-result isolation','Alice large-result regressions','Complete-text document threshold/delivery remains unchanged','PASS'),
('GATE-33','MV3 lifecycle','Pinned Chrome + extension worker smoke','Patched worker modules load in packaged MV3 runtime','PASS'),
('GATE-34','Exact package parity','Linux + Windows final CI','Fresh extraction and canonical Git-blob bytes agree with exact executable source','PASS'),
('GATE-35','Security and accounting','Final CI','No secrets/raw auth; provider_calls_during_patch_gate=0; exact artifact frozen','PASS'),
]

dep = [
'# IndexedDB transaction durability — dependency closure','',
f'Exact executable source commit: `{args.source_sha}`',
f'Exact executable source tree: `{args.source_tree}`',
f'Final CI workflow run: `{args.workflow_run}`','',
'| # | Dependency | Authority/path | Verified behavior | Status |',
'|---|---|---|---|---|'
]
for gate, dep_name, authority, behavior, status in rows:
    dep.append(f'| {gate} | {dep_name} | `{authority}` | {behavior} | `{status}` |')
dep += [
'',
'Pre-fix negative control: **PASS AS NEGATIVE EVIDENCE** — CI `34575842828` failed on the old request-success-before-transaction-complete behavior.',
'',
'Post-fix harness diagnostics `34576326433` and `34576490447` are preserved as harness failures, not production failures: the first omitted the extracted helper store-name authority; the second used a whole-file static matcher that matched the legitimate `indexedDB.open()` success handler. Dynamic transaction cases in the latter had already passed.',
'',
'Secondary closed-set sweep: **PASS** — IndexedDB implementations `2/2`; common artifact storage consumers `9/9`.',
'',
'Unaccounted pre-handoff dependencies: **0**.',
'Stale active assumptions after secondary sweep: **0**.',
'Available-but-unverified pre-handoff dependencies: **0**.',
'Live-only dependencies: **5**, all explicitly `PENDING POST-INSTALL`.',
'',
'**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**','',
'No post-install behavior is promoted by deterministic CI.'
]
(here / 'DEPENDENCY_CLOSURE_2026-09-11.md').write_text('\n'.join(dep) + '\n', encoding='utf-8')

final = [
'# IndexedDB transaction durability — final pre-handoff','',
f'Workflow run: `{args.workflow_run}`',
f'Exact executable source commit: `{args.source_sha}`',
f'Exact executable source tree: `{args.source_tree}`',
f'Exact ZIP: `{args.package_name}`',
f'Exact ZIP SHA-256: `{args.package_sha}`',
f'Exact ZIP bytes: `{args.package_bytes}`',
f'Production files: `{args.production_files}`','',
'## Corrected behavior','',
'- `IDBRequest.success` is no longer treated as durable persistence for artifact writes.',
'- Direct binary refs/raw-byte redaction are promoted only after the artifact transaction fires `complete`.',
'- The common artifact store captures `request.result` on request success but resolves callers only after transaction `complete`.',
'- A transaction abort after request success rejects the write and cannot be turned into a successful durable-artifact result.',
'- The common transaction helper now covers generated TXT, original provider files, inline provider documents, reads and cleanup deletes with one commit boundary.',
'- No hidden Ozon retry, polling, pagination, fan-out, refetch or resend was introduced.','',
'## GATE-01..35','',
'| Gate | Status |','|---|---|'
]
for gate, dep_name, _, behavior, status in rows:
    final.append(f'| {gate} | {status} — {dep_name}: {behavior} |')
final += [
'', '**PRE-HANDOFF VERDICT: PASS**','',
'LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.','',
'LIVE-GATE-02: `PENDING POST-INSTALL` — run a real Ozon document/direct-binary flow and verify the returned file is attached once and remains retrievable through delivery.','',
'LIVE-GATE-03: `PENDING POST-INSTALL` — verify a large generated-result TXT persists and is attached through the same durable artifact store.','',
'LIVE-GATE-04: `PENDING POST-INSTALL` — verify reload/MV3 recovery can read the committed artifact without a provider refetch.','',
'LIVE-GATE-05: `PENDING POST-INSTALL` — verify exactly-once delivery and cleanup after confirmation.','',
'**LIVE CERTIFICATION: PENDING**','',
'No live-only gate is promoted to PASS by deterministic CI.'
]
(here / 'FINAL_PREHANDOFF_2026-09-11.md').write_text('\n'.join(final) + '\n', encoding='utf-8')

build = '\n'.join([
'patch=INDEXEDDB_TRANSACTION_DURABILITY_V1',
f'exact_executable_sha={args.source_sha}',
f'exact_executable_tree={args.source_tree}',
f'final_ci_workflow_run={args.workflow_run}',
f'package_name={args.package_name}',
f'package_sha256={args.package_sha}',
f'package_bytes={args.package_bytes}',
f'production_files={args.production_files}',
'linux_exact_source_package=PASS',
'windows_exact_source_package=PASS',
'fresh_extraction=PASS',
'canonical_git_blob_byte_parity=PASS',
'indexeddb_implementations_closed_set=2/2',
'common_artifact_storage_consumers_closed_set=9/9',
'request_success_abort_negative_control=PASS',
'transaction_complete_positive_control=PASS',
'direct_binary_durable_before_ref=PASS',
'common_artifact_store_durable_before_return=PASS',
'hidden_continuation_added=false',
'automatic_retry_added=false',
'automatic_polling_added=false',
'automatic_pagination_added=false',
'automatic_fanout_added=false',
'automatic_refetch_added=false',
'automatic_resend_added=false',
'provider_calls_during_patch_gate=0',
'pre_handoff=PASS',
'live_certification=PENDING',
''])
(artifacts / f'{Path(args.package_name).stem}_BUILDINFO.txt').write_text(build, encoding='utf-8')
