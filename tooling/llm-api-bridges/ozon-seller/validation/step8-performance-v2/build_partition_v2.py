#!/usr/bin/env python3
"""Build the exact 21/27 Performance Step 8 partition from the frozen Step 6 matrix."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

CURRENT = {"READ_ALREADY_IMPLEMENTED_CURRENT_PATH", "READ_IMPLEMENT_STEP6"}
TERMINAL = {
    "BLOCK_ASYNC_REPORT_GENERATION": "ASYNC_REPORT_GENERATION",
    "BLOCK_MUTATION_SIDE_EFFECT": "MUTATION_SIDE_EFFECT",
    "SKIP_DEPRECATED_READLIKE": "DEPRECATED_READLIKE",
}
EXPECTED_COUNTS = {
    "READ_ALREADY_IMPLEMENTED_CURRENT_PATH": 6,
    "READ_IMPLEMENT_STEP6": 15,
    "BLOCK_ASYNC_REPORT_GENERATION": 9,
    "BLOCK_MUTATION_SIDE_EFFECT": 16,
    "SKIP_DEPRECATED_READLIKE": 2,
}


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def stable_write(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def csv_write(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows([{field: row.get(field, "") for field in fields} for row in rows])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repo_root.resolve()
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    source = repo / "tooling/llm-api-bridges/ozon-seller/validation/OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json"
    data = json.loads(source.read_text(encoding="utf-8"))
    rows = data.get("rows", [])
    require(data.get("schema") == "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_V1", "unexpected exact matrix schema")
    require(data.get("authority", {}).get("operations") == 48, "exact authority operation count mismatch")
    require(len(rows) == 48, "exact matrix row count mismatch")
    require(len({row["operation_key"] for row in rows}) == 48, "exact operation identity collision")

    counts = Counter(row.get("step6_decision") for row in rows)
    require(dict(counts) == EXPECTED_COUNTS, f"exact decision counts mismatch: {dict(counts)}")
    require(set(counts) == CURRENT.union(TERMINAL), "unexpected decision value")

    operations: list[dict[str, Any]] = []
    accepted: list[dict[str, Any]] = []
    remaining: list[dict[str, Any]] = []
    terminal_rows: list[dict[str, Any]] = []

    for index, source_row in enumerate(rows, 1):
        decision = source_row["step6_decision"]
        identity = source_row["operation_key"]
        current = decision in CURRENT
        item = {
            "index": index,
            "identity": identity,
            "operation_id": source_row.get("operation_id"),
            "method": source_row.get("http_method"),
            "path": source_row.get("fixed_path"),
            "existing_decision": decision,
            "is_current_read": current,
            "alias": source_row.get("alias"),
            "response_kind": source_row.get("response_kind"),
            "source_record": source_row,
        }
        operations.append(item)
        if current:
            accepted.append(item)
            category = "CURRENT_READ"
            terminal_class = "ALREADY_ACCEPTED_CURRENT_READ"
        else:
            remaining.append(item)
            category = TERMINAL[decision]
            terminal_class = f"SOURCE_MATRIX::{decision}"
        terminal_rows.append({
            "index": index,
            "identity": identity,
            "operation_id": source_row.get("operation_id"),
            "method": source_row.get("http_method"),
            "path": source_row.get("fixed_path"),
            "terminal_class": terminal_class,
            "authoritative_decision": decision,
            "broad_category": category,
            "requires_new_runtime_implementation": False,
            "evidence": {
                "partition": "accepted_current_reads" if current else "remaining_terminal_queue",
                "source_record": source_row,
            },
        })

    require(len(accepted) == 21 and len(remaining) == 27, "exact 21/27 partition mismatch")
    require(not {row["identity"] for row in accepted}.intersection(row["identity"] for row in remaining), "partition overlap")

    source_block = {
        "path": source.relative_to(repo).as_posix(),
        "sha256": sha256(source),
        "authority": data["authority"],
        "decision_counts": dict(sorted(counts.items())),
    }
    baseline = {
        "schema": "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V2",
        "schema_version": 2,
        "status": "BASELINE_READY",
        "source": source_block,
        "counts": {
            "performance_operations_total": 48,
            "already_accepted_current_reads": 21,
            "step8_remaining_operations": 27,
        },
        "operations": operations,
        "markers": [
            "STEP8_PERFORMANCE_AUTHORITY_48_DISCOVERED_PASS",
            "STEP8_PERFORMANCE_ACCEPTED_21_BASELINE_PASS",
            "STEP8_PERFORMANCE_REMAINING_27_QUEUE_PASS",
        ],
    }
    queue = {
        "schema": "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V2",
        "schema_version": 2,
        "status": "QUEUE_READY",
        "source": source_block,
        "counts": {
            "performance_operations_total": 48,
            "already_accepted_current_reads": 21,
            "remaining_terminal_queue": 27,
        },
        "accepted_current_reads": accepted,
        "remaining_terminal_queue": remaining,
        "markers": [
            "STEP8_PERFORMANCE_ACCEPTED_CURRENT_READS_21_PASS",
            "STEP8_PERFORMANCE_REMAINING_TERMINAL_QUEUE_27_PASS",
            "STEP8_PERFORMANCE_EXACT_PARTITION_48_PASS",
        ],
    }
    category_counts = Counter(row["broad_category"] for row in terminal_rows)
    terminal = {
        "schema": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V2",
        "schema_version": 2,
        "status": "TERMINAL_MATRIX_READY",
        "source": source_block,
        "counts": {
            "rows": 48,
            "already_accepted_current_reads": 21,
            "remaining_source_terminal_decisions": 27,
            "unknown": 0,
            "pending": 0,
            "unresolved": 0,
            "implementation_candidates": 0,
            "categories": dict(sorted(category_counts.items())),
        },
        "rows": terminal_rows,
        "implementation_candidates": [],
        "markers": [
            "PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS",
            "PERFORMANCE_STEP8_CURRENT_READS_21_PRESERVED_PASS",
            "PERFORMANCE_STEP8_REMAINING_TERMINAL_DECISIONS_27_PASS",
            "PERFORMANCE_STEP8_NEW_RUNTIME_IMPLEMENTATION_0_PASS",
            "PERFORMANCE_STEP8_UNKNOWN_PENDING_UNRESOLVED_ZERO_PASS",
        ],
    }

    stable_write(out / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.json", baseline)
    stable_write(out / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.json", queue)
    stable_write(out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.json", terminal)
    csv_write(out / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.csv", operations, [
        "index", "identity", "operation_id", "method", "path", "existing_decision", "is_current_read", "alias", "response_kind",
    ])
    csv_write(out / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.csv", remaining, [
        "index", "identity", "operation_id", "method", "path", "existing_decision",
    ])
    csv_write(out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.csv", terminal_rows, [
        "index", "identity", "operation_id", "method", "path", "terminal_class", "authoritative_decision", "broad_category", "requires_new_runtime_implementation",
    ])

    (out / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.md").write_text(
        "# Performance Step 8 exact inventory\n\n"
        "- Authority operations: `48`.\n"
        "- Current reads: `21`.\n"
        "- Remaining operations: `27`.\n"
        "- Source: `OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json`.\n",
        encoding="utf-8", newline="\n",
    )
    (out / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.md").write_text(
        "# Performance Step 8 exact 21/27 partition\n\n"
        "- Accepted current reads: `21`.\n"
        "- Remaining source-terminal operations: `27`.\n"
        "- Partition overlap: `0`.\n",
        encoding="utf-8", newline="\n",
    )
    (out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.md").write_text(
        "# Performance Step 8 exhaustive terminal matrix\n\n"
        "- Terminal operations: `48 / 48`.\n"
        "- Current reads: `21`.\n"
        "- Async generation blocked: `9`.\n"
        "- Mutations blocked: `16`.\n"
        "- Deprecated read-like skipped: `2`.\n"
        "- New runtime implementation: `0`.\n"
        "- Unknown / pending / unresolved: `0 / 0 / 0`.\n",
        encoding="utf-8", newline="\n",
    )

    print("STEP8_PERFORMANCE_EXACT_PARTITION_48_PASS")
    print("STEP8_PERFORMANCE_ACCEPTED_CURRENT_READS_21_PASS")
    print("STEP8_PERFORMANCE_REMAINING_TERMINAL_QUEUE_27_PASS")
    print("PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS")
    print("PERFORMANCE_STEP8_NEW_RUNTIME_IMPLEMENTATION_0_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_PERFORMANCE_STEP8_EXACT_PARTITION_V2_FAIL: {exc}", file=sys.stderr)
        raise
