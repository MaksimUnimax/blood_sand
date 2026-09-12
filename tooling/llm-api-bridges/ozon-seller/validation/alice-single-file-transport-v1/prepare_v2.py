"""Apply only the frozen candidate plus reviewed semantic-key overlay in a CI worktree."""
import base64,hashlib,lzma,os,pathlib,runpy,shutil,subprocess,sys,tempfile
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller');DIST=ROOT/'dist-step7-candidate';HERE=ROOT/'validation/alice-single-file-transport-v1'
BASE='06ec1af2a1d90e2ff192e749b5bf90129963dd05'
assert not subprocess.check_output(['git','diff','--name-only',BASE,'HEAD','--',str(DIST)]).strip(),'production moved; rebase and review required'
raw=base64.b64decode(''.join((HERE/f'part{i}.b64').read_text().strip() for i in (1,2,3)),validate=True)
assert len(raw)==40156 and hashlib.sha256(raw).hexdigest()=='5029b9a54f37d49b3fff559f6acfd0a776ac02a4f1930c0c1ef2a3c2725012bb'
patch=lzma.decompress(raw)
assert len(patch)==155947 and hashlib.sha256(patch).hexdigest()=='cebd23e60583c6d669beac49733d078a90e6ecf972f57ab6ee5754e5843144d6'
p=pathlib.Path(os.environ.get('RUNNER_TEMP',tempfile.gettempdir()))/'candidate-stage1.patch';p.write_bytes(patch)
subprocess.run(['git','apply','--check',str(p)],check=True);subprocess.run(['git','apply',str(p)],check=True)
with tempfile.TemporaryDirectory() as td:
 old=pathlib.Path(td)/'stage1-dist';shutil.copytree(DIST,old)
 runpy.run_path(str(HERE/'semantic_overlay_v2.py'),run_name='__main__')
 if len(sys.argv)>1:
  out=pathlib.Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
  env=dict(os.environ);env['NODE_OPTIONS']='--require="'+(ROOT/'validation/step7-regression-v1/network_guard.cjs').resolve().as_posix()+'"'
  r=subprocess.run(['node',str(ROOT/'validation/alice-single-file-v1/green.mjs'),str(old)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,env=env,timeout=120)
  (out/'semantic-order-stage1-red.log').write_bytes(r.stdout)
  assert r.returncode!=0 and b'FAIL Retained TXT JSON key permutation' in r.stdout,'expected stage1 ordering defect was not independently reproduced'
subprocess.run(['git','diff','--check'],check=True)
print('FROZEN_STAGE1_PLUS_SEMANTIC_V2_READY')
