from pathlib import Path

sw = Path('tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/service_worker.js')
s = sw.read_text(encoding='utf-8')
old = '    setTimeout(() => { void processAutoBatch(run.conversation_key, run.run_id); }, 0);'
new = '    setTimeout(() => { launchBatchProcessor("autorun", run.conversation_key, run.run_id, "content_recovery"); }, 0);'
count = s.count(old)
if count != 1:
    raise SystemExit(f'autorun content recovery: expected 1 occurrence, got {count}')
sw.write_text(s.replace(old, new, 1), encoding='utf-8')

patcher = Path('.github/ozon-provider-lifecycle-terminalization-apply.py')
p = patcher.read_text(encoding='utf-8')
old_driver = "pt = replace_once(pt, old_seller_io, new_seller_io, 'seller bounded IO')"
new_driver = "\nif pt.count(old_seller_io) != 2:\n    raise SystemExit(f'seller/performance bounded IO: expected 2 shared blocks before split, got {pt.count(old_seller_io)}')\npt = pt.replace(old_seller_io, new_seller_io, 1)"
if p.count(old_driver) != 1:
    raise SystemExit(f'patch-driver seller split anchor: expected 1, got {p.count(old_driver)}')
patcher.write_text(p.replace(old_driver, new_driver, 1), encoding='utf-8')

print('AUTORUN_CONTENT_RECOVERY_PREPATCH_PASS')
print('SELLER_PERFORMANCE_PATCH_BLOCK_SPLIT_PASS')
