#!/usr/bin/env python3
"""Offline reconstruction of the intermediate WB candidate; never contacts WB.
python -X utf8 REBUILD_CANDIDATE.py ORIGINAL_WB.zip NEW_OUTPUT.zip
"""
import hashlib,os,subprocess,sys,tempfile,zipfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
EXPECTED='b6628d00fba1b98f1a0dfe37f0d658b6cd00842b071e4bc927a2ae58f2859ceb'
def main():
    if len(sys.argv)!=3:raise SystemExit(__doc__)
    original=Path(sys.argv[1]).resolve();output=Path(sys.argv[2]).resolve()
    if output.exists():raise SystemExit('Output already exists; refusing to replace it')
    output.parent.mkdir(parents=True,exist_ok=True)
    env={**os.environ,'PYTHONUTF8':'1'}
    with tempfile.TemporaryDirectory(prefix='wb-rebuild-') as temp:
        candidate=Path(temp)/'candidate'
        scripts=[('block001/MATERIALIZE.py',[str(original),str(candidate)]),('block002/APPLY_BLOCK002.py',[str(candidate)]),('block003/APPLY_BLOCK003.py',[str(candidate)])]
        for script,args in scripts:
            subprocess.run([sys.executable,'-X','utf8',str(HERE/script),*args],check=True,env=env,timeout=30)
        with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
            for p in sorted(candidate.rglob('*')):
                if p.is_file():
                    entry=zipfile.ZipInfo('wildberries-bridge-v0.1.3-phase1-WIP/'+p.relative_to(candidate).as_posix(),date_time=(2026,9,11,0,0,0))
                    entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16
                    z.writestr(entry,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
    actual=hashlib.sha256(output.read_bytes()).hexdigest()
    if actual!=EXPECTED:
        raise SystemExit('ZIP hash mismatch; preserve file for inspection. A different zlib version may change compressed bytes. Do not claim exact artifact parity: '+actual)
    print('EXACT_CANDIDATE',output.stat().st_size,actual)
if __name__=='__main__':main()
