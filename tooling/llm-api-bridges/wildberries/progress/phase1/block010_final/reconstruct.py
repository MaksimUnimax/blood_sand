from pathlib import Path
import hashlib, json, os, shutil, subprocess, sys, zipfile
p = Path('tooling/llm-api-bridges/wildberries/progress').resolve()
f = p/'phase1'; b = f/'block009_full_runtime'
out=Path('wb-build-output').resolve();out.mkdir(exist_ok=True)
# Preserve byte-exact repository recipes before ANY potentially failing step.
shutil.copytree(f,out/'saved-recipes',ignore=shutil.ignore_patterns('*.zip','__pycache__'))
for name in ['EXECUTION_CURSOR.json','FEATURE_STATUS.json','TEST_STATUS.json','README.md']:
 shutil.copy2(p/name,out/name)
shutil.copy2(p.parent/'WB_OZON_PARITY_MIGRATION_AND_TEST_AUTHORITY_2026-09-11.md',out/'MIGRATION_AUTHORITY.md')
shutil.copytree(p/'baselines',out/'saved-baselines',ignore=shutil.ignore_patterns('*.zip','__pycache__'))
(out/'REPOSITORY_RECIPE_HASHES.json').write_text(json.dumps({x.relative_to(out).as_posix():hashlib.sha256(x.read_bytes()).hexdigest() for x in sorted(out.rglob('*')) if x.is_file()},indent=2))
def run(name,args,cwd=None):
 r=subprocess.run(args,cwd=cwd,capture_output=True,text=True,timeout=90)
 (out/(name+'.stdout')).write_text(r.stdout);(out/(name+'.stderr')).write_text(r.stderr)
 with (out/'steps.jsonl').open('a') as h:
  h.write(json.dumps({'step':name,'exit_code':r.returncode,'args':list(map(str,args))})+'\n');h.flush();os.fsync(h.fileno())
 print(name,r.returncode,r.stdout[-1200:],r.stderr[-1200:],flush=True)
 if r.returncode:raise RuntimeError(name)
try:
 py=sys.executable
 run('baseline012',[py,str(p/'baselines/wb-v0.1.2/rebuild_extension.py')])
 z12=p/'baselines/wb-v0.1.2/wildberries-bridge-v0.1.2-extension.zip'
 z13=out/'wb013.zip';z14=out/'wb014.zip';work=out/'workspace'
 run('baseline013',[py,str(f/'REBUILD_CANDIDATE.py'),str(z12),str(z13)])
 run('baseline014',[py,str(f/'block007/REBUILD_V014.py'),str(z13),str(f),str(z14)])
 run('full-runtime',[py,str(b/'RESTORE.py'),str(z14),str(work)])
 tests=out/'tests001';run('worker-tests-restore',[py,str(b/'tests001/RESTORE.py'),str(tests)])
 run('worker-fix-check',['git','-C',str(work),'apply','--check',str(tests/'source-fix.diff')])
 run('worker-fix',['git','-C',str(work),'apply',str(tests/'source-fix.diff')])
 run('browser-fix',[py,str(b/'browser-controls/APPLY.py'),str(work)])
 run('freeze020',[py,str(b/'freeze020/FINALIZE.py'),str(work)])
 for n in ('block006','block007'):
  run('restore-'+n,[py,str(f/n/'RESTORE_SNAPSHOT.py'),str(out/(n+'-restored'))])
 shutil.copy2(z12,out/z12.name)
 source=work/'src';hashes={x.relative_to(source).as_posix():hashlib.sha256(x.read_bytes()).hexdigest() for x in sorted(source.rglob('*')) if x.is_file()}
 (out/'SOURCE_HASHES.json').write_text(json.dumps(hashes,indent=2)+'\n')
 for x in sorted(source.rglob('*.js')): run('syntax-'+x.relative_to(source).as_posix().replace('/','__'),['node','--check',str(x)])
 archive=out/'wildberries-bridge-v0.2.0-candidate.zip'
 with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for x in sorted(source.rglob('*')):
   if x.is_file():
    e=zipfile.ZipInfo('wildberries-bridge-v0.2.0/'+x.relative_to(source).as_posix(),(2026,9,11,0,0,0));e.compress_type=zipfile.ZIP_DEFLATED;e.external_attr=0o100644<<16
    z.writestr(e,x.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
 (out/'RECONSTRUCTION.json').write_text(json.dumps({'source_commit':'320467b9d1685550aadc004054699e00576511fb','source_files':len(hashes),'archive_bytes':archive.stat().st_size,'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'status':'SOURCE_RECONSTRUCTED_SYNTAX_CHECKED','behavioral_tests':'NOT_RUN_BY_THIS_SCRIPT','real_wb_calls':0},indent=2)+'\n')
finally:
 for d in out.rglob('.git'):
  if d.is_dir():shutil.rmtree(d)
 (out/'FILE_LIST.json').write_text(json.dumps([x.relative_to(out).as_posix() for x in out.rglob('*') if x.is_file()],indent=2))
