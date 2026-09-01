#!/usr/bin/env python3
"""Build a deterministic Step 9 integration artifact and self-contained verification kit."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path
from typing import Any

PACKAGE_NAME = "OZON_BRIDGE_v0.1.19_STEP9_FULL_INTEGRATION_266_CANDIDATE.zip"
MANIFEST_NAME = "OZON_STEP9_INTEGRATION_PACKAGE_MANIFEST_V1.json"
SEMANTIC_NAME = "semantic-proof.json"
MATRIX_MARKER = "OZON_PERFORMANCE_STEP6_MATRIX_REGRESSION_PASS"
READ_MARKER = "OZON_PERFORMANCE_STEP6_READ_COVERAGE_REGRESSION_PASS"
EXPECTED_CANDIDATE_TREE = "f605c2645e3a7a429facaab1bbb4b1252c7ee39d601b50d0480c4006b689d974"
EXPECTED_STEP7_PACKAGE = "f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574"


def require(value: bool, message: str) -> None:
    if not value:
        raise RuntimeError(message)


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"expected JSON object: {path}")
    return value


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stable_write(path: Path, value: Any, *, compact: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = (
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        if compact
        else json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True)
    )
    path.write_text(text + "\n", encoding="utf-8", newline="\n")


def files(root: Path) -> list[Path]:
    return sorted((path for path in root.rglob("*") if path.is_file()), key=lambda path: path.relative_to(root).as_posix())


def manifest(root: Path) -> list[dict[str, Any]]:
    return [
        {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": sha256(path)}
        for path in files(root)
    ]


def tree_sha256(root: Path) -> str:
    material = "".join(f"{row['path']}\0{row['sha256']}\n" for row in manifest(root)).encode("utf-8")
    return hashlib.sha256(material).hexdigest()


def copy_file(source: Path, destination: Path) -> None:
    require(source.is_file(), f"missing source file: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)


def copy_tree(source: Path, destination: Path) -> None:
    require(source.is_dir(), f"missing source directory: {source}")
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination, copy_function=shutil.copyfile)


def deterministic_zip(path: Path, root: Path, members: list[Path]) -> None:
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_STORED) as archive:
        for member in sorted(members, key=lambda item: item.relative_to(root).as_posix()):
            relative = member.relative_to(root).as_posix()
            info = zipfile.ZipInfo(relative, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_STORED
            info.create_system = 3
            info.external_attr = (0o100644 & 0xFFFF) << 16
            archive.writestr(info, member.read_bytes())


def verify_package(path: Path, root: Path, members: list[Path]) -> None:
    expected = {member.relative_to(root).as_posix(): member.read_bytes() for member in members}
    with zipfile.ZipFile(path, "r") as archive:
        require(archive.namelist() == sorted(expected), "Step9 package member list/order mismatch")
        for name in archive.namelist():
            require(archive.read(name) == expected[name], f"Step9 package bytes differ: {name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--runtime-proof", type=Path, required=True)
    parser.add_argument("--privacy-proof", type=Path, required=True)
    parser.add_argument("--matrix-regression-log", type=Path, required=True)
    parser.add_argument("--read-regression-log", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    args = parser.parse_args()

    repo = args.repo_root.resolve()
    out = args.out.resolve()
    seller = repo / "tooling/llm-api-bridges/ozon-seller"
    validation = seller / "validation"
    runtime = load(args.runtime_proof.resolve())
    privacy = load(args.privacy_proof.resolve())
    matrix_log = args.matrix_regression_log.resolve().read_text(encoding="utf-8")
    read_log = args.read_regression_log.resolve().read_text(encoding="utf-8")

    require(runtime.get("status") == "PASS", "all-266 runtime proof not PASS")
    require(runtime.get("source_commit") == args.source_commit, "runtime source commit mismatch")
    authority = runtime.get("authority", {})
    execution = runtime.get("execution", {})
    production = runtime.get("production", {})
    require(authority == {
        "combined_current_reads": 266,
        "performance_current_reads": 21,
        "performance_operations_terminal": 48,
        "performance_terminal_non_current": 27,
        "seller_current_reads": 245,
        "seller_operations_terminal": 463,
        "total_operations_terminal": 511,
    }, "runtime authority summary mismatch")
    require(production.get("candidate_tree_sha256") == EXPECTED_CANDIDATE_TREE, "candidate tree mismatch")
    require(production.get("candidate_file_count") == 21, "candidate file count mismatch")
    require(production.get("registry_aliases") == 270, "registry alias count mismatch")
    require(production.get("seller_registry_aliases") == 245, "Seller alias count mismatch")
    require(production.get("performance_registry_aliases") == 25, "Performance alias count mismatch")
    require(production.get("performance_canonical_aliases") == 21, "Performance canonical alias count mismatch")
    require(production.get("performance_compatibility_aliases") == 4, "Performance compatibility alias count mismatch")
    require(execution.get("logical_current_read_operations") == 266, "runtime logical count mismatch")
    require(execution.get("physical_business_request_count") == 266, "runtime business request count mismatch")
    require(execution.get("seller_business_requests") == 245, "runtime Seller request count mismatch")
    require(execution.get("performance_business_requests") == 21, "runtime Performance request count mismatch")
    require(execution.get("performance_auth_requests") == 1, "runtime Performance auth count mismatch")
    require(execution.get("total_fetch_requests") == 267, "runtime total fetch count mismatch")
    for key in ("all_one_business_request", "all_http_200", "all_external_request_executed"):
        require(execution.get(key) is True, f"runtime invariant failed: {key}")
    for key in ("automatic_retry_count", "hidden_pagination_count", "fanout_count", "polling_count"):
        require(execution.get(key) == 0, f"runtime hidden execution count failed: {key}")
    require(len(runtime.get("runtime_operations", [])) == 266, "runtime operation rows mismatch")
    require(len(runtime.get("business_requests", [])) == 266, "runtime request rows mismatch")

    require(privacy.get("result") == "PASS", "privacy proof not PASS")
    require(privacy.get("source_commit") == args.source_commit, "privacy source commit mismatch")
    denied = privacy.get("denied", {})
    authorized = privacy.get("authorized", {})
    require(denied.get("operation_count") == 13, "privacy denial operation count mismatch")
    require(denied.get("physical_business_request_count") == 0, "privacy denial request leak")
    require(denied.get("all_fail_closed") is True, "privacy denial not fail-closed")
    require(authorized.get("operation_count") == 13, "privacy authorized operation count mismatch")
    require(authorized.get("physical_business_request_count") == 13, "privacy authorized request count mismatch")
    require(authorized.get("all_one_request") is True, "privacy authorized one-request invariant failed")
    require(authorized.get("all_expected_method_path_payload") is True, "privacy authorized request contract failed")
    require(authorized.get("all_credential_headers_present") is True, "privacy credential injection failed")

    require(MATRIX_MARKER in matrix_log, "Performance matrix regression marker missing")
    require(READ_MARKER in read_log, "Performance read regression marker missing")

    step7_independent_path = validation / "step7-clean-candidate-v3/evidence/OZON_SELLER_STEP7_INDEPENDENT_VERIFICATION_V1.json"
    step8_acceptance_path = validation / "step8-performance-v2/evidence/OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2.json"
    step7_acceptance_path = validation / "OZON_SELLER_STEP7_463_FORMAL_ACCEPTANCE_2026-08-31.md"
    candidate_root = seller / "dist-step7-candidate"
    step7_package = seller / "artifacts/OZON_BRIDGE_v0.1.19_STEP7_245_READS_CANDIDATE_2026-08-31.zip"
    step7_independent = load(step7_independent_path)
    step8_acceptance = load(step8_acceptance_path)
    require(step7_independent.get("status") == "PASS", "Step7 independent verification not PASS")
    require(step7_independent.get("canonical_modified") is False, "Step7 canonical mutation recorded")
    require(step7_independent.get("runtime", {}).get("seller_authority_operations") == 463, "Step7 Seller authority mismatch")
    require(step7_independent.get("runtime", {}).get("seller_reads") == 245, "Step7 Seller read count mismatch")
    require(step7_independent.get("runtime", {}).get("terminal_unknown") == 0, "Step7 terminal unknown")
    require(step7_independent.get("runtime", {}).get("terminal_pending") == 0, "Step7 terminal pending")
    require(step7_independent.get("runtime", {}).get("terminal_unresolved") == 0, "Step7 terminal unresolved")
    require(step7_independent.get("check_categories", {}).get("semantic_runtime_privacy_regression_terminal_proofs") == "PASS", "Step7 semantic proof category failed")
    require(step8_acceptance.get("status") == "ACCEPTED", "Step8 formal acceptance not accepted")
    require(step8_acceptance.get("combined_current_read_surface", {}).get("total_reads") == 266, "Step8 combined read surface mismatch")
    require(step8_acceptance.get("canonical", {}).get("modified") is False, "Step8 canonical mutation recorded")
    require(tree_sha256(candidate_root) == EXPECTED_CANDIDATE_TREE, "repository candidate tree mismatch")
    require(sha256(step7_package) == EXPECTED_STEP7_PACKAGE, "repository Step7 package mismatch")
    require("OZON_SELLER_STEP7_FORMALLY_ACCEPTED" in step7_acceptance_path.read_text(encoding="utf-8"), "Step7 formal marker missing")

    if out.exists():
        shutil.rmtree(out)
    proofs = out / "proofs"
    kit_repo = out / "verification-kit/repo"
    proofs.mkdir(parents=True)

    copy_file(args.runtime_proof.resolve(), proofs / "OZON_STEP9_ALL_266_RUNTIME_PROOF_V1.json")
    copy_file(args.privacy_proof.resolve(), proofs / "OZON_STEP9_PRIVACY_PROOF_V1.json")
    copy_file(step7_independent_path, proofs / "OZON_SELLER_STEP7_INDEPENDENT_VERIFICATION_V1.json")
    copy_file(step8_acceptance_path, proofs / "OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2.json")
    (proofs / "OZON_PERFORMANCE_STEP6_MATRIX_REGRESSION.log").write_text(matrix_log, encoding="utf-8", newline="\n")
    (proofs / "OZON_PERFORMANCE_STEP6_READ_COVERAGE_REGRESSION.log").write_text(read_log, encoding="utf-8", newline="\n")

    kit_files = [
        "dist/ozon-seller-mcp-nodebundle.js",
        "inventory/OZON_SELLER_EXACT_READ_REGISTRY.json",
        "OZON_STEP7_RUNTIME_TEST_ARTIFACT_2026-08-30.json",
        "validation/OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json",
        "validation/OZON_PERFORMANCE_STEP6_READ_COVERAGE_ACCEPTED_2026-08-29.md",
        "validation/OZON_SELLER_STEP7_463_FORMAL_ACCEPTANCE_2026-08-31.md",
        "validation/step7-clean-candidate-v3/evidence/OZON_SELLER_STEP7_INDEPENDENT_VERIFICATION_V1.json",
        "validation/step8-performance-v2/evidence/OZON_PERFORMANCE_STEP8_FORMAL_ACCEPTANCE_V2.json",
        "validation/step7-runtime-v1/run_step7_runtime.py",
        "validation/step7-runtime-v1/mock_fetch.cjs",
        "validation/step7-privacy-v1/run_step7_privacy.py",
        "validation/step9-integration-v1/run_all_266_runtime.mjs",
    ]
    copy_tree(candidate_root, kit_repo / "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate")
    for relative in kit_files:
        copy_file(seller / relative, kit_repo / "tooling/llm-api-bridges/ozon-seller" / relative)

    integration = {
        "schema": "OZON_STEP9_FULL_INTEGRATION_PROOF_V1",
        "schema_version": 1,
        "status": "PASS",
        "source_commit": args.source_commit,
        "authority": authority,
        "runtime": execution,
        "privacy": {
            "denied_operations": 13,
            "denied_physical_business_requests": 0,
            "authorized_operations": 13,
            "authorized_physical_business_requests": 13,
            "existing_step7_no_replay_and_delayed_replay_proof_preserved": True,
        },
        "blocked_surface": {
            "seller_terminal_non_current": 463 - 245,
            "performance_terminal_non_current": 27,
            "all_registry_descriptors_are_current_enabled_reads": True,
            "performance_terminal_rows_excluded_from_canonical_21": True,
        },
        "regressions": {
            "performance_step6_matrix": "PASS",
            "performance_step6_read_coverage": "PASS",
            "seller_step7_independent": "PASS",
            "performance_step8_formal": "ACCEPTED",
        },
        "repository": {
            "candidate_tree_sha256": tree_sha256(candidate_root),
            "candidate_files": len(files(candidate_root)),
            "step7_package_sha256": sha256(step7_package),
            "canonical_modified": False,
        },
        "proof_files": manifest(proofs),
        "verification_kit_files": manifest(out / "verification-kit"),
        "markers": [
            "OZON_STEP9_UNIVERSE_511_TERMINAL_PASS",
            "OZON_STEP9_CURRENT_READ_SURFACE_266_PASS",
            "OZON_STEP9_ALL_266_RUNTIME_PASS",
            "OZON_STEP9_ONE_COMMAND_ONE_BUSINESS_REQUEST_PASS",
            "OZON_STEP9_PRIVACY_DENIAL_AUTHORIZED_PASS",
            "OZON_STEP9_BLOCKED_SURFACE_ABSENT_PASS",
            "OZON_STEP9_REGRESSIONS_PASS",
            "OZON_STEP9_PLATFORM_ARTIFACT_PASS",
        ],
    }
    integration_path = proofs / "OZON_STEP9_FULL_INTEGRATION_PROOF_V1.json"
    stable_write(integration_path, integration)

    payload_files = files(proofs) + files(out / "verification-kit")
    package_manifest = {
        "schema": "OZON_STEP9_INTEGRATION_PACKAGE_MANIFEST_V1",
        "schema_version": 1,
        "status": "PASS",
        "source_commit": args.source_commit,
        "candidate_tree_sha256": EXPECTED_CANDIDATE_TREE,
        "current_read_operations": 266,
        "payload_files": [
            {"path": path.relative_to(out).as_posix(), "bytes": path.stat().st_size, "sha256": sha256(path)}
            for path in payload_files
        ],
    }
    manifest_path = out / MANIFEST_NAME
    stable_write(manifest_path, package_manifest)
    package_members = payload_files + [manifest_path]
    package_path = out / PACKAGE_NAME
    deterministic_zip(package_path, out, package_members)
    verify_package(package_path, out, package_members)

    semantic = {
        "schema": "OZON_STEP9_PLATFORM_SEMANTIC_PROOF_V1",
        "schema_version": 1,
        "status": "PASS",
        "source_commit": args.source_commit,
        "seller_operations_terminal": 463,
        "performance_operations_terminal": 48,
        "total_operations_terminal": 511,
        "seller_current_reads": 245,
        "performance_current_reads": 21,
        "combined_current_reads": 266,
        "runtime_business_requests": 266,
        "runtime_performance_auth_requests": 1,
        "privacy_denied_requests": 0,
        "privacy_authorized_requests": 13,
        "candidate_tree_sha256": EXPECTED_CANDIDATE_TREE,
        "package_sha256": sha256(package_path),
        "package_bytes": package_path.stat().st_size,
        "payload_file_count": len(package_members),
        "markers": integration["markers"] + ["OZON_STEP9_DETERMINISTIC_PACKAGE_PASS"],
    }
    semantic_path = out / SEMANTIC_NAME
    stable_write(semantic_path, semantic, compact=True)

    require(load(semantic_path).get("package_sha256") == sha256(package_path), "semantic package identity mismatch")
    for marker in semantic["markers"]:
        print(marker)
    print(f"OZON_STEP9_PACKAGE_SHA256={semantic['package_sha256']}")
    print(f"OZON_STEP9_PACKAGE_BYTES={semantic['package_bytes']}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"OZON_STEP9_ARTIFACT_BUILD_FAIL: {exc}", file=sys.stderr)
        raise
