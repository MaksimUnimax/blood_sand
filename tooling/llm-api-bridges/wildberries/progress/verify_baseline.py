#!/usr/bin/env python3
"""Offline integrity/syntax checks for the ORIGINAL WB ZIP, not patch acceptance.
Usage: python verify_baseline.py ORIGINAL.zip OUTPUT_DIRECTORY
Writes one fsynced JSONL record per check and keeps subprocess stdout/stderr.
"""
import hashlib, json, os, shutil, subprocess, sys, tempfile, time, zipfile
from pathlib import Path

EXPECTED='56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715'
def main():
    archive=Path(sys.argv[1]).resolve(); out=Path(sys.argv[2]).resolve()
    out.mkdir(parents=True,exist_ok=False)
    digest=hashlib.sha256(archive.read_bytes()).hexdigest(); rows=[]
    def record(name,ok,details):
        row={'check':name,'status':'PASS' if ok else 'FAIL','scope':'ORIGINAL_BASELINE_ONLY','archive_sha256':digest,'details':details}
        with (out/'results.jsonl').open('a',encoding='utf-8') as f:
            f.write(json.dumps(row,ensure_ascii=False)+'\n');f.flush();os.fsync(f.fileno())
        rows.append(row);print(row['status'],name,flush=True)
    record('archive_identity',digest==EXPECTED and archive.stat().st_size==84964,{'bytes':archive.stat().st_size})
    if digest!=EXPECTED: return 2
    with zipfile.ZipFile(archive) as z:
        bad=z.testzip();record('zip_crc',bad is None,{'bad_member':bad})
        with tempfile.TemporaryDirectory(prefix='wb-baseline-') as temp:
            for name in z.namelist():
                p=Path(name)
                if p.is_absolute() or '..' in p.parts: raise ValueError('Unsafe archive member')
            z.extractall(temp)
            root=Path(temp)/'wildberries-bridge-v0.1.2-extension'
            manifest=json.loads((root/'manifest.json').read_text())
            refs=[manifest['background']['service_worker'],manifest['action']['default_popup']]
            refs += [p for item in manifest['content_scripts'] for p in item['js']]
            missing=[p for p in refs if not (root/p).is_file()]
            record('manifest_file_references',not missing,{'missing':missing,'refs':refs})
            node=shutil.which('node')
            if not node: raise RuntimeError('Node is required; no tests are silently marked PASS')
            for p in sorted(root.rglob('*.js')):
                c=subprocess.run([node,'--check',str(p)],capture_output=True,text=True,timeout=15)
                name='syntax__'+str(p.relative_to(root)).replace('/','__')
                (out/(name+'.stdout')).write_text(c.stdout)
                (out/(name+'.stderr')).write_text(c.stderr)
                record(name,c.returncode==0,{'exit_code':c.returncode,'file_sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
            js="const fs=require('fs'),vm=require('vm');const s={};vm.createContext(s);vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),s,{timeout:2000});const r=Object.values(s.WBOperations.OPERATIONS);const v={total:r.length,enabled:r.filter(x=>x.execution_enabled===true).length,disabled:r.filter(x=>x.execution_enabled===false).length};console.log(JSON.stringify(v));process.exit(v.total===188&&v.enabled===172&&v.disabled===16?0:1);"
            c=subprocess.run([node,'-e',js,str(root/'shared/wb_operations.js')],capture_output=True,text=True,timeout=15)
            (out/'registry.stdout').write_text(c.stdout);(out/'registry.stderr').write_text(c.stderr)
            record('registry_counts',c.returncode==0,{'exit_code':c.returncode,'stdout':c.stdout.strip()})
    summary={'scope':'ORIGINAL_BASELINE_ONLY_NOT_TA_ACCEPTANCE','checks':len(rows),'passed':sum(x['status']=='PASS' for x in rows),'failed':sum(x['status']=='FAIL' for x in rows),'real_wb_requests':0,'archive_sha256':digest}
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    return 0 if summary['failed']==0 else 1
if __name__=='__main__':
    raise SystemExit(main())
