#!/usr/bin/env python3
"""Restore block007 actual runners, receipts and raw evidence; offline.
Usage: python -X utf8 RESTORE_SNAPSHOT.py NEW_DIRECTORY
"""
from pathlib import Path
import base64,hashlib,json,lzma,sys
HERE=Path(__file__).resolve().parent
EXPECTED='db7d4042998ef4d7d2b03f697e8729239c83d59074dbb52f27077fb306aa97d8'
def main():
 if len(sys.argv)!=2:raise SystemExit(__doc__)
 out=Path(sys.argv[1]).resolve()
 if out.exists():raise SystemExit('Refusing to overwrite an existing directory')
 raw=lzma.decompress(base64.b64decode(''.join((HERE/f'snapshot.part{i:02}').read_text().strip() for i in range(1,4)),validate=True))
 if hashlib.sha256(raw).hexdigest()!=EXPECTED:raise SystemExit('Snapshot integrity mismatch')
 files=json.loads(raw)
 if len(files)!=97:raise SystemExit('Unexpected snapshot file count')
 for name,value in files.items():
  rel=Path(name)
  if rel.is_absolute() or '..' in rel.parts or '\\' in name or not isinstance(value,str):raise SystemExit('Unsafe snapshot member')
 out.mkdir(parents=True)
 for name,value in files.items():
  p=out/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(value.encode('utf-8'))
 print('RESTORED',len(files),'files',EXPECTED)
if __name__=='__main__':main()
