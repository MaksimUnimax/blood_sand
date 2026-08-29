#!/usr/bin/env python3
import argparse
import gzip
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

BASE_TREE = "ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e"
FINAL_TREE = "3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce"
EXPECTED_FILES = 21
EXPECTED_JS = 18
EXPECTED_CHANGED_HASHES = {
    "shared/ozon_operation_registry.js": "2b3143632d964e4c10ad29b5a85b36c69698d9bf59521ade92279f88de6ec91f",
    "shared/ozon_contract.js": "4e6f488b707cd1e66f78ccbdb50688d18d430c47b796b1684c1f96e245235920",
    "shared/ozon_entitlements.js": "5f31664e1a0fbb7cada89c0d7673a7720c72ee2ce60fa27a7294ddec9ad30ad3",
    "shared/provider_transport_core.js": "5b8d085a6be3a26a4278aa6ea718656fd66293a72b7957c5e377284c9f6188a7",
}
PROTECTED = {
    "service_worker.js": "a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "content_script.js": "a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "popup.js": "9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tree_digest(root: Path) -> str:
    lines = []
    for file in sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: p.relative_to(root).as_posix()):
        rel = file.relative_to(root).as_posix()
        lines.append(f"{rel}\0{sha(file.read_bytes())}\n")
    return sha("".join(lines).encode())


def check_counts(root: Path, label: str) -> None:
    files = [p for p in root.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILES:
        raise RuntimeError(f"{label}: files {len(files)} != {EXPECTED_FILES}")
    js_count = sum(1 for p in files if p.suffix == ".js")
    if js_count != EXPECTED_JS:
        raise RuntimeError(f"{label}: JS {js_count} != {EXPECTED_JS}")


def check_hashes(root: Path, expected: dict[str, str], label: str) -> None:
    for rel, expected_hash in expected.items():
        path = root / rel
        if not path.is_file():
            raise RuntimeError(f"{label}: missing {rel}")
        actual = sha(path.read_bytes())
        if actual != expected_hash:
            raise RuntimeError(f"{label}: {rel} {actual} != {expected_hash}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", required=True)
    ap.add_argument("--work-root", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    repo = Path(args.repo_root).resolve()
    work = Path(args.work_root).resolve()
    out = Path(args.out).resolve()
    validation = repo / "tooling/llm-api-bridges/ozon-seller/validation"
    base_materializer = validation / "materialize_v2_b1_b49_canonical_salvage_candidate.py"
    patch_path = validation / "PATCH_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_2026-08-29.patch.gz"
    manifest_path = validation / "PATCH_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_2026-08-29_MANIFEST.json"

    if not base_materializer.is_file():
        raise RuntimeError(f"missing Step3 materializer: {base_materializer}")
    if not patch_path.is_file() or not manifest_path.is_file():
        raise RuntimeError("missing Step5 package transport or manifest")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    expected_raw = manifest["raw_patch_sha256"]
    expected_gzip = manifest["gzip_patch_sha256"]
    if manifest.get("base_tree_sha256") != BASE_TREE or manifest.get("final_tree_sha256") != FINAL_TREE:
        raise RuntimeError("Step5 package manifest tree identities mismatch")

    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    base = work / "step3-base"
    subprocess.run([
        sys.executable, str(base_materializer),
        "--repo-root", str(repo),
        "--work-root", str(work / "step3-work"),
        "--out", str(base),
    ], check=True)
    check_counts(base, "Step3 base")
    if tree_digest(base) != BASE_TREE:
        raise RuntimeError("Step3 base tree identity mismatch")
    print("STEP5_PACKAGE_BASE_EXACT_STEP3_TREE_IDENTITY_PASS")

    gz = patch_path.read_bytes()
    if sha(gz) != expected_gzip:
        raise RuntimeError("Step5 package gzip SHA mismatch")
    raw = gzip.decompress(gz)
    if sha(raw) != expected_raw:
        raise RuntimeError("Step5 package raw SHA mismatch")
    print("STEP5_PACKAGE_PATCH_TRANSPORT_IDENTITY_PASS")

    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(base, out)
    applied = subprocess.run(
        ["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf", "apply", "--no-index", "-"],
        cwd=out,
        input=raw,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if applied.returncode != 0:
        raise RuntimeError("Step5 package patch apply failed:\n" + applied.stderr.decode(errors="replace"))
    print("STEP5_PACKAGE_PATCH_APPLY_PASS")

    check_counts(out, "Step5 package")
    check_hashes(out, EXPECTED_CHANGED_HASHES, "Step5 changed")
    check_hashes(out, PROTECTED, "Step5 protected")
    final = tree_digest(out)
    if final != FINAL_TREE:
        raise RuntimeError(f"Step5 package tree {final} != {FINAL_TREE}")
    print("STEP5_PACKAGE_PRODUCTION_FILE_COUNT_21_PASS")
    print("STEP5_PACKAGE_PRODUCTION_JS_COUNT_18_PASS")
    print("STEP5_PACKAGE_CHANGED_FILE_IDENTITIES_PASS")
    print("STEP5_PACKAGE_PROTECTED_IDENTITIES_PASS")
    print("STEP5_PACKAGE_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
