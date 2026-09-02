# Ozon Bridge — Multi-AI autodetect, binding and multichannel patch

Date: 2026-09-02
Status: IN_PROGRESS — architecture review and design
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
7. Manual Ozon buttons and/or Autorun operate only inside that channel.
8. Many independent channels may run in parallel in the same browser: multiple chats of one AI, chats of different AIs, multiple tabs, separate Manual/Autorun states, and separate delivery/recovery ownership.
9. Only when automatic provider detection or deterministic conversation identity cannot be resolved must Bridge ask the operator to choose a provider explicitly.
10. Explicit selection is a constrained fallback for the current tab, not a global mode and not permission to bypass identity verification.

## 3. Core isolation invariant

A channel is not identified merely by `tab_id` and not merely by provider name.

Target durable channel identity:

`channel_key = <provider_id>|<normalized_origin>|<provider_conversation_id>`

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

## 5. Initial architecture hypothesis

The present two-provider implementation must be refactored into a canonical provider registry. Provider-specific behavior should be supplied through adapter capabilities, while binding/work/delivery state machines remain provider-agnostic.

Proposed provider descriptor responsibilities:

- provider ID, label, trusted origins and URL matching;
- provider confidence/evidence probe;
- new-chat and established-chat route recognition;
- deterministic conversation identity extraction and optional corroboration;
- assistant/user turn discovery and stable message IDs;
- generation/completion detection;
- code-block discovery and exact raw-code extraction;
- composer context and compatible text-write strategy;
- active/disabled Send, Stop and post-send-ready classification;
- delivery confirmation policy;
- SPA navigation evidence and teardown triggers.

## 6. Roadmap

- [x] Step 0 — create durable patch document and restrict scope to Tier A.
- [ ] Step 1 — fully map the current provider detection, conversation identity, binding, pending-start, work-session and per-tab AI-mode implementation.
- [ ] Step 2 — identify all current ChatGPT/Alice hardcodes and state keys that block true provider-generic multichannel operation.
- [ ] Step 3 — design automatic provider detection with confidence/evidence levels and an operator fallback that cannot override identity safety.
- [ ] Step 4 — design provider-generic conversation identity and new-chat pending-start transactions.
- [ ] Step 5 — design durable channel ownership, tab leasing/rebinding and parallel Manual/Autorun operation across same/different providers.
- [ ] Step 6 — design generic start-prompt send, assistant baseline, code-block binding, Autorun watch and result-delivery lifecycle.
- [ ] Step 7 — define storage migrations, provider registry schema, popup changes and diagnostic/redaction requirements.
- [ ] Step 8 — define regression/unit/live acceptance matrix, including collision, SPA navigation, duplicate tabs, tab close/reopen and ambiguous detection cases.
- [ ] Step 9 — incorporate Tier A Codex DOM evidence provider by provider and freeze support verdicts.
- [ ] Step 10 — produce implementation sequence for the large patch, build a candidate, run regressions and live acceptance.

## 7. Progress log

### 2026-09-02 — Step 0 completed

- Created dedicated design branch and this durable authority document.
- Restricted new-provider scope to Tier A.
- Recorded the required zero-selection normal path, explicit-selection fallback and parallel-channel objective.
- Began Step 1: current implementation review.
