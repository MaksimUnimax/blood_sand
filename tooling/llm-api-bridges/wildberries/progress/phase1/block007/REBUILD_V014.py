#!/usr/bin/env python3
"""Rebuild WB 0.1.4 from pinned WB0.1.3 + repository blocks004..006.
Usage: python -X utf8 REBUILD_V014.py WB013.zip PHASE1_DIRECTORY NEW_OUTPUT.zip
Requires only Python standard library; never calls a marketplace or GitHub API.
"""
from pathlib import Path
import base64,hashlib,json,lzma,os,subprocess,sys,tempfile,zipfile
BASE='b6628d00fba1b98f1a0dfe37f0d658b6cd00842b071e4bc927a2ae58f2859ceb'
SNAPSHOT='5bb293734232f2e49f61bdb3ed2448b38b5e9bdcbfd427fbb6e0086f08e31f5f'
EXPECTED='725c7e4bccb22d132b9e624f4acaa3a79a4f502635f3ff64da2b600124f32f8f'
def hashes(root):return {p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file()}
def main():
 if len(sys.argv)!=4:raise SystemExit(__doc__)
 archive,phase,out=map(lambda v:Path(v).resolve(),sys.argv[1:])
 if out.exists():raise SystemExit('Output exists; refusing overwrite')
 if hashlib.sha256(archive.read_bytes()).hexdigest()!=BASE:raise SystemExit('Wrong input archive')
 with tempfile.TemporaryDirectory(prefix='wb014-rebuild-') as temp:
  temp=Path(temp);candidate=temp/'candidate';candidate.mkdir();snap=temp/'snapshot';snap.mkdir()
  with zipfile.ZipFile(archive) as z:
   if z.testzip():raise SystemExit('Bad input ZIP CRC')
   for item in z.infolist():
    if item.is_dir():continue
    rel=Path(item.filename)
    if rel.is_absolute() or '..' in rel.parts or '\\' in item.filename:raise SystemExit('Unsafe ZIP member')
    target=candidate/Path(*rel.parts[1:]);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(item))
  encoded=''.join((phase/'block006'/f'snapshot.part{i:02d}').read_text().strip() for i in range(1,5))
  raw=lzma.decompress(base64.b64decode(encoded,validate=True))
  if hashlib.sha256(raw).hexdigest()!=SNAPSHOT:raise SystemExit('Wrong snapshot')
  for name,value in json.loads(raw).items():
   if Path(name).is_absolute() or '..' in Path(name).parts or not isinstance(value,str):raise SystemExit('Unsafe snapshot member')
   target=snap/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(value.encode())
  for name in ['block004/wb_command_protocol.js','block005/wb_batch_runtime.js']:(candidate/'shared'/Path(name).name).write_bytes((phase/name).read_bytes())
  for script in [phase/'block005/apply_worker.py',snap/'recipe/apply_content.py',snap/'recipe/final_hardening.py']:
   subprocess.run([sys.executable,'-X','utf8',str(script),str(candidate)],check=True,timeout=20)
  if hashes(candidate)!=json.loads((snap/'SOURCE_HASHES.json').read_text()):raise SystemExit('19-file pre-bump integrity failed')
  for name in ['content_script.js','service_worker.js','popup.js','popup.html','shared/wb_contract.js','shared/runtime_names.js','manifest.json']:
   p=candidate/name;text=p.read_text(encoding='utf-8')
   if '0.1.3' not in text:raise SystemExit('Missing version authority '+name)
   p.write_bytes(text.replace('0.1.3','0.1.4').encode())
  out.parent.mkdir(parents=True,exist_ok=True)
  with zipfile.ZipFile(out,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
   for p in sorted(candidate.rglob('*')):
    if p.is_file():
     e=zipfile.ZipInfo('wildberries-bridge-v0.1.4-phase1-WIP/'+p.relative_to(candidate).as_posix(),date_time=(2026,9,11,0,0,0));e.compress_type=zipfile.ZIP_DEFLATED;e.external_attr=0o100644<<16;z.writestr(e,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
  digest=hashlib.sha256(out.read_bytes()).hexdigest()
  if digest!=EXPECTED:raise SystemExit('Compressed ZIP differs (check zlib version); preserve output, do not claim exact ZIP parity: '+digest)
  print(json.dumps({'bytes':out.stat().st_size,'sha256':digest,'files':len(hashes(candidate)),'result':'EXACT_ZIP_PASS'}))
if __name__=='__main__':main()
