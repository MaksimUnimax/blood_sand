"""Restore actual final QA runners, raw assertions and reports. No network.
python RESTORE.py NEW_DIRECTORY
"""
from pathlib import Path
import base64,hashlib,json,lzma,sys
here=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve()
if out.exists():raise SystemExit('Refusing overwrite')
expected='66a768130bf7da20f53386ed4540eb42d8bc1caf2899214a125cf94d74e357ea'
raw=lzma.decompress(base64.b64decode(''.join((here/f'evidence.part{i:02d}').read_text().strip() for i in range(1,7)),validate=True))
if len(raw)!=417359 or hashlib.sha256(raw).hexdigest()!=expected:raise SystemExit('Evidence integrity mismatch')
files=json.loads(raw)
if len(files)!=105:raise SystemExit('Evidence file count mismatch')
for name,text in files.items():
 p=Path(name)
 if not isinstance(text,str) or p.is_absolute() or '..' in p.parts or '\\' in name:raise SystemExit('Unsafe evidence member')
out.mkdir(parents=True)
for name,text in files.items():
 p=out/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(text.encode('utf-8'))
print('RESTORED105FILES',expected)
