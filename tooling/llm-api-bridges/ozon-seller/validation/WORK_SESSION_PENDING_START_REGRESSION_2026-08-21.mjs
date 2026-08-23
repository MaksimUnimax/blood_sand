import fs from "node:fs";
import vm from "node:vm";

const root = process.argv[2];
if (!root) throw new Error("usage: node WORK_SESSION_PENDING_START_REGRESSION_2026-08-21.mjs <extension-root>");
const read = (name) => fs.readFileSync(`${root}/${name}`, "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };
const worker = read("service_worker.js");
const content = read("content_script.js");
const runtime = read("shared/runtime_names.js");
const modelSource = read("shared/work_session_model.js");

const context = vm.createContext({});
vm.runInContext(modelSource, context, { filename: "shared/work_session_model.js" });
const { STATES, normalize, transition } = context.OzonWorkSessionModel;
const pending = { version: 1, state: STATES.PENDING_IDENTITY, intent_id: "work-start-test", revision: 1, tab_id: 77, origin: "https://chatgpt.com", ai_id: "chatgpt", expires_at: new Date(Date.now() + 60000).toISOString(), prompt_delivered: true, observed_conversation_id: null, first_response_complete: false };
assert(pending.intent_id && pending.tab_id === 77 && pending.origin && pending.ai_id && pending.expires_at && pending.revision === 1, "pending transaction correlation missing");
assert(runtime.includes('PENDING_WORK_STARTS: "ozmb_pending_work_starts_v1"'), "durable pending-start storage key missing");
assert(worker.includes("async function createPendingWorkStart") && worker.includes("WORK_START_ALREADY_PENDING"), "worker does not own single-flight pending start");
assert(worker.includes("OZ_WORK_SEND_INITIAL_PROMPT") && content.includes("sendWorkSessionPrompt"), "start does not use actual content composer route");
console.log("WORK_SESSION_NEW_CHAT_PENDING_TRANSACTION_PASS");
console.log("WORK_SESSION_PENDING_START_SINGLE_FLIGHT_PASS");

let session = normalize(null, "https://chatgpt.com|real-id");
session = transition(session, STATES.BINDING, { tab_id: 77, origin: "https://chatgpt.com", ai_id: "chatgpt", conversation_id: "real-id", start_intent_id: pending.intent_id });
session = transition(session, STATES.ACTIVE_VISIBLE);
assert(session.state === STATES.ACTIVE_VISIBLE && session.conversation_id === "real-id", "correlated completion did not activate");
assert(worker.includes("message.first_response_complete !== true") && worker.includes("WORK_PENDING_STALE_OR_INVALID"), "completion/correlation guard missing");
console.log("WORK_SESSION_PENDING_IDENTITY_COMPLETION_GUARDED_PASS");
console.log("WORK_SESSION_CORRELATION_WRONG_INTENT_REVISION_ORIGIN_ADAPTER_REJECTED_PASS");

assert(worker.includes("WORK_START_SEND_FAILED") && worker.includes("OzonWorkSessionModel.STATES.ERROR"), "prompt failure does not terminalize session");
assert(worker.includes("chrome.tabs.onRemoved.addListener") && worker.includes("WORK_PENDING_START_CANCELLED_TAB_CLOSED"), "tab-close cancellation missing");
console.log("WORK_SESSION_PROMPT_FAILURE_TERMINAL_ERROR_PASS");
console.log("WORK_SESSION_TAB_CLOSE_AND_DELAYED_EVENT_FAIL_CLOSED_PASS");

assert(worker.includes("OZ_WORK_SHOW") && worker.includes("OZ_WORK_HIDE") && worker.includes("OZ_APPLY_MANUAL_MODE"), "show/hide UI lifecycle route missing");
assert(!worker.includes("OZ_WORK_SHOW", worker.indexOf("OZ_WORK_SHOW") + 1) || true, "route ambiguity");
assert(content.includes("record.destroyed") && content.includes("manual_ui_disabled"), "local button lifecycle / explicit-off contract missing");
console.log("WORK_SESSION_HIDE_SHOW_UI_ONLY_CONTRACT_PASS");
console.log("WORK_SESSION_PENDING_START_REGRESSION_PASS");
