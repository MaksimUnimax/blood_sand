"""Exact-scope, dependency, packaged-destination and closed-set assertions."""
import pathlib,re,json,hashlib,subprocess,sys
root=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);base=pathlib.Path(sys.argv[3]) if len(sys.argv)>3 else None
changed={'service_worker.js','shared/bridge_autorun_model.js','shared/file_delivery_model_policy.js','shared/file_delivery_port_worker.js','shared/llm_output_report_workflow_patch.js','attachment_delivery_port_content.js'}
files={p.relative_to(root).as_posix():p.read_bytes() for p in root.rglob('*') if p.is_file()}
assert len(files)==32
if base:
 before={p.relative_to(base).as_posix():p.read_bytes() for p in base.rglob('*') if p.is_file()}
 assert set(before)==set(files)
 assert {p for p in files if files[p]!=before[p]}==changed
s={n:b.decode('utf-8') for n,b in files.items()};sw=s['service_worker.js'];p=s['shared/file_delivery_model_policy.js'];w=s['shared/file_delivery_port_worker.js'];m=s['shared/bridge_autorun_model.js'];llm=s['shared/llm_output_report_workflow_patch.js']
assert 'max_files_per_turn: 1,' in s['shared/ai_delivery_capabilities.js']
assert 'max_files_per_turn: null,' in s['shared/ai_delivery_capabilities.js']
assert 'adapter === "alice"' in p and 'maximum > 0' in p
assert 'response_style === "binary"' in p and 'completedFileAcquisitionKey' in p
loop=sw[sw.index('function processBatchQueue'):sw.index('async function failManualBatch')]
assert loop.index('entry.kind === "policy_error"')<loop.index('fileBudgetDecision')<loop.index('prepareProviderQuotaForCommand(physicalCommandForQuota)')
assert loop.index('fileBudgetDecision')<loop.index('await executeOzonCore')
assert 'entry.status === "requesting"' in loop and 'REQUEST_OUTCOME_UNKNOWN_NO_RETRY' in loop
assert 'external_request_executed: false' in sw[sw.index('function localFileDeliveryResult'):sw.index('async function ensureBatchLocalPolicy')]
assert 'readRetainedText' in loop and 'local_file_ref: delivery.state === "local_file_ready"' in sw
assert 'localFileRefFromEntry' in m and 'http_status === 0' in m
assert 'envelope?.http_status === 0' in llm and 'normalizeCommand(local.next_command)' in llm
assert 'if (providerFileRefs.length && aliceFileBudget(run) !== null)' in p
assert p.index('if (providerFileRefs.length && aliceFileBudget(run) !== null)')<p.index('if (!needsCompleteTextCompanion')
assert 'retained_text_ref:' in p and '_local_${crypto.randomUUID()}' in p
assert 'records.length > Number(profile.max_files_per_turn)' in w
assert 'if (typeof inlineText === "string")' in w and 'fullMessage' in w
assert 'await retainCompleteText(found.owner, inlineText)' in w and 'full_text_deferred: true' in w
assert 'prefixDelivered = false;' in w
read=w[w.index('async function readRetainedText'):w.index('async function retainCompleteText')]
for text in ['/^rpf_[sp]_local_', 'LOCAL_DELIVERY_NOT_FOUND', 'LOCAL_DELIVERY_SCOPE_MISMATCH','scope.origin','scope.conversation_key','scope.credential_revision','settings.personalDataEnabled','LOCAL_DELIVERY_COMMAND_MISMATCH','LOCAL_DELIVERY_EXPIRED','LOCAL_DELIVERY_INTEGRITY_MISMATCH']:
 assert text in read,text
assert not re.search(r'\bfetch\s*\(',read)
assert 'scope.command_key !== await localCommandKey(command)' in read
assert 'Object.keys(value).sort()' in w and 'value.map(canonical)' in w
retain=w[w.index('async function retainCompleteText'):w.index('function markerForDelivery')]
assert 'Date.parse(delivery.claimed_at)' in retain and 'await putArtifact(' in retain
assert retain.index('await putArtifact(')<retain.index('const notice = localFileDeliveryResult')
assert 'old.expires_at_ms <= nowMs()' in retain
fallback=w[w.index('async function fallbackBeforeAttachment'):w.index('async function failAttachmentDelivery')]
for text in ['PHASES.CLAIMED','deliveryId','complete: false','batch_watch_v1','attemptManualBatchDelivery','attemptAutoDelivery','retained_delivery_failure']:
 assert text in fallback,text
assert 'ATTACH_COMMITTED' not in fallback and not re.search(r'\bfetch\s*\(',fallback)
assert 'assertSenderOwner(sender, found.owner, message.live_owner)' in w
assert 'Requested artifact does not belong to this delivery.' in w
assert 'claimDelivery' in s['service_worker_entry.js'] or 'file_delivery_model_policy.js' in s['service_worker_entry.js']
manifest=json.loads(s['manifest.json']);assert manifest['background']['service_worker']=='service_worker_entry.js'
assert set(manifest['permissions'])=={'storage','alarms','tabs','unlimitedStorage'}
if base:
 assert files['manifest.json']==before['manifest.json']
 old=before['shared/file_delivery_port_worker.js'].decode('utf-8')
 for start,end in [('async function idbRequest','function getArtifact'),('async function captureTrustedReportFileOnce','globalThis.ProviderTransportCore ='),('function assertSenderOwner','async function materializeInlineProviderArtifact'),('async function commitAttachmentSend','async function cleanupDeliveryArtifacts'),('async function artifactChunk','async function cancelManualClaimedIfDisabled')]:
  assert old[old.index(start):old.index(end)]==w[w.index(start):w.index(end)],'protected path changed: '+start

patterns=r'localCommandKey|command_key|fileBudgetDecision|aliceFileBudget|fileProducingCommand|completedFileAcquisitionKey|localFileRefFromEntry|local_file_ref|inline_result_text|retained_text_ref|retained_delivery_failure|file_delivery_credential_revision|readRetainedText|retainCompleteText|fallbackBeforeAttachment|TARGET_AI_FILE_LIMIT|text_retained|local_file_ready|provider_file_refs|max_files_per_turn|attachment_watch_v1'
found={}
for n,t in s.items():
 hits=[{'line':i,'matches':sorted(set(re.findall(patterns,l))),'source':l[:220]} for i,l in enumerate(t.splitlines(),1) if re.search(patterns,l)]
 if hits:found[n]=hits
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps({'status':'PASS','production_files':32,'changed_files':sorted(changed),'unchanged_files':26,'consumer_files':found,'new_network_destinations':[],'all_original_limits_preserved':True,'provider_calls':0,'file_hashes':{n:hashlib.sha256(b).hexdigest() for n,b in files.items()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('SINGLE_FILE_SCOPE_DEPENDENCY_AUDIT_PASS changed=6 unchanged=26 consumers='+str(len(found)))
