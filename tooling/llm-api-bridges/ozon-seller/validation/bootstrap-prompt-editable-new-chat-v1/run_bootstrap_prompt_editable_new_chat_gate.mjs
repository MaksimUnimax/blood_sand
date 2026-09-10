import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const target = process.argv[2];
if (!target) {
  console.error("usage: node run_bootstrap_prompt_editable_new_chat_gate.mjs <extension-root>");
  process.exit(2);
}

const read = (name) => fs.readFileSync(path.join(target, name), "utf8");
const fail = (marker, detail = "") => {
  console.error(marker + (detail ? `: ${detail}` : ""));
  process.exit(1);
};
const assert = (value, marker, detail = "") => { if (!value) fail(marker, detail); };

const runtime = read("shared/runtime_names.js");
const worker = read("service_worker.js");
const popup = read("popup.js");
const html = read("popup.html");

// GATE-30 pre-fix authority must fail here for the intended defect.
assert(
  runtime.includes('GLOBAL_AUTO_START_PROMPT: "ozmb_global_auto_start_prompt_v1"'),
  "GLOBAL_BOOTSTRAP_PROMPT_STORAGE_KEY_MISSING"
);

assert(worker.includes("async function getGlobalAutoStartPrompt"), "GLOBAL_BOOTSTRAP_PROMPT_GETTER_MISSING");
assert(worker.includes("async function saveGlobalAutoStartPrompt"), "GLOBAL_BOOTSTRAP_PROMPT_SAVER_MISSING");
assert(worker.includes("async function resetGlobalAutoStartPrompt"), "GLOBAL_BOOTSTRAP_PROMPT_RESET_MISSING");
assert(worker.includes('case "OZ_RESET_GLOBAL_AUTO_START_PROMPT"'), "GLOBAL_BOOTSTRAP_PROMPT_RESET_ROUTE_MISSING");
assert(worker.includes("const bootstrapPrompt = await getGlobalAutoStartPrompt();"), "NEW_CHAT_GLOBAL_BOOTSTRAP_RESOLUTION_MISSING");
assert(!worker.includes('prompt_text: DEFAULT_AUTO_START_TEXT'), "NEW_CHAT_STILL_HARDCODES_COMPILED_DEFAULT");
assert(worker.includes('source: "conversation_override"'), "CONVERSATION_OVERRIDE_SOURCE_MISSING");
assert(worker.includes('source: "global"'), "GLOBAL_INHERITANCE_SOURCE_MISSING");

assert(html.includes('id="globalAutoStartPromptText"'), "GLOBAL_BOOTSTRAP_PROMPT_EDITOR_MISSING");
assert(html.includes('id="resetGlobalAutoStartPrompt"'), "GLOBAL_BOOTSTRAP_PROMPT_RESET_BUTTON_MISSING");
assert(popup.includes('global_auto_start_prompt_text: $("globalAutoStartPromptText").value'), "GLOBAL_BOOTSTRAP_PROMPT_SAVE_PAYLOAD_MISSING");
assert(popup.includes('send("OZ_RESET_GLOBAL_AUTO_START_PROMPT"'), "GLOBAL_BOOTSTRAP_PROMPT_RESET_HANDLER_MISSING");

const controlsMatch = popup.match(/function setConversationControlsEnabled\(enabled\) \{([\s\S]*?)\n\}/);
assert(controlsMatch, "CONVERSATION_CONTROL_GATE_NOT_FOUND");
assert(!controlsMatch[1].includes("globalAutoStartPromptText"), "GLOBAL_PROMPT_EDITOR_WRONGLY_REQUIRES_CONVERSATION_ID");
assert(!controlsMatch[1].includes("resetGlobalAutoStartPrompt"), "GLOBAL_PROMPT_RESET_WRONGLY_REQUIRES_CONVERSATION_ID");
assert(controlsMatch[1].includes("autoStartPromptText"), "PER_CONVERSATION_PROMPT_EDITOR_LOST_IDENTITY_GATE");
assert(controlsMatch[1].includes("resetAutoStartPrompt"), "PER_CONVERSATION_PROMPT_RESET_LOST_IDENTITY_GATE");

// No fake/synthetic conversation identity may be introduced by this repair.
for (const forbidden of ["fakeConversation", "syntheticConversation", "temporaryConversationKey", "pendingConversationKey"]) {
  assert(!worker.includes(forbidden) && !popup.includes(forbidden), "FAKE_CONVERSATION_IDENTITY_INTRODUCED", forbidden);
}

// Execute the storage-resolution helpers themselves, not just string assertions.
const helperStart = worker.indexOf("function normalizeGlobalAutoStartPromptRecord(");
const helperEnd = worker.indexOf("function publicRun(run) {", helperStart);
assert(helperStart >= 0 && helperEnd > helperStart, "GLOBAL_PROMPT_HELPER_BLOCK_NOT_EXTRACTABLE");
const helperSource = worker.slice(helperStart, helperEnd);

const store = {};
const DEFAULT_AUTO_START_TEXT = "COMPILED_DEFAULT_V1";
const KEYS = {
  AUTO_START_PROMPTS: "ozmb_auto_start_prompts",
  GLOBAL_AUTO_START_PROMPT: "ozmb_global_auto_start_prompt_v1"
};
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const context = vm.createContext({
  DEFAULT_AUTO_START_TEXT,
  KEYS,
  normalizeConversationKey(value) {
    const key = String(value || "").trim();
    if (!key) throw new Error("conversation key required");
    return key;
  },
  normalizeAutoStartPromptText(value) {
    const text = String(value || "").trim();
    if (!text) throw new Error("prompt required");
    return text;
  },
  withStartPromptWrite(fn) { return Promise.resolve().then(fn); },
  async storageGet(keys) {
    if (Array.isArray(keys)) return Object.fromEntries(keys.map((key) => [key, clone(store[key])]));
    if (typeof keys === "string") return { [keys]: clone(store[keys]) };
    throw new Error("unsupported storageGet shape");
  },
  async storageSet(values) {
    for (const [key, value] of Object.entries(values)) store[key] = clone(value);
  },
  console
});
vm.runInContext(helperSource, context, { filename: "bootstrap-prompt-helper-extract.js" });

const {
  getGlobalAutoStartPrompt,
  saveGlobalAutoStartPrompt,
  resetGlobalAutoStartPrompt,
  getAutoStartPrompt,
  saveAutoStartPrompt,
  resetAutoStartPrompt
} = context;
for (const [name, fn] of Object.entries({ getGlobalAutoStartPrompt, saveGlobalAutoStartPrompt, resetGlobalAutoStartPrompt, getAutoStartPrompt, saveAutoStartPrompt, resetAutoStartPrompt })) {
  assert(typeof fn === "function", "GLOBAL_PROMPT_HELPER_NOT_EXPOSED", name);
}

const first = await getGlobalAutoStartPrompt();
assert(first.text === DEFAULT_AUTO_START_TEXT && first.is_default === true, "MISSING_GLOBAL_PROMPT_DID_NOT_FALL_BACK_TO_COMPILED_DEFAULT");
assert(store[KEYS.GLOBAL_AUTO_START_PROMPT]?.text === DEFAULT_AUTO_START_TEXT, "COMPILED_DEFAULT_FALLBACK_NOT_DURABLY_STORED");

await saveGlobalAutoStartPrompt("GLOBAL_A");
const inheritedA = await getAutoStartPrompt("alice|conversation-a");
assert(inheritedA.text === "GLOBAL_A" && inheritedA.source === "global" && inheritedA.is_override === false, "CONVERSATION_DID_NOT_INHERIT_GLOBAL_A");

await saveAutoStartPrompt("alice|conversation-a", "LOCAL_A");
const localA = await getAutoStartPrompt("alice|conversation-a");
assert(localA.text === "LOCAL_A" && localA.source === "conversation_override" && localA.is_override === true, "PER_CONVERSATION_OVERRIDE_NOT_PRESERVED");

await saveGlobalAutoStartPrompt("GLOBAL_B");
const localAfterGlobalChange = await getAutoStartPrompt("alice|conversation-a");
const secondConversation = await getAutoStartPrompt("alice|conversation-b");
assert(localAfterGlobalChange.text === "LOCAL_A", "GLOBAL_CHANGE_OVERWROTE_EXISTING_CUSTOM_OVERRIDE");
assert(secondConversation.text === "GLOBAL_B" && secondConversation.source === "global", "SECOND_CONVERSATION_DID_NOT_INHERIT_GLOBAL_B");

store[KEYS.AUTO_START_PROMPTS] = {
  ...(store[KEYS.AUTO_START_PROMPTS] || {}),
  "alice|legacy-default": { text: "OLD_COMPILED_DEFAULT", is_default: true, updated_at: "legacy" }
};
const legacy = await getAutoStartPrompt("alice|legacy-default");
assert(legacy.text === "GLOBAL_B" && legacy.source === "global", "LEGACY_DEFAULT_RECORD_DID_NOT_MIGRATE_TO_GLOBAL_INHERITANCE");
assert(!Object.prototype.hasOwnProperty.call(store[KEYS.AUTO_START_PROMPTS] || {}, "alice|legacy-default"), "LEGACY_DEFAULT_RECORD_NOT_PRUNED");

const resetLocal = await resetAutoStartPrompt("alice|conversation-a");
assert(resetLocal.text === "GLOBAL_B" && resetLocal.source === "global" && resetLocal.is_override === false, "LOCAL_RESET_DID_NOT_RETURN_TO_GLOBAL_INHERITANCE");

await saveAutoStartPrompt("alice|conversation-a", "LOCAL_A2");
store[KEYS.GLOBAL_AUTO_START_PROMPT] = { text: "STALE_DEFAULT", is_default: true, updated_at: "legacy" };
const migratedGlobal = await getGlobalAutoStartPrompt();
assert(migratedGlobal.text === DEFAULT_AUTO_START_TEXT && migratedGlobal.is_default === true, "STALE_GLOBAL_DEFAULT_DID_NOT_MIGRATE_TO_CURRENT_COMPILED_DEFAULT");
const stillLocal = await getAutoStartPrompt("alice|conversation-a");
assert(stillLocal.text === "LOCAL_A2" && stillLocal.source === "conversation_override", "GLOBAL_DEFAULT_MIGRATION_OVERWROTE_CUSTOM_OVERRIDE");

await saveGlobalAutoStartPrompt("GLOBAL_C");
await resetGlobalAutoStartPrompt();
const resetGlobal = await getGlobalAutoStartPrompt();
const localAfterGlobalReset = await getAutoStartPrompt("alice|conversation-a");
assert(resetGlobal.text === DEFAULT_AUTO_START_TEXT && resetGlobal.is_default === true, "GLOBAL_RESET_DID_NOT_RESTORE_COMPILED_DEFAULT");
assert(localAfterGlobalReset.text === "LOCAL_A2", "GLOBAL_RESET_DELETED_CUSTOM_OVERRIDE");

// Storage-only helper execution above had no provider/network primitive in its VM context.
console.log("BOOTSTRAP_PROMPT_GLOBAL_STORAGE_SEMANTICS_PASS");
console.log("BOOTSTRAP_PROMPT_NEW_CHAT_EDITABILITY_PASS");
console.log("BOOTSTRAP_PROMPT_CONVERSATION_OVERRIDE_ISOLATION_PASS");
console.log("BOOTSTRAP_PROMPT_LEGACY_DEFAULT_MIGRATION_PASS");
console.log("BOOTSTRAP_PROMPT_NO_FAKE_IDENTITY_PASS");
console.log("BOOTSTRAP_PROMPT_EDITABLE_NEW_CHAT_GATE_PASS");
