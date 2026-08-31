#!/usr/bin/env python3
"""Derive the exact accepted Performance 21-set and remaining 27-operation queue."""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable

EXPECTED_TOTAL = 48
EXPECTED_ACCEPTED = 21
EXPECTED_REMAINING = 27
POSITIVE = (
    "accepted", "current", "read", "production", "implemented", "supported",
    "retain", "allow", "pass", "enabled", "active",
)
NEGATIVE = (
    "unsupported", "unknown", "pending", "unresolved", "write", "mutation",
    "delete", "create", "update", "no_current", "not_read", "denied",
    "false", "blocked",
)


def walk(node: Any, path: tuple[str, ...] = ()):
    yield path, node
    if isinstance(node, dict):
        for key, value in node.items():
            yield from walk(value, path + (str(key),))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from walk(value, path + (str(index),))


def flatten_scalars(node: Any, path: tuple[str, ...] = ()):
    if isinstance(node, dict):
        for key, value in node.items():
            yield from flatten_scalars(value, path + (str(key),))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from flatten_scalars(value, path + (str(index),))
    elif node is not None:
        yield ".".join(path), node


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value).strip()).lower()


def score_text(value: str) -> int:
    normalized = normalize_text(value)
    score = 0
    for token in POSITIVE:
        if token in normalized:
            score += 3
    for token in NEGATIVE:
        if token in normalized:
            score -= 4
    if normalized in ("true", "yes", "1"):
        score += 2
    if normalized in ("false", "no", "0"):
        score -= 2
    return score


def operation_aliases(row: dict[str, Any]) -> set[str]:
    values: set[str] = set()
    for key in ("operation_id", "method", "path", "existing_decision"):
        value = row.get(key)
        if value is not None and str(value).strip():
            values.add(normalize_text(value))
    if row.get("method") and row.get("path"):
        values.add(normalize_text(f"{row['method']} {row['path']}"))
    for _, value in flatten_scalars(row.get("source_record", {})):
        if isinstance(value, (str, int)) and str(value).strip():
            values.add(normalize_text(value))
    variants: set[str] = set()
    for value in values:
        variants.add(value.replace("-", "_"))
        variants.add(value.replace("_", "-"))
        variants.add(value.rstrip("/"))
    return values | variants


def element_strings(value: Any) -> set[str]:
    strings: set[str] = set()
    if isinstance(value, (str, int)):
        strings.add(normalize_text(value))
    elif isinstance(value, dict):
        for _, scalar in flatten_scalars(value):
            if isinstance(scalar, (str, int)) and str(scalar).strip():
                strings.add(normalize_text(scalar))
    return strings


def match_items(
    items: Iterable[Any],
    rows: list[dict[str, Any]],
    aliases_by_identity: dict[str, set[str]],
) -> set[str]:
    strings: set[str] = set()
    for item in items:
        strings |= element_strings(item)
    matched: set[str] = set()
    for row in rows:
        identity = row["_identity"]
        aliases = aliases_by_identity[identity]
        if aliases & strings:
            matched.add(identity)
            continue
        for alias in aliases:
            if len(alias) < 8:
                continue
            if any(alias in value or value in alias for value in strings if len(value) >= 8):
                matched.add(identity)
                break
    return matched


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

    baseline_hits = list(seller_root.rglob("OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.json"))
    if not baseline_hits:
        raise RuntimeError("frozen Step 8 baseline inventory not found")
    baseline_hits.sort(
        key=lambda path: (
            "step8-performance-v1/generated" in path.as_posix(),
            len(path.as_posix()),
        ),
        reverse=True,
    )
    baseline_path = baseline_hits[0]
    baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    rows = baseline["operations"]
    if len(rows) != EXPECTED_TOTAL:
        raise RuntimeError(f"baseline row count {len(rows)} != {EXPECTED_TOTAL}")

    for row in rows:
        identity = row.get("operation_id") or f"{row.get('method') or ''} {row.get('path') or ''}".strip()
        if not identity:
            raise RuntimeError(f"operation row lacks identity: {row}")
        row["_identity"] = str(identity)
    if len({row["_identity"] for row in rows}) != EXPECTED_TOTAL:
        duplicates = [
            key for key, count in Counter(row["_identity"] for row in rows).items()
            if count > 1
        ]
        raise RuntimeError(f"baseline operation identities are not unique: {duplicates}")

    aliases_by_identity = {
        row["_identity"]: operation_aliases(row)
        for row in rows
    }
    candidates: dict[frozenset[str], list[dict[str, Any]]] = defaultdict(list)

    def add_candidate(ids: set[str], kind: str, evidence: str, score: int) -> None:
        if len(ids) == EXPECTED_ACCEPTED:
            candidates[frozenset(ids)].append({
                "kind": kind,
                "evidence": evidence,
                "score": score,
            })

    json_sources = []
    for filename in (
        "OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json",
        "OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.json",
    ):
        source = locate_unique(seller_root, filename)
        document = json.loads(source.read_text(encoding="utf-8"))
        json_sources.append((source, document))
        for path, node in walk(document):
            if isinstance(node, list) and len(node) == EXPECTED_ACCEPTED:
                ids = match_items(node, rows, aliases_by_identity)
                add_candidate(
                    ids,
                    "explicit_21_list",
                    f"{source.relative_to(repo_root).as_posix()}::{'.'.join(path)}",
                    20 + score_text(".".join(path)),
                )

    scalar_groups: dict[tuple[str, str], set[str]] = defaultdict(set)
    original_values: dict[tuple[str, str], Any] = {}
    for row in rows:
        for path, value in flatten_scalars(row.get("source_record", {})):
            if isinstance(value, (str, int, bool, float)):
                key = (path, normalize_text(value))
                scalar_groups[key].add(row["_identity"])
                original_values[key] = value
    for (path, normalized_value), ids in scalar_groups.items():
        add_candidate(
            ids,
            "row_scalar_predicate",
            f"source_record::{path} == {original_values[(path, normalized_value)]!r}",
            10 + score_text(path) + score_text(normalized_value),
        )

    for source, document in json_sources:
        for path, node in walk(document):
            if not (
                isinstance(node, list)
                and len(node) >= EXPECTED_ACCEPTED
                and all(isinstance(item, dict) for item in node)
            ):
                continue
            local_groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
            for item in node:
                for field_path, value in flatten_scalars(item):
                    if isinstance(value, (str, int, bool, float)):
                        local_groups[(field_path, normalize_text(value))].append(item)
            for (field_path, normalized_value), items in local_groups.items():
                if len(items) != EXPECTED_ACCEPTED:
                    continue
                ids = match_items(items, rows, aliases_by_identity)
                add_candidate(
                    ids,
                    "authoritative_list_predicate",
                    (
                        f"{source.relative_to(repo_root).as_posix()}::"
                        f"{'.'.join(path)}::{field_path}={normalized_value}"
                    ),
                    15
                    + score_text(".".join(path))
                    + score_text(field_path)
                    + score_text(normalized_value),
                )

    relevant_files = []
    for path in seller_root.rglob("*"):
        if not path.is_file() or path.stat().st_size > 2_000_000:
            continue
        name = path.name.lower()
        if (
            "performance" in name
            and ("read_coverage" in name or "step6" in name)
            and path.suffix.lower() in (".mjs", ".js", ".md", ".json", ".csv", ".txt")
        ):
            relevant_files.append(path)
    for path in relevant_files:
        try:
            content = normalize_text(path.read_text(encoding="utf-8"))
        except UnicodeDecodeError:
            continue
        ids = set()
        for row in rows:
            identity = row["_identity"]
            if any(
                len(alias) >= 8 and alias in content
                for alias in aliases_by_identity[identity]
            ):
                ids.add(identity)
        bonus = (
            25
            if "read_coverage" in path.name.lower()
            and path.suffix.lower() in (".mjs", ".js")
            else 8
        )
        add_candidate(
            ids,
            "step6_read_coverage_file",
            path.relative_to(repo_root).as_posix(),
            bonus + score_text(path.name),
        )

    if not candidates:
        diagnostics = {
            "status": "BLOCKED",
            "reason": "no unambiguous 21-operation accepted-set candidate",
            "scalar_groups_with_count_21": [
                {
                    "path": path,
                    "value": value,
                    "score": 10 + score_text(path) + score_text(value),
                }
                for (path, value), ids in scalar_groups.items()
                if len(ids) == EXPECTED_ACCEPTED
            ],
        }
        (out / "OZON_PERFORMANCE_STEP8_ACCEPTED_SET_DISCOVERY_BLOCKED.json").write_text(
            json.dumps(diagnostics, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        raise RuntimeError("no accepted 21-operation set candidate")

    ranked = []
    for ids, evidence in candidates.items():
        ranked.append({
            "ids": ids,
            "score": max(item["score"] for item in evidence),
            "evidence": sorted(evidence, key=lambda item: item["score"], reverse=True),
        })
    ranked.sort(key=lambda item: (item["score"], len(item["evidence"])), reverse=True)
    selected = ranked[0]
    if selected["score"] <= 0:
        raise RuntimeError(f"accepted-set candidate score is non-positive: {selected['score']}")
    if (
        len(ranked) > 1
        and ranked[1]["ids"] != selected["ids"]
        and ranked[1]["score"] >= selected["score"] - 2
    ):
        diagnostics = {
            "status": "BLOCKED",
            "reason": "competing accepted 21-operation sets",
            "candidates": [
                {
                    "score": item["score"],
                    "evidence": item["evidence"],
                    "ids": sorted(item["ids"]),
                }
                for item in ranked[:10]
            ],
        }
        (out / "OZON_PERFORMANCE_STEP8_ACCEPTED_SET_DISCOVERY_BLOCKED.json").write_text(
            json.dumps(diagnostics, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        raise RuntimeError("accepted 21-operation set is ambiguous")

    accepted_ids = set(selected["ids"])
    remaining_ids = {row["_identity"] for row in rows} - accepted_ids
    if len(accepted_ids) != EXPECTED_ACCEPTED or len(remaining_ids) != EXPECTED_REMAINING:
        raise RuntimeError("exact 21/27 partition mismatch")

    accepted = []
    remaining = []
    for row in rows:
        clean = {key: value for key, value in row.items() if key != "_identity"}
        clean["identity"] = row["_identity"]
        clean["step8_partition"] = (
            "ALREADY_ACCEPTED_CURRENT_READ"
            if row["_identity"] in accepted_ids
            else "REMAINING_TERMINAL_QUEUE"
        )
        (accepted if row["_identity"] in accepted_ids else remaining).append(clean)

    payload = {
        "schema": "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1",
        "schema_version": 1,
        "status": "QUEUE_READY",
        "source": {
            "baseline_inventory": baseline_path.relative_to(repo_root).as_posix(),
            "selected_evidence": selected["evidence"],
            "selected_score": selected["score"],
            "candidate_set_count": len(ranked),
        },
        "counts": {
            "performance_operations_total": EXPECTED_TOTAL,
            "already_accepted_current_reads": EXPECTED_ACCEPTED,
            "remaining_terminal_queue": EXPECTED_REMAINING,
        },
        "accepted_current_reads": accepted,
        "remaining_terminal_queue": remaining,
        "markers": [
            "STEP8_PERFORMANCE_ACCEPTED_21_EXACT_SET_PASS",
            "STEP8_PERFORMANCE_REMAINING_27_EXACT_QUEUE_PASS",
        ],
    }

    json_path = out / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.json"
    csv_path = out / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.csv"
    markdown_path = out / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.md"
    json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        fields = [
            "partition", "index", "identity", "operation_id", "method", "path",
            "existing_decision",
        ]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for partition, data in (
            ("ALREADY_ACCEPTED_CURRENT_READ", accepted),
            ("REMAINING_TERMINAL_QUEUE", remaining),
        ):
            for row in data:
                writer.writerow({
                    key: partition if key == "partition" else row.get(key)
                    for key in fields
                })

    markdown = [
        "# Ozon Performance Step 8 — exact remaining queue",
        "",
        "**Status:** `QUEUE_READY`",
        "",
        "- Total Performance operations: `48`.",
        "- Exact already accepted current reads: `21`.",
        "- Exact remaining terminal queue: `27`.",
        "",
        "## Selected evidence",
        "",
    ]
    for evidence in selected["evidence"][:10]:
        markdown.append(
            f"- `{evidence['kind']}` · score `{evidence['score']}` · "
            f"`{evidence['evidence']}`"
        )
    markdown.extend([
        "",
        "## Markers",
        "",
        "`STEP8_PERFORMANCE_ACCEPTED_21_EXACT_SET_PASS`  ",
        "`STEP8_PERFORMANCE_REMAINING_27_EXACT_QUEUE_PASS`",
        "",
    ])
    markdown_path.write_text("\n".join(markdown), encoding="utf-8", newline="\n")

    print("STEP8_PERFORMANCE_ACCEPTED_21_EXACT_SET_PASS")
    print("STEP8_PERFORMANCE_REMAINING_27_EXACT_QUEUE_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"STEP8_PERFORMANCE_REMAINING_QUEUE_FAIL: {exc}", file=sys.stderr)
        raise
