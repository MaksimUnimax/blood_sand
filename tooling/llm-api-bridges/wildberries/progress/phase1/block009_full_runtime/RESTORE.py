#!/usr/bin/env python3
"""Offline WIP reconstruction: python RESTORE.py PINNED_WB014.zip NEW_DIR
Requires Python standard library and git. No network or credentials. This is an
unaccepted pre-test source checkpoint, not an installation handoff.
"""
from pathlib import Path
import base64,hashlib,lzma,subprocess,sys,zipfile
HERE=Path(__file__).resolve().parent
BASE='725c7e4bccb22d132b9e624f4acaa3a79a4f502635f3ff64da2b600124f32f8f'
DIFF='642ae881a9bef89518f6667ce9cfb9b86405610475476fcf76559aff9c519472'
def main():
 if len(sys.argv)!=3:raise SystemExit(__doc__)
 archive,out=map(lambda s:Path(s).resolve(),sys.argv[1:])
 if out.exists():raise SystemExit('Refusing overwrite')
 if hashlib.sha256(archive.read_bytes()).hexdigest()!=BASE:raise SystemExit('Wrong WB014 input')
 raw=lzma.decompress(base64.b64decode(''.join((HERE/f'source.part{i:02}').read_text().strip() for i in range(1,9)),validate=True))
 if hashlib.sha256(raw).hexdigest()!=DIFF:raise SystemExit('Diff integrity failed')
 out.mkdir(parents=True);(out/'src').mkdir()
 with zipfile.ZipFile(archive) as z:
  if z.testzip():raise SystemExit('ZIP CRC failure')
  for member in z.infolist():
   if member.is_dir():continue
   p=Path(member.filename)
   if p.is_absolute() or '..' in p.parts or '\\' in member.filename:raise SystemExit('Unsafe member')
   target=out/'src'/Path(*p.parts[1:]);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(member))
 patch=out/'source.patch';patch.write_bytes(raw)
 subprocess.run(['git','init','-q',str(out)],check=True,timeout=15)
 subprocess.run(['git','-C',str(out),'apply','--check',str(patch)],check=True,timeout=15)
 subprocess.run(['git','-C',str(out),'apply',str(patch)],check=True,timeout=15)
 print('RESTORED_WIP_SOURCE',out/'src','NOT_YET_ACCEPTED')
if __name__=='__main__':main()
