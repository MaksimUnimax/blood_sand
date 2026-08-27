#!/usr/bin/env python3
import argparse,hashlib,shutil,subprocess,sys
from pathlib import Path
B11_TREE='6362eba1469f9e3fdd3a34a27e33ea6db5d3dce82d851955cbdc06b6104b0caa'
COUNT=21
EXPECTED={
 'shared/ozon_operation_registry.js':'15423c269337254e9d1e8941fe12a7be944fcef282a2bea45d0911bebdbed85f',
 'shared/ozon_contract.js':'12e95fe5154c42bdd163fcf31683c7cb532f8f3baaf05e1c1a415d640a91295d',
 'shared/ozon_entitlements.js':'3bd2cd3b81202fcf16b3b344e68edcd97251f4dd8373a1e03f9ac20fa420879c',
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
 'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
 'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
 'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
 'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
 'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
 'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
 'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'
}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(root):
 lines=[]
 for f in sorted((p for p in root.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(root)).replace('\\','/')):
  rel=str(f.relative_to(root)).replace('\\','/'); lines.append(f'{rel}\0{sha(f.read_bytes())}\n')
 return sha(''.join(lines).encode())
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--repo-root',required=True);ap.add_argument('--work-root',required=True);ap.add_argument('--out',required=True);a=ap.parse_args()
 repo=Path(a.repo_root).resolve();work=Path(a.work_root).resolve();out=Path(a.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 b11=v/'materialize_patch_b11_catalog_diagnostics_content_candidate.py'
 if not b11.is_file(): raise RuntimeError(f'missing B11 materializer: {b11}')
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); b11work=work/'b11-work'; b11out=work/'b11-base'
 subprocess.run([sys.executable,str(b11),'--repo-root',str(repo),'--work-root',str(b11work),'--out',str(b11out)],check=True)
 if tree(b11out)!=B11_TREE: raise RuntimeError('B11 base identity mismatch')
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(b11out,out)
 files=[p for p in out.rglob('*') if p.is_file()]
 if len(files)!=COUNT: raise RuntimeError(f'B12 file count {len(files)} != {COUNT}')
 for rel,exp in EXPECTED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B12 zero-delta identity mismatch {rel}: {got} != {exp}')
 got=tree(out)
 if got!=B11_TREE: raise RuntimeError(f'B12 zero-delta tree mismatch {got} != {B11_TREE}')
 for m in ['PATCH_B12_B11_BASE_IDENTITY_PASS','PATCH_B12_ZERO_PRODUCTION_DELTA_PASS','PATCH_B12_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B12_PROTECTED_B11_IDENTITIES_PASS','PATCH_B12_TREE_MANIFEST_SHA256_PASS']: print(m)
 print(out)
if __name__=='__main__': main()
