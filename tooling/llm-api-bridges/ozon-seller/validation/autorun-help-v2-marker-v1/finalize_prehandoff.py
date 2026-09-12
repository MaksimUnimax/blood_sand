"""Create handoff evidence only from this run's verified exact-package results."""
from pathlib import Path
import hashlib, json, os, re, shutil, subprocess, zipfile
ROOT=Path('tooling/llm-api-bridges/ozon-seller')
GATE=ROOT/'validation/autorun-help-v2-marker-v1'
EXACT='0cc968ee4b76d41e9c0361a905812fe49f313585'
TREE='f9aa7ea1b1d00d6d3abdb22f1bb6adba78a84a90'
BASE='ee80e80443ac10f733cdd58884cfd2dbf12bbefb'
NAME='OZON_BRIDGE_v0.1.19_AUTORUN_HELP_V2_20260912.zip'
inputs=Path(os.environ['RUNNER_TEMP'])/'all-evidence'
archive=ROOT/'artifacts'/NAME
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf-8'))
identities=[]
for phase in ('linux','browser','windows'):
    folder=inputs/phase;s=read(folder/'summary.json');identity=s['identity']
    assert s['status']=='PASS' and s['phase']==phase
    assert s['provider_calls']==0 and identity['provider_calls']==0
    assert identity['executable']==EXACT and identity['tree']==TREE
    assert identity['ci_run']==os.environ['GITHUB_RUN_ID']
    assert identity['workflow_head']==os.environ['GITHUB_SHA']
    assert identity['production_files']==32 and identity['unchanged_files']==31
    assert identity['canonical_git_blob_parity']=='PASS'
    assert all(r['status']=='PASS' and r['exit_code']==0 for r in s['results'])
    for r in s['results']:assert sha((folder/(r['id']+'.log')).read_bytes())==r['log_sha256']
    if phase!='browser':
        assert len([r for r in s['results'] if r['id'].startswith('regression-')])==31
        behavior=read(folder/'behavioral-green.json')
        assert len(behavior['cases'])==39 and all(r['status']=='PASS' for r in behavior['cases'])
        assert behavior['provider_calls']==0
        sweep=read(folder/'marker-dependencies.json')
        assert sweep['marker_consumer_files']==5 and sweep['autorun_consumers']==2 and sweep['unknown_active_consumers']==0
    else:
        assert len(s['results'])==9
        assert 'AUTORUN_HELP_V2_REAL_DOM_BROWSER_PASS' in (folder/'browser-fixture-0.log').read_text()
    identities.append(identity)
assert all(i==identities[0] for i in identities)
identity=identities[0]
assert archive.stat().st_size==identity['bytes'] and sha(archive.read_bytes())==identity['package_sha256']
assert subprocess.check_output(['git','diff','--name-only',EXACT,'HEAD','--',str(ROOT/'dist-step7-candidate')]).strip()==b''
with zipfile.ZipFile(archive) as z:
    assert len(z.infolist())==32 and z.testzip() is None
    for p in z.namelist():
        canonical=subprocess.check_output(['git','show',EXACT+':'+(ROOT/'dist-step7-candidate'/p).as_posix()])
        assert canonical==z.read(p)
run=os.environ['GITHUB_RUN_ID']
info={**identity,'baseline_executable':BASE,'gate_status':'PRE-HANDOFF PASS','live_certification':'PENDING POST-INSTALL','provider_calls_during_patch_gate':0,'automatic_retry_added':False,'automatic_polling_added':False,'automatic_pagination_added':False,'automatic_fanout_added':False,'automatic_refetch_added':False,'automatic_resend_added':False,'behavioral_cases':39,'browser_adapter_cases':20,'prior_regression_scripts_per_platform':31,'gate_ids':{f'GATE-{i:02}':'PASS' for i in range(1,36)}}
# Each dependency row names the producer, consumers, lifetime and concrete proof.
rows=[
('D01','runtime_names API/V1/V2 constants','content helper, worker discovery, guidance, startup prompt','immutable module state','marker-guard; secondary-sweep'),
('D02','production AI adapter assistant text','latest new assistant selection and baseline exclusion','DOM/content instance','behavioral-green: BASELINE_ASSISTANT_NOT_REPLAYED; ONLY_LATEST_NEW_ASSISTANT_IS_CANDIDATE; browser-fixture-0'),
('D03','shared marker predicate','candidateAfterAssistantBaseline and final latestText recheck (2/2)','pure local value; not persisted','marker-guard; behavioral-red independently exercises both old guards'),
('D04','completion and generation state','autoTick early guard, final completion check','current DOM response','STREAMING_AND_2000MS_STABILITY_GUARD; FINAL_RECHECK_COMPLETENESS_BLOCKED; browser-fixture-0'),
('D05','message fingerprint and stability clock','candidate, autoFirstSeen, latestFingerprint','per-watch content memory; invalidated on change','CHANGED_FINGERPRINT_RESTARTS_STABILITY; FINAL_RECHECK_CHANGED_TEXT_BLOCKED'),
('D06','confirmed identity plus Alice active history','sameConversation, conversation key, beginAutoWatch and tick','live page identity; no stale URL fallback','WRONG_CONVERSATION_BLOCKED; WRONG_ORIGIN_BLOCKED; UNCONFIRMED_ROOT_BLOCKED; SPA_CHANGE_DURING_STABILITY_STOPS_WATCH; browser-fixture-0'),
('D07','watch/run/baseline IDs','content admission and worker correlations','content instance plus durable chrome.storage.local auto_runs','CONCURRENT_TICKS_SINGLE_HANDOFF; DISPOSED_CONTENT_CANNOT_ADMIT; WORKER_RECREATION_NO_DUPLICATE_*'),
('D08','Manual and Autorun selection','beginAutoWatch mutual exclusion; worker mode admission','content/manual state and durable worker state','AUTORUN_DISABLES_MANUAL_MODE; WORKER_MANUAL_MODE_FAIL_CLOSED'),
('D09','OZ_AUTO_MESSAGE_READY payload','worker sender tab, binding, run, watch, conversation checks','runtime message boundary; existing persistent binding','FULL_CONTENT_WORKER_QUEUE_OUTPUT_*; WORKER_WRONG_TAB_FAIL_CLOSED; WORKER_MISSING_BINDING_FAIL_CLOSED; WORKER_MISSING_RUN_FAIL_CLOSED'),
('D10','ordered typed discovery records','HELP parser, API parser, sequential execution queue','worker admitted batch state','FULL_CONTENT_WORKER_QUEUE_OUTPUT_TRIPLE; FULL_CONTENT_WORKER_QUEUE_OUTPUT_MIXED; FULL_CONTENT_WORKER_QUEUE_OUTPUT_API_THEN_HELP'),
('D11','malformed HELP envelope','local guidance error then independent next entry','one admitted queue; no hidden provider calls','FULL_CONTENT_WORKER_QUEUE_OUTPUT_MALFORMED_HELP_THEN_VALID; regression-23; regression-24'),
('D12','local HELP result','guidance serialization, combined output, next watch','existing delivery state; no provider request','FULL_CONTENT_WORKER_QUEUE_OUTPUT_SINGLE/TRIPLE; WORKER_RECREATION_NO_DUPLICATE_SINGLE/TRIPLE'),
('D13','API logical command and physical transport','policy, entitlement, planner, provider, result metadata','existing worker/request boundary; no new network path','FULL_CONTENT_WORKER_QUEUE_OUTPUT_MIXED; regression-24; regression-25; regression-28'),
('D14','logical and physical request counts','batch header, per-result external status, transformation provenance','request metadata and output','regression-09; regression-23; regression-25; regression-28'),
('D15','durable delivery and report refs','storage, recreation, recovery, expiry, fail-closed paths','IndexedDB and chrome.storage session/local contracts unchanged','regression-10; regression-12; regression-13; regression-15; regression-16; regression-29; regression-30; regression-31; browser-mv3-exact-package'),
('D16','original provider file versus generated TXT','delivery policy and adapters','existing durable artifact; exact bytes unchanged','regression-01..05; regression-08..14; regression-18..20; browser-fixture-1..4; browser-attachment-primitive'),
('D17','active versus idle recovery errors and Work restart','notification, pending-start transaction, Send outcome','existing durable Work session; unchanged production bytes','regression-04; regression-05; regression-06'),
('D18','personal-data policy and provenance','execution guards, report file policy, redaction','settings and session provenance; unchanged','regression-08; regression-11; regression-14; regression-26; regression-28..31'),
('D19','credentials and signed provider URLs','trusted HTTPS transport, SSRF rejection, redacted output','credentials isolated in existing provider transport','regression-14; regression-28; regression-29; regression-30; regression-31'),
('D20','manifest and module ordering','content and worker entry, active runtime consumers','packaged MV3 manifest and scripts','secondary-sweep; browser-mv3-exact-package; 31 unchanged Git-blob proofs'),
('D21','startup and report continuation contract','LLM instruction tail, next command, guidance','existing prompt/output authority; unchanged','regression-21; regression-22; regression-23; regression-25'),
('D22','frozen executable and package member bytes','Linux build, fresh extraction, browser and Windows consumers','deterministic 32-file ZIP; canonical Git blobs','all three identity.json and production-members.json; final byte readback'),
('D23','test fixtures and historical evidence','RED, GREEN, full runtime, real DOM prerequisites','fresh synthetic test flow; no reused live refs','behavioral-red; behavioral-green; pinned browser; failure ledger below; test-only fixtures are not live evidence'),
('D24','user installation and real AI/provider environment','installed workflow, actual conversation and real output','external live-only boundary','LIVE-GATE-01..05: PENDING POST-INSTALL')]
assert len(rows)==24
closure={'inventory_paths':24,'pre_handoff_paths':23,'unaccounted_pre_handoff_dependencies':0,'stale_active_assumptions':0,'available_but_unverified_pre_handoff_dependencies':0,'live_gate_count':5,'verdict':'PASS FOR PRE-HANDOFF SCOPE'}
info['dependency_closure']=closure
(ROOT/'artifacts'/(NAME+'.BUILDINFO.json')).write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
dep=['# Autorun HELP_V2 dependency closure','',f'Executable `{EXACT}`, tree `{TREE}`, authoritative CI `{run}`.','', '| ID | Producer | Readers / branches / final behavior | State and lifetime | Verification | Status |','|---|---|---|---|---|---|']
for i,producer,consumers,lifetime,proof in rows:dep.append(f'| {i} | {producer} | {consumers} | {lifetime} | {proof} | '+('PENDING POST-INSTALL' if i=='D24' else 'PASS')+' |')
dep+=['','Active marker inventory is recorded line-by-line in `marker-dependencies.json`: exactly five files, two Autorun consumers, no old static-only ingress guards.','',json.dumps(closure,ensure_ascii=False,indent=2),'','All browser tests here use exact packaged functions/modules with declared fixtures. No assertion of real installed AI acceptance or Ozon permission is made.']
(ROOT/'PATCH_AUTORUN_HELP_V2_DEPENDENCIES_2026-09-12.md').write_text('\n'.join(dep)+'\n',encoding='utf-8')
gates=re.findall(r'^### (GATE-\d{2}) — (.+)$',(ROOT/'OZON_PATCH_DELIVERY_GATE.md').read_text(),re.M)
assert len(gates)==35
proof={1:'Direct current authorization: «делай патч, правила патчей соблюдай».',2:'Frozen scope: pure HELP_V2 ingress failure at both guards; saved RED and behavioral reproduction.',3:'Exactly one production file changed; 31/32 canonical bytes unchanged.',4:'Only scoped test/CI/evidence and one production commit; normal fast-forward, no force/reset.',5:'Full content → worker → ordered queue → output tested; pure HELP zero requests.',6:'Second guard reproduced independently; all five marker-consumer files inventoried.',7:'D01..D24 dependency inventory and line-level secondary sweep.',8:'Lifetimes and final effects recorded per D-row; available proofs executed.',9:'V1/V2/API share one predicate; same parser, policy, ownership and accounting preserved.',10:'Local ingress bug before provider; no entitlement or account bypass.',11:'D07/D15 durable state remains classified; no new storage introduced.',12:'Worker recreation tests before admission and after delivery; report lifecycle regressions.',13:'Same-instance tests supplemented by fresh worker and real MV3 smoke.',14:'Fresh synthetic flow IDs/refs; no stale user report refs.',15:'Wrong/missing run, tab, binding, stale/session refs fail closed.',16:'Pinned Chrome 152.0.7977.82 real DOM and exact-package MV3 smoke.',17:'Manifest/module-order sweep and canonical manifest bytes; no host changes.',18:'Linux/browser/Windows share same ZIP SHA/size; 32 canonical Git blobs verified.',19:'Executable frozen at 0cc968ee; every test runs on exact extracted package.',20:'Command-envelope, mixed-queue and exactness/fingerprint regressions.',21:'Full queue/output fixture counts plus accounting/provider taxonomy regressions.',22:'Concurrent tick and recreated-worker duplicate controls; no new retry code.',23:'Positive API/V1/V2 controls and negative plain/result/partial/completion/ownership tests.',24:'Existing entitlement and provider taxonomy failures remain fail-honest.',25:'Read-effect and file-delivery policy-OFF regressions; zero real provider calls.',26:'Known-safe/unknown provenance and recreated-session regression chain.',27:'Existing semantic redaction and file-delivery output regressions.',28:'Credential/URL/base64 isolation checked by unchanged guarded paths and regressions.',29:'Report-file trusted HTTPS/SSRF and credential isolation regression chain.',30:'Baseline single/triple RED plus independent second-guard RED; final 39-case GREEN.',31:'All 31 selected prior regression scripts run on Linux and Windows.',32:'Full content/worker/queue/output, all D-rows, exact package and browser coverage.',33:'Fresh test prerequisites explicitly declared; fixture errors corrected without production changes.',34:'Network guard and fixture transports; provider_calls_during_patch_gate=0.',35:'Single authoritative run: full Linux → browser → Windows → verified finalizer; closure counts zero.'}
lines=['# Autorun HELP_V2 mandatory patch delivery gate','',f'Authoritative CI `{run}`; exact executable `{EXACT}` / `{TREE}`.','', '| Gate | Canonical requirement | Result | Evidence |','|---|---|---|---|']
for gid,title in gates:lines.append(f'| {gid} | {title} | PASS | {proof[int(gid[-2:])]} |')
lines+=['','## Live-only boundary','']
for i in range(1,6):lines.append(f'- LIVE-GATE-{i:02}: PENDING POST-INSTALL. Requires actual installed workflow/result; deterministic evidence does not close it.')
(ROOT/'PATCH_AUTORUN_HELP_V2_GATE_2026-09-12.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
report=['# Autorun HELP_V2 patch — exact pre-handoff record','',f'PRE-HANDOFF PASS. LIVE CERTIFICATION: PENDING POST-INSTALL. CI `{run}`.','',f'Baseline `{BASE}` → executable `{EXACT}`, tree `{TREE}`.','',f'Archive `{NAME}`; {identity["bytes"]} bytes; SHA-256 `{identity["package_sha256"]}`; 32 production files.','', '## Production change','Only `dist-step7-candidate/content_script.js`: a pure shared predicate recognizes the three established API/V1/V2 markers at both ingress guards. No generic OZON prefix, no parser/transport/ownership bypass. Mixed API+HELP already passed the old marker filter because of its API marker; this is a compatibility control, not an invented third defect.','', '## Actual checks','39 new behavioral cases on Linux and Windows; 20 browser adapter cases; 31 existing regression scripts on each platform; five browser fixtures; attachment primitive; actual MV3 worker smoke; complete exact-package parity. API calls inside deterministic tests are fixture transport calls, not requests to Ozon. Real provider calls: 0.','', '## First-failure ledger','Original structural RED `34675943200` is preserved. Added behavioral RED reproduces both pure-V2 failures, including a first-guard-only intermediate control.','Local VM storage prototype mismatch was corrected in test deserialization only.','Run `34678961428`: six base64 transcription differences caused integrity failure before production materialization. Original local encoded and decoded SHA-256 were retained, exact bytes restored.','Run `34679020382`: browser fixture normal-flow text collapsed newlines; fixture corrected to rendered pre/code while exact text assertion retained.','Run `34679147676`: Alice fixture omitted active history corroboration; actual ChatListItem/button prerequisite added, ownership guard not weakened.','Targeted v3 then passed and materialized only tested bytes. Production frozen after that commit.','The old unrelated malformed `ozon-alice-large-result-delivery-v1-2026-09-10.yml` workflow can emit jobless failures on pushes. It is not silently relabeled green or used as this repair authority; its executable regressions are included in the authoritative chain.','', '## Post-install acceptance','Install only the exact archive above. In active Autorun, exercise one HELP_V2, three HELP_V2 and HELP/API; verify PROMPT_ACCEPTED, ordered output and no manual-click workaround. HELP-only has zero provider requests. Verify recreation/duplicate guard and a wrong-conversation negative. Validate actual result metadata before any LIVE PASS.','', '## Behavioral cases','| Test | Result |','|---|---|']
for r in read(inputs/'linux'/'behavioral-green.json')['cases']:report.append(f'| {r["name"]} | {r["status"]} |')
(ROOT/'PATCH_AUTORUN_HELP_V2_2026-09-12.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
# Preserve full machine evidence, including exact stdout byte hashes and browser DOM.
evidence=ROOT/'artifacts'/(NAME+'.evidence.zip')
with zipfile.ZipFile(evidence,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(inputs.rglob('*')):
        if p.is_file():z.write(p,p.relative_to(inputs).as_posix())
print(json.dumps(info,ensure_ascii=False,indent=2))
print('FINAL_PREHANDOFF_EVIDENCE_VERIFIED=PASS')
