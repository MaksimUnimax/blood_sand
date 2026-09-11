import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.argv[2] || '.');
const dist = path.join(repoRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const capPath = path.join(dist, 'shared/ai_delivery_capabilities.js');
const workerPath = path.join(dist, 'shared/file_delivery_port_worker.js');
const contentPath = path.join(dist, 'attachment_delivery_port_content.js');
const cap = fs.readFileSync(capPath, 'utf8');
const worker = fs.readFileSync(workerPath, 'utf8');
const content = fs.readFileSync(contentPath, 'utf8');

const staleStaticConsumers = [];
for (const [name, text] of [['worker', worker], ['content', content]]) {
  if (/OzonAIDeliveryCapabilities\.supportsFile\s*\(/.test(text)) staleStaticConsumers.push(name);
}
if (staleStaticConsumers.length) throw new Error(`stale static-only attachment consumers: ${staleStaticConsumers.join(',')}`);

const decisionConsumers = (worker.match(/OzonAIDeliveryCapabilities\.fileDispatchDecision\s*\(/g) || []).length
  + (content.match(/OzonAIDeliveryCapabilities\.fileDispatchDecision\s*\(/g) || []).length;
if (decisionConsumers !== 2) throw new Error(`expected exact closed set of 2 dispatch-decision consumers, got ${decisionConsumers}`);

const aliceProfileMatch = cap.match(/alice:\s*Object\.freeze\(\{([\s\S]*?)\n\s*\}\),\n\s*deepseek:/);
if (!aliceProfileMatch) throw new Error('Alice capability profile not found');
const aliceProfile = aliceProfileMatch[1];
if (/accepted_extensions:[^\n]*\bxlsx\b/.test(aliceProfile)) throw new Error('XLSX was hardcoded into Alice accepted_extensions');
if (!aliceProfile.includes('original_provider_file_type_policy: "runtime_target_verification"')) throw new Error('Alice runtime provider-file type policy missing');

if (!worker.includes('source_kind: "original_provider_file"')) throw new Error('worker no longer preserves provider artifact provenance');
if (!worker.includes('artifact_key: `provider:${fileRef}`')) throw new Error('trusted provider artifact key boundary missing');
if (!worker.includes('sha256: await sha256Hex(bytes)')) throw new Error('provider artifact integrity boundary missing');
if (!content.includes('const bytes = await fetchArtifactBytes(recovery, descriptor);')) throw new Error('content no longer verifies complete artifact bytes before File creation');
if (!content.includes('if (await sha256Hex(bytes) !== String(descriptor.sha256 || "").toLowerCase())')) throw new Error('content SHA-256 verification missing');
if (!content.includes('active.attachFiles(surfaceBeforeCommit, files);')) throw new Error('runtime target transport missing');
if (!content.includes('ATTACH_OUTCOME_UNKNOWN_NO_RETRY')) throw new Error('unknown attachment outcome fail-closed/no-retry guard missing');

console.log(`DISPATCH_DECISION_CONSUMERS_CLOSED_SET=${decisionConsumers}/2`);
console.log('STALE_STATIC_TYPE_CONSUMERS=0');
console.log('ALICE_XLSX_ALLOWLIST_COSTYL=0');
console.log('PROVIDER_PROVENANCE_AND_SHA_BOUNDARY=PASS');
console.log('RUNTIME_TARGET_UI_VERIFICATION_PATH=PASS');
console.log('UNKNOWN_OUTCOME_NO_RETRY=PASS');
console.log('ALICE_ORIGINAL_PROVIDER_RUNTIME_CAPABILITY_SECONDARY_SWEEP=PASS');
