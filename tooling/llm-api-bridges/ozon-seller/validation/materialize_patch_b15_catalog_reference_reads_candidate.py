#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B14_TREE='fb4877ad074f86d0a855d51b67bcb5b574a2bfc88727f63b83927ff5eb8e64fa'
B15_TREE='401692a486696189cc9bf81f58fd2066fe3babfb087747a7ccbb8519bacce07f'
RAW='02db694b62064385d830ddb1c78ff625f5a47ee61de2bd7cf5fd6d6b82907d3f'
GZ='56ec5f5714df257875cafe01a861e55281bf1332984d52a8b692870e9b4e2f82'
COUNT=21
CHANGED={
 'shared/ozon_operation_registry.js':'2b2821c8a19095c4cc21b6a819cb0f7c632d0eba369b272e8adc4761268069e4',
 'shared/ozon_contract.js':'8bb6f6419cce892d0e7eb1a425039c83b55319d6df91f69666d981615b9a53bf',
 'shared/ozon_entitlements.js':'112fabe641f9be2f32c23f9cbdcf4e86d20f9016c52b7a0c80a00c48dc01c1e4'
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
 ap=argparse.ArgumentParser(); ap.add_argument('--repo-root',required=True); ap.add_argument('--work-root',required=True); ap.add_argument('--out',required=True); a=ap.parse_args()
 repo=Path(a.repo_root).resolve(); work=Path(a.work_root).resolve(); out=Path(a.out).resolve(); v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 b14=v/'materialize_patch_b14_pricing_strategy_reads_candidate.py'; gz=v/'PATCH_B15_CATALOG_REFERENCE_READS_2026-08-27.patch.gz'
 if not b14.is_file(): raise RuntimeError(f'missing B14 materializer: {b14}')
 if not gz.is_file(): raise RuntimeError(f'missing B15 patch: {gz}')
 comp=gz.read_bytes()
 if sha(comp)!=GZ: raise RuntimeError('B15 gzip identity mismatch')
 raw=gzip.decompress(comp)
 if sha(raw)!=RAW: raise RuntimeError('B15 raw patch identity mismatch')
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); b14work=work/'b14-work'; b14out=work/'b14-base'
 subprocess.run([sys.executable,str(b14),'--repo-root',str(repo),'--work-root',str(b14work),'--out',str(b14out)],check=True)
 if tree(b14out)!=B14_TREE: raise RuntimeError('B14 base identity mismatch')
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(b14out,out)
 r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError('B15 patch apply failed:\n'+r.stderr.decode(errors='replace'))
 files=[p for p in out.rglob('*') if p.is_file()]
 if len(files)!=COUNT: raise RuntimeError(f'B15 file count {len(files)} != {COUNT}')
 for rel,exp in CHANGED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B15 changed identity mismatch {rel}: {got} != {exp}')
 for rel,exp in PROTECTED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B15 protected B14 identity mismatch {rel}: {got} != {exp}')
 got=tree(out)
 if got!=B15_TREE: raise RuntimeError(f'B15 tree mismatch {got} != {B15_TREE}')
 for m in ['PATCH_B15_B14_BASE_IDENTITY_PASS','PATCH_B15_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B15_PATCH_APPLY_PASS','PATCH_B15_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B15_CHANGED_FILE_IDENTITIES_PASS','PATCH_B15_PROTECTED_B14_IDENTITIES_PASS','PATCH_B15_TREE_MANIFEST_SHA256_PASS']: print(m)
 print(out)
if __name__=='__main__': main()
