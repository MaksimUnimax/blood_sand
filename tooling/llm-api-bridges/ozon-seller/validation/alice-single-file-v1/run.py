"""Fail-stop proof on an immutable installable ZIP, including all prior runtime regressions."""
import hashlib,json,os,pathlib,shutil,subprocess,sys,tempfile,zipfile
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller');DIST=ROOT/'dist-step7-candidate';HERE=ROOT/'validation/alice-single-file-v1';OLD=ROOT/'validation/report-file-expiry-v1'
BASE='06ec1af2a1d90e2ff192e749b5bf90129963dd05';NAME='OZON_BRIDGE_v0.1.19_ALICE_SINGLE_FILE_20260912.zip'
phase=sys.argv[1];assert phase in ['targeted','linux','windows','browser']
temp=pathlib.Path(os.environ.get('RUNNER_TEMP',tempfile.gettempdir()));OUT=pathlib.Path(os.environ.get('OZON_PHASE_OUT',str(temp/'single-evidence'/phase)));OUT.mkdir(parents=True,exist_ok=True)
rows=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def save(p,data):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def git(*a):return subprocess.check_output(['git',*map(str,a)])
def canonical(ref):
 names=git('ls-tree','-r','--name-only',ref,'--',DIST).decode().splitlines();prefix=DIST.as_posix()+'/';assert len(names)==32
 return {n[len(prefix):]:git('show',ref+':'+n) for n in names}
def unzip_bytes(raw,to):
 for n,b in raw.items():p=to/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
def run(label,args,guard=True,timeout=240):
 env=dict(os.environ)
 if guard:env['NODE_OPTIONS']='--require="'+(ROOT/'validation/step7-regression-v1/network_guard.cjs').resolve().as_posix()+'"'
 p=subprocess.run(list(map(str,args)),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,env=env,timeout=timeout)
 (OUT/(label+'.log')).write_bytes(p.stdout);row={'id':label,'status':'PASS' if p.returncode==0 else 'FAIL','exit_code':p.returncode,'log_sha256':sha(p.stdout)};rows.append(row);save(OUT/'progress.json',rows);print(label,row['status'],flush=True)
 if p.returncode:print(p.stdout.decode('utf-8',errors='replace')[-7000:]);raise SystemExit(p.returncode)
 return p.stdout.decode('utf-8',errors='replace')
def package(raw,file):
 with zipfile.ZipFile(file,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for n,b in sorted(raw.items()):
   i=zipfile.ZipInfo(n,(1980,1,1,0,0,0));i.external_attr=0o100644<<16;i.compress_type=zipfile.ZIP_DEFLATED;z.writestr(i,b,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
base=canonical(BASE);baseDir=temp/('single-base-'+phase);unzip_bytes(base,baseDir)
identity={'phase':phase,'workflow_head':os.environ.get('GITHUB_SHA'),'run_id':os.environ.get('GITHUB_RUN_ID'),'provider_calls':0}
if phase=='targeted':raw={p.relative_to(DIST).as_posix():p.read_bytes() for p in DIST.rglob('*') if p.is_file()}
else:
 exe=json.loads((HERE/'EXECUTABLE.json').read_text(encoding='utf-8'));raw=canonical(exe['executable']);assert git('rev-parse',exe['executable']+'^{tree}').decode().strip()==exe['tree']
 subprocess.run(['git','merge-base','--is-ancestor',exe['executable'],'HEAD'],check=True)
 assert not git('diff','--name-only',exe['executable'],'HEAD','--',DIST).decode().strip()
 archive=ROOT/'artifacts'/NAME;archive.parent.mkdir(exist_ok=True)
 if phase=='linux':
  package(raw,archive);again=temp/'single-again.zip';package(raw,again);assert archive.read_bytes()==again.read_bytes();(archive.parent/(NAME+'.sha256.txt')).write_text(sha(archive.read_bytes())+'  '+NAME+'\n',encoding='utf-8')
 assert (archive.parent/(NAME+'.sha256.txt')).read_text().split()[0]==sha(archive.read_bytes())
 extraction=temp/('single-extracted-'+phase)
 if extraction.exists():shutil.rmtree(extraction)
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None and z.namelist()==sorted(raw);assert all(z.read(n)==b for n,b in raw.items());z.extractall(extraction)
 assert {p.relative_to(extraction).as_posix():p.read_bytes() for p in extraction.rglob('*') if p.is_file()}==raw
 shutil.rmtree(DIST);shutil.copytree(extraction,DIST)
 identity.update({**exe,'package':NAME,'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'production_files':32,'changed_files':6,'unchanged_files':26,'git_blob_byte_parity':'PASS','fresh_zip_extraction':'PASS'})
save(OUT/'identity.json',identity)
run('scope-and-dependencies',[sys.executable,HERE/'audit.py',DIST,OUT/'dependency-inventory.json',baseDir])
if phase!='browser':
 for p in sorted(DIST.rglob('*.js')):run('syntax-'+p.relative_to(DIST).as_posix().replace('/','-'),['node','--check',p])
 run('single-file-original-red',['node',HERE/'red.mjs',baseDir])
 text=run('single-file-green',['node',HERE/'green.mjs',DIST]);result=json.loads(text.strip().splitlines()[-1]);assert result['status']=='PASS' and result['cases']==56;save(OUT/'single-file-cases.json',result)
 run('single-file-mutation-controls',[sys.executable,HERE/'negative.py',DIST,OUT/'negative'])
 with tempfile.TemporaryDirectory() as td:
  unexpected=pathlib.Path(td)/'dist';shutil.copytree(DIST,unexpected);f=unexpected/'popup.js';f.write_bytes(f.read_bytes()+b'\n// unauthorized extra production change\n');r=subprocess.run([sys.executable,str(HERE/'audit.py'),str(unexpected),str(OUT/'bad-scope.json'),str(baseDir)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT);assert r.returncode!=0 and b'AssertionError' in r.stdout;(OUT/'scope-negative.log').write_bytes(r.stdout)
 for label,script,envkey in [('expiry',OLD/'run_expiry_gate.mjs','OZON_EXPIRY_REPORT'),('consumers',OLD/'run_consumer_matrix.mjs','OZON_MATRIX_REPORT'),('worker',OLD/'run_worker_gate.mjs','OZON_WORKER_REPORT'),('help39',ROOT/'validation/autorun-help-v2-marker-v1/run_autorun_behavioral.mjs','OZON_TEST_REPORT')]:
  os.environ[envkey]=str(OUT/(label+'.json'));run(label,['node',script,DIST]);os.environ.pop(envkey)
 os.environ['OZON_NEGATIVE_DIR']=str(OUT/'expiry-negative');run('expiry-negative',[sys.executable,OLD/'run_negative_controls.py']);os.environ.pop('OZON_NEGATIVE_DIR')
 run('expiry-secondary',[sys.executable,OLD/'run_secondary_sweep.py',DIST,OUT/'expiry-inventory.json'])
 for name in ['run_report_attachment_type_gate.mjs','run_status_plate_close_gate.mjs']:run(name,['node',ROOT/'validation/report-file-attachment-mime-ui-v1'/name,DIST])
 os.environ['OZON_PRIOR_REPORT_DIR']=str(OUT/'prior');os.environ['OZON_FILE_DELIVERY_BASE_SHA']='0cc968ee4b76d41e9c0361a905812fe49f313585';run('prior-31',[sys.executable,OLD/'run_prior_regressions.py']);os.environ.pop('OZON_PRIOR_REPORT_DIR')
else:
 chrome=pathlib.Path(sys.argv[2]).resolve();assert '152.0.7977.82' in run('chrome-version',[chrome,'--version'],False)
 os.environ['OZON_SINGLE_BROWSER_REPORT']=str(OUT/'single-browser.json');run('single-file-real-chrome',['xvfb-run','-a','node',HERE/'browser.mjs',chrome,DIST],False);os.environ.pop('OZON_SINGLE_BROWSER_REPORT')
 os.environ['OZON_BROWSER_EXPIRY_REPORT']=str(OUT/'expiry-browser.json');run('expiry-real-chrome',['xvfb-run','-a','node',OLD/'run_browser_expiry.mjs',chrome,DIST],False);os.environ.pop('OZON_BROWSER_EXPIRY_REPORT')
 fixture=temp/'single-help-fixture.html';run('build-help-fixture',[sys.executable,ROOT/'validation/autorun-help-v2-marker-v1/build_browser_fixture.py',DIST,fixture],False)
 fixtures=[(fixture,'AUTORUN_HELP_V2_REAL_DOM_BROWSER_PASS'),(ROOT/'validation/alice-xlsx-live-capability-v2/alice_xlsx_live_capability_fixture.html','ALICE_XLSX_LIVE_CAPABILITY_BROWSER_PASS'),(ROOT/'validation/alice-auto-send-v1/alice_blocked_send_postfix_fixture.html','ALICE_BLOCKED_SEND_POSTFIX_PASS'),(ROOT/'validation/alice-auto-send-v1/alice_current_dom_send_chain_fixture.html','ALICE_CURRENT_DOM_SEND_CHAIN_PASS'),(ROOT/'validation/alice-drag-drop-v1/alice_drag_drop_adapter_fixture.html','ALICE_DND_ADAPTER_PASS'),(ROOT/'validation/report-file-attachment-mime-ui-v1/attachment_status_close_browser_fixture.html','ATTACHMENT_STATUS_CLOSE_REAL_CHROME_PASS')]
 for i,(p,title) in enumerate(fixtures):
  html=run('dom-fixture-'+str(i),[chrome,'--headless=new','--no-sandbox','--disable-gpu','--disable-background-networking','--allow-file-access-from-files','--virtual-time-budget=2500','--dump-dom',p.resolve().as_uri()],False);assert '<title>'+title+'</title>' in html and '<title>FAIL:' not in html,(p,title,html[-3000:])
 run('attachment-primitive',['node',ROOT/'validation/regression/run_file_attachment_browser_primitive.mjs',chrome],False)
 run('full-entry-mv3',['xvfb-run','-a','node',ROOT/'validation/regression/run_file_delivery_extension_worker_smoke.mjs',chrome,DIST],False)
assert {p.relative_to(DIST).as_posix():p.read_bytes() for p in DIST.rglob('*') if p.is_file()}==raw
subprocess.run(['git','diff','--check'],check=True)
save(OUT/'summary.json',{'status':'PASS','identity':identity,'results':rows,'provider_calls':0,'live_certification':'PENDING POST-INSTALL'})
print('ALICE_SINGLE_FILE_'+phase.upper()+'_PASS')
