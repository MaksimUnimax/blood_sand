import base64, gzip, hashlib, json, os, pathlib, subprocess, sys, tempfile
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller')
DIST=ROOT/'dist-step7-candidate'
TEMP=pathlib.Path(os.environ.get('RUNNER_TEMP', tempfile.gettempdir()))
OUT=pathlib.Path(os.environ.get('OZON_PRIOR_REPORT_DIR',str(TEMP/'ozon-expiry-prior')))
OUT.mkdir(parents=True,exist_ok=True)
results=[]
def sha(data):return hashlib.sha256(data).hexdigest()
def run(label,args):
    env=dict(os.environ);env['NODE_OPTIONS']='--require="'+(ROOT/'validation/step7-regression-v1/network_guard.cjs').resolve().as_posix()+'"'
    p=subprocess.run(list(map(str,args)),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,env=env,timeout=180)
    (OUT/(label+'.log')).write_bytes(p.stdout)
    results.append({'id':label,'status':'PASS' if p.returncode==0 else 'FAIL','exit_code':p.returncode,'log_sha256':sha(p.stdout)})
    (OUT/'summary.json').write_text(json.dumps({'results':results,'provider_calls':0},indent=2)+'\n')
    print(label,results[-1]['status'],flush=True)
    if p.returncode:
        print(p.stdout.decode('utf-8',errors='replace')[-15000:]);raise SystemExit(p.returncode)
decoded=[]
for name,expected in [('run_attachment_idle_behavior.mjs','29cf98971296ba529d636e284f7066585c7e9e2cebe49121b41277ea18b8e71e'),('run_work_restart_extended.mjs','0a564b28a1bdf102042716247984594867aef6262bbfc18b0ea472a6a43aa883')]:
    encoded=b''.join((ROOT/'validation/global-toast-work-restart-v1'/(name+'.gz.b64')).read_bytes().split())
    assert len(encoded)%4!=1
    decoded_bytes=gzip.decompress(base64.b64decode(encoded+b'='*((-len(encoded))%4),validate=True))
    assert sha(decoded_bytes)==expected
    dest=TEMP/name;dest.write_bytes(decoded_bytes);decoded.append(dest)
specs=[
  ('regression/run_alice_xlsx_live_capability_gate.mjs',[]),
  ('alice-xlsx-live-capability-v2/run_postfix_alice_xlsx_live_capability.mjs',['.']),
  ('alice-xlsx-live-capability-v2/run_secondary_dependency_sweep.mjs',['.']),
  (str(decoded[0]),[DIST]),(str(decoded[1]),[DIST]),
  ('WORK_SESSION_PENDING_START_REGRESSION_2026-08-21.mjs',[DIST]),
  ('alice-spa-attachment-owner-v1/run_postfix_spa_owner_gate.mjs',['.']),
  ('regression/run_file_delivery_adapter_gate_policy.mjs',[]),
  ('regression/run_file_delivery_capture_accounting.mjs',[]),
  ('regression/run_file_delivery_port_worker_state_machine.mjs',[]),
  ('regression/run_file_delivery_mixed_batch_policy.mjs',[]),
  ('regression/run_file_delivery_wake_lifecycle.mjs',[]),
  ('regression/run_file_delivery_live_stop_repro.mjs',[]),
  ('regression/run_direct_binary_provider_attachment_gate.mjs',[]),
  ('indexeddb-transaction-durability-v1/run_prefix_transaction_abort_gate.mjs',['.']),
  ('indexeddb-transaction-durability-v1/run_secondary_dependency_sweep.mjs',['.']),
  ('alice-auto-send-v1/run_alice_auto_send_postfix_source_gate.mjs',[DIST]),
  ('alice-drag-drop-v1/run_alice_drag_drop_runtime_gate.mjs',['.',DIST]),
  ('alice-large-result-v1/run_alice_large_result_delivery_gate.mjs',[DIST]),
  ('alice-large-result-v1/run_alice_large_result_delivery_gate_v2.mjs',['.',DIST]),
  ('llm-output-report-workflow-v1/run_output_contract_gate.mjs',['.']),
  ('llm-output-report-workflow-v1/run_secondary_dependency_sweep.mjs',['.']),
  ('mixed-help-api-v2/run_mixed_help_api_gate_v2.mjs',['.']),
  ('mixed-help-api-v2/run_mixed_help_api_disabled_alias_gate.mjs',['.']),
  ('command-envelope-contract-v1/run_command_envelope_contract_gate.mjs',['.']),
  ('read-effect-repair-v1/run_effect_read_repair_gate.mjs',['.']),
  ('read-effect-repair-v1/run_defect_015_date_repair_gate.mjs',['.']),
  ('read-effect-repair-v1/run_provider_taxonomy_gate.mjs',['.']),
  ('read-effect-repair-v1/run_report_file_lifecycle_gate.mjs',['.']),
  ('read-effect-repair-v1/run_report_file_session_fail_closed_gate.mjs',['.']),
  ('read-effect-repair-v1/run_report_file_workflow_gate.mjs',['.'])]
for i,(p,args) in enumerate(specs,1):
    p=pathlib.Path(p);p=p if p.is_absolute() else ROOT/'validation'/p
    run('regression-%02d-%s'%(i,p.stem),['node',p,*args])
assert len(specs)==31
