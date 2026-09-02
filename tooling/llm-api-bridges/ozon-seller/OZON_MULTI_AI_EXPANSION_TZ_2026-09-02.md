# Ozon Bridge — Multi-AI expansion technical specification

Date: 2026-09-02  
Status: AUTHORITATIVE — DISCOVERY INPUT  
Scope: existing baseline providers + Tier A only  
Repository: `MaksimUnimax/blood_sand`  
Design branch: `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

This document is the authoritative product and technical specification for expanding Ozon Bridge from the existing ChatGPT and Yandex Alice adapters to the approved Tier A web-AI surfaces. It is intentionally self-contained so a browser-discovery or implementation agent can work without reconstructing requirements from chat history.

## 1. Authority and conflict resolution

The current authority set is:

1. `OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md` — product and technical requirements;
2. `CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md` — exact research procedure and evidence format;
3. `OZON_MULTI_AI_AUTODETECT_MULTICHANNEL_PATCH_2026-09-02.md` — reviewed current architecture and target patch design;
4. `CODEX_MULTI_AI_TIER_A_SCOPE_CORRECTION_2026-09-02.md` — historical scope correction that confirms the same Tier A-only boundary.

If an older prompt, branch, note, roadmap, chat message or already collected package mentions Tier B or Tier C, that older scope is superseded. The only active discovery and implementation scope is the baseline plus Tier A list in section 3.

No missing document may be silently reconstructed from memory. If any authority file is unavailable at the exact path, stop before opening provider pages and report the missing path and checked ref.

## 2. Product objective

The extension must become a provider-generic Ozon-to-AI bridge capable of operating safely across many supported web AI applications in one browser.

The intended operator experience is:

1. Open a supported AI chat page, including a new empty chat.
2. Open the Ozon Bridge popup.
3. Press `Начать работу`.
4. The extension automatically determines which supported web AI application is active.
5. It sends the configured start prompt exactly once.
6. It binds the exact provider surface and exact conversation when a deterministic conversation identity is available.
7. Manual Ozon actions and Ozon Autorun work only in that bound channel.
8. Other tabs and conversations continue independently.
9. The operator is asked to choose a provider only when deterministic automatic detection leaves a genuine constrained ambiguity.

The extension identifies the controlled **web application**, not the model selected inside an aggregator. For example:

- Claude on `claude.ai` uses provider adapter `claude`;
- Claude selected inside Poe uses provider adapter `poe`;
- GPT, Claude or Gemini selected inside OpenRouter Chat uses provider adapter `openrouter_chat`;
- a model selected inside T3 Chat uses provider adapter `t3_chat`.

Underlying model name may be recorded as optional diagnostics. It is not a binding or security identity.

## 3. Approved provider scope

### 3.1 Existing baseline adapters

1. ChatGPT — `https://chatgpt.com/` and accepted official alias behavior already present in the extension;
2. Yandex Alice — `https://alice.yandex.ru/`.

### 3.2 Tier A onboarding candidates

3. Claude — start at `https://claude.ai/`;
4. Google Gemini — start at `https://gemini.google.com/`;
5. DeepSeek — start at `https://chat.deepseek.com/`;
6. Qwen — start at `https://chat.qwen.ai/`;
7. Kimi — start at `https://www.kimi.com/`;
8. Grok — start at `https://grok.com/`;
9. Mistral Vibe / Le Chat — start at `https://chat.mistral.ai/`;
10. Microsoft Copilot — start at `https://copilot.com/`;
11. Perplexity — start at `https://www.perplexity.ai/`;
12. Meta AI — start at `https://meta.ai/` and record the actual redirect/origin;
13. GigaChat — start at `https://giga.chat/`;
14. Duck.ai — start at `https://duck.ai/`;
15. OpenRouter Chat — start at `https://openrouter.ai/chat`;
16. Poe — start at `https://poe.com/`;
17. Proton Lumo — start at `https://lumo.proton.me/`;
18. T3 Chat — start at `https://t3.chat/`.

### 3.3 Explicit exclusions

Tier B and Tier C providers are not part of this patch. Do not:

- open them for new discovery;
- spend browser actions on them;
- add their hosts to the manifest;
- add production registry entries or adapters;
- include them in the implementation batch;
- describe them as required for completion.

Already committed valid evidence for an excluded provider may be preserved and marked `OUT_OF_CURRENT_SCOPE`; it must not control current design or completion criteria.

## 4. Accepted production baseline

The accepted production source baseline is:

`516ecf140538ad2838d39dcd01c7428efc1880d3`

Existing supported web surfaces are ChatGPT and Yandex Alice. The current implementation already provides important safety mechanisms that must be retained:

- conversation-scoped durable binding;
- revisioned Work-session state;
- Manual and Autorun operation isolation by conversation key;
- owner-tab checks and fail-closed rebinding;
- binding snapshots in active operations;
- exact delivery IDs and delivery phases;
- commit-before-click boundaries in protected Autorun/delivery paths;
- no automatic replay after unknown provider-request outcome;
- no automatic replay after unknown Send/insertion outcome;
- Ozon operation allowlist and entitlement checks;
- personal-data gating;
- no hidden pagination;
- durable result delivery/reconciliation state;
- account-level quota/token coordination without merging logical conversations.

The multi-AI patch must generalize these mechanisms rather than replace them with a weaker provider-specific implementation.

## 5. Terminology

### 5.1 Provider

The supported web application whose page DOM the extension controls, such as `chatgpt`, `claude`, `poe` or `openrouter_chat`.

### 5.2 Surface

A canonical realm inside a provider that may need separate trust or identity rules, such as consumer, personal, work or a dedicated chat application. A provider may have one or several surfaces.

### 5.3 Conversation identity

The deterministic provider-specific identifier of one exact chat/thread. It may come from URL path, canonical URL, router state, active sidebar item, stable DOM attributes or a verified combination of signals.

### 5.4 Channel

One exact provider surface plus one exact confirmed conversation identity.

Target channel key:

`aich:v2:<provider_id>:<surface_id>:<base64url(provider-normalized conversation_id)>`

### 5.5 Provider grant

A short-lived worker-authorized record proving that worker URL evidence and content DOM evidence agree on one provider and surface for one tab/page/runtime/route epoch.

### 5.6 Channel lease

The current exclusive DOM ownership of a durable channel by one exact tab/content-runtime/page-instance. The durable channel may survive tab replacement; the lease may not.

### 5.7 Bootstrap

The start lifecycle used when a chat may not yet expose a stable conversation identity. It covers provider detection, start prompt insertion, exactly-once Send, identity stabilization, binding and first-turn baseline transfer.

## 6. Functional requirements

### 6.1 Automatic provider detection

The normal path must not require a provider selector.

Provider detection is a two-sided handshake:

**Worker evidence**

- top-level tab ID;
- actual `chrome.tabs.get(tabId).url`;
- trusted registry origin/path candidates;
- expected canonical surface candidates.

**Content evidence**

- top-frame status;
- actual `location.origin`, pathname and href;
- provider-specific positive application/chat DOM signature;
- composer/message-root readiness;
- content runtime ID;
- page-instance ID;
- route epoch;
- registry/adapter version.

Execution is permitted only when the two sides agree on exactly one provider/surface.

Required detection states:

- `CONFIRMED`;
- `PENDING_PAGE_READY`;
- `AMBIGUOUS`;
- `CONFLICT`;
- `UNSUPPORTED`;
- `CONTENT_UNAVAILABLE`.

A numeric confidence score may be diagnostic only. A fuzzy score must never replace deterministic gates.

### 6.2 Operator fallback

A fallback provider chooser appears only for `AMBIGUOUS`.

It must:

- show only candidates compatible with the current trusted origin/path and positive DOM evidence;
- be scoped to `tab_id + content_runtime_id + page_instance_id + route_epoch + registry_version`;
- expire after navigation, reload, tab close, runtime replacement or registry change;
- require a second DOM validation before execution;
- never fabricate a conversation identity;
- never convert `UNSUPPORTED`, `CONFLICT` or `CONTENT_UNAVAILABLE` into an executable page.

There must be no persistent global provider mode.

### 6.3 Conversation identity

Each provider adapter must define:

- recognized established-chat routes;
- recognized new-chat routes;
- all trusted identity sources;
- source priority and corroboration rules;
- case sensitivity and normalization rules;
- stability requirements;
- conflict conditions;
- behavior when several conversations remain mounted in the DOM;
- behavior during SPA navigation;
- behavior after redirect, reload and back/forward navigation.

No provider is production-supported unless a deterministic conversation identity can be confirmed for the operations it claims to support.

Assistant text, model name, page title and localized labels are not identity evidence.

### 6.4 New-chat bootstrap

For a new chat without a stable identity:

1. Confirm provider/surface and issue a provider grant.
2. Create one tab/page-scoped bootstrap transaction.
3. Capture ordered user/assistant turn baselines before insertion.
4. Hash the exact configured start prompt.
5. Find one compatible composer and one compatible active Send.
6. Persist `PROMPT_COMMITTED` before granting one click.
7. Perform at most one Send click.
8. Reconcile ambiguous post-click outcomes without a second click.
9. Observe provider-specific conversation identity evidence.
10. Require configured stability/corroboration before freezing the identity.
11. Build the v2 channel key and binding atomically.
12. Transfer the pre-Send baselines into Work or Autorun.
13. Continue only inside the frozen channel.

If the tab changes provider/surface/page instance before identity freeze, cancel the bootstrap.

If it changes to another conversation after identity freeze, fail closed; do not bind the new conversation.

### 6.5 Existing-chat start

For an already identified chat, `Начать работу` must:

- revalidate provider grant and conversation identity;
- acquire or confirm the channel lease;
- create or update the binding;
- use commit-before-click for the start prompt;
- send exactly once;
- enable Work UI only in the channel owner tab;
- preserve existing binding if the Work session is later hidden or finished, according to current accepted semantics.

### 6.6 Work/Manual mode

Manual Ozon actions must remain channel-scoped.

A Manual operation must include:

- provider ID and surface ID;
- channel key and conversation ID;
- binding snapshot;
- owner lease ID/epoch and owner tab/runtime/page instance;
- manual request ID and operation ID;
- exact Ozon command fingerprint;
- request/delivery state and delivery ID;
- route/grant evidence required before copy, insertion or Send.

A stale, non-owner or different-channel DOM must not receive buttons or execute a command.

### 6.7 Ozon Autorun

Ozon Autorun is separate from provider autodetection.

Autorun must reuse the same provider grant, identity, binding, bootstrap and channel lease layer. It must:

- be started independently for one bound channel;
- capture ordered turn baselines;
- watch only new completed assistant turns belonging to that channel;
- extract exact `OZON_API_V1` code without markdown corruption;
- preserve one-request/no-hidden-pagination/policy/entitlement rules;
- deliver the result only to the same channel;
- recover without duplicate Ozon requests or duplicate Send clicks.

Direct Autorun from a new empty chat is permitted only when discovery proves the provider exposes identity and turn evidence early enough to avoid missing the first assistant response. Otherwise the verdict must state that limitation, for example `WORK_SUPPORTED / NEW_CHAT_AUTORUN_UNSAFE`.

### 6.8 Multichannel operation

The browser must support parallel independent channels:

- multiple conversations of one provider;
- conversations of different providers;
- Manual in one channel and Autorun in another;
- several independent Autoruns where Ozon quota permits;
- several windows/tabs;
- one conversation reopened after owner-tab loss.

All logical state remains channel-scoped. Shared account-level resources may include:

- Ozon credentials;
- Performance token;
- account-level quota timers;
- provider result cache where query compatibility explicitly permits it.

Shared resources must never merge operation/run/delivery ownership or route results to the wrong conversation.

### 6.9 Same conversation in multiple tabs

One channel may have at most one active channel lease.

When the same conversation is open in two tabs:

- if the existing owner still proves it displays the channel, the second tab is passive/non-owner;
- the second tab must not show executable Ozon UI or run duplicate watchers;
- if the old owner tab is gone or no longer displays the channel, a new exact-channel tab may take a new lease epoch;
- operation ID, run ID, binding snapshot and delivery phase remain durable;
- heartbeat timeout alone is insufficient to steal ownership from an otherwise verifiable owner.

### 6.10 SPA navigation

Every provider adapter must detect route/conversation changes without relying only on full-page reload.

Before any irreversible action, content and worker must revalidate:

- provider grant;
- route epoch;
- page-instance/runtime identity;
- conversation identity;
- channel key;
- lease ID/epoch;
- operation/run/delivery identity.

Old composer or message nodes remaining connected/hidden after SPA navigation must not be treated as current.

## 7. Provider adapter contract

Each production adapter must expose equivalent capabilities, whether implemented in one registry-driven module or split provider modules:

### 7.1 Location and page probe

- trusted origin/surface match;
- new/established route candidate classification;
- stable positive chat-app DOM signature;
- page readiness classification;
- top-frame enforcement.

### 7.2 Identity

- conversation ID resolver;
- identity source/evidence;
- normalizer and case policy;
- conflict detection;
- route-change observation;
- active-conversation corroboration where required.

### 7.3 Ordered turns

- `orderedTurns()` in document/semantic order;
- role classification;
- stable message ID;
- exact text extraction;
- connected/visible/current-channel checks;
- assistant generation/completion state.

Do not rebuild chronology by concatenating all assistant messages and all user messages.

### 7.4 Code extraction

- locate code blocks belonging to one completed assistant turn;
- identify `OZON_API_V1` candidates;
- extract exact raw code without UI labels or markdown fence corruption;
- identify the precise DOM anchor for Manual Ozon controls;
- exclude hidden/stale/other-conversation blocks.

### 7.5 Composer lifecycle

- find one current composer context;
- read its canonical text;
- write text using the provider-compatible event/model strategy;
- classify active/disabled Send;
- classify Stop/generating state;
- classify post-send ready state;
- detect composer replacement/detachment;
- confirm exactly one user turn where available.

### 7.6 Delivery confirmation

Each provider must define a provider-specific confirmation policy. It may use a verified combination of:

- composer cleared after committed click;
- one new user turn with exact outgoing hash/text;
- Send-to-Stop transition;
- Stop-to-ready transition;
- provider-specific ready control;
- generation started/finished evidence.

No provider may inherit ChatGPT microphone assumptions or Alice-ready assumptions by default.

## 8. Canonical provider registry

Create one shared source of provider metadata. Worker, content, popup and build checks must not maintain separate hand-written provider lists.

Recommended modules:

- `shared/ai_provider_registry.js`;
- `shared/ai_channel_identity.js`;
- `shared/ai_adapters.js` plus optional provider modules;
- a manifest registry parity generator/check.

Registry metadata must include at least:

```text
provider_id
label
registry_version
trusted origins/host patterns
surface resolver
manifest match patterns
new/established route candidates
identity policy identifier
adapter module/capability flags
bootstrap policy
supported execution modes
```

Static MV3 manifest permissions are still required. A regression must prove exact parity between registry-declared hosts and `manifest.json` host permissions/content-script matches.

## 9. Storage and migration requirements

Target durable maps must be keyed by v2 channel key where applicable:

- conversation bindings;
- work sessions;
- Manual modes and operations;
- Autoruns;
- start prompts;
- report prefixes;
- work/delivery recoveries.

Ephemeral state belongs in `chrome.storage.session` where possible:

- provider grants;
- channel leases;
- ambiguity overrides;
- tab/page bootstrap ownership;
- runtime/page-instance state.

Migration must:

- recognize existing accepted ChatGPT/Alice keys and bindings;
- produce deterministic v2 keys;
- preserve active durable operation/run state only when identity and binding snapshot can be proven;
- fail closed on ambiguous legacy state;
- be idempotent and regression-tested;
- never migrate one conversation into another provider/surface.

## 10. Diagnostics and privacy

Add structured diagnostics for:

- provider candidates and confirmation state;
- worker/content evidence mismatch;
- grant issue/revoke/stale rejection;
- identity observed/stabilized/conflict;
- bootstrap state transitions;
- channel lease acquire/deny/rebind/release;
- SPA route epoch changes;
- non-owner action rejection;
- delivery confirmation basis;
- unsupported capability verdict.

Do not log:

- credentials or authorization headers;
- complete prompts or assistant/user messages;
- personal data;
- raw full HTML;
- cookies, localStorage/sessionStorage values or network tokens.

Use hashes, bounded structural summaries, selector/evidence descriptions and sanitized snippets only where required.

## 11. Discovery deliverables

The discovery phase must produce for each in-scope provider:

```text
research/multi-ai/<provider_id>/
  PROGRESS.md
  URL_AND_SURFACE.md
  PROVIDER_DETECTION.md
  CONVERSATION_IDENTITY.md
  DOM_CONTRACT.md
  START_SEND_LIFECYCLE.md
  TURN_AND_CODE_EXTRACTION.md
  DELIVERY_CONFIRMATION.md
  MULTICHANNEL_AND_SPA.md
  SUPPORT_RECOMMENDATION.md
  evidence/
    sanitized-*.json
    sanitized-*.md
```

A top-level matrix must summarize all 18 in-scope providers and give one of these verdicts:

- `SUPPORTED_NOW`;
- `SUPPORTED_AFTER_ADAPTER_SPECIAL_CASE`;
- `MANUAL_ONLY`;
- `AUTORUN_ONLY`;
- `UNSAFE/UNSUPPORTED`;
- `AUTH_REQUIRED / NOT TESTED`;
- `CLOSED / NOT TARGETED` only when applicable to an in-scope surface.

Selectors alone are never sufficient for a supported verdict.

## 12. Required discovery questions per provider

At minimum determine:

1. What exact origins and redirects are used?
2. Does hostname/path uniquely identify the provider surface?
3. What positive stable DOM signature proves the chat app is ready?
4. What new-chat and established-chat routes exist?
5. Where and when does conversation ID appear?
6. Is the ID case-sensitive?
7. Which independent signals confirm the active conversation?
8. Can hidden/previous conversations remain mounted?
9. What stable message IDs exist?
10. How are user/assistant roles identified?
11. How is generation completion proven?
12. How is exact raw code extracted?
13. How is the current composer found and written safely?
14. How is one unique active Send identified?
15. What exactly-once post-click evidence exists?
16. Can result delivery be confirmed without duplicate-click risk?
17. What happens on A → B → A SPA navigation?
18. What happens with the same conversation in two tabs?
19. What happens with two different conversations of the same provider?
20. Can direct new-chat Autorun bind early enough not to miss the first assistant response?

## 13. Discovery safety constraints

During browser discovery:

- do not modify production extension files;
- do not add manifest permissions;
- do not implement adapters;
- do not rebuild or publish an extension candidate;
- do not execute Ozon business API commands;
- do not expose secrets or personal data;
- do not submit harmful or irreversible provider actions;
- use harmless probe prompts only;
- commit sanitized evidence and progress after every 1–3 providers;
- stop on authentication, paywall, unavailable account state or ambiguous unsafe behavior and record the exact limitation.

## 14. Implementation acceptance gates

A provider may enter production only after all claimed capabilities pass:

### 14.1 Static/unit gates

- provider registry validation;
- manifest parity;
- identity normalization and collision tests;
- ambiguity fallback expiry tests;
- bootstrap transition tests;
- lease ownership/rebinding tests;
- ordered turn/code extraction fixtures;
- exactly-once Send/recovery tests;
- legacy migration tests;
- existing ChatGPT/Alice regression suite.

### 14.2 Browser gates

- new chat Start;
- established chat Start;
- Manual command discovery and result delivery;
- Autorun command discovery and result delivery where supported;
- A → B → A SPA switch;
- two different conversations in parallel;
- same conversation in two tabs;
- owner tab close/rebind;
- extension reload/recovery;
- stale route/grant/lease rejection;
- no duplicate Send and no cross-channel delivery.

### 14.3 Live acceptance

Use harmless Ozon READ commands only after the adapter candidate passes local/browser gates. A provider cannot be accepted solely because prompt insertion or one selector worked once.

## 15. Implementation roadmap

1. Complete baseline + Tier A browser discovery.
2. Review and freeze per-provider support verdicts.
3. Implement canonical provider registry and manifest parity.
4. Implement v2 identity/channel keys and legacy migration.
5. Implement provider detection handshake and provider grants.
6. Implement channel leases and route epochs.
7. Implement generic bootstrap shared by Work and Autorun.
8. Move ChatGPT/Alice to the generic contracts without regression.
9. Add approved Tier A adapters in small reviewable batches.
10. Run static/unit/browser regression after each batch.
11. Build a candidate only after all included adapters pass their declared gates.
12. Run final live acceptance and publish the accepted build record.

## 16. Completion definition

The discovery phase is complete when:

- all baseline and Tier A providers have a package or an explicit auth/unavailable verdict;
- the top-level support matrix is complete;
- autodetection, identity, start lifecycle, delivery and multichannel evidence are recorded;
- unsupported or limited providers are honestly classified;
- no Tier B/C work remains in the active roadmap;
- production files remain unchanged.

The large implementation patch is complete only after the approved provider set works without manual provider selection on the normal path, maintains exact conversation isolation across parallel channels, and preserves the accepted Ozon Bridge safety invariants.