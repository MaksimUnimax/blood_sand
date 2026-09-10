import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.argv[2];
if (!root) throw new Error("usage: node run_current_work_session_pending_visibility_gate.mjs <extension-root>");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

const worker = read("service_worker.js");
const content = read("content_script.js");
const runtime = read("shared/runtime_names.js");
const modelSource = read("shared/work_session_model.js");

const context = vm.createContext({});
vm.runInContext(modelSource, context, { filename: "shared/work_session_model.js" });
const { STATES, normalize, transition } = context.OzonWorkSessionModel;

assert(runtime.includes('PENDING_WORK_STARTS: "ozmb_pending_work_starts_v1"'), "current durable pending-start storage key missing");
assert(worker.includes("async function createPendingWorkStart") && worker.includes("WORK_START_ALREADY_PENDING"), "current worker single-flight pending-start contract missing");
assert(worker.includes("OZ_WORK_SEND_INITIAL_PROMPT") && content.includes("sendWorkSessionPrompt"), "current Start no longer uses real composer route");
console.log("CURRENT_WORK_SESSION_PENDING_START_SINGLE_FLIGHT_PASS");

let session = normalize(null, "https://alice.yandex.ru|real-id");
session = transition(session, STATES.BINDING, {
  tab_id: 77,
  origin: "https://alice.yandex.ru",
  ai_id: "alice",
  conversation_id: "real-id",
  start_intent_id: "current-work-start-test"
});
session = transition(session, STATES.ACTIVE_VISIBLE);
assert(session.state === STATES.ACTIVE_VISIBLE && session.conversation_id === "real-id", "current work-session binding transition broken");
assert(worker.includes("message.first_response_complete !== true") && worker.includes("WORK_PENDING_STALE_OR_INVALID"), "current pending completion/correlation guard missing");
assert(worker.includes("WORK_START_SEND_FAILED") && worker.includes("OzonWorkSessionModel.STATES.ERROR"), "current start failure terminalization missing");
assert(worker.includes("chrome.tabs.onRemoved.addListener") && worker.includes("WORK_PENDING_START_CANCELLED_TAB_CLOSED"), "current tab-close pending cancellation missing");
console.log("CURRENT_WORK_SESSION_PENDING_IDENTITY_CORRELATION_PASS");

assert(worker.includes('case "OZ_WORK_SHOW"'), "current OZ_WORK_SHOW route missing");
assert(worker.includes('case "OZ_WORK_HIDE"'), "current OZ_WORK_HIDE route missing");
assert(worker.includes('type: "OZ_WORK_APPLY_VISIBILITY", visible: true'), "current show route does not apply visible=true");
assert(worker.includes('type: "OZ_WORK_APPLY_VISIBILITY", visible: false'), "current hide route does not apply visible=false");
assert(content.includes('message?.type === "OZ_WORK_APPLY_VISIBILITY"'), "content current work visibility handler missing");
assert(content.includes("applyManualMode(message.visible === true, currentKey)"), "content current work visibility does not drive manual UI mode");
console.log("CURRENT_WORK_SESSION_SHOW_HIDE_VISIBILITY_PASS");

const showStart = worker.indexOf('case "OZ_WORK_SHOW"');
const hideStart = worker.indexOf('case "OZ_WORK_HIDE"');
const finishStart = worker.indexOf('case "OZ_WORK_FINISH"');
assert(showStart >= 0 && hideStart > showStart && finishStart > hideStart, "current work lifecycle case ordering unexpected");
const showBody = worker.slice(showStart, hideStart);
const hideBody = worker.slice(hideStart, finishStart);
assert(showBody.includes("ACTIVE_HIDDEN") && showBody.includes("ACTIVE_VISIBLE") && showBody.includes("setWorkSessionCommandAcceptance(key, true)"), "show route state/acceptance semantics missing");
assert(hideBody.includes("ACTIVE_VISIBLE") && hideBody.includes("ACTIVE_HIDDEN") && hideBody.includes("setWorkSessionCommandAcceptance(key, false)"), "hide route state/acceptance semantics missing");
console.log("CURRENT_WORK_SESSION_SHOW_HIDE_STATE_TRANSITIONS_PASS");

for (const forbidden of ["fakeConversation", "syntheticConversation", "temporaryConversationKey", "pendingConversationKey"]) {
  assert(!worker.includes(forbidden) && !content.includes(forbidden), `fake conversation identity marker introduced: ${forbidden}`);
}
console.log("CURRENT_WORK_SESSION_NO_FAKE_IDENTITY_PASS");
console.log("CURRENT_WORK_SESSION_PENDING_VISIBILITY_GATE_PASS");
