/* global BB2ConversationIdentity, BB2ManualControls, WordstatProtocol, BB2ComposerSend, BB2ProvenWritingCapture */
(() => {
  "use strict";

  const VERSION = "1.1.5";
  const runtimeId = `${VERSION}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const RUNTIME_KEY = "__WORDSTAT_MANUAL_BRIDGE_RUNTIME__";
  const STAGE_ATTR = "data-wordstat-bridge-stage";
  const STAGE_DELIVERY_ATTR = "data-wordstat-bridge-delivery";
  const SEND_RENDER_WAIT_MS = 2000;
  const SEND_TARGET_STABLE_SAMPLES = 3;
  const SEND_TARGET_SAMPLE_INTERVAL_MS = 200;
  const COMPOSER_SEND_RETRY_MS = 250;
  const MANUAL_INITIAL_BLOCK_LIMIT = 5;
  const MANUAL_INITIAL_NODE_LIMIT = 5000;
  const CURRENT_ROOT_SELECTOR = [
    '[data-writing-block="true"][data-testid="writing-block-container"]',
    '[data-writing-block-id][data-testid="writing-block-container"]',
    '[data-oai-writing-block-surface][data-writing-block="true"]'
  ].join(", ");
  const CURRENT_BODY_SELECTOR = "[data-writing-block-fullscreen-editor-region]";
  const LEGACY_BODY_SELECTOR = "#code-block-viewer";
  const BUSY = new Set();
  const DECORATED = new Map();
  let observer = null;
  let manualFlushTimer = null;
  const manualPendingRoots = new Set();
  const manualTrackedRoots = new Set();
  let manualTailRoot = null;
  let manualEnabled = false;
  let manualConversationKey = null;
  let runtimeMessageListener = null;
  let sendButtonProfile = null;
  let copyButtonProfiles = [];
  let pickerState = null;
  let copyPickerActive = false;
  let suppressPickerClick = false;
  const recoveryInFlight = new Set();
  const manualRecoveryInFlight = new Set();

  const AUTO_PROMPT_STABILITY_MS = 2000;
  const AUTO_PROMPT_DEBOUNCE_MS = 200;
  let autoObserver = null;
  let autoTimer = null;
  let activeAutoWatch = null;
  let autoFirstSeen = null;
  let autoTickInFlight = false;
  let identityPollTimer = null;
  let lastObservedConversationKey = null;

  const prior = globalThis[RUNTIME_KEY];
  if (prior?.dispose) { try { prior.dispose(); } catch (_) {} }
  const runtime = { id: runtimeId, disposed: false, dispose: null };
  globalThis[RUNTIME_KEY] = runtime;

  function current() { return !runtime.disposed && globalThis[RUNTIME_KEY] === runtime; }
  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function sha256Hex(value) {
    const bytes = new TextEncoder().encode(String(value || ""));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function assertRecoveryTextIntegrity(recovery) {
    const expected = String(recovery?.outgoing_hash || "").trim().toLowerCase();
    if (!expected) return true;
    const actual = await sha256Hex(String(recovery?.outgoing_text || ""));
    if (actual !== expected) {
      throw Object.assign(new Error("Сохранённый Wordstat delivery text не совпадает с его SHA-256. Автоматическая отправка заблокирована."), { code: "DELIVERY_INTEGRITY_MISMATCH" });
    }
    return true;
  }
  function canonicalText(value) { return String(value || "").replace(/\u00a0/g, " ").replace(/\r\n/g, "\n").trim(); }
  function normalizedDeliveryText(value) { return canonicalText(value).replace(/\s+/g, " ").trim(); }

  function turnSections() {
    return [...document.querySelectorAll('section[data-turn][data-turn-id]')];
  }

  globalThis.BB2CaptureEnvironment = Object.freeze({ turnSections });

  function assistantTurnIds() {
    return turnSections()
      .filter((section) => section.getAttribute("data-turn") === "assistant")
      .map((section) => section.getAttribute("data-turn-id"))
      .filter(Boolean);
  }

  function userTurnIds() {
    return turnSections()
      .filter((section) => section.getAttribute("data-turn") === "user")
      .map((section) => section.getAttribute("data-turn-id"))
      .filter(Boolean);
  }

  function userTurnRecords() {
    return turnSections()
      .filter((section) => section.getAttribute("data-turn") === "user")
      .map((section) => ({
        id: section.getAttribute("data-turn-id") || "",
        text: canonicalText(section.innerText || section.textContent || "")
      }))
      .filter((item) => item.id);
  }

  function matchingNewUserTurn(baselineIds, expectedText, requestId = "") {
    const baseline = baselineIds instanceof Set ? baselineIds : new Set(baselineIds || []);
    const expected = normalizedDeliveryText(expectedText);
    const requestToken = String(requestId || "").trim();
    for (const record of userTurnRecords()) {
      if (baseline.has(record.id)) continue;
      const actual = normalizedDeliveryText(record.text);
      if (expected && actual === expected) return record.id;
      if (requestToken && actual.includes("WORDSTAT_RESULT_V1") && actual.includes(requestToken)) return record.id;
    }
    return null;
  }

  function conversationIdentity() {
    const canonicalHref = document.querySelector('link[rel="canonical"][href]')?.href || "";
    return BB2ConversationIdentity.resolve({
      origin: location.origin,
      pathname: location.pathname,
      canonicalHref
    });
  }

  function conversationKeyFromLocation() {
    const here = conversationIdentity();
    if (!here?.origin || !here?.conversation_id || here.status !== "confirmed") return null;
    return `${String(here.origin).toLowerCase()}|${String(here.conversation_id).toLowerCase()}`;
  }

  function sameConversation(origin, conversationId) {
    const here = conversationIdentity();
    return Boolean(
      here?.status === "confirmed" &&
      here?.conversation_id &&
      String(here.origin || "").toLowerCase() === String(origin || "").toLowerCase() &&
      String(here.conversation_id).toLowerCase() === String(conversationId || "").toLowerCase()
    );
  }

  function sendRuntime(type, payload = {}) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type, ...payload }, (response) => {
          const err = chrome.runtime.lastError;
          if (err) return resolve({ ok: false, code: "RUNTIME_ERROR", error: err.message });
          resolve(response || { ok: false, code: "EMPTY_RESPONSE", error: "Пустой ответ service worker." });
        });
      } catch (error) {
        resolve({ ok: false, code: "RUNTIME_ERROR", error: String(error?.message || error) });
      }
    });
  }

  function recordContentDiagnostic(event, details = {}) {
    sendRuntime("WS_RECORD_DIAGNOSTIC", { event, details }).catch(() => null);
  }

  function ensureToastRoot() {
    let root = document.getElementById("wordstat-manual-bridge-toast-root");
    if (root) return root;
    root = document.createElement("div");
    root.id = "wordstat-manual-bridge-toast-root";
    Object.assign(root.style, { position: "fixed", right: "18px", bottom: "18px", zIndex: "2147483647", display: "grid", gap: "8px", maxWidth: "420px", pointerEvents: "none" });
    document.documentElement.appendChild(root);
    return root;
  }

  function toast(text, tone = "info", timeout = 5000) {
    const item = document.createElement("div");
    item.textContent = text;
    Object.assign(item.style, {
      font: "13px/1.4 system-ui, sans-serif", color: tone === "error" ? "#7f1d1d" : "#0f172a",
      background: tone === "error" ? "#fee2e2" : tone === "success" ? "#dcfce7" : "#e0f2fe",
      border: "1px solid rgba(15,23,42,.16)", borderRadius: "10px", padding: "10px 12px",
      boxShadow: "0 8px 24px rgba(15,23,42,.18)", pointerEvents: "auto", whiteSpace: "pre-wrap"
    });
    ensureToastRoot().appendChild(item);
    setTimeout(() => item.remove(), timeout);
    return item;
  }

  function visible(element) {
    if (!(element instanceof Element) || !element.isConnected) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  function isGenericAssistantCopy(button) {
    const token = [button.getAttribute("data-testid") || "", button.getAttribute("aria-label") || "", button.getAttribute("title") || "", button.textContent || ""].join(" ").toLowerCase();
    return (button.getAttribute("data-testid") || "") === "copy-turn-action-button" || /копировать\s+ответ|copy\s+response/u.test(token);
  }

  function looksLikeCopy(button) {
    if (!(button instanceof HTMLButtonElement) || isGenericAssistantCopy(button)) return false;
    const token = [button.getAttribute("data-testid") || "", button.getAttribute("aria-label") || "", button.getAttribute("title") || "", button.getAttribute("name") || "", button.textContent || ""].join(" ").toLowerCase();
    return (button.getAttribute("data-testid") || "").toLowerCase().includes("copy") || /(?:^|\s)(?:копировать|copy)(?:\s|$)/u.test(token) || Boolean(button.querySelector('svg use[href*="#ce3544"]'));
  }

  function normalizeCopyButtonProfiles(value) {
    return BB2ManualControls.normalizeCopyButtonProfileCollection(value).profiles;
  }

  function replaceCopyButtonProfiles(value, reason = "update") {
    copyButtonProfiles = normalizeCopyButtonProfiles(value);
    recordContentDiagnostic("COPY_BUTTON_PROFILES_UPDATED", { reason, custom_profile_count: copyButtonProfiles.length });
    if (manualEnabled) {
      for (const button of [...DECORATED.keys()]) restoreButton(button);
      decorateLatestExisting(MANUAL_INITIAL_BLOCK_LIMIT);
    }
  }

  function copyButtonSignature(button, adapterId) {
    const decoration = DECORATED.get(button);
    const title = decoration ? (decoration.title || "") : (button.getAttribute("title") || "");
    const testid = button.getAttribute("data-testid") || "";
    const aria = button.getAttribute("aria-label") || "";
    const name = button.getAttribute("name") || "";
    return {
      kind: "bb2_manual_copy_button_v2",
      profile_id: `ws-copy-profile-${crypto.randomUUID()}`,
      adapter_id: adapterId,
      tag: button.tagName.toLowerCase(),
      testid,
      aria,
      title,
      name,
      type: button.getAttribute("type") || "",
      text_hint: (testid || aria || title || name) ? "" : canonicalText(button.textContent || "").slice(0, 120),
      created_at: new Date().toISOString()
    };
  }

  function signatureMatchesCopyButton(profile, binding, button) {
    const normalized = BB2ManualControls.normalizeCopyButtonProfile(profile);
    if (!normalized || !(button instanceof HTMLButtonElement) || normalized.adapter_id !== binding?.adapter_id) return false;
    if (normalized.tag && button.tagName.toLowerCase() !== normalized.tag) return false;
    for (const [key, attribute] of [["testid", "data-testid"], ["aria", "aria-label"], ["title", "title"], ["name", "name"], ["type", "type"]]) {
      if (normalized[key] && (button.getAttribute(attribute) || "") !== normalized[key]) return false;
    }
    if (normalized.text_hint && canonicalText(button.textContent || "").slice(0, 120) !== normalized.text_hint) return false;
    return true;
  }

  function isLocalCopyForBinding(button, binding) {
    if (!(button instanceof HTMLButtonElement) || !binding || isGenericAssistantCopy(button)) return false;
    return looksLikeCopy(button) || copyButtonProfiles.some((profile) => signatureMatchesCopyButton(profile, binding, button));
  }

  function bindingFromRoot(root) {
    if (!(root instanceof Element)) return null;
    if (root.matches(CURRENT_ROOT_SELECTOR)) {
      const bodies = [...root.querySelectorAll(CURRENT_BODY_SELECTOR)];
      const section = root.closest('section[data-turn="assistant"][data-turn-id]');
      if (bodies.length === 1 && section) return { root, body: bodies[0], section, adapter_id: "current_writing_block_v1" };
    }
    if (root instanceof HTMLPreElement) {
      const bodies = [...root.querySelectorAll(LEGACY_BODY_SELECTOR)];
      const section = root.closest('section[data-turn="assistant"][data-turn-id]');
      if (bodies.length === 1 && section) return { root, body: bodies[0], section, adapter_id: "legacy_code_block_v1" };
    }
    return null;
  }

  function bindingFromButton(button) {
    if (!(button instanceof HTMLButtonElement) || isGenericAssistantCopy(button)) return null;
    const currentRoot = button.closest(CURRENT_ROOT_SELECTOR);
    const currentBinding = bindingFromRoot(currentRoot);
    if (currentBinding?.root.contains(button)) return currentBinding;
    const legacyRoot = button.closest("pre");
    const legacyBinding = bindingFromRoot(legacyRoot);
    return legacyBinding?.root.contains(button) ? legacyBinding : null;
  }

  function supportedBindingsInSection(section) {
    if (!(section instanceof Element)) return [];
    const roots = [
      ...section.querySelectorAll(CURRENT_ROOT_SELECTOR),
      ...section.querySelectorAll("pre")
    ];
    const bindings = [];
    const seen = new Set();
    for (const root of roots) {
      if (seen.has(root)) continue;
      seen.add(root);
      const binding = bindingFromRoot(root);
      if (binding) bindings.push(binding);
    }
    return bindings;
  }

  // Picker fallback must work precisely when the button no longer looks like a known Copy control.
  // Resolve a sibling-toolbar button back to one unique writing/code block using the proven locality rule.
  function bindingFromLocalCopyCandidate(button) {
    if (!(button instanceof HTMLButtonElement) || isGenericAssistantCopy(button)) return null;
    const direct = bindingFromButton(button);
    if (direct) return direct;
    const section = button.closest('section[data-turn="assistant"][data-turn-id]');
    if (!section) return null;
    const matches = supportedBindingsInSection(section).filter((binding) =>
      BB2ManualControls.chooseLocalWritingBlockCopyButton(section, binding.root, [button]) === button
    );
    return matches.length === 1 ? matches[0] : null;
  }

  function commandText(binding) {
    return canonicalText(binding?.body?.innerText || binding?.body?.textContent || "");
  }

  function ancestorDistance(node, ancestor) {
    let distance = 0;
    let currentNode = node;
    while (currentNode && currentNode !== ancestor) {
      currentNode = currentNode.parentElement || null;
      distance += 1;
    }
    return currentNode === ancestor ? distance : Number.POSITIVE_INFINITY;
  }

  function sharedAncestorWithin(left, right, boundary) {
    if (!left || !right || !boundary) return null;
    const rightAncestors = new Set();
    let currentNode = right;
    while (currentNode) {
      rightAncestors.add(currentNode);
      if (currentNode === boundary) break;
      currentNode = currentNode.parentElement || null;
    }
    currentNode = left;
    while (currentNode) {
      if (rightAncestors.has(currentNode)) return currentNode;
      if (currentNode === boundary) break;
      currentNode = currentNode.parentElement || null;
    }
    return null;
  }

  function chooseLocalCopyButton(section, explicitRoot, candidates) {
    const copies = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    if (!section || copies.length === 0) return null;
    if (!explicitRoot) return copies.length === 1 ? copies[0] : null;

    const inside = copies.filter((copy) => explicitRoot.contains(copy));
    if (inside.length === 1) return inside[0];
    if (inside.length > 1) return null;

    const ranked = copies.map((copy) => {
      const shared = sharedAncestorWithin(explicitRoot, copy, section);
      if (!shared || shared === section) return null;
      const score = ancestorDistance(explicitRoot, shared) + ancestorDistance(copy, shared);
      return Number.isFinite(score) ? { copy, score } : null;
    }).filter(Boolean).sort((a, b) => a.score - b.score);

    if (!ranked.length) return null;
    const bestScore = ranked[0].score;
    const best = ranked.filter((entry) => entry.score === bestScore);
    return best.length === 1 ? best[0].copy : null;
  }

  function localCopyButton(binding) {
    if (!binding) return null;
    const sectionCopies = [...binding.section.querySelectorAll("button")].filter((button) => isLocalCopyForBinding(button, binding));
    return chooseLocalCopyButton(binding.section, binding.root, sectionCopies);
  }

  function commandKey(binding, text) {
    const turn = binding.section.getAttribute("data-turn-id") || "assistant";
    const explicit = binding.root.getAttribute("data-writing-block-id") || binding.root.id || "block";
    let fingerprint = "00000000";
    try { fingerprint = WordstatProtocol.commandFingerprint(WordstatProtocol.parseCommand(text)); } catch (_) {}
    return `${turn}:${explicit}:${fingerprint}`;
  }

  function styleSnapshot(element, property) {
    return {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property)
    };
  }

  function restoreStyleSnapshot(element, property, snapshot) {
    if (!snapshot?.value) element.style.removeProperty(property);
    else element.style.setProperty(property, snapshot.value, snapshot.priority || "");
  }

  function restoreButton(button) {
    const old = DECORATED.get(button);
    if (!old) return;
    button.removeEventListener("click", old.handler, true);
    restoreStyleSnapshot(button, "color", old.styles.color);
    restoreStyleSnapshot(button, "background-color", old.styles.backgroundColor);
    restoreStyleSnapshot(button, "box-shadow", old.styles.boxShadow);
    if (old.title === null) button.removeAttribute("title");
    else button.setAttribute("title", old.title);
    DECORATED.delete(button);
  }

  async function handleCopy(binding, button) {
    if (!manualEnabled) return;
    const currentKey = conversationKeyFromLocation();
    if (manualConversationKey !== currentKey) {
      await syncManualState();
      if (!manualEnabled || manualConversationKey !== currentKey) return;
    }
    const text = commandText(binding);
    if (!WordstatProtocol.isCommandText(text)) {
      toast("Wordstat: это не WORDSTAT_API_V1. Выполнено только обычное копирование; API-запрос не отправлен.", "info", 5000);
      return;
    }
    let parsed;
    try { parsed = WordstatProtocol.parseCommand(text); }
    catch (error) {
      toast(`Wordstat: команда не выполнена — ${error.message}`, "error", 7000);
      return;
    }
    const key = commandKey(binding, text);
    if (BUSY.has(key)) {
      toast("Wordstat: этот блок уже выполняется. Повторный API-вызов не отправлен.", "info");
      return;
    }
    BUSY.add(key);
    const operationConversationKey = String(manualConversationKey || currentKey);
    const manualRequestId = crypto.randomUUID();
    let manualOperationId = "";
    toast(`Wordstat: отправляю ${parsed.method} в Yandex API…`, "info");
    try {
      const response = await sendRuntime("WS_EXECUTE_COMMAND", { command_text: text, conversation_key: operationConversationKey, manual_request_id: manualRequestId });
      manualOperationId = String(response.manual_operation_id || "");
      if (!response.report_text) throw Object.assign(new Error(response.error || "Yandex API не вернул отчёт."), { code: response.code || "NO_REPORT" });
      if (!response.ok) toast(`Wordstat API вернул ошибку ${response.http_status || ""}. Отчёт будет передан в чат.`, "error", 7000);
      else toast("Wordstat: ответ получен. Передаю результат в ChatGPT…", "success");
      const delivery = await deliverReport(response.outgoing_text || response.report_text, response.auto_send !== false, { confirmUserTurn: response.auto_send !== false, runId: `manual:${manualOperationId || operationConversationKey}`, deliveryId: response.delivery_id || `manual-${response.request_id || Date.now()}`, requestId: response.request_id || "", requireCommit: false, conversationKey: operationConversationKey });
      if (manualOperationId) {
        const completion = await sendRuntime("WS_MANUAL_DELIVERY_COMPLETE", {
          conversation_key: operationConversationKey,
          manual_operation_id: manualOperationId,
          delivery_confirmed: delivery.delivery_confirmed === true,
          confirmed_user_turn_id: delivery.confirmed_user_turn_id || null,
          composer_empty: delivery.composer_empty === true,
          click_attempts: Number(delivery.click_attempts || 0)
        });
        if (!completion?.ok) throw Object.assign(new Error(completion?.error || "Не удалось завершить manual operation."), { code: completion?.code || "MANUAL_DELIVERY_COMPLETE_REJECTED" });
      }
      if (delivery.delivery_confirmed) {
        await sendRuntime("WS_REPORT_DELIVERY_CONFIRMED", {
          conversation_key: operationConversationKey,
          report_prefix_applied: response.report_prefix_applied === true,
          delivery_id: response.delivery_id || ""
        });
      }
    } catch (error) {
      if (manualOperationId) {
        await sendRuntime("WS_MANUAL_DELIVERY_FAILED", {
          conversation_key: operationConversationKey,
          manual_operation_id: manualOperationId,
          code: error.code || "MANUAL_DELIVERY_FAILED",
          error: error.message || String(error)
        }).catch(() => null);
      }
      toast(`Wordstat: ${error.message}`, "error", 9000);
    } finally {
      BUSY.delete(key);
    }
  }

  function decorateBinding(binding) {
    if (!manualEnabled) return false;
    const button = localCopyButton(binding);
    if (!button || DECORATED.has(button)) return false;
    const old = {
      title: button.hasAttribute("title") ? button.getAttribute("title") : null,
      styles: {
        color: styleSnapshot(button, "color"),
        backgroundColor: styleSnapshot(button, "background-color"),
        boxShadow: styleSnapshot(button, "box-shadow")
      },
      in_flight: false,
      handler: null
    };
    old.handler = () => {
      if (!manualEnabled) return;
      if (old.in_flight) {
        toast("Wordstat: этот блок уже выполняется. Повторный API-вызов не отправлен.", "info", 5000);
        return;
      }
      old.in_flight = true;
      // Native Copy is intentionally not prevented.
      // Native Copy remains untouched. Whether the clicked block is a WORDSTAT_API_V1 command is checked only after the user's click.
      queueMicrotask(() => handleCopy(binding, button).finally(() => { old.in_flight = false; }));
    };
    button.addEventListener("click", old.handler, true);
    // Same visual contract as Business Bridge manual mode, but Yandex-yellow instead of blue.
    button.style.setProperty("color", "#ffcc00", "important");
    button.style.setProperty("background-color", "rgba(255, 204, 0, 0.22)", "important");
    button.style.setProperty("box-shadow", "inset 0 0 0 1px rgba(255, 204, 0, 0.85)", "important");
    button.setAttribute("title", "Wordstat manual mode: обычный Copy + попытка выполнить этот writing block как WORDSTAT_API_V1");
    DECORATED.set(button, old);
    return true;
  }

  function candidateRootsFromAddedNode(node) {
    if (!(node instanceof Element)) return [];
    const roots = new Set();
    const addRoot = (candidate) => {
      const binding = bindingFromRoot(candidate);
      if (binding) roots.add(binding.root);
    };
    const addFromElement = (candidate) => {
      if (!(candidate instanceof Element)) return;
      if (candidate.matches(CURRENT_ROOT_SELECTOR)) addRoot(candidate);
      if (candidate.matches(CURRENT_BODY_SELECTOR)) addRoot(candidate.closest(CURRENT_ROOT_SELECTOR));
      if (candidate.id === "code-block-viewer") addRoot(candidate.closest("pre"));
      if (candidate instanceof HTMLButtonElement) addRoot(bindingFromButton(candidate)?.root);
    };
    addFromElement(node);
    for (const currentRoot of node.querySelectorAll(CURRENT_ROOT_SELECTOR)) addRoot(currentRoot);
    for (const currentBody of node.querySelectorAll(CURRENT_BODY_SELECTOR)) addRoot(currentBody.closest(CURRENT_ROOT_SELECTOR));
    for (const viewer of node.querySelectorAll(LEGACY_BODY_SELECTOR)) addRoot(viewer.closest("pre"));
    for (const button of node.querySelectorAll("button")) addRoot(bindingFromButton(button)?.root);
    return [...roots];
  }

  function rootDocumentOrder(left, right) {
    if (left === right) return 0;
    const relation = left.compareDocumentPosition(right);
    return relation & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  }

  function processNewManualRoot(root) {
    const binding = bindingFromRoot(root);
    if (!manualEnabled || !binding || !binding.root.isConnected) return false;
    root = binding.root;
    if (manualTrackedRoots.has(root)) return decorateBinding(binding);
    if (!manualTailRoot || !manualTailRoot.isConnected) {
      manualTailRoot = root;
      manualTrackedRoots.add(root);
      return decorateBinding(binding);
    }
    if (root === manualTailRoot) {
      manualTrackedRoots.add(root);
      return decorateBinding(binding);
    }
    const relation = manualTailRoot.compareDocumentPosition(root);
    // Match Business Bridge semantics: ignore old/history DOM inserted before the tail after manual mode was enabled.
    if (!(relation & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
    manualTailRoot = root;
    manualTrackedRoots.add(root);
    return decorateBinding(binding);
  }

  function flushManualRoots() {
    manualFlushTimer = null;
    if (!manualEnabled) {
      manualPendingRoots.clear();
      return;
    }
    for (const button of [...DECORATED.keys()]) {
      if (!button.isConnected) DECORATED.delete(button);
    }
    for (const root of [...manualTrackedRoots]) {
      if (!root.isConnected) manualTrackedRoots.delete(root);
    }
    const roots = [...manualPendingRoots].sort(rootDocumentOrder);
    manualPendingRoots.clear();
    roots.forEach(processNewManualRoot);
  }

  function queueManualRoot(root) {
    const binding = bindingFromRoot(root);
    if (!manualEnabled || !binding) return;
    manualPendingRoots.add(binding.root);
    if (manualFlushTimer) return;
    manualFlushTimer = setTimeout(flushManualRoots, 60);
  }

  function previousElementInDocumentOrder(node, boundary) {
    if (!(node instanceof Element) || !(boundary instanceof Element)) return null;
    if (node.previousElementSibling) {
      let candidate = node.previousElementSibling;
      while (candidate.lastElementChild) candidate = candidate.lastElementChild;
      return candidate;
    }
    const parent = node.parentElement;
    return parent && parent !== boundary ? parent : null;
  }

  function latestManualBlockRoots(limit = MANUAL_INITIAL_BLOCK_LIMIT, nodeLimit = MANUAL_INITIAL_NODE_LIMIT) {
    const boundary = document.querySelector("main") || document.body || document.documentElement;
    if (!(boundary instanceof Element)) return { roots: [], visitedNodes: 0, capped: false };
    const roots = [];
    const seen = new Set();
    let node = boundary.lastElementChild;
    while (node?.lastElementChild) node = node.lastElementChild;
    let visited = 0;
    while (node && roots.length < limit && visited < nodeLimit) {
      visited += 1;
      let binding = null;
      if (node.matches(CURRENT_ROOT_SELECTOR)) binding = bindingFromRoot(node);
      else if (node.matches(CURRENT_BODY_SELECTOR)) binding = bindingFromRoot(node.closest(CURRENT_ROOT_SELECTOR));
      else if (node.id === "code-block-viewer") binding = bindingFromRoot(node.closest("pre"));
      if (binding && !seen.has(binding.root)) {
        seen.add(binding.root);
        roots.push(binding.root);
      }
      node = previousElementInDocumentOrder(node, boundary);
    }
    roots.reverse();
    return { roots, visitedNodes: visited, capped: Boolean(node && roots.length < limit) };
  }

  function decorateLatestExisting(limit = MANUAL_INITIAL_BLOCK_LIMIT) {
    if (!manualEnabled) return;
    const scan = latestManualBlockRoots(limit);
    scan.roots.forEach((root) => {
      manualTrackedRoots.add(root);
      const binding = bindingFromRoot(root);
      if (binding) decorateBinding(binding);
    });
    manualTailRoot = scan.roots.at(-1) || null;
  }

  function stopManualObserver() {
    manualEnabled = false;
    if (observer) observer.disconnect();
    observer = null;
    if (manualFlushTimer) clearTimeout(manualFlushTimer);
    manualFlushTimer = null;
    manualPendingRoots.clear();
    manualTrackedRoots.clear();
    manualTailRoot = null;
    for (const button of [...DECORATED.keys()]) restoreButton(button);
  }

  function startManualObserver() {
    if (!current() || !manualEnabled || observer) return;
    decorateLatestExisting(MANUAL_INITIAL_BLOCK_LIMIT);
    observer = new MutationObserver((records) => {
      if (!manualEnabled) return;
      const currentKey = conversationKeyFromLocation();
      if (manualConversationKey !== currentKey) {
        void syncAllState();
        return;
      }
      for (const record of records) {
        for (const node of record.addedNodes || []) {
          if (!(node instanceof Element)) continue;
          candidateRootsFromAddedNode(node).forEach(queueManualRoot);
        }
      }
    });
    const observerRoot = document.querySelector("main") || document.body || document.documentElement;
    observer.observe(observerRoot, { childList: true, subtree: true });
  }

  function applyManualMode(enabled, conversationKey = conversationKeyFromLocation()) {
    const next = enabled === true;
    const key = conversationKey || conversationKeyFromLocation();
    if (!key) {
      stopManualObserver();
      manualConversationKey = null;
      return false;
    }
    if (manualConversationKey && manualConversationKey !== key) stopManualObserver();
    manualConversationKey = String(key);
    if (next) {
      if (manualEnabled && observer) return true;
      manualEnabled = true;
      startManualObserver();
    } else {
      if (!manualEnabled && !observer && DECORATED.size === 0) return true;
      stopManualObserver();
      manualConversationKey = String(key);
    }
    console.info(`[Wordstat Manual Bridge ${VERSION}] manual mode ${next ? "ON" : "OFF"} for ${key}`);
    return true;
  }

  async function syncManualState() {
    const key = conversationKeyFromLocation();
    if (!key) {
      applyManualMode(false, null);
      return { ok: false, code: "CONVERSATION_NOT_CONFIRMED" };
    }
    const response = await sendRuntime("WS_GET_MANUAL_STATE", { conversation_key: key });
    applyManualMode(response?.ok && response.enabled === true, key);
    return response;
  }

  function insideAssistantEditor(node) {
    return Boolean(node?.closest?.('section[data-turn="assistant"], [data-message-author-role="assistant"], [data-writing-block], [data-writing-block-id], #code-block-viewer'));
  }

  function composerContextFromNode(node) {
    if (!(node instanceof HTMLElement) || !visible(node) || insideAssistantEditor(node)) return null;
    const form = node.closest("form");
    if (!form || insideAssistantEditor(form)) return null;
    return { composer: node, form };
  }

  function primaryComposerContext() {
    const selectors = ["#prompt-textarea", '[data-testid="prompt-textarea"]', 'textarea[id*="prompt" i]', 'textarea[data-testid*="prompt" i]', '[contenteditable="true"][id*="prompt" i]', '[contenteditable="true"][data-testid*="prompt" i]'];
    const candidates = [];
    for (const selector of selectors) {
      for (const node of document.querySelectorAll(selector)) {
        const context = composerContextFromNode(node);
        if (!context) continue;
        let score = 0;
        if (node.id === "prompt-textarea") score += 1000;
        if ((node.getAttribute("data-testid") || "") === "prompt-textarea") score += 800;
        if (context.form.closest("#composer-background, [data-testid*='composer' i]")) score += 400;
        score += Math.min(200, node.getBoundingClientRect().top);
        candidates.push({ context, score });
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0]?.context || null;
  }

  function composerText(composer) {
    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) return composer.value || "";
    return composer.textContent || "";
  }

  function setComposerText(composer, text) {
    composer.focus();
    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(composer), "value");
      const setter = descriptor?.set;
      if (!setter) throw new Error("Composer value setter unavailable.");
      setter.call(composer, text);
    } else {
      composer.textContent = text;
    }
    composer.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    composer.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function buttonToken(button) {
    return [button.getAttribute("data-testid") || "", button.getAttribute("aria-label") || "", button.getAttribute("title") || "", button.getAttribute("name") || "", button.getAttribute("type") || "", button.textContent || ""].join(" ").toLowerCase();
  }

  function manualButtonSignature(button) {
    const testid = button.getAttribute("data-testid") || "";
    const aria = button.getAttribute("aria-label") || "";
    const title = button.getAttribute("title") || "";
    const name = button.getAttribute("name") || "";
    return {
      kind: "bb2_manual_send_button_v1",
      tag: button.tagName.toLowerCase(),
      testid, aria, title, name,
      type: button.getAttribute("type") || "",
      text_hint: (testid || aria || title || name) ? "" : canonicalText(button.textContent || "").slice(0, 120),
      form_index: null
    };
  }

  function signatureMatchesButton(profile, button) {
    if (!profile || profile.kind !== "bb2_manual_send_button_v1" || !(button instanceof HTMLElement)) return false;
    if (profile.tag && button.tagName.toLowerCase() !== profile.tag) return false;
    for (const [key, attribute] of [["testid", "data-testid"], ["aria", "aria-label"], ["title", "title"], ["name", "name"], ["type", "type"]]) {
      if (profile[key] && (button.getAttribute(attribute) || "") !== profile[key]) return false;
    }
    if (profile.text_hint && canonicalText(button.textContent || "").slice(0, 120) !== profile.text_hint) return false;
    return true;
  }

  function manualSendButton(context) {
    if (!sendButtonProfile || !context?.form) return null;
    const candidates = [...context.form.querySelectorAll('button, [role="button"], input[type="submit"]')]
      .filter((button) => signatureMatchesButton(sendButtonProfile, button))
      .filter((button) => visible(button) && !insideAssistantEditor(button))
      .filter((button) => !(button instanceof HTMLButtonElement && button.disabled) && button.getAttribute("aria-disabled") !== "true");
    if (candidates.length === 1) return candidates[0];
    if (Number.isInteger(sendButtonProfile.form_index)) {
      const all = [...context.form.querySelectorAll('button, [role="button"], input[type="submit"]')];
      const indexed = all[sendButtonProfile.form_index] || null;
      if (indexed && candidates.includes(indexed)) return indexed;
    }
    return null;
  }

  function sendButtonCandidates(context) {
    if (!context?.form?.contains(context.composer)) return [];
    if (sendButtonProfile) {
      const manualCandidates = [...context.form.querySelectorAll('button, [role="button"], input[type="submit"]')]
        .filter((button) => signatureMatchesButton(sendButtonProfile, button))
        .filter((button) => button instanceof HTMLElement && visible(button) && !insideAssistantEditor(button))
        .filter((button) => !(button instanceof HTMLButtonElement && button.disabled) && button.getAttribute("aria-disabled") !== "true");
      if (manualCandidates.length > 0) return manualCandidates;
    }
    return [...context.form.querySelectorAll('button, [role="button"], input[type="submit"]')]
      .filter((button) => button instanceof HTMLElement && visible(button) && !insideAssistantEditor(button))
      .filter((button) => !(button instanceof HTMLButtonElement && button.disabled) && button.getAttribute("aria-disabled") !== "true")
      .filter((button) => !/stop|cancel|abort|останов|отмен/.test(buttonToken(button)))
      .map((button) => {
        const token = buttonToken(button);
        let score = 0;
        if ((button.getAttribute("data-testid") || "").toLowerCase().includes("send")) score += 1000;
        if (/\bsend\b|отправ/.test(token)) score += 600;
        if ((button.getAttribute("type") || "").toLowerCase() === "submit") score += 300;
        return { button, score };
      }).sort((a, b) => b.score - a.score);
  }

  function sendButton(context) {
    if (!context?.form?.contains(context.composer)) return null;
    if (sendButtonProfile) {
      const manual = manualSendButton(context);
      if (manual) return manual;
    }
    const candidates = sendButtonCandidates(context);
    const top = candidates[0];
    if (!top) return null;
    if (top.score >= 600) return candidates.filter((x) => x.score === top.score).length === 1 ? top.button : null;
    const submitOnly = candidates.filter((x) => x.score === 300);
    return submitOnly.length === 1 ? submitOnly[0].button : null;
  }

  function sendButtonFingerprint(button) {
    if (!(button instanceof HTMLElement)) return "";
    return [
      button.tagName,
      button.getAttribute("data-testid") || "",
      button.getAttribute("aria-label") || "",
      button.getAttribute("title") || "",
      button.getAttribute("type") || "",
      button.getAttribute("name") || ""
    ].join("|");
  }

  function composerSendDeps() {
    return { resolveContext: primaryComposerContext, resolveButton: sendButton, candidateButtons: sendButtonCandidates, visible, readComposerText: composerText, fingerprint: sendButtonFingerprint, sleep };
  }

  async function waitForStableSendTarget(timeoutMs = 10000, expectedText = null) {
    return BB2ComposerSend.waitForValidatedTarget({
      expectedText,
      timeoutMs,
      sampleIntervalMs: SEND_TARGET_SAMPLE_INTERVAL_MS,
      requiredStableSamples: SEND_TARGET_STABLE_SAMPLES,
      deps: composerSendDeps()
    });
  }

  async function stabilizeComposerForSend(expectedText, area, details = {}) {
    const startedAt = Date.now();
    const minimumReadyAt = startedAt + SEND_RENDER_WAIT_MS;
    const deadline = startedAt + Math.max(8000, SEND_RENDER_WAIT_MS + 4000);
    let stableSamples = 0;
    let lastComposer = null;
    recordContentDiagnostic(`${area}_COMPOSER_STABILIZATION_STARTED`, { ...details, minimum_wait_ms: SEND_RENDER_WAIT_MS });
    while (Date.now() < deadline) {
      const context = primaryComposerContext();
      const exactText = Boolean(context) && normalizedDeliveryText(composerText(context.composer)) === normalizedDeliveryText(expectedText);
      if (context && exactText && context.composer.isConnected && context.form.isConnected) {
        stableSamples = context.composer === lastComposer ? stableSamples + 1 : 1;
        lastComposer = context.composer;
        if (Date.now() >= minimumReadyAt && stableSamples >= SEND_TARGET_STABLE_SAMPLES) {
          recordContentDiagnostic(`${area}_COMPOSER_STABILIZED`, { ...details, elapsed_ms: Date.now() - startedAt, stable_samples: stableSamples, composer_tag: context.composer.tagName, contenteditable: context.composer.getAttribute("contenteditable") || null });
          return context;
        }
      } else {
        stableSamples = 0;
        lastComposer = null;
      }
      await sleep(SEND_TARGET_SAMPLE_INTERVAL_MS);
    }
    recordContentDiagnostic(`${area}_COMPOSER_STABILIZATION_FAILED`, { ...details, elapsed_ms: Date.now() - startedAt, composer_present: Boolean(primaryComposerContext()) });
    throw new Error("Нижнее поле ChatGPT не подтвердило устойчивое состояние после программной вставки текста.");
  }

  async function clickComposerUntilEmpty({ area, runId, details = {} }) {
    let clickAttempts = 0;
    while (current()) {
      const context = primaryComposerContext();
      if (!context) {
        recordContentDiagnostic(`${area}_COMPOSER_WAITING`, { ...details, run_id: runId, reason: "composer_missing", click_attempts: clickAttempts });
        await sleep(COMPOSER_SEND_RETRY_MS);
        continue;
      }
      const currentText = canonicalText(composerText(context.composer));
      if (!currentText) {
        recordContentDiagnostic(`${area}_COMPOSER_EMPTY`, { ...details, run_id: runId, click_attempts: clickAttempts });
        return { composer_empty: true, click_attempts: clickAttempts };
      }
      const target = await waitForStableSendTarget(10000, null);
      if (!target) {
        recordContentDiagnostic(`${area}_SEND_BUTTON_WAITING`, { ...details, run_id: runId, click_attempts: clickAttempts });
        await sleep(COMPOSER_SEND_RETRY_MS);
        continue;
      }
      const clickResult = BB2ComposerSend.clickSynchronously({
        target,
        expectedText: null,
        deps: composerSendDeps(),
        beforeClick(snapshot) {
          recordContentDiagnostic(`${area}_PRE_SEND_SNAPSHOT`, { ...details, run_id: runId, click_attempt: clickAttempts + 1, ...snapshot });
        }
      });
      clickAttempts += 1;
      recordContentDiagnostic(`${area}_SEND_CALLED`, { ...details, run_id: runId, click_attempt: clickAttempts, click_method: clickResult.method, click_event_observed: clickResult.click_event_observed, ...clickResult.trace });
      await sleep(COMPOSER_SEND_RETRY_MS);
    }
    throw Object.assign(new Error("Content runtime superseded during composer send."), { code: "CONTENT_RUNTIME_SUPERSEDED" });
  }

  async function waitForMatchingNewUserTurn(baselineIds, expectedText, requestId = "", timeoutMs = 15000) {
    const baseline = baselineIds instanceof Set ? baselineIds : new Set(baselineIds || []);
    const deadline = Date.now() + timeoutMs;
    while (current() && Date.now() < deadline) {
      const next = matchingNewUserTurn(baseline, expectedText, requestId);
      if (next) return next;
      await sleep(150);
    }
    return null;
  }

  async function waitForComposerEmpty(timeoutMs = 7000) {
    const deadline = Date.now() + timeoutMs;
    while (current() && Date.now() < deadline) {
      const context = primaryComposerContext();
      if (context && !canonicalText(composerText(context.composer))) return true;
      await sleep(120);
    }
    return false;
  }

  async function deliverReport(reportText, autoSend, { confirmUserTurn = false, runId = "manual", deliveryId = "", requestId = "", requireCommit = false, conversationKey = "" } = {}) {
    const assistantBaselineIds = assistantTurnIds();
    const baselineUsers = new Set(userTurnIds());
    const context = primaryComposerContext();
    if (!context) throw new Error("Не найдено нижнее поле ChatGPT для результата.");
    const existing = canonicalText(composerText(context.composer));
    const existingStage = context.composer.getAttribute(STAGE_DELIVERY_ATTR) || "";
    const ownsStage = context.composer.getAttribute(STAGE_ATTR) === "1" && Boolean(deliveryId) && existingStage === deliveryId;
    if (existing && !ownsStage && normalizedDeliveryText(existing) !== normalizedDeliveryText(reportText)) {
      throw new Error("В поле ChatGPT уже есть неотправленный текст до подготовки отчёта.");
    }
    if (!existing || !ownsStage) setComposerText(context.composer, reportText);
    recordContentDiagnostic(existing && ownsStage ? "DELIVERY_TEXT_REUSED" : "DELIVERY_TEXT_STAGED", { run_id: runId, delivery_id: deliveryId || null });
    if (deliveryId) {
      context.composer.setAttribute(STAGE_ATTR, "1");
      context.composer.setAttribute(STAGE_DELIVERY_ATTR, deliveryId);
    }
    if (!autoSend) {
      toast("Wordstat: результат помещён в composer. Нажмите Send вручную.", "success", 8000);
      return { sent: false, delivery_confirmed: false, composer_empty: false, click_attempts: 0, assistant_baseline_ids: assistantBaselineIds };
    }
    await stabilizeComposerForSend(reportText, "DELIVERY", { run_id: runId, delivery_id: deliveryId || null, reused_existing_text: Boolean(existing && ownsStage) });
    const preCommitTarget = await waitForStableSendTarget(10000, reportText);
    if (!preCommitTarget) throw Object.assign(new Error("Send-кнопка не готова до delivery commit."), { code: "DELIVERY_SEND_TARGET_NOT_READY_BEFORE_COMMIT" });
    if (requireCommit) {
      const commit = await sendRuntime("WS_AUTO_DELIVERY_COMMIT_REQUEST", {
        run_id: runId,
        delivery_id: deliveryId,
        conversation_key: conversationKey,
        baseline_user_turn_ids: [...baselineUsers],
        actor_id: runtimeId
      });
      if (!commit.ok || !commit.committed) throw Object.assign(new Error(commit.error || "Wordstat delivery commit rejected."), { code: commit.code || "DELIVERY_COMMIT_REJECTED" });
      if (commit.click_allowed !== true) {
        recordContentDiagnostic("DELIVERY_COMMITTED_BY_OTHER_RUNTIME", { run_id: runId, delivery_id: deliveryId || null, actor_id: runtimeId });
        return { sent: false, committed_elsewhere: true, commit_recovery: commit.recovery || null, delivery_confirmed: false, composer_empty: false, click_attempts: 0, assistant_baseline_ids: assistantBaselineIds };
      }
    }
    const sent = await clickComposerUntilEmpty({ area: "DELIVERY", runId, details: { delivery_id: deliveryId || null } });
    const currentContext = primaryComposerContext();
    if (currentContext && deliveryId) {
      currentContext.composer.removeAttribute(STAGE_ATTR);
      currentContext.composer.removeAttribute(STAGE_DELIVERY_ATTR);
    }
    let confirmedUserTurnId = null;
    if (confirmUserTurn) confirmedUserTurnId = await waitForMatchingNewUserTurn(baselineUsers, reportText, requestId, 15000);
    const confirmed = confirmUserTurn ? Boolean(confirmedUserTurnId) : sent.composer_empty === true;
    recordContentDiagnostic("DELIVERY_USER_TURN_CONFIRMATION", { run_id: runId, delivery_id: deliveryId || null, confirmed, confirmed_user_turn_id: confirmedUserTurnId || null, composer_empty: sent.composer_empty === true, click_attempts: sent.click_attempts });
    if (confirmed) toast("Wordstat: результат отправлен в чат.", "success", 5000);
    else toast("Wordstat: composer опустел, но matching user-turn не подтверждён. Delivery сохранена; повторный Send/API запрещён, будет только reconciliation.", "error", 9000);
    return {
      sent: true,
      delivery_confirmed: confirmed,
      confirmed_user_turn_id: confirmedUserTurnId,
      composer_empty: sent.composer_empty === true,
      click_attempts: sent.click_attempts,
      assistant_baseline_ids: assistantBaselineIds
    };
  }

  async function sendAutoStart(messageText, runId, conversationKey = conversationKeyFromLocation()) {
    const initialContext = primaryComposerContext();
    if (!initialContext) throw Object.assign(new Error("Не найдено нижнее поле ChatGPT."), { code: "COMPOSER_NOT_FOUND" });
    const existing = canonicalText(composerText(initialContext.composer));
    if (existing && normalizedDeliveryText(existing) !== normalizedDeliveryText(messageText)) {
      throw Object.assign(new Error("Нижнее поле содержит неотправленный текст до подготовки команды запуска."), { code: "COMPOSER_CONTAINS_OTHER_TEXT" });
    }

    // Reference parity: Start confirmation is based on the committed Send making the composer empty.
    // Unlike result delivery, the happy path MUST NOT wait for or require a matching user-turn DOM record.
    const assistantBaselineIds = assistantTurnIds();
    if (!existing) setComposerText(initialContext.composer, messageText);
    recordContentDiagnostic(existing ? "START_TEXT_REUSED" : "START_TEXT_STAGED", { run_id: runId });

    await stabilizeComposerForSend(messageText, "START", { run_id: runId, reused_existing_text: Boolean(existing) });
    const preCommitTarget = await waitForStableSendTarget(10000, messageText);
    if (!preCommitTarget) throw Object.assign(new Error("Send-кнопка не готова до start commit."), { code: "START_SEND_TARGET_NOT_READY_BEFORE_COMMIT" });

    const commit = await sendRuntime("WS_AUTO_START_COMMIT_REQUEST", {
      run_id: runId,
      conversation_key: conversationKey,
      baseline_user_turn_ids: [],
      actor_id: runtimeId
    });
    if (!commit.ok || !commit.committed) throw Object.assign(new Error(commit.error || "Wordstat start commit rejected."), { code: commit.code || "START_COMMIT_REJECTED" });
    if (commit.click_allowed !== true) {
      recordContentDiagnostic("START_COMMITTED_BY_OTHER_RUNTIME", { run_id: runId, actor_id: runtimeId });
      return {
        committed: true,
        sent: false,
        committed_elsewhere: true,
        composer_empty: false,
        click_attempts: 0,
        assistant_baseline_ids: assistantBaselineIds,
        run_id: runId,
        identity: conversationIdentity()
      };
    }

    const sent = await clickComposerUntilEmpty({ area: "START", runId });
    toast("Wordstat Autorun: запуск отправлен. Жду новый WORDSTAT_API_V1 block.", "success", 6000);
    return {
      committed: true,
      sent: true,
      composer_empty: sent.composer_empty === true,
      click_attempts: sent.click_attempts,
      assistant_baseline_ids: assistantBaselineIds,
      run_id: runId,
      identity: conversationIdentity()
    };
  }

  async function currentRecovery(conversationKey, runId) {
    const response = await sendRuntime("WS_GET_AUTO_RECOVERY", { conversation_key: conversationKey, run_id: runId });
    if (!response?.ok) return null;
    return response.recovery || null;
  }

  async function reconcileCommittedStart(recovery) {
    if (!recovery || !sameConversation(recovery.origin, recovery.conversation_id) || recovery.conversation_key !== conversationKeyFromLocation()) return false;
    const baseline = new Set(recovery.baseline_user_turn_ids || []);
    const confirmedUserTurnId = await waitForMatchingNewUserTurn(baseline, recovery.message_text || "", "", 8000);
    if (!confirmedUserTurnId) {
      recordContentDiagnostic("START_RECONCILIATION_PENDING", { run_id: recovery.run_id });
      toast("Wordstat Autorun: start уже committed, но соответствующий user-turn не найден. Повторный Send запрещён; оставляю run для reconciliation.", "error", 9000);
      return false;
    }
    const completion = await sendRuntime("WS_AUTO_START_COMPLETE", {
      run_id: recovery.run_id,
      conversation_key: recovery.conversation_key,
      actor_id: runtimeId,
      reconcile: true,
      start_confirmed: true,
      confirmed_user_turn_id: confirmedUserTurnId,
      composer_empty: true,
      click_attempts: 0,
      assistant_baseline_ids: assistantTurnIds()
    });
    if (!completion?.ok) throw Object.assign(new Error(completion?.error || "Start reconciliation rejected."), { code: completion?.code || "START_RECONCILIATION_REJECTED" });
    toast("Wordstat Autorun: ранее committed start подтверждён по существующему user-turn. Повторный Send не выполнялся.", "success", 7000);
    return true;
  }

  async function reconcileCommittedDelivery(recovery) {
    if (!recovery || !sameConversation(recovery.origin, recovery.conversation_id) || recovery.conversation_key !== conversationKeyFromLocation()) return false;
    await assertRecoveryTextIntegrity(recovery);
    const baseline = new Set(recovery.baseline_user_turn_ids || []);
    const confirmedUserTurnId = await waitForMatchingNewUserTurn(baseline, recovery.outgoing_text || "", recovery.request_id || "", 8000);
    if (!confirmedUserTurnId) {
      recordContentDiagnostic("DELIVERY_RECONCILIATION_PENDING", { run_id: recovery.run_id, delivery_id: recovery.delivery_id || null, request_id: recovery.request_id || null });
      toast("Wordstat Autorun: delivery уже committed, но matching user-turn пока не найден. Повторный Send и повторный Yandex API запрещены; оставляю доставку для reconciliation.", "error", 9000);
      return false;
    }
    const completion = await sendRuntime("WS_AUTO_DELIVERY_COMPLETE", {
      run_id: recovery.run_id,
      conversation_key: recovery.conversation_key,
      delivery_confirmed: true,
      confirmed_user_turn_id: confirmedUserTurnId,
      composer_empty: true,
      click_attempts: 0,
      delivery_id: recovery.delivery_id,
      assistant_baseline_ids: assistantTurnIds()
    });
    if (!completion?.ok) throw Object.assign(new Error(completion?.error || "Delivery reconciliation rejected."), { code: completion?.code || "DELIVERY_RECONCILIATION_REJECTED" });
    toast("Wordstat Autorun: ранее committed результат подтверждён по существующему user-turn. Повторный Send/API не выполнялся.", "success", 7000);
    return true;
  }

  async function performClaimedDelivery(recovery) {
    if (!recovery || !sameConversation(recovery.origin, recovery.conversation_id) || recovery.conversation_key !== conversationKeyFromLocation()) {
      throw Object.assign(new Error("Recovery delivery адресована другому ChatGPT-диалогу."), { code: "CONVERSATION_MISMATCH" });
    }
    await assertRecoveryTextIntegrity(recovery);
    const delivery = await deliverReport(recovery.outgoing_text || "", true, {
      confirmUserTurn: true,
      runId: recovery.run_id,
      deliveryId: recovery.delivery_id,
      requestId: recovery.request_id || "",
      requireCommit: true,
      conversationKey: recovery.conversation_key
    });
    if (delivery.committed_elsewhere) {
      const latest = delivery.commit_recovery || await currentRecovery(recovery.conversation_key, recovery.run_id);
      if (latest?.type === "reconcile_delivery") await reconcileCommittedDelivery(latest);
      return { ok: true, committed_elsewhere: true };
    }
    const completion = await sendRuntime("WS_AUTO_DELIVERY_COMPLETE", {
      run_id: recovery.run_id,
      conversation_key: recovery.conversation_key,
      delivery_confirmed: delivery.delivery_confirmed === true,
      confirmed_user_turn_id: delivery.confirmed_user_turn_id || null,
      composer_empty: delivery.composer_empty === true,
      click_attempts: Number(delivery.click_attempts || 0),
      delivery_id: recovery.delivery_id,
      assistant_baseline_ids: delivery.assistant_baseline_ids || assistantTurnIds()
    });
    if (!completion?.ok) throw Object.assign(new Error(completion?.error || "Не удалось подтвердить доставку."), { code: completion?.code || "DELIVERY_CONFIRMATION_REJECTED" });
    return { ok: true, completion };
  }

  async function recoverManualDelivery(recovery) {
    if (!recovery || recovery.type !== "manual_deliver" || !recovery.operation_id || !recovery.delivery_id) return { ok: false, code: "MANUAL_RECOVERY_INVALID" };
    if (recovery.conversation_key !== conversationKeyFromLocation() || !sameConversation(recovery.origin, recovery.conversation_id)) return { ok: false, code: "CONVERSATION_MISMATCH" };
    const key = `${recovery.operation_id}:${recovery.delivery_id}`;
    if (manualRecoveryInFlight.has(key)) return { ok: true, deduplicated: true };
    manualRecoveryInFlight.add(key);
    try {
      const delivery = await deliverReport(String(recovery.outgoing_text || ""), recovery.auto_send !== false, {
        confirmUserTurn: recovery.auto_send !== false,
        runId: `manual:${recovery.operation_id}`,
        deliveryId: recovery.delivery_id,
        requestId: recovery.request_id || "",
        requireCommit: false,
        conversationKey: recovery.conversation_key
      });
      const completion = await sendRuntime("WS_MANUAL_DELIVERY_COMPLETE", {
        conversation_key: recovery.conversation_key,
        manual_operation_id: recovery.operation_id,
        delivery_confirmed: delivery.delivery_confirmed === true,
        confirmed_user_turn_id: delivery.confirmed_user_turn_id || null,
        composer_empty: delivery.composer_empty === true,
        click_attempts: Number(delivery.click_attempts || 0)
      });
      if (!completion?.ok) throw Object.assign(new Error(completion?.error || "Не удалось завершить recovered manual operation."), { code: completion?.code || "MANUAL_DELIVERY_COMPLETE_REJECTED" });
      if (delivery.delivery_confirmed) {
        await sendRuntime("WS_REPORT_DELIVERY_CONFIRMED", {
          conversation_key: recovery.conversation_key,
          report_prefix_applied: recovery.report_prefix_applied === true,
          delivery_id: recovery.delivery_id
        });
      }
      return { ok: true, completion };
    } catch (error) {
      await sendRuntime("WS_MANUAL_DELIVERY_FAILED", {
        conversation_key: recovery.conversation_key,
        manual_operation_id: recovery.operation_id,
        code: error.code || "MANUAL_DELIVERY_RECOVERY_FAILED",
        error: error.message || String(error)
      }).catch(() => null);
      throw error;
    } finally {
      manualRecoveryInFlight.delete(key);
    }
  }

  async function runRecoveryOnce(recovery, { propagate = false } = {}) {
    if (!recovery?.type || !recovery?.run_id) return { ok: false, code: "RECOVERY_INVALID" };
    const key = `${recovery.type}:${recovery.run_id}:${recovery.delivery_id || ""}`;
    if (recoveryInFlight.has(key)) return { ok: true, deduplicated: true };
    recoveryInFlight.add(key);
    try {
      if (recovery.type === "dispatch_start") {
        const result = await sendAutoStart(String(recovery.message_text || ""), String(recovery.run_id || ""), String(recovery.conversation_key || ""));
        if (result.committed_elsewhere) {
          const latest = await currentRecovery(recovery.conversation_key, recovery.run_id);
          if (latest?.type === "reconcile_start") await reconcileCommittedStart(latest);
        }
        return { ok: true, handled: true };
      }
      if (recovery.type === "reconcile_start") return { ok: true, handled: await reconcileCommittedStart(recovery) };
      if (recovery.type === "deliver_claimed") {
        await performClaimedDelivery(recovery);
        return { ok: true, handled: true };
      }
      if (recovery.type === "reconcile_delivery") return { ok: true, handled: await reconcileCommittedDelivery(recovery) };
      if (recovery.type === "request_outcome_unknown") {
        toast("Wordstat Autorun: service worker перезапустился во время Yandex request. Исход запроса неизвестен; автоматический повтор запрещён.", "error", 10000);
        return { ok: false, code: "REQUEST_OUTCOME_UNKNOWN" };
      }
      return { ok: false, code: "RECOVERY_UNSUPPORTED" };
    } catch (error) {
      recordContentDiagnostic("RECOVERY_FAILED", { run_id: recovery.run_id, type: recovery.type, code: error.code || "RECOVERY_FAILED", error: error.message || String(error) });
      toast(`Wordstat recovery: ${error.message}`, "error", 9000);
      if (propagate) throw error;
      return { ok: false, code: error.code || "RECOVERY_FAILED", error: error.message || String(error) };
    } finally {
      recoveryInFlight.delete(key);
    }
  }

  function stopAutoWatch(reason = "stopped") {
    const previous = activeAutoWatch;
    if (autoObserver) autoObserver.disconnect();
    autoObserver = null;
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = null;
    activeAutoWatch = null;
    autoFirstSeen = null;
    autoTickInFlight = false;
    if (reason) {
      console.info(`[Wordstat Bridge ${VERSION}] auto watch stopped: ${reason}`);
      if (previous) recordContentDiagnostic("PROMPT_WATCH_STOPPED", { run_id: previous.run_id, reason });
    }
  }

  function scheduleAutoTick(delay = 0) {
    if (!activeAutoWatch || autoTimer) return;
    autoTimer = setTimeout(() => {
      autoTimer = null;
      autoTick().catch((error) => {
        toast(`Wordstat Autorun: ошибка watcher — ${error.message}`, "error", 9000);
        stopAutoWatch("tick_error");
      });
    }, delay);
  }

  function candidateAfterAssistantBaseline(baselineIds, watchId) {
    const baseline = baselineIds instanceof Set ? baselineIds : new Set(baselineIds || []);
    const assistants = turnSections().filter((section) => {
      const id = section.getAttribute("data-turn-id") || "";
      return section.getAttribute("data-turn") === "assistant" && Boolean(id) && !baseline.has(id);
    });
    const assistant = assistants[assistants.length - 1] || null;
    if (!assistant) return { waiting: true };
    const assistantTurnId = assistant.getAttribute("data-turn-id") || "";
    const copy = BB2ProvenWritingCapture.detectCopyReadiness(assistant);
    const writingBlockId = BB2ProvenWritingCapture.writingBlockStructuralId(assistant);
    const promptText = copy.writing_block ? BB2ProvenWritingCapture.sectionWritingBlockText(assistant) : "";
    return {
      assistant_turn_id: assistantTurnId,
      prompt_text: promptText,
      copy_ready: copy.ready,
      copy_mode: copy.mode,
      writing_block: copy.writing_block,
      writing_block_id: writingBlockId,
      structural_signature: [watchId || "", assistantTurnId, writingBlockId || "", copy.writing_block ? "writing-block" : "no-writing-block", copy.ready ? "copy-ready" : "copy-pending", copy.mode || ""].join("||")
    };
  }

  async function autoTick() {
    if (!current() || !activeAutoWatch || autoTickInFlight) return;
    autoTickInFlight = true;
    try {
      if (!sameConversation(activeAutoWatch.origin, activeAutoWatch.conversation_id) || conversationKeyFromLocation() !== activeAutoWatch.conversation_key) {
        stopAutoWatch("conversation_changed");
        return;
      }
      const candidate = candidateAfterAssistantBaseline(activeAutoWatch.assistant_baseline_ids, activeAutoWatch.watch_id);
      if (candidate.waiting) {
        autoFirstSeen = null;
        scheduleAutoTick(750);
        return;
      }
      if (!candidate.writing_block || !candidate.prompt_text || !candidate.copy_ready) {
        autoFirstSeen = null;
        scheduleAutoTick(750);
        return;
      }
      if (!WordstatProtocol.isCommandText(candidate.prompt_text)) {
        // Autorun only executes an explicit WORDSTAT_API_V1 writing/code block.
        // Ordinary assistant text or non-Wordstat writing blocks are not side effects.
        autoFirstSeen = null;
        scheduleAutoTick(750);
        return;
      }
      if (!autoFirstSeen || autoFirstSeen.signature !== candidate.structural_signature) {
        autoFirstSeen = { signature: candidate.structural_signature, at: Date.now() };
        recordContentDiagnostic("PROMPT_CANDIDATE_STABILITY_STARTED", { run_id: activeAutoWatch.run_id, assistant_turn_id: candidate.assistant_turn_id, writing_block_id: candidate.writing_block_id || null, copy_mode: candidate.copy_mode || null });
        scheduleAutoTick(AUTO_PROMPT_STABILITY_MS);
        return;
      }
      const elapsed = Date.now() - autoFirstSeen.at;
      if (elapsed < AUTO_PROMPT_STABILITY_MS) {
        scheduleAutoTick(AUTO_PROMPT_STABILITY_MS - elapsed);
        return;
      }
      const section = turnSections().find((item) => item.getAttribute("data-turn-id") === candidate.assistant_turn_id) || null;
      const localPayload = BB2ProvenWritingCapture.confirmLocalWritingBlockCopyAndExtract(section);
      if (!localPayload.ok) {
        autoFirstSeen = null;
        scheduleAutoTick(750);
        return;
      }
      let parsed;
      try { parsed = WordstatProtocol.parseCommand(localPayload.text); }
      catch (error) {
        toast(`Wordstat Autorun: блок WORDSTAT_API_V1 невалиден — ${error.message}`, "error", 9000);
        stopAutoWatch("invalid_command");
        return;
      }
      recordContentDiagnostic("PROMPT_ACCEPTED", { run_id: activeAutoWatch.run_id, assistant_turn_id: candidate.assistant_turn_id, method: parsed.method, phrase: parsed.phrase || null, command_fingerprint: WordstatProtocol.commandFingerprint(parsed) });
      toast(`Wordstat Autorun: выполняю ${parsed.method}${parsed.phrase ? ` — ${parsed.phrase}` : ""}.`, "info", 5000);
      const autorunContext = {
        run_id: activeAutoWatch.run_id,
        conversation_key: activeAutoWatch.conversation_key,
        origin: activeAutoWatch.origin,
        conversation_id: activeAutoWatch.conversation_id,
        watch_id: activeAutoWatch.watch_id
      };
      const response = await sendRuntime("WS_AUTO_COMMAND_READY", {
        run_id: autorunContext.run_id,
        conversation_key: autorunContext.conversation_key,
        watch_id: autorunContext.watch_id,
        assistant_turn_id: candidate.assistant_turn_id,
        command_text: localPayload.text,
        command_fingerprint: WordstatProtocol.commandFingerprint(parsed)
      });
      if (!response?.accepted) {
        if (response?.paused) stopAutoWatch("worker_paused");
        else if (response?.ignored) scheduleAutoTick(1000);
        else {
          toast(`Wordstat Autorun: ${response?.error || "команда не принята"}`, "error", 9000);
          stopAutoWatch("command_rejected");
        }
        return;
      }
      // Reference parity: once the command is accepted, the watcher stops.
      // Delivery is owned exclusively by the service worker single-flight cycle.
      stopAutoWatch("command_accepted");
    } finally {
      autoTickInFlight = false;
    }
  }

  function beginAutoWatch(message) {
    stopAutoWatch("replaced");
    if (!sameConversation(message.origin, message.conversation_id)) return false;
    if (message.conversation_key !== conversationKeyFromLocation()) return false;
    // Fail-safe mutual exclusion: autorun watcher removes any stale manual Copy listeners before it can programmatically verify a local Copy control.
    applyManualMode(false, message.conversation_key);
    activeAutoWatch = {
      run_id: String(message.run_id || ""),
      conversation_key: String(message.conversation_key || ""),
      origin: String(message.origin || "").toLowerCase(),
      conversation_id: String(message.conversation_id || "").toLowerCase(),
      watch_id: String(message.watch_id || ""),
      assistant_baseline_ids: new Set(Array.isArray(message.assistant_baseline_ids) ? message.assistant_baseline_ids : [])
    };
    autoObserver = new MutationObserver(() => {
      if (!autoTimer) scheduleAutoTick(AUTO_PROMPT_DEBOUNCE_MS);
    });
    autoObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled", "class", "data-testid", "aria-label", "title"]
    });
    scheduleAutoTick(0);
    recordContentDiagnostic("PROMPT_WATCH_STARTED", { run_id: activeAutoWatch.run_id, watch_id: activeAutoWatch.watch_id, assistant_baseline_count: activeAutoWatch.assistant_baseline_ids.size });
    console.info(`[Wordstat Bridge ${VERSION}] auto watch started for ${activeAutoWatch.run_id}`);
    return true;
  }

  async function syncAllState() {
    const here = conversationIdentity();
    if (here?.status !== "confirmed" || !here?.conversation_id) {
      applyManualMode(false, null);
      stopAutoWatch("identity_not_confirmed");
      return { ok: false, code: here?.status === "conflict" ? "CONVERSATION_IDENTITY_CONFLICT" : "CONVERSATION_NOT_CONFIRMED" };
    }
    const response = await sendRuntime("WS_CONTENT_READY", { identity: here });
    const key = response?.conversation_key || conversationKeyFromLocation();
    applyManualMode(response?.ok && response.manual_mode === true, key);
    if (response?.ok && response.auto_watch?.status === "waiting_command") beginAutoWatch(response.auto_watch);
    else stopAutoWatch(response?.owner === false ? "duplicate_non_owner" : "sync_not_waiting");
    if (response?.ok && response.manual_operation_owner !== false && response.manual_recovery) {
      queueMicrotask(() => { void recoverManualDelivery(response.manual_recovery).catch((error) => {
        recordContentDiagnostic("MANUAL_DELIVERY_RECOVERY_FAILED", { operation_id: response.manual_recovery.operation_id || null, code: error.code || "MANUAL_DELIVERY_RECOVERY_FAILED", error: error.message || String(error) });
        toast(`Wordstat manual recovery: ${error.message}`, "error", 9000);
      }); });
    }
    if (response?.ok && response.owner !== false && response.recovery) {
      queueMicrotask(() => { void runRecoveryOnce(response.recovery); });
    }
    return response;
  }

  function restoreButtonPicker() {
    if (pickerState) {
      try { setComposerText(pickerState.context.composer, pickerState.original_text); } catch (_) {}
      pickerState = null;
    }
    copyPickerActive = false;
  }

  function startSendButtonPicker() {
    const context = primaryComposerContext();
    if (!context) throw new Error("Не найдено нижнее поле ChatGPT.");
    restoreButtonPicker();
    pickerState = { context, original_text: composerText(context.composer) };
    setComposerText(context.composer, "BRIDGE_BUTTON_TEST — это тест, сообщение не будет отправлено.");
    toast("Wordstat Bridge: нажмите нужную Send-кнопку в нижней форме. Клик будет перехвачен, тест не отправится.", "info", 9000);
  }

  function startCopyButtonPicker() {
    restoreButtonPicker();
    copyPickerActive = true;
    toast("Wordstat Bridge: нажмите локальную Copy-кнопку внутри writing/code block. Клик будет перехвачен только для выбора и не запустит API.", "info", 9000);
  }

  document.addEventListener("pointerdown", (event) => {
    if (!pickerState && !copyPickerActive) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    suppressPickerClick = true;
    const button = event.target instanceof Element ? event.target.closest('button, [role="button"], input[type="submit"]') : null;

    if (copyPickerActive) {
      if (!(button instanceof HTMLButtonElement)) {
        toast("Wordstat Bridge: выберите именно локальную Copy-кнопку writing/code block.", "info", 7000);
        return;
      }
      const binding = bindingFromLocalCopyCandidate(button);
      if (!binding || isGenericAssistantCopy(button)) {
        toast("Wordstat Bridge: кнопка не привязана однозначно к одному локальному writing/code block. Общая «Копировать ответ» не подходит.", "info", 7000);
        return;
      }
      if (!commandText(binding)) {
        toast("Wordstat Bridge: тело выбранного блока не найдено или пусто.", "info", 7000);
        return;
      }
      const profile = copyButtonSignature(button, binding.adapter_id);
      sendRuntime("WS_SAVE_COPY_BUTTON_PROFILE", { profile }).then((response) => {
        if (!response.ok) throw new Error(response.error || "Не удалось сохранить Copy-кнопку.");
        replaceCopyButtonProfiles(response.profiles || profile, "picker_saved");
        restoreButtonPicker();
        toast(`Wordstat Bridge: Copy-кнопка добавлена; прежние варианты сохранены (${copyButtonProfiles.length} пользовательских).`, "success", 7000);
      }).catch((error) => {
        restoreButtonPicker();
        toast(`Wordstat Bridge: ${error.message}`, "error", 9000);
      });
      return;
    }

    if (!(button instanceof HTMLElement) || button.closest("form") !== pickerState.context.form) {
      toast("Wordstat Bridge: выберите кнопку только в нижней форме ChatGPT.", "info", 7000);
      return;
    }
    const profile = manualButtonSignature(button);
    profile.form_index = [...pickerState.context.form.querySelectorAll('button, [role="button"], input[type="submit"]')].indexOf(button);
    sendRuntime("WS_SAVE_SEND_BUTTON_PROFILE", { profile }).then((response) => {
      if (!response.ok) throw new Error(response.error || "Не удалось сохранить Send-кнопку.");
      sendButtonProfile = profile;
      restoreButtonPicker();
      toast("Wordstat Bridge: Send-кнопка сохранена.", "success", 6000);
    }).catch((error) => {
      restoreButtonPicker();
      toast(`Wordstat Bridge: ${error.message}`, "error", 9000);
    });
  }, true);

  document.addEventListener("click", (event) => {
    if (!suppressPickerClick) return;
    suppressPickerClick = false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);

  document.addEventListener("keydown", (event) => {
    if ((!pickerState && !copyPickerActive) || event.key !== "Escape") return;
    event.preventDefault();
    restoreButtonPicker();
    toast("Wordstat Bridge: выбор кнопки отменён.", "info", 5000);
  }, true);

  runtimeMessageListener = (message, _sender, sendResponse) => {
    if (message?.type === "WS_START_COPY_BUTTON_PICKER") {
      try { startCopyButtonPicker(); sendResponse({ ok: true }); }
      catch (error) { sendResponse({ ok: false, error: error.message, code: error.code || "CONTENT_ADAPTER_ERROR" }); }
      return false;
    }
    if (message?.type === "WS_START_SEND_BUTTON_PICKER") {
      try { startSendButtonPicker(); sendResponse({ ok: true }); }
      catch (error) { sendResponse({ ok: false, error: error.message, code: error.code || "CONTENT_ADAPTER_ERROR" }); }
      return false;
    }
    if (message?.type === "WS_SET_SEND_BUTTON_PROFILE") {
      sendButtonProfile = message.profile || null;
      sendResponse({ ok: true });
      return false;
    }
    if (message?.type === "WS_SET_COPY_BUTTON_PROFILES") {
      replaceCopyButtonProfiles(message.profiles || null, "worker_update");
      sendResponse({ ok: true });
      return false;
    }
    if (message?.type === "WS_PAGE_CONTEXT") {
      const here = conversationIdentity();
      sendResponse({ ok: true, conversation_key: conversationKeyFromLocation(), identity: here, href: location.href });
      return false;
    }
    if (message?.type === "WS_GET_IDENTITY") {
      sendResponse({ ok: true, identity: conversationIdentity(), href: location.href });
      return false;
    }
    if (message?.type === "WS_APPLY_MANUAL_MODE") {
      const currentKey = conversationKeyFromLocation();
      const applied = Boolean(currentKey && message.conversation_key === currentKey);
      if (applied) applyManualMode(message.enabled === true, currentKey);
      else applyManualMode(false, currentKey);
      sendResponse({ ok: true, applied, conversation_key: currentKey, identity: conversationIdentity() });
      return false;
    }
    if (message?.type === "WS_AUTO_SEND_START") {
      (async () => {
        if (!sameConversation(message.origin, message.conversation_id) || message.conversation_key !== conversationKeyFromLocation()) {
          return { ok: false, code: "CONVERSATION_MISMATCH", error: "Autorun start адресован другому ChatGPT-диалогу." };
        }
        stopAutoWatch("auto_start");
        return { ok: true, ...(await sendAutoStart(String(message.message_text || ""), String(message.run_id || ""), String(message.conversation_key || conversationKeyFromLocation() || ""))) };
      })().then(sendResponse).catch((error) => sendResponse({ ok: false, code: error.code || "AUTO_START_FAILED", error: error.message || String(error) }));
      return true;
    }
    if (message?.type === "WS_AUTO_DELIVERY_AVAILABLE") {
      (async () => {
        const recovery = message.recovery || null;
        if (!recovery || recovery.conversation_key !== conversationKeyFromLocation()) return { ok: false, code: "CONVERSATION_MISMATCH", error: "Delivery push адресован другому диалогу." };
        return await runRecoveryOnce(recovery, { propagate: true });
      })().then(sendResponse).catch((error) => sendResponse({ ok: false, code: error.code || "DELIVERY_RECOVERY_FAILED", error: error.message || String(error) }));
      return true;
    }
    if (message?.type === "WS_AUTO_BEGIN_WATCH") {
      sendResponse({ ok: true, started: beginAutoWatch(message), identity: conversationIdentity() });
      return false;
    }
    if (message?.type === "WS_AUTO_STOP_WATCH") {
      stopAutoWatch(message.reason || "worker");
      sendResponse({ ok: true });
      return false;
    }
    if (message?.type === "WS_AUTO_GET_BASELINE") {
      if (message.conversation_id && !sameConversation(message.origin || location.origin, message.conversation_id)) {
        sendResponse({ ok: false, code: "CONVERSATION_MISMATCH", error: "Baseline запрошен не у owner-диалога." });
        return false;
      }
      sendResponse({ ok: true, assistant_baseline_ids: assistantTurnIds(), identity: conversationIdentity() });
      return false;
    }
    return false;
  };
  chrome.runtime.onMessage.addListener(runtimeMessageListener);

  lastObservedConversationKey = conversationKeyFromLocation();
  identityPollTimer = setInterval(() => {
    if (!current()) return;
    const key = conversationKeyFromLocation();
    if (key === lastObservedConversationKey) return;
    lastObservedConversationKey = key;
    stopAutoWatch("conversation_route_changed");
    stopManualObserver();
    void syncAllState();
  }, 1000);

  Promise.all([
    sendRuntime("WS_GET_SEND_BUTTON_PROFILE"),
    sendRuntime("WS_GET_COPY_BUTTON_PROFILES")
  ]).then(([sendResponse, copyResponse]) => {
    sendButtonProfile = sendResponse?.ok ? sendResponse.profile || null : null;
    copyButtonProfiles = copyResponse?.ok ? normalizeCopyButtonProfiles(copyResponse.profiles) : [];
  }).finally(() => { void syncAllState(); });

  runtime.dispose = () => {
    if (runtime.disposed) return;
    runtime.disposed = true;
    stopManualObserver();
    stopAutoWatch("content_dispose");
    try { restoreButtonPicker(); } catch (_) {}
    if (identityPollTimer) clearInterval(identityPollTimer);
    identityPollTimer = null;
    if (runtimeMessageListener) chrome.runtime.onMessage.removeListener(runtimeMessageListener);
    runtimeMessageListener = null;
    try { if (globalThis[RUNTIME_KEY] === runtime) delete globalThis[RUNTIME_KEY]; } catch (_) {}
  };

  recordContentDiagnostic("CONTENT_RUNTIME_STARTED", { version: VERSION, identity: conversationIdentity() });
  console.info(`[Wordstat Bridge ${VERSION}] content ready; manual and autorun are conversation-scoped and mutually exclusive`);
})();
