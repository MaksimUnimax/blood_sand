from pathlib import Path
import argparse, hashlib, zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--source', default='ozon-bridge-v0.1.4-extension')
parser.add_argument('--output', default='ozon-bridge-v0.1.4-extension.zip')
args = parser.parse_args()
root = Path(args.source).resolve()
out = Path(args.output).resolve()
base = root.parent
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(root.rglob('*')):
        if not path.is_file():
            continue
        info = zipfile.ZipInfo(path.relative_to(base).as_posix(), date_time=(2026, 8, 12, 12, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = (0o644 & 0xFFFF) << 16
        archive.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
sha = hashlib.sha256(out.read_bytes()).hexdigest()
print(f'{sha}  {out.name}')
