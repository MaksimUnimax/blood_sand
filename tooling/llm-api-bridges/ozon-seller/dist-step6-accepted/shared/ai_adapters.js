(() => {
  "use strict";

  const AI_MODES = Object.freeze(["auto", "chatgpt", "alice"]);

  function normalizeMode(value) {
    const mode = String(value || "auto").trim().toLowerCase();
    return AI_MODES.includes(mode) ? mode : "auto";
  }

  function host() {
    return String(globalThis.location?.hostname || "").toLowerCase();
  }

  function text(node) {
    return String(node?.innerText || node?.textContent || "").replace(/\u00a0/g, " ").trim();
  }

  function controlsWithin(context) {
    const root = context?.root || context?.form || null;
    if (!(root instanceof Element)) return [];
    return [...root.querySelectorAll('button, [role="button"], input[type="submit"]')];
  }

  function aliceComposerContext() {
    const composer = document.querySelector('[data-testid="inputbase-textarea"]') ||
      document.querySelector('[data-highlight-id="alice-input"] textarea');
    if (!(composer instanceof HTMLElement)) return null;
    const root = composer.closest('[data-testid="standalone-input"]') ||
      composer.closest('[data-testid="standalone-input-field"]') ||
      composer.closest('[data-highlight-id="alice-input"]') ||
      composer.parentElement;
    if (!(root instanceof Element)) return null;
    return { composer, root, form: composer.closest("form") || null };
  }

  const CHATGPT_COPY_ANCHORS = new WeakMap();
  const ALICE_COPY_ANCHORS = new WeakMap();

  const CHATGPT_CODE_COPY_SELECTOR = 'button[aria-label="Копировать"], button[aria-label="Copy"]';

  function chatgptCopyOwnedBlock(copyButton, message) {
    if (!(copyButton instanceof Element) || !(message instanceof Element) || !message.contains(copyButton)) return null;
    let node = copyButton.parentElement;
    while (node && node !== message) {
      const copyControls = [...node.querySelectorAll(CHATGPT_CODE_COPY_SELECTOR)];
      const rawSurfaces = [
        ...node.querySelectorAll('[data-writing-block-fullscreen-editor-region]'),
        ...node.querySelectorAll('.cm-content'),
        ...node.querySelectorAll('#code-block-viewer'),
        ...node.querySelectorAll('pre > code'),
        ...node.querySelectorAll('pre')
      ];
      if (copyControls.length === 1 && rawSurfaces.length > 0) return node;
      node = node.parentElement;
    }
    return null;
  }

  const CHATGPT = Object.freeze({
    id: "chatgpt",
    label: "ChatGPT",
    matchesLocation() {
      return ["chatgpt.com", "chat.openai.com"].includes(host());
    },
    assistantMessages() {
      const sections = [...document.querySelectorAll('section[data-turn="assistant"]')];
      if (sections.length) return sections;
      return [...document.querySelectorAll('[data-message-author-role="assistant"]')];
    },
    userMessages() {
      const sections = [...document.querySelectorAll('section[data-turn="user"]')];
      if (sections.length) return sections;
      return [...document.querySelectorAll('[data-message-author-role="user"]')];
    },
    messageId(node) {
      if (!(node instanceof Element)) return "";
      return node.getAttribute("data-turn-id") ||
        node.querySelector('[data-message-author-role][data-message-id]')?.getAttribute("data-message-id") ||
        node.getAttribute("data-message-id") || "";
    },
    messageText(node) { return text(node); },
    findCodeBlocks(message) {
      if (!(message instanceof Element)) return [];
      const roots = [];
      for (const copyButton of message.querySelectorAll(CHATGPT_CODE_COPY_SELECTOR)) {
        const root = chatgptCopyOwnedBlock(copyButton, message);
        if (!root) continue;
        CHATGPT_COPY_ANCHORS.set(root, copyButton);
        roots.push(root);
      }
      return [...new Set(roots)];
    },
    readCodeText(block) {
      if (!(block instanceof Element)) return "";
      const writingBody = block.querySelector('[data-writing-block-fullscreen-editor-region]');
      if (writingBody) return String(writingBody.innerText || writingBody.textContent || "");
      const cm = block.querySelector('.cm-content');
      if (cm) return String(cm.textContent || "");
      const legacy = block.querySelector('#code-block-viewer');
      if (legacy) return String(legacy.innerText || legacy.textContent || "");
      const code = block.querySelector("pre > code") || block.querySelector("code");
      if (code) return String(code.textContent || "");
      const pre = block.querySelector("pre");
      return pre ? String(pre.textContent || "") : "";
    },
    geometryAnchor(block) {
      const copyButton = block instanceof Element ? CHATGPT_COPY_ANCHORS.get(block) : null;
      return copyButton?.isConnected ? copyButton : (block instanceof Element ? block : null);
    },
    isGenerating() {
      return Boolean(document.querySelector('[data-testid="stop-button"]') || document.querySelector('[aria-busy="true"]'));
    },
    messageComplete(message) {
      return Boolean(message?.isConnected && !this.isGenerating() && text(message));
    }
  });

  const ALICE = Object.freeze({
    id: "alice",
    label: "Alice",
    matchesLocation() { return host() === "alice.yandex.ru"; },
    assistantMessages() { return [...document.querySelectorAll('[data-message-role="alice"]')]; },
    userMessages() { return [...document.querySelectorAll('[data-message-role="user"]')]; },
    messageId(node) {
      if (!(node instanceof Element)) return "";
      return node.id || node.getAttribute("data-message-id") || "";
    },
    messageText(node) { return text(node); },
    findCodeBlocks(message) {
      if (!(message instanceof Element)) return [];
      const roots = [];
      for (const copyButton of message.querySelectorAll('[data-testid="codeblock-action-copy"]')) {
        const root = copyButton.closest('.CodeBlock');
        if (!(root instanceof Element) || !message.contains(root)) continue;
        ALICE_COPY_ANCHORS.set(root, copyButton);
        roots.push(root);
      }
      return [...new Set(roots)];
    },
    readCodeText(block) {
      if (!(block instanceof Element)) return "";
      const code = block.querySelector("pre.CodeBlock-ContentPre > code") || block.querySelector("pre > code");
      return code ? String(code.textContent || "") : "";
    },
    geometryAnchor(block) {
      if (!(block instanceof Element)) return null;
      const copyButton = ALICE_COPY_ANCHORS.get(block);
      return copyButton?.isConnected ? copyButton : (block.querySelector(":scope > .CodeBlock-StickyWrapper") || block);
    },
    composerContext: aliceComposerContext,
    classifyComposerControl(context, visible) {
      const root = context?.root;
      if (!(root instanceof Element)) return { kind: "unknown", button: null };
      const button = root.querySelector('[data-testid="oknyx"]');
      if (!(button instanceof HTMLElement) || !visible(button)) return { kind: "unknown", button: null };
      const aria = String(button.getAttribute("aria-label") || "").trim().toLowerCase();
      if (aria === "алиса, стоп") return { kind: "stop", button };
      if (aria === "отправить") {
        const disabled = Boolean(button instanceof HTMLButtonElement && button.disabled) || button.getAttribute("aria-disabled") === "true";
        return { kind: disabled ? "send_disabled" : "send_active", button };
      }
      if (aria === "алиса, начни слушать") return { kind: "ready", button };
      return { kind: "unknown", button };
    },
    isGenerating() {
      const button = document.querySelector('[data-testid="oknyx"]');
      return String(button?.getAttribute("aria-label") || "").trim().toLowerCase() === "алиса, стоп";
    },
    messageComplete(message) {
      return Boolean(message?.isConnected && !this.isGenerating() && text(message));
    }
  });

  const ADAPTERS = Object.freeze({ chatgpt: CHATGPT, alice: ALICE });

  function adapterForLocation(mode = "auto") {
    const normalized = normalizeMode(mode);
    if (normalized !== "auto") {
      const selected = ADAPTERS[normalized] || null;
      return selected?.matchesLocation() ? selected : null;
    }
    return Object.values(ADAPTERS).find((candidate) => candidate.matchesLocation()) || null;
  }

  globalThis.OzonAIAdapters = Object.freeze({
    AI_MODES,
    ADAPTERS,
    normalizeMode,
    adapterForLocation
  });
})();
