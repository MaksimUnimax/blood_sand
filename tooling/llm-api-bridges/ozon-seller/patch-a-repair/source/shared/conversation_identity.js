(() => {
  "use strict";

  const UUID = "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})";
  const CHATGPT_PATH_RE = new RegExp(`(?:^|/)c/${UUID}(?:/|$)`, "i");
  const ALICE_PATH_RE = new RegExp(`(?:^|/)chat/${UUID}(?:/|$)`, "i");

  function normalizedOrigin(value) {
    try { return new URL(String(value || "")).origin.toLowerCase(); }
    catch (_) { return String(value || "").trim().toLowerCase(); }
  }

  function providerForOrigin(origin) {
    const normalized = normalizedOrigin(origin);
    if (["https://chatgpt.com", "https://chat.openai.com"].includes(normalized)) return "chatgpt";
    if (normalized === "https://alice.yandex.ru") return "alice";
    return null;
  }

  function conversationIdFromPath(pathname, provider = "chatgpt") {
    const pattern = provider === "alice" ? ALICE_PATH_RE : CHATGPT_PATH_RE;
    const match = String(pathname || "").match(pattern);
    return match ? match[1].toLowerCase() : null;
  }

  function canonicalConversationId(origin, canonicalHref, provider = providerForOrigin(origin) || "chatgpt") {
    if (!canonicalHref || provider !== "chatgpt") return null;
    try {
      const expectedOrigin = normalizedOrigin(origin);
      const parsed = new URL(String(canonicalHref), String(origin || undefined));
      if (normalizedOrigin(parsed.origin) !== expectedOrigin) return null;
      return conversationIdFromPath(parsed.pathname, provider);
    } catch (_) { return null; }
  }

  function resolve({ origin, pathname, canonicalHref = "" } = {}) {
    const normalized = normalizedOrigin(origin);
    const provider = providerForOrigin(normalized);
    if (!provider) {
      return { origin: normalized, chat_path: String(pathname || ""), conversation_id: null, status: "unsupported", source: "unsupported_origin", ai_id: null };
    }
    const pathId = conversationIdFromPath(pathname, provider);
    const canonicalId = canonicalConversationId(normalized, canonicalHref, provider);
    if (pathId && canonicalId && pathId !== canonicalId) {
      return { origin: normalized, chat_path: String(pathname || ""), conversation_id: null, status: "conflict", source: "path_canonical_conflict", ai_id: provider };
    }
    const conversationId = pathId || canonicalId || null;
    return {
      origin: normalized,
      chat_path: String(pathname || ""),
      conversation_id: conversationId,
      status: conversationId ? "confirmed" : "unknown",
      source: pathId && canonicalId ? "path_and_canonical" : (pathId ? "path" : (canonicalId ? "canonical" : "none")),
      ai_id: provider
    };
  }

  function normalizedConversationCandidate(value) {
    const candidate = String(value || "").trim().toLowerCase();
    return candidate || null;
  }

  function resolveWithEvidence({ origin, pathname, canonicalHref = "", activeConversationId = null } = {}) {
    const base = resolve({ origin, pathname, canonicalHref });
    if (base.ai_id !== "alice") return base;

    const activeId = normalizedConversationCandidate(activeConversationId);
    if (!base.conversation_id) {
      return { ...base, active_conversation_id: activeId, corroboration: "not_applicable" };
    }
    if (!activeId) {
      return {
        ...base,
        conversation_id: null,
        status: "unknown",
        source: "alice_path_without_active_history",
        active_conversation_id: null,
        corroboration: "missing"
      };
    }
    if (activeId !== base.conversation_id) {
      return {
        ...base,
        conversation_id: null,
        status: "conflict",
        source: "alice_path_active_history_conflict",
        active_conversation_id: activeId,
        corroboration: "conflict"
      };
    }
    return {
      ...base,
      source: "path_and_active_history",
      active_conversation_id: activeId,
      corroboration: "confirmed"
    };
  }

  globalThis.BB2ConversationIdentity = Object.freeze({
    providerForOrigin,
    conversationIdFromPath,
    canonicalConversationId,
    resolve,
    resolveWithEvidence
  });
})();
