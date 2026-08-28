#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B36='3e26e160302b944d4c35e7b3cf16d0e40f61bd4ae79c5c2ba33c4623e5a245ce';B37='a1fc2f298cb1916039b3cb6fed6af23e62f8cda1eed6df26ccd8bf3e5785539e';RAW='09e5ca64de77b0b2e3bb9c7f2fb1a434724963ca8fb17d53579f48b6fad67995';GZ='6c7729ca9bc6dc08c24658ce728c09ae76dd0d16e167f051eb9f7a867605b773'
CH={'shared/ozon_operation_registry.js':'cb015f0048a323c17bae237a3fdb5f06e0f412addeceb4f5aee0de9b74bd6c67','shared/ozon_contract.js':'5248b0c370827047c4f549c2ef3d122c67d125cf0cc6e3e6b34ba0841131dafc','shared/ozon_entitlements.js':'816f51faea2b25a5d713aba4cb5b09bb6b0083a51f3e3a5ba0855913f67fc379'}
PROTECTED={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b):return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args();repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation';prev=v/'materialize_patch_b36_fbp_planning_reads_candidate.py';pg=v/'PATCH_B37_FBO_REMOVAL_REPORT_READS_2026-08-28.patch.gz';c=pg.read_bytes();assert sha(c)==GZ;raw=gzip.decompress(c);assert sha(raw)==RAW
 if work.exists():shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b36-base'
 if sys.platform.startswith('win'):
  prev_work=Path('C:/w37');prev_out=Path('C:/b36')
  for p in (prev_work,prev_out):
   if p.exists():shutil.rmtree(p)
 else:prev_work=work/'b36-work';prev_out=base
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(prev_work),'--out',str(prev_out)],check=True);assert tree(prev_out)==B36
 if prev_out!=base:
  if base.exists():shutil.rmtree(base)
  shutil.copytree(prev_out,base);assert tree(base)==B36
 if out.exists():shutil.rmtree(out)
 shutil.copytree(base,out);r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items():assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items():assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B37
 for m in ['PATCH_B37_B36_BASE_IDENTITY_PASS','PATCH_B37_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B37_PATCH_APPLY_PASS','PATCH_B37_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B37_CHANGED_FILE_IDENTITIES_PASS','PATCH_B37_PROTECTED_B36_IDENTITIES_PASS','PATCH_B37_TREE_MANIFEST_SHA256_PASS']:print(m)
if __name__=='__main__':main()
