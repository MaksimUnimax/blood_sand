#!/usr/bin/env python3
import argparse
import gzip
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

B0_TREE = "d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe"
B1_TREE = "c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f"
RAW_SHA = "5485652cb41ea68d27285ba1678a23a4325037f1909426c933c60bdeabacf11f"
GZ_SHA = "e02d68c233067c258b3a115132296a4b25bdd1ab43ed061a030843fbbf475261"
EXPECTED_FILES = 21
EXPECTED_JS = 18
BASE_HASHES = {
    "shared/ozon_operation_registry.js":"b5b16f7cb11cf92823920f49dd4ba2c66f17e830adb6edad575f1f995c16d673",
    "shared/ozon_contract.js":"e7ce6d7c77360529097ac0bcd5981f2dd4dc1856fb279b4d14364fe394ff5992",
    "shared/ozon_entitlements.js":"6bd6f949d7aff29f80ce9e48154a37446dd5f9acc9fcd6528e9d1d4578a37ca5",
    "service_worker.js":"b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87",
}
FINAL_HASHES = {
    "shared/ozon_operation_registry.js":"5c957a8766e42df8863dd8320fe48c476a92c3fca9abc28c92c7f28e1d694ed6",
    "shared/ozon_contract.js":"b48e23ebb0c4ed9d38022500600d2c31c8deb93750b2138f5876ac4087013af2",
    "shared/ozon_entitlements.js":"e3d6aab926840bb36c6be058bd7550bef0549a2924f4ad6b0c93c6f8e4b6eb2c",
    "service_worker.js":"a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3",
}
PROTECTED = {
    "content_script.js":"a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
    "popup.js":"9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
    "shared/bridge_autorun_model.js":"c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
    "shared/work_session_model.js":"11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855",
    "shared/ozon_provider.js":"16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
    "shared/provider_transport_core.js":"7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8",
    "shared/manual_controls.js":"81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
    "shared/ozon_guidance.js":"8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508",
    "shared/runtime_names.js":"a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59",
}

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def tree_digest(root: Path) -> str:
    lines=[]
    for f in sorted((p for p in root.rglob('*') if p.is_file()), key=lambda p:p.relative_to(root).as_posix()):
        rel=f.relative_to(root).as_posix()
        lines.append(f"{rel}\0{sha(f.read_bytes())}\n")
    return sha(''.join(lines).encode())

def check_hashes(root: Path, expected: dict, label: str):
    for rel,h in expected.items():
        f=root/rel
        if not f.is_file(): raise RuntimeError(f"{label}: missing {rel}")
        actual=sha(f.read_bytes())
        if actual!=h: raise RuntimeError(f"{label}: {rel} {actual} != {h}")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--repo-root', required=True)
    ap.add_argument('--work-root', required=True)
    ap.add_argument('--out', required=True)
    args=ap.parse_args()
    repo=Path(args.repo_root).resolve(); work=Path(args.work_root).resolve(); out=Path(args.out).resolve()
    validation=repo/'tooling/llm-api-bridges/ozon-seller/validation'
    b0mat=validation/'materialize_patch_b0_full_read_core_candidate.py'
    patch=validation/'PATCH_V2_B1_STOCKS_WAREHOUSE_2026-08-29.patch.gz'
    if not b0mat.is_file(): raise RuntimeError(f"missing B0 materializer: {b0mat}")
    if not patch.is_file(): raise RuntimeError(f"missing B1 patch transport: {patch}")
    if work.exists(): shutil.rmtree(work)
    work.mkdir(parents=True)
    base=work/'b0-base'
    subprocess.run([sys.executable,str(b0mat),str(repo),str(base)],check=True)
    files=[p for p in base.rglob('*') if p.is_file()]
    if len(files)!=EXPECTED_FILES: raise RuntimeError(f"B0 files {len(files)} != {EXPECTED_FILES}")
    if sum(1 for p in files if p.suffix=='.js')!=EXPECTED_JS: raise RuntimeError("B0 JS count mismatch")
    if tree_digest(base)!=B0_TREE: raise RuntimeError("B0 tree identity mismatch")
    check_hashes(base,BASE_HASHES,'B0')
    check_hashes(base,PROTECTED,'B0 protected')
    print('V2_B1_B0_BASE_IDENTITY_PASS')

    gz=patch.read_bytes()
    if sha(gz)!=GZ_SHA: raise RuntimeError("B1 gzip identity mismatch")
    raw=gzip.decompress(gz)
    if sha(raw)!=RAW_SHA: raise RuntimeError("B1 raw patch identity mismatch")
    print('V2_B1_PATCH_TRANSPORT_IDENTITY_PASS')

    if out.exists(): shutil.rmtree(out)
    shutil.copytree(base,out)
    applied=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if applied.returncode!=0: raise RuntimeError('B1 patch apply failed:\n'+applied.stderr.decode(errors='replace'))
    print('V2_B1_PATCH_APPLY_PASS')

    files=[p for p in out.rglob('*') if p.is_file()]
    if len(files)!=EXPECTED_FILES: raise RuntimeError(f"B1 files {len(files)} != {EXPECTED_FILES}")
    if sum(1 for p in files if p.suffix=='.js')!=EXPECTED_JS: raise RuntimeError("B1 JS count mismatch")
    check_hashes(out,FINAL_HASHES,'B1 changed')
    check_hashes(out,PROTECTED,'B1 protected')
    digest=tree_digest(out)
    if digest!=B1_TREE: raise RuntimeError(f"B1 tree {digest} != {B1_TREE}")
    print('V2_B1_PRODUCTION_FILE_COUNT_21_PASS')
    print('V2_B1_PRODUCTION_JS_COUNT_18_PASS')
    print('V2_B1_CHANGED_FILE_IDENTITIES_PASS')
    print('V2_B1_PROTECTED_IDENTITIES_PASS')
    print('V2_B1_TREE_MANIFEST_SHA256_PASS')
    print(str(out))

if __name__=='__main__': main()
