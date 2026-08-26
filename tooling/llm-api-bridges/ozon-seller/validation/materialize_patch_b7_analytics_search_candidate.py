#!/usr/bin/env python3
import argparse
import gzip
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

B6_TREE_MANIFEST_SHA256 = "2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57"
B7_TREE_MANIFEST_SHA256 = "dbac8600c41367ad7ba270f5391b48e11e2244c1d8fa0d1018baa712c0d0627c"
B7_PATCH_SHA256 = "4c1de93a97938f9541936cd1edf8060a21b93acf19b296f16cf81a4994cfeac4"
B7_PATCH_GZIP_SHA256 = "a3d88d1be345254aa99522f148c01907111bbd3d87463b22d632f5ea0f15fb3a"
EXPECTED_FILE_COUNT = 21
EXPECTED_CHANGED_SHA256 = {
    "shared/ozon_entitlements.js": "c22377e2224564646ca29637491e9cb719a466adee68d1ca2bebf0a80b3c7530"
}
PROTECTED_B6_SHA256 = {
    "shared/ozon_operation_registry.js": "d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b",
    "shared/ozon_contract.js": "e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7",
    "content_script.js": "a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "service_worker.js": "b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87",
    "shared/bridge_autorun_model.js": "c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
    "shared/work_session_model.js": "11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "shared/provider_transport_core.js": "7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e"
}

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def tree_digest(root: Path) -> str:
    lines = []
    for file in sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: str(p.relative_to(root)).replace("\\", "/")):
        rel = str(file.relative_to(root)).replace("\\", "/")
        lines.append(f"{rel}\0{sha256(file.read_bytes())}\n")
    return sha256("".join(lines).encode("utf-8"))

def reconstruct_patch(patch_gzip: Path) -> bytes:
    compressed = patch_gzip.read_bytes()
    if sha256(compressed) != B7_PATCH_GZIP_SHA256:
        raise RuntimeError("B7 patch gzip identity mismatch")
    patch = gzip.decompress(compressed)
    if sha256(patch) != B7_PATCH_SHA256:
        raise RuntimeError("B7 reconstructed patch identity mismatch")
    return patch

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--work-root", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    repo = Path(args.repo_root).resolve()
    work = Path(args.work_root).resolve()
    out = Path(args.out).resolve()
    validation = repo / "tooling/llm-api-bridges/ozon-seller/validation"
    b6 = validation / "materialize_patch_b6_performance_read_core_candidate.py"
    patch_gzip = validation / "PATCH_B7_ANALYTICS_SEARCH_2026-08-26.patch.gz"
    if not b6.is_file(): raise RuntimeError(f"missing exact B6 materializer: {b6}")
    if not patch_gzip.is_file(): raise RuntimeError(f"missing B7 patch gzip: {patch_gzip}")
    patch_bytes = reconstruct_patch(patch_gzip)

    if work.exists(): shutil.rmtree(work)
    work.mkdir(parents=True)
    b6_work = work / "b6-work"
    b6_out = work / "b6-base"
    subprocess.run([sys.executable, str(b6), "--repo-root", str(repo), "--work-root", str(b6_work), "--out", str(b6_out)], check=True)
    if tree_digest(b6_out) != B6_TREE_MANIFEST_SHA256: raise RuntimeError("B6 base tree identity mismatch before B7")

    if out.exists(): shutil.rmtree(out)
    shutil.copytree(b6_out, out)
    applied = subprocess.run(["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf", "apply", "--no-index", "-"], cwd=out, input=patch_bytes, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if applied.returncode != 0: raise RuntimeError(f"B7 patch apply failed:\n{applied.stderr.decode('utf-8', errors='replace')}")

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT: raise RuntimeError(f"B7 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    for rel, expected in EXPECTED_CHANGED_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected: raise RuntimeError(f"B7 changed identity mismatch {rel}: {actual} != {expected}")
    for rel, expected in PROTECTED_B6_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected: raise RuntimeError(f"B7 protected B6 identity mismatch {rel}: {actual} != {expected}")
    actual_tree = tree_digest(out)
    if actual_tree != B7_TREE_MANIFEST_SHA256: raise RuntimeError(f"B7 tree identity {actual_tree} != {B7_TREE_MANIFEST_SHA256}")

    print("PATCH_B7_B6_BASE_IDENTITY_PASS")
    print("PATCH_B7_PATCH_TRANSPORT_IDENTITY_PASS")
    print("PATCH_B7_PATCH_APPLY_PASS")
    print("PATCH_B7_PRODUCTION_FILE_COUNT_21_PASS")
    print("PATCH_B7_CHANGED_FILE_IDENTITY_PASS")
    print("PATCH_B7_PROTECTED_B6_IDENTITIES_PASS")
    print("PATCH_B7_TREE_MANIFEST_SHA256_PASS")
    print(str(out))

if __name__ == "__main__": main()
