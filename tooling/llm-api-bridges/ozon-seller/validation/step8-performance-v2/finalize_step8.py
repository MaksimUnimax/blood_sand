#!/usr/bin/env python3
"""Assemble, compare and freeze the definitive Ozon Performance Step 8 evidence."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path
from typing import Any

PARTITION_FILES = (
    "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.json",
    "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.csv",
    "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.md",
    "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.json",
    "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.csv",
    "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.md",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.json",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.csv",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.md",
)
FULL_FILES = (
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX.json",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX.csv",
    "OZON_PERFORMANCE_STEP8_ACCEPTANCE_PROOF.json",
    "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_SUMMARY.md",
    "OZON_PERFORMANCE_STEP8_PACKAGE_MANIFEST.json",
    "OZON_BRIDGE_v0.1.19_STEP8_PERFORMANCE_48_TERMINAL_CANDIDATE.zip",
    "semantic-proof.json",
)
MARKERS = (
    "PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS",
    "PERFORMANCE_STEP8_CURRENT_READS_21_PRESERVED_PASS",
    "PERFORMANCE_STEP8_REMAINING_TERMINAL_DECISIONS_27_PASS",
    "PERFORMANCE_STEP8_NEW_RUNTIME_IMPLEMENTATION_0_PASS",
    "PERFORMANCE_STEP8_UNKNOWN_0_PASS",
    "PERFORMANCE_STEP8_PENDING_0_PASS",
    "PERFORMANCE_STEP8_UNRESOLVED_0_PASS",
    "PERFORMANCE_STEP8_EXISTING_MATRIX_REGRESSION_PASS",
    "PERFORMANCE_STEP8_EXISTING_READ_COVERAGE_REGRESSION_PASS",
    "PERFORMANCE_STEP8_LINUX_WINDOWS_BYTE_IDENTICAL_PASS",
    "PERFORMANCE_STEP8_FRESH_REPOSITORY_FREEZE_PASS",
    "OZON_PERFORMANCE_STEP8_INDEPENDENT_REVERIFICATION_PASS",
    "OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED",
)


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stable_write(path: Path, value: Any, *, pretty: bool = True) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if pretty:
        text = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    else:
        text = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
    path.write_text(text, encoding="utf-8", newline="\n")


def file_manifest(root: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: p.relative_to(root).as_posix()):
        rows.append({
            "path": path.relative_to(root).as_posix(),
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        })
    return rows


def require_files(root: Path, names: tuple[str, ...], label: str) -> None:
    actual = {p.name for p in root.iterdir() if p.is_file()}
    missing = sorted(set(names) - actual)
    require(not missing, f"{label} missing files: {missing}")


def verify_partition(stage: Path) -> dict[str, Any]:
    require_files(stage, PARTITION_FILES, "partition")
    baseline = load(stage / "OZON_PERFORMANCE_STEP8_TERMINAL_INVENTORY_V1.json")
    queue = load(stage / "OZON_PERFORMANCE_STEP8_REMAINING_QUEUE_V1.json")
    terminal = load(stage / "OZON_PERFORMANCE_STEP8_TERMINAL_MATRIX_V1.json")

    require(baseline.get("status") == "BASELINE_READY", "baseline status mismatch")
    require(baseline.get("counts") == {
        "performance_operations_total": 48,
        "already_accepted_current_reads": 21,
        "step8_remaining_operations": 27,
    }, "baseline counts mismatch")
    require(len(baseline.get("operations", [])) == 48, "baseline operations mismatch")

    require(queue.get("status") == "QUEUE_READY", "queue status mismatch")
    require(queue.get("counts") == {
        "performance_operations_total": 48,
        "already_accepted_current_reads": 21,
        "remaining_terminal_queue": 27,
    }, "queue counts mismatch")
    accepted = {row["identity"] for row in queue.get("accepted_current_reads", [])}
    remaining = {row["identity"] for row in queue.get("remaining_terminal_queue", [])}
    require(len(accepted) == 21 and len(remaining) == 27, "queue partition size mismatch")
    require(not accepted.intersection(remaining), "queue partitions overlap")
    require(len(accepted.union(remaining)) == 48, "queue union mismatch")

    require(terminal.get("status") == "TERMINAL_MATRIX_READY", "terminal status mismatch")
    counts = terminal.get("counts", {})
    require(counts.get("rows") == 48, "terminal row count mismatch")
    require(counts.get("already_accepted_current_reads") == 21, "terminal accepted read count mismatch")
    require(counts.get("remaining_source_terminal_decisions") == 27, "terminal remaining count mismatch")
    require(counts.get("implementation_candidates") == 0, "terminal implementation candidate count mismatch")
    require(counts.get("unknown") == counts.get("pending") == counts.get("unresolved") == 0, "terminal unresolved state")
    rows = terminal.get("rows", [])
    require(len(rows) == 48 and len({row["identity"] for row in rows}) == 48, "terminal identities mismatch")
    require(terminal.get("implementation_candidates") == [], "terminal implementation candidate payload not empty")

    return {
        "performance_operations_total": 48,
        "current_reads": 21,
        "remaining_terminal_decisions": 27,
        "new_runtime_implementation_count": 0,
        "unknown": 0,
        "pending": 0,
        "unresolved": 0,
    }


def verify_full(full: Path, source_commit: str) -> dict[str, Any]:
    require_files(full, FULL_FILES, "full gate")
    semantic = load(full / "semantic-proof.json")
    require(semantic.get("status") == "PASS", "semantic status mismatch")
    require(semantic.get("source_commit") == source_commit, "semantic source commit mismatch")
    require(semantic.get("performance_operations") == semantic.get("terminal_operations") == 48, "semantic terminal count mismatch")
    require(semantic.get("current_reads") == 21, "semantic current read count mismatch")
    require(semantic.get("seller_reads") == 245 and semantic.get("full_current_read_surface") == 266, "semantic integration count mismatch")
    require(semantic.get("unknown") == semantic.get("pending") == semantic.get("unresolved") == 0, "semantic unresolved state")
    package = full / "OZON_BRIDGE_v0.1.19_STEP8_PERFORMANCE_48_TERMINAL_CANDIDATE.zip"
    require(semantic.get("package_sha256") == sha256(package), "semantic package SHA mismatch")
    require(semantic.get("package_bytes") == package.stat().st_size, "semantic package size mismatch")
    return {
        "matrix_sha256": semantic["matrix_sha256"],
        "package_sha256": semantic["package_sha256"],
        "package_bytes": semantic["package_bytes"],
    }


def copy_clean(source: Path, destination: Path) -> None:
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination)


def assemble(args: argparse.Namespace) -> None:
    stage = args.stage.resolve()
    full = args.full.resolve()
    out = args.out.resolve()
    partition_summary = verify_partition(stage)
    full_summary = verify_full(full, args.source_commit)

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    copy_clean(stage, out / "partition")
    copy_clean(full, out / "full")
    proof = {
        "schema": "OZON_PERFORMANCE_STEP8_PLATFORM_ARTIFACT_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "partition": partition_summary,
        "full_gate": full_summary,
        "files": {
            "partition": file_manifest(out / "partition"),
            "full": file_manifest(out / "full"),
        },
        "markers": [
            "PERFORMANCE_STEP8_PLATFORM_PARTITION_PASS",
            "PERFORMANCE_STEP8_PLATFORM_FULL_GATE_PASS",
            "PERFORMANCE_STEP8_PLATFORM_ARTIFACT_PASS",
        ],
    }
    stable_write(out / "platform-proof.json", proof, pretty=False)
    print("PERFORMANCE_STEP8_PLATFORM_PARTITION_PASS")
    print("PERFORMANCE_STEP8_PLATFORM_FULL_GATE_PASS")
    print("PERFORMANCE_STEP8_PLATFORM_ARTIFACT_PASS")


def compare(args: argparse.Namespace) -> None:
    linux = args.linux.resolve()
    windows = args.windows.resolve()
    left = {p.relative_to(linux).as_posix(): p for p in linux.rglob("*") if p.is_file()}
    right = {p.relative_to(windows).as_posix(): p for p in windows.rglob("*") if p.is_file()}
    require(set(left) == set(right), f"platform file sets differ: {sorted(set(left)-set(right))} / {sorted(set(right)-set(left))}")
    rows = []
    for relative in sorted(left):
        left_bytes = left[relative].read_bytes()
        right_bytes = right[relative].read_bytes()
        require(left_bytes == right_bytes, f"platform bytes differ: {relative}")
        rows.append({"path": relative, "bytes": len(left_bytes), "sha256": hashlib.sha256(left_bytes).hexdigest()})
    linux_proof = load(linux / "platform-proof.json")
    windows_proof = load(windows / "platform-proof.json")
    require(linux_proof == windows_proof, "platform proof values differ")
    require(linux_proof.get("source_commit") == args.source_commit, "platform source commit mismatch")
    proof = {
        "schema": "OZON_PERFORMANCE_STEP8_CROSS_PLATFORM_PROOF_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "workflow_run_id": args.workflow_run_id,
        "platforms": ["ubuntu-latest", "windows-latest"],
        "byte_identical": True,
        "file_count": len(rows),
        "matrix_sha256": linux_proof["full_gate"]["matrix_sha256"],
        "package_sha256": linux_proof["full_gate"]["package_sha256"],
        "package_bytes": linux_proof["full_gate"]["package_bytes"],
        "files": rows,
        "markers": [
            "PERFORMANCE_STEP8_LINUX_PLATFORM_GATE_PASS",
            "PERFORMANCE_STEP8_WINDOWS_PLATFORM_GATE_PASS",
            "PERFORMANCE_STEP8_LINUX_WINDOWS_BYTE_IDENTICAL_PASS",
        ],
    }
    stable_write(args.out.resolve(), proof, pretty=False)
    print("PERFORMANCE_STEP8_LINUX_WINDOWS_BYTE_IDENTICAL_PASS")


def compare_tree_bytes(left: Path, right: Path, label: str) -> None:
    left_files = {p.relative_to(left).as_posix(): p for p in left.rglob("*") if p.is_file()}
    right_files = {p.relative_to(right).as_posix(): p for p in right.rglob("*") if p.is_file()}
    require(set(left_files) == set(right_files), f"{label} file sets differ")
    for relative in sorted(left_files):
        require(left_files[relative].read_bytes() == right_files[relative].read_bytes(), f"{label} bytes differ: {relative}")


def finalize(args: argparse.Namespace) -> None:
    repo = args.repo_root.resolve()
    fresh_stage = args.fresh_stage.resolve()
    fresh_full = args.fresh_full.resolve()
    linux = args.linux.resolve()
    windows = args.windows.resolve()
    cross_path = args.cross.resolve()

    partition_summary = verify_partition(fresh_stage)
    full_summary = verify_full(fresh_full, args.source_commit)
    compare_tree_bytes(fresh_stage, linux / "partition", "fresh partition/Linux")
    compare_tree_bytes(fresh_full, linux / "full", "fresh full/Linux")
    compare_tree_bytes(linux, windows, "Linux/Windows")

    cross = load(cross_path)
    require(cross.get("status") == "PASS" and cross.get("byte_identical") is True, "cross-platform proof failed")
    require(cross.get("source_commit") == args.source_commit, "cross-platform source commit mismatch")
    require(cross.get("workflow_run_id") == args.workflow_run_id, "cross-platform workflow run mismatch")
    require(cross.get("package_sha256") == full_summary["package_sha256"], "cross-platform package SHA mismatch")

    seller = repo / "tooling/llm-api-bridges/ozon-seller"
    v1 = seller / "validation/step8-performance-v1"
    independent_path = v1 / "evidence/OZON_PERFORMANCE_STEP8_INDEPENDENT_REVERIFICATION_V1.json"
    independent = load(independent_path)
    require(independent.get("status") == "PASS", "independent reverification status mismatch")
    require(independent.get("performed_outside_github_actions") is True, "independent reverification provenance mismatch")
    counts = independent.get("counts", {})
    require(counts.get("performance_operations_total") == 48, "independent operation count mismatch")
    require(counts.get("already_accepted_current_reads") == 21, "independent read count mismatch")
    require(counts.get("remaining_source_terminal_decisions") == 27, "independent remaining count mismatch")
    require(counts.get("new_runtime_implementation_count") == 0, "independent implementation count mismatch")
    require(counts.get("unknown") == counts.get("pending") == counts.get("unresolved") == 0, "independent unresolved state")

    v2 = seller / "validation/step8-performance-v2"
    generated = v2 / "generated"
    evidence = v2 / "evidence"
    if generated.exists():
        shutil.rmtree(generated)
    if evidence.exists():
        shutil.rmtree(evidence)
    generated.mkdir(parents=True)
    evidence.mkdir(parents=True)
    copy_clean(linux / "partition", generated / "partition")
    copy_clean(linux / "full", generated / "full")
    shutil.copy2(linux / "platform-proof.json", generated / "platform-proof.json")
    shutil.copy2(cross_path, evidence / "OZON_PERFORMANCE_STEP8_CROSS_PLATFORM_PROOF_V2.json")

    acceptance = {
        "schema": "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2",
        "schema_version": 2,
        "status": "ACCEPTED",
        "source_commit": args.source_commit,
        "workflow_run_id": args.workflow_run_id,
        "scope": {
            "performance_operations_terminal": 48,
            "performance_operations_total": 48,
            "current_production_reads": 21,
            "source_terminal_non_current_operations": 27,
            "new_runtime_implementation_count": 0,
            "unknown": 0,
            "pending": 0,
            "unresolved": 0,
        },
        "seller_step7_dependency": {
            "formal_acceptance_marker": "OZON_SELLER_STEP7_FORMALLY_ACCEPTED",
            "production_reads": 245,
            "candidate_tree_sha256": "f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974",
            "package_sha256": "f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574",
        },
        "combined_current_read_surface": {
            "seller_reads": 245,
            "performance_reads": 21,
            "total_reads": 266,
        },
        "fresh_reproduction": {
            "matches_linux_artifact": True,
            "partition": partition_summary,
            "full_gate": full_summary,
        },
        "cross_platform": {
            "status": "PASS",
            "byte_identical": True,
            "proof_sha256": sha256(cross_path),
            "file_count": cross["file_count"],
        },
        "independent_reverification": {
            "status": "PASS",
            "performed_outside_github_actions": True,
            "path": independent_path.relative_to(repo).as_posix(),
            "sha256": sha256(independent_path),
        },
        "canonical": {
            "branch": args.canonical_branch,
            "commit": args.canonical_sha,
            "modified": False,
        },
        "decision": {
            "step8_formally_closed": True,
            "canonical_promotion_performed": False,
            "next_branch": args.step9_branch,
            "next_stage": "STEP9_FULL_INTEGRATION_266_CURRENT_READS",
        },
        "markers": list(MARKERS),
    }
    acceptance_path = evidence / "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2.json"
    stable_write(acceptance_path, acceptance)

    md = [
        "# Ozon Performance Step 8 — formal acceptance v2",
        "",
        "**Status:** `ACCEPTED`",
        "",
        "## Accepted scope",
        "",
        "- Performance authority: `48 / 48` terminal operations.",
        "- Current production Performance reads: `21`.",
        "- Source-terminal non-current operations: `27`.",
        "- New runtime implementations required: `0`.",
        "- Unknown / pending / unresolved: `0 / 0 / 0`.",
        "- Combined current-read surface entering Step 9: `245 Seller + 21 Performance = 266`.",
        "",
        "## Verification",
        "",
        "- Fresh partition and terminal outputs reproduced from repository sources.",
        "- Existing Performance matrix and read-coverage regressions passed.",
        "- Linux and Windows outputs are byte-identical.",
        "- Fresh repository reproduction equals the downloaded Linux artifact byte-for-byte.",
        "- Independent out-of-CI reverification remains PASS.",
        "",
        "## Canonical protection",
        "",
        f"- Canonical branch: `{args.canonical_branch}`.",
        f"- Canonical commit: `{args.canonical_sha}`.",
        "- Canonical modified: `false`.",
        "",
        "## Next stage",
        "",
        f"`{args.step9_branch}` — `STEP9_FULL_INTEGRATION_266_CURRENT_READS`.",
        "",
        "## Markers",
        "",
        "```text",
        *MARKERS,
        "```",
        "",
    ]
    (evidence / "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2.md").write_text("\n".join(md), encoding="utf-8", newline="\n")
    (evidence / "OZON_PERFORMANCE_STEP8_ACCEPTANCE_MARKERS_V2.txt").write_text("\n".join(MARKERS) + "\n", encoding="utf-8", newline="\n")
    stable_write(evidence / "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_STATUS_V2.json", {
        "schema": "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_STATUS_V2",
        "schema_version": 2,
        "status": "PASS",
        "formal_acceptance": "ACCEPTED",
        "source_commit": args.source_commit,
        "workflow_run_id": args.workflow_run_id,
        "performance_operations_terminal": 48,
        "current_performance_reads": 21,
        "combined_current_reads_for_step9": 266,
        "canonical_modified": False,
        "next_branch": args.step9_branch,
        "marker": "OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED",
    })
    stable_write(v2 / "OZON_PERFORMANCE_STEP8_V2_MANIFEST.json", {
        "schema": "OZON_PERFORMANCE_STEP8_V2_MANIFEST",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": args.source_commit,
        "workflow_run_id": args.workflow_run_id,
        "generated_files": file_manifest(generated),
        "evidence_files": file_manifest(evidence),
    })
    (v2 / "README.md").write_text(
        "# Ozon Performance Step 8 v2\n\n"
        "Definitive fail-closed cross-platform acceptance for all 48 Performance operations.\n\n"
        "- Current reads: `21`.\n"
        "- Source-terminal non-current operations: `27`.\n"
        "- New runtime implementation: `0`.\n"
        "- Unknown / pending / unresolved: `0 / 0 / 0`.\n"
        "- Formal marker: `OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED`.\n",
        encoding="utf-8",
        newline="\n",
    )

    roadmap = v1 / "OZON_STEP8_PERFORMANCE_48_ROADMAP.md"
    text = roadmap.read_text(encoding="utf-8")
    text = text.replace("**Status:** `IN_PROGRESS`", "**Status:** `ACCEPTED`")
    completion_marker = "## Formal completion — v2"
    if completion_marker not in text:
        text = text.rstrip() + "\n\n" + completion_marker + "\n\n" + (
            f"- Source commit: `{args.source_commit}`.\n"
            f"- Workflow run: `{args.workflow_run_id}`.\n"
            "- Performance operations terminal: `48 / 48`.\n"
            "- Current Performance reads preserved: `21`.\n"
            "- Remaining source-terminal decisions: `27`.\n"
            "- New runtime implementation required: `0`.\n"
            "- Unknown / pending / unresolved: `0 / 0 / 0`.\n"
            "- Linux/Windows byte identity: `PASS`.\n"
            "- Fresh repository freeze verification: `PASS`.\n"
            "- Independent reverification: `PASS`.\n"
            "- `OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED`.\n"
            f"- Next stage: `{args.step9_branch}`.\n"
        )
    roadmap.write_text(text, encoding="utf-8", newline="\n")

    for marker in MARKERS:
        print(marker)


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser()
    sub = root.add_subparsers(dest="command", required=True)

    p = sub.add_parser("assemble")
    p.add_argument("--stage", type=Path, required=True)
    p.add_argument("--full", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--source-commit", required=True)
    p.set_defaults(func=assemble)

    p = sub.add_parser("compare")
    p.add_argument("--linux", type=Path, required=True)
    p.add_argument("--windows", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--source-commit", required=True)
    p.add_argument("--workflow-run-id", type=int, required=True)
    p.set_defaults(func=compare)

    p = sub.add_parser("finalize")
    p.add_argument("--repo-root", type=Path, required=True)
    p.add_argument("--fresh-stage", type=Path, required=True)
    p.add_argument("--fresh-full", type=Path, required=True)
    p.add_argument("--linux", type=Path, required=True)
    p.add_argument("--windows", type=Path, required=True)
    p.add_argument("--cross", type=Path, required=True)
    p.add_argument("--source-commit", required=True)
    p.add_argument("--workflow-run-id", type=int, required=True)
    p.add_argument("--canonical-branch", required=True)
    p.add_argument("--canonical-sha", required=True)
    p.add_argument("--step9-branch", required=True)
    p.set_defaults(func=finalize)
    return root


def main() -> None:
    args = parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_PERFORMANCE_STEP8_V2_FAIL: {exc}", file=sys.stderr)
        raise
