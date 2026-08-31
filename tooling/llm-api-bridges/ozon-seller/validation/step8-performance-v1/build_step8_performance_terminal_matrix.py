#!/usr/bin/env python3
"""Build the exhaustive Performance Step 8 terminal matrix from frozen authority evidence."""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

TOTAL = 48
ACCEPTED = 21
REMAINING = 27
PRELIMINARY = (
    "unknown", "pending", "unresolved", "tbd", "todo", "needs_review",
    "needs review", "investigate", "open_question", "open question",
    "not_classified", "not classified", "awaiting", "draft",
)
IMPLEMENTATION = (
    "implement_read", "current_read_candidate", "read_candidate", "add_read",
    "supported_not_implemented", "read_supported_not_implemented",
    "implementation_required",
)


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value).strip()).lower()


def scalars(node: Any, path: tuple[str, ...] = ()):
    if isinstance(node, dict):
        for key, value in node.items():
            yield from scalars(value, path + (str(key),))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from scalars(value, path + (str(index),))
    elif node is not None:
        yield ".".join(path), node


def decision_signals(row: dict[str, Any]) -> list[dict[str, str]]:
    signals = []
    for path, value in scalars(row.get("source_record", {})):
        normalized_path = normalize_text(path)
        if any(
            token in normalized_path
            for token in (
                "decision", "status", "class", "terminal", "reason", "read",
                "write", "current", "authority", "support", "available",
                "scope", "method", "path",
            )
        ):
            signals.append({"path": path, "value": str(value)})
    return signals


def broad_category(decision: str, signals: list[dict[str, str]]) -> str:
    combined = normalize_text(
        decision + " " + " ".join(f"{signal['path']}={signal['value']}" for signal in signals)
    )
    if any(
        token in combined
        for token in (
            "write", "mutation", "create", "update", "delete", "cancel",
            "activate", "deactivate", "set_", "set ", "manage",
        )
    ):
        return "WRITE_OR_MUTATION"
    if any(
        token in combined
        for token in (
            "out_of_read_scope", "out of read scope", "not_read", "not read",
            "non_read", "non-read", "excluded_read",
        )
    ):
        return "OUT_OF_READ_SCOPE"
    if any(token in combined for token in ("deprecated", "retired", "obsolete", "removed")):
        return "DEPRECATED_OR_RETIRED"
    if any(
        token in combined
        for token in (
            "no_current", "no current", "unsupported", "unavailable", "absent",
            "not_available", "not available", "no_official", "no official",
            "authority_gap", "surface_gap",
        )
    ):
        return "NO_CURRENT_OFFICIAL_AUTHORITY"
    return "SOURCE_MATRIX_EXPLICIT_TERMINAL"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    seller_root = repo_root / "tooling/llm-api-bridges/ozon-seller"

    queue_hits = list(seller_root.rglob("OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.json"))
    if not queue_hits:
        raise RuntimeError("exact Step 8 21/27 queue not found")
    queue_hits.sort(
        key=lambda path: (
            "step8-performance-v1/generated" in path.as_posix(),
            len(path.as_posix()),
        ),
        reverse=True,
    )
    queue_path = queue_hits[0]
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    accepted = queue["accepted_current_reads"]
    remaining = queue["remaining_terminal_queue"]
    if len(accepted) != ACCEPTED or len(remaining) != REMAINING:
        raise RuntimeError("exact queue count mismatch")

    rows = []
    blocked = []
    implementation_candidates = []

    for row in accepted:
        rows.append({
            "index": row["index"],
            "identity": row["identity"],
            "operation_id": row.get("operation_id"),
            "method": row.get("method"),
            "path": row.get("path"),
            "terminal_class": "ALREADY_ACCEPTED_CURRENT_READ",
            "authoritative_decision": row.get("existing_decision"),
            "broad_category": "CURRENT_READ",
            "requires_new_runtime_implementation": False,
            "evidence": {
                "partition": "accepted_current_reads",
                "source_record": row.get("source_record"),
            },
        })

    for row in remaining:
        decision = row.get("existing_decision")
        if decision is None or not str(decision).strip():
            blocked.append({
                "identity": row["identity"],
                "reason": "missing existing_decision",
                "row": row,
            })
            continue
        normalized_decision = normalize_text(decision)
        if any(token in normalized_decision for token in PRELIMINARY):
            blocked.append({
                "identity": row["identity"],
                "reason": f"preliminary decision: {decision}",
                "row": row,
            })
            continue

        signals = decision_signals(row)
        joined = normalized_decision + " " + " ".join(
            normalize_text(signal["value"]) for signal in signals
        )
        requires_implementation = any(token in joined for token in IMPLEMENTATION)
        entry = {
            "index": row["index"],
            "identity": row["identity"],
            "operation_id": row.get("operation_id"),
            "method": row.get("method"),
            "path": row.get("path"),
            "terminal_class": f"SOURCE_MATRIX::{str(decision).strip()}",
            "authoritative_decision": str(decision).strip(),
            "broad_category": broad_category(str(decision), signals),
            "requires_new_runtime_implementation": requires_implementation,
            "evidence": {
                "partition": "remaining_terminal_queue",
                "decision_signals": signals,
                "source_record": row.get("source_record"),
            },
        }
        rows.append(entry)
        if requires_implementation:
            implementation_candidates.append(entry)

    if blocked:
        blocked_payload = {
            "schema": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1",
            "schema_version": 1,
            "status": "BLOCKED",
            "blocked": blocked,
            "implementation_candidates": implementation_candidates,
        }
        (out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_BLOCKED_V1.json").write_text(
            json.dumps(blocked_payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        raise RuntimeError(f"{len(blocked)} non-terminal Performance decisions")

    if len(rows) != TOTAL or len({row["identity"] for row in rows}) != TOTAL:
        raise RuntimeError("terminal matrix identity/count mismatch")

    category_counts = Counter(row["broad_category"] for row in rows)
    status = "IMPLEMENTATION_REQUIRED" if implementation_candidates else "TERMINAL_MATRIX_READY"
    payload = {
        "schema": "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1",
        "schema_version": 1,
        "status": status,
        "source": {
            "exact_queue": queue_path.relative_to(repo_root).as_posix(),
        },
        "counts": {
            "rows": TOTAL,
            "already_accepted_current_reads": ACCEPTED,
            "remaining_source_terminal_decisions": REMAINING,
            "unknown": 0,
            "pending": 0,
            "unresolved": 0,
            "implementation_candidates": len(implementation_candidates),
            "by_broad_category": dict(sorted(category_counts.items())),
        },
        "rows": sorted(rows, key=lambda row: row["index"]),
        "implementation_candidates": implementation_candidates,
        "markers": [
            "PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS",
            "PERFORMANCE_STEP8_UNKNOWN_0_PASS",
            "PERFORMANCE_STEP8_PENDING_0_PASS",
            "PERFORMANCE_STEP8_UNRESOLVED_0_PASS",
        ],
    }

    json_path = out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.json"
    csv_path = out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.csv"
    markdown_path = out / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.md"
    json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        fields = [
            "index", "identity", "operation_id", "method", "path",
            "terminal_class", "authoritative_decision", "broad_category",
            "requires_new_runtime_implementation",
        ]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in payload["rows"]:
            writer.writerow({key: row.get(key) for key in fields})

    markdown = [
        "# Ozon Performance Step 8 — exhaustive terminal matrix",
        "",
        f"**Status:** `{status}`",
        "",
        "- Rows: `48`.",
        "- Already accepted current reads: `21`.",
        "- Remaining authoritative terminal decisions: `27`.",
        "- Unknown: `0`.",
        "- Pending: `0`.",
        "- Unresolved: `0`.",
        f"- New runtime implementation candidates: `{len(implementation_candidates)}`.",
        "",
        "## Broad categories",
        "",
    ]
    for category, count in sorted(category_counts.items()):
        markdown.append(f"- `{category}`: `{count}`.")
    markdown.extend([
        "",
        "## Markers",
        "",
        "`PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS`  ",
        "`PERFORMANCE_STEP8_UNKNOWN_0_PASS`  ",
        "`PERFORMANCE_STEP8_PENDING_0_PASS`  ",
        "`PERFORMANCE_STEP8_UNRESOLVED_0_PASS`",
        "",
    ])
    markdown_path.write_text("\n".join(markdown), encoding="utf-8", newline="\n")

    print("PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS")
    print("PERFORMANCE_STEP8_UNKNOWN_0_PASS")
    print("PERFORMANCE_STEP8_PENDING_0_PASS")
    print("PERFORMANCE_STEP8_UNRESOLVED_0_PASS")
    if implementation_candidates:
        print(f"PERFORMANCE_STEP8_IMPLEMENTATION_REQUIRED_COUNT={len(implementation_candidates)}")
        raise SystemExit(42)
    print("PERFORMANCE_STEP8_NO_NEW_RUNTIME_IMPLEMENTATION_REQUIRED_PASS")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        print(f"PERFORMANCE_STEP8_TERMINAL_MATRIX_FAIL: {exc}", file=sys.stderr)
        raise
