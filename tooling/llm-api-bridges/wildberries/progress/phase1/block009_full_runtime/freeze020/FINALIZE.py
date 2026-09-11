#!/usr/bin/env python3
"""Apply only AFTER browser-controls/APPLY.py to workspace/src.
Offline final 0.2.0 source recipe. Final source tests are still recorded separately.
Frozen ZIP:128638bytes SHA25658650cd988ea67ee5d080d679a3fc93ff4af365f63e4ea95548647e4f039dea3.
"""
from pathlib import Path
import sys
root=Path(sys.argv[1]).resolve()/'src'
p=root/'popup_runtime.js';s=p.read_text(encoding='utf-8')
old="const mode=$('aiMode').value;await call('WB_NEW_CONTEXT',{ai_id:mode==='auto'?'chatgpt':mode});"
new="const mode=$('aiMode').value;let ai=mode;if(mode==='auto'){const {identity}=await context();ai=identity.ai_id||(['https://chatgpt.com','https://chat.openai.com'].includes(identity.origin)?'chatgpt':identity.origin==='https://alice.yandex.ru'?'alice':null);if(!['chatgpt','alice'].includes(ai))throw new Error('Не удалось определить AI. Выберите ChatGPT или Алису явно.');}await call('WB_NEW_CONTEXT',{ai_id:ai});"
assert s.count(old)==1,'Wrong pre-final popup source';p.write_bytes(s.replace(old,new).encode())
p=root/'shared/runtime_policy.js';s=p.read_text(encoding='utf-8')
needle="    if(s.type && !['object','array','string','number','integer','boolean','null'].includes(s.type))fail('INVALID_SCHEMA_TYPE');"
extra='''
    // Unsupported shapes are rejected at metadata admission, never interpreted
    // permissively as missing constraints. No live WB schema is activated here.
    if(s.properties!==undefined && !plain(s.properties))fail('INVALID_SCHEMA');
    if(s.additionalProperties!==undefined && typeof s.additionalProperties!=='boolean')fail('UNSUPPORTED_SCHEMA_KEYWORD');
    if(s.nullable!==undefined && typeof s.nullable!=='boolean')fail('INVALID_SCHEMA');
    if(s.enum!==undefined && (!Array.isArray(s.enum)||!s.enum.length))fail('INVALID_SCHEMA');
    for(const key of ['minLength','maxLength','minItems','maxItems'])if(s[key]!==undefined && (!Number.isSafeInteger(s[key])||s[key]<0))fail('INVALID_SCHEMA');
    for(const key of ['minimum','maximum'])if(s[key]!==undefined && (typeof s[key]!=='number'||!Number.isFinite(s[key])))fail('INVALID_SCHEMA');
    for(const [min,max] of [['minimum','maximum'],['minLength','maxLength'],['minItems','maxItems']])if(s[min]!==undefined && s[max]!==undefined && s[min]>s[max])fail('INVALID_SCHEMA');
'''
assert s.count(needle)==1,'Wrong pre-final schema source';p.write_bytes(s.replace(needle,needle+extra).encode())
for n in ['manifest.json','content_script.js','service_worker.js','popup.js','popup.html','shared/wb_contract.js','shared/runtime_names.js']:
 p=root/n;s=p.read_text(encoding='utf-8');assert '0.1.4' in s,n;p.write_bytes(s.replace('0.1.4','0.2.0').encode())
print('FINAL_SOURCE_020_RESTORED; exact package/evidence verification is separate')
