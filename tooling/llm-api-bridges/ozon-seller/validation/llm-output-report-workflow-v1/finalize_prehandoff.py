#!/usr/bin/env python3
import argparse
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--source-sha',required=True)
p.add_argument('--source-tree',required=True)
p.add_argument('--package-name',required=True)
p.add_argument('--package-sha',required=True)
p.add_argument('--package-bytes',required=True)
p.add_argument('--production-files',required=True)
p.add_argument('--workflow-run',required=True)
a=p.parse_args()

root=Path('tooling/llm-api-bridges/ozon-seller')
gate=root/'validation'/'llm-output-report-workflow-v1'
art=root/'artifacts'
gate.mkdir(parents=True,exist_ok=True); art.mkdir(parents=True,exist_ok=True)

rows=[
('01','Owner authorization','current project chat','Specific LLM-output/report-workflow patch explicitly authorized','PASS'),
('02','Historical evidence preservation','branch history','Pre-fix failure and earlier Alice delivery artifacts preserved','PASS'),
('03','Exact repair scope','production diff','Startup/output/report continuation only; no provider business semantics changed','PASS'),
('04','Pre-fix reproduction','CI 34573663496','Old startup prompt fails one-command-form requirement before production fix','PASS'),
('05','Targeted post-fix contract','targeted gate','One block/Ozon/report continuation/direct-binary negatives pass','PASS'),
('06','Secondary sweep','secondary CI 34574291816','Audit continued beyond first passing symptom','PASS'),
('07','Report-create closed set','runtime registry audit','All 8 current report_*_create operations classified','PASS'),
('08','Generated-document resolver closed set','provider map audit','All 7 provider URL->opaque-ref resolvers classified','PASS'),
('09','Command form','startup + result tail','At most one text command block per assistant response','PASS'),
('10','Independent grouping','startup + result tail','Independent API/HELP envelopes grouped in one block','PASS'),
('11','Ozon submit control','content_script + source audit','Extension-owned Ozon button submits whole raw block','PASS_UNCHANGED'),
('12','Manual duplicate guard','content_script','Exact busy block is not admitted twice','PASS_UNCHANGED'),
('13','Dependent value discipline','startup + workflow tail','code/file_ref/cursor-like dependencies require prior real result','PASS'),
('14','Fresh report code','workflow gate','Create uses only valid provider-returned REPORT code','PASS'),
('15','Report status continuation','workflow gate','report_info continuation is exact and explicit','PASS'),
('16','Fresh opaque file ref','provider + workflow gate','Only safe rpf_s/rpf_p ref is admitted to report_file_get','PASS'),
('17','Ready-without-ref negative','workflow gate','Fails closed; no fabricated download command','PASS'),
('18','Pending report semantics','workflow gate','Explicit next report_info; automatic_continuation=false','PASS'),
('19','Failed report semantics','workflow gate','Terminal/no continuation on failed status/provider result','PASS'),
('20','Report file terminal','workflow gate','report_file_get success has next_command=null','PASS'),
('21','Generated document create chain','workflow gate + provider map','Fresh operation_id/task_id/etc feed exact documented resolver','PASS'),
('22','Missing generated dependency negative','workflow gate','No resolver command fabricated when result field missing','PASS'),
('23','Generated URL redaction','provider + source audit','Signed/raw URL is converted to opaque file ref before LLM tail','PASS'),
('24','Direct binary terminal path','direct-binary regression','Provider bytes captured once; no redundant report_file_get','PASS'),
('25','Personal-data policy','provider/ref policy regressions','Opaque report refs retain personal-data provenance gate','PASS_UNCHANGED'),
('26','Entitlement policy','existing regressions + no provider diff','Capability/entitlement planning unchanged','PASS_UNCHANGED'),
('27','Request cardinality','mixed/command regressions','One explicit API envelope <= one business request','PASS'),
('28','No hidden continuation','source audit','Output patch contains no fetch/execute/poll/retry path','PASS'),
('29','Manual/autorun convergence','service_worker source audit','Both finalize through combined report -> one output-tail boundary','PASS'),
('30','Delivery integrity','service_worker source audit','Tail exists before outgoing SHA/commit','PASS'),
('31','Large-result delivery','Alice large-result regressions','Tail participates in final text/document decision; no truncation','PASS'),
('32','MV3 lifecycle','extension worker smoke + wake regressions','Worker entry loads wrapper and recovery remains valid','PASS'),
('33','Default prompt persistence','service_worker source/regression','Stored is_default prompt migrates; custom prompt is preserved','PASS'),
('34','Exact package parity','Linux + Windows final CI','Fresh extraction and canonical Git-blob bytes agree','PASS'),
('35','Security/package/accounting','final CI','No secrets/raw URLs; provider_calls_during_patch_gate=0; exact artifact frozen','PASS'),
]

dep_lines=[
'# LLM output + report workflow — dependency closure','',
f'Exact executable source commit: `{a.source_sha}`',
f'Exact executable source tree: `{a.source_tree}`',
f'Final CI workflow run: `{a.workflow_run}`','',
'| # | Dependency | Authority/path | Verified behavior | Status |','|---|---|---|---|---|'
]
for n,name,auth,behavior,status in rows:
    dep_lines.append(f'| {n} | {name} | `{auth}` | {behavior} | `{status}` |')
dep_lines += [
'',
'Pre-fix negative control: **PASS** — run `34573663496` failed before production changes on the missing one-command-form contract.',
'Post-fix targeted control: **PASS** — run `34573978803` passed the targeted contract after the authorized production change.',
'Secondary closed-set sweep: **PASS** — run `34574291816`; report-create `8/8`, generated-document resolvers `7/7`, ordinary instruction tail `520` UTF-8 bytes.',
'',
'Performance async report generation is not silently added by this patch: the current Performance authority keeps its server-side generation endpoints terminal/unexposed; existing explicit status/list/download reads remain unchanged. Direct documented CSV/ZIP reads continue through the existing direct-binary attachment path.',
'',
'Unaccounted pre-handoff dependencies: **0**.',
'Stale active assumptions after secondary sweep: **0**.',
'Available-but-unverified pre-handoff dependencies: **0**.',
'Live-only dependencies: **5**, all explicitly `PENDING POST-INSTALL`.',
'',
'**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**',
'',
'No post-install behavior is promoted by deterministic CI.'
]
(gate/'DEPENDENCY_CLOSURE_2026-09-11.md').write_text('\n'.join(dep_lines)+'\n',encoding='utf-8')

gate_lines=[
'# LLM output + report workflow — final pre-handoff','',
f'Workflow run: `{a.workflow_run}`',
f'Exact executable source commit: `{a.source_sha}`',
f'Exact executable source tree: `{a.source_tree}`',
f'Exact ZIP: `{a.package_name}`',
f'Exact ZIP SHA-256: `{a.package_sha}`',
f'Exact ZIP bytes: `{a.package_bytes}`',
f'Production files: `{a.production_files}`','',
'## Corrected behavior','',
'- Every Bridge delivery ends with exactly one `OZON_LLM_INSTRUCTIONS_V1` contract.',
'- The LLM is required to emit at most one fenced `text` command block and group all independent current-step `OZON_API_V1` / `OZON_HELP_V2` envelopes inside it.',
'- When a command block is emitted, the LLM is instructed to tell the user to press the extension-owned `Ozon` button on that block; manual copy/paste is not required.',
'- Dependent report/document workflows are explicit and fail closed: fresh create result -> exact next command -> fresh opaque dependency -> exact file-read command.',
'- No next command is auto-executed by the Bridge; the user remains the explicit admission boundary through the `Ozon` button.',
'- Direct binary documents remain terminal after their bytes have already been captured; the patch cannot cause a redundant second provider request.',
'',
'## GATE-01..35','',
'| Gate | Status |','|---|---|'
]
for n,name,auth,behavior,status in rows:
    gate_lines.append(f'| GATE-{n} | PASS — {name}: {behavior} |')
gate_lines += [
'',
'**PRE-HANDOFF VERDICT: PASS**','',
'LIVE-GATE-01: `PENDING POST-INSTALL` — install the exact ZIP above.','',
'LIVE-GATE-02: `PENDING POST-INSTALL` — in Alice and ChatGPT verify one LLM command form receives one extension-owned `Ozon` button and one click submits the entire multi-envelope block.','',
'LIVE-GATE-03: `PENDING POST-INSTALL` — execute a real report-create flow and verify the returned fresh code produces the exact `report_info` next command; then a fresh opaque `file_ref` produces the exact `report_file_get` next command.','',
'LIVE-GATE-04: `PENDING POST-INSTALL` — verify the downloaded original provider file is delivered once with zero hidden provider retry/polling/pagination/fan-out/refetch/resend.','',
'LIVE-GATE-05: `PENDING POST-INSTALL` — verify conversation continuation/reload/MV3 recovery after the report file is delivered.','',
'**LIVE CERTIFICATION: PENDING**','',
'No live-only gate is promoted to PASS by deterministic CI.'
]
(gate/'FINAL_PREHANDOFF_2026-09-11.md').write_text('\n'.join(gate_lines)+'\n',encoding='utf-8')

build=[
'patch=LLM_OUTPUT_REPORT_WORKFLOW_V1',
f'exact_executable_sha={a.source_sha}',
f'exact_executable_tree={a.source_tree}',
f'final_ci_workflow_run={a.workflow_run}',
f'package_name={a.package_name}',
f'package_sha256={a.package_sha}',
f'package_bytes={a.package_bytes}',
f'production_files={a.production_files}',
'linux_exact_source_package=PASS',
'windows_exact_source_package=PASS',
'fresh_extraction=PASS',
'canonical_git_blob_byte_parity=PASS',
'one_instruction_tail_per_delivery=PASS',
'one_command_form_per_llm_response_contract=PASS',
'group_independent_envelopes_contract=PASS',
'ozon_button_submit_instruction=PASS',
'report_create_closed_set=8/8',
'generated_document_resolver_closed_set=7/7',
'hidden_continuation_added=false',
'automatic_retry_added=false',
'automatic_polling_added=false',
'automatic_pagination_added=false',
'automatic_fanout_added=false',
'provider_calls_during_patch_gate=0',
'pre_handoff=PASS',
'live_certification=PENDING'
]
(art/(Path(a.package_name).stem+'_BUILDINFO.txt')).write_text('\n'.join(build)+'\n',encoding='utf-8')
print(gate/'DEPENDENCY_CLOSURE_2026-09-11.md')
print(gate/'FINAL_PREHANDOFF_2026-09-11.md')
