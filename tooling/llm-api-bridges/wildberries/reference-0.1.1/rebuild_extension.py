#!/usr/bin/env python3
from pathlib import Path
import base64, hashlib
ROOT = Path(__file__).resolve().parent
PARTS = ROOT / 'archive-exact'
OUT = ROOT / 'wildberries-bridge-v0.1.1-extension.zip'
EXPECTED_SIZE = 82701
EXPECTED_SHA256 = '3ffd3c2158c67723c62aa2b6d7a73c152e964e7ab030fecf8a6d67666030f3a2'
chunks = [p.read_text(encoding='ascii').strip() for p in sorted(PARTS.glob('*.b64.part*'))]
if not chunks:
    raise SystemExit('no archive parts found')
data = base64.b64decode(''.join(chunks), validate=True)
sha = hashlib.sha256(data).hexdigest()
if len(data) != EXPECTED_SIZE or sha != EXPECTED_SHA256:
    raise SystemExit(f'artifact mismatch: size={len(data)} sha256={sha}')
OUT.write_bytes(data)
print(f'PASS {OUT.name} {len(data)} bytes {sha}')
