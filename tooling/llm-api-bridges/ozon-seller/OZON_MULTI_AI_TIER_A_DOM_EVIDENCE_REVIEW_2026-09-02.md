# Ozon Bridge — Tier A DOM evidence review and implementation gate

Date: 2026-09-02
Status: STEP_9_PARTIAL_COMPLETE_CORE_REFACTOR_AUTHORIZED_PROVIDER_ONBOARDING_BLOCKED
Design branch: `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`

This document is the durable review record for the first Codex Tier A browser-discovery report (`Ozon Bridge Tier A Browser Discovery`, dated 2026-09-02). It complements `OZON_MULTI_AI_AUTODETECT_MULTICHANNEL_PATCH_2026-09-02.md` and records what the evidence is strong enough to authorize now, what remains blocked, and the revised roadmap.

## 1. Source-evidence integrity

The discovery report states that the pass was browser-discovery only, with no repository/Git changes, no production changes, no Ozon requests, and no credentials/cookies/tokens/private full-page HTML captured.

The report covers all 16 Tier A provider names, but most providers were not accessible as deterministic chat surfaces in the available browser session. Unknown behavior is explicitly not treated as support.

Therefore the evidence is useful for architecture gating but is not a complete Tier A acceptance pass.

## 2. Executive verdict

No new Tier A provider is authorized for production support yet.

The evidence does authorize a provider-generic core refactor using the already accepted ChatGPT/Alice behavior as the regression baseline, because the browser pass validates the need for the previously designed abstractions:

- canonical provider registry;
- two-sided URL + DOM autodetection;
- provider-specific conversation identity policies;
- provider-normalized v2 channel keys;
- page/runtime/route epochs;
- one active channel lease per exact conversation;
- generic ordered-turn contract;
- provider-specific composer/write/Send/Stop/ready policies;
- provider-specific delivery confirmation policies;
- unified Work/Autorun bootstrap with exactly-once Send.

However, the core refactor must not add new Tier A hosts to production manifest coverage, declare a new provider supported, or activate new provider adapters until that provider's missing live evidence is closed.

## 3. Provider evidence classification

### 3.1 Qwen — first implementation candidate, NOT production-ready

Observed evidence:

- guest chat reachable at `https://chat.qwen.ai/`;
- composer candidate: `textarea[placeholder="Ask Qwen"]`;
- local Send candidate: `button[aria-label="Send"]`;
- one plain probe had exact composer read-back, one Send click, route change to `/c/guest`, and an assistant markdown node containing the requested nonce;
- Send became disabled after the completed plain response;
- assistant candidate root `.qwen-chat-message.qwen-chat-message-assistant` and `.qwen-markdown-text` were observed.

Blocking evidence:

- `/c/guest` is not a proven durable per-conversation identity;
- user-turn root/message IDs were not independently characterized;
- code-block probe had `UNKNOWN_OUTCOME_RISK`: one click, composer retained probe text, no new user turn/code block observed, and correctly no retry was performed;
- no code extraction proof;
- no SPA A→B→A proof;
- no duplicate-tab ownership proof;
- no result-delivery confirmation proof;
- established-chat Autorun not proven;
- new-chat Autorun not proven.

Current verdict: `MANUAL_ONLY_CANDIDATE`, discovery-only. Do not add to production yet.

### 3.2 T3 Chat — second implementation candidate, NOT production-ready

Observed evidence:

- chat surface reachable at `https://t3.chat/`;
- composer root `form#chat-input-form`;
- editable `textarea#chat-input[aria-label="Message input"]`;
- local Send `button[type="submit"][aria-label="Send message"]`;
- exact probe read-back;
- exactly one Send click;
- route changed to `/chat/<uuid>`;
- user turn appeared;
- Cancel disappeared and Send returned after bounded observation.

Blocking evidence:

- assistant response/completion was not structurally proven;
- `/chat/<uuid>` is only a candidate deterministic identity until reload/second-tab/SPA behavior is checked;
- no stable assistant ID or ordered-turn proof;
- no code-block extraction proof;
- no result-delivery proof;
- no duplicate-tab proof;
- no SPA A→B→A proof;
- established/new-chat Autorun remain unverified.

Current verdict: `MANUAL_ONLY_CANDIDATE`, discovery-only. Do not add to production yet.

### 3.3 Mistral Vibe / Le Chat — provider-special-case candidate, currently blocked

Observed evidence:

- chat surface reachable at `https://chat.mistral.ai/chat`;
- `div.ProseMirror[contenteditable="true"]` composer;
- form and scoped `button[type="submit"]` observed;
- distinct voice control observed.

Blocking evidence:

- browser insertion/read-back inserted an extra blank line compared with the approved payload;
- Send was therefore correctly not clicked;
- conversation identity, turn IDs, completion, code extraction, SPA, duplicate tabs, and delivery are all unproven.

Interpretation:

This is not enough evidence to conclude that Mistral is intrinsically unsafe. It specifically proves that the generic text insertion/read-back strategy is not compatible with its ProseMirror editor. Mistral requires a provider-specific editor-write strategy and canonical text serializer before the browser-discovery Send test can continue.

Current verdict: `SUPPORTED_AFTER_ADAPTER_SPECIAL_CASE` is NOT yet earned; status remains `BLOCKED_SPECIAL_EDITOR_DISCOVERY`.

### 3.4 Perplexity — promising DOM candidate but authentication-blocked

Observed evidence:

- `https://www.perplexity.ai/` accessible;
- candidate composer `div#ask-input[contenteditable="true"][role="textbox"]`;
- distinct local Send and Dictation controls;
- exact probe read-back succeeded.

Blocker:

- login dialog appeared before Send; no authentication bypass was attempted.

Current verdict: `AUTH_REQUIRED / NOT TESTED`.

### 3.5 Remaining Tier A providers — no implementation verdict yet

Claude: login only; `AUTH_REQUIRED`.

Google Gemini: origin reachable but no deterministic chat/composer surface captured; `CONTENT_UNAVAILABLE`.

DeepSeek: origin reachable but no safe composer/Send captured; `CONTENT_UNAVAILABLE`.

Kimi: landing surface, no safe composer; `LANDING_SURFACE`.

Grok: blank/no provider DOM in current browser context; `CONTENT_UNAVAILABLE`.

Microsoft Copilot: landing/marketing surface, no safe composer; `LANDING_SURFACE`.

Meta AI: login control/disabled Send, no disposable authenticated chat; `AUTH_REQUIRED`.

GigaChat: no safe composer; `CONTENT_UNAVAILABLE`.

Duck.ai: active inspection context became `about:srcdoc`; provider DOM not captured; `CONTENT_UNAVAILABLE`.

OpenRouter Chat: playground visible but safe active composer/model context not established; `SURFACE_UNVERIFIED`.

Poe: redirected to login; `AUTH_REQUIRED`.

Proton Lumo: browser context unavailable before safe DOM capture; `CONTENT_UNAVAILABLE`.

No production adapter/manifest entry is authorized for these providers from this pass.

## 4. Architecture conclusions confirmed by live evidence

### 4.1 Origin alone cannot confirm provider readiness

Several trusted origins reached login, landing, blank or non-chat surfaces. Therefore the final detection contract must keep:

`worker trusted URL candidate + content positive chat DOM signature = CONFIRMED provider/surface`.

Origin-only state remains `PENDING_PAGE_READY` or equivalent, never executable.

### 4.2 Composer/write policy must be provider-specific

Qwen/T3 use textareas and accepted exact read-back in the observed probes. Mistral's ProseMirror surface did not preserve the generic write/read-back shape. Therefore `composerWrite` and `composerCanonicalText` belong in the adapter contract, not in one global implementation.

### 4.3 Send must always be composer-scoped and one-shot

Mistral and Perplexity both exposed distinct voice/dictation controls near Send. Qwen's second code-probe click produced an unknown outcome. Therefore:

- Send resolution must be scoped to one active composer root;
- voice/mic/dictation controls must be explicitly excluded;
- before-click state must be durable;
- one observed/attempted click with unknown outcome must prohibit an automatic second click;
- delivery confirmation cannot be inferred from button position/icon alone.

### 4.4 Conversation identity is the main release gate

Qwen's `/c/guest` is too weak to key a durable channel. T3's `/chat/<uuid>` is promising but not yet proven stable across reload, SPA transitions or duplicate tabs. No new provider can enter Autorun until exact conversation identity is proven.

### 4.5 New-chat Autorun requires early identity or baseline-safe late binding

The pass did not prove direct new-chat Autorun for any new provider. The designed unified bootstrap remains correct: pre-Send turn baselines must be captured before one-shot Send, then the first stable conversation identity frozen as soon as it becomes available, so the first assistant response cannot be lost if it completes quickly.

### 4.6 Channel lease remains required

Duplicate-tab behavior was not tested for the candidates. The absence of evidence does not weaken the requirement: only one tab/page runtime may own one exact conversation channel at a time, with passive duplicates and evidence-based ownership transfer.

## 5. Implementation gate decision

### Authorized now

A core-only refactor may begin, with no new AI provider activated:

1. Introduce canonical provider registry with ChatGPT/Alice only.
2. Move current provider list out of worker/content/popup hardcodes.
3. Introduce generic provider detection result and two-sided evidence handshake.
4. Introduce v2 channel identity/key abstraction while preserving existing bindings through explicit migration logic.
5. Introduce channel lease abstraction.
6. Introduce generic ordered-turn adapter API.
7. Move composer/read/write/Send/Stop/ready/delivery confirmation behind adapter capabilities.
8. Unify Work and Autorun start/bootstrap state machinery.
9. Keep current ChatGPT/Alice behavior byte/semantics regression-protected.
10. Add fixture slots for future providers, but do not register/enable Tier A hosts yet.

### Explicitly not authorized yet

- No Qwen production adapter.
- No T3 production adapter.
- No Mistral production adapter.
- No Perplexity production adapter.
- No other Tier A production adapter.
- No production manifest host additions for Tier A.
- No support claims for any new provider.

## 6. Required second discovery pass

### 6.1 Qwen targeted closure

Need:

- determine whether an authenticated/non-guest route exposes a durable conversation ID;
- characterize user root + stable user/assistant message IDs;
- repeat fenced-code probe in a fresh disposable chat only after a safe exactly-once Send state is established;
- prove raw code extraction and owning assistant turn;
- SPA A→B→A;
- two different conversations in two tabs;
- same conversation in duplicate tabs;
- result delivery confirmation;
- established-chat Autorun;
- new-chat first-response capture.

### 6.2 T3 targeted closure

Need:

- longer/structural observation of assistant generation and completion;
- stable assistant/user message IDs;
- prove `/chat/<uuid>` survives reload and identifies the exact thread;
- fenced-code extraction;
- result delivery confirmation;
- SPA A→B→A;
- duplicate-tab ownership;
- established/new-chat Autorun.

### 6.3 Mistral targeted closure

Need first to identify a correct ProseMirror write strategy and canonical read-back strategy. Only then:

- one exact plain probe;
- route/conversation ID;
- turn IDs/completion;
- fenced-code extraction;
- SPA/duplicate tabs;
- delivery/Autorun.

### 6.4 Perplexity targeted closure

Requires an already authenticated disposable browser session. Then repeat the full lifecycle without bypassing login.

### 6.5 Remaining providers

Before another DOM pass, ensure the Codex Windows browser has the required allowed origins and usable sessions/surfaces. Authentication-required providers must be authenticated by the operator outside the research automation if support is desired. Blank/landing/content-unavailable providers must be retried only after browser/site access is corrected; do not infer unsupported from this first pass alone.

## 7. Revised roadmap

- [x] Step 0 — durable patch document and Tier A scope.
- [x] Step 1 — map current detection/identity/binding/pending-start/work-session.
- [x] Step 2 — identify ChatGPT/Alice hardcodes.
- [x] Step 3 — design automatic provider detection.
- [x] Step 4 — design provider-generic conversation identity and bootstrap.
- [x] Step 5 — design durable channel ownership/lease and multichannel behavior.
- [x] Step 6 — design generic start/turn/composer/delivery lifecycle.
- [x] Step 7 — design storage migration, popup and diagnostics.
- [x] Step 8 — define regression/live acceptance matrix.
- [~] Step 9 — Tier A browser evidence review: FIRST PASS COMPLETE, PROVIDER ACCEPTANCE INCOMPLETE.
  - Qwen: targeted closure required.
  - T3: targeted closure required.
  - Mistral: editor special-case discovery required.
  - Perplexity: authenticated pass required.
  - remaining providers: accessible chat pass required.
- [ ] Step 10A — implement provider-generic core refactor with ChatGPT/Alice only.
- [ ] Step 10B — regression prove ChatGPT/Alice parity.
- [ ] Step 10C — consume second-pass Qwen/T3/Mistral/Perplexity evidence and implement individually.
- [ ] Step 10D — onboard other Tier A providers only after their evidence gates pass.
- [ ] Step 10E — build multi-AI candidate and run full live acceptance matrix.

## 8. Immediate next action

Proceed with Step 10A only: core provider-generic refactor using ChatGPT/Alice as the only enabled providers.

In parallel or afterward, run a second targeted browser-discovery pass for Qwen/T3/Mistral/Perplexity and accessibility/authentication recovery for the remaining Tier A providers.

Do not merge provider-specific onboarding into the core refactor. Keeping these phases separate makes it possible to prove that the architecture refactor did not regress the already accepted ChatGPT/Alice behavior before adding volatile third-party DOM adapters.
