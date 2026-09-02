# Codex prompt — Ozon Bridge multi-AI browser DOM discovery

You are working in repository `MaksimUnimax/blood_sand` on the Ozon Bridge extension.

## Authority and baseline

Read these first and treat them as authoritative:

1. `tooling/llm-api-bridges/ozon-seller/OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md`
2. `tooling/llm-api-bridges/ozon-seller/OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_ROADMAP_2026-09-02.md`
3. accepted production build under `tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/`

Accepted production source commit: `516ecf140538ad2838d39dcd01c7428efc1880d3`.
Accepted release-record commit: `5fc002962f86368bcd0f64cd01bfa7d4e06558a1`.
Accepted artifact SHA-256: `80d0b4eba7110dc2d69ef3fab40214a9a6c54e98cfd6820ab611ac7ba73b2c76`.

This task is **DOM/behavior discovery only**. Do NOT change production extension files, manifest permissions, popup behavior, AI adapters, Ozon contracts, service-worker behavior, or the accepted artifact. Do not rebuild the extension. The only committed changes allowed in this pass are sanitized research/evidence files and, if necessary, research-only helper scripts under the discovery directory.

## Goal

Collect enough live browser evidence from every viable major AI web chat to design safe Ozon Bridge adapters later.

For each provider we need to know, from the **actual current logged-in web UI**, how to:

- identify the provider and exact conversation;
- enumerate assistant and user turns;
- extract stable message IDs;
- detect a completed assistant turn versus active generation;
- find assistant fenced code blocks and read their exact raw text;
- choose a geometry anchor for the extension-owned `Ozon` button;
- find the real composer and its form/root;
- insert text in a way the web app recognizes;
- uniquely resolve active Send, disabled Send and Stop/generating controls;
- send exactly once;
- confirm post-send / post-generation readiness without unsafe duplicate clicks;
- survive new chat, existing chat and SPA chat switching without crossing conversation ownership.

The future implementation must keep the current Ozon safety invariant:

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

This discovery task must not touch Ozon credentials or make real Ozon API calls.

## Browser/session rules

Use the browser/Chrome session already available to you. You may use Chrome DevTools/CDP/Puppeteer-style inspection if available.

- If a provider is already signed in, use that authorized session.
- If it is not signed in, record `AUTH_REQUIRED` and continue. Never ask for, read, export, print or store passwords, session cookies, bearer tokens, local-storage auth tokens or authorization headers.
- Do not bypass CAPTCHA, anti-bot, paywall, geographic restriction, age gate, or login controls.
- Do not sign up, purchase a subscription, or change account/security settings.
- Never use an existing personal conversation for probes. Create a new temporary chat/thread when the UI permits it.
- Do not delete or edit existing chats.
- Do not inspect private network APIs for the purpose of stealing/reusing tokens. We need DOM and visible lifecycle evidence, not backend credentials/endpoints.
- Never save full-page HTML dumps. Save only minimal sanitized DOM snippets around the relevant controls/turns.
- Redact account names, email addresses, avatars, filenames, personal chat content and unrelated IDs.
- Preserve structural route/message/conversation ID **shape**, not the user's raw private identifier. Replace raw IDs with placeholders such as `<CONVERSATION_ID>` / `<MESSAGE_ID>` and record regex/length/format separately. A SHA-256 hash may be used only if correlation across states is necessary.

## Research branch and checkpointing

Create/reuse research branch:

`research/ozon-multi-ai-dom-discovery-2026-09-02`

Base it on the current accepted/research documentation state without modifying production code.

Write evidence under:

`tooling/llm-api-bridges/ozon-seller/validation/multi-ai-dom-discovery-2026-09-02/`

Commit progress after every 1–3 providers so a browser/session failure does not lose completed evidence. Keep `PROGRESS.md` current after every provider.

## Providers to inspect

### Baseline adapters — capture fresh fixtures for refactor parity

1. ChatGPT — `https://chatgpt.com/`
2. Yandex Alice — `https://alice.yandex.ru/`

### Tier A — mandatory

3. Claude — `https://claude.ai/`
4. Google Gemini — `https://gemini.google.com/`
5. DeepSeek — `https://chat.deepseek.com/`
6. Qwen — `https://chat.qwen.ai/`
7. Kimi — `https://www.kimi.com/`
8. Grok — `https://grok.com/`
9. Mistral Vibe — `https://chat.mistral.ai/`
10. Microsoft Copilot — `https://copilot.com/`
11. Perplexity — `https://www.perplexity.ai/`
12. Meta AI — start `https://meta.ai/` and record actual redirect/origin
13. GigaChat — `https://giga.chat/`
14. Duck.ai — `https://duck.ai/`
15. OpenRouter Chat — `https://openrouter.ai/chat`
16. Poe — `https://poe.com/`
17. Proton Lumo — `https://lumo.proton.me/`
18. T3 Chat — `https://t3.chat/`

### Tier B — inspect if reachable; classify rather than force support

19. Z.ai / GLM — `https://chat.z.ai/`
20. Doubao — `https://www.doubao.com/`, follow the current web-chat entry
21. Tencent Yuanbao — `https://yuanbao.tencent.com/`
22. Baidu ERNIE — start `https://ernie.baidu.com/`, follow the current upgraded-service web-chat link
23. MiniMax — inspect `https://agent.minimax.io/` and any still-active `https://chat.minimax.io/`
24. Manus — `https://manus.im/`; inspect Chat Mode first
25. Genspark — `https://www.genspark.ai/` / actual signed-in web workbench
26. Blackbox AI — `https://agent.blackbox.ai/`
27. Pi — `https://pi.ai/`

### Tier C — discovery-only, no support promise

28. Phind — first verify a current usable web chat exists
29. Scira — only inspect a signed-in browser chat; do not target the CLI
30. LMArena — `https://lmarena.ai/`; determine whether its chat mode has a stable per-thread lifecycle suitable for ownership
31. Character.AI — only classify protocol fidelity; do not assume business/code suitability
32. Any other major browser AI chat naturally discovered while doing this pass may be added to the matrix, but do not add production permissions or code.

### Explicitly skip

- HuggingChat: hosted service was publicly closed; record `CLOSED / NOT TARGETED` in the matrix without wasting a browser probe.
- API-only/mobile-only/image-video-only surfaces.

## Probe payloads

Do NOT use `OZON_API_V1`, `OZON_HELP_V2`, Seller IDs, campaign IDs or any credential-looking string during DOM discovery.

Use harmless disposable messages. At minimum ask the AI to return a plain fenced code block containing exactly:

```text
BRIDGE_DOM_PROBE_V1
{"probe":"code_block","value":"A-01"}
```

Use a second harmless turn only where needed to compare normal versus thinking/search/tool mode.

Before any programmatic Send click, ensure the probe is in a disposable new chat and capture a baseline count/IDs of user turns. After the click verify exactly one new user turn appeared. If click outcome is uncertain, **do not click again**; record the state as unsafe/unknown.

## Required state captures per provider

Where the provider supports the state, capture all of these:

1. New chat before first send.
2. Existing chat after conversation ID is established.
3. Composer empty/idle.
4. Composer containing probe text.
5. Send enabled.
6. Send disabled.
7. Assistant generating.
8. Stop/generating control visible.
9. Assistant completed.
10. Post-generation idle/ready state.
11. One user turn.
12. One assistant turn.
13. One assistant fenced code block with its local copy control, if present.
14. Active sidebar/history item when relevant to identity.
15. SPA navigation to another conversation and back.

If a state does not exist, state that explicitly instead of inventing a selector.

## Required provider folder

For provider id `<provider>`, create:

`validation/multi-ai-dom-discovery-2026-09-02/<provider>/`

with these files.

### 1. `provider.json`

Include:

- `provider_id`
- `label`
- `discovery_status`: `COMPLETE`, `AUTH_REQUIRED`, `REGION_BLOCKED`, `UNAVAILABLE`, `CLOSED`, `PARTIAL`
- requested start URL
- actual final origin(s) and URL(s) after redirects
- new-chat URL shape
- established-chat URL shape
- whether URL changes on first send
- conversation-id candidate(s), sanitized regex/shape, source of evidence
- canonical-link evidence if any
- active-sidebar/history evidence if any
- whether identity can be confirmed with one source or needs corroboration
- whether guest chats persist
- model/mode selected during probe
- whether the UI is normal turn-based chat, agent task, or mixed
- notes about login/region/plan restrictions

### 2. `selectors.json`

For every selector/strategy, record the exact query/algorithm, match count in each relevant state, stability rationale, and fallbacks.

Required concepts:

- assistant message root
- user message root
- stable message ID
- assistant text surface
- code block root
- local code-copy control
- raw code text surface
- code-block geometry anchor
- composer element
- composer root/form
- active Send
- disabled Send
- Stop/generating control
- idle/ready-after-send control/state
- active conversation/sidebar item if used for identity

Prefer, in order:

1. stable `data-*` attributes
2. stable `aria-*`
3. semantic role/type
4. deterministic structural relationships
5. localized visible text only as a last-resort fallback

Do not rely on minified/hash CSS class names unless no better evidence exists; if used, classify as brittle.

### 3. `dom/`

Save minimal sanitized snippets, one file per state, e.g.:

- `composer-empty.html`
- `composer-filled.html`
- `send-active.html`
- `send-disabled.html`
- `generating.html`
- `stop-control.html`
- `ready-after-completion.html`
- `user-turn.html`
- `assistant-turn-generating.html`
- `assistant-turn-complete.html`
- `code-block.html`
- `active-history-item.html`

Each file should contain only the smallest useful ancestor subtree. Replace private text and private raw IDs with placeholders while preserving attribute names and structure.

### 4. `behavior.json`

Record observed facts:

- composer implementation: `textarea`, `input`, `contenteditable`, ProseMirror, CodeMirror, custom editor, etc.
- exact method that successfully updates the provider's UI model, if one exists
- whether native setter + `InputEvent` is enough
- whether `change` is needed
- whether React/Vue/Angular/etc. reverts direct DOM mutation
- unique Send candidate count
- programmatic `.click()` outcome
- user-turn count before/after click
- whether composer clears
- generation start signal
- generation stop/completion signal
- post-send ready signal
- whether completion is distinguishable without relying on response wording
- route/node replacement behavior during SPA navigation
- hidden/duplicate composer count
- hidden/duplicate send-control count
- whether code raw text is exact
- whether code block has a local copy control
- whether thinking/reasoning/tool output uses a separate subtree

### 5. `adapter-proposal.json`

Map live evidence into the future generalized adapter contract:

- `id`
- `label`
- `origins`
- `matchesLocation`
- `conversationIdentity`
- `assistantMessages`
- `userMessages`
- `messageId`
- `messageText`
- `findCodeBlocks`
- `readCodeText`
- `geometryAnchor`
- `isGenerating`
- `messageComplete`
- `composerContext`
- `composerWriteStrategy`
- `sendControl`
- `stopControl`
- `readyAfterSend`
- `deliveryConfirmationBasis`
- `localeDependencies`
- `knownRisks`

This is a proposal only; do not implement it in production during this pass.

### 6. `recommendation.md`

Give one verdict:

- `SUPPORTED_NOW`
- `SUPPORTED_AFTER_ADAPTER_SPECIAL_CASE`
- `MANUAL_ONLY`
- `AUTORUN_ONLY`
- `UNSAFE/UNSUPPORTED`
- `AUTH_REQUIRED / NOT TESTED`

Explain exactly why. A provider is **not** `SUPPORTED_NOW` merely because selectors exist. One-shot delivery and conversation ownership must be demonstrably safe.

## Provider-specific questions

### ChatGPT baseline

Capture fixtures for normal chat and current Work composer behavior. Confirm existing selectors/lifecycle so a future refactor can prove no regression.

### Alice baseline

Capture `[data-message-role]`, code-block and `standalone-input`/`oknyx` lifecycle; confirm the existing `ready` control behavior.

### Claude

- exact route/conversation-id pattern
- stable turn roots/message IDs
- code-block local copy toolbar ownership
- composer/send/stop lifecycle
- deterministic ready/completion basis

### Gemini

- inspect the actual current `gemini.google.com` routes; do not assume historical `/app/...`
- when the durable chat identifier appears
- stable turn/message IDs in custom/Angular DOM
- code block/copy
- composer/send/stop
- completion signal independent of wording

### DeepSeek

- route/chat ID
- normal versus reasoning/DeepThink output subtrees
- code/copy ownership
- composer/send/stop/completion

### Qwen

- route/chat ID
- normal versus thinking/tool-use DOM
- code/copy
- composer/send/post-send ready

### Kimi

- compare normal Chat with Agent/Swarm modes
- choose the safest turn-based surface
- route/history identity
- code/composer/send/generation/ready

### Grok

- normal chat versus tool/build modes
- route/message IDs
- code/copy
- composer/send/stop/ready

### Mistral Vibe

Le Chat has been renamed Vibe and Chat is migrating. Inspect both current Work and any still-available Chat mode. Recommend the surface least likely to disappear while still offering deterministic turn/composer lifecycle. Record migration risk explicitly.

### Copilot

Use ordinary `copilot.com` Chat, not Microsoft 365 document UI. Record personal/work route differences, stable identity, code/composer lifecycle and one-shot send reliability.

### Perplexity

Separate ordinary chat/search mode from Pro/Research. Identify thread route, citations versus answer/code ownership, completion signal and composer/send lifecycle.

### Meta AI

Prove route/history ownership, code-block fidelity and deterministic send/completion. If exact code payload or turn ownership is unreliable, mark unsupported.

### GigaChat

Avoid selectors based only on Russian text. Find structural selectors, route/chat ID, code/copy and composer/send/stop/ready lifecycle.

### Duck.ai

Switch between at least two available text models and determine whether one platform adapter remains valid. Do not confuse selected model with conversation identity. If guest sessions have no durable per-chat identity, evaluate whether Manual can be safe while Autorun must be disabled.

### OpenRouter Chat

Test at least two underlying models. Keep selected model separate from thread identity. Determine whether one playground adapter covers all models and whether chat history/route identity is durable.

### Poe

Test the default/official assistant and one model-specific bot if accessible. Keep bot identity separate from thread identity. Verify common DOM or document required special cases.

### Proton Lumo

- guest versus signed-in conversation identity
- zero-access-encrypted saved-chat behavior is not a reason to inspect storage secrets
- exact fenced-code fidelity
- composer/send/stop/ready lifecycle

### T3 Chat

Test two underlying models if plan/access permits. Determine whether model switching changes only rendering content or the structural chat DOM. Record thread identity and common send/completion lifecycle.

### Z.ai

It currently identifies itself as Open WebUI-derived. Distinguish stable semantic attributes from upstream/generated classes. Record route/chat ID and message/code/composer lifecycle.

### Doubao / Yuanbao / ERNIE

Find non-text structural selectors despite Chinese localization. Record login/region limitations. For ERNIE follow the 2026 upgraded-service link rather than assuming the legacy page is the current final app.

### MiniMax

Compare Agent and any still-live Chat. Prefer deterministic normal chat. If only long-running agent semantics are available, classify special-case/unsupported rather than inventing a chat adapter.

### Manus

Inspect Chat Mode first. Keep Agent Mode separate. Do not treat long-running agent completion as a normal assistant-turn completion signal.

### Genspark

Determine whether normal signed-in web chat has a clean turn lifecycle separate from long-running Super Agent/task/artifact UI.

### Blackbox AI

Inspect `agent.blackbox.ai` normal Q&A/chat separately from coding workspace/agent modes.

### Pi

Explicitly test exact fenced-code fidelity. Pi is a personal conversational assistant, so protocol fidelity may be the limiting factor even if DOM selectors are easy.

### LMArena

Chat/battle is a model-comparison product. Determine whether a durable single-thread identity and unambiguous user/assistant ownership exist. If responses are dual/battle-owned or ephemeral, mark unsupported.

### Character.AI

Only classify feasibility. Do not spend excessive effort: if it rewrites protocol code, uses character-specific semantics, or cannot guarantee exact code output, mark unsupported.

### Phind / Scira / naturally discovered sites

First prove a current browser chat exists. Never add a site from stale knowledge alone.

## Cross-provider tests

For every provider with a usable chat, also test:

1. create a new disposable chat;
2. establish identity;
3. send the harmless code probe exactly once;
4. wait for completion;
5. inspect exact raw code;
6. switch to a second conversation;
7. verify old DOM nodes/IDs are no longer considered current;
8. return to first conversation;
9. verify identity resolves back to the first chat;
10. record whether a MutationObserver + route poll strategy is sufficient or provider-specific navigation events are needed.

Do not use extension production code to fake support during discovery.

## Final outputs

At root of the discovery directory create:

### `PROGRESS.md`

For each provider: status, last completed state, blocker, evidence commit SHA.

### `SUPPORT_MATRIX.md`

Columns:

- Provider
- Actual origin
- Auth state
- Conversation identity confidence
- Stable message IDs
- Exact code block
- Composer injection
- Unique Send
- Generation completion
- SPA navigation safety
- Manual feasibility
- Autorun feasibility
- Verdict
- Main risk

### `PROVIDER_REGISTRY_DESIGN.md`

Using the live evidence, propose the minimal generalized provider registry that eliminates current `chatgpt/alice` hardcodes from:

- manifest host/match generation or maintained source-of-truth list
- `shared/ai_adapters.js`
- `shared/conversation_identity.js`
- `content_script.js` composer/control routing
- `service_worker.js` AI mode and delivery confirmation policy
- `popup.html` / `popup.js` provider selector and labels

Do not implement the refactor yet. Show the proposed API/interface and exactly which current hardcoded branches it replaces.

### `DISCOVERY_SUMMARY.md`

Summarize:

- providers safe for first implementation batch
- providers needing special-case adapters
- providers safe only for Manual or only for Autorun
- providers rejected and why
- provider groups sharing one platform DOM (e.g. aggregators across underlying models)
- exact next implementation order optimized for maximum coverage with minimum provider-specific code

## Quality gates

Before marking discovery complete:

- no production extension file changed
- no accepted artifact changed
- no credentials/tokens/cookies stored in repo
- no full-page private HTML dumps
- each `SUPPORTED*` verdict has live composer/send/completion evidence
- every provider evidence folder has explicit provenance and timestamp
- all raw IDs/personal data sanitized
- support matrix agrees with per-provider recommendation files
- `PROGRESS.md` has no silent omissions; unavailable providers are explicitly classified

At the end, commit all research evidence and report:

- branch name
- final commit SHA
- list of provider folders
- counts by verdict
- paths to `SUPPORT_MATRIX.md`, `PROVIDER_REGISTRY_DESIGN.md`, and `DISCOVERY_SUMMARY.md`
- any providers that require the operator to log in before a second discovery pass

Do not start production implementation until this discovery result is reviewed and explicitly approved.