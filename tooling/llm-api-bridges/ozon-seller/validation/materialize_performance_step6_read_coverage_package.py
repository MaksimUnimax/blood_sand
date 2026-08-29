#!/usr/bin/env python3
import argparse
import base64
import gzip
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

BASE_TREE = "3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce"
FINAL_TREE = "1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f"
EXPECTED_FILES = 21
EXPECTED_JS = 18
EXPECTED_CHANGED = {
    "shared/ozon_operation_registry.js": "0909734578868978132720f1df6f3d79341bb32ac7432b6ea7ff76e6e47ebeae",
    "shared/ozon_contract.js": "05c0d2ac2e074de861c219e029f24cc9407163ca7868e31a159ea6e65771cd22",
    "shared/provider_transport_core.js": "fc104e5d0bd6ea836c066f8144f642c0666c0e270cbdbf8c3b1ec3a25071969e",
}
EXPECTED_PROTECTED = {
    "shared/ozon_entitlements.js": "5f31664e1a0fbb7cada89c0d7673a7720c72ee2ce60fa27a7294ddec9ad30ad3",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "service_worker.js": "a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3",
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
    js_count = sum(1 for p in files if p.suffix == ".js")
    if len(files) != EXPECTED_FILES or js_count != EXPECTED_JS:
        raise RuntimeError(f"{label}: production shape {len(files)} files / {js_count} JS != {EXPECTED_FILES}/{EXPECTED_JS}")


def check_hashes(root: Path, expected: dict[str, str], label: str) -> None:
    for rel, expected_hash in expected.items():
        file = root / rel
        if not file.is_file():
            raise RuntimeError(f"{label}: missing {rel}")
        actual = sha(file.read_bytes())
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
    step5_materializer = validation / "materialize_v2_step5_workflow_report_document_package.py"
    manifest_path = validation / "PATCH_PERFORMANCE_STEP6_READ_COVERAGE_2026-08-29_MANIFEST.json"
    if not step5_materializer.is_file() or not manifest_path.is_file():
        raise RuntimeError("missing accepted Step5 materializer or Step6 manifest")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schema") != "OZON_PERFORMANCE_STEP6_READ_COVERAGE_PATCH_PACKAGE_V1":
        raise RuntimeError("unexpected Step6 package schema")
    if manifest["base"]["production_tree_sha256"] != BASE_TREE:
        raise RuntimeError("Step6 manifest base tree mismatch")
    if manifest["candidate"]["production_tree_sha256"] != FINAL_TREE:
        raise RuntimeError("Step6 manifest candidate tree mismatch")
    if manifest["candidate"]["production_files"] != EXPECTED_FILES or manifest["candidate"]["javascript_files"] != EXPECTED_JS:
        raise RuntimeError("Step6 manifest production shape mismatch")
    if manifest["changed_production_files"] != EXPECTED_CHANGED:
        raise RuntimeError("Step6 manifest changed-file identities mismatch")
    if manifest["protected_production_files"] != EXPECTED_PROTECTED:
        raise RuntimeError("Step6 manifest protected-file identities mismatch")

    transport = manifest["transport"]
    transport_path = validation / transport["file"]
    disk_b64 = transport_path.read_bytes()
    # Git may materialize this text-only base64 carrier with CRLF on Windows.
    # The package identity is the canonical repository LF representation; the
    # decoded gzip and raw patch remain byte-exact on every platform.
    b64 = disk_b64.replace(b"\r\n", b"\n")
    if b"\r" in b64:
        raise RuntimeError("Step6 base64 transport contains unsupported carriage returns")
    if len(b64) != transport["base64_text_bytes"] or sha(b64) != transport["base64_text_sha256"]:
        raise RuntimeError("Step6 canonical base64 transport identity mismatch")
    print("PERFORMANCE_STEP6_PACKAGE_CANONICAL_BASE64_TRANSPORT_IDENTITY_PASS")

    try:
        gz = base64.b64decode(b64.strip(), validate=True)
    except Exception as exc:
        raise RuntimeError("Step6 base64 transport decode failed") from exc
    if len(gz) != transport["decoded_gzip_bytes"] or sha(gz) != transport["decoded_gzip_sha256"]:
        raise RuntimeError("Step6 gzip transport identity mismatch")
    print("PERFORMANCE_STEP6_PACKAGE_GZIP_TRANSPORT_IDENTITY_PASS")

    raw = gzip.decompress(gz)
    if len(raw) != transport["raw_patch_bytes"] or sha(raw) != transport["raw_patch_sha256"]:
        raise RuntimeError("Step6 raw patch identity mismatch")
    print("PERFORMANCE_STEP6_PACKAGE_RAW_PATCH_IDENTITY_PASS")

    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    base = work / "step5-base"
    subprocess.run([
        sys.executable, str(step5_materializer),
        "--repo-root", str(repo),
        "--work-root", str(work / "step5-work"),
        "--out", str(base),
    ], check=True)
    check_counts(base, "accepted Step5 base")
    if tree_digest(base) != BASE_TREE:
        raise RuntimeError("accepted Step5 base tree identity mismatch")
    print("PERFORMANCE_STEP6_PACKAGE_BASE_EXACT_STEP5_TREE_IDENTITY_PASS")

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
        raise RuntimeError("Step6 patch apply failed:\n" + applied.stderr.decode(errors="replace"))
    print("PERFORMANCE_STEP6_PACKAGE_PATCH_APPLY_PASS")

    check_counts(out, "Performance Step6 candidate")
    check_hashes(out, EXPECTED_CHANGED, "Performance Step6 changed")
    check_hashes(out, EXPECTED_PROTECTED, "Performance Step6 protected")
    if tree_digest(out) != FINAL_TREE:
        raise RuntimeError("Performance Step6 final tree identity mismatch")
    print("PERFORMANCE_STEP6_PACKAGE_PRODUCTION_FILE_COUNT_21_PASS")
    print("PERFORMANCE_STEP6_PACKAGE_PRODUCTION_JS_COUNT_18_PASS")
    print("PERFORMANCE_STEP6_PACKAGE_CHANGED_FILE_IDENTITIES_PASS")
    print("PERFORMANCE_STEP6_PACKAGE_PROTECTED_FILE_IDENTITIES_PASS")
    print("PERFORMANCE_STEP6_PACKAGE_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
