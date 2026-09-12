"""Publish the exact reviewed runtime only after same-run deterministic and Chrome proof."""
import hashlib,json,os,pathlib,runpy,subprocess,sys
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller');HERE=ROOT/'validation/alice-single-file-transport-v1';proof=pathlib.Path(sys.argv[1]);branch='repair/ozon-alice-single-file-delivery-2026-09-12'
sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text(encoding='utf-8'))
s=read(proof/'summary.json');assert s['status']=='PASS' and s['provider_calls']==0
assert s['identity']['workflow_head']==os.environ['GITHUB_SHA'] and s['identity']['run_id']==os.environ['GITHUB_RUN_ID']
for r in s['results']:assert r['status']=='PASS' and sha((proof/(r['id']+'.log')).read_bytes())==r['log_sha256']
assert read(proof/'single-file-cases.json')['cases']==56
assert len(read(proof/'negative/summary.json')['controls'])==10
b=read(proof/'single-browser.json');assert b['status']=='PASS' and b['worker_recreated'] and b['provider_calls']==0 and len(b['cases'])==6
assert b'FAIL Retained TXT JSON key permutation' in (proof/'semantic-order-stage1-red.log').read_bytes()
runpy.run_path(str(HERE/'prepare_v2.py'),run_name='__main__')
expected=['attachment_delivery_port_content.js','service_worker.js','shared/bridge_autorun_model.js','shared/file_delivery_model_policy.js','shared/file_delivery_port_worker.js','shared/llm_output_report_workflow_patch.js']
runtime=[str(ROOT/'dist-step7-candidate'/n) for n in expected]
actual=subprocess.check_output(['git','diff','--name-only','--',str(ROOT/'dist-step7-candidate')]).decode().splitlines();assert set(actual)==set(runtime)
inv=read(proof/'dependency-inventory.json');assert len(inv['file_hashes'])==32
for n,h in inv['file_hashes'].items():assert sha((ROOT/'dist-step7-candidate'/n).read_bytes())==h,n
remote=subprocess.check_output(['git','ls-remote','origin','refs/heads/'+branch]).decode().split()[0]
assert remote==os.environ['GITHUB_SHA'],'concurrent remote mutation; refuse to overwrite'
subprocess.run(['git','config','user.name','github-actions[bot]'],check=True)
subprocess.run(['git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com'],check=True)
subprocess.run(['git','add','--',*runtime],check=True)
assert set(subprocess.check_output(['git','diff','--cached','--name-only']).decode().splitlines())==set(runtime)
subprocess.run(['git','diff','--cached','--check'],check=True)
subprocess.run(['git','commit','-m','fix(ozon): deliver Alice single-file batches with truthful deferred results'],check=True)
exe=subprocess.check_output(['git','rev-parse','HEAD']).decode().strip();tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}']).decode().strip()
info={'executable':exe,'tree':tree,'prematerialization_run':os.environ['GITHUB_RUN_ID'],'base':'06ec1af2a1d90e2ff192e749b5bf90129963dd05'}
fp=ROOT/'validation/alice-single-file-v1/EXECUTABLE.json';fp.write_text(json.dumps(info,indent=2)+'\n',encoding='utf-8')
cp=HERE/'CHECKPOINT_05_MATERIALIZED_V2.json';cp.write_text(json.dumps({**info,'status':'MATERIALIZED_NOT_PRE_HANDOFF','next':'one exact ZIP Linux -> Chrome -> Windows -> final evidence','provider_calls':0},indent=2)+'\n',encoding='utf-8')
notes=ROOT/'PATCH_ALICE_SINGLE_FILE_EXECUTION_NOTES_2026-09-12.md'
with notes.open('a',encoding='utf-8') as f:f.write('\n## Prepublication verification complete\nThe whole deterministic gate (56 behavioral cases,10 mutations,old31 plus expiry/consumer/worker/HELP/type/UI) and real Chrome Port/IDB/stopWorker/new target/local next-turn delivery passed before this runtime commit. The semantic ordering RED is independently reproduced against frozen stage1. Previous run34697032376 found missing ninth consumer classification;34697266876 caught an incorrect test field name.34697449141/34697638745 caught the unpublished private command-order defect. No failed run was called a ready build. Final exact-package Linux/Chrome/Windows cycle remains mandatory.\n')
names=[line.split('\t')[-1] for line in subprocess.check_output(['git','apply','--numstat',str(pathlib.Path(os.environ['RUNNER_TEMP'])/'candidate-stage1.patch')]).decode().splitlines()]
assert len(names)==19 and set(n for n in names if '/dist-step7-candidate/' in n)==set(runtime)
subprocess.run(['git','add','--',*[n for n in names if n not in runtime],str(fp),str(cp)],check=True)
subprocess.run(['git','diff','--cached','--check'],check=True)
subprocess.run(['git','commit','-m','test(ozon): freeze single-file executable and complete regression suite'],check=True)
assert not subprocess.check_output(['git','status','--porcelain']).strip(),'unclassified worktree changes'
subprocess.run(['git','push','origin','HEAD:refs/heads/'+branch],check=True)
(proof/'MATERIALIZED_EXECUTABLE.json').write_text(json.dumps(info,indent=2)+'\n',encoding='utf-8')
print(json.dumps(info))
