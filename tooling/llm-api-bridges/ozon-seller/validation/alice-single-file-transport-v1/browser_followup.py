"""Test-only correction layered over the frozen candidate; no runtime edits."""
import pathlib,hashlib
p=pathlib.Path('tooling/llm-api-bridges/ozon-seller/validation/alice-single-file-v1/browser.mjs')
s=p.read_text();assert hashlib.sha256(p.read_bytes()).hexdigest()=='b959d7cd17be35284ece95f6284dcf420d993ca9e3dad8a7978d225716ffee30'
needle=' assert.equal(local.batch.entries[0].http_status,0);assert.equal(local.batch.entries[0].external_request_executed,false);'
assert s.count(needle)==1
replacement=''' const localReceipt=JSON.parse(local.batch.entries[0].report_text.slice('OZON_RESULT_V1\\n'.length));
 const observedOwner=await evaluate(workerSession,`getManualOperation(${JSON.stringify(origin+'|'+conversation)})`);
 const diag={receipt:localReceipt.result,returned:{id:local.operation_id,status:local.status,mode:local.delivery?.mode},stored:{id:observedOwner?.operation_id,status:observedOwner?.status,mode:observedOwner?.delivery?.mode}};
 assert.equal(localReceipt.result?.delivery?.state,'local_file_ready',JSON.stringify(diag));
 assert.equal(local.delivery?.mode,'attachment_watch_v1',JSON.stringify(diag));
 assert.equal(observedOwner?.operation_id,local.operation_id,JSON.stringify(diag));
 assert.equal(local.batch.entries[0].http_status,0);assert.equal(local.batch.entries[0].external_request_executed,false);'''
p.write_text(s.replace(needle,replacement),encoding='utf-8')
print('BROWSER_SEMANTIC_RECEIPT_ASSERTION_ADDED_NO_PRODUCTION_CHANGE')
