import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("usage: node run_prompt_override_save_contract_gate.mjs <extension-root>");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

const worker = read("service_worker.js");
const popup = read("popup.js");
const html = read("popup.html");

assert(html.includes('id="globalAutoStartPromptText"'), "global prompt editor missing");
assert(html.includes('id="autoStartPromptOverrideEnabled"'), "explicit per-dialog override checkbox missing");
assert(html.includes('id="autoStartPromptText"'), "per-dialog prompt textarea missing");

assert(popup.includes('auto_start_prompt_override_enabled: $("autoStartPromptOverrideEnabled")?.checked === true'), "Save All does not send explicit local override state");
assert(popup.includes('$("autoStartPromptOverrideEnabled").checked = localPromptOverride'), "render does not project actual override state into checkbox");
assert(popup.includes('localPrompt.disabled = !enabled || $("autoStartPromptOverrideEnabled")?.checked !== true'), "local textarea is not gated by explicit override state");
assert(popup.includes('$("autoStartPromptOverrideEnabled")?.addEventListener("change"'), "local override toggle handler missing");

const controls = popup.match(/function setConversationControlsEnabled\(enabled\) \{([\s\S]*?)\n\}/);
assert(controls, "conversation controls function missing");
assert(controls[1].includes("autoStartPromptOverrideEnabled"), "local override toggle lost conversation identity gate");
assert(controls[1].includes("resetAutoStartPrompt"), "local reset lost conversation identity gate");
assert(!controls[1].includes("globalAutoStartPromptText"), "global prompt incorrectly depends on conversation identity");
assert(!controls[1].includes("resetGlobalAutoStartPrompt"), "global prompt reset incorrectly depends on conversation identity");

const saveStart = worker.indexOf('case "OZ_SAVE_SETTINGS"');
const resetStart = worker.indexOf('case "OZ_RESET_GLOBAL_AUTO_START_PROMPT"', saveStart);
assert(saveStart >= 0 && resetStart > saveStart, "settings save block not found");
const saveBlock = worker.slice(saveStart, resetStart);
assert(saveBlock.includes("message.auto_start_prompt_override_enabled === true"), "worker explicit override-enable branch missing");
assert(saveBlock.includes("message.auto_start_prompt_override_enabled === false"), "worker explicit override-disable branch missing");
assert(saveBlock.includes("await resetAutoStartPrompt(key);"), "override-disable does not restore inheritance");
assert(saveBlock.includes("AUTO_START_PROMPT_TEXT_REQUIRED"), "override-enable missing text fail-closed validation");
assert(saveBlock.includes("Backward-compatible message contract"), "legacy popup message compatibility branch missing");

// New popup always sends an explicit boolean, therefore its ordinary Save All path
// can never enter the legacy implicit-save compatibility branch.
const payloadStart = popup.indexOf('auto_start_prompt_override_enabled:');
const keyAfter = popup.indexOf('conversation_key: context.conversation_key', payloadStart);
assert(payloadStart >= 0 && keyAfter > payloadStart, "new popup explicit override field is not in conversation Save All payload");

console.log("BOOTSTRAP_PROMPT_GLOBAL_SAVE_DOES_NOT_IMPLICITLY_CREATE_LOCAL_OVERRIDE_PASS");
console.log("BOOTSTRAP_PROMPT_LOCAL_OVERRIDE_EXPLICIT_OPT_IN_PASS");
console.log("BOOTSTRAP_PROMPT_LOCAL_OVERRIDE_IDENTITY_GATE_PASS");
console.log("BOOTSTRAP_PROMPT_LEGACY_POPUP_COMPATIBILITY_PASS");
console.log("BOOTSTRAP_PROMPT_OVERRIDE_SAVE_CONTRACT_GATE_PASS");
