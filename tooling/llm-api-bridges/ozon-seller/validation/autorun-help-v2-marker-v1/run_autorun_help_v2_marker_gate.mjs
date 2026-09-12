import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const inputRoot = path.resolve(process.argv[2] || '.');
const dist = fs.existsSync(path.join(inputRoot, 'content_script.js'))
  ? inputRoot
  : path.join(inputRoot, 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');

const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8').replace(/\r\n/g, '\n');
const content = read('content_script.js');
const runtimeNames = read('shared/runtime_names.js');
const mixedSource = read('shared/mixed_batch_discovery.js');
const worker = read('service_worker.js');

const runtimeContext = vm.createContext({ console });
runtimeContext.globalThis = runtimeContext;
vm.runInContext(runtimeNames, runtimeContext, { filename: 'runtime_names.js' });
const runtime = runtimeContext.OzonRuntime?.RUNTIME;
if (!runtime) throw new Error('RUNTIME_NAMES_UNAVAILABLE');
if (runtime.commandPrefix !== 'OZON_API_V1') throw new Error(`COMMAND_PREFIX_DRIFT:${runtime.commandPrefix}`);
if (runtime.helpPrefix !== 'OZON_HELP_V1') throw new Error(`HELP_V1_PREFIX_DRIFT:${runtime.helpPrefix}`);
if (runtime.helpPrefixV2 !== 'OZON_HELP_V2') throw new Error(`HELP_V2_PREFIX_DRIFT:${runtime.helpPrefixV2}`);

const helperMatch = content.match(/function\s+autorunCommandMarkerPresent\s*\(value\)\s*\{([\s\S]*?)\n  \}/);
if (!helperMatch) throw new Error('PREFX_AUTORUN_HELP_V2_SHARED_MARKER_PREDICATE_MISSING');
const helperBody = helperMatch[1];
const predicate = new Function('OzonContract', 'OzonRuntime', `return function(value) {${helperBody}\n}`)(
  { PREFIX: runtime.commandPrefix },
  { RUNTIME: runtime }
);

const api = `prefix\n${runtime.commandPrefix}\n{"operation":"products_list","params":{}}`;
const helpV1 = `${runtime.helpPrefix}\n{"cluster":"catalog_products"}`;
const helpV2 = `${runtime.helpPrefixV2}\n{"cluster":"catalog_products"}`;
const tripleHelpV2 = [
  `${runtime.helpPrefixV2}\n{"cluster":"catalog_products"}`,
  `${runtime.helpPrefixV2}\n{"cluster":"stocks_inventory"}`,
  `${runtime.helpPrefixV2}\n{"cluster":"finance"}`
].join('\n\n');
const mixedV2Api = `${runtime.helpPrefixV2}\n{"cluster":"catalog_products"}\n\n${runtime.commandPrefix}\n{"operation":"products_list","params":{}}`;

for (const [name, text] of [
  ['API_V1', api],
  ['HELP_V1', helpV1],
  ['HELP_V2_SINGLE', helpV2],
  ['HELP_V2_TRIPLE', tripleHelpV2],
  ['HELP_V2_API_MIXED', mixedV2Api]
]) {
  if (predicate(text) !== true) throw new Error(`${name}_AUTORUN_MARKER_REJECTED`);
}
for (const [name, text] of [
  ['PLAIN_TEXT', 'обычный ответ без команды'],
  ['GUIDANCE_RESULT', 'OZON_GUIDANCE_RESULT_V2\n{}'],
  ['PARTIAL_HELP_TOKEN', 'OZON_HELP_V']
]) {
  if (predicate(text) !== false) throw new Error(`${name}_FALSE_POSITIVE_MARKER`);
}

const callCount = (content.match(/autorunCommandMarkerPresent\s*\(/g) || []).length;
if (callCount !== 3) throw new Error(`AUTORUN_MARKER_PREDICATE_CLOSED_SET_EXPECTED_DEFINITION_PLUS_2_CALLS_GOT_${callCount}`);
if (!content.includes('const hasMarker = autorunCommandMarkerPresent(messageText);')) throw new Error('CANDIDATE_SCAN_NOT_ROUTED_THROUGH_SHARED_MARKER_PREDICATE');
if (!content.includes('if (!autorunCommandMarkerPresent(latestText) || latestFingerprint !== candidate.message_fingerprint)')) throw new Error('PRE_ACCEPT_RECHECK_NOT_ROUTED_THROUGH_SHARED_MARKER_PREDICATE');

if (!content.includes('candidate.waiting || !candidate.complete || !candidate.has_marker || !candidate.assistant_text')) throw new Error('ASSISTANT_COMPLETION_GUARD_CHANGED_OR_MISSING');
if (!content.includes('sameConversation(activeAutoWatch.origin, activeAutoWatch.conversation_id)')) throw new Error('AUTORUN_CONVERSATION_OWNERSHIP_GUARD_MISSING');
if (!content.includes('conversationKeyFromLocation() !== activeAutoWatch.conversation_key')) throw new Error('AUTORUN_CONVERSATION_KEY_GUARD_MISSING');
if (!content.includes('latestFingerprint !== candidate.message_fingerprint')) throw new Error('AUTORUN_STABILITY_FINGERPRINT_GUARD_MISSING');

if (!worker.includes('helpPrefixV1: OzonRuntime.RUNTIME.helpPrefix')) throw new Error('WORKER_HELP_V1_DISCOVERY_WIRING_MISSING');
if (!worker.includes('helpPrefixV2: OzonRuntime.RUNTIME.helpPrefixV2 || "OZON_HELP_V2"')) throw new Error('WORKER_HELP_V2_DISCOVERY_WIRING_MISSING');

const mixedContext = vm.createContext({ console });
mixedContext.globalThis = mixedContext;
vm.runInContext(mixedSource, mixedContext, { filename: 'mixed_batch_discovery.js' });
const discover = mixedContext.OzonMixedBatchDiscovery?.discover;
if (typeof discover !== 'function') throw new Error('MIXED_BATCH_DISCOVERY_UNAVAILABLE');
const options = {
  commandPrefix: runtime.commandPrefix,
  helpPrefixV1: runtime.helpPrefix,
  helpPrefixV2: runtime.helpPrefixV2,
  apiDiscover: (value) => value.startsWith(runtime.commandPrefix) ? [{ ok: true, marker_index: 0 }] : [],
  parseHelp: (value) => ({ ok: value.startsWith(runtime.helpPrefixV1) || value.startsWith(runtime.helpPrefixV2) })
};
const triple = Array.from(discover(tripleHelpV2, options));
if (triple.length !== 3 || triple.some((row) => row.kind !== 'help' || row.version !== 2 || row.help?.ok !== true)) throw new Error(`TRIPLE_HELP_V2_DOWNSTREAM_DISCOVERY_FAILED:${JSON.stringify(triple)}`);
const mixed = Array.from(discover(mixedV2Api, options));
if (mixed.length !== 2 || mixed[0]?.kind !== 'help' || mixed[0]?.version !== 2 || mixed[1]?.kind !== 'api') throw new Error(`MIXED_HELP_V2_API_DISCOVERY_FAILED:${JSON.stringify(mixed)}`);

console.log('AUTORUN_HELP_V2_SINGLE=PASS');
console.log('AUTORUN_HELP_V2_TRIPLE=PASS');
console.log('AUTORUN_HELP_V2_API_MIXED=PASS');
console.log('AUTORUN_HELP_V1_COMPAT=PASS');
console.log('AUTORUN_API_V1_COMPAT=PASS');
console.log('AUTORUN_FALSE_POSITIVE_NEGATIVES=PASS');
console.log('AUTORUN_MARKER_PREDICATE_CONSUMERS=2/2');
console.log('AUTORUN_COMPLETION_STABILITY_OWNERSHIP_GUARDS=PASS');
console.log('DOWNSTREAM_MIXED_DISCOVERY_HELP_V2=PASS');
console.log(`TESTED_DIST_ROOT=${dist}`);
