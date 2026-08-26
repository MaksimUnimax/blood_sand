#!/usr/bin/env python3
import argparse
import gzip
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

B5_TREE_MANIFEST_SHA256 = "7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114"
B6_TREE_MANIFEST_SHA256 = "2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57"
B6_PATCH_SHA256 = "2b780f1d4bba1e6b4bf2b2a8d6072163bd534f505c63a2f209b95dc21c4bfd9f"
B6_PATCH_GZIP_SHA256 = "04f4151c035b14698107e3e7a54cf6da3c4f137b7a294db976e8df2d5a9c2ac9"
EXPECTED_FILE_COUNT = 21
EXPECTED_CHANGED_SHA256 = {
    "shared/ozon_operation_registry.js": "d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b",
    "shared/ozon_contract.js": "e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7"
}
PROTECTED_B5_SHA256 = {
    "popup.js": "9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
    "content_script.js": "a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "service_worker.js": "b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87",
    "popup.css": "1befabf8a3650dfe01a5980b0d5ff2fcd34666d507baad8e79f3873358d7a726",
    "popup.html": "a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3",
    "manifest.json": "f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1",
    "shared/ozon_credentials.js": "286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d",
    "shared/runtime_names.js": "a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/proven_writing_block_capture.js": "5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "shared/provider_transport_core.js": "7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8",
    "shared/ai_adapters.js": "5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9",
    "shared/composer_send.js": "3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736",
    "shared/bridge_autorun_model.js": "c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
    "shared/work_session_model.js": "11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855",
    "shared/conversation_identity.js": "939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57",
    "shared/ozon_guidance.js": "8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508",
    "shared/ozon_entitlements.js": "e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0"
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
    if sha256(compressed) != B6_PATCH_GZIP_SHA256:
        raise RuntimeError("B6 patch gzip identity mismatch")
    try:
        patch = gzip.decompress(compressed)
    except Exception as exc:
        raise RuntimeError(f"B6 patch gzip decode failed: {exc}") from exc
    if sha256(patch) != B6_PATCH_SHA256:
        raise RuntimeError("B6 reconstructed patch identity mismatch")
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
    b5 = validation / "materialize_patch_b5_finance_realization_candidate.py"
    patch_gzip = validation / "PATCH_B6_PERFORMANCE_READ_CORE_2026-08-26.patch.gz"
    if not b5.is_file():
        raise RuntimeError(f"missing exact B5 materializer: {b5}")
    if not patch_gzip.is_file():
        raise RuntimeError(f"missing B6 patch gzip: {patch_gzip}")
    patch_bytes = reconstruct_patch(patch_gzip)

    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    b5_work = work / "b5-work"
    b5_out = work / "b5-base"
    subprocess.run([
        sys.executable, str(b5),
        "--repo-root", str(repo),
        "--work-root", str(b5_work),
        "--out", str(b5_out)
    ], check=True)
    if tree_digest(b5_out) != B5_TREE_MANIFEST_SHA256:
        raise RuntimeError("B5 base tree identity mismatch before B6")

    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(b5_out, out)
    applied = subprocess.run(
        ["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf", "apply", "--no-index", "-"],
        cwd=out,
        input=patch_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if applied.returncode != 0:
        raise RuntimeError(f"B6 patch apply failed:\n{applied.stderr.decode('utf-8', errors='replace')}")

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"B6 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    for rel, expected in EXPECTED_CHANGED_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected:
            raise RuntimeError(f"B6 changed identity mismatch {rel}: {actual} != {expected}")
    for rel, expected in PROTECTED_B5_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected:
            raise RuntimeError(f"B6 protected B5 identity mismatch {rel}: {actual} != {expected}")
    actual_tree = tree_digest(out)
    if actual_tree != B6_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"B6 tree identity {actual_tree} != {B6_TREE_MANIFEST_SHA256}")

    print("PATCH_B6_B5_BASE_IDENTITY_PASS")
    print("PATCH_B6_PATCH_TRANSPORT_IDENTITY_PASS")
    print("PATCH_B6_PATCH_APPLY_PASS")
    print("PATCH_B6_PRODUCTION_FILE_COUNT_21_PASS")
    print("PATCH_B6_CHANGED_FILE_IDENTITIES_PASS")
    print("PATCH_B6_PROTECTED_B5_IDENTITIES_PASS")
    print("PATCH_B6_TREE_MANIFEST_SHA256_PASS")
    print(str(out))

if __name__ == "__main__":
    main()
