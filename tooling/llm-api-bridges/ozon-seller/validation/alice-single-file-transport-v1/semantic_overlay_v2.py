"""Reconstruct the reviewed private command-key correction on the frozen stage1."""
import pathlib
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller')
HERE=ROOT/'validation/alice-single-file-v1'
def replace(path,before,after,count=1):
 s=path.read_text(encoding='utf-8');assert s.count(before)==count,(str(path),before,s.count(before));path.write_text(s.replace(before,after),encoding='utf-8')
w=ROOT/'dist-step7-candidate/shared/file_delivery_port_worker.js'
replace(w,'  async function readRetainedText(owner, command) {','''  // Object member order is not command semantics; arrays and values are.
  // This private scope key deliberately does not replace request fingerprints.
  async function localCommandKey(command) {
    const normalized = JSON.parse(JSON.stringify(OzonContract.normalizeCommand(command)));
    function canonical(value) {
      if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
      if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
      return JSON.stringify(value);
    }
    return sha256Hex(new TextEncoder().encode(canonical(normalized)));
  }

  async function readRetainedText(owner, command) {''')
replace(w,'scope.command_fingerprint !== OzonContract.commandFingerprint(OzonContract.normalizeCommand(command))','scope.command_key !== await localCommandKey(command)')
replace(w,'command_fingerprint: OzonContract.commandFingerprint(command)','command_key: await localCommandKey(command)')
g=HERE/'green.mjs'
case='''await test('Retained TXT JSON key permutation survives storage and keeps semantic guard',async()=>{const{w,o}=await large();const ref=o.delivery.retained_text_ref;await finish(w,o);const w2=runtime(dist,{store:w.store,sessionStore:w.sessionStore,artifacts:w.artifacts,clock:w.clock,fetchImpl:provider});const n=await w2.batch([{params:{limit:200,offset:0,file_ref:ref},operation:'report_file_get'}]);assert.equal(w2.requests.length,0);assert.equal(env(entries(n)[0]).result.delivery.state,'local_file_ready',entries(n)[0].report_text);const r=await commit(w2,n);assert.equal(r.artifact_descriptors.length,1);assert.equal(r.artifact_descriptors[0].source_kind,'generated_bridge_text');});
'''
replace(g,"console.log(JSON.stringify({status:'PASS',cases:count,provider_calls:0}));",case+"console.log(JSON.stringify({status:'PASS',cases:count,provider_calls:0}));")
n=HERE/'negative.py'
replace(n,'mutants=[', '''mutants=[
 ('ordered-command-regression',worker,'return sha256Hex(new TextEncoder().encode(canonical(normalized)));','return sha256Hex(new TextEncoder().encode(JSON.stringify(normalized)));','Retained TXT JSON key permutation'),
 ('semantic-command-bypass',worker,'scope.command_key !== await localCommandKey(command)','false','Retained TXT modified offset'),''')
b=HERE/'browser.mjs'
replace(b,"assert.equal(local.batch.entries[0].http_status,0);", "assert.equal(JSON.parse(local.batch.entries[0].report_text.slice('OZON_RESULT_V1\\n'.length)).result.delivery.state,'local_file_ready',local.batch.entries[0].report_text);assert.equal(local.batch.entries[0].http_status,0);")
r=HERE/'run.py'
replace(r,"result['cases']>=55", "result['cases']==56")
f=HERE/'finalize.py'
s=f.read_text(encoding='utf-8').replace("['cases']==55","['cases']==56").replace('55 cases','56 cases').replace('55 candidate','56 candidate').replace('plus8','plus10').replace('cases,8','cases,10').replace("'new_behavioral_cases':55,'new_mutation_controls':8", "'new_behavioral_cases':56,'new_mutation_controls':10")
s=s.replace("assert read(p/'negative'/'summary.json')['status']=='PASS'", "assert read(p/'negative'/'summary.json')['status']=='PASS'\n  assert len(read(p/'negative'/'summary.json')['controls'])==10")
f.write_text(s,encoding='utf-8')
a=HERE/'audit.py'
replace(a,"assert not re.search(r'\\bfetch\\s*\\(',read)", "assert not re.search(r'\\bfetch\\s*\\(',read)\nassert 'scope.command_key !== await localCommandKey(command)' in read\nassert 'Object.keys(value).sort()' in w and 'value.map(canonical)' in w")
replace(a,"patterns=r'fileBudgetDecision", "patterns=r'localCommandKey|command_key|fileBudgetDecision")
for p in ROOT.glob('PATCH_ALICE_SINGLE_FILE_*2026-09-12.md'):
 s=p.read_text(encoding='utf-8').replace('55 cases','56 cases').replace('55 behavioral','56 behavioral').replace('8 independent mutation','10 independent mutation').replace('stored command fingerprint','private semantic command SHA-256').replace('55 candidate','56 candidate').replace('55 новых','56 новых').replace('8 намеренно','10 намеренно').replace('8 испорченных','10 испорченных')
 p.write_text(s,encoding='utf-8')
p=ROOT/'PATCH_ALICE_SINGLE_FILE_EXECUTION_NOTES_2026-09-12.md'
with p.open('a',encoding='utf-8') as f:f.write('''\n## Recovered private semantic-key correction\nReal Chrome rejected the unpublished retained TXT after worker recreation: LOCAL_DELIVERY_COMMAND_MISMATCH. The guard incorrectly hashed JSON member insertion order. A deterministic permutation scenario reproduces that failure on stage1. The replacement uses SHA-256 of the normalized command with recursively sorted object keys and unchanged array ordering/values. Global request fingerprints are untouched. New tests: 56 behavioral cases and 10 named mutations. Full prior regressions and Chrome must be repeated.\n\n## Continuation recovery\nAfter another session interruption only notes/evidence survived locally; the stage1 candidate was reconstructed from a hash-verified remote archive. The private-key correction is therefore reconstructed from the recorded design and proved anew, not represented as restored byte-for-byte. No production publication or handoff preceded the gates.\n''')
p=ROOT/'PATCH_ALICE_SINGLE_FILE_EXPLANATION_2026-09-12.md'
with p.open('a',encoding='utf-8') as f:f.write('''\n## Исправление, найденное реальным Chrome до публикации\nХранение меняло порядок полей JSON; прежняя новая проверка локальной команды ошибочно принимала это за изменение запроса. Приватный ключ теперь вычисляется по нормализованной команде с отсортированными ключами объектов; массивы и значения не переставляются. Это не отключение проверки: изменение offset, limit или file_ref всё ещё отклоняется. Глобальные fingerprints существующих Ozon-команд не затронуты.\n''')
print('SEMANTIC_KEY_OVERLAY_APPLIED')
