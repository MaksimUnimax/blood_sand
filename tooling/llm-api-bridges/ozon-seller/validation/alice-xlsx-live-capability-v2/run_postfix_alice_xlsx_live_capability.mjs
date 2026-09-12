import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const inputRoot = path.resolve(process.argv[2] || '.');
const dist = fs.existsSync(path.join(inputRoot, 'shared/ai_delivery_capabilities.js'))
  ? inputRoot
  : path.join(inputRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const capabilityPath = path.join(dist, 'shared/ai_delivery_capabilities.js');
const workerPath = path.join(dist, 'shared/file_delivery_port_worker.js');
const contentPath = path.join(dist, 'attachment_delivery_port_content.js');

const context = vm.createContext({ console, TextEncoder, URL });
context.globalThis = context;
vm.runInContext(fs.readFileSync(capabilityPath, 'utf8'), context, { filename: capabilityPath });
const caps = context.OzonAIDeliveryCapabilities;
if (!caps || typeof caps.fileDispatchDecision !== 'function') throw new Error('central fileDispatchDecision missing');

const MiB = 1024 * 1024;
const sha = 'a'.repeat(64);
const original = (extension, mime, byteLength = 7924) => ({
  artifact_key: `provider:rpf_s_${extension}`,
  source_kind: 'original_provider_file',
  filename: `REPORT.${extension}`,
  mime_type: mime,
  extension,
  byte_length: byteLength,
  sha256: sha,
  complete: true
});

const aliceProfile = caps.profile('alice');
if (!aliceProfile?.accepted_extensions?.includes('xlsx')) throw new Error('owner-live-verified Alice XLSX capability missing from central profile');
if (!aliceProfile.accepted_extensions.includes('txt') || !aliceProfile.accepted_extensions.includes('pdf') || !aliceProfile.accepted_extensions.includes('doc') || !aliceProfile.accepted_extensions.includes('docx')) throw new Error('pre-existing Alice accepted types regressed');
if (aliceProfile.attachment_strategy !== 'drag_drop_v1') throw new Error('Alice attachment strategy changed unexpectedly');
if (aliceProfile.max_files_per_turn !== 1) throw new Error('Alice max-files guard changed unexpectedly');
if (aliceProfile.max_file_bytes !== 100 * MiB) throw new Error('Alice max-size guard changed unexpectedly');
if (aliceProfile.original_provider_file_type_policy !== 'runtime_target_verification') throw new Error('runtime verification policy for still-unknown provider types was removed');

const xlsxOctet = original('xlsx', 'application/octet-stream');
const staticXlsx = caps.supportsFile('alice', xlsxOctet);
if (staticXlsx.supported !== true || staticXlsx.status !== 'supported') throw new Error(`Alice XLSX static support must follow live evidence: ${JSON.stringify(staticXlsx)}`);
const xlsxDispatch = caps.fileDispatchDecision('alice', xlsxOctet);
if (xlsxDispatch.dispatch_allowed !== true || xlsxDispatch.runtime_verification_required !== false || xlsxDispatch.status !== 'verified_supported') throw new Error(`Alice XLSX must be verified-supported independent of generic MIME: ${JSON.stringify(xlsxDispatch)}`);

const xlsxCanonicalMime = caps.fileDispatchDecision('alice', original('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
if (xlsxCanonicalMime.dispatch_allowed !== true || xlsxCanonicalMime.status !== 'verified_supported') throw new Error('canonical XLSX MIME path regressed');

const csvProvider = caps.fileDispatchDecision('alice', original('csv', 'text/csv'));
if (csvProvider.dispatch_allowed !== true || csvProvider.runtime_verification_required !== true || csvProvider.status !== 'runtime_verification_required') throw new Error(`unknown original-provider type must retain bounded runtime verification: ${JSON.stringify(csvProvider)}`);

const genericBin = caps.fileDispatchDecision('alice', original('bin', 'application/octet-stream'));
if (genericBin.dispatch_allowed !== false) throw new Error('opaque provider .bin must remain fail-closed');
const oversized = caps.fileDispatchDecision('alice', original('xlsx', 'application/octet-stream', 100 * MiB + 1));
if (oversized.dispatch_allowed !== false || oversized.reason !== 'file_too_large_for_adapter') throw new Error(`size guard must dominate XLSX support: ${JSON.stringify(oversized)}`);

const worker = fs.readFileSync(workerPath, 'utf8');
const content = fs.readFileSync(contentPath, 'utf8');
if (!worker.includes('OzonAIDeliveryCapabilities.fileDispatchDecision(delivery.adapter_id, record)')) throw new Error('worker is not routed through central dispatch authority');
if (!content.includes('OzonAIDeliveryCapabilities.fileDispatchDecision(active.id, descriptor)')) throw new Error('content is not routed through central dispatch authority');
if (!content.includes('active.attachFiles(surfaceBeforeCommit, files);')) throw new Error('real File/DataTransfer target dispatch path missing');
if (!content.includes('waitAttachmentReady(active, descriptors, ATTACH_READY_TIMEOUT_MS)')) throw new Error('bounded target attachment readiness verification missing');
if (!content.includes('ATTACH_OUTCOME_UNKNOWN_NO_RETRY')) throw new Error('unknown target outcome no-retry guard missing');

console.log('ALICE_XLSX_OWNER_LIVE_CAPABILITY=PASS');
console.log('ALICE_XLSX_OCTET_STREAM_STATIC_SUPPORT=PASS');
console.log('ALICE_XLSX_CANONICAL_MIME_SUPPORT=PASS');
console.log('UNKNOWN_PROVIDER_RUNTIME_VERIFICATION_RETAINED=PASS');
console.log('OPAQUE_PROVIDER_FAIL_CLOSED=PASS');
console.log('ALICE_SIZE_AND_COUNT_GUARDS_RETAINED=PASS');
console.log('WORKER_CONTENT_CENTRAL_DECISION_CONSUMERS=2/2');
console.log('TARGET_DND_AND_READINESS_PATH_RETAINED=PASS');
console.log('UNKNOWN_OUTCOME_NO_RETRY=PASS');
console.log(`TESTED_DIST_ROOT=${dist}`);
