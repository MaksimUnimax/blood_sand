#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B22='e3facdb871a287477b59594ca03b1252719750e597f00c2b3261344867436aa9'; B23='86d79d1f0e73c7483510dea326c7e5c8240286a10162beb8e09660d03f714480'
RAW='5f0aaf3047c9dbcffc1c3290e9a878c966531e19867a2e03a4baba3e17f032d0'; GZ='078eee83c34f9f97c007ac220ce5b09fa12aeffdd3723046869e7e2c906ee3e2'
CH={'shared/ozon_operation_registry.js':'460c7c3e7c1e79d9ec2869edbc416992a7f359d40edf2099f130ddb3d82ef69a','shared/ozon_contract.js':'4de7a0237e5672879d41a650aeea848afeae22e63c3cc36d41058ade240231b0','shared/ozon_entitlements.js':'2249d3c45b090690eb6865e5b23946c0b2e02769600c64ea0ae3eb81856fc327'}
def sha(b): return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser(); a.add_argument('--repo-root',required=True); a.add_argument('--work-root',required=True); a.add_argument('--out',required=True); x=a.parse_args()
 repo=Path(x.repo_root).resolve(); work=Path(x.work_root).resolve(); out=Path(x.out).resolve(); v=repo/'tooling/llm-api-bridges/ozon-seller/validation'
 prev=v/'materialize_patch_b22_cancellation_reason_reads_candidate.py'; pg=v/'PATCH_B23_SELLER_ACCOUNT_LOGISTICS_READS_2026-08-27.patch.gz'
 c=pg.read_bytes(); assert sha(c)==GZ; raw=gzip.decompress(c); assert sha(raw)==RAW
 if work.exists(): shutil.rmtree(work)
 work.mkdir(parents=True); base=work/'b22-base'
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b22-work'),'--out',str(base)],check=True); assert tree(base)==B22
 if out.exists(): shutil.rmtree(out)
 shutil.copytree(base,out); r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode: raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items(): assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B23
 for m in ['PATCH_B23_B22_BASE_IDENTITY_PASS','PATCH_B23_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B23_PATCH_APPLY_PASS','PATCH_B23_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B23_CHANGED_FILE_IDENTITIES_PASS','PATCH_B23_PROTECTED_B22_IDENTITIES_PASS','PATCH_B23_TREE_MANIFEST_SHA256_PASS']: print(m)
if __name__=='__main__': main()
