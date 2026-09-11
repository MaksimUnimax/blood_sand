#!/usr/bin/env python3
"""Apply lifecycle/generation guard to a block001 candidate, without provider calls."""
import hashlib,sys
from pathlib import Path
root=Path(sys.argv[1]).resolve();p=root/'content_script.js';s=p.read_text()
assert hashlib.sha256(p.read_bytes()).hexdigest()=='f0f92e82ef5d14ac5c77ebf3c2f5242785265cd64587fd9bdb6cb23fd24a96a6','Expected block001 content script'
s=s.replace('  function sleep(ms)', '''  const ownedListeners = [];
  function superseded() { return { ok: false, code: "CONTENT_RUNTIME_SUPERSEDED", error: "Content runtime superseded." }; }
  function assertCurrent() { if (!current()) throw Object.assign(new Error("Content runtime superseded."), { code: "CONTENT_RUNTIME_SUPERSEDED" }); }
  function assertConversation(key) {
    assertCurrent();
    if (key && key !== conversationKeyFromLocation()) throw Object.assign(new Error("Delivery belongs to another conversation."), { code: "CONVERSATION_MISMATCH" });
  }
  function listenOwned(target, type, handler, options) {
    const guarded = (...args) => { if (current()) return handler(...args); };
    target.addEventListener(type, guarded, options);
    ownedListeners.push(() => target.removeEventListener(type, guarded, options));
  }
  function sleep(ms)''',1)
s=s.replace('    return new Promise((resolve) => {\n      try {\n        chrome.runtime.sendMessage', '''    return new Promise((resolve) => {
      if (!current()) return resolve(superseded());
      if (payload.conversation_key && payload.conversation_key !== conversationKeyFromLocation()) return resolve({ok:false,code:"CONVERSATION_MISMATCH",error:"Command belongs to another conversation."});
      try {
        chrome.runtime.sendMessage''',1)
s=s.replace('          const err = chrome.runtime.lastError;','''          const err = chrome.runtime.lastError;
          if (!current()) return resolve(superseded());
          if (payload.conversation_key && payload.conversation_key !== conversationKeyFromLocation()) return resolve({ok:false,code:"CONVERSATION_MISMATCH",error:"Response belongs to another conversation."});''',1)
for sig in ['  function toast(text, tone = "info", timeout = 5000, key = "") {','  function replaceCopyButtonProfiles(value, reason = "update") {','  function applyManualMode(enabled, conversationKey = conversationKeyFromLocation()) {','  function beginAutoWatch(message) {']:
    assert sig in s;s=s.replace(sig,sig+'\n    if (!current()) return false;',1)
s=s.replace('  async function handleCopy(binding, button) {\n    if (!manualEnabled)', '  async function handleCopy(binding, button) {\n    if (!current() || !manualEnabled)',1)
s=s.replace('  function setComposerText(composer, text) {','  function setComposerText(composer, text) {\n    assertCurrent();',1)
s=s.replace('    while (Date.now() < deadline) {','    while (Date.now() < deadline) {\n      assertCurrent();',1)
s=s.replace('      const clickResult = BB2ComposerSend.clickSynchronously({','      assertCurrent();\n      const clickResult = BB2ComposerSend.clickSynchronously({',1)
s=s.replace('        beforeClick(snapshot) {','        beforeClick(snapshot) {\n          assertCurrent();',1)
s=s.replace('    return { resolveContext: primaryComposerContext,','''    const key = conversationKeyFromLocation();
    return { resolveContext: () => { assertConversation(key); return primaryComposerContext(); },''',1)
s=s.replace('  async function syncAllState() {','  async function syncAllState() {\n    if (!current()) return superseded();',1)
s=s.replace('    const response = await sendRuntime("WB_CONTENT_READY", { identity: here });','    const response = await sendRuntime("WB_CONTENT_READY", { identity: here });\n    if (!current()) return superseded();',1)
s=s.replace('    const response = await sendRuntime("WB_GET_MANUAL_STATE", { conversation_key: key });','    const response = await sendRuntime("WB_GET_MANUAL_STATE", { conversation_key: key });\n    if (!current()) return superseded();',1)
s=s.replace('    toast("Wildberries: передаю результат в ChatGPT…",','    assertConversation(conversationKey);\n    toast("Wildberries: передаю результат в ChatGPT…",',1)
s=s.replace('  async function sendAutoStart(messageText, runId, conversationKey = conversationKeyFromLocation()) {','  async function sendAutoStart(messageText, runId, conversationKey = conversationKeyFromLocation()) {\n    assertConversation(conversationKey);',1)
s=s.replace('  document.addEventListener(', '  listenOwned(document, ')
s=s.replace('  runtimeMessageListener = (message, _sender, sendResponse) => {','  runtimeMessageListener = (message, _sender, sendResponse) => {\n    if (!current()) return false;',1)
s=s.replace('  ]).then(([sendResponse, copyResponse]) => {','  ]).then(([sendResponse, copyResponse]) => {\n    if (!current()) return;',1)
s=s.replace('  }).finally(() => { void syncAllState(); });','  }).finally(() => { if (current()) void syncAllState(); });',1)
s=s.replace('    runtime.disposed = true;','    try { restoreButtonPicker(); } catch (_) {}\n    runtime.disposed = true;\n    for (const remove of ownedListeners.splice(0)) { try { remove(); } catch (_) {} }',1)
p.write_text(s)
print('BLOCK002_APPLIED',hashlib.sha256(p.read_bytes()).hexdigest())
