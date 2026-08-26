#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B10_TREE='b5af358d19c5e4a720b34f61a6487a20bc07c82c7689a205fde96853c26d46b6'
B11_TREE='6362eba1469f9e3fdd3a34a27e33ea6db5d3dce82d851955cbdc06b6104b0caa'
RAW='6128fe139a43f9008c5f13483ae47b8ced1b8ef01628379f7ef3748c624cc180'
GZ='1f402a1974a61b329faca98ee1e9e807f9088c370aed433dfdb56d03de44094b'
COUNT=21
CHANGED={
 'shared/ozon_operation_registry.js':'15423c269337254e9d1e8941fe12a7be944fcef282a2bea45d0911bebdbed85f',
 'shared/ozon_contract.js':'12e95fe5154c42bdd163fcf31683c7cb532f8f3baaf05e1c1a415d640a91295d',
 'shared/ozon_entitlements.js':'3bd2cd3b81202fcf16b3b344e68edcd97251f4dd8373a1e03f9ac20fa420879c'
}
PROTECTED={
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','manifest.json':'f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1','popup.css':'1befabf8a3650dfe01a5980b0d5ff2fcd34666d507baad8e79f3873358d7a726','popup.html':'a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3','popup.js':'9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/ai_adapters.js':'5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/composer_send.js':'3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736','shared/conversation_identity.js':'939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_credentials.js':'286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/proven_writing_block_capture.js':'5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/runtime_names.js':'a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855'
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
 b10=v/'materialize_patch_b10_seller_health_ratings_candidate.py'; gz=v/'PATCH_B11_CATALOG_DIAGNOSTICS_CONTENT_2026-08-26.patch.gz'
 if not b10.is_file(): raise RuntimeError(f'missing B10 materializer: {b10}')
 if not gz.is_file(): raise RuntimeError(f'missing B11 patch: {gz}')
 comp=gz.read_bytes()
 if sha(comp)!=GZ: raise RuntimeError('B11 gzip identity mismatch')
 raw=gzip.decompress(comp)
 if sha(raw)!=RAW: raise RuntimeError('B11 raw patch identity mismatch')
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); b10work=work/'b10-work'; b10out=work/'b10-base'
 subprocess.run([sys.executable,str(b10),'--repo-root',str(repo),'--work-root',str(b10work),'--out',str(b10out)],check=True)
 if tree(b10out)!=B10_TREE: raise RuntimeError('B10 base identity mismatch')
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(b10out,out)
 r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError('B11 patch apply failed:\n'+r.stderr.decode(errors='replace'))
 files=[p for p in out.rglob('*') if p.is_file()]
 if len(files)!=COUNT: raise RuntimeError(f'B11 file count {len(files)} != {COUNT}')
 for rel,exp in CHANGED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B11 changed identity mismatch {rel}: {got} != {exp}')
 for rel,exp in PROTECTED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B11 protected B10 identity mismatch {rel}: {got} != {exp}')
 got=tree(out)
 if got!=B11_TREE: raise RuntimeError(f'B11 tree mismatch {got} != {B11_TREE}')
 for m in ['PATCH_B11_B10_BASE_IDENTITY_PASS','PATCH_B11_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B11_PATCH_APPLY_PASS','PATCH_B11_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B11_CHANGED_FILE_IDENTITIES_PASS','PATCH_B11_PROTECTED_B10_IDENTITIES_PASS','PATCH_B11_TREE_MANIFEST_SHA256_PASS']: print(m)
 print(out)
if __name__=='__main__': main()
