#!/usr/bin/env python3
import argparse
import gzip
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

BASE_TREE = "c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f"
FINAL_TREE = "ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e"
RAW_SHA = "6f81a335f13b1a2a673763588e8aca85b1284598ccd6e267ca14beecca02d0bc"
GZ_SHA = "363724a309deb6a03b04c53131108d985e02863f42ada158d0129acd4e8c6c4b"
EXPECTED_FILES = 21
EXPECTED_JS = 18
BASE_HASHES = {
    "shared/ozon_operation_registry.js": "5c957a8766e42df8863dd8320fe48c476a92c3fca9abc28c92c7f28e1d694ed6",
    "shared/ozon_contract.js": "b48e23ebb0c4ed9d38022500600d2c31c8deb93750b2138f5876ac4087013af2",
    "shared/ozon_entitlements.js": "e3d6aab926840bb36c6be058bd7550bef0549a2924f4ad6b0c93c6f8e4b6eb2c",
    "service_worker.js": "a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3",
}
FINAL_HASHES = {
    "shared/ozon_operation_registry.js": "e2fb7e8437a34ffa345825ee4cac9547cbcdfd3f14bb3b42289d9a57f5eb9cdb",
    "shared/ozon_contract.js": "18dde6b56894bcd3d7f3ad3a597d4f7f3dc16d0464ba4078f6122aecf32699c4",
    "shared/ozon_entitlements.js": "ff53866ce2b2c33a1e270d9c50371641a55bac63d4d02b79f5f3d8fcd1b890f8",
    "service_worker.js": "a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3",
}
PROTECTED = {
    "content_script.js": "a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "popup.js": "9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
    "shared/bridge_autorun_model.js": "c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
    "shared/work_session_model.js": "11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "shared/provider_transport_core.js": "7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/ozon_guidance.js": "8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508",
    "shared/runtime_names.js": "a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tree_digest(root: Path) -> str:
    lines = []
    for file in sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: p.relative_to(root).as_posix()):
        rel = file.relative_to(root).as_posix()
        lines.append(f"{rel}\0{sha(file.read_bytes())}\n")
    return sha("".join(lines).encode())


def check_hashes(root: Path, expected: dict[str, str], label: str) -> None:
    for rel, expected_hash in expected.items():
        file = root / rel
        if not file.is_file():
            raise RuntimeError(f"{label}: missing {rel}")
        actual = sha(file.read_bytes())
        if actual != expected_hash:
            raise RuntimeError(f"{label}: {rel} {actual} != {expected_hash}")


def check_counts(root: Path, label: str) -> None:
    files = [p for p in root.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILES:
        raise RuntimeError(f"{label}: files {len(files)} != {EXPECTED_FILES}")
    js_count = sum(1 for p in files if p.suffix == ".js")
    if js_count != EXPECTED_JS:
        raise RuntimeError(f"{label}: JS files {js_count} != {EXPECTED_JS}")


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
    base_materializer = validation / "materialize_patch_v2_b1_stocks_warehouse_candidate.py"
    patch = validation / "PATCH_V2_B1_B49_CANONICAL_SALVAGE_2026-08-29.patch.gz"
    if not base_materializer.is_file():
        raise RuntimeError(f"missing corrected B1 materializer: {base_materializer}")
    if not patch.is_file():
        raise RuntimeError(f"missing canonical salvage patch transport: {patch}")

    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    base = work / "corrected-b1-base"
    subprocess.run(
        [sys.executable, str(base_materializer), "--repo-root", str(repo), "--work-root", str(work / "b1-work"), "--out", str(base)],
        check=True,
    )
    check_counts(base, "corrected B1")
    if tree_digest(base) != BASE_TREE:
        raise RuntimeError("corrected B1 tree identity mismatch")
    check_hashes(base, BASE_HASHES, "corrected B1")
    check_hashes(base, PROTECTED, "corrected B1 protected")
    print("V2_B1_B49_PACKAGE_BASE_CORRECTED_B1_IDENTITY_PASS")

    gz = patch.read_bytes()
    if sha(gz) != GZ_SHA:
        raise RuntimeError("canonical salvage gzip identity mismatch")
    raw = gzip.decompress(gz)
    if sha(raw) != RAW_SHA:
        raise RuntimeError("canonical salvage raw patch identity mismatch")
    print("V2_B1_B49_PACKAGE_PATCH_TRANSPORT_IDENTITY_PASS")

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
        raise RuntimeError("canonical salvage patch apply failed:\n" + applied.stderr.decode(errors="replace"))
    print("V2_B1_B49_PACKAGE_PATCH_APPLY_PASS")

    check_counts(out, "canonical salvage")
    check_hashes(out, FINAL_HASHES, "canonical salvage changed")
    check_hashes(out, PROTECTED, "canonical salvage protected")
    digest = tree_digest(out)
    if digest != FINAL_TREE:
        raise RuntimeError(f"canonical salvage tree {digest} != {FINAL_TREE}")
    print("V2_B1_B49_PACKAGE_PRODUCTION_FILE_COUNT_21_PASS")
    print("V2_B1_B49_PACKAGE_PRODUCTION_JS_COUNT_18_PASS")
    print("V2_B1_B49_PACKAGE_CHANGED_FILE_IDENTITIES_PASS")
    print("V2_B1_B49_PACKAGE_PROTECTED_IDENTITIES_PASS")
    print("V2_B1_B49_PACKAGE_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
