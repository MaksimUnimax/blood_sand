#!/usr/bin/env python3
import base64
import hashlib
import shutil
import sys
import zipfile
from pathlib import Path

BASE_ZIP_SIZE = 136504
BASE_ZIP_SHA256 = "d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4"
BASE_B64_LENGTH = 182008
BASE_SERVICE_WORKER_SHA256 = "592800ac38c2be37e5b18121025da2593f18cc67f71fa5591d9def01fa3278b9"
PATCHED_SERVICE_WORKER_SHA256 = "f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c"
PATCHED_TREE_MANIFEST_SHA256 = "bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33"
EXPECTED_FILE_COUNT = 19

OLD = '''        const terminalized = await terminalizeFinishOperation(key);\n        await stopAutoRun(key);\n        await withBindingWrite(async () => {'''
NEW = '''        const terminalized = await terminalizeFinishOperation(key);\n        const autoRun = await getAutoRun(key);\n        if (autoRun) {\n          try {\n            await stopAutoRun(key);\n          } catch (error) {\n            if (error?.code !== "AUTO_RUN_NOT_FOUND") throw error;\n          }\n        }\n        await withBindingWrite(async () => {'''

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: materialize_patch_a1_finish_fix_candidate.py <repo-root> <output-dir>")
    repo = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    transport = repo / "tooling/llm-api-bridges/ozon-seller/validation/transport-r2"
    parts = [transport / f"part-{i:03d}.b64" for i in range(21)]
    if any(not p.is_file() for p in parts):
        missing = [str(p) for p in parts if not p.is_file()]
        raise RuntimeError(f"missing R2 transport part(s): {missing}")
    for i, part in enumerate(parts):
        expected = 2008 if i == 20 else 9000
        actual = part.stat().st_size
        if actual != expected:
            raise RuntimeError(f"part-{i:03d} size {actual} != {expected}")
    encoded = b"".join(p.read_bytes() for p in parts)
    if len(encoded) != BASE_B64_LENGTH:
        raise RuntimeError(f"base64 length {len(encoded)} != {BASE_B64_LENGTH}")
    base_zip = base64.b64decode(encoded, validate=True)
    if len(base_zip) != BASE_ZIP_SIZE or sha256(base_zip) != BASE_ZIP_SHA256:
        raise RuntimeError("canonical R2 ZIP identity mismatch")

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    zip_path = out.parent / (out.name + ".base.zip")
    zip_path.write_bytes(base_zip)
    try:
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(out)
    finally:
        zip_path.unlink(missing_ok=True)

    files = sorted(p for p in out.rglob("*") if p.is_file())
    if len(files) != EXPECTED_FILE_COUNT:
        raise RuntimeError(f"production file count {len(files)} != {EXPECTED_FILE_COUNT}")

    worker = out / "service_worker.js"
    before = worker.read_bytes()
    if sha256(before) != BASE_SERVICE_WORKER_SHA256:
        raise RuntimeError("base service_worker.js identity mismatch")
    text = before.decode("utf-8")
    if text.count(OLD) != 1:
        raise RuntimeError("Patch A.1 source anchor is missing or ambiguous")
    worker.write_text(text.replace(OLD, NEW, 1), encoding="utf-8")
    after = worker.read_bytes()
    if sha256(after) != PATCHED_SERVICE_WORKER_SHA256:
        raise RuntimeError("patched service_worker.js identity mismatch")

    lines = []
    for file in sorted((p for p in out.rglob("*") if p.is_file()), key=lambda p: str(p.relative_to(out)).replace("\\", "/")):
        rel = str(file.relative_to(out)).replace("\\", "/")
        lines.append(f"{rel}\0{sha256(file.read_bytes())}\n")
    tree_digest = sha256("".join(lines).encode("utf-8"))
    if tree_digest != PATCHED_TREE_MANIFEST_SHA256:
        raise RuntimeError(f"candidate tree digest {tree_digest} != {PATCHED_TREE_MANIFEST_SHA256}")

    print("PATCH_A1_R2_BASE_IDENTITY_PASS")
    print("PATCH_A1_ONLY_SERVICE_WORKER_OVERLAY_PASS")
    print("PATCH_A1_SERVICE_WORKER_SHA256_PASS")
    print("PATCH_A1_PRODUCTION_FILE_COUNT_19_PASS")
    print("PATCH_A1_TREE_MANIFEST_SHA256_PASS")
    print(str(out))

if __name__ == "__main__":
    main()
