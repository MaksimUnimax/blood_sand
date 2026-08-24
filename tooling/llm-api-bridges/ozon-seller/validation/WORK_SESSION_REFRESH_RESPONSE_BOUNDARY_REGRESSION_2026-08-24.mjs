import fs from "node:fs";

const root = process.argv[2];
if (!root) throw new Error("usage: node WORK_SESSION_REFRESH_RESPONSE_BOUNDARY_REGRESSION_2026-08-24.mjs <extension-root>");
const worker = fs.readFileSync(`${root}/service_worker.js`, "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

const routeStart = worker.indexOf('case "OZ_WORK_REFRESH"');
const routeEnd = worker.indexOf('case "OZ_WORK_START"', routeStart);
assert(routeStart >= 0 && routeEnd > routeStart, "Refresh route missing");
const route = worker.slice(routeStart, routeEnd);

assert(route.includes("WORK_SESSION_REFRESH_RUNTIME_RELOAD_ARMED"), "runtime reload armed diagnostic missing");
assert(route.includes("runtime_reload_after_response: true"), "Refresh response-boundary marker missing");
assert(route.includes("page_reload_deferred_to_new_runtime: true"), "new-runtime page reload contract missing");
assert(!route.includes("setTimeout(() => chrome.runtime.reload()"), "Refresh still depends on timer for runtime reload");
assert(!route.includes("await chrome.tabs.reload(tab)"), "old runtime still reloads page before extension reload");
console.log("WORK_SESSION_REFRESH_ROUTE_RESPONSE_BOUNDARY_PASS");

assert(worker.includes("async function reloadRefreshOwnerTabAfterRuntimeRenewal(recovery)"), "new-runtime owner-tab reload helper missing");
assert(worker.includes("WORK_SESSION_REFRESH_POST_RUNTIME_TAB_RELOAD_SCHEDULED"), "post-runtime tab reload diagnostic missing");
const helperPos = worker.indexOf("const pageReload = await reloadRefreshOwnerTabAfterRuntimeRenewal(recovery);");
const identityPos = worker.indexOf("const identityCheck = await waitForRefreshTabIdentity(recovery);", helperPos);
assert(helperPos >= 0 && identityPos > helperPos, "identity wait must happen after new-runtime owner-tab reload");
console.log("WORK_SESSION_REFRESH_POST_RUNTIME_TAB_RELOAD_PASS");

const completionStart = worker.lastIndexOf("})().then((response) => {");
assert(completionStart >= 0, "message completion boundary missing");
const completion = worker.slice(completionStart);
assert(completion.includes("const runtimeReloadAfterResponse = response?.runtime_reload_after_response === true;"), "reload marker not consumed at message boundary");
assert(completion.includes("delete publicResponse.runtime_reload_after_response;"), "internal reload marker leaks to public response");
const sendPos = completion.indexOf("sendResponse(publicResponse);");
const reloadPos = completion.indexOf("chrome.runtime.reload();", sendPos);
assert(sendPos >= 0 && reloadPos > sendPos, "runtime reload must be invoked directly after public response");
assert(!completion.slice(sendPos, reloadPos).includes("setTimeout"), "timer inserted between response and runtime reload");
console.log("WORK_SESSION_REFRESH_DIRECT_RELOAD_AFTER_RESPONSE_PASS");

assert(worker.includes("WORK_SESSION_REFRESH_WAKE_ALARM"), "A2 wake alarm fallback was lost");
assert(worker.includes("waitForRefreshTabIdentity") && worker.includes("WORK_REFRESH_CONTENT_RECONNECT_TIMEOUT"), "A2 reconnect wait was lost");
assert(worker.includes("WORK_SESSION_REFRESH_RESUMED"), "durable recovery resumed diagnostic was lost");
console.log("WORK_SESSION_REFRESH_A2_DURABLE_RECOVERY_PRESERVED_PASS");
console.log("WORK_SESSION_REFRESH_RESPONSE_BOUNDARY_REGRESSION_PASS");
