#!/usr/bin/env python3
from pathlib import Path
import hashlib, sys
p=Path(__file__).with_name("wildberries-bridge-v0.1.1-extension.zip")
expected="3ffd3c2158c67723c62aa2b6d7a73c152e964e7ab030fecf8a6d67666030f3a2"
expected_size=82701
data=p.read_bytes()
actual=hashlib.sha256(data).hexdigest()
if len(data)!=expected_size or actual!=expected:
    raise SystemExit(f"artifact mismatch: size={len(data)} sha256={actual}")
print(f"PASS {p.name} {len(data)} bytes {actual}")
