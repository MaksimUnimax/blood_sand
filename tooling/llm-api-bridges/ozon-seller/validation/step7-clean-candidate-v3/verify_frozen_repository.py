#!/usr/bin/env python3
"""Verify a fresh full-gate output against the repository-frozen Step 7 candidate.

The generated read registry contains run provenance in ``source_commit``.
Operational identity is compared after normalizing only that provenance field;
all other registry bytes/values remain fail-closed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

EXPECTED = {
    "tree": "f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974",
    "package": "f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574",
    "package_bytes": 1_146_084,
    "bundle": "b961f7b0b7c080dfa13df197acdfd4e38b69dc3e6ff5141d696828274a242947",
    "registry": "d4aebbee67e67c6bac2ad74d50795b7858175150fbddf4b419c3dca63704583c",
    "contract": "350a47001ecd81d5d8f3fbb236ee6ac765a99b57d69777ca35b139a6d6a4f0e6",
}


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rows(root: Path) -> list[dict[str, Any]]:
    return [
        {"path": p.relative_to(root).as_posix(), "bytes": p.stat().st_size, "sha256": sha(p)}
        for p in sorted((x for x in root.rglob("*") if x.is_file()), key=lambda x: x.relative_to(root).as_posix())
    ]


def tree_hash(root: Path) -> str:
    material = "".join(f"{r['path']}\0{r['sha256']}\n" for r in rows(root)).encode()
    return hashlib.sha256(material).hexdigest()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", type=Path, required=True)
    p.add_argument("--fresh-output", type=Path, required=True)
    p.add_argument("--cross-proof", type=Path, required=True)
    p.add_argument("--source-commit", required=True)
    p.add_argument("--workflow-run-id", type=int, required=True)
    p.add_argument("--output", type=Path, required=True)
    a = p.parse_args()

    repo = a.repo_root.resolve()
    fresh = a.fresh_output.resolve()
    seller = repo / "tooling/llm-api-bridges/ozon-seller"
    frozen_candidate = seller / "dist-step7-candidate"
    frozen_package = seller / "artifacts/OZON_BRIDGE_v0.1.19_STEP7_245_READS_CANDIDATE_2026-08-31.zip"
    fresh_registry = fresh / "generated/OZON_SELLER_EXACT_READ_REGISTRY.json"
    frozen_registry = seller / "inventory/OZON_SELLER_EXACT_READ_REGISTRY.json"
    fresh_contract = fresh / "generated/OZON_STEP7_RUNTIME_TEST_ARTIFACT_2026-08-30.json"
    frozen_contract = seller / "OZON_STEP7_RUNTIME_TEST_ARTIFACT_2026-08-30.json"
    mappings = [
        (fresh / "candidate", frozen_candidate, "candidate"),
        (fresh / "generated/ozon-seller-mcp-nodebundle.js", seller / "dist/ozon-seller-mcp-nodebundle.js", "bundle"),
        (fresh / "package/OZON_BRIDGE_v0.1.19_STEP7_245_READS_CANDIDATE_2026-08-31.zip", frozen_package, "package"),
    ]
    for left, right, label in mappings:
        require(left.exists() and right.exists(), f"missing {label}: {left} / {right}")
        if left.is_dir():
            require(rows(left) == rows(right), f"{label} repository freeze differs")
        else:
            require(left.read_bytes() == right.read_bytes(), f"{label} repository freeze differs")

    def normalize_source_commit(left: Path, right: Path, label: str) -> tuple[dict[str, Any], str, str]:
        require(left.exists() and right.exists(), f"missing {label} repository freeze inputs")
        fresh_json = json.loads(left.read_text(encoding="utf-8"))
        frozen_json = json.loads(right.read_text(encoding="utf-8"))
        fresh_source = fresh_json.pop("source_commit", None)
        frozen_source = frozen_json.pop("source_commit", None)
        require(fresh_source == a.source_commit, f"fresh {label} provenance commit mismatch")
        require(isinstance(frozen_source, str) and len(frozen_source) == 40, f"frozen {label} provenance missing")
        require(fresh_json == frozen_json, f"{label} operational repository freeze differs")
        return fresh_json, fresh_source, frozen_source

    fresh_registry_json, fresh_registry_source, frozen_registry_source = normalize_source_commit(
        fresh_registry, frozen_registry, "registry"
    )
    fresh_contract_json, fresh_contract_source, frozen_contract_source = normalize_source_commit(
        fresh_contract, frozen_contract, "contract"
    )
    require(fresh_registry_json.get("admitted_read_count") == 26, "registry admitted read count mismatch")
    require(len(fresh_contract_json.get("operation_vectors", [])) == 26, "contract runtime operation count mismatch")

    require(tree_hash(frozen_candidate) == EXPECTED["tree"], "candidate tree identity mismatch")
    require(sha(frozen_package) == EXPECTED["package"], "package identity mismatch")
    require(frozen_package.stat().st_size == EXPECTED["package_bytes"], "package size mismatch")
    require(sha(seller / "dist/ozon-seller-mcp-nodebundle.js") == EXPECTED["bundle"], "bundle identity mismatch")
    require(sha(seller / "inventory/OZON_SELLER_EXACT_READ_REGISTRY.json") == EXPECTED["registry"], "registry identity mismatch")
    require(sha(seller / "OZON_STEP7_RUNTIME_TEST_ARTIFACT_2026-08-30.json") == EXPECTED["contract"], "contract identity mismatch")

    for js in sorted(frozen_candidate.rglob("*.js")) + [seller / "dist/ozon-seller-mcp-nodebundle.js"]:
        result = subprocess.run(["node", "--check", str(js)], text=True, capture_output=True)
        require(result.returncode == 0, f"node --check failed: {js}: {result.stderr}")

    semantic = json.loads((fresh / "semantic-proof.json").read_text(encoding="utf-8"))
    require(semantic.get("result") == "PASS", "fresh semantic proof failed")
    require(semantic.get("source_commit") == a.source_commit, "fresh semantic proof commit mismatch")
    require(semantic.get("production", {}).get("candidate_tree_sha256") == EXPECTED["tree"], "fresh semantic tree mismatch")
    require(semantic.get("package", {}).get("zip_sha256") == EXPECTED["package"], "fresh semantic package mismatch")
    require(semantic.get("runtime", {}).get("operation_count") == 26, "fresh runtime operation count mismatch")
    require(semantic.get("runtime", {}).get("physical_business_request_count") == 26, "fresh runtime request count mismatch")
    require(semantic.get("runtime", {}).get("all_one_request") is True, "fresh runtime one-request invariant failed")
    require(semantic.get("privacy", {}).get("denied", {}).get("physical_business_request_count") == 0, "fresh privacy denial leaked")
    require(semantic.get("privacy", {}).get("explicit_resubmit", {}).get("physical_business_request_count") == 13, "fresh privacy resubmit mismatch")
    require(semantic.get("privacy", {}).get("setting_transition", {}).get("replayed_command_count") == 0, "fresh privacy replay")
    require(semantic.get("privacy", {}).get("setting_transition", {}).get("delayed_replayed_command_count") == 0, "fresh delayed privacy replay")
    require(semantic.get("terminal", {}).get("rows") == 463, "fresh terminal matrix row count mismatch")
    require(semantic.get("terminal", {}).get("unknown") == semantic.get("terminal", {}).get("pending") == semantic.get("terminal", {}).get("unresolved") == 0, "fresh terminal matrix unresolved state")

    cross = json.loads(a.cross_proof.read_text(encoding="utf-8"))
    require(cross.get("result") == "PASS" and cross.get("byte_identical") is True, "cross-platform proof failed")
    require(cross.get("source_commit") == a.source_commit, "cross-platform commit mismatch")
    require(cross.get("workflow_run_id") == a.workflow_run_id, "cross-platform run id mismatch")
    require(cross.get("candidate_tree_sha256") == EXPECTED["tree"], "cross-platform tree mismatch")
    require(cross.get("package_sha256") == EXPECTED["package"], "cross-platform package mismatch")

    proof = {
        "schema": "OZON_SELLER_STEP7_CLEAN_REPOSITORY_FREEZE_PROOF_V2",
        "schema_version": 2,
        "status": "PASS",
        "source_commit": a.source_commit,
        "workflow_run_id": a.workflow_run_id,
        "candidate_production_tree_sha256": EXPECTED["tree"],
        "candidate_package_sha256": EXPECTED["package"],
        "fresh_full_gate_matches_repository_frozen_candidate": True,
        "registry_operational_payload_matches_after_source_commit_normalization": True,
        "contract_operational_payload_matches_after_source_commit_normalization": True,
        "fresh_registry_source_commit": fresh_registry_source,
        "frozen_registry_source_commit": frozen_registry_source,
        "fresh_contract_source_commit": fresh_contract_source,
        "frozen_contract_source_commit": frozen_contract_source,
        "fresh_registry_sha256": sha(fresh_registry),
        "frozen_registry_sha256": sha(frozen_registry),
        "fresh_contract_sha256": sha(fresh_contract),
        "frozen_contract_sha256": sha(frozen_contract),
        "linux_windows_byte_identical": True,
        "runtime_operation_count": 26,
        "runtime_physical_business_request_count": 26,
        "personal_data_denied_request_count": 0,
        "personal_data_authorized_request_count": 13,
        "markers": [
            "STEP7_CLEAN_REGISTRY_PROVENANCE_NORMALIZED_PASS",
            "STEP7_CLEAN_CONTRACT_PROVENANCE_NORMALIZED_PASS",
            "STEP7_CLEAN_FRESH_GATE_REPOSITORY_FREEZE_MATCH_PASS",
            "STEP7_CLEAN_REPOSITORY_CANDIDATE_NODE_CHECK_PASS",
            "STEP7_CLEAN_REPOSITORY_FREEZE_PASS"
        ]
    }
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(json.dumps(proof, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    print("STEP7_CLEAN_REGISTRY_PROVENANCE_NORMALIZED_PASS")
    print("STEP7_CLEAN_CONTRACT_PROVENANCE_NORMALIZED_PASS")
    print("STEP7_CLEAN_FRESH_GATE_REPOSITORY_FREEZE_MATCH_PASS")
    print("STEP7_CLEAN_REPOSITORY_CANDIDATE_NODE_CHECK_PASS")
    print("STEP7_CLEAN_REPOSITORY_FREEZE_PASS")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"STEP7_CLEAN_REPOSITORY_FREEZE_FAIL: {exc}", file=sys.stderr)
        raise
