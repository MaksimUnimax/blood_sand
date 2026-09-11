import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(process.argv[2] || '.');
const dist = path.join(repoRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const capabilityPath = path.join(dist, 'shared/ai_delivery_capabilities.js');

const context = vm.createContext({ console, TextEncoder, URL });
context.globalThis = context;
vm.runInContext(fs.readFileSync(capabilityPath, 'utf8'), context, { filename: capabilityPath });

const caps = context.OzonAIDeliveryCapabilities;
if (!caps) throw new Error('OzonAIDeliveryCapabilities missing');

const descriptor = {
  artifact_key: 'provider:rpf_s_runtime_probe',
  source_kind: 'original_provider_file',
  filename: 'REPORT_seller_placement.xlsx',
  mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  extension: 'xlsx',
  byte_length: 7924,
  sha256: '0'.repeat(64),
  complete: true
};

const staticDecision = caps.supportsFile('alice', descriptor);
if (staticDecision?.supported !== false || staticDecision?.reason !== 'file_type_not_supported') {
  throw new Error(`pre-fix reproduction requires Alice static XLSX rejection; got ${JSON.stringify(staticDecision)}`);
}

if (typeof caps.fileDispatchDecision !== 'function') {
  console.error('PREFX_ALICE_ORIGINAL_PROVIDER_RUNTIME_CAPABILITY=FAIL');
  console.error('ROOT_CAUSE=STATIC_TARGET_EXTENSION_ALLOWLIST_BLOCKS_ORIGINAL_PROVIDER_FILE_BEFORE_RUNTIME_UI');
  throw new Error('Missing runtime-aware dispatch decision: original Ozon XLSX is rejected before File/DataTransfer/drop can reach Alice UI.');
}

const dispatch = caps.fileDispatchDecision('alice', descriptor);
if (dispatch?.dispatch_allowed !== true || dispatch?.runtime_verification_required !== true) {
  console.error('PREFX_ALICE_ORIGINAL_PROVIDER_RUNTIME_CAPABILITY=FAIL');
  console.error(JSON.stringify({ staticDecision, dispatch }, null, 2));
  throw new Error('Original provider XLSX must be eligible for bounded runtime target verification without claiming static support.');
}

console.log('PREFX_ALICE_ORIGINAL_PROVIDER_RUNTIME_CAPABILITY=PASS');
