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
if (!caps || typeof caps.fileDispatchDecision !== 'function') throw new Error('runtime-aware fileDispatchDecision missing');

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

const xlsx = original('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
const aliceProfile = caps.profile('alice');
if (aliceProfile.accepted_extensions.includes('xlsx')) throw new Error('one-off XLSX allowlist patch is forbidden');
const staticXlsx = caps.supportsFile('alice', xlsx);
if (staticXlsx.supported !== false || staticXlsx.reason !== 'file_type_not_supported') throw new Error(`static support must remain truthful: ${JSON.stringify(staticXlsx)}`);
const runtimeXlsx = caps.fileDispatchDecision('alice', xlsx);
if (runtimeXlsx.dispatch_allowed !== true || runtimeXlsx.runtime_verification_required !== true || runtimeXlsx.status !== 'runtime_verification_required') throw new Error(`Alice original XLSX must reach bounded runtime target verification: ${JSON.stringify(runtimeXlsx)}`);

const csv = caps.fileDispatchDecision('alice', original('csv', 'text/csv'));
if (csv.dispatch_allowed !== true || csv.runtime_verification_required !== true) throw new Error(`policy must be source/provenance based, not XLSX-specific: ${JSON.stringify(csv)}`);

const txt = caps.fileDispatchDecision('alice', original('txt', 'text/plain'));
if (txt.dispatch_allowed !== true || txt.runtime_verification_required !== false || txt.status !== 'verified_supported') throw new Error(`preverified Alice TXT must stay verified: ${JSON.stringify(txt)}`);

const chatgptXlsx = caps.fileDispatchDecision('chatgpt', xlsx);
if (chatgptXlsx.dispatch_allowed !== true || chatgptXlsx.runtime_verification_required !== false || chatgptXlsx.status !== 'verified_supported') throw new Error(`ChatGPT XLSX regression: ${JSON.stringify(chatgptXlsx)}`);

const generatedXlsx = caps.fileDispatchDecision('alice', { ...xlsx, artifact_key: 'generated:test', source_kind: 'generated_bridge_text' });
if (generatedXlsx.dispatch_allowed !== false) throw new Error('runtime verification exemption must not apply to generated/non-provider files');
const untrustedXlsx = caps.fileDispatchDecision('alice', { ...xlsx, artifact_key: 'caller:test' });
if (untrustedXlsx.dispatch_allowed !== false) throw new Error('runtime verification exemption requires worker-owned provider artifact key');
const noIntegrity = caps.fileDispatchDecision('alice', { ...xlsx, sha256: '' });
if (noIntegrity.dispatch_allowed !== false) throw new Error('runtime verification exemption requires integrity-backed provider artifact');
const genericBin = caps.fileDispatchDecision('alice', original('bin', 'application/octet-stream'));
if (genericBin.dispatch_allowed !== false) throw new Error('generic/ambiguous binary must remain fail-closed');
const oversized = caps.fileDispatchDecision('alice', original('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 101 * MiB));
if (oversized.dispatch_allowed !== false || oversized.reason !== 'file_too_large_for_adapter') throw new Error(`size guard must dominate runtime type verification: ${JSON.stringify(oversized)}`);

const worker = fs.readFileSync(workerPath, 'utf8');
const content = fs.readFileSync(contentPath, 'utf8');
if (!worker.includes('OzonAIDeliveryCapabilities.fileDispatchDecision(delivery.adapter_id, record)')) throw new Error('worker preflight consumer is not routed through fileDispatchDecision');
if (!content.includes('OzonAIDeliveryCapabilities.fileDispatchDecision(active.id, descriptor)')) throw new Error('content preflight consumer is not routed through fileDispatchDecision');
if (worker.includes('OzonAIDeliveryCapabilities.supportsFile(delivery.adapter_id, record)')) throw new Error('stale worker static-only decision remains');
if (content.includes('OzonAIDeliveryCapabilities.supportsFile(active.id, descriptor)')) throw new Error('stale content static-only decision remains');
if (!content.includes('active.attachFiles(surfaceBeforeCommit, files);')) throw new Error('real target UI dispatch path missing');
if (!content.includes('waitAttachmentReady(active, descriptors, ATTACH_READY_TIMEOUT_MS)')) throw new Error('bounded runtime readiness verification missing');

console.log('POSTFIX_ALICE_ORIGINAL_PROVIDER_RUNTIME_CAPABILITY=PASS');
console.log('STATIC_XLSX_SUPPORT_REMAINS_UNPROVEN=PASS');
console.log('ORIGINAL_PROVIDER_RUNTIME_VERIFICATION_GENERALIZED=PASS');
console.log('NO_XLSX_ALLOWLIST_COSTYL=PASS');
console.log('SIZE_AND_PROVENANCE_FAIL_CLOSED=PASS');
console.log('WORKER_CONTENT_DECISION_CONSUMERS=2/2');
console.log(`TESTED_DIST_ROOT=${dist}`);
