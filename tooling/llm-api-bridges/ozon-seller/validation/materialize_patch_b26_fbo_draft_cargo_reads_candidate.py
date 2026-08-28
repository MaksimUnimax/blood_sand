#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B25='4d2653ed339b37f317e3d4e3be33a1485f8cdf5f6375ace839c3df21e5bde387'; B26='bad94d29fa3c34db76dbea3dc93b3aff94a4042739eb5d70312c93e35fff9852'
RAW='4e0f4e6877a20e6f29552c0d520d9f973559904bb3e2905340a00986771a1d79'; GZ='31491553b77c5796346d6519a2f101e329740d595fa4c15648964fe52fd6e868'
CH={'shared/ozon_operation_registry.js': '55b5c34034c593535f3a3ab5405ec2cc042b07846c16725f12c20e4db1732d5c', 'shared/ozon_contract.js': '13825310a1205053ad8122062441f06cb3a455eca4ad0d4a98c68fbf9bd5a0a5', 'shared/ozon_entitlements.js': 'cbb4fb004e3229fc8fde2ba220d94c0ca865847b8af89bfd0393de0aabf1e034'}
PROTECTED={'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser(); a.add_argument('--repo-root',required=True); a.add_argument('--work-root',required=True); a.add_argument('--out',required=True); x=a.parse_args()
 repo=Path(x.repo_root).resolve(); work=Path(x.work_root).resolve(); out=Path(x.out).resolve(); v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 prev=v/'materialize_patch_b25_safe_reference_settings_no_body_reads_candidate.py'; pg=v/'PATCH_B26_FBO_DRAFT_CARGO_READS_2026-08-28.patch.gz'
 c=pg.read_bytes(); assert sha(c)==GZ; raw=gzip.decompress(c); assert sha(raw)==RAW
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); base=work/'b25-base'
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b25-work'),'--out',str(base)],check=True); assert tree(base)==B25
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(base,out); r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items(): assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items(): assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B26
 for m in ['PATCH_B26_B25_BASE_IDENTITY_PASS','PATCH_B26_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B26_PATCH_APPLY_PASS','PATCH_B26_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B26_CHANGED_FILE_IDENTITIES_PASS','PATCH_B26_PROTECTED_B25_IDENTITIES_PASS','PATCH_B26_TREE_MANIFEST_SHA256_PASS']: print(m)
if __name__=='__main__': main()
