"""Mutation controls: scoped temporary copies, never installable production output."""
import hashlib,json,os,pathlib,shutil,subprocess,sys,tempfile
root=pathlib.Path('tooling/llm-api-bridges/ozon-seller')
dist=root/'dist-step7-candidate'
output=pathlib.Path(os.environ.get('OZON_NEGATIVE_DIR',tempfile.mkdtemp(prefix='expiry-negative-')))
output.mkdir(parents=True,exist_ok=True)
provider='shared/ozon_provider.js';workflow='shared/llm_output_report_workflow_patch.js'
mutants=[
 ('ignore-provider-expiry',provider,'if (provider.at_ms !== null) deadline = Math.min(deadline, provider.at_ms);','if (false) deadline = Math.min(deadline, provider.at_ms);','EXPIRED_REPORT_NEVER_MINTS_REF'),
 ('remove-prefetch-guard',provider,'if (Number(now()) >= record.expires_at_ms) {','if (false) {','DEADLINE_SURVIVES_COMPLETE_MODULE_RECREATION'),
 ('renew-on-restore',provider,'expires_at_ms: expiresAt, provider_expires_at_ms: providerExpiresAt','expires_at_ms: current + REPORT_FILE_REF_TTL_MS, provider_expires_at_ms: providerExpiresAt','DEADLINE_SURVIVES_COMPLETE_MODULE_RECREATION'),
 ('ignore-delayed-output',workflow,'if (availability !== undefined) {','if (false) {','DELAYED_OUTPUT_CANNOT_OFFER_EXPIRED_REF'),
 ('unsafe-provenance-fallback',provider,'return remembered ? remembered.personal_data_required === true : true;','return remembered ? remembered.personal_data_required === true : false;','LEGACY_MISSING_EXPIRY_USES_BOUNDED_TTL')]
rows=[]
for label,file,before,after,expected in mutants:
 with tempfile.TemporaryDirectory(prefix='expiry-mutant-') as temp:
  target=pathlib.Path(temp)/'dist';shutil.copytree(dist,target)
  path=target/file;source=path.read_text(encoding='utf-8');assert source.count(before)==1,label
  path.write_text(source.replace(before,after),encoding='utf-8')
  env=dict(os.environ);env.pop('OZON_EXPIRY_REPORT',None)
  p=subprocess.run(['node',str(root/'validation/report-file-expiry-v1/run_expiry_gate.mjs'),str(target)],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=60)
  text=p.stdout.decode('utf-8',errors='replace');(output/(label+'.log')).write_bytes(p.stdout)
  assert p.returncode!=0 and 'AssertionError' in text and 'CASE_FAILED='+expected in text,label+' did not fail its intended invariant: '+text[-4000:]
  rows.append({'name':label,'status':'EXPECTED_FAIL','killed_by':expected,'log_sha256':hashlib.sha256(p.stdout).hexdigest()});print(label,'EXPECTED_FAIL')
(output/'summary.json').write_text(json.dumps({'status':'PASS','controls':rows,'provider_calls':0},indent=2)+'\n',encoding='utf-8')
print('REPORT_EXPIRY_NEGATIVE_CONTROLS_PASS')
