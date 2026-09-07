from pathlib import Path
p = Path('tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/service_worker.js')
s = p.read_text(encoding='utf-8')
old = '    setTimeout(() => { void processAutoBatch(run.conversation_key, run.run_id); }, 0);'
new = '    setTimeout(() => { launchBatchProcessor("autorun", run.conversation_key, run.run_id, "content_recovery"); }, 0);'
count = s.count(old)
if count != 1:
    raise SystemExit(f'autorun content recovery: expected 1 occurrence, got {count}')
p.write_text(s.replace(old, new, 1), encoding='utf-8')
print('AUTORUN_CONTENT_RECOVERY_PREPATCH_PASS')
