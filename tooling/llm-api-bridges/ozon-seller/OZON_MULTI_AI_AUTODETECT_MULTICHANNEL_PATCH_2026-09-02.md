# Ozon Bridge — Multi-AI autodetect, binding and multichannel patch

Date: 2026-09-02
Status: IN_PROGRESS — autodetection/channel architecture design
Design branch: `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

This document is the durable authority for the large Multi-AI autodetection/multichannel patch. Every material finding, decision, roadmap change and implementation result must be written here before or together with chat reporting.

## 0. Accepted baseline

- Existing production adapters: ChatGPT and Yandex Alice.
- Accepted production source commit: `516ecf140538ad2838d39dcd01c7428efc1880d3`.
- Accepted release-record commit: `5fc002962f86368bcd0f64cd01bfa7d4e06558a1`.
- Existing expansion design: `OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md`.
- Existing DOM-discovery prompt: `CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md`.

## 1. Scope correction

The new-provider scope is limited to Tier A only. Tier B and Tier C are removed from the implementation/discovery target for this patch.

Baseline providers retained:

- ChatGPT
- Yandex Alice

Tier A onboarding candidates:

- Claude
- Google Gemini
- DeepSeek
- Qwen
- Kimi
- Grok
- Mistral Vibe
- Microsoft Copilot
- Perplexity
- Meta AI
- GigaChat
- Duck.ai
- OpenRouter Chat
- Poe
- Proton Lumo
- T3 Chat

No Tier B/C provider may be added to the production manifest or adapter registry as part of this patch.

## 2. Required operator experience

The normal path must require no manual AI selection:

1. Operator opens any supported AI web page, including a new empty chat.
2. Operator presses `Начать работу` in Ozon Bridge.
3. Bridge automatically identifies the AI provider from trusted page evidence.
4. Bridge sends the start prompt through that provider's composer.
5. If the new chat had no stable conversation identity before first send, Bridge maintains a tab-scoped pending-start transaction.
6. As soon as the provider exposes a deterministic conversation identity, Bridge atomically binds that exact provider/origin/conversation to the work session.
7. Manual Ozon buttons and/or Ozon Autorun operate only inside that channel.
8. Many independent channels may run in parallel in the same browser: multiple chats of one AI, chats of different AIs, multiple tabs, separate Manual/Autorun states, and separate delivery/recovery ownership.
9. Only when automatic provider detection or deterministic conversation identity cannot be resolved must Bridge ask the operator to choose a provider explicitly.
10. Explicit selection is a constrained fallback for the current tab, not a global mode and not permission to bypass identity verification.

Two different meanings of “auto” must remain distinct:

- **AI provider autodetection** — automatically select the web-page adapter. This is the default for every tab and should normally require no operator action.
- **Ozon Autorun** — automatically continue the Ozon command/result loop in one bound AI conversation. This remains a separate per-channel execution mode.

Both Manual/Work and Ozon Autorun must reuse the same provider detection, conversation identity and channel ownership layer.

## 3. Core isolation invariant

A channel is not identified merely by `tab_id` and not merely by provider name.

Current durable key:

`<raw origin>|<lowercased conversation_id>`

Target durable channel identity will be versioned and provider-aware. The final encoding is designed below; it must preserve provider-specific case rules and origin aliases.

A browser tab is only the current execution/DOM owner of a durable channel. It may disappear or be replaced. A channel must never inherit another channel's Manual operation, Autorun, work session, prompt baseline, delivery, recovery or UI state.

## 4. Non-negotiable safety invariants

- Provider autodetection must be fail-closed.
- Hostname is a primary provider signal, but a user-selected mode never fabricates conversation identity.
- One exact pending start belongs to one tab + provider candidate + start intent/revision.
- One durable work session belongs to one confirmed channel key.
- No API result may be inserted into a different provider/chat than its owner.
- SPA navigation must invalidate stale DOM ownership before any click/insertion.
- Unknown Send outcome must never cause a duplicate Send.
- Unknown Ozon request outcome must never cause automatic replay.
- Existing Ozon credential, allowlist, privacy, entitlement, one-request, no-hidden-pagination and recovery invariants remain unchanged.
- Parallel channels may share account-level Ozon rate-limit state, but must never share logical run/manual/delivery state.

## 5. Current implementation map — completed review

Reviewed accepted production files:

- `manifest.json`
- `shared/ai_adapters.js`
- `shared/conversation_identity.js`
- `shared/work_session_model.js`
- `shared/runtime_names.js`
- `shared/composer_send.js`
- `content_script.js`
- `service_worker.js`
- `popup.html`
- `popup.js`

### 5.1 Current provider detection

Current `AI_MODES` is hardcoded to:

- `auto`
- `chatgpt`
- `alice`

`auto` calls `adapterForLocation()` and selects the first adapter whose `matchesLocation()` accepts `location.hostname`.

The worker independently calls `BB2ConversationIdentity.providerForOrigin(origin)` using the active tab URL. This is currently an exact origin lookup for ChatGPT/Alice.

Per-tab manual adapter override is stored in `chrome.storage.session` under `AI_TAB_MODES`, keyed by `tab_id`. Global AI mode has already been removed.

Current weakness: `OZ_SET_TAB_AI_MODE` verifies only that the tab belongs to some supported AI, then asks content to apply the requested mode. Content can return `ok:true` with `adapter_id:null` after an incompatible override. The tab becomes fail-closed, but the override is not a safe evidence-confirming fallback.

### 5.2 Current conversation identity

`shared/conversation_identity.js` recognizes only:

- ChatGPT `/c/<UUID>` plus optional canonical-link corroboration;
- Alice `/chat/<UUID>` plus required active-history corroboration.

The resolver returns `confirmed`, `unknown`, `conflict`, or `unsupported` plus source evidence.

The worker recomputes provider from origin, rejects provider/origin disagreement, rejects identity conflicts and currently lowercases every conversation ID.

Current durable key is:

`conversation_key = origin + "|" + conversation_id`

### 5.3 Current binding

Bindings are stored in `CONVERSATION_BINDINGS`, keyed by `conversation_key`.

`bindConversation()`:

1. Requires a confirmed conversation ID.
2. Re-reads live identity from the exact tab.
3. Rejects stale popup context.
4. Creates or revises an `ozbind-*` binding record.
5. Stores origin, derived AI ID, conversation ID and key.
6. Optionally atomically creates a work session in `binding` state.
7. Snapshots the binding into active Manual/Autorun durable state.

`strictBindingForIdentity()` and `assertRunBinding()` fail closed if current identity, binding or binding snapshot diverge.

Strength: the binding is already conversation-scoped rather than globally AI-scoped.

### 5.4 Current new-chat pending start

`Начать работу` already supports a chat that has no conversation ID yet:

1. Worker identifies the provider/origin.
2. Creates a `PENDING_WORK_STARTS[tab_id]` transaction.
3. Content inserts and sends the start prompt.
4. Content records assistant-turn baseline before Send.
5. Content polls identity every 500 ms for up to 120 seconds.
6. When a conversation ID appears, it watches only assistant turns absent from the baseline.
7. After the first new assistant turn is complete, worker verifies tab/provider/origin/ID, binds the channel, activates work-session and enables the Ozon UI.

The pending transaction stores provider, origin, tab, intent/revision, expiry, prompt-delivery flag, observed conversation ID and first-response state.

Strength: this already prevents binding a different chat merely because it shares a provider.

Weaknesses to fix:

- Pending start is specialized for ChatGPT/Alice route rules.
- Fixed 120-second polling lifecycle is not provider-configurable.
- `OZ_WORK_START` receives an operator `start_intent_id`, but the unconfirmed-chat branch creates another internal intent ID instead of preserving the supplied idempotency identity.
- Work start does not use the durable commit-before-click protocol used by Autorun start/delivery. A response loss around a successful click is therefore less strongly protected than Autorun.
- Binding happens only after the first response is complete. That is safe for Manual/Work, but a direct Autorun bootstrap must claim the new channel earlier so it cannot miss the first assistant response containing an Ozon command.

### 5.5 Current work-session state

`OzonWorkSessionModel` is a revisioned state machine:

- `inactive`
- `pending_identity`
- `binding`
- `active_visible`
- `active_hidden`
- `recovering`
- `finishing`
- `error`

The durable record stores conversation key, tab ID, origin, AI ID, conversation ID and start intent. Revision checks reject stale events.

### 5.6 Current multichannel state separation

The following maps are already keyed by conversation key:

- bindings;
- work sessions;
- Manual mode;
- Manual operations;
- Autoruns;
- result prefixes;
- per-conversation start prompts;
- work recoveries.

Therefore different conversations of the same AI and conversations of different AIs already have separate durable logical state as long as identity is correct.

Per-tab content runtimes also keep independent DOM observers, Ozon buttons, delivery watchers and adapter selection.

### 5.7 Current owner-tab/rebinding behavior

Manual operation and Autorun each store an owner `tab_id`.

When another tab displaying the same conversation syncs:

- if the original owner tab still displays that conversation, the new tab is `duplicate_non_owner`;
- if the old owner is gone or no longer displays the channel, the new tab may atomically take ownership after exact conversation verification;
- Ozon operation/run IDs and durable delivery phases remain unchanged.

This is a strong basis for tab replacement and recovery.

Current weakness: work-session/UI ownership, Manual-operation ownership and Autorun ownership are separate concepts. Before an operation exists, duplicate tabs can both observe an `active_visible` work session. Admission locks prevent two accepted API operations, but UI ownership is not represented by one canonical channel lease.

### 5.8 Current delivery ownership and confirmation

Every Manual/Autorun operation carries:

- conversation key;
- origin;
- conversation ID;
- binding snapshot;
- owner tab;
- delivery ID and phase.

Before insertion/click/confirmation, the worker verifies exact tab ownership and exact current conversation.

Delivery confirmation is hardcoded by origin:

- ChatGPT: `microphone`, with Work-specific `work_submit_disabled_after_click` compatibility;
- Alice: `alice_ready`.

This must become provider-adapter policy for Tier A.

### 5.9 Current parallelism semantics

Independent channels can execute concurrently at the state-machine level. Shared Ozon credentials and account/provider quota coordination are intentionally global. A quota wait in one endpoint family may delay physical dispatch, but must not merge, overwrite or rebind another channel's logical operation.

## 6. Hardcoded blockers identified

1. Manifest host list contains only ChatGPT/Alice.
2. `AI_MODES` is duplicated/hardcoded in content, worker and popup.
3. Provider detection and identity are hardcoded in `conversation_identity.js`.
4. Conversation route format assumes UUID and lowercases every ID.
5. Binding normalization derives provider solely from raw origin.
6. Conversation key uses raw origin and unescaped ID.
7. ChatGPT composer/send/microphone/stop logic is embedded in `content_script.js`; every non-Alice adapter would otherwise fall through to ChatGPT behavior.
8. Delivery confirmation basis is hardcoded in worker and content.
9. Popup provider list and labels are hardcoded.
10. New-chat pending start is Work-specific rather than a reusable channel bootstrap.
11. Work/manual and Autorun do not yet share one provider-generic bootstrap state machine.
12. There is no canonical channel lease covering idle Work UI, Manual operation and Autorun ownership.
13. Adapter override is a mode switch, not a constrained proof-based ambiguity resolver.
14. Static manifest permissions can drift from runtime registry unless generation/parity checks are added.

## 7. Initial architecture direction

The present two-provider implementation must be refactored into a canonical provider registry. Provider-specific behavior should be supplied through adapter capabilities, while binding/work/delivery state machines remain provider-agnostic.

Proposed provider descriptor responsibilities:

- provider ID, label, trusted origins and URL matching;
- canonical surface/origin scope;
- provider confidence/evidence probe;
- new-chat and established-chat route recognition;
- provider-specific conversation ID normalization;
- deterministic conversation identity extraction and optional corroboration;
- assistant/user turn discovery and stable message IDs;
- generation/completion detection;
- code-block discovery and exact raw-code extraction;
- composer context and compatible text-write strategy;
- active/disabled Send, Stop and post-send-ready classification;
- delivery confirmation policy;
- SPA navigation evidence and teardown triggers;
- provider-specific bootstrap timeout/capabilities.

Provider-agnostic layers continue to own:

- channel binding;
- channel lease;
- Manual/Autorun exclusion within one channel;
- command parsing and Ozon execution;
- stable composer target validation;
- commit-before-click/insert;
- durable delivery/recovery;
- diagnostics redaction.

## 8. Roadmap

- [x] Step 0 — create durable patch document and restrict scope to Tier A.
- [x] Step 1 — fully map the current provider detection, conversation identity, binding, pending-start, work-session and per-tab AI-mode implementation.
- [x] Step 2 — identify current ChatGPT/Alice hardcodes and state keys that block true provider-generic multichannel operation.
- [ ] Step 3 — design automatic provider detection with confidence/evidence levels and an operator fallback that cannot override identity safety.
- [ ] Step 4 — design provider-generic conversation identity and new-chat pending-start transactions.
- [ ] Step 5 — design durable channel ownership, tab leasing/rebinding and parallel Manual/Autorun operation across same/different providers.
- [ ] Step 6 — design generic start-prompt send, assistant baseline, code-block binding, Autorun watch and result-delivery lifecycle.
- [ ] Step 7 — define storage migrations, provider registry schema, popup changes and diagnostic/redaction requirements.
- [ ] Step 8 — define regression/unit/live acceptance matrix, including collision, SPA navigation, duplicate tabs, tab close/reopen and ambiguous detection cases.
- [ ] Step 9 — incorporate Tier A Codex DOM evidence provider by provider and freeze support verdicts.
- [ ] Step 10 — produce implementation sequence for the large patch, build a candidate, run regressions and live acceptance.

## 9. Progress log

### 2026-09-02 — Step 0 completed

- Created dedicated design branch and durable authority document.
- Restricted new-provider scope to Tier A.
- Recorded the required zero-selection normal path, explicit-selection fallback and parallel-channel objective.

### 2026-09-02 — Steps 1–2 completed

- Reviewed accepted production identity, binding, Work, Manual, Autorun, owner-tab and delivery code.
- Confirmed that per-conversation durable state already gives a strong multichannel foundation.
- Confirmed that owner-tab rebind is already fail-closed for Manual operations and Autorun.
- Identified all major two-provider hardcodes and new-chat bootstrap gaps.
- Began Step 3: provider autodetection and fallback design.
