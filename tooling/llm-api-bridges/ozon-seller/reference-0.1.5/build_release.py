from pathlib import Path
import argparse, hashlib, zipfile
EXPECTED = "130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651"
parser=argparse.ArgumentParser()
parser.add_argument('--source', default='ozon-bridge-v0.1.5-extension')
parser.add_argument('--output', default='ozon-bridge-v0.1.5-extension.zip')
args=parser.parse_args()
root=Path(args.source).resolve(); out=Path(args.output).resolve(); base=root.parent
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(root.rglob('*')):
        if not p.is_file(): continue
        info=zipfile.ZipInfo(p.relative_to(base).as_posix(),date_time=(2026,8,12,8,50,0))
        info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=(0o644 & 0xFFFF)<<16
        z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
sha=hashlib.sha256(out.read_bytes()).hexdigest()
if sha != EXPECTED: raise SystemExit(f'release SHA mismatch: {sha} != {EXPECTED}')
print(f'{sha}  {out.name}')
