#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B23='86d79d1f0e73c7483510dea326c7e5c8240286a10162beb8e09660d03f714480'; B24='000b53f323f50e00833869df4d0b0358339bf138f6526ad8ceb3cc6d1da02354'; RAW='b81b70deada83938632622cedbc243d72abd3cd41137f4ce87e82932b32b7e67'; GZ='e87d2838a4ff7d1891c0b315ef51737948994b6e451f914d3111f50694914065'
CH={'shared/ozon_operation_registry.js': '0d89975c0a9828835e60fdab8b6acc50c9db30f11bd4b4f23d01e2d86bae5e03', 'shared/ozon_contract.js': 'e01a9f671cf66326c9a425bf9a348bbabb3d8951ff414081350f03fd0c451ffd', 'shared/ozon_entitlements.js': 'bdeb2a1e892bb539e8fc758ce5ea0eee00083b3b0e3b0453eb614c1d284a2369'}
PROTECTED={'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'popup.css': '1befabf8a3650dfe01a5980b0d5ff2fcd34666d507baad8e79f3873358d7a726', 'popup.js': '9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070', 'manifest.json': 'f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1', 'popup.html': 'a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3', 'shared/conversation_identity.js': '939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57', 'shared/ozon_credentials.js': '286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d', 'shared/proven_writing_block_capture.js': '5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ai_adapters.js': '5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/composer_send.js': '3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/runtime_names.js': 'a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser(); a.add_argument('--repo-root',required=True); a.add_argument('--work-root',required=True); a.add_argument('--out',required=True); x=a.parse_args()
 repo=Path(x.repo_root).resolve(); work=Path(x.work_root).resolve(); out=Path(x.out).resolve(); v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 prev=v/'materialize_patch_b23_seller_account_logistics_reads_candidate.py'; pg=v/'PATCH_B24_FBO_SUPPLY_STATUS_ACT_READS_2026-08-28.patch.gz'
 c=pg.read_bytes(); assert sha(c)==GZ; raw=gzip.decompress(c); assert sha(raw)==RAW
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); base=work/'b23-base'
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b23-work'),'--out',str(base)],check=True); assert tree(base)==B23
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(base,out); r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items(): assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items(): assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B24
 for m in ['PATCH_B24_B23_BASE_IDENTITY_PASS','PATCH_B24_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B24_PATCH_APPLY_PASS','PATCH_B24_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B24_CHANGED_FILE_IDENTITIES_PASS','PATCH_B24_PROTECTED_B23_IDENTITIES_PASS','PATCH_B24_TREE_MANIFEST_SHA256_PASS']: print(m)
if __name__=='__main__': main()
