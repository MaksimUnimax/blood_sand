#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import stat
import sys
import zipfile
from pathlib import Path
from typing import Any


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    args = parser.parse_args()
    root = args.output.resolve()

    names = {
        "matrix_json": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX.json",
        "matrix_csv": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX.csv",
        "proof": "OZON_PERFORMANCE_STEP8_ACCEPTANCE_PROOF.json",
        "summary": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_SUMMARY.md",
        "manifest": "OZON_PERFORMANCE_STEP8_PACKAGE_MANIFEST.json",
        "package": "OZON_BRIDGE_v0.1.19_STEP8_PERFORMANCE_48_TERMINAL_CANDIDATE.zip",
        "semantic": "semantic-proof.json",
    }
    paths = {key: root / value for key, value in names.items()}
    for key, path in paths.items():
        require(path.is_file(), f"missing {key}: {path}")

    matrix = load(paths["matrix_json"])
    rows = matrix["rows"]
    require(matrix["status"] == "PASS" and matrix["source_commit"] == args.source_commit, "matrix provenance/status mismatch")
    require(len(rows) == 48 and len({row["operation_id"] for row in rows}) == 48, "matrix operation identity/count mismatch")
    require(all(row["terminal"] is True and row["terminal_decision"] for row in rows), "nonterminal/empty decision row")
    require(matrix["summary"]["performance_operations"] == matrix["summary"]["terminal_operations"] == 48, "matrix terminal count mismatch")
    require(
        matrix["summary"]["unknown"] == matrix["summary"]["pending"] == matrix["summary"]["unresolved"] == 0,
        "matrix unresolved",
    )
    require(matrix["summary"]["current_performance_reads"] == 21, "matrix current read count mismatch")

    with paths["matrix_csv"].open(encoding="utf-8", newline="") as handle:
        csv_rows = list(csv.DictReader(handle))
    require(len(csv_rows) == 48, "CSV row count mismatch")
    require([row["operation_id"] for row in csv_rows] == [row["operation_id"] for row in rows], "CSV/matrix identity mismatch")

    proof = load(paths["proof"])
    require(proof["status"] == "PASS" and proof["source_commit"] == args.source_commit, "core proof mismatch")
    performance = proof["performance"]
    require(performance["total_operations"] == performance["terminal_operations"] == 48, "core proof terminal mismatch")
    require(
        performance["current_reads"] == 21
        and performance["unknown"] == performance["pending"] == performance["unresolved"] == 0,
        "core proof coverage mismatch",
    )
    require(
        proof["integration"]["seller_reads"] == 245
        and proof["integration"]["performance_reads"] == 21
        and proof["integration"]["full_current_read_surface"] == 266,
        "integration count mismatch",
    )
    required_markers = {
        "PERFORMANCE_STEP8_SOURCE_EXACT_MATRIX_48_PASS",
        "PERFORMANCE_STEP8_MASTER_ALIGNMENT_48_PASS",
        "PERFORMANCE_STEP8_TERMINAL_MATRIX_48_OF_48_PASS",
        "PERFORMANCE_STEP8_UNKNOWN_PENDING_UNRESOLVED_ZERO_PASS",
        "PERFORMANCE_STEP8_CURRENT_READS_21_REGRESSION_PASS",
        "PERFORMANCE_STEP8_FULL_CURRENT_READ_SURFACE_266_PASS",
        "OZON_PERFORMANCE_STEP8_GATE_PASS",
    }
    require(required_markers <= set(proof["markers"]), "core proof markers incomplete")

    manifest = load(paths["manifest"])
    require(manifest["status"] == "PASS" and manifest["source_commit"] == args.source_commit, "manifest mismatch")
    manifest_map = {row["path"]: row for row in manifest["files"]}
    for key in ("matrix_json", "matrix_csv", "proof", "summary"):
        path = paths[key]
        row = manifest_map.get(path.name)
        require(
            row is not None and row["bytes"] == path.stat().st_size and row["sha256"] == sha(path),
            f"manifest row mismatch: {path.name}",
        )

    with zipfile.ZipFile(paths["package"]) as archive:
        members = archive.infolist()
        require([member.filename for member in members] == sorted(manifest_map), "package member set/order mismatch")
        for member in members:
            require(".." not in Path(member.filename).parts and not member.filename.startswith("/"), "unsafe package member")
            require(((member.external_attr >> 16) & 0o170000) != stat.S_IFLNK, "symlink package member")
            payload = archive.read(member.filename)
            expected = manifest_map[member.filename]
            require(
                len(payload) == expected["bytes"] and hashlib.sha256(payload).hexdigest() == expected["sha256"],
                f"package member mismatch: {member.filename}",
            )

    semantic = load(paths["semantic"])
    require(semantic["status"] == "PASS" and semantic["source_commit"] == args.source_commit, "semantic proof mismatch")
    require(
        semantic["performance_operations"] == semantic["terminal_operations"] == 48 and semantic["current_reads"] == 21,
        "semantic counts mismatch",
    )
    require(semantic["seller_reads"] == 245 and semantic["full_current_read_surface"] == 266, "semantic integration mismatch")
    require(semantic["unknown"] == semantic["pending"] == semantic["unresolved"] == 0, "semantic unresolved")
    require(semantic["matrix_sha256"] == sha(paths["matrix_json"]), "semantic matrix SHA mismatch")
    require(semantic["core_proof_sha256"] == sha(paths["proof"]), "semantic core proof SHA mismatch")
    require(semantic["manifest_sha256"] == sha(paths["manifest"]), "semantic manifest SHA mismatch")
    require(
        semantic["package_sha256"] == sha(paths["package"])
        and semantic["package_bytes"] == paths["package"].stat().st_size,
        "semantic package identity mismatch",
    )
    print("PERFORMANCE_STEP8_OUTPUT_VERIFY_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"PERFORMANCE_STEP8_OUTPUT_VERIFY_FAIL: {exc}", file=sys.stderr)
        raise
