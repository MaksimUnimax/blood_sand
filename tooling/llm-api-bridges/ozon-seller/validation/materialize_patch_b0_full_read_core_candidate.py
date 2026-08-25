#!/usr/bin/env python3
import base64
import hashlib
import shutil
import subprocess
import sys
import zlib
from pathlib import Path

A5_TREE_MANIFEST_SHA256 = "4b77ed8500e3caacefff43a82002dc6ef5bfd562511bf10ef57a5392069c22a0"
B0_TREE_MANIFEST_SHA256 = "d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe"
B0_PATCH_B64_LENGTH = 39584
B0_PATCH_COMPRESSED_SHA256 = "dbfc6c366607268ecb6e1357339ea21e72189d1eb7a238a1252b199eff186e4f"
B0_PATCH_SHA256 = "7842bbe1c9be77ae753a8f5dec25d5d931736ace32e2198acec0da51666a6e21"
EXPECTED_BASE_FILE_COUNT = 19
EXPECTED_B0_FILE_COUNT = 21
EXPECTED_SHA256 = {
    "manifest.json": "f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1",
    "popup.html": "a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3",
    "popup.js": "9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
    "service_worker.js": "b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87",
    "shared/runtime_names.js": "a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59",
    "shared/ozon_contract.js": "e7ce6d7c77360529097ac0bcd5981f2dd4dc1856fb279b4d14364fe394ff5992",
    "shared/ozon_guidance.js": "8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508",
    "shared/ozon_operation_registry.js": "b5b16f7cb11cf92823920f49dd4ba2c66f17e830adb6edad575f1f995c16d673",
    "shared/ozon_entitlements.js": "6bd6f949d7aff29f80ce9e48154a37446dd5f9acc9fcd6528e9d1d4578a37ca5",
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
        raise SystemExit("usage: materialize_patch_b0_full_read_core_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    validation = repo / "tooling/llm-api-bridges/ozon-seller/validation"
    a5 = validation / "materialize_patch_a5_work_resume_provider_status_candidate.py"
    transport = validation / "transport-b0-full-read-core-2026-08-25"
    parts = [transport / f"part-{i:03d}.b64" for i in range(8)]
    if not a5.is_file():
        raise RuntimeError(f"missing exact A.5 materializer: {a5}")
    if any(not p.is_file() for p in parts):
        raise RuntimeError(f"missing B0 transport part(s): {[str(p) for p in parts if not p.is_file()]}")
    expected_sizes = [8000, 8000, 8000, 8000, 2000, 2000, 2000, 1584]
    for part, expected in zip(parts, expected_sizes):
        if part.stat().st_size != expected:
            raise RuntimeError(f"{part.name} size {part.stat().st_size} != {expected}")

    encoded = "".join(p.read_text(encoding="ascii") for p in parts)
    if len(encoded) != B0_PATCH_B64_LENGTH:
        raise RuntimeError(f"B0 patch encoded length {len(encoded)} != {B0_PATCH_B64_LENGTH}")
    compressed = base64.b64decode(encoded, validate=True)
    if sha256(compressed) != B0_PATCH_COMPRESSED_SHA256:
        raise RuntimeError("B0 compressed patch identity mismatch")
    patch_bytes = zlib.decompress(compressed)
    if sha256(patch_bytes) != B0_PATCH_SHA256:
        raise RuntimeError("B0 patch identity mismatch")

    if out.exists():
        shutil.rmtree(out)
    subprocess.run([sys.executable, str(a5), str(repo), str(out)], check=True)
    base_files = [p for p in out.rglob("*") if p.is_file()]
    if len(base_files) != EXPECTED_BASE_FILE_COUNT:
        raise RuntimeError(f"A.5 production file count {len(base_files)} != {EXPECTED_BASE_FILE_COUNT}")
    actual_base_tree = tree_digest(out)
    if actual_base_tree != A5_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"A.5 tree identity {actual_base_tree} != {A5_TREE_MANIFEST_SHA256}")

    applied = subprocess.run(
        ["git", "apply", "--no-index", "-"],
        cwd=out,
        input=patch_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if applied.returncode != 0:
        raise RuntimeError(f"B0 patch apply failed:\n{applied.stderr.decode('utf-8', errors='replace')}")

    files = [p for p in out.rglob("*") if p.is_file()]
    if len(files) != EXPECTED_B0_FILE_COUNT:
        raise RuntimeError(f"B0 production file count {len(files)} != {EXPECTED_B0_FILE_COUNT}")
    for rel, expected in EXPECTED_SHA256.items():
        file = out / rel
        if not file.is_file():
            raise RuntimeError(f"missing expected B0 file: {rel}")
        actual = sha256(file.read_bytes())
        if actual != expected:
            raise RuntimeError(f"B0 identity mismatch {rel}: {actual} != {expected}")
    actual_tree = tree_digest(out)
    if actual_tree != B0_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"B0 tree identity {actual_tree} != {B0_TREE_MANIFEST_SHA256")

    print("PATCH_B0_A5_BASE_IDENTITY_PASS")
    print("PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS")
    print("PATCH_B0_PATCH_APPLY_PASS")
    print("PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS")
    print("PATCH_B0_CHANGED_FILE_IDENTITIES_PASS")
    print("PATCH_B0_TREE_MANIFEST_SHA256_PASS")
    print(str(out))


if __name__ == "__main__":
    main()
