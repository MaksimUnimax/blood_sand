#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B44='269d3d50cf9b9455ddfb7c51ec1791b4a64fd23ba7bd3f0e54228262fce02409'
B45='0fc0d3079f6ef1b4dc14b74b3b7ad0180684cb123f34d2bf8e869d8e4562ea86'
RAW='26525aab728a6360335e286e72a9b60c4672f93410a3acc750e4cd2543c6b94a'
GZ='b9a43fb2ba6d5481cd66298539dc1ff4d9d0064b4c73a3be2bc2ae091d9da0ca'
CH={'shared/ozon_operation_registry.js':'1fbaab611c5368da9f0bed9154b70daa7b24a53aad529babc67a4c121a1daccd','shared/ozon_contract.js':'b7ccc7b738ed924bf590075562b6629ed68a4196c2f1baf6a0f6b11f29e5d188','shared/ozon_entitlements.js':'1548ea8a8083e601eb331602a3544d0c23667b79bd2aa6810fbd07d368de84ba'}
PROTECTED={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args()
 repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 prev=v/'materialize_patch_b44_fbo_posting_get_candidate.py';pg=v/'PATCH_B45_SELLER_ACTION_CANDIDATES_2026-08-28.patch.gz'
 c=pg.read_bytes();assert sha(c)==GZ;raw=gzip.decompress(c);assert sha(raw)==RAW
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b44-base'
 if sys.platform.startswith('win'):
  prev_work=Path('C:/w45');prev_out=Path('C:/b44')
  for p in (prev_work,prev_out):
   if p.exists(): shutil.rmtree(p)
 else:
  prev_work=work/'b44-work';prev_out=base
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(prev_work),'--out',str(prev_out)],check=True);assert tree(prev_out)==B44
 if prev_out!=base:
  if base.exists(): shutil.rmtree(base)
  shutil.copytree(prev_out,base);assert tree(base)==B44
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(base,out)
 r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items(): assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items(): assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B45
 for m in ['PATCH_B45_B44_BASE_IDENTITY_PASS','PATCH_B45_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B45_PATCH_APPLY_PASS','PATCH_B45_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B45_CHANGED_FILE_IDENTITIES_PASS','PATCH_B45_PROTECTED_B44_IDENTITIES_PASS','PATCH_B45_TREE_MANIFEST_SHA256_PASS']: print(m)
if __name__=='__main__': main()
