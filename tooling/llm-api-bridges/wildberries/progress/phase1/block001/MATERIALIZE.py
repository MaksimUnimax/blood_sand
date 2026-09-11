#!/usr/bin/env python3
"""Reconstruct the actual block001 candidate from the pinned WB archive; offline.
Usage: python MATERIALIZE.py ORIGINAL.zip NEW_OUTPUT_DIR
"""
import hashlib,json,sys,zipfile
from pathlib import Path
archive=Path(sys.argv[1]).resolve(); root=Path(sys.argv[2]).resolve()
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715','Wrong original'
root.mkdir(parents=True,exist_ok=False)
with zipfile.ZipFile(archive) as z:
    for item in z.infolist():
        rel=Path(item.filename)
        assert not rel.is_absolute() and '..' not in rel.parts,'Unsafe ZIP member'
        target=root/Path(*rel.parts[1:]);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(item))
p=root/'shared/wb_contract.js';s=p.read_text()
s=s.replace('VERSION="0.1.2";', 'VERSION="0.1.3";',1)
s=s.replace('const out={};for(const [k,x] of Object.entries(v)){b.keys++;', 'const out={};for(const [k,x] of Object.entries(v)){if(["__proto__","prototype","constructor"].includes(k))fail("UNSAFE_JSON_KEY",`${path}: unsafe object key.`);b.keys++;')
a=s.index('  function normalizeCommand(raw){');b=s.index('    const supplied=',a)
s=s[:a]+'''  // Public commands are NOT the normalized worker/provider representation.
  // Validate before resolving an alias: an extra transport field must never be ignored.
  function assertPublicCommand(raw) {
    if (!isPlain(raw)) fail("INVALID_JSON_ROOT", "Команда должна быть JSON-объектом.");
    for (const key of Object.keys(raw)) {
      if (key !== "operation" && key !== "params") fail("UNKNOWN_COMMAND_FIELD", "Разрешены только operation и params.");
    }
    if (typeof raw.operation !== "string" || !raw.operation.trim()) fail("MISSING_OPERATION", "Не указано строковое operation.");
    if (!Object.hasOwn(raw, "params") || !isPlain(raw.params)) fail("INVALID_OPERATION_PARAMS", "Обязателен JSON-объект params.");
  }
  function normalizeCommand(raw){
    assertPublicCommand(raw);
    const operation=raw.operation.trim();const meta=resolveOperation(operation);
'''+s[b:]
s=s.replace('    const path=isPlain(supplied.path)?supplied.path:{};', '''    if (Object.hasOwn(supplied,"path") && !isPlain(supplied.path)) fail("INVALID_PATH_PARAMS", "params.path должен быть объектом.");
    if (Object.hasOwn(supplied,"query") && !isPlain(supplied.query)) fail("INVALID_QUERY_PARAMS", "params.query должен быть объектом.");
    const path=isPlain(supplied.path)?supplied.path:{};''')
a=s.index('  function parseCommand(text)')
s=s[:a]+'''  // Internal callers may restore this representation from JSON storage. Re-validate
  // it through the public contract instead of trusting a marker, identity or old worker.
  function checkedCommand(command) {
    if (isPlain(command) && !Object.hasOwn(command,"params") && Object.hasOwn(command,"path") && Object.hasOwn(command,"query")) {
      for (const key of Object.keys(command)) {
        if (!["operation","path","query","body"].includes(key)) fail("UNKNOWN_COMMAND_FIELD", "Недопустимое поле внутренней команды.");
      }
      return normalizeCommand({operation:command.operation, params:{path:command.path, query:command.query, ...(command.body===undefined?{}:{body:command.body})}});
    }
    return normalizeCommand(command);
  }
'''+s[a:]
s=s.replace('function parseCommand(text){let s=String(text||"").replace(/\\u00a0/g," ").trim();','function parseCommand(text){let s=String(text||"").trim();')
s=s.replace('fail("INVALID_JSON",`Некорректный JSON: ${e.message}`);','fail("INVALID_JSON","Некорректный JSON команды.");')
s=s.replace('const c=normalizeCommand(command)', 'const c=checkedCommand(command)')
s=s.replace('JSON.stringify(normalizeCommand(command))','JSON.stringify(checkedCommand(command))')
s=s.replace('function nc(raw){if(!isPlain(raw))fail("INVALID_JSON_ROOT","Команда должна быть JSON-объектом.");','function nc(raw){assertPublicCommand(raw);')
p.write_text(s)
for name in ['content_script.js','service_worker.js','popup.html','popup.js','shared/runtime_names.js']:
    p=root/name;p.write_text(p.read_text().replace('0.1.2','0.1.3'))
p=root/'manifest.json';m=json.loads(p.read_text());m['version']='0.1.3';p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file()},indent=2))
