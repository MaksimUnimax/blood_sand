from __future__ import annotations
import hashlib
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE_REF = ROOT.parent / "reference-0.1.4"
BASE_PREP = BASE_REF / "prepare_test_tree.py"
BASE_TARGET = BASE_REF / "ozon-bridge-v0.1.4-extension"
PATCH = ROOT / "evidence" / "OZON_BRIDGE_V0.1.5_PATCH.diff"
TARGET = ROOT / "ozon-bridge-v0.1.5-extension"
EXPECTED_FILES = {
    "content_script.js": "ad0481bb77ff4209094de2cd467da940238170eb932c623f4774c8fbf852df5d",
    "manifest.json": "9755ddbcafc85437e56822e96d5035a520f5467b077a2b6463cf8ea92622c9b9",
    "popup.css": "dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5",
    "popup.html": "fa8844bb22ebc7a79adadd8df3cf07c4acb23c565798bee30edb6f6c2ab63801",
    "popup.js": "53f452bd5a74c2944847848efe41860c7654529e97406816fb2fa8a3a69d1266",
    "service_worker.js": "f7812c93d42533e63ebce845485bc3935525884ee235bfc4c96d2abd4a058fae",
    "shared/bridge_autorun_model.js": "dff5265640ec4b848b4dee6019261c7b230d015eeac6f12fd85b9b7c2e93c22c",
    "shared/composer_send.js": "a6a2b25ea29637b76250a9f29fdcb177b52824a16a193b44ca5603df2494da79",
    "shared/conversation_identity.js": "e56a9f352c4668f47a0f72c2044a943a88457024c4400fa878a974551518114a",
    "shared/manual_controls.js": "81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/ozon_contract.js": "d85ff58d82c533e6ecd33db90885e38cb4814889cad9d0865cb41c35311c49b2",
    "shared/ozon_credentials.js": "74ff17f27ad6bdfd9ede3a671400b3ddfe588ab0a73a6215e5cbc9acfc326b17",
    "shared/ozon_provider.js": "611911cf6a354f2e3de99a86fce4b59db6d086f301b1658baf9c991ddb736d76",
    "shared/proven_writing_block_capture.js": "5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef",
    "shared/provider_transport_core.js": "76681b0de04f8781b4a5b7f2a37ad2cb2cfecf5503cc1ad3e296908463ba2ddb",
    "shared/runtime_names.js": "7304e9c28f16245949485b63a3b4cadf75a9796c13d765226a67f901c703cea4",
}

def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

if not BASE_PREP.is_file():
    raise SystemExit(f"missing base preparer: {BASE_PREP}")
if not PATCH.is_file():
    raise SystemExit(f"missing patch: {PATCH}")
subprocess.run(["python3", str(BASE_PREP)], cwd=BASE_REF, check=True)
if not BASE_TARGET.is_dir():
    raise SystemExit(f"base target missing after prepare: {BASE_TARGET}")
if TARGET.exists():
    shutil.rmtree(TARGET)
shutil.copytree(BASE_TARGET, TARGET)
subprocess.run(["patch", "-p1", "--forward", "--batch", "-i", str(PATCH)], cwd=TARGET, check=True)
actual_files = sorted(str(p.relative_to(TARGET)) for p in TARGET.rglob('*') if p.is_file())
if actual_files != sorted(EXPECTED_FILES):
    raise SystemExit(f"production file set mismatch: {actual_files}")
for rel, expected in EXPECTED_FILES.items():
    actual = sha256_file(TARGET / rel)
    if actual != expected:
        raise SystemExit(f"SHA mismatch {rel}: {actual} != {expected}")
print(f"prepared {TARGET.name}: {len(EXPECTED_FILES)}/{len(EXPECTED_FILES)} file hashes verified")
