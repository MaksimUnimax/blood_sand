#!/usr/bin/env python3
"""Run the Step 8 terminal builder and normalize its package to the declared manifest."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import zipfile
from pathlib import Path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    args = parser.parse_args()

    repo = args.repo_root.resolve()
    out = args.out.resolve()
    builder = repo / "tooling/llm-api-bridges/ozon-seller/validation/step8-performance-v1/build_step8_performance_terminal.py"
    verifier = repo / "tooling/llm-api-bridges/ozon-seller/validation/step8-performance-v1/verify_step8_performance_output.py"

    subprocess.run([
        sys.executable,
        str(builder),
        "--repo-root", str(repo),
        "--out", str(out),
        "--source-commit", args.source_commit,
    ], check=True)

    manifest_path = out / "OZON_PERFORMANCE_STEP8_PACKAGE_MANIFEST.json"
    package_path = out / "OZON_BRIDGE_v0.1.19_STEP8_PERFORMANCE_48_TERMINAL_CANDIDATE.zip"
    semantic_path = out / "semantic-proof.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    members = [out / row["path"] for row in manifest["files"]]
    for member in members:
        if not member.is_file():
            raise RuntimeError(f"manifest member missing: {member}")

    with zipfile.ZipFile(package_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for member in sorted(members, key=lambda path: path.name):
            info = zipfile.ZipInfo(member.name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o100644 & 0xFFFF) << 16
            archive.writestr(info, member.read_bytes())

    semantic = json.loads(semantic_path.read_text(encoding="utf-8"))
    semantic["package_sha256"] = sha256(package_path)
    semantic["package_bytes"] = package_path.stat().st_size
    semantic_path.write_text(
        json.dumps(semantic, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    subprocess.run([
        sys.executable,
        str(verifier),
        "--output", str(out),
        "--source-commit", args.source_commit,
    ], check=True)
    print("OZON_PERFORMANCE_STEP8_V2_GATE_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_PERFORMANCE_STEP8_V2_GATE_FAIL: {exc}", file=sys.stderr)
        raise
