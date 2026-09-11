#!/usr/bin/env python3
"""Patch error-result creation; preserves provider calls and existing WB operation registry."""
import hashlib,sys
from pathlib import Path
root=Path(sys.argv[1]).resolve();p=root/'service_worker.js';s=p.read_text()
expected='78350a7425c8806124133473014e83c4685bb41a9aa95da40e8794ef4c61be2c'
if hashlib.sha256(p.read_bytes()).hexdigest()!=expected:raise SystemExit('Expected block002 worker')
old='const safe = WBContract.safeBridgeErrorPayload(error, Number(error?.http_status || 0));'
if s.count(old)!=2:raise SystemExit('Unexpected error payload consumers')
s=s.replace(old,'const safe = safeExecutionError(error);')
start=s.index('function buildAutoExecutionErrorResult(')
s=s[:start]+'''// Error metadata belongs to this worker path; the contract's redacted error
// payload intentionally has no HTTP status. Never invent status 200 for a fetch failure.
function safeExecutionError(error) {
  const status = Number(error?.http_status);
  const httpStatus = Number.isInteger(status) && status >= 100 && status <= 599 ? status : 0;
  return Object.freeze({ ...WBContract.safeBridgeErrorPayload(error), http_status: httpStatus });
}

'''+s[start:]
s=s.replace('  const preflight = WBContract.preflightExecution(command);','  WBContract.preflightExecution(command);\n  const meta = WBContract.resolveOperation(command.operation);',1)
s=s.replace('      host_alias: "seller_api",\n      http_method: preflight.meta.method,','      host_alias: meta.host,\n      http_method: meta.method,',1)
p.write_text(s)
print('BLOCK003_APPLIED',hashlib.sha256(p.read_bytes()).hexdigest())
