"""Closed-set inventory of production report-file consumers and lifetime invariants."""
import hashlib,json,pathlib,re,sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate')
output=pathlib.Path(sys.argv[2] if len(sys.argv)>2 else 'report-expiry-source-inventory.json')
approved={'shared/bridge_autorun_model.js','shared/direct_binary_file_delivery_patch.js','shared/file_delivery_port_worker.js','shared/llm_output_report_workflow_patch.js','shared/ozon_contract.js','shared/ozon_provider.js','shared/provider_transport_core.js','shared/runtime_names.js'}
pattern=re.compile(r'report_file_ref|generated_file_ref|REPORT_FILE_SESSION_STATE|report_code_policies|registerReportFile|file_availability|REPORT_SESSION_SCHEMA_VERSION|REPORT_FILE_REF_TTL_MS|executeTrustedReportFileOnce|REPORT_FILE_EXPIRED')
found={}
for path in sorted(root.rglob('*')):
 if path.is_file():
  data=path.read_bytes();text=data.decode('utf-8');hits=[{'line':i+1,'symbols':sorted(set(pattern.findall(line))),'excerpt':line[:180]} for i,line in enumerate(text.splitlines()) if pattern.search(line)]
  if hits:found[path.relative_to(root).as_posix()]={'sha256':hashlib.sha256(data).hexdigest(),'references':hits}
assert set(found)==approved, 'Unclassified/removed report-file consumers: '+str(set(found)^approved)
p=(root/'shared/ozon_provider.js').read_text(encoding='utf-8');w=(root/'shared/llm_output_report_workflow_patch.js').read_text(encoding='utf-8')
assert p.count('registerReportFile(')==3, 'Function plus both URL producers must remain covered'
assert 'expiresAt: report.expires_at' in p and 'report.status' in p and 'const rawFile = report.file;' in p
assert 'const REPORT_SESSION_SCHEMA_VERSION = 2;' in p
assert '[1, REPORT_SESSION_SCHEMA_VERSION].includes(raw.schema_version)' in p
assert 'REPORT_FILE_REF_TTL_MS = 30 * 60 * 1000' in p and 'RETURNS_FILE_URL_TTL_MS = 5 * 60 * 1000' in p
assert 'expires_at_ms: expiresAt, provider_expires_at_ms: providerExpiresAt' in p
assert 'return remembered ? remembered.personal_data_required === true : true;' in p
assert 'const REPORT_FILE_REF_MAX = 128;' in p and 'const REPORT_CODE_POLICY_MAX = 256;' in p
part=p[p.index('async function executeReportFileCommand'):p.index('const GENERATED_DOCUMENT_URL_FIELD_BY_OPERATION')]
assert part.index('Number(now()) >= record.expires_at_ms')<part.index('executeTrustedReportFileOnce(')
assert w.index('const availability = result.file_availability')<w.index('const readyRef = generatedFileRef || reportFileRef')
assert w.index('if (generatedInline)')<w.index('const availability = result.file_availability')
assert not re.search(r'\bfetch\s*\(',w)
assert 'const ARTIFACT_TTL_MS = 60 * 60 * 1000;' in (root/'shared/file_delivery_port_worker.js').read_text(encoding='utf-8')
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps({'status':'PASS','classified_consumer_files':8,'unclassified_consumer_files':0,'files':found},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('REPORT_EXPIRY_SECONDARY_SWEEP_PASS classified=8 unclassified=0')
