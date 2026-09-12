"""Fail-stop finalizer for expiry + report XLSX attachment type + closable attachment status."""
from pathlib import Path
import hashlib,json,os,re,subprocess,zipfile
ROOT=Path('tooling/llm-api-bridges/ozon-seller')
GATE=ROOT/'validation/report-file-expiry-v1'
COMBINED=ROOT/'validation/report-file-attachment-mime-ui-v1'
NAME='OZON_BRIDGE_v0.1.19_REPORT_XLSX_ALICE_UI_20260912.zip'
INPUTS=Path(os.environ['RUNNER_TEMP'])/'all-combined-evidence'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda b:hashlib.sha256(b).hexdigest()
frozen=read(GATE/'EXECUTABLE.json')
assert frozen['executable']=='aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3'
assert frozen['tree']=='550e5881534563f7482b49eca6cb20517bed73f8'
assert frozen['changed_files']==4 and frozen['unchanged_files']==28
identities=[]
for phase in ('linux','browser','windows'):
    folder=INPUTS/phase
    summary=read(folder/'summary.json')
    identity=summary['identity']
    assert summary['status']=='PASS' and summary['provider_calls']==0
    assert identity['phase']==phase and identity['executable']==frozen['executable'] and identity['tree']==frozen['tree']
    assert identity['workflow_head']==os.environ['GITHUB_SHA'] and identity['ci_run']==os.environ['GITHUB_RUN_ID']
    assert identity['production_files']==32 and identity['unchanged_files']==28 and identity['canonical_git_blob_parity']=='PASS'
    for row in summary['results']:
        assert row['status']=='PASS' and row['exit_code']==0
        assert sha((folder/(row['id']+'.log')).read_bytes())==row['log_sha256']
    extra=read(folder/'combined-extra.json')
    assert extra['provider_calls']==0 and all(v=='PASS' for k,v in extra.items() if k!='provider_calls')
    if phase!='browser':
        for name,count in [('expiry',30),('matrix',33),('worker',7),('help39',39)]:
            data=read(folder/(name+'.json'))
            assert len(data['cases'])==count and all(r['status']=='PASS' for r in data['cases']) and data['provider_calls']==0
        prior=read(folder/'prior/summary.json');assert len(prior['results'])==31 and all(r['status']=='PASS' for r in prior['results'])
    else:
        browser=read(folder/'browser-expiry.json')
        assert browser['status']=='PASS' and browser['real_worker_recreated'] is True and browser['provider_calls']==0 and len(browser['cases'])==7
        assert '<title>ATTACHMENT_STATUS_CLOSE_REAL_CHROME_PASS</title>' in (folder/'attachment-close-browser.log').read_text(encoding='utf-8',errors='replace')
    identities.append({k:v for k,v in identity.items() if k!='phase'})
assert all(x==identities[0] for x in identities)
identity=identities[0]
archive=ROOT/'artifacts'/NAME
assert archive.is_file() and archive.stat().st_size==identity['bytes'] and sha(archive.read_bytes())==identity['sha256']
with zipfile.ZipFile(archive) as z:
    assert len(z.namelist())==32 and z.testzip() is None
    for name in z.namelist():
        expected=subprocess.check_output(['git','show',frozen['executable']+':'+(ROOT/'dist-step7-candidate'/name).as_posix()])
        assert z.read(name)==expected
assert not subprocess.check_output(['git','diff','--name-only',frozen['executable'],'HEAD','--',str(ROOT/'dist-step7-candidate')]).strip()
run=os.environ['GITHUB_RUN_ID']; exact=frozen['executable']; tree=frozen['tree']
closure={'checked_paths':28,'unaccounted_pre_handoff_dependencies':0,'stale_active_assumptions':0,'available_but_unverified_pre_handoff_dependencies':0,'live_gates_pending':5}
info={**identity,'baseline_executable':frozen['baseline'],'targeted_ci_run':frozen['targeted_ci_run'],'gate_status':'PRE-HANDOFF PASS','live_certification':'PENDING POST-INSTALL','production_files':32,'changed_files':4,'unchanged_files':28,'expiry_cases':30,'consumer_cases':33,'worker_cases':7,'prior_regression_scripts_per_platform':31,'help_behavioral_cases':39,'report_attachment_type_gate':'PASS','attachment_status_close_source_gate':'PASS','attachment_status_close_real_chrome':'PASS','fifth_file_scope_negative_control':'PASS','provider_calls':0,'automatic_retry_added':False,'automatic_polling_added':False,'automatic_pagination_added':False,'automatic_fanout_added':False,'automatic_refetch_added':False,'automatic_resend_added':False,'dependency_closure':closure,'gates':{f'GATE-{i:02}':'PASS' for i in range(1,36)}}
(archive.parent/(NAME+'.BUILDINFO.json')).write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

deps=[
('D01–D24','Report lifetime/provenance/session/transport/output','Inherited expiry authorities rerun on the exact combined ZIP','PASS'),
('D25','Provider response bytes → parsed format','The existing single-fetch parser result is passed to artifact classification; no refetch','PASS'),
('D26','Opaque XLSX transport metadata','Parser-proven xlsx canonicalizes generic octet-stream/ZIP transport to .xlsx + OOXML MIME; exact bytes and SHA remain unchanged','PASS'),
('D27','Unknown/concrete file types','Concrete provider MIME remains authoritative; unknown generic/unparsed content remains fail-closed .bin','PASS'),
('D28','Attachment UI status lifecycle','All attachment info/success/error statuses share one closeable plate; × removes visual DOM only and never mutates delivery state','PASS')]
lines=['# Combined dependency closure — report expiry + XLSX attachment + status close','',f'Executable `{exact}`; tree `{tree}`; final CI `{run}`.','', '| ID | Dependency | Rule / proof | Status |','|---|---|---|---|']
for row in deps: lines.append('| '+' | '.join(row)+' |')
lines+=['','## Exact production scope','','Changed relative to baseline `0cc968ee4b76d41e9c0361a905812fe49f313585`:','- `shared/ozon_provider.js`','- `shared/llm_output_report_workflow_patch.js`','- `shared/file_delivery_port_worker.js`','- `attachment_delivery_port_content.js`','','28 other production files are byte-identical to the baseline. A deliberate fifth-file mutation is rejected by the same scope gate.','',json.dumps(closure,ensure_ascii=False,indent=2),'','LIVE-GATE-01..05 remain PENDING POST-INSTALL.']
(ROOT/'PATCH_REPORT_FILE_XLSX_ALICE_UI_DEPENDENCIES_2026-09-12.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')

gates=re.findall(r'^### (GATE-\d{2}) — (.+)$',(ROOT/'OZON_PATCH_DELIVERY_GATE.md').read_text(encoding='utf-8'),re.M)
assert len(gates)==35
proof={
'GATE-01':'Current-turn direct operator authorization.',
'GATE-02':'Live evidence frozen: fresh create/info/get reached report_file HTTP200; manual Alice upload proved XLSX support.',
'GATE-03':'Exact combined production allowlist is 4/32 files; deliberate fifth file is rejected.',
'GATE-04':'Repair branch only; no force/reset/credential mutation/provider call.',
'GATE-05':'Create → info → file HTTP200 → capture → descriptor → Alice preflight/UI reconstructed.',
'GATE-06':'Expiry, MIME/extension, MIME-on-File, UI status, stale test assumptions and lifecycle consumers separately audited.',
'GATE-07':'D01–D28 producer-to-consumer inventory and exact source sweeps.',
'GATE-08':'Session, IndexedDB, worker, adapter, delivery and DOM lifetimes tested.',
'GATE-09':'Existing single-fetch, durable artifact, fail-closed and privacy invariants preserved.',
'GATE-10':'Provider 403 and target-AI support are not rewritten as Bridge success.',
'GATE-11':'Cross-command expiry/session/artifact state remains durable by existing stores.',
'GATE-12':'Real MV3 worker stop/new-worker test rerun on exact ZIP.',
'GATE-13':'Same-instance tests are supplemental to recreated-worker/browser tests.',
'GATE-14':'Fresh synthetic refs/artifacts; no user signed URL reused.',
'GATE-15':'Unknown/stale/expired refs remain zero-request fail-closed.',
'GATE-16':'Pinned real Chrome plus exact-package source/browser assertions.',
'GATE-17':'Manifest/hosts unchanged; no new network destination.',
'GATE-18':'One deterministic ZIP reused by Linux/Chrome/Windows and checked against Git blobs.',
'GATE-19':'Previous expiry ZIP invalidated; all final evidence belongs to the combined executable.',
'GATE-20':'Logical/physical request parameters/fingerprints remain exact; classifier runs after the same fetch.',
'GATE-21':'Provider request accounting and local rejection accounting regressions PASS.',
'GATE-22':'No retry/refetch/resend/fanout added; single-fetch guard retained.',
'GATE-23':'Old .bin RED + new XLSX positive, unsupported unknown negative, and fifth-file negative controls.',
'GATE-24':'Entitlement/provider taxonomy regressions rerun.',
'GATE-25':'Personal-data OFF guard retained.',
'GATE-26':'Provenance classification retained; format recognition does not make personal data safe.',
'GATE-27':'Redaction/output regressions rerun.',
'GATE-28':'Signed URLs/credentials/base64 are not exposed in model output.',
'GATE-29':'Trusted-host/redirect/credentials guards unchanged and rerun.',
'GATE-30':'Expiry REDs plus attachment-type RED and status-close RED have targeted GREEN.',
'GATE-31':'31 prior regressions + HELP39 rerun per desktop platform.',
'GATE-32':'Exact workflow, artifact storage, AI dispatch and UI-close chain all closed.',
'GATE-33':'No fabricated MIME: only parser-proven format may canonicalize generic transport metadata.',
'GATE-34':'Patch gates performed zero real Ozon business requests.',
'GATE-35':'One final Linux → Chrome → Windows → evidence run on the frozen combined ZIP.'}
lines=['# Combined patch GATE-01–35','',f'CI `{run}`; executable `{exact}`; status **PRE-HANDOFF PASS**.','', '| Gate | Requirement | Result | Evidence |','|---|---|---|---|']
for gid,title in gates: lines.append(f'| {gid} | {title} | PASS | {proof[gid]} |')
lines+=['','## Post-install live gates','']+[f'LIVE-GATE-{i:02}: PENDING POST-INSTALL.' for i in range(1,6)]
(ROOT/'PATCH_REPORT_FILE_XLSX_ALICE_UI_GATE_2026-09-12.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')

lines=['# Ozon Bridge — report expiry + XLSX delivery to Alice + closable status plates','',f'**PRE-HANDOFF PASS. LIVE CERTIFICATION: PENDING POST-INSTALL.** Final CI `{run}`.','',f'Executable `{exact}`; tree `{tree}`.','',f'Installable ZIP `{NAME}` — {identity["bytes"]} bytes — SHA-256 `{identity["sha256"]}`.','',
'## What the live evidence proved before this combined repair','The freshly generated report path reached `report_file_get` with HTTP 200. The expiry correction therefore worked live. The remaining failure was after download: the Bridge rejected/delivered the captured provider file with incorrect generic attachment metadata. The operator manually attached the same XLSX to Alice without the extension and Alice accepted it, separating target support from Bridge classification.','',
'## Root cause','`file_delivery_port_worker.js` captured the original bytes correctly, but when Ozon returned an opaque URL and generic `application/octet-stream` (or container-like ZIP metadata), artifact filename/MIME were derived only from transport headers/URL. The same one-fetch response had already been parsed as `format="xlsx"`; that proven format was discarded. The artifact could therefore become `.bin`/octet-stream and fail Bridge/Alice preflight despite valid XLSX bytes.','',
'## Production repair','The artifact classifier now receives the already-produced parser result. A parser-proven OOXML workbook canonicalizes generic transport metadata to `.xlsx` and `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. The original bytes are not converted or regenerated. Concrete non-container provider MIME is preserved. Generic content that the parser cannot identify stays `.bin` and remains fail-closed. No second fetch, retry, report_info, create, polling, resend or fan-out was added.','',
'## Status plates','The main `content_script.js` toast already had a close button. The independent attachment-delivery status plate did not. It now has the same explicit `×` for info, success and error states. Clicking it removes only the visual status element; it does not cancel, confirm, retry, mutate or delete the underlying delivery. A generation token also prevents an older timeout from deleting a newer replacement plate.','',
'## Why this is not a workaround','There is no special case for the user report code, warehouse, URL, request ID or Alice error string. The change sits at the generic boundary where validated provider bytes become a typed artifact. It reuses evidence already computed by the existing parser, preserves exact bytes and single-fetch accounting, and keeps unknown types blocked. The UI change is centralized in the shared attachment status renderer rather than patched into one error message.','',
'## Compatibility and regression boundaries','Combined production scope is exactly 4 of 32 files relative to the accepted HELP_V2 baseline; 28 files are byte-identical. The previous expiry logic remains in the same two files. Attachment classification and status rendering are the two additional production files. Existing personal-data provenance, trusted-host, IndexedDB durability, worker recreation, HELP_V2, XLSX parser, drag/drop and send regressions were rerun.','',
'## Test-authority corrections discovered by fail-stop runs','Several historical tests encoded obsolete literal source shapes: an old no-argument `recoverCurrent()` signature, an ancient legacy commit baseline, a FakeDOM without standard `setAttribute`, and a literal two-argument artifact-store call. Those tests were not disabled. Their semantic invariants were preserved and updated to current architecture, with the old sealed fixture kept and a v2 DOM-complete fixture added. Intermediate failed runs remain part of the execution record.','',
'## Remaining live boundary','The final package is pre-handoff certified, not live certified. After installation, use a new explicit report create → actual code → report_info → actual ref → report_file_get and verify that Alice receives the XLSX automatically. Then verify close controls and lifecycle/no-duplicate behavior. LIVE-GATE-01..05 remain pending.']
(ROOT/'PATCH_REPORT_FILE_XLSX_ALICE_UI_2026-09-12.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')

notes=['# Execution notes — combined report XLSX/Alice UI repair','',f'Final CI authority: `{run}`.','',
'- Baseline RED workflow `34689034974` proved the old exact executable stored opaque XLSX as `.bin` and the attachment status had no close control.','- Diagnostic `34689204367` proved `result.parsed.format="xlsx"` already existed and could classify the same bytes without refetch.','- Multiple materialization attempts failed closed before production publication due stale test assumptions / malformed test-only diff / outdated closed-set assertions; none were promoted.','- Targeted materialization `34689839528` finally passed all combined gates, fifth-file negative control, prior regressions, and only then published production commit `aafd23cca6cb657ed8c453c54c6a0b70b5bf21f3`.','- The final package run reran the exact frozen executable on Linux, pinned Chrome and Windows.','', 'No real Ozon business request was made by CI.']
(ROOT/'PATCH_REPORT_FILE_XLSX_ALICE_UI_EXECUTION_NOTES_2026-09-12.md').write_text('\n'.join(notes)+'\n',encoding='utf-8')

# Evidence bundle contains reports and final phase summaries, never provider signed URLs from live user traffic.
evidence=archive.parent/(NAME+'.evidence.zip')
with zipfile.ZipFile(evidence,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for phase in ('linux','browser','windows'):
        for p in sorted((INPUTS/phase).rglob('*')):
            if p.is_file(): z.write(p,arcname=f'{phase}/{p.relative_to(INPUTS/phase).as_posix()}')
print(json.dumps({'status':'PASS','package':NAME,'sha256':identity['sha256'],'bytes':identity['bytes'],'executable':exact,'tree':tree,'provider_calls':0},ensure_ascii=False))
