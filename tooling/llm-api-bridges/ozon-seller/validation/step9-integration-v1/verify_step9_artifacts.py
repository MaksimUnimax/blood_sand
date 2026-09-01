#!/usr/bin/env python3
"""Compare Step 9 artifacts and verify a fresh repository reproduction."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

PACKAGE = "OZON_BRIDGE_v0.1.19_STEP9_FULL_INTEGRATION_266_CANDIDATE.zip"
SEMANTIC = "semantic-proof.json"
EXPECTED_TREE = "f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974"
EXPECTED_CANONICAL = "8ee16f38bf2ec60e4b2e42192c2f41d87021b214"


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"expected JSON object: {path}")
    return value


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stable_write(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def files(root: Path) -> dict[str, Path]:
    return {
        path.relative_to(root).as_posix(): path
        for path in sorted((item for item in root.rglob("*") if item.is_file()), key=lambda item: item.relative_to(root).as_posix())
    }


def compare_trees(left: Path, right: Path, label: str) -> list[dict[str, Any]]:
    left_files = files(left)
    right_files = files(right)
    require(set(left_files) == set(right_files), f"{label} file sets differ: {sorted(set(left_files)-set(right_files))} / {sorted(set(right_files)-set(left_files))}")
    rows = []
    for relative in sorted(left_files):
        left_bytes = left_files[relative].read_bytes()
        right_bytes = right_files[relative].read_bytes()
        require(left_bytes == right_bytes, f"{label} bytes differ: {relative}")
        rows.append({"path": relative, "bytes": len(left_bytes), "sha256": hashlib.sha256(left_bytes).hexdigest()})
    return rows


def verify_semantic(root: Path, source_commit: str) -> dict[str, Any]:
    semantic = load(root / SEMANTIC)
    require(semantic.get("status") == "PASS", "Step9 semantic status mismatch")
    require(semantic.get("source_commit") == source_commit, "Step9 semantic source commit mismatch")
    require(semantic.get("seller_operations_terminal") == 463, "Seller terminal count mismatch")
    require(semantic.get("performance_operations_terminal") == 48, "Performance terminal count mismatch")
    require(semantic.get("total_operations_terminal") == 511, "combined terminal count mismatch")
    require(semantic.get("seller_current_reads") == 245, "Seller current read count mismatch")
    require(semantic.get("performance_current_reads") == 21, "Performance current read count mismatch")
    require(semantic.get("combined_current_reads") == 266, "combined read count mismatch")
    require(semantic.get("runtime_business_requests") == 266, "runtime business request count mismatch")
    require(semantic.get("runtime_performance_auth_requests") == 1, "Performance auth request count mismatch")
    require(semantic.get("privacy_denied_requests") == 0, "privacy denied request leak")
    require(semantic.get("privacy_authorized_requests") == 13, "privacy authorized request count mismatch")
    require(semantic.get("candidate_tree_sha256") == EXPECTED_TREE, "candidate tree mismatch")
    package = root / PACKAGE
    require(package.is_file(), "Step9 package missing")
    require(semantic.get("package_sha256") == sha256(package), "Step9 package SHA mismatch")
    require(semantic.get("package_bytes") == package.stat().st_size, "Step9 package size mismatch")
    return semantic


def compare(args: argparse.Namespace) -> None:
    linux = args.linux.resolve()
    windows = args.windows.resolve()
    rows = compare_trees(linux, windows, "Linux/Windows")
    left = verify_semantic(linux, args.source_commit)
    right = verify_semantic(windows, args.source_commit)
    require(left == right, "Linux/Windows semantic proof differs")
    proof = {
        "schema": "OZON_STEP9_CROSS_PLATFORM_PROOF_V1",
        "schema_version": 1,
        "status": "PASS",
        "source_commit": args.source_commit,
        "workflow_run_id": args.workflow_run_id,
        "platforms": ["ubuntu-latest", "windows-latest"],
        "byte_identical": True,
        "file_count": len(rows),
        "package_sha256": left["package_sha256"],
        "package_bytes": left["package_bytes"],
        "candidate_tree_sha256": left["candidate_tree_sha256"],
        "files": rows,
        "markers": [
            "OZON_STEP9_LINUX_PLATFORM_GATE_PASS",
            "OZON_STEP9_WINDOWS_PLATFORM_GATE_PASS",
            "OZON_STEP9_LINUX_WINDOWS_BYTE_IDENTICAL_PASS",
            "OZON_STEP9_CROSS_PLATFORM_CANDIDATE_PASS",
        ],
    }
    stable_write(args.output.resolve(), proof)
    for marker in proof["markers"]:
        print(marker)


def freeze(args: argparse.Namespace) -> None:
    fresh = args.fresh.resolve()
    linux = args.linux.resolve()
    windows = args.windows.resolve()
    cross_path = args.cross.resolve()
    fresh_rows = compare_trees(fresh, linux, "fresh/Linux")
    compare_trees(linux, windows, "Linux/Windows")
    fresh_semantic = verify_semantic(fresh, args.source_commit)
    linux_semantic = verify_semantic(linux, args.source_commit)
    require(fresh_semantic == linux_semantic, "fresh/Linux semantic proof differs")
    cross = load(cross_path)
    require(cross.get("status") == "PASS" and cross.get("byte_identical") is True, "cross-platform proof not PASS")
    require(cross.get("source_commit") == args.source_commit, "cross source commit mismatch")
    require(cross.get("workflow_run_id") == args.workflow_run_id, "cross workflow run mismatch")
    require(cross.get("package_sha256") == fresh_semantic["package_sha256"], "cross package SHA mismatch")
    require(args.canonical_sha == EXPECTED_CANONICAL, "canonical guard input mismatch")

    proof = {
        "schema": "OZON_STEP9_REPOSITORY_FREEZE_PROOF_V1",
        "schema_version": 1,
        "status": "PASS",
        "source_commit": args.source_commit,
        "workflow_run_id": args.workflow_run_id,
        "canonical": {
            "branch": args.canonical_branch,
            "commit": args.canonical_sha,
            "modified": False,
        },
        "fresh_reproduction_matches_linux": True,
        "linux_windows_byte_identical": True,
        "file_count": len(fresh_rows),
        "candidate_tree_sha256": fresh_semantic["candidate_tree_sha256"],
        "package_sha256": fresh_semantic["package_sha256"],
        "package_bytes": fresh_semantic["package_bytes"],
        "cross_platform_proof_sha256": sha256(cross_path),
        "files": fresh_rows,
        "markers": [
            "OZON_STEP9_FRESH_REPRODUCTION_PASS",
            "OZON_STEP9_FRESH_REPRODUCTION_MATCHES_LINUX_PASS",
            "OZON_STEP9_REPOSITORY_FREEZE_PASS",
            "OZON_STEP9_CANONICAL_UNCHANGED_PASS",
        ],
    }
    stable_write(args.output.resolve(), proof)
    for marker in proof["markers"]:
        print(marker)


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser()
    sub = root.add_subparsers(dest="command", required=True)

    item = sub.add_parser("compare")
    item.add_argument("--linux", type=Path, required=True)
    item.add_argument("--windows", type=Path, required=True)
    item.add_argument("--output", type=Path, required=True)
    item.add_argument("--source-commit", required=True)
    item.add_argument("--workflow-run-id", type=int, required=True)
    item.set_defaults(func=compare)

    item = sub.add_parser("freeze")
    item.add_argument("--fresh", type=Path, required=True)
    item.add_argument("--linux", type=Path, required=True)
    item.add_argument("--windows", type=Path, required=True)
    item.add_argument("--cross", type=Path, required=True)
    item.add_argument("--output", type=Path, required=True)
    item.add_argument("--source-commit", required=True)
    item.add_argument("--workflow-run-id", type=int, required=True)
    item.add_argument("--canonical-branch", required=True)
    item.add_argument("--canonical-sha", required=True)
    item.set_defaults(func=freeze)
    return root


def main() -> None:
    args = parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_STEP9_ARTIFACT_VERIFICATION_FAIL: {exc}", file=sys.stderr)
        raise
