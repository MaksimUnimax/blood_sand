from pathlib import Path
import base64,lzma,json,hashlib,sys
h=Path(__file__).parent;o=Path(sys.argv[1]);o.mkdir(parents=True,exist_ok=False)
b=lzma.decompress(base64.b64decode(''.join((h/f'snapshot.part{i:02}').read_text().strip() for i in range(1,4)),validate=True))
assert hashlib.sha256(b).hexdigest()=='e23948dc4b8494032e37c3a189241b9389727415609af624711f57cab4eaa578'
for n,v in json.loads(b).items():
 p=Path(n);assert not p.is_absolute() and '..' not in p.parts
 t=o/p;t.parent.mkdir(parents=True,exist_ok=True);t.write_bytes(v.encode())
print('RESTORED 14 source/test/evidence files; apply source-fix.diff to the block009 source using git apply.')
