#!/usr/bin/env python3
"""Rebuild the Step 8 evidence ZIP without compression for cross-platform byte identity."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import zipfile
from pathlib import Path

PACKAGE = "OZON_BRIDGE_v0.1.19_STEP8_PERFORMANCE_48_TERMINAL_CANDIDATE.zip"
MANIFEST = "OZON_PERFORMANCE_STEP8_PACKAGE_MANIFEST.json"
SEMANTIC = "semantic-proof.json"


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = args.output.resolve()

    manifest_path = root / MANIFEST
    semantic_path = root / SEMANTIC
    package_path = root / PACKAGE
    require(manifest_path.is_file(), f"missing manifest: {manifest_path}")
    require(semantic_path.is_file(), f"missing semantic proof: {semantic_path}")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    member_names = manifest.get("package_members", [])
    require(isinstance(member_names, list) and len(member_names) == len(set(member_names)), "invalid package member list")
    require(MANIFEST in member_names and PACKAGE not in member_names and SEMANTIC not in member_names, "invalid package boundary")
    members = [root / name for name in sorted(member_names)]
    require(all(member.is_file() for member in members), "package member missing")

    temp = package_path.with_suffix(".zip.tmp")
    if temp.exists():
        temp.unlink()
    with zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_STORED) as archive:
        for member in members:
            info = zipfile.ZipInfo(member.name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_STORED
            info.create_system = 3
            info.external_attr = (0o100644 & 0xFFFF) << 16
            archive.writestr(info, member.read_bytes())
    os.replace(temp, package_path)

    with zipfile.ZipFile(package_path, "r") as archive:
        require(archive.namelist() == [member.name for member in members], "stored package member ordering mismatch")
        for member in members:
            require(archive.read(member.name) == member.read_bytes(), f"stored package member mismatch: {member.name}")

    semantic = json.loads(semantic_path.read_text(encoding="utf-8"))
    semantic["package_sha256"] = sha256(package_path)
    semantic["package_bytes"] = package_path.stat().st_size
    semantic["package_compression"] = "ZIP_STORED_CROSS_PLATFORM_DETERMINISTIC"
    semantic_path.write_text(
        json.dumps(semantic, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    print("PERFORMANCE_STEP8_CROSS_PLATFORM_STORED_PACKAGE_PASS")
    print(semantic["package_sha256"])
    print(semantic["package_bytes"])


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"PERFORMANCE_STEP8_PACKAGE_STABILIZATION_FAIL: {exc}", file=sys.stderr)
        raise
