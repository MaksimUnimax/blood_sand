#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARTS_DIR = ROOT / "archive-exact"
OUTPUT = ROOT / "wildberries-bridge-v0.1.2-extension.zip"
EXPECTED_SIZE = 84_964
EXPECTED_SHA256 = "56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715"
PART_GLOB = "wildberries-bridge-v0.1.2-extension.zip.b64.part*"


def main() -> None:
    parts = sorted(PARTS_DIR.glob(PART_GLOB))
    if len(parts) != 10:
        raise SystemExit(f"expected 10 archive parts, found {len(parts)}")

    expected_names = [f"wildberries-bridge-v0.1.2-extension.zip.b64.part{i:02d}" for i in range(1, 11)]
    actual_names = [p.name for p in parts]
    if actual_names != expected_names:
        raise SystemExit(f"archive part set/order mismatch: {actual_names!r}")

    encoded = b"".join(p.read_bytes().strip() for p in parts)
    try:
        payload = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise SystemExit(f"invalid base64 archive transport: {exc}") from exc

    size = len(payload)
    digest = hashlib.sha256(payload).hexdigest()
    if size != EXPECTED_SIZE:
        raise SystemExit(f"size mismatch: got {size}, expected {EXPECTED_SIZE}")
    if digest != EXPECTED_SHA256:
        raise SystemExit(f"sha256 mismatch: got {digest}, expected {EXPECTED_SHA256}")

    OUTPUT.write_bytes(payload)
    print(f"OK bytes={size} sha256={digest}")
    print(OUTPUT)


if __name__ == "__main__":
    main()
