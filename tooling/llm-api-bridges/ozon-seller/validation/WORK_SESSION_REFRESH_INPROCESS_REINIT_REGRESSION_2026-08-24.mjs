import fs from "node:fs";
const root = process.argv[2];
if (!root) throw new Error("usage: node WORK_SESSION_REFRESH_INPROCESS_REINIT_REGRESSION_2026-08-24.mjs <extension-root>");
const worker = fs.readFileSync(`${root}/service_worker.js`, "utf8");
const content = fs.readFileSync(`${root}/content_script.js`, "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

assert(worker.includes('const WORKER_SESSION_ID = `worker-${crypto.randomUUID()}`;'), "physical worker boot identity missing");
assert(worker.includes('let workSessionRuntimeGeneration = `work-runtime-${crypto.randomUUID()}`;'), "separate work-session runtime generation missing");
assert(worker.includes('old_runtime_generation: workSessionRuntimeGeneration') && worker.includes('new_runtime_generation: `work-runtime-${crypto.randomUUID()}`'), "durable old/new recovery generations missing");
console.log("WORK_SESSION_REFRESH_SEPARATE_RUNTIME_GENERATION_PASS");

const start = worker.indexOf('case "OZ_WORK_REFRESH"');
const end = worker.indexOf('case "OZ_WORK_START"', start);
assert(start >= 0 && end > start, "Refresh route missing");
const refresh = worker.slice(start, end);
assert(refresh.includes('WORK_SESSION_REFRESH_RUNTIME_REINITIALIZED'), "in-process reinitialization diagnostic missing");
assert(refresh.includes('workSessionRuntimeGeneration = newRuntimeGeneration;'), "runtime generation is not rotated");
assert(refresh.includes('reloadRefreshOwnerTabInProcess'), "same-tab reload path missing");
assert(refresh.includes('await resumeWorkSessionRecoveries();'), "bounded durable recovery resume missing");
assert(refresh.includes('runtime_reinitialized: true'), "public reinitialized proof missing");
assert(refresh.includes('physical_worker_reloaded: false'), "public physical-worker contract missing");
assert(!refresh.includes('chrome.runtime.reload'), "Refresh still physically kills extension runtime");
assert(!refresh.includes('setTimeout(() => chrome.runtime.reload'), "Refresh still depends on delayed runtime reload");
console.log("WORK_SESSION_REFRESH_INPROCESS_ROUTE_PASS");

assert(worker.includes('async function reloadRefreshOwnerTabInProcess') && worker.includes('chrome.tabs.onUpdated.addListener(listener)'), "tab reload completion barrier missing");
assert(worker.includes('if (changeInfo?.status === "loading") sawLoading = true;') && worker.includes('if (changeInfo?.status === "complete" && sawLoading)'), "reload barrier does not prove loading->complete transition");
assert(worker.includes('WORK_SESSION_REFRESH_TAB_RELOAD_COMPLETED'), "fresh-document diagnostic missing");
console.log("WORK_SESSION_REFRESH_FRESH_DOCUMENT_BARRIER_PASS");

assert(worker.includes('const runtimeGeneration = String(recovery.new_runtime_generation || workSessionRuntimeGeneration);'), "resume does not use durable new generation");
assert(worker.includes('type: "OZ_WORK_RUNTIME_RENEW", runtime_generation: runtimeGeneration'), "content generation handshake missing");
assert(worker.includes('new_runtime_generation: runtimeGeneration') && worker.includes('WORK_SESSION_REFRESH_RESUMED'), "resumed diagnostic does not prove rotated generation");
assert(content.includes('OZ_WORK_RUNTIME_RENEW') && content.includes('stopManualObserver()') && content.includes('ui_record_generation'), "content runtime teardown/renew handshake missing");
console.log("WORK_SESSION_REFRESH_GENERATION_HANDSHAKE_PASS");

assert(worker.includes('recovery.expected_visible') && worker.includes('ACTIVE_VISIBLE') && worker.includes('ACTIVE_HIDDEN'), "visible/hidden restore missing");
assert(worker.includes('resumeProviderQuotaWaits(); void resumeWorkSessionRecoveries();'), "startup recovery/provider scheduler bootstrap missing");
assert(!refresh.includes('deliveryAttemptRequests.clear') && !refresh.includes('batchCollectionRequests.clear') && !refresh.includes('providerQuota'), "Refresh resets protected/global provider runtime state");
console.log("WORK_SESSION_REFRESH_PROTECTED_STATE_PASS");
console.log("WORK_SESSION_REFRESH_INPROCESS_REINIT_REGRESSION_PASS");
