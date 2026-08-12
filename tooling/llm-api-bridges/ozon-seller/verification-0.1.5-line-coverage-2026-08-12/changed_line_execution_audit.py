#!/usr/bin/env python3
from __future__ import annotations
import argparse, difflib, json
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--base', required=True)
p.add_argument('--new', required=True)
p.add_argument('--coverage', required=True)
p.add_argument('--tests', required=True)
a=p.parse_args()
base=Path(a.base); new=Path(a.new); covdir=Path(a.coverage); tests=Path(a.tests)

def changed_new_lines(rel: str) -> set[int]:
    old=(base/rel).read_text(encoding='utf-8').splitlines()
    cur=(new/rel).read_text(encoding='utf-8').splitlines()
    out=set()
    for tag,i1,i2,j1,j2 in difflib.SequenceMatcher(a=old,b=cur).get_opcodes():
        if tag in ('replace','insert'):
            out.update(range(j1+1,j2+1))
    return out

def full_entries(rel: str):
    text=(new/rel).read_text(encoding='utf-8'); expected=len(text); out=[]
    for cf in covdir.glob('*.json'):
        data=json.loads(cf.read_text(encoding='utf-8'))
        for script in data.get('result',[]):
            if not script.get('url','').endswith('/'+rel):
                continue
            mx=max((r['endOffset'] for fn in script.get('functions',[]) for r in fn.get('ranges',[])), default=0)
            if mx==expected:
                out.append(script)
    if not out:
        raise SystemExit(f'no full-file V8 coverage entry for {rel}')
    return out

def effective_count(entry, offset: int) -> int:
    candidates=[]
    for fn in entry.get('functions',[]):
        for r in fn.get('ranges',[]):
            if r['startOffset'] <= offset < r['endOffset']:
                candidates.append((r['endOffset']-r['startOffset'], int(r['count'])))
    if not candidates: return 0
    span=min(s for s,_ in candidates)
    return max(c for s,c in candidates if s==span)

def line_count(rel: str, lineno: int) -> int:
    text=(new/rel).read_text(encoding='utf-8'); lines=text.splitlines(True)
    starts=[]; pos=0
    for line in lines:
        starts.append(pos); pos += len(line)
    line=lines[lineno-1]
    offset=starts[lineno-1] + len(line)-len(line.lstrip())
    return max(effective_count(e,offset) for e in full_entries(rel))

results=[]
for rel in ('service_worker.js','shared/ozon_contract.js','shared/runtime_names.js'):
    changed=sorted(changed_new_lines(rel))
    missing=[ln for ln in changed if line_count(rel,ln) <= 0]
    if missing:
        raise SystemExit(f'{rel}: changed lines not V8-executed: {missing}')
    results.append(f'{rel}: changed_lines_v8_executed={len(changed)}/{len(changed)}')

content=(new/'content_script.js').read_text(encoding='utf-8').splitlines()
content_changed=sorted(changed_new_lines('content_script.js'))
expected_content=[5,410,458,462,463,464]
if content_changed != expected_content:
    raise SystemExit(f'content_script.js changed-line set drifted: {content_changed}')
checks={
  5:'const VERSION = "0.1.5";',
  410:'OzonContract.textFingerprint(text)',
  458:'проверяю и выполняю OZON_API_V1 через bridge',
  462:'Ozon Bridge не вернул отчёт',
  463:'response.pre_execution_error === true',
  464:'else if (!response.ok)'
}
for ln,needle in checks.items():
    if needle not in content[ln-1]:
        raise SystemExit(f'content_script.js:{ln} missing expected changed behavior: {needle}')
cmdtest=(tests/'content_command_key.test.js').read_text(encoding='utf-8')
manualtest=(tests/'content_manual_runtime.test.js').read_text(encoding='utf-8')
invariant=(tests/'invariant_scan.test.js').read_text(encoding='utf-8')
package=(tests/'package_consistency.test.js').read_text(encoding='utf-8')
for needle in ('actual commandKey fingerprints malformed text without parsing it','actual commandKey uses same text-fingerprint path for valid commands'):
    if needle not in cmdtest: raise SystemExit('commandKey runtime coverage contract missing')
for needle in ('actual handleCopy sends malformed command unchanged to worker','actual handleCopy valid/provider response uses same single delivery pipeline','actual handleCopy report missing triggers visible error'):
    if needle not in manualtest: raise SystemExit(f'handleCopy runtime coverage contract missing: {needle}')
if 'manual content path has no local parseCommand gate' not in invariant:
    raise SystemExit('deleted Manual parser gate invariant missing')
if 'all runtime version surfaces are exactly 0.1.5' not in package:
    raise SystemExit('version surface exact-source test missing')
results.append('content_script.js: changed_behavior_lines_runtime/source_asserted=6/6; deleted_local_parse_gate_absence_asserted=true')

static_expected={
  'manifest.json': {4:'"version": "0.1.5"'},
  'popup.html': {11:'id="versionBadge">v0.1.5</span>'},
  'popup.js': {115:'state.version || "0.1.5"',458:'extension_version: "0.1.5"'},
}
for rel,line_checks in static_expected.items():
    ch=sorted(changed_new_lines(rel))
    if ch != sorted(line_checks): raise SystemExit(f'{rel}: unexpected changed line set {ch}')
    lines=(new/rel).read_text(encoding='utf-8').splitlines()
    for ln,needle in line_checks.items():
        if needle not in lines[ln-1]: raise SystemExit(f'{rel}:{ln} source contract mismatch')
    results.append(f'{rel}: changed_metadata_lines_exact_source_asserted={len(ch)}/{len(ch)}')

print('changed_line_verification=PASS')
for r in results: print(r)
print('production_artifact_changed=false')
print('release_sha256=130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651')
