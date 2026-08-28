#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B34='06ad556b75e8d2f89093206ccf34c22990b226f55ffd3bd082e3bbddcece71cf';B35='0ee8bbcb7d608f60d6cb19238c2687c7ee472a0713ab6bed0859371e92e1b452';RAW='234a2fe59e551a010185b780feb8c386473c76fed2d365353f1bed82233f5689';GZ='da5657dc217c9daa08eb4c39b01a72dc18a4e125d658b34f0ce2f01d7eac6205'
CH={'shared/ozon_operation_registry.js': '623a726e2f6d97c205b101500b9daceb133f2c55da9f023f78d8b6de8e7ac4ef', 'shared/ozon_contract.js': '64b4aff5e05e0a6f5e187b35e3fd87018687fa2c8c6cbd950b0b5a00e552726d', 'shared/ozon_entitlements.js': '5a9a57d778cc9bc21a2802e6455166663169c9b3b50ecae8e1dd65a47dced7c1'}
PROTECTED={'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b):return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args();repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation';prev=v/'materialize_patch_b34_stock_analytics_extended_reads_candidate.py';pg=v/'PATCH_B35_MARKETPLACE_SEARCH_QUERY_READS_2026-08-28.patch.gz';c=pg.read_bytes();assert sha(c)==GZ;rawb=gzip.decompress(c);assert sha(rawb)==RAW
 if work.exists():shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b34-base'
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b34-work'),'--out',str(base)],check=True);assert tree(base)==B34
 if out.exists():shutil.rmtree(out)
 shutil.copytree(base,out);r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=rawb,stderr=subprocess.PIPE)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items():assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items():assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B35
 for m in ['PATCH_B35_B34_BASE_IDENTITY_PASS','PATCH_B35_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B35_PATCH_APPLY_PASS','PATCH_B35_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B35_CHANGED_FILE_IDENTITIES_PASS','PATCH_B35_PROTECTED_B34_IDENTITIES_PASS','PATCH_B35_TREE_MANIFEST_SHA256_PASS']:print(m)
if __name__=='__main__':main()
