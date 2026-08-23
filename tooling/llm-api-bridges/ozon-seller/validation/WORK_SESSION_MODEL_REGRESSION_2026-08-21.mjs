import fs from "node:fs";
import vm from "node:vm";
const file = process.argv[2];
if (!file) throw new Error("usage: node WORK_SESSION_MODEL_REGRESSION_2026-08-21.mjs <work_session_model.js>");
const context = vm.createContext({}); vm.runInContext(fs.readFileSync(file, "utf8"), context);
const { STATES, normalize, transition } = context.OzonWorkSessionModel;
const assert = (value, message) => { if (!value) throw new Error(message); };
let session = normalize(null, "https://chatgpt.com|abc");
assert(session.state === STATES.INACTIVE && session.revision === 0, "default session");
session = transition(session, STATES.BINDING, { tab_id: 9, origin: "https://chatgpt.com", conversation_id: "abc" });
session = transition(session, STATES.ACTIVE_VISIBLE); assert(session.revision === 2, "bind then visible");
session = transition(session, STATES.ACTIVE_HIDDEN); session = transition(session, STATES.ACTIVE_VISIBLE);
console.log("WORK_SESSION_HIDE_SHOW_LEGAL_TRANSITIONS_PASS");
session = transition(session, STATES.FINISHING); session = transition(session, STATES.INACTIVE); assert(session.state === STATES.INACTIVE, "finish inactive");
console.log("WORK_SESSION_FINISH_RETIRES_SESSION_PASS");
let rejected = false; try { transition(session, STATES.ACTIVE_VISIBLE); } catch (error) { rejected = error.code === "WORK_SESSION_TRANSITION_REJECTED"; }
assert(rejected, "illegal transition must reject"); console.log("WORK_SESSION_STALE_ILLEGAL_TRANSITION_REJECTED_PASS");
