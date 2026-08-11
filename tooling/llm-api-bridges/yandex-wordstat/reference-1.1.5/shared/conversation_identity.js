(() => {
  "use strict";

  const CONVERSATION_PATH_RE = /(?:^|\/)c\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i;

  function normalizedOrigin(value) {
    try {
      return new URL(String(value || "")).origin.toLowerCase();
    } catch (_) {
      return String(value || "").trim().toLowerCase();
    }
  }

  function conversationIdFromPath(pathname) {
    const match = String(pathname || "").match(CONVERSATION_PATH_RE);
    return match ? match[1].toLowerCase() : null;
  }

  function canonicalConversationId(origin, canonicalHref) {
    if (!canonicalHref) return null;
    try {
      const expectedOrigin = normalizedOrigin(origin);
      const parsed = new URL(String(canonicalHref), String(origin || undefined));
      if (normalizedOrigin(parsed.origin) !== expectedOrigin) return null;
      return conversationIdFromPath(parsed.pathname);
    } catch (_) {
      return null;
    }
  }

  function resolve({ origin, pathname, canonicalHref = "" } = {}) {
    const normalized = normalizedOrigin(origin);
    const pathId = conversationIdFromPath(pathname);
    const canonicalId = canonicalConversationId(normalized, canonicalHref);

    if (pathId && canonicalId && pathId !== canonicalId) {
      return {
        origin: normalized,
        chat_path: String(pathname || ""),
        conversation_id: null,
        status: "conflict",
        source: "path_canonical_conflict"
      };
    }

    const conversationId = pathId || canonicalId || null;
    return {
      origin: normalized,
      chat_path: String(pathname || ""),
      conversation_id: conversationId,
      status: conversationId ? "confirmed" : "unknown",
      source: pathId && canonicalId
        ? "path_and_canonical"
        : (pathId ? "path" : (canonicalId ? "canonical" : "none"))
    };
  }

  globalThis.BB2ConversationIdentity = Object.freeze({
    conversationIdFromPath,
    canonicalConversationId,
    resolve
  });
})();
