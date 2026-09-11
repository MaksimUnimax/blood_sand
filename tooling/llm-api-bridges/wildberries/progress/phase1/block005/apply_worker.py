from pathlib import Path
import json,sys
root=Path(sys.argv[1]);here=Path(__file__).parent
p=root/'service_worker.js';s=p.read_text()
s=s.replace('"shared/wb_contract.js", "shared/bridge_autorun_model.js"','"shared/wb_contract.js", "shared/wb_command_protocol.js", "shared/wb_batch_runtime.js", "shared/bridge_autorun_model.js"',1)
s=s.replace('async function executeWildberriesCore(commandText) {',(here/'worker_insert.js').read_text()+'async function executeWildberriesCore(commandText) {',1)
# Only public/manual and auto entry points change; original provider core stays single-command.
a=s.index('async function executeManualCommand');b=s.index('function manualDeliveryRecoveryPayload',a)
t=s[a:b].replace('WBContract.parseCommand(commandText)','WBCommandProtocol.parse(commandText)').replace('executeWildberriesCore(commandText)',"executeWorkPlan(commandText, {mode:'manual',key,id:operationId,tabId:senderTabId})")
s=s[:a]+t+s[b:]
a=s.index('async function handleAutoCommand');b=s.index('function attemptAutoDelivery',a)
t=s[a:b].replace('WBContract.parseCommand(commandText)','WBCommandProtocol.parse(commandText)').replace('WBContract.commandFingerprint(parsed)','parsed.fingerprint').replace('executeWildberriesCore(commandText)',"executeWorkPlan(commandText, {mode:'auto',key,id:runId,tabId:senderTabId})").replace('buildAutoExecutionErrorResult(parsed, fingerprint,','buildAutoExecutionErrorResult(parsed.entries[0].command, fingerprint,')
s=s[:a]+t+s[b:]
# Clear prior batch metadata when accepting a NEW single or multi-command plan.
s=s.replace('      last_operation: parsed.operation,', '      command_batch: null,\n      last_operation: parsed.operation,',1)
# Preserve the old isolated blocked-alias admission while mixed batches retain local rows.
s=s.replace('const parsed = WBCommandProtocol.parse(commandText);', '''const parsed = WBCommandProtocol.parse(commandText);
  if (parsed.entries.length === 1 && parsed.entries[0].code) throw Object.assign(new Error('Operation blocked locally.'), {code:parsed.entries[0].code});''',1)
s=s.replace('try { parsed = WBCommandProtocol.parse(commandText); }', '''try { parsed = WBCommandProtocol.parse(commandText);
    if (parsed.entries.length === 1 && parsed.entries[0].code) throw Object.assign(new Error('Operation blocked locally.'), {code:parsed.entries[0].code});
  }''',1)
# Recovery: preserve known results and interrupt only not-started/uncertain items.
needle='''    if (current.request_worker_session_id && current.request_worker_session_id !== WORKER_SESSION_ID) {
      current = await mutateManualOperation'''
repl='''    if (current.request_worker_session_id && current.request_worker_session_id !== WORKER_SESSION_ID) {
      if (current.command_batch) {
        await assertRunBinding(current);
        const result = await recoverSavedBatch(current);
        const prefixed = await applyPrefixToReport(current.conversation_key, result.report_text);
        current = await mutateManualOperation(current.conversation_key, (r) => {
          if (!r || r.operation_id !== current.operation_id || r.status !== 'requesting') return r;
          return {...r, status:'delivering', request_id:result.request_id, delivery_id:'manual-delivery-'+r.operation_id, outgoing_text:prefixed.outgoing_text, report_prefix_applied:prefixed.report_prefix_applied, request_worker_session_id:null};
        });
        return {owner:true,rebound:owner.rebound===true,operation:current,recovery:manualDeliveryRecoveryPayload(current)};
      }
      current = await mutateManualOperation'''
assert needle in s;s=s.replace(needle,repl,1)
needle='''  if (decision.type === "unsafe_request_outcome") {
    const failed'''
repl='''  if (decision.type === "unsafe_request_outcome") {
    if (run.command_batch) {
      const result = await recoverSavedBatch(run);
      const prefixed = await applyPrefixToReport(run.conversation_key, result.report_text);
      const hash = await sha256Hex(prefixed.outgoing_text);
      const restored = await mutateAutoRun(run.conversation_key, (r) => {
        if (!r || r.run_id !== run.run_id || r.status !== 'requesting') return r;
        const claimed = BridgeAutorunModel.claimDelivery(r, {deliveryId:'batch-delivery-'+result.request_id,requestId:result.request_id,outgoingText:prefixed.outgoing_text,outgoingHash:hash,reportPrefixApplied:prefixed.report_prefix_applied});
        claimed.request_worker_session_id=null;return claimed;
      });
      return deliveryRecoveryPayload(restored, 'deliver_claimed');
    }
    const failed'''
assert needle in s;s=s.replace(needle,repl,1)
p.write_text(s)
p=root/'manifest.json';m=json.loads(p.read_text());js=m['content_scripts'][0]['js'];i=js.index('shared/wb_contract.js')+1;js.insert(i,'shared/wb_command_protocol.js');p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
