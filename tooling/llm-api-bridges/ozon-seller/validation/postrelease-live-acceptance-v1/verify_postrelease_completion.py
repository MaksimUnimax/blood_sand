#!/usr/bin/env python3
"""Fail-closed verification of the full-read 266 release plus owner live API evidence."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import Any, Iterable

RELEASE_COMMIT = "9cb1017b9ea234c2f4002f360db62502176f98b2"
CANONICAL_BRANCH = "repair/ozon-v2-b1-stocks-warehouse-2026-08-29"
CANONICAL_HEAD = "8ee16f38bf2ec60e4b2e42192c2f41d87021b214"
ZIP_NAME = "OZON_BRIDGE_v0.1.19_FULL_READ_266_INSTALLABLE.zip"
ZIP_SHA256 = "f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574"
ZIP_BYTES = 1_146_084
OWNER_RECORD = Path(
    "tooling/llm-api-bridges/ozon-seller/validation/postrelease-live-acceptance-v1/"
    "OZON_FULL_READ_266_OWNER_LIVE_ACCEPTANCE_V1.json"
)


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def json_candidates(root: Path) -> Iterable[tuple[Path, Any, str]]:
    for path in sorted(root.rglob("*.json"), key=lambda p: p.as_posix()):
        try:
            data = load_json(path)
        except Exception:
            continue
        text = json.dumps(data, ensure_ascii=False, sort_keys=True)
        yield path, data, text


def accepted(data: Any, text: str) -> bool:
    if not isinstance(data, dict):
        return False
    status = str(data.get("status", data.get("result", data.get("conclusion", "")))).upper()
    return any(token in status for token in ("PASS", "ACCEPT", "RELEASE")) or "\"PASS\"" in text


def find_formal_record(candidates: list[tuple[Path, Any, str]], tokens: tuple[str, ...]) -> tuple[Path, Any]:
    for path, data, text in candidates:
        upper = text.upper()
        if all(token.upper() in upper for token in tokens) and accepted(data, text):
            return path, data
    raise RuntimeError(f"formal acceptance record not found for tokens={tokens!r}")


def deep_pairs(value: Any, prefix: str = "") -> Iterable[tuple[str, Any]]:
    if isinstance(value, dict):
        for key, item in value.items():
            path = f"{prefix}.{key}" if prefix else str(key)
            yield path, item
            yield from deep_pairs(item, path)
    elif isinstance(value, list):
        for index, item in enumerate(value):
            path = f"{prefix}[{index}]"
            yield path, item
            yield from deep_pairs(item, path)


def has_numeric_evidence(data: Any, expected: int, key_fragments: tuple[str, ...]) -> bool:
    for path, value in deep_pairs(data):
        lowered = path.lower()
        if all(fragment.lower() in lowered for fragment in key_fragments) and value == expected:
            return True
    return False


def find_release_zip(root: Path) -> Path:
    matches = sorted(root.rglob(ZIP_NAME), key=lambda p: p.as_posix())
    require(len(matches) == 1, f"expected exactly one {ZIP_NAME}, found {len(matches)}")
    return matches[0]


def verify_zip(path: Path) -> dict[str, Any]:
    require(path.stat().st_size == ZIP_BYTES, f"installable ZIP size mismatch: {path.stat().st_size}")
    require(sha256(path) == ZIP_SHA256, f"installable ZIP SHA-256 mismatch: {sha256(path)}")
    with zipfile.ZipFile(path) as archive:
        names = [item.filename for item in archive.infolist() if not item.is_dir()]
        require(len(names) == 21, f"installable ZIP file count mismatch: {len(names)}")
        require("manifest.json" in names, "manifest.json is not at installable ZIP root")
        require(all(not name.startswith(("/", "\\")) for name in names), "absolute ZIP entry")
        require(all(".." not in Path(name).parts for name in names), "path traversal ZIP entry")
        forbidden = ("validation/", "checkpoint", "evidence/", ".github/", ".git/")
        require(not any(any(token in name.lower() for token in forbidden) for name in names), "non-production file in installable ZIP")
    return {"path": path.as_posix(), "bytes": ZIP_BYTES, "sha256": ZIP_SHA256, "file_count": 21}


def canonical_remote_head(repo: Path) -> str:
    command = ["git", "ls-remote", "origin", f"refs/heads/{CANONICAL_BRANCH}"]
    result = subprocess.run(command, cwd=repo, text=True, capture_output=True, check=True)
    line = result.stdout.strip()
    require(bool(line), "canonical branch not returned by git ls-remote")
    return line.split()[0]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    parser.add_argument("--output-json", type=Path, required=True)
    parser.add_argument("--output-md", type=Path, required=True)
    args = parser.parse_args()

    root = args.repo_root.resolve()
    owner_path = root / OWNER_RECORD
    require(owner_path.exists(), f"owner live record missing: {owner_path}")
    owner = load_json(owner_path)
    require(owner.get("status") == "PASS", "owner live acceptance is not PASS")
    require(owner.get("release_commit") == RELEASE_COMMIT, "owner evidence release commit mismatch")
    coverage = owner.get("coverage", {})
    require(coverage.get("new_seller_read_aliases_total") == 26, "owner evidence total aliases mismatch")
    require(coverage.get("new_seller_read_aliases_exercised") == 26, "owner evidence exercised aliases mismatch")
    require(coverage.get("new_seller_read_aliases_provider_dispatched_when_authorized") == 26, "owner provider-dispatch coverage mismatch")
    privacy = owner.get("privacy", {})
    require(privacy.get("personal_data_off_policy_blocked") == 13, "privacy OFF blocked count mismatch")
    require(privacy.get("personal_data_off_physical_requests") == 0, "privacy OFF leaked provider requests")
    require(privacy.get("authorized_explicit_resubmit_operations") == 13, "authorized operation count mismatch")
    require(privacy.get("authorized_explicit_resubmit_physical_requests") == 13, "authorized physical request count mismatch")
    accounting = owner.get("request_accounting", {})
    require(accounting.get("submitted_commands_total") == 42, "owner command accounting mismatch")
    require(accounting.get("physical_business_requests") == 29, "owner physical request accounting mismatch")
    require(accounting.get("one_explicit_command_at_most_one_physical_business_request") is True, "one-command/one-request invariant missing")
    require(accounting.get("automatic_retry_observed") is False, "automatic retry observed")
    require(accounting.get("hidden_pagination_observed") is False, "hidden pagination observed")
    require(accounting.get("fan_out_observed") is False, "fan-out observed")

    candidates = list(json_candidates(root))
    step7_path, step7 = find_formal_record(candidates, ("STEP7", "FORMAL_ACCEPTANCE"))
    step8_path, step8 = find_formal_record(candidates, ("STEP8", "FORMAL_ACCEPTANCE"))
    step9_path, step9 = find_formal_record(candidates, ("STEP9", "FORMAL_ACCEPTANCE"))
    release_path, release = find_formal_record(candidates, ("FULL_OZON_READ_COVERAGE_ACCEPTED",))

    require(
        has_numeric_evidence(step7, 245, ("seller", "read"))
        or has_numeric_evidence(step7, 245, ("read", "count")),
        "Step 7 acceptance lacks Seller read count 245",
    )
    require(
        has_numeric_evidence(step8, 48, ("operation",))
        or has_numeric_evidence(step8, 48, ("row",)),
        "Step 8 acceptance lacks Performance operation count 48",
    )
    require(
        has_numeric_evidence(step8, 21, ("read",))
        or has_numeric_evidence(step8, 21, ("current",)),
        "Step 8 acceptance lacks Performance current-read count 21",
    )
    require(
        has_numeric_evidence(step9, 266, ("read",))
        or has_numeric_evidence(step9, 266, ("surface",)),
        "Step 9 acceptance lacks combined read count 266",
    )
    require(
        has_numeric_evidence(step9, 511, ("operation",))
        or has_numeric_evidence(step9, 511, ("universe",)),
        "Step 9 acceptance lacks total universe count 511",
    )

    zip_proof = verify_zip(find_release_zip(root))
    remote_head = canonical_remote_head(root)
    require(remote_head == CANONICAL_HEAD, f"canonical moved: {remote_head}")

    proof = {
        "schema": "OZON_FULL_READ_266_POSTRELEASE_COMPLETION_V1",
        "schema_version": 1,
        "status": "PASS",
        "source_commit": args.source_commit,
        "release_commit": RELEASE_COMMIT,
        "canonical": {"branch": CANONICAL_BRANCH, "expected_head": CANONICAL_HEAD, "actual_head": remote_head, "unchanged": True},
        "formal_chain": {
            "step7": step7_path.relative_to(root).as_posix(),
            "step8": step8_path.relative_to(root).as_posix(),
            "step9": step9_path.relative_to(root).as_posix(),
            "step10_release": release_path.relative_to(root).as_posix(),
        },
        "owner_live_acceptance": {
            "path": OWNER_RECORD.as_posix(),
            "sha256": sha256(owner_path),
            "new_aliases_exercised": 26,
            "privacy_off_zero_requests": True,
            "authorized_13_one_request_each": True,
        },
        "installable": zip_proof,
        "optional_non_blocking_diagnostics": owner.get("non_blocking_followups", []),
        "markers": [
            "OZON_FULL_READ_266_FORMAL_CHAIN_RECONFIRMED_PASS",
            "OZON_FULL_READ_266_OWNER_LIVE_EVIDENCE_PASS",
            "OZON_FULL_READ_266_POSTRELEASE_COMPLETION_PASS",
            "FULL_OZON_READ_COVERAGE_ACCEPTED",
        ],
    }
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    md = f"""# Ozon Bridge v0.1.19 — post-release completion\n\n**Status:** `PASS`\n\n- Formal Step 7: `{proof['formal_chain']['step7']}`\n- Formal Step 8: `{proof['formal_chain']['step8']}`\n- Formal Step 9: `{proof['formal_chain']['step9']}`\n- Final release: `{proof['formal_chain']['step10_release']}`\n- Owner live aliases: `26/26`\n- Personal Data OFF: `13 blocked / 0 provider requests`\n- Explicit authorized resubmit: `13 commands / 13 provider requests`\n- Installable ZIP SHA-256: `{ZIP_SHA256}`\n- Canonical unchanged: `{remote_head}`\n\n```text\nFULL_OZON_READ_COVERAGE_ACCEPTED\n```\n"""
    args.output_md.write_text(md, encoding="utf-8", newline="\n")
    print("OZON_FULL_READ_266_FORMAL_CHAIN_RECONFIRMED_PASS")
    print("OZON_FULL_READ_266_OWNER_LIVE_EVIDENCE_PASS")
    print("OZON_FULL_READ_266_POSTRELEASE_COMPLETION_PASS")
    print("FULL_OZON_READ_COVERAGE_ACCEPTED")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_FULL_READ_266_POSTRELEASE_COMPLETION_FAIL: {exc}", file=sys.stderr)
        raise
