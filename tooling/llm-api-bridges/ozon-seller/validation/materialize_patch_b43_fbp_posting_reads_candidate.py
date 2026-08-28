#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B42='ecf74daa52ff700861b34fae756107d4f6a5c331907afc6c47a7cb65f61e3418'
B43='6c9e371fb4f63cf96daa59984f395a3812c56ae59f726296b9f3f8e75d4bfc31'
RAW='40c1d3ba8b9369b4ab5e045c7af9e2a9b296dc0c86f380da9f7c62a8150e84ce'
GZ='fe9eb4e3c73680625eef77cd83f7878850b1d32d67d30f3c7572a1770a3f3650'
CH={'shared/ozon_operation_registry.js': '709d3604d0ce0c2ea8f8b811451fb2a40546a728cb096dececc6f1f545eb168e', 'shared/ozon_contract.js': 'baa407ac5de698d50eb4f4a881f3d32d4cb8e75d9e0b1a74fdaa01f1699f1387', 'shared/ozon_entitlements.js': '83f23d19b6a4f507edbcff6fa4145ebfdc578e63a31ce80218a1d3f185f4db23'}
PROTECTED={'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args()
 repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 prev=v/'materialize_patch_b42_fbs_warehouse_setup_reference_reads_candidate.py';pg=v/'PATCH_B43_FBP_POSTING_READS_2026-08-28.patch.gz'
 c=pg.read_bytes();assert sha(c)==GZ;raw=gzip.decompress(c);assert sha(raw)==RAW
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b42-base'
 if sys.platform.startswith('win'):
  prev_work=Path('C:/w43');prev_out=Path('C:/b42')
  for p in (prev_work,prev_out):
   if p.exists(): shutil.rmtree(p)
 else:
  prev_work=work/'b42-work';prev_out=base
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(prev_work),'--out',str(prev_out)],check=True);assert tree(prev_out)==B42
 if prev_out!=base:
  if base.exists(): shutil.rmtree(base)
  shutil.copytree(prev_out,base);assert tree(base)==B42
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(base,out)
 r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items(): assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items(): assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B43
 for m in ['PATCH_B43_B42_BASE_IDENTITY_PASS','PATCH_B43_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B43_PATCH_APPLY_PASS','PATCH_B43_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B43_CHANGED_FILE_IDENTITIES_PASS','PATCH_B43_PROTECTED_B42_IDENTITIES_PASS','PATCH_B43_TREE_MANIFEST_SHA256_PASS']: print(m)
if __name__=='__main__': main()
