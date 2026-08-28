#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B35='0ee8bbcb7d608f60d6cb19238c2687c7ee472a0713ab6bed0859371e92e1b452';B36='3e26e160302b944d4c35e7b3cf16d0e40f61bd4ae79c5c2ba33c4623e5a245ce';RAW='6f1a89700f450a3e5920f5fc2288d9b8d6a6a865db8ccacd6874a2c6e0b9e258';GZ='da0823e8cb2de28165b22e338fddde4f45c2eae1ccb932efb24706bdc6229858'
CH={'shared/ozon_operation_registry.js': '8e6a3b582d96233add29f51013c0f5c14868a4cca39b2beb4b6936720e6b21f9', 'shared/ozon_contract.js': '7e0dbb72e2d47c3694e8c6f57907441ed3369cde6b6f8fb1c7b896351edc6ac4', 'shared/ozon_entitlements.js': 'f7f2c8e24cdd3b540fab4fbf93734836559e7118996e5731e748039d4afebba7'}
PROTECTED={'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b):return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args();repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation';prev=v/'materialize_patch_b35_marketplace_search_query_reads_candidate.py';pg=v/'PATCH_B36_FBP_PLANNING_READS_2026-08-28.patch.gz';c=pg.read_bytes();assert sha(c)==GZ;rawb=gzip.decompress(c);assert sha(rawb)==RAW
 if work.exists():shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b35-base'
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b35-work'),'--out',str(base)],check=True);assert tree(base)==B35
 if out.exists():shutil.rmtree(out)
 shutil.copytree(base,out);r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=rawb,stderr=subprocess.PIPE)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items():assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items():assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B36
 for m in ['PATCH_B36_B35_BASE_IDENTITY_PASS','PATCH_B36_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B36_PATCH_APPLY_PASS','PATCH_B36_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B36_CHANGED_FILE_IDENTITIES_PASS','PATCH_B36_PROTECTED_B35_IDENTITIES_PASS','PATCH_B36_TREE_MANIFEST_SHA256_PASS']:print(m)
if __name__=='__main__':main()
