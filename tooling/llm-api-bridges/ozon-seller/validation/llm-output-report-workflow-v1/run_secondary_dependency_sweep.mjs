import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const repo = process.argv[2] || '.';
const root = path.join(repo, 'tooling/llm-api-bridges/ozon-seller');
const dist = path.join(root, 'dist-step7-candidate');
const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8');

const context = vm.createContext({ console, TextEncoder, TextDecoder, crypto: globalThis.crypto, setTimeout, clearTimeout });
context.globalThis = context;
for (const file of [
  'shared/runtime_names.js',
  'shared/ozon_operation_registry.js',
  'shared/ozon_guidance.js',
  'shared/bridge_autorun_model.js',
  'shared/llm_output_report_workflow_patch.js'
]) vm.runInContext(read(file), context, { filename: file });

const Registry = context.OzonOperationRegistry;
const Patch = context.OzonLlmOutputReportWorkflowPatch;
assert.ok(Registry?.OPERATIONS && Patch, 'registry/patch unavailable');

// Closed-set seller report create audit: every current report_*_create route must be explicitly classified.
const discoveredReportCreates = Object.keys(Registry.OPERATIONS).filter((alias) => /^report_.*_create(?:_v\d+)?$/.test(alias)).sort();
const patchedReportCreates = [...Patch.REPORT_CREATE_OPERATIONS].sort();
assert.deepEqual(patchedReportCreates, discoveredReportCreates, `report create closed-set drift\nregistry=${JSON.stringify(discoveredReportCreates)}\npatch=${JSON.stringify(patchedReportCreates)}`);

// All provider URL-to-opaque-ref generated document resolvers must be understood by the LLM continuation layer.
const providerSource = read('shared/ozon_provider.js');
const generatedMapMatch = providerSource.match(/const GENERATED_DOCUMENT_URL_FIELD_BY_OPERATION = Object\.freeze\(\{([\s\S]*?)\}\);/);
assert.ok(generatedMapMatch, 'provider generated-document map not found');
const providerResolvers = [...generatedMapMatch[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map((m) => m[1]).sort();
const patchedResolvers = Object.keys(Patch.GENERATED_DOCUMENT_RESOLVERS).sort();
assert.deepEqual(patchedResolvers, providerResolvers, `generated resolver closed-set drift\nprovider=${JSON.stringify(providerResolvers)}\npatch=${JSON.stringify(patchedResolvers)}`);

// Every explicit create->resolver mapping must target a provider-known generated-document resolver and use result-derived fields only.
for (const [createOperation, workflow] of Object.entries(Patch.GENERATED_DOCUMENT_CREATE_WORKFLOWS)) {
  assert.ok(Registry.OPERATIONS[createOperation], `mapped create operation missing from registry: ${createOperation}`);
  assert.ok(providerResolvers.includes(workflow.next_operation), `mapped resolver not registered by provider: ${workflow.next_operation}`);
  assert.ok(Array.isArray(workflow.fields) && workflow.fields.length > 0, `workflow dependency fields missing: ${createOperation}`);
}

// Core report chain authorities are present and file transport remains opaque.
assert.equal(Registry.OPERATIONS.report_info?.path, '/v1/report/info');
assert.equal(Registry.OPERATIONS.report_file_get?.provider, 'report_file');
assert.equal(Registry.OPERATIONS.report_file_get?.request_style, 'opaque_file_ref');
assert.match(providerSource, /report_file_ref:\s*fileRef/);
assert.match(providerSource, /shouldRedactResultField|sanitizeResult/);
assert.doesNotMatch(read('shared/llm_output_report_workflow_patch.js'), /https?:\/\//i, 'workflow patch must not embed provider URLs');
assert.doesNotMatch(read('shared/llm_output_report_workflow_patch.js'), /\bfetch\s*\(/, 'workflow patch must never perform provider/file fetch');
assert.doesNotMatch(read('shared/llm_output_report_workflow_patch.js'), /OZ_EXECUTE_COMMAND|executeCommandObject|executeManualCommand/, 'workflow patch must not auto-execute continuation commands');

// Worker load order: base worker first, then output wrapper, then file-delivery wrappers.
const entrySource = read('service_worker_entry.js');
const baseAt = entrySource.indexOf('importScripts("service_worker.js")');
const llmAt = entrySource.indexOf('importScripts("shared/llm_output_report_workflow_patch.js")');
const directAt = entrySource.indexOf('importScripts("shared/direct_binary_file_delivery_patch.js")');
assert.ok(baseAt >= 0 && llmAt > baseAt && directAt > llmAt, 'worker wrapper load order invalid');

// Both manual and autorun batch deliveries use the same combined-report -> output-wrapper boundary.
const workerSource = read('service_worker.js');
assert.match(workerSource, /async function finalizeAutoBatch[\s\S]*?formatCombinedBatchReport\(entries, batchSnapshot\)[\s\S]*?applyPrefixToReport\(key, combinedReport\)/);
assert.match(workerSource, /async function finalizeManualBatch[\s\S]*?formatCombinedBatchReport\(entries, batchSnapshot\)[\s\S]*?applyPrefixToReport\(key, combinedReport\)/);
assert.match(workerSource, /function applyPrefixToReport|async function applyPrefixToReport/);
assert.match(workerSource, /BridgeAutorunModel\.applyReportPrefix\(reportText, prefix\)/);

// The output contract is inserted before delivery hashing/commit, so integrity covers the final text.
const autoPrefixAt = workerSource.indexOf('const prefixed = await applyPrefixToReport(key, reportText)');
const autoHashAt = workerSource.indexOf('const outgoingHash = await sha256Hex(prefixed.outgoing_text)', autoPrefixAt);
assert.ok(autoPrefixAt >= 0 && autoHashAt > autoPrefixAt, 'pre-execution output tail is not covered by outgoing hash');

// Existing extension-owned Ozon button remains whole-block manual ingress.
const contentSource = read('content_script.js');
assert.match(contentSource, /ozon-bridge-block-action/);
assert.match(contentSource, /Ozon Bridge — выполнить команды из этого code block/);
assert.match(contentSource, /const text = commandText\(binding\)/);
assert.match(contentSource, /sendRuntime\("OZ_EXECUTE_COMMAND",\s*\{\s*command_text:\s*text/);
assert.match(contentSource, /BUSY_BLOCKS\.has\(blockNode\)/);

// Stored default prompt migrates automatically; custom prompts remain custom.
assert.match(workerSource, /current\.is_default === true && normalizedText !== DEFAULT_AUTO_START_TEXT/);
assert.match(workerSource, /is_default:\s*current\.is_default === true/);

// Mixed HELP/API and command envelopes still use the existing parser; the workflow patch does not parse assistant commands.
assert.doesNotMatch(read('shared/llm_output_report_workflow_patch.js'), /OZON_HELP_V2|OZON_API_V1/, 'output wrapper must not become a second command parser');

// Direct binary transport already captures bytes once; new continuation layer must treat generated_file_inline as terminal.
const directSource = read('shared/direct_binary_file_delivery_patch.js');
assert.match(directSource, /generated_file_inline = true/);
const directPayload = `OZON_RESULT_V1\n${JSON.stringify({ operation: 'performance_daily_csv', http_status: 200, result: { generated_file_inline: true, generated_file_ref: 'rpf_s_binary123' } })}`;
const directInstruction = Patch.instructionPayload(directPayload);
assert.equal(directInstruction.workflow_continuations.length, 1);
assert.equal(directInstruction.workflow_continuations[0].state, 'file_downloaded');
assert.equal(directInstruction.workflow_continuations[0].next_command, null);

// Instruction growth stays bounded and appears once per delivery, not once per result.
const ordinaryPayload = `OZON_BATCH_RESULT_V1\n{}\n===== OZON RESULT 1/1 =====\nOZON_RESULT_V1\n${JSON.stringify({ operation: 'analytics_data', http_status: 200, result: { result: { totals: [1, 1] } } })}`;
const ordinaryOut = Patch.appendInstructionTail(ordinaryPayload);
const addedBytes = Buffer.byteLength(ordinaryOut, 'utf8') - Buffer.byteLength(ordinaryPayload, 'utf8');
assert.ok(addedBytes > 100 && addedBytes < 2500, `LLM instruction tail unexpectedly large: ${addedBytes}`);
assert.equal((ordinaryOut.match(/OZON_LLM_INSTRUCTIONS_V1/g) || []).length, 1);

// Large generated text will include the tail before delivery representation is chosen; no truncation path is introduced here.
const autorunSource = read('shared/bridge_autorun_model.js');
assert.match(autorunSource, /generatedTextDecision\?\.\(adapterId, outgoingText\)/);
assert.match(autorunSource, /artifact_text:\s*attachmentPlan\.generated_text_document \? attachmentPlan\.original_outgoing_text : null/);

console.log('REPORT_CREATE_COUNT=' + discoveredReportCreates.length);
console.log('GENERATED_DOCUMENT_RESOLVER_COUNT=' + providerResolvers.length);
console.log('LLM_INSTRUCTION_ADDED_BYTES=' + addedBytes);
console.log('OZON_LLM_OUTPUT_REPORT_WORKFLOW_SECONDARY_SWEEP_PASS');
