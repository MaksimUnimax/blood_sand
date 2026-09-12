"""Fail-stop, cross-platform checks of the exact installable Autorun repair."""
import base64, gzip, hashlib, json, os, pathlib, shutil, subprocess, sys, zipfile
ROOT = pathlib.Path('tooling/llm-api-bridges/ozon-seller')
DIST = ROOT/'dist-step7-candidate'
GATE = ROOT/'validation/autorun-help-v2-marker-v1'
BASE = 'ee80e80443ac10f733cdd58884cfd2dbf12bbefb'
EXACT = '0cc968ee4b76d41e9c0361a905812fe49f313585'
TREE = 'f9aa7ea1b1d00d6d3abdb22f1bb6adba78a84a90'
NAME = 'OZON_BRIDGE_v0.1.19_AUTORUN_HELP_V2_20260912.zip'
PHASE = sys.argv[1]
assert PHASE in ('linux', 'windows', 'browser')
TEMP = pathlib.Path(os.environ['RUNNER_TEMP'])
OUT = TEMP/'help-v2-evidence'/PHASE
OUT.mkdir(parents=True, exist_ok=True)
RESULTS = []
def sha(b): return hashlib.sha256(b).hexdigest()
def git(*args): return subprocess.check_output(['git', *map(str,args)])
def text(*args): return git(*args).decode().strip()
def save(name, value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def run(label, args, guard=True, timeout=180):
    env = dict(os.environ)
    if guard and str(args[0])=='node':
        env['NODE_OPTIONS']='--require="'+(ROOT/'validation/step7-regression-v1/network_guard.cjs').resolve().as_posix()+'"'
    args = list(map(str,args))
    p = subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,env=env,timeout=timeout)
    (OUT/(label+'.log')).write_bytes(p.stdout)
    row={'id':label,'command':args,'exit_code':p.returncode,'log_sha256':sha(p.stdout),'status':'PASS' if p.returncode==0 else 'FAIL'}
    RESULTS.append(row)
    print(label, row['status'],flush=True)
    if p.returncode:
        save('failure.json',{'results':RESULTS,'executable':EXACT})
        print(p.stdout.decode('utf-8',errors='replace')[-12000:])
        raise SystemExit(p.returncode)
    return p.stdout.decode('utf-8',errors='replace')
def canonical(ref):
    prefix=DIST.as_posix()+'/'
    names=text('ls-tree','-r','--name-only',ref,'--',DIST).splitlines()
    assert len(names)==32
    return {p[len(prefix):]:git('show',ref+':'+p) for p in names}
def assert_scope():
    assert text('show','-s','--format=%T',EXACT)==TREE
    subprocess.run(['git','merge-base','--is-ancestor',EXACT,'HEAD'],check=True)
    assert not text('diff','--name-only',EXACT,'HEAD','--',DIST),'executable changed after freeze'
    assert text('diff','--name-only',BASE,EXACT,'--',DIST)==(DIST/'content_script.js').as_posix()
    raw=canonical(EXACT);before=canonical(BASE)
    assert sha(raw['content_script.js'])=='3df6baa6bcbfb147f653f4c55275d5a5d7d7794af3ae9ae71c088cde91a4074c'
    assert sha(before['content_script.js'])=='fa1c0046a22a61be1b646460baf7bd0a8ce75238e1c85f9b78d028c7b516a5b9'
    assert {k for k in raw if raw[k]!=before[k]}=={'content_script.js'}
    save('production-members.json',[{'file':k,'sha256':sha(v),'baseline_sha256':sha(before[k]),'changed':v!=before[k]} for k,v in sorted(raw.items())])
    return raw,before
raw,before=assert_scope()
archive=ROOT/'artifacts'/NAME
if PHASE=='linux':
    archive.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,data in sorted(raw.items()):
            info=zipfile.ZipInfo(name,(1980,1,1,0,0,0));info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
    (archive.parent/(NAME+'.sha256.txt')).write_text(sha(archive.read_bytes())+'  '+NAME+'\n',encoding='utf-8')
assert archive.is_file()
package_sha=sha(archive.read_bytes())
assert (archive.parent/(NAME+'.sha256.txt')).read_text().split()[0]==package_sha
extract=TEMP/('autorun-extract-'+PHASE)
if extract.exists():shutil.rmtree(extract)
extract.mkdir()
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert z.namelist()==sorted(raw),'ZIP member/order drift'
    assert all(z.read(k)==v for k,v in raw.items()),'ZIP differs from Git blob bytes'
    z.extractall(extract)
assert {p.relative_to(extract).as_posix():p.read_bytes() for p in extract.rglob('*') if p.is_file()}==raw
# Legacy tests resolve a fixed DIST path: restore it from verified extracted bytes.
shutil.rmtree(DIST);shutil.copytree(extract,DIST)
identity={'executable':EXACT,'tree':TREE,'workflow_head':os.environ['GITHUB_SHA'],'ci_run':os.environ['GITHUB_RUN_ID'],'package':NAME,'package_sha256':package_sha,'bytes':archive.stat().st_size,'production_files':32,'unchanged_files':31,'canonical_git_blob_parity':'PASS','provider_calls':0}
save('identity.json',identity)
if PHASE in ('linux','windows'):
    for p in sorted(extract.rglob('*.js')):run('syntax-'+p.relative_to(extract).as_posix().replace('/','-'),['node','--check',p])
    old=TEMP/('prefx-dist-'+PHASE);old.mkdir(exist_ok=True)
    for rel,data in before.items():p=old/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
    run('behavioral-red',['node',GATE/'run_autorun_behavioral.mjs',old,'--expect-red'])
    os.environ['OZON_TEST_REPORT']=str(OUT/'behavioral-green.json')
    run('behavioral-green',['node',GATE/'run_autorun_behavioral.mjs',extract])
    os.environ.pop('OZON_TEST_REPORT')
    report=json.loads((OUT/'behavioral-green.json').read_text())
    assert len(report['cases'])==39 and all(r['status']=='PASS' for r in report['cases'])
    assert report['provider_calls']==0
    run('marker-guard',['node',GATE/'run_autorun_help_v2_marker_gate.mjs',extract])
    os.environ['OZON_SWEEP_REPORT']=str(OUT/'marker-dependencies.json')
    run('secondary-sweep',['node',GATE/'run_secondary_sweep.mjs',extract])
    os.environ.pop('OZON_SWEEP_REPORT')
    decoded=[]
    for name,expected in [('run_attachment_idle_behavior.mjs','29cf98971296ba529d636e284f7066585c7e9e2cebe49121b41277ea18b8e71e'),('run_work_restart_extended.mjs','0a564b28a1bdf102042716247984594867aef6262bbfc18b0ea472a6a43aa883')]:
        encoded=b''.join((ROOT/'validation/global-toast-work-restart-v1'/(name+'.gz.b64')).read_bytes().split())
        assert len(encoded)%4!=1
        decoded_bytes=gzip.decompress(base64.b64decode(encoded+b'='*((-len(encoded))%4),validate=True))
        assert sha(decoded_bytes)==expected
        dest=TEMP/name;dest.write_bytes(decoded_bytes);decoded.append(dest)
    specs=[
      ('regression/run_alice_xlsx_live_capability_gate.mjs',[]),
      ('alice-xlsx-live-capability-v2/run_postfix_alice_xlsx_live_capability.mjs',['.']),
      ('alice-xlsx-live-capability-v2/run_secondary_dependency_sweep.mjs',['.']),
      (str(decoded[0]),[DIST]),(str(decoded[1]),[DIST]),
      ('WORK_SESSION_PENDING_START_REGRESSION_2026-08-21.mjs',[DIST]),
      ('alice-spa-attachment-owner-v1/run_postfix_spa_owner_gate.mjs',['.']),
      ('regression/run_file_delivery_adapter_gate_policy.mjs',[]),
      ('regression/run_file_delivery_capture_accounting.mjs',[]),
      ('regression/run_file_delivery_port_worker_state_machine.mjs',[]),
      ('regression/run_file_delivery_mixed_batch_policy.mjs',[]),
      ('regression/run_file_delivery_wake_lifecycle.mjs',[]),
      ('regression/run_file_delivery_live_stop_repro.mjs',[]),
      ('regression/run_direct_binary_provider_attachment_gate.mjs',[]),
      ('indexeddb-transaction-durability-v1/run_prefix_transaction_abort_gate.mjs',['.']),
      ('indexeddb-transaction-durability-v1/run_secondary_dependency_sweep.mjs',['.']),
      ('alice-auto-send-v1/run_alice_auto_send_postfix_source_gate.mjs',[DIST]),
      ('alice-drag-drop-v1/run_alice_drag_drop_runtime_gate.mjs',['.',DIST]),
      ('alice-large-result-v1/run_alice_large_result_delivery_gate.mjs',[DIST]),
      ('alice-large-result-v1/run_alice_large_result_delivery_gate_v2.mjs',['.',DIST]),
      ('llm-output-report-workflow-v1/run_output_contract_gate.mjs',['.']),
      ('llm-output-report-workflow-v1/run_secondary_dependency_sweep.mjs',['.']),
      ('mixed-help-api-v2/run_mixed_help_api_gate_v2.mjs',['.']),
      ('mixed-help-api-v2/run_mixed_help_api_disabled_alias_gate.mjs',['.']),
      ('command-envelope-contract-v1/run_command_envelope_contract_gate.mjs',['.']),
      ('read-effect-repair-v1/run_effect_read_repair_gate.mjs',['.']),
      ('read-effect-repair-v1/run_defect_015_date_repair_gate.mjs',['.']),
      ('read-effect-repair-v1/run_provider_taxonomy_gate.mjs',['.']),
      ('read-effect-repair-v1/run_report_file_lifecycle_gate.mjs',['.']),
      ('read-effect-repair-v1/run_report_file_session_fail_closed_gate.mjs',['.']),
      ('read-effect-repair-v1/run_report_file_workflow_gate.mjs',['.'])]
    for i,(p,args) in enumerate(specs,1):
        p=pathlib.Path(p);p=p if p.is_absolute() else ROOT/'validation'/p
        run('regression-%02d-%s'%(i,p.stem),['node',p,*args])
    assert len(specs)==31
else:
    chrome=pathlib.Path(sys.argv[2]).resolve()
    version=run('browser-version',[chrome,'--version'],guard=False)
    assert '152.0.7977.82' in version
    fixture=TEMP/'autorun-packaged-browser.html'
    run('build-browser-fixture',[sys.executable,GATE/'build_browser_fixture.py',extract,fixture],guard=False)
    fixtures=[(fixture,'AUTORUN_HELP_V2_REAL_DOM_BROWSER_PASS'),
      (ROOT/'validation/alice-xlsx-live-capability-v2/alice_xlsx_live_capability_fixture.html','ALICE_XLSX_LIVE_CAPABILITY_BROWSER_PASS'),
      (ROOT/'validation/alice-auto-send-v1/alice_blocked_send_postfix_fixture.html','ALICE_BLOCKED_SEND_POSTFIX_PASS'),
      (ROOT/'validation/alice-auto-send-v1/alice_current_dom_send_chain_fixture.html','ALICE_CURRENT_DOM_SEND_CHAIN_PASS'),
      (ROOT/'validation/alice-drag-drop-v1/alice_drag_drop_adapter_fixture.html','ALICE_DND_ADAPTER_PASS')]
    for i,(p,title) in enumerate(fixtures):
        data=run('browser-fixture-'+str(i),[chrome,'--headless=new','--no-sandbox','--disable-gpu','--disable-background-networking','--allow-file-access-from-files','--virtual-time-budget=2500','--dump-dom',p.resolve().as_uri()],guard=False)
        assert '<title>FAIL:' not in data
        assert '<title>'+title+'</title>' in data,title
    run('browser-attachment-primitive',['node',ROOT/'validation/regression/run_file_attachment_browser_primitive.mjs',chrome],guard=False)
    run('browser-mv3-exact-package',['xvfb-run','-a','node',ROOT/'validation/regression/run_file_delivery_extension_worker_smoke.mjs',chrome,extract],guard=False)
assert {p.relative_to(DIST).as_posix():p.read_bytes() for p in DIST.rglob('*') if p.is_file()}==raw
subprocess.run(['git','diff','--check'],check=True)
save('summary.json',{'status':'PASS','phase':PHASE,'identity':identity,'results':RESULTS,'provider_calls':0,'live_certification':'PENDING POST-INSTALL'})
print(PHASE.upper()+'_EXACT_PACKAGE_FULL_SUITE_PASS',flush=True)
