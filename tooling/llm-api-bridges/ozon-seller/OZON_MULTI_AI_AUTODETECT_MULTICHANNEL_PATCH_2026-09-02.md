# Ozon Bridge — Multi-AI autodetect, binding and multichannel patch

Date: 2026-09-02
Status: DESIGN_COMPLETE_PENDING_TIER_A_DOM_EVIDENCE
Design branch: `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

This document is the durable authority for the large Multi-AI autodetection/multichannel patch. Every material finding, decision, roadmap change and implementation result must be written here before or together with chat reporting.

## 0. Accepted baseline

- Existing production adapters: ChatGPT and Yandex Alice.
- Accepted production source commit: `516ecf140538ad2838d39dcd01c7428efc1880d3`.
- Accepted release-record commit: `5fc002962f86368bcd0f64cd01bfa7d4e06558a1`.
- Existing expansion design: `OZON_MULTI_AI_EXPANSION_TZ_2026-09-02.md`.
- Existing DOM-discovery prompt: `CODEX_MULTI_AI_DOM_DISCOVERY_PROMPT_2026-09-02.md`.

No production code is authorized by this design document alone. Tier A live DOM evidence must be reviewed before implementation.

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
3. Bridge automatically identifies the AI web provider from trusted page evidence.
4. Bridge sends the start prompt through that provider's composer.
5. If the new chat had no stable conversation identity before first send, Bridge maintains a tab-scoped pending bootstrap transaction.
6. As soon as the provider exposes a deterministic conversation identity, Bridge atomically binds that exact provider/surface/conversation to the work session.
7. Manual Ozon buttons and/or Ozon Autorun operate only inside that channel.
8. Many independent channels may run in parallel in the same browser: multiple chats of one AI, chats of different AIs, multiple tabs/windows, separate Manual/Autorun states, and separate delivery/recovery ownership.
9. Only when automatic provider detection cannot be resolved must Bridge ask the operator to choose explicitly from a constrained compatible candidate list.
10. Explicit selection is a fallback for the current tab/page instance only. It is not global and cannot bypass origin, DOM or conversation-identity verification.

Two different meanings of “auto” remain distinct:

- **AI provider autodetection** — automatically select the web-page adapter. This is the default for every tab and normally requires no operator action.
- **Ozon Autorun** — automatically continue the Ozon command/result loop in one bound AI conversation. This remains a separate per-channel execution mode.

Both Manual/Work and Ozon Autorun reuse the same provider detection, conversation identity, binding and channel ownership layer.

The registry identifies the **web application whose DOM is being controlled**, not necessarily the underlying model. Examples:

- direct `claude.ai` page → provider adapter `claude`;
- Claude model selected inside Poe → provider adapter `poe`;
- Claude/GPT/Gemini selected inside OpenRouter or T3 Chat → adapter remains `openrouter` or `t3_chat`.

An optional visible model label may be displayed for diagnostics, but underlying model identity is not a security boundary and is not part of the channel key unless live evidence proves the platform requires it to distinguish threads.

## 3. Core isolation invariant

A channel is not identified merely by `tab_id` and not merely by provider name.

Current durable key:

`<raw origin>|<lowercased conversation_id>`

Target durable key:

`aich:v2:<provider_id>:<surface_id>:<base64url(provider-normalized conversation_id)>`

Where:

- `provider_id` identifies the controlled web application;
- `surface_id` is a registry-defined canonical web surface/realm, allowing safe origin aliases while separating materially different personal/work products;
- conversation ID normalization is provider-specific and preserves case unless that provider's documented/live ID format is proven case-insensitive;
- base64url encoding prevents separator/path collisions without losing debuggability.

The binding record stores the full unencoded normalized conversation ID, observed origin, canonical surface, provider ID and identity evidence. The key alone is never treated as sufficient evidence.

A browser tab is only the current DOM owner of a durable channel. It may disappear or be replaced. A channel must never inherit another channel's Manual operation, Autorun, work session, prompt baseline, delivery, recovery or UI state.

## 4. Non-negotiable safety invariants

- Provider autodetection is fail-closed.
- Provider selection never relies on assistant output text, page title or localized button text alone.
- Host/origin is a primary provider signal, but a user-selected fallback never fabricates page compatibility or conversation identity.
- Worker URL evidence and content DOM evidence must agree before an adapter becomes active.
- One exact pending bootstrap belongs to one tab + page instance + provider grant + start intent/revision.
- One durable work session belongs to one confirmed channel key.
- One channel has at most one active DOM-owner lease at a time.
- No API result may be inserted into a different provider/chat than its owner.
- SPA navigation invalidates stale channel ownership before any click/insertion.
- Unknown Send outcome never causes a duplicate Send.
- Unknown Ozon request outcome never causes automatic replay.
- Existing Ozon credential, allowlist, privacy, entitlement, one-request, no-hidden-pagination and recovery invariants remain unchanged.
- Parallel channels may share account-level Ozon rate-limit/token state, but never logical run/manual/delivery state.
- A provider that lacks deterministic conversation identity, exact code extraction or safe one-shot delivery may be Manual-only or unsupported; selectors alone are insufficient.

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

Current `AI_MODES` is hardcoded to `auto`, `chatgpt`, `alice`.

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

Current durable key is `origin + "|" + conversation_id`.

### 5.3 Current binding

Bindings are stored in `CONVERSATION_BINDINGS`, keyed by conversation key.

`bindConversation()`:

1. Requires a confirmed conversation ID.
2. Re-reads live identity from the exact tab.
3. Rejects stale popup context.
4. Creates or revises an `ozbind-*` binding record.
5. Stores origin, derived AI ID, conversation ID and key.
6. Optionally atomically creates a work session in `binding` state.
7. Snapshots the binding into active Manual/Autorun durable state.

`strictBindingForIdentity()` and `assertRunBinding()` fail closed if current identity, binding or binding snapshot diverge.

Strength: binding is already conversation-scoped rather than globally AI-scoped.

### 5.4 Current new-chat pending start

`Начать работу` already supports a chat that has no conversation ID yet:

1. Worker identifies provider/origin.
2. Creates `PENDING_WORK_STARTS[tab_id]`.
3. Content inserts and sends the start prompt.
4. Content records assistant-turn baseline before Send.
5. Content polls identity every 500 ms for up to 120 seconds.
6. When a conversation ID appears, it watches only assistant turns absent from baseline.
7. After the first new assistant turn is complete, worker verifies tab/provider/origin/ID, binds the channel, activates work-session and enables Ozon UI.

Strength: this prevents binding a different chat merely because it shares a provider.

Weaknesses to fix:

- specialized for ChatGPT/Alice route rules;
- fixed timeout/polling behavior;
- supplied operator `start_intent_id` is not preserved in the unconfirmed branch;
- Work start lacks the durable commit-before-click protocol used by Autorun;
- binding occurs only after first response completion, which is safe for Manual but insufficient for direct new-chat Autorun if the first response already contains an Ozon command.

### 5.5 Current work-session state

`OzonWorkSessionModel` is revisioned:

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

Different conversations of the same AI and conversations of different AIs therefore already have separate durable logical state as long as identity is correct.

Per-tab content runtimes also keep independent DOM observers, Ozon buttons, delivery watchers and adapter selection.

### 5.7 Current owner-tab/rebinding behavior

Manual operation and Autorun each store owner `tab_id`.

When another tab displaying the same conversation syncs:

- if original owner still displays that conversation, new tab is `duplicate_non_owner`;
- if old owner is gone or no longer displays the channel, new tab may atomically take ownership after exact conversation verification;
- operation/run IDs and durable delivery phases remain unchanged.

Current weakness: Work-session/UI ownership, Manual-operation ownership and Autorun ownership are separate concepts. Before an operation exists, duplicate tabs can both observe an `active_visible` work session. Admission locks prevent two accepted API operations, but UI ownership is not represented by one canonical channel lease.

### 5.8 Current delivery ownership and confirmation

Every Manual/Autorun operation carries conversation key, origin, conversation ID, binding snapshot, owner tab, delivery ID and phase.

Before insertion/click/confirmation, worker verifies exact tab ownership and exact current conversation.

Delivery confirmation is hardcoded by origin:

- ChatGPT: `microphone`, with Work-specific `work_submit_disabled_after_click` compatibility;
- Alice: `alice_ready`.

This must become provider-adapter policy for Tier A.

### 5.9 Current parallelism semantics

Independent channels can execute concurrently at the state-machine level. Shared Ozon credentials, Performance token and account/provider quota coordination are intentionally global. A quota wait may delay physical dispatch, but must not merge, overwrite or rebind another channel's logical operation.

### 5.10 Additional interaction issue to correct

Current generic `turnSections()` concatenates all assistant messages followed by all user messages. A provider-generic implementation must expose `orderedTurns()` or an equivalent document-order API; chronological logic must never be reconstructed by concatenating role-specific arrays.

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
11. Work/manual and Autorun do not share one provider-generic bootstrap state machine.
12. There is no canonical channel lease covering idle Work UI, Manual operation and Autorun ownership.
13. Adapter override is a mode switch, not a constrained proof-based ambiguity resolver.
14. Static manifest permissions can drift from runtime registry unless generation/parity checks are added.
15. No explicit tab-close cleanup was found for per-tab adapter overrides/pending starts; stale data expires or becomes unusable, but the new architecture must clean it deterministically.

## 7. Canonical AI provider registry

Create one pure provider metadata registry available to worker, content and popup.

Recommended source modules:

- `shared/ai_provider_registry.js` — pure IDs, labels, trusted origins, surfaces, identity policies, capabilities and manifest metadata;
- `shared/ai_channel_identity.js` — generic identity/channel-key model and migrations;
- `shared/ai_adapters.js` or provider modules — content-only live DOM functions;
- build/check script generating/verifying manifest host coverage from registry metadata.

A provider descriptor contains at minimum:

```text
id
label
registry_version
trusted_origins / host patterns
surface resolver
URL/path candidate resolver
page DOM probe
conversation identity resolver
conversation ID normalizer
new-chat policy
ordered turn resolver
assistant/user/message ID/text functions
code-block/raw-code/geometry functions
generation/completion functions
composer context/read/write functions
send/disabled/stop/ready classifier
delivery confirmation policy
bootstrap timeout/capabilities
```

No worker, popup or generic content code may maintain a separate hand-written provider list.

Static `manifest.json` remains generated/static as required by MV3, but a regression must prove exact parity between registry-declared hosts and manifest `host_permissions`/`content_scripts.matches`.

## 8. Automatic provider detection design

### 8.1 Detection is a two-sided handshake

The worker and content script independently produce evidence and then compare it.

Worker evidence:

- active top-level tab ID;
- actual `chrome.tabs.get(tab_id).url`;
- exact origin/path candidate set from provider registry;
- expected canonical surface(s).

Content evidence:

- top-frame check;
- actual `location.origin`, pathname and href;
- provider adapter location match;
- provider-specific stable app/composer/message-root DOM signature;
- content runtime/page-instance ID;
- adapter/registry version.

The page becomes executable only when both sides agree on exactly one compatible provider/surface.

### 8.2 Detection result states

```text
CONFIRMED
PENDING_PAGE_READY
AMBIGUOUS
CONFLICT
UNSUPPORTED
CONTENT_UNAVAILABLE
```

- `CONFIRMED`: one registry URL candidate and matching positive DOM probe, or multiple URL candidates reduced to one positive DOM probe.
- `PENDING_PAGE_READY`: URL strongly identifies a supported provider but app DOM has not rendered yet; retry/wait without asking operator immediately.
- `AMBIGUOUS`: more than one compatible candidate remains after DOM probing.
- `CONFLICT`: worker URL, content origin, adapter ID or surface evidence disagree.
- `UNSUPPORTED`: no trusted registry candidate for the top-level URL.
- `CONTENT_UNAVAILABLE`: supported URL but no usable content runtime; do not pretend provider selection can fix missing permissions/injection.

Numeric confidence may be logged for diagnostics, but execution is authorized by deterministic evidence gates, not a fuzzy threshold.

### 8.3 Provider grant

After `CONFIRMED`, worker issues a tab/page-scoped provider grant:

```text
provider_grant_id
provider_id
surface_id
canonical_origin
observed_origin
tab_id
content_runtime_id
page_instance_id
route_epoch
registry_version
issued_at
```

All identity, Work start, Autorun start, binding and delivery messages include the current grant ID/route epoch. A stale grant is rejected after provider/origin/surface/page-instance change.

### 8.4 When detection runs

- content startup;
- popup open/refresh;
- `Начать работу`;
- Ozon Autorun start/resume;
- top-level URL change;
- detected conversation change;
- content runtime reload;
- before command admission;
- before report insertion, Send and confirmation.

### 8.5 Operator fallback

The normal popup does not expose a permanent adapter selector.

Only `AMBIGUOUS` or an explicitly recoverable incomplete probe shows `Выберите AI для этой вкладки`.

The list contains only candidates already compatible with worker-verified trusted URL/origin. Selecting a provider:

1. stores an ephemeral `chrome.storage.session` override for this tab/page instance;
2. asks that exact adapter to probe the live DOM;
3. succeeds only if origin/surface and DOM probe match;
4. issues a normal provider grant;
5. is cleared on origin/surface/page-instance change, tab close, registry version change or explicit reset.

The operator can never choose Claude while the tab is on DeepSeek, nor select from the whole Tier A list on an unsupported site.

### 8.6 Optional underlying-model display

Poe/OpenRouter/T3/Duck.ai may expose the selected model. This is optional informational metadata only:

```text
platform_provider_id
optional_model_label
optional_model_id
```

Changing model within the same platform/thread does not change the DOM adapter or channel key unless provider evidence proves that thread ownership changes.

## 9. Provider-generic conversation identity

Each adapter returns structured identity evidence:

```text
provider_id
surface_id
observed_origin
conversation_id or null
status: NEW_CHAT | PENDING_STABILITY | CONFIRMED | CONFLICT | UNSUPPORTED_ROUTE
evidence[]
identity_source
identity_version
route_epoch
```

Possible evidence sources include route ID, canonical URL, stable DOM thread ID and active-history item. The provider registry defines which evidence combinations are sufficient.

Rules:

- path-only identity is accepted only for providers whose Tier A evidence proves it deterministic;
- providers may require corroboration, as Alice already does;
- conflicting strong sources produce `CONFLICT` and no binding;
- IDs are normalized per provider, not globally lowercased;
- a newly observed ID must remain stable for provider-defined samples/events before freezing;
- once a pending bootstrap freezes an ID, any different ID cancels/blocks that bootstrap rather than following navigation;
- hidden duplicate conversations/messages must not contribute identity.

## 10. Binding v2

Proposed binding record:

```text
version: 2
binding_id
revision
channel_key
provider_id
surface_id
canonical_origin
observed_origin
conversation_id
conversation_id_hash
identity_source
identity_evidence_digest
identity_version
adapter_version
bound_at
updated_at
```

Validation requires:

- registry confirms provider/origin/surface relation;
- live content grant matches provider/surface;
- live conversation identity reconstructs the same channel key;
- binding snapshot in operation/run matches binding ID, provider, channel and revision policy.

Existing binding ID may be retained when migrating the same ChatGPT/Alice channel; revision increments.

## 11. Unified channel bootstrap for Work and Autorun

Replace Work-only pending start with a generic durable bootstrap transaction.

Proposed record:

```text
version: 2
bootstrap_id
start_intent_id
requested_mode: WORK_MANUAL | AUTORUN
state
revision
tab_id
content_runtime_id
page_instance_id
provider_grant_id
provider_id
surface_id
observed_origin
initial_url / initial_route_epoch
start_prompt_hash
user_baseline_ids
assistant_baseline_ids
send_commit_actor_id
send_click_observed
observed_conversation_id
observed_channel_key
created_at
expires_at
last_error
```

One active bootstrap is allowed per tab. The popup-supplied `start_intent_id` is preserved as the idempotency identity.

### 11.1 Bootstrap states

```text
CREATED
PROMPT_STAGED
PROMPT_COMMITTED
PROMPT_SENT_OR_OUTCOME_UNKNOWN
IDENTITY_OBSERVED
CHANNEL_BOUND
WAITING_FIRST_ASSISTANT
ACTIVATING
ACTIVE
ERROR
CANCELLED
```

The exact implementation may collapse internal states, but irreversible Send commit and frozen identity must remain explicit.

### 11.2 Commit-before-click start protocol

Work start and Autorun start share the same irreversible boundary:

1. Content resolves composer and a stable unique Send target.
2. Content captures ordered user/assistant baselines.
3. Content requests bootstrap Send commit with provider grant/runtime/page identity.
4. Worker atomically changes `PROMPT_STAGED → PROMPT_COMMITTED` and grants exactly one click.
5. Content performs one synchronous click and records whether a click event was observed.
6. After an observed click or uncertain committed outcome, no second click is ever granted.
7. Recovery uses composer/user-turn/route evidence only; it never resends the start prompt automatically.

### 11.3 Existing confirmed conversation — Work

- detect provider;
- confirm conversation identity;
- acquire channel lease;
- bind/revise channel;
- commit/send start prompt exactly once;
- activate `active_visible` Work UI after safe start boundary;
- completed assistant code blocks are decorated provider-generically.

### 11.4 New conversation — Work

- provider is confirmed while identity is `NEW_CHAT`;
- create bootstrap before Send;
- commit/send start prompt once;
- monitor route and DOM for stable conversation ID;
- freeze identity and bind channel;
- keep command acceptance closed until the first new assistant turn is sufficiently complete for that provider;
- acquire/confirm channel lease and activate Work UI;
- if operator changes provider/chat before identity freeze, cancel; after freeze, mismatch is an error and does not rebind to the new page.

### 11.5 Existing confirmed conversation — Autorun

Refactor current Autorun start through the same detection/binding/lease/bootstrap layer while preserving current commit-before-click and recovery semantics.

### 11.6 New conversation — Autorun

Direct Autorun from a new empty Tier A chat is feasible and should be supported when provider evidence permits:

- create bootstrap with `requested_mode=AUTORUN`;
- capture baselines and send start prompt once;
- as soon as stable conversation identity appears, bind channel and construct the run using the already-sent bootstrap rather than sending another start prompt;
- create/confirm run start state and start assistant watch using pre-Send assistant baseline;
- if the first assistant answer is already generating or complete when identity is established, watcher still sees it because it is absent from baseline;
- if identity appears only after completion, the complete first turn is processed after binding;
- providers that cannot expose stable identity early enough may remain unsupported for direct new-chat Autorun while still supporting Work after identity confirmation.

`Начать работу` does not silently enable Ozon Autorun. The execution modes remain separate; only provider/channel bootstrap is shared.

## 12. Canonical channel lease and multichannel ownership

Create `CHANNEL_LEASES_V1` in `chrome.storage.session`, keyed by v2 channel key.

Lease record:

```text
lease_id
lease_epoch
channel_key
provider_id
surface_id
owner_tab_id
owner_content_runtime_id
owner_page_instance_id
acquired_at
renewed_at
purpose
```

### 12.1 Lease acquisition

1. Verify candidate tab's current provider grant and exact conversation identity.
2. If no lease exists, atomically acquire it.
3. Same tab/runtime renews it.
4. Same tab with a replaced content runtime may replace it only after worker verifies the old runtime is gone/reloaded and the tab still displays the exact channel.
5. Different tab probes old owner:
   - if old tab is responsive and still displays exact channel, deny as `DUPLICATE_CHANNEL_NON_OWNER`;
   - if old tab is gone/unresponsive or no longer displays channel, atomically rebind lease after exact candidate verification.
6. Every irreversible DOM operation carries `lease_id + lease_epoch`; stale owners are rejected.

Do not steal a lease solely because a heartbeat timeout elapsed while the old tab is still verifiably on the channel.

### 12.2 Parallel-channel behavior

| Browser situation | Required behavior |
|---|---|
| Same AI, two different conversations | Two independent channel keys, leases, Work sessions and runs |
| Different AIs, different conversations | Fully independent channel state and adapters |
| Same conversation opened in two tabs | One active owner; second tab passive/non-owner |
| Manual in channel A, Autorun in channel B | Allowed concurrently |
| Autorun in channels A and B | Allowed concurrently, subject only to shared Ozon quotas |
| Same tab navigates A → B | Old lease/UI/watch torn down; durable A state preserved; B treated independently |
| Owner tab closes | Ephemeral lease/override cleaned; durable operation/run preserved for safe rebind/recovery |
| Extension/content reload | Reacquire lease only after exact provider/channel handshake |

### 12.3 Tab lifecycle cleanup

Add deterministic `chrome.tabs.onRemoved` and URL-change handling:

- clear tab provider override/grant;
- cancel pre-click bootstrap or preserve committed bootstrap as outcome-unknown/recoverable;
- release ephemeral lease owned by the tab;
- do not delete durable operation/run/result;
- notify/reconcile channel state on next exact-tab sync.

On top-level URL/provider/surface/conversation change, content immediately removes Ozon buttons, stops watchers locally and requests resync. It never reports delivery success/failure merely because navigation occurred; worker durable state decides recovery.

## 13. Generic provider interaction contract

Provider adapters must supply the DOM facts; generic code owns safety/state.

### 13.1 Ordered turns

Adapter exposes document-ordered turns:

```text
orderedTurns()
assistantMessages()
userMessages()
messageRole(node)
messageId(node)
messageText(node)
messageComplete(node)
```

Stable native message IDs are strongly preferred. If only node-local IDs are possible, provider may be Manual-only because reload-safe Autorun recovery cannot be proven.

### 13.2 Code blocks

Adapter exposes:

```text
findCodeBlocks(assistantMessage)
readCodeText(block)
geometryAnchor(block)
codeBlockComplete(block/message)
```

Manual Ozon button is extension-owned. Native Copy remains evidence/anchor only and is not an execution control.

### 13.3 Composer

Adapter exposes:

```text
composerContext()
readComposerText()
writeComposerText()
resolveSendControl()
classifyComposerLifecycle()
```

Generic `composer_send.js` continues to validate scope, connection, visibility, uniqueness, enabled state, exact staged text, stable samples and click trace.

### 13.4 Lifecycle classification

Canonical lifecycle states:

```text
COMPOSER_EMPTY_READY
COMPOSER_TEXT_SEND_ACTIVE
COMPOSER_TEXT_SEND_DISABLED
GENERATING_STOP_VISIBLE
POST_CLICK_ACCEPTED
POST_GENERATION_READY
UNKNOWN
```

Provider maps live DOM into these states. Generic delivery code never treats every non-Alice provider as ChatGPT.

### 13.5 Delivery confirmation

Worker validates confirmation against `provider_id + adapter_version + policy_id`, not raw origin.

Preferred strong evidence after the one committed Send click:

- exactly one new matching user turn/message;
- composer cleared or provider-specific accepted state;
- generation/ready transition where required.

Tier A evidence determines each provider's accepted basis sequence. A weak control-label-only signal is insufficient.

## 14. Popup UX

Normal state:

```text
AI: Определено автоматически — <provider label>
Диалог: новый / подтверждён <short identity>
Канал: owner / passive duplicate
```

The existing always-visible ChatGPT/Alice adapter selector is removed from the primary path.

Fallback state only:

```text
Не удалось однозначно определить AI этой вкладки.
Совместимые варианты: <constrained candidate list>
[Подтвердить] [Повторить автоопределение]
```

Other popup behavior:

- `Начать работу` may operate on confirmed or new-chat identity if provider detection is confirmed;
- Ozon Autorun start uses the same detection/bootstrap path and can support new chat where adapter capability allows;
- duplicate same-channel tab displays passive ownership and does not render active execution controls;
- popup labels/provider options are generated from registry;
- provider/model platform distinction is shown clearly when optional model metadata exists.

## 15. Storage and migration plan

New/changed state:

- `AI_PROVIDER_OVERRIDES_V2` — session, tab/page-scoped fallback selection;
- `AI_PROVIDER_GRANTS_V1` — session, verified provider handshakes;
- `CHANNEL_LEASES_V1` — session, one DOM owner per channel;
- `CHANNEL_BOOTSTRAPS_V2` — local durable pending/committed start transactions;
- `CONVERSATION_BINDINGS` records upgraded to v2 channel identity;
- Work/Manual/Autorun records upgraded with provider/surface/channel/binding metadata;
- old `AI_TAB_MODES` migrated/removed after compatibility period.

ChatGPT/Alice v1 migration:

1. Resolve live v2 identity.
2. Locate old `origin|lowercase-id` binding/state.
3. Under migration lock atomically move bindings, work sessions, Manual state/operations, Autoruns, prefixes, prompts and recoveries to v2 key.
4. Rewrite embedded conversation keys and binding snapshots without changing operation/run/delivery IDs or irreversible phases.
5. Preserve binding ID; increment revision.
6. Maintain temporary old→new key alias only for recovery compatibility.
7. Never replay provider request or Send during migration.

Conversation IDs with case or separators receive dedicated regression fixtures.

## 16. Diagnostics and privacy

New diagnostics include only safe structural metadata:

- provider detection status/candidates/reasons;
- provider/surface IDs;
- registry/adapter versions;
- tab/page/runtime IDs;
- route epoch;
- identity source and hashed ID/evidence digest;
- channel/lease/bootstrap IDs;
- ownership/rebind decisions;
- confirmation policy/basis.

Do not log full chat content, account names, emails, cookies, tokens, authorization data, full private URLs with query secrets or raw personal conversation IDs unless already approved safe; prefer hashes/shape metadata.

## 17. Acceptance and regression matrix

### 17.1 Pure/unit tests

- registry uniqueness and provider/surface validation;
- manifest/registry/popup parity;
- exact-origin and alias-origin detection;
- worker/content provider conflict;
- constrained fallback selection;
- incompatible fallback rejection;
- provider-specific ID case normalization;
- v2 channel key encoding/decoding/collision checks;
- identity evidence conflict and stability freeze;
- bootstrap idempotency and one-click grant;
- response loss after committed start produces no resend;
- channel lease acquire/renew/deny/rebind races;
- v1→v2 migration preserving active delivery phases;
- provider-policy delivery confirmation;
- ordered-turn chronology.

### 17.2 Browser fixture tests

For every supported Tier A provider:

- new chat before ID;
- existing chat;
- provider autodetection;
- operator fallback path where synthetically forced;
- start prompt insertion and exactly-one Send;
- identity appearance before/during/after first response;
- completed assistant and code-block extraction;
- Manual Ozon button;
- Autorun first-response capture;
- result insertion/Send/confirmation;
- SPA switch A→B→A;
- content reload;
- hidden duplicate controls/messages.

### 17.3 Multichannel live tests

1. Two different chats in ChatGPT in parallel.
2. ChatGPT + Claude in parallel.
3. DeepSeek + Qwen + Gemini in parallel.
4. Manual in one channel while Autorun runs in another.
5. Two Autoruns on distinct channels.
6. Same conversation duplicated in two tabs; only one owner.
7. Close owner tab before API dispatch.
8. Close owner during provider request; no retry.
9. Close/navigate owner after provider result before delivery; result preserved and rebound safely.
10. Return to old conversation in a new tab and resume recovery.
11. Shared analytics quota wait in channel A while channel B state remains intact.
12. Stress matrix with multiple same-provider and cross-provider tabs/windows.

### 17.4 Baseline parity

ChatGPT and Alice must retain all accepted Manual, Work, Autorun, recovery, no-retry and Ozon regression behavior after registry refactor.

## 18. Implementation sequence after Tier A evidence review

1. Freeze accepted v0.1.19 baseline and fixtures.
2. Restrict Codex discovery output to baseline + Tier A.
3. Review provider evidence and assign capabilities/verdicts.
4. Implement pure provider registry and v2 identity/channel-key model with no DOM behavior change.
5. Migrate ChatGPT/Alice into registry while preserving behavior.
6. Add provider handshake/grants and constrained popup fallback.
7. Add unified channel bootstrap and commit-before-click Work start.
8. Add canonical channel lease and tab lifecycle cleanup.
9. Refactor generic composer/turn/delivery interfaces.
10. Re-run full ChatGPT/Alice parity.
11. Add Tier A providers in small evidence-backed batches.
12. Run per-provider and multichannel acceptance.
13. Build one candidate only after all supported providers pass.
14. Publish support matrix, artifact hash and accepted commit.

Recommended first implementation batch after the refactor is determined from Codex evidence, prioritizing providers with unique origins, stable route IDs, native message IDs, ordinary textarea/contenteditable composers and deterministic Send/Stop/ready lifecycle.

## 19. Roadmap

- [x] Step 0 — create durable patch document and restrict scope to Tier A.
- [x] Step 1 — fully map current provider detection, identity, binding, pending start, work-session and per-tab AI mode.
- [x] Step 2 — identify hardcodes/state blockers.
- [x] Step 3 — design automatic provider detection and constrained operator fallback.
- [x] Step 4 — design provider-generic conversation identity and unified new-chat bootstrap.
- [x] Step 5 — design channel lease/rebinding and same/different-provider multichannel behavior.
- [x] Step 6 — design generic start, turns, code blocks, composer, Autorun and delivery lifecycle.
- [x] Step 7 — define storage migration, popup and diagnostics requirements.
- [x] Step 8 — define regression/browser/live multichannel acceptance matrix.
- [ ] Step 9 — incorporate Tier A Codex DOM evidence provider by provider and freeze support verdicts.
- [ ] Step 10 — implement large patch, build candidate, run regressions/live acceptance and accept only on full PASS.

## 20. Progress log

### 2026-09-02 — Step 0 completed

- Created dedicated design branch and durable authority document.
- Restricted new-provider scope to Tier A.
- Recorded zero-selection normal path, explicit fallback and parallel-channel objective.

### 2026-09-02 — Steps 1–2 completed

- Reviewed accepted production identity, binding, Work, Manual, Autorun, owner-tab and delivery code.
- Confirmed per-conversation durable state is a strong multichannel foundation.
- Confirmed owner-tab rebind is already fail-closed for Manual operations and Autorun.
- Identified two-provider hardcodes and bootstrap gaps.

### 2026-09-02 — Steps 3–8 completed at design level

- Defined two-sided worker/content provider detection handshake and provider grants.
- Replaced permanent adapter mode selection concept with automatic default plus constrained ambiguity fallback.
- Defined provider-aware case-safe v2 channel identity.
- Defined unified Work/Autorun new-chat bootstrap with commit-before-click.
- Defined direct new-chat Autorun capture without missing the first assistant response.
- Defined one-owner channel lease while retaining parallel independent channels.
- Defined provider-generic turns/code/composer/lifecycle/delivery contract.
- Defined storage migration, popup, diagnostics and complete acceptance matrix.
- Waiting for Tier A Codex live DOM evidence before freezing provider-specific implementations.
