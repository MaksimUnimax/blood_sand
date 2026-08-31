#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import tarfile
from pathlib import Path

SOURCE_B64_BYTES = 60084
SOURCE_B64_SHA256 = "e430c1b9687187009982be8a1a29e8562adbe9e506a9eb08461056710d8fa46e"
SOURCE_GZIP_BYTES = 45063
SOURCE_GZIP_SHA256 = "c07eac177485b92dc99ccd309866832cf892531ce3fb0c06321850fc2555dd1c"
PARTS_DIR = Path("tooling/llm-api-bridges/ozon-seller/validation/step7-remote-v2-upload/source-bundle-parts")
FIX_DIR = Path("tooling/llm-api-bridges/ozon-seller/validation/step7-remote-v2-upload/source-bundle-part4-fix")

SOURCE_PARTS = (
    (PARTS_DIR / "part0001.txt", 7500, "1669b747ff8286296ec2de3fc30d78a9202d7f8adf203cb77c53f97d7dafd139"),
    (PARTS_DIR / "part0002.txt", 7500, "5389969511ba34b0179071948ea29c8120ea3faba4047d569f535068323be012"),
    (PARTS_DIR / "part0003.txt", 7500, "c4a827483286144a81e214b95aaace3be0ac06819a084e5b4314f3f7f3c3cd11"),
    (FIX_DIR / "part0004-1.txt", 1875, "18659f40ed7586418d86dc471fc762a8c11d0ea866a87011acdcaa095a8155ed"),
    (FIX_DIR / "part0004-2.txt", 1875, "ba97f4a5cd62065aeba4a11d81396ae2658e9f0ea54d0df03fc4f2c1a58bc4b8"),
    (FIX_DIR / "part0004-3.txt", 1875, "565e42f5be9f088156105cf1e496891364546a239cb911624fd50598828436b6"),
    (FIX_DIR / "part0004-4.txt", 1875, "890d132fd4fec32f0ad7cad710643b389f877716658e58fc0c9ef3bc09a7a7e6"),
    (PARTS_DIR / "part0005.txt", 7500, "eb92db2c6c2748854ece4cc0ecc6b1b535d864cf99b35d2c1b6d2394a0c10695"),
    (PARTS_DIR / "part0006.txt", 7500, "b0b4b39895205e5dc646ef88a9be7b20a7377c0fb3f8e297ceb77bc4664bdbee"),
    (PARTS_DIR / "part0007.txt", 7500, "518db0d6ffcf06d31deb963f9fe9aa92fa2a3372a0d10d6a70b0fc860930666d"),
    (PARTS_DIR / "part0008.txt", 7500, "1dd3c413285fa2ef9f4fca30a9c75310d76e7b2319ca3f7fcb25cb7a0e613dd1"),
    (PARTS_DIR / "part0009.txt", 84, "9e6d923238f560b3eeaa6dbd3689c0c2a88f4c3bdd2aaa3c87735988821ebb31"),
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    args = parser.parse_args()
    root = args.repo_root.resolve()

    expected_base_names = [f"part{i:04d}.txt" for i in range(1, 10)]
    actual_base_names = sorted(p.name for p in (root / PARTS_DIR).iterdir() if p.is_file())
    if actual_base_names != expected_base_names:
        raise RuntimeError(f"base carrier file set mismatch: {actual_base_names!r}")
    expected_fix_names = [f"part0004-{i}.txt" for i in range(1, 5)]
    actual_fix_names = sorted(p.name for p in (root / FIX_DIR).iterdir() if p.is_file())
    if actual_fix_names != expected_fix_names:
        raise RuntimeError(f"part0004 fix file set mismatch: {actual_fix_names!r}")

    chunks: list[bytes] = []
    failures: list[dict[str, object]] = []
    for relative, expected_bytes, expected_sha256 in SOURCE_PARTS:
        path = root / relative
        raw = path.read_bytes()
        actual_sha256 = hashlib.sha256(raw).hexdigest()
        if len(raw) != expected_bytes or actual_sha256 != expected_sha256 or any(byte in b" \t\r\n" for byte in raw):
            failures.append({
                "path": relative.as_posix(),
                "expected_bytes": expected_bytes,
                "actual_bytes": len(raw),
                "expected_sha256": expected_sha256,
                "actual_sha256": actual_sha256,
                "contains_whitespace": any(byte in b" \t\r\n" for byte in raw),
            })
        chunks.append(raw)
    if failures:
        raise RuntimeError("source carrier part mismatch: " + json.dumps(failures, sort_keys=True))

    encoded = b"".join(chunks)
    if len(encoded) != SOURCE_B64_BYTES or hashlib.sha256(encoded).hexdigest() != SOURCE_B64_SHA256:
        raise RuntimeError("concatenated source carrier identity mismatch")
    compressed = base64.b64decode(encoded, validate=True)
    if len(compressed) != SOURCE_GZIP_BYTES or hashlib.sha256(compressed).hexdigest() != SOURCE_GZIP_SHA256:
        raise RuntimeError("decoded source bundle identity mismatch")

    with tarfile.open(fileobj=io.BytesIO(compressed), mode="r:gz") as archive:
        members = archive.getmembers()
        if not members:
            raise RuntimeError("source bundle is empty")
        for member in members:
            target = (root / member.name).resolve()
            if not (target == root or root in target.parents):
                raise RuntimeError(f"unsafe source bundle path: {member.name}")
            if not member.isfile():
                raise RuntimeError(f"non-regular source bundle member: {member.name}")
        archive.extractall(root)

    gate = root / "tooling/llm-api-bridges/ozon-seller/validation/step7-remote-v2/run_full_gate.py"
    if not gate.is_file():
        raise RuntimeError("full Step7 gate was not restored")
    print("STEP7_MULTIPART_SOURCE_CARRIER_PASS")
    print("STEP7_REMOTE_SOURCE_BUNDLE_RESTORED_PASS")


if __name__ == "__main__":
    main()
