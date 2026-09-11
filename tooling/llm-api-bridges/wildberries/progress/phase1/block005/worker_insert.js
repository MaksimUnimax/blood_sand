// Every plan is reparsed in the worker; content-supplied plans are never trusted.
async function executeWorkPlan(commandText, context) {
  const plan = WBCommandProtocol.parse(commandText);
  if (plan.entries.length === 1 && plan.entries[0].kind === 'api' && !plan.entries[0].code) {
    return executeWildberriesCore(plan.entries[0].command_text);
  }
  const settings = await getSettings();
  const credentialsAtStart = JSON.stringify(settings.sellerCredentials);
  const canContinue = async () => {
    const record = context.mode === 'manual' ? await getManualOperation(context.key) : await getAutoRun(context.key);
    if (!record || (record.operation_id || record.run_id) !== context.id || record.status !== 'requesting' || record.pause_requested || record.finish_requested) return false;
    if (record.request_worker_session_id !== WORKER_SESSION_ID) return false;
    try {
      await assertTabConversation(context.tabId, context.key, record.conversation_id);
      await assertRunBinding(record);
    } catch (_) { return false; }
    if (context.mode === 'manual' && !(await getManualMode(context.key))) return false;
    if (context.mode === 'auto' && await getManualMode(context.key)) return false;
    return JSON.stringify((await getSettings()).sellerCredentials) === credentialsAtStart;
  };
  const persist = async (snapshot) => {
    const checksum = await sha256Hex(JSON.stringify(snapshot)); let saved = false;
    const mutate = context.mode === 'manual' ? mutateManualOperation : mutateAutoRun;
    await mutate(context.key, (current) => {
      if (!current || (current.operation_id || current.run_id) !== context.id || current.status !== 'requesting' || current.request_worker_session_id !== WORKER_SESSION_ID) return current;
      saved = true; return {...current, auto_send:settings.autoSend, command_batch: {snapshot, sha256: checksum}};
    });
    if (!saved) throw Object.assign(new Error('Batch ownership changed.'), {code:'BATCH_OWNER_CHANGED'});
  };
  const result = await WBBatchRuntime.run(plan, {persist, canContinue, execute: async (entry, beforeDispatch) => {
    // A fresh provider receives the unchanged WB serializer, auth and transport.
    // The wrapper counts the actual fetch boundary and rejects a second dispatch.
    let boundaryError = null;
    const provider = WBProviderFactory.createWBProvider({fetchImpl: async (...args) => {
      try { await beforeDispatch(); } catch (error) { boundaryError = error; throw error; }
      return fetch(...args);
    }});
    try { return await provider.executeCommand(entry.command_text, settings.sellerCredentials); }
    catch (error) { throw boundaryError || error; }
  }});
  await diagnostic('EXPLICIT_BATCH_TERMINAL', {batch_id:result.record.batch_id,status:result.record.status,logical_count:plan.entries.length,physical_request_count:result.response.physical_request_count});
  return {...result.response, auto_send:settings.autoSend};
}

async function recoverSavedBatch(record) {
  const saved = record.command_batch;
  if (!saved?.snapshot || !saved.sha256 || await sha256Hex(JSON.stringify(saved.snapshot)) !== saved.sha256) {
    if (record.operation_id) await mutateManualOperation(record.conversation_key, r => r?.operation_id === record.operation_id ? {...r,status:'failed',last_error:{code:'BATCH_INTEGRITY_MISMATCH',message:'Saved batch corrupt; no replay.'}} : r);
    else await markRunError(record.conversation_key,'BATCH_INTEGRITY_MISMATCH','Saved batch corrupt; no replay.');
    throw Object.assign(new Error('Saved batch integrity mismatch; no replay.'), {code:'BATCH_INTEGRITY_MISMATCH'});
  }
  return WBBatchRuntime.render(WBBatchRuntime.recover(saved.snapshot));
}

