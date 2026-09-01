#!/usr/bin/env python3
"""Build and verify the definitive deterministic Ozon Performance Step 8 gate."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import shutil
import sys
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any

CURRENT = {"READ_ALREADY_IMPLEMENTED_CURRENT_PATH", "READ_IMPLEMENT_STEP6"}
TERMINAL = {
    "BLOCK_ASYNC_REPORT_GENERATION": "ASYNC_REPORT_GENERATION_BLOCKED",
    "BLOCK_MUTATION_SIDE_EFFECT": "MUTATION_SIDE_EFFECT_BLOCKED",
    "SKIP_DEPRECATED_READLIKE": "DEPRECATED_READLIKE_UNEXPOSED",
}
EXPECTED = {
    "READ_ALREADY_IMPLEMENTED_CURRENT_PATH": 6,
    "READ_IMPLEMENT_STEP6": 15,
    "BLOCK_ASYNC_REPORT_GENERATION": 9,
    "BLOCK_MUTATION_SIDE_EFFECT": 16,
    "SKIP_DEPRECATED_READLIKE": 2,
}
PAYLOAD_FILES = (
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX.json",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX.csv",
    "OZON_PERFORMANCE_STEP8_ACCEPTANCE_PROOF.json",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_SUMMARY.md",
)
PACKAGE_NAME = "OZON_BRIDGE_v0.1.19_STEP8_PERFORMANCE_48_TERMINAL_CANDIDATE.zip"
MANIFEST_NAME = "OZON_PERFORMANCE_STEP8_PACKAGE_MANIFEST.json"
SEMANTIC_NAME = "semantic-proof.json"


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stable_write(path: Path, value: Any, *, compact: bool = False) -> None:
    text = (
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        if compact
        else json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True)
    )
    path.write_text(text + "\n", encoding="utf-8", newline="\n")


def deterministic_zip(path: Path, members: list[Path]) -> None:
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for member in sorted(members, key=lambda item: item.name):
            info = zipfile.ZipInfo(member.name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o100644 & 0xFFFF) << 16
            archive.writestr(info, member.read_bytes())


def verify_zip(path: Path, members: list[Path]) -> None:
    expected = {member.name: member.read_bytes() for member in members}
    with zipfile.ZipFile(path, "r") as archive:
        names = archive.namelist()
        require(names == sorted(expected), f"package members mismatch: {names}")
        for name in names:
            require(archive.read(name) == expected[name], f"package member bytes differ: {name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    args = parser.parse_args()

    repo = args.repo_root.resolve()
    out = args.out.resolve()
    seller = repo / "tooling/llm-api-bridges/ozon-seller"
    validation = seller / "validation"
    exact_path = validation / "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json"
    accepted_path = validation / "OZON_PERFORMANCE_STEP6_READ_COVERAGE_ACCEPTED_2026-08-29.md"
    step7_path = validation / "OZON_SELLER_STEP7_463_FORMAL_ACCEPTANCE_2026-08-31.md"
    independent_path = validation / "step8-performance-v1/evidence/OZON_PERFORMANCE_STEP8_INDEPENDENT_REVERIFICATION_V1.json"
    for path in (exact_path, accepted_path, step7_path, independent_path):
        require(path.is_file(), f"missing prerequisite: {path}")

    exact = json.loads(exact_path.read_text(encoding="utf-8"))
    rows = exact.get("rows", [])
    require(exact.get("schema") == "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_V1", "exact matrix schema mismatch")
    authority = exact.get("authority", {})
    require(authority.get("swagger_bytes") == 304771, "Performance Swagger byte authority mismatch")
    require(authority.get("swagger_sha256") == "7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec", "Performance Swagger SHA mismatch")
    require(authority.get("openapi") == "3.0.0" and authority.get("paths") == 47 and authority.get("operations") == 48, "Performance authority counts mismatch")
    require(len(rows) == 48 and len({row["operation_key"] for row in rows}) == 48, "Performance operation identities mismatch")
    decisions = Counter(row.get("step6_decision") for row in rows)
    require(dict(decisions) == EXPECTED, f"Performance decision counts mismatch: {dict(decisions)}")

    require("21" in accepted_path.read_text(encoding="utf-8"), "accepted Performance 21-read marker absent")
    require("OZON_SELLER_STEP7_FORMALLY_ACCEPTED" in step7_path.read_text(encoding="utf-8"), "Seller Step7 formal acceptance marker absent")
    independent = json.loads(independent_path.read_text(encoding="utf-8"))
    require(independent.get("status") == "PASS", "independent Step8 reverification not PASS")
    require(independent.get("performed_outside_github_actions") is True, "independent Step8 provenance mismatch")
    independent_counts = independent.get("counts", {})
    require(independent_counts == {
        "performance_operations_total": 48,
        "already_accepted_current_reads": 21,
        "remaining_source_terminal_decisions": 27,
        "new_runtime_implementation_count": 0,
        "unknown": 0,
        "pending": 0,
        "unresolved": 0,
    }, "independent Step8 count mismatch")

    matrix_rows: list[dict[str, Any]] = []
    for ordinal, row in enumerate(rows, 1):
        decision = row["step6_decision"]
        current = decision in CURRENT
        matrix_rows.append({
            "ordinal": ordinal,
            "operation_key": row["operation_key"],
            "http_method": row["http_method"],
            "fixed_path": row["fixed_path"],
            "operation_id": row.get("operation_id"),
            "summary": row.get("summary"),
            "deprecated": bool(row.get("deprecated")),
            "terminal": True,
            "terminal_decision": "CURRENT_READ_ACCEPTED" if current else TERMINAL[decision],
            "source_decision": decision,
            "current_read": current,
            "alias": row.get("alias"),
            "response_kind": row.get("response_kind"),
            "documented_json_variant_alias": row.get("documented_json_variant_alias"),
            "documented_json_variant_path": row.get("documented_json_variant_path"),
            "requires_new_runtime_implementation": False,
            "source_row_sha256": hashlib.sha256(
                json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
            ).hexdigest(),
        })

    current_rows = [row for row in matrix_rows if row["current_read"]]
    terminal_rows = [row for row in matrix_rows if not row["current_read"]]
    require(len(current_rows) == 21 and len(terminal_rows) == 27, "exact 21/27 partition mismatch")
    category_counts = Counter(row["terminal_decision"] for row in matrix_rows)
    require(category_counts == Counter({
        "CURRENT_READ_ACCEPTED": 21,
        "ASYNC_REPORT_GENERATION_BLOCKED": 9,
        "MUTATION_SIDE_EFFECT_BLOCKED": 16,
        "DEPRECATED_READLIKE_UNEXPOSED": 2,
    }), f"terminal category counts mismatch: {dict(category_counts)}")

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    matrix = {
        "schema": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "authority": authority,
        "source": {
            "exact_matrix_path": exact_path.relative_to(repo).as_posix(),
            "exact_matrix_sha256": sha256(exact_path),
            "accepted_read_evidence_path": accepted_path.relative_to(repo).as_posix(),
            "accepted_read_evidence_sha256": sha256(accepted_path),
            "seller_step7_acceptance_path": step7_path.relative_to(repo).as_posix(),
            "seller_step7_acceptance_sha256": sha256(step7_path),
            "independent_reverification_path": independent_path.relative_to(repo).as_posix(),
            "independent_reverification_sha256": sha256(independent_path),
        },
        "counts": {
            "rows": 48,
            "current_reads": 21,
            "remaining_terminal_decisions": 27,
            "async_report_generation_blocked": 9,
            "mutation_side_effect_blocked": 16,
            "deprecated_readlike_unexposed": 2,
            "new_runtime_implementation_count": 0,
            "unknown": 0,
            "pending": 0,
            "unresolved": 0,
        },
        "rows": matrix_rows,
        "markers": [
            "PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS",
            "PERFORMANCE_STEP8_CURRENT_READS_21_PRESERVED_PASS",
            "PERFORMANCE_STEP8_REMAINING_TERMINAL_DECISIONS_27_PASS",
            "PERFORMANCE_STEP8_NEW_RUNTIME_IMPLEMENTATION_0_PASS",
            "PERFORMANCE_STEP8_UNKNOWN_PENDING_UNRESOLVED_ZERO_PASS",
        ],
    }
    matrix_path = out / PAYLOAD_FILES[0]
    stable_write(matrix_path, matrix)

    csv_path = out / PAYLOAD_FILES[1]
    csv_fields = [
        "ordinal", "operation_key", "http_method", "fixed_path", "operation_id", "deprecated",
        "terminal_decision", "source_decision", "current_read", "alias", "response_kind",
        "documented_json_variant_alias", "documented_json_variant_path",
        "requires_new_runtime_implementation", "source_row_sha256",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows([{field: row.get(field, "") for field in csv_fields} for row in matrix_rows])

    proof = {
        "schema": "OZON_PERFORMANCE_STEP8_ACCEPTANCE_PROOF_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "performance_operations_terminal": 48,
        "current_reads_preserved": 21,
        "remaining_terminal_decisions": 27,
        "new_runtime_implementation_count": 0,
        "seller_reads": 245,
        "combined_current_read_surface": 266,
        "unknown": 0,
        "pending": 0,
        "unresolved": 0,
        "independent_reverification": {
            "status": "PASS",
            "performed_outside_github_actions": True,
            "sha256": sha256(independent_path),
        },
        "regression_requirements": [
            "OZON_PERFORMANCE_STEP6_MATRIX_REGRESSION_PASS",
            "OZON_PERFORMANCE_STEP6_READ_COVERAGE_REGRESSION_PASS",
        ],
        "markers": [
            "PERFORMANCE_STEP8_EXACT_AUTHORITY_48_PASS",
            "PERFORMANCE_STEP8_EXACT_21_27_PARTITION_PASS",
            "PERFORMANCE_STEP8_EXISTING_MATRIX_REGRESSION_REQUIRED",
            "PERFORMANCE_STEP8_EXISTING_READ_COVERAGE_REGRESSION_REQUIRED",
            "OZON_PERFORMANCE_STEP8_V2_GATE_PASS",
        ],
    }
    proof_path = out / PAYLOAD_FILES[2]
    stable_write(proof_path, proof)

    summary_path = out / PAYLOAD_FILES[3]
    summary_path.write_text(
        "# Ozon Performance Step 8 — terminal matrix v2\n\n"
        "- Performance authority: `48 / 48` terminal operations.\n"
        "- Current reads preserved: `21`.\n"
        "- Async report generation blocked: `9`.\n"
        "- Mutation/state change blocked: `16`.\n"
        "- Deprecated read-like operations unexposed: `2`.\n"
        "- New runtime implementation required: `0`.\n"
        "- Unknown / pending / unresolved: `0 / 0 / 0`.\n"
        "- Combined surface entering Step 9: `245 Seller + 21 Performance = 266`.\n",
        encoding="utf-8",
        newline="\n",
    )

    payload_paths = [out / name for name in PAYLOAD_FILES]
    manifest = {
        "schema": "OZON_PERFORMANCE_STEP8_PACKAGE_MANIFEST_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "files": [
            {"path": path.name, "bytes": path.stat().st_size, "sha256": sha256(path)}
            for path in sorted(payload_paths, key=lambda item: item.name)
        ],
        "package_members": sorted([path.name for path in payload_paths] + [MANIFEST_NAME]),
    }
    manifest_path = out / MANIFEST_NAME
    stable_write(manifest_path, manifest)

    package_path = out / PACKAGE_NAME
    package_members = payload_paths + [manifest_path]
    deterministic_zip(package_path, package_members)
    verify_zip(package_path, package_members)

    semantic = {
        "schema": "OZON_PERFORMANCE_STEP8_SEMANTIC_PROOF_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "performance_operations": 48,
        "terminal_operations": 48,
        "current_reads": 21,
        "remaining_terminal_decisions": 27,
        "new_runtime_implementation_count": 0,
        "seller_reads": 245,
        "full_current_read_surface": 266,
        "unknown": 0,
        "pending": 0,
        "unresolved": 0,
        "matrix_sha256": sha256(matrix_path),
        "package_sha256": sha256(package_path),
        "package_bytes": package_path.stat().st_size,
        "manifest_sha256": sha256(manifest_path),
        "independent_reverification_sha256": sha256(independent_path),
        "markers": [
            "PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS",
            "PERFORMANCE_STEP8_CURRENT_READS_21_PRESERVED_PASS",
            "PERFORMANCE_STEP8_REMAINING_TERMINAL_DECISIONS_27_PASS",
            "PERFORMANCE_STEP8_NEW_RUNTIME_IMPLEMENTATION_0_PASS",
            "PERFORMANCE_STEP8_UNKNOWN_0_PASS",
            "PERFORMANCE_STEP8_PENDING_0_PASS",
            "PERFORMANCE_STEP8_UNRESOLVED_0_PASS",
            "OZON_PERFORMANCE_STEP8_V2_GATE_PASS",
        ],
    }
    semantic_path = out / SEMANTIC_NAME
    stable_write(semantic_path, semantic, compact=True)

    require(json.loads(matrix_path.read_text(encoding="utf-8"))["counts"]["rows"] == 48, "matrix reread failed")
    require(json.loads(proof_path.read_text(encoding="utf-8"))["status"] == "PASS", "proof reread failed")
    require(json.loads(manifest_path.read_text(encoding="utf-8"))["status"] == "PASS", "manifest reread failed")
    require(json.loads(semantic_path.read_text(encoding="utf-8"))["package_sha256"] == sha256(package_path), "semantic package identity mismatch")

    print("PERFORMANCE_STEP8_EXACT_AUTHORITY_48_PASS")
    print("PERFORMANCE_STEP8_EXACT_21_27_PARTITION_PASS")
    print("PERFORMANCE_STEP8_DETERMINISTIC_PACKAGE_PASS")
    print("OZON_PERFORMANCE_STEP8_V2_GATE_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_PERFORMANCE_STEP8_V2_GATE_FAIL: {exc}", file=sys.stderr)
        raise
