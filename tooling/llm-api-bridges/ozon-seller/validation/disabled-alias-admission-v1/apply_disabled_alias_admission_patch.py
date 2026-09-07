#!/usr/bin/env python3
from pathlib import Path

ROOT = Path('tooling/llm-api-bridges/ozon-seller/dist-step7-candidate')
contract_path = ROOT / 'shared' / 'ozon_contract.js'
sw_path = ROOT / 'service_worker.js'

contract = contract_path.read_text(encoding='utf-8')
sw = sw_path.read_text(encoding='utf-8')

old_discovery = '''        try {\n          const command = parseCommand(commandText);\n          discovered.push(Object.freeze({'''
new_discovery = '''        try {\n          const command = parseCommand(commandText);\n          preflightExecution(command);\n          discovered.push(Object.freeze({'''
assert contract.count(old_discovery) == 1, f'discovery preflight source count={contract.count(old_discovery)}'
contract = contract.replace(old_discovery, new_discovery, 1)

anchor = 'function processAutoBatch(conversationKey, runId) {'
assert sw.count(anchor) == 1, f'processAutoBatch anchor count={sw.count(anchor)}'
helper = '''function launchBatchProcessor(ownerKind, conversationKey, ownerId, source = "batch_launch") {\n  const kind = String(ownerKind || "");\n  return Promise.resolve().then(() => {\n    if (kind === "manual") return processManualBatch(conversationKey, ownerId);\n    if (kind === "autorun") return processAutoBatch(conversationKey, ownerId);\n    throw Object.assign(new Error("Неизвестный тип batch owner."), { code: "BATCH_OWNER_KIND_INVALID" });\n  }).catch(async (error) => {\n    const safe = OzonContract.safeBridgeErrorPayload(error, Number(error?.http_status || 0));\n    const code = String(safe?.code || "BATCH_PROCESSOR_FAILED");\n    const message = String(safe?.message || "Batch processor failed.");\n    await diagnostic("BATCH_PROCESSOR_UNCAUGHT", {\n      owner_kind: kind || null,\n      owner_id: String(ownerId || ""),\n      code,\n      source: String(source || "batch_launch")\n    }, { level: "error" }).catch(() => null);\n    try {\n      if (kind === "manual") await failManualBatch(conversationKey, ownerId, code, message);\n      else if (kind === "autorun") await markRunError(normalizeConversationKey(conversationKey), code, message);\n    } catch (_) {}\n    return { ok: false, code, owner_kind: kind || null, owner_id: String(ownerId || "") };\n  });\n}\n\n'''
sw = sw.replace(anchor, helper + anchor, 1)

replacements = {
    'void processManualBatch(key, operationId);': 'launchBatchProcessor("manual", key, operationId, "manual_admission");',
    'setTimeout(() => { void processManualBatch(conversationKey, operation.operation_id); }, 0);': 'setTimeout(() => { launchBatchProcessor("manual", conversationKey, operation.operation_id, "quota_wake"); }, 0);',
    'setTimeout(() => { void processManualBatch(current.conversation_key, current.operation_id); }, 0);': 'setTimeout(() => { launchBatchProcessor("manual", current.conversation_key, current.operation_id, "manual_recovery"); }, 0);',
    'void processAutoBatch(key, runId);': 'launchBatchProcessor("autorun", key, runId, "autorun_admission");',
    'setTimeout(() => { void processAutoBatch(conversationKey, run.run_id); }, 0);': 'setTimeout(() => { launchBatchProcessor("autorun", conversationKey, run.run_id, "quota_wake"); }, 0);',
    'setTimeout(() => { void processAutoBatch(run.conversation_key, run.run_id); }, 0);': 'setTimeout(() => { launchBatchProcessor("autorun", run.conversation_key, run.run_id, "autorun_recovery"); }, 0);',
}
for old, new in replacements.items():
    count = sw.count(old)
    assert count == 1, f'call-site count={count}: {old}'
    sw = sw.replace(old, new, 1)

assert 'void processManualBatch(' not in sw, 'unmanaged manual batch launch remains'
assert 'void processAutoBatch(' not in sw, 'unmanaged autorun batch launch remains'
assert contract.count('preflightExecution(command);\n          discovered.push') == 1
assert sw.count('function launchBatchProcessor(') == 1

contract_path.write_text(contract, encoding='utf-8')
sw_path.write_text(sw, encoding='utf-8')
print('PATCH_DISABLED_ALIAS_DISCOVERY_PREFLIGHT_APPLIED')
print('PATCH_BATCH_UNCAUGHT_TERMINALIZATION_APPLIED')
