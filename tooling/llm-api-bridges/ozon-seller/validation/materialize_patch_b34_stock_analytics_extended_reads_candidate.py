#!/usr/bin/env python3
import argparse,gzip,hashlib,shutil,subprocess,sys
from pathlib import Path
B33='4c50a10e7147d180437293e140057ceedd61ac93e7c770a09a89539ea9030238';B34='06ad556b75e8d2f89093206ccf34c22990b226f55ffd3bd082e3bbddcece71cf'
RAW='f7ef9d455e3b2cf345f6b118d9b05bbb88eded4caeb42e3c4d25d74302d9db66';GZ='1de1e979de27d0bd655c9a0d03d7a4f5fe6cd1cb0121545c84b29dda6bb00e8c'
CH={'shared/ozon_operation_registry.js': 'ea851d70d2561c1a5ec68273454a817511294e503f030cfe8542ad02216c05fe', 'shared/ozon_contract.js': '08f847ca9638e21916817d3f004cc1d721765cda438d34ced11397c3c3618020', 'shared/ozon_entitlements.js': '4b93c6a790a69a047a0a52e93429d1679116a3ce6781c2eb97f5b90adfd4cbac'}
PROTECTED={'content_script.js': 'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd', 'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87', 'shared/bridge_autorun_model.js': 'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5', 'shared/work_session_model.js': '11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855', 'shared/ozon_provider.js': '16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b', 'shared/provider_transport_core.js': '7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8', 'shared/manual_controls.js': '81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e', 'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'}
def sha(b):return hashlib.sha256(b).hexdigest()
def tree(r):
 s=''.join(f'{str(f.relative_to(r)).replace(chr(92),chr(47))}\0{sha(f.read_bytes())}\n' for f in sorted((p for p in r.rglob('*') if p.is_file()),key=lambda p:str(p.relative_to(r)).replace(chr(92),chr(47))))
 return sha(s.encode())
def main():
 a=argparse.ArgumentParser();a.add_argument('--repo-root',required=True);a.add_argument('--work-root',required=True);a.add_argument('--out',required=True);x=a.parse_args();repo=Path(x.repo_root).resolve();work=Path(x.work_root).resolve();out=Path(x.out).resolve();v=repo/'tooling/llm-api-bridges/ozon-seller/validation';prev=v/'materialize_patch_b33_operational_status_reference_reads_candidate.py';pg=v/'PATCH_B34_STOCK_ANALYTICS_EXTENDED_READS_2026-08-28.patch.gz';c=pg.read_bytes();assert sha(c)==GZ;raw=gzip.decompress(c);assert sha(raw)==RAW
 if work.exists():shutil.rmtree(work)
 work.mkdir(parents=True);base=work/'b33-base'
 subprocess.run([sys.executable,str(prev),'--repo-root',str(repo),'--work-root',str(work/'b33-work'),'--out',str(base)],check=True);assert tree(base)==B33
 if out.exists():shutil.rmtree(out)
 shutil.copytree(base,out);r=subprocess.run(['git','-c','core.autocrlf=false','-c','core.eol=lf','apply','--no-index','-'],cwd=out,input=raw,stderr=subprocess.PIPE)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
 assert sum(p.is_file() for p in out.rglob('*'))==21
 for p,h in CH.items():assert sha((out/p).read_bytes())==h,p
 for p,h in PROTECTED.items():assert sha((out/p).read_bytes())==h,p
 assert tree(out)==B34
 for m in ['PATCH_B34_B33_BASE_IDENTITY_PASS','PATCH_B34_PATCH_TRANSPORT_IDENTITY_PASS','PATCH_B34_PATCH_APPLY_PASS','PATCH_B34_PRODUCTION_FILE_COUNT_21_PASS','PATCH_B34_CHANGED_FILE_IDENTITIES_PASS','PATCH_B34_PROTECTED_B33_IDENTITIES_PASS','PATCH_B34_TREE_MANIFEST_SHA256_PASS']:print(m)
if __name__=='__main__':main()
