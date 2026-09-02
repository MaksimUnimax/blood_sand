# Ozon Bridge — Multi-AI expansion: architecture understanding, target state, and DOM discovery contract

Date: 2026-09-02

Base accepted build:

- branch: `repair/ozon-current-swagger-refresh-2026-09-01`
- accepted release-record commit: `5fc002962f86368bcd0f64cd01bfa7d4e06558a1`
- production source commit: `516ecf140538ad2838d39dcd01c7428efc1880d3`
- accepted artifact: `OZON_BRIDGE_v0.1.19_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_CANDIDATE_2026-09-02.zip`
- accepted artifact SHA-256: `80d0b4eba7110dc2d69ef3fab40214a9a6c54e98cfd6820ab611ac7ba73b2c76`

This document is the authority for the next phase. No production code change is authorized by this document alone.

---

## 1. Product understanding

Ozon Bridge is a Chromium MV3 extension that uses a supported AI web chat as the human/LLM interaction surface while the extension itself owns Ozon Seller/Performance credentials, command validation, execution, durable run state, delivery/recovery, and safety invariants.

The AI never receives credentials and never chooses an arbitrary URL/method/header. It produces explicit `OZON_API_V1` / `OZON_HELP_V2` text. The extension reads completed assistant output, validates/executes an allowlisted Ozon read, then inserts the result back into the same AI conversation.

Two interaction modes share the same Ozon execution core:

1. Manual/work mode: extension-owned `Ozon` button is attached next to structurally discovered assistant code blocks. Only on that button click is the live raw code block read and handed to the common parser/queue.
2. Autorun: the extension watches complete assistant turns, waits for structural/text stability, scans the full completed assistant message for Ozon markers, executes all discovered items sequentially, then delivers one combined result back to the same conversation.

Non-negotiable invariant remains:

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

No multi-AI work may weaken Ozon registry/contract/privacy/retry/pagination/fan-out/recovery protections.

---

## 2. Current AI integration architecture

### 2.1 Manifest

Current content-script/host coverage is only:

- `chatgpt.com`
- `chat.openai.com`
- `alice.yandex.ru`

Every new web AI therefore requires explicit manifest `host_permissions` and `content_scripts.matches` coverage.

### 2.2 `shared/ai_adapters.js`

Current `AI_MODES` is only `auto`, `chatgpt`, `alice`.

An adapter currently owns:

- location match;
- assistant-message discovery;
- user-message discovery;
- message ID extraction;
- message text extraction;
- assistant code-block discovery;
- raw code text extraction;
- code-block geometry anchor for the extension-owned Ozon button;
- generation-state detection;
- completed-message detection.

Alice additionally owns composer context and composer-control classification.

### 2.3 `shared/conversation_identity.js`

Conversation identity is separate from `ai_adapters.js` and is currently hardcoded to ChatGPT and Alice origins/routes.

It produces the canonical conversation binding key:

`<normalized origin>|<confirmed conversation id>`

This key is security/lifecycle critical: manual, autorun, work-session ownership, delivery and recovery must not cross conversations.

### 2.4 `content_script.js`

Generic layers already exist for:

- adapter-selected assistant/user turn enumeration;
- structural code-block binding and extension-owned Ozon button;
- raw code reading on manual click;
- full-assistant-message autorun discovery;
- composer text staging;
- stable target validation;
- send click tracing;
- matching delivered user-turn confirmation;
- MutationObserver-driven UI lifecycle;
- delivery/recovery handling.

However composer/send support does NOT currently scale to arbitrary adapters:

- ChatGPT composer/send/microphone/stop logic is hardcoded directly in `content_script.js`.
- Alice is the only special branch.
- `primaryComposerContext`, `sendButton`, `stopButton`, `recognizedSendControl`, `classifyComposerControl` effectively use `alice ? Alice : ChatGPT` logic.

Therefore simply adding `deepseek`, `qwen`, etc. to `ai_adapters.js` would incorrectly route their composer lifecycle through ChatGPT code.

### 2.5 `shared/composer_send.js`

This is intentionally provider-agnostic and should remain so. It validates that composer/root/form/button are connected, visible, correctly scoped, enabled, text-consistent and stable before synchronous `.click()`.

The multi-AI refactor should feed provider-specific context/control resolution into this generic layer rather than clone its validation for every provider.

### 2.6 `service_worker.js`

The worker owns credentials, Ozon planning/execution, durable manual/autorun/work state, one-request invariants, batch collection, delivery commit/recovery and tab/conversation ownership.

AI-specific hardcoding still exists:

- `AI_MODES` is only `auto/chatgpt/alice`;
- origin/identity validation depends on the two-provider conversation-identity module;
- delivery confirmation basis is origin/provider-sensitive.

These must become provider-registry driven without weakening ownership gates.

### 2.7 Popup

Popup exposes only ChatGPT/Alice in the per-tab adapter selector and labels the product as ChatGPT/Alice. New adapters require data-driven UI options instead of duplicated hardcoded provider lists.

---

## 3. Required architectural change before mass onboarding

Create one canonical AI provider registry/adapter contract. Provider-specific DOM knowledge must live in one adapter descriptor, not be scattered across manifest/popup/content-script/worker conditionals.

Target adapter capabilities:

- `id`, `label`, official origins/host patterns;
- location matching;
- conversation identity resolver/evidence policy;
- assistant/user message discovery;
- stable message ID extraction;
- message text extraction;
- code-block discovery;
- raw code extraction;
- geometry anchor;
- generation/completion detection;
- composer context resolver;
- composer read/write compatibility metadata if needed;
- send-control resolver/classifier;
- stop/generating control resolver;
- post-send ready/completion classifier;
- delivery confirmation basis/policy;
- optional provider-specific route/navigation evidence;
- locale-independent selector preference order.

Provider-agnostic code must continue to own:

- binding isolation;
- command parsing/validation;
- Ozon execution;
- composer target validation;
- click trace/safety;
- durable delivery state;
- no-retry unknown-outcome handling;
- manual/autorun mutual exclusion;
- diagnostics redaction.

---

## 4. What the next phase must produce

Final product goal: the same Ozon Bridge workflow works in each supported browser AI with no change to the Ozon protocol from the model's perspective.

For every supported AI:

1. Extension activates automatically on the official web host.
2. Current conversation is identified deterministically and isolated from other tabs/chats.
3. Manual/work mode finds every supported assistant code block and renders the extension-owned `Ozon` control.
4. Clicking Ozon reads that exact live block and routes it through the same parser/queue.
5. Autorun detects a completed assistant message and processes Ozon markers exactly as today.
6. Result delivery can insert text into the provider's composer, resolve the correct Send control, send exactly once, and confirm delivery without unsafe duplicate clicks.
7. SPA navigation/chat switching tears down stale state and rebinds safely.
8. Failure to identify a conversation/composer/send/completion state must fail closed, not guess.
9. No credentials/customer PII are collected in provider DOM evidence.
10. Existing ChatGPT/Alice behavior remains regression-protected.

---

## 5. Target web-AI discovery list

Existing baseline adapters:

- ChatGPT
- Yandex Alice

Primary onboarding candidates:

- Claude
- Google Gemini
- DeepSeek Web
- Qwen Chat
- Kimi
- Grok
- Mistral Vibe
- Microsoft Copilot
- Perplexity
- Meta AI
- GigaChat

Secondary onboarding candidates:

- Poe
- Z.ai / GLM
- Doubao
- Tencent Yuanbao
- Baidu ERNIE
- MiniMax Chat
- Manus
- Genspark
- HuggingChat
- Phind
- Blackbox AI

Secondary candidates are accepted only if the live web UI exposes a sufficiently deterministic conversation/message/composer lifecycle for safe Ozon delivery. API-only, mobile-only, image/video-only, or non-deterministic agent surfaces may be classified unsupported after discovery rather than forced into the extension.

---

## 6. Standard Codex DOM discovery package — required for EACH candidate

Codex must perform discovery only. Do not patch production code during the discovery pass.

For each official web AI, collect a provider folder containing:

### `provider.json`

- provider id/label;
- actual final origin after redirects;
- exact app URL;
- logged-in route and new-chat route;
- route before first message and after first message;
- conversation ID candidate(s);
- canonical link if any;
- active-sidebar-chat evidence if any;
- whether route identity is deterministic enough for binding.

### `selectors.json`

For each selector include selector text, match count in each state, why it is stable, and fallback candidates:

- assistant message container;
- user message container;
- stable message ID attribute/path;
- assistant text surface;
- code block root;
- local code-copy button;
- raw code text surface;
- code-block geometry anchor;
- composer element;
- composer form/root;
- active Send;
- disabled Send;
- Stop/generating control;
- idle/ready-after-send control/state;
- active conversation/sidebar item when relevant.

Prefer `data-*`, `aria-*`, semantic role and stable structural attributes. Record localized text only as fallback evidence.

### Sanitized DOM snippets

Capture minimal relevant `outerHTML`, never full-page dumps:

- composer idle empty;
- composer with probe text;
- composer during generation;
- composer after generation completes;
- active Send;
- disabled Send;
- Stop/generating control;
- one user message;
- one assistant message while generating if structurally different;
- same assistant message completed;
- one assistant fenced code block including its local copy control;
- active chat-history/sidebar item if used for identity.

Sanitize account names, emails, user content, cookies, tokens and IDs that are not structural conversation/message identifiers.

### Behavioral probe

Use a harmless test payload, not a real Ozon command, for example:

```
BRIDGE_DOM_PROBE_V1
{"probe":"code_block"}
```

Verify and record:

- whether the AI can emit a normal fenced code block;
- whether the code block has a local copy control;
- whether raw code text remains exact;
- how generation starts/stops;
- how message completion can be detected;
- whether composer is `textarea`, `input`, `contenteditable`, CodeMirror/ProseMirror, etc.;
- whether native property setter + `InputEvent`/`change` updates the UI model;
- whether programmatic `button.click()` on the uniquely resolved Send button creates exactly one user turn;
- whether composer clears after send;
- what deterministic state appears after the send click and after AI completion;
- whether a newly created conversation receives its stable URL/id before or only after first send;
- whether SPA chat switching replaces DOM nodes and route identity correctly;
- whether hidden duplicate composers/buttons/messages exist.

### `recommendation.md`

Return:

- `SUPPORTED_NOW`, `SUPPORTED_AFTER_ADAPTER_SPECIAL_CASE`, or `UNSAFE/UNSUPPORTED`;
- proposed provider adapter fields;
- strongest selectors and fallbacks;
- proposed conversation identity algorithm;
- proposed delivery confirmation basis;
- known ambiguities/risks;
- whether Manual and Autorun can both be supported.

---

## 7. Provider-specific questions Codex must answer

### Claude

- exact conversation route/id pattern;
- stable assistant/user turn roots and message IDs;
- code-block copy toolbar ownership;
- composer/send/stop lifecycle;
- post-send confirmation state.

### Gemini

- `/app/...` identity behavior and whether the route changes on first send;
- stable message IDs despite dynamic Angular/custom-element structure;
- code-block root/copy control;
- composer type and send/stop lifecycle;
- response-complete signal independent of text.

### DeepSeek

- final `chat.deepseek.com` route pattern and chat identifier;
- assistant/user message structure in normal vs reasoning output;
- fenced-code block/copy surface;
- composer Send/Stop and completion states.

### Qwen Chat

- final `chat.qwen.ai` route and conversation ID;
- normal vs thinking/tool-use assistant DOM differences;
- fenced code and copy toolbar;
- composer and deterministic post-send ready state.

### Kimi

- normal Chat vs Agent/Swarm modes: identify a stable turn-based mode suitable for Ozon Bridge;
- conversation identity and active-history evidence;
- code block behavior;
- composer/send/generation/ready lifecycle.

### Grok

- `grok.com` conversation route and stable message IDs;
- normal chat vs tool/build modes;
- code block/copy behavior;
- composer send/stop/ready lifecycle.

### Mistral Vibe

- test current Vibe Work and Vibe Chat/legacy paths because Le Chat was renamed Vibe;
- select the surface that provides the safest deterministic turn-by-turn lifecycle;
- conversation identity, code block, composer, send/stop, completion evidence.

### Microsoft Copilot

- select the ordinary Copilot Chat surface, not unrelated Microsoft 365 document UI;
- account/work/life route differences;
- stable conversation identity;
- message/code/composer lifecycle;
- whether programmatic insertion/click is reliable.

### Perplexity

- thread identity route;
- answer container with citations versus code block ownership;
- completion state for Search/Pro/Research modes;
- choose a deterministic ordinary chat/search mode for Bridge;
- composer/send lifecycle.

### Meta AI

- conversation route/id and history ownership;
- whether text/code responses expose deterministic code blocks;
- composer/send/generation/completion lifecycle;
- classify unsupported if code/turn DOM is not deterministic enough.

### GigaChat

- current official web host/route after login;
- conversation route/id;
- Russian UI selectors without relying solely on visible Russian labels;
- code block/copy control;
- composer/send/stop/ready lifecycle.

### Poe

- determine whether one platform adapter covers Official Assistant and model-specific bots;
- separate bot identity from conversation identity;
- stable turn/message/code/composer DOM across bots;
- avoid binding a conversation to the wrong bot/thread.

### Z.ai / GLM

- confirm current Open-WebUI-derived DOM and what is stable versus upstream-generated classes;
- conversation ID route;
- message/code/composer/send lifecycle.

### Doubao / Tencent Yuanbao / ERNIE

- current official route and login/region constraints;
- stable chat IDs and message IDs;
- Chinese-localized controls: find non-text structural selectors;
- code blocks and delivery lifecycle.

### MiniMax / Manus / Genspark

- first classify the surface: deterministic conversational chat versus long-running agent task;
- only propose support if completed assistant turns, exact code payloads and one-shot composer delivery can be proven;
- otherwise return `UNSAFE/UNSUPPORTED` with evidence rather than inventing selectors.

---

## 8. Implementation roadmap AFTER discovery

1. Freeze accepted v0.1.19 as regression baseline.
2. Gather standardized Codex DOM evidence for all candidates.
3. Review evidence and classify providers.
4. Refactor current two-provider hardcodes into one provider registry/adapter contract without changing behavior.
5. Regression-test ChatGPT and Alice byte/behavior parity.
6. Add providers in small batches, with per-provider DOM fixtures and unit tests.
7. For each provider run Manual, Autorun, new-chat, existing-chat, tab-switch, SPA-route-change and recovery tests.
8. Build one new multi-AI candidate only after supported providers pass.
9. Live acceptance matrix across all supported AI web apps.
10. Publish accepted artifact and provider-support matrix.

No provider may be marked supported from selectors alone; its composer/send/delivery confirmation lifecycle must be demonstrated.
