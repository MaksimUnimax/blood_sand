#!/usr/bin/env python3
"""Offline checks of this exact intermediate ZIP; not full migration acceptance.
Usage: python package_checks.py ORIGINAL_EXTRACTED NEW_EXTRACTED ZIP REBUILT_ZIP NEW_RESULTS_DIR
"""
import hashlib,json,os,subprocess,sys
from pathlib import Path
baseline,candidate,archive,reconstructed,dest=map(lambda p:Path(p).resolve(),sys.argv[1:])
dest.mkdir(parents=True,exist_ok=False);rows=[]
def check(name,passed,detail=None):
    d={'id':name,'status':'PASS' if passed else 'FAIL','detail':detail};rows.append(d)
    with (dest/'results.jsonl').open('a',encoding='utf-8') as f:
        f.write(json.dumps(d)+'\n');f.flush();os.fsync(f.fileno())
manifest=json.loads((candidate/'manifest.json').read_text(encoding='utf-8'));old=json.loads((baseline/'manifest.json').read_text(encoding='utf-8'))
check('MANIFEST-VERSION',manifest['version']=='0.1.3')
check('PERMISSIONS-UNCHANGED',manifest['permissions']==old['permissions'])
check('HOST-PERMISSIONS-UNCHANGED',manifest['host_permissions']==old['host_permissions'])
check('CONTENT-SCRIPT-SCOPE-UNCHANGED',manifest['content_scripts']==old['content_scripts'])
check('PACKAGED-FILE-SET',sorted(str(p.relative_to(candidate)) for p in candidate.rglob('*') if p.is_file())==sorted(str(p.relative_to(baseline)) for p in baseline.rglob('*') if p.is_file()))
refs=[manifest['background']['service_worker'],manifest['action']['default_popup']]+[f for c in manifest['content_scripts'] for f in c['js']]
check('MANIFEST-FILE-REFERENCES',all((candidate/f).is_file() for f in refs))
for f in ['shared/wb_operations.js','shared/wb_provider.js','shared/wb_credentials.js','shared/provider_transport_core.js']:
    check('UNCHANGED:'+f,(baseline/f).read_bytes()==(candidate/f).read_bytes())
for p in sorted(candidate.rglob('*.js')):
    result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True,timeout=10)
    name=str(p.relative_to(candidate)).replace('/','__').replace('\\','__')
    (dest/(name+'.stdout')).write_text(result.stdout,encoding='utf-8');(dest/(name+'.stderr')).write_text(result.stderr,encoding='utf-8')
    check('SYNTAX:'+str(p.relative_to(candidate)),result.returncode==0,{'exit_code':result.returncode})
check('RECONSTRUCTION-EXACT',reconstructed.read_bytes()==archive.read_bytes())
check('EXACT-ZIP-HASH',hashlib.sha256(archive.read_bytes()).hexdigest()=='b6628d00fba1b98f1a0dfe37f0d658b6cd00842b071e4bc927a2ae58f2859ceb')
summary={'checks':len(rows),'passed':sum(x['status']=='PASS' for x in rows),'failed':sum(x['status']=='FAIL' for x in rows),'scope':'exact artifact, reconstruction, manifest, syntax; not all migration gates'}
(dest/'summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8');print(json.dumps(summary,indent=2));sys.exit(bool(summary['failed']))
