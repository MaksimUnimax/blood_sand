"""Fail-stop report-expiry proof suite. Final phases execute one exact Git-blob ZIP."""
import hashlib,json,os,pathlib,shutil,subprocess,sys,tempfile,zipfile
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller');DIST=ROOT/'dist-step7-candidate';GATE=ROOT/'validation/report-file-expiry-v1'
BASE='0cc968ee4b76d41e9c0361a905812fe49f313585';NAME='OZON_BRIDGE_v0.1.19_REPORT_FILE_EXPIRY_20260912.zip'
PHASE=sys.argv[1];assert PHASE in ('targeted','linux','windows','browser')
TEMP=pathlib.Path(os.environ.get('RUNNER_TEMP',tempfile.gettempdir()));OUT=pathlib.Path(os.environ.get('OZON_PHASE_OUT',str(TEMP/'expiry-evidence'/PHASE)));OUT.mkdir(parents=True,exist_ok=True)
results=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def git(*args):return subprocess.check_output(['git',*map(str,args)])
def save(name,data): (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def run(label,args,guard=True,timeout=240):
 env=dict(os.environ)
 if guard and str(args[0])=='node':env['NODE_OPTIONS']='--require="'+(ROOT/'validation/step7-regression-v1/network_guard.cjs').resolve().as_posix()+'"'
 p=subprocess.run(list(map(str,args)),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,env=env,timeout=timeout)
 (OUT/(label+'.log')).write_bytes(p.stdout);row={'id':label,'status':'PASS' if p.returncode==0 else 'FAIL','exit_code':p.returncode,'log_sha256':sha(p.stdout)};results.append(row);save('progress.json',results)
 print(label,row['status'],flush=True)
 if p.returncode:print(p.stdout.decode('utf-8',errors='replace')[-10000:]);raise SystemExit(p.returncode)
 return p.stdout.decode('utf-8',errors='replace')
def canonical(ref):
 prefix=DIST.as_posix()+'/';names=git('ls-tree','-r','--name-only',ref,'--',DIST).decode().splitlines();assert len(names)==32
 return {n[len(prefix):]:git('show',ref+':'+n) for n in names}
def zip_bytes(data,path):
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for n,b in sorted(data.items()):
   i=zipfile.ZipInfo(n,(1980,1,1,0,0,0));i.external_attr=0o100644<<16;i.compress_type=zipfile.ZIP_DEFLATED;z.writestr(i,b,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
base=canonical(BASE)
identity={'phase':PHASE,'provider_calls':0,'workflow_head':os.environ.get('GITHUB_SHA'),'ci_run':os.environ.get('GITHUB_RUN_ID')}
# Windows checkout may normalize line endings; only Git blobs authorize final bytes.
frozen=json.loads((GATE/'EXECUTABLE.json').read_text(encoding='utf-8')) if PHASE!='targeted' else None
raw=canonical(frozen['executable']) if frozen else {p.relative_to(DIST).as_posix():p.read_bytes() for p in DIST.rglob('*') if p.is_file()}
expected={'shared/ozon_provider.js','shared/llm_output_report_workflow_patch.js'}
assert set(raw)==set(base) and {n for n in raw if raw[n]!=base[n]}==expected
save('production-members.json',[{'file':n,'sha256':sha(raw[n]),'baseline_sha256':sha(base[n]),'changed':raw[n]!=base[n]} for n in sorted(raw)])
if PHASE!='targeted':
 frozen=json.loads((GATE/'EXECUTABLE.json').read_text(encoding='utf-8'));exact=frozen['executable'];tree=frozen['tree']
 assert git('rev-parse',exact+'^{tree}').decode().strip()==tree
 subprocess.run(['git','merge-base','--is-ancestor',exact,'HEAD'],check=True)
 assert not git('diff','--name-only',exact,'HEAD','--',DIST).decode().strip()
 raw=canonical(exact);archive=ROOT/'artifacts'/NAME;archive.parent.mkdir(exist_ok=True)
 if PHASE=='linux':
  zip_bytes(raw,archive);rep=TEMP/'expiry-repro.zip';zip_bytes(raw,rep);assert rep.read_bytes()==archive.read_bytes()
  (archive.parent/(NAME+'.sha256.txt')).write_text(sha(archive.read_bytes())+'  '+NAME+'\n',encoding='utf-8')
 assert archive.is_file() and (archive.parent/(NAME+'.sha256.txt')).read_text().split()[0]==sha(archive.read_bytes())
 extract=TEMP/('expiry-extracted-'+PHASE)
 if extract.exists():shutil.rmtree(extract)
 extract.mkdir()
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None and z.namelist()==sorted(raw)
  assert all(z.read(n)==b for n,b in raw.items());z.extractall(extract)
 assert {p.relative_to(extract).as_posix():p.read_bytes() for p in extract.rglob('*') if p.is_file()}==raw
 shutil.rmtree(DIST);shutil.copytree(extract,DIST)
 identity.update({'executable':exact,'tree':tree,'package':NAME,'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'production_files':32,'unchanged_files':30,'canonical_git_blob_parity':'PASS'})
else:extract=DIST
save('identity.json',identity)
if PHASE!='browser':
 for p in sorted(DIST.rglob('*.js')):run('syntax-'+p.relative_to(DIST).as_posix().replace('/','-'),['node','--check',p])
 old=TEMP/('expiry-base-'+PHASE);old.mkdir(exist_ok=True)
 for n,b in base.items():p=old/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 os.environ['OZON_EXPIRY_REPORT']=str(OUT/'red.json');run('expiry-baseline-red',['node',GATE/'run_expiry_gate.mjs',old,'--expect-red'])
 os.environ['OZON_EXPIRY_REPORT']=str(OUT/'expiry.json');run('expiry-gate',['node',GATE/'run_expiry_gate.mjs',DIST]);os.environ.pop('OZON_EXPIRY_REPORT')
 os.environ['OZON_MATRIX_REPORT']=str(OUT/'matrix.json');run('consumer-matrix',['node',GATE/'run_consumer_matrix.mjs',DIST]);os.environ.pop('OZON_MATRIX_REPORT')
 os.environ['OZON_WORKER_REPORT']=str(OUT/'worker.json');run('actual-worker',['node',GATE/'run_worker_gate.mjs',DIST]);os.environ.pop('OZON_WORKER_REPORT')
 os.environ['OZON_NEGATIVE_DIR']=str(OUT/'negative');run('negative-controls',[sys.executable,GATE/'run_negative_controls.py']);os.environ.pop('OZON_NEGATIVE_DIR')
 run('secondary-sweep',[sys.executable,GATE/'run_secondary_sweep.py',DIST,OUT/'source-inventory.json'])
 os.environ['OZON_TEST_REPORT']=str(OUT/'help39.json');run('help-v2-39',['node',ROOT/'validation/autorun-help-v2-marker-v1/run_autorun_behavioral.mjs',DIST]);os.environ.pop('OZON_TEST_REPORT')
 os.environ['OZON_PRIOR_REPORT_DIR']=str(OUT/'prior');run('prior-31',[sys.executable,GATE/'run_prior_regressions.py']);os.environ.pop('OZON_PRIOR_REPORT_DIR')
else:
 chrome=pathlib.Path(sys.argv[2]).resolve();version=run('browser-version',[chrome,'--version'],False);assert '152.0.7977.82' in version
 os.environ['OZON_BROWSER_EXPIRY_REPORT']=str(OUT/'browser-expiry.json');run('expiry-real-mv3',['xvfb-run','-a','node',GATE/'run_browser_expiry.mjs',chrome,extract],False);os.environ.pop('OZON_BROWSER_EXPIRY_REPORT')
 fixture=TEMP/'expiry-help-fixture.html';run('build-help-fixture',[sys.executable,ROOT/'validation/autorun-help-v2-marker-v1/build_browser_fixture.py',extract,fixture],False)
 fixtures=[(fixture,'AUTORUN_HELP_V2_REAL_DOM_BROWSER_PASS'),(ROOT/'validation/alice-xlsx-live-capability-v2/alice_xlsx_live_capability_fixture.html','ALICE_XLSX_LIVE_CAPABILITY_BROWSER_PASS'),(ROOT/'validation/alice-auto-send-v1/alice_blocked_send_postfix_fixture.html','ALICE_BLOCKED_SEND_POSTFIX_PASS'),(ROOT/'validation/alice-auto-send-v1/alice_current_dom_send_chain_fixture.html','ALICE_CURRENT_DOM_SEND_CHAIN_PASS'),(ROOT/'validation/alice-drag-drop-v1/alice_drag_drop_adapter_fixture.html','ALICE_DND_ADAPTER_PASS')]
 for i,(p,title) in enumerate(fixtures):
  data=run('browser-fixture-'+str(i),[chrome,'--headless=new','--no-sandbox','--disable-gpu','--disable-background-networking','--allow-file-access-from-files','--virtual-time-budget=2500','--dump-dom',p.resolve().as_uri()],False)
  assert '<title>'+title+'</title>' in data and '<title>FAIL:' not in data
 run('browser-attachment-primitive',['node',ROOT/'validation/regression/run_file_attachment_browser_primitive.mjs',chrome],False)
 run('browser-full-entry-smoke',['xvfb-run','-a','node',ROOT/'validation/regression/run_file_delivery_extension_worker_smoke.mjs',chrome,extract],False)
assert {p.relative_to(DIST).as_posix():p.read_bytes() for p in DIST.rglob('*') if p.is_file()}==raw
subprocess.run(['git','diff','--check'],check=True)
save('summary.json',{'status':'PASS','identity':identity,'results':results,'provider_calls':0,'live_certification':'PENDING POST-INSTALL'})
print('REPORT_EXPIRY_'+PHASE.upper()+'_PASS')
