#!/usr/bin/env python3
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

B0_TREE_MANIFEST_SHA256 = "d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe"
B1_TREE_MANIFEST_SHA256 = "2a0ec020c5ab02dc771ea909cf70f9b0e7981a992c7b458da80761cf9feac740"
B1_PATCH_SHA256 = "b5d5cec8a4c72b74374c41704b219dadfaf98001d0e2f3ca8734311fe1e08a41"
EXPECTED_FILE_COUNT = 21
EXPECTED_CHANGED_SHA256 = {
    "shared/ozon_operation_registry.js": "286f7746a3c45601dd973cba51d604778ae34d6911c323e818e5756eff7f0853",
    "shared/ozon_contract.js": "c633b190a4353501c7b683a8bbbdb799a8b5ae78520a6187fbb874449b64b1b1",
    "shared/ozon_entitlements.js": "ede46ce2112d8c07c70855e37dbac2ac82c7fa9746d5c2cf3e4f8c1d75022764",
}
PROTECTED_B0_SHA256 = {
    "content_script.js": "a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "service_worker.js": "b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87",
    "shared/bridge_autorun_model.js": "c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
    "shared/work_session_model.js": "11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855",
    "shared/ozon_provider.js": "16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "shared/provider_transport_core.js": "7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/ai_adapters.js": "5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9",
    "shared/conversation_identity.js": "939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57",
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
        raise SystemExit("usage: materialize_patch_b1_assortment_master_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    validation = repo / "tooling/llm-api-bridges/ozon-seller/validation"
    b0 = validation / "materialize_patch_b0_full_read_core_candidate.py"
    patch = validation / "PATCH_B1_ASSORTMENT_MASTER_2026-08-26.patch"
    if not b0.is_file():
        raise RuntimeError(f"missing exact B0 materializer: {b0}")
    if not patch.is_file():
        raise RuntimeError(f"missing B1 patch: {patch}")
    patch_bytes = patch.read_bytes()
    if sha256(patch_bytes) != B1_PATCH_SHA256:
        raise RuntimeError("B1 patch identity mismatch")

    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(b0), str(repo), str(out)], check=True)
    if tree_digest(out) != B0_TREE_MANIFEST_SHA256:
        raise RuntimeError("B0 base tree identity mismatch before B1")

    applied = subprocess.run(
        ["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf", "apply", "--no-index", "-"],
        cwd=out,
        input=patch_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if applied.returncode != 0:
        raise RuntimeError(f"B1 patch apply failed:\n{applied.stderr.decode('utf-8', errors='replace')}")

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"B1 production file count {len(files)} != {EXPECTED_FILE_COUNT}")
    for rel, expected in EXPECTED_CHANGED_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected:
            raise RuntimeError(f"B1 changed identity mismatch {rel}: {actual} != {expected}")
    for rel, expected in PROTECTED_B0_SHA256.items():
        actual = sha256((out / rel).read_bytes())
        if actual != expected:
            raise RuntimeError(f"B1 protected B0 identity mismatch {rel}: {actual} != {expected}")
    actual_tree = tree_digest(out)
    if actual_tree != B1_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"B1 tree identity {actual_tree} != {B1_TREE_MANIFEST_SHA256}")

    print("PATCH_B1_B0_BASE_IDENTITY_PASS")
    print("PATCH_B1_PATCH_IDENTITY_PASS")
    print("PATCH_B1_PATCH_APPLY_PASS")
    print("PATCH_B1_PRODUCTION_FILE_COUNT_21_PASS")
    print("PATCH_B1_CHANGED_FILE_IDENTITIES_PASS")
    print("PATCH_B1_PROTECTED_B0_IDENTITIES_PASS")
    print("PATCH_B1_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
