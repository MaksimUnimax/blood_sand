#!/usr/bin/env python3
"""Restore actual code recipes, test runners, diffs and raw evidence, offline.
python -X utf8 RESTORE_SNAPSHOT.py NEW_DIRECTORY
"""
import base64,hashlib,json,lzma,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
EXPECTED='5bb293734232f2e49f61bdb3ed2448b38b5e9bdcbfd427fbb6e0086f08e31f5f'
def main():
    if len(sys.argv)!=2:raise SystemExit(__doc__)
    output=Path(sys.argv[1]).resolve()
    if output.exists():raise SystemExit('Refusing to overwrite an existing directory')
    parts=[HERE/f'snapshot.part{i:02d}' for i in range(1,5)]
    raw=lzma.decompress(base64.b64decode(''.join(p.read_text().strip() for p in parts),validate=True))
    if hashlib.sha256(raw).hexdigest()!=EXPECTED:raise SystemExit('Snapshot SHA-256 mismatch')
    files=json.loads(raw)
    for name,value in files.items():
        rel=Path(name)
        if rel.is_absolute() or '..' in rel.parts or not isinstance(value,str):raise SystemExit('Unsafe snapshot member')
    output.mkdir(parents=True)
    for name,value in files.items():
        target=output/name;target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(value.encode('utf-8'))
    print('RESTORED',len(files),'files; SHA256',EXPECTED)
if __name__=='__main__':main()
