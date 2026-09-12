"""Complete offline reconstruction and deterministic checks; no marketplace traffic."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys,zipfile
p=Path('tooling/llm-api-bridges/wildberries/progress').resolve();f=p/'phase1';b=f/'block009_full_runtime';control=f/'block010_final'
out=Path('wb-build-output').resolve();out.mkdir(exist_ok=True)
shutil.copytree(f,out/'saved-recipes',ignore=shutil.ignore_patterns('*.zip','__pycache__'))
shutil.copytree(p/'baselines',out/'saved-baselines',ignore=shutil.ignore_patterns('*.zip','__pycache__'))
for n in ['EXECUTION_CURSOR.json','FEATURE_STATUS.json','TEST_STATUS.json','README.md']:shutil.copy2(p/n,out/n)
shutil.copy2(p.parent/'WB_OZON_PARITY_MIGRATION_AND_TEST_AUTHORITY_2026-09-11.md',out/'MIGRATION_AUTHORITY.md')
def run(name,args):
 with (out/(name+'.stdout')).open('w') as stdout,(out/(name+'.stderr')).open('w') as stderr:
  try:code=subprocess.run(args,stdout=stdout,stderr=stderr,timeout=90).returncode
  except subprocess.TimeoutExpired:code=124
 with (out/'steps.jsonl').open('a') as h:h.write(json.dumps({'step':name,'exit_code':code,'args':list(map(str,args))})+'\n');h.flush();os.fsync(h.fileno())
 print(name,code,(out/(name+'.stdout')).read_text()[-1000:],(out/(name+'.stderr')).read_text()[-1000:],flush=True)
 if code:raise RuntimeError(name)
def members(root):return {x.relative_to(root).as_posix():x.read_bytes() for x in sorted(root.rglob('*')) if x.is_file() and '.git' not in x.parts}
def package(root,version,date,expected):
 file=out/('wildberries-bridge-v'+version+'-extension.zip')
 with zipfile.ZipFile(file,'x',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for n,data in members(root).items():
   e=zipfile.ZipInfo('wildberries-bridge-v'+version+'/'+n,date);e.compress_type=zipfile.ZIP_DEFLATED;e.external_attr=0o100644<<16;z.writestr(e,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
 digest=hashlib.sha256(file.read_bytes()).hexdigest()
 if digest!=expected:raise RuntimeError('Unexpected archive hash '+digest)
 return file
try:
 py=sys.executable;z12=out/'wb012.zip';z13=out/'wb013.zip';z14=out/'wb014.zip';work=out/'workspace'
 run('baseline012-verified',[py,str(control/'restore_verified_012.py'),str(p/'baselines/wb-v0.1.2'),str(z12)])
 run('baseline013',[py,str(f/'REBUILD_CANDIDATE.py'),str(z12),str(z13)])
 run('baseline014',[py,str(f/'block007/REBUILD_V014.py'),str(z13),str(f),str(z14)])
 run('full-runtime',[py,str(b/'RESTORE.py'),str(z14),str(work)])
 tests=out/'tests001';run('worker-tests-restore',[py,str(b/'tests001/RESTORE.py'),str(tests)])
 run('worker-fix-check',['git','-C',str(work),'apply','--check',str(tests/'source-fix.diff')])
 run('worker-fix',['git','-C',str(work),'apply',str(tests/'source-fix.diff')])
 run('browser-fix',[py,str(b/'browser-controls/APPLY.py'),str(work)])
 run('freeze020',[py,str(b/'freeze020/FINALIZE.py'),str(work)])
 package(work/'src','0.2.0',(2026,9,11,0,0,0),'58650cd988ea67ee5d080d679a3fc93ff4af365f63e4ea95548647e4f039dea3')
 run('boundary-repair021',[py,str(control/'repair_boundaries.py'),str(work/'src')])
 archive=package(work/'src','0.2.1',(2026,9,12,0,0,0),'ceeadd4d4302de5fe8989f27fe0be1f0363665e49ef19b56d8e4075e8a956a23')
 tested=out/'tested021';tested.mkdir()
 with zipfile.ZipFile(archive) as z:
  for n in z.namelist():
   target=tested/Path(*Path(n).parts[1:]);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(n))
 hashes={n:hashlib.sha256(data).hexdigest() for n,data in members(tested).items()};(out/'SOURCE_HASHES.json').write_text(json.dumps(hashes,indent=2))
 for x in sorted(tested.rglob('*.js')):run('syntax-'+x.relative_to(tested).as_posix().replace('/','__'),['node','--check',str(x)])
 for n in ('block006','block007'):run('restore-'+n,[py,str(f/n/'RESTORE_SNAPSHOT.py'),str(out/(n+'-restored'))])
 original=out/'original012';original.mkdir()
 with zipfile.ZipFile(z12) as z:
  for n in z.namelist():
   if n.endswith('/'):continue
   target=original/Path(*Path(n).parts[1:]);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(n))
 suites=[('contract',f/'block001/contract.mjs',[str(original)]),('policy',tests/'tests/policy_artifacts.mjs',[]),('work',tests/'tests/work_delivery_worker.mjs',[]),('protocol',f/'block004/protocol.mjs',[]),('batch',out/'block006-restored/tests/batch_worker.mjs',[]),('legacy-worker',f/'block003/worker_error.mjs',[])]
 results=[]
 for name,script,leading in suites:
  evidence=out/('test-'+name);run('test-'+name,['node',str(script),*leading,str(tested),str(evidence)]);results.append(json.loads((evidence/'summary.json').read_text()))
 assert hashes=={n:hashlib.sha256(data).hexdigest() for n,data in members(tested).items()},'Tested source changed'
 summary={'status':'EXACT_RECONSTRUCTION_AND_CI_DETERMINISTIC_PASS','source_input_commit':'320467b9d1685550aadc004054699e00576511fb','artifact':archive.name,'artifact_bytes':archive.stat().st_size,'artifact_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'production_files':len(hashes),'deterministic_assertions':sum(s['passed'] for s in results),'suites':results,'real_wb_requests':0,'browser_tests':'LOCAL_SEPARATE_EVIDENCE','live_certification':'PENDING_POST_INSTALL'}
 (out/'RECONSTRUCTION.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary),flush=True)
finally:
 for d in out.rglob('.git'):
  if d.is_dir():shutil.rmtree(d)
 (out/'FILE_LIST.json').write_text(json.dumps([x.relative_to(out).as_posix() for x in out.rglob('*') if x.is_file()],indent=2))
