#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B17_TREE='4577b9ac48988560caaa66e197179d76b05d35ce5f515f241a3b63e558b80e34'
B18_TREE='300e1fe642cf0bb108f39d3e35fd4f8d97140e60ae4cc76361407685d2b0ad75'
RAW='5900c5e7d2b4080505ff39d5bfb6d07025592817760635aa3aa813cbddae85a6'
GZ='fa25cda2f81db2fc0a969a40bc6469c4dc645d494be69c4986cef0566e16b834'
COUNT=21
CHANGED={'shared/ozon_operation_registry.js': 'af9d4b0f90f7daf995364edae3e8c4fcaf7fc640d79b9efc4cc82a8a796058f8', 'shared/ozon_contract.js': 'ef52a12406b2161ef4a53faefd61b86a315c3de83bb8c59b594d2240e2975f7b', 'shared/ozon_entitlements.js': 'bd0f6a2d867f7d0e2e1c65b1dce843f02cf45a88945b0acb9f9f9afb12707ad8'}
PROTECTED={'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'manifest.json': 'f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1', 'popup.css': '1befabf8a3650dfe01a5980b0d5ff2fcd34666d507baad8e79f3873358d7a726', 'popup.html': 'a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3', 'popup.js': '9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070', 'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'shared/ai_adapters.js': '5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/composer_send.js': '3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736', 'shared/conversation_identity.js': '939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ozon_credentials.js': '286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/proven_writing_block_capture.js': '5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/runtime_names.js': 'a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855'}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(root):
 lines=[]
 for f in sorted((p for p in root.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(root)).replace('\\','/')):
  rel=str(f.relative_to(root)).replace('\\','/'); lines.append(f'{rel}\0{sha(f.read_bytes())}\n')
 return sha(''.join(lines).encode())
def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--repo-root',required=True); ap.add_argument('--work-root',required=True); ap.add_argument('--out',required=True); a=ap.parse_args()
 repo=Path(a.repo_root).resolve(); work=Path(a.work_root).resolve(); out=Path(a.out).resolve(); v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 b17=v/'materialize_patch_b17_reviews_questions_extended_reads_candidate.py'; gz=v/'PATCH_B18_PRICING_STRATEGY_EXTENDED_READS_2026-08-27.patch.gz'
 if not b17.is_file(): raise RuntimeError(f'missing B17 materializer: {b17}')
 if not gz.is_file(): raise RuntimeError(f'missing B18 patch: {gz}')
 comp=gz.read_bytes()
 if sha(comp)!=GZ: raise RuntimeError('B18 gzip identity mismatch')
 raw=gzip.decompress(comp)
 if sha(raw)!=RAW: raise RuntimeError('B18 raw patch identity mismatch')
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); b17work=work/'b17-work'; b17out=work/'b17-base'
 subprocess.run([sys.executable,str(b17),'--repo-root',str(repo),'--work-root',str(b17work),'--out',str(b17out)],check=True)
 if tree(b17out)!=B17_TREE: raise RuntimeError('B17 base identity mismatch')
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(b17out,out)
 r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError('B18 patch apply failed:\n'+r.stderr.decode(errors='replace'))
 files=[p for p in out.rglob('*') if p.is_file()]
 if len(files)!=COUNT: raise RuntimeError(f'B18 file count {len(files)} != {COUNT}')
 for rel,exp in CHANGED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B18 changed identity mismatch {rel}: {got} != {exp}')
 for rel,exp in PROTECTED.items():
  got=sha((out/rel).read_bytes())
  if got!=exp: raise RuntimeError(f'B18 protected B17 identity mismatch {rel}: {got} != {exp}')
 got=tree(out)
 if got!=B18_TREE: raise RuntimeError(f'B18 tree mismatch {got} != {B18_TREE}')
 for m in ['PATCH_B18_B17_BASE_IDENTITY_PASS','PATCH_B18_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B18_PATCH_APPLY_PASS','PATCH_B18_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B18_CHANGED_FILE_IDENTITIES_PASS','PATCH_B18_PROTECTED_B17_IDENTITIES_PASS','PATCH_B18_TREE_MANIFEST_SHA256_PASS']: print(m)
 print(out)
if __name__=='__main__': main()
