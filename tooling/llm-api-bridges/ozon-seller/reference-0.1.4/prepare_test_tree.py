from __future__ import annotations
import base64
import hashlib
import shutil
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE_REF = ROOT.parent / "reference-0.1.3"
BASE_PARTS = sorted((BASE_REF / "archive-exact").glob("ozon-bridge-v0.1.3-extension.zip.b64.part*"))
PATCH = ROOT / "evidence" / "OZON_BRIDGE_V0.1.4_PATCH.diff"
TARGET = ROOT / "ozon-bridge-v0.1.4-extension"
BASE_ZIP_SHA256 = "fe535cbe1f34d7a1e7684346ca7cad0a71c3ff6ac1018854cde03dd26fe6c5a9"
EXPECTED_FILES = {
    "content_script.js": "81dd5e306e50ee9c6e50e0a3533fece9eae58ec178d57aed8b7219c2d13fd7be",
    "manifest.json": "97dd0ee810fd9364537ea697a4ea1619da77e176f71c363a1593eae00efe392b",
    "popup.css": "dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5",
    "popup.html": "ef111a9156addcd07ece697e7f932220a1eda25d68938ac9f0ed34a1b681556b",
    "popup.js": "d7015758ea2b3571d428ef27721f3e83e304f4de14dda9c91f3d31139f0a0634",
    "service_worker.js": "5440d38bf8e7679b4c92935ac4f2f88014b4329b2bef6f376ba46a4dc37f827f",
    "shared/bridge_autorun_model.js": "dff5265640ec4b848b4dee6019261c7b230d015eeac6f12fd85b9b7c2e93c22c",
    "shared/composer_send.js": "a6a2b25ea29637b76250a9f29fdcb177b52824a16a193b44ca5603df2494da79",
    "shared/conversation_identity.js": "e56a9f352c4668f47a0f72c2044a943a88457024c4400fa878a974551518114a",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/ozon_contract.js": "e6db8114efd29412a50f60b132ed2f6363f05316e7b855f146e996eb5252b0b7",
    "shared/ozon_credentials.js": "74ff17f27ad6bdfd9ede3a671400b3ddfe588ab0a73a6215e5cbc9acfc326b17",
    "shared/ozon_provider.js": "611911cf6a354f2e3de99a86fce4b59db6d086f301b1658baf9c991ddb736d76",
    "shared/proven_writing_block_capture.js": "5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef",
    "shared/provider_transport_core.js": "76681b0de04f8781b4a5b7f2a37ad2cb2cfecf5503cc1ad3e296908463ba2ddb",
    "shared/runtime_names.js": "80cc136581ee17752e78602986675662bc240af46766f2de8718dea4a30c369a",
}

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())

if not BASE_PARTS:
    raise SystemExit(f"missing v0.1.3 exact archive parts under {BASE_REF / 'archive-exact'}")
if not PATCH.is_file():
    raise SystemExit(f"missing patch: {PATCH}")

encoded = "".join(p.read_text(encoding="ascii").strip() for p in BASE_PARTS)
base_zip = base64.b64decode(encoded, validate=True)
actual_base_sha = sha256_bytes(base_zip)
if actual_base_sha != BASE_ZIP_SHA256:
    raise SystemExit(f"v0.1.3 base SHA mismatch: {actual_base_sha}")

if TARGET.exists():
    shutil.rmtree(TARGET)
TARGET.mkdir(parents=True)
archive_path = ROOT / ".tmp-v0.1.3.zip"
archive_path.write_bytes(base_zip)
try:
    with zipfile.ZipFile(archive_path) as zf:
        roots = {Path(name).parts[0] for name in zf.namelist() if name and not name.endswith('/')}
        if len(roots) != 1:
            raise SystemExit(f"unexpected archive roots: {sorted(roots)}")
        root_name = next(iter(roots))
        temp_extract = ROOT / ".tmp-v0.1.3-extract"
        if temp_extract.exists():
            shutil.rmtree(temp_extract)
        zf.extractall(temp_extract)
        extracted = temp_extract / root_name
        for item in extracted.iterdir():
            shutil.move(str(item), TARGET / item.name)
        shutil.rmtree(temp_extract)
finally:
    archive_path.unlink(missing_ok=True)

subprocess.run(["patch", "-p1", "--forward", "--batch", "-i", str(PATCH)], cwd=TARGET, check=True)

actual = {}
for rel, expected in EXPECTED_FILES.items():
    file_path = TARGET / rel
    if not file_path.is_file():
        raise SystemExit(f"missing reconstructed file: {rel}")
    digest = sha256_file(file_path)
    actual[rel] = digest
    if digest != expected:
        raise SystemExit(f"reconstructed SHA mismatch for {rel}: {digest} != {expected}")

extra = sorted(str(p.relative_to(TARGET)) for p in TARGET.rglob('*') if p.is_file() and str(p.relative_to(TARGET)) not in EXPECTED_FILES)
if extra:
    raise SystemExit(f"unexpected reconstructed production files: {extra}")
print(f"prepared {TARGET.name}: {len(actual)}/{len(EXPECTED_FILES)} file hashes verified")
