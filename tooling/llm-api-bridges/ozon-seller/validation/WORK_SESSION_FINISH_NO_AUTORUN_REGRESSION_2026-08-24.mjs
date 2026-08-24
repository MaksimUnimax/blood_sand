import fs from "node:fs";
import vm from "node:vm";

const root = process.argv[2];
if (!root) throw new Error("usage: node WORK_SESSION_FINISH_NO_AUTORUN_REGRESSION_2026-08-24.mjs <extension-root>");

const worker = fs.readFileSync(`${root}/service_worker.js`, "utf8");
const modelSource = fs.readFileSync(`${root}/shared/work_session_model.js`, "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

const start = worker.indexOf('case "OZ_WORK_FINISH"');
const end = worker.indexOf('case "OZ_SET_MANUAL_MODE"', start);
assert(start >= 0 && end > start, "Finish route not found");
const finish = worker.slice(start, end);

assert(finish.includes("const terminalized = await terminalizeFinishOperation(key);"), "Finish manual terminalization missing");
assert(finish.includes("const autoRun = await getAutoRun(key);"), "Finish does not check whether Autorun exists");
assert(finish.includes("if (autoRun)"), "Finish Autorun stop is not conditional");
assert(finish.includes("await stopAutoRun(key);"), "Finish does not stop an existing Autorun");
assert(finish.includes('error?.code !== "AUTO_RUN_NOT_FOUND"'), "Finish does not tolerate missing/concurrently removed Autorun");
assert(finish.indexOf("const autoRun = await getAutoRun(key);") < finish.indexOf("await stopAutoRun(key);"), "Autorun existence must be checked before stop");
assert(finish.includes("OzonWorkSessionModel.STATES.INACTIVE"), "Finish does not retire the work-session");

const context = vm.createContext({});
vm.runInContext(modelSource, context, { filename: "shared/work_session_model.js" });
const { STATES, normalize, transition } = context.OzonWorkSessionModel;
let session = normalize(null, "https://chatgpt.com|finish-test");
session = transition(session, STATES.BINDING, { tab_id: 7, origin: "https://chatgpt.com", ai_id: "chatgpt", conversation_id: "finish-test" });
session = transition(session, STATES.ACTIVE_VISIBLE);
session = transition(session, STATES.FINISHING);
session = transition(session, STATES.INACTIVE, { tab_id: null, origin: null, ai_id: null, conversation_id: null });
assert(session.state === STATES.INACTIVE, "Finish state model does not reach inactive");

console.log("WORK_SESSION_FINISH_NO_AUTORUN_OPTIONAL_PASS");
console.log("WORK_SESSION_FINISH_EXISTING_AUTORUN_STOP_PRESERVED_PASS");
console.log("WORK_SESSION_FINISH_RETIRES_SESSION_PASS");
