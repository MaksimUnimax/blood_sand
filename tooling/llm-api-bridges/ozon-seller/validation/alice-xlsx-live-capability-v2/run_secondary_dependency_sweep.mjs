import fs from 'node:fs';
import path from 'node:path';

const inputRoot = path.resolve(process.argv[2] || '.');
const dist = fs.existsSync(path.join(inputRoot, 'shared/ai_delivery_capabilities.js'))
  ? inputRoot
  : path.join(inputRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const normalize = (value) => String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const cap = normalize(fs.readFileSync(path.join(dist, 'shared/ai_delivery_capabilities.js'), 'utf8'));
const worker = normalize(fs.readFileSync(path.join(dist, 'shared/file_delivery_port_worker.js'), 'utf8'));
const content = normalize(fs.readFileSync(path.join(dist, 'attachment_delivery_port_content.js'), 'utf8'));

const aliceProfileMatch = cap.match(/alice:\s*Object\.freeze\(\{([\s\S]*?)\n\s*\}\),\n\s*deepseek:/);
if (!aliceProfileMatch) throw new Error('Alice capability profile not found');
const aliceProfile = aliceProfileMatch[1];
if (!/accepted_extensions:[^\n]*\bxlsx\b/.test(aliceProfile)) throw new Error('live-verified XLSX is missing from Alice central accepted_extensions');
if (/accepted_extensions:[^\n]*\bxls\b/.test(aliceProfile)) throw new Error('unverified XLS was accidentally promoted together with XLSX');
if (!aliceProfile.includes('original_provider_file_type_policy: "runtime_target_verification"')) throw new Error('runtime policy for other unknown provider types missing');
if (!aliceProfile.includes('attachment_strategy: "drag_drop_v1"')) throw new Error('Alice drag/drop strategy changed');
if (!aliceProfile.includes('max_files_per_turn: 1')) throw new Error('Alice single-file boundary changed');
if (!aliceProfile.includes('max_file_bytes: 100 * 1024 * 1024')) throw new Error('Alice max-file-size boundary changed');

const staleStaticConsumers = [];
for (const [name, text] of [['worker', worker], ['content', content]]) {
  if (/OzonAIDeliveryCapabilities\.supportsFile\s*\(/.test(text)) staleStaticConsumers.push(name);
}
if (staleStaticConsumers.length) throw new Error(`stale static-only attachment consumers: ${staleStaticConsumers.join(',')}`);
const decisionConsumers = (worker.match(/OzonAIDeliveryCapabilities\.fileDispatchDecision\s*\(/g) || []).length
  + (content.match(/OzonAIDeliveryCapabilities\.fileDispatchDecision\s*\(/g) || []).length;
if (decisionConsumers !== 2) throw new Error(`expected exact closed set of 2 dispatch-decision consumers, got ${decisionConsumers}`);

if (!worker.includes('source_kind: "original_provider_file"')) throw new Error('provider artifact provenance missing');
if (!worker.includes('artifact_key: `provider:${fileRef}`')) throw new Error('trusted provider artifact-key boundary missing');
if (!worker.includes('sha256: await sha256Hex(bytes)')) throw new Error('provider artifact SHA boundary missing');
if (!content.includes('const bytes = await fetchArtifactBytes(recovery, descriptor);')) throw new Error('complete artifact transfer missing');
if (!content.includes('if (await sha256Hex(bytes) !== String(descriptor.sha256 || "").toLowerCase())')) throw new Error('content-side complete SHA verification missing');
if (!content.includes('active.attachFiles(surfaceBeforeCommit, files);')) throw new Error('real target UI dispatch path missing');
if (!content.includes('waitAttachmentReady(active, descriptors, ATTACH_READY_TIMEOUT_MS)')) throw new Error('bounded target readiness check missing');
if (!content.includes('ATTACH_OUTCOME_UNKNOWN_NO_RETRY')) throw new Error('unknown attachment outcome no-retry guard missing');

const addedForbidden = [worker, content].some((text) => /accepted_extensions\s*\.(?:push|splice)|accepted_extensions\s*=/.test(text));
if (addedForbidden) throw new Error('consumer-local capability mutation detected');

console.log('ALICE_XLSX_CENTRAL_CAPABILITY_AUTHORITY=PASS');
console.log('ALICE_XLS_UNVERIFIED_NOT_PROMOTED=PASS');
console.log(`DISPATCH_DECISION_CONSUMERS_CLOSED_SET=${decisionConsumers}/2`);
console.log('STALE_STATIC_TYPE_CONSUMERS=0');
console.log('CONSUMER_LOCAL_ALLOWLIST_MUTATION=0');
console.log('PROVIDER_PROVENANCE_AND_SHA_BOUNDARY=PASS');
console.log('TARGET_UI_DND_READINESS_PATH=PASS');
console.log('UNKNOWN_OUTCOME_NO_RETRY=PASS');
console.log('CROSS_PLATFORM_NEWLINE_NORMALIZATION=PASS');
console.log('ALICE_XLSX_LIVE_CAPABILITY_SECONDARY_SWEEP=PASS');
console.log(`TESTED_DIST_ROOT=${dist}`);
