#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

B1_TREE_MANIFEST_SHA256 = "2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740"
B2_TREE_MANIFEST_SHA256 = "3566796bc960530e230e054cbdaf08b8dd3ef826eb6eba756f4a7d436492f32c"
B2_PATCH_SHA256 = "bffc2fc1e1e32f400e89bc3164f582b86a64a7f579af46d231f63baa427dfd63"
EXPECTED_FILE_COUNT = 21
EXPECTED_CHANGED_SHA256 = {
    "shared/ozon_operation_registry.js": "6abe5437515cc757d46038bc09afe19a72a5cd7a6554a3bc8afd35c812a48f40",
    "shared/ozon_contract.js": "fd4f5a6db4a3715e9fb07694054e0329a455b58971a1585c237d1b5e06ca1174",
    "shared/ozon_entitlements.js": "91fd5e0fe6d3a10a88cae8c837b8e90c45010bd4a4da46c2ff0c964f9b8063a5"
}
PROTECTED_B1_SHA256 = {
    "content_script.js": "a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "manifest.json": "f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1",
    "popup.css": "1befabf8a3650dfe01a5980b0d5ff2fcd34666d507baad8e79f3873358d7a726",
    "popup.html": "a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3",
    "popup.js": "9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
    "service_worker.js": "b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87",
    "shared/ai_adapters.js": "5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9",
    "shared/bridge_autorun_model.js": "c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
    "shared/composer_send.js": "3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736",
    "shared/conversation_identity.js": "939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/ozon_credentials.js": "286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d",
    "shared/ozon_guidance.js": "8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "shared/proven_writing_block_capture.js": "5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef",
    "shared/provider_transport_core.js": "7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8",
    "shared/runtime_names.js": "a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59",
    "shared/work_session_model.js": "11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855"
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tree_digest(root: Path) -> str:
    lines = []
    for file in sorted((p for p in root.rglob("*") if p.is_file()), key=lambda p: str(p.relative_to(root)).replace("\\", "/")):
        rel = str(file.relative_to(root)).replace("\\", "/")
        lines.append(f"{rel}\0{sha256(file.read_bytes())}\n")
    return sha256("".join(lines).encode("utf-8"))


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: materialize_patch_b2_prices_listing_state_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    validation = repo / "tooling/llm-api-bridges/ozon-seller/validation"
    b1 = validation / "materialize_patch_b1_assortment_master_candidate.py"
    patch = validation / "PATCH_B2_PRICES_LISTING_STATE_2026-08-26.patch"
    if not b1.is_file():
        raise RuntimeError(f"missing exact B1 materializer: {b1}")
    if not patch.is_file():
        raise RuntimeError(f"missing B2 patch: {patch}")
    patch_bytes = patch.read_bytes()
    if sha256(patch_bytes) != B2_PATCH_SHA256:
        raise RuntimeError("B2 patch identity mismatch")

    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(b1), str(repo), str(out)], check=True)
    if tree_digest(out) != B1_TREE_MANIFEST_SHA256:
        raise RuntimeError("B1 base tree identity mismatch before B2")

    applied = subprocess.run(
        ["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf", "apply", "--no-index", "-"],
        cwd=out,
        input=patch_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if applied.returncode != 0:
        raise RuntimeError(f"B2 patch apply failed:\n{applied.stderr.decode('utf-8', errors='replace')}")

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"B2 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    for rel, expected in EXPECTED_CHANGED_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected:
            raise RuntimeError(f"B2 changed identity mismatch {rel}: {actual} != {expected}")
    for rel, expected in PROTECTED_B1_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected:
            raise RuntimeError(f"B2 protected B1 identity mismatch {rel}: {actual} != {expected}")
    actual_tree = tree_digest(out)
    if actual_tree != B2_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"B2 tree identity {actual_tree} != {B2_TREE_MANIFEST_SHA256}")

    print("PATCH_B2_B1_BASE_IDENTITY_PASS")
    print("PATCH_B2_PATCH_IDENTITY_PASS")
    print("PATCH_B2_PATCH_APPLY_PASS")
    print("PATCH_B2_PRODUCTION_FILE_COUNT_21_PASS")
    print("PATCH_B2_CHANGED_FILE_IDENTITIES_PASS")
    print("PATCH_B2_PROTECTED_B1_IDENTITIES_PASS")
    print("PATCH_B2_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
