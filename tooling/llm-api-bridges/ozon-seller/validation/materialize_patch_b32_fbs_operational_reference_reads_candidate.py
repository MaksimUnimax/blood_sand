#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B31='8f371897d63a3c79bb11c8587db63fdb5335aa588f49f329d791b888d9ca55ae';B32='aab83cfbdb05cbd1f1cff39b9cc3828fe436861c82ceaa99f80594dcb0599e49'
RAW='bc771fe4bde893d0842a16434e600eb8d41384daf58c6972853b0250acb690ce';GZ='c36341ffde8e11aa38a67bef3d1392f4007c5c7279722eb3a3eeafa056524175'
CH={'shared/ozon_operation_registry.js':'bac8df76fe032ed9ac1ae1e14daa6fca1f4002fddfde0da1c000ef781eef0df5','shared/ozon_contract.js':'a7bdf198d964145d1b794c3ece38ccf70670df9a3355e935036d81602ad055a1','shared/ozon_entitlements.js':'f30e1ab4f57bbd0f4af66f275a9ef9382a4fadcc5798c4618891188de9c0aff1'}
PROTECTED={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b):return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args();repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation';prev=v/'materialize_patch_b31_fbs_carriage_container_reads_candidate.py';pg=v/'PATCH_B32_FBS_OPERATIONAL_REFERENCE_READS_2026-08-28.patch.gz';c=pg.read_bytes();assert sha(c)==GZ;raw=gzip.decompress(c);assert sha(raw)==RAW
 if work.exists():shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b31-base';subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b31-work'),'--out',str(base)],check=True);assert tree(base)==B31
 if out.exists():shutil.rmtree(out)
 shutil.copytree(base,out);r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items():assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items():assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B32
 for m in ['PATCH_B32_B31_BASE_IDENTITY_PASS','PATCH_B32_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B32_PATCH_APPLY_PASS','PATCH_B32_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B32_CHANGED_FILE_IDENTITIES_PASS','PATCH_B32_PROTECTED_B31_IDENTITIES_PASS','PATCH_B32_TREE_MANIFEST_SHA256_PASS']:print(m)
if __name__=='__main__':main()
