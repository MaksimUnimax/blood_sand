#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
BASE='8c151f88cff0975494ec3f4e1ea13ac2079d093846e255ad238b6c07a300d645'; FINAL='6c8eab7825bb93be156620358f6699c57897649839a61bc375c75b7bcabf3c0e'; RAW='dfbd646d7a5bfc48697e32e446086d27349f67cbfe0292ae4a110c7bc5ed1fe4'; GZ='781ba838b2504b7ee40a228aa2aa2553e7ce8cf27a9bf340cc59ef0f9618727f'
CH={'shared/ozon_operation_registry.js':'2a2b6bcb728b443ae533086959a313543f43be25dad83ced5336f07672dd76c5','shared/ozon_contract.js':'3d4be2e58b053b8485caf8470ddd203189893e5b2a3061be5da8a8ebddc4d470','shared/ozon_entitlements.js':'9464615c8c75f1738656216bde076971d4b8bfa1434a459c4bf5b931adc44564'}
P={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def h(b):return hashlib.sha256(b).hexdigest()
def tree(r):return h(''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{h(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47)))).encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args();repo=Path(x.repo_root).resolve();w=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation';prev=v/'materialize_patch_b25_cancellation_read_completion_candidate.py';gz=v/'PATCH_B26_FBO_POSTING_DETAIL_READ_2026-08-28.patch.gz';c=gz.read_bytes();assert h(c)==GZ;raw=gzip.decompress(c);assert h(raw)==RAW
 if w.exists():shutil.rmtree(w)
 w.mkdir(parents=True);base=w/'b25-base';subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(w/'b25-work'),'--out',str(base)],check=True);assert tree(base)==BASE
 if out.exists():shutil.rmtree(out)
 shutil.copytree(base,out);r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE);assert r.returncode==0,r.stderr.decode(errors='replace');assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,z in CH.items():assert h((out/p).read_bytes())==z,p
 for p,z in P.items():assert h((out/p).read_bytes())==z,p
 assert tree(out)==FINAL
 for m in ['PATCH_B26_B25_BASE_IDENTITY_PASS','PATCH_B26_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B26_PATCH_APPLY_PASS','PATCH_B26_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B26_CHANGED_FILE_IDENTITIES_PASS','PATCH_B26_PROTECTED_B25_IDENTITIES_PASS','PATCH_B26_TREE_MANIFEST_SHA256_PASS']:print(m)
if __name__=='__main__':main()
