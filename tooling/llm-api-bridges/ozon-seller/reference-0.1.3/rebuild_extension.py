#!/usr/bin/env python3
from pathlib import Path
import base64
import hashlib

ROOT = Path(__file__).resolve().parent
PARTS = ROOT / "archive-exact"
OUT = ROOT / "ozon-bridge-v0.1.3-extension.zip"
EXPECTED_SIZE = 79343
EXPECTED_SHA256 = "fe535cbe1f34d7a1e7684346ca7cad0a71c3ff6ac1018854cde03dd26fe6c5a9"

names = [f"ozon-bridge-v0.1.3-extension.zip.b64.part{i:02d}" for i in range(1, 10)]
missing = [name for name in names if not (PARTS / name).is_file()]
if missing:
    raise SystemExit("Missing archive parts: " + ", ".join(missing))

encoded = "".join((PARTS / name).read_text(encoding="ascii").strip() for name in names)
try:
    payload = base64.b64decode(encoded, validate=True)
except Exception as exc:
    raise SystemExit(f"Base64 decode failed: {exc}") from exc

size = len(payload)
sha = hashlib.sha256(payload).hexdigest()
if size != EXPECTED_SIZE or sha != EXPECTED_SHA256:
    raise SystemExit(f"Integrity check failed: size={size}, sha256={sha}")

OUT.write_bytes(payload)
print(f"OK {OUT.name} size={size} sha256={sha}")
