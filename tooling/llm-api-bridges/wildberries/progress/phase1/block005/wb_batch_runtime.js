/* Explicit sequential batch engine. Storage and provider access are injected.
 * Never resumes provider execution from a saved record; recovery is result-only.
 */
(() => {
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v));
  const terminal=new Set(['completed','completed_with_errors','interrupted']);
  const allowedStates=new Set(['pending','dispatch_committed','success','error','blocked','not_executed','unknown']);
  const statusOf=e=>Number.isInteger(Number(e?.http_status)) && Number(e.http_status)>=100 && Number(e.http_status)<=599?Number(e.http_status):0;
  const codeOf=e=>/^[A-Z0-9_]{1,100}$/.test(e?.code || '')?e.code:'BATCH_ITEM_FAILED';
  function stopRemaining(record,code) {
    for(const row of record.items)if(row.state==='pending')Object.assign(row,{state:'not_executed',code,physical_request_count:0});
  }
  function validate(record) {
    if(!record || record.schema_version!==1 || typeof record.batch_id!=='string' || !Array.isArray(record.items) || record.items.length>32 || record.items.length<1)throw Object.assign(new Error('Invalid saved batch.'),{code:'BATCH_STATE_INVALID'});
    for(const [i,row] of record.items.entries())if(row.index!==i || !allowedStates.has(row.state) || !['api','help'].includes(row.kind) || !(row.physical_request_count===null || row.physical_request_count===0 || row.physical_request_count===1))throw Object.assign(new Error('Invalid saved batch item.'),{code:'BATCH_STATE_INVALID'});
  }
  function recover(saved) {
    validate(saved);const record=copy(saved);
    if(terminal.has(record.status))return record;
    for(const row of record.items)if(row.state==='dispatch_committed')Object.assign(row,{state:'unknown',code:'REQUEST_OUTCOME_UNKNOWN_NO_RETRY',physical_request_count:null});
    stopRemaining(record,'WORKER_RECREATED_NO_REPLAY');
    record.status='interrupted';record.stop_reason='WORKER_RECREATED_NO_REPLAY';return record;
  }
  function render(record) {
    validate(record);
    const known=record.items.reduce((n,r)=>n+(r.physical_request_count??0),0),unknown=record.items.filter(r=>r.physical_request_count===null).length;
    const ok=record.status==='completed' && record.items.every(r=>r.state==='success');
    const env={bridge:'wildberries-llm-api-bridge',version:globalThis.WBContract.VERSION,request_id:record.batch_id,operation:record.items.length===1?record.items[0].operation:'explicit_batch',http_status:0,request_meta:{provider:'bridge_batch',logical_command_count:record.items.length,physical_request_count:unknown?null:known,physical_request_count_min:known,physical_request_count_max:known+unknown,external_request_executed:known>0?true:unknown?null:false,automatic_retry:false},batch:record};
    return {ok,bridge_error:!ok,request_id:record.batch_id,operation:env.operation,http_status:0,report_text:'WB_RESULT_V1\n'+JSON.stringify(env,null,2),batch_status:record.status,physical_request_count:env.request_meta.physical_request_count};
  }
  async function run(plan,{persist,execute,canContinue=async()=>true,uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString()}={}) {
    const record={schema_version:1,batch_id:'batch-'+uuid(),status:'running',created_at:now(),command_fingerprint:plan.fingerprint,stop_reason:null,items:plan.entries.map(e=>({index:e.index,kind:e.kind,operation:e.operation,state:'pending',physical_request_count:0}))};
    const save=async()=>{try{await persist(copy(record))}catch(_){throw Object.assign(new Error('Batch checkpoint failed; no further requests.'),{code:'BATCH_CHECKPOINT_FAILED'})}};
    try {
      await save();let chars=0;
      for(const entry of plan.entries) {
        const row=record.items[entry.index];
        if(!(await canContinue())) { record.stop_reason='BATCH_CONTEXT_CANCELLED';stopRemaining(record,record.stop_reason);break; }
        if(entry.code) {Object.assign(row,{state:'blocked',code:entry.code});await save();continue;}
        if(entry.kind==='help') {Object.assign(row,{state:'success',result:globalThis.WBCommandProtocol.guidance(entry.command)});await save();continue;}
        let calls=0;
        try {
          const response=await execute(entry,async()=>{
            if(calls)throw Object.assign(new Error('More than one physical request blocked.'),{code:'HIDDEN_REQUEST_BLOCKED'});
            if(!(await canContinue()))throw Object.assign(new Error('Batch owner/settings changed.'),{code:'BATCH_CONTEXT_CANCELLED'});
            row.state='dispatch_committed';row.physical_request_count=null;await save();calls++;
          });
          Object.assign(row,{state:response.ok?'success':'error',physical_request_count:calls,http_status:statusOf(response),request_id:response.request_id||null,report_text:String(response.report_text||'')});
          chars+=row.report_text.length;
        } catch(error) {
          Object.assign(row,{state:calls && !statusOf(error)?'unknown':'error',code:codeOf(error),physical_request_count:calls,http_status:statusOf(error),automatic_retry:false});
          if(error.code==='BATCH_CHECKPOINT_FAILED')throw error;
        }
        await save();
        if(row.state!=='success') {record.stop_reason=row.code||'PROVIDER_ERROR';stopRemaining(record,record.stop_reason);break;}
        // Preserve this result in full, but bound aggregate delivery. No truncation.
        if(chars>4000000) {record.stop_reason='BATCH_RESULT_BUDGET_REACHED';stopRemaining(record,record.stop_reason);break;}
      }
      record.status=record.stop_reason?'interrupted':record.items.some(r=>r.state!=='success')?'completed_with_errors':'completed';
      record.completed_at=now();await save();
    } catch(error) {
      record.status='interrupted';record.stop_reason=codeOf(error);stopRemaining(record,record.stop_reason);
      // Already obtained provider truth remains in the snapshot even if storage fails.
      if(error.code==='BATCH_CHECKPOINT_FAILED')record.durability_error=true;
      try{await persist(copy(record))}catch(_){record.durability_error=true;}
    }
    return {record,response:render(record)};
  }
  globalThis.WBBatchRuntime=Object.freeze({run,recover,render,validate});
})();
