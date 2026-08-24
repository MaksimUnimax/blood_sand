import fs from 'node:fs';
import vm from 'node:vm';
const root = process.argv[2];
if (!root) throw new Error('usage: node WORK_SESSION_RESUME_PROVIDER_STATUS_REGRESSION_2026-08-24.mjs <extension-root>');
const popup = fs.readFileSync(`${root}/popup.js`, 'utf8');
const worker = fs.readFileSync(`${root}/service_worker.js`, 'utf8');
const modelSource = fs.readFileSync(`${root}/shared/work_session_model.js`, 'utf8');
const assert = (v,m)=>{ if(!v) throw new Error(m); };

assert(worker.includes('scope: "provider"'), 'provider status records are not explicitly scoped');
assert(worker.includes('settings.lastStatus?.scope === "provider"'), 'legacy/non-provider LAST_STATUS is still exposed to popup');
const catchStart = worker.lastIndexOf('})().then(sendResponse).catch(async (error) => {');
assert(catchStart >= 0, 'message catch not found');
const catchBlock = worker.slice(catchStart, worker.indexOf('return true;', catchStart));
assert(!catchBlock.includes('setStatus('), 'generic runtime/message errors still poison provider LAST_STATUS');
assert(catchBlock.includes('EXTENSION_MESSAGE_FAILED'), 'runtime/message failures are not retained in diagnostics');
console.log('PROVIDER_STATUS_SEPARATED_FROM_RUNTIME_ERRORS_PASS');

const resumeStart = worker.indexOf('case "OZ_WORK_RESUME"');
const resumeEnd = worker.indexOf('case "OZ_WORK_SHOW"', resumeStart);
assert(resumeStart >= 0 && resumeEnd > resumeStart, 'OZ_WORK_RESUME route missing');
const resume = worker.slice(resumeStart, resumeEnd);
assert(resume.includes('OzonWorkSessionModel.STATES.INACTIVE'), 'Resume does not require inactive state');
assert(resume.includes('strictBindingForIdentity(live)'), 'Resume does not require existing exact binding');
assert(resume.includes('OzonWorkSessionModel.STATES.BINDING'), 'Resume does not enter binding state');
assert(resume.includes('OzonWorkSessionModel.STATES.ACTIVE_VISIBLE'), 'Resume does not activate visible state');
assert(resume.includes('OZ_WORK_APPLY_VISIBILITY'), 'Resume does not restore controls');
assert(resume.includes('WORK_SESSION_RESUMED_WITHOUT_PROMPT'), 'Resume diagnostic missing');
assert(!resume.includes('OZ_WORK_SEND_INITIAL_PROMPT'), 'Resume sends initial prompt');
assert(!resume.includes('sendWorkSessionPrompt'), 'Resume calls prompt send path');
console.log('WORK_SESSION_RESUME_WITHOUT_PROMPT_ROUTE_PASS');

const finishStart = worker.indexOf('case "OZ_WORK_FINISH"');
const finishEnd = worker.indexOf('case "OZ_SET_MANUAL_MODE"', finishStart);
assert(finishStart >= 0 && finishEnd > finishStart, 'Finish route missing');
const finish = worker.slice(finishStart, finishEnd);
assert(!finish.includes('delete bindings[key]'), 'Finish still deletes explicit conversation binding');
assert(finish.includes('WORK_SESSION_FINISHED_BINDING_PRESERVED'), 'Finish binding-preserved diagnostic missing');
assert(finish.includes('binding_preserved: true'), 'Finish response does not state binding preservation');
console.log('WORK_SESSION_FINISH_PRESERVES_BINDING_PASS');

assert(popup.includes('const resumableInactive = session.state === "inactive" && bound;'), 'popup does not enable Show for inactive+bound');
assert(popup.includes('"OZ_WORK_RESUME"'), 'popup does not dispatch Resume');
assert(popup.includes('Work-session продолжена без стартового prompt'), 'popup Resume result message missing');
assert(popup.includes('диалог остаётся привязан'), 'popup Finish text still claims binding retirement');
console.log('POPUP_INACTIVE_BOUND_RESUME_CONTROL_PASS');

const context = vm.createContext({});
vm.runInContext(modelSource, context, {filename:'shared/work_session_model.js'});
const {STATES, normalize, transition} = context.OzonWorkSessionModel;
let s = normalize(null, 'https://chatgpt.com|resume-test');
s = transition(s, STATES.BINDING, {tab_id:9, origin:'https://chatgpt.com', ai_id:'chatgpt', conversation_id:'resume-test'});
s = transition(s, STATES.ACTIVE_VISIBLE);
s = transition(s, STATES.FINISHING);
s = transition(s, STATES.INACTIVE, {tab_id:null, origin:null, ai_id:null, conversation_id:null});
s = transition(s, STATES.BINDING, {tab_id:9, origin:'https://chatgpt.com', ai_id:'chatgpt', conversation_id:'resume-test'});
s = transition(s, STATES.ACTIVE_VISIBLE);
assert(s.state === STATES.ACTIVE_VISIBLE, 'state machine does not support inactive -> binding -> active_visible resume');
console.log('WORK_SESSION_RESUME_STATE_MACHINE_PASS');
