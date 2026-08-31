#!/usr/bin/env python3
"""Build a fail-closed Performance Step 8 terminal-inventory baseline."""
from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

EXPECTED_TOTAL = 48
EXPECTED_ACCEPTED = 21
EXPECTED_REMAINING = 27


def walk(node: Any, path: tuple[str, ...] = ()):
    yield path, node
    if isinstance(node, dict):
        for key, value in node.items():
            yield from walk(value, path + (str(key),))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from walk(value, path + (str(index),))


def candidate_lists(document: Any):
    candidates = []
    for path, node in walk(document):
        if isinstance(node, list) and len(node) == EXPECTED_TOTAL and all(isinstance(item, dict) for item in node):
            keys = set().union(*(item.keys() for item in node)) if node else set()
            score = sum(
                any(token in str(key).lower() for token in ("operation", "method", "path", "status", "decision", "read", "surface"))
                for key in keys
            )
            candidates.append((score, path, node, sorted(map(str, keys))))
    return sorted(candidates, key=lambda item: (item[0], len(item[3])), reverse=True)


def find_int_markers(document: Any, value: int) -> list[str]:
    matches = []
    for path, node in walk(document):
        if isinstance(node, int) and not isinstance(node, bool) and node == value:
            matches.append(".".join(path))
    return matches


def first(record: dict[str, Any], names: list[str]):
    lowered = {str(key).lower(): key for key in record}
    for name in names:
        if name in lowered:
            return record[lowered[name]]
    for lowered_key, key in lowered.items():
        if any(name in lowered_key for name in names):
            return record[key]
    return None


def normalize(record: dict[str, Any], index: int) -> dict[str, Any]:
    operation = first(record, ["operation_id", "operation", "key", "name", "id"])
    method = first(record, ["method", "http_method"])
    path = first(record, ["path", "endpoint", "route", "url"])
    decision = first(record, ["decision", "status", "classification", "terminal_state", "support_state"])
    return {
        "index": index,
        "operation_id": None if operation is None else str(operation),
        "method": None if method is None else str(method),
        "path": None if path is None else str(path),
        "existing_decision": None if decision is None else str(decision),
        "source_record": record,
    }


def locate_unique(root: Path, filename: str) -> Path:
    hits = list(root.rglob(filename))
    if len(hits) != 1:
        raise RuntimeError(f"authoritative file is not unique: {filename}: {hits}")
    return hits[0]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    seller_root = repo_root / "tooling/llm-api-bridges/ozon-seller"

    matrix = locate_unique(seller_root, "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json")
    checklist = locate_unique(seller_root, "OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.json")
    matrix_document = json.loads(matrix.read_text(encoding="utf-8"))
    checklist_document = json.loads(checklist.read_text(encoding="utf-8"))

    candidates = candidate_lists(matrix_document)
    if not candidates:
        raise RuntimeError("no authoritative 48-row dictionary list in Performance matrix")
    score, rows_path, rows, keys = candidates[0]
    if len(candidates) > 1 and candidates[1][0] == score and candidates[1][1] != rows_path:
        raise RuntimeError(f"ambiguous authoritative 48-row lists: {rows_path} and {candidates[1][1]}")

    normalized = [normalize(record, index) for index, record in enumerate(rows, start=1)]
    identities = []
    for row in normalized:
        identity = row["operation_id"] or f"{row['method'] or ''} {row['path'] or ''}".strip()
        if not identity:
            raise RuntimeError(f"row {row['index']} lacks operation identity")
        identities.append(identity)
    if len(set(identities)) != EXPECTED_TOTAL:
        duplicates = [key for key, count in Counter(identities).items() if count > 1]
        raise RuntimeError(f"non-unique Performance operation identities: {duplicates}")

    accepted_markers = find_int_markers(matrix_document, EXPECTED_ACCEPTED)
    accepted_markers.extend(find_int_markers(checklist_document, EXPECTED_ACCEPTED))
    if not accepted_markers:
        raise RuntimeError("accepted current-read count 21 is not explicitly evidenced")

    remaining = EXPECTED_TOTAL - EXPECTED_ACCEPTED
    if remaining != EXPECTED_REMAINING:
        raise RuntimeError("remaining Performance arithmetic mismatch")

    payload = {
        "schema": "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1",
        "schema_version": 1,
        "status": "BASELINE_READY",
        "source": {
            "performance_matrix": matrix.relative_to(repo_root).as_posix(),
            "master_checklist": checklist.relative_to(repo_root).as_posix(),
            "matrix_rows_path": ".".join(rows_path),
            "matrix_candidate_score": score,
            "matrix_row_keys": keys,
            "accepted_count_evidence_paths": accepted_markers,
        },
        "counts": {
            "performance_operations_total": EXPECTED_TOTAL,
            "already_accepted_current_reads": EXPECTED_ACCEPTED,
            "step8_remaining_operations": EXPECTED_REMAINING,
        },
        "operations": normalized,
        "markers": [
            "STEP8_PERFORMANCE_AUTHORITY_48_DISCOVERED_PASS",
            "STEP8_PERFORMANCE_ACCEPTED_21_BASELINE_PASS",
            "STEP8_PERFORMANCE_REMAINING_27_QUEUE_PASS",
        ],
    }

    json_path = out / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.json"
    csv_path = out / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.csv"
    markdown_path = out / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.md"

    json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["index", "operation_id", "method", "path", "existing_decision"],
        )
        writer.writeheader()
        for row in normalized:
            writer.writerow({key: row[key] for key in writer.fieldnames})

    markdown = [
        "# Ozon Performance Step 8 — terminal inventory baseline",
        "",
        "**Status:** `BASELINE_READY`",
        "",
        f"- Performance operations: `{EXPECTED_TOTAL}`.",
        f"- Already accepted current reads: `{EXPECTED_ACCEPTED}`.",
        f"- Remaining Step 8 terminal queue: `{EXPECTED_REMAINING}`.",
        "",
        "## Reproducibility",
        "",
        f"- Matrix: `{matrix.relative_to(repo_root).as_posix()}`.",
        f"- Master checklist: `{checklist.relative_to(repo_root).as_posix()}`.",
        f"- Authoritative 48-row list: `{'.'.join(rows_path)}`.",
        "",
        "## Markers",
        "",
        "`STEP8_PERFORMANCE_AUTHORITY_48_DISCOVERED_PASS`  ",
        "`STEP8_PERFORMANCE_ACCEPTED_21_BASELINE_PASS`  ",
        "`STEP8_PERFORMANCE_REMAINING_27_QUEUE_PASS`",
        "",
    ]
    markdown_path.write_text("\n".join(markdown), encoding="utf-8", newline="\n")

    print("STEP8_PERFORMANCE_AUTHORITY_48_DISCOVERED_PASS")
    print("STEP8_PERFORMANCE_ACCEPTED_21_BASELINE_PASS")
    print("STEP8_PERFORMANCE_REMAINING_27_QUEUE_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"STEP8_PERFORMANCE_INVENTORY_FAIL: {exc}", file=sys.stderr)
        raise
